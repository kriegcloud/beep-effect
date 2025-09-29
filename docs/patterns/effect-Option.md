# Option: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

Option is Effect's solution for handling **optional values safely**, eliminating the notorious "null pointer exception" and making your code more predictable and maintainable.

### The Problem Option Solves

Consider common scenarios where values might be absent:

```typescript
// Traditional approach - null/undefined everywhere
interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string  // Optional field
  lastLoginAt?: Date
}

function getUserProfile(userId: string): UserProfile | null {
  const user = database.findUser(userId)
  if (!user) return null
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || undefined,  // Null checks everywhere
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
  }
}

function getAvatarUrl(profile: UserProfile | null): string {
  if (!profile) return "/default-avatar.png"
  if (!profile.avatar) return "/default-avatar.png"
  return profile.avatar
}

// Usage requires constant null checking
const profile = getUserProfile("123")
if (profile) {
  if (profile.lastLoginAt) {
    console.log(`Last login: ${profile.lastLoginAt.toISOString()}`)
  }
  const avatarUrl = getAvatarUrl(profile)
  // More null checks...
}
```

This approach leads to:
- **Null pointer exceptions** - forgetting null checks crashes your application  
- **Defensive programming** - excessive null checking clutters code
- **Type uncertainty** - unclear when values can be null/undefined
- **Runtime errors** - type system doesn't prevent accessing null values

### The Option Solution

Option represents values that may or may not exist using a type-safe container:

```typescript
import * as O from "effect/Option";

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: O.Option<string>     // Explicitly optional
  lastLoginAt: O.Option<Date>
}

function getUserProfile(userId: string): O.Option<UserProfile> {
  const user = database.findUser(userId)
  
  return O.fromNullable(user).pipe(
    O.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: O.fromNullable(user.avatar),
      lastLoginAt: O.map(O.fromNullable(user.lastLoginAt), timestamp => new Date(timestamp))
    }))
  )
}

function getAvatarUrl(profile: UserProfile): string {
  return O.getOrElse(profile.avatar, () => "/default-avatar.png")
}

// Usage is safe and composable
const profile = getUserProfile("123")
O.match(profile, {
  onNone: () => console.log("User not found"),
  onSome: (profile) => {
    O.match(profile.lastLoginAt, {
      onNone: () => console.log("Never logged in"),
      onSome: (date) => console.log(`Last login: ${date.toISOString()}`)
    })
    
    const avatarUrl = getAvatarUrl(profile)
    console.log(`Avatar: ${avatarUrl}`)
  }
})
```

### Key Concepts

**Some**: An Option containing a value - `O.some(42)`

**None**: An Option containing no value - `O.none()`

**Type Safety**: The compiler prevents accessing values without checking if they exist

## Basic Usage Patterns

### Pattern 1: Creating Options

```typescript
import { Option as O } from "effect"

// From a value that might be null/undefined
const maybeUser = O.fromNullable(database.getUser("123"))

// From a predicate
const evenNumber = O.liftPredicate((n: number) => n % 2 === 0)(42)
// Result: O.some(42)

const oddNumber = O.liftPredicate((n: number) => n % 2 === 0)(41)  
// Result: O.none()

// Directly creating Options
const someValue = O.some("hello")
const noValue = O.none()

// From array operations
const firstItem = O.fromNullable([1, 2, 3][0])  // O.some(1)
const missingItem = O.fromNullable([][0])       // O.none()
```

### Pattern 2: Extracting Values Safely

```typescript
// Using getOrElse for defaults
const username = O.getOrElse(maybeUser, () => "Anonymous")

// Using match for pattern matching
const message = O.match(maybeUser, {
  onNone: () => "No user found",
  onSome: (user) => `Hello, ${user.name}!`
})

// Using isSome/isNone for type guards
if (O.isSome(maybeUser)) {
  // TypeScript knows maybeUser.value is safe to access
  console.log(maybeUser.value.name)
}
```

### Pattern 3: Transforming Optional Values

```typescript
// Using map to transform the value inside Option
const maybeUppercaseName = O.map(maybeUser, user => user.name.toUpperCase())

// Using flatMap for chaining Operations that return Options
const maybeUserSettings = O.flatMap(maybeUser, user => 
  O.fromNullable(user.settings)
)

// Using filter to add conditions
const maybeAdminUser = O.filter(maybeUser, user => user.role === "admin")
```

## Real-World Examples

### Example 1: User Profile Management

Let's build a complete user profile system that handles optional data gracefully:

```typescript
import { Option as O, pipe } from "effect"

interface User {
  id: string
  email: string
  profile: O.Option<UserProfile>
}

interface UserProfile {
  displayName: string
  bio: O.Option<string>
  avatar: O.Option<string>
  socialLinks: {
    twitter: O.Option<string>
    github: O.Option<string>
    website: O.Option<string>
  }
  preferences: UserPreferences
}

interface UserPreferences {
  theme: "light" | "dark"
  emailNotifications: boolean
  language: string
}

// Simulate database operations
const users: User[] = [
  {
    id: "1",
    email: "john@example.com", 
    profile: O.some({
      displayName: "John Doe",
      bio: O.some("Software developer passionate about functional programming"),
      avatar: O.some("/avatars/john.jpg"),
      socialLinks: {
        twitter: O.some("@johndoe"),
        github: O.some("johndoe"),
        website: O.none()
      },
      preferences: {
        theme: "dark",
        emailNotifications: true,
        language: "en"
      }
    })
  },
  {
    id: "2", 
    email: "jane@example.com",
    profile: O.none()  // User hasn't set up profile yet
  }
]

// Helper functions for user operations
const findUser = (id: string): O.Option<User> =>
  O.fromNullable(users.find(user => user.id === id))

const getUserDisplayName = (user: User): Effect.Effect<string> =>
  Effect.gen(function* () {
    if (O.isSome(user.profile)) {
      return user.profile.value.displayName
    }
    return user.email.split("@")[0]
  })

const getUserBio = (user: User): Effect.Effect<O.Option<string>> =>
  Effect.gen(function* () {
    if (O.isSome(user.profile)) {
      return user.profile.value.bio
    }
    return O.none()
  })

const getUserAvatar = (user: User): Effect.Effect<string> =>
  Effect.gen(function* () {
    if (O.isSome(user.profile) && O.isSome(user.profile.value.avatar)) {
      return user.profile.value.avatar.value
    }
    return "/default-avatar.png"
  })

const getSocialLink = (user: User, platform: keyof UserProfile["socialLinks"]): Effect.Effect<O.Option<string>> =>
  Effect.gen(function* () {
    if (O.isSome(user.profile)) {
      return user.profile.value.socialLinks[platform]
    }
    return O.none()
  })

// Usage examples
const renderUserCard = (userId: string): string => {
  return pipe(
    O.match(findUser(userId), {
      onNone: () => "User not found",
      onSome: (user) => {
        const displayName = getUserDisplayName(user)
        const avatar = getUserAvatar(user)
        const bio = O.getOrElse(getUserBio(user), () => "No bio available")
        
        const twitterLink = getSocialLink(user, "twitter").pipe(
          O.map(handle => `https://twitter.com/${handle}`),
          O.getOrElse(() => "")
        )
        
        return `
          <div class="user-card">
            <img src="${avatar}" alt="${displayName}" />
            <h3>${displayName}</h3>
            <p>${bio}</p>
            ${twitterLink ? `<a href="${twitterLink}">Twitter</a>` : ""}
          </div>
        `
      }
    })
  )
}

// Batch operations with Options
const getUsersWithProfiles = (): User[] =>
  users.filter(user => O.isSome(user.profile))

const getUsersWithBios = (): User[] =>
  users.filter(user => 
    user.profile.pipe(
      O.flatMap(profile => profile.bio),
      O.isSome
    )
  )

console.log(renderUserCard("1"))  // Full profile
console.log(renderUserCard("2"))  // Minimal profile  
console.log(renderUserCard("999")) // User not found
```

### Example 2: Search and Filtering Operations

Building a flexible search system that handles missing or partial data:

```typescript
import { Option as O, Array, pipe } from "effect"

interface Product {
  id: string
  name: string
  description: O.Option<string>
  price: number
  category: string
  tags: string[]
  rating: O.Option<number>
  reviewCount: number
  inStock: boolean
  supplier: O.Option<Supplier>
}

interface Supplier {
  id: string
  name: string
  location: O.Option<string>
  rating: number
}

interface SearchFilters {
  query: O.Option<string>
  category: O.Option<string>
  minPrice: O.Option<number>
  maxPrice: O.Option<number>
  minRating: O.Option<number>
  inStockOnly: boolean
  hasSupplier: O.Option<boolean>
}

// Sample product data
const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: O.some("High-quality wireless headphones with noise cancellation"),
    price: 299.99,
    category: "Electronics",
    tags: ["audio", "wireless", "noise-cancelling"],
    rating: O.some(4.5),
    reviewCount: 127,
    inStock: true,
    supplier: O.some({
      id: "sup1",
      name: "AudioTech Inc",
      location: O.some("California, USA"),
      rating: 4.8
    })
  },
  {
    id: "2", 
    name: "Coffee Mug",
    description: O.none(),
    price: 15.99,
    category: "Kitchen",
    tags: ["ceramic", "dishwasher-safe"],
    rating: O.none(), // No ratings yet
    reviewCount: 0,
    inStock: true,
    supplier: O.none()
  },
  {
    id: "3",
    name: "Gaming Laptop",
    description: O.some("High-performance gaming laptop with RTX graphics"),
    price: 1299.99,
    category: "Electronics", 
    tags: ["gaming", "laptop", "high-performance"],
    rating: O.some(4.2),
    reviewCount: 89,
    inStock: false,
    supplier: O.some({
      id: "sup2",
      name: "GameTech Corp",
      location: O.none(),
      rating: 4.3
    })
  }
]

// Search helper functions
const matchesQuery = (product: Product, query: string): boolean => {
  const searchText = query.toLowerCase()
  const nameMatch = product.name.toLowerCase().includes(searchText)
  const tagMatch = product.tags.some(tag => tag.toLowerCase().includes(searchText))
  const descriptionMatch = product.description.pipe(
    O.map(desc => desc.toLowerCase().includes(searchText)),
    O.getOrElse(() => false)
  )
  
  return nameMatch || tagMatch || descriptionMatch
}

const matchesPriceRange = (
  product: Product, 
  minPrice: O.Option<number>, 
  maxPrice: O.Option<number>
): boolean => {
  const minCheck = O.match(minPrice, {
    onNone: () => true,
    onSome: (min) => product.price >= min
  })
  
  const maxCheck = O.match(maxPrice, {
    onNone: () => true, 
    onSome: (max) => product.price <= max
  })
  
  return minCheck && maxCheck
}

const hasMinimumRating = (product: Product, minRating: O.Option<number>): boolean =>
  O.match(minRating, {
    onNone: () => true,
    onSome: (min) => product.rating.pipe(
      O.map(rating => rating >= min),
      O.getOrElse(() => false)
    )
  })

// Main search function
const searchProducts = (filters: SearchFilters): Product[] => {
  return products.filter(product => {
    // Text search
    const queryMatch = O.match(filters.query, {
      onNone: () => true,
      onSome: (query) => matchesQuery(product, query)
    })
    
    // Category filter
    const categoryMatch = O.match(filters.category, {
      onNone: () => true,
      onSome: (category) => product.category === category
    })
    
    // Price range
    const priceMatch = matchesPriceRange(product, filters.minPrice, filters.maxPrice)
    
    // Rating filter
    const ratingMatch = hasMinimumRating(product, filters.minRating)
    
    // Stock filter
    const stockMatch = !filters.inStockOnly || product.inStock
    
    // Supplier filter
    const supplierMatch = O.match(filters.hasSupplier, {
      onNone: () => true,
      onSome: (shouldHaveSupplier) => 
        shouldHaveSupplier ? O.isSome(product.supplier) : O.isNone(product.supplier)
    })
    
    return queryMatch && categoryMatch && priceMatch && ratingMatch && stockMatch && supplierMatch
  })
}

// Advanced search operations
const getProductsBySupplierLocation = (location: string): Product[] =>
  products.filter(product =>
    product.supplier.pipe(
      O.flatMap(supplier => supplier.location),
      O.map(loc => loc.toLowerCase().includes(location.toLowerCase())),
      O.getOrElse(() => false)
    )
  )

const getTopRatedProducts = (minRating: number = 4.0): Product[] =>
  products.filter(product =>
    product.rating.pipe(
      O.map(rating => rating >= minRating),
      O.getOrElse(() => false)
    )
  )

const getProductsWithoutDescription = (): Product[] =>
  products.filter(product => O.isNone(product.description))

// Usage examples
const searchResults1 = searchProducts({
  query: O.some("wireless"),
  category: O.none(),
  minPrice: O.none(),
  maxPrice: O.some(500),
  minRating: O.some(4.0),
  inStockOnly: true,
  hasSupplier: O.some(true)
})

const searchResults2 = searchProducts({
  query: O.none(),
  category: O.some("Electronics"),
  minPrice: O.some(100),
  maxPrice: O.none(),
  minRating: O.none(),
  inStockOnly: false,
  hasSupplier: O.none()
})

console.log("Wireless products in stock:", searchResults1.length)
console.log("Electronics over $100:", searchResults2.length)
console.log("Products from California:", getProductsBySupplierLocation("California").length)
console.log("Top rated products:", getTopRatedProducts().length)
```

### Example 3: Configuration Management

Building a flexible configuration system that handles missing or partial configuration gracefully:

```typescript
import { Option as O, pipe } from "effect"

interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: O.Option<string>
  ssl: O.Option<boolean>
  timeout: O.Option<number>
  poolSize: O.Option<number>
}

interface CacheConfig {
  enabled: boolean
  ttl: O.Option<number>
  maxSize: O.Option<number>
  strategy: O.Option<"lru" | "fifo" | "lfu">
}

interface ApiConfig {
  baseUrl: string
  timeout: O.Option<number>
  retries: O.Option<number>
  apiKey: O.Option<string>
  rateLimit: O.Option<{
    requestsPerMinute: number
    burstSize: number
  }>
}

interface AppConfig {
  database: DatabaseConfig
  cache: CacheConfig
  api: ApiConfig
  features: {
    enableLogging: boolean
    enableMetrics: O.Option<boolean>
    enableTracing: O.Option<boolean>
    maintenanceMode: O.Option<boolean>
  }
}

// Configuration loading with environment variable fallbacks
const loadConfigFromEnv = (): AppConfig => ({
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "myapp",
    username: process.env.DB_USER || "user",
    password: O.fromNullable(process.env.DB_PASSWORD),
    ssl: O.map(O.fromNullable(process.env.DB_SSL), value => value.toLowerCase() === "true"),
    timeout: O.map(O.fromNullable(process.env.DB_TIMEOUT), value => parseInt(value)),
    poolSize: O.map(O.fromNullable(process.env.DB_POOL_SIZE), value => parseInt(value))
  },
  
  cache: {
    enabled: process.env.CACHE_ENABLED !== "false",
    ttl: O.map(O.fromNullable(process.env.CACHE_TTL), value => parseInt(value)),
    maxSize: O.map(O.fromNullable(process.env.CACHE_MAX_SIZE), value => parseInt(value)),
    strategy: O.filter(O.fromNullable(process.env.CACHE_STRATEGY), (value): value is "lru" | "fifo" | "lfu" => 
      ["lru", "fifo", "lfu"].includes(value)
    )
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    timeout: O.map(O.fromNullable(process.env.API_TIMEOUT), value => parseInt(value)),
    retries: O.map(O.fromNullable(process.env.API_RETRIES), value => parseInt(value)),
    apiKey: O.fromNullable(process.env.API_KEY),
    rateLimit: O.map(O.fromNullable(process.env.API_RATE_LIMIT), value => JSON.parse(value))
  },
  
  features: {
    enableLogging: process.env.ENABLE_LOGGING !== "false",
    enableMetrics: O.map(O.fromNullable(process.env.ENABLE_METRICS), value => value.toLowerCase() === "true"),
    enableTracing: O.map(O.fromNullable(process.env.ENABLE_TRACING), value => value.toLowerCase() === "true"),
    maintenanceMode: O.map(O.fromNullable(process.env.MAINTENANCE_MODE), value => value.toLowerCase() === "true")
  }
})

// Configuration validation and defaults
const validateAndSetDefaults = (config: AppConfig): AppConfig => ({
  ...config,
  database: {
    ...config.database,
    ssl: O.getOrElse(config.database.ssl, () => false),
    timeout: O.getOrElse(config.database.timeout, () => 30000),
    poolSize: O.getOrElse(config.database.poolSize, () => 10),
  },
  
  cache: {
    ...config.cache,
    ttl: O.getOrElse(config.cache.ttl, () => 3600),
    maxSize: O.getOrElse(config.cache.maxSize, () => 1000),
    strategy: O.getOrElse(config.cache.strategy, () => "lru" as const)
  },
  
  api: {
    ...config.api,
    timeout: O.getOrElse(config.api.timeout, () => 5000),
    retries: O.getOrElse(config.api.retries, () => 3),
  },
  
  features: {
    ...config.features,
    enableMetrics: O.getOrElse(config.features.enableMetrics, () => true),
    enableTracing: O.getOrElse(config.features.enableTracing, () => false),
    maintenanceMode: O.getOrElse(config.features.maintenanceMode, () => false)
  }
})

// Configuration utilities
const getDatabaseConnectionString = (config: DatabaseConfig): string => {
  const password = O.getOrElse(config.password, () => "")
  const credentials = password ? `${config.username}:${password}` : config.username
  const sslParam = O.match(config.database.ssl, {
    onNone: () => "",
    onSome: (ssl) => ssl ? "?ssl=true" : "?ssl=false"
  })
  
  return `postgresql://${credentials}@${config.host}:${config.port}/${config.database}${sslParam}`
}

const shouldEnableFeature = (feature: O.Option<boolean>, defaultValue: boolean = false): boolean =>
  O.getOrElse(feature, () => defaultValue)

const getApiHeaders = (config: ApiConfig): Record<string, string> => {
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json"
  }
  
  return pipe(
    O.match(config.apiKey, {
      onNone: () => baseHeaders,
      onSome: (key) => ({
        ...baseHeaders,
        "Authorization": `Bearer ${key}`
      })
    })
  )
}

// Configuration merger for different environments
const mergeConfigs = (base: AppConfig, override: Partial<AppConfig>): AppConfig => ({
  database: {
    ...base.database,
    ...override.database,
    // Merge optional fields properly
    password: override.database?.password ?? base.database.password,
    ssl: override.database?.ssl ?? base.database.ssl,
    timeout: override.database?.timeout ?? base.database.timeout,
    poolSize: override.database?.poolSize ?? base.database.poolSize,
  },
  
  cache: {
    ...base.cache,
    ...override.cache,
    ttl: override.cache?.ttl ?? base.cache.ttl,
    maxSize: override.cache?.maxSize ?? base.cache.maxSize,
    strategy: override.cache?.strategy ?? base.cache.strategy,
  },
  
  api: {
    ...base.api,
    ...override.api,
    timeout: override.api?.timeout ?? base.api.timeout,
    retries: override.api?.retries ?? base.api.retries,
    apiKey: override.api?.apiKey ?? base.api.apiKey,
    rateLimit: override.api?.rateLimit ?? base.api.rateLimit,
  },
  
  features: {
    ...base.features,
    ...override.features,
    enableMetrics: override.features?.enableMetrics ?? base.features.enableMetrics,
    enableTracing: override.features?.enableTracing ?? base.features.enableTracing,
    maintenanceMode: override.features?.maintenanceMode ?? base.features.maintenanceMode,
  }
})

// Usage
const baseConfig = loadConfigFromEnv()
const finalConfig = validateAndSetDefaults(baseConfig)

// Environment-specific overrides
const productionOverrides: Partial<AppConfig> = {
  database: {
    ssl: O.some(true),
    poolSize: O.some(20)
  },
  features: {
    enableMetrics: O.some(true),
    enableTracing: O.some(true)
  }
}

const prodConfig = mergeConfigs(finalConfig, productionOverrides)

console.log("Database connection:", getDatabaseConnectionString(prodConfig.database))
console.log("Metrics enabled:", shouldEnableFeature(prodConfig.features.enableMetrics))
console.log("API headers:", getApiHeaders(prodConfig.api))
```

## Advanced Features Deep Dive

### Feature 1: Option Composition and Chaining

Option really shines when you need to chain operations that might fail or return no value.

#### Basic Chaining Usage

```typescript
import { Option as O, pipe } from "effect"

interface User {
  id: string
  name: string
  companyId: O.Option<string>
}

interface Company {
  id: string
  name: string
  address: O.Option<Address>
}

interface Address {
  street: string
  city: string
  country: string
}

const users: User[] = [
  { id: "1", name: "Alice", companyId: O.some("comp1") },
  { id: "2", name: "Bob", companyId: O.none() }
]

const companies: Company[] = [
  { 
    id: "comp1", 
    name: "TechCorp", 
    address: O.some({
      street: "123 Tech St",
      city: "San Francisco", 
      country: "USA"
    })
  }
]

const findUser = (id: string): O.Option<User> =>
  O.fromNullable(users.find(u => u.id === id))

const findCompany = (id: string): O.Option<Company> =>
  O.fromNullable(companies.find(c => c.id === id))

// Chain operations to get user's company address
const getUserCompanyAddress = (userId: string): O.Option<Address> =>
  findUser(userId).pipe(
    O.flatMap(user => user.companyId),    // Option<string>
    O.flatMap(companyId => findCompany(companyId)), // Option<Company>
    O.flatMap(company => company.address) // Option<Address>
  )

// Usage
const address1 = getUserCompanyAddress("1") // Some(Address)
const address2 = getUserCompanyAddress("2") // None (no company)
const address3 = getUserCompanyAddress("999") // None (no user)
```

#### Real-World Chaining Example

```typescript
// Complex data retrieval with multiple optional steps
interface BlogPost {
  id: string
  title: string
  authorId: string
  categoryId: O.Option<string>
  tags: string[]
  publishedAt: O.Option<Date>
}

interface Author {
  id: string
  name: string
  bio: O.Option<string>
  socialLinks: O.Option<SocialLinks>
}

interface SocialLinks {
  twitter: O.Option<string>
  github: O.Option<string>
}

interface Category {
  id: string
  name: string
  description: string
}

const posts: BlogPost[] = [
  {
    id: "post1",
    title: "Getting Started with Effect",
    authorId: "author1", 
    categoryId: O.some("cat1"),
    tags: ["effect", "typescript", "functional"],
    publishedAt: O.some(new Date("2024-01-15"))
  }
]

const authors: Author[] = [
  {
    id: "author1",
    name: "Jane Developer", 
    bio: O.some("Functional programming enthusiast"),
    socialLinks: O.some({
      twitter: O.some("@janedev"),
      github: O.some("janedev")
    })
  }
]

const categories: Category[] = [
  {
    id: "cat1",
    name: "Tutorials",
    description: "Step-by-step guides"
  }
]

// Complex chaining for blog post enrichment
interface EnrichedBlogPost {
  post: BlogPost
  author: Author
  category: O.Option<Category>
  authorTwitter: O.Option<string>
}

const enrichBlogPost = (postId: string): O.Option<EnrichedBlogPost> =>
  O.fromNullable(posts.find(p => p.id === postId)).pipe(
    O.flatMap(post =>
      O.fromNullable(authors.find(a => a.id === post.authorId)).pipe(
        O.map(author => {
          const category = post.categoryId.pipe(
            O.flatMap(catId => 
              O.fromNullable(categories.find(c => c.id === catId))
            )
          )
          
          const authorTwitter = author.socialLinks.pipe(
            O.flatMap(links => links.twitter)
          )
          
          return {
            post,
            author,
            category,
            authorTwitter
          }
        })
      )
    )
  )

// Generate social sharing text with optional data
const generateShareText = (enrichedPost: EnrichedBlogPost): string => {
  const categoryText = enrichedPost.category.pipe(
    O.map(cat => ` in ${cat.name}`),
    O.getOrElse(() => "")
  )
  
  const authorMention = enrichedPost.authorTwitter.pipe(
    O.map(handle => ` by ${handle}`),
    O.getOrElse(() => ` by ${enrichedPost.author.name}`)
  )
  
  return `Check out "${enrichedPost.post.title}"${categoryText}${authorMention}`
}

// Usage
const enriched = enrichBlogPost("post1")
O.match(enriched, {
  onNone: () => console.log("Post not found"),
  onSome: (post) => console.log(generateShareText(post))
})
```

### Feature 2: Option Lifting and Utilities

#### Lifting Functions to Work with Options

```typescript
import { Option as O, pipe } from "effect"

// Lift regular functions to work with Options
const add = (a: number, b: number): number => a + b
const multiply = (a: number, b: number): number => a * b

// Using O.map2 to combine two Options
const addOptions = (a: O.Option<number>, b: O.Option<number>): O.Option<number> =>
  a.pipe(
    O.flatMap(valueA =>
      b.pipe(
        O.map(valueB => add(valueA, valueB))
      )
    )
  )

// More elegant with Option lifting
const liftedAdd = O.lift2(add)
const liftedMultiply = O.lift2(multiply)

const result1 = liftedAdd(O.some(5), O.some(3))  // Some(8)
const result2 = liftedAdd(O.some(5), O.none())   // None
const result3 = liftedMultiply(O.some(4), O.some(2)) // Some(8)

// Lift predicate functions
const isEven = (n: number): boolean => n % 2 === 0
const isPositive = (n: number): boolean => n > 0

const getEvenNumber = O.liftPredicate(isEven)
const getPositiveNumber = O.liftPredicate(isPositive)

const maybeEven = getEvenNumber(42)     // Some(42)
const maybeOdd = getEvenNumber(41)      // None
const maybePositive = getPositiveNumber(5)  // Some(5)
const maybeNegative = getPositiveNumber(-5) // None
```

#### Advanced Option Utilities

```typescript
// Working with arrays of Options
const numbers: O.Option<number>[] = [
  O.some(1),
  O.some(2), 
  O.none(),
  O.some(4)
]

// Collect all Some values
const collectSome = <A>(options: O.Option<A>[]): A[] =>
  options.reduce((acc: A[], option) => 
    O.match(option, {
      onNone: () => acc,
      onSome: (value) => [...acc, value]
    }), []
  )

const someNumbers = collectSome(numbers) // [1, 2, 4]

// Find first Some value
const findFirstSome = <A>(options: O.Option<A>[]): O.Option<A> =>
  options.reduce(
    (acc, current) => O.isSome(acc) ? acc : current,
    O.none<A>()
  )

const firstSome = findFirstSome(numbers) // Some(1)

// Convert array to Option (None if any element is None)
const sequenceOptions = <A>(options: O.Option<A>[]): O.Option<A[]> =>
  options.reduce(
    (acc: O.Option<A[]>, current: O.Option<A>) =>
      acc.pipe(
        O.flatMap(array =>
          current.pipe(
            O.map(value => [...array, value])
          )
        )
      ),
    O.some<A[]>([])
  )

const allNumbers = sequenceOptions(numbers) // None (because one element is None)
const someValidNumbers = sequenceOptions([O.some(1), O.some(2)]) // Some([1, 2])

// Alternative/fallback chaining
const getConfigValue = (key: string): O.Option<string> => {
  // Try environment variable first
  const envValue = O.fromNullable(process.env[key])
  if (O.isSome(envValue)) return envValue
  
  // Try config file
  const configValue = O.fromNullable(getFromConfigFile(key))
  if (O.isSome(configValue)) return configValue
  
  // Try default values
  return getDefaultValue(key)
}

const getFromConfigFile = (key: string): string | null => {
  // Simulate config file lookup
  const config: Record<string, string> = {
    "database.host": "localhost",
    "api.timeout": "5000"
  }
  return config[key] || null
}

const getDefaultValue = (key: string): O.Option<string> => {
  const defaults: Record<string, string> = {
    "server.port": "3000",
    "log.level": "info"
  }
  return O.fromNullable(defaults[key])
}

// Usage
console.log(O.getOrElse(getConfigValue("DATABASE_URL"), () => "not found"))
console.log(O.getOrElse(getConfigValue("database.host"), () => "not found"))
console.log(O.getOrElse(getConfigValue("server.port"), () => "not found"))
```

## Practical Patterns & Best Practices

### Pattern 1: Option Builder Pattern

Create reusable builders for complex optional data structures:

```typescript
import { Option as O, pipe } from "effect"

interface ApiRequest {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers: O.Option<Record<string, string>>
  body: O.Option<unknown>
  timeout: O.Option<number>
  retries: O.Option<number>
}

class RequestBuilder {
  private request: ApiRequest

  constructor(url: string, method: ApiRequest["method"] = "GET") {
    this.request = {
      url,
      method,
      headers: O.none(),
      body: O.none(),
      timeout: O.none(),
      retries: O.none()
    }
  }

  withHeaders(headers: Record<string, string>): RequestBuilder {
    this.request.headers = O.some(headers)
    return this
  }

  withBody(body: unknown): RequestBuilder {
    this.request.body = O.some(body)
    return this
  }

  withTimeout(timeout: number): RequestBuilder {
    this.request.timeout = O.some(timeout)
    return this
  }

  withRetries(retries: number): RequestBuilder {
    this.request.retries = O.some(retries)
    return this
  }

  build(): ApiRequest {
    return { ...this.request }
  }
}

// Helper to execute requests
const executeRequest = async (request: ApiRequest): Promise<unknown> => {
  const headers = O.getOrElse(request.headers, () => ({}))
  const timeout = O.getOrElse(request.timeout, () => 5000)
  const retries = O.getOrElse(request.retries, () => 0)

  console.log(`Executing ${request.method} ${request.url}`)
  console.log(`Headers:`, headers)
  console.log(`Timeout: ${timeout}ms, Retries: ${retries}`)
  
  if (O.isSome(request.body)) {
    console.log(`Body:`, request.body.value)
  }
  
  // Simulate API call
  return { success: true, data: "mock response" }
}

// Usage examples
const getRequest = new RequestBuilder("/api/users")
  .withTimeout(10000)
  .build()

const postRequest = new RequestBuilder("/api/users", "POST")
  .withHeaders({ "Content-Type": "application/json" })
  .withBody({ name: "John", email: "john@example.com" })
  .withRetries(3)
  .build()

executeRequest(getRequest)
executeRequest(postRequest)
```

### Pattern 2: Option Validation Chain

Create validation pipelines that accumulate errors or stop on first failure:

```typescript
import { Option as O, pipe, Either } from "effect"

interface ValidationError {
  field: string
  message: string
}

interface UserInput {
  name: O.Option<string>
  email: O.Option<string>
  age: O.Option<number>
  password: O.Option<string>
}

interface ValidatedUser {
  name: string
  email: string
  age: number
  password: string
}

// Validation functions
const validateName = (name: O.Option<string>): Either.Either<ValidationError, string> =>
  name.pipe(
    O.filter(n => n.trim().length >= 2),
    Either.fromOption(() => ({
      field: "name",
      message: "Name must be at least 2 characters long"
    }))
  )

const validateEmail = (email: O.Option<string>): Either.Either<ValidationError, string> =>
  email.pipe(
    O.filter(e => e.includes("@") && e.includes(".")),
    Either.fromOption(() => ({
      field: "email", 
      message: "Email must be a valid email address"
    }))
  )

const validateAge = (age: O.Option<number>): Either.Either<ValidationError, number> =>
  age.pipe(
    O.filter(a => a >= 18 && a <= 120),
    Either.fromOption(() => ({
      field: "age",
      message: "Age must be between 18 and 120"
    }))
  )

const validatePassword = (password: O.Option<string>): Either.Either<ValidationError, string> =>
  password.pipe(
    O.filter(p => p.length >= 8),
    Either.fromOption(() => ({
      field: "password",
      message: "Password must be at least 8 characters long"
    }))
  )

// Option-based validation helpers
const validateOptionalField = <T>(
  value: O.Option<T>,
  validator: (value: T) => boolean,
  errorMessage: string
): O.Option<T> =>
  value.pipe(
    O.filter(validator)
  )

const validateRequiredField = <T>(
  value: O.Option<T>,
  fieldName: string
): Either.Either<ValidationError, T> =>
  value.pipe(
    Either.fromOption(() => ({
      field: fieldName,
      message: `${fieldName} is required`
    }))
  )

// Validation pipeline using Option
const validateUserWithOptions = (input: UserInput): O.Option<ValidatedUser> => {
  const validName = validateOptionalField(
    input.name,
    n => n.trim().length >= 2,
    "Name too short"
  )
  
  const validEmail = validateOptionalField(
    input.email,
    e => e.includes("@") && e.includes("."),
    "Invalid email"
  )
  
  const validAge = validateOptionalField(
    input.age,
    a => a >= 18 && a <= 120,
    "Invalid age"
  )
  
  const validPassword = validateOptionalField(
    input.password,
    p => p.length >= 8,
    "Password too short"
  )

  // All validations must pass
  return validName.pipe(
    O.flatMap(name =>
      validEmail.pipe(
        O.flatMap(email =>
          validAge.pipe(
            O.flatMap(age =>
              validPassword.pipe(
                O.map(password => ({
                  name,
                  email,
                  age,
                  password
                }))
              )
            )
          )
        )
      )
    )
  )
}

// More flexible validation with partial results
interface PartialValidationResult {
  validFields: Partial<ValidatedUser>
  invalidFields: string[]
}

const validateUserPartial = (input: UserInput): PartialValidationResult => {
  const result: PartialValidationResult = {
    validFields: {},
    invalidFields: []
  }
  
  O.match(validateOptionalField(input.name, n => n.trim().length >= 2, ""), {
    onNone: () => result.invalidFields.push("name"),
    onSome: (name) => result.validFields.name = name
  })
  
  O.match(validateOptionalField(input.email, e => e.includes("@"), ""), {
    onNone: () => result.invalidFields.push("email"),
    onSome: (email) => result.validFields.email = email
  })
  
  O.match(validateOptionalField(input.age, a => a >= 18, ""), {
    onNone: () => result.invalidFields.push("age"),
    onSome: (age) => result.validFields.age = age
  })
  
  O.match(validateOptionalField(input.password, p => p.length >= 8, ""), {
    onNone: () => result.invalidFields.push("password"),
    onSome: (password) => result.validFields.password = password
  })
  
  return result
}

// Usage examples
const validInput: UserInput = {
  name: O.some("John Doe"),
  email: O.some("john@example.com"),
  age: O.some(25),
  password: O.some("securepassword123")
}

const invalidInput: UserInput = {
  name: O.some("J"),  // Too short
  email: O.some("invalid-email"),
  age: O.some(15),    // Too young
  password: O.none()  // Missing
}

const result1 = validateUserWithOptions(validInput)
const result2 = validateUserWithOptions(invalidInput)
const partial = validateUserPartial(invalidInput)

console.log("Valid input result:", O.isSome(result1))
console.log("Invalid input result:", O.isSome(result2))
console.log("Partial validation:", partial)
```

### Pattern 3: Option Caching and Memoization

Use Options to implement safe caching patterns with expiration:

```typescript
import { Option as O, pipe } from "effect"

interface CacheEntry<T> {
  value: T
  expiresAt: Date
}

class OptionCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>()
  private defaultTtl: number

  constructor(defaultTtlMs: number = 300000) { // 5 minutes default
    this.defaultTtl = defaultTtlMs
  }

  set(key: K, value: V, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtl
    const expiresAt = new Date(Date.now() + ttl)
    this.cache.set(key, { value, expiresAt })
  }

  get(key: K): O.Option<V> {
    const entry = this.cache.get(key)
    if (!entry) {
      return O.none()
    }

    if (entry.expiresAt < new Date()) {
      this.cache.delete(key)
      return O.none()
    }

    return O.some(entry.value)
  }

  getOrCompute(key: K, compute: () => V, ttlMs?: number): V {
    return pipe(
      O.match(this.get(key), {
        onSome: (value) => value,
        onNone: () => {
          const value = compute()
          this.set(key, value, ttlMs)
          return value
        }
      })
    )
  }

  async getOrComputeAsync(
    key: K, 
    compute: () => Promise<V>, 
    ttlMs?: number
  ): Promise<V> {
    return pipe(
      O.match(this.get(key), {
        onSome: (value) => Promise.resolve(value),
        onNone: async () => {
          const value = await compute()
          this.set(key, value, ttlMs)
          return value
        }
      })
    )
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): K[] {
    return Array.from(this.cache.keys())
  }
}

// Advanced caching with Option chains
interface User {
  id: string
  name: string
  preferences: UserPreferences
}

interface UserPreferences {  
  theme: "light" | "dark"
  language: string
  notifications: boolean
}

class UserService {
  private userCache = new OptionCache<string, User>()
  private prefCache = new OptionCache<string, UserPreferences>()

  async getUser(id: string): Promise<O.Option<User>> {
    // Try cache first
    const cached = this.userCache.get(id)
    if (O.isSome(cached)) {
      return O.some(cached.value)
    }

    // Fetch from database
    const user = await this.fetchUserFromDb(id)
    if (user) {
      this.userCache.set(id, user, 60000) // Cache for 1 minute
      return O.some(user)
    }

    return O.none()
  }

  async getUserPreferences(userId: string): Promise<O.Option<UserPreferences>> {
    // Check preferences cache
    const cachedPrefs = this.prefCache.get(userId)
    if (O.isSome(cachedPrefs)) {
      return O.some(cachedPrefs.value)
    }

    // Get user and extract preferences
    const user = await this.getUser(userId)
    return user.pipe(
      O.map(u => {
        this.prefCache.set(userId, u.preferences, 120000) // Cache for 2 minutes
        return u.preferences
      })
    )
  }

  async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<O.Option<UserPreferences>> {
    const currentPrefs = await this.getUserPreferences(userId)
    
    return currentPrefs.pipe(
      O.map(current => {
        const updated = { ...current, ...preferences }
        
        // Update both caches
        this.prefCache.set(userId, updated)
        
        // Invalidate user cache to force refresh
        const cachedUser = this.userCache.get(userId)
        if (O.isSome(cachedUser)) {
          const updatedUser = { ...cachedUser.value, preferences: updated }
          this.userCache.set(userId, updatedUser)
        }
        
        return updated
      })
    )
  }

  private async fetchUserFromDb(id: string): Promise<User | null> {
    // Simulate database call
    console.log(`Fetching user ${id} from database`)
    
    const users: Record<string, User> = {
      "1": {
        id: "1",
        name: "Alice",
        preferences: {
          theme: "dark",
          language: "en",
          notifications: true
        }
      }
    }
    
    return users[id] || null
  }
}

// Usage
const userService = new UserService()

const demonstrateCache = async () => {
  console.log("=== Cache Demo ===")
  
  // First call - hits database
  const user1 = await userService.getUser("1")
  console.log("First call:", O.isSome(user1))
  
  // Second call - hits cache
  const user2 = await userService.getUser("1")
  console.log("Second call (cached):", O.isSome(user2))
  
  // Get preferences
  const prefs = await userService.getUserPreferences("1")
  O.match(prefs, {
    onNone: () => console.log("No preferences found"),
    onSome: (p) => console.log("User preferences:", p)
  })
  
  // Update preferences
  const updated = await userService.updateUserPreferences("1", { theme: "light" })
  O.match(updated, {
    onNone: () => console.log("Failed to update preferences"),
    onSome: (p) => console.log("Updated preferences:", p)
  })
}

demonstrateCache()
```

## Integration Examples

### Integration with Effect for Error Handling

Options integrate seamlessly with Effect for comprehensive error handling:

```typescript
import { Effect, Option as O, pipe } from "effect"

// Define custom errors
class UserNotFoundError {
  readonly _tag = "UserNotFoundError"
  constructor(readonly userId: string) {}
}

class DatabaseError {
  readonly _tag = "DatabaseError"
  constructor(readonly message: string) {}
}

class ValidationError {
  readonly _tag = "ValidationError"
  constructor(readonly errors: string[]) {}
}

type AppError = UserNotFoundError | DatabaseError | ValidationError

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
}

// Database simulation
const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", isActive: true },
  { id: "2", name: "Bob", email: "bob@example.com", isActive: false }
]

// Effect-based operations that use Options internally
const findUserById = (id: string): Effect.Effect<O.Option<User>, DatabaseError> =>
  Effect.try({
    try: () => {
      // Simulate potential database error
      if (id === "error") {
        throw new Error("Database connection failed")
      }
      return O.fromNullable(users.find(u => u.id === id))
    },
    catch: (error) => new DatabaseError(String(error))
  })

const getUserById = (id: string): Effect.Effect<User, AppError> =>
  pipe(
    findUserById(id),
    Effect.flatMap(optionUser =>
      O.match(optionUser, {
        onNone: () => Effect.fail(new UserNotFoundError(id)),
        onSome: (user) => Effect.succeed(user)
      })
    )
  )

const getActiveUserById = (id: string): Effect.Effect<User, AppError> =>
  pipe(
    getUserById(id),
    Effect.flatMap(user =>
      user.isActive
        ? Effect.succeed(user)
        : Effect.fail(new ValidationError([`User ${id} is not active`]))
    )
  )

// Option-first approach with Effect fallback
const findUserByEmail = (email: string): Effect.Effect<O.Option<User>, DatabaseError> =>
  Effect.try({
    try: () => O.fromNullable(users.find(u => u.email === email)),
    catch: (error) => new DatabaseError(String(error))
  })

const getUserByEmailOrId = (emailOrId: string): Effect.Effect<User, AppError> => {
  const isEmail = emailOrId.includes("@")
  
  if (isEmail) {
    return pipe(
      findUserByEmail(emailOrId),
      Effect.flatMap(optionUser =>
        O.match(optionUser, {
          onNone: () => Effect.fail(new UserNotFoundError(emailOrId)),
          onSome: (user) => Effect.succeed(user)
        })
      )
    )
  } else {
    return getUserById(emailOrId)
  }
}

// Batch operations with Options and Effects
const getUsersByIds = (ids: string[]): Effect.Effect<User[], AppError> =>
  pipe(
    Effect.all(ids.map(id => findUserById(id))),
    Effect.map(optionUsers => {
      const users: User[] = []
      const missingIds: string[] = []
      
      optionUsers.forEach((optionUser, index) => {
        O.match(optionUser, {
          onNone: () => missingIds.push(ids[index]),
          onSome: (user) => users.push(user)
        })
      })
      
      return { users, missingIds }
    }),
    Effect.flatMap(({ users, missingIds }) =>
      missingIds.length > 0
        ? Effect.fail(new ValidationError(missingIds.map(id => `User ${id} not found`)))
        : Effect.succeed(users)
    )
  )

// Safe partial operations
const getOptionalUsersByIds = (ids: string[]): Effect.Effect<O.Option<User>[], DatabaseError> =>
  Effect.all(ids.map(id => findUserById(id)))

// Usage examples
const runExamples = async () => {
  console.log("=== Option + Effect Integration ===")
  
  // Success case
  const result1 = await Effect.runPromise(getUserById("1"))
  console.log("Found user:", result1)
  
  // User not found
  try {
    await Effect.runPromise(getUserById("999"))
  } catch (error) {
    console.log("Error:", error)
  }
  
  // Inactive user
  try {
    await Effect.runPromise(getActiveUserById("2"))
  } catch (error) {
    console.log("Validation error:", error)
  }
  
  // Email lookup
  const result2 = await Effect.runPromise(getUserByEmailOrId("alice@example.com"))
  console.log("Found by email:", result2)
  
  // Batch with some missing
  const result3 = await Effect.runPromise(getOptionalUsersByIds(["1", "999", "2"]))
  console.log("Batch results:")
  result3.forEach((optionUser, index) => {
    const id = ["1", "999", "2"][index]
    O.match(optionUser, {
      onNone: () => console.log(`  ${id}: Not found`),
      onSome: (user) => console.log(`  ${id}: ${user.name}`)
    })
  })
}

runExamples()
```

### Testing Strategies for Option-Based Code

Comprehensive testing patterns for Option-based applications:

```typescript
import { Option as O, pipe } from "effect"

// Code under test
interface ShoppingCart {
  items: CartItem[]
  discountCode: O.Option<string>
  shippingAddress: O.Option<Address>
}

interface CartItem {
  productId: string
  quantity: number
  price: number
}

interface Address {
  street: string
  city: string
  zipCode: string
  country: string
}

interface OrderSummary {
  subtotal: number
  discount: number
  shipping: number
  total: number
}

class CartService {
  calculateSubtotal(cart: ShoppingCart): number {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  calculateDiscount(cart: ShoppingCart, subtotal: number): number {
    return cart.discountCode.pipe(
      O.map(code => this.getDiscountAmount(code, subtotal)),
      O.getOrElse(() => 0)
    )
  }

  calculateShipping(cart: ShoppingCart, subtotal: number): number {
    return cart.shippingAddress.pipe(
      O.map(address => this.getShippingCost(address, subtotal)),
      O.getOrElse(() => 0)
    )
  }

  calculateTotal(cart: ShoppingCart): OrderSummary {
    const subtotal = this.calculateSubtotal(cart)
    const discount = this.calculateDiscount(cart, subtotal)
    const shipping = this.calculateShipping(cart, subtotal)
    const total = subtotal - discount + shipping

    return { subtotal, discount, shipping, total }
  }

  private getDiscountAmount(code: string, subtotal: number): number {
    const discounts: Record<string, number> = {
      "SAVE10": 0.1,
      "SAVE20": 0.2,
      "FREESHIP": 0.0
    }
    const rate = discounts[code] || 0
    return subtotal * rate
  }

  private getShippingCost(address: Address, subtotal: number): number {
    // Free shipping over $100
    if (subtotal >= 100) return 0
    
    // International shipping
    if (address.country !== "US") return 25
    
    // Domestic shipping
    return 10
  }
}

// Test utilities
const createCartItem = (productId: string, quantity: number = 1, price: number = 50): CartItem => ({
  productId,
  quantity,
  price
})

const createAddress = (overrides: Partial<Address> = {}): Address => ({
  street: "123 Main St",
  city: "Anytown", 
  zipCode: "12345",
  country: "US",
  ...overrides
})

const createCart = (
  items: CartItem[] = [],
  discountCode: O.Option<string> = O.none(),
  shippingAddress: O.Option<Address> = O.none()
): ShoppingCart => ({
  items,
  discountCode,
  shippingAddress
})

// Test suite
describe("CartService with Options", () => {
  const cartService = new CartService()

  describe("calculateSubtotal", () => {
    test("empty cart returns 0", () => {
      const cart = createCart([])
      expect(cartService.calculateSubtotal(cart)).toBe(0)
    })

    test("single item cart", () => {
      const cart = createCart([createCartItem("item1", 2, 25)])
      expect(cartService.calculateSubtotal(cart)).toBe(50)
    })

    test("multiple items cart", () => {
      const cart = createCart([
        createCartItem("item1", 1, 30),
        createCartItem("item2", 2, 20)
      ])
      expect(cartService.calculateSubtotal(cart)).toBe(70)
    })
  })

  describe("calculateDiscount with Options", () => {
    test("no discount code returns 0", () => {
      const cart = createCart([createCartItem("item1")])
      const subtotal = 50
      expect(cartService.calculateDiscount(cart, subtotal)).toBe(0)
    })

    test("valid discount code applies discount", () => {
      const cart = createCart(
        [createCartItem("item1")],
        O.some("SAVE10")
      )
      const subtotal = 50
      expect(cartService.calculateDiscount(cart, subtotal)).toBe(5)
    })

    test("invalid discount code returns 0", () => {
      const cart = createCart(
        [createCartItem("item1")],
        O.some("INVALID")
      )
      const subtotal = 50
      expect(cartService.calculateDiscount(cart, subtotal)).toBe(0)
    })
  })

  describe("calculateShipping with Options", () => {
    test("no shipping address returns 0", () => {
      const cart = createCart([createCartItem("item1")])
      const subtotal = 50
      expect(cartService.calculateShipping(cart, subtotal)).toBe(0)
    })

    test("domestic shipping under $100", () => {
      const cart = createCart(
        [createCartItem("item1")],
        O.none(),
        O.some(createAddress())
      )
      const subtotal = 50
      expect(cartService.calculateShipping(cart, subtotal)).toBe(10)
    })

    test("free shipping over $100", () => {
      const cart = createCart(
        [createCartItem("item1")],
        O.none(),
        O.some(createAddress())
      )
      const subtotal = 150
      expect(cartService.calculateShipping(cart, subtotal)).toBe(0)
    })

    test("international shipping", () => {
      const cart = createCart(
        [createCartItem("item1")],
        O.none(),
        O.some(createAddress({ country: "CA" }))
      )
      const subtotal = 50
      expect(cartService.calculateShipping(cart, subtotal)).toBe(25)
    })
  })

  describe("calculateTotal integration", () => {
    test("complete order with all options", () => {
      const cart = createCart(
        [
          createCartItem("item1", 2, 30), // $60
          createCartItem("item2", 1, 40)  // $40
        ],
        O.some("SAVE10"),  // 10% discount
        O.some(createAddress()) // $10 shipping (under $100 after discount)
      )

      const summary = cartService.calculateTotal(cart)
      
      expect(summary.subtotal).toBe(100)
      expect(summary.discount).toBe(10)   // 10% of $100
      expect(summary.shipping).toBe(10)   // $90 subtotal after discount, still under $100
      expect(summary.total).toBe(100)     // $100 - $10 + $10
    })

    test("minimal order with no options", () => {
      const cart = createCart([createCartItem("item1", 1, 25)])
      
      const summary = cartService.calculateTotal(cart)
      
      expect(summary.subtotal).toBe(25)
      expect(summary.discount).toBe(0)
      expect(summary.shipping).toBe(0)
      expect(summary.total).toBe(25)
    })
  })

  // Property-based testing with Options
  describe("Option properties", () => {
    test("discount code presence affects discount calculation", () => {
      const items = [createCartItem("item1", 1, 100)]
      
      const cartWithoutDiscount = createCart(items, O.none())
      const cartWithDiscount = createCart(items, O.some("SAVE20"))
      
      const summaryWithout = cartService.calculateTotal(cartWithoutDiscount)
      const summaryWith = cartService.calculateTotal(cartWithDiscount)
      
      expect(summaryWith.discount).toBeGreaterThan(summaryWithout.discount)
      expect(summaryWith.total).toBeLessThan(summaryWithout.total)
    })

    test("shipping address presence affects shipping calculation", () => {
      const items = [createCartItem("item1", 1, 50)] // Under $100
      
      const cartWithoutAddress = createCart(items, O.none(), O.none())
      const cartWithAddress = createCart(items, O.none(), O.some(createAddress()))
      
      const summaryWithout = cartService.calculateTotal(cartWithoutAddress)
      const summaryWith = cartService.calculateTotal(cartWithAddress)
      
      expect(summaryWith.shipping).toBeGreaterThan(summaryWithout.shipping)
      expect(summaryWith.total).toBeGreaterThan(summaryWithout.total)
    })
  })

  // Edge case testing
  describe("Option edge cases", () => {
    test("handles O.none() gracefully", () => {
      const cart: ShoppingCart = {
        items: [],
        discountCode: O.none(),
        shippingAddress: O.none()
      }
      
      expect(() => cartService.calculateTotal(cart)).not.toThrow()
      
      const summary = cartService.calculateTotal(cart)
      expect(summary.subtotal).toBe(0)
      expect(summary.discount).toBe(0)
      expect(summary.shipping).toBe(0)
      expect(summary.total).toBe(0)
    })

    test("handles O.some() with invalid data", () => {
      const cart = createCart(
        [createCartItem("item1")],
        O.some("NONEXISTENT_CODE"),
        O.some(createAddress({ country: "INVALID" }))
      )
      
      expect(() => cartService.calculateTotal(cart)).not.toThrow()
      
      const summary = cartService.calculateTotal(cart)
      expect(summary.discount).toBe(0) // Invalid discount code
      expect(summary.shipping).toBe(25) // Treated as international
    })
  })
})

// Mock implementation for testing
const mockImplementation = () => {
  // Create test doubles that use Options
  class MockCartService extends CartService {
    constructor(
      private mockDiscounts: Record<string, number> = {},
      private mockShippingRates: Record<string, number> = {}
    ) {
      super()
    }

    protected getDiscountAmount(code: string, subtotal: number): number {
      const rate = this.mockDiscounts[code] || 0
      return subtotal * rate
    }

    protected getShippingCost(address: Address, subtotal: number): number {
      return this.mockShippingRates[address.country] || 0
    }
  }

  // Usage in tests
  const mockService = new MockCartService(
    { "TESTCODE": 0.15 },
    { "US": 5, "CA": 15 }
  )

  const cart = createCart(
    [createCartItem("test", 1, 100)],
    O.some("TESTCODE"),
    O.some(createAddress({ country: "CA" }))
  )

  const summary = mockService.calculateTotal(cart)
  console.log("Mock service summary:", summary)
}
```

## Conclusion

Option provides **type-safe optional value handling**, **composable operations**, and **seamless integration** with Effect's ecosystem for building robust applications.

Key benefits:
- **Eliminates null pointer exceptions**: The type system prevents accessing values that might not exist
- **Composable operations**: Chain transformations and operations without nested null checks
- **Clear intent**: Types explicitly show when values are optional vs required
- **Effect integration**: Works seamlessly with Effect for comprehensive error handling

Use Option when you need to handle missing data, optional configurations, partial results from searches, or any scenario where values might legitimately be absent. It transforms defensive programming into declarative, type-safe code that's both more reliable and easier to read.