# @beep/file-processing

Runtime-neutral schema-first file processing capability contracts and manifest models

## Capability boundary

`@beep/file-processing` contains runtime-neutral schemas, operation contracts, strategy models, service interfaces, and test fixtures only. Runtime, process, filesystem, and engine-specific behavior belongs in consuming packages.

Current real consumers proving this foundation/capability promotion are:

- `@beep/tika` for Apache Tika-backed detection, text extraction, and metadata extraction driver scaffolding.
- `@beep/libpff` for PST archive export driver scaffolding.
- `@beep/repo-cli` for the initial `beep files process` manifest proof surface.

## Installation

```bash
bun add @beep/file-processing
```

## Usage

```ts
import { VERSION } from "@beep/file-processing"
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Integration test
bun run test:integration

# Lint
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/file-processing` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
