# Trie: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Trie Solves

Building efficient string-based search features like autocomplete, spell checking, or URL routing often requires complex prefix matching operations. Traditional approaches using arrays or hash maps are inefficient for these use cases:

```typescript
// Traditional approach using arrays - inefficient for large datasets
class AutoCompleteTraditional {
  private words: string[] = []
  
  addWord(word: string): void {
    this.words.push(word)
  }
  
  getSuggestions(prefix: string): string[] {
    // O(n * m) where n = number of words, m = average word length
    return this.words.filter(word => word.startsWith(prefix))
  }
  
  hasExactMatch(word: string): boolean {
    // O(n) linear search
    return this.words.includes(word)
  }
}

// HashMap approach - better for exact lookups but still inefficient for prefix searches
const wordsMap = new Map<string, boolean>()
const getSuggestionsFromMap = (prefix: string): string[] => {
  const results: string[] = []
  // O(n) - must check every key
  for (const [key] of wordsMap) {
    if (key.startsWith(prefix)) {
      results.push(key)
    }
  }
  return results
}

// Using the traditional approaches
const autoComplete = new AutoCompleteTraditional()
autoComplete.addWord("cat")
autoComplete.addWord("car")
autoComplete.addWord("card")
autoComplete.addWord("care")
autoComplete.addWord("careful")

// Inefficient - O(n * m) for each search
const suggestions = autoComplete.getSuggestions("car") // ["car", "card", "care", "careful"]
```

This approach leads to:
- **Poor performance** - O(n) or O(n * m) for prefix searches on large datasets
- **Memory inefficiency** - No sharing of common prefixes
- **Complex routing logic** - Manual parsing for URL routing with nested paths
- **Spelling correction complexity** - Difficult to implement efficient "did you mean" features

### The Trie Solution

Trie (prefix tree) provides optimized string-based operations with O(k) lookup time, where k is the length of the search key, regardless of dataset size:

```typescript
import { Trie } from "effect"

// Efficient Trie-based autocomplete
const createAutoComplete = () => {
  const trie = Trie.empty<boolean>().pipe(
    Trie.insert("cat", true),
    Trie.insert("car", true),
    Trie.insert("card", true),
    Trie.insert("care", true),
    Trie.insert("careful", true)
  )
  
  // O(k) where k = prefix length, regardless of dataset size
  const getSuggestions = (prefix: string) =>
    Array.from(Trie.keysWithPrefix(trie, prefix))
  
  // O(k) exact match lookup
  const hasWord = (word: string) =>
    Trie.has(trie, word)
  
  return { getSuggestions, hasWord, trie }
}

const autoComplete = createAutoComplete()
console.log(autoComplete.getSuggestions("car")) // ["car", "card", "care", "careful"]
console.log(autoComplete.hasWord("care")) // true
console.log(autoComplete.hasWord("caring")) // false
```

### Key Concepts

**Prefix Tree Structure**: Trie organizes strings by shared prefixes, creating a tree where each node represents a character and paths from root to leaves form complete words.

**O(k) Performance**: Lookup, insertion, and prefix search operations run in O(k) time where k is the key length, independent of the total number of stored strings.

**Structural Sharing**: Trie efficiently shares memory for common prefixes, making it memory-efficient for large datasets with overlapping strings.

## Basic Usage Patterns

### Pattern 1: Creating and Populating Tries

```typescript
import { Trie } from "effect"

// Create empty trie
const emptyTrie = Trie.empty<number>()

// Create from iterable
const fromArray = Trie.fromIterable([
  ["apple", 1],
  ["application", 2],
  ["apply", 3],
  ["banana", 4]
])

// Create using make constructor
const fromEntries = Trie.make(
  ["hello", "greeting"],
  ["help", "assistance"],
  ["helper", "assistant"]
)

// Add entries progressively
const progressiveTrie = Trie.empty<string>().pipe(
  Trie.insert("cat", "feline"),
  Trie.insert("car", "vehicle"),
  Trie.insert("card", "payment"),
  Trie.insert("care", "attention")
)
```

### Pattern 2: Basic Lookup Operations

```typescript
import { Trie, Option } from "effect"

const dictionary = Trie.make(
  ["run", "verb"],
  ["running", "verb-ing"],
  ["runner", "noun"],
  ["runs", "verb-s"]
)

// Safe lookup with Option
const getDefinition = (word: string) => Trie.get(dictionary, word)

console.log(getDefinition("run")) // Option.some("verb")
console.log(getDefinition("walk")) // Option.none()

// Check existence
const hasWord = (word: string) => Trie.has(dictionary, word)

console.log(hasWord("running")) // true
console.log(hasWord("walked")) // false

// Get all keys and values
const allWords = Array.from(Trie.keys(dictionary))
const allDefinitions = Array.from(Trie.values(dictionary))
const allEntries = Array.from(Trie.entries(dictionary))
```

### Pattern 3: Prefix-Based Operations

```typescript
import { Trie } from "effect"

const wordList = Trie.make(
  ["programming", 5],
  ["program", 3],
  ["progress", 4],
  ["project", 2],
  ["problem", 1]
)

// Find all words with specific prefix
const getWordsWithPrefix = (prefix: string) =>
  Array.from(Trie.keysWithPrefix(wordList, prefix))

console.log(getWordsWithPrefix("prog")) // ["program", "programming", "progress"]
console.log(getWordsWithPrefix("proj")) // ["project"]

// Get values for words with prefix
const getValuesWithPrefix = (prefix: string) =>
  Array.from(Trie.valuesWithPrefix(wordList, prefix))

console.log(getValuesWithPrefix("prog")) // [3, 5, 4]

// Get complete entries with prefix
const getEntriesWithPrefix = (prefix: string) =>
  Array.from(Trie.entriesWithPrefix(wordList, prefix))

console.log(getEntriesWithPrefix("pro")) // [["problem", 1], ["program", 3], ["programming", 5], ["progress", 4], ["project", 2]]
```

## Real-World Examples

### Example 1: Search Autocomplete System

Building a sophisticated autocomplete system for a search interface with ranking and filtering:

```typescript
import { Trie, Option, Array as Arr, pipe } from "effect"

interface SearchResult {
  term: string
  frequency: number
  category: string
  lastUsed: Date
}

const createSearchAutocomplete = () => {
  // Initialize with popular search terms
  const searchTrie = Trie.empty<SearchResult>().pipe(
    Trie.insert("javascript", {
      term: "javascript",
      frequency: 10000,
      category: "programming",
      lastUsed: new Date("2024-01-15")
    }),
    Trie.insert("java", {
      term: "java",
      frequency: 8500,
      category: "programming", 
      lastUsed: new Date("2024-01-14")
    }),
    Trie.insert("json", {
      term: "json",
      frequency: 6000,
      category: "data-format",
      lastUsed: new Date("2024-01-10")
    }),
    Trie.insert("jupyter", {
      term: "jupyter",
      frequency: 3000,
      category: "tools",
      lastUsed: new Date("2024-01-08")
    })
  )

  const getSuggestions = (query: string, maxResults: number = 5) => {
    if (query.length < 2) return []
    
    return pipe(
      Trie.entriesWithPrefix(searchTrie, query.toLowerCase()),
      Array.from,
      // Sort by frequency (most popular first)
      Arr.sort(([, a], [, b]) => b.frequency - a.frequency),
      // Limit results
      Arr.take(maxResults),
      // Extract just the terms and metadata
      Arr.map(([term, result]) => ({
        term,
        frequency: result.frequency,
        category: result.category
      }))
    )
  }

  const recordSearch = (term: string, category: string = "general") => {
    const existing = Trie.get(searchTrie, term.toLowerCase())
    
    return Option.match(existing, {
      onNone: () => 
        searchTrie.pipe(
          Trie.insert(term.toLowerCase(), {
            term: term.toLowerCase(),
            frequency: 1,
            category,
            lastUsed: new Date()
          })
        ),
      onSome: (result) =>
        searchTrie.pipe(
          Trie.modify(term.toLowerCase(), existing => ({
            ...existing,
            frequency: existing.frequency + 1,
            lastUsed: new Date()
          }))
        )
    })
  }

  const getPopularInCategory = (category: string) => {
    return pipe(
      Trie.entries(searchTrie),
      Array.from,
      Arr.filter(([, result]) => result.category === category),
      Arr.sort(([, a], [, b]) => b.frequency - a.frequency),
      Arr.map(([term, result]) => ({ term, frequency: result.frequency }))
    )
  }

  return {
    getSuggestions,
    recordSearch,
    getPopularInCategory,
    trie: searchTrie
  }
}

// Usage example
const searchSystem = createSearchAutocomplete()

console.log(searchSystem.getSuggestions("ja"))
// [
//   { term: "javascript", frequency: 10000, category: "programming" },
//   { term: "java", frequency: 8500, category: "programming" }
// ]

console.log(searchSystem.getSuggestions("jup"))
// [{ term: "jupyter", frequency: 3000, category: "tools" }]

console.log(searchSystem.getPopularInCategory("programming"))
// [
//   { term: "javascript", frequency: 10000 },
//   { term: "java", frequency: 8500 }
// ]
```

### Example 2: URL Router with Nested Paths

Implementing an efficient URL router using Trie for complex nested routing:

```typescript
import { Trie, Option, Effect } from "effect"

interface RouteHandler {
  method: string
  handler: (params: Record<string, string>) => Effect.Effect<Response>
  middleware: string[]
  params: string[]
}

interface Response {
  status: number
  body: any
  headers?: Record<string, string>
}

const createRouter = () => {
  let routeTrie = Trie.empty<RouteHandler>()

  const addRoute = (
    pattern: string, 
    method: string,
    handler: (params: Record<string, string>) => Effect.Effect<Response>,
    middleware: string[] = []
  ) => {
    // Convert pattern like "/users/:id/posts/:postId" to "/users/*/posts/*"
    const paramNames: string[] = []
    const normalizedPattern = pattern.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName)
      return "*"
    })

    const routeKey = `${method}:${normalizedPattern}`
    
    routeTrie = routeTrie.pipe(
      Trie.insert(routeKey, {
        method,
        handler,
        middleware,
        params: paramNames
      })
    )
  }

  const findRoute = (path: string, method: string) => {
    // Try exact match first
    const exactKey = `${method}:${path}`
    const exactMatch = Trie.get(routeTrie, exactKey)
    
    if (Option.isSome(exactMatch)) {
      return Option.some({ route: exactMatch.value, params: {} })
    }

    // Try pattern matching for parameterized routes
    const segments = path.split('/').filter(Boolean)
    
    // Generate possible patterns by replacing segments with wildcards
    const tryPattern = (segmentIndex: number, currentPattern: string, params: Record<string, string>): Option.Option<{ route: RouteHandler, params: Record<string, string> }> => {
      if (segmentIndex >= segments.length) {
        const routeKey = `${method}:${currentPattern}`
        return pipe(
          Trie.get(routeTrie, routeKey),
          Option.map(route => ({ route, params }))
        )
      }

      const segment = segments[segmentIndex]
      const withSegment = `${currentPattern}/${segment}`
      const withWildcard = `${currentPattern}/*`

      // Try exact segment first
      const exactResult = tryPattern(segmentIndex + 1, withSegment, params)
      if (Option.isSome(exactResult)) {
        return exactResult
      }

      // Try wildcard pattern
      const wildcardRoute = Trie.get(routeTrie, `${method}:${withWildcard}`)
      if (Option.isSome(wildcardRoute)) {
        const route = wildcardRoute.value
        if (segmentIndex < route.params.length) {
          const paramName = route.params[segmentIndex]
          const newParams = { ...params, [paramName]: segment }
          return tryPattern(segmentIndex + 1, withWildcard, newParams)
        }
      }

      return Option.none()
    }

    return tryPattern(0, "", {})
  }

  const getAllRoutes = () => Array.from(Trie.entries(routeTrie))

  const getRoutesByPrefix = (pathPrefix: string) => {
    return Array.from(Trie.keysWithPrefix(routeTrie, `GET:${pathPrefix}`))
      .map(key => key.replace('GET:', ''))
  }

  return {
    addRoute,
    findRoute,
    getAllRoutes,
    getRoutesByPrefix
  }
}

// Usage example
const router = createRouter()

// Add routes
router.addRoute("/users", "GET", () => 
  Effect.succeed({ status: 200, body: { users: [] } })
)

router.addRoute("/users/:id", "GET", (params) =>
  Effect.succeed({ 
    status: 200, 
    body: { user: { id: params.id } } 
  })
)

router.addRoute("/users/:id/posts/:postId", "GET", (params) =>
  Effect.succeed({
    status: 200,
    body: { 
      post: { 
        id: params.postId, 
        userId: params.id 
      } 
    }
  })
)

router.addRoute("/api/v1/health", "GET", () =>
  Effect.succeed({ status: 200, body: { status: "ok" } })
)

// Route matching examples
console.log(router.findRoute("/users/123", "GET"))
// Option.some({ route: RouteHandler, params: { id: "123" } })

console.log(router.findRoute("/users/456/posts/789", "GET"))
// Option.some({ route: RouteHandler, params: { id: "456", postId: "789" } })

console.log(router.getRoutesByPrefix("/api"))
// ["/api/v1/health"]
```

### Example 3: Dictionary with Spell Checking

Building a dictionary system with spell checking and suggestion features:

```typescript
import { Trie, Option, Array as Arr, pipe, String } from "effect"

interface DictionaryEntry {
  word: string
  definitions: string[]
  partOfSpeech: string
  frequency: number
  phonetic?: string
}

const createDictionary = () => {
  let dictionary = Trie.empty<DictionaryEntry>()

  const addWord = (entry: DictionaryEntry) => {
    dictionary = dictionary.pipe(
      Trie.insert(entry.word.toLowerCase(), entry)
    )
  }

  const lookupWord = (word: string) => 
    Trie.get(dictionary, word.toLowerCase())

  const isValidWord = (word: string) => 
    Trie.has(dictionary, word.toLowerCase())

  // Spell checking using edit distance and prefix matching
  const getSuggestions = (word: string, maxSuggestions: number = 5) => {
    const lowerWord = word.toLowerCase()
    
    if (isValidWord(lowerWord)) {
      return [lowerWord] // Word is correct
    }

    const suggestions = new Set<string>()

    // Strategy 1: Prefix matching for typos at the end
    const prefixLength = Math.max(1, Math.floor(word.length * 0.6))
    const prefix = lowerWord.slice(0, prefixLength)
    
    const prefixMatches = Array.from(Trie.keysWithPrefix(dictionary, prefix))
    prefixMatches.forEach(match => {
      if (suggestions.size < maxSuggestions) {
        suggestions.add(match)
      }
    })

    // Strategy 2: One character off (substitution, insertion, deletion)
    if (suggestions.size < maxSuggestions) {
      const oneEditAway = generateOneEditSuggestions(lowerWord)
      oneEditAway.forEach(candidate => {
        if (suggestions.size < maxSuggestions && isValidWord(candidate)) {
          suggestions.add(candidate)
        }
      })
    }

    // Strategy 3: Two character transposition
    if (suggestions.size < maxSuggestions && word.length > 1) {
      const transpositions = generateTranspositions(lowerWord)
      transpositions.forEach(candidate => {
        if (suggestions.size < maxSuggestions && isValidWord(candidate)) {
          suggestions.add(candidate)
        }
      })
    }

    return Array.from(suggestions).slice(0, maxSuggestions)
  }

  const generateOneEditSuggestions = (word: string): string[] => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    const suggestions: string[] = []

    // Deletions
    for (let i = 0; i <= word.length; i++) {
      if (i < word.length) {
        suggestions.push(word.slice(0, i) + word.slice(i + 1))
      }
    }

    // Insertions
    for (let i = 0; i <= word.length; i++) {
      for (const char of alphabet) {
        suggestions.push(word.slice(0, i) + char + word.slice(i))
      }
    }

    // Substitutions
    for (let i = 0; i < word.length; i++) {
      for (const char of alphabet) {
        if (char !== word[i]) {
          suggestions.push(word.slice(0, i) + char + word.slice(i + 1))
        }
      }
    }

    return suggestions
  }

  const generateTranspositions = (word: string): string[] => {
    const suggestions: string[] = []
    
    for (let i = 0; i < word.length - 1; i++) {
      const chars = word.split('')
      // Swap adjacent characters
      const temp = chars[i]
      chars[i] = chars[i + 1]
      chars[i + 1] = temp
      suggestions.push(chars.join(''))
    }

    return suggestions
  }

  const getWordsStartingWith = (prefix: string) => {
    return pipe(
      Trie.keysWithPrefix(dictionary, prefix.toLowerCase()),
      Array.from,
      Arr.take(10) // Limit results
    )
  }

  const findWordsByPattern = (pattern: string) => {
    // Simple pattern matching where * represents any character
    const regex = new RegExp(pattern.replace(/\*/g, '.'), 'i')
    
    return pipe(
      Trie.keys(dictionary),
      Array.from,
      Arr.filter(word => regex.test(word)),
      Arr.take(20)
    )
  }

  const getWordDefinitions = (word: string) => {
    return pipe(
      lookupWord(word),
      Option.map(entry => ({
        word: entry.word,
        definitions: entry.definitions,
        partOfSpeech: entry.partOfSpeech,
        phonetic: entry.phonetic
      }))
    )
  }

  return {
    addWord,
    lookupWord,
    isValidWord,
    getSuggestions,
    getWordsStartingWith,
    findWordsByPattern,
    getWordDefinitions,
    dictionary
  }
}

// Usage example
const dict = createDictionary()

// Add dictionary entries
dict.addWord({
  word: "effect",
  definitions: ["A result or consequence", "To bring about"],
  partOfSpeech: "noun/verb",
  frequency: 1000,
  phonetic: "/ɪˈfekt/"
})

dict.addWord({
  word: "effective",
  definitions: ["Successful in producing a desired result"],
  partOfSpeech: "adjective", 
  frequency: 800,
  phonetic: "/ɪˈfektɪv/"
})

dict.addWord({
  word: "efficiently",
  definitions: ["In a way that achieves maximum productivity"],
  partOfSpeech: "adverb",
  frequency: 600
})

// Spell checking examples
console.log(dict.isValidWord("effect")) // true
console.log(dict.isValidWord("efect")) // false

console.log(dict.getSuggestions("efect")) // ["effect"]
console.log(dict.getSuggestions("effektive")) // ["effective"]

console.log(dict.getWordsStartingWith("eff"))
// ["effect", "effective", "efficiently"]

console.log(dict.findWordsByPattern("eff*t"))
// ["effect"]

const definition = dict.getWordDefinitions("effect")
console.log(definition)
// Option.some({
//   word: "effect",
//   definitions: ["A result or consequence", "To bring about"],
//   partOfSpeech: "noun/verb",
//   phonetic: "/ɪˈfekt/"
// })
```

## Advanced Features Deep Dive

### Feature 1: Longest Prefix Matching

The `longestPrefixOf` function finds the longest stored key that is a prefix of the given input, essential for routing and hierarchical lookups:

#### Basic Longest Prefix Usage

```typescript
import { Trie, Option } from "effect"

const routingTable = Trie.make(
  ["/api", "api-handler"],
  ["/api/v1", "v1-handler"],
  ["/api/v1/users", "users-handler"],
  ["/api/v2", "v2-handler"]
)

// Find the most specific matching route
console.log(Trie.longestPrefixOf(routingTable, "/api/v1/users/123"))
// Option.some(["/api/v1/users", "users-handler"])

console.log(Trie.longestPrefixOf(routingTable, "/api/v1/posts"))
// Option.some(["/api/v1", "v1-handler"])

console.log(Trie.longestPrefixOf(routingTable, "/api/admin"))
// Option.some(["/api", "api-handler"])

console.log(Trie.longestPrefixOf(routingTable, "/public/assets"))
// Option.none()
```

#### Real-World Longest Prefix Example: Configuration Resolver

```typescript
import { Trie, Option, Effect } from "effect"

interface ConfigValue {
  value: any
  source: string
  priority: number
}

const createConfigResolver = () => {
  let configTrie = Trie.empty<ConfigValue>()

  const setConfig = (path: string, value: any, source: string = "default", priority: number = 0) => {
    configTrie = configTrie.pipe(
      Trie.insert(path, { value, source, priority })
    )
  }

  const getConfig = (path: string) => {
    // First try exact match
    const exact = Trie.get(configTrie, path)
    if (Option.isSome(exact)) {
      return exact
    }

    // Fall back to longest prefix match for inherited config
    return Trie.longestPrefixOf(configTrie, path)
  }

  const resolveConfigPath = (path: string) => Effect.gen(function* () {
    const config = getConfig(path)
    
    return yield* Option.match(config, {
      onNone: () => Effect.fail(`Configuration not found for path: ${path}`),
      onSome: ([configPath, configValue]) => Effect.succeed({
        requestedPath: path,
        resolvedPath: configPath,
        value: configValue.value,
        source: configValue.source,
        inherited: configPath !== path
      })
    })
  })

  return {
    setConfig,
    getConfig,
    resolveConfigPath,
    trie: configTrie
  }
}

// Usage example
const config = createConfigResolver()

// Set hierarchical configuration
config.setConfig("app", { timeout: 5000 }, "default", 0)
config.setConfig("app.database", { host: "localhost", port: 5432 }, "env", 1)
config.setConfig("app.database.pool", { min: 2, max: 10 }, "config-file", 2)
config.setConfig("app.redis", { host: "redis-server" }, "env", 1)

// Resolve configuration with inheritance
const examples = [
  "app.database.pool.maxIdleTime", // Should inherit from app.database.pool
  "app.database.connectionString",  // Should inherit from app.database  
  "app.cache.ttl",                 // Should inherit from app
  "other.service.config"           // Should fail - no match
]

examples.forEach(async path => {
  const result = await Effect.runPromise(config.resolveConfigPath(path).pipe(
    Effect.catchAll(error => Effect.succeed({ error }))
  ))
  console.log(`${path}:`, result)
})

// Expected output:
// app.database.pool.maxIdleTime: {
//   requestedPath: "app.database.pool.maxIdleTime",
//   resolvedPath: "app.database.pool", 
//   value: { min: 2, max: 10 },
//   source: "config-file",
//   inherited: true
// }
```

### Feature 2: Bulk Operations and Performance

Trie provides efficient bulk operations for managing large datasets:

#### Advanced Bulk Operations

```typescript
import { Trie, Array as Arr, pipe } from "effect"

interface WordMetrics {
  count: number
  avgLength: number
  categories: Set<string>
}

const createWordAnalyzer = () => {
  let wordTrie = Trie.empty<{ count: number, category: string, length: number }>()

  const addWords = (words: Array<{ word: string, category: string }>) => {
    const entries: Array<[string, { count: number, category: string, length: number }]> = 
      words.map(({ word, category }) => [
        word.toLowerCase(),
        { count: 1, category, length: word.length }
      ])

    wordTrie = wordTrie.pipe(
      Trie.insertMany(entries)
    )
  }

  const removeWords = (words: string[]) => {
    wordTrie = wordTrie.pipe(
      Trie.removeMany(words.map(w => w.toLowerCase()))
    )
  }

  const getMetricsForPrefix = (prefix: string): WordMetrics => {
    const entries = Array.from(Trie.entriesWithPrefix(wordTrie, prefix.toLowerCase()))
    
    if (entries.length === 0) {
      return { count: 0, avgLength: 0, categories: new Set() }
    }

    const totalLength = entries.reduce((sum, [, data]) => sum + data.length, 0)
    const avgLength = totalLength / entries.length
    const categories = new Set(entries.map(([, data]) => data.category))

    return {
      count: entries.length,
      avgLength: Math.round(avgLength * 100) / 100,
      categories
    }
  }

  const bulkUpdateCounts = (wordCounts: Map<string, number>) => {
    wordCounts.forEach((count, word) => {
      wordTrie = wordTrie.pipe(
        Trie.modify(word.toLowerCase(), existing => ({
          ...existing,
          count: existing.count + count
        }))
      )
    })
  }

  const getWordsByCategory = (category: string) => {
    return pipe(
      Trie.entries(wordTrie),
      Array.from,
      Arr.filter(([, data]) => data.category === category),
      Arr.map(([word]) => word)
    )
  }

  const getTopWordsByCount = (limit: number = 10) => {
    return pipe(
      Trie.entries(wordTrie),
      Array.from,
      Arr.sort(([, a], [, b]) => b.count - a.count),
      Arr.take(limit),
      Arr.map(([word, data]) => ({ word, count: data.count, category: data.category }))
    )
  }

  return {
    addWords,
    removeWords,
    getMetricsForPrefix,
    bulkUpdateCounts,
    getWordsByCategory,
    getTopWordsByCount,
    size: () => Trie.size(wordTrie)
  }
}

// Usage example with large dataset
const analyzer = createWordAnalyzer()

// Add words in bulk
analyzer.addWords([
  { word: "javascript", category: "programming" },
  { word: "java", category: "programming" },
  { word: "python", category: "programming" },
  { word: "typescript", category: "programming" },
  { word: "react", category: "framework" },
  { word: "vue", category: "framework" },
  { word: "angular", category: "framework" },
  { word: "database", category: "storage" },
  { word: "redis", category: "storage" },
  { word: "postgresql", category: "storage" }
])

console.log("Total words:", analyzer.size()) // 10

// Analyze programming languages
const progMetrics = analyzer.getMetricsForPrefix("java")
console.log("Java* metrics:", progMetrics)
// { count: 2, avgLength: 8.5, categories: Set(["programming"]) }

// Bulk update word counts based on usage
const usageCounts = new Map([
  ["javascript", 5],
  ["python", 3],
  ["react", 8]
])
analyzer.bulkUpdateCounts(usageCounts)

// Get top words by popularity
console.log("Top words:", analyzer.getTopWordsByCount(3))
// [
//   { word: "react", count: 9, category: "framework" },
//   { word: "javascript", count: 6, category: "programming" },
//   { word: "python", count: 4, category: "programming" }
// ]

// Remove obsolete technologies
analyzer.removeWords(["vue", "angular"])
console.log("After removal:", analyzer.size()) // 8
```

### Feature 3: Advanced Filtering and Mapping

Trie supports functional programming patterns with filter, map, and reduce operations:

#### Complex Data Transformations

```typescript
import { Trie, Option, pipe } from "effect"

interface ProductInfo {
  name: string
  price: number
  category: string
  inStock: boolean
  rating: number
  tags: string[]
}

const createProductCatalog = () => {
  let catalog = Trie.empty<ProductInfo>()

  const addProduct = (sku: string, info: ProductInfo) => {
    catalog = catalog.pipe(Trie.insert(sku.toLowerCase(), info))
  }

  // Filter products by multiple criteria
  const getFilteredProducts = (criteria: {
    minPrice?: number
    maxPrice?: number
    category?: string
    inStockOnly?: boolean
    minRating?: number
  }) => {
    return catalog.pipe(
      Trie.filter((product, sku) => {
        if (criteria.minPrice && product.price < criteria.minPrice) return false
        if (criteria.maxPrice && product.price > criteria.maxPrice) return false
        if (criteria.category && product.category !== criteria.category) return false
        if (criteria.inStockOnly && !product.inStock) return false
        if (criteria.minRating && product.rating < criteria.minRating) return false
        return true
      })
    )
  }

  // Transform product data with price adjustments
  const applyDiscounts = (discountRules: Map<string, number>) => {
    return catalog.pipe(
      Trie.map((product, sku) => {
        const discount = discountRules.get(product.category) || 0
        const discountedPrice = product.price * (1 - discount)
        
        return {
          ...product,
          price: Math.round(discountedPrice * 100) / 100,
          tags: discount > 0 ? [...product.tags, "on-sale"] : product.tags
        }
      })
    )
  }

  // Advanced filterMap for conditional transformations
  const getPromotionalProducts = (minDiscount: number = 0.1) => {
    return catalog.pipe(
      Trie.filterMap((product, sku) => {
        // Only include products that can have meaningful discounts
        if (product.price < 10 || !product.inStock) {
          return Option.none()
        }

        const discountedPrice = product.price * (1 - minDiscount)
        return Option.some({
          sku,
          originalPrice: product.price,
          salePrice: Math.round(discountedPrice * 100) / 100,
          name: product.name,
          savings: Math.round((product.price - discountedPrice) * 100) / 100
        })
      })
    )
  }

  // Aggregate analytics using reduce
  const getCategoryAnalytics = () => {
    return catalog.pipe(
      Trie.reduce(
        new Map<string, { count: number, avgPrice: number, totalValue: number }>(),
        (acc, product, sku) => {
          const existing = acc.get(product.category) || { count: 0, avgPrice: 0, totalValue: 0 }
          const newCount = existing.count + 1
          const newTotalValue = existing.totalValue + (product.inStock ? product.price : 0)
          
          acc.set(product.category, {
            count: newCount,
            avgPrice: Math.round((existing.avgPrice * existing.count + product.price) / newCount * 100) / 100,
            totalValue: Math.round(newTotalValue * 100) / 100
          })
          
          return acc
        }
      )
    )
  }

  const searchProductsByTags = (tags: string[]) => {
    return catalog.pipe(
      Trie.filter((product, sku) => 
        tags.some(tag => product.tags.includes(tag))
      )
    )
  }

  return {
    addProduct,
    getFilteredProducts,
    applyDiscounts,
    getPromotionalProducts,
    getCategoryAnalytics,
    searchProductsByTags,
    catalog
  }
}

// Usage example
const store = createProductCatalog()

// Add products
store.addProduct("LAP001", {
  name: "Gaming Laptop",
  price: 1299.99,
  category: "electronics",
  inStock: true,
  rating: 4.5,
  tags: ["gaming", "portable", "high-performance"]
})

store.addProduct("PHN001", {
  name: "Smartphone",
  price: 699.99,
  category: "electronics", 
  inStock: true,
  rating: 4.2,
  tags: ["mobile", "5g", "camera"]
})

store.addProduct("BOK001", {
  name: "Programming Book",
  price: 49.99,
  category: "books",
  inStock: false,
  rating: 4.8,
  tags: ["programming", "education", "typescript"]
})

// Filter products
const expensiveElectronics = store.getFilteredProducts({
  category: "electronics",
  minPrice: 500,
  inStockOnly: true,
  minRating: 4.0
})

console.log("Expensive electronics:", Array.from(Trie.entries(expensiveElectronics)))

// Apply category-based discounts
const discountRules = new Map([
  ["electronics", 0.15], // 15% off electronics
  ["books", 0.20]        // 20% off books
])

const discountedCatalog = store.applyDiscounts(discountRules)
console.log("With discounts:", Array.from(Trie.entries(discountedCatalog)))

// Get promotional products
const promoProducts = store.getPromotionalProducts(0.1)
console.log("Promotional products:", Array.from(Trie.entries(promoProducts)))

// Category analytics
const analytics = store.getCategoryAnalytics()
console.log("Category analytics:", analytics)
// Map {
//   "electronics" => { count: 2, avgPrice: 999.99, totalValue: 1999.98 },
//   "books" => { count: 1, avgPrice: 49.99, totalValue: 0 }
// }

// Search by tags
const gamingProducts = store.searchProductsByTags(["gaming", "high-performance"])
console.log("Gaming products:", Array.from(Trie.keys(gamingProducts)))
```

## Practical Patterns & Best Practices

### Pattern 1: Trie as Cache Key Generator

Using Trie to generate hierarchical cache keys with automatic prefix invalidation:

```typescript
import { Trie, Option, Effect, Array as Arr } from "effect"

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
  dependencies: string[]
}

const createHierarchicalCache = <T>() => {
  let cache = Trie.empty<CacheEntry<T>>()

  const set = (key: string, value: T, ttl: number = 3600000, dependencies: string[] = []) => {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      dependencies
    }
    
    cache = cache.pipe(Trie.insert(key, entry))
  }

  const get = (key: string) => {
    return pipe(
      Trie.get(cache, key),
      Option.filter(entry => {
        const isExpired = Date.now() - entry.timestamp > entry.ttl
        return !isExpired
      }),
      Option.map(entry => entry.value)
    )
  }

  const invalidatePrefix = (prefix: string) => {
    const keysToRemove = Array.from(Trie.keysWithPrefix(cache, prefix))
    cache = cache.pipe(Trie.removeMany(keysToRemove))
    return keysToRemove.length
  }

  const invalidateDependencies = (dependency: string) => {
    const keysToRemove = pipe(
      Trie.entries(cache),
      Array.from,
      Arr.filter(([, entry]) => entry.dependencies.includes(dependency)),
      Arr.map(([key]) => key)
    )
    
    cache = cache.pipe(Trie.removeMany(keysToRemove))
    return keysToRemove.length
  }

  const cleanup = () => {
    const now = Date.now()
    const expiredKeys = pipe(
      Trie.entries(cache),
      Array.from,
      Arr.filter(([, entry]) => now - entry.timestamp > entry.ttl),
      Arr.map(([key]) => key)
    )
    
    cache = cache.pipe(Trie.removeMany(expiredKeys))
    return expiredKeys.length
  }

  const getStats = () => {
    const now = Date.now()
    let totalEntries = 0
    let expiredEntries = 0
    const categoryCounts = new Map<string, number>()

    Trie.forEach(cache, (entry, key) => {
      totalEntries++
      
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++
      }
      
      // Count by prefix (category)
      const category = key.split('.')[0] || 'root'
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
    })

    return {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      categoryCounts: Object.fromEntries(categoryCounts)
    }
  }

  return {
    set,
    get,
    invalidatePrefix,
    invalidateDependencies,
    cleanup,
    getStats,
    size: () => Trie.size(cache)
  }
}

// Usage example
const userCache = createHierarchicalCache<any>()

// Cache user data with hierarchical keys
userCache.set("user.123.profile", { name: "Alice", email: "alice@example.com" }, 300000)
userCache.set("user.123.preferences", { theme: "dark", lang: "en" }, 600000, ["user.123"])
userCache.set("user.123.posts.recent", [{ id: 1, title: "Hello World" }], 60000, ["user.123"])
userCache.set("user.456.profile", { name: "Bob", email: "bob@example.com" }, 300000)

// Cache system-level data
userCache.set("system.config.theme", { primary: "#007acc" }, 3600000)
userCache.set("system.stats.daily", { users: 1000, posts: 5000 }, 86400000)

// Retrieve cached data
console.log("User profile:", userCache.get("user.123.profile"))
console.log("System config:", userCache.get("system.config.theme"))

// Invalidate all data for user 123
const invalidatedCount = userCache.invalidatePrefix("user.123")
console.log(`Invalidated ${invalidatedCount} entries for user 123`)

// Check cache stats
console.log("Cache stats:", userCache.getStats())
// {
//   totalEntries: 3,
//   expiredEntries: 0, 
//   activeEntries: 3,
//   categoryCounts: { user: 1, system: 2 }
// }

// Clean up expired entries
setTimeout(() => {
  const cleanedCount = userCache.cleanup()
  console.log(`Cleaned up ${cleanedCount} expired entries`)
}, 61000) // After 1 minute, recent posts cache expires
```

### Pattern 2: Auto-complete with Ranking and Context

Advanced autocomplete that considers context, user history, and smart ranking:

```typescript
import { Trie, Option, Array as Arr, pipe } from "effect"

interface SearchSuggestion {
  term: string
  category: string
  frequency: number
  contextRelevance: number
  userHistory: number
  lastUsed: number
}

const createSmartAutocomplete = () => {
  let suggestions = Trie.empty<SearchSuggestion>()
  let userHistory = new Map<string, number>()

  const addSuggestion = (term: string, category: string, frequency: number = 1) => {
    const existing = Trie.get(suggestions, term.toLowerCase())
    
    if (Option.isSome(existing)) {
      suggestions = suggestions.pipe(
        Trie.modify(term.toLowerCase(), suggestion => ({
          ...suggestion,
          frequency: suggestion.frequency + frequency
        }))
      )
    } else {
      suggestions = suggestions.pipe(
        Trie.insert(term.toLowerCase(), {
          term: term.toLowerCase(),
          category,
          frequency,
          contextRelevance: 0,
          userHistory: 0,
          lastUsed: 0
        })
      )
    }
  }

  const recordUserSelection = (term: string) => {
    const normalizedTerm = term.toLowerCase()
    userHistory.set(normalizedTerm, (userHistory.get(normalizedTerm) || 0) + 1)
    
    suggestions = suggestions.pipe(
      Trie.modify(normalizedTerm, suggestion => ({
        ...suggestion,
        userHistory: userHistory.get(normalizedTerm) || 0,
        lastUsed: Date.now()
      }))
    )
  }

  const updateContextRelevance = (context: string, relevantTerms: string[]) => {
    relevantTerms.forEach(term => {
      suggestions = suggestions.pipe(
        Trie.modify(term.toLowerCase(), suggestion => ({
          ...suggestion,
          contextRelevance: suggestion.contextRelevance + 1
        }))
      )
    })
  }

  const getSuggestions = (
    query: string, 
    context?: string,
    maxResults: number = 10,
    options: {
      categoryFilter?: string[]
      minFrequency?: number
      includeUserHistory?: boolean
    } = {}
  ) => {
    if (query.length < 2) return []

    const normalizedQuery = query.toLowerCase()
    const candidateEntries = Array.from(Trie.entriesWithPrefix(suggestions, normalizedQuery))

    return pipe(
      candidateEntries,
      // Apply filters
      Arr.filter(([term, suggestion]) => {
        if (options.categoryFilter && !options.categoryFilter.includes(suggestion.category)) {
          return false
        }
        if (options.minFrequency && suggestion.frequency < options.minFrequency) {
          return false
        }
        return true
      }),
      // Calculate composite score
      Arr.map(([term, suggestion]) => {
        const baseScore = suggestion.frequency
        const historyBoost = options.includeUserHistory ? suggestion.userHistory * 2 : 0
        const contextBoost = context ? suggestion.contextRelevance : 0
        const recencyBoost = suggestion.lastUsed > 0 ? 
          Math.max(0, 1 - (Date.now() - suggestion.lastUsed) / (7 * 24 * 60 * 60 * 1000)) : 0 // Decay over week
        
        const totalScore = baseScore + historyBoost + contextBoost + recencyBoost
        
        return {
          term: suggestion.term,
          category: suggestion.category,
          score: totalScore,
          breakdown: {
            base: baseScore,
            history: historyBoost,
            context: contextBoost,
            recency: recencyBoost
          }
        }
      }),
      // Sort by score
      Arr.sort((a, b) => b.score - a.score),
      // Limit results
      Arr.take(maxResults)
    )
  }

  const getCategoryStats = () => {
    const stats = new Map<string, { count: number, avgFrequency: number }>()
    
    Trie.forEach(suggestions, (suggestion, term) => {
      const existing = stats.get(suggestion.category) || { count: 0, avgFrequency: 0 }
      const newCount = existing.count + 1
      const newAvgFreq = (existing.avgFrequency * existing.count + suggestion.frequency) / newCount
      
      stats.set(suggestion.category, {
        count: newCount,
        avgFrequency: Math.round(newAvgFreq * 100) / 100
      })
    })
    
    return Object.fromEntries(stats)
  }

  const exportUserModel = () => {
    const userPreferences = pipe(
      Array.from(userHistory.entries()),
      Arr.sort(([, a], [, b]) => b - a),
      Arr.take(50), // Top 50 user preferences
      Arr.map(([term, count]) => ({ term, usage: count }))
    )

    const categoryPreferences = pipe(
      Trie.entries(suggestions),
      Array.from,
      Arr.filter(([, suggestion]) => suggestion.userHistory > 0),
      Arr.reduce(new Map<string, number>(), (acc, [, suggestion]) => {
        acc.set(suggestion.category, (acc.get(suggestion.category) || 0) + suggestion.userHistory)
        return acc
      }),
      categories => Object.fromEntries(categories)
    )

    return {
      userPreferences,
      categoryPreferences,
      totalInteractions: Array.from(userHistory.values()).reduce((sum, count) => sum + count, 0)
    }
  }

  return {
    addSuggestion,
    recordUserSelection,
    updateContextRelevance,
    getSuggestions,
    getCategoryStats,
    exportUserModel
  }
}

// Usage example
const autocomplete = createSmartAutocomplete()

// Add suggestions with categories
autocomplete.addSuggestion("javascript", "programming", 1000)
autocomplete.addSuggestion("typescript", "programming", 800)
autocomplete.addSuggestion("java", "programming", 1200)
autocomplete.addSuggestion("react", "framework", 900)
autocomplete.addSuggestion("angular", "framework", 600)
autocomplete.addSuggestion("database", "storage", 500)
autocomplete.addSuggestion("redis", "storage", 300)

// Simulate user interactions
autocomplete.recordUserSelection("javascript")
autocomplete.recordUserSelection("react")
autocomplete.recordUserSelection("typescript")
autocomplete.recordUserSelection("javascript") // User likes JavaScript

// Update context relevance (user is browsing programming topics)
autocomplete.updateContextRelevance("programming", ["javascript", "typescript", "java"])

// Get suggestions with different configurations
console.log("Basic suggestions for 'ja':")
console.log(autocomplete.getSuggestions("ja"))

console.log("\nWith user history for 'ja':")
console.log(autocomplete.getSuggestions("ja", undefined, 5, { includeUserHistory: true }))

console.log("\nFiltered to programming only:")
console.log(autocomplete.getSuggestions("j", "programming", 10, { 
  categoryFilter: ["programming"],
  includeUserHistory: true 
}))

console.log("\nCategory statistics:")
console.log(autocomplete.getCategoryStats())

console.log("\nUser model export:")
console.log(autocomplete.exportUserModel())
```

### Pattern 3: Multi-language Trie with Internationalization

```typescript
import { Trie, Option, HashMap, Array as Arr, pipe } from "effect"

interface MultiLangEntry {
  translations: Map<string, string>
  metadata: {
    category: string
    created: number
    lastModified: number
  }
}

const createMultiLanguageTrie = () => {
  let multiTrie = HashMap.empty<string, Trie<MultiLangEntry>>()
  
  const supportedLanguages = ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"]

  const initializeLanguage = (lang: string) => {
    if (!supportedLanguages.includes(lang)) {
      throw new Error(`Unsupported language: ${lang}`)
    }
    
    const existingTrie = HashMap.get(multiTrie, lang)
    if (Option.isNone(existingTrie)) {
      multiTrie = multiTrie.pipe(
        HashMap.set(lang, Trie.empty<MultiLangEntry>())
      )
    }
  }

  const addEntry = (
    primaryLang: string,
    key: string,
    translations: Record<string, string>,
    category: string = "general"
  ) => {
    initializeLanguage(primaryLang)
    
    const translationMap = new Map(Object.entries(translations))
    const entry: MultiLangEntry = {
      translations: translationMap,
      metadata: {
        category,
        created: Date.now(),
        lastModified: Date.now()
      }
    }

    // Add to each language's trie using the appropriate translation as key
    translationMap.forEach((translation, lang) => {
      initializeLanguage(lang)
      
      const langTrie = HashMap.unsafeGet(multiTrie, lang)
      const updatedTrie = langTrie.pipe(
        Trie.insert(translation.toLowerCase(), entry)
      )
      
      multiTrie = multiTrie.pipe(
        HashMap.set(lang, updatedTrie)
      )
    })
  }

  const search = (lang: string, query: string, maxResults: number = 10) => {
    const langTrie = HashMap.get(multiTrie, lang)
    
    if (Option.isNone(langTrie)) {
      return []
    }

    const results = Array.from(Trie.entriesWithPrefix(langTrie.value, query.toLowerCase()))
    
    return pipe(
      results,
      Arr.take(maxResults),
      Arr.map(([key, entry]) => ({
        key,
        translation: entry.translations.get(lang) || key,
        allTranslations: Object.fromEntries(entry.translations),
        category: entry.metadata.category
      }))
    )
  }

  const getTranslation = (fromLang: string, toLang: string, key: string) => {
    const fromTrie = HashMap.get(multiTrie, fromLang)
    
    if (Option.isNone(fromTrie)) {
      return Option.none()
    }

    const entry = Trie.get(fromTrie.value, key.toLowerCase())
    
    return pipe(
      entry,
      Option.flatMap(entry => 
        Option.fromNullable(entry.translations.get(toLang))
      )
    )
  }

  const getSuggestionsWithFallback = (
    preferredLangs: string[],
    query: string,
    maxResults: number = 5
  ) => {
    const allResults = new Map<string, any>()
    
    for (const lang of preferredLangs) {
      const langResults = search(lang, query, maxResults)
      
      langResults.forEach(result => {
        const key = `${result.category}:${result.key}`
        if (!allResults.has(key)) {
          allResults.set(key, {
            ...result,
            language: lang,
            priority: preferredLangs.indexOf(lang)
          })
        }
      })
      
      if (allResults.size >= maxResults) break
    }

    return pipe(
      Array.from(allResults.values()),
      Arr.sort((a, b) => a.priority - b.priority),
      Arr.take(maxResults)
    )
  }

  const getLanguageStats = () => {
    const stats = new Map<string, { entries: number, categories: Set<string> }>()
    
    HashMap.forEach(multiTrie, (trie, lang) => {
      const categories = new Set<string>()
      let entryCount = 0
      
      Trie.forEach(trie, (entry, key) => {
        categories.add(entry.metadata.category)
        entryCount++
      })
      
      stats.set(lang, {
        entries: entryCount,
        categories
      })
    })
    
    return Object.fromEntries(
      Array.from(stats.entries()).map(([lang, data]) => [
        lang,
        {
          entries: data.entries,
          categories: Array.from(data.categories)
        }
      ])
    )
  }

  const findSimilarAcrossLanguages = (term: string, threshold: number = 0.7) => {
    const results: Array<{
      language: string
      term: string
      similarity: number
      translations: Record<string, string>
    }> = []

    HashMap.forEach(multiTrie, (trie, lang) => {
      Trie.forEach(trie, (entry, key) => {
        const similarity = calculateSimilarity(term.toLowerCase(), key.toLowerCase())
        
        if (similarity >= threshold) {
          results.push({
            language: lang,
            term: key,
            similarity: Math.round(similarity * 100) / 100,
            translations: Object.fromEntries(entry.translations)
          })
        }
      })
    })

    return pipe(
      results,
      Arr.sort((a, b) => b.similarity - a.similarity),
      Arr.take(20)
    )
  }

  // Simple similarity calculation (Levenshtein distance based)
  const calculateSimilarity = (a: string, b: string): number => {
    if (a.length === 0) return b.length === 0 ? 1 : 0
    if (b.length === 0) return 0

    const matrix: number[][] = []
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    const maxLength = Math.max(a.length, b.length)
    return (maxLength - matrix[b.length][a.length]) / maxLength
  }

  return {
    addEntry,
    search,
    getTranslation,
    getSuggestionsWithFallback,
    getLanguageStats,
    findSimilarAcrossLanguages,
    supportedLanguages
  }
}

// Usage example
const multiLangDict = createMultiLanguageTrie()

// Add multilingual entries
multiLangDict.addEntry("en", "hello", {
  "en": "hello",
  "es": "hola", 
  "fr": "bonjour",
  "de": "hallo",
  "it": "ciao"
}, "greetings")

multiLangDict.addEntry("en", "goodbye", {
  "en": "goodbye",
  "es": "adiós",
  "fr": "au revoir", 
  "de": "auf wiedersehen",
  "it": "arrivederci"
}, "greetings")

multiLangDict.addEntry("en", "computer", {
  "en": "computer",
  "es": "computadora",
  "fr": "ordinateur",
  "de": "computer",
  "it": "computer"
}, "technology")

// Search in different languages
console.log("English search for 'comp':")
console.log(multiLangDict.search("en", "comp"))

console.log("\nSpanish search for 'hol':")
console.log(multiLangDict.search("es", "hol"))

console.log("\nFrench search for 'ord':")
console.log(multiLangDict.search("fr", "ord"))

// Get translation
const translation = multiLangDict.getTranslation("en", "es", "hello")
console.log("\nTranslation of 'hello' from English to Spanish:")
console.log(translation) // Option.some("hola")

// Multi-language fallback search
console.log("\nMulti-language search for 'hel' (prefer English, Spanish):")
console.log(multiLangDict.getSuggestionsWithFallback(["en", "es"], "hel"))

// Language statistics
console.log("\nLanguage statistics:")
console.log(multiLangDict.getLanguageStats())

// Find similar terms across languages
console.log("\nSimilar terms across languages for 'computer':")
console.log(multiLangDict.findSimilarAcrossLanguages("computer", 0.6))
```

## Integration Examples

### Integration with Effect Schema for Type-Safe Tries

```typescript
import { Trie, Schema, Effect, pipe } from "effect"

// Define schemas for type-safe Trie operations
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String, 
  email: Schema.String,
  age: Schema.Number,
  roles: Schema.Array(Schema.String)
})

const ProductSchema = Schema.Struct({
  sku: Schema.String,
  name: Schema.String,
  price: Schema.Number,
  category: Schema.String,
  tags: Schema.Array(Schema.String)
})

type User = Schema.Schema.Type<typeof UserSchema>
type Product = Schema.Schema.Type<typeof ProductSchema>

const createTypeSafeRepository = <T, A>(schema: Schema.Schema<T, A>) => {
  let trie = Trie.empty<T>()

  const add = (key: string, data: A) => Effect.gen(function* () {
    const validated = yield* Schema.decodeUnknown(schema)(data)
    trie = trie.pipe(Trie.insert(key.toLowerCase(), validated))
    return validated
  })

  const get = (key: string) =>
    pipe(
      Trie.get(trie, key.toLowerCase()),
      Effect.fromOption,
      Effect.mapError(() => `Entity not found: ${key}`)
    )

  const search = (prefix: string) => Effect.gen(function* () {
    const entries = Array.from(Trie.entriesWithPrefix(trie, prefix.toLowerCase()))
    return entries.map(([key, value]) => ({ key, value }))
  })

  const update = (key: string, updates: Partial<A>) => Effect.gen(function* () {
    const existing = yield* get(key)
    const merged = { ...existing, ...updates }
    const validated = yield* Schema.decodeUnknown(schema)(merged)
    trie = trie.pipe(Trie.modify(key.toLowerCase(), () => validated))
    return validated
  })

  const validate = (data: unknown) => Schema.decodeUnknown(schema)(data)

  return {
    add,
    get,
    search,
    update,
    validate,
    size: () => Trie.size(trie),
    getAllEntries: () => Array.from(Trie.entries(trie))
  }
}

// Usage example
const userRepo = createTypeSafeRepository(UserSchema)
const productRepo = createTypeSafeRepository(ProductSchema)

const program = Effect.gen(function* () {
  // Add users with validation
  const alice = yield* userRepo.add("alice", {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com", 
    age: 30,
    roles: ["user", "admin"]
  })

  const bob = yield* userRepo.add("bob", {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    age: 25,
    roles: ["user"]
  })

  // Add products
  yield* productRepo.add("laptop-001", {
    sku: "LAP001",
    name: "Gaming Laptop",
    price: 1299.99,
    category: "electronics",
    tags: ["gaming", "portable"]
  })

  // Search operations
  const aliceData = yield* userRepo.get("alice")
  const usersStartingWithB = yield* userRepo.search("b") 
  const electronics = yield* productRepo.search("laptop")

  return {
    alice: aliceData,
    bobUsers: usersStartingWithB,
    electronics
  }
})

// Run the program
Effect.runPromise(program).then(console.log).catch(console.error)
```

### Integration with Express.js for API Routing

```typescript
import { Trie, Option, Effect } from "effect"
import express from "express"

interface RouteConfig {
  method: string
  handler: express.RequestHandler
  middleware: express.RequestHandler[]
  params: string[]
}

const createEffectRouter = () => {
  let routeTrie = Trie.empty<RouteConfig>()
  const app = express()

  const addRoute = (
    method: string,
    path: string,
    handler: express.RequestHandler,
    middleware: express.RequestHandler[] = []
  ) => {
    const paramNames: string[] = []
    const normalizedPath = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName)
      return "*"
    })

    const routeKey = `${method.toUpperCase()}:${normalizedPath}`
    
    routeTrie = routeTrie.pipe(
      Trie.insert(routeKey, {
        method: method.toUpperCase(),
        handler,
        middleware,
        params: paramNames
      })
    )

    // Register with Express
    app[method.toLowerCase() as keyof express.Application](path, ...middleware, handler)
  }

  const findMatchingRoutes = (prefix: string) => {
    return Array.from(Trie.keysWithPrefix(routeTrie, prefix))
      .map(key => key.replace(/^[A-Z]+:/, ''))
  }

  const getRouteAnalytics = () => {
    const methodCounts = new Map<string, number>()
    const pathPrefixes = new Map<string, number>()
    
    Trie.forEach(routeTrie, (config, key) => {
      // Count by method
      methodCounts.set(config.method, (methodCounts.get(config.method) || 0) + 1)
      
      // Count by path prefix
      const pathPrefix = key.split(':')[1]?.split('/')[1] || 'root'
      pathPrefixes.set(pathPrefix, (pathPrefixes.get(pathPrefix) || 0) + 1)
    })

    return {
      totalRoutes: Trie.size(routeTrie),
      methodCounts: Object.fromEntries(methodCounts),
      pathPrefixes: Object.fromEntries(pathPrefixes)
    }
  }

  const listRoutes = () => {
    return Array.from(Trie.entries(routeTrie)).map(([key, config]) => ({
      route: key,
      method: config.method,
      hasMiddleware: config.middleware.length > 0,
      paramCount: config.params.length
    }))
  }

  return {
    app,
    addRoute,
    findMatchingRoutes,
    getRouteAnalytics,
    listRoutes
  }
}

// Usage example
const router = createEffectRouter()

// Add routes
router.addRoute("get", "/api/users", (req, res) => {
  res.json({ users: [] })
})

router.addRoute("get", "/api/users/:id", (req, res) => {
  res.json({ user: { id: req.params.id } })
})

router.addRoute("post", "/api/users", (req, res) => {
  res.status(201).json({ created: true })
})

router.addRoute("get", "/api/products/:productId/reviews", (req, res) => {
  res.json({ reviews: [], productId: req.params.productId })
})

// Analytics middleware
router.addRoute("get", "/api/admin/routes", (req, res) => {
  const analytics = router.getRouteAnalytics()
  const routes = router.listRoutes()
  
  res.json({
    analytics,
    routes
  })
})

// Find API routes
console.log("API routes:", router.findMatchingRoutes("GET:/api"))
console.log("User routes:", router.findMatchingRoutes("GET:/api/users"))

// Start server
const PORT = process.env.PORT || 3000
router.app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log("Route analytics:", router.getRouteAnalytics())
})
```

### Testing Strategies

```typescript
import { Trie, Option, Equal, Effect } from "effect"
import { describe, it, expect } from "vitest"

describe("Trie Operations", () => {
  describe("Basic Operations", () => {
    it("should insert and retrieve values", () => {
      const trie = Trie.empty<number>().pipe(
        Trie.insert("hello", 1),
        Trie.insert("world", 2)
      )

      expect(Trie.get(trie, "hello")).toEqual(Option.some(1))
      expect(Trie.get(trie, "world")).toEqual(Option.some(2))
      expect(Trie.get(trie, "missing")).toEqual(Option.none())
    })

    it("should handle empty trie correctly", () => {
      const trie = Trie.empty<string>()
      
      expect(Trie.isEmpty(trie)).toBe(true)
      expect(Trie.size(trie)).toBe(0)
      expect(Array.from(Trie.keys(trie))).toEqual([])
    })
  })

  describe("Prefix Operations", () => {
    const setupTrie = () => Trie.make(
      ["cat", 1],
      ["car", 2], 
      ["card", 3],
      ["care", 4],
      ["careful", 5],
      ["dog", 6]
    )

    it("should find keys with prefix", () => {
      const trie = setupTrie()
      
      const carResults = Array.from(Trie.keysWithPrefix(trie, "car"))
      expect(carResults).toContain("car")
      expect(carResults).toContain("card")
      expect(carResults).toContain("care")
      expect(carResults).toContain("careful")
      expect(carResults).not.toContain("cat")
      expect(carResults).not.toContain("dog")
    })

    it("should handle longest prefix matching", () => {
      const routeTrie = Trie.make(
        ["/api", "api"],
        ["/api/v1", "v1"],
        ["/api/v1/users", "users"]
      )

      expect(Trie.longestPrefixOf(routeTrie, "/api/v1/users/123"))
        .toEqual(Option.some(["/api/v1/users", "users"]))
      
      expect(Trie.longestPrefixOf(routeTrie, "/api/v1/posts"))
        .toEqual(Option.some(["/api/v1", "v1"]))
      
      expect(Trie.longestPrefixOf(routeTrie, "/public"))
        .toEqual(Option.none())
    })
  })

  describe("Functional Operations", () => {
    it("should map values correctly", () => {
      const trie = Trie.make(["a", 1], ["b", 2], ["c", 3])
      const doubled = Trie.map(trie, (value, key) => value * 2)
      
      expect(Trie.get(doubled, "a")).toEqual(Option.some(2))
      expect(Trie.get(doubled, "b")).toEqual(Option.some(4))
      expect(Trie.get(doubled, "c")).toEqual(Option.some(6))
    })

    it("should filter values correctly", () => {
      const trie = Trie.make(["a", 1], ["b", 2], ["c", 3], ["d", 4])
      const evens = Trie.filter(trie, (value, key) => value % 2 === 0)
      
      expect(Trie.has(evens, "a")).toBe(false)
      expect(Trie.has(evens, "b")).toBe(true)
      expect(Trie.has(evens, "c")).toBe(false)
      expect(Trie.has(evens, "d")).toBe(true)
    })

    it("should reduce values correctly", () => {
      const trie = Trie.make(["a", 1], ["b", 2], ["c", 3])
      
      const sum = Trie.reduce(trie, 0, (acc, value) => acc + value)
      expect(sum).toBe(6)
      
      const keyConcat = Trie.reduce(trie, "", (acc, value, key) => acc + key)
      expect(keyConcat).toBe("abc")
    })
  })

  describe("Performance Characteristics", () => {
    it("should handle large datasets efficiently", () => {
      const start = performance.now()
      
      // Create large trie
      let largeTrie = Trie.empty<number>()
      for (let i = 0; i < 10000; i++) {
        largeTrie = largeTrie.pipe(Trie.insert(`word${i}`, i))
      }
      
      const insertTime = performance.now() - start
      
      // Test lookup performance
      const lookupStart = performance.now()
      for (let i = 0; i < 1000; i++) {
        Trie.get(largeTrie, `word${Math.floor(Math.random() * 10000)}`)
      }
      const lookupTime = performance.now() - lookupStart
      
      // Test prefix search performance
      const prefixStart = performance.now()
      Array.from(Trie.keysWithPrefix(largeTrie, "word1"))
      const prefixTime = performance.now() - prefixStart
      
      console.log(`Insert time for 10k items: ${insertTime}ms`)
      console.log(`Lookup time for 1k operations: ${lookupTime}ms`)
      console.log(`Prefix search time: ${prefixTime}ms`)
      
      // Assertions for reasonable performance
      expect(insertTime).toBeLessThan(1000) // Less than 1 second
      expect(lookupTime).toBeLessThan(100)  // Less than 100ms
      expect(prefixTime).toBeLessThan(50)   // Less than 50ms
    })
  })

  describe("Property-Based Testing", () => {
    it("should maintain trie invariants", () => {
      // Property: inserting then retrieving should return the same value
      const testInsertRetrieve = (key: string, value: number) => {
        const trie = Trie.empty<number>().pipe(Trie.insert(key, value))
        return Option.getOrElse(Trie.get(trie, key), () => -1) === value
      }

      // Test with various inputs
      expect(testInsertRetrieve("test", 42)).toBe(true)
      expect(testInsertRetrieve("", 0)).toBe(true)
      expect(testInsertRetrieve("very-long-key-with-special-chars-123", 999)).toBe(true)
    })

    it("should maintain size invariants", () => {
      let trie = Trie.empty<number>()
      let expectedSize = 0
      
      // Insert unique keys
      const keys = ["a", "ab", "abc", "abcd", "b", "bc"]
      keys.forEach((key, index) => {
        trie = trie.pipe(Trie.insert(key, index))
        expectedSize++
        expect(Trie.size(trie)).toBe(expectedSize)
      })
      
      // Remove keys
      keys.slice(0, 3).forEach(key => {
        trie = trie.pipe(Trie.remove(key))
        expectedSize--
        expect(Trie.size(trie)).toBe(expectedSize)
      })
    })
  })
})

// Mock data generators for testing
const generateTestData = () => {
  const categories = ["tech", "science", "art", "music", "sports"]
  const prefixes = ["pre", "post", "anti", "re", "un", "over", "under"]
  const suffixes = ["tion", "ing", "ed", "er", "est", "ly", "ness"]
  
  const words: Array<[string, { category: string; frequency: number }]> = []
  
  for (let i = 0; i < 1000; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const word = `${prefix}word${i}${suffix}`
    const category = categories[Math.floor(Math.random() * categories.length)]
    const frequency = Math.floor(Math.random() * 100) + 1
    
    words.push([word, { category, frequency }])
  }
  
  return words
}

describe("Trie with Generated Data", () => {
  it("should handle randomly generated datasets", () => {
    const testData = generateTestData()
    let trie = Trie.fromIterable(testData)
    
    expect(Trie.size(trie)).toBe(testData.length)
    
    // Test random lookups
    for (let i = 0; i < 50; i++) {
      const randomEntry = testData[Math.floor(Math.random() * testData.length)]
      const [key, expectedValue] = randomEntry
      const actualValue = Trie.get(trie, key)
      
      expect(Option.isSome(actualValue)).toBe(true)
      if (Option.isSome(actualValue)) {
        expect(actualValue.value).toEqual(expectedValue)
      }
    }
    
    // Test prefix searches
    const prefixCounts = new Map<string, number>()
    testData.forEach(([word]) => {
      const prefix = word.slice(0, 3)
      prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1)
    })
    
    prefixCounts.forEach((expectedCount, prefix) => {
      const foundKeys = Array.from(Trie.keysWithPrefix(trie, prefix))
      expect(foundKeys.length).toBe(expectedCount)
    })
  })
})
```

## Conclusion

Trie provides efficient prefix-based string operations with O(k) performance characteristics, where k is the length of the search key. This makes it ideal for autocomplete systems, URL routing, spell checking, and hierarchical data organization.

Key benefits:
- **Optimal Performance**: O(k) lookup time regardless of dataset size, superior to hash maps for prefix operations
- **Memory Efficiency**: Structural sharing of common prefixes reduces memory overhead for large string datasets  
- **Rich API**: Comprehensive set of functional operations including map, filter, reduce, and prefix-specific methods
- **Type Safety**: Full integration with Effect's type system and composable with other Effect modules

Trie excels when you need fast prefix matching, autocomplete functionality, or efficient storage of hierarchical string data like file paths, URLs, or multi-level configuration keys.