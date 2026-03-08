# TUI Layout Polish Design

## Context

The TUI frontend has a 67/33 chat/tool split that wastes space, dead-coded markdown rendering, placeholder modals, and no visibility into context usage or memory. This design addresses layout proportions, information density, and visual polish by mining patterns from OpenCode, Letta Code, and OpenTUI's underutilized components.

## Layout

```
┌──────────────── ChatPane (flexGrow=4) ────────────────┬── SidePanel (flexGrow=1) ──┐
│                                                       │ Session                    │
│  > user prompt (dimmed)                               │  ch:a1b2  ● connected     │
│                                                       │  agent:bootstrap           │
│  **Assistant** response rendered as                   │  12 msgs  iter 3           │
│  markdown with `syntax highlighting`                  │                            │
│                                                       │ Tools                      │
│  ⏳ file_read /src/config.ts                          │  ✓ file_read               │
│  ✓ file_read /src/config.ts                           │  ✓ shell_execute           │
│    → 1,247 chars                                      │  ⏳ file_write              │
│  ✓ shell_execute ls -la                               │                            │
│    → exit 0 total 42                                  │ Context (67%)              │
│  ✗ file_write /etc/passwd                             │ ├ system   ██░░░░  12%     │
│    → ERR: PERMISSION_DENIED                           │ ├ persona  █░░░░░   4%     │
│                                                       │ ├ memory   ███░░░   9%     │
│  Here's what I found...                               │ ├ history  ██████  38%     │
│                                                       │ └ tools    ██░░░░   4%     │
│                                                       │ ──────────────────         │
│                                                       │  ████████████░░░░          │
│                                                       │  67K / 100K tokens         │
├───────────────────────────────────────────────────────┴────────────────────────────┤
│ sonnet > input text here                                                          │
├───────────────────────────────────────────────────────────────────────────────────┤
│ ch:a1b2 │ ● connected │ sonnet │ 12 msgs │       ^S sessions  ^M memory  ^K cmd │
└───────────────────────────────────────────────────────────────────────────────────┘
```

The SidePanel collapses entirely below 100 columns. When collapsed, tool calls still render inline in the chat stream.

## Component Changes

### 1. ChatPane — Enable Markdown Rendering

Wire `SyntaxStyleContext.Provider` at the `App` level. The path in `MessageBubble` already handles `<markdown>` for complete messages and `<markdown streaming>` for in-progress responses. The context is currently always `null` so this code is dead.

**Implementation:**
- Import `SyntaxStyle` from `@opentui/core` in `App.tsx`
- Create a default style: `SyntaxStyle.fromStyles({})` (uses built-in defaults)
- Wrap the render tree in `<SyntaxStyleContext.Provider value={defaultStyle}>`

### 2. ChatPane — Inline Tool Events

Add a `ToolCallInline` component rendered between `MessageBubble` entries. The chat stream interleaves messages and tool events by `turnId`.

**Display format** (2-char left gutter, Letta Code pattern):
```
  ⏳ file_read /src/config.ts            ← in-flight: streaming color
  ✓ shell_execute ls -la                 ← complete: green
    → exit 0 total 42                    ← result line: DIM
  ✗ file_write /etc/passwd               ← error: red
    → ERR: PERMISSION_DENIED             ← error result: theme.error
```

Uses existing `formatToolInput` and `formatToolOutput` from `formatters/toolSummary.ts`.

**Interleaving strategy:** Group tool events by `turnId` and render them as a block after the assistant message for that turn. During streaming, in-flight tools appear at the bottom of the chat.

### 3. ChatPane — Message Spacing & User Dimming

- Add `marginTop={1}` between messages for vertical breathing room
- User messages: `>` prompt in `BOLD`, message text in base color (not green — let assistant responses dominate)
- Assistant messages: full `theme.text` color, markdown-rendered

### 4. SidePanel (replaces ToolPane)

New component: `packages/tui/src/components/SidePanel.tsx`

Three stacked sections inside a `box` with `border={["left"]}` (left-only separator):

**Session section** (top):
- Channel ID (truncated 8 chars)
- Connection status with colored dot (`●`)
- Agent ID
- Message count + iteration number (surfaces unused `iteration` field from `ChatMessage`)

**Tools section** (middle, `flexGrow=1`):
- Compact list: icon + tool name only (no input/output — that's inline in chat)
- Scrollable if many tools
- Uses `activeToolsAtom` (currently unused) to highlight in-flight tools
- Completed tools in `statusConnected`, in-flight in `streaming`, errors in `error`

**Context section** (bottom, fixed height):
- Stacked capacity bar with per-segment breakdown
- Segments: system, persona, memory, history, tools
- Each segment: colored bar (`█` filled, `░` empty) + percentage
- Summary bar at bottom changes color by fill: green < 60%, amber 60-85%, red > 85%
- Token count: `67K / 100K tokens`
- Stubbed initially with estimates (message count * avg tokens, tool count * avg)
- New atom: `contextUsageAtom` in `atoms/session.ts`

### 5. InputBar Polish

- Show model name dimly left of prompt: `sonnet >`
- During checkpoint: prompt changes to `[checkpoint] >` in amber
- Checkpoint keyboard hints (`^Y ^N ^D`) move to StatusBar

### 6. StatusBar Polish

Structured horizontal layout with `│` delimiters:

```
ch:a1b2 │ ● connected │ sonnet │ 12 msgs │       ^S sessions  ^M memory  ^K cmd
```

- Connection status: colored dot prefix
- Model name (dimmed)
- Keyboard shortcuts right-aligned
- During checkpoint: right section becomes `^Y approve  ^N reject  ^D defer` in amber

### 7. Session Picker — Use `<select>`

Replace manual keyboard handling (~60 lines in `App.tsx`) with OpenTUI's built-in `<select>` component inside `SessionPickerModal`.

**Before:** Manual `sessionPickerIndex` state, manual wrap-around arithmetic, manual `up/down/enter/x` keyboard switch.

**After:** `<select options={channels} focused selectedIndex onChange onSelect />` with built-in `j/k`, arrows, `enter`, fast scroll (`Shift+Up/Down`).

### 8. Dead Code Cleanup

- Remove `activeToolsAtom` if we create a new consumption path, or wire it into SidePanel
- Remove `lastMessageAtom` (unused derived atom)
- Remove `useClipboard` hook (implemented but never called) — or wire into a `^C` copy shortcut
- Surface `iteration`, `iterationFinishReason`, `toolCallsTotal` fields in SidePanel session section

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `components/SidePanel.tsx` | CREATE | Sidebar with session, tools, context sections |
| `components/ContextBar.tsx` | CREATE | Stacked capacity bar visualization |
| `components/ToolCallInline.tsx` | CREATE | Inline tool call display for chat stream |
| `components/ChatPane.tsx` | MODIFY | Interleave tool events, add message spacing |
| `components/MessageBubble.tsx` | MODIFY | Dim user messages, adjust spacing |
| `components/InputBar.tsx` | MODIFY | Add model name prefix, checkpoint prompt |
| `components/StatusBar.tsx` | MODIFY | Structured segments, colored dot, model name |
| `components/SessionPickerModal.tsx` | MODIFY | Replace manual list with `<select>` |
| `components/ToolPane.tsx` | DELETE | Replaced by SidePanel |
| `App.tsx` | MODIFY | SyntaxStyle provider, SidePanel wiring, remove keyboard handling |
| `atoms/session.ts` | MODIFY | Add contextUsageAtom, clean up unused atoms |

## Files NOT Changed

- `types.ts` — existing types sufficient
- `state/turnStream.ts` — dispatch logic unchanged
- `state/restoreHistory.ts` — just created, unchanged
- `formatters/toolSummary.ts` — reused by ToolCallInline

## Implementation Order

```
1. Enable markdown (SyntaxStyle provider) — immediate visual win, minimal code
2. SidePanel + ContextBar — replaces ToolPane
3. ToolCallInline + ChatPane interleaving — inline tool display
4. InputBar + StatusBar polish — structured segments
5. SessionPickerModal <select> refactor — remove manual keyboard code
6. Dead code cleanup — remove unused atoms/hooks
```

Steps 1-2 can run in parallel with step 3. Steps 4-6 are independent.

## Verification

1. `cd packages/tui && bun run test` — all tests pass
2. `bunx tsc --noEmit -p packages/tui/tsconfig.json` — clean typecheck
3. Manual: launch TUI at 120+ columns — sidebar visible with 3 sections
4. Manual: resize below 100 columns — sidebar collapses, chat goes full-width
5. Manual: send message triggering tools — inline tool calls in chat, compact list in sidebar
6. Manual: check markdown rendering — headings, bold, code blocks render properly
7. Manual: `^S` session picker — uses `<select>` with j/k navigation
