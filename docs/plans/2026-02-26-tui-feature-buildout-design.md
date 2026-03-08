# TUI Feature Buildout Design

**Goal:** Transform the basic TUI chat interface into a user-facing terminal product with rich rendering, session management, command palette, settings, memory search, and tool inspection.

**Approach:** Incremental feature slices. Each slice is independently deliverable. Slice 1 establishes the modal/overlay system and rich rendering foundation; slices 2-6 layer features on top.

**Tech Stack:** OpenTUI (React reconciler), Effect Atom (state), ChatClient (HTTP/SSE transport)

---

## Architecture & Interaction Model

### Layout

The main screen stays clean — full-width chat with a collapsible tool sidebar (already built). All secondary features open as **modal overlays** that float over the chat.

### Keybindings

| Key | Action |
|-----|--------|
| `Ctrl+K` | Command palette |
| `Ctrl+N` | New session |
| `Ctrl+S` | Session picker |
| `Ctrl+,` | Settings overlay |
| `Ctrl+M` | Memory search |
| `Escape` | Close any open modal |
| `Tab` | Cycle focus (only when no modal open) |
| `Ctrl+C` | Exit |

### Modal System

A `ModalLayer` component wraps the app. When a modal is active, it captures keyboard input and renders over the main content. Modals are stacked (command palette can open settings). Only one non-palette modal at a time.

### State

New atom: `modalAtom` — tracks the active modal (`null | "command-palette" | "session-picker" | "settings" | "memory-search" | "tool-inspector"`). Modal-specific state lives in the modal component, not in global atoms.

---

## Slice 1: Modal System + Rich Message Rendering

### Modal Primitives

- `ModalLayer` component: wraps the app, renders active modal overlay
- `ModalBox` component: centered bordered box with title, used by all modals
- Focus trapping: keyboard input goes to modal when active, `Escape` closes
- `modalAtom` in `atoms/session.ts`

### Rich Rendering

- Assistant messages render with `<markdown content={msg.content} />` when `status === "complete"`
- Streaming messages use `<text>` until complete, then switch to `<markdown>` (avoids partial-markdown artifacts)
- User messages stay as plain `<text>` (short inputs, no markdown needed)
- Code blocks within markdown get syntax highlighting via OpenTUI's tree-sitter integration
- Failed messages show error inline (existing behavior, no change)

### No New Server Endpoints

---

## Slice 2: Session Picker + Persistence

### Session Persistence

- On startup, check for existing sessions via `ChatClient.listSessions()` → `GET /channels?type=CLI`
- Auto-resume most recent session instead of creating a random channel
- Store last-used channel ID in `~/.config/personal-agent/state.json`

### Session Picker Modal (`Ctrl+S`)

- OpenTUI `<select>` listing sessions with timestamps
- Each option: agent name, message count, last activity time
- Actions: "New Session", "Delete"
- Selecting a session closes modal, switches to it (loads history, updates atoms)

### New Session (`Ctrl+N`)

- Shortcut to create a fresh channel without opening the picker
- Uses the current agent (from settings, defaulting to "agent:bootstrap")

### State Changes

- New atom: `agentIdAtom` (replaces hardcoded "agent:bootstrap")
- `channelIdAtom` updates on session switch
- Messages and tool events clear and reload from history

### Server Endpoint

- `GET /channels` — list channels by type, ordered by last activity. Returns `channelId`, `channelType`, `agentId`, `createdAt`, `lastMessageAt`.

---

## Slice 3: Command Palette

### Command Palette (`Ctrl+K`)

- Full-width overlay near top of screen
- `<input>` for fuzzy search, `<select>` below for filtered results
- Commands registered declaratively:
  - "New Session" → `Ctrl+N`
  - "Switch Session" → `Ctrl+S`
  - "Settings" → `Ctrl+,`
  - "Search Memory" → `Ctrl+M`
  - "Copy Last Response"
  - "Clear Messages"
  - "Toggle Tool Panel" → `Tab`
- Selecting a command executes it and closes
- Escape closes without action

### No New Server Endpoints

---

## Slice 4: Settings Overlay

### Settings Modal (`Ctrl+,`)

- Vertical form layout in a centered modal box
- Fields:
  - **Agent** — `<select>` populated from `GET /agents` (agent profiles from `agent.yaml`)
  - **Model override** — `<select>` with provider:modelId options. "Default" uses agent's configured model. Sets session-level model override.
  - **System prompt preview** — read-only `<text>` showing active agent's persona prompt
- Changes take effect on next message (model resolved per-turn)
- No save button — selecting a value applies immediately via atoms

### Server Endpoint

- `GET /agents` — list agent profiles (id, name, model info, persona summary)

---

## Slice 5: Memory Search

### Memory Search Modal (`Ctrl+M`)

- Centered modal with `<input>` for search query
- Results in `<scrollbox>`:
  - Memory tier badge (Semantic / Episodic / Procedural)
  - Content preview (first 2-3 lines)
  - Timestamp
- Uses `MemoryEntity.search` via `ChatClient.searchMemory(agentId, query)`
- Read-only — no create/edit/delete from TUI
- Informational — helps users understand what context the agent has

### Server Endpoint

- `GET /agents/:agentId/memory?q=search+term` — search agent memory by query

---

## Slice 6: Tool Inspector

### Tool Inspector Modal

- Triggered by pressing Enter on a tool event in the ToolPane (not a keybinding)
- Full-screen modal showing:
  - Tool name and status
  - Full input JSON with `<code filetype="json">` (syntax highlighted)
  - Full output JSON with `<code filetype="json">`
  - Error message if `isError === true`
- Replaces current 80-char truncation with full visibility
- All data from existing `toolEventsAtom` — no server calls

### No New Server Endpoints

---

## Slice Dependencies

| Slice | Feature | Depends On | New Server Endpoints |
|-------|---------|------------|---------------------|
| 1 | Modal system + rich rendering | Nothing | None |
| 2 | Session picker + persistence | Slice 1 (modal) | `GET /channels` |
| 3 | Command palette | Slice 1 (modal) | None |
| 4 | Settings overlay | Slice 3 (palette), Slice 2 (agentIdAtom) | `GET /agents` |
| 5 | Memory search | Slice 1 (modal) | `GET /agents/:agentId/memory?q=` |
| 6 | Tool inspector | Slice 1 (modal) | None |

## New Server Endpoints Summary

All three are thin reads against existing data — no new persistence or entities needed.

| Endpoint | Purpose | Data Source |
|----------|---------|-------------|
| `GET /channels` | List channels by type | ChannelPort |
| `GET /agents` | List agent profiles | AgentConfig |
| `GET /agents/:agentId/memory?q=` | Search agent memory | MemoryEntity |
