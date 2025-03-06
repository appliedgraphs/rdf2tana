/**
 * Command-line interface utilities
 */

/**
 * Import TransformerConfig from transformer types to ensure consistency
 */
import { TransformerConfig } from '../transformer/types';

/**
 * Parse command-line arguments into a configuration object
 */
export function parseArgs(args: string[]): TransformerConfig {
  const config: TransformerConfig = {
    shapesPath: "",
    outputPath: "tana-import.json"
  };
  
  // Check if help is requested
  if (args.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case "--shapes":
        if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
          config.shapesPath = args[++i];
        }
        break;
      case "--data":
        if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
          config.dataPath = args[++i];
        }
        break;
      case "--output":
        if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
          config.outputPath = args[++i];
        }
        break;
      case "--schema-only":
        config.schemaOnly = true;
        break;
      case "--verbose":
        config.verbose = true;
        break;
    }
  }
  
  // Validate required arguments
  if (!config.shapesPath) {
    throw new Error("Missing required argument: --shapes");
  }
  
  if (!config.schemaOnly && !config.dataPath) {
    throw new Error("Missing required argument: --data (required unless --schema-only is used)");
  }
  
  return config;
}

/**
 * Print help information
 */
function printHelp(): void {
  console.log(`
RDF to Tana Transformer
-----------------------

Transform RDF data guided by SHACL shapes into Tana's format.

Options:
  --shapes <path>       Path to SHACL shapes file (required)
  --data <path>         Path to RDF data file
  --output <path>       Output file path (default: tana-import.json)
  --schema-only         Generate schema without instance data
  --verbose             Enable verbose logging
  --help                Show this help message
  
Examples:
  # Transform RDF data using SHACL shapes
  node dist/index.js --shapes shapes.ttl --data data.ttl --output tana-import.json
  
  # Generate schema only
  node dist/index.js --shapes shapes.ttl --schema-only --output tana-schema.json
  `);
}