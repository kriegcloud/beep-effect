# Agentic Professional Runtime Plan

## Current Plan

- Keep [SPEC.md](./SPEC.md) as the authoritative product/runtime contract.
- Treat [docs/](./docs) as the durable product, data model, and architecture
  breakdown.
- Use [ops/manifest.json](./ops/manifest.json) as the machine-readable routing
  and status source.
- Treat [history/sources.md](./history/sources.md) as the source inventory, not
  as a replacement for the spec.

## Phase Order

| Phase | Status | Purpose | Exit Criteria |
|---|---|---|---|
| P0 | Complete | Bootstrap this initiative packet. | Root docs, product docs, data docs, architecture map, source inventory, and manifest exist. |
| P1 | Pending | Tighten product interviews. | Law and Todox product docs contain concrete workflows, target users, non-goals, and open questions with owner labels. |
| P2 | Pending | Specify the runtime data-loop proof. | One synthetic Law fixture and one synthetic Wealth fixture can be traced through ingest -> claim/evidence -> task/approval -> SDK context. |
| P3 | Pending | Convert the runtime proof into slice implementation plan. | Slice package names, role packages, public/server exports, and test surfaces are decision-complete. |
| P4 | Pending | Native first-run onboarding design. | First-run app flow covers dependency checks, local runtime bootstrap, user credentials, client connection, and workspace seed. |

## Follow-Up Work

- Review this packet against `standards/ARCHITECTURE.md` before implementation.
- Expand synthetic fixtures before real data is touched.
- Keep Notion source pages as evidence until their relevant content is
  synthesized into repo docs.
- Update package topology only after the runtime data-loop proof is specified.
- Promote shared-kernel concepts only with promotion records and at least two
  product consumers.
