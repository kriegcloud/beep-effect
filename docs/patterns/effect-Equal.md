# Equal: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Equal Solves

JavaScript's native equality operators (`===` and `==`) perform reference-based comparison for objects, leading to unexpected results when you need structural equality for complex data structures:

```typescript
// Traditional approach - reference-based equality
interface User {
  id: string
  name: string
  settings: {
    theme: 'light' | 'dark'
    notifications: boolean
  }
}

const user1: User = {
  id: '123',
  name: 'Alice',
  settings: { theme: 'dark', notifications: true }
}

const user2: User = {
  id: '123', 
  name: 'Alice',
  settings: { theme: 'dark', notifications: true }
}

// This returns false even though the content is identical
console.log(user1 === user2) // false

// Deep equality requires complex custom logic
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    for (let key of keysA) {
      if (!keysB.includes(key)) return false
      if (!deepEqual(a[key], b[key])) return false
    }
    
    return true
  }
  
  return false
}

// Manual implementation is error-prone and hard to maintain
console.log(deepEqual(user1, user2)) // true, but at what cost?

// Set deduplication doesn't work
const userSet = new Set([user1, user2])
console.log(userSet.size) // 2 - both users are considered different
```

This approach leads to:
- **Unexpected behavior** - identical data structures are treated as different
- **Manual equality logic** - complex, error-prone custom equality functions
- **Collection inefficiency** - Sets and Maps can't deduplicate structurally equal values
- **Poor composability** - equality logic doesn't compose well with functional patterns

### The Equal Solution

Equal provides a systematic approach to structural equality with composable, type-safe operations:

```typescript
import { Equal, Data, HashMap, HashSet } from "effect"

// Create data structures with built-in structural equality
const user1 = Data.struct({
  id: '123',
  name: 'Alice', 
  settings: Data.struct({
    theme: 'dark' as const,
    notifications: true
  })
})

const user2 = Data.struct({
  id: '123',
  name: 'Alice',
  settings: Data.struct({
    theme: 'dark' as const, 
    notifications: true
  })
})

// Structural equality just works
console.log(Equal.equals(user1, user2)) // true

// Collections properly deduplicate
const userSet = HashSet.empty().pipe(
  HashSet.add(user1),
  HashSet.add(user2)
)
console.log(HashSet.size(userSet)) // 1 - correctly deduplicated

// Use as HashMap keys
const userProfiles = HashMap.empty().pipe(
  HashMap.set(user1, { lastLogin: new Date(), status: 'active' }),
  HashMap.set(user2, { lastLogin: new Date(), status: 'premium' })
)
console.log(HashMap.size(userProfiles)) // 1 - same key, value was updated
```

### Key Concepts

**Structural Equality**: Compare values by their content and structure, not memory references - `Equal.equals(a, b)`

**Hash Integration**: Equal works with Hash to enable efficient lookups in collections like HashMap and HashSet

**Data Module Integration**: Use `Data.struct`, `Data.tuple`, `Data.array` for automatic Equal/Hash implementation

## Basic Usage Patterns

### Pattern 1: Using Equal.equals for Comparison

```typescript
import { Equal, Data } from "effect"

// Basic structural comparison
const point1 = Data.struct({ x: 10, y: 20 })
const point2 = Data.struct({ x: 10, y: 20 })
const point3 = Data.struct({ x: 15, y: 25 })

console.log(Equal.equals(point1, point2)) // true
console.log(Equal.equals(point1, point3)) // false

// Nested structures
const config1 = Data.struct({
  database: Data.struct({
    host: 'localhost',
    port: 5432,
    credentials: Data.struct({
      username: 'admin',
      password: 'secret123'
    })
  }),
  cache: Data.struct({
    enabled: true,
    ttl: 3600
  })
})

const config2 = Data.struct({
  database: Data.struct({
    host: 'localhost', 
    port: 5432,
    credentials: Data.struct({
      username: 'admin',
      password: 'secret123'
    })
  }),
  cache: Data.struct({
    enabled: true,
    ttl: 3600
  })
})

console.log(Equal.equals(config1, config2)) // true

// Array and tuple comparison
const coordinates1 = Data.tuple(10, 20, 30)
const coordinates2 = Data.tuple(10, 20, 30)
const coordinates3 = Data.array([10, 20, 30])

console.log(Equal.equals(coordinates1, coordinates2)) // true
console.log(Equal.equals(coordinates1, coordinates3)) // true - tuples and arrays are interchangeable
```

### Pattern 2: Custom Equal Implementation

```typescript
import { Equal, Hash } from "effect"

// Custom class with Equal implementation
class Product implements Equal.Equal {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly price: number,
    readonly category: string
  ) {}

  // Define structural equality based on all fields
  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof Product) {
      return Equal.equals(this.id, that.id) &&
             Equal.equals(this.name, that.name) &&
             Equal.equals(this.price, that.price) &&
             Equal.equals(this.category, that.category)
    }
    return false
  }

  // Hash implementation for efficient collection operations
  [Hash.symbol](): number {
    return Hash.hash(this.id)
  }
}

// Custom equality with business logic
class Employee implements Equal.Equal {
  constructor(
    readonly employeeId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly department: string,
    readonly salary: number
  ) {}

  // Equality based on employee ID only (business requirement)
  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof Employee) {
      return Equal.equals(this.employeeId, that.employeeId)
    }
    return false
  }

  [Hash.symbol](): number {
    return Hash.hash(this.employeeId)
  }
}

// Usage
const product1 = new Product('p1', 'Laptop', 999.99, 'Electronics')
const product2 = new Product('p1', 'Laptop', 999.99, 'Electronics')
const product3 = new Product('p1', 'Gaming Laptop', 1299.99, 'Electronics')

console.log(Equal.equals(product1, product2)) // true
console.log(Equal.equals(product1, product3)) // false

const emp1 = new Employee('E001', 'John', 'Doe', 'Engineering', 75000)
const emp2 = new Employee('E001', 'John', 'Smith', 'Engineering', 80000) // Different name/salary

console.log(Equal.equals(emp1, emp2)) // true - same employee ID
```

### Pattern 3: Working with Effect Collections

```typescript
import { Equal, Data, HashMap, HashSet, pipe } from "effect"

// HashSet with structural equality
const createUserSet = () => {
  const user1 = Data.struct({ id: '1', name: 'Alice', role: 'admin' })
  const user2 = Data.struct({ id: '2', name: 'Bob', role: 'user' })
  const user3 = Data.struct({ id: '1', name: 'Alice', role: 'admin' }) // Duplicate

  return HashSet.empty().pipe(
    HashSet.add(user1),
    HashSet.add(user2),
    HashSet.add(user3) // This won't be added due to structural equality
  )
}

const userSet = createUserSet()
console.log(HashSet.size(userSet)) // 2 - correctly deduplicated

// HashMap with structural keys
const sessionData = HashMap.empty().pipe(
  HashMap.set(
    Data.struct({ userId: '123', sessionId: 'abc' }),
    { loginTime: new Date(), lastActivity: new Date() }
  ),
  HashMap.set(
    Data.struct({ userId: '456', sessionId: 'def' }),
    { loginTime: new Date(), lastActivity: new Date() }
  )
)

// Retrieve using structurally equal key
const sessionKey = Data.struct({ userId: '123', sessionId: 'abc' })
const session = HashMap.get(sessionData, sessionKey)
console.log(session) // Some({ loginTime: ..., lastActivity: ... })

// Check membership in collections
const permissions = HashSet.make(
  Data.struct({ resource: 'users', action: 'read' }),
  Data.struct({ resource: 'users', action: 'write' }),
  Data.struct({ resource: 'products', action: 'read' })
)

const hasPermission = (resource: string, action: string) =>
  HashSet.has(permissions, Data.struct({ resource, action }))

console.log(hasPermission('users', 'read'))  // true
console.log(hasPermission('users', 'delete')) // false
```

## Real-World Examples

### Example 1: Configuration Management System

Building a type-safe configuration system that tracks changes and prevents duplicate configurations:

```typescript
import { Equal, Data, HashMap, HashSet, pipe, Effect, Option } from "effect"

// Configuration data structures with structural equality
interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly connectionPool: {
    readonly min: number
    readonly max: number
    readonly timeout: number
  }
}

interface ApiConfig {
  readonly baseUrl: string
  readonly timeout: number
  readonly retries: number
  readonly rateLimiting: {
    readonly requestsPerMinute: number
    readonly burstSize: number
  }
}

interface AppConfig {
  readonly version: string
  readonly environment: 'development' | 'staging' | 'production'
  readonly database: DatabaseConfig
  readonly api: ApiConfig
  readonly features: {
    readonly enableMetrics: boolean
    readonly enableTracing: boolean
    readonly maintenanceMode: boolean
  }
}

// Helper to create configurations with structural equality
const createConfig = (config: AppConfig) => Data.struct({
  version: config.version,
  environment: config.environment,
  database: Data.struct({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    connectionPool: Data.struct({
      min: config.database.connectionPool.min,
      max: config.database.connectionPool.max,
      timeout: config.database.connectionPool.timeout
    })
  }),
  api: Data.struct({
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
    retries: config.api.retries,
    rateLimiting: Data.struct({
      requestsPerMinute: config.api.rateLimiting.requestsPerMinute,
      burstSize: config.api.rateLimiting.burstSize
    })
  }),
  features: Data.struct({
    enableMetrics: config.features.enableMetrics,
    enableTracing: config.features.enableTracing,
    maintenanceMode: config.features.maintenanceMode
  })
})

type ConfigData = ReturnType<typeof createConfig>

// Configuration management service
class ConfigurationManager {
  private currentConfig: Option.Option<ConfigData> = Option.none()
  private configHistory: ConfigData[] = []
  private configSet = HashSet.empty<ConfigData>()

  loadConfiguration(config: AppConfig): Effect.Effect<ConfigData, string> {
    return Effect.gen(function* () {
      const configData = createConfig(config)
      
      // Check if this configuration has been seen before
      const isNewConfig = !HashSet.has(this.configSet, configData)
      
      if (isNewConfig) {
        console.log('Loading new configuration')
        this.configSet = HashSet.add(this.configSet, configData)
        this.configHistory.push(configData)
      } else {
        console.log('Configuration already exists - no changes needed')
      }
      
      this.currentConfig = Option.some(configData)
      return configData
    }.bind(this))
  }

  hasConfigurationChanged(newConfig: AppConfig): boolean {
    const newConfigData = createConfig(newConfig)
    
    return Option.match(this.currentConfig, {
      onNone: () => true, // No current config, so it's a change
      onSome: (current) => !Equal.equals(current, newConfigData)
    })
  }

  getConfigurationHistory(): ConfigData[] {
    return [...this.configHistory]
  }

  findSimilarConfigurations(config: AppConfig): ConfigData[] {
    const targetConfig = createConfig(config)
    
    return this.configHistory.filter(historicalConfig => {
      // Check if environment and version match
      return Equal.equals(historicalConfig.environment, targetConfig.environment) &&
             Equal.equals(historicalConfig.version, targetConfig.version)
    })
  }

  rollbackToPreviousConfig(): Effect.Effect<ConfigData, string> {
    return Effect.gen(function* () {
      if (this.configHistory.length < 2) {
        yield* Effect.fail('No previous configuration available')
      }
      
      const previousConfig = this.configHistory[this.configHistory.length - 2]
      this.currentConfig = Option.some(previousConfig)
      
      return previousConfig
    }.bind(this))
  }
}

// Usage example
const configManager = new ConfigurationManager()

const devConfig: AppConfig = {
  version: '1.0.0',
  environment: 'development',
  database: {
    host: 'localhost',
    port: 5432,
    database: 'myapp_dev',
    connectionPool: { min: 2, max: 10, timeout: 30000 }
  },
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000,
    retries: 3,
    rateLimiting: { requestsPerMinute: 1000, burstSize: 100 }
  },
  features: {
    enableMetrics: true,
    enableTracing: true,
    maintenanceMode: false
  }
}

const prodConfig: AppConfig = {
  ...devConfig,
  environment: 'production',
  database: {
    ...devConfig.database,
    host: 'prod-db.example.com',
    database: 'myapp_prod',
    connectionPool: { min: 5, max: 50, timeout: 10000 }
  },
  api: {
    ...devConfig.api,
    baseUrl: 'https://api.example.com',
    rateLimiting: { requestsPerMinute: 5000, burstSize: 500 }
  }
}

// Demonstrate configuration management
const runConfigExample = async () => {
  console.log('=== Configuration Management Demo ===')
  
  // Load initial config
  await Effect.runPromise(configManager.loadConfiguration(devConfig))
  
  // Check if the same config would cause a change
  console.log('Would same config cause change?', configManager.hasConfigurationChanged(devConfig)) // false
  
  // Load production config
  await Effect.runPromise(configManager.loadConfiguration(prodConfig))
  
  // Try to load the same prod config again
  await Effect.runPromise(configManager.loadConfiguration(prodConfig))
  
  // Check history
  console.log('Configuration history length:', configManager.getConfigurationHistory().length)
  
  // Find similar configurations (same version)
  const similarConfigs = configManager.findSimilarConfigurations({
    ...devConfig,
    features: { ...devConfig.features, maintenanceMode: true }
  })
  console.log('Similar configurations found:', similarConfigs.length)
}

runConfigExample()
```

### Example 2: Data Deduplication and Caching System

Building an intelligent caching system that uses structural equality to prevent duplicate data storage:

```typescript
import { Equal, Data, HashMap, HashSet, pipe, Effect, Option } from "effect"

// Domain models with structural equality
interface Customer {
  readonly customerId: string
  readonly email: string
  readonly profile: {
    readonly firstName: string
    readonly lastName: string
    readonly dateOfBirth: string
  }
  readonly preferences: {
    readonly emailNotifications: boolean
    readonly smsNotifications: boolean
    readonly language: string
  }
}

interface Order {
  readonly orderId: string
  readonly customerId: string
  readonly items: Array<{
    readonly productId: string
    readonly quantity: number
    readonly price: number
  }>
  readonly shipping: {
    readonly address: string
    readonly method: 'standard' | 'express' | 'overnight'
    readonly cost: number
  }
  readonly total: number
}

// Create data structures with structural equality
const createCustomer = (customer: Customer) => Data.struct({
  customerId: customer.customerId,
  email: customer.email,
  profile: Data.struct({
    firstName: customer.profile.firstName,
    lastName: customer.profile.lastName,
    dateOfBirth: customer.profile.dateOfBirth
  }),
  preferences: Data.struct({
    emailNotifications: customer.preferences.emailNotifications,
    smsNotifications: customer.preferences.smsNotifications,
    language: customer.preferences.language
  })
})

const createOrder = (order: Order) => Data.struct({
  orderId: order.orderId,
  customerId: order.customerId,
  items: Data.array(order.items.map(item => Data.struct({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price
  }))),
  shipping: Data.struct({
    address: order.shipping.address,
    method: order.shipping.method,
    cost: order.shipping.cost
  }),
  total: order.total
})

type CustomerData = ReturnType<typeof createCustomer>
type OrderData = ReturnType<typeof createOrder>

// Deduplication cache service
class DeduplicationCache {
  private customerCache = HashMap.empty<string, CustomerData>()
  private orderCache = HashMap.empty<string, OrderData>()
  private uniqueCustomers = HashSet.empty<CustomerData>()
  private uniqueOrders = HashSet.empty<OrderData>()
  private duplicateCustomerCount = 0
  private duplicateOrderCount = 0

  addCustomer(customer: Customer): Effect.Effect<{ isNew: boolean; customer: CustomerData }, never> {
    return Effect.gen(function* () {
      const customerData = createCustomer(customer)
      
      // Check if we've seen this exact customer data before
      const isNewCustomer = !HashSet.has(this.uniqueCustomers, customerData)
      
      if (isNewCustomer) {
        // Store in both caches
        this.customerCache = HashMap.set(this.customerCache, customer.customerId, customerData)
        this.uniqueCustomers = HashSet.add(this.uniqueCustomers, customerData)
        console.log(`New customer added: ${customer.email}`)
      } else {
        this.duplicateCustomerCount++
        console.log(`Duplicate customer detected: ${customer.email} (${this.duplicateCustomerCount} total duplicates)`)
      }
      
      return { isNew: isNewCustomer, customer: customerData }
    }.bind(this))
  }

  addOrder(order: Order): Effect.Effect<{ isNew: boolean; order: OrderData }, never> {
    return Effect.gen(function* () {
      const orderData = createOrder(order)
      
      // Check for duplicate orders
      const isNewOrder = !HashSet.has(this.uniqueOrders, orderData)
      
      if (isNewOrder) {
        this.orderCache = HashMap.set(this.orderCache, order.orderId, orderData)
        this.uniqueOrders = HashSet.add(this.uniqueOrders, orderData)
        console.log(`New order added: ${order.orderId}`)
      } else {
        this.duplicateOrderCount++
        console.log(`Duplicate order detected: ${order.orderId} (${this.duplicateOrderCount} total duplicates)`)
      }
      
      return { isNew: isNewOrder, order: orderData }
    }.bind(this))
  }

  findSimilarCustomers(targetCustomer: Customer): CustomerData[] {
    const target = createCustomer(targetCustomer)
    const similar: CustomerData[] = []
    
    // Find customers with same preferences but different profiles
    HashSet.forEach(this.uniqueCustomers, (customer) => {
      if (Equal.equals(customer.preferences, target.preferences) && 
          !Equal.equals(customer.profile, target.profile)) {
        similar.push(customer)
      }
    })
    
    return similar
  }

  findOrdersByCustomer(customerId: string): OrderData[] {
    const orders: OrderData[] = []
    
    HashMap.forEach(this.orderCache, (order) => {
      if (Equal.equals(order.customerId, customerId)) {
        orders.push(order)
      }
    })
    
    return orders
  }

  getDeduplicationStats() {
    return {
      uniqueCustomers: HashSet.size(this.uniqueCustomers),
      uniqueOrders: HashSet.size(this.uniqueOrders),
      totalCustomers: HashMap.size(this.customerCache),
      totalOrders: HashMap.size(this.orderCache),
      duplicateCustomers: this.duplicateCustomerCount,
      duplicateOrders: this.duplicateOrderCount
    }
  }

  // Advanced deduplication: merge customer profiles while preserving structural equality
  mergeCustomerData(customers: Customer[]): Effect.Effect<CustomerData[], never> {
    return Effect.gen(function* () {
      const mergedCustomers = new Map<string, Customer>()
      
      // First pass: collect unique customers by email
      for (const customer of customers) {
        const existing = mergedCustomers.get(customer.email)
        
        if (!existing) {
          mergedCustomers.set(customer.email, customer)
        } else {
          // Merge customer data (latest customerId wins)
          const merged: Customer = {
            customerId: customer.customerId || existing.customerId,
            email: customer.email,
            profile: {
              firstName: customer.profile.firstName || existing.profile.firstName,
              lastName: customer.profile.lastName || existing.profile.lastName,
              dateOfBirth: customer.profile.dateOfBirth || existing.profile.dateOfBirth
            },
            preferences: {
              emailNotifications: customer.preferences.emailNotifications,
              smsNotifications: customer.preferences.smsNotifications,
              language: customer.preferences.language || existing.preferences.language
            }
          }
          mergedCustomers.set(customer.email, merged)
        }
      }
      
      // Second pass: create deduplicated customer data
      const result: CustomerData[] = []
      for (const customer of mergedCustomers.values()) {
        const { customer: customerData } = yield* this.addCustomer(customer)
        result.push(customerData)
      }
      
      return result
    }.bind(this))
  }
}

// Usage example with sample data
const cache = new DeduplicationCache()

const sampleCustomers: Customer[] = [
  {
    customerId: 'C001',
    email: 'alice@example.com',
    profile: { firstName: 'Alice', lastName: 'Johnson', dateOfBirth: '1990-05-15' },
    preferences: { emailNotifications: true, smsNotifications: false, language: 'en' }
  },
  {
    customerId: 'C002',
    email: 'bob@example.com',
    profile: { firstName: 'Bob', lastName: 'Smith', dateOfBirth: '1985-12-03' },
    preferences: { emailNotifications: false, smsNotifications: true, language: 'en' }
  },
  {
    customerId: 'C003',
    email: 'alice@example.com', // Same email as C001
    profile: { firstName: 'Alice', lastName: 'Johnson', dateOfBirth: '1990-05-15' },
    preferences: { emailNotifications: true, smsNotifications: false, language: 'en' }
  }
]

const sampleOrders: Order[] = [
  {
    orderId: 'O001',
    customerId: 'C001',
    items: [
      { productId: 'P1', quantity: 2, price: 29.99 },
      { productId: 'P2', quantity: 1, price: 49.99 }
    ],
    shipping: { address: '123 Main St', method: 'standard', cost: 9.99 },
    total: 119.97
  },
  {
    orderId: 'O002',
    customerId: 'C001',
    items: [
      { productId: 'P1', quantity: 2, price: 29.99 },
      { productId: 'P2', quantity: 1, price: 49.99 }
    ],
    shipping: { address: '123 Main St', method: 'standard', cost: 9.99 },
    total: 119.97
  }
]

// Demonstrate deduplication
const runDeduplicationExample = async () => {
  console.log('=== Data Deduplication Demo ===')
  
  // Add customers (including duplicates)
  for (const customer of sampleCustomers) {
    await Effect.runPromise(cache.addCustomer(customer))
  }
  
  // Add orders (including duplicates)
  for (const order of sampleOrders) {
    await Effect.runPromise(cache.addOrder(order))
  }
  
  // Show deduplication stats
  console.log('Deduplication stats:', cache.getDeduplicationStats())
  
  // Find similar customers
  const similarCustomers = cache.findSimilarCustomers(sampleCustomers[1])
  console.log('Similar customers found:', similarCustomers.length)
  
  // Find orders by customer
  const customerOrders = cache.findOrdersByCustomer('C001')
  console.log('Orders for customer C001:', customerOrders.length)
  
  // Merge customer data
  const mergedCustomers = await Effect.runPromise(cache.mergeCustomerData(sampleCustomers))
  console.log('Merged customers:', mergedCustomers.length)
}

runDeduplicationExample()
```

### Example 3: Set Operations and Data Analytics

Building a data analytics system that uses structural equality for set operations and statistical analysis:

```typescript
import { Equal, Data, HashSet, HashMap, pipe, Effect, Array as Arr } from "effect"

// Analytics data structures
interface UserEvent {
  readonly userId: string
  readonly eventType: 'page_view' | 'click' | 'purchase' | 'signup' | 'logout'
  readonly timestamp: string
  readonly metadata: {
    readonly page?: string
    readonly element?: string
    readonly value?: number
    readonly category?: string
  }
}

interface UserSegment {
  readonly segmentId: string
  readonly name: string
  readonly criteria: {
    readonly ageRange?: { min: number; max: number }
    readonly location?: string
    readonly interests?: string[]
    readonly behaviorTags?: string[]
  }
}

interface UserProfile {
  readonly userId: string
  readonly demographics: {
    readonly age: number
    readonly location: string
    readonly joinDate: string
  }
  readonly interests: string[]
  readonly behaviorTags: string[]
}

// Create data with structural equality
const createUserEvent = (event: UserEvent) => Data.struct({
  userId: event.userId,
  eventType: event.eventType,
  timestamp: event.timestamp,
  metadata: Data.struct({
    page: event.metadata.page,
    element: event.metadata.element,
    value: event.metadata.value,
    category: event.metadata.category
  })
})

const createUserSegment = (segment: UserSegment) => Data.struct({
  segmentId: segment.segmentId,
  name: segment.name,
  criteria: Data.struct({
    ageRange: segment.criteria.ageRange ? Data.struct({
      min: segment.criteria.ageRange.min,
      max: segment.criteria.ageRange.max
    }) : undefined,
    location: segment.criteria.location,
    interests: segment.criteria.interests ? Data.array(segment.criteria.interests) : undefined,
    behaviorTags: segment.criteria.behaviorTags ? Data.array(segment.criteria.behaviorTags) : undefined
  })
})

const createUserProfile = (profile: UserProfile) => Data.struct({
  userId: profile.userId,
  demographics: Data.struct({
    age: profile.demographics.age,
    location: profile.demographics.location,
    joinDate: profile.demographics.joinDate
  }),
  interests: Data.array(profile.interests),
  behaviorTags: Data.array(profile.behaviorTags)
})

type UserEventData = ReturnType<typeof createUserEvent>
type UserSegmentData = ReturnType<typeof createUserSegment>
type UserProfileData = ReturnType<typeof createUserProfile>

// Analytics engine using structural equality
class AnalyticsEngine {
  private events = HashSet.empty<UserEventData>()
  private profiles = HashMap.empty<string, UserProfileData>()
  private segments = HashMap.empty<string, UserSegmentData>()

  addEvent(event: UserEvent): Effect.Effect<boolean, never> {
    return Effect.gen(function* () {
      const eventData = createUserEvent(event)
      const wasNew = !HashSet.has(this.events, eventData)
      
      if (wasNew) {
        this.events = HashSet.add(this.events, eventData)
        console.log(`New event recorded: ${event.eventType} for user ${event.userId}`)
      } else {
        console.log(`Duplicate event ignored: ${event.eventType} for user ${event.userId}`)
      }
      
      return wasNew
    }.bind(this))
  }

  addUserProfile(profile: UserProfile): Effect.Effect<void, never> {
    return Effect.gen(function* () {
      const profileData = createUserProfile(profile)
      this.profiles = HashMap.set(this.profiles, profile.userId, profileData)
    }.bind(this))
  }

  addSegment(segment: UserSegment): Effect.Effect<void, never> {
    return Effect.gen(function* () {
      const segmentData = createUserSegment(segment)
      this.segments = HashMap.set(this.segments, segment.segmentId, segmentData)
    }.bind(this))
  }

  // Set operations using structural equality
  findCommonEventTypes(...userIds: string[]): HashSet.HashSet<string> {
    if (userIds.length === 0) return HashSet.empty()
    
    // Get events for first user
    const firstUserEvents = this.getUserEvents(userIds[0])
    let commonEventTypes = HashSet.map(firstUserEvents, event => event.eventType)
    
    // Intersect with other users' event types
    for (let i = 1; i < userIds.length; i++) {
      const userEvents = this.getUserEvents(userIds[i])
      const userEventTypes = HashSet.map(userEvents, event => event.eventType)
      commonEventTypes = HashSet.intersection(commonEventTypes, userEventTypes)
    }
    
    return commonEventTypes
  }

  findUniqueEventTypes(...userIds: string[]): HashSet.HashSet<string> {
    const allEventTypes = HashSet.empty<string>()
    
    // Collect all event types
    for (const userId of userIds) {
      const userEvents = this.getUserEvents(userId)
      const userEventTypes = HashSet.map(userEvents, event => event.eventType)
      HashSet.union(allEventTypes, userEventTypes)
    }
    
    return allEventTypes
  }

  findUsersWithSimilarBehavior(targetUserId: string): Effect.Effect<UserProfileData[], never> {
    return Effect.gen(function* () {
      const targetProfile = HashMap.get(this.profiles, targetUserId)
      
      if (Option.isNone(targetProfile)) {
        return []
      }
      
      const target = targetProfile.value
      const similarUsers: UserProfileData[] = []
      
      HashMap.forEach(this.profiles, (profile, userId) => {
        if (userId !== targetUserId) {
          // Check for similar interests (structural equality)
          const sharedInterests = HashSet.intersection(
            HashSet.fromIterable(target.interests),
            HashSet.fromIterable(profile.interests)
          )
          
          const sharedBehaviorTags = HashSet.intersection(
            HashSet.fromIterable(target.behaviorTags),
            HashSet.fromIterable(profile.behaviorTags)
          )
          
          // Consider users similar if they share at least 2 interests or 1 behavior tag
          if (HashSet.size(sharedInterests) >= 2 || HashSet.size(sharedBehaviorTags) >= 1) {
            similarUsers.push(profile)
          }
        }
      })
      
      return similarUsers
    }.bind(this))
  }

  // Advanced analytics: cohort analysis using structural equality
  performCohortAnalysis(cohortCriteria: {
    joinDateRange: { start: string; end: string }
    interests: string[]
  }): Effect.Effect<{
    cohortSize: number
    eventTypeDistribution: Map<string, number>
    averageEngagement: number
  }, never> {
    return Effect.gen(function* () {
      const cohortUsers: UserProfileData[] = []
      
      // Find users matching cohort criteria
      HashMap.forEach(this.profiles, (profile) => {
        const joinDate = profile.demographics.joinDate
        const userInterests = HashSet.fromIterable(profile.interests)
        const requiredInterests = HashSet.fromIterable(cohortCriteria.interests)
        
        // Check date range and interests using structural equality
        const isInDateRange = joinDate >= cohortCriteria.joinDateRange.start && 
                             joinDate <= cohortCriteria.joinDateRange.end
        const hasRequiredInterests = HashSet.intersection(userInterests, requiredInterests).pipe(
          HashSet.size
        ) >= Math.min(2, cohortCriteria.interests.length)
        
        if (isInDateRange && hasRequiredInterests) {
          cohortUsers.push(profile)
        }
      })
      
      // Analyze events for cohort users
      const cohortUserIds = new Set(cohortUsers.map(user => user.userId))
      const cohortEvents: UserEventData[] = []
      
      HashSet.forEach(this.events, (event) => {
        if (cohortUserIds.has(event.userId)) {
          cohortEvents.push(event)
        }
      })
      
      // Calculate event type distribution
      const eventTypeDistribution = new Map<string, number>()
      cohortEvents.forEach(event => {
        const count = eventTypeDistribution.get(event.eventType) || 0
        eventTypeDistribution.set(event.eventType, count + 1)
      })
      
      // Calculate average engagement
      const averageEngagement = cohortUsers.length > 0 
        ? cohortEvents.length / cohortUsers.length 
        : 0
      
      return {
        cohortSize: cohortUsers.length,
        eventTypeDistribution,
        averageEngagement
      }
    }.bind(this))
  }

  private getUserEvents(userId: string): HashSet.HashSet<UserEventData> {
    const userEvents = HashSet.empty<UserEventData>()
    
    HashSet.forEach(this.events, (event) => {
      if (Equal.equals(event.userId, userId)) {
        HashSet.add(userEvents, event)
      }
    })
    
    return userEvents
  }

  getAnalyticsStats() {
    return {
      totalEvents: HashSet.size(this.events),
      totalProfiles: HashMap.size(this.profiles),
      totalSegments: HashMap.size(this.segments)
    }
  }
}

// Sample data for demonstration
const sampleProfiles: UserProfile[] = [
  {
    userId: 'U001',
    demographics: { age: 25, location: 'New York', joinDate: '2024-01-15' },
    interests: ['technology', 'gaming', 'music'],
    behaviorTags: ['early_adopter', 'high_engagement']
  },
  {
    userId: 'U002', 
    demographics: { age: 30, location: 'California', joinDate: '2024-02-01' },
    interests: ['technology', 'fitness', 'travel'],
    behaviorTags: ['frequent_buyer', 'mobile_user']
  },
  {
    userId: 'U003',
    demographics: { age: 28, location: 'New York', joinDate: '2024-01-20' },
    interests: ['gaming', 'music', 'art'],
    behaviorTags: ['early_adopter', 'content_creator']
  }
]

const sampleEvents: UserEvent[] = [
  {
    userId: 'U001',
    eventType: 'page_view',
    timestamp: '2024-06-01T10:00:00Z',
    metadata: { page: 'home' }
  },
  {
    userId: 'U001',
    eventType: 'click',
    timestamp: '2024-06-01T10:05:00Z',
    metadata: { element: 'signup_button', page: 'home' }
  },
  {
    userId: 'U002',
    eventType: 'purchase',
    timestamp: '2024-06-01T15:30:00Z',
    metadata: { value: 99.99, category: 'electronics' }
  },
  {
    userId: 'U003',
    eventType: 'page_view',
    timestamp: '2024-06-01T11:00:00Z',
    metadata: { page: 'products' }
  },
  // Duplicate event to test deduplication
  {
    userId: 'U001',
    eventType: 'page_view',
    timestamp: '2024-06-01T10:00:00Z',
    metadata: { page: 'home' }
  }
]

// Usage demonstration
const runAnalyticsExample = async () => {
  console.log('=== Analytics Engine Demo ===')
  
  const analytics = new AnalyticsEngine()
  
  // Add user profiles
  for (const profile of sampleProfiles) {
    await Effect.runPromise(analytics.addUserProfile(profile))
  }
  
  // Add events (including duplicates)
  for (const event of sampleEvents) {
    await Effect.runPromise(analytics.addEvent(event))
  }
  
  console.log('Analytics stats:', analytics.getAnalyticsStats())
  
  // Find common event types
  const commonEvents = analytics.findCommonEventTypes('U001', 'U003')
  console.log('Common event types between U001 and U003:')
  HashSet.forEach(commonEvents, eventType => console.log(`  ${eventType}`))
  
  // Find users with similar behavior
  const similarUsers = await Effect.runPromise(analytics.findUsersWithSimilarBehavior('U001'))
  console.log(`Users similar to U001: ${similarUsers.length}`)
  
  // Perform cohort analysis
  const cohortAnalysis = await Effect.runPromise(analytics.performCohortAnalysis({
    joinDateRange: { start: '2024-01-01', end: '2024-01-31' },
    interests: ['technology', 'gaming']
  }))
  
  console.log('Cohort analysis results:')
  console.log(`  Cohort size: ${cohortAnalysis.cohortSize}`)
  console.log(`  Average engagement: ${cohortAnalysis.averageEngagement.toFixed(2)}`)
  console.log('  Event distribution:')
  cohortAnalysis.eventTypeDistribution.forEach((count, eventType) => {
    console.log(`    ${eventType}: ${count}`)
  })
}

runAnalyticsExample()
```

## Advanced Features Deep Dive

### Feature 1: Custom Equality Semantics

Equal allows you to define custom equality logic for complex business requirements.

#### Domain-Specific Equality

```typescript
import { Equal, Hash, Data } from "effect"

// Financial data with business-specific equality rules
class MonetaryAmount implements Equal.Equal {
  constructor(
    readonly amount: number,
    readonly currency: string,
    readonly precision: number = 2
  ) {}

  // Consider amounts equal if they're within precision tolerance
  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof MonetaryAmount) {
      if (!Equal.equals(this.currency, that.currency)) {
        return false
      }
      
      const tolerance = Math.pow(10, -this.precision)
      return Math.abs(this.amount - that.amount) < tolerance
    }
    return false
  }

  [Hash.symbol](): number {
    // Hash based on rounded amount and currency
    const roundedAmount = Math.round(this.amount * Math.pow(10, this.precision))
    return Hash.hash(`${roundedAmount}-${this.currency}`)
  }
}

// Geographic coordinates with distance-based equality
class GeoLocation implements Equal.Equal {
  constructor(
    readonly latitude: number,
    readonly longitude: number,
    readonly toleranceMeters: number = 100
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof GeoLocation) {
      const distance = this.calculateDistance(that)
      return distance <= this.toleranceMeters
    }
    return false
  }

  [Hash.symbol](): number {
    // Hash based on grid cell (for spatial indexing)
    const gridSize = this.toleranceMeters / 111000 // Convert meters to degrees (approximate)
    const latGrid = Math.floor(this.latitude / gridSize)
    const lonGrid = Math.floor(this.longitude / gridSize)
    return Hash.hash(`${latGrid},${lonGrid}`)
  }

  private calculateDistance(other: GeoLocation): number {
    const R = 6371000 // Earth's radius in meters
    const lat1Rad = this.latitude * Math.PI / 180
    const lat2Rad = other.latitude * Math.PI / 180
    const deltaLatRad = (other.latitude - this.latitude) * Math.PI / 180
    const deltaLonRad = (other.longitude - this.longitude) * Math.PI / 180

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}

// Usage examples
const demonstrateCustomEquality = () => {
  console.log('=== Custom Equality Demo ===')
  
  // Monetary amounts with precision tolerance
  const price1 = new MonetaryAmount(99.99, 'USD', 2)
  const price2 = new MonetaryAmount(99.999, 'USD', 2) // Within tolerance
  const price3 = new MonetaryAmount(100.01, 'USD', 2) // Outside tolerance
  
  console.log('Price equality (within tolerance):', Equal.equals(price1, price2)) // true
  console.log('Price equality (outside tolerance):', Equal.equals(price1, price3)) // false
  
  // Geographic locations with distance tolerance
  const store1 = new GeoLocation(40.7128, -74.0060, 50) // NYC
  const store2 = new GeoLocation(40.7129, -74.0061, 50) // Very close to store1
  const store3 = new GeoLocation(40.7500, -73.9900, 50) // Different location
  
  console.log('Location equality (close):', Equal.equals(store1, store2)) // true
  console.log('Location equality (far):', Equal.equals(store1, store3)) // false
}

demonstrateCustomEquality()
```

#### Versioned Data Equality

```typescript
import { Equal, Hash, Data } from "effect"

// Document with version-aware equality
class VersionedDocument implements Equal.Equal {
  constructor(
    readonly id: string,
    readonly content: string,
    readonly version: number,
    readonly metadata: { author: string; tags: string[] },
    readonly ignoreVersionInEquality: boolean = false
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof VersionedDocument) {
      // Always check ID and content
      if (!Equal.equals(this.id, that.id) || !Equal.equals(this.content, that.content)) {
        return false
      }
      
      // Check metadata
      if (!Equal.equals(this.metadata.author, that.metadata.author)) {
        return false
      }
      
      // Tags equality (order-independent)
      const thisTags = new Set(this.metadata.tags)
      const thatTags = new Set(that.metadata.tags)
      if (thisTags.size !== thatTags.size) {
        return false
      }
      for (const tag of thisTags) {
        if (!thatTags.has(tag)) {
          return false
        }
      }
      
      // Version equality depends on the flag
      if (!this.ignoreVersionInEquality && !that.ignoreVersionInEquality) {
        return Equal.equals(this.version, that.version)
      }
      
      return true
    }
    return false
  }

  [Hash.symbol](): number {
    return Hash.hash(this.ignoreVersionInEquality ? this.id : `${this.id}-v${this.version}`)
  }
}

// Configuration object with environment-aware equality
interface EnvironmentConfig {
  readonly environment: 'development' | 'staging' | 'production'
  readonly settings: Record<string, unknown>
  readonly secrets: Record<string, string>
}

class EnvironmentAwareConfig implements Equal.Equal {
  constructor(
    readonly config: EnvironmentConfig,
    readonly compareSecrets: boolean = false
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof EnvironmentAwareConfig) {
      // Environment must match
      if (!Equal.equals(this.config.environment, that.config.environment)) {
        return false
      }
      
      // Settings must match
      if (!this.deepObjectEquals(this.config.settings, that.config.settings)) {
        return false
      }
      
      // Secrets comparison depends on flag
      if (this.compareSecrets && that.compareSecrets) {
        return this.deepObjectEquals(this.config.secrets, that.config.secrets)
      }
      
      return true
    }
    return false
  }

  [Hash.symbol](): number {
    const settingsHash = Hash.hash(JSON.stringify(this.config.settings))
    const baseHash = Hash.combine(Hash.hash(this.config.environment), settingsHash)
    
    if (this.compareSecrets) {
      const secretsHash = Hash.hash(JSON.stringify(this.config.secrets))
      return Hash.combine(baseHash, secretsHash)
    }
    
    return baseHash
  }

  private deepObjectEquals(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    
    if (keys1.length !== keys2.length) {
      return false
    }
    
    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false
      }
      
      const val1 = obj1[key]
      const val2 = obj2[key]
      
      if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
        if (!this.deepObjectEquals(val1 as Record<string, unknown>, val2 as Record<string, unknown>)) {
          return false
        }
      } else if (!Equal.equals(val1, val2)) {
        return false
      }
    }
    
    return true
  }
}

// Usage examples
const demonstrateVersionedEquality = () => {
  console.log('=== Versioned Equality Demo ===')
  
  // Document equality with version awareness
  const doc1 = new VersionedDocument(
    'doc1',
    'Hello World',
    1,
    { author: 'Alice', tags: ['draft', 'important'] }
  )
  
  const doc2 = new VersionedDocument(
    'doc1',
    'Hello World',
    2, // Different version
    { author: 'Alice', tags: ['draft', 'important'] }
  )
  
  const doc3 = new VersionedDocument(
    'doc1',
    'Hello World',
    2,
    { author: 'Alice', tags: ['important', 'draft'] }, // Same tags, different order
    true // Ignore version in equality
  )
  
  console.log('Document equality (different versions):', Equal.equals(doc1, doc2)) // false
  console.log('Document equality (ignore version):', Equal.equals(doc1, doc3)) // true
  
  // Environment config equality
  const devConfig1 = new EnvironmentAwareConfig({
    environment: 'development',
    settings: { debug: true, logLevel: 'verbose' },
    secrets: { dbPassword: 'dev123', apiKey: 'dev-key' }
  })
  
  const devConfig2 = new EnvironmentAwareConfig({
    environment: 'development',
    settings: { debug: true, logLevel: 'verbose' },
    secrets: { dbPassword: 'dev456', apiKey: 'dev-key' } // Different secrets
  })
  
  const devConfig3 = new EnvironmentAwareConfig({
    environment: 'development',
    settings: { debug: true, logLevel: 'verbose' },
    secrets: { dbPassword: 'dev456', apiKey: 'dev-key' }
  }, true) // Compare secrets
  
  console.log('Config equality (ignore secrets):', Equal.equals(devConfig1, devConfig2)) // true
  console.log('Config equality (compare secrets):', Equal.equals(devConfig2, devConfig3)) // false
}

demonstrateVersionedEquality()
```

### Feature 2: Performance Optimization with Hash

Equal integrates with Hash to provide efficient equality checking in collections.

#### Hash Optimization Strategies

```typescript
import { Equal, Hash, Data, HashSet, HashMap } from "effect"

// High-performance data structure with optimized hashing
class OptimizedUser implements Equal.Equal {
  private readonly _hash: number

  constructor(
    readonly userId: string,
    readonly email: string,
    readonly profile: {
      firstName: string
      lastName: string
      department: string
    }
  ) {
    // Pre-compute hash for better performance
    this._hash = Hash.combine(
      Hash.hash(userId),
      Hash.combine(
        Hash.hash(email),
        Hash.hash(`${profile.firstName}-${profile.lastName}-${profile.department}`)
      )
    )
  }

  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof OptimizedUser) {
      // Quick hash comparison first
      if (this._hash !== that._hash) {
        return false
      }
      
      // Detailed comparison only if hashes match
      return Equal.equals(this.userId, that.userId) &&
             Equal.equals(this.email, that.email) &&
             Equal.equals(this.profile.firstName, that.profile.firstName) &&
             Equal.equals(this.profile.lastName, that.profile.lastName) &&
             Equal.equals(this.profile.department, that.profile.department)
    }
    return false
  }

  [Hash.symbol](): number {
    return this._hash
  }
}

// Cacheable computation result with content-based hashing
class ComputationResult implements Equal.Equal {
  private readonly _contentHash: number

  constructor(
    readonly input: unknown,
    readonly result: unknown,
    readonly metadata: {
      computationTime: number
      cacheKey: string
    }
  ) {
    // Hash based on input and result for cache validity
    this._contentHash = Hash.combine(
      Hash.hash(JSON.stringify(input)),
      Hash.hash(JSON.stringify(result))
    )
  }

  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof ComputationResult) {
      // Fast content-based comparison
      return this._contentHash === that._contentHash &&
             Equal.equals(this.input, that.input) &&
             Equal.equals(this.result, that.result)
    }
    return false
  }

  [Hash.symbol](): number {
    return this._contentHash
  }
}

// Performance benchmark helper
class PerformanceBenchmark {
  private static measureTime<T>(operation: () => T): { result: T; timeMs: number } {
    const start = performance.now()
    const result = operation()
    const timeMs = performance.now() - start
    return { result, timeMs }
  }

  static compareEqualityPerformance() {
    console.log('=== Equality Performance Comparison ===')
    
    // Create test data
    const users1 = Array.from({ length: 1000 }, (_, i) => 
      new OptimizedUser(
        `user-${i}`,
        `user${i}@example.com`,
        { firstName: `First${i}`, lastName: `Last${i}`, department: 'Engineering' }
      )
    )
    
    const users2 = Array.from({ length: 1000 }, (_, i) => 
      new OptimizedUser(
        `user-${i}`,
        `user${i}@example.com`,
        { firstName: `First${i}`, lastName: `Last${i}`, department: 'Engineering' }
      )
    )
    
    // Benchmark individual equality checks
    const { timeMs: individualTime } = this.measureTime(() => {
      for (let i = 0; i < users1.length; i++) {
        Equal.equals(users1[i], users2[i])
      }
    })
    
    console.log(`Individual equality checks: ${individualTime.toFixed(2)}ms`)
    
    // Benchmark HashSet operations
    const { timeMs: hashSetTime } = this.measureTime(() => {
      let set = HashSet.empty<OptimizedUser>()
      
      // Add all users from first array
      for (const user of users1) {
        set = HashSet.add(set, user)
      }
      
      // Try to add duplicates from second array
      for (const user of users2) {
        set = HashSet.add(set, user)
      }
      
      return HashSet.size(set)
    })
    
    console.log(`HashSet operations: ${hashSetTime.toFixed(2)}ms`)
    
    // Benchmark HashMap operations
    const { timeMs: hashMapTime } = this.measureTime(() => {
      let map = HashMap.empty<OptimizedUser, string>()
      
      // Set values for all users
      for (let i = 0; i < users1.length; i++) {
        map = HashMap.set(map, users1[i], `value-${i}`)
      }
      
      // Lookup using structurally equal keys
      let foundCount = 0
      for (const user of users2) {
        if (HashMap.has(map, user)) {
          foundCount++
        }
      }
      
      return foundCount
    })
    
    console.log(`HashMap operations: ${hashMapTime.toFixed(2)}ms`)
  }

  static demonstrateHashCollisionHandling() {
    console.log('=== Hash Collision Handling ===')
    
    // Create objects that might have hash collisions
    class TestData implements Equal.Equal {
      constructor(readonly value: string) {}
      
      [Equal.symbol](that: Equal.Equal): boolean {
        return that instanceof TestData && Equal.equals(this.value, that.value)
      }
      
      // Intentionally poor hash function to create collisions
      [Hash.symbol](): number {
        return this.value.length % 10 // Many collisions expected
      }
    }
    
    const testItems = Array.from({ length: 100 }, (_, i) => 
      new TestData(`item-${i.toString().padStart(3, '0')}`)
    )
    
    const { result: setSize, timeMs } = this.measureTime(() => {
      let set = HashSet.empty<TestData>()
      
      // Add all items (should handle collisions correctly)
      for (const item of testItems) {
        set = HashSet.add(set, item)
      }
      
      return HashSet.size(set)
    })
    
    console.log(`Set with hash collisions: ${setSize} items in ${timeMs.toFixed(2)}ms`)
    console.log('All items correctly stored despite hash collisions')
  }
}

// Usage demonstration
PerformanceBenchmark.compareEqualityPerformance()
PerformanceBenchmark.demonstrateHashCollisionHandling()
```

## Practical Patterns & Best Practices

### Pattern 1: Equal-Compatible Data Builders

Create builder patterns that maintain structural equality throughout the construction process:

```typescript
import { Equal, Data, HashMap, HashSet, pipe } from "effect"

// Immutable query builder with structural equality
interface DatabaseQuery {
  readonly table: string
  readonly select: string[]
  readonly where: Array<{ field: string; operator: string; value: unknown }>
  readonly orderBy: Array<{ field: string; direction: 'ASC' | 'DESC' }>
  readonly limit?: number
  readonly offset?: number
}

class QueryBuilder {
  private query: DatabaseQuery

  private constructor(query: DatabaseQuery) {
    this.query = query
  }

  static table(tableName: string): QueryBuilder {
    return new QueryBuilder({
      table: tableName,
      select: [],
      where: [],
      orderBy: []
    })
  }

  select(...fields: string[]): QueryBuilder {
    return new QueryBuilder({
      ...this.query,
      select: [...this.query.select, ...fields]
    })
  }

  where(field: string, operator: string, value: unknown): QueryBuilder {
    return new QueryBuilder({
      ...this.query,
      where: [...this.query.where, { field, operator, value }]
    })
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    return new QueryBuilder({
      ...this.query,
      orderBy: [...this.query.orderBy, { field, direction }]
    })
  }

  limit(count: number): QueryBuilder {
    return new QueryBuilder({
      ...this.query,
      limit: count
    })
  }

  offset(count: number): QueryBuilder {
    return new QueryBuilder({
      ...this.query,
      offset: count
    })
  }

  // Build with structural equality
  build() {
    return Data.struct({
      table: this.query.table,
      select: Data.array(this.query.select),
      where: Data.array(this.query.where.map(w => Data.struct({
        field: w.field,
        operator: w.operator,
        value: w.value
      }))),
      orderBy: Data.array(this.query.orderBy.map(o => Data.struct({
        field: o.field,
        direction: o.direction
      }))),
      limit: this.query.limit,
      offset: this.query.offset
    })
  }
}

// Query cache that uses structural equality for deduplication
class QueryCache {
  private cache = HashMap.empty<ReturnType<QueryBuilder['build']>, unknown>()
  private queryCount = HashMap.empty<ReturnType<QueryBuilder['build']>, number>()

  execute<T>(query: ReturnType<QueryBuilder['build']>, executor: () => T): T {
    // Check if we've seen this exact query before
    const cachedResult = HashMap.get(this.cache, query)
    const currentCount = HashMap.get(this.queryCount, query).pipe(
      option => option.pipe(Option.getOrElse(() => 0))
    )

    if (Option.isSome(cachedResult)) {
      console.log(`Cache hit for query (executed ${currentCount} times)`)
      this.queryCount = HashMap.set(this.queryCount, query, currentCount + 1)
      return cachedResult.value as T
    }

    console.log('Cache miss - executing query')
    const result = executor()
    this.cache = HashMap.set(this.cache, query, result)
    this.queryCount = HashMap.set(this.queryCount, query, 1)
    
    return result
  }

  getCacheStats() {
    return {
      totalQueries: HashMap.size(this.cache),
      totalExecutions: HashMap.reduce(this.queryCount, 0, (acc, count) => acc + count)
    }
  }
}

// Usage example
const demonstrateQueryBuilder = () => {
  console.log('=== Query Builder with Equal Demo ===')
  
  const cache = new QueryCache()
  
  // Build identical queries using different approaches
  const query1 = QueryBuilder
    .table('users')
    .select('id', 'name', 'email')
    .where('active', '=', true)
    .where('role', 'IN', ['admin', 'user'])
    .orderBy('name', 'ASC')
    .limit(10)
    .build()
  
  const query2 = QueryBuilder
    .table('users')
    .select('id')
    .select('name')
    .select('email')
    .where('active', '=', true)
    .where('role', 'IN', ['admin', 'user'])
    .orderBy('name', 'ASC')
    .limit(10)
    .build()
  
  // These queries are structurally equal despite different construction
  console.log('Queries are equal:', Equal.equals(query1, query2))
  
  // Execute queries - second should hit cache
  cache.execute(query1, () => {
    console.log('Executing query 1...')
    return [{ id: 1, name: 'Alice', email: 'alice@example.com' }]
  })
  
  cache.execute(query2, () => {
    console.log('Executing query 2...')
    return [{ id: 1, name: 'Alice', email: 'alice@example.com' }]
  })
  
  console.log('Cache stats:', cache.getCacheStats())
}

demonstrateQueryBuilder()
```

### Pattern 2: State Management with Equal

Use Equal for efficient state management and change detection:

```typescript
import { Equal, Data, pipe, Effect, Ref } from "effect"

// Application state with structural equality
interface AppState {
  readonly user: {
    readonly id: string
    readonly name: string
    readonly preferences: {
      readonly theme: 'light' | 'dark'
      readonly language: string
      readonly notifications: boolean
    }
  }
  readonly ui: {
    readonly activeView: string
    readonly sidebarOpen: boolean
    readonly loading: boolean
  }
  readonly data: {
    readonly items: Array<{ id: string; name: string; value: number }>
    readonly filters: Array<{ field: string; value: string }>
    readonly sortBy: string
  }
}

// Create state with structural equality
const createAppState = (state: AppState) => Data.struct({
  user: Data.struct({
    id: state.user.id,
    name: state.user.name,
    preferences: Data.struct({
      theme: state.user.preferences.theme,
      language: state.user.preferences.language,
      notifications: state.user.preferences.notifications
    })
  }),
  ui: Data.struct({
    activeView: state.ui.activeView,
    sidebarOpen: state.ui.sidebarOpen,
    loading: state.ui.loading
  }),
  data: Data.struct({
    items: Data.array(state.data.items.map(item => Data.struct({
      id: item.id,
      name: item.name,
      value: item.value
    }))),
    filters: Data.array(state.data.filters.map(filter => Data.struct({
      field: filter.field,
      value: filter.value
    }))),
    sortBy: state.data.sortBy
  })
})

type AppStateData = ReturnType<typeof createAppState>

// State manager with change tracking
class StateManager {
  private stateRef: Ref.Ref<AppStateData>
  private previousStates: AppStateData[] = []
  private changeListeners: Array<(newState: AppStateData, previousState: AppStateData) => void> = []

  constructor(initialState: AppState) {
    const initialStateData = createAppState(initialState)
    this.stateRef = Ref.unsafeMake(initialStateData)
    this.previousStates.push(initialStateData)
  }

  // Update state and track changes
  updateState(updater: (current: AppStateData) => AppState): Effect.Effect<AppStateData> {
    return Effect.gen(function* () {
      const currentState = yield* Ref.get(this.stateRef)
      const newState = createAppState(updater(currentState))
      
      // Only update if state actually changed
      if (!Equal.equals(currentState, newState)) {
        yield* Ref.set(this.stateRef, newState)
        
        this.previousStates.push(newState)
        if (this.previousStates.length > 10) {
          this.previousStates.shift() // Keep only last 10 states
        }
        
        // Notify listeners
        this.changeListeners.forEach(listener => {
          listener(newState, currentState)
        })
        
        console.log('State updated')
      } else {
        console.log('State unchanged - no update needed')
      }
      
      return newState
    }.bind(this))
  }

  // Get current state
  getCurrentState(): Effect.Effect<AppStateData> {
    return Ref.get(this.stateRef)
  }

  // Check if specific part of state changed
  hasPartChanged<K extends keyof AppStateData>(
    part: K,
    comparedTo?: AppStateData
  ): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const currentState = yield* Ref.get(this.stateRef)
      const compareState = comparedTo || this.previousStates[this.previousStates.length - 2]
      
      if (!compareState) {
        return true // First state, so consider it changed
      }
      
      return !Equal.equals(currentState[part], compareState[part])
    }.bind(this))
  }

  // Undo last change
  undo(): Effect.Effect<AppStateData> {
    return Effect.gen(function* () {
      if (this.previousStates.length < 2) {
        return yield* Ref.get(this.stateRef)
      }
      
      // Remove current state and restore previous
      this.previousStates.pop()
      const previousState = this.previousStates[this.previousStates.length - 1]
      
      yield* Ref.set(this.stateRef, previousState)
      console.log('State undone')
      
      return previousState
    }.bind(this))
  }

  // Subscribe to state changes
  onStateChange(listener: (newState: AppStateData, previousState: AppStateData) => void): () => void {
    this.changeListeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(listener)
      if (index > -1) {
        this.changeListeners.splice(index, 1)
      }
    }
  }

  getStateHistory(): AppStateData[] {
    return [...this.previousStates]
  }
}

// Memoized selectors using structural equality
class StateSelectors {
  private selectorCache = new Map<string, { state: AppStateData; result: unknown }>()

  // Memoized selector that only recalculates when relevant state changes
  createSelector<T>(
    name: string,
    selector: (state: AppStateData) => T,
    dependencies: Array<keyof AppStateData> = []
  ) {
    return (state: AppStateData): T => {
      const cached = this.selectorCache.get(name)
      
      if (cached) {
        // Check if any dependencies changed
        const dependenciesChanged = dependencies.length === 0 
          ? !Equal.equals(cached.state, state)
          : dependencies.some(dep => !Equal.equals(cached.state[dep], state[dep]))
        
        if (!dependenciesChanged) {
          console.log(`Selector '${name}' cache hit`)
          return cached.result as T
        }
      }
      
      console.log(`Selector '${name}' computing...`)
      const result = selector(state)
      this.selectorCache.set(name, { state, result })
      
      return result
    }
  }
}

// Usage example
const demonstrateStateManagement = async () => {
  console.log('=== State Management with Equal Demo ===')
  
  const initialState: AppState = {
    user: {
      id: 'user1',
      name: 'Alice',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    },
    ui: {
      activeView: 'dashboard',
      sidebarOpen: true,
      loading: false
    },
    data: {
      items: [
        { id: '1', name: 'Item 1', value: 100 },
        { id: '2', name: 'Item 2', value: 200 }
      ],
      filters: [],
      sortBy: 'name'
    }
  }
  
  const stateManager = new StateManager(initialState)
  const selectors = new StateSelectors()
  
  // Create memoized selectors
  const getUserName = selectors.createSelector(
    'userName',
    state => state.user.name,
    ['user']
  )
  
  const getVisibleItems = selectors.createSelector(
    'visibleItems',
    state => state.data.items.filter(item => 
      state.data.filters.every(filter => 
        item[filter.field as keyof typeof item]?.toString().includes(filter.value)
      )
    ),
    ['data']
  )
  
  // Subscribe to changes
  const unsubscribe = stateManager.onStateChange((newState, oldState) => {
    console.log('State changed detected')
  })
  
  // Test state updates
  console.log('Initial user name:', getUserName(await Effect.runPromise(stateManager.getCurrentState())))
  
  // Update user preferences (should trigger change)
  await Effect.runPromise(stateManager.updateState(state => ({
    ...state,
    user: {
      ...state.user,
      preferences: {
        ...state.user.preferences,
        theme: 'dark'
      }
    }
  })))
  
  // Try same update again (should not trigger change)
  await Effect.runPromise(stateManager.updateState(state => ({
    ...state,
    user: {
      ...state.user,
      preferences: {
        ...state.user.preferences,
        theme: 'dark'
      }
    }
  })))
  
  // Check if specific parts changed
  const userChanged = await Effect.runPromise(stateManager.hasPartChanged('user'))
  const uiChanged = await Effect.runPromise(stateManager.hasPartChanged('ui'))
  
  console.log('User part changed:', userChanged)
  console.log('UI part changed:', uiChanged)
  
  // Test selectors with cache
  const currentState = await Effect.runPromise(stateManager.getCurrentState())
  console.log('User name (first call):', getUserName(currentState))
  console.log('User name (cached call):', getUserName(currentState))
  
  // Undo last change
  await Effect.runPromise(stateManager.undo())
  console.log('State history length:', stateManager.getStateHistory().length)
  
  unsubscribe()
}

demonstrateStateManagement()
```

### Pattern 3: Data Validation with Equal

Implement validation systems that use structural equality for rule checking:

```typescript
import { Equal, Data, HashSet, pipe, Effect, Either } from "effect"

// Validation rule with structural equality
interface ValidationRule {
  readonly id: string
  readonly name: string
  readonly condition: {
    readonly field: string
    readonly operator: 'equals' | 'contains' | 'matches' | 'range'
    readonly value: unknown
  }
  readonly message: string
  readonly severity: 'error' | 'warning' | 'info'
}

const createValidationRule = (rule: ValidationRule) => Data.struct({
  id: rule.id,
  name: rule.name,
  condition: Data.struct({
    field: rule.condition.field,
    operator: rule.condition.operator,
    value: rule.condition.value
  }),
  message: rule.message,
  severity: rule.severity
})

type ValidationRuleData = ReturnType<typeof createValidationRule>

// Validation result
interface ValidationResult {
  readonly field: string
  readonly rule: ValidationRuleData
  readonly passed: boolean
  readonly message?: string
}

const createValidationResult = (result: ValidationResult) => Data.struct({
  field: result.field,
  rule: result.rule,
  passed: result.passed,
  message: result.message
})

type ValidationResultData = ReturnType<typeof createValidationResult>

// Form data validation system
class FormValidator {
  private rules = HashSet.empty<ValidationRuleData>()
  private rulesByField = new Map<string, ValidationRuleData[]>()
  private validationCache = new Map<string, ValidationResultData[]>()

  addRule(rule: ValidationRule): Effect.Effect<void> {
    return Effect.gen(function* () {
      const ruleData = createValidationRule(rule)
      
      // Only add if rule doesn't already exist (structural equality)
      if (!HashSet.has(this.rules, ruleData)) {
        this.rules = HashSet.add(this.rules, ruleData)
        
        // Index by field for efficient lookup
        const fieldRules = this.rulesByField.get(rule.condition.field) || []
        fieldRules.push(ruleData)
        this.rulesByField.set(rule.condition.field, fieldRules)
        
        console.log(`Added validation rule: ${rule.name}`)
      } else {
        console.log(`Rule already exists: ${rule.name}`)
      }
    }.bind(this))
  }

  removeRule(rule: ValidationRule): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const ruleData = createValidationRule(rule)
      const wasPresent = HashSet.has(this.rules, ruleData)
      
      if (wasPresent) {
        this.rules = HashSet.remove(this.rules, ruleData)
        
        // Remove from field index
        const fieldRules = this.rulesByField.get(rule.condition.field) || []
        const filteredRules = fieldRules.filter(r => !Equal.equals(r, ruleData))
        
        if (filteredRules.length === 0) {
          this.rulesByField.delete(rule.condition.field)
        } else {
          this.rulesByField.set(rule.condition.field, filteredRules)
        }
        
        // Clear related cache entries
        this.validationCache.clear()
        
        console.log(`Removed validation rule: ${rule.name}`)
      }
      
      return wasPresent
    }.bind(this))
  }

  validateField(fieldName: string, value: unknown): Effect.Effect<ValidationResultData[]> {
    return Effect.gen(function* () {
      // Create cache key based on field and value
      const cacheKey = `${fieldName}-${JSON.stringify(value)}`
      
      // Check cache first
      const cached = this.validationCache.get(cacheKey)
      if (cached) {
        console.log(`Validation cache hit for ${fieldName}`)
        return cached
      }
      
      const fieldRules = this.rulesByField.get(fieldName) || []
      const results: ValidationResultData[] = []
      
      for (const rule of fieldRules) {
        const passed = this.evaluateRule(rule, value)
        const result = createValidationResult({
          field: fieldName,
          rule,
          passed,
          message: passed ? undefined : rule.message
        })
        
        results.push(result)
      }
      
      // Cache results
      this.validationCache.set(cacheKey, results)
      console.log(`Validated field ${fieldName}`)
      
      return results
    }.bind(this))
  }

  validateObject(obj: Record<string, unknown>): Effect.Effect<{
    isValid: boolean
    results: ValidationResultData[]
    errors: ValidationResultData[]
    warnings: ValidationResultData[]
  }> {
    return Effect.gen(function* () {
      const allResults: ValidationResultData[] = []
      
      // Validate each field
      for (const [fieldName, value] of Object.entries(obj)) {
        const fieldResults = yield* this.validateField(fieldName, value)
        allResults.push(...fieldResults)
      }
      
      const errors = allResults.filter(r => !r.passed && r.rule.severity === 'error')
      const warnings = allResults.filter(r => !r.passed && r.rule.severity === 'warning')
      const isValid = errors.length === 0
      
      return {
        isValid,
        results: allResults,
        errors,
        warnings
      }
    }.bind(this))
  }

  private evaluateRule(rule: ValidationRuleData, value: unknown): boolean {
    const { operator, value: ruleValue } = rule.condition
    
    switch (operator) {
      case 'equals':
        return Equal.equals(value, ruleValue)
      
      case 'contains':
        if (typeof value === 'string' && typeof ruleValue === 'string') {
          return value.includes(ruleValue)
        }
        return false
      
      case 'matches':
        if (typeof value === 'string' && ruleValue instanceof RegExp) {
          return ruleValue.test(value)
        }
        return false
      
      case 'range':
        if (typeof value === 'number' && 
            typeof ruleValue === 'object' && 
            ruleValue !== null &&
            'min' in ruleValue && 'max' in ruleValue) {
          const range = ruleValue as { min: number; max: number }
          return value >= range.min && value <= range.max
        }
        return false
      
      default:
        return false
    }
  }

  getRuleStats() {
    return {
      totalRules: HashSet.size(this.rules),
      rulesByField: Object.fromEntries(
        Array.from(this.rulesByField.entries()).map(([field, rules]) => [field, rules.length])
      ),
      cacheSize: this.validationCache.size
    }
  }

  clearCache(): void {
    this.validationCache.clear()
    console.log('Validation cache cleared')
  }
}

// Validation rule builder with deduplication
class ValidationRuleBuilder {
  private rules: ValidationRule[] = []

  required(field: string, message?: string): ValidationRuleBuilder {
    this.rules.push({
      id: `required-${field}`,
      name: `Required: ${field}`,
      condition: {
        field,
        operator: 'equals',
        value: null
      },
      message: message || `${field} is required`,
      severity: 'error'
    })
    return this
  }

  email(field: string, message?: string): ValidationRuleBuilder {
    this.rules.push({
      id: `email-${field}`,
      name: `Email: ${field}`,
      condition: {
        field,
        operator: 'matches',
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      message: message || `${field} must be a valid email address`,
      severity: 'error'
    })
    return this
  }

  range(field: string, min: number, max: number, message?: string): ValidationRuleBuilder {
    this.rules.push({
      id: `range-${field}-${min}-${max}`,
      name: `Range: ${field}`,
      condition: {
        field,
        operator: 'range',
        value: { min, max }
      },
      message: message || `${field} must be between ${min} and ${max}`,
      severity: 'error'
    })
    return this
  }

  custom(id: string, field: string, condition: ValidationRule['condition'], message: string, severity: ValidationRule['severity'] = 'error'): ValidationRuleBuilder {
    this.rules.push({
      id,
      name: `Custom: ${field}`,
      condition,
      message,
      severity
    })
    return this
  }

  build(): ValidationRule[] {
    return [...this.rules]
  }
}

// Usage example
const demonstrateValidation = async () => {
  console.log('=== Form Validation with Equal Demo ===')
  
  const validator = new FormValidator()
  
  // Build validation rules
  const rules = new ValidationRuleBuilder()
    .required('name')
    .email('email')
    .range('age', 18, 100)
    .custom('password-strength', 'password', {
      field: 'password',
      operator: 'matches',
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    }, 'Password must be at least 8 characters with uppercase, lowercase, and number')
    .build()
  
  // Add rules to validator
  for (const rule of rules) {
    await Effect.runPromise(validator.addRule(rule))
  }
  
  // Try adding duplicate rule
  await Effect.runPromise(validator.addRule(rules[0]))
  
  console.log('Validator stats:', validator.getRuleStats())
  
  // Test form data
  const formData1 = {
    name: 'Alice',
    email: 'alice@example.com',
    age: 25,
    password: 'SecurePass123'
  }
  
  const formData2 = {
    name: '',
    email: 'invalid-email',
    age: 15,
    password: 'weak'
  }
  
  // Validate valid form
  const result1 = await Effect.runPromise(validator.validateObject(formData1))
  console.log('Valid form result:', result1.isValid)
  console.log('Errors:', result1.errors.length)
  
  // Validate invalid form
  const result2 = await Effect.runPromise(validator.validateObject(formData2))
  console.log('Invalid form result:', result2.isValid)
  console.log('Errors:', result2.errors.map(e => e.message))
  
  // Test field validation caching
  await Effect.runPromise(validator.validateField('email', 'alice@example.com'))
  await Effect.runPromise(validator.validateField('email', 'alice@example.com')) // Should hit cache
  
  console.log('Final validator stats:', validator.getRuleStats())
}

demonstrateValidation()
```

## Integration Examples

### Integration with Effect for Error Handling

Equal integrates seamlessly with Effect's error handling system for robust data processing:

```typescript
import { Equal, Data, Effect, pipe, HashMap, HashSet, Either, Option } from "effect"

// Custom errors with structural equality
class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string
  readonly value: unknown
  readonly expectedType: string
}> {}

class DuplicateError extends Data.TaggedError("DuplicateError")<{
  readonly entity: string
  readonly identifier: unknown
}> {}

class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly entity: string
  readonly identifier: unknown
}> {}

// Domain models with Equal implementation
interface User {
  readonly id: string
  readonly email: string
  readonly profile: {
    readonly firstName: string
    readonly lastName: string
    readonly age: number
  }
}

const createUser = (user: User) => Data.struct({
  id: user.id,
  email: user.email,
  profile: Data.struct({
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    age: user.profile.age
  })
})

type UserData = ReturnType<typeof createUser>

// Repository with Equal-based operations
class UserRepository {
  private users = HashMap.empty<string, UserData>()
  private usersByEmail = HashMap.empty<string, UserData>()
  private uniqueUsers = HashSet.empty<UserData>()

  // Add user with duplicate detection
  addUser(user: User): Effect.Effect<UserData, ValidationError | DuplicateError> {
    return Effect.gen(function* () {
      const userData = createUser(user)
      
      // Validate user data
      if (!user.email.includes('@')) {
        yield* new ValidationError({
          field: 'email',
          value: user.email,
          expectedType: 'valid email address'
        })
      }
      
      if (user.profile.age < 0 || user.profile.age > 150) {
        yield* new ValidationError({
          field: 'age',
          value: user.profile.age,
          expectedType: 'age between 0 and 150'
        })
      }
      
      // Check for duplicates using structural equality
      if (HashSet.has(this.uniqueUsers, userData)) {
        yield* new DuplicateError({
          entity: 'User',
          identifier: user.id
        })
      }
      
      // Check for email conflicts
      if (HashMap.has(this.usersByEmail, user.email)) {
        yield* new DuplicateError({
          entity: 'User',
          identifier: user.email
        })
      }
      
      // Store user
      this.users = HashMap.set(this.users, user.id, userData)
      this.usersByEmail = HashMap.set(this.usersByEmail, user.email, userData)
      this.uniqueUsers = HashSet.add(this.uniqueUsers, userData)
      
      console.log(`User added: ${user.email}`)
      return userData
    }.bind(this))
  }

  // Find user with proper error handling
  findUser(id: string): Effect.Effect<UserData, NotFoundError> {
    return Effect.gen(function* () {
      const user = HashMap.get(this.users, id)
      
      if (Option.isNone(user)) {
        yield* new NotFoundError({
          entity: 'User',
          identifier: id
        })
      }
      
      return user.value
    }.bind(this))
  }

  // Update user with change detection
  updateUser(id: string, updates: Partial<User>): Effect.Effect<UserData, NotFoundError | ValidationError> {
    return Effect.gen(function* () {
      const existingUser = yield* this.findUser(id)
      
      // Create updated user
      const updatedUserData = {
        id,
        email: updates.email || existingUser.email,
        profile: {
          firstName: updates.profile?.firstName || existingUser.profile.firstName,
          lastName: updates.profile?.lastName || existingUser.profile.lastName,
          age: updates.profile?.age || existingUser.profile.age
        }
      }
      
      const newUserData = createUser(updatedUserData)
      
      // Check if anything actually changed
      if (Equal.equals(existingUser, newUserData)) {
        console.log(`No changes detected for user ${id}`)
        return existingUser
      }
      
      // Validate updates
      if (updates.email && !updates.email.includes('@')) {
        yield* new ValidationError({
          field: 'email',
          value: updates.email,
          expectedType: 'valid email address'
        })
      }
      
      // Remove old data and add new
      this.users = HashMap.set(this.users, id, newUserData)
      this.uniqueUsers = HashSet.remove(this.uniqueUsers, existingUser)
      this.uniqueUsers = HashSet.add(this.uniqueUsers, newUserData)
      
      // Update email index if email changed
      if (updates.email && updates.email !== existingUser.email) {
        this.usersByEmail = HashMap.remove(this.usersByEmail, existingUser.email)
        this.usersByEmail = HashMap.set(this.usersByEmail, updates.email, newUserData)
      }
      
      console.log(`User updated: ${id}`)
      return newUserData
    }.bind(this))
  }

  // Batch operations with comprehensive error handling
  addUsers(users: User[]): Effect.Effect<UserData[], Array<ValidationError | DuplicateError>> {
    return Effect.gen(function* () {
      const results: UserData[] = []
      const errors: Array<ValidationError | DuplicateError> = []
      
      for (const user of users) {
        const result = yield* this.addUser(user).pipe(
          Effect.match({
            onFailure: (error) => {
              errors.push(error)
              return null
            },
            onSuccess: (userData) => userData
          })
        )
        
        if (result !== null) {
          results.push(result)
        }
      }
      
      if (errors.length > 0) {
        yield* Effect.fail(errors)
      }
      
      return results
    }.bind(this))
  }

  // Find similar users using structural equality
  findSimilarUsers(targetUser: UserData): Effect.Effect<UserData[]> {
    return Effect.gen(function* () {
      const similar: UserData[] = []
      
      HashMap.forEach(this.users, (user) => {
        // Same first name or same age range (within 5 years)
        const sameFirstName = Equal.equals(user.profile.firstName, targetUser.profile.firstName)
        const similarAge = Math.abs(user.profile.age - targetUser.profile.age) <= 5
        
        if ((sameFirstName || similarAge) && !Equal.equals(user.id, targetUser.id)) {
          similar.push(user)
        }
      })
      
      return similar
    }.bind(this))
  }

  getStats() {
    return {
      totalUsers: HashMap.size(this.users),
      uniqueUsers: HashSet.size(this.uniqueUsers),
      emailIndex: HashMap.size(this.usersByEmail)
    }
  }
}

// Service layer with comprehensive error handling
class UserService {
  constructor(private repository: UserRepository) {}

  registerUser(userData: User): Effect.Effect<UserData, string> {
    return this.repository.addUser(userData).pipe(
      Effect.mapError((error) => {
        if (error._tag === 'ValidationError') {
          return `Validation failed: ${error.field} - ${error.expectedType}`
        }
        if (error._tag === 'DuplicateError') {
          return `Duplicate ${error.entity} found: ${error.identifier}`
        }
        return 'Unknown error occurred'
      }),
      Effect.tap((user) => 
        Effect.log(`User registered successfully: ${user.email}`)
      )
    )
  }

  getUserProfile(userId: string): Effect.Effect<UserData, string> {
    return this.repository.findUser(userId).pipe(
      Effect.mapError((error) => {
        if (error._tag === 'NotFoundError') {
          return `User not found: ${error.identifier}`
        }
        return 'Unknown error occurred'
      })
    )
  }

  updateUserProfile(userId: string, updates: Partial<User>): Effect.Effect<UserData, string> {
    return this.repository.updateUser(userId, updates).pipe(
      Effect.mapError((error) => {
        if (error._tag === 'NotFoundError') {
          return `User not found: ${error.identifier}`
        }
        if (error._tag === 'ValidationError') {
          return `Validation failed: ${error.field} - ${error.expectedType}`
        }
        return 'Unknown error occurred'
      })
    )
  }

  bulkRegisterUsers(users: User[]): Effect.Effect<{
    successful: UserData[]
    failed: Array<{ user: User; error: string }>
  }, never> {
    return Effect.gen(function* () {
      const successful: UserData[] = []
      const failed: Array<{ user: User; error: string }> = []
      
      for (const user of users) {
        const result = yield* this.registerUser(user).pipe(
          Effect.match({
            onFailure: (error) => ({ type: 'error' as const, error }),
            onSuccess: (userData) => ({ type: 'success' as const, userData })
          })
        )
        
        if (result.type === 'success') {
          successful.push(result.userData)
        } else {
          failed.push({ user, error: result.error })
        }
      }
      
      return { successful, failed }
    }.bind(this))
  }

  findUserConnections(userId: string): Effect.Effect<UserData[], string> {
    return Effect.gen(function* () {
      const user = yield* this.getUserProfile(userId)
      const similar = yield* this.repository.findSimilarUsers(user)
      
      return similar
    }.bind(this))
  }
}

// Usage example
const demonstrateEffectIntegration = async () => {
  console.log('=== Effect Integration Demo ===')
  
  const repository = new UserRepository()
  const userService = new UserService(repository)
  
  const testUsers: User[] = [
    {
      id: 'u1',
      email: 'alice@example.com',
      profile: { firstName: 'Alice', lastName: 'Johnson', age: 25 }
    },
    {
      id: 'u2', 
      email: 'bob@example.com',
      profile: { firstName: 'Bob', lastName: 'Smith', age: 30 }
    },
    {
      id: 'u3',
      email: 'invalid-email', // Invalid email
      profile: { firstName: 'Charlie', lastName: 'Brown', age: 28 }
    },
    {
      id: 'u1', // Duplicate ID
      email: 'alice2@example.com',
      profile: { firstName: 'Alice', lastName: 'Wilson', age: 26 }
    }
  ]
  
  // Test bulk registration with error handling
  const bulkResult = await Effect.runPromise(userService.bulkRegisterUsers(testUsers))
  
  console.log(`Successfully registered: ${bulkResult.successful.length} users`)
  console.log(`Failed to register: ${bulkResult.failed.length} users`)
  
  bulkResult.failed.forEach(({ user, error }) => {
    console.log(`  Failed: ${user.email} - ${error}`)
  })
  
  // Test individual operations
  try {
    const user = await Effect.runPromise(userService.getUserProfile('u1'))
    console.log(`Found user: ${user.email}`)
    
    // Update user
    const updated = await Effect.runPromise(userService.updateUserProfile('u1', {
      profile: { ...user.profile, age: 26 }
    }))
    console.log(`Updated user age to: ${updated.profile.age}`)
    
    // Try same update again (should detect no change)
    await Effect.runPromise(userService.updateUserProfile('u1', {
      profile: { ...updated.profile, age: 26 }
    }))
    
    // Find connections
    const connections = await Effect.runPromise(userService.findUserConnections('u1'))
    console.log(`Found ${connections.length} connections for user u1`)
    
  } catch (error) {
    console.log('Error occurred:', error)
  }
  
  // Show repository stats
  console.log('Repository stats:', repository.getStats())
}

demonstrateEffectIntegration()
```

### Testing Strategies for Equal-Based Code

Comprehensive testing patterns for applications using Equal:

```typescript
import { Equal, Data, HashMap, HashSet, pipe, Effect } from "effect"
import { describe, it, expect } from "vitest"

// Test data factories with structural equality
const createTestUser = (overrides: Partial<{
  id: string
  name: string
  email: string
  age: number
}> = {}) => Data.struct({
  id: overrides.id || 'test-user-1',
  name: overrides.name || 'Test User',
  email: overrides.email || 'test@example.com',
  age: overrides.age || 25
})

const createTestProduct = (overrides: Partial<{
  id: string
  name: string
  price: number
  category: string
}> = {}) => Data.struct({
  id: overrides.id || 'test-product-1',
  name: overrides.name || 'Test Product',
  price: overrides.price || 99.99,
  category: overrides.category || 'Test Category'
})

// Test utilities for Equal-based assertions
class EqualTestUtils {
  // Assert structural equality with detailed error messages
  static assertStructurallyEqual<T>(actual: T, expected: T, message?: string): void {
    if (!Equal.equals(actual, expected)) {
      const actualStr = JSON.stringify(actual, null, 2)
      const expectedStr = JSON.stringify(expected, null, 2)
      throw new Error(
        `${message || 'Values are not structurally equal'}\n` +
        `Expected: ${expectedStr}\n` +
        `Actual: ${actualStr}`
      )
    }
  }

  // Assert HashSet equality
  static assertHashSetEqual<T>(actual: HashSet.HashSet<T>, expected: HashSet.HashSet<T>): void {
    if (HashSet.size(actual) !== HashSet.size(expected)) {
      throw new Error(`HashSet sizes differ: actual ${HashSet.size(actual)}, expected ${HashSet.size(expected)}`)
    }
    
    const actualArray: T[] = []
    const expectedArray: T[] = []
    
    HashSet.forEach(actual, item => actualArray.push(item))
    HashSet.forEach(expected, item => expectedArray.push(item))
    
    // Check if all items in actual are in expected
    for (const item of actualArray) {
      if (!HashSet.has(expected, item)) {
        throw new Error(`Item not found in expected HashSet: ${JSON.stringify(item)}`)
      }
    }
  }

  // Assert HashMap equality
  static assertHashMapEqual<K, V>(
    actual: HashMap.HashMap<K, V>, 
    expected: HashMap.HashMap<K, V>
  ): void {
    if (HashMap.size(actual) !== HashMap.size(expected)) {
      throw new Error(`HashMap sizes differ: actual ${HashMap.size(actual)}, expected ${HashMap.size(expected)}`)
    }
    
    HashMap.forEach(expected, (value, key) => {
      const actualValue = HashMap.get(actual, key)
      if (Option.isNone(actualValue)) {
        throw new Error(`Key not found in actual HashMap: ${JSON.stringify(key)}`)
      }
      
      if (!Equal.equals(actualValue.value, value)) {
        throw new Error(
          `Values differ for key ${JSON.stringify(key)}: ` +
          `actual ${JSON.stringify(actualValue.value)}, expected ${JSON.stringify(value)}`
        )
      }
    })
  }

  // Create test data with known structural equality
  static createEqualTestData<T>(factory: () => T, count: number = 2): T[] {
    const items: T[] = []
    const template = factory()
    
    for (let i = 0; i < count; i++) {
      items.push(template)
    }
    
    return items
  }

  // Create test data with slight variations
  static createSimilarTestData<T extends Record<string, any>>(
    factory: () => T,
    variations: Array<Partial<T>>
  ): T[] {
    return variations.map(variation => ({ ...factory(), ...variation }))
  }
}

// Example service to test
class UserService {
  private users = HashMap.empty<string, ReturnType<typeof createTestUser>>()
  private uniqueUsers = HashSet.empty<ReturnType<typeof createTestUser>>()

  addUser(user: ReturnType<typeof createTestUser>): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const isNew = !HashSet.has(this.uniqueUsers, user)
      
      if (isNew) {
        this.users = HashMap.set(this.users, user.id, user)
        this.uniqueUsers = HashSet.add(this.uniqueUsers, user)
      }
      
      return isNew
    }.bind(this))
  }

  getUser(id: string): Option.Option<ReturnType<typeof createTestUser>> {
    return HashMap.get(this.users, id)
  }

  getAllUsers(): ReturnType<typeof createTestUser>[] {
    const users: ReturnType<typeof createTestUser>[] = []
    HashMap.forEach(this.users, user => users.push(user))
    return users
  }

  getUserCount(): number {
    return HashMap.size(this.users)
  }

  getUniqueUserCount(): number {
    return HashSet.size(this.uniqueUsers)
  }
}

// Test suites demonstrating Equal testing patterns
describe('Equal-based Service Testing', () => {
  describe('UserService with structural equality', () => {
    it('should handle duplicate users correctly using structural equality', async () => {
      const service = new UserService()
      
      // Create structurally identical users
      const user1 = createTestUser({ id: 'u1', name: 'Alice' })
      const user2 = createTestUser({ id: 'u1', name: 'Alice' }) // Structurally identical
      const user3 = createTestUser({ id: 'u1', name: 'Bob' })   // Different content
      
      // Verify structural equality
      EqualTestUtils.assertStructurallyEqual(user1, user2, 'user1 and user2 should be structurally equal')
      
      // Add users and test deduplication
      const result1 = await Effect.runPromise(service.addUser(user1))
      const result2 = await Effect.runPromise(service.addUser(user2)) // Should be rejected as duplicate
      const result3 = await Effect.runPromise(service.addUser(user3))
      
      expect(result1).toBe(true)  // First user added
      expect(result2).toBe(false) // Duplicate rejected
      expect(result3).toBe(true)  // Different user added
      
      expect(service.getUserCount()).toBe(2)        // Only 2 users stored
      expect(service.getUniqueUserCount()).toBe(2)  // Only 2 unique users
    })

    it('should maintain referential integrity in collections', async () => {
      const service = new UserService()
      
      const users = [
        createTestUser({ id: 'u1', name: 'Alice', age: 25 }),
        createTestUser({ id: 'u2', name: 'Bob', age: 30 }),
        createTestUser({ id: 'u3', name: 'Charlie', age: 35 })
      ]
      
      // Add all users
      for (const user of users) {
        await Effect.runPromise(service.addUser(user))
      }
      
      // Verify all users are stored
      expect(service.getUserCount()).toBe(3)
      
      // Verify we can retrieve structurally equal users
      const retrievedUser1 = service.getUser('u1')
      const expectedUser1 = createTestUser({ id: 'u1', name: 'Alice', age: 25 })
      
      expect(Option.isSome(retrievedUser1)).toBe(true)
      if (Option.isSome(retrievedUser1)) {
        EqualTestUtils.assertStructurallyEqual(
          retrievedUser1.value, 
          expectedUser1,
          'Retrieved user should be structurally equal to expected'
        )
      }
    })

    it('should handle batch operations with mixed duplicate detection', async () => {
      const service = new UserService()
      
      // Create test data with some duplicates
      const testUsers = [
        createTestUser({ id: 'u1', name: 'Alice' }),
        createTestUser({ id: 'u2', name: 'Bob' }),
        createTestUser({ id: 'u1', name: 'Alice' }), // Duplicate
        createTestUser({ id: 'u3', name: 'Charlie' }),
        createTestUser({ id: 'u2', name: 'Bob' })   // Duplicate
      ]
      
      const results: boolean[] = []
      for (const user of testUsers) {
        const result = await Effect.runPromise(service.addUser(user))
        results.push(result)
      }
      
      // Verify results: true, true, false, true, false
      expect(results).toEqual([true, true, false, true, false])
      expect(service.getUserCount()).toBe(3)      // Only 3 unique users
      expect(service.getUniqueUserCount()).toBe(3)
    })
  })

  describe('Collection equality testing', () => {
    it('should test HashSet operations with structural equality', () => {
      const user1 = createTestUser({ id: 'u1', name: 'Alice' })
      const user2 = createTestUser({ id: 'u1', name: 'Alice' }) // Structurally equal
      const user3 = createTestUser({ id: 'u2', name: 'Bob' })
      
      const set1 = HashSet.empty<ReturnType<typeof createTestUser>>().pipe(
        HashSet.add(user1),
        HashSet.add(user2), // Should not increase size
        HashSet.add(user3)
      )
      
      const expectedSet = HashSet.empty<ReturnType<typeof createTestUser>>().pipe(
        HashSet.add(user1),
        HashSet.add(user3)
      )
      
      EqualTestUtils.assertHashSetEqual(set1, expectedSet)
      expect(HashSet.size(set1)).toBe(2)
    })

    it('should test HashMap operations with structural keys', () => {
      const key1 = createTestProduct({ id: 'p1', name: 'Product 1' })
      const key2 = createTestProduct({ id: 'p1', name: 'Product 1' }) // Structurally equal key
      const key3 = createTestProduct({ id: 'p2', name: 'Product 2' })
      
      const map = HashMap.empty<ReturnType<typeof createTestProduct>, string>().pipe(
        HashMap.set(key1, 'value1'),
        HashMap.set(key2, 'value2'), // Should overwrite due to structural equality
        HashMap.set(key3, 'value3')
      )
      
      expect(HashMap.size(map)).toBe(2)
      
      // Test key lookup with structurally equal key
      const lookupKey = createTestProduct({ id: 'p1', name: 'Product 1' })
      const value = HashMap.get(map, lookupKey)
      
      expect(Option.isSome(value)).toBe(true)
      if (Option.isSome(value)) {
        expect(value.value).toBe('value2')
      }
    })
  })

  describe('Property-based testing with Equal', () => {
    it('should satisfy Equal properties', () => {
      // Reflexivity: a equals a
      const user = createTestUser()
      expect(Equal.equals(user, user)).toBe(true)
      
      // Symmetry: if a equals b, then b equals a
      const user1 = createTestUser({ id: 'u1', name: 'Alice' })
      const user2 = createTestUser({ id: 'u1', name: 'Alice' })
      
      expect(Equal.equals(user1, user2)).toBe(Equal.equals(user2, user1))
      
      // Transitivity: if a equals b and b equals c, then a equals c
      const user3 = createTestUser({ id: 'u1', name: 'Alice' })
      
      if (Equal.equals(user1, user2) && Equal.equals(user2, user3)) {
        expect(Equal.equals(user1, user3)).toBe(true)
      }
    })

    it('should maintain consistency across operations', () => {
      const users = EqualTestUtils.createEqualTestData(() => 
        createTestUser({ id: 'consistent', name: 'Test' }), 5
      )
      
      // All users should be structurally equal
      for (let i = 0; i < users.length - 1; i++) {
        EqualTestUtils.assertStructurallyEqual(users[i], users[i + 1])
      }
      
      // HashSet should contain only one unique item
      let set = HashSet.empty<ReturnType<typeof createTestUser>>()
      for (const user of users) {
        set = HashSet.add(set, user)
      }
      
      expect(HashSet.size(set)).toBe(1)
    })
  })

  describe('Edge cases and error conditions', () => {
    it('should handle empty collections correctly', () => {
      const emptySet1 = HashSet.empty<ReturnType<typeof createTestUser>>()
      const emptySet2 = HashSet.empty<ReturnType<typeof createTestUser>>()
      
      EqualTestUtils.assertHashSetEqual(emptySet1, emptySet2)
      
      const emptyMap1 = HashMap.empty<string, ReturnType<typeof createTestUser>>()
      const emptyMap2 = HashMap.empty<string, ReturnType<typeof createTestUser>>()
      
      EqualTestUtils.assertHashMapEqual(emptyMap1, emptyMap2)
    })

    it('should handle null and undefined values in structures', () => {
      const userWithNulls = Data.struct({
        id: 'u1',
        name: 'Alice',
        email: null,
        metadata: undefined
      })
      
      const userWithNulls2 = Data.struct({
        id: 'u1', 
        name: 'Alice',
        email: null,
        metadata: undefined
      })
      
      EqualTestUtils.assertStructurallyEqual(userWithNulls, userWithNulls2)
    })

    it('should handle deeply nested structures', () => {
      const deepStructure1 = Data.struct({
        level1: Data.struct({
          level2: Data.struct({
            level3: Data.struct({
              value: 'deep'
            })
          })
        })
      })
      
      const deepStructure2 = Data.struct({
        level1: Data.struct({
          level2: Data.struct({
            level3: Data.struct({
              value: 'deep'
            })
          })
        })
      })
      
      EqualTestUtils.assertStructurallyEqual(deepStructure1, deepStructure2)
    })
  })
})

// Mock and test double strategies
class MockDataFactory {
  static createMockUsers(count: number): ReturnType<typeof createTestUser>[] {
    return Array.from({ length: count }, (_, i) => 
      createTestUser({
        id: `mock-user-${i}`,
        name: `Mock User ${i}`,
        email: `mock${i}@example.com`,
        age: 20 + (i % 50)
      })
    )
  }

  static createMockProductCatalog(): HashMap.HashMap<string, ReturnType<typeof createTestProduct>> {
    const products = [
      createTestProduct({ id: 'p1', name: 'Laptop', price: 999.99, category: 'Electronics' }),
      createTestProduct({ id: 'p2', name: 'Book', price: 19.99, category: 'Education' }),
      createTestProduct({ id: 'p3', name: 'Coffee Mug', price: 12.99, category: 'Kitchen' })
    ]
    
    let catalog = HashMap.empty<string, ReturnType<typeof createTestProduct>>()
    for (const product of products) {
      catalog = HashMap.set(catalog, product.id, product)
    }
    
    return catalog
  }
}

// Integration test example
describe('Equal Integration Tests', () => {
  it('should integrate Equal with Effect for comprehensive testing', async () => {
    const service = new UserService()
    
    // Create test scenario
    const mockUsers = MockDataFactory.createMockUsers(100)
    const duplicateUsers = mockUsers.slice(0, 10) // Create some duplicates
    
    // Add all users including duplicates
    const results: boolean[] = []
    for (const user of [...mockUsers, ...duplicateUsers]) {
      const result = await Effect.runPromise(service.addUser(user))
      results.push(result)
    }
    
    // Verify correct number of users added
    const successCount = results.filter(r => r).length
    expect(successCount).toBe(100) // Only original users should be added
    expect(service.getUserCount()).toBe(100)
    expect(service.getUniqueUserCount()).toBe(100)
    
    // Verify all original users can be retrieved
    for (let i = 0; i < 100; i++) {
      const user = service.getUser(`mock-user-${i}`)
      expect(Option.isSome(user)).toBe(true)
    }
  })
})
```

## Conclusion

Equal provides **structural equality comparison**, **efficient collection operations**, and **seamless integration** with Effect's type system for building robust, predictable applications.

Key benefits:
- **Eliminates reference-based equality issues** - Compare data by content, not memory location
- **Optimized collection performance** - HashSet and HashMap leverage structural equality for deduplication and efficient lookups
- **Composable equality logic** - Custom Equal implementations integrate seamlessly with Effect's ecosystem
- **Type-safe data operations** - Structural equality works with Effect's type system to prevent runtime errors

Use Equal when you need to compare complex data structures, deduplicate data in collections, implement caching systems, or build applications where data identity is determined by content rather than object references. It transforms potentially error-prone equality comparisons into reliable, performant operations that scale with your application's complexity.