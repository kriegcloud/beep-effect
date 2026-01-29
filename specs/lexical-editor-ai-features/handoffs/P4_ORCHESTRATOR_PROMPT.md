# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing **Phase 4: Editor Integration** of the lexical-editor-ai-features spec.

### Context

Phases 1-3 completed. The following infrastructure is available:
- `PreserveSelectionPlugin` with SAVE/RESTORE commands
- AI types, commands, errors
- `AiContext` provider with full state management
- `useAiStreaming` hook for consuming AI streams
- 5 UI components: `FloatingAiPanel`, `AiCommandMenu`, `StreamingPreview`, `InsertionModeSelector`, main plugin `index.tsx`

**Current gap**: The Insert button in FloatingAiPanel just logs content - no actual editor insertion.

### Your Mission

Implement text insertion into Lexical editor:

| File | Action | Purpose |
|------|--------|---------|
| `utils/insertAiText.ts` | CREATE | Utility with `$insertAiText(selection, content, mode)` |
| `index.tsx` | MODIFY | Add `INSERT_AI_TEXT_COMMAND` and `KEY_ESCAPE_COMMAND` handlers |
| `components/FloatingAiPanel.tsx` | MODIFY | Wire `handleInsert` to dispatch `INSERT_AI_TEXT_COMMAND` |

### Import Paths

```typescript
// Available from Phase 1-3
import type { InsertionMode } from "../types";
import {
  INSERT_AI_TEXT_COMMAND,
  type InsertAiTextPayload
} from "../commands";
import {
  RESTORE_SELECTION_COMMAND
} from "../../PreserveSelectionPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// Lexical APIs needed
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  KEY_ESCAPE_COMMAND,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  type RangeSelection,
} from "lexical";
```

### Insertion Mode Logic

```typescript
// utils/insertAiText.ts
export function $insertAiText(
  selection: RangeSelection,
  content: string,
  mode: InsertionMode
): void {
  switch (mode) {
    case "replace":
      selection.insertText(content);
      break;

    case "inline":
      selection.collapse(false); // Collapse to end
      selection.insertText(" " + content);
      break;

    case "below":
      const paragraphNode = $createParagraphNode();
      const textNode = $createTextNode(content);
      paragraphNode.append(textNode);
      const topLevelElement = selection.anchor.getNode().getTopLevelElementOrThrow();
      topLevelElement.insertAfter(paragraphNode);
      break;
  }
}
```

### Command Handler Pattern

```typescript
// In index.tsx useEffect
const unregisterInsert = editor.registerCommand(
  INSERT_AI_TEXT_COMMAND,
  (payload: InsertAiTextPayload) => {
    // 1. Restore saved selection
    editor.dispatchCommand(RESTORE_SELECTION_COMMAND, null);

    // 2. Perform insertion in editor.update()
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
```

### FloatingAiPanel Modification

```typescript
// Add editor access
const [editor] = useLexicalComposerContext();

// Update handleInsert
const handleInsert = () => {
  if (!streamedContent) return;

  editor.dispatchCommand(INSERT_AI_TEXT_COMMAND, {
    content: streamedContent,
    mode: insertionMode,
  });

  setAiPanelOpen(false);
  reset();
};
```

### Delegation Rules

You MUST delegate code writing to `effect-code-writer` agent. You coordinate and verify, you do NOT write source code directly.

### Reference Files

- Full context: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P4.md`
- Current plugin: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/index.tsx`
- Current panel: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/FloatingAiPanel.tsx`
- Commands: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/commands.ts`

### Base Path

All file paths relative to: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/`

### Verification

After each change:
```bash
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] `utils/insertAiText.ts` handles all 3 insertion modes
- [ ] `INSERT_AI_TEXT_COMMAND` handler registered in index.tsx
- [ ] Selection restored via RESTORE_SELECTION_COMMAND before insertion
- [ ] `handleInsert` in FloatingAiPanel dispatches command
- [ ] ESC key closes panel when open
- [ ] (Bonus) Cmd/Ctrl+Shift+I opens panel
- [ ] TypeScript compiles without errors
- [ ] REFLECTION_LOG.md updated with Phase 4 learnings
- [ ] `handoffs/HANDOFF_P5.md` created
- [ ] `handoffs/P5_ORCHESTRATOR_PROMPT.md` created

### Manual Testing After Implementation

1. Select text in editor
2. Trigger AI panel (via command or keyboard)
3. Select a prompt, wait for streaming to complete
4. Toggle between insertion modes
5. Click Insert
6. Verify text inserted correctly based on mode:
   - Replace: Selected text replaced
   - Inline: AI text appended after selection
   - Below: New paragraph created below

### Handoff Document

Read full context in: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P4.md`
