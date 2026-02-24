# State Capture Report: Stats

## Summary
- **Components captured**: 14/51 (focused on interactive components with state changes)
- **Screenshots taken**: 21 (Playwright)
- **GIFs recorded**: 1 (Chrome) -- stats-layout-change.gif showing Dagre to ELK Force layout transition
- **Page States created**: 7 (across multiple runs; 12 total entries in Notion including duplicates from retries)

## Component State Log

### Theme Toggle (selector: button[aria-label="Switch to dark mode"])
- **States captured**: Light mode (default), Dark mode
- **Screenshots**: stats-default.png, stats-dark-mode.png
- **Notable behavior**: Full page repaint, all UI elements adapt to dark theme

### Help Banner Toggle (selector: button:has-text("Hide help"))
- **States captured**: Visible (default), Hidden
- **Screenshots**: stats-default.png, stats-help-hidden.png
- **Notable behavior**: Banner dismissed, button text changes to "Show help"

### Object Types Accordion (selector: main button:has-text("Object Types"))
- **States captured**: Expanded (default), Collapsed
- **Screenshots**: stats-default.png, stats-object-types-collapsed.png
- **Notable behavior**: Hides Department, Employee, Project type entries

### Link Types Accordion (selector: main button:has-text("Link Types"))
- **States captured**: Expanded (default), Collapsed
- **Screenshots**: stats-default.png, stats-link-types-collapsed.png
- **Notable behavior**: Hides all link type entries with source/target signatures

### Layout Algorithm Dropdown (selector: main button[role="combobox"]:has-text("Dagre"))
- **States captured**: Closed (default), Open showing options, ELK Force selected
- **Screenshots**: stats-default.png, stats-layout-dropdown-open.png, stats-elk-force-layout.png
- **Notable behavior**: Graph re-layouts with force-directed positioning when ELK Force selected

### Direction Toggle (selector: main button:has-text("Top-Down"))
- **States captured**: Top-Down (default), Left-Right
- **Screenshots**: stats-default.png, stats-left-right-direction.png
- **Notable behavior**: Graph orientation switches to horizontal flow

### Edge Style Toggle (selector: main button:has-text("Curved"))
- **States captured**: Curved (default), Straight
- **Screenshots**: stats-default.png, stats-straight-edges.png
- **Notable behavior**: Edges rendered as straight lines instead of bezier curves

### Spacing Toggle (selector: main button:has-text("Spacious"))
- **States captured**: Spacious (default), Compact
- **Screenshots**: stats-default.png, stats-compact-spacing.png
- **Notable behavior**: Nodes positioned closer together, graph more dense

### 3D View Toggle (selector: main button:has-text("3D View"))
- **States captured**: 2D (default), 3D
- **Screenshots**: stats-default.png, stats-3d-view.png
- **Notable behavior**: Graph rendered in WebGL 3D with depth perspective

### Database Selector Dropdown (selector: header button[role="combobox"]:has-text("lively-birch"))
- **States captured**: Closed (default), Open
- **Screenshots**: stats-default.png, stats-database-selector-open.png
- **Notable behavior**: Shows available databases in dropdown

### Role Selector Dropdown (selector: header button[role="combobox"]:has-text("Admin"))
- **States captured**: Closed (default), Open
- **Screenshots**: stats-default.png, stats-role-selector-open.png
- **Notable behavior**: Shows available user roles

### Zoom Controls (selector: button[aria-label="Zoom In"])
- **States captured**: Default zoom, Zoomed in (3x)
- **Screenshots**: stats-default.png, stats-zoomed-in.png
- **Notable behavior**: Graph canvas zooms, nodes appear larger

## Page States Created

| # | State Name | Type | Variant Kind | Notes |
|---|-----------|------|-------------|-------|
| 1 | Stats -- Default | Default | -- | Initial load, light mode, help visible |
| 2 | Stats -- Dark Mode | Variant | Dark mode | Theme toggled |
| 3 | Stats -- Help Hidden | Variant | Other | Help banner dismissed |
| 4 | Stats -- ELK Force Layout | Variant | Other | Alternative graph layout |
| 5 | Stats -- 3D View | Variant | Other | WebGL 3D perspective |
| 6 | Stats -- Compact Spacing | Variant | Other | Denser node arrangement |
| 7 | Stats -- Left-Right Direction | Variant | Other | Horizontal graph flow |

## GIF Recording

| Filename | Frames | Size | Description |
|----------|--------|------|-------------|
| stats-layout-change.gif | 4 | 1506 KB | Shows default Dagre layout -> dropdown open -> ELK Force selected -> graph re-layout |

## Issues & Recommendations
- Previous agent run hit 60-turn limit; zoom controls and help mode toggle were being captured when it stopped
- GIF recording succeeded on first attempt via Chrome extension (4 frames, 1506KB)
- Some screenshots exist in duplicate naming (numbered and descriptive) from initial and continuation runs
- Notion Page States database has duplicate entries from retried runs (3 "Default" entries, 2 "Dark Mode", 2 "ELK Force Layout") -- recommend deduplication
- Recommended for future: batch more interactions per turn to stay within turn limits
- Components not individually captured (display-only stats cards, individual type/link buttons, graph nodes) don't have meaningful interactive states beyond click-to-navigate
