# Code Reviewer Agent Design

> Phase 2 output for code-reviewer agent creation

---

## Review Methodology

### Step 1: Scope Definition

The agent first determines the scope of the review:

1. **Single File Review**
   - Target: Specific file path provided by user
   - Depth: All rules checked
   - Output: Detailed issue list with fixes

2. **Package Review**
   - Target: All `.ts` files in a package directory
   - Depth: All rules checked
   - Output: Summary + prioritized issue list

3. **Focused Review**
   - Target: File or package
   - Focus: Specific category (Effect Patterns, Architecture, Types, etc.)
   - Output: Category-specific issues only

### Step 2: Static Analysis via Grep

Run detection patterns sequentially by category:

```
1. Effect Pattern Detection
   ├── Named imports check
   ├── Async/await detection
   ├── Native method detection
   ├── Lowercase Schema detection
   ├── Native Date detection
   └── Switch statement detection

2. Architecture Detection
   ├── Deep relative path check
   └── Cross-slice import check

3. Type Safety Detection
   ├── any type check
   └── ts-ignore/expect-error check

4. Documentation Detection (optional)
   └── Missing JSDoc check
```

### Step 3: Issue Classification

Each issue is classified with:

| Field        | Description                               |
|--------------|-------------------------------------------|
| Severity     | HIGH / MEDIUM / LOW                       |
| Category     | Effect / Architecture / Types / Docs      |
| Location     | `file_path:line_number`                   |
| Problem      | Current code snippet                      |
| Explanation  | Why this violates the rules               |
| Fix          | Corrected code snippet                    |
| Auto-Fixable | Yes / No / Partial                        |

### Step 4: Fix Generation

For each issue, generate:

1. **Before snippet** - The problematic code with context
2. **Explanation** - Why it's wrong, referencing specific rule
3. **After snippet** - The corrected code
4. **Alternative** (if applicable) - Other valid approaches

---

## Output Format Specification

### Review Header

```markdown
# Code Review: [File/Package Name]

**Reviewed**: YYYY-MM-DD
**Scope**: Single File / Package / Focused ([Category])
**Target**: `path/to/target`

## Summary

| Category        | Issues | Severity Distribution |
|-----------------|--------|----------------------|
| Effect Patterns | N      | H:X M:Y L:Z         |
| Architecture    | N      | H:X M:Y L:Z         |
| Type Safety     | N      | H:X M:Y L:Z         |
| Documentation   | N      | H:X M:Y L:Z         |
| **Total**       | N      |                      |

**Overall Status**: PASS / NEEDS_WORK / CRITICAL

### Status Definitions
- **PASS**: No HIGH issues, fewer than 3 MEDIUM issues
- **NEEDS_WORK**: 1-3 HIGH issues or 3+ MEDIUM issues
- **CRITICAL**: More than 3 HIGH issues
```

### Issue Format

```markdown
### Issue [N]: [Short Title]

**Severity**: HIGH | MEDIUM | LOW
**Category**: Effect Patterns | Architecture | Type Safety | Documentation
**Location**: `src/services/UserService.ts:42`
**Auto-Fixable**: Yes | No | Partial

**Problem**:
```typescript
// Line 42-45
const users = await userRepo.findAll();
const names = users.map(u => u.name);
```

**Rule Violated**: No async/await in application code (EFFECT_PATTERNS.md)

**Why It's Wrong**:
Uses `async/await` instead of Effect.gen pattern, and native `.map()` instead of `A.map()`.

**Fix**:
```typescript
// Lines 42-45 corrected
const users = yield* userRepo.findAll();
const names = F.pipe(users, A.map(u => u.name));
```
```

### Recommendations Section

```markdown
## Recommendations

### Priority Actions
1. [Highest impact fix first]
2. [Second priority]
3. [Third priority]

### Patterns to Adopt
- [Pattern recommendation based on issues found]

### Auto-Fix Script
If applicable, provide bash commands or code modifications:
```bash
# Fix all named Effect imports
sed -i 's/import { Effect } from "effect"/import * as Effect from "effect\/Effect"/g' file.ts
```
```

---

## Severity Guidelines

### HIGH Severity (Must Fix Before Merge)

These violations break core project patterns and can cause issues:

| Violation                  | Reason                                      |
|----------------------------|---------------------------------------------|
| Named Effect imports       | Breaks tree-shaking, inconsistent patterns  |
| async/await usage          | Breaks Effect error handling and composition|
| Cross-slice imports        | Violates architecture, creates coupling     |
| any type                   | Loses type safety                           |
| @ts-ignore without comment | Hidden type errors                          |

### MEDIUM Severity (Should Fix)

These violations reduce code quality but don't break functionality:

| Violation                  | Reason                                      |
|----------------------------|---------------------------------------------|
| Native array methods       | Inconsistent with Effect patterns           |
| Native string methods      | Inconsistent with Effect patterns           |
| new Date()                 | Mutable, timezone-unsafe                    |
| Deep relative imports      | Hard to maintain                            |
| Switch statements          | Not exhaustive, not type-safe               |

### LOW Severity (Nice to Have)

These are style/documentation issues:

| Violation                  | Reason                                      |
|----------------------------|---------------------------------------------|
| Missing JSDoc              | Reduces discoverability                     |
| Missing @example           | Reduces usability                           |
| Style inconsistencies      | Minor maintenance overhead                  |

---

## Grep Pattern Library

### Effect Patterns

| Violation           | Grep Pattern                                          | Severity |
|---------------------|-------------------------------------------------------|----------|
| Named imports       | `import \{.*\} from ['\"]effect`                      | HIGH     |
| async keyword       | `async (function\|\(\|[a-zA-Z])`                      | HIGH     |
| await keyword       | `\bawait\s`                                           | HIGH     |
| Lowercase Schema    | `S\.(struct\|array\|string\|number\|boolean)`         | HIGH     |
| Array.map           | `\.map\(`                                             | MEDIUM   |
| Array.filter        | `\.filter\(`                                          | MEDIUM   |
| Array.reduce        | `\.reduce\(`                                          | MEDIUM   |
| String.split        | `\.split\(`                                           | MEDIUM   |
| String.trim         | `\.trim\(`                                            | MEDIUM   |
| new Date            | `new Date\(`                                          | MEDIUM   |
| switch statement    | `switch\s*\(`                                         | MEDIUM   |
| typeof check        | `typeof\s+\w+\s*===`                                  | LOW      |

### Architecture

| Violation           | Grep Pattern                                          | Severity |
|---------------------|-------------------------------------------------------|----------|
| Deep relative       | `from ['\"]\.\.\/\.\.\/\.\.`                          | MEDIUM   |
| Cross-slice (iam)   | `from ['\"]@beep/iam` (in non-iam package)            | HIGH     |
| Cross-slice (docs)  | `from ['\"]@beep/documents` (in non-docs package)     | HIGH     |

### Type Safety

| Violation           | Grep Pattern                                          | Severity |
|---------------------|-------------------------------------------------------|----------|
| any type            | `: any\b\|as any\b`                                   | HIGH     |
| ts-ignore           | `@ts-ignore`                                          | HIGH     |
| ts-expect-error     | `@ts-expect-error`                                    | MEDIUM   |

---

## Review Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    CODE REVIEW AGENT                        │
├─────────────────────────────────────────────────────────────┤
│  1. SCOPE                                                   │
│     ├── Determine target (file/package)                     │
│     └── Determine focus (all/category)                      │
├─────────────────────────────────────────────────────────────┤
│  2. DETECT                                                  │
│     ├── Run grep patterns for each category                 │
│     ├── Parse results with file:line references             │
│     └── Read context around violations                      │
├─────────────────────────────────────────────────────────────┤
│  3. CLASSIFY                                                │
│     ├── Assign severity (HIGH/MEDIUM/LOW)                   │
│     ├── Assign category                                     │
│     └── Determine auto-fixability                           │
├─────────────────────────────────────────────────────────────┤
│  4. GENERATE FIXES                                          │
│     ├── Read full context for each issue                    │
│     ├── Generate before/after code                          │
│     └── Write explanation                                   │
├─────────────────────────────────────────────────────────────┤
│  5. OUTPUT                                                  │
│     ├── Write summary table                                 │
│     ├── Write detailed issues                               │
│     ├── Write recommendations                               │
│     └── Determine overall status                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Example Review Output

```markdown
# Code Review: packages/iam/server/src/services/UserService.ts

**Reviewed**: 2025-01-10
**Scope**: Single File
**Target**: `packages/iam/server/src/services/UserService.ts`

## Summary

| Category        | Issues | Severity Distribution |
|-----------------|--------|----------------------|
| Effect Patterns | 3      | H:2 M:1 L:0         |
| Architecture    | 0      | H:0 M:0 L:0         |
| Type Safety     | 1      | H:1 M:0 L:0         |
| Documentation   | 1      | H:0 M:0 L:1         |
| **Total**       | 5      |                      |

**Overall Status**: CRITICAL (3 HIGH issues)

---

### Issue 1: Async/Await Usage

**Severity**: HIGH
**Category**: Effect Patterns
**Location**: `packages/iam/server/src/services/UserService.ts:15`
**Auto-Fixable**: No

**Problem**:
```typescript
// Line 15-18
export async function findUserById(id: UserId) {
  const user = await userRepo.findById(id);
  return user;
}
```

**Rule Violated**: No async/await in application code (EFFECT_PATTERNS.md)

**Why It's Wrong**:
Uses `async/await` which breaks Effect's error channel and composition model.

**Fix**:
```typescript
// Lines 15-18 corrected
export const findUserById = (id: UserId) =>
  Effect.gen(function* () {
    const user = yield* userRepo.findById(id);
    return user;
  });
```

---

### Issue 2: Native Array Method

**Severity**: MEDIUM
**Category**: Effect Patterns
**Location**: `packages/iam/server/src/services/UserService.ts:25`
**Auto-Fixable**: Yes

**Problem**:
```typescript
// Line 25
const names = users.map(u => u.name);
```

**Rule Violated**: No native array methods (EFFECT_PATTERNS.md)

**Fix**:
```typescript
// Line 25 corrected
const names = F.pipe(users, A.map(u => u.name));
```

---

## Recommendations

### Priority Actions
1. Convert all async functions to Effect.gen pattern
2. Replace native array methods with A.* utilities
3. Add explicit type annotation to replace `any`

### Auto-Fix Script
```bash
# Add required imports at top of file
sed -i '1i import * as A from "effect/Array";' packages/iam/server/src/services/UserService.ts
```
```
