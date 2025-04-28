/**
 * Admin API GraphQL exports
 * This file exports all Admin API GraphQL queries and mutations
 */

// Export product queries and mutations
export * from './products/fragments';
export * from './products/queries';
export * from './products/mutations';

// Export collection queries and mutations
export * from './collections/fragments';
export * from './collections/queries';
export * from './collections/mutations';

// Export customer queries and mutations
export * from './customers/fragments';
export * from './customers/queries';
export * from './customers/mutations';

// Export order queries and mutations
export * from './orders/fragments';
export * from './orders/queries';
export * from './orders/mutations';

// Export other entity queries and mutations as they are implemented

// export * from './inventory/fragments';
// export * from './inventory/queries';
// export * from './inventory/mutations';

// export * from './metafields/fragments';
// export * from './metafields/queries';
// export * from './metafields/mutations';

// export * from './discounts/fragments';
// export * from './discounts/queries';
// export * from './discounts/mutations';

// export * from './fulfillment/fragments';
// export * from './fulfillment/queries';
// export * from './fulfillment/mutations';
