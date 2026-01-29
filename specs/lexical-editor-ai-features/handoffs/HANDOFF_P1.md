# Phase 1 Handoff: Infrastructure

> Core dependencies, plugin scaffolding, and command definitions.

---

## Previous Phase Summary

**Phase 0 (Research)** completed parallel research across 4 domains:
- Source AI features analysis
- Target Lexical editor analysis
- AI SDK 6 patterns research
- Liveblocks AI integration research

Synthesis report created at `outputs/05-synthesis-report.md` with complete implementation plan.

---

## Phase 1 Objectives

### Goal

Establish foundational infrastructure for AI assistant plugin system.

### Tasks

| ID | Task | Agent | Priority |
|----|------|-------|----------|
| 1.1 | Create PreserveSelectionPlugin with co-located commands | `effect-code-writer` | Critical |
| 1.2 | Define AI command types and InsertionMode | `effect-code-writer` | Critical |
| 1.3 | Create AiError tagged error classes with codes | `effect-code-writer` | Critical |
| 1.4 | Create AiContext provider with full state | `effect-code-writer` | High |
| 1.5 | Register PreserveSelectionPlugin in Editor.tsx | `effect-code-writer` | High |

---

## Dependencies Status

**All required packages are already installed** in `apps/todox/package.json`:
- `ai` - AI SDK core
- `@ai-sdk/openai` - OpenAI provider
- `@ai-sdk/react` - React hooks
- `cmdk` - Command menu
- `@liveblocks/*` - Collaboration

No installation tasks required.

---

## Files to Create

### 1. `plugins/PreserveSelectionPlugin/index.tsx`

Purpose: Save and restore editor selection across AI panel interactions.

**Critical**: Co-locate SAVE/RESTORE commands here to avoid circular dependencies.

```typescript
"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $setSelection,
  $isRangeSelection,
  createCommand,
  COMMAND_PRIORITY_LOW,
  type LexicalCommand,
  type RangeSelection,
} from "lexical";
import { useEffect, useRef } from "react";

// Co-located commands - avoids circular dependency with commands.ts
export const SAVE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("SAVE_SELECTION");
export const RESTORE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("RESTORE_SELECTION");

export function PreserveSelectionPlugin() {
  const [editor] = useLexicalComposerContext();
  const savedSelection = useRef<RangeSelection | null>(null);

  useEffect(() => {
    const saveSelection = () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Clone to preserve state even if original selection changes
        savedSelection.current = selection.clone();
      }
      return true;
    };

    const restoreSelection = () => {
      if (savedSelection.current) {
        $setSelection(savedSelection.current.clone());
      }
      return true;
    };

    const unregisterSave = editor.registerCommand(
      SAVE_SELECTION_COMMAND,
      saveSelection,
      COMMAND_PRIORITY_LOW
    );

    const unregisterRestore = editor.registerCommand(
      RESTORE_SELECTION_COMMAND,
      restoreSelection,
      COMMAND_PRIORITY_LOW
    );

    return () => {
      unregisterSave();
      unregisterRestore();
    };
  }, [editor]);

  return null;
}
```

**Key decisions**:
- Use `selection.clone()` on both save AND restore for safety
- Commands co-located to avoid circular imports
- Manual cleanup instead of `mergeRegister` for clarity

### 2. `plugins/AiAssistantPlugin/types.ts`

Purpose: Shared types for AI operations.

```typescript
/**
 * Content insertion modes for AI-generated text
 */
export type InsertionMode = "replace" | "inline" | "below";

/**
 * AI operation state
 */
export type AiOperationState = "idle" | "streaming" | "complete" | "error";
```

### 3. `plugins/AiAssistantPlugin/commands.ts`

Purpose: AI-specific Lexical commands (NOT selection commands).

```typescript
import { createCommand, type LexicalCommand } from "lexical";
import type { InsertionMode } from "./types";

/**
 * Payload for AI text insertion
 */
export interface InsertAiTextPayload {
  readonly content: string;
  readonly mode: InsertionMode;
}

/**
 * Open the floating AI panel
 */
export const OPEN_AI_PANEL_COMMAND: LexicalCommand<null> = createCommand("OPEN_AI_PANEL");

/**
 * Close the floating AI panel
 */
export const CLOSE_AI_PANEL_COMMAND: LexicalCommand<null> = createCommand("CLOSE_AI_PANEL");

/**
 * Insert AI-generated text with specified mode
 */
export const INSERT_AI_TEXT_COMMAND: LexicalCommand<InsertAiTextPayload> = createCommand("INSERT_AI_TEXT");

/**
 * Cancel ongoing AI operation
 */
export const CANCEL_AI_OPERATION_COMMAND: LexicalCommand<null> = createCommand("CANCEL_AI_OPERATION");
```

### 4. `plugins/AiAssistantPlugin/errors.ts`

Purpose: Effect-compliant error types with specific codes.

```typescript
import * as S from "effect/Schema";

/**
 * AI error codes for categorization
 */
export const AiErrorCode = {
  STREAM_ABORT: "STREAM_ABORT",
  SELECTION_INVALID: "SELECTION_INVALID",
  API_ERROR: "API_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

export type AiErrorCodeType = (typeof AiErrorCode)[keyof typeof AiErrorCode];

/**
 * General AI operation error
 */
export class AiError extends S.TaggedError<AiError>()("AiError", {
  message: S.String,
  code: S.optional(S.String),
}) {}

/**
 * AI streaming-specific error
 */
export class AiStreamError extends S.TaggedError<AiStreamError>()("AiStreamError", {
  message: S.String,
  code: S.optionalWith(S.String, { default: () => AiErrorCode.STREAM_ABORT }),
  cause: S.optional(S.Unknown),
}) {}

/**
 * Selection-related error (invalid or lost selection)
 */
export class AiSelectionError extends S.TaggedError<AiSelectionError>()("AiSelectionError", {
  message: S.String,
}) {}
```

### 5. `context/AiContext.tsx`

Purpose: React context for AI assistant state management.

```typescript
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { InsertionMode, AiOperationState } from "../plugins/AiAssistantPlugin/types";

interface AiContextValue {
  // Panel state
  readonly isAiPanelOpen: boolean;
  readonly setAiPanelOpen: (open: boolean) => void;

  // Selection state
  readonly selectedText: string;
  readonly setSelectedText: (text: string) => void;

  // Streaming state
  readonly operationState: AiOperationState;
  readonly setOperationState: (state: AiOperationState) => void;
  readonly streamedContent: string;
  readonly setStreamedContent: (content: string) => void;

  // Insertion mode
  readonly insertionMode: InsertionMode;
  readonly setInsertionMode: (mode: InsertionMode) => void;

  // Error state
  readonly error: string | null;
  readonly setError: (error: string | null) => void;

  // Reset all state
  readonly reset: () => void;
}

const AiContext = createContext<AiContextValue | null>(null);

export function AiContextProvider({ children }: { readonly children: ReactNode }) {
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [operationState, setOperationState] = useState<AiOperationState>("idle");
  const [streamedContent, setStreamedContent] = useState("");
  const [insertionMode, setInsertionMode] = useState<InsertionMode>("replace");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAiPanelOpen(false);
    setSelectedText("");
    setOperationState("idle");
    setStreamedContent("");
    setInsertionMode("replace");
    setError(null);
  }, []);

  const value = useMemo<AiContextValue>(
    () => ({
      isAiPanelOpen,
      setAiPanelOpen,
      selectedText,
      setSelectedText,
      operationState,
      setOperationState,
      streamedContent,
      setStreamedContent,
      insertionMode,
      setInsertionMode,
      error,
      setError,
      reset,
    }),
    [
      isAiPanelOpen,
      selectedText,
      operationState,
      streamedContent,
      insertionMode,
      error,
      reset,
    ]
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAiContext(): AiContextValue {
  const context = useContext(AiContext);
  if (context === null) {
    throw new Error("useAiContext must be used within AiContextProvider");
  }
  return context;
}
```

---

## Files to Modify

### `Editor.tsx`

Add PreserveSelectionPlugin after `DateTimePlugin` (line 169), before `CommentPlugin`:

```typescript
// Add import at top
import { PreserveSelectionPlugin } from "./plugins/PreserveSelectionPlugin";

// In the component, after DateTimePlugin (around line 169):
<DateTimePlugin />
<PreserveSelectionPlugin />  {/* NEW - Add here */}
{!(isCollab && useCollabV2) && (
  <CommentPlugin ... />
)}
```

**Note**: AiContextProvider registration happens in Phase 3 when we have UI components.

---

## Directory Structure After Phase 1

```
apps/todox/src/app/lexical/
├── plugins/
│   ├── AiAssistantPlugin/
│   │   ├── commands.ts          # NEW - AI commands only
│   │   ├── errors.ts            # NEW - Effect errors
│   │   └── types.ts             # NEW - Shared types
│   ├── PreserveSelectionPlugin/
│   │   └── index.tsx            # NEW - With co-located commands
│   └── ... (existing plugins)
├── context/
│   ├── AiContext.tsx            # NEW
│   └── SettingsContext.tsx      # Existing
└── Editor.tsx                   # MODIFIED
```

---

## Implementation Notes

### Command Architecture

Commands are split across two locations to avoid circular dependencies:

| Command | Location | Reason |
|---------|----------|--------|
| `SAVE_SELECTION_COMMAND` | `PreserveSelectionPlugin/index.tsx` | Used only by this plugin |
| `RESTORE_SELECTION_COMMAND` | `PreserveSelectionPlugin/index.tsx` | Used only by this plugin |
| `OPEN_AI_PANEL_COMMAND` | `AiAssistantPlugin/commands.ts` | Used by multiple components |
| `CLOSE_AI_PANEL_COMMAND` | `AiAssistantPlugin/commands.ts` | Used by multiple components |
| `INSERT_AI_TEXT_COMMAND` | `AiAssistantPlugin/commands.ts` | Used by multiple components |

### Selection Cloning

We use `selection.clone()` on BOTH save and restore:
- **Save**: Clone captures state at save time
- **Restore**: Clone again because restored selection might be modified

### Error Codes

Use `AiErrorCode` constants for consistent error categorization:

```typescript
import { AiError, AiErrorCode } from "./errors";

// Usage
new AiError({
  message: "API request failed",
  code: AiErrorCode.API_ERROR
});
```

---

## Verification Commands

After each task, run:

```bash
# Type check
bun run check --filter @beep/todox

# If upstream errors exist, isolate with:
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/commands.ts
bun tsc --noEmit apps/todox/src/app/lexical/plugins/PreserveSelectionPlugin/index.tsx
```

---

## Success Criteria

- [ ] `plugins/PreserveSelectionPlugin/index.tsx` created with co-located commands
- [ ] `plugins/AiAssistantPlugin/types.ts` created with InsertionMode
- [ ] `plugins/AiAssistantPlugin/commands.ts` created (AI commands only)
- [ ] `plugins/AiAssistantPlugin/errors.ts` created with error codes
- [ ] `context/AiContext.tsx` created with full state interface
- [ ] `Editor.tsx` modified to register PreserveSelectionPlugin
- [ ] All files compile without TypeScript errors
- [ ] Selection save/restore works (manual test in browser)

---

## Manual Testing

After implementation, verify in browser:

1. Open the Lexical editor
2. Select some text
3. Open browser console
4. Run: `lexicalEditor.dispatchCommand(SAVE_SELECTION_COMMAND, null)`
5. Click outside editor (selection clears visually)
6. Run: `lexicalEditor.dispatchCommand(RESTORE_SELECTION_COMMAND, null)`
7. Verify selection is restored

---

## Blocking Issues

None identified. This phase has no external dependencies beyond existing Lexical infrastructure.

---

## Next Phase Preview

**Phase 2: Server Integration** will:
- Update `app/api/chat/route.ts` with modern AI SDK 6 patterns
- Create `actions/ai.ts` server action for RSC streaming
- Create prompt templates in `prompts.ts`
- Create `useAiStreaming` hook for client consumption

Phase 2 depends on Phase 1's types and error definitions being available.
