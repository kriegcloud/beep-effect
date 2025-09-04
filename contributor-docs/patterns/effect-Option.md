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
import { Option } from "effect"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: Option.Option<string>     // Explicitly optional
  lastLoginAt: Option.Option<Date>
}

function getUserProfile(userId: string): Option.Option<UserProfile> {
  const user = database.findUser(userId)
  
  return Option.fromNullable(user).pipe(
    Option.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: Option.fromNullable(user.avatar),
      lastLoginAt: Option.map(Option.fromNullable(user.lastLoginAt), timestamp => new Date(timestamp))
    }))
  )
}

function getAvatarUrl(profile: UserProfile): string {
  return Option.getOrElse(profile.avatar, () => "/default-avatar.png")
}

// Usage is safe and composable
const profile = getUserProfile("123")
Option.match(profile, {
  onNone: () => console.log("User not found"),
  onSome: (profile) => {
    Option.match(profile.lastLoginAt, {
      onNone: () => console.log("Never logged in"),
      onSome: (date) => console.log(`Last login: ${date.toISOString()}`)
    })
    
    const avatarUrl = getAvatarUrl(profile)
    console.log(`Avatar: ${avatarUrl}`)
  }
})
```

### Key Concepts

**Some**: An Option containing a value - `Option.some(42)`

**None**: An Option containing no value - `Option.none()`

**Type Safety**: The compiler prevents accessing values without checking if they exist

## Basic Usage Patterns

### Pattern 1: Creating Options

```typescript
import { Option } from "effect"

// From a value that might be null/undefined
const maybeUser = Option.fromNullable(database.getUser("123"))

// From a predicate
const evenNumber = Option.liftPredicate((n: number) => n % 2 === 0)(42)
// Result: Option.some(42)

const oddNumber = Option.liftPredicate((n: number) => n % 2 === 0)(41)  
// Result: Option.none()

// Directly creating Options
const someValue = Option.some("hello")
const noValue = Option.none()

// From array operations
const firstItem = Option.fromNullable([1, 2, 3][0])  // Option.some(1)
const missingItem = Option.fromNullable([][0])       // Option.none()
```

### Pattern 2: Extracting Values Safely

```typescript
// Using getOrElse for defaults
const username = Option.getOrElse(maybeUser, () => "Anonymous")

// Using match for pattern matching
const message = Option.match(maybeUser, {
  onNone: () => "No user found",
  onSome: (user) => `Hello, ${user.name}!`
})

// Using isSome/isNone for type guards
if (Option.isSome(maybeUser)) {
  // TypeScript knows maybeUser.value is safe to access
  console.log(maybeUser.value.name)
}
```

### Pattern 3: Transforming Optional Values

```typescript
// Using map to transform the value inside Option
const maybeUppercaseName = Option.map(maybeUser, user => user.name.toUpperCase())

// Using flatMap for chaining Operations that return Options
const maybeUserSettings = Option.flatMap(maybeUser, user => 
  Option.fromNullable(user.settings)
)

// Using filter to add conditions
const maybeAdminUser = Option.filter(maybeUser, user => user.role === "admin")
```

## Real-World Examples

### Example 1: User Profile Management

Let's build a complete user profile system that handles optional data gracefully:

```typescript
import { Option, pipe } from "effect"

interface User {
  id: string
  email: string
  profile: Option.Option<UserProfile>
}

interface UserProfile {
  displayName: string
  bio: Option.Option<string>
  avatar: Option.Option<string>
  socialLinks: {
    twitter: Option.Option<string>
    github: Option.Option<string>
    website: Option.Option<string>
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
    profile: Option.some({
      displayName: "John Doe",
      bio: Option.some("Software developer passionate about functional programming"),
      avatar: Option.some("/avatars/john.jpg"),
      socialLinks: {
        twitter: Option.some("@johndoe"),
        github: Option.some("johndoe"),
        website: Option.none()
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
    profile: Option.none()  // User hasn't set up profile yet
  }
]

// Helper functions for user operations
const findUser = (id: string): Option.Option<User> =>
  Option.fromNullable(users.find(user => user.id === id))

const getUserDisplayName = (user: User): Effect.Effect<string> =>
  Effect.gen(function* () {
    if (Option.isSome(user.profile)) {
      return user.profile.value.displayName
    }
    return user.email.split("@")[0]
  })

const getUserBio = (user: User): Effect.Effect<Option.Option<string>> =>
  Effect.gen(function* () {
    if (Option.isSome(user.profile)) {
      return user.profile.value.bio
    }
    return Option.none()
  })

const getUserAvatar = (user: User): Effect.Effect<string> =>
  Effect.gen(function* () {
    if (Option.isSome(user.profile) && Option.isSome(user.profile.value.avatar)) {
      return user.profile.value.avatar.value
    }
    return "/default-avatar.png"
  })

const getSocialLink = (user: User, platform: keyof UserProfile["socialLinks"]): Effect.Effect<Option.Option<string>> =>
  Effect.gen(function* () {
    if (Option.isSome(user.profile)) {
      return user.profile.value.socialLinks[platform]
    }
    return Option.none()
  })

// Usage examples
const renderUserCard = (userId: string): string => {
  return pipe(
    Option.match(findUser(userId), {
      onNone: () => "User not found",
      onSome: (user) => {
        const displayName = getUserDisplayName(user)
        const avatar = getUserAvatar(user)
        const bio = Option.getOrElse(getUserBio(user), () => "No bio available")
        
        const twitterLink = getSocialLink(user, "twitter").pipe(
          Option.map(handle => `https://twitter.com/${handle}`),
          Option.getOrElse(() => "")
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
  users.filter(user => Option.isSome(user.profile))

const getUsersWithBios = (): User[] =>
  users.filter(user => 
    user.profile.pipe(
      Option.flatMap(profile => profile.bio),
      Option.isSome
    )
  )

console.log(renderUserCard("1"))  // Full profile
console.log(renderUserCard("2"))  // Minimal profile  
console.log(renderUserCard("999")) // User not found
```

### Example 2: Search and Filtering Operations

Building a flexible search system that handles missing or partial data:

```typescript
import { Option, Array, pipe } from "effect"

interface Product {
  id: string
  name: string
  description: Option.Option<string>
  price: number
  category: string
  tags: string[]
  rating: Option.Option<number>
  reviewCount: number
  inStock: boolean
  supplier: Option.Option<Supplier>
}

interface Supplier {
  id: string
  name: string
  location: Option.Option<string>
  rating: number
}

interface SearchFilters {
  query: Option.Option<string>
  category: Option.Option<string>
  minPrice: Option.Option<number>
  maxPrice: Option.Option<number>
  minRating: Option.Option<number>
  inStockOnly: boolean
  hasSupplier: Option.Option<boolean>
}

// Sample product data
const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: Option.some("High-quality wireless headphones with noise cancellation"),
    price: 299.99,
    category: "Electronics",
    tags: ["audio", "wireless", "noise-cancelling"],
    rating: Option.some(4.5),
    reviewCount: 127,
    inStock: true,
    supplier: Option.some({
      id: "sup1",
      name: "AudioTech Inc",
      location: Option.some("California, USA"),
      rating: 4.8
    })
  },
  {
    id: "2", 
    name: "Coffee Mug",
    description: Option.none(),
    price: 15.99,
    category: "Kitchen",
    tags: ["ceramic", "dishwasher-safe"],
    rating: Option.none(), // No ratings yet
    reviewCount: 0,
    inStock: true,
    supplier: Option.none()
  },
  {
    id: "3",
    name: "Gaming Laptop",
    description: Option.some("High-performance gaming laptop with RTX graphics"),
    price: 1299.99,
    category: "Electronics", 
    tags: ["gaming", "laptop", "high-performance"],
    rating: Option.some(4.2),
    reviewCount: 89,
    inStock: false,
    supplier: Option.some({
      id: "sup2",
      name: "GameTech Corp",
      location: Option.none(),
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
    Option.map(desc => desc.toLowerCase().includes(searchText)),
    Option.getOrElse(() => false)
  )
  
  return nameMatch || tagMatch || descriptionMatch
}

const matchesPriceRange = (
  product: Product, 
  minPrice: Option.Option<number>, 
  maxPrice: Option.Option<number>
): boolean => {
  const minCheck = Option.match(minPrice, {
    onNone: () => true,
    onSome: (min) => product.price >= min
  })
  
  const maxCheck = Option.match(maxPrice, {
    onNone: () => true, 
    onSome: (max) => product.price <= max
  })
  
  return minCheck && maxCheck
}

const hasMinimumRating = (product: Product, minRating: Option.Option<number>): boolean =>
  Option.match(minRating, {
    onNone: () => true,
    onSome: (min) => product.rating.pipe(
      Option.map(rating => rating >= min),
      Option.getOrElse(() => false)
    )
  })

// Main search function
const searchProducts = (filters: SearchFilters): Product[] => {
  return products.filter(product => {
    // Text search
    const queryMatch = Option.match(filters.query, {
      onNone: () => true,
      onSome: (query) => matchesQuery(product, query)
    })
    
    // Category filter
    const categoryMatch = Option.match(filters.category, {
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
    const supplierMatch = Option.match(filters.hasSupplier, {
      onNone: () => true,
      onSome: (shouldHaveSupplier) => 
        shouldHaveSupplier ? Option.isSome(product.supplier) : Option.isNone(product.supplier)
    })
    
    return queryMatch && categoryMatch && priceMatch && ratingMatch && stockMatch && supplierMatch
  })
}

// Advanced search operations
const getProductsBySupplierLocation = (location: string): Product[] =>
  products.filter(product =>
    product.supplier.pipe(
      Option.flatMap(supplier => supplier.location),
      Option.map(loc => loc.toLowerCase().includes(location.toLowerCase())),
      Option.getOrElse(() => false)
    )
  )

const getTopRatedProducts = (minRating: number = 4.0): Product[] =>
  products.filter(product =>
    product.rating.pipe(
      Option.map(rating => rating >= minRating),
      Option.getOrElse(() => false)
    )
  )

const getProductsWithoutDescription = (): Product[] =>
  products.filter(product => Option.isNone(product.description))

// Usage examples
const searchResults1 = searchProducts({
  query: Option.some("wireless"),
  category: Option.none(),
  minPrice: Option.none(),
  maxPrice: Option.some(500),
  minRating: Option.some(4.0),
  inStockOnly: true,
  hasSupplier: Option.some(true)
})

const searchResults2 = searchProducts({
  query: Option.none(),
  category: Option.some("Electronics"),
  minPrice: Option.some(100),
  maxPrice: Option.none(),
  minRating: Option.none(),
  inStockOnly: false,
  hasSupplier: Option.none()
})

console.log("Wireless products in stock:", searchResults1.length)
console.log("Electronics over $100:", searchResults2.length)
console.log("Products from California:", getProductsBySupplierLocation("California").length)
console.log("Top rated products:", getTopRatedProducts().length)
```

### Example 3: Configuration Management

Building a flexible configuration system that handles missing or partial configuration gracefully:

```typescript
import { Option, pipe } from "effect"

interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: Option.Option<string>
  ssl: Option.Option<boolean>
  timeout: Option.Option<number>
  poolSize: Option.Option<number>
}

interface CacheConfig {
  enabled: boolean
  ttl: Option.Option<number>
  maxSize: Option.Option<number>
  strategy: Option.Option<"lru" | "fifo" | "lfu">
}

interface ApiConfig {
  baseUrl: string
  timeout: Option.Option<number>
  retries: Option.Option<number>
  apiKey: Option.Option<string>
  rateLimit: Option.Option<{
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
    enableMetrics: Option.Option<boolean>
    enableTracing: Option.Option<boolean>
    maintenanceMode: Option.Option<boolean>
  }
}

// Configuration loading with environment variable fallbacks
const loadConfigFromEnv = (): AppConfig => ({
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "myapp",
    username: process.env.DB_USER || "user",
    password: Option.fromNullable(process.env.DB_PASSWORD),
    ssl: Option.map(Option.fromNullable(process.env.DB_SSL), value => value.toLowerCase() === "true"),
    timeout: Option.map(Option.fromNullable(process.env.DB_TIMEOUT), value => parseInt(value)),
    poolSize: Option.map(Option.fromNullable(process.env.DB_POOL_SIZE), value => parseInt(value))
  },
  
  cache: {
    enabled: process.env.CACHE_ENABLED !== "false",
    ttl: Option.map(Option.fromNullable(process.env.CACHE_TTL), value => parseInt(value)),
    maxSize: Option.map(Option.fromNullable(process.env.CACHE_MAX_SIZE), value => parseInt(value)),
    strategy: Option.filter(Option.fromNullable(process.env.CACHE_STRATEGY), (value): value is "lru" | "fifo" | "lfu" => 
      ["lru", "fifo", "lfu"].includes(value)
    )
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    timeout: Option.map(Option.fromNullable(process.env.API_TIMEOUT), value => parseInt(value)),
    retries: Option.map(Option.fromNullable(process.env.API_RETRIES), value => parseInt(value)),
    apiKey: Option.fromNullable(process.env.API_KEY),
    rateLimit: Option.map(Option.fromNullable(process.env.API_RATE_LIMIT), value => JSON.parse(value))
  },
  
  features: {
    enableLogging: process.env.ENABLE_LOGGING !== "false",
    enableMetrics: Option.map(Option.fromNullable(process.env.ENABLE_METRICS), value => value.toLowerCase() === "true"),
    enableTracing: Option.map(Option.fromNullable(process.env.ENABLE_TRACING), value => value.toLowerCase() === "true"),
    maintenanceMode: Option.map(Option.fromNullable(process.env.MAINTENANCE_MODE), value => value.toLowerCase() === "true")
  }
})

// Configuration validation and defaults
const validateAndSetDefaults = (config: AppConfig): AppConfig => ({
  ...config,
  database: {
    ...config.database,
    ssl: Option.getOrElse(config.database.ssl, () => false),
    timeout: Option.getOrElse(config.database.timeout, () => 30000),
    poolSize: Option.getOrElse(config.database.poolSize, () => 10),
  },
  
  cache: {
    ...config.cache,
    ttl: Option.getOrElse(config.cache.ttl, () => 3600),
    maxSize: Option.getOrElse(config.cache.maxSize, () => 1000),
    strategy: Option.getOrElse(config.cache.strategy, () => "lru" as const)
  },
  
  api: {
    ...config.api,
    timeout: Option.getOrElse(config.api.timeout, () => 5000),
    retries: Option.getOrElse(config.api.retries, () => 3),
  },
  
  features: {
    ...config.features,
    enableMetrics: Option.getOrElse(config.features.enableMetrics, () => true),
    enableTracing: Option.getOrElse(config.features.enableTracing, () => false),
    maintenanceMode: Option.getOrElse(config.features.maintenanceMode, () => false)
  }
})

// Configuration utilities
const getDatabaseConnectionString = (config: DatabaseConfig): string => {
  const password = Option.getOrElse(config.password, () => "")
  const credentials = password ? `${config.username}:${password}` : config.username
  const sslParam = Option.match(config.database.ssl, {
    onNone: () => "",
    onSome: (ssl) => ssl ? "?ssl=true" : "?ssl=false"
  })
  
  return `postgresql://${credentials}@${config.host}:${config.port}/${config.database}${sslParam}`
}

const shouldEnableFeature = (feature: Option.Option<boolean>, defaultValue: boolean = false): boolean =>
  Option.getOrElse(feature, () => defaultValue)

const getApiHeaders = (config: ApiConfig): Record<string, string> => {
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json"
  }
  
  return pipe(
    Option.match(config.apiKey, {
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
    ssl: Option.some(true),
    poolSize: Option.some(20)
  },
  features: {
    enableMetrics: Option.some(true),
    enableTracing: Option.some(true)
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
import { Option, pipe } from "effect"

interface User {
  id: string
  name: string
  companyId: Option.Option<string>
}

interface Company {
  id: string
  name: string
  address: Option.Option<Address>
}

interface Address {
  street: string
  city: string
  country: string
}

const users: User[] = [
  { id: "1", name: "Alice", companyId: Option.some("comp1") },
  { id: "2", name: "Bob", companyId: Option.none() }
]

const companies: Company[] = [
  { 
    id: "comp1", 
    name: "TechCorp", 
    address: Option.some({
      street: "123 Tech St",
      city: "San Francisco", 
      country: "USA"
    })
  }
]

const findUser = (id: string): Option.Option<User> =>
  Option.fromNullable(users.find(u => u.id === id))

const findCompany = (id: string): Option.Option<Company> =>
  Option.fromNullable(companies.find(c => c.id === id))

// Chain operations to get user's company address
const getUserCompanyAddress = (userId: string): Option.Option<Address> =>
  findUser(userId).pipe(
    Option.flatMap(user => user.companyId),    // Option<string>
    Option.flatMap(companyId => findCompany(companyId)), // Option<Company>
    Option.flatMap(company => company.address) // Option<Address>
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
  categoryId: Option.Option<string>
  tags: string[]
  publishedAt: Option.Option<Date>
}

interface Author {
  id: string
  name: string
  bio: Option.Option<string>
  socialLinks: Option.Option<SocialLinks>
}

interface SocialLinks {
  twitter: Option.Option<string>
  github: Option.Option<string>
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
    categoryId: Option.some("cat1"),
    tags: ["effect", "typescript", "functional"],
    publishedAt: Option.some(new Date("2024-01-15"))
  }
]

const authors: Author[] = [
  {
    id: "author1",
    name: "Jane Developer", 
    bio: Option.some("Functional programming enthusiast"),
    socialLinks: Option.some({
      twitter: Option.some("@janedev"),
      github: Option.some("janedev")
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
  category: Option.Option<Category>
  authorTwitter: Option.Option<string>
}

const enrichBlogPost = (postId: string): Option.Option<EnrichedBlogPost> =>
  Option.fromNullable(posts.find(p => p.id === postId)).pipe(
    Option.flatMap(post =>
      Option.fromNullable(authors.find(a => a.id === post.authorId)).pipe(
        Option.map(author => {
          const category = post.categoryId.pipe(
            Option.flatMap(catId => 
              Option.fromNullable(categories.find(c => c.id === catId))
            )
          )
          
          const authorTwitter = author.socialLinks.pipe(
            Option.flatMap(links => links.twitter)
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
    Option.map(cat => ` in ${cat.name}`),
    Option.getOrElse(() => "")
  )
  
  const authorMention = enrichedPost.authorTwitter.pipe(
    Option.map(handle => ` by ${handle}`),
    Option.getOrElse(() => ` by ${enrichedPost.author.name}`)
  )
  
  return `Check out "${enrichedPost.post.title}"${categoryText}${authorMention}`
}

// Usage
const enriched = enrichBlogPost("post1")
Option.match(enriched, {
  onNone: () => console.log("Post not found"),
  onSome: (post) => console.log(generateShareText(post))
})
```

### Feature 2: Option Lifting and Utilities

#### Lifting Functions to Work with Options

```typescript
import { Option, pipe } from "effect"

// Lift regular functions to work with Options
const add = (a: number, b: number): number => a + b
const multiply = (a: number, b: number): number => a * b

// Using Option.map2 to combine two Options
const addOptions = (a: Option.Option<number>, b: Option.Option<number>): Option.Option<number> =>
  a.pipe(
    Option.flatMap(valueA =>
      b.pipe(
        Option.map(valueB => add(valueA, valueB))
      )
    )
  )

// More elegant with Option lifting
const liftedAdd = Option.lift2(add)
const liftedMultiply = Option.lift2(multiply)

const result1 = liftedAdd(Option.some(5), Option.some(3))  // Some(8)
const result2 = liftedAdd(Option.some(5), Option.none())   // None
const result3 = liftedMultiply(Option.some(4), Option.some(2)) // Some(8)

// Lift predicate functions
const isEven = (n: number): boolean => n % 2 === 0
const isPositive = (n: number): boolean => n > 0

const getEvenNumber = Option.liftPredicate(isEven)
const getPositiveNumber = Option.liftPredicate(isPositive)

const maybeEven = getEvenNumber(42)     // Some(42)
const maybeOdd = getEvenNumber(41)      // None
const maybePositive = getPositiveNumber(5)  // Some(5)
const maybeNegative = getPositiveNumber(-5) // None
```

#### Advanced Option Utilities

```typescript
// Working with arrays of Options
const numbers: Option.Option<number>[] = [
  Option.some(1),
  Option.some(2), 
  Option.none(),
  Option.some(4)
]

// Collect all Some values
const collectSome = <A>(options: Option.Option<A>[]): A[] =>
  options.reduce((acc: A[], option) => 
    Option.match(option, {
      onNone: () => acc,
      onSome: (value) => [...acc, value]
    }), []
  )

const someNumbers = collectSome(numbers) // [1, 2, 4]

// Find first Some value
const findFirstSome = <A>(options: Option.Option<A>[]): Option.Option<A> =>
  options.reduce(
    (acc, current) => Option.isSome(acc) ? acc : current,
    Option.none<A>()
  )

const firstSome = findFirstSome(numbers) // Some(1)

// Convert array to Option (None if any element is None)
const sequenceOptions = <A>(options: Option.Option<A>[]): Option.Option<A[]> =>
  options.reduce(
    (acc: Option.Option<A[]>, current: Option.Option<A>) =>
      acc.pipe(
        Option.flatMap(array =>
          current.pipe(
            Option.map(value => [...array, value])
          )
        )
      ),
    Option.some<A[]>([])
  )

const allNumbers = sequenceOptions(numbers) // None (because one element is None)
const someValidNumbers = sequenceOptions([Option.some(1), Option.some(2)]) // Some([1, 2])

// Alternative/fallback chaining
const getConfigValue = (key: string): Option.Option<string> => {
  // Try environment variable first
  const envValue = Option.fromNullable(process.env[key])
  if (Option.isSome(envValue)) return envValue
  
  // Try config file
  const configValue = Option.fromNullable(getFromConfigFile(key))
  if (Option.isSome(configValue)) return configValue
  
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

const getDefaultValue = (key: string): Option.Option<string> => {
  const defaults: Record<string, string> = {
    "server.port": "3000",
    "log.level": "info"
  }
  return Option.fromNullable(defaults[key])
}

// Usage
console.log(Option.getOrElse(getConfigValue("DATABASE_URL"), () => "not found"))
console.log(Option.getOrElse(getConfigValue("database.host"), () => "not found"))
console.log(Option.getOrElse(getConfigValue("server.port"), () => "not found"))
```

## Practical Patterns & Best Practices

### Pattern 1: Option Builder Pattern

Create reusable builders for complex optional data structures:

```typescript
import { Option, pipe } from "effect"

interface ApiRequest {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers: Option.Option<Record<string, string>>
  body: Option.Option<unknown>
  timeout: Option.Option<number>
  retries: Option.Option<number>
}

class RequestBuilder {
  private request: ApiRequest

  constructor(url: string, method: ApiRequest["method"] = "GET") {
    this.request = {
      url,
      method,
      headers: Option.none(),
      body: Option.none(),
      timeout: Option.none(),
      retries: Option.none()
    }
  }

  withHeaders(headers: Record<string, string>): RequestBuilder {
    this.request.headers = Option.some(headers)
    return this
  }

  withBody(body: unknown): RequestBuilder {
    this.request.body = Option.some(body)
    return this
  }

  withTimeout(timeout: number): RequestBuilder {
    this.request.timeout = Option.some(timeout)
    return this
  }

  withRetries(retries: number): RequestBuilder {
    this.request.retries = Option.some(retries)
    return this
  }

  build(): ApiRequest {
    return { ...this.request }
  }
}

// Helper to execute requests
const executeRequest = async (request: ApiRequest): Promise<unknown> => {
  const headers = Option.getOrElse(request.headers, () => ({}))
  const timeout = Option.getOrElse(request.timeout, () => 5000)
  const retries = Option.getOrElse(request.retries, () => 0)

  console.log(`Executing ${request.method} ${request.url}`)
  console.log(`Headers:`, headers)
  console.log(`Timeout: ${timeout}ms, Retries: ${retries}`)
  
  if (Option.isSome(request.body)) {
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
import { Option, pipe, Either } from "effect"

interface ValidationError {
  field: string
  message: string
}

interface UserInput {
  name: Option.Option<string>
  email: Option.Option<string>
  age: Option.Option<number>
  password: Option.Option<string>
}

interface ValidatedUser {
  name: string
  email: string
  age: number
  password: string
}

// Validation functions
const validateName = (name: Option.Option<string>): Either.Either<ValidationError, string> =>
  name.pipe(
    Option.filter(n => n.trim().length >= 2),
    Either.fromOption(() => ({
      field: "name",
      message: "Name must be at least 2 characters long"
    }))
  )

const validateEmail = (email: Option.Option<string>): Either.Either<ValidationError, string> =>
  email.pipe(
    Option.filter(e => e.includes("@") && e.includes(".")),
    Either.fromOption(() => ({
      field: "email", 
      message: "Email must be a valid email address"
    }))
  )

const validateAge = (age: Option.Option<number>): Either.Either<ValidationError, number> =>
  age.pipe(
    Option.filter(a => a >= 18 && a <= 120),
    Either.fromOption(() => ({
      field: "age",
      message: "Age must be between 18 and 120"
    }))
  )

const validatePassword = (password: Option.Option<string>): Either.Either<ValidationError, string> =>
  password.pipe(
    Option.filter(p => p.length >= 8),
    Either.fromOption(() => ({
      field: "password",
      message: "Password must be at least 8 characters long"
    }))
  )

// Option-based validation helpers
const validateOptionalField = <T>(
  value: Option.Option<T>,
  validator: (value: T) => boolean,
  errorMessage: string
): Option.Option<T> =>
  value.pipe(
    Option.filter(validator)
  )

const validateRequiredField = <T>(
  value: Option.Option<T>,
  fieldName: string
): Either.Either<ValidationError, T> =>
  value.pipe(
    Either.fromOption(() => ({
      field: fieldName,
      message: `${fieldName} is required`
    }))
  )

// Validation pipeline using Option
const validateUserWithOptions = (input: UserInput): Option.Option<ValidatedUser> => {
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
    Option.flatMap(name =>
      validEmail.pipe(
        Option.flatMap(email =>
          validAge.pipe(
            Option.flatMap(age =>
              validPassword.pipe(
                Option.map(password => ({
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
  
  Option.match(validateOptionalField(input.name, n => n.trim().length >= 2, ""), {
    onNone: () => result.invalidFields.push("name"),
    onSome: (name) => result.validFields.name = name
  })
  
  Option.match(validateOptionalField(input.email, e => e.includes("@"), ""), {
    onNone: () => result.invalidFields.push("email"),
    onSome: (email) => result.validFields.email = email
  })
  
  Option.match(validateOptionalField(input.age, a => a >= 18, ""), {
    onNone: () => result.invalidFields.push("age"),
    onSome: (age) => result.validFields.age = age
  })
  
  Option.match(validateOptionalField(input.password, p => p.length >= 8, ""), {
    onNone: () => result.invalidFields.push("password"),
    onSome: (password) => result.validFields.password = password
  })
  
  return result
}

// Usage examples
const validInput: UserInput = {
  name: Option.some("John Doe"),
  email: Option.some("john@example.com"),
  age: Option.some(25),
  password: Option.some("securepassword123")
}

const invalidInput: UserInput = {
  name: Option.some("J"),  // Too short
  email: Option.some("invalid-email"),
  age: Option.some(15),    // Too young
  password: Option.none()  // Missing
}

const result1 = validateUserWithOptions(validInput)
const result2 = validateUserWithOptions(invalidInput)
const partial = validateUserPartial(invalidInput)

console.log("Valid input result:", Option.isSome(result1))
console.log("Invalid input result:", Option.isSome(result2))
console.log("Partial validation:", partial)
```

### Pattern 3: Option Caching and Memoization

Use Options to implement safe caching patterns with expiration:

```typescript
import { Option, pipe } from "effect"

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

  get(key: K): Option.Option<V> {
    const entry = this.cache.get(key)
    if (!entry) {
      return Option.none()
    }

    if (entry.expiresAt < new Date()) {
      this.cache.delete(key)
      return Option.none()
    }

    return Option.some(entry.value)
  }

  getOrCompute(key: K, compute: () => V, ttlMs?: number): V {
    return pipe(
      Option.match(this.get(key), {
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
      Option.match(this.get(key), {
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

  async getUser(id: string): Promise<Option.Option<User>> {
    // Try cache first
    const cached = this.userCache.get(id)
    if (Option.isSome(cached)) {
      return Option.some(cached.value)
    }

    // Fetch from database
    const user = await this.fetchUserFromDb(id)
    if (user) {
      this.userCache.set(id, user, 60000) // Cache for 1 minute
      return Option.some(user)
    }

    return Option.none()
  }

  async getUserPreferences(userId: string): Promise<Option.Option<UserPreferences>> {
    // Check preferences cache
    const cachedPrefs = this.prefCache.get(userId)
    if (Option.isSome(cachedPrefs)) {
      return Option.some(cachedPrefs.value)
    }

    // Get user and extract preferences
    const user = await this.getUser(userId)
    return user.pipe(
      Option.map(u => {
        this.prefCache.set(userId, u.preferences, 120000) // Cache for 2 minutes
        return u.preferences
      })
    )
  }

  async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<Option.Option<UserPreferences>> {
    const currentPrefs = await this.getUserPreferences(userId)
    
    return currentPrefs.pipe(
      Option.map(current => {
        const updated = { ...current, ...preferences }
        
        // Update both caches
        this.prefCache.set(userId, updated)
        
        // Invalidate user cache to force refresh
        const cachedUser = this.userCache.get(userId)
        if (Option.isSome(cachedUser)) {
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
  console.log("First call:", Option.isSome(user1))
  
  // Second call - hits cache
  const user2 = await userService.getUser("1")
  console.log("Second call (cached):", Option.isSome(user2))
  
  // Get preferences
  const prefs = await userService.getUserPreferences("1")
  Option.match(prefs, {
    onNone: () => console.log("No preferences found"),
    onSome: (p) => console.log("User preferences:", p)
  })
  
  // Update preferences
  const updated = await userService.updateUserPreferences("1", { theme: "light" })
  Option.match(updated, {
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
import { Effect, Option, pipe } from "effect"

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
const findUserById = (id: string): Effect.Effect<Option.Option<User>, DatabaseError> =>
  Effect.try({
    try: () => {
      // Simulate potential database error
      if (id === "error") {
        throw new Error("Database connection failed")
      }
      return Option.fromNullable(users.find(u => u.id === id))
    },
    catch: (error) => new DatabaseError(String(error))
  })

const getUserById = (id: string): Effect.Effect<User, AppError> =>
  pipe(
    findUserById(id),
    Effect.flatMap(optionUser =>
      Option.match(optionUser, {
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
const findUserByEmail = (email: string): Effect.Effect<Option.Option<User>, DatabaseError> =>
  Effect.try({
    try: () => Option.fromNullable(users.find(u => u.email === email)),
    catch: (error) => new DatabaseError(String(error))
  })

const getUserByEmailOrId = (emailOrId: string): Effect.Effect<User, AppError> => {
  const isEmail = emailOrId.includes("@")
  
  if (isEmail) {
    return pipe(
      findUserByEmail(emailOrId),
      Effect.flatMap(optionUser =>
        Option.match(optionUser, {
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
        Option.match(optionUser, {
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
const getOptionalUsersByIds = (ids: string[]): Effect.Effect<Option.Option<User>[], DatabaseError> =>
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
    Option.match(optionUser, {
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
import { Option, pipe } from "effect"

// Code under test
interface ShoppingCart {
  items: CartItem[]
  discountCode: Option.Option<string>
  shippingAddress: Option.Option<Address>
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
      Option.map(code => this.getDiscountAmount(code, subtotal)),
      Option.getOrElse(() => 0)
    )
  }

  calculateShipping(cart: ShoppingCart, subtotal: number): number {
    return cart.shippingAddress.pipe(
      Option.map(address => this.getShippingCost(address, subtotal)),
      Option.getOrElse(() => 0)
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
  discountCode: Option.Option<string> = Option.none(),
  shippingAddress: Option.Option<Address> = Option.none()
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
        Option.some("SAVE10")
      )
      const subtotal = 50
      expect(cartService.calculateDiscount(cart, subtotal)).toBe(5)
    })

    test("invalid discount code returns 0", () => {
      const cart = createCart(
        [createCartItem("item1")],
        Option.some("INVALID")
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
        Option.none(),
        Option.some(createAddress())
      )
      const subtotal = 50
      expect(cartService.calculateShipping(cart, subtotal)).toBe(10)
    })

    test("free shipping over $100", () => {
      const cart = createCart(
        [createCartItem("item1")],
        Option.none(),
        Option.some(createAddress())
      )
      const subtotal = 150
      expect(cartService.calculateShipping(cart, subtotal)).toBe(0)
    })

    test("international shipping", () => {
      const cart = createCart(
        [createCartItem("item1")],
        Option.none(),
        Option.some(createAddress({ country: "CA" }))
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
        Option.some("SAVE10"),  // 10% discount
        Option.some(createAddress()) // $10 shipping (under $100 after discount)
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
      
      const cartWithoutDiscount = createCart(items, Option.none())
      const cartWithDiscount = createCart(items, Option.some("SAVE20"))
      
      const summaryWithout = cartService.calculateTotal(cartWithoutDiscount)
      const summaryWith = cartService.calculateTotal(cartWithDiscount)
      
      expect(summaryWith.discount).toBeGreaterThan(summaryWithout.discount)
      expect(summaryWith.total).toBeLessThan(summaryWithout.total)
    })

    test("shipping address presence affects shipping calculation", () => {
      const items = [createCartItem("item1", 1, 50)] // Under $100
      
      const cartWithoutAddress = createCart(items, Option.none(), Option.none())
      const cartWithAddress = createCart(items, Option.none(), Option.some(createAddress()))
      
      const summaryWithout = cartService.calculateTotal(cartWithoutAddress)
      const summaryWith = cartService.calculateTotal(cartWithAddress)
      
      expect(summaryWith.shipping).toBeGreaterThan(summaryWithout.shipping)
      expect(summaryWith.total).toBeGreaterThan(summaryWithout.total)
    })
  })

  // Edge case testing
  describe("Option edge cases", () => {
    test("handles Option.none() gracefully", () => {
      const cart: ShoppingCart = {
        items: [],
        discountCode: Option.none(),
        shippingAddress: Option.none()
      }
      
      expect(() => cartService.calculateTotal(cart)).not.toThrow()
      
      const summary = cartService.calculateTotal(cart)
      expect(summary.subtotal).toBe(0)
      expect(summary.discount).toBe(0)
      expect(summary.shipping).toBe(0)
      expect(summary.total).toBe(0)
    })

    test("handles Option.some() with invalid data", () => {
      const cart = createCart(
        [createCartItem("item1")],
        Option.some("NONEXISTENT_CODE"),
        Option.some(createAddress({ country: "INVALID" }))
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
    Option.some("TESTCODE"),
    Option.some(createAddress({ country: "CA" }))
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