# Practice KG MCP Strict Telemetry Tier Plan

## Status

Status: `active`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Seam pin test; DPAPI feasibility; tool enum. | Facts recorded. |
| P1 Gate | complete | Serializer gate + egress client + stderr logger. | Golden + canary tests green. |
| P2 Spool + tier | complete | Encrypted spool; fail-closed tier resolution. | Spool round-trip + tier tests green. |
| P3 Proof | pending | Mutation tests; privacy receipt; Windows smoke. | All proofs green. |
| P4 Yeet | pending | PR to mergeable. | Merge gate passes. |
| P5 Close | pending | Reflection; packet flip. | completed-retained. |

## Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.
- P0 (2026-10-15): `research/source-survey.md` and the binding
  `research/strict-tier-design.md`; decisions in `SPEC.md`.
- P1 (2026-10-15): `@beep/observability/strict` (`StrictGate.schemas.ts`,
  `StrictGate.service.ts`, `StrictGate.layer.ts`) with the strict-safe boundary
  fixture, the `Otlp.layer` seam pin, golden key and refusal-tag snapshots
  (`test/__golden__/`), per-rule and rule-table property tests; eight new
  `TelemetryRefusalTag` values and the kernel `beep.duration_bucket` key.
  `apps/practice-kg-mcp`: tool-id `LiteralKit` pinned to the toolkit keys,
  instruments file, `src/runtime/Telemetry.ts` (shape-only stderr logger,
  in-memory salt, strict OTLP layer) composed in `Host.ts`; `bin.ts` and the
  `runMain` report go through the shape-only logger.
  `packages/law-practice/server` stamps `beep.practice_kg.failure_reason`.
  Canary acceptance test (all 11 tools, invalid input, missing rows and a
  store without its tables; raw, lowercase, URL, base64, JSON-escaped,
  8-character prefix and SHA-256 forms) in `apps/practice-kg-mcp/test/Host.test.ts`.
  Cache baseline re-recorded for `@beep/practice-kg-mcp` via
  `research/cache-baseline-request-strict-tier-p1.json`.
- P1 review fix (2026-10-15, #1838): metric points are rebuilt from named
  fields; values are floored onto the 1/2.5/5-per-decade ladder (saturating at
  10^12) under the new `metric-values` gate rule; histograms drop `sum`/`min`/
  `max` (`metric-value-dropped`); exponential histograms and summaries are
  refused (`metric-not-allowed`). Round 2: an exported metric's `description`
  and `unit` come from its catalog `MetricInstrument`, never the input series
  (input passes only with the `metric-names` rule off).
  refused (`metric-not-allowed`).
- P2 (2026-10-15): `@beep/observability/strict` gains the encrypted spool
  (`StrictSpool.{schemas,errors,service,layer}.ts`: AES-256-GCM segments with
  the header bound as additional data, owner-only files written by temp +
  rename, byte-bounded eviction, replay that refuses tampered, foreign-epoch
  and looser-tier segments), `StrictSpoolKey` with HKDF-derived spool key and
  span-id salt (`layerStrictSaltFromKey`), and the fail-closed resolver
  (`StrictTier.{schemas,behavior}.ts`, `resolveStrictTier`). Three kernel
  refusal tags: `spool-evicted`, `spool-tier-refused`, `spool-segment-invalid`;
  `StrictEgressSink.record` returns its refusals and `StrictGate.absorb` counts
  them. `apps/practice-kg-mcp`: `src/runtime/TelemetryKey.ts` (DPAPI port over
  `bun:ffi` `crypt32` with the PowerShell `ProtectedData` fallback, key file
  `<telemetry dir>/key.dpapi`, telemetry-directory resolution, dev-file port off
  Windows), `src/runtime/TelemetryCheck.ts` (`--self-check-telemetry`), the
  production telemetry layer in `Host.ts`, and `src/BundleGraph.ts` (metafile
  check run by `src/package.ts` and a test). The canary acceptance test in
  `test/Host.test.ts` now exports through the spool and scans it at rest.
  Decisions in `SPEC.md`.
- Operator smoke for acceptance #4 (not run by an agent; recorded in
  `goals/practice-kg-mcp/research/install-runbook.md`, "Telemetry key smoke"):
  on `tom-pc-1`, as the attorney's Windows user in the desktop session, from the
  unpacked extension folder run `practice-kg-mcp.exe --self-check-telemetry`.
  Pass: exit 0 and `{"ok":true,"keyPath":"dpapi-ffi"|"dpapi-powershell",…}`;
  record the `keyPath` (a `dpapi-powershell` result records the fallback).
- Finding: no canary reaches pre-gate telemetry today (handler errors use
  canned messages, SQL spans carry statements without parameters, and mcp-kit
  strips `parameters`); with the content rules turned off the canary test
  still passes. The per-rule sensitivity lives in the kernel tests over
  synthetic batches; the P3 mutation table should add a host-level leak path.

## Verification Commands

```sh
test "$(wc -m < goals/practice-kg-mcp-strict-tier/GOAL.md)" -le 4000
jq . goals/practice-kg-mcp-strict-tier/ops/manifest.json
rg -n "practice-kg-mcp-strict-tier|GOAL.md|agentLaunchers|packetAnchorDocument" goals/practice-kg-mcp-strict-tier
git diff --check -- goals/practice-kg-mcp-strict-tier
```
