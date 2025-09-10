# JSONSchema: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem JSONSchema Solves

In modern TypeScript applications, we need JSON Schema documents for API documentation, validation in different systems, and interoperability with non-TypeScript tools. Traditionally, this means maintaining separate schema definitions alongside your TypeScript types.

```typescript
// Traditional approach - manual JSON Schema definition
const userJsonSchema = {
  type: "object",
  required: ["id", "email", "age"],
  properties: {
    id: { type: "string" },
    email: { type: "string", format: "email" },
    age: { type: "number", minimum: 0 },
    role: { type: "string", enum: ["admin", "user"] }
  },
  additionalProperties: false
}

// Separate TypeScript interface
interface User {
  id: string
  email: string
  age: number
  role: 'admin' | 'user'
}
```

This approach leads to:
- **Schema Drift** - JSON Schema and TypeScript types become out of sync
- **Duplication** - Same data structure defined multiple times
- **Maintenance Burden** - Changes require updates in multiple places
- **No Type Safety** - JSON Schema definitions aren't type-checked
- **Complex Validation** - Hard to express refined validation rules

### The JSONSchema Solution

Effect's JSONSchema module automatically generates JSON Schema documents from your Effect schemas, ensuring perfect synchronization and type safety.

```typescript
import { JSONSchema, Schema } from "effect"

// Define once with full type safety and validation
const User = Schema.Struct({
  id: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.nonNegative()),
  role: Schema.Literal("admin", "user")
})

// Generate JSON Schema automatically
const userJsonSchema = JSONSchema.make(User)

// TypeScript types are automatically inferred
type User = Schema.Schema.Type<typeof User>
```

### Key Concepts

**JSON Schema Generation**: Automatically converts Effect schemas to standard JSON Schema Draft-07 format with proper type definitions and validation rules.

**Refinement Inclusion**: Captures schema refinements (filters, validations) as JSON Schema constraints while stopping at transformations.

**Reference Management**: Handles complex schemas with `$defs` references for reusable components and recursive structures.

## Basic Usage Patterns

### Pattern 1: Simple Schema Generation

```typescript
import { JSONSchema, Schema } from "effect"

// Basic primitive schemas
const StringSchema = Schema.String
const NumberSchema = Schema.Number
const BooleanSchema = Schema.Boolean

// Generate JSON Schema
console.log(JSONSchema.make(StringSchema))
// Output: { "$schema": "http://json-schema.org/draft-07/schema#", "type": "string" }

console.log(JSONSchema.make(NumberSchema))
// Output: { "$schema": "http://json-schema.org/draft-07/schema#", "type": "number" }
```

### Pattern 2: Struct Schema Generation

```typescript
import { JSONSchema, Schema } from "effect"

// Define a product schema
const Product = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number,
  inStock: Schema.Boolean
})

const productJsonSchema = JSONSchema.make(Product)

console.log(JSON.stringify(productJsonSchema, null, 2))
/*
Output:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "price", "inStock"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "price": { "type": "number" },
    "inStock": { "type": "boolean" }
  },
  "additionalProperties": false
}
*/
```

### Pattern 3: Schema with Validations

```typescript
import { JSONSchema, Schema } from "effect"

// Schema with built-in validations
const User = Schema.Struct({
  email: Schema.String.pipe(
    Schema.minLength(5),
    Schema.maxLength(100),
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ),
  age: Schema.Number.pipe(
    Schema.int(),
    Schema.between(0, 120)
  ),
  username: Schema.String.pipe(
    Schema.minLength(3),
    Schema.maxLength(20),
    Schema.pattern(/^[a-zA-Z0-9_]+$/)
  )
})

const userJsonSchema = JSONSchema.make(User)

console.log(JSON.stringify(userJsonSchema, null, 2))
/*
Output includes validation constraints:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["email", "age", "username"],
  "properties": {
    "email": {
      "type": "string",
      "minLength": 5,
      "maxLength": 100,
      "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 120
    },
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$"
    }
  },
  "additionalProperties": false
}
*/
```

## Real-World Examples

### Example 1: E-commerce API Schema

Building JSON Schema for an e-commerce product catalog API with complex validation rules.

```typescript
import { JSONSchema, Schema } from "effect"

// Define reusable schemas with identifiers
const Currency = Schema.Literal("USD", "EUR", "GBP", "JPY").annotations({
  identifier: "Currency",
  title: "Currency Code",
  description: "ISO 4217 currency code"
})

const Price = Schema.Struct({
  amount: Schema.Number.pipe(
    Schema.nonNegative(),
    Schema.multipleOf(0.01)
  ),
  currency: Currency
}).annotations({
  identifier: "Price",
  title: "Price Information"
})

const Category = Schema.Struct({
  id: Schema.String.pipe(Schema.pattern(/^cat_[a-zA-Z0-9]+$/)),
  name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  slug: Schema.String.pipe(Schema.pattern(/^[a-z0-9-]+$/))
}).annotations({
  identifier: "Category",
  title: "Product Category"
})

const Product = Schema.Struct({
  id: Schema.String.pipe(Schema.pattern(/^prod_[a-zA-Z0-9]+$/)),
  name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(200)),
  description: Schema.String.pipe(Schema.maxLength(2000)),
  price: Price,
  category: Category,
  tags: Schema.Array(Schema.String).pipe(Schema.maxItems(10)),
  inStock: Schema.Boolean,
  stockQuantity: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  images: Schema.Array(Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/))).pipe(
    Schema.minItems(1),
    Schema.maxItems(5)
  ),
  metadata: Schema.Record({
    key: Schema.String,
    value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean)
  })
}).annotations({
  title: "Product",
  description: "E-commerce product with full details"
})

// Generate comprehensive JSON Schema
const productApiSchema = JSONSchema.make(Product)

console.log(JSON.stringify(productApiSchema, null, 2))
/*
Generates a complete JSON Schema with:
- Reusable component definitions in $defs
- Complex validation rules
- Proper references and constraints
- Full OpenAPI compatibility
*/
```

### Example 2: User Registration API with Conditional Fields

Creating a JSON Schema for user registration with conditional validation based on user type.

```typescript
import { JSONSchema, Schema } from "effect"

// Base user information
const BaseUser = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    Schema.maxLength(320)
  ),
  password: Schema.String.pipe(
    Schema.minLength(8),
    Schema.maxLength(128),
    Schema.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  ),
  firstName: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(50)),
  lastName: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(50)),
  dateOfBirth: Schema.String.pipe(
    Schema.pattern(/^\d{4}-\d{2}-\d{2}$/)
  )
}).annotations({
  identifier: "BaseUser"
})

// Individual user schema
const IndividualUser = BaseUser.pipe(
  Schema.extend(Schema.Struct({
    userType: Schema.Literal("individual"),
    phone: Schema.optional(Schema.String.pipe(
      Schema.pattern(/^\+?[1-9]\d{1,14}$/)
    ))
  }))
).annotations({
  identifier: "IndividualUser",
  title: "Individual User Registration"
})

// Business user schema
const BusinessUser = BaseUser.pipe(
  Schema.extend(Schema.Struct({
    userType: Schema.Literal("business"),
    companyName: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(200)),
    taxId: Schema.String.pipe(Schema.pattern(/^[A-Z0-9-]+$/)),
    businessPhone: Schema.String.pipe(
      Schema.pattern(/^\+?[1-9]\d{1,14}$/)
    ),
    businessAddress: Schema.Struct({
      street: Schema.String.pipe(Schema.maxLength(200)),
      city: Schema.String.pipe(Schema.maxLength(100)),
      state: Schema.String.pipe(Schema.maxLength(100)),
      zipCode: Schema.String.pipe(Schema.pattern(/^\d{5}(-\d{4})?$/)),
      country: Schema.String.pipe(Schema.length(2))
    })
  }))
).annotations({
  identifier: "BusinessUser",
  title: "Business User Registration"
})

// Union of user types
const UserRegistration = Schema.Union(IndividualUser, BusinessUser).annotations({
  title: "User Registration Request",
  description: "Registration data for individual or business users"
})

const registrationSchema = JSONSchema.make(UserRegistration)

// This generates a sophisticated JSON Schema with:
// - Discriminated unions based on userType
// - Conditional required fields
// - Complex validation patterns
// - Reusable component definitions
```

### Example 3: Configuration Schema with Environment Variables

Building a JSON Schema for application configuration that supports environment-specific overrides.

```typescript
import { JSONSchema, Schema } from "effect"

// Database configuration
const DatabaseConfig = Schema.Struct({
  host: Schema.String.annotations({
    title: "Database Host",
    description: "Database server hostname or IP address",
    default: "localhost"
  }),
  port: Schema.Number.pipe(
    Schema.int(),
    Schema.between(1, 65535)
  ).annotations({
    title: "Database Port",
    default: 5432
  }),
  database: Schema.String.annotations({
    title: "Database Name"
  }),
  username: Schema.String.annotations({
    title: "Database Username"
  }),
  password: Schema.String.annotations({
    title: "Database Password",
    format: "password"
  }),
  ssl: Schema.Boolean.annotations({
    title: "Enable SSL",
    default: false
  }),
  poolSize: Schema.Number.pipe(
    Schema.int(),
    Schema.between(1, 100)
  ).annotations({
    title: "Connection Pool Size",
    default: 10
  })
}).annotations({
  identifier: "DatabaseConfig",
  title: "Database Configuration"
})

// Redis configuration
const RedisConfig = Schema.Struct({
  host: Schema.String.annotations({
    title: "Redis Host",
    default: "localhost"
  }),
  port: Schema.Number.pipe(
    Schema.int(),
    Schema.between(1, 65535)
  ).annotations({
    title: "Redis Port",
    default: 6379
  }),
  password: Schema.optional(Schema.String).annotations({
    title: "Redis Password"
  }),
  db: Schema.Number.pipe(
    Schema.int(),
    Schema.between(0, 15)
  ).annotations({
    title: "Redis Database Number",
    default: 0
  })
}).annotations({
  identifier: "RedisConfig",
  title: "Redis Configuration"
})

// Server configuration
const ServerConfig = Schema.Struct({
  port: Schema.Number.pipe(
    Schema.int(),
    Schema.between(1000, 65535)
  ).annotations({
    title: "Server Port",
    default: 3000
  }),
  host: Schema.String.annotations({
    title: "Server Host",
    default: "0.0.0.0"
  }),
  cors: Schema.Struct({
    enabled: Schema.Boolean.annotations({
      title: "Enable CORS",
      default: true
    }),
    origins: Schema.Array(Schema.String).annotations({
      title: "Allowed Origins",
      examples: ["http://localhost:3000", "https://example.com"]
    })
  }).annotations({
    title: "CORS Configuration"
  })
}).annotations({
  identifier: "ServerConfig",
  title: "Server Configuration"
})

// Main application configuration
const AppConfig = Schema.Struct({
  environment: Schema.Literal("development", "staging", "production").annotations({
    title: "Environment",
    description: "Application environment"
  }),
  logLevel: Schema.Literal("debug", "info", "warn", "error").annotations({
    title: "Log Level",
    default: "info"
  }),
  database: DatabaseConfig,
  redis: RedisConfig,
  server: ServerConfig,
  features: Schema.Record({
    key: Schema.String,
    value: Schema.Boolean
  }).annotations({
    title: "Feature Flags",
    description: "Runtime feature toggles",
    examples: [{ "newUserFlow": true, "betaFeatures": false }]
  })
}).annotations({
  title: "Application Configuration",
  description: "Complete application configuration schema"
})

const configSchema = JSONSchema.make(AppConfig)

// Generate JSON Schema for configuration validation
// Perfect for:
// - Configuration file validation
// - Environment variable mapping
// - Infrastructure as Code tools
// - Configuration UI generation
```

## Advanced Features Deep Dive

### Feature 1: Custom JSON Schema Annotations

When working with types that don't have direct JSON Schema representation, you can provide custom annotations.

#### Basic Custom Annotations

```typescript
import { JSONSchema, Schema } from "effect"

// Custom annotation for BigInt
const CustomBigInt = Schema.BigIntFromSelf.annotations({
  jsonSchema: {
    type: "string",
    pattern: "^-?\\d+$",
    title: "Big Integer",
    description: "Large integer represented as string"
  }
})

const SchemaWithBigInt = Schema.Struct({
  id: Schema.String,
  largeNumber: CustomBigInt
})

const jsonSchema = JSONSchema.make(SchemaWithBigInt)
```

#### Advanced Custom Annotations with References

```typescript
import { JSONSchema, Schema } from "effect"

// Custom geolocation type
const Coordinates = Schema.Tuple(Schema.Number, Schema.Number).annotations({
  identifier: "Coordinates",
  jsonSchema: {
    type: "array",
    minItems: 2,
    maxItems: 2,
    items: { type: "number" },
    title: "GPS Coordinates",
    description: "Latitude and longitude pair",
    examples: [[40.7128, -74.0060]]
  }
})

const Location = Schema.Struct({
  name: Schema.String,
  coordinates: Coordinates,
  accuracy: Schema.optional(Schema.Number.pipe(Schema.nonNegative()))
}).annotations({
  title: "Location Information"
})
```

### Feature 2: Refinement Handling and Merging

JSON Schema generation includes refinements as validation constraints and merges multiple refinements intelligently.

#### Multiple Refinement Merging

```typescript
import { JSONSchema, Schema } from "effect"

// Multiple refinements are merged into allOf constraints
const RestrictedString = Schema.String.pipe(
  Schema.minLength(5, {
    jsonSchema: { minLength: 5 }
  }),
  Schema.maxLength(20, {
    jsonSchema: { maxLength: 20 }
  }),
  Schema.pattern(/^[A-Z]/, {
    jsonSchema: { pattern: "^[A-Z]" }
  }),
  Schema.filter((s) => !s.includes("bad"), {
    jsonSchema: { 
      not: { 
        pattern: "bad",
        description: "Must not contain 'bad'"
      }
    }
  })
)

const refinedSchema = JSONSchema.make(RestrictedString)
/*
Generates JSON Schema with merged constraints:
{
  "type": "string",
  "minLength": 5,
  "maxLength": 20,
  "pattern": "^[A-Z]",
  "allOf": [
    { "not": { "pattern": "bad" } }
  ]
}
*/
```

#### Complex Numeric Refinements

```typescript
import { JSONSchema, Schema } from "effect"

const BusinessMetric = Schema.Number.pipe(
  Schema.finite(),
  Schema.nonNegative(),
  Schema.lessThanOrEqualTo(1000000),
  Schema.multipleOf(0.01)
).annotations({
  title: "Business Metric",
  description: "Financial metric with precision constraints"
})

// Generates comprehensive numeric constraints
const metricSchema = JSONSchema.make(BusinessMetric)
```

### Feature 3: Recursive and Self-Referencing Schemas

Handle complex recursive data structures with proper reference management.

#### Tree Structure Schema

```typescript
import { JSONSchema, Schema } from "effect"

interface TreeNode {
  readonly value: string
  readonly children: ReadonlyArray<TreeNode>
}

const TreeNode: Schema.Schema<TreeNode> = Schema.Struct({
  value: Schema.String,
  children: Schema.Array(
    Schema.suspend(() => TreeNode)
  )
}).annotations({
  identifier: "TreeNode",
  title: "Tree Node",
  description: "Recursive tree structure"
})

const treeSchema = JSONSchema.make(TreeNode)
/*
Generates schema with proper $defs reference:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$defs": {
    "TreeNode": {
      "type": "object",
      "required": ["value", "children"],
      "properties": {
        "value": { "type": "string" },
        "children": {
          "type": "array",
          "items": { "$ref": "#/$defs/TreeNode" }
        }
      },
      "additionalProperties": false
    }
  },
  "$ref": "#/$defs/TreeNode"
}
*/
```

#### Mutually Recursive Schemas

```typescript
import { JSONSchema, Schema } from "effect"

interface Author {
  readonly name: string
  readonly books: ReadonlyArray<Book>
}

interface Book {
  readonly title: string
  readonly author: Author
}

const Author: Schema.Schema<Author> = Schema.Struct({
  name: Schema.String,
  books: Schema.Array(Schema.suspend(() => Book))
}).annotations({
  identifier: "Author"
})

const Book: Schema.Schema<Book> = Schema.Struct({
  title: Schema.String,
  author: Author
}).annotations({
  identifier: "Book"
})

// Either schema can be the root
const librarySchema = JSONSchema.make(Book)
```

## Practical Patterns & Best Practices

### Pattern 1: Reusable Component Library

Create a library of reusable schema components with consistent JSON Schema generation.

```typescript
import { JSONSchema, Schema } from "effect"

// Common field types with validation
const EmailField = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.maxLength(320)
).annotations({
  identifier: "Email",
  title: "Email Address",
  description: "Valid email address",
  format: "email"
})

const PhoneField = Schema.String.pipe(
  Schema.pattern(/^\+?[1-9]\d{1,14}$/)
).annotations({
  identifier: "Phone",
  title: "Phone Number",
  description: "International phone number format"
})

const UrlField = Schema.String.pipe(
  Schema.pattern(/^https?:\/\/.+/)
).annotations({
  identifier: "URL", 
  title: "URL",
  description: "Valid HTTP or HTTPS URL",
  format: "uri"
})

// Reusable address schema
const Address = Schema.Struct({
  street: Schema.String.pipe(Schema.maxLength(200)),
  city: Schema.String.pipe(Schema.maxLength(100)),
  state: Schema.String.pipe(Schema.maxLength(100)),
  zipCode: Schema.String.pipe(Schema.pattern(/^\d{5}(-\d{4})?$/)),
  country: Schema.String.pipe(Schema.length(2))
}).annotations({
  identifier: "Address",
  title: "Mailing Address"
})

// Helper function to create consistent schemas
const makeEntitySchema = <T extends Record<string, any>>(
  name: string,
  fields: T,
  description?: string
) => {
  return Schema.Struct({
    id: Schema.String.pipe(Schema.pattern(new RegExp(`^${name.toLowerCase()}_[a-zA-Z0-9]+$`))),
    createdAt: Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)),
    updatedAt: Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)),
    ...fields
  }).annotations({
    identifier: name,
    title: name,
    description: description || `${name} entity`
  })
}

// Use the helper to create consistent entities
const Customer = makeEntitySchema("Customer", {
  email: EmailField,
  phone: PhoneField,
  firstName: Schema.String.pipe(Schema.maxLength(50)),
  lastName: Schema.String.pipe(Schema.maxLength(50)),
  address: Address
}, "Customer information")

const customerSchema = JSONSchema.make(Customer)
```

### Pattern 2: API Response Schema Generator

Generate consistent API response schemas with metadata and pagination.

```typescript
import { JSONSchema, Schema } from "effect"

// Generic pagination metadata
const PaginationMeta = Schema.Struct({
  page: Schema.Number.pipe(Schema.int(), Schema.positive()),
  pageSize: Schema.Number.pipe(Schema.int(), Schema.between(1, 100)),
  totalItems: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  totalPages: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  hasNext: Schema.Boolean,
  hasPrevious: Schema.Boolean
}).annotations({
  identifier: "PaginationMeta",
  title: "Pagination Metadata"
})

// Generic API response wrapper
const ApiResponse = <T extends Schema.Schema<any, any, any>>(
  dataSchema: T,
  name: string
) => {
  return Schema.Struct({
    success: Schema.Boolean,
    data: dataSchema,
    meta: Schema.optional(PaginationMeta),
    timestamp: Schema.String.pipe(
      Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    )
  }).annotations({
    identifier: `${name}Response`,
    title: `${name} API Response`
  })
}

// Error response schema
const ErrorResponse = Schema.Struct({
  success: Schema.Literal(false),
  error: Schema.Struct({
    code: Schema.String,
    message: Schema.String,
    details: Schema.optional(Schema.Record({
      key: Schema.String,
      value: Schema.Unknown
    }))
  }),
  timestamp: Schema.String.pipe(
    Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
  )
}).annotations({
  identifier: "ErrorResponse",
  title: "API Error Response"
})

// Example usage
const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String
}).annotations({
  identifier: "User"
})

const UserListResponse = ApiResponse(Schema.Array(User), "UserList")
const SingleUserResponse = ApiResponse(User, "User")

// Generate schemas for OpenAPI documentation
const userListSchema = JSONSchema.make(UserListResponse)
const errorSchema = JSONSchema.make(ErrorResponse)
```

### Pattern 3: Configuration Schema with Environment Overrides

Create flexible configuration schemas that support environment-specific overrides.

```typescript
import { JSONSchema, Schema } from "effect"

// Environment-aware field helper
const envField = <T extends Schema.Schema<any, any, any>>(
  schema: T,
  envKey: string,
  description: string
) => {
  return schema.annotations({
    title: `${envKey} Configuration`,
    description: `${description} (Environment: ${envKey})`,
    examples: [`$\{${envKey}\}`]
  })
}

// Configuration with environment variable mapping
const DatabaseConfig = Schema.Struct({
  host: envField(
    Schema.String,
    "DB_HOST",
    "Database host address"
  ).annotations({ default: "localhost" }),
  
  port: envField(
    Schema.Number.pipe(Schema.int(), Schema.between(1, 65535)),
    "DB_PORT", 
    "Database port number"
  ).annotations({ default: 5432 }),
  
  database: envField(
    Schema.String,
    "DB_NAME",
    "Database name"
  ),
  
  username: envField(
    Schema.String,
    "DB_USER",
    "Database username"
  ),
  
  password: envField(
    Schema.String,
    "DB_PASSWORD",
    "Database password"
  ).annotations({ format: "password" })
}).annotations({
  identifier: "DatabaseConfig",
  title: "Database Configuration"
})

// Generate JSON Schema for configuration validation tools
const configSchema = JSONSchema.make(DatabaseConfig)
```

## Integration Examples

### Integration with Express.js and OpenAPI

Generate OpenAPI specifications from Effect schemas for Express.js APIs.

```typescript
import { JSONSchema, Schema } from "effect"
import express from "express"

// API endpoint schemas
const CreateUserRequest = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.int(), Schema.between(13, 120))
}).annotations({
  title: "Create User Request",
  description: "Request body for creating a new user"
})

const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  age: Schema.Number,
  createdAt: Schema.String
}).annotations({
  identifier: "User",
  title: "User"
})

const UserResponse = Schema.Struct({
  success: Schema.Boolean,
  data: User
}).annotations({
  title: "User Response"
})

// Generate OpenAPI component schemas
const openApiComponents = {
  schemas: {
    CreateUserRequest: JSONSchema.make(CreateUserRequest),
    User: JSONSchema.make(User),
    UserResponse: JSONSchema.make(UserResponse)
  }
}

// Express middleware for request validation
const validateRequest = <T extends Schema.Schema<any, any, any>>(schema: T) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = Schema.decodeUnknownEither(schema)(req.body)
    
    if (result._tag === "Left") {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: result.left
        }
      })
    }
    
    req.body = result.right
    next()
  }
}

// Express route with validation
const app = express()
app.use(express.json())

app.post('/users', validateRequest(CreateUserRequest), (req, res) => {
  // TypeScript knows req.body is validated CreateUserRequest
  const userData = req.body
  
  // Create user logic here...
  const newUser = {
    id: `user_${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString()
  }
  
  res.json({
    success: true,
    data: newUser
  })
})

// Generate complete OpenAPI specification
const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "User API",
    version: "1.0.0"
  },
  components: openApiComponents,
  paths: {
    "/users": {
      post: {
        summary: "Create a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" }
              }
            }
          }
        }
      }
    }
  }
}
```

### Integration with Fastify and Swagger

Use Effect JSONSchema with Fastify's built-in JSON Schema validation.

```typescript
import { JSONSchema, Schema } from "effect"
import Fastify from "fastify"

// Product schema for e-commerce API
const Product = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(200)),
  description: Schema.String.pipe(Schema.maxLength(1000)),
  price: Schema.Number.pipe(Schema.positive(), Schema.multipleOf(0.01)),
  category: Schema.String,
  tags: Schema.Array(Schema.String).pipe(Schema.maxItems(10)),
  inStock: Schema.Boolean
}).annotations({
  identifier: "Product"
})

const CreateProductRequest = Product

const ProductResponse = Schema.Struct({
  id: Schema.String,
  ...Product.fields,
  createdAt: Schema.String,
  updatedAt: Schema.String
}).annotations({
  identifier: "ProductResponse"
})

// Generate JSON Schemas for Fastify
const createProductSchema = JSONSchema.make(CreateProductRequest)
const productResponseSchema = JSONSchema.make(ProductResponse)

// Remove Effect-specific properties for Fastify compatibility
const cleanSchema = (schema: any) => {
  const cleaned = { ...schema }
  delete cleaned.$schema
  return cleaned
}

const fastify = Fastify({
  logger: true
})

// Register Swagger for API documentation
await fastify.register(require('@fastify/swagger'), {
  swagger: {
    info: {
      title: 'Product API',
      description: 'E-commerce product management API',
      version: '1.0.0'
    }
  }
})

await fastify.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs'
})

// Define route with JSON Schema validation
fastify.post('/products', {
  schema: {
    body: cleanSchema(createProductSchema),
    response: {
      201: cleanSchema(productResponseSchema)
    }
  },
  handler: async (request, reply) => {
    // Fastify automatically validates request.body against schema
    const productData = request.body
    
    // Create product logic...
    const newProduct = {
      id: `prod_${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    reply.code(201).send(newProduct)
  }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log('Server running on http://localhost:3000')
    console.log('API docs available at http://localhost:3000/docs')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

### Testing Strategies with Generated Schemas

Use JSON Schema for comprehensive API testing and validation.

```typescript
import { JSONSchema, Schema } from "effect"
import Ajv from "ajv"
import addFormats from "ajv-formats"

// Test data schemas
const User = Schema.Struct({
  id: Schema.String.pipe(Schema.pattern(/^user_\d+$/)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  name: Schema.String.pipe(Schema.minLength(1)),
  age: Schema.Number.pipe(Schema.int(), Schema.between(13, 120)),
  isActive: Schema.Boolean
}).annotations({
  identifier: "User"
})

const ApiResponse = <T extends Schema.Schema<any, any, any>>(dataSchema: T) => {
  return Schema.Struct({
    success: Schema.Boolean,
    data: dataSchema,
    timestamp: Schema.String
  })
}

const UserResponse = ApiResponse(User)
const UserListResponse = ApiResponse(Schema.Array(User))

// Generate schemas for validation
const userSchema = JSONSchema.make(User)
const userResponseSchema = JSONSchema.make(UserResponse)
const userListResponseSchema = JSONSchema.make(UserListResponse)

// Setup AJV validator
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

// Compile validators
const validateUser = ajv.compile(userSchema)
const validateUserResponse = ajv.compile(userResponseSchema)
const validateUserListResponse = ajv.compile(userListResponseSchema)

// Test helper functions
const generateTestUser = () => ({
  id: `user_${Math.floor(Math.random() * 1000)}`,
  email: "test@example.com",
  name: "Test User",
  age: 25,
  isActive: true
})

const generateApiResponse = (data: any) => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
})

// Property-based testing helpers
const generateRandomUser = () => ({
  id: `user_${Math.floor(Math.random() * 10000)}`,
  email: `user${Math.floor(Math.random() * 1000)}@example.com`,
  name: `User ${Math.floor(Math.random() * 100)}`,
  age: Math.floor(Math.random() * 100) + 13,
  isActive: Math.random() > 0.5
})

// Test suite
describe('API Schema Validation', () => {
  test('valid user passes validation', () => {
    const user = generateTestUser()
    expect(validateUser(user)).toBe(true)
  })
  
  test('invalid user fails validation', () => {
    const invalidUser = {
      id: "invalid_id_format",
      email: "not-an-email",
      name: "",
      age: -5,
      isActive: "not-boolean"
    }
    
    expect(validateUser(invalidUser)).toBe(false)
    expect(validateUser.errors).toBeDefined()
  })
  
  test('API response validation', () => {
    const user = generateTestUser()
    const response = generateApiResponse(user)
    
    expect(validateUserResponse(response)).toBe(true)
  })
  
  test('user list response validation', () => {
    const users = Array.from({ length: 5 }, generateTestUser)
    const response = generateApiResponse(users)
    
    expect(validateUserListResponse(response)).toBe(true)
  })
  
  test('property-based testing', () => {
    // Test 100 random users
    for (let i = 0; i < 100; i++) {
      const randomUser = generateRandomUser()
      const isValid = validateUser(randomUser)
      
      if (!isValid) {
        console.log('Invalid user:', randomUser)
        console.log('Errors:', validateUser.errors)
      }
      
      expect(isValid).toBe(true)
    }
  })
})

// Mock API testing
const mockApiCall = async (endpoint: string, data?: any) => {
  // Simulate API call
  return generateApiResponse(data || generateTestUser())
}

describe('Mock API Integration', () => {
  test('user creation endpoint', async () => {
    const userData = generateTestUser()
    const response = await mockApiCall('/users', userData)
    
    expect(validateUserResponse(response)).toBe(true)
  })
  
  test('user list endpoint', async () => {
    const response = await mockApiCall('/users')
    // Assuming the mock returns a list
    response.data = [response.data]
    
    expect(validateUserListResponse(response)).toBe(true)
  })
})
```

## Conclusion

JSONSchema provides automatic JSON Schema generation from Effect schemas, eliminating schema drift, reducing maintenance burden, and ensuring type safety across your entire application stack.

Key benefits:
- **Single Source of Truth**: Define schemas once, use everywhere with guaranteed consistency
- **Type Safety**: Full TypeScript integration with compile-time validation of schema definitions
- **Standards Compliance**: Generates standard JSON Schema Draft-07 compatible documents for maximum interoperability

JSONSchema is essential when building APIs that need documentation, validation across multiple platforms, or integration with non-TypeScript systems. It bridges the gap between Effect's powerful type system and the broader ecosystem of JSON Schema tools.