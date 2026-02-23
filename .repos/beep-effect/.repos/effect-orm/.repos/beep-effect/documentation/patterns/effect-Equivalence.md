# Equivalence: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Equivalence Solves

JavaScript's native equality operators (`===` and `==`) often fall short when dealing with complex data structures or domain-specific equality requirements. Traditional approaches force you to write custom equality functions that are verbose, error-prone, and don't compose well:

```typescript
// Traditional approach - custom equality functions
interface Product {
  id: string
  name: string
  version: number
  metadata: Record<string, unknown>
}

interface User {
  id: string
  email: string
  profile: {
    firstName: string
    lastName: string
    preferences: {
      theme: 'light' | 'dark'
      notifications: boolean
    }
  }
}

// Manual equality checking - verbose and error-prone
function areProductsEqual(a: Product, b: Product): boolean {
  return a.id === b.id && a.name === b.name && a.version === b.version
}

function areUsersEqualByEmail(a: User, b: User): boolean {
  return a.email === b.email
}

function areUsersEqualByName(a: User, b: User): boolean {
  return a.profile.firstName === b.profile.firstName && 
         a.profile.lastName === b.profile.lastName
}

// Inconsistent implementations across codebase
function deduplicateProducts(products: Product[]): Product[] {
  const seen = new Set<string>()
  return products.filter(product => {
    const key = `${product.id}-${product.name}-${product.version}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
```

This approach leads to:
- **Code Duplication** - Similar equality logic scattered throughout the codebase
- **Inconsistent Comparisons** - Different equality rules for the same types
- **Hard to Compose** - Cannot easily combine or reuse equality logic
- **Error-Prone** - Manual implementation of complex equality rules
- **Poor Performance** - Inefficient string-based equality checks

### The Equivalence Solution

Effect's Equivalence module provides a composable, type-safe way to define custom equality relations:

```typescript
import { Equivalence, Array as Arr } from "effect"

// Define reusable, composable equivalences
const productEquivalence = Equivalence.struct({
  id: Equivalence.string,
  name: Equivalence.string,
  version: Equivalence.number
})

const userByEmailEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (user: User) => user.email
)

const userByNameEquivalence = Equivalence.mapInput(
  Equivalence.struct({
    firstName: Equivalence.string,
    lastName: Equivalence.string
  }),
  (user: User) => user.profile
)

// Clean, efficient deduplication
const deduplicateProducts = (products: Product[]): Product[] => {
  const seen: Product[] = []
  return products.filter(product => {
    const isAlreadySeen = seen.some(seenProduct => 
      productEquivalence(product, seenProduct)
    )
    if (!isAlreadySeen) {
      seen.push(product)
    }
    return !isAlreadySeen
  })
}
```

### Key Concepts

**Equivalence<A>**: A type-safe function that determines if two values of type `A` are equivalent, returning `true` if they are considered equal, `false` otherwise.

**Reflexivity**: For any value `a`, `equivalence(a, a)` returns `true`.

**Symmetry**: If `equivalence(a, b)` returns `true`, then `equivalence(b, a)` also returns `true`.

**Transitivity**: If `equivalence(a, b)` and `equivalence(b, c)` both return `true`, then `equivalence(a, c)` also returns `true`.

**Composability**: Equivalences can be combined, mapped, and transformed to create complex equality strategies from simple building blocks.

## Basic Usage Patterns

### Pattern 1: Using Built-in Equivalences

```typescript
import { Equivalence } from "effect"

// Primitive types - use strict equality
const stringEq = Equivalence.string
const numberEq = Equivalence.number
const booleanEq = Equivalence.boolean
const bigintEq = Equivalence.bigint
const symbolEq = Equivalence.symbol

console.log(stringEq("hello", "hello"))    // true
console.log(numberEq(42, 42))              // true
console.log(booleanEq(true, false))        // false

// Date comparison by timestamp
const dateEq = Equivalence.Date
console.log(dateEq(new Date(2024, 0, 1), new Date(2024, 0, 1))) // true
console.log(dateEq(new Date(2024, 0, 1), new Date(2024, 0, 2))) // false
```

### Pattern 2: Creating Custom Equivalences

```typescript
import { Equivalence } from "effect"

interface EmailAddress {
  readonly local: string
  readonly domain: string
}

// Case-insensitive email equivalence
const emailEquivalence = Equivalence.make<EmailAddress>((a, b) => 
  a.local.toLowerCase() === b.local.toLowerCase() &&
  a.domain.toLowerCase() === b.domain.toLowerCase()
)

const email1: EmailAddress = { local: "John.Doe", domain: "Example.COM" }
const email2: EmailAddress = { local: "john.doe", domain: "example.com" }

console.log(emailEquivalence(email1, email2)) // true
```

### Pattern 3: Mapping Input for Domain-Specific Equality

```typescript
import { Equivalence } from "effect"

interface Book {
  readonly isbn: string
  readonly title: string
  readonly author: string
  readonly publishedYear: number
}

// Books are equivalent if they have the same ISBN
const bookEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (book: Book) => book.isbn
)

const book1: Book = {
  isbn: "978-0-123456-78-9",
  title: "The Effect Guide",
  author: "Effect Team",
  publishedYear: 2024
}

const book2: Book = {
  isbn: "978-0-123456-78-9", 
  title: "Effect Handbook", // Different title
  author: "Different Author", // Different author
  publishedYear: 2025 // Different year
}

console.log(bookEquivalence(book1, book2)) // true - same ISBN
```

## Real-World Examples

### Example 1: E-commerce Product Catalog

Managing product variations and deduplication in an e-commerce system:

```typescript
import { Equivalence, Array as Arr } from "effect"

interface ProductVariant {
  readonly id: string
  readonly sku: string
  readonly productId: string
  readonly size: string
  readonly color: string
  readonly price: number
  readonly inStock: boolean
}

interface ProductReview {
  readonly id: string
  readonly productId: string
  readonly userId: string
  readonly rating: number
  readonly comment: string
  readonly createdAt: Date
}

// Different equivalence strategies for different use cases
const variantBySkuEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (variant: ProductVariant) => variant.sku
)

const variantByProductEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (variant: ProductVariant) => variant.productId
)

const variantByAttributesEquivalence = Equivalence.struct({
  productId: Equivalence.string,
  size: Equivalence.string,
  color: Equivalence.string
})

const reviewByUserAndProductEquivalence = Equivalence.struct({
  productId: Equivalence.string,
  userId: Equivalence.string
})

// Helper functions using equivalences
const removeDuplicateVariants = (variants: ProductVariant[]): ProductVariant[] => {
  const seen: ProductVariant[] = []
  return variants.filter(variant => {
    const isDuplicate = seen.some(seenVariant => 
      variantBySkuEquivalence(variant, seenVariant)
    )
    if (!isDuplicate) {
      seen.push(variant)
    }
    return !isDuplicate
  })
}

const groupVariantsByProduct = (variants: ProductVariant[]): Map<string, ProductVariant[]> => {
  const groups = new Map<string, ProductVariant[]>()
  
  for (const variant of variants) {
    const existingGroup = Array.from(groups.entries()).find(([_, groupVariants]) =>
      groupVariants.some(groupVariant => 
        variantByProductEquivalence(variant, groupVariant)
      )
    )
    
    if (existingGroup) {
      existingGroup[1].push(variant)
    } else {
      groups.set(variant.productId, [variant])
    }
  }
  
  return groups
}

const findDuplicateReviews = (reviews: ProductReview[]): ProductReview[][] => {
  const duplicates: ProductReview[][] = []
  const processed = new Set<string>()
  
  for (const review of reviews) {
    if (processed.has(review.id)) continue
    
    const duplicateGroup = reviews.filter(otherReview => 
      reviewByUserAndProductEquivalence(review, otherReview)
    )
    
    if (duplicateGroup.length > 1) {
      duplicates.push(duplicateGroup)
      duplicateGroup.forEach(dup => processed.add(dup.id))
    }
  }
  
  return duplicates
}
```

### Example 2: User Management System

Implementing flexible user identity and deduplication strategies:

```typescript
import { Equivalence } from "effect"

interface UserProfile {
  readonly id: string
  readonly email: string
  readonly username: string
  readonly personalInfo: {
    readonly firstName: string
    readonly lastName: string
    readonly dateOfBirth: Date
    readonly phoneNumber?: string
  }
  readonly preferences: {
    readonly language: string
    readonly timezone: string
    readonly emailNotifications: boolean
  }
  readonly metadata: {
    readonly createdAt: Date
    readonly lastLoginAt?: Date
    readonly loginCount: number
  }
}

// Different identity strategies for different contexts
const userByEmailEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (user: UserProfile) => user.email.toLowerCase()
)

const userByUsernameEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (user: UserProfile) => user.username.toLowerCase()
)

const userByPersonalInfoEquivalence = Equivalence.struct({
  firstName: Equivalence.mapInput(Equivalence.string, (s: string) => s.toLowerCase()),
  lastName: Equivalence.mapInput(Equivalence.string, (s: string) => s.toLowerCase()),
  dateOfBirth: Equivalence.Date
})

const userByFullIdentityEquivalence = Equivalence.combine(
  userByEmailEquivalence,
  Equivalence.combine(
    userByUsernameEquivalence,
    Equivalence.mapInput(
      userByPersonalInfoEquivalence,
      (user: UserProfile) => user.personalInfo
    )
  )
)

// Case-insensitive phone number equivalence (optional field)
const phoneEquivalence = Equivalence.make<string | undefined>((a, b) => {
  if (a === undefined && b === undefined) return true
  if (a === undefined || b === undefined) return false
  
  // Remove all non-digits for comparison
  const cleanA = a.replace(/\D/g, '')
  const cleanB = b.replace(/\D/g, '')
  
  return cleanA === cleanB
})

// User management operations
const detectPotentialDuplicateUsers = (users: UserProfile[]) => {
  const duplicateGroups: { strategy: string; users: UserProfile[] }[] = []
  
  // Check for email duplicates
  const emailGroups = new Map<string, UserProfile[]>()
  users.forEach(user => {
    const email = user.email.toLowerCase()
    if (!emailGroups.has(email)) {
      emailGroups.set(email, [])
    }
    emailGroups.get(email)!.push(user)
  })
  
  emailGroups.forEach(group => {
    if (group.length > 1) {
      duplicateGroups.push({ strategy: 'email', users: group })
    }
  })
  
  // Check for personal info duplicates
  const personalInfoGroups: UserProfile[][] = []
  const processed = new Set<string>()
  
  users.forEach(user => {
    if (processed.has(user.id)) return
    
    const matches = users.filter(otherUser => 
      !processed.has(otherUser.id) && 
      userByPersonalInfoEquivalence(user.personalInfo, otherUser.personalInfo)
    )
    
    if (matches.length > 1) {
      personalInfoGroups.push(matches)
      matches.forEach(match => processed.add(match.id))
    }
  })
  
  personalInfoGroups.forEach(group => {
    duplicateGroups.push({ strategy: 'personal_info', users: group })
  })
  
  return duplicateGroups
}

const mergeUserPreferences = (primaryUser: UserProfile, duplicateUser: UserProfile): UserProfile => {
  // Merge logic preserving primary user's core identity
  return {
    ...primaryUser,
    preferences: {
      ...primaryUser.preferences,
      // Keep more recent preference if they differ
      emailNotifications: duplicateUser.metadata.lastLoginAt && 
        primaryUser.metadata.lastLoginAt &&
        duplicateUser.metadata.lastLoginAt > primaryUser.metadata.lastLoginAt
        ? duplicateUser.preferences.emailNotifications
        : primaryUser.preferences.emailNotifications
    },
    metadata: {
      ...primaryUser.metadata,
      loginCount: primaryUser.metadata.loginCount + duplicateUser.metadata.loginCount,
      lastLoginAt: duplicateUser.metadata.lastLoginAt && 
        primaryUser.metadata.lastLoginAt
        ? duplicateUser.metadata.lastLoginAt > primaryUser.metadata.lastLoginAt
          ? duplicateUser.metadata.lastLoginAt
          : primaryUser.metadata.lastLoginAt
        : duplicateUser.metadata.lastLoginAt || primaryUser.metadata.lastLoginAt
    }
  }
}
```

### Example 3: Data Synchronization Service

Building a robust data synchronization system with conflict resolution:

```typescript
import { Equivalence } from "effect"

interface DataRecord {
  readonly id: string
  readonly version: number
  readonly content: Record<string, unknown>
  readonly metadata: {
    readonly source: string
    readonly timestamp: Date
    readonly checksum: string
  }
}

interface SyncOperation {
  readonly type: 'create' | 'update' | 'delete'
  readonly recordId: string
  readonly data?: DataRecord
  readonly timestamp: Date
}

// Content-based equivalence ignoring metadata
const recordContentEquivalence = Equivalence.mapInput(
  Equivalence.make<Record<string, unknown>>((a, b) => 
    JSON.stringify(a) === JSON.stringify(b)
  ),
  (record: DataRecord) => record.content
)

// Version-aware equivalence
const recordVersionEquivalence = Equivalence.struct({
  id: Equivalence.string,
  version: Equivalence.number
})

// Checksum-based equivalence for integrity
const recordChecksumEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (record: DataRecord) => record.metadata.checksum
)

// Comprehensive record equivalence
const recordFullEquivalence = Equivalence.combine(
  recordVersionEquivalence,
  Equivalence.combine(recordContentEquivalence, recordChecksumEquivalence)
)

// Sync operation equivalence
const syncOperationEquivalence = Equivalence.struct({
  type: Equivalence.string,
  recordId: Equivalence.string,
  timestamp: Equivalence.Date
})

// Sync conflict detection and resolution
const detectSyncConflicts = (
  localRecords: DataRecord[],
  remoteRecords: DataRecord[]
): { conflicts: Array<{ local: DataRecord; remote: DataRecord }>; resolved: DataRecord[] } => {
  const conflicts: Array<{ local: DataRecord; remote: DataRecord }> = []
  const resolved: DataRecord[] = []
  
  const processedRemoteIds = new Set<string>()
  
  // Check for conflicts with local records
  localRecords.forEach(localRecord => {
    const conflictingRemote = remoteRecords.find(remoteRecord => {
      if (processedRemoteIds.has(remoteRecord.id)) return false
      
      // Same ID but different content or version
      return localRecord.id === remoteRecord.id && 
             (!recordVersionEquivalence(localRecord, remoteRecord) || 
              !recordContentEquivalence(localRecord, remoteRecord))
    })
    
    if (conflictingRemote) {
      processedRemoteIds.add(conflictingRemote.id)
      
      // Auto-resolve based on version and timestamp
      if (conflictingRemote.version > localRecord.version) {
        resolved.push(conflictingRemote) // Remote wins
      } else if (localRecord.version > conflictingRemote.version) {
        resolved.push(localRecord) // Local wins
      } else {
        // Same version - check timestamp
        if (conflictingRemote.metadata.timestamp > localRecord.metadata.timestamp) {
          resolved.push(conflictingRemote)
        } else {
          conflicts.push({ local: localRecord, remote: conflictingRemote })
        }
      }
    } else {
      // No conflict, keep local
      resolved.push(localRecord)
    }
  })
  
  // Add non-conflicting remote records
  remoteRecords.forEach(remoteRecord => {
    if (!processedRemoteIds.has(remoteRecord.id) && 
        !localRecords.some(local => local.id === remoteRecord.id)) {
      resolved.push(remoteRecord)
    }
  })
  
  return { conflicts, resolved }
}

const optimizeSyncOperations = (operations: SyncOperation[]): SyncOperation[] => {
  // Remove duplicate operations
  const uniqueOperations: SyncOperation[] = []
  
  operations.forEach(operation => {
    const isDuplicate = uniqueOperations.some(existing => 
      syncOperationEquivalence(operation, existing)
    )
    
    if (!isDuplicate) {
      uniqueOperations.push(operation)
    }
  })
  
  // Merge consecutive operations on the same record
  const optimized: SyncOperation[] = []
  const groupedByRecord = new Map<string, SyncOperation[]>()
  
  uniqueOperations.forEach(op => {
    if (!groupedByRecord.has(op.recordId)) {
      groupedByRecord.set(op.recordId, [])
    }
    groupedByRecord.get(op.recordId)!.push(op)
  })
  
  groupedByRecord.forEach(recordOps => {
    // Sort by timestamp and keep only the latest operation
    const sorted = recordOps.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    )
    optimized.push(sorted[sorted.length - 1])
  })
  
  return optimized
}
```

## Advanced Features Deep Dive

### Feature 1: Combining Multiple Equivalences

The power of Equivalence lies in its composability. You can combine multiple equivalence strategies to create sophisticated comparison logic:

#### Basic Combination Usage

```typescript
import { Equivalence } from "effect"

interface UserAccount {
  readonly id: string
  readonly email: string
  readonly username: string
  readonly isActive: boolean
}

// Combine multiple fields for comprehensive equivalence
const accountEquivalence = Equivalence.combine(
  Equivalence.mapInput(Equivalence.string, (account: UserAccount) => account.email),
  Equivalence.mapInput(Equivalence.string, (account: UserAccount) => account.username)
)

const account1: UserAccount = { id: "1", email: "john@example.com", username: "john", isActive: true }
const account2: UserAccount = { id: "2", email: "john@example.com", username: "john", isActive: false }

console.log(accountEquivalence(account1, account2)) // true - same email AND username
```

#### Advanced Combination: Multiple Strategies

```typescript
import { Equivalence } from "effect"

interface Document {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly tags: readonly string[]
  readonly author: string
  readonly createdAt: Date
  readonly version: number
}

// Different equivalence strategies for different use cases
const documentByContentEquivalence = Equivalence.struct({
  title: Equivalence.string,
  content: Equivalence.string,
  author: Equivalence.string
})

const documentByVersionEquivalence = Equivalence.struct({
  id: Equivalence.string,
  version: Equivalence.number
})

const documentByTagsEquivalence = Equivalence.mapInput(
  Equivalence.make<readonly string[]>((a, b) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((tag, index) => tag === sortedB[index])
  }),
  (doc: Document) => doc.tags
)

// Combine all strategies for comprehensive document equivalence
const documentFullEquivalence = Equivalence.combineMany(
  documentByContentEquivalence,
  [documentByVersionEquivalence, documentByTagsEquivalence]
)

// Alternative: Use combineAll for dynamic equivalence combination
const createDocumentEquivalence = (strategies: Array<Equivalence<Document>>) =>
  Equivalence.combineAll(strategies)
```

### Feature 2: Array and Collection Equivalences

Working with collections requires specialized equivalence strategies:

#### Array Equivalence with Custom Element Comparison

```typescript
import { Equivalence } from "effect"

interface Task {
  readonly id: string
  readonly title: string
  readonly priority: number
}

interface ProjectPlan {
  readonly id: string
  readonly name: string
  readonly tasks: readonly Task[]
  readonly deadlines: readonly Date[]
}

// Task equivalence by business logic (same title and priority)
const taskEquivalence = Equivalence.struct({
  title: Equivalence.string,
  priority: Equivalence.number
})

// Array equivalence for tasks (order matters)
const taskArrayEquivalence = Equivalence.array(taskEquivalence)

// Project plan equivalence focusing on task composition
const projectPlanEquivalence = Equivalence.struct({
  name: Equivalence.string,
  tasks: taskArrayEquivalence,
  deadlines: Equivalence.array(Equivalence.Date)
})

const plan1: ProjectPlan = {
  id: "1",
  name: "Website Redesign",
  tasks: [
    { id: "1", title: "Design Mockups", priority: 1 },
    { id: "2", title: "Implement Frontend", priority: 2 }
  ],
  deadlines: [new Date(2024, 5, 15), new Date(2024, 6, 1)]
}

const plan2: ProjectPlan = {
  id: "2", // Different ID
  name: "Website Redesign",
  tasks: [
    { id: "3", title: "Design Mockups", priority: 1 }, // Different ID, same content
    { id: "4", title: "Implement Frontend", priority: 2 } // Different ID, same content
  ],
  deadlines: [new Date(2024, 5, 15), new Date(2024, 6, 1)]
}

console.log(projectPlanEquivalence(plan1, plan2)) // true - same business content
```

#### Flexible Array Comparison (Order-Independent)

```typescript
import { Equivalence } from "effect"

interface Tag {
  readonly name: string
  readonly color: string
}

// Order-independent tag array equivalence
const tagArrayEquivalenceUnordered = Equivalence.make<readonly Tag[]>((a, b) => {
  if (a.length !== b.length) return false
  
  const tagEquivalence = Equivalence.struct({
    name: Equivalence.string,
    color: Equivalence.string
  })
  
  // Check if every tag in array A has a match in array B
  return a.every(tagA => 
    b.some(tagB => tagEquivalence(tagA, tagB))
  )
})

const tags1: readonly Tag[] = [
  { name: "urgent", color: "red" },
  { name: "frontend", color: "blue" }
]

const tags2: readonly Tag[] = [
  { name: "frontend", color: "blue" }, // Different order
  { name: "urgent", color: "red" }
]

console.log(tagArrayEquivalenceUnordered(tags1, tags2)) // true - same tags, different order
```

### Feature 3: Tuple and Product Equivalences

For working with tuples and paired data structures:

#### Basic Tuple Equivalence

```typescript
import { Equivalence } from "effect"

// Coordinate pair equivalence
type Coordinate = readonly [number, number]

const coordinateEquivalence = Equivalence.tuple(Equivalence.number, Equivalence.number)

const point1: Coordinate = [10, 20]
const point2: Coordinate = [10, 20]
const point3: Coordinate = [15, 25]

console.log(coordinateEquivalence(point1, point2)) // true
console.log(coordinateEquivalence(point1, point3)) // false
```

#### Complex Product Equivalence

```typescript
import { Equivalence } from "effect"

interface UserPreferences {
  readonly theme: 'light' | 'dark'
  readonly language: string
}

interface NotificationSettings {
  readonly email: boolean
  readonly push: boolean
  readonly sms: boolean
}

type UserConfig = readonly [UserPreferences, NotificationSettings]

const userConfigEquivalence = Equivalence.product(
  Equivalence.struct({
    theme: Equivalence.string,
    language: Equivalence.string
  }),
  Equivalence.struct({
    email: Equivalence.boolean,
    push: Equivalence.boolean,
    sms: Equivalence.boolean
  })
)

const config1: UserConfig = [
  { theme: 'dark', language: 'en' },
  { email: true, push: false, sms: true }
]

const config2: UserConfig = [
  { theme: 'dark', language: 'en' },
  { email: true, push: false, sms: true }
]

console.log(userConfigEquivalence(config1, config2)) // true
```

#### Product Many for Variable-Length Tuples

```typescript
import { Equivalence } from "effect"

// Variable-length tuple with first element being special
type VersionTuple = readonly [number, ...number[]]

const versionEquivalence = Equivalence.productMany(
  Equivalence.number, // First element (major version)
  [Equivalence.number] // Rest of elements (minor versions)
)

const version1: VersionTuple = [2, 1, 0]
const version2: VersionTuple = [2, 1, 0, 1] // Has patch version
const version3: VersionTuple = [2, 1] // Missing patch version

// Note: productMany checks first element strictly, then applies array equivalence to rest
console.log(versionEquivalence(version1, version2)) // false - different length in rest
console.log(versionEquivalence(version1, version3)) // false - different length in rest
```

## Practical Patterns & Best Practices

### Pattern 1: Layered Equivalence Strategies

Create hierarchical equivalence systems for different contexts:

```typescript
import { Equivalence } from "effect"

interface Employee {
  readonly id: string
  readonly employeeNumber: string
  readonly personalInfo: {
    readonly firstName: string
    readonly lastName: string
    readonly email: string
    readonly dateOfBirth: Date
  }
  readonly jobInfo: {
    readonly department: string
    readonly position: string
    readonly salary: number
    readonly startDate: Date
  }
  readonly contactInfo: {
    readonly phone?: string
    readonly address: {
      readonly street: string
      readonly city: string
      readonly zipCode: string
      readonly country: string
    }
  }
}

// Layer 1: Identity equivalence (for deduplication)
const employeeIdentityEquivalence = Equivalence.mapInput(
  Equivalence.string,
  (emp: Employee) => emp.employeeNumber
)

// Layer 2: Personal equivalence (for privacy-safe comparisons)
const employeePersonalEquivalence = Equivalence.mapInput(
  Equivalence.struct({
    firstName: Equivalence.mapInput(Equivalence.string, (s: string) => s.toLowerCase()),
    lastName: Equivalence.mapInput(Equivalence.string, (s: string) => s.toLowerCase()),
    dateOfBirth: Equivalence.Date
  }),
  (emp: Employee) => emp.personalInfo
)

// Layer 3: Job equivalence (for role-based comparisons)
const employeeJobEquivalence = Equivalence.mapInput(
  Equivalence.struct({
    department: Equivalence.string,
    position: Equivalence.string
  }),
  (emp: Employee) => emp.jobInfo
)

// Layer 4: Contact equivalence (for communication purposes)
const employeeContactEquivalence = Equivalence.mapInput(
  Equivalence.struct({
    email: Equivalence.mapInput(Equivalence.string, (s: string) => s.toLowerCase()),
    phone: Equivalence.make<string | undefined>((a, b) => {
      if (a === undefined && b === undefined) return true
      if (a === undefined || b === undefined) return false
      return a.replace(/\D/g, '') === b.replace(/\D/g, '')
    })
  }),
  (emp: Employee) => ({
    email: emp.personalInfo.email,
    phone: emp.contactInfo.phone
  })
)

// Composite strategies for different use cases
const EmployeeEquivalence = {
  identity: employeeIdentityEquivalence,
  personal: employeePersonalEquivalence,
  job: employeeJobEquivalence,
  contact: employeeContactEquivalence,
  
  // Combined strategies
  identityAndPersonal: Equivalence.combine(employeeIdentityEquivalence, employeePersonalEquivalence),
  fullComparison: Equivalence.combineMany(employeeIdentityEquivalence, [
    employeePersonalEquivalence,
    employeeJobEquivalence,
    employeeContactEquivalence
  ])
}

// Usage examples
const findEmployeeDuplicates = (employees: Employee[]): Employee[][] => {
  const duplicateGroups: Employee[][] = []
  const processed = new Set<string>()
  
  employees.forEach(employee => {
    if (processed.has(employee.id)) return
    
    const duplicates = employees.filter(other => 
      other.id !== employee.id &&
      !processed.has(other.id) &&
      EmployeeEquivalence.identityAndPersonal(employee, other)
    )
    
    if (duplicates.length > 0) {
      const group = [employee, ...duplicates]
      duplicateGroups.push(group)
      group.forEach(emp => processed.add(emp.id))
    }
  })
  
  return duplicateGroups
}
```

### Pattern 2: Contextual Equivalence Factory

Create equivalence functions that adapt based on context:

```typescript
import { Equivalence } from "effect"

interface Product {
  readonly id: string
  readonly sku: string
  readonly name: string
  readonly brand: string
  readonly category: string
  readonly price: number
  readonly attributes: Record<string, string>
  readonly inventory: {
    readonly available: number
    readonly reserved: number
    readonly warehouse: string
  }
}

type ComparisonContext = 
  | 'catalog'      // For catalog display (ignore inventory)
  | 'inventory'    // For inventory management (include stock levels)
  | 'purchasing'   // For purchase decisions (price-sensitive)
  | 'search'       // For search results (fuzzy matching)

const createProductEquivalence = (context: ComparisonContext): Equivalence<Product> => {
  const baseEquivalence = Equivalence.struct({
    sku: Equivalence.string,
    name: Equivalence.string,
    brand: Equivalence.string,
    category: Equivalence.string
  })
  
  switch (context) {
    case 'catalog':
      return baseEquivalence
      
    case 'inventory':
      return Equivalence.combine(
        baseEquivalence,
        Equivalence.mapInput(
          Equivalence.struct({
            available: Equivalence.number,
            warehouse: Equivalence.string
          }),
          (product: Product) => product.inventory
        )
      )
      
    case 'purchasing':
      return Equivalence.combine(
        baseEquivalence,
        Equivalence.mapInput(Equivalence.number, (product: Product) => product.price)
      )
      
    case 'search':
      return Equivalence.mapInput(
        Equivalence.make<string>((a, b) => {
          // Fuzzy string matching for search
          const normalizeForSearch = (str: string) => 
            str.toLowerCase().replace(/[^a-z0-9]/g, '')
          return normalizeForSearch(a).includes(normalizeForSearch(b)) ||
                 normalizeForSearch(b).includes(normalizeForSearch(a))
        }),
        (product: Product) => `${product.name} ${product.brand}`
      )
  }
}

// Usage with different contexts
const catalogEquivalence = createProductEquivalence('catalog')
const inventoryEquivalence = createProductEquivalence('inventory')
const searchEquivalence = createProductEquivalence('search')

const filterProductsForContext = (
  products: Product[], 
  context: ComparisonContext
): Product[] => {
  const equivalence = createProductEquivalence(context)
  const filtered: Product[] = []
  
  products.forEach(product => {
    const isDuplicate = filtered.some(existing => 
      equivalence(product, existing)
    )
    if (!isDuplicate) {
      filtered.push(product)
    }
  })
  
  return filtered
}
```

### Pattern 3: Performance-Optimized Equivalence

Create efficient equivalence functions for large datasets:

```typescript
import { Equivalence } from "effect"

interface LargeDataRecord {
  readonly id: string
  readonly timestamp: Date
  readonly metadata: Record<string, unknown>
  readonly payload: {
    readonly type: string
    readonly data: unknown
    readonly checksum: string
  }
  readonly tags: readonly string[]
}

// Fast equivalence using checksums and hashes
const optimizedRecordEquivalence = Equivalence.make<LargeDataRecord>((a, b) => {
  // Quick identity check first
  if (a.id === b.id) return true
  
  // Fast checksum comparison before deep comparison
  if (a.payload.checksum !== b.payload.checksum) return false
  
  // Type comparison
  if (a.payload.type !== b.payload.type) return false
  
  // Timestamp comparison (with tolerance for near-equal times)
  const timeDiff = Math.abs(a.timestamp.getTime() - b.timestamp.getTime())
  if (timeDiff > 1000) return false // More than 1 second difference
  
  // Tags comparison (order-independent, optimized)
  if (a.tags.length !== b.tags.length) return false
  const sortedTagsA = [...a.tags].sort()
  const sortedTagsB = [...b.tags].sort()
  for (let i = 0; i < sortedTagsA.length; i++) {
    if (sortedTagsA[i] !== sortedTagsB[i]) return false
  }
  
  return true
})

// Cached equivalence for expensive operations
const createCachedEquivalence = <A>(
  baseEquivalence: Equivalence<A>,
  keyExtractor: (item: A) => string
): Equivalence<A> => {
  const cache = new Map<string, Map<string, boolean>>()
  
  return Equivalence.make<A>((a, b) => {
    const keyA = keyExtractor(a)
    const keyB = keyExtractor(b)
    
    // Check cache first
    const cacheKey = keyA < keyB ? `${keyA}:${keyB}` : `${keyB}:${keyA}`
    if (cache.has(keyA)) {
      const innerCache = cache.get(keyA)!
      if (innerCache.has(keyB)) {
        return innerCache.get(keyB)!
      }
    }
    
    // Compute and cache result
    const result = baseEquivalence(a, b)
    
    if (!cache.has(keyA)) {
      cache.set(keyA, new Map())
    }
    cache.get(keyA)!.set(keyB, result)
    
    if (keyA !== keyB) {
      if (!cache.has(keyB)) {
        cache.set(keyB, new Map())
      }
      cache.get(keyB)!.set(keyA, result)
    }
    
    return result
  })
}

// Batched equivalence for bulk operations
const processBatchWithEquivalence = <A>(
  items: A[],
  equivalence: Equivalence<A>,
  batchSize: number = 1000
): A[] => {
  const result: A[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResult: A[] = []
    
    batch.forEach(item => {
      const isDuplicate = batchResult.some(existing => equivalence(item, existing))
      if (!isDuplicate) {
        batchResult.push(item)
      }
    })
    
    result.push(...batchResult)
  }
  
  return result
}
```

## Integration Examples

### Integration with Set and Map Operations

Using Equivalence with JavaScript's native collections through custom implementations:

```typescript
import { Equivalence } from "effect"

interface CustomerId {
  readonly id: string
  readonly region: string
}

interface Customer {
  readonly customerId: CustomerId
  readonly name: string
  readonly email: string
  readonly preferences: Record<string, unknown>
}

// Custom Set implementation using Equivalence
class EquivalenceSet<A> {
  private items: A[] = []
  
  constructor(private equivalence: Equivalence<A>) {}
  
  add(item: A): this {
    if (!this.has(item)) {
      this.items.push(item)
    }
    return this
  }
  
  has(item: A): boolean {
    return this.items.some(existing => this.equivalence(item, existing))
  }
  
  delete(item: A): boolean {
    const index = this.items.findIndex(existing => this.equivalence(item, existing))
    if (index >= 0) {
      this.items.splice(index, 1)
      return true
    }
    return false
  }
  
  get size(): number {
    return this.items.length
  }
  
  values(): A[] {
    return [...this.items]
  }
  
  clear(): void {
    this.items = []
  }
}

// Customer equivalence by business logic
const customerEquivalence = Equivalence.mapInput(
  Equivalence.struct({
    id: Equivalence.string,
    region: Equivalence.string
  }),
  (customer: Customer) => customer.customerId
)

// Usage example
const customerSet = new EquivalenceSet(customerEquivalence)

const customer1: Customer = {
  customerId: { id: "CUST-001", region: "US" },
  name: "John Doe",
  email: "john@example.com",
  preferences: { theme: "dark" }
}

const customer2: Customer = {
  customerId: { id: "CUST-001", region: "US" },
  name: "John Smith", // Different name
  email: "john.smith@example.com", // Different email
  preferences: { theme: "light" } // Different preferences
}

customerSet.add(customer1)
customerSet.add(customer2) // Won't be added - same customer ID and region

console.log(customerSet.size) // 1
console.log(customerSet.has(customer2)) // true
```

### Integration with Database Operations

Using Equivalence for database entity comparison and caching:

```typescript
import { Equivalence, Effect, Layer, Context } from "effect"

interface DatabaseEntity {
  readonly id: string
  readonly version: number
  readonly data: Record<string, unknown>
  readonly createdAt: Date
  readonly updatedAt: Date
}

interface CacheEntry<T> {
  readonly entity: T
  readonly retrievedAt: Date
}

// Database service interface
interface DatabaseService {
  readonly findById: <T extends DatabaseEntity>(id: string) => Effect.Effect<T | null>
  readonly save: <T extends DatabaseEntity>(entity: T) => Effect.Effect<T>
  readonly delete: (id: string) => Effect.Effect<boolean>
}

const DatabaseService = Context.GenericTag<DatabaseService>('@services/Database')

// Cache service with equivalence-based optimization
interface CacheService {
  readonly get: <T extends DatabaseEntity>(
    key: string,
    equivalence: Equivalence<T>
  ) => Effect.Effect<T | null>
  readonly set: <T extends DatabaseEntity>(
    key: string,
    entity: T,
    ttl?: number
  ) => Effect.Effect<void>
  readonly invalidate: (key: string) => Effect.Effect<void>
}

const CacheService = Context.GenericTag<CacheService>('@services/Cache')

// Entity equivalence strategies
const createEntityEquivalence = <T extends DatabaseEntity>(
  contentEquivalence?: Equivalence<T>
): Equivalence<T> => {
  const baseEquivalence = Equivalence.struct({
    id: Equivalence.string,
    version: Equivalence.number
  })
  
  if (contentEquivalence) {
    return Equivalence.combine(baseEquivalence, contentEquivalence)
  }
  
  return baseEquivalence
}

// Repository pattern with equivalence-based caching
const createRepository = <T extends DatabaseEntity>(
  entityName: string,
  contentEquivalence?: Equivalence<T>
) => {
  const entityEquivalence = createEntityEquivalence(contentEquivalence)
  
  const findById = (id: string) => Effect.gen(function* () {
    const cache = yield* CacheService
    const db = yield* DatabaseService
    
    // Try cache first
    const cached = yield* cache.get(`${entityName}:${id}`, entityEquivalence)
    if (cached) {
      return cached
    }
    
    // Fetch from database
    const entity = yield* db.findById<T>(id)
    if (entity) {
      yield* cache.set(`${entityName}:${id}`, entity)
    }
    
    return entity
  })
  
  const save = (entity: T) => Effect.gen(function* () {
    const cache = yield* CacheService
    const db = yield* DatabaseService
    
    // Check if entity has changed using equivalence
    const cached = yield* cache.get(`${entityName}:${entity.id}`, entityEquivalence)
    if (cached && entityEquivalence(entity, cached)) {
      // No changes, return cached version
      return cached
    }
    
    // Save to database
    const saved = yield* db.save(entity)
    
    // Update cache
    yield* cache.set(`${entityName}:${entity.id}`, saved)
    
    return saved
  })
  
  const delete = (id: string) => Effect.gen(function* () {
    const cache = yield* CacheService
    const db = yield* DatabaseService
    
    const result = yield* db.delete(id)
    if (result) {
      yield* cache.invalidate(`${entityName}:${id}`)
    }
    
    return result
  })
  
  return { findById, save, delete } as const
}

// Usage example with specific entity types
interface UserEntity extends DatabaseEntity {
  readonly data: {
    readonly name: string
    readonly email: string
    readonly preferences: Record<string, unknown>
  }
}

const userContentEquivalence = Equivalence.mapInput(
  Equivalence.struct({
    name: Equivalence.string,
    email: Equivalence.mapInput(Equivalence.string, (s: string) => s.toLowerCase())
  }),
  (user: UserEntity) => user.data
)

const UserRepository = createRepository<UserEntity>('user', userContentEquivalence)

// Example usage in application code
const updateUserExample = (userId: string, newName: string) => Effect.gen(function* () {
  const user = yield* UserRepository.findById(userId)
  if (!user) {
    return null
  }
  
  const updatedUser: UserEntity = {
    ...user,
    data: {
      ...user.data,
      name: newName
    },
    version: user.version + 1,
    updatedAt: new Date()
  }
  
  // Repository will automatically check if anything actually changed
  return yield* UserRepository.save(updatedUser)
})
```

### Integration with Testing Frameworks

Using Equivalence for flexible test assertions:

```typescript
import { Equivalence } from "effect"

// Test assertion helpers using Equivalence
const createTestMatcher = <T>(equivalence: Equivalence<T>) => ({
  toEqual: (actual: T, expected: T): boolean => equivalence(actual, expected),
  
  toEqualOneOf: (actual: T, candidates: T[]): boolean => 
    candidates.some(candidate => equivalence(actual, candidate)),
  
  toContain: (array: T[], item: T): boolean => 
    array.some(element => equivalence(element, item)),
  
  toContainAll: (array: T[], items: T[]): boolean => 
    items.every(item => array.some(element => equivalence(element, item)))
})

// Test data setup
interface TestUser {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly createdAt: Date
}

const testUserEquivalence = Equivalence.struct({
  name: Equivalence.string,
  email: Equivalence.mapInput(Equivalence.string, (s: string) => s.toLowerCase())
})

const userMatcher = createTestMatcher(testUserEquivalence)

// Example test usage (pseudo-code for testing framework integration)
const testUserService = () => {
  const expected: TestUser = {
    id: "test-1",
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date("2024-01-01")
  }
  
  const actual: TestUser = {
    id: "different-id", // Different ID - should be ignored by our equivalence
    name: "John Doe",
    email: "JOHN@EXAMPLE.COM", // Different case - should be normalized
    createdAt: new Date("2024-06-01") // Different date - should be ignored
  }
  
  // This assertion would pass because we only compare name and normalized email
  console.log(userMatcher.toEqual(actual, expected)) // true
  
  const candidates: TestUser[] = [
    { id: "1", name: "Jane Doe", email: "jane@example.com", createdAt: new Date() },
    { id: "2", name: "John Doe", email: "john@example.com", createdAt: new Date() }
  ]
  
  console.log(userMatcher.toEqualOneOf(actual, candidates)) // true
}

// Property-based testing integration
const generateTestData = <T>(
  generator: () => T,
  equivalence: Equivalence<T>,
  count: number = 100
): Array<{ original: T; equivalent: T; different: T }> => {
  const testCases: Array<{ original: T; equivalent: T; different: T }> = []
  
  for (let i = 0; i < count; i++) {
    const original = generator()
    const equivalent = generator() // Should be equivalent by business logic
    const different = generator()  // Should be different by business logic
    
    // Verify our assumptions
    if (equivalence(original, equivalent) && !equivalence(original, different)) {
      testCases.push({ original, equivalent, different })
    }
  }
  
  return testCases
}

// Mock data generator for testing
const generateMockUser = (): TestUser => ({
  id: Math.random().toString(),
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date()
})

const testCases = generateTestData(generateMockUser, testUserEquivalence, 50)
console.log(`Generated ${testCases.length} valid test cases`)
```

## Conclusion

Equivalence provides **composable equality**, **domain-specific comparisons**, and **type-safe operations** for TypeScript applications.

Key benefits:
- **Composability**: Build complex equivalence strategies from simple building blocks
- **Reusability**: Define once, use across your application for consistent behavior
- **Type Safety**: Compile-time guarantees prevent runtime errors in comparison logic
- **Performance**: Optimize equality checks for your specific use cases
- **Maintainability**: Centralized equivalence logic that's easy to understand and modify

Use Equivalence when you need flexible, composable equality comparison that goes beyond JavaScript's native `===` operator, especially for complex data structures, domain-specific business logic, or performance-critical applications requiring custom equality semantics.