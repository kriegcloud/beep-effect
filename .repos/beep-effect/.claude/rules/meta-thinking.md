# Meta-Thinking Patterns

## Effect Thinking

Effect<Success, Error, Requirements>

```
a |> f |> g |> h  ≡  pipe(a, f, g, h)
f ∘ g ∘ h         ≡  flow(f, g, h)
f(g(x))           →  pipe(x, g, f)           -- avoid nested calls

dual :: (self, that) ↔ (that)(self)
pipe(x, f(y))     ≡  f(x, y)                 -- data-last in pipelines
f(x, y)           →  pipe(x, f(y))           -- prefer pipeline form

∥(a, b, c)        ≡  Effect.all([a, b, c], { concurrency: "unbounded" })

R ⊃ {Service₁, Service₂} → Layer.provide(Service₁Live, Service₂Live)

E = Error₁ | Error₂ | Error₃ → catchTag("Error₁", handler)

yield* effect    ≡  ← effect (bind)
Effect.gen(function*() { ... })

need(time)       → Clock
need(randomness) → Random
need(filesystem) → FileSystem
need(http)       → HttpClient
```

### Examples

**Pipeline transformation:**
```typescript
import { pipe, flow } from "effect/Function";
import * as A from "effect/Array";

// a |> f |> g ≡ pipe(a, f, g)
const result = pipe(
  [1, 2, 3],
  A.map(x => x * 2),
  A.filter(x => x > 2)
); // [4, 6]

// f ∘ g ≡ flow(f, g)
const double = (x: number) => x * 2;
const increment = (x: number) => x + 1;
const transform = flow(double, increment);
transform(5); // 11
```

**Dual API pattern:**
```typescript
import { pipe } from "effect/Function";
import * as A from "effect/Array";

// dual :: (self, that) ↔ (that)(self)
const numbers = [1, 2, 3];
const double = (x: number) => x * 2;

// Data-last (pipeline form)
pipe(numbers, A.map(double)); // [2, 4, 6]

// Data-first (direct call)
A.map(numbers, double); // [2, 4, 6]
```

**Parallel execution:**
```typescript
import * as Effect from "effect/Effect";

// ∥(a, b, c) ≡ Effect.all([a, b, c], { concurrency: "unbounded" })
const fetchUser = Effect.succeed({ id: 1, name: "Alice" });
const fetchPosts = Effect.succeed([{ id: 1, title: "Post 1" }]);
const fetchComments = Effect.succeed([{ id: 1, text: "Comment 1" }]);

const allData = Effect.all(
  [fetchUser, fetchPosts, fetchComments],
  { concurrency: "unbounded" }
);
```

**Service composition:**
```typescript
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";

// R ⊃ {Service₁, Service₂} → Layer.provide(Service₁Live, Service₂Live)
const program = Effect.gen(function* () {
  const db = yield* DatabaseService;
  const cache = yield* CacheService;
  return yield* db.query("SELECT * FROM users");
});

const mainLayer = Layer.mergeAll(
  DatabaseServiceLive,
  CacheServiceLive
);

Effect.provide(program, mainLayer);
```

**Typed error handling:**
```typescript
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as S from "effect/Schema";

// E = Error₁ | Error₂ → catchTag
class NetworkError extends S.TaggedError<NetworkError>()(
  "NetworkError",
  { message: S.String }
) {}

const apiCall = Effect.fail(new NetworkError({ message: "Timeout" }));

const result = pipe(
  apiCall,
  Effect.catchTag("NetworkError", (e) =>
    Effect.succeed("fallback")
  )
);
```

**Service injection:**
```typescript
import * as Effect from "effect/Effect";
import * as Clock from "effect/Clock";
import * as Random from "effect/Random";
import { FileSystem } from "@effect/platform";

// need(time) → Clock
const getTimestamp = Effect.gen(function* () {
  const clock = yield* Clock.Clock;
  return yield* clock.currentTimeMillis;
});

// need(randomness) → Random
const generateId = Effect.gen(function* () {
  const random = yield* Random.Random;
  return yield* random.nextInt;
});

// need(filesystem) → FileSystem
const readConfig = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.readFileString("config.json");
});
```

## Uncertainty Handling

```
unclear(requirements) → ask(user) → proceed
ambiguous(approach) → present({options, tradeoffs}) → await(decision)
blocked(task) → report(blocker) ∧ suggest(alternatives)
risk(action) ≤ low → prefer(action) over prefer(inaction)
```

### Examples

**Unclear requirements:**
```typescript
// User asks: "Add validation to the form"
// ❌ WRONG: Assume what validation means
const validateForm = (data: unknown) => S.String.pipe(S.minLength(1));

// ✅ CORRECT: Ask for clarification
// "What specific validation rules? Email format, length constraints,
// required fields? Should validation be client-side, server-side, or both?"
```

**Ambiguous approach:**
```typescript
// User asks: "Handle user authentication"
// ❌ WRONG: Pick one approach silently
const auth = useCookie("session");

// ✅ CORRECT: Present options
// "Authentication can be handled via:
// 1. Session cookies (better UX, requires cookie consent)
// 2. JWT tokens (stateless, harder to revoke)
// 3. Better-auth integration (existing pattern in codebase)
// Which approach fits your requirements?"
```

**Blocked task:**
```typescript
// Task: Add database migration for new table
// Blocker: Foreign key references undefined table
// ❌ WRONG: Silently skip foreign key
export const newTable = Table.make(EntityId)({
  name: pg.text("name").notNull(),
  // Missing foreign key
});

// ✅ CORRECT: Report blocker + alternatives
// "Cannot add foreign key to 'organizations' table - it doesn't exist yet.
// Options:
// 1. Create organizations table first
// 2. Use nullable reference with later migration
// 3. Change design to not require foreign key"
```

**Low-risk action:**
```typescript
// Scenario: User asks to "improve error messages"
// Current: Effect.fail(new Error("Invalid"))
// ❌ WRONG: Ask permission for obvious improvement
// "Should I add context to error messages?"

// ✅ CORRECT: Make low-risk improvement
class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  { field: S.String, expected: S.String, received: S.String }
) {}

Effect.fail(new ValidationError({
  field: "email",
  expected: "valid email format",
  received: input
}));
```

## Quality Gates

```
gates(typecheck, test) := DELEGATE(agent) ∧ ¬run-directly(orchestrator)
significant(changes)   := |files| > 1 ∨ architectural(impact)
significant(changes)   → /legal-review before finalize
```

### Examples

**Delegate verification to agents:**
```typescript
// ❌ WRONG: Orchestrator runs verification directly
// In main agent context:
await Bash({ command: "bun run check --filter @beep/iam-tables" });
await Bash({ command: "bun run test --filter @beep/iam-tables" });

// ✅ CORRECT: Delegate to specialized agent
// "I'll delegate verification to the test-runner agent"
// Then in separate agent invocation:
// test-runner agent runs: bun run check && bun run test
```

**Significant changes trigger review:**
```typescript
// Scenario: Adding new authentication service
// Changes:
// - packages/iam/server/src/services/AuthService.ts (new)
// - packages/iam/domain/src/schemas/Auth.ts (new)
// - packages/shared/domain/src/EntityIds.ts (modified)

// ❌ WRONG: Commit without review
// git add . && git commit -m "Add auth service"

// ✅ CORRECT: Trigger /legal-review
// "This change spans 3 files and introduces new authentication
// architecture. Requesting /legal-review before finalization."

// Review checks:
// - Does new service follow existing patterns?
// - Are EntityIds correctly branded?
// - Does architecture maintain slice boundaries?
// - Are error types properly tagged?
```

**Non-significant changes can proceed:**
```typescript
// Scenario: Fix typo in error message
// Change:
// - packages/iam/server/src/services/UserService.ts (1 line)

// Before: Effect.fail(new Error("User not fonud"))
// After:  Effect.fail(new Error("User not found"))

// ✅ CORRECT: Low-risk, single file, no architectural impact
// → Proceed without /legal-review
```

## Commands

```
/modules         → list(ai-context-modules)
/module {path}   → content(module(path))
/module-search   → filter(modules, pattern)
/debug {desc}    → ∥(4 × diagnose) → validate(consensus)
```

### Examples

**List available modules:**
```bash
# /modules
# Returns:
# - .claude/rules/effect-patterns.md
# - .claude/rules/general.md
# - .claude/rules/code-standards.md
# - .claude/rules/behavioral.md
# - .claude/rules/meta-thinking.md
# - documentation/patterns/database-patterns.md
# - documentation/EFFECT_PATTERNS.md
```

**Read specific module:**
```bash
# /module .claude/rules/effect-patterns.md
# Returns full content of effect-patterns.md for reference
```

**Search modules by pattern:**
```bash
# /module-search "EntityId"
# Returns modules containing "EntityId":
# - .claude/rules/effect-patterns.md (EntityId Usage section)
# - documentation/patterns/database-patterns.md (Foreign Keys section)
```

**Parallel debugging:**
```typescript
// /debug "Type error in UserService.findById"
// Spawns 4 parallel diagnostic agents, each investigating:
// Agent 1: "Check EntityId branding in UserService"
// Agent 2: "Verify table column .$type<> annotations"
// Agent 3: "Check import paths for UserService dependencies"
// Agent 4: "Verify Schema transformations in UserService"

// After all agents report, validate consensus:
// 3/4 agents identified missing .$type<UserId.Type>() on table column
// → High confidence: Add .$type annotation to user_id column
```

## Knowledge Sources

```
patterns     → skills (auto-suggested)
internals    → .context/ (grep)
```

### Examples

**Pattern lookup (auto-suggested skills):**
```typescript
// User asks: "How do I write Effect tests?"
// System auto-suggests skill: .claude/commands/patterns/effect-testing-patterns.md

// Skill contains:
// - Test runner selection (effect, scoped, live, layer)
// - Example test structures
// - Common patterns and anti-patterns

// Agent uses skill content to provide answer:
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);
```

**Internals lookup (grep .context/):**
```bash
# User asks: "Where is the Member entity defined?"
# Agent searches internals:
Grep { pattern: "class Member", path: ".context/" }

# Results:
# .context/packages/iam/domain/src/entities/Member.ts
# Contains: export class Member extends M.Class<Member>("Member")({...})

# Agent provides specific file path and usage:
# "The Member entity is defined in packages/iam/domain/src/entities/Member.ts
# Import via: import { Member } from '@beep/iam-domain/entities'"
```

**Pattern + internals combination:**
```typescript
// User asks: "How do I add a new table to the IAM slice?"
// 1. Pattern lookup: documentation/patterns/database-patterns.md
//    → Provides table creation pattern
// 2. Internals lookup: .context/packages/iam/tables/
//    → Shows existing table examples

// Combined guidance:
// "Follow database-patterns.md section 'Creating Tables'.
// Reference existing pattern in packages/iam/tables/src/member.ts:
import { Table } from "@beep/tables";
import { IamEntityIds } from "@beep/shared-domain";

export const memberTable = Table.make(IamEntityIds.MemberId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),
  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),
});
```

---

These meta-thinking patterns guide how to reason about Effect code, handle ambiguity, enforce quality gates, and access project knowledge.
