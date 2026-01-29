# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing **Phase 1: Infrastructure** of the lexical-editor-ai-features spec.

### Context

Research phase completed. Synthesis report at `specs/lexical-editor-ai-features/outputs/05-synthesis-report.md` contains full implementation plan. This phase establishes foundational infrastructure.

**Dependencies confirmed**: All packages (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`, `cmdk`, `@liveblocks/*`) are already in `apps/todox/package.json`. No installation needed.

### Your Mission

Create 5 files and modify 1 file:

| File | Purpose |
|------|---------|
| `plugins/PreserveSelectionPlugin/index.tsx` | Selection save/restore with co-located commands |
| `plugins/AiAssistantPlugin/types.ts` | InsertionMode and AiOperationState types |
| `plugins/AiAssistantPlugin/commands.ts` | AI-specific Lexical commands |
| `plugins/AiAssistantPlugin/errors.ts` | Effect TaggedError classes with error codes |
| `context/AiContext.tsx` | React context for AI state management |
| `Editor.tsx` | Register PreserveSelectionPlugin (MODIFY) |

### Critical Architecture Decision

**Commands are split to avoid circular dependencies:**

- `SAVE_SELECTION_COMMAND` / `RESTORE_SELECTION_COMMAND` → co-located in `PreserveSelectionPlugin/index.tsx`
- `OPEN_AI_PANEL_COMMAND` / `INSERT_AI_TEXT_COMMAND` / etc → in `AiAssistantPlugin/commands.ts`

### Code Patterns

**PreserveSelectionPlugin (with co-located commands):**
```typescript
import { createCommand, type LexicalCommand, type RangeSelection } from "lexical";

export const SAVE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("SAVE_SELECTION");
export const RESTORE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("RESTORE_SELECTION");

// Use selection.clone() on BOTH save and restore for safety
savedSelection.current = selection.clone();
$setSelection(savedSelection.current.clone());
```

**Types (types.ts):**
```typescript
export type InsertionMode = "replace" | "inline" | "below";
export type AiOperationState = "idle" | "streaming" | "complete" | "error";
```

**AI Commands (commands.ts):**
```typescript
import { createCommand, type LexicalCommand } from "lexical";
import type { InsertionMode } from "./types";

export interface InsertAiTextPayload {
  readonly content: string;
  readonly mode: InsertionMode;
}

export const OPEN_AI_PANEL_COMMAND: LexicalCommand<null> = createCommand("OPEN_AI_PANEL");
export const INSERT_AI_TEXT_COMMAND: LexicalCommand<InsertAiTextPayload> = createCommand("INSERT_AI_TEXT");
```

**Effect Errors (errors.ts):**
```typescript
import * as S from "effect/Schema";

export const AiErrorCode = {
  STREAM_ABORT: "STREAM_ABORT",
  SELECTION_INVALID: "SELECTION_INVALID",
  API_ERROR: "API_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

export class AiError extends S.TaggedError<AiError>()("AiError", {
  message: S.String,
  code: S.optional(S.String),
}) {}
```

**AiContext (full state):**
```typescript
interface AiContextValue {
  isAiPanelOpen: boolean;
  selectedText: string;
  operationState: AiOperationState;
  streamedContent: string;
  insertionMode: InsertionMode;
  error: string | null;
  reset: () => void;
  // ... setters
}
```

### Delegation Rules

You MUST delegate code writing to `effect-code-writer` agent. You coordinate and verify, you do NOT write source code directly.

### Reference Files

- Full context: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P1.md`
- Code patterns: `specs/lexical-editor-ai-features/outputs/05-synthesis-report.md` (Section 7)
- Existing plugins: `apps/todox/src/app/lexical/plugins/`
- Existing contexts: `apps/todox/src/app/lexical/context/SettingsContext.tsx`
- Editor registration: `apps/todox/src/app/lexical/Editor.tsx`

### Plugin Registration Location

In `Editor.tsx`, add PreserveSelectionPlugin **after `DateTimePlugin` (line 169)** and **before `CommentPlugin`**:

```typescript
<DateTimePlugin />
<PreserveSelectionPlugin />  {/* NEW */}
{!(isCollab && useCollabV2) && (
```

### Verification

After each file creation:
```bash
bun run check --filter @beep/todox
```

If upstream errors, isolate:
```bash
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/commands.ts
```

### Success Criteria

- [ ] `plugins/PreserveSelectionPlugin/index.tsx` created with SAVE/RESTORE commands
- [ ] `plugins/AiAssistantPlugin/types.ts` created
- [ ] `plugins/AiAssistantPlugin/commands.ts` created (AI commands only)
- [ ] `plugins/AiAssistantPlugin/errors.ts` created with AiErrorCode
- [ ] `context/AiContext.tsx` created with full state
- [ ] `Editor.tsx` modified to register PreserveSelectionPlugin
- [ ] No TypeScript errors
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P1.md`
