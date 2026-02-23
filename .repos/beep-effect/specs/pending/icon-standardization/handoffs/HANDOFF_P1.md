# icon-standardization Handoff: Phase 1 (Inventory)

> Context for the orchestrator session executing the icon standardization spec.

---

## Working Context

### Current Task
Execute all 4 phases of the icon-standardization spec:
1. P1: Produce `outputs/icon-inventory.md` - complete icon-to-Phosphor mapping
2. P2: Swarm replace all Iconify & Lucide usages with Phosphor
3. P3: Remove Iconify infrastructure and dependencies
4. P4: Pass all quality gates

### What's Been Done (Phase 0)
- Full codebase audit complete: all icon imports identified and categorized
- Spec documents written: README, MASTER_ORCHESTRATION, QUICK_START, AGENT_PROMPTS, RUBRICS
- Three icon libraries identified with usage counts:
  - `@iconify/react` via `Iconify` wrapper: ~60+ usages across 3 packages
  - `lucide-react`: ~9 usages across 2 packages
  - MUI component override inline SVGs: ~15 in packages/ui/core

### Blocking Issues
None - execution can proceed immediately.

---

## Episodic Context

### Codebase Audit Findings

**Iconify wrapper usages (~60+ files):**
- `packages/ui/ui/src/` - layouts (~15), routing (~10), inputs (~8), forms (~3), molecules (~3), settings (~5), animate (~1), atoms (~2), components (~2)
- `packages/iam/ui/src/` - social icons (~3), form components (~3)
- `apps/todox/src/` - mail feature (~7), settings (~1)

**Lucide-react usages (~9 files):**
- `apps/todox/src/` - ErrorAlert, DraggableBlockPlugin, FloatingTextFormatToolbarPlugin, mic-selector
- `packages/ui/ui/src/` - banner, mic-selector, table-icons, spinner, toolbar

**MUI override SVGs (~10 files):**
- `packages/ui/core/src/theme/core/components/` - accordion, autocomplete, chip, select, date-picker, alert, mui-x-data-grid

**Icon name prefixes to map:**
solar, eva, mingcute, material-symbols, carbon, custom, socials, ic, flowbite, mage, twemoji

---

## Semantic Context

- Monorepo: Bun + Effect + Next.js 16
- Phosphor import convention: ALL imports must use `Icon` postfix (non-postfix is deprecated)
- `better-icons` skill/MCP tool available for finding Phosphor equivalents
- The `Iconify` wrapper supports MUI `sx` prop - Phosphor icons do NOT
- Several nav components use `styled(Iconify)` pattern
- `iconifyClasses.root` CSS class used for icon targeting in styled-components

---

## Procedural Context

- Spec: `specs/pending/icon-standardization/`
- Process: `MASTER_ORCHESTRATION.md`
- Agent prompts: `AGENT_PROMPTS.md`
- Rubrics: `RUBRICS.md`
- Quality gates: `bun run build && bun run check && bun run test && bun run lint:fix && bun run lint`

---

## Context Budget

- Direct tool calls: aim <= 10 per phase (delegate to sub-agents)
- P1 (inventory): delegate to codebase-researcher + use better-icons MCP
- P2 (replace): use swarm mode with 3-5 parallel general-purpose agents
- P3 (cleanup): single general-purpose agent
- P4 (gates): package-error-fixer agents per failing package
