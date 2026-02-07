# Zero Email Port: Evaluation Rubrics

> Scoring criteria for evaluating port quality from Zero tRPC to Effect RPC.

---

## 1. Schema Coverage (1-5 Scale)

Evaluates the completeness and correctness of Effect Schema definitions.

### 5/5 - Exceptional

- 100% of email operations validated with Effect Schema
- All ID fields use branded EntityIds (`CommsEntityIds.*`, `SharedEntityIds.*`)
- All credentials use `S.Redacted` (OAuth tokens, API keys, secrets)
- All optional/nullable fields use correct patterns (`S.optional`, `S.optionalWith`)
- All schemas have proper `$I` identifiers from `@beep/identity/packages`
- BS helpers used where appropriate (`BS.FieldSensitiveOptionOmittable`, `BS.EmailBase`)

### 4/5 - Good

- 95%+ operations have Effect Schema validation
- All ID fields use branded EntityIds
- All user credentials use `S.Redacted`
- Minor issues: 1-2 fields missing proper optional handling
- All `$I` identifiers correct

### 3/5 - Acceptable

- 80%+ operations have Effect Schema validation
- 90%+ ID fields use branded EntityIds
- Most credentials protected with `S.Redacted`
- 3-5 fields with incorrect optional/nullable patterns
- Some schemas missing `$I` identifiers

### 2/5 - Needs Improvement

- 60-79% operations have Effect Schema validation
- Multiple ID fields using plain `S.String`
- Some credentials exposed without `S.Redacted`
- Inconsistent optional field handling
- Missing formValuesAnnotation on payload schemas

### 1/5 - Incomplete

- <60% operations have Effect Schema validation
- Widespread use of `S.String` for IDs
- No `S.Redacted` usage for credentials
- `S.Any` or `S.Unknown` used for complex types
- Missing schemas cause runtime type errors

### Schema Coverage Checklist

| Item | Required | Example |
|------|----------|---------|
| EntityId for all IDs | Yes | `connectionId: CommsEntityIds.ConnectionId` |
| S.Redacted for tokens | Yes | `accessToken: S.Redacted(S.String)` |
| S.Date for Date objects | Yes | `expiresAt: S.Date` |
| S.DateFromString for ISO | Yes | `timestamp: S.DateFromString` |
| BS.EmailBase for emails | Yes | `from: BS.EmailBase` |
| $I identifier pattern | Yes | `$CommsDomainId.create("rpc/mail/list")` |

---

## 2. RPC Endpoint Correctness (1-5 Scale)

Evaluates adherence to Effect RPC patterns and handler implementation.

### 5/5 - Exceptional

- All endpoints follow `Rpc.make("name", { payload, success })` pattern
- All RPC groups use `RpcGroup.make("GroupName")` with proper chaining
- All error types extend `S.TaggedError` with descriptive tags
- Layer composition correct: `Layer.provide`, `Layer.merge` used appropriately
- All handlers use `Effect.gen` with proper error typing
- Spans added via `Effect.withSpan` for observability

### 4/5 - Good

- All endpoints use `Rpc.make` correctly
- RpcGroup composition correct
- Error types properly tagged
- Layer composition works
- Minor issues: 1-2 handlers missing spans
- All handlers compile without error

### 3/5 - Acceptable

- 90%+ endpoints use correct RPC patterns
- RpcGroup mostly correct, minor composition issues
- Most errors properly tagged
- Layer composition functional but not optimal
- Some handlers missing error narrowing
- 3-5 missing observability spans

### 2/5 - Needs Improvement

- 70-89% endpoints follow RPC patterns
- Some endpoints use ad-hoc patterns
- Error types inconsistent (mix of tagged/untagged)
- Layer composition has dependency issues
- Multiple handlers with `Effect.catchAll` instead of `Effect.catchTag`

### 1/5 - Incomplete

- <70% endpoints follow RPC patterns
- RpcGroup not used or incorrect
- Error types as plain strings or generic Error
- Layer composition broken (runtime DI failures)
- Handlers use `Effect.runPromise` internally

### RPC Endpoint Checklist

| Item | Required | Example |
|------|----------|---------|
| Rpc.make usage | Yes | `Rpc.make("sendMail", { payload: Payload, success: Success })` |
| RpcGroup chaining | Yes | `RpcGroup.make("Mail").add(listThreads).add(getThread)` |
| S.TaggedError | Yes | `class MailError extends S.TaggedError<MailError>()("MailError", {...})` |
| Layer.provide | Yes | `GmailDriverLive.pipe(Layer.provide(HttpClient.layer))` |
| Effect.withSpan | Yes | `Effect.withSpan("MailDriver.listThreads")` |

### Error Type Reference

```typescript
// REQUIRED - Tagged error pattern
export class MailDriverError extends S.TaggedError<MailDriverError>()(
  "MailDriverError",
  {
    operation: S.String,
    provider: S.Literal("gmail", "outlook"),
    cause: S.optional(S.String),
  }
) {}

// REQUIRED - Granular error types
export class ConnectionNotFoundError extends S.TaggedError<ConnectionNotFoundError>()(
  "ConnectionNotFoundError",
  { connectionId: CommsEntityIds.ConnectionId }
) {}
```

---

## 3. Type Safety (1-5 Scale)

Evaluates TypeScript strictness and type correctness.

### 5/5 - Exceptional

- Zero `any` types in entire codebase
- Zero `@ts-ignore` or `@ts-expect-error` comments
- Zero unchecked type casts (`as` keyword)
- All EntityIds use `.$type<EntityId.Type>()` on table columns
- All external data validated through Schema.decode
- Proper use of branded types throughout

### 4/5 - Good

- Zero `any` types
- Zero `@ts-ignore`
- 1-2 justified type casts with comments
- EntityIds correctly typed on 95%+ columns
- External data validated

### 3/5 - Acceptable

- No `any` in public API
- Zero `@ts-ignore`
- 3-5 type casts
- EntityIds correct on 80%+ columns
- Most external data validated

### 2/5 - Needs Improvement

- 1-5 `any` types
- 1-2 `@ts-ignore` comments
- Multiple unchecked casts
- Inconsistent EntityId typing
- Some external data not validated

### 1/5 - Incomplete

- Widespread `any` usage
- Multiple `@ts-ignore`
- Unsafe casts throughout
- Plain strings for IDs
- External data used without validation

### Type Safety Verification

```bash
# Run these checks - all should pass
bun run check --filter @beep/comms-*

# Search for anti-patterns (should return 0)
grep -r "as any" packages/comms/
grep -r "@ts-ignore" packages/comms/
grep -r "@ts-expect-error" packages/comms/
grep -r ": any" packages/comms/
```

### EntityId Table Column Pattern

```typescript
// REQUIRED - .$type<> on all foreign key columns
export const emailConnections = Table.make(CommsEntityIds.ConnectionId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),
  organizationId: pg.text("organization_id")
    .$type<SharedEntityIds.OrganizationId.Type>(),
});
```

---

## 4. Test Coverage (1-5 Scale)

Evaluates test quality and adherence to `@beep/testkit` patterns.

### 5/5 - Exceptional

- All RPC handlers have unit tests
- Uses `@beep/testkit` exclusively (no raw `bun:test`)
- `effect()` wrapper for standard tests
- `layer()` wrapper for integration tests with shared resources
- All assertions use testkit functions (`strictEqual`, `deepStrictEqual`)
- Test files in `./test` directory mirroring `./src`
- Path aliases used (`@beep/*`) not relative imports

### 4/5 - Good

- 90%+ handlers have tests
- All tests use `@beep/testkit`
- Correct wrapper usage
- Minor: 1-2 tests missing assertions
- Test organization correct

### 3/5 - Acceptable

- 70%+ handlers have tests
- All tests use testkit
- Some tests use wrong wrapper (e.g., `effect()` where `layer()` needed)
- Some relative imports in tests
- Basic happy path coverage

### 2/5 - Needs Improvement

- 50-69% handlers have tests
- Mixed testkit and raw `bun:test`
- Wrong wrappers causing flaky tests
- Tests in wrong locations
- Missing error path coverage

### 1/5 - Incomplete

- <50% handlers have tests
- Uses raw `bun:test` with `Effect.runPromise`
- Tests fail to run
- No integration tests
- No Layer mocking

### Test Pattern Examples

```typescript
// REQUIRED - Unit test with effect()
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("MailDriver.listThreads returns threads", () =>
  Effect.gen(function* () {
    const driver = yield* MailDriver;
    const result = yield* driver.listThreads({ folder: "INBOX" });
    strictEqual(result.threads.length > 0, true);
  }).pipe(Effect.provide(TestMailDriverLive))
);

// REQUIRED - Integration test with layer()
import { layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";

layer(IntegrationTestLayer, { timeout: Duration.seconds(60) })("Mail RPC", (it) => {
  it.effect("listThreads returns paginated results", () =>
    Effect.gen(function* () {
      const rpc = yield* MailRpc;
      const result = yield* rpc.listThreads({
        connectionId: testConnectionId,
        folder: "INBOX",
        maxResults: 10,
      });
      strictEqual(Array.isArray(result.threads), true);
    })
  );
});
```

### FORBIDDEN Test Pattern

```typescript
// NEVER - Raw bun:test with Effect.runPromise
import { test } from "bun:test";
import * as Effect from "effect/Effect";

test("wrong pattern", async () => {
  await Effect.gen(function* () {
    // ...
  }).pipe(Effect.provide(TestLayer), Effect.runPromise); // FORBIDDEN!
});
```

---

## 5. Effect Pattern Compliance (1-5 Scale)

Evaluates adherence to Effect idioms and utility usage.

### 5/5 - Exceptional

- `Effect.gen` used over `Effect.flatMap` chains
- `pipe()` used over nested function calls
- `Match.typeTags` or `$match` used over switch statements
- `A.*` (effect/Array) used over native array methods
- `Str.*` (effect/String) used over native string methods
- `O.*` (effect/Option) used over null checks
- `DateTime` used over `new Date()`
- All namespace imports follow project conventions

### 4/5 - Good

- Effect.gen consistently used
- pipe() used appropriately
- Match used for discriminated unions
- 95%+ collection operations use Effect utilities
- Minor: 1-2 native method calls in non-critical paths

### 3/5 - Acceptable

- Effect.gen mostly used
- Some flatMap chains remain
- Switch statements for simple cases
- 80%+ operations use Effect utilities
- Some native Date usage

### 2/5 - Needs Improvement

- Mixed Effect.gen and flatMap
- Multiple switch statements
- 50-79% operations use Effect utilities
- Native array methods common
- console.log instead of Effect.log

### 1/5 - Incomplete

- Predominantly flatMap chains
- No Match usage
- Native methods throughout
- Promise-based code
- try/catch instead of Effect error handling

### Pattern Verification Commands

```bash
# Check for native array methods (should be 0)
grep -rn "\.map\(" packages/comms/src --include="*.ts" | grep -v "A.map"
grep -rn "\.filter\(" packages/comms/src --include="*.ts" | grep -v "A.filter"
grep -rn "\.reduce\(" packages/comms/src --include="*.ts" | grep -v "A.reduce"

# Check for switch statements (should be 0)
grep -rn "switch\s*(" packages/comms/src --include="*.ts"

# Check for new Date() (should be 0)
grep -rn "new Date()" packages/comms/src --include="*.ts"

# Check for console.log (should be 0)
grep -rn "console\." packages/comms/src --include="*.ts"
```

### Required Import Patterns

```typescript
// REQUIRED - Namespace imports
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as O from "effect/Option";
import * as Match from "effect/Match";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// FORBIDDEN - Named imports for these modules
import { map, filter } from "effect/Array";  // WRONG
import { toLowerCase } from "effect/String"; // WRONG
```

---

## 6. Architecture Compliance (1-5 Scale)

Evaluates adherence to beep-effect vertical slice architecture.

### 5/5 - Exceptional

- Strict domain -> tables -> server -> client -> ui dependency flow
- All imports use `@beep/*` path aliases
- Zero cross-slice direct imports
- Cross-slice communication only via `@beep/shared-*` or `@beep/common-*`
- Each layer isolated (domain pure, server Effect-based)
- Package boundaries respected

### 4/5 - Good

- Dependency flow correct
- All imports use path aliases
- Zero cross-slice imports
- Minor: 1-2 imports could be more specific
- Package boundaries maintained

### 3/5 - Acceptable

- Mostly correct dependency flow
- 95%+ imports use path aliases
- Zero direct cross-slice imports
- Some loose coupling issues
- Minor boundary violations

### 2/5 - Needs Improvement

- Some dependency flow violations
- Mixed path aliases and relative paths
- 1-2 cross-slice imports
- Domain layer has Effect dependencies
- Package boundaries unclear

### 1/5 - Incomplete

- Arbitrary dependency flow
- Predominantly relative imports
- Multiple cross-slice imports
- Domain layer impure
- No clear package boundaries

### Architecture Verification

```bash
# Check for relative imports crossing packages (should be 0)
grep -rn "\.\./\.\./\.\./packages" packages/comms/

# Check for direct cross-slice imports (should be 0)
grep -rn "from \"@beep/iam-" packages/comms/src --include="*.ts"
grep -rn "from \"@beep/documents-" packages/comms/src --include="*.ts"
grep -rn "from \"@beep/calendar-" packages/comms/src --include="*.ts"
grep -rn "from \"@beep/knowledge-" packages/comms/src --include="*.ts"

# Allowed cross-package imports
# @beep/shared-* (shared utilities)
# @beep/common-* (common infrastructure)
# @beep/schema (schema utilities)
# @beep/utils (common utilities)
```

### Layer Dependency Rules

| Layer | Can Import | Cannot Import |
|-------|------------|---------------|
| `comms-domain` | `@beep/schema`, `@beep/shared-domain`, `effect/*` | `comms-tables`, `comms-server`, `comms-client`, `comms-ui` |
| `comms-tables` | `comms-domain`, `@beep/shared-tables`, `drizzle-orm` | `comms-server`, `comms-client`, `comms-ui` |
| `comms-server` | `comms-domain`, `comms-tables`, `@effect/*` | `comms-client`, `comms-ui` |
| `comms-client` | `comms-domain`, `@effect/rpc` | `comms-tables`, `comms-server`, `comms-ui` |
| `comms-ui` | `comms-domain`, `comms-client`, `react` | `comms-tables`, `comms-server` |

---

## Overall Scoring

### Dimension Weights

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Schema Coverage | 20% | Effect Schema completeness and correctness |
| RPC Endpoint Correctness | 20% | Adherence to Rpc.make, RpcGroup patterns |
| Type Safety | 20% | Zero any, no @ts-ignore, proper casts |
| Test Coverage | 15% | @beep/testkit usage, coverage depth |
| Effect Pattern Compliance | 15% | Effect idioms, utility usage |
| Architecture Compliance | 10% | Slice architecture, import rules |

### Final Grade Calculation

```
Final Score = (Schema × 0.20) + (RPC × 0.20) + (TypeSafety × 0.20) +
              (Tests × 0.15) + (EffectPatterns × 0.15) + (Architecture × 0.10)
```

### Grade Scale

| Grade | Score Range | Description |
|-------|-------------|-------------|
| A | 4.5 - 5.0 | Exceptional - Production ready |
| B | 3.5 - 4.4 | Good - Minor improvements needed |
| C | 2.5 - 3.4 | Acceptable - Refactoring required |
| D | 1.5 - 2.4 | Needs Improvement - Significant rework |
| F | 1.0 - 1.4 | Incomplete - Start over |

---

## Phase-Specific Rubrics

### Phase 0: Foundation

| Criterion | Weight | 5/5 Criteria |
|-----------|--------|--------------|
| EntityId Coverage | 30% | All entities have branded IDs in CommsEntityIds |
| Domain Model Completeness | 30% | All Zero models ported with Effect Schema |
| Table Definitions | 25% | Tables created with `Table.make()`, proper EntityId.$type<>() |
| Error Type Hierarchy | 15% | Tagged errors for all failure cases |

### Phase 1: Email Drivers

| Criterion | Weight | 5/5 Criteria |
|-----------|--------|--------------|
| Driver Interface | 25% | Generic MailDriver service with all operations |
| Gmail Implementation | 25% | GmailDriverLive with OAuth, full API coverage |
| Outlook Implementation | 25% | OutlookDriverLive with OAuth, full API coverage |
| Token Management | 25% | Refresh token handling, secure storage |

### Phase 2-4: RPC Handlers

| Criterion | Weight | 5/5 Criteria |
|-----------|--------|--------------|
| Contract Coverage | 30% | All tRPC procedures have RPC contracts |
| Handler Implementation | 30% | Handlers use Effect.gen, proper error handling |
| Test Coverage | 25% | All handlers have unit + integration tests |
| Documentation | 15% | JSDoc, AGENTS.md for each package |

### Phase 5: UI Components

| Criterion | Weight | 5/5 Criteria |
|-----------|--------|--------------|
| VM Pattern | 30% | All components use ViewModel pattern |
| Effect-Atom Integration | 25% | State management via Effect-Atom |
| Component Coverage | 25% | All Zero UI features ported |
| Accessibility | 20% | ARIA labels, keyboard navigation |

---

## Common Deductions

| Issue | Deduction | Fix |
|-------|-----------|-----|
| `any` type | -0.5 per instance | Use proper Schema or generic |
| `@ts-ignore` | -0.5 per instance | Fix underlying type error |
| Plain string ID | -0.3 per instance | Use EntityId |
| Native array method | -0.2 per instance | Use `A.*` from effect/Array |
| switch statement | -0.3 per instance | Use `Match.*` |
| Missing test | -0.3 per handler | Add effect() test |
| Wrong test wrapper | -0.2 per test | Use correct wrapper |
| Cross-slice import | -0.5 per instance | Route through shared |
| Relative import | -0.2 per instance | Use @beep/* alias |
| Missing span | -0.1 per handler | Add Effect.withSpan |

---

## Quality Gates

### Phase Completion Requirements

Cannot proceed to next phase unless:

- [ ] Current phase score >= 3.5 overall
- [ ] Schema Coverage >= 4.0
- [ ] Type Safety >= 4.0
- [ ] `bun run check --filter @beep/comms-*` passes
- [ ] `bun run lint --filter @beep/comms-*` passes
- [ ] `bun run test --filter @beep/comms-*` passes
- [ ] Handoff documentation created

### Final Acceptance Criteria

Port is complete when:

- [ ] All 6 phases score >= 3.5
- [ ] Overall score >= 4.0
- [ ] Zero `any` types
- [ ] Zero `@ts-ignore`
- [ ] All handlers have tests
- [ ] Full feature parity with Zero
- [ ] Documentation complete
- [ ] REFLECTION_LOG finalized

---

## Scoring Template

Use this template when evaluating a phase:

```markdown
## Phase [N] Evaluation

### Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Schema Coverage | /5 | |
| RPC Endpoint Correctness | /5 | |
| Type Safety | /5 | |
| Test Coverage | /5 | |
| Effect Pattern Compliance | /5 | |
| Architecture Compliance | /5 | |

### Weighted Score

(Schema × 0.20) + (RPC × 0.20) + (Type × 0.20) + (Test × 0.15) + (Effect × 0.15) + (Arch × 0.10) = **X.XX**

### Grade: [A/B/C/D/F]

### Issues Found

1. [Issue description with file:line reference]
2. ...

### Recommendations

1. [Specific fix recommendation]
2. ...

### Pass/Fail: [PASS/FAIL]
```
