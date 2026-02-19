# HTTP API Patterns

This document describes the HTTP API implementation patterns used in this project with Effect's platform abstractions.

## Core Pattern: Declarative API Definition

### 1. Three-Layer API Structure

```typescript
// Layer 1: Endpoint Definition
const statusEndpoint = HttpApiEndpoint
  .get("status", "/healthz")
  .addSuccess(Schema.String)

// Layer 2: Group Definition  
const healthGroup = HttpApiGroup
  .make("Health")
  .add(statusEndpoint)

// Layer 3: API Definition
const todosApi = HttpApi
  .make("TodosApi")
  .add(healthGroup)
```

**Key Principles:**
- **Separation of Concerns**: Endpoints, groups, and APIs are defined separately
- **Composability**: Groups can contain multiple endpoints, APIs can contain multiple groups
- **Type Safety**: Schema definitions ensure request/response type safety
- **Declarative**: API structure is defined, not implemented

### 2. Endpoint Definition Pattern

```typescript
const statusEndpoint = HttpApiEndpoint
  .get("status", "/healthz")        // HTTP method and path
  .addSuccess(Schema.String)        // Response schema
```

**Pattern Elements:**
- **Method + Name + Path**: `get("status", "/healthz")`
- **Response Schema**: `.addSuccess(Schema.String)` for type-safe responses
- **Extensible**: Can add `.setPayload()`, `.setHeaders()`, `.addError()` as needed

### 3. Group Organization Pattern

```typescript
const healthGroup = HttpApiGroup
  .make("Health")                   // Group name
  .add(statusEndpoint)             // Add endpoints
```

**Benefits:**
- **Logical Grouping**: Related endpoints grouped together
- **Namespace Organization**: Clear API structure
- **Handler Grouping**: Implementations grouped by API groups

### 4. API Composition Pattern

```typescript
const todosApi = HttpApi
  .make("TodosApi")                 // API name
  .add(healthGroup)                // Add groups
```

**Scalability:**
- **Multiple Groups**: Can add todos, users, auth groups
- **Single Source of Truth**: Complete API definition in one place
- **Client Generation**: Same definition can generate typed clients

## Implementation Pattern: Handler Definition

### 1. Group Handler Implementation

```typescript
export const healthLive = HttpApiBuilder.group(
  todosApi,                         // API reference
  "Health",                         // Group name
  (handlers) =>                     // Handler factory
    handlers.handle(
      "status",                     // Endpoint name
      () => Effect.succeed("Server is running successfully")
    )
)
```

**Pattern Elements:**
- **API Reference**: Links handler to specific API definition
- **Group Name**: Must match the group name in API definition
- **Handler Factory**: Function that receives handlers object
- **Effect-based**: All handlers return Effects for composability

### 2. Handler Function Pattern

```typescript
handlers.handle(
  "status",                         // Endpoint name (must match)
  () => Effect.succeed("...")       // Handler implementation
)
```

**Key Aspects:**
- **Name Matching**: Handler name must match endpoint name
- **Effect Return**: Always return an Effect for error handling
- **Pure Functions**: Handlers should be pure (no side effects)
- **Type Safety**: Return type must match endpoint schema

## Server Configuration Pattern

### 1. Layer Composition for Server

```typescript
// API Implementation Layer
const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)         // Provide handler implementations
)

// Server Layer
export const serverLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),           // Provide API implementation
  HttpServer.withLogAddress,        // Add address logging
  Layer.provide(BunHttpServer.layer({ port: 3000 }))  // Platform server
)
```

**Layer Stack (bottom to top):**
1. **Platform Layer**: `BunHttpServer.layer()` - Physical server
2. **Logging Layer**: `HttpServer.withLogAddress` - Address logging
3. **API Layer**: `apiLive` - API implementation with handlers
4. **Server Layer**: `HttpApiBuilder.serve()` - HTTP service

### 2. Platform Abstraction Pattern

```typescript
// Production: Bun Runtime
Layer.provide(BunHttpServer.layer({ port: 3000 }))

// Testing: Node.js Runtime  
Layer.provide(NodeHttpServer.layer(createServer, { port: 0 }))
```

**Benefits:**
- **Runtime Independence**: Same API works on different runtimes
- **Test Isolation**: Different server config for testing
- **Performance**: Use optimal runtime for each environment

## Application Entry Pattern

### 1. Simple Launch Pattern

```typescript
if (import.meta.main) {
  Layer.launch(serverLive).pipe(BunRuntime.runMain)
}
```

**Pattern Elements:**
- **Entry Guard**: `import.meta.main` prevents execution when imported
- **Layer Launch**: `Layer.launch()` starts the server layer
- **Runtime Integration**: `.pipe(BunRuntime.runMain)` for Bun runtime

### 2. Layer-Based Architecture

```typescript
// Dependency flow:
BunRuntime.runMain
├── Layer.launch(serverLive)
    ├── HttpApiBuilder.serve()
    ├── HttpServer.withLogAddress  
    ├── apiLive
    │   └── healthLive (handlers)
    └── BunHttpServer.layer()
```

**Advantages:**
- **Dependency Injection**: Automatic service resolution
- **Resource Management**: Automatic cleanup on shutdown
- **Testability**: Easy to swap layers for testing

## Schema Integration Pattern

### 1. Type-Safe Responses

```typescript
.addSuccess(Schema.String)          // Response will be string
```

**Type Flow:**
1. Schema defines the response type
2. Handler must return matching type
3. Client receives typed response
4. Automatic serialization/deserialization

### 2. Future Extensions

```typescript
// Request payload
.setPayload(Schema.Struct({ name: Schema.String }))

// Error responses  
.addError(UserNotFound, { status: 404 })

// URL parameters
.setPath(Schema.Struct({ id: Schema.NumberFromString }))
```

## Best Practices

### 1. Naming Conventions
- **Endpoints**: Descriptive names (`status`, `getUser`, `createTodo`)
- **Groups**: Noun-based (`Health`, `Users`, `Todos`)
- **APIs**: Project-based (`TodosApi`, `UserManagementApi`)

### 2. File Organization
```
src/http/
├── api.ts              # API definitions only
├── handlers/           # Handler implementations
│   └── health.ts      # Group-specific handlers
└── server.ts          # Server configuration
```

### 3. Separation of Concerns
- **api.ts**: Pure definitions, no implementation
- **handlers/*.ts**: Implementation logic, one file per group
- **server.ts**: Layer composition and configuration

### 4. Type Safety
- Always use Schema for request/response types
- Let TypeScript infer handler types from endpoint schemas
- No `any` types in HTTP layer

This pattern provides a scalable, type-safe, and testable HTTP API architecture using Effect's declarative approach.