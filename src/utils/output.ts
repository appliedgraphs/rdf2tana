/**
 * Output path management utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

/**
 * Creates a timestamped output directory and returns the path
 */
export function createTimestampedOutputDir(): string {
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
    logger.io('Creating base output directory: %s', baseOutputDir);
    fs.mkdirSync(baseOutputDir, { recursive: true });
  }
  
  // Create timestamped directory
  const outputDir = path.join(baseOutputDir, timestamp);
  logger.io('Creating timestamped output directory: %s', outputDir);
  fs.mkdirSync(outputDir, { recursive: true });
  
  return outputDir;
}

/**
 * Resolves an output file path
 * If path is absolute, returns it as is
 * If path is relative, joins it with the given directory
 */
export function resolveOutputPath(filePath: string, outputDir: string): string {
  if (path.isAbsolute(filePath)) {
    logger.io('Using absolute output path: %s', filePath);
    return filePath;
  }
  
  const resolvedPath = path.join(outputDir, path.basename(filePath));
  logger.io('Resolved relative path %s to %s', filePath, resolvedPath);
  return resolvedPath;
}

/**
 * Logs output file paths for easy access
 */
export function logOutputFiles(outputFiles: string[]): void {
  // Log details to debug
  logger.io('Generated %d output files:', outputFiles.length);
  outputFiles.forEach(file => {
    logger.io('  - %s (%d bytes)', file, fs.statSync(file).size);
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