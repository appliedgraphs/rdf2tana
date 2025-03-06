/**
 * Utility functions for the transformer
 */

import { createHash } from 'crypto';
import { NamedNode } from 'n3';
import { logger } from '../utils/logger';

/**
 * Create a named node with the given URI
 */
export function createNamedNode(uri: string): NamedNode {
  logger.utils('Creating named node: %s', uri);
  return new NamedNode(uri);
}

/**
 * Generate a Tana-compatible UID from a string
 * Tana UIDs need to be alphanumeric with _ and -
 */
export function generateUid(input: string): string {
  // Create a hash of the input
  const hash = createHash('md5').update(input).digest('hex');
  
  // Take a prefix (tana_) and a portion of the hash
  const uid = ('tana_' + hash.substring(0, 10))
    // Ensure it's valid for Tana (alphanumeric and _-)
    .replace(/[^A-Za-z0-9_-]/g, '_');
  
  logger.utils('Generated UID: %s (from: %s)', uid, input);
  return uid;
}

/**
 * Extract a short name from a URI
 */
export function getLocalName(uri: string): string {
  // Get the part after the last / or #
  const match = uri.match(/[/#]([^/#]+)$/);
  const localName = match ? match[1] : uri;
  
  logger.utils('Extracted local name: %s (from: %s)', localName, uri);
  return localName;
}