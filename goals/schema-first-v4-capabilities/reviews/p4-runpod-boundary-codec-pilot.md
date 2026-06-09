# P4 Runpod Boundary Codec Pilot

Date: 2026-06-08

## Completed

- Remediated the only tracked `SFV4-boundary-codec` advisory:
  `packages/drivers/runpod/scripts/generate.ts`.
- Replaced the raw `JSON.parse(raw) as OpenApiDocument` boundary with
  `S.decodeEffect(S.fromJsonString(OpenApiDocument))`.
- Modeled the local OpenAPI subset as annotated `S.Class` schemas so parsing
  and structural validation stay schema-owned:
  `JsonSchema`, `OpenApiParameter`, `OpenApiMedia`, `OpenApiRequestBody`,
  `OpenApiResponse`, `OpenApiOperation`, `OpenApiPathItem`,
  `OpenApiComponents`, and `OpenApiDocument`.
- Used `S.suspend` for recursive `JsonSchema` references and `S.Literals` for
  the OpenAPI parameter-location literal domain, matching Effect v4's singular
  `S.Literal(...)` and multi-literal `S.Literals([...])` split.
- Ran the generator and confirmed there is no tracked diff in
  `packages/drivers/runpod/src/_generated/Runpod.generated.ts`.

## Source Grounding

- `.repos/effect-v4/packages/effect/SCHEMA.md` documents
  `UnknownFromJsonString` and `fromJsonString` as JSON string decoding
  surfaces.
- `.repos/effect-v4/packages/effect/src/Schema.ts` defines
  `UnknownFromJsonString = fromJsonString(Unknown)` and
  `fromJsonString(schema)` as a string-to-schema decode transformation.
- `.repos/effect-v4/packages/effect/src/Schema.ts` exposes singular
  `Literal(...)` and multi-value `Literals([...])` separately.

## Verification

```sh
cd packages/drivers/runpod && bun run generate
cd packages/drivers/runpod && bun run check
cd packages/drivers/runpod && bun run lint
cd packages/drivers/runpod && bun run test
cd packages/drivers/runpod && bun run type-test
bun run beep lint schema-first
git diff -- packages/drivers/runpod/src/_generated/Runpod.generated.ts
```

The live repo currently reports:

```text
[schema-first] sfv4_boundary_codec_advisories=0
```

## Review Notes

- This deliberately did not replace generated driver output or broaden the
  Runpod codegen strategy.
- The OpenAPI schemas model only the subset consumed by the generator. Unknown
  OpenAPI document fields are ignored because the generated output did not
  depend on them before this remediation.
- A broader `SchemaRepresentation` or generator replacement remains a separate
  spike with parity requirements.
