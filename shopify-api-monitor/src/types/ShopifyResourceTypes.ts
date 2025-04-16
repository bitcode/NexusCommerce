/**
 * ShopifyResourceTypes.ts
 * Type definitions for Shopify resources and operations
 */

/**
 * Enum of available Shopify resource types
 */
export enum ShopifyResourceType {
  PRODUCT = 'product',
  PRODUCT_VARIANT = 'productVariant',
  COLLECTION = 'collection',
  CUSTOMER = 'customer',
  ORDER = 'order',
  DRAFT_ORDER = 'draftOrder',
  INVENTORY_ITEM = 'inventoryItem',
  INVENTORY_LEVEL = 'inventoryLevel',
  FULFILLMENT = 'fulfillment',
  SHOP = 'shop',
  METAFIELD = 'metafield',
  DISCOUNT = 'discount',
  PRICE_RULE = 'priceRule',
  // Additional resource types for comprehensive management
  PAGE = 'page',
  BLOG = 'blog',
  ARTICLE = 'article',
  METAOBJECT = 'metaobject',
  METAOBJECT_DEFINITION = 'metaobjectDefinition',
  FILE = 'file',
  MENU = 'menu',
  MENU_ITEM = 'menuItem',
  LOCATION = 'location',
  INVENTORY_TRANSFER = 'inventoryTransfer',
}

/**
 * Options for read operations
 */
export interface ReadOptions {
  /** ID of the resource to fetch (for single resource queries) */
  id?: string;
  
  /** Number of items to fetch (for list queries) */
  first?: number;
  
  /** Cursor for pagination (for list queries) */
  after?: string;
  
  /** Filter criteria (for list queries) */
  filter?: Record<string, any>;
  
  /** Sort criteria (for list queries) */
  sortKey?: string;
  
  /** Sort direction (for list queries) */
  reverse?: boolean;
  
  /** GraphQL query variables */
  variables?: Record<string, any>;
  
  /** Cache options for the request */
  cacheOptions?: Partial<StateRequestOptions>;
}

/**
 * Options for mutation operations
 */
export interface MutationOptions {
  /** Whether to use optimistic updates */
  optimisticUpdate?: boolean;
  
  /** Function to generate optimistic response */
  optimisticResponse?: (input: any) => any;
  
  /** Function to roll back optimistic update on error */
  rollback?: (stateManager: any) => void;
  
  /** Whether to invalidate cache after mutation */
  invalidateCache?: boolean;
  
  /** Cache key pattern to invalidate */
  invalidateCachePattern?: string | RegExp;
  
  /** Callback on successful mutation */
  onSuccess?: (data: any) => void;
  
  /** Callback on mutation error */
  onError?: (error: Error) => void;
}

/**
 * Mutation operation details
 */
export interface MutationOperation {
  /** Unique ID for the operation */
  id: string;
  
  /** Type of operation (create, update, delete) */
  type: 'create' | 'update' | 'delete';
  
  /** Resource type being operated on */
  resourceType: ShopifyResourceType;
  
  /** Input data for the operation */
  input?: any;
  
  /** Resource ID (for update/delete) */
  resourceId?: string;
  
  /** Function to roll back optimistic update on error */
  rollback?: (stateManager: any) => void;
  
  /** Timestamp when operation was initiated */
  timestamp: number;
}

/**
 * Result of a query operation
 */
export interface QueryResult<T> {
  /** The data returned from the query */
  data: T | null;
  
  /** Pagination info for list queries */
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  
  /** Whether the result came from cache */
  fromCache?: boolean;
  
  /** When the data was last fetched */
  lastFetched?: number;
}

/**
 * Function type for optimistic updates
 */
export type OptimisticUpdateFunction = (stateManager: any) => void;

/**
 * Basic product interface
 */
export interface Product {
  id: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  productType?: string;
  vendor?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  tags?: string[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  images?: Image[];
  metafields?: Metafield[];
}

/**
 * Product option interface
 */
export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

/**
 * Product variant interface
 */
export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  inventoryQuantity?: number;
  inventoryManagement?: 'SHOPIFY' | 'NOT_MANAGED';
  inventoryPolicy?: 'DENY' | 'CONTINUE';
  requiresShipping?: boolean;
  taxable?: boolean;
  weight?: number;
  weightUnit?: 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES';
  selectedOptions?: { name: string; value: string }[];
  metafields?: Metafield[];
}

/**
 * Collection interface
 */
export interface Collection {
  id: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  handle?: string;
  image?: Image;
  products?: Product[];
  metafields?: Metafield[];
  ruleSet?: CollectionRuleSet;
  sortOrder?: string;
}

/**
 * Collection rule set interface
 */
export interface CollectionRuleSet {
  rules: CollectionRule[];
  appliedDisjunctively: boolean;
}

/**
 * Collection rule interface
 */
export interface CollectionRule {
  column: string;
  relation: string;
  condition: string;
}

/**
 * Image interface
 */
export interface Image {
  id: string;
  src: string;
  altText?: string;
  width?: number;
  height?: number;
}

/**
 * Metafield interface
 */
export interface Metafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

/**
 * Metaobject interface
 */
export interface Metaobject {
  id: string;
  handle: string;
  type: string;
  fields: MetaobjectField[];
}

/**
 * Metaobject field interface
 */
export interface MetaobjectField {
  key: string;
  value: string;
  type: string;
}

/**
 * Metaobject definition interface
 */
export interface MetaobjectDefinition {
  id: string;
  name: string;
  type: string;
  fieldDefinitions: MetaobjectFieldDefinition[];
}

/**
 * Metaobject field definition interface
 */
export interface MetaobjectFieldDefinition {
  key: string;
  name: string;
  type: string;
  required: boolean;
  validations?: any[];
}

/**
 * Page interface
 */
export interface Page {
  id: string;
  title: string;
  handle?: string;
  bodySummary?: string;
  body?: string;
  bodyHtml?: string;
  createdAt?: string;
  updatedAt?: string;
  metafields?: Metafield[];
}

/**
 * Blog interface
 */
export interface Blog {
  id: string;
  title: string;
  handle?: string;
  articles?: Article[];
  metafields?: Metafield[];
}

/**
 * Article interface
 */
export interface Article {
  id: string;
  title: string;
  handle?: string;
  authorV2?: {
    name: string;
    email?: string;
    bio?: string;
  };
  content?: string;
  contentHtml?: string;
  summary?: string;
  image?: Image;
  publishedAt?: string;
  tags?: string[];
  blog?: Blog;
  metafields?: Metafield[];
}

/**
 * Menu interface
 */
export interface Menu {
  id: string;
  handle: string;
  title: string;
  items?: MenuItem[];
}

/**
 * Menu item interface
 */
export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  type?: string;
  resourceId?: string;
  items?: MenuItem[];
}

/**
 * Location interface
 */
export interface Location {
  id: string;
  name: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  isActive?: boolean;
}

/**
 * Inventory transfer interface
 */
export interface InventoryTransfer {
  id: string;
  number?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'PENDING' | 'OPEN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  trackingInfo?: {
    company?: string;
    number?: string;
    url?: string;
  };
  expectedDeliveryDate?: string;
  shipmentStatus?: string;
  locationId?: string;
  destinationLocationId?: string;
  inventoryItems?: {
    inventoryItemId: string;
    quantity: number;
  }[];
}

/**
 * File interface
 */
export interface File {
  id: string;
  alt?: string;
  createdAt?: string;
  fileStatus?: 'FAILED' | 'PROCESSING' | 'READY' | 'UPLOADED';
  fileErrors?: string[];
  originalSource?: {
    fileSize?: string;
    mimeType?: string;
    url?: string;
  };
}

// Re-export StateRequestOptions from StateManager
import { StateRequestOptions } from '../StateManager';
export { StateRequestOptions };