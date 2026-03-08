# TUI Cleanup & Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Full quality pass on the TUI — fix auto-scroll, remove stale closure refs, add focus trapping, apply refined-minimal theme, wire clipboard and responsive layout.

**Architecture:** A shared `theme.ts` provides color constants. Each component is updated to use the theme and leverage OpenTUI APIs (sticky scroll, focusedBorderColor, cursor styling). InputBar is simplified by removing unnecessary refs (useKeyboard already stabilizes the handler via internal useEffectEvent). A useClipboard hook wraps the renderer's OSC52 clipboard API.

**Tech Stack:** OpenTUI (React reconciler), Effect Atom, React 19

---

### Task 1: Create `theme.ts` color palette

**Files:**
- Create: `packages/tui/src/theme.ts`

**Step 1: Create the theme file**

Create `packages/tui/src/theme.ts`:

```typescript
/** Refined-minimal color palette for the TUI */
export const theme = {
  bg: "#1a1b26",
  surface: "#24283b",
  border: "#3b4261",
  borderFocus: "#7aa2f7",
  text: "#c0caf5",
  textMuted: "#565f89",
  userText: "#9ece6a",
  accent: "#7dcfff",
  error: "#f7768e",
  streaming: "#e0af68",
  statusConnected: "#9ece6a",
  statusError: "#f7768e",
  statusPending: "#e0af68",
} as const
```

**Step 2: Run typecheck**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/tui/src/theme.ts
git commit -m "feat(tui): add refined-minimal color theme"
```

---

### Task 2: Simplify InputBar — remove stale closure refs, add input ref and cursor styling

**Files:**
- Modify: `packages/tui/src/components/InputBar.tsx`

**Key insight:** `useKeyboard` from `@opentui/react` internally wraps the handler with `useEffectEvent` (see `.reference/opentui/packages/react/src/hooks/use-keyboard.ts:29`). This means the handler always sees the latest closure values. The 6 manual `useRef` stale-closure workarounds (`inputValueRef`, `historyIndexRef`, `stashedInputRef`, `focusedRef`, `isStreamingRef`, `inputHistoryRef`) are unnecessary and should be removed.

**Step 1: Replace `InputBar.tsx`**

```tsx
import { useAtomValue } from "@effect/atom-react"
// @ts-expect-error -- @opentui/react .d.ts uses extensionless re-exports incompatible with NodeNext resolution
import { useKeyboard } from "@opentui/react"
import * as React from "react"
import { inputHistoryAtom, isStreamingAtom } from "../atoms/session.js"
import { theme } from "../theme.js"

export function InputBar({
  onSubmit,
  focused,
  inputRef
}: {
  readonly onSubmit: (content: string) => void
  readonly focused: boolean
  readonly inputRef?: React.RefObject<unknown>
}) {
  const isStreaming = useAtomValue(isStreamingAtom)
  const inputHistory = useAtomValue(inputHistoryAtom)
  const [inputValue, setInputValue] = React.useState("")
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  const [stashedInput, setStashedInput] = React.useState("")

  const handleSubmit = React.useCallback(
    (value: string) => {
      if (isStreaming || !value.trim()) return
      onSubmit(value.trim())
      setInputValue("")
      setHistoryIndex(-1)
      setStashedInput("")
    },
    [onSubmit, isStreaming]
  )

  // useKeyboard already stabilizes via useEffectEvent — no refs needed
  useKeyboard((key: { name: string }) => {
    if (!focused || isStreaming) return
    if (inputHistory.length === 0) return

    const historyAt = (i: number) => inputHistory[inputHistory.length - 1 - i] ?? ""

    if (key.name === "up") {
      if (historyIndex === -1) {
        setStashedInput(inputValue)
        setHistoryIndex(0)
        setInputValue(historyAt(0))
      } else if (historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInputValue(historyAt(newIndex))
      }
    }

    if (key.name === "down") {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInputValue(historyAt(newIndex))
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInputValue(stashedInput)
      }
    }
  })

  const isFocused = focused && !isStreaming

  return (
    <box
      border={true}
      borderStyle="single"
      borderColor={theme.border}
      focusedBorderColor={theme.borderFocus}
      padding={0}
    >
      <text
        content={isStreaming ? " streaming... " : " > "}
        fg={isStreaming ? theme.streaming : theme.userText}
      />
      <input
        ref={inputRef}
        placeholder="Type a message..."
        focused={isFocused}
        value={inputValue}
        onInput={setInputValue}
        onSubmit={handleSubmit}
        flexGrow={1}
        cursorColor={theme.accent}
        textColor={theme.text}
        placeholderColor={theme.textMuted}
      />
    </box>
  )
}
```

**Changes from current code:**
- Removed all 6 `useRef` stale-closure workarounds — handler reads state directly
- Added `inputRef` prop (forwarded to `<input>`) for imperative focus from parent
- Added `borderColor`, `focusedBorderColor` from theme
- Added `cursorColor`, `textColor`, `placeholderColor` from theme
- Replaced hardcoded color strings with theme constants

**Step 2: Run typecheck**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"`
Expected: No errors (the `inputRef` prop is optional, so App.tsx doesn't need to change yet)

> **Note for implementer:** If `cursorColor`, `textColor`, or `placeholderColor` props cause type errors on the `<input>` element, check the OpenTUI React component props at `node_modules/@opentui/react/.../components.d.ts`. The prop names may differ (e.g., `fg` instead of `textColor`). Adjust accordingly. Check `.reference/opentui/packages/core/src/examples/input-demo.ts` for working examples.

**Step 3: Run tests**

Run: `bun run test`
Expected: All tests pass

**Step 4: Commit**

```bash
git add packages/tui/src/components/InputBar.tsx
git commit -m "refactor(tui): remove stale closure refs, add input ref and theme"
```

---

### Task 3: ChatPane — sticky scroll and theme

**Files:**
- Modify: `packages/tui/src/components/ChatPane.tsx`

**Step 1: Update `ChatPane.tsx`**

```tsx
import { useAtomValue } from "@effect/atom-react"
import { messagesAtom } from "../atoms/session.js"
import { theme } from "../theme.js"
import { MessageBubble } from "./MessageBubble.js"

export function ChatPane() {
  const messages = useAtomValue(messagesAtom)

  return (
    <box
      flexDirection="column"
      flexGrow={2}
      border={true}
      borderStyle="single"
      borderColor={theme.border}
      padding={1}
    >
      <text content=" Chat " fg={theme.accent} />
      <scrollbox flexGrow={1} stickyScroll={true} stickyStart="bottom">
        {messages.length === 0 ? (
          <text content="No messages yet. Type below to start." fg={theme.textMuted} />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={`${msg.turnId}-${i}`} message={msg} />
          ))
        )}
      </scrollbox>
    </box>
  )
}
```

**Changes:**
- Added `stickyScroll={true} stickyStart="bottom"` to scrollbox — auto-scrolls to new messages
- Replaced hardcoded `"cyan"` with `theme.accent`
- Replaced hardcoded `"gray"` with `theme.textMuted`
- Added `borderColor` from theme
- Removed `borderStyle="single"` only if it's the default — keep it if needed

> **Note for implementer:** If `stickyScroll` or `stickyStart` props cause type errors, they may need to be passed differently. Check `node_modules/@opentui/react/.../components.d.ts` for `ScrollBoxProps`. Also check `.reference/opentui/packages/core/src/examples/sticky-scroll-example.ts` for the pattern.

**Step 2: Run typecheck and tests**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"` — expect no errors
Run: `bun run test` — expect all pass

**Step 3: Commit**

```bash
git add packages/tui/src/components/ChatPane.tsx
git commit -m "feat(tui): add sticky scroll and theme to ChatPane"
```

---

### Task 4: ToolPane — sticky scroll, focus border, and theme

**Files:**
- Modify: `packages/tui/src/components/ToolPane.tsx`

**Step 1: Update `ToolPane.tsx`**

```tsx
import { useAtomValue } from "@effect/atom-react"
import { toolEventsAtom } from "../atoms/session.js"
import { theme } from "../theme.js"

export function ToolPane({ focused }: { readonly focused: boolean }) {
  const toolEvents = useAtomValue(toolEventsAtom)

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      border={true}
      borderStyle="single"
      borderColor={theme.border}
      focusedBorderColor={theme.borderFocus}
      padding={1}
    >
      <text content=" Tools " fg={theme.streaming} />
      <scrollbox flexGrow={1} focused={focused} stickyScroll={true} stickyStart="bottom">
        {toolEvents.length === 0 ? (
          <text content="No tool calls." fg={theme.textMuted} />
        ) : (
          toolEvents.map((tool) => (
            <box key={tool.toolCallId} flexDirection="column">
              <text
                content={`${tool.status === "called" ? "\u23F3" : tool.isError ? "\u274C" : "\u2713"} ${tool.toolName}`}
                fg={tool.isError ? theme.error : tool.status === "called" ? theme.streaming : theme.statusConnected}
              />
              {tool.outputJson ? (
                <text content={`  \u2192 ${tool.outputJson.slice(0, 80)}`} fg={theme.textMuted} />
              ) : null}
            </box>
          ))
        )}
      </scrollbox>
    </box>
  )
}
```

**Changes:**
- Added `stickyScroll={true} stickyStart="bottom"` to scrollbox
- Added `borderColor` and `focusedBorderColor` for focus indication
- Replaced hardcoded colors with theme constants

**Step 2: Run typecheck and tests**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"` — expect no errors
Run: `bun run test` — expect all pass

**Step 3: Commit**

```bash
git add packages/tui/src/components/ToolPane.tsx
git commit -m "feat(tui): add sticky scroll, focus border, and theme to ToolPane"
```

---

### Task 5: ModalBox + ModalLayer — theme and focus trapping

**Files:**
- Modify: `packages/tui/src/components/ModalBox.tsx`
- Modify: `packages/tui/src/components/ModalLayer.tsx`

**Step 1: Update `ModalBox.tsx`**

```tsx
import * as React from "react"
import { theme } from "../theme.js"

export function ModalBox({
  title,
  children,
  width = "60%",
  height = "60%"
}: {
  readonly title: string
  readonly children: React.ReactNode
  readonly width?: `${number}%` | number
  readonly height?: `${number}%` | number
}) {
  return (
    <box
      position="absolute"
      left="20%"
      top="20%"
      width={width}
      height={height}
      border={true}
      borderStyle="single"
      borderColor={theme.borderFocus}
      backgroundColor={theme.surface}
      flexDirection="column"
      padding={1}
      title={` ${title} `}
    >
      <box flexDirection="column" flexGrow={1}>
        {children}
      </box>
    </box>
  )
}
```

**Changes:**
- `backgroundColor="black"` → `theme.surface`
- Added `borderColor={theme.borderFocus}` (modals always have the focus border)
- Import `theme`

**Step 2: Update `ModalLayer.tsx`**

```tsx
import * as React from "react"
import type { ModalId } from "../types.js"
import { theme } from "../theme.js"
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
  void onClose

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
          backgroundColor={theme.bg}
        >
          {renderModal(activeModal)}
        </box>
      )}
    </box>
  )
}

function renderModal(modalId: ModalId): React.ReactNode {
  switch (modalId) {
    case "command-palette":
      return (
        <ModalBox title="Command Palette" width="70%" height="40%">
          <text content="Command palette coming soon..." fg={theme.textMuted} />
        </ModalBox>
      )
    case "session-picker":
      return (
        <ModalBox title="Sessions" width="60%" height="60%">
          <text content="Session picker coming soon..." fg={theme.textMuted} />
        </ModalBox>
      )
    case "settings":
      return (
        <ModalBox title="Settings" width="50%" height="50%">
          <text content="Settings coming soon..." fg={theme.textMuted} />
        </ModalBox>
      )
    case "memory-search":
      return (
        <ModalBox title="Memory Search" width="60%" height="60%">
          <text content="Memory search coming soon..." fg={theme.textMuted} />
        </ModalBox>
      )
    case "tool-inspector":
      return (
        <ModalBox title="Tool Inspector" width="80%" height="80%">
          <text content="Tool inspector coming soon..." fg={theme.textMuted} />
        </ModalBox>
      )
  }
}
```

**Changes:**
- Import theme
- Backdrop `backgroundColor={theme.bg}` (solid dark background)
- All placeholder text uses `theme.textMuted`

**Step 3: Run typecheck and tests**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"` — expect no errors
Run: `bun run test` — expect all pass

**Step 4: Commit**

```bash
git add packages/tui/src/components/ModalBox.tsx packages/tui/src/components/ModalLayer.tsx
git commit -m "feat(tui): apply theme to ModalBox and ModalLayer"
```

---

### Task 6: MessageBubble + StatusBar — theme colors

**Files:**
- Modify: `packages/tui/src/components/MessageBubble.tsx`
- Modify: `packages/tui/src/components/StatusBar.tsx`

**Step 1: Update `MessageBubble.tsx`**

```tsx
import * as React from "react"
import type { ChatMessage } from "../types.js"
import { theme } from "../theme.js"
import { SyntaxStyleContext } from "./SyntaxStyleContext.js"

export function MessageBubble({ message }: { readonly message: ChatMessage }) {
  const syntaxStyle = React.useContext(SyntaxStyleContext)

  if (message.role === "user") {
    return (
      <box flexDirection="column">
        <text content={`> ${message.content}`} fg={theme.userText} />
      </box>
    )
  }

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
          fg={message.status === "failed" ? theme.error : theme.text}
        />
      )}
      {message.errorMessage ? (
        <text content={`  [error: ${message.errorMessage}]`} fg={theme.error} />
      ) : null}
    </box>
  )
}
```

**Changes:** Replace `"green"` → `theme.userText`, `"red"` → `theme.error`, `"white"` → `theme.text`

**Step 2: Update `StatusBar.tsx`**

```tsx
import { useAtomValue } from "@effect/atom-react"
import { channelIdAtom, connectionStatusAtom, isStreamingAtom, messageCountAtom } from "../atoms/session.js"
import { theme } from "../theme.js"

export function StatusBar() {
  const channelId = useAtomValue(channelIdAtom)
  const status = useAtomValue(connectionStatusAtom)
  const isStreaming = useAtomValue(isStreamingAtom)
  const count = useAtomValue(messageCountAtom)

  const shortId = channelId.length > 20 ? `${channelId.slice(0, 20)}...` : channelId
  const statusColor =
    status === "connected" ? theme.statusConnected
    : status === "error" ? theme.statusError
    : theme.statusPending
  const streamLabel = isStreaming ? " | streaming" : ""

  return (
    <box backgroundColor={theme.surface}>
      <text
        content={` ${shortId} | ${status}${streamLabel} | ${count} msgs | ^K palette  ^S sessions  ^M memory  ^C exit `}
        fg={theme.textMuted}
      />
    </box>
  )
}
```

**Changes:**
- Import theme
- Status colors from theme constants
- Text uses `theme.textMuted` (de-emphasized, reference info)
- Background uses `theme.surface` to visually separate from chat area

**Step 3: Run typecheck and tests**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"` — expect no errors
Run: `bun run test` — expect all pass

**Step 4: Commit**

```bash
git add packages/tui/src/components/MessageBubble.tsx packages/tui/src/components/StatusBar.tsx
git commit -m "feat(tui): apply theme to MessageBubble and StatusBar"
```

---

### Task 7: App.tsx + bin.tsx — responsive layout, background, input ref wiring

**Files:**
- Modify: `packages/tui/src/App.tsx`
- Modify: `packages/tui/src/bin.tsx`

**Step 1: Update `App.tsx`**

```tsx
import { ChatClient } from "@template/client/ChatClient"
import { RegistryContext, useAtomValue } from "@effect/atom-react"
import { Effect, ServiceMap } from "effect"
import * as React from "react"
// @ts-expect-error -- @opentui/react .d.ts uses extensionless re-exports incompatible with NodeNext resolution
import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import { channelIdAtom, connectionStatusAtom, messagesAtom, modalAtom } from "./atoms/session.js"
import { ChatPane } from "./components/ChatPane.js"
import { InputBar } from "./components/InputBar.js"
import { ModalLayer } from "./components/ModalLayer.js"
import { StatusBar } from "./components/StatusBar.js"
import { ToolPane } from "./components/ToolPane.js"
import { useSendMessage } from "./hooks/useSendMessage.js"
import { theme } from "./theme.js"
import type { ChatMessage } from "./types.js"

type ChatClientShape = ServiceMap.Service.Shape<typeof ChatClient>

type FocusTarget = "input" | "tools"

export function App({ client }: { readonly client: ChatClientShape }) {
  const registry = React.useContext(RegistryContext)
  const sendMessage = useSendMessage(client)
  const [focusTarget, setFocusTarget] = React.useState<FocusTarget>("input")
  const activeModal = useAtomValue(modalAtom)
  const { width } = useTerminalDimensions()
  const inputRef = React.useRef(null)

  const showToolPane = width >= 80

  useKeyboard((key: { name: string; ctrl: boolean }) => {
    if (key.ctrl && key.name === "c") {
      process.exit(0)
    }

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
    if (key.ctrl && key.name === ",") {
      registry.set(modalAtom, "settings")
      return
    }
    if (key.ctrl && key.name === "m") {
      registry.set(modalAtom, "memory-search")
      return
    }

    if (key.name === "tab" && activeModal === null) {
      setFocusTarget((prev) => (prev === "input" ? "tools" : "input"))
    }
  })

  const closeModal = React.useCallback(() => {
    registry.set(modalAtom, null)
  }, [registry])

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
      <box flexDirection="column" flexGrow={1} backgroundColor={theme.bg}>
        <box flexDirection="row" flexGrow={1}>
          <ChatPane />
          {showToolPane && (
            <ToolPane focused={focusTarget === "tools" && activeModal === null} />
          )}
        </box>
        <InputBar
          onSubmit={sendMessage}
          focused={focusTarget === "input" && activeModal === null}
          inputRef={inputRef}
        />
        <StatusBar />
      </box>
    </ModalLayer>
  )
}
```

**Changes:**
- Import `useTerminalDimensions` from `@opentui/react`
- `const { width } = useTerminalDimensions()` — reactive terminal width
- `showToolPane = width >= 80` — hide tool pane on narrow terminals
- `inputRef` created and passed to `InputBar`
- `backgroundColor={theme.bg}` on main container
- Import theme

> **Note for implementer:** `useTerminalDimensions` is exported from `@opentui/react` hooks. It's behind the same `@ts-expect-error` pragma as `useKeyboard`. If it fails, check `.reference/opentui/packages/react/src/hooks/use-terminal-dimensions.ts` for the implementation and create a local version.

**Step 2: Update `bin.tsx` — app background**

No changes needed to `bin.tsx` — the background is now set on the main `<box>` in `App.tsx`. The SyntaxStyle and Registry providers stay as-is.

**Step 3: Run typecheck and tests**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"` — expect no errors
Run: `bun run test` — expect all pass

**Step 4: Commit**

```bash
git add packages/tui/src/App.tsx
git commit -m "feat(tui): responsive layout, input ref, and theme background"
```

---

### Task 8: Create `useClipboard` hook

**Files:**
- Create: `packages/tui/src/hooks/useClipboard.ts`
- Create: `packages/tui/test/useClipboard.test.ts`

**Step 1: Write the test**

Create `packages/tui/test/useClipboard.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { useClipboard } from "../src/hooks/useClipboard.js"

describe("useClipboard", () => {
  it("exports a hook function", () => {
    expect(typeof useClipboard).toBe("function")
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun run test -- --reporter=verbose packages/tui/test/useClipboard.test.ts`
Expected: FAIL — cannot find module

**Step 3: Create the hook**

Create `packages/tui/src/hooks/useClipboard.ts`:

```typescript
import * as React from "react"
// @ts-expect-error -- @opentui/react .d.ts uses extensionless re-exports incompatible with NodeNext resolution
import { useRenderer } from "@opentui/react"

export function useClipboard() {
  const renderer = useRenderer()

  const copy = React.useCallback(
    (text: string): boolean => {
      return renderer.copyToClipboardOSC52(text)
    },
    [renderer]
  )

  return { copy }
}
```

> **Note for implementer:** If `copyToClipboardOSC52` doesn't exist on the renderer, check `.reference/opentui/packages/core/src/renderer.ts` for the actual method name. It may be `copyToClipboard` or accessed via a different path. If clipboard isn't available at the renderer level, export a no-op `{ copy: () => false }` and add a TODO comment.

**Step 4: Run test to verify it passes**

Run: `bun run test -- --reporter=verbose packages/tui/test/useClipboard.test.ts`
Expected: PASS (1 test)

**Step 5: Commit**

```bash
git add packages/tui/src/hooks/useClipboard.ts packages/tui/test/useClipboard.test.ts
git commit -m "feat(tui): add useClipboard hook for OSC52 clipboard"
```

---

### Task 9: End-to-end verification

**Step 1: Typecheck**

Run: `bun run check 2>&1 | grep "error TS" | grep -v "bun:test"`
Expected: No errors

**Step 2: Run full test suite**

Run: `bun run test`
Expected: All tests pass

**Step 3: Run lint**

Run: `bun run lint`
Expected: No new errors

**Step 4: Visual verification**

Run: `bun packages/tui/src/bin.tsx`

Verify:
1. App background is dark (`#1a1b26`)
2. Panel borders are dim gray, focused panel border lights up blue
3. Input cursor is cyan
4. ChatPane auto-scrolls to new messages
5. ToolPane auto-scrolls to new tool events
6. StatusBar has muted text on dark surface background
7. User messages are sage green, assistant text is off-white
8. Error messages are muted red
9. Modal overlays have dark surface background with blue border
10. Resize terminal — ToolPane hides below 80 columns
11. All keybindings still work (Ctrl+K, Ctrl+S, Ctrl+M, Escape, Tab)

**Step 5: List all commits on this slice**

Run: `git log --oneline -10`

Expected: 8 commits for this slice:
1. `feat(tui): add refined-minimal color theme`
2. `refactor(tui): remove stale closure refs, add input ref and theme`
3. `feat(tui): add sticky scroll and theme to ChatPane`
4. `feat(tui): add sticky scroll, focus border, and theme to ToolPane`
5. `feat(tui): apply theme to ModalBox and ModalLayer`
6. `feat(tui): apply theme to MessageBubble and StatusBar`
7. `feat(tui): responsive layout, input ref, and theme background`
8. `feat(tui): add useClipboard hook for OSC52 clipboard`

---

## Files Summary

| File | Action |
|------|--------|
| `packages/tui/src/theme.ts` | Create — color palette constants |
| `packages/tui/src/hooks/useClipboard.ts` | Create — clipboard hook |
| `packages/tui/test/useClipboard.test.ts` | Create — clipboard test |
| `packages/tui/src/components/InputBar.tsx` | Modify — remove refs, add input ref + theme |
| `packages/tui/src/components/ChatPane.tsx` | Modify — sticky scroll + theme |
| `packages/tui/src/components/ToolPane.tsx` | Modify — sticky scroll + focus border + theme |
| `packages/tui/src/components/ModalBox.tsx` | Modify — theme colors |
| `packages/tui/src/components/ModalLayer.tsx` | Modify — theme colors |
| `packages/tui/src/components/MessageBubble.tsx` | Modify — theme colors |
| `packages/tui/src/components/StatusBar.tsx` | Modify — theme colors + surface bg |
| `packages/tui/src/App.tsx` | Modify — responsive layout, input ref, background |

## Verification

```bash
bun run check           # typecheck — no errors
bun run test            # full suite — all pass
bun run lint            # no new errors
bun packages/tui/src/bin.tsx   # visual — theme + scroll + responsive
```
