# Predicate: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Predicate Solves

When building applications, you constantly need to validate, filter, and test data. Traditional approaches often lead to scattered boolean logic, repeated validation code, and type-unsafe operations:

```typescript
// Traditional approach - scattered boolean logic
function validateUser(user: any) {
  if (typeof user !== 'object' || user === null) return false
  if (typeof user.email !== 'string' || user.email.length === 0) return false
  if (typeof user.age !== 'number' || user.age < 0 || user.age > 150) return false
  return true
}

function filterActiveUsers(users: any[]) {
  return users.filter(user => 
    user.isActive && 
    user.lastLogin && 
    new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
}

function isValidProduct(product: any) {
  return product.price > 0 && 
         product.name.trim().length > 0 && 
         product.category !== 'discontinued'
}
```

This approach leads to:
- **Code Duplication** - Similar validation logic scattered across the codebase
- **Type Safety Issues** - No compile-time guarantees about predicate composition
- **Poor Composability** - Difficult to combine and reuse validation logic
- **Testing Complexity** - Hard to test individual validation pieces in isolation

### The Predicate Solution

Effect's Predicate module provides a composable, type-safe way to build and combine boolean logic:

```typescript
import { Predicate, String, Number } from "effect"

// Type-safe, composable predicates
const isValidEmail = (email: string): boolean => 
  String.isNonEmpty(email) && email.includes('@')

const isValidAge = Number.between(0, 150)

const isValidUser = Predicate.struct({
  email: isValidEmail,
  age: isValidAge
})

const isActiveUser = Predicate.and(
  (user: User) => user.isActive,
  (user: User) => user.lastLogin > Date.now() - 30 * 24 * 60 * 60 * 1000
)
```

### Key Concepts

**Predicate**: A function that takes a value and returns a boolean, with full type safety: `(a: A) => boolean`

**Refinement**: A special predicate that acts as a type guard, narrowing types: `(a: A) => a is B`

**Composition**: Combining predicates using logical operators (and, or, not) to build complex validation logic

## Basic Usage Patterns

### Pattern 1: Type Guards and Basic Predicates

```typescript
import { Predicate } from "effect"

// Built-in type guards
const isStringValue = Predicate.isString
const isNumberValue = Predicate.isNumber
const isNotNull = Predicate.isNotNull

// Custom predicates
const isPositive = (n: number): boolean => n > 0
const isEven = (n: number): boolean => n % 2 === 0
const isNonEmptyString = (s: string): boolean => s.length > 0

// Usage
console.log(isStringValue("hello")) // true
console.log(isNumberValue("hello")) // false
console.log(isPositive(-5)) // false
```

### Pattern 2: Logical Composition

```typescript
import { Predicate, Number } from "effect"

// Combine predicates with logical operators
const isPositiveEven = Predicate.and(
  (n: number) => n > 0,
  (n: number) => n % 2 === 0
)

const isZeroOrPositive = Predicate.or(
  (n: number) => n === 0,
  (n: number) => n > 0
)

const isNotNegative = Predicate.not(Number.lessThan(0))

// Usage
console.log(isPositiveEven(4)) // true
console.log(isPositiveEven(3)) // false
console.log(isZeroOrPositive(0)) // true
console.log(isNotNegative(-1)) // false
```

### Pattern 3: Struct Validation

```typescript
import { Predicate, String, Number } from "effect"

interface User {
  name: string
  age: number
  email: string
}

// Validate entire objects
const isValidUser = Predicate.struct({
  name: String.isNonEmpty,
  age: Number.between(0, 150),
  email: (email: string) => email.includes('@') && email.includes('.')
})

const user1: User = { name: "John", age: 30, email: "john@example.com" }
const user2: User = { name: "", age: 200, email: "invalid" }

console.log(isValidUser(user1)) // true
console.log(isValidUser(user2)) // false
```

## Real-World Examples

### Example 1: E-commerce Product Validation

Building a comprehensive product validation system for an e-commerce platform:

```typescript
import { Predicate, String, Number, pipe } from "effect"

interface Product {
  id: string
  name: string
  price: number
  category: string
  description: string
  inStock: boolean
  rating: number
  tags: string[]
}

// Individual validation predicates
const hasValidId = (product: Product) => 
  String.isNonEmpty(product.id) && product.id.length >= 3

const hasValidName = (product: Product) =>
  String.isNonEmpty(product.name) && product.name.length <= 100

const hasValidPrice = (product: Product) =>
  Number.isFinite(product.price) && product.price > 0

const hasValidRating = (product: Product) =>
  Number.between(0, 5)(product.rating)

const hasValidCategory = (product: Product) =>
  ['electronics', 'clothing', 'books', 'home', 'sports'].includes(product.category)

const hasValidDescription = (product: Product) =>
  String.isNonEmpty(product.description) && product.description.length <= 500

const hasValidTags = (product: Product) =>
  Array.isArray(product.tags) && 
  product.tags.length > 0 && 
  product.tags.every(tag => String.isNonEmpty(tag))

// Compose into comprehensive validation
const isValidProduct = Predicate.and(
  hasValidId,
  Predicate.and(
    hasValidName,
    Predicate.and(
      hasValidPrice,
      Predicate.and(
        hasValidRating,
        Predicate.and(
          hasValidCategory,
          Predicate.and(hasValidDescription, hasValidTags)
        )
      )
    )
  )
)

// Alternative: Using pipe for better readability
const isValidProductPipe = pipe(
  hasValidId,
  Predicate.and(hasValidName),
  Predicate.and(hasValidPrice),
  Predicate.and(hasValidRating),
  Predicate.and(hasValidCategory),
  Predicate.and(hasValidDescription),
  Predicate.and(hasValidTags)
)

// Usage in filtering
const validateProducts = (products: Product[]): Product[] =>
  products.filter(isValidProduct)

// Usage in business logic
const processProduct = (product: Product) => {
  if (!isValidProduct(product)) {
    throw new Error(`Invalid product: ${product.id}`)
  }
  // Process valid product...
}
```

### Example 2: User Access Control System

Creating a flexible access control system using predicate composition:

```typescript
import { Predicate, String } from "effect"

interface User {
  id: string
  role: 'admin' | 'moderator' | 'user'
  permissions: string[]
  isActive: boolean
  lastLogin: number
  department?: string
}

interface Resource {
  type: 'document' | 'dashboard' | 'settings'
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  department?: string
}

// Role-based predicates
const isAdmin = (user: User) => user.role === 'admin'
const isModerator = (user: User) => user.role === 'moderator'
const isActiveUser = (user: User) => user.isActive

// Permission-based predicates
const hasPermission = (permission: string) => (user: User) =>
  user.permissions.includes(permission)

const hasAnyPermission = (permissions: string[]) => (user: User) =>
  permissions.some(permission => user.permissions.includes(permission))

// Time-based predicates
const isRecentlyActive = (user: User) =>
  Date.now() - user.lastLogin < 7 * 24 * 60 * 60 * 1000 // 7 days

// Department-based predicates
const isInDepartment = (department: string) => (user: User) =>
  user.department === department

// Resource access predicates
const canAccessPublic = (_user: User) => true

const canAccessInternal = Predicate.and(
  isActiveUser,
  isRecentlyActive
)

const canAccessConfidential = Predicate.or(
  isAdmin,
  Predicate.and(
    isModerator,
    hasPermission('confidential_access')
  )
)

const canAccessRestricted = Predicate.and(
  isAdmin,
  hasPermission('restricted_access')
)

// Complex access control logic
const canAccessResource = (resource: Resource) => (user: User): boolean => {
  // Department-specific access
  if (resource.department && user.department !== resource.department) {
    return false
  }

  // Level-based access
  switch (resource.level) {
    case 'public':
      return canAccessPublic(user)
    case 'internal':
      return canAccessInternal(user)
    case 'confidential':
      return canAccessConfidential(user)
    case 'restricted':
      return canAccessRestricted(user)
    default:
      return false
  }
}

// Usage examples
const adminUser: User = {
  id: 'admin-1',
  role: 'admin',
  permissions: ['restricted_access', 'confidential_access'],
  isActive: true,
  lastLogin: Date.now() - 1000 * 60 * 60, // 1 hour ago
  department: 'IT'
}

const regularUser: User = {
  id: 'user-1',
  role: 'user',
  permissions: [],
  isActive: true,
  lastLogin: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
  department: 'Sales'
}

const confidentialDoc: Resource = {
  type: 'document',
  level: 'confidential',
  department: 'IT'
}

console.log(canAccessResource(confidentialDoc)(adminUser)) // true
console.log(canAccessResource(confidentialDoc)(regularUser)) // false
```

### Example 3: Form Validation Pipeline

Building a comprehensive form validation system:

```typescript
import { Predicate, String, Array as Arr, pipe } from "effect"

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  age: number
  interests: string[]
  agreedToTerms: boolean
}

// Field-specific validators
const isValidUsername = (username: string): boolean =>
  String.isNonEmpty(username) && 
  username.length >= 3 && 
  username.length <= 20 &&
  /^[a-zA-Z0-9_]+$/.test(username)

const isValidEmail = (email: string): boolean =>
  String.isNonEmpty(email) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const isValidPassword = (password: string): boolean =>
  String.isNonEmpty(password) &&
  password.length >= 8 &&
  /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)

const isValidAge = (age: number): boolean =>
  Number.isInteger(age) && age >= 13 && age <= 120

const hasValidInterests = (interests: string[]): boolean =>
  Array.isArray(interests) &&
  interests.length > 0 &&
  interests.length <= 5 &&
  interests.every(interest => String.isNonEmpty(interest))

// Cross-field validation
const passwordsMatch = (data: FormData): boolean =>
  data.password === data.confirmPassword

const hasAgreedToTerms = (data: FormData): boolean =>
  data.agreedToTerms === true

// Compose individual field validators
const hasValidFields = Predicate.struct({
  username: isValidUsername,
  email: isValidEmail,
  password: isValidPassword,
  age: isValidAge,
  interests: hasValidInterests
})

// Complete form validation
const isValidForm = Predicate.and(
  hasValidFields,
  Predicate.and(passwordsMatch, hasAgreedToTerms)
)

// Validation with detailed feedback
interface ValidationResult {
  isValid: boolean
  errors: string[]
}

const validateFormWithFeedback = (data: FormData): ValidationResult => {
  const errors: string[] = []

  if (!isValidUsername(data.username)) {
    errors.push('Username must be 3-20 characters, alphanumeric and underscores only')
  }

  if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address')
  }

  if (!isValidPassword(data.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number')
  }

  if (!passwordsMatch(data)) {
    errors.push('Passwords do not match')
  }

  if (!isValidAge(data.age)) {
    errors.push('Age must be between 13 and 120')
  }

  if (!hasValidInterests(data.interests)) {
    errors.push('Please select 1-5 interests')
  }

  if (!hasAgreedToTerms(data)) {
    errors.push('You must agree to the terms and conditions')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Usage
const formData: FormData = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  age: 25,
  interests: ['technology', 'music'],
  agreedToTerms: true
}

console.log(isValidForm(formData)) // true
console.log(validateFormWithFeedback(formData)) // { isValid: true, errors: [] }
```

## Advanced Features Deep Dive

### Refinements: Type-Safe Predicates

Refinements are predicates that also act as type guards, allowing TypeScript to narrow types:

#### Basic Refinement Usage

```typescript
import { Predicate } from "effect"

// Define a refinement
const isString = (input: unknown): input is string => 
  typeof input === 'string'

const isPositiveNumber = (input: unknown): input is number =>
  typeof input === 'number' && input > 0

// TypeScript knows the type after refinement
function processValue(input: unknown) {
  if (isString(input)) {
    // TypeScript knows input is string here
    console.log(input.toUpperCase())
  }
  
  if (isPositiveNumber(input)) {
    // TypeScript knows input is number here
    console.log(Math.sqrt(input))
  }
}
```

#### Real-World Refinement Example

```typescript
import { Predicate } from "effect"

// Domain types
interface User {
  id: string
  name: string
  email: string
}

interface AdminUser extends User {
  adminLevel: number
  permissions: string[]
}

interface Premium extends User {
  subscriptionEnd: number
  features: string[]
}

// Refinement predicates
const isUser = (input: unknown): input is User =>
  typeof input === 'object' &&
  input !== null &&
  'id' in input &&
  'name' in input &&
  'email' in input &&
  typeof (input as any).id === 'string' &&
  typeof (input as any).name === 'string' &&
  typeof (input as any).email === 'string'

const isAdminUser = (input: unknown): input is AdminUser =>
  isUser(input) &&
  'adminLevel' in input &&
  'permissions' in input &&
  typeof (input as any).adminLevel === 'number' &&
  Array.isArray((input as any).permissions)

const isPremiumUser = (input: unknown): input is Premium =>
  isUser(input) &&
  'subscriptionEnd' in input &&
  'features' in input &&
  typeof (input as any).subscriptionEnd === 'number' &&
  Array.isArray((input as any).features)

// Usage with type narrowing
function handleUserData(userData: unknown) {
  if (isAdminUser(userData)) {
    // TypeScript knows this is AdminUser
    console.log(`Admin ${userData.name} has ${userData.permissions.length} permissions`)
    return { type: 'admin', data: userData }
  }
  
  if (isPremiumUser(userData)) {
    // TypeScript knows this is Premium
    console.log(`Premium user ${userData.name} has access to ${userData.features.join(', ')}`)
    return { type: 'premium', data: userData }
  }
  
  if (isUser(userData)) {
    // TypeScript knows this is User
    console.log(`Regular user: ${userData.name}`)
    return { type: 'regular', data: userData }
  }
  
  throw new Error('Invalid user data')
}
```

### Advanced Composition: Complex Predicate Logic

#### Predicate Factories

```typescript
import { Predicate, Number, String } from "effect"

// Factory functions for creating predicates
const createRangeValidator = (min: number, max: number) =>
  (value: number): boolean => value >= min && value <= max

const createLengthValidator = (minLength: number, maxLength: number) =>
  (value: string): boolean => value.length >= minLength && value.length <= maxLength

const createPatternValidator = (pattern: RegExp) =>
  (value: string): boolean => pattern.test(value)

// Domain-specific validators
const createProductValidator = (config: {
  priceRange: [number, number]
  nameLength: [number, number]
  requiredCategories: string[]
}) => {
  const isValidPrice = createRangeValidator(...config.priceRange)
  const isValidName = createLengthValidator(...config.nameLength)
  const isValidCategory = (category: string) => 
    config.requiredCategories.includes(category)

  return Predicate.struct({
    price: isValidPrice,
    name: isValidName,
    category: isValidCategory
  })
}

// Usage
const basicProductValidator = createProductValidator({
  priceRange: [0, 1000],
  nameLength: [1, 50],
  requiredCategories: ['electronics', 'books', 'clothing']
})

const premiumProductValidator = createProductValidator({
  priceRange: [100, 10000],
  nameLength: [5, 100],
  requiredCategories: ['luxury', 'premium', 'exclusive']
})
```

#### Conditional Predicate Logic

```typescript
import { Predicate, pipe } from "effect"

// Conditional validation based on other fields
const createConditionalValidator = <T>(
  condition: Predicate.Predicate<T>,
  thenPredicate: Predicate.Predicate<T>,
  elsePredicate: Predicate.Predicate<T>
) => (value: T): boolean => {
  if (condition(value)) {
    return thenPredicate(value)
  }
  return elsePredicate(value)
}

interface OrderItem {
  type: 'physical' | 'digital'
  price: number
  weight?: number
  downloadUrl?: string
  shippingRequired: boolean
}

// Conditional validation based on item type
const isValidOrderItem = createConditionalValidator<OrderItem>(
  (item) => item.type === 'physical',
  // Physical item validation
  Predicate.and(
    (item) => typeof item.weight === 'number' && item.weight > 0,
    (item) => item.shippingRequired === true
  ),
  // Digital item validation
  Predicate.and(
    (item) => typeof item.downloadUrl === 'string' && item.downloadUrl.length > 0,
    (item) => item.shippingRequired === false
  )
)

// More complex conditional logic
interface PaymentData {
  method: 'credit_card' | 'paypal' | 'bank_transfer'
  amount: number
  cardNumber?: string
  expiryDate?: string
  paypalEmail?: string
  bankAccount?: string
  currency: string
}

const isValidPayment = (payment: PaymentData): boolean => {
  const baseValidation = payment.amount > 0 && 
                        ['USD', 'EUR', 'GBP'].includes(payment.currency)
  
  if (!baseValidation) return false

  switch (payment.method) {
    case 'credit_card':
      return !!(payment.cardNumber && 
               payment.expiryDate &&
               /^\d{16}$/.test(payment.cardNumber.replace(/\s/g, '')))
    
    case 'paypal':
      return !!(payment.paypalEmail && 
               payment.paypalEmail.includes('@'))
    
    case 'bank_transfer':
      return !!(payment.bankAccount && 
               payment.bankAccount.length >= 10)
    
    default:
      return false
  }
}
```

## Practical Patterns & Best Practices

### Pattern 1: Predicate Builder Pattern

Create fluent APIs for building complex predicates:

```typescript
import { Predicate } from "effect"

class PredicateBuilder<T> {
  private predicates: Predicate.Predicate<T>[] = []

  static for<T>(): PredicateBuilder<T> {
    return new PredicateBuilder<T>()
  }

  where(predicate: Predicate.Predicate<T>): this {
    this.predicates.push(predicate)
    return this
  }

  and(predicate: Predicate.Predicate<T>): this {
    return this.where(predicate)
  }

  or(otherBuilder: PredicateBuilder<T>): PredicateBuilder<T> {
    const combined = PredicateBuilder.for<T>()
    combined.predicates = [
      this.build(),
      otherBuilder.build()
    ]
    return combined
  }

  not(): PredicateBuilder<T> {
    const negated = PredicateBuilder.for<T>()
    negated.predicates = [Predicate.not(this.build())]
    return negated
  }

  build(): Predicate.Predicate<T> {
    if (this.predicates.length === 0) {
      return () => true
    }
    return this.predicates.reduce((acc, pred) => 
      Predicate.and(acc, pred)
    )
  }
}

// Usage
interface Product {
  name: string
  price: number
  category: string
  inStock: boolean
  rating: number
}

const expensiveElectronics = PredicateBuilder
  .for<Product>()
  .where(p => p.category === 'electronics')
  .and(p => p.price > 500)
  .and(p => p.inStock)
  .build()

const popularItems = PredicateBuilder
  .for<Product>()
  .where(p => p.rating >= 4.5)
  .and(p => p.inStock)
  .build()

const premiumProducts = PredicateBuilder
  .for<Product>()
  .where(expensiveElectronics)
  .or(PredicateBuilder.for<Product>().where(popularItems))
  .build()
```

### Pattern 2: Validation Pipeline

Create reusable validation pipelines for complex data processing:

```typescript
import { Predicate, pipe } from "effect"

interface ValidationStep<T> {
  name: string
  predicate: Predicate.Predicate<T>
  errorMessage: string
}

interface ValidationResult<T> {
  isValid: boolean
  errors: string[]
  data: T
}

class ValidationPipeline<T> {
  private steps: ValidationStep<T>[] = []

  static create<T>(): ValidationPipeline<T> {
    return new ValidationPipeline<T>()
  }

  addStep(
    name: string, 
    predicate: Predicate.Predicate<T>, 
    errorMessage: string
  ): this {
    this.steps.push({ name, predicate, errorMessage })
    return this
  }

  validate(data: T): ValidationResult<T> {
    const errors: string[] = []

    for (const step of this.steps) {
      if (!step.predicate(data)) {
        errors.push(`${step.name}: ${step.errorMessage}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data
    }
  }

  // Fail-fast validation (stops at first error)
  validateFast(data: T): ValidationResult<T> {
    for (const step of this.steps) {
      if (!step.predicate(data)) {
        return {
          isValid: false,
          errors: [`${step.name}: ${step.errorMessage}`],
          data
        }
      }
    }

    return {
      isValid: true,
      errors: [],
      data
    }
  }
}

// Usage example: User registration validation
interface UserRegistration {
  username: string
  email: string
  password: string
  age: number
}

const userRegistrationPipeline = ValidationPipeline
  .create<UserRegistration>()
  .addStep(
    'username',
    (user) => user.username.length >= 3 && user.username.length <= 20,
    'Username must be between 3 and 20 characters'
  )
  .addStep(
    'email',
    (user) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email),
    'Please provide a valid email address'
  )
  .addStep(
    'password',
    (user) => user.password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(user.password),
    'Password must be at least 8 characters with uppercase, lowercase, and number'
  )
  .addStep(
    'age',
    (user) => user.age >= 13 && user.age <= 120,
    'Age must be between 13 and 120'
  )

// Validation in action
const registrationData: UserRegistration = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  age: 25
}

const result = userRegistrationPipeline.validate(registrationData)
console.log(result)
// { isValid: true, errors: [], data: {...} }
```

### Pattern 3: Performance-Optimized Predicates

Optimize predicate performance for high-volume operations:

```typescript
import { Predicate } from "effect"

// Memoized predicates for expensive operations
const createMemoizedPredicate = <T>(
  predicate: Predicate.Predicate<T>,
  keyExtractor: (value: T) => string = (value) => JSON.stringify(value)
): Predicate.Predicate<T> => {
  const cache = new Map<string, boolean>()
  
  return (value: T): boolean => {
    const key = keyExtractor(value)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = predicate(value)
    cache.set(key, result)
    return result
  }
}

// Short-circuit predicates for better performance
const createShortCircuitPredicate = <T>(
  predicates: Predicate.Predicate<T>[],
  operator: 'and' | 'or' = 'and'
): Predicate.Predicate<T> => {
  return (value: T): boolean => {
    if (operator === 'and') {
      // Short-circuit on first false
      return predicates.every(predicate => predicate(value))
    } else {
      // Short-circuit on first true
      return predicates.some(predicate => predicate(value))
    }
  }
}

// Usage with expensive operations
interface ComplexData {
  id: string
  content: string
  metadata: Record<string, any>
}

const isValidComplexData = createMemoizedPredicate<ComplexData>(
  (data) => {
    // Expensive validation logic
    const contentValid = data.content.length > 0 && 
                        data.content.split(' ').length >= 10
    const metadataValid = Object.keys(data.metadata).length > 0
    const idValid = /^[a-z0-9-]+$/.test(data.id)
    
    return contentValid && metadataValid && idValid
  },
  (data) => data.id // Use ID as cache key
)

// Batch validation with performance optimization
const validateBatch = <T>(
  items: T[],
  predicate: Predicate.Predicate<T>
): { valid: T[], invalid: T[] } => {
  const valid: T[] = []
  const invalid: T[] = []
  
  for (const item of items) {
    if (predicate(item)) {
      valid.push(item)
    } else {
      invalid.push(item)
    }
  }
  
  return { valid, invalid }
}
```

## Integration Examples

### Integration with Array Operations

Predicates work seamlessly with Effect's Array module for powerful data filtering:

```typescript
import { Array as Arr, Predicate, pipe } from "effect"

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: number
  verified: boolean
}

const transactions: Transaction[] = [
  { id: '1', amount: 1000, type: 'income', category: 'salary', date: Date.now() - 86400000, verified: true },
  { id: '2', amount: -50, type: 'expense', category: 'food', date: Date.now() - 172800000, verified: true },
  { id: '3', amount: -200, type: 'expense', category: 'utilities', date: Date.now() - 259200000, verified: false },
  { id: '4', amount: 150, type: 'income', category: 'freelance', date: Date.now() - 345600000, verified: true }
]

// Define predicates
const isIncome = (t: Transaction) => t.type === 'income'
const isExpense = (t: Transaction) => t.type === 'expense'
const isVerified = (t: Transaction) => t.verified
const isRecent = (t: Transaction) => Date.now() - t.date < 7 * 24 * 60 * 60 * 1000 // 7 days
const isLargeAmount = (t: Transaction) => Math.abs(t.amount) > 100

// Compose predicates
const isVerifiedIncome = Predicate.and(isIncome, isVerified)
const isRecentExpense = Predicate.and(isExpense, isRecent)
const isSignificantTransaction = Predicate.and(isVerified, isLargeAmount)

// Use with Array operations
const verifiedIncomeTransactions = pipe(
  Arr.filter(transactions, isVerifiedIncome)
)

const recentExpenses = pipe(
  Arr.filter(transactions, isRecentExpense)
)

const significantTransactions = pipe(
  Arr.filter(transactions, isSignificantTransaction),
  Arr.sortBy(t => -Math.abs(t.amount)) // Sort by amount descending
)

// Advanced filtering with multiple predicates
const filterTransactions = (
  transactions: Transaction[],
  filters: {
    type?: 'income' | 'expense'
    verified?: boolean
    minAmount?: number
    categories?: string[]
  }
) => {
  const predicates: Predicate.Predicate<Transaction>[] = []

  if (filters.type) {
    predicates.push(t => t.type === filters.type)
  }

  if (filters.verified !== undefined) {
    predicates.push(t => t.verified === filters.verified)
  }

  if (filters.minAmount !== undefined) {
    predicates.push(t => Math.abs(t.amount) >= filters.minAmount)
  }

  if (filters.categories && filters.categories.length > 0) {
    predicates.push(t => filters.categories!.includes(t.category))
  }

  // Combine all predicates with AND
  const combinedPredicate = predicates.reduce(
    (acc, pred) => Predicate.and(acc, pred),
    () => true as boolean
  )

  return Arr.filter(transactions, combinedPredicate)
}

// Usage
const filteredTransactions = filterTransactions(transactions, {
  type: 'expense',
  verified: true,
  minAmount: 40,
  categories: ['food', 'utilities']
})
```

### Integration with Option and Either

Combine predicates with Effect's Option and Either modules for robust error handling:

```typescript
import { Option, Either, Predicate, pipe } from "effect"

interface User {
  id: string
  email: string
  age: number
  verified: boolean
}

// Validation predicates
const isValidEmail = (email: string): boolean => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const isAdult = (age: number): boolean => age >= 18

const isVerified = (user: User): boolean => user.verified

// Safe validation with Option
const findValidUser = (users: User[], email: string): Option.Option<User> => {
  return pipe(
    Arr.findFirst(users, user => user.email === email),
    Option.filter(user => isValidEmail(user.email)),
    Option.filter(user => isAdult(user.age)),
    Option.filter(isVerified)
  )
}

// Validation with Either for detailed error reporting
type ValidationError = 
  | { type: 'INVALID_EMAIL'; email: string }
  | { type: 'UNDERAGE'; age: number }
  | { type: 'NOT_VERIFIED'; userId: string }

const validateUser = (user: User): Either.Either<User, ValidationError> => {
  if (!isValidEmail(user.email)) {
    return Either.left({ type: 'INVALID_EMAIL', email: user.email })
  }

  if (!isAdult(user.age)) {
    return Either.left({ type: 'UNDERAGE', age: user.age })
  }

  if (!isVerified(user)) {
    return Either.left({ type: 'NOT_VERIFIED', userId: user.id })
  }

  return Either.right(user)
}

// Batch validation with detailed error reporting
const validateUsers = (users: User[]): {
  valid: User[]
  invalid: Array<{ user: User; error: ValidationError }>
} => {
  const valid: User[] = []
  const invalid: Array<{ user: User; error: ValidationError }> = []

  users.forEach(user => {
    const result = validateUser(user)
    if (Either.isRight(result)) {
      valid.push(result.right)
    } else {
      invalid.push({ user, error: result.left })
    }
  })

  return { valid, invalid }
}

// Usage
const users: User[] = [
  { id: '1', email: 'valid@example.com', age: 25, verified: true },
  { id: '2', email: 'invalid-email', age: 30, verified: true },
  { id: '3', email: 'young@example.com', age: 16, verified: true },
  { id: '4', email: 'unverified@example.com', age: 28, verified: false }
]

const validationResult = validateUsers(users)
console.log('Valid users:', validationResult.valid.length)
console.log('Invalid users:', validationResult.invalid.length)
```

### Testing Strategies

Comprehensive testing patterns for predicates:

```typescript
import { Predicate, Array as Arr } from "effect"

// Property-based testing helpers
const generateTestCases = <T>(
  generator: () => T,
  count: number = 100
): T[] => {
  return Array.from({ length: count }, generator)
}

// Test predicate properties
const testPredicateProperties = <T>(
  predicate: Predicate.Predicate<T>,
  testCases: { input: T, expected: boolean, description: string }[]
) => {
  const results = testCases.map(testCase => ({
    ...testCase,
    actual: predicate(testCase.input),
    passed: predicate(testCase.input) === testCase.expected
  }))

  const passed = results.filter(r => r.passed).length
  const total = results.length

  return {
    passed,
    total,
    success: passed === total,
    failures: results.filter(r => !r.passed)
  }
}

// Example: Testing email validation predicate
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const emailTestCases = [
  { input: 'test@example.com', expected: true, description: 'valid email' },
  { input: 'user.name@domain.co.uk', expected: true, description: 'email with subdomain' },
  { input: 'invalid-email', expected: false, description: 'missing @ and domain' },
  { input: '@domain.com', expected: false, description: 'missing local part' },
  { input: 'user@', expected: false, description: 'missing domain' },
  { input: 'user@domain', expected: false, description: 'missing TLD' },
  { input: '', expected: false, description: 'empty string' }
]

// Run tests
const emailTestResults = testPredicateProperties(isValidEmail, emailTestCases)
console.log(`Email validation: ${emailTestResults.passed}/${emailTestResults.total} passed`)

// Testing predicate composition
const testPredicateComposition = () => {
  const isPositive = (n: number) => n > 0
  const isEven = (n: number) => n % 2 === 0
  const isPositiveEven = Predicate.and(isPositive, isEven)

  const testCases = [
    { input: 4, expected: true, description: 'positive even number' },
    { input: 2, expected: true, description: 'positive even number' },
    { input: -4, expected: false, description: 'negative even number' },
    { input: 3, expected: false, description: 'positive odd number' },
    { input: -3, expected: false, description: 'negative odd number' },
    { input: 0, expected: false, description: 'zero' }
  ]

  return testPredicateProperties(isPositiveEven, testCases)
}

const compositionResults = testPredicateComposition()
console.log(`Composition tests: ${compositionResults.passed}/${compositionResults.total} passed`)

// Performance testing
const performanceTest = <T>(
  predicate: Predicate.Predicate<T>,
  testData: T[],
  iterations: number = 1000
) => {
  const start = performance.now()
  
  for (let i = 0; i < iterations; i++) {
    testData.forEach(predicate)
  }
  
  const end = performance.now()
  const totalTime = end - start
  const averageTime = totalTime / (iterations * testData.length)
  
  return {
    totalTime,
    averageTime,
    operations: iterations * testData.length
  }
}

// Example performance test
const performanceTestData = generateTestCases(() => Math.random() * 1000, 1000)
const performanceResults = performanceTest(
  (n: number) => n > 500 && n < 800,
  performanceTestData
)

console.log(`Performance: ${performanceResults.operations} operations in ${performanceResults.totalTime.toFixed(2)}ms`)
console.log(`Average: ${performanceResults.averageTime.toFixed(4)}ms per operation`)
```

## Conclusion

Predicate provides type-safe boolean logic composition, reusable validation patterns, and seamless integration with the Effect ecosystem for building robust applications.

Key benefits:
- **Type Safety**: Full TypeScript support with refinements for type narrowing
- **Composability**: Combine simple predicates into complex validation logic using logical operators
- **Performance**: Optimized predicate evaluation with memoization and short-circuiting support
- **Integration**: Works seamlessly with Array, Option, Either, and other Effect modules
- **Testability**: Easy to unit test individual predicates and complex compositions

Use Effect Predicate when you need robust, type-safe boolean logic that can be composed, tested, and reused across your application. It's particularly valuable for validation, filtering, access control, and any scenario where you need to make boolean decisions about your data.