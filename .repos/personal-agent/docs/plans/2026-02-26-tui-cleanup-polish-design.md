# TUI Cleanup & Polish Design

**Goal:** Full quality pass on the TUI — fix functional issues (auto-scroll, stale closures, focus trapping), apply refined-minimal visual styling, and wire advanced OpenTUI APIs (clipboard, terminal dimensions, input refs).

**Aesthetic:** Refined minimal. Muted, low-contrast palette. Content-forward. Think lazygit, helix editor — clean borders, generous spacing, lets conversation breathe.

**Scope:** Single slice, ~9 tasks, all within `packages/tui/`.

---

## Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | near-black | `#1a1b26` | App background |
| Surface | dark slate | `#24283b` | Panels, modal boxes |
| Border | dim gray | `#3b4261` | Unfocused borders |
| Border focus | soft blue | `#7aa2f7` | Focused panel border |
| Text primary | off-white | `#c0caf5` | Main content |
| Text muted | gray | `#565f89` | Secondary info, hints |
| User text | sage green | `#9ece6a` | User messages |
| Accent | soft cyan | `#7dcfff` | Modal titles, cursor |
| Error | muted red | `#f7768e` | Error messages |
| Streaming | amber | `#e0af68` | Streaming indicator |

Defined in a shared `theme.ts` — no magic color strings in components.

---

## Functional Fixes

### Auto-Scroll
- ChatPane and ToolPane: add `stickyScroll={true}` and `stickyStart="bottom"` to `<scrollbox>`.
- New messages and tool events scroll into view automatically.
- Sticky scroll re-engages when user scrolls back to bottom.

### InputBar Ref Cleanup
- Replace 6 manual `useRef` stale-closure workarounds with OpenTUI's `useEffectEvent` hook.
- Add `useRef<InputRenderable>` for imperative access (focus, cursor).
- Stable handler references, far less boilerplate.

### Focus Trapping in Modals
- When modal opens: imperative `.focus()` on modal content.
- When modal closes: focus returns to input bar via ref.
- `ModalLayer` manages focus transitions.

---

## Visual Polish

### Focus Indicators
- Panels get `focusedBorderColor` from theme (`#7aa2f7`).
- Focused panel border lights up; unfocused dims to `#3b4261`.

### Cursor Styling
- Input bar: `cursorColor="#7dcfff"` (soft cyan), block style.

### Modal Styling
- ModalBox: surface background (`#24283b`), focus border, accent title color.
- Overlay backdrop: solid dark background.

### StatusBar
- Muted text color (`#565f89`).
- Connection status keeps semantic color (green/red/yellow).

### Spacing
- Consistent `padding={1}` on content containers.

---

## Advanced API Upgrades

### Clipboard
- `useClipboard` hook wrapping `renderer.copyToClipboardOSC52()`.
- Enables future "Copy Last Response" command palette action.
- Accessed via `useRenderer()`.

### Terminal Dimensions
- `useTerminalDimensions()` in `App.tsx` for responsive layout.
- Hide ToolPane on narrow terminals (< 80 columns).

### Input Ref
- `useRef<InputRenderable>` enables cursor position, selection access for future features.

---

## File Changes

| File | Action | What Changes |
|------|--------|-------------|
| `packages/tui/src/theme.ts` | Create | Color palette constants |
| `packages/tui/src/hooks/useClipboard.ts` | Create | Clipboard hook |
| `packages/tui/src/components/ModalBox.tsx` | Modify | Theme colors, surface bg |
| `packages/tui/src/components/ModalLayer.tsx` | Modify | Focus trapping, themed backdrop |
| `packages/tui/src/components/ChatPane.tsx` | Modify | Sticky scroll, theme colors |
| `packages/tui/src/components/ToolPane.tsx` | Modify | Sticky scroll, focus border, theme |
| `packages/tui/src/components/InputBar.tsx` | Modify | useEffectEvent, input ref, cursor styling, theme |
| `packages/tui/src/components/StatusBar.tsx` | Modify | Muted theme colors |
| `packages/tui/src/components/MessageBubble.tsx` | Modify | Theme colors for roles |
| `packages/tui/src/App.tsx` | Modify | Terminal dimensions, responsive ToolPane, pass input ref |
| `packages/tui/src/bin.tsx` | Modify | App background color |

## Task Order

1. Create `theme.ts` (all other tasks depend on it)
2. InputBar — ref + useEffectEvent + cursor styling + theme
3. ChatPane — sticky scroll + theme
4. ToolPane — sticky scroll + focus border + theme
5. ModalBox + ModalLayer — theme + focus trapping
6. MessageBubble + StatusBar — theme colors
7. App.tsx + bin.tsx — responsive layout, background, wiring
8. useClipboard hook
9. End-to-end verification

## No New Server Endpoints

All changes are within `packages/tui/`. No new dependencies.
