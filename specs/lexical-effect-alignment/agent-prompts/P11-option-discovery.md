# P11 Option Discovery Agent

## Your Mission

Scan the specified scope for functions returning nullable/nullish values that could be refactored to return `Option<T>`.

## Scope

Same batching as previous phases.

Base path: `apps/todox/src/app/lexical/`

## Target Patterns

Search for these nullable return patterns:

### Function Return Types
```
\):\s*\w+\s*\|\s*null
\):\s*\w+\s*\|\s*undefined
\):\s*\w+\s*\|\s*null\s*\|\s*undefined
```

### Return Statements
```
return null;
return undefined;
return\s+\w+\s*\?\?\s*null
return\s+\w+\s*\|\|\s*null
```

### Conditional Returns
```
if\s*\([^)]+\)\s*return null
if\s*\([^)]+\)\s*return undefined
```

## Decision Criteria

### DO REFACTOR when:
- Function is internal to the lexical module
- Return type is `T | null` or `T | undefined`
- No external API requires nullable return
- Callers can be updated

### DO NOT REFACTOR when:
- Function is a React component prop
- Function is required by Lexical API to return nullable
- Function is an event handler with specific signature
- Function is exported and used outside lexical module

## Reference Example

From `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:42-57`:

```typescript
// This returns DOMConversionOutput | null - required by Lexical API
// DO NOT REFACTOR - Lexical requires nullable return
function $convertDateTimeElement(domNode: HTMLElement): DOMConversionOutput | null
```

The Lexical `DOMConversion` type requires `null` return. This is NOT a candidate.

## Checklist Format

```markdown
# P11 Option Discovery - Batch [N]

## Summary
- Files scanned: [count]
- Nullable functions found: [count]
- Candidates for Option migration: [count]
- Excluded (API requirements): [count]

## Candidates for Migration

### [relative/path/to/file.ts]
- [ ] `full/path:LINE` - `findUser(): User | null` - Internal function, can migrate to `Option<User>`
  - Callers: [list file:line of callers]

## Excluded (API Requirements)

### [relative/path/to/file.ts]
- `full/path:LINE` - `$convertElement(): DOMConversionOutput | null` - Lexical API requires nullable
- `full/path:LINE` - `onClick: () => void | undefined` - React event handler
```

## Caller Analysis

For each candidate, identify ALL callers:

```markdown
### Function: `findUser` in `utils/users.ts:42`
Current: `User | null`
Proposed: `Option<User>`

Callers (must update):
1. `components/UserCard.tsx:15` - `const user = findUser(id); if (user) ...`
2. `hooks/useUser.ts:23` - `return findUser(userId)`
```

## Critical Rules

1. **NO CODE CHANGES** - Only produce the checklist
2. **VERIFY API REQUIREMENTS** - Check if Lexical/React requires nullable
3. **LIST ALL CALLERS** - Each caller must be updated
4. **BE CONSERVATIVE** - When in doubt, exclude

## Common Exclusions

These patterns typically CANNOT be migrated:

```typescript
// Lexical node conversions
importDOM(): DOMConversionMap | null

// React refs
useRef<T>(null)

// Event handlers
onClick?: () => void

// Component props
children?: ReactNode

// Lexical commands
COMMAND.createCommand<T | null>()
```

## Output Impact Assessment

For each candidate, estimate:
- Number of callers to update
- Complexity of caller updates
- Risk of breaking functionality

High-impact candidates (many callers) should be flagged for careful review.
