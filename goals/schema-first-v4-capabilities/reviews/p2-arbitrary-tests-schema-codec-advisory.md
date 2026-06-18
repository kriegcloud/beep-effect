# P2 Arbitrary Tests Schema Codec Advisory

Date: 2026-06-08

## Completed

- Implemented the first `SFV4-arbitrary-tests` advisory slice in
  `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`.
- The rule is AST-backed and intentionally file-level:
  - it only scans test files (`/test/`, `/tests/`, `.test.ts(x)`,
    `.spec.ts(x)`);
  - it excludes generated, docs, dtslint, build, dist, coverage, `.repos`, and
    `node_modules` paths;
  - it counts real Schema codec helper calls such as `S.decodeUnknownEffect`,
    `S.decodeEffect`, `S.encodeUnknownEffect`, `S.encodeEffect`,
    `S.decodeUnknownResult`, and `S.decodeUnknownOption`;
  - it only flags files with at least three Schema codec helper calls;
  - it ignores files that already contain `S.toArbitrary(...)` or
    `fc.property` / `fc.assert` / `fc.check`.
- Findings are inventoried as:
  - `kind`: `schema-policy-advisory`;
  - `status`: `advisory`;
  - `ruleId`: `SFV4-arbitrary-tests`;
  - `symbol`: `schema-codec-tests`;
  - line metadata pointing at the first Schema codec helper call.
- Missing advisory inventory entries emit structured `[schema-first:issue]`
  warnings with remediation toward a focused
  `fc.property(S.toArbitrary(sourceSchema), law)` test, or an explicit
  inventory entry when the file is intentionally golden/snapshot/regression-only
  coverage.
- Effect v4 source grounding:
  - `.repos/effect-v4/packages/effect/SCHEMA.md` documents converting schemas
    to FastCheck arbitraries with `Schema.toArbitrary`;
  - `.repos/effect-v4/packages/effect/src/Schema.ts` exports `toArbitrary` and
    `toArbitraryLazy` in the Arbitrary section.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```

The focused fixture proves a static-only schema-heavy test file emits a
structured `SFV4-arbitrary-tests` advisory, while a test file containing
`S.toArbitrary(Model)` and `fc.property(...)` produces no advisory.

After the shared-domain `EntityKernel` pilot, the live repo reported:

```text
[schema-first] sfv4_arbitrary_tests_advisories=17
```

After the shared-UI `OrganizationDisplay` pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=16
```

After the `@beep/md` AST pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=15
```

After the `@beep/file-processing` pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=14
```

After the `@beep/nlp` graph schema pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=13
```

After the `@beep/nlp` PatternCore pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=12
```

After the `@beep/semantic-web` ServicesAndSurface DTO pilot, the live repo now
reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=11
```

After the `@beep/semantic-web` JSON-LD DTO pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=10
```

After the tooling agent-effectiveness command pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=8
```

After the tooling AI-metrics command pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=7
```

After the tooling files command pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=6
```

After the Libpff and Tika driver pilots, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=4
```

After the Venice AI driver pilot, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=3
```

After the ACP and architecture-lab PgLite pilots, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=0
```

There were no tracked live `SFV4-arbitrary-tests` advisory files under the
async-only codec list.

## Hardening: full Effect v4 codec family (2026-06-08)

The first slice only counted `decode*Effect` / `encode*Effect`,
`decode*Result` / `encode*Result`, and `decode*Option` helpers, so the most
common unit-test idiom — the synchronous throwing codecs
`S.decodeUnknownSync` / `S.decodeSync` / `S.encodeUnknownSync` /
`S.encodeSync` (plus the Promise and Exit families) — was a rule blind spot.
`SCHEMA_CODEC_HELPERS` now lists the full Effect v4 codec surface confirmed in
`.repos/effect-v4/packages/effect/src/Schema.ts`. The hardened rule
re-surfaced the synchronous-codec backlog:

```text
[schema-first] sfv4_arbitrary_tests_advisories=34
```

All 34 are tracked as `advisory` candidates pending Wave 3 review, and a clean
lint run stays green (advisories do not fail). See
`reviews/p2-arbitrary-tests-sync-codec-expansion.md` for the
candidate-vs-exception guidance and the focused sync-codec lint test.

After the HttpStatus round-trip pilot
(`reviews/p4-httpstatus-arbitrary-pilot.md`), the live repo reported:

```text
[schema-first] sfv4_arbitrary_tests_advisories=33
```

After the Options codec round-trip pilot
(`reviews/p4-options-arbitrary-pilot.md`), the live repo reported:

```text
[schema-first] sfv4_arbitrary_tests_advisories=32
```

After the orchestrated Wave 3 batch remediated 6 genuine schema-law tests
(`reviews/p4-wave3-arbitrary-remediation-batch.md`), the live repo reported:

```text
[schema-first] sfv4_arbitrary_tests_advisories=26
```

After reclassifying the 8 reviewed non-candidates as inventory exceptions
(`reviews/p4-wave3-arbitrary-exceptions.md`), the live repo reported:

```text
[schema-first] sfv4_arbitrary_tests_advisories=18
```

After the source `toArbitrary` annotation batch remediated 3 regex string-brand
tests (`reviews/p4-wave3-source-arbitrary-annotations.md` — CaseStr, FilePath,
BlockchainRedacted), the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=15
```

After the probe-first deferred-arbitraries batch
(`reviews/p4-wave3-deferred-arbitraries.md`) remediated 9 more (FileName,
DateTimeUtcFromValid, RegExp, Duration, Color, URI, Observed, and TSMorph
model/service), reverted 2 as flaky (IRI, PackageJson), and reclassified
PromiseSchema as an exception, the live repo now reports:

```text
[schema-first] sfv4_arbitrary_tests_advisories=5
```

The remaining 5 are Glob and TypedArrays (Bun-runtime-blocked in this
environment), IRI and PackageJson (reverted-flaky; need curated arbitraries),
and the not-yet-addressed `schema/test/Graph.test.ts`. Cumulatively the 34
surfaced candidates are 20 remediated, 9 exceptions, 5 deferred.

PR #223 review then hardened the rule's precision (see
`reviews/p2-arbitrary-tests-sync-codec-expansion.md`): schema-derived coverage
now requires `S.toArbitrary` (a bare `fc.*` no longer suppresses the advisory),
and the codec matcher now counts class-local static codec calls
(`Model.decode*`), not just `S.`/`Schema.` namespace calls. That surfaced 2
additional honest findings (`apps/oip-web/test/oip-web.test.tsx`,
`@beep/nlp` `Handoff/Contract.test.ts`), bringing the live advisory count to 7.

## Still Pending

- Review each advisory before remediation; many files may keep exact fixtures
  for golden payloads, compatibility contracts, or regression repros while
  adding one or two schema-derived property laws beside them.
- Continue P4 Wave 3 after the completed Sha256, Markdown, secure-header
  option, CSV, repo-configs route-predicate, LocalDate, Organization, identity
  namespace, EntityKernel, OrganizationDisplay, Markdown AST, file-processing,
  NLP graph schema, NLP PatternCore, semantic-web DTO, JSON-LD DTO, form
  builder, tooling agent-effectiveness command, tooling AI-metrics command,
  tooling files command, Libpff, Tika, Venice AI, ACP, and architecture-lab
  PgLite pilots. This advisory class is currently fully remediated.
- Later enforcement can distinguish files that use manual `fc.*` arbitraries
  from files using `S.toArbitrary(...)`; this first slice only separates
  static-only schema codec coverage from files that already have property
  coverage.
