# TUI Slice 1: Modal System + Rich Rendering — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a modal overlay system and rich markdown rendering to the TUI, providing the foundation for all subsequent TUI feature slices.

**Architecture:** A `ModalLayer` component wraps the app and renders modal overlays keyed by a `modalAtom`. A `ModalBox` primitive provides a bordered, titled overlay. `MessageBubble` switches from plain `<text>` to `<markdown>` for completed assistant messages, with `streaming` mode for in-progress messages.

**Tech Stack:** OpenTUI (`<markdown>`, `<box>`, `<scrollbox>`, `SyntaxStyle`), Effect Atom, React 19

---

### Task 1: Add `modalAtom` to session atoms

**Files:**
- Modify: `packages/tui/src/atoms/session.ts`
- Modify: `packages/tui/src/types.ts`

**Step 1: Add `ModalId` type to `types.ts`**

Add at the end of `packages/tui/src/types.ts`:

```typescript
export type ModalId =
  | "command-palette"
  | "session-picker"
  | "settings"
  | "memory-search"
  | "tool-inspector"
```

**Step 2: Add `modalAtom` to `session.ts`**

Add to `packages/tui/src/atoms/session.ts`:

```typescript
import type { ChatMessage, ConnectionStatus, ModalId, ToolEvent } from "../types.js"
```

Then add after `inputHistoryAtom`:

```typescript
export const modalAtom = Atom.make<ModalId | null>(null)
```

**Step 3: Run typecheck**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/tui/src/atoms/session.ts packages/tui/src/types.ts
git commit -m "feat(tui): add modalAtom and ModalId type"
```

---

### Task 2: Create `ModalBox` primitive component

**Files:**
- Create: `packages/tui/src/components/ModalBox.tsx`
- Create: `packages/tui/test/ModalBox.test.tsx`

**Step 1: Write the test**

Create `packages/tui/test/ModalBox.test.tsx`:

```typescript
import { describe, expect, it } from "vitest"
import { ModalBox } from "../src/components/ModalBox.js"

describe("ModalBox", () => {
  it("exports a React component", () => {
    expect(typeof ModalBox).toBe("function")
  })

  it("accepts title and children props", () => {
    // Type-level check — verifying the component signature compiles
    const _element = <ModalBox title="Test Modal"><text content="hello" /></ModalBox>
    expect(_element).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun run test -- --reporter=verbose packages/tui/test/ModalBox.test.tsx`
Expected: FAIL — cannot find module `../src/components/ModalBox.js`

**Step 3: Write the implementation**

Create `packages/tui/src/components/ModalBox.tsx`:

```tsx
import * as React from "react"

export function ModalBox({
  title,
  children,
  width = "60%",
  height = "60%"
}: {
  readonly title: string
  readonly children: React.ReactNode
  readonly width?: string | number
  readonly height?: string | number
}) {
  return (
    <box
      position="absolute"
      left="50%"
      top="50%"
      width={width}
      height={height}
      border={true}
      borderStyle="single"
      backgroundColor="black"
      flexDirection="column"
      padding={1}
    >
      <text content={` ${title} `} fg="cyan" />
      <box flexDirection="column" flexGrow={1}>
        {children}
      </box>
    </box>
  )
}
```

> **Note for implementer:** OpenTUI uses Yoga layout (CSS flexbox). `position="absolute"` with `left/top` at 50% positions the box center-ish. If absolute centering doesn't work as expected in OpenTUI, fall back to a full-screen overlay `<box>` with `justifyContent="center" alignItems="center"` wrapping the modal content box. Test visually with `bun packages/tui/src/bin.tsx` to confirm positioning.

**Step 4: Run test to verify it passes**

Run: `bun run test -- --reporter=verbose packages/tui/test/ModalBox.test.tsx`
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add packages/tui/src/components/ModalBox.tsx packages/tui/test/ModalBox.test.tsx
git commit -m "feat(tui): add ModalBox primitive component"
```

---

### Task 3: Create `ModalLayer` component

**Files:**
- Create: `packages/tui/src/components/ModalLayer.tsx`
- Create: `packages/tui/test/ModalLayer.test.tsx`

**Step 1: Write the test**

Create `packages/tui/test/ModalLayer.test.tsx`:

```typescript
import { describe, expect, it, vi } from "vitest"
import { ModalLayer } from "../src/components/ModalLayer.js"

describe("ModalLayer", () => {
  it("exports a React component", () => {
    expect(typeof ModalLayer).toBe("function")
  })

  it("renders children when no modal is active", () => {
    // Type-level check
    const _element = (
      <ModalLayer activeModal={null} onClose={() => {}}>
        <text content="main content" />
      </ModalLayer>
    )
    expect(_element).toBeDefined()
  })

  it("accepts activeModal prop", () => {
    const _element = (
      <ModalLayer activeModal="settings" onClose={() => {}}>
        <text content="main content" />
      </ModalLayer>
    )
    expect(_element).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun run test -- --reporter=verbose packages/tui/test/ModalLayer.test.tsx`
Expected: FAIL — cannot find module

**Step 3: Write the implementation**

Create `packages/tui/src/components/ModalLayer.tsx`:

```tsx
import * as React from "react"
import type { ModalId } from "../types.js"
import { ModalBox } from "./ModalBox.js"

export function ModalLayer({
  activeModal,
  onClose,
  children
}: {
  readonly activeModal: ModalId | null
  readonly onClose: () => void
  readonly children: React.ReactNode
}) {
  return (
    <box flexDirection="column" flexGrow={1}>
      {children}
      {activeModal !== null && (
        <box
          position="absolute"
          left={0}
          top={0}
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="center"
          alignItems="center"
        >
          {renderModal(activeModal, onClose)}
        </box>
      )}
    </box>
  )
}

function renderModal(modalId: ModalId, onClose: () => void): React.ReactNode {
  // Placeholder modals — each will be replaced with a real component in later slices
  switch (modalId) {
    case "command-palette":
      return (
        <ModalBox title="Command Palette" width="70%" height="40%">
          <text content="Command palette coming soon..." fg="gray" />
        </ModalBox>
      )
    case "session-picker":
      return (
        <ModalBox title="Sessions" width="60%" height="60%">
          <text content="Session picker coming soon..." fg="gray" />
        </ModalBox>
      )
    case "settings":
      return (
        <ModalBox title="Settings" width="50%" height="50%">
          <text content="Settings coming soon..." fg="gray" />
        </ModalBox>
      )
    case "memory-search":
      return (
        <ModalBox title="Memory Search" width="60%" height="60%">
          <text content="Memory search coming soon..." fg="gray" />
        </ModalBox>
      )
    case "tool-inspector":
      return (
        <ModalBox title="Tool Inspector" width="80%" height="80%">
          <text content="Tool inspector coming soon..." fg="gray" />
        </ModalBox>
      )
  }
}
```

> **Note for implementer:** `backgroundColor="rgba(0,0,0,0.5)"` may or may not work in OpenTUI for a semi-transparent backdrop. If not, use a solid dark background or omit the backdrop entirely — the `ModalBox` border already distinguishes it from the main content. Test visually.

**Step 4: Run test to verify it passes**

Run: `bun run test -- --reporter=verbose packages/tui/test/ModalLayer.test.tsx`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add packages/tui/src/components/ModalLayer.tsx packages/tui/test/ModalLayer.test.tsx
git commit -m "feat(tui): add ModalLayer component with placeholder modals"
```

---

### Task 4: Wire `ModalLayer` into `App.tsx` with keybindings

**Files:**
- Modify: `packages/tui/src/App.tsx`

**Step 1: Update `App.tsx`**

The existing `App.tsx` (lines 1-77) needs these changes:

1. Import `ModalLayer`, `modalAtom`, and `useAtomValue` from the atom-react package
2. Read `modalAtom` from the registry
3. Add modal keybindings to the existing `useKeyboard` handler
4. Wrap the existing layout in `<ModalLayer>`
5. Suppress focus cycling when a modal is open

Replace the full `App.tsx` content with:

```tsx
import { ChatClient } from "@template/client/ChatClient"
import { RegistryContext, useAtomValue } from "@effect/atom-react"
import { Effect, ServiceMap } from "effect"
import * as React from "react"
// @ts-expect-error -- @opentui/react .d.ts uses extensionless re-exports incompatible with NodeNext resolution
import { useKeyboard } from "@opentui/react"
import { channelIdAtom, connectionStatusAtom, messagesAtom, modalAtom } from "./atoms/session.js"
import { ChatPane } from "./components/ChatPane.js"
import { InputBar } from "./components/InputBar.js"
import { ModalLayer } from "./components/ModalLayer.js"
import { StatusBar } from "./components/StatusBar.js"
import { ToolPane } from "./components/ToolPane.js"
import { useSendMessage } from "./hooks/useSendMessage.js"
import type { ChatMessage } from "./types.js"

type ChatClientShape = ServiceMap.Service.Shape<typeof ChatClient>

/** Focus targets for Tab cycling */
type FocusTarget = "input" | "tools"

export function App({ client }: { readonly client: ChatClientShape }) {
  const registry = React.useContext(RegistryContext)
  const sendMessage = useSendMessage(client)
  const [focusTarget, setFocusTarget] = React.useState<FocusTarget>("input")
  const activeModal = useAtomValue(modalAtom)

  // Global keyboard handler
  useKeyboard((key: { name: string; ctrl: boolean }) => {
    if (key.ctrl && key.name === "c") {
      process.exit(0)
    }

    // Modal keybindings
    if (key.name === "escape" && activeModal !== null) {
      registry.set(modalAtom, null)
      return
    }
    if (key.ctrl && key.name === "k") {
      registry.set(modalAtom, "command-palette")
      return
    }
    if (key.ctrl && key.name === "s") {
      registry.set(modalAtom, "session-picker")
      return
    }
    // Ctrl+, may not be detectable in terminals — use Ctrl+P as fallback for settings
    if (key.ctrl && key.name === ",") {
      registry.set(modalAtom, "settings")
      return
    }
    if (key.ctrl && key.name === "m") {
      registry.set(modalAtom, "memory-search")
      return
    }

    // Tab focus cycling — only when no modal is open
    if (key.name === "tab" && activeModal === null) {
      setFocusTarget((prev) => (prev === "input" ? "tools" : "input"))
    }
  })

  const closeModal = React.useCallback(() => {
    registry.set(modalAtom, null)
  }, [registry])

  // Initialize channel on mount
  React.useEffect(() => {
    const chId = `channel:${crypto.randomUUID()}`
    registry.set(channelIdAtom, chId)
    registry.set(connectionStatusAtom, "connecting")

    const init = Effect.gen(function*() {
      yield* client.initialize(chId, "agent:bootstrap")
      registry.set(connectionStatusAtom, "connected")

      const history = yield* client.getHistory(chId)
      if (Array.isArray(history) && history.length > 0) {
        const restored: Array<ChatMessage> = history.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: String(msg.content ?? ""),
          turnId: String(msg.turnId ?? ""),
          status: "complete" as const
        }))
        registry.set(messagesAtom, restored)
      }
    }).pipe(
      Effect.catch((error) =>
        Effect.sync(() => {
          console.error("Channel initialization failed:", error)
          registry.set(connectionStatusAtom, "error")
        })
      )
    )
    Effect.runFork(init)
  }, [registry, client])

  return (
    <ModalLayer activeModal={activeModal} onClose={closeModal}>
      <box flexDirection="column" flexGrow={1}>
        <box flexDirection="row" flexGrow={1}>
          <ChatPane />
          <ToolPane focused={focusTarget === "tools" && activeModal === null} />
        </box>
        <InputBar onSubmit={sendMessage} focused={focusTarget === "input" && activeModal === null} />
        <StatusBar />
      </box>
    </ModalLayer>
  )
}
```

**Key changes:**
- Import and read `modalAtom`
- `Escape` closes active modal
- `Ctrl+K/S/,/M` open modals
- `Tab` only cycles focus when no modal open
- `focused` props suppressed when modal is active (`&& activeModal === null`)
- Layout wrapped in `<ModalLayer>`

**Step 2: Run typecheck**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"`
Expected: No errors

**Step 3: Run tests**

Run: `bun run test`
Expected: All tests pass (existing + new)

**Step 4: Visual test**

Run: `bun packages/tui/src/bin.tsx`
- Verify chat still works normally
- Press `Ctrl+K` — should see "Command palette coming soon..." overlay
- Press `Escape` — overlay should close
- Press `Ctrl+S` — should see "Session picker coming soon..."
- Press `Tab` with no modal — focus should cycle

> **Note for implementer:** If `Ctrl+,` doesn't work in your terminal, that's expected. Terminal emulators often can't detect `Ctrl+comma`. We'll handle this in Slice 3 when the command palette provides an alternative path. Leave the handler in place — it works in some terminals.

**Step 5: Commit**

```bash
git add packages/tui/src/App.tsx
git commit -m "feat(tui): wire ModalLayer with keybindings into App"
```

---

### Task 5: Add rich markdown rendering to `MessageBubble`

**Files:**
- Modify: `packages/tui/src/components/MessageBubble.tsx`
- Modify: `packages/tui/src/App.tsx` (add SyntaxStyle provider)
- Create: `packages/tui/test/MessageBubble.test.tsx`

**Step 1: Write the test**

Create `packages/tui/test/MessageBubble.test.tsx`:

```typescript
import { describe, expect, it } from "vitest"
import { MessageBubble } from "../src/components/MessageBubble.js"
import type { ChatMessage } from "../src/types.js"

describe("MessageBubble", () => {
  const completedAssistant: ChatMessage = {
    role: "assistant",
    content: "Hello **world**",
    turnId: "turn:1",
    status: "complete"
  }

  const streamingAssistant: ChatMessage = {
    role: "assistant",
    content: "Hello",
    turnId: "turn:2",
    status: "streaming"
  }

  const userMessage: ChatMessage = {
    role: "user",
    content: "hi there",
    turnId: "turn:3",
    status: "complete"
  }

  const failedMessage: ChatMessage = {
    role: "assistant",
    content: "partial",
    turnId: "turn:4",
    status: "failed",
    errorMessage: "model error"
  }

  it("exports a React component", () => {
    expect(typeof MessageBubble).toBe("function")
  })

  it("accepts a completed assistant message", () => {
    const _el = <MessageBubble message={completedAssistant} />
    expect(_el).toBeDefined()
  })

  it("accepts a streaming assistant message", () => {
    const _el = <MessageBubble message={streamingAssistant} />
    expect(_el).toBeDefined()
  })

  it("accepts a user message", () => {
    const _el = <MessageBubble message={userMessage} />
    expect(_el).toBeDefined()
  })

  it("accepts a failed message", () => {
    const _el = <MessageBubble message={failedMessage} />
    expect(_el).toBeDefined()
  })
})
```

**Step 2: Run test to verify it passes with current code**

Run: `bun run test -- --reporter=verbose packages/tui/test/MessageBubble.test.tsx`
Expected: PASS (5 tests) — current implementation satisfies the interface

**Step 3: Update `MessageBubble.tsx` with markdown rendering**

Replace `packages/tui/src/components/MessageBubble.tsx`:

```tsx
import type { SyntaxStyle } from "@opentui/core"
import * as React from "react"
import type { ChatMessage } from "../types.js"
import { SyntaxStyleContext } from "./SyntaxStyleContext.js"

export function MessageBubble({ message }: { readonly message: ChatMessage }) {
  const syntaxStyle = React.useContext(SyntaxStyleContext)

  if (message.role === "user") {
    return (
      <box flexDirection="column">
        <text content={`> ${message.content}`} fg="green" />
      </box>
    )
  }

  // Assistant message — use markdown for completed, text for streaming
  const useMarkdown = syntaxStyle !== null && message.status === "complete"
  const useStreamingMarkdown = syntaxStyle !== null && message.status === "streaming"

  return (
    <box flexDirection="column">
      {useMarkdown ? (
        <markdown content={message.content} syntaxStyle={syntaxStyle} />
      ) : useStreamingMarkdown ? (
        <markdown content={message.content} syntaxStyle={syntaxStyle} streaming={true} />
      ) : (
        <text
          content={`${message.content}${message.status === "streaming" ? " ..." : ""}`}
          fg={message.status === "failed" ? "red" : "white"}
        />
      )}
      {message.errorMessage ? (
        <text content={`  [error: ${message.errorMessage}]`} fg="red" />
      ) : null}
    </box>
  )
}
```

> **Note for implementer:** The `@ts-expect-error` comment may be needed on the `@opentui/core` import if the type resolution fails, same as the `@opentui/react` imports elsewhere. Check and add if needed.

**Step 4: Create `SyntaxStyleContext`**

Create `packages/tui/src/components/SyntaxStyleContext.ts`:

```typescript
import type { SyntaxStyle } from "@opentui/core"
import * as React from "react"

export const SyntaxStyleContext = React.createContext<SyntaxStyle | null>(null)
```

> **Note for implementer:** Same `@ts-expect-error` consideration for `@opentui/core` import. The `SyntaxStyle` type import should work without it since it's a type-only import, but if it fails, add the pragma.

**Step 5: Provide `SyntaxStyle` in `bin.tsx`**

Modify `packages/tui/src/bin.tsx` to create a `SyntaxStyle` instance and provide it via context.

Add after the existing imports:

```typescript
// @ts-expect-error -- @opentui/core .d.ts uses extensionless re-exports incompatible with NodeNext resolution
import { SyntaxStyle } from "@opentui/core"
import { SyntaxStyleContext } from "./components/SyntaxStyleContext.js"
```

Add after `const registry = AtomRegistry.make()`:

```typescript
const syntaxStyle = SyntaxStyle.create()
```

Update the `root.render(...)` call to wrap with the provider:

```tsx
root.render(
  <RegistryContext.Provider value={registry}>
    <SyntaxStyleContext.Provider value={syntaxStyle}>
      <App client={client} />
    </SyntaxStyleContext.Provider>
  </RegistryContext.Provider>
)
```

**Step 6: Run typecheck**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"`
Expected: No errors

**Step 7: Run tests**

Run: `bun run test`
Expected: All tests pass

**Step 8: Visual test**

Run: `bun packages/tui/src/bin.tsx`

Send a message like: "Write a hello world function in TypeScript"

The assistant's completed response should render with:
- **Bold text** rendered as bold
- `code spans` rendered with syntax highlighting
- Code blocks (```ts) rendered with proper highlighting
- Headings, lists, etc. rendered as markdown

User messages should still show as plain green text with `> ` prefix.

> **Note for implementer:** If `SyntaxStyle.create()` throws or requires arguments, try `SyntaxStyle.fromStyles({})` as a fallback. Check OpenTUI docs/source if neither works. The `<markdown>` component requires a SyntaxStyle instance — this is non-optional.

**Step 9: Commit**

```bash
git add packages/tui/src/components/MessageBubble.tsx packages/tui/src/components/SyntaxStyleContext.ts packages/tui/src/bin.tsx packages/tui/test/MessageBubble.test.tsx
git commit -m "feat(tui): rich markdown rendering for assistant messages"
```

---

### Task 6: Update `StatusBar` with keybinding hints

**Files:**
- Modify: `packages/tui/src/components/StatusBar.tsx`

**Step 1: Update `StatusBar.tsx`**

Replace the status bar text to show available keybindings:

```tsx
import { useAtomValue } from "@effect/atom-react"
import { channelIdAtom, connectionStatusAtom, isStreamingAtom, messageCountAtom } from "../atoms/session.js"

export function StatusBar() {
  const channelId = useAtomValue(channelIdAtom)
  const status = useAtomValue(connectionStatusAtom)
  const isStreaming = useAtomValue(isStreamingAtom)
  const count = useAtomValue(messageCountAtom)

  const shortId = channelId.length > 20 ? `${channelId.slice(0, 20)}...` : channelId
  const statusColor = status === "connected" ? "green" : status === "error" ? "red" : "yellow"
  const streamLabel = isStreaming ? " | streaming" : ""

  return (
    <box>
      <text
        content={` ${shortId} | ${status}${streamLabel} | ${count} msgs | ^K palette  ^S sessions  ^M memory  ^C exit `}
        fg={statusColor}
      />
    </box>
  )
}
```

**Step 2: Run typecheck and tests**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"` — expect no errors
Run: `bun run test` — expect all pass

**Step 3: Commit**

```bash
git add packages/tui/src/components/StatusBar.tsx
git commit -m "feat(tui): add keybinding hints to StatusBar"
```

---

### Task 7: End-to-end verification

**Step 1: Typecheck**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"`
Expected: No errors

**Step 2: Run full test suite**

Run: `bun run test`
Expected: All tests pass

**Step 3: Visual verification**

Run: `bun packages/tui/src/bin.tsx`

Verify:
1. Chat works normally — send messages, get responses
2. Assistant responses render as markdown (bold, code blocks, lists)
3. Streaming responses show text, then switch to markdown on completion
4. `Ctrl+K` opens command palette placeholder → `Escape` closes it
5. `Ctrl+S` opens session picker placeholder → `Escape` closes it
6. `Ctrl+M` opens memory search placeholder → `Escape` closes it
7. `Tab` cycles focus between input and tools (only when no modal open)
8. Status bar shows keybinding hints
9. User messages still render as plain green text

**Step 4: List all commits on this slice**

Run: `git log --oneline -10`

Expected: 6 commits for this slice:
1. `feat(tui): add modalAtom and ModalId type`
2. `feat(tui): add ModalBox primitive component`
3. `feat(tui): add ModalLayer component with placeholder modals`
4. `feat(tui): wire ModalLayer with keybindings into App`
5. `feat(tui): rich markdown rendering for assistant messages`
6. `feat(tui): add keybinding hints to StatusBar`

---

## Files Summary

| File | Action |
|------|--------|
| `packages/tui/src/types.ts` | Add `ModalId` type |
| `packages/tui/src/atoms/session.ts` | Add `modalAtom` |
| `packages/tui/src/components/ModalBox.tsx` | Create — modal primitive |
| `packages/tui/src/components/ModalLayer.tsx` | Create — overlay manager |
| `packages/tui/src/components/SyntaxStyleContext.ts` | Create — React context for SyntaxStyle |
| `packages/tui/src/components/MessageBubble.tsx` | Modify — add markdown rendering |
| `packages/tui/src/components/StatusBar.tsx` | Modify — add keybinding hints |
| `packages/tui/src/App.tsx` | Modify — wire modal system + keybindings |
| `packages/tui/src/bin.tsx` | Modify — provide SyntaxStyle |
| `packages/tui/test/ModalBox.test.tsx` | Create — ModalBox tests |
| `packages/tui/test/ModalLayer.test.tsx` | Create — ModalLayer tests |
| `packages/tui/test/MessageBubble.test.tsx` | Create — MessageBubble tests |

## Verification

```bash
bun run check           # typecheck — no errors
bun run test            # full suite — all pass
bun packages/tui/src/bin.tsx   # visual — markdown rendering + modals work
```
