import {
  QueryHookOptions,
  QueryResult,
  useQuery,
  DocumentNode,
  OperationVariables
} from '@apollo/client';

export function useShopifyQuery<TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>
): QueryResult<TData, TVariables> {
  return useQuery<TData, TVariables>(query, {
    ...options,
    // Enable @defer support by default
    returnPartialData: true,
    // Add default error handling
    onError: (error) => {
      console.error('GraphQL Query Error:', error);
      options?.onError?.(error);
    },
  });
}