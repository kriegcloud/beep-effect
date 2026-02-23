# Record: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Record Solves

Working with objects in TypeScript often leads to verbose, type-unsafe, and error-prone code when performing transformations, filtering, or aggregations. Traditional JavaScript approaches lack the functional programming primitives needed for clean data processing.

```typescript
// Traditional approach - verbose and error-prone
interface User {
  id: string
  name: string
  age: number
  isActive: boolean
}

const users = {
  "user1": { id: "user1", name: "Alice", age: 30, isActive: true },
  "user2": { id: "user2", name: "Bob", age: 25, isActive: false },
  "user3": { id: "user3", name: "Charlie", age: 35, isActive: true }
}

// Manual, imperative operations
const activeUsers: Record<string, User> = {}
for (const [key, user] of Object.entries(users)) {
  if (user.isActive) {
    activeUsers[key] = user
  }
}

const userNames: Record<string, string> = {}
for (const [key, user] of Object.entries(users)) {
  userNames[key] = user.name.toUpperCase()
}

// No type safety, verbose, repetitive patterns
```

This approach leads to:
- **Repetitive Boilerplate** - Manual iteration and mutation patterns
- **Type Safety Issues** - Object.entries loses type information
- **Error-Prone Operations** - Easy to introduce bugs in transformations
- **Poor Composability** - Hard to chain operations together
- **Imperative Style** - Focus on "how" rather than "what"

### The Record Solution

Effect's Record module provides a comprehensive set of type-safe, functional utilities for working with records (objects with string keys). It enables clean, composable transformations while preserving full type information.

```typescript
import { Record } from "effect"

// Clean, type-safe operations
const activeUsers = Record.filter(users, (user) => user.isActive)

const userNames = Record.map(users, (user) => user.name.toUpperCase())

// Chainable, composable, type-safe
const processedData = pipe(
  Record.filter(users, (user) => user.age >= 30),
  Record.map((user) => ({ ...user, displayName: user.name.toUpperCase() })),
  Record.collect((key, user) => ({ id: key, ...user }))
)
```

### Key Concepts

**Record<K, V>**: A type-safe object with keys of type K and values of type V

**Transformation Operations**: Functions like `map`, `filter`, and `filterMap` that transform records while preserving structure

**Aggregation Operations**: Functions like `reduce`, `collect`, and `partition` that aggregate or restructure record data

**Set Operations**: Functions like `union`, `intersection`, and `difference` for combining records

## Basic Usage Patterns

### Pattern 1: Creating and Basic Access

```typescript
import { Record } from "effect"

// Creating records
const userSettings = Record.fromEntries([
  ["theme", "dark"],
  ["language", "en"],
  ["notifications", true]
])

// Basic access operations
const theme = Record.get(userSettings, "theme") // Option<string>
const hasTheme = Record.has(userSettings, "theme") // boolean
const keys = Record.keys(userSettings) // Array<string>
const values = Record.values(userSettings) // Array<string | boolean>
const size = Record.size(userSettings) // number
```

### Pattern 2: Core Transformations

```typescript
import { Record, pipe } from "effect"

const products = {
  "p1": { name: "Laptop", price: 999, category: "electronics" },
  "p2": { name: "Book", price: 29, category: "books" },
  "p3": { name: "Phone", price: 599, category: "electronics" }
}

// Map values while preserving keys
const discountedPrices = Record.map(products, (product) => product.price * 0.9)

// Filter records based on conditions
const electronics = Record.filter(products, (product) => product.category === "electronics")

// Transform to arrays for processing
const productList = Record.collect(products, (id, product) => ({ id, ...product }))
```

### Pattern 3: Common Operations

```typescript
import { Record, pipe, Option } from "effect"

const inventory = {
  "item1": { quantity: 10, minStock: 5 },
  "item2": { quantity: 2, minStock: 5 },
  "item3": { quantity: 15, minStock: 10 }
}

// Check conditions across all entries
const allInStock = Record.every(inventory, (item) => item.quantity > 0)
const hasLowStock = Record.some(inventory, (item) => item.quantity < item.minStock)

// Find specific entries
const firstLowStock = Record.findFirst(inventory, (item) => item.quantity < item.minStock)

// Reduce to summary data
const totalQuantity = Record.reduce(inventory, 0, (total, item) => total + item.quantity)
```

## Real-World Examples

### Example 1: User Configuration Management

Managing user preferences and settings across different modules in an application.

```typescript
import { Record, pipe, Effect, Option, Either } from "effect"

interface UserPreferences {
  theme: "light" | "dark"
  language: string
  notifications: boolean
  timezone: string
}

interface AppSettings {
  cacheSize: number
  apiTimeout: number
  debugMode: boolean
}

// Configuration service that manages user and app settings
export const ConfigurationService = {
  getUserSettings: (userId: string) => Effect.gen(function* () {
    const preferences = yield* fetchUserPreferences(userId)
    const appSettings = yield* getAppSettings()
    
    // Merge user preferences with app defaults
    const mergedConfig = Record.union(
      preferences,
      appSettings,
      (userValue, appValue) => userValue // User preferences take precedence
    )
    
    return mergedConfig
  }),

  updateUserSettings: (userId: string, updates: Partial<UserPreferences>) => 
    Effect.gen(function* () {
      const currentSettings = yield* fetchUserPreferences(userId)
      
      // Selectively update only provided settings
      const validUpdates = Record.filterMap(updates, (value, key) => 
        value !== undefined ? Option.some(value) : Option.none()
      )
      
      const updatedSettings = Record.union(currentSettings, validUpdates, (_, newValue) => newValue)
      
      return yield* saveUserPreferences(userId, updatedSettings)
    }),

  validateSettings: (settings: Record<string, unknown>) => Effect.gen(function* () {
    // Extract and validate different setting categories
    const [validSettings, invalidSettings] = Record.partitionMap(settings, (value, key) => {
      const validation = validateSettingValue(key, value)
      return validation.isValid 
        ? Either.right({ key, value: validation.value })
        : Either.left({ key, error: validation.error })
    })
    
    if (Record.size(invalidSettings) > 0) {
      const errors = Record.collect(invalidSettings, (key, error) => `${key}: ${error}`)
      return yield* Effect.fail(new ConfigurationError(`Invalid settings: ${errors.join(", ")}`))
    }
    
    return validSettings
  })
}

// Helper functions for the service
const fetchUserPreferences = (userId: string): Effect.Effect<Record<string, any>, DatabaseError, Database> =>
  Effect.gen(function* () {
    const db = yield* Database
    return yield* db.getUserPreferences(userId)
  })

const getAppSettings = (): Effect.Effect<Record<string, any>, never, never> =>
  Effect.succeed({
    cacheSize: 100,
    apiTimeout: 5000,
    debugMode: false
  })

class ConfigurationError extends Error {
  readonly _tag = "ConfigurationError"
}

class DatabaseError extends Error {
  readonly _tag = "DatabaseError"
}
```

### Example 2: API Response Transformation

Processing and normalizing API responses from different sources with varying data structures.

```typescript
import { Record, pipe, Effect, Option, Either } from "effect"

interface RawApiUser {
  user_id: string
  full_name: string
  email_address: string
  is_verified: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

interface NormalizedUser {
  id: string
  name: string
  email: string
  verified: boolean
  createdAt: Date
  profile: Record<string, string>
}

export const ApiTransformationService = {
  // Transform multiple API responses into normalized format
  normalizeUsers: (responses: Record<string, RawApiUser[]>) => Effect.gen(function* () {
    const normalizedBySource = Record.map(responses, (users) => 
      users.map(transformUser).filter(user => user !== null)
    )

    // Merge users from different sources, handling conflicts
    const allUsers = Record.reduce(
      normalizedBySource,
      {} as Record<string, NormalizedUser>,
      (merged, users, source) => {
        const usersByEmail = users.reduce((acc, user) => {
          acc[user.email] = { ...user, source }
          return acc
        }, {} as Record<string, NormalizedUser & { source: string }>)
        
        return Record.union(merged, usersByEmail, (existing, incoming) => ({
          ...existing,
          // Keep most recent user based on creation date
          ...(incoming.createdAt > existing.createdAt ? incoming : existing),
          sources: [...(existing.sources || [existing.source]), incoming.source]
        }))
      }
    )

    return allUsers
  }),

  // Group users by domain and generate analytics
  generateUserAnalytics: (users: Record<string, NormalizedUser>) => Effect.gen(function* () {
    // Group users by email domain
    const entries = Record.collect(users, (id, user) => ({
      domain: user.email.split('@')[1],
      user
    }))
    
    const usersByDomain = entries.reduce((acc, { domain, user }) => {
      if (!acc[domain]) acc[domain] = []
      acc[domain].push(user)
      return acc
    }, {} as Record<string, NormalizedUser[]>)

    // Generate domain statistics
    const domainStats = Record.map(usersByDomain, (domainUsers) => ({
      totalUsers: domainUsers.length,
      verifiedUsers: domainUsers.filter(u => u.verified).length,
      averageAccountAge: domainUsers.reduce((sum, u) => 
        sum + (Date.now() - u.createdAt.getTime()), 0) / domainUsers.length,
      profileCompleteness: domainUsers.map(u => 
        Record.size(u.profile) / 5 * 100 // Assuming 5 profile fields max
      ).reduce((sum, score) => sum + score, 0) / domainUsers.length
    }))

    const topDomains = pipe(
      Record.collect(domainStats, (domain, stats) => ({ domain, ...stats })),
      (domains) => domains.sort((a, b) => b.totalUsers - a.totalUsers).slice(0, 10)
    )

    return {
      usersByDomain,
      domainStats,
      totalUsers: Record.size(users),
      topDomains
    }
  }),

  // Clean and validate user profile data
  sanitizeProfiles: (users: Record<string, NormalizedUser>) => Effect.gen(function* () {
    const sanitizedUsers = Record.filterMap(users, (user, id) => {
      // Clean profile data
      const cleanProfile = Record.filterMap(user.profile, (value, key) => {
        // Remove empty or invalid profile entries
        if (typeof value !== 'string' || value.trim() === '') {
          return Option.none()
        }
        
        // Sanitize profile values
        const sanitized = sanitizeProfileValue(key, value)
        return sanitized ? Option.some(sanitized) : Option.none()
      })

      // Only include users with valid email and some profile data
      if (!isValidEmail(user.email) || Record.size(cleanProfile) === 0) {
        return Option.none()
      }

      return Option.some({
        ...user,
        profile: cleanProfile
      })
    })

    return sanitizedUsers
  })
}

// Helper functions
const transformUser = (raw: RawApiUser): NormalizedUser | null => {
  try {
    const metadataProfile = Record.filterMap(raw.metadata || {}, (value, key) => 
      typeof value === 'string' ? Option.some(value) : Option.none()
    )

    return {
      id: raw.user_id,
      name: raw.full_name,
      email: raw.email_address,
      verified: raw.is_verified,
      createdAt: new Date(raw.created_at),
      profile: metadataProfile
    }
  } catch {
    return null
  }
}

const sanitizeProfileValue = (key: string, value: string): string | null => {
  // Implementation would depend on specific sanitization rules
  return value.trim().length > 0 ? value.trim() : null
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

### Example 3: Feature Flag Management System

A comprehensive feature flag system that manages different flag types and user segments.

```typescript
import { Record, pipe, Effect, Option, Either } from "effect"

interface FeatureFlag {
  name: string
  enabled: boolean
  rolloutPercentage: number
  userSegments: string[]
  metadata: Record<string, string>
  expiresAt?: Date
}

interface UserContext {
  userId: string
  userSegment: string
  properties: Record<string, string | number | boolean>
}

export const FeatureFlagService = {
  // Evaluate all feature flags for a user
  evaluateFlags: (
    flags: Record<string, FeatureFlag>, 
    userContext: UserContext
  ) => Effect.gen(function* () {
    const evaluatedFlags = Record.filterMap(flags, (flag, flagName) => {
      // Skip expired flags
      if (flag.expiresAt && flag.expiresAt < new Date()) {
        return Option.none()
      }

      const isEnabled = evaluateFlag(flag, userContext)
      return Option.some({
        name: flagName,
        enabled: isEnabled,
        reason: getEvaluationReason(flag, userContext, isEnabled)
      })
    })

    // Log flag evaluations for analytics
    yield* logFlagEvaluations(userContext.userId, evaluatedFlags)

    return evaluatedFlags
  }),

  // Batch update multiple feature flags
  updateFlags: (
    currentFlags: Record<string, FeatureFlag>,
    updates: Record<string, Partial<FeatureFlag>>
  ) => Effect.gen(function* () {
    // Validate all updates before applying
    const validationResults = Record.map(updates, (update, flagName) => 
      validateFlagUpdate(flagName, update)
    )

    // Separate valid and invalid updates
    const [validUpdates, invalidUpdates] = Record.partitionMap(validationResults, (result, flagName) =>
      result.isValid 
        ? Either.right({ flagName, update: result.validatedUpdate })
        : Either.left({ flagName, errors: result.errors })
    )

    // Return early if there are validation errors
    if (Record.size(invalidUpdates) > 0) {
      const errorMessages = Record.collect(invalidUpdates, (flagName, { errors }) => 
        `${flagName}: ${errors.join(", ")}`
      )
      return yield* Effect.fail(
        new ValidationError(`Flag validation failed: ${errorMessages.join(", ")}`)
      )
    }

    // Apply valid updates
    const updatedFlags = Record.reduce(
      validUpdates,
      currentFlags,
      (flags, { flagName, update }) => 
        Record.modify(flags, flagName, (existingFlag) => ({
          ...existingFlag,
          ...update,
          // Ensure metadata is properly merged
          metadata: { ...existingFlag.metadata, ...update.metadata }
        }))
    )

    // Audit the changes
    yield* auditFlagChanges(currentFlags, updatedFlags)

    return updatedFlags
  }),

  // Generate feature flag analytics
  generateAnalytics: (
    flags: Record<string, FeatureFlag>,
    evaluationLogs: Record<string, Array<{ userId: string; enabled: boolean; timestamp: Date }>>
  ) => Effect.gen(function* () {
    const analytics = Record.map(flags, (flag, flagName) => {
      const logs = evaluationLogs[flagName] || []
      const recentLogs = logs.filter(log => 
        log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      )

      return {
        flagName,
        configuration: {
          enabled: flag.enabled,
          rolloutPercentage: flag.rolloutPercentage,
          targetSegments: flag.userSegments.length
        },
        usage: {
          totalEvaluations: recentLogs.length,
          enabledEvaluations: recentLogs.filter(log => log.enabled).length,
          uniqueUsers: new Set(recentLogs.map(log => log.userId)).size,
          enablementRate: recentLogs.length > 0 
            ? recentLogs.filter(log => log.enabled).length / recentLogs.length 
            : 0
        }
      }
    })

    // Identify underutilized or problematic flags
    const insights = Record.filterMap(analytics, (data, flagName) => {
      const insights: string[] = []
      
      if (data.usage.totalEvaluations === 0) {
        insights.push("No recent usage")
      }
      
      if (data.configuration.enabled && data.usage.enablementRate < 0.1) {
        insights.push("Low enablement rate despite being enabled")
      }
      
      if (data.usage.uniqueUsers < 10 && data.configuration.rolloutPercentage > 50) {
        insights.push("High rollout percentage but low user reach")
      }

      return insights.length > 0 ? Option.some(insights) : Option.none()
    })

    return { analytics, insights }
  })
}

// Helper functions
const evaluateFlag = (flag: FeatureFlag, userContext: UserContext): boolean => {
  if (!flag.enabled) return false
  
  // Check user segment
  if (flag.userSegments.length > 0 && !flag.userSegments.includes(userContext.userSegment)) {
    return false
  }
  
  // Check rollout percentage
  const hash = hashString(flag.name + userContext.userId)
  const userPercentile = Math.abs(hash) % 100
  
  return userPercentile < flag.rolloutPercentage
}

const getEvaluationReason = (
  flag: FeatureFlag, 
  userContext: UserContext, 
  enabled: boolean
): string => {
  if (!flag.enabled) return "Flag disabled"
  if (flag.userSegments.length > 0 && !flag.userSegments.includes(userContext.userSegment)) {
    return "User not in target segment"
  }
  if (!enabled) return "User not in rollout percentage"
  return "Flag enabled for user"
}

const validateFlagUpdate = (
  flagName: string, 
  update: Partial<FeatureFlag>
): { isValid: boolean; validatedUpdate?: Partial<FeatureFlag>; errors: string[] } => {
  // Implementation would include comprehensive validation logic
  const errors: string[] = []
  
  if (update.rolloutPercentage !== undefined && 
      (update.rolloutPercentage < 0 || update.rolloutPercentage > 100)) {
    errors.push("Rollout percentage must be between 0 and 100")
  }
  
  return errors.length === 0 
    ? { isValid: true, validatedUpdate: update }
    : { isValid: false, errors }
}

const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

const logFlagEvaluations = (
  userId: string, 
  flags: Record<string, any>
): Effect.Effect<void, never, Logger> => Effect.gen(function* () {
  const logger = yield* Logger
  yield* logger.info("Flag evaluations", { userId, flags })
})

const auditFlagChanges = (
  oldFlags: Record<string, FeatureFlag>,
  newFlags: Record<string, FeatureFlag>
): Effect.Effect<void, never, AuditService> => Effect.gen(function* () {
  const auditService = yield* AuditService
  yield* auditService.logChanges("feature_flags", oldFlags, newFlags)
})

class ValidationError extends Error {
  readonly _tag = "ValidationError"
}
```

## Advanced Features Deep Dive

### Set Operations: Union, Intersection, and Difference

Record provides powerful set operations for combining and comparing records.

#### Basic Set Operations Usage

```typescript
import { Record, pipe } from "effect"

const userPermissions = {
  "read": true,
  "write": false,
  "delete": false
}

const rolePermissions = {
  "write": true,
  "admin": true,
  "delete": true
}

// Union - combine permissions, with custom conflict resolution
const mergedPermissions = Record.union(
  userPermissions,
  rolePermissions,
  (userPerm, rolePerm) => userPerm || rolePerm
)
// Result: { read: true, write: true, delete: true, admin: true }

// Intersection - only common keys
const commonPermissions = Record.intersection(
  userPermissions,
  rolePermissions,
  (userPerm, rolePerm) => userPerm && rolePerm
)
// Result: { write: false, delete: false }

// Difference - keys in first record but not in second
const uniqueUserPermissions = Record.difference(userPermissions, rolePermissions)
// Result: { read: true }
```

#### Real-World Set Operations Example

```typescript
import { Record, pipe, Effect } from "effect"

interface ResourceAccess {
  level: "read" | "write" | "admin"
  granted: boolean
  expires?: Date
}

export const AccessControlService = {
  mergeAccessPolicies: (
    userAccess: Record<string, ResourceAccess>,
    groupAccess: Record<string, ResourceAccess>,
    roleAccess: Record<string, ResourceAccess>
  ) => Effect.gen(function* () {
    // Step 1: Merge user and group access (user takes precedence)
    const userGroupAccess = Record.union(userAccess, groupAccess, (userAccess, groupAccess) => {
      // User access overrides group access
      if (userAccess.level === "admin") return userAccess
      
      // Use higher permission level
      const levels = { read: 1, write: 2, admin: 3 }
      return levels[userAccess.level] >= levels[groupAccess.level] 
        ? userAccess 
        : groupAccess
    })

    // Step 2: Apply role-based access (additive permissions)
    const finalAccess = Record.union(userGroupAccess, roleAccess, (existing, roleAccess) => ({
      level: maxPermissionLevel(existing.level, roleAccess.level),
      granted: existing.granted || roleAccess.granted,
      expires: minDate(existing.expires, roleAccess.expires)
    }))

    // Step 3: Filter out expired permissions
    const activeAccess = Record.filter(finalAccess, (access) => 
      !access.expires || access.expires > new Date()
    )

    return activeAccess
  }),

  // Find resources with conflicting access levels
  detectAccessConflicts: (
    policies: Record<string, Record<string, ResourceAccess>>
  ) => Effect.gen(function* () {
    // Get all unique resource names across all policies
    const allResources = Record.reduce(policies, new Set<string>(), (resources, policy) => {
      Record.keys(policy).forEach(resource => resources.add(resource))
      return resources
    })

    const conflicts = Array.from(allResources).reduce((acc, resource) => {
      const resourcePolicies = Record.filterMap(policies, (policy, policyName) => 
        Record.has(policy, resource) 
          ? Option.some({ policyName, access: Record.get(policy, resource) })
          : Option.none()
      )

      // Check for conflicts in permission levels
      const accessLevels = pipe(
        Record.values(resourcePolicies),
        (accesses) => new Set(accesses.map(a => a.level))
      )

      if (accessLevels.size > 1) {
        acc[resource] = resourcePolicies
      }

      return acc
    }, {} as Record<string, Record<string, { policyName: string; access: ResourceAccess }>>)

    return conflicts
  })
}

const maxPermissionLevel = (a: "read" | "write" | "admin", b: "read" | "write" | "admin") => {
  const levels = { read: 1, write: 2, admin: 3 }
  return levels[a] >= levels[b] ? a : b
}

const minDate = (a?: Date, b?: Date): Date | undefined => {
  if (!a) return b
  if (!b) return a
  return a < b ? a : b
}
```

### Advanced Filtering: FilterMap and PartitionMap

These operations combine filtering with transformation, providing powerful data processing capabilities.

#### Basic FilterMap and PartitionMap Usage

```typescript
import { Record, pipe, Option, Either } from "effect"

const rawData = {
  "item1": "valid:100",
  "item2": "invalid",
  "item3": "valid:250",
  "item4": "",
  "item5": "valid:75"
}

// FilterMap - transform and filter in one operation
const parsedValidItems = Record.filterMap(rawData, (value, key) => {
  if (!value.startsWith("valid:")) return Option.none()
  
  const numericValue = parseInt(value.split(":")[1])
  return isNaN(numericValue) 
    ? Option.none() 
    : Option.some({ key, value: numericValue })
})
// Result: { item1: { key: "item1", value: 100 }, item3: { key: "item3", value: 250 }, item5: { key: "item5", value: 75 } }

// PartitionMap - split into two records based on Either
const categorizedData = Record.partitionMap(rawData, (value, key) => {
  if (!value.startsWith("valid:")) {
    return Either.left({ key, error: "Invalid format" })
  }
  
  const numericValue = parseInt(value.split(":")[1])
  return isNaN(numericValue)
    ? Either.left({ key, error: "Invalid number" })
    : Either.right({ key, value: numericValue })
})
// Result: [
//   { item2: { key: "item2", error: "Invalid format" }, item4: { key: "item4", error: "Invalid format" } }, // errors
//   { item1: { key: "item1", value: 100 }, item3: { key: "item3", value: 250 }, item5: { key: "item5", value: 75 } } // success
// ]
```

#### Advanced FilterMap: Data Validation Pipeline

```typescript
import { Record, pipe, Option, Effect, Schema } from "effect"

interface RawEvent {
  timestamp: string
  eventType: string
  payload: string
  userId?: string
}

interface ValidatedEvent {
  timestamp: Date
  eventType: string
  payload: Record<string, unknown>
  userId: string
}

export const EventProcessingService = {
  processEventBatch: (events: Record<string, RawEvent>) => Effect.gen(function* () {
    // FilterMap to validate and transform events
    const processedEvents = Record.filterMap(events, (event, eventId) => 
      validateAndTransformEvent(event, eventId)
    )

    // Separate processing for different event types
    const eventsByType = Record.reduce(
      processedEvents,
      {} as Record<string, ValidatedEvent[]>,
      (acc, event) => {
        if (!acc[event.eventType]) acc[event.eventType] = []
        acc[event.eventType].push(event)
        return acc
      }
    )

    // Generate processing summary
    const summary = Record.map(eventsByType, (events) => ({
      count: events.length,
      timeRange: {
        earliest: Math.min(...events.map(e => e.timestamp.getTime())),
        latest: Math.max(...events.map(e => e.timestamp.getTime()))
      },
      uniqueUsers: new Set(events.map(e => e.userId)).size
    }))

    return {
      processedEvents: eventsByType,
      summary: {
        totalProcessed: Record.size(processedEvents),
        totalInput: Record.size(events),
        processingRate: Record.size(processedEvents) / Record.size(events),
        eventTypes: summary
      }
    }
  }),

  // Advanced data cleaning with multiple validation stages
  cleanAndValidateDataset: (
    dataset: Record<string, Record<string, unknown>>
  ) => Effect.gen(function* () {
    // Stage 1: Basic validation and type coercion
    const stage1Results = Record.partitionMap(dataset, (record, recordId) => {
      const validationResult = performBasicValidation(record)
      return validationResult.isValid
        ? Either.right({ recordId, data: validationResult.data })
        : Either.left({ recordId, errors: validationResult.errors })
    })

    const [stage1Errors, stage1Valid] = stage1Results

    // Stage 2: Business rule validation on valid records
    const stage2Results = Record.partitionMap(stage1Valid, ({ recordId, data }) => {
      const businessValidation = performBusinessValidation(data)
      return businessValidation.isValid
        ? Either.right({ recordId, data: businessValidation.cleanedData })
        : Either.left({ recordId, errors: businessValidation.errors })
    })

    const [stage2Errors, finalValid] = stage2Results

    // Stage 3: Enrich valid data
    const enrichedData = Record.filterMap(finalValid, ({ recordId, data }) => {
      const enrichmentResult = enrichData(data)
      return enrichmentResult.success 
        ? Option.some(enrichmentResult.enrichedData)
        : Option.none()
    })

    return {
      validData: enrichedData,
      errors: {
        stage1: stage1Errors,
        stage2: stage2Errors,
        totalErrorCount: Record.size(stage1Errors) + Record.size(stage2Errors)
      },
      statistics: {
        inputCount: Record.size(dataset),
        validCount: Record.size(enrichedData),
        errorRate: (Record.size(stage1Errors) + Record.size(stage2Errors)) / Record.size(dataset)
      }
    }
  })
}

// Helper functions for validation
const validateAndTransformEvent = (event: RawEvent, eventId: string): Option.Option<ValidatedEvent> => {
  try {
    const timestamp = new Date(event.timestamp)
    if (isNaN(timestamp.getTime())) return Option.none()

    if (!event.eventType || !event.payload) return Option.none()

    const payload = JSON.parse(event.payload)
    if (typeof payload !== 'object') return Option.none()

    const userId = event.userId || payload.userId || payload.user_id
    if (!userId) return Option.none()

    return Option.some({
      timestamp,
      eventType: event.eventType,
      payload,
      userId: String(userId)
    })
  } catch {
    return Option.none()
  }
}

interface ValidationResult {
  isValid: boolean
  data?: Record<string, unknown>
  cleanedData?: Record<string, unknown>
  errors: string[]
}

const performBasicValidation = (record: Record<string, unknown>): ValidationResult => {
  // Implementation would include comprehensive validation logic
  return { isValid: true, data: record, errors: [] }
}

const performBusinessValidation = (data: Record<string, unknown>): ValidationResult => {
  // Implementation would include business rule validation
  return { isValid: true, cleanedData: data, errors: [] }
}

const enrichData = (data: Record<string, unknown>): { success: boolean; enrichedData?: Record<string, unknown> } => {
  // Implementation would include data enrichment logic
  return { success: true, enrichedData: data }
}
```

### Record Aggregation and Collection Patterns

Advanced patterns for aggregating, grouping, and collecting data from records.

#### Collect Pattern for Data Transformation

```typescript
import { Record, pipe, Array as Arr } from "effect"

const salesData = {
  "Q1-2024": { revenue: 100000, customers: 250, region: "north" },
  "Q2-2024": { revenue: 120000, customers: 300, region: "north" },
  "Q3-2024": { revenue: 95000, customers: 220, region: "south" },
  "Q4-2024": { revenue: 150000, customers: 400, region: "south" }
}

// Collect to create structured data for analysis
const quarterlyReport = pipe(
  Record.collect(salesData, (quarter, data) => ({
    quarter,
    ...data,
    revenuePerCustomer: data.revenue / data.customers,
    quarterNumber: parseInt(quarter.split("-")[0].substring(1))
  })),
  Arr.sort((a, b) => a.quarterNumber - b.quarterNumber)
)

// Group and aggregate by region
const regionalAnalysis = pipe(
  Record.collect(salesData, (quarter, data) => ({ quarter, ...data })),
  (quarters) => quarters.reduce((acc, quarter) => {
    if (!acc[quarter.region]) {
      acc[quarter.region] = {
        totalRevenue: 0,
        totalCustomers: 0,
        quarters: []
      }
    }
    
    acc[quarter.region].totalRevenue += quarter.revenue
    acc[quarter.region].totalCustomers += quarter.customers
    acc[quarter.region].quarters.push(quarter.quarter)
    
    return acc
  }, {} as Record<string, { totalRevenue: number; totalCustomers: number; quarters: string[] }>)
)
```

## Practical Patterns & Best Practices

### Pattern 1: Safe Record Access with Option Types

```typescript
import { Record, pipe, Option, Effect } from "effect"

// Helper for safe record operations that might fail
export const SafeRecordUtils = {
  // Safe nested property access
  getNestedValue: <T>(
    record: Record<string, unknown>,
    path: string[]
  ): Option.Option<T> => {
    return path.reduce(
      (current: Option.Option<unknown>, key: string) =>
        pipe(
          current,
          Option.flatMap((obj) => 
            typeof obj === 'object' && obj !== null && key in obj
              ? Option.some((obj as any)[key])
              : Option.none()
          )
        ),
      Option.some(record)
    ) as Option.Option<T>
  },

  // Safe record merge with validation
  safeMerge: <T>(
    target: Record<string, T>,
    source: Record<string, unknown>,
    validator: (value: unknown) => value is T
  ) => Effect.gen(function* () {
    const validatedSource = Record.filterMap(source, (value, key) => 
      validator(value) ? Option.some(value) : Option.none()
    )

    return Record.union(target, validatedSource, (existing, incoming) => incoming)
  }),

  // Safe type conversion with fallbacks
  convertRecord: <A, B>(
    record: Record<string, A>,
    converter: (value: A) => Option.Option<B>,
    defaultValue: B
  ): Record<string, B> => Record.map(record, (value) => pipe(
    converter(value),
    Option.getOrElse(() => defaultValue)
  ))
}

// Usage example
const userPreferences = {
  "theme": "dark",
  "language": "en",
  "notifications": { email: true, push: false },
  "advanced": { debugMode: "true", timeout: "5000" }
}

// Safe nested access
const emailNotifications = SafeRecordUtils.getNestedValue<boolean>(
  userPreferences,
  ["notifications", "email"]
)

// Safe conversion with validation
const advancedSettings = SafeRecordUtils.convertRecord(
  userPreferences.advanced as Record<string, string>,
  (value) => {
    if (value === "true") return Option.some(true)
    if (value === "false") return Option.some(false)
    const num = parseInt(value)
    return isNaN(num) ? Option.none() : Option.some(num)
  },
  null
)
```

### Pattern 2: Record-Based State Management

```typescript
import { Record, pipe, Effect, Ref } from "effect"

interface ApplicationState {
  user: { id: string; name: string; preferences: Record<string, unknown> }
  ui: { theme: string; sidebarOpen: boolean; notifications: Array<unknown> }
  data: { cache: Record<string, unknown>; loading: Record<string, boolean> }
}

export const StateManager = {
  // Create a managed state record
  createState: <T>(initialState: T) => Effect.gen(function* () {
    const stateRef = yield* Ref.make(initialState)
    
    return {
      get: Ref.get(stateRef),
      
      // Update specific nested properties
      updatePath: <K extends keyof T>(path: K[], updater: (current: T[K]) => T[K]) =>
        Effect.gen(function* () {
          const state = yield* Ref.get(stateRef)
          const updated = updateNestedProperty(state as any, path, updater)
          yield* Ref.set(stateRef, updated)
        }),
      
      // Merge records at specific paths
      mergeAtPath: <K extends keyof T>(path: K[], updates: Partial<T[K]>) =>
        Effect.gen(function* () {
          const state = yield* Ref.get(stateRef)
          const currentValue = getNestedProperty(state as any, path)
          if (typeof currentValue === 'object' && currentValue !== null) {
            const merged = { ...currentValue, ...updates }
            const updated = setNestedProperty(state as any, path, merged)
            yield* Ref.set(stateRef, updated)
          }
        }),
      
      // Batch multiple updates
      batchUpdate: (updates: Array<() => Effect.Effect<void, never, never>>) =>
        Effect.all(updates, { concurrency: 1 }).pipe(Effect.asVoid)
    }
  }),

  // Create selectors for computed state
  createSelectors: <T>(stateEffect: Effect.Effect<T, never, never>) => ({
    // Select and transform part of state
    select: <R>(selector: (state: T) => R) =>
      stateEffect.pipe(Effect.map(selector)),
    
    // Select record entries matching criteria
    selectWhere: <K extends keyof T>(
      key: K,
      predicate: (value: T[K][keyof T[K]], key: keyof T[K]) => boolean
    ) => stateEffect.pipe(
      Effect.map((state) => {
        const record = state[key]
        if (typeof record === 'object' && record !== null) {
          return Record.filter(record as Record<string, any>, predicate)
        }
        return {}
      })
    ),
    
    // Aggregate data from state
    aggregate: <K extends keyof T, R>(
      key: K,
      aggregator: (record: T[K]) => R
    ) => stateEffect.pipe(
      Effect.map((state) => aggregator(state[key]))
    )
  })
}

// Example usage
const createAppStateManager = () => Effect.gen(function* () {
  const stateManager = yield* StateManager.createState<ApplicationState>({
    user: { id: "", name: "", preferences: {} },
    ui: { theme: "light", sidebarOpen: true, notifications: [] },
    data: { cache: {}, loading: {} }
  })

  const selectors = StateManager.createSelectors(stateManager.get)

  return {
    // State updates
    setUserPreference: (key: string, value: unknown) =>
      stateManager.mergeAtPath(["user", "preferences"], { [key]: value }),
    
    setLoadingState: (operation: string, loading: boolean) =>
      stateManager.mergeAtPath(["data", "loading"], { [operation]: loading }),
    
    // State selectors
    getLoadingOperations: selectors.selectWhere("data", (loading) => loading === true),
    
    getUserPreferences: selectors.select((state) => state.user.preferences),
    
    // Computed values
    getActiveNotifications: selectors.select((state) => 
      state.ui.notifications.filter((n: any) => !n.dismissed)
    )
  }
})

// Helper functions for nested property access
const getNestedProperty = (obj: any, path: string[]): any => {
  return path.reduce((current, key) => current?.[key], obj)
}

const setNestedProperty = (obj: any, path: string[], value: any): any => {
  if (path.length === 0) return value
  
  const [head, ...tail] = path
  return {
    ...obj,
    [head]: setNestedProperty(obj[head] || {}, tail, value)
  }
}

const updateNestedProperty = (obj: any, path: string[], updater: (current: any) => any): any => {
  if (path.length === 0) return updater(obj)
  
  const [head, ...tail] = path
  return {
    ...obj,
    [head]: updateNestedProperty(obj[head] || {}, tail, updater)
  }
}
```

### Pattern 3: Record-Based Caching and Memoization

```typescript
import { Record, pipe, Effect, Ref, Duration } from "effect"

interface CacheEntry<T> {
  value: T
  timestamp: number
  hits: number
  ttl?: number
}

export const RecordCache = {
  // Create a record-based cache with TTL support
  create: <K extends string, V>(defaultTtl?: number) => Effect.gen(function* () {
    const cacheRef = yield* Ref.make({} as Record<K, CacheEntry<V>>)
    
    return {
      // Get value from cache
      get: (key: K) => Effect.gen(function* () {
        const cache = yield* Ref.get(cacheRef)
        const entry = Record.get(cache, key)
        
        return pipe(
          entry,
          Option.flatMap((entry) => {
            const now = Date.now()
            const isExpired = entry.ttl && (now - entry.timestamp) > entry.ttl
            
            if (isExpired) {
              return Option.none()
            }
            
            // Update hit count
            return Effect.gen(function* () {
              yield* Ref.update(cacheRef, (cache) =>
                Record.modify(cache, key, (entry) => ({
                  ...entry,
                  hits: entry.hits + 1
                }))
              )
              return Option.some(entry.value)
            }).pipe(Effect.flatten)
          })
        )
      }),
      
      // Set value in cache
      set: (key: K, value: V, customTtl?: number) => Effect.gen(function* () {
        const entry: CacheEntry<V> = {
          value,
          timestamp: Date.now(),
          hits: 0,
          ttl: customTtl || defaultTtl
        }
        
        yield* Ref.update(cacheRef, (cache) => Record.set(cache, key, entry))
      }),
      
      // Get or compute value
      getOrCompute: (
        key: K, 
        compute: () => Effect.Effect<V, never, never>,
        customTtl?: number
      ) => Effect.gen(function* () {
        const cached = yield* this.get(key)
        
        return yield* pipe(
          cached,
          Option.match({
            onNone: () => Effect.gen(function* () {
              const computed = yield* compute()
              yield* this.set(key, computed, customTtl)
              return computed
            }),
            onSome: (value) => Effect.succeed(value)
          })
        )
      }),
      
      // Clean expired entries
      cleanup: () => Effect.gen(function* () {
        const now = Date.now()
        yield* Ref.update(cacheRef, (cache) =>
          Record.filter(cache, (entry) => {
            const isExpired = entry.ttl && (now - entry.timestamp) > entry.ttl
            return !isExpired
          })
        )
      }),
      
      // Get cache statistics
      getStats: () => Effect.gen(function* () {
        const cache = yield* Ref.get(cacheRef)
        
        const entries = Record.collect(cache, (key, entry) => ({
          key,
          age: Date.now() - entry.timestamp,
          hits: entry.hits,
          size: JSON.stringify(entry.value).length // Rough estimate
        }))

        return {
          totalEntries: entries.length,
          totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
          averageAge: entries.reduce((sum, e) => sum + e.age, 0) / entries.length || 0,
          totalSize: entries.reduce((sum, e) => sum + e.size, 0),
          mostUsed: entries.sort((a, b) => b.hits - a.hits).slice(0, 5)
        }
      }),
      
      // Clear cache
      clear: () => Ref.set(cacheRef, {} as Record<K, CacheEntry<V>>),
      
      // Remove specific key
      delete: (key: K) => Ref.update(cacheRef, (cache) => Record.remove(cache, key))
    }
  }),

  // Create a memoization decorator using records
  memoize: <Args extends readonly unknown[], Return>(
    fn: (...args: Args) => Effect.Effect<Return, never, never>,
    keyGenerator: (...args: Args) => string,
    ttl?: number
  ) => Effect.gen(function* () {
    const cache = yield* RecordCache.create<string, Return>(ttl)
    
    return (...args: Args) => Effect.gen(function* () {
      const key = keyGenerator(...args)
      return yield* cache.getOrCompute(key, () => fn(...args))
    })
  })
}

// Example usage: API response caching
const createApiCache = () => Effect.gen(function* () {
  const cache = yield* RecordCache.create<string, any>(5 * 60 * 1000) // 5 minutes TTL
  
  const fetchUser = (userId: string) => Effect.gen(function* () {
    return yield* cache.getOrCompute(
      `user:${userId}`,
      () => Effect.succeed({ id: userId, name: `User ${userId}`, email: `user${userId}@example.com` })
    )
  })
  
  const fetchUserPosts = (userId: string) => Effect.gen(function* () {
    return yield* cache.getOrCompute(
      `posts:${userId}`,
      () => Effect.succeed([
        { id: "1", title: "Post 1", content: "Content 1" },
        { id: "2", title: "Post 2", content: "Content 2" }
      ])
    )
  })
  
  // Batch prefetch common data
  const prefetchUserData = (userIds: string[]) => Effect.gen(function* () {
    yield* Effect.all(
      userIds.map(userId => [
        fetchUser(userId),
        fetchUserPosts(userId)
      ]).flat(),
      { concurrency: 5 }
    )
  })
  
  return {
    fetchUser,
    fetchUserPosts,
    prefetchUserData,
    getCacheStats: cache.getStats,
    clearCache: cache.clear
  }
})
```

## Integration Examples

### Integration with Schema for Validation

```typescript
import { Record, pipe, Effect, Schema } from "effect"

// Define schemas for validation
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.between(18, 120)),
  preferences: Schema.Record({ key: Schema.String, value: Schema.Unknown })
})

const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number.pipe(Schema.positive()),
  category: Schema.String,
  inStock: Schema.Boolean
})

// Schema-validated record operations
export const SchemaRecordUtils = {
  // Validate and transform a record using Schema
  validateRecord: <A, I>(
    schema: Schema.Schema<A, I>,
    record: Record<string, I>
  ) => Effect.gen(function* () {
    const validationResults = Record.map(record, (value, key) => 
      Schema.decodeUnknown(schema)(value)
    )

    // Execute all validations
    const results = yield* Effect.allWith(validationResults, {
      mode: "validate" // Continue validation even if some fail
    })

    // Separate successful and failed validations
    const [failures, successes] = Record.partitionMap(results, (result, key) =>
      result._tag === "Left"
        ? Either.left({ key, error: result.left })
        : Either.right({ key, value: result.right })
    )

    return {
      valid: Record.map(successes, ({ value }) => value),
      invalid: failures,
      summary: {
        totalCount: Record.size(record),
        validCount: Record.size(successes),
        invalidCount: Record.size(failures),
        validationRate: Record.size(successes) / Record.size(record)
      }
    }
  }),

  // Batch validate different record types
  validateMixedRecords: (data: {
    users: Record<string, unknown>
    products: Record<string, unknown>
  }) => Effect.gen(function* () {
    const [userResults, productResults] = yield* Effect.all([
      SchemaRecordUtils.validateRecord(UserSchema, data.users),
      SchemaRecordUtils.validateRecord(ProductSchema, data.products)
    ])

    return {
      users: userResults,
      products: productResults,
      overallSummary: {
        totalRecords: userResults.summary.totalCount + productResults.summary.totalCount,
        totalValid: userResults.summary.validCount + productResults.summary.validCount,
        overallValidationRate: (userResults.summary.validCount + productResults.summary.validCount) /
          (userResults.summary.totalCount + productResults.summary.totalCount)
      }
    }
  })
}

// Example: E-commerce data processing
const processEcommerceData = (rawData: {
  users: Record<string, unknown>
  products: Record<string, unknown>
  orders: Record<string, unknown>
}) => Effect.gen(function* () {
  // Validate all data types
  const validationResults = yield* SchemaRecordUtils.validateMixedRecords({
    users: rawData.users,
    products: rawData.products
  })

  // Process valid data
  const processedData = Record.filterMap(validationResults.users.valid, (user, userId) => {
    // Only include adult users with preferences
    if (user.age >= 21 && Record.size(user.preferences) > 0) {
      return Option.some({
        ...user,
        segment: user.age < 35 ? "young_adult" : "adult",
        hasPreferences: true
      })
    }
    return Option.none()
  })

  return {
    processedUsers: processedData,
    validProducts: validationResults.products.valid,
    validationSummary: validationResults.overallSummary
  }
})
```

### Integration with Effect for Async Operations

```typescript
import { Record, pipe, Effect, Duration, Schedule, Stream, Array as Arr } from "effect"

// Async record processing with Effect
export const AsyncRecordProcessor = {
  // Process records concurrently with rate limiting
  processConcurrently: <K extends string, A, B, E, R>(
    record: Record<K, A>,
    processor: (value: A, key: K) => Effect.Effect<B, E, R>,
    options: {
      concurrency?: number
      retryPolicy?: Schedule.Schedule<unknown, unknown, unknown>
      timeout?: Duration.Duration
    } = {}
  ) => Effect.gen(function* () {
    const {
      concurrency = 10,
      retryPolicy = Schedule.exponential(Duration.millis(100)),
      timeout = Duration.seconds(30)
    } = options

    // Convert record to array of effects
    const effects = Record.collect(record, (key, value) => 
      pipe(
        processor(value, key),
        Effect.retry(retryPolicy),
        Effect.timeout(timeout),
        Effect.map((result) => ({ key, result }))
      )
    )

    // Execute with concurrency control
    const results = yield* Effect.all(effects, { 
      concurrency,
      mode: "validate" // Continue even if some fail
    })

    // Reconstruct record from results
    const [successes, failures] = Arr.partitionMap(results, (result) =>
      result._tag === "Left"
        ? Either.left(result.left)
        : Either.right(result.right)
    )

    const successRecord = successes.reduce(
      (acc, { key, result }) => Record.set(acc, key as K, result),
      {} as Record<K, B>
    )

    return {
      successes: successRecord,
      failures,
      summary: {
        totalProcessed: results.length,
        successCount: successes.length,
        failureCount: failures.length,
        successRate: successes.length / results.length
      }
    }
  }),

  // Batch process with automatic retries and circuit breaker
  batchProcessWithResilience: <K extends string, A, B>(
    records: Record<K, A>,
    processor: (batch: Array<{ key: K; value: A }>) => Effect.Effect<Array<{ key: K; result: B }>, unknown, unknown>,
    batchSize: number = 10
  ) => Effect.gen(function* () {
    // Convert record to batches
    const entries = Record.collect(records, (key, value) => ({ key, value }))

    const batches = []
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize))
    }

    // Process batches with resilience
    const batchResults = yield* Effect.all(
      batches.map((batch, batchIndex) =>
        pipe(
          processor(batch),
          Effect.retry(Schedule.exponential(Duration.millis(200))),
          Effect.timeout(Duration.seconds(60)),
          Effect.map((results) => ({ batchIndex, results })),
          Effect.catchAll((error) => 
            Effect.succeed({ 
              batchIndex, 
              error: String(error), 
              results: [] as Array<{ key: K; result: B }> 
            })
          )
        )
      ),
      { concurrency: 3 }
    )

    // Reconstruct final record
    const finalResults = batchResults.reduce(
      (acc, batch) => {
        batch.results.forEach(({ key, result }) => {
          acc[key] = result
        })
        return acc
      },
      {} as Record<K, B>
    )

    const errors = batchResults
      .filter(batch => 'error' in batch)
      .map(batch => batch.error)

    return {
      results: finalResults,
      errors,
      summary: {
        totalBatches: batches.length,
        successfulBatches: batchResults.filter(b => !('error' in b)).length,
        totalResults: Record.size(finalResults)
      }
    }
  }),

  // Stream processing for large records
  streamProcess: <K extends string, A, B>(
    record: Record<K, A>,
    processor: (value: A, key: K) => Effect.Effect<B, unknown, unknown>,
    bufferSize: number = 100
  ) => Effect.gen(function* () {
    const stream = pipe(
      Record.collect(record, (key, value) => ({ key, value })),
      Stream.fromIterable,
      Stream.mapEffect(({ key, value }) => 
        pipe(
          processor(value, key),
          Effect.map((result) => ({ key, result }))
        )
      ),
      Stream.buffer(bufferSize)
    )

    const results = yield* Stream.runCollect(stream)

    return Arr.reduce(results, {} as Record<K, B>, (acc, { key, result }) =>
      Record.set(acc, key as K, result)
    )
  })
}

// Example: Image processing service
const createImageProcessor = () => Effect.gen(function* () {
  const processImage = (imageUrl: string, transformations: string[]) =>
    Effect.gen(function* () {
      // Simulate image processing
      yield* Effect.sleep(Duration.millis(Math.random() * 1000))
      return {
        originalUrl: imageUrl,
        processedUrl: `processed-${imageUrl}`,
        transformations,
        processedAt: new Date()
      }
    })

  const imageProcessor = AsyncRecordProcessor

  return {
    processImageBatch: (images: Record<string, { url: string; transforms: string[] }>) =>
      imageProcessor.processConcurrently(
        images,
        (image, imageId) => processImage(image.url, image.transforms),
        {
          concurrency: 5,
          timeout: Duration.seconds(10)
        }
      ),

    processLargeImageSet: (images: Record<string, { url: string; transforms: string[] }>) =>
      imageProcessor.streamProcess(
        images,
        (image, imageId) => processImage(image.url, image.transforms),
        50
      )
  }
})
```

### Testing Strategies

```typescript
import { Record, pipe, Effect, TestContext, it, expect, Duration } from "effect"

// Property-based testing helpers for Record operations
export const RecordTestUtils = {
  // Generate test records with specific properties
  generateTestRecord: <V>(
    keys: string[],
    valueGenerator: (key: string, index: number) => V
  ): Record<string, V> => {
    return keys.reduce((acc, key, index) => {
      acc[key] = valueGenerator(key, index)
      return acc
    }, {} as Record<string, V>)
  },

  // Test record invariants
  testRecordInvariants: <A, B>(
    record: Record<string, A>,
    operation: (r: Record<string, A>) => Record<string, B>,
    invariants: {
      preservesKeys?: boolean
      preservesSize?: boolean
      customInvariant?: (original: Record<string, A>, result: Record<string, B>) => boolean
    }
  ) => {
    const result = operation(record)
    const originalKeys = Record.keys(record).sort()
    const resultKeys = Record.keys(result).sort()

    if (invariants.preservesKeys) {
      expect(resultKeys).toEqual(originalKeys)
    }

    if (invariants.preservesSize) {
      expect(Record.size(result)).toBe(Record.size(record))
    }

    if (invariants.customInvariant) {
      expect(invariants.customInvariant(record, result)).toBe(true)
    }

    return result
  }
}

// Test suite for Record operations
describe("Record Operations", () => {
  it("map preserves keys and transforms values", () => {
    const testRecord = RecordTestUtils.generateTestRecord(
      ["a", "b", "c"],
      (key, index) => index * 10
    )

    const result = RecordTestUtils.testRecordInvariants(
      testRecord,
      (r) => Record.map(r, (value) => value * 2),
      {
        preservesKeys: true,
        preservesSize: true,
        customInvariant: (original, result) => {
          return Record.every(original, (value, key) => 
            pipe(
              Record.get(result, key),
              Option.match({
                onNone: () => false,
                onSome: (resultValue) => resultValue === value * 2
              })
            )
          )
        }
      }
    )
  })

  it("filter maintains type safety and removes unwanted entries", () => {
    const users = {
      "user1": { age: 25, active: true },
      "user2": { age: 17, active: true },
      "user3": { age: 30, active: false },
      "user4": { age: 22, active: true }
    }

    const activeAdults = Record.filter(users, (user) => user.active && user.age >= 18)

    expect(Record.size(activeAdults)).toBe(2)
    expect(Record.has(activeAdults, "user1")).toBe(true)
    expect(Record.has(activeAdults, "user4")).toBe(true)
    expect(Record.has(activeAdults, "user2")).toBe(false) // Under 18
    expect(Record.has(activeAdults, "user3")).toBe(false) // Not active
  })

  it("union combines records correctly", () => {
    const permissions1 = { read: true, write: false }
    const permissions2 = { write: true, delete: true }

    const combined = Record.union(permissions1, permissions2, (a, b) => a || b)

    expect(combined).toEqual({
      read: true,
      write: true,
      delete: true
    })
  })

  it("collect transforms record to array correctly", () => {
    const scores = { math: 95, science: 87, english: 92 }
    
    const report = Record.collect(scores, (subject, score) => ({
      subject,
      score,
      grade: score >= 90 ? "A" : score >= 80 ? "B" : "C"
    }))

    expect(report).toHaveLength(3)
    expect(report.find(r => r.subject === "math")?.grade).toBe("A")
    expect(report.find(r => r.subject === "science")?.grade).toBe("B")
  })
})

// Integration tests with Effect
describe("Record with Effect Integration", () => {
  it("processes records asynchronously", () =>
    Effect.gen(function* () {
      const data = { item1: 10, item2: 20, item3: 30 }
      
      const processItem = (value: number) => Effect.gen(function* () {
        yield* Effect.sleep(Duration.millis(10)) // Simulate async work
        return value * 2
      })

      const processor = AsyncRecordProcessor
      const result = yield* processor.processConcurrently(
        data,
        processItem,
        { concurrency: 2 }
      )

      expect(Record.size(result.successes)).toBe(3)
      expect(result.summary.successRate).toBe(1)
      expect(pipe(Record.get(result.successes, "item1"), Option.getOrNull)).toBe(20)
    }).pipe(Effect.provide(TestContext.TestContext))
  )
})

// Mock data generators for testing
export const MockDataGenerators = {
  generateUsers: (count: number) => 
    RecordTestUtils.generateTestRecord(
      Array.from({ length: count }, (_, i) => `user${i + 1}`),
      (key, index) => ({
        id: key,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        age: 20 + (index % 50),
        active: index % 3 !== 0
      })
    ),

  generateProducts: (categories: string[]) =>
    categories.reduce((acc, category, categoryIndex) => {
      const productsInCategory = Array.from({ length: 5 }, (_, i) => {
        const productId = `${category}_${i + 1}`
        acc[productId] = {
          id: productId,
          name: `${category} Product ${i + 1}`,
          category,
          price: (categoryIndex + 1) * 100 + i * 10,
          inStock: i % 4 !== 0
        }
      })
      return acc
    }, {} as Record<string, any>)
}
```

## Conclusion

Record provides comprehensive type-safe utilities for working with objects in Effect applications, enabling clean functional programming patterns while maintaining full type safety.

Key benefits:
- **Type Safety**: All operations preserve and enhance TypeScript's type information
- **Functional Programming**: Clean, composable operations that avoid mutation
- **Performance**: Efficient implementations optimized for common use cases
- **Integration**: Seamless integration with other Effect modules and patterns
- **Error Handling**: Safe operations that handle edge cases and prevent runtime errors

Use Record when you need to transform, filter, aggregate, or manipulate object data in a type-safe, functional manner. It's particularly valuable for configuration management, data processing pipelines, state management, and any scenario where you're working with key-value structured data.