import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import ConfigManager from '../ConfigManager';
import type { StorefrontApiClientOptions } from '../StorefrontApiClient';

export interface ApolloClientConfig extends Partial<StorefrontApiClientOptions> {
  enableDefer?: boolean;
  retryOptions?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  };
}

export const createApolloClient = (config: ApolloClientConfig) => {
  // Load configuration from environment if enabled
  // Get config from environment or use provided config
  const envConfig = config.useEnvConfig ? ConfigManager.getConfig() : {} as any;

  const storeDomain = config.storeDomain || envConfig.storeDomain;
  const publicStorefrontToken = config.publicStorefrontToken || envConfig.publicStorefrontToken;
  const privateStorefrontToken = config.privateStorefrontToken || envConfig.privateStorefrontToken;
  const storefrontApiVersion = config.storefrontApiVersion || envConfig.storefrontApiVersion || '2025-04';

  // Apollo specific options
  const retryOptions = config.retryOptions || {
    maxRetries: 3,
    initialDelay: 300,
    maxDelay: 10000,
    backoffFactor: 2,
  };

  if (!storeDomain) {
    throw new Error('Missing required configuration: storeDomain');
  }

  if (!publicStorefrontToken && !privateStorefrontToken) {
    throw new Error('Missing required configuration: publicStorefrontToken or privateStorefrontToken');
  }

  // Create the HTTP link
  const httpLink = createHttpLink({
    uri: `https://${storeDomain}/api/${storefrontApiVersion}/graphql.json`,
    headers: {
      'X-Shopify-Storefront-Access-Token': privateStorefrontToken || publicStorefrontToken!,
      'Content-Type': 'application/json',
    },
    // Enable @defer support
    useGETForQueries: false,
    includeExtensions: true,
    includeUnusedVariables: false,
  });

  // Error handling link
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  // Retry link for handling transient failures
  const retryLink = new RetryLink({
    delay: {
      initial: retryOptions.initialDelay,
      max: retryOptions.maxDelay,
      jitter: true,
    },
    attempts: {
      max: retryOptions.maxRetries,
      retryIf: (error, _operation) => {
        // Retry on network errors and specific GraphQL errors
        return !!error &&
          (error.statusCode === 429 || // Rate limit
           error.statusCode >= 500 || // Server errors
           error.message.includes('timeout')); // Timeout errors
      },
    },
  });

  // Authentication link
  const authLink = new ApolloLink((operation, forward) => {
    // Add any additional headers or context here
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'Shopify-Storefront-Private-Token': privateStorefrontToken,
      },
    }));

    return forward(operation);
  });

  // Cache configuration
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Add field policies for pagination and caching
          products: {
            // Example merge function for products connection
            merge(existing, incoming, { args }) {
              if (!args?.after) return incoming;
              return {
                ...incoming,
                edges: [...(existing?.edges || []), ...(incoming?.edges || [])],
              };
            },
          },
        },
      },
    },
  });

  // Create the Apollo Client
  return new ApolloClient({
    link: from([
      errorLink,
      retryLink,
      authLink,
      httpLink,
    ]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    // Enable @defer support
    assumeImmutableResults: true,
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
};