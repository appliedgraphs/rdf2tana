/**
 * RDF to Tana Transformer
 * 
 * This is the main entry point for the CLI.
 */

import * as fs from 'fs';
import { parseArgs } from "./utils/cli";
import { RdfToTanaTransformer } from "./transformer/transformer";

async function main() {
  try {
    // Parse command line arguments
    const config = parseArgs(process.argv.slice(2));
    
    console.log("Starting RDF to Tana transformation...");
    console.log(`SHACL shapes: ${config.shapesPath}`);
    console.log(`RDF data: ${config.dataPath || 'None (schema-only mode)'}`);
    console.log(`Output: ${config.outputPath}`);
    
    // Simple validation to check if files exist
    if (!fs.existsSync(config.shapesPath)) {
      throw new Error(`Shapes file not found: ${config.shapesPath}`);
    }
    
    if (config.dataPath && !fs.existsSync(config.dataPath)) {
      throw new Error(`Data file not found: ${config.dataPath}`);
    }
    
    // Create transformer and run transformation
    const transformer = new RdfToTanaTransformer(config);
    await transformer.transform();
  } catch (error: any) {
    console.error("Error:", error.message || String(error));
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}