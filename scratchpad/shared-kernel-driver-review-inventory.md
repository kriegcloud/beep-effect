# Shared Kernel and Driver Review Inventory

Review scope: `packages/shared/**` and `packages/drivers/**`.

Status values:
- `required`: remediate in this wave.
- `bounded`: remediate if it stays local and low-risk.
- `follow-up-only`: keep documented; do not remediate in this wave because it needs an API or architecture decision.
- `resolved`: remediated and verified.

## Loop 6 Inventory

Review timestamp: 2026-04-28T01:38:44Z.

| ID | Status | Severity | Package | Path:line | Issue | Owner / write-set | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W6-DRZ-001 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:70` | `optionFromSafeDefect` drops safe non-`Error` object causes such as native Drizzle query errors. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Safe native query object causes are retained; hostile proxies remain omitted. |
| W6-DRZ-002 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:109`, `packages/drivers/drizzle/src/Drizzle.errors.ts:139` | Hostile Cause reason entries can throw through `Cause.isFailReason`/`Cause.isDieReason` or payload access. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Safe reason unwrapping prevents throws and preserves valid reason payloads. |
| W6-PG-001 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:94`, `packages/drivers/postgres/src/Postgres.errors.ts:242`, `packages/drivers/postgres/src/Postgres.format.ts:272` | Hostile Cause reason entries can throw during Postgres normalization/formatting; raw hostile Cause values can be retained as `cause`. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/src/Postgres.format.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Safe reason unwrapping is reused; raw cause retention excludes hostile/proxied Cause objects. |

## Loop 5 Inventory

Review timestamp: 2026-04-28T01:23:05Z.

| ID | Status | Severity | Package | Path:line | Issue | Owner / write-set | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W5-DRZ-001 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:103`, `packages/drivers/drizzle/src/Drizzle.errors.ts:238` | `DrizzleError.fromUnknown` can still throw through hostile `Cause.reasons` access or when storing a hostile raw cause into `S.DefectWithStack`. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Safe cause-reasons and safe defect guards make normalization total for hostile Cause/proxy inputs. |
| W5-DRZ-002 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/interop.ts:63` | `installDrizzleEffectYieldables` uses `A.contains` for installed constructor checks. | `packages/drivers/drizzle/src/interop.ts`, `packages/drivers/drizzle/test/Drizzle.interop.test.ts` | Installed checks use referential identity and interop tests cover hostile proxy constructors. |

## Loop 4 Inventory

Review timestamp: 2026-04-28T00:59:16Z.

| ID | Status | Severity | Package | Path:line | Issue | Owner / write-set | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W4-PG-001 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:57` | Hostile proxies can throw through unguarded `instanceof Error`, `Cause.isCause`, or `S.is(PostgresError)` checks during normalization. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Guard helpers are total and tests cover proxy/prototype traps. |
| W4-PG-002 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.format.ts:169` | `formatSql` can throw through direct `value instanceof Date`; formatter normalization has similar unsafe guard checks. | `packages/drivers/postgres/src/Postgres.format.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Date/PostgresError/Cause guards are total and proxy regression tests pass. |
| W4-PG-003 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:116` | Cycle detection uses `A.contains`, which can trigger hostile object behavior instead of strict identity checks. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Cycle detection uses referential identity and tests preserve hostile nested error safety. |
| W4-PG-004 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:91` | `extractSourceLocation` reads `value.stack` directly and can throw on an Error with a hostile `stack` getter. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Stack reads go through the safe property reader and tests cover throwing stack getter. |
| W4-PG-005 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.format.ts:139` | `formatDate` calls `Date#toJSON`/`toString` directly and can throw for hostile Date subclasses. | `packages/drivers/postgres/src/Postgres.format.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Date rendering is total and falls back to the placeholder. |
| W4-DRZ-001 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:140` | Drizzle cycle detection uses `A.contains`, which can throw on hostile nested error objects before safe property readers run. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Cycle detection uses referential identity and tests cover hostile nested error safety. |

## Loop 3 Inventory

Review timestamp: 2026-04-28T00:32:18Z.

| ID | Status | Severity | Package | Path:line | Issue | Owner / write-set | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W3-DOC-001 | resolved | low | `@beep/postgres` | `packages/drivers/postgres/CLAUDE.md:31` | Agent docs omit package docgen even though `AGENTS.md` includes it. | `packages/drivers/postgres/CLAUDE.md` | Add package docgen to verifications and checklist. |
| W3-DOC-002 | resolved | low | `@beep/shared-client` | `packages/shared/client/README.md:30`, `packages/shared/client/AGENTS.md:36`, `packages/shared/client/CLAUDE.md:36` | Package docs omit the existing docgen verification surface. | `packages/shared/client/{README.md,AGENTS.md,CLAUDE.md}` | README and agent docs include package docgen. |
| W3-DOC-003 | resolved | low | `@beep/shared-config` | `packages/shared/config/README.md:33`, `packages/shared/config/AGENTS.md:38`, `packages/shared/config/CLAUDE.md:38` | Package docs omit the existing docgen verification surface. | `packages/shared/config/{README.md,AGENTS.md,CLAUDE.md}` | README and agent docs include package docgen. |
| W3-DOC-004 | resolved | low | `@beep/shared-server` | `packages/shared/server/README.md:32`, `packages/shared/server/AGENTS.md:35`, `packages/shared/server/CLAUDE.md:35` | Package docs omit the existing docgen verification surface. | `packages/shared/server/{README.md,AGENTS.md,CLAUDE.md}` | README and agent docs include package docgen. |
| W3-DOC-005 | resolved | low | `@beep/shared-use-cases` | `packages/shared/use-cases/README.md:32`, `packages/shared/use-cases/AGENTS.md:36`, `packages/shared/use-cases/CLAUDE.md:36` | Package docs omit the existing docgen verification surface. | `packages/shared/use-cases/{README.md,AGENTS.md,CLAUDE.md}` | README and agent docs include package docgen. |
| W3-PG-001 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:54` | Missing `cause` can block fallback to `reason` while reading nested diagnostics. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Optional unknown property readers treat missing or `undefined` as absent; reason fallback is covered. |
| W3-PG-002 | resolved | high | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:101` | Normalizing an existing `PostgresError` can throw or lose diagnostics because `message` is an `Option`. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Existing `PostgresError` normalization is idempotent and covered by tests. |
| W3-PG-003 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:197` | `PostgresError.fromUnknown` is not fully Cause-aware for pg-like, Drizzle query, or `PostgresError` failures. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | `Cause.fail`/`Cause.die` unwrap nested diagnostics and tests preserve SQLSTATE/query/params. |
| W3-PG-004 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.format.ts:169` | Array param previews can throw when a nested value has throwing string coercion. | `packages/drivers/postgres/src/Postgres.format.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Param preview rendering is total and tests cover throwing nested array values. |
| W3-DRZ-001 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:177` | `DrizzleError.fromUnknown` is not idempotent for existing `DrizzleError` values or `Cause.fail(DrizzleError)`. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Existing and Cause-wrapped `DrizzleError` diagnostics are preserved. |
| W3-DRZ-002 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:30` | Unknown property reads can throw while normalizing bad getter/proxy errors. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Safe property reads return absence on accessor failure; tests cover throwing getter. |

## Loop 2 Inventory

Review timestamp: 2026-04-28T00:04:02Z.

| ID | Status | Severity | Package | Path:line | Issue | Owner / write-set | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W2-EFFECT-001 | resolved | low | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:63` | Fallback opaque params use a native array literal instead of the existing Effect `Array` helper. | `packages/drivers/drizzle/src/Drizzle.errors.ts` | Replace with `A.of(paramsText)` and keep tests green. |
| DOC-W2-001 | resolved | low | `@beep/shared-domain` | `packages/shared/domain/AGENTS.md:15` | Agent surface map omits current root exports such as `Aggregates`, `Principal`, and `SourceKind`. | `packages/shared/domain/AGENTS.md` | Surface map matches current root/entity barrels. |
| DOC-W2-002 | resolved | low | `@beep/shared-domain` | `packages/shared/domain/AGENTS.md:47` | Verification list omits `docgen`. | `packages/shared/domain/AGENTS.md` | Agent verification list includes package docgen command. |
| DOC-W2-003 | resolved | low | `@beep/shared-domain` | `packages/shared/domain/README.md:54` | Development commands omit `bun run docgen`. | `packages/shared/domain/README.md` | README command list includes `bun run docgen`. |
| DOC-W2-004 | resolved | low | `@beep/shared-tables` | `packages/shared/tables/README.md:34` | README export list only names `Table.make`, omitting public metadata/type helpers. | `packages/shared/tables/README.md` | README describes the public table namespace helpers. |
| DOC-W2-005 | resolved | low | `@beep/shared-tables` | `packages/shared/tables/AGENTS.md:17` | Agent surface map for `src/table/Table.ts` only lists `make`. | `packages/shared/tables/AGENTS.md` | Surface map includes `make` plus public table metadata/type helpers. |
| DOC-W2-006 | resolved | low | `@beep/drizzle` | `packages/drivers/drizzle/AGENTS.md:13` | Interop surface map omits current native error/query-effect type groups. | `packages/drivers/drizzle/AGENTS.md` | Agent surface map includes native cache, logger, error, and query-effect exports. |
| DOC-W2-007 | resolved | low | `@beep/drizzle` | `packages/drivers/drizzle/AGENTS.md:28` | Verification/checklist omits `docgen`. | `packages/drivers/drizzle/AGENTS.md` | Agent verification/checklist includes package docgen. |
| DOC-W2-008 | resolved | low | `@beep/postgres` | `packages/drivers/postgres/AGENTS.md:31` | Verification/checklist omits `docgen`. | `packages/drivers/postgres/AGENTS.md` | Agent verification/checklist includes package docgen. |
| REVIEW2-BUG-001 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.format.ts:158` | Formatting can throw while rendering params containing an invalid `Date`. | `packages/drivers/postgres/src/Postgres.format.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Param rendering is total; tests cover invalid `Date` through `formatSql` and `formatPostgresError`. |
| REVIEW2-BUG-002 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.format.ts:276` | `formatPostgresError(Cause.fail(PostgresError))` loses original diagnostics. | `packages/drivers/postgres/src/Postgres.format.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Cause-aware normalization preserves embedded `PostgresError`; test covers `Cause.fail`. |
| REVIEW2-BUG-003 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:67` | `DrizzleError.fromUnknown` does not unwrap `Cause` failures. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Cause failure containing native Drizzle query error preserves query and params. |
| REVIEW2-TEST-001 | resolved | low | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.client.ts:122` | `PostgresClient.fromPgClient` lacks runtime service-key coverage. | `packages/drivers/postgres/test/*` | Effect test proves `PostgresClient`, native `Pg.PgClient`, and `SqlClient.SqlClient` resolve to the provided client. |
| REVIEW2-TEST-002 | resolved | low | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.service.ts:88` | `withTransaction` lacks failure-path coverage for callback and adapter failures. | `packages/drivers/drizzle/test/Drizzle.errors.test.ts` or dedicated service test | Effect tests prove failures remain `DrizzleError` and are not swallowed/remapped. |
| W2-GRAPH-001 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:10` | Source imports `@beep/utils`, but manifest/project references do not declare it. | `packages/drivers/drizzle/package.json`, `packages/drivers/drizzle/tsconfig.json` or source cleanup | Package graph is honest; either declare the dependency/reference or remove the import. |
| W2-GRAPH-002 | resolved | low | `@beep/postgres` | `packages/drivers/postgres/package.json:62` | Manifest/docgen declare unused `@beep/drizzle` and `pg-protocol`. | `packages/drivers/postgres/package.json`, `packages/drivers/postgres/docgen.json` | Remove stale dependency/docgen aliases unless source coupling is intended and documented. |

## Required And Bounded Items

| ID | Status | Severity | Package | Path:line | Issue | Owner / write-set | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | resolved | high | `@beep/drizzle` | `packages/drivers/drizzle/src/interop.ts:65` | `installDrizzleEffectYieldables` overwrites an existing `commit` method. | `packages/drivers/drizzle/src/interop.ts`, `packages/drivers/drizzle/test/Drizzle.interop.test.ts` | Preserve existing `commit`; add focused runtime test; package check/test pass. |
| BUG-002 | resolved | high | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.format.ts:237` | SQL formatter can throw while formatting a database failure. | `packages/drivers/postgres/src/Postgres.format.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Invalid SQL falls back to raw query text and does not throw. |
| BUG-003 | resolved | medium | `@beep/shared-ui` | `packages/shared/ui/src/entities/Organization/Organization.display.ts:48` | `Display` and `Form` reject `parentOrgId: null` even though shared domain encodes absence as `null`. | `packages/shared/ui/src/entities/Organization/Organization.display.ts`, `packages/shared/ui/test/OrganizationDisplay.test.ts` | Decode and encode tests cover `parentOrgId: null` for both contracts. |
| BUG-005 | resolved | low | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:107` | Fallback Drizzle-message parser splits opaque params text on commas. | `packages/drivers/postgres/src/Postgres.errors.ts`, `packages/drivers/postgres/test/Postgres.errors.test.ts` | Comma-bearing fallback params remain one opaque diagnostic value. |
| BUG-006 | resolved | low | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:60` | Mirrored fallback Drizzle-message parser splits opaque params text on commas. | `packages/drivers/drizzle/src/Drizzle.errors.ts`, `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Comma-bearing fallback params remain one opaque diagnostic value. |
| JSDOC-001 | resolved | high | `@beep/drizzle` | `packages/drivers/drizzle/src/interop.ts:21` | Example uses forbidden `declare`; public type re-export docs lack examples. | `packages/drivers/drizzle/src/interop.ts` | Drizzle docgen passes with compile-safe examples. |
| JSDOC-002 | resolved | high | `@beep/postgres` | `packages/drivers/postgres/src/interop.ts:20` | Several examples use forbidden `declare`. | `packages/drivers/postgres/src/interop.ts`, `Postgres.client.ts`, `Postgres.drizzle.ts` | Postgres docgen passes with compile-safe examples. |
| JSDOC-003 | resolved | medium | `@beep/postgres` | `packages/drivers/postgres/src/interop.ts:112` | Native type re-export docs lack examples. | `packages/drivers/postgres/src/interop.ts` | Postgres docgen passes with examples for exported type groups. |
| JSDOC-004 | resolved | high | `@beep/shared-domain` | `packages/shared/domain/src/identity/Shared.ts:31` | Shared id and license-tier examples use type assertions. | `packages/shared/domain/src/identity/Shared.ts`, `Organization.values.ts` | Shared-domain docgen passes without assertion examples in those docs. |
| JSDOC-010 | resolved | high | `@beep/shared-tables` | `packages/shared/tables/src/table/Table.ts:151` | Example uses forbidden `declare`; exported type docs lack examples. | `packages/shared/tables/src/table/Table.ts` | Shared-tables docgen passes with concrete table examples. |
| TESTS-004 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.service.ts:128` | Runtime tests bypass public `Drizzle.makeLayer`. | `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Effect test provides `Drizzle.makeLayer` and covers execute/transaction. |
| TESTS-005 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/interop.ts:39` | Interop tests do not prove patched query yieldability or `commit` execution. | `packages/drivers/drizzle/test/Drizzle.interop.test.ts` | Effect test yields a patched query and runs `commit`. |
| TESTS-006 | resolved | medium | `@beep/shared-domain` | `packages/shared/domain/test/LocalDate.test.ts:72` | `it.effect` blocks use `expect` instead of `assert`. | `packages/shared/domain/test/LocalDate.test.ts` | Effectful tests use `assert`; package tests pass. |
| TESTS-007 | resolved | medium | `@beep/drizzle` | `packages/drivers/drizzle/test/Drizzle.errors.test.ts:85` | `it.effect` blocks use `expect` instead of `assert`. | `packages/drivers/drizzle/test/Drizzle.errors.test.ts` | Effectful tests use `assert`; package tests pass. |
| TESTS-008 | resolved | low | `@beep/shared-domain` | `packages/shared/domain/src/index.ts:29` | Root barrel lacks broad type-test smoke coverage. | `packages/shared/domain/dtslint/*` | Add focused dtslint root-barrel smoke test. |
| ARCH-003 | resolved | low | `@beep/shared` docs | `packages/shared/README.md:28` | Family docs blanket-ban driver imports but `shared/tables` has an approved metadata-only Drizzle exception. | `packages/shared/README.md`, `packages/shared/AGENTS.md` | Docs name the exception while preserving the live DB ban. |
| IMPROVE-001 | resolved | medium | `@beep/shared` docs | `packages/shared/README.md:8` | Family docs are stale for active `domain`, `tables`, `ui`, and `LocalDate` surfaces. | `packages/shared/README.md`, `packages/shared/AGENTS.md` | Package map matches current active/scaffolded leaves. |
| IMPROVE-002 | resolved | low | `@beep/shared-domain` docs | `packages/shared/domain/README.md:24` | README export list omits `Principal`, `SourceKind`, and primitives. | `packages/shared/domain/README.md` | README public surface map matches current barrels. |
| IMPROVE-010 | resolved | low | `@beep/drizzle` docs | `packages/drivers/drizzle/README.md:1` | README is sparse and lacks real service/interop examples. | `packages/drivers/drizzle/README.md` | README shows `Drizzle.makeLayer`, interop, and error normalization. |
| IMPROVE-011 | resolved | low | `@beep/shared-ui` docs | `packages/shared/ui/README.md:23` | README omits concrete `Display`, `Form`, and `primaryLabel` contracts. | `packages/shared/ui/README.md` | README names and demonstrates the concrete contracts. |

## Follow-Up-Only Items

| ID | Severity | Package | Path:line | Reason deferred |
| --- | --- | --- | --- | --- |
| ARCH-001 / BUG-004 | medium | `@beep/shared-domain` | `packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts:238` | Removing or changing live-clock and invalid-`Date` constructor APIs changes public LocalDate semantics; needs a separate API decision. |
| ARCH-002 | low | shared scaffold packages | `packages/shared/config/src/index.ts:8` | Deleting or filling empty shared leaves is package topology work, not safe as incidental remediation. |
| EFFECT_SCHEMA-001 | high | `@beep/shared-domain` | `packages/shared/domain/src/entity/BaseEntity.ts:377` | Converting sync constructor invariants to Effect changes public entity-construction API. |
| EFFECT_SCHEMA-002 | high | `@beep/shared-domain` | `packages/shared/domain/src/entity/EntityMixin.ts:865` | Converting sync mixin packing failures to Effect changes public mixin API. |
| EFFECT_SCHEMA-003 | medium | `@beep/shared-domain` | `packages/shared/domain/src/entity/BaseEntity.ts:298` | Removing generic bridge assertions requires a dedicated proof/refactor slice around `Model.Class` and static attachment. |
| EFFECT_SCHEMA-004 | medium | `@beep/shared-domain` | `packages/shared/domain/src/entity/EntityMixin.ts:882` | Removing descriptor-map assertions requires a dedicated generic schema-construction refactor. |
| EFFECT_SCHEMA-005 | medium | `@beep/shared-tables` | `packages/shared/tables/src/table/Table.ts:165` | Quarantining all Drizzle table-builder casts is larger than this remediation wave. |
| EFFECT_SCHEMA-006 | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.drizzle.ts:94` | Native Drizzle module typing needs a separate adapter-design cleanup. |
| EFFECT_SCHEMA-007 | low | `@beep/shared-domain` | `packages/shared/domain/test/LocalDate.test.ts:254` | Test-local `S.Struct` can be addressed with broader LocalDate test cleanup if schema-first lint requires it. |
| JSDOC-005..009 | medium | `@beep/shared-domain` | multiple | Broad export-example expansion is large documentation inventory work; fix hard violations first. |
| JSDOC-011 | medium | multiple | multiple | Tag-order-only cleanup is broad and low behavioral risk; defer unless docgen/lint requires it. |
| ERR_OBS-1 | high | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.format.ts:317` | Default redaction and Cause-aware logging policy conflicts with the current explicit diagnostics UX and needs an architecture decision. |
| ERR_OBS-2 | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.errors.ts:209` | Removing raw cause/query/params from public error shape would break the driver-diagnostics API. |
| ERR_OBS-3 | medium | `@beep/drizzle` | `packages/drivers/drizzle/src/Drizzle.errors.ts:155` | Removing raw cause/query/params from public error shape would break the driver-diagnostics API. |
| ERR_OBS-4 | opportunity | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.client.ts:81` | Driver observability spans/log annotations should be designed with the redaction policy. |
| TESTS-001 | high | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.drizzle.ts:90` | Mockable native Drizzle loader seams are needed before reliable runtime coverage. |
| TESTS-002 | medium | `@beep/postgres` | `packages/drivers/postgres/src/interop.ts:74` | Failure-path dynamic import testing needs a mockable loader seam. |
| TESTS-003 | medium | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.client.ts:81` | Full client/layer error-path tests need a fake native Pg client contract. |
| IMPROVE-003 | medium | shared + drivers | `packages/shared/domain/package.json:31` | Curated package exports are repo-wide package-surface policy work. |
| IMPROVE-004 | medium | `@beep/shared-domain` | `packages/shared/domain/src/entity/EntityMixin.ts:410` | Descriptor registry refactor is larger than this cleanup wave. |
| IMPROVE-005 | medium | `@beep/shared-tables` | `packages/shared/tables/src/table/Table.ts:55` | Storage recipe refactor is larger than this cleanup wave. |
| IMPROVE-006 | medium | `@beep/shared-ui` | `packages/shared/ui/src/entities/Organization/Organization.display.ts:42` | Deriving UI contracts from domain schemas needs a focused modeling pass. |
| IMPROVE-007 | low | `@beep/shared-domain` | `packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts:1` | LocalDate file split is organization work. |
| IMPROVE-008 | medium | drivers | `packages/drivers/drizzle/src/Drizzle.errors.ts:50` | Shared parser extraction can follow after both parser bugs are fixed locally. |
| IMPROVE-009 | low | `@beep/postgres` | `packages/drivers/postgres/src/Postgres.sqlstate.ts:31` | SQLSTATE generator/provenance deserves a separate deterministic-data task. |
| IMPROVE-012 | low | shared manifests | `packages/shared/domain/package.json:14` | Shared package metadata requires repo tooling/schema policy. |
