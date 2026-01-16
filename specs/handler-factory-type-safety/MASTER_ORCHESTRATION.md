# Master Orchestration Guide

This document coordinates multi-phase execution of the Handler Factory Type Safety specification.

## Phase Overview

```
Phase 0: Discovery & Pattern Research
    ↓
Phase 1: Scratchpad Setup & Baseline
    ↓
Phase 2: Design Type-Safe Architecture
    ↓
Phase 3: Implement in Scratchpad
    ↓
Phase 4: Validate Scratchpad Handlers
    ↓
Phase 5: Apply to Real Code
    ↓
Phase 6: Final Validation & Docs
```

---

## Phase 0: Discovery & Pattern Research

### Entry Criteria
- Spec files read and understood
- Effect docs MCP tool available

### Agent Assignment
| Agent | Tasks |
|-------|-------|
| `effect-researcher` | 0.1, 0.2 - Research Match/Predicate patterns |
| `Explore` | 0.3 - Analyze call site dependencies |
| `effect-code-writer` | 0.4 - Create proof of concept |
| `reflector` | End - Document learnings |

### Tasks

#### 0.1 Research Effect Match Generics
Query Effect documentation for:
- How `Match.when` handles generic type parameters
- Predicate function type narrowing behavior
- Return type inference with `Match.orElse`
- Examples of Match with schema types

#### 0.2 Research Type Guard Patterns
Search for:
- Type guards that narrow generic union types
- "Discriminated union without literal tag field" patterns
- How Effect packages handle similar conditional types

#### 0.3 Analyze Call Site Dependencies
Find and document:
- All files importing `createHandler`
- How return types are used at each call site
- Any call site relying on specific type inference

#### 0.4 Proof of Concept
Create minimal POC demonstrating:
- Type-safe branching without assertions
- Proper generic parameter flow
- Identical return type to current implementation

#### 0.5 Design Proposal
Write proposal covering:
- Recommended approach with rationale
- Type definitions for config variants
- Implementation skeleton
- Risk assessment
- Rollback plan

### Exit Criteria
- [ ] `outputs/pattern-analysis.md` documents Match/Predicate findings
- [ ] `outputs/call-site-analysis.md` lists all usages
- [ ] `outputs/poc-approach.ts` demonstrates feasibility
- [ ] `outputs/design-proposal.md` provides implementation path
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

### Handoff
Create `handoffs/P1_ORCHESTRATOR_PROMPT.md` with:
1. Summary of chosen approach
2. Scratchpad setup instructions (files to copy)
3. Specific implementation tasks
4. Expected challenges

---

## Phase 1: Scratchpad Setup & Baseline

### Entry Criteria
- Phase 0 completed
- Design approach selected
- `handoffs/P1_ORCHESTRATOR_PROMPT.md` exists

### Agent Assignment
| Agent | Tasks |
|-------|-------|
| `effect-code-writer` | Copy files to scratchpad |
| Manual | Verify baseline type-checks |

### Tasks

#### 1.1 Create Scratchpad Directory
```
specs/handler-factory-type-safety/scratchpad/
├── handler.factory.ts           # Exact copy
├── errors.ts                    # Dependency
├── common.types.ts              # Dependency
├── schema.helpers.ts            # Dependency
├── handlers/
│   ├── sign-in-email.handler.ts # With-payload
│   ├── sign-in-email.contract.ts
│   ├── sign-out.handler.ts      # No-payload
│   └── sign-out.contract.ts
└── tsconfig.json                # Isolated type checking
```

#### 1.2 Create Scratchpad tsconfig.json
```json
{
  "extends": "../../../tsconfig.base.jsonc",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "noEmit": true
  },
  "include": ["./**/*.ts"]
}
```

#### 1.3 Verify Baseline
```bash
cd specs/handler-factory-type-safety/scratchpad
bun tsc --noEmit
```

### Exit Criteria
- [ ] Scratchpad directory created with all files
- [ ] `bun tsc --noEmit` passes on scratchpad
- [ ] Handlers use factory correctly
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

---

## Phase 2: Design Type-Safe Architecture

### Entry Criteria
- Phase 1 completed
- Scratchpad baseline verified
- Design proposal from Phase 0 available

### Agent Assignment
| Agent | Tasks |
|-------|-------|
| `effect-code-writer` | Refine type definitions |
| `reflector` | Validate approach |

### Tasks

#### 2.1 Define Config Variant Types
Create proper discriminated types for:
- `ConfigWithPayload<PayloadSchema, SuccessSchema>`
- `ConfigNoPayload<SuccessSchema>`
- Union type `HandlerConfig`

#### 2.2 Create Type Guard Predicates
```typescript
const hasPayloadSchema = <P, S>(
  config: HandlerConfig<P | undefined, S>
): config is ConfigWithPayload<P, S> =>
  P.isNotUndefined(config.payloadSchema);
```

#### 2.3 Design Implementation Functions
- `createWithPayloadImpl<P, S>(config: ConfigWithPayload<P, S>)`
- `createNoPayloadImpl<S>(config: ConfigNoPayload<S>)`

### Exit Criteria
- [ ] Type definitions documented in `outputs/type-definitions.ts`
- [ ] Type guard predicates defined
- [ ] Implementation function signatures designed
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

---

## Phase 3: Implement in Scratchpad

### Entry Criteria
- Phase 2 completed
- Type definitions finalized
- Scratchpad baseline still passes

### Agent Assignment
| Agent | Tasks |
|-------|-------|
| `effect-code-writer` | Implement refactored factory |
| `reflector` | Document challenges |

### Tasks

#### 3.1 Implement Type Definitions
Add to scratchpad `handler.factory.ts`:
- Config variant interfaces
- Type guard predicates

#### 3.2 Implement createWithPayloadImpl
Full implementation for with-payload case:
- No `as` assertions
- Proper generic flow
- Session signal notification

#### 3.3 Implement createNoPayloadImpl
Full implementation for no-payload case:
- No `as` assertions
- Proper generic flow
- Session signal notification

#### 3.4 Refactor Main createHandler
Use Match pattern to dispatch:
```typescript
return Match.value(config).pipe(
  Match.when(hasPayloadSchema, createWithPayloadImpl),
  Match.orElse(createNoPayloadImpl)
);
```

### Exit Criteria
- [ ] Zero `as` assertions in scratchpad factory
- [ ] `bun tsc --noEmit` passes
- [ ] Both implementation functions complete
- [ ] Match dispatch working

---

## Phase 4: Validate Scratchpad Handlers

### Entry Criteria
- Phase 3 completed
- Scratchpad factory refactored
- No `as` assertions remain

### Agent Assignment
| Agent | Tasks |
|-------|-------|
| `effect-code-writer` | Validate handlers |
| Manual | Run type checks |

### Tasks

#### 4.1 Validate With-Payload Handler
Verify `sign-in-email.handler.ts`:
- Still type-checks against refactored factory
- Return type inference preserved
- No additional type annotations needed

#### 4.2 Validate No-Payload Handler
Verify `sign-out.handler.ts`:
- Still type-checks against refactored factory
- Return type inference preserved
- No additional type annotations needed

#### 4.3 Create Additional Test Cases
Add edge case handlers:
- Handler with complex payload schema
- Handler with transformed success schema

### Exit Criteria
- [ ] All scratchpad handlers type-check
- [ ] Return type inference matches original
- [ ] Edge cases validated
- [ ] `handoffs/P5_ORCHESTRATOR_PROMPT.md` created

---

## Phase 5: Apply to Real Code

### Entry Criteria
- Phase 4 completed
- Scratchpad validation successful
- All handlers type-check

### Agent Assignment
| Agent | Tasks |
|-------|-------|
| `effect-code-writer` | Apply changes |
| Manual | Run full verification |

### Tasks

#### 5.1 Backup Original
Copy current `handler.factory.ts` to `handler.factory.ts.backup`

#### 5.2 Apply Refactored Implementation
Replace real `handler.factory.ts` with scratchpad version

#### 5.3 Run Full Verification
```bash
bun run check --filter @beep/iam-client
bun run test --filter @beep/iam-client
bun run lint --filter @beep/iam-client
```

#### 5.4 Validate All Handlers
Ensure all real handlers still type-check:
- `sign-in/email/sign-in-email.handler.ts`
- `core/sign-out/sign-out.handler.ts`
- `multi-session/set-active/*.handler.ts`
- `multi-session/revoke/*.handler.ts`
- `multi-session/list-sessions/*.handler.ts`

### Exit Criteria
- [ ] All checks pass
- [ ] All tests pass
- [ ] All handlers type-check
- [ ] No regressions

### Rollback Plan
If verification fails:
```bash
mv packages/iam/client/src/_common/handler.factory.ts.backup \
   packages/iam/client/src/_common/handler.factory.ts
```

---

## Phase 6: Final Validation & Docs

### Entry Criteria
- Phase 5 completed
- All checks passing
- No rollback needed

### Agent Assignment
| Agent | Tasks |
|-------|-------|
| `doc-writer` | Update documentation |
| `reflector` | Final reflection |

### Tasks

#### 6.1 Update Package AGENTS.md
Add section documenting:
- Type-safe factory pattern used
- How to extend with new variants
- Migration notes for other factories

#### 6.2 Clean Up
- Remove scratchpad directory
- Remove backup file
- Archive spec outputs

#### 6.3 Final Reflection
Update `REFLECTION_LOG.md` with:
- Overall learnings
- Pattern discovered
- Recommendations for similar tasks

### Exit Criteria
- [ ] Documentation updated
- [ ] Scratchpad cleaned up
- [ ] `REFLECTION_LOG.md` finalized
- [ ] Spec marked as COMPLETED

---

## Failure Recovery

### Phase 0-2 Failures
- Reconsider approach
- Try alternative patterns
- Consult additional Effect docs

### Phase 3-4 Failures
- Rollback scratchpad changes
- Revisit type definitions
- Consider hybrid approach (some assertions acceptable)

### Phase 5 Failures
- Execute rollback plan immediately
- Document what went wrong
- Return to Phase 3 with new approach

### Emergency Contacts
- Check `REFLECTION_LOG.md` for previous learnings
- Reference `outputs/design-proposal.md` for alternatives
- Review Effect Match documentation for edge cases
