/**
 * ValidationService.ts
 * Provides validation for Shopify resource data
 */

import { ShopifyResourceType } from './types/ShopifyResourceTypes';

/**
 * Schema definition for a resource field
 */
export interface FieldSchema {
  /** Field type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'id';
  /** Whether the field is required */
  required?: boolean;
  /** Minimum value/length */
  min?: number;
  /** Maximum value/length */
  max?: number;
  /** Pattern for string validation */
  pattern?: RegExp;
  /** Allowed values for enum type */
  enum?: any[];
  /** Nested schema for object type */
  schema?: Record<string, FieldSchema>;
  /** Item schema for array type */
  items?: FieldSchema;
  /** Custom validation function */
  validate?: (value: any) => boolean | string;
}

/**
 * Schema definition for a resource
 */
export interface ResourceSchema {
  /** Resource fields */
  fields: Record<string, FieldSchema>;
  /** Required fields */
  required?: string[];
  /** Custom validation function */
  validate?: (data: any) => boolean | string;
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field path */
  path: string;
  /** Error message */
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
}

/**
 * Service for validating Shopify resource data
 */
export class ValidationService {
  /** Resource schemas */
  private schemas: Map<ShopifyResourceType, ResourceSchema> = new Map();
  
  /**
   * Creates a new ValidationService
   */
  constructor() {
    this.initializeSchemas();
  }
  
  /**
   * Validates data against a resource schema
   * 
   * @param resourceType - Type of resource to validate
   * @param data - Data to validate
   * @returns Validation result
   */
  validate(resourceType: ShopifyResourceType, data: any): ValidationResult {
    const schema = this.schemas.get(resourceType);
    
    if (!schema) {
      return {
        valid: false,
        errors: [{ path: '', message: `No schema found for resource type: ${resourceType}` }]
      };
    }
    
    const errors: ValidationError[] = [];
    
    // Validate required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (data[field] === undefined || data[field] === null) {
          errors.push({
            path: field,
            message: `Field is required`
          });
        }
      }
    }
    
    // Validate fields
    for (const [field, fieldSchema] of Object.entries(schema.fields)) {
      if (data[field] !== undefined && data[field] !== null) {
        const fieldErrors = this.validateField(data[field], fieldSchema, field);
        errors.push(...fieldErrors);
      } else if (fieldSchema.required) {
        errors.push({
          path: field,
          message: `Field is required`
        });
      }
    }
    
    // Apply custom validation if defined
    if (schema.validate) {
      const result = schema.validate(data);
      if (typeof result === 'string') {
        errors.push({
          path: '',
          message: result
        });
      } else if (result === false) {
        errors.push({
          path: '',
          message: 'Custom validation failed'
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validates a field against its schema
   * 
   * @param value - Field value
   * @param schema - Field schema
   * @param path - Field path
   * @returns Validation errors
   */
  private validateField(value: any, schema: FieldSchema, path: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Type validation
    if (!this.validateType(value, schema.type)) {
      errors.push({
        path,
        message: `Expected type ${schema.type}, got ${typeof value}`
      });
      return errors; // Stop validation if type is wrong
    }
    
    // String validation
    if (schema.type === 'string') {
      if (schema.min !== undefined && value.length < schema.min) {
        errors.push({
          path,
          message: `String length must be at least ${schema.min}`
        });
      }
      
      if (schema.max !== undefined && value.length > schema.max) {
        errors.push({
          path,
          message: `String length must be at most ${schema.max}`
        });
      }
      
      if (schema.pattern && !schema.pattern.test(value)) {
        errors.push({
          path,
          message: `String must match pattern ${schema.pattern}`
        });
      }
    }
    
    // Number validation
    if (schema.type === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        errors.push({
          path,
          message: `Number must be at least ${schema.min}`
        });
      }
      
      if (schema.max !== undefined && value > schema.max) {
        errors.push({
          path,
          message: `Number must be at most ${schema.max}`
        });
      }
    }
    
    // Enum validation
    if (schema.type === 'enum' && schema.enum) {
      if (!schema.enum.includes(value)) {
        errors.push({
          path,
          message: `Value must be one of: ${schema.enum.join(', ')}`
        });
      }
    }
    
    // Array validation
    if (schema.type === 'array' && schema.items) {
      if (schema.min !== undefined && value.length < schema.min) {
        errors.push({
          path,
          message: `Array length must be at least ${schema.min}`
        });
      }
      
      if (schema.max !== undefined && value.length > schema.max) {
        errors.push({
          path,
          message: `Array length must be at most ${schema.max}`
        });
      }
      
      // Validate each item
      for (let i = 0; i < value.length; i++) {
        const itemErrors = this.validateField(value[i], schema.items, `${path}[${i}]`);
        errors.push(...itemErrors);
      }
    }
    
    // Object validation
    if (schema.type === 'object' && schema.schema) {
      for (const [field, fieldSchema] of Object.entries(schema.schema)) {
        if (value[field] !== undefined && value[field] !== null) {
          const fieldErrors = this.validateField(value[field], fieldSchema, `${path}.${field}`);
          errors.push(...fieldErrors);
        } else if (fieldSchema.required) {
          errors.push({
            path: `${path}.${field}`,
            message: `Field is required`
          });
        }
      }
    }
    
    // Custom validation
    if (schema.validate) {
      const result = schema.validate(value);
      if (typeof result === 'string') {
        errors.push({
          path,
          message: result
        });
      } else if (result === false) {
        errors.push({
          path,
          message: 'Custom validation failed'
        });
      }
    }
    
    return errors;
  }
  
  /**
   * Validates a value against a type
   * 
   * @param value - Value to validate
   * @param type - Expected type
   * @returns Whether the value matches the type
   */
  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'enum':
        return true; // Enum values are validated separately
      case 'id':
        return typeof value === 'string' && value.length > 0;
      default:
        return false;
    }
  }
  
  /**
   * Initializes resource schemas
   */
  private initializeSchemas(): void {
    // Product schema
    this.schemas.set(ShopifyResourceType.PRODUCT, {
      fields: {
        title: { type: 'string', required: true, min: 1, max: 255 },
        description: { type: 'string' },
        descriptionHtml: { type: 'string' },
        productType: { type: 'string' },
        vendor: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        status: { type: 'enum', enum: ['ACTIVE', 'ARCHIVED', 'DRAFT'] },
        images: { type: 'array', items: { type: 'object' } },
        variants: { type: 'array', items: { type: 'object' } },
        options: { type: 'array', items: { type: 'object' } },
      },
      required: ['title']
    });
    
    // Customer schema
    this.schemas.set(ShopifyResourceType.CUSTOMER, {
      fields: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { 
          type: 'string', 
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          validate: (value) => {
            return typeof value === 'string' && value.includes('@') ? 
              true : 'Invalid email format';
          }
        },
        phone: { type: 'string' },
        acceptsMarketing: { type: 'boolean' },
        addresses: { type: 'array', items: { type: 'object' } },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['email']
    });
    
    // Order schema
    this.schemas.set(ShopifyResourceType.ORDER, {
      fields: {
        email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        phone: { type: 'string' },
        note: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        lineItems: { 
          type: 'array', 
          items: { 
            type: 'object',
            schema: {
              variantId: { type: 'id' },
              quantity: { type: 'number', min: 1 }
            }
          },
          min: 1
        },
        shippingAddress: { type: 'object' },
        billingAddress: { type: 'object' },
      },
      required: ['lineItems']
    });
    
    // Add more schemas as needed
  }
  
  /**
   * Gets a schema for a resource type
   * 
   * @param resourceType - Resource type
   * @returns Resource schema or undefined if not found
   */
  getSchema(resourceType: ShopifyResourceType): ResourceSchema | undefined {
    return this.schemas.get(resourceType);
  }
  
  /**
   * Gets all available resource types with schemas
   * 
   * @returns Array of resource types
   */
  getAvailableResourceTypes(): ShopifyResourceType[] {
    return Array.from(this.schemas.keys());
  }
}