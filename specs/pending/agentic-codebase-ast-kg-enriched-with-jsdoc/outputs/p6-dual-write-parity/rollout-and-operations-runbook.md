# P6 Rollout and Operations Runbook

## Rollout Stages
1. `R0-P6 Shadow`: dual-write commands available; read paths unchanged; parity checks run on schedule.
2. `R1-P6 Controlled`: enable selected query consumers on Falkor structured reads.
3. `R2-P6 Expanded`: broader rollout after stable parity windows and throughput mitigation.
4. `R3-P6 Default`: default dual-write operations after incident-free window.

## Required Preflight
1. Falkor container reachable (`graphiti-mcp-falkordb-1`) or `BEEP_FALKOR_REDIS_URL` configured.
2. Graphiti MCP reachable at `BEEP_GRAPHITI_URL` (default `http://localhost:8000/mcp`).
3. Confirm target commit: `git rev-parse HEAD`.
4. Confirm command surface: `bun run beep kg --help`.

## Standard Daily Sequence
1. Publish full or delta:
   - `bun run beep kg publish --target both --mode full`
   - `bun run beep kg publish --target both --mode delta --changed <paths>`
2. Verify:
   - `bun run beep kg verify --target both --group beep-ast-kg --commit <sha>`
3. Parity:
   - `bun run beep kg parity --profile code-graph-functional --group beep-ast-kg`
4. Replay backlog when needed:
   - `bun run beep kg replay --from-spool <file-or-dir> --target both`

## Incident Playbook

| Symptom | Detection | Action |
|---|---|---|
| Falkor write failures with Graphiti success | `publish` receipt shows Falkor `failed>0` | Run `verify`; if quote/shell issue suspected, ensure patched CLI with argument-safe Falkor execution is deployed; replay from spool after patch. |
| Graphiti MCP failures | `verify.graphiti.status != 200` or publish graphiti failures | Keep publishing to Falkor target, preserve spool files, and replay Graphiti when service recovers. |
| Commit-context parity fails | `parity` check `commit-context` false | Run `verify` commit metrics (`commitCount`, `commitContextCount`), then republish for target commit and rerun parity. |
| Publish runtime too long on full-repo scope | operational timeout / pipeline breach | Switch to delta mode for routine runs; schedule batched Falkor ingestion improvement before expansion gate. |

## Recovery Commands
1. Rebuild deterministic local artifacts: `bun run beep kg index --mode full`.
2. Re-publish dual-write from index envelopes: `bun run beep kg publish --target both --mode full`.
3. Replay preserved spool entries: `bun run beep kg replay --from-spool <spool-path> --target both`.
4. Validate recovery: `bun run beep kg verify --target both --group beep-ast-kg --commit <sha>` and parity command.
5. Automated local recovery helper: `scripts/graphiti-recover.sh` (supports `--republish` and `--skip-republish`).

## Operational Constraints
1. Full-repo publish currently performs many serial Falkor queries; treat as heavy operation.
2. Parity is functional behavior parity, not strict schema identity parity.
3. Shared group `beep-ast-kg` may include mixed history; use commit-scoped verify signals for signoff decisions.

## Evidence References
1. Failure baseline: `evidence/20260225T205938Z-*.json`.
2. Post-hardening success packet: `evidence/20260225T210659Z-fixture-*.json`.
3. Deterministic replay packet: `evidence/20260225T210750Z-fixture-index-*.json`.
4. Full-repo success packet: `evidence/20260225T214750Z-fullrepo-publish-full.json`, `evidence/20260225T221039Z-fullrepo-verify-both.json`, `evidence/20260225T221039Z-fullrepo-parity.json`.
