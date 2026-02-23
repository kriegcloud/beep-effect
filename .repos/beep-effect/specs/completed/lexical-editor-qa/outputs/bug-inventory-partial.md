# Lexical Editor Bug Inventory (P1a: Categories 1-5)

## Summary
- Total issues found: 7
- Critical (blocks functionality): 2
- Warning (console noise / degraded UX): 4
- Minor (cosmetic/UX): 1

## Test Matrix Results

| Category | Tests | Pass | Fail | Notes |
|----------|-------|------|------|-------|
| 1. Console Baseline | 1 | 1 | 0 | Zero editor errors on initial load |
| 2. Text Formatting | 5 | 5 | 0 | Bold, Italic, Underline, Strikethrough, Clear all work |
| 3. Block Types | 8 | 7 | 1 | Code Block crashes (CodeNode not registered) |
| 4. Links | 5 | 2 | 3 | Auto-link + toolbar insert work; Ctrl+K broken, floating editor issues |
| 5. Images | 3 | 1 | 0 | Dialog UI works; URL confirm untestable due to session timeout (2 partial) |

---

## Issues

### Issue #1: Code Block crashes - CodeNode not registered

- **Severity**: Critical
- **Category**: Broken Feature
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in the email compose editor
  3. Open the block type dropdown in toolbar
  4. Select "Code Block"
  5. OR press `Ctrl+Alt+C`
- **Observed Behavior**: Uncaught error: `Node CodeNode has not been registered. Ensure node has been passed to createEditor.`
- **Expected Behavior**: Either a code block should be inserted, or the Code Block option should not appear in the dropdown.
- **Console Output**: `Uncaught Error: CodeNode has not been registered`
- **Root Cause**:
  - `ToolbarPlugin/index.tsx:344-351` renders Code Block in block type dropdown
  - `ToolbarPlugin/utils.ts:216,219` calls `$createCodeNode()` in `formatCode()` function
  - `ShortcutsPlugin/index.tsx:85-86` binds `Ctrl+Alt+C` to `formatCode()`
  - `email-compose-nodes.ts:17-28` does NOT include `CodeNode` in EMAIL_COMPOSE_NODES
- **Suggested Fix**: Two options:
  - **Option A (Recommended)**: Remove "Code Block" from toolbar dropdown and disable `Ctrl+Alt+C` shortcut when in email compose mode. Pass an `availableBlockTypes` prop or use a config to filter the dropdown.
  - **Option B**: Add `CodeNode` and `CodeHighlightNode` to EMAIL_COMPOSE_NODES. This adds complexity and requires code highlighting setup.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ToolbarPlugin/index.tsx`
  - `apps/todox/src/components/editor/plugins/ShortcutsPlugin/index.tsx`
  - `apps/todox/src/components/editor/plugins/ToolbarPlugin/utils.ts`

---

### Issue #2: Insert dropdown exposes 11 items with unregistered nodes

- **Severity**: Critical
- **Category**: Broken Feature
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in the email compose editor
  3. Click the "Insert" (+) button in toolbar
  4. Click any of: Page Break, Excalidraw, Table, Poll, Columns Layout, Equation, Sticky Note, Collapsible container, Date, X(Tweet), Youtube Video, or Figma Document
- **Observed Behavior**: Clicking these items will either crash with "Node not registered" error or dispatch commands to plugins that are not mounted.
- **Expected Behavior**: Only items with registered nodes and mounted plugins should appear in the Insert dropdown.
- **Console Output**: Varies by item - `Node XxxNode has not been registered` for most
- **Root Cause**:
  - `ToolbarPlugin/index.tsx:970-1072` renders ALL insert options regardless of which nodes are registered
  - `email-compose-nodes.ts` only registers 10 nodes for email compose
  - `plugins/index.tsx` only mounts a subset of plugins (no Table, Poll, Excalidraw, etc.)
  - The toolbar was ported directly from the full Lexical playground without filtering for email compose context
- **Items affected** (11 of 14 insert options):

  | Insert Item | Required Node | Registered? | Plugin Mounted? |
  |-------------|---------------|-------------|-----------------|
  | Horizontal Rule | HorizontalRuleNode | YES | N/A (built-in) |
  | Page Break | PageBreakNode | NO | NO |
  | Image | ImageNode | YES | YES |
  | Excalidraw | ExcalidrawNode | NO | NO |
  | Table | TableNode | NO | NO |
  | Poll | PollNode | NO | NO |
  | Columns Layout | LayoutContainerNode | NO | NO |
  | Equation | EquationNode | NO | NO |
  | Sticky Note | StickyNode | NO | NO |
  | Collapsible | CollapsibleContainerNode | NO | NO |
  | Date | DateTimeNode | NO | NO |
  | X(Tweet) | TweetNode | NO | NO |
  | Youtube Video | YouTubeNode | NO | NO |
  | Figma Document | FigmaNode | NO | NO |

- **Suggested Fix**: Filter the Insert dropdown based on which nodes are registered and which plugins are mounted. Create an `enabledInsertItems` config derived from EMAIL_COMPOSE_NODES. Only show: Horizontal Rule, Image.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ToolbarPlugin/index.tsx` (lines 960-1072)

---

### Issue #3: Ctrl+K shortcut conflicts with global command palette

- **Severity**: Warning
- **Category**: UX / Shortcut Conflict
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in the email compose editor
  3. Type some text and select a word
  4. Press `Ctrl+K`
- **Observed Behavior**: Both the editor's link insertion AND the app's global command palette fire simultaneously. The command palette opens over the editor, stealing focus. The selected text is converted to a link with `href="https://"` but the floating link editor is hidden behind/below the command palette and has empty content.
- **Expected Behavior**: When the editor is focused, `Ctrl+K` should only trigger link insertion. The event should be stopped from propagating to the global command palette handler.
- **Console Output**: No console errors
- **Root Cause**:
  - `ShortcutsPlugin/index.tsx:121-124` handles `Ctrl+K` via `isInsertLink(event)` and dispatches `TOGGLE_LINK_COMMAND`
  - The app-level command palette also listens for `Ctrl+K` globally
  - The Lexical shortcut handler does NOT call `event.stopPropagation()` to prevent the event from reaching the global handler
- **Suggested Fix**: In `ShortcutsPlugin/index.tsx`, add `event.stopPropagation()` when the editor handles `Ctrl+K`:
  ```typescript
  if (isInsertLink(event)) {
    event.preventDefault();
    event.stopPropagation(); // Prevent global command palette from opening
    setIsLinkEditMode(!isLink);
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, isLink ? null : sanitizeUrl("https://"));
    return;
  }
  ```
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ShortcutsPlugin/index.tsx`

---

### Issue #4: Floating link editor not visible after Ctrl+K link creation

- **Severity**: Warning
- **Category**: Broken Feature
- **Reproduction**:
  1. Navigate to `/` route
  2. Type text, select a word
  3. Press `Ctrl+K` (dismiss command palette with Escape)
  4. Click on the newly created link
- **Observed Behavior**: The `.link-editor` DOM element exists but has `innerHTML: ""`, `height: 0px`, positioned at `top: 1065px` (off-screen, viewport is ~775px). Clicking on an existing link does not show the floating link editor.
- **Expected Behavior**: Clicking a link should show the floating link editor with the current URL, edit/trash buttons.
- **Console Output**: No console errors
- **Root Cause**:
  - `FloatingLinkEditorPlugin/index.tsx:254` renders `null` when `isLink` is false
  - `FloatingLinkEditorPlugin/index.tsx:328-370` - `$updateToolbar()` should set `isLink=true` when selection is inside a link
  - The issue appears to be that `ClickableLinkPlugin` (mounted with `disabled={isEditable}`) may be interfering with selection behavior when clicking links
  - `FloatingLinkEditorPlugin/index.tsx:252` - the `.link-editor` div always exists but renders empty when `isLink` is false, causing the 0px height and off-screen positioning
- **Suggested Fix**: Investigate the interaction between `ClickableLinkPlugin` and `FloatingLinkEditorPlugin`. The `disabled={isEditable}` on line 129 of `plugins/index.tsx` means the plugin is disabled when the editor is editable - verify this is intentional. Additionally, check if the CLICK_COMMAND handler (lines 386-401) needs to set `isLink` state when clicking on links.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/FloatingLinkEditorPlugin/index.tsx`
  - `apps/todox/src/components/editor/plugins/index.tsx` (ClickableLinkPlugin config)

---

### Issue #5: Floating link editor empty after toolbar "Insert Link"

- **Severity**: Warning
- **Category**: Broken Feature (Partial)
- **Reproduction**:
  1. Navigate to `/` route
  2. Type text, select a word
  3. Click the "Insert Link" toolbar button (NOT Ctrl+K)
  4. Floating link editor appears with URL input
  5. Type a URL and press Enter
  6. Click elsewhere, then click back on the link
- **Observed Behavior**: The floating link editor works correctly when first inserting via toolbar button. However, clicking on an existing link later does NOT re-show the floating editor for editing.
- **Expected Behavior**: Clicking on any existing link should show the floating link editor with options to view URL, edit, or remove.
- **Console Output**: No console errors
- **Root Cause**: Same as Issue #4 - the `isLink` state in `FloatingLinkEditorPlugin` is not being set to `true` when clicking on existing links after initial insertion.
- **Suggested Fix**: Same investigation as Issue #4 - ensure selection change into a link node properly sets `isLink` state.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/FloatingLinkEditorPlugin/index.tsx`

---

### Issue #6: ComponentPickerPlugin (slash commands) may reference unavailable nodes

- **Severity**: Warning
- **Category**: Broken Feature (Suspected)
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in the editor
  3. Type `/` to open the component picker
  4. Select an item that requires an unregistered node (e.g., "Code", "Table", "Equation")
- **Observed Behavior**: Not browser-tested due to session instability, but code analysis suggests the ComponentPickerPlugin likely offers the same full set of options as the Insert dropdown.
- **Expected Behavior**: Only components with registered nodes should appear in the slash command menu.
- **Console Output**: Expected `Node XxxNode has not been registered` errors
- **Root Cause**: `ComponentPickerPlugin/index.tsx` likely mirrors the full Lexical playground options without filtering for EMAIL_COMPOSE_NODES.
- **Suggested Fix**: Audit `ComponentPickerPlugin/index.tsx` and filter available options based on registered nodes. Same pattern as Issue #2 fix.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ComponentPickerPlugin/index.tsx`

---

### Issue #7: Insert Image dialog - session instability during confirm

- **Severity**: Minor
- **Category**: UX (Inconclusive)
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in editor, click Insert (+) → Image
  3. Insert Image dialog appears correctly with URL/File tabs
  4. Enter a URL and alt text
  5. Click Confirm
- **Observed Behavior**: App shows "We hit a snag verifying your session" after clicking Confirm. Occurred 2/2 times during testing. However, this may be caused by auth session timeout rather than the image insertion itself.
- **Expected Behavior**: Image should be inserted into the editor.
- **Console Output**: Session verification error (auth-related)
- **Root Cause**: Likely auth session timeout during the multi-step dialog interaction, not an editor bug. The Insert Image dialog UI renders correctly, and code analysis confirms:
  - ImageNode IS in EMAIL_COMPOSE_NODES
  - ImagesPlugin IS mounted and checks for ImageNode registration
  - INSERT_IMAGE_COMMAND handler correctly creates and inserts ImageNode
  - Drag-and-drop handlers use proper Effect patterns (Option, Either, Schema)
- **Suggested Fix**: Re-test once auth session stability is resolved. Code path appears correct. If issue persists, investigate whether the dialog's Confirm handler triggers a network request that fails auth.
- **Affected Files**:
  - None (likely not an editor bug)

---

## Passing Tests Summary

### Category 1: Console Baseline
- [x] Zero editor-related console errors on initial page load at `/` route

### Category 2: Text Formatting
- [x] Bold (Ctrl+B) - toggles correctly
- [x] Italic (Ctrl+I) - toggles correctly
- [x] Underline (Ctrl+U) - toggles correctly
- [x] Strikethrough (toolbar button) - toggles correctly
- [x] Clear formatting - works correctly

### Category 3: Block Types
- [x] Heading 1/2/3 - keyboard shortcuts work (Ctrl+Alt+1/2/3)
- [x] Quote block - Ctrl+Shift+Q works
- [x] Bullet list - Ctrl+Shift+7 works, items continue on Enter, exit on double Enter
- [x] Ordered list - Ctrl+Shift+8 works, same behavior as bullet
- [x] Checklist - Ctrl+Shift+9 creates checklist items
- [ ] **Code Block - FAILS** (Issue #1)

### Category 4: Links
- [x] Auto-link detection - typing URLs auto-converts to links
- [x] Insert link via toolbar button - works, floating editor appears
- [ ] **Ctrl+K link insertion - FAILS** (Issue #3)
- [ ] **Floating link editor on link click - FAILS** (Issue #4)
- [ ] **Edit existing link - FAILS** (Issue #5)

### Category 5: Images
- [x] Insert Image dialog appears correctly (URL + File tabs)
- [~] Image URL insertion - dialog works but Confirm causes session error (Issue #7, likely auth)
- [~] Image paste/drag-drop - not tested due to session instability
- Code analysis confirms: ImageNode registered, ImagesPlugin mounted, insertion path correct

---

## Observations for P1b

1. **Session instability**: The dev auth session times out frequently during multi-step UI interactions. P1b testing should ensure a fresh, long-lived session or implement faster test sequences.

2. **Insert dropdown audit**: The full ToolbarPlugin Insert dropdown needs to be context-aware. This is a systemic issue affecting multiple features (Issue #2).

3. **ComponentPickerPlugin audit**: The slash command menu likely has the same problem as the Insert dropdown (Issue #6). Priority for P1b Category 6 (Special Features) testing.

4. **FloatingLinkEditorPlugin investigation**: The link editing bugs (Issues #4, #5) need deeper investigation during P2. The `isLink` state management may have a subtle timing issue.

5. **ClickableLinkPlugin configuration**: `disabled={isEditable}` on line 129 of `plugins/index.tsx` needs verification - it means the plugin is disabled when editing, which seems correct (don't navigate on click while editing), but may interfere with selection behavior.

---

## Files Investigated

| File | Purpose | Issues Found |
|------|---------|-------------|
| `plugins/ToolbarPlugin/index.tsx` | Main toolbar with block types + insert dropdown | Issues #1, #2 |
| `plugins/ToolbarPlugin/utils.ts` | Block formatting utilities (formatCode, etc.) | Issue #1 |
| `plugins/ShortcutsPlugin/index.tsx` | Keyboard shortcut handlers | Issues #1, #3 |
| `plugins/ShortcutsPlugin/shortcuts.ts` | Shortcut key definitions | Issues #1, #3 |
| `plugins/FloatingLinkEditorPlugin/index.tsx` | Floating link edit toolbar | Issues #4, #5 |
| `plugins/ImagesPlugin/index.tsx` | Image insertion + drag/drop | Issue #7 (likely clean) |
| `plugins/index.tsx` | EmailComposePlugins composition | Issues #2, #4 |
| `nodes/email-compose-nodes.ts` | 10-node email compose node set | Issues #1, #2 |
| `nodes/ImageNode.tsx` | Image node definition | Clean |

---

*Generated during P1a QA testing session, 2026-02-14*
*Categories tested: 1-5 of 10*
*Remaining for P1b: Categories 6 (Special Features), 7 (Editor Modes), 8 (Keyboard Shortcuts), 9 (Markdown Serialization), 10 (Edge Cases)*
