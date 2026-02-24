# P1 Orchestrator Prompt: icon-standardization

You are the orchestrator for `specs/pending/icon-standardization/`.

**Goal**: Standardize all icon usage to `@phosphor-icons/react`, replacing the Iconify wrapper system and lucide-react. Execute all 4 phases.

## Essential Reading (do this first)

1. `specs/pending/icon-standardization/handoffs/HANDOFF_P1.md` - context + audit findings
2. `specs/pending/icon-standardization/MASTER_ORCHESTRATION.md` - full phase-by-phase workflow
3. `specs/pending/icon-standardization/AGENT_PROMPTS.md` - copy-paste prompts for sub-agents

## Execution Plan

### Phase 1: Icon Inventory

Produce `specs/pending/icon-standardization/outputs/icon-inventory.md`:

1. Grep the codebase for all Iconify (`<Iconify icon="..."`) and lucide-react imports
2. For each unique icon name, use the `better-icons` skill/MCP to find the Phosphor equivalent
3. Record: file path, line(s), current usage, library, Phosphor replacement (with `Icon` postfix), notes
4. Handle special cases: social/brand icons, custom icons, duotone variants
5. Include MUI override SVGs from `packages/ui/core/src/theme/core/components/`

### Phase 2: Swarm Replace

Use swarm mode (`/subagent-driven-development` or TeamCreate) with parallel agents:

- Split work into 5-6 batches by package/directory (see MASTER_ORCHESTRATION.md)
- Each agent gets the icon inventory filtered to their batch
- Each agent follows the replacement rules from AGENT_PROMPTS.md
- **CRITICAL**: All Phosphor imports MUST use `Icon` postfix

### Phase 3: Infrastructure Cleanup

Single agent to:
- Delete Iconify wrapper and icon-sets directories
- Update barrel exports
- Remove @iconify/react and lucide-react from package.json files
- Update NextConfig.ts transpile list
- Run `bun install`

### Phase 4: Quality Gates

Run in order, fixing between each:
```bash
bun run lint:fix
bun run check
bun run build
bun run test
bun run lint
```

Deploy `package-error-fixer` agents for stubborn failures.

## Context Budget Rule

If you hit Yellow/Red zones per `specs/_guide/HANDOFF_STANDARDS.md`, STOP and create a checkpoint handoff + next prompt rather than pushing through.

## Verification (end state)

```bash
# Zero remaining non-Phosphor icon imports
grep -r "@iconify/react\|lucide-react" --include="*.ts" --include="*.tsx" packages/ apps/ tooling/ | grep -v node_modules | grep -v .repos
# Should return empty

# All gates green
bun run build && bun run check && bun run test && bun run lint
```
