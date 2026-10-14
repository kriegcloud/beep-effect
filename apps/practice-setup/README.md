# @beep/practice-setup

Windows bootstrapper: installs Claude Desktop and the practice gateway, then opens Claude to start onboarding.

`practice-setup.exe` is unsigned until `practice-gateway-signed-release` (D11), so
SmartScreen warns on first run. It stays dumb: install, open, wait, hand off.

| Step | What it does | Lawyer does |
| --- | --- | --- |
| `claude-desktop` | Skips when Claude Desktop is installed (per-user or MSIX); otherwise downloads the pinned per-user installer, checks its SHA-256, runs it with `--silent`, and waits for the install. | nothing |
| `claude-sign-in` | Opens `claude://claude.ai/new`. | signs in, presses Enter |
| `gateway-extension` | Copies the embedded `practice-gateway.mcpb` to `%LOCALAPPDATA%\beep\practice-setup` and opens it, which shows Claude's install dialog. | clicks Install, presses Enter |
| `onboarding-handoff` | Opens a new chat with the onboarding message prefilled. | presses Send |

Each run writes `%LOCALAPPDATA%\beep\practice-setup\last-run.json` (a `SetupReport`).
The pinned installer comes from the `Anthropic.Claude` winget manifest; the sources are
in `goals/practice-gateway/research/onboarding-distribution.md`.

## Build

```bash
bun run --cwd apps/practice-gateway package:mcpb:windows
bun run --cwd apps/practice-setup package:windows --bundle ../practice-gateway/dist/mcpb/practice-gateway-windows-x64.mcpb
```

The second command writes `apps/practice-setup/dist/practice-setup.exe` with the bundle
embedded. Without an embedded bundle, the executable looks for `practice-gateway.mcpb`
beside itself.

## Development

```bash
bun run check
bun run test
bun run lint
```

This workspace is a runtime app, not a public TypeScript package. Keep app internals behind `@/*`; promote reusable contracts and domain code to slice or shared packages.

## License

MIT
