# Storefront API Integration Testing Guide

This document provides testing guidelines for the Shopify Storefront API integration to ensure our dashboard correctly interacts with the API and handles various scenarios appropriately.

## Testing Objectives

1. Verify that the StorefrontApiClient correctly authenticates with the Shopify Storefront API
2. Ensure GraphQL queries are properly constructed and executed
3. Validate that data transformers correctly convert API responses to the expected format
4. Test error handling for various error scenarios
5. Verify context-aware queries work correctly
6. Ensure the dashboard UI correctly displays data from the Storefront API

## Test Environment Setup

### 1. Test Store Setup

1. Create a development Shopify store for testing
2. Add test products, collections, pages, blogs, and metaobjects
3. Generate a Storefront API access token with appropriate scopes

### 2. Environment Configuration

Create a `.env.test` file with test credentials:

```
SHOPIFY_STORE_DOMAIN=your-test-store.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=your-test-token
SHOPIFY_STOREFRONT_API_VERSION=2025-04
```

### 3. Mock Server Setup

Set up a mock server to simulate Storefront API responses for unit tests using MSW (Mock Service Worker) or similar tools.

## Unit Tests

### 1. StorefrontApiClient Tests

- Test initialization with config options
- Test error handling for missing required options
- Test successful GraphQL query execution
- Test context directive application
- Test handling of GraphQL errors
- Test handling of network errors
- Test handling of 430 security rejections

### 2. Data Transformer Tests

- Test transformation of products data to tree nodes
- Test handling of empty data
- Test transformation of products data to raw JSON/YAML
- Test handling of nested resources (variants, images)

### 3. GraphQL Query Tests

- Test applying country context to query
- Test applying language context to query
- Test applying multiple context parameters
- Test applying buyer identity context
- Test handling queries without context

## Integration Tests

### 1. Dashboard Integration Tests

- Test fetching metrics and rendering dashboard
- Test handling context changes
- Test handling API errors
- Test section navigation
- Test dual-view presentation

## End-to-End Tests

For end-to-end tests, use a tool like Cypress or Playwright to test the dashboard with a real Shopify store:

- Test displaying products from the Storefront API
- Test switching between tree view and raw data view
- Test handling context changes
- Test error scenarios

## Performance Testing

### 1. Load Testing

- Test dashboard with large datasets (1000+ products)
- Measure execution time for data fetching and transformation
- Ensure rendering remains responsive

### 2. Memory Usage Testing

- Monitor memory usage during dashboard operation
- Test for memory leaks with repeated operations
- Ensure efficient handling of large datasets

## Security Testing

### 1. Authentication Testing

- Test rejection of requests with invalid tokens
- Test acceptance of requests with valid tokens
- Test token expiration handling

### 2. Input Validation Testing

- Test sanitization of query inputs
- Test handling of potentially malicious inputs
- Test validation of user inputs

## Accessibility Testing

- Test dashboard for accessibility violations
- Test keyboard navigation
- Test screen reader compatibility
- Test color contrast

## Test Reporting

Set up test reporting to track test results over time using tools like Jest reporters, JUnit XML, or HTML reporters.

## Continuous Integration

Set up CI/CD pipeline to run tests automatically on code changes using GitHub Actions, Jenkins, or similar tools.

## Test Coverage Goals

Aim for the following test coverage:

- Unit Tests: 90%+ coverage
- Integration Tests: Key user flows and edge cases
- End-to-End Tests: Critical user journeys
- Performance Tests: Large dataset handling
- Security Tests: Authentication and input validation
- Accessibility Tests: WCAG 2.1 AA compliance

## Testing Best Practices

1. Write tests before implementation (TDD approach)
2. Mock external dependencies
3. Test both success and failure scenarios
4. Use descriptive test names
5. Keep tests independent and isolated
6. Regularly run the full test suite
7. Monitor test performance and optimize slow tests
8. Update tests when requirements change
