# Repo Architecture Automation Reference

## Status

Superseded by `canonical-slice-factory`. The old packet is deleted from the
working tree; git history is the archive.

## Lessons Retained

- `fixture-lab/Specimen` was the prior executable proof and is reference-only.
- Generator work should normalize ergonomic commands into a schema-backed
  operation plan before writing files.
- Writer selection belongs behind the operation plan: Handlebars for
  reviewable source and documentation leaves, structured writers for JSON,
  JSONC, package metadata, docgen, and manifests, and `ts-morph` only for
  semantic TypeScript edits.
- DB drivers own technical capabilities. Product repositories translate driver
  errors at server and use-case boundaries.
- The old packet should not be rehydrated as active guidance.

## Use Instead

- `initiatives/canonical-slice-factory/README.md`
- `initiatives/canonical-slice-factory/SPEC.md`
- `initiatives/canonical-slice-factory/PLAN.md`
- `initiatives/canonical-slice-factory/ops/codex-handoff-prompt.md`
