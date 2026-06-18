# Atlas

Living map of the product vision: the outcomes we are steering toward, the
capability bricks already built, and every exploration's place in the tree.
This is the first file a cold session should read.

Navigation only — no doctrine. Load-bearing prose belongs in `docs/product/`,
`goals/<slug>/SPEC.md`, or `standards/`; this file links to it. Updated at
every exploration stage transition.

## Outcomes

The durable "why" behind explorations. Seeded from
[`goals/agentic-professional-runtime`](../goals/agentic-professional-runtime/README.md)
(the active product-definition authority).

- **Local-first agentic professional runtime** — a governed workspace where a
  professional brings their own agent clients, tools, data sources, and model
  credentials; every durable assertion carries evidence, provenance,
  lifecycle, and cost. Vision prose:
  [`product-vision-law-practice.md`](../goals/agentic-professional-runtime/docs/product-vision-law-practice.md).
- **Agentic solo IP law practice** (sole active vertical) — capture context,
  propose work, maintain evidence-backed practice memory, automate safe office
  loops, keep legal judgment under attorney approval.
- **Agent control plane** — `apps/professional-desktop` as the workbench where
  the professional directs, reviews, and approves agent work.

## Capability Bricks

The lego pieces already built. Authoritative inventories (link, never copy):

- Existing exports: search with ripgrep over `packages/*/*/*/src/**` and the
  package barrels (`packages/*/*/*/src/index.ts`), or use the
  `repo-symbol-discovery` skill.
- Package families: `packages/{foundation,shared,drivers,tooling}` (substrate),
  `packages/{workspace,agent-capability,epistemic,law-practice,architecture-lab}`
  (slices), `apps/*` (runtimes).

## Explorations

### Active

- [`atlas-synthesis`](./atlas-synthesis/README.md) — grounding/context packet
  (stage `research`): a maximal-fan-out synthesis of current repo state vs.
  goals/vision, centered on a gap map
  ([`synthesis/00-baseline-gap-map.md`](./atlas-synthesis/synthesis/00-baseline-gap-map.md)).
  The **capability-inventory half of the grand-vision exercise** (renamed from
  `baseline-synthesis`, 2026-06-17). First decomposition done (2026-06-17): graduated the
  office-action wedge into two goal packets —
  [`epistemic-claim-lifecycle-gate`](../goals/epistemic-claim-lifecycle-gate/README.md) (build
  first) and [`law-practice-office-action-spike`](../goals/law-practice-office-action-spike/README.md).
  More verticals (intake/drafting/contract review) follow once the loop turns once.

### Proposed

- (none — `atlas-synthesis` is now an Active packet above; its capability-inventory
  half is done and the outcome-decomposition half is its next stage.)

### Parked

- [`effect-capability-kg`](./effect-capability-kg/README.md) (parked 2026-06-17) —
  tooling-first deterministic Effect v4 capability graph (JSDoc-derived ontology,
  specialist profiles, judge routing, advisory hook backpressure). Seed goal
  [`effect-capability-kg-seed`](../goals/effect-capability-kg-seed/README.md) shipped
  (`completed-retained`); later router/CLI/hook/ratchet candidates deferred. Parked as a
  dev-tooling track that is not the current product focus — see its `DECISIONS.md` and
  `standards/memory-architecture/04-decision-log.md` (2026-06-17). Resume on an explicit
  decision to invest in agent capability guidance.

### Graduated

- [`docx-roundtrip-interop`](./docx-roundtrip-interop/README.md) — graduated
  2026-06-15 into
  [`pandoc-ast-foundation`](../goals/pandoc-ast-foundation/README.md), the pure
  schema-first Pandoc JSON AST mirror and `@beep/md` compatibility proof.
  Follow-ons named in its MAP: pandoc-driver-sidecar, docx-fixture-pipeline,
  document-ast-decision.
- [`agent-chat-interface`](./agent-chat-interface/README.md) — graduated
  2026-06-12 into three goal packets:
  [`rich-text-foundation`](../goals/rich-text-foundation/README.md),
  [`workspace-thread-domain`](../goals/workspace-thread-domain/README.md),
  [`desktop-chat-surface`](../goals/desktop-chat-surface/README.md)
  (depends on the first two). Follow-ons named in its MAP:
  acp-chat-binding, proposal-blocks, attachment/table blocks,
  thread-pdf-export.

### Killed

(none yet — epitaphs go here, one line each)
