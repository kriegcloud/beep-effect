# P1 Discord Vertical, Manual Mode

Status: in progress.

P1A dry-run runnable spine is complete and recorded in
[`p1a-runnable-spine.md`](./p1a-runnable-spine.md). Full P1 remains pending
because fresh-OS macOS and Windows Manual Mode Discord proofs have not been
run.

Completed P1A evidence:

- Tauri 2 + React shell at `apps/stack-installer`
- shared `OnePasswordReference` in `@beep/shared-domain`
- P1 installer slices for dependencies, security, providers, channels, and
  workspace
- deterministic `AIStackManifest` snapshot and validation event model in
  `@beep/installer-workspace-domain`
- slice-owned dry-run verb contracts composed by the app
- web-shell screenshot at `output/playwright/stack-installer-p1a/workbench.png`

Remaining full-P1 evidence:

- macOS fresh-OS screencast
- Windows fresh-OS screencast
- sanitized manifest
- Discord test message proof
- CI output for implemented vertical verbs
