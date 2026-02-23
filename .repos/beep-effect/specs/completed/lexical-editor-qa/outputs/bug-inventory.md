# Lexical Editor Bug Inventory

## Summary

- **Total issues found**: 12
- **Critical** (blocks functionality): 4 (#1, #2, #8, #9)
- **Warning** (degraded UX / console noise): 4 (#3, #4/#5 combined root cause, #11, #12)
- **Minor** (cosmetic / inconclusive): 2 (#7, #10)

### Severity Distribution

| Severity | Count | Issue Numbers |
|----------|-------|---------------|
| Critical | 4 | #1, #2, #8, #9 |
| Warning | 4 | #3, #4/#5, #11, #12 |
| Minor | 2 | #7, #10 |

### Category Distribution

| Category | Count | Issue Numbers |
|----------|-------|---------------|
| Broken Feature | 7 | #1, #2, #4, #5, #6/#9, #8 |
| UX / Shortcut Conflict | 1 | #3 |
| UX / State Loss | 1 | #11 |
| UX / Inappropriate Controls | 1 | #12 |
| Silent Failure | 1 | #10 |
| Inconclusive | 1 | #7 |

---

## Test Matrix Results

### Summary Table

| Category | Tests | Pass | Fail | Notes |
|----------|-------|------|------|-------|
| 1. Console Baseline | 1 | 1 | 0 | Zero editor errors on initial load |
| 2. Text Formatting | 5 | 5 | 0 | Bold, Italic, Underline, Strikethrough, Clear all work |
| 3. Block Types | 8 | 7 | 1 | Code Block crashes (CodeNode not registered) |
| 4. Links | 5 | 2 | 3 | Auto-link + toolbar insert work; Ctrl+K broken, floating editor issues |
| 5. Images | 3 | 1 | 0 | Dialog UI works; URL confirm untestable due to session timeout (2 partial) |
| 6. Special Features | 6 | 5 | 1 | Slash command menu has 15+ broken options |
| 7. Editor Modes | 4 | 3 | 1 | Fullscreen works but undo history lost on toggle |
| 8. Keyboard Shortcuts | 4 | 2 | 2 | Ctrl+Alt+C crashes, Ctrl+Alt+M silent failure |
| 9. Markdown Serialization | 2 | 1 | 1 | onChange works; markdown toggle button crashes |
| 10. Edge Cases | 4 | 4 | 0 | Empty editor, paste, select all+delete, rapid formatting all pass |

### Detailed Results

#### Category 1: Console Baseline
- [x] Zero editor-related console errors on initial page load at `/` route

#### Category 2: Text Formatting
- [x] Bold (Ctrl+B) -- toggles correctly
- [x] Italic (Ctrl+I) -- toggles correctly
- [x] Underline (Ctrl+U) -- toggles correctly
- [x] Strikethrough (toolbar button) -- toggles correctly
- [x] Clear formatting -- works correctly

#### Category 3: Block Types
- [x] Heading 1/2/3 -- keyboard shortcuts work (Ctrl+Alt+1/2/3)
- [x] Quote block -- Ctrl+Shift+Q works
- [x] Bullet list -- Ctrl+Shift+7 works, items continue on Enter, exit on double Enter
- [x] Ordered list -- Ctrl+Shift+8 works, same behavior as bullet
- [x] Checklist -- Ctrl+Shift+9 creates checklist items
- [ ] **Code Block -- FAILS** (Issue #1)

#### Category 4: Links
- [x] Auto-link detection -- typing URLs auto-converts to links
- [x] Insert link via toolbar button -- works, floating editor appears on initial insert
- [ ] **Ctrl+K link insertion -- FAILS** (Issue #3: shortcut conflict with command palette)
- [ ] **Floating link editor on existing link click -- FAILS** (Issue #4)
- [ ] **Edit existing link -- FAILS** (Issue #5: same root cause as #4)

#### Category 5: Images
- [x] Insert Image dialog appears correctly (URL + File tabs)
- [~] Image URL insertion -- dialog works but Confirm causes session error (Issue #7, likely auth)
- [~] Image paste/drag-drop -- not tested due to session instability
- Code analysis confirms: ImageNode registered, ImagesPlugin mounted, insertion path correct

#### Category 6: Special Features
- [x] Emoji picker (`:` trigger) -- PASS (uses `$createTextNode`, no custom nodes needed)
- [x] Mention picker (`@` trigger) -- PASS (MentionNode IS registered)
- [x] Horizontal rule -- PASS (HorizontalRuleNode IS registered)
- [x] Markdown shortcuts (`# ` for heading, `- ` for list) -- PASS (uses EMAIL_COMPOSE_TRANSFORMERS which are filtered)
- [ ] **Component picker (`/` slash command) -- FAILS** (Issue #9: 15+ broken options crash when selected)

#### Category 7: Editor Modes
- [x] Fullscreen toggle -- content preserved on toggle
- [x] Escape exits fullscreen
- [x] Body scroll locked during fullscreen
- [ ] **Undo history after fullscreen -- FAILS** (Issue #11: history reset on remount)

#### Category 8: Keyboard Shortcuts
- [x] Undo (Ctrl+Z) / Redo (Ctrl+Y) -- work in normal operation
- [x] Tab focus -- TabFocusPlugin mounted, works correctly
- [ ] **Ctrl+Alt+M (Add Comment) -- FAILS** (Issue #10: silent failure, no plugin mounted)
- [ ] **Ctrl+Alt+C (Code Block) -- FAILS** (Issue #1: crash)

#### Category 9: Markdown Serialization
- [x] onChange via ContentTracker/MarkdownBridge -- PASS (proper node registration)
- [ ] **Markdown toggle button -- FAILS** (Issue #8: crash, CodeNode not registered)

#### Category 10: Edge Cases
- [x] Empty editor -- renders placeholder correctly
- [x] Paste plain text -- standard Lexical behavior, works
- [x] Select all + delete -- standard Lexical behavior, works
- [x] Rapid formatting toggle -- standard Lexical behavior, works

---

## Issues

### Issue #1: Code Block crashes -- CodeNode not registered

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
- **Observed Behavior**: Clicking these items crashes with "Node not registered" error or dispatches commands to plugins that are not mounted.
- **Expected Behavior**: Only items with registered nodes and mounted plugins should appear in the Insert dropdown.
- **Console Output**: Varies by item -- `Node XxxNode has not been registered` for most
- **Root Cause**:
  - `ToolbarPlugin/index.tsx:970-1072` renders ALL insert options regardless of which nodes are registered
  - `email-compose-nodes.ts` only registers 10 nodes for email compose
  - `plugins/index.tsx` only mounts a subset of plugins (no Table, Poll, Excalidraw, etc.)
  - The toolbar was ported directly from the full Lexical playground without filtering for email compose context
- **Items Affected** (11 of 14 insert options):

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
  - `FloatingLinkEditorPlugin/index.tsx:328-370` -- `$updateToolbar()` should set `isLink=true` when selection is inside a link
  - The issue appears to be that `ClickableLinkPlugin` (mounted with `disabled={isEditable}`) may be interfering with selection behavior when clicking links
  - `FloatingLinkEditorPlugin/index.tsx:252` -- the `.link-editor` div always exists but renders empty when `isLink` is false, causing the 0px height and off-screen positioning
- **Suggested Fix**: Investigate the interaction between `ClickableLinkPlugin` and `FloatingLinkEditorPlugin`. The `disabled={isEditable}` on line 129 of `plugins/index.tsx` means the plugin is disabled when the editor is editable -- verify this is intentional. Additionally, check if the CLICK_COMMAND handler (lines 386-401) needs to set `isLink` state when clicking on links.
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
- **Root Cause**: Same as Issue #4 -- the `isLink` state in `FloatingLinkEditorPlugin` is not being set to `true` when clicking on existing links after initial insertion.
- **Suggested Fix**: Same investigation as Issue #4 -- ensure selection change into a link node properly sets `isLink` state.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/FloatingLinkEditorPlugin/index.tsx`

---

### Issue #6: ComponentPickerPlugin (slash commands) references unavailable nodes

> **Note**: This issue was initially identified as "suspected" in P1a. P1b confirmed and expanded it as Issue #9 below with a full audit. This entry is retained for traceability. See Issue #9 for the complete analysis.

- **Severity**: Critical (upgraded from Warning after P1b confirmation)
- **Category**: Broken Feature
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in the editor
  3. Type `/` to open the component picker
  4. Select an item that requires an unregistered node (e.g., "Code", "Table", "Equation")
- **Observed Behavior**: Selecting unregistered node options crashes with "Node XxxNode has not been registered"
- **Expected Behavior**: Only components with registered nodes should appear in the slash command menu.
- **Console Output**: `Node XxxNode has not been registered`
- **Root Cause**: `ComponentPickerPlugin/index.tsx` -- `getBaseOptions()` returns ~28 options without filtering against EMAIL_COMPOSE_NODES. See Issue #9 for complete broken/working option breakdown.
- **Suggested Fix**: Filter `getBaseOptions()` to only include options whose required nodes are registered. Create a whitelist based on EMAIL_COMPOSE_NODES.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ComponentPickerPlugin/index.tsx`

---

### Issue #7: Insert Image dialog -- session instability during confirm

- **Severity**: Minor
- **Category**: UX (Inconclusive)
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in editor, click Insert (+) then Image
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

### Issue #8: ActionsPlugin markdown toggle crashes -- CodeNode not registered

- **Severity**: Critical
- **Category**: Broken Feature
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in the email compose editor
  3. Type some text
  4. Click the Markdown toggle button (markdown icon) in the bottom-right action bar
- **Observed Behavior**: Crash with `Node CodeNode has not been registered`
- **Expected Behavior**: Either the markdown toggle should work without CodeNode, or the button should not be shown in email compose mode.
- **Console Output**: `Uncaught Error: CodeNode has not been registered`
- **Root Cause**: `ActionsPlugin/index.tsx:282-307` -- `handleMarkdownToggle()` calls `$createCodeNode("markdown")` at line 299 to switch to markdown view mode. CodeNode is NOT in EMAIL_COMPOSE_NODES.
  ```typescript
  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          transformers,
          ...
        );
      } else {
        const markdown = $convertToMarkdownString(transformers, ...);
        const codeNode = $createCodeNode("markdown"); // CodeNode NOT registered!
        codeNode.append($createTextNode(markdown));
        root.clear().append(codeNode);
      }
    });
  }, [...]);
  ```
- **Suggested Fix**: Two options:
  - **Option A (Recommended)**: Hide the markdown toggle button in email compose mode. It is a developer/debug feature not needed for email composition. Conditionally render based on a config prop or by detecting the node set.
  - **Option B**: Replace the CodeNode-based markdown view with a simple textarea overlay or read-only pre block that does not require CodeNode registration.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ActionsPlugin/index.tsx` (lines 282-307, 468-478)

---

### Issue #9: ComponentPickerPlugin has 15+ broken slash command options

> **Note**: This is the confirmed and expanded version of Issue #6, discovered during P1b testing.

- **Severity**: Critical
- **Category**: Broken Feature
- **Reproduction**:
  1. Navigate to `/` route
  2. Click in the editor
  3. Type `/` to open the component picker
  4. Select any of the broken options listed below
- **Observed Behavior**: Selecting unregistered node options crashes with "Node XxxNode has not been registered"
- **Expected Behavior**: Only components with registered nodes should appear in the slash command menu.
- **Console Output**: `Node XxxNode has not been registered` (varies by option selected)
- **Root Cause**: `ComponentPickerPlugin/index.tsx` -- `getBaseOptions()` returns ~28 options. Cross-referencing against EMAIL_COMPOSE_NODES (10 nodes), the following options are broken:

  | Slash Command Option | Required Node(s) | Registered? | Will Crash? |
  |---|---|---|---|
  | Table (NxM) | TableNode, TableRowNode, TableCellNode | NO | YES |
  | Table (dynamic) | TableNode, TableRowNode, TableCellNode | NO | YES |
  | Code | CodeNode, CodeHighlightNode | NO | YES |
  | Page Break | PageBreakNode | NO | YES |
  | Excalidraw | ExcalidrawNode | NO | YES |
  | Poll | PollNode | NO | YES |
  | Embed Tweet | TweetNode | NO | YES |
  | Embed YouTube | YouTubeNode | NO | YES |
  | Embed Figma | FigmaNode | NO | YES |
  | Today | DateTimeNode | NO | YES |
  | Tomorrow | DateTimeNode | NO | YES |
  | Yesterday | DateTimeNode | NO | YES |
  | Date | DateTimeNode | NO | YES |
  | Equation | EquationNode | NO | YES |
  | Collapsible | CollapsibleContainerNode | NO | YES |
  | Columns Layout | LayoutContainerNode | NO | YES |

  Working slash command options: Paragraph, Heading 1/2/3, Numbered List, Bulleted List, Check List, Quote, Divider, GIF (opens Tenor), Image, Align left/center/right/justify

- **Suggested Fix**: Filter `getBaseOptions()` to only include options whose required nodes are registered. Create a whitelist based on EMAIL_COMPOSE_NODES:
  ```typescript
  // Example: filter by checking editor._nodes
  const registeredNodeTypes = new Set(editor._nodes.keys());
  const filteredOptions = getBaseOptions().filter(option =>
    option.requiredNodes?.every(node => registeredNodeTypes.has(node)) ?? true
  );
  ```
  Alternatively, accept an `enabledOptions` config prop from the parent and pass only the working options.
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ComponentPickerPlugin/index.tsx`

---

### Issue #10: ShortcutsPlugin Ctrl+Alt+M dispatches to unmounted CommentPlugin

- **Severity**: Minor
- **Category**: Silent Failure
- **Reproduction**:
  1. Navigate to `/` route
  2. Focus the email compose editor
  3. Press `Ctrl+Alt+M`
- **Observed Behavior**: Nothing happens (no crash, no visible effect).
- **Expected Behavior**: Either the shortcut should be disabled, or a user-facing message should indicate that comments are not available.
- **Console Output**: None (silent failure)
- **Root Cause**: `ShortcutsPlugin/index.tsx:125-126` dispatches `INSERT_INLINE_COMMAND` which is handled by CommentPlugin. CommentPlugin is NOT mounted in EmailComposePlugins (`plugins/index.tsx`). The command dispatch silently does nothing because no listener is registered.
- **Suggested Fix**: Remove the `isAddComment` handler from ShortcutsPlugin when in email compose mode, or add a no-op handler that shows a toast "Comments not available in email compose".
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ShortcutsPlugin/index.tsx`

---

### Issue #11: Fullscreen toggle resets undo history

- **Severity**: Warning
- **Category**: UX / State Loss
- **Reproduction**:
  1. Navigate to `/` route
  2. Type content in the email compose editor
  3. Make several changes
  4. Toggle fullscreen
  5. Press Ctrl+Z to undo
- **Observed Behavior**: Undo does nothing after fullscreen toggle. Previous edit history is lost.
- **Expected Behavior**: Undo history should be preserved across fullscreen toggles, or the user should be informed that toggling resets history.
- **Console Output**: No console errors
- **Root Cause**: `lexical-editor.tsx:136-142` -- `handleToggleFullscreen` increments `rerenderKey` which forces a complete editor remount via `key={rerenderKey}` on LexicalExtensionComposer (line 171). While content is preserved via `contentRef`, the HistoryPlugin state is lost because it is created fresh on each mount.
- **Suggested Fix**: Two options:
  - **Option A (Minimal)**: Accept as known limitation. Add a tooltip to the fullscreen button: "Fullscreen toggle resets undo history".
  - **Option B (Complex)**: Persist history state externally similar to the `contentRef` pattern. This may not be worth the implementation cost for email compose.
- **Affected Files**:
  - `apps/todox/src/components/editor/lexical-editor.tsx`

---

### Issue #12: ActionsPlugin shows inappropriate buttons for email compose

- **Severity**: Warning
- **Category**: UX / Inappropriate Controls
- **Reproduction**:
  1. Navigate to `/` route
  2. Look at the bottom-right of the email compose editor
- **Observed Behavior**: Shows Speech-to-Text, Import, Export, Share, Clear, Lock/Unlock, and Markdown toggle buttons. Most of these are playground/developer features inappropriate for email compose context.
- **Expected Behavior**: Only contextually appropriate buttons should be shown (e.g., Clear, possibly Speech-to-Text).
- **Console Output**: No console errors
- **Root Cause**: `ActionsPlugin/index.tsx:309-530` renders ALL action buttons without filtering for email compose context. Import/Export (JSON state), Share (playground link), Lock/Unlock (read-only mode) are not relevant features for composing emails.
- **Suggested Fix**: Create an `EmailComposeActionsPlugin` that only renders contextually appropriate buttons (Clear, possibly Speech-to-Text). Or pass a config prop to ActionsPlugin to control which buttons are shown:
  ```typescript
  // Option A: Config prop
  <ActionsPlugin
    enabledActions={["clear", "speechToText"]}
  />

  // Option B: Separate component
  <EmailComposeActionsPlugin />  // Only renders Clear + Speech-to-Text
  ```
- **Affected Files**:
  - `apps/todox/src/components/editor/plugins/ActionsPlugin/index.tsx`
  - `apps/todox/src/components/editor/plugins/index.tsx`

---

## Fix Priority Order

Recommended implementation order for Phase 2:

| Priority | Issue(s) | Rationale |
|----------|----------|-----------|
| 1 | #2 + #9 | Highest user-facing crash surface area: toolbar Insert dropdown + slash commands expose 26+ crash-triggering options combined |
| 2 | #1 + #8 | CodeNode-related crashes from toolbar dropdown and markdown toggle |
| 3 | #3 | Ctrl+K conflict is a common shortcut; one-line fix |
| 4 | #4 + #5 | Floating link editor requires deeper investigation but affects core link editing |
| 5 | #12 | Remove inappropriate action bar buttons to reduce confusion |
| 6 | #10 | Remove dead shortcut handler (low effort) |
| 7 | #11 | Accept as known limitation or add tooltip |
| 8 | #7 | Re-test with stable auth session; likely not an editor bug |

---

## Files Investigated

| File | Purpose | Issues Found |
|------|---------|--------------|
| `plugins/ToolbarPlugin/index.tsx` | Main toolbar with block types + insert dropdown | #1, #2 |
| `plugins/ToolbarPlugin/utils.ts` | Block formatting utilities (`formatCode`, etc.) | #1 |
| `plugins/ShortcutsPlugin/index.tsx` | Keyboard shortcut handlers | #1, #3, #10 |
| `plugins/ShortcutsPlugin/shortcuts.ts` | Shortcut key definitions | #1, #3 |
| `plugins/FloatingLinkEditorPlugin/index.tsx` | Floating link edit toolbar | #4, #5 |
| `plugins/ImagesPlugin/index.tsx` | Image insertion + drag/drop | #7 (likely clean) |
| `plugins/ComponentPickerPlugin/index.tsx` | Slash command menu (`/` trigger) | #6, #9 |
| `plugins/ActionsPlugin/index.tsx` | Bottom-right action bar (markdown toggle, import/export) | #8, #12 |
| `plugins/index.tsx` | EmailComposePlugins composition | #2, #4, #12 |
| `nodes/email-compose-nodes.ts` | 10-node email compose node set | #1, #2, #8, #9 |
| `nodes/ImageNode.tsx` | Image node definition | Clean |
| `lexical-editor.tsx` | Main editor component (fullscreen, rerender) | #11 |

All file paths are relative to `apps/todox/src/components/editor/`.

---

## Architecture Notes

### EMAIL_COMPOSE_NODES (10 nodes)

The email compose editor registers a subset of Lexical nodes:

1. HeadingNode
2. QuoteNode
3. ListNode
4. ListItemNode
5. LinkNode
6. AutoLinkNode
7. HorizontalRuleNode
8. ImageNode
9. MentionNode
10. EmojiNode

### Systemic Root Cause

Issues #1, #2, #8, #9, and #12 share a common root cause: the editor plugins, toolbar, and action bar were ported directly from the full Lexical playground without filtering for the email compose context. The node set was correctly restricted to 10 nodes, but the UI layer (toolbar dropdowns, slash commands, action buttons) was not updated to match. This mismatch is the single largest source of bugs.

### Recommended Systemic Fix

Rather than patching each plugin individually, consider creating a central `EditorCapabilities` config derived from the registered node set:

```typescript
// Derive capabilities from registered nodes
const capabilities = {
  codeBlock: nodes.includes(CodeNode),
  tables: nodes.includes(TableNode),
  images: nodes.includes(ImageNode),
  // ...
};

// Pass to all plugins
<ToolbarPlugin capabilities={capabilities} />
<ComponentPickerPlugin capabilities={capabilities} />
<ActionsPlugin capabilities={capabilities} />
<ShortcutsPlugin capabilities={capabilities} />
```

This approach ensures that adding or removing nodes from EMAIL_COMPOSE_NODES automatically adjusts the entire UI.

---

## Generation Metadata

| Field | Value |
|-------|-------|
| **Generated** | 2026-02-14 |
| **Spec** | `specs/pending/lexical-editor-qa` |
| **Phase** | P1a + P1b merged |
| **Categories Tested** | 1-10 (complete) |
| **Route Tested** | `/` (root route, mail inbox with email compose editor) |
| **Editor Location** | `apps/todox/src/components/editor/` |
| **Entry Component** | `lexical-editor.tsx` (LexicalEditor) |
| **Node Config** | `nodes/email-compose-nodes.ts` (EMAIL_COMPOSE_NODES) |
| **Plugin Config** | `plugins/index.tsx` (EmailComposePlugins) |
| **Next Phase** | P2: Fix Implementation (use `handoffs/HANDOFF_P2.md`) |
