"use strict";
/**
 * RDF to Tana Transformer
 *
 * This is the main entry point for the CLI.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const cli_1 = require("./utils/cli");
const transformer_1 = require("./transformer/transformer");
async function main() {
    try {
        // Parse command line arguments
        const config = (0, cli_1.parseArgs)(process.argv.slice(2));
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
        const transformer = new transformer_1.RdfToTanaTransformer(config);
        await transformer.transform();
    }
    catch (error) {
        console.error("Error:", error.message || String(error));
        process.exit(1);
    }
}
// Run the main function if this file is executed directly
if (require.main === module) {
    main();
}
