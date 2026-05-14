# Stack Installer Plan

This plan executes [SPEC.md](./SPEC.md). P0 is complete. P1 is the active
target: Discord vertical, Manual Mode. P1A is complete as a runnable dry-run
checkpoint; full P1 still requires fresh-OS live proof.

## P0: Initiative Bootstrap

Status: completed

Goal: Create the initiative packet, archive the bootstrap handoff, capture the
locked decisions and P0 doc-grill amendments, name the corrected installer
slice topology, and point the manifest at P1.

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

Status: in progress; P1A dry-run runnable spine complete, fresh-OS live
Discord proof pending

Goal: Prove the smallest end-to-end v1 path without AI Mode: provider auth,
1Password, Discord bot/channel setup, manifest creation, validation, and a
test message on fresh macOS and Windows machines.

### P1A: Runnable Dry-Run Spine

Status: completed

Goal: prove the package and app spine before live installers exist. This is a
P1 checkpoint, not the full P1 exit.

Exit Criteria:

- [x] Shared `OnePasswordReference` value object exists in `@beep/shared-domain`.
- [x] P1 installer slices exist for dependencies, security, providers,
  channels, and workspace with domain/use-cases/server role packages.
- [x] Slice-owned dry-run verb contracts exist and are composed by
  `apps/stack-installer`, not by a God Layer.
- [x] `installer-workspace` owns `AIStackManifest`, validation events, and the
  deterministic P1A dry-run snapshot.
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

Exit Criteria:

- [ ] macOS fresh-OS screencast recorded.
- [ ] Windows fresh-OS screencast recorded.
- [ ] Sanitized manifest captured.
- [ ] Discord test message evidence captured.
- [ ] CI green for every implemented vertical verb package.

Required Outputs:

- `history/outputs/p1-discord-vertical-manual.md`
- `history/outputs/p1a-runnable-spine.md` for the completed dry-run checkpoint

Required Checks:

- P1A: targeted installer/app `check`, `test`, `lint`, and web build
- placeholder: fresh-OS smoke wrapper for macOS and Windows
- placeholder: live Discord test message proof

Stop Conditions:

- Do not credit P1 without both OS proofs.
- Do not include AI Mode evidence as a substitute for Manual Mode.
- Do not accept any verb that handles plaintext credentials.

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
