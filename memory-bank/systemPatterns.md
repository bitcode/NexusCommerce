# System Patterns *Optional*

[2025-04-16 16:20:14] - Designed the following architectural patterns for the Shopify Storefront API integration:

1. **Specialized API Client Pattern** - Creating a dedicated StorefrontApiClient class that is specifically designed for the Storefront API's authentication, endpoint, and GraphQL requirements, separate from the existing ShopifyApiClient.

2. **GraphQL Query Builder Pattern** - Implementing a structured approach to building GraphQL queries with operation names, variables, and directives, ensuring proper query construction and execution.

3. **Context Directive Pattern** - Supporting the `@inContext` directive for localization by implementing a query transformation mechanism that can apply context parameters to GraphQL queries.

4. **Data Transformer Pattern** - Creating specialized transformers for each resource type that convert GraphQL responses with edges/nodes pattern into the TreeNode format expected by the dashboard.

5. **Factory Method Pattern** - Using a DataTransformerFactory to create the appropriate transformer for each section, allowing for extensibility and separation of concerns.

6. **Comprehensive Error Handling Pattern** - Implementing specialized error handling for GraphQL errors that are returned with 200 OK status codes, ensuring proper error detection and reporting.

7. **Phased Implementation Pattern** - Structuring the implementation into distinct phases with clear deliverables and timelines, allowing for incremental development and testing.

[2025-04-16 08:44:25] - Implemented the Centralized Configuration Pattern for managing credentials and environment settings. This pattern includes:

1. **Configuration Interface** - A strongly-typed interface (ShopifyConfig) that defines all possible configuration options, providing type safety and documentation.

2. **Singleton Configuration Manager** - A singleton class (ConfigManager) that centralizes access to configuration values, ensuring consistent configuration across the application.

3. **Environment Variable Loading** - Automatic loading of configuration from .env files with support for environment-specific configurations (.env.development, .env.production).

4. **Configuration Validation** - Built-in validation to ensure required configuration values are present.

5. **Hierarchical Configuration** - A clear precedence order: direct options override environment variables, which override defaults.

6. **Separation of Concerns** - Configuration management is separated from application logic, making the system more maintainable.

7. **Flexible Access Patterns** - Both direct access to specific configuration values and access to the entire configuration object are supported.

This pattern enhances security by keeping sensitive credentials out of the codebase, improves maintainability by centralizing configuration logic, and provides flexibility for different deployment environments.