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

- [`standards/repo-exports.catalog.md`](../standards/repo-exports.catalog.md) —
  canonical export lookup (refresh: `bun run repo-exports:catalog`).
- Package families: `packages/{foundation,shared,drivers,tooling}` (substrate),
  `packages/{workspace,agent-capability,epistemic,law-practice,architecture-lab}`
  (slices), `apps/*` (runtimes).

## Explorations

### Active

- [`effect-capability-kg`](./effect-capability-kg/README.md) — tooling-first
  decomposed exploration for a deterministic Effect v4 capability graph,
  JSDoc-derived capability ontology, specialist agent profiles, judge routing,
  and advisory hook backpressure over underused Effect modules; first proposed
  goal is `effect-capability-kg-seed`, paused before `./goals` scaffolding.
- [`docx-roundtrip-interop`](./docx-roundtrip-interop/README.md) — pure
  AST-level DOCX interchange exploration: schema-first Pandoc JSON mirror,
  `PandocAst <-> @beep/md` compatibility proof, and explicit lossiness matrix
  before UI, Tauri sidecars, or patent semantics.

### Proposed

- `atlas-synthesis` — the grand-vision exercise: full capability inventory +
  outcome decomposition to give this Atlas real substance and break the
  vision into sequenced explorations/goals. `agent-chat-interface` has now
  proven the pipeline end-to-end — this is unblocked.

### Parked

(none)

### Graduated

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
