import { generateUid, getLocalName } from '../transformer/utils';

describe('Utility functions', () => {
  describe('generateUid', () => {
    test('should generate consistent UIDs for the same input', () => {
      const input = 'http://example.org/PersonShape';
      const uid1 = generateUid(input);
      const uid2 = generateUid(input);
      
      expect(uid1).toBe(uid2);
    });
    
    test('should generate different UIDs for different inputs', () => {
      const uid1 = generateUid('http://example.org/PersonShape');
      const uid2 = generateUid('http://example.org/OrganizationShape');
      
      expect(uid1).not.toBe(uid2);
    });
    
    test('should create valid UIDs for Tana', () => {
      const uid = generateUid('http://example.org/PersonShape');
      
      // Should start with 'tana_'
      expect(uid).toMatch(/^tana_/);
      
      // Should only contain alphanumeric, underscore, or dash
      expect(uid).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });
  
  describe('getLocalName', () => {
    test('should extract local name from URL with slash', () => {
      expect(getLocalName('http://example.org/Person')).toBe('Person');
    });
    
    test('should extract local name from URL with hash', () => {
      expect(getLocalName('http://example.org#Person')).toBe('Person');
    });
    
    test('should handle URLs with both hash and slash', () => {
      expect(getLocalName('http://example.org/ontology#Person')).toBe('Person');
    });
    
    test('should return original string if no slash or hash', () => {
      expect(getLocalName('Person')).toBe('Person');
    });
  });
});