# Agent Governance Control Plane Plan

## Current Plan

- Keep [SPEC.md](./SPEC.md) as the authoritative contract for governance
  behavior.
- Treat [design/](./design) as the durable breakdown of the governance model.
- Use [ops/manifest.json](./ops/manifest.json) as the machine-readable routing
  source for agent workflows.
- Preserve [ops/prompts/](./ops/prompts) and [ops/handoffs/](./ops/handoffs)
  as first-class operational assets for future implementation work.

## Follow-Up Work

- Fold any future governance decisions into `SPEC.md` first, then update the
  matching design or ops surface.
- Keep historical outputs in `history/outputs/` instead of letting new
  generated artifacts accumulate at the root.
