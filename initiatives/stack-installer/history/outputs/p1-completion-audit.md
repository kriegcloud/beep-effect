# P1 Completion Audit

Status: blocked; not complete.

Audit date: 2026-05-14

This audit maps the active `/goal` objective to concrete repository evidence.
It is intentionally strict: substantial implementation work, green targeted
checks, and a complete manifest are not enough to close P1 unless every
required artifact and gate below has direct evidence.

## Objective Restated

Complete Stack Installer P1 live Manual Mode proof from the current P1A branch
without stopping until:

- P1A is committed.
- P1 live validators and Tauri proof flow are implemented.
- targeted repo checks pass.
- macOS and Windows user-operated fresh-machine proof artifacts are recorded.
- initiative manifest and history are updated.
- P2 AI Mode, MCP runtime, recovery, portability, signing, and distribution
  work remain untouched.

## Current Checkout Evidence

- Branch: `feat/stack-installer-p1-live`
- Latest branch evidence includes the detached proof-window status update,
  which keeps `initiatives/stack-installer/ops/proof-upload-status.mjs` as the
  single coordinator command for upload server health, private-file modes,
  returned bundle presence, platform artifact status, and detached watcher
  state.
- Earlier branch evidence includes `76e62e1d0c docs(stack-installer): add
  proof watch starter`, which adds the detached coordinator watch starter at
  `initiatives/stack-installer/ops/start-proof-watch-window.mjs` and documents
  its private `proof-watch.log`, `proof-watch.pid`, and
  `proof-watch-command.txt` outputs under the ignored proof inbox.
- Earlier branch evidence includes `91fa8041a5 docs(stack-installer):
  advertise upload aliases`, which lets the upload-window starter emit both
  raw tailnet and MagicDNS operator URLs without rotating the live upload token.
- Earlier branch evidence includes `d93e83320b chore: merge origin main into
  stack installer p1`, which syncs the branch with `origin/main` at
  `97636ab4ff`, keeps both the `opip-web-launch` and `stack-installer`
  initiative index entries, and keeps both the Stack Installer TypeScript path
  aliases plus main's `@beep/ui/themes/theme-init-script` alias.
- Earlier branch evidence includes `57d518069f docs(stack-installer): record
  upload route blockers`, which records the verified MagicDNS upload endpoint,
  the absence of `PUT` or `POST` upload attempts, and the Taildrop peer
  ownership blocker for coordinator-side sends to the Windows peer.
- Earlier branch evidence includes `2475433ad0 docs(stack-installer): tighten
  pr readiness review gate`, which records the stricter post-proof requirement
  to run `$quality-review-fix-loop` across the whole implemented P1 initiative
  surface and directly affected code paths, including reuse opportunities,
  structural simplification, flat idiomatic modules, and repo-law alignment.
- Earlier branch evidence includes `0e95b717ce test(stack-installer): cover
  desktop proof flow`, `7c8ccac126 test(stack-installer): cover p1 proof
  artifact helpers`, `61c9a94f1c feat(stack-installer): surface proof bundle
  extraction`, and `7923a2387a feat(stack-installer): report p1 proof artifact
  status`.
- Relevant audit evidence lives on the pushed branch in
  `apps/stack-installer/src/proof/capture-p1-manual-proof.ts`,
  `ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md`, and this completion audit
  output.
- Base evidence after `git fetch origin main`: `origin/main` at `97636ab4ff`
  and current branch `HEAD` at `76e62e1d0c`.
- Worktree status before this audit update: clean and even with
  `origin/feat/stack-installer-p1-live`.
- Latest post-main-sync verification:
  `bun run config-sync:check`, `bun run --filter @beep/stack-installer check`,
  `bun run --filter @beep/stack-installer test`,
  `bun run --filter @beep/stack-installer lint`,
  `bun run --filter @beep/stack-installer build`, `cargo check` in
  `apps/stack-installer/src-tauri`, and `git diff --check` all pass after the
  merge. `bun run --filter @beep/stack-installer p1:proof:audit-all --
  --output-root output/stack-installer/p1-live` still fails only because the
  real `macos` and `windows` proof artifact directories are missing.
- Local artifact scan before this audit update:
  `output/stack-installer/p1-live` exists, but the required `macos` and
  `windows` platform directories are missing.
- Current read-only artifact status:
  `bun run --filter @beep/stack-installer p1:proof:status` exits successfully
  and reports the `macos` and `windows` platform directories as missing. When
  returned `stack-installer-p1-*.tgz` or `.zip` bundles are present at the
  output root, the same status command prints the extraction command before the
  final audit gate.
- Current artifact intake status:
  `bun run --filter @beep/stack-installer p1:proof:intake` exits successfully
  against the empty output root, reports that no returned bundles are present,
  and prints the same missing-directory status. When returned platform bundles
  are present, this command extracts them before the final audit gate. A
  temporary coordinator smoke verified extraction of both
  `stack-installer-p1-macos.tgz` and `stack-installer-p1-windows.zip` into the
  required platform directories.
- Current artifact watch status:
  `cd apps/stack-installer && bun run p1:proof:watch -- --watch-attempts 1 --watch-interval-ms 1`
  fails as expected against the empty output root, printing the same missing
  macOS and Windows directory status. The watch helper is a bounded polling
  convenience for transfer windows, not a proof substitute.
- Current detached proof-watch state:
  `node initiatives/stack-installer/ops/start-proof-watch-window.mjs
  --output-root output/stack-installer/p1-live --watch-attempts 1440
  --watch-interval-ms 5000 --replace-existing` starts a detached
  coordinator-side `p1:proof:watch` process with private `0600`
  `proof-watch.log`, `proof-watch.pid`, and `proof-watch-command.txt` files.
  The current detached watcher is alive and polling the proof inbox, but has
  not found any returned bundles or platform artifact directories.
- Latest coordinator wait:
  `bun run --filter @beep/stack-installer p1:proof:watch -- --watch-attempts 6 --watch-interval-ms 5000`
  exhausted all attempts without finding returned bundles and ended with the
  same missing `macos` and `windows` platform directories.
- Latest upload-window wait:
  after starting a temporary ignored tailnet upload endpoint at
  `http://100.117.213.114:8765`, the coordinator ran
  `bun run --filter @beep/stack-installer p1:proof:watch -- --watch-attempts 24 --watch-interval-ms 5000`.
  The endpoint health check passed, invalid tokens returned `403`, and the
  watch exhausted without returned bundles. The tokenized operator commands
  live only in ignored `output/stack-installer/p1-live/proof-upload-commands.txt`
  and are not committed.
- Current upload fallback state:
  the live upload endpoint now runs from committed
  `initiatives/stack-installer/ops/proof-upload-server.mjs` on
  `http://100.117.213.114:8765`. The helper now prefers
  `Authorization: Bearer ...` upload tokens so the token does not need to
  appear in upload URLs. The current private one-time token is rotated into
  ignored `output/stack-installer/p1-live/proof-upload-token.txt` with `0600`
  permissions, and the ignored command file no longer embeds a token. Health
  checks pass, invalid-token requests return `403`, and upload logs redact
  tokens. No operator upload has hit the endpoint yet. The same live endpoint
  has also been verified through MagicDNS at
  `http://dankputer.tailc7c348.ts.net:8765/health`.
- Current upload-window starter:
  committed `initiatives/stack-installer/ops/start-proof-upload-window.mjs`
  now performs the coordinator setup: token rotation, `0600` token/command/PID
  files, detached server start, and endpoint/log path reporting without
  printing the token. The live endpoint was restarted through this helper and
  remains healthy.
- Current remote upload status endpoint:
  committed `initiatives/stack-installer/ops/proof-upload-server.mjs` exposes a
  token-protected `GET /status` endpoint for proof machines to confirm what the
  coordinator has received without SSH access. Latest authenticated `/status`
  reports both returned bundles as `false` and both platform directories as
  missing.
- Current upload-window status helper:
  committed `initiatives/stack-installer/ops/proof-upload-status.mjs` reports
  upload endpoint health, PID/running state, private file modes,
  token-like-text indicators in logs/commands, returned bundle presence,
  platform artifact status, recent redacted upload log lines, detached watcher
  PID/running state, detached watcher file modes, detached watcher completion
  indicator, detached watcher token-like-text indicator, and recent watcher log
  lines in one command. Latest status reports health `200 ok`, upload PID
  `1007771` running, token/commands/PID file modes `600`, no token-like text in
  upload logs or commands, detached watcher PID `1078319` running, detached
  watcher file modes `600`, no token-like text in watcher logs or command file,
  both returned bundles missing, and both `macos` and `windows` platform
  directories missing. With `--fail-on-missing`, the same helper exits `1` for
  the current state, which gives coordinator polling a machine-readable
  incomplete-proof gate while still proving the proof window itself is alive.
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
  The Windows peer `desktop-m5ap41u.tailc7c348.ts.net` is reachable and exposes
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
