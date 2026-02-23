# ParseResult: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem ParseResult Solves

When working with parsing and validation libraries, you often encounter these challenges:

```typescript
// Traditional parsing approach - brittle and limited error handling
import * as z from 'zod'

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  age: z.number().positive(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  })
})

try {
  const user = UserSchema.parse(invalidData)
  // Success path
} catch (error) {
  // All you get is a ZodError - limited error handling options
  // No way to recover from partial failures
  // No composability with async operations
  // Error messages aren't easily customizable
  console.error('Validation failed:', error.message)
}
```

This approach leads to:
- **Limited error handling** - Parse succeeds or throws, no middle ground
- **Poor composability** - Can't easily combine with async operations or other Effect computations
- **Inflexible error recovery** - No way to provide fallbacks or partial parsing
- **Generic error messages** - Hard to customize error formatting for different contexts
- **No async support** - Can't handle schemas that require async operations

### The ParseResult Solution

ParseResult provides a composable, effect-aware parsing system that integrates seamlessly with Effect's ecosystem:

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either } from "effect"

// Define schema with full Effect integration
const User = Schema.Struct({
  id: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.positive()),
  preferences: Schema.Struct({
    theme: Schema.Literal('light', 'dark'),
    notifications: Schema.Boolean
  })
})

// Multiple parsing strategies available
const parseUserEither = ParseResult.decodeUnknownEither(User)
const parseUserEffect = ParseResult.decodeUnknown(User)
const parseUserOption = ParseResult.decodeUnknownOption(User)

// Rich error handling with detailed issue information
const result = parseUserEither(invalidData)

Either.match(result, {
  onLeft: (issue) => {
    // Rich error information with path, context, and custom messages
    console.error(ParseResult.TreeFormatter.formatIssueSync(issue))
    // Or get structured error data
    const errors = ParseResult.ArrayFormatter.formatIssueSync(issue)
    return handleValidationErrors(errors)
  },
  onRight: (user) => {
    // Type-safe user object
    return processUser(user)
  }
})
```

### Key Concepts

**ParseIssue**: Represents specific validation failures with rich context about what went wrong and where

**ParseError**: A tagged error containing a ParseIssue, integrable with Effect's error handling

**Formatters**: Pluggable error formatting system (Tree, Array) for different display needs

## Basic Usage Patterns

### Pattern 1: Basic Schema Parsing

```typescript
import { ParseResult, Schema } from "effect"
import { Either } from "effect"

// Simple schema
const ProductId = Schema.String.pipe(Schema.pattern(/^prod_[a-zA-Z0-9]+$/))

// Parse with Either result
const parseProductId = ParseResult.decodeUnknownEither(ProductId)

const validateProductId = (input: unknown) => {
  const result = parseProductId(input)
  
  return Either.match(result, {
    onLeft: (issue) => ({
      success: false,
      error: ParseResult.TreeFormatter.formatIssueSync(issue)
    }),
    onRight: (id) => ({
      success: true,
      data: id
    })
  })
}

// Usage
const result1 = validateProductId("prod_abc123") // { success: true, data: "prod_abc123" }
const result2 = validateProductId("invalid") // { success: false, error: "Expected ..." }
```

### Pattern 2: Async-Aware Parsing

```typescript
import { ParseResult, Schema } from "effect"
import { Effect } from "effect"

// Schema that requires async validation
const UserEmail = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.transform(
    Schema.String,
    {
      strict: true,
      decode: (email) => Effect.gen(function* () {
        // Async email validation
        const isValid = yield* checkEmailExists(email)
        if (!isValid) {
          return yield* Effect.fail(new Error('Email does not exist'))
        }
        return email.toLowerCase()
      }),
      encode: (email) => Effect.succeed(email)
    }
  )
)

// Parse with Effect for async support
const parseEmail = ParseResult.decodeUnknown(UserEmail)

const validateEmailAddress = (input: unknown) => Effect.gen(function* () {
  try {
    const email = yield* parseEmail(input)
    return { success: true, email }
  } catch (issue) {
    return {
      success: false,
      error: ParseResult.TreeFormatter.formatIssueSync(issue)
    }
  }
})
```

### Pattern 3: Multiple Parsing Options

```typescript
import { ParseResult, Schema } from "effect"
import { Option } from "effect"

const Config = Schema.Struct({
  apiUrl: Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/)),
  timeout: Schema.Number.pipe(Schema.positive()),
  retries: Schema.optional(Schema.Number.pipe(Schema.nonnegative()))
})

// Different parsing strategies for different contexts
const parseConfig = {
  // Throws on error - for configuration loading where failure is fatal
  sync: ParseResult.decodeUnknownSync(Config),
  
  // Returns Option - for optional configuration
  optional: ParseResult.decodeUnknownOption(Config),
  
  // Returns Either - for user input validation
  safe: ParseResult.decodeUnknownEither(Config),
  
  // Returns Promise - for async contexts
  promise: ParseResult.decodeUnknownPromise(Config)
}

// Usage examples
const loadConfigSync = (data: unknown) => {
  try {
    return parseConfig.sync(data)
  } catch (error) {
    console.error('Configuration error:', error.message)
    process.exit(1)
  }
}

const tryParseConfig = (data: unknown) => {
  return Option.match(parseConfig.optional(data), {
    onNone: () => getDefaultConfig(),
    onSome: (config) => config
  })
}
```

## Real-World Examples

### Example 1: Form Validation with Detailed Error Messages

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either, Array as Arr } from "effect"

// User registration form schema
const UserRegistration = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3, { message: () => "Username must be at least 3 characters" }),
    Schema.maxLength(20, { message: () => "Username cannot exceed 20 characters" }),
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
    Schema.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: () => "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    })
  ),
  confirmPassword: Schema.String,
  age: Schema.Number.pipe(
    Schema.int({ message: () => "Age must be a whole number" }),
    Schema.between(13, 120, { message: () => "Age must be between 13 and 120" })
  ),
  terms: Schema.Boolean.pipe(
    Schema.filter((accepted) => accepted, {
      message: () => "You must accept the terms and conditions"
    })
  )
}).pipe(
  Schema.filter(
    (data) => data.password === data.confirmPassword,
    { message: () => "Passwords do not match" }
  )
)

// Form validation helper
const validateRegistrationForm = (formData: unknown) => {
  const parser = ParseResult.decodeUnknownEither(UserRegistration)
  const result = parser(formData)
  
  return Either.match(result, {
    onLeft: (issue) => {
      // Convert to field-specific errors for UI
      const errors = ParseResult.ArrayFormatter.formatIssueSync(issue)
      const fieldErrors: Record<string, string[]> = {}
      
      for (const error of errors) {
        const path = error.path.join('.')
        const field = path || 'root'
        
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      }
      
      return { success: false, errors: fieldErrors }
    },
    onRight: (userData) => ({ success: true, data: userData })
  })
}

// Usage in form handler
const handleRegistration = (formData: FormData) => {
  const data = Object.fromEntries(formData.entries())
  const result = validateRegistrationForm({
    ...data,
    age: Number(data.age),
    terms: data.terms === 'on'
  })
  
  if (!result.success) {
    // Display field-specific errors
    Object.entries(result.errors).forEach(([field, messages]) => {
      displayFieldErrors(field, messages)
    })
    return
  }
  
  // Process valid registration
  processRegistration(result.data)
}
```

### Example 2: API Response Parsing with Error Recovery

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either, Option } from "effect"

// API response schemas
const ApiUser = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  avatar: Schema.optional(Schema.String),
  lastLoginAt: Schema.optional(Schema.String.pipe(Schema.parseDate()))
})

const ApiResponse = Schema.Struct({
  success: Schema.Boolean,
  data: Schema.optional(ApiUser),
  error: Schema.optional(Schema.String),
  pagination: Schema.optional(Schema.Struct({
    page: Schema.Number,
    total: Schema.Number,
    hasMore: Schema.Boolean
  }))
})

// Robust API client with fallback parsing
const createApiClient = () => {
  const parseResponse = ParseResult.decodeUnknownEither(ApiResponse)
  const parseUser = ParseResult.decodeUnknownOption(ApiUser)
  
  const fetchUser = (id: string) => Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() => 
      fetch(`/api/users/${id}`).then(r => r.json())
    )
    
    const parseResult = parseResponse(response)
    
    return yield* Either.match(parseResult, {
      onLeft: (issue) => {
        // Try to extract user data even if response format is wrong
        const user = parseUser(response.data || response)
        
        return Option.match(user, {
          onNone: () => Effect.fail(new Error(
            `API response parsing failed: ${ParseResult.TreeFormatter.formatIssueSync(issue)}`
          )),
          onSome: (userData) => {
            console.warn('API response format changed, but user data recovered')
            return Effect.succeed(userData)
          }
        })
      },
      onRight: (apiResponse) => {
        if (!apiResponse.success || !apiResponse.data) {
          return Effect.fail(new Error(apiResponse.error || 'Unknown API error'))
        }
        return Effect.succeed(apiResponse.data)
      }
    })
  })
  
  return { fetchUser }
}

// Usage
const apiClient = createApiClient()

const getUserProfile = (userId: string) => Effect.gen(function* () {
  try {
    const user = yield* apiClient.fetchUser(userId)
    return {
      profile: {
        id: user.id,
        displayName: user.name,
        email: user.email,
        avatarUrl: user.avatar || '/default-avatar.png',
        lastSeen: user.lastLoginAt || null
      }
    }
  } catch (error) {
    return {
      error: error.message,
      fallback: getDefaultUserProfile(userId)
    }
  }
})
```

### Example 3: Configuration File Processing

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either, Array as Arr } from "effect"
import * as fs from 'fs'

// Application configuration schema
const DatabaseConfig = Schema.Struct({
  host: Schema.String,
  port: Schema.Number.pipe(Schema.between(1, 65535)),
  username: Schema.String,
  password: Schema.String,
  database: Schema.String,
  ssl: Schema.optional(Schema.Boolean),
  poolSize: Schema.optional(Schema.Number.pipe(Schema.positive()))
})

const RedisConfig = Schema.Struct({
  host: Schema.String,
  port: Schema.Number.pipe(Schema.between(1, 65535)),
  password: Schema.optional(Schema.String),
  database: Schema.optional(Schema.Number.pipe(Schema.nonnegative()))
})

const AppConfig = Schema.Struct({
  environment: Schema.Literal('development', 'staging', 'production'),
  port: Schema.Number.pipe(Schema.between(1000, 65535)),
  database: DatabaseConfig,
  redis: Schema.optional(RedisConfig),
  logging: Schema.Struct({
    level: Schema.Literal('debug', 'info', 'warn', 'error'),
    format: Schema.optional(Schema.Literal('json', 'text'))
  }),
  features: Schema.optional(Schema.Struct({
    rateLimit: Schema.optional(Schema.Boolean),
    metrics: Schema.optional(Schema.Boolean),
    debug: Schema.optional(Schema.Boolean)
  }))
})

// Configuration loader with detailed error reporting
const loadConfiguration = (configPath: string) => Effect.gen(function* () {
  const configContent = yield* Effect.tryPromise(
    () => fs.promises.readFile(configPath, 'utf-8'),
    (error) => new Error(`Failed to read config file: ${error}`)
  )
  
  const configData = yield* Effect.try(
    () => JSON.parse(configContent),
    (error) => new Error(`Invalid JSON in config file: ${error}`)
  )
  
  const parser = ParseResult.decodeUnknownEither(AppConfig)
  const result = parser(configData)
  
  return yield* Either.match(result, {
    onLeft: (issue) => {
      const errors = ParseResult.ArrayFormatter.formatIssueSync(issue)
      const errorReport = createConfigErrorReport(errors, configPath)
      return Effect.fail(new Error(errorReport))
    },
    onRight: (config) => Effect.succeed(config)
  })
})

// Helper to create detailed configuration error reports
const createConfigErrorReport = (
  errors: ParseResult.ArrayFormatterIssue[],
  configPath: string
): string => {
  const groupedErrors = Arr.groupBy(errors, (error) => error.path.join('.') || 'root')
  
  let report = `Configuration validation failed for ${configPath}:\n\n`
  
  Object.entries(groupedErrors).forEach(([path, pathErrors]) => {
    report += `• ${path}:\n`
    pathErrors.forEach(error => {
      report += `  - ${error.message}\n`
    })
    report += '\n'
  })
  
  report += 'Please check your configuration file and try again.'
  return report
}

// Usage with graceful error handling
const startApplication = () => Effect.gen(function* () {
  try {
    const config = yield* loadConfiguration('./config.json')
    
    console.log(`Starting application in ${config.environment} mode`)
    console.log(`Server will listen on port ${config.port}`)
    
    return yield* initializeApplication(config)
  } catch (error) {
    console.error(error.message)
    
    // Try to load default configuration as fallback
    console.log('Attempting to use default configuration...')
    const defaultConfig = getDefaultConfig()
    return yield* initializeApplication(defaultConfig)
  }
})
```

## Advanced Features Deep Dive

### Feature 1: Custom Error Messages and Formatting

ParseResult provides flexible error formatting through its formatter system:

#### Basic Custom Messages

```typescript
import { ParseResult, Schema } from "effect"

// Schema with custom error messages
const StrictPassword = Schema.String.pipe(
  Schema.minLength(12, { 
    message: () => "Password must be at least 12 characters long for security" 
  }),
  Schema.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: () => "Password must contain uppercase, lowercase, number, and special character"
  })
)

const validatePassword = (input: unknown) => {
  const result = ParseResult.decodeUnknownEither(StrictPassword)(input)
  
  return Either.match(result, {
    onLeft: (issue) => ParseResult.TreeFormatter.formatIssueSync(issue),
    onRight: (password) => `Valid password: ${password.replace(/./g, '*')}`
  })
}
```

#### Advanced Error Formatting

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Array as Arr } from "effect"

// Create custom error formatter for specific UI needs
const createFormErrorFormatter = () => {
  const formatForForm = (issue: ParseResult.ParseIssue): Effect.Effect<FormError[]> => {
    const errors = ParseResult.ArrayFormatter.formatIssueSync(issue)
    
    return Effect.succeed(
      errors.map(error => ({
        field: error.path.join('.'),
        message: error.message,
        severity: getSeverityFromTag(error._tag),
        code: `${error._tag}_${error.path.join('_')}`
      }))
    )
  }
  
  return { formatForForm }
}

interface FormError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  code: string
}

const getSeverityFromTag = (tag: string): FormError['severity'] => {
  switch (tag) {
    case 'Type': return 'error'
    case 'Refinement': return 'warning'
    case 'Missing': return 'error'
    default: return 'info'
  }
}
```

#### Real-World Error Formatting Example

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either } from "effect"

const OrderItem = Schema.Struct({
  productId: Schema.String.pipe(Schema.pattern(/^prod_/)),
  quantity: Schema.Number.pipe(Schema.positive()),
  price: Schema.Number.pipe(Schema.positive())
})

const Order = Schema.Struct({
  orderId: Schema.String.pipe(Schema.pattern(/^order_/)),
  customerId: Schema.String.pipe(Schema.pattern(/^cust_/)),
  items: Schema.Array(OrderItem).pipe(Schema.minItems(1)),
  shippingAddress: Schema.Struct({
    street: Schema.String.pipe(Schema.minLength(5)),
    city: Schema.String.pipe(Schema.minLength(2)),
    postalCode: Schema.String.pipe(Schema.pattern(/^\d{5}(-\d{4})?$/)),
    country: Schema.String.pipe(Schema.minLength(2))
  })
})

// Business-friendly error formatter
const formatOrderValidationError = (issue: ParseResult.ParseIssue): string => {
  const errors = ParseResult.ArrayFormatter.formatIssueSync(issue)
  
  const businessErrors = errors.map(error => {
    const path = error.path.join('.')
    
    // Convert technical field names to business-friendly terms
    const fieldMap: Record<string, string> = {
      'orderId': 'Order ID',
      'customerId': 'Customer ID',
      'items': 'Order Items',
      'shippingAddress.street': 'Street Address',
      'shippingAddress.city': 'City',
      'shippingAddress.postalCode': 'ZIP Code',
      'shippingAddress.country': 'Country'
    }
    
    const friendlyField = fieldMap[path] || path
    
    // Customize messages for business context
    let friendlyMessage = error.message
    if (error.message.includes('pattern')) {
      if (path === 'orderId') friendlyMessage = 'Order ID must start with "order_"'
      if (path === 'customerId') friendlyMessage = 'Customer ID must start with "cust_"'
      if (path.includes('postalCode')) friendlyMessage = 'Please enter a valid ZIP code (12345 or 12345-6789)'
    }
    
    return `${friendlyField}: ${friendlyMessage}`
  })
  
  return `Order validation failed:\n${businessErrors.map(e => `• ${e}`).join('\n')}`
}

// Usage in order processing
const processOrder = (orderData: unknown) => {
  const result = ParseResult.decodeUnknownEither(Order)(orderData)
  
  return Either.match(result, {
    onLeft: (issue) => ({
      success: false,
      error: formatOrderValidationError(issue)
    }),
    onRight: (order) => ({
      success: true,
      data: order,
      message: `Order ${order.orderId} validated successfully`
    })
  })
}
```

### Feature 2: Parsing Modes and Options

ParseResult offers different parsing modes for different use cases:

#### Synchronous vs Asynchronous Parsing

```typescript
import { ParseResult, Schema } from "effect"
import { Effect } from "effect"

// Schema with async transformation
const UserWithValidation = Schema.String.pipe(
  Schema.transform(
    Schema.Struct({
      id: Schema.String,
      isValid: Schema.Boolean
    }),
    {
      strict: true,
      decode: (email) => Effect.gen(function* () {
        // Simulate async validation
        const isValid = yield* Effect.tryPromise(() => 
          fetch(`/api/validate-email?email=${email}`)
            .then(r => r.json())
            .then(data => data.valid)
        )
        
        return {
          id: email,
          isValid
        }
      }),
      encode: (user) => Effect.succeed(user.id)
    }
  )
)

// Different parsing approaches
const parseUserSync = ParseResult.decodeUnknownSync(UserWithValidation) // Throws if async
const parseUserAsync = ParseResult.decodeUnknown(UserWithValidation) // Returns Effect
const parseUserPromise = ParseResult.decodeUnknownPromise(UserWithValidation) // Returns Promise

// Usage patterns
const validateUserEmail = (email: unknown) => Effect.gen(function* () {
  try {
    // For async validation
    const user = yield* parseUserAsync(email)
    return { valid: true, user }
  } catch (error) {
    return { valid: false, error: error.message }
  }
})

// Promise-based for non-Effect contexts
const validateUserEmailPromise = async (email: unknown) => {
  try {
    const user = await parseUserPromise(email)
    return { valid: true, user }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}
```

#### Parse Options and Configuration

```typescript
import { ParseResult, Schema } from "effect"
import { Either } from "effect"

const FlexibleUser = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  extra: Schema.optional(Schema.String)
})

// Different parsing configurations
const parseWithOptions = {
  // Strict mode - no excess properties
  strict: ParseResult.decodeUnknownEither(FlexibleUser, { 
    onExcessProperty: 'error' 
  }),
  
  // Permissive mode - preserve excess properties  
  permissive: ParseResult.decodeUnknownEither(FlexibleUser, { 
    onExcessProperty: 'preserve' 
  }),
  
  // Ignore excess properties
  ignore: ParseResult.decodeUnknownEither(FlexibleUser, { 
    onExcessProperty: 'ignore' 
  }),
  
  // Collect all errors
  allErrors: ParseResult.decodeUnknownEither(FlexibleUser, { 
    errors: 'all' 
  })
}

// Usage examples
const testData = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  unexpectedField: 'should cause error in strict mode'
}

const strictResult = parseWithOptions.strict(testData)
// Will fail due to unexpectedField

const permissiveResult = parseWithOptions.permissive(testData)
// Will succeed and include unexpectedField in result

const ignoreResult = parseWithOptions.ignore(testData)
// Will succeed but drop unexpectedField
```

### Feature 3: Error Recovery and Fallbacks

```typescript
import { ParseResult, Schema } from "effect"
import { Either, Option, Effect } from "effect"

// Schema with fallback strategies
const ConfigValue = Schema.String.pipe(
  Schema.transform(
    Schema.Union(Schema.String, Schema.Number),
    {
      strict: true,
      decode: (str) => {
        // Try to parse as number first
        const num = Number(str)
        return !Number.isNaN(num) ? num : str
      },
      encode: (value) => String(value)
    }
  )
)

// Robust configuration parser with fallbacks
const parseConfigWithFallback = <T>(
  schema: Schema.Schema<T>,
  input: unknown,
  fallback: T
): T => {
  const parseResult = ParseResult.decodeUnknownOption(schema)(input)
  
  return Option.match(parseResult, {
    onNone: () => {
      console.warn('Using fallback configuration due to parsing error')
      return fallback
    },
    onSome: (value) => value
  })
}

// Multi-source configuration loading
const loadConfigFromMultipleSources = (sources: unknown[]) => Effect.gen(function* () {
  const AppConfig = Schema.Struct({
    apiUrl: Schema.String,
    timeout: Schema.Number,
    retries: Schema.Number
  })
  
  for (const source of sources) {
    const result = ParseResult.decodeUnknownOption(AppConfig)(source)
    
    if (Option.isSome(result)) {
      console.log('Successfully loaded configuration')
      return result.value
    }
  }
  
  // All sources failed, use defaults
  console.warn('All configuration sources failed, using defaults')
  return {
    apiUrl: 'http://localhost:3000',
    timeout: 5000,
    retries: 3
  }
})

// Usage
const configSources = [
  process.env, // Environment variables
  await loadJsonConfig('./config.json'), // JSON file
  await loadYamlConfig('./config.yaml'), // YAML file
  getRemoteConfig() // Remote configuration
]

const config = await loadConfigFromMultipleSources(configSources)
```

## Practical Patterns & Best Practices

### Pattern 1: Validation Pipeline Builder

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either, Array as Arr } from "effect"

// Reusable validation pipeline
class ValidationPipeline<T> {
  constructor(private schema: Schema.Schema<T>) {}
  
  // Parse with different strategies
  parseEither = (input: unknown) => 
    ParseResult.decodeUnknownEither(this.schema)(input)
    
  parseOption = (input: unknown) => 
    ParseResult.decodeUnknownOption(this.schema)(input)
    
  parseEffect = (input: unknown) => 
    ParseResult.decodeUnknown(this.schema)(input)
  
  // Validation with custom error handling
  validateWithRecovery = (
    input: unknown,
    recovery: (issue: ParseResult.ParseIssue) => T
  ): T => {
    const result = this.parseEither(input)
    
    return Either.match(result, {
      onLeft: recovery,
      onRight: (value) => value
    })
  }
  
  // Batch validation
  validateBatch = (inputs: unknown[]) => {
    const results = inputs.map(input => ({
      input,
      result: this.parseEither(input)
    }))
    
    const successful = results
      .filter(r => Either.isRight(r.result))
      .map(r => (r.result as Either.Right<any, any>).right)
    
    const failed = results
      .filter(r => Either.isLeft(r.result))
      .map(r => ({
        input: r.input,
        error: ParseResult.TreeFormatter.formatIssueSync(
          (r.result as Either.Left<any, any>).left
        )
      }))
    
    return { successful, failed }
  }
  
  // Schema composition
  extend<U>(additionalSchema: Schema.Schema<U>) {
    const combined = Schema.Struct({
      original: this.schema,
      additional: additionalSchema
    })
    
    return new ValidationPipeline(combined)
  }
}

// Usage
const UserValidator = new ValidationPipeline(Schema.Struct({
  id: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.positive())
}))

// Validate with recovery
const user = UserValidator.validateWithRecovery(
  invalidUserData,
  (issue) => {
    console.error('Validation failed, using default user')
    return getDefaultUser()
  }
)

// Batch validation
const userBatch = [userData1, userData2, userData3]
const batchResult = UserValidator.validateBatch(userBatch)

console.log(`${batchResult.successful.length} users validated successfully`)
console.log(`${batchResult.failed.length} users failed validation`)
```

### Pattern 2: Typed Error Handling

```typescript
import { ParseResult, Schema } from "effect"
import { Data, Either, Match } from "effect"

// Custom typed errors for different failure modes
class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string
  readonly message: string
  readonly code: string
}> {}

class TransformationError extends Data.TaggedError("TransformationError")<{
  readonly input: unknown
  readonly expectedType: string
}> {}

class CompositeValidationError extends Data.TaggedError("CompositeValidationError")<{
  readonly errors: readonly ValidationError[]
}> {}

// Convert ParseIssue to typed errors
const convertParseIssue = (issue: ParseResult.ParseIssue): ValidationError | CompositeValidationError => {
  const errors = ParseResult.ArrayFormatter.formatIssueSync(issue)
  
  if (errors.length === 1) {
    const error = errors[0]
    return new ValidationError({
      field: error.path.join('.'),
      message: error.message,
      code: error._tag
    })
  }
  
  return new CompositeValidationError({
    errors: errors.map(error => new ValidationError({
      field: error.path.join('.'),
      message: error.message,
      code: error._tag
    }))
  })
}

// Validation helper with typed errors
const validateWithTypedErrors = <T>(
  schema: Schema.Schema<T>,
  input: unknown
): Either.Either<T, ValidationError | CompositeValidationError> => {
  const result = ParseResult.decodeUnknownEither(schema)(input)
  
  return Either.mapLeft(result, convertParseIssue)
}

// Usage with pattern matching
const handleUserValidation = (userData: unknown) => {
  const UserSchema = Schema.Struct({
    id: Schema.String,
    email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
  })
  
  const result = validateWithTypedErrors(UserSchema, userData)
  
  return Either.match(result, {
    onLeft: (error) => Match.value(error).pipe(
      Match.when({ _tag: "ValidationError" }, (err) => 
        handleSingleFieldError(err.field, err.message)
      ),
      Match.when({ _tag: "CompositeValidationError" }, (err) =>
        handleMultipleFieldErrors(err.errors)
      ),
      Match.exhaustive
    ),
    onRight: (user) => processValidUser(user)
  })
}

const handleSingleFieldError = (field: string, message: string) => ({
  success: false,
  field,
  message
})

const handleMultipleFieldErrors = (errors: readonly ValidationError[]) => ({
  success: false,
  errors: errors.map(err => ({
    field: err.field,
    message: err.message
  }))
})
```

### Pattern 3: Schema Registry and Caching

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either, HashMap } from "effect"

// Schema registry for reusable validation logic
class SchemaRegistry {
  private schemas = HashMap.empty<string, Schema.Schema<any>>()
  private parsers = HashMap.empty<string, Function>()
  
  register<T>(name: string, schema: Schema.Schema<T>) {
    this.schemas = HashMap.set(this.schemas, name, schema)
    
    // Pre-compile parsers for performance
    this.parsers = HashMap.set(this.parsers, `${name}:either`, 
      ParseResult.decodeUnknownEither(schema))
    this.parsers = HashMap.set(this.parsers, `${name}:option`, 
      ParseResult.decodeUnknownOption(schema))
    this.parsers = HashMap.set(this.parsers, `${name}:sync`, 
      ParseResult.decodeUnknownSync(schema))
    
    return this
  }
  
  parseEither<T>(name: string, input: unknown): Either.Either<T, ParseResult.ParseIssue> {
    const parser = HashMap.get(this.parsers, `${name}:either`)
    
    if (parser._tag === 'None') {
      throw new Error(`Schema '${name}' not found`)
    }
    
    return parser.value(input)
  }
  
  parseSync<T>(name: string, input: unknown): T {
    const parser = HashMap.get(this.parsers, `${name}:sync`)
    
    if (parser._tag === 'None') {
      throw new Error(`Schema '${name}' not found`)
    }
    
    return parser.value(input)
  }
  
  // Get schema composition
  compose(names: string[]) {
    const schemas = names.map(name => {
      const schema = HashMap.get(this.schemas, name)
      if (schema._tag === 'None') {
        throw new Error(`Schema '${name}' not found`)
      }
      return schema.value
    })
    
    return Schema.Struct(
      Object.fromEntries(
        names.map((name, i) => [name, schemas[i]])
      )
    )
  }
}

// Global schema registry
const registry = new SchemaRegistry()
  .register('User', Schema.Struct({
    id: Schema.String,
    email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
    name: Schema.String
  }))
  .register('Product', Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    price: Schema.Number.pipe(Schema.positive())
  }))
  .register('Order', Schema.Struct({
    id: Schema.String,
    userId: Schema.String,
    items: Schema.Array(Schema.String)
  }))

// Usage
const validateUser = (data: unknown) => {
  const result = registry.parseEither<User>('User', data)
  
  return Either.match(result, {
    onLeft: (issue) => ({
      valid: false,
      errors: ParseResult.ArrayFormatter.formatIssueSync(issue)
    }),
    onRight: (user) => ({
      valid: true,
      data: user
    })
  })
}

// Compose schemas
const OrderWithUserAndProducts = registry.compose(['Order', 'User', 'Product'])
const validateCompleteOrder = ParseResult.decodeUnknownEither(OrderWithUserAndProducts)
```

## Integration Examples

### Integration with React Hook Form

```typescript
import { ParseResult, Schema } from "effect"
import { Either } from "effect"
import { useForm } from "react-hook-form"

// Form schema
const ContactFormSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(2)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  message: Schema.String.pipe(Schema.minLength(10)),
  category: Schema.Literal('general', 'support', 'sales')
})

type ContactForm = Schema.Schema.Type<typeof ContactFormSchema>

// React Hook Form integration
const ContactFormComponent = () => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ContactForm>()
  
  const validateForm = (data: ContactForm) => {
    const result = ParseResult.decodeUnknownEither(ContactFormSchema)(data)
    
    return Either.match(result, {
      onLeft: (issue) => {
        // Convert ParseResult errors to React Hook Form errors
        const fieldErrors = ParseResult.ArrayFormatter.formatIssueSync(issue)
        
        fieldErrors.forEach(error => {
          const fieldPath = error.path.join('.') as keyof ContactForm
          setError(fieldPath, {
            type: 'validation',
            message: error.message
          })
        })
        
        return false
      },
      onRight: (validData) => {
        submitForm(validData)
        return true
      }
    })
  }
  
  const onSubmit = handleSubmit(validateForm)
  
  return (
    <form onSubmit={onSubmit}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <textarea {...register('message')} placeholder="Message" />
      {errors.message && <span>{errors.message.message}</span>}
      
      <select {...register('category')}>
        <option value="general">General</option>
        <option value="support">Support</option>
        <option value="sales">Sales</option>
      </select>
      {errors.category && <span>{errors.category.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Integration with Express.js Middleware

```typescript
import { ParseResult, Schema } from "effect"
import { Either } from "effect"
import express from 'express'

// Request validation middleware factory
const validateRequest = <T>(schema: Schema.Schema<T>) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const parser = ParseResult.decodeUnknownEither(schema)
    const result = parser(req.body)
    
    Either.match(result, {
      onLeft: (issue) => {
        const errors = ParseResult.ArrayFormatter.formatIssueSync(issue)
        res.status(400).json({
          error: 'Validation failed',
          details: errors.map(error => ({
            field: error.path.join('.'),
            message: error.message,
            code: error._tag
          }))
        })
      },
      onRight: (validData) => {
        req.body = validData // Attach validated data
        next()
      }
    })
  }
}

// Schema definitions
const CreateUserSchema = Schema.Struct({
  username: Schema.String.pipe(Schema.minLength(3)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  password: Schema.String.pipe(Schema.minLength(8))
})

const UpdateUserSchema = Schema.Struct({
  username: Schema.optional(Schema.String.pipe(Schema.minLength(3))),
  email: Schema.optional(Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))),
  bio: Schema.optional(Schema.String)
})

// Express routes with validation
const app = express()

app.post('/users', validateRequest(CreateUserSchema), (req, res) => {
  // req.body is now typed and validated
  const userData = req.body as Schema.Schema.Type<typeof CreateUserSchema>
  
  // Create user logic
  res.json({ message: 'User created', user: userData })
})

app.put('/users/:id', validateRequest(UpdateUserSchema), (req, res) => {
  const updateData = req.body as Schema.Schema.Type<typeof UpdateUserSchema>
  
  // Update user logic  
  res.json({ message: 'User updated', data: updateData })
})
```

### Integration with Database Models

```typescript
import { ParseResult, Schema } from "effect"
import { Effect, Either, Array as Arr } from "effect"

// Database entity schemas
const DatabaseUser = Schema.Struct({
  id: Schema.Number,
  username: Schema.String,
  email: Schema.String,
  created_at: Schema.String.pipe(Schema.parseDate()),
  updated_at: Schema.String.pipe(Schema.parseDate()),
  is_active: Schema.Boolean
})

const ApiUser = Schema.Struct({
  id: Schema.String, // Convert number to string for API
  username: Schema.String,
  email: Schema.String,
  createdAt: Schema.String, // Convert snake_case to camelCase
  updatedAt: Schema.String,
  isActive: Schema.Boolean
})

// Transformation schemas
const DatabaseToApiUser = Schema.transform(
  DatabaseUser,
  ApiUser,
  {
    strict: true,
    decode: (dbUser) => ({
      id: String(dbUser.id),
      username: dbUser.username,
      email: dbUser.email,
      createdAt: dbUser.created_at.toISOString(),
      updatedAt: dbUser.updated_at.toISOString(),
      isActive: dbUser.is_active
    }),
    encode: (apiUser) => ({
      id: Number(apiUser.id),
      username: apiUser.username,
      email: apiUser.email,
      created_at: new Date(apiUser.createdAt),
      updated_at: new Date(apiUser.updatedAt),
      is_active: apiUser.isActive
    })
  }
)

// Repository with built-in validation
class UserRepository {
  private parseDbUser = ParseResult.decodeUnknownEither(DatabaseUser)
  private transformToApi = ParseResult.decodeUnknownEither(DatabaseToApiUser)
  
  async findById(id: number): Promise<Either.Either<ApiUser, Error>> {
    try {
      const dbResult = await this.executeQuery('SELECT * FROM users WHERE id = ?', [id])
      
      if (!dbResult.length) {
        return Either.left(new Error('User not found'))
      }
      
      const userResult = this.parseDbUser(dbResult[0])
      
      return Either.flatMap(userResult, (dbUser) => {
        const apiResult = this.transformToApi(dbUser)
        return Either.mapLeft(apiResult, 
          (issue) => new Error(`Database parsing error: ${ParseResult.TreeFormatter.formatIssueSync(issue)}`)
        )
      })
    } catch (error) {
      return Either.left(error as Error)
    }
  }
  
  async findAll(limit = 10): Promise<Either.Either<ApiUser[], Error>> {
    try {
      const dbResults = await this.executeQuery('SELECT * FROM users LIMIT ?', [limit])
      
      const parseResults = dbResults.map(row => this.parseDbUser(row))
      const failures = parseResults.filter(Either.isLeft)
      
      if (failures.length > 0) {
        const errorMessages = failures.map(failure => 
          ParseResult.TreeFormatter.formatIssueSync(failure.left)
        )
        return Either.left(new Error(`Database parsing errors: ${errorMessages.join(', ')}`))
      }
      
      const dbUsers = parseResults.map(result => (result as Either.Right<any, any>).right)
      const transformResults = dbUsers.map(dbUser => this.transformToApi(dbUser))
      const transformFailures = transformResults.filter(Either.isLeft)
      
      if (transformFailures.length > 0) {
        return Either.left(new Error('Transformation errors occurred'))
      }
      
      const apiUsers = transformResults.map(result => (result as Either.Right<any, any>).right)
      return Either.right(apiUsers)
    } catch (error) {
      return Either.left(error as Error)
    }
  }
  
  private async executeQuery(query: string, params: any[]): Promise<any[]> {
    // Mock database query implementation
    return []
  }
}

// Usage
const userRepo = new UserRepository()

const getUserHandler = async (req: express.Request, res: express.Response) => {
  const userId = Number(req.params.id)
  const result = await userRepo.findById(userId)
  
  Either.match(result, {
    onLeft: (error) => {
      res.status(404).json({ error: error.message })
    },
    onRight: (user) => {
      res.json({ user })
    }
  })
}
```

## Conclusion

ParseResult provides type-safe, composable, and effect-aware parsing for TypeScript applications with deep integration into the Effect ecosystem.

Key benefits:
- **Type Safety**: Full TypeScript integration with automatic type inference
- **Rich Error Handling**: Detailed error information with customizable formatting
- **Effect Integration**: Seamless composition with Effect's functional programming patterns
- **Multiple Parsing Modes**: Synchronous, asynchronous, and Promise-based parsing options
- **Extensible Error Formatting**: Multiple formatters for different display contexts
- **Schema Composition**: Reusable validation logic that scales with your application

ParseResult is ideal for applications that need robust data validation, API parsing, configuration management, and form processing with Effect's powerful abstractions for error handling and async operations.