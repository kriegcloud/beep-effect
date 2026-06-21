# Implementation Evidence - 2026-06-18

## Implemented

- Added the multi-source `sync-data-to-ts` backend with Effect Crypto hashing,
  canonical JSON sidecars, JSON Patch drift reporting, and `@beep/md` Markdown
  reports.
- Added official data targets for ISO 4217, IANA media types, IANA tzdb, and
  CLDR territories.
- Published generated data, maps, literal arrays, and metadata from
  `@beep/data`.
- Rewired `@beep/schema` currency, MIME type, timezone, territory, country, and
  continent schemas to derive from `@beep/data` with typed `Struct` helpers.
- Added the scheduled data-sync workflow and report-backed pull request body.

## Passing Verification

```sh
bun run beep sync-data-to-ts --all --check --report-dir /tmp/beep-data-sync-check
# sync-data-to-ts: 0 of 4 target(s) have drift

bun run --cwd packages/tooling/tool/cli check
bun run --cwd packages/tooling/tool/cli test sync-data-to-ts
bun run --cwd packages/tooling/tool/cli test docgen.test.ts

bun run --cwd packages/foundation/primitive/data check
bun run --cwd packages/foundation/primitive/data test

bun run --cwd packages/foundation/modeling/schema check
bun run --cwd packages/foundation/modeling/schema test CurrencyCode Timezone TerritoryCode MimeType

bun run beep lint schema-topology

bun run test -- --unit --filter=@beep/repo-cli --filter=@beep/data --filter=@beep/schema --filter=@beep/md --summarize
# 4 successful, 4 total
```

Packet checks:

```sh
test "$(wc -m < goals/official-data-sync-foundation/GOAL.md)" -le 4000
jq . goals/official-data-sync-foundation/ops/manifest.json
git diff --check -- goals/official-data-sync-foundation
```

## Documented External Blocker

The workflow-style check command currently fails in this dirty worktree:

```sh
bun run check -- --filter=@beep/repo-cli --filter=@beep/data --filter=@beep/schema --filter=@beep/md --summarize
```

Failure:

```text
@beep/file-processing:check: test/FileProcessing.test.ts(82,13): error TS377032:
Effect.provide with a Layer should only be used at application entry points.
```

That file is part of an unrelated concurrent workstream already dirty before
this slice. The scoped package checks for `@beep/repo-cli`, `@beep/data`, and
`@beep/schema` pass.
