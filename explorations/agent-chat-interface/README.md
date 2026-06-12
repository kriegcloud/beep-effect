# Agent Chat Interface

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

AI chat inputs — and especially message-*edit* inputs — are impoverished
plain-text boxes that lose formatting and can't express structured intent.
Build the primary chat & text input for the `@beep/professional-desktop`
agent control plane on Lexical: Notion-style blocks in the input itself,
lossless editing, schema-defined blocks, deterministic thread export.

## Next Open Question

Adopt `@lobehub/editor` as a dependency vs build a custom Lexical block kit
on the existing `@beep/ui` editor-00 foundation (license, React 19 compat,
Effect schema-first fit)? Resolve via the pending external-landscape research.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - the original brainstorm + screenshots (stage 0, complete).
3. [`RESEARCH.md`](./RESEARCH.md) - in-repo inventory done; external landscape pending (stage 1, current).
4. [`DECISIONS.md`](./DECISIONS.md) - context-alignment record (stage 2 not yet started).

## Trail

- 2026-06-12: packet opened by migrating `docs/research/BRAINSTORM.md` + 3
  screenshots. Capture complete. In-repo capability inventory recorded in
  `RESEARCH.md` from a full stack exploration (desktop shell, runtime
  doctrine, UI/editor substrate, agent connectivity, schema codecs). External
  landscape research queued: lobe-editor deep dive, Lexical ecosystem, chat
  input UX comparisons, PDF export options.
