# P1A Runnable Dry-Run Spine

Status: completed.

P1A proves the package/app spine without live installation behavior. It is not
full P1 completion.

## Implemented Surfaces

- `apps/stack-installer` as `@beep/stack-installer`
- minimal Tauri 2 bridge under `apps/stack-installer/src-tauri`
- React/Vite web shell using `@beep/ui/styles/globals.css`,
  `AppThemeProvider`, `@beep/ui` components, and Phosphor icons
- shared `OnePasswordReference` in `@beep/shared-domain`
- `packages/installer-dependencies/{domain,use-cases,server}`
- `packages/installer-security/{domain,use-cases,server}`
- `packages/installer-providers/{domain,use-cases,server}`
- `packages/installer-channels/{domain,use-cases,server}`
- `packages/installer-workspace/{domain,use-cases,server}`

## Boundary Decisions Proven

- P1A is dry-run-only. No live package manager, Discord, provider, or OS
  credential commands execute.
- Credential inputs are 1Password references only. Plaintext secrets are not
  representable by the shared credential value object.
- Claude and Codex are both represented in provider fixtures.
- Discord is the only v1 channel represented.
- Verb contracts are owned by their slices and composed by the app in
  `apps/stack-installer/src/dry-run-registry.ts`.
- `installer-workspace` owns `AIStackManifest`, `ValidationEvent`, and
  `P1aDryRunSnapshot`.
- `installer-runtime` remains deferred to P2.

## Evidence

- Type/package proof: targeted `turbo run check` over `@beep/shared-domain`,
  `@beep/identity`, all P1 installer packages, and `@beep/stack-installer`.
- Runtime test proof: targeted `turbo run test` over the same package set.
- Lint proof: targeted `turbo run lint` over the same package set.
- Type-test proof: targeted TSTyche runs for `OnePasswordReference` and
  `Identity`.
- Generated config proof: `bun run config-sync:check`.
- Web-shell build: `bun run build` in `apps/stack-installer`.
- Browser proof: Playwright snapshot and full-page screenshot against
  `http://127.0.0.1:4177/`.
- Screenshot artifact:
  `output/playwright/stack-installer-p1a/workbench.png` (PNG, 1280x1145).
- Browser console proof: clean of errors after favicon fix; only React
  DevTools info remained.

## Remaining P1 Work

- Fresh macOS Manual Mode run and screencast.
- Fresh Windows Manual Mode run and screencast.
- Real 1Password reference validation using the local CLI after approval.
- Real provider auth validation after approval.
- Real Discord bot/channel liveness and test message after approval.
- Sanitized manifest captured from a live run.
