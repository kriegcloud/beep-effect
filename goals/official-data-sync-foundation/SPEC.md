# Official Data Sync Foundation Spec

## Objective

Ship a repo-native data-sync backend that refreshes official source datasets into
`@beep/data`, then expose schema literals/codecs from `@beep/schema` without
duplicating raw facts in schema modules.

## Non-Goals

- Do not modify `Sha256`; another agent owns the Effect Crypto migration.
- Do not replace curated extension lookup behavior in `@beep/data/MimeTypes`.
- Do not use paid/subscription-only ISO 3166 data in this slice.
- Do not introduce runtime network fetching in `@beep/schema`.
- Do not refactor unrelated package topology or generated catalogs.

## Source Hierarchy

1. User objective that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required repo standards.
3. Official upstream data source documentation and payloads.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `packages/tooling/tool/cli/src/commands/SyncDataToTs`
- `packages/foundation/primitive/data`
- `packages/foundation/modeling/schema`
- `.github/workflows/data-sync.yml`
- `goals/official-data-sync-foundation`
- Root dependency metadata only when needed for sync implementation.

## Required Source Policy

- ISO 4217: official SIX List One XML feed.
- MIME/media types: official IANA media type registry XML.
- Timezones: official IANA tzdb data distribution.
- Territories/country-like codes: Unicode CLDR JSON release data as the v1 free,
  machine-readable fallback because ISO 3166 up-to-date machine formats require
  paid/subscription access.
- Every generated dataset records source URLs and SHA-256 metadata.

## Data Contract

- `@beep/data` owns generated raw arrays, lookup maps, literal arrays, source
  metadata, and canonical JSON sidecars.
- `@beep/schema` imports from `@beep/data` and uses `@beep/utils/Struct`
  helpers such as `keysNonEmpty`, `entriesNonEmpty`, and `reverse` to derive
  type-safe `LiteralKit`/`MappedLiteralKit` schemas.
- Schema modules must not hand-copy official literal lists.
- Currency names are literals only in v1 because ISO 4217 has duplicate display
  names, so a reversible currency name/code codec would be unsound.

## Automation Contract

- `bun run beep sync-data-to-ts --all` writes generated TypeScript modules and
  canonical JSON sidecars.
- `--check` fails on drift without modifying files.
- `--report-dir` writes Markdown and JSON reports suitable for CI artifacts and
  pull-request bodies.
- Diffs use Effect v4 `Differ`/`JsonPatch`; report rendering uses `@beep/md`.
- Source hashing uses Effect Crypto services, not the schema Sha256 module.

## Acceptance Criteria

- [ ] Sync command supports all v1 targets: `iso4217`, `iana-media-types`,
      `iana-timezones`, and `cldr-territories`.
- [ ] `@beep/data` exports generated raw data, maps, literal arrays, and source
      metadata for all v1 targets.
- [ ] `@beep/schema` derives `CurrencyCode`, `MimeType`, `Timezone`,
      `TerritoryCode`, `CountryCode`, and `ContinentCode` schemas from
      `@beep/data`.
- [ ] GitHub Actions automation refreshes data, uploads reports, and prepares a
      pull-request body from the Markdown report.
- [ ] Focused tests cover sync behavior plus data/schema derived surfaces.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Sync check | `bun run beep sync-data-to-ts --all --check --report-dir /tmp/beep-data-sync-check` | Passes |
| CLI check | `bun run --cwd packages/tooling/tool/cli check` | Passes |
| CLI tests | `bun run --cwd packages/tooling/tool/cli test sync-data-to-ts` | Passes |
| Data check/test | `bun run --cwd packages/foundation/primitive/data check && bun run --cwd packages/foundation/primitive/data test` | Passes |
| Schema check/test | `bun run --cwd packages/foundation/modeling/schema check && bun run --cwd packages/foundation/modeling/schema test CurrencyCode Timezone TerritoryCode MimeType` | Passes |
| Schema topology | `bun run beep lint schema-topology` | Passes |
| Packet launcher size | `test "$(wc -m < goals/official-data-sync-foundation/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/official-data-sync-foundation/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/official-data-sync-foundation packages/tooling/tool/cli/src/commands/SyncDataToTs packages/tooling/tool/cli/test/sync-data-to-ts.test.ts packages/foundation/primitive/data packages/foundation/modeling/schema .github/workflows/data-sync.yml` | Passes or reports only unrelated pre-existing files |

## Stop Conditions

- Required upstream source formats change in a way that cannot be normalized
  without changing this spec.
- Verification requires credentials, payment, destructive side effects, or
  policy approval not named in this spec.
- Unrelated local changes make scoped verification ambiguous.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| CLDR for country-like codes | `CountryCode`/`TerritoryCode` | @beep/data | ISO 3166 paid/subscription machine-readable updates are out of scope for v1. | Replace or supplement when an approved official ISO 3166 data source is available. |
