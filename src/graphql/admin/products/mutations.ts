/**
 * Product mutations for Admin API
 * These mutations are used to create, update, and delete products in the Shopify Admin API
 */

import {
  PRODUCT_BASIC_FRAGMENT,
  PRODUCT_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Mutation to create a new product
 * 
 * Variables:
 * - input: ProductInput object with product details (required)
 * - variantsFirst: Number of variants to fetch in response (optional, default: 50)
 * - mediaFirst: Number of media items to fetch in response (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const CREATE_PRODUCT = `
  mutation CreateProduct(
    $input: ProductInput!,
    $variantsFirst: Int = 50,
    $mediaFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    productCreate(input: $input) {
      product {
        ...ProductCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${PRODUCT_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to update an existing product
 * 
 * Variables:
 * - id: Product ID (required)
 * - input: ProductInput object with product details (required)
 * - variantsFirst: Number of variants to fetch in response (optional, default: 50)
 * - mediaFirst: Number of media items to fetch in response (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const UPDATE_PRODUCT = `
  mutation UpdateProduct(
    $id: ID!,
    $input: ProductInput!,
    $variantsFirst: Int = 50,
    $mediaFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    productUpdate(input: {
      id: $id,
      ...($input)
    }) {
      product {
        ...ProductCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${PRODUCT_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to delete a product
 * 
 * Variables:
 * - id: Product ID (required)
 */
export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: ID!) {
    productDelete(input: {
      id: $id
    }) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to duplicate a product
 * 
 * Variables:
 * - productId: Product ID to duplicate (required)
 * - newTitle: New title for the duplicated product (optional)
 * - includeImages: Whether to include images in the duplicate (optional, default: true)
 * - variantsFirst: Number of variants to fetch in response (optional, default: 50)
 * - mediaFirst: Number of media items to fetch in response (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const DUPLICATE_PRODUCT = `
  mutation DuplicateProduct(
    $productId: ID!,
    $newTitle: String,
    $includeImages: Boolean = true,
    $variantsFirst: Int = 50,
    $mediaFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    productDuplicate(
      productId: $productId,
      newTitle: $newTitle,
      includeImages: $includeImages
    ) {
      newProduct {
        ...ProductCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${PRODUCT_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to change product status
 * 
 * Variables:
 * - id: Product ID (required)
 * - status: New product status (ACTIVE, ARCHIVED, DRAFT) (required)
 */
export const CHANGE_PRODUCT_STATUS = `
  mutation ChangeProductStatus(
    $id: ID!,
    $status: ProductStatus!
  ) {
    productChangeStatus(
      productId: $id,
      status: $status
    ) {
      product {
        id
        title
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to publish a product
 * 
 * Variables:
 * - id: Product ID (required)
 */
export const PUBLISH_PRODUCT = `
  mutation PublishProduct($id: ID!) {
    productPublish(input: {
      id: $id
    }) {
      product {
        id
        title
        publishedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to unpublish a product
 * 
 * Variables:
 * - id: Product ID (required)
 */
export const UNPUBLISH_PRODUCT = `
  mutation UnpublishProduct($id: ID!) {
    productUnpublish(input: {
      id: $id
    }) {
      product {
        id
        title
        publishedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to create product media
 * 
 * Variables:
 * - productId: Product ID (required)
 * - media: Media input (required)
 */
export const CREATE_PRODUCT_MEDIA = `
  mutation CreateProductMedia(
    $productId: ID!,
    $media: [CreateMediaInput!]!
  ) {
    productCreateMedia(
      productId: $productId,
      media: $media
    ) {
      media {
        id
        mediaContentType
        alt
        ... on MediaImage {
          image {
            id
            url
            altText
            width
            height
          }
        }
        ... on Video {
          sources {
            url
            mimeType
            format
            height
            width
          }
          originalSource {
            url
            mimeType
            format
            height
            width
          }
        }
        ... on ExternalVideo {
          embeddedUrl
        }
        ... on Model3d {
          sources {
            url
            mimeType
            format
          }
        }
      }
      mediaUserErrors {
        field
        message
      }
      product {
        id
      }
    }
  }
`;

/**
 * Mutation to delete product media
 * 
 * Variables:
 * - productId: Product ID (required)
 * - mediaIds: Array of media IDs to delete (required)
 */
export const DELETE_PRODUCT_MEDIA = `
  mutation DeleteProductMedia(
    $productId: ID!,
    $mediaIds: [ID!]!
  ) {
    productDeleteMedia(
      productId: $productId,
      mediaIds: $mediaIds
    ) {
      deletedMediaIds
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to update product media
 * 
 * Variables:
 * - productId: Product ID (required)
 * - mediaId: Media ID to update (required)
 * - alt: New alt text for the media (required)
 */
export const UPDATE_PRODUCT_MEDIA = `
  mutation UpdateProductMedia(
    $productId: ID!,
    $mediaId: ID!,
    $alt: String!
  ) {
    productUpdateMedia(
      productId: $productId,
      media: {
        id: $mediaId,
        alt: $alt
      }
    ) {
      media {
        id
        alt
      }
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to reorder product media
 * 
 * Variables:
 * - productId: Product ID (required)
 * - moves: Array of media moves (required)
 */
export const REORDER_PRODUCT_MEDIA = `
  mutation ReorderProductMedia(
    $productId: ID!,
    $moves: [ProductMediaMovesInput!]!
  ) {
    productReorderMedia(
      productId: $productId,
      moves: $moves
    ) {
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to create product variants in bulk
 * 
 * Variables:
 * - productId: Product ID (required)
 * - variants: Array of variant inputs (required)
 */
export const BULK_CREATE_PRODUCT_VARIANTS = `
  mutation BulkCreateProductVariants(
    $productId: ID!,
    $variants: [ProductVariantsBulkInput!]!
  ) {
    productVariantsBulkCreate(
      productId: $productId,
      variants: $variants
    ) {
      product {
        id
      }
      productVariants {
        id
        title
        sku
        price
        compareAtPrice
        inventoryQuantity
        selectedOptions {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to update product variants in bulk
 * 
 * Variables:
 * - productId: Product ID (required)
 * - variants: Array of variant update inputs (required)
 */
export const BULK_UPDATE_PRODUCT_VARIANTS = `
  mutation BulkUpdateProductVariants(
    $productId: ID!,
    $variants: [ProductVariantsBulkInput!]!
  ) {
    productVariantsBulkUpdate(
      productId: $productId,
      variants: $variants
    ) {
      product {
        id
      }
      productVariants {
        id
        title
        sku
        price
        compareAtPrice
        inventoryQuantity
        selectedOptions {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to delete product variants in bulk
 * 
 * Variables:
 * - productId: Product ID (required)
 * - variantIds: Array of variant IDs to delete (required)
 */
export const BULK_DELETE_PRODUCT_VARIANTS = `
  mutation BulkDeleteProductVariants(
    $productId: ID!,
    $variantIds: [ID!]!
  ) {
    productVariantsBulkDelete(
      productId: $productId,
      variantIds: $variantIds
    ) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to reorder product variants
 * 
 * Variables:
 * - productId: Product ID (required)
 * - moves: Array of variant moves (required)
 */
export const REORDER_PRODUCT_VARIANTS = `
  mutation ReorderProductVariants(
    $productId: ID!,
    $moves: [ProductVariantPositionInput!]!
  ) {
    productVariantsBulkReorder(
      productId: $productId,
      moves: $moves
    ) {
      productVariants {
        id
        position
      }
      userErrors {
        field
        message
      }
    }
  }
`;
