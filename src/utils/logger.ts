/**
 * Logger utilities using the debug library
 * 
 * Usage:
 * - Set DEBUG=tana:* to see all debug messages
 * - Set DEBUG=tana:schema to see only schema-related messages
 * - Set DEBUG=tana:instance to see only instance-related messages
 * - etc.
 */

import debug from 'debug';

// Base namespace for all loggers
const BASE_NAMESPACE = 'tana';

// Create debuggers for different components
export const logger = {
  // Core components
  core: debug(`${BASE_NAMESPACE}:core`),
  schema: debug(`${BASE_NAMESPACE}:schema`),
  instance: debug(`${BASE_NAMESPACE}:instance`),
  
  // Utilities
  io: debug(`${BASE_NAMESPACE}:io`),
  parser: debug(`${BASE_NAMESPACE}:parser`),
  utils: debug(`${BASE_NAMESPACE}:utils`),
  
  // Operations
  transform: debug(`${BASE_NAMESPACE}:transform`),
  query: debug(`${BASE_NAMESPACE}:query`),
  
  // Performance tracking
  perf: debug(`${BASE_NAMESPACE}:perf`),
};

/**
 * Sets up performance logging for a function
 * Logs the time taken to execute the function
 */
export function logPerformance<T>(name: string, fn: () => T): T {
  const start = Date.now();
  try {
    return fn();
  } finally {
    const duration = Date.now() - start;
    logger.perf('%s: %dms', name, duration);
  }
}

/**
 * Async version of logPerformance
 */
export async function logPerformanceAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = Date.now() - start;
    logger.perf('%s: %dms', name, duration);
  }
}

// Helper to print pretty formatted objects
export function formatObject(obj: any): string {
  return JSON.stringify(obj, null, 2);
}