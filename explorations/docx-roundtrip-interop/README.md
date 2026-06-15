# DOCX Round-Trip Interop

## Status

Stage: `decompose`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

The original document-editor conversation started from a patent-compliant
DOCX editor, but the immediate useful problem is narrower: prove the AST-level
DOCX round-trip path before building UI, Tauri sidecars, product semantics, or
patent-specific nodes.

## Next Open Question

None - ready for graduation review into a first goal packet, likely
`pandoc-ast-foundation`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4).

## Trail

- 2026-06-15: review follow-up recorded generated-once fixture provenance,
  tables/custom styles as v1 gap-only evidence, graphify as low-signal, and
  official Pandoc release verification wording.
- 2026-06-15: packet opened from the DOCX/Lexical/Pandoc planning session;
  pre-seeded through decompose because the main branch decisions were already
  resolved in conversation.
