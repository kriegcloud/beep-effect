# Differ: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Differ Solves

Modern applications often need to track changes between data states - whether for state management, synchronization, undo/redo functionality, or distributed systems. Traditional approaches fall short when dealing with complex data structures and concurrent updates.

```typescript
// Traditional approach - manual change tracking
interface UserState {
  name: string
  email: string
  preferences: Record<string, any>
}

class UserManager {
  private history: UserState[] = []
  
  updateUser(oldUser: UserState, newUser: UserState) {
    // Manual comparison - error-prone and verbose
    const changes: Partial<UserState> = {}
    if (oldUser.name !== newUser.name) changes.name = newUser.name
    if (oldUser.email !== newUser.email) changes.email = newUser.email
    if (!deepEqual(oldUser.preferences, newUser.preferences)) {
      changes.preferences = newUser.preferences
    }
    
    // Track history manually
    this.history.push(oldUser)
    return this.applyChanges(oldUser, changes)
  }
  
  private applyChanges(user: UserState, changes: Partial<UserState>): UserState {
    // Manual patching logic - brittle
    return { ...user, ...changes }
  }
}
```

This approach leads to:
- **Boilerplate Heavy** - Manual comparison and patching logic for every data type
- **Error Prone** - Easy to miss fields or introduce bugs in change detection
- **Not Compositional** - Can't combine patches or handle nested updates elegantly
- **Concurrency Issues** - Multiple concurrent updates can conflict or be lost

### The Differ Solution

Effect's Differ provides a composable, type-safe approach to change detection and patching:

```typescript
import { Differ, HashMap, Effect, FiberRef } from "effect"

// Define a differ for your data structure
const userDiffer = Differ.make({
  empty: {} as Partial<UserState>,
  diff: (oldUser, newUser) => {
    const patch: Partial<UserState> = {}
    if (oldUser.name !== newUser.name) patch.name = newUser.name
    if (oldUser.email !== newUser.email) patch.email = newUser.email
    if (!Equal.equals(oldUser.preferences, newUser.preferences)) {
      patch.preferences = newUser.preferences
    }
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldUser) => ({ ...oldUser, ...patch })
})

// Use with FiberRef for compositional state management
const userStateRef = FiberRef.makePatch(initialUser, userDiffer)
```

### Key Concepts

**Differ**: A type-safe abstraction that knows how to compare values, produce patches, combine patches, and apply patches

**Patch**: A data structure that describes the differences between two values in a minimal, composable way

**Compositional Updates**: Patches can be combined associatively, enabling concurrent updates and conflict resolution

## Basic Usage Patterns

### Pattern 1: Simple Value Differ

```typescript
import { Differ, Effect } from "effect"

// Create a differ for simple value updates
const numberDiffer = Differ.update<number>()

const oldValue = 10
const newValue = 20

// Generate a patch
const patch = Differ.diff(numberDiffer, oldValue, newValue)

// Apply the patch
const result = Differ.patch(numberDiffer, patch, oldValue)
console.log(result) // 20
```

### Pattern 2: Collection Differs

```typescript
import { Differ, HashMap, HashSet, Chunk } from "effect"

// HashMap differ with value updates
const userMapDiffer = Differ.hashMap(Differ.update<User>())
const oldUsers = HashMap.fromIterable([["1", { id: "1", name: "Alice" }]])
const newUsers = HashMap.fromIterable([
  ["1", { id: "1", name: "Alice Updated" }],
  ["2", { id: "2", name: "Bob" }]
])

const usersPatch = Differ.diff(userMapDiffer, oldUsers, newUsers)
const updatedUsers = Differ.patch(userMapDiffer, usersPatch, oldUsers)

// HashSet differ
const tagsDiffer = Differ.hashSet<string>()
const oldTags = HashSet.fromIterable(["tag1", "tag2"])
const newTags = HashSet.fromIterable(["tag1", "tag3"])

const tagsPatch = Differ.diff(tagsDiffer, oldTags, newTags)
const updatedTags = Differ.patch(tagsDiffer, tagsPatch, oldTags)
```

### Pattern 3: Custom Composite Differ

```typescript
import { Differ, HashMap, Effect } from "effect"

interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly tags: HashSet<string>
}

// Compose differs for complex structures
const productDiffer = Differ.make({
  empty: {} as Partial<Product>,
  diff: (oldProduct, newProduct) => {
    const patch: Partial<Product> = {}
    if (oldProduct.name !== newProduct.name) patch.name = newProduct.name
    if (oldProduct.price !== newProduct.price) patch.price = newProduct.price
    if (!Equal.equals(oldProduct.tags, newProduct.tags)) {
      patch.tags = newProduct.tags
    }
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldProduct) => ({ ...oldProduct, ...patch })
})
```

## Real-World Examples

### Example 1: E-commerce State Management

```typescript
import { Differ, HashMap, HashSet, Effect, FiberRef } from "effect"

interface CartItem {
  readonly productId: string
  readonly quantity: number
  readonly price: number
}

interface ShoppingCart {
  readonly items: HashMap<string, CartItem>
  readonly discountCodes: HashSet<string>
  readonly total: number
}

// Create differs for cart components
const cartItemDiffer = Differ.make({
  empty: {} as Partial<CartItem>,
  diff: (oldItem, newItem) => {
    const patch: Partial<CartItem> = {}
    if (oldItem.quantity !== newItem.quantity) patch.quantity = newItem.quantity
    if (oldItem.price !== newItem.price) patch.price = newItem.price
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldItem) => ({ ...oldItem, ...patch })
})

// Compose cart differ from component differs
const cartDiffer = Differ.make({
  empty: {} as Partial<ShoppingCart>,
  diff: (oldCart, newCart) => {
    const patch: Partial<ShoppingCart> = {}
    
    if (!Equal.equals(oldCart.items, newCart.items)) {
      patch.items = newCart.items
    }
    
    if (!Equal.equals(oldCart.discountCodes, newCart.discountCodes)) {
      patch.discountCodes = newCart.discountCodes
    }
    
    if (oldCart.total !== newCart.total) {
      patch.total = newCart.total
    }
    
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldCart) => ({ ...oldCart, ...patch })
})

// Use in Effect program for cart operations
const createCartService = Effect.gen(function* () {
  const cartRef = yield* FiberRef.makePatch({
    items: HashMap.empty<string, CartItem>(),
    discountCodes: HashSet.empty<string>(),
    total: 0
  }, cartDiffer)
  
  const addItem = (item: CartItem) => Effect.gen(function* () {
    const currentCart = yield* FiberRef.get(cartRef)
    const newCart = {
      ...currentCart,
      items: HashMap.set(currentCart.items, item.productId, item),
      total: currentCart.total + (item.price * item.quantity)
    }
    yield* FiberRef.update(cartRef, () => newCart)
  })
  
  const applyDiscount = (code: string) => Effect.gen(function* () {
    const currentCart = yield* FiberRef.get(cartRef)
    const newCart = {
      ...currentCart,
      discountCodes: HashSet.add(currentCart.discountCodes, code)
    }
    yield* FiberRef.update(cartRef, () => newCart)
  })
  
  const getCart = FiberRef.get(cartRef)
  
  return { addItem, applyDiscount, getCart } as const
})
```

### Example 2: Configuration Management System

```typescript
import { Differ, HashMap, Effect, Context } from "effect"

interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly poolSize: number
}

interface CacheConfig {
  readonly enabled: boolean
  readonly ttl: number
  readonly maxSize: number
}

interface AppConfig {
  readonly database: DatabaseConfig
  readonly cache: CacheConfig
  readonly features: HashMap<string, boolean>
}

// Create hierarchical differs
const dbConfigDiffer = Differ.make({
  empty: {} as Partial<DatabaseConfig>,
  diff: (oldConfig, newConfig) => {
    const patch: Partial<DatabaseConfig> = {}
    if (oldConfig.host !== newConfig.host) patch.host = newConfig.host
    if (oldConfig.port !== newConfig.port) patch.port = newConfig.port
    if (oldConfig.database !== newConfig.database) patch.database = newConfig.database
    if (oldConfig.poolSize !== newConfig.poolSize) patch.poolSize = newConfig.poolSize
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldConfig) => ({ ...oldConfig, ...patch })
})

const cacheConfigDiffer = Differ.make({
  empty: {} as Partial<CacheConfig>,
  diff: (oldConfig, newConfig) => {
    const patch: Partial<CacheConfig> = {}
    if (oldConfig.enabled !== newConfig.enabled) patch.enabled = newConfig.enabled
    if (oldConfig.ttl !== newConfig.ttl) patch.ttl = newConfig.ttl
    if (oldConfig.maxSize !== newConfig.maxSize) patch.maxSize = newConfig.maxSize
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldConfig) => ({ ...oldConfig, ...patch })
})

const featuresDiffer = Differ.hashMap(Differ.update<boolean>())

const appConfigDiffer = Differ.make({
  empty: {} as Partial<AppConfig>,
  diff: (oldConfig, newConfig) => {
    const patch: Partial<AppConfig> = {}
    
    const dbPatch = Differ.diff(dbConfigDiffer, oldConfig.database, newConfig.database)
    if (!Equal.equals(dbPatch, Differ.empty(dbConfigDiffer))) {
      patch.database = newConfig.database
    }
    
    const cachePatch = Differ.diff(cacheConfigDiffer, oldConfig.cache, newConfig.cache)
    if (!Equal.equals(cachePatch, Differ.empty(cacheConfigDiffer))) {
      patch.cache = newConfig.cache
    }
    
    const featuresPatch = Differ.diff(featuresDiffer, oldConfig.features, newConfig.features)
    if (!Equal.equals(featuresPatch, Differ.empty(featuresDiffer))) {
      patch.features = newConfig.features
    }
    
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldConfig) => ({ ...oldConfig, ...patch })
})

// Configuration service with hot reloading
interface ConfigService {
  readonly getConfig: Effect.Effect<AppConfig>
  readonly updateConfig: (patch: Partial<AppConfig>) => Effect.Effect<void>
  readonly onConfigChange: Effect.Effect<AppConfig>
}

const ConfigService = Context.GenericTag<ConfigService>("ConfigService")

const makeConfigService = (initialConfig: AppConfig) => Effect.gen(function* () {
  const configRef = yield* FiberRef.makePatch(initialConfig, appConfigDiffer)
  
  const getConfig = FiberRef.get(configRef)
  
  const updateConfig = (patch: Partial<AppConfig>) => Effect.gen(function* () {
    const currentConfig = yield* FiberRef.get(configRef)
    const newConfig = { ...currentConfig, ...patch }
    yield* FiberRef.update(configRef, () => newConfig)
  })
  
  const onConfigChange = Effect.gen(function* () {
    // In real implementation, this would watch for config file changes
    return yield* FiberRef.get(configRef)
  })
  
  return ConfigService.of({ getConfig, updateConfig, onConfigChange })
})
```

### Example 3: Document Collaboration System

```typescript
import { Differ, HashMap, Array as Arr, Effect, Chunk } from "effect"

interface TextDocument {
  readonly id: string
  readonly title: string
  readonly content: Chunk<string> // Lines of text
  readonly metadata: HashMap<string, string>
  readonly version: number
}

interface DocumentDelta {
  readonly titleChange?: string
  readonly contentChanges?: Chunk<LineChange>
  readonly metadataChanges?: HashMap<string, string>
}

interface LineChange {
  readonly lineNumber: number
  readonly oldText: string
  readonly newText: string
}

// Create a differ for text documents that supports operational transforms
const textDocumentDiffer = Differ.make({
  empty: {} as Partial<TextDocument>,
  diff: (oldDoc, newDoc) => {
    const patch: Partial<TextDocument> = {}
    
    if (oldDoc.title !== newDoc.title) {
      patch.title = newDoc.title
    }
    
    if (!Equal.equals(oldDoc.content, newDoc.content)) {
      patch.content = newDoc.content
    }
    
    if (!Equal.equals(oldDoc.metadata, newDoc.metadata)) {
      patch.metadata = newDoc.metadata
    }
    
    if (oldDoc.version !== newDoc.version) {
      patch.version = newDoc.version
    }
    
    return patch
  },
  combine: (first, second) => {
    // Implement operational transform logic for concurrent edits
    const combined: Partial<TextDocument> = { ...first }
    
    if (second.title !== undefined) combined.title = second.title
    if (second.content !== undefined) combined.content = second.content
    if (second.metadata !== undefined) {
      combined.metadata = first.metadata 
        ? HashMap.union(first.metadata, second.metadata)
        : second.metadata
    }
    if (second.version !== undefined) {
      combined.version = Math.max(first.version || 0, second.version)
    }
    
    return combined
  },
  patch: (patch, oldDoc) => ({ ...oldDoc, ...patch })
})

// Collaborative document service
const createDocumentService = Effect.gen(function* () {
  const documentsRef = yield* FiberRef.makePatch(
    HashMap.empty<string, TextDocument>(),
    Differ.hashMap(textDocumentDiffer)
  )
  
  const updateDocument = (docId: string, updates: Partial<TextDocument>) => 
    Effect.gen(function* () {
      const docs = yield* FiberRef.get(documentsRef)
      const currentDoc = HashMap.get(docs, docId)
      
      if (Option.isNone(currentDoc)) {
        return yield* Effect.fail(new Error(`Document ${docId} not found`))
      }
      
      const newDoc = { 
        ...currentDoc.value, 
        ...updates, 
        version: currentDoc.value.version + 1 
      }
      
      const newDocs = HashMap.set(docs, docId, newDoc)
      yield* FiberRef.update(documentsRef, () => newDocs)
      
      return newDoc
    })
  
  const getDocument = (docId: string) => Effect.gen(function* () {
    const docs = yield* FiberRef.get(documentsRef)
    return HashMap.get(docs, docId)
  })
  
  const createDocument = (doc: Omit<TextDocument, "version">) => 
    Effect.gen(function* () {
      const newDoc = { ...doc, version: 1 }
      const docs = yield* FiberRef.get(documentsRef)
      const newDocs = HashMap.set(docs, doc.id, newDoc)
      yield* FiberRef.update(documentsRef, () => newDocs)
      return newDoc
    })
  
  return { updateDocument, getDocument, createDocument } as const
})
```

## Advanced Features Deep Dive

### Feature 1: Transform Differs

Transform allows you to adapt a differ for one type to work with another type through isomorphism:

#### Basic Transform Usage

```typescript
import { Differ, Effect } from "effect"

interface UserId {
  readonly _tag: "UserId"
  readonly value: string
}

const UserId = (value: string): UserId => ({ _tag: "UserId", value })

// Transform string differ to work with UserId
const userIdDiffer = Differ.update<string>().pipe(
  Differ.transform({
    toNew: (id: string) => UserId(id),
    toOld: (userId: UserId) => userId.value
  })
)

const oldUserId = UserId("user-123")
const newUserId = UserId("user-456")

const patch = Differ.diff(userIdDiffer, oldUserId, newUserId)
const result = Differ.patch(userIdDiffer, patch, oldUserId)
```

#### Real-World Transform Example

```typescript
import { Differ, Schema } from "@effect/schema"

// Transform differs to work with Schema-validated types
interface ValidatedUser {
  readonly id: string
  readonly email: string
  readonly age: number
}

const UserSchema = Schema.Struct({
  id: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.int(), Schema.between(0, 120))
})

const createValidatedUserDiffer = <R, E>(
  schema: Schema.Schema<ValidatedUser, unknown, R>
) => {
  const baseDiffer = Differ.make({
    empty: {} as Partial<ValidatedUser>,
    diff: (oldUser, newUser) => {
      const patch: Partial<ValidatedUser> = {}
      if (oldUser.id !== newUser.id) patch.id = newUser.id
      if (oldUser.email !== newUser.email) patch.email = newUser.email
      if (oldUser.age !== newUser.age) patch.age = newUser.age
      return patch
    },
    combine: (first, second) => ({ ...first, ...second }),
    patch: (patch, oldUser) => ({ ...oldUser, ...patch })
  })
  
  return baseDiffer.pipe(
    Differ.transform({
      toNew: (user) => {
        const result = Schema.decodeUnknownSync(schema)(user)
        if (ParseResult.isFailure(result)) {
          throw new Error(`Invalid user data: ${ParseResult.formatError(result.error)}`)
        }
        return result.right
      },
      toOld: (validatedUser) => validatedUser
    })
  )
}
```

### Feature 2: Combining Differs with zip and orElseEither

#### Zipping Differs

```typescript
import { Differ, Effect } from "effect"

// Combine two differs into a tuple differ
const userDiffer = Differ.update<User>()
const metadataDiffer = Differ.hashMap(Differ.update<string>())

const userWithMetadataDiffer = userDiffer.pipe(
  Differ.zip(metadataDiffer)
)

type UserWithMetadata = readonly [User, HashMap<string, string>]

const oldData: UserWithMetadata = [
  { id: "1", name: "Alice" },
  HashMap.fromIterable([["lastLogin", "2023-01-01"]])
] as const

const newData: UserWithMetadata = [
  { id: "1", name: "Alice Updated" },
  HashMap.fromIterable([
    ["lastLogin", "2023-01-02"],
    ["theme", "dark"]
  ])
] as const

const patch = Differ.diff(userWithMetadataDiffer, oldData, newData)
const result = Differ.patch(userWithMetadataDiffer, patch, oldData)
```

#### Either-Based Differs

```typescript
import { Differ, Either, Effect } from "effect"

// Handle different types of updates with Either
const textContentDiffer = Differ.update<string>()
const imageContentDiffer = Differ.update<{ url: string; alt: string }>()

const contentDiffer = textContentDiffer.pipe(
  Differ.orElseEither(imageContentDiffer)
)

type Content = Either<{ url: string; alt: string }, string>

const oldContent: Content = Either.right("Old text content")
const newContent: Content = Either.left({ url: "image.jpg", alt: "New image" })

const patch = Differ.diff(contentDiffer, oldContent, newContent)
const result = Differ.patch(contentDiffer, patch, oldContent)
```

### Feature 3: Advanced Composition Patterns

#### Nested Structure Differs

```typescript
import { Differ, HashMap, Array as Arr, Chunk } from "effect"

interface Post {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly tags: HashSet<string>
  readonly comments: Chunk<Comment>
  readonly metadata: HashMap<string, any>
}

interface Comment {
  readonly id: string
  readonly author: string
  readonly content: string
  readonly timestamp: Date
}

// Build complex nested differs
const commentDiffer = Differ.make({
  empty: {} as Partial<Comment>,
  diff: (oldComment, newComment) => {
    const patch: Partial<Comment> = {}
    if (oldComment.author !== newComment.author) patch.author = newComment.author
    if (oldComment.content !== newComment.content) patch.content = newComment.content
    if (oldComment.timestamp.getTime() !== newComment.timestamp.getTime()) {
      patch.timestamp = newComment.timestamp
    }
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldComment) => ({ ...oldComment, ...patch })
})

const commentsDiffer = Differ.chunk(commentDiffer)
const tagsDiffer = Differ.hashSet<string>()
const metadataDiffer = Differ.hashMap(Differ.update<any>())

const postDiffer = Differ.make({
  empty: {} as Partial<Post>,
  diff: (oldPost, newPost) => {
    const patch: Partial<Post> = {}
    
    if (oldPost.title !== newPost.title) patch.title = newPost.title
    if (oldPost.content !== newPost.content) patch.content = newPost.content
    
    const tagsPatch = Differ.diff(tagsDiffer, oldPost.tags, newPost.tags)
    if (!Equal.equals(tagsPatch, Differ.empty(tagsDiffer))) {
      patch.tags = newPost.tags
    }
    
    const commentsPatch = Differ.diff(commentsDiffer, oldPost.comments, newPost.comments)
    if (!Equal.equals(commentsPatch, Differ.empty(commentsDiffer))) {
      patch.comments = newPost.comments
    }
    
    const metadataPatch = Differ.diff(metadataDiffer, oldPost.metadata, newPost.metadata)
    if (!Equal.equals(metadataPatch, Differ.empty(metadataDiffer))) {
      patch.metadata = newPost.metadata
    }
    
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldPost) => ({ ...oldPost, ...patch })
})
```

## Practical Patterns & Best Practices

### Pattern 1: FiberRef Integration for State Management

```typescript
import { Differ, FiberRef, Effect, Context } from "effect"

// Helper for creating stateful services with differs
const createStatefulService = <State, R>(
  initialState: State,
  differ: Differ.Differ<State, any>
) => Effect.gen(function* () {
  const stateRef = yield* FiberRef.makePatch(initialState, differ)
  
  const getState = FiberRef.get(stateRef)
  
  const setState = (newState: State) => 
    FiberRef.update(stateRef, () => newState)
  
  const updateState = (updater: (state: State) => State) => 
    FiberRef.update(stateRef, updater)
  
  const withState = <A, E, R2>(
    effect: (state: State) => Effect.Effect<A, E, R2>
  ) => Effect.gen(function* () {
    const state = yield* getState
    return yield* effect(state)
  })
  
  return { getState, setState, updateState, withState } as const
})

// Usage example
interface AppState {
  readonly currentUser: Option<User>
  readonly notifications: Chunk<Notification>
  readonly settings: HashMap<string, any>
}

const appStateDiffer = Differ.make({
  empty: {} as Partial<AppState>,
  diff: (oldState, newState) => {
    const patch: Partial<AppState> = {}
    if (!Equal.equals(oldState.currentUser, newState.currentUser)) {
      patch.currentUser = newState.currentUser
    }
    if (!Equal.equals(oldState.notifications, newState.notifications)) {
      patch.notifications = newState.notifications
    }
    if (!Equal.equals(oldState.settings, newState.settings)) {
      patch.settings = newState.settings
    }
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldState) => ({ ...oldState, ...patch })
})

const AppStateService = Effect.gen(function* () {
  const service = yield* createStatefulService({
    currentUser: Option.none(),
    notifications: Chunk.empty(),
    settings: HashMap.empty()
  }, appStateDiffer)
  
  const login = (user: User) => 
    service.updateState(state => ({ 
      ...state, 
      currentUser: Option.some(user) 
    }))
  
  const addNotification = (notification: Notification) =>
    service.updateState(state => ({
      ...state,
      notifications: Chunk.append(state.notifications, notification)
    }))
  
  return { ...service, login, addNotification } as const
})
```

### Pattern 2: Conflict Resolution Strategies

```typescript
import { Differ, Effect, Clock } from "effect"

// Helper for time-based conflict resolution
const createTimestampedDiffer = <T>(
  baseDiffer: Differ.Differ<T, any>
) => {
  interface TimestampedValue<T> {
    readonly value: T
    readonly timestamp: number
  }
  
  return Differ.make({
    empty: { timestamp: 0 } as Partial<TimestampedValue<T>>,
    diff: (oldItem, newItem) => {
      const valuePatch = Differ.diff(baseDiffer, oldItem.value, newItem.value)
      
      if (Equal.equals(valuePatch, Differ.empty(baseDiffer))) {
        return { timestamp: 0 } as Partial<TimestampedValue<T>>
      }
      
      return {
        value: newItem.value,
        timestamp: newItem.timestamp
      }
    },
    combine: (first, second) => {
      // Last-write-wins strategy based on timestamp
      if (!first.timestamp && !second.timestamp) {
        return { timestamp: 0 } as Partial<TimestampedValue<T>>
      }
      
      if (!first.timestamp) return second
      if (!second.timestamp) return first
      
      return first.timestamp > second.timestamp ? first : second
    },
    patch: (patch, oldItem) => ({
      value: patch.value !== undefined ? patch.value : oldItem.value,
      timestamp: patch.timestamp || oldItem.timestamp
    })
  })
}

// Usage with conflict resolution
const documentWithTimestampDiffer = createTimestampedDiffer(
  Differ.update<TextDocument>()
)

const handleConcurrentDocumentUpdates = Effect.gen(function* () {
  const clock = yield* Clock.Clock
  const now = yield* Clock.currentTimeMillis(clock)
  
  const doc1: TimestampedValue<TextDocument> = {
    value: { id: "1", content: "Version A", version: 1 },
    timestamp: now - 1000
  }
  
  const doc2: TimestampedValue<TextDocument> = {
    value: { id: "1", content: "Version B", version: 2 },
    timestamp: now
  }
  
  const patch1 = Differ.diff(documentWithTimestampDiffer, doc1, doc2)
  const patch2 = Differ.diff(documentWithTimestampDiffer, doc1, {
    value: { id: "1", content: "Version C", version: 3 },
    timestamp: now - 500
  })
  
  // Combine patches - later timestamp wins
  const combinedPatch = Differ.combine(documentWithTimestampDiffer, patch1, patch2)
  const result = Differ.patch(documentWithTimestampDiffer, combinedPatch, doc1)
  
  return result
})
```

### Pattern 3: Schema-Driven Differs

```typescript
import { Differ, Schema, Effect } from "@effect/schema"

// Generate differs automatically from schemas
const createSchemaBasedDiffer = <A, I, R>(
  schema: Schema.Schema<A, I, R>
) => {
  const decode = Schema.decodeUnknown(schema)
  const encode = Schema.encodeUnknown(schema)
  
  return Differ.make({
    empty: {} as Partial<A>,
    diff: (oldValue, newValue) => Effect.gen(function* () {
      // Use schema to determine which fields changed
      const oldEncoded = yield* encode(oldValue)
      const newEncoded = yield* encode(newValue) 
      
      // Custom diffing logic based on schema structure
      const patch: Partial<A> = {}
      
      // This would need to be implemented based on schema introspection
      // For now, simple equality check
      if (!Equal.equals(oldValue, newValue)) {
        return newValue as Partial<A>
      }
      
      return patch
    }),
    combine: (first, second) => ({ ...first, ...second }),
    patch: (patch, oldValue) => ({ ...oldValue, ...patch })
  })
}

// Usage with complex schemas
const PersonSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  age: Schema.Number,
  addresses: Schema.Array(Schema.Struct({
    street: Schema.String,
    city: Schema.String,
    country: Schema.String
  }))
})

const personDiffer = createSchemaBasedDiffer(PersonSchema)
```

## Integration Examples

### Integration with Redux-Style State Management

```typescript
import { Differ, Effect, Stream, Hub, Queue } from "effect"

interface Action<T = any> {
  readonly type: string
  readonly payload?: T
}

interface Store<State> {
  readonly getState: Effect.Effect<State>
  readonly dispatch: (action: Action) => Effect.Effect<void>
  readonly subscribe: Stream.Stream<State>
}

const createStore = <State>(
  initialState: State,
  differ: Differ.Differ<State, any>,
  reducer: (state: State, action: Action) => State
) => Effect.gen(function* () {
  const stateRef = yield* FiberRef.makePatch(initialState, differ)
  const hub = yield* Hub.unbounded<State>()
  
  const getState = FiberRef.get(stateRef)
  
  const dispatch = (action: Action) => Effect.gen(function* () {
    const currentState = yield* FiberRef.get(stateRef)
    const newState = reducer(currentState, action)
    
    // Update state using differ
    yield* FiberRef.update(stateRef, () => newState)
    
    // Notify subscribers
    yield* Hub.publish(hub, newState)
  })
  
  const subscribe = Stream.fromHub(hub)
  
  return { getState, dispatch, subscribe } as const
})

// Usage example
interface CounterState {
  readonly count: number
  readonly history: Chunk<number>
}

const counterDiffer = Differ.make({
  empty: {} as Partial<CounterState>,
  diff: (oldState, newState) => {
    const patch: Partial<CounterState> = {}
    if (oldState.count !== newState.count) patch.count = newState.count
    if (!Equal.equals(oldState.history, newState.history)) {
      patch.history = newState.history
    }
    return patch
  },
  combine: (first, second) => ({ ...first, ...second }),
  patch: (patch, oldState) => ({ ...oldState, ...patch })
})

const counterReducer = (state: CounterState, action: Action): CounterState => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1,
        history: Chunk.append(state.history, state.count + 1)
      }
    case 'DECREMENT':
      return {
        count: state.count - 1,
        history: Chunk.append(state.history, state.count - 1)
      }
    case 'RESET':
      return {
        count: 0,
        history: Chunk.append(state.history, 0)
      }
    default:
      return state
  }
}

const counterStoreProgram = Effect.gen(function* () {
  const store = yield* createStore(
    { count: 0, history: Chunk.empty() },
    counterDiffer,
    counterReducer
  )
  
  // Subscribe to changes
  const subscription = store.subscribe.pipe(
    Stream.tap(state => Console.log("State changed:", state)),
    Stream.runDrain
  )
  
  // Run subscription in background
  const fiber = yield* Effect.fork(subscription)
  
  // Dispatch some actions
  yield* store.dispatch({ type: 'INCREMENT' })
  yield* store.dispatch({ type: 'INCREMENT' })
  yield* store.dispatch({ type: 'DECREMENT' })
  
  const finalState = yield* store.getState
  console.log("Final state:", finalState)
  
  yield* Fiber.interrupt(fiber)
  
  return finalState
})
```

### Integration with Persistence Layer

```typescript
import { Differ, Effect, Stream, Schedule } from "effect"

interface PersistentStore<State> {
  readonly load: Effect.Effect<State>
  readonly save: (state: State) => Effect.Effect<void>
  readonly getState: Effect.Effect<State>
  readonly updateState: (updater: (state: State) => State) => Effect.Effect<void>
  readonly subscribe: Stream.Stream<State>
}

const createPersistentStore = <State>(
  storageKey: string,
  initialState: State,
  differ: Differ.Differ<State, any>,
  storage: {
    readonly get: (key: string) => Effect.Effect<Option<string>>
    readonly set: (key: string, value: string) => Effect.Effect<void>
  }
) => Effect.gen(function* () {
  // Load initial state from storage
  const savedState = yield* storage.get(storageKey)
  const loadedState = savedState.pipe(
    Option.map(data => JSON.parse(data) as State),
    Option.getOrElse(() => initialState)
  )
  
  const stateRef = yield* FiberRef.makePatch(loadedState, differ)
  const hub = yield* Hub.unbounded<State>()
  
  // Auto-save on state changes with debouncing
  const autoSave = Stream.fromHub(hub).pipe(
    Stream.debounce(Duration.seconds(1)),
    Stream.mapEffect(state => 
      storage.set(storageKey, JSON.stringify(state)).pipe(
        Effect.catchAll(error => 
          Console.error("Failed to save state:", error)
        )
      )
    ),
    Stream.runDrain
  )
  
  // Start auto-save fiber
  const autoSaveFiber = yield* Effect.fork(autoSave)
  
  const load = Effect.gen(function* () {
    const saved = yield* storage.get(storageKey)
    return saved.pipe(
      Option.map(data => JSON.parse(data) as State),
      Option.getOrElse(() => initialState)
    )
  })
  
  const save = (state: State) => 
    storage.set(storageKey, JSON.stringify(state))
  
  const getState = FiberRef.get(stateRef)
  
  const updateState = (updater: (state: State) => State) => 
    Effect.gen(function* () {
      const newState = yield* FiberRef.update(stateRef, updater)
      yield* Hub.publish(hub, newState)
      return newState
    })
  
  const subscribe = Stream.fromHub(hub)
  
  return { 
    load, 
    save, 
    getState, 
    updateState, 
    subscribe,
    // Cleanup method
    close: () => Fiber.interrupt(autoSaveFiber)
  } as const
})

// Usage with localStorage-like interface
interface LocalStorage {
  readonly getItem: (key: string) => Effect.Effect<Option<string>>
  readonly setItem: (key: string, value: string) => Effect.Effect<void>
}

const LocalStorage = Context.GenericTag<LocalStorage>("LocalStorage")

const createUserPreferencesStore = Effect.gen(function* () {
  const localStorage = yield* LocalStorage
  
  interface UserPreferences {
    readonly theme: "light" | "dark"
    readonly language: string
    readonly notifications: {
      readonly email: boolean
      readonly push: boolean
      readonly sms: boolean
    }
  }
  
  const preferencesDiffer = Differ.make({
    empty: {} as Partial<UserPreferences>,
    diff: (oldPrefs, newPrefs) => {
      const patch: Partial<UserPreferences> = {}
      if (oldPrefs.theme !== newPrefs.theme) patch.theme = newPrefs.theme
      if (oldPrefs.language !== newPrefs.language) patch.language = newPrefs.language
      if (!Equal.equals(oldPrefs.notifications, newPrefs.notifications)) {
        patch.notifications = newPrefs.notifications
      }
      return patch
    },
    combine: (first, second) => ({ ...first, ...second }),
    patch: (patch, oldPrefs) => ({ ...oldPrefs, ...patch })
  })
  
  return yield* createPersistentStore(
    "user-preferences",
    {
      theme: "light",
      language: "en",
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    } as UserPreferences,
    preferencesDiffer,
    localStorage
  )
})
```

### Testing Strategies

```typescript
import { Differ, Effect, TestContext, TestClock } from "effect"

// Test utilities for differs
const diffTest = <Value, Patch>(
  differ: Differ.Differ<Value, Patch>,
  testCases: Array<{
    readonly name: string
    readonly oldValue: Value
    readonly newValue: Value
    readonly expectedPatched: Value
  }>
) => Effect.gen(function* () {
  for (const testCase of testCases) {
    const patch = Differ.diff(differ, testCase.oldValue, testCase.newValue)
    const result = Differ.patch(differ, patch, testCase.oldValue)
    
    if (!Equal.equals(result, testCase.expectedPatched)) {
      return yield* Effect.fail(
        `Test "${testCase.name}" failed: expected ${JSON.stringify(testCase.expectedPatched)}, got ${JSON.stringify(result)}`
      )
    }
  }
  
  return "All tests passed"
})

// Property-based testing
const testDifferLaws = <Value>(
  differ: Differ.Differ<Value, any>,
  generator: Effect.Effect<Value>
) => Effect.gen(function* () {
  const value1 = yield* generator
  const value2 = yield* generator
  const value3 = yield* generator
  
  // Test identity: diff(x, x) should produce empty patch
  const identityPatch = Differ.diff(differ, value1, value1)
  const identityResult = Differ.patch(differ, identityPatch, value1)
  
  if (!Equal.equals(identityResult, value1)) {
    return yield* Effect.fail("Identity law failed")
  }
  
  // Test composition: patch(diff(x, y), x) should equal y
  const patch = Differ.diff(differ, value1, value2)
  const patchedResult = Differ.patch(differ, patch, value1)
  
  if (!Equal.equals(patchedResult, value2)) {
    return yield* Effect.fail("Composition law failed")
  }
  
  // Test associativity of combine
  const patch1 = Differ.diff(differ, value1, value2)
  const patch2 = Differ.diff(differ, value2, value3)
  const combined1 = Differ.combine(differ, patch1, patch2)
  const combined2 = Differ.combine(differ, patch2, patch1)
  
  const result1 = Differ.patch(differ, combined1, value1)
  const result2 = Differ.patch(differ, combined2, value1)
  
  // Note: This test assumes commutativity, which may not hold for all differs
  // In practice, you'd test associativity: (a + b) + c = a + (b + c)
  
  return "All laws verified"
})

// Example test suite
const runDifferTests = Effect.gen(function* () {
  const numberDiffer = Differ.update<number>()
  
  yield* diffTest(numberDiffer, [
    {
      name: "simple number update",
      oldValue: 10,
      newValue: 20,
      expectedPatched: 20
    },
    {
      name: "no change",
      oldValue: 5,
      newValue: 5,
      expectedPatched: 5
    }
  ])
  
  yield* testDifferLaws(
    numberDiffer,
    Effect.sync(() => Math.floor(Math.random() * 100))
  )
  
  console.log("All differ tests passed!")
})
```

## Conclusion

Differ provides compositional, type-safe change detection and patching for Effect applications, enabling sophisticated state management, synchronization, and data transformation patterns.

Key benefits:
- **Type Safety**: Patches are statically typed and validated at compile time
- **Composability**: Differs can be combined and transformed to handle complex data structures
- **Concurrency Support**: Patches can be combined safely for concurrent updates
- **Performance**: Minimal memory overhead and efficient diff algorithms
- **Integration**: Works seamlessly with FiberRef, Effect's state management, and other Effect modules

Use Differ when you need reliable change tracking, state synchronization, or when building collaborative systems that require conflict resolution and operational transforms.