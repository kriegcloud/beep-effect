# FlexLayout Type Safety Audit

> Systematic audit to improve type safety, exhaustiveness, and error handling across the `flexlayout-react` module using Effect patterns.

---

## Purpose

The `packages/ui/ui/src/flexlayout-react` module was ported from an external library with legacy TypeScript patterns. This spec orchestrates a systematic audit to:

1. **Identify unsafe code patterns** (type casts, `any`, mutations, unchecked access)
2. **Apply Effect-idiomatic fixes** using Schema validation, Option/Either, and predicates
3. **Improve error handling** with explicit failure modes
4. **Ensure exhaustiveness** in pattern matching and conditionals

---

## Scope

**Target directory**: `packages/ui/ui/src/flexlayout-react/`

**File count**: 44 TypeScript/TSX files

**Categories**:
| Category | Files | Description |
|----------|-------|-------------|
| Model | 14 | Core data structures, serialization |
| View | 18 | React components |
| Utilities | 12 | Types, attributes, helpers |

---

## Success Criteria

- [ ] All files audited for unsafe patterns
- [ ] Zero `any` types remaining (explicit `unknown` with validation acceptable)
- [ ] All `toJson()` methods use Schema decode for validation
- [ ] All array/string operations use Effect utilities (`A.*`, `Str.*`)
- [ ] All optional access uses `O.fromNullable` pattern
- [ ] `bun run lint:fix`, `bun run check`, `bun run build` pass

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute getting started |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Full workflow with checkpoints |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | Sub-agent prompts by type |
| [RUBRICS.md](./RUBRICS.md) | Unsafe pattern detection criteria |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Accumulated learnings |

---

## Agent Workflow

This spec follows the [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) agent-assisted workflow.

### Phase Agents (Standard)

| Phase | Agents | Purpose |
|-------|--------|---------|
| Discovery | `codebase-researcher` | Initial file scanning |
| Evaluation | `code-reviewer`, `architecture-pattern-enforcer` | Validate against rubrics |
| Synthesis | `reflector`, `doc-writer` | Improve prompts, generate plans |
| Iteration | `reflector` | Continuous improvement |

### Domain Agents (Specialized)

For the actual code fixes, this spec uses Effect-specialized agents:

| Unsafe Pattern Type | Agent | Rationale |
|---------------------|-------|-----------|
| Schema validation, decode/encode | `effect-schema-expert` | Schema API expertise |
| Type guards, narrowing, predicates | `effect-predicate-master` | Predicate composition |
| API research, Effect idioms | `effect-researcher` | Documentation lookup |

---

## Execution Summary

```
Phase 0: Scaffolding ──────────────── This spec (complete)
Phase 1: Discovery ────────────────── Audit all files, catalog patterns
Phase 2: Evaluation ───────────────── Score severity, prioritize
Phase 3: Synthesis ────────────────── Generate remediation plan
Phase 4+: Iterative Execution ─────── Fix files in priority order
```

---

## Prior Context

The `IJsonModel.ts` file has already been refactored to use Effect Schema classes. `BorderNode.ts` and `TabNode.ts` have initial fixes using `S.decodeUnknownSync`. This audit continues that work systematically across all remaining files.

---

## Getting Started

1. Read [QUICK_START.md](./QUICK_START.md) for immediate execution
2. Or read [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for full context

---

## Related

- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) — Agent-assisted workflow
- [META_SPEC_TEMPLATE](../ai-friendliness-audit/META_SPEC_TEMPLATE.md) — Core pattern reference
- [Specialized Agents](../agents/README.md) — All available agents
