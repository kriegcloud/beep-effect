# Struct: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Struct Solves

Working with JavaScript objects in TypeScript often leads to repetitive, error-prone code when you need to manipulate object properties, transform data structures, or perform type-safe operations. Traditional approaches require verbose implementations and lack composability.

```typescript
// Traditional approach - verbose and error-prone
interface User {
  id: string
  name: string
  email: string
  age: number
  isActive: boolean
}

// Manual property picking
function pickUserBasics(user: User): Pick<User, 'id' | 'name'> {
  return {
    id: user.id,
    name: user.name
  }
}

// Manual property omission
function omitSensitiveData(user: User): Omit<User, 'email'> {
  const { email, ...rest } = user
  return rest
}

// Manual property transformation
function transformUser(user: User) {
  return {
    ...user,
    name: user.name.toUpperCase(),
    age: user.age * 2
  }
}

// Manual property access
function getUserName(user: User): string {
  return user.name
}
```

This approach leads to:
- **Boilerplate Code** - Repetitive implementations for common operations
- **Type Safety Issues** - Manual destructuring can miss type checking
- **Poor Composability** - Difficult to chain operations together
- **Maintenance Burden** - Changes require updating multiple utility functions

### The Struct Solution

Effect's Struct module provides a comprehensive set of utilities for type-safe object manipulation, offering composable, reusable functions that eliminate boilerplate while maintaining full type safety.

```typescript
import { Struct } from "effect"

interface User {
  id: string
  name: string
  email: string
  age: number
  isActive: boolean
}

const user: User = {
  id: "123",
  name: "alice",
  email: "alice@example.com",
  age: 25,
  isActive: true
}

// Composable operations with full type safety
const result = Struct.evolve(
  Struct.pick(user, "id", "name"),
  {
    name: (name) => name.toUpperCase()
  }
)
// Type: { readonly id: string; readonly name: string }
// Value: { id: "123", name: "ALICE" }
```

### Key Concepts

**Property Selection**: Extract specific properties with `pick` and `omit` while maintaining type safety

**Property Evolution**: Transform property values using `evolve` with type-safe transformations

**Property Access**: Safely retrieve property values using `get` with proper type inference

**Structural Operations**: Perform operations on object structure like key extraction and comparison

## Basic Usage Patterns

### Pattern 1: Property Selection

```typescript
import { Struct } from "effect"

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  inStock: boolean
}

const product: Product = {
  id: "prod-123",
  name: "Laptop",
  price: 999.99,
  description: "High-performance laptop",
  category: "Electronics",
  inStock: true
}

// Pick specific properties
const productSummary = Struct.pick(product, "id", "name", "price")
// Type: { readonly id: string; readonly name: string; readonly price: number }

// Omit sensitive properties
const publicProduct = Struct.omit(product, "inStock", "description")
// Type: Omit<Product, "inStock" | "description">
```

### Pattern 2: Property Transformation

```typescript
import { Struct } from "effect"

interface RawUser {
  firstName: string
  lastName: string
  email: string
  birthYear: number
}

const rawUser: RawUser = {
  firstName: "john",
  lastName: "doe",
  email: "JOHN.DOE@EXAMPLE.COM",
  birthYear: 1990
}

// Transform multiple properties
const normalizedUser = Struct.evolve(rawUser, {
  firstName: (name) => name.charAt(0).toUpperCase() + name.slice(1),
  lastName: (name) => name.charAt(0).toUpperCase() + name.slice(1),
  email: (email) => email.toLowerCase(),
  birthYear: (year) => new Date().getFullYear() - year // Calculate age
})
// Result: { firstName: "John", lastName: "Doe", email: "john.doe@example.com", birthYear: 34 }
```

### Pattern 3: Property Access and Inspection

```typescript
import { Struct } from "effect"

interface Config {
  database: {
    host: string
    port: number
  }
  api: {
    version: string
    timeout: number
  }
  features: {
    enableCache: boolean
  }
}

const config: Config = {
  database: { host: "localhost", port: 5432 },
  api: { version: "v1", timeout: 5000 },
  features: { enableCache: true }
}

// Get property value
const databaseConfig = Struct.get(config, "database")
// Type: { host: string; port: number }

// Get object keys (string keys only)
const configKeys = Struct.keys(config)
// Type: Array<"database" | "api" | "features">
// Value: ["database", "api", "features"]
```

## Real-World Examples

### Example 1: User Profile Management

User profile systems often need to handle different views of user data - public profiles, admin views, and user settings. Struct provides elegant solutions for these transformations.

```typescript
import { Struct, Effect } from "effect"

interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatar: string
  isVerified: boolean
  createdAt: string
  lastLoginAt: string
  role: "user" | "admin" | "moderator"
  preferences: {
    theme: string
    notifications: boolean
    language: string
  }
}

const fullProfile: UserProfile = {
  id: "user-123",
  username: "alice_dev",
  email: "alice@example.com",
  firstName: "alice",
  lastName: "smith",
  avatar: "https://example.com/avatars/alice.jpg",
  isVerified: true,
  createdAt: "2023-01-15T08:00:00Z",
  lastLoginAt: "2024-01-20T10:30:00Z",
  role: "user",
  preferences: {
    theme: "dark",
    notifications: true,
    language: "en"
  }
}

// Create public profile view - using function-first approach
const createPublicProfile = (profile: UserProfile) =>
  Struct.evolve(
    Struct.pick(profile, "id", "username", "firstName", "lastName", "avatar", "isVerified"),
    {
      firstName: (name) => name.charAt(0).toUpperCase() + name.slice(1),
      lastName: (name) => name.charAt(0).toUpperCase() + name.slice(1)
    }
  )

// Create admin view with additional metadata
const createAdminView = (profile: UserProfile) =>
  Struct.evolve(
    Struct.omit(profile, "preferences"), // Remove personal preferences
    {
      email: (email) => email.toLowerCase(),
      createdAt: (date) => new Date(date).toLocaleDateString(),
      lastLoginAt: (date) => new Date(date).toLocaleDateString()
    }
  )

// Create user settings view
const createUserSettings = (profile: UserProfile) =>
  Struct.evolve(
    Struct.pick(profile, "id", "email", "preferences"),
    {
      email: (email) => email.toLowerCase()
    }
  )

// Business logic using Effect.gen + yield* for sequential operations
const getUserViews = (userId: string) =>
  Effect.gen(function* () {
    const profile = yield* getUserProfile(userId)
    const cacheKey = `user-views-${userId}`
    
    // Check cache first
    const cached = yield* getCachedViews(cacheKey)
    if (cached) {
      return cached
    }
    
    // Create all views
    const publicView = createPublicProfile(profile)
    const adminView = createAdminView(profile)
    const settingsView = createUserSettings(profile)
    
    const views = {
      public: publicView,
      admin: adminView,
      settings: settingsView
    }
    
    // Cache the results
    yield* cacheViews(cacheKey, views)
    
    return views
  }).pipe(
    Effect.catchTag('UserNotFoundError', (error) => 
      Effect.fail(new Error(`User ${userId} not found: ${error.message}`))),
    Effect.withSpan('user.get_views', { attributes: { 'user.id': userId } })
  )

// Mock services
const getUserProfile = (userId: string): Effect.Effect<UserProfile, UserNotFoundError> =>
  Effect.succeed(fullProfile)

const getCachedViews = (key: string): Effect.Effect<any | null, never> =>
  Effect.succeed(null)

const cacheViews = (key: string, views: any): Effect.Effect<void, never> =>
  Effect.sync(() => {})

class UserNotFoundError extends Error {
  readonly _tag = 'UserNotFoundError'
}
```

### Example 2: API Response Transformation

API responses often need transformation for different client needs - mobile apps might need compact data, while web dashboards need comprehensive information.

```typescript
import { Struct, Effect, Array as Arr } from "effect"

interface ProductResponse {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  specifications: Record<string, string>
  inventory: {
    quantity: number
    warehouse: string
    reserved: number
  }
  metadata: {
    createdAt: string
    updatedAt: string
    version: number
  }
}

const products: ProductResponse[] = [
  {
    id: "prod-1",
    name: "wireless headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    currency: "USD",
    images: ["img1.jpg", "img2.jpg", "img3.jpg"],
    specifications: {
      "Battery Life": "30 hours",
      "Connectivity": "Bluetooth 5.0",
      "Weight": "250g"
    },
    inventory: {
      quantity: 50,
      warehouse: "US-WEST",
      reserved: 5
    },
    metadata: {
      createdAt: "2023-01-15T08:00:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
      version: 3
    }
  }
]

// Mobile API - compact response using function-first approach
const createMobileResponse = (product: ProductResponse) =>
  Struct.evolve(
    Struct.pick(product, "id", "name", "price", "currency"),
    {
      name: (name) => name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      price: (price) => Math.round(price * 100) / 100 // Ensure 2 decimal places
    }
  )

// Dashboard API - comprehensive view
const createDashboardResponse = (product: ProductResponse) =>
  Struct.evolve(
    Struct.omit(product, "metadata"), // Remove internal metadata
    {
      name: (name) => name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      images: (images) => images.slice(0, 3), // Limit to 3 images
      inventory: (inv) => ({
        ...inv,
        available: inv.quantity - inv.reserved
      })
    }
  )

// Inventory API - stock-focused view
const createInventoryResponse = (product: ProductResponse) =>
  Struct.evolve(
    Struct.pick(product, "id", "name", "inventory"),
    {
      inventory: (inv) => ({
        available: inv.quantity - inv.reserved,
        total: inv.quantity,
        warehouse: inv.warehouse,
        status: inv.quantity - inv.reserved > 10 ? "in-stock" : "low-stock"
      })
    }
  )

// API endpoint implementations using Effect.gen for business logic
const getMobileProducts = () =>
  Effect.gen(function* () {
    const allProducts = yield* getProducts()
    const cacheKey = 'mobile-products'
    
    // Check cache first
    const cached = yield* getFromCache(cacheKey)
    if (cached) {
      return cached
    }
    
    // Transform products for mobile
    const mobileProducts = Arr.map(allProducts, createMobileResponse)
    
    // Cache the result
    yield* setCache(cacheKey, mobileProducts, 300) // 5 minute cache
    
    return mobileProducts
  }).pipe(
    Effect.withSpan('products.get_mobile'),
    Effect.mapError(error => new Error(`Failed to get mobile products: ${error}`))
  )

const getDashboardProducts = () =>
  Effect.gen(function* () {
    const allProducts = yield* getProducts()
    const user = yield* getCurrentUser()
    
    // Apply role-based filtering
    const filtered = user.role === 'admin' 
      ? allProducts 
      : allProducts.filter(p => p.inventory.quantity > 0)
    
    return Arr.map(filtered, createDashboardResponse)
  }).pipe(
    Effect.withSpan('products.get_dashboard'),
    Effect.mapError(error => new Error(`Failed to get dashboard products: ${error}`))
  )

const getInventoryReport = () =>
  Effect.gen(function* () {
    const allProducts = yield* getProducts()
    const currentTime = yield* getCurrentTime()
    
    const inventoryData = Arr.map(allProducts, createInventoryResponse)
    
    // Add report metadata
    const report = {
      data: inventoryData,
      metadata: {
        generatedAt: currentTime,
        totalProducts: inventoryData.length,
        lowStockCount: inventoryData.filter(p => p.inventory.status === "low-stock").length
      }
    }
    
    return report
  }).pipe(
    Effect.withSpan('products.get_inventory_report'),
    Effect.mapError(error => new Error(`Failed to generate inventory report: ${error}`))
  )

// Mock services
const getProducts = (): Effect.Effect<ProductResponse[], Error> =>
  Effect.succeed(products)

const getFromCache = (key: string): Effect.Effect<any | null, never> =>
  Effect.succeed(null)

const setCache = (key: string, value: any, ttl: number): Effect.Effect<void, never> =>
  Effect.sync(() => {})

const getCurrentUser = (): Effect.Effect<{ role: string }, never> =>
  Effect.succeed({ role: 'user' })

const getCurrentTime = (): Effect.Effect<string, never> =>
  Effect.sync(() => new Date().toISOString())
```

### Example 3: Configuration Management

Configuration objects often need validation, normalization, and environment-specific transformations.

```typescript
import { Struct, Effect, Option } from "effect"

interface RawConfig {
  database_url?: string
  api_port?: string
  enable_logging?: string
  cache_ttl?: string
  feature_flags?: string
  cors_origins?: string
}

interface ProcessedConfig {
  database: {
    url: string
    maxConnections: number
  }
  server: {
    port: number
    cors: {
      origins: string[]
      credentials: boolean
    }
  }
  logging: {
    enabled: boolean
    level: string
  }
  cache: {
    ttl: number
    enabled: boolean
  }
  features: Record<string, boolean>
}

const rawConfig: RawConfig = {
  database_url: "postgresql://localhost:5432/mydb",
  api_port: "3000",
  enable_logging: "true",
  cache_ttl: "3600",
  feature_flags: "feature1:true,feature2:false,feature3:true",
  cors_origins: "http://localhost:3000,https://myapp.com"
}

// Helper functions for parsing
const parseBoolean = (value: string | undefined): boolean =>
  value?.toLowerCase() === "true"

const parseInt = (value: string | undefined, defaultValue: number): number => {
  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

const parseFeatureFlags = (flags: string | undefined): Record<string, boolean> => {
  if (!flags) return {}
  return flags.split(',').reduce((acc, flag) => {
    const [key, value] = flag.split(':')
    if (key && value) {
      acc[key.trim()] = value.trim() === 'true'
    }
    return acc
  }, {} as Record<string, boolean>)
}

const parseOrigins = (origins: string | undefined): string[] =>
  origins?.split(',').map(origin => origin.trim()) || []

// Configuration processing pipeline using Effect.gen for business logic
const processConfig = (raw: RawConfig): Effect.Effect<ProcessedConfig, Error> =>
  Effect.gen(function* () {
    // Validate required fields
    if (!raw.database_url) {
      yield* Effect.fail(new Error("DATABASE_URL is required"))
    }

    // Log configuration processing
    yield* Effect.sync(() => console.log("Processing configuration..."))

    // Transform raw config into structured config
    const processed: ProcessedConfig = {
      database: {
        url: raw.database_url!,
        maxConnections: 10
      },
      server: {
        port: parseInt(raw.api_port, 3000),
        cors: {
          origins: parseOrigins(raw.cors_origins),
          credentials: true
        }
      },
      logging: {
        enabled: parseBoolean(raw.enable_logging),
        level: parseBoolean(raw.enable_logging) ? "info" : "error"
      },
      cache: {
        ttl: parseInt(raw.cache_ttl, 3600),
        enabled: parseInt(raw.cache_ttl, 0) > 0
      },
      features: parseFeatureFlags(raw.feature_flags)
    }

    // Validate processed config
    yield* validateConfig(processed)

    return processed
  }).pipe(
    Effect.withSpan('config.process'),
    Effect.mapError(error => new Error(`Configuration processing failed: ${error.message}`))
  )

// Environment-specific configuration transformations using function-first approach
const createDevelopmentConfig = (config: ProcessedConfig) =>
  Struct.evolve(config, {
    logging: (logging) => ({ ...logging, level: "debug" }),
    database: (db) => ({ ...db, maxConnections: 5 }),
    server: (server) => ({
      ...server,
      cors: { ...server.cors, origins: ["http://localhost:3000"] }
    })
  })

const createProductionConfig = (config: ProcessedConfig) =>
  Struct.evolve(config, {
    logging: (logging) => ({ ...logging, level: "warn" }),
    database: (db) => ({ ...db, maxConnections: 20 }),
    cache: (cache) => ({ ...cache, ttl: cache.ttl * 2 }) // Double cache TTL in production
  })

const createTestConfig = (config: ProcessedConfig) =>
  Struct.evolve(config, {
    database: (db) => ({ ...db, url: "postgresql://localhost:5432/test_db" }),
    cache: () => ({ ttl: 0, enabled: false }),
    features: () => ({}) // Disable all features in tests
  })

// Configuration service with business logic
const loadConfig = (environment: "development" | "production" | "test") =>
  Effect.gen(function* () {
    // Load base configuration
    const baseConfig = yield* processConfig(rawConfig)
    
    // Apply environment-specific transformations
    const envConfig = yield* Effect.sync(() => {
      switch (environment) {
        case "development":
          return createDevelopmentConfig(baseConfig)
        case "production":
          return createProductionConfig(baseConfig)
        case "test":
          return createTestConfig(baseConfig)
        default:
          return baseConfig
      }
    })
    
    // Cache the configuration
    const cacheKey = `config-${environment}`
    yield* cacheConfig(cacheKey, envConfig)
    
    // Log successful configuration load
    yield* Effect.sync(() => 
      console.log(`Configuration loaded for ${environment} environment`)
    )
    
    return envConfig
  }).pipe(
    Effect.withSpan('config.load', { attributes: { environment } }),
    Effect.mapError(error => new Error(`Failed to load ${environment} config: ${error.message}`))
  )

// Helper services
const validateConfig = (config: ProcessedConfig): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    if (config.server.port < 1 || config.server.port > 65535) {
      yield* Effect.fail(new Error("Invalid port number"))
    }
    
    if (config.cache.ttl < 0) {
      yield* Effect.fail(new Error("Cache TTL cannot be negative"))
    }
    
    if (!config.database.url) {
      yield* Effect.fail(new Error("Database URL is required"))
    }
  })

const cacheConfig = (key: string, config: ProcessedConfig): Effect.Effect<void, never> =>
  Effect.sync(() => {
    // Mock caching implementation
    console.log(`Caching config with key: ${key}`)
  })
```

## Advanced Features Deep Dive

### Property Evolution: Complex Transformations

The `evolve` function enables sophisticated property transformations while maintaining type safety and composability.

#### Basic Evolution Usage

```typescript
import { Struct } from "effect"

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
  discount: number
}

const orderItem: OrderItem = {
  productId: "prod-123",
  quantity: 3,
  unitPrice: 29.99,
  discount: 0.1
}

// Simple property transformations using function-first approach
const processedItem = Struct.evolve(orderItem, {
  quantity: (qty) => Math.max(1, qty), // Ensure minimum quantity
  unitPrice: (price) => Math.round(price * 100) / 100, // Round to 2 decimals
  discount: (discount) => Math.min(0.5, Math.max(0, discount)) // Clamp between 0-50%
})
```

#### Real-World Evolution Example

```typescript
import { Struct, Effect, Array as Arr } from "effect"

interface CustomerOrder {
  id: string
  customerId: string
  items: OrderItem[]
  shippingAddress: {
    street: string
    city: string
    country: string
    postalCode: string
  }
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
  currency: string
}

// Complex order processing with validation and normalization using function-first approach
const processOrder = (order: CustomerOrder) =>
  Struct.evolve(order, {
    items: (items) => items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice * (1 - item.discount)
    })),
    shippingAddress: (address) => ({
      ...address,
      street: address.street.trim(),
      city: address.city.trim().toLowerCase(),
      country: address.country.toUpperCase(),
      postalCode: address.postalCode.replace(/\s/g, '').toUpperCase()
    }),
    status: (status) => status === "pending" ? "processing" : status,
    createdAt: (date) => new Date(date).toISOString()
  })

// Calculate order totals using evolved data
const calculateOrderSummary = (order: CustomerOrder) => {
  const processed = processOrder(order)
  
  return Struct.evolve(processed, {
    items: (items) => {
      const subtotal = items.reduce((sum, item) => sum + (item as any).totalPrice, 0)
      const tax = subtotal * 0.08 // 8% tax
      const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
      
      return {
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: shipping,
        total: Math.round((subtotal + tax + shipping) * 100) / 100
      }
    }
  })
}

// Business logic for processing orders using Effect.gen
const processOrderWorkflow = (orderId: string) =>
  Effect.gen(function* () {
    const order = yield* getOrder(orderId)
    const processedOrder = processOrder(order)
    const orderSummary = calculateOrderSummary(order)
    
    // Validate order totals
    yield* validateOrderTotals(orderSummary)
    
    // Save processed order
    yield* saveOrder(processedOrder)
    
    // Send confirmation email
    yield* sendOrderConfirmation(orderId, orderSummary)
    
    return orderSummary
  }).pipe(
    Effect.withSpan('order.process', { attributes: { 'order.id': orderId } }),
    Effect.mapError(error => new Error(`Order processing failed: ${error.message}`))
  )

// Mock services
const getOrder = (id: string): Effect.Effect<CustomerOrder, Error> =>
  Effect.succeed({} as CustomerOrder)

const validateOrderTotals = (order: any): Effect.Effect<void, Error> =>
  Effect.sync(() => {})

const saveOrder = (order: CustomerOrder): Effect.Effect<void, Error> =>
  Effect.sync(() => {})

const sendOrderConfirmation = (orderId: string, summary: any): Effect.Effect<void, Error> =>
  Effect.sync(() => {})
```

#### Advanced Evolution: Conditional Transformations

```typescript
import { Struct, Option } from "effect"

interface UserAccount {
  id: string
  username: string
  email: string
  profilePicture?: string
  isVerified: boolean
  subscription: {
    tier: "free" | "premium" | "enterprise"
    expiresAt?: string
  }
  lastLoginAt?: string
}

// Conditional transformations based on subscription tier using function-first approach
const normalizeUserAccount = (account: UserAccount) =>
  Struct.evolve(account, {
    username: (username) => username.toLowerCase().trim(),
    email: (email) => email.toLowerCase().trim(),
    profilePicture: (pic) => pic || getDefaultAvatar(account.username),
    subscription: (sub) => ({
      ...sub,
      isActive: sub.tier !== "free" && sub.expiresAt 
        ? new Date(sub.expiresAt) > new Date()
        : sub.tier !== "free",
      features: getFeaturesByTier(sub.tier)
    }),
    lastLoginAt: (lastLogin) => lastLogin 
      ? formatRelativeTime(lastLogin)
      : "Never logged in"
  })

// Helper functions
const getDefaultAvatar = (username: string): string =>
  `https://avatars.example.com/${username.charAt(0).toLowerCase()}.png`

const getFeaturesByTier = (tier: string): string[] => {
  switch (tier) {
    case "free":
      return ["basic_features"]
    case "premium":
      return ["basic_features", "advanced_analytics", "priority_support"]
    case "enterprise":
      return ["basic_features", "advanced_analytics", "priority_support", "custom_integrations"]
    default:
      return ["basic_features"]
  }
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}
```

### Struct Equivalence: Deep Comparison

Create equivalence functions for complex object comparisons, essential for caching, memoization, and change detection.

#### Basic Equivalence Usage

```typescript
import { Struct, String, Number, Array as Arr } from "effect"

interface Product {
  name: string
  price: number
  tags: string[]
}

// Create equivalence function for Product
const ProductEquivalence = Struct.getEquivalence({
  name: String.Equivalence,
  price: Number.Equivalence,
  tags: Arr.getEquivalence(String.Equivalence)
})

const product1: Product = {
  name: "Laptop",
  price: 999.99,
  tags: ["electronics", "computers"]
}

const product2: Product = {
  name: "Laptop",
  price: 999.99,
  tags: ["electronics", "computers"]
}

console.log(ProductEquivalence(product1, product2)) // true
```

#### Real-World Equivalence Example

```typescript
import { Struct, String, Number, Boolean, Array as Arr, Effect } from "effect"

interface CacheEntry<T> {
  key: string
  value: T
  metadata: {
    createdAt: number
    expiresAt: number
    accessCount: number
  }
}

// Create equivalence for cache entries (excluding metadata)
const createCacheEquivalence = <T>(valueEquivalence: (a: T, b: T) => boolean) =>
  Struct.getEquivalence({
    key: String.Equivalence,
    value: { equals: valueEquivalence },
    metadata: Struct.getEquivalence({
      createdAt: Number.Equivalence,
      expiresAt: Number.Equivalence,
      accessCount: Number.Equivalence
    })
  })

// User cache equivalence
interface User {
  id: string
  name: string
  email: string
  isActive: boolean
}

const UserEquivalence = Struct.getEquivalence({
  id: String.Equivalence,
  name: String.Equivalence,
  email: String.Equivalence,
  isActive: Boolean.Equivalence
})

const UserCacheEquivalence = createCacheEquivalence<User>(UserEquivalence)

// Cache implementation with change detection
class StructCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private equivalence: (a: CacheEntry<T>, b: CacheEntry<T>) => boolean

  constructor(equivalence: (a: CacheEntry<T>, b: CacheEntry<T>) => boolean) {
    this.equivalence = equivalence
  }

  set(key: string, value: T, ttl: number = 3600000): Effect.Effect<boolean> {
    return Effect.gen(function* (this: StructCache<T>) {
      const now = Date.now()
      const newEntry: CacheEntry<T> = {
        key,
        value,
        metadata: {
          createdAt: now,
          expiresAt: now + ttl,
          accessCount: 0
        }
      }

      const existingEntry = this.cache.get(key)
      if (existingEntry && this.equivalence(existingEntry, newEntry)) {
        return false // No change needed
      }

      this.cache.set(key, newEntry)
      return true // Value was updated
    }.bind(this))
  }

  get(key: string): Effect.Effect<Option.Option<T>, Error> {
    return Effect.gen(function* (this: StructCache<T>) {
      const entry = this.cache.get(key)
      if (!entry) {
        return Option.none()
      }

      const now = Date.now()
      if (now > entry.metadata.expiresAt) {
        this.cache.delete(key)
        return Option.none()
      }

      // Update access count
      entry.metadata.accessCount++
      return Option.some(entry.value)
    }.bind(this))
  }
}

// Usage
const userCache = new StructCache(UserCacheEquivalence)
```

### Struct Ordering: Sorting and Comparison

Create ordering functions for sorting complex objects with multiple criteria.

#### Basic Ordering Usage

```typescript
import { Struct, String, Number, Order, Array as Arr } from "effect"

interface Employee {
  name: string
  department: string
  salary: number
  startDate: string
}

// Create order for Employee
const EmployeeOrder = Struct.getOrder({
  name: String.Order,
  department: String.Order,
  salary: Number.Order,
  startDate: String.Order
})

const employees: Employee[] = [
  { name: "Alice", department: "Engineering", salary: 80000, startDate: "2023-01-15" },
  { name: "Bob", department: "Marketing", salary: 70000, startDate: "2022-06-01" },
  { name: "Carol", department: "Engineering", salary: 85000, startDate: "2023-03-20" }
]

// Sort employees using struct order - function-first approach
const sortedEmployees = Arr.sort(employees, EmployeeOrder)
```

#### Real-World Ordering Example

```typescript
import { Struct, String, Number, Order, Array as Arr } from "effect"

interface Task {
  id: string
  title: string
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string
  assigneeId: string
  estimatedHours: number
  status: "todo" | "in-progress" | "review" | "done"
}

// Custom priority order
const PriorityOrder = Order.make<Task["priority"]>((a, b) => {
  const priorities = { low: 1, medium: 2, high: 3, urgent: 4 }
  return Number.Order(priorities[a], priorities[b])
})

// Custom status order
const StatusOrder = Order.make<Task["status"]>((a, b) => {
  const statuses = { todo: 1, "in-progress": 2, review: 3, done: 4 }
  return Number.Order(statuses[a], statuses[b])
})

// Multi-criteria task ordering
const TaskOrder = Struct.getOrder({
  priority: PriorityOrder,
  dueDate: String.Order,
  status: StatusOrder,
  estimatedHours: Number.Order
})

// Advanced sorting with custom criteria - function-first approach
const sortTasksForDashboard = (tasks: Task[]) =>
  Arr.sort(
    Arr.filter(tasks, task => task.status !== "done"), // Only active tasks
    Order.combine(
      Order.reverse(PriorityOrder), // High priority first
      String.Order, // Then by due date
      StatusOrder // Then by status
    )
  )

// Create different views with sorting - function-first approach
const createTaskViews = (tasks: Task[]) => ({
  priorityView: Arr.sort(
    tasks,
    Order.reverse(PriorityOrder)
  ),
  dueDateView: Arr.sort(
    tasks,
    Order.mapInput(String.Order, (task: Task) => task.dueDate)
  ),
  assigneeView: Arr.sort(
    tasks,
    Order.mapInput(String.Order, (task: Task) => task.assigneeId)
  ),
  workloadView: Arr.sort(
    tasks,
    Order.reverse(Order.mapInput(Number.Order, (task: Task) => task.estimatedHours))
  )
})
```

## Practical Patterns & Best Practices

### Pattern 1: Composable Data Transformations

Create reusable transformation pipelines that can be combined and customized for different use cases.

```typescript
import { Struct, Effect, Array as Arr } from "effect"

// Base transformation utilities
const transformers = {
  // String transformations
  normalizeString: (str: string) => str.trim().toLowerCase(),
  capitalizeString: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  sanitizeString: (str: string) => str.replace(/[<>\"'&]/g, ''),
  
  // Number transformations  
  roundCurrency: (num: number) => Math.round(num * 100) / 100,
  clampPercentage: (num: number) => Math.min(100, Math.max(0, num)),
  
  // Date transformations
  normalizeDate: (date: string) => new Date(date).toISOString(),
  formatDisplayDate: (date: string) => new Date(date).toLocaleDateString(),
  
  // Array transformations
  uniqueStrings: (arr: string[]) => [...new Set(arr)],
  sortStrings: (arr: string[]) => [...arr].sort()
}

// Composable transformation patterns - function-first approach
const createDataNormalizer = <T extends Record<string, any>>(
  transformations: Partial<{ [K in keyof T]: (value: T[K]) => any }>
) => (data: T) => Struct.evolve(data, transformations)

// Product data normalization
interface ProductInput {
  name: string
  description: string
  price: number
  discount: number
  tags: string[]
  createdAt: string
}

const normalizeProduct = createDataNormalizer<ProductInput>({
  name: (name) => transformers.capitalizeString(transformers.sanitizeString(name)),
  description: transformers.sanitizeString,
  price: transformers.roundCurrency,
  discount: (discount) => transformers.clampPercentage(discount * 100), // Convert to percentage
  tags: (tags) => transformers.sortStrings(transformers.uniqueStrings(tags)),
  createdAt: transformers.normalizeDate
})

// User data normalization
interface UserInput {
  firstName: string
  lastName: string
  email: string
  registeredAt: string
}

const normalizeUser = createDataNormalizer<UserInput>({
  firstName: transformers.capitalizeString,
  lastName: transformers.capitalizeString,
  email: transformers.normalizeString,
  registeredAt: transformers.normalizeDate
})

// Batch processing with error handling
const processDataBatch = <T extends Record<string, any>, R>(
  data: T[],
  normalizer: (item: T) => R
) =>
  Effect.gen(function* () {
    const results: Array<{ index: number; result?: R; error?: Error }> = []
    
    for (let i = 0; i < data.length; i++) {
      try {
        const normalized = normalizer(data[i])
        results.push({ index: i, result: normalized })
      } catch (error) {
        results.push({ index: i, error: error as Error })
      }
    }
    
    const successful = results.filter(r => r.result).map(r => r.result!)
    const failed = results.filter(r => r.error)
    
    return { successful, failed, total: data.length }
  })
```

### Pattern 2: Type-Safe Property Mapping

Create mappings between different object structures while maintaining compile-time type safety.

```typescript
import { Struct } from "effect"

// Define mapping relationships
interface DatabaseUser {
  user_id: string
  first_name: string
  last_name: string
  email_address: string
  created_timestamp: string
  is_active: boolean
}

interface ApiUser {
  id: string
  fullName: string
  email: string
  joinDate: string
  status: "active" | "inactive"
}

interface DisplayUser {
  name: string
  email: string
  memberSince: string
  statusLabel: string
}

// Type-safe mappers using Struct operations - function-first approach
const mapDatabaseToApi = (dbUser: DatabaseUser): ApiUser => {
  const picked = Struct.pick(
    dbUser,
    "user_id", "first_name", "last_name", "email_address", "created_timestamp", "is_active"
  )
  
  const evolved = Struct.evolve(picked, {
    user_id: (id) => id, // Will be renamed below
    first_name: (firstName) => firstName, // Will be combined below
    last_name: (lastName) => lastName, // Will be combined below
    email_address: (email) => email,
    created_timestamp: (timestamp) => new Date(timestamp).toISOString(),
    is_active: (active) => active ? "active" as const : "inactive" as const
  })
  
  // Manual mapping for complex transformations
  return {
    id: evolved.user_id,
    fullName: `${evolved.first_name} ${evolved.last_name}`,
    email: evolved.email_address,
    joinDate: evolved.created_timestamp,
    status: evolved.is_active
  }
}

const mapApiToDisplay = (apiUser: ApiUser): DisplayUser => {
  const picked = Struct.pick(apiUser, "fullName", "email", "joinDate", "status")
  
  const evolved = Struct.evolve(picked, {
    fullName: (name) => name,
    email: (email) => email,
    joinDate: (date) => new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    status: (status) => status === "active" ? "Active Member" : "Inactive"
  })
  
  // Rename fields
  return {
    name: evolved.fullName,
    email: evolved.email,
    memberSince: evolved.joinDate,
    statusLabel: evolved.status
  }
}

// Composable mapping pipeline - function composition
const mapDatabaseToDisplay = (dbUser: DatabaseUser): DisplayUser =>
  mapApiToDisplay(mapDatabaseToApi(dbUser))

// Generic mapper factory
const createFieldMapper = <Source, Target>(
  fieldMap: Record<keyof Target, keyof Source | ((source: Source) => any)>
) => (source: Source): Target => {
  const target = {} as Target
  
  for (const [targetKey, sourceKeyOrFunction] of Object.entries(fieldMap)) {
    if (typeof sourceKeyOrFunction === "function") {
      target[targetKey as keyof Target] = sourceKeyOrFunction(source)
    } else {
      target[targetKey as keyof Target] = source[sourceKeyOrFunction as keyof Source] as any
    }
  }
  
  return target
}

// Usage of generic mapper
const dbToApiMapper = createFieldMapper<DatabaseUser, ApiUser>({
  id: "user_id",
  fullName: (db) => `${db.first_name} ${db.last_name}`,
  email: "email_address",
  joinDate: (db) => new Date(db.created_timestamp).toISOString(),
  status: (db) => db.is_active ? "active" : "inactive"
})
```

### Pattern 3: Validation and Sanitization Pipelines

Combine Struct operations with validation logic for robust data processing.

```typescript
import { Struct, Effect, Either, Array as Arr } from "effect"

// Validation types
interface ValidationError {
  field: string
  message: string
  value: any
}

type ValidationResult<T> = Either.Either<T, ValidationError[]>

// Validation utilities
const validators = {
  email: (email: string): Either.Either<string, ValidationError> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Either.left({ field: "email", message: "Invalid email format", value: email })
    }
    return Either.right(email)
  },
  
  required: (field: string) => (value: any): Either.Either<any, ValidationError> => {
    if (value === null || value === undefined || value === "") {
      return Either.left({ field, message: "Field is required", value })
    }
    return Either.right(value)
  },
  
  minLength: (field: string, min: number) => (value: string): Either.Either<string, ValidationError> => {
    if (value.length < min) {
      return Either.left({ field, message: `Minimum length is ${min}`, value })
    }
    return Either.right(value)
  },
  
  range: (field: string, min: number, max: number) => (value: number): Either.Either<number, ValidationError> => {
    if (value < min || value > max) {
      return Either.left({ field, message: `Value must be between ${min} and ${max}`, value })
    }
    return Either.right(value)
  }
}

// Form data validation
interface UserRegistrationForm {
  firstName: string
  lastName: string
  email: string
  password: string
  age: number
  terms: boolean
}

const validateAndNormalizeUser = (form: UserRegistrationForm): ValidationResult<UserRegistrationForm> => {
  const validations = [
    validators.required("firstName")(form.firstName),
    validators.minLength("firstName", 2)(form.firstName),
    validators.required("lastName")(form.lastName),
    validators.minLength("lastName", 2)(form.lastName),
    validators.required("email")(form.email),
    validators.email(form.email),
    validators.required("password")(form.password),
    validators.minLength("password", 8)(form.password),
    validators.range("age", 13, 120)(form.age),
    validators.required("terms")(form.terms)
  ]

  const errors = validations
    .filter(Either.isLeft)
    .map(Either.getLeft)
    .filter(Boolean) as ValidationError[]

  if (errors.length > 0) {
    return Either.left(errors)
  }

  // Normalize valid data - function-first approach
  const normalized = Struct.evolve(form, {
    firstName: (name) => name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    lastName: (name) => name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    email: (email) => email.trim().toLowerCase(),
    password: (password) => password, // Would typically hash here
    age: (age) => Math.floor(age),
    terms: (terms) => Boolean(terms)
  })

  return Either.right(normalized)
}

// Batch validation with error aggregation
const validateUserBatch = (forms: UserRegistrationForm[]) =>
  Effect.gen(function* () {
    const results = forms.map((form, index) => ({
      index,
      result: validateAndNormalizeUser(form)
    }))

    const valid = results
      .filter(r => Either.isRight(r.result))
      .map(r => Either.getRight(r.result))
      .filter(Boolean) as UserRegistrationForm[]

    const invalid = results
      .filter(r => Either.isLeft(r.result))
      .map(r => ({
        index: r.index,
        errors: Either.getLeft(r.result) || []
      }))

    return {
      valid,
      invalid,
      summary: {
        total: forms.length,
        validCount: valid.length,
        invalidCount: invalid.length,
        errorsByField: aggregateErrorsByField(invalid.flatMap(i => i.errors))
      }
    }
  })

const aggregateErrorsByField = (errors: ValidationError[]): Record<string, number> =>
  errors.reduce((acc, error) => {
    acc[error.field] = (acc[error.field] || 0) + 1
    return acc
  }, {} as Record<string, number>)
```

## Integration Examples

### Integration with Effect Schema

Combine Struct operations with Schema for comprehensive data validation and transformation.

```typescript
import { Struct, Effect, Schema } from "effect"

// Define schemas with transformations
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.between(0, 150)),
  isActive: Schema.Boolean
})

const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String.pipe(Schema.minLength(1)),
  price: Schema.Number.pipe(Schema.positive()),
  category: Schema.String,
  tags: Schema.Array(Schema.String)
})

// Raw data that needs validation and normalization
interface RawApiData {
  users: unknown[]
  products: unknown[]
}

// Process API data with validation and struct operations
const processApiData = (rawData: RawApiData) =>
  Effect.gen(function* () {
    // Validate and decode users
    const validatedUsers = yield* Effect.forEach(
      rawData.users,
      (user) => Schema.decodeUnknown(UserSchema)(user),
      { concurrency: "unbounded" }
    )

    // Validate and decode products
    const validatedProducts = yield* Effect.forEach(
      rawData.products,
      (product) => Schema.decodeUnknown(ProductSchema)(product),
      { concurrency: "unbounded" }
    )

    // Apply struct transformations after validation - function-first approach
    const normalizedUsers = validatedUsers.map(user =>
      Struct.evolve(user, {
        name: (name) => name.trim().replace(/\s+/g, ' '),
        email: (email) => email.toLowerCase()
      })
    )

    const normalizedProducts = validatedProducts.map(product =>
      Struct.evolve(product, {
        name: (name) => name.trim(),
        price: (price) => Math.round(price * 100) / 100,
        tags: (tags) => [...new Set(tags.map(tag => tag.toLowerCase()))]
      })
    )

    return {
      users: normalizedUsers,
      products: normalizedProducts,
      summary: {
        userCount: normalizedUsers.length,
        productCount: normalizedProducts.length,
        categories: [...new Set(normalizedProducts.map(p => p.category))]
      }
    }
  }).pipe(
    Effect.mapError((error) => new Error(`Data processing failed: ${error}`))
  )

// Create different views using struct operations
const createDataViews = (processedData: {
  users: Array<Schema.Schema.Type<typeof UserSchema>>
  products: Array<Schema.Schema.Type<typeof ProductSchema>>
}) => ({
  userSummary: processedData.users.map(user =>
    Struct.pick(user, "id", "name", "isActive")
  ),
  productCatalog: processedData.products.map(product =>
    Struct.evolve(
      Struct.omit(product, "id"),
      {
        name: (name) => name.toUpperCase(),
        price: (price) => `$${price.toFixed(2)}`
      }
    )
  ),
  activeUserProducts: processedData.users
    .filter(user => user.isActive)
    .map(user => Struct.pick(user, "name", "email"))
})
```

### Integration with React/Frontend Frameworks

Use Struct operations to create clean data transformation layers for UI components.

```typescript
import { Struct, Effect, Array as Arr } from "effect"

// Backend API types
interface ApiUser {
  user_id: string
  first_name: string
  last_name: string
  email_address: string
  profile_image_url?: string
  account_created_at: string
  last_login_at?: string
  subscription_tier: "free" | "premium" | "enterprise"
  preferences: {
    theme: "light" | "dark"
    notifications_enabled: boolean
    language_code: string
  }
}

// UI Component props
interface UserCardProps {
  id: string
  displayName: string
  email: string
  avatar: string
  joinedDate: string
  lastSeen: string
  subscriptionBadge: {
    text: string
    color: string
  }
  preferences: {
    theme: string
    notifications: boolean
  }
}

interface UserListProps {
  title: string
  users: UserCardProps[]
  totalCount: number
  hasMore: boolean
}

// Transform API data to UI props - function-first approach
const transformUserForCard = (apiUser: ApiUser): UserCardProps => {
  const picked = Struct.pick(
    apiUser,
    "user_id", "first_name", "last_name", "email_address", "profile_image_url", 
    "account_created_at", "last_login_at", "subscription_tier", "preferences"
  )
  
  const evolved = Struct.evolve(picked, {
    user_id: (id) => id,
    first_name: (firstName) => firstName.trim(),
    last_name: (lastName) => lastName.trim(),
    email_address: (email) => email.toLowerCase(),
    profile_image_url: (url) => url || generateAvatarUrl(apiUser.first_name + " " + apiUser.last_name),
    account_created_at: (date) => formatUserFriendlyDate(date),
    last_login_at: (date) => date ? formatRelativeTime(date) : "Never",
    subscription_tier: (tier) => ({
      free: { text: "Free", color: "gray" },
      premium: { text: "Premium", color: "blue" },
      enterprise: { text: "Enterprise", color: "purple" }
    }[tier]),
    preferences: (prefs) => ({
      theme: prefs.theme,
      notifications: prefs.notifications_enabled
    })
  })
  
  // Final shape transformation
  return {
    id: evolved.user_id,
    displayName: `${evolved.first_name} ${evolved.last_name}`,
    email: evolved.email_address,
    avatar: evolved.profile_image_url,
    joinedDate: evolved.account_created_at,
    lastSeen: evolved.last_login_at,
    subscriptionBadge: evolved.subscription_tier,
    preferences: evolved.preferences
  }
}

// Create different UI views
const createUserViews = (apiUsers: ApiUser[]) => {
  const transformedUsers = apiUsers.map(transformUserForCard)
  
  return {
    // Main user list
    allUsers: {
      title: "All Users",
      users: transformedUsers,
      totalCount: transformedUsers.length,
      hasMore: false
    } as UserListProps,
    
    // Premium users only
    premiumUsers: {
      title: "Premium Users",
      users: transformedUsers.filter(user => user.subscriptionBadge.text !== "Free"),
      totalCount: transformedUsers.filter(user => user.subscriptionBadge.text !== "Free").length,
      hasMore: false
    } as UserListProps,
    
    // Recent users (joined in last 30 days) - function-first approach
    recentUsers: (() => {
      const filtered = Arr.filter(transformedUsers, user => {
        const joinDate = new Date(user.joinedDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return joinDate > thirtyDaysAgo
      })
      
      return {
        title: "New Users",
        users: filtered,
        totalCount: filtered.length,
        hasMore: false
      } as UserListProps
    })()
  }
}

// React component integration (example)
/*
const UserCard: React.FC<UserCardProps> = ({ displayName, email, avatar, subscriptionBadge }) => (
  <div className="user-card">
    <img src={avatar} alt={displayName} />
    <h3>{displayName}</h3>
    <p>{email}</p>
    <span className={`badge badge-${subscriptionBadge.color}`}>
      {subscriptionBadge.text}
    </span>
  </div>
)

const UserList: React.FC<UserListProps> = ({ title, users, totalCount }) => (
  <div className="user-list">
    <h2>{title} ({totalCount})</h2>
    {users.map(user => <UserCard key={user.id} {...user} />)}
  </div>
)
*/

// Helper functions
const generateAvatarUrl = (name: string): string =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`

const formatUserFriendlyDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return formatUserFriendlyDate(dateString)
}

// Effect-based data fetching with transformation
const fetchAndTransformUsers = () =>
  Effect.gen(function* () {
    const apiUsers = yield* fetchUsersFromApi()
    const transformedViews = createUserViews(apiUsers)
    
    return transformedViews
  }).pipe(
    Effect.mapError(error => new Error(`Failed to fetch users: ${error}`))
  )

const fetchUsersFromApi = (): Effect.Effect<ApiUser[], Error> =>
  Effect.succeed([]) // Placeholder implementation
```

### Testing Strategies

Comprehensive testing patterns for Struct operations, focusing on property-based testing and edge cases.

```typescript
import { Struct, Effect, Equal, Array as Arr } from "effect"
import { describe, it, expect } from "vitest"

// Test utilities
const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: "test-id",
  name: "Test User",
  email: "test@example.com",
  age: 25,
  isActive: true,
  ...overrides
})

const createTestProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "prod-1",
  name: "Test Product",
  price: 99.99,
  category: "Test",
  tags: ["test"],
  ...overrides
})

// Property-based testing helpers
const generateRandomUser = (): User => ({
  id: Math.random().toString(36),
  name: `User ${Math.random().toString(36).substr(2, 9)}`,
  email: `${Math.random().toString(36).substr(2, 9)}@example.com`,
  age: Math.floor(Math.random() * 80) + 18,
  isActive: Math.random() > 0.5
})

describe("Struct Operations", () => {
  describe("pick", () => {
    it("should pick specified properties", () => {
      const user = createTestUser()
      const picked = Struct.pick(user, "id", "name")
      
      expect(picked).toEqual({
        id: "test-id",
        name: "Test User"
      })
      expect(picked).not.toHaveProperty("email")
    })

    it("should maintain type safety", () => {
      const user = createTestUser()
      const picked = Struct.pick(user, "id", "name")
      
      // TypeScript should allow these
      expect(typeof picked.id).toBe("string")
      expect(typeof picked.name).toBe("string")
      
      // TypeScript should not allow these (compilation test)
      // @ts-expect-error
      // const email = picked.email
    })

    it("should work with empty selection", () => {
      const user = createTestUser()
      const picked = Struct.pick(user)
      
      expect(picked).toEqual({})
    })
  })

  describe("omit", () => {
    it("should omit specified properties", () => {
      const user = createTestUser()
      const omitted = Struct.omit(user, "email", "age")
      
      expect(omitted).toEqual({
        id: "test-id",
        name: "Test User",
        isActive: true
      })
      expect(omitted).not.toHaveProperty("email")
      expect(omitted).not.toHaveProperty("age")
    })

    it("should preserve all other properties", () => {
      const user = createTestUser({ isActive: false })
      const omitted = Struct.omit(user, "email")
      
      expect(omitted.isActive).toBe(false)
      expect(omitted.id).toBe("test-id")
    })
  })

  describe("evolve", () => {
    it("should transform specified properties", () => {
      const user = createTestUser({ name: "john doe" })
      const evolved = Struct.evolve(user, {
        name: (name) => name.toUpperCase(),
        age: (age) => age * 2
      })
      
      expect(evolved.name).toBe("JOHN DOE")
      expect(evolved.age).toBe(50)
      expect(evolved.email).toBe("test@example.com") // Unchanged
    })

    it("should handle complex transformations", () => {
      const product = createTestProduct({
        name: "  test product  ",
        price: 99.999,
        tags: ["tag1", "tag2", "tag1"]
      })
      
      const evolved = Struct.evolve(product, {
        name: (name) => name.trim().toUpperCase(),
        price: (price) => Math.round(price * 100) / 100,
        tags: (tags) => [...new Set(tags)].sort()
      })
      
      expect(evolved.name).toBe("TEST PRODUCT")
      expect(evolved.price).toBe(100.00)
      expect(evolved.tags).toEqual(["tag1", "tag2"])
    })

    it("should work with partial transformations", () => {
      const user = createTestUser()
      const evolved = Struct.evolve(user, {
        name: (name) => name.toUpperCase()
      })
      
      expect(evolved.name).toBe("TEST USER")
      expect(evolved.age).toBe(25) // Unchanged
    })
  })

  describe("get", () => {
    it("should retrieve property values", () => {
      const user = createTestUser()
      const name = Struct.get("name")(user)
      const age = Struct.get("age")(user)
      
      expect(name).toBe("Test User")
      expect(age).toBe(25)
    })

    it("should work with nested properties", () => {
      const config = {
        database: { host: "localhost", port: 5432 },
        api: { version: "v1" }
      }
      
      const database = Struct.get("database")(config)
      expect(database).toEqual({ host: "localhost", port: 5432 })
    })
  })

  describe("keys", () => {
    it("should return string keys only", () => {
      const obj = {
        a: 1,
        b: 2,
        [Symbol("test")]: 3
      }
      
      const keys = Struct.keys(obj)
      expect(keys).toEqual(["a", "b"])
      expect(keys).not.toContain("Symbol(test)")
    })

    it("should preserve key type information", () => {
      const user = createTestUser()
      const keys = Struct.keys(user)
      
      // TypeScript should infer this as Array<"id" | "name" | "email" | "age" | "isActive">
      expect(keys).toContain("id")
      expect(keys).toContain("name")
      expect(keys.length).toBe(5)
    })
  })

  describe("composition", () => {
    it("should compose multiple operations", () => {
      const user = createTestUser({ name: "john doe", email: "JOHN@EXAMPLE.COM" })
      
      const result = Struct.evolve(
        Struct.pick(user, "id", "name", "email"),
        {
          name: (name) => name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          email: (email) => email.toLowerCase()
        }
      )
      
      expect(result).toEqual({
        id: "test-id",
        name: "John Doe",
        email: "john@example.com"
      })
    })

    it("should work in Effect workflows", async () => {
      const processUser = (user: User) =>
        Effect.gen(function* () {
          const normalized = Struct.evolve(user, {
            name: (name) => name.trim(),
            email: (email) => email.toLowerCase()
          })
          
          const summary = Struct.pick(normalized, "id", "name", "email")
          
          return summary
        })
      
      const user = createTestUser({ name: "  John  ", email: "JOHN@EXAMPLE.COM" })
      const result = await Effect.runPromise(processUser(user))
      
      expect(result).toEqual({
        id: "test-id",
        name: "John",
        email: "john@example.com"
      })
    })
  })

  describe("property-based tests", () => {
    it("pick and omit should be complementary", () => {
      // Property: pick + omit of same keys should reconstruct original (for simple objects)
      const user = createTestUser()
      const keys = Struct.keys(user)
      const someKeys = keys.slice(0, 3)
      const otherKeys = keys.slice(3)
      
      const picked = Struct.pick(user, ...someKeys)
      const omitted = Struct.omit(user, ...someKeys)
      
      // Verify they have no overlapping keys
      const pickedKeys = Struct.keys(picked)
      const omittedKeys = Struct.keys(omitted)
      
      expect(pickedKeys.some(k => omittedKeys.includes(k))).toBe(false)
    })

    it("evolve should preserve object shape", () => {
      for (let i = 0; i < 100; i++) {
        const user = generateRandomUser()
        const evolved = Struct.evolve(user, {
          name: (name) => name.toUpperCase()
        })
        
        expect(Struct.keys(evolved)).toEqual(Struct.keys(user))
        expect(evolved.id).toBe(user.id) // Unchanged property
        expect(evolved.name).toBe(user.name.toUpperCase()) // Transformed property
      }
    })
  })
})

// Integration test with real-world scenario
describe("Real-world integration", () => {
  it("should handle user profile transformation pipeline", async () => {
    const rawUserData = {
      user_id: "123",
      first_name: "  john  ",
      last_name: "  DOE  ",
      email_address: "JOHN.DOE@EXAMPLE.COM",
      birth_year: 1990,
      account_status: "ACTIVE",
      preferences: {
        theme: "dark",
        notifications: true
      }
    }

    const picked = Struct.pick(rawUserData, "user_id", "first_name", "last_name", "email_address", "account_status")
    
    const evolved = Struct.evolve(picked, {
      first_name: (name) => name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      last_name: (name) => name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      email_address: (email) => email.toLowerCase(),
      account_status: (status) => status === "ACTIVE"
    })
    
    // Final shape transformation
    const transformUser = {
      id: evolved.user_id,
      fullName: `${evolved.first_name} ${evolved.last_name}`,
      email: evolved.email_address,
      isActive: evolved.account_status
    }

    expect(transformUser).toEqual({
      id: "123",
      fullName: "John Doe",
      email: "john.doe@example.com",
      isActive: true
    })
  })
})
```

## Conclusion

The Struct module provides powerful, type-safe object manipulation utilities that eliminate boilerplate code while ensuring compile-time correctness. It enables composable data transformations, property selection, and structural operations that integrate seamlessly with the broader Effect ecosystem.

Key benefits:
- **Type Safety**: All operations maintain full TypeScript type checking and inference
- **Composability**: Operations can be chained and combined for complex transformations
- **Performance**: Efficient implementations with minimal runtime overhead
- **Integration**: Works seamlessly with Effect, Schema, and other ecosystem modules

Use the Struct module when you need clean, maintainable object manipulation in functional pipelines, especially for data transformation layers, API response formatting, and configuration processing workflows.