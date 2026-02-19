# Match: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Match Solves

Modern applications often require complex conditional logic based on data types, values, or object properties. Traditional approaches using switch statements and if/else chains become unwieldy, error-prone, and lack type safety:

```typescript
// Traditional approach - switch statements with poor type safety
type ApiResponse = 
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string; code: number }
  | { status: 'empty' }

function handleApiResponse(response: ApiResponse): string {
  switch (response.status) {
    case 'loading':
      return 'Loading users...'
    case 'success':
      // TypeScript can't guarantee response.data exists
      return `Found ${response.data?.length || 0} users`
    case 'error':
      // Manual property access, easy to make mistakes
      return `Error ${response.code}: ${response.error}`
    case 'empty':
      return 'No users found'
    // Easy to forget cases - no exhaustiveness checking
    default:
      return 'Unknown status'
  }
}

// Complex nested conditions become unreadable
function processUserInput(input: unknown): string {
  if (typeof input === 'string') {
    if (input.length === 0) {
      return 'Empty string'
    } else if (input.startsWith('admin:')) {
      return 'Admin command'
    } else {
      return `Text: ${input}`
    }
  } else if (typeof input === 'number') {
    if (input > 0) {
      return `Positive number: ${input}`
    } else if (input < 0) {
      return `Negative number: ${input}`
    } else {
      return 'Zero'
    }
  } else if (input === null) {
    return 'Null value'
  } else {
    return 'Unknown type'
  }
}
```

This approach leads to:
- **No Exhaustiveness Checking** - Easy to forget cases without compile-time warnings
- **Poor Type Safety** - TypeScript can't guarantee property access safety in switch cases
- **Complex Nesting** - Deeply nested if/else chains become unreadable
- **Repetitive Code** - Similar patterns repeated across the codebase
- **Runtime Errors** - Missing cases or incorrect property access cause runtime failures

### The Match Solution

Effect's Match module provides type-safe, exhaustive pattern matching that eliminates these problems:

```typescript
import { Match } from "effect"

// Type-safe pattern matching with exhaustiveness checking
const handleApiResponse = Match.type<ApiResponse>().pipe(
  Match.tag('loading', () => 'Loading users...'),
  Match.tag('success', (response) => `Found ${response.data.length} users`),
  Match.tag('error', (response) => `Error ${response.code}: ${response.error}`),
  Match.tag('empty', () => 'No users found'),
  Match.exhaustive // Compile-time guarantee all cases are handled
)

// Clean, readable pattern matching for complex conditions
const processUserInput = Match.type<unknown>().pipe(
  Match.when(Match.string, (str) => 
    Match.value(str).pipe(
      Match.when('', () => 'Empty string'),
      Match.when((s) => s.startsWith('admin:'), () => 'Admin command'),
      Match.orElse((s) => `Text: ${s}`)
    )
  ),
  Match.when(Match.number, (num) =>
    Match.value(num).pipe(
      Match.when((n) => n > 0, (n) => `Positive number: ${n}`),
      Match.when((n) => n < 0, (n) => `Negative number: ${n}`),
      Match.orElse(() => 'Zero')
    )
  ),
  Match.when(Match.null, () => 'Null value'),
  Match.orElse(() => 'Unknown type')
)
```

### Key Concepts

**Pattern Matching**: Destructuring and analyzing values based on their structure, type, or content in a type-safe way.

**Exhaustiveness Checking**: Compile-time verification that all possible cases are handled, preventing runtime errors.

**Type Refinement**: Automatic type narrowing within match branches, giving you full type safety for matched values.

**Composable Matchers**: Building complex matching logic by combining simple patterns using the Effect pipe pattern.

## Basic Usage Patterns

### Pattern 1: Type-Based Matching

```typescript
import { Match } from "effect"

// Create a matcher for union types
const processValue = Match.type<string | number | boolean>().pipe(
  Match.when(Match.string, (str) => `String: ${str}`),
  Match.when(Match.number, (num) => `Number: ${num}`),
  Match.when(Match.boolean, (bool) => `Boolean: ${bool}`),
  Match.exhaustive
)

console.log(processValue("hello"))   // "String: hello"
console.log(processValue(42))        // "Number: 42"
console.log(processValue(true))      // "Boolean: true"
```

### Pattern 2: Value-Based Matching

```typescript
import { Match } from "effect"

// Match against specific values or conditions
const gradeToGPA = Match.type<string>().pipe(
  Match.when('A', () => 4.0),
  Match.when('B', () => 3.0),
  Match.when('C', () => 2.0),
  Match.when('D', () => 1.0),
  Match.when('F', () => 0.0),
  Match.orElse(() => -1) // Invalid grade
)

console.log(gradeToGPA('A'))  // 4.0
console.log(gradeToGPA('X'))  // -1
```

### Pattern 3: Tagged Union Matching

```typescript
import { Match } from "effect"

type HttpMethod = 
  | { readonly _tag: 'GET'; readonly path: string }
  | { readonly _tag: 'POST'; readonly path: string; readonly body: unknown }
  | { readonly _tag: 'PUT'; readonly path: string; readonly body: unknown }
  | { readonly _tag: 'DELETE'; readonly path: string }

const buildHttpRequest = Match.type<HttpMethod>().pipe(
  Match.tag('GET', (req) => `GET ${req.path}`),
  Match.tag('POST', 'PUT', (req) => `${req._tag} ${req.path} with body`),
  Match.tag('DELETE', (req) => `DELETE ${req.path}`),
  Match.exhaustive
)

console.log(buildHttpRequest({ _tag: 'GET', path: '/users' }))
// "GET /users"

console.log(buildHttpRequest({ _tag: 'POST', path: '/users', body: { name: 'John' } }))
// "POST /users with body"
```

## Real-World Examples

### Example 1: API Response State Management

Managing different states of API responses with type safety and exhaustive handling:

```typescript
import { Match, Effect } from "effect"

type LoadingState<T, E = Error> = 
  | { readonly _tag: 'idle' }
  | { readonly _tag: 'loading' }
  | { readonly _tag: 'success'; readonly data: T }
  | { readonly _tag: 'error'; readonly error: E }

interface User {
  id: string
  name: string
  email: string
}

// Helper to create state matchers
const createStateRenderer = <T, E>(onSuccess: (data: T) => string) => 
  Match.type<LoadingState<T, E>>().pipe(
    Match.tag('idle', () => 'Ready to load'),
    Match.tag('loading', () => 'Loading...'),
    Match.tag('success', ({ data }) => onSuccess(data)),
    Match.tag('error', ({ error }) => `Error: ${error.message || 'Unknown error'}`),
    Match.exhaustive
  )

// Application-specific renderers
const renderUserListState = createStateRenderer<User[]>((users) => 
  users.length === 0 
    ? 'No users found' 
    : `Found ${users.length} users: ${users.map(u => u.name).join(', ')}`
)

const renderUserProfileState = createStateRenderer<User>((user) => 
  `Profile: ${user.name} (${user.email})`
)

// Usage in a component or service
const handleUserListResponse = (state: LoadingState<User[]>) => {
  return Effect.gen(function* () {
    const message = renderUserListState(state)
    yield* Console.log(message)
    
    // Additional effects based on state
    return yield* Match.value(state).pipe(
      Match.tag('success', ({ data }) => Effect.succeed(data.length)),
      Match.tag('error', ({ error }) => Effect.fail(error)),
      Match.orElse(() => Effect.succeed(0))
    )
  })
}

// Example states
const idleState: LoadingState<User[]> = { _tag: 'idle' }
const loadingState: LoadingState<User[]> = { _tag: 'loading' }
const successState: LoadingState<User[]> = { 
  _tag: 'success', 
  data: [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ]
}
const errorState: LoadingState<User[]> = { 
  _tag: 'error', 
  error: new Error('Failed to fetch users') 
}

console.log(renderUserListState(successState))
// "Found 2 users: Alice, Bob"
```

### Example 2: Event Processing System

Handling different types of domain events with pattern matching:

```typescript
import { Match, Effect, Option } from "effect"

type DomainEvent = 
  | { readonly _tag: 'UserRegistered'; readonly userId: string; readonly email: string; readonly timestamp: Date }
  | { readonly _tag: 'UserUpdated'; readonly userId: string; readonly changes: Record<string, unknown>; readonly timestamp: Date }
  | { readonly _tag: 'UserDeleted'; readonly userId: string; readonly timestamp: Date }
  | { readonly _tag: 'OrderPlaced'; readonly orderId: string; readonly userId: string; readonly total: number; readonly timestamp: Date }
  | { readonly _tag: 'OrderCancelled'; readonly orderId: string; readonly reason: string; readonly timestamp: Date }
  | { readonly _tag: 'PaymentProcessed'; readonly paymentId: string; readonly orderId: string; readonly amount: number; readonly timestamp: Date }

// Event processing with side effects
const processEvent = (event: DomainEvent) => {
  return Effect.gen(function* () {
    const logMessage = yield* Match.value(event).pipe(
      Match.tag('UserRegistered', (e) => 
        Effect.succeed(`New user registered: ${e.email} (ID: ${e.userId})`)
      ),
      Match.tag('UserUpdated', (e) => 
        Effect.succeed(`User ${e.userId} updated: ${Object.keys(e.changes).join(', ')}`)
      ),
      Match.tag('UserDeleted', (e) => 
        Effect.succeed(`User ${e.userId} deleted`)
      ),
      Match.tag('OrderPlaced', (e) => 
        Effect.succeed(`Order ${e.orderId} placed by ${e.userId} for $${e.total}`)
      ),
      Match.tag('OrderCancelled', (e) => 
        Effect.succeed(`Order ${e.orderId} cancelled: ${e.reason}`)
      ),
      Match.tag('PaymentProcessed', (e) => 
        Effect.succeed(`Payment ${e.paymentId} processed for order ${e.orderId}: $${e.amount}`)
      ),
      Match.exhaustive
    )

    // Log the event
    yield* Console.log(`[${event.timestamp.toISOString()}] ${logMessage}`)

    // Route to appropriate handlers
    return yield* Match.value(event).pipe(
      Match.tag('UserRegistered', 'UserUpdated', 'UserDeleted', (e) => 
        handleUserEvent(e)
      ),
      Match.tag('OrderPlaced', 'OrderCancelled', (e) => 
        handleOrderEvent(e)
      ),
      Match.tag('PaymentProcessed', (e) => 
        handlePaymentEvent(e)
      ),
      Match.exhaustive
    )
  })
}

// Specific event handlers
const handleUserEvent = (event: Extract<DomainEvent, { _tag: 'UserRegistered' | 'UserUpdated' | 'UserDeleted' }>) => {
  return Match.value(event).pipe(
    Match.tag('UserRegistered', (e) => 
      Effect.gen(function* () {
        // Send welcome email
        yield* Console.log(`Sending welcome email to ${e.email}`)
        // Update user analytics
        yield* Console.log(`Recording registration for analytics`)
        return 'user-registered'
      })
    ),
    Match.tag('UserUpdated', (e) => 
      Effect.gen(function* () {
        // Invalidate user cache
        yield* Console.log(`Invalidating cache for user ${e.userId}`)
        // Update search index
        yield* Console.log(`Updating search index for user ${e.userId}`)
        return 'user-updated'
      })
    ),
    Match.tag('UserDeleted', (e) => 
      Effect.gen(function* () {
        // Clean up user data
        yield* Console.log(`Cleaning up data for user ${e.userId}`)
        // Update related records
        yield* Console.log(`Updating related records for user ${e.userId}`)
        return 'user-deleted'
      })
    ),
    Match.exhaustive
  )
}

const handleOrderEvent = (event: Extract<DomainEvent, { _tag: 'OrderPlaced' | 'OrderCancelled' }>) => {
  return Match.value(event).pipe(
    Match.tag('OrderPlaced', (e) => 
      Effect.gen(function* () {
        yield* Console.log(`Processing inventory for order ${e.orderId}`)
        yield* Console.log(`Sending order confirmation`)
        return 'order-placed'
      })
    ),
    Match.tag('OrderCancelled', (e) => 
      Effect.gen(function* () {
        yield* Console.log(`Restoring inventory for order ${e.orderId}`)
        yield* Console.log(`Processing refund if applicable`)
        return 'order-cancelled'
      })
    ),
    Match.exhaustive
  )
}

const handlePaymentEvent = (event: Extract<DomainEvent, { _tag: 'PaymentProcessed' }>) => {
  return Effect.gen(function* () {
    yield* Console.log(`Recording payment ${event.paymentId} in accounting system`)
    yield* Console.log(`Updating order status for ${event.orderId}`)
    return 'payment-processed'
  })
}

// Example usage
const sampleEvents: DomainEvent[] = [
  { 
    _tag: 'UserRegistered', 
    userId: 'user-123', 
    email: 'alice@example.com', 
    timestamp: new Date() 
  },
  { 
    _tag: 'OrderPlaced', 
    orderId: 'order-456', 
    userId: 'user-123', 
    total: 99.99, 
    timestamp: new Date() 
  },
  { 
    _tag: 'PaymentProcessed', 
    paymentId: 'pay-789', 
    orderId: 'order-456', 
    amount: 99.99, 
    timestamp: new Date() 
  }
]

// Process events sequentially
const processAllEvents = Effect.gen(function* () {
  for (const event of sampleEvents) {
    yield* processEvent(event)
  }
})
```

### Example 3: Form Validation with Multiple Error Types

Complex form validation using pattern matching for different validation outcomes:

```typescript
import { Match, Effect, Array as Arr } from "effect"

type ValidationError = 
  | { readonly _tag: 'Required'; readonly field: string }
  | { readonly _tag: 'InvalidFormat'; readonly field: string; readonly expected: string }
  | { readonly _tag: 'TooShort'; readonly field: string; readonly minLength: number; readonly actualLength: number }
  | { readonly _tag: 'TooLong'; readonly field: string; readonly maxLength: number; readonly actualLength: number }
  | { readonly _tag: 'InvalidRange'; readonly field: string; readonly min: number; readonly max: number; readonly value: number }

type ValidationResult<T> = 
  | { readonly _tag: 'Valid'; readonly data: T }
  | { readonly _tag: 'Invalid'; readonly errors: ValidationError[] }

interface UserRegistrationForm {
  username: string
  email: string
  password: string
  age: number
  terms: boolean
}

// Individual field validators
const validateUsername = (username: string): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (!username.trim()) {
    errors.push({ _tag: 'Required', field: 'username' })
  } else if (username.length < 3) {
    errors.push({ _tag: 'TooShort', field: 'username', minLength: 3, actualLength: username.length })
  } else if (username.length > 20) {
    errors.push({ _tag: 'TooLong', field: 'username', maxLength: 20, actualLength: username.length })
  }
  
  return errors
}

const validateEmail = (email: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email.trim()) {
    errors.push({ _tag: 'Required', field: 'email' })
  } else if (!emailRegex.test(email)) {
    errors.push({ _tag: 'InvalidFormat', field: 'email', expected: 'valid email address' })
  }
  
  return errors
}

const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (!password) {
    errors.push({ _tag: 'Required', field: 'password' })
  } else if (password.length < 8) {
    errors.push({ _tag: 'TooShort', field: 'password', minLength: 8, actualLength: password.length })
  } else if (password.length > 100) {
    errors.push({ _tag: 'TooLong', field: 'password', maxLength: 100, actualLength: password.length })
  }
  
  return errors
}

const validateAge = (age: number): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (age < 13 || age > 120) {
    errors.push({ _tag: 'InvalidRange', field: 'age', min: 13, max: 120, value: age })
  }
  
  return errors
}

// Form validation using pattern matching
const validateForm = (form: Partial<UserRegistrationForm>): ValidationResult<UserRegistrationForm> => {
  const allErrors: ValidationError[] = [
    ...validateUsername(form.username || ''),
    ...validateEmail(form.email || ''),
    ...validatePassword(form.password || ''),
    ...validateAge(form.age || 0),
    ...(form.terms !== true ? [{ _tag: 'Required', field: 'terms' } as const] : [])
  ]

  if (allErrors.length > 0) {
    return { _tag: 'Invalid', errors: allErrors }
  }

  return {
    _tag: 'Valid',
    data: {
      username: form.username!,
      email: form.email!,
      password: form.password!,
      age: form.age!,
      terms: form.terms!
    }
  }
}

// Error message formatting using pattern matching
const formatValidationError = Match.type<ValidationError>().pipe(
  Match.tag('Required', (error) => `${error.field} is required`),
  Match.tag('InvalidFormat', (error) => `${error.field} must be a ${error.expected}`),
  Match.tag('TooShort', (error) => 
    `${error.field} must be at least ${error.minLength} characters (got ${error.actualLength})`
  ),
  Match.tag('TooLong', (error) => 
    `${error.field} must be no more than ${error.maxLength} characters (got ${error.actualLength})`
  ),
  Match.tag('InvalidRange', (error) => 
    `${error.field} must be between ${error.min} and ${error.max} (got ${error.value})`
  ),
  Match.exhaustive
)

// Processing validation results
const processFormSubmission = (form: Partial<UserRegistrationForm>) => {
  return Effect.gen(function* () {
    const result = validateForm(form)
    
    return yield* Match.value(result).pipe(
      Match.tag('Valid', ({ data }) => 
        Effect.gen(function* () {
          yield* Console.log(`✅ Form is valid! Registering user: ${data.username}`)
          // Simulate user registration
          yield* Console.log(`Creating user account for ${data.email}`)
          yield* Console.log(`Sending confirmation email to ${data.email}`)
          return data
        })
      ),
      Match.tag('Invalid', ({ errors }) => 
        Effect.gen(function* () {
          yield* Console.log(`❌ Form has ${errors.length} validation errors:`)
          
          // Group errors by type for better UX
          const errorsByType = Arr.groupBy(errors, (error) => error._tag)
          
          for (const [errorType, typeErrors] of Object.entries(errorsByType)) {
            yield* Console.log(`\n${errorType} errors:`)
            for (const error of typeErrors) {
              const message = formatValidationError(error)
              yield* Console.log(`  - ${message}`)
            }
          }
          
          return Effect.fail(new Error('Form validation failed'))
        })
      ),
      Match.exhaustive
    )
  })
}

// Example usage
const validForm: Partial<UserRegistrationForm> = {
  username: 'alice123',
  email: 'alice@example.com',
  password: 'securepassword123',
  age: 25,
  terms: true
}

const invalidForm: Partial<UserRegistrationForm> = {
  username: 'al',  // Too short
  email: 'invalid-email',  // Invalid format
  password: '123',  // Too short
  age: 10,  // Too young
  terms: false  // Not accepted
}

// Process both forms
const runValidationExamples = Effect.gen(function* () {
  yield* Console.log('=== Processing valid form ===')
  yield* processFormSubmission(validForm).pipe(
    Effect.catchAll((error) => Console.log(`Failed: ${error.message}`))
  )
  
  yield* Console.log('\n=== Processing invalid form ===')
  yield* processFormSubmission(invalidForm).pipe(
    Effect.catchAll((error) => Console.log(`Failed: ${error.message}`))
  )
})
```

## Advanced Features Deep Dive

### Feature 1: Combining Matchers with Logic

You can use `Match.whenAnd` and `Match.whenOr` to create complex matching conditions:

#### Basic Combined Matching

```typescript
import { Match } from "effect"

type Product = {
  id: string
  category: 'electronics' | 'clothing' | 'books'
  price: number
  inStock: boolean
  rating: number
}

// Complex matching with multiple conditions
const getProductStatus = Match.type<Product>().pipe(
  // Electronics with high rating and in stock
  Match.whenAnd(
    { category: 'electronics' },
    { inStock: true },
    (product) => product.rating >= 4.5,
    (product) => `⭐ Premium Electronics: ${product.id}`
  ),
  // Expensive items or high-rated items
  Match.whenOr(
    (product: Product) => product.price > 500,
    (product: Product) => product.rating >= 4.8,
    (product) => `💎 Premium Product: ${product.id}`
  ),
  // Out of stock items
  Match.when(
    { inStock: false },
    (product) => `❌ Out of Stock: ${product.id}`
  ),
  // Default case
  Match.orElse((product) => `📦 Regular Product: ${product.id}`)
)

const sampleProducts: Product[] = [
  { id: 'laptop-1', category: 'electronics', price: 1200, inStock: true, rating: 4.7 },
  { id: 'shirt-1', category: 'clothing', price: 50, inStock: false, rating: 4.2 },
  { id: 'book-1', category: 'books', price: 25, inStock: true, rating: 4.9 }
]

sampleProducts.forEach(product => {
  console.log(getProductStatus(product))
})
// ⭐ Premium Electronics: laptop-1
// ❌ Out of Stock: shirt-1  
// 💎 Premium Product: book-1
```

#### Real-World Combined Matching: Access Control

```typescript
import { Match, Effect } from "effect"

type User = {
  id: string
  role: 'admin' | 'moderator' | 'user'
  isActive: boolean
  permissions: string[]
  lastLoginDays: number
}

type Resource = {
  type: 'post' | 'user' | 'system'
  action: 'read' | 'write' | 'delete' | 'admin'
  sensitive: boolean
}

// Complex access control using combined matching
const checkAccess = (user: User, resource: Resource) => {
  return Match.value({ user, resource }).pipe(
    // Admin users can do anything if active and recently logged in
    Match.whenAnd(
      ({ user }) => user.role === 'admin',
      ({ user }) => user.isActive,
      ({ user }) => user.lastLoginDays <= 30,
      () => Effect.succeed('GRANTED: Admin access')
    ),
    // Moderators can manage posts and users (except sensitive operations)
    Match.whenAnd(
      ({ user }) => user.role === 'moderator',
      ({ user }) => user.isActive,
      ({ resource }) => resource.type !== 'system',
      ({ resource }) => !resource.sensitive || resource.action !== 'delete',
      () => Effect.succeed('GRANTED: Moderator access')
    ),
    // Regular users can read non-sensitive content or manage their own data
    Match.whenOr(
      // Can read non-sensitive content
      ({ resource, user }) => 
        resource.action === 'read' && !resource.sensitive && user.isActive,
      // Can modify their own data (if they have specific permission)
      ({ user, resource }) => 
        user.permissions.includes(`own:${resource.type}:${resource.action}`) && user.isActive,
      () => Effect.succeed('GRANTED: User access')
    ),
    // Inactive users get limited read access only
    Match.whenAnd(
      ({ user }) => !user.isActive,
      ({ resource }) => resource.action === 'read',
      ({ resource }) => !resource.sensitive,
      () => Effect.succeed('GRANTED: Limited read access (inactive user)')
    ),
    // Deny access for all other cases
    Match.orElse(({ user, resource }) => 
      Effect.fail(new Error(`ACCESS DENIED: ${user.role} cannot ${resource.action} ${resource.type}`))
    )
  )
}

// Example users and resources
const users: User[] = [
  { 
    id: 'admin-1', 
    role: 'admin', 
    isActive: true, 
    permissions: [], 
    lastLoginDays: 5 
  },
  { 
    id: 'mod-1', 
    role: 'moderator', 
    isActive: true, 
    permissions: [], 
    lastLoginDays: 2 
  },
  { 
    id: 'user-1', 
    role: 'user', 
    isActive: true, 
    permissions: ['own:post:write', 'own:user:write'], 
    lastLoginDays: 1 
  },
  { 
    id: 'inactive-1', 
    role: 'user', 
    isActive: false, 
    permissions: [], 
    lastLoginDays: 45 
  }
]

const resources: Resource[] = [
  { type: 'post', action: 'read', sensitive: false },
  { type: 'post', action: 'write', sensitive: false },
  { type: 'user', action: 'delete', sensitive: true },
  { type: 'system', action: 'admin', sensitive: true }
]

// Test access control
const testAccessControl = Effect.gen(function* () {
  for (const user of users) {
    yield* Console.log(`\n=== Testing access for ${user.role} (${user.id}) ===`)
    for (const resource of resources) {
      const result = yield* checkAccess(user, resource).pipe(
        Effect.catchAll((error) => Effect.succeed(`DENIED: ${error.message}`))
      )
      yield* Console.log(`${resource.action} ${resource.type}: ${result}`)
    }
  }
})
```

### Feature 2: Pattern Guards and Refinements

Create reusable pattern guards for complex validation logic:

#### Custom Pattern Guards

```typescript
import { Match, Predicate } from "effect"

// Define custom type guards
const isPositiveNumber = (value: unknown): value is number => 
  typeof value === 'number' && value > 0

const isValidEmail = (value: unknown): value is string => 
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const isNonEmptyArray = <T>(value: unknown): value is T[] => 
  Array.isArray(value) && value.length > 0

// Advanced data processing with custom guards
type ProcessingInput = unknown

const processData = Match.type<ProcessingInput>().pipe(
  // Use custom guards for validation
  Match.when(isPositiveNumber, (num) => 
    `Processing positive number: ${num}`
  ),
  Match.when(isValidEmail, (email) => 
    `Processing email: ${email}`
  ),
  Match.when(isNonEmptyArray, (arr) => 
    `Processing array with ${arr.length} items`
  ),
  // Combine built-in and custom guards
  Match.when(
    Predicate.and(Match.string, (s: string) => s.length > 10),
    (longString) => `Processing long string: ${longString.substring(0, 20)}...`
  ),
  Match.orElse((value) => 
    `Cannot process value of type: ${typeof value}`
  )
)

// Example usage
const testInputs = [
  42,
  -5,
  'user@example.com',
  'invalid-email',
  [1, 2, 3, 4, 5],
  [],
  'This is a very long string that exceeds the minimum length',
  'short',
  { some: 'object' },
  null
]

testInputs.forEach(input => {
  console.log(processData(input))
})
```

#### Real-World Example: Request Validation Pipeline

```typescript
import { Match, Effect, Option } from "effect"

interface ApiRequest {
  method: string
  path: string
  headers: Record<string, string>
  body?: unknown
}

type ValidationResult<T> = 
  | { readonly _tag: 'Valid'; readonly data: T }
  | { readonly _tag: 'Invalid'; readonly errors: string[] }

// Custom guards for request validation
const isAuthenticatedRequest = (req: ApiRequest): boolean => 
  'authorization' in req.headers && req.headers.authorization.startsWith('Bearer ')

const isValidJsonBody = (body: unknown): body is Record<string, unknown> => 
  body !== null && typeof body === 'object' && !Array.isArray(body)

const hasContentType = (req: ApiRequest, expected: string): boolean => 
  req.headers['content-type']?.includes(expected) ?? false

// Request processing pipeline using pattern matching
const processApiRequest = (request: ApiRequest) => {
  return Effect.gen(function* () {
    // First, route by method and path pattern
    const routeResult = Match.value(request).pipe(
      // GET requests - no auth required for public endpoints
      Match.whenAnd(
        (req) => req.method === 'GET',
        (req) => req.path.startsWith('/public/'),
        (req) => ({ type: 'public-read', request: req })
      ),
      // GET requests - auth required for private endpoints
      Match.whenAnd(
        (req) => req.method === 'GET',
        (req) => req.path.startsWith('/api/'),
        isAuthenticatedRequest,
        (req) => ({ type: 'private-read', request: req })
      ),
      // POST/PUT requests - auth and JSON body required
      Match.whenAnd(
        (req) => ['POST', 'PUT'].includes(req.method),
        (req) => req.path.startsWith('/api/'),
        isAuthenticatedRequest,
        (req) => hasContentType(req, 'application/json'),
        (req) => isValidJsonBody(req.body),
        (req) => ({ type: 'write-operation', request: req })
      ),
      // DELETE requests - auth required, no body
      Match.whenAnd(
        (req) => req.method === 'DELETE',
        (req) => req.path.startsWith('/api/'),
        isAuthenticatedRequest,
        (req) => !req.body,
        (req) => ({ type: 'delete-operation', request: req })
      ),
      // Invalid requests
      Match.orElse((req) => ({ type: 'invalid', request: req }))
    )

    // Process based on route type
    return yield* Match.value(routeResult).pipe(
      Match.when(
        { type: 'public-read' },
        ({ request }) => Effect.succeed(`✅ Public read: ${request.path}`)
      ),
      Match.when(
        { type: 'private-read' },
        ({ request }) => Effect.gen(function* () {
          const token = request.headers.authorization.replace('Bearer ', '')
          yield* Console.log(`🔐 Authenticated read: ${request.path} (token: ${token.substring(0, 10)}...)`)
          return `✅ Private read: ${request.path}`
        })
      ),
      Match.when(
        { type: 'write-operation' },
        ({ request }) => Effect.gen(function* () {
          const token = request.headers.authorization.replace('Bearer ', '')
          yield* Console.log(`✍️ Write operation: ${request.method} ${request.path}`)
          yield* Console.log(`📝 Body: ${JSON.stringify(request.body)}`)
          return `✅ Write operation completed: ${request.method} ${request.path}`
        })
      ),
      Match.when(
        { type: 'delete-operation' },
        ({ request }) => Effect.gen(function* () {
          yield* Console.log(`🗑️ Delete operation: ${request.path}`)
          return `✅ Delete completed: ${request.path}`
        })
      ),
      Match.when(
        { type: 'invalid' },
        ({ request }) => Effect.gen(function* () {
          const errors: string[] = []
          
          if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) {
            errors.push(`Unsupported method: ${request.method}`)
          }
          
          if (!request.path.startsWith('/public/') && !request.path.startsWith('/api/')) {
            errors.push(`Invalid path: ${request.path}`)
          }
          
          if (request.path.startsWith('/api/') && !isAuthenticatedRequest(request)) {
            errors.push('Authentication required for API endpoints')
          }
          
          if (['POST', 'PUT'].includes(request.method) && !hasContentType(request, 'application/json')) {
            errors.push('Content-Type: application/json required for write operations')
          }
          
          if (['POST', 'PUT'].includes(request.method) && !isValidJsonBody(request.body)) {
            errors.push('Valid JSON body required for write operations')
          }
          
          return Effect.fail(new Error(`❌ Invalid request: ${errors.join(', ')}`))
        })
      ),
      Match.exhaustive
    )
  })
}

// Example requests
const requests: ApiRequest[] = [
  {
    method: 'GET',
    path: '/public/health',
    headers: {}
  },
  {
    method: 'GET',
    path: '/api/users',
    headers: { 'authorization': 'Bearer abc123token' }
  },
  {
    method: 'POST',
    path: '/api/users',
    headers: { 
      'authorization': 'Bearer abc123token',
      'content-type': 'application/json'
    },
    body: { name: 'John', email: 'john@example.com' }
  },
  {
    method: 'DELETE',
    path: '/api/users/123',
    headers: { 'authorization': 'Bearer abc123token' }
  },
  {
    method: 'POST',
    path: '/api/users',
    headers: {},  // Missing auth
    body: { name: 'Jane' }
  }
]

// Process all requests
const processAllRequests = Effect.gen(function* () {
  for (const [index, request] of requests.entries()) {
    yield* Console.log(`\n=== Request ${index + 1}: ${request.method} ${request.path} ===`)
    yield* processApiRequest(request).pipe(
      Effect.catchAll((error) => Console.log(error.message))
    )
  }
})
```

### Feature 3: Nested Pattern Matching

Handle complex nested data structures with composable matchers:

#### Basic Nested Matching

```typescript
import { Match } from "effect"

type NestedData = {
  user: {
    profile: {
      preferences: {
        theme: 'light' | 'dark' | 'auto'
        notifications: boolean
      }
    }
  }
  metadata: {
    version: number
    features: string[]
  }
}

// Nested pattern matching
const analyzeUserData = Match.type<NestedData>().pipe(
  // Match based on theme and notification preferences
  Match.when(
    {
      user: {
        profile: {
          preferences: {
            theme: 'dark',
            notifications: true
          }
        }
      }
    },
    () => 'Power user with dark theme and notifications'
  ),
  // Match users with light theme regardless of notifications
  Match.when(
    {
      user: {
        profile: {
          preferences: {
            theme: 'light'
          }
        }
      }
    },
    (data) => `Light theme user (notifications: ${data.user.profile.preferences.notifications})`
  ),
  // Match based on version and features
  Match.when(
    (data) => data.metadata.version >= 2 && data.metadata.features.includes('beta'),
    () => 'Beta tester on latest version'
  ),
  Match.orElse(() => 'Standard user')
)

const testData: NestedData = {
  user: {
    profile: {
      preferences: {
        theme: 'dark',
        notifications: true
      }
    }
  },
  metadata: {
    version: 2,
    features: ['beta', 'advanced']
  }
}

console.log(analyzeUserData(testData))
// "Power user with dark theme and notifications"
```

#### Real-World Example: Configuration Management

```typescript
import { Match, Effect, Option } from "effect"

type DatabaseConfig = {
  type: 'postgres' | 'mysql' | 'sqlite'
  connection: {
    host?: string
    port?: number
    database: string
    credentials?: {
      username: string
      password: string
    }
  }
  pool?: {
    min: number
    max: number
    idle: number
  }
  ssl?: {
    enabled: boolean
    cert?: string
    key?: string
  }
}

type CacheConfig = {
  type: 'redis' | 'memory' | 'none'
  settings?: {
    ttl: number
    maxSize?: number
    connection?: {
      url: string
      cluster: boolean
    }
  }
}

type AppConfig = {
  environment: 'development' | 'staging' | 'production'
  database: DatabaseConfig
  cache: CacheConfig
  features: {
    analytics: boolean
    monitoring: boolean
    debugging: boolean
  }
}

// Complex configuration validation and setup
const setupApplication = (config: AppConfig) => {
  return Effect.gen(function* () {
    // Validate and setup database
    const dbSetup = yield* Match.value(config.database).pipe(
      // Production PostgreSQL with SSL and connection pooling
      Match.whenAnd(
        { type: 'postgres' },
        (db) => config.environment === 'production',
        (db) => db.ssl?.enabled === true,
        (db) => db.pool !== undefined,
        (db) => Effect.gen(function* () {
          yield* Console.log(`🐘 Setting up PostgreSQL for production`)
          yield* Console.log(`   Host: ${db.connection.host}:${db.connection.port}`)
          yield* Console.log(`   Database: ${db.connection.database}`)
          yield* Console.log(`   Pool: ${db.pool!.min}-${db.pool!.max} connections`)
          yield* Console.log(`   SSL: enabled`)
          return 'postgres-production'
        })
      ),
      // Development database (any type, simplified setup)
      Match.when(
        (db) => config.environment === 'development',
        (db) => Effect.gen(function* () {
          yield* Console.log(`🔧 Setting up ${db.type} for development`)
          if (db.type === 'sqlite') {
            yield* Console.log(`   File: ${db.connection.database}`)
          } else {
            yield* Console.log(`   Database: ${db.connection.database}`)
          }
          return `${db.type}-development`
        })
      ),
      // Staging database with basic security
      Match.whenAnd(
        (db) => config.environment === 'staging',
        (db) => db.connection.credentials !== undefined,
        (db) => Effect.gen(function* () {
          yield* Console.log(`🧪 Setting up ${db.type} for staging`)
          yield* Console.log(`   Database: ${db.connection.database}`)
          yield* Console.log(`   Authentication: enabled`)
          return `${db.type}-staging`
        })
      ),
      Match.orElse((db) => 
        Effect.fail(new Error(`Invalid database configuration for ${config.environment}`))
      )
    )

    // Setup cache based on environment and type
    const cacheSetup = yield* Match.value(config.cache).pipe(
      // Production Redis with clustering
      Match.whenAnd(
        { type: 'redis' },
        (cache) => config.environment === 'production',
        (cache) => cache.settings?.connection?.cluster === true,
        (cache) => Effect.gen(function* () {
          yield* Console.log(`🚀 Setting up Redis cluster for production`)
          yield* Console.log(`   URL: ${cache.settings!.connection!.url}`)
          yield* Console.log(`   TTL: ${cache.settings!.ttl}s`)
          return 'redis-cluster'
        })
      ),
      // Single Redis instance for staging/development
      Match.whenAnd(
        { type: 'redis' },
        (cache) => cache.settings?.connection !== undefined,
        (cache) => Effect.gen(function* () {
          yield* Console.log(`📦 Setting up Redis for ${config.environment}`)
          yield* Console.log(`   URL: ${cache.settings!.connection!.url}`)
          return 'redis-single'
        })
      ),
      // Memory cache for development
      Match.whenAnd(
        { type: 'memory' },
        (cache) => config.environment === 'development',
        (cache) => Effect.gen(function* () {
          yield* Console.log(`💾 Setting up in-memory cache`)
          yield* Console.log(`   Max size: ${cache.settings?.maxSize || 'unlimited'}`)
          return 'memory-cache'
        })
      ),
      // No caching
      Match.when(
        { type: 'none' },
        () => Effect.gen(function* () {
          yield* Console.log(`⚠️ No caching configured`)
          return 'no-cache'
        })
      ),
      Match.orElse(() => 
        Effect.fail(new Error('Invalid cache configuration'))
      )
    )

    // Feature setup based on environment
    const featureSetup = yield* Match.value(config).pipe(
      // Production: minimal debugging, full monitoring
      Match.whenAnd(
        (cfg) => cfg.environment === 'production',
        (cfg) => cfg.features.monitoring === true,
        (cfg) => cfg.features.debugging === false,
        (cfg) => Effect.gen(function* () {
          yield* Console.log(`📊 Production features enabled:`)
          yield* Console.log(`   Analytics: ${cfg.features.analytics}`)
          yield* Console.log(`   Monitoring: ${cfg.features.monitoring}`)
          yield* Console.log(`   Debugging: ${cfg.features.debugging}`)
          return 'production-features'
        })
      ),
      // Development: full debugging, optional monitoring
      Match.when(
        (cfg) => cfg.environment === 'development',
        (cfg) => Effect.gen(function* () {
          yield* Console.log(`🔧 Development features enabled:`)
          yield* Console.log(`   Analytics: ${cfg.features.analytics}`)
          yield* Console.log(`   Monitoring: ${cfg.features.monitoring}`)
          yield* Console.log(`   Debugging: ${cfg.features.debugging}`)
          return 'development-features'
        })
      ),
      // Staging: balanced feature set
      Match.when(
        (cfg) => cfg.environment === 'staging',
        (cfg) => Effect.gen(function* () {
          yield* Console.log(`🧪 Staging features enabled:`)
          yield* Console.log(`   Analytics: ${cfg.features.analytics}`)
          yield* Console.log(`   Monitoring: ${cfg.features.monitoring}`)
          yield* Console.log(`   Debugging: ${cfg.features.debugging}`)
          return 'staging-features'
        })
      ),
      Match.exhaustive
    )

    yield* Console.log(`\n✅ Application setup complete:`)
    yield* Console.log(`   Database: ${dbSetup}`)
    yield* Console.log(`   Cache: ${cacheSetup}`)
    yield* Console.log(`   Features: ${featureSetup}`)

    return {
      database: dbSetup,
      cache: cacheSetup,
      features: featureSetup
    }
  })
}

// Example configurations
const productionConfig: AppConfig = {
  environment: 'production',
  database: {
    type: 'postgres',
    connection: {
      host: 'prod-db.example.com',
      port: 5432,
      database: 'myapp_prod',
      credentials: {
        username: 'prod_user',
        password: 'secure_password'
      }
    },
    pool: {
      min: 5,
      max: 20,
      idle: 10000
    },
    ssl: {
      enabled: true,
      cert: '/path/to/cert',
      key: '/path/to/key'
    }
  },
  cache: {
    type: 'redis',
    settings: {
      ttl: 3600,
      connection: {
        url: 'redis://cache-cluster.example.com:6379',
        cluster: true
      }
    }
  },
  features: {
    analytics: true,
    monitoring: true,
    debugging: false
  }
}

const developmentConfig: AppConfig = {
  environment: 'development',
  database: {
    type: 'sqlite',
    connection: {
      database: './dev.db'
    }
  },
  cache: {
    type: 'memory',
    settings: {
      ttl: 300,
      maxSize: 1000
    }
  },
  features: {
    analytics: false,
    monitoring: false,
    debugging: true
  }
}

// Setup both configurations
const setupBothEnvironments = Effect.gen(function* () {
  yield* Console.log('=== Setting up Production Environment ===')
  yield* setupApplication(productionConfig).pipe(
    Effect.catchAll((error) => Console.log(`❌ Production setup failed: ${error.message}`))
  )
  
  yield* Console.log('\n=== Setting up Development Environment ===')
  yield* setupApplication(developmentConfig).pipe(
    Effect.catchAll((error) => Console.log(`❌ Development setup failed: ${error.message}`))
  )
})
```

## Practical Patterns & Best Practices

### Pattern 1: Exhaustive State Machine

Create type-safe state machines using pattern matching:

```typescript
import { Match, Effect } from "effect"

type OrderState = 
  | { readonly _tag: 'Pending'; readonly customerId: string; readonly items: string[] }
  | { readonly _tag: 'Processing'; readonly orderId: string; readonly estimatedTime: number }
  | { readonly _tag: 'Shipped'; readonly orderId: string; readonly trackingNumber: string; readonly carrier: string }
  | { readonly _tag: 'Delivered'; readonly orderId: string; readonly deliveredAt: Date; readonly signature?: string }
  | { readonly _tag: 'Cancelled'; readonly orderId: string; readonly reason: string; readonly refundAmount: number }
  | { readonly _tag: 'Returned'; readonly orderId: string; readonly returnReason: string; readonly refundProcessed: boolean }

type OrderEvent = 
  | { readonly _tag: 'Process'; readonly orderId: string; readonly estimatedTime: number }
  | { readonly _tag: 'Ship'; readonly trackingNumber: string; readonly carrier: string }
  | { readonly _tag: 'Deliver'; readonly signature?: string }
  | { readonly _tag: 'Cancel'; readonly reason: string; readonly refundAmount: number }
  | { readonly _tag: 'Return'; readonly returnReason: string }
  | { readonly _tag: 'ProcessRefund' }

// State transition function
const transitionOrderState = (currentState: OrderState, event: OrderEvent): Effect.Effect<OrderState, Error> => {
  return Match.value({ state: currentState, event }).pipe(
    // Pending → Processing
    Match.whenAnd(
      ({ state }) => state._tag === 'Pending',
      ({ event }) => event._tag === 'Process',
      ({ state, event }) => Effect.succeed({
        _tag: 'Processing' as const,
        orderId: event.orderId,
        estimatedTime: event.estimatedTime
      })
    ),
    // Processing → Shipped
    Match.whenAnd(
      ({ state }) => state._tag === 'Processing',
      ({ event }) => event._tag === 'Ship',
      ({ state, event }) => Effect.succeed({
        _tag: 'Shipped' as const,
        orderId: state.orderId,
        trackingNumber: event.trackingNumber,
        carrier: event.carrier
      })
    ),
    // Shipped → Delivered
    Match.whenAnd(
      ({ state }) => state._tag === 'Shipped',
      ({ event }) => event._tag === 'Deliver',
      ({ state, event }) => Effect.succeed({
        _tag: 'Delivered' as const,
        orderId: state.orderId,
        deliveredAt: new Date(),
        signature: event.signature
      })
    ),
    // Any state → Cancelled (except delivered/returned)
    Match.whenAnd(
      ({ state }) => !['Delivered', 'Returned'].includes(state._tag),
      ({ event }) => event._tag === 'Cancel',
      ({ state, event }) => {
        const orderId = 'orderId' in state ? state.orderId : 'unknown'
        return Effect.succeed({
          _tag: 'Cancelled' as const,
          orderId,
          reason: event.reason,
          refundAmount: event.refundAmount
        })
      }
    ),
    // Delivered → Returned
    Match.whenAnd(
      ({ state }) => state._tag === 'Delivered',
      ({ event }) => event._tag === 'Return',
      ({ state, event }) => Effect.succeed({
        _tag: 'Returned' as const,
        orderId: state.orderId,
        returnReason: event.returnReason,
        refundProcessed: false
      })
    ),
    // Returned → Process Refund
    Match.whenAnd(
      ({ state }) => state._tag === 'Returned' && !state.refundProcessed,
      ({ event }) => event._tag === 'ProcessRefund',
      ({ state, event }) => Effect.succeed({
        ...state,
        refundProcessed: true
      })
    ),
    // Invalid transitions
    Match.orElse(({ state, event }) => 
      Effect.fail(new Error(`Invalid transition: Cannot ${event._tag} when order is ${state._tag}`))
    )
  )
}

// Helper to get valid next actions for a state
const getValidActions = Match.type<OrderState>().pipe(
  Match.tag('Pending', () => ['Process', 'Cancel']),
  Match.tag('Processing', () => ['Ship', 'Cancel']),
  Match.tag('Shipped', () => ['Deliver', 'Cancel']),
  Match.tag('Delivered', () => ['Return']),
  Match.tag('Cancelled', () => []),
  Match.tag('Returned', (state) => state.refundProcessed ? [] : ['ProcessRefund']),
  Match.exhaustive
)

// Order management service
const processOrderWorkflow = Effect.gen(function* () {
  let currentState: OrderState = {
    _tag: 'Pending',
    customerId: 'cust-123',
    items: ['item-1', 'item-2']
  }

  const events: OrderEvent[] = [
    { _tag: 'Process', orderId: 'ord-456', estimatedTime: 24 },
    { _tag: 'Ship', trackingNumber: 'TRK-789', carrier: 'FedEx' },
    { _tag: 'Deliver', signature: 'John Doe' },
    { _tag: 'Return', returnReason: 'Wrong size' },
    { _tag: 'ProcessRefund' }
  ]

  for (const event of events) {
    yield* Console.log(`\nCurrent state: ${currentState._tag}`)
    yield* Console.log(`Valid actions: ${getValidActions(currentState).join(', ')}`)
    yield* Console.log(`Applying event: ${event._tag}`)

    const newState = yield* transitionOrderState(currentState, event).pipe(
      Effect.catchAll((error) => {
        return Effect.gen(function* () {
          yield* Console.log(`❌ ${error.message}`)
          return currentState // Keep current state on invalid transition
        })
      })
    )

    if (newState !== currentState) {
      currentState = newState
      yield* Console.log(`✅ New state: ${currentState._tag}`)
    }
  }

  yield* Console.log(`\nFinal state: ${JSON.stringify(currentState, null, 2)}`)
})
```

### Pattern 2: Type-Safe Error Handling

Use pattern matching for comprehensive error handling strategies:

```typescript
import { Match, Effect, Option } from "effect"

// Define application error types
type AppError = 
  | { readonly _tag: 'ValidationError'; readonly field: string; readonly message: string }
  | { readonly _tag: 'NetworkError'; readonly status: number; readonly url: string; readonly retryable: boolean }
  | { readonly _tag: 'DatabaseError'; readonly query: string; readonly code: string; readonly transient: boolean }
  | { readonly _tag: 'AuthenticationError'; readonly reason: 'expired' | 'invalid' | 'missing' }
  | { readonly _tag: 'AuthorizationError'; readonly resource: string; readonly action: string }
  | { readonly _tag: 'BusinessLogicError'; readonly rule: string; readonly context: Record<string, unknown> }
  | { readonly _tag: 'ExternalServiceError'; readonly service: string; readonly error: string; readonly fallbackAvailable: boolean }

// Error recovery strategies
const createRecoveryStrategy = <T>(fallbackValue: T) => 
  Match.type<AppError>().pipe(
    // Retry network errors with exponential backoff
    Match.when(
      (error): error is Extract<AppError, { _tag: 'NetworkError' }> => 
        error._tag === 'NetworkError' && error.retryable,
      (error) => Effect.gen(function* () {
        yield* Console.log(`🔄 Retrying network request to ${error.url} (status: ${error.status})`)
        // Simulate retry logic
        yield* Effect.sleep('1 seconds')
        return Option.none<T>() // Indicate retry needed
      })
    ),
    // Retry transient database errors
    Match.when(
      (error): error is Extract<AppError, { _tag: 'DatabaseError' }> => 
        error._tag === 'DatabaseError' && error.transient,
      (error) => Effect.gen(function* () {
        yield* Console.log(`🔄 Retrying database query (code: ${error.code})`)
        yield* Effect.sleep('500 millis')
        return Option.none<T>()
      })
    ),
    // Use fallback for external service errors
    Match.when(
      (error): error is Extract<AppError, { _tag: 'ExternalServiceError' }> => 
        error._tag === 'ExternalServiceError' && error.fallbackAvailable,
      (error) => Effect.gen(function* () {
        yield* Console.log(`🔄 Using fallback for ${error.service}`)
        return Option.some(fallbackValue)
      })
    ),
    // Log and fail for non-recoverable errors
    Match.orElse((error) => Effect.gen(function* () {
      const errorMessage = Match.value(error).pipe(
        Match.tag('ValidationError', (e) => `Validation failed for ${e.field}: ${e.message}`),
        Match.tag('NetworkError', (e) => `Network error ${e.status} at ${e.url} (not retryable)`),
        Match.tag('DatabaseError', (e) => `Database error ${e.code} (not transient)`),
        Match.tag('AuthenticationError', (e) => `Authentication failed: ${e.reason}`),
        Match.tag('AuthorizationError', (e) => `Access denied: cannot ${e.action} ${e.resource}`),
        Match.tag('BusinessLogicError', (e) => `Business rule violated: ${e.rule}`),
        Match.tag('ExternalServiceError', (e) => `${e.service} error: ${e.error} (no fallback)`),
        Match.exhaustive
      )
      
      yield* Console.error(`❌ ${errorMessage}`)
      return Option.none<T>()
    }))
  )

// Example service that can fail with different error types
const fetchUserProfile = (userId: string): Effect.Effect<{ name: string; email: string }, AppError> => {
  return Effect.gen(function* () {
    // Simulate various failure scenarios
    const random = Math.random()
    
    if (random < 0.2) {
      return yield* Effect.fail({
        _tag: 'NetworkError' as const,
        status: 503,
        url: `/api/users/${userId}`,
        retryable: true
      })
    }
    
    if (random < 0.4) {
      return yield* Effect.fail({
        _tag: 'DatabaseError' as const,
        query: `SELECT * FROM users WHERE id = '${userId}'`,
        code: 'CONNECTION_TIMEOUT',
        transient: true
      })
    }
    
    if (random < 0.6) {
      return yield* Effect.fail({
        _tag: 'AuthenticationError' as const,
        reason: 'expired' as const
      })
    }
    
    if (random < 0.8) {
      return yield* Effect.fail({
        _tag: 'ExternalServiceError' as const,
        service: 'user-service',
        error: 'Service temporarily unavailable',
        fallbackAvailable: true
      })
    }
    
    // Success case
    return { name: 'John Doe', email: 'john@example.com' }
  })
}

// Service with error recovery
const fetchUserProfileWithRecovery = (userId: string) => {
  const fallbackProfile = { name: 'Anonymous User', email: 'anonymous@example.com' }
  const recoveryStrategy = createRecoveryStrategy(fallbackProfile)
  
  return Effect.gen(function* () {
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      attempts++
      yield* Console.log(`\n🚀 Attempt ${attempts} to fetch user profile`)
      
      const result = yield* fetchUserProfile(userId).pipe(
        Effect.catchAll((error) => Effect.gen(function* () {
          const recovery = yield* recoveryStrategy(error)
          
          return yield* Match.value(recovery).pipe(
            Match.when(Option.isSome, ({ value }) => Effect.succeed(value)),
            Match.when(Option.isNone, () => Effect.fail(error)),
            Match.exhaustive
          )
        }))
      )
      
      // If we got here, we either succeeded or used a fallback
      yield* Console.log(`✅ Successfully retrieved profile: ${result.name}`)
      return result
    }
    
    // Max attempts reached
    return yield* Effect.fail(new Error(`Failed to fetch user profile after ${maxAttempts} attempts`))
  })
}

// Error reporting and metrics
const reportError = (error: AppError) => {
  return Effect.gen(function* () {
    const severity = Match.value(error).pipe(
      Match.tag('ValidationError', () => 'low'),
      Match.tag('NetworkError', (e) => e.retryable ? 'medium' : 'high'),
      Match.tag('DatabaseError', (e) => e.transient ? 'medium' : 'critical'),
      Match.tag('AuthenticationError', 'AuthorizationError', () => 'high'),
      Match.tag('BusinessLogicError', () => 'medium'),
      Match.tag('ExternalServiceError', (e) => e.fallbackAvailable ? 'low' : 'high'),
      Match.exhaustive
    )
    
    const category = Match.value(error).pipe(
      Match.tag('ValidationError', () => 'input'),
      Match.tag('NetworkError', 'ExternalServiceError', () => 'connectivity'),
      Match.tag('DatabaseError', () => 'storage'),
      Match.tag('AuthenticationError', 'AuthorizationError', () => 'security'),
      Match.tag('BusinessLogicError', () => 'business'),
      Match.exhaustive
    )
    
    yield* Console.log(`📊 Error reported - Category: ${category}, Severity: ${severity}`)
    yield* Console.log(`   Type: ${error._tag}`)
    
    // Send to monitoring system based on severity
    if (['high', 'critical'].includes(severity)) {
      yield* Console.log(`🚨 Alerting operations team - ${severity} severity error`)
    }
  })
}

// Demo the error handling system
const demonstrateErrorHandling = Effect.gen(function* () {
  for (let i = 1; i <= 5; i++) {
    yield* Console.log(`\n=== Demo ${i} ===`)
    yield* fetchUserProfileWithRecovery(`user-${i}`).pipe(
      Effect.catchAll((error) => Effect.gen(function* () {
        // This catches the final failure after all recovery attempts
        yield* Console.log(`❌ Final failure: ${error.message}`)
        return { name: 'Error', email: 'error@example.com' }
      }))
    )
  }
})
```

### Pattern 3: Configuration and Environment Management

Type-safe configuration handling with validation and defaults:

```typescript
import { Match, Effect, Option, Either } from "effect"

type Environment = 'development' | 'testing' | 'staging' | 'production'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type DatabaseType = 'sqlite' | 'postgres' | 'mysql'

interface RawConfig {
  NODE_ENV?: string
  LOG_LEVEL?: string
  DATABASE_URL?: string
  DATABASE_TYPE?: string
  PORT?: string
  REDIS_URL?: string
  JWT_SECRET?: string
  FEATURE_FLAGS?: string
}

interface ValidatedConfig {
  environment: Environment
  logLevel: LogLevel
  database: {
    type: DatabaseType
    url: string
  }
  port: number
  redis?: {
    url: string
  }
  auth: {
    jwtSecret: string
  }
  features: Record<string, boolean>
}

// Configuration validation with detailed error reporting
const validateConfig = (raw: RawConfig): Either.Either<string[], ValidatedConfig> => {
  const errors: string[] = []
  
  // Environment validation
  const environment = Match.value(raw.NODE_ENV).pipe(
    Match.when('development', () => 'development' as const),
    Match.when('testing', () => 'testing' as const),
    Match.when('staging', () => 'staging' as const),
    Match.when('production', () => 'production' as const),
    Match.orElse(() => {
      errors.push(`Invalid NODE_ENV: ${raw.NODE_ENV}. Must be one of: development, testing, staging, production`)
      return 'development' as const
    })
  )
  
  // Log level validation with environment-aware defaults
  const logLevel = Match.value({ env: environment, level: raw.LOG_LEVEL }).pipe(
    // Explicit log level provided
    Match.when(
      ({ level }) => ['debug', 'info', 'warn', 'error'].includes(level || ''),
      ({ level }) => level as LogLevel
    ),
    // Environment-based defaults
    Match.when(
      ({ env }) => env === 'development',
      () => 'debug' as const
    ),
    Match.when(
      ({ env }) => env === 'testing',
      () => 'warn' as const
    ),
    Match.when(
      ({ env }) => ['staging', 'production'].includes(env),
      () => 'info' as const
    ),
    Match.orElse(({ level }) => {
      errors.push(`Invalid LOG_LEVEL: ${level}. Must be one of: debug, info, warn, error`)
      return 'info' as const
    })
  )
  
  // Database configuration validation
  const databaseConfig = Match.value({ type: raw.DATABASE_TYPE, url: raw.DATABASE_URL }).pipe(
    // PostgreSQL configuration
    Match.whenAnd(
      ({ type }) => type === 'postgres',
      ({ url }) => url?.startsWith('postgres://') || url?.startsWith('postgresql://'),
      ({ type, url }) => ({
        type: 'postgres' as const,
        url: url!
      })
    ),
    // MySQL configuration
    Match.whenAnd(
      ({ type }) => type === 'mysql',
      ({ url }) => url?.startsWith('mysql://'),
      ({ type, url }) => ({
        type: 'mysql' as const,
        url: url!
      })
    ),
    // SQLite configuration (development/testing)
    Match.whenAnd(
      ({ type }) => type === 'sqlite' || (!type && ['development', 'testing'].includes(environment)),
      ({ url }) => url !== undefined || ['development', 'testing'].includes(environment),
      ({ type, url }) => ({
        type: 'sqlite' as const,
        url: url || './dev.db'
      })
    ),
    Match.orElse(({ type, url }) => {
      if (!type) {
        errors.push('DATABASE_TYPE is required')
      } else if (!['sqlite', 'postgres', 'mysql'].includes(type)) {
        errors.push(`Invalid DATABASE_TYPE: ${type}. Must be one of: sqlite, postgres, mysql`)
      }
      if (!url) {
        errors.push('DATABASE_URL is required')
      } else {
        errors.push(`Invalid DATABASE_URL format for ${type}: ${url}`)
      }
      return { type: 'sqlite' as const, url: './fallback.db' }
    })
  )
  
  // Port validation
  const port = Match.value(raw.PORT).pipe(
    Match.when(
      (p) => p !== undefined && !Number.isNaN(parseInt(p, 10)) && parseInt(p, 10) > 0,
      (p) => parseInt(p!, 10)
    ),
    Match.orElse((p) => {
      if (p !== undefined) {
        errors.push(`Invalid PORT: ${p}. Must be a positive integer`)
      }
      return environment === 'production' ? 80 : 3000
    })
  )
  
  // Redis configuration (optional)
  const redisConfig = Match.value(raw.REDIS_URL).pipe(
    Match.when(
      (url) => url?.startsWith('redis://') || url?.startsWith('rediss://'),
      (url) => Option.some({ url: url! })
    ),
    Match.when(
      (url) => url === undefined,
      () => Option.none()
    ),
    Match.orElse((url) => {
      errors.push(`Invalid REDIS_URL format: ${url}`)
      return Option.none()
    })
  )
  
  // JWT Secret validation
  const jwtSecret = Match.value({ secret: raw.JWT_SECRET, env: environment }).pipe(
    Match.whenAnd(
      ({ secret }) => secret !== undefined,
      ({ secret }) => secret!.length >= 32,
      ({ secret }) => ({ jwtSecret: secret! })
    ),
    Match.when(
      ({ env }) => ['development', 'testing'].includes(env),
      () => {
        if (!raw.JWT_SECRET) {
          console.warn('⚠️ Using default JWT secret for development. Set JWT_SECRET in production!')
        }
        return { jwtSecret: raw.JWT_SECRET || 'dev-secret-key-32-chars-minimum' }
      }
    ),
    Match.orElse(({ secret, env }) => {
      if (!secret) {
        errors.push('JWT_SECRET is required')
      } else if (secret.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters long')
      }
      return { jwtSecret: 'fallback-secret-key' }
    })
  )
  
  // Feature flags parsing
  const features = Match.value(raw.FEATURE_FLAGS).pipe(
    Match.when(
      (flags) => flags !== undefined,
      (flags) => {
        try {
          return JSON.parse(flags!) as Record<string, boolean>
        } catch {
          errors.push(`Invalid FEATURE_FLAGS JSON: ${flags}`)
          return {}
        }
      }
    ),
    Match.orElse(() => ({}))
  )
  
  if (errors.length > 0) {
    return Either.left(errors)
  }
  
  return Either.right({
    environment,
    logLevel,
    database: databaseConfig,
    port,
    redis: Option.isSome(redisConfig) ? redisConfig.value : undefined,
    auth: jwtSecret,
    features
  })
}

// Configuration loading with environment-specific validation
const loadConfiguration = Effect.gen(function* () {
  // Simulate loading from environment variables
  const rawConfig: RawConfig = {
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_TYPE: process.env.DATABASE_TYPE,
    PORT: process.env.PORT,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    FEATURE_FLAGS: process.env.FEATURE_FLAGS
  }
  
  yield* Console.log('🔧 Loading configuration...')
  
  const validationResult = validateConfig(rawConfig)
  
  return yield* Match.value(validationResult).pipe(
    Match.when(Either.isRight, ({ right: config }) => 
      Effect.gen(function* () {
        yield* Console.log(`✅ Configuration loaded successfully`)
        yield* Console.log(`   Environment: ${config.environment}`)
        yield* Console.log(`   Log Level: ${config.logLevel}`)
        yield* Console.log(`   Database: ${config.database.type}`)
        yield* Console.log(`   Port: ${config.port}`)
        yield* Console.log(`   Redis: ${config.redis ? 'enabled' : 'disabled'}`)
        yield* Console.log(`   Features: ${Object.keys(config.features).length} flags`)
        
        return config
      })
    ),
    Match.when(Either.isLeft, ({ left: errors }) => 
      Effect.gen(function* () {
        yield* Console.error(`❌ Configuration validation failed:`)
        for (const error of errors) {
          yield* Console.error(`   - ${error}`)
        }
        
        return Effect.fail(new Error(`Configuration validation failed with ${errors.length} errors`))
      })
    ),
    Match.exhaustive
  )
})

// Environment-specific configuration overrides
const applyEnvironmentOverrides = (config: ValidatedConfig) => {
  return Match.value(config.environment).pipe(
    Match.when('development', (env) => ({
      ...config,
      logLevel: 'debug' as const,
      features: {
        ...config.features,
        developmentTools: true,
        debugMode: true
      }
    })),
    Match.when('testing', (env) => ({
      ...config,
      logLevel: 'warn' as const,
      database: {
        ...config.database,
        url: config.database.url.includes(':memory:') ? config.database.url : ':memory:'
      },
      features: {
        ...config.features,
        testMode: true,
        analytics: false
      }
    })),
    Match.when('staging', (env) => ({
      ...config,
      features: {
        ...config.features,
        staging: true,
        previewFeatures: true
      }
    })),
    Match.when('production', (env) => ({
      ...config,
      features: {
        ...config.features,
        productionOptimizations: true,
        debugMode: false
      }
    })),
    Match.exhaustive
  )
}

// Demo configuration loading
const demonstrateConfigurationLoading = Effect.gen(function* () {
  // Set some example environment variables
  process.env.NODE_ENV = 'development'
  process.env.DATABASE_TYPE = 'sqlite'
  process.env.FEATURE_FLAGS = '{"newDashboard": true, "betaFeatures": false}'
  
  const config = yield* loadConfiguration().pipe(
    Effect.map(applyEnvironmentOverrides),
    Effect.catchAll((error) => Effect.gen(function* () {
      yield* Console.error(`Failed to load configuration: ${error.message}`)
      // Return a minimal fallback configuration
      return {
        environment: 'development' as const,
        logLevel: 'info' as const,
        database: { type: 'sqlite' as const, url: './fallback.db' },
        port: 3000,
        auth: { jwtSecret: 'fallback-secret' },
        features: {}
      }
    }))
  )
  
  yield* Console.log('\n📋 Final configuration:')
  yield* Console.log(JSON.stringify(config, null, 2))
  
  return config
})
```

## Integration Examples

### Integration with React State Management

Using Match for type-safe state management in React applications:

```typescript
import { Match, Effect } from "effect"
import { useState, useCallback, useEffect } from "react"

// Application state types
type LoadingState<T, E = Error> = 
  | { readonly _tag: 'idle' }
  | { readonly _tag: 'loading' }
  | { readonly _tag: 'success'; readonly data: T }
  | { readonly _tag: 'error'; readonly error: E }

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface UserListProps {
  users: LoadingState<User[]>
  onRefresh: () => void
  onUserClick: (user: User) => void
}

// React component using Match for state rendering
const UserListComponent: React.FC<UserListProps> = ({ users, onRefresh, onUserClick }) => {
  const renderUserList = Match.value(users).pipe(
    Match.tag('idle', () => (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">Ready to load users</p>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load Users
        </button>
      </div>
    )),
    Match.tag('loading', () => (
      <div className="text-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading users...</p>
      </div>
    )),
    Match.tag('success', ({ data }) => (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Users ({data.length})</h2>
          <button 
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Refresh
          </button>
        </div>
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No users found</p>
        ) : (
          <div className="grid gap-4">
            {data.map(user => (
              <div 
                key={user.id}
                onClick={() => onUserClick(user)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )),
    Match.tag('error', ({ error }) => (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-red-600 font-medium mb-2">Failed to load users</p>
        <p className="text-gray-500 text-sm mb-4">{error.message}</p>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    )),
    Match.exhaustive
  )

  return <div className="max-w-4xl mx-auto p-6">{renderUserList}</div>
}

// Custom hook for managing async state with Match
const useAsyncState = <T, E = Error>(
  asyncFn: () => Promise<T>
): [LoadingState<T, E>, () => void] => {
  const [state, setState] = useState<LoadingState<T, E>>({ _tag: 'idle' })

  const execute = useCallback(async () => {
    setState({ _tag: 'loading' })
    
    try {
      const data = await asyncFn()
      setState({ _tag: 'success', data })
    } catch (error) {
      setState({ _tag: 'error', error: error as E })
    }
  }, [asyncFn])

  return [state, execute]
}

// Mock API functions
const fetchUsers = async (): Promise<User[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate occasional failures
  if (Math.random() < 0.3) {
    throw new Error('Network error: Failed to fetch users')
  }
  
  return [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: '/avatars/alice.jpg' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
    { id: '3', name: 'Carol Davis', email: 'carol@example.com', avatar: '/avatars/carol.jpg' },
  ]
}

// Main application component
const UserManagementApp: React.FC = () => {
  const [usersState, refreshUsers] = useAsyncState(fetchUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Auto-load users on mount
  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    // Show user details modal or navigate to user page
    console.log('Selected user:', user)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
      </header>
      
      <main className="py-8">
        <UserListComponent 
          users={usersState}
          onRefresh={refreshUsers}
          onUserClick={handleUserClick}
        />
      </main>
      
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>ID:</strong> {selectedUser.id}</p>
            </div>
            <button 
              onClick={() => setSelectedUser(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Integration with Express.js Middleware

Type-safe request/response handling with Match:

```typescript
import { Match, Effect } from "effect"
import express, { Request, Response, NextFunction } from "express"

// Request types
type ApiRequest = 
  | { readonly _tag: 'AuthenticatedRequest'; readonly user: { id: string; role: string }; readonly req: Request }
  | { readonly _tag: 'PublicRequest'; readonly req: Request }
  | { readonly _tag: 'InvalidRequest'; readonly error: string; readonly req: Request }

// Response types
type ApiResponse<T> = 
  | { readonly _tag: 'Success'; readonly data: T; readonly status?: number }
  | { readonly _tag: 'Error'; readonly message: string; readonly code: string; readonly status: number }
  | { readonly _tag: 'Validation'; readonly errors: Array<{ field: string; message: string }>; readonly status: number }

// Authentication middleware with Pattern matching
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const processRequest = Match.value(req.headers.authorization).pipe(
    // Valid Bearer token
    Match.when(
      (auth) => auth?.startsWith('Bearer ') && auth.length > 20,
      (auth) => {
        const token = auth!.replace('Bearer ', '')
        // Simulate token validation
        const user = validateToken(token)
        return user ? 
          { _tag: 'AuthenticatedRequest' as const, user, req } :
          { _tag: 'InvalidRequest' as const, error: 'Invalid token', req }
      }
    ),
    // Public endpoints (no auth required)
    Match.when(
      () => req.path.startsWith('/public/'),
      () => ({ _tag: 'PublicRequest' as const, req })
    ),
    // Missing or invalid auth
    Match.orElse(() => ({ 
      _tag: 'InvalidRequest' as const, 
      error: 'Authentication required', 
      req 
    }))
  )

  // Attach processed request info to req object
  ;(req as any).apiRequest = processRequest
  next()
}

const validateToken = (token: string): { id: string; role: string } | null => {
  // Mock token validation
  if (token === 'valid-admin-token') return { id: 'user-1', role: 'admin' }
  if (token === 'valid-user-token') return { id: 'user-2', role: 'user' }
  return null
}

// Response handler using Pattern matching
const sendApiResponse = <T>(res: Response, response: ApiResponse<T>) => {
  return Match.value(response).pipe(
    Match.tag('Success', ({ data, status = 200 }) => {
      res.status(status).json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      })
    }),
    Match.tag('Error', ({ message, code, status }) => {
      res.status(status).json({
        success: false,
        error: {
          message,
          code,
          timestamp: new Date().toISOString()
        }
      })
    }),
    Match.tag('Validation', ({ errors, status }) => {
      res.status(status).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
          timestamp: new Date().toISOString()
        }
      })
    }),
    Match.exhaustive
  )
}

// Route handlers with Pattern matching
const createUserHandler = (req: Request, res: Response) => {
  const apiRequest = (req as any).apiRequest as ApiRequest

  const processCreate = Match.value(apiRequest).pipe(
    // Admin users can create any user
    Match.when(
      (request): request is Extract<ApiRequest, { _tag: 'AuthenticatedRequest' }> => 
        request._tag === 'AuthenticatedRequest' && request.user.role === 'admin',
      (request) => Effect.gen(function* () {
        const validation = validateCreateUserInput(request.req.body)
        
        return yield* Match.value(validation).pipe(
          Match.when(
            ({ valid }) => valid,
            ({ data }) => Effect.succeed({
              _tag: 'Success' as const,
              data: { id: 'new-user-id', ...data },
              status: 201
            })
          ),
          Match.when(
            ({ valid }) => !valid,
            ({ errors }) => Effect.succeed({
              _tag: 'Validation' as const,
              errors,
              status: 400
            })
          ),
          Match.exhaustive
        )
      })
    ),
    // Regular users can only create limited accounts
    Match.when(
      (request): request is Extract<ApiRequest, { _tag: 'AuthenticatedRequest' }> => 
        request._tag === 'AuthenticatedRequest' && request.user.role === 'user',
      () => Effect.succeed({
        _tag: 'Error' as const,
        message: 'Insufficient permissions to create users',
        code: 'FORBIDDEN',
        status: 403
      })
    ),
    // Public and invalid requests
    Match.orElse((request) => Effect.succeed({
      _tag: 'Error' as const,
      message: request._tag === 'InvalidRequest' ? request.error : 'Authentication required',
      code: 'UNAUTHORIZED',
      status: 401
    }))
  )

  Effect.runSync(processCreate.pipe(
    Effect.map((response) => sendApiResponse(res, response))
  ))
}

const getUsersHandler = (req: Request, res: Response) => {
  const apiRequest = (req as any).apiRequest as ApiRequest

  const processGet = Match.value(apiRequest).pipe(
    // Authenticated users can see users
    Match.when(
      (request): request is Extract<ApiRequest, { _tag: 'AuthenticatedRequest' }> => 
        request._tag === 'AuthenticatedRequest',
      (request) => Effect.gen(function* () {
        const users = yield* fetchUsers(request.user.role)
        return {
          _tag: 'Success' as const,
          data: users
        }
      })
    ),
    // Public users can see limited info
    Match.when(
      (request): request is Extract<ApiRequest, { _tag: 'PublicRequest' }> => 
        request._tag === 'PublicRequest',
      () => Effect.succeed({
        _tag: 'Success' as const,
        data: { message: 'Public endpoint - authentication required for user data' }
      })
    ),
    // Invalid requests
    Match.orElse((request) => Effect.succeed({
      _tag: 'Error' as const,
      message: request.error,
      code: 'UNAUTHORIZED',
      status: 401
    }))
  )

  Effect.runSync(processGet.pipe(
    Effect.map((response) => sendApiResponse(res, response))
  ))
}

// Validation helpers
const validateCreateUserInput = (body: any): { valid: true; data: any } | { valid: false; errors: Array<{ field: string; message: string }> } => {
  const errors: Array<{ field: string; message: string }> = []

  if (!body.name || typeof body.name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required and must be a string' })
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.push({ field: 'email', message: 'Valid email is required' })
  }

  if (body.role && !['user', 'admin'].includes(body.role)) {
    errors.push({ field: 'role', message: 'Role must be either "user" or "admin"' })
  }

  return errors.length > 0 
    ? { valid: false, errors }
    : { valid: true, data: { name: body.name, email: body.email, role: body.role || 'user' } }
}

const fetchUsers = (userRole: string): Effect.Effect<any[]> => {
  return Effect.succeed(
    userRole === 'admin' 
      ? [
          { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
          { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user' }
        ]
      : [
          { id: '1', name: 'Alice', email: 'alice@example.com' },
          { id: '2', name: 'Bob', email: 'bob@example.com' }
        ]
  )
}

// Express app setup
const app = express()

app.use(express.json())
app.use(authMiddleware)

// Routes
app.get('/users', getUsersHandler)
app.post('/users', createUserHandler)
app.get('/public/health', (req, res) => {
  sendApiResponse(res, {
    _tag: 'Success',
    data: { status: 'healthy', timestamp: new Date().toISOString() }
  })
})

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error)
  sendApiResponse(res, {
    _tag: 'Error',
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    status: 500
  })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`)
  console.log('\nExample requests:')
  console.log(`curl -H "Authorization: Bearer valid-admin-token" http://localhost:${PORT}/users`)
  console.log(`curl -X POST -H "Authorization: Bearer valid-admin-token" -H "Content-Type: application/json" -d '{"name":"John","email":"john@example.com"}' http://localhost:${PORT}/users`)
  console.log(`curl http://localhost:${PORT}/public/health`)
})
```

### Testing Strategies

Comprehensive testing patterns using Match for different test scenarios:

```typescript
import { Match, Effect, Either, Option } from "effect"

// Test data types
type TestResult<T> = 
  | { readonly _tag: 'Pass'; readonly value: T; readonly duration: number }
  | { readonly _tag: 'Fail'; readonly error: string; readonly expected?: unknown; readonly actual?: unknown }
  | { readonly _tag: 'Skip'; readonly reason: string }

type TestSuite = {
  name: string
  tests: Array<{
    name: string
    result: TestResult<unknown>
  }>
}

// Test assertion helpers using Match
const assertEqual = <T>(actual: T, expected: T): TestResult<T> => {
  return Match.value({ actual, expected }).pipe(
    Match.when(
      ({ actual, expected }) => JSON.stringify(actual) === JSON.stringify(expected),
      ({ actual }) => ({
        _tag: 'Pass' as const,
        value: actual,
        duration: Math.random() * 10
      })
    ),
    Match.orElse(({ actual, expected }) => ({
      _tag: 'Fail' as const,
      error: 'Values are not equal',
      expected,
      actual
    }))
  )
}

const assertMatch = <T>(value: T, pattern: (v: T) => boolean, description: string): TestResult<T> => {
  return Match.value(value).pipe(
    Match.when(pattern, (v) => ({
      _tag: 'Pass' as const,
      value: v,
      duration: Math.random() * 5
    })),
    Match.orElse((v) => ({
      _tag: 'Fail' as const,
      error: `Value does not match pattern: ${description}`,
      actual: v
    }))
  )
}

const assertEffect = <T, E>(
  effect: Effect.Effect<T, E>,
  expectation: 'success' | 'failure'
): Effect.Effect<TestResult<T | E>> => {
  return effect.pipe(
    Effect.match({
      onFailure: (error) => Match.value(expectation).pipe(
        Match.when('failure', () => ({
          _tag: 'Pass' as const,
          value: error,
          duration: Math.random() * 10
        })),
        Match.orElse(() => ({
          _tag: 'Fail' as const,
          error: 'Expected success but got failure',
          actual: error
        }))
      ),
      onSuccess: (value) => Match.value(expectation).pipe(
        Match.when('success', () => ({
          _tag: 'Pass' as const,
          value,
          duration: Math.random() * 10
        })),
        Match.orElse(() => ({
          _tag: 'Fail' as const,
          error: 'Expected failure but got success',
          actual: value
        }))
      )
    })
  )
}

// Test reporting using Match
const formatTestResult = Match.type<TestResult<unknown>>().pipe(
  Match.tag('Pass', (result) => 
    `✅ PASS (${result.duration.toFixed(2)}ms)`
  ),
  Match.tag('Fail', (result) => {
    const details = result.expected !== undefined 
      ? `\n     Expected: ${JSON.stringify(result.expected)}\n     Actual: ${JSON.stringify(result.actual)}`
      : result.actual !== undefined 
      ? `\n     Got: ${JSON.stringify(result.actual)}`
      : ''
    return `❌ FAIL: ${result.error}${details}`
  }),
  Match.tag('Skip', (result) => 
    `⏭️ SKIP: ${result.reason}`
  ),
  Match.exhaustive
)

const runTestSuite = (suite: TestSuite) => {
  return Effect.gen(function* () {
    yield* Console.log(`\n🧪 Running test suite: ${suite.name}`)
    yield* Console.log(`${'='.repeat(suite.name.length + 25)}`)
    
    let passed = 0
    let failed = 0
    let skipped = 0
    
    for (const test of suite.tests) {
      const resultText = formatTestResult(test.result)
      yield* Console.log(`  ${test.name}: ${resultText}`)
      
      Match.value(test.result).pipe(
        Match.tag('Pass', () => { passed++; return undefined }),
        Match.tag('Fail', () => { failed++; return undefined }),
        Match.tag('Skip', () => { skipped++; return undefined }),
        Match.exhaustive
      )
    }
    
    const total = suite.tests.length
    const summary = Match.value({ passed, failed, skipped, total }).pipe(
      Match.when(
        ({ failed }) => failed === 0,
        ({ passed, total }) => `🎉 All tests passed! (${passed}/${total})`
      ),
      Match.orElse(({ passed, failed, skipped, total }) => 
        `📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)`
      )
    )
    
    yield* Console.log(`\n${summary}`)
    
    return { passed, failed, skipped, total }
  })
}

// Example: Testing the Match module itself
const matchModuleTests: TestSuite = {
  name: 'Match Module Tests',
  tests: [
    {
      name: 'Basic type matching',
      result: (() => {
        const matcher = Match.type<string | number>().pipe(
          Match.when(Match.string, (s) => `string: ${s}`),
          Match.when(Match.number, (n) => `number: ${n}`),
          Match.exhaustive
        )
        
        return assertEqual(matcher('hello'), 'string: hello')
      })()
    },
    {
      name: 'Tagged union matching',
      result: (() => {
        type Event = 
          | { _tag: 'click'; x: number; y: number }
          | { _tag: 'keypress'; key: string }
        
        const handler = Match.type<Event>().pipe(
          Match.tag('click', (e) => `Clicked at ${e.x}, ${e.y}`),
          Match.tag('keypress', (e) => `Pressed ${e.key}`),
          Match.exhaustive
        )
        
        const clickEvent: Event = { _tag: 'click', x: 100, y: 200 }
        return assertEqual(handler(clickEvent), 'Clicked at 100, 200')
      })()
    },
    {
      name: 'Option matching',
      result: (() => {
        const processOption = Match.type<Option.Option<string>>().pipe(
          Match.when(Option.isSome, ({ value }) => `Found: ${value}`),
          Match.when(Option.isNone, () => 'Not found'),
          Match.exhaustive
        )
        
        return assertEqual(processOption(Option.some('test')), 'Found: test')
      })()
    },
    {
      name: 'Either matching',
      result: (() => {
        const processEither = Match.type<Either.Either<string, number>>().pipe(
          Match.when(Either.isLeft, ({ left }) => `Error: ${left}`),
          Match.when(Either.isRight, ({ right }) => `Success: ${right}`),
          Match.exhaustive
        )
        
        return assertEqual(processEither(Either.right(42)), 'Success: 42')
      })()
    },
    {
      name: 'Complex nested matching',
      result: (() => {
        type ApiResponse = {
          status: number
          body: { success: boolean; data?: unknown; error?: string }
        }
        
        const handleResponse = Match.type<ApiResponse>().pipe(
          Match.when(
            (r) => r.status >= 200 && r.status < 300 && r.body.success,
            (r) => `Success: ${JSON.stringify(r.body.data)}`
          ),
          Match.when(
            (r) => r.status >= 400 && r.status < 500,
            (r) => `Client Error: ${r.body.error || 'Unknown error'}`
          ),
          Match.when(
            (r) => r.status >= 500,
            () => 'Server Error'
          ),
          Match.orElse((r) => `Unknown response: ${r.status}`)
        )
        
        const response: ApiResponse = {
          status: 200,
          body: { success: true, data: { id: 1, name: 'test' } }
        }
        
        return assertEqual(handleResponse(response), 'Success: {"id":1,"name":"test"}')
      })()
    },
    {
      name: 'Guard function testing',
      result: assertMatch(
        [1, 2, 3, 4, 5],
        (arr) => Array.isArray(arr) && arr.length === 5 && arr.every(x => typeof x === 'number'),
        'array of 5 numbers'
      )
    },
    {
      name: 'Effect success test',
      result: Effect.runSync(assertEffect(
        Effect.succeed('test value'),
        'success'
      ))
    },
    {
      name: 'Effect failure test',
      result: Effect.runSync(assertEffect(
        Effect.fail(new Error('test error')),
        'failure'
      ))
    },
    {
      name: 'Skipped test example',
      result: {
        _tag: 'Skip',
        reason: 'Feature not yet implemented'
      }
    }
  ]
}

// Property-based testing helper using Match
const generateTestData = (type: 'string' | 'number' | 'boolean' | 'array' | 'object') => {
  return Match.value(type).pipe(
    Match.when('string', () => `test-${Math.random().toString(36).substr(2, 9)}`),
    Match.when('number', () => Math.floor(Math.random() * 1000)),
    Match.when('boolean', () => Math.random() > 0.5),
    Match.when('array', () => Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => i)),
    Match.when('object', () => ({ id: Math.floor(Math.random() * 100), value: 'test' })),
    Match.exhaustive
  )
}

const propertyBasedTest = (
  name: string,
  property: (data: unknown) => boolean,
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'object',
  iterations = 100
): { name: string; result: TestResult<unknown> } => {
  const results = Array.from({ length: iterations }, () => {
    const testData = generateTestData(dataType)
    return property(testData)
  })
  
  const allPassed = results.every(Boolean)
  const passedCount = results.filter(Boolean).length
  
  return {
    name,
    result: allPassed 
      ? { _tag: 'Pass', value: `All ${iterations} iterations passed`, duration: iterations * 0.1 }
      : { _tag: 'Fail', error: `Failed on ${iterations - passedCount}/${iterations} iterations` }
  }
}

// Property-based tests
const propertyTests: TestSuite = {
  name: 'Property-Based Tests',
  tests: [
    propertyBasedTest(
      'String length is always non-negative',
      (data) => typeof data === 'string' && data.length >= 0,
      'string'
    ),
    propertyBasedTest(
      'Numbers are finite',
      (data) => typeof data === 'number' && Number.isFinite(data),
      'number'
    ),
    propertyBasedTest(
      'Arrays have length property',
      (data) => Array.isArray(data) && typeof data.length === 'number',
      'array'
    ),
    propertyBasedTest(
      'Objects are truthy',
      (data) => typeof data === 'object' && !!data,
      'object'
    )
  ]
}

// Run all test suites
const runAllTests = Effect.gen(function* () {
  yield* Console.log('🚀 Starting test execution...')
  
  const suites = [matchModuleTests, propertyTests]
  const results = []
  
  for (const suite of suites) {
    const result = yield* runTestSuite(suite)
    results.push(result)
  }
  
  const totals = results.reduce(
    (acc, result) => ({
      passed: acc.passed + result.passed,
      failed: acc.failed + result.failed,
      skipped: acc.skipped + result.skipped,
      total: acc.total + result.total
    }),
    { passed: 0, failed: 0, skipped: 0, total: 0 }
  )
  
  yield* Console.log(`\n${'='.repeat(50)}`)
  yield* Console.log('📊 FINAL TEST SUMMARY')
  yield* Console.log(`${'='.repeat(50)}`)
  yield* Console.log(`Total Tests: ${totals.total}`)
  yield* Console.log(`Passed: ${totals.passed}`)
  yield* Console.log(`Failed: ${totals.failed}`)
  yield* Console.log(`Skipped: ${totals.skipped}`)
  
  const successRate = totals.total > 0 ? (totals.passed / totals.total * 100).toFixed(1) : '0'
  yield* Console.log(`Success Rate: ${successRate}%`)
  
  if (totals.failed === 0) {
    yield* Console.log('\n🎉 All tests passed!')
  } else {
    yield* Console.log(`\n⚠️ ${totals.failed} test(s) failed`)
  }
})

// Export for running
export { runAllTests }
```

## Conclusion

Match provides **type-safe pattern matching**, **exhaustive case analysis**, and **composable conditional logic** for TypeScript applications using Effect.

Key benefits:
- **Exhaustiveness Checking**: Compile-time guarantee that all cases are handled, preventing runtime errors
- **Type Safety**: Automatic type narrowing in match branches with full TypeScript integration
- **Composability**: Clean, readable code that composes well with other Effect modules and patterns

The Match module is essential when you need reliable conditional logic, state machines, error handling strategies, or any scenario where traditional switch statements fall short. It transforms complex branching logic into declarative, type-safe patterns that are easy to understand, maintain, and extend.