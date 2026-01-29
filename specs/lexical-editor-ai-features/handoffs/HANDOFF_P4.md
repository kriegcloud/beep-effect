# Phase 4 Handoff: Editor Integration

> Implement text insertion into Lexical editor with all three insertion modes.

---

## Previous Phase Summary

**Phase 3 (UI Components)** completed:
- `components/FloatingAiPanel.tsx` - Main panel with state machine rendering
- `components/AiCommandMenu.tsx` - Prompt selection via shadcn Command
- `components/StreamingPreview.tsx` - Live streaming preview with auto-scroll
- `components/InsertionModeSelector.tsx` - Replace/Inline/Below toggle
- `index.tsx` - Plugin entry with OPEN/CLOSE command handlers

**Available from Phase 1-3:**
```typescript
// Types
import type { InsertionMode, AiOperationState } from "./types";

// Errors
import { AiError, AiStreamError, AiSelectionError } from "./errors";

// Commands
import {
  OPEN_AI_PANEL_COMMAND,
  CLOSE_AI_PANEL_COMMAND,
  INSERT_AI_TEXT_COMMAND,
  CANCEL_AI_OPERATION_COMMAND,
  type InsertAiTextPayload
} from "./commands";

// Context
import { useAiContext } from "../../context/AiContext";

// Prompts
import { PREDEFINED_PROMPTS, getPromptById, type AiPromptTemplate } from "./prompts";

// Streaming Hook
import { useAiStreaming } from "./hooks/useAiStreaming";

// Selection
import {
  SAVE_SELECTION_COMMAND,
  RESTORE_SELECTION_COMMAND
} from "../PreserveSelectionPlugin";

// UI Components
import { FloatingAiPanel } from "./components/FloatingAiPanel";
```

---

## Phase 4 Objectives

### Goal

Implement the `INSERT_AI_TEXT_COMMAND` handler that inserts AI-generated content into the Lexical editor based on the selected insertion mode (replace, inline, below).

### Tasks

| ID | Task | Agent | Priority |
|----|------|-------|----------|
| 4.1 | Create `insertAiText.ts` utility with insertion logic | `effect-code-writer` | Critical |
| 4.2 | Register `INSERT_AI_TEXT_COMMAND` handler in plugin | `effect-code-writer` | Critical |
| 4.3 | Wire `handleInsert` in FloatingAiPanel to dispatch command | `effect-code-writer` | High |
| 4.4 | Add keyboard shortcut (Cmd/Ctrl+Shift+I) for opening panel | `effect-code-writer` | Medium |
| 4.5 | Add ESC key handler to close panel | `effect-code-writer` | Medium |

---

## Files to Create/Modify

### 1. Create `plugins/AiAssistantPlugin/utils/insertAiText.ts`

**Purpose**: Encapsulate all three insertion modes in a reusable utility.

```typescript
import type { LexicalEditor, RangeSelection } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import type { InsertionMode } from "../types";

/**
 * Insert AI-generated text based on insertion mode
 *
 * @param editor - Lexical editor instance
 * @param content - AI-generated content to insert
 * @param mode - Insertion mode (replace/inline/below)
 */
export function $insertAiText(
  selection: RangeSelection,
  content: string,
  mode: InsertionMode
): void {
  switch (mode) {
    case "replace":
      // Replace selected text with AI content
      selection.insertText(content);
      break;

    case "inline":
      // Move cursor to end of selection, then insert
      selection.focus.offset = selection.focus.offset;
      selection.collapse(false); // Collapse to end
      selection.insertText(" " + content); // Insert with space separator
      break;

    case "below":
      // Insert content in a new paragraph below selection
      const paragraphNode = $createParagraphNode();
      const textNode = $createTextNode(content);
      paragraphNode.append(textNode);

      // Find the block parent and insert after it
      const anchorNode = selection.anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElementOrThrow();
      topLevelElement.insertAfter(paragraphNode);
      break;
  }
}
```

### 2. Modify `plugins/AiAssistantPlugin/index.tsx`

**Add INSERT_AI_TEXT_COMMAND handler:**

```typescript
import { INSERT_AI_TEXT_COMMAND, type InsertAiTextPayload } from "./commands";
import { RESTORE_SELECTION_COMMAND } from "../PreserveSelectionPlugin";
import { $insertAiText } from "./utils/insertAiText";
import { $getSelection, $isRangeSelection, KEY_ESCAPE_COMMAND } from "lexical";

// Inside useEffect:

// Register INSERT command handler
const unregisterInsert = editor.registerCommand(
  INSERT_AI_TEXT_COMMAND,
  (payload: InsertAiTextPayload) => {
    // First restore the saved selection
    editor.dispatchCommand(RESTORE_SELECTION_COMMAND, null);

    // Then perform the insertion in an update
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $insertAiText(selection, payload.content, payload.mode);
      }
    });

    return true;
  },
  COMMAND_PRIORITY_HIGH
);

// Register ESC to close panel
const unregisterEsc = editor.registerCommand(
  KEY_ESCAPE_COMMAND,
  () => {
    if (isAiPanelOpen) {
      setAiPanelOpen(false);
      return true;
    }
    return false;
  },
  COMMAND_PRIORITY_HIGH
);

// Add to cleanup
return () => {
  unregisterOpen();
  unregisterClose();
  unregisterInsert();
  unregisterEsc();
};
```

### 3. Modify `components/FloatingAiPanel.tsx`

**Wire handleInsert to dispatch INSERT_AI_TEXT_COMMAND:**

```typescript
import { INSERT_AI_TEXT_COMMAND } from "../commands";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// Add at component top:
const [editor] = useLexicalComposerContext();

// Update handleInsert:
const handleInsert = () => {
  if (!streamedContent) return;

  editor.dispatchCommand(INSERT_AI_TEXT_COMMAND, {
    content: streamedContent,
    mode: insertionMode,
  });

  setAiPanelOpen(false);
  reset(); // Reset streaming hook state
};
```

### 4. Add Keyboard Shortcut Plugin (Optional Enhancement)

**Purpose**: Open AI panel with Cmd/Ctrl+Shift+I

```typescript
// In index.tsx or separate file
import { KEY_DOWN_COMMAND } from "lexical";

const unregisterShortcut = editor.registerCommand(
  KEY_DOWN_COMMAND,
  (event: KeyboardEvent) => {
    // Cmd/Ctrl + Shift + I
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'i') {
      event.preventDefault();
      editor.dispatchCommand(OPEN_AI_PANEL_COMMAND, null);
      return true;
    }
    return false;
  },
  COMMAND_PRIORITY_LOW
);
```

---

## Directory Structure After Phase 4

```
apps/todox/src/app/lexical/
├── context/
│   └── AiContext.tsx           # FROM PHASE 1
└── plugins/
    ├── AiAssistantPlugin/
    │   ├── commands.ts          # FROM PHASE 1
    │   ├── errors.ts            # FROM PHASE 1
    │   ├── types.ts             # FROM PHASE 1
    │   ├── prompts.ts           # FROM PHASE 2
    │   ├── hooks/
    │   │   └── useAiStreaming.ts # FROM PHASE 2
    │   ├── components/           # FROM PHASE 3
    │   │   ├── FloatingAiPanel.tsx  # MODIFIED
    │   │   ├── AiCommandMenu.tsx
    │   │   ├── StreamingPreview.tsx
    │   │   └── InsertionModeSelector.tsx
    │   ├── utils/                # NEW
    │   │   └── insertAiText.ts
    │   └── index.tsx             # MODIFIED
    └── PreserveSelectionPlugin/
        └── index.tsx            # FROM PHASE 1
```

---

## Insertion Mode Behaviors

| Mode | Behavior | Example |
|------|----------|---------|
| `replace` | Deletes selected text, inserts AI content in its place | "Hello world" → "Hi universe" |
| `inline` | Collapses selection to end, appends AI content with space | "Hello world|" → "Hello world Hi there" |
| `below` | Inserts AI content in a new paragraph below the selection's block | Selection in P1 → New P2 with AI content |

---

## Selection Restoration Flow

```
1. User selects text
2. User triggers OPEN_AI_PANEL_COMMAND
3. Plugin dispatches SAVE_SELECTION_COMMAND (selection cloned to ref)
4. User interacts with AI panel (focus moves away from editor)
5. User clicks Insert
6. Plugin dispatches INSERT_AI_TEXT_COMMAND
7. Handler dispatches RESTORE_SELECTION_COMMAND (ref cloned back to editor)
8. Handler calls $insertAiText with restored selection
9. Content inserted based on mode
```

---

## Verification Commands

```bash
# Full type check
bun run check --filter @beep/todox

# Verify specific files
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/utils/insertAiText.ts
```

---

## Success Criteria

- [ ] `$insertAiText` utility handles all 3 insertion modes correctly
- [ ] INSERT_AI_TEXT_COMMAND registered and functional
- [ ] Selection properly restored before insertion
- [ ] FloatingAiPanel Insert button dispatches command
- [ ] ESC key closes panel when open
- [ ] (Optional) Cmd/Ctrl+Shift+I opens panel
- [ ] TypeScript compiles without errors
- [ ] Manual testing: all 3 modes work as expected

---

## Testing Scenarios

1. **Replace mode**: Select "Hello world", generate AI text, click Insert → selected text replaced
2. **Inline mode**: Select "Hello world", generate AI text, click Insert → AI text appended after selection
3. **Below mode**: Select any text, generate AI text, click Insert → new paragraph created below
4. **Selection loss**: Open panel, click around the page, then click Insert → still works (selection restored)
5. **ESC dismissal**: Open panel, press ESC → panel closes
6. **Keyboard shortcut**: Press Cmd+Shift+I with selection → panel opens

---

## Potential Edge Cases

- Empty selection (cursor only) - should still work for inline/below modes
- Selection spanning multiple paragraphs - replace mode should work
- Selection inside code block/list - insertion should preserve formatting
- Very long AI content - should not break editor

---

## Next Phase Preview

**Phase 5: Toolbar Integration** will:
- Add AI button to editor toolbar
- Create toolbar dropdown with prompt shortcuts
- Add visual indicator when AI operation is in progress
- Integrate with existing toolbar styling
