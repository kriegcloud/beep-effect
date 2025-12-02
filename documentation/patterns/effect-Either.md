# Either: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Either Solves

Modern applications need explicit error handling without exceptions, validation with multiple error types, and clear success/failure paths. Traditional approaches create several challenges:

```typescript
// Traditional approach - try/catch with exceptions
async function parseUserData(data: unknown): Promise<User> {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }
    
    const obj = data as Record<string, unknown>;
    
    if (!obj.name || typeof obj.name !== 'string') {
      throw new Error('Name is required and must be a string');
    }
    
    if (!obj.email || typeof obj.email !== 'string') {
      throw new Error('Email is required and must be a string');
    }
    
    if (!obj.age || typeof obj.age !== 'number') {
      throw new Error('Age is required and must be a number');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(obj.email)) {
      throw new Error('Invalid email format');
    }
    
    if (obj.age < 0 || obj.age > 150) {
      throw new Error('Age must be between 0 and 150');
    }
    
    return {
      name: obj.name,
      email: obj.email,
      age: obj.age
    };
  } catch (error) {
    // Lost type information - what specific error occurred?
    // Can't distinguish between different validation failures
    // Exception handling breaks normal control flow
    throw error;
  }
}

// Union type approach - better but verbose
type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

function validateUser(data: unknown): ValidationResult<User> {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid data format' };
  }
  
  const obj = data as Record<string, unknown>;
  
  if (!obj.name || typeof obj.name !== 'string') {
    return { success: false, error: 'Name is required and must be a string' };
  }
  
  // ... more validation with repetitive error handling
  // Still verbose and error-prone
  // No composability or error accumulation
}
```

This approach leads to:
- **Exception-based control flow** - Exceptions break normal program flow and are harder to reason about
- **Lost type information** - Generic Error types don't preserve specific failure details
- **No composability** - Difficult to combine validation rules or accumulate multiple errors
- **Verbose error handling** - Repetitive pattern matching and error propagation code

### The Either Solution

Either provides explicit error handling with Left (error) and Right (success) values, enabling clear success/failure paths and composable error handling:

```typescript
import { Either } from "effect"

// Type-safe validation with Either
const validateName = (value: unknown): Either.Either<string, string> =>
  typeof value === 'string' && value.length > 0
    ? Either.right(value)
    : Either.left('Name is required and must be a non-empty string')

const validateEmail = (value: unknown): Either.Either<string, string> => {
  if (typeof value !== 'string') {
    return Either.left('Email must be a string')
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
    ? Either.right(value)
    : Either.left('Invalid email format')
}

const validateAge = (value: unknown): Either.Either<number, string> => {
  if (typeof value !== 'number') {
    return Either.left('Age must be a number')
  }
  
  return value >= 0 && value <= 150
    ? Either.right(value)
    : Either.left('Age must be between 0 and 150')
}

// Clean, composable validation
const parseUserData = (data: unknown): Either.Either<User, string> => {
  if (!data || typeof data !== 'object') {
    return Either.left('Invalid data format')
  }
  
  const obj = data as Record<string, unknown>
  
  return Either.gen(function* () {
    const name = yield* validateName(obj.name)
    const email = yield* validateEmail(obj.email)
    const age = yield* validateAge(obj.age)
    
    return { name, email, age }
  })
}
```

### Key Concepts

**Either<R, L>**: A discriminated union representing either a Right value (success) of type R or a Left value (error) of type L.

**Left**: Represents failure/error cases - `Either.left("error message")`

**Right**: Represents success cases - `Either.right(42)`

**Short-circuiting**: Operations stop at the first Left encountered, similar to exception handling but explicit

**Composability**: Either values can be combined, mapped, and chained without nested error checking

## Basic Usage Patterns

### Pattern 1: Creating Either Values

```typescript
import { Either } from "effect"

// Creating success values
const successResult = Either.right(42)
const user = Either.right({ name: "Alice", age: 30 })

// Creating error values
const errorResult = Either.left("Something went wrong")
const validationError = Either.left({ field: "email", message: "Invalid format" })

// Conditional creation
const divide = (a: number, b: number): Either.Either<number, string> =>
  b === 0 ? Either.left("Division by zero") : Either.right(a / b)

console.log(divide(10, 2)) // Right(5)
console.log(divide(10, 0)) // Left("Division by zero")
```

### Pattern 2: Pattern Matching and Guards

```typescript
import { Either } from "effect"

const result = divide(10, 2)

// Pattern matching with match
const message = Either.match(result, {
  onLeft: (error) => `Error: ${error}`,
  onRight: (value) => `Success: ${value}`
})

// Type guards for conditional logic
if (Either.isRight(result)) {
  console.log(`The result is: ${result.right}`)
  // TypeScript knows result.right exists and is a number
} else {
  console.log(`Error occurred: ${result.left}`)
  // TypeScript knows result.left exists and is a string
}

// Safe value extraction
const value = Either.getOrElse(result, () => 0) // Returns value or default
const maybeValue = Either.getOrNull(result) // Returns value or null
```

### Pattern 3: Transforming Values

```typescript
import { Either } from "effect"

const parseNumber = (str: string): Either.Either<number, string> => {
  const num = Number(str)
  return isNaN(num) ? Either.left(`"${str}" is not a number`) : Either.right(num)
}

// Transform success values
const doubleIfSuccess = Either.map(parseNumber("10"), n => n * 2)
console.log(doubleIfSuccess) // Right(20)

// Transform error values
const friendlyError = Either.mapLeft(
  parseNumber("abc"), 
  error => `Parsing failed: ${error}`
)
console.log(friendlyError) // Left("Parsing failed: \"abc\" is not a number")

// Transform both cases
const formatResult = Either.mapBoth(parseNumber("5"), {
  onLeft: error => ({ type: 'error', message: error }),
  onRight: value => ({ type: 'success', data: value })
})
```

## Real-World Examples

### Example 1: Form Validation with Field Errors

Form validation is a perfect use case for Either, allowing us to handle field-specific errors and combine validation results:

```typescript
import { Either } from "effect"

// Define our domain types
interface User {
  name: string
  email: string
  age: number
  password: string
}

interface FieldError {
  field: string
  message: string
}

interface FormData {
  name?: string
  email?: string
  age?: string
  password?: string
  confirmPassword?: string
}

// Individual field validators
const validateName = (name: string | undefined): Either.Either<string, FieldError> =>
  !name || name.trim().length === 0
    ? Either.left({ field: 'name', message: 'Name is required' })
    : name.trim().length < 2
    ? Either.left({ field: 'name', message: 'Name must be at least 2 characters' })
    : Either.right(name.trim())

const validateEmail = (email: string | undefined): Either.Either<string, FieldError> => {
  if (!email || email.trim().length === 0) {
    return Either.left({ field: 'email', message: 'Email is required' })
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
    ? Either.right(email.trim())
    : Either.left({ field: 'email', message: 'Invalid email format' })
}

const validateAge = (age: string | undefined): Either.Either<number, FieldError> => {
  if (!age || age.trim().length === 0) {
    return Either.left({ field: 'age', message: 'Age is required' })
  }
  
  const numAge = Number(age)
  if (isNaN(numAge)) {
    return Either.left({ field: 'age', message: 'Age must be a valid number' })
  }
  
  return numAge >= 18 && numAge <= 120
    ? Either.right(numAge)
    : Either.left({ field: 'age', message: 'Age must be between 18 and 120' })
}

const validatePassword = (password: string | undefined): Either.Either<string, FieldError> => {
  if (!password || password.length === 0) {
    return Either.left({ field: 'password', message: 'Password is required' })
  }
  
  if (password.length < 8) {
    return Either.left({ field: 'password', message: 'Password must be at least 8 characters' })
  }
  
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return Either.left({ 
      field: 'password', 
      message: 'Password must contain uppercase, lowercase, and number' 
    })
  }
  
  return Either.right(password)
}

const validatePasswordConfirmation = (
  password: string | undefined, 
  confirmPassword: string | undefined
): Either.Either<string, FieldError> =>
  password === confirmPassword
    ? Either.right(password!)
    : Either.left({ field: 'confirmPassword', message: 'Passwords do not match' })

// Complete form validation using Either.gen
const validateUserForm = (form: FormData): Either.Either<User, FieldError> => 
  Either.gen(function* () {
    const name = yield* validateName(form.name)
    const email = yield* validateEmail(form.email)
    const age = yield* validateAge(form.age)
    const password = yield* validatePassword(form.password)
    yield* validatePasswordConfirmation(form.password, form.confirmPassword)
    
    return { name, email, age, password }
  })

// Usage example
const formData: FormData = {
  name: "Alice Johnson",
  email: "alice@example.com", 
  age: "25",
  password: "SecurePass123",
  confirmPassword: "SecurePass123"
}

const validationResult = validateUserForm(formData)

Either.match(validationResult, {
  onLeft: (error) => {
    console.log(`Validation failed for ${error.field}: ${error.message}`)
    // In a real app, you'd highlight the specific field in the UI
  },
  onRight: (user) => {
    console.log('User data is valid:', user)
    // Proceed with user registration/submission
  }
})
```

### Example 2: API Response Parsing with Type Safety

Either excels at parsing API responses where different error conditions need different handling:

```typescript
import { Either } from "effect"

// API response types
interface ApiSuccess<T> {
  data: T
  status: 'success'
}

interface ApiError {
  error: string
  code: number
  status: 'error'
}

interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

interface Post {
  id: number
  title: string
  content: string
  authorId: number
  publishedAt: string
}

// Parse different API error types
const parseApiError = (response: unknown): Either.Either<never, string> => {
  if (typeof response === 'object' && response !== null) {
    const obj = response as any
    if (obj.status === 'error') {
      return Either.left(`API Error ${obj.code}: ${obj.error}`)
    }
  }
  return Either.left('Unknown API error format')
}

// Parse successful API responses
const parseUser = (data: unknown): Either.Either<User, string> => {
  if (!data || typeof data !== 'object') {
    return Either.left('Invalid user data format')
  }
  
  const user = data as any
  
  return Either.gen(function* () {
    const id = typeof user.id === 'number' 
      ? Either.right(user.id)
      : Either.left('User ID must be a number')
    
    const name = typeof user.name === 'string' && user.name.length > 0
      ? Either.right(user.name)
      : Either.left('User name must be a non-empty string')
    
    const email = typeof user.email === 'string' && user.email.includes('@')
      ? Either.right(user.email)
      : Either.left('User email must be a valid email string')
    
    const createdAt = typeof user.createdAt === 'string'
      ? Either.right(user.createdAt)
      : Either.left('User createdAt must be a string')
    
    return {
      id: yield* id,
      name: yield* name,
      email: yield* email,
      createdAt: yield* createdAt
    }
  })
}

const parsePost = (data: unknown): Either.Either<Post, string> => {
  if (!data || typeof data !== 'object') {
    return Either.left('Invalid post data format')
  }
  
  const post = data as any
  
  return Either.gen(function* () {
    const id = typeof post.id === 'number'
      ? Either.right(post.id)
      : Either.left('Post ID must be a number')
    
    const title = typeof post.title === 'string' && post.title.length > 0
      ? Either.right(post.title)
      : Either.left('Post title must be a non-empty string')
    
    const content = typeof post.content === 'string'
      ? Either.right(post.content)
      : Either.left('Post content must be a string')
    
    const authorId = typeof post.authorId === 'number'
      ? Either.right(post.authorId)
      : Either.left('Post authorId must be a number')
    
    const publishedAt = typeof post.publishedAt === 'string'
      ? Either.right(post.publishedAt)
      : Either.left('Post publishedAt must be a string')
    
    return {
      id: yield* id,
      title: yield* title,
      content: yield* content,
      authorId: yield* authorId,
      publishedAt: yield* publishedAt
    }
  })
}

// Generic API response handler
const handleApiResponse = <T>(
  response: unknown, 
  parser: (data: unknown) => Either.Either<T, string>
): Either.Either<T, string> => {
  if (!response || typeof response !== 'object') {
    return Either.left('Invalid API response format')
  }
  
  const obj = response as any
  
  if (obj.status === 'error') {
    return parseApiError(response)
  }
  
  if (obj.status === 'success' && obj.data) {
    return parser(obj.data)
  }
  
  return Either.left('Unexpected API response format')
}

// Simulate API calls that return different response formats
const fetchUser = async (id: number): Promise<Either.Either<User, string>> => {
  try {
    // Simulate successful response
    const mockResponse = {
      status: 'success',
      data: {
        id,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        createdAt: '2024-01-15T10:00:00Z'
      }
    }
    
    return handleApiResponse(mockResponse, parseUser)
  } catch (error) {
    return Either.left(`Network error: ${error}`)
  }
}

const fetchUserPosts = async (userId: number): Promise<Either.Either<Post[], string>> => {
  try {
    // Simulate error response
    const mockErrorResponse = {
      status: 'error',
      error: 'User not found',
      code: 404
    }
    
    return Either.left('API Error 404: User not found')
  } catch (error) {
    return Either.left(`Network error: ${error}`)
  }
}

// Usage with proper error handling
const displayUserProfile = async (userId: number) => {
  const userResult = await fetchUser(userId)
  
  return Either.match(userResult, {
    onLeft: (error) => ({
      success: false,
      error,
      data: null
    }),
    onRight: async (user) => {
      const postsResult = await fetchUserPosts(user.id)
      
      return Either.match(postsResult, {
        onLeft: (error) => ({
          success: true,
          error: `Could not load posts: ${error}`,
          data: { user, posts: [] }
        }),
        onRight: (posts) => ({
          success: true,
          error: null,
          data: { user, posts }
        })
      })
    }
  })
}
```

### Example 3: Data Transformation Pipeline

Either is excellent for building data transformation pipelines where each step can fail:

```typescript
import { Either } from "effect"

// Raw CSV data processing pipeline
interface RawRecord {
  [key: string]: string
}

interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

interface ProcessingStats {
  total: number
  successful: number
  failed: number
  errors: string[]
}

// Pipeline step functions
const parseId = (value: string): Either.Either<number, string> => {
  const id = parseInt(value, 10)
  return isNaN(id) || id <= 0
    ? Either.left(`Invalid ID: "${value}"`)
    : Either.right(id)
}

const parseName = (value: string): Either.Either<string, string> => {
  const name = value.trim()
  return name.length === 0
    ? Either.left('Name cannot be empty')
    : name.length > 100
    ? Either.left('Name too long (max 100 characters)')
    : Either.right(name)
}

const parsePrice = (value: string): Either.Either<number, string> => {
  const price = parseFloat(value)
  return isNaN(price) || price < 0
    ? Either.left(`Invalid price: "${value}"`)
    : Either.right(price)
}

const parseCategory = (value: string): Either.Either<string, string> => {
  const category = value.trim().toLowerCase()
  const validCategories = ['electronics', 'clothing', 'books', 'home', 'sports']
  
  return validCategories.includes(category)
    ? Either.right(category)
    : Either.left(`Invalid category: "${value}". Must be one of: ${validCategories.join(', ')}`)
}

const parseInStock = (value: string): Either.Either<boolean, string> => {
  const normalized = value.trim().toLowerCase()
  
  if (normalized === 'true' || normalized === 'yes' || normalized === '1') {
    return Either.right(true)
  }
  
  if (normalized === 'false' || normalized === 'no' || normalized === '0') {
    return Either.right(false)
  }
  
  return Either.left(`Invalid stock status: "${value}". Expected true/false, yes/no, or 1/0`)
}

// Transform a single record
const transformRecord = (record: RawRecord, rowNumber: number): Either.Either<Product, string> => 
  Either.gen(function* () {
    const id = yield* Either.mapLeft(
      parseId(record.id || ''), 
      error => `Row ${rowNumber}: ${error}`
    )
    
    const name = yield* Either.mapLeft(
      parseName(record.name || ''), 
      error => `Row ${rowNumber}: ${error}`
    )
    
    const price = yield* Either.mapLeft(
      parsePrice(record.price || ''), 
      error => `Row ${rowNumber}: ${error}`
    )
    
    const category = yield* Either.mapLeft(
      parseCategory(record.category || ''), 
      error => `Row ${rowNumber}: ${error}`
    )
    
    const inStock = yield* Either.mapLeft(
      parseInStock(record.inStock || ''), 
      error => `Row ${rowNumber}: ${error}`
    )
    
    return { id, name, price, category, inStock }
  })

// Process entire dataset
const processProductData = (rawData: RawRecord[]): {
  products: Product[]
  stats: ProcessingStats
} => {
  const results = rawData.map((record, index) => 
    transformRecord(record, index + 1)
  )
  
  const products: Product[] = []
  const errors: string[] = []
  
  results.forEach(result => {
    Either.match(result, {
      onLeft: (error) => errors.push(error),
      onRight: (product) => products.push(product)
    })
  })
  
  return {
    products,
    stats: {
      total: rawData.length,
      successful: products.length,
      failed: errors.length,
      errors
    }
  }
}

// Enhanced processing with validation rules
const validateBusinessRules = (product: Product): Either.Either<Product, string> => {
  // Rule 1: Electronics over $1000 must be in stock
  if (product.category === 'electronics' && product.price > 1000 && !product.inStock) {
    return Either.left(`High-value electronics must be in stock: ${product.name}`)
  }
  
  // Rule 2: Books cannot cost more than $100
  if (product.category === 'books' && product.price > 100) {
    return Either.left(`Book price too high: ${product.name} costs $${product.price}`)
  }
  
  return Either.right(product)
}

const processWithBusinessRules = (rawData: RawRecord[]) => {
  const initialProcessing = processProductData(rawData)
  
  // Apply business rules to successfully parsed products
  const businessValidationResults = initialProcessing.products.map(product =>
    validateBusinessRules(product)
  )
  
  const finalProducts: Product[] = []
  const businessRuleErrors: string[] = []
  
  businessValidationResults.forEach(result => {
    Either.match(result, {
      onLeft: (error) => businessRuleErrors.push(error),
      onRight: (product) => finalProducts.push(product)
    })
  })
  
  return {
    products: finalProducts,
    stats: {
      ...initialProcessing.stats,
      failed: initialProcessing.stats.failed + businessRuleErrors.length,
      errors: [...initialProcessing.stats.errors, ...businessRuleErrors]
    }
  }
}

// Example usage
const sampleData: RawRecord[] = [
  { id: '1', name: 'Laptop Pro', price: '1299.99', category: 'electronics', inStock: 'true' },
  { id: '2', name: 'Novel Book', price: '15.99', category: 'books', inStock: 'false' },
  { id: 'abc', name: 'Invalid Product', price: 'not-a-price', category: 'invalid', inStock: 'maybe' },
  { id: '3', name: 'Expensive Book', price: '150.00', category: 'books', inStock: 'true' },
  { id: '4', name: 'Phone', price: '899.99', category: 'electronics', inStock: 'false' }
]

const result = processWithBusinessRules(sampleData)
console.log('Processing Results:', result)
```

### Example 4: Configuration Parsing and Environment Variables

Either is perfect for parsing configuration files and environment variables where different validation rules apply:

```typescript
import { Either } from "effect"

// Configuration types
interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  connectionTimeout: number
}

interface ServerConfig {
  port: number
  host: string
  environment: 'development' | 'staging' | 'production'
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

interface ApiConfig {
  version: string
  baseUrl: string
  timeout: number
  retries: number
  rateLimit: number
}

interface AppConfig {
  database: DatabaseConfig
  server: ServerConfig
  api: ApiConfig
}

// Environment variable parsers
const parseStringEnv = (key: string, defaultValue?: string): Either.Either<string, string> => {
  const value = process.env[key]
  
  if (!value) {
    return defaultValue 
      ? Either.right(defaultValue)
      : Either.left(`Missing required environment variable: ${key}`)
  }
  
  return Either.right(value)
}

const parseNumberEnv = (key: string, defaultValue?: number): Either.Either<number, string> => {
  const value = process.env[key]
  
  if (!value) {
    return defaultValue !== undefined
      ? Either.right(defaultValue)
      : Either.left(`Missing required environment variable: ${key}`)
  }
  
  const parsed = parseInt(value, 10)
  return isNaN(parsed)
    ? Either.left(`Environment variable ${key} must be a valid number, got: ${value}`)
    : Either.right(parsed)
}

const parseBooleanEnv = (key: string, defaultValue?: boolean): Either.Either<boolean, string> => {
  const value = process.env[key]
  
  if (!value) {
    return defaultValue !== undefined
      ? Either.right(defaultValue)
      : Either.left(`Missing required environment variable: ${key}`)
  }
  
  const normalized = value.toLowerCase()
  
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return Either.right(true)
  }
  
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return Either.right(false)
  }
  
  return Either.left(`Environment variable ${key} must be a boolean (true/false), got: ${value}`)
}

const parseEnumEnv = <T extends string>(
  key: string, 
  validValues: readonly T[], 
  defaultValue?: T
): Either.Either<T, string> => {
  const value = process.env[key]
  
  if (!value) {
    return defaultValue !== undefined
      ? Either.right(defaultValue)
      : Either.left(`Missing required environment variable: ${key}`)
  }
  
  if (validValues.includes(value as T)) {
    return Either.right(value as T)
  }
  
  return Either.left(
    `Environment variable ${key} must be one of: ${validValues.join(', ')}, got: ${value}`
  )
}

// Validation functions with business rules
const validatePort = (port: number, context: string): Either.Either<number, string> =>
  port > 0 && port <= 65535
    ? Either.right(port)
    : Either.left(`${context} port must be between 1 and 65535, got: ${port}`)

const validateTimeout = (timeout: number, context: string): Either.Either<number, string> =>
  timeout > 0 && timeout <= 300000 // 5 minutes max
    ? Either.right(timeout)
    : Either.left(`${context} timeout must be between 1 and 300000ms, got: ${timeout}`)

const validateUrl = (url: string, context: string): Either.Either<string, string> => {
  try {
    new URL(url)
    return Either.right(url)
  } catch {
    return Either.left(`${context} must be a valid URL, got: ${url}`)
  }
}

// Configuration builders
const buildDatabaseConfig = (): Either.Either<DatabaseConfig, string> =>
  Either.gen(function* () {
    const host = yield* parseStringEnv('DB_HOST', 'localhost')
    const rawPort = yield* parseNumberEnv('DB_PORT', 5432)
    const port = yield* validatePort(rawPort, 'Database')
    
    const database = yield* parseStringEnv('DB_NAME')
    const username = yield* parseStringEnv('DB_USER')
    const password = yield* parseStringEnv('DB_PASSWORD')
    const ssl = yield* parseBooleanEnv('DB_SSL', false)
    
    const rawTimeout = yield* parseNumberEnv('DB_CONNECTION_TIMEOUT', 10000)
    const connectionTimeout = yield* validateTimeout(rawTimeout, 'Database connection')
    
    return {
      host,
      port,
      database,
      username,
      password,
      ssl,
      connectionTimeout
    }
  })

const buildServerConfig = (): Either.Either<ServerConfig, string> =>
  Either.gen(function* () {
    const rawPort = yield* parseNumberEnv('SERVER_PORT', 3000)
    const port = yield* validatePort(rawPort, 'Server')
    
    const host = yield* parseStringEnv('SERVER_HOST', '0.0.0.0')
    const environment = yield* parseEnumEnv(
      'NODE_ENV', 
      ['development', 'staging', 'production'] as const,
      'development'
    )
    const logLevel = yield* parseEnumEnv(
      'LOG_LEVEL',
      ['debug', 'info', 'warn', 'error'] as const,
      'info'
    )
    
    return { port, host, environment, logLevel }
  })

const buildApiConfig = (): Either.Either<ApiConfig, string> =>
  Either.gen(function* () {
    const version = yield* parseStringEnv('API_VERSION', 'v1')
    const rawBaseUrl = yield* parseStringEnv('API_BASE_URL', 'http://localhost:3000')
    const baseUrl = yield* validateUrl(rawBaseUrl, 'API base URL')
    
    const rawTimeout = yield* parseNumberEnv('API_TIMEOUT', 5000)
    const timeout = yield* validateTimeout(rawTimeout, 'API')
    
    const retries = yield* parseNumberEnv('API_RETRIES', 3)
    const rateLimit = yield* parseNumberEnv('API_RATE_LIMIT', 100)
    
    // Validate retries and rate limit
    const validRetries = retries >= 0 && retries <= 10
      ? Either.right(retries)
      : Either.left(`API retries must be between 0 and 10, got: ${retries}`)
    
    const validRateLimit = rateLimit > 0 && rateLimit <= 10000
      ? Either.right(rateLimit)
      : Either.left(`API rate limit must be between 1 and 10000, got: ${rateLimit}`)
    
    return {
      version,
      baseUrl,
      timeout,
      retries: yield* validRetries,
      rateLimit: yield* validRateLimit
    }
  })

// Main configuration loader
const loadAppConfig = (): Either.Either<AppConfig, string[]> => {
  const databaseResult = buildDatabaseConfig()
  const serverResult = buildServerConfig()
  const apiResult = buildApiConfig()
  
  // Collect all configuration errors instead of short-circuiting
  const errors: string[] = []
  let database: DatabaseConfig | undefined
  let server: ServerConfig | undefined
  let api: ApiConfig | undefined
  
  Either.match(databaseResult, {
    onLeft: (error) => errors.push(`Database config: ${error}`),
    onRight: (config) => database = config
  })
  
  Either.match(serverResult, {
    onLeft: (error) => errors.push(`Server config: ${error}`),
    onRight: (config) => server = config
  })
  
  Either.match(apiResult, {
    onLeft: (error) => errors.push(`API config: ${error}`),
    onRight: (config) => api = config
  })
  
  if (errors.length > 0) {
    return Either.left(errors)
  }
  
  return Either.right({
    database: database!,
    server: server!,
    api: api!
  })
}

// Cross-validation rules
const validateConfigConsistency = (config: AppConfig): Either.Either<AppConfig, string> => {
  // Ensure server and API ports don't conflict
  if (config.server.port === config.api.baseUrl.includes(`${config.server.port}`)) {
    return Either.left('Server port conflicts with API base URL port')
  }
  
  // Production environment checks
  if (config.server.environment === 'production') {
    if (!config.database.ssl) {
      return Either.left('SSL must be enabled for production database connections')
    }
    
    if (config.server.logLevel === 'debug') {
      return Either.left('Debug logging should not be used in production')
    }
  }
  
  return Either.right(config)
}

// Complete configuration loading with validation
const initializeConfig = (): Either.Either<AppConfig, string[]> => {
  const configResult = loadAppConfig()
  
  return Either.match(configResult, {
    onLeft: (errors) => Either.left(errors),
    onRight: (config) => Either.match(validateConfigConsistency(config), {
      onLeft: (error) => Either.left([error]),
      onRight: (validatedConfig) => Either.right(validatedConfig)
    })
  })
}

// Usage example
const startApplication = () => {
  const configResult = initializeConfig()
  
  Either.match(configResult, {
    onLeft: (errors) => {
      console.error('Configuration validation failed:')
      errors.forEach(error => console.error(`- ${error}`))
      process.exit(1)
    },
    onRight: (config) => {
      console.log('Configuration loaded successfully:', {
        database: `${config.database.host}:${config.database.port}/${config.database.database}`,
        server: `${config.server.host}:${config.server.port} (${config.server.environment})`,
        api: `${config.api.baseUrl} (timeout: ${config.api.timeout}ms)`
      })
      
      // Start the application with validated configuration
      // startServer(config)
    }
  })
}

// Set some example environment variables for testing
process.env.DB_NAME = 'myapp'
process.env.DB_USER = 'admin'
process.env.DB_PASSWORD = 'secret123'
process.env.NODE_ENV = 'development'

startApplication()
```

### Example 5: Business Rule Validation System

Either is excellent for implementing complex business rule validation where rules can be composed and different validation strategies are needed:

```typescript
import { Either } from "effect"

// Domain types
interface Order {
  id: string
  customerId: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  totalAmount: number
  discountCode?: string
}

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
  category: string
}

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer'
  isValid: boolean
  expiresAt?: string
}

interface Customer {
  id: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  totalOrders: number
  totalSpent: number
  region: string
}

interface Product {
  id: string
  category: string
  price: number
  inStock: boolean
  restricted: boolean
  minimumQuantity: number
  maximumQuantity?: number
}

// Business rule types
interface BusinessRule<T> {
  name: string
  validate: (data: T) => Either.Either<T, string>
}

interface ValidationContext {
  customer: Customer
  products: Map<string, Product>
  discountCodes: Map<string, { discount: number; minAmount: number }>
  restrictedRegions: Set<string>
}

// Individual business rules
const validateOrderAmount: BusinessRule<Order> = {
  name: 'Minimum Order Amount',
  validate: (order) =>
    order.totalAmount >= 10
      ? Either.right(order)
      : Either.left(`Order amount $${order.totalAmount} is below minimum $10`)
}

const validateItemQuantities: BusinessRule<{ order: Order; context: ValidationContext }> = {
  name: 'Item Quantity Limits',
  validate: ({ order, context }) => {
    for (const item of order.items) {
      const product = context.products.get(item.productId)
      
      if (!product) {
        return Either.left(`Product ${item.productId} not found`)
      }
      
      if (item.quantity < product.minimumQuantity) {
        return Either.left(
          `Item ${item.productId} quantity ${item.quantity} is below minimum ${product.minimumQuantity}`
        )
      }
      
      if (product.maximumQuantity && item.quantity > product.maximumQuantity) {
        return Either.left(
          `Item ${item.productId} quantity ${item.quantity} exceeds maximum ${product.maximumQuantity}`
        )
      }
      
      if (!product.inStock) {
        return Either.left(`Product ${item.productId} is out of stock`)
      }
    }
    
    return Either.right({ order, context })
  }
}

const validateRestrictedProducts: BusinessRule<{ order: Order; context: ValidationContext }> = {
  name: 'Restricted Product Access',
  validate: ({ order, context }) => {
    const restrictedItems = order.items.filter(item => {
      const product = context.products.get(item.productId)
      return product?.restricted === true
    })
    
    if (restrictedItems.length > 0 && context.customer.tier === 'bronze') {
      return Either.left(
        `Bronze tier customers cannot order restricted products: ${restrictedItems.map(i => i.productId).join(', ')}`
      )
    }
    
    return Either.right({ order, context })
  }
}

const validateShippingRestrictions: BusinessRule<{ order: Order; context: ValidationContext }> = {
  name: 'Shipping Region Restrictions',
  validate: ({ order, context }) => {
    const region = order.shippingAddress.country.toLowerCase()
    
    if (context.restrictedRegions.has(region)) {
      return Either.left(`Shipping to ${order.shippingAddress.country} is not available`)
    }
    
    // Check for restricted products in restricted regions
    const hasElectronics = order.items.some(item => {
      const product = context.products.get(item.productId)
      return product?.category === 'electronics'
    })
    
    if (hasElectronics && ['cn', 'ru', 'ir'].includes(region)) {
      return Either.left(`Electronics cannot be shipped to ${order.shippingAddress.country}`)
    }
    
    return Either.right({ order, context })
  }
}

const validatePaymentMethod: BusinessRule<{ order: Order; context: ValidationContext }> = {
  name: 'Payment Method Validation',
  validate: ({ order, context }) => {
    if (!order.paymentMethod.isValid) {
      return Either.left('Payment method is invalid or expired')
    }
    
    // High-value orders require secure payment methods
    if (order.totalAmount > 1000 && order.paymentMethod.type === 'bank_transfer') {
      return Either.left('Bank transfers not allowed for orders over $1000')
    }
    
    // Premium customers get special payment options
    if (order.paymentMethod.type === 'paypal' && 
        context.customer.tier === 'bronze' && 
        order.totalAmount > 500) {
      return Either.left('PayPal not available for bronze customers on orders over $500')
    }
    
    return Either.right({ order, context })
  }
}

const validateDiscountCode: BusinessRule<{ order: Order; context: ValidationContext }> = {
  name: 'Discount Code Validation',
  validate: ({ order, context }) => {
    if (!order.discountCode) {
      return Either.right({ order, context })
    }
    
    const discount = context.discountCodes.get(order.discountCode)
    
    if (!discount) {
      return Either.left(`Invalid discount code: ${order.discountCode}`)
    }
    
    if (order.totalAmount < discount.minAmount) {
      return Either.left(
        `Order amount $${order.totalAmount} is below minimum $${discount.minAmount} for discount code ${order.discountCode}`
      )
    }
    
    return Either.right({ order, context })
  }
}

const validateCustomerTierBenefits: BusinessRule<{ order: Order; context: ValidationContext }> = {
  name: 'Customer Tier Benefits',
  validate: ({ order, context }) => {
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
    
    // Bronze customers limited to 5 items per order
    if (context.customer.tier === 'bronze' && totalItems > 5) {
      return Either.left('Bronze customers are limited to 5 items per order')
    }
    
    // Silver customers get free shipping over $50
    // Gold customers get free shipping over $25
    // Platinum customers always get free shipping
    const freeShippingThreshold = {
      bronze: Infinity,
      silver: 50,
      gold: 25,
      platinum: 0
    }[context.customer.tier]
    
    if (order.totalAmount < freeShippingThreshold) {
      // This is just validation - shipping calculation would happen elsewhere
      // We're just ensuring the customer tier rules are considered
    }
    
    return Either.right({ order, context })
  }
}

// Validation orchestration
const validateOrder = (
  order: Order, 
  context: ValidationContext
): Either.Either<Order, string[]> => {
  // Rules that only need the order
  const orderOnlyRules = [validateOrderAmount]
  
  // Rules that need both order and context
  const contextualRules = [
    validateItemQuantities,
    validateRestrictedProducts,
    validateShippingRestrictions,
    validatePaymentMethod,
    validateDiscountCode,
    validateCustomerTierBenefits
  ]
  
  const errors: string[] = []
  
  // Validate order-only rules
  for (const rule of orderOnlyRules) {
    const result = rule.validate(order)
    Either.match(result, {
      onLeft: (error) => errors.push(`${rule.name}: ${error}`),
      onRight: () => {} // Continue validation
    })
  }
  
  // Validate contextual rules
  for (const rule of contextualRules) {
    const result = rule.validate({ order, context })
    Either.match(result, {
      onLeft: (error) => errors.push(`${rule.name}: ${error}`),
      onRight: () => {} // Continue validation
    })
  }
  
  return errors.length > 0 ? Either.left(errors) : Either.right(order)
}

// Advanced validation with rule prioritization
const validateOrderWithPriority = (
  order: Order,
  context: ValidationContext
): Either.Either<Order, { criticalErrors: string[]; warnings: string[] }> => {
  const criticalRules = [
    validateItemQuantities,
    validatePaymentMethod,
    validateShippingRestrictions
  ]
  
  const warningRules = [
    validateRestrictedProducts,
    validateDiscountCode,
    validateCustomerTierBenefits
  ]
  
  const criticalErrors: string[] = []
  const warnings: string[] = []
  
  // Check critical rules first
  for (const rule of criticalRules) {
    const result = rule.validate({ order, context })
    Either.match(result, {
      onLeft: (error) => criticalErrors.push(`${rule.name}: ${error}`),
      onRight: () => {}
    })
  }
  
  // If critical errors exist, return immediately
  if (criticalErrors.length > 0) {
    return Either.left({ criticalErrors, warnings: [] })
  }
  
  // Check warning rules
  for (const rule of warningRules) {
    const result = rule.validate({ order, context })
    Either.match(result, {
      onLeft: (error) => warnings.push(`${rule.name}: ${error}`),
      onRight: () => {}
    })
  }
  
  // Order passes critical validation but may have warnings
  return warnings.length > 0
    ? Either.left({ criticalErrors: [], warnings })
    : Either.right(order)
}

// Example usage
const exampleOrder: Order = {
  id: 'order-123',
  customerId: 'customer-456',
  items: [
    { productId: 'laptop-1', quantity: 1, unitPrice: 999.99, category: 'electronics' },
    { productId: 'mouse-1', quantity: 2, unitPrice: 29.99, category: 'electronics' }
  ],
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US'
  },
  billingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US'
  },
  paymentMethod: {
    type: 'credit_card',
    isValid: true,
    expiresAt: '2025-12-31'
  },
  totalAmount: 1059.97,
  discountCode: 'SAVE10'
}

const exampleContext: ValidationContext = {
  customer: {
    id: 'customer-456',
    tier: 'gold',
    totalOrders: 15,
    totalSpent: 2500,
    region: 'US'
  },
  products: new Map([
    ['laptop-1', { id: 'laptop-1', category: 'electronics', price: 999.99, inStock: true, restricted: false, minimumQuantity: 1 }],
    ['mouse-1', { id: 'mouse-1', category: 'electronics', price: 29.99, inStock: true, restricted: false, minimumQuantity: 1 }]
  ]),
  discountCodes: new Map([
    ['SAVE10', { discount: 0.1, minAmount: 100 }]
  ]),
  restrictedRegions: new Set(['cn', 'ru', 'ir'])
}

const validationResult = validateOrderWithPriority(exampleOrder, exampleContext)

Either.match(validationResult, {
  onLeft: ({ criticalErrors, warnings }) => {
    if (criticalErrors.length > 0) {
      console.log('Order validation failed with critical errors:')
      criticalErrors.forEach(error => console.log(`- ${error}`))
    }
    
    if (warnings.length > 0) {
      console.log('Order validation warnings:')
      warnings.forEach(warning => console.log(`- ${warning}`))
    }
  },
  onRight: (order) => {
    console.log(`Order ${order.id} validated successfully!`)
    // Proceed with order processing
  }
})
```

## Advanced Features Deep Dive

### Feature 1: Error Accumulation with Either.all

Unlike short-circuiting operations, `Either.all` allows you to collect multiple validation results, which is crucial for form validation and data processing scenarios.

#### Basic Either.all Usage

```typescript
import { Either } from "effect"

// Individual validation functions
const validateName = (name: string): Either.Either<string, string> =>
  name.length > 0 ? Either.right(name) : Either.left("Name required")

const validateEmail = (email: string): Either.Either<string, string> =>
  email.includes("@") ? Either.right(email) : Either.left("Invalid email")

const validateAge = (age: number): Either.Either<number, string> =>
  age >= 18 ? Either.right(age) : Either.left("Must be 18 or older")

// Combine multiple validations
const userValidations = Either.all([
  validateName(""),
  validateEmail("invalid-email"),
  validateAge(16)
])

console.log(userValidations)
// Left("Name required") - stops at first error

// To collect ALL errors, we need a different approach
const collectAllErrors = (name: string, email: string, age: number) => {
  const nameResult = validateName(name)
  const emailResult = validateEmail(email)
  const ageResult = validateAge(age)
  
  const errors: string[] = []
  let validName: string | undefined
  let validEmail: string | undefined
  let validAge: number | undefined
  
  Either.match(nameResult, {
    onLeft: (error) => errors.push(error),
    onRight: (value) => validName = value
  })
  
  Either.match(emailResult, {
    onLeft: (error) => errors.push(error),
    onRight: (value) => validEmail = value
  })
  
  Either.match(ageResult, {
    onLeft: (error) => errors.push(error),
    onRight: (value) => validAge = value
  })
  
  return errors.length > 0
    ? Either.left(errors)
    : Either.right({ name: validName!, email: validEmail!, age: validAge! })
}
```

#### Real-World Error Accumulation Example

```typescript
import { Either } from "effect"

// Custom error accumulation helper
const accumulate = <T, E>(
  results: Either.Either<T, E>[]
): Either.Either<T[], E[]> => {
  const successes: T[] = []
  const errors: E[] = []
  
  results.forEach(result => {
    Either.match(result, {
      onLeft: (error) => errors.push(error),
      onRight: (value) => successes.push(value)
    })
  })
  
  return errors.length > 0 ? Either.left(errors) : Either.right(successes)
}

// Batch processing with error collection
interface ProcessingResult<T> {
  successful: T[]
  failed: { index: number; error: string; input: unknown }[]
}

const processBatchWithErrors = <T>(
  items: unknown[],
  processor: (item: unknown, index: number) => Either.Either<T, string>
): ProcessingResult<T> => {
  const successful: T[] = []
  const failed: { index: number; error: string; input: unknown }[] = []
  
  items.forEach((item, index) => {
    const result = processor(item, index)
    Either.match(result, {
      onLeft: (error) => failed.push({ index, error, input: item }),
      onRight: (value) => successful.push(value)
    })
  })
  
  return { successful, failed }
}

// Example: Processing a batch of user registrations
interface UserRegistration {
  name: string
  email: string
  age: number
}

const processUserRegistration = (data: unknown, index: number): Either.Either<UserRegistration, string> => {
  if (!data || typeof data !== 'object') {
    return Either.left(`Item ${index}: Invalid data format`)
  }
  
  const obj = data as Record<string, unknown>
  
  return Either.gen(function* () {
    const name = typeof obj.name === 'string' && obj.name.length > 0
      ? Either.right(obj.name)
      : Either.left(`Item ${index}: Name is required`)
    
    const email = typeof obj.email === 'string' && obj.email.includes('@')
      ? Either.right(obj.email)
      : Either.left(`Item ${index}: Valid email is required`)
    
    const age = typeof obj.age === 'number' && obj.age >= 18
      ? Either.right(obj.age)
      : Either.left(`Item ${index}: Age must be a number >= 18`)
    
    return {
      name: yield* name,
      email: yield* email,
      age: yield* age
    }
  })
}

const batchData = [
  { name: "Alice", email: "alice@example.com", age: 25 },
  { name: "", email: "bob@example.com", age: 30 }, // Invalid name
  { name: "Charlie", email: "invalid-email", age: 22 }, // Invalid email
  { age: 28 }, // Missing name and email
  { name: "Diana", email: "diana@example.com", age: 17 } // Invalid age
]

const batchResult = processBatchWithErrors(batchData, processUserRegistration)

console.log('Batch Processing Results:')
console.log(`Successful: ${batchResult.successful.length}`)
console.log(`Failed: ${batchResult.failed.length}`)

batchResult.failed.forEach(failure => {
  console.log(`Error: ${failure.error}`)
})
```

### Feature 2: Either Composition Patterns

Either values can be composed in various ways to build complex validation and transformation pipelines.

#### Chaining Operations with flatMap

```typescript
import { Either } from "effect"

// Chain dependent operations
const parsePositiveNumber = (str: string): Either.Either<number, string> => {
  const num = Number(str)
  return isNaN(num) ? Either.left(`"${str}" is not a number`) : Either.right(num)
}

const ensurePositive = (num: number): Either.Either<number, string> =>
  num > 0 ? Either.right(num) : Either.left(`${num} is not positive`)

const formatCurrency = (num: number): Either.Either<string, string> =>
  Either.right(`$${num.toFixed(2)}`)

// Chain operations that can each fail
const processAmount = (input: string): Either.Either<string, string> =>
  Either.flatMap(parsePositiveNumber(input), num =>
    Either.flatMap(ensurePositive(num), positiveNum =>
      formatCurrency(positiveNum)
    )
  )

// Or using Either.gen for cleaner syntax
const processAmountGen = (input: string): Either.Either<string, string> =>
  Either.gen(function* () {
    const num = yield* parsePositiveNumber(input)
    const positiveNum = yield* ensurePositive(num)
    return yield* formatCurrency(positiveNum)
  })

console.log(processAmount("10.5")) // Right("$10.50")
console.log(processAmount("-5"))   // Left("-5 is not positive")
console.log(processAmount("abc"))  // Left("\"abc\" is not a number")
```

#### Parallel Composition with zipWith

```typescript
import { Either } from "effect"

// Combine multiple Either values with custom logic
const combineValidations = <A, B, E>(
  a: Either.Either<A, E>,
  b: Either.Either<B, E>,
  combiner: (a: A, b: B) => Either.Either<{ a: A; b: B }, E>
): Either.Either<{ a: A; b: B }, E> =>
  Either.zipWith(a, b, combiner)

// Example: User profile validation
interface UserProfile {
  personalInfo: { name: string; email: string }
  preferences: { theme: string; notifications: boolean }
}

const validatePersonalInfo = (data: unknown): Either.Either<{ name: string; email: string }, string> => {
  // Implementation details...
  return Either.right({ name: "Alice", email: "alice@example.com" })
}

const validatePreferences = (data: unknown): Either.Either<{ theme: string; notifications: boolean }, string> => {
  // Implementation details...
  return Either.right({ theme: "dark", notifications: true })
}

const createProfile = (personalData: unknown, preferencesData: unknown): Either.Either<UserProfile, string> =>
  Either.zipWith(
    validatePersonalInfo(personalData),
    validatePreferences(preferencesData),
    (personalInfo, preferences) => Either.right({ personalInfo, preferences })
  )
```

#### Advanced Composition: Applicative Pattern

```typescript
import { Either } from "effect"

// Custom applicative helpers for Either
const liftA2 = <A, B, C, E>(
  f: (a: A, b: B) => C,
  ea: Either.Either<A, E>,
  eb: Either.Either<B, E>
): Either.Either<C, E> =>
  Either.zipWith(ea, eb, (a, b) => Either.right(f(a, b)))

const liftA3 = <A, B, C, D, E>(
  f: (a: A, b: B, c: C) => D,
  ea: Either.Either<A, E>,
  eb: Either.Either<B, E>,
  ec: Either.Either<C, E>
): Either.Either<D, E> =>
  Either.zipWith(
    liftA2((a, b) => ({ a, b }), ea, eb),
    ec,
    ({ a, b }, c) => Either.right(f(a, b, c))
  )

// Example: Building a complex object from multiple validations
interface Address {
  street: string
  city: string
  zipCode: string
}

const buildAddress = (street: string, city: string, zipCode: string): Address => ({
  street,
  city,
  zipCode
})

const validateStreet = (value: string): Either.Either<string, string> =>
  value.length > 0 ? Either.right(value) : Either.left("Street is required")

const validateCity = (value: string): Either.Either<string, string> =>
  value.length > 0 ? Either.right(value) : Either.left("City is required")

const validateZipCode = (value: string): Either.Either<string, string> =>
  /^\d{5}$/.test(value) ? Either.right(value) : Either.left("ZIP code must be 5 digits")

const validateAddress = (street: string, city: string, zipCode: string): Either.Either<Address, string> =>
  liftA3(
    buildAddress,
    validateStreet(street),
    validateCity(city),
    validateZipCode(zipCode)
  )
```

### Feature 3: Integration with Effect Types

Either integrates seamlessly with Effect, allowing you to convert between the two and use Either within Effect workflows.

#### Converting Between Either and Effect

```typescript
import { Either, Effect } from "effect"

// Either to Effect conversion
const eitherToEffect = <R, L>(either: Either.Either<R, L>): Effect.Effect<R, L> =>
  Either.match(either, {
    onLeft: (error) => Effect.fail(error),
    onRight: (value) => Effect.succeed(value)
  })

// Effect to Either conversion (for synchronous effects)
const effectToEither = <R, E>(effect: Effect.Effect<R, E>): Either.Either<R, E> =>
  Effect.runSync(Effect.either(effect))

// Example: Using Either validation in Effect workflows
const validateAndProcess = (data: string): Effect.Effect<string, string> =>
  Either.match(parsePositiveNumber(data), {
    onLeft: (error) => Effect.fail(error),
    onRight: (num) => Effect.succeed(`Processed: ${num}`)
  })

// Or more directly
const validateAndProcessDirect = (data: string): Effect.Effect<string, string> =>
  parsePositiveNumber(data) // Either is a subtype of Effect!
    |> Effect.map(num => `Processed: ${num}`)
```

#### Mixing Either and Effect in Workflows

```typescript
import { Either, Effect } from "effect"

// Service that might fail
interface UserService {
  getUser: (id: string) => Effect.Effect<User, string>
  validateUser: (user: User) => Either.Either<User, string>
}

const userService: UserService = {
  getUser: (id) => 
    id === "invalid" 
      ? Effect.fail("User not found")
      : Effect.succeed({ id, name: "Alice", email: "alice@example.com", age: 30 }),
  
  validateUser: (user) =>
    user.age >= 18 
      ? Either.right(user) 
      : Either.left("User must be 18 or older")
}

// Combine Effect and Either operations
const processUser = (userId: string): Effect.Effect<string, string> =>
  Effect.gen(function* () {
    const user = yield* userService.getUser(userId)
    const validatedUser = yield* userService.validateUser(user) // Either works in Effect.gen!
    return `Processed user: ${validatedUser.name}`
  })

// Error handling with Both Either and Effect errors
const processUserWithHandling = (userId: string): Effect.Effect<string, never> =>
  processUser(userId)
    |> Effect.catchAll(error => Effect.succeed(`Error: ${error}`))
```

## Practical Patterns & Best Practices

### Pattern 1: Validation Helper Functions

Create reusable validation helpers that return Either values for common validation scenarios:

```typescript
import { Either } from "effect"

// Generic validation helpers
const required = <T>(value: T | null | undefined, fieldName: string): Either.Either<T, string> =>
  value != null ? Either.right(value) : Either.left(`${fieldName} is required`)

const minLength = (value: string, min: number, fieldName: string): Either.Either<string, string> =>
  value.length >= min 
    ? Either.right(value) 
    : Either.left(`${fieldName} must be at least ${min} characters`)

const maxLength = (value: string, max: number, fieldName: string): Either.Either<string, string> =>
  value.length <= max 
    ? Either.right(value) 
    : Either.left(`${fieldName} must be at most ${max} characters`)

const matches = (value: string, pattern: RegExp, fieldName: string, message?: string): Either.Either<string, string> =>
  pattern.test(value) 
    ? Either.right(value) 
    : Either.left(message || `${fieldName} format is invalid`)

const range = (value: number, min: number, max: number, fieldName: string): Either.Either<number, string> =>
  value >= min && value <= max
    ? Either.right(value)
    : Either.left(`${fieldName} must be between ${min} and ${max}`)

const oneOf = <T>(value: T, options: readonly T[], fieldName: string): Either.Either<T, string> =>
  options.includes(value)
    ? Either.right(value)
    : Either.left(`${fieldName} must be one of: ${options.join(', ')}`)

// Compose validators
const composeValidators = <T>(
  validators: ((value: T) => Either.Either<T, string>)[]
): (value: T) => Either.Either<T, string> =>
  (value: T) => {
    for (const validator of validators) {
      const result = validator(value)
      if (Either.isLeft(result)) {
        return result
      }
    }
    return Either.right(value)
  }

// Example usage
const validateUsername = composeValidators([
  (value: string) => required(value, 'Username'),
  (value: string) => minLength(value, 3, 'Username'),
  (value: string) => maxLength(value, 20, 'Username'),
  (value: string) => matches(value, /^[a-zA-Z0-9_]+$/, 'Username', 'Username can only contain letters, numbers, and underscores')
])

const validatePassword = composeValidators([
  (value: string) => required(value, 'Password'),
  (value: string) => minLength(value, 8, 'Password'),
  (value: string) => matches(value, /[A-Z]/, 'Password', 'Password must contain at least one uppercase letter'),
  (value: string) => matches(value, /[a-z]/, 'Password', 'Password must contain at least one lowercase letter'),
  (value: string) => matches(value, /\d/, 'Password', 'Password must contain at least one number')
])

const validateEmail = composeValidators([
  (value: string) => required(value, 'Email'),
  (value: string) => matches(value, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email')
])

// Usage
console.log(validateUsername("user123"))     // Right("user123")
console.log(validateUsername("us"))          // Left("Username must be at least 3 characters")
console.log(validateUsername("user@123"))    // Left("Username can only contain letters, numbers, and underscores")
```

### Pattern 2: Error Transformation and Context

Transform errors to provide better context and user-friendly messages:

```typescript
import { Either } from "effect"

// Error context types
interface ValidationError {
  field: string
  code: string
  message: string
  value?: unknown
}

interface ProcessingContext {
  operation: string
  timestamp: Date
  userId?: string
  requestId?: string
}

// Error transformation helpers
const withFieldContext = <T>(
  either: Either.Either<T, string>,
  field: string,
  code: string,
  value?: unknown
): Either.Either<T, ValidationError> =>
  Either.mapLeft(either, message => ({
    field,
    code,
    message,
    value
  }))

const withProcessingContext = <T, E>(
  either: Either.Either<T, E>,
  context: ProcessingContext
): Either.Either<T, { error: E; context: ProcessingContext }> =>
  Either.mapLeft(either, error => ({ error, context }))

// Error aggregation
const aggregateValidationErrors = <T>(
  results: Either.Either<T, ValidationError>[]
): Either.Either<T[], ValidationError[]> => {
  const successes: T[] = []
  const errors: ValidationError[] = []
  
  results.forEach(result => {
    Either.match(result, {
      onLeft: (error) => errors.push(error),
      onRight: (value) => successes.push(value)
    })
  })
  
  return errors.length > 0 ? Either.left(errors) : Either.right(successes)
}

// User-friendly error messages
const humanizeValidationError = (error: ValidationError): string => {
  const fieldName = error.field.replace(/([A-Z])/g, ' $1').toLowerCase()
  
  switch (error.code) {
    case 'REQUIRED':
      return `${fieldName} is required`
    case 'MIN_LENGTH':
      return `${fieldName} is too short`
    case 'MAX_LENGTH':
      return `${fieldName} is too long`
    case 'INVALID_FORMAT':
      return `${fieldName} format is invalid`
    case 'OUT_OF_RANGE':
      return `${fieldName} is out of acceptable range`
    default:
      return error.message
  }
}

// Example: Enhanced form validation
interface UserRegistrationForm {
  firstName: string
  lastName: string
  email: string
  password: string
  age: number
  termsAccepted: boolean
}

const validateFirstName = (value: string): Either.Either<string, ValidationError> =>
  withFieldContext(
    required(value, 'First Name')
      |> Either.flatMap(v => minLength(v, 2, 'First Name')),
    'firstName',
    'REQUIRED'
  )

const validateLastName = (value: string): Either.Either<string, ValidationError> =>
  withFieldContext(
    required(value, 'Last Name')
      |> Either.flatMap(v => minLength(v, 2, 'Last Name')),
    'lastName', 
    'REQUIRED'
  )

const validateFormEmail = (value: string): Either.Either<string, ValidationError> =>
  withFieldContext(
    validateEmail(value),
    'email',
    'INVALID_FORMAT',
    value
  )

const validateFormPassword = (value: string): Either.Either<string, ValidationError> =>
  withFieldContext(
    validatePassword(value),
    'password',
    'INVALID_FORMAT'
  )

const validateAge = (value: number): Either.Either<number, ValidationError> =>
  withFieldContext(
    range(value, 18, 120, 'Age'),
    'age',
    'OUT_OF_RANGE',
    value
  )

const validateTerms = (accepted: boolean): Either.Either<boolean, ValidationError> =>
  withFieldContext(
    accepted ? Either.right(true) : Either.left('Terms must be accepted'),
    'termsAccepted',
    'REQUIRED',
    accepted
  )

const validateRegistrationForm = (
  form: UserRegistrationForm,
  context: ProcessingContext
): Either.Either<UserRegistrationForm, { error: ValidationError[]; context: ProcessingContext }> => {
  const validations = [
    validateFirstName(form.firstName),
    validateLastName(form.lastName),
    validateFormEmail(form.email),
    validateFormPassword(form.password),
    validateAge(form.age),
    validateTerms(form.termsAccepted)
  ]
  
  const result = aggregateValidationErrors(validations)
  
  return Either.match(result, {
    onLeft: (errors) => Either.left({ error: errors, context }),
    onRight: () => Either.right(form)
  })
}

// Usage with error reporting
const processRegistration = (form: UserRegistrationForm, userId?: string) => {
  const context: ProcessingContext = {
    operation: 'user_registration',
    timestamp: new Date(),
    userId,
    requestId: crypto.randomUUID()
  }
  
  const result = validateRegistrationForm(form, context)
  
  return Either.match(result, {
    onLeft: ({ error, context }) => ({
      success: false,
      errors: error.map(humanizeValidationError),
      context: {
        operation: context.operation,
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId
      }
    }),
    onRight: (validForm) => ({
      success: true,
      data: validForm,
      context: {
        operation: context.operation,
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId
      }
    })
  })
}
```

### Pattern 3: Resource-Safe Operations

Use Either for operations that need cleanup or resource management:

```typescript
import { Either } from "effect"

// Resource management with Either
interface Resource {
  id: string
  cleanup: () => void
}

interface ResourceManager {
  acquire: (id: string) => Either.Either<Resource, string>
  release: (resource: Resource) => Either.Either<void, string>
}

const createResourceManager = (): ResourceManager => {
  const resources = new Map<string, Resource>()
  
  return {
    acquire: (id: string) => {
      if (resources.has(id)) {
        return Either.left(`Resource ${id} already acquired`)
      }
      
      const resource: Resource = {
        id,
        cleanup: () => {
          console.log(`Cleaning up resource ${id}`)
          resources.delete(id)
        }
      }
      
      resources.set(id, resource)
      return Either.right(resource)
    },
    
    release: (resource: Resource) => {
      if (!resources.has(resource.id)) {
        return Either.left(`Resource ${resource.id} not found`)
      }
      
      resource.cleanup()
      return Either.right(undefined)
    }
  }
}

// Safe resource operation pattern
const withResource = <T>(
  resourceId: string,
  operation: (resource: Resource) => Either.Either<T, string>,
  manager: ResourceManager
): Either.Either<T, string> =>
  Either.gen(function* () {
    const resource = yield* manager.acquire(resourceId)
    
    try {
      const result = yield* operation(resource)
      yield* manager.release(resource)
      return result
    } catch (error) {
      // Ensure cleanup even if operation throws
      manager.release(resource)
      return yield* Either.left(`Operation failed: ${error}`)
    }
  })

// Example: Database transaction pattern
interface DatabaseConnection {
  id: string
  query: (sql: string) => Either.Either<unknown[], string>
  beginTransaction: () => Either.Either<void, string>
  commit: () => Either.Either<void, string>
  rollback: () => Either.Either<void, string>
  close: () => void
}

const withTransaction = <T>(
  connection: DatabaseConnection,
  operation: (conn: DatabaseConnection) => Either.Either<T, string>
): Either.Either<T, string> =>
  Either.gen(function* () {
    yield* connection.beginTransaction()
    
    const result = operation(connection)
    
    return Either.match(result, {
      onLeft: (error) => {
        connection.rollback()
        return Either.left(error)
      },
      onRight: (value) => 
        Either.match(connection.commit(), {
          onLeft: (commitError) => {
            connection.rollback()
            return Either.left(`Commit failed: ${commitError}`)
          },
          onRight: () => Either.right(value)
        })
    })
  })
```

## Integration Examples

### Integration with React Hook Form

Either integrates well with React Hook Form for comprehensive form validation:

```typescript
import { Either } from "effect"
import { useForm, Controller } from "react-hook-form"

// Form validation schema using Either
interface FormData {
  name: string
  email: string
  age: number
}

interface FormErrors {
  name?: string
  email?: string
  age?: string
}

const validateFormField = <T>(
  value: T,
  validators: ((value: T) => Either.Either<T, string>)[]
): string | undefined => {
  for (const validator of validators) {
    const result = validator(value)
    if (Either.isLeft(result)) {
      return result.left
    }
  }
  return undefined
}

const useFormValidation = () => {
  const form = useForm<FormData>({
    mode: 'onChange',
    resolver: (values) => {
      const errors: FormErrors = {}
      
      // Validate name
      const nameError = validateFormField(values.name, [
        (v) => required(v, 'Name'),
        (v) => minLength(v, 2, 'Name')
      ])
      if (nameError) errors.name = nameError
      
      // Validate email
      const emailError = validateFormField(values.email, [
        (v) => required(v, 'Email'),
        (v) => matches(v, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email')
      ])
      if (emailError) errors.email = emailError
      
      // Validate age
      const ageError = validateFormField(values.age, [
        (v) => v != null ? Either.right(v) : Either.left('Age is required'),
        (v) => range(v, 18, 120, 'Age')
      ])
      if (ageError) errors.age = ageError
      
      return {
        values: Object.keys(errors).length === 0 ? values : {},
        errors
      }
    }
  })
  
  return form
}

// Example React component
const RegistrationForm = () => {
  const { control, handleSubmit, formState: { errors } } = useFormValidation()
  
  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <div>
            <input {...field} placeholder="Name" />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
        )}
      />
      
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <div>
            <input {...field} placeholder="Email" type="email" />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
        )}
      />
      
      <Controller
        name="age"
        control={control}
        render={({ field }) => (
          <div>
            <input {...field} placeholder="Age" type="number" />
            {errors.age && <span className="error">{errors.age}</span>}
          </div>
        )}
      />
      
      <button type="submit">Register</button>
    </form>
  )
}
```

### Integration with Express.js Middleware

Either works excellently for Express.js middleware validation and error handling:

```typescript
import { Either } from "effect"
import express, { Request, Response, NextFunction } from "express"

// Middleware factory using Either
const validateRequest = <T>(
  validator: (data: unknown) => Either.Either<T, string[]>
) => 
  (req: Request, res: Response, next: NextFunction) => {
    const result = validator(req.body)
    
    Either.match(result, {
      onLeft: (errors) => {
        res.status(400).json({
          success: false,
          errors,
          message: 'Validation failed'
        })
      },
      onRight: (validatedData) => {
        req.body = validatedData // Replace with validated data
        next()
      }
    })
  }

// API validation schemas
const validateUserCreation = (data: unknown): Either.Either<UserRegistrationForm, string[]> => {
  if (!data || typeof data !== 'object') {
    return Either.left(['Request body must be a valid object'])
  }
  
  const obj = data as Record<string, unknown>
  
  const validations = [
    validateFirstName(String(obj.firstName || '')),
    validateLastName(String(obj.lastName || '')),
    validateFormEmail(String(obj.email || '')),
    validateFormPassword(String(obj.password || '')),
    validateAge(Number(obj.age) || 0),
    validateTerms(Boolean(obj.termsAccepted))
  ]
  
  return aggregateValidationErrors(validations)
    |> Either.match({
      onLeft: (errors) => Either.left(errors.map(e => e.message)),
      onRight: () => Either.right({
        firstName: String(obj.firstName),
        lastName: String(obj.lastName),
        email: String(obj.email),
        password: String(obj.password),
        age: Number(obj.age),
        termsAccepted: Boolean(obj.termsAccepted)
      })
    })
}

// Express routes with Either validation
const app = express()
app.use(express.json())

app.post('/api/users', 
  validateRequest(validateUserCreation),
  (req: Request, res: Response) => {
    const userData = req.body as UserRegistrationForm
    
    // Process validated user data
    res.json({
      success: true,
      message: 'User created successfully',
      data: { id: crypto.randomUUID(), ...userData }
    })
  }
)

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})
```

### Testing Strategies

Either values are easy to test due to their predictable structure:

```typescript
import { Either } from "effect"
import { describe, it, expect } from "bun:test"

describe('Either validation functions', () => {
  describe('validateEmail', () => {
    it('should return Right for valid emails', () => {
      const result = validateEmail('test@example.com')
      expect(Either.isRight(result)).toBe(true)
      
      if (Either.isRight(result)) {
        expect(result.right).toBe('test@example.com')
      }
    })
    
    it('should return Left for invalid emails', () => {
      const result = validateEmail('invalid-email')
      expect(Either.isLeft(result)).toBe(true)
      
      if (Either.isLeft(result)) {
        expect(result.left).toContain('Email')
      }
    })
  })
  
  describe('Form validation', () => {
    it('should validate complete form successfully', () => {
      const formData: UserRegistrationForm = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        age: 25,
        termsAccepted: true
      }
      
      const context: ProcessingContext = {
        operation: 'test',
        timestamp: new Date(),
        requestId: 'test-123'
      }
      
      const result = validateRegistrationForm(formData, context)
      expect(Either.isRight(result)).toBe(true)
    })
    
    it('should collect all validation errors', () => {
      const invalidForm: UserRegistrationForm = {
        firstName: '',
        lastName: 'D',
        email: 'invalid-email',
        password: 'weak',
        age: 15,
        termsAccepted: false
      }
      
      const context: ProcessingContext = {
        operation: 'test',
        timestamp: new Date(),
        requestId: 'test-123'
      }
      
      const result = validateRegistrationForm(invalidForm, context)
      expect(Either.isLeft(result)).toBe(true)
      
      if (Either.isLeft(result)) {
        expect(result.left.error).toHaveLength(6) // All fields should have errors
      }
    })
  })
  
  // Property-based testing
  it('should maintain Either laws', () => {
    const value = 42
    const error = 'test error'
    
    // Left identity: Either.flatMap(Either.right(a), f) === f(a)
    const f = (x: number) => Either.right(x * 2)
    const leftIdentity = Either.flatMap(Either.right(value), f)
    const directApplication = f(value)
    expect(leftIdentity).toEqual(directApplication)
    
    // Right identity: Either.flatMap(m, Either.right) === m
    const rightValue = Either.right(value)
    const rightIdentity = Either.flatMap(rightValue, Either.right)
    expect(rightIdentity).toEqual(rightValue)
  })
})

// Test utilities
const expectRight = <R, L>(either: Either.Either<R, L>) => ({
  toBe: (expected: R) => {
    expect(Either.isRight(either)).toBe(true)
    if (Either.isRight(either)) {
      expect(either.right).toBe(expected)
    }
  }
})

const expectLeft = <R, L>(either: Either.Either<R, L>) => ({
  toContain: (expected: string) => {
    expect(Either.isLeft(either)).toBe(true)
    if (Either.isLeft(either)) {
      expect(String(either.left)).toContain(expected)
    }
  }
})

// Usage in tests
describe('Enhanced test utilities', () => {
  it('should use expectRight helper', () => {
    const result = Either.right(42)
    expectRight(result).toBe(42)
  })
  
  it('should use expectLeft helper', () => {
    const result = Either.left('Invalid email format')
    expectLeft(result).toContain('email')
  })
})
```

## Conclusion

Either provides explicit error handling, type-safe validation, and composable error management for TypeScript applications. Unlike exception-based approaches, Either makes error cases visible in the type system and enables clear success/failure paths without breaking normal control flow.

Key benefits:
- **Explicit Error Handling**: Errors are part of the type signature, making them impossible to ignore
- **Type Safety**: Both success and error cases are fully typed, preventing runtime surprises
- **Composability**: Either values can be combined, chained, and transformed without nested error checking
- **Integration**: Works seamlessly with Effect and other functional programming patterns

Either is ideal for validation logic, parsing operations, business rule enforcement, configuration loading, and any scenario where explicit error handling is preferred over exceptions. It encourages defensive programming while maintaining clean, readable code that's easy to test and reason about.