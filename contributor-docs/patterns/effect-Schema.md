# Schema: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Schema Solves

In modern TypeScript applications, we constantly deal with data from untrusted sources - API requests, form submissions, database queries, configuration files. TypeScript's type system only works at compile time, leaving us vulnerable to runtime type mismatches.

```typescript
// Traditional approach - manual validation
interface User {
  id: string
  email: string
  age: number
  role: 'admin' | 'user'
}

function validateUser(data: unknown): User {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data')
  }
  
  const obj = data as any
  
  if (typeof obj.id !== 'string') {
    throw new Error('Invalid id')
  }
  
  if (typeof obj.email !== 'string' || !obj.email.includes('@')) {
    throw new Error('Invalid email')
  }
  
  if (typeof obj.age !== 'number' || obj.age < 0) {
    throw new Error('Invalid age')
  }
  
  if (obj.role !== 'admin' && obj.role !== 'user') {
    throw new Error('Invalid role')
  }
  
  return obj as User
}

// Using the validator
try {
  const user = validateUser(JSON.parse(requestBody))
  // What about nested objects? Arrays? Optional fields?
  // Error messages are generic and unhelpful
  // No automatic serialization/deserialization
  // No way to transform data during validation
} catch (e) {
  // Poor error handling
  console.error(e.message)
}
```

This approach leads to:
- **Boilerplate explosion** - Manual validation for every field
- **Poor error messages** - Generic errors don't help debugging
- **No composability** - Can't reuse validation logic
- **Type drift** - Interface and validation logic can get out of sync
- **Missing features** - No transformation, serialization, or advanced validation

### The Schema Solution

Schema provides a unified solution for runtime validation, parsing, serialization, and transformation with full TypeScript integration:

```typescript
import { Schema } from "@effect/schema"
import { Effect } from "effect"

// Define once, use everywhere
const User = Schema.Struct({
  id: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.positive()),
  role: Schema.Literal('admin', 'user')
})

// Automatic type inference
type User = Schema.Schema.Type<typeof User>

// Parse with detailed error reporting
const parseUser = Schema.decodeUnknownEither(User)

// Using the schema
const result = parseUser(JSON.parse(requestBody))

if (result._tag === 'Left') {
  // Detailed error information
  console.error(Schema.formatError(result.left))
} else {
  // Fully typed user object
  const user = result.right
}
```

### Key Concepts

**Schema**: A description of a data structure that can validate, parse, and transform values at runtime while maintaining type safety.

**Decoding**: Converting unknown or external data into validated, typed values (parsing).

**Encoding**: Converting typed values back to their external representation (serialization).

**Transformation**: Modifying data during the decode/encode process.

**Refinement**: Adding custom validation logic beyond structural checks.

## Basic Usage Patterns

### Defining Basic Schemas

```typescript
import { Schema } from "@effect/schema"

// Primitive schemas
const Name = Schema.String
const Age = Schema.Number
const IsActive = Schema.Boolean

// Literal schemas for exact values
const Status = Schema.Literal('pending', 'active', 'inactive')

// Arrays and tuples
const Tags = Schema.Array(Schema.String)
const Coordinate = Schema.Tuple(Schema.Number, Schema.Number)

// Objects
const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  email: Schema.optional(Schema.String)
})

// Unions for multiple types
const Id = Schema.Union(Schema.String, Schema.Number)
```

### Parsing and Validation

```typescript
import { Schema } from "@effect/schema"
import { Either, Effect } from "effect"

const Product = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number,
  inStock: Schema.Boolean
})

// Different parsing strategies
// 1. Parse to Either
const parseToEither = Schema.decodeUnknownEither(Product)
const result1 = parseToEither({ id: "123", name: "Laptop", price: 999.99, inStock: true })

// 2. Parse to Effect
const parseToEffect = Schema.decodeUnknown(Product)
const result2 = Effect.runSync(parseToEffect({ id: "123", name: "Laptop", price: 999.99, inStock: true }))

// 3. Parse synchronously (throws on error)
const parseSync = Schema.decodeUnknownSync(Product)
try {
  const product = parseSync({ id: "123", name: "Laptop", price: 999.99, inStock: true })
} catch (e) {
  console.error(Schema.formatError(e))
}
```

### Basic Transformations

```typescript
import { Schema } from "@effect/schema"

// Transform strings to numbers
const StringToNumber = Schema.transform(
  Schema.String,
  Schema.Number,
  {
    decode: (s) => {
      const n = parseFloat(s)
      return isNaN(n) ? Schema.ParseResult.fail(Schema.ParseResult.Type(Schema.Number.ast, s)) : Schema.ParseResult.succeed(n)
    },
    encode: (n) => Schema.ParseResult.succeed(String(n))
  }
)

// Trim whitespace during parsing
const TrimmedString = Schema.transform(
  Schema.String,
  Schema.String,
  {
    decode: (s) => Schema.ParseResult.succeed(s.trim()),
    encode: (s) => Schema.ParseResult.succeed(s)
  }
)

// Parse date strings to Date objects
const DateFromString = Schema.transform(
  Schema.String,
  Schema.Date,
  {
    decode: (s) => {
      const date = new Date(s)
      return isNaN(date.getTime()) 
        ? Schema.ParseResult.fail(Schema.ParseResult.Type(Schema.Date.ast, s))
        : Schema.ParseResult.succeed(date)
    },
    encode: (d) => Schema.ParseResult.succeed(d.toISOString())
  }
)
```

## Real-World Examples

### Example 1: API Request/Response Validation

A complete example of validating API requests and responses with proper error handling:

```typescript
import { Schema } from "@effect/schema"
import { Effect } from "effect"
import * as Http from "@effect/platform/HttpClient"

// Define API schemas
const CreateUserRequest = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => "Invalid email format"
    })
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, { message: () => "Password must be at least 8 characters" })
  ),
  name: Schema.String.pipe(
    Schema.minLength(2, { message: () => "Name must be at least 2 characters" })
  ),
  role: Schema.optional(Schema.Literal('admin', 'user'), { default: () => 'user' })
})

const UserResponse = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
  role: Schema.Literal('admin', 'user'),
  createdAt: Schema.Date,
  updatedAt: Schema.Date
})

const ErrorResponse = Schema.Struct({
  error: Schema.String,
  message: Schema.String,
  statusCode: Schema.Number
})

// API client with validation
class UserAPI {
  constructor(private baseUrl: string) {}

  createUser(data: unknown) {
    return Effect.gen(function* () {
      // Validate request data
      const validData = yield* Schema.decode(CreateUserRequest)(data)
      
      // Make HTTP request
      const response = yield* Http.request.post(`${this.baseUrl}/users`).pipe(
        Http.request.jsonBody(validData),
        Http.client.fetchOk,
        Effect.catchTag("ResponseError", (error) =>
          Effect.gen(function* () {
            const errorBody = yield* Http.response.json(error.response)
            const errorDetails = yield* Schema.decode(ErrorResponse)(errorBody)
            return yield* Effect.fail(new Error(`API Error: ${errorDetails.message}`))
          })
        )
      )
      
      const responseData = yield* Http.response.json(response)
      
      // Validate response
      return yield* Schema.decode(UserResponse)(responseData)
    })
  }

  getUser(id: string) {
    return Effect.gen(function* () {
      const response = yield* Http.request.get(`${this.baseUrl}/users/${id}`).pipe(
        Http.client.fetchOk
      )
      const responseData = yield* Http.response.json(response)
      return yield* Schema.decode(UserResponse)(responseData)
    })
  }
}

// Usage
const api = new UserAPI("https://api.example.com")

const program = api.createUser({
  email: "john@example.com",
  password: "securepass123",
  name: "John Doe"
}).pipe(
  Effect.tap((user) => Effect.log(`Created user: ${user.id}`)),
  Effect.catchAll((error) => Effect.log(`Failed to create user: ${error.message}`))
)
```

### Example 2: Form Validation with Progressive Enhancement

Building a form validation system that provides immediate feedback:

```typescript
import { Schema } from "@effect/schema"
import { Either, Option } from "effect"

// Form schema with custom error messages
const RegistrationForm = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3, { message: () => "Username must be at least 3 characters" }),
    Schema.maxLength(20, { message: () => "Username must be at most 20 characters" }),
    Schema.pattern(/^[a-zA-Z0-9_]+$/, { 
      message: () => "Username can only contain letters, numbers, and underscores" 
    })
  ),
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => "Please enter a valid email address"
    })
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, { message: () => "Password must be at least 8 characters" }),
    Schema.pattern(/(?=.*[a-z])/, { message: () => "Password must contain a lowercase letter" }),
    Schema.pattern(/(?=.*[A-Z])/, { message: () => "Password must contain an uppercase letter" }),
    Schema.pattern(/(?=.*\d)/, { message: () => "Password must contain a number" })
  ),
  confirmPassword: Schema.String,
  acceptTerms: Schema.Literal(true, { 
    message: () => "You must accept the terms and conditions" 
  })
}).pipe(
  Schema.filter((data) => {
    if (data.password !== data.confirmPassword) {
      return Schema.ParseResult.fail(
        Schema.ParseResult.Key('confirmPassword', 
          Schema.ParseResult.Missing(Schema.String.ast)
        )
      )
    }
    return Schema.ParseResult.succeed(data)
  }, {
    message: () => ({ confirmPassword: ["Passwords must match"] })
  })
)

// Helper to extract field errors
function getFieldErrors(error: Schema.ParseError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  
  const formatted = Schema.formatError(error)
  const issues = formatted.errors || []
  
  for (const issue of issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }
  
  return errors
}

// Form validation hook
function useFormValidation<T>(schema: Schema.Schema<T, unknown>) {
  const validate = Schema.decodeUnknownEither(schema)
  
  return {
    validateField: (fieldName: string, value: unknown) => {
      // Validate single field by creating partial object
      const partialData = { [fieldName]: value }
      const result = validate(partialData)
      
      if (Either.isLeft(result)) {
        const errors = getFieldErrors(result.left)
        return errors[fieldName] || []
      }
      
      return []
    },
    
    validateForm: (data: unknown) => {
      const result = validate(data)
      
      if (Either.isLeft(result)) {
        return {
          isValid: false,
          errors: getFieldErrors(result.left),
          data: null
        }
      }
      
      return {
        isValid: true,
        errors: {},
        data: result.right
      }
    }
  }
}

// Usage in a form component
const { validateField, validateForm } = useFormValidation(RegistrationForm)

// Validate on blur
const emailErrors = validateField('email', 'invalid-email')
// Returns: ["Please enter a valid email address"]

// Validate entire form on submit
const result = validateForm({
  username: "john_doe",
  email: "john@example.com",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
  acceptTerms: true
})

if (result.isValid) {
  // Submit form with result.data
  console.log("Form is valid:", result.data)
}
```

### Example 3: Database Model Validation

Creating type-safe database models with automatic validation:

```typescript
import { Schema } from "@effect/schema"
import { Effect } from "effect"

// Base schemas for common database fields
const Id = Schema.String.pipe(
  Schema.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
  Schema.brand("Id")
)

const Timestamp = Schema.Date

const DbTimestamps = Schema.Struct({
  createdAt: Timestamp,
  updatedAt: Timestamp
})

// Product model with different views
const ProductBase = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  description: Schema.optional(Schema.String),
  price: Schema.Number.pipe(Schema.positive()),
  category: Schema.String,
  tags: Schema.Array(Schema.String),
  inventory: Schema.Struct({
    quantity: Schema.Number.pipe(Schema.nonNegative()),
    warehouse: Schema.String
  })
})

// Insert schema (no id or timestamps)
const ProductInsert = ProductBase

// Database schema (with generated fields)
const ProductDb = Schema.Struct({
  id: Id,
  ...ProductBase.fields,
  ...DbTimestamps.fields
})

// Public API schema (hide sensitive data)
const ProductPublic = Schema.Struct({
  id: Id,
  name: ProductBase.fields.name,
  description: ProductBase.fields.description,
  price: ProductBase.fields.price,
  category: ProductBase.fields.category,
  tags: ProductBase.fields.tags,
  inStock: Schema.Boolean
}).pipe(
  // Transform inventory to simple boolean
  Schema.from(ProductDb, {
    decode: (product) => ({
      ...product,
      inStock: product.inventory.quantity > 0
    }),
    encode: (public) => {
      throw new Error("Cannot encode public product to database format")
    }
  })
)

// Repository with validation
class ProductRepository {
  constructor(private db: any) {}

  async create(data: unknown) {
    return Effect.gen(function* () {
      // Validate input
      const validData = yield* Schema.decode(ProductInsert)(data)
      
      // Create database record
      const dbData = yield* Effect.tryPromise({
        try: async () => {
          const id = crypto.randomUUID()
          const now = new Date()
          const dbData = {
            id,
            ...validData,
            createdAt: now,
            updatedAt: now
          }
          
          await this.db.insert('products', dbData)
          return dbData
        },
        catch: (error) => new Error(`Database error: ${error}`)
      })
      
      // Validate output
      return yield* Schema.decode(ProductDb)(dbData)
    })
  }

  async findById(id: string) {
    return Effect.gen(function* () {
      const rows = yield* Effect.tryPromise({
        try: () => this.db.query('SELECT * FROM products WHERE id = ?', [id]),
        catch: (error) => new Error(`Database error: ${error}`)
      })
      
      const row = rows[0]
      if (!row) {
        return yield* Effect.fail(new Error('Product not found'))
      }
      
      return yield* Schema.decode(ProductDb)(row)
    })
  }

  async findPublic(id: string) {
    return this.findById(id).pipe(
      Effect.map(Schema.encode(ProductPublic))
    )
  }
}

// Usage
const repo = new ProductRepository(db)

const program = Effect.gen(function* () {
  const product = yield* repo.create({
    name: "Gaming Laptop",
    price: 1299.99,
    category: "Electronics",
    tags: ["gaming", "laptop", "high-performance"],
    inventory: {
      quantity: 50,
      warehouse: "US-WEST-1"
    }
  })
  
  const publicProduct = yield* repo.findPublic(product.id)
  
  yield* Effect.log(`Product created: ${publicProduct.name} (In stock: ${publicProduct.inStock})`)
  
  return publicProduct
})
```

### Example 4: Configuration Parsing

Parsing and validating application configuration with environment variables:

```typescript
import { Schema } from "@effect/schema"
import { Effect } from "effect"

// Configuration schema with transformations
const DatabaseConfig = Schema.Struct({
  host: Schema.String,
  port: Schema.transform(
    Schema.String,
    Schema.Number,
    {
      decode: (s) => {
        const n = parseInt(s, 10)
        return isNaN(n) ? Schema.ParseResult.fail(Schema.ParseResult.Type(Schema.Number.ast, s)) : Schema.ParseResult.succeed(n)
      },
      encode: (n) => Schema.ParseResult.succeed(String(n))
    }
  ).pipe(
    Schema.int(),
    Schema.between(1, 65535, { message: () => "Port must be between 1 and 65535" })
  ),
  database: Schema.String,
  username: Schema.String,
  password: Schema.String,
  ssl: Schema.transform(
    Schema.optional(Schema.String, { default: () => "false" }),
    Schema.Boolean,
    {
      decode: (s) => Schema.ParseResult.succeed(s === "true"),
      encode: (b) => Schema.ParseResult.succeed(String(b))
    }
  ),
  poolSize: Schema.transform(
    Schema.optional(Schema.String, { default: () => "10" }),
    Schema.Number,
    {
      decode: (s) => {
        const n = parseInt(s, 10)
        return isNaN(n) ? Schema.ParseResult.fail(Schema.ParseResult.Type(Schema.Number.ast, s)) : Schema.ParseResult.succeed(n)
      },
      encode: (n) => Schema.ParseResult.succeed(String(n))
    }
  ).pipe(Schema.between(1, 100))
})

const RedisConfig = Schema.Struct({
  host: Schema.String,
  port: Schema.transform(
    Schema.optional(Schema.String, { default: () => "6379" }),
    Schema.Number,
    {
      decode: (s) => {
        const n = parseInt(s, 10)
        return isNaN(n) ? Schema.ParseResult.fail(Schema.ParseResult.Type(Schema.Number.ast, s)) : Schema.ParseResult.succeed(n)
      },
      encode: (n) => Schema.ParseResult.succeed(String(n))
    }
  ),
  password: Schema.optional(Schema.String),
  db: Schema.transform(
    Schema.optional(Schema.String, { default: () => "0" }),
    Schema.Number,
    {
      decode: (s) => {
        const n = parseInt(s, 10)
        return isNaN(n) ? Schema.ParseResult.fail(Schema.ParseResult.Type(Schema.Number.ast, s)) : Schema.ParseResult.succeed(n)
      },
      encode: (n) => Schema.ParseResult.succeed(String(n))
    }
  )
})

const AppConfig = Schema.Struct({
  env: Schema.Literal('development', 'staging', 'production'),
  port: Schema.transform(
    Schema.String,
    Schema.Number,
    {
      decode: (s) => {
        const n = parseInt(s, 10)
        return isNaN(n) ? Schema.ParseResult.fail(Schema.ParseResult.Type(Schema.Number.ast, s)) : Schema.ParseResult.succeed(n)
      },
      encode: (n) => Schema.ParseResult.succeed(String(n))
    }
  ).pipe(Schema.between(1, 65535)),
  logLevel: Schema.optional(
    Schema.Literal('debug', 'info', 'warn', 'error'),
    { default: () => 'info' as const }
  ),
  database: DatabaseConfig,
  redis: Schema.optional(RedisConfig),
  features: Schema.Struct({
    enableCache: Schema.transform(
      Schema.optional(Schema.String, { default: () => "true" }),
      Schema.Boolean,
      {
        decode: (s) => Schema.ParseResult.succeed(s === "true"),
        encode: (b) => Schema.ParseResult.succeed(String(b))
      }
    ),
    enableMetrics: Schema.transform(
      Schema.optional(Schema.String, { default: () => "false" }),
      Schema.Boolean,
      {
        decode: (s) => Schema.ParseResult.succeed(s === "true"),
        encode: (b) => Schema.ParseResult.succeed(String(b))
      }
    )
  })
})

// Helper to parse environment variables
function parseEnvConfig<T>(schema: Schema.Schema<T, unknown>, prefix = '') {
  return (env: NodeJS.ProcessEnv) => {
    const config: any = {}
    
    // Recursively build config object from env vars
    function extractConfig(obj: any, currentPrefix: string) {
      for (const [key, value] of Object.entries(env)) {
        if (key.startsWith(currentPrefix)) {
          const path = key.slice(currentPrefix.length).toLowerCase().split('_')
          let current = obj
          
          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {}
            }
            current = current[path[i]]
          }
          
          current[path[path.length - 1]] = value
        }
      }
    }
    
    extractConfig(config, prefix)
    return Schema.decode(schema)(config)
  }
}

// Usage
const loadConfig = parseEnvConfig(AppConfig, 'APP_')

// Example environment variables:
// APP_ENV=production
// APP_PORT=3000
// APP_DATABASE_HOST=localhost
// APP_DATABASE_PORT=5432
// APP_DATABASE_DATABASE=myapp
// APP_DATABASE_USERNAME=user
// APP_DATABASE_PASSWORD=secret
// APP_DATABASE_SSL=true
// APP_REDIS_HOST=localhost
// APP_FEATURES_ENABLECACHE=true

const program = loadConfig(process.env).pipe(
  Effect.tap((config) => Effect.log(`Loaded config for ${config.env} environment`)),
  Effect.catchAll((error) => 
    Effect.die(new Error(`Failed to load configuration: ${Schema.formatError(error)}`))
  )
)
```

## Advanced Features Deep Dive

### Refinements: Custom Validation Logic

Refinements allow you to add custom validation logic beyond structural checks:

```typescript
import { Schema } from "@effect/schema"

// Basic refinement
const PositiveInt = Schema.Number.pipe(
  Schema.int(),
  Schema.positive()
)

// Custom refinement with predicate
const EvenNumber = Schema.Number.pipe(
  Schema.filter((n) => n % 2 === 0, {
    message: () => "Must be an even number"
  })
)

// Complex business logic validation
const ValidPassword = Schema.String.pipe(
  Schema.filter((password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 12
    
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough
  }, {
    message: () => "Password must be at least 12 characters with uppercase, lowercase, number, and special character"
  })
)

// Async refinements for external validation
const UniqueEmail = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.filterEffect((email) => 
    Effect.tryPromise({
      try: async () => {
        const exists = await checkEmailExists(email)
        return !exists
      },
      catch: () => false
    }), {
      message: () => "Email is already registered"
    }
  )
)

// Cross-field validation
const DateRange = Schema.Struct({
  startDate: Schema.Date,
  endDate: Schema.Date
}).pipe(
  Schema.filter((range) => range.startDate <= range.endDate, {
    message: () => "End date must be after start date"
  })
)

// Conditional validation
const ConditionalSchema = Schema.Struct({
  type: Schema.Literal('email', 'phone'),
  value: Schema.String
}).pipe(
  Schema.filter((data) => {
    if (data.type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.value)
    } else {
      return /^\+?[\d\s-()]+$/.test(data.value)
    }
  }, {
    message: (data) => 
      data.type === 'email' 
        ? "Invalid email format" 
        : "Invalid phone number format"
  })
)
```

### Brands: Type-Safe Identifiers

Brands create nominal types for additional type safety:

```typescript
import { Schema } from "@effect/schema"
import { Brand } from "effect"

// Define branded types
const UserId = Schema.String.pipe(
  Schema.pattern(/^user_[a-zA-Z0-9]{10}$/),
  Schema.brand("UserId")
)
type UserId = Schema.Schema.Type<typeof UserId>

const PostId = Schema.String.pipe(
  Schema.pattern(/^post_[a-zA-Z0-9]{10}$/),
  Schema.brand("PostId")
)
type PostId = Schema.Schema.Type<typeof PostId>

const Email = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.brand("Email")
)
type Email = Schema.Schema.Type<typeof Email>

// Using branded types prevents mixing IDs
function getPost(userId: UserId, postId: PostId) {
  // Type-safe: can't accidentally swap parameters
  return `Fetching post ${postId} for user ${userId}`
}

// Parse and create branded values
const parseUserId = Schema.decode(UserId)
const userId = Effect.runSync(parseUserId("user_abc1234567"))

// Won't compile - type safety!
// getPost(postId, userId) // Error: Type 'PostId' is not assignable to 'UserId'

// Advanced: Currency with brands
const USD = Schema.Number.pipe(
  Schema.finite(),
  Schema.brand("USD")
)
type USD = Schema.Schema.Type<typeof USD>

const EUR = Schema.Number.pipe(
  Schema.finite(),
  Schema.brand("EUR")
)
type EUR = Schema.Schema.Type<typeof EUR>

// Type-safe currency operations
function convertUSDToEUR(amount: USD, rate: number): EUR {
  return Brand.nominal<EUR>()(Brand.unbrand(amount) * rate)
}

// Create helper constructors
const createUserId = (id: string): Effect.Effect<UserId, Schema.ParseError> =>
  Schema.decode(UserId)(`user_${id}`)

const createEmail = (email: string): Effect.Effect<Email, Schema.ParseError> =>
  Schema.decode(Email)(email)
```

### Class Schemas: Object-Oriented Integration

Schema works seamlessly with classes:

```typescript
import { Schema } from "@effect/schema"
import { Effect } from "effect"

// Define a class with schema
class User extends Schema.Class<User>("User")({
  id: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  name: Schema.String,
  age: Schema.Number.pipe(Schema.between(0, 150)),
  roles: Schema.Array(Schema.Literal('admin', 'user', 'guest'))
}) {
  // Add methods to the class
  get isAdmin(): boolean {
    return this.roles.includes('admin')
  }

  get displayName(): string {
    return `${this.name} (${this.email})`
  }

  // Static factory methods
  static createAdmin(data: Omit<User, 'roles'>) {
    return new User({ ...data, roles: ['admin', 'user'] })
  }
}

// Parse unknown data to class instance
const parseUser = Schema.decode(User)

const program = parseUser({
  id: "123",
  email: "admin@example.com",
  name: "Admin User",
  age: 30,
  roles: ["admin", "user"]
}).pipe(
  Effect.map((user) => {
    // user is an instance of User class
    console.log(user.displayName) // "Admin User (admin@example.com)"
    console.log(user.isAdmin) // true
    return user
  })
)

// Extending class schemas
class Employee extends Schema.Class<Employee>("Employee")({
  ...User.fields,
  employeeId: Schema.String,
  department: Schema.String,
  salary: Schema.Number.pipe(Schema.positive())
}) {
  get fullInfo(): string {
    return `${this.name} - ${this.department} (${this.employeeId})`
  }
}

// Repository pattern with class schemas
class UserRepository {
  async save(user: User): Promise<void> {
    // User is already validated
    await db.save('users', Schema.encode(User)(user))
  }

  async findById(id: string): Promise<User | null> {
    const data = await db.findOne('users', { id })
    if (!data) return null
    
    // Returns User instance with methods
    return Effect.runSync(Schema.decode(User)(data))
  }
}
```

### Recursive Schemas: Nested Structures

Handling recursive data structures like trees and graphs:

```typescript
import { Schema } from "@effect/schema"

// Tree structure
interface TreeNode {
  value: string
  children: ReadonlyArray<TreeNode>
}

const TreeNode: Schema.Schema<TreeNode> = Schema.Struct({
  value: Schema.String,
  children: Schema.Array(Schema.suspend(() => TreeNode))
})

// File system structure
interface FileSystemEntry {
  name: string
  type: 'file' | 'directory'
  size?: number
  children?: ReadonlyArray<FileSystemEntry>
}

const FileSystemEntry: Schema.Schema<FileSystemEntry> = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal('file', 'directory'),
  size: Schema.optional(Schema.Number),
  children: Schema.optional(
    Schema.Array(Schema.suspend(() => FileSystemEntry))
  )
}).pipe(
  Schema.filter((entry) => {
    if (entry.type === 'file') {
      return entry.size !== undefined && entry.children === undefined
    } else {
      return entry.size === undefined
    }
  }, {
    message: () => "Files must have size, directories must not"
  })
)

// Comment thread structure
interface Comment {
  id: string
  author: string
  content: string
  createdAt: Date
  replies: ReadonlyArray<Comment>
}

const Comment: Schema.Schema<Comment> = Schema.Struct({
  id: Schema.String,
  author: Schema.String,
  content: Schema.String,
  createdAt: Schema.Date,
  replies: Schema.Array(Schema.suspend(() => Comment))
})

// Parsing nested structures
const fileSystem = Schema.decodeUnknownSync(FileSystemEntry)({
  name: "root",
  type: "directory",
  children: [
    {
      name: "src",
      type: "directory",
      children: [
        {
          name: "index.ts",
          type: "file",
          size: 1024
        }
      ]
    },
    {
      name: "README.md",
      type: "file",
      size: 2048
    }
  ]
})
```

## Practical Patterns & Best Practices

### Pattern 1: Schema Composition Helpers

Create reusable utilities for common schema patterns:

```typescript
import { Schema } from "@effect/schema"

// Nullable helper for optional database fields
const nullable = <A, I, R>(schema: Schema.Schema<A, I, R>) =>
  Schema.Union(schema, Schema.Null)

// Pagination schema factory
const createPaginationSchema = <T extends Schema.Schema.All>(itemSchema: T) =>
  Schema.Struct({
    items: Schema.Array(itemSchema),
    total: Schema.Number.pipe(Schema.nonNegative()),
    page: Schema.Number.pipe(Schema.positive()),
    pageSize: Schema.Number.pipe(Schema.positive()),
    hasNext: Schema.Boolean,
    hasPrev: Schema.Boolean
  })

// API response wrapper
const apiResponse = <T extends Schema.Schema.All>(dataSchema: T) =>
  Schema.Union(
    Schema.Struct({
      success: Schema.Literal(true),
      data: dataSchema
    }),
    Schema.Struct({
      success: Schema.Literal(false),
      error: Schema.Struct({
        code: Schema.String,
        message: Schema.String,
        details: Schema.optional(Schema.Unknown)
      })
    })
  )

// Timestamped schema helper
const withTimestamps = <T extends Schema.Schema.All>(schema: T) =>
  Schema.Struct({
    ...Schema.Struct.fields(schema),
    createdAt: Schema.Date,
    updatedAt: Schema.Date
  })

// Soft delete helper
const withSoftDelete = <T extends Schema.Schema.All>(schema: T) =>
  Schema.Struct({
    ...Schema.Struct.fields(schema),
    deletedAt: nullable(Schema.Date)
  })

// Usage examples
const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String
})

const UserWithTimestamps = withTimestamps(User)
const UserWithSoftDelete = withSoftDelete(UserWithTimestamps)
const PaginatedUsers = createPaginationSchema(User)
const UserApiResponse = apiResponse(User)
```

### Pattern 2: Error Formatting Utilities

Enhanced error handling and formatting:

```typescript
import { Schema } from "@effect/schema"
import { Either, pipe } from "effect"

// Custom error formatter for APIs
interface ValidationError {
  field: string
  message: string
  code: string
}

function formatSchemaError(error: Schema.ParseError): ValidationError[] {
  const errors: ValidationError[] = []
  
  function processIssue(issue: Schema.ParseIssue, path: ReadonlyArray<PropertyKey> = []) {
    if (issue._tag === "Type") {
      errors.push({
        field: path.join('.'),
        message: issue.message,
        code: 'INVALID_TYPE'
      })
    } else if (issue._tag === "Missing") {
      errors.push({
        field: path.join('.'),
        message: "This field is required",
        code: 'REQUIRED'
      })
    } else if (issue._tag === "Refinement") {
      errors.push({
        field: path.join('.'),
        message: issue.message,
        code: 'VALIDATION_FAILED'
      })
    }
  }
  
  // Process all issues
  TreeFormatter.go(error, processIssue)
  
  return errors
}

// Validation result wrapper
interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

function validate<T>(
  schema: Schema.Schema<T, unknown>,
  data: unknown
): ValidationResult<T> {
  const result = Schema.decodeUnknownEither(schema)(data)
  
  if (Either.isRight(result)) {
    return {
      success: true,
      data: result.right
    }
  }
  
  return {
    success: false,
    errors: formatSchemaError(result.left)
  }
}

// Express middleware for validation
function validateBody<T>(schema: Schema.Schema<T, unknown>) {
  return (req: any, res: any, next: any) => {
    const result = validate(schema, req.body)
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors
      })
    }
    
    req.validatedBody = result.data
    next()
  }
}

// Usage in Express route
app.post('/users', 
  validateBody(CreateUserSchema),
  async (req, res) => {
    const userData = req.validatedBody // Type-safe!
    // Process validated data
  }
)
```

### Pattern 3: Schema Versioning and Migration

Handle evolving schemas over time:

```typescript
import { Schema } from "@effect/schema"
import { Effect } from "effect"

// Version 1 of user schema
const UserV1 = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String
})

// Version 2 adds phone number
const UserV2 = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  phone: Schema.optional(Schema.String)
})

// Version 3 splits name into first/last
const UserV3 = Schema.Struct({
  id: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.String,
  phone: Schema.optional(Schema.String)
})

// Migration transformations
const migrateV1toV2 = Schema.transform(
  UserV1,
  UserV2,
  {
    decode: (v1) => Schema.ParseResult.succeed({
      ...v1,
      phone: undefined
    }),
    encode: (v2) => Schema.ParseResult.succeed({
      id: v2.id,
      name: v2.name,
      email: v2.email
    })
  }
)

const migrateV2toV3 = Schema.transform(
  UserV2,
  UserV3,
  {
    decode: (v2) => {
      const [firstName = '', lastName = ''] = v2.name.split(' ', 2)
      return Schema.ParseResult.succeed({
        id: v2.id,
        firstName,
        lastName,
        email: v2.email,
        phone: v2.phone
      })
    },
    encode: (v3) => Schema.ParseResult.succeed({
      id: v3.id,
      name: `${v3.firstName} ${v3.lastName}`,
      email: v3.email,
      phone: v3.phone
    })
  }
)

// Versioned schema with automatic migration
const VersionedUser = Schema.Union(
  Schema.Struct({
    version: Schema.Literal(1),
    data: UserV1
  }),
  Schema.Struct({
    version: Schema.Literal(2),
    data: UserV2
  }),
  Schema.Struct({
    version: Schema.Literal(3),
    data: UserV3
  })
)

// Migration helper
function migrateToLatest(versionedData: unknown) {
  return Effect.gen(function* () {
    const parsed = yield* Schema.decode(VersionedUser)(versionedData)
    
    switch (parsed.version) {
      case 1:
        const v2Data = yield* Schema.decode(migrateV1toV2)(parsed.data)
        const v3Data = yield* Schema.decode(migrateV2toV3)(v2Data)
        return { version: 3 as const, data: v3Data }
      case 2:
        const migratedData = yield* Schema.decode(migrateV2toV3)(parsed.data)
        return { version: 3 as const, data: migratedData }
      case 3:
        return parsed
    }
  })
}
```

## Integration Examples

### Integration with React Hook Form

```typescript
import { Schema } from "@effect/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Schema to Zod adapter
function schemaToZod<T>(schema: Schema.Schema<T, unknown>) {
  return {
    parse: (data: unknown) => {
      const result = Schema.decodeUnknownSync(schema)(data)
      return result
    },
    safeParse: (data: unknown) => {
      try {
        const result = Schema.decodeUnknownSync(schema)(data)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error }
      }
    }
  }
}

// React component with form validation
function UserForm() {
  const UserFormSchema = Schema.Struct({
    name: Schema.String.pipe(Schema.minLength(2)),
    email: Schema.String.pipe(
      Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ),
    age: Schema.Number.pipe(Schema.between(18, 100))
  })

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: (values) => {
      const result = Schema.decodeUnknownEither(UserFormSchema)(values)
      
      if (Either.isRight(result)) {
        return { values: result.right, errors: {} }
      }
      
      const fieldErrors = formatSchemaError(result.left)
      const errors: Record<string, any> = {}
      
      fieldErrors.forEach((error) => {
        errors[error.field] = {
          type: error.code,
          message: error.message
        }
      })
      
      return { values: {}, errors }
    }
  })

  const onSubmit = (data: Schema.Schema.Type<typeof UserFormSchema>) => {
    console.log('Valid data:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="number" {...register('age')} />
      {errors.age && <span>{errors.age.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Testing Strategies

```typescript
import { Schema } from "@effect/schema"
import { Effect } from "effect"
import { describe, it, expect } from "vitest"
import * as fc from "fast-check"

// Property-based testing with fast-check
describe('User Schema', () => {
  const UserSchema = Schema.Struct({
    id: Schema.String.pipe(Schema.minLength(1)),
    email: Schema.String.pipe(
      Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ),
    age: Schema.Number.pipe(Schema.between(0, 150))
  })

  // Generate arbitrary data that matches schema
  const validUserArb = fc.record({
    id: fc.string({ minLength: 1 }),
    email: fc.emailAddress(),
    age: fc.integer({ min: 0, max: 150 })
  })

  it('should parse valid data', () => {
    fc.assert(
      fc.property(validUserArb, (user) => {
        const result = Schema.decodeUnknownEither(UserSchema)(user)
        return Either.isRight(result)
      })
    )
  })

  it('should reject invalid emails', () => {
    const invalidEmails = ['not-an-email', '@invalid.com', 'user@', 'user..name@example.com']
    
    invalidEmails.forEach((email) => {
      const result = Schema.decodeUnknownEither(UserSchema)({
        id: '123',
        email,
        age: 25
      })
      
      expect(Either.isLeft(result)).toBe(true)
    })
  })

  it('should handle edge cases', () => {
    const edgeCases = [
      { id: '', email: 'test@example.com', age: 25 }, // Empty ID
      { id: '123', email: 'test@example.com', age: -1 }, // Negative age
      { id: '123', email: 'test@example.com', age: 151 }, // Age too high
      { id: '123', email: 'test@example.com' }, // Missing age
      null, // Null input
      undefined, // Undefined input
      'not an object' // Wrong type
    ]

    edgeCases.forEach((testCase) => {
      const result = Schema.decodeUnknownEither(UserSchema)(testCase)
      expect(Either.isLeft(result)).toBe(true)
    })
  })
})

// Test helpers for schemas
export const schemaTest = {
  // Test that encoding and decoding are inverses
  roundTrip: <A, I>(schema: Schema.Schema<A, I>, value: A) => {
    return Effect.gen(function* () {
      const encoded = yield* Schema.encode(schema)(value)
      const decoded = yield* Schema.decode(schema)(encoded)
      expect(decoded).toEqual(value)
    })
  },

  // Test that schema accepts valid input
  accepts: <A>(schema: Schema.Schema<A, unknown>, input: unknown) => {
    const result = Schema.decodeUnknownEither(schema)(input)
    expect(Either.isRight(result)).toBe(true)
  },

  // Test that schema rejects invalid input
  rejects: <A>(schema: Schema.Schema<A, unknown>, input: unknown) => {
    const result = Schema.decodeUnknownEither(schema)(input)
    expect(Either.isLeft(result)).toBe(true)
  },

  // Test error messages
  rejectsWith: <A>(
    schema: Schema.Schema<A, unknown>, 
    input: unknown, 
    expectedMessage: string
  ) => {
    const result = Schema.decodeUnknownEither(schema)(input)
    expect(Either.isLeft(result)).toBe(true)
    
    if (Either.isLeft(result)) {
      const formatted = Schema.formatError(result.left)
      expect(formatted).toContain(expectedMessage)
    }
  }
}

// Usage
describe('Custom validators', () => {
  const PositiveNumber = Schema.Number.pipe(
    Schema.positive({ message: () => 'Must be positive' })
  )

  it('accepts positive numbers', () => {
    schemaTest.accepts(PositiveNumber, 42)
    schemaTest.accepts(PositiveNumber, 0.1)
  })

  it('rejects negative numbers with message', () => {
    schemaTest.rejectsWith(PositiveNumber, -1, 'Must be positive')
  })
})
```

## Conclusion

Schema provides a comprehensive solution for runtime validation, type-safe parsing, and data transformation in TypeScript applications. Its seamless integration with the Effect ecosystem makes it ideal for building robust, type-safe applications.

Key benefits:
- **Type Safety**: Full TypeScript integration with automatic type inference
- **Composability**: Build complex schemas from simple building blocks
- **Error Handling**: Detailed, actionable error messages for debugging
- **Transformations**: Parse and serialize data with custom logic
- **Performance**: Optimized for production use

Schema excels in scenarios requiring data validation at runtime boundaries - API endpoints, form submissions, database operations, and configuration parsing. Its declarative API and powerful features make it an essential tool for any Effect-based application.