# Arbitrary: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Arbitrary Solves

When writing tests, especially property-based tests, generating meaningful test data is a constant challenge. Traditional approaches often lead to:

```typescript
// Traditional approach - manual test data generation
const userTests = [
  { id: 1, name: "John", email: "john@example.com", age: 25 },
  { id: 2, name: "Jane", email: "jane@example.com", age: 30 },
  { id: 3, name: "", email: "invalid-email", age: -5 } // Edge cases hard to remember
]

// Testing with limited, static examples
describe("User validation", () => {
  userTests.forEach(user => {
    it(`should validate user ${user.id}`, () => {
      // Only tests these specific cases
      expect(validateUser(user)).toBe(/* ... */)
    })
  })
})
```

This approach leads to:
- **Limited Coverage** - Only tests the cases you think of
- **Maintenance Burden** - Manual updates when schemas change
- **Missing Edge Cases** - Hard to cover all possible combinations
- **Type Drift** - Test data can become inconsistent with actual types

### The Arbitrary Solution

Effect's Arbitrary module automatically generates test data from your Schema definitions, ensuring comprehensive coverage and type safety:

```typescript
import { Arbitrary, FastCheck as fc, Schema as S } from "effect"

// Define your domain schema once
const User = S.Struct({
  id: S.Number.pipe(S.positive()),
  name: S.String.pipe(S.minLength(1), S.maxLength(50)),
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: S.Number.pipe(S.int(), S.between(0, 120))
})

// Generate unlimited valid test data automatically
const userArbitrary = Arbitrary.make(User)
const randomUsers = fc.sample(userArbitrary, 100) // 100 valid users
```

### Key Concepts

**LazyArbitrary**: A function that takes FastCheck and returns an Arbitrary generator

**Schema Integration**: Automatically derives generators from Schema definitions

**Constraint Propagation**: Respects Schema refinements and constraints automatically

## Basic Usage Patterns

### Pattern 1: Simple Schema to Arbitrary

```typescript
import { Arbitrary, FastCheck as fc, Schema as S } from "effect"

// Create a schema
const ProductSchema = S.Struct({
  id: S.String,
  name: S.String,
  price: S.Number.pipe(S.positive()),
  inStock: S.Boolean
})

// Generate an arbitrary from the schema
const productArbitrary = Arbitrary.make(ProductSchema)

// Sample some values
const sampleProducts = fc.sample(productArbitrary, 5)
console.log(sampleProducts)
// [
//   { id: "abc123", name: "Widget", price: 29.99, inStock: true },
//   { id: "def456", name: "Gadget", price: 15.50, inStock: false },
//   // ... 3 more random products
// ]
```

### Pattern 2: Working with Constraints

```typescript
// Schema with constraints automatically generates constrained data
const EmailSchema = S.String.pipe(
  S.minLength(5),
  S.maxLength(50),
  S.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
)

const emailArbitrary = Arbitrary.make(EmailSchema)
const emails = fc.sample(emailArbitrary, 10)
// All emails will respect the constraints: length 5-50, valid format
```

### Pattern 3: Custom Arbitrary Annotations

```typescript
// Custom generator for specific business logic
const UserIdSchema = S.String.annotations({
  arbitrary: () => (fc) => fc.string({ minLength: 8, maxLength: 8 })
    .map(s => `usr_${s}`)
})

const userIdArbitrary = Arbitrary.make(UserIdSchema)
const userIds = fc.sample(userIdArbitrary, 5)
// ["usr_abc12345", "usr_xyz67890", ...]
```

## Real-World Examples

### Example 1: E-commerce Order Testing

```typescript
import { Arbitrary, FastCheck as fc, Schema as S, Effect } from "effect"

// Domain schemas
const OrderStatus = S.Literal("pending", "processing", "shipped", "delivered", "cancelled")

const OrderItem = S.Struct({
  productId: S.String.pipe(S.pattern(/^prod_[a-z0-9]{8}$/)),
  quantity: S.Number.pipe(S.int(), S.between(1, 10)),
  unitPrice: S.Number.pipe(S.positive()),
  total: S.Number.pipe(S.positive())
})

const Order = S.Struct({
  id: S.String.pipe(S.pattern(/^order_[a-z0-9]{12}$/)),
  customerId: S.String.pipe(S.pattern(/^cust_[a-z0-9]{10}$/)),
  items: S.Array(OrderItem).pipe(S.minItems(1), S.maxItems(5)),
  status: OrderStatus,
  createdAt: S.DateFromSelf,
  total: S.Number.pipe(S.positive())
})

// Property-based testing with generated orders
const testOrderProcessing = Effect.gen(function* () {
  const orderArbitrary = Arbitrary.make(Order)
  
  // Test property: order total should equal sum of item totals
  const property = fc.property(orderArbitrary, (order) => {
    const expectedTotal = order.items.reduce((sum, item) => sum + item.total, 0)
    return Math.abs(order.total - expectedTotal) < 0.01
  })
  
  return fc.assert(property)
})
```

### Example 2: User Profile Validation

```typescript
// User profile with complex validation rules
const UserProfile = S.Struct({
  username: S.String.pipe(
    S.minLength(3),
    S.maxLength(20),
    S.pattern(/^[a-zA-Z0-9_]+$/)
  ),
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: S.Number.pipe(S.int(), S.between(13, 120)),
  bio: S.String.pipe(S.maxLength(500)),
  interests: S.Array(S.String).pipe(S.maxItems(10)),
  isVerified: S.Boolean,
  createdAt: S.DateFromSelf,
  lastLoginAt: S.optional(S.DateFromSelf)
})

// Generate test users for validation testing
const validateUserProfiles = Effect.gen(function* () {
  const userArbitrary = Arbitrary.make(UserProfile)
  
  // Test that all generated users pass validation
  const validationProperty = fc.property(userArbitrary, (user) => {
    const result = S.decodeUnknownSync(UserProfile)(user)
    return result !== null // Should never throw
  })
  
  return fc.assert(validationProperty)
})
```

### Example 3: Financial Transaction Processing

```typescript
// Financial domain with precise constraints
const Currency = S.Literal("USD", "EUR", "GBP", "JPY")

const MoneyAmount = S.Struct({
  amount: S.Number.pipe(
    S.positive(),
    S.multipleOf(0.01) // Cent precision
  ),
  currency: Currency
})

const Transaction = S.Struct({
  id: S.String.pipe(S.pattern(/^txn_[A-Z0-9]{16}$/)),
  from: S.String.pipe(S.pattern(/^acc_[0-9]{10}$/)),
  to: S.String.pipe(S.pattern(/^acc_[0-9]{10}$/)),
  amount: MoneyAmount,
  fee: MoneyAmount,
  timestamp: S.DateFromSelf,
  type: S.Literal("transfer", "payment", "refund")
})

// Test transaction processing with generated data
const testTransactionProcessing = Effect.gen(function* () {
  const transactionArbitrary = Arbitrary.make(Transaction)
  
  // Property: fee should never exceed transaction amount
  const feeProperty = fc.property(transactionArbitrary, (txn) => {
    if (txn.amount.currency === txn.fee.currency) {
      return txn.fee.amount <= txn.amount.amount
    }
    return true // Different currencies, skip check
  })
  
  return fc.assert(feeProperty)
})
```

## Advanced Features Deep Dive

### Feature 1: Custom Arbitrary Annotations

Arbitrary annotations allow you to provide custom generators for specific types or add business-specific constraints.

#### Basic Custom Annotations

```typescript
// Custom UUID generator
const UuidSchema = S.String.annotations({
  arbitrary: () => (fc) => fc.uuid()
})

// Custom date range generator
const RecentDateSchema = S.DateFromSelf.annotations({
  arbitrary: () => (fc) => fc.date({
    min: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    max: new Date()
  })
})
```

#### Real-World Custom Annotation Example

```typescript
// Business-specific ID generator
const CustomerIdSchema = S.String.annotations({
  arbitrary: () => (fc) => 
    fc.tuple(
      fc.constantFrom("PREM", "STAN", "BASI"), // Customer tier
      fc.integer({ min: 100000, max: 999999 })  // Sequential number
    ).map(([tier, num]) => `${tier}${num}`)
})

// Weighted arbitrary for realistic data distribution
const OrderPrioritySchema = S.Literal("low", "normal", "high", "urgent").annotations({
  arbitrary: () => (fc) => fc.oneof(
    { weight: 5, arbitrary: fc.constant("normal") },
    { weight: 3, arbitrary: fc.constant("low") },
    { weight: 1, arbitrary: fc.constant("high") },
    { weight: 1, arbitrary: fc.constant("urgent") }
  )
})
```

#### Advanced Custom Annotation: Dependent Data

```typescript
// Generate related data with dependencies
const OrderWithCalculatedTotal = S.Struct({
  items: S.Array(S.Struct({
    price: S.Number.pipe(S.positive()),
    quantity: S.Number.pipe(S.int(), S.positive())
  })),
  total: S.Number.pipe(S.positive())
}).annotations({
  arbitrary: () => (fc) => 
    fc.array(
      fc.record({
        price: fc.float({ min: 1, max: 1000, fractionDigits: 2 }),
        quantity: fc.integer({ min: 1, max: 10 })
      }),
      { minLength: 1, maxLength: 5 }
    ).map(items => ({
      items,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }))
})
```

### Feature 2: Constraint Propagation and Merging

The Arbitrary module automatically merges multiple constraints from refinements:

#### Understanding Constraint Merging

```typescript
// Multiple constraints are automatically merged
const StrictEmailSchema = S.String
  .pipe(S.minLength(5))
  .pipe(S.maxLength(50))
  .pipe(S.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))

// All constraints are respected in generated data
const emailArbitrary = Arbitrary.make(StrictEmailSchema)
```

#### Advanced Constraint Configuration

```typescript
// Custom constraint configuration
const constrainedNumberArbitrary = Arbitrary.make(
  S.Number.pipe(
    S.int(),
    S.between(1, 100),
    S.multipleOf(5)
  )
)

// Generated numbers will be: integers, between 1-100, and multiples of 5
const numbers = fc.sample(constrainedNumberArbitrary, 10)
// [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]
```

### Feature 3: Recursive Schema Support

Arbitrary handles recursive schemas through intelligent depth limiting:

#### Basic Recursive Schema

```typescript
interface Category {
  readonly id: string
  readonly name: string
  readonly subcategories: ReadonlyArray<Category>
}

const CategorySchema: S.Schema<Category> = S.Struct({
  id: S.String,
  name: S.String,
  subcategories: S.Array(S.suspend(() => CategorySchema))
})

// Automatically generates finite recursive structures
const categoryArbitrary = Arbitrary.make(CategorySchema)
const categories = fc.sample(categoryArbitrary, 3)
```

#### Recursive Schema with Custom Depth Control

```typescript
// Control recursion depth for performance
const makeCategoryArbitraryWithDepth = (maxDepth: number) => {
  const categoryWithDepth = S.Struct({
    id: S.String,
    name: S.String,
    subcategories: S.Array(S.suspend(() => categoryWithDepth))
  })
  
  // Use LazyArbitrary for custom depth control
  return Arbitrary.makeLazy(categoryWithDepth)
}
```

## Practical Patterns & Best Practices

### Pattern 1: Schema-First Test Data Generation

```typescript
// Helper for consistent test data generation
const makeTestDataGenerator = <A, I, R>(
  schema: S.Schema<A, I, R>,
  customizations?: Partial<Record<keyof A, any>>
) => {
  const baseArbitrary = Arbitrary.make(schema)
  
  if (!customizations) return baseArbitrary
  
  return baseArbitrary.map(generated => ({
    ...generated,
    ...customizations
  }))
}

// Usage in tests
const testUsers = makeTestDataGenerator(UserSchema, {
  isVerified: true // Override for specific test scenarios
})
```

### Pattern 2: Property-Based Testing Helpers

```typescript
// Reusable property testing utilities
const createPropertyTest = <T>(
  schema: S.Schema<T>,
  property: (value: T) => boolean,
  options?: fc.Parameters<[T]>
) => {
  const arbitrary = Arbitrary.make(schema)
  return fc.property(arbitrary, property, options)
}

// Usage
const testEmailValidation = createPropertyTest(
  EmailSchema,
  (email) => email.includes("@") && email.includes("."),
  { numRuns: 1000 }
)

// Run the test
fc.assert(testEmailValidation)
```

### Pattern 3: Fixture Generation for Integration Tests

```typescript
// Generate realistic test fixtures
const createTestFixtures = Effect.gen(function* () {
  const userArbitrary = Arbitrary.make(UserSchema)
  const orderArbitrary = Arbitrary.make(OrderSchema)
  const productArbitrary = Arbitrary.make(ProductSchema)
  
  // Generate related test data
  const users = fc.sample(userArbitrary, 10)
  const products = fc.sample(productArbitrary, 50)
  const orders = fc.sample(orderArbitrary, 25)
  
  return {
    users,
    products,
    orders,
    // Helper to get random user/product for order generation
    getRandomUser: () => users[Math.floor(Math.random() * users.length)],
    getRandomProduct: () => products[Math.floor(Math.random() * products.length)]
  }
})

// Use in integration tests
const setupTestData = Effect.gen(function* () {
  const fixtures = yield* createTestFixtures
  
  // Seed database with generated data
  yield* Database.users.insertMany(fixtures.users)
  yield* Database.products.insertMany(fixtures.products)
  yield* Database.orders.insertMany(fixtures.orders)
  
  return fixtures
})
```

### Pattern 4: Gradual Constraint Application

```typescript
// Build constraints incrementally for complex domains
const buildRestrictedUserSchema = (restrictions: {
  minAge?: number
  maxAge?: number
  requiredDomain?: string
  maxBioLength?: number
}) => {
  let schema = BaseUserSchema
  
  if (restrictions.minAge !== undefined) {
    schema = schema.pipe(S.field("age", S.greaterThanOrEqualTo(restrictions.minAge)))
  }
  
  if (restrictions.maxAge !== undefined) {
    schema = schema.pipe(S.field("age", S.lessThanOrEqualTo(restrictions.maxAge)))
  }
  
  if (restrictions.requiredDomain) {
    const domainPattern = new RegExp(`@${restrictions.requiredDomain}$`)
    schema = schema.pipe(S.field("email", S.pattern(domainPattern)))
  }
  
  if (restrictions.maxBioLength) {
    schema = schema.pipe(S.field("bio", S.maxLength(restrictions.maxBioLength)))
  }
  
  return schema
}

// Generate age-restricted users for specific tests
const adultUserArbitrary = Arbitrary.make(
  buildRestrictedUserSchema({ minAge: 18 })
)
```

## Integration Examples

### Integration with Effect Testing

```typescript
import { Effect, Layer, TestContext } from "effect"
import { Arbitrary, FastCheck as fc, Schema as S } from "effect"

// Service for user operations
interface UserService {
  readonly createUser: (user: User) => Effect.Effect<User, UserError>
  readonly validateUser: (user: User) => Effect.Effect<boolean, ValidationError>
}

const UserService = S.TaggedClass<UserService>()("UserService", {
  createUser: S.FunctionSchema({
    input: S.Tuple(UserSchema),
    output: S.Effect(UserSchema, UserErrorSchema)
  }),
  validateUser: S.FunctionSchema({
    input: S.Tuple(UserSchema), 
    output: S.Effect(S.Boolean, ValidationErrorSchema)
  })
})

// Property-based testing with Effect
const testUserService = Effect.gen(function* () {
  const userService = yield* UserService
  const userArbitrary = Arbitrary.make(UserSchema)
  
  // Test property: created users should always validate
  const property = fc.asyncProperty(userArbitrary, async (user) => {
    const created = await Effect.runPromise(userService.createUser(user))
    const isValid = await Effect.runPromise(userService.validateUser(created))
    return isValid
  })
  
  return fc.assert(property)
}).pipe(
  Effect.provide(TestUserServiceLayer)
)
```

### Integration with Database Testing

```typescript
// Database integration with generated test data
const testDatabaseOperations = Effect.gen(function* () {
  const db = yield* Database
  const userArbitrary = Arbitrary.make(UserSchema)
  
  // Test database round-trip with arbitrary data
  const roundTripProperty = fc.asyncProperty(userArbitrary, async (user) => {
    // Insert user
    const inserted = await Effect.runPromise(
      db.users.insert(user).pipe(Effect.provide(DatabaseLayer))
    )
    
    // Retrieve user
    const retrieved = await Effect.runPromise(
      db.users.findById(inserted.id).pipe(Effect.provide(DatabaseLayer))
    )
    
    // Should be equal (ignoring timestamps)
    const { createdAt: _, ...insertedData } = inserted
    const { createdAt: __, ...retrievedData } = retrieved
    
    return JSON.stringify(insertedData) === JSON.stringify(retrievedData)
  })
  
  return fc.assert(roundTripProperty)
})
```

### Integration with HTTP API Testing

```typescript
// API testing with generated payloads
const testUserAPI = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const userArbitrary = Arbitrary.make(CreateUserRequestSchema)
  
  // Test API with generated requests
  const apiProperty = fc.asyncProperty(userArbitrary, async (userRequest) => {
    const response = await Effect.runPromise(
      client.post("/users", {
        body: JSON.stringify(userRequest),
        headers: { "Content-Type": "application/json" }
      }).pipe(
        Effect.flatMap(response => response.json),
        Effect.provide(HttpClientLayer)
      )
    )
    
    // Response should conform to UserResponseSchema
    const validResponse = S.is(UserResponseSchema)(response)
    return validResponse
  })
  
  return fc.assert(apiProperty)
})
```

### Testing Strategies

```typescript
// Comprehensive testing strategy with Arbitrary
const createTestSuite = <T>(
  name: string,
  schema: S.Schema<T>,
  operations: {
    serialize: (value: T) => string
    deserialize: (str: string) => T
    validate: (value: T) => boolean
    transform: (value: T) => T
  }
) => {
  const arbitrary = Arbitrary.make(schema)
  
  return {
    testSerialization: fc.property(arbitrary, (value) => {
      const serialized = operations.serialize(value)
      const deserialized = operations.deserialize(serialized)
      return JSON.stringify(value) === JSON.stringify(deserialized)
    }),
    
    testValidation: fc.property(arbitrary, (value) => {
      return operations.validate(value) === true
    }),
    
    testTransformation: fc.property(arbitrary, (value) => {
      const transformed = operations.transform(value)
      return operations.validate(transformed)
    }),
    
    runAll: () => {
      console.log(`Running test suite: ${name}`)
      fc.assert(this.testSerialization)
      fc.assert(this.testValidation)
      fc.assert(this.testTransformation)
      console.log(`✓ All tests passed for ${name}`)
    }
  }
}

// Usage
const userTestSuite = createTestSuite("User", UserSchema, {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
  validate: (user) => S.is(UserSchema)(user),
  transform: (user) => ({ ...user, lastUpdated: new Date() })
})

userTestSuite.runAll()
```

## Conclusion

Arbitrary provides **automatic test data generation**, **type-safe property testing**, and **schema-driven test coverage** for Effect applications.

Key benefits:
- **Comprehensive Coverage**: Tests all possible values your schemas can represent
- **Type Safety**: Generated data always matches your schema definitions
- **Maintainability**: Test data evolves automatically with schema changes
- **Property-Based Testing**: Enables testing of invariants across large input spaces
- **Integration Ready**: Works seamlessly with Effect's ecosystem and testing tools

Use Arbitrary when you need thorough testing coverage, want to discover edge cases automatically, or need to generate realistic test data that stays in sync with your evolving schemas.