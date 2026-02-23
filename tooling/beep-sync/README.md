# @beep/beep-sync

Scaffold for unified AI tooling sync runtime and POC fixtures.

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

## Scaffold Status

- `tooling/beep-sync/bin/beep-sync` wrapper is wired.
- `tooling/beep-sync/src/bin.ts` and `tooling/beep-sync/src/index.ts` provide scaffold behavior and fixture support.
- POC fixture directories exist under `tooling/beep-sync/fixtures/poc-01` through `poc-06`.

## License

MIT
