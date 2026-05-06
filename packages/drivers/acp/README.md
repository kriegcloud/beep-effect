# @beep/acp

Effect-native Agent Client Protocol driver.

This package is the repo-level technical driver home for ACP wire contracts,
transport helpers, typed protocol errors, and driver-local layers.

## Installation

```bash
bun add @beep/acp
```

## Usage

```ts
import { VERSION } from "@beep/acp"
import { AcpClient } from "@beep/acp/client"
import { AcpAgent } from "@beep/acp/agent"
import { InitializeRequest } from "@beep/acp/schema"

const version = VERSION
const clientTag = AcpClient
const agentTag = AcpAgent
const request = InitializeRequest.make({
  clientCapabilities: {
    fs: { readTextFile: false, writeTextFile: false },
    terminal: false
  },
  clientInfo: { name: "@beep/acp", version },
  protocolVersion: 1
})
```

Product-specific agent behavior belongs in the owning slice or shared
use-case contracts. Keep this package product-neutral.

## Public Subpaths

- `@beep/acp`
- `@beep/acp/agent`
- `@beep/acp/client`
- `@beep/acp/errors`
- `@beep/acp/protocol`
- `@beep/acp/rpc`
- `@beep/acp/schema`
- `@beep/acp/terminal`

Generated ACP schema and metadata live under `src/_generated`, but callers
should use `@beep/acp/schema`; `_generated/*` and `internal/*` are not package
exports.

## Code Generation

The generator is pinned to ACP schema release `v0.11.3` and writes
`src/_generated/schema.gen.ts` plus `src/_generated/meta.gen.ts`.

```bash
bun run --cwd packages/drivers/acp generate
```

Use `--skip-download` to regenerate from already downloaded upstream JSON
assets during generator debugging. Normal package build/check stays offline.

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

# Generate schema/meta
bun run generate

# Lint
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/acp` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
