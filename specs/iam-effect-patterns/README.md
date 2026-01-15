# IAM Effect Patterns Specification

## Purpose

Establish consistent, idiomatic patterns for wrapping Better Auth's promise-based client methods with Effect, creating `@effect-atom/atom-react` atoms, and managing state across IAM packages. This spec serves as the foundation for all future Better Auth method integrations.

## Problem Statement

| Issue | Description |
|-------|-------------|
| **Inconsistent Handler Signatures** | Handlers vary between optional params, required `{ payload, fetchOptions }`, and no params |
| **Boilerplate Repetition** | Every handler follows: `Effect.fn -> tryPromise -> decode` (~10 lines each) |
| **Session Signal Inconsistency** | Only some handlers call `client.$store.notify("$sessionSignal")` |
| **Schema Annotation Variance** | Mix of `withFormAnnotations` helper and direct annotation |
| **No State Machine Pattern** | Multi-step flows lack coordinated state management |
| **Error Handling Gaps** | Better Auth `{ data, error }` responses not consistently checked |

## Success Criteria

- [ ] Define canonical handler factory reducing boilerplate by 50%+
- [ ] Establish consistent handler signature pattern
- [ ] Create schema annotation helpers for form defaults
- [ ] Define session-mutating vs read-only handler classification
- [ ] Document state machine pattern for multi-step flows
- [ ] Create atom factory with built-in toast integration
- [ ] Validate patterns pass all repo rules
- [ ] Create reference implementation demonstrating all patterns

## Phase Overview

| Phase | Description | Status | Output |
|-------|-------------|--------|--------|
| 0 | Scaffold spec structure | Complete | `README.md`, directories |
| 1 | Deep analysis of current patterns | Pending | `outputs/current-patterns.md` |
| 2 | Research Effect best practices | Pending | `outputs/effect-research.md` |
| 3 | Design pattern proposals | Pending | `outputs/pattern-proposals.md` |
| 4 | Validation & review | Pending | `outputs/pattern-review.md` |
| 5 | Implementation plan | Pending | `PLAN.md` |
| 6 | Reference implementation | Pending | Code changes |
| 7 | Documentation updates | Pending | AGENTS.md updates |

## Directory Structure

```
specs/iam-effect-patterns/
├── README.md                      # This overview
├── MASTER_ORCHESTRATION.md        # Phase workflows & checkpoints
├── AGENT_PROMPTS.md               # Ready-to-use agent prompts
├── REFLECTION_LOG.md              # Session learnings
├── PLAN.md                        # Implementation plan (Phase 5)
├── outputs/
│   ├── current-patterns.md        # Phase 1 output
│   ├── effect-research.md         # Phase 2 output
│   ├── pattern-proposals.md       # Phase 3 output
│   └── pattern-review.md          # Phase 4 output
├── handoffs/
│   ├── HANDOFF_P1.md              # Phase 1 handoff
│   └── P1_ORCHESTRATOR_PROMPT.md  # Phase 1 prompt
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

| Component | Location |
|-----------|----------|
| Handler Factory | `packages/iam/client/src/_common/handler.factory.ts` |
| Schema Helpers | `packages/iam/client/src/_common/schema.helpers.ts` |
| Atom Factory | `packages/iam/client/src/_common/atom.factory.ts` |
| State Machine Utilities | `packages/iam/client/src/_common/state-machine.ts` |
| Reference: sign-in/email | Refactor using new patterns |
| Reference: sign-out | Refactor using new patterns |
| Documentation | `packages/iam/*/AGENTS.md` |

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

This spec establishes patterns for ALL future Better Auth integrations:

- Passkey authentication
- Social sign-in providers
- Two-factor authentication
- Password recovery
- Email verification
- Organization management

Getting these foundational patterns right is critical for long-term maintainability.
