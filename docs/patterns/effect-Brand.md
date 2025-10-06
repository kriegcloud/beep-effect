# Brand: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Brand Solves

Consider building a financial system where you need to handle different types of numeric identifiers:

```typescript
// Traditional approach - structurally identical types
interface User {
  id: number
  accountId: number
  transactionId: number
}

interface Account {
  id: number
  userId: number
  balance: number
}

// These functions accept any number - dangerous!
function getUser(userId: number): User | null { /* ... */ }
function getAccount(accountId: number): Account | null { /* ... */ }
function processTransaction(transactionId: number, amount: number): void { /* ... */ }

// Runtime errors waiting to happen
const user = getUser(123)
const account = getAccount(456)
const transaction = processTransaction(789, 100)

// Oops! Mixed up the IDs - compiles but wrong at runtime
const wrongUser = getUser(account.id) // Should be account.userId
const wrongAccount = getAccount(user.id) // Should be user.accountId
processTransaction(user.id, 50) // Should be transaction ID, not user ID
```

This approach leads to:
- **Type confusion** - accidentally passing wrong ID types
- **Runtime errors** - compiler can't catch ID mismatches
- **Maintenance burden** - unclear which number represents what
- **Data corruption** - mixing up IDs can corrupt business logic

### The Brand Solution

Brand creates **nominal types** that are distinct at compile time but identical at runtime:

```typescript
import { Brand } from "effect"

// Create distinct branded types
type UserId = number & Brand.Brand<"UserId">
type AccountId = number & Brand.Brand<"AccountId">
type TransactionId = number & Brand.Brand<"TransactionId">

// Constructors for creating branded values
const UserId = Brand.nominal<UserId>()
const AccountId = Brand.nominal<AccountId>()
const TransactionId = Brand.nominal<TransactionId>()

interface User {
  id: UserId
  accountId: AccountId
  transactionId: TransactionId
}

interface Account {
  id: AccountId
  userId: UserId
  balance: number
}

// Type-safe functions
function getUser(userId: UserId): User | null { /* ... */ }
function getAccount(accountId: AccountId): Account | null { /* ... */ }
function processTransaction(transactionId: TransactionId, amount: number): void { /* ... */ }

// Safe usage - compiler enforces correct types
const user = getUser(UserId(123))
const account = getAccount(AccountId(456))
processTransaction(TransactionId(789), 100)

// Compile-time errors prevent mistakes
// getUser(account.id) // ❌ Type error: AccountId not assignable to UserId
// getAccount(user.id) // ❌ Type error: UserId not assignable to AccountId
// processTransaction(user.id, 50) // ❌ Type error: UserId not assignable to TransactionId
```

### Key Concepts

**Nominal Types**: Types that are distinct based on their name/brand, not their structure - `UserId` and `AccountId` are both numbers but treated as different types.

**Branded Types**: Base types with an additional "brand" marker - `number & Brand.Brand<"UserId">` combines the number type with a unique brand.

**Refined Types**: Branded types with runtime validation - ensures values meet specific criteria before accepting them.

## Basic Usage Patterns

### Pattern 1: Nominal Types for Domain Modeling

```typescript
import { Brand } from "effect"

// Domain-specific ID types
type ProductId = string & Brand.Brand<"ProductId">
type CategoryId = string & Brand.Brand<"CategoryId">
type OrderId = string & Brand.Brand<"OrderId">

// Create constructors
const ProductId = Brand.nominal<ProductId>()
const CategoryId = Brand.nominal<CategoryId>()
const OrderId = Brand.nominal<OrderId>()

// Domain models with branded IDs
interface Product {
  id: ProductId
  name: string
  categoryId: CategoryId
  price: number
}

interface Category {
  id: CategoryId
  name: string
  parentId: CategoryId | null
}

interface Order {
  id: OrderId
  items: Array<{ productId: ProductId; quantity: number }>
  total: number
}
```

### Pattern 2: Refined Types with Validation

```typescript
import { Brand, Option } from "effect"

// Email with validation
type Email = string & Brand.Brand<"Email">

const Email = Brand.refined<Email>(
  (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  (email) => Brand.error(`Invalid email format: ${email}`)
)

// Positive number with validation
type PositiveNumber = number & Brand.Brand<"PositiveNumber">

const PositiveNumber = Brand.refined<PositiveNumber>(
  (n) => n > 0,
  (n) => Brand.error(`Expected positive number, got: ${n}`)
)

// Safe usage with validation
const email = Email("user@example.com") // ✅ Valid
// const invalidEmail = Email("not-an-email") // ❌ Throws error

const price = PositiveNumber(29.99) // ✅ Valid
// const invalidPrice = PositiveNumber(-5) // ❌ Throws error
```

### Pattern 3: Safe Option and Either Patterns

```typescript
import { Brand, Option, Either } from "effect"

type UserId = number & Brand.Brand<"UserId">
const UserId = Brand.refined<UserId>(
  (id) => Number.isInteger(id) && id > 0,
  (id) => Brand.error(`Invalid user ID: ${id}`)
)

// Safe construction with Option
const maybeUserId: Option.Option<UserId> = UserId.option(123)
// Option.some(123) - valid ID

const invalidUserId: Option.Option<UserId> = UserId.option(-1)
// Option.none() - invalid ID

// Safe construction with Either
const userIdResult: Either.Either<UserId, Brand.Brand.BrandErrors> = UserId.either(123)
// Either.right(123) - valid ID

const invalidUserIdResult = UserId.either(-1)
// Either.left([{ message: "Invalid user ID: -1" }]) - invalid ID

// Type checking
if (UserId.is(123)) {
  // TypeScript knows this is a valid UserId
  const safeId: UserId = 123
}
```

## Real-World Examples

### Example 1: E-commerce System with Domain Safety

```typescript
import { Brand, Effect, Option, Either } from "effect"

// Domain types
type ProductId = string & Brand.Brand<"ProductId">
type CustomerId = string & Brand.Brand<"CustomerId">
type OrderId = string & Brand.Brand<"OrderId">
type Price = number & Brand.Brand<"Price">
type Quantity = number & Brand.Brand<"Quantity">

// Constructors with validation
const ProductId = Brand.nominal<ProductId>()
const CustomerId = Brand.nominal<CustomerId>()
const OrderId = Brand.nominal<OrderId>()

const Price = Brand.refined<Price>(
  (price) => price >= 0,
  (price) => Brand.error(`Price must be non-negative: ${price}`)
)

const Quantity = Brand.refined<Quantity>(
  (qty) => Number.isInteger(qty) && qty > 0,
  (qty) => Brand.error(`Quantity must be positive integer: ${qty}`)
)

// Domain models
interface Product {
  id: ProductId
  name: string
  price: Price
  inStock: Quantity
}

interface OrderItem {
  productId: ProductId
  quantity: Quantity
  unitPrice: Price
}

interface Order {
  id: OrderId
  customerId: CustomerId
  items: Array<OrderItem>
  total: Price
}

// Business logic with type safety
class OrderService {
  static createOrder = (
    customerId: CustomerId,
    items: Array<{ productId: ProductId; quantity: number; unitPrice: number }>
  ): Effect.Effect<Order, Brand.Brand.BrandErrors> => {
    return Effect.gen(function* () {
      const orderId = yield* Effect.sync(() => OrderId(`order_${Date.now()}`))
      
      const validatedItems = yield* Effect.all(
        items.map(item => Effect.gen(function* () {
          const quantity = yield* Effect.fromEither(Quantity.either(item.quantity))
          const unitPrice = yield* Effect.fromEither(Price.either(item.unitPrice))
          
          return {
            productId: item.productId,
            quantity,
            unitPrice
          } satisfies OrderItem
        }))
      )
      
      const total = yield* Effect.fromEither(
        Price.either(
          validatedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        )
      )
      
      return {
        id: orderId,
        customerId,
        items: validatedItems,
        total
      } satisfies Order
    })
  }

  static addItem = (
    order: Order,
    productId: ProductId,
    quantity: number,
    unitPrice: number
  ): Effect.Effect<Order, Brand.Brand.BrandErrors> => {
    return Effect.gen(function* () {
      const validQuantity = yield* Effect.fromEither(Quantity.either(quantity))
      const validUnitPrice = yield* Effect.fromEither(Price.either(unitPrice))
      
      const newItem: OrderItem = {
        productId,
        quantity: validQuantity,
        unitPrice: validUnitPrice
      }
      
      const updatedItems = [...order.items, newItem]
      const newTotal = yield* Effect.fromEither(
        Price.either(
          updatedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        )
      )
      
      return {
        ...order,
        items: updatedItems,
        total: newTotal
      }
    })
  }
}

// Usage
const customerId = CustomerId("customer_123")
const productId = ProductId("product_456")

const orderCreation = OrderService.createOrder(customerId, [
  { productId, quantity: 2, unitPrice: 29.99 }
])

const program = Effect.gen(function* () {
  const order = yield* orderCreation
  const updatedOrder = yield* OrderService.addItem(order, productId, 1, 29.99)
  
  console.log(`Order ${order.id} created for customer ${order.customerId}`)
  console.log(`Total: $${updatedOrder.total}`)
  
  return updatedOrder
})
```

### Example 2: Database Model with Branded Foreign Keys

```typescript
import { Brand, Effect, Schema } from "effect"

// Database ID types
type UserId = number & Brand.Brand<"UserId">
type PostId = number & Brand.Brand<"PostId">
type CommentId = number & Brand.Brand<"CommentId">

// Refined constructors with ID validation
const UserId = Brand.refined<UserId>(
  (id) => Number.isInteger(id) && id > 0,
  (id) => Brand.error(`Invalid user ID: ${id}`)
)

const PostId = Brand.refined<PostId>(
  (id) => Number.isInteger(id) && id > 0,
  (id) => Brand.error(`Invalid post ID: ${id}`)
)

const CommentId = Brand.refined<CommentId>(
  (id) => Number.isInteger(id) && id > 0,
  (id) => Brand.error(`Invalid comment ID: ${id}`)
)

// Database models with branded foreign keys
interface User {
  id: UserId
  username: string
  email: string
  createdAt: Date
}

interface Post {
  id: PostId
  userId: UserId  // Foreign key - can't mix up with PostId
  title: string
  content: string
  createdAt: Date
}

interface Comment {
  id: CommentId
  postId: PostId  // Foreign key - can't mix up with UserId
  userId: UserId  // Foreign key - can't mix up with CommentId
  content: string
  createdAt: Date
}

// Repository pattern with type safety
class UserRepository {
  static findById = (id: UserId): Effect.Effect<Option.Option<User>, Error> => {
    return Effect.gen(function* () {
      // Database query implementation
      const result = yield* Effect.tryPromise(() => 
        database.query('SELECT * FROM users WHERE id = ?', [id])
      )
      
      if (result.length === 0) {
        return Option.none()
      }
      
      const userData = result[0]
      return Option.some({
        id: UserId(userData.id), // Safe: we know it's valid from DB
        username: userData.username,
        email: userData.email,
        createdAt: new Date(userData.created_at)
      })
    })
  }

  static findPostsByUserId = (userId: UserId): Effect.Effect<Array<Post>, Error> => {
    return Effect.gen(function* () {
      const results = yield* Effect.tryPromise(() =>
        database.query('SELECT * FROM posts WHERE user_id = ?', [userId])
      )
      
      return results.map(row => ({
        id: PostId(row.id),
        userId: UserId(row.user_id),
        title: row.title,
        content: row.content,
        createdAt: new Date(row.created_at)
      }))
    })
  }
}

class PostRepository {
  static findById = (id: PostId): Effect.Effect<Option.Option<Post>, Error> => {
    return Effect.gen(function* () {
      const result = yield* Effect.tryPromise(() =>
        database.query('SELECT * FROM posts WHERE id = ?', [id])
      )
      
      if (result.length === 0) {
        return Option.none()
      }
      
      const postData = result[0]
      return Option.some({
        id: PostId(postData.id),
        userId: UserId(postData.user_id),
        title: postData.title,
        content: postData.content,
        createdAt: new Date(postData.created_at)
      })
    })
  }

  static findCommentsByPostId = (postId: PostId): Effect.Effect<Array<Comment>, Error> => {
    return Effect.gen(function* () {
      const results = yield* Effect.tryPromise(() =>
        database.query('SELECT * FROM comments WHERE post_id = ?', [postId])
      )
      
      return results.map(row => ({
        id: CommentId(row.id),
        postId: PostId(row.post_id),
        userId: UserId(row.user_id),
        content: row.content,
        createdAt: new Date(row.created_at)
      }))
    })
  }
}

// Usage with compile-time safety
const program = Effect.gen(function* () {
  const userId = UserId(123)
  const postId = PostId(456)
  
  const user = yield* UserRepository.findById(userId)
  const post = yield* PostRepository.findById(postId)
  const comments = yield* PostRepository.findCommentsByPostId(postId)
  
  // Type safety prevents mistakes
  // const badComments = yield* PostRepository.findCommentsByPostId(userId) // ❌ Compile error
  // const badPosts = yield* UserRepository.findPostsByUserId(postId) // ❌ Compile error
  
  return { user, post, comments }
})

// Fake database interface for example
const database = {
  query: (sql: string, params: any[]) => Promise.resolve([])
}
```

### Example 3: API Design with Input Validation

```typescript
import { Brand, Effect, Schema, Option } from "effect"

// API input validation brands
type Email = string & Brand.Brand<"Email">
type Password = string & Brand.Brand<"Password">
type Username = string & Brand.Brand<"Username">
type Age = number & Brand.Brand<"Age">

// Validation constructors
const Email = Brand.refined<Email>(
  (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  (email) => Brand.error(`Invalid email format: ${email}`)
)

const Password = Brand.refined<Password>(
  (password) => password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password),
  (password) => Brand.error(`Password must be at least 8 characters with uppercase and number`)
)

const Username = Brand.refined<Username>(
  (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username),
  (username) => Brand.error(`Username must be 3-20 characters, alphanumeric and underscore only`)
)

const Age = Brand.refined<Age>(
  (age) => Number.isInteger(age) && age >= 13 && age <= 120,
  (age) => Brand.error(`Age must be between 13 and 120`)
)

// API request/response types
interface RegisterRequest {
  email: Email
  password: Password
  username: Username
  age: Age
}

interface LoginRequest {
  email: Email
  password: Password
}

interface UserProfile {
  id: string
  email: Email
  username: Username
  age: Age
  createdAt: Date
}

// API validation helpers
const validateRegisterRequest = (
  raw: unknown
): Effect.Effect<RegisterRequest, Brand.Brand.BrandErrors> => {
  return Effect.gen(function* () {
    // In real app, you'd use Schema.decodeUnknown
    const data = raw as any
    
    const email = yield* Effect.fromEither(Email.either(data.email))
    const password = yield* Effect.fromEither(Password.either(data.password))
    const username = yield* Effect.fromEither(Username.either(data.username))
    const age = yield* Effect.fromEither(Age.either(data.age))
    
    return {
      email,
      password,
      username,
      age
    }
  })
}

const validateLoginRequest = (
  raw: unknown
): Effect.Effect<LoginRequest, Brand.Brand.BrandErrors> => {
  return Effect.gen(function* () {
    const data = raw as any
    
    const email = yield* Effect.fromEither(Email.either(data.email))
    const password = yield* Effect.fromEither(Password.either(data.password))
    
    return { email, password }
  })
}

// API endpoints with branded validation
class UserAPI {
  static register = (
    rawRequest: unknown
  ): Effect.Effect<UserProfile, Brand.Brand.BrandErrors | Error> => {
    return Effect.gen(function* () {
      const request = yield* validateRegisterRequest(rawRequest)
      
      // Business logic with validated inputs
      const hashedPassword = yield* Effect.sync(() => hashPassword(request.password))
      
      const user = yield* Effect.tryPromise(() => 
        createUser({
          email: request.email,
          password: hashedPassword,
          username: request.username,
          age: request.age
        })
      )
      
      return {
        id: user.id,
        email: request.email,
        username: request.username,
        age: request.age,
        createdAt: user.createdAt
      }
    })
  }

  static login = (
    rawRequest: unknown
  ): Effect.Effect<{ token: string; user: UserProfile }, Brand.Brand.BrandErrors | Error> => {
    return Effect.gen(function* () {
      const request = yield* validateLoginRequest(rawRequest)
      
      const user = yield* Effect.tryPromise(() => 
        findUserByEmail(request.email)
      )
      
      const isValidPassword = yield* Effect.sync(() => 
        verifyPassword(request.password, user.hashedPassword)
      )
      
      if (!isValidPassword) {
        yield* Effect.fail(new Error("Invalid credentials"))
      }
      
      const token = yield* Effect.sync(() => generateToken(user.id))
      
      return {
        token,
        user: {
          id: user.id,
          email: Email(user.email), // Safe: from database
          username: Username(user.username), // Safe: from database
          age: Age(user.age), // Safe: from database
          createdAt: user.createdAt
        }
      }
    })
  }
}

// Usage with error handling
const handleRegister = (requestBody: unknown) => {
  return UserAPI.register(requestBody).pipe(
    Effect.catchTag("BrandErrors", (errors) => {
      return Effect.succeed({
        status: 400,
        error: "Validation failed",
        details: errors.map(err => err.message)
      })
    }),
    Effect.catchAll((error) => {
      return Effect.succeed({
        status: 500,
        error: "Internal server error"
      })
    })
  )
}

// Helper functions for example
const hashPassword = (password: string): string => `hashed_${password}`
const verifyPassword = (password: string, hash: string): boolean => hash === `hashed_${password}`
const generateToken = (userId: string): string => `token_${userId}`
const createUser = (data: any) => Promise.resolve({ id: "123", createdAt: new Date(), ...data })
const findUserByEmail = (email: string) => Promise.resolve({ 
  id: "123", 
  email, 
  username: "testuser", 
  age: 25, 
  hashedPassword: "hashed_password123",
  createdAt: new Date() 
})
```

## Advanced Features Deep Dive

### Feature 1: Combining Brands with `Brand.all`

When you need multiple validations on the same value, use `Brand.all` to combine multiple brand constructors:

#### Basic Brand Combination Usage

```typescript
import { Brand } from "effect"

// Individual brand validations
type Int = number & Brand.Brand<"Int">
const Int = Brand.refined<Int>(
  (n) => Number.isInteger(n),
  (n) => Brand.error(`Expected integer, got: ${n}`)
)

type Positive = number & Brand.Brand<"Positive">
const Positive = Brand.refined<Positive>(
  (n) => n > 0,
  (n) => Brand.error(`Expected positive number, got: ${n}`)
)

type Range = number & Brand.Brand<"Range">
const Range = Brand.refined<Range>(
  (n) => n >= 1 && n <= 100,
  (n) => Brand.error(`Expected number between 1-100, got: ${n}`)
)

// Combine multiple validations
const PositiveInt = Brand.all(Int, Positive)
const ValidScore = Brand.all(Int, Positive, Range)

// Usage
const score = ValidScore(85) // ✅ Valid: integer, positive, in range
// const invalidScore = ValidScore(150) // ❌ Fails range validation
// const invalidScore2 = ValidScore(-5) // ❌ Fails positive validation
// const invalidScore3 = ValidScore(3.14) // ❌ Fails integer validation
```

#### Real-World Brand Combination Example

```typescript
import { Brand, Effect } from "effect"

// Individual validations for financial amounts
type Decimal = number & Brand.Brand<"Decimal">
const Decimal = Brand.refined<Decimal>(
  (n) => Number.isFinite(n) && n.toString().split('.')[1]?.length <= 2,
  (n) => Brand.error(`Expected decimal with max 2 places, got: ${n}`)
)

type NonNegative = number & Brand.Brand<"NonNegative">
const NonNegative = Brand.refined<NonNegative>(
  (n) => n >= 0,
  (n) => Brand.error(`Expected non-negative number, got: ${n}`)
)

type MaxAmount = number & Brand.Brand<"MaxAmount">
const MaxAmount = Brand.refined<MaxAmount>(
  (n) => n <= 1000000,
  (n) => Brand.error(`Amount exceeds maximum of $1,000,000, got: ${n}`)
)

// Combined financial amount validation
const Money = Brand.all(Decimal, NonNegative, MaxAmount)

// Transaction processing with validated amounts
interface Transaction {
  id: string
  amount: ReturnType<typeof Money.FromConstructor>
  fromAccount: string
  toAccount: string
}

const processTransfer = (
  amount: number,
  fromAccount: string,
  toAccount: string
): Effect.Effect<Transaction, Brand.Brand.BrandErrors> => {
  return Effect.gen(function* () {
    const validAmount = yield* Effect.fromEither(Money.either(amount))
    
    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      amount: validAmount,
      fromAccount,
      toAccount
    }
    
    // Process the transaction with validated amount
    console.log(`Processing transfer of $${validAmount} from ${fromAccount} to ${toAccount}`)
    
    return transaction
  })
}

// Usage
const program = Effect.gen(function* () {
  const tx1 = yield* processTransfer(99.99, "acc1", "acc2") // ✅ Valid
  const tx2 = yield* processTransfer(1000.00, "acc2", "acc3") // ✅ Valid
  
  // These would fail validation:
  // yield* processTransfer(99.999, "acc1", "acc2") // ❌ Too many decimal places
  // yield* processTransfer(-50, "acc1", "acc2") // ❌ Negative
  // yield* processTransfer(2000000, "acc1", "acc2") // ❌ Exceeds maximum
  
  return [tx1, tx2]
})
```

### Feature 2: Custom Validation Functions

You can create sophisticated validation using custom functions that return `Option<BrandErrors>`:

#### Advanced Custom Validation

```typescript
import { Brand, Option, Effect } from "effect"

// Complex validation for business rules
type ProductCode = string & Brand.Brand<"ProductCode">

const ProductCode = Brand.refined<ProductCode>(
  (code) => {
    const errors: Brand.Brand.BrandErrors = []
    
    // Check format: XXX-YYYY-ZZ
    if (!/^[A-Z]{3}-\d{4}-[A-Z]{2}$/.test(code)) {
      errors.push({
        message: "Product code must follow format: XXX-YYYY-ZZ (e.g., ABC-1234-DE)",
        meta: { pattern: "XXX-YYYY-ZZ", received: code }
      })
    }
    
    // Check category prefix
    const category = code.split('-')[0]
    const validCategories = ['ELC', 'CLO', 'BOO', 'TOY', 'HOM']
    if (!validCategories.includes(category)) {
      errors.push({
        message: `Invalid product category: ${category}`,
        meta: { validCategories, received: category }
      })
    }
    
    // Check year
    const year = parseInt(code.split('-')[1])
    const currentYear = new Date().getFullYear()
    if (year < 2020 || year > currentYear) {
      errors.push({
        message: `Product year must be between 2020 and ${currentYear}`,
        meta: { minYear: 2020, maxYear: currentYear, received: year }
      })
    }
    
    return errors.length > 0 ? Option.some(errors) : Option.none()
  }
)

// Usage with detailed error reporting
const validateProductCode = (code: string): Effect.Effect<ProductCode, string> => {
  return Effect.gen(function* () {
    const result = ProductCode.either(code)
    
    if (result._tag === "Left") {
      const errorMessages = result.left.map(err => err.message).join("; ")
      yield* Effect.fail(`Product code validation failed: ${errorMessages}`)
    }
    
    return result.right
  })
}

// Batch validation example
const validateProductCodes = (
  codes: Array<string>
): Effect.Effect<Array<ProductCode>, Array<string>> => {
  return Effect.gen(function* () {
    const results = codes.map(code => ProductCode.either(code))
    const errors: Array<string> = []
    const validCodes: Array<ProductCode> = []
    
    results.forEach((result, index) => {
      if (result._tag === "Left") {
        const errorMessages = result.left.map(err => err.message).join("; ")
        errors.push(`Code ${index + 1} (${codes[index]}): ${errorMessages}`)
      } else {
        validCodes.push(result.right)
      }
    })
    
    if (errors.length > 0) {
      yield* Effect.fail(errors)
    }
    
    return validCodes
  })
}
```

### Feature 3: Extracting Unbranded Values

Use `Brand.unbranded` to safely extract the underlying value when needed:

```typescript
import { Brand } from "effect"

type UserId = number & Brand.Brand<"UserId">
const UserId = Brand.refined<UserId>(
  (id) => Number.isInteger(id) && id > 0,
  (id) => Brand.error(`Invalid user ID: ${id}`)
)

// Working with branded values
const userId = UserId(123)

// Extract unbranded value for operations that need the raw type
const rawId: number = Brand.unbranded(userId)

// Use in APIs that expect raw types
const sqlQuery = `SELECT * FROM users WHERE id = ${rawId}`
const jsonPayload = JSON.stringify({ userId: rawId })

// Preserve type safety in business logic
const getUserProfile = (id: UserId): UserProfile => {
  const rawId = Brand.unbranded(id)
  // Use rawId for database operations while maintaining type safety
  return queryDatabase(rawId)
}

// Helper for database operations
const queryDatabase = (id: number): UserProfile => {
  // Implementation
  return {} as UserProfile
}

interface UserProfile {
  id: number
  name: string
}
```

## Practical Patterns & Best Practices

### Pattern 1: Brand Factory Pattern

Create reusable brand factories for common validation patterns:

```typescript
import { Brand } from "effect"

// Factory pattern for common ID validations
const createIdBrand = <T extends string>(
  brandName: T
) => {
  type BrandedId = number & Brand.Brand<T>
  
  return Brand.refined<BrandedId>(
    (id) => Number.isInteger(id) && id > 0,
    (id) => Brand.error(`Invalid ${brandName.toLowerCase()}: ${id}`)
  )
}

// Factory for string-based codes
const createCodeBrand = <T extends string>(
  brandName: T,
  pattern: RegExp,
  description: string
) => {
  type BrandedCode = string & Brand.Brand<T>
  
  return Brand.refined<BrandedCode>(
    (code) => pattern.test(code),
    (code) => Brand.error(`Invalid ${brandName.toLowerCase()}: ${code}. Expected ${description}`)
  )
}

// Factory for numeric ranges
const createRangeBrand = <T extends string>(
  brandName: T,
  min: number,
  max: number
) => {
  type BrandedRange = number & Brand.Brand<T>
  
  return Brand.refined<BrandedRange>(
    (n) => Number.isInteger(n) && n >= min && n <= max,
    (n) => Brand.error(`${brandName} must be between ${min} and ${max}, got: ${n}`)
  )
}

// Usage
const UserId = createIdBrand("UserId")
const ProductId = createIdBrand("ProductId")
const OrderId = createIdBrand("OrderId")

const ProductCode = createCodeBrand(
  "ProductCode",
  /^[A-Z]{3}-\d{4}$/,
  "format ABC-1234"
)

const Priority = createRangeBrand("Priority", 1, 5)
const Rating = createRangeBrand("Rating", 1, 10)
```

### Pattern 2: Domain Service Integration

Integrate brands into domain services for comprehensive type safety:

```typescript
import { Brand, Effect, Option } from "effect"

// Domain brands
type AccountId = string & Brand.Brand<"AccountId">
type TransactionId = string & Brand.Brand<"TransactionId">
type Amount = number & Brand.Brand<"Amount">

const AccountId = Brand.nominal<AccountId>()
const TransactionId = Brand.nominal<TransactionId>()
const Amount = Brand.refined<Amount>(
  (amount) => amount > 0 && amount <= 10000,
  (amount) => Brand.error(`Amount must be between $0.01 and $10,000, got: $${amount}`)
)

// Domain models
interface Account {
  id: AccountId
  balance: Amount
  isActive: boolean
}

interface Transaction {
  id: TransactionId
  fromAccountId: AccountId
  toAccountId: AccountId
  amount: Amount
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}

// Domain service with branded types
class BankingService {
  private accounts = new Map<AccountId, Account>()
  private transactions = new Map<TransactionId, Transaction>()

  createAccount = (initialBalance: number): Effect.Effect<Account, Brand.Brand.BrandErrors> => {
    return Effect.gen(function* () {
      const validBalance = yield* Effect.fromEither(Amount.either(initialBalance))
      const accountId = AccountId(`acc_${Date.now()}`)
      
      const account: Account = {
        id: accountId,
        balance: validBalance,
        isActive: true
      }
      
      this.accounts.set(accountId, account)
      return account
    })
  }

  transfer = (
    fromAccountId: AccountId,
    toAccountId: AccountId,
    amount: number
  ): Effect.Effect<Transaction, Brand.Brand.BrandErrors | Error> => {
    return Effect.gen(function* () {
      const validAmount = yield* Effect.fromEither(Amount.either(amount))
      
      const fromAccount = this.accounts.get(fromAccountId)
      const toAccount = this.accounts.get(toAccountId)
      
      if (!fromAccount || !toAccount) {
        yield* Effect.fail(new Error("Account not found"))
      }
      
      if (fromAccount.balance < validAmount) {
        yield* Effect.fail(new Error("Insufficient funds"))
      }
      
      const transactionId = TransactionId(`txn_${Date.now()}`)
      const transaction: Transaction = {
        id: transactionId,
        fromAccountId,
        toAccountId,
        amount: validAmount,
        timestamp: new Date(),
        status: 'pending'
      }
      
      // Update balances
      const newFromBalance = yield* Effect.fromEither(
        Amount.either(fromAccount.balance - validAmount)
      )
      const newToBalance = yield* Effect.fromEither(
        Amount.either(toAccount.balance + validAmount)
      )
      
      this.accounts.set(fromAccountId, { ...fromAccount, balance: newFromBalance })
      this.accounts.set(toAccountId, { ...toAccount, balance: newToBalance })
      
      const completedTransaction = { ...transaction, status: 'completed' as const }
      this.transactions.set(transactionId, completedTransaction)
      
      return completedTransaction
    })
  }

  getAccount = (accountId: AccountId): Option.Option<Account> => {
    return Option.fromNullable(this.accounts.get(accountId))
  }

  getAccountBalance = (accountId: AccountId): Option.Option<Amount> => {
    return Option.map(this.getAccount(accountId), account => account.balance)
  }
}

// Usage with type safety
const program = Effect.gen(function* () {
  const bankingService = new BankingService()
  
  // Create accounts
  const account1 = yield* bankingService.createAccount(1000)
  const account2 = yield* bankingService.createAccount(500)
  
  // Transfer money
  const transaction = yield* bankingService.transfer(
    account1.id,
    account2.id,
    250
  )
  
  // Check balances
  const balance1 = bankingService.getAccountBalance(account1.id)
  const balance2 = bankingService.getAccountBalance(account2.id)
  
  console.log(`Transaction ${transaction.id} completed`)
  console.log(`Account 1 balance: $${Option.getOrElse(balance1, () => 0)}`)
  console.log(`Account 2 balance: $${Option.getOrElse(balance2, () => 0)}`)
  
  return transaction
})
```

### Pattern 3: Branded Configuration

Use brands for configuration validation and type safety:

```typescript
import { Brand, Effect, Config } from "effect"

// Configuration brands
type Port = number & Brand.Brand<"Port">
type DatabaseUrl = string & Brand.Brand<"DatabaseUrl">
type ApiKey = string & Brand.Brand<"ApiKey">
type Timeout = number & Brand.Brand<"Timeout">

const Port = Brand.refined<Port>(
  (port) => Number.isInteger(port) && port >= 1 && port <= 65535,
  (port) => Brand.error(`Port must be between 1 and 65535, got: ${port}`)
)

const DatabaseUrl = Brand.refined<DatabaseUrl>(
  (url) => /^(postgresql|mysql|sqlite):\/\/.+/.test(url),
  (url) => Brand.error(`Invalid database URL format: ${url}`)
)

const ApiKey = Brand.refined<ApiKey>(
  (key) => key.length >= 32 && /^[a-zA-Z0-9]+$/.test(key),
  (key) => Brand.error(`API key must be at least 32 alphanumeric characters`)
)

const Timeout = Brand.refined<Timeout>(
  (timeout) => Number.isInteger(timeout) && timeout >= 1000 && timeout <= 60000,
  (timeout) => Brand.error(`Timeout must be between 1000ms and 60000ms, got: ${timeout}ms`)
)

// Application configuration
interface AppConfig {
  server: {
    port: Port
    host: string
  }
  database: {
    url: DatabaseUrl
    connectionTimeout: Timeout
  }
  api: {
    key: ApiKey
    requestTimeout: Timeout
  }
}

// Configuration loader with validation
const loadConfig = (): Effect.Effect<AppConfig, Brand.Brand.BrandErrors | Error> => {
  return Effect.gen(function* () {
    // Load from environment variables
    const serverPort = yield* Effect.fromEither(
      Port.either(Number(process.env.PORT || '3000'))
    )
    
    const databaseUrl = yield* Effect.fromEither(
      DatabaseUrl.either(process.env.DATABASE_URL || '')
    )
    
    const apiKey = yield* Effect.fromEither(
      ApiKey.either(process.env.API_KEY || '')
    )
    
    const connectionTimeout = yield* Effect.fromEither(
      Timeout.either(Number(process.env.DB_TIMEOUT || '5000'))
    )
    
    const requestTimeout = yield* Effect.fromEither(
      Timeout.either(Number(process.env.API_TIMEOUT || '10000'))
    )
    
    return {
      server: {
        port: serverPort,
        host: process.env.HOST || 'localhost'
      },
      database: {
        url: databaseUrl,
        connectionTimeout
      },
      api: {
        key: apiKey,
        requestTimeout
      }
    } satisfies AppConfig
  })
}

// Application setup with validated configuration
const startApplication = (config: AppConfig): Effect.Effect<void, Error> => {
  return Effect.gen(function* () {
    console.log(`Starting server on ${config.server.host}:${config.server.port}`)
    console.log(`Database timeout: ${config.database.connectionTimeout}ms`)
    console.log(`API timeout: ${config.api.requestTimeout}ms`)
    
    // Use branded values safely
    yield* Effect.sync(() => {
      // Server setup with validated port
      const server = createServer(config.server.port)
      
      // Database connection with validated URL and timeout
      const db = connectDatabase(config.database.url, config.database.connectionTimeout)
      
      // API client with validated key and timeout
      const apiClient = createApiClient(config.api.key, config.api.requestTimeout)
    })
  })
}

// Application bootstrap
const program = Effect.gen(function* () {
  const config = yield* loadConfig()
  yield* startApplication(config)
})

// Mock implementations for example
const createServer = (port: Port) => ({ port })
const connectDatabase = (url: DatabaseUrl, timeout: Timeout) => ({ url, timeout })
const createApiClient = (key: ApiKey, timeout: Timeout) => ({ key, timeout })
```

## Integration Examples

### Integration with Schema

Brands integrate seamlessly with Effect Schema for comprehensive validation:

```typescript
import { Brand, Schema, Effect } from "effect"

// Branded types
type Email = string & Brand.Brand<"Email">
type Age = number & Brand.Brand<"Age">
type UserId = string & Brand.Brand<"UserId">

// Brand constructors
const Email = Brand.refined<Email>(
  (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  (email) => Brand.error(`Invalid email: ${email}`)
)

const Age = Brand.refined<Age>(
  (age) => Number.isInteger(age) && age >= 13 && age <= 120,
  (age) => Brand.error(`Age must be between 13 and 120: ${age}`)
)

const UserId = Brand.nominal<UserId>()

// Schema integration
const EmailSchema = Schema.String.pipe(
  Schema.brand(Email)
)

const AgeSchema = Schema.Number.pipe(
  Schema.brand(Age)
)

const UserSchema = Schema.Struct({
  id: Schema.String.pipe(Schema.brand(UserId)),
  email: EmailSchema,
  age: AgeSchema,
  name: Schema.String
})

// API endpoint with schema validation
const createUserEndpoint = (rawData: unknown): Effect.Effect<User, Schema.ParseError> => {
  return Effect.gen(function* () {
    const userData = yield* Schema.decodeUnknown(UserSchema)(rawData)
    
    // userData is now properly typed with brands
    const user: User = {
      id: userData.id,      // UserId
      email: userData.email, // Email
      age: userData.age,     // Age
      name: userData.name
    }
    
    // Save to database, send emails, etc.
    yield* Effect.sync(() => {
      saveUser(user)
      sendWelcomeEmail(user.email)
    })
    
    return user
  })
}

interface User {
  id: UserId
  email: Email
  age: Age
  name: string
}

// Mock functions
const saveUser = (user: User) => console.log("User saved:", user)
const sendWelcomeEmail = (email: Email) => console.log("Welcome email sent to:", email)
```

### Integration with Express.js

Use brands in Express.js applications for request validation:

```typescript
import { Brand, Effect, Either } from "effect"
import express from "express"

// Route parameter brands
type UserId = string & Brand.Brand<"UserId">
type ProductId = string & Brand.Brand<"ProductId">

const UserId = Brand.refined<UserId>(
  (id) => /^user_[0-9]+$/.test(id),
  (id) => Brand.error(`Invalid user ID format: ${id}`)
)

const ProductId = Brand.refined<ProductId>(
  (id) => /^prod_[0-9]+$/.test(id),
  (id) => Brand.error(`Invalid product ID format: ${id}`)
)

// Request validation middleware
const validateUserId = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const result = UserId.either(req.params.userId)
  
  if (Either.isLeft(result)) {
    return res.status(400).json({
      error: "Invalid user ID",
      details: result.left.map(err => err.message)
    })
  }
  
  // Attach validated ID to request
  req.validatedUserId = result.right
  next()
}

const validateProductId = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const result = ProductId.either(req.params.productId)
  
  if (Either.isLeft(result)) {
    return res.status(400).json({
      error: "Invalid product ID",
      details: result.left.map(err => err.message)
    })
  }
  
  req.validatedProductId = result.right
  next()
}

// Extend Express request type
declare global {
  namespace Express {
    interface Request {
      validatedUserId?: UserId
      validatedProductId?: ProductId
    }
  }
}

// Route handlers with type safety
const app = express()

app.get('/users/:userId', validateUserId, (req, res) => {
  // req.validatedUserId is guaranteed to be a valid UserId
  const userId = req.validatedUserId!
  
  // Use in business logic
  const user = getUserById(userId)
  res.json(user)
})

app.get('/users/:userId/products/:productId', validateUserId, validateProductId, (req, res) => {
  const userId = req.validatedUserId!
  const productId = req.validatedProductId!
  
  // Both IDs are validated and branded
  const userProduct = getUserProduct(userId, productId)
  res.json(userProduct)
})

// Business logic functions expect branded types
const getUserById = (id: UserId) => {
  return { id, name: "John Doe", email: "john@example.com" }
}

const getUserProduct = (userId: UserId, productId: ProductId) => {
  return { userId, productId, name: "Product Name", price: 99.99 }
}
```

### Testing Strategies

Comprehensive testing approaches for branded types:

```typescript
import { Brand, Effect, Either, Option } from "effect"
import { describe, it, expect } from "vitest"

// Test subject
type Email = string & Brand.Brand<"Email">
const Email = Brand.refined<Email>(
  (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  (email) => Brand.error(`Invalid email: ${email}`)
)

describe("Email Brand", () => {
  describe("constructor validation", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.email@domain.co.uk",
        "user+tag@example.org"
      ]
      
      validEmails.forEach(email => {
        expect(() => Email(email)).not.toThrow()
        expect(Email.is(email)).toBe(true)
      })
    })
    
    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "not-an-email",
        "@example.com",
        "user@",
        "user@.com",
        ""
      ]
      
      invalidEmails.forEach(email => {
        expect(() => Email(email)).toThrow()
        expect(Email.is(email)).toBe(false)
      })
    })
  })
  
  describe("option construction", () => {
    it("should return Some for valid emails", () => {
      const result = Email.option("user@example.com")
      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrNull(result)).toBe("user@example.com")
    })
    
    it("should return None for invalid emails", () => {
      const result = Email.option("invalid-email")
      expect(Option.isNone(result)).toBe(true)
    })
  })
  
  describe("either construction", () => {
    it("should return Right for valid emails", () => {
      const result = Email.either("user@example.com")
      expect(Either.isRight(result)).toBe(true)
      expect(result.right).toBe("user@example.com")
    })
    
    it("should return Left with error details for invalid emails", () => {
      const result = Email.either("invalid-email")
      expect(Either.isLeft(result)).toBe(true)
      expect(result.left).toHaveLength(1)
      expect(result.left[0].message).toContain("Invalid email")
    })
  })
})

// Property-based testing with brands
describe("Brand property tests", () => {
  type PositiveInt = number & Brand.Brand<"PositiveInt">
  const PositiveInt = Brand.refined<PositiveInt>(
    (n) => Number.isInteger(n) && n > 0,
    (n) => Brand.error(`Expected positive integer: ${n}`)
  )
  
  it("should maintain invariants through operations", () => {
    const validNumbers = [1, 2, 5, 10, 100, 1000]
    
    validNumbers.forEach(num => {
      const branded = PositiveInt(num)
      
      // Branded value should maintain its properties
      expect(branded).toBeGreaterThan(0)
      expect(Number.isInteger(branded)).toBe(true)
      
      // Unbranded should equal original
      expect(Brand.unbranded(branded)).toBe(num)
    })
  })
  
  it("should compose with Effect operations", async () => {
    const program = Effect.gen(function* () {
      const num1 = yield* Effect.fromEither(PositiveInt.either(5))
      const num2 = yield* Effect.fromEither(PositiveInt.either(10))
      
      return num1 + num2
    })
    
    const result = await Effect.runPromise(program)
    expect(result).toBe(15)
  })
})

// Integration testing with branded types
describe("User service integration", () => {
  type UserId = string & Brand.Brand<"UserId">
  const UserId = Brand.nominal<UserId>()
  
  interface User {
    id: UserId
    name: string
    email: Email
  }
  
  class UserService {
    private users = new Map<UserId, User>()
    
    createUser(name: string, email: string): Effect.Effect<User, Brand.Brand.BrandErrors> {
      return Effect.gen(function* () {
        const validEmail = yield* Effect.fromEither(Email.either(email))
        const userId = UserId(`user_${Date.now()}`)
        
        const user: User = { id: userId, name, email: validEmail }
        this.users.set(userId, user)
        
        return user
      })
    }
    
    getUser(id: UserId): Option.Option<User> {
      return Option.fromNullable(this.users.get(id))
    }
  }
  
  it("should create and retrieve users with branded types", async () => {
    const userService = new UserService()
    
    const program = Effect.gen(function* () {
      const user = yield* userService.createUser("John Doe", "john@example.com")
      const retrieved = userService.getUser(user.id)
      
      return { created: user, retrieved }
    })
    
    const result = await Effect.runPromise(program)
    
    expect(Option.isSome(result.retrieved)).toBe(true)
    expect(Option.getOrNull(result.retrieved)).toEqual(result.created)
  })
  
  it("should handle validation errors gracefully", async () => {
    const userService = new UserService()
    
    const program = userService.createUser("John Doe", "invalid-email")
    
    const result = await Effect.runPromiseExit(program)
    expect(result._tag).toBe("Failure")
  })
})
```

## Conclusion

Brand provides **compile-time type safety** and **runtime validation** for creating robust domain models in TypeScript applications.

Key benefits:
- **Type Safety**: Prevents mixing up structurally similar but semantically different types
- **Validation**: Enforces business rules and data constraints at the type level
- **Domain Modeling**: Creates clear, self-documenting APIs that express business concepts
- **Runtime Safety**: Catches invalid data early with meaningful error messages
- **Composability**: Integrates seamlessly with Effect's ecosystem and functional programming patterns

Use Brand when you need to distinguish between values of the same type that have different meanings (nominal typing), validate data according to business rules (refined typing), or create robust APIs that prevent common mistakes through type safety.