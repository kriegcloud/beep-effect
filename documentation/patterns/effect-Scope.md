# Scope: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Scope Solves

Resource management is one of the most challenging aspects of building robust applications. Traditional approaches to resource cleanup are error-prone and often lead to resource leaks, especially in complex concurrent scenarios.

```typescript
// Traditional approach - problematic code
class DatabaseConnection {
  private connection: any
  
  async connect() {
    this.connection = await database.connect()
  }
  
  async close() {
    if (this.connection) {
      await this.connection.close()
    }
  }
}

// Usage that can leak resources
async function processData() {
  const db = new DatabaseConnection()
  try {
    await db.connect()
    // Process data...
    if (someCondition) {
      return // Oops! Connection never closed
    }
    // More processing...
    throw new Error("Something went wrong") // Connection leaked again
  } finally {
    await db.close() // Only works if we remember to add this
  }
}
```

This approach leads to:
- **Memory Leaks** - Resources not properly released when exceptions occur
- **Race Conditions** - Multiple threads accessing cleanup code simultaneously
- **Complex Cleanup Logic** - Managing nested try/finally blocks becomes unwieldy
- **Forgotten Cleanup** - Easy to forget cleanup in all code paths
- **Resource Exhaustion** - Applications crash when system resources are depleted

### The Scope Solution

Scope provides automatic, exception-safe resource management with guaranteed cleanup, even in complex concurrent scenarios.

```typescript
import { Effect, Scope } from "effect"

// Define a resource with automatic cleanup
const createDatabaseConnection = Effect.acquireRelease(
  // Acquire: Open the connection
  Effect.tryPromise({
    try: () => database.connect(),
    catch: () => new Error("Failed to connect")
  }).pipe(Effect.tap(() => Effect.log("Database connected"))),
  
  // Release: Always close the connection
  (connection) => Effect.tryPromise({
    try: () => connection.close(),
    catch: () => new Error("Failed to close connection")
  }).pipe(Effect.tap(() => Effect.log("Database connection closed")))
)

// Usage - cleanup is automatic and guaranteed
const processData = Effect.gen(function* () {
  const db = yield* createDatabaseConnection
  
  // Process data...
  if (someCondition) {
    return "early return" // Connection automatically closed
  }
  
  // More processing...
  yield* Effect.fail("Something went wrong") // Connection still closed automatically
})

// Run with automatic scope management
const program = Effect.scoped(processData)
```

### Key Concepts

**Scope**: A lifecycle container that tracks resources and ensures their cleanup when closed. Resources are released in reverse order of acquisition (LIFO).

**Finalizer**: A cleanup function that runs when a scope closes, regardless of whether the scope closed successfully or due to an error.

**Resource**: Any value that requires cleanup, managed through `Effect.acquireRelease` which pairs acquisition with its corresponding release action.

**Scoped Effect**: An effect that requires a `Scope` to run, indicated by `Effect<A, E, Scope>` in the type signature.

## Basic Usage Patterns

### Pattern 1: Simple Resource Management

```typescript
import { Effect, Scope, Console } from "effect"

// Create a simple resource that needs cleanup
const createResource = Effect.acquireRelease(
  // Acquire the resource
  Effect.gen(function* () {
    yield* Console.log("Acquiring resource...")
    return { id: "resource-1", data: "important data" }
  }),
  
  // Release the resource
  (resource) => Console.log(`Releasing resource ${resource.id}`)
)

// Use the resource
const useResource = Effect.gen(function* () {
  const resource = yield* createResource
  yield* Console.log(`Using resource: ${resource.data}`)
  return resource.data.toUpperCase()
})

// Wrap in scope for automatic cleanup
const program = Effect.scoped(useResource)

Effect.runPromise(program)
/*
Output:
Acquiring resource...
Using resource: important data
Releasing resource resource-1
*/
```

### Pattern 2: Manual Finalizer Management

```typescript
import { Effect, Scope, Console, Exit } from "effect"

// Add custom finalizers to handle cleanup logic
const withCustomCleanup = Effect.gen(function* () {
  // Add a finalizer that runs regardless of outcome
  yield* Effect.addFinalizer((exit) =>
    Console.log(`Cleanup executed. Exit: ${exit._tag}`)
  )
  
  // Add another finalizer for specific cleanup
  yield* Effect.addFinalizer(() =>
    Console.log("Performing additional cleanup...")
  )
  
  yield* Console.log("Doing some work...")
  
  // This could succeed, fail, or be interrupted
  return "work completed"
})

const program = Effect.scoped(withCustomCleanup)

Effect.runPromise(program)
/*
Output:
Doing some work...
Performing additional cleanup...
Cleanup executed. Exit: Success
*/
```

### Pattern 3: Multiple Resource Coordination

```typescript
import { Effect, Console } from "effect"

// Define multiple resources that depend on each other
const createFileHandle = Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log("Opening file...")
    return { handle: "file-123", path: "/tmp/data.txt" }
  }),
  (file) => Console.log(`Closing file ${file.path}`)
)

const createNetworkConnection = Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log("Establishing network connection...")
    return { socket: "socket-456", host: "api.example.com" }
  }),
  (connection) => Console.log(`Closing connection to ${connection.host}`)
)

// Use multiple resources together
const processWithMultipleResources = Effect.gen(function* () {
  const file = yield* createFileHandle
  const network = yield* createNetworkConnection
  
  yield* Console.log("Processing data with both resources...")
  
  // Resources are automatically cleaned up in reverse order
  return { processed: true, file: file.path, host: network.host }
})

const program = Effect.scoped(processWithMultipleResources)

Effect.runPromise(program)
/*
Output:
Opening file...
Establishing network connection...
Processing data with both resources...
Closing connection to api.example.com
Closing file /tmp/data.txt
*/
```

## Real-World Examples

### Example 1: Database Connection Pool Management

Managing database connections efficiently while ensuring proper cleanup in web applications.

```typescript
import { Effect, Console, Duration, Pool, Data } from "effect"

// Define database connection errors
class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: string
}> {}

// Simulate a database connection
interface DatabaseConnection {
  readonly id: string
  readonly connected: boolean
  query(sql: string): Promise<any[]>
  close(): Promise<void>
}

// Create a database connection resource
const createConnection = Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log("Creating database connection...")
    
    // Simulate connection creation that might fail
    const connection: DatabaseConnection = {
      id: `conn-${Math.random().toString(36).substr(2, 9)}`,
      connected: true,
      query: async (sql: string) => {
        yield* Console.log(`Executing query: ${sql}`)
        return [{ id: 1, name: "John" }, { id: 2, name: "Jane" }]
      },
      close: async () => {
        yield* Console.log("Closing database connection...")
      }
    }
    
    yield* Console.log(`Database connection ${connection.id} established`)
    return connection
  }).pipe(
    Effect.mapError((error) => new DatabaseError({ cause: String(error) }))
  ),
  
  // Cleanup: Always close the connection
  (connection) => Effect.gen(function* () {
    yield* Console.log(`Cleaning up connection ${connection.id}`)
    yield* Effect.tryPromise({
      try: () => connection.close(),
      catch: (error) => new DatabaseError({ cause: `Failed to close: ${error}` })
    })
  })
)

// Create a connection pool
const createConnectionPool = Effect.gen(function* () {
  return yield* Pool.make({
    acquire: createConnection,
    size: 5,
    timeToLive: Duration.minutes(5)
  })
})

// Database service using the connection pool
const executeQuery = (sql: string) => Effect.gen(function* () {
  const pool = yield* createConnectionPool
  
  return yield* Pool.get(pool).pipe(
    Effect.andThen((connection) => 
      Effect.tryPromise({
        try: () => connection.query(sql),
        catch: (error) => new DatabaseError({ cause: String(error) })
      })
    )
  )
})

// Example usage: User service with automatic connection management
const getUserById = (id: number) => Effect.gen(function* () {
  const results = yield* executeQuery(`SELECT * FROM users WHERE id = ${id}`)
  return results[0] || null
})

const processUsers = Effect.gen(function* () {
  const user1 = yield* getUserById(1)
  const user2 = yield* getUserById(2)
  
  yield* Console.log(`Found users: ${JSON.stringify([user1, user2])}`)
  return [user1, user2]
})

// Run with automatic scope and connection management
const program = Effect.scoped(processUsers)

Effect.runPromiseExit(program).then(console.log)
/*
Output:
Creating database connection...
Database connection conn-abc123def established
Executing query: SELECT * FROM users WHERE id = 1
Executing query: SELECT * FROM users WHERE id = 2
Found users: [{"id":1,"name":"John"},{"id":2,"name":"Jane"}]
Cleaning up connection conn-abc123def
Closing database connection...
*/
```

### Example 2: File Processing with Temporary Resources

Processing files with automatic cleanup of temporary resources and intermediate files.

```typescript
import { Effect, Console, Data } from "effect"

class FileError extends Data.TaggedError("FileError")<{
  operation: string
  path: string
  cause: string
}> {}

// Simulate file system operations
const fs = {
  createTempFile: async (prefix: string) => ({
    path: `/tmp/${prefix}-${Date.now()}.tmp`,
    write: async (data: string) => console.log(`Writing to temp file: ${data}`),
    read: async () => "processed data content",
    delete: async () => console.log("Deleting temp file")
  }),
  
  createDir: async (path: string) => ({
    path,
    cleanup: async () => console.log(`Removing directory: ${path}`)
  }),
  
  openFile: async (path: string) => ({
    path,
    read: async () => "file content here",
    close: async () => console.log(`Closing file: ${path}`)
  })
}

// Create temporary file resource
const createTempFile = (prefix: string) => Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log(`Creating temporary file with prefix: ${prefix}`)
    const tempFile = yield* Effect.tryPromise({
      try: () => fs.createTempFile(prefix),
      catch: (error) => new FileError({
        operation: "create",
        path: prefix,
        cause: String(error)
      })
    })
    return tempFile
  }),
  
  (tempFile) => Effect.gen(function* () {
    yield* Console.log(`Cleaning up temporary file: ${tempFile.path}`)
    yield* Effect.tryPromise({
      try: () => tempFile.delete(),
      catch: (error) => new FileError({
        operation: "delete", 
        path: tempFile.path,
        cause: String(error)
      })
    })
  })
)

// Create temporary directory resource
const createTempDir = (name: string) => Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log(`Creating temporary directory: ${name}`)
    const dir = yield* Effect.tryPromise({
      try: () => fs.createDir(`/tmp/${name}`),
      catch: (error) => new FileError({
        operation: "mkdir",
        path: name,
        cause: String(error)
      })
    })
    return dir
  }),
  
  (dir) => Effect.gen(function* () {
    yield* Console.log(`Removing temporary directory: ${dir.path}`)
    yield* Effect.tryPromise({
      try: () => dir.cleanup(),
      catch: (error) => new FileError({
        operation: "rmdir",
        path: dir.path,
        cause: String(error)
      })
    })
  })
)

// Open file resource
const openFile = (path: string) => Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log(`Opening file: ${path}`)
    const file = yield* Effect.tryPromise({
      try: () => fs.openFile(path),
      catch: (error) => new FileError({
        operation: "open",
        path,
        cause: String(error)
      })
    })
    return file
  }),
  
  (file) => Effect.gen(function* () {
    yield* Console.log(`Closing file: ${file.path}`)
    yield* Effect.tryPromise({
      try: () => file.close(),
      catch: (error) => new FileError({
        operation: "close",
        path: file.path,
        cause: String(error)
      })
    })
  })
)

// File processing pipeline with multiple resources
const processFileWithTempResources = (inputPath: string) => Effect.gen(function* () {
  // Create temporary workspace
  const tempDir = yield* createTempDir("processing-workspace")
  
  // Create temporary files for intermediate processing
  const tempFile1 = yield* createTempFile("stage1")
  const tempFile2 = yield* createTempFile("stage2")
  
  // Open input file
  const inputFile = yield* openFile(inputPath)
  
  yield* Console.log("Starting file processing pipeline...")
  
  // Stage 1: Read and transform
  const content = yield* Effect.tryPromise({
    try: () => inputFile.read(),
    catch: (error) => new FileError({
      operation: "read",
      path: inputPath,
      cause: String(error)
    })
  })
  
  yield* Effect.tryPromise({
    try: () => tempFile1.write(`Stage 1: ${content.toUpperCase()}`),
    catch: (error) => new FileError({
      operation: "write",
      path: tempFile1.path,
      cause: String(error)
    })
  })
  
  // Stage 2: Further processing
  const stage1Data = yield* Effect.tryPromise({
    try: () => tempFile1.read(),
    catch: (error) => new FileError({
      operation: "read",
      path: tempFile1.path,
      cause: String(error)
    })
  })
  
  yield* Effect.tryPromise({
    try: () => tempFile2.write(`Stage 2: ${stage1Data} [PROCESSED]`),
    catch: (error) => new FileError({
      operation: "write",
      path: tempFile2.path,
      cause: String(error)
    })
  })
  
  // Final result
  const finalResult = yield* Effect.tryPromise({
    try: () => tempFile2.read(),
    catch: (error) => new FileError({
      operation: "read",
      path: tempFile2.path,
      cause: String(error)
    })
  })
  
  yield* Console.log(`Processing complete. Result: ${finalResult}`)
  return finalResult
})

// Usage with automatic cleanup
const program = Effect.scoped(processFileWithTempResources("input.txt"))

Effect.runPromiseExit(program).then(console.log)
/*
Output:
Creating temporary directory: processing-workspace
Creating temporary file with prefix: stage1
Creating temporary file with prefix: stage2
Opening file: input.txt
Starting file processing pipeline...
Writing to temp file: Stage 1: FILE CONTENT HERE
Writing to temp file: Stage 2: Stage 1: FILE CONTENT HERE [PROCESSED]
Processing complete. Result: processed data content
Closing file: input.txt
Cleaning up temporary file: /tmp/stage2-1234567890.tmp
Deleting temp file
Cleaning up temporary file: /tmp/stage1-1234567890.tmp
Deleting temp file
Removing temporary directory: /tmp/processing-workspace
*/
```

### Example 3: HTTP Server with Request-Scoped Resources

Managing request-scoped resources in an HTTP server, ensuring proper cleanup even when requests fail.

```typescript
import { Effect, Console, Context, Layer, Data, Duration } from "effect"

// Define service errors
class HttpError extends Data.TaggedError("HttpError")<{
  status: number
  message: string
}> {}

class RequestError extends Data.TaggedError("RequestError")<{
  requestId: string
  cause: string
}> {}

// Request context
interface RequestContext {
  readonly id: string
  readonly path: string
  readonly method: string
  readonly startTime: number
}

class RequestService extends Context.Tag("RequestService")<
  RequestService,
  RequestContext
>() {}

// Logger service that depends on request context
class LoggerService extends Context.Tag("LoggerService")<
  LoggerService,
  {
    readonly info: (message: string) => Effect.Effect<void>
    readonly error: (message: string, error?: unknown) => Effect.Effect<void>
    readonly cleanup: () => Effect.Effect<void>
  }
>() {}

// Database service for the request
class RequestDatabaseService extends Context.Tag("RequestDatabaseService")<
  RequestDatabaseService,
  {
    readonly findUser: (id: string) => Effect.Effect<{ id: string; name: string }, RequestError>
    readonly close: () => Effect.Effect<void>
  }
>() {}

// Create request-scoped logger
const createRequestLogger = Effect.gen(function* () {
  const request = yield* RequestService
  
  return yield* Effect.acquireRelease(
    Effect.gen(function* () {
      const logger = {
        info: (message: string) => 
          Console.log(`[${request.id}] INFO: ${message}`),
        error: (message: string, error?: unknown) =>
          Console.log(`[${request.id}] ERROR: ${message}`, error ? String(error) : ""),
        cleanup: () => 
          Console.log(`[${request.id}] Logger cleanup completed`)
      }
      
      yield* logger.info("Request logger initialized")
      return logger
    }),
    
    (logger) => logger.cleanup()
  )
})

// Create request-scoped database connection
const createRequestDatabase = Effect.gen(function* () {
  const request = yield* RequestService
  const logger = yield* LoggerService
  
  return yield* Effect.acquireRelease(
    Effect.gen(function* () {
      yield* logger.info("Establishing database connection for request")
      
      const db = {
        findUser: (id: string) => Effect.gen(function* () {
          yield* logger.info(`Querying user with ID: ${id}`)
          
          // Simulate database query
          if (id === "error") {
            return yield* Effect.fail(new RequestError({
              requestId: request.id,
              cause: "User not found"
            }))
          }
          
          return { id, name: `User-${id}` }
        }),
        
        close: () => logger.info("Database connection closed for request")
      }
      
      return db
    }),
    
    (db) => db.close()
  )
})

// HTTP request handler
const handleGetUser = (userId: string) => Effect.gen(function* () {
  const logger = yield* LoggerService
  const db = yield* RequestDatabaseService
  
  yield* logger.info(`Handling GET /users/${userId}`)
  
  const user = yield* db.findUser(userId)
  
  yield* logger.info(`Successfully found user: ${user.name}`)
  
  return {
    status: 200,
    body: { user }
  }
})

// Request processing pipeline with automatic resource management
const processRequest = (requestData: { 
  id: string
  path: string
  method: string 
}) => Effect.gen(function* () {
  const startTime = Date.now()
  
  // Create request context
  const requestContext: RequestContext = {
    ...requestData,
    startTime
  }
  
  // Extract user ID from path (simplified)
  const userId = requestData.path.split('/').pop() || "unknown"
  
  const result = yield* handleGetUser(userId).pipe(
    // Provide request-scoped services
    Effect.provideServiceEffect(RequestService, Effect.succeed(requestContext)),
    Effect.provideServiceEffect(LoggerService, createRequestLogger),
    Effect.provideServiceEffect(RequestDatabaseService, createRequestDatabase)
  )
  
  const duration = Date.now() - startTime
  console.log(`Request ${requestData.id} completed in ${duration}ms`)
  
  return result
})

// Simulate multiple concurrent requests
const simulateRequests = Effect.gen(function* () {
  const requests = [
    { id: "req-1", path: "/users/123", method: "GET" },
    { id: "req-2", path: "/users/456", method: "GET" },
    { id: "req-3", path: "/users/error", method: "GET" } // This will fail
  ]
  
  // Process requests concurrently, each with their own scope
  const results = yield* Effect.all(
    requests.map(req => 
      Effect.scoped(processRequest(req)).pipe(
        Effect.either // Convert failures to Either so they don't stop other requests
      )
    ),
    { concurrency: "unbounded" }
  )
  
  return results
})

const program = simulateRequests

Effect.runPromiseExit(program).then(console.log)
/*
Output:
[req-1] INFO: Request logger initialized
[req-2] INFO: Request logger initialized
[req-3] INFO: Request logger initialized
[req-1] INFO: Establishing database connection for request
[req-2] INFO: Establishing database connection for request
[req-3] INFO: Establishing database connection for request
[req-1] INFO: Handling GET /users/123
[req-2] INFO: Handling GET /users/456
[req-3] INFO: Handling GET /users/error
[req-1] INFO: Querying user with ID: 123
[req-2] INFO: Querying user with ID: 456
[req-3] INFO: Querying user with ID: error
[req-1] INFO: Successfully found user: User-123
[req-2] INFO: Successfully found user: User-456
[req-1] INFO: Database connection closed for request
[req-2] INFO: Database connection closed for request
[req-3] INFO: Database connection closed for request
[req-1] INFO: Logger cleanup completed
[req-2] INFO: Logger cleanup completed
[req-3] INFO: Logger cleanup completed
Request req-1 completed in 5ms
Request req-2 completed in 6ms
Request req-3 completed in 4ms
*/
```

## Advanced Features Deep Dive

### Feature 1: Manual Scope Control

Sometimes you need fine-grained control over when resources are released, rather than relying on automatic scope management.

#### Basic Manual Scope Usage

```typescript
import { Effect, Scope, Console, Exit } from "effect"

const manualScopeExample = Effect.gen(function* () {
  // Create scopes manually
  const scope1 = yield* Scope.make()
  const scope2 = yield* Scope.make()
  
  // Add resources to different scopes
  yield* Scope.addFinalizer(scope1, Console.log("Scope 1 finalizer"))
  yield* Scope.addFinalizer(scope2, Console.log("Scope 2 finalizer"))
  
  yield* Console.log("Added finalizers to both scopes")
  
  // Close scopes in specific order
  yield* Scope.close(scope1, Exit.succeed("scope1 done"))
  yield* Console.log("Scope 1 closed, continuing work...")
  
  yield* Scope.close(scope2, Exit.succeed("scope2 done"))
  yield* Console.log("Scope 2 closed")
})

Effect.runPromise(manualScopeExample)
/*
Output:
Added finalizers to both scopes
Scope 1 finalizer
Scope 1 closed, continuing work...
Scope 2 finalizer
Scope 2 closed
*/
```

#### Advanced Manual Scope: Resource Lifecycle Management

```typescript
import { Effect, Scope, Console, Exit, Duration, Data } from "effect"

class ResourceError extends Data.TaggedError("ResourceError")<{
  resource: string
  operation: string
}> {}

// Simulate different types of resources with different lifecycles
const createLongLivedResource = (name: string) => Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log(`Creating long-lived resource: ${name}`)
    yield* Effect.sleep(Duration.millis(100)) // Simulate setup time
    return { name, type: "long-lived", data: `data-${name}` }
  }),
  
  (resource) => Effect.gen(function* () {
    yield* Console.log(`Cleaning up long-lived resource: ${resource.name}`)
    yield* Effect.sleep(Duration.millis(50)) // Simulate cleanup time
  })
)

const createShortLivedResource = (name: string) => Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log(`Creating short-lived resource: ${name}`)
    return { name, type: "short-lived", data: `temp-${name}` }
  }),
  
  (resource) => Console.log(`Cleaning up short-lived resource: ${resource.name}`)
)

// Demonstrate different resource lifecycle patterns
const resourceLifecycleDemo = Effect.gen(function* () {
  // Create separate scopes for different resource types
  const longLivedScope = yield* Scope.make()
  const shortLivedScope1 = yield* Scope.make()
  const shortLivedScope2 = yield* Scope.make()
  
  yield* Console.log("=== Setting up long-lived resources ===")
  
  // Create long-lived resources that persist across multiple operations
  const database = yield* createLongLivedResource("database").pipe(
    Scope.extend(longLivedScope)
  )
  
  const cache = yield* createLongLivedResource("cache").pipe(
    Scope.extend(longLivedScope)
  )
  
  yield* Console.log("=== Operation 1: Using short-lived resources ===")
  
  // Operation 1 with short-lived resources
  const tempFile1 = yield* createShortLivedResource("temp-file-1").pipe(
    Scope.extend(shortLivedScope1)
  )
  
  yield* Console.log(`Processing with ${database.name}, ${cache.name}, and ${tempFile1.name}`)
  yield* Effect.sleep(Duration.millis(50))
  
  // Close short-lived scope 1
  yield* Scope.close(shortLivedScope1, Exit.succeed("operation 1 complete"))
  yield* Console.log("Operation 1 cleanup completed")
  
  yield* Console.log("=== Operation 2: Using different short-lived resources ===")
  
  // Operation 2 with different short-lived resources  
  const tempFile2 = yield* createShortLivedResource("temp-file-2").pipe(
    Scope.extend(shortLivedScope2)
  )
  
  const tempNetwork = yield* createShortLivedResource("network-connection").pipe(
    Scope.extend(shortLivedScope2)
  )
  
  yield* Console.log(`Processing with ${database.name}, ${cache.name}, ${tempFile2.name}, and ${tempNetwork.name}`)
  yield* Effect.sleep(Duration.millis(75))
  
  // Close short-lived scope 2
  yield* Scope.close(shortLivedScope2, Exit.succeed("operation 2 complete"))
  yield* Console.log("Operation 2 cleanup completed")
  
  yield* Console.log("=== Final cleanup ===")
  
  // Finally close the long-lived scope
  yield* Scope.close(longLivedScope, Exit.succeed("all operations complete"))
  yield* Console.log("All resources cleaned up")
})

Effect.runPromise(resourceLifecycleDemo)
/*
Output:
=== Setting up long-lived resources ===
Creating long-lived resource: database
Creating long-lived resource: cache
=== Operation 1: Using short-lived resources ===
Creating short-lived resource: temp-file-1
Processing with database, cache, and temp-file-1
Cleaning up short-lived resource: temp-file-1
Operation 1 cleanup completed
=== Operation 2: Using different short-lived resources ===
Creating short-lived resource: temp-file-2
Creating short-lived resource: network-connection
Processing with database, cache, temp-file-2, and network-connection
Cleaning up short-lived resource: network-connection
Cleaning up short-lived resource: temp-file-2
Operation 2 cleanup completed
=== Final cleanup ===
Cleaning up long-lived resource: cache
Cleaning up long-lived resource: database
All resources cleaned up
*/
```

### Feature 2: Scope Extension and Sharing

Scope extension allows you to share resources across different parts of your application while maintaining control over their lifecycle.

#### Basic Scope Extension

```typescript
import { Effect, Scope, Console } from "effect"

// Create a shared resource
const createSharedResource = Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log("Creating shared resource...")
    return { id: "shared-1", value: "shared data" }
  }),
  
  (resource) => Console.log(`Cleaning up shared resource: ${resource.id}`)
)

// Function that uses the shared resource
const useSharedResource = (scope: Scope.Scope) => Effect.gen(function* () {
  yield* Console.log("Function A acquiring shared resource")
  
  const resource = yield* createSharedResource.pipe(
    Scope.extend(scope) // Extend the resource into the provided scope
  )
  
  yield* Console.log(`Function A using: ${resource.value}`)
  return `A processed: ${resource.value}`
})

// Another function that uses the same shared resource
const anotherFunction = (scope: Scope.Scope) => Effect.gen(function* () {
  yield* Console.log("Function B acquiring shared resource")
  
  const resource = yield* createSharedResource.pipe(
    Scope.extend(scope)
  )
  
  yield* Console.log(`Function B using: ${resource.value}`)
  return `B processed: ${resource.value}`
})

const scopeExtensionDemo = Effect.gen(function* () {
  const sharedScope = yield* Scope.make()
  
  // Both functions share the same scope
  const resultA = yield* useSharedResource(sharedScope)
  const resultB = yield* anotherFunction(sharedScope)
  
  yield* Console.log(`Results: ${resultA}, ${resultB}`)
  
  // Manually close the shared scope
  yield* Scope.close(sharedScope, Exit.succeed("demo complete"))
})

Effect.runPromise(scopeExtensionDemo)
/*
Output:
Function A acquiring shared resource
Creating shared resource...
Function A using: shared data
Function B acquiring shared resource
Function B using: shared data
Results: A processed: shared data, B processed: shared data
Cleaning up shared resource: shared-1
*/
```

#### Advanced Scope Extension: Resource Pools

```typescript
import { Effect, Scope, Console, Ref, Duration, Data } from "effect"

class PoolError extends Data.TaggedError("PoolError")<{
  message: string
}> {}

// Resource pool implementation using scope extension
interface ResourcePool<R> {
  readonly acquire: () => Effect.Effect<R, PoolError, Scope>
  readonly release: (resource: R) => Effect.Effect<void>
  readonly size: () => Effect.Effect<number>
}

const createResourcePool = <R>(
  createResource: Effect.Effect<R, never, Scope>,
  maxSize: number
): Effect.Effect<ResourcePool<R>, never, Scope> => 
  Effect.gen(function* () {
    const availableResources = yield* Ref.make<R[]>([])
    const totalResources = yield* Ref.make(0)
    const poolScope = yield* Scope.make()
    
    const pool: ResourcePool<R> = {
      acquire: () => Effect.gen(function* () {
        // Try to get an available resource first
        const available = yield* Ref.modify(availableResources, resources => 
          resources.length > 0 
            ? [resources[0], resources.slice(1)]
            : [null, resources]
        )
        
        if (available) {
          yield* Console.log("Reusing pooled resource")
          return available
        }
        
        // Check if we can create a new resource
        const currentSize = yield* Ref.get(totalResources)
        if (currentSize >= maxSize) {
          return yield* Effect.fail(new PoolError({
            message: `Pool exhausted. Max size: ${maxSize}`
          }))
        }
        
        // Create new resource and extend it into the pool scope
        yield* Console.log("Creating new pooled resource")
        const resource = yield* createResource.pipe(
          Scope.extend(poolScope)
        )
        
        yield* Ref.update(totalResources, n => n + 1)
        return resource
      }),
      
      release: (resource: R) => Effect.gen(function* () {
        yield* Console.log("Returning resource to pool")
        yield* Ref.update(availableResources, resources => [resource, ...resources])
      }),
      
      size: () => Ref.get(totalResources)
    }
    
    // Add finalizer to clean up the pool scope
    yield* Effect.addFinalizer(() => Effect.gen(function* () {
      yield* Console.log("Cleaning up resource pool")
      yield* Scope.close(poolScope, Exit.succeed("pool cleanup"))
    }))
    
    return pool
  })

// Example usage of the resource pool
const poolExample = Effect.gen(function* () {
  // Create a simple resource for pooling
  const createDatabaseConnection = Effect.acquireRelease(
    Effect.gen(function* () {
      const id = Math.random().toString(36).substr(2, 6)
      yield* Console.log(`Opening database connection: ${id}`)
      return { id, connected: true }
    }),
    
    (conn) => Console.log(`Closing database connection: ${conn.id}`)
  )
  
  // Create a pool of database connections
  const pool = yield* createResourcePool(createDatabaseConnection, 3)
  
  // Simulate multiple operations using the pool
  const operations = Array.from({ length: 5 }, (_, i) => 
    Effect.gen(function* () {
      yield* Console.log(`Operation ${i + 1} starting`)
      
      const conn = yield* pool.acquire()
      yield* Console.log(`Operation ${i + 1} using connection: ${conn.id}`)
      
      // Simulate some work
      yield* Effect.sleep(Duration.millis(100))
      
      yield* pool.release(conn)
      yield* Console.log(`Operation ${i + 1} completed`)
    })
  )
  
  // Run operations concurrently
  yield* Effect.all(operations, { concurrency: 2 })
  
  const finalSize = yield* pool.size()
  yield* Console.log(`Final pool size: ${finalSize}`)
})

const program = Effect.scoped(poolExample)

Effect.runPromise(program)
/*
Output:
Operation 1 starting
Operation 2 starting
Creating new pooled resource
Opening database connection: abc123
Operation 1 using connection: abc123
Creating new pooled resource
Opening database connection: def456
Operation 2 using connection: def456
Operation 3 starting
Operation 4 starting
Returning resource to pool
Operation 1 completed
Operation 3 starting
Reusing pooled resource
Operation 3 using connection: abc123
Returning resource to pool
Operation 2 completed
Operation 4 starting
Reusing pooled resource
Operation 4 using connection: def456
Operation 5 starting
Returning resource to pool
Operation 3 completed
Operation 5 starting
Reusing pooled resource
Operation 5 using connection: abc123
Returning resource to pool
Operation 4 completed
Returning resource to pool
Operation 5 completed
Final pool size: 2
Cleaning up resource pool
Closing database connection: def456
Closing database connection: abc123
*/
```

### Feature 3: Exit-Aware Finalizers

Finalizers can behave differently based on how the scope was closed, allowing for sophisticated cleanup strategies.

#### Basic Exit-Aware Cleanup

```typescript
import { Effect, Scope, Console, Exit, Data } from "effect"

class BusinessError extends Data.TaggedError("BusinessError")<{
  code: string
  message: string
}> {}

// Resource that needs different cleanup based on exit type
const createSmartResource = Effect.acquireRelease(
  Effect.gen(function* () {
    yield* Console.log("Creating smart resource with transaction support")
    return {
      id: "smart-1",
      transactions: [] as string[],
      committed: false
    }
  }),
  
  (resource, exit) => Effect.gen(function* () {
    yield* Console.log(`Smart resource cleanup triggered. Exit: ${exit._tag}`)
    
    if (Exit.isSuccess(exit)) {
      // Success: commit all transactions
      yield* Console.log("SUCCESS: Committing all transactions")
      resource.committed = true
      yield* Console.log(`Committed transactions: ${resource.transactions.join(", ")}`)
    } else if (Exit.isFailure(exit)) {
      if (exit.cause._tag === "Fail") {
        // Expected failure: rollback transactions
        yield* Console.log("EXPECTED FAILURE: Rolling back transactions")
        yield* Console.log(`Rolling back: ${resource.transactions.join(", ")}`)
      } else if (exit.cause._tag === "Die") {
        // Unexpected error: emergency cleanup
        yield* Console.log("UNEXPECTED ERROR: Emergency cleanup!")
        yield* Console.log("Performing emergency data recovery...")
      } else if (exit.cause._tag === "Interrupt") {
        // Interruption: graceful shutdown
        yield* Console.log("INTERRUPTION: Graceful shutdown")
        yield* Console.log("Saving partial work before shutdown...")
      }
    }
    
    yield* Console.log(`Smart resource ${resource.id} cleanup completed`)
  })
)

// Simulate different exit scenarios
const exitAwareDemo = (scenario: "success" | "failure" | "defect" | "interrupt") => 
  Effect.gen(function* () {
    const resource = yield* createSmartResource
    
    // Simulate some work with the resource
    resource.transactions.push("txn-1", "txn-2", "txn-3")
    yield* Console.log(`Added transactions: ${resource.transactions.join(", ")}`)
    
    // Trigger different exit scenarios
    switch (scenario) {
      case "success":
        yield* Console.log("Completing successfully")
        return "Success!"
        
      case "failure":
        yield* Console.log("Triggering expected failure")
        yield* Effect.fail(new BusinessError({
          code: "BUSINESS_RULE_VIOLATION",
          message: "Invalid operation"
        }))
        break
        
      case "defect":
        yield* Console.log("Triggering unexpected defect")
        yield* Effect.die("Unexpected system error!")
        break
        
      case "interrupt":
        yield* Console.log("Triggering interruption")
        yield* Effect.interrupt
        break
    }
  })

// Test all scenarios
const testAllScenarios = Effect.gen(function* () {
  const scenarios = ["success", "failure", "defect", "interrupt"] as const
  
  for (const scenario of scenarios) {
    yield* Console.log(`\n=== Testing ${scenario} scenario ===`)
    
    const result = yield* Effect.scoped(exitAwareDemo(scenario)).pipe(
      Effect.either
    )
    
    yield* Console.log(`Scenario ${scenario} result:`, result)
  }
})

Effect.runPromise(testAllScenarios)
/*
Output:
=== Testing success scenario ===
Creating smart resource with transaction support
Added transactions: txn-1, txn-2, txn-3
Completing successfully
Smart resource cleanup triggered. Exit: Success
SUCCESS: Committing all transactions
Committed transactions: txn-1, txn-2, txn-3
Smart resource smart-1 cleanup completed
Scenario success result: { _id: 'Either', _tag: 'Right', right: 'Success!' }

=== Testing failure scenario ===
Creating smart resource with transaction support
Added transactions: txn-1, txn-2, txn-3
Triggering expected failure
Smart resource cleanup triggered. Exit: Failure
EXPECTED FAILURE: Rolling back transactions
Rolling back: txn-1, txn-2, txn-3
Smart resource smart-1 cleanup completed
Scenario failure result: { _id: 'Either', _tag: 'Left', left: { _tag: 'BusinessError', code: 'BUSINESS_RULE_VIOLATION', message: 'Invalid operation' } }

=== Testing defect scenario ===
Creating smart resource with transaction support
Added transactions: txn-1, txn-2, txn-3
Triggering unexpected defect
Smart resource cleanup triggered. Exit: Failure
UNEXPECTED ERROR: Emergency cleanup!
Performing emergency data recovery...
Smart resource smart-1 cleanup completed
Scenario defect result: { _id: 'Either', _tag: 'Left', left: { _id: 'Cause', _tag: 'Die', defect: 'Unexpected system error!' } }

=== Testing interrupt scenario ===
Creating smart resource with transaction support
Added transactions: txn-1, txn-2, txn-3
Triggering interruption
Smart resource cleanup triggered. Exit: Failure
INTERRUPTION: Graceful shutdown
Saving partial work before shutdown...
Smart resource smart-1 cleanup completed
Scenario interrupt result: { _id: 'Either', _tag: 'Left', left: { _id: 'Cause', _tag: 'Interrupt', fiberId: {...} } }
*/
```

## Practical Patterns & Best Practices

### Pattern 1: Hierarchical Resource Management

Organize resources in a hierarchy where parent resources manage child resources automatically.

```typescript
import { Effect, Scope, Console, Ref, Data } from "effect"

class ResourceHierarchyError extends Data.TaggedError("ResourceHierarchyError")<{
  level: string
  resource: string
  cause: string
}> {}

// Base resource interface
interface ManagedResource {
  readonly id: string
  readonly level: string
  readonly children: ManagedResource[]
  addChild(child: ManagedResource): Effect.Effect<void>
}

// Application-level resource (top level)
const createApplication = (name: string): Effect.Effect<ManagedResource, never, Scope> =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const children = yield* Ref.make<ManagedResource[]>([])
      
      const app: ManagedResource = {
        id: `app-${name}`,
        level: "application",
        children: [],
        addChild: (child) => Ref.update(children, current => {
          app.children.push(child)
          return [...current, child]
        })
      }
      
      yield* Console.log(`🚀 Application ${app.id} started`)
      return app
    }),
    
    (app) => Effect.gen(function* () {
      yield* Console.log(`🛑 Shutting down application ${app.id}`)
      yield* Console.log(`   Children to cleanup: ${app.children.length}`)
    })
  )

// Service-level resource (mid level)
const createService = (name: string, parent: ManagedResource): Effect.Effect<ManagedResource, never, Scope> =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const children = yield* Ref.make<ManagedResource[]>([])
      
      const service: ManagedResource = {
        id: `service-${name}`,
        level: "service",
        children: [],
        addChild: (child) => Ref.update(children, current => {
          service.children.push(child)
          return [...current, child]
        })
      }
      
      yield* parent.addChild(service)
      yield* Console.log(`  📦 Service ${service.id} initialized`)
      return service
    }),
    
    (service) => Effect.gen(function* () {
      yield* Console.log(`  📦 Service ${service.id} shutting down`)
      yield* Console.log(`     Children to cleanup: ${service.children.length}`)
    })
  )

// Connection-level resource (leaf level)
const createConnection = (type: string, parent: ManagedResource): Effect.Effect<ManagedResource, never, Scope> =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const connection: ManagedResource = {
        id: `${type}-conn-${Math.random().toString(36).substr(2, 4)}`,
        level: "connection",
        children: [],
        addChild: () => Effect.void // Leaf nodes don't have children
      }
      
      yield* parent.addChild(connection)
      yield* Console.log(`    🔌 ${connection.id} connected`)
      return connection
    }),
    
    (connection) => Console.log(`    🔌 ${connection.id} disconnected`)
  )

// Hierarchical application setup
const createHierarchicalApp = Effect.gen(function* () {
  // Create application
  const app = yield* createApplication("MyApp")
  
  // Create services
  const userService = yield* createService("UserService", app)
  const orderService = yield* createService("OrderService", app)
  const notificationService = yield* createService("NotificationService", app)
  
  // Create connections for each service
  const userDbConn = yield* createConnection("database", userService)
  const userCacheConn = yield* createConnection("redis", userService)
  
  const orderDbConn = yield* createConnection("database", orderService)
  const orderQueueConn = yield* createConnection("rabbitmq", orderService)
  
  const emailConn = yield* createConnection("smtp", notificationService)
  const smsConn = yield* createConnection("twilio", notificationService)
  
  yield* Console.log("\n✅ Application fully initialized")
  yield* Console.log(`   Total resources: ${1 + 3 + 6}`)
  
  // Simulate some work
  yield* Effect.sleep(Duration.millis(100))
  yield* Console.log("💼 Application running...")
  
  return app
})

const hierarchicalDemo = Effect.scoped(createHierarchicalApp)

Effect.runPromise(hierarchicalDemo)
/*
Output:
🚀 Application app-MyApp started
  📦 Service service-UserService initialized
  📦 Service service-OrderService initialized
  📦 Service service-NotificationService initialized
    🔌 database-conn-a1b2 connected
    🔌 redis-conn-c3d4 connected
    🔌 database-conn-e5f6 connected
    🔌 rabbitmq-conn-g7h8 connected
    🔌 smtp-conn-i9j0 connected
    🔌 twilio-conn-k1l2 connected

✅ Application fully initialized
   Total resources: 10
💼 Application running...
    🔌 twilio-conn-k1l2 disconnected
    🔌 smtp-conn-i9j0 disconnected
  📦 Service service-NotificationService shutting down
     Children to cleanup: 2
    🔌 rabbitmq-conn-g7h8 disconnected
    🔌 database-conn-e5f6 disconnected
  📦 Service service-OrderService shutting down
     Children to cleanup: 2
    🔌 redis-conn-c3d4 disconnected
    🔌 database-conn-a1b2 disconnected
  📦 Service service-UserService shutting down
     Children to cleanup: 2
🛑 Shutting down application app-MyApp
   Children to cleanup: 3
*/
```

### Pattern 2: Resource Sharing with Reference Counting

Implement resource sharing where resources are only released when no longer referenced by any consumer.

```typescript
import { Effect, Scope, Console, Ref, Duration, Data } from "effect"

class ReferenceCountError extends Data.TaggedError("ReferenceCountError")<{
  resource: string
  operation: string
}> {}

// Reference-counted resource wrapper
interface RefCountedResource<R> {
  readonly resource: R
  readonly acquire: () => Effect.Effect<R>
  readonly release: () => Effect.Effect<void>
  readonly refCount: () => Effect.Effect<number>
}

const createRefCountedResource = <R>(
  create: Effect.Effect<R, never, Scope>,
  resourceId: string
): Effect.Effect<RefCountedResource<R>, never, Scope> =>
  Effect.gen(function* () {
    const refCount = yield* Ref.make(0)
    const resourceRef = yield* Ref.make<R | null>(null)
    const resourceScope = yield* Scope.make()
    
    const refCountedResource: RefCountedResource<R> = {
      resource: null as any, // Will be set when first acquired
      
      acquire: () => Effect.gen(function* () {
        const currentCount = yield* Ref.get(refCount)
        
        if (currentCount === 0) {
          // First acquisition - create the resource
          yield* Console.log(`📦 Creating shared resource: ${resourceId}`)
          const resource = yield* create.pipe(Scope.extend(resourceScope))
          yield* Ref.set(resourceRef, resource)
          yield* Ref.set(refCount, 1)
          yield* Console.log(`📦 Resource ${resourceId} created (refs: 1)`)
          return resource
        } else {
          // Subsequent acquisition - increment reference count
          const resource = yield* Ref.get(resourceRef)
          if (!resource) {
            return yield* Effect.die("Resource should exist when refCount > 0")
          }
          yield* Ref.update(refCount, n => n + 1)
          const newCount = yield* Ref.get(refCount)
          yield* Console.log(`📦 Resource ${resourceId} acquired (refs: ${newCount})`)
          return resource
        }
      }),
      
      release: () => Effect.gen(function* () {
        const currentCount = yield* Ref.get(refCount)
        
        if (currentCount <= 0) {
          yield* Console.log(`⚠️  Warning: Attempting to release ${resourceId} with refCount ${currentCount}`)
          return
        }
        
        const newCount = currentCount - 1
        yield* Ref.set(refCount, newCount)
        
        if (newCount === 0) {
          // Last release - cleanup the resource
          yield* Console.log(`🗑️  Last reference to ${resourceId} released, cleaning up`)
          yield* Scope.close(resourceScope, Exit.succeed("resource no longer needed"))
          yield* Ref.set(resourceRef, null)
        } else {
          yield* Console.log(`📦 Resource ${resourceId} released (refs: ${newCount})`)
        }
      }),
      
      refCount: () => Ref.get(refCount)
    }
    
    // Add finalizer to ensure cleanup
    yield* Effect.addFinalizer(() => Effect.gen(function* () {
      const count = yield* Ref.get(refCount)
      if (count > 0) {
        yield* Console.log(`🧹 Force cleanup of ${resourceId} with ${count} remaining references`)
        yield* Scope.close(resourceScope, Exit.succeed("scope closing"))
      }
    }))
    
    return refCountedResource
  })

// Example usage with database connections
const refCountExample = Effect.gen(function* () {
  // Create expensive database connection resource
  const createDbConnection = Effect.acquireRelease(
    Effect.gen(function* () {
      yield* Console.log("  🔗 Opening database connection...")
      yield* Effect.sleep(Duration.millis(200)) // Simulate connection time
      return {
        id: `db-${Math.random().toString(36).substr(2, 6)}`,
        query: (sql: string) => `Result for: ${sql}`
      }
    }),
    
    (conn) => Effect.gen(function* () {
      yield* Console.log(`  🔗 Closing database connection ${conn.id}`)
      yield* Effect.sleep(Duration.millis(100)) // Simulate cleanup time
    })
  )
  
  // Create reference-counted database connection
  const sharedDb = yield* createRefCountedResource(createDbConnection, "SharedDB")
  
  // Simulate multiple services using the shared connection
  const service1 = Effect.gen(function* () {
    yield* Console.log("🏃 Service1 starting")
    const db = yield* sharedDb.acquire()
    
    yield* Console.log(`🏃 Service1 using connection ${db.id}`)
    yield* Effect.sleep(Duration.millis(300))
    
    yield* sharedDb.release()
    yield* Console.log("🏃 Service1 finished")
  })
  
  const service2 = Effect.gen(function* () {
    yield* Effect.sleep(Duration.millis(100)) // Start later
    yield* Console.log("🎯 Service2 starting")
    const db = yield* sharedDb.acquire()
    
    yield* Console.log(`🎯 Service2 using connection ${db.id}`)
    yield* Effect.sleep(Duration.millis(400))
    
    yield* sharedDb.release()
    yield* Console.log("🎯 Service2 finished")
  })
  
  const service3 = Effect.gen(function* () {
    yield* Effect.sleep(Duration.millis(150)) // Start even later
    yield* Console.log("⚡ Service3 starting")
    const db = yield* sharedDb.acquire()
    
    yield* Console.log(`⚡ Service3 using connection ${db.id}`)
    yield* Effect.sleep(Duration.millis(200))
    
    yield* sharedDb.release()
    yield* Console.log("⚡ Service3 finished")
  })
  
  // Run services concurrently
  yield* Effect.all([service1, service2, service3], { concurrency: "unbounded" })
  
  const finalRefCount = yield* sharedDb.refCount()
  yield* Console.log(`Final reference count: ${finalRefCount}`)
})

const program = Effect.scoped(refCountExample)

Effect.runPromise(program)
/*
Output:
🏃 Service1 starting
📦 Creating shared resource: SharedDB
  🔗 Opening database connection...
📦 Resource SharedDB created (refs: 1)
🏃 Service1 using connection db-a1b2c3
🎯 Service2 starting
📦 Resource SharedDB acquired (refs: 2)
🎯 Service2 using connection db-a1b2c3
⚡ Service3 starting
📦 Resource SharedDB acquired (refs: 3)
⚡ Service3 using connection db-a1b2c3
⚡ Service3 finished
📦 Resource SharedDB released (refs: 2)
🏃 Service1 finished
📦 Resource SharedDB released (refs: 1)
🎯 Service2 finished
🗑️  Last reference to SharedDB released, cleaning up
  🔗 Closing database connection db-a1b2c3
Final reference count: 0
*/
```

### Pattern 3: Cascading Resource Dependencies

Handle complex resource dependencies where the failure of one resource should trigger cleanup of dependent resources.

```typescript
import { Effect, Scope, Console, Ref, Duration, Data } from "effect"

class DependencyError extends Data.TaggedError("DependencyError")<{
  resource: string
  dependency: string
  reason: string
}> {}

// Resource dependency graph
interface ResourceNode {
  readonly id: string
  readonly dependencies: string[]
  readonly dependents: Ref.Ref<string[]>
  readonly status: Ref.Ref<"initializing" | "ready" | "failed" | "cleanup">
}

interface DependencyManager {
  readonly registerResource: (
    id: string, 
    dependencies: string[],
    create: Effect.Effect<any, any, Scope>
  ) => Effect.Effect<any, DependencyError, Scope>
  readonly getResource: (id: string) => Effect.Effect<any, DependencyError>
  readonly markFailed: (id: string, reason: string) => Effect.Effect<void>
}

const createDependencyManager = (): Effect.Effect<DependencyManager, never, Scope> =>
  Effect.gen(function* () {
    const nodes = yield* Ref.make<Map<string, ResourceNode>>(new Map())
    const resources = yield* Ref.make<Map<string, any>>(new Map())
    
    const manager: DependencyManager = {
      registerResource: (id, dependencies, create) => Effect.gen(function* () {
        yield* Console.log(`📋 Registering resource: ${id} (deps: ${dependencies.join(", ") || "none"})`)
        
        // Create resource node
        const node: ResourceNode = {
          id,
          dependencies,
          dependents: yield* Ref.make([]),
          status: yield* Ref.make("initializing" as const)
        }
        
        // Update dependency graph
        yield* Ref.update(nodes, map => new Map(map.set(id, node)))
        
        // Register this resource as dependent on its dependencies
        for (const depId of dependencies) {
          const depNode = yield* Ref.get(nodes).pipe(
            Effect.map(map => map.get(depId))
          )
          
          if (depNode) {
            yield* Ref.update(depNode.dependents, deps => [...deps, id])
          }
        }
        
        // Wait for dependencies to be ready
        for (const depId of dependencies) {
          yield* waitForResource(depId)
        }
        
        // Create the resource
        yield* Console.log(`🔧 Creating resource: ${id}`)
        const resource = yield* create
        
        // Store resource and mark as ready
        yield* Ref.update(resources, map => new Map(map.set(id, resource)))
        yield* Ref.set(node.status, "ready")
        yield* Console.log(`✅ Resource ready: ${id}`)
        
        return resource
      }),
      
      getResource: (id) => Effect.gen(function* () {
        const resourceMap = yield* Ref.get(resources)
        const resource = resourceMap.get(id)
        
        if (!resource) {
          return yield* Effect.fail(new DependencyError({
            resource: id,
            dependency: "self",
            reason: "Resource not found"
          }))
        }
        
        return resource
      }),
      
      markFailed: (id, reason) => Effect.gen(function* () {
        yield* Console.log(`💥 Resource failed: ${id} (${reason})`)
        
        const nodeMap = yield* Ref.get(nodes)
        const node = nodeMap.get(id)
        
        if (node) {
          yield* Ref.set(node.status, "failed")
          
          // Cascade failure to dependents
          const dependents = yield* Ref.get(node.dependents)
          for (const depId of dependents) {
            yield* manager.markFailed(depId, `Dependency ${id} failed`)
          }
        }
      })
    }
    
    const waitForResource = (id: string): Effect.Effect<void, DependencyError> =>
      Effect.gen(function* () {
        const nodeMap = yield* Ref.get(nodes)
        const node = nodeMap.get(id)
        
        if (!node) {
          return yield* Effect.fail(new DependencyError({
            resource: "unknown",
            dependency: id,
            reason: "Dependency not registered"
          }))
        }
        
        // Poll for resource to be ready
        while (true) {
          const status = yield* Ref.get(node.status)
          
          if (status === "ready") {
            return
          } else if (status === "failed") {
            return yield* Effect.fail(new DependencyError({
              resource: "unknown",
              dependency: id,
              reason: "Dependency failed"
            }))
          }
          
          yield* Effect.sleep(Duration.millis(10))
        }
      })
    
    return manager
  })

// Example: Complex microservice dependency chain
const dependencyExample = Effect.gen(function* () {
  const manager = yield* createDependencyManager()
  
  // Database (no dependencies)
  const database = yield* manager.registerResource(
    "database",
    [],
    Effect.acquireRelease(
      Effect.gen(function* () {
        yield* Effect.sleep(Duration.millis(100))
        return { type: "database", connected: true }
      }),
      () => Console.log("🗄️  Database disconnected")
    )
  )
  
  // Cache (depends on database)
  const cache = yield* manager.registerResource(
    "cache",
    ["database"],
    Effect.acquireRelease(
      Effect.gen(function* () {
        yield* Effect.sleep(Duration.millis(80))
        return { type: "cache", warmed: true }
      }),
      () => Console.log("🔄 Cache cleared")
    )
  )
  
  // User service (depends on database and cache)
  const userService = yield* manager.registerResource(
    "user-service",
    ["database", "cache"],
    Effect.acquireRelease(
      Effect.gen(function* () {
        yield* Effect.sleep(Duration.millis(60))
        return { type: "user-service", initialized: true }
      }),
      () => Console.log("👥 User service stopped")
    )
  )
  
  // Order service (depends on database and user-service)
  const orderService = yield* manager.registerResource(
    "order-service",
    ["database", "user-service"],
    Effect.acquireRelease(
      Effect.gen(function* () {
        yield* Effect.sleep(Duration.millis(70))
        return { type: "order-service", initialized: true }
      }),
      () => Console.log("📦 Order service stopped")
    )
  )
  
  // API Gateway (depends on user-service and order-service)
  const apiGateway = yield* manager.registerResource(
    "api-gateway",
    ["user-service", "order-service"],
    Effect.acquireRelease(
      Effect.gen(function* () {
        yield* Effect.sleep(Duration.millis(50))
        return { type: "api-gateway", listening: true }
      }),
      () => Console.log("🌐 API Gateway stopped")
    )
  )
  
  yield* Console.log("\n🚀 All services initialized successfully!")
  
  // Simulate a failure in the user service
  yield* Effect.sleep(Duration.millis(200))
  yield* Console.log("\n💥 Simulating user service failure...")
  yield* manager.markFailed("user-service", "Database connection lost")
  
  yield* Effect.sleep(Duration.millis(100))
  
  return {
    database,
    cache,
    userService,
    orderService,
    apiGateway
  }
})

const program = Effect.scoped(dependencyExample)

Effect.runPromise(program)
/*
Output:
📋 Registering resource: database (deps: none)
🔧 Creating resource: database
✅ Resource ready: database
📋 Registering resource: cache (deps: database)
🔧 Creating resource: cache
✅ Resource ready: cache
📋 Registering resource: user-service (deps: database, cache)
🔧 Creating resource: user-service
✅ Resource ready: user-service
📋 Registering resource: order-service (deps: database, user-service)
🔧 Creating resource: order-service
✅ Resource ready: order-service
📋 Registering resource: api-gateway (deps: user-service, order-service)
🔧 Creating resource: api-gateway
✅ Resource ready: api-gateway

🚀 All services initialized successfully!

💥 Simulating user service failure...
💥 Resource failed: user-service (Database connection lost)
💥 Resource failed: order-service (Dependency user-service failed)
💥 Resource failed: api-gateway (Dependency user-service failed)
🌐 API Gateway stopped
📦 Order service stopped
👥 User service stopped
🔄 Cache cleared
🗄️  Database disconnected
*/
```

## Integration Examples

### Integration with Testing Frameworks

Scope integrates seamlessly with testing frameworks to ensure proper setup and teardown of test resources.

```typescript
import { Effect, Scope, Console, Duration, Layer, Context, Data } from "effect"

// Test configuration service
class TestConfig extends Context.Tag("TestConfig")<
  TestConfig,
  {
    readonly testName: string
    readonly timeout: Duration.Duration
    readonly cleanup: boolean
  }
>() {}

// Test database service
class TestDatabase extends Context.Tag("TestDatabase")<
  TestDatabase,
  {
    readonly query: (sql: string) => Effect.Effect<any[]>
    readonly seed: (data: Record<string, any>[]) => Effect.Effect<void>
    readonly clear: () => Effect.Effect<void>
  }
>() {}

// Test utilities with automatic resource management
const createTestEnvironment = (testName: string) => {
  const config = Layer.succeed(TestConfig, {
    testName,
    timeout: Duration.seconds(30),
    cleanup: true
  })
  
  const database = Layer.effect(
    TestDatabase,
    Effect.gen(function* () {
      const testConfig = yield* TestConfig
      
      return yield* Effect.acquireRelease(
        Effect.gen(function* () {
          yield* Console.log(`🧪 Setting up test database for: ${testConfig.testName}`)
          
          const testData = new Map<string, any[]>()
          
          return {
            query: (sql: string) => Effect.gen(function* () {
              yield* Console.log(`📋 Test query: ${sql}`)
              // Mock query results based on test data
              return testData.get("users") || []
            }),
            
            seed: (data: Record<string, any>[]) => Effect.gen(function* () {
              yield* Console.log(`🌱 Seeding test data: ${data.length} records`)
              testData.set("users", data)
            }),
            
            clear: () => Effect.gen(function* () {
              yield* Console.log("🧹 Clearing test data")
              testData.clear()
            })
          }
        }),
        
        (db) => Effect.gen(function* () {
          const testConfig = yield* TestConfig
          if (testConfig.cleanup) {
            yield* Console.log(`🧪 Cleaning up test database for: ${testConfig.testName}`)
            yield* db.clear()
          }
        })
      )
    })
  )
  
  return Layer.mergeAll(config, database)
}

// Test helper functions
const describe = (suiteName: string, tests: Effect.Effect<void, any, TestConfig | TestDatabase>[]) =>
  Effect.gen(function* () {
    yield* Console.log(`\n📝 Test Suite: ${suiteName}`)
    
    for (const [index, test] of tests.entries()) {
      yield* Console.log(`\n  🧪 Test ${index + 1}`)
      yield* Effect.scoped(test).pipe(
        Effect.catchAll(error => 
          Console.log(`  ❌ Test failed: ${JSON.stringify(error)}`)
        )
      )
    }
    
    yield* Console.log(`\n✅ Test Suite Complete: ${suiteName}`)
  })

const it = (testName: string, testBody: Effect.Effect<void, any, TestConfig | TestDatabase>) =>
  Effect.gen(function* () {
    const config = yield* TestConfig
    yield* Console.log(`    Running: ${testName}`)
    
    const startTime = Date.now()
    yield* testBody
    const duration = Date.now() - startTime
    
    yield* Console.log(`    ✅ Passed: ${testName} (${duration}ms)`)
  })

// Example test suite
const userServiceTests = Effect.gen(function* () {
  yield* describe("User Service Tests", [
    it("should create a user", Effect.gen(function* () {
      const db = yield* TestDatabase
      
      // Seed test data
      yield* db.seed([
        { id: 1, name: "John", email: "john@test.com" }
      ])
      
      // Test the functionality
      const users = yield* db.query("SELECT * FROM users")
      yield* Console.log(`      Found ${users.length} users`)
      
      if (users.length !== 1) {
        yield* Effect.fail("Expected 1 user")
      }
    })),
    
    it("should find user by email", Effect.gen(function* () {
      const db = yield* TestDatabase
      
      yield* db.seed([
        { id: 1, name: "John", email: "john@test.com" },
        { id: 2, name: "Jane", email: "jane@test.com" }
      ])
      
      const users = yield* db.query("SELECT * FROM users WHERE email = 'john@test.com'")
      yield* Console.log(`      Query returned ${users.length} results`)
      
      // Simulate test logic
      yield* Effect.sleep(Duration.millis(50))
    })),
    
    it("should handle user not found", Effect.gen(function* () {
      const db = yield* TestDatabase
      
      // No seeded data - should handle empty results
      const users = yield* db.query("SELECT * FROM users WHERE id = 999")
      
      if (users.length > 0) {
        yield* Effect.fail("Expected no users")
      }
      
      yield* Console.log("      Correctly handled user not found case")
    }))
  ])
})

// Integration test with multiple test environments
const integrationTests = Effect.gen(function* () {
  // Test environment 1
  yield* userServiceTests.pipe(
    Effect.provide(createTestEnvironment("UserService-Unit-Tests"))
  )
  
  // Test environment 2 with different configuration
  yield* describe("Integration Tests", [
    it("cross-service communication", Effect.gen(function* () {
      const db = yield* TestDatabase
      
      yield* db.seed([
        { id: 1, name: "Integration User", email: "integration@test.com" }
      ])
      
      yield* Console.log("      Testing cross-service functionality")
      yield* Effect.sleep(Duration.millis(100))
    }))
  ]).pipe(
    Effect.provide(createTestEnvironment("Cross-Service-Integration"))
  )
})

Effect.runPromise(integrationTests)
/*
Output:
📝 Test Suite: User Service Tests

  🧪 Test 1
🧪 Setting up test database for: UserService-Unit-Tests
    Running: should create a user
🌱 Seeding test data: 1 records
📋 Test query: SELECT * FROM users
      Found 1 users
    ✅ Passed: should create a user (2ms)
🧪 Cleaning up test database for: UserService-Unit-Tests
🧹 Clearing test data

  🧪 Test 2
🧪 Setting up test database for: UserService-Unit-Tests
    Running: should find user by email
🌱 Seeding test data: 2 records
📋 Test query: SELECT * FROM users WHERE email = 'john@test.com'
      Query returned 0 results
    ✅ Passed: should find user by email (52ms)
🧪 Cleaning up test database for: UserService-Unit-Tests
🧹 Clearing test data

  🧪 Test 3
🧪 Setting up test database for: UserService-Unit-Tests
    Running: should handle user not found
📋 Test query: SELECT * FROM users WHERE id = 999
      Correctly handled user not found case
    ✅ Passed: should handle user not found (1ms)
🧪 Cleaning up test database for: UserService-Unit-Tests
🧹 Clearing test data

✅ Test Suite Complete: User Service Tests

📝 Test Suite: Integration Tests

  🧪 Test 1
🧪 Setting up test database for: Cross-Service-Integration
    Running: cross-service communication
🌱 Seeding test data: 1 records
      Testing cross-service functionality
    ✅ Passed: cross-service communication (101ms)
🧪 Cleaning up test database for: Cross-Service-Integration
🧹 Clearing test data

✅ Test Suite Complete: Integration Tests
*/
```

### Integration with Express.js

Show how Scope can be integrated with Express.js for proper request-scoped resource management.

```typescript
import { Effect, Scope, Console, Context, Layer, Data, Duration } from "effect"

// Request context with scope
interface RequestContext {
  readonly requestId: string
  readonly method: string
  readonly path: string
  readonly startTime: number
  readonly scope: Scope.Scope
}

class RequestContextService extends Context.Tag("RequestContext")<
  RequestContextService,
  RequestContext
>() {}

// Logger service that uses request context
class RequestLoggerService extends Context.Tag("RequestLogger")<
  RequestLoggerService,
  {
    readonly info: (message: string) => Effect.Effect<void>
    readonly error: (message: string, error?: unknown) => Effect.Effect<void>
    readonly debug: (message: string) => Effect.Effect<void>
  }
>() {}

// Database connection service (request-scoped)
class DatabaseService extends Context.Tag("Database")<
  DatabaseService,
  {
    readonly query: (sql: string) => Effect.Effect<any[]>
    readonly transaction: <R, E>(work: Effect.Effect<R, E>) => Effect.Effect<R, E>
  }
>() {}

// Create request-scoped services
const createRequestLogger = Effect.gen(function* () {
  const context = yield* RequestContextService
  
  return {
    info: (message: string) => 
      Console.log(`[${context.requestId}] INFO: ${message}`),
    error: (message: string, error?: unknown) =>
      Console.log(`[${context.requestId}] ERROR: ${message}`, error ? String(error) : ""),
    debug: (message: string) =>
      Console.log(`[${context.requestId}] DEBUG: ${message}`)
  }
})

const createRequestDatabase = Effect.gen(function* () {
  const context = yield* RequestContextService
  const logger = yield* RequestLoggerService
  
  return yield* Effect.acquireRelease(
    Effect.gen(function* () {
      yield* logger.info("Opening database connection")
      
      // Simulate database connection
      const connection = {
        id: `conn-${Math.random().toString(36).substr(2, 6)}`,
        connected: true,
        inTransaction: false
      }
      
      return {
        query: (sql: string) => Effect.gen(function* () {
          yield* logger.debug(`Executing SQL: ${sql}`)
          
          // Simulate query execution
          yield* Effect.sleep(Duration.millis(10))
          
          // Mock results based on query
          if (sql.includes("users")) {
            return [{ id: 1, name: "John" }, { id: 2, name: "Jane" }]
          }
          return []
        }),
        
        transaction: <R, E>(work: Effect.Effect<R, E>) => Effect.gen(function* () {
          yield* logger.info("Starting database transaction")
          connection.inTransaction = true
          
          const result = yield* work.pipe(
            Effect.catchAll(error => Effect.gen(function* () {
              yield* logger.error("Transaction failed, rolling back")
              connection.inTransaction = false
              return yield* Effect.fail(error)
            }))
          )
          
          yield* logger.info("Committing database transaction")
          connection.inTransaction = false
          return result
        })
      }
    }),
    
    (db) => logger.info("Closing database connection")
  )
})

// Create request-scoped layer
const createRequestLayer = (requestId: string, method: string, path: string) => {
  return Effect.gen(function* () {
    const scope = yield* Scope.make()
    
    const context: RequestContext = {
      requestId,
      method,
      path,
      startTime: Date.now(),
      scope
    }
    
    const contextLayer = Layer.succeed(RequestContextService, context)
    const loggerLayer = Layer.effect(RequestLoggerService, createRequestLogger)
    const databaseLayer = Layer.effect(DatabaseService, createRequestDatabase)
    
    return Layer.mergeAll(contextLayer, loggerLayer, databaseLayer)
  })
}

// Effect-based route handlers
const getUsersHandler = Effect.gen(function* () {
  const logger = yield* RequestLoggerService
  const db = yield* DatabaseService
  
  yield* logger.info("Handling GET /users request")
  
  const users = yield* db.query("SELECT * FROM users")
  
  yield* logger.info(`Found ${users.length} users`)
  
  return {
    status: 200,
    data: users
  }
})

const createUserHandler = (userData: any) => Effect.gen(function* () {
  const logger = yield* RequestLoggerService
  const db = yield* DatabaseService
  
  yield* logger.info(`Creating user: ${userData.name}`)
  
  const result = yield* db.transaction(Effect.gen(function* () {
    // Validate user data
    if (!userData.name || !userData.email) {
      yield* Effect.fail(new Error("Missing required fields"))
    }
    
    // Insert user
    yield* db.query(`INSERT INTO users (name, email) VALUES ('${userData.name}', '${userData.email}')`)
    
    // Get the created user
    const newUsers = yield* db.query(`SELECT * FROM users WHERE email = '${userData.email}'`)
    
    return newUsers[0]
  }))
  
  yield* logger.info(`User created with ID: ${result?.id}`)
  
  return {
    status: 201,
    data: result
  }
})

// Simulate the Express integration for demonstration
const simulateExpressIntegration = Effect.gen(function* () {
  yield* Console.log("🌐 Simulating Express.js integration with Scope")
  
  // Simulate multiple concurrent requests
  const simulateRequest = (method: string, path: string) => Effect.gen(function* () {
    const requestId = `req-${Math.random().toString(36).substr(2, 8)}`
    const requestLayer = yield* Effect.scoped(createRequestLayer(requestId, method, path))
    
    const handler = method === "GET" ? getUsersHandler : createUserHandler({ name: "Test User", email: "test@example.com" })
    
    return yield* Effect.scoped(handler).pipe(
      Effect.provide(requestLayer)
    )
  })
  
  // Run multiple requests concurrently
  const results = yield* Effect.all([
    simulateRequest("GET", "/users"),
    simulateRequest("POST", "/users"),
    simulateRequest("GET", "/users")
  ], { concurrency: "unbounded" })
  
  yield* Console.log(`\n📊 Processed ${results.length} requests successfully`)
  return results
})

Effect.runPromise(simulateExpressIntegration)
/*
Output:
🌐 Simulating Express.js integration with Scope
[req-a1b2c3d4] INFO: Opening database connection
[req-e5f6g7h8] INFO: Opening database connection
[req-i9j0k1l2] INFO: Opening database connection
[req-a1b2c3d4] INFO: Handling GET /users request
[req-e5f6g7h8] INFO: Creating user: Test User
[req-i9j0k1l2] INFO: Handling GET /users request
[req-a1b2c3d4] DEBUG: Executing SQL: SELECT * FROM users
[req-e5f6g7h8] INFO: Starting database transaction
[req-i9j0k1l2] DEBUG: Executing SQL: SELECT * FROM users
[req-a1b2c3d4] INFO: Found 2 users
[req-e5f6g7h8] DEBUG: Executing SQL: INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com')
[req-i9j0k1l2] INFO: Found 2 users
[req-e5f6g7h8] DEBUG: Executing SQL: SELECT * FROM users WHERE email = 'test@example.com'
[req-e5f6g7h8] INFO: Committing database transaction
[req-e5f6g7h8] INFO: User created with ID: undefined
[req-a1b2c3d4] INFO: Closing database connection
[req-e5f6g7h8] INFO: Closing database connection
[req-i9j0k1l2] INFO: Closing database connection

📊 Processed 3 requests successfully
*/
```

## Conclusion

Scope provides comprehensive resource management capabilities for building robust, leak-free applications. By automatically handling resource cleanup and providing fine-grained control over resource lifecycles, Scope eliminates common sources of memory leaks and resource exhaustion.

Key benefits:
- **Automatic Cleanup**: Resources are guaranteed to be released, even when errors occur or operations are interrupted
- **Exception Safety**: Finalizers run in all exit scenarios (success, failure, interruption)
- **Composability**: Resources can be combined and nested while maintaining proper cleanup order
- **Type Safety**: The type system ensures scoped resources are properly managed
- **Concurrency Support**: Thread-safe resource management for concurrent operations
- **Integration Friendly**: Works seamlessly with existing frameworks and libraries

Scope is essential for any Effect application that manages external resources like database connections, file handles, network sockets, or any other system resources that require explicit cleanup. It transforms error-prone manual resource management into automatic, reliable, and composable patterns.