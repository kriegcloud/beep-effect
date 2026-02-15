# Quick Start: Capturing a Single View

> 5-minute workflow for capturing one Taskade view into the reference library.

## Prerequisites

- Active Taskade session in Chrome (logged into `https://www.taskade.com`)
- Claude-in-Chrome extension active

## Workflow

### 1. Load Tools (once per session)

```
ToolSearch: "claude-in-chrome tabs navigate"
ToolSearch: "select:mcp__claude-in-chrome__computer"
ToolSearch: "select:mcp__claude-in-chrome__find"
ToolSearch: "select:mcp__claude-in-chrome__read_page"
ToolSearch: "select:mcp__claude-in-chrome__javascript_tool"
```

### 2. Get Tab Context

```
mcp__claude-in-chrome__tabs_context_mcp({ createIfEmpty: true })
```

### 3. Navigate

```
mcp__claude-in-chrome__navigate({ url: VIEW_URL, tabId: TAB_ID })
mcp__claude-in-chrome__computer({ action: "wait", duration: 2, tabId: TAB_ID })
```

### 4. Screenshot + Measure

```
mcp__claude-in-chrome__computer({ action: "screenshot", tabId: TAB_ID })
mcp__claude-in-chrome__javascript_tool({
  action: "javascript_exec",
  tabId: TAB_ID,
  text: "JSON.stringify({ viewport: { w: innerWidth, h: innerHeight }, scroll: document.documentElement.scrollHeight })"
})
```

### 5. Discover Components

```
mcp__claude-in-chrome__read_page({ tabId: TAB_ID, filter: "interactive" })
mcp__claude-in-chrome__find({ query: "buttons", tabId: TAB_ID })
mcp__claude-in-chrome__find({ query: "dropdown menus", tabId: TAB_ID })
```

### 6. Capture States

For each interactive component:
- Screenshot default state
- Hover → screenshot hover state
- Click (dropdowns/tabs) → screenshot open/active state
- Escape/click away to restore

### 7. Write Output

Read template from `templates/capture.template.md`, fill in sections, write to:
```
outputs/CAPTURE_{VIEW_NAME}.md
```

## Full Workflow

This quick start covers single-view capture. For the complete multi-phase workflow including synthesis documents (`ARCHITECTURE_APP_SHELL.md`, `COMPONENT_PATTERNS.md`), see [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md).

## Output Template Sections

1. **Overview** — 1-3 sentences
2. **Layout** — Measurements + ASCII diagram
3. **Component Inventory** — Table of all interactive elements
4. **Interactive States** — State transitions with screenshot IDs
5. **GIF Recordings** — Key interactions (best-effort)
6. **Feature Mapping** — Taskade feature → TodoX package
7. **Implementation Notes** — shadcn components, Phosphor icons, API surface

## Verification

After capture completion:

```bash
# Check file exists
ls -lh outputs/CAPTURE_{VIEW_NAME}.md

# Verify required sections present
grep -E "^##" outputs/CAPTURE_{VIEW_NAME}.md
# Expected: Overview, Layout, Component Inventory, Interactive States, Feature Mapping

# Check screenshot references exist
grep -c "ss_" outputs/CAPTURE_{VIEW_NAME}.md
# Should be > 0
```
