/**
 * SchemaBuilder - Transforms SHACL shapes into Tana supertags
 */

import { Store, Quad } from 'n3';
import { TanaIntermediateSupertag, NAMESPACES } from './types';
import { generateUid, createNamedNode } from './utils';
import { logger } from '../utils/logger';

export class SchemaBuilder {
  /**
   * Build Tana supertags from SHACL shapes
   */
  buildSchema(shapesGraph: Store): TanaIntermediateSupertag[] {
    logger.schema('Building schema from SHACL shapes');
    const supertags: TanaIntermediateSupertag[] = [];
    
    // Find all shapes (nodes with a rdf:type of sh:NodeShape)
    logger.schema('Finding NodeShape instances');
    const shapes = shapesGraph.getQuads(
      null,
      createNamedNode(NAMESPACES.rdf + 'type'),
      createNamedNode(NAMESPACES.sh + 'NodeShape'),
      null
    );
    logger.schema('Found %d NodeShape instances', shapes.length);
    
    for (const shapeQuad of shapes) {
      const shapeNode = shapeQuad.subject;
      logger.schema('Processing shape: %s', shapeNode.value);
      
      // Get the sh:name property for the supertag name
      let name = this.getStringProperty(shapesGraph, shapeNode, createNamedNode(NAMESPACES.sh + 'name'));
      
      // Fallback to rdfs:label if sh:name is not present
      if (!name) {
        logger.schema('No sh:name found, looking for rdfs:label');
        name = this.getStringProperty(shapesGraph, shapeNode, createNamedNode(NAMESPACES.rdfs + 'label'));
      }
      
      // Skip if we couldn't find a name
      if (!name) {
        logger.schema('No name found for shape: %s', shapeNode.value);
        console.warn(`Skipping shape without name: ${shapeNode.value}`);
        continue;
      }
      
      // Create the supertag
      const uid = generateUid(shapeNode.value);
      logger.schema('Creating supertag: %s with UID: %s', name, uid);
      
      const supertag: TanaIntermediateSupertag = {
        uid,
        name
      };
      
      supertags.push(supertag);
    }
    
    logger.schema('Built %d supertags total', supertags.length);
    return supertags;
  }
  
  /**
   * Get a string property value from a node
   */
  private getStringProperty(
    graph: Store, 
    subject: any, 
    predicate: any
  ): string | null {
    const quads = graph.getQuads(
      subject, 
      predicate, 
      null, 
      null
    );
    
    if (quads.length === 0) {
      return null;
    }
    
    return quads[0].object.value;
  }
}