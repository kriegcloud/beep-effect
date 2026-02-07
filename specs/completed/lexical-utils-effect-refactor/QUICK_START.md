# Quick Start

> 5-minute guide to executing the Lexical Utils Effect Refactor spec.

---

## TL;DR

1. Copy prompt from `handoffs/P1_ORCHESTRATOR_PROMPT.md` into a new chat
2. Orchestrator delegates to sub-agents
3. When phase completes, copy next phase's orchestrator prompt
4. Repeat until all 6 phases complete

---

## Phase Quick Reference

| Phase | Focus | Sub-Agents | Duration |
|-------|-------|------------|----------|
| P1 | Discovery | codebase-researcher, mcp-researcher | ~15 min |
| P2 | Evaluation | architecture-pattern-enforcer, code-reviewer | ~10 min |
| P3 | Schema Creation | effect-code-writer | ~20 min |
| P4 | Priority 1 Refactor | effect-code-writer | ~45 min |
| P5 | Priority 2-3 Refactor | effect-code-writer | ~30 min |
| P6 | Verification | test-writer, package-error-fixer | ~20 min |

---

## Starting Phase 1

```bash
# Open the orchestrator prompt
cat specs/lexical-utils-effect-refactor/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

Copy the "## Prompt" section into a new Claude chat session.

---

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Overview and requirements |
| `MASTER_ORCHESTRATION.md` | Full workflow details |
| `AGENT_PROMPTS.md` | Sub-agent prompts |
| `REFLECTION_LOG.md` | Learning capture |
| `handoffs/HANDOFF_P*.md` | Phase context documents |
| `handoffs/P*_ORCHESTRATOR_PROMPT.md` | Copy-paste prompts |
| `outputs/*.md` | Phase artifacts |

---

## Verification Commands

```bash
# Type check after refactoring
bun run check --filter todox

# Lint fix
bun run lint:fix --filter todox

# Run tests
bun run test --filter todox
```

---

## Troubleshooting

### Sub-agent not producing output?

Check the prompt in `AGENT_PROMPTS.md` matches the requested task.

### Type errors after refactoring?

Use `package-error-fixer` agent to diagnose and fix.

### Effect API question?

Delegate to `mcp-researcher` to look up official documentation.
