# Fallow 3.34 migration hold

Status: retired by the 2026-10-22 issue #1932 migration described below.
The original hold evidence is preserved here.

The recovery branch pins Fallow to 3.33.1, the minor version selected on main,
while retaining the zero-findings dead-code baseline and blocking check.
No finding allowance or suppression was added.

Fallow 3.34 changed path globs: `*` stays within a path segment and `**` crosses
directories. The existing configuration therefore has a different reachability
graph after the dependency update. The release explicitly warns that this can
surface new findings. See the
[3.34 release notes](https://github.com/fallow-rs/fallow/releases/tag/v3.34.0).

On the same recovery checkout, 3.33.1 reported one unused export and one unused
development dependency; 3.34.1 reported 63 blocking dead-code findings. The
latter includes generated source artifacts and class members. Several class
findings have live consumers: `ParserOptions.new`, `CsvCodecOptions.decodeEffect`,
and the CSV escape getters. Re-exported `Schema` aliases also produced duplicate
class-member findings. The optional semantic pass timed out after 120 seconds
and retained the conservative findings, so it did not establish their validity.
Other new findings may be real unused code; this version hold does not classify
all 63 as false positives.

The two 3.33.1 findings were repaired:

- `NativeAddonExternals` is an internal bundle setting, so its unused export was removed.
- The desktop Vite alias now resolves `decode-named-character-reference` by package
  specifier with `import.meta.resolve`, preserving the dependency edge and avoiding
  an assumed hoisted `node_modules` path.

`beep quality fallow dead-code --check --base origin/main` then reported zero
findings with Fallow 3.33.1. The baseline, configuration entry roots, and blocking
policy are unchanged.

Before upgrading past 3.33, migrate and review the entry and ignore glob semantics,
trace the new findings, and retain paired used/unused fixtures for class aliases
and schema factory inheritance. Remove this exact pin only after that migration
passes the unchanged zero-findings gate. Reversal is the root catalog and lockfile
version update; no application data or public schema API changed for the hold.

The main #2005 dependency update reintroduced 3.34.1 before that migration was
qualified. Its Fallow job
[119581349691](https://github.com/beep-effect/beep-effect/actions/runs/39704537904/job/119581349691)
reported 64 errors: seven files,
three exports, six types and 48 class members. Audit reported zero introduced
findings and health reported zero findings; neither result clears the separate
dead-code failure. This reproduces the documented compatibility boundary rather
than establishing that every newly reported symbol is safe to remove.

Current source still demonstrates reachability gaps in the analyzer's member
attribution: `Csv.schema.ts` calls `CsvCodecOptions.decodeEffect`, and
`CsvParser.parser.ts` reads `parserOptions.escapeChar`, while 3.34.1 reports those
members unused. Other findings, including unused exports from an internally used
module, still need individual review. The existing entry patterns intentionally
root top-level package modules; replacing them with recursive roots would also
hide genuinely unused implementation and is not the migration remedy.

Retain 3.33.1 under this same hold, with no new baseline allowance, suppression,
entry expansion or API deletion. The reopening criteria above remain unchanged:
review the glob migration and individual findings, prove used/unused member
attribution, and pass the unchanged dead-code, audit and health gates before
removing the pin.

## 2026-10-22 qualification

The 3.34.1 migration audits the current 63 findings individually: 45 dead
implementations or unused exports removed, and 18 false positives retained with
symbol-specific, line-level suppressions. No dynamic entry expansion was needed.
The top-level entry semantics, rule severities, and zero baseline stay unchanged.
The seven redundant raw generated TypeScript projections are retired at their
producers; canonical JSON inputs and the consumed court/reporter vocabularies
remain. Every affected package is private; no major changeset is required.

Paired used/unused member fixtures are retained in
`packages/tooling/tool/cli/test/fixtures/fallow334`. On 3.34.1 the raw fixtures
report both live getters and both unused controls; line-specific suppressions
remove only the live getter findings. The controls remain detectable.
Declaration emit also proves that the `ProtobufInt64Input` type export is live:
removing it causes TS4023 in `Fixed64`; its export is preserved.

The unchanged dead-code, audit, and health checks pass on 3.34.1. The local
63-row evidence table and command receipts are in `.beep/fallow334/TRIAGE.md`.
The 3.33.1 pin is no longer needed after this qualification. Reversal is the
version/lockfile change plus the focused source changes; no application data
migration is involved.
