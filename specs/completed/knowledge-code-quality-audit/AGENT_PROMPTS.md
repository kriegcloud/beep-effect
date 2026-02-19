# Agent Prompts

> Specialized Effect Pattern Enforcer prompts for each violation category.

**Source of Truth**: `.claude/rules/effect-patterns.md`

**Scope**: `packages/knowledge/**/src/**/*.ts`

**Output Location**: `specs/knowledge-code-quality-audit/outputs/violations/`

---

## Common Preamble (Include in ALL prompts)

```markdown
## Context

You are an Effect Pattern Enforcer auditing the `packages/knowledge` vertical slice for code quality violations.

**Source of Truth**: `.claude/rules/effect-patterns.md`

**CRITICAL RULES from effect-patterns.md**:
- ALWAYS use namespace imports for Effect modules (`import * as A from "effect/Array"`)
- NEVER use native JavaScript array/string methods - route ALL operations through Effect utilities
- Use PascalCase Schema constructors (`S.Struct`, `S.Array`, NOT `S.struct`, `S.array`)

**Your Mission**:
1. Search `packages/knowledge/**/src/**/*.ts` for the specific violation pattern
2. Record EVERY occurrence with exact file:line reference
3. Document current code and correct replacement pattern
4. Write structured report to the specified output file

**Output Format**: Follow the violation report template exactly.
```

---

## V01: EntityId Table Typing

```markdown
# V01: EntityId Table Typing Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: All Drizzle table columns that reference entity IDs MUST use `.$type<EntityId.Type>()` for type safety.

**Pattern to Find**:
```typescript
// VIOLATION - Missing .$type<>()
pg.text("ontology_id").notNull()
pg.text("entity_id").notNull()
pg.text("*_id").notNull()  // Any column ending in _id
```

**Correct Pattern**:
```typescript
// CORRECT - With EntityId typing
pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>()
```

## Search Strategy

1. Use Glob to find all files in `packages/knowledge/tables/src/**/*.ts`
2. Use Grep to find patterns like `pg.text.*_id.*notNull\(\)` that do NOT have `.$type<`
3. Read each file to verify and capture context

**Grep Patterns**:
```bash
# Find potential ID columns
grep -n "pg\.text.*_id.*\.notNull\(\)" packages/knowledge/tables/src/

# Exclude those with proper typing
grep -n "pg\.text.*_id.*\.notNull\(\)" packages/knowledge/tables/src/ | grep -v "\.\$type<"
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V01-entityid-tables.md`

Include:
- Total violation count
- Each violation with file:line, current code, correct code
- List of EntityId types that should be used (from @beep/shared-domain)
```

---

## V02: Duplicate Code

```markdown
# V02: Duplicate Code Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Shared utility functions should be extracted to a common location, not duplicated across files.

**Known Duplicates**:
- `extractLocalName` function - duplicated in multiple files in `packages/knowledge/server/src/`

## Search Strategy

1. Use Grep to find all definitions of `extractLocalName`
2. Read each file to verify the function signature and implementation
3. Identify if implementations are identical or variations

**Grep Pattern**:
```bash
grep -rn "function extractLocalName\|const extractLocalName\|extractLocalName\s*=" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V02-duplicate-code.md`

Include:
- List of all duplicate function definitions with file:line
- Function signature comparison
- Recommended extraction location (e.g., `packages/knowledge/server/src/utils/`)
```

---

## V03: Native String Methods

```markdown
# V03: Native String Methods Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule from effect-patterns.md**: NEVER use native JavaScript string methods. Route ALL operations through Effect utilities.

**Violations**:
- `.lastIndexOf()` - Use `Str.lastIndexOf()` from `effect/String`
- `.slice()` on strings - Use `Str.slice()` from `effect/String`

**Pattern to Find**:
```typescript
// VIOLATIONS
str.lastIndexOf("#")
name.slice(0, -1)
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

// CORRECT
Str.lastIndexOf(str, "#")
Str.slice(name, 0, -1)  // Or appropriate Str.* method
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "\.lastIndexOf\(" packages/knowledge/server/src/
grep -rn "\.slice\(" packages/knowledge/server/src/ | grep -v "Array"  # Exclude array slice
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V03-native-string.md`
```

---

## V04: Error Construction

```markdown
# V04: Error Construction Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Error objects must be constructed using `new ErrorClass({...})` syntax, not object literals cast as errors.

**Violation Pattern**:
```typescript
// VIOLATION - Object literal
({
  _tag: "EmbeddingError",
  message: `Similarity search failed: ${String(error)}`,
  provider: "pgvector",
  retryable: false,
}) as EmbeddingError
```

**Correct Pattern**:
```typescript
// CORRECT - Constructor
new EmbeddingError({
  message: `Similarity search failed: ${String(error)}`,
  provider: "pgvector",
  retryable: false,
})
```

## Search Strategy

**Grep Patterns**:
```bash
# Find object literals with _tag being cast
grep -rn "_tag:.*Error" packages/knowledge/server/src/ | grep "as.*Error"
grep -rn "\(\s*{" packages/knowledge/server/src/ | grep "_tag.*Error"
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V04-error-construction.md`
```

---

## V05: Array Emptiness Checks

```markdown
# V05: Array Emptiness Checks Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect Array utilities for all array operations, including emptiness checks.

**Violation Pattern**:
```typescript
// VIOLATIONS
if (array.length === 0)
if (array.length == 0)
array.length === 0 ? ... : ...
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

// CORRECT
if (A.isEmptyReadonlyArray(array))
A.isEmptyReadonlyArray(array) ? ... : ...
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "\.length\s*===\s*0" packages/knowledge/server/src/
grep -rn "\.length\s*==\s*0" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V05-array-emptiness.md`
```

---

## V06: Native Error Objects

```markdown
# V06: Native Error Objects Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect Schema TaggedError classes instead of native JavaScript Error objects.

**Violation Pattern**:
```typescript
// VIOLATIONS
new Error("Something went wrong")
Effect.die(new Error("Cannot select canonical from empty cluster"))
throw new Error("...")
```

**Correct Pattern**:
```typescript
import * as S from "effect/Schema";

// Define dedicated error class
export class CanonicalSelectionError extends S.TaggedError<CanonicalSelectionError>()(
  "CanonicalSelectionError",
  {
    message: S.String,
    reason: S.Literal("empty_cluster", "selection_failed"),
  }
) {}

// Use in code
Effect.fail(new CanonicalSelectionError({
  message: "Cannot select canonical from empty cluster",
  reason: "empty_cluster"
}))
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "new Error\(" packages/knowledge/server/src/
grep -rn "Effect\.die\(new Error" packages/knowledge/server/src/
grep -rn "throw new Error" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V06-native-error.md`
```

---

## V07: Switch Statements

```markdown
# V07: Switch Statements Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use `effect/Match` instead of switch statements for exhaustive pattern matching with type safety.

**Violation Pattern**:
```typescript
// VIOLATION
switch (strategy) {
  case "highest_confidence":
    // ...
    break;
  case "most_attributes":
    // ...
    break;
  default:
    // ...
}
```

**Correct Pattern**:
```typescript
import * as Match from "effect/Match";

// CORRECT
const result = Match.value(strategy).pipe(
  Match.when("highest_confidence", () => /* ... */),
  Match.when("most_attributes", () => /* ... */),
  Match.when("most_mentions", () => /* ... */),
  Match.orElse(() => /* hybrid default */)
);
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "switch\s*\(" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V07-switch-statements.md`
```

---

## V08: Object.entries

```markdown
# V08: Object.entries Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect Struct utilities instead of native Object methods.

**Violation Pattern**:
```typescript
// VIOLATION
for (const [key, value] of Object.entries(member.attributes)) {
  // ...
}
Object.entries(obj).map(...)
```

**Correct Pattern**:
```typescript
import * as Struct from "effect/Struct";
import * as A from "effect/Array";

// CORRECT - Using Record module for record operations
import * as R from "effect/Record";

R.toEntries(member.attributes)  // Returns Array<[string, V]>
A.forEach(R.toEntries(member.attributes), ([key, value]) => {
  // ...
})
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "Object\.entries\(" packages/knowledge/server/src/
grep -rn "Object\.keys\(" packages/knowledge/server/src/
grep -rn "Object\.values\(" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V08-object-entries.md`
```

---

## V09: Native Set

```markdown
# V09: Native Set Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect MutableHashSet instead of native JavaScript Set for mutable set operations.

**Violation Pattern**:
```typescript
// VIOLATIONS
const allTypes = new Set(canonical.types);
const seen = new Set<string>();
mySet.add(value);
mySet.has(value);
```

**Correct Pattern**:
```typescript
import * as MutableHashSet from "effect/MutableHashSet";

// CORRECT
const allTypes = MutableHashSet.fromIterable(canonical.types);
const seen = MutableHashSet.empty<string>();
MutableHashSet.add(seen, value);
MutableHashSet.has(seen, value);
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "new Set\(" packages/knowledge/server/src/
grep -rn "new Set<" packages/knowledge/server/src/
grep -rn "= new Set" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V09-native-set.md`
```

---

## V10: Native Array.map

```markdown
# V10: Native Array.map Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule from effect-patterns.md**: NEVER use native JavaScript array methods. Route ALL operations through Effect utilities.

**Violation Pattern**:
```typescript
// VIOLATIONS
members.map((m) => m.confidence)
array.map(x => x + 1)
items.map(transform)
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

// CORRECT
A.map(members, (m) => m.confidence)
A.map(array, x => x + 1)
A.map(items, transform)
```

## Search Strategy

**Grep Patterns**:
```bash
# Find .map( calls - need to filter for array context
grep -rn "\.map\(" packages/knowledge/server/src/
```

**Note**: This pattern has high false positive potential. Use Read tool to verify each match is actually an array method, not Effect.map or other valid usages.

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V10-native-array-map.md`
```

---

## V11: Non-null Assertions

```markdown
# V11: Non-null Assertions Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect Option instead of non-null assertions (!) for handling potentially null/undefined values.

**Violation Pattern**:
```typescript
// VIOLATIONS
cluster[0]!
result.data!.value
object!.property
```

**Correct Pattern**:
```typescript
import * as O from "effect/Option";
import * as A from "effect/Array";

// CORRECT
A.head(cluster)  // Returns Option<T>
O.fromNullable(result.data).pipe(O.map(d => d.value))
O.fromNullable(object).pipe(O.map(o => o.property))
```

## Search Strategy

**Grep Patterns**:
```bash
# Find non-null assertions (! followed by . or ])
grep -rn "\w\+!\." packages/knowledge/server/src/
grep -rn "\]\!" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V11-non-null-assertions.md`
```

---

## V12: Native Map

```markdown
# V12: Native Map Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect MutableHashMap instead of native JavaScript Map for mutable map operations.

**Violation Pattern**:
```typescript
// VIOLATIONS
const cache = new Map<string, Entity>();
const lookup = new Map();
map.set(key, value);
map.get(key);
```

**Correct Pattern**:
```typescript
import * as MutableHashMap from "effect/MutableHashMap";

// CORRECT
const cache = MutableHashMap.empty<string, Entity>();
MutableHashMap.set(cache, key, value);
MutableHashMap.get(cache, key);  // Returns Option<V>
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "new Map\(" packages/knowledge/server/src/
grep -rn "new Map<" packages/knowledge/server/src/
grep -rn "= new Map" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V12-native-map.md`
```

---

## V13: Native Array.sort

```markdown
# V13: Native Array.sort Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect Array sort with Order instead of native array sort for type-safe, pure sorting.

**Violation Pattern**:
```typescript
// VIOLATIONS
results.sort((a, b) => b.similarity - a.similarity)
array.sort()
items.sort(compareFn)
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";

// CORRECT
A.sort(results, Order.reverse(Order.mapInput(Order.number, (r) => r.similarity)))

// Or with pipe
results.pipe(
  A.sort(Order.reverse(Order.mapInput(Order.number, (r) => r.similarity)))
)
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "\.sort\(" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V13-native-array-sort.md`
```

---

## V14: EntityId Creation

```markdown
# V14: EntityId Creation Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use branded EntityId factories from `@beep/shared-domain/entity-ids` instead of raw UUID generation.

**Violation Pattern**:
```typescript
// VIOLATIONS
id: `knowledge_same_as_link__${crypto.randomUUID()}`
const id = crypto.randomUUID();
const entityId = `prefix_${crypto.randomUUID()}`;
```

**Correct Pattern**:
```typescript
import { KnowledgeEntityIds } from "@beep/shared-domain/entity-ids";

// CORRECT
const id = KnowledgeEntityIds.SameAsLinkId.make();  // Uses .make() factory
const ontologyId = KnowledgeEntityIds.OntologyId.make();
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "crypto\.randomUUID\(\)" packages/knowledge/server/src/
grep -rn "uuid\(\)" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V14-entityid-creation.md`
```

---

## V15: String.toLowerCase

```markdown
# V15: String.toLowerCase Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect String utilities instead of native string methods.

**Violation Pattern**:
```typescript
// VIOLATIONS
e.mention.toLowerCase()
name.toLowerCase()
str.toLowerCase()
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";

// CORRECT
Str.toLowerCase(e.mention)
Str.toLowerCase(name)
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "\.toLowerCase\(\)" packages/knowledge/server/src/
grep -rn "\.toUpperCase\(\)" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V15-string-tolowercase.md`
```

---

## V16: Native Date

```markdown
# V16: Native Date Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect DateTime instead of native JavaScript Date for time operations.

**Violation Pattern**:
```typescript
// VIOLATIONS
const startTime = Date.now();
new Date()
const timestamp = new Date().toISOString();
```

**Correct Pattern**:
```typescript
import * as DateTime from "effect/DateTime";

// CORRECT
const startTime = DateTime.unsafeNow();  // Or yield* DateTime.now in Effect context
const timestamp = DateTime.formatIso(DateTime.unsafeNow());
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn "Date\.now\(\)" packages/knowledge/server/src/
grep -rn "new Date\(" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V16-native-date.md`
```

---

## V17: Array vs Chunk

```markdown
# V17: Array vs Chunk Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect Chunk for performance-critical immutable sequences, especially for streaming and large collections.

**Assessment Criteria**:
- Large collections (>100 items) processed repeatedly
- Streaming/pipeline patterns
- Concatenation-heavy operations

**When Array is OK**:
- Small, short-lived collections
- Single-pass processing
- API boundaries expecting Array

**Note**: This audit identifies CANDIDATES for Chunk, not hard violations. Document patterns that would benefit from Chunk.

## Search Strategy

1. Find files with heavy array operations
2. Look for patterns indicating streaming or large data:
   - `A.concat` in loops
   - Large `A.flatMap` chains
   - Processing results from database queries

**Grep Patterns**:
```bash
grep -rn "A\.concat" packages/knowledge/server/src/
grep -rn "A\.flatten" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V17-array-vs-chunk.md`

Mark entries as "CANDIDATE" not "VIOLATION" - requires human judgment.
```

---

## V18: Empty Array Initialization

```markdown
# V18: Empty Array Initialization Audit

## Context
[Include Common Preamble]

## Violation Definition

**Rule**: Use Effect Array utilities for array initialization.

**Violation Pattern**:
```typescript
// VIOLATIONS
const sections: Array<string> = [];
const items: string[] = [];
let results = [];
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

// CORRECT
const sections = A.empty<string>();
const items = A.empty<string>();
let results = A.empty<ResultType>();
```

## Search Strategy

**Grep Patterns**:
```bash
grep -rn ": Array<.*>\s*=\s*\[\]" packages/knowledge/server/src/
grep -rn ":\s*\w\+\[\]\s*=\s*\[\]" packages/knowledge/server/src/
grep -rn "=\s*\[\];" packages/knowledge/server/src/
```

## Output

Write report to: `specs/knowledge-code-quality-audit/outputs/violations/V18-empty-array-init.md`
```

---

## Deployment Instructions

### Phase 1: Launch All Agents

```typescript
// In a SINGLE message, launch all 18 agents:
const agents = [
  Task({ subagent_type: "general-purpose", prompt: V01_PROMPT }),
  Task({ subagent_type: "general-purpose", prompt: V02_PROMPT }),
  Task({ subagent_type: "general-purpose", prompt: V03_PROMPT }),
  // ... through V18
];
```

### Phase 2: Collect Results

Wait for all 18 agents to complete. Each writes to `outputs/violations/V[XX]-*.md`.

### Phase 3: Synthesize

Use `doc-writer` agent to synthesize all 18 reports into `outputs/MASTER_VIOLATIONS.md`.
