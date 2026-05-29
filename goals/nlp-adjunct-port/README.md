# NLP Adjunct Port

## Status

**ACTIVE — P0 (Reference Capture & Port Audit)**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-29
- **Updated:** 2026-05-29

## Purpose

Refactor `@beep/nlp` (`packages/foundation/capability/nlp`, Effect v4) to model the
architecture, FP elegance, and property-test "proofs" of the
[`adjunct`](https://github.com/mepuka/adjunct) repo (`~/YeeBois/dev/adjunct`, Effect
v3.17.7) — a categorical/algebraic NLP text-graph engine — and define the
**product-neutral handoff contract** it emits to downstream consumers.

This is the **upstream half** of the existing
[`goals/ip-law-knowledge-graph`](../ip-law-knowledge-graph/) initiative. It produces the
NLP capability that turns normalized text into a generic graph IR; that initiative owns
the IP-law knowledge base the IR is mapped into. This goal does **not** build the KG, the
`law-practice` slice, or document ingestion.

## Scope Boundary (read before touching code)

- `@beep/nlp` stays **product-neutral** in `foundation/capability` — no IP-law vocabulary.
- It emits a **generic graph IR**: `TextChunk` → `Mention` / `Entity` / `Relation` →
  `AnnotatedTextGraph`, with character spans, PROV-O provenance, and confidence.
- The generic → IP-law mapping (the KG's 15 node / 11 edge types) is owned **downstream**.
- The MCP server lands in a separate driver, `packages/drivers/nlp-mcp` (not foundation).
- Raw-file decoding (`.doc`/`.docx`/`.pst`) + the corpus dedup pass are **deferred**; this
  goal defines only the normalized-text input contract.

## Read This First

- [SPEC.md](./SPEC.md) — authoritative initiative contract (scope, decisions, exit criteria)
- [PLAN.md](./PLAN.md) — current implementation posture
- [ops/manifest.json](./ops/manifest.json) — machine-readable phase routing
- [history/quick-start.md](./history/quick-start.md) — 5-minute summary
- [research/adjunct-architecture.md](./research/adjunct-architecture.md) — adjunct module map + FP/proofs analysis
- [research/v3-to-v4-port-map.md](./research/v3-to-v4-port-map.md) — adjunct → Effect v4 rename map (P0 output)
- [research/gap-vs-beep-nlp.md](./research/gap-vs-beep-nlp.md) — adjunct vs current `@beep/nlp` gap table (P0 output)

## Phases

| Phase | Focus | Status |
|---|---|---|
| P0 | Reference Capture & Port Audit | IN PROGRESS |
| P1 | Faithful adjunct → v4 staging port (+ proofs) | PENDING |
| P2 | Land & merge into `foundation/capability/nlp` | PENDING |
| P3 | Handoff contract (generic graph IR) | PENDING |
| P4 | MCP driver (`drivers/nlp-mcp`) | PENDING |
| P5 | Verification & docs | PENDING |

## Related

- [`goals/ip-law-knowledge-graph`](../ip-law-knowledge-graph/) — downstream consumer (KG target)
- [`goals/agentic-professional-runtime`](../agentic-professional-runtime/) — names NLP as a shared capability
- Reference repo: `~/YeeBois/dev/adjunct` (Effect v3.17.7); v4 source of truth: `.repos/effect-v4`
