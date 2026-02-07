> **PARTIALLY SUPERSEDED**: This dry-run report was generated using Chrome extension tools (Phase 0.5). The State Capturer agent now uses Playwright MCP for all screenshots and interactions, with Chrome retained only for GIF recording (Phase 0.6). Notion API constraint findings remain fully current. Browser interaction patterns have been updated in `agents/STATE_CAPTURER.md`.

---

# Dry Run: State Capturer Agent

> Limited dry run testing 3 components + 1 full-page variant on the Stats page.

## Test Parameters

| Parameter | Value |
|-----------|-------|
| **PAGE_URL** | https://open-ontology.com/databases/lively-birch-keeping-autumn |
| **PAGE_NAME** | Stats |
| **NOTION_ENTRY_URL** | https://www.notion.so/30069573788d81c1a881d598349ddcf5 |
| **Components tested** | 3 of ~15+ total |
| **Date** | 2026-02-07 |

## Execution Summary

| Metric | Count |
|--------|-------|
| **Screenshots taken** | ~12 (full-page + zoomed) |
| **GIFs recorded** | 1 (layout dropdown interaction) |
| **Page States created** | 2 (Default + Light Mode variant) |
| **Components captured** | 3/3 targeted |
| **Failures** | 0 |

## Component Capture Log

### 1. Layout Dropdown (Protocol: Dropdowns/Comboboxes)

- **Default state**: "Dagre (Hierarchical)" shown in closed dropdown
- **Opened state**: 5 options visible: Dagre (Hierarchical) [checked], ELK Layered, ELK Force, ELK Stress, ELK Radial
- **Selected option**: "ELK Force" -- caused a significant layout change from hierarchical tree to force-directed scatter
- **GIF recorded**: `stats-layout-dropdown-interaction.gif` (1555KB, 4 frames)
- **Restored to default**: Dagre (Hierarchical)
- **Notable behavior**: Layout animation takes ~1-2 seconds to settle. The dropdown shows a checkmark next to the active option. Each layout algorithm produces a dramatically different visualization.

### 2. 3D View Button (Protocol: Buttons)

- **Default state**: "3D View" button with eye icon in toolbar
- **Toggled ON**: Entire graph area replaced with a 3D WebGL scene showing colored spheres (orange, blue, purple). All 2D toolbar controls (layout dropdown, Top-Down, Curved, Spacious buttons) disappear. A "Switch to 2D" button appears instead.
- **Toggled OFF**: Returned to 2D view with all original controls restored
- **Notable behavior**: This is a major state change -- the entire visualization engine switches between React Flow (2D) and a 3D renderer. The transition takes ~2 seconds. The "Switch to 2D" label appears at the same position as the original toolbar but with completely different controls.

### 3. Object Types Expandable Section (Protocol: Expandable Sections)

- **Expanded state** (default): Shows chevron-down, "Object Types 3", then 3 items: Department v1, Employee v1, Project v1
- **Collapsed state**: Shows chevron-right, "Object Types 3" header only -- items hidden
- **Restored to expanded**: Items re-appeared
- **Notable behavior**: Simple toggle, no animation observed. The "3" count badge remains visible in both states, providing a preview of content count even when collapsed.

## Full-Page Variant: Theme Toggle

- **Default**: Dark mode (dark background, orange/purple accented graph nodes)
- **Variant captured**: Light mode -- triggered by clicking the gear/settings icon in top-right corner
- **Light mode observations**: White/light background, light sidebar, orange-bordered graph nodes on white, light header. The toggle icon changes from a gear to a moon icon.
- **Page State created**: "Stats - Light Mode" (Variant, "Other" kind)
- **Restored to dark mode**: Confirmed by screenshot

## What Worked Well

1. **Dropdowns protocol was clear and easy to follow.** The step-by-step (screenshot closed -> open -> select option -> screenshot result -> record GIF -> restore default) was straightforward and produced comprehensive coverage.

2. **Buttons protocol was simple and effective.** Toggle on, screenshot, toggle off, screenshot -- minimal ambiguity.

3. **Expandable Sections protocol was quick.** Collapse, screenshot, expand, screenshot -- very mechanical and repeatable.

4. **Notion Page States creation was seamless.** The `notion-create-pages` tool with `data_source_id` worked on the first attempt. Properties matched the schema without issues.

5. **GIF creator worked well for capturing the dropdown interaction.** Start recording -> take initial frame screenshot -> perform actions -> stop -> export was a clean workflow.

6. **Navigation and tab management was smooth.** Creating a new tab and navigating to the URL took under 5 seconds total.

## What Was Unclear or Missing

1. **Theme toggle identification is not addressed in the agent doc.** The agent doc says "Click theme toggle in top bar" but does not describe how to identify the toggle. On this page, it was a gear/settings-looking icon, not a sun/moon toggle. Different sites will have different theme toggle patterns. The doc should provide guidance on: check for sun/moon icons, gear icons, or use `find` tool to search for "theme" or "dark mode" elements.

2. **Default dark vs. light mode ambiguity.** The agent doc assumes "Dark mode" is a variant to trigger, but this page's default IS dark mode. The variant was actually light mode. The doc should clarify: "If the page loads in dark mode, capture light mode as the variant instead, using Variant kind: Other."

3. **No protocol for the "Schema" toggle button.** The Stats page has a "Schema" button next to "3D View" that appears to toggle the graph between schema view and instance view. It doesn't neatly fit any protocol -- it's a toggle button but also changes the graph visualization fundamentally. The doc should address visualization mode toggles as a sub-protocol.

4. **The "for each option" step in Dropdowns protocol is ambiguous for large dropdowns.** The doc says "for each option: select, screenshot, note." With 5 layout options that each cause a graph re-layout taking 2+ seconds, capturing all options would take significant time. The doc should clarify whether ALL options must be captured or just a representative sample, especially when there are more than 3-4 options.

5. **No guidance on what to do when components share the same toolbar area.** The 3D View button, Schema button, and Layout dropdown all live in the same toolbar. When 3D View is toggled, the Layout dropdown disappears entirely. The doc should address component dependencies/exclusions.

6. **Missing guidance on zoom screenshots.** The agent doc doesn't mention using the `zoom` action for capturing close-up views of specific components. For some components (small icons, dropdown options), a full-page screenshot doesn't show enough detail. The doc should recommend using zoom for detailed component captures.

## Chrome Interaction Issues

1. **No significant issues encountered.** All clicks landed correctly, all state changes were immediate and observable.

2. **The React Flow minimap overlay** (small blue rectangle in bottom-left of the graph area) was always visible but not distracting. It could be confused with a component to capture.

3. **The "Claude is active in this tab group" notification** appeared initially and had to be dismissed. This is a recurring issue across all Chrome-based captures. The agent should auto-dismiss this as a first step.

4. **Wait times were adequate.** 2 seconds after navigation and 1-2 seconds after layout changes were sufficient. No rendering issues observed.

## GIF Recording Experience

1. **Easy to use.** The start/stop/export workflow is straightforward.
2. **Frame count was low (4 frames).** This is because the GIF only captures frames when screenshots or actions are taken, not continuously. For smoother GIFs, the agent would need to take more intermediate screenshots during the interaction.
3. **File size reasonable.** 1555KB for a 1571x782 GIF with 4 frames is manageable.
4. **Quality was adequate.** The default quality setting (10) produced clear images.
5. **Recommendation: Take more intermediate screenshots** during GIF recording for smoother playback. For example, screenshot after clicking dropdown open (showing options), then screenshot during option hover, then screenshot after selection, then screenshot after layout settles.
6. **The `showWatermark: false` option worked** -- no Claude watermark on the exported GIF.

## Notion Page States Creation

1. **No API issues.** Both Page States entries created successfully on first attempt.
2. **Property mapping was correct.** State, State type, Variant kind, Order, Notes, Reference all accepted without errors.
3. **The Reference field requires a JSON array of URLs as a string** -- this is a non-obvious format that the agent doc correctly documents.
4. **"Variant kind" options worked.** Used "Other" for light mode since "Dark mode" was the default state.
5. **The Order field accepts plain numbers** (1, 2) without issues.

## Recommendations for Improving the Agent Prompt

### High Priority

1. **Add a "Theme Toggle Discovery" sub-section** that explains how to find the theme toggle on unfamiliar pages. Suggest using `find` tool with queries like "theme toggle", "dark mode", "light mode", or visually scanning for sun/moon/gear icons in the top bar.

2. **Handle "default is dark mode" case.** Add a note: "If the page loads in dark mode by default, create the Default Page State noting dark mode. For the variant, toggle to light mode and use Variant kind: 'Other' with a note like 'Light mode toggled from default dark'."

3. **Add max-option-capture guidance for Dropdowns.** Suggest: "If a dropdown has more than 5 options, capture at least the default, first, and last options. For dropdowns with fewer than 5, capture all."

4. **Add GIF frame count guidance.** Recommend taking at least 6-8 screenshots during a GIF recording for smooth playback: initial state, click action, intermediate state, result state, pause, next action, etc.

### Medium Priority

5. **Add component dependency notes.** "Before capturing a component, note which other components are visible/affected. If toggling component A hides component B, capture component B first."

6. **Add minimap/overlay guidance.** "React Flow canvases often have a minimap overlay in the bottom-left corner. This is not a separate component -- it's part of the graph visualization."

7. **Add a "Dismiss notifications" first step.** "After navigation, dismiss any browser notifications, cookie banners, or extension notifications before capturing default state."

### Low Priority

8. **Add zoom screenshot guidance.** "For small components (icons, compact dropdowns), use the `zoom` action to capture a close-up screenshot in addition to the full-page screenshot."

9. **Clarify restore-default expectations.** "After each component interaction, verify restoration by comparing with the initial default screenshot. If the graph layout doesn't exactly match (due to animation randomness), this is acceptable."

## Time/Effort Estimate for Full Component Inventory

Based on this dry run of 3 components + 1 variant:

| Activity | Time per instance | Count on typical page | Total |
|----------|------------------|-----------------------|-------|
| Navigation + default screenshot | 30s | 1 | 30s |
| Dropdown (open, screenshot options, select 1-2, screenshot, GIF, restore) | 3-4 min | 1-3 | 5-12 min |
| Button toggle (click, screenshot, restore) | 1-2 min | 3-5 | 5-10 min |
| Expandable section (collapse, screenshot, expand, screenshot) | 1-2 min | 2-4 | 3-8 min |
| Chart/graph interactions (zoom, click nodes) | 3-5 min | 1-2 | 5-10 min |
| Full-page variants (theme, layout changes) | 2-3 min each | 2-3 | 5-9 min |
| Notion Page States creation | 30s each | 3-5 | 2-3 min |
| GIF recording and export | 1-2 min each | 2-4 | 3-8 min |
| **Total estimated for a typical page** | | | **30-60 min** |

For the Stats page specifically with ~15 identifiable components (sidebar sections, toolbar buttons, layout dropdown, graph nodes, zoom controls, info banner, navigation links, etc.), estimate **40-50 minutes** for full capture.

## Quality Checklist (Dry Run Scope)

- [x] All 3 targeted components captured with default + alternate states
- [x] Dropdown opened and all 5 options documented
- [x] 3D View toggle captured in both states (ON/OFF)
- [x] Object Types section captured expanded and collapsed
- [x] 1 GIF recorded (layout dropdown interaction)
- [x] 2 Page States entries created in Notion (Default + Light Mode)
- [x] Default state restored after each interaction
- [x] No browser alerts triggered
- [x] Dry run feedback written to correct file path
