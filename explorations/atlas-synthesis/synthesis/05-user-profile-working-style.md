# 05 — User Profile & Working Style

> Who the builder is, how they think, and what that means for how this baseline is
> presented and how we should collaborate going forward. Sourced from the user's
> 2026-06-17 self-report (see `../CAPTURE.md`); the local-codebase lineage is verified
> separately in [`23-external-codebase-lineage.md`](./23-external-codebase-lineage.md).

## Snapshot

- ~10 years professional software engineering; **TypeScript-first**; **thinks in types
  & schemas**.
- **Decomposes work by capability** (`@beep/nlp`, `@beep/langextract`, …) to
  compartmentalize a large problem; **designs sub-parts & schemas before product work**.
- **Learns by porting external codebases** — Python roots (now rusty) → ports to
  TypeScript and makes them **Effect-native**.
- A **few months into ontology / semantic-web**; self-identified non-expert. Explicitly
  **invites challenge and teaching** — through a lens they understand.
- The **vision is grand & very technical**; the recurring struggle is **assembly /
  coherence**, not the individual parts.

## How the user thinks — and why it matters here

| Trait | Consequence for this repo | Consequence for how we work |
| --- | --- | --- |
| Types & schemas are the modeling language | Schema-first packages land before product wiring | Present everything as **types / schemas / flows / diagrams / visualizations** (cf. `docs/PROSE_TO_PROOF_GRAPH.html`), not prose-only |
| Capability-first decomposition | Many capability packages exist ahead of a unifying product slice — **intentional sequencing, not drift** | The value-add is the **connective tissue**: show how compartments compose |
| "Can't fit it all in my head" | The hard problem is integration | **The centerpiece gap-map (`00`) and the dependency graph are the highest-value artifacts for this user** — they are the assembly aid |
| Self-assessed ontology novice | Ontology/semantic-web guidance may be wrong or misleading | **Challenge explicitly, then teach** in type/schema terms — don't defer, don't merely assert |

## Learning-by-porting — the intellectual lineage

The user's external references are not abstract inspiration; they are **codebases being
ported and Effect-ified**. This explains several repo facts:

- **TrustGraph (Python)** → a TypeScript, Effect-native port. This is *why* BeepGraph is
  framed as a "TrustGraph-style projection shell" and why `goals/trustgraph-port` exists:
  the donor is a **local fork the user is actively porting**, not a SaaS being evaluated.
- **Lexical/chat lineage:** `dev/text_editor_ui/lexical/*.md` design reports →
  `projects/effect-lexical-chat` → the repo's `packages/foundation/modeling/{lexical,md}`
  and `apps/professional-desktop`. The chat/runtime stack has a traceable provenance.

(Full local-source map: [`23-external-codebase-lineage.md`](./23-external-codebase-lineage.md).)

## How to engage (collaboration contract)

1. **Be the integrator.** The user builds excellent compartments; the shared gap is
   wiring them into one coherent system organized around the **product spine** (the
   solo IP-law flywheel). Keep that spine in view; surface where capabilities don't yet
   meet.
2. **Teach through their lens.** Express ontology/semantic-web ideas as Effect Schemas,
   tagged unions, flows, and diagrams. A SHACL constraint is a validation schema; a TBox
   is a type lattice; provenance is a required discriminated field.
3. **Challenge, with a reason and an alternative.** The user wants to be told when an
   ontology/KG choice is wrong — but paired with a model they can hold in types.
4. **Respect schema-before-product.** Don't read "no product slice yet" as failure; read
   it as the user's deliberate method. The next move is naming the slice that *consumes*
   the capabilities.

## Implications for the next instruction

- The user will give a direction after this baseline. The likely shape, given the
  profile: a request to **assemble** — connect existing capabilities into a coherent
  product slice / runtime loop, expressed as schemas and flows.
- Highest-leverage things to have ready: the **capability → product** map, the
  **critical path** to the IP-law MVP, and **type/schema-level** sketches of the missing
  connective tissue (extraction → candidate claim → SHACL gate → accepted claim →
  projection → ask).

## Confidence & Caveats

- This profile is a **self-report** (user message, 2026-06-17) synthesized with
  `CAPTURE.md`; it is not independently verified and is intentionally interpretive.
- The local-codebase lineage claims are verified in `23-external-codebase-lineage.md`
  (added alongside this doc, after the main workflow's centerpiece was generated — so
  `00-baseline-gap-map.md` may not yet reference `05`/`23` unless the centerpiece is
  refreshed).
