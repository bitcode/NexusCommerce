# Environment Configuration Guide

This document provides a comprehensive guide to configuring the nexusCommerce Shopify API Monitor using environment variables.

## Overview

The nexusCommerce Shopify API Monitor uses a centralized configuration system that allows you to manage all credentials and settings through a `.env` file. This approach offers several benefits:

- **Security**: Sensitive credentials are kept out of your codebase
- **Environment-specific configuration**: Different settings for development, staging, and production
- **Simplified deployment**: Easy configuration across different environments
- **Centralized management**: All settings in one place

## Configuration File

The system uses a `.env` file in the root directory of your project. You can also use environment-specific files like `.env.development`, `.env.production`, etc.

### Sample Configuration

A sample `.env` file is provided at `.env.sample`. You can copy this file to create your own configuration:

```bash
cp .env.sample .env
```

Then edit the `.env` file with your specific settings.

## Available Configuration Options

### Core Shopify Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SHOPIFY_SHOP` | Your Shopify store domain (e.g., 'your-store.myshopify.com') | Yes | - |
| `SHOPIFY_API_KEY` | Your Shopify API key | Yes | - |
| `SHOPIFY_API_SECRET_KEY` | Your Shopify API secret key | Yes | - |
| `SHOPIFY_ACCESS_TOKEN` | Your Shopify access token (for private apps) | No | - |
| `SHOPIFY_API_VERSION` | Shopify API version to use | No | '2023-10' |
| `SHOPIFY_PLAN` | Your Shopify plan type (standard, advanced, plus, enterprise) | No | 'standard' |

### OAuth Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SHOPIFY_OAUTH_SCOPES` | Comma-separated list of OAuth scopes | No | - |
| `SHOPIFY_OAUTH_REDIRECT_URI` | Redirect URI for OAuth flow | No | - |
| `SHOPIFY_OAUTH_ONLINE` | Whether to use online access mode (true/false) | No | false |

### Webhook Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SHOPIFY_WEBHOOK_SECRET` | Secret for validating webhook signatures | No | - |
| `SHOPIFY_WEBHOOK_BASE_URL` | Base URL for webhook endpoints | No | - |

### Advanced Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SHOPIFY_MAX_RETRIES` | Maximum retry attempts for failed API calls | No | 3 |
| `SHOPIFY_RETRY_DELAY` | Base delay in milliseconds between retries | No | 1000 |
| `SHOPIFY_TIMEOUT` | Timeout in milliseconds for API requests | No | 30000 |
| `SHOPIFY_USE_HTTPS` | Whether to use HTTPS for all requests (true/false) | No | true |

### Custom Headers

You can add custom headers to API requests by prefixing variables with `SHOPIFY_HEADER_`:

```
SHOPIFY_HEADER_X_CUSTOM_HEADER=custom_value
```

This will add the header `X-Custom-Header: custom_value` to all API requests.

## Usage in Code

### Basic Usage

The configuration system is automatically used when you create a new instance of the Shopify API Monitor:

```typescript
import { createShopifyMonitor } from 'shopify-api-monitor';

// Configuration will be loaded from .env file
const monitor = createShopifyMonitor({});
```

### Overriding Environment Variables

You can override environment variables by passing options directly:

```typescript
const monitor = createShopifyMonitor({
  shop: 'override-store.myshopify.com',
  accessToken: 'override-token',
  configManager: {
    environment: 'development' // Use .env.development file
  }
});
```

### Custom Environment File Path

You can specify a custom path to your environment file:

```typescript
const monitor = createShopifyMonitor({
  configManager: {
    envPath: '/path/to/custom/.env'
  }
});
```

### Disabling Environment Variables

If you want to disable loading from environment variables:

```typescript
const monitor = createShopifyMonitor({
  shop: 'your-store.myshopify.com', // Required when not using env
  accessToken: 'your-access-token', // Required when not using env
  configManager: {
    useEnvConfig: false
  }
});
```

## Environment-Specific Configuration

You can create different environment files for different environments:

- `.env.development` - Development environment
- `.env.test` - Testing environment
- `.env.production` - Production environment

To use a specific environment file:

```typescript
const monitor = createShopifyMonitor({
  configManager: {
    environment: 'production' // Will load from .env.production
  }
});
```

## Security Best Practices

1. **Never commit your .env file to version control**. Add it to your `.gitignore` file.
2. **Limit access to your .env file** to only those who need it.
3. **Use different credentials for different environments**.
4. **Regularly rotate your API keys and tokens**.
5. **Set appropriate scopes** for your OAuth tokens - use the minimum required permissions.

## Troubleshooting

If you're experiencing configuration issues:

1. Ensure your `.env` file exists in the correct location
2. Check that all required variables are set
3. Verify the format of your variables (no spaces around the `=` sign)
4. Make sure your `.env` file is properly formatted (one variable per line)
5. Check the console for any configuration-related error messages

For more detailed diagnostics, you can validate your configuration:

```typescript
import { ConfigManager } from 'shopify-api-monitor';

const config = ConfigManager.getInstance();
const validation = config.validate();

if (!validation.valid) {
  console.error('Invalid configuration:', validation.missing);
}