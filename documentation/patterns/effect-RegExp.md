# RegExp: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem RegExp Solves

Traditional JavaScript regex operations are error-prone, mutable, and lack functional composition. String validation, pattern matching, and text processing often result in verbose, imperative code with poor error handling:

```typescript
// Traditional approach - imperative, error-prone regex operations
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) // Mutable regex state, can cause issues
}

function extractPhoneNumbers(text: string): string[] {
  const phoneRegex = /\b\d{3}-?\d{3}-?\d{4}\b/g
  const matches = text.match(phoneRegex)
  return matches || [] // Manual null handling
}

function sanitizeInput(input: string): string {
  // Manual escaping of special characters - error-prone
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Complex pattern matching with side effects
function parseUserInput(input: string): { type: string; value: string } {
  const urlRegex = /^https?:\/\//
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\d{3}-?\d{3}-?\d{4}$/
  
  if (urlRegex.test(input)) {
    return { type: 'url', value: input }
  } else if (emailRegex.test(input)) {
    return { type: 'email', value: input }
  } else if (phoneRegex.test(input)) {
    return { type: 'phone', value: input }
  } else {
    return { type: 'text', value: input }
  }
}
```

This approach leads to:
- **Mutable State** - Regex objects with global flags maintain state between uses
- **Poor Error Handling** - `match()` returns null, requiring manual null checks
- **Unsafe String Building** - Manual escaping of special characters is error-prone
- **Imperative Logic** - Complex if/else chains for pattern matching
- **No Functional Composition** - Difficult to chain regex operations cleanly

### The RegExp Solution

Effect's RegExp module, combined with String and other Effect modules, provides type-safe, composable regex operations with functional patterns:

```typescript
import { RegExp, String, Effect, Option, Match, Array as Arr } from "effect"

// Type-safe regex validation with Effect
const validateEmail = (email: string) => Effect.gen(function* () {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = String.match(emailRegex)(email).pipe(
    Option.isSome
  )
  
  if (!isValid) {
    return yield* Effect.fail(new Error('Invalid email format'))
  }
  
  return email
})

// Functional phone number extraction
const extractPhoneNumbers = (text: string) => Effect.gen(function* () {
  const phoneRegex = /\b\d{3}-?\d{3}-?\d{4}\b/g
  const matches = String.matchAll(phoneRegex)(text)
  
  return Arr.fromIterable(matches).pipe(
    Arr.map(match => match[0])
  )
})

// Safe input sanitization
const sanitizeInput = (input: string) => Effect.succeed(
  RegExp.escape(input)
)

// Functional pattern matching with type safety
const parseUserInput = (input: string) => Effect.gen(function* () {
  const patterns = {
    url: /^https?:\/\//,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\d{3}-?\d{3}-?\d{4}$/,
  }
  
  return Match.value(input).pipe(
    Match.when(
      (str) => String.match(patterns.url)(str).pipe(Option.isSome),
      (str) => ({ type: 'url' as const, value: str })
    ),
    Match.when(
      (str) => String.match(patterns.email)(str).pipe(Option.isSome),
      (str) => ({ type: 'email' as const, value: str })
    ),
    Match.when(
      (str) => String.match(patterns.phone)(str).pipe(Option.isSome),
      (str) => ({ type: 'phone' as const, value: str })
    ),
    Match.orElse((str) => ({ type: 'text' as const, value: str }))
  )
})
```

### Key Concepts

**Type Safety**: Effect's RegExp functions integrate with Option types, eliminating null-related runtime errors and providing compile-time guarantees.

**Functional Composition**: All regex operations work seamlessly with Effect's pipe operator, enabling clean transformation pipelines.

**Immutable Operations**: Effect patterns ensure regex operations don't have side effects or maintain mutable state between calls.

**Pattern Escaping**: `RegExp.escape` provides safe escaping of special regex characters, preventing injection attacks and regex errors.

## Basic Usage Patterns

### Pattern 1: Type Guards and Validation

```typescript
import { RegExp, Effect } from "effect"

// Type guard for RegExp objects
const processPattern = (pattern: unknown) => Effect.gen(function* () {
  if (!RegExp.isRegExp(pattern)) {
    return yield* Effect.fail(new Error('Expected RegExp pattern'))
  }
  
  return `Pattern source: ${pattern.source}`
})

// Usage
const result1 = processPattern(/hello/g)  // Success
const result2 = processPattern("hello")   // Failure - not a RegExp
```

### Pattern 2: Safe String Escaping

```typescript
import { RegExp, Effect } from "effect"

// Escape user input for safe regex construction
const createSearchRegex = (userInput: string, flags = 'gi') => Effect.gen(function* () {
  const escaped = RegExp.escape(userInput)
  const regex = new RegExp(escaped, flags)
  
  return regex
})

// Example usage
const searchTerm = "user@domain.com"
const regexEffect = createSearchRegex(searchTerm)
// Creates: /user@domain\.com/gi (safely escaped)
```

### Pattern 3: Integration with String Operations

```typescript
import { RegExp, String, Effect, Option } from "effect"

// Combine RegExp.escape with String.match for safe pattern matching
const safeSearch = (text: string, searchTerm: string) => Effect.gen(function* () {
  const escaped = RegExp.escape(searchTerm)
  const regex = new RegExp(escaped, 'gi')
  
  return String.match(regex)(text).pipe(
    Option.map(matches => matches.length > 0)
  )
})

// Usage
const hasMatch = safeSearch("Contact us at help@company.com", "@company.com")
// Safely searches for "@company.com" without treating @ as a special character
```

## Real-World Examples

### Example 1: User Input Validation System

A comprehensive validation system for different types of user input with proper error handling and type safety.

```typescript
import { RegExp, String, Effect, Option, Match, Array as Arr } from "effect"

// Define validation patterns
const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^(\+?1-?)?(\([0-9]{3}\)|[0-9]{3})-?[0-9]{3}-?[0-9]{4}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  ssn: /^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/
} as const

// Validation errors
class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly input: string,
    public readonly expectedFormat: string
  ) {
    super(`Invalid ${field}: "${input}". Expected format: ${expectedFormat}`)
  }
}

// Create type-safe validators
const createValidator = <T extends keyof typeof ValidationPatterns>(
  type: T,
  formatDescription: string
) => (input: string) => Effect.gen(function* () {
  const pattern = ValidationPatterns[type]
  const trimmedInput = String.trim(input)
  
  if (String.isEmpty(trimmedInput)) {
    return yield* Effect.fail(
      new ValidationError(type, input, formatDescription)
    )
  }
  
  const isValid = String.match(pattern)(trimmedInput).pipe(Option.isSome)
  
  if (!isValid) {
    return yield* Effect.fail(
      new ValidationError(type, input, formatDescription)
    )
  }
  
  return trimmedInput
})

// Specific validators
const validateEmail = createValidator('email', 'user@domain.com')
const validatePhone = createValidator('phone', '(555) 123-4567 or +1-555-123-4567')
const validateUrl = createValidator('url', 'https://example.com')
const validateCreditCard = createValidator('creditCard', 'Valid credit card number')
const validateSSN = createValidator('ssn', 'XXX-XX-XXXX')

// User registration form validation
interface UserRegistration {
  email: string
  phone: string
  website?: string
}

const validateUserRegistration = (data: UserRegistration) => Effect.gen(function* () {
  const validEmail = yield* validateEmail(data.email)
  const validPhone = yield* validatePhone(data.phone)
  
  const validWebsite = data.website 
    ? yield* validateUrl(data.website)
    : undefined
  
  return {
    email: validEmail,
    phone: validPhone,
    website: validWebsite
  }
}).pipe(
  Effect.catchAll(error => 
    Effect.fail(`Registration validation failed: ${error.message}`)
  )
)

// Usage example
const registrationData = {
  email: "user@example.com",
  phone: "(555) 123-4567",
  website: "https://mywebsite.com"
}

Effect.runPromise(validateUserRegistration(registrationData))
  .then(result => console.log('Valid registration:', result))
  .catch(error => console.error('Validation error:', error))
```

### Example 2: Log Analysis and Pattern Extraction

A log analysis system that extracts different patterns from log files with error handling and metrics.

```typescript
import { RegExp, String, Effect, Option, Array as Arr, Record } from "effect"

// Log entry patterns
const LogPatterns = {
  timestamp: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  statusCode: /\s([1-5]\d{2})\s/g,
  userAgent: /User-Agent:\s*([^\r\n]*)/gi,
  errorLevel: /\b(ERROR|WARN|INFO|DEBUG)\b/gi,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
} as const

// Log analysis result types
interface LogAnalysis {
  totalLines: number
  timestamps: string[]
  ipAddresses: string[]
  statusCodes: number[]
  userAgents: string[]
  errorLevels: string[]
  emails: string[]
  urls: string[]
  errorCount: number
  warningCount: number
}

// Extract all matches for a pattern
const extractPattern = (pattern: RegExp, text: string) => Effect.gen(function* () {
  const matches = String.matchAll(pattern)(text)
  return Arr.fromIterable(matches).pipe(
    Arr.map(match => match[0])
  )
})

// Extract status codes with proper parsing
const extractStatusCodes = (text: string) => Effect.gen(function* () {
  const matches = String.matchAll(LogPatterns.statusCode)(text)
  return Arr.fromIterable(matches).pipe(
    Arr.map(match => match[1]),
    Arr.filterMap(code => {
      const parsed = parseInt(code, 10)
      return isNaN(parsed) ? Option.none() : Option.some(parsed)
    })
  )
})

// Count specific error levels
const countErrorLevel = (level: string, errorLevels: string[]): number =>
  Arr.filter(errorLevels, (l) => l.toUpperCase() === level.toUpperCase()).length

// Main log analysis function
const analyzeLogFile = (logContent: string) => Effect.gen(function* () {
  const lines = String.split('\n')(logContent)
  const totalLines = lines.length
  
  // Extract all patterns concurrently
  const timestamps = yield* extractPattern(LogPatterns.timestamp, logContent)
  const ipAddresses = yield* extractPattern(LogPatterns.ipAddress, logContent)
  const statusCodes = yield* extractStatusCodes(logContent)
  const userAgents = yield* extractPattern(LogPatterns.userAgent, logContent)
  const errorLevels = yield* extractPattern(LogPatterns.errorLevel, logContent)
  const emails = yield* extractPattern(LogPatterns.email, logContent)
  const urls = yield* extractPattern(LogPatterns.url, logContent)
  
  // Calculate metrics
  const errorCount = countErrorLevel('ERROR', errorLevels)
  const warningCount = countErrorLevel('WARN', errorLevels)
  
  return {
    totalLines,
    timestamps: Arr.dedupe(timestamps),
    ipAddresses: Arr.dedupe(ipAddresses),
    statusCodes: Arr.dedupe(statusCodes),
    userAgents: Arr.dedupe(userAgents),
    errorLevels: Arr.dedupe(errorLevels),
    emails: Arr.dedupe(emails),
    urls: Arr.dedupe(urls),
    errorCount,
    warningCount
  }
})

// Generate analysis report
const generateLogReport = (analysis: LogAnalysis) => Effect.succeed(`
Log Analysis Report
==================
Total Lines: ${analysis.totalLines}
Unique IP Addresses: ${analysis.ipAddresses.length}
Unique Status Codes: ${analysis.statusCodes.join(', ')}
Error Count: ${analysis.errorCount}
Warning Count: ${analysis.warningCount}
Unique URLs Found: ${analysis.urls.length}
Email Addresses Found: ${analysis.emails.length}

Top Status Codes:
${Arr.take(analysis.statusCodes, 5).join(', ')}

Recent Timestamps:
${Arr.take(analysis.timestamps, 3).join('\n')}
`.trim())

// Example usage
const sampleLogContent = `
2024-01-15T10:30:15.123Z INFO User login from 192.168.1.100 - Status: 200
2024-01-15T10:31:22.456Z ERROR Failed authentication for user@example.com from 10.0.0.50 - Status: 401
2024-01-15T10:32:05.789Z WARN Rate limit exceeded for https://api.example.com/users - Status: 429
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
2024-01-15T10:33:18.012Z INFO Successful API call to https://external-api.com/data - Status: 200
`

const processLogFile = Effect.gen(function* () {
  const analysis = yield* analyzeLogFile(sampleLogContent)
  const report = yield* generateLogReport(analysis)
  return report
})

Effect.runPromise(processLogFile)
  .then(report => console.log(report))
  .catch(error => console.error('Log analysis failed:', error))
```

### Example 3: Content Sanitization and Security

A security-focused text processing system that sanitizes user content and prevents regex injection attacks.

```typescript
import { RegExp, String, Effect, Option, Array as Arr, Match } from "effect"

// Security patterns for content filtering
const SecurityPatterns = {
  potentialScript: /<script[^>]*>.*?<\/script>/gi,
  htmlTags: /<[^>]+>/g,
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC)\b)/gi,
  xssAttempts: /(javascript:|vbscript:|onload=|onclick=|onerror=)/gi,
  maliciousUrls: /(data:|javascript:|vbscript:)/gi
} as const

// Content sanitization errors
class SanitizationError extends Error {
  constructor(
    public readonly issue: string,
    public readonly content: string
  ) {
    super(`Content sanitization failed: ${issue}`)
  }
}

// Safe regex pattern builder for user searches
const buildSafeSearchPattern = (
  userQuery: string,
  options: { caseSensitive?: boolean; wholeWord?: boolean } = {}
) => Effect.gen(function* () {
  if (String.isEmpty(String.trim(userQuery))) {
    return yield* Effect.fail(new Error('Search query cannot be empty'))
  }
  
  // Escape user input to prevent regex injection
  const escaped = RegExp.escape(userQuery)
  
  // Build pattern with options
  const pattern = options.wholeWord ? `\\b${escaped}\\b` : escaped
  const flags = options.caseSensitive ? 'g' : 'gi'
  
  try {
    const regex = new RegExp(pattern, flags)
    return regex
  } catch (error) {
    return yield* Effect.fail(
      new Error(`Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`)
    )
  }
})

// Content security scanner
const scanForThreats = (content: string) => Effect.gen(function* () {
  const threats: Array<{ type: string; matches: string[] }> = []
  
  // Check for script injections
  const scriptMatches = Arr.fromIterable(String.matchAll(SecurityPatterns.potentialScript)(content))
    .pipe(Arr.map(match => match[0]))
  
  if (Arr.isNonEmptyArray(scriptMatches)) {
    threats.push({ type: 'Script Injection', matches: scriptMatches })
  }
  
  // Check for SQL injection attempts
  const sqlMatches = Arr.fromIterable(String.matchAll(SecurityPatterns.sqlInjection)(content))
    .pipe(Arr.map(match => match[0]))
  
  if (Arr.isNonEmptyArray(sqlMatches)) {
    threats.push({ type: 'SQL Injection', matches: sqlMatches })
  }
  
  // Check for XSS attempts
  const xssMatches = Arr.fromIterable(String.matchAll(SecurityPatterns.xssAttempts)(content))
    .pipe(Arr.map(match => match[0]))
  
  if (Arr.isNonEmptyArray(xssMatches)) {
    threats.push({ type: 'XSS Attempt', matches: xssMatches })
  }
  
  return threats
})

// Safe content sanitizer
const sanitizeContent = (content: string, allowHtml = false) => Effect.gen(function* () {
  // First scan for threats
  const threats = yield* scanForThreats(content)
  
  if (Arr.isNonEmptyArray(threats)) {
    const threatTypes = Arr.map(threats, threat => threat.type).join(', ')
    return yield* Effect.fail(
      new SanitizationError(`Security threats detected: ${threatTypes}`, content)
    )
  }
  
  // Remove HTML tags if not allowed
  const cleaned = allowHtml 
    ? content
    : String.replaceAll(SecurityPatterns.htmlTags, '')(content)
  
  // Additional cleaning
  const sanitized = String.trim(cleaned)
  
  return sanitized
})

// Safe search functionality with user queries
const performSafeSearch = (
  searchText: string,
  userQuery: string,
  options: { caseSensitive?: boolean; wholeWord?: boolean } = {}
) => Effect.gen(function* () {
  // Build safe regex pattern
  const searchRegex = yield* buildSafeSearchPattern(userQuery, options)
  
  // Perform search
  const matches = Arr.fromIterable(String.matchAll(searchRegex)(searchText))
    .pipe(Arr.map(match => ({
      match: match[0],
      index: match.index || 0,
      context: searchText.slice(
        Math.max(0, (match.index || 0) - 20),
        (match.index || 0) + match[0].length + 20
      )
    })))
  
  return {
    query: userQuery,
    totalMatches: matches.length,
    matches: Arr.take(matches, 10) // Limit results
  }
})

// Content processing pipeline
interface ContentSubmission {
  title: string
  body: string
  searchQuery?: string
}

const processUserContent = (submission: ContentSubmission) => Effect.gen(function* () {
  // Sanitize title and body
  const cleanTitle = yield* sanitizeContent(submission.title, false)
  const cleanBody = yield* sanitizeContent(submission.body, true) // Allow some HTML
  
  // Process search query if provided
  const searchResults = submission.searchQuery
    ? yield* performSafeSearch(cleanBody, submission.searchQuery, { wholeWord: true })
    : null
  
  return {
    title: cleanTitle,
    body: cleanBody,
    searchResults,
    status: 'processed' as const
  }
}).pipe(
  Effect.catchTag('SanitizationError', error => 
    Effect.succeed({
      title: '',
      body: '',
      searchResults: null,
      status: 'rejected' as const,
      reason: error.message
    })
  )
)

// Example usage
const userSubmission = {
  title: "My Article <script>alert('xss')</script>",
  body: "This is some content with <b>bold text</b> and a search term.",
  searchQuery: "search term"
}

Effect.runPromise(processUserContent(userSubmission))
  .then(result => console.log('Processed content:', result))
  .catch(error => console.error('Processing failed:', error))
```

## Advanced Features Deep Dive

### Feature 1: Type-Safe Regex Guards

Using `RegExp.isRegExp` for robust type checking and pattern validation.

#### Basic Guard Usage

```typescript
import { RegExp, Effect } from "effect"

// Type guard with comprehensive error handling
const validateRegexInput = (input: unknown) => Effect.gen(function* () {
  if (!RegExp.isRegExp(input)) {
    return yield* Effect.fail(new Error(`Expected RegExp, got ${typeof input}`))
  }
  
  // Additional validation
  if (input.source === '') {
    return yield* Effect.fail(new Error('RegExp pattern cannot be empty'))
  }
  
  return {
    pattern: input,
    source: input.source,
    flags: input.flags,
    global: input.global,
    ignoreCase: input.ignoreCase,
    multiline: input.multiline
  }
})
```

#### Real-World Guard Example

```typescript
import { RegExp, Effect, Array as Arr } from "effect"

// Dynamic regex pattern validator for user-defined rules
interface ValidationRule {
  name: string
  pattern: unknown
  description: string
}

const processValidationRules = (rules: ValidationRule[]) => Effect.gen(function* () {
  const validatedRules: Array<{
    name: string
    pattern: globalThis.RegExp
    description: string
  }> = []
  
  for (const rule of rules) {
    const validation = yield* validateRegexInput(rule.pattern).pipe(
      Effect.catchAll(error => 
        Effect.fail(`Rule "${rule.name}": ${error.message}`)
      )
    )
    
    validatedRules.push({
      name: rule.name,
      pattern: validation.pattern,
      description: rule.description
    })
  }
  
  return validatedRules
})

// Usage
const userRules: ValidationRule[] = [
  { name: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, description: 'Email validation' },
  { name: 'phone', pattern: /^\d{10}$/, description: 'Phone number' },
  { name: 'invalid', pattern: 'not a regex', description: 'This will fail' }
]

Effect.runPromise(processValidationRules(userRules))
  .then(rules => console.log('Valid rules:', rules))
  .catch(error => console.error('Rule validation failed:', error))
```

### Feature 2: Advanced Escaping Strategies

`RegExp.escape` provides safe pattern building for dynamic regex construction.

#### Escape Pattern Building

```typescript
import { RegExp, String, Effect, Array as Arr } from "effect"

// Build complex search patterns safely
const buildMultiTermSearch = (terms: string[], options: {
  matchAll?: boolean
  caseSensitive?: boolean
  wholeWords?: boolean
} = {}) => Effect.gen(function* () {
  if (Arr.isEmptyArray(terms)) {
    return yield* Effect.fail(new Error('Search terms cannot be empty'))
  }
  
  // Escape all terms
  const escapedTerms = Arr.map(terms, RegExp.escape)
  
  // Build pattern based on options
  const termPattern = options.wholeWords 
    ? escapedTerms.map(term => `\\b${term}\\b`).join('|')
    : escapedTerms.join('|')
  
  const pattern = options.matchAll 
    ? `(?=.*\\b(${escapedTerms.join('|')})\\b).*`
    : `(${termPattern})`
  
  const flags = options.caseSensitive ? 'g' : 'gi'
  
  return new RegExp(pattern, flags)
})

// Smart quote and special character handling
const buildFlexibleSearch = (query: string) => Effect.gen(function* () {
  // Handle different quote styles
  const normalizedQuery = query
    .replace(/[""]/g, '"')  // Smart quotes to regular quotes
    .replace(/['']/g, "'")  // Smart apostrophes
  
  // Split on whitespace and escape each part
  const terms = String.split(/\s+/)(String.trim(normalizedQuery))
    .filter(String.isNonEmpty)
    .map(RegExp.escape)
  
  if (Arr.isEmptyArray(terms)) {
    return yield* Effect.fail(new Error('No valid search terms found'))
  }
  
  // Create flexible pattern that allows words in any order
  const pattern = terms.map(term => `(?=.*${term})`).join('') + '.*'
  
  return new RegExp(pattern, 'gi')
})
```

#### Advanced Escaping: User Content Filtering

```typescript
import { RegExp, String, Effect, Array as Arr, Option } from "effect"

// Safe content filtering system
const createContentFilter = (bannedWords: string[], replacementChar = '*') => Effect.gen(function* () {
  if (Arr.isEmptyArray(bannedWords)) {
    return yield* Effect.fail(new Error('Banned words list cannot be empty'))
  }
  
  // Escape and build pattern for each banned word
  const escapedWords = Arr.map(bannedWords, word => {
    const escaped = RegExp.escape(word.toLowerCase())
    // Add word boundary to avoid false positives
    return `\\b${escaped}\\b`
  })
  
  const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi')
  
  return {
    pattern,
    filter: (text: string) => {
      const replacement = replacementChar.repeat(3)
      return String.replaceAll(pattern, replacement)(text)
    },
    detect: (text: string) => {
      const matches = Arr.fromIterable(String.matchAll(pattern)(text))
      return Arr.map(matches, match => match[0].toLowerCase())
    }
  }
})

// Usage example
const bannedWords = ['spam', 'scam', 'fake!']
const filterEffect = createContentFilter(bannedWords)

Effect.runPromise(filterEffect)
  .then(filter => {
    const testText = "This is spam! Don't fall for this scam. It's totally fake!"
    console.log('Original:', testText)
    console.log('Filtered:', filter.filter(testText))
    console.log('Detected:', filter.detect(testText))
  })
```

## Practical Patterns & Best Practices

### Pattern 1: Functional Regex Composition

Create reusable regex utilities that compose well with Effect's functional patterns.

```typescript
import { RegExp, String, Effect, Option, Array as Arr } from "effect"

// Composable regex utilities
const RegexUtils = {
  // Safe pattern builder
  buildPattern: (parts: string[], flags = 'gi') => Effect.gen(function* () {
    const escapedParts = Arr.map(parts, RegExp.escape)
    const pattern = escapedParts.join('|')
    
    try {
      return new RegExp(pattern, flags)
    } catch (error) {
      return yield* Effect.fail(new Error(`Invalid pattern: ${pattern}`))
    }
  }),
  
  // Extract with context
  extractWithContext: (regex: globalThis.RegExp, text: string, contextSize = 20) => 
    Effect.succeed(
      Arr.fromIterable(String.matchAll(regex)(text)).pipe(
        Arr.map(match => ({
          match: match[0],
          index: match.index || 0,
          before: text.slice(
            Math.max(0, (match.index || 0) - contextSize),
            match.index || 0
          ),
          after: text.slice(
            (match.index || 0) + match[0].length,
            (match.index || 0) + match[0].length + contextSize
          )
        }))
      )
    ),
  
  // Count patterns
  countMatches: (regex: globalThis.RegExp, text: string) =>
    Effect.succeed(
      Arr.fromIterable(String.matchAll(regex)(text)).length
    ),
  
  // Replace with function
  replaceWithFunction: (
    regex: globalThis.RegExp,
    text: string,
    replacer: (match: string, index: number) => string
  ) => Effect.succeed(
    text.replace(regex, (match, ...args) => {
      const index = args[args.length - 2] // Second to last argument is the index
      return replacer(match, index)
    })
  )
}

// Example: Text analysis pipeline
const analyzeText = (text: string, searchTerms: string[]) => Effect.gen(function* () {
  const searchRegex = yield* RegexUtils.buildPattern(searchTerms)
  const matches = yield* RegexUtils.extractWithContext(searchRegex, text)
  const count = yield* RegexUtils.countMatches(searchRegex, text)
  
  return {
    originalText: text,
    searchTerms,
    totalMatches: count,
    matches: Arr.take(matches, 5),
    summary: `Found ${count} matches for ${searchTerms.length} search terms`
  }
})
```

### Pattern 2: Error-Safe Regex Operations

Comprehensive error handling patterns for regex operations.

```typescript
import { RegExp, String, Effect, Option, Array as Arr } from "effect"

// Custom error types
class RegexError extends Error {
  constructor(
    public readonly operation: string,
    public readonly pattern: string,
    public readonly originalError: Error
  ) {
    super(`Regex ${operation} failed for pattern "${pattern}": ${originalError.message}`)
  }
}

class PatternValidationError extends Error {
  constructor(
    public readonly pattern: string,
    public readonly reason: string
  ) {
    super(`Pattern validation failed: ${reason}`)
  }
}

// Safe regex operations
const SafeRegex = {
  // Safe regex creation with validation
  create: (pattern: string, flags?: string) => Effect.gen(function* () {
    if (String.isEmpty(String.trim(pattern))) {
      return yield* Effect.fail(
        new PatternValidationError(pattern, 'Pattern cannot be empty')
      )
    }
    
    try {
      const regex = new RegExp(pattern, flags)
      
      // Additional validation
      if (regex.source === '(?:)') {
        return yield* Effect.fail(
          new PatternValidationError(pattern, 'Pattern results in empty regex')
        )
      }
      
      return regex
    } catch (error) {
      return yield* Effect.fail(
        new RegexError('creation', pattern, error as Error)
      )
    }
  }),
  
  // Safe matching with error recovery
  safeMatch: (regex: globalThis.RegExp, text: string) => Effect.gen(function* () {
    try {
      const match = String.match(regex)(text)
      return Option.getOrElse(match, () => [] as string[])
    } catch (error) {
      return yield* Effect.fail(
        new RegexError('matching', regex.source, error as Error)
      )
    }
  }),
  
  // Safe replacement with fallback
  safeReplace: (
    regex: globalThis.RegExp,
    replacement: string,
    text: string,
    fallback?: string
  ) => Effect.gen(function* () {
    try {
      return String.replace(regex, replacement)(text)
    } catch (error) {
      if (fallback !== undefined) {
        return fallback
      }
      return yield* Effect.fail(
        new RegexError('replacement', regex.source, error as Error)
      )
    }
  })
}

// Usage with comprehensive error handling
const processUserRegexQuery = (
  pattern: string,
  text: string,
  replacement?: string
) => Effect.gen(function* () {
  const regex = yield* SafeRegex.create(pattern, 'gi').pipe(
    Effect.catchTag('PatternValidationError', error =>
      Effect.fail(`Invalid pattern: ${error.reason}`)
    ),
    Effect.catchTag('RegexError', error =>
      Effect.fail(`Regex error: ${error.message}`)
    )
  )
  
  const matches = yield* SafeRegex.safeMatch(regex, text)
  
  const result = replacement
    ? yield* SafeRegex.safeReplace(regex, replacement, text, text)
    : text
  
  return {
    pattern: regex.source,
    flags: regex.flags,
    matches,
    result,
    matchCount: matches.length
  }
}).pipe(
  Effect.catchAll(error =>
    Effect.succeed({
      pattern,
      flags: '',
      matches: [],
      result: text,
      matchCount: 0,
      error: error instanceof Error ? error.message : String(error)
    })
  )
)
```

## Integration Examples

### Integration with Schema Validation

Combining RegExp utilities with Effect Schema for comprehensive data validation.

```typescript
import { RegExp, String, Effect, Schema, Array as Arr } from "effect"

// Custom schema combinators with regex
const RegexSchema = {
  // Pattern-based string schema
  pattern: (regex: globalThis.RegExp, message?: string) =>
    Schema.String.pipe(
      Schema.filter(
        (value): value is string => 
          String.match(regex)(value).pipe(Option.isSome),
        { message: () => message || `Must match pattern: ${regex.source}` }
      )
    ),
  
  // Safe pattern builder for schemas
  safePattern: (pattern: string, flags?: string, message?: string) =>
    Schema.transform(
      Schema.String,
      Schema.String,
      {
        strict: true,
        decode: (value) => Effect.gen(function* () {
          const escaped = RegExp.escape(value)
          const regex = yield* Effect.try({
            try: () => new RegExp(pattern.replace('$INPUT', escaped), flags),
            catch: (error) => new Error(`Invalid pattern: ${error}`)
          })
          
          const isValid = String.match(regex)(value).pipe(Option.isSome)
          if (!isValid) {
            return yield* Effect.fail(
              new Error(message || `Value does not match pattern: ${pattern}`)
            )
          }
          
          return value
        }),
        encode: (value) => Effect.succeed(value)
      }
    )
}

// User profile schema with regex validation
const UserProfileSchema = Schema.Struct({
  email: RegexSchema.pattern(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Must be a valid email address'
  ),
  phone: RegexSchema.pattern(
    /^(\+?1-?)?(\([0-9]{3}\)|[0-9]{3})-?[0-9]{3}-?[0-9]{4}$/,
    'Must be a valid US phone number'
  ),
  website: Schema.optional(
    RegexSchema.pattern(
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      'Must be a valid URL'
    )
  ),
  username: RegexSchema.pattern(
    /^[a-zA-Z0-9_]{3,20}$/,
    'Username must be 3-20 characters, letters, numbers, and underscores only'
  )
})

// Usage with validation
const validateUserProfile = (data: unknown) =>
  Schema.decodeUnknown(UserProfileSchema)(data).pipe(
    Effect.catchTag('ParseError', error =>
      Effect.fail(`Validation failed: ${error.message}`)
    )
  )

// Example
const userData = {
  email: 'user@example.com',
  phone: '(555) 123-4567',
  website: 'https://mywebsite.com',
  username: 'user_123'
}

Effect.runPromise(validateUserProfile(userData))
  .then(profile => console.log('Valid profile:', profile))
  .catch(error => console.error('Validation error:', error))
```

### Integration with Stream Processing

Using RegExp with Effect Streams for processing large text files or real-time data.

```typescript
import { RegExp, String, Effect, Stream, Array as Arr, Option } from "effect"

// Stream-based regex processing utilities
const RegexStream = {
  // Find all matches in a stream of text chunks
  findMatches: (regex: globalThis.RegExp) => 
    <E, R>(stream: Stream.Stream<string, E, R>) =>
      stream.pipe(
        Stream.mapEffect(chunk => Effect.gen(function* () {
          const matches = Arr.fromIterable(String.matchAll(regex)(chunk))
          return Arr.map(matches, match => ({
            match: match[0],
            index: match.index || 0,
            groups: match.slice(1)
          }))
        })),
        Stream.flatMap(matches => Stream.fromIterable(matches))
      ),
  
  // Filter stream chunks by regex pattern
  filterByPattern: (regex: globalThis.RegExp) =>
    <E, R>(stream: Stream.Stream<string, E, R>) =>
      stream.pipe(
        Stream.filter(chunk => 
          String.match(regex)(chunk).pipe(Option.isSome)
        )
      ),
  
  // Replace patterns in stream
  replaceInStream: (regex: globalThis.RegExp, replacement: string) =>
    <E, R>(stream: Stream.Stream<string, E, R>) =>
      stream.pipe(
        Stream.map(chunk => String.replace(regex, replacement)(chunk))
      )
}

// Example: Process log files in real-time
const processLogStream = (logStream: Stream.Stream<string, never, never>) => {
  const errorPattern = /ERROR|FATAL/gi
  const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
  
  return Effect.gen(function* () {
    // Extract error lines
    const errorLines = logStream.pipe(
      RegexStream.filterByPattern(errorPattern),
      Stream.take(100) // Limit for example
    )
    
    // Extract IP addresses from all lines
    const ipAddresses = logStream.pipe(
      RegexStream.findMatches(ipPattern),
      Stream.map(match => match.match),
      Stream.runCollect
    )
    
    // Collect errors and IPs
    const errors = yield* Stream.runCollect(errorLines)
    const ips = yield* ipAddresses
    
    return {
      errorCount: errors.length,
      uniqueIPs: Arr.dedupe(ips),
      errorSample: Arr.take(errors, 5)
    }
  })
}

// Usage with file processing
const processLogFile = (filePath: string) => Effect.gen(function* () {
  // Simulate reading file as stream
  const fileContent = `
    2024-01-15T10:30:15.123Z INFO User login from 192.168.1.100
    2024-01-15T10:31:22.456Z ERROR Failed authentication from 10.0.0.50
    2024-01-15T10:32:05.789Z WARN Rate limit exceeded from 172.16.0.1
    2024-01-15T10:33:18.012Z FATAL Database connection lost from 192.168.1.100
  `
  
  const lines = String.split('\n')(fileContent).filter(String.isNonEmpty)
  const logStream = Stream.fromIterable(lines)
  
  return yield* processLogStream(logStream)
})

Effect.runPromise(processLogFile('server.log'))
  .then(result => console.log('Log analysis:', result))
  .catch(error => console.error('Processing failed:', error))
```

### Testing Strategies

Comprehensive testing approaches for regex-based functionality.

```typescript
import { RegExp, String, Effect, Array as Arr, Option } from "effect"

// Test utilities for regex operations
const RegexTestUtils = {
  // Test pattern against multiple inputs
  testPattern: (
    pattern: string,
    testCases: Array<{ input: string; shouldMatch: boolean; description: string }>
  ) => Effect.gen(function* () {
    const regex = yield* Effect.try({
      try: () => new RegExp(pattern),
      catch: (error) => new Error(`Invalid pattern: ${error}`)
    })
    
    const results = testCases.map(testCase => {
      const matches = String.match(regex)(testCase.input).pipe(Option.isSome)
      const passed = matches === testCase.shouldMatch
      
      return {
        description: testCase.description,
        input: testCase.input,
        expected: testCase.shouldMatch,
        actual: matches,
        passed
      }
    })
    
    const passedCount = Arr.filter(results, result => result.passed).length
    const totalCount = results.length
    
    return {
      pattern,
      results,
      summary: {
        passed: passedCount,
        failed: totalCount - passedCount,
        total: totalCount,
        success: passedCount === totalCount
      }
    }
  }),
  
  // Benchmark regex performance
  benchmarkPattern: (pattern: string, testString: string, iterations = 1000) =>
    Effect.gen(function* () {
      const regex = yield* Effect.try({
        try: () => new RegExp(pattern, 'g'),
        catch: (error) => new Error(`Invalid pattern: ${error}`)
      })
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        String.matchAll(regex)(testString)
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations
      
      return {
        pattern,
        iterations,
        totalTime: endTime - startTime,
        averageTime: avgTime,
        operationsPerSecond: 1000 / avgTime
      }
    })
}

// Example test suite
const emailPatternTests = [
  { input: 'user@example.com', shouldMatch: true, description: 'Valid email' },
  { input: 'user.name@example.com', shouldMatch: true, description: 'Email with dot in username' },
  { input: 'user@', shouldMatch: false, description: 'Incomplete email' },
  { input: '@example.com', shouldMatch: false, description: 'Missing username' },
  { input: 'notanemail', shouldMatch: false, description: 'Not an email' },
  { input: 'user@example', shouldMatch: false, description: 'Missing TLD' }
]

const runEmailPatternTest = Effect.gen(function* () {
  const testResult = yield* RegexTestUtils.testPattern(
    '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    emailPatternTests
  )
  
  const benchmark = yield* RegexTestUtils.benchmarkPattern(
    '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    'user@example.com test@domain.org invalid@',
    10000
  )
  
  return {
    testResult,
    benchmark
  }
})

Effect.runPromise(runEmailPatternTest)
  .then(({ testResult, benchmark }) => {
    console.log('Test Results:')
    console.log(`Passed: ${testResult.summary.passed}/${testResult.summary.total}`)
    console.log('\nBenchmark:')
    console.log(`Average time: ${benchmark.averageTime.toFixed(4)}ms`)
    console.log(`Operations/sec: ${Math.round(benchmark.operationsPerSecond)}`)
  })
  .catch(error => console.error('Test failed:', error))
```

## Conclusion

Effect's RegExp module provides **type safety**, **functional composition**, and **secure pattern handling** for regular expression operations in TypeScript applications.

Key benefits:
- **Type Safety**: Integration with Option types eliminates null-related runtime errors
- **Secure Escaping**: `RegExp.escape` prevents regex injection attacks and pattern errors
- **Functional Composition**: All operations work seamlessly with Effect's pipe and generator patterns
- **Error Handling**: Comprehensive error management for regex operations and validation

The RegExp module excels when building secure text processing systems, user input validation, content analysis tools, and any application requiring safe, composable regex operations with robust error handling.