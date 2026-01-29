# Phase 3 Handoff: UI Components

> Floating AI panel with command menu, streaming preview, and insertion mode controls.

---

## Previous Phase Summary

**Phase 2 (Server Integration)** completed:
- ✅ `actions/ai.ts` - RSC streaming server action using AI SDK 6
- ✅ `plugins/AiAssistantPlugin/prompts.ts` - 10 predefined prompt templates
- ✅ `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` - Client streaming hook
- ✅ `@ai-sdk/rsc` package added to project

**Available from Phase 1 & 2:**
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
  CANCEL_AI_OPERATION_COMMAND
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
```

---

## Phase 3 Objectives

### Goal

Create the visual UI for AI interaction: floating panel, command palette for prompt selection, streaming preview, and insertion mode controls.

### Tasks

| ID | Task | Agent | Priority |
|----|------|-------|----------|
| 3.1 | Create `FloatingAiPanel` component | `effect-code-writer` | Critical |
| 3.2 | Create `AiCommandMenu` with cmdk | `effect-code-writer` | Critical |
| 3.3 | Create `StreamingPreview` component | `effect-code-writer` | High |
| 3.4 | Create `InsertionModeSelector` component | `effect-code-writer` | High |
| 3.5 | Create `AiAssistantPlugin` main component | `effect-code-writer` | High |

---

## Files to Create

### 1. `plugins/AiAssistantPlugin/components/FloatingAiPanel.tsx`

**Purpose**: Floating container for AI UI, positioned near selection.

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";
import { useAiContext } from "../../../context/AiContext";
import { AiCommandMenu } from "./AiCommandMenu";
import { StreamingPreview } from "./StreamingPreview";
import { InsertionModeSelector } from "./InsertionModeSelector";
import { useAiStreaming } from "../hooks/useAiStreaming";

interface FloatingAiPanelProps {
  anchorElem?: HTMLElement;
}

export function FloatingAiPanel({ anchorElem = document.body }: FloatingAiPanelProps) {
  const [editor] = useLexicalComposerContext();
  const {
    isPanelOpen,
    selectedText,
    insertionMode,
    setInsertionMode,
    setIsPanelOpen,
  } = useAiContext();

  const {
    streamedContent,
    operationState,
    streamResponse,
    abort,
    reset,
  } = useAiStreaming();

  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Position panel near selection
  useEffect(() => {
    if (!isPanelOpen) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  }, [isPanelOpen, selectedText]);

  const handlePromptSelect = async (promptId: string, instruction: string) => {
    if (!selectedText) return;
    await streamResponse(selectedText, instruction);
  };

  const handleInsert = () => {
    // Will be implemented in Phase 4
    console.log("Insert:", streamedContent, "mode:", insertionMode);
    setIsPanelOpen(false);
    reset();
  };

  const handleCancel = () => {
    abort();
    setIsPanelOpen(false);
    reset();
  };

  if (!isPanelOpen) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="floating-ai-panel"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 100,
      }}
    >
      {operationState === "idle" && (
        <AiCommandMenu onSelect={handlePromptSelect} />
      )}

      {(operationState === "streaming" || operationState === "complete") && (
        <>
          <StreamingPreview
            content={streamedContent}
            isStreaming={operationState === "streaming"}
          />
          <InsertionModeSelector
            mode={insertionMode}
            onModeChange={setInsertionMode}
          />
          <div className="ai-panel-actions">
            {operationState === "complete" && (
              <button onClick={handleInsert}>Insert</button>
            )}
            <button onClick={handleCancel}>
              {operationState === "streaming" ? "Stop" : "Cancel"}
            </button>
          </div>
        </>
      )}

      {operationState === "error" && (
        <div className="ai-error">
          An error occurred. <button onClick={reset}>Try again</button>
        </div>
      )}
    </div>,
    anchorElem
  );
}
```

### 2. `plugins/AiAssistantPlugin/components/AiCommandMenu.tsx`

**Purpose**: Command palette for prompt selection using shadcn/ui.

```typescript
"use client";

import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PREDEFINED_PROMPTS, type AiPromptTemplate } from "../prompts";

interface AiCommandMenuProps {
  onSelect: (promptId: string, instruction: string) => void;
}

export function AiCommandMenu({ onSelect }: AiCommandMenuProps) {
  const [search, setSearch] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const handlePromptSelect = (prompt: AiPromptTemplate) => {
    // Use predefined prompt template
    onSelect(prompt.id, prompt.systemPrompt);
  };

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      onSelect("custom", customPrompt);
    }
  };

  return (
    <Command className="ai-command-menu rounded-lg border shadow-md">
      <CommandInput
        placeholder="Search prompts or type custom..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="p-2">
            <p className="text-sm text-muted-foreground mb-2">
              No matching prompts. Use custom instruction:
            </p>
            <input
              type="text"
              placeholder="Type your instruction..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-2 border rounded"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCustomSubmit();
              }}
            />
          </div>
        </CommandEmpty>
        <CommandGroup heading="AI Actions">
          {PREDEFINED_PROMPTS.map((prompt) => (
            <CommandItem
              key={prompt.id}
              value={prompt.label}
              onSelect={() => handlePromptSelect(prompt)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{prompt.label}</span>
                <span className="text-xs text-muted-foreground">
                  {prompt.description}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
```

### 3. `plugins/AiAssistantPlugin/components/StreamingPreview.tsx`

**Purpose**: Live preview of AI-generated content.

```typescript
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StreamingPreviewProps {
  content: string;
  isStreaming: boolean;
}

export function StreamingPreview({ content, isStreaming }: StreamingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as content streams
  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  return (
    <div className="streaming-preview">
      <div className="preview-header">
        <span className="text-sm font-medium">AI Response</span>
        {isStreaming && (
          <span className="streaming-indicator">
            <span className="animate-pulse">●</span> Generating...
          </span>
        )}
      </div>
      <div
        ref={containerRef}
        className={cn(
          "preview-content",
          "p-3 rounded border bg-muted/50",
          "max-h-64 overflow-y-auto",
          "whitespace-pre-wrap font-mono text-sm"
        )}
      >
        {content || (
          <span className="text-muted-foreground italic">
            Waiting for response...
          </span>
        )}
      </div>
    </div>
  );
}
```

### 4. `plugins/AiAssistantPlugin/components/InsertionModeSelector.tsx`

**Purpose**: Radio/button group for selecting insertion mode.

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { InsertionMode } from "../types";

interface InsertionModeSelectorProps {
  mode: InsertionMode;
  onModeChange: (mode: InsertionMode) => void;
}

const INSERTION_MODES: Array<{
  value: InsertionMode;
  label: string;
  description: string;
}> = [
  {
    value: "replace",
    label: "Replace",
    description: "Replace selected text",
  },
  {
    value: "inline",
    label: "Inline",
    description: "Insert after selection",
  },
  {
    value: "below",
    label: "Below",
    description: "Insert in new paragraph",
  },
];

export function InsertionModeSelector({
  mode,
  onModeChange,
}: InsertionModeSelectorProps) {
  return (
    <div className="insertion-mode-selector">
      <span className="text-xs font-medium text-muted-foreground mb-2 block">
        Insert mode:
      </span>
      <div className="flex gap-1">
        {INSERTION_MODES.map((option) => (
          <button
            key={option.value}
            onClick={() => onModeChange(option.value)}
            className={cn(
              "px-3 py-1 text-sm rounded border transition-colors",
              mode === option.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted"
            )}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 5. `plugins/AiAssistantPlugin/index.tsx`

**Purpose**: Main plugin entry point that orchestrates all AI functionality.

```typescript
"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_HIGH } from "lexical";
import { useAiContext } from "../../context/AiContext";
import { FloatingAiPanel } from "./components/FloatingAiPanel";
import {
  OPEN_AI_PANEL_COMMAND,
  CLOSE_AI_PANEL_COMMAND,
} from "./commands";
import {
  SAVE_SELECTION_COMMAND,
} from "../PreserveSelectionPlugin";

interface AiAssistantPluginProps {
  anchorElem?: HTMLElement;
}

export function AiAssistantPlugin({
  anchorElem = document.body,
}: AiAssistantPluginProps) {
  const [editor] = useLexicalComposerContext();
  const { setIsPanelOpen, setSelectedText } = useAiContext();

  useEffect(() => {
    // Handle OPEN_AI_PANEL_COMMAND
    const unregisterOpen = editor.registerCommand(
      OPEN_AI_PANEL_COMMAND,
      () => {
        // Save selection before opening panel
        editor.dispatchCommand(SAVE_SELECTION_COMMAND, undefined);

        // Get selected text
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const text = selection.getTextContent();
            setSelectedText(text);
          }
        });

        setIsPanelOpen(true);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Handle CLOSE_AI_PANEL_COMMAND
    const unregisterClose = editor.registerCommand(
      CLOSE_AI_PANEL_COMMAND,
      () => {
        setIsPanelOpen(false);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      unregisterOpen();
      unregisterClose();
    };
  }, [editor, setIsPanelOpen, setSelectedText]);

  return <FloatingAiPanel anchorElem={anchorElem} />;
}
```

---

## Directory Structure After Phase 3

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
    │   ├── components/           # NEW
    │   │   ├── FloatingAiPanel.tsx
    │   │   ├── AiCommandMenu.tsx
    │   │   ├── StreamingPreview.tsx
    │   │   └── InsertionModeSelector.tsx
    │   └── index.tsx             # NEW
    └── PreserveSelectionPlugin/
        └── index.tsx            # FROM PHASE 1
```

---

## UI Component Requirements

### FloatingAiPanel
- Positioned near text selection (below and slightly offset)
- Uses React portal for proper z-index management
- Shows different views based on `operationState`:
  - `idle`: Show command menu
  - `streaming`: Show preview + stop button
  - `complete`: Show preview + insert/cancel buttons
  - `error`: Show error message + retry

### AiCommandMenu
- Uses shadcn/ui Command component (cmdk-based)
- Shows predefined prompts with labels and descriptions
- Supports custom prompt input when no match found
- Keyboard navigable (up/down arrows, enter to select)

### StreamingPreview
- Auto-scrolls to show latest content
- Visual indicator when streaming (pulsing dot)
- Monospace font for code/text consistency
- Max height with scroll for long responses

### InsertionModeSelector
- Three options: Replace, Inline, Below
- Visually indicates current selection
- Tooltips explain each mode

---

## Verification Commands

```bash
# Full type check
bun run check --filter @beep/todox

# Verify specific files
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/FloatingAiPanel.tsx
```

---

## Success Criteria

- [ ] `FloatingAiPanel` positions correctly near selection
- [ ] `AiCommandMenu` shows all 10 predefined prompts
- [ ] `StreamingPreview` auto-scrolls during streaming
- [ ] `InsertionModeSelector` toggles between 3 modes
- [ ] `AiAssistantPlugin` responds to OPEN/CLOSE commands
- [ ] All components use existing shadcn/ui primitives
- [ ] TypeScript compiles without errors
- [ ] CSS styling matches editor theme

---

## Blocking Issues

None expected. All dependencies available from Phase 1-2.

---

## Next Phase Preview

**Phase 4: Editor Integration** will:
- Implement `INSERT_AI_TEXT_COMMAND` handler
- Add text insertion for all 3 modes (replace/inline/below)
- Handle selection restoration after insertion
- Add keyboard shortcuts (e.g., Cmd+Shift+I to open panel)
