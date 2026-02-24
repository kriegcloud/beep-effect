# Handoff P4: UI Components

## Context For Phase 4

### Working Context (<=2K tokens)

Current task: implement dashboard UI components in `@beep/knowledge-ui`.

Success criteria:
- [ ] Components exist and are exported from `packages/knowledge/ui/src/index.ts`.
- [ ] Dashboard includes:
  - 3-region layout (header/sidebar/main) as appropriate for the host app shell
  - stats summary row (5 metric cards)
  - schema inventory accordion panel
  - React Flow graph canvas + toolbar toggles (layout/direction/edge style/spacing)

Immediate dependencies:
- `packages/knowledge/ui/src/`
- `@beep/ui` components and tokens (discover in P1)

### Episodic Context (<=1K tokens)

- Phase 3 provides the server endpoint; Phase 4 consumes it.

### Semantic Context (<=500 tokens)

- Prefer schema graph (classes/properties) rather than instance entity graph.

### Procedural Context (links only)

- UI patterns:  / `apps/todox` existing layout components

## Verification Checklist

- [ ] React Flow renders nodes/edges
- [ ] Toolbar toggles work
- [ ] No `any` in UI code
- [ ] P5 handoff/prompt updated
