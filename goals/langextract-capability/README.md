# LangExtract Capability

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Deliver a canonical research-first execution packet for `@beep/langextract`, an
Effect v4-native foundation capability for LLM-powered structured extraction
with source-grounded character spans.

The implementation target is a provider-neutral extraction substrate inspired by
`google/langextract` and the cloned Effect v3 reference port, while preserving
repo architecture law and reusing `@beep/nlp` primitives before introducing new
models.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/langextract-capability/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P4 Implement.

Next action: implement the accepted proposal in
[`research/synthesis.md`](./research/synthesis.md), starting with required
`@beep/nlp` primitive promotions before scaffolding `@beep/langextract`.

## Latest Evidence

[`history/2026-06-07-packet-bootstrap.md`](./history/2026-06-07-packet-bootstrap.md)
records the packet creation verification.

[`research/synthesis.md`](./research/synthesis.md) records the accepted
implementation proposal. The proposal review inventory is stored in
[`research/reports/proposal-review-round-1.md`](./research/reports/proposal-review-round-1.md)
with zero required findings.

## Notes

- `@beep/langextract` belongs in `packages/foundation/capability/langextract`
  only while it stays provider-neutral substrate.
- General reusable NLP primitives must be reused from or promoted into
  `@beep/nlp` instead of duplicated.
- Provider adapters, provider env config, CLI workflows, rendering, and
  visualization are V1 non-goals for the foundation package.
- 2026-06-29: gold-intake research note added at research/gold-intake-anti-inference-prompt-mode.md (see for anti-inference "pure-OCR" prompt-mode + JSON-contract candidate prompts + n-best/null-score scoring + context-budget chunking).
