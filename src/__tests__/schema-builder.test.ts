import { SchemaBuilder } from '../transformer/schema-builder';
import { Store, Parser } from 'n3';

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

describe('SchemaBuilder', () => {
  // Helper to parse Turtle into a Store
  const parseToStore = async (turtle: string): Promise<Store> => {
    const store = new Store();
    const parser = new Parser({ format: 'text/turtle' });
    
    return new Promise<Store>((resolve, reject) => {
      parser.parse(turtle, (error, quad, prefixes) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (quad) {
          store.add(quad);
        } else {
          // End of stream
          resolve(store);
        }
      });
    });
  };
  
  test('should extract supertags from shapes with sh:name', async () => {
    const turtle = `
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      
      ex:PersonShape a sh:NodeShape ;
        sh:name "person" .
        
      ex:OrganizationShape a sh:NodeShape ;
        sh:name "organization" .
    `;
    
    const store = await parseToStore(turtle);
    const schemaBuilder = new SchemaBuilder();
    const supertags = schemaBuilder.buildSchema(store);
    
    // Should extract two supertags
    expect(supertags).toHaveLength(2);
    
    // Check supertag names
    const names = supertags.map(tag => tag.name);
    expect(names).toContain('person');
    expect(names).toContain('organization');
    
    // Each supertag should have a uid
    supertags.forEach(tag => {
      expect(tag.uid).toBeDefined();
      expect(tag.uid.length).toBeGreaterThan(0);
    });
  });
  
  test('should extract supertags from shapes with rdfs:label when sh:name is missing', async () => {
    const turtle = `
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      
      ex:PersonShape a sh:NodeShape ;
        rdfs:label "Person" .
    `;
    
    const store = await parseToStore(turtle);
    const schemaBuilder = new SchemaBuilder();
    const supertags = schemaBuilder.buildSchema(store);
    
    // Should extract one supertag
    expect(supertags).toHaveLength(1);
    expect(supertags[0].name).toBe('Person');
  });
  
  test('should skip shapes without names', async () => {
    const turtle = `
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      
      # Shape without name or label
      ex:PersonShape a sh:NodeShape .
    `;
    
    const store = await parseToStore(turtle);
    const schemaBuilder = new SchemaBuilder();
    
    const supertags = schemaBuilder.buildSchema(store);
    
    // Should not extract any supertags
    expect(supertags).toHaveLength(0);
    
    // Should warn about missing name
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining('Skipping shape without name')
    );
  });
  
  test('should generate consistent UIDs for the same shape', async () => {
    const turtle = `
      @prefix ex: <http://example.org/> .
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      
      ex:PersonShape a sh:NodeShape ;
        sh:name "person" .
    `;
    
    const store = await parseToStore(turtle);
    const schemaBuilder1 = new SchemaBuilder();
    const schemaBuilder2 = new SchemaBuilder();
    
    const supertags1 = schemaBuilder1.buildSchema(store);
    const supertags2 = schemaBuilder2.buildSchema(store);
    
    // UIDs should be consistent for the same input
    expect(supertags1[0].uid).toBe(supertags2[0].uid);
  });
});