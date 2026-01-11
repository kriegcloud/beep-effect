# UI/UX Feature Inventory

## Overview

This document catalogs all user-facing features observed in the FlexLayout legacy demo at `http://localhost:5173/`. The demo showcases a comprehensive docking layout system with multiple panels, tabs, borders, and interactive elements.

## Initial State

### Default Layout Structure
- **Page Title**: FlexLayout Demo
- **Layout Presets**: Default, New Features, Simple, Mosaic Style, SubLayout, Complex
- **Main Areas**:
  - Top toolbar with controls
  - Left border with Navigation tab
  - Right border with Options tab
  - Bottom border with Output, Terminal, and Layout JSON tabs
  - Central content area with multiple tabsets

### Visible Components
- Multiple tabsets arranged in a grid layout
- Tabs include: OpenLayers Map, ChartJS, Grid 1-5, AGGrid, Wikipedia, MUI, MUI Grid
- Data tables with real-time updating values
- Embedded iframe content (Wikipedia)
- AG-Grid component with sortable columns

### Toolbar Controls
| Control | Type | Options/Function |
|---------|------|------------------|
| Layout Selector | Dropdown | Default, New Features, Simple, Mosaic Style, SubLayout, Complex |
| Reload | Button | Reloads the current layout |
| Realtime resize | Checkbox | Toggles real-time resize behavior |
| Show layout | Checkbox | Shows/hides layout debug info |
| Size Selector | Dropdown | xx-small, x-small, small, medium, large, 8px-30px |
| Theme Selector | Dropdown | Light, Underline, Gray, Dark, Rounded |
| Show Layout JSON | Button | Outputs layout JSON to console |
| Add Drag | Button | Adds external draggable element |
| Add Active | Button | Adds active element |

## Tab Interactions

| Interaction | Trigger | Visual Feedback | Notes |
|-------------|---------|-----------------|-------|
| Select Tab | Single Click | Tab becomes selected, content panel displays | Immediate visual update |
| Close Tab | Click X button | Tab removed, next tab selected | X button appears on hover or always visible depending on tab config |
| Rename Tab | Double-click on tab | Inline textbox editor appears | Press Enter to confirm, Escape to cancel |
| Drag Tab | Click and drag | Ghost image follows cursor | Drop zones highlight during drag |
| Maximize Tabset | Click maximize button | Panel expands to fill layout area | Button changes to "Restore" |
| Restore Tabset | Click restore button | Panel returns to original size | Only visible when maximized |
| Popout Tab | Click popout button | Opens tab in new browser window | For multi-window workflows |
| Add Tab | Click + button | Opens tab creation dialog or adds default tab | Per-tabset add functionality |

### Tab Button Components
- **Tab label**: Display name with optional icon (leadingContent)
- **Close button**: X icon for closeable tabs
- **Drag handle**: Entire tab is draggable

### Tabset Toolbar Buttons
- Add tab (+)
- Overflow menu (number indicates hidden tabs)
- Popout selected tab
- Maximize/Restore tab set
- Active tab set indicator

## Splitter Interactions

| Interaction | Behavior | Constraints |
|-------------|----------|-------------|
| Drag horizontal splitter | Resizes panels vertically | Respects min/max height constraints |
| Drag vertical splitter | Resizes panels horizontally | Respects min/max width constraints |
| Double-click splitter | Resets to default size (if configured) | May snap to predefined positions |

### Splitter Characteristics
- Visual feedback on hover (cursor change)
- Smooth resize during drag
- Nested splitters supported (panels within panels)
- Border splitters separate edge panels from center

## Themes

| Theme Name | Key Visual Characteristics |
|------------|---------------------------|
| Light | White/light gray background, dark text, subtle borders, clean appearance |
| Underline | Similar to Light but with underline indicator for selected tabs |
| Gray | Darker gray tones, higher contrast borders |
| Dark | Dark background, light text, inverted color scheme |
| Rounded | Border-radius on tabs and panels, softer appearance |

### Theme Switching
- Immediate application without reload
- All components update synchronously
- Preserves layout state during theme change

## Overflow Handling

### Trigger Condition
- When tabset contains more tabs than can be displayed in available width
- Overflow count shown as button with number (e.g., "3" for 3 hidden tabs)

### UI Mechanism
- Overflow button appears in tabset toolbar
- Clicking opens popup menu listing hidden tabs
- Each item shows tab icon and name

### Tab Access Method
- Click overflow button to open menu
- Click tab name in menu to select and bring tab into view
- Selected tab moves to visible area

### Overflow Menu Features
- Popup positioned below/above overflow button
- Shows tab icons (leadingContent) when present
- Click outside to dismiss
- Tab selection closes menu automatically

## Context Menus

| Target | Menu Options |
|--------|-------------|
| Tab | Not observed - may use native browser context menu |
| Tabset | Not observed in standard right-click |
| Border | Not observed in standard right-click |

### Notes on Context Menus
- The demo primarily uses button-based interactions rather than right-click menus
- All tab operations accessible via toolbar buttons
- Custom context menus may require specific configuration

## External Drag Support

### Add Drag Button
- Creates a draggable element outside the layout
- Element can be dragged into the layout to create new tabs
- Demonstrates external-to-internal drag capability

### Supported Types
- Custom drag sources configured via `onExternalDrag` callback
- Demo shows panel/tab creation from external sources

### Drop Behavior
- Visual drop indicators appear during drag
- Can drop to create new tabs within existing tabsets
- Can drop to create new tabsets (edge dropping)

## Border Panels

### Border Locations
- **Left**: Navigation panel
- **Right**: Options panel
- **Bottom**: Output, Terminal, Layout JSON panels

### Border Behavior
- Collapse/expand on header click
- Can contain multiple tabs
- Separate from main content area
- Splitter between border and content area

### Border Tab Features
- Same tab interactions as main tabsets
- Popout support
- Drag between borders and main area

## Layout Persistence

### Show Layout JSON Button
- Outputs current layout configuration to browser console
- JSON includes all panel positions, sizes, tab configurations
- Useful for saving/restoring layouts

### Layout Structure Elements
- Model configuration (global settings)
- Layout tree (row/column/tabset hierarchy)
- Tab configurations (id, name, component, enableClose, etc.)
- Border definitions

## Size Configuration

### Size Options
| Option | Description |
|--------|-------------|
| xx-small | Minimum chrome, compact tabs |
| x-small | Reduced padding and fonts |
| small | Slightly smaller than default |
| medium | Default size (selected by default) |
| large | Increased padding and fonts |
| 8px - 30px | Specific pixel-based sizing |

### Real-time Resize Toggle
- When enabled: Panels resize smoothly during splitter drag
- When disabled: Panels resize only on drag end
- Performance consideration for complex content

## Edge Cases Discovered

### Observed Behaviors
1. **Iframe Content**: Wikipedia content loads in embedded iframe, may affect interaction detection
2. **Hover Timeouts**: Some hover-based interactions have timing sensitivity
3. **Force Click Required**: Some interactions work better with force: true in automation
4. **Tab Index Shifting**: Closing tabs may shift indices of remaining tabs

### Layout Stability
- Layout maintains state during interactions
- Undo/redo not observed in standard UI
- Layout JSON can be used for manual state restoration

## Component Content Types

### Observed Tab Content
- **Data Tables**: Real-time updating tabular data
- **Charts**: ChartJS visualization
- **Grids**: AG-Grid with sorting, selection
- **Maps**: OpenLayers map component
- **Iframes**: External web content (Wikipedia)
- **MUI Components**: Material UI grid and components

### Content Rendering
- Each tab has independent content lifecycle
- Content preserved when tab not visible (lazy loading optional)
- Content updates continue in background tabs

## Accessibility Features

### Observed A11y Support
- Keyboard navigation between tabs
- ARIA roles on interactive elements
- Button labels for screen readers
- Focus indicators on interactive elements

### Keyboard Interactions
- Tab/Shift+Tab for focus navigation
- Enter/Space for button activation
- Escape to cancel editing operations
- Arrow keys for menu navigation

## Summary

The FlexLayout demo demonstrates a feature-rich docking layout system with:
- Comprehensive tab management (drag, close, rename, maximize, popout)
- Flexible layout configuration with splitters and borders
- Multiple theme options
- Tab overflow handling
- External drag support
- Persistent layout configuration via JSON
- Responsive sizing options
- Support for various content types including iframes, charts, and grids

This inventory serves as the baseline for implementing demo parity in the beep-effect FlexLayout port.
