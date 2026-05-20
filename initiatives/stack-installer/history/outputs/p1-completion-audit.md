# P1 Completion Audit

Status: blocked for full P1 close; P1C may start under waiver.

Audit date: 2026-05-16

This audit now distinguishes two truths:

- the current branch is ready to start the P1C review/fix loop because macOS
  proof is complete and Windows has an explicit temporary missing-proof waiver
  for sequencing
- full P1 is still blocked until a real Windows proof artifact exists and is
  audited

## Objective Restated

Keep the P1 packet honest after the completed macOS proof:

- preserve the rule that full P1 needs real macOS and Windows fresh-machine
  proof artifacts
- allow the current branch to start P1C under an explicit temporary Windows
  missing-proof waiver
- queue the next meaningful product milestone as app-first Manual Installer UX
- keep P2 AI Mode, MCP runtime, recovery, portability, signing, and
  distribution work untouched for now

## Current Gate Position

- macOS proof: complete and audited on the coordinator checkout
- Windows proof: still missing
- Windows disposition: temporarily waived for P1C start only
- P1C review/fix loop: may start now
- full P1 close: still blocked

## Evidence Snapshot

- `output/stack-installer/p1-live/macos/` exists and includes:
  - `proof.json`
  - `commands.txt`
  - `sha256sums.txt`
  - `screencast.mp4`
- `output/stack-installer/p1-live/stack-installer-p1-macos.tgz` exists
- `bun run p1:proof:audit -- --platform macos` passed after intake
- returned Windows bundle and extracted Windows proof directory are still
  missing
- `history/outputs/p1-pr-readiness-review.md` now records the temporary
  Windows missing-proof waiver and its follow-up trigger

## Completion Interpretation

What is complete:

- P1A dry-run runnable spine
- P1 live Manual Mode harness implementation
- macOS fresh-machine Manual Mode proof
- packet updates needed to let P1C start under an explicit waiver

What is not complete:

- Windows fresh-machine Manual Mode proof
- full P1 closure
- P1D app-first Manual Installer UX
- P2 and later phases

## Required Follow-Up

1. Run P1C now under the recorded temporary Windows missing-proof waiver.
2. Keep the waiver visible in the reviewer inventory instead of treating it as
   hidden debt.
3. Remove the waiver only after a real Windows proof bundle is produced,
   returned, and audited.
4. Start P1D only after the P1C loop is complete.
  live only in ignored `output/stack-installer/p1-live/proof-upload-commands.txt`
  and are not committed.
- Current upload fallback state:
  the live upload endpoint now runs from committed
  `initiatives/stack-installer/ops/proof-upload-server.mjs` on
  `http://<coordinator-tailscale-ip>:8765`. The helper now prefers
  `Authorization: Bearer ...` upload tokens so the token does not need to
  appear in upload URLs. The current private one-time token is stored in ignored
  `output/stack-installer/p1-live/proof-upload-token.txt` with `0600`
  permissions, and the ignored command file does not embed a token. The latest
  restart used `--reuse-token`, preserving the active operator token while
  loading the updated server. Health checks pass, invalid-token requests return
  `403`, and upload logs redact tokens. The server now exposes a non-secret
  public `GET /` landing page that lists health, command, status, and allowed
  upload routes without exposing proof state or tokens. It also exposes
  token-protected `GET /commands`, which returns the coordinator-generated
  upload command file for proof machines that have the current token but no
  coordinator shell or file-sharing access, plus token-protected
  `GET /next-actions`, which returns the generated full operator next-actions
  note. No operator upload has hit the endpoint yet. The same live endpoint has
  also been verified through MagicDNS at
  `http://<coordinator-magic-dns-name>:8765/health`, the MagicDNS public landing
  page, MagicDNS `GET /commands` with bearer token, and MagicDNS
  `GET /next-actions` with bearer token.
  The upload receiver now removes stale temporary upload files before storage
  and chmods both temporary and final approved bundle files to `0600`.
- Current upload-window starter:
  committed `initiatives/stack-installer/ops/start-proof-upload-window.mjs`
  now performs the coordinator setup: token rotation, `0600` token/command/PID
  files, detached server start, and endpoint/log path reporting without
  printing the token. It also supports `--reuse-token` for coordinator-side
  helper restarts that must not invalidate an operator-held token. It now also
  regenerates local-only `README.operator-inbox.md` and
  `OPERATOR_NEXT_ACTIONS.md` files under the ignored output root with current
  endpoint, status, command, and proof-intake instructions. The live endpoint
  was restarted through this helper with `--reuse-token`; current upload PID is
  `1127896`, the generated local handoff files are mode `644`, and the endpoint
  remains healthy.
- Current remote upload status endpoint:
  committed `initiatives/stack-installer/ops/proof-upload-server.mjs` exposes a
  token-protected `GET /status` endpoint for proof machines to confirm what the
  coordinator has received without SSH access. Latest authenticated `/status`
  reports both returned bundles as `false` and both platform directories as
  missing.
- Current remote upload commands endpoint:
  committed `initiatives/stack-installer/ops/proof-upload-server.mjs` exposes a
  token-protected `GET /commands` endpoint for proof machines to fetch current
  upload commands without SSH access. Latest raw-tailnet and MagicDNS checks
  return `403` without a bearer token and return the coordinator-generated
  command file with the active bearer token.
- Current remote operator next-actions endpoint:
  committed `initiatives/stack-installer/ops/proof-upload-server.mjs` exposes a
  token-protected `GET /next-actions` endpoint for proof machines to fetch the
  generated full operator runbook without SSH access. Latest raw-tailnet and
  MagicDNS checks return `403` without a bearer token and return a runbook with
  branch sync, `/commands`, and `p1:proof:audit` steps with the active bearer
  token.
- Current upload-window status helper:
  committed `initiatives/stack-installer/ops/proof-upload-status.mjs` reports
  upload endpoint health, PID/running state, private file modes,
  token-like-text indicators in logs/commands, returned bundle presence,
  platform artifact status, recent redacted upload log lines, detached watcher
  PID/running state, detached watcher file modes, detached watcher completion
  indicator, detached watcher token-like-text indicator, and recent watcher log
  lines in one command. It also validates `GET /` as public, `GET /status` as
  `403` without a token, `GET /status` as `200` with the active bearer token,
  expected `/status` JSON shape, `GET /commands` as `403` without a token,
  `GET /commands` as `200` with the active bearer token, the presence of both
  approved upload routes in the command response, `GET /next-actions` as `403`
  without a token, `GET /next-actions` as `200` with the active bearer token,
  expected proof-run steps in the next-actions response, and absence of
  token-like text in the status, command, and next-actions responses. Latest
  status reports health `200 ok`, landing page `200 ok`, status without token
  `403 ok`, status with token `200 ok`, expected status shape present, commands
  without token `403 ok`, commands with token `200 ok`, expected upload routes
  present, next-actions without token `403 ok`, next-actions with token
  `200 ok`, expected proof steps present, upload PID `1132361` running,
  token/commands/PID file modes `600`, no token-like text in upload logs,
  commands, status response, command response, or next-actions response,
  detached watcher PID `1078319` running, detached watcher file modes `600`, no
  token-like text in watcher logs or command file, both returned bundles
  missing, and both `macos` and `windows` platform directories missing. With
  `--fail-on-missing`, the same helper exits `1` for the current state, which
  gives coordinator polling a machine-readable incomplete-proof gate while
  still proving the proof window itself is alive and operator-fetchable.
- Latest post-rotation upload-window wait:
  `bun run --filter @beep/stack-installer p1:proof:watch -- --watch-attempts 36 --watch-interval-ms 5000`
  exhausted after the bearer-token endpoint was live. No returned bundles were
  found, and the artifact status still reported missing `macos` and `windows`
  platform directories.
- Latest long upload-window wait:
  `bun run --filter @beep/stack-installer p1:proof:watch -- --watch-attempts 120 --watch-interval-ms 5000`
  exhausted after a ten-minute coordinator polling window. The live upload
  endpoint stayed healthy, the upload log showed only health checks plus local
  invalid-token smoke tests, and no returned proof bundles were found.
- Latest upload log inspection:
  `output/stack-installer/p1-live/proof-upload-server.log` shows only
  `GET /health` and `GET /status` requests; no `PUT` or `POST` upload attempts
  have reached the coordinator.
- Current verifier result:
  `bun run --filter @beep/stack-installer p1:proof:audit-all -- --output-root output/stack-installer/p1-live`
  fails with `Missing P1 proof artifact directories:
  output/stack-installer/p1-live/macos,
  output/stack-installer/p1-live/windows`.
- Current transfer-route evidence:
  `tailscale file get output/stack-installer/p1-live` fails with file access
  denied, and non-interactive `sudo -n tailscale set --operator=$USER` fails
  because sudo requires a password. Artifact intake via Taildrop therefore
  remains a user-side setup step before the coordinator can receive bundles.
  The Windows peer `<windows-proof-peer-magic-dns-name>` is reachable and exposes
  SMB port `445`, but anonymous `smbclient -L` share listing fails with
  `NT_STATUS_ACCESS_DENIED`; anonymous access to common `Users`, `Public`,
  `C$`, and `D$` share names also fails with `NT_STATUS_ACCESS_DENIED`. No SMB
  credential was available or guessed. The coordinator has no active SMB/CIFS
  mount, no obvious user-local Samba credential config, and no Tailscale SSH
  host keys advertised for the Windows peer. A title-only 1Password search for
  transfer-related Windows, SMB, CIFS, Taildrop, proof, stack-installer, macOS,
  and peer-host terms found no obvious Windows or SMB transfer credential; no
  secret fields were read. The current tailnet view does not show a macOS proof
  peer. Coordinator-side `tailscale file cp` cannot send the non-secret
  operator checklist to the Windows peer because Tailscale reports the peer is
  owned by a different user.
- Latest local transfer scan found no returned `stack-installer-p1-macos.tgz`
  or `stack-installer-p1-windows.zip` under Downloads, Desktop, Documents,
  Public, `/tmp`, YeeBois, mount, media, or GVFS paths. Recent `proof.json`
  hits were only temporary fixture paths under `/tmp`, not usable
  fresh-machine proof artifacts.

## Prompt-To-Artifact Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| P1A committed | `6a8655542f feat(stack-installer): add p1a runnable spine` | complete |
| P1 live validators implemented | `073e7deab8 feat(stack-installer): add p1 live proof harness`; live drivers under `packages/drivers/onepassword-cli`, `packages/drivers/ai-provider-cli`, and `packages/drivers/discord`; slice live contracts under installer dependency/security/provider/channel packages | complete |
| Tauri proof flow implemented | `apps/stack-installer/src-tauri/src/lib.rs` exposes `run_p1_manual_proof`; `apps/stack-installer/src/proof/run-p1-manual-proof.ts` exposes the Bun proof entrypoint | complete |
| Operator artifact capture implemented | `6ae84ddf99 feat(stack-installer): add p1 artifact capture`; `p1:proof:capture` writes `proof.json`, platform-specific `commands.txt`, and `sha256sums.txt` | complete |
| Operator handoff commands current | `ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md` includes Bash-compatible and native Windows PowerShell proof commands, artifact packaging commands, and coordinator-side extraction commands | complete |
| Per-platform artifact audit implemented | `p1:proof:audit` checks required files, checksum freshness, likely plaintext Discord token leaks in text artifacts, all validation events, configured providers, redacted credential references, and Discord message evidence | complete |
| Both-platform artifact audit implemented | `p1:proof:audit-all` checks macOS and Windows directories and target-platform parity | complete |
| Read-only artifact status implemented | `7923a2387a feat(stack-installer): report p1 proof artifact status`; `p1:proof:status` reports missing or incomplete macOS/Windows artifact directories without accepting them as proof | complete |
| Coordinator bundle intake implemented | `p1:proof:intake` extracts returned `stack-installer-p1-macos.tgz` and `stack-installer-p1-windows.zip` bundles when the corresponding platform directory is missing, then reports status without accepting missing proof as complete | complete |
| Coordinator watch implemented | `p1:proof:watch` runs bounded coordinator-side intake plus `p1:proof:audit-all` polling during transfer windows; the empty-inbox one-attempt check fails with missing artifact status instead of accepting incomplete proof. `start-proof-watch-window.mjs` starts the same watch as a detached private-log helper for longer transfer windows | complete |
| Detached proof-window status implemented | `proof-upload-status.mjs` verifies upload-window health, token-protected endpoints, private file modes, returned bundle presence, platform artifact status, and detached watcher state. It now parses watcher progress from `proof-watch.log` and reports pending, passed, or exhausted state plus remaining attempts and time estimate | complete |
| Upload-window smoke implemented | `initiatives/stack-installer/ops/proof-upload-smoke.mjs` spins up a temporary local upload window, verifies endpoint authentication, generated operator notes, file modes, token-reuse behavior, approved routes, invalid-token upload rejection, unsupported file-name rejection, approved macOS `PUT` and Windows `POST` storage, `/status` bundle reporting after upload, stored bundle file modes, and token-leak indicators, then cleans up | complete |
| Completion check implemented | `initiatives/stack-installer/ops/p1-completion-check.mjs` maps P1A evidence, P1 live harness evidence, active P1 target, P2 pending state, P2 untouched branch-diff evidence, returned bundles, platform proof directories, `p1:proof:audit-all`, and post-proof review status into a prompt-to-artifact checklist; current run exits nonzero because fresh artifacts and post-proof review are missing | complete, currently blocked |
| Targeted repo checks passed | Recorded in `p1-discord-vertical-manual.md`; latest post-audit refresh on 2026-05-14 re-ran the P1 live-harness turbo gate: `bun run turbo run check test lint --filter=@beep/stack-installer --filter=@beep/onepassword-cli --filter=@beep/discord --filter=@beep/ai-provider-cli --filter=@beep/installer-security-use-cases --filter=@beep/installer-security-server --filter=@beep/installer-providers-use-cases --filter=@beep/installer-providers-server --filter=@beep/installer-channels-use-cases --filter=@beep/installer-channels-server --filter=@beep/installer-dependencies-use-cases --filter=@beep/installer-dependencies-server --filter=@beep/installer-workspace-domain --filter=@beep/installer-workspace-use-cases`, with 66 tasks successful. The same evidence set includes `@beep/stack-installer` `check`, `lint`, `test`, `coverage`, and `build`, with 12 tests passing and coverage at 98.16% statements / 90.47% branches; `cargo check` in `apps/stack-installer/src-tauri`; `bun run config-sync:check`; `git diff --check`; manifest JSON validation; `p1:proof:status`; empty-inbox `p1:proof:intake`; empty-inbox one-attempt `p1:proof:watch` refusal; and a temporary `.tgz` plus `.zip` intake extraction smoke. Latest post-main-sync refresh after merging `origin/main` at `97636ab4ff` re-ran `bun run config-sync:check`, `@beep/stack-installer` `check`, `test`, `lint`, and `build`; `cargo check` in `apps/stack-installer/src-tauri`; and `git diff --check`, all passing. A later post-main-sync refresh re-ran the full P1 live-harness turbo gate across `@beep/stack-installer`, `@beep/onepassword-cli`, `@beep/discord`, `@beep/ai-provider-cli`, and the installer security/provider/channel/dependency/workspace packages with 66 successful tasks out of 66 | complete for implemented local surfaces |
| macOS fresh-machine proof artifacts recorded | Required files are `output/stack-installer/p1-live/macos/proof.json`, `screencast.*`, `commands.txt`, and `sha256sums.txt`; no files are currently present | missing |
| Windows fresh-machine proof artifacts recorded | Required files are `output/stack-installer/p1-live/windows/proof.json`, `screencast.*`, `commands.txt`, and `sha256sums.txt`; no files are currently present | missing |
| Sanitized proof JSON captured | Must be produced by each fresh-machine `p1:proof:capture` run and pass `p1:proof:audit-all`; no real fresh-machine proof JSON is present | missing |
| Discord test message evidence captured | Must appear in each proof JSON as a passed `discord-test-message` event with a message ID; no real fresh-machine proof JSON is present | missing |
| Initiative manifest updated | `ops/manifest.json` records P1 live harness, capture/audit commands, missing fresh proof, and pending P1C review | complete, still open |
| Initiative history updated | `p1-discord-vertical-manual.md` records P1A, live harness, capture/audit, current operator handoff commands, and remaining evidence; this audit records the current completion state | complete, still open |
| P1C quality review/fix loop completed | `p1-pr-readiness-review.md` exists but is pending; by design it must not start until macOS and Windows proof artifacts exist and are audited | missing |
| P2 AI Mode untouched | `p2-ai-mode-parity.md` and `HANDOFF_P2_AI_MODE.md` are pending stubs only. A latest `origin/main...HEAD` diff audit found no P2 runtime, AI Mode, MCP executor, or skill-bundle implementation beyond those planned packet stubs | complete |
| MCP/runtime work untouched beyond P1 Tauri bridge | Manifest still records MCP executor/skill generation as not built beyond minimal app-local Tauri bridge | complete |

## Required Commands For Final P1 Close

After operators produce both platform directories:

```bash
cd apps/stack-installer
bun run p1:proof:status -- --output-root ../../output/stack-installer/p1-live
bun run p1:proof:intake -- --output-root ../../output/stack-installer/p1-live
bun run p1:proof:watch -- --output-root ../../output/stack-installer/p1-live --watch-attempts 120 --watch-interval-ms 5000
bun run p1:proof:audit-all -- --output-root ../../output/stack-installer/p1-live
```

Then run the post-proof P1C review/fix loop:

```bash
bun run audit:github quality
```

Use `$quality-review-fix-loop` to produce
`history/outputs/p1-pr-readiness-review.md` with zero required blockers or
explicit waivers.

## Completion Decision

P1 and the active `/goal` must remain open.

Blocking requirements:

- macOS fresh-machine proof artifact directory is missing.
- Windows fresh-machine proof artifact directory is missing.
- Latest bounded coordinator watch found no returned proof bundles.
- Latest tailnet upload-window watch found no returned proof bundles.
- Latest post-token-rotation watch found no returned proof bundles.
- Latest ten-minute upload-window watch found no returned proof bundles.
- Latest upload status helper reports no returned bundles and missing platform
  directories.
- Latest upload status helper `--fail-on-missing` gate exits nonzero for the
  current incomplete proof state.
- Latest upload status helper confirms the detached watcher is alive, private,
  and still polling, but it has not found any returned proof bundles.
- Latest targeted local artifact sweep found no returned proof bundles; recent
  `proof.json` hits were temp fixtures only.
- `p1:proof:audit-all` has not run against real macOS and Windows artifacts.
- P1C `$quality-review-fix-loop` has not run after proof artifacts.

Do not mark the `/goal` complete until all blocking requirements are satisfied
with current repository evidence.
