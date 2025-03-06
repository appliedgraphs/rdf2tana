"use strict";
/**
 * Utility functions for the transformer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNamedNode = createNamedNode;
exports.generateUid = generateUid;
exports.getLocalName = getLocalName;
const crypto_1 = require("crypto");
const n3_1 = require("n3");
const logger_1 = require("../utils/logger");
/**
 * Create a named node with the given URI
 */
function createNamedNode(uri) {
    logger_1.logger.utils('Creating named node: %s', uri);
    return new n3_1.NamedNode(uri);
}
/**
 * Generate a Tana-compatible UID from a string
 * Tana UIDs need to be alphanumeric with _ and -
 */
function generateUid(input) {
    // Create a hash of the input
    const hash = (0, crypto_1.createHash)('md5').update(input).digest('hex');
    // Take a prefix (tana_) and a portion of the hash
    const uid = ('tana_' + hash.substring(0, 10))
        // Ensure it's valid for Tana (alphanumeric and _-)
        .replace(/[^A-Za-z0-9_-]/g, '_');
    logger_1.logger.utils('Generated UID: %s (from: %s)', uid, input);
    return uid;
}
/**
 * Extract a short name from a URI
 */
function getLocalName(uri) {
    // Get the part after the last / or #
    const match = uri.match(/[/#]([^/#]+)$/);
    const localName = match ? match[1] : uri;
    logger_1.logger.utils('Extracted local name: %s (from: %s)', localName, uri);
    return localName;
}
