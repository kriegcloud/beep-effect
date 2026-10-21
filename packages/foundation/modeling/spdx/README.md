# @beep/spdx

SPDX license identifiers, exceptions and license expressions as Effect Schema classes. `License.parse` validates a single identifier against the full SPDX License List; `SpdxExpression.parse` validates and parses a whole expression, such as `(MIT OR Apache-2.0)` or `GPL-2.0-only WITH Classpath-exception-2.0`, into a typed AST rather than a string you re-parse at every call site. The SPDX datasets are vendored as generated TypeScript under `src/internal/`, so nothing reads a CJS package at runtime; the only runtime dependencies are `effect` and `@beep/identity` (schema identifiers under `@beep/spdx/*`).

## Why

Validating a `license` field usually means importing a small CJS parser at runtime and trusting it to keep working across module systems: a foreign dependency for a grammar that rarely changes. This package vendors the SPDX license and exception datasets as committed TypeScript instead: 695 active and 26 deprecated license identifiers, plus 66 exceptions, built once from static data with no parsing cost at load time. Validation only runs against actual input, through `parse` / `parseResult`, never against the ~721 known-good catalog entries.

The grammar is hardened the same way. Malformed input and an unknown identifier both fail through one typed `InvalidSpdxExpressionError`, never as a thrown exception, and the recursive-descent parser is depth-capped so a hostile or accidentally nested expression cannot blow the stack. A differential suite (`test/oracle.int.test.ts`) checks the engine against the canonical `spdx-expression-parse` package on all 695 known license ids; if the two ever disagree, the rule is to fix this engine, not the test.

## Usage

Validate a single license identifier:

```ts
import { License } from "@beep/spdx/License";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const mit = yield* License.parse("MIT");
  return [mit.id, mit.deprecated];
});

console.log(JSON.stringify(Effect.runSync(program))); // ["MIT",false]
```

Parse an expression into its AST, or check one synchronously with no `Effect` runtime:

```ts
import { isValidExpression, SpdxExpression } from "@beep/spdx";
import * as Effect from "effect/Effect";

const expr = Effect.runSync(SpdxExpression.parse("(MIT OR Apache-2.0+)"));
console.log(expr._tag, expr.toString()); // Or (MIT OR Apache-2.0+)

console.log(isValidExpression("(MIT OR Apache-2.0)")); // true
console.log(isValidExpression("MIT AND")); // false
```

Each module is also reachable as its own entry point: `@beep/spdx/License`, `@beep/spdx/LicenseException` and `@beep/spdx/SpdxExpression`.

- **`License`**: a validated SPDX license identifier (`Schema.Class`), with `parse` (Effect) and `parseResult` (sync `Result`) constructors, an `of(...)` convenience for known-good values, and the static predicates `isKnownId`, `isDeprecatedId` and `isLicenseRef`.
- **License metadata** from the vendored dataset, as getters on a `License`: `name` and `referenceUrl` (both `Option`, `none` for a `LicenseRef-` identifier the list does not describe) and the `osiApproved` / `fsfLibre` flags, for a UI or a policy gate that needs more than the identifier.
- **`LicenseException`**: the same pattern over the SPDX exception identifiers, with its own catalog and `parse` / `parseResult` / `of`.
- **`SpdxExpression`**: the recursive license-expression AST (`LicenseNode`, `LicenseRefNode`, `WithExceptionNode`, `AndNode`, `OrNode`), an Effect `parse`, the sync `isValidExpression` predicate, a `FromString` codec for embedding in your own schemas, and a canonical, fully parenthesized `.toString()`.
- **`SpdxExpression.licensesOf` / `SpdxExpression.primaryLicense`**: every license an expression names, in written order and deduplicated, and the single one to display where only one fits. `primaryLicense` is deliberately `none` for an `AND` expression: a conjunction imposes all of its terms at once, so no one of them stands for the whole, and picking a side would misstate the obligations. Use `licensesOf` wherever more than one can be shown.
- **`InvalidSpdxExpressionError`**: the package's single typed error; malformed grammar and an unknown identifier both fail through it, never as a defect.
- Deprecated license and exception identifiers parse successfully and carry `deprecated: true` rather than being rejected.

## Development

From the repository root:

```sh
bun run beep quality package-verify @beep/spdx
```

From the package directory: `bun run check`, `bun run lint`, `bun run test`, `bun run test:integration`, `bun run lint:laws`, `bun run lint:jsdoc` and `bun run docgen`. The oracle suite needs the `spdx-expression-parse` devDependency, typed by the test-only ambient shim `test/spdx-expression-parse.d.ts`.

## Reference material

- [`KNOWLEDGE.md`](./KNOWLEDGE.md) carries the upstream knowledge bundle (package guide, design doc and the conventions and decisions it cites) verbatim; its header maps the upstream layout onto this package.
- The upstream regeneration tooling (`lib/scripts/generate-data.ts` and the committed `lib/data/spdx-licenses.json` catalog) was not ported. The vendored datasets in `src/internal/` are carried exactly as upstream generated them; refresh them by re-porting the regenerated upstream files.
- The generated API reference for this package is under [`docs/modules`](./docs/modules).

## Provenance

Ported from upstream [`@effected/spdx`](https://www.npmjs.com/package/@effected/spdx) (MIT, C. Spencer Beggs) through the beep-effect effected port, then promoted from the scratchpad kit into this workspace package by `goals/effected-promotion`. The package [LICENSE](./LICENSE) carries both the beep-effect and the upstream copyright notices.

## License

[MIT](./LICENSE)

## Port notes

### Attribution

- Upstream package: `@effected/spdx` 0.11.0
- Upstream commit: `af7566a9da2eff169cb74955efcc5ede1e5de9f8` (`$HOME/YeeBois/references/effect/effected`)
- License: [LICENSE](./LICENSE) (verbatim upstream MIT notice)
- Vendored-data notices: the SPDX datasets in `src/internal/licenseIds.ts`, `src/internal/exceptions.ts` and `src/internal/licenseMeta.ts` are generated from republished SPDX data: `spdx-license-ids` and `spdx/license-list-data` (both CC0-1.0) and `spdx-exceptions` (CC-BY-3.0); each file's header names its source and license.

### Added exports

None.

### Deviations

One entry per class of change (law- or ruling-forced) and one per behavioural divergence; the full test, upstream behaviour, lab behaviour and reason are on the module's ledger row.

- **native-runtime** — The lab replaces native catalogs/id sets with HashMap/HashSet and license deduplication with MutableHashSet, using Option lookups while retaining ordered datasets and first-appearance license order. (test/License.test.ts:83; test/LicenseMetadata.test.ts:11; test/data.test.ts:7; test/SpdxExpression.test.ts:307)
- **schema-first** — The lab derives LicenseRef validation from a branded schema using the upstream regex instead of separate direct regex guards. (test/License.test.ts:23; test/License.test.ts:48; test/License.test.ts:63)
- **type-safety** — The lab replaces tuple and test casts with checked types/narrowing and declares recursive encoded children as tagged POJOs instead of decoded class instances. (test/SpdxExpression.test.ts:219; test/SpdxExpression.test.ts:271; test/SpdxExpression.test.ts:152; test/LicenseMetadata.test.ts:11)
- **tsgo-diagnostics** — The lab uses schema .make, typed string decoding and schema-derived test guards instead of new error construction, unknown-input decoding and instanceof narrowing. (test/License.test.ts:37; test/LicenseException.test.ts:16; test/SpdxExpression.test.ts:120; test/SpdxExpression.test.ts:133; test/SpdxExpression.test.ts:165; test/SpdxExpression.test.ts:207)
- **effect-first** — The lab uses hoisted exhaustive Effect matchers and Array/Option helpers instead of upstream switches and native metadata mapping/lookup checks. (test/SpdxExpression.test.ts:127; test/SpdxExpression.test.ts:152; test/SpdxExpression.test.ts:229; test/SpdxExpression.test.ts:279; test/SpdxExpression.test.ts:298)
- **effect-imports** — The lab source, tests and JSDoc examples import dedicated effect/Module paths instead of the upstream effect barrel. (module suite test/**)
- **identity-annotations** — The lab adds composer-derived identifiers, field descriptions and schema metadata to the upstream classes, AST union and string codec. (module suite test/**)
- **test-environment** — The lab supplies the upstream oracle ambient declaration beside the lab tests instead of relying on the upstream types-directory layout. (test/oracle.int.test.ts:43; test/spdx-expression-parse.d.ts:1)
- **schema-first** — Compared with upstream’s type-only raw parser contract, the lab adds an annotated runtime RawExpression schema with schema-derived leaf and WITH types while retaining plain-object parser output (test/internal/parser.coverage.test.ts:9; test/internal/parser.coverage.test.ts:22).

### Dependency backlog

None.
