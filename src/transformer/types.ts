/**
 * Type definitions for our RDF to Tana transformer
 * Imports and re-exports the official Tana types from the submodule
 */

// Import types from our local copy of Tana types
export type {
  TanaIntermediateFile,
  TanaIntermediateSummary,
  TanaIntermediateSupertag,
  TanaIntermediateNode,
  NodeType
} from '../vendor/tana-types/types';

// Using N3 directly instead of RDF.js to avoid ESM module issues

/**
 * Configuration for the transformer
 */
export interface TransformerConfig {
  // Graph sources
  shapesPath: string;
  dataPath?: string;
  outputPath: string;
  
  // Transformation options
  schemaOnly?: boolean;
  verbose?: boolean;
}

/**
 * Common namespaces used in RDF/SHACL processing
 */
export const NAMESPACES = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  sh: 'http://www.w3.org/ns/shacl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  schema: 'http://schema.org/'
};