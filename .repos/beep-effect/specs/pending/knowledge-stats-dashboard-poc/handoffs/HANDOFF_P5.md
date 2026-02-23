# Handoff P5: Integration & Polish

## Context For Phase 5

### Working Context (<=2K tokens)

Current task: add a page route in the chosen app and wire RPC -> UI.

Success criteria:
- [ ] Route exists (in  or `apps/todox`) and is navigable.
- [ ] Page renders real data from server endpoint.
- [ ] Dark mode acceptable.
- [ ] Basic responsive behavior (mobile does not hard-break).

Immediate dependencies:
- chosen app route tree (decided in P1)
- knowledge-client RPC call site
- knowledge-ui components

### Episodic Context (<=1K tokens)

- P1 decided route location; P2 defined contract; P3 implemented server; P4 implemented UI components.

### Semantic Context (<=500 tokens)

- POC favors working features over polish.

### Procedural Context (links only)

- Next.js patterns used in  / `apps/todox`

## Verification Checklist

- [ ] Page loads without runtime errors
- [ ] Data is real (not mocked)
- [ ] Dark mode tested
- [ ] P6 handoff/prompt updated
