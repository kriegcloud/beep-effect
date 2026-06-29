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
- [`solo-firm-docketing`](./solo-firm-docketing/README.md) — how Tom's solo IP
  practice deals with docketing (office actions, maintenance fees, court orders,
  deadlines years out) without missing one. At `align`, held at a review gate:
  three deep-research tracks done (IP-prosecution vendors; court/litigation
  engines; official-data/handroll), doctrine locked as **vigilance overlay, not
  system of record**. Verified reruns sharpened the recommendation: narrow
  US-deterministic handroll first (ODP/`ptmnfee2` checked, approval-gated), CPI /
  LawToolBox / Alt Legal as additive redundancy (CPI is headless-ready via
  documented OAuth2 password grant), ODP polling is sequential per key, litigation
  L1 uses CourtListener webhooks + hosted MCP, and Outlook push depends on
  [`m365-driver`](../goals/m365-driver/README.md) (the concrete driver for its
  future `Calendars.ReadWrite` scope).
- [`ip-attorney-time-tracking`](./ip-attorney-time-tracking/README.md) - active
  align-stage exploration for a local-first IP attorney time-capture/prebill
  assistant: agents may observe activity and propose candidate billable or
  nonbillable entries, while the attorney approval gate controls what becomes
  billable or exportable.
- [`local-first-voice`](./local-first-voice/README.md) — privilege-safe voice &
  microphone capability (TTS, STT, voice-to-voice) for `apps/professional-desktop`
  (already Tauri v2). At `shape`, awaiting BRIEF sign-off. Research done via two
  adversarial sweeps; 9 forks resolved (hybrid local-default · dictation-first slice
  · desktop-first shared pkg · webview AudioWorklet capture · English-first
  Moonshine+Kokoro · per-capability provider ports · STT→LLM→TTS pipeline ·
  `effect/unstable/rpc` worker). Hand-rolls the missing `@effect/platform-browser`
  audio glue; composes existing `live-waveform`/`use-scribe`/`xai`/`venice-ai`
  bricks. First slice: local desktop dictation. MAP names 7 candidate goals
  (`voice-capture-foundation`, `voice-inference-worker`, `voice-provider-ports`,
  `voice-dictation-slice`, `voice-tts-playback`, `voice-cloud-transport`,
  `voice-to-voice-session`).
- [`domain-layer-hardening`](./domain-layer-hardening/README.md) — systematic
  hardening of every product slice's domain/schema layer (entities, aggregates,
  value objects, typed errors) against a regret-minimization rubric + external
  best practice. At `graduate`: Phases 0–2 done (five-slice audit
  [`10`–`14`](./domain-layer-hardening/synthesis/) + rollup
  [`19`](./domain-layer-hardening/synthesis/19-phase1-crosscutting.md) + external
  grounding [`20`](./domain-layer-hardening/synthesis/20-external-law-and-ontology.md)/[`21`](./domain-layer-hardening/synthesis/21-external-signature-dms-notes-corpus.md));
  Phase 3 ([`BRIEF`](./domain-layer-hardening/BRIEF.md)+[`MAP`](./domain-layer-hardening/MAP.md))
  decomposed into **7 goal packets**, first graduated:
  [`domain-kernel-hardening`](../goals/domain-kernel-hardening/README.md) (soft-delete
  on `BaseEntity` + retire `DomainModel`). Status stays `active` — packets 2–7
  (typed-references, epistemic-claim-body, workspace-candidate-approval,
  law-practice-real-domain, provenance-attestation, agents-and-narrowing) graduate as
  predecessors land. Frontier was: 0 typed
  errors in 3 slices, two competing audit bases (`BaseEntity` vs unused
  `@beep/schema/DomainModel`), no soft-delete / temporal-validity / domain-event
  substrate, near-empty aggregates, law-practice rich-in-nouns-thin-in-lifecycle.
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

- [`microsoft-365-integration`](./microsoft-365-integration/README.md) —
  graduated 2026-06-18 into two goal packets:
  [`m365-driver`](../goals/m365-driver/README.md) (the `@beep/m365` native
  Microsoft Graph driver — delegated auth-code+PKCE, read verbs for
  OneDrive/SharePoint + Outlook mail/calendar, write-ready shape) and
  [`m365-mcp`](../goals/m365-mcp/README.md) (exposes the driver's read verbs as
  the repo's own MCP server, the `@beep/nlp-mcp` pattern). Follow-on named in its
  MAP: `m365-document-ingest` (gated on the document-portal MVP).
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
