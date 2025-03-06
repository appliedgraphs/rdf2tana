"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("../utils/cli");
describe('CLI argument parsing', () => {
    // Test case: Required shape parameter
    test('should throw error when shapes parameter is missing', () => {
        expect(() => {
            (0, cli_1.parseArgs)([]);
        }).toThrow('Missing required argument: --shapes');
    });
    // Test case: Required data parameter (unless schema-only)
    test('should throw error when data parameter is missing and not schema-only', () => {
        expect(() => {
            (0, cli_1.parseArgs)(['--shapes', 'shapes.ttl']);
        }).toThrow('Missing required argument: --data');
    });
    // Test case: Schema-only mode doesn't require data
    test('should not throw error with shapes parameter and schema-only', () => {
        expect(() => {
            (0, cli_1.parseArgs)(['--shapes', 'shapes.ttl', '--schema-only']);
        }).not.toThrow();
    });
    // Test case: Basic parameter parsing
    test('should correctly parse all parameters', () => {
        const args = [
            '--shapes', 'shapes.ttl',
            '--data', 'data.ttl',
            '--output', 'output.json',
            '--verbose'
        ];
        const config = (0, cli_1.parseArgs)(args);
        expect(config.shapesPath).toBe('shapes.ttl');
        expect(config.dataPath).toBe('data.ttl');
        expect(config.outputPath).toBe('output.json');
        expect(config.verbose).toBe(true);
    });
    // Test case: Default values
    test('should use default output path when not specified', () => {
        const config = (0, cli_1.parseArgs)(['--shapes', 'shapes.ttl', '--data', 'data.ttl']);
        expect(config.outputPath).toBe('tana-import.json');
    });
});
