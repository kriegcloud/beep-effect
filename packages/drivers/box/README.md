# @beep/box

Box driver package

## Installation

```bash
bun add @beep/box
```

## Usage

```ts
import { VERSION } from "@beep/box"
```

## Streaming Payload Schemas

Hand-written byte and event stream adapters export their payload contracts as
Effect Schema classes such as `BoxUploadFilePayload`,
`BoxCreateUserAvatarPayload`, and `BoxPartAccumulator`. These exports are both
runtime schema values and TypeScript types, so callers can decode unknown input,
derive tests, or keep using them as structural payload types.

Multipart upload request bodies mirror the generated Box SDK body shapes while
replacing raw byte fields with `BoxByteInput`, which accepts `Uint8Array`, Node
`Readable`, or Effect byte streams.

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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/box` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
