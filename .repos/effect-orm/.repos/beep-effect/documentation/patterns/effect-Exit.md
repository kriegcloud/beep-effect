# Exit: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Exit Solves

When working with asynchronous operations and Effect workflows, handling completion states becomes complex. Traditional Promise-based approaches force you into binary success/failure patterns that can't capture the nuanced states of Effect execution:

```typescript
// Traditional Promise approach - limited completion states
async function processData(data: unknown): Promise<User> {
  try {
    const response = await fetch('/api/validate');
    const result = await response.json();
    return result.user;
  } catch (error) {
    // Lost information: Was this a network error? Validation error? Interruption?
    throw error;
  }
}

// Using the result requires more try/catch
try {
  const user = await processData(data);
  console.log('Success:', user);
} catch (error) {
  console.log('Failed:', error);
  // What type of failure was this? Can we recover?
}
```

This approach leads to:
- **Lost Context**: Simple catch blocks lose detailed failure information
- **Binary State**: Only success/failure, missing interruption and defect states  
- **Poor Composition**: Difficult to chain operations while preserving error context
- **Unclear Recovery**: Hard to determine appropriate recovery strategies

### The Exit Solution

Exit provides a complete representation of Effect execution results, capturing all possible completion states with full context:

```typescript
import { Effect, Exit, Cause } from "effect"

// Effect approach with rich completion states
const processData = (data: unknown) => 
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch('/api/validate'),
      catch: (error) => ({ _tag: 'NetworkError' as const, error })
    })
    
    const result = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => ({ _tag: 'ParseError' as const, error })
    })
    
    return result.user
  })

// Using Exit to handle all possible outcomes
const program = Effect.gen(function* () {
  const exit = yield* Effect.exit(processData(data))
  
  return Exit.match(exit, {
    onSuccess: (user) => ({
      type: 'success' as const,
      message: `User processed: ${user.name}`,
      data: user
    }),
    onFailure: (cause) => {
      if (Cause.isFailType(cause)) {
        const error = Cause.failureOption(cause)
        if (error._tag === 'NetworkError') {
          return { type: 'retry' as const, message: 'Network issue, retrying...' }
        }
        if (error._tag === 'ParseError') {
          return { type: 'format_error' as const, message: 'Invalid response format' }
        }
      }
      
      if (Cause.isInterruptType(cause)) {
        return { type: 'cancelled' as const, message: 'Operation was cancelled' }
      }
      
      return { type: 'unknown' as const, message: 'Unexpected error occurred' }
    }
  })
})
```

### Key Concepts

**Exit States**: Exit captures three primary completion states:
- `Success<A>`: Contains the successful result value
- `Failure<E>`: Contains a Cause describing the failure reason
- Interruption handling through Cause types

**Cause Integration**: Exit leverages the Cause type to provide detailed failure analysis:
- Expected failures (typed errors)
- Defects (unexpected errors) 
- Interruptions (cancellation)
- Composite causes (multiple failures)

**Effect Compatibility**: Exit is a subtype of Effect, making it composable within Effect workflows while providing immediate access to completion state.

## Basic Usage Patterns

### Pattern 1: Creating Exit Values

```typescript
import { Exit, Cause } from "effect"

// Creating successful exits
const successExit = Exit.succeed("Operation completed")

// Creating failed exits with different cause types
const failureExit = Exit.fail("Validation failed")
const defectExit = Exit.die(new Error("Unexpected error"))
const interruptExit = Exit.interrupt()

// Creating exits from other data types
const fromEither = Exit.fromEither(Either.right(42)) // Success
const fromOption = Exit.fromOption(Option.some("value"), () => "Not found") // Success

console.log(successExit)
// { _id: 'Exit', _tag: 'Success', value: 'Operation completed' }

console.log(failureExit)  
// { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: 'Validation failed' } }
```

### Pattern 2: Running Effects to Exit

```typescript
import { Effect, Exit, Console } from "effect"

// Get Exit from Effect execution
const getExitFromEffect = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.gen(function* () {
    const exit = yield* Effect.exit(effect)
    yield* Console.log(`Exit state: ${exit._tag}`)
    return exit
  })

// Example with different effect types
const successfulEffect = Effect.succeed(100)
const failingEffect = Effect.fail("Something went wrong")
const defectEffect = Effect.die(new Error("Crash!"))

const program = Effect.gen(function* () {
  const successExit = yield* getExitFromEffect(successfulEffect)
  const failureExit = yield* getExitFromEffect(failingEffect)  
  const defectExit = yield* getExitFromEffect(defectEffect)
  
  return { successExit, failureExit, defectExit }
})

// Using runSyncExit for immediate Exit results
const immediateExit = Effect.runSyncExit(Effect.succeed(42))
console.log(immediateExit) // Success exit with value 42
```

### Pattern 3: Pattern Matching on Exit

```typescript
import { Exit, Effect, Cause } from "effect"

// Comprehensive exit pattern matching
const handleExit = <A, E>(exit: Exit.Exit<A, E>) =>
  Exit.match(exit, {
    onSuccess: (value) => ({
      status: 'completed' as const,
      result: value,
      timestamp: new Date().toISOString()
    }),
    onFailure: (cause) => ({
      status: 'failed' as const,
      error: Cause.pretty(cause),
      recoverable: Cause.isFailType(cause),
      timestamp: new Date().toISOString()
    })
  })

// Using guards for more specific handling
const analyzeExit = <A, E>(exit: Exit.Exit<A, E>) => {
  if (Exit.isSuccess(exit)) {
    return `Success: ${exit.value}`
  }
  
  if (Exit.isFailure(exit)) {
    const cause = exit.cause
    
    if (Cause.isFailType(cause)) {
      return `Expected failure: ${Cause.failureOption(cause)}`
    }
    
    if (Cause.isDieType(cause)) {
      return `Defect: ${Cause.dieOption(cause)}`
    }
    
    if (Cause.isInterruptType(cause)) {
      return "Operation was interrupted"
    }
  }
  
  return "Unknown exit state"
}
```

## Real-World Examples

### Example 1: API Request with Comprehensive Error Handling

Modern applications need robust API error handling that goes beyond simple success/failure. Exit provides the tools to capture and analyze all possible completion states:

```typescript
import { Effect, Exit, Cause, Console } from "effect"

// Define specific error types for different failure scenarios
interface NetworkError {
  readonly _tag: 'NetworkError'
  readonly status: number
  readonly message: string
}

interface ValidationError {
  readonly _tag: 'ValidationError'  
  readonly field: string
  readonly message: string
}

interface TimeoutError {
  readonly _tag: 'TimeoutError'
  readonly timeoutMs: number
}

type ApiError = NetworkError | ValidationError | TimeoutError

// API service with detailed error handling
const apiService = {
  fetchUser: (id: string) =>
    Effect.gen(function* () {
      // Simulate network request with potential failures
      const response = yield* Effect.tryPromise({
        try: () => fetch(`/api/users/${id}`),
        catch: (error): NetworkError => ({
          _tag: 'NetworkError',
          status: 0,
          message: error instanceof Error ? error.message : 'Network failure'
        })
      })
      
      if (!response.ok) {
        return yield* Effect.fail<NetworkError>({
          _tag: 'NetworkError',
          status: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`
        })
      }
      
      const data = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (): ValidationError => ({
          _tag: 'ValidationError',
          field: 'response',
          message: 'Invalid JSON response'
        })
      })
      
      // Validate response structure
      if (!data.id || !data.name || !data.email) {
        return yield* Effect.fail<ValidationError>({
          _tag: 'ValidationError',
          field: 'user',
          message: 'Missing required user fields'
        })
      }
      
      return data as User
    }).pipe(
      Effect.timeout('5 seconds'),
      Effect.mapError((timeoutError): TimeoutError => ({
        _tag: 'TimeoutError',
        timeoutMs: 5000
      }))
    )
}

// Request handler using Exit for comprehensive result analysis
const handleUserRequest = (userId: string) =>
  Effect.gen(function* () {
    yield* Console.log(`Fetching user: ${userId}`)
    
    const exit = yield* Effect.exit(apiService.fetchUser(userId))
    
    const result = Exit.match(exit, {
      onSuccess: (user) => ({
        success: true,
        data: user,
        message: `Successfully retrieved user: ${user.name}`
      }),
      onFailure: (cause) => {
        // Analyze cause for specific error handling
        const failure = Cause.failureOption(cause)
        
        if (failure) {
          switch (failure._tag) {
            case 'NetworkError':
              return {
                success: false,
                error: 'network',
                retryable: failure.status >= 500 || failure.status === 0,
                message: `Network error: ${failure.message}`,
                statusCode: failure.status
              }
              
            case 'ValidationError':
              return {
                success: false,
                error: 'validation',
                retryable: false,
                message: `Validation failed on ${failure.field}: ${failure.message}`
              }
              
            case 'TimeoutError':
              return {
                success: false,
                error: 'timeout',
                retryable: true,
                message: `Request timed out after ${failure.timeoutMs}ms`
              }
          }
        }
        
        // Handle interruption
        if (Cause.isInterruptType(cause)) {
          return {
            success: false,
            error: 'cancelled',
            retryable: false,
            message: 'Request was cancelled'
          }
        }
        
        // Handle defects (unexpected errors)
        const defect = Cause.dieOption(cause)
        if (defect) {
          return {
            success: false,
            error: 'internal',
            retryable: false,
            message: `Internal error: ${defect.message}`
          }
        }
        
        return {
          success: false,
          error: 'unknown',
          retryable: false,
          message: 'An unknown error occurred'
        }
      }
    })
    
    yield* Console.log(`Request result: ${JSON.stringify(result, null, 2)}`)
    return result
  })

// Usage with retry logic based on Exit analysis
const robustUserFetch = (userId: string) =>
  Effect.gen(function* () {
    const maxRetries = 3
    let attempt = 0
    
    while (attempt < maxRetries) {
      const result = yield* handleUserRequest(userId)
      
      if (result.success || !result.retryable) {
        return result
      }
      
      attempt++
      yield* Console.log(`Retrying... (${attempt}/${maxRetries})`)
      yield* Effect.sleep('1 second')
    }
    
    return {
      success: false,
      error: 'exhausted',
      retryable: false,
      message: `Failed after ${maxRetries} attempts`
    }
  })
```

### Example 2: Database Transaction Management

Database operations require careful handling of various completion states including connection failures, constraint violations, and transaction rollbacks:

```typescript
import { Effect, Exit, Cause, Console, Layer } from "effect"

// Database error types
interface ConnectionError {
  readonly _tag: 'ConnectionError'
  readonly host: string
  readonly port: number
}

interface QueryError {
  readonly _tag: 'QueryError'
  readonly query: string
  readonly details: string
}

interface TransactionError {
  readonly _tag: 'TransactionError'
  readonly operation: string
  readonly reason: string
}

type DbError = ConnectionError | QueryError | TransactionError

// Database service interface
interface DatabaseService {
  readonly beginTransaction: Effect.Effect<Transaction, ConnectionError>
  readonly commitTransaction: (tx: Transaction) => Effect.Effect<void, TransactionError>
  readonly rollbackTransaction: (tx: Transaction) => Effect.Effect<void, never>
  readonly insertUser: (tx: Transaction, user: NewUser) => Effect.Effect<User, QueryError>
  readonly insertProfile: (tx: Transaction, profile: Profile) => Effect.Effect<Profile, QueryError>
}

const DatabaseService = Effect.Tag<DatabaseService>()

// Transaction manager using Exit for precise control flow
const transactionalUserCreation = (userData: NewUser, profileData: Profile) =>
  Effect.gen(function* () {
    const db = yield* DatabaseService
    
    // Begin transaction
    const txExit = yield* Effect.exit(db.beginTransaction)
    
    if (Exit.isFailure(txExit)) {
      return Exit.match(txExit, {
        onSuccess: () => null, // Never reached
        onFailure: (cause) => ({
          success: false,
          stage: 'connection' as const,
          error: Cause.pretty(cause),
          rollbackNeeded: false
        })
      })
    }
    
    const transaction = txExit.value
    
    try {
      // Insert user within transaction
      const userExit = yield* Effect.exit(db.insertUser(transaction, userData))
      
      if (Exit.isFailure(userExit)) {
        // Rollback and return detailed error info
        yield* db.rollbackTransaction(transaction)
        
        return Exit.match(userExit, {
          onSuccess: () => null, // Never reached
          onFailure: (cause) => {
            const failure = Cause.failureOption(cause)
            
            return {
              success: false,
              stage: 'user_insert' as const,
              error: failure ? failure.details : Cause.pretty(cause),
              rollbackNeeded: true,
              rollbackCompleted: true
            }
          }
        })
      }
      
      const user = userExit.value
      
      // Insert profile within same transaction
      const profileExit = yield* Effect.exit(
        db.insertProfile(transaction, { ...profileData, userId: user.id })
      )
      
      if (Exit.isFailure(profileExit)) {
        yield* db.rollbackTransaction(transaction)
        
        return Exit.match(profileExit, {
          onSuccess: () => null, // Never reached
          onFailure: (cause) => {
            const failure = Cause.failureOption(cause)
            
            return {
              success: false,
              stage: 'profile_insert' as const,
              error: failure ? failure.details : Cause.pretty(cause),
              rollbackNeeded: true,
              rollbackCompleted: true,
              userCreated: user // Partial success info
            }
          }
        })
      }
      
      const profile = profileExit.value
      
      // Commit transaction
      const commitExit = yield* Effect.exit(db.commitTransaction(transaction))
      
      if (Exit.isFailure(commitExit)) {
        // Transaction may be in unknown state
        return Exit.match(commitExit, {
          onSuccess: () => null, // Never reached  
          onFailure: (cause) => ({
            success: false,
            stage: 'commit' as const,
            error: Cause.pretty(cause),
            rollbackNeeded: false, // Commit failure, can't rollback
            dataIntegrity: 'unknown' as const,
            userCreated: user,
            profileCreated: profile
          })
        })
      }
      
      return {
        success: true,
        user,
        profile,
        message: 'User and profile created successfully'
      }
      
    } catch (error) {
      // Handle unexpected errors with rollback
      yield* db.rollbackTransaction(transaction)
      
      return {
        success: false,
        stage: 'unexpected' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
        rollbackNeeded: true,
        rollbackCompleted: true
      }
    }
  })

// Batch user creation with detailed progress tracking
const batchUserCreation = (usersData: Array<{ user: NewUser; profile: Profile }>) =>
  Effect.gen(function* () {
    const results: Arr<{
      index: number
      userData: NewUser
      result: Awaited<ReturnType<typeof transactionalUserCreation>>
    }> = []
    
    for (let i = 0; i < usersData.length; i++) {
      const { user, profile } = usersData[i]
      
      yield* Console.log(`Processing user ${i + 1}/${usersData.length}: ${user.email}`)
      
      const result = yield* transactionalUserCreation(user, profile)
      
      results.push({
        index: i,
        userData: user,
        result
      })
      
      // Log detailed results based on exit analysis
      if (result.success) {
        yield* Console.log(`✓ User ${user.email} created successfully`)
      } else {
        yield* Console.log(`✗ User ${user.email} failed at ${result.stage}: ${result.error}`)
        
        if (result.rollbackCompleted) {
          yield* Console.log(`  Rollback completed for ${user.email}`)
        }
      }
    }
    
    // Summary analysis
    const successful = results.filter(r => r.result.success).length
    const failed = results.length - successful
    
    yield* Console.log(`\nBatch Summary: ${successful} successful, ${failed} failed`)
    
    return {
      total: results.length,
      successful,
      failed,
      results
    }
  })
```

### Example 3: File Processing Pipeline with Resource Management

File processing operations involve resource acquisition, cleanup, and multiple potential failure points that Exit can help manage comprehensively:

```typescript
import { Effect, Exit, Cause, Console, Schedule } from "effect"

// File processing error types
interface FileNotFoundError {
  readonly _tag: 'FileNotFoundError'
  readonly path: string
}

interface PermissionError {
  readonly _tag: 'PermissionError'
  readonly path: string
  readonly operation: 'read' | 'write'
}

interface ProcessingError {
  readonly _tag: 'ProcessingError'
  readonly stage: string
  readonly details: string
}

interface ResourceError {
  readonly _tag: 'ResourceError'
  readonly resource: string
  readonly operation: 'acquire' | 'release'
}

type FileError = FileNotFoundError | PermissionError | ProcessingError | ResourceError

// File processing service
interface FileService {
  readonly openFile: (path: string) => Effect.Effect<FileHandle, FileNotFoundError | PermissionError>
  readonly readChunk: (handle: FileHandle) => Effect.Effect<Buffer | null, ProcessingError>
  readonly writeChunk: (handle: FileHandle, data: Buffer) => Effect.Effect<void, PermissionError>
  readonly closeFile: (handle: FileHandle) => Effect.Effect<void, never>
}

const FileService = Effect.Tag<FileService>()

// File processor with comprehensive exit handling
const processFile = (inputPath: string, outputPath: string) =>
  Effect.gen(function* () {
    const fileService = yield* FileService
    
    yield* Console.log(`Starting file processing: ${inputPath} -> ${outputPath}`)
    
    // Acquire input file resource
    const inputExit = yield* Effect.exit(fileService.openFile(inputPath))
    
    if (Exit.isFailure(inputExit)) {
      return Exit.match(inputExit, {
        onSuccess: () => null, // Never reached
        onFailure: (cause) => {
          const failure = Cause.failureOption(cause)
          
          if (failure) {
            switch (failure._tag) {
              case 'FileNotFoundError':
                return {
                  success: false,
                  stage: 'input_file_open' as const,
                  error: `Input file not found: ${failure.path}`,
                  recoverable: false,
                  resourcesReleased: true
                }
                
              case 'PermissionError':
                return {
                  success: false,
                  stage: 'input_file_open' as const,
                  error: `Permission denied reading: ${failure.path}`,
                  recoverable: false,
                  resourcesReleased: true
                }
            }
          }
          
          return {
            success: false,
            stage: 'input_file_open' as const,
            error: Cause.pretty(cause),
            recoverable: false,
            resourcesReleased: true
          }
        }
      })
    }
    
    const inputHandle = inputExit.value
    
    // Acquire output file resource
    const outputExit = yield* Effect.exit(fileService.openFile(outputPath))
    
    if (Exit.isFailure(outputExit)) {
      // Clean up input resource
      yield* fileService.closeFile(inputHandle)
      
      return Exit.match(outputExit, {
        onSuccess: () => null, // Never reached
        onFailure: (cause) => {
          const failure = Cause.failureOption(cause)
          
          return {
            success: false,
            stage: 'output_file_open' as const,
            error: failure ? `Cannot create output file: ${outputPath}` : Cause.pretty(cause),
            recoverable: false,
            resourcesReleased: true
          }
        }
      })
    }
    
    const outputHandle = outputExit.value
    
    // Process file chunks with proper resource cleanup
    const processingResult = yield* Effect.gen(function* () {
      let totalChunks = 0
      let processedChunks = 0
      
      while (true) {
        // Read chunk
        const chunkExit = yield* Effect.exit(fileService.readChunk(inputHandle))
        
        if (Exit.isFailure(chunkExit)) {
          return Exit.match(chunkExit, {
            onSuccess: () => null, // Never reached
            onFailure: (cause) => ({
              success: false,
              stage: 'chunk_read' as const,
              error: Cause.pretty(cause),
              progress: { totalChunks, processedChunks },
              recoverable: true
            })
          })
        }
        
        const chunk = chunkExit.value
        
        // End of file
        if (!chunk) {
          break
        }
        
        totalChunks++
        
        // Process chunk (simulate transformation)
        const processedChunk = yield* Effect.gen(function* () {
          yield* Effect.sleep('10 millis') // Simulate processing time
          return Buffer.from(chunk.toString().toUpperCase()) // Simple transformation
        }).pipe(
          Effect.catchAll((error) =>
            Effect.fail<ProcessingError>({
              _tag: 'ProcessingError',
              stage: 'transformation',
              details: error instanceof Error ? error.message : 'Processing failed'
            })
          )
        )
        
        // Write processed chunk
        const writeExit = yield* Effect.exit(
          fileService.writeChunk(outputHandle, processedChunk)
        )
        
        if (Exit.isFailure(writeExit)) {
          return Exit.match(writeExit, {
            onSuccess: () => null, // Never reached
            onFailure: (cause) => ({
              success: false,
              stage: 'chunk_write' as const,
              error: Cause.pretty(cause),
              progress: { totalChunks, processedChunks },
              recoverable: false
            })
          })
        }
        
        processedChunks++
        
        if (processedChunks % 100 === 0) {
          yield* Console.log(`Processed ${processedChunks} chunks...`)
        }
      }
      
      return {
        success: true,
        progress: { totalChunks, processedChunks },
        message: `Successfully processed ${processedChunks} chunks`
      }
    }).pipe(
      // Ensure resources are always cleaned up
      Effect.ensuring(
        Effect.gen(function* () {
          yield* fileService.closeFile(inputHandle)
          yield* fileService.closeFile(outputHandle)
          yield* Console.log('File handles closed')
        })
      )
    )
    
    return processingResult
  })

// Batch file processor with retry logic based on Exit analysis
const batchFileProcessor = (fileOperations: Array<{ input: string; output: string }>) =>
  Effect.gen(function* () {
    const results: Arr<{
      input: string
      output: string  
      result: Awaited<ReturnType<typeof processFile>>
      attempts: number
    }> = []
    
    for (const { input, output } of fileOperations) {
      let attempts = 0
      const maxRetries = 3
      
      while (attempts < maxRetries) {
        attempts++
        
        const result = yield* processFile(input, output)
        
        if (result.success || !result.recoverable) {
          results.push({ input, output, result, attempts })
          break
        }
        
        if (attempts < maxRetries) {
          yield* Console.log(`Retrying ${input} (attempt ${attempts + 1}/${maxRetries})`)
          yield* Effect.sleep('2 seconds')
        } else {
          results.push({ input, output, result, attempts })
        }
      }
    }
    
    // Generate detailed summary
    const successful = results.filter(r => r.result.success)
    const failed = results.filter(r => !r.result.success)
    
    yield* Console.log(`\nBatch Processing Summary:`)
    yield* Console.log(`Total files: ${results.length}`)
    yield* Console.log(`Successful: ${successful.length}`)
    yield* Console.log(`Failed: ${failed.length}`)
    
    for (const failure of failed) {
      yield* Console.log(`Failed: ${failure.input} -> ${failure.result.error} (stage: ${failure.result.stage})`)
    }
    
    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      results
    }
  })
```

## Advanced Features Deep Dive

### Feature 1: Exit Composition and Transformation

Exit provides powerful combinators for composing and transforming completion states, enabling sophisticated error handling workflows:

#### Basic Exit Transformation

```typescript
import { Exit, Effect, Cause } from "effect"

// Mapping successful exits
const transformSuccess = <A, B, E>(
  exit: Exit.Exit<A, E>,
  f: (a: A) => B
): Exit.Exit<B, E> => Exit.map(exit, f)

// Mapping failed exits  
const transformFailure = <A, E1, E2>(
  exit: Exit.Exit<A, E1>,
  f: (e: E1) => E2  
): Exit.Exit<A, E2> => Exit.mapError(exit, f)

// Transforming both success and failure
const transformBoth = <A, B, E1, E2>(
  exit: Exit.Exit<A, E1>,
  onSuccess: (a: A) => B,
  onFailure: (e: E1) => E2
): Exit.Exit<B, E2> => Exit.mapBoth(exit, { onFailure, onSuccess })

// Example usage
const numericExit = Exit.succeed(42)
const stringExit = transformSuccess(numericExit, n => `Number: ${n}`)

const errorExit = Exit.fail("validation error")  
const typedErrorExit = transformFailure(errorExit, msg => ({
  type: 'ValidationError' as const,
  message: msg,
  timestamp: Date.now()
}))

console.log(stringExit) // Success with "Number: 42"
console.log(typedErrorExit) // Failure with structured error
```

#### Exit Composition Patterns

```typescript
import { Exit, Effect, Array as Arr, Cause } from "effect"

// Combining multiple exits - all must succeed
const combineAllSuccesses = <A, E>(
  exits: Arr<Exit.Exit<A, E>>
): Exit.Exit<Arr<A>, E> => {
  const successes: Arr<A> = []
  
  for (const exit of exits) {
    if (Exit.isSuccess(exit)) {
      successes.push(exit.value)
    } else {
      return exit // Return first failure
    }
  }
  
  return Exit.succeed(successes)
}

// Collecting all results, preserving successes and failures
const partitionExits = <A, E>(
  exits: Arr<Exit.Exit<A, E>>
): { successes: Arr<A>; failures: Arr<Cause.Cause<E>> } => {
  const successes: Arr<A> = []
  const failures: Arr<Cause.Cause<E>> = []
  
  for (const exit of exits) {
    if (Exit.isSuccess(exit)) {
      successes.push(exit.value)
    } else {
      failures.push(exit.cause)
    }
  }
  
  return { successes, failures }
}

// First success wins (racing pattern)
const firstSuccess = <A, E>(
  exits: Arr<Exit.Exit<A, E>>
): Exit.Exit<A, Arr<Cause.Cause<E>>> => {
  const failures: Arr<Cause.Cause<E>> = []
  
  for (const exit of exits) {
    if (Exit.isSuccess(exit)) {
      return exit
    } else {
      failures.push(exit.cause)
    }
  }
  
  return Exit.failCause(Cause.parallel(...failures))
}

// Example: Processing multiple API responses
const processApiResponses = (responses: Array<ApiResponse>) =>
  Effect.gen(function* () {
    // Create exits for each response processing
    const processingExits = yield* Effect.all(
      responses.map(response =>
        Effect.exit(processApiResponse(response))
      )
    )
    
    // Analyze results using composition patterns
    const allSuccess = combineAllSuccesses(processingExits)
    
    if (Exit.isSuccess(allSuccess)) {
      return {
        type: 'all_success' as const,
        results: allSuccess.value,
        count: allSuccess.value.length
      }
    }
    
    // Partial success analysis
    const { successes, failures } = partitionExits(processingExits)
    
    return {
      type: 'partial_success' as const,
      successful: successes,
      failed: failures.map(cause => Cause.pretty(cause)),
      successCount: successes.length,
      failureCount: failures.length
    }
  })
```

#### Advanced Exit Flattening

```typescript
import { Exit, Effect, Cause } from "effect"

// Flattening nested exits (Exit<Exit<A, E1>, E2> -> Exit<A, E1 | E2>)
const flattenExit = <A, E1, E2>(
  nestedExit: Exit.Exit<Exit.Exit<A, E1>, E2>
): Exit.Exit<A, E1 | E2> => {
  if (Exit.isFailure(nestedExit)) {
    return Exit.mapError(nestedExit, (e2): E1 | E2 => e2)
  }
  
  const innerExit = nestedExit.value
  
  if (Exit.isFailure(innerExit)) {
    return Exit.mapError(innerExit, (e1): E1 | E2 => e1)
  }
  
  return innerExit
}

// Chaining exits with error handling
const chainExits = <A, B, E1, E2>(
  exit: Exit.Exit<A, E1>,
  f: (a: A) => Exit.Exit<B, E2>
): Exit.Exit<B, E1 | E2> => {
  if (Exit.isFailure(exit)) {
    return Exit.mapError(exit, (e1): E1 | E2 => e1)
  }
  
  const nextExit = f(exit.value)
  return Exit.mapError(nextExit, (e2): E1 | E2 => e2)  
}

// Example: Complex workflow with exit chaining
const complexWorkflow = (input: WorkflowInput) =>
  Effect.gen(function* () {
    // Step 1: Validate input
    const validationExit = yield* Effect.exit(validateInput(input))
    
    // Step 2: Chain with processing if validation succeeds  
    const processingExit = chainExits(validationExit, validInput =>
      Effect.runSyncExit(processValidInput(validInput))
    )
    
    // Step 3: Chain with persistence if processing succeeds
    const persistenceExit = chainExits(processingExit, processedData =>
      Effect.runSyncExit(persistData(processedData))
    )
    
    return Exit.match(persistenceExit, {
      onSuccess: (result) => ({
        success: true,
        result,
        stages: ['validation', 'processing', 'persistence']
      }),
      onFailure: (cause) => {
        // Determine which stage failed
        const failure = Cause.failureOption(cause)
        
        let failedStage = 'unknown'
        if (failure) {
          if ('field' in failure) failedStage = 'validation'
          else if ('operation' in failure) failedStage = 'processing'  
          else if ('table' in failure) failedStage = 'persistence'
        }
        
        return {
          success: false,
          error: Cause.pretty(cause),
          failedStage,
          completedStages: getCompletedStages(failedStage)
        }
      }
    })
  })
```

### Feature 2: Resource-Safe Exit Handling

Exit provides mechanisms for ensuring proper resource cleanup even when operations fail or are interrupted:

#### Resource-Aware Exit Management

```typescript
import { Exit, Effect, Ref, Console } from "effect"

// Resource tracker for monitoring acquisitions and releases
interface ResourceTracker {
  readonly acquired: Ref.Ref<Set<string>>
  readonly register: (id: string) => Effect.Effect<void>
  readonly release: (id: string) => Effect.Effect<void>
  readonly getAcquired: Effect.Effect<Set<string>>
}

const makeResourceTracker = (): Effect.Effect<ResourceTracker> =>
  Effect.gen(function* () {
    const acquired = yield* Ref.make(new Set<string>())
    
    return {
      acquired,
      register: (id: string) => 
        Ref.update(acquired, set => new Set([...set, id])),
      release: (id: string) =>
        Ref.update(acquired, set => {
          const newSet = new Set(set)
          newSet.delete(id)
          return newSet
        }),
      getAcquired: Ref.get(acquired)
    }
  })

// Resource-safe operation with exit-based cleanup
const resourceSafeOperation = <A, E>(
  resourceId: string,
  operation: Effect.Effect<A, E>,
  tracker: ResourceTracker
) =>
  Effect.gen(function* () {
    yield* tracker.register(resourceId)
    yield* Console.log(`Acquired resource: ${resourceId}`)
    
    const operationExit = yield* Effect.exit(operation)
    
    // Always clean up, regardless of exit state
    yield* tracker.release(resourceId)
    yield* Console.log(`Released resource: ${resourceId}`)
    
    // Log exit information for debugging
    yield* Console.log(
      `Resource ${resourceId} operation completed with: ${
        Exit.isSuccess(operationExit) ? 'SUCCESS' : 'FAILURE'
      }`
    )
    
    // Return the original exit
    return operationExit
  })

// Complex resource management with nested operations
const complexResourceOperation = (tracker: ResourceTracker) =>
  Effect.gen(function* () {
    const results: Arr<{
      resourceId: string
      exit: Exit.Exit<any, any>
      cleanedUp: boolean
    }> = []
    
    // Multiple resource operations
    const resourceOperations = [
      { id: 'database', operation: simulateDbOperation() },
      { id: 'cache', operation: simulateCacheOperation() },
      { id: 'filesystem', operation: simulateFileOperation() }
    ]
    
    for (const { id, operation } of resourceOperations) {
      const exit = yield* resourceSafeOperation(id, operation, tracker)
      results.push({ resourceId: id, exit, cleanedUp: true })
      
      // Stop processing on first failure (if desired)
      if (Exit.isFailure(exit)) {
        yield* Console.log(`Stopping due to failure in ${id}`)
        break
      }
    }
    
    // Verify all resources were cleaned up
    const stillAcquired = yield* tracker.getAcquired
    
    if (stillAcquired.size > 0) {
      yield* Console.log(`Warning: Resources not cleaned up: ${Array.from(stillAcquired).join(', ')}`)
    }
    
    return {
      results,
      allCleanedUp: stillAcquired.size === 0,
      totalOperations: results.length
    }
  })

// Example usage with proper resource tracking
const runResourceSafeProgram = Effect.gen(function* () {
  const tracker = yield* makeResourceTracker()
  
  const result = yield* complexResourceOperation(tracker)
  
  yield* Console.log(`Program completed. All resources cleaned up: ${result.allCleanedUp}`)
  
  return result
})
```

#### Exit-Based Finalizer Management

```typescript
import { Exit, Effect, Ref, Console, FiberRef } from "effect"

// Finalizer registry for tracking cleanup actions
interface FinalizerRegistry {
  readonly finalizers: Ref.Ref<Array<{ id: string; action: Effect.Effect<void, never> }>>
  readonly add: (id: string, action: Effect.Effect<void, never>) => Effect.Effect<void>
  readonly runAll: Effect.Effect<Array<{ id: string; success: boolean; error?: string }>>
}

const makeFinalizerRegistry = (): Effect.Effect<FinalizerRegistry> =>
  Effect.gen(function* () {
    const finalizers = yield* Ref.make<Array<{ id: string; action: Effect.Effect<void, never> }>>([])
    
    return {
      finalizers,
      add: (id: string, action: Effect.Effect<void, never>) =>
        Ref.update(finalizers, list => [...list, { id, action }]),
      runAll: Effect.gen(function* () {
        const finalizerList = yield* Ref.get(finalizers)
        const results: Arr<{ id: string; success: boolean; error?: string }> = []
        
        // Run finalizers in reverse order (LIFO)
        for (const { id, action } of finalizerList.reverse()) {
          const exit = yield* Effect.exit(action)
          
          if (Exit.isSuccess(exit)) {
            results.push({ id, success: true })
            yield* Console.log(`Finalizer ${id}: SUCCESS`)
          } else {
            const error = Exit.match(exit, {
              onSuccess: () => '', // Never reached
              onFailure: cause => Cause.pretty(cause)
            })
            results.push({ id, success: false, error })
            yield* Console.log(`Finalizer ${id}: FAILED - ${error}`)
          }
        }
        
        return results
      })
    }
  })

// Operation with automatic finalizer registration
const operationWithFinalizers = <A, E>(
  name: string,
  operation: Effect.Effect<A, E>,
  registry: FinalizerRegistry
) =>
  Effect.gen(function* () {
    // Register setup finalizer
    yield* registry.add(`${name}-cleanup`, 
      Console.log(`Cleaning up ${name}`)
    )
    
    // Register resource finalizer if needed
    yield* registry.add(`${name}-resource`, 
      Effect.gen(function* () {
        yield* Console.log(`Releasing ${name} resources`)
        // Simulate resource cleanup
        yield* Effect.sleep('100 millis')
      })
    )
    
    // Run the operation
    const exit = yield* Effect.exit(operation)
    
    yield* Console.log(
      `Operation ${name} completed: ${Exit.isSuccess(exit) ? 'SUCCESS' : 'FAILURE'}`
    )
    
    return exit
  })

// Comprehensive program with exit-safe finalizers
const programWithFinalizers = Effect.gen(function* () {
  const registry = yield* makeFinalizerRegistry()
  
  try {
    // Multiple operations with their own finalizers
    const operation1Exit = yield* operationWithFinalizers(
      'DatabaseSetup',
      simulateDbSetup(),
      registry
    )
    
    if (Exit.isFailure(operation1Exit)) {
      return { success: false, stage: 'database', exit: operation1Exit }
    }
    
    const operation2Exit = yield* operationWithFinalizers(
      'CacheSetup', 
      simulateCacheSetup(),
      registry
    )
    
    if (Exit.isFailure(operation2Exit)) {
      return { success: false, stage: 'cache', exit: operation2Exit }
    }
    
    const operation3Exit = yield* operationWithFinalizers(
      'ServiceSetup',
      simulateServiceSetup(),
      registry
    )
    
    if (Exit.isFailure(operation3Exit)) {
      return { success: false, stage: 'service', exit: operation3Exit }
    }
    
    return { 
      success: true, 
      message: 'All operations completed successfully',
      exits: [operation1Exit, operation2Exit, operation3Exit]
    }
    
  } finally {
    // Always run finalizers regardless of success/failure
    yield* Console.log('Running finalizers...')
    const finalizerResults = yield* registry.runAll()
    
    const failedFinalizers = finalizerResults.filter(r => !r.success)
    if (failedFinalizers.length > 0) {
      yield* Console.log(`Warning: ${failedFinalizers.length} finalizers failed`)
    }
  }
})
```

### Feature 3: Exit-Based Error Recovery and Retry Logic

Exit enables sophisticated error recovery strategies by providing detailed information about failure types and contexts:

#### Smart Retry with Exit Analysis

```typescript
import { Exit, Effect, Schedule, Cause, Console, Random } from "effect"

// Retry configuration based on exit analysis
interface RetryConfig {
  readonly maxAttempts: number
  readonly baseDelay: Duration
  readonly maxDelay: Duration
  readonly backoffFactor: number
  readonly retryableErrors: Array<string>
  readonly fatalErrors: Array<string>
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 5,
  baseDelay: '1 second',
  maxDelay: '30 seconds', 
  backoffFactor: 2.0,
  retryableErrors: ['NetworkError', 'TimeoutError', 'TemporaryError'],
  fatalErrors: ['AuthenticationError', 'PermissionError', 'ValidationError']
}

// Analyze exit to determine retry strategy
const analyzeForRetry = <A, E>(
  exit: Exit.Exit<A, E>,
  config: RetryConfig
): { shouldRetry: boolean; delay: Duration; reason: string } => {
  if (Exit.isSuccess(exit)) {
    return { shouldRetry: false, delay: '0 seconds', reason: 'success' }
  }
  
  const cause = exit.cause
  
  // Check for interruption (never retry)
  if (Cause.isInterruptType(cause)) {
    return { shouldRetry: false, delay: '0 seconds', reason: 'interrupted' }
  }
  
  // Check for defects (usually don't retry, but configurable)
  if (Cause.isDieType(cause)) {
    return { shouldRetry: false, delay: '0 seconds', reason: 'defect' }
  }
  
  // Analyze failure for retry decision
  const failure = Cause.failureOption(cause)
  if (failure && typeof failure === 'object' && '_tag' in failure) {
    const errorType = failure._tag as string
    
    if (config.fatalErrors.includes(errorType)) {
      return { shouldRetry: false, delay: '0 seconds', reason: `fatal error: ${errorType}` }
    }
    
    if (config.retryableErrors.includes(errorType)) {
      return { shouldRetry: true, delay: config.baseDelay, reason: `retryable error: ${errorType}` }
    }
  }
  
  // Default to retry for unknown failures
  return { shouldRetry: true, delay: config.baseDelay, reason: 'unknown error' }
}

// Smart retry implementation using exit analysis
const smartRetry = <A, E>(
  operation: Effect.Effect<A, E>,
  config: RetryConfig = defaultRetryConfig
) =>
  Effect.gen(function* () {
    let attempt = 0
    let currentDelay = config.baseDelay
    
    const attempts: Array<{
      attempt: number
      exit: Exit.Exit<A, E>
      retryDecision: ReturnType<typeof analyzeForRetry>
      timestamp: number
    }> = []
    
    while (attempt < config.maxAttempts) {
      attempt++
      
      yield* Console.log(`Attempt ${attempt}/${config.maxAttempts}`)
      
      const exit = yield* Effect.exit(operation)
      const retryDecision = analyzeForRetry(exit, config)
      
      attempts.push({
        attempt,
        exit,
        retryDecision,
        timestamp: Date.now()
      })
      
      // Success - return immediately
      if (Exit.isSuccess(exit)) {
        yield* Console.log(`Operation succeeded on attempt ${attempt}`)
        return {
          success: true,
          value: exit.value,
          attempts,
          totalAttempts: attempt
        }
      }
      
      // Don't retry - return failure
      if (!retryDecision.shouldRetry || attempt >= config.maxAttempts) {
        yield* Console.log(`Operation failed after ${attempt} attempts: ${retryDecision.reason}`)
        return {
          success: false,
          finalExit: exit,
          attempts,
          totalAttempts: attempt,
          reason: retryDecision.reason
        }
      }
      
      // Calculate next delay with backoff
      const delayMs = Math.min(
        currentDelay * 1000,
        config.maxDelay * 1000
      )
      
      // Add jitter to prevent thundering herd
      const jitter = yield* Random.nextIntBetween(0, delayMs * 0.1)
      const actualDelay = delayMs + jitter
      
      yield* Console.log(`Retrying in ${actualDelay}ms (reason: ${retryDecision.reason})`)
      yield* Effect.sleep(`${actualDelay} millis`)
      
      currentDelay = Math.min(currentDelay * config.backoffFactor, config.maxDelay)
    }
    
    // This should never be reached, but included for completeness
    const finalExit = attempts[attempts.length - 1]?.exit || Exit.die(new Error('No attempts recorded'))
    
    return {
      success: false,
      finalExit,
      attempts,
      totalAttempts: attempt,
      reason: 'max attempts exceeded'
    }
  })

// Circuit breaker pattern using exit analysis
interface CircuitBreakerState {
  readonly state: 'closed' | 'open' | 'half-open'
  readonly failures: number
  readonly lastFailureTime: number
  readonly successCount: number
}

const makeCircuitBreaker = (
  failureThreshold: number = 5,
  resetTimeout: Duration = '60 seconds'
) =>
  Effect.gen(function* () {
    const state = yield* Ref.make<CircuitBreakerState>({
      state: 'closed',
      failures: 0,
      lastFailureTime: 0,
      successCount: 0
    })
    
    const shouldAllowRequest = Effect.gen(function* () {
      const current = yield* Ref.get(state)
      const now = Date.now()
      
      switch (current.state) {
        case 'closed':
          return true
          
        case 'open':
          if (now - current.lastFailureTime > resetTimeout * 1000) {
            yield* Ref.set(state, { ...current, state: 'half-open' })
            return true
          }
          return false
          
        case 'half-open':
          return true
      }
    })
    
    const recordSuccess = Effect.gen(function* () {
      yield* Ref.update(state, current => ({
        ...current,
        state: 'closed',
        failures: 0,
        successCount: current.successCount + 1
      }))
    })
    
    const recordFailure = (exit: Exit.Exit<any, any>) =>
      Effect.gen(function* () {
        const isRetryableFailure = Exit.match(exit, {
          onSuccess: () => false,
          onFailure: (cause) => {
            // Only count certain types of failures
            const failure = Cause.failureOption(cause)
            return failure && 
                   typeof failure === 'object' && 
                   '_tag' in failure &&
                   ['NetworkError', 'TimeoutError'].includes(failure._tag as string)
          }
        })
        
        if (isRetryableFailure) {
          yield* Ref.update(state, current => {
            const newFailures = current.failures + 1
            return {
              ...current,
              failures: newFailures,
              lastFailureTime: Date.now(),
              state: newFailures >= failureThreshold ? 'open' : current.state
            }
          })
        }
      })
    
    return {
      execute: <A, E>(operation: Effect.Effect<A, E>) =>
        Effect.gen(function* () {
          const allowed = yield* shouldAllowRequest
          
          if (!allowed) {
            return Exit.fail({
              _tag: 'CircuitBreakerOpen' as const,
              message: 'Circuit breaker is open'
            })
          }
          
          const exit = yield* Effect.exit(operation)
          
          if (Exit.isSuccess(exit)) {
            yield* recordSuccess
          } else {
            yield* recordFailure(exit)
          }
          
          return exit
        }),
      getState: Ref.get(state)
    }
  })

// Example: Robust API client with retry and circuit breaker
const robustApiClient = Effect.gen(function* () {
  const circuitBreaker = yield* makeCircuitBreaker(3, '30 seconds')
  
  const makeRequest = (url: string) =>
    circuitBreaker.execute(
      Effect.tryPromise({
        try: () => fetch(url),
        catch: (error): ApiError => ({
          _tag: 'NetworkError',
          message: error instanceof Error ? error.message : 'Network failure'
        })
      })
    )
  
  const retryableRequest = (url: string) =>
    smartRetry(makeRequest(url), {
      ...defaultRetryConfig,
      maxAttempts: 3,
      retryableErrors: ['NetworkError', 'CircuitBreakerOpen']
    })
  
  return {
    get: retryableRequest,
    getCircuitBreakerState: circuitBreaker.getState
  }
})
```

## Practical Patterns & Best Practices

### Pattern 1: Exit-First API Design

Design your APIs to return Exit values directly, making error handling explicit and composable:

```typescript
import { Exit, Effect, Cause } from "effect"

// Traditional approach - throwing exceptions
class DatabaseService {
  async findUser(id: string): Promise<User> {
    try {
      const result = await this.query('SELECT * FROM users WHERE id = ?', [id])
      if (!result) {
        throw new Error(`User not found: ${id}`)
      }
      return result
    } catch (error) {
      throw error // Lost context about error type
    }
  }
}

// Exit-first approach - explicit error handling
class ExitBasedDatabaseService {
  findUser(id: string): Effect.Effect<Exit.Exit<User, DatabaseError>, never> {
    return Effect.gen(function* () {
      const queryExit = yield* Effect.exit(
        Effect.tryPromise({
          try: () => this.query('SELECT * FROM users WHERE id = ?', [id]),
          catch: (error): DatabaseError => ({
            _tag: 'QueryError',
            query: `SELECT * FROM users WHERE id = ${id}`,
            details: error instanceof Error ? error.message : 'Query failed'
          })
        })
      )
      
      if (Exit.isFailure(queryExit)) {
        return queryExit
      }
      
      const result = queryExit.value
      
      if (!result) {
        return Exit.fail<DatabaseError>({
          _tag: 'NotFoundError',
          entity: 'User',
          id
        })
      }
      
      return Exit.succeed(result)
    })
  }
  
  // Helper method for direct Effect usage when exit handling isn't needed
  findUserEffect(id: string): Effect.Effect<User, DatabaseError> {
    return Effect.gen(function* () {
      const exit = yield* this.findUser(id)
      
      if (Exit.isSuccess(exit)) {
        return exit.value
      } else {
        return yield* Effect.failCause(exit.cause)
      }
    })
  }
}

// Usage pattern - explicit error handling
const userService = new ExitBasedDatabaseService()

const handleUserRequest = (userId: string) =>
  Effect.gen(function* () {
    const userExit = yield* userService.findUser(userId)
    
    return Exit.match(userExit, {
      onSuccess: (user) => ({
        type: 'success' as const,
        data: user,
        message: `Found user: ${user.name}`
      }),
      onFailure: (cause) => {
        const failure = Cause.failureOption(cause)
        
        if (failure) {
          switch (failure._tag) {
            case 'NotFoundError':
              return {
                type: 'not_found' as const,
                message: `User ${failure.id} not found`,
                suggestion: 'Check user ID and try again'
              }
              
            case 'QueryError':
              return {
                type: 'database_error' as const,
                message: 'Database query failed',
                retryable: true,
                details: failure.details
              }
          }
        }
        
        return {
          type: 'unknown_error' as const,
          message: 'An unexpected error occurred',
          cause: Cause.pretty(cause)
        }
      }
    })
  })
```

### Pattern 2: Exit-Based Validation Pipelines

Create composable validation pipelines that accumulate errors while preserving success paths:

```typescript
import { Exit, Effect, Array as Arr, Cause } from "effect"

// Validation error type
interface ValidationError {
  readonly _tag: 'ValidationError'
  readonly field: string
  readonly message: string
  readonly value: unknown
}

// Individual field validators returning exits
const validateRequired = (field: string, value: unknown): Exit.Exit<unknown, ValidationError> => {
  if (value === null || value === undefined || value === '') {
    return Exit.fail({
      _tag: 'ValidationError',
      field,
      message: 'Field is required',
      value
    })
  }
  return Exit.succeed(value)
}

const validateString = (field: string, value: unknown): Exit.Exit<string, ValidationError> => {
  if (typeof value !== 'string') {
    return Exit.fail({
      _tag: 'ValidationError',
      field,
      message: 'Must be a string',
      value
    })
  }
  return Exit.succeed(value)
}

const validateEmail = (field: string, value: string): Exit.Exit<string, ValidationError> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return Exit.fail({
      _tag: 'ValidationError',
      field,
      message: 'Must be a valid email address',
      value
    })
  }
  return Exit.succeed(value)
}

const validateNumber = (field: string, value: unknown): Exit.Exit<number, ValidationError> => {
  const num = Number(value)
  if (isNaN(num)) {
    return Exit.fail({
      _tag: 'ValidationError',
      field,
      message: 'Must be a valid number',
      value
    })
  }
  return Exit.succeed(num)
}

const validateRange = (
  field: string, 
  value: number, 
  min: number, 
  max: number
): Exit.Exit<number, ValidationError> => {
  if (value < min || value > max) {
    return Exit.fail({
      _tag: 'ValidationError',
      field,
      message: `Must be between ${min} and ${max}`,
      value
    })
  }
  return Exit.succeed(value)
}

// Composable validation pipeline
const validateField = <A>(
  field: string,
  value: unknown,
  validators: Arr<(field: string, value: any) => Exit.Exit<any, ValidationError>>
): Exit.Exit<A, Arr<ValidationError>> => {
  const errors: Arr<ValidationError> = []
  let currentValue: any = value
  
  for (const validator of validators) {
    const exit = validator(field, currentValue)
    
    if (Exit.isFailure(exit)) {
      const failure = Cause.failureOption(exit.cause)
      if (failure) {
        errors.push(failure)
      }
      // Stop on first error for this field
      break
    } else {
      currentValue = exit.value
    }
  }
  
  if (errors.length > 0) {
    return Exit.fail(errors)
  }
  
  return Exit.succeed(currentValue)
}

// User validation using exit-based pipeline
interface CreateUserRequest {
  name?: unknown
  email?: unknown
  age?: unknown
}

interface ValidatedUser {
  name: string
  email: string
  age: number
}

const validateUser = (request: CreateUserRequest): Exit.Exit<ValidatedUser, Arr<ValidationError>> => {
  // Validate each field independently
  const nameExit = validateField('name', request.name, [
    validateRequired,
    validateString
  ])
  
  const emailExit = validateField('email', request.email, [
    validateRequired,
    validateString,
    (field, value) => validateEmail(field, value as string)
  ])
  
  const ageExit = validateField('age', request.age, [
    validateRequired,
    validateNumber,
    (field, value) => validateRange(field, value as number, 0, 150)
  ])
  
  // Collect all validation results
  const exits = [nameExit, emailExit, ageExit]
  const allErrors: Arr<ValidationError> = []
  const values: Arr<any> = []
  
  for (const exit of exits) {
    if (Exit.isFailure(exit)) {
      const failure = Cause.failureOption(exit.cause)
      if (failure) {
        allErrors.push(...failure)
      }
    } else {
      values.push(exit.value)
    }
  }
  
  // Return all errors if any validation failed
  if (allErrors.length > 0) {
    return Exit.fail(allErrors)
  }
  
  // All validations passed
  const [name, email, age] = values
  return Exit.succeed({ name, email, age })
}

// Usage with comprehensive error reporting
const createUser = (request: CreateUserRequest) =>
  Effect.gen(function* () {
    const validationExit = validateUser(request)
    
    return Exit.match(validationExit, {
      onSuccess: (validatedUser) => ({
        success: true,
        data: validatedUser,
        message: 'User data validated successfully'
      }),
      onFailure: (cause) => {
        const failures = Cause.failureOption(cause)
        
        if (failures) {
          const errorsByField = failures.reduce((acc, error) => {
            if (!acc[error.field]) {
              acc[error.field] = []
            }
            acc[error.field].push({
              message: error.message,
              value: error.value
            })
            return acc
          }, {} as Record<string, Array<{ message: string; value: unknown }>>)
          
          return {
            success: false,
            errors: errorsByField,
            message: `Validation failed for ${Object.keys(errorsByField).length} field(s)`,
            fieldCount: Object.keys(errorsByField).length,
            errorCount: failures.length
          }
        }
        
        return {
          success: false,
          errors: {},
          message: 'Unknown validation error',
          fieldCount: 0,
          errorCount: 0
        }
      }
    })
  })

// Batch validation for multiple users
const validateUsers = (requests: Arr<CreateUserRequest>) =>
  Effect.gen(function* () {
    const results = requests.map((request, index) => ({
      index,
      request,
      validation: validateUser(request)
    }))
    
    const successful: Arr<{ index: number; user: ValidatedUser }> = []
    const failed: Arr<{ index: number; errors: Arr<ValidationError> }> = []
    
    for (const { index, validation } of results) {
      if (Exit.isSuccess(validation)) {
        successful.push({ index, user: validation.value })
      } else {
        const failures = Cause.failureOption(validation.cause)
        if (failures) {
          failed.push({ index, errors: failures })
        }
      }
    }
    
    return {
      total: requests.length,
      successful: successful.length,
      failed: failed.length,
      successfulUsers: successful,
      failedValidations: failed,
      successRate: (successful.length / requests.length) * 100
    }
  })
```

### Pattern 3: Exit-Based State Machines

Use Exit to model state transitions and handle invalid state changes:

```typescript
import { Exit, Effect, Ref, Console } from "effect"

// Order processing state machine
type OrderState = 
  | { _tag: 'Draft'; items: Arr<OrderItem> }
  | { _tag: 'Submitted'; orderId: string; submittedAt: Date }  
  | { _tag: 'Confirmed'; orderId: string; confirmedAt: Date }
  | { _tag: 'Shipped'; orderId: string; trackingNumber: string; shippedAt: Date }
  | { _tag: 'Delivered'; orderId: string; deliveredAt: Date }
  | { _tag: 'Cancelled'; orderId: string; reason: string; cancelledAt: Date }

// State transition errors
interface StateTransitionError {
  readonly _tag: 'StateTransitionError'
  readonly from: OrderState['_tag']
  readonly to: OrderState['_tag']
  readonly reason: string
}

interface BusinessRuleError {
  readonly _tag: 'BusinessRuleError'
  readonly rule: string
  readonly details: string
}

type OrderError = StateTransitionError | BusinessRuleError

// Order state machine with exit-based transitions
class OrderStateMachine {
  constructor(private state: Ref.Ref<OrderState>) {}
  
  // Transition: Draft -> Submitted
  submit(orderId: string): Effect.Effect<Exit.Exit<OrderState, OrderError>, never> {
    return Effect.gen(function* () {
      const current = yield* Ref.get(this.state)
      
      if (current._tag !== 'Draft') {
        return Exit.fail<OrderError>({
          _tag: 'StateTransitionError',
          from: current._tag,
          to: 'Submitted',
          reason: 'Order can only be submitted from Draft state'
        })
      }
      
      if (current.items.length === 0) {
        return Exit.fail<OrderError>({
          _tag: 'BusinessRuleError',
          rule: 'non_empty_cart',
          details: 'Order must contain at least one item'
        })
      }
      
      const newState: OrderState = {
        _tag: 'Submitted',
        orderId,
        submittedAt: new Date()
      }
      
      yield* Ref.set(this.state, newState)
      return Exit.succeed(newState)
    }.bind(this))
  }
  
  // Transition: Submitted -> Confirmed
  confirm(): Effect.Effect<Exit.Exit<OrderState, OrderError>, never> {
    return Effect.gen(function* () {
      const current = yield* Ref.get(this.state)
      
      if (current._tag !== 'Submitted') {
        return Exit.fail<OrderError>({
          _tag: 'StateTransitionError',
          from: current._tag,
          to: 'Confirmed',
          reason: 'Order can only be confirmed from Submitted state'
        })
      }
      
      const newState: OrderState = {
        _tag: 'Confirmed',
        orderId: current.orderId,
        confirmedAt: new Date()
      }
      
      yield* Ref.set(this.state, newState)
      return Exit.succeed(newState)
    }.bind(this))
  }
  
  // Transition: Confirmed -> Shipped
  ship(trackingNumber: string): Effect.Effect<Exit.Exit<OrderState, OrderError>, never> {
    return Effect.gen(function* () {
      const current = yield* Ref.get(this.state)
      
      if (current._tag !== 'Confirmed') {
        return Exit.fail<OrderError>({
          _tag: 'StateTransitionError',
          from: current._tag,
          to: 'Shipped',
          reason: 'Order can only be shipped from Confirmed state'
        })
      }
      
      if (!trackingNumber || trackingNumber.trim() === '') {
        return Exit.fail<OrderError>({
          _tag: 'BusinessRuleError',
          rule: 'tracking_required',
          details: 'Tracking number is required for shipping'
        })
      }
      
      const newState: OrderState = {
        _tag: 'Shipped',
        orderId: current.orderId,
        trackingNumber: trackingNumber.trim(),
        shippedAt: new Date()
      }
      
      yield* Ref.set(this.state, newState)
      return Exit.succeed(newState)
    }.bind(this))
  }
  
  // Cancel from any state (except Delivered)
  cancel(reason: string): Effect.Effect<Exit.Exit<OrderState, OrderError>, never> {
    return Effect.gen(function* () {
      const current = yield* Ref.get(this.state)
      
      if (current._tag === 'Delivered') {
        return Exit.fail<OrderError>({
          _tag: 'StateTransitionError',
          from: current._tag,
          to: 'Cancelled',
          reason: 'Cannot cancel delivered orders'
        })
      }
      
      if (current._tag === 'Cancelled') {
        return Exit.fail<OrderError>({
          _tag: 'StateTransitionError',
          from: current._tag,
          to: 'Cancelled',
          reason: 'Order is already cancelled'
        })
      }
      
      const orderId = current._tag === 'Draft' ? 'DRAFT' : current.orderId
      
      const newState: OrderState = {
        _tag: 'Cancelled',
        orderId,
        reason,
        cancelledAt: new Date()
      }
      
      yield* Ref.set(this.state, newState)
      return Exit.succeed(newState)
    }.bind(this))
  }
  
  getCurrentState(): Effect.Effect<OrderState> {
    return Ref.get(this.state)
  }
}

// Order processor with exit-based state management
const processOrder = (initialItems: Arr<OrderItem>) =>
  Effect.gen(function* () {
    const initialState: OrderState = { _tag: 'Draft', items: initialItems }
    const stateRef = yield* Ref.make(initialState)
    const stateMachine = new OrderStateMachine(stateRef)
    
    const transitions: Arr<{
      action: string
      exit: Exit.Exit<OrderState, OrderError>
      timestamp: Date
    }> = []
    
    // Step 1: Submit order
    yield* Console.log('Submitting order...')
    const submitExit = yield* stateMachine.submit(`ORDER-${Date.now()}`)
    transitions.push({ action: 'submit', exit: submitExit, timestamp: new Date() })
    
    if (Exit.isFailure(submitExit)) {
      return { success: false, failedAt: 'submit', transitions }
    }
    
    // Step 2: Confirm order
    yield* Console.log('Confirming order...')
    const confirmExit = yield* stateMachine.confirm()
    transitions.push({ action: 'confirm', exit: confirmExit, timestamp: new Date() })
    
    if (Exit.isFailure(confirmExit)) {
      return { success: false, failedAt: 'confirm', transitions }
    }
    
    // Step 3: Ship order
    yield* Console.log('Shipping order...')
    const shipExit = yield* stateMachine.ship(`TRACK-${Date.now()}`)
    transitions.push({ action: 'ship', exit: shipExit, timestamp: new Date() })
    
    if (Exit.isFailure(shipExit)) {
      return { success: false, failedAt: 'ship', transitions }
    }
    
    const finalState = yield* stateMachine.getCurrentState()
    
    return {
      success: true,
      finalState,
      transitions,
      summary: {
        totalTransitions: transitions.length,
        successfulTransitions: transitions.filter(t => Exit.isSuccess(t.exit)).length,
        processingTime: transitions[transitions.length - 1].timestamp.getTime() - transitions[0].timestamp.getTime()
      }
    }
  })

// Batch order processor with detailed state tracking
const batchOrderProcessor = (orders: Arr<{ id: string; items: Arr<OrderItem> }>) =>
  Effect.gen(function* () {
    const results: Arr<{
      orderId: string
      result: Awaited<ReturnType<typeof processOrder>>
    }> = []
    
    for (const order of orders) {
      yield* Console.log(`Processing order ${order.id}...`)
      
      const result = yield* processOrder(order.items)
      results.push({ orderId: order.id, result })
      
      if (result.success) {
        yield* Console.log(`✓ Order ${order.id} processed successfully`)
      } else {
        const failedTransition = result.transitions.find(t => Exit.isFailure(t.exit))
        if (failedTransition) {
          const error = Exit.match(failedTransition.exit, {
            onSuccess: () => null,
            onFailure: cause => Cause.failureOption(cause)
          })
          
          yield* Console.log(`✗ Order ${order.id} failed at ${result.failedAt}: ${
            error ? error.reason || error.details : 'Unknown error'
          }`)
        }
      }
    }
    
    const successful = results.filter(r => r.result.success)
    const failed = results.filter(r => !r.result.success)
    
    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      results
    }
  })
```

## Integration Examples

### Integration with Testing Frameworks

Exit makes testing Effect-based code more predictable by providing explicit access to all completion states:

```typescript
import { Exit, Effect, Cause, Schedule } from "effect"
import { describe, it, expect } from "bun:test"

// Service under test
interface UserService {
  readonly findUser: (id: string) => Effect.Effect<User, UserError>
  readonly createUser: (data: CreateUserData) => Effect.Effect<User, UserError>
  readonly updateUser: (id: string, data: UpdateUserData) => Effect.Effect<User, UserError>
}

// Test utilities for exit-based assertions
const exitTestUtils = {
  // Assert that an exit is successful with expected value
  expectSuccess: <A, E>(exit: Exit.Exit<A, E>, expected: A) => {
    expect(Exit.isSuccess(exit)).toBe(true)
    if (Exit.isSuccess(exit)) {
      expect(exit.value).toEqual(expected)
    }
  },
  
  // Assert that an exit failed with expected error
  expectFailure: <A, E>(exit: Exit.Exit<A, E>, expectedError: E) => {
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const failure = Cause.failureOption(exit.cause)
      expect(failure).toEqual(expectedError)
    }
  },
  
  // Assert that an exit was interrupted
  expectInterrupted: <A, E>(exit: Exit.Exit<A, E>) => {
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(Cause.isInterruptType(exit.cause)).toBe(true)
    }
  },
  
  // Assert that an exit contains a defect
  expectDefect: <A, E>(exit: Exit.Exit<A, E>, expectedDefect?: unknown) => {
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(Cause.isDieType(exit.cause)).toBe(true)
      if (expectedDefect !== undefined) {
        const defect = Cause.dieOption(exit.cause)
        expect(defect).toEqual(expectedDefect)
      }
    }
  },
  
  // Get failure from exit for detailed assertions
  getFailure: <A, E>(exit: Exit.Exit<A, E>): E | null => {
    if (Exit.isFailure(exit)) {
      return Cause.failureOption(exit.cause)
    }
    return null
  }
}

describe('UserService with Exit-based testing', () => {
  // Mock service implementation
  const mockUserService: UserService = {
    findUser: (id: string) => {
      if (id === 'user-123') {
        return Effect.succeed({ id, name: 'John Doe', email: 'john@example.com' })
      }
      if (id === 'user-error') {
        return Effect.fail({ _tag: 'DatabaseError' as const, message: 'Connection failed' })
      }
      if (id === 'user-defect') {
        return Effect.die(new Error('Unexpected error'))
      }
      return Effect.fail({ _tag: 'NotFoundError' as const, entity: 'User', id })
    },
    
    createUser: (data: CreateUserData) => {
      if (data.email === 'invalid@') {
        return Effect.fail({ _tag: 'ValidationError' as const, field: 'email', message: 'Invalid email' })
      }
      return Effect.succeed({ 
        id: 'new-user-id', 
        name: data.name, 
        email: data.email 
      })
    },
    
    updateUser: (id: string, data: UpdateUserData) => {
      if (id === 'readonly-user') {
        return Effect.fail({ _tag: 'PermissionError' as const, operation: 'update', resource: 'user' })
      }
      return Effect.succeed({ 
        id, 
        name: data.name || 'Updated Name', 
        email: data.email || 'updated@example.com' 
      })
    }
  }
  
  it('should handle successful user lookup', async () => {
    const userExit = await Effect.runPromise(
      Effect.exit(mockUserService.findUser('user-123'))
    )
    
    exitTestUtils.expectSuccess(userExit, {
      id: 'user-123',
      name: 'John Doe', 
      email: 'john@example.com'
    })
  })
  
  it('should handle user not found error', async () => {
    const userExit = await Effect.runPromise(
      Effect.exit(mockUserService.findUser('nonexistent'))
    )
    
    exitTestUtils.expectFailure(userExit, {
      _tag: 'NotFoundError',
      entity: 'User',
      id: 'nonexistent'
    })
  })
  
  it('should handle database errors', async () => {
    const userExit = await Effect.runPromise(
      Effect.exit(mockUserService.findUser('user-error'))
    )
    
    const failure = exitTestUtils.getFailure(userExit)
    expect(failure).toEqual({
      _tag: 'DatabaseError',
      message: 'Connection failed'
    })
  })
  
  it('should handle defects (unexpected errors)', async () => {
    const userExit = await Effect.runPromise(
      Effect.exit(mockUserService.findUser('user-defect'))
    )
    
    exitTestUtils.expectDefect(userExit, new Error('Unexpected error'))
  })
  
  it('should handle validation errors in user creation', async () => {
    const createExit = await Effect.runPromise(
      Effect.exit(mockUserService.createUser({
        name: 'Test User',
        email: 'invalid@'
      }))
    )
    
    exitTestUtils.expectFailure(createExit, {
      _tag: 'ValidationError',
      field: 'email',
      message: 'Invalid email'
    })
  })
  
  it('should handle permission errors', async () => {
    const updateExit = await Effect.runPromise(
      Effect.exit(mockUserService.updateUser('readonly-user', { name: 'New Name' }))
    )
    
    exitTestUtils.expectFailure(updateExit, {
      _tag: 'PermissionError',
      operation: 'update',
      resource: 'user'
    })
  })
  
  it('should test retry behavior with exits', async () => {
    let attemptCount = 0
    
    const flakyOperation = Effect.gen(function* () {
      attemptCount++
      if (attemptCount < 3) {
        return yield* Effect.fail({ _tag: 'TemporaryError' as const, attempt: attemptCount })
      }
      return yield* Effect.succeed('Success after retries')
    })
    
    const retryResult = await Effect.runPromise(
      Effect.exit(
        flakyOperation.pipe(
          Effect.retry(Schedule.recurs(5))
        )
      )
    )
    
    exitTestUtils.expectSuccess(retryResult, 'Success after retries')
    expect(attemptCount).toBe(3)
  })
  
  it('should test timeout behavior with exits', async () => {
    const slowOperation = Effect.gen(function* () {
      yield* Effect.sleep('2 seconds')
      return 'This should timeout'
    })
    
    const timeoutResult = await Effect.runPromise(
      Effect.exit(
        slowOperation.pipe(
          Effect.timeout('500 millis')
        )
      )
    )
    
    expect(Exit.isFailure(timeoutResult)).toBe(true)
    // Timeout creates an interruption
    if (Exit.isFailure(timeoutResult)) {
      expect(Cause.isInterruptType(timeoutResult.cause)).toBe(true)  
    }
  })
  
  it('should test interruption handling', async () => {
    const interruptibleOperation = Effect.gen(function* () {
      yield* Effect.sleep('5 seconds')
      return 'Should not complete'
    })
    
    const fiber = await Effect.runPromise(Effect.fork(interruptibleOperation))
    
    // Interrupt after a short delay
    setTimeout(() => {
      Effect.runFork(fiber.interrupt())
    }, 100)
    
    const exit = await Effect.runPromise(fiber.await())
    exitTestUtils.expectInterrupted(exit)
  })
})

// Property-based testing with exits
describe('Exit property tests', () => {
  it('should satisfy exit laws', () => {
    // Identity law: Exit.map(exit, x => x) === exit
    const exit = Exit.succeed(42)
    const mappedExit = Exit.map(exit, x => x)
    expect(mappedExit).toEqual(exit)
    
    // Composition law: Exit.map(Exit.map(exit, f), g) === Exit.map(exit, x => g(f(x)))
    const f = (x: number) => x * 2
    const g = (x: number) => x + 1
    
    const composed1 = Exit.map(Exit.map(exit, f), g)
    const composed2 = Exit.map(exit, x => g(f(x)))
    
    expect(composed1).toEqual(composed2)
  })
  
  it('should handle exit combinations correctly', () => {
    const success1 = Exit.succeed(1)
    const success2 = Exit.succeed(2)
    const failure = Exit.fail('error')
    
    // zip succeeds only if both succeed
    const successZip = Exit.zip(success1, success2)
    exitTestUtils.expectSuccess(successZip, [1, 2])
    
    // zip fails if either fails
    const failureZip = Exit.zip(success1, failure)
    expect(Exit.isFailure(failureZip)).toBe(true)
  })
})
```

### Integration with Express.js and HTTP APIs

Exit provides excellent integration with web frameworks, enabling comprehensive HTTP error handling:

```typescript
import { Exit, Effect, Cause } from "effect"
import express, { Request, Response, NextFunction } from "express"

// HTTP-specific error types
interface HttpError {
  readonly _tag: 'HttpError'
  readonly status: number
  readonly message: string
  readonly code?: string
}

interface ValidationError {
  readonly _tag: 'ValidationError'
  readonly field: string
  readonly message: string
  readonly value: unknown
}

interface ServiceError {
  readonly _tag: 'ServiceError'
  readonly service: string
  readonly operation: string
  readonly details: string
}

type ApiError = HttpError | ValidationError | ServiceError

// Exit-to-HTTP response mapper
const mapExitToHttpResponse = <A>(exit: Exit.Exit<A, ApiError>) => {
  return Exit.match(exit, {
    onSuccess: (data) => ({
      status: 200,
      body: {
        success: true,
        data,
        timestamp: new Date().toISOString()
      }
    }),
    onFailure: (cause) => {
      // Handle interruption
      if (Cause.isInterruptType(cause)) {
        return {
          status: 408,
          body: {
            success: false,
            error: 'Request timeout',
            code: 'TIMEOUT',
            timestamp: new Date().toISOString()
          }
        }
      }
      
      // Handle defects
      if (Cause.isDieType(cause)) {
        return {
          status: 500,
          body: {
            success: false,
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
          }
        }
      }
      
      // Handle expected failures
      const failure = Cause.failureOption(cause)
      if (failure) {
        switch (failure._tag) {
          case 'HttpError':
            return {
              status: failure.status,
              body: {
                success: false,
                error: failure.message,
                code: failure.code,
                timestamp: new Date().toISOString()
              }
            }
            
          case 'ValidationError':
            return {
              status: 400,
              body: {
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: {
                  field: failure.field,
                  message: failure.message,
                  value: failure.value
                },
                timestamp: new Date().toISOString()
              }
            }
            
          case 'ServiceError':
            return {
              status: 503,
              body: {
                success: false,
                error: `Service ${failure.service} unavailable`,
                code: 'SERVICE_UNAVAILABLE',
                details: failure.details,
                timestamp: new Date().toISOString()
              }
            }
        }
      }
      
      // Fallback for unknown errors
      return {
        status: 500,
        body: {
          success: false,
          error: 'Unknown error occurred',
          code: 'UNKNOWN_ERROR',
          timestamp: new Date().toISOString()
        }
      }
    }
  })
}

// Express middleware for handling Effect-based routes
const effectHandler = <A>(
  effectFn: (req: Request) => Effect.Effect<A, ApiError>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Run the effect and get the exit
      const exit = await Effect.runPromise(
        Effect.exit(effectFn(req)).pipe(
          Effect.timeout('30 seconds') // Add timeout to prevent hanging requests
        )
      )
      
      // Map exit to HTTP response
      const httpResponse = mapExitToHttpResponse(exit)
      
      // Log the request outcome
      console.log(`${req.method} ${req.path} - ${httpResponse.status}`, {
        success: Exit.isSuccess(exit),
        duration: Date.now() - req.startTime,
        userAgent: req.get('User-Agent')
      })
      
      res.status(httpResponse.status).json(httpResponse.body)
      
    } catch (error) {
      // Handle unexpected errors outside of Effect
      console.error('Unexpected error in effect handler:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'HANDLER_ERROR',
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Example API routes using exit-based error handling
const app = express()
app.use(express.json())

// Add request timing middleware
app.use((req: any, res, next) => {
  req.startTime = Date.now()
  next()
})

// User management routes
app.get('/users/:id', effectHandler((req) =>
  Effect.gen(function* () {
    const userId = req.params.id
    
    // Validate user ID format
    if (!userId || userId.length < 3) {
      return yield* Effect.fail<ApiError>({
        _tag: 'ValidationError',
        field: 'id',
        message: 'User ID must be at least 3 characters',
        value: userId
      })
    }
    
    // Simulate user lookup with potential failures
    if (userId === 'user-404') {
      return yield* Effect.fail<ApiError>({
        _tag: 'HttpError',
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }
    
    if (userId === 'user-service-error') {
      return yield* Effect.fail<ApiError>({
        _tag: 'ServiceError',
        service: 'UserDatabase',
        operation: 'findById',
        details: 'Database connection timeout'
      })
    }
    
    // Simulate successful user retrieval
    return {
      id: userId,
      name: `User ${userId}`,
      email: `${userId}@example.com`,
      createdAt: new Date().toISOString()
    }
  })
))

app.post('/users', effectHandler((req) =>
  Effect.gen(function* () {
    const { name, email, age } = req.body
    
    // Validation
    const validationErrors: Array<ValidationError> = []
    
    if (!name || typeof name !== 'string') {
      validationErrors.push({
        _tag: 'ValidationError',
        field: 'name',
        message: 'Name is required and must be a string',
        value: name
      })
    }
    
    if (!email || typeof email !== 'string') {
      validationErrors.push({
        _tag: 'ValidationError',
        field: 'email',
        message: 'Email is required and must be a string',
        value: email
      })
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        validationErrors.push({
          _tag: 'ValidationError',
          field: 'email',
          message: 'Invalid email format',
          value: email
        })
      }
    }
    
    if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
      validationErrors.push({
        _tag: 'ValidationError',
        field: 'age',
        message: 'Age must be a number between 0 and 150',
        value: age
      })
    }
    
    // Return first validation error if any
    if (validationErrors.length > 0) {
      return yield* Effect.fail<ApiError>(validationErrors[0])
    }
    
    // Simulate user creation
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      age,
      createdAt: new Date().toISOString()
    }
    
    return newUser
  })
))

// Batch operations with detailed exit reporting
app.post('/users/batch', effectHandler((req) =>
  Effect.gen(function* () {
    const { users } = req.body
    
    if (!Array.isArray(users)) {
      return yield* Effect.fail<ApiError>({
        _tag: 'ValidationError',
        field: 'users',
        message: 'Users must be an array',
        value: users
      })
    }
    
    // Process each user and collect exits
    const results: Arr<{
      index: number
      userData: any
      exit: Exit.Exit<any, ApiError>
    }> = []
    
    for (let i = 0; i < users.length; i++) {
      const userData = users[i]
      
      // Create user effect for this item
      const createUserEffect = Effect.gen(function* () {
        const { name, email } = userData
        
        if (!name || !email) {
          return yield* Effect.fail<ApiError>({
            _tag: 'ValidationError',
            field: name ? 'email' : 'name',
            message: `${name ? 'Email' : 'Name'} is required`,
            value: userData
          })
        }
        
        return {
          id: `batch-user-${i}-${Date.now()}`,
          name,
          email,
          createdAt: new Date().toISOString()
        }
      })
      
      const exit = yield* Effect.exit(createUserEffect)
      results.push({ index: i, userData, exit })
    }
    
    // Analyze results
    const successful = results.filter(r => Exit.isSuccess(r.exit))
    const failed = results.filter(r => Exit.isFailure(r.exit))
    
    return {
      total: users.length,
      successful: successful.length,
      failed: failed.length,
      results: results.map(r => ({
        index: r.index,
        success: Exit.isSuccess(r.exit),
        data: Exit.isSuccess(r.exit) ? r.exit.value : null,
        error: Exit.isFailure(r.exit) ? 
          mapExitToHttpResponse(r.exit).body.error : null
      }))
    }
  })
))

// Health check endpoint with detailed service status
app.get('/health', effectHandler(() =>
  Effect.gen(function* () {
    const services = ['database', 'cache', 'external-api']
    const healthChecks: Array<{
      service: string
      exit: Exit.Exit<{ status: string; responseTime: number }, ServiceError>
    }> = []
    
    for (const service of services) {
      const checkEffect = Effect.gen(function* () {
        const startTime = Date.now()
        
        // Simulate health check
        yield* Effect.sleep(`${Math.random() * 100} millis`)
        
        // Simulate occasional service failures
        if (Math.random() < 0.1) {
          return yield* Effect.fail<ServiceError>({
            _tag: 'ServiceError',
            service,
            operation: 'healthCheck',
            details: 'Service temporarily unavailable'
          })
        }
        
        return {
          status: 'healthy',
          responseTime: Date.now() - startTime
        }
      })
      
      const exit = yield* Effect.exit(checkEffect)
      healthChecks.push({ service, exit })
    }
    
    const healthyServices = healthChecks.filter(h => Exit.isSuccess(h.exit))
    const unhealthyServices = healthChecks.filter(h => Exit.isFailure(h.exit))
    
    const overall = unhealthyServices.length === 0 ? 'healthy' : 
                   healthyServices.length === 0 ? 'unhealthy' : 'degraded'
    
    return {
      status: overall,
      timestamp: new Date().toISOString(),
      services: healthChecks.map(h => ({
        name: h.service,
        status: Exit.isSuccess(h.exit) ? 'healthy' : 'unhealthy',
        details: Exit.isSuccess(h.exit) ? h.exit.value : 
                Exit.match(h.exit, {
                  onSuccess: () => null,
                  onFailure: cause => Cause.failureOption(cause)?.details || 'Unknown error'
                })
      }))
    }
  })
))

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### Integration with Database Libraries (Prisma Example)

Exit provides excellent integration with database operations, enabling detailed transaction handling and error recovery:

```typescript
import { Exit, Effect, Cause, Layer } from "effect"
import { PrismaClient } from "@prisma/client"

// Database-specific error types
interface DatabaseConnectionError {
  readonly _tag: 'DatabaseConnectionError'
  readonly database: string
  readonly details: string
}

interface QueryError {
  readonly _tag: 'QueryError'
  readonly operation: string
  readonly table: string
  readonly details: string
}

interface TransactionError {
  readonly _tag: 'TransactionError' 
  readonly operation: string
  readonly rollbackCompleted: boolean
  readonly details: string
}

interface ConstraintViolationError {
  readonly _tag: 'ConstraintViolationError'
  readonly constraint: string
  readonly table: string
  readonly details: string
}

type DatabaseError = 
  | DatabaseConnectionError 
  | QueryError 
  | TransactionError 
  | ConstraintViolationError

// Prisma service with exit-based error handling
interface PrismaService {
  readonly client: PrismaClient
  readonly findUser: (id: string) => Effect.Effect<Exit.Exit<User | null, DatabaseError>, never>
  readonly createUser: (data: CreateUserData) => Effect.Effect<Exit.Exit<User, DatabaseError>, never>
  readonly updateUser: (id: string, data: UpdateUserData) => Effect.Effect<Exit.Exit<User, DatabaseError>, never>
  readonly deleteUser: (id: string) => Effect.Effect<Exit.Exit<void, DatabaseError>, never>
  readonly createUserWithProfile: (
    userData: CreateUserData,
    profileData: CreateProfileData
  ) => Effect.Effect<Exit.Exit<{ user: User; profile: Profile }, DatabaseError>, never>
}

const PrismaService = Effect.Tag<PrismaService>()

// Implementation with comprehensive error handling
const makePrismaService = (client: PrismaClient): PrismaService => ({
  client,
  
  findUser: (id: string) =>
    Effect.gen(function* () {
      const queryExit = yield* Effect.exit(
        Effect.tryPromise({
          try: () => client.user.findUnique({ where: { id } }),
          catch: (error): DatabaseError => {
            if (error instanceof Error) {
              if (error.message.includes('connection')) {
                return {
                  _tag: 'DatabaseConnectionError',
                  database: 'postgresql',
                  details: error.message
                }
              }
              
              return {
                _tag: 'QueryError',
                operation: 'findUnique',
                table: 'user',
                details: error.message
              }
            }
            
            return {
              _tag: 'QueryError',
              operation: 'findUnique',
              table: 'user',
              details: 'Unknown database error'
            }
          }
        })
      )
      
      return queryExit
    }),
  
  createUser: (data: CreateUserData) =>
    Effect.gen(function* () {
      const createExit = yield* Effect.exit(
        Effect.tryPromise({
          try: () => client.user.create({ data }),
          catch: (error): DatabaseError => {
            if (error instanceof Error) {
              // Handle unique constraint violations
              if (error.message.includes('Unique constraint')) {
                return {
                  _tag: 'ConstraintViolationError',
                  constraint: 'unique_email',
                  table: 'user',
                  details: 'Email already exists'
                }
              }
              
              // Handle other constraint violations
              if (error.message.includes('Foreign key constraint')) {
                return {
                  _tag: 'ConstraintViolationError',
                  constraint: 'foreign_key',
                  table: 'user',
                  details: error.message
                }
              }
              
              return {
                _tag: 'QueryError',
                operation: 'create',
                table: 'user',
                details: error.message
              }
            }
            
            return {
              _tag: 'QueryError',
              operation: 'create',
              table: 'user',
              details: 'Unknown database error'
            }
          }
        })
      )
      
      return createExit
    }),
  
  updateUser: (id: string, data: UpdateUserData) =>
    Effect.gen(function* () {
      const updateExit = yield* Effect.exit(
        Effect.tryPromise({
          try: () => client.user.update({ where: { id }, data }),
          catch: (error): DatabaseError => {
            if (error instanceof Error) {
              if (error.message.includes('Record to update not found')) {
                return {
                  _tag: 'QueryError',
                  operation: 'update',
                  table: 'user',
                  details: `User with id ${id} not found`
                }
              }
              
              return {
                _tag: 'QueryError',
                operation: 'update',
                table: 'user',
                details: error.message
              }
            }
            
            return {
              _tag: 'QueryError',
              operation: 'update',
              table: 'user',
              details: 'Unknown database error'
            }
          }
        })
      )
      
      return updateExit
    }),
  
  deleteUser: (id: string) =>
    Effect.gen(function* () {
      const deleteExit = yield* Effect.exit(
        Effect.tryPromise({
          try: () => client.user.delete({ where: { id } }).then(() => undefined),
          catch: (error): DatabaseError => {
            if (error instanceof Error) {
              if (error.message.includes('Record to delete does not exist')) {
                return {
                  _tag: 'QueryError',
                  operation: 'delete',
                  table: 'user',
                  details: `User with id ${id} not found`
                }
              }
              
              return {
                _tag: 'QueryError',
                operation: 'delete',
                table: 'user',
                details: error.message
              }
            }
            
            return {
              _tag: 'QueryError',
              operation: 'delete',
              table: 'user',
              details: 'Unknown database error'
            }
          }
        })
      )
      
      return deleteExit
    }),
  
  createUserWithProfile: (userData: CreateUserData, profileData: CreateProfileData) =>
    Effect.gen(function* () {
      const transactionExit = yield* Effect.exit(
        Effect.tryPromise({
          try: () =>
            client.$transaction(async (tx) => {
              const user = await tx.user.create({ data: userData })
              const profile = await tx.profile.create({
                data: { ...profileData, userId: user.id }
              })
              return { user, profile }
            }),
          catch: (error): DatabaseError => {
            if (error instanceof Error) {
              return {
                _tag: 'TransactionError',
                operation: 'createUserWithProfile',
                rollbackCompleted: true, // Prisma handles rollback automatically
                details: error.message
              }
            }
            
            return {
              _tag: 'TransactionError',
              operation: 'createUserWithProfile',
              rollbackCompleted: true,
              details: 'Unknown transaction error'
            }
          }
        })
      )
      
      return transactionExit
    })
})

// Layer for providing PrismaService
const makePrismaServiceLayer = Effect.gen(function* () {
  const client = new PrismaClient()
  
  // Test connection
  const connectionExit = yield* Effect.exit(
    Effect.tryPromise({
      try: () => client.$connect(),
      catch: (error): DatabaseError => ({
        _tag: 'DatabaseConnectionError',
        database: 'postgresql',
        details: error instanceof Error ? error.message : 'Connection failed'
      })
    })
  )
  
  if (Exit.isFailure(connectionExit)) {
    yield* Effect.log(`Database connection failed: ${Cause.pretty(connectionExit.cause)}`)
    yield* Effect.fail(connectionExit.cause)
  }
  
  yield* Effect.log('Database connected successfully')
  
  const service = makePrismaService(client)
  
  return service
}).pipe(
  Effect.tap(() => Effect.log('PrismaService initialized')),
  Layer.effect(PrismaService)
)

// Repository pattern with exit-based operations
const userRepository = Effect.gen(function* () {
  const prisma = yield* PrismaService
  
  return {
    // Find user with detailed exit handling
    findById: (id: string) =>
      Effect.gen(function* () {
        const exit = yield* prisma.findUser(id)
        
        return Exit.match(exit, {
          onSuccess: (user) => ({
            found: user !== null,
            data: user,
            message: user ? `User found: ${user.email}` : `User ${id} not found`
          }),
          onFailure: (cause) => {
            const failure = Cause.failureOption(cause)
            
            if (failure) {
              switch (failure._tag) {
                case 'DatabaseConnectionError':
                  return {
                    found: false,
                    data: null,
                    error: 'database_connection',
                    message: 'Database connection failed',
                    retryable: true,
                    details: failure.details
                  }
                  
                case 'QueryError':
                  return {
                    found: false,
                    data: null,
                    error: 'query_error',
                    message: `Query failed: ${failure.operation}`,
                    retryable: false,
                    details: failure.details
                  }
              }
            }
            
            return {
              found: false,
              data: null,
              error: 'unknown',
              message: 'Unknown database error',
              retryable: false,
              details: Cause.pretty(cause)
            }
          }
        })
      }),
    
    // Create user with validation and conflict handling
    create: (userData: CreateUserData) =>
      Effect.gen(function* () {
        const exit = yield* prisma.createUser(userData)
        
        return Exit.match(exit, {
          onSuccess: (user) => ({
            success: true,
            data: user,
            message: `User created: ${user.email}`
          }),
          onFailure: (cause) => {
            const failure = Cause.failureOption(cause)
            
            if (failure) {
              switch (failure._tag) {
                case 'ConstraintViolationError':
                  return {
                    success: false,
                    data: null,
                    error: 'constraint_violation',
                    message: failure.constraint === 'unique_email' 
                      ? 'Email already exists' 
                      : 'Constraint violation',
                    field: failure.constraint === 'unique_email' ? 'email' : undefined,
                    retryable: false
                  }
                  
                case 'QueryError':
                  return {
                    success: false,
                    data: null,
                    error: 'query_error',
                    message: 'Failed to create user',
                    retryable: true,
                    details: failure.details
                  }
              }
            }
            
            return {
              success: false,
              data: null,
              error: 'unknown',
              message: 'Unknown error creating user',
              retryable: false,
              details: Cause.pretty(cause)
            }
          }
        })
      }),
    
    // Complex transaction with detailed exit analysis
    createWithProfile: (userData: CreateUserData, profileData: CreateProfileData) =>
      Effect.gen(function* () {
        const exit = yield* prisma.createUserWithProfile(userData, profileData)
        
        return Exit.match(exit, {
          onSuccess: ({ user, profile }) => ({
            success: true,
            data: { user, profile },
            message: `User and profile created: ${user.email}`,
            operations: ['user_create', 'profile_create', 'transaction_commit']
          }),
          onFailure: (cause) => {
            const failure = Cause.failureOption(cause)
            
            if (failure && failure._tag === 'TransactionError') {
              return {
                success: false,
                data: null,
                error: 'transaction_failed',
                message: 'Transaction failed and was rolled back',
                rollbackCompleted: failure.rollbackCompleted,
                operations: ['user_create', 'profile_create', 'transaction_rollback'],
                details: failure.details,
                retryable: true
              }
            }
            
            return {
              success: false,
              data: null,
              error: 'unknown',
              message: 'Unknown transaction error',
              rollbackCompleted: false,
              operations: [],
              details: Cause.pretty(cause),
              retryable: false
            }
          }
        })
      })
  }
})

// Usage example with comprehensive error handling
const userService = Effect.gen(function* () {
  const repo = yield* userRepository
  
  return {
    getUserById: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log(`Fetching user: ${id}`)
        
        const result = yield* repo.findById(id)
        
        yield* Effect.log(
          `User fetch result: ${result.found ? 'found' : 'not found'}`
        )
        
        return result
      }),
    
    createUser: (userData: CreateUserData) =>
      Effect.gen(function* () {
        yield* Effect.log(`Creating user: ${userData.email}`)
        
        const result = yield* repo.create(userData)
        
        yield* Effect.log(
          `User creation result: ${result.success ? 'success' : 'failed'}`
        )
        
        return result
      }),
    
    setupUser: (userData: CreateUserData, profileData: CreateProfileData) =>
      Effect.gen(function* () {
        yield* Effect.log(`Setting up user: ${userData.email}`)
        
        const result = yield* repo.createWithProfile(userData, profileData)
        
        yield* Effect.log(
          `User setup result: ${result.success ? 'success' : 'failed'} - ${result.message}`
        )
        
        if (!result.success && result.retryable) {
          yield* Effect.log('Operation is retryable, consider implementing retry logic')
        }
        
        return result
      })
  }
}).pipe(
  Effect.provide(makePrismaServiceLayer)
)

// Example usage
const program = Effect.gen(function* () {
  const service = yield* userService
  
  // Test user creation
  const createResult = yield* service.createUser({
    email: 'test@example.com',
    name: 'Test User'
  })
  
  if (createResult.success) {
    yield* Effect.log(`User created successfully: ${createResult.data.id}`)
    
    // Test user lookup
    const findResult = yield* service.getUserById(createResult.data.id)
    
    if (findResult.found) {
      yield* Effect.log(`User found: ${findResult.data.name}`)
    }
  } else {
    yield* Effect.log(`User creation failed: ${createResult.message}`)
    
    if (createResult.retryable) {
      yield* Effect.log('Retrying user creation...')
      // Implement retry logic here
    }
  }
})

Effect.runPromise(program).catch(console.error)
```

## Conclusion

Exit provides comprehensive Effect completion handling and result analysis for TypeScript applications. It transforms traditional binary success/failure patterns into rich, composable completion states that capture the full context of Effect execution.

Key benefits:
- **Complete State Representation**: Exit captures all possible completion states including success, expected failures, defects, and interruptions with full contextual information
- **Composable Error Handling**: Exit values can be combined, transformed, and analyzed using a rich set of combinators that preserve error context throughout complex workflows
- **Integration Ready**: Exit provides seamless integration with existing codebases, testing frameworks, web APIs, and database operations through explicit error handling patterns

Exit is ideal for applications requiring robust error handling, detailed failure analysis, comprehensive logging and monitoring, complex state machines, and sophisticated retry and recovery strategies. By making Effect completion states explicit and analyzable, Exit enables developers to build more resilient and maintainable applications with precise control over error handling workflows.