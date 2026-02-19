# HashSet: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem HashSet Solves

JavaScript's native Set and array-based deduplication approaches have significant limitations when building functional, immutable applications. Traditional approaches suffer from performance issues, lack structural sharing, and don't integrate well with Effect's type system:

```typescript
// Traditional approach - mutable Set with manual immutability
class TagManager {
  private tags = new Set<string>()
  
  addTags(newTags: string[]): TagManager {
    // Manual copying for immutability - O(n) operation
    const newSet = new Set(this.tags)
    newTags.forEach(tag => newSet.add(tag))
    return new TagManager(Array.from(newSet))
  }
  
  removeTags(tagsToRemove: string[]): TagManager {
    // More manual copying
    const newSet = new Set(this.tags)
    tagsToRemove.forEach(tag => newSet.delete(tag))
    return new TagManager(Array.from(newSet))
  }
  
  findCommon(other: TagManager): string[] {
    // Inefficient intersection - no built-in set operations
    const result: string[] = []
    for (const tag of this.tags) {
      if (other.tags.has(tag)) {
        result.push(tag)
      }
    }
    return result
  }
  
  private constructor(initialTags?: string[]) {
    if (initialTags) {
      this.tags = new Set(initialTags)
    }
  }
}

// Array-based deduplication - even worse performance
const deduplicateUsers = (users: User[]) => {
  const seen = new Set<string>()
  const result: User[] = []
  
  for (const user of users) {
    if (!seen.has(user.id)) {
      seen.add(user.id)
      result.push(user)
    }
  }
  return result
}

// Memory inefficient - creates multiple full copies
const tags1 = new TagManager(['frontend', 'react', 'typescript'])
const tags2 = tags1.addTags(['nodejs', 'backend']) // Full copy + additions
const tags3 = tags2.removeTags(['react']) // Another full copy
// Three separate full copies in memory with no structural sharing

// Set operations are verbose and error-prone
const findUniqueToFirst = (set1: Set<string>, set2: Set<string>): string[] => {
  const result: string[] = []
  for (const item of set1) {
    if (!set2.has(item)) {
      result.push(item)
    }
  }
  return result
}
```

This approach leads to:
- **Memory waste** - Full copying for every change, no structural sharing
- **Performance degradation** - O(n) copying operations for every modification
- **Verbose set operations** - Manual implementation of union, intersection, difference
- **Poor composability** - Difficult to chain operations or integrate with functional patterns
- **Type safety issues** - No built-in validation or transformation capabilities

### The HashSet Solution

HashSet provides a persistent, immutable hash-based set with structural sharing, optimized for functional programming patterns and set theory operations:

```typescript
import { HashSet, pipe } from "effect"

// Immutable HashSet with structural sharing
const createTagManager = () => {
  const empty = HashSet.empty<string>()
  
  const withTags = empty.pipe(
    HashSet.add('frontend'),
    HashSet.add('react'),
    HashSet.add('typescript'),
    HashSet.add('nodejs')
  )
  
  // Structural sharing - minimal memory overhead
  const withoutReact = HashSet.remove(withTags, 'react')
  const withBackend = HashSet.add(withoutReact, 'backend')
  
  return { withTags, withoutReact, withBackend }
}

// Efficient set operations built-in
const frontendTags = HashSet.make('react', 'vue', 'angular', 'typescript')
const backendTags = HashSet.make('nodejs', 'python', 'java', 'typescript')

// Set theory operations are first-class
const commonTags = HashSet.intersection(frontendTags, backendTags)
const allTags = HashSet.union(frontendTags, backendTags)
const frontendOnly = HashSet.difference(frontendTags, backendTags)

console.log(HashSet.toValues(commonTags))        // ['typescript']
console.log(HashSet.toValues(frontendOnly))      // ['react', 'vue', 'angular']
console.log(HashSet.size(allTags))               // 6 (deduplicated automatically)
```

### Key Concepts

**Immutability with Structural Sharing**: HashSet creates new versions efficiently by sharing unchanged portions, providing immutability without the memory cost of full copying.

**Hash-Based Uniqueness**: Uses Effect's Equal trait for determining uniqueness, supporting both primitive values and custom objects with proper equality semantics.

**Set Theory Operations**: Built-in support for mathematical set operations (union, intersection, difference) with optimized implementations.

**Functional Composition**: Designed to work seamlessly with Effect's pipe and functional programming patterns, enabling clean, composable code.

## Basic Usage Patterns

### Pattern 1: Creating and Populating HashSets

```typescript
import { HashSet, pipe } from "effect"

// Empty set creation
const empty = HashSet.empty<number>()

// Direct creation with values
const numbers = HashSet.make(1, 2, 3, 4, 5)

// From existing iterable (with automatic deduplication)
const fromArray = HashSet.fromIterable([1, 2, 2, 3, 3, 4])
console.log(HashSet.size(fromArray)) // 4 (duplicates removed)

// Functional composition with pipe
const processedSet = HashSet.empty<string>().pipe(
  HashSet.add('first'),
  HashSet.add('second'),
  HashSet.add('third'),
  HashSet.add('first') // Duplicate ignored
)

console.log(HashSet.size(processedSet)) // 3
console.log(HashSet.toValues(processedSet)) // ['first', 'second', 'third']
```

### Pattern 2: Membership Testing and Basic Operations

```typescript
import { HashSet } from "effect"

const skills = HashSet.make('JavaScript', 'TypeScript', 'React', 'Node.js')

// Membership testing - O(1) average case
const hasJS = HashSet.has(skills, 'JavaScript')        // true
const hasPython = HashSet.has(skills, 'Python')        // false

// Conditional operations
const withPythonMaybe = HashSet.has(skills, 'Python') 
  ? skills 
  : HashSet.add(skills, 'Python')

// Size and emptiness checks
console.log(HashSet.size(skills))      // 4
console.log(HashSet.size(HashSet.empty())) // 0

// Value extraction
const skillArray = HashSet.toValues(skills)
const skillIterator = HashSet.values(skills)

// Iteration patterns
HashSet.forEach(skills, skill => {
  console.log(`Skill: ${skill}`)
})
```

### Pattern 3: Set Theory Operations

```typescript
import { HashSet } from "effect"

// Define skill sets for different roles
const frontendSkills = HashSet.make('HTML', 'CSS', 'JavaScript', 'React', 'TypeScript')
const backendSkills = HashSet.make('Node.js', 'Python', 'SQL', 'TypeScript', 'Docker')
const fullStackSkills = HashSet.make('JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL')

// Union - all skills across roles
const allSkills = HashSet.union(frontendSkills, backendSkills)
console.log(HashSet.size(allSkills)) // 8 unique skills

// Intersection - shared skills
const sharedSkills = HashSet.intersection(frontendSkills, backendSkills)
console.log(HashSet.toValues(sharedSkills)) // ['TypeScript']

// Difference - frontend-only skills
const frontendOnlySkills = HashSet.difference(frontendSkills, backendSkills)
console.log(HashSet.toValues(frontendOnlySkills)) // ['HTML', 'CSS', 'JavaScript', 'React']

// Subset testing
const isFullStackSubsetOfAll = HashSet.isSubset(fullStackSkills, allSkills)
console.log(isFullStackSubsetOfAll) // true

// Symmetric difference (items in either set, but not in both)
const uniqueToEach = HashSet.union(
  HashSet.difference(frontendSkills, backendSkills),
  HashSet.difference(backendSkills, frontendSkills)
)
```

## Real-World Examples

### Example 1: User Permission Management System

A common use case is managing user permissions where you need to ensure uniqueness, perform set operations, and maintain immutability for audit trails.

```typescript
import { HashSet, pipe, Data, Equal } from "effect"

// Define permission types using Data for automatic equality
const Permission = Data.tagged<{
  readonly resource: string
  readonly action: 'read' | 'write' | 'delete' | 'admin'
}>()('Permission')

type Permission = typeof Permission.Type

// Create permission sets
const createUserPermissions = (userId: string) => {
  const basePermissions = HashSet.make(
    Permission({ resource: 'profile', action: 'read' }),
    Permission({ resource: 'profile', action: 'write' })
  )
  
  return { userId, permissions: basePermissions }
}

const createAdminPermissions = () => HashSet.make(
  Permission({ resource: 'users', action: 'read' }),
  Permission({ resource: 'users', action: 'write' }),
  Permission({ resource: 'users', action: 'delete' }),
  Permission({ resource: 'system', action: 'admin' })
)

const createModeratorPermissions = () => HashSet.make(
  Permission({ resource: 'posts', action: 'read' }),
  Permission({ resource: 'posts', action: 'write' }),
  Permission({ resource: 'posts', action: 'delete' }),
  Permission({ resource: 'comments', action: 'delete' })
)

// Permission management operations
class PermissionManager {
  static grantPermissions(
    currentPermissions: HashSet.HashSet<Permission>,
    newPermissions: HashSet.HashSet<Permission>
  ): HashSet.HashSet<Permission> {
    return HashSet.union(currentPermissions, newPermissions)
  }
  
  static revokePermissions(
    currentPermissions: HashSet.HashSet<Permission>,
    permissionsToRevoke: HashSet.HashSet<Permission>
  ): HashSet.HashSet<Permission> {
    return HashSet.difference(currentPermissions, permissionsToRevoke)
  }
  
  static hasPermission(
    userPermissions: HashSet.HashSet<Permission>,
    requiredPermission: Permission
  ): boolean {
    return HashSet.has(userPermissions, requiredPermission) ||
           HashSet.some(userPermissions, p => 
             p.resource === requiredPermission.resource && p.action === 'admin'
           )
  }
  
  static getEffectivePermissions(
    basePermissions: HashSet.HashSet<Permission>,
    rolePermissions: HashSet.HashSet<Permission>[]
  ): HashSet.HashSet<Permission> {
    return rolePermissions.reduce(
      (acc, rolePerms) => HashSet.union(acc, rolePerms),
      basePermissions
    )
  }
}

// Usage example
const user = createUserPermissions('user123')
const adminPerms = createAdminPermissions()
const modPerms = createModeratorPermissions()

// Grant admin role
const userWithAdmin = {
  ...user,
  permissions: PermissionManager.grantPermissions(user.permissions, adminPerms)
}

// Add moderator permissions
const userWithBothRoles = {
  ...userWithAdmin,
  permissions: PermissionManager.grantPermissions(userWithAdmin.permissions, modPerms)
}

// Check specific permission
const canDeleteUsers = PermissionManager.hasPermission(
  userWithBothRoles.permissions,
  Permission({ resource: 'users', action: 'delete' })
)

console.log(canDeleteUsers) // true
console.log(HashSet.size(userWithBothRoles.permissions)) // 8 (deduplicated automatically)
```

### Example 2: Content Tagging and Classification System

Managing content tags is a perfect use case for HashSet, especially when dealing with hierarchical tags, bulk operations, and tag relationships.

```typescript
import { HashSet, pipe, Data, Array } from "effect"

// Define tag structure with automatic equality
const Tag = Data.struct({
  name: String,
  category: String,
  priority: Number
})

type Tag = typeof Tag.Type

// Tag creation helpers
const createTag = (name: string, category: string, priority = 1): Tag =>
  Tag({ name, category, priority })

// Content management system
class ContentTagManager {
  static readonly CATEGORIES = {
    TECHNOLOGY: 'technology',
    LANGUAGE: 'language', 
    FRAMEWORK: 'framework',
    TOOL: 'tool',
    CONCEPT: 'concept'
  } as const

  // Predefined tag sets
  static readonly FRONTEND_TAGS = HashSet.make(
    createTag('React', this.CATEGORIES.FRAMEWORK, 3),
    createTag('Vue', this.CATEGORIES.FRAMEWORK, 3),
    createTag('Angular', this.CATEGORIES.FRAMEWORK, 3),
    createTag('JavaScript', this.CATEGORIES.LANGUAGE, 5),
    createTag('TypeScript', this.CATEGORIES.LANGUAGE, 4),
    createTag('CSS', this.CATEGORIES.LANGUAGE, 4),
    createTag('HTML', this.CATEGORIES.LANGUAGE, 5)
  )

  static readonly BACKEND_TAGS = HashSet.make(
    createTag('Node.js', this.CATEGORIES.TECHNOLOGY, 4),
    createTag('Python', this.CATEGORIES.LANGUAGE, 4),
    createTag('Java', this.CATEGORIES.LANGUAGE, 3),
    createTag('SQL', this.CATEGORIES.LANGUAGE, 4),
    createTag('Docker', this.CATEGORIES.TOOL, 3),
    createTag('TypeScript', this.CATEGORIES.LANGUAGE, 4)
  )

  static readonly DEVOPS_TAGS = HashSet.make(
    createTag('Docker', this.CATEGORIES.TOOL, 4),
    createTag('Kubernetes', this.CATEGORIES.TOOL, 3),
    createTag('CI/CD', this.CATEGORIES.CONCEPT, 3),
    createTag('AWS', this.CATEGORIES.TECHNOLOGY, 3),
    createTag('Linux', this.CATEGORIES.TECHNOLOGY, 4)
  )

  // Smart tag suggestions based on existing tags
  static suggestTags(
    currentTags: HashSet.HashSet<Tag>, 
    targetRole: 'frontend' | 'backend' | 'fullstack' | 'devops'
  ): HashSet.HashSet<Tag> {
    const roleTagMap = {
      frontend: this.FRONTEND_TAGS,
      backend: this.BACKEND_TAGS,
      fullstack: HashSet.union(this.FRONTEND_TAGS, this.BACKEND_TAGS),
      devops: this.DEVOPS_TAGS
    }

    const roleTags = roleTagMap[targetRole]
    
    // Suggest tags not already present
    return HashSet.difference(roleTags, currentTags)
  }

  // Find related content by tag similarity
  static findSimilarContent(
    contentTags: HashSet.HashSet<Tag>,
    allContentTags: HashSet.HashSet<Tag>[],
    minimumOverlap = 2
  ): number[] {
    return allContentTags
      .map((tags, index) => ({
        index,
        overlap: HashSet.size(HashSet.intersection(contentTags, tags))
      }))
      .filter(result => result.overlap >= minimumOverlap)
      .map(result => result.index)
  }

  // Analyze tag distribution
  static analyzeTagDistribution(contentList: HashSet.HashSet<Tag>[]): {
    byCategory: Record<string, number>
    byPriority: Record<number, number>
    mostCommon: Tag[]
  } {
    const allTags = contentList.reduce(
      (acc, tags) => HashSet.union(acc, tags),
      HashSet.empty<Tag>()
    )

    const tagArray = HashSet.toValues(allTags)
    
    // Count by category
    const byCategory = tagArray.reduce((acc, tag) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Count by priority
    const byPriority = tagArray.reduce((acc, tag) => {
      acc[tag.priority] = (acc[tag.priority] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Find most common tags (appear in multiple content pieces)
    const tagCounts = new Map<string, { tag: Tag; count: number }>()
    
    contentList.forEach(tags => {
      HashSet.forEach(tags, tag => {
        const key = `${tag.name}-${tag.category}`
        const existing = tagCounts.get(key)
        if (existing) {
          existing.count++
        } else {
          tagCounts.set(key, { tag, count: 1 })
        }
      })
    })

    const mostCommon = Array.fromIterable(tagCounts.values())
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count)
      .map(item => item.tag)

    return { byCategory, byPriority, mostCommon }
  }
}

// Usage example
const articleTags = HashSet.make(
  createTag('React', ContentTagManager.CATEGORIES.FRAMEWORK, 3),
  createTag('TypeScript', ContentTagManager.CATEGORIES.LANGUAGE, 4),
  createTag('Testing', ContentTagManager.CATEGORIES.CONCEPT, 2)
)

const tutorialTags = HashSet.make(
  createTag('Vue', ContentTagManager.CATEGORIES.FRAMEWORK, 3), 
  createTag('JavaScript', ContentTagManager.CATEGORIES.LANGUAGE, 5),
  createTag('Testing', ContentTagManager.CATEGORIES.CONCEPT, 2)
)

// Get suggestions for frontend development
const suggestions = ContentTagManager.suggestTags(articleTags, 'frontend')
console.log(HashSet.size(suggestions)) // Tags not already in articleTags

// Find similar content
const similar = ContentTagManager.findSimilarContent(
  articleTags,
  [tutorialTags, HashSet.make(createTag('Python', 'language', 4))],
  1
)
console.log(similar) // [0] - tutorialTags has 1 overlap (Testing)

// Analyze tag patterns across content
const analysis = ContentTagManager.analyzeTagDistribution([articleTags, tutorialTags])
console.log(analysis.mostCommon) // [Testing tag] - appears in both
```

### Example 3: Dependency Resolution and Build System

Complex build systems need to track dependencies, detect cycles, and ensure proper build order while maintaining immutability for rollback capabilities.

```typescript
import { HashSet, pipe, Data, Array, Effect, Either } from "effect"

// Define dependency types
const Dependency = Data.struct({
  name: String,
  version: String,
  type: String as (s: string) => 'direct' | 'peer' | 'dev' | 'optional'
})

type Dependency = typeof Dependency.Type

const Package = Data.struct({
  name: String,
  version: String,
  dependencies: HashSet.HashSet<Dependency>,
  resolved: Boolean
})

type Package = typeof Package.Type

// Dependency resolution engine
class DependencyResolver {
  // Track resolution state
  private resolved = HashSet.empty<string>()
  private resolving = HashSet.empty<string>()
  private failed = HashSet.empty<string>()

  // Detect circular dependencies using Effect.gen for complex traversal logic
  static detectCircularDependencies(
    packages: Map<string, Package>
  ): Effect.Effect<HashSet.HashSet<string>, string[]> {
    return Effect.gen(function* () {
      let visiting = HashSet.empty<string>()
      let visited = HashSet.empty<string>()
      const cycles: string[] = []

      const visit = function* (
        packageName: string,
        currentVisiting: HashSet.HashSet<string>,
        currentVisited: HashSet.HashSet<string>
      ) {
        // Check for circular dependency
        if (HashSet.has(currentVisiting, packageName)) {
          cycles.push(`Circular dependency detected involving: ${packageName}`)
          return { visiting: currentVisiting, visited: currentVisited }
        }

        if (HashSet.has(currentVisited, packageName)) {
          return { visiting: currentVisiting, visited: currentVisited }
        }

        const pkg = packages.get(packageName)
        if (!pkg) {
          return { visiting: currentVisiting, visited: currentVisited }
        }

        // Add to visiting set
        const newVisiting = HashSet.add(currentVisiting, packageName)
        
        // Visit all dependencies
        let state = { visiting: newVisiting, visited: currentVisited }
        const dependencies = HashSet.toArray(pkg.dependencies)
        
        for (const dep of dependencies) {
          state = yield* visit(dep.name, state.visiting, state.visited)
        }

        return {
          visiting: HashSet.remove(state.visiting, packageName),
          visited: HashSet.add(state.visited, packageName)
        }
      }

      // Process all packages
      const packageNames = Array.from(packages.keys())
      for (const packageName of packageNames) {
        if (!HashSet.has(visited, packageName)) {
          const result = yield* visit(packageName, visiting, visited)
          visiting = result.visiting
          visited = result.visited
        }
      }

      if (cycles.length > 0) {
        return yield* Effect.fail(cycles)
      }
      
      return visited
    })
  }

  // Build dependency graph with levels using Effect.gen for complex resolution logic
  static buildInstallOrder(
    packages: Map<string, Package>
  ): Effect.Effect<string[][], string> {
    return Effect.gen(function* () {
      // First check for circular dependencies
      yield* this.detectCircularDependencies(packages).pipe(
        Effect.mapError(cycles => cycles.join('; '))
      )

      const levels: string[][] = []
      let remaining = HashSet.fromIterable(packages.keys())
      let resolved = HashSet.empty<string>()

      // Iteratively resolve dependency levels
      while (HashSet.size(remaining) > 0) {
        const currentLevel: string[] = []
        
        // Find packages ready for installation
        const remainingArray = HashSet.toArray(remaining)
        for (const packageName of remainingArray) {
          const pkg = packages.get(packageName)!
          const dependencies = HashSet.toArray(pkg.dependencies)
          
          // Check if all dependencies are resolved
          const allDepsResolved = dependencies.every(dep => 
            HashSet.has(resolved, dep.name) || dep.type === 'optional'
          )
          
          if (allDepsResolved) {
            currentLevel.push(packageName)
          }
        }

        if (currentLevel.length === 0) {
          return yield* Effect.fail('Unable to resolve dependencies - possible unresolvable conflict')
        }

        levels.push(currentLevel)
        
        // Update sets for next iteration
        for (const packageName of currentLevel) {
          resolved = HashSet.add(resolved, packageName)
          remaining = HashSet.remove(remaining, packageName)
        }
      }

      return levels
    })
  }

  // Optimize install order by grouping compatible dependencies
  static optimizeInstallOrder(
    installLevels: string[][],
    packages: Map<string, Package>
  ): {
    optimizedLevels: string[][]
    parallelizable: HashSet.HashSet<string>
    criticalPath: string[]
  } {
    // Find packages that can be installed in parallel
    const parallelizable = HashSet.empty<string>()
    
    installLevels.forEach(level => {
      if (level.length > 1) {
        level.forEach(pkg => {
          HashSet.add(parallelizable, pkg)
        })
      }
    })

    // Find critical path (longest dependency chain)
    const findCriticalPath = (): string[] => {
      let longestPath: string[] = []
      
      packages.forEach((pkg, name) => {
        const path = this.calculateDependencyDepth(name, packages, HashSet.empty())
        if (path.length > longestPath.length) {
          longestPath = path
        }
      })
      
      return longestPath
    }

    return {
      optimizedLevels: installLevels,
      parallelizable,
      criticalPath: findCriticalPath()
    }
  }

  private static calculateDependencyDepth(
    packageName: string,
    packages: Map<string, Package>,
    visited: HashSet.HashSet<string>
  ): Effect.Effect<string[]> {
    return Effect.gen(function* () {
      // Avoid infinite recursion
      if (HashSet.has(visited, packageName)) {
        return [packageName]
      }

      const pkg = packages.get(packageName)
      if (!pkg || HashSet.size(pkg.dependencies) === 0) {
        return [packageName]
      }

      const newVisited = HashSet.add(visited, packageName)
      let deepestPath: string[] = [packageName]

      // Calculate depth for each non-optional dependency
      const dependencies = HashSet.toArray(pkg.dependencies)
        .filter(dep => dep.type !== 'optional')

      for (const dep of dependencies) {
        const depPath = yield* this.calculateDependencyDepth(dep.name, packages, newVisited)
        if (depPath.length + 1 > deepestPath.length) {
          deepestPath = [packageName, ...depPath]
        }
      }

      return deepestPath
    })
  }

  // Generate install script with error handling
  static generateInstallScript(
    packages: Map<string, Package>,
    options: {
      packageManager: 'bun'
      skipOptional: boolean
      production: boolean
    }
  ): Either.Either<string, string> {
    const installOrderResult = this.buildInstallOrder(packages)
    
    if (Either.isLeft(installOrderResult)) {
      return Either.left(installOrderResult.left)
    }

    const levels = installOrderResult.right
    const optimization = this.optimizeInstallOrder(levels, packages)
    
    let script = `#!/bin/bash\n# Generated dependency install script\nset -e\n\n`
    
    // Add critical path comment
    script += `# Critical path: ${optimization.criticalPath.join(' -> ')}\n`
    script += `# Parallelizable packages: ${HashSet.size(optimization.parallelizable)}\n\n`

    levels.forEach((level, index) => {
      script += `# Install level ${index + 1}\n`
      
      if (level.length === 1) {
        const pkg = packages.get(level[0])!
        script += this.generatePackageInstallCommand(pkg, options)
      } else {
        script += `# Parallel installation group\n`
        level.forEach(packageName => {
          const pkg = packages.get(packageName)!
          script += this.generatePackageInstallCommand(pkg, options)
        })
      }
      script += '\n'
    })

    return Either.right(script)
  }

  private static generatePackageInstallCommand(
    pkg: Package,
    options: { packageManager: string; skipOptional: boolean; production: boolean }
  ): string {
    const { packageManager, skipOptional, production } = options
    let cmd = `${packageManager} install ${pkg.name}@${pkg.version}`
    
    if (production) cmd += ' --production'
    if (skipOptional) cmd += ' --no-optional'
    
    return cmd + '\n'
  }
}

// Usage example
const createSampleProject = (): Map<string, Package> => {
  const packages = new Map<string, Package>()

  packages.set('react', Package({
    name: 'react',
    version: '18.2.0',
    dependencies: HashSet.empty(),
    resolved: false
  }))

  packages.set('react-dom', Package({
    name: 'react-dom', 
    version: '18.2.0',
    dependencies: HashSet.make(
      Dependency({ name: 'react', version: '18.2.0', type: 'peer' })
    ),
    resolved: false
  }))

  packages.set('next', Package({
    name: 'next',
    version: '13.0.0',
    dependencies: HashSet.make(
      Dependency({ name: 'react', version: '18.2.0', type: 'peer' }),
      Dependency({ name: 'react-dom', version: '18.2.0', type: 'peer' })
    ),
    resolved: false
  }))

  return packages
}

// Resolve dependencies
const sampleProject = createSampleProject()
const installOrderResult = DependencyResolver.buildInstallOrder(sampleProject)

if (Either.isRight(installOrderResult)) {
  console.log('Install order:', installOrderResult.right)
  // Output: [['react'], ['react-dom'], ['next']]
  
  const scriptResult = DependencyResolver.generateInstallScript(sampleProject, {
    packageManager: 'npm',
    skipOptional: true,
    production: false
  })
  
  if (Either.isRight(scriptResult)) {
    console.log('Generated install script:')
    console.log(scriptResult.right)
  }
}
```

## Advanced Features Deep Dive

### Feature 1: Custom Equality and Hashing for Complex Objects

HashSet's power comes from its ability to handle complex objects with custom equality semantics, enabling sophisticated deduplication and comparison logic.

#### Basic Custom Equality Usage

```typescript
import { HashSet, Equal, Hash, Data } from "effect"

// Method 1: Manual implementation of Equal interface
class User implements Equal.Equal {
  constructor(
    readonly id: number,
    readonly email: string,
    readonly name: string,
    readonly metadata?: Record<string, unknown>
  ) {}

  // Define equality based on id and email only
  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof User) {
      return Equal.equals(this.id, that.id) && 
             Equal.equals(this.email, that.email)
    }
    return false
  }

  // Hash must be consistent with equality
  [Hash.symbol](): number {
    return Hash.combine(Hash.hash(this.id), Hash.hash(this.email))
  }
}

// Method 2: Using Data.Class for automatic equality
class Product extends Data.Class<{
  readonly id: string
  readonly name: string  
  readonly price: number
  readonly category: string
}> {}

// Method 3: Using Data.struct for ad-hoc objects
const createOrder = (id: string, userId: string, items: string[]) => 
  Data.struct({
    id,
    userId,
    items: Data.array(items), // Nested Data structures
    createdAt: new Date(),
    metadata: Data.struct({ source: 'web' })
  })

// Usage with complex equality
const users = HashSet.make(
  new User(1, 'alice@example.com', 'Alice Smith'),
  new User(1, 'alice@example.com', 'Alice Johnson'), // Same id+email = duplicate
  new User(2, 'bob@example.com', 'Bob Smith')
)

console.log(HashSet.size(users)) // 2 (duplicate removed based on id+email)

const products = HashSet.make(
  new Product({ id: 'p1', name: 'Laptop', price: 999, category: 'Electronics' }),
  new Product({ id: 'p1', name: 'Laptop Pro', price: 1299, category: 'Electronics' }), // Same id = duplicate
  new Product({ id: 'p2', name: 'Mouse', price: 29, category: 'Electronics' })
)

console.log(HashSet.size(products)) // 2 (duplicate removed based on structural equality)
```

#### Real-World Custom Equality Example

```typescript
import { HashSet, Equal, Hash, Data, pipe } from "effect"

// Complex business entity with multi-field equality
class CustomerAccount extends Data.Class<{
  readonly customerId: string
  readonly accountType: 'premium' | 'standard' | 'trial'
  readonly region: string
  readonly features: string[]
  readonly billingAddress: {
    readonly street: string
    readonly city: string
    readonly country: string
  }
}> {
  // Custom business logic for account equality
  static equals(a: CustomerAccount, b: CustomerAccount): boolean {
    // Accounts are equal if they have same customer and region
    // regardless of features or billing changes
    return a.customerId === b.customerId && a.region === b.region
  }
}

// Account deduplication with custom logic
class AccountManager {
  // Merge duplicate accounts, keeping the most privileged
  static deduplicate(accounts: CustomerAccount[]): HashSet.HashSet<CustomerAccount> {
    const accountMap = new Map<string, CustomerAccount>()
    
    accounts.forEach(account => {
      const key = `${account.customerId}-${account.region}`
      const existing = accountMap.get(key)
      
      if (!existing) {
        accountMap.set(key, account)
      } else {
        // Keep the account with higher privilege
        const priority = { trial: 1, standard: 2, premium: 3 }
        if (priority[account.accountType] > priority[existing.accountType]) {
          accountMap.set(key, account)
        }
      }
    })
    
    return HashSet.fromIterable(accountMap.values())
  }

  // Find accounts with feature overlaps
  static findAccountsWithFeatureOverlap(
    accounts: HashSet.HashSet<CustomerAccount>,
    targetFeatures: string[],
    minimumOverlap = 1
  ): CustomerAccount[] {
    const targetSet = HashSet.fromIterable(targetFeatures)
    
    return pipe(
      accounts,
      HashSet.filter(account => {
        const accountFeatures = HashSet.fromIterable(account.features)
        const overlap = HashSet.intersection(accountFeatures, targetSet)
        return HashSet.size(overlap) >= minimumOverlap
      }),
      HashSet.toValues
    )
  }

  // Segment accounts by feature combinations
  static segmentByFeatures(
    accounts: HashSet.HashSet<CustomerAccount>
  ): Map<string, HashSet.HashSet<CustomerAccount>> {
    const segments = new Map<string, HashSet.HashSet<CustomerAccount>>()
    
    HashSet.forEach(accounts, account => {
      const featureKey = account.features.sort().join(',')
      const existing = segments.get(featureKey) || HashSet.empty<CustomerAccount>()
      segments.set(featureKey, HashSet.add(existing, account))
    })
    
    return segments
  }
}

// Usage example
const accounts = [
  new CustomerAccount({
    customerId: 'c1',
    accountType: 'standard',
    region: 'us-east',
    features: ['analytics', 'export'],
    billingAddress: { street: '123 Main St', city: 'Boston', country: 'US' }
  }),
  new CustomerAccount({
    customerId: 'c1', // Same customer, same region
    accountType: 'premium', // But upgraded account type
    region: 'us-east',
    features: ['analytics', 'export', 'advanced-reporting'],
    billingAddress: { street: '456 Oak Ave', city: 'Boston', country: 'US' }
  }),
  new CustomerAccount({
    customerId: 'c2',
    accountType: 'trial',
    region: 'eu-west',
    features: ['basic-analytics'],
    billingAddress: { street: '789 High St', city: 'London', country: 'UK' }
  })
]

const deduplicated = AccountManager.deduplicate(accounts)
console.log(HashSet.size(deduplicated)) // 2 (c1 merged to premium account)

const analyticsUsers = AccountManager.findAccountsWithFeatureOverlap(
  deduplicated,
  ['analytics', 'reporting'],
  1
)
console.log(analyticsUsers.length) // Accounts with analytics features
```

### Feature 2: Mutable Batch Operations and Performance Optimization

For scenarios requiring many modifications, HashSet provides efficient batch operations through temporary mutability.

#### Advanced Mutate Usage

```typescript
import { HashSet, pipe, Array } from "effect"

// Batch processing with mutate for performance
class BatchProcessor {
  // Process large datasets efficiently
  static processLargeDataset<T>(
    initialSet: HashSet.HashSet<T>,
    operations: Array<{
      type: 'add' | 'remove'
      values: T[]
    }>
  ): HashSet.HashSet<T> {
    return HashSet.mutate(initialSet, draft => {
      operations.forEach(op => {
        op.values.forEach(value => {
          if (op.type === 'add') {
            HashSet.add(draft, value)
          } else {
            HashSet.remove(draft, value)
          }
        })
      })
    })
  }

  // Complex filtering with multiple criteria
  static complexFilter<T>(
    set: HashSet.HashSet<T>,
    filters: Array<(value: T) => boolean>
  ): {
    passed: HashSet.HashSet<T>
    failed: HashSet.HashSet<T>
    byFilter: HashSet.HashSet<T>[]
  } {
    let passed = HashSet.empty<T>()
    let failed = HashSet.empty<T>()
    const byFilter = filters.map(() => HashSet.empty<T>())

    // Single pass through the data with multiple outputs
    const result = HashSet.mutate(HashSet.empty<T>(), () => {
      HashSet.forEach(set, value => {
        let passedAny = false
        
        filters.forEach((filter, index) => {
          if (filter(value)) {
            byFilter[index] = HashSet.add(byFilter[index], value)
            passedAny = true
          }
        })
        
        if (passedAny) {
          passed = HashSet.add(passed, value)
        } else {
          failed = HashSet.add(failed, value)
        }
      })
    })

    return { passed, failed, byFilter }
  }

  // Merge multiple sets with custom logic
  static mergeWithStrategy<T>(
    sets: HashSet.HashSet<T>[],
    strategy: 'union' | 'intersection' | 'majority'
  ): HashSet.HashSet<T> {
    if (sets.length === 0) return HashSet.empty()
    if (sets.length === 1) return sets[0]

    switch (strategy) {
      case 'union':
        return sets.reduce((acc, set) => HashSet.union(acc, set), HashSet.empty())
      
      case 'intersection':
        return sets.reduce((acc, set) => HashSet.intersection(acc, set))
      
      case 'majority':
        // Items that appear in more than half the sets
        const itemCounts = new Map<T, number>()
        const threshold = Math.ceil(sets.length / 2)
        
        sets.forEach(set => {
          HashSet.forEach(set, item => {
            itemCounts.set(item, (itemCounts.get(item) || 0) + 1)
          })
        })
        
        return HashSet.mutate(HashSet.empty<T>(), draft => {
          itemCounts.forEach((count, item) => {
            if (count >= threshold) {
              HashSet.add(draft, item)
            }
          })
        })
      
      default:
        return HashSet.empty()
    }
  }
}

// Performance benchmarking helper
class HashSetPerformance {
  static benchmark(
    name: string,
    operation: () => void,
    iterations = 1000
  ): { name: string; avgTime: number; totalTime: number } {
    const start = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      operation()
    }
    
    const totalTime = performance.now() - start
    return {
      name,
      avgTime: totalTime / iterations,
      totalTime
    }
  }

  // Compare mutate vs individual operations
  static compareBatchOperations(dataSize: number): void {
    const data = Array.range(0, dataSize)
    const baseSet = HashSet.fromIterable(data.slice(0, dataSize / 2))
    const newItems = data.slice(dataSize / 2)

    // Individual operations
    const individualOps = this.benchmark(
      'Individual Operations',
      () => {
        let result = baseSet
        newItems.forEach(item => {
          result = HashSet.add(result, item)
        })
      }
    )

    // Batch with mutate
    const batchOps = this.benchmark(
      'Batch Operations',
      () => {
        HashSet.mutate(baseSet, draft => {
          newItems.forEach(item => {
            HashSet.add(draft, item)
          })
        })
      }
    )

    console.log(`Performance comparison for ${dataSize} operations:`)
    console.log(`Individual: ${individualOps.avgTime.toFixed(3)}ms avg`)
    console.log(`Batch: ${batchOps.avgTime.toFixed(3)}ms avg`)
    console.log(`Speedup: ${(individualOps.avgTime / batchOps.avgTime).toFixed(2)}x`)
  }
}

// Usage examples
const largeDataProcessing = () => {
  const initialSet = HashSet.fromIterable(Array.range(1, 1000))
  
  const operations = [
    { type: 'add' as const, values: Array.range(1000, 1500) },
    { type: 'remove' as const, values: Array.range(1, 100) },
    { type: 'add' as const, values: Array.range(2000, 2200) }
  ]
  
  const result = BatchProcessor.processLargeDataset(initialSet, operations)
  console.log(HashSet.size(result)) // Efficiently processed result
}

// Run performance comparison
HashSetPerformance.compareBatchOperations(1000)
```

### Feature 3: Advanced Set Theory and Mathematical Operations

HashSet provides sophisticated set theory operations that go beyond basic union/intersection, enabling complex mathematical computations.

#### Mathematical Set Operations

```typescript
import { HashSet, pipe, Array, Equal, Data } from "effect"

// Advanced mathematical operations on sets
class SetMath {
  // Cartesian product of two sets
  static cartesianProduct<A, B>(
    setA: HashSet.HashSet<A>,
    setB: HashSet.HashSet<B>
  ): HashSet.HashSet<[A, B]> {
    return HashSet.mutate(HashSet.empty<[A, B]>(), draft => {
      HashSet.forEach(setA, a => {
        HashSet.forEach(setB, b => {
          HashSet.add(draft, [a, b])
        })
      })
    })
  }

  // Power set (all subsets)
  static powerSet<T>(set: HashSet.HashSet<T>): HashSet.HashSet<HashSet.HashSet<T>> {
    const elements = HashSet.toValues(set)
    const subsets: HashSet.HashSet<T>[] = []
    
    // Generate all 2^n subsets
    const n = elements.length
    for (let i = 0; i < (1 << n); i++) {
      let subset = HashSet.empty<T>()
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          subset = HashSet.add(subset, elements[j])
        }
      }
      subsets.push(subset)
    }

    return HashSet.fromIterable(subsets)
  }

  // Symmetric difference (elements in either set, but not both)
  static symmetricDifference<T>(
    setA: HashSet.HashSet<T>,
    setB: HashSet.HashSet<T>
  ): HashSet.HashSet<T> {
    const onlyInA = HashSet.difference(setA, setB)
    const onlyInB = HashSet.difference(setB, setA)
    return HashSet.union(onlyInA, onlyInB)
  }

  // Check if sets are disjoint (no common elements)
  static areDisjoint<T>(
    setA: HashSet.HashSet<T>,
    setB: HashSet.HashSet<T>
  ): boolean {
    return HashSet.size(HashSet.intersection(setA, setB)) === 0
  }

  // Jaccard similarity coefficient
  static jaccardSimilarity<T>(
    setA: HashSet.HashSet<T>,
    setB: HashSet.HashSet<T>
  ): number {
    const intersection = HashSet.intersection(setA, setB)
    const union = HashSet.union(setA, setB)
    
    if (HashSet.size(union) === 0) return 1 // Both empty sets
    
    return HashSet.size(intersection) / HashSet.size(union)
  }

  // Set partition - divide set into n roughly equal parts
  static partition<T>(
    set: HashSet.HashSet<T>,
    partitionCount: number
  ): HashSet.HashSet<T>[] {
    const elements = HashSet.toValues(set)
    const partitionSize = Math.ceil(elements.length / partitionCount)
    const partitions: HashSet.HashSet<T>[] = []

    for (let i = 0; i < partitionCount; i++) {
      const start = i * partitionSize
      const end = Math.min(start + partitionSize, elements.length)
      const partition = HashSet.fromIterable(elements.slice(start, end))
      partitions.push(partition)
    }

    return partitions
  }

  // Find maximal elements (elements not dominated by others)
  static findMaximalElements<T>(
    set: HashSet.HashSet<T>,
    dominanceRelation: (a: T, b: T) => boolean
  ): HashSet.HashSet<T> {
    return HashSet.filter(set, element => {
      // Element is maximal if no other element dominates it
      return !HashSet.some(set, other => 
        !Equal.equals(element, other) && dominanceRelation(other, element)
      )
    })
  }
}

// Advanced applications
class SetAnalytics {
  // Analyze relationships between multiple sets
  static analyzeSetRelationships<T>(
    sets: Map<string, HashSet.HashSet<T>>
  ): {
    overlaps: Map<string, Map<string, number>>
    similarities: Map<string, Map<string, number>>
    disjointPairs: [string, string][]
    universalElements: HashSet.HashSet<T>
    uniqueToSets: Map<string, HashSet.HashSet<T>>
  } {
    const setNames = Array.from(sets.keys())
    const overlaps = new Map<string, Map<string, number>>()
    const similarities = new Map<string, Map<string, number>>()
    const disjointPairs: [string, string][] = []

    // Calculate pairwise relationships
    for (let i = 0; i < setNames.length; i++) {
      const nameA = setNames[i]
      const setA = sets.get(nameA)!
      
      overlaps.set(nameA, new Map())
      similarities.set(nameA, new Map())

      for (let j = i + 1; j < setNames.length; j++) {
        const nameB = setNames[j]
        const setB = sets.get(nameB)!

        const intersection = HashSet.intersection(setA, setB)
        const overlapSize = HashSet.size(intersection)
        const similarity = SetMath.jaccardSimilarity(setA, setB)

        overlaps.get(nameA)!.set(nameB, overlapSize)
        similarities.get(nameA)!.set(nameB, similarity)

        if (SetMath.areDisjoint(setA, setB)) {
          disjointPairs.push([nameA, nameB])
        }
      }
    }

    // Find universal elements (present in all sets)
    const universalElements = setNames.reduce((acc, name) => {
      const set = sets.get(name)!
      return acc ? HashSet.intersection(acc, set) : set
    }, null as HashSet.HashSet<T> | null) || HashSet.empty<T>()

    // Find elements unique to each set
    const uniqueToSets = new Map<string, HashSet.HashSet<T>>()
    sets.forEach((set, name) => {
      let unique = set
      sets.forEach((otherSet, otherName) => {
        if (name !== otherName) {
          unique = HashSet.difference(unique, otherSet)
        }
      })
      uniqueToSets.set(name, unique)
    })

    return {
      overlaps,
      similarities,
      disjointPairs,
      universalElements,
      uniqueToSets
    }
  }

  // Clustering sets by similarity
  static clusterBySimilarity<T>(
    sets: Map<string, HashSet.HashSet<T>>,
    similarityThreshold = 0.3
  ): string[][] {
    const setNames = Array.from(sets.keys())
    const clusters: string[][] = []
    const assigned = new Set<string>()

    setNames.forEach(name => {
      if (assigned.has(name)) return

      const cluster = [name]
      assigned.add(name)
      const baseSet = sets.get(name)!

      setNames.forEach(otherName => {
        if (assigned.has(otherName) || name === otherName) return

        const otherSet = sets.get(otherName)!
        const similarity = SetMath.jaccardSimilarity(baseSet, otherSet)

        if (similarity >= similarityThreshold) {
          cluster.push(otherName)
          assigned.add(otherName)
        }
      })

      clusters.push(cluster)
    })

    return clusters
  }
}

// Usage example - analyzing user interests
const analyzeUserInterests = () => {
  const userInterests = new Map([
    ['alice', HashSet.make('programming', 'music', 'reading', 'cooking')],
    ['bob', HashSet.make('programming', 'gaming', 'sports', 'music')],
    ['charlie', HashSet.make('reading', 'cooking', 'gardening', 'music')],
    ['diana', HashSet.make('programming', 'reading', 'science', 'music')]
  ])

  const analysis = SetAnalytics.analyzeSetRelationships(userInterests)
  
  console.log('Universal interests:', HashSet.toValues(analysis.universalElements))
  // Output: ['music'] - common to all users
  
  console.log('Similarity between Alice and Bob:', 
    analysis.similarities.get('alice')?.get('bob'))
  // Jaccard similarity coefficient
  
  const clusters = SetAnalytics.clusterBySimilarity(userInterests, 0.25)
  console.log('Interest clusters:', clusters)
  // Groups users with similar interests

  // Mathematical operations
  const aliceInterests = userInterests.get('alice')!
  const bobInterests = userInterests.get('bob')!
  
  const symDiff = SetMath.symmetricDifference(aliceInterests, bobInterests)
  console.log('Unique interests (Alice XOR Bob):', HashSet.toValues(symDiff))
  // ['reading', 'cooking', 'gaming', 'sports']
}

analyzeUserInterests()
```

## Practical Patterns & Best Practices

### Pattern 1: Immutable State Management with HashSet

HashSet excels in functional state management scenarios where you need to track collections of unique items across state transitions.

```typescript
import { HashSet, pipe, Data, Effect, Array } from "effect"

// State management with immutable HashSet
const AppState = Data.struct({
  selectedItems: HashSet.HashSet<string>,
  favoriteItems: HashSet.HashSet<string>,
  recentItems: HashSet.HashSet<string>,
  hiddenItems: HashSet.HashSet<string>
})

type AppState = typeof AppState.Type

// State transition helpers
class StateManager {
  // Selection management
  static toggleSelection(
    state: AppState,
    itemId: string
  ): AppState {
    const isSelected = HashSet.has(state.selectedItems, itemId)
    
    return {
      ...state,
      selectedItems: isSelected
        ? HashSet.remove(state.selectedItems, itemId)
        : HashSet.add(state.selectedItems, itemId)
    }
  }

  static selectMultiple(
    state: AppState, 
    itemIds: string[]
  ): AppState {
    return {
      ...state,
      selectedItems: HashSet.mutate(state.selectedItems, draft => {
        itemIds.forEach(id => HashSet.add(draft, id))
      })
    }
  }

  static clearSelection(state: AppState): AppState {
    return {
      ...state,
      selectedItems: HashSet.empty()
    }
  }

  // Favorites management with recent tracking
  static toggleFavorite(
    state: AppState,
    itemId: string
  ): AppState {
    const isFavorite = HashSet.has(state.favoriteItems, itemId)
    
    return {
      ...state,
      favoriteItems: isFavorite
        ? HashSet.remove(state.favoriteItems, itemId)
        : HashSet.add(state.favoriteItems, itemId),
      recentItems: HashSet.add(state.recentItems, itemId)
    }
  }

  // Smart bulk operations
  static bulkAction(
    state: AppState,
    action: 'favorite' | 'unfavorite' | 'hide' | 'show',
    itemIds: string[]
  ): AppState {
    const itemSet = HashSet.fromIterable(itemIds)
    
    switch (action) {
      case 'favorite':
        return {
          ...state,
          favoriteItems: HashSet.union(state.favoriteItems, itemSet),
          recentItems: HashSet.union(state.recentItems, itemSet)
        }
      
      case 'unfavorite':
        return {
          ...state,
          favoriteItems: HashSet.difference(state.favoriteItems, itemSet),
          recentItems: HashSet.union(state.recentItems, itemSet)
        }
      
      case 'hide':
        return {
          ...state,
          hiddenItems: HashSet.union(state.hiddenItems, itemSet),
          selectedItems: HashSet.difference(state.selectedItems, itemSet)
        }
      
      case 'show':
        return {
          ...state,
          hiddenItems: HashSet.difference(state.hiddenItems, itemSet)
        }
      
      default:
        return state
    }
  }

  // Complex derived state calculations
  static getDerivedState(state: AppState) {
    const visibleItems = HashSet.difference(
      HashSet.union(state.selectedItems, state.favoriteItems),
      state.hiddenItems
    )
    
    const selectedFavorites = HashSet.intersection(
      state.selectedItems,
      state.favoriteItems
    )
    
    const recentFavorites = HashSet.intersection(
      state.recentItems,
      state.favoriteItems
    )

    return {
      visibleItems,
      selectedFavorites,
      recentFavorites,
      hasSelection: HashSet.size(state.selectedItems) > 0,
      hasFavorites: HashSet.size(state.favoriteItems) > 0,
      visibleCount: HashSet.size(visibleItems)
    }
  }

  // Undo/Redo support with state snapshots
  static createSnapshot(state: AppState): string {
    return JSON.stringify({
      selected: HashSet.toValues(state.selectedItems),
      favorites: HashSet.toValues(state.favoriteItems),
      recent: HashSet.toValues(state.recentItems),
      hidden: HashSet.toValues(state.hiddenItems)
    })
  }

  static restoreSnapshot(snapshot: string): AppState {
    const data = JSON.parse(snapshot)
    return AppState({
      selectedItems: HashSet.fromIterable(data.selected),
      favoriteItems: HashSet.fromIterable(data.favorites),
      recentItems: HashSet.fromIterable(data.recent),
      hiddenItems: HashSet.fromIterable(data.hidden)
    })
  }
}

// React-style state hook simulation
class StateHook {
  private state: AppState
  private snapshots: string[] = []
  private snapshotIndex = -1

  constructor(initialState: AppState) {
    this.state = initialState
    this.saveSnapshot()
  }

  private saveSnapshot(): void {
    const snapshot = StateManager.createSnapshot(this.state)
    this.snapshots = this.snapshots.slice(0, this.snapshotIndex + 1)
    this.snapshots.push(snapshot)
    this.snapshotIndex = this.snapshots.length - 1
  }

  updateState(updater: (state: AppState) => AppState): void {
    this.state = updater(this.state)
    this.saveSnapshot()
  }

  undo(): boolean {
    if (this.snapshotIndex > 0) {
      this.snapshotIndex--
      this.state = StateManager.restoreSnapshot(this.snapshots[this.snapshotIndex])
      return true
    }
    return false
  }

  redo(): boolean {
    if (this.snapshotIndex < this.snapshots.length - 1) {
      this.snapshotIndex++
      this.state = StateManager.restoreSnapshot(this.snapshots[this.snapshotIndex])
      return true
    }
    return false
  }

  getState(): AppState {
    return this.state
  }

  getDerivedState() {
    return StateManager.getDerivedState(this.state)
  }
}

// Usage example
const initialState = AppState({
  selectedItems: HashSet.empty(),
  favoriteItems: HashSet.empty(),
  recentItems: HashSet.empty(),
  hiddenItems: HashSet.empty()
})

const stateHook = new StateHook(initialState)

// Simulate user interactions
stateHook.updateState(state => 
  StateManager.selectMultiple(state, ['item1', 'item2', 'item3'])
)

stateHook.updateState(state => 
  StateManager.toggleFavorite(state, 'item1')
)

stateHook.updateState(state => 
  StateManager.bulkAction(state, 'hide', ['item2'])
)

const derived = stateHook.getDerivedState()
console.log('Visible items:', HashSet.toValues(derived.visibleItems))
console.log('Has favorites:', derived.hasFavorites)

// Undo last action
stateHook.undo()
console.log('After undo - visible count:', stateHook.getDerivedState().visibleCount)
```

### Pattern 2: Efficient Deduplication and Data Cleaning

HashSet's structural sharing makes it ideal for data cleaning pipelines where you need to remove duplicates while preserving performance.

```typescript
import { HashSet, pipe, Data, Effect, Array, Option } from "effect"

// Data cleaning with HashSet
const DataRecord = Data.struct({
  id: String,
  email: String,
  phone: String,
  category: String,
  timestamp: Number,
  metadata: Data.struct({
    source: String,
    verified: Boolean
  })
})

type DataRecord = typeof DataRecord.Type

class DataCleaner {
  // Multi-stage deduplication pipeline
  static cleanDataset(records: DataRecord[]): {
    cleaned: DataRecord[]
    duplicates: {
      byId: DataRecord[]
      byEmail: DataRecord[]
      byPhone: DataRecord[]
      exact: DataRecord[]
    }
    stats: {
      original: number
      cleaned: number
      removed: number
      duplicateRatio: number
    }
  } {
    const originalSize = records.length

    // Stage 1: Remove exact duplicates (all fields match)
    const exactDuplicates: DataRecord[] = []
    const withoutExactDupes = HashSet.toValues(HashSet.fromIterable(records))
    
    records.forEach(record => {
      const found = withoutExactDupes.find(cleaned => 
        Data.equals(record, cleaned)
      )
      if (!found || found !== record) {
        exactDuplicates.push(record)
      }
    })

    // Stage 2: Identify duplicates by business key (id, email, phone)
    const { idDuplicates, cleanedById } = this.deduplicateByField(
      withoutExactDupes, 
      record => record.id,
      (existing, duplicate) => existing.timestamp > duplicate.timestamp
        ? existing 
        : duplicate
    )

    const { emailDuplicates, cleanedByEmail } = this.deduplicateByField(
      cleanedById,
      record => record.email,
      (existing, duplicate) => existing.metadata.verified && !duplicate.metadata.verified
        ? existing
        : duplicate
    )

    const { phoneDuplicates, cleanedByPhone } = this.deduplicateByField(
      cleanedByEmail,
      record => record.phone,
      (existing, duplicate) => existing.timestamp > duplicate.timestamp
        ? existing
        : duplicate
    )

    const cleanedSize = cleanedByPhone.length
    
    return {
      cleaned: cleanedByPhone,
      duplicates: {
        byId: idDuplicates,
        byEmail: emailDuplicates,
        byPhone: phoneDuplicates,
        exact: exactDuplicates
      },
      stats: {
        original: originalSize,
        cleaned: cleanedSize,
        removed: originalSize - cleanedSize,
        duplicateRatio: (originalSize - cleanedSize) / originalSize
      }
    }
  }

  private static deduplicateByField<T>(
    records: T[],
    keyExtractor: (record: T) => string,
    resolver: (existing: T, duplicate: T) => T
  ): { duplicates: T[], cleaned: T[] } {
    const seen = new Map<string, T>()
    const duplicates: T[] = []

    records.forEach(record => {
      const key = keyExtractor(record)
      const existing = seen.get(key)
      
      if (existing) {
        duplicates.push(record)
        seen.set(key, resolver(existing, record))
      } else {
        seen.set(key, record)
      }
    })

    return {
      duplicates,
      cleaned: Array.from(seen.values())
    }
  }

  // Advanced pattern matching for fuzzy deduplication
  static fuzzyDeduplicate(
    records: DataRecord[],
    similarityThreshold = 0.8
  ): {
    clusters: DataRecord[][]
    representatives: DataRecord[]
  } {
    const clusters: DataRecord[][] = []
    const processed = HashSet.empty<string>()
    let processedMutable = processed

    records.forEach(record => {
      if (HashSet.has(processedMutable, record.id)) return

      const cluster = [record]
      processedMutable = HashSet.add(processedMutable, record.id)

      // Find similar records
      records.forEach(other => {
        if (HashSet.has(processedMutable, other.id)) return
        
        const similarity = this.calculateSimilarity(record, other)
        if (similarity >= similarityThreshold) {
          cluster.push(other)
          processedMutable = HashSet.add(processedMutable, other.id)
        }
      })

      clusters.push(cluster)
    })

    const representatives = clusters.map(cluster => 
      this.selectBestRepresentative(cluster)
    )

    return { clusters, representatives }
  }

  private static calculateSimilarity(a: DataRecord, b: DataRecord): number {
    let matches = 0
    let total = 0

    // Email similarity
    total++
    if (a.email.toLowerCase() === b.email.toLowerCase()) matches++

    // Phone similarity (normalized)
    total++
    const phoneA = a.phone.replace(/\D/g, '')
    const phoneB = b.phone.replace(/\D/g, '')
    if (phoneA === phoneB) matches++

    // Category match
    total++
    if (a.category === b.category) matches++

    // Source similarity
    total++
    if (a.metadata.source === b.metadata.source) matches++

    return matches / total
  }

  private static selectBestRepresentative(cluster: DataRecord[]): DataRecord {
    // Choose the most recent verified record, or most recent if none verified
    const verified = cluster.filter(r => r.metadata.verified)
    const candidates = verified.length > 0 ? verified : cluster
    
    return candidates.reduce((best, current) => 
      current.timestamp > best.timestamp ? current : best
    )
  }

  // Quality assessment of cleaned data
  static assessQuality(records: DataRecord[]): {
    completeness: number
    validity: number
    uniqueness: number
    consistency: number
    overall: number
  } {
    const total = records.length
    if (total === 0) return { completeness: 0, validity: 0, uniqueness: 0, consistency: 0, overall: 0 }

    // Completeness - non-empty required fields
    const complete = records.filter(r => 
      r.id && r.email && r.phone && r.category
    ).length
    const completeness = complete / total

    // Validity - proper formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    const valid = records.filter(r => 
      emailRegex.test(r.email) && phoneRegex.test(r.phone)
    ).length
    const validity = valid / total

    // Uniqueness - using HashSet
    const uniqueEmails = HashSet.size(HashSet.fromIterable(records.map(r => r.email)))
    const uniquePhones = HashSet.size(HashSet.fromIterable(records.map(r => r.phone)))
    const uniqueness = Math.min(uniqueEmails / total, uniquePhones / total)

    // Consistency - same category records have similar patterns
    const categoryGroups = records.reduce((acc, record) => {
      if (!acc[record.category]) acc[record.category] = []
      acc[record.category].push(record)
      return acc
    }, {} as Record<string, DataRecord[]>)

    let consistencySum = 0
    let categoryCount = 0
    
    Object.values(categoryGroups).forEach(group => {
      if (group.length > 1) {
        const sources = HashSet.fromIterable(group.map(r => r.metadata.source))
        const consistency = HashSet.size(sources) === 1 ? 1 : 0.5
        consistencySum += consistency
        categoryCount++
      }
    })

    const consistency = categoryCount > 0 ? consistencySum / categoryCount : 1

    const overall = (completeness + validity + uniqueness + consistency) / 4

    return { completeness, validity, uniqueness, consistency, overall }
  }
}

// Usage example
const generateSampleData = (): DataRecord[] => [
  DataRecord({
    id: '1',
    email: 'alice@example.com',
    phone: '+1-555-0001',
    category: 'premium',
    timestamp: Date.now() - 1000,
    metadata: { source: 'web', verified: true }
  }),
  DataRecord({
    id: '1', // Duplicate ID
    email: 'alice@example.com',
    phone: '+15550001', // Same phone, different format
    category: 'premium',
    timestamp: Date.now(), // More recent
    metadata: { source: 'web', verified: true }
  }),
  DataRecord({
    id: '2',
    email: 'bob@example.com',
    phone: '+1-555-0002',
    category: 'standard',
    timestamp: Date.now() - 2000,
    metadata: { source: 'api', verified: false }
  }),
  DataRecord({
    id: '3',
    email: 'ALICE@EXAMPLE.COM', // Case difference
    phone: '+1-555-0003',
    category: 'premium',
    timestamp: Date.now() - 500,
    metadata: { source: 'import', verified: false }
  })
]

const sampleData = generateSampleData()
const cleaningResult = DataCleaner.cleanDataset(sampleData)

console.log('Cleaning Results:')
console.log(`Original: ${cleaningResult.stats.original}`)
console.log(`Cleaned: ${cleaningResult.stats.cleaned}`)
console.log(`Removed: ${cleaningResult.stats.removed}`)
console.log(`Duplicate ratio: ${(cleaningResult.stats.duplicateRatio * 100).toFixed(1)}%`)

const qualityReport = DataCleaner.assessQuality(cleaningResult.cleaned)
console.log('Quality Assessment:', qualityReport)
```

### Pattern 3: Caching and Memoization with HashSet

HashSet's efficient equality checking makes it excellent for caching scenarios where you need to track computed results and cache keys.

```typescript
import { HashSet, pipe, Data, Effect, Duration, Array } from "effect"

// Sophisticated caching with HashSet
const CacheKey = Data.struct({
  operation: String,
  parameters: Data.array(String),
  context: Data.struct({
    userId: String,
    region: String,
    timestamp: Number
  })
})

type CacheKey = typeof CacheKey.Type

const CacheEntry = Data.struct({
  key: CacheKey,
  value: String, // JSON serialized result
  createdAt: Number,
  lastAccessed: Number,
  accessCount: Number,
  ttl: Number
})

type CacheEntry = typeof CacheEntry.Type

class SmartCache {
  private entries = new Map<string, CacheEntry>()
  private hotKeys = HashSet.empty<string>() // Frequently accessed
  private expiredKeys = HashSet.empty<string>() // Needs cleanup
  private dirtyKeys = HashSet.empty<string>() // Needs recomputation

  constructor(
    private maxSize = 1000,
    private defaultTtl = Duration.minutes(30).value,
    private hotThreshold = 5 // Access count for "hot" classification
  ) {}

  // Smart get with automatic cleanup
  get<T>(key: CacheKey): Option.Option<T> {
    const keyStr = this.serializeKey(key)
    const entry = this.entries.get(keyStr)
    
    if (!entry) {
      return Option.none()
    }

    const now = Date.now()
    
    // Check expiration
    if (now > entry.createdAt + entry.ttl) {
      this.expiredKeys = HashSet.add(this.expiredKeys, keyStr)
      this.entries.delete(keyStr)
      return Option.none()
    }

    // Update access patterns
    const updatedEntry = {
      ...entry,
      lastAccessed: now,
      accessCount: entry.accessCount + 1
    }
    
    this.entries.set(keyStr, updatedEntry)

    // Track hot keys
    if (updatedEntry.accessCount >= this.hotThreshold) {
      this.hotKeys = HashSet.add(this.hotKeys, keyStr)
    }

    try {
      return Option.some(JSON.parse(entry.value) as T)
    } catch {
      // Invalid JSON, mark for cleanup
      this.dirtyKeys = HashSet.add(this.dirtyKeys, keyStr)
      return Option.none()
    }
  }

  // Smart set with eviction strategy
  set<T>(key: CacheKey, value: T, customTtl?: number): void {
    const keyStr = this.serializeKey(key)
    const now = Date.now()
    const ttl = customTtl || this.defaultTtl

    // Clean before adding if at capacity
    if (this.entries.size >= this.maxSize) {
      this.evictEntries()
    }

    const entry = CacheEntry({
      key,
      value: JSON.stringify(value),
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      ttl
    })

    this.entries.set(keyStr, entry)
    
    // Remove from expired/dirty if present
    this.expiredKeys = HashSet.remove(this.expiredKeys, keyStr)
    this.dirtyKeys = HashSet.remove(this.dirtyKeys, keyStr)
  }

  // Intelligent eviction using HashSet operations
  private evictEntries(): void {
    const now = Date.now()
    const candidates: [string, CacheEntry][] = []

    // Collect eviction candidates
    this.entries.forEach((entry, key) => {
      const isExpired = now > entry.createdAt + entry.ttl
      const isHot = HashSet.has(this.hotKeys, key)
      const isDirty = HashSet.has(this.dirtyKeys, key)

      if (isExpired || isDirty) {
        candidates.push([key, entry])
      } else if (!isHot) {
        candidates.push([key, entry])
      }
    })

    // Sort by eviction priority (expired/dirty first, then LRU)
    candidates.sort(([keyA, entryA], [keyB, entryB]) => {
      const isDirtyA = HashSet.has(this.dirtyKeys, keyA)
      const isDirtyB = HashSet.has(this.dirtyKeys, keyB)
      const isExpiredA = now > entryA.createdAt + entryA.ttl
      const isExpiredB = now > entryB.createdAt + entryB.ttl

      if (isDirtyA && !isDirtyB) return -1
      if (!isDirtyA && isDirtyB) return 1
      if (isExpiredA && !isExpiredB) return -1
      if (!isExpiredA && isExpiredB) return 1
      
      return entryA.lastAccessed - entryB.lastAccessed // LRU
    })

    // Evict entries
    const toEvict = Math.ceil(this.maxSize * 0.1) // Remove 10%
    candidates.slice(0, toEvict).forEach(([key]) => {
      this.entries.delete(key)
      this.hotKeys = HashSet.remove(this.hotKeys, key)
      this.expiredKeys = HashSet.remove(this.expiredKeys, key)
      this.dirtyKeys = HashSet.remove(this.dirtyKeys, key)
    })
  }

  // Batch operations for related keys
  invalidateByPattern(pattern: Partial<CacheKey>): void {
    const toInvalidate: string[] = []

    this.entries.forEach((entry, key) => {
      if (this.matchesPattern(entry.key, pattern)) {
        toInvalidate.push(key)
      }
    })

    // Batch invalidation
    toInvalidate.forEach(key => {
      this.entries.delete(key)
      this.hotKeys = HashSet.remove(this.hotKeys, key)
    })

    this.dirtyKeys = HashSet.union(
      this.dirtyKeys,
      HashSet.fromIterable(toInvalidate)
    )
  }

  // Precompute for hot keys
  precomputeHotKeys<T>(
    computeFn: (key: CacheKey) => Promise<T>
  ): Effect.Effect<void, never, never> {
    return Effect.gen(function* () {
      const hotKeyArray = HashSet.toValues(this.hotKeys)
      
      for (const keyStr of hotKeyArray) {
        const entry = this.entries.get(keyStr)
        if (entry && Date.now() > entry.createdAt + entry.ttl * 0.8) {
          // Refresh when 80% of TTL elapsed
          try {
            const result = yield* Effect.promise(() => computeFn(entry.key))
            this.set(entry.key, result)
          } catch {
            this.dirtyKeys = HashSet.add(this.dirtyKeys, keyStr)
          }
        }
      }
    }.bind(this))
  }

  // Analytics and monitoring
  getStats(): {
    totalEntries: number
    hotKeys: number
    expiredKeys: number
    dirtyKeys: number
    hitRate: number
    averageAccessCount: number
    memoryEfficiency: number
  } {
    const totalEntries = this.entries.size
    const totalAccesses = Array.from(this.entries.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0)
    
    const averageAccessCount = totalEntries > 0 ? totalAccesses / totalEntries : 0
    const hotKeyCount = HashSet.size(this.hotKeys)
    const hitRate = hotKeyCount / Math.max(totalEntries, 1)
    
    // Memory efficiency based on hot vs cold ratio
    const memoryEfficiency = totalEntries > 0 ? hotKeyCount / totalEntries : 0

    return {
      totalEntries,
      hotKeys: hotKeyCount,
      expiredKeys: HashSet.size(this.expiredKeys),
      dirtyKeys: HashSet.size(this.dirtyKeys),
      hitRate,
      averageAccessCount,
      memoryEfficiency
    }
  }

  private serializeKey(key: CacheKey): string {
    return `${key.operation}|${key.parameters.join(',')}|${key.context.userId}|${key.context.region}`
  }

  private matchesPattern(key: CacheKey, pattern: Partial<CacheKey>): boolean {
    if (pattern.operation && key.operation !== pattern.operation) return false
    if (pattern.context?.userId && key.context.userId !== pattern.context.userId) return false
    if (pattern.context?.region && key.context.region !== pattern.context.region) return false
    return true
  }
}

// Usage example with memoization
class ComputationService {
  private cache = new SmartCache(500, Duration.minutes(15).value)

  // Memoized expensive computation
  async computeUserReport(
    userId: string, 
    reportType: string, 
    parameters: string[]
  ): Promise<any> {
    const key = CacheKey({
      operation: 'user-report',
      parameters: [reportType, ...parameters],
      context: {
        userId,
        region: 'us-east-1',
        timestamp: Math.floor(Date.now() / (1000 * 60 * 10)) // 10-minute buckets
      }
    })

    // Try cache first
    const cached = this.cache.get<any>(key)
    if (Option.isSome(cached)) {
      return cached.value
    }

    // Compute and cache
    const result = await this.expensiveComputation(userId, reportType, parameters)
    this.cache.set(key, result)
    
    return result
  }

  private async expensiveComputation(
    userId: string, 
    reportType: string, 
    parameters: string[]
  ): Promise<any> {
    // Simulate expensive computation
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      userId,
      reportType,
      parameters,
      data: `computed-data-${Date.now()}`,
      computedAt: new Date().toISOString()
    }
  }

  // Invalidate user-specific cache
  invalidateUserCache(userId: string): void {
    this.cache.invalidateByPattern({
      context: { userId, region: '', timestamp: 0 }
    })
  }

  getCacheStats() {
    return this.cache.getStats()
  }
}

// Example usage
const service = new ComputationService()

const demonstrateCache = async () => {
  // First call - cache miss
  console.time('First call')
  await service.computeUserReport('user123', 'monthly', ['2024'])
  console.timeEnd('First call')

  // Second call - cache hit
  console.time('Second call')
  await service.computeUserReport('user123', 'monthly', ['2024'])
  console.timeEnd('Second call')

  // Different parameters - cache miss
  console.time('Different params')
  await service.computeUserReport('user123', 'weekly', ['2024'])
  console.timeEnd('Different params')

  console.log('Cache stats:', service.getCacheStats())
}

demonstrateCache()
```

## Integration Examples

### Integration with React State Management

HashSet integrates seamlessly with React applications, providing efficient state management for scenarios involving collections of unique items.

```typescript
import { HashSet, pipe } from "effect"
import { useState, useCallback, useMemo } from "react"

// React hooks for HashSet state management
const useHashSetState = <T>(initial: HashSet.HashSet<T> = HashSet.empty<T>()) => {
  const [set, setSet] = useState(initial)

  const add = useCallback((item: T) => {
    setSet(current => HashSet.add(current, item))
  }, [])

  const remove = useCallback((item: T) => {
    setSet(current => HashSet.remove(current, item))
  }, [])

  const toggle = useCallback((item: T) => {
    setSet(current => HashSet.toggle(current, item))
  }, [])

  const addMultiple = useCallback((items: T[]) => {
    setSet(current => HashSet.mutate(current, draft => {
      items.forEach(item => HashSet.add(draft, item))
    }))
  }, [])

  const clear = useCallback(() => {
    setSet(HashSet.empty<T>())
  }, [])

  const has = useCallback((item: T) => {
    return HashSet.has(set, item)
  }, [set])

  const size = useMemo(() => HashSet.size(set), [set])
  const values = useMemo(() => HashSet.toValues(set), [set])
  const isEmpty = useMemo(() => HashSet.size(set) === 0, [set])

  return {
    set,
    add,
    remove,
    toggle,
    addMultiple,
    clear,
    has,
    size,
    values,
    isEmpty
  }
}

// Advanced multi-select component
interface MultiSelectProps<T> {
  items: T[]
  getItemId: (item: T) => string
  renderItem: (item: T, isSelected: boolean) => React.ReactNode
  onSelectionChange?: (selected: T[]) => void
  maxSelection?: number
  allowSelectAll?: boolean
}

const MultiSelect = <T,>({
  items,
  getItemId,
  renderItem,
  onSelectionChange,
  maxSelection,
  allowSelectAll = true
}: MultiSelectProps<T>) => {
  const {
    set: selectedSet,
    add,
    remove,
    toggle,
    addMultiple,
    clear,
    has,
    size,
    values,
    isEmpty
  } = useHashSetState<string>()

  // Derived state
  const selectedItems = useMemo(() => {
    return items.filter(item => has(getItemId(item)))
  }, [items, values, getItemId, has])

  const canSelectMore = useMemo(() => {
    return !maxSelection || size < maxSelection
  }, [maxSelection, size])

  const allSelected = useMemo(() => {
    return items.length > 0 && items.every(item => has(getItemId(item)))
  }, [items, has, getItemId])

  // Callbacks
  const handleToggleItem = useCallback((item: T) => {
    const itemId = getItemId(item)
    const isSelected = has(itemId)
    
    if (isSelected) {
      remove(itemId)
    } else if (canSelectMore) {
      add(itemId)
    }
  }, [add, remove, has, getItemId, canSelectMore])

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      clear()
    } else {
      const itemIds = items.map(getItemId)
      const toAdd = maxSelection 
        ? itemIds.slice(0, maxSelection)
        : itemIds
      addMultiple(toAdd)
    }
  }, [allSelected, clear, addMultiple, items, getItemId, maxSelection])

  // Effect for external change notification
  React.useEffect(() => {
    onSelectionChange?.(selectedItems)
  }, [selectedItems, onSelectionChange])

  return (
    <div className="multi-select">
      {allowSelectAll && (
        <div className="select-all-controls">
          <button 
            onClick={handleSelectAll}
            className={allSelected ? 'deselect-all' : 'select-all'}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="selection-count">
            {size} of {items.length} selected
            {maxSelection && ` (max ${maxSelection})`}
          </span>
        </div>
      )}
      
      <div className="items-list">
        {items.map(item => {
          const itemId = getItemId(item)
          const isSelected = has(itemId)
          const canSelect = canSelectMore || isSelected
          
          return (
            <div 
              key={itemId}
              className={`item ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
              onClick={() => canSelect && handleToggleItem(item)}
            >
              {renderItem(item, isSelected)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Tag input component with HashSet
const TagInput: React.FC<{
  tags: string[]
  onTagsChange: (tags: string[]) => void
  suggestions?: string[]
  maxTags?: number
}> = ({ tags, onTagsChange, suggestions = [], maxTags }) => {
  const [inputValue, setInputValue] = useState('')
  const {
    set: tagSet,
    add: addTag,
    remove: removeTag,
    has: hasTag,
    size: tagCount,
    values: tagValues
  } = useHashSetState<string>(HashSet.fromIterable(tags))

  // Filtered suggestions (not already added)
  const availableSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => !hasTag(suggestion))
  }, [suggestions, hasTag])

  const canAddMore = !maxTags || tagCount < maxTags

  const handleAddTag = useCallback((tag: string) => {
    if (tag.trim() && !hasTag(tag) && canAddMore) {
      addTag(tag.trim())
    }
  }, [addTag, hasTag, canAddMore])

  const handleRemoveTag = useCallback((tag: string) => {
    removeTag(tag)
  }, [removeTag])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleAddTag(inputValue)
      setInputValue('')
    }
  }, [inputValue, handleAddTag])

  // Sync with external tags prop
  React.useEffect(() => {
    onTagsChange(tagValues)
  }, [tagValues, onTagsChange])

  return (
    <div className="tag-input">
      <div className="tag-list">
        {tagValues.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <button 
              onClick={() => handleRemoveTag(tag)}
              className="remove-tag"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={canAddMore ? "Add tag..." : "Maximum tags reached"}
        disabled={!canAddMore}
        className="tag-input-field"
      />
      
      {availableSuggestions.length > 0 && (
        <div className="suggestions">
          {availableSuggestions.slice(0, 5).map(suggestion => (
            <button
              key={suggestion}
              onClick={() => handleAddTag(suggestion)}
              className="suggestion"
              disabled={!canAddMore}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <div className="tag-info">
        {tagCount} tags {maxTags && `(${maxTags - tagCount} remaining)`}
      </div>
    </div>
  )
}
```

### Testing Strategies with HashSet

HashSet's deterministic behavior and structural equality make it excellent for testing, especially when dealing with collections and state verification.

```typescript
import { HashSet, Equal, Data } from "effect"
import { describe, it, expect, beforeEach } from "@jest/globals"

// Test data structures
const TestUser = Data.struct({
  id: String,
  name: String,
  email: String,
  roles: Data.array(String)
})

type TestUser = typeof TestUser.Type

// Custom matchers for HashSet testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toContainExactly<T>(expected: T[]): R
      toHaveHashSetSize(size: number): R
      toBeSubsetOf<T>(superset: HashSet.HashSet<T>): R
    }
  }
}

// Jest custom matchers
expect.extend({
  toContainExactly(received: HashSet.HashSet<any>, expected: any[]) {
    const receivedValues = HashSet.toValues(received).sort()
    const expectedValues = [...expected].sort()
    
    const pass = JSON.stringify(receivedValues) === JSON.stringify(expectedValues)
    
    return {
      message: () => pass
        ? `Expected HashSet not to contain exactly [${expectedValues.join(', ')}]`
        : `Expected HashSet to contain exactly [${expectedValues.join(', ')}], but got [${receivedValues.join(', ')}]`,
      pass
    }
  },

  toHaveHashSetSize(received: HashSet.HashSet<any>, expected: number) {
    const actualSize = HashSet.size(received)
    const pass = actualSize === expected
    
    return {
      message: () => pass
        ? `Expected HashSet not to have size ${expected}`
        : `Expected HashSet to have size ${expected}, but got ${actualSize}`,
      pass
    }
  },

  toBeSubsetOf(received: HashSet.HashSet<any>, expected: HashSet.HashSet<any>) {
    const pass = HashSet.isSubset(received, expected)
    
    return {
      message: () => pass
        ? `Expected HashSet not to be subset of given set`
        : `Expected HashSet to be subset of given set`,
      pass
    }
  }
})

// Test utilities
class HashSetTestUtils {
  // Property-based testing helper
  static generateRandomSet<T>(
    generator: () => T,
    minSize = 0,
    maxSize = 100
  ): HashSet.HashSet<T> {
    const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize
    const items: T[] = []
    
    for (let i = 0; i < size * 2; i++) { // Generate more to account for duplicates
      items.push(generator())
    }
    
    return HashSet.fromIterable(items)
  }

  // Set relationship testing
  static assertSetRelationships<T>(
    setA: HashSet.HashSet<T>,
    setB: HashSet.HashSet<T>,
    expectedRelation: 'disjoint' | 'subset' | 'superset' | 'equal' | 'overlapping'
  ): void {
    const intersection = HashSet.intersection(setA, setB)
    const isDisjoint = HashSet.size(intersection) === 0
    const isSubset = HashSet.isSubset(setA, setB)
    const isSuperset = HashSet.isSubset(setB, setA)
    const isEqual = isSubset && isSuperset
    const hasOverlap = HashSet.size(intersection) > 0

    switch (expectedRelation) {
      case 'disjoint':
        expect(isDisjoint).toBe(true)
        break
      case 'subset':
        expect(isSubset && !isEqual).toBe(true)
        break
      case 'superset':
        expect(isSuperset && !isEqual).toBe(true)
        break
      case 'equal':
        expect(isEqual).toBe(true)
        break
      case 'overlapping':
        expect(hasOverlap && !isSubset && !isSuperset).toBe(true)
        break
    }
  }

  // Performance testing
  static measurePerformance<T>(
    operation: () => T,
    name: string,
    iterations = 1000
  ): { result: T; avgTime: number; totalTime: number } {
    const start = performance.now()
    let result: T
    
    for (let i = 0; i < iterations; i++) {
      result = operation()
    }
    
    const totalTime = performance.now() - start
    const avgTime = totalTime / iterations
    
    console.log(`${name}: ${avgTime.toFixed(3)}ms avg (${totalTime.toFixed(1)}ms total)`)
    
    return { result: result!, avgTime, totalTime }
  }
}

// Comprehensive test suite
describe('HashSet Advanced Testing', () => {
  let userSet: HashSet.HashSet<TestUser>
  let adminUsers: TestUser[]
  let regularUsers: TestUser[]

  beforeEach(() => {
    adminUsers = [
      TestUser({ id: '1', name: 'Admin One', email: 'admin1@test.com', roles: ['admin', 'user'] }),
      TestUser({ id: '2', name: 'Admin Two', email: 'admin2@test.com', roles: ['admin', 'moderator'] })
    ]
    
    regularUsers = [
      TestUser({ id: '3', name: 'User One', email: 'user1@test.com', roles: ['user'] }),
      TestUser({ id: '4', name: 'User Two', email: 'user2@test.com', roles: ['user'] }),
      TestUser({ id: '5', name: 'User Three', email: 'user3@test.com', roles: ['user'] })
    ]

    userSet = HashSet.fromIterable([...adminUsers, ...regularUsers])
  })

  describe('Basic Operations', () => {
    it('should maintain uniqueness with structural equality', () => {
      const user1 = TestUser({ id: '1', name: 'Test', email: 'test@test.com', roles: ['user'] })
      const user2 = TestUser({ id: '1', name: 'Test', email: 'test@test.com', roles: ['user'] })
      
      const set = HashSet.make(user1, user2)
      
      expect(set).toHaveHashSetSize(1)
      expect(Equal.equals(user1, user2)).toBe(true)
    })

    it('should handle large datasets efficiently', () => {
      const largeSet = HashSetTestUtils.generateRandomSet(
        () => Math.floor(Math.random() * 10000),
        5000,
        5000
      )

      const { avgTime } = HashSetTestUtils.measurePerformance(
        () => HashSet.has(largeSet, 5000),
        'Lookup in large set',
        1000
      )

      expect(avgTime).toBeLessThan(1) // Should be sub-millisecond
    })
  })

  describe('Set Theory Operations', () => {
    it('should correctly compute complex set relationships', () => {
      const adminSet = HashSet.fromIterable(adminUsers)
      const regularSet = HashSet.fromIterable(regularUsers)
      
      // Test disjoint relationship
      HashSetTestUtils.assertSetRelationships(adminSet, regularSet, 'disjoint')
      
      // Test union
      const allUsers = HashSet.union(adminSet, regularSet)
      expect(allUsers).toHaveHashSetSize(5)
      
      // Test that admin set is subset of all users
      expect(adminSet).toBeSubsetOf(allUsers)
    })

    it('should handle set operations with overlapping data', () => {
      const set1 = HashSet.make(1, 2, 3, 4, 5)
      const set2 = HashSet.make(3, 4, 5, 6, 7)
      
      const intersection = HashSet.intersection(set1, set2)
      const union = HashSet.union(set1, set2)
      const difference = HashSet.difference(set1, set2)
      
      expect(intersection).toContainExactly([3, 4, 5])
      expect(union).toContainExactly([1, 2, 3, 4, 5, 6, 7])
      expect(difference).toContainExactly([1, 2])
    })
  })

  describe('Property-Based Testing', () => {
    it('should maintain set properties under random operations', () => {
      // Property: Union is commutative
      for (let i = 0; i < 100; i++) {
        const setA = HashSetTestUtils.generateRandomSet(() => Math.floor(Math.random() * 100))
        const setB = HashSetTestUtils.generateRandomSet(() => Math.floor(Math.random() * 100))
        
        const unionAB = HashSet.union(setA, setB)
        const unionBA = HashSet.union(setB, setA)
        
        expect(HashSet.toValues(unionAB).sort()).toEqual(HashSet.toValues(unionBA).sort())
      }
    })

    it('should maintain intersection properties', () => {
      // Property: Intersection is idempotent
      for (let i = 0; i < 50; i++) {
        const set = HashSetTestUtils.generateRandomSet(() => Math.floor(Math.random() * 50))
        const intersection = HashSet.intersection(set, set)
        
        expect(HashSet.toValues(intersection).sort()).toEqual(HashSet.toValues(set).sort())
      }
    })

    it('should maintain size relationships', () => {
      // Property: |A ∪ B| = |A| + |B| - |A ∩ B|
      for (let i = 0; i < 50; i++) {
        const setA = HashSetTestUtils.generateRandomSet(() => Math.floor(Math.random() * 50))
        const setB = HashSetTestUtils.generateRandomSet(() => Math.floor(Math.random() * 50))
        
        const sizeA = HashSet.size(setA)
        const sizeB = HashSet.size(setB)
        const sizeUnion = HashSet.size(HashSet.union(setA, setB))
        const sizeIntersection = HashSet.size(HashSet.intersection(setA, setB))
        
        expect(sizeUnion).toBe(sizeA + sizeB - sizeIntersection)
      }
    })
  })

  describe('Batch Operations', () => {
    it('should handle batch operations efficiently', () => {
      const baseSet = HashSet.fromIterable(Array.from({ length: 1000 }, (_, i) => i))
      const itemsToAdd = Array.from({ length: 500 }, (_, i) => i + 1000)
      
      const { avgTime: individualTime } = HashSetTestUtils.measurePerformance(
        () => {
          let result = baseSet
          itemsToAdd.forEach(item => {
            result = HashSet.add(result, item)
          })
          return result
        },
        'Individual operations',
        100
      )

      const { avgTime: batchTime } = HashSetTestUtils.measurePerformance(
        () => HashSet.mutate(baseSet, draft => {
          itemsToAdd.forEach(item => HashSet.add(draft, item))
        }),
        'Batch operations',
        100
      )

      expect(batchTime).toBeLessThan(individualTime)
      console.log(`Batch operations are ${(individualTime / batchTime).toFixed(2)}x faster`)
    })
  })

  describe('Immutability Testing', () => {
    it('should never mutate original sets', () => {
      const original = HashSet.make(1, 2, 3)
      const originalValues = HashSet.toValues(original)
      
      // Perform various operations
      const withAddition = HashSet.add(original, 4)
      const withRemoval = HashSet.remove(original, 2)
      const withUnion = HashSet.union(original, HashSet.make(5, 6))
      
      // Original should be unchanged
      expect(HashSet.toValues(original)).toEqual(originalValues)
      expect(original).toContainExactly([1, 2, 3])
      
      // New sets should have expected values
      expect(withAddition).toContainExactly([1, 2, 3, 4])
      expect(withRemoval).toContainExactly([1, 3])
      expect(withUnion).toContainExactly([1, 2, 3, 5, 6])
    })
  })
})

// Integration testing with external libraries
describe('HashSet Integration', () => {
  it('should work with JSON serialization', () => {
    const original = HashSet.make(
      TestUser({ id: '1', name: 'Test', email: 'test@test.com', roles: ['user'] }),
      TestUser({ id: '2', name: 'Test2', email: 'test2@test.com', roles: ['admin'] })
    )
    
    // Serialize and deserialize
    const serialized = JSON.stringify(HashSet.toValues(original))
    const deserialized = HashSet.fromIterable(JSON.parse(serialized).map(TestUser))
    
    expect(HashSet.size(deserialized)).toBe(HashSet.size(original))
    expect(HashSet.toValues(deserialized)).toEqual(HashSet.toValues(original))
  })

  it('should integrate with Array methods', () => {
    const hashSet = HashSet.make(1, 2, 3, 4, 5)
    
    // Convert to array, apply array operations, convert back
    const result = hashSet.pipe(
      HashSet.toValues,
      arr => arr.filter(x => x % 2 === 0),
      arr => arr.map(x => x * 2),
      HashSet.fromIterable
    )
    
    expect(result).toContainExactly([4, 8])
  })
})
```

## Conclusion

HashSet provides efficient, immutable set operations with structural sharing for functional programming applications. Its key benefits include O(1) average-case operations, built-in set theory operations, and seamless integration with Effect's type system.

Key benefits:
- **Performance**: O(1) average lookup, insertion, and removal with structural sharing for memory efficiency
- **Immutability**: Persistent data structure that preserves previous states while enabling efficient updates
- **Set Operations**: Built-in mathematical operations (union, intersection, difference) with optimized implementations
- **Type Safety**: Full integration with Effect's Equal trait for custom equality semantics and type-safe operations
- **Functional Composition**: Designed for pipe-based composition and functional programming patterns

HashSet is ideal for applications requiring unique collections, deduplication, permission systems, caching, state management, and any scenario where mathematical set operations are needed with functional programming guarantees.
