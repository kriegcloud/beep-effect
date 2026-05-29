# NLP Adjunct Port — Quick Start

> Port the elegant Effect-v3 `adjunct` NLP text-graph engine to Effect v4, land it in
> `@beep/nlp` as a product-neutral capability, and emit a generic graph IR for the IP-law
> knowledge graph.

## What This Delivers

- A faithful Effect v4 port of adjunct's categorical NLP engine (Algebra, Operations,
  Graph, Ontology, NLPService, Backends) with its property-test proofs intact.
- A merged `@beep/nlp` that preserves its existing `Core`/`Wink`/`Tools` and adds the spine.
- A product-neutral generic graph IR: `TextChunk` → `Mention`/`Entity`/`Relation` →
  `AnnotatedTextGraph`, with spans + PROV-O provenance + confidence.
- A `packages/drivers/nlp-mcp` MCP server (NLP + streaming tools) on `effect/unstable/ai`.

## What This Is NOT

- Not the FalkorDB knowledge graph or the generic→IP-law mapping (→ `ip-law-knowledge-graph`).
- Not the `law-practice` slice; no IP-law vocabulary in `@beep/nlp`.
- Not document ingestion (`.doc`/`.docx`/`.pst` decoders + dedup are deferred downstream).

## Current Status

| Phase | Focus | Status |
|---|---|---|
| P0 | Reference Capture & Port Audit | IN PROGRESS |
| P1 | Staging Port (+ proofs) | PENDING |
| P2 | Land & Merge into `@beep/nlp` | PENDING |
| P3 | Handoff Contract (generic IR) | PENDING |
| P4 | MCP Driver (`drivers/nlp-mcp`) | PENDING |
| P5 | Verification & Docs | PENDING |

## Start Here

1. Read [SPEC.md](../SPEC.md) for scope, locked decisions, and exit criteria.
2. Read [research/adjunct-architecture.md](../research/adjunct-architecture.md) for the module map.
3. Open the handoff for the current phase (start with P0).

## Phase Entry Files

| Phase | Handoff | Output |
|---|---|---|
| P0 | [HANDOFF_P0.md](../ops/handoffs/HANDOFF_P0.md) | [p0-port-audit.md](./outputs/p0-port-audit.md) |
| P1 | [HANDOFF_P1.md](../ops/handoffs/HANDOFF_P1.md) | [p1-staging-port.md](./outputs/p1-staging-port.md) |
| P2 | [HANDOFF_P2.md](../ops/handoffs/HANDOFF_P2.md) | [p2-land-merge.md](./outputs/p2-land-merge.md) |
| P3 | [HANDOFF_P3.md](../ops/handoffs/HANDOFF_P3.md) | [p3-contract.md](./outputs/p3-contract.md) |
| P4 | [HANDOFF_P4.md](../ops/handoffs/HANDOFF_P4.md) | [p4-mcp-driver.md](./outputs/p4-mcp-driver.md) |
| P5 | [HANDOFF_P5.md](../ops/handoffs/HANDOFF_P5.md) | [p5-verification.md](./outputs/p5-verification.md) |

## Verification Commands

```bash
# from packages/foundation/capability/nlp
pnpm check && pnpm test && pnpm build && bun run docgen:local
# repo-level
bun run repo-exports:catalog:check
```
