/**
 * Mock for RDF.js types
 * 
 * WHY THIS MOCK EXISTS:
 * 
 * 1. Jest Testing Issue: The actual rdf-js package uses ECMAScript modules (ESM)
 *    with 'export' statements, but our Jest setup runs in CommonJS mode, causing
 *    "Unexpected token 'export'" errors during tests.
 * 
 * 2. Solution Approach: Instead of complex Jest configuration for ESM compatibility,
 *    we created this mock that provides just enough of the interfaces to make our
 *    tests work.
 * 
 * 3. Implementation: This file contains simplified versions of the core RDF.js 
 *    interfaces that our code depends on. It satisfies TypeScript's type checking
 *    without needing the actual implementation.
 * 
 * 4. Usage: In jest.config.js, we map 'rdf-js' imports to this file using:
 *    moduleNameMapper: {
 *      '^rdf-js$': '<rootDir>/src/__mocks__/rdf-js.ts',
 *    }$': '<rootDir>/src/__mocks__/rdf-js.ts',
 *    }
 * 
 * Note: In production, the real rdf-js package is used. This mock is only for tests.
 */

// Basic RDF.js Term interface
export interface Term {
  readonly termType: string;
  readonly value: string;
  equals(other: Term): boolean;
}

// Interfaces for different term types
export interface NamedNode extends Term {
  readonly termType: 'NamedNode';
}

export interface BlankNode extends Term {
  readonly termType: 'BlankNode';
}

export interface Literal extends Term {
  readonly termType: 'Literal';
  readonly language: string;
  readonly datatype: NamedNode;
}

// Quad/Triple interface
export interface Quad {
  readonly subject: Term;
  readonly predicate: Term;
  readonly object: Term;
  readonly graph: Term;
}

// This will make TypeScript happy while not actually importing rdf-js
export default {};