# P2 String Code Writer Agent

## Your Mission

Apply Effect String migrations to your assigned file.

## Import Statement

Add this import if not already present:

```typescript
import * as Str from "effect/String";
```

## Migration Patterns

### Basic Transformations

```typescript
// BEFORE: str.toLowerCase()
// AFTER:
Str.toLowerCase(str)

// BEFORE: str.toUpperCase()
// AFTER:
Str.toUpperCase(str)

// BEFORE: str.trim()
// AFTER:
Str.trim(str)

// BEFORE: str.trimStart()
// AFTER:
Str.trimStart(str)

// BEFORE: str.trimEnd()
// AFTER:
Str.trimEnd(str)
```

### Split Operations

```typescript
// BEFORE: str.split(",")
// AFTER:
Str.split(str, ",")

// BEFORE: str.split(/\s+/)
// AFTER:
Str.split(str, /\s+/)
```

### Slice/Substring

```typescript
// BEFORE: str.slice(0, 5)
// AFTER:
Str.slice(str, 0, 5)

// BEFORE: str.substring(2, 8)
// AFTER:
Str.slice(str, 2, 8)
```

### StartsWith/EndsWith/Includes

```typescript
// BEFORE: str.startsWith("prefix")
// AFTER:
Str.startsWith(str, "prefix")

// BEFORE: str.endsWith("suffix")
// AFTER:
Str.endsWith(str, "suffix")

// BEFORE: str.includes("search")
// AFTER:
Str.includes(str, "search")
```

### Replace Operations

```typescript
// BEFORE: str.replace("old", "new")
// AFTER:
Str.replace(str, "old", "new")

// BEFORE: str.replaceAll("old", "new")
// AFTER:
Str.replaceAll(str, "old", "new")

// BEFORE: str.replace(/pattern/g, "new")
// AFTER:
Str.replaceAll(str, /pattern/g, "new")
```

### Character Access (Returns Option)

```typescript
// BEFORE: str.charAt(0)
// AFTER:
import * as O from "effect/Option";
Str.charAt(str, 0)  // Returns Option<string>
// Caller may need: O.getOrElse(() => "")

// BEFORE: str.charCodeAt(0)
// AFTER:
Str.charCodeAt(str, 0)  // Returns Option<number>
```

### Padding

```typescript
// BEFORE: str.padStart(10, "0")
// AFTER:
Str.padStart(str, 10, "0")

// BEFORE: str.padEnd(10, " ")
// AFTER:
Str.padEnd(str, " ", 10)
```

### Length

```typescript
// BEFORE: str.length
// AFTER:
Str.length(str)
```

### Concatenation

```typescript
// BEFORE: str.concat(other)
// AFTER:
Str.concat(str, other)

// BEFORE: str1 + str2
// AFTER:
Str.concat(str1, str2)
// Note: Simple + concatenation is acceptable, but concat is more explicit
```

### Repeat

```typescript
// BEFORE: str.repeat(3)
// AFTER:
Str.repeat(str, 3)
```

## Method Chains

For chained string operations:

```typescript
// BEFORE:
str.toLowerCase().trim().split(",")

// AFTER (nested):
Str.split(Str.trim(Str.toLowerCase(str)), ",")

// AFTER (with pipe - preferred):
import { pipe } from "effect/Function";

pipe(
  str,
  Str.toLowerCase,
  Str.trim,
  Str.split(",")
)
```

## Critical Rules

1. **PRESERVE FUNCTIONALITY** - Code must work identically after migration
2. **ADD IMPORTS ONCE** - Check if import already exists
3. **HANDLE Option RETURNS** - `charAt`/`charCodeAt` return Option
4. **DON'T CHANGE UNRELATED CODE** - Only modify specific violations

## Verification

After changes:
```bash
bun tsc --noEmit --isolatedModules path/to/file.ts
```

## Completion

Mark checklist items complete when done:
```markdown
- [x] `path/to/file.ts:42` - `.toLowerCase()` - Replaced with `Str.toLowerCase(str)`
```
