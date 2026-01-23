# Specifications

> Multi-phase specification library for complex features.

---

## Quick Start

| Action | Resource |
|--------|----------|
| **Create new spec** | `/new-spec` skill or `bun run repo-cli bootstrap-spec` |
| **Learn the workflow** | [_guide/README.md](_guide/README.md) |
| **Find patterns** | [_guide/PATTERN_REGISTRY.md](_guide/PATTERN_REGISTRY.md) |

---

## Spec Guide

All spec-creation infrastructure lives in [`_guide/`](_guide/):

| Document | Purpose |
|----------|---------|
| [README.md](_guide/README.md) | Main spec creation workflow |
| [HANDOFF_STANDARDS.md](_guide/HANDOFF_STANDARDS.md) | Multi-session context transfer |
| [PATTERN_REGISTRY.md](_guide/PATTERN_REGISTRY.md) | Reusable patterns library |
| [patterns/](_guide/patterns/) | Detailed pattern documentation |
| [templates/](_guide/templates/) | Spec file templates |

---

## Specifications

| Spec | Description | Status |
|------|-------------|--------|
| [agent-config-optimization](agent-config-optimization/) | Agent configuration tuning | Active |
| [agents-md-audit](agents-md-audit/) | AGENTS.md file standardization | New |
| [agents](agents/) | Specialized agent creation specs | Active |
| [better-auth-client-wrappers](better-auth-client-wrappers/) | Wrap 90+ better-auth client methods for @beep/iam-clients | P1 Ready |
| [canonical-naming-conventions](canonical-naming-conventions/) | AI-native naming standards | P0 Ready |
| [e2e-testkit-migration](e2e-testkit-migration/) | Migrate e2e tests to @beep/testkit/playwright | Planning |
| [knowledge-effect-ai-migration](knowledge-effect-ai-migration/) | Migrate EmbeddingService to @effect/ai | **Complete** |
| [knowledge-graph-integration](knowledge-graph-integration/) | Document knowledge extraction | Active |
| [naming-conventions-refactor](naming-conventions-refactor/) | Naming standards implementation | Active |
| [orgtable-auto-rls](orgtable-auto-rls/) | Automatic RLS for org tables | Active |
| [repo-cli-verify-commands](repo-cli-verify-commands/) | Convert verification shell scripts to Effect-based repo-cli commands | New |
| [rls-implementation](rls-implementation/) | Row-level security | Active |
| [spec-creation-improvements](spec-creation-improvements/) | Spec workflow enhancements | Complete |
| [todox-design](todox-design/) | Todox application design | Active |
| [tsconfig-sync-command](tsconfig-sync-command/) | CLI for tsconfig/package.json sync with transitive hoisting | P0 Complete |
| [vitest-testkit-parity](vitest-testkit-parity/) | Port @effect/vitest exports to @beep/testkit | New |

---

## Spec Structure

Every spec follows this structure:

```
specs/[name]/
├── README.md                    # Entry point (required)
├── REFLECTION_LOG.md            # Learnings (required)
├── QUICK_START.md               # Getting started (optional)
├── MASTER_ORCHESTRATION.md      # Full workflow (complex specs)
├── handoffs/                    # Multi-session context
│   ├── HANDOFF_P[N].md          # Phase context
│   └── P[N]_ORCHESTRATOR_PROMPT.md  # Copy-paste prompt
└── outputs/                     # Generated artifacts
```

---

## Creating a Spec

```bash
# Quick start (medium complexity)
bun run repo-cli bootstrap-spec -n my-feature -d "Description"

# Simple (single session)
bun run repo-cli bootstrap-spec -n quick-fix -d "Bug fix" -c simple

# Complex (multi-session with orchestration)
bun run repo-cli bootstrap-spec -n major-refactor -d "API redesign" -c complex
```

See [_guide/README.md](_guide/README.md) for the full agent-assisted workflow.
