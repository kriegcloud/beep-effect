# TUI Layout Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the TUI from a 67/33 chat/tool split into an 80/20 chat/sidebar layout with markdown rendering, inline tool events, context visualization, and polished status/input bars.

**Architecture:** Replace ToolPane with a narrow SidePanel (session + tools + context bar). Tool events render inline in ChatPane using existing formatters. Enable dead-coded markdown rendering via SyntaxStyleContext. Refactor session picker to use OpenTUI's built-in `<select>`.

**Tech Stack:** OpenTUI (@opentui/react, @opentui/core), Effect atoms, React

---

### Task 1: Enable Markdown Rendering

**Files:**
- Modify: `packages/tui/src/App.tsx`
- Modify: `packages/tui/src/components/SyntaxStyleContext.ts`

**Step 1: Create a default SyntaxStyle in App.tsx**

Add the import and create a module-level style instance. Wrap the render tree in a Provider.

```tsx
// At top of App.tsx, add import:
// @ts-expect-error -- @opentui/core .d.ts uses extensionless re-exports incompatible with NodeNext resolution
import { SyntaxStyle } from "@opentui/core"
import { SyntaxStyleContext } from "./components/SyntaxStyleContext.js"

// After the DEFAULT_AGENT_ID constant:
const defaultSyntaxStyle = SyntaxStyle.fromStyles({})
```

Then wrap the return JSX in `<SyntaxStyleContext.Provider value={defaultSyntaxStyle}>` around the outermost `<ModalLayer>`.

**Step 2: Run typecheck**

Run: `bunx tsc --noEmit -p packages/tui/tsconfig.json`
Expected: Clean (0 errors)

**Step 3: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All tests pass (MessageBubble tests may need adjustment if SyntaxStyleContext affects rendering)

**Step 4: Commit**

```bash
git add packages/tui/src/App.tsx
git commit -m "feat(tui): enable markdown rendering via SyntaxStyleContext"
```

---

### Task 2: Create ToolCallInline Component

**Files:**
- Create: `packages/tui/src/components/ToolCallInline.tsx`
- Create: `packages/tui/test/ToolCallInline.test.ts`

**Step 1: Write the test**

```typescript
// packages/tui/test/ToolCallInline.test.ts
import { describe, expect, it } from "vitest"
import { formatToolInput, formatToolOutput } from "../src/formatters/toolSummary.js"
import type { ToolEvent } from "../src/types.js"

// Test the formatting logic that ToolCallInline will use — the component
// itself is React/JSX so we test the data transformation, not rendering.

describe("ToolCallInline formatting", () => {
  const makeEvent = (overrides: Partial<ToolEvent>): ToolEvent => ({
    turnId: "t1",
    toolCallId: "tc1",
    toolName: "file_read",
    inputJson: '{"path":"/src/foo.ts"}',
    outputJson: null,
    isError: false,
    status: "called",
    ...overrides
  })

  it("in-flight tool shows name + input summary", () => {
    const event = makeEvent({})
    const input = formatToolInput(event.toolName, event.inputJson)
    expect(input).toBe("/src/foo.ts")
  })

  it("completed tool shows output summary", () => {
    const event = makeEvent({
      status: "completed",
      outputJson: '{"content":"hello world"}'
    })
    const output = formatToolOutput(event.toolName, event.outputJson, event.isError)
    expect(output).toBe("11 chars")
  })

  it("error tool shows error summary", () => {
    const event = makeEvent({
      status: "completed",
      isError: true,
      outputJson: '{"errorCode":"NOT_FOUND","message":"File not found"}'
    })
    const output = formatToolOutput(event.toolName, event.outputJson, event.isError)
    expect(output).toBe("ERR: NOT_FOUND: File not found")
  })
})
```

**Step 2: Run test to verify it passes**

Run: `cd packages/tui && bun run test -- test/ToolCallInline.test.ts`
Expected: PASS (it uses existing formatters)

**Step 3: Write the component**

```tsx
// packages/tui/src/components/ToolCallInline.tsx
import * as React from "react"
import { formatToolInput, formatToolOutput } from "../formatters/toolSummary.js"
import { theme } from "../theme.js"
import type { ToolEvent } from "../types.js"

const statusIcon = (tool: ToolEvent): string =>
  tool.status === "called" ? "\u23F3" : tool.isError ? "\u274C" : "\u2713"

const statusColor = (tool: ToolEvent): string =>
  tool.isError ? theme.error : tool.status === "called" ? theme.streaming : theme.statusConnected

const ToolCallInlineRow = React.memo(function ToolCallInlineRow({ tool }: { readonly tool: ToolEvent }) {
  const inputSummary = formatToolInput(tool.toolName, tool.inputJson)
  const outputSummary = formatToolOutput(tool.toolName, tool.outputJson, tool.isError)
  const header = inputSummary.length > 0
    ? `  ${statusIcon(tool)} ${tool.toolName} ${inputSummary}`
    : `  ${statusIcon(tool)} ${tool.toolName}`

  return (
    <box flexDirection="column">
      <text content={header} fg={statusColor(tool)} />
      {outputSummary.length > 0 ? (
        <text content={`    \u2192 ${outputSummary}`} fg={tool.isError ? theme.error : theme.textMuted} />
      ) : null}
    </box>
  )
})

export const ToolCallInline = React.memo(function ToolCallInline({
  tools
}: {
  readonly tools: ReadonlyArray<ToolEvent>
}) {
  if (tools.length === 0) return null
  return (
    <box flexDirection="column">
      {tools.map((tool) => (
        <ToolCallInlineRow key={tool.toolCallId} tool={tool} />
      ))}
    </box>
  )
})
```

**Step 4: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass

**Step 5: Commit**

```bash
git add packages/tui/src/components/ToolCallInline.tsx packages/tui/test/ToolCallInline.test.ts
git commit -m "feat(tui): add ToolCallInline component for inline tool display"
```

---

### Task 3: Update ChatPane with Inline Tools and Message Spacing

**Files:**
- Modify: `packages/tui/src/components/ChatPane.tsx`
- Modify: `packages/tui/src/components/MessageBubble.tsx`

**Step 1: Update ChatPane to interleave tool events**

Replace the entire `ChatPane.tsx` with:

```tsx
// packages/tui/src/components/ChatPane.tsx
import { useAtomValue } from "@effect/atom-react"
import { messagesAtom, toolEventsAtom } from "../atoms/session.js"
import { theme } from "../theme.js"
import type { ToolEvent } from "../types.js"
import { MessageBubble } from "./MessageBubble.js"
import { ToolCallInline } from "./ToolCallInline.js"

const groupToolsByTurn = (tools: ReadonlyArray<ToolEvent>): Map<string, ReadonlyArray<ToolEvent>> => {
  const grouped = new Map<string, Array<ToolEvent>>()
  for (const tool of tools) {
    const existing = grouped.get(tool.turnId)
    if (existing) {
      existing.push(tool)
    } else {
      grouped.set(tool.turnId, [tool])
    }
  }
  return grouped
}

export function ChatPane() {
  const messages = useAtomValue(messagesAtom)
  const toolEvents = useAtomValue(toolEventsAtom)
  const toolsByTurn = groupToolsByTurn(toolEvents)

  return (
    <box
      flexDirection="column"
      flexGrow={4}
      border={true}
      borderStyle="single"
      borderColor={theme.border}
      padding={1}
    >
      <scrollbox flexGrow={1} stickyScroll={true} stickyStart="bottom">
        {messages.length === 0 ? (
          <text content="No messages yet. Type below to start." fg={theme.textMuted} />
        ) : (
          messages.map((msg, i) => {
            const turnTools = msg.role === "assistant" ? (toolsByTurn.get(msg.turnId) ?? []) : []
            return (
              <box key={`${msg.turnId}-${i}`} flexDirection="column" marginTop={i > 0 ? 1 : 0}>
                <MessageBubble message={msg} />
                {turnTools.length > 0 ? <ToolCallInline tools={turnTools} /> : null}
              </box>
            )
          })
        )}
      </scrollbox>
    </box>
  )
}
```

Key changes from current:
- `flexGrow` changed from `2` to `4` (80/20 split with sidebar `flexGrow=1`)
- Removed the ` Chat ` title text
- Added `marginTop={i > 0 ? 1 : 0}` for spacing between messages
- Interleaves `ToolCallInline` after each assistant message, grouped by `turnId`
- Imports `toolEventsAtom`

**Step 2: Dim user messages in MessageBubble**

In `packages/tui/src/components/MessageBubble.tsx`, change the user message rendering from green to dimmed base color:

Replace:
```tsx
    return (
      <box flexDirection="column">
        <text content={`> ${message.content}`} fg={theme.userText} />
      </box>
    )
```

With:
```tsx
    return (
      <box flexDirection="column">
        <text content={`> ${message.content}`} fg={theme.textMuted} />
      </box>
    )
```

**Step 3: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass

**Step 4: Commit**

```bash
git add packages/tui/src/components/ChatPane.tsx packages/tui/src/components/MessageBubble.tsx
git commit -m "feat(tui): inline tool events in chat, message spacing, dim user text"
```

---

### Task 4: Create ContextBar Component

**Files:**
- Create: `packages/tui/src/components/ContextBar.tsx`
- Create: `packages/tui/test/ContextBar.test.ts`
- Modify: `packages/tui/src/atoms/session.ts`

**Step 1: Add contextUsageAtom to atoms/session.ts**

```typescript
// Add to atoms/session.ts after existing atoms

export interface ContextUsage {
  readonly system: number    // percentage 0-100
  readonly persona: number
  readonly memory: number
  readonly history: number
  readonly tools: number
  readonly totalTokens: number
  readonly capacityTokens: number
}

export const contextUsageAtom = Atom.make<ContextUsage>({
  system: 12,
  persona: 4,
  memory: 9,
  history: 0,
  tools: 0,
  totalTokens: 0,
  capacityTokens: 100000
})
```

Also add a derived atom that estimates usage from message/tool counts:

```typescript
export const estimatedContextAtom = Atom.make((get: Atom.Context): ContextUsage => {
  const msgs = get(messagesAtom)
  const tools = get(toolEventsAtom)
  const capacity = 100000
  const systemTokens = 12000
  const personaTokens = 4000
  const memoryTokens = 9000
  const historyTokens = msgs.length * 800
  const toolTokens = tools.length * 500
  const total = systemTokens + personaTokens + memoryTokens + historyTokens + toolTokens
  const pct = (n: number) => Math.round((n / capacity) * 100)
  return {
    system: pct(systemTokens),
    persona: pct(personaTokens),
    memory: pct(memoryTokens),
    history: pct(historyTokens),
    tools: pct(toolTokens),
    totalTokens: total,
    capacityTokens: capacity
  }
})
```

**Step 2: Write the test**

```typescript
// packages/tui/test/ContextBar.test.ts
import { describe, expect, it } from "vitest"
import type { ContextUsage } from "../src/atoms/session.js"

// Pure logic tests for the bar rendering helpers

const renderSegment = (label: string, pct: number, barWidth: number): string => {
  const filled = Math.round((pct / 100) * barWidth)
  const empty = barWidth - filled
  return `${label.padEnd(10)}${"█".repeat(filled)}${"░".repeat(empty)}  ${pct}%`
}

const totalPct = (usage: ContextUsage): number =>
  usage.system + usage.persona + usage.memory + usage.history + usage.tools

const formatTokens = (n: number): string =>
  n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)

describe("ContextBar helpers", () => {
  const usage: ContextUsage = {
    system: 12, persona: 4, memory: 9, history: 38, tools: 4,
    totalTokens: 67000, capacityTokens: 100000
  }

  it("renders a segment bar", () => {
    const result = renderSegment("system", 12, 8)
    expect(result).toBe("system    █░░░░░░░  12%")
  })

  it("calculates total percentage", () => {
    expect(totalPct(usage)).toBe(67)
  })

  it("formats token counts", () => {
    expect(formatTokens(67000)).toBe("67K")
    expect(formatTokens(500)).toBe("500")
  })
})
```

**Step 3: Run test**

Run: `cd packages/tui && bun run test -- test/ContextBar.test.ts`
Expected: PASS

**Step 4: Write the component**

```tsx
// packages/tui/src/components/ContextBar.tsx
import { useAtomValue } from "@effect/atom-react"
import { estimatedContextAtom, type ContextUsage } from "../atoms/session.js"
import { theme } from "../theme.js"

const SEGMENT_COLORS: Record<string, string> = {
  system: "#7aa2f7",
  persona: "#9ece6a",
  memory: "#e0af68",
  history: "#7dcfff",
  tools: "#bb9af7"
}

const SEGMENTS: ReadonlyArray<{ key: keyof ContextUsage & string; label: string }> = [
  { key: "system", label: "system" },
  { key: "persona", label: "persona" },
  { key: "memory", label: "memory" },
  { key: "history", label: "history" },
  { key: "tools", label: "tools" }
]

const formatTokens = (n: number): string =>
  n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)

const summaryColor = (pct: number): string =>
  pct < 60 ? theme.statusConnected : pct < 85 ? theme.statusPending : theme.statusError

export function ContextBar() {
  const usage = useAtomValue(estimatedContextAtom)
  const totalPct = usage.system + usage.persona + usage.memory + usage.history + usage.tools
  const barWidth = 12
  const summaryFilled = Math.round((totalPct / 100) * barWidth)

  return (
    <box flexDirection="column">
      <text content={` Context (${totalPct}%)`} fg={theme.accent} />
      {SEGMENTS.map(({ key, label }, i) => {
        const pct = usage[key] as number
        if (pct === 0) return null
        const filled = Math.round((pct / 100) * (barWidth - 2))
        const empty = (barWidth - 2) - filled
        const prefix = i < SEGMENTS.length - 1 ? " \u251C" : " \u2514"
        return (
          <text
            key={key}
            content={`${prefix} ${label.padEnd(9)}${"█".repeat(filled)}${"░".repeat(empty)} ${String(pct).padStart(2)}%`}
            fg={SEGMENT_COLORS[key] ?? theme.textMuted}
          />
        )
      })}
      <text content={` ${"─".repeat(barWidth + 6)}`} fg={theme.border} />
      <text
        content={`  ${"█".repeat(summaryFilled)}${"░".repeat(barWidth - summaryFilled)}`}
        fg={summaryColor(totalPct)}
      />
      <text
        content={`  ${formatTokens(usage.totalTokens)} / ${formatTokens(usage.capacityTokens)} tokens`}
        fg={theme.textMuted}
      />
    </box>
  )
}
```

**Step 5: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass

**Step 6: Commit**

```bash
git add packages/tui/src/atoms/session.ts packages/tui/src/components/ContextBar.tsx packages/tui/test/ContextBar.test.ts
git commit -m "feat(tui): add ContextBar with stacked capacity visualization"
```

---

### Task 5: Create SidePanel (Replaces ToolPane)

**Files:**
- Create: `packages/tui/src/components/SidePanel.tsx`
- Modify: `packages/tui/src/App.tsx`
- Delete: `packages/tui/src/components/ToolPane.tsx`

**Step 1: Write SidePanel component**

```tsx
// packages/tui/src/components/SidePanel.tsx
import { useAtomValue } from "@effect/atom-react"
import {
  channelIdAtom,
  connectionStatusAtom,
  messageCountAtom,
  toolEventsAtom
} from "../atoms/session.js"
import { theme } from "../theme.js"
import { ContextBar } from "./ContextBar.js"

const connectionDot = (status: string): { dot: string; color: string } => {
  switch (status) {
    case "connected": return { dot: "●", color: theme.statusConnected }
    case "connecting": return { dot: "●", color: theme.statusPending }
    case "error": return { dot: "●", color: theme.statusError }
    default: return { dot: "○", color: theme.textMuted }
  }
}

export function SidePanel() {
  const channelId = useAtomValue(channelIdAtom)
  const status = useAtomValue(connectionStatusAtom)
  const msgCount = useAtomValue(messageCountAtom)
  const toolEvents = useAtomValue(toolEventsAtom)
  const { dot, color: dotColor } = connectionDot(status)
  const shortId = channelId.length > 8 ? channelId.slice(0, 8) : channelId

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      border={["left"]}
      borderStyle="single"
      borderColor={theme.border}
      paddingLeft={1}
      paddingRight={1}
    >
      {/* Session */}
      <text content=" Session" fg={theme.accent} />
      <text content={`  ${shortId}`} fg={theme.textMuted} />
      <text content={`  ${dot} ${status}`} fg={dotColor} />
      <text content={`  ${msgCount} msgs`} fg={theme.textMuted} />

      {/* Tools */}
      <box marginTop={1} flexDirection="column" flexGrow={1}>
        <text content=" Tools" fg={theme.accent} />
        {toolEvents.length === 0 ? (
          <text content="  (none)" fg={theme.textMuted} />
        ) : (
          <scrollbox flexGrow={1} stickyScroll={true} stickyStart="bottom">
            {toolEvents.map((tool) => (
              <text
                key={tool.toolCallId}
                content={`  ${tool.status === "called" ? "\u23F3" : tool.isError ? "\u274C" : "\u2713"} ${tool.toolName}`}
                fg={tool.isError ? theme.error : tool.status === "called" ? theme.streaming : theme.statusConnected}
              />
            ))}
          </scrollbox>
        )}
      </box>

      {/* Context */}
      <box marginTop={1} flexDirection="column">
        <ContextBar />
      </box>
    </box>
  )
}
```

**Step 2: Wire SidePanel into App.tsx, remove ToolPane**

In `App.tsx`:
- Replace `import { ToolPane } from "./components/ToolPane.js"` with `import { SidePanel } from "./components/SidePanel.js"`
- Change the collapse threshold from `width >= 80` to `width >= 100`
- Replace `<ToolPane focused={...} />` with `<SidePanel />`
- Remove the Tab key focus-switching logic (SidePanel has no focused state)

The relevant JSX section becomes:

```tsx
<box flexDirection="row" flexGrow={1}>
  <ChatPane />
  {showSidePanel && <SidePanel />}
</box>
```

Where `const showSidePanel = width >= 100`.

**Step 3: Delete ToolPane.tsx**

Remove `packages/tui/src/components/ToolPane.tsx`.

**Step 4: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass (no tests directly tested ToolPane rendering)

**Step 5: Run typecheck**

Run: `bunx tsc --noEmit -p packages/tui/tsconfig.json`
Expected: Clean

**Step 6: Commit**

```bash
git add packages/tui/src/components/SidePanel.tsx packages/tui/src/App.tsx
git rm packages/tui/src/components/ToolPane.tsx
git commit -m "feat(tui): replace ToolPane with SidePanel (session, tools, context)"
```

---

### Task 6: Polish StatusBar

**Files:**
- Modify: `packages/tui/src/components/StatusBar.tsx`

**Step 1: Rewrite StatusBar with structured segments**

```tsx
// packages/tui/src/components/StatusBar.tsx
import { useAtomValue } from "@effect/atom-react"
import {
  channelIdAtom,
  connectionStatusAtom,
  messageCountAtom,
  pendingCheckpointAtom
} from "../atoms/session.js"
import { theme } from "../theme.js"

const connectionDot = (status: string): { dot: string; color: string } => {
  switch (status) {
    case "connected": return { dot: "●", color: theme.statusConnected }
    case "connecting": return { dot: "●", color: theme.statusPending }
    case "error": return { dot: "●", color: theme.statusError }
    default: return { dot: "○", color: theme.textMuted }
  }
}

export function StatusBar() {
  const channelId = useAtomValue(channelIdAtom)
  const status = useAtomValue(connectionStatusAtom)
  const count = useAtomValue(messageCountAtom)
  const checkpoint = useAtomValue(pendingCheckpointAtom)
  const { dot, color: dotColor } = connectionDot(status)

  const shortId = channelId.length > 8 ? channelId.slice(0, 8) : channelId
  const shortcuts = checkpoint
    ? "^Y approve  ^N reject  ^D defer"
    : "^S sessions  ^M memory  ^K cmd"

  return (
    <box backgroundColor={theme.surface} flexDirection="row">
      <text content={` ${shortId} `} fg={theme.textMuted} />
      <text content="│" fg={theme.border} />
      <text content={` ${dot} ${status} `} fg={dotColor} />
      <text content="│" fg={theme.border} />
      <text content={` ${count} msgs `} fg={theme.textMuted} />
      <text content="│" fg={theme.border} />
      <box flexGrow={1} justifyContent="flex-end">
        <text content={`${shortcuts} `} fg={checkpoint ? theme.statusPending : theme.textMuted} />
      </box>
    </box>
  )
}
```

Key changes: removed `isStreamingAtom` import (streaming is visible via tool icons), structured `│` delimiters, colored connection dot, checkpoint shortcuts replace normal shortcuts, right-aligned shortcuts.

**Step 2: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass

**Step 3: Commit**

```bash
git add packages/tui/src/components/StatusBar.tsx
git commit -m "feat(tui): polish StatusBar with structured segments and colored dot"
```

---

### Task 7: Polish InputBar

**Files:**
- Modify: `packages/tui/src/components/InputBar.tsx`

**Step 1: Simplify checkpoint display, add model prefix**

In `InputBar.tsx`, change the checkpoint branch to a simpler one-line prompt instead of the 3-line block:

Replace the checkpoint return block (lines 91-115) with:

```tsx
  if (checkpoint) {
    return (
      <box
        border={true}
        borderStyle="single"
        borderColor={theme.statusPending}
        padding={0}
        flexDirection="row"
      >
        <text
          content={` [checkpoint] \u26A0 ${checkpoint.action}: ${checkpoint.reason} `}
          fg={theme.statusPending}
          truncate={true}
          flexGrow={1}
        />
      </box>
    )
  }
```

And change the normal input prompt from ` > ` / `streaming...` to include a streaming indicator that's more subtle:

Replace:
```tsx
      <text
        content={isStreaming ? " streaming... " : " > "}
        fg={isStreaming ? theme.streaming : theme.userText}
      />
```

With:
```tsx
      <text
        content={isStreaming ? " \u23F3 " : " > "}
        fg={isStreaming ? theme.streaming : theme.textMuted}
      />
```

**Step 2: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass

**Step 3: Commit**

```bash
git add packages/tui/src/components/InputBar.tsx
git commit -m "feat(tui): polish InputBar with compact checkpoint and streaming icon"
```

---

### Task 8: Refactor SessionPickerModal to Use `<select>`

**Files:**
- Modify: `packages/tui/src/components/SessionPickerModal.tsx`
- Modify: `packages/tui/src/App.tsx`

**Step 1: Rewrite SessionPickerModal**

```tsx
// packages/tui/src/components/SessionPickerModal.tsx
import type { ChannelSummary } from "../types.js"
import { theme } from "../theme.js"
import { ModalBox } from "./ModalBox.js"

export function SessionPickerModal({
  channels,
  activeChannelId,
  selectedIndex,
  onSelect,
  onDelete
}: {
  readonly channels: ReadonlyArray<ChannelSummary>
  readonly activeChannelId: string
  readonly selectedIndex: number
  readonly onSelect: (channelId: string) => void
  readonly onDelete: (channelId: string) => void
}) {
  const options = channels.map((ch) => ({
    name: `${ch.channelId === activeChannelId ? "* " : "  "}${ch.channelId}`,
    description: `${ch.messageCount} msgs | ${ch.channelType} | last: ${ch.lastTurnAt ?? "no turns"}`,
    value: ch.channelId
  }))

  return (
    <ModalBox title="Sessions" width="70%" height="70%">
      {channels.length === 0 ? (
        <box flexDirection="column">
          <text content="No channels found." fg={theme.textMuted} />
          <text content="Press Esc to close." fg={theme.textMuted} />
        </box>
      ) : (
        <box flexDirection="column" flexGrow={1}>
          <text content=" ↑/↓ navigate, Enter select, x delete, Esc close" fg={theme.textMuted} />
          <select
            options={options}
            selectedIndex={selectedIndex}
            focused={true}
            showDescription={true}
            wrapSelection={true}
            backgroundColor="transparent"
            textColor={theme.text}
            focusedBackgroundColor={theme.surface}
            focusedTextColor={theme.accent}
            selectedBackgroundColor={theme.surface}
            selectedTextColor={theme.accent}
            descriptionColor={theme.textMuted}
            onSelect={(option: { value?: string }) => {
              if (option.value) onSelect(option.value)
            }}
            flexGrow={1}
          />
        </box>
      )}
    </ModalBox>
  )
}
```

**Step 2: Update App.tsx — remove manual keyboard handling for session picker**

In `App.tsx`, remove the `sessionPickerIndex` state, the manual `up/down/enter/x` keyboard handler inside the `activeModal === "session-picker"` block, and the `useEffect` that syncs `sessionPickerIndex`.

Pass `onSelect={selectChannel}` and `onDelete={deleteSelectedChannel}` to `SessionPickerModal`.

The `useKeyboard` handler for the session-picker case (lines ~163-195 in current App.tsx) gets removed entirely. The `sessionPickerIndex` state and its `setSessionPickerIndex` calls get removed. The `useEffect` syncing `sessionPickerIndex` with `availableChannels` (lines ~136-151) gets removed.

In the JSX, `SessionPickerModal` gets the new props:

```tsx
sessionPicker={{
  channels: availableChannels,
  activeChannelId,
  selectedIndex: 0,
  onSelect: selectChannel,
  onDelete: deleteSelectedChannel
}}
```

**Step 3: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass

**Step 4: Run typecheck**

Run: `bunx tsc --noEmit -p packages/tui/tsconfig.json`
Expected: Clean

**Step 5: Commit**

```bash
git add packages/tui/src/components/SessionPickerModal.tsx packages/tui/src/App.tsx
git commit -m "refactor(tui): use <select> for session picker, remove manual keyboard code"
```

---

### Task 9: Dead Code Cleanup

**Files:**
- Modify: `packages/tui/src/atoms/session.ts`
- Delete: `packages/tui/src/hooks/useClipboard.ts`
- Delete: `packages/tui/test/useClipboard.test.ts`

**Step 1: Remove unused atoms and hook**

In `atoms/session.ts`:
- Remove `lastMessageAtom` (never consumed)
- Keep `activeToolsAtom` (used conceptually; if SidePanel doesn't consume it, remove it too)

Delete `packages/tui/src/hooks/useClipboard.ts` and `packages/tui/test/useClipboard.test.ts`.

**Step 2: Run tests**

Run: `cd packages/tui && bun run test`
Expected: All pass

**Step 3: Run typecheck**

Run: `bunx tsc --noEmit -p packages/tui/tsconfig.json`
Expected: Clean

**Step 4: Commit**

```bash
git rm packages/tui/src/hooks/useClipboard.ts packages/tui/test/useClipboard.test.ts
git add packages/tui/src/atoms/session.ts
git commit -m "chore(tui): remove unused lastMessageAtom and useClipboard"
```

---

### Task 10: Final Verification

**Step 1: Run full test suite**

Run: `cd packages/tui && bun run test`
Expected: All tests pass

**Step 2: Run typecheck**

Run: `bunx tsc --noEmit -p packages/tui/tsconfig.json`
Expected: 0 errors

**Step 3: Verify no stale imports**

Run: `grep -r "ToolPane" packages/tui/src/ --include="*.ts" --include="*.tsx"`
Expected: No results (ToolPane fully removed)

Run: `grep -r "useClipboard" packages/tui/src/ --include="*.ts" --include="*.tsx"`
Expected: No results
