# Quick Start: Canonical Naming Conventions

> 5-minute orientation for new sessions working on this spec.

---

## What is this spec?

This spec guides establishing **AI-native file/folder naming standards** for the `beep-effect` monorepo. It focuses on **research and discovery** - the implementation/refactoring phase will be a separate spec.

## Current State

- Mixed casing conventions (PascalCase folders like `ApiKey/`, lowercase files like `atoms.ts`)
- Inconsistent use of semantic postfixes (`.model.ts` vs plain `.ts`)
- Varied barrel export patterns (`mod.ts` + `index.ts` namespace vs direct exports)
- No formal category taxonomy for file types
- AI agents must read file contents to understand purpose, consuming context unnecessarily

## Target State

- Exhaustive `.category.ts` postfix taxonomy
- Canonical casing rules for files, folders, and exports
- Documented `mod.ts`/`index.ts` barrel export patterns
- Decision framework for future file categorization
- Draft `.claude/rules/naming-conventions.md`

---

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| P0 | Codebase Inventory | Pending |
| P1 | External Research | Pending |
| P2 | Synthesis & Standards | Pending |

---

## Key Research Questions

1. What file categories exist in this codebase?
2. What naming conventions do leading Effect/FP repos use?
3. What academic/industry standards exist for AI-friendly codebases?
4. How do llms.txt and CLAUDE.md patterns inform file naming?
5. What naming conventions maximize grep/glob efficiency?
6. How should category postfixes map to architectural layers?

---

## Preliminary Category Taxonomy

| Category | Postfix | Layer |
|----------|---------|-------|
| Domain Model | `.model.ts` | domain |
| Type Definitions | `.types.ts` | any |
| Service Interface | `.service.ts` | server |
| Database Table | `.table.ts` | tables |
| Contract Schema | `.contract.ts` | client |
| Handler | `.handler.ts` | client/server |
| React Hook | `.hook.ts` | ui |
| Test Suite | `.test.ts` | test |
| Barrel Export | `mod.ts` | any |
| Module Index | `index.ts` | any |

---

## Quick Commands

```bash
# Find all unique postfix patterns
find packages -name "*.ts" | sed 's/.*\///' | grep -oE '\.[a-z-]+\.tsx?$' | sort | uniq -c | sort -rn

# Find all mod.ts files
find packages -name "mod.ts"

# Find folder casing patterns
find packages -type d -name "[A-Z]*"

# Run checks after changes
bun run check
```

---

## Output Files

| File | Purpose |
|------|---------|
| `outputs/existing-patterns-audit.md` | Current naming conventions |
| `outputs/file-category-inventory.md` | All file types found |
| `outputs/inconsistency-report.md` | Pattern violations |
| `outputs/industry-best-practices.md` | External research |
| `outputs/category-taxonomy.md` | Final taxonomy |
| `outputs/naming-rules-draft.md` | Draft rules file |

---

## Next Steps

Start with: `handoffs/P0_ORCHESTRATOR_PROMPT.md`

---

## Need Help?

- Full spec: [README.md](./README.md)
- Phase details: [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- Agent prompts: [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
- Session learnings: [REFLECTION_LOG.md](./REFLECTION_LOG.md)
