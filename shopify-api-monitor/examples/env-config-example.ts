/**
 * env-config-example.ts
 * Example of using the environment configuration system
 */

import { createShopifyMonitor, ConfigManager } from '../src';
import * as path from 'path';

// Example 1: Basic usage - automatically loads from .env
console.log('Example 1: Basic usage with .env file');
try {
  // This will automatically load configuration from .env file
  const monitor = createShopifyMonitor({});
  
  // Use the monitor
  console.log('Monitor created successfully with .env configuration');
  console.log(`Connected to shop: ${monitor.apiClient['options'].shop}`);
} catch (error) {
  console.error('Error creating monitor with .env configuration:', error);
}

// Example 2: Using a specific environment file
console.log('\nExample 2: Using a specific environment file');
try {
  // Create a monitor with a specific environment file
  const monitor = createShopifyMonitor({
    configManager: {
      envPath: path.join(__dirname, '../.env.development'),
      environment: 'development'
    }
  });
  
  console.log('Monitor created successfully with custom environment file');
} catch (error) {
  console.error('Error creating monitor with custom environment file:', error);
}

// Example 3: Overriding environment variables
console.log('\nExample 3: Overriding environment variables');
try {
  // Create a monitor with overridden settings
  const monitor = createShopifyMonitor({
    shop: 'override-store.myshopify.com',
    accessToken: 'override-token',
    apiVersion: '2025-04'
  });
  
  console.log('Monitor created successfully with overridden settings');
  console.log(`Connected to shop: ${monitor.apiClient['options'].shop}`);
} catch (error) {
  console.error('Error creating monitor with overridden settings:', error);
}

// Example 4: Disabling environment variables
console.log('\nExample 4: Disabling environment variables');
try {
  // Create a monitor without using environment variables
  const monitor = createShopifyMonitor({
    shop: 'direct-config-store.myshopify.com',
    accessToken: 'direct-config-token',
    apiVersion: '2025-04',
    configManager: {
      useEnvConfig: false
    }
  });
  
  console.log('Monitor created successfully without environment variables');
  console.log(`Connected to shop: ${monitor.apiClient['options'].shop}`);
} catch (error) {
  console.error('Error creating monitor without environment variables:', error);
}

// Example 5: Validating configuration
console.log('\nExample 5: Validating configuration');
try {
  // Get the configuration manager instance
  const configManager = ConfigManager.getInstance();
  
  // Validate the configuration
  const validation = configManager.validate();
  
  if (validation.valid) {
    console.log('Configuration is valid');
    console.log('Current configuration:', configManager.getConfig());
  } else {
    console.error('Invalid configuration. Missing required fields:', validation.missing);
  }
} catch (error) {
  console.error('Error validating configuration:', error);
}

// Example 6: Creating a sample .env file
console.log('\nExample 6: Creating a sample .env file');
try {
  // Create a sample .env file
  const samplePath = path.join(__dirname, '../.env.example');
  ConfigManager.createSampleEnvFile(samplePath);
  console.log(`Sample .env file created at ${samplePath}`);
} catch (error) {
  console.error('Error creating sample .env file:', error);
}