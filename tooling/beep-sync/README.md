# @beep/beep-sync

Unified AI tooling sync runtime and POC fixture harness.

## Installation

Private workspace package:

```json
{
  "dependencies": {
    "@beep/beep-sync": "workspace:*"
  }
}
```

## Usage

```bash
bun tooling/beep-sync/bin/beep-sync --help
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Lint
bun run lint:fix
```

## Runtime Status

- `tooling/beep-sync/bin/beep-sync` runs real runtime commands for `validate`, `apply`, `check`, `doctor`, and `revert`.
- Fixture compatibility commands `normalize` and `generate` remain available for locked POC fixture suites.
- Canonical source is `.beep/config.yaml`; managed state sidecars live under `.beep/manifests/`.

## License

MIT
