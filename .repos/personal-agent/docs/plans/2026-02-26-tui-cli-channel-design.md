# TUI CLI Channel Design

## Goal

Replace the CLI's readline loop with a multi-pane terminal UI built on OpenTUI + React, using Effect Atom for state management and the existing HTTP/SSE transport.

## Architecture

The TUI runs as a standalone `packages/tui` package. It renders a React component tree into the terminal via `@opentui/react`. State flows through Effect Atom: the SSE stream from the server pushes `TurnStreamEvent`s into writable atoms via `AtomRegistry.set/update`, and React components observe them via `useAtomValue`. The server requires no changes — the TUI reuses the existing `ChatClient` (extracted to a shared `packages/client` package).

## Tech Stack

- **@opentui/core** + **@opentui/react** — terminal rendering with React reconciler
- **effect/unstable/reactivity/Atom** + **@effect/atom-react** — reactive state management
- **@template/client** (new shared package) — `ChatClient` HTTP/SSE client
- **@template/domain** — shared types (`TurnStreamEvent`, etc.)
- **effect** + **@effect/platform-bun** — runtime, HTTP client

---

## Package Structure

### New: `packages/client`

Extracted from `packages/cli/src/RuntimeClient.ts`. Contains the `ChatClient` Effect service (HTTP/SSE client for the server API). Both `packages/cli` and `packages/tui` depend on `@template/client`.

```
packages/client/
  src/
    ChatClient.ts       # ChatClient service (moved from RuntimeClient.ts)
    index.ts
  package.json          # @template/client
  tsconfig.json
```

### New: `packages/tui`

```
packages/tui/
  src/
    bin.ts              # Entry point (createCliRenderer + createRoot)
    App.tsx             # Root component, layout
    atoms/
      session.ts        # messagesAtom, toolEventsAtom, connectionStatusAtom, etc.
      derived.ts        # lastMessageAtom, activeToolsAtom (computed)
    hooks/
      useSendMessage.ts # Runs ChatClient.sendMessage, dispatches to atoms
    components/
      ChatPane.tsx      # Scrollable message history
      ToolPane.tsx      # Tool calls & results panel
      InputBar.tsx      # Multi-line text input
      StatusBar.tsx     # Channel, session, connection status
      MessageBubble.tsx # Single message rendering
    types.ts            # ChatMessage, ToolEvent interfaces
  package.json          # @template/tui
  tsconfig.json
```

---

## Layout

```
┌──────────────────────────────┬─────────────────────┐
│                              │                     │
│         Chat Pane            │     Tool Pane        │
│                              │                     │
│  (scrollable message list)   │  (tool calls &      │
│                              │   results, scroll)  │
│                              │                     │
├──────────────────────────────┴─────────────────────┤
│  > input area                                      │
├────────────────────────────────────────────────────┤
│  StatusBar: channel:abc | session:abc | connected  │
└────────────────────────────────────────────────────┘
```

### Components

**`<App>`** — root component. Creates `AtomRegistry`, wraps children in `<RegistryContext.Provider>`. Owns the top-level flexbox layout.

```tsx
<box flexDirection="column" flexGrow={1}>
  <box flexDirection="row" flexGrow={1}>
    <ChatPane flexGrow={2} />
    <ToolPane flexGrow={1} />
  </box>
  <InputBar />
  <StatusBar />
</box>
```

**`<ChatPane>`** — `<scrollbox>` of `<MessageBubble>` components. Auto-scrolls to bottom on new messages. User messages prefixed with `>`, assistant messages plain.

**`<ToolPane>`** — `<scrollbox>` showing tool calls (name + input JSON) and results. Uses `<code>` for JSON rendering. Shows "No tools" when empty.

**`<InputBar>`** — `<textarea>` for message input. Enter sends, configurable multi-line support.

**`<StatusBar>`** — single-line `<box>` at bottom. Shows channel ID (truncated), connection status indicator, streaming state.

**`<MessageBubble>`** — renders a single message. Shows role label, content text, and status indicator (streaming dots for in-progress assistant messages).

---

## State Management — Effect Atom

### Writable Atoms (source of truth)

```typescript
import * as Atom from "effect/unstable/reactivity/Atom"

const messagesAtom = Atom.make<ChatMessage[]>([])
const toolEventsAtom = Atom.make<ToolEvent[]>([])
const connectionStatusAtom = Atom.make<"connecting" | "connected" | "error">("connecting")
const isStreamingAtom = Atom.make<boolean>(false)
const channelIdAtom = Atom.make<string>("")
const inputHistoryAtom = Atom.make<string[]>([])
```

### Derived Atoms (computed from writable atoms)

```typescript
const lastMessageAtom = Atom.make((get) => {
  const msgs = get(messagesAtom)
  return msgs.length > 0 ? msgs[msgs.length - 1] : null
})

const activeToolsAtom = Atom.make((get) =>
  get(toolEventsAtom).filter(t => t.status === "called")
)
```

### Types

```typescript
interface ChatMessage {
  role: "user" | "assistant"
  content: string
  turnId: string
  status: "streaming" | "complete" | "failed"
}

interface ToolEvent {
  toolCallId: string
  toolName: string
  inputJson: string
  outputJson: string | null
  isError: boolean
  status: "called" | "completed"
}
```

### React Bridge

Components use `@effect/atom-react` hooks:

```tsx
import { useAtomValue } from "@effect/atom-react"

function ChatPane() {
  const messages = useAtomValue(messagesAtom)
  // ...
}
```

The `RegistryContext.Provider` wraps the app with a shared `AtomRegistry` instance.

### SSE Stream → Atom Updates

The `sendMessage` function runs via `Effect.runFork`. It uses `AtomRegistry.set/update` to push events into atoms:

| TurnStreamEvent | Atom update |
|---|---|
| `turn.started` | Append new assistant `ChatMessage` (empty, streaming) to `messagesAtom` |
| `assistant.delta` | Append delta text to last message in `messagesAtom` |
| `tool.call` | Append `ToolEvent` (status: called) to `toolEventsAtom` |
| `tool.result` | Update matching `ToolEvent` with output (status: completed) |
| `turn.completed` | Mark last message complete, set `isStreamingAtom` false |
| `turn.failed` | Mark last message failed with error info |

User messages are appended to `messagesAtom` immediately on send (before the stream starts).

---

## Keyboard & Navigation

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Ctrl+C` | Exit |
| `Tab` | Cycle focus: input → tool pane → input |
| `Up/Down` (in input) | Scroll input history |
| `Arrow keys` (in pane) | Scroll focused pane |
| `PageUp/PageDown` | Fast scroll |
| `Ctrl+L` | Clear chat (visual only) |

No vim keybindings in this slice.

---

## Transport

Reuses the existing HTTP/SSE transport. No server changes required.

- `POST /channels/{id}/initialize` — initialize channel
- `POST /channels/{id}/messages` — send message, receive SSE stream
- `GET /channels/{id}/history` — load history on reconnect
- `GET /channels/{id}/status` — channel status

The `ChatClient` service handles all of this. The TUI calls it via `Effect.runFork` from event handlers.

---

## Entry Point

```typescript
// packages/tui/src/bin.ts
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./App.tsx"

const renderer = await createCliRenderer()
const root = createRoot(renderer)
root.render(<App />)
```

The `tsconfig.json` sets `"jsxImportSource": "@opentui/react"`.

---

## Dependencies

```json
{
  "dependencies": {
    "@opentui/core": "latest",
    "@opentui/react": "latest",
    "@effect/atom-react": "4.0.0-beta.11",
    "@effect/platform-bun": "4.0.0-beta.11",
    "@template/client": "workspace:^",
    "@template/domain": "workspace:^",
    "effect": "4.0.0-beta.11",
    "react": "^19.2.4"
  }
}
```

## Build Requirements

- Zig compiler must be installed (for `@opentui/core` native build)
- Bun as runtime

---

## Future Considerations (not in this slice)

- **WebSocket transport** for typing indicators and bidirectional events
- **Effect-native state** using `Atom.runtime` for service-backed atoms
- **Markdown rendering** in assistant messages
- **Image/attachment** display for multimodal content
- **Session switching** (multiple channels)
- **Memory panel** showing semantic memory context
- **Subagent panel** for observing delegated work
