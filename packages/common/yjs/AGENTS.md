# AGENTS.md — `@beep/yjs`

## Purpose & Scope

- Custom Yjs CRDT integration for real-time collaboration features.
- Provides Effect Schema definitions for Yjs protocol messages (client/server communication, comments, notifications).
- NEVER import from this package in non-collaboration contexts; it's specialized for real-time sync.

## Module Map (see `src/`)

### `lib/` — Core Utilities
- `abort-controller.ts` — AbortController utilities for cancellation.
- `assert.ts` — Assertion helpers for protocol validation.
- `position.ts` — Yjs position tracking and transformation utilities.

### `protocol/` — Effect Schema Protocol Definitions
- `Ai.ts` — AI-related collaboration protocol schemas.
- `BaseActivitiesData.ts` / `BaseGroupinfo.ts` / `BaseRoomInfo.ts` / `BaseUserMeta.ts` — Base data types for collaboration entities.
- `ClientMsg.ts` — Client-to-server message schemas (Effect Schema discriminated unions).
- `ServerMsg.ts` — Server-to-client message schemas.
- `Comments.ts` — Comment threading and annotation schemas.
- `Groups.ts` — Collaboration group management schemas.
- `InboxNotifications.ts` — Real-time notification schemas.
- `MentionData.ts` — @mention handling schemas.
- `NotificationSettings.ts` — User notification preference schemas.
- `Op.ts` — CRDT operation schemas.
- `SerializedCrdt.ts` — Serialized CRDT state schemas.
- `UrlMetadata.ts` — Link preview metadata schemas.
- `VersionHistory.ts` — Document versioning schemas.

## Usage Snapshots

- `packages/documents/server` uses protocol schemas for WebSocket message validation.
- `packages/documents/client` uses `ClientMsg` schemas for type-safe RPC calls.
- Real-time collaboration features decode incoming messages with `S.decodeUnknown`.

## Authoring Guardrails

- ALWAYS use Effect Schema (`S.*`) for all protocol definitions.
- NEVER use `S.Any` or `S.Unknown` for message payloads; define explicit schemas.
- ALWAYS namespace Effect imports (`import * as S from "effect/Schema"`, etc.).
- Keep protocol schemas in `protocol/`; keep utilities in `lib/`.
- ALWAYS add discriminator fields (`type`, `kind`) to enable `S.Union` dispatch.
- Reuse base schemas (`BaseUserMeta`, `BaseRoomInfo`) instead of duplicating structures.

## Quick Recipes

```ts
import * as S from "effect/Schema";
import * as F from "effect/Function";
import { ClientMsg } from "@beep/yjs/protocol/ClientMsg";

// Decode incoming WebSocket message
const parseClientMessage = F.pipe(
  rawMessage,
  S.decodeUnknownSync(ClientMsg)
);

// Pattern match on message type
import * as Match from "effect/Match";

const handleMessage = Match.type<ClientMsg.Type>().pipe(
  Match.tag("join", (msg) => handleJoin(msg)),
  Match.tag("leave", (msg) => handleLeave(msg)),
  Match.orElse(() => handleUnknown())
);
```

## Verifications

- `bun run test --filter=@beep/yjs` for protocol schema validation tests.
- `bun run lint --filter=@beep/yjs` / `bun run lint:fix --filter=@beep/yjs` for Biome checks.
- `bun run check --filter=@beep/yjs` to ensure TypeScript alignment.

## Gotchas

- Protocol schemas MUST stay synchronized with server implementations.
- `S.suspend` is required for recursive structures (nested comments, CRDT trees).
- WebSocket message order is not guaranteed; handle out-of-order delivery.
- Yjs document changes MUST be applied within `doc.transact()` blocks.

## Contributor Checklist

- [ ] Protocol schemas use discriminated unions with explicit `type` fields.
- [ ] Effect namespace imports (`import * as S from "effect/Schema"`) used throughout.
- [ ] No `S.Any` or `S.Unknown` in message payloads.
- [ ] Added test fixtures for new protocol message types.
- [ ] Cross-referenced related packages (`@beep/documents-*`) when schemas change.
