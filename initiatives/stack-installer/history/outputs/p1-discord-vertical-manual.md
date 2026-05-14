# P1 Discord Vertical, Manual Mode

Status: in progress; live harness implemented, fresh-OS proof pending.

P1A dry-run runnable spine is complete and recorded in
[`p1a-runnable-spine.md`](./p1a-runnable-spine.md). Full P1 remains pending
because fresh-OS macOS and Windows Manual Mode Discord proofs have not been
run. After those artifacts exist, P1 also requires a PR readiness review/fix
loop over the full implemented initiative surface before the branch is called
ready for review.

Completed P1A evidence:

- Tauri 2 + React shell at `apps/stack-installer`
- shared `OnePasswordReference` in `@beep/shared-domain`
- P1 installer slices for dependencies, security, providers, channels, and
  workspace
- deterministic `AIStackManifest` snapshot and validation event model in
  `@beep/installer-workspace-domain`
- slice-owned dry-run verb contracts composed by the app
- web-shell screenshot at `output/playwright/stack-installer-p1a/workbench.png`

Completed P1 live harness evidence:

- `@beep/onepassword-cli` driver validates and reads only `op://...`
  references, returning resolved values as `Redacted<string>`.
- `@beep/ai-provider-cli` driver probes local Claude and Codex subscription
  session status with non-interactive CLI status commands.
- `@beep/discord` driver validates a Discord channel and sends the P1 test
  message using a redacted bot token.
- Installer slice use-cases expose live validation contracts for required
  host commands, secret references, provider auth, and Discord channel
  liveness.
- `apps/stack-installer/src/proof/P1ManualProof.ts` composes the slice-owned
  live contracts into an app-local Manual Mode proof harness.
- `apps/stack-installer/src/proof/run-p1-manual-proof.ts` exposes the proof
  harness as `bun run p1:proof -- --request-json ...`.
- `apps/stack-installer/src/proof/capture-p1-manual-proof.ts` wraps the proof
  harness for operators and writes `proof.json`, `commands.txt`, and
  `sha256sums.txt` into the fresh-machine artifact directory. The same
  entrypoint reports read-only artifact status and audits required files,
  checksum freshness, all validation events, configured Claude/Codex providers,
  redacted credential references, Discord message evidence, and both required
  platform directories.
- `apps/stack-installer/src/proof/P1ProofCommands.ts` keeps the generated
  `commands.txt` transcript platform-specific: Bash-compatible commands for
  macOS/Git Bash/WSL and PowerShell commands for native Windows.
- `apps/stack-installer/src-tauri/src/lib.rs` exposes the Tauri command
  `run_p1_manual_proof` and keeps the app-local runtime composition under
  `apps/stack-installer`.
- `ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md` includes Bash-compatible and
  native Windows PowerShell operator commands, plus artifact packaging and
  coordinator-side extraction commands for the P1 evidence inbox.
- The React workbench has a P1 live form and rejects plaintext Discord bot
  tokens before invoking the desktop proof command.
- Tauri compile prerequisites are present: `Cargo.lock` and
  `src-tauri/icons/icon.png`.

Current local command evidence from 2026-05-14:

- `bun run turbo run check test lint --filter=@beep/stack-installer ...`
  completed 66 tasks successfully across the app, live drivers, and touched
  installer slices.
- `bun run config-sync:check` reported no drift after generated package
  references and docgen metadata were applied.
- `cd apps/stack-installer && bun run build` passed. Vite emitted only the
  existing large-chunk warning.
- `cd apps/stack-installer/src-tauri && cargo check` passed.
- After the operator-handoff docs were made platform-specific,
  `bun run turbo run check test lint --filter=@beep/stack-installer`
  completed 53 tasks successfully.
- After adding the read-only proof artifact status helper,
  `bun run --filter @beep/stack-installer check`, `lint`, `test`,
  `bun run config-sync:check`, `jq . initiatives/stack-installer/ops/manifest.json`,
  `git diff --check`, and
  `bun run --filter @beep/stack-installer p1:proof:status` passed. The status
  helper correctly reports the macOS and Windows artifact directories as
  missing until real fresh-machine artifacts are returned, and prints the
  coordinator-side `tar` or `unzip` extraction command when returned platform
  bundles are present at the proof output root.

Remaining full-P1 evidence:

- macOS fresh-OS screencast
- Windows fresh-OS screencast
- sanitized macOS proof JSON from `P1ManualProofResult`
- sanitized Windows proof JSON from `P1ManualProofResult`
- Discord test message proof on each target
- CI or reviewer-visible command output for implemented vertical packages
- post-proof `$quality-review-fix-loop` record with zero required blockers or
  explicit waivers

Full P1 is not complete until both user-operated fresh-machine runs produce
those artifacts and the post-proof PR readiness review closes. P2 AI Mode, MCP
execution, recovery, portability, signing, and distribution remain untouched by
this phase.
