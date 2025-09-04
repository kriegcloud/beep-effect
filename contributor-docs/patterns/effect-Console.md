# Console: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Console Solves

Traditional console operations in Node.js and browser applications are difficult to test, mock, and control. Direct console usage leads to untestable code and inflexible output management:

```typescript
// Traditional approach - untestable and inflexible
export function processUserData(users: User[]) {
  console.log('Processing users:', users.length)
  
  for (const user of users) {
    if (user.age < 18) {
      console.warn('Minor user detected:', user.id)
    }
    console.debug('Processing user:', user.email)
  }
  
  console.table(users.map(u => ({ id: u.id, name: u.name })))
  console.timeEnd('user-processing')
  
  // Issues with this approach:
  // - Cannot test console output
  // - Cannot mock or redirect output
  // - No way to disable debug logs in production
  // - Difficult to structure output for different environments
}

// Testing is impossible or brittle
describe('processUserData', () => {
  it('should log user count', () => {
    // How do you test console.log output?
    // spy on console.log? Fragile and environment-dependent
  })
})
```

This approach leads to:
- **Untestable Code** - Cannot verify console output in tests
- **Inflexible Output** - Cannot redirect or format output differently
- **Environment Issues** - Debug logs cannot be conditionally disabled
- **Coupling** - Business logic tightly coupled to console implementation
- **Poor CI/CD** - Console output clutters build logs and test results

### The Console Solution

Effect's Console module provides testable, mockable, and composable console operations that can be controlled and redirected based on environment or testing needs:

```typescript
import { Console, Effect, Layer } from "effect"

// Testable, mockable console operations
export const processUserData = (users: User[]) =>
  Effect.gen(function* () {
    yield* Console.log('Processing users:', users.length)
    
    for (const user of users) {
      if (user.age < 18) {
        yield* Console.warn('Minor user detected:', user.id)
      }
      yield* Console.debug('Processing user:', user.email)
    }
    
    const tableData = users.map(u => ({ id: u.id, name: u.name }))
    yield* Console.table(tableData)
  }).pipe(
    Console.withTime('user-processing')
  )

// Now testing is straightforward
describe('processUserData', () => {
  it('should log user count and table', async () => {
    const testConsole = makeTestConsole()
    const users = [{ id: 1, name: 'Alice', age: 25, email: 'alice@test.com' }]
    
    await Effect.runPromise(
      processUserData(users).pipe(
        Effect.provide(Layer.succeed(Console.Console, testConsole))
      )
    )
    
    expect(testConsole.logs).toContain('Processing users: 1')
    expect(testConsole.tables).toHaveLength(1)
  })
})
```

### Key Concepts

**Console Service**: A type-safe service that provides all standard console methods as Effect operations, enabling testability and composability.

**Effect Integration**: Console operations are Effect values that can be composed, tested, and provided with different implementations.

**Resource Management**: Time and group operations use Effect's resource management to ensure proper cleanup (timeEnd, groupEnd).

## Basic Usage Patterns

### Pattern 1: Basic Console Operations

```typescript
import { Console, Effect } from "effect"

// Standard console operations as Effects
const basicConsoleOps = Effect.gen(function* () {
  yield* Console.log('Application started')
  yield* Console.info('Configuration loaded')
  yield* Console.warn('Using development mode')
  yield* Console.error('Connection failed, retrying...')
  yield* Console.debug('Cache miss for key:', 'user:123')
})
```

### Pattern 2: Structured Output

```typescript
import { Console, Effect } from "effect"

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

const displayUserReport = (users: User[]) =>
  Effect.gen(function* () {
    // Display user summary
    yield* Console.log(`\n=== User Report (${users.length} users) ===`)
    
    // Show detailed table
    const tableData = users.map(user => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Role: user.role
    }))
    yield* Console.table(tableData, ['ID', 'Name', 'Role'])
    
    // Group admin users
    const adminUsers = users.filter(u => u.role === 'admin')
    if (adminUsers.length > 0) {
      yield* Console.withGroup({ label: 'Admin Users' }, Effect.gen(function* () {
        for (const admin of adminUsers) {
          yield* Console.log(`${admin.name} (${admin.email})`)
        }
      }))
    }
  })
```

### Pattern 3: Performance Timing

```typescript
import { Console, Effect } from "effect"

const performDatabaseOperation = Effect.gen(function* () {
  const result = yield* Console.withTime('db-query', Effect.gen(function* () {
    yield* Console.debug('Starting database query')
    const data = yield* fetchDataFromDatabase()
    yield* Console.debug('Database query completed')
    return data
  }))
  
  yield* Console.log('Operation completed successfully')
  return result
})

// Manual timing control
const manualTiming = Effect.gen(function* () {
  yield* Console.time('complex-operation')
  
  yield* performComplexCalculation()
  yield* Console.timeLog('complex-operation', 'Calculation phase complete')
  
  yield* saveResults()
  yield* Console.timeEnd('complex-operation') // Automatically called by withTime
})
```

## Real-World Examples

### Example 1: CLI Application with Progress Reporting

```typescript
import { Console, Effect, Array as Arr } from "effect"
import * as fs from "node:fs/promises"

interface FileProcessingResult {
  processed: number
  errors: string[]
  duration: number
}

const processFilesWithProgress = (filePaths: string[]) =>
  Effect.gen(function* () {
    yield* Console.log(`Starting to process ${filePaths.length} files...`)
    
    const results: FileProcessingResult[] = []
    const errors: string[] = []
    
    yield* Console.withTime('file-processing', Effect.gen(function* () {
      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i]
        const progress = `[${i + 1}/${filePaths.length}]`
        
        yield* Console.withGroup({ label: `${progress} Processing ${filePath}` }, 
          Effect.gen(function* () {
            try {
              yield* Console.debug('Reading file contents')
              const content = yield* Effect.promise(() => fs.readFile(filePath, 'utf-8'))
              
              yield* Console.debug('Processing content')
              const processedContent = yield* transformContent(content)
              
              yield* Console.debug('Writing processed content')
              yield* Effect.promise(() => fs.writeFile(filePath + '.processed', processedContent))
              
              yield* Console.log('✓ File processed successfully')
            } catch (error) {
              yield* Console.error('✗ Failed to process file:', error)
              errors.push(`${filePath}: ${error}`)
            }
          })
        )
      }
      
      // Summary report
      yield* Console.log('\n=== Processing Summary ===')
      yield* Console.table([
        { Metric: 'Total Files', Value: filePaths.length },
        { Metric: 'Successful', Value: filePaths.length - errors.length },
        { Metric: 'Failed', Value: errors.length }
      ])
      
      if (errors.length > 0) {
        yield* Console.withGroup({ label: 'Errors' }, Effect.gen(function* () {
          for (const error of errors) {
            yield* Console.error(error)
          }
        }))
      }
    }))
  })

const transformContent = (content: string): Effect.Effect<string> =>
  Effect.succeed(content.toUpperCase()) // Simple transformation
```

### Example 2: Development Server with Request Logging

```typescript
import { Console, Effect, Layer } from "effect"

interface RequestInfo {
  method: string
  url: string
  timestamp: Date
  userAgent?: string
}

interface ResponseInfo {
  status: number
  duration: number
  size: number
}

const createRequestLogger = () => {
  const logRequest = (request: RequestInfo) =>
    Effect.gen(function* () {
      const timestamp = request.timestamp.toISOString()
      yield* Console.log(`${timestamp} ${request.method} ${request.url}`)
      
      if (request.userAgent) {
        yield* Console.debug('User-Agent:', request.userAgent)
      }
    })
  
  const logResponse = (request: RequestInfo, response: ResponseInfo) =>
    Effect.gen(function* () {
      const statusColor = response.status >= 400 ? '🔴' : response.status >= 300 ? '🟡' : '🟢'
      
      yield* Console.withGroup({ 
        label: `${statusColor} ${request.method} ${request.url} - ${response.status}` 
      }, Effect.gen(function* () {
        yield* Console.log(`Duration: ${response.duration}ms`)
        yield* Console.log(`Response Size: ${response.size} bytes`)
        
        if (response.status >= 400) {
          yield* Console.error('Request failed with error status')
        } else if (response.duration > 1000) {
          yield* Console.warn('Slow response detected')
        }
      }))
    })
  
  const logDailyStats = (stats: { requests: number, errors: number, avgDuration: number }) =>
    Effect.gen(function* () {
      yield* Console.log('\n=== Daily Server Statistics ===')
      yield* Console.table([
        { Metric: 'Total Requests', Value: stats.requests },
        { Metric: 'Error Rate', Value: `${(stats.errors / stats.requests * 100).toFixed(2)}%` },
        { Metric: 'Avg Duration', Value: `${stats.avgDuration.toFixed(2)}ms` }
      ])
    })
  
  return { logRequest, logResponse, logDailyStats }
}

// Usage in Express-like server
const handleRequest = (req: RequestInfo) =>
  Effect.gen(function* () {
    const logger = yield* Effect.succeed(createRequestLogger())
    
    yield* Console.withTime(`request-${req.url}`, Effect.gen(function* () {
      yield* logger.logRequest(req)
      
      // Simulate request processing
      const response = yield* processRequest(req)
      
      yield* logger.logResponse(req, response)
      return response
    }))
  })

const processRequest = (req: RequestInfo): Effect.Effect<ResponseInfo> =>
  Effect.succeed({
    status: 200,
    duration: Math.random() * 500 + 100,
    size: Math.floor(Math.random() * 10000) + 1000
  })
```

### Example 3: Data Pipeline with Debug Tracing

```typescript
import { Console, Effect, Array as Arr, pipe } from "effect"

interface DataRecord {
  id: string
  timestamp: Date
  value: number
  category: string
}

interface ProcessingStats {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  categories: Record<string, number>
}

const createDataPipeline = () => {
  const validateRecord = (record: DataRecord): Effect.Effect<DataRecord, string> =>
    Effect.gen(function* () {
      yield* Console.debug(`Validating record ${record.id}`)
      
      if (record.value < 0) {
        yield* Console.warn(`Invalid negative value in record ${record.id}: ${record.value}`)
        return yield* Effect.fail(`Invalid value: ${record.value}`)
      }
      
      if (!record.category.trim()) {
        yield* Console.warn(`Missing category in record ${record.id}`)
        return yield* Effect.fail('Missing category')
      }
      
      yield* Console.debug(`Record ${record.id} validation passed`)
      return record
    })
  
  const transformRecord = (record: DataRecord): Effect.Effect<DataRecord> =>
    Effect.gen(function* () {
      yield* Console.debug(`Transforming record ${record.id}`)
      
      const transformed = {
        ...record,
        value: Math.round(record.value * 100) / 100, // Round to 2 decimal places
        category: record.category.toLowerCase().trim()
      }
      
      yield* Console.debug(`Record ${record.id} transformed`)
      return transformed
    })
  
  const processRecords = (records: DataRecord[]) =>
    Effect.gen(function* () {
      yield* Console.log(`Starting pipeline with ${records.length} records`)
      
      const stats: ProcessingStats = {
        totalRecords: records.length,
        validRecords: 0,
        invalidRecords: 0,
        categories: {}
      }
      
      const validRecords: DataRecord[] = []
      
      yield* Console.withTime('data-pipeline', Effect.gen(function* () {
        yield* Console.withGroup({ label: 'Validation Phase' }, Effect.gen(function* () {
          for (const record of records) {
            const result = yield* validateRecord(record).pipe(
              Effect.either
            )
            
            if (result._tag === 'Right') {
              const transformedRecord = yield* transformRecord(result.right)
              validRecords.push(transformedRecord)
              stats.validRecords++
              
              // Update category stats
              const category = transformedRecord.category
              stats.categories[category] = (stats.categories[category] || 0) + 1
            } else {
              stats.invalidRecords++
              yield* Console.error(`Record ${record.id} failed validation: ${result.left}`)
            }
          }
        }))
        
        // Display processing results
        yield* Console.withGroup({ label: 'Processing Results' }, Effect.gen(function* () {
          yield* Console.table([
            { Metric: 'Total Records', Value: stats.totalRecords },
            { Metric: 'Valid Records', Value: stats.validRecords },
            { Metric: 'Invalid Records', Value: stats.invalidRecords },
            { Metric: 'Success Rate', Value: `${(stats.validRecords / stats.totalRecords * 100).toFixed(1)}%` }
          ])
          
          if (Object.keys(stats.categories).length > 0) {
            yield* Console.log('\nCategory Distribution:')
            const categoryTable = Object.entries(stats.categories).map(([category, count]) => ({
              Category: category,
              Count: count,
              Percentage: `${(count / stats.validRecords * 100).toFixed(1)}%`
            }))
            yield* Console.table(categoryTable)
          }
        }))
      }))
      
      return { validRecords, stats }
    })
  
  return { processRecords }
}

// Usage example
const runDataPipeline = Effect.gen(function* () {
  const pipeline = createDataPipeline()
  
  const sampleData: DataRecord[] = [
    { id: '1', timestamp: new Date(), value: 42.567, category: '  Electronics  ' },
    { id: '2', timestamp: new Date(), value: -15.2, category: 'Books' }, // Invalid
    { id: '3', timestamp: new Date(), value: 89.123, category: 'clothing' },
    { id: '4', timestamp: new Date(), value: 23.45, category: '' } // Invalid
  ]
  
  const result = yield* pipeline.processRecords(sampleData)
  yield* Console.log(`Pipeline completed. Processed ${result.validRecords.length} valid records.`)
  
  return result
})
```

## Advanced Features Deep Dive

### Advanced Feature 1: Custom Console Implementations

Effect's Console can be completely customized to redirect output to files, databases, or external logging services:

#### Basic Custom Console

```typescript
import { Console, Effect, Layer } from "effect"

interface LogEntry {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug'
  message: string
  args: unknown[]
  timestamp: Date
}

const createFileConsole = (filePath: string) => {
  const logEntries: LogEntry[] = []
  
  const writeToFile = (entry: LogEntry) =>
    Effect.promise(async () => {
      const logLine = `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()}: ${entry.message} ${
        entry.args.length > 0 ? JSON.stringify(entry.args) : ''
      }\n`
      
      await import('node:fs/promises').then(fs => 
        fs.appendFile(filePath, logLine, 'utf-8')
      )
    })
  
  const fileConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    
    log: (...args: unknown[]) => {
      const entry: LogEntry = {
        level: 'log',
        message: String(args[0] || ''),
        args: args.slice(1),
        timestamp: new Date()
      }
      logEntries.push(entry)
      return writeToFile(entry)
    },
    
    info: (...args: unknown[]) => {
      const entry: LogEntry = {
        level: 'info',
        message: String(args[0] || ''),
        args: args.slice(1),
        timestamp: new Date()
      }
      logEntries.push(entry)
      return writeToFile(entry)
    },
    
    warn: (...args: unknown[]) => {
      const entry: LogEntry = {
        level: 'warn',
        message: String(args[0] || ''),
        args: args.slice(1),
        timestamp: new Date()
      }
      logEntries.push(entry)
      return writeToFile(entry)
    },
    
    error: (...args: unknown[]) => {
      const entry: LogEntry = {
        level: 'error',
        message: String(args[0] || ''),
        args: args.slice(1),
        timestamp: new Date()
      }
      logEntries.push(entry)
      return writeToFile(entry)
    },
    
    debug: (...args: unknown[]) => {
      const entry: LogEntry = {
        level: 'debug',
        message: String(args[0] || ''),
        args: args.slice(1),
        timestamp: new Date()
      }
      logEntries.push(entry)
      return writeToFile(entry)
    },
    
    // Implement other methods with similar pattern
    assert: (condition: boolean, ...args: unknown[]) =>
      condition ? Effect.void : writeToFile({
        level: 'error',
        message: 'Assertion failed',
        args,
        timestamp: new Date()
      }),
    
    clear: Effect.promise(() => import('node:fs/promises').then(fs => fs.writeFile(filePath, '', 'utf-8'))),
    
    table: (data: unknown, properties?: string[]) => {
      const entry: LogEntry = {
        level: 'log',
        message: 'Table data',
        args: [{ data, properties }],
        timestamp: new Date()
      }
      return writeToFile(entry)
    },
    
    // Simple implementations for other methods
    count: (label?: string) => Effect.sync(() => {}),
    countReset: (label?: string) => Effect.sync(() => {}),
    dir: (item: unknown) => Effect.sync(() => {}),
    dirxml: (...args: unknown[]) => Effect.sync(() => {}),
    group: () => Effect.sync(() => {}),
    groupEnd: Effect.sync(() => {}),
    time: (label?: string) => Effect.sync(() => {}),
    timeEnd: (label?: string) => Effect.sync(() => {}),
    timeLog: (label?: string, ...args: unknown[]) => Effect.sync(() => {}),
    trace: (...args: unknown[]) => Effect.sync(() => {}),
    
    unsafe: console // Fallback to default console for unsafe operations
  }
  
  return { fileConsole, getEntries: () => logEntries }
}

// Usage
const useFileConsole = Effect.gen(function* () {
  const { fileConsole } = createFileConsole('./app.log')
  
  const program = Effect.gen(function* () {
    yield* Console.log('Application started')
    yield* Console.info('Configuration loaded')
    yield* Console.warn('Development mode enabled')
  })
  
  yield* program.pipe(
    Effect.provide(Layer.succeed(Console.Console, fileConsole))
  )
})
```

#### Advanced Custom Console with Structured Logging

```typescript
import { Console, Effect, Layer } from "effect"

interface StructuredLogEntry {
  timestamp: string
  level: string
  message: string
  metadata: Record<string, unknown>
  source?: string
  traceId?: string
}

const createStructuredConsole = (options: {
  format: 'json' | 'pretty'
  includeStackTrace?: boolean
  minLevel?: 'debug' | 'info' | 'warn' | 'error'
}) => {
  const logLevels = { debug: 0, info: 1, warn: 2, error: 3 }
  const minLevelNum = logLevels[options.minLevel || 'debug']
  
  const formatEntry = (entry: StructuredLogEntry): string => {
    if (options.format === 'json') {
      return JSON.stringify(entry)
    } else {
      const { timestamp, level, message, metadata } = entry
      const metaStr = Object.keys(metadata).length > 0 ? 
        ` | ${JSON.stringify(metadata)}` : ''
      return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`
    }
  }
  
  const createLogEntry = (
    level: string,
    message: string,
    args: unknown[]
  ): StructuredLogEntry => ({
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata: args.length > 0 ? { args } : {},
    source: options.includeStackTrace ? new Error().stack?.split('\n')[3] : undefined,
    traceId: generateTraceId() // Implement trace ID generation
  })
  
  const shouldLog = (level: string): boolean => {
    return logLevels[level as keyof typeof logLevels] >= minLevelNum
  }
  
  const writeLog = (entry: StructuredLogEntry) => 
    Effect.sync(() => {
      if (shouldLog(entry.level)) {
        console.log(formatEntry(entry))
      }
    })
  
  const structuredConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    
    log: (...args: unknown[]) => {
      const entry = createLogEntry('info', String(args[0] || ''), args.slice(1))
      return writeLog(entry)
    },
    
    info: (...args: unknown[]) => {
      const entry = createLogEntry('info', String(args[0] || ''), args.slice(1))
      return writeLog(entry)
    },
    
    warn: (...args: unknown[]) => {
      const entry = createLogEntry('warn', String(args[0] || ''), args.slice(1))
      return writeLog(entry)
    },
    
    error: (...args: unknown[]) => {
      const entry = createLogEntry('error', String(args[0] || ''), args.slice(1))
      return writeLog(entry)
    },
    
    debug: (...args: unknown[]) => {
      const entry = createLogEntry('debug', String(args[0] || ''), args.slice(1))
      return writeLog(entry)
    },
    
    // Implement other methods...
    assert: (condition: boolean, ...args: unknown[]) =>
      condition ? Effect.void : 
      writeLog(createLogEntry('error', 'Assertion failed', args)),
    
    clear: Effect.sync(() => console.clear()),
    
    table: (data: unknown, properties?: string[]) =>
      writeLog(createLogEntry('info', 'Table data', [{ data, properties }])),
    
    // Other methods with structured logging...
    count: (label?: string) => Effect.sync(() => {}),
    countReset: (label?: string) => Effect.sync(() => {}),
    dir: (item: unknown) => Effect.sync(() => {}),
    dirxml: (...args: unknown[]) => Effect.sync(() => {}),
    group: () => Effect.sync(() => {}),
    groupEnd: Effect.sync(() => {}),
    time: (label?: string) => Effect.sync(() => {}),
    timeEnd: (label?: string) => Effect.sync(() => {}),
    timeLog: (label?: string, ...args: unknown[]) => Effect.sync(() => {}),
    trace: (...args: unknown[]) => Effect.sync(() => {}),
    
    unsafe: console
  }
  
  return structuredConsole
}

const generateTraceId = (): string => 
  Math.random().toString(36).substring(2, 15)

// Usage example
const useStructuredConsole = Effect.gen(function* () {
  const structuredConsole = createStructuredConsole({
    format: 'json',
    includeStackTrace: true,
    minLevel: 'info'
  })
  
  const program = Effect.gen(function* () {
    yield* Console.debug('This will not appear (below minLevel)')
    yield* Console.info('Application started', { version: '1.0.0' })
    yield* Console.warn('Configuration missing', { key: 'database.url' })
    yield* Console.error('Connection failed', { attempts: 3, timeout: 5000 })
  })
  
  yield* program.pipe(
    Effect.provide(Layer.succeed(Console.Console, structuredConsole))
  )
})
```

### Advanced Feature 2: Console Testing Utilities

Creating robust testing utilities for console operations:

```typescript
import { Console, Effect, Layer, Ref } from "effect"

interface ConsoleCapture {
  logs: string[]
  errors: string[]
  warnings: string[]
  infos: string[]
  debugs: string[]
  tables: unknown[]
  groups: Array<{ label?: string, collapsed?: boolean }>
  assertions: Array<{ condition: boolean, args: unknown[] }>
  timers: Record<string, { started: number, ended?: number }>
}

const createTestConsole = () => Effect.gen(function* () {
  const captureRef = yield* Ref.make<ConsoleCapture>({
    logs: [],
    errors: [],
    warnings: [],
    infos: [],
    debugs: [],
    tables: [],
    groups: [],
    assertions: [],
    timers: {}
  })
  
  const addLog = (type: keyof ConsoleCapture, value: unknown) =>
    Ref.update(captureRef, capture => ({
      ...capture,
      [type]: [...(capture[type] as unknown[]), value]
    }))
  
  const testConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    
    log: (...args: unknown[]) => addLog('logs', args.join(' ')),
    info: (...args: unknown[]) => addLog('infos', args.join(' ')),
    warn: (...args: unknown[]) => addLog('warnings', args.join(' ')),
    error: (...args: unknown[]) => addLog('errors', args.join(' ')),
    debug: (...args: unknown[]) => addLog('debugs', args.join(' ')),
    
    table: (data: unknown, properties?: string[]) =>
      addLog('tables', { data, properties }),
    
    assert: (condition: boolean, ...args: unknown[]) =>
      addLog('assertions', { condition, args }),
    
    group: (options?: { label?: string, collapsed?: boolean }) =>
      addLog('groups', options || {}),
    
    time: (label?: string) => Effect.gen(function* () {
      const capture = yield* Ref.get(captureRef)
      const timerKey = label || 'default'
      yield* Ref.set(captureRef, {
        ...capture,
        timers: {
          ...capture.timers,
          [timerKey]: { started: Date.now() }
        }
      })
    }),
    
    timeEnd: (label?: string) => Effect.gen(function* () {
      const capture = yield* Ref.get(captureRef)
      const timerKey = label || 'default'
      const timer = capture.timers[timerKey]
      if (timer) {
        yield* Ref.set(captureRef, {
          ...capture,
          timers: {
            ...capture.timers,
            [timerKey]: { ...timer, ended: Date.now() }
          }
        })
      }
    }),
    
    // Stub implementations for other methods
    clear: Effect.void,
    count: () => Effect.void,
    countReset: () => Effect.void,
    dir: () => Effect.void,
    dirxml: () => Effect.void,
    groupEnd: Effect.void,
    timeLog: () => Effect.void,
    trace: () => Effect.void,
    
    unsafe: console
  }
  
  const getCapture = () => Ref.get(captureRef)
  const resetCapture = () => Ref.set(captureRef, {
    logs: [],
    errors: [],
    warnings: [],
    infos: [],
    debugs: [],
    tables: [],
    groups: [],
    assertions: [],
    timers: {}
  })
  
  return { testConsole, getCapture, resetCapture }
})

// Test helper functions
const expectConsoleOutput = (capture: ConsoleCapture) => ({
  toHaveLogged: (message: string) => {
    const found = capture.logs.some(log => log.includes(message))
    if (!found) {
      throw new Error(`Expected console to have logged "${message}", but it was not found in: ${JSON.stringify(capture.logs)}`)
    }
  },
  
  toHaveErrored: (message: string) => {
    const found = capture.errors.some(error => error.includes(message))
    if (!found) {
      throw new Error(`Expected console to have errored "${message}", but it was not found in: ${JSON.stringify(capture.errors)}`)
    }
  },
  
  toHaveWarned: (message: string) => {
    const found = capture.warnings.some(warning => warning.includes(message))
    if (!found) {
      throw new Error(`Expected console to have warned "${message}", but it was not found in: ${JSON.stringify(capture.warnings)}`)
    }
  },
  
  toHaveTableData: (expectedData: unknown) => {
    const found = capture.tables.some(table => 
      JSON.stringify(table) === JSON.stringify({ data: expectedData, properties: undefined })
    )
    if (!found) {
      throw new Error(`Expected console to have table data ${JSON.stringify(expectedData)}, but it was not found`)
    }
  },
  
  toHaveTimedOperation: (label: string, minDuration?: number) => {
    const timer = capture.timers[label]
    if (!timer) {
      throw new Error(`Expected timer "${label}" to exist`)
    }
    if (!timer.ended) {
      throw new Error(`Expected timer "${label}" to have ended`)
    }
    if (minDuration && (timer.ended - timer.started) < minDuration) {
      throw new Error(`Expected timer "${label}" to have duration >= ${minDuration}ms, but was ${timer.ended - timer.started}ms`)
    }
  }
})

// Usage in tests
const testConsoleOperations = Effect.gen(function* () {
  const { testConsole, getCapture } = yield* createTestConsole()
  
  // Run the program under test
  const program = Effect.gen(function* () {
    yield* Console.log('Starting application')
    yield* Console.warn('Development mode enabled')
    yield* Console.table([{ id: 1, name: 'Test' }])
    yield* Console.withTime('operation', Effect.gen(function* () {
      yield* Effect.sleep('100 millis')
      yield* Console.debug('Operation in progress')
    }))
  })
  
  yield* program.pipe(
    Effect.provide(Layer.succeed(Console.Console, testConsole))
  )
  
  // Verify the output
  const capture = yield* getCapture()
  const assertions = expectConsoleOutput(capture)
  
  // Verify logs
  assertions.toHaveLogged('Starting application')
  assertions.toHaveWarned('Development mode enabled')
  assertions.toHaveTableData([{ id: 1, name: 'Test' }])
  assertions.toHaveTimedOperation('operation', 100)
  
  return capture
})
```

### Advanced Feature 3: Resource Management and Scoped Operations

Console operations with automatic resource management:

```typescript
import { Console, Effect, Scope } from "effect"

const createConsoleGroupManager = () => {
  const withNestedGroups = <A, E, R>(
    groups: Array<{ label: string, collapsed?: boolean }>,
    operation: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R | Scope.Scope> => {
    if (groups.length === 0) {
      return operation
    }
    
    const [firstGroup, ...restGroups] = groups
    
    return Console.withGroup(firstGroup, 
      withNestedGroups(restGroups, operation)
    )
  }
  
  const withTimedGroup = <A, E, R>(
    label: string,
    operation: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R | Scope.Scope> =>
    Console.withTime(label,
      Console.withGroup({ label }, operation)
    )
  
  const withProgressGroup = <A, E, R>(
    label: string,
    totalSteps: number,
    operation: (updateProgress: (step: number, message?: string) => Effect.Effect<void>) => Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R | Scope.Scope> => {
    const updateProgress = (step: number, message?: string) =>
      Console.log(`[${step}/${totalSteps}] ${message || 'Step completed'}`)
    
    return Console.withGroup({ label: `${label} (0/${totalSteps})` },
      operation(updateProgress)
    )
  }
  
  return { withNestedGroups, withTimedGroup, withProgressGroup }
}

// Usage example
const demonstrateResourceManagement = Effect.gen(function* () {
  const groupManager = createConsoleGroupManager()
  
  // Nested groups with automatic cleanup
  yield* groupManager.withNestedGroups([
    { label: 'Application Startup' },
    { label: 'Configuration Loading' },
    { label: 'Database Connection' }
  ], Effect.gen(function* () {
    yield* Console.log('Connecting to database...')
    yield* Effect.sleep('500 millis')
    yield* Console.log('Database connected successfully')
  }))
  
  // Timed group operations
  yield* groupManager.withTimedGroup('Data Processing', Effect.gen(function* () {
    yield* Console.log('Loading data from file')
    yield* Effect.sleep('200 millis')
    yield* Console.log('Processing records')
    yield* Effect.sleep('300 millis')
    yield* Console.log('Data processing completed')
  }))
  
  // Progress tracking
  yield* groupManager.withProgressGroup('File Processing', 5, (updateProgress) =>
    Effect.gen(function* () {
      for (let i = 1; i <= 5; i++) {
        yield* updateProgress(i, `Processing file ${i}`)
        yield* Effect.sleep('100 millis')
      }
    })
  )
})
```

## Practical Patterns & Best Practices

### Pattern 1: Environment-Aware Console Configuration

```typescript
import { Console, Effect, Layer, Config } from "effect"

interface ConsoleConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  format: 'simple' | 'json' | 'structured'
  destination: 'console' | 'file' | 'syslog'
  colors: boolean
}

const createEnvironmentConsole = (config: ConsoleConfig) => {
  const shouldLog = (level: string): boolean => {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    return levels[level as keyof typeof levels] >= levels[config.level]
  }
  
  const formatMessage = (level: string, message: string, args: unknown[]): string => {
    const timestamp = new Date().toISOString()
    
    switch (config.format) {
      case 'json':
        return JSON.stringify({ timestamp, level, message, args })
      case 'structured':
        return `${timestamp} [${level.toUpperCase()}] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`
      default:
        return `${message} ${args.join(' ')}`
    }
  }
  
  const addColors = (level: string, message: string): string => {
    if (!config.colors) return message
    
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m'
    }
    
    return `${colors[level as keyof typeof colors] || ''}${message}${colors.reset}`
  }
  
  const logToDestination = (formattedMessage: string) => {
    switch (config.destination) {
      case 'console':
        return Effect.sync(() => console.log(formattedMessage))
      case 'file':
        return Effect.promise(() => 
          import('node:fs/promises').then(fs => 
            fs.appendFile('./app.log', formattedMessage + '\n', 'utf-8')
          )
        )
      case 'syslog':
        // Implement syslog integration
        return Effect.sync(() => {})
      default:
        return Effect.sync(() => console.log(formattedMessage))
    }
  }
  
  const createLogFunction = (level: string) => 
    (...args: unknown[]) => {
      if (!shouldLog(level)) return Effect.void
      
      const message = String(args[0] || '')
      const formatted = formatMessage(level, message, args.slice(1))
      const colored = addColors(level, formatted)
      
      return logToDestination(colored)
    }
  
  // Implementation would continue for all console methods...
  return {
    log: createLogFunction('info'),
    info: createLogFunction('info'),
    warn: createLogFunction('warn'),
    error: createLogFunction('error'),
    debug: createLogFunction('debug'),
    // ... other methods
  }
}

// Configuration from environment
const consoleConfigLayer = Layer.effect(
  Config.Config,
  Effect.gen(function* () {
    const level = yield* Config.string('LOG_LEVEL').pipe(
      Config.withDefault('info' as const)
    )
    const format = yield* Config.string('LOG_FORMAT').pipe(
      Config.withDefault('simple' as const)
    )
    const destination = yield* Config.string('LOG_DESTINATION').pipe(
      Config.withDefault('console' as const)
    )
    const colors = yield* Config.boolean('LOG_COLORS').pipe(
      Config.withDefault(true)
    )
    
    return { level, format, destination, colors } as ConsoleConfig
  })
)
```

### Pattern 2: Console Middleware and Decorators

```typescript
import { Console, Effect, Layer } from "effect"

const createConsoleMiddleware = () => {
  const withTimestamp = <C extends Console.Console>(console: C): C => ({
    ...console,
    log: (...args: unknown[]) => 
      console.log(`[${new Date().toISOString()}]`, ...args),
    info: (...args: unknown[]) => 
      console.info(`[${new Date().toISOString()}]`, ...args),
    warn: (...args: unknown[]) => 
      console.warn(`[${new Date().toISOString()}]`, ...args),
    error: (...args: unknown[]) => 
      console.error(`[${new Date().toISOString()}]`, ...args),
    debug: (...args: unknown[]) => 
      console.debug(`[${new Date().toISOString()}]`, ...args)
  })
  
  const withPrefix = <C extends Console.Console>(prefix: string) => 
    (console: C): C => ({
      ...console,
      log: (...args: unknown[]) => 
        console.log(`[${prefix}]`, ...args),
      info: (...args: unknown[]) => 
        console.info(`[${prefix}]`, ...args),
      warn: (...args: unknown[]) => 
        console.warn(`[${prefix}]`, ...args),
      error: (...args: unknown[]) => 
        console.error(`[${prefix}]`, ...args),
      debug: (...args: unknown[]) => 
        console.debug(`[${prefix}]`, ...args)
    })
  
  const withRateLimiting = <C extends Console.Console>(
    maxLogsPerSecond: number
  ) => (console: C): C => {
    let logCount = 0
    let lastReset = Date.now()
    
    const checkRateLimit = () => {
      const now = Date.now()
      if (now - lastReset >= 1000) {
        logCount = 0
        lastReset = now
      }
      
      if (logCount >= maxLogsPerSecond) {
        return false
      }
      
      logCount++
      return true
    }
    
    return {
      ...console,
      log: (...args: unknown[]) => 
        checkRateLimit() ? console.log(...args) : Effect.void,
      info: (...args: unknown[]) => 
        checkRateLimit() ? console.info(...args) : Effect.void,
      warn: (...args: unknown[]) => 
        checkRateLimit() ? console.warn(...args) : Effect.void,
      error: (...args: unknown[]) => 
        checkRateLimit() ? console.error(...args) : Effect.void,
      debug: (...args: unknown[]) => 
        checkRateLimit() ? console.debug(...args) : Effect.void
    }
  }
  
  // Composition function
  const compose = <T>(...fns: Array<(x: T) => T>) => 
    (x: T) => fns.reduce((acc, fn) => fn(acc), x)
  
  return { withTimestamp, withPrefix, withRateLimiting, compose }
}

// Usage
const createEnhancedConsole = Effect.gen(function* () {
  const middleware = createConsoleMiddleware()
  const baseConsole = yield* Console.Console
  
  const enhancedConsole = middleware.compose(
    middleware.withTimestamp,
    middleware.withPrefix('APP'),
    middleware.withRateLimiting(10)
  )(baseConsole)
  
  return enhancedConsole
})
```

### Pattern 3: Console Testing Patterns

```typescript
import { Console, Effect, Layer, Ref, Array as Arr } from "effect"

// Comprehensive testing utilities
const createConsoleTestSuite = () => {
  interface TestConsoleOutput {
    type: 'log' | 'info' | 'warn' | 'error' | 'debug' | 'table' | 'group' | 'time'
    args: unknown[]
    timestamp: number
    metadata?: Record<string, unknown>
  }
  
  const createTestConsole = () => Effect.gen(function* () {
    const outputRef = yield* Ref.make<TestConsoleOutput[]>([])
    
    const addOutput = (type: TestConsoleOutput['type'], args: unknown[], metadata?: Record<string, unknown>) =>
      Ref.update(outputRef, outputs => [
        ...outputs,
        { type, args, timestamp: Date.now(), metadata }
      ])
    
    const testConsole: Console.Console = {
      [Console.TypeId]: Console.TypeId,
      
      log: (...args: unknown[]) => addOutput('log', args),
      info: (...args: unknown[]) => addOutput('info', args),
      warn: (...args: unknown[]) => addOutput('warn', args),
      error: (...args: unknown[]) => addOutput('error', args),
      debug: (...args: unknown[]) => addOutput('debug', args),
      table: (data: unknown, properties?: string[]) => 
        addOutput('table', [data], { properties }),
      
      group: (options?: { label?: string, collapsed?: boolean }) =>
        addOutput('group', [], { label: options?.label, collapsed: options?.collapsed }),
      
      time: (label?: string) => 
        addOutput('time', [], { label, action: 'start' }),
      
      timeEnd: (label?: string) => 
        addOutput('time', [], { label, action: 'end' }),
      
      // Stub implementations for other methods
      assert: () => Effect.void,
      clear: Effect.void,
      count: () => Effect.void,
      countReset: () => Effect.void,
      dir: () => Effect.void,
      dirxml: () => Effect.void,
      groupEnd: Effect.void,
      timeLog: () => Effect.void,
      trace: () => Effect.void,
      
      unsafe: console
    }
    
    const getOutputs = () => Ref.get(outputRef)
    const clearOutputs = () => Ref.set(outputRef, [])
    
    return { testConsole, getOutputs, clearOutputs }
  })
  
  // Test matchers
  const createMatchers = (outputs: TestConsoleOutput[]) => ({
    toHaveLogged: (message: string | RegExp) => {
      const found = outputs.some(output => 
        output.type === 'log' && 
        output.args.some(arg => 
          typeof message === 'string' ? 
            String(arg).includes(message) : 
            message.test(String(arg))
        )
      )
      if (!found) {
        throw new Error(`Expected console to have logged "${message}"`)
      }
    },
    
    toHaveLoggedTimes: (count: number) => {
      const logCount = outputs.filter(output => output.type === 'log').length
      if (logCount !== count) {
        throw new Error(`Expected ${count} log entries, but found ${logCount}`)
      }
    },
    
    toHaveLoggedInOrder: (messages: string[]) => {
      const logMessages = outputs
        .filter(output => output.type === 'log')
        .map(output => output.args.join(' '))
      
      let messageIndex = 0
      for (const logMessage of logMessages) {
        if (messageIndex < messages.length && logMessage.includes(messages[messageIndex])) {
          messageIndex++
        }
      }
      
      if (messageIndex !== messages.length) {
        throw new Error(`Expected messages in order: ${JSON.stringify(messages)}, but got: ${JSON.stringify(logMessages)}`)
      }
    },
    
    toHaveTableWithData: (expectedData: unknown) => {
      const found = outputs.some(output => 
        output.type === 'table' && 
        JSON.stringify(output.args[0]) === JSON.stringify(expectedData)
      )
      if (!found) {
        throw new Error(`Expected table with data ${JSON.stringify(expectedData)}`)
      }
    },
    
    toHaveTimedOperation: (label: string) => {
      const timeOperations = outputs.filter(output => 
        output.type === 'time' && output.metadata?.label === label
      )
      const hasStart = timeOperations.some(op => op.metadata?.action === 'start')
      const hasEnd = timeOperations.some(op => op.metadata?.action === 'end')
      
      if (!hasStart || !hasEnd) {
        throw new Error(`Expected timed operation "${label}" to have both start and end`)
      }
    }
  })
  
  return { createTestConsole, createMatchers }
}

// Usage in tests
const testConsoleOperations = Effect.gen(function* () {
  const testSuite = createConsoleTestSuite()
  const { testConsole, getOutputs } = yield* testSuite.createTestConsole()
  
  // Program to test
  const program = Effect.gen(function* () {
    yield* Console.log('Application started')
    yield* Console.info('Configuration loaded')
    yield* Console.warn('Development mode')
    yield* Console.table([{ id: 1, name: 'Test' }])
    yield* Console.withTime('operation', Effect.gen(function* () {
      yield* Console.debug('Working...')
      yield* Effect.sleep('100 millis')
    }))
  })
  
  // Run with test console
  yield* program.pipe(
    Effect.provide(Layer.succeed(Console.Console, testConsole))
  )
  
  // Verify outputs
  const outputs = yield* getOutputs()
  const matchers = testSuite.createMatchers(outputs)
  
  matchers.toHaveLogged('Application started')
  matchers.toHaveLoggedInOrder(['Application started', 'Configuration loaded', 'Development mode'])
  matchers.toHaveTableWithData([{ id: 1, name: 'Test' }])
  matchers.toHaveTimedOperation('operation')
  matchers.toHaveLoggedTimes(1) // Only one regular log
  
  return outputs
})
```

## Integration Examples

### Integration with Winston Logger

```typescript
import { Console, Effect, Layer } from "effect"
import winston from "winston"

const createWinstonConsole = (logger: winston.Logger) => {
  const winstonConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    
    log: (...args: unknown[]) => 
      Effect.sync(() => logger.info(args.join(' '))),
    
    info: (...args: unknown[]) => 
      Effect.sync(() => logger.info(args.join(' '))),
    
    warn: (...args: unknown[]) => 
      Effect.sync(() => logger.warn(args.join(' '))),
    
    error: (...args: unknown[]) => 
      Effect.sync(() => logger.error(args.join(' '))),
    
    debug: (...args: unknown[]) => 
      Effect.sync(() => logger.debug(args.join(' '))),
    
    table: (data: unknown, properties?: string[]) => 
      Effect.sync(() => logger.info('Table data:', { data, properties })),
    
    // Implement other methods with appropriate Winston calls
    assert: (condition: boolean, ...args: unknown[]) =>
      condition ? Effect.void : 
      Effect.sync(() => logger.error('Assertion failed:', args.join(' '))),
    
    clear: Effect.sync(() => logger.info('Console cleared')),
    count: (label?: string) => Effect.sync(() => logger.debug(`Count: ${label}`)),
    countReset: (label?: string) => Effect.sync(() => logger.debug(`Count reset: ${label}`)),
    dir: (item: unknown) => Effect.sync(() => logger.info('Dir:', item)),
    dirxml: (...args: unknown[]) => Effect.sync(() => logger.info('DirXML:', args)),
    group: () => Effect.sync(() => logger.info('Group started')),
    groupEnd: Effect.sync(() => logger.info('Group ended')),
    time: (label?: string) => Effect.sync(() => logger.debug(`Timer started: ${label}`)),
    timeEnd: (label?: string) => Effect.sync(() => logger.debug(`Timer ended: ${label}`)),
    timeLog: (label?: string, ...args: unknown[]) => 
      Effect.sync(() => logger.debug(`Timer log ${label}:`, args)),
    trace: (...args: unknown[]) => Effect.sync(() => logger.debug('Trace:', args)),
    
    unsafe: console
  }
  
  return winstonConsole
}

// Usage
const winstonIntegration = Effect.gen(function* () {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  })
  
  const winstonConsole = createWinstonConsole(logger)
  
  const program = Effect.gen(function* () {
    yield* Console.log('Application started with Winston')
    yield* Console.error('This will go to error.log')
    yield* Console.info('This will go to combined.log')
  })
  
  yield* program.pipe(
    Effect.provide(Layer.succeed(Console.Console, winstonConsole))
  )
})
```

### Integration with Testing Frameworks

```typescript
import { Console, Effect, Layer } from "effect"

// Jest integration
const createJestConsole = () => {
  const jestConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    
    log: (...args: unknown[]) => 
      Effect.sync(() => console.log(...args)), // Jest captures console.log
    
    info: (...args: unknown[]) => 
      Effect.sync(() => console.info(...args)),
    
    warn: (...args: unknown[]) => 
      Effect.sync(() => console.warn(...args)),
    
    error: (...args: unknown[]) => 
      Effect.sync(() => console.error(...args)),
    
    debug: (...args: unknown[]) => 
      Effect.sync(() => console.debug(...args)),
    
    table: (data: unknown, properties?: string[]) => 
      Effect.sync(() => console.table(data, properties)),
    
    // Other methods use Jest's console methods
    assert: (condition: boolean, ...args: unknown[]) => 
      Effect.sync(() => console.assert(condition, ...args)),
    
    clear: Effect.sync(() => console.clear()),
    count: (label?: string) => Effect.sync(() => console.count(label)),
    countReset: (label?: string) => Effect.sync(() => console.countReset(label)),
    dir: (item: unknown, options?: unknown) => Effect.sync(() => console.dir(item, options)),
    dirxml: (...args: unknown[]) => Effect.sync(() => console.dirxml(...args)),
    group: (options?: { label?: string, collapsed?: boolean }) => 
      options?.collapsed ? 
        Effect.sync(() => console.groupCollapsed(options.label)) :
        Effect.sync(() => console.group(options?.label)),
    groupEnd: Effect.sync(() => console.groupEnd()),
    time: (label?: string) => Effect.sync(() => console.time(label)),
    timeEnd: (label?: string) => Effect.sync(() => console.timeEnd(label)),
    timeLog: (label?: string, ...args: unknown[]) => 
      Effect.sync(() => console.timeLog(label, ...args)),
    trace: (...args: unknown[]) => Effect.sync(() => console.trace(...args)),
    
    unsafe: console
  }
  
  return jestConsole
}

// Vitest integration with custom matchers
const createVitestConsole = () => {
  const outputs: Array<{ type: string, args: unknown[], timestamp: number }> = []
  
  const vitestConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    
    log: (...args: unknown[]) => Effect.sync(() => {
      outputs.push({ type: 'log', args, timestamp: Date.now() })
      console.log(...args)
    }),
    
    info: (...args: unknown[]) => Effect.sync(() => {
      outputs.push({ type: 'info', args, timestamp: Date.now() })
      console.info(...args)
    }),
    
    warn: (...args: unknown[]) => Effect.sync(() => {
      outputs.push({ type: 'warn', args, timestamp: Date.now() })
      console.warn(...args)
    }),
    
    error: (...args: unknown[]) => Effect.sync(() => {
      outputs.push({ type: 'error', args, timestamp: Date.now() })
      console.error(...args)
    }),
    
    debug: (...args: unknown[]) => Effect.sync(() => {
      outputs.push({ type: 'debug', args, timestamp: Date.now() })
      console.debug(...args)
    }),
    
    // Other methods...
    table: (data: unknown, properties?: string[]) => Effect.sync(() => {
      outputs.push({ type: 'table', args: [data, properties], timestamp: Date.now() })
      console.table(data, properties)
    }),
    
    // Stub implementations for other methods
    assert: (condition: boolean, ...args: unknown[]) => Effect.sync(() => console.assert(condition, ...args)),
    clear: Effect.sync(() => console.clear()),
    count: (label?: string) => Effect.sync(() => console.count(label)),
    countReset: (label?: string) => Effect.sync(() => console.countReset(label)),
    dir: (item: unknown, options?: unknown) => Effect.sync(() => console.dir(item, options)),
    dirxml: (...args: unknown[]) => Effect.sync(() => console.dirxml(...args)),
    group: (options?: { label?: string, collapsed?: boolean }) => 
      options?.collapsed ? 
        Effect.sync(() => console.groupCollapsed(options.label)) :
        Effect.sync(() => console.group(options?.label)),
    groupEnd: Effect.sync(() => console.groupEnd()),
    time: (label?: string) => Effect.sync(() => console.time(label)),
    timeEnd: (label?: string) => Effect.sync(() => console.timeEnd(label)),
    timeLog: (label?: string, ...args: unknown[]) => 
      Effect.sync(() => console.timeLog(label, ...args)),
    trace: (...args: unknown[]) => Effect.sync(() => console.trace(...args)),
    
    unsafe: console
  }
  
  return { vitestConsole, getOutputs: () => outputs, clearOutputs: () => outputs.splice(0) }
}

// Example test using the integrations
describe('Console Integration Tests', () => {
  it('should work with Jest console capture', async () => {
    const jestConsole = createJestConsole()
    
    const program = Effect.gen(function* () {
      yield* Console.log('Test message')
      yield* Console.warn('Test warning')
    })
    
    // Spy on console methods
    const logSpy = jest.spyOn(console, 'log')
    const warnSpy = jest.spyOn(console, 'warn')
    
    await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.succeed(Console.Console, jestConsole))
      )
    )
    
    expect(logSpy).toHaveBeenCalledWith('Test message')
    expect(warnSpy).toHaveBeenCalledWith('Test warning')
    
    logSpy.mockRestore()
    warnSpy.mockRestore()
  })
  
  it('should work with Vitest custom matchers', async () => {
    const { vitestConsole, getOutputs } = createVitestConsole()
    
    const program = Effect.gen(function* () {
      yield* Console.log('Test message')
      yield* Console.table([{ id: 1, name: 'Test' }])
    })
    
    await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.succeed(Console.Console, vitestConsole))
      )
    )
    
    const outputs = getOutputs()
    expect(outputs).toHaveLength(2)
    expect(outputs[0]).toMatchObject({ type: 'log', args: ['Test message'] })
    expect(outputs[1]).toMatchObject({ type: 'table', args: [[{ id: 1, name: 'Test' }], undefined] })
  })
})
```

## Conclusion

Console provides testable, mockable, and composable console operations that eliminate the problems of traditional console usage. It enables clean separation between business logic and output concerns while maintaining full type safety and Effect composability.

Key benefits:
- **Testability**: Console operations can be easily mocked and verified in tests
- **Composability**: Integrates seamlessly with Effect's resource management and error handling
- **Flexibility**: Output can be redirected to different destinations based on environment or requirements
- **Type Safety**: All console operations are type-safe Effect values that can be composed and transformed

Use Console when you need controlled, testable console output in Effect applications, particularly for CLI tools, development servers, data processing pipelines, and any application where console output needs to be verified, formatted, or redirected.