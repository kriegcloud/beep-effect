# Stack Installer Plan

This plan executes [SPEC.md](./SPEC.md). P0 is complete. P1 remains open:
Discord vertical, Manual Mode. P1A is complete as a runnable dry-run
checkpoint. The P1 live harness is implemented. macOS proof is complete and
audited. Windows proof is still missing and remains explicit open P1 debt.
P1C is complete. P1D is now the active next execution lane on Linux while full
P1 still requires the real Windows proof artifact.

## P0: Initiative Bootstrap

Status: completed

Goal: Create the initiative packet, archive the bootstrap handoff, capture the
locked decisions and P0 doc-grill amendments, name the then-current installer
slice topology, and point the manifest at P1. The pre-v1 topology correction
to one installer slice is recorded later as a history output and architecture
decision.

Exit Criteria:

- [x] `README.md`, `SPEC.md`, `PLAN.md`, `ops/manifest.json`, handoffs,
  history outputs, and research stubs exist.
- [x] `history/outputs/p0-current-state.md` records the 18 locked decisions,
  the P0 amendments, and the dependency inventory.
- [x] `ops/manifest.json` sets `currentTargetPhase` to `P1` and marks P0
  completed.

Required Outputs:

- `history/outputs/p0-current-state.md`
- `ops/handoffs/HANDOFF_P0_BOOTSTRAP.md`

Required Checks:

- `jq . initiatives/stack-installer/ops/manifest.json`
- `rg -n "P0|P1|P2|P3|P4|P5" initiatives/stack-installer`
- read `README.md`, `SPEC.md`, `PLAN.md`, and manifest in order

Stop Conditions:

- Do not start Tauri, verb registry, MCP executor, skill bundle, or product
  code implementation.
- Do not credit P0 unless the root-level handoff orphan is archived under
  `ops/handoffs/`.

## P1: Discord Vertical, Manual Mode

Status: in progress; P1A dry-run runnable spine complete, P1 live harness
implemented, macOS proof complete, Windows proof temporarily waived for P1C
start only, full P1 closure still pending

Goal: Prove the smallest end-to-end v1 path without AI Mode: provider auth,
1Password, Discord bot/channel setup, manifest creation, validation, and a
test message on fresh macOS and Windows machines.

### P1A: Runnable Dry-Run Spine

Status: completed

Goal: prove the package and app spine before live installers exist. This is a
P1 checkpoint, not the full P1 exit.

Exit Criteria:

- [x] Shared `OnePasswordReference` value object exists in `@beep/shared-domain`.
- [x] P1 installer slice role packages exist at
  `packages/installer/{domain,use-cases,server}`.
- [x] Slice-owned dry-run verb contracts exist and are composed by
  `apps/stack-installer`, not by a God Layer.
- [x] `@beep/installer-domain` owns `AIStackManifest`, validation events, and
  the deterministic P1A dry-run snapshot.
- [x] `apps/stack-installer` exists as a Tauri 2 + React shell using
  `@beep/ui/styles/globals.css` and `AppThemeProvider`.
- [x] Web-shell proof captured with Playwright.

Required Outputs:

- `history/outputs/p1a-runnable-spine.md`
- `output/playwright/stack-installer-p1a/workbench.png`

Required Checks:

- targeted `turbo run check` over `@beep/shared-domain`, `@beep/identity`,
  installer packages, and `@beep/stack-installer`
- targeted `turbo run test` over the same package set
- targeted `turbo run lint` over the same package set
- `bun run build` in `apps/stack-installer`
- Playwright snapshot and screenshot against the Vite web shell

Stop Conditions:

- Do not credit P1A if any dry-run path executes live install commands.
- Do not credit P1A if any credential surface accepts plaintext secrets.
- Do not credit full P1 until fresh macOS and Windows Manual Mode Discord
  proofs exist.

### P1B: Live Manual Proof Harness

Status: implemented; fresh-machine operation pending

Goal: compose live validators for host commands, 1Password references, Claude
and Codex auth status, and Discord channel liveness without implementing AI
Mode or automatic installers.

Exit Criteria:

- [x] `@beep/onepassword-cli` validates and reads 1Password references without
  exposing plaintext secrets.
- [x] `@beep/ai-provider-cli` validates local Claude and Codex auth status.
- [x] `@beep/discord` validates the Discord channel and sends the proof
  message.
- [x] Installer slices expose live validation contracts owned by their
  respective packages.
- [x] `apps/stack-installer` composes live validation contracts in app-local
  runtime code.
- [x] Tauri exposes `run_p1_manual_proof`.
- [x] `apps/stack-installer` exposes `p1:proof:capture` and
  `p1:proof:checksums` for fresh-machine artifact capture.
- [x] `apps/stack-installer` exposes `p1:proof:audit` for local proof artifact
  completeness and checksum validation.
- [x] `apps/stack-installer` exposes `p1:proof:audit-all` for both required
  P1 platform artifact directories.
- [x] `apps/stack-installer` exposes `p1:proof:intake` for coordinator-side
  extraction of returned platform bundles before final audit.
- [x] `apps/stack-installer` exposes `p1:proof:watch` for bounded coordinator
  polling during artifact transfer windows.
- [x] App UI rejects plaintext Discord bot tokens before invoking Tauri.
- [x] Focused package/app check, test, lint, app build, config-sync check, and
  Tauri `cargo check` pass locally.

Required Outputs:

- `history/outputs/p1-discord-vertical-manual.md`
- `ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md`
- `research/1password-cli-integration.md`
- `research/discord-oauth-and-bot-setup.md`
- `research/claude-code-codex-capability-matrix.md`

Stop Conditions:

- Do not credit full P1 without both fresh-machine proof artifacts.
- Do not broaden this phase into AI Mode, MCP execution, recovery, portability,
  signing, or distribution.
- Do not accept or record plaintext credentials.

### P1C: PR Readiness Review And Fix Loop

Status: completed under sequencing-only temporary Windows missing-proof waiver

Goal: review the whole implemented P1 initiative surface and directly affected
code paths before the PR is called ready. The review uses
`$quality-review-fix-loop` and includes the changed initiative packet, app,
drivers, installer slice contracts, tests, package manifests, and Tauri proof
flow.

Exit Criteria:

- [x] Audited macOS proof artifact exists before the review starts.
- [x] Audited Windows proof artifact exists, or an explicit temporary Windows
  missing-proof waiver is recorded for P1C start.
- [x] Baseline quality commands are green on the current branch.
- [x] Reviewer panel covers quality gates, architecture boundaries, schema and
  domain models, Effect laws, error boundaries, tests, observability,
  documentation/API, reuse/duplication, and evolution/deprecation.
- [x] Reuse opportunities are checked against existing repo modules before new
  abstractions are introduced.
- [x] Any structural improvements keep modules flat, idiomatic, and aligned
  with repo laws and package boundaries.
- [x] Required blockers are fixed, or every remaining blocker has an explicit
  waiver record.
- [x] Final review round reports zero required blockers or only accepted
  waivers.

Required Outputs:

- `history/outputs/p1-pr-readiness-review.md`
- local closure commits for any fixes produced by the loop

Required Checks:

- `bun run audit:github quality`
- targeted package/app commands for any review fixes
- fresh `git diff --name-status origin/main...HEAD`
- reviewer inventory with blocker, waiver, and backlog disposition

Stop Conditions:

- Do not start P1C before the audited macOS proof artifact exists.
- Do not treat a Windows missing-proof waiver as Windows success or as full P1
  closure evidence.
- Do not route vague reuse findings into generic `common`, `core`, `utils`, or
  `lib` packages.
- Do not call the PR ready while baseline quality is red or required blockers
  remain unwaived.
- Do not use P1C as an entry point for P2 AI Mode, MCP runtime, recovery,
  portability, signing, or distribution.

Full P1 Exit Criteria:

- [ ] macOS fresh-OS screencast recorded.
- [ ] Windows fresh-OS screencast recorded.
- [ ] Sanitized manifest captured.
- [ ] Discord test message evidence captured.
- [ ] CI green for every implemented vertical verb package.
- [ ] P1 PR readiness review/fix loop completed with zero required blockers or
  explicit waivers.

Required Outputs:

- `history/outputs/p1-discord-vertical-manual.md`
- `history/outputs/p1a-runnable-spine.md` for the completed dry-run checkpoint
- `history/outputs/p1-pr-readiness-review.md`

Required Checks:

- P1A: targeted installer/app `check`, `test`, `lint`, and web build
- P1B: targeted app, driver, and installer package `check`, `test`, and
  `lint`
- P1B: `bun run config-sync:check`
- P1B: `cd apps/stack-installer && bun run build`
- P1B: `cd apps/stack-installer/src-tauri && cargo check`
- P1B: `cd apps/stack-installer && bun run p1:proof:checksums -- --platform <macos|windows>`
- P1B: `cd apps/stack-installer && bun run p1:proof:audit -- --platform <macos|windows>`
- P1B: `cd apps/stack-installer && bun run p1:proof:intake -- --output-root <artifact-root>`
- P1B: `cd apps/stack-installer && bun run p1:proof:watch -- --output-root <artifact-root>`
- P1B: `cd apps/stack-installer && bun run p1:proof:status -- --output-root <artifact-root>`
- P1B: `cd apps/stack-installer && bun run p1:proof:audit-all -- --output-root <artifact-root>`
- placeholder: fresh-OS smoke wrapper for macOS and Windows
- placeholder: live Discord test message proof
- placeholder: post-proof `$quality-review-fix-loop` closure record

Stop Conditions:

- Do not credit P1 without both OS proofs.
- Do not credit P1 without the post-proof PR readiness review/fix loop.
- Do not include AI Mode evidence as a substitute for Manual Mode.
- Do not accept any verb that handles plaintext credentials.

## P1D: App-First Manual Installer UX

Status: active next execution lane; implementation proceeds on the dedicated
P1D branch/worktree while full P1 remains open on the missing Windows proof

Goal: move the next meaningful milestone from proof-harness confidence to
product confidence by making the Tauri app the primary operator surface and
having it complete one real dependency repair action.

Scope notes:

- Stage this milestone on Linux first so the next proof loop can run locally.
- Keep macOS and Windows as the long-term parity target; Linux-first staging
  does not change the v1 parity doctrine.
- The first real action is repair-only Bun upgrade for an existing Bun install
  owned by the installer slice, not app-local glue code.
- The required Bun version is an installer-owned contract. App workflow code
  must not read repo metadata directly to discover it. A separate config
  package stays deferred until real installer config exists.

Exit Criteria:

- [ ] `apps/stack-installer` opens as the primary surface for this milestone.
- [ ] The app detects Bun unhealthy and presents a typed repair action for an
  existing Bun install.
- [ ] The action is approval-first and mutates the host only after explicit
  user approval.
- [ ] `@beep/installer-use-cases` and `@beep/installer-server` own the live Bun
  repair contract and server implementation.
- [ ] `@beep/installer-domain` owns the required Bun version contract and its
  live resolution without creating a config package before real installer
  config exists.
- [ ] After the action runs, the same validation spine reports Bun as present
  or returns a typed failure with visible status.
- [ ] Linux-first proof artifacts show the app-first Bun flow end to end.

Required Outputs:

- `history/outputs/p1d-app-first-manual-installer-ux.md`
- `ops/handoffs/HANDOFF_P1D_APP_FIRST_MANUAL_INSTALLER_UX.md`

Required Checks:

- targeted package/app `check`, `test`, and `lint` for the touched installer
  slices and app
- `bun run config-sync:check`
- `cd apps/stack-installer && bun run build`
- `cd apps/stack-installer/src-tauri && cargo check`
- Linux-first app-driven Bun repair proof capture and audit

Stop Conditions:

- Do not start P2 before both P1D closes and the real Windows proof audit
  closes the remaining P1 debt.
- Do not hide the real dependency mutation in shell scripts owned outside the
  installer slice boundary.
- Do not broaden this milestone into first-time Bun bootstrap.
- Do not add plaintext credential handling or broaden this milestone into AI
  Mode, MCP runtime, recovery, portability, signing, or distribution.

## P2: AI Mode Parity

Status: pending

Goal: Run the P1 flow with AI Mode enabled across Claude and Codex while
proving both providers share one manifest, one validation spine, and one user
approval model.

Exit Criteria:

- [ ] Claude AI Mode screencast recorded.
- [ ] Codex AI Mode screencast recorded.
- [ ] Structured action logs captured.
- [ ] Byte-identical-manifest gate passes modulo timestamps against P1.
- [ ] Skill/instruction bundles and app-local MCP executor adapter are wired.

Required Outputs:

- `history/outputs/p2-ai-mode-parity.md`

Required Checks:

- placeholder: provider adapter contract tests
- placeholder: manifest parity diff gate
- placeholder: MCP executor adapter smoke
- placeholder: generated skill/instruction bundle snapshot checks

Stop Conditions:

- Do not credit P2 if Claude and Codex diverge in user-facing flow.
- Do not credit P2 if AI Mode writes a different manifest shape than Manual
  Mode.
- Do not move the MCP executor into a generic tooling God Layer.

## P3: Recovery

Status: pending

Goal: Prove AI Mode can diagnose and repair salted broken states while keeping
the user in approval-first control.

Exit Criteria:

- [ ] Wrong Node version scenario repaired.
- [ ] Discord bot exists but token invalid scenario repaired.
- [ ] Missing 1Password reference scenario repaired.
- [ ] Screencast per scenario recorded.
- [ ] Before/after validator output captured.

Required Outputs:

- `history/outputs/p3-recovery.md`

Required Checks:

- placeholder: salted-machine setup scripts
- placeholder: validator before/after snapshots
- placeholder: recovery action-log assertions

Stop Conditions:

- Do not credit P3 if repair depends on hidden manual terminal commands.
- Do not credit P3 if an `Indeterminate` validator result is treated as
  failure.

## P4: Portability

Status: pending

Goal: Prove an exported manifest can move across machines and OS boundaries
without re-running setup when the target machine already satisfies the
manifest intent.

Exit Criteria:

- [ ] Machine A manifest export captured.
- [ ] Machine B import captured.
- [ ] Cross-OS path uses macOS export and Windows-WSL import.
- [ ] Full validator suite green on B without re-running setup.
- [ ] Paired manifests and validator logs captured.

Required Outputs:

- `history/outputs/p4-portability.md`

Required Checks:

- placeholder: manifest export/import schema tests
- placeholder: paired manifest normalization gate
- placeholder: Machine B validator suite

Stop Conditions:

- Do not credit P4 if import silently mutates credential values.
- Do not credit P4 if setup is re-run instead of validation proving existing
  state.

## P5: Distribution Readiness

Status: pending

Goal: Turn the proven installer into a distributable v1 desktop product for
macOS and Windows.

Exit Criteria:

- [ ] macOS signed and notarized binary produced.
- [ ] Windows code-signed binary produced.
- [ ] Auto-update mechanism wired.
- [ ] Telemetry opt-in respected.
- [ ] Crash reporting functional.
- [ ] Feedback channel functional.
- [ ] CI builds both targets.

Required Outputs:

- `history/outputs/p5-distribution-readiness.md`

Required Checks:

- placeholder: Tauri macOS signing and notarization verification
- placeholder: Windows code-signing verification
- placeholder: auto-update smoke
- placeholder: telemetry opt-in assertion
- placeholder: crash-reporting smoke
- placeholder: target CI build matrix

Stop Conditions:

- Do not credit P5 with unsigned binaries.
- Do not enable telemetry by default.
- Do not hide crash reporting or feedback failures behind manual release
  notes.

## Required Checks

Repo-wide gates once code exists:

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run config-sync`

Initiative-specific gates once packages exist:

- installer slice package `check`, `test`, `lint`, and `docgen`
- app package `check`, `test`, `lint`, and Tauri build checks
- manifest schema decode/encode and normalization checks
- validator liveness smoke checks
- fresh-OS smoke wrappers for macOS and Windows
- signing, notarization, and Windows code-signing verification
- byte-identical-manifest parity gate modulo timestamps
