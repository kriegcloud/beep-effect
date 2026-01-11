# Code Reviewer Research Findings

> Generated during Phase 1 of code-reviewer agent creation

---

## Complete Rules Checklist

### Effect Pattern Rules (HIGH Severity)

- [ ] **Namespace imports only** - Must use `import * as Effect from "effect/Effect"`, not named imports
- [ ] **Correct aliases** - Use standardized abbreviations: `S`, `A`, `O`, `R`, `Str`, `F`, `P`, `B`, `Bool`, `Num`, `BI`, `AST`, `DateTime`, `Match`, `M`
- [ ] **No async/await** - All async code must use `Effect.gen` with `yield*`
- [ ] **No native array methods** - Use `A.map`, `A.filter`, `A.reduce`, etc.
- [ ] **No native string methods** - Use `Str.split`, `Str.trim`, `Str.toUpperCase`, etc.
- [ ] **PascalCase Schema constructors** - `S.Struct`, `S.Array`, `S.String` (never lowercase)
- [ ] **No native Date** - Use `effect/DateTime` for all date/time operations
- [ ] **No switch statements** - Use `effect/Match` for pattern matching
- [ ] **No typeof/instanceof** - Use `effect/Predicate` for type guards
- [ ] **Use Effect collections** - `HashMap`, `HashSet` instead of `Map`, `Set`

### Architecture Rules (HIGH Severity)

- [ ] **No cross-slice imports** - Each slice isolated: `iam`, `documents`, `comms`, `customization`
- [ ] **Layer order respected** - `domain -> tables -> server -> client -> ui`
- [ ] **@beep/* path aliases only** - Never use direct package paths
- [ ] **No ../../../ relative paths** - Use path aliases for all imports
- [ ] **Cross-slice via shared only** - Access other slices through `packages/shared/*` or `packages/common/*`

### Type Safety Rules (MEDIUM Severity)

- [ ] **No `any` type** - All types must be explicit
- [ ] **No @ts-ignore** - Fix type errors properly
- [ ] **No @ts-expect-error** - Unless with explanation comment
- [ ] **No unchecked casts** - Use Schema validation for external data
- [ ] **External data validation** - Use `@beep/schema` for all external inputs

### Code Quality Rules (MEDIUM Severity)

- [ ] **Use @beep/utils no-ops** - `nullOp`, `noOp`, `nullOpE` instead of inline functions
- [ ] **Effect logging** - Use `Effect.log*` with structured objects
- [ ] **Effect error types** - Use `Schema.TaggedError` for error definitions
- [ ] **Effect testing** - Use `@beep/testkit` utilities

### Documentation Rules (LOW Severity)

- [ ] **JSDoc on public exports** - All exported functions/types
- [ ] **@example blocks** - Include usage examples
- [ ] **@category and @since tags** - Proper metadata

---

## Effect Pattern Reference

### Complete Alias Table

| Module             | Alias    | Usage Example                         |
|--------------------|----------|---------------------------------------|
| effect/Array       | A        | `A.map`, `A.filter`, `A.findFirst`    |
| effect/BigInt      | BI       | `BI.fromNumber`, `BI.add`             |
| effect/Number      | Num      | `Num.greaterThan`, `Num.lessThan`     |
| effect/Predicate   | P        | `P.isString`, `P.isNumber`, `P.and`   |
| effect/Function    | F        | `F.pipe`, `F.flow`, `F.identity`      |
| effect/Option      | O        | `O.some`, `O.none`, `O.map`           |
| effect/Record      | R        | `R.map`, `R.values`, `R.keys`         |
| effect/Schema      | S        | `S.Struct`, `S.Array`, `S.String`     |
| effect/String      | Str      | `Str.split`, `Str.trim`, `Str.charAt` |
| effect/Brand       | B        | `B.nominal`, `B.refined`              |
| effect/Boolean     | Bool     | `Bool.and`, `Bool.or`, `Bool.not`     |
| effect/SchemaAST   | AST      | AST manipulation                      |
| effect/DateTime    | DateTime | `DateTime.now`, `DateTime.add`        |
| effect/Match       | Match    | `Match.value`, `Match.tag`            |
| @effect/sql/Model  | M        | `M.make`, Model definitions           |

### Full Namespace Imports (no aliases)

| Module           | Usage                                    |
|------------------|------------------------------------------|
| effect/Effect    | `Effect.gen`, `Effect.succeed`, `Effect.fail` |
| effect/Layer     | `Layer.succeed`, `Layer.effect`          |
| effect/Context   | `Context.Tag`, `Context.GenericTag`      |
| effect/Struct    | `Struct.pick`, `Struct.omit`, `Struct.keys` |
| effect/Cause     | `Cause.fail`, `Cause.die`                |
| effect/HashMap   | `HashMap.empty`, `HashMap.set`           |
| effect/HashSet   | `HashSet.empty`, `HashSet.add`           |

### Forbidden Patterns with Examples

#### 1. Named Imports from Effect
```typescript
// FORBIDDEN
import { Effect, pipe } from "effect";
import { Schema } from "@effect/schema";

// REQUIRED
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as F from "effect/Function";
```

#### 2. Async/Await Usage
```typescript
// FORBIDDEN
async function fetchUser(id: string) {
  const user = await userRepo.findById(id);
  return user;
}

// REQUIRED
const fetchUser = (id: string) =>
  Effect.gen(function* () {
    const user = yield* userRepo.findById(id);
    return user;
  });
```

#### 3. Native Array Methods
```typescript
// FORBIDDEN
items.map(x => x.name);
items.filter(x => x.active);
Array.from(iterable);

// REQUIRED
F.pipe(items, A.map(x => x.name));
F.pipe(items, A.filter(x => x.active));
F.pipe(iterable, A.fromIterable);
```

#### 4. Native String Methods
```typescript
// FORBIDDEN
str.split(",");
str.trim();
str.toUpperCase();

// REQUIRED
F.pipe(str, Str.split(","));
F.pipe(str, Str.trim);
F.pipe(str, Str.toUpperCase);
```

#### 5. Lowercase Schema Constructors
```typescript
// FORBIDDEN
S.struct({ name: S.string });
S.array(S.number);

// REQUIRED
S.Struct({ name: S.String });
S.Array(S.Number);
```

#### 6. Native Date Usage
```typescript
// FORBIDDEN
new Date();
date.getMonth() + 1;
date.toISOString();

// REQUIRED
DateTime.unsafeNow();
DateTime.toParts(date).month;
DateTime.formatIso(date);
```

#### 7. Switch Statements
```typescript
// FORBIDDEN
switch (response._tag) {
  case "loading": return "...";
  case "success": return data;
  default: return null;
}

// REQUIRED
Match.value(response).pipe(
  Match.tag("loading", () => "..."),
  Match.tag("success", (r) => r.data),
  Match.exhaustive
);
```

#### 8. Typeof/Instanceof Checks
```typescript
// FORBIDDEN
typeof x === "string"
x instanceof Date
Array.isArray(x)

// REQUIRED
P.isString(x)
P.isDate(x)
P.isArray(x)
```

---

## Architecture Boundary Map

### Vertical Slices

```
packages/
├── iam/           # Identity & Access Management
│   ├── domain/    # IAM entity models
│   ├── tables/    # Drizzle schemas
│   ├── server/    # Better Auth, repos
│   ├── client/    # Auth client contracts
│   └── ui/        # Auth UI flows
├── documents/     # Document Management
│   ├── domain/    # Files domain
│   ├── tables/    # Drizzle schemas
│   ├── server/    # DocumentsDb, S3
│   ├── client/    # Documents contracts
│   └── ui/        # React components
├── comms/         # Communications
│   ├── domain/    # Comms models
│   ├── tables/    # Drizzle schemas
│   ├── server/    # Comms infrastructure
│   ├── client/    # Comms contracts
│   └── ui/        # Comms components
└── customization/ # User Customization
    ├── domain/    # Customization models
    ├── tables/    # Drizzle schemas
    ├── server/    # Customization infrastructure
    ├── client/    # Customization contracts
    └── ui/        # Customization components
```

### Layer Dependency Order

```
domain -> tables -> server -> client -> ui
```

Each layer can only depend on layers to its left:
- `tables` can import from `domain`
- `server` can import from `domain` and `tables`
- `client` can import from `domain`, `tables`, and `server`
- `ui` can import from all other layers in the slice

### Cross-Slice Access Rules

| Package Type     | Can Import From                      |
|------------------|--------------------------------------|
| Slice packages   | Same slice + shared/* + common/*    |
| shared/*         | common/* only                        |
| common/*         | Other common/* packages only         |
| apps/*           | Any package via @beep/* aliases     |

### Forbidden Cross-Slice Imports

```typescript
// FORBIDDEN - Direct cross-slice import
import { User } from "@beep/iam-domain";  // in documents/server

// REQUIRED - Access via shared layer
import { SharedPolicy } from "@beep/shared-domain";
```

---

## Common Violations Found in Codebase

### Violation Summary

| Category               | Files Affected | Total Occurrences |
|------------------------|----------------|-------------------|
| async/await usage      | 20+            | ~65               |
| any type               | 20+            | ~29               |
| Native methods         | 20+            | ~52               |
| Named Effect imports   | 20+            | 20+               |
| Deep relative paths    | 20+            | 20+               |
| @ts-ignore/expect-error| 20+            | 20+               |
| new Date()             | 18             | ~35               |
| Lowercase Schema       | 0              | 0 (good!)         |

### High-Priority Files for Review

**async/await violations**:
- `packages/ui/core/src/i18n/server.ts` (8 occurrences)
- `packages/iam/client/src/clients/user/user.forms.ts` (10 occurrences)
- `packages/iam/client/src/atom/sign-up/sign-up.forms.ts` (5 occurrences)

**Native method violations**:
- `packages/ui/core/src/theme/core/mixins/background.ts` (4 occurrences)
- `packages/ui/core/src/utils/classes.ts` (4 occurrences)
- `packages/documents/server/src/handlers/Document.handlers.ts` (6 occurrences)

**Named Effect imports**:
- `packages/shared/client/src/atom/services/ImageCompressionClient.service.ts`
- `packages/common/utils/src/sqids.ts`
- `packages/common/schema/src/derived/kits/mapped-literal-kit.ts`

**new Date() violations**:
- `packages/common/utils/src/format-time.ts` (4 occurrences)
- `packages/common/schema/src/primitives/temporal/dates/date-time.ts` (4 occurrences)
- `packages/ui/ui/test/form/makeFormOptions.test.ts` (4 occurrences)

---

## Review Category Weights

| Category          | Severity | Weight | Auto-Fixable | Examples                        |
|-------------------|----------|--------|--------------|----------------------------------|
| Effect Patterns   | HIGH     | 40%    | Partial      | async/await, named imports       |
| Architecture      | HIGH     | 25%    | No           | Cross-slice imports              |
| Type Safety       | MEDIUM   | 20%    | No           | any, ts-ignore                   |
| Native Methods    | MEDIUM   | 10%    | Yes          | .map(), .filter(), .split()      |
| Documentation     | LOW      | 5%     | Partial      | Missing JSDoc                    |

---

## Detection Pattern Library

### Effect Import Violations

```bash
# Named imports from effect
grep -rE "import \{.*\} from ['\"]effect" packages/

# Named imports from @effect/*
grep -rE "import \{.*\} from ['\"]@effect/" packages/
```

### Async/Await Detection

```bash
# async function declarations
grep -rE "async (function|\(|[a-zA-Z])" packages/ --include="*.ts"

# await expressions
grep -rE "\bawait\s" packages/ --include="*.ts"
```

### Native Method Detection

```bash
# Array methods
grep -rE "\.(map|filter|reduce|forEach|find|findIndex|some|every|includes)\(" packages/ --include="*.ts"

# String methods
grep -rE "\.(split|trim|toUpperCase|toLowerCase|charAt|indexOf|slice|substring)\(" packages/ --include="*.ts"

# Object methods
grep -rE "Object\.(keys|values|entries|assign|fromEntries)\(" packages/ --include="*.ts"
```

### Type Safety Detection

```bash
# any type usage
grep -rE ": any\b|as any\b" packages/ --include="*.ts"

# ts-ignore/expect-error
grep -rE "@ts-ignore|@ts-expect-error" packages/ --include="*.ts"
```

### Architecture Detection

```bash
# Deep relative imports
grep -rE "from ['\"]\.\.\/\.\.\/\.\." packages/ --include="*.ts"

# Cross-slice imports (example for documents slice)
grep -rE "from ['\"]@beep/(iam|comms|customization)" packages/documents/ --include="*.ts"
```

### Date Usage Detection

```bash
# new Date() usage
grep -rE "new Date\(" packages/ --include="*.ts"

# Date methods
grep -rE "\.getDate\(|\.getMonth\(|\.getFullYear\(|\.getTime\(" packages/ --include="*.ts"
```

### Schema Case Detection

```bash
# Lowercase schema constructors (should find none)
grep -rE "S\.(struct|array|string|number|boolean|literal|union)\(" packages/ --include="*.ts"
```
