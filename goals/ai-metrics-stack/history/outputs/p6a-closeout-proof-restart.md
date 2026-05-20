# P6a Closeout And Proof Restart

## Status

P6a closeout gates passed on May 9, 2026. The credited P6 seven-day proof
window restarted after the Pulumi health check and live Phoenix version check
passed.

Credited window:

- start: May 9, 2026 02:26 America/Chicago
- earliest completion: May 16, 2026 02:26 America/Chicago

## Evidence

- Bounded live forwarder smoke completed with `--max-file-bytes 8388608` and
  `--max-files 5`:
  - ingest run: `forwarder-1778311158155`
  - source coverage: Codex `139` candidates, `5` included; Claude Code `0`;
    OpenClaw `0`
  - derived turns: `3516`
- Workstation user timer installed and ran successfully:
  - unit: `beep-ai-metrics-forwarder.timer`
  - state: `enabled`, `active (waiting)`
  - first owned service run finished May 9, 2026 02:22:54 America/Chicago
  - service evidence: `31.881s` wall clock, `1.5G` memory peak
  - latest status path:
    `.beep/ai-metrics/forwarder/status/latest.json`
- Archive decrypt drill passed without printing transcript text:
  - archive object:
    `raw-e3d14757b3deade2405bd5cf8bec58678035c735be7ad148c5ddda794d8a5d15`
  - decrypted byte count: `697540`
  - plaintext hash matched: `true`
- Pulumi reconciliation passed for `beep-ai-metrics-dankserver`:
  - `pulumi preview -s beep-ai-metrics-dankserver --non-interactive --diff`
    succeeded
  - `pulumi up -s beep-ai-metrics-dankserver --yes --non-interactive`
    created the stack-owned remote commands
  - stack resource count after apply: `6`
  - output `phoenixPublicUrl`:
    `https://dankserver.tailc7c348.ts.net:8447`
- Live Phoenix version drift resolved:
  - `curl -kIs --max-time 10 https://dankserver.tailc7c348.ts.net:8447/`
  - `x-phoenix-server-version: 15.5.0`
- Minimum completion-credit data was added for the restarted config snapshot:
  - config snapshot:
    `config-d0b05a2d64c9c40c21e0df11f8cfc611be5ce41139f52f4db79b77f73ca895bc`
  - outcome label:
    `label-6cff4e21ca6b5c5d87471a3b430b73da00f75056debc7452d593bb49de19aef0`
  - benchmark case: `ai-metrics-p6a-closeout-smoke`
  - benchmark run:
    `benchmark-run-4c08f57c389fec65a7c73f2cb84ef96701807c74197559c7a4ca1088d2c3b13c`
  - weekly report:
    `.beep/ai-metrics/reports/weekly-1777706876769-1778311676769.md`
    and `.json`
  - restarted snapshot scorecard: `completionReady=true`, total score
    `0.7330000000000001`

## Operational Runbook Notes

- Timer ownership is workstation-local for P6. Server-owned collection remains
  a P7 topology decision because transcript access and privacy boundaries need
  a separate sync design.
- Runtime secret values are stored only in the local systemd environment file
  `~/.config/beep/ai-metrics.env`, installed with mode `0600`. Checked-in docs
  and config continue to use secret references.
- Raw transcript archives remain workstation-local under ignored
  `.beep/ai-metrics/raw`; derived DuckDB and Parquet are also local proof
  artifacts for P6.
- Restore drill for P6 is: resolve `BEEP_AI_METRICS_RAW_ARCHIVE_KEY`, run
  `ai-metrics archive drill`, then regenerate derived state with the bounded
  forwarder. Do not print decrypted transcript bodies.
- Retention for P6 proof artifacts is keep-through-proof plus one review cycle.
  Deletion is by removing ignored `.beep/ai-metrics/raw`,
  `.beep/ai-metrics/derived`, and `.beep/ai-metrics/reports` after confirming
  no active proof or PR review depends on them.

## Remaining P6 Work

- Keep `beep-ai-metrics-forwarder.timer` running through the credited window.
- Add more outcome labels and benchmark runs as real work accumulates.
- Generate the final seven-day report after May 16, 2026 02:26
  America/Chicago and verify the final scorecard remains
  `completionReady=true`.
- Decide in P7 whether to move collection from workstation-owned to
  server-owned/synced topology.
