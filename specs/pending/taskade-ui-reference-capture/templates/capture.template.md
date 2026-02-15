# Capture Template

> Template for each view's output file. Replace `{placeholders}` with actual content.
> Output files go to `outputs/CAPTURE_{VIEW_NAME}.md`

---

## Template

```markdown
# {VIEW_NAME}

> Captured from: `{URL}`
> Screenshots: {COUNT} total

## Overview

{1-3 sentences describing what this view does, its primary purpose, and how users interact with it.}

## Layout

{Describe the view structure: sidebar placement, main content areas, panel arrangement.
Include approximate measurements (widths, heights, padding).
Note any persistent elements from the app shell (icon sidebar, navbar).}

### Layout Diagram

```
{ASCII art showing the layout structure, e.g.:}
┌──────┬───────────┬──────────────────────────────────┐
│ Icon │ Settings  │ Main Content                     │
│ Bar  │ Sidebar   │                                  │
│ 56px │ ~250px    │ fills remaining                  │
│      │           │ ┌──────────────────────────────┐ │
│      │           │ │ Sub-tabs: Tab1 | Tab2 | Tab3 │ │
│      │           │ ├──────────────────────────────┤ │
│      │           │ │ Content area                 │ │
│      │           │ └──────────────────────────────┘ │
└──────┴───────────┴──────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | {name} | {button/input/dropdown/toggle/table/card/...} | {section} | {visible text} | {default, hover, active, disabled, ...} | {ss_xxx, ss_yyy} |
| ... | ... | ... | ... | ... | ... | ... |

## Interactive States

### {State Category 1: e.g., "Tab Navigation"}

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| {state name} | {click/hover/...} | {what changes} | {ss_xxx} |

### {State Category 2: e.g., "Dropdown Menus"}

| Dropdown | Options | Default Value | Screenshot ID |
|----------|---------|---------------|---------------|
| {name} | {option1, option2, ...} | {default} | {ss_xxx} |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| 1 | {description of recorded interaction} | {~Ns} | {gif_xxx} |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| {Feature name} | {TodoX feature or "New"} | {e.g., @beep/iam-client} | {P0-P3} | {Brief note} |

## Implementation Notes

- **Components**: {shadcn components that could implement this view}
- **Icons**: {Phosphor icon suggestions for icons visible in this view}
- **State Management**: {What state is needed - forms, toggles, table data}
- **API Surface**: {What IAM/server endpoints would back this view}
- **Complexity**: {Low/Medium/High with rationale}
```
