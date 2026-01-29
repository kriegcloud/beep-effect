# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing **Phase 3: UI Components** of the lexical-editor-ai-features spec.

### Context

Phase 1 (Infrastructure) and Phase 2 (Server Integration) completed. The following are now available:
- `PreserveSelectionPlugin` with SAVE/RESTORE commands
- AI types (`InsertionMode`, `AiOperationState`)
- AI commands (`OPEN_AI_PANEL_COMMAND`, `CLOSE_AI_PANEL_COMMAND`, etc.)
- AI errors (`AiError`, `AiStreamError`, `AiSelectionError`)
- `AiContext` provider with full state management
- `actions/ai.ts` RSC streaming server action
- `prompts.ts` with 10 predefined AI prompt templates
- `useAiStreaming` hook for consuming streams

**Dependencies confirmed**: shadcn/ui Command component available.

### Your Mission

Create 5 files:

| File | Purpose |
|------|---------|
| `components/FloatingAiPanel.tsx` | Floating container positioned near selection |
| `components/AiCommandMenu.tsx` | Command palette for prompt selection |AiAssistantPlugin
| `components/StreamingPreview.tsx` | Live preview of AI response |
| `components/InsertionModeSelector.tsx` | Replace/Inline/Below mode toggle |
| `index.tsx` | Main plugin entry point |

### Import Paths

```typescript
// Available from Phase 1-2
import type { InsertionMode, AiOperationState } from "../types";
import { OPEN_AI_PANEL_COMMAND, CLOSE_AI_PANEL_COMMAND } from "../commands";
import { SAVE_SELECTION_COMMAND } from "../../PreserveSelectionPlugin";
import { useAiContext } from "../../../context/AiContext";
import { useAiStreaming } from "../hooks/useAiStreaming";
import { PREDEFINED_PROMPTS, type AiPromptTemplate } from "../prompts";

// shadcn/ui (already in project)
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { cn } from "@/lib/utils";
```

### Component Architecture

```
AiAssistantPlugin (index.tsx)
├── Registers OPEN/CLOSE command handlers
└── Renders FloatingAiPanel
    ├── AiCommandMenu (when state = idle)
    └── [when streaming/complete]:
        ├── StreamingPreview
        ├── InsertionModeSelector
        └── Action buttons (Insert/Cancel/Stop)
```

### State Flow

1. User selects text and triggers `OPEN_AI_PANEL_COMMAND`
2. Plugin saves selection and opens FloatingAiPanel
3. User selects prompt from AiCommandMenu
4. Panel shows StreamingPreview with live content
5. On complete, user selects InsertionMode and clicks Insert
6. (Phase 4) Text is inserted into editor

### Key Implementation Details

**FloatingAiPanel positioning**:
```typescript
const selection = window.getSelection();
if (!selection || selection.rangeCount === 0) return;
const range = selection.getRangeAt(0);
const rect = range.getBoundingClientRect();
setPosition({
  top: rect.bottom + window.scrollY + 8,
  left: rect.left + window.scrollX,
});
```

**Command registration pattern**:
```typescript
const unregister = editor.registerCommand(
  OPEN_AI_PANEL_COMMAND,
  () => {
    editor.dispatchCommand(SAVE_SELECTION_COMMAND, undefined);
    // ... get selected text
    setIsPanelOpen(true);
    return true;
  },
  COMMAND_PRIORITY_HIGH
);
```

**Streaming state machine**:
```typescript
operationState === "idle" → Show AiCommandMenu
operationState === "streaming" → Show StreamingPreview + Stop button
operationState === "complete" → Show StreamingPreview + Insert/Cancel buttons
operationState === "error" → Show error + Retry button
```

### Delegation Rules

You MUST delegate code writing to `effect-code-writer` agent. You coordinate and verify, you do NOT write source code directly.

### Reference Files

- Full context: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P3.md`
- Phase 1-2 types: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/types.ts`
- Phase 2 hook: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts`
- Context: `apps/todox/src/app/lexical/context/AiContext.tsx`

### Base Path

All file paths relative to: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/`

### Verification

After each file creation:
```bash
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] `FloatingAiPanel` renders via portal and positions near selection
- [ ] `AiCommandMenu` shows all 10 prompts with search filtering
- [ ] `StreamingPreview` displays content and auto-scrolls
- [ ] `InsertionModeSelector` has 3 clickable mode buttons
- [ ] `AiAssistantPlugin` handles OPEN/CLOSE commands
- [ ] All components integrate with AiContext state
- [ ] TypeScript compiles without errors
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` created
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P3.md`
