/**
 * Main Transformer class that orchestrates the RDF to Tana conversion
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Parser, Store } from 'n3';
import { TransformerConfig, TanaIntermediateFile } from './types';
import { SchemaBuilder } from './schema-builder';
import { InstanceBuilder } from './instance-builder';
import { createTimestampedOutputDir, resolveOutputPath, logOutputFiles } from '../utils/output';
import { logger, logPerformanceAsync } from '../utils/logger';

export class RdfToTanaTransformer {
  private config: TransformerConfig;
  private shapesGraph: Store;
  private dataGraph: Store | null = null;
  private schemaBuilder: SchemaBuilder;
  private instanceBuilder: InstanceBuilder;
  
  constructor(config: TransformerConfig) {
    this.config = config;
    this.shapesGraph = new Store();
    this.schemaBuilder = new SchemaBuilder();
    this.instanceBuilder = new InstanceBuilder();
  }
  
  /**
   * Load RDF files into N3 Stores
   */
  async loadGraphs(): Promise<void> {
    logger.io('Loading shapes file: %s', this.config.shapesPath);
    const shapesData = await fs.readFile(this.config.shapesPath, 'utf-8');
    
    await logPerformanceAsync('Parse shapes file', async () => {
      await this.parseTriples(shapesData, this.shapesGraph);
      logger.parser('Parsed %d triples from shapes file', this.shapesGraph.size);
    });
    
    if (this.config.dataPath) {
      logger.io('Loading data file: %s', this.config.dataPath);
      const dataData = await fs.readFile(this.config.dataPath, 'utf-8');
      this.dataGraph = new Store();
      
      await logPerformanceAsync('Parse data file', async () => {
        if (this.dataGraph) {
          await this.parseTriples(dataData, this.dataGraph);
          logger.parser('Parsed %d triples from data file', this.dataGraph.size);
        }
      });
    } else {
      logger.io('No data file specified, operating in schema-only mode');
    }
    
    // Always log basic info to console (important status updates regardless of debug setting)
    console.log(`\nLoaded ${this.shapesGraph.size} triples from shapes file`);
    if (this.dataGraph) {
      console.log(`Loaded ${this.dataGraph.size} triples from data file`);
    }
  }
  
  /**
   * Parse RDF triples from string content
   */
  private async parseTriples(content: string, store: Store): Promise<void> {
    return new Promise((resolve, reject) => {
      const parser = new Parser({ format: 'text/turtle' });
      let quadCount = 0;
      
      parser.parse(content, (error, quad, prefixes) => {
        if (error) {
          logger.parser('Parse error: %s', error.message);
          reject(error);
          return;
        }
        
        if (quad) {
          store.add(quad);
          quadCount++;
          
          // Log every 1000 quads for large files
          if (quadCount % 1000 === 0) {
            logger.parser('Parsed %d quads so far...', quadCount);
          }
        } else {
          // End of stream, log prefixes found if any
          if (prefixes && Object.keys(prefixes).length > 0) {
            logger.parser('Found prefixes: %o', prefixes);
          }
          
          logger.parser('Parse complete, added %d quads to store', quadCount);
          resolve();
        }
      });
    });
  }
  
  /**
   * Main transformation method
   */
  async transform(): Promise<void> {
    const outputFiles: string[] = [];
    
    try {
      logger.transform('Starting transformation');
      logger.transform('Config: %o', {
        shapesPath: this.config.shapesPath,
        dataPath: this.config.dataPath,
        outputPath: this.config.outputPath,
        schemaOnly: this.config.schemaOnly,
        verbose: this.config.verbose
      });
      
      // Load the input files
      await logPerformanceAsync('Load graphs', async () => {
        await this.loadGraphs();
      });
      
      // Create timestamped output directory
      logger.io('Creating output directory');
      const outputDir = createTimestampedOutputDir();
      const outputPath = resolveOutputPath(this.config.outputPath, outputDir);
      logger.io('Output path: %s', outputPath);
      
      // Create Tana output structure
      const tanaOutput: TanaIntermediateFile = {
        version: 'TanaIntermediateFile V0.1',
        summary: {
          leafNodes: 0,
          topLevelNodes: 0,
          totalNodes: 0,
          calendarNodes: 0,
          fields: 0,
          brokenRefs: 0
        },
        nodes: [],
        supertags: []
      };
      
      // Ensure supertags array is initialized
      if (!tanaOutput.supertags) {
        tanaOutput.supertags = [];
      }
      
      // Phase 1: Build schema (supertags)
      logger.transform('Building schema (supertags)');
      await logPerformanceAsync('Build schema', async () => {
        const supertags = this.schemaBuilder.buildSchema(this.shapesGraph);
        tanaOutput.supertags = supertags;
      });
      logger.schema('Generated %d supertags', tanaOutput.supertags.length);
      
      // Phase 2: Build instance data (if not in schema-only mode)
      if (!this.config.schemaOnly && this.dataGraph) {
        logger.transform('Building instance data');
        await logPerformanceAsync('Build instances', async () => {
          tanaOutput.nodes = this.instanceBuilder.buildInstances(
            this.dataGraph!, 
            this.shapesGraph
          );
        });
        logger.instance('Generated %d nodes', tanaOutput.nodes.length);
        
        // Update summary
        tanaOutput.summary.totalNodes = tanaOutput.nodes.length;
        tanaOutput.summary.topLevelNodes = tanaOutput.nodes.length;
        // Other summary fields would need more detailed analysis
      }
      
      // Write output files
      logger.io('Writing output files');
      
      // Write main output file
      await logPerformanceAsync('Write main output', async () => {
        await fs.writeFile(
          outputPath, 
          JSON.stringify(tanaOutput, null, 2)
        );
      });
      logger.io('Wrote main output to %s', outputPath);
      outputFiles.push(outputPath);
      
      // Write separate schema file if we have instance data
      if (!this.config.schemaOnly && this.dataGraph) {
        const schemaOutput = {
          version: tanaOutput.version,
          summary: { ...tanaOutput.summary, totalNodes: 0, topLevelNodes: 0 },
          nodes: [],
          supertags: tanaOutput.supertags
        };
        
        const schemaPath = path.join(
          path.dirname(outputPath),
          'schema-' + path.basename(outputPath)
        );
        
        await fs.writeFile(
          schemaPath,
          JSON.stringify(schemaOutput, null, 2)
        );
        logger.io('Wrote schema-only output to %s', schemaPath);
        outputFiles.push(schemaPath);
      }
      
      // Write summary file with info about the transformation
      const summaryPath = path.join(
        path.dirname(outputPath),
        'summary.json'
      );
      
      const transformationSummary = {
        timestamp: new Date().toISOString(),
        inputs: {
          shapesPath: this.config.shapesPath,
          dataPath: this.config.dataPath || null,
          shapesTriples: this.shapesGraph.size,
          dataTriples: this.dataGraph ? this.dataGraph.size : 0
        },
        outputs: {
          mainOutput: outputPath,
          supertags: tanaOutput.supertags.length,
          nodes: tanaOutput.nodes.length
        }
      };
      
      await fs.writeFile(
        summaryPath,
        JSON.stringify(transformationSummary, null, 2)
      );
      logger.io('Wrote summary to %s', summaryPath);
      outputFiles.push(summaryPath);
      
      // Always log basic completion info (important status updates regardless of debug setting)
      console.log(`\nTransformation complete!`);
      console.log(`Generated ${tanaOutput.supertags.length} supertags and ${tanaOutput.nodes.length} nodes`);
      
      // Log output files for easy access
      logOutputFiles(outputFiles);
      
      logger.transform('Transformation completed successfully');
    } catch (error: any) {
      logger.transform('Transformation failed: %s', error.message);
      console.error('Error during transformation:', error);
      throw error;
    }
  }
}