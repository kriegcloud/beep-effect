# @beep/codegen-kit

`@beep/codegen-kit` runs deterministic OpenAPI and JSON Schema code generation for workspace packages.

## Pipeline

```text
fetch -> patch -> generate(onEnter) -> postProcess -> format -> write | drift
```

`fetch` reads the committed cache by default. A URL source still requires `cachePath` and `pin`; the network is used only with `--refresh`. Before a refreshed cache is written, `pinPolicy: "url-embedded"` requires the URL to contain the pin and `pinPolicy: "info-version"` requires the downloaded OpenAPI `info.version` to equal it. When `pinPolicy` is omitted, the kit derives `url-embedded` if the URL contains the pin and `info-version` otherwise. Check mode is offline and compares generated outputs, never the cached source bytes.

Refreshes parse the upstream JSON, serialize it with two-space indentation, and run the pinned repository Biome binary. This matches the pre-commit JSON format, so refreshing an unchanged release does not dirty the cache.

The `schemas` format uses `JsonSchemaGenerator.make()`, `addSchema`, and `generate`. The upstream schema generator accepts only `openapi-3.0` and `openapi-3.1` as importer modes, so the kit lowers `json-schema-2020-12` and `swagger-2.0` schema documents through its `openapi-3.1` importer after extracting their native definition containers. The other formats call `OpenApiGenerator.generate` directly.

## Consumer entrypoint

```ts
import { GenerateConfig, runGenerateCli } from "@beep/codegen-kit"

const config = GenerateConfig.make({
  packageName: "@beep/example",
  name: "ExampleApi",
  identity: { composer: "$ExampleId", moduleId: "_generated/schema.gen" },
  source: {
    _tag: "url",
    url: "https://example.com/v1/schema.json",
    pin: "v1",
    pinPolicy: "url-embedded",
    cachePath: `${import.meta.dirname}/../spec/schema.json`
  },
  dialect: "json-schema-2020-12",
  transforms: ["nullableTypeArray"],
  format: "schemas",
  output: { path: `${import.meta.dirname}/../src/_generated/schema.gen.ts` }
})

runGenerateCli(config)
```

Run the consumer package's generate script normally to use the cache. Pass `--refresh` to replace and format URL caches. Pass `--check` to fail when generated output is missing or changed. `--check` and `--refresh` cannot be combined.

`name` is optional and defaults to the package-derived generator name. OpenAPI warnings fail generation by default; set `onWarning: "log"` to print them and continue. `--check` prints a unified diff for each missing or changed output.

Schema output uses `schemaStyle: "struct"` by default. Set `schemaStyle: "class"` to render object schemas as `S.Class` models with `.make(...)` and a static schema-derived `is` guard. Non-object schemas keep the struct-style schema declaration.

Package-specific files use `extraModules` entries with renderer names and output paths. Supply their implementations through `runGenerateCli(config, { extraRenderers })`.

`runGenerateCli` also accepts a non-empty array of configs, for packages that generate several schema modules from one script (for example two protocol versions). Every config runs in order with the same `--check` / `--refresh` flags. In check mode the kit collects the drift reports of every config, printing each diff, before it fails once. The service exposes the same loop as `CodegenKit.runAll(configs, mode, refresh)`.

Generated `**Example**` blocks import from `<packageName>/schema` (struct style) or `<packageName>` (class style). Set `output.exampleImport` when a module is published under another subpath, such as `@beep/acp/schema-v1`.

## Registered transforms

Transforms are opt-in, pure, and idempotent. They run in the listed order as the generator's `onEnter` hook over raw definitions; `composeTransforms` is exported for inspection and tests.

- `nullableTypeArray`: `type: [T, "null"]` becomes `anyOf: [{ type: T }, { type: "null" }]`.
- `flattenAllOfRefVariants`: merges a single `allOf: [{ $ref }]` object target into an object node.
- `distributeUnionSiblings`: merges sibling `properties` / `required` into each `oneOf` / `anyOf` member.
- `openObjects`: sets `additionalProperties: true` on closed or unspecified objects.
- `stripExamples`: drops `example` / `examples`.
- `notDiscriminatorPattern`: rewrites a forward-compatible `not: { anyOf: [{ properties: { <d>: { const } } }, ...] }` exclusion into `pattern: ^(?!(?:a|b)$)[\s\S]*$` on property `<d>` (values escaped with `effect/RegExp` `escape`). Any other `not` shape fails with `CodegenTransformError`.
- `unevaluatedPropertiesOpen`: `unevaluatedProperties: true` becomes `additionalProperties: true`; any other value fails.
- `uniqueDiscriminatorOneOfAsAnyOf`: a `oneOf` whose branches all carry distinct string discriminators (a branch `const`, or the `discriminator.propertyName` property `const`) becomes the equivalent `anyOf`, avoiding the exactly-one `Union(..., { mode: "oneOf" })`.
- `distributeAllOf`: merges `allOf` parts into their node and distributes object intersections over `anyOf` unions (a cross product when both sides are unions). `$ref` targets are inlined after the other selected transforms and this one have rewritten them, unless the sibling keys are annotation-only, in which case the `$ref` is kept. Conflicting constraints, overlapping properties with different schemas, and missing definitions fail with `CodegenTransformError`.

The ACP driver uses `["nullableTypeArray", "unevaluatedPropertiesOpen", "notDiscriminatorPattern", "uniqueDiscriminatorOneOfAsAnyOf", "distributeAllOf"]`.

## Development

```bash
bun run beep:check
bunx --bun vitest run --pool=threads --maxWorkers=1
bun run beep:lint
bun run docgen
```

Tests import package source through `@beep/codegen-kit`. Relative test imports are reserved for local helpers, fixtures, and snapshots.

## License

MIT
