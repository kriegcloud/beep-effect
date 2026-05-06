# P1 Source Discovery And Privacy

## Status

Completed on 2026-05-05.

## Implemented Surfaces

`@beep/repo-ai-metrics` now includes:

- `source-discovery.ts` for Codex, Claude Code, and OpenClaw safe gateway
  metadata discovery
- `config-snapshot.ts` for deterministic repo-owned agent config snapshots
- `privacy.ts` for redaction counts, salted private hashes, raw event hashes,
  and sanitized transcript projections

`beep-cli ai-metrics` now includes:

- `sources discover`
- `config snapshot`
- `privacy check`
- `ingest --target`

The install spec planned commands now point at source discovery, config
snapshot, privacy check, and forwarder commands instead of a hardcoded Codex
directory ingest.

## Privacy Contract

- Source discovery emits `homeDirHash`, `repoRootHash`, `rootPathHash`,
  `sourcePathHash`, and `sessionIdHash`; it does not emit raw local paths.
- OpenClaw discovery is limited to unit-file metadata and does not read or emit
  unit contents.
- Privacy checks emit redaction counts, event names, timestamps, line numbers,
  raw event hashes, and source path hashes; they do not emit prompt, output,
  message, payload, content, text, or result bodies.
- Config snapshots emit repo-relative config paths and deterministic content
  hashes; config file contents are not included.
- Private hashes use `--hash-salt` or `BEEP_AI_METRICS_HASH_SALT`; absent salt is
  marked as `insecure_default` for local smoke only.

## Synthetic Evidence

Added tests:

- `packages/tooling/library/ai-metrics/test/ingest.test.ts`
- `packages/tooling/tool/cli/test/ai-metrics-command.test.ts`

The fixtures prove:

- raw prompt/output text is absent from privacy JSON
- secret-shaped values are absent from privacy JSON
- temp/private local paths are absent from source discovery and privacy JSON
- `.repos` and `node_modules` agent docs are excluded from config snapshots
- config snapshot hashes are stable until included file content changes
- CLI `sources discover`, `config snapshot`, and `privacy check` emit JSON

## Local Smoke Evidence

Commands completed successfully:

- `bun run beep ai-metrics sources discover --repo-root . --home-dir "$HOME" --max-files 5 --hash-salt local-smoke --json`
- `bun run beep ai-metrics sources discover --repo-root . --home-dir "$HOME" --all --max-files 5 --hash-salt local-smoke --json`
- `bun run beep ai-metrics config snapshot --repo-root . --json`
- `bun run beep ai-metrics privacy check --source codex --input <recent-codex-jsonl> --hash-salt local-smoke --json`

Observed local smoke results:

- default seven-day discovery found 5 Codex files, 0 recent Claude files, and 1
  OpenClaw metadata file
- all-time discovery found 5 Codex files, 5 Claude files, and 1 OpenClaw
  metadata file with `--max-files 5`
- config snapshot found 220 repo-owned agent-facing files and produced
  `config-86e9841a48df346c26b3c8dc240011455c2237039ac0d2cfbad5201d3ddb19cc`
- real Codex privacy smoke accepted 353 events, found event names
  `event_msg`, `response_item`, `session_meta`, and `turn_context`, counted 464
  excluded raw text fields, counted 12 secret-shaped assignments, and reported
  `safeForDerivedUi: true`

## Verification

- `cd packages/tooling/library/ai-metrics && bun run check`
- `cd packages/tooling/library/ai-metrics && bun run test`
- `cd packages/tooling/library/ai-metrics && bun run lint`
- `cd packages/tooling/library/ai-metrics && bun run docgen`
- `cd packages/tooling/tool/cli && bun run check`
- `cd packages/tooling/tool/cli && bunx --bun vitest run test/ai-metrics-command.test.ts`
- `cd packages/tooling/tool/cli && bun run lint`

## Remaining Gaps

P1 deliberately stops before durable data movement. P2 must add:

- encrypted raw archive writes
- idempotent ingest keys
- redacted derived DuckDB and Parquet tables
- replay/projection interfaces
- EventLog projection proof behind an internal boundary

P3+ still own OTLP export, Phoenix deployment, labels, benchmarks, weekly
scorecards, dankserver apply, retention, backup, restore, and hardening.
