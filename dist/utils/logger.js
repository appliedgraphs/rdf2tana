"use strict";
/**
 * Logger utilities using the debug library
 *
 * Usage:
 * - Set DEBUG=tana:* to see all debug messages
 * - Set DEBUG=tana:schema to see only schema-related messages
 * - Set DEBUG=tana:instance to see only instance-related messages
 * - etc.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logPerformance = logPerformance;
exports.logPerformanceAsync = logPerformanceAsync;
exports.formatObject = formatObject;
const debug_1 = __importDefault(require("debug"));
// Base namespace for all loggers
const BASE_NAMESPACE = 'tana';
// Create debuggers for different components
exports.logger = {
    // Core components
    core: (0, debug_1.default)(`${BASE_NAMESPACE}:core`),
    schema: (0, debug_1.default)(`${BASE_NAMESPACE}:schema`),
    instance: (0, debug_1.default)(`${BASE_NAMESPACE}:instance`),
    // Utilities
    io: (0, debug_1.default)(`${BASE_NAMESPACE}:io`),
    parser: (0, debug_1.default)(`${BASE_NAMESPACE}:parser`),
    utils: (0, debug_1.default)(`${BASE_NAMESPACE}:utils`),
    // Operations
    transform: (0, debug_1.default)(`${BASE_NAMESPACE}:transform`),
    query: (0, debug_1.default)(`${BASE_NAMESPACE}:query`),
    // Performance tracking
    perf: (0, debug_1.default)(`${BASE_NAMESPACE}:perf`),
};
/**
 * Sets up performance logging for a function
 * Logs the time taken to execute the function
 */
function logPerformance(name, fn) {
    const start = Date.now();
    try {
        return fn();
    }
    finally {
        const duration = Date.now() - start;
        exports.logger.perf('%s: %dms', name, duration);
    }
}
/**
 * Async version of logPerformance
 */
async function logPerformanceAsync(name, fn) {
    const start = Date.now();
    try {
        return await fn();
    }
    finally {
        const duration = Date.now() - start;
        exports.logger.perf('%s: %dms', name, duration);
    }
}
// Helper to print pretty formatted objects
function formatObject(obj) {
    return JSON.stringify(obj, null, 2);
}
