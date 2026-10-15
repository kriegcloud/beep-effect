# Rule delta: 0.51.1 → 0.53.0

README rule tables compared from the actual npm packages: nine added, none removed;
`catchIfTagToCatchTag` is the only changed description.

| Version | Added rules |
| --- | --- |
| 0.52 | effectSleepZeroToYieldNow, flatMapToTap, preferEffectArray, preferEffectRecord, preferSchemaTaggedError, schemaClassMissingBrand |
| 0.53 | errorPayloadShadowsName, preferNamespaceImport, preferBarrelImport |

Changed rule behavior in release notes:

- 0.52: catch-tag dispatch recognizes both Predicate.isTagged forms.
- 0.52: experimentalApiUsage/unstableApiUsage inspect contextually typed object
  literal properties, including shorthand; inference-blocked generic generators
  are conservatively skipped to avoid false TypeScript diagnostics.
- 0.52: an empty/replacement child plugins list clears the inherited plugin.
- 0.52: Effect diagnostics run after unused-identifier checking, preserving TS6133.
- 0.53: deterministicKeys handles unnamed/missing package.json and accepts the
  identifier pattern. Import-style rules and auto-import use per-file overrides
  and discover actual package barrels. Performance changes claim unchanged reports.
- `debug` plugin option was removed in 0.52. No diagnostic rules were removed.

## Standalone CLI

`effect-tsgo diagnostics --project <tsconfig> --format json --strict`
selects one project; repeat for each check/test config. `--file` selects one file.
Formats: json, pretty (default), text, github-actions. `--severity` filters
error,warning,message; `--progress` writes progress to stderr. `--lspconfig`
replaces the project plugin config, so a spike override must retain its full map.
`--list-files` includes Effect-version detection per file. JSON contains
`diagnostics` and a summary with file counts and errors/warnings/messages.
The wrapper forwards the selected binary's status and signal. Strict makes
warnings affect failure; errors fail without strict. Suggestions remain reported.

## t3code discrepancy

The live reference uses tsc-rs 0.7.0 in workspace typecheck scripts and still
explicitly instructs keeping @effect/tsgo coupled to tsc-rs. No standalone
`effect-tsgo diagnostics` wiring was found in its manifests/scripts/workflows.
The approved H2 design remains the task contract; t3code is not evidence that
this split has already been implemented there.

## tsc-rs benchmark wiring (verified upstream main README and script)

`pingdotgg/ts-rust/scripts/bench-apps/t3code.sh` runs, for each pinned benchmark
project, `bun check -p <config> --no-pretty --all`, accepts typecheck exits up to
2, then executes `effect-tsgo diagnostics --project <absolute-config> --format text`.
This is a benchmark path after Bun, not t3code's current production typecheck.
The README states 4,823 shared Effect diagnostics matched (4,602 stability
warnings), with path/severity formatting differences, on its pinned fixture.
The current ts-rust README still identifies the ported rules as 0.51.1.

## Coverage canary

A scratch project outside the repo deliberately contains an Effect.gen reusable
wrapper and Math.random. The preserved 0.51.1 compiler, the actual 0.53.0
standalone command and tsc-rs 0.6.0 all report exactly TS377047
(effectFnOpportunity) and TS377070 (globalRandom), at the same two locations and
with the same messages. Exit codes are respectively 1, 1 and 2, as documented.
This is additional positive coverage evidence; it does not replace the full census.
