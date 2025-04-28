# Comprehensive Overview of Shopify GraphQL API CRUD Operations

## 1. Products

### Admin API

**Create Operations:**
- `productCreate`: Creates a new product with attributes like title, description, vendor, etc.
- `productSet`: Creates or updates a product in a single request (useful for syncing from external sources)
- `productDuplicate`: Duplicates an existing product
- `productBundleCreate`: Creates a product bundle (fixed bundle of products)

**Read Operations:**
- `product`: Retrieves a single product by ID
- `productByIdentifier`: Retrieves a product by identifier (handle, ID, etc.)
- `products`: Retrieves a list of products with filtering options

**Update Operations:**
- `productUpdate`: Updates product details
- `productSet`: Updates a product (same as create)
- `productChangeStatus`: Changes product status (active, archived, draft)
- `productOptionsCreate`: Adds options to a product
- `productOptionsDelete`: Removes options from a product
- `productOptionsReorder`: Reorders product options
- `productOptionUpdate`: Updates a product option
- `productBundleUpdate`: Updates a product bundle

**Delete Operations:**
- `productDelete`: Deletes a product

**Media Operations:**
- `productCreateMedia`: Creates media for a product
- `productDeleteMedia`: Deletes media from a product
- `productUpdateMedia`: Updates product media
- `productReorderMedia`: Reorders product media
- `productVariantAppendMedia`: Appends media to variants
- `productVariantDetachMedia`: Detaches media from variants

**Variant Operations:**
- `productVariantsBulkCreate`: Creates multiple variants
- `productVariantsBulkUpdate`: Updates multiple variants
- `productVariantsBulkDelete`: Deletes multiple variants
- `productVariantsBulkReorder`: Reorders multiple variants

**Publication Operations:**
- `productPublish`: Publishes a product
- `productUnpublish`: Unpublishes a product

### Storefront API

**Read Operations:**
- `product`: Retrieves a single product by handle
- `products`: Retrieves a list of products with filtering options

## 2. Collections

### Admin API

**Create Operations:**
- `collectionCreate`: Creates a new collection
- `catalogCreate`: Creates a catalog for collections

**Read Operations:**
- `collection`: Retrieves a single collection by ID
- `collections`: Retrieves a list of collections

**Update Operations:**
- `collectionUpdate`: Updates collection details
- `collectionAddProducts`: Adds products to a collection
- `collectionAddProductsV2`: Adds products to a collection (improved version)
- `collectionRemoveProducts`: Removes products from a collection
- `collectionReorderProducts`: Reorders products in a collection
- `catalogUpdate`: Updates a catalog
- `catalogContextUpdate`: Updates catalog context

**Delete Operations:**
- `collectionDelete`: Deletes a collection
- `catalogDelete`: Deletes a catalog

**Publication Operations:**
- `collectionPublish`: Publishes a collection
- `collectionUnpublish`: Unpublishes a collection

### Storefront API

**Read Operations:**
- `collection`: Retrieves a single collection by handle
- `collections`: Retrieves a list of collections

## 3. Customers

### Admin API

**Create Operations:**
- `customerCreate`: Creates a new customer

**Read Operations:**
- `customer`: Retrieves a single customer by ID
- `customers`: Retrieves a list of customers with filtering options

**Update Operations:**
- `customerUpdate`: Updates customer details
- `customerAddTaxExemptions`: Adds tax exemptions to a customer
- `customerRemoveTaxExemptions`: Removes tax exemptions from a customer

**Delete Operations:**
- `customerDelete`: Deletes a customer

### Storefront API

**Create Operations:**
- `customerCreate`: Creates a new customer
- `customerAccessTokenCreate`: Creates a customer access token for authentication

**Read Operations:**
- `customer`: Retrieves customer information (requires access token)

**Update Operations:**
- `customerUpdate`: Updates customer information (requires access token)
- `customerAddressCreate`: Creates a new address for a customer
- `customerAddressUpdate`: Updates a customer address
- `customerAddressDelete`: Deletes a customer address
- `customerDefaultAddressUpdate`: Sets a default address for a customer

**Delete Operations:**
- `customerAccessTokenDelete`: Deletes a customer access token (logout)

## 4. Orders

### Admin API

**Create Operations:**
- `orderCreate`: Creates a new order with customer info, line items, addresses, etc.
- `draftOrderCreate`: Creates a draft order
- `draftOrderCreateFromOrder`: Creates a draft order from an existing order
- `draftOrderComplete`: Completes a draft order

**Read Operations:**
- `order`: Retrieves a single order by ID
- `orders`: Retrieves a list of orders with filtering options
- `draftOrder`: Retrieves a single draft order
- `draftOrders`: Retrieves a list of draft orders

**Update Operations:**
- `orderUpdate`: Updates order details
- `orderEditBegin`: Begins an order editing session
- `orderEditAddVariant`: Adds a variant to an order during editing
- `orderEditAddCustomItem`: Adds a custom item to an order during editing
- `orderEditSetQuantity`: Sets quantity for an item during editing
- `orderEditCommit`: Commits order edits
- `draftOrderUpdate`: Updates a draft order
- `draftOrderCalculate`: Calculates a draft order

**Delete Operations:**
- `orderDelete`: Deletes an order
- `draftOrderDelete`: Deletes a draft order

**Status Operations:**
- `orderCancel`: Cancels an order
- `orderClose`: Closes an order
- `orderOpen`: Reopens a closed order
- `orderMarkAsPaid`: Marks an order as paid

**Payment Operations:**
- `orderCapture`: Captures payment for an order
- `orderCreateManualPayment`: Creates a manual payment for an order
- `orderCreateMandatePayment`: Creates a mandate payment for an order

### Storefront API

**Read Operations:**
- `order`: Retrieves a single order by ID (requires customer access token)
- `orders`: Retrieves a list of customer orders (requires customer access token)

## 5. Cart (Storefront API only)

**Create Operations:**
- `cartCreate`: Creates a new cart

**Read Operations:**
- `cart`: Retrieves a cart by ID

**Update Operations:**
- `cartLinesAdd`: Adds items to a cart
- `cartLinesUpdate`: Updates items in a cart
- `cartLinesRemove`: Removes items from a cart
- `cartBuyerIdentityUpdate`: Updates customer information associated with a cart
- `cartNoteUpdate`: Updates the note on a cart
- `cartAttributesUpdate`: Updates cart attributes
- `cartDiscountCodesUpdate`: Updates discount codes applied to a cart
- `cartSelectedDeliveryOptionsUpdate`: Updates delivery options for a cart

## 6. Checkout (Storefront API only)

**Create Operations:**
- `checkoutCreate`: Creates a new checkout
- `checkoutCreateFromCart`: Creates a checkout from a cart

**Read Operations:**
- `checkout`: Retrieves a checkout by ID

**Update Operations:**
- `checkoutAttributesUpdateV2`: Updates checkout attributes
- `checkoutCustomerAssociateV2`: Associates a customer with a checkout
- `checkoutDiscountCodeApplyV2`: Applies a discount code to a checkout
- `checkoutDiscountCodeRemove`: Removes a discount code from a checkout
- `checkoutEmailUpdateV2`: Updates the email on a checkout
- `checkoutShippingAddressUpdateV2`: Updates the shipping address
- `checkoutShippingLineUpdate`: Updates the shipping line

**Completion Operations:**
- `checkoutCompleteWithCreditCardV2`: Completes checkout with credit card
- `checkoutCompleteWithTokenizedPaymentV3`: Completes checkout with tokenized payment

## 7. Inventory

### Admin API

**Create Operations:**
- `inventoryActivate`: Activates inventory for a location
- `inventoryBulkAdjustQuantityAtLocation`: Adjusts inventory quantities in bulk

**Read Operations:**
- `inventoryItem`: Retrieves a single inventory item
- `inventoryItems`: Retrieves a list of inventory items
- `inventoryLevel`: Retrieves inventory level for a specific location
- `inventoryLevels`: Retrieves inventory levels across locations

**Update Operations:**
- `inventoryAdjustQuantity`: Adjusts inventory quantity
- `inventoryItemUpdate`: Updates inventory item details
- `inventoryBulkToggleActivation`: Toggles activation status for multiple inventory items

**Delete Operations:**
- `inventoryDeactivate`: Deactivates inventory for a location

## 8. Metafields (for all resources)

### Admin API

**Create Operations:**
- `metafieldStorefrontVisibilityCreate`: Creates storefront visibility for a metafield
- `metafieldsSet`: Sets metafields for a resource

**Read Operations:**
- `metafield`: Retrieves a single metafield
- `metafields`: Retrieves metafields for a resource
- `metafieldDefinition`: Retrieves a metafield definition
- `metafieldDefinitions`: Retrieves metafield definitions

**Update Operations:**
- `metafieldDefinitionUpdate`: Updates a metafield definition
- `metafieldUpdate`: Updates a metafield

**Delete Operations:**
- `metafieldDelete`: Deletes a metafield
- `metafieldDefinitionDelete`: Deletes a metafield definition
- `metafieldStorefrontVisibilityDelete`: Deletes storefront visibility for a metafield

### Storefront API

**Read Operations:**
- `metafield`: Retrieves a metafield for a resource
- `metafields`: Retrieves metafields for a resource

## 9. Discounts and Marketing

### Admin API

**Create Operations:**
- `discountAutomaticBasicCreate`: Creates a basic automatic discount
- `discountAutomaticBulkCreate`: Creates automatic discounts in bulk
- `discountCodeBasicCreate`: Creates a basic discount code
- `discountCodeBulkCreate`: Creates discount codes in bulk
- `priceRuleCreate`: Creates a price rule

**Read Operations:**
- `discountNode`: Retrieves a single discount
- `discountNodes`: Retrieves a list of discounts
- `priceRule`: Retrieves a single price rule
- `priceRules`: Retrieves a list of price rules

**Update Operations:**
- `discountAutomaticBasicUpdate`: Updates a basic automatic discount
- `discountCodeBasicUpdate`: Updates a basic discount code
- `priceRuleUpdate`: Updates a price rule

**Delete Operations:**
- `discountAutomaticDelete`: Deletes an automatic discount
- `discountCodeDelete`: Deletes a discount code
- `priceRuleDelete`: Deletes a price rule

## 10. Fulfillment and Shipping

### Admin API

**Create Operations:**
- `fulfillmentCreateV2`: Creates a fulfillment
- `fulfillmentOrderAccept`: Accepts a fulfillment order
- `fulfillmentOrderSubmit`: Submits a fulfillment order
- `fulfillmentServiceCreate`: Creates a fulfillment service
- `deliveryProfileCreate`: Creates a delivery profile
- `shippingPackageCreate`: Creates a shipping package

**Read Operations:**
- `fulfillment`: Retrieves a single fulfillment
- `fulfillments`: Retrieves a list of fulfillments
- `fulfillmentOrder`: Retrieves a fulfillment order
- `fulfillmentOrders`: Retrieves fulfillment orders

**Update Operations:**
- `fulfillmentUpdateTracking`: Updates tracking information for a fulfillment
- `fulfillmentServiceUpdate`: Updates a fulfillment service
- `deliveryProfileUpdate`: Updates a delivery profile
- `shippingPackageUpdate`: Updates a shipping package

**Delete Operations:**
- `fulfillmentServiceDelete`: Deletes a fulfillment service
- `deliveryProfileRemove`: Removes a delivery profile
- `shippingPackageDelete`: Deletes a shipping package

## Key Observations

1. **Admin API vs. Storefront API**:
   - The Admin API provides comprehensive CRUD operations for all entities
   - The Storefront API is more limited, focusing on customer-facing operations (cart, checkout, product/collection viewing)

2. **Mutation Patterns**:
   - Create operations: `entityCreate`
   - Read operations: `entity` (single) or `entities` (list)
   - Update operations: `entityUpdate`
   - Delete operations: `entityDelete`
   - Bulk operations: `entityBulkCreate`, `entityBulkUpdate`, `entityBulkDelete`

3. **Special Operations**:
   - Publication control: `entityPublish`, `entityUnpublish`
   - Status changes: `entityChangeStatus`, `entityActivate`, `entityDeactivate`
   - Specialized actions: `entityDuplicate`, `entityMarkAsPaid`, etc.

4. **Data Capabilities**:
   - Both APIs support creating entities with all required fields
   - Images and media can be managed through dedicated mutations
   - Metafields provide extensibility for custom data

5. **Authentication Differences**:
   - Admin API requires admin access tokens
   - Storefront API uses storefront access tokens for public operations
   - Customer-specific operations in Storefront API require customer access tokens

## Limitations

1. **Storefront API Limitations**:
   - Limited write capabilities (focused on cart, checkout, and customer operations)
   - No ability to create or manage products/collections (read-only)

2. **Admin API Limitations**:
   - Some operations have rate limits or input size restrictions
   - Complex operations like `orderCreate` have limitations on discount applications
   - Some operations require specific access scopes