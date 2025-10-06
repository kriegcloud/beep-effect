# Layer Composition Patterns

This document describes the Layer composition patterns used for dependency injection, service provision, and resource management in the Effect ecosystem.

## Core Pattern: Layer-Based Architecture

### 1. Layer Dependency Flow

```typescript
// Production Server Layer Stack
export const serverLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),           // ← API implementation
  HttpServer.withLogAddress,        // ← Logging middleware  
  Layer.provide(BunHttpServer.layer({ port: 3000 }))  // ← Platform server
)

// API Layer depends on handlers
const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)         // ← Handler implementations
)
```

**Dependency Graph:**
```
serverLive
├── HttpApiBuilder.serve()         (top layer)
├── HttpServer.withLogAddress      (middleware)  
├── apiLive                        (API implementation)
│   └── healthLive                (handlers)
└── BunHttpServer.layer()         (platform)
```

### 2. Layer Types and Purposes

| Layer Type | Purpose | Example |
|------------|---------|---------|
| **Platform Layer** | Physical runtime/server | `BunHttpServer.layer()` |
| **Service Layer** | Business logic | `healthLive` handlers |
| **Infrastructure Layer** | Cross-cutting concerns | `HttpServer.withLogAddress` |
| **Composition Layer** | Orchestration | `HttpApiBuilder.serve()` |

## Provision Patterns

### 1. Layer.provide() - Dependency Replacement

```typescript
const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)         // Provides handlers to API
)
```

**Usage:**
- **Replaces Dependencies**: API needs handlers, we provide them
- **Bottom-Up**: Lower layers provide services to upper layers  
- **Type Safety**: Compiler ensures all dependencies are satisfied

### 2. Layer.provideMerge() - Service Extension  

```typescript
const testServerWithMockConsole = testServerLive.pipe(
  Layer.provide(Logger.add(Logger.defaultLogger)),
  Layer.provide(Console.setConsole(mockConsole)),
  Layer.provideMerge(FetchHttpClient.layer)     // ← Merge additional service
)
```

**When to Use:**
- **Add Services**: When you need to add services without replacing existing ones
- **Testing**: Add test-specific services (HTTP client, mock services)
- **Enhancement**: Extend functionality without breaking existing dependencies

### 3. Middleware Pattern with Layers

```typescript
export const serverLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),           // Core functionality
  HttpServer.withLogAddress,        // ← Middleware: adds logging
  Layer.provide(BunHttpServer.layer({ port: 3000 }))
)
```

**Middleware Characteristics:**
- **Non-intrusive**: Doesn't change core API behavior
- **Composable**: Can stack multiple middleware
- **Order-dependent**: Middleware order matters

## Environment-Specific Layer Patterns

### 1. Production vs Test Layer Separation

```typescript
// Production Layer (src/http/server.ts)
export const serverLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3000 }))  // ← Fixed port
)

// Test Layer (test/utils/testServer.ts)  
export const testServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),           // ← Same API implementation
  HttpServer.withLogAddress,        // ← Same logging
  Layer.provide(NodeHttpServer.layer(createServer, { port: 0 }))  // ← Random port
)
```

**Pattern Benefits:**
- **Same Logic**: Core API logic identical between environments
- **Different Infrastructure**: Platform-specific implementations
- **Test Isolation**: Random ports prevent test conflicts

### 2. Service Configuration Pattern

```typescript
// Service Creation
const mockConsole = createMockConsole()

// Service Provision
const testServerWithMockConsole = testServerLive.pipe(
  Layer.provide(Logger.add(Logger.defaultLogger)),    // Add logger
  Layer.provide(Console.setConsole(mockConsole)),     // Replace console
  Layer.provideMerge(FetchHttpClient.layer)           // Add HTTP client
)
```

**Configuration Strategies:**
- **Add**: `Logger.add()` - Add new service instances
- **Replace**: `Console.setConsole()` - Replace default implementations  
- **Merge**: `Layer.provideMerge()` - Extend service availability

## Service Factory Pattern

### 1. Factory Function for Test Services

```typescript
export const createTestHttpServer = () => {
  // Create services
  const { mockConsole, messages } = createMockConsole()
  
  // Compose layer
  const testServerWithMockConsole = testServerLive.pipe(
    Layer.provide(Logger.add(Logger.defaultLogger)),
    Layer.provide(Console.setConsole(mockConsole)),
    Layer.provideMerge(FetchHttpClient.layer)
  )

  // Utility functions
  const getServerUrl = () => { /* extract URL from logs */ }

  // Return composed services
  return {
    testServerLayer: testServerWithMockConsole,
    getServerUrl,
    messages
  }
}
```

**Factory Pattern Benefits:**
- **Encapsulation**: Hides service creation complexity
- **Reusability**: Same factory for all HTTP tests
- **Consistency**: Standardized test server configuration
- **Flexibility**: Returns both layer and utilities

### 2. Service Composition in Factories

```typescript
// Inside createTestHttpServer()
const testServerWithMockConsole = testServerLive.pipe(
  Layer.provide(Logger.add(Logger.defaultLogger)),    // ← Service 1
  Layer.provide(Console.setConsole(mockConsole)),     // ← Service 2  
  Layer.provideMerge(FetchHttpClient.layer)           // ← Service 3
)
```

**Composition Order:**
1. **Base Layer**: `testServerLive` (server + API)
2. **Logging Services**: Logger and Console for testing
3. **HTTP Client**: FetchHttpClient for making requests

## Application Launch Pattern

### 1. Layer.launch() Pattern

```typescript
// Application Entry Point
if (import.meta.main) {
  Layer.launch(serverLive).pipe(BunRuntime.runMain)
}
```

**Launch Process:**
1. **Layer.launch()**: Starts the layer and keeps it running
2. **BunRuntime.runMain**: Integrates with Bun runtime lifecycle
3. **Resource Management**: Automatic cleanup on process termination

### 2. Runtime Integration Pattern

```typescript
// Production: Bun Runtime
Layer.launch(serverLive).pipe(BunRuntime.runMain)

// Test: Effect Runtime with layer() helper
layer(testServerLayer)((it) => {
  // Tests run with layer active
})
```

**Runtime Differences:**
- **Production**: Long-running process with BunRuntime
- **Testing**: Scoped execution with automatic cleanup

## Configuration-Driven Layer Patterns

### 1. Layer.unwrapEffect() with Configuration

```typescript
import { Config, Effect, Layer } from "effect"

// Configuration definition
export const serverPortConfig = Config.port("PORT").pipe(
  Config.withDefault(3000)
)

// Layer that depends on configuration
export const serverLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPortConfig  // ← Resolve config first
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(BunHttpServer.layer({ port }))  // ← Use resolved port
    )
  })
)
```

**Layer.unwrapEffect() Pattern:**
- **Configuration Resolution**: Resolves Effect-based configuration during layer creation
- **Dynamic Layer Construction**: Creates layers based on runtime configuration
- **Type Safety**: Full Effect type checking for configuration errors
- **Fail-Fast**: Configuration errors surface during layer initialization

### 2. Configuration Flow with unwrapEffect

```
Environment Variable → Config.port() → Layer.unwrapEffect → Server Layer
     ↓                      ↓                ↓                   ↓
   PORT=8080        Validation [1-65535]   Effect.gen        BunHttpServer
                         ↓                      ↓
                   Config.withDefault(3000)   port value
```

**Flow Characteristics:**
1. **Environment Reading**: `Config.port("PORT")` reads and validates PORT
2. **Default Application**: `Config.withDefault(3000)` provides fallback
3. **Effect Resolution**: `Layer.unwrapEffect` resolves configuration Effect
4. **Layer Construction**: Dynamic layer creation with resolved values

### 3. Configuration Error Handling

```typescript
// Configuration errors propagate through Effect system
const serverLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPortConfig  // ← Can fail with ConfigError
    return HttpApiBuilder.serve().pipe(/* ... */)
  })
)

// Error types from Config.port()
type ConfigErrors = 
  | ConfigError.InvalidData    // PORT=invalid
  | ConfigError.InvalidData    // PORT=70000 (out of range)
```

**Error Handling Benefits:**
- **Fail-Fast**: Invalid configuration prevents server startup
- **Type-Safe Errors**: ConfigError types are known at compile time
- **Clear Messages**: Effect's Config API provides descriptive error messages
- **Effect Integration**: Errors flow naturally through Effect error system

### 4. Advanced Configuration Patterns

```typescript
// Multiple configuration values
const serverConfig = Effect.gen(function* () {
  const port = yield* Config.port("PORT").pipe(Config.withDefault(3000))
  const host = yield* Config.string("HOST").pipe(Config.withDefault("0.0.0.0"))
  return { port, host }
})

// Configuration-dependent layer with multiple values
export const serverLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { port, host } = yield* serverConfig
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(BunHttpServer.layer({ port, hostname: host }))
    )
  })
)
```

## Advanced Layer Patterns

### 1. Platform Abstraction Layer

```typescript
// Production (configurable port)
export const serverLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPortConfig
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(BunHttpServer.layer({ port }))  // ← Dynamic port
    )
  })
)

// Testing (fixed behavior)
Layer.provide(NodeHttpServer.layer(createServer, { port: 0 }))
```

**Abstraction Benefits:**
- **Same Interface**: Both provide HTTP server capability
- **Different Implementations**: Production configurable, testing fixed
- **Environment Separation**: Clear distinction between runtime environments

### 2. Service Replacement Pattern

```typescript
// Default console → Mock console
Layer.provide(Console.setConsole(mockConsole))

// Default logger → Test logger
Layer.provide(Logger.add(Logger.defaultLogger))
```

**Replacement Use Cases:**
- **Testing**: Replace I/O services with mocks
- **Configuration**: Replace default with environment-specific
- **Debugging**: Replace with instrumented versions

## Layer Composition Best Practices

### 1. Dependency Direction
```typescript
// ✅ Correct: Dependencies flow upward
const serverLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),           // Server depends on API
  Layer.provide(BunHttpServer.layer())  // Server depends on platform
)

// ❌ Incorrect: Circular dependencies
const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(serverLive)         // API cannot depend on server
)
```

### 2. Layer Naming Conventions
- **`*Live`**: Concrete implementations (`healthLive`, `apiLive`)
- **`*Layer`**: Infrastructure layers (`testServerLayer`)
- **`*Mock`**: Test doubles (`mockConsole`)

### 3. File Organization
```
src/
├── http/
│   ├── server.ts       # Production layer composition
│   └── handlers/       # Service implementations
└── index.ts           # Application launch

test/utils/
├── testServer.ts      # Test layer composition
└── httpTestUtils.ts   # Test service factories
```

### 4. Layer Composition Principles
- **Single Responsibility**: Each layer has one purpose
- **Composability**: Layers can be combined in different ways
- **Testability**: Easy to substitute test implementations
- **Resource Safety**: Automatic cleanup and error handling
- **Configuration-Driven**: Use Layer.unwrapEffect for runtime configuration
- **Fail-Fast Configuration**: Invalid configuration prevents layer initialization

### 5. Layer.unwrapEffect Best Practices

```typescript
// ✅ Good: Simple configuration resolution
export const serverLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPortConfig
    return HttpApiBuilder.serve().pipe(/* ... */)
  })
)

// ✅ Good: Multiple configuration values
export const serverLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Effect.all({
      port: serverPortConfig,
      host: serverHostConfig
    })
    return HttpApiBuilder.serve().pipe(/* ... */)
  })
)

// ❌ Avoid: Complex logic in unwrapEffect
export const serverLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPortConfig
    // Avoid heavy computation or complex business logic here
    const processedData = yield* heavyProcessing(port)
    return HttpApiBuilder.serve().pipe(/* ... */)
  })
)
```

**unwrapEffect Guidelines:**
- **Configuration Only**: Use for resolving configuration values
- **Keep Simple**: Avoid complex business logic in unwrapEffect
- **Error Handling**: Let configuration errors bubble up naturally
- **Type Safety**: Trust Effect's configuration validation

This layer-based approach provides powerful dependency injection, clear separation of concerns, excellent testability, and flexible configuration management while maintaining type safety throughout the application.