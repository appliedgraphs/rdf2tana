"use strict";
/**
 * SchemaBuilder - Transforms SHACL shapes into Tana supertags
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaBuilder = void 0;
const types_1 = require("./types");
const utils_1 = require("./utils");
const logger_1 = require("../utils/logger");
class SchemaBuilder {
    /**
     * Build Tana supertags from SHACL shapes
     */
    buildSchema(shapesGraph) {
        logger_1.logger.schema('Building schema from SHACL shapes');
        const supertags = [];
        // Find all shapes (nodes with a rdf:type of sh:NodeShape)
        logger_1.logger.schema('Finding NodeShape instances');
        const shapes = shapesGraph.getQuads(null, (0, utils_1.createNamedNode)(types_1.NAMESPACES.rdf + 'type'), (0, utils_1.createNamedNode)(types_1.NAMESPACES.sh + 'NodeShape'), null);
        logger_1.logger.schema('Found %d NodeShape instances', shapes.length);
        for (const shapeQuad of shapes) {
            const shapeNode = shapeQuad.subject;
            logger_1.logger.schema('Processing shape: %s', shapeNode.value);
            // Get the sh:name property for the supertag name
            let name = this.getStringProperty(shapesGraph, shapeNode, (0, utils_1.createNamedNode)(types_1.NAMESPACES.sh + 'name'));
            // Fallback to rdfs:label if sh:name is not present
            if (!name) {
                logger_1.logger.schema('No sh:name found, looking for rdfs:label');
                name = this.getStringProperty(shapesGraph, shapeNode, (0, utils_1.createNamedNode)(types_1.NAMESPACES.rdfs + 'label'));
            }
            // Skip if we couldn't find a name
            if (!name) {
                logger_1.logger.schema('No name found for shape: %s', shapeNode.value);
                console.warn(`Skipping shape without name: ${shapeNode.value}`);
                continue;
            }
            // Create the supertag
            const uid = (0, utils_1.generateUid)(shapeNode.value);
            logger_1.logger.schema('Creating supertag: %s with UID: %s', name, uid);
            const supertag = {
                uid,
                name
            };
            supertags.push(supertag);
        }
        logger_1.logger.schema('Built %d supertags total', supertags.length);
        return supertags;
    }
    /**
     * Get a string property value from a node
     */
    getStringProperty(graph, subject, predicate) {
        const quads = graph.getQuads(subject, predicate, null, null);
        if (quads.length === 0) {
            return null;
        }
        return quads[0].object.value;
    }
}
exports.SchemaBuilder = SchemaBuilder;
