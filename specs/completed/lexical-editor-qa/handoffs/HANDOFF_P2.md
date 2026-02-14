# Phase 2 Handoff: Fix Implementation

## Context
Phase 1 (bug inventory) is complete. 12 issues were found across the canonical Lexical editor at `apps/todox/src/components/editor/`. This document provides context for the P2 fix implementation phase.

## Bug Inventory Location
`specs/pending/lexical-editor-qa/outputs/bug-inventory.md`

## Fix Priority Order

### Tier 1: Node Registration Fixes (4 Critical issues, shared pattern)
These all share the same root cause: UI components offering features for unregistered nodes.

| Issue | Component | Fix Strategy |
|-------|-----------|-------------|
| #1 | ToolbarPlugin - Code Block in block type dropdown | Remove Code Block from dropdown, disable Ctrl+Alt+C |
| #2 | ToolbarPlugin - 11 Insert dropdown items | Filter to only show Horizontal Rule + Image |
| #8 | ActionsPlugin - Markdown toggle button | Hide button in email compose mode |
| #9 | ComponentPickerPlugin - 15+ broken slash commands | Filter getBaseOptions() to whitelist only registered-node options |

**Pattern**: For each component, create a whitelist of allowed items based on what nodes are in EMAIL_COMPOSE_NODES. Remove or conditionally hide items not in the whitelist.

### Tier 2: Link Editor Fixes (2 Warning issues, shared root cause)
| Issue | Component | Fix Strategy |
|-------|-----------|-------------|
| #3 | ShortcutsPlugin - Ctrl+K stopPropagation | Add event.stopPropagation() |
| #4/#5 | FloatingLinkEditorPlugin - isLink state | Fix selection change listener to properly detect link nodes |

### Tier 3: UX Cleanup (2 Warning issues)
| Issue | Component | Fix Strategy |
|-------|-----------|-------------|
| #11 | lexical-editor.tsx - Fullscreen undo history | Document as known limitation OR accept tradeoff |
| #12 | ActionsPlugin - Inappropriate buttons | Create email-compose-specific action buttons |

### Tier 4: Minor/Deferred
| Issue | Component | Fix Strategy |
|-------|-----------|-------------|
| #7 | Image dialog session error | Defer - likely auth issue |
| #10 | ShortcutsPlugin - Ctrl+Alt+M silent failure | Remove comment shortcut handler |

## Key Files to Modify
1. `apps/todox/src/components/editor/plugins/ToolbarPlugin/index.tsx` - Issues #1, #2
2. `apps/todox/src/components/editor/plugins/ComponentPickerPlugin/index.tsx` - Issue #9
3. `apps/todox/src/components/editor/plugins/ActionsPlugin/index.tsx` - Issues #8, #12
4. `apps/todox/src/components/editor/plugins/ShortcutsPlugin/index.tsx` - Issues #1, #3, #10
5. `apps/todox/src/components/editor/plugins/FloatingLinkEditorPlugin/index.tsx` - Issues #4, #5
6. `apps/todox/src/components/editor/plugins/ToolbarPlugin/utils.ts` - Issue #1

## Architecture Constraint
- Only modify files in `apps/todox/src/components/editor/` and its consumers
- Do NOT add new features - only fix broken behavior
- Prefer removing/hiding over adding node registrations
- Follow all Effect patterns from `.claude/rules/effect-patterns.md`

## Verification Commands
```bash
bun run lint:fix --filter @beep/todox
bun run check --filter @beep/todox
```

## Node Registration Reference
EMAIL_COMPOSE_NODES (10 nodes): HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, HorizontalRuleNode, ImageNode, MentionNode, EmojiNode
