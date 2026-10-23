# @beep/sbom

CycloneDX 1.6 SBOMs, NTIA minimum elements, in-toto statements, SLSA provenance and the Sigstore bundle schema as Effect schemas

## Installation

```bash
bun add @beep/sbom
```

## Usage

```ts
import * as Package from "@beep/sbom"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/sbom` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
