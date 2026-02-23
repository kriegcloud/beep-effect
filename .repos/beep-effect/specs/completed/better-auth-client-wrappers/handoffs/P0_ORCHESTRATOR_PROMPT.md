# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 (Infrastructure) implementation.

---

## Prompt

You are implementing Phase 0 of the better-auth-client-wrappers spec. This is a **preparatory phase** focused on identifying and creating scope-reducing infrastructure before the main implementation phases (P1-P6).

### Your Mission

Analyze the 90 methods to implement and create utilities, types, schemas, and boilerplate generators that will **maximize efficiency** for subsequent phases.

---

## Stage 0: Pre-Flight (MANDATORY)

**Before ANY changes:**

```bash
# 1. Verify baseline compiles
bun run check --filter @beep/iam-client

# 2. Create working branch
git checkout -b feat/iam-client-wrappers-p0
git status  # Non-clean is OK (parallel agents may be active)
```

**If pre-flight fails**: Fix existing issues FIRST. Do NOT proceed with errors.

---

## Stage 1: Pattern Analysis (Research Phase)

### 1.1 Audit Existing Patterns

Examine ALL existing handlers in `packages/iam/client/src/` to identify:

1. **File structure patterns** - What files are always identical (mod.ts, index.ts)?
2. **Response schema patterns** - Which response shapes repeat?
3. **Handler patterns** - Which handler variations exist?

**Reference directories:**
- `packages/iam/client/src/sign-in/email/`
- `packages/iam/client/src/core/sign-out/`
- `packages/iam/client/src/organization/members/list/`

### 1.2 Categorize the 90 Methods

Review `MASTER_ORCHESTRATION.md` and categorize each method by:

| Category | Pattern | Count | Example |
|----------|---------|-------|---------|
| Standard | Payload + Success | ~50 | updateUser |
| No-payload | Success only | ~15 | deleteUser |
| Array response | Returns array | ~10 | listAccounts |
| Query-wrapped | Expects `{ query: payload }` | ~10 | listMembers |
| Transform | Pre/post processing | ~5 | (identify) |

**Output:** Create `outputs/phase-0-pattern-analysis.md`

---

## Stage 2: Identify Scope-Reducing Opportunities

Based on pattern analysis, identify infrastructure that could reduce per-method effort:

### 2.1 Boilerplate File Templates

**Opportunity**: `mod.ts` and `index.ts` are identical for every method.

```typescript
// mod.ts (always the same)
export * from "./contract.ts";
export * from "./handler.ts";

// index.ts (PascalCase varies)
export * as UpdateUser from "./mod.ts";
```

**Action**: Create generator utilities or document the exact copy-paste templates.

### 2.2 Common Response Schemas

Identify response schemas that appear in multiple methods:

| Schema Pattern | Used By | Candidate for Extraction |
|----------------|---------|-------------------------|
| `{ status: boolean }` | ban/unban, delete | `StatusResponse` |
| `{ user: DomainUser }` | update, create | Already exists |
| `Session[]` | listSessions, listUserSessions | `SessionArrayResponse` |
| `Role[]` | listRoles | `RoleArrayResponse` |

**Action**: Create shared response schemas in `_internal/` or `_common/`.

### 2.3 Handler Pattern Templates

Document the exact handler patterns for each category:

```typescript
// Standard pattern
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })((encoded) => client.[method](encoded))
);

// No-payload pattern
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })(() => client.[method]())
);

// Query-wrapped pattern
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.[method]({ query: encoded }))
);
```

### 2.4 JSDoc Templates

Each file needs JSDoc with `@module`, `@category`, `@since`, `@example`. Create templates:

```typescript
// contract.ts JSDoc template
/**
 * @fileoverview
 * [Operation] contract schemas and wrapper for Better Auth integration.
 *
 * @module @beep/iam-client/[category]/[operation]/contract
 * @category [Category]/[Operation]
 * @since 0.1.0
 */

// handler.ts JSDoc template
/**
 * @fileoverview
 * [Operation] handler implementation using wrapIamMethod factory.
 *
 * @module @beep/iam-client/[category]/[operation]/handler
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
```

---

## Stage 3: Implementation

Based on analysis, implement the most impactful scope-reducing utilities:

### 3.1 Create Shared Response Schemas (if beneficial)

In `packages/iam/client/src/_internal/common.schemas.ts` or new file:

```typescript
// Example: StatusResponse for boolean status returns
export class StatusResponse extends S.Class<StatusResponse>($I`StatusResponse`)(
  { status: S.Boolean },
  $I.annotations("StatusResponse", {
    description: "Generic boolean status response",
  })
) {}
```

### 3.2 Create Method Reference Document

Create `outputs/method-implementation-guide.md` with:

```markdown
## Method: updateUser

| Field | Value |
|-------|-------|
| Category | core |
| Pattern | Standard |
| mutatesSession | true |
| Payload | `{ name?: string, image?: string }` |
| Response | `{ user: DomainUser }` |
| Client call | `client.updateUser(encoded)` |

... (repeat for all 90 methods)
```

### 3.3 Update layer.ts Structure (if needed)

Check if existing `layer.ts` files need structural updates to accommodate new handlers efficiently.

---

## Stage 4: Documentation Updates

### 4.1 Create HANDOFF_P0.md

Document what was created:
- Pattern analysis findings
- Utilities created
- Templates documented
- Scope reduction estimates

### 4.2 Update HANDOFF_P1.md

Incorporate P0 findings:
- Reference new shared schemas
- Reference new templates
- Update estimated effort based on scope reduction

### 4.3 Update MASTER_ORCHESTRATION.md

Add P0 phase and any methodology improvements.

---

## Success Criteria

### Analysis Complete
- [ ] `outputs/phase-0-pattern-analysis.md` created
- [ ] All 90 methods categorized by pattern
- [ ] Common response schemas identified
- [ ] Boilerplate patterns documented

### Implementation Complete
- [ ] Any new shared schemas added to `_internal/`
- [ ] `outputs/method-implementation-guide.md` created
- [ ] Templates for each handler pattern documented

### Documentation Updated
- [ ] `handoffs/HANDOFF_P0.md` created
- [ ] `handoffs/HANDOFF_P1.md` updated with P0 findings
- [ ] `MASTER_ORCHESTRATION.md` updated with P0 phase

### Verification
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `bun run lint:fix --filter @beep/iam-client` passes

---

## Key Questions to Answer

During P0, you should answer:

1. **Which response schemas appear 3+ times?** → Extract to shared module
2. **Which methods require `transformResponse`?** → Document the pattern
3. **Which methods use captcha middleware?** → List them explicitly
4. **Which categories need new layer.ts files?** → Plan ahead
5. **What's the optimal batch size for P1-P6?** → Validate current phase splits

---

## Anti-Patterns to Avoid

1. **Over-engineering**: Don't create abstractions that only save 2-3 lines
2. **Premature optimization**: Focus on patterns that appear 5+ times
3. **Incomplete analysis**: Don't start implementing until ALL 90 methods reviewed
4. **Ignoring existing patterns**: Use what already exists in `_internal/`

---

## Reference Files

| Purpose | File |
|---------|------|
| Existing internals | `packages/iam/client/src/_internal/` |
| Method list | `specs/better-auth-client-wrappers/MASTER_ORCHESTRATION.md` |
| Contract example | `packages/iam/client/src/sign-in/email/contract.ts` |
| Handler example | `packages/iam/client/src/sign-in/email/handler.ts` |
| No-payload example | `packages/iam/client/src/core/sign-out/` |
| Query-wrapped example | `packages/iam/client/src/organization/members/list/` |

---

## Handoff Document

After completing P0, create: `specs/better-auth-client-wrappers/handoffs/HANDOFF_P0.md`
