# AI Documentation Review Spec

**Status**: Active
**Created**: 2026-01-11
**Version**: 1.0

## Purpose

Orchestrate the systematic review of AI-related documentation in the beep-effect monorepo to ensure accuracy, consistency, and cross-reference integrity.

## Scope

### In Scope
- `.claude/` directory (~41 files)
  - Rules (3 files)
  - Agents (18 files)
  - Commands (6 files)
  - Skills (10+ files)
  - Templates and config
- Root `CLAUDE.md` and `AGENTS.md` (2 files)

### Out of Scope
- Package-level `AGENTS.md` files (55 files) - future spec
- Spec documentation files (155+ files) - separate concern
- Automated remediation - evaluation only

## Success Criteria

- [ ] Complete inventory of all AI documentation files
- [ ] Accuracy score >= 4/5 or remediation plan produced
- [ ] Cross-reference integrity score >= 4/5 or remediation plan produced
- [ ] All findings documented with file:line references
- [ ] Prioritized remediation plan (P1-P4) generated

## Quick Start

1. Read this README for context
2. Follow [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for phase execution
3. Use [RUBRICS.md](./RUBRICS.md) for scoring criteria
4. Deploy agents using prompts from [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)

## Phases

| Phase | Agent | Output | Duration |
|-------|-------|--------|----------|
| **0: Scaffolding** | — | Spec files created | Done |
| **1: Discovery** | `codebase-researcher` | `outputs/inventory.md` | ~30 min |
| **2.1: Accuracy** | `code-reviewer` | `outputs/accuracy-report.md` | ~45 min |
| **2.2: Cross-Ref** | `architecture-pattern-enforcer` | `outputs/cross-ref-report.md` | ~45 min |
| **3: Synthesis** | `reflector` | `outputs/remediation-plan.md` | ~30 min |

## Evaluation Criteria

### Accuracy & Consistency
- Code examples use Effect patterns (namespace imports, no async/await)
- No stale package references (@beep/mock, @beep/yjs, etc.)
- No contradictory information across files
- Commands match current `bun run` scripts

### Cross-Reference Integrity
- All markdown links resolve to existing files
- Path references (`packages/*`, `apps/*`) are valid
- No orphaned files (referenced but missing)

## File Structure

```
specs/ai-docs-review/
├── README.md                    # This file
├── REFLECTION_LOG.md            # Cumulative learnings
├── MASTER_ORCHESTRATION.md      # Phase workflow
├── AGENT_PROMPTS.md             # Sub-agent prompts
├── RUBRICS.md                   # Scoring criteria
├── templates/
│   ├── inventory.template.md
│   ├── accuracy-report.template.md
│   ├── cross-ref-report.template.md
│   └── remediation-plan.template.md
├── outputs/                     # Generated artifacts
└── handoffs/
    ├── HANDOFF_P1.md            # Discovery → Evaluation
    └── HANDOFF_P2.md            # Evaluation → Synthesis
```

## Related

- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) - Spec creation patterns
- [META_SPEC_TEMPLATE](../ai-friendliness-audit/META_SPEC_TEMPLATE.md) - Template reference
- [specs/agents/](../agents/README.md) - Agent specs
