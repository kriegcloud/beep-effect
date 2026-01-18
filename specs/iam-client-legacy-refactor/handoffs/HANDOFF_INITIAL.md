# Handoff: IAM Client Legacy Module Refactoring

## Mission

Create a comprehensive specification to **research, design, plan, and implement** the refactoring of legacy modules in `@beep/iam-client` to align with the canonical patterns established in `sign-in`, `core`, and `sign-up` modules.

---

## Context

### Source of Truth Modules (Already Refactored)

The following modules have been fully refactored and serve as the **canonical reference**:

| Module | Location | Features |
|--------|----------|----------|
| `sign-in` | `packages/iam/client/src/sign-in/` | Email, Username |
| `core` | `packages/iam/client/src/core/` | GetSession, SignOut |
| `sign-up` | `packages/iam/client/src/sign-up/` | Email |

**Pattern Documentation**: `documentation/patterns/iam-client-patterns.md`

### Legacy Modules (To Be Refactored)

| Module | Location | Features (Count) |
|--------|----------|------------------|
| `email-verification` | `packages/iam/client/src/email-verification/` | send-verification (1) |
| `multi-session` | `packages/iam/client/src/multi-session/` | list-sessions, revoke, set-active (3) |
| `organization` | `packages/iam/client/src/organization/` | crud/*, members/*, invitations/* (~15) |
| `password` | `packages/iam/client/src/password/` | change, request-reset, reset (3) |
| `two-factor` | `packages/iam/client/src/two-factor/` | backup/*, enable, disable, otp/*, totp/* (~8) |

**Total**: ~30 handlers across 5 modules

### Key Differences: Canonical vs Legacy

| Aspect | Canonical Pattern | Legacy Pattern |
|--------|-------------------|----------------|
| File structure | `{feature}/index.ts`, `{feature}/mod.ts`, `{feature}/contract.ts`, `{feature}/handler.ts` | `{feature}/index.ts`, `{feature}/{feature}.contract.ts`, `{feature}/{feature}.handler.ts` |

> **Note**: `{feature}` is the feature directory name (e.g., `email/`, `username/`). Canonical pattern uses simple filenames (`contract.ts`), legacy uses prefixed filenames (`email.contract.ts`).
| Contract pattern | **Simple**: `Payload` class directly; **Transform**: `PayloadFrom` + `Payload` transform | Mixed or inconsistent |
| Handler implementation | `Wrapper.implement()` + `wrapIamMethod()` | `createHandler()` factory |
| WrapperGroup | `Wrap.WrapperGroup.make(Wrapper1, Wrapper2)` - **positional args** | N/A |
| Module exports | Namespace via `mod.ts` barrel | Direct re-exports in `index.ts` |
| Service layer | `Effect.Service` + `WrapperGroup` | Missing or inconsistent |
| Atoms | `runtime.fn()` + `runtime.atom()` pattern | Missing or ad-hoc |
| Form integration | `useAppForm` + `formOptionsWithDefaults` | Missing |

**CRITICAL**: Two contract patterns exist:
- **Simple Pattern** (most handlers): `Payload` as `S.Class` directly (no transform)
- **Transform Pattern** (computed fields): `PayloadFrom` + `Payload` transform via `S.transformOrFail`

See `documentation/patterns/iam-client-patterns.md` for when to use each.

---

## Specification Goals

### Phase 1: Discovery
1. Inventory all legacy handlers with their:
   - Current file structure
   - Payload schemas (if any)
   - Success schemas
   - Error handling patterns
   - Better Auth client method used
   - Whether operation mutates session
2. **Pre-flight Verification** (REQUIRED for each Better Auth method):
   - Hover over `client.methodName` in editor to verify type signature
   - Check response shape: `{ data?, error? }` vs other patterns
   - Note parameter requirements and optionality
   - Document any discrepancies between LSP types and official docs
3. Identify handlers requiring each contract pattern:
   - **Simple Pattern**: Fields map 1:1 to API (most handlers)
   - **Transform Pattern**: Computed fields, password confirmation, field renaming
4. Identify any handlers that may require special treatment (multi-step flows, custom error handling)

### Phase 2: Design + Dry Run
1. Create migration plan for each module following canonical patterns
2. Design the `WrapperGroup` composition for each module
3. Plan `Effect.Service` definitions with accessors
4. Define atom patterns for each module
5. Plan form integration where applicable (see Form Integration Guide below)

**Validation Dry Run** (REQUIRED before Phase 3):
Select 3 representative handlers for trial implementation:
- One no-payload handler (e.g., `list-sessions`)
- One simple with-payload handler (e.g., `send-verification`)
- One complex handler with computed fields (if any exist)

After dry run:
- Reflect on what worked and what didn't
- Update prompts/methodology based on learnings
- Rollback implementations, commit only spec improvements

### Phase 3: Implementation Planning
1. Prioritize modules by complexity and dependencies
2. Create detailed implementation tasks for each handler
3. Define verification criteria (type-check, lint, test)
4. Plan for incremental rollout (module by module)

### Phase 4+: Implementation
1. Refactor one module at a time
2. Verify each module before proceeding
3. Update consumers if needed
4. Document any deviations from canonical patterns

---

## Required Protocols

### Pre-flight Verification Protocol

Before implementing ANY handler contract, verify the Better Auth API:

```bash
# 1. Open the handler file and hover over the client method
#    Example: client.multiSession.listDeviceSessions
#    Note the parameter types and return type

# 2. Check the response pattern
#    Standard: { data: T, error?: E }
#    Some methods: { token: string } or direct value

# 3. Verify optional vs required parameters
#    LSP types are source of truth (not docs)

# 4. Document any surprises in outputs/better-auth-api-audit.md
```

### Dry Run Protocol

For specs with 10+ handlers, a dry run is MANDATORY before full implementation:

1. **Select representative handlers** (3 minimum):
   - No-payload handler
   - Simple payload handler
   - Complex/transform payload handler

2. **Implement + Reflect** (one at a time):
   - Follow canonical patterns exactly
   - Note any friction or confusion
   - Verify type-check passes

3. **Synthesize findings**:
   - What patterns worked smoothly?
   - What required deviation from docs?
   - What prompts need refinement?

4. **Update spec artifacts**:
   - Improve AGENT_PROMPTS.md if needed
   - Update templates based on learnings
   - Rollback code changes (this is research, not implementation)

---

## Reflection Checkpoint Questions

After **Phase 1** completion, answer:
- Which Better Auth APIs have nullable vs optional response fields?
- Which handlers mutate session (require `$sessionSignal` notification)?
- Which handlers require computed payload fields (Transform Pattern)?
- Which handlers have middleware requirements (captcha, rate-limit)?
- What error patterns are currently used? Do they all map to `IamError`?

After **Phase 2** completion, answer:
- Did the dry run reveal unexpected API behaviors?
- Were any handlers more complex than anticipated?
- What methodology changes improved implementation speed?
- Are there handlers that can be grouped for parallel implementation?

After **Phase 3** completion, answer:
- What is the implementation order by dependency?
- Which handlers can be done in parallel batches?
- What verification commands confirm success for each module?

After **Each Phase 4 Iteration** (per module), answer:
- Did all handlers in this module follow canonical patterns?
- Were there any deviations? If so, document why.
- Does type-check pass? Does lint pass?
- Are there consumer updates needed?

---

## Form Integration Guide

**When to include `form.ts`**: Only modules with **user-facing form UI** need form integration.

| Module | Needs `form.ts`? | Reason |
|--------|------------------|--------|
| `sign-in` | ✅ Yes | Login forms |
| `sign-up` | ✅ Yes | Registration forms |
| `core` | ❌ No | No user forms (get-session, sign-out are programmatic) |
| `password` | ✅ Yes | Change password, reset password forms |
| `two-factor` | ✅ Yes | TOTP setup, OTP entry forms |
| `organization` | ⚠️ Partial | Create/update org forms; list/delete are programmatic |
| `multi-session` | ❌ No | Session management is programmatic (list, revoke) |
| `email-verification` | ❌ No | Typically triggered by links, not forms |

**Decision Criteria**: Ask "Does this feature have a UI form where users enter data?"
- **Yes** → Include `form.ts` with `useAppForm` + `formOptionsWithDefaults`
- **No** → Skip `form.ts`, atoms are sufficient for programmatic use

---

## Key References

### Pattern Documentation
- `documentation/patterns/iam-client-patterns.md` - **Primary reference** for all patterns
- `documentation/EFFECT_PATTERNS.md` - Effect conventions
- `.claude/rules/effect-patterns.md` - Import conventions and schema rules

### Canonical Implementation Examples

**Simple Pattern** (default for most handlers):
- `packages/iam/client/src/sign-in/email/contract.ts` - Payload class, Success, Wrapper
- `packages/iam/client/src/core/get-session/contract.ts` - No-payload example

**Transform Pattern** (for computed fields):
- `packages/iam/client/src/sign-up/email/contract.ts` - PayloadFrom + Payload transform + Success

**Module Structure**:
- `packages/iam/client/src/sign-in/layer.ts` - `WrapperGroup.make(Wrapper1, Wrapper2)` - positional args!
- `packages/iam/client/src/sign-in/service.ts` - Effect.Service + runtime
- `packages/iam/client/src/sign-in/atoms.ts` - Atom hook pattern
- `packages/iam/client/src/sign-in/form.ts` - Form hook pattern

**Handler Implementation**:
- `packages/iam/client/src/sign-in/email/handler.ts` - wrapIamMethod usage

### Legacy Handler Factory (To Be Deprecated)
- `packages/iam/client/src/_internal/handler.factory.ts` - Old `createHandler` pattern

### Internal Utilities
- `packages/iam/client/src/_internal/wrap-iam-method.ts` - New handler pattern
- `packages/iam/client/src/_internal/common.schemas.ts` - Shared schemas
- `packages/iam/client/src/_internal/common.atom.ts` - Atom utilities

---

## Recommended Spec Structure

```
specs/iam-client-legacy-refactor/
├── README.md                           # Entry point
├── REFLECTION_LOG.md                   # Learnings
├── QUICK_START.md                      # 5-min guide
├── MASTER_ORCHESTRATION.md             # Full workflow
├── outputs/
│   ├── legacy-inventory.md             # P1: Complete handler inventory
│   ├── better-auth-api-audit.md        # P1: API signature research
│   ├── migration-design.md             # P2: Design decisions
│   └── implementation-plan.md          # P3: Prioritized task list
├── handoffs/
│   ├── HANDOFF_P1.md                   # Discovery phase handoff
│   ├── HANDOFF_P2.md                   # Design phase handoff
│   └── ...                             # Iteration handoffs
└── templates/
    ├── handler-migration.template.md   # Per-handler migration checklist
    └── module-completion.template.md   # Per-module verification checklist
```

---

## Suggested Complexity: Complex

This spec should use **complex** scaffolding because:
- 30+ handlers across 5 modules
- Multiple phases (discovery, design, implementation)
- Likely 4+ sessions to complete
- Requires detailed inventory and planning artifacts
- Benefits from structured handoffs between phases

---

## First Steps

1. **Bootstrap the spec**:
   ```bash
   bun run beep bootstrap-spec -n iam-client-legacy-refactor -d "Refactor legacy IAM client modules to canonical patterns" -c complex
   ```

2. **Read the pattern documentation**:
   - `documentation/patterns/iam-client-patterns.md`
   - Review canonical modules: `sign-in`, `core`, `sign-up`

3. **Begin Phase 1 Discovery**:
   - Inventory all legacy handlers
   - Document current patterns vs target patterns
   - Identify special cases

---

## Success Criteria

- [ ] All 5 legacy modules refactored to canonical patterns
- [ ] All handlers use `Wrapper.implement()` + `wrapIamMethod()`
- [ ] Each module has `layer.ts`, `service.ts`, `atoms.ts`
- [ ] Each module has proper namespace exports via `mod.ts`
- [ ] All code passes type-check (`bun run check --filter @beep/iam-client`)
- [ ] All code passes lint (`bun run lint --filter @beep/iam-client`)
- [ ] JSDoc follows category hierarchy conventions
- [ ] `createHandler` factory is deprecated or removed

---

## Known Issues to Address

1. **Pre-existing type error** in `organization/crud/create/create.handler.ts`:
   - Missing `isPersonal` property
   - Should be fixed as part of organization module refactor

2. **Pre-existing lint error** in `@beep/iam-server`:
   - Unrelated to client refactor but may affect cascading checks

---

## Agent-Phase Mapping

Recommended specialized agents for each phase:

| Phase    | Agents                          | Purpose                                     |
|----------|---------------------------------|---------------------------------------------|
| Phase 1  | `Explore`                       | Handler inventory, codebase search          |
| Phase 1  | `mcp-researcher` (Effect docs)  | Better Auth API research                    |
| Phase 2  | `code-reviewer`                 | Validate migration designs against patterns |
| Phase 2  | `architecture-pattern-enforcer` | Ensure structural compliance                |
| Phase 3  | `reflector`                     | Synthesize dry run learnings                |
| Phase 4+ | `package-error-fixer`           | Fix type/lint errors per module             |

---

## Notes for the Orchestrator

- Start with the **simplest module** (`email-verification` with 1 handler) to validate patterns
- The `organization` module is the **most complex** with ~15 handlers - save for last
- Use the pattern documentation as the single source of truth
- Each module can be a separate iteration/handoff
- Consider parallel sub-agents for handler inventory if scope is large
- **Two contract patterns exist**: Simple (default) vs Transform (computed fields) - see pattern docs
