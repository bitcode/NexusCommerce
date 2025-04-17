# StorefrontApiClient Implementation Guide

This document provides implementation guidelines for the `StorefrontApiClient` class, which is a key component of our Shopify Storefront API integration plan.

## Class Overview

The `StorefrontApiClient` class will be responsible for:

1. Authenticating with the Shopify Storefront API
2. Constructing and sending GraphQL queries
3. Handling responses and errors
4. Supporting context directives for localization

## Implementation Details

### File Location

```
shopify-api-monitor/src/StorefrontApiClient.ts
```

### Dependencies

```typescript
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { ConfigManager } from './ConfigManager';
```

### Interface Definitions

```typescript
/**
 * Options for the StorefrontApiClient constructor
 */
export interface StorefrontApiClientOptions {
  /**
   * Shopify store domain (e.g., 'your-store.myshopify.com')
   * Can be loaded from environment via ConfigManager
   */
  storeDomain?: string;
  
  /**
   * Public Storefront API token for client-side access
   * Can be loaded from environment via ConfigManager
   */
  publicStorefrontToken?: string;
  
  /**
   * Private Storefront API token for server-side access (optional)
   * Can be loaded from environment via ConfigManager
   */
  privateStorefrontToken?: string;
  
  /**
   * Storefront API version (e.g., '2025-04')
   * Can be loaded from environment via ConfigManager
   */
  storefrontApiVersion?: string;
  
  /**
   * Context settings for the Storefront API
   */
  context?: StorefrontContext;
  
  /**
   * Use environment variables from ConfigManager
   * @default true
   */
  useEnvConfig?: boolean;
  
  /**
   * Callback when an error occurs
   */
  onError?: (error: any) => void;
}

/**
 * Context settings for the Storefront API
 */
export interface StorefrontContext {
  /**
   * Country code for localization
   */
  country?: string;
  
  /**
   * Language code for localization
   */
  language?: string;
  
  /**
   * Buyer identity information
   */
  buyerIdentity?: {
    customerAccessToken?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
  };
}

/**
 * Response from the Storefront API
 */
export interface StorefrontApiResponse<T = any> {
  data?: T;
  errors?: any[];
  extensions?: any;
}
```

### Class Implementation

```typescript
/**
 * Client for the Shopify Storefront API
 * Handles authentication, query construction, and error handling
 */
export class StorefrontApiClient {
  private client: GraphQLClient;
  private context?: StorefrontContext;
  private onError?: (error: any) => void;
  
  constructor(private options: StorefrontApiClientOptions) {
    // Load configuration from environment if enabled
    let storeDomain: string;
    let publicStorefrontToken: string;
    let privateStorefrontToken: string | undefined;
    let storefrontApiVersion: string;
    
    if (options.useEnvConfig !== false) {
      // Get config from ConfigManager
      const config = ConfigManager.getConfig();
      
      // Use options if provided, otherwise use config values
      storeDomain = options.storeDomain || config.storeDomain || '';
      publicStorefrontToken = options.publicStorefrontToken || config.publicStorefrontToken || '';
      privateStorefrontToken = options.privateStorefrontToken || config.privateStorefrontToken;
      storefrontApiVersion = options.storefrontApiVersion || config.storefrontApiVersion || '2025-04';
      
      // Validate required fields
      if (!storeDomain) {
        throw new Error('Missing required configuration: storeDomain. Provide it in options or .env file.');
      }
      
      if (!publicStorefrontToken && !privateStorefrontToken) {
        throw new Error('Missing required configuration: publicStorefrontToken or privateStorefrontToken. Provide it in options or .env file.');
      }
    } else {
      // Use only the provided options
      storeDomain = options.storeDomain || '';
      publicStorefrontToken = options.publicStorefrontToken || '';
      privateStorefrontToken = options.privateStorefrontToken;
      storefrontApiVersion = options.storefrontApiVersion || '2025-04';
      
      // Validate required fields
      if (!storeDomain) {
        throw new Error('Missing required option: storeDomain');
      }
      
      if (!publicStorefrontToken && !privateStorefrontToken) {
        throw new Error('Missing required option: publicStorefrontToken or privateStorefrontToken');
      }
    }
    
    this.context = options.context;
    this.onError = options.onError;
    
    // Determine which token to use (private takes precedence if both are provided)
    const token = privateStorefrontToken || publicStorefrontToken;
    
    // Create GraphQL client
    this.client = new GraphQLClient(
      `https://${storeDomain}/api/${storefrontApiVersion}/graphql.json`,
      {
        headers: {
          'X-Shopify-Storefront-Access-Token': token,
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  /**
   * Executes a GraphQL query with error handling
   * 
   * @param document - GraphQL query or mutation
   * @param variables - Variables for the query
   * @returns Promise with the response data
   */
  async request<T = any>(
    document: RequestDocument,
    variables?: Variables
  ): Promise<StorefrontApiResponse<T>> {
    try {
      // Apply context directive if context is provided
      const queryWithContext = this.applyContextDirective(document);
      
      // Execute the query
      const response = await this.client.rawRequest<T>(
        typeof queryWithContext === 'string' ? queryWithContext : queryWithContext.toString(),
        variables
      );
      
      return {
        data: response.data,
        errors: (response as any).errors,
        extensions: (response as any).extensions,
      };
    } catch (error: any) {
      // Check for specific error types
      if (error?.response?.status === 430) {
        // Handle security rejection
        const securityError = new Error('Shopify Security Rejection: Potential malicious request detected.');
        if (this.onError) this.onError(securityError);
        throw securityError;
      }
      
      // Handle other errors
      if (this.onError) this.onError(error);
      throw error;
    }
  }
  
  /**
   * Applies the @inContext directive to a query if context is provided
   * 
   * @param document - GraphQL query or mutation
   * @returns Modified query with context directive
   */
  private applyContextDirective(document: RequestDocument): RequestDocument {
    if (!this.context) {
      return document;
    }
    
    const contextDirective = [];
    
    if (this.context.country) {
      contextDirective.push(`country: ${this.context.country}`);
    }
    
    if (this.context.language) {
      contextDirective.push(`language: ${this.context.language}`);
    }
    
    if (this.context.buyerIdentity) {
      const buyerIdentity = this.context.buyerIdentity;
      const buyerIdentityParams = [];
      
      if (buyerIdentity.customerAccessToken) {
        buyerIdentityParams.push(`customerAccessToken: "${buyerIdentity.customerAccessToken}"`);
      }
      
      if (buyerIdentity.email) {
        buyerIdentityParams.push(`email: "${buyerIdentity.email}"`);
      }
      
      if (buyerIdentity.phone) {
        buyerIdentityParams.push(`phone: "${buyerIdentity.phone}"`);
      }
      
      if (buyerIdentity.countryCode) {
        buyerIdentityParams.push(`countryCode: ${buyerIdentity.countryCode}`);
      }
      
      if (buyerIdentityParams.length > 0) {
        contextDirective.push(`buyerIdentity: {${buyerIdentityParams.join(', ')}}`);
      }
    }
    
    if (contextDirective.length === 0) {
      return document;
    }
    
    // Convert document to string if it's not already
    const queryString = typeof document === 'string' ? document : document.toString();
    
    // Insert @inContext directive after the query keyword
    return queryString.replace(
      /query\s+([a-zA-Z0-9_]*)/,
      `query $1 @inContext(${contextDirective.join(', ')})`
    );
  }
  
  /**
   * Sets the context for subsequent queries
   * 
   * @param context - Context settings
   */
  setContext(context: StorefrontContext): void {
    this.context = context;
  }
  
  /**
   * Gets the current context
   * 
   * @returns Current context settings
   */
  getContext(): StorefrontContext | undefined {
    return this.context;
  }
}
```

## Usage Examples

### Basic Usage

```typescript
// Create client with environment variables
const client = new StorefrontApiClient({
  useEnvConfig: true
});

// Execute a query
const response = await client.request(PRODUCT_QUERY, { first: 10 });
```

### With Context

```typescript
// Create client with context
const client = new StorefrontApiClient({
  storeDomain: 'your-store.myshopify.com',
  publicStorefrontToken: 'your-token',
  context: {
    country: 'US',
    language: 'EN'
  }
});

// Execute a query with context
const response = await client.request(PRODUCT_QUERY, { first: 10 });
```

### Error Handling

```typescript
// Create client with error handler
const client = new StorefrontApiClient({
  useEnvConfig: true,
  onError: (error) => {
    console.error('Shopify API Error:', error);
    // Log to monitoring service or display notification
  }
});

// Execute a query with try/catch
try {
  const response = await client.request(PRODUCT_QUERY, { first: 10 });
  // Process response
} catch (error) {
  // Handle error (in addition to onError callback)
}
```

## Testing Considerations

1. **Mock Responses**: Create mock responses for testing without hitting the actual API
2. **Error Scenarios**: Test various error scenarios (network errors, GraphQL errors, security rejections)
3. **Context Directive**: Verify that the context directive is correctly applied to queries
4. **Authentication**: Test with both public and private tokens

## Next Steps

After implementing the `StorefrontApiClient`, the next steps are:

1. Create GraphQL query definitions for each resource type
2. Implement data transformers for each resource type
3. Update the dashboard to use the new client and transformers