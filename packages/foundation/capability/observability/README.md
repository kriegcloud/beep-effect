# @beep/observability

A library containing utilities & modules for observability.

## Installation

```bash
bun add @beep/observability
```

## Usage

```ts
import { LoggingConfig, ObservabilityCoreConfig } from "@beep/observability"
import { layerLocalLgtmServer } from "@beep/observability/server"
import { layerJson } from "@beep/observability/experimental/server"
import { layerWebSdk } from "@beep/observability/web"
```

The root entrypoint is browser-safe and only exports shared schemas and helpers.

- Use `@beep/observability/server` for OTLP, Prometheus, and devtools wiring.
- Use `@beep/observability/experimental/server` for OTLP packet capture and devtools relay experiments.
- Use `@beep/observability/web` for browser-safe OpenTelemetry setup.

Example entrypoints live under [examples](./examples):

- `examples/node-sdk-server.ts`
- `examples/phase-profiling.ts`
- `examples/packet-lab.ts`
- `examples/devtools-relay.ts`

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Type check examples
bun run check:examples

# Test
bun run test

# Lint
bun run lint:fix
```

## License

MIT
