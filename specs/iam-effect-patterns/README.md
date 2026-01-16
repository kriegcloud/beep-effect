# IAM Effect Patterns Specification

**Status**: COMPLETE

## Purpose

Establish consistent, idiomatic patterns for wrapping Better Auth's promise-based client methods with Effect, creating `@effect-atom/atom-react` atoms, and managing state across IAM packages. This spec serves as the foundation for all future Better Auth method integrations.

## Spec Outcomes

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Handlers with `$sessionSignal` | 1/3 | 3/3 | 100% coverage |
| Handlers checking `response.error` | 1/4 | 4/4 | 100% coverage |
| Handler boilerplate (avg) | 25 lines | 10 lines | 60% reduction |
| Type assertions (unsafe) | 2 | 0 | Eliminated |

## Next Steps: `full-iam-client` Spec

This spec established foundational patterns. The next spec (`full-iam-client`) will apply these patterns to wrap ALL remaining Better Auth client methods:

- Multi-session management
- Password recovery
- Email verification
- Two-factor authentication
- Organization management
- Team management

**See**: [HANDOFF_P11.md](./handoffs/HANDOFF_P11.md) for complete handoff to new spec.

## Problem Statement (Resolved)

| Issue | Description | Resolution |
|-------|-------------|------------|
| **Inconsistent Handler Signatures** | Handlers varied between optional/required params | Handler factory standardizes |
| **Boilerplate Repetition** | Every handler ~10 lines of boilerplate | 60% reduction with factory |
| **Session Signal Inconsistency** | Only some handlers notified session | All session-mutating handlers now notify |
| **Error Handling Gaps** | `{ data, error }` not checked | All handlers check before decode |
| **Schema Annotation Variance** | Mix of helpers and direct annotation | `withFormAnnotations` canonical |
| **No State Machine Pattern** | Multi-step flows uncoordinated | `Data.TaggedEnum` pattern documented |

## Success Criteria

- [x] Define canonical handler factory reducing boilerplate by 50%+
- [x] Establish consistent handler signature pattern
- [x] Create schema annotation helpers for form defaults
- [x] Define session-mutating vs read-only handler classification
- [x] Document state machine pattern for multi-step flows (use Data.TaggedEnum per upload.atom.ts)
- [ ] ~~Create atom factory with built-in toast integration~~ (Deleted - manual pattern is canonical)
- [x] Validate patterns pass all repo rules
- [x] Create reference implementation demonstrating all patterns
- [x] E2E validation of auth flows

## Phase Overview

| Phase | Description | Status | Output |
|-------|-------------|--------|--------|
| 0 | Scaffold spec structure | Complete | `README.md`, directories |
| 1 | Deep analysis of current patterns | Complete | `outputs/current-patterns.md` |
| 2 | Research Effect best practices | Complete | `outputs/effect-research.md` |
| 3 | Design pattern proposals | Complete | `outputs/pattern-proposals.md` |
| 4 | Validation & review | Complete | `outputs/pattern-review.md` |
| 5 | Implementation plan | Complete | `PLAN.md` |
| 6 | Reference implementation | Complete | `errors.ts`, `schema.helpers.ts`, `handler.factory.ts`, sign-out/sign-in migrations |
| 7 | Documentation & remaining migrations | Complete | AGENTS.md updates, get-session/sign-up handlers |
| 9 | Type safety audit & remediation | Complete | `outputs/type-safety-audit.md`, deleted atom.factory.ts, fixed user.schemas.ts |
| 10 | E2E testing & handoff | **Complete** | Manual validation + `HANDOFF_P11.md` |

## Directory Structure

```
specs/iam-effect-patterns/
├── README.md                      # This overview
├── MASTER_ORCHESTRATION.md        # Phase workflows & checkpoints
├── AGENT_PROMPTS.md               # Ready-to-use agent prompts
├── REFLECTION_LOG.md              # Session learnings (all 10 phases)
├── PLAN.md                        # Implementation plan (Phase 5)
├── outputs/
│   ├── current-patterns.md        # Phase 1 output
│   ├── effect-research.md         # Phase 2 output
│   ├── pattern-proposals.md       # Phase 3 output
│   ├── pattern-review.md          # Phase 4 output
│   └── type-safety-audit.md       # Phase 9 output
├── handoffs/
│   ├── HANDOFF_P1.md              # Phase 1 handoff
│   ├── P1_ORCHESTRATOR_PROMPT.md  # Phase 1 prompt
│   ├── HANDOFF_P3.md              # Phase 3 handoff
│   ├── P3_ORCHESTRATOR_PROMPT.md  # Phase 3 prompt
│   ├── HANDOFF_P10.md             # Phase 10 handoff
│   └── HANDOFF_P11.md             # Handoff to full-iam-client spec
└── templates/
    ├── TEMPLATES.md               # Template variable guide
    ├── handler.template.ts        # Handler template
    ├── contract.template.ts       # Contract template
    └── atom.template.ts           # Atom template
```

## Quick Start

### For Orchestrators

1. Read this README
2. Read `MASTER_ORCHESTRATION.md` for phase details
3. Read `REFLECTION_LOG.md` for prior learnings
4. Start with Phase 1 using prompts from `AGENT_PROMPTS.md`

### For Implementers

1. Read `PLAN.md` (after Phase 5)
2. Reference `templates/*.template.ts`
3. Follow `outputs/pattern-proposals.md` designs

## Agents Used

| Agent | Phase | Purpose |
|-------|-------|---------|
| `codebase-researcher` | 1 | Deep analysis of current patterns |
| `mcp-researcher` | 2 | Effect documentation research |
| `effect-code-writer` | 3, 6 | Pattern design and implementation |
| `code-reviewer` | 4 | Validate against rules |
| `architecture-pattern-enforcer` | 4 | Validate architecture |
| `package-error-fixer` | 6 | Fix type/lint errors |
| `doc-writer` | 7 | Update documentation |

## Implementation Scope

### In Scope

| Component | Location | Status |
|-----------|----------|--------|
| Handler Factory | `packages/iam/client/src/_common/handler.factory.ts` | Complete |
| Schema Helpers | `packages/iam/client/src/_common/schema.helpers.ts` | Complete |
| ~~Atom Factory~~ | ~~`packages/iam/client/src/_common/atom.factory.ts`~~ | Deleted (manual pattern is canonical) |
| State Machine Utilities | Use `Data.TaggedEnum` per `upload.atom.ts` pattern | Pattern documented |
| Reference: sign-in/email | Refactor using new patterns | Complete |
| Reference: sign-out | Refactor using new patterns | Complete |
| Documentation | `packages/iam/*/AGENTS.md` | Complete |

### Out of Scope

- Adding new Better Auth methods
- Server-side IAM patterns
- Database/table layer changes
- UI component styling

## Key Gotchas

| Issue | Solution |
|-------|----------|
| Better Auth returns `{ data, error }` | Always check `response.error` before decode |
| Session signal timing | Notify AFTER successful mutation, not before |
| Form defaults must match Encoded type | `Redacted<string>` default is `string`, not `Redacted` |
| Effect.fn name strings | Use `"domain/method/handler"` convention |

## Related Documentation

- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Detailed phase workflows
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - Ready-to-use agent prompts
- [templates/TEMPLATES.md](./templates/TEMPLATES.md) - Template variable guide
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Session learnings
- [IAM Client AGENTS.md](../../packages/iam/client/AGENTS.md)
- [Effect Patterns](./.claude/rules/effect-patterns.md)

## Contributor Notes

This spec established foundational patterns that are now canonical for all Better Auth integrations.

**Patterns Established:**
- Handler factory (`createHandler`) for standard request/response handlers
- Manual handler pattern for edge cases (computed fields, different response shapes)
- Error hierarchy with `Data.TaggedError` for yieldable errors
- Session signal notification for all session-mutating operations
- Schema helpers for error message extraction

**Next Implementation:** See `full-iam-client` spec for systematic application to:
- Passkey authentication
- Social sign-in providers
- Two-factor authentication
- Password recovery
- Email verification
- Organization/team management

**Handoff:** [HANDOFF_P11.md](./handoffs/HANDOFF_P11.md) contains complete context for creating the new spec.
