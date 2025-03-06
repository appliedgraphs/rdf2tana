"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../transformer/utils");
describe('Utility functions', () => {
    describe('generateUid', () => {
        test('should generate consistent UIDs for the same input', () => {
            const input = 'http://example.org/PersonShape';
            const uid1 = (0, utils_1.generateUid)(input);
            const uid2 = (0, utils_1.generateUid)(input);
            expect(uid1).toBe(uid2);
        });
        test('should generate different UIDs for different inputs', () => {
            const uid1 = (0, utils_1.generateUid)('http://example.org/PersonShape');
            const uid2 = (0, utils_1.generateUid)('http://example.org/OrganizationShape');
            expect(uid1).not.toBe(uid2);
        });
        test('should create valid UIDs for Tana', () => {
            const uid = (0, utils_1.generateUid)('http://example.org/PersonShape');
            // Should start with 'tana_'
            expect(uid).toMatch(/^tana_/);
            // Should only contain alphanumeric, underscore, or dash
            expect(uid).toMatch(/^[a-zA-Z0-9_-]+$/);
        });
    });
    describe('getLocalName', () => {
        test('should extract local name from URL with slash', () => {
            expect((0, utils_1.getLocalName)('http://example.org/Person')).toBe('Person');
        });
        test('should extract local name from URL with hash', () => {
            expect((0, utils_1.getLocalName)('http://example.org#Person')).toBe('Person');
        });
        test('should handle URLs with both hash and slash', () => {
            expect((0, utils_1.getLocalName)('http://example.org/ontology#Person')).toBe('Person');
        });
        test('should return original string if no slash or hash', () => {
            expect((0, utils_1.getLocalName)('Person')).toBe('Person');
        });
    });
});
