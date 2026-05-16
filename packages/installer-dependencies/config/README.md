# @beep/installer-dependencies-config

Typed configuration contracts for the installer-dependencies slice.

This package owns the required Bun-version contract for the P1D app-first
repair milestone. It provides the typed server contract plus runtime-only layer
helpers that resolve the live value from repo metadata.

## Belongs Here

- Installer-owned configuration contracts for dependency validation and repair.
- Server/runtime-only config resolution helpers for those contracts.
- Test config layers for installer dependency workflows.

## Does Not Belong Here

- Product behavior or repair workflows.
- Driver process execution.
- App-local UI state or Tauri bridge code.
- Generic repo metadata helpers outside installer configuration meaning.

## Development

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

## License

MIT
