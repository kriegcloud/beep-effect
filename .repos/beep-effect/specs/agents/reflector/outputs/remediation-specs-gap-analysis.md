# Documentation Gap Analysis: Remediation Specs Review

**Generated**: 2026-01-22
**Analyzed Specs**:
- `specs/knowledge-code-quality-audit` (18 violation categories, ~240 violations)
- `specs/iam-client-entity-alignment` (EntityId alignment for IAM client schemas)

---

## Executive Summary

Analysis of two remediation specs reveals **critical documentation gaps** that allowed systematic violations of Effect patterns, domain entity alignment, and architectural boundaries. The violations fall into three categories:

1. **Effect Pattern Violations** (18 categories in knowledge package) - Native JS methods, incorrect imports, missing Effect collections
2. **Domain Entity Misalignment** (IAM client) - Plain `S.String` IDs instead of branded EntityIds, missing transformation schemas
3. **Architectural Boundary Violations** - Both specs show cross-cutting violations not caught by existing rules

**Root Cause**: Existing documentation is **fragmented, incomplete, and lacks enforcement mechanisms**. Rules exist but are:
- Scattered across multiple files without clear hierarchy
- Missing concrete "NEVER do X" anti-patterns
- Lacking verification commands and automation checks
- Not integrated into development workflow (no pre-commit hooks, linting rules)

---

## Part 1: Violation Summary

### Knowledge Package Violations (240 total)

| Category | Count | Severity | Root Cause |
|----------|-------|----------|------------|
| V01: EntityId Table Typing | 19 | High | Missing rule: "ALWAYS add `.$type<EntityId.Type>()` to table columns" |
| V02: Duplicate Code | 9 | Medium | No pattern for shared utilities, copy-paste culture |
| V03: Native String Methods | 21 | Medium | Rule exists but examples are abstract, easy to miss |
| V04: Error Construction | 1 | Medium | No documentation on S.TaggedError patterns |
| V05: Array Emptiness | 35 | Medium | Rule exists but buried, no linting enforcement |
| V06: Native Error | 3 | Critical | Rule exists but not emphasized as "NEVER" pattern |
| V07: Switch Statements | 1 | Medium | Match module mentioned but no migration guide |
| V08: Object.entries | 4 | Medium | Rule exists but not prominent |
| V09: Native Set | 22 | Medium | Rule exists, no examples of MutableHashSet usage |
| V10: Native Array.map | 9 | Medium | Rule exists but grep pattern causes false positives |
| V11: Non-null Assertions | 26 | Medium | Option pattern exists, no "NEVER use !" rule |
| V12: Native Map | 39 | Medium | Rule exists, no MutableHashMap migration examples |
| V13: Native Array.sort | 3 | Medium | Rule mentions A.sort, no Order module examples |
| V14: EntityId Creation | 9 | Medium | No documentation on branded type factories |
| V15: String.toLowerCase | 14 | Low | Rule exists, not emphasized |
| V16: Native Date | 6 | Medium | DateTime module mentioned, no migration examples |
| V17: Array vs Chunk | 8 | Low | No guidance on when to prefer Chunk |
| V18: Empty Array Init | 11 | Medium | No rule for A.empty<T>() pattern |

### IAM Client Violations (63 ID fields)

| Violation Type | Count | Root Cause |
|----------------|-------|------------|
| Plain `S.String` for ID fields | 63 | No rule: "ALWAYS use branded EntityIds for ID fields" |
| Missing transformation schemas | 3 | Canonical pattern exists but not documented as requirement |
| `formValuesAnnotation` with EntityIds | 24 | No guidance on type casting for form compatibility |

---

## Part 2: Root Cause Analysis

### Gap 1: EntityId Usage (Critical)

**What Happened**:
- Knowledge: 19 table columns use plain `pg.text()` without `.$type<EntityId.Type>()`
- IAM Client: 63 schema fields use `S.String` instead of branded EntityIds
- Both packages had EntityIds defined but weren't using them

**Why Rules Failed**:
1. **No explicit table column rule** in `.claude/rules/effect-patterns.md`
2. **Schema Type Selection table** (effect-patterns.md line 54-72) doesn't mention EntityIds
3. **Database patterns doc** (database-patterns.md) covers domain models but NOT table columns
4. **No transformation schema requirement** documented anywhere

**Evidence**:
```typescript
// Knowledge violation (19 occurrences)
entityId: pg.text("entity_id").notNull(),
// Should be:
entityId: pg.text("entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

// IAM Client violation (63 occurrences)
id: S.String,
// Should be:
id: IamEntityIds.MemberId,
```

### Gap 2: Effect Collections Ban (High Volume)

**What Happened**:
- Native Set: 22 violations
- Native Map: 39 violations
- Native Array methods: 9 violations
- Total: 70 violations across 20+ files

**Why Rules Failed**:
1. **Native Method Ban** section (effect-patterns.md line 47-53) lacks concrete examples
2. **No MutableHashSet/MutableHashMap examples** in documentation
3. **No linting rules** to catch these at commit time
4. **Grep pattern for .map()** causes false positives (matches Effect.map, A.map)

**Evidence from reflection log**:
> "Grep pattern matched Effect.map, A.map, O.map alongside native array.map - high noise ratio"

### Gap 3: Domain Entity Alignment (Architectural)

**What Happened**:
- IAM Client schemas diverged from domain models
- Better Auth responses not transformed to domain entities
- Canonical pattern (`DomainUserFromBetterAuthUser`) existed but wasn't replicated

**Why Rules Failed**:
1. **No requirement** that client schemas must align with domain entities
2. **packages/shared/domain/src/entities/** not documented as canonical source of truth
3. **AGENTS.md files** (iam-client, iam-domain) don't cross-reference each other
4. **No verification command** to detect schema drift

### Gap 4: Shared Domain Entity Pattern (Missing Documentation)

**What Happened**:
- `packages/shared/domain/src/entities/` contains User, Organization, Team, Session
- `packages/shared/domain/src/entity-ids/` contains branded IDs for all slices
- Knowledge and IAM packages didn't consistently use these

**Why Rules Failed**:
1. **No documentation** for `packages/shared/domain/src/entities/README.md` (file doesn't exist)
2. **CLAUDE.md** mentions "shared-kernel entities" but doesn't explain structure
3. **Entity ID index** not documented (knowledge/ids.ts, iam/ids.ts, shared/ids.ts hierarchy)
4. **Cross-slice entity usage** pattern not documented

### Gap 5: Duplicate Code Pattern

**What Happened**:
- `extractLocalName` function duplicated 5 times
- Each duplicate contained V03/V15 violations (native string methods)
- Fixing duplicates first could have reduced total violations by 15-20

**Why Rules Failed**:
1. **No shared utilities pattern** documented
2. **No "extract to shared utils" guideline** in code quality section
3. **Remediation dependency ordering** not documented (fix duplicates before fixing violations inside duplicates)

---

## Part 3: Specific Documentation Changes

### Priority 1: Critical Rule Additions (Immediate)

#### A. Add EntityId Rules to `.claude/rules/effect-patterns.md`

**Location**: After "Schema Type Selection" section (currently line 72)

**Add New Section**:

```markdown
## EntityId Usage (MANDATORY)

### Domain Models

ALWAYS use branded EntityIds from `@beep/shared-domain` for ID fields in domain models:

```typescript
// REQUIRED
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Member extends M.Class<Member>("Member")({
  id: IamEntityIds.MemberId,
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
  ...
}) {}
```

NEVER use plain `S.String` for ID fields:

```typescript
// FORBIDDEN
export class Member extends S.Class<Member>({ id: S.String }) {}
```

### Table Columns

ALWAYS add `.$type<EntityId.Type>()` to table columns referencing entity IDs:

```typescript
// REQUIRED
import { KnowledgeEntityIds } from "@beep/knowledge-domain";

export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  ontologyId: pg.text("ontology_id").notNull()
    .$type<KnowledgeEntityIds.OntologyId.Type>(),
  documentId: pg.text("document_id")
    .$type<DocumentsEntityIds.DocumentId.Type>(),
});
```

NEVER use plain `pg.text()` for ID columns without `.$type<>()`:

```typescript
// FORBIDDEN
ontologyId: pg.text("ontology_id").notNull(),  // Missing .$type<>()
```

**Why**: `.$type<>()` provides compile-time type safety for joins and prevents mixing different entity ID types.

### Client Schemas

ALWAYS use branded EntityIds in client contract schemas:

```typescript
// REQUIRED
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  formValuesAnnotation({
    userId: "" as SharedEntityIds.UserId.Type,
    organizationId: "" as SharedEntityIds.OrganizationId.Type,
  })
) {}
```

**Note**: `formValuesAnnotation` requires type casting for branded types to maintain form compatibility.

### Transformation Schemas

When mapping external API responses (Better Auth, third-party APIs) to domain entities, ALWAYS create transformation schemas:

```typescript
// REQUIRED
export const DomainMemberFromBetterAuthMember = S.transformOrFail(
  BetterAuthMemberSchema,
  DomainMember.Model,
  {
    strict: true,
    decode: Effect.fn(function* (betterAuthMember, _options, ast) {
      // Validate ID format
      if (!IamEntityIds.MemberId.is(betterAuthMember.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, betterAuthMember.id, "Invalid member ID format")
        );
      }
      // ... rest of transformation
    }),
  }
);
```

**Why**: External APIs return plain strings. Transformation schemas validate format before accepting into domain layer.
```

**Rationale**: This violation affected 82 fields across two packages. Consolidating all EntityId rules into one section makes it impossible to miss.

---

#### B. Add "NEVER" Anti-Patterns to `.claude/rules/effect-patterns.md`

**Location**: After "Native Method Ban" section (currently line 53)

**Add New Section**:

```markdown
## NEVER Patterns (Forbidden)

These patterns are FORBIDDEN and will cause remediation work:

### 1. NEVER use native JavaScript methods on Effect collections

```typescript
// FORBIDDEN
array.map(x => x + 1)
array.filter(x => x > 0)
array.sort()
string.toLowerCase()
string.slice(0, 5)
Object.entries(obj)
new Set([1, 2, 3])
new Map([["a", 1]])

// REQUIRED
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
A.sort(array, Order.number)
Str.toLowerCase(string)
Str.slice(string, 0, 5)
Struct.entries(obj)
MutableHashSet.make(1, 2, 3)
MutableHashMap.make(["a", 1])
```

### 2. NEVER use native Error constructors

```typescript
// FORBIDDEN
new Error("Something went wrong")
Effect.die(new Error("Fatal"))
throw new Error("Bad input")

// REQUIRED
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
}) {}

Effect.fail(new MyError({ message: "Something went wrong" }))
```

### 3. NEVER use non-null assertions

```typescript
// FORBIDDEN
const value = map.get(key)!
const first = array[0]!

// REQUIRED
const value = O.fromNullable(map.get(key))
const first = A.head(array)
```

### 4. NEVER use switch statements

```typescript
// FORBIDDEN
switch (status) {
  case "active": return "✓";
  case "inactive": return "✗";
}

// REQUIRED
Match.value(status).pipe(
  Match.when("active", () => "✓"),
  Match.when("inactive", () => "✗"),
  Match.exhaustive
)
```

### 5. NEVER use native Date

```typescript
// FORBIDDEN
new Date()
Date.now()
date.getTime()

// REQUIRED
DateTime.now
DateTime.toDate(dateTime)
DateTime.toEpochMillis(dateTime)
```

### 6. NEVER use plain strings for entity IDs

```typescript
// FORBIDDEN - Domain models
id: S.String

// FORBIDDEN - Table columns
pg.text("user_id").notNull()

// REQUIRED - Domain models
id: SharedEntityIds.UserId

// REQUIRED - Table columns
pg.text("user_id").notNull().$type<SharedEntityIds.UserId.Type>()
```
```

**Rationale**: Developers need a "DO NOT DO THIS" checklist. Current rules emphasize what TO do, but violations show developers didn't know what NOT to do.

---

#### C. Create `packages/shared/domain/src/entities/README.md`

**New File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/entities/README.md`

**Content**:

```markdown
# Shared Domain Entities

Canonical domain entity models shared across all vertical slices.

## Purpose

This directory contains domain entities that are **cross-cutting** and referenced by multiple vertical slices:

- **User**: Authentication, identity, profile data
- **Organization**: Multi-tenant organization structure
- **Team**: Sub-organizational groupings
- **Session**: User authentication sessions
- **File**: Uploaded file metadata
- **Folder**: File organization structure
- **Upload Session**: Multi-part upload tracking
- **Audit Log**: Cross-entity audit trail

## Architecture

### Entity Structure

Each entity directory follows this structure:

```
user/
├── user.model.ts         # M.Class domain model
├── user.schemas.ts       # Additional schema variants (if needed)
└── index.ts              # Re-exports
```

### Usage Across Slices

**Vertical slices MUST import these entities** rather than redefining them:

```typescript
// REQUIRED - Import from shared
import { User } from "@beep/shared-domain/entities";

// FORBIDDEN - Redefining in vertical slice
export class User extends M.Class<User>("User")({ ... }) {}
```

### Entity IDs

Entity IDs for shared entities are defined in `packages/shared/domain/src/entity-ids/shared/ids.ts`:

```typescript
import { SharedEntityIds } from "@beep/shared-domain";

// Available IDs
SharedEntityIds.UserId
SharedEntityIds.OrganizationId
SharedEntityIds.TeamId
SharedEntityIds.SessionId
SharedEntityIds.FileId
SharedEntityIds.FolderId
SharedEntityIds.UploadSessionId
```

## When to Use Shared Entities

### Use shared entities when:
- Entity is referenced by 2+ vertical slices
- Entity represents core platform concept (user, org, team)
- Entity is part of authentication/authorization flow

### Create slice-specific entities when:
- Entity is only used within one vertical slice
- Entity represents slice-specific domain concept (Document → documents, Event → calendar)
- Entity extends a shared entity with slice-specific fields (use composition, not inheritance)

## Cross-Slice References

Vertical slices ALWAYS reference shared entities through EntityIds:

```typescript
// In documents/domain/src/entities/Document/Document.model.ts
import { SharedEntityIds } from "@beep/shared-domain";

export class Document extends M.Class<Document>("Document")({
  id: DocumentsEntityIds.DocumentId,
  ownerId: SharedEntityIds.UserId,        // Reference to shared entity
  organizationId: SharedEntityIds.OrganizationId,
  ...
}) {}
```

## Verification

To verify proper usage:

```bash
# Check no slice redefines shared entities
grep -r "class User extends" packages/*/domain/src/entities/ | grep -v "packages/shared"

# Check all ID references use EntityIds
grep -r ": S.String" packages/*/domain/src/entities/ | grep -iE "(id|Id):"
```

## Related Documentation

- [Entity IDs](../entity-ids/README.md) - Branded ID types
- [Domain Patterns](../../../documentation/patterns/domain-patterns.md) - Domain modeling guide
- [Database Patterns](../../../documentation/patterns/database-patterns.md) - Table creation workflow
```

**Rationale**: This file doesn't exist. IAM Client spec showed developers didn't know `packages/shared/domain/src/entities/` was the source of truth.

---

#### D. Update `documentation/patterns/database-patterns.md`

**Location**: After "Table Definitions" section (currently line 100)

**Add Section**:

```markdown
### Critical: EntityId Type Safety

**ALWAYS** add `.$type<EntityId.Type>()` to table columns referencing entity IDs:

```typescript
// REQUIRED
export const relationTable = Table.make(KnowledgeEntityIds.RelationId)({
  subjectId: pg.text("subject_id").notNull()
    .$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
  objectId: pg.text("object_id")
    .$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
  ontologyId: pg.text("ontology_id").notNull()
    .$type<KnowledgeEntityIds.OntologyId.Type>(),
});
```

**Why**: Without `.$type<>()`, TypeScript cannot prevent mixing different entity ID types in joins:

```typescript
// WITHOUT .$type<>() - compiles but WRONG
db.select()
  .from(relationTable)
  .where(eq(relationTable.subjectId, documentId))  // Should reject DocumentId!

// WITH .$type<>() - TypeScript error
db.select()
  .from(relationTable)
  .where(eq(relationTable.subjectId, documentId))  // ❌ Type error: KnowledgeEntityId ≠ DocumentId
```

**Cross-Slice References**: When referencing entities from other slices, import their EntityIds:

```typescript
import { KnowledgeEntityIds, DocumentsEntityIds } from "@beep/shared-domain";

export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  documentId: pg.text("document_id")
    .$type<DocumentsEntityIds.DocumentId.Type>(),  // Cross-slice reference
});
```

**Verification Command**:

```bash
# After adding .$type<>(), verify with:
bun run check --filter @beep/knowledge-tables
```
```

**Rationale**: Database patterns doc covers domain models but never mentions table columns need `.$type<>()`. This gap caused 19 violations in knowledge package.

---

### Priority 2: Effect Collections Documentation (High Volume Impact)

#### E. Create `documentation/patterns/effect-collections.md`

**New File**: `/home/elpresidank/YeeBois/projects/beep-effect/documentation/patterns/effect-collections.md`

**Content**:

```markdown
# Effect Collections Migration Guide

Comprehensive guide to migrating from native JavaScript collections to Effect collections.

## Why Effect Collections?

Effect collections provide:
1. **Type-safe operations** - No runtime errors from undefined/null
2. **Immutability by default** - Prevents accidental mutation bugs
3. **Composability** - Pipe operations with F.pipe()
4. **Effect integration** - Seamless composition with Effect.gen

## Migration Patterns

### Array → effect/Array

```typescript
// BEFORE (Native)
const doubled = array.map(x => x * 2);
const evens = array.filter(x => x % 2 === 0);
const sorted = array.sort((a, b) => a - b);
const isEmpty = array.length === 0;
const first = array[0];

// AFTER (Effect)
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Order from "effect/Order";

const doubled = A.map(array, x => x * 2);
const evens = A.filter(array, x => x % 2 === 0);
const sorted = A.sort(array, Order.number);
const isEmpty = A.isEmptyReadonlyArray(array);
const first = A.head(array);  // Returns Option<T>
```

### Set → effect/MutableHashSet

```typescript
// BEFORE (Native)
const set = new Set([1, 2, 3]);
set.add(4);
const has = set.has(2);
const size = set.size;

// AFTER (Effect)
import * as MutableHashSet from "effect/MutableHashSet";

const set = MutableHashSet.make(1, 2, 3);
MutableHashSet.add(set, 4);
const has = MutableHashSet.has(set, 2);
const size = MutableHashSet.size(set);
```

### Map → effect/MutableHashMap

```typescript
// BEFORE (Native)
const map = new Map([["a", 1], ["b", 2]]);
map.set("c", 3);
const value = map.get("a");  // T | undefined - dangerous!
const has = map.has("a");

// AFTER (Effect)
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const map = MutableHashMap.make(["a", 1], ["b", 2]);
MutableHashMap.set(map, "c", 3);
const value = MutableHashMap.get(map, "a");  // Option<T> - safe!
const has = MutableHashMap.has(map, "a");
```

### Handling Option Results

Many Effect collection operations return `Option<T>` instead of `T | undefined`:

```typescript
// WRONG - Non-null assertion
const first = A.head(array)!;  // FORBIDDEN

// CORRECT - Option handling
const first = O.getOrElse(A.head(array), () => defaultValue);

// CORRECT - Effect.gen with Option
const result = Effect.gen(function* () {
  const first = yield* A.head(array);  // Fails if None
  return first * 2;
});
```

## Common Migration Issues

### Issue 1: Array.sort mutates in-place

```typescript
// WRONG - mutates original array
const sorted = array.sort((a, b) => a - b);

// CORRECT - A.sort returns new array
const sorted = A.sort(array, Order.number);
```

### Issue 2: Map.get returns undefined

```typescript
// WRONG - value might be undefined
const value = map.get(key)!;  // FORBIDDEN

// CORRECT - Option handling
const value = O.getOrNull(MutableHashMap.get(map, key));
```

### Issue 3: Set.has in conditionals

```typescript
// WRONG
if (set.has(value)) { ... }

// CORRECT
if (MutableHashSet.has(set, value)) { ... }
```

## When to Use Chunk Instead of Array

Prefer `effect/Chunk` for:
- Large collections (>1000 elements)
- Frequent append operations
- Streaming data

Prefer `effect/Array` for:
- Small collections (<100 elements)
- Random access patterns
- Legacy interop

## Verification

Check for violations:

```bash
# Native Array methods
grep -r "\.map(" packages/your-package/src/ | grep -v "A.map\|Effect.map"

# Native Set
grep -r "new Set(" packages/your-package/src/

# Native Map
grep -r "new Map(" packages/your-package/src/

# Non-null assertions
grep -r "!" packages/your-package/src/ | grep -v "!=="
```
```

**Rationale**: 70 violations (Set, Map, Array methods) indicate developers need comprehensive migration examples. Current docs mention Effect collections but don't show HOW to migrate.

---

#### F. Add MutableHashSet/MutableHashMap Examples to CLAUDE.md

**Location**: Add new section after "Code Quality" section

**Add Section**:

```markdown
## Effect Collections Quick Reference

| Native | Effect | Import |
|--------|--------|--------|
| `array.map()` | `A.map(array, fn)` | `import * as A from "effect/Array"` |
| `array.filter()` | `A.filter(array, pred)` | `import * as A from "effect/Array"` |
| `array.sort()` | `A.sort(array, Order.number)` | `import * as A from "effect/Array"; import * as Order from "effect/Order"` |
| `array.length === 0` | `A.isEmptyReadonlyArray(array)` | `import * as A from "effect/Array"` |
| `new Set()` | `MutableHashSet.make()` | `import * as MutableHashSet from "effect/MutableHashSet"` |
| `new Map()` | `MutableHashMap.make()` | `import * as MutableHashMap from "effect/MutableHashMap"` |
| `Object.entries()` | `Struct.entries()` | `import * as Struct from "effect/Struct"` |
| `string.toLowerCase()` | `Str.toLowerCase(string)` | `import * as Str from "effect/String"` |
| `new Date()` | `DateTime.now` | `import * as DateTime from "effect/DateTime"` |

See [Effect Collections Guide](documentation/patterns/effect-collections.md) for migration examples.
```

**Rationale**: Root-level CLAUDE.md needs quick reference. Developers shouldn't have to navigate to effect-patterns.md to find basic conversions.

---

### Priority 3: Transformation Schema Requirement (IAM-Specific)

#### G. Update `packages/iam/client/CLAUDE.md`

**Location**: After "Handler Structure" section

**Add Section**:

```markdown
## EntityId Alignment Requirement

**CRITICAL**: All IAM client schemas MUST use branded EntityIds from `@beep/shared-domain` and `packages/iam/domain`.

### Common Schemas (_common/*.schema.ts)

```typescript
// REQUIRED
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Member extends S.Class<Member>($I`Member`)({
  id: IamEntityIds.MemberId,
  organizationId: SharedEntityIds.OrganizationId,
  userId: SharedEntityIds.UserId,
  ...
}) {}
```

**NEVER** use `S.String` for ID fields:

```typescript
// FORBIDDEN
export class Member extends S.Class<Member>({ id: S.String }) {}
```

### Transformation Schemas Requirement

When mapping Better Auth responses to domain entities, ALWAYS create transformation schemas in `_internal/*.schemas.ts`:

**Pattern**: `Domain<Entity>FromBetterAuth<Entity>`

**Example**: See `_internal/user.schemas.ts` for canonical `DomainUserFromBetterAuthUser` pattern.

**Required for**:
- User → User.Model (already implemented)
- Session → Session.Model (already implemented)
- Member → Member.Model (already implemented)
- Organization → Organization.Model (already implemented)
- Invitation → Invitation.Model (already implemented)

### Contract Payload EntityIds

Contract payloads MUST use branded EntityIds with form compatibility:

```typescript
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    teamId: SharedEntityIds.TeamId,
  },
  formValuesAnnotation({
    userId: "" as SharedEntityIds.UserId.Type,
    teamId: "" as SharedEntityIds.TeamId.Type,
  })
) {}
```

**Note**: `formValuesAnnotation` requires type casting `"" as EntityId.Type` for form default values.

### Verification

```bash
# Check for plain string IDs (should return 0)
grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):" | wc -l
```
```

**Rationale**: IAM Client AGENTS.md mentions EntityIds but doesn't make it a requirement. This gap caused 63 violations.

---

#### H. Add Cross-Reference to `packages/iam/domain/CLAUDE.md`

**Location**: After "Usage Snapshots" section

**Add Section**:

```markdown
## EntityId Usage

EntityIds defined in this package MUST be used consistently across:
- Domain models (`packages/iam/domain/src/entities/`)
- Table definitions (`packages/iam/tables/src/tables/`)
- Client schemas (`packages/iam/client/src/`)

**Canonical Reference**: `packages/shared/domain/src/entity-ids/iam/ids.ts`

### Client Schema Alignment

Client schemas in `@beep/iam-client` MUST use the same EntityIds as domain models:

```typescript
// Domain model
export class Member extends M.Class<Member>("Member")({
  id: IamEntityIds.MemberId,
  userId: SharedEntityIds.UserId,
  ...
}) {}

// Client schema (MUST match)
export class Member extends S.Class<Member>($I`Member`)({
  id: IamEntityIds.MemberId,
  userId: SharedEntityIds.UserId,
  ...
}) {}
```

**Verification**: When updating domain models, verify client schemas:

```bash
# Check IAM client uses EntityIds
bun run check --filter @beep/iam-client
```
```

**Rationale**: IAM Domain AGENTS.md doesn't mention client alignment requirement, so developers don't know schemas should match.

---

### Priority 4: Linting and Automation (Long-term)

#### I. Create `.biomeignore` Patterns (Aspirational)

**Location**: Update `/home/elpresidank/YeeBois/projects/beep-effect/.biome.jsonc`

**Add Section** (currently Biome doesn't support all these, but document for future):

```jsonc
{
  "linter": {
    "rules": {
      // TODO: Enable when Biome supports custom rules
      "suspicious": {
        "noNativeCollections": "error",  // Ban Set, Map
        "noNativeArrayMethods": "error",  // Ban .map(), .filter()
        "noNonNullAssertions": "error",  // Ban !
        "noSwitchStatements": "error"  // Ban switch
      }
    }
  }
}
```

**Create Issue**: File GitHub issue to track ESLint rule creation since Biome doesn't support these patterns yet.

**Rationale**: 240 violations show manual code review isn't catching violations. Need automation.

---

#### J. Create Pre-commit Hook Script

**New File**: `/home/elpresidank/YeeBois/projects/beep-effect/scripts/pre-commit-checks.sh`

**Content**:

```bash
#!/usr/bin/env bash
set -e

echo "Running pre-commit checks..."

# Check 1: No plain S.String for ID fields
PLAIN_ID_COUNT=$(grep -r ": S.String" packages/*/domain/src/entities/ | grep -iE "(id|Id):" | wc -l)
if [ "$PLAIN_ID_COUNT" -gt 0 ]; then
  echo "❌ Found $PLAIN_ID_COUNT plain S.String ID fields. Use branded EntityIds."
  grep -r ": S.String" packages/*/domain/src/entities/ | grep -iE "(id|Id):"
  exit 1
fi

# Check 2: Table columns have .$type<>() for ID references
MISSING_TYPE_COUNT=$(grep -r "pg.text.*notNull()" packages/*/tables/src/tables/ | grep -iE "(id|Id)" | grep -v "\.$type<" | wc -l)
if [ "$MISSING_TYPE_COUNT" -gt 0 ]; then
  echo "❌ Found $MISSING_TYPE_COUNT table columns missing .\$type<>(). Add EntityId types."
  grep -r "pg.text.*notNull()" packages/*/tables/src/tables/ | grep -iE "(id|Id)" | grep -v "\.$type<"
  exit 1
fi

# Check 3: No new Error() constructors
NEW_ERROR_COUNT=$(grep -r "new Error(" packages/*/src/ | wc -l)
if [ "$NEW_ERROR_COUNT" -gt 0 ]; then
  echo "❌ Found $NEW_ERROR_COUNT native Error constructors. Use S.TaggedError."
  grep -r "new Error(" packages/*/src/
  exit 1
fi

echo "✅ All pre-commit checks passed"
```

**Installation**:

```bash
# Make executable
chmod +x scripts/pre-commit-checks.sh

# Add to package.json
{
  "scripts": {
    "pre-commit": "bash scripts/pre-commit-checks.sh"
  }
}
```

**Rationale**: Automation catches violations before they reach main branch. Manual code review missed 240 violations.

---

## Part 4: Verification Recommendations

### New Verification Commands

Add to `/home/elpresidank/YeeBois/projects/beep-effect/package.json`:

```json
{
  "scripts": {
    "verify:entityids": "bash scripts/verify-entityids.sh",
    "verify:effect-patterns": "bash scripts/verify-effect-patterns.sh",
    "verify:all": "bun run verify:entityids && bun run verify:effect-patterns"
  }
}
```

**scripts/verify-entityids.sh**:
```bash
#!/usr/bin/env bash
echo "Checking EntityId usage..."

# Check domain models
DOMAIN_VIOLATIONS=$(grep -r ": S.String" packages/*/domain/src/entities/ | grep -iE "(id|Id):" | wc -l)
echo "Domain models with plain string IDs: $DOMAIN_VIOLATIONS"

# Check table columns
TABLE_VIOLATIONS=$(grep -r "pg.text.*notNull()" packages/*/tables/src/tables/ | grep -iE "(id|Id)" | grep -v "\.$type<" | wc -l)
echo "Table columns missing .\$type<>(): $TABLE_VIOLATIONS"

# Check client schemas
CLIENT_VIOLATIONS=$(grep -r ": S.String" packages/*/client/src/ | grep -iE "(id|Id):" | wc -l)
echo "Client schemas with plain string IDs: $CLIENT_VIOLATIONS"

TOTAL=$((DOMAIN_VIOLATIONS + TABLE_VIOLATIONS + CLIENT_VIOLATIONS))
if [ "$TOTAL" -gt 0 ]; then
  echo "❌ Total EntityId violations: $TOTAL"
  exit 1
else
  echo "✅ No EntityId violations found"
fi
```

**scripts/verify-effect-patterns.sh**:
```bash
#!/usr/bin/env bash
echo "Checking Effect pattern violations..."

# Native collections
SET_COUNT=$(grep -r "new Set(" packages/*/src/ | wc -l)
MAP_COUNT=$(grep -r "new Map(" packages/*/src/ | wc -l)
ERROR_COUNT=$(grep -r "new Error(" packages/*/src/ | wc -l)

echo "Native Set usage: $SET_COUNT"
echo "Native Map usage: $MAP_COUNT"
echo "Native Error usage: $ERROR_COUNT"

TOTAL=$((SET_COUNT + MAP_COUNT + ERROR_COUNT))
if [ "$TOTAL" -gt 0 ]; then
  echo "❌ Total Effect pattern violations: $TOTAL"
  exit 1
else
  echo "✅ No Effect pattern violations found"
fi
```

---

## Part 5: Priority Ranking

| Priority | Change | Files | Impact | Effort | ROI |
|----------|--------|-------|--------|--------|-----|
| **P0** | Add EntityId rules (A, D) | 2 | Prevents 82 violations | 2h | ⭐⭐⭐⭐⭐ |
| **P0** | Add NEVER patterns (B) | 1 | Prevents 150+ violations | 1h | ⭐⭐⭐⭐⭐ |
| **P1** | Create shared entities README (C) | 1 | Clarifies architecture | 1h | ⭐⭐⭐⭐ |
| **P1** | IAM client EntityId requirement (G, H) | 2 | Prevents client drift | 1h | ⭐⭐⭐⭐ |
| **P2** | Effect collections guide (E) | 1 | Prevents 70 violations | 3h | ⭐⭐⭐⭐ |
| **P2** | CLAUDE.md quick reference (F) | 1 | Improves discoverability | 30m | ⭐⭐⭐ |
| **P3** | Verification scripts (Part 4) | 3 | Automation | 2h | ⭐⭐⭐ |
| **P4** | Pre-commit hooks (J) | 1 | Prevention | 1h | ⭐⭐⭐ |
| **P4** | Biome/ESLint rules (I) | 1 | Requires tooling work | 8h+ | ⭐⭐ |

**Total Estimated Effort**: 19.5 hours for P0-P3
**Estimated Prevention**: 300+ future violations

---

## Part 6: Meta-Learnings

### Pattern: Post-hoc Discovery is Expensive

**Observation**: Both specs discovered violations AFTER implementation was complete.

**Cost**:
- Knowledge: 240 violations across 30 files, 6 remediation phases
- IAM Client: 63 fields requiring updates, 4 phases

**Prevention**: Code quality audit should be Phase N-1 of every multi-phase spec, NOT a separate remediation spec.

### Pattern: Documentation Fragmentation

**Observation**: Rules are scattered across 5+ files without clear hierarchy.

**Evidence**:
- Effect patterns: `.claude/rules/effect-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
- IAM client: `packages/iam/client/CLAUDE.md`
- IAM domain: `packages/iam/domain/CLAUDE.md`
- Root guide: `CLAUDE.md`

**Impact**: Developers miss rules because they don't know which file to check.

**Recommendation**: Create `documentation/patterns/INDEX.md` with cross-references and clear hierarchy.

### Pattern: Examples Beat Abstract Rules

**Observation**: Rules with concrete before/after examples had fewer violations:
- FileSystem service (has examples): 0 violations
- EntityId table columns (no examples): 19 violations
- MutableHashSet (no examples): 22 violations

**Recommendation**: Every rule needs 2-3 concrete before/after examples.

### Pattern: Linting Gap

**Observation**: Manual code review failed to catch 240 violations.

**Root Cause**: No automated linting for:
- Native Set/Map usage
- Native Array methods
- Plain string IDs
- Non-null assertions

**Recommendation**: Invest in custom ESLint rules even if Biome doesn't support them yet.

---

## Part 7: Implementation Roadmap

### Week 1: Critical Rules (P0)
- [ ] Add EntityId rules to effect-patterns.md (A)
- [ ] Add table column rule to database-patterns.md (D)
- [ ] Add NEVER patterns section to effect-patterns.md (B)
- [ ] Update IAM client AGENTS.md with EntityId requirement (G)
- [ ] Update IAM domain AGENTS.md with client cross-reference (H)

**Deliverable**: Updated documentation preventing 232 future violations

### Week 2: Guides and Examples (P1-P2)
- [ ] Create shared entities README (C)
- [ ] Create effect-collections.md guide (E)
- [ ] Add quick reference to CLAUDE.md (F)

**Deliverable**: Comprehensive migration guides

### Week 3: Automation (P3)
- [ ] Create verification scripts (Part 4)
- [ ] Add npm scripts to package.json
- [ ] Document verification workflow in CLAUDE.md

**Deliverable**: Automated violation detection

### Week 4: Prevention (P4)
- [ ] Create pre-commit hook script (J)
- [ ] Document ESLint rule requirements (I)
- [ ] File GitHub issues for custom linting rules

**Deliverable**: Prevention mechanisms

---

## Appendix A: Reference Files

Files analyzed:
1. `specs/knowledge-code-quality-audit/README.md`
2. `specs/knowledge-code-quality-audit/MASTER_ORCHESTRATION.md`
3. `specs/knowledge-code-quality-audit/REFLECTION_LOG.md`
4. `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
5. `specs/knowledge-code-quality-audit/outputs/violations/V01-entityid-tables.md` (and 17 others)
6. `specs/iam-client-entity-alignment/README.md`
7. `specs/iam-client-entity-alignment/MASTER_ORCHESTRATION.md`
8. `specs/iam-client-entity-alignment/outputs/P0-inventory.md`
9. `.claude/rules/effect-patterns.md`
10. `.claude/rules/general.md`
11. `.claude/rules/behavioral.md`
12. `CLAUDE.md`
13. `documentation/patterns/database-patterns.md`
14. `packages/iam/client/CLAUDE.md`
15. `packages/iam/domain/CLAUDE.md`
16. `packages/iam/client/src/_internal/user.schemas.ts` (canonical pattern)

---

## Appendix B: Violation Statistics

### By Category
- Effect Collections (Set, Map, Array): 70 violations (29%)
- EntityId Usage: 82 violations (34%)
- Error Handling: 4 violations (2%)
- Control Flow (switch, non-null): 27 violations (11%)
- String/Date Operations: 41 violations (17%)
- Miscellaneous: 16 violations (7%)

### By Package
- knowledge: 240 violations
- iam/client: 63 violations
- **Total**: 303 violations

### By Severity
- Critical: 3 (1%)
- High: 82 (27%)
- Medium: 201 (66%)
- Low: 17 (6%)
