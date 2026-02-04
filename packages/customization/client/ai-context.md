---
path: packages/customization/client
summary: RPC contracts and client handlers for customization operations - themes, hotkeys, preferences
tags: [customization, client, rpc, contracts, effect, tanstack-query]
---

# @beep/customization-client

Client-side API surface for customization operations. Defines RPC contracts for user preferences, themes, and hotkey management. Consumed by `@beep/customization-ui` and frontend applications via TanStack Query integration.

**Status**: Minimal scaffold - awaiting contract implementations as customization features mature.

## Architecture

```
|---------------------|     |---------------------|
| @beep/customization | --> |  RPC Contracts      |
|       -domain       |     | (Payload/Response)  |
|---------------------|     |---------------------|
                                     |
                          (RPC boundary - HTTP)
                                     |
                                     v
|---------------------|     |---------------------|
|   TanStack Query    | <-- | CustomizationClient |
|       hooks         |     |     Handlers        |
|---------------------|     |---------------------|
          |
          v
|---------------------|
| @beep/customization |
|        -ui          |
|---------------------|
```

## Core Modules (Planned)

| Module | Purpose |
|--------|---------|
| `CustomizationContracts` | RPC contract definitions for preference CRUD |
| `HotkeyContracts` | Contracts for user hotkey get/update operations |
| `CustomizationHandlers` | Client handlers wrapping contracts for TanStack Query |

## Usage Patterns

### Layer Composition (Planned)

```typescript
import * as Layer from "effect/Layer";
import { CustomizationClientLive } from "@beep/customization-client";
import { HttpClientLive } from "@beep/shared-client";

const AppLayer = Layer.provide(CustomizationClientLive, HttpClientLive);
```

### Contract with TanStack Query (Planned)

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { hotkeyContract } from "@beep/customization-client";

// Query
const { data } = useQuery({
  queryKey: ["hotkeys", userId],
  queryFn: () => hotkeyContract.get({ userId }),
});

// Mutation with cache invalidation
const mutation = useMutation({
  mutationFn: hotkeyContract.update,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotkeys"] }),
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Contracts separate from server | RPC boundary allows independent client/server deployment |
| Effect Schema validation | Type-safe payloads with runtime validation on both ends |
| `S.TaggedError` for errors | Predictable client-side error handling with discriminated unions |
| Schema versioning planned | Backward compatibility for evolving preference structures |

## Dependencies

**Internal**: `@beep/customization-domain` (planned - for shared types)

**External**: `effect`

## Related

- **AGENTS.md** - Settings schema alignment, caching gotchas, contract versioning
- **@beep/customization-server** - Server-side handlers implementing these contracts
- **@beep/customization-ui** - React components consuming these contracts
- **@beep/ui-core** - Settings schema that customization contracts must align with
