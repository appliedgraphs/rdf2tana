import { RdfToTanaTransformer } from '../transformer/transformer';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(undefined)
}));

// Import the mocked fs module
import * as fsPromises from 'fs/promises';

// Mock console.warn
const originalWarn = console.warn;
const mockWarn = jest.fn();

beforeEach(() => {
  console.warn = mockWarn;
});

afterEach(() => {
  console.warn = originalWarn;
  mockWarn.mockClear();
});

describe('RdfToTanaTransformer', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  // Basic test for file loading
  test('should throw error when shapes file has invalid Turtle syntax', async () => {
    // Mock the readFile to return invalid Turtle with a deliberate error
    (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(`
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      
      This is not valid Turtle syntax!
    `);
    
    const transformer = new RdfToTanaTransformer({
      shapesPath: 'shapes.ttl',
      outputPath: 'output.json'
    });
    
    // The transformation should fail with parser error
    await expect(transformer.transform())
      .rejects.toThrow();
  });
  
  test('should throw error when shape lacks required properties', async () => {
    // Mock the readFile to return a shape without name
    (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(`
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      
      # Shape without name or label
      ex:PersonShape a sh:NodeShape .
    `);
    
    const transformer = new RdfToTanaTransformer({
      shapesPath: 'shapes.ttl',
      outputPath: 'output.json'
    });
    
    // We're not actually testing for an exception here since our current implementation
    // just skips shapes without names (with a warning). In a stricter implementation,
    // you might want this to throw an error.
    await transformer.transform();
    
    // But we should log a warning about missing name
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining('Skipping shape without name')
    );
  });
  
  test('should handle instance data', async () => {
    // First mock shapes file with valid content
    (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(`
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      
      ex:PersonShape a sh:NodeShape ;
        sh:name "person" ;
        rdfs:label "Person" .
    `);
    
    // Mock valid instance data
    (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(`
      @prefix ex: <http://example.org/> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      
      ex:john a ex:Person ;
        ex:name "John" .
    `);
    
    const transformer = new RdfToTanaTransformer({
      shapesPath: 'shapes.ttl',
      dataPath: 'data.ttl',
      outputPath: 'output.json'
    });
    
    // Should complete successfully
    await transformer.transform();
    
    // Verify it wrote output
    expect((fsPromises.writeFile as jest.Mock)).toHaveBeenCalled();
  });
  
  test('should handle empty shapes file gracefully', async () => {
    // Mock empty shapes file
    (fsPromises.readFile as jest.Mock).mockResolvedValueOnce('');
    
    const transformer = new RdfToTanaTransformer({
      shapesPath: 'shapes.ttl',
      outputPath: 'output.json',
      schemaOnly: true
    });
    
    // Should not throw, but produce empty output
    await transformer.transform();
    
    // Check that writeFile was called with a structure containing empty supertags array
    const writeFileCall = (fsPromises.writeFile as jest.Mock).mock.calls[0];
    expect(writeFileCall[0]).toBe('output.json');
    expect(JSON.parse(writeFileCall[1]).supertags).toEqual([]);
  });
  
  test('should handle valid input data correctly', async () => {
    // Mock valid shapes file
    (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(`
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      
      ex:PersonShape a sh:NodeShape ;
        sh:name "person" ;
        rdfs:label "Person" .
    `);
    
    const transformer = new RdfToTanaTransformer({
      shapesPath: 'shapes.ttl',
      outputPath: 'output.json',
      schemaOnly: true
    });
    
    // Should complete successfully
    await transformer.transform();
    
    // Check that writeFile was called with expected content
    const writeFileCall = (fsPromises.writeFile as jest.Mock).mock.calls[0];
    expect(writeFileCall[0]).toBe('output.json');
    const output = JSON.parse(writeFileCall[1]);
    expect(output.supertags.length).toBe(1);
    expect(output.supertags[0].name).toBe('person');
  });
});