/**
 * StorefrontContextDirectives.test.ts
 * Tests for the Storefront API context directives.
 */

import { applyContextToQuery } from '../queries/StorefrontQueries';
import { StorefrontContext } from '../types/StorefrontConfig';
import { createDefaultContext } from './utils/testHelpers';

describe('Storefront Context Directives', () => {
  describe('applyContextToQuery', () => {
    test('should apply country context to query', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { country: 'US' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('@inContext(country: US)');
      expect(result).toMatch(/query Products @inContext\(country: US\)/);
    });
    
    test('should apply language context to query', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { language: 'EN' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('@inContext(language: EN)');
      expect(result).toMatch(/query Products @inContext\(language: EN\)/);
    });
    
    test('should apply multiple context parameters', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { 
        country: 'US', 
        language: 'EN'
      };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('country: US');
      expect(result).toContain('language: EN');
      expect(result).toMatch(/query Products @inContext\(country: US, language: EN\)/);
    });
    
    test('should apply buyer identity context', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { 
        buyerIdentity: {
          email: 'test@example.com',
          customerAccessToken: 'token123'
        }
      };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('buyerIdentity: {');
      expect(result).toContain('email: "test@example.com"');
      expect(result).toContain('customerAccessToken: "token123"');
    });
    
    test('should apply partial buyer identity context', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { 
        buyerIdentity: {
          email: 'test@example.com'
        }
      };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('buyerIdentity: {');
      expect(result).toContain('email: "test@example.com"');
      expect(result).not.toContain('customerAccessToken');
    });
    
    test('should apply country and buyer identity context', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { 
        country: 'US',
        buyerIdentity: {
          email: 'test@example.com'
        }
      };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('country: US');
      expect(result).toContain('buyerIdentity: {');
      expect(result).toContain('email: "test@example.com"');
    });
    
    test('should return original query if no context provided', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      
      const result = applyContextToQuery(query);
      
      expect(result).toBe(query);
    });
    
    test('should return original query if empty context provided', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = {};
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toBe(query);
    });
    
    test('should handle queries with existing directives', () => {
      const query = 'query Products @custom(value: true) { products { edges { node { id } } } }';
      const context: StorefrontContext = { country: 'US' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('@custom(value: true)');
      expect(result).toContain('@inContext(country: US)');
    });
    
    test('should handle queries with variables', () => {
      const query = 'query Products($first: Int!) { products(first: $first) { edges { node { id } } } }';
      const context: StorefrontContext = { country: 'US' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('$first: Int!');
      expect(result).toContain('@inContext(country: US)');
    });
    
    test('should handle queries with comments', () => {
      const query = `
        # This is a comment
        query Products {
          # Another comment
          products {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
      const context: StorefrontContext = { country: 'US' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('# This is a comment');
      expect(result).toContain('@inContext(country: US)');
    });
    
    test('should handle complex queries', () => {
      const query = `
        query ProductsAndCollections($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                title
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          collections(first: 5) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      const context: StorefrontContext = { 
        country: 'US', 
        language: 'EN',
        buyerIdentity: {
          email: 'test@example.com'
        }
      };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('query ProductsAndCollections');
      expect(result).toContain('$first: Int!');
      expect(result).toContain('$after: String');
      expect(result).toContain('@inContext(');
      expect(result).toContain('country: US');
      expect(result).toContain('language: EN');
      expect(result).toContain('buyerIdentity: {');
      expect(result).toContain('email: "test@example.com"');
    });
    
    test('should handle anonymous queries', () => {
      const query = '{ products { edges { node { id } } } }';
      const context: StorefrontContext = { country: 'US' };
      
      const result = applyContextToQuery(query, context);
      
      // Should convert to a named query with context
      expect(result).toContain('query AnonymousQuery');
      expect(result).toContain('@inContext(country: US)');
    });
    
    test('should handle mutations', () => {
      const query = 'mutation CheckoutCreate { checkoutCreate { checkout { id } } }';
      const context: StorefrontContext = { country: 'US' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('mutation CheckoutCreate');
      expect(result).toContain('@inContext(country: US)');
    });
  });
});
