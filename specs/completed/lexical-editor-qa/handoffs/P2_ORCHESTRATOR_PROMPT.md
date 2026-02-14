# P2 Orchestrator Prompt: Fix Implementation

## Mission

Implement ALL fixes from `specs/pending/lexical-editor-qa/outputs/bug-inventory.md` for the canonical Lexical editor at `apps/todox/src/components/editor/`.

## Prerequisites

1. Read `specs/pending/lexical-editor-qa/outputs/bug-inventory.md` for complete issue details
2. Read `specs/pending/lexical-editor-qa/handoffs/HANDOFF_P2.md` for fix priority and context
3. Read `specs/pending/lexical-editor-qa/REFLECTION_LOG.md` for P1 learnings

## Fix Strategy

### Principle: Remove/Hide > Add Support

For all node registration issues, **remove or hide** the UI option rather than registering additional nodes. The email compose editor should remain lightweight with only 10 nodes.

### Fix Order (by shared root cause, not issue number)

#### Batch 1: Node Registration Fixes (Issues #1, #2, #8, #9)

All share the pattern: UI component offers feature requiring unregistered node.

**Issue #1 + #2: ToolbarPlugin filtering**
- File: `plugins/ToolbarPlugin/index.tsx`
- Remove "Code Block" from block type dropdown (~line 344-351)
- Filter Insert dropdown (~lines 960-1072) to only show items whose nodes are registered. Keep: Horizontal Rule, Image. Remove: Page Break, Excalidraw, Table, Poll, Columns Layout, Equation, Sticky Note, Collapsible, Date, X(Tweet), Youtube Video, Figma Document.
- File: `plugins/ToolbarPlugin/utils.ts` - no changes needed if Code Block option is removed from dropdown
- File: `plugins/ShortcutsPlugin/index.tsx` (~line 85-86) - remove or guard the `isFormatCode` handler

**Issue #8: ActionsPlugin markdown toggle**
- File: `plugins/ActionsPlugin/index.tsx`
- Remove or hide the Markdown toggle button (lines 468-478) and its handler `handleMarkdownToggle` (lines 282-307)
- Also consider hiding Import/Export/Share/Lock buttons that are playground features, not email compose features (Issue #12)

**Issue #9: ComponentPickerPlugin slash command filtering**
- File: `plugins/ComponentPickerPlugin/index.tsx`
- Filter `getBaseOptions()` to only return options whose required nodes are in EMAIL_COMPOSE_NODES
- Keep: Paragraph, Heading 1/2/3, Numbered List, Bulleted List, Check List, Quote, Divider, GIF, Image, Align left/center/right/justify
- Remove: Table, Code, Page Break, Excalidraw, Poll, Embed Tweet/YouTube/Figma, Date/Today/Tomorrow/Yesterday, Equation, Collapsible, Columns Layout
- Also filter `getDynamicOptions()` to not create Table options

#### Batch 2: Link Editor Fixes (Issues #3, #4, #5)

**Issue #3: Ctrl+K stopPropagation**
- File: `plugins/ShortcutsPlugin/index.tsx` (~line 121-124)
- Add `event.stopPropagation()` after `event.preventDefault()` in the `isInsertLink` handler

**Issues #4/#5: FloatingLinkEditorPlugin isLink state**
- File: `plugins/FloatingLinkEditorPlugin/index.tsx`
- Investigate why `$updateToolbar()` doesn't set `isLink=true` when selection is inside a link after initial creation
- Check the SELECTION_CHANGE_COMMAND listener and CLICK_COMMAND handler
- Ensure clicking on an existing link properly triggers the floating editor

#### Batch 3: Minor Cleanup (Issues #10, #11, #12)

**Issue #10: Comment shortcut silent failure**
- File: `plugins/ShortcutsPlugin/index.tsx` (~line 125-126)
- Remove the `isAddComment` handler entirely (CommentPlugin not mounted)

**Issue #11: Fullscreen undo history loss**
- Accept as known limitation of the remount-based approach
- No code change needed - document in a comment in `lexical-editor.tsx`

**Issue #12: ActionsPlugin inappropriate buttons**
- Addressed as part of Issue #8 fix - remove playground-specific buttons

#### Deferred

**Issue #7: Image dialog session error** - Not an editor bug, defer

## Verification After Each Batch

```bash
bun run lint:fix --filter @beep/todox
bun run check --filter @beep/todox
```

## Rules

- Only modify files in `apps/todox/src/components/editor/` and its consumers
- Do NOT add new features - only fix broken behavior
- Follow all Effect patterns from `.claude/rules/effect-patterns.md`
- If a fix requires architectural changes, document in REFLECTION_LOG and defer
- Update `outputs/bug-inventory.md` with fix status after each batch (Fixed / Deferred / Won't Fix)

## Node Registration Reference

EMAIL_COMPOSE_NODES (10 nodes):
```
HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode,
HorizontalRuleNode, ImageNode, MentionNode, EmojiNode
```

## Key Files

| File | Issues | Changes |
|------|--------|---------|
| `plugins/ToolbarPlugin/index.tsx` | #1, #2 | Remove Code Block from dropdown, filter Insert items |
| `plugins/ComponentPickerPlugin/index.tsx` | #9 | Filter slash command options |
| `plugins/ActionsPlugin/index.tsx` | #8, #12 | Remove markdown toggle + playground buttons |
| `plugins/ShortcutsPlugin/index.tsx` | #1, #3, #10 | Remove Code shortcut, add stopPropagation to Ctrl+K, remove comment shortcut |
| `plugins/FloatingLinkEditorPlugin/index.tsx` | #4, #5 | Fix isLink state on selection change |
| `plugins/ToolbarPlugin/utils.ts` | #1 | Guard formatCode if needed |
