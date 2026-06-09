# P2 Boundary Codec JSON Parse Advisory

Date: 2026-06-08

## Completed

- Implemented the first `SFV4-boundary-codec` advisory slice in
  `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`.
- The rule is AST-backed and intentionally narrow:
  - it flags direct `JSON.parse(...)` call expressions in scanned TypeScript
    source;
  - it does not flag `JSON.stringify(...)`, generated string rendering, or
    comments that mention `JSON.parse`.
- Findings are inventoried as:
  - `kind`: `schema-policy-advisory`;
  - `status`: `advisory`;
  - `ruleId`: `SFV4-boundary-codec`;
  - line and symbol metadata.
- Missing advisory inventory entries emit structured `[schema-first:issue]`
  warnings with rule-specific remediation, so Yeet can route agents toward
  `S.UnknownFromJsonString`, `S.fromJsonString(schema)`, and Effect / Result /
  Option decoders.
- The live Runpod OpenAPI generator parse was initially tracked in
  `standards/schema-first.inventory.jsonc` as an advisory rather than a hard
  failure. It was later remediated in
  `reviews/p4-runpod-boundary-codec-pilot.md`.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```

The focused fixture proves direct `JSON.parse(text)` emits a structured
`SFV4-boundary-codec` advisory, while `S.decodeUnknownEffect(S.UnknownFromJsonString)`
produces no advisory.

After the Runpod boundary-codec pilot, the live repo currently reports:

```text
[schema-first] sfv4_boundary_codec_advisories=0
```

## Still Pending

- Evaluate whether future `SFV4-boundary-codec` slices should cover
  form-data, URL search params, and string-tree codecs.
- Keep `JSON.stringify(...)` out of this rule until the repo has a low-noise
  distinction between data encoding boundaries and code-generation string
  rendering.
