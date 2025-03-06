"use strict";
/**
 * Output path management utilities
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
exports.createTimestampedOutputDir = createTimestampedOutputDir;
exports.resolveOutputPath = resolveOutputPath;
exports.logOutputFiles = logOutputFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("./logger");
/**
 * Creates a timestamped output directory and returns the path
 */
function createTimestampedOutputDir() {
    // Create timestamp in format YYYY-MM-DD_HHMMSS
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/T/, '_')
        .replace(/\..+/, '')
        .replace(/:/g, '')
        .replace(/-/g, '-');
    // Create output directory if it doesn't exist
    const baseOutputDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(baseOutputDir)) {
        logger_1.logger.io('Creating base output directory: %s', baseOutputDir);
        fs.mkdirSync(baseOutputDir, { recursive: true });
    }
    // Create timestamped directory
    const outputDir = path.join(baseOutputDir, timestamp);
    logger_1.logger.io('Creating timestamped output directory: %s', outputDir);
    fs.mkdirSync(outputDir, { recursive: true });
    return outputDir;
}
/**
 * Resolves an output file path
 * If path is absolute, returns it as is
 * If path is relative, joins it with the given directory
 */
function resolveOutputPath(filePath, outputDir) {
    if (path.isAbsolute(filePath)) {
        logger_1.logger.io('Using absolute output path: %s', filePath);
        return filePath;
    }
    const resolvedPath = path.join(outputDir, path.basename(filePath));
    logger_1.logger.io('Resolved relative path %s to %s', filePath, resolvedPath);
    return resolvedPath;
}
/**
 * Logs output file paths for easy access
 */
function logOutputFiles(outputFiles) {
    // Log details to debug
    logger_1.logger.io('Generated %d output files:', outputFiles.length);
    outputFiles.forEach(file => {
        logger_1.logger.io('  - %s (%d bytes)', file, fs.statSync(file).size);
    });
    // Always show user-friendly output on console regardless of debug settings
    console.log('\nOutput files:');
    outputFiles.forEach(file => {
        console.log(`  - ${file}`);
    });
    console.log('\nView commands:');
    outputFiles.forEach(file => {
        console.log(`  cat ${file}`);
    });
    // If there's at least one file, also show command to open the directory
    if (outputFiles.length > 0) {
        const dirPath = path.dirname(outputFiles[0]);
        console.log(`  open ${dirPath}  # Open in Finder/File Explorer`);
    }
}
