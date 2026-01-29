# Phase 5 Handoff: Toolbar Integration

> Add AI button to editor toolbar with prompt shortcuts and progress indicator.

---

## Previous Phase Summary

**Phase 4 (Editor Integration)** completed:
- `utils/insertAiText.ts` - Utility for 3 insertion modes (replace/inline/below)
- `INSERT_AI_TEXT_COMMAND` handler in index.tsx with selection restoration
- `KEY_ESCAPE_COMMAND` handler to close panel
- Keyboard shortcut `Cmd/Ctrl+Shift+I` to open panel
- `handleInsert` in FloatingAiPanel wired to dispatch command

**Available from Phase 1-4:**
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

// Insertion Utility
import { $insertAiText } from "./utils/insertAiText";
```

---

## Phase 5 Objectives

### Goal

Add AI functionality to the existing editor toolbar: button to open AI panel, dropdown menu with prompt shortcuts, and visual indicator when AI operation is in progress.

### Tasks

| ID | Task | Agent | Priority |
|----|------|-------|----------|
| 5.1 | Create `AiToolbarButton` component | `effect-code-writer` | Critical |
| 5.2 | Create `AiPromptDropdown` menu component | `effect-code-writer` | High |
| 5.3 | Integrate AiToolbarButton into ToolbarPlugin | `effect-code-writer` | High |
| 5.4 | Add loading indicator during AI operations | `effect-code-writer` | Medium |
| 5.5 | Style integration with existing toolbar | `effect-code-writer` | Medium |

---

## Files to Create/Modify

### 1. Create `plugins/AiAssistantPlugin/components/AiToolbarButton.tsx`

**Purpose**: Toolbar button that opens AI panel and shows operation status.

Key requirements:
- Button with sparkle/AI icon (use lucide-react)
- Dropdown menu showing top 5-7 prompts for quick access
- Loading spinner when operationState is "streaming"
- Disabled state when no text is selected
- Tooltip showing keyboard shortcut (Cmd/Ctrl+Shift+I)

### 2. Modify `plugins/ToolbarPlugin/index.tsx`

**Purpose**: Add AiToolbarButton to toolbar.

Key requirements:
- Import and render AiToolbarButton
- Position it appropriately (suggest: after existing text formatting buttons)
- Ensure it's wrapped in AiProvider if not already in component tree

---

## Component Structure

```typescript
// AiToolbarButton.tsx
"use client";

import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useAiContext } from "../../../context/AiContext";
import { OPEN_AI_PANEL_COMMAND } from "../commands";
import { PREDEFINED_PROMPTS } from "../prompts";

interface AiToolbarButtonProps {
  disabled?: boolean;
}

export function AiToolbarButton({ disabled }: AiToolbarButtonProps) {
  const [editor] = useLexicalComposerContext();
  const { operationState } = useAiContext();

  const isLoading = operationState === "streaming";

  const handleOpenPanel = () => {
    editor.dispatchCommand(OPEN_AI_PANEL_COMMAND, null);
  };

  // Quick prompt shortcuts (top 5)
  const quickPrompts = PREDEFINED_PROMPTS.slice(0, 5);

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled || isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="sr-only">AI Assistant</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Assistant (Cmd+Shift+I)</p>
        </TooltipContent>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleOpenPanel}>
            <Sparkles className="h-4 w-4 mr-2" />
            Open AI Panel...
          </DropdownMenuItem>
          <div className="border-t my-1" />
          {quickPrompts.map((prompt) => (
            <DropdownMenuItem
              key={prompt.id}
              onClick={() => {
                // TODO: Directly trigger prompt without opening full panel
                handleOpenPanel();
              }}
            >
              {prompt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}
```

---

## Integration with ToolbarPlugin

The existing ToolbarPlugin is at `plugins/ToolbarPlugin/index.tsx`.

Find an appropriate location to add the AI button (typically near text formatting or at the end of the toolbar).

```typescript
// In ToolbarPlugin/index.tsx

import { AiToolbarButton } from "../AiAssistantPlugin/components/AiToolbarButton";

// In the render, after other toolbar buttons:
<AiToolbarButton disabled={!canUseAi} />
```

---

## Verification Commands

```bash
# Full type check
bun run check --filter @beep/todox

# Verify specific files
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiToolbarButton.tsx
```

---

## Success Criteria

- [ ] `AiToolbarButton` renders in toolbar
- [ ] Dropdown shows 5+ quick prompts
- [ ] Loading spinner appears during streaming
- [ ] Keyboard shortcut tooltip is visible
- [ ] Button disabled when no selection (if implemented)
- [ ] TypeScript compiles without errors
- [ ] Styling matches existing toolbar buttons

---

## Potential Challenges

1. **Context availability**: AiToolbarButton needs AiContext, ensure Provider wraps ToolbarPlugin
2. **Selection tracking**: Button should ideally be disabled when no text is selected - requires selection state tracking
3. **Existing toolbar structure**: ToolbarPlugin may have complex structure; find appropriate insertion point

---

## Next Phase Preview

**Phase 6: Collaboration Awareness** will:
- Add Liveblocks presence indicators during AI operations
- Show "User is generating with AI" status to collaborators
- Handle conflict resolution when multiple users use AI simultaneously
- Add collaborative undo/redo support for AI insertions
