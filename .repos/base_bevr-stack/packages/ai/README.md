# @repo/ai

Shared AI tooling for the [bEvr stack](../../README.md), built with Effect and
@effect/ai.

## Overview

This package provides reusable language model layers, a chat service that
streams events, and sample toolkits for agentic workflows.

## Environment

- `ANTHROPIC_API_KEY`

## Usage

```typescript
import { ChatService, FastModelLive, SampleToolkitLive } from "@repo/ai";
import { Layer } from "effect";

const AiLive = Layer.mergeAll(FastModelLive, SampleToolkitLive);

const AppLive = ChatService.Default.pipe(Layer.provideMerge(AiLive));
```

## Removing From Apps

### Server

1. Remove AI wiring from the server runtime:
   - `apps/server/src/index.ts`: drop `ChatService`, `FastModelLive`,
     `SampleToolkitLive` imports and `Layer.provide(...)` calls.
2. Remove the chat RPC handler:
   - `apps/server/src/Rpc/Event.ts`: remove the `chat` handler (and the
     `@effect/ai` `Prompt` import if unused).
3. Remove AI dependencies:
   - `apps/server/package.json`: remove `@repo/ai` (and any unused `@effect/ai`
     entries if no longer needed).

### Client

1. Remove the chat UI and atom:
   - `apps/client/src/app.tsx`: remove `<ChatBox />` and its import.
   - `apps/client/src/components/chat-box.tsx`: delete the file or exclude it.
   - `apps/client/src/lib/atoms/chat-atom.ts`: delete the atom.
2. Remove chat-related types usage:
   - `apps/client/src/components/ui/segment.tsx`: remove if only used by chat.
3. Remove chat references in tests:
   - `apps/client/src/app.test.tsx`: delete any chat-specific mocks if unused.

## Learn More

- [@effect/ai Documentation](https://github.com/tim-smart/effect-io-ai)
- [bEvr Stack Overview](../../README.md)
