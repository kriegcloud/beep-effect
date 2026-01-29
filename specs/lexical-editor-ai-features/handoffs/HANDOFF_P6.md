# Phase 6 Handoff: Collaboration Awareness

> Add Liveblocks presence indicators during AI operations and handle collaborative conflict scenarios.

---

## Previous Phase Summary

**Phase 5 (Toolbar Integration)** completed:
- `components/AiToolbarButton.tsx` - Toolbar button with dropdown menu
- ToolbarPlugin integration with AI button after element format dropdown
- Loading spinner shows during AI streaming
- Quick access to first 5 predefined prompts

**Available from Phase 1-5:**
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

// Toolbar Button
import { AiToolbarButton } from "./components/AiToolbarButton";
```

---

## Phase 6 Objectives

### Goal

Add collaboration awareness so that other users in the same document can see when someone is using AI features. Handle potential conflicts when multiple users use AI simultaneously on overlapping selections.

### Tasks

| ID | Task | Agent | Priority |
|----|------|-------|----------|
| 6.1 | Extend Liveblocks presence to include AI activity state | `effect-code-writer` | Critical |
| 6.2 | Create AiActivityIndicator component for collaborator cursors | `effect-code-writer` | High |
| 6.3 | Add conflict detection for overlapping AI operations | `effect-code-writer` | High |
| 6.4 | Implement optimistic locking for AI insertions | `effect-code-writer` | Medium |
| 6.5 | Add collaborative undo support for AI insertions | `effect-code-writer` | Medium |

---

## Files to Create/Modify

### 1. Modify Liveblocks Presence Types

**Purpose**: Extend presence to track AI activity.

Location: Find existing Liveblocks types (likely in `@liveblocks/react` config or local types).

```typescript
// Extend Presence type
interface Presence {
  cursor: { x: number; y: number } | null;
  selection: SerializedRange | null;
  // NEW: AI activity fields
  aiActivity: {
    isGenerating: boolean;
    promptLabel: string | null;  // e.g., "Improve Writing"
    selectionRange: SerializedRange | null;
  } | null;
}
```

### 2. Create `components/AiActivityIndicator.tsx`

**Purpose**: Show visual indicator near collaborator cursors when they're using AI.

```typescript
"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { Sparkle } from "@phosphor-icons/react";
import { cn } from "@beep/todox/lib/utils";

interface AiActivityIndicatorProps {
  userId: string;
}

export function AiActivityIndicator({ userId }: AiActivityIndicatorProps) {
  const others = useOthers();
  const other = others.find((o) => o.id === userId);

  if (!other?.presence?.aiActivity?.isGenerating) {
    return null;
  }

  const { promptLabel } = other.presence.aiActivity;

  return (
    <div className={cn(
      "absolute -top-6 left-0 px-2 py-1 rounded",
      "bg-purple-500/20 text-purple-700 text-xs",
      "flex items-center gap-1 animate-pulse"
    )}>
      <Sparkle className="size-3" />
      <span>{promptLabel || "Generating..."}</span>
    </div>
  );
}
```

### 3. Modify `AiContext.tsx`

**Purpose**: Broadcast AI activity to Liveblocks.

```typescript
import { useMutation as useLiveblocksUpdate } from "@liveblocks/react/suspense";

// Add to context:
const broadcastAiActivity = useLiveblocksUpdate(
  ({ self, storage }, isGenerating: boolean, promptLabel: string | null, selectionRange: SerializedRange | null) => {
    self.presence.aiActivity = isGenerating
      ? { isGenerating, promptLabel, selectionRange }
      : null;
  },
  []
);

// Call when starting/stopping AI:
// - In useAiStreaming, call broadcastAiActivity(true, promptLabel, range) on start
// - In useAiStreaming, call broadcastAiActivity(false, null, null) on complete/cancel
```

### 4. Create `hooks/useCollaborativeAi.ts`

**Purpose**: Handle conflict detection and collaborative AI operations.

```typescript
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { useCallback, useMemo } from "react";

interface CollaborativeAiState {
  hasConflict: boolean;
  conflictingUsers: Array<{ id: string; name: string }>;
  canProceed: boolean;
}

export function useCollaborativeAi(mySelectionRange: SerializedRange | null): CollaborativeAiState {
  const self = useSelf();
  const others = useOthers();

  const conflictingUsers = useMemo(() => {
    if (!mySelectionRange) return [];

    return others
      .filter((other) => {
        const otherRange = other.presence?.aiActivity?.selectionRange;
        if (!otherRange || !other.presence?.aiActivity?.isGenerating) return false;

        // Check if ranges overlap
        return rangesOverlap(mySelectionRange, otherRange);
      })
      .map((other) => ({
        id: other.id,
        name: other.info?.name || "Unknown user",
      }));
  }, [mySelectionRange, others]);

  return {
    hasConflict: conflictingUsers.length > 0,
    conflictingUsers,
    canProceed: conflictingUsers.length === 0,
  };
}

function rangesOverlap(a: SerializedRange, b: SerializedRange): boolean {
  // Implement range overlap check
  // This depends on your SerializedRange structure
  // Basic implementation:
  return !(a.end <= b.start || b.end <= a.start);
}
```

### 5. Modify `FloatingAiPanel.tsx`

**Purpose**: Show conflict warnings and integrate collaborative state.

```typescript
import { useCollaborativeAi } from "../hooks/useCollaborativeAi";

// In component:
const { hasConflict, conflictingUsers } = useCollaborativeAi(selectionRange);

// Show warning if conflict:
{hasConflict && (
  <div className="text-amber-600 bg-amber-50 p-2 rounded text-sm">
    <strong>Warning:</strong> {conflictingUsers.map(u => u.name).join(", ")} is also editing this area with AI.
  </div>
)}

// Optionally disable Insert button during conflict
<Button onClick={handleInsert} disabled={isLoading || hasConflict}>
  Insert
</Button>
```

---

## Directory Structure After Phase 6

```
apps/todox/src/app/lexical/
├── context/
│   └── AiContext.tsx           # MODIFIED - adds Liveblocks broadcast
└── plugins/
    ├── AiAssistantPlugin/
    │   ├── commands.ts
    │   ├── errors.ts
    │   ├── types.ts
    │   ├── prompts.ts
    │   ├── hooks/
    │   │   ├── useAiStreaming.ts
    │   │   └── useCollaborativeAi.ts  # NEW
    │   ├── components/
    │   │   ├── FloatingAiPanel.tsx    # MODIFIED
    │   │   ├── AiCommandMenu.tsx
    │   │   ├── StreamingPreview.tsx
    │   │   ├── InsertionModeSelector.tsx
    │   │   ├── AiToolbarButton.tsx
    │   │   └── AiActivityIndicator.tsx  # NEW
    │   ├── utils/
    │   │   └── insertAiText.ts
    │   └── index.tsx
    └── PreserveSelectionPlugin/
        └── index.tsx
```

---

## Collaboration Scenarios

| Scenario | Behavior |
|----------|----------|
| User A starts AI, User B has no overlap | Both proceed independently |
| User A starts AI, User B selects same text | Warning shown to User B |
| User A inserts AI text while User B is streaming | User B sees document update, can still insert |
| Both users insert to same location | Last write wins (standard Liveblocks behavior) |

---

## Verification Commands

```bash
# Full type check
bun run check --filter @beep/todox

# Verify specific files
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts
```

---

## Success Criteria

- [ ] Presence type extended with aiActivity field
- [ ] AiActivityIndicator shows near collaborator cursors during AI generation
- [ ] Conflict detection works for overlapping selections
- [ ] Warning shown when another user is generating in same area
- [ ] AI insertions don't break collaboration (Liveblocks sync intact)
- [ ] TypeScript compiles without errors
- [ ] Manual testing: Open editor in 2 browsers, verify presence sync

---

## Manual Testing Steps

1. **Presence sync**: Open editor in 2 browsers with different users
2. **AI activity visible**: User A selects text and starts AI generation
3. **Verify indicator**: User B should see AI indicator near User A's cursor
4. **Conflict warning**: User B selects same text, opens AI panel → sees warning
5. **Insertion sync**: User A inserts AI text → User B's editor updates

---

## Potential Challenges

1. **SerializedRange format**: Need to understand how Lexical/Liveblocks serialize selection ranges
2. **Cursor component location**: Find where collaborator cursors are rendered to add AiActivityIndicator
3. **Timing**: Presence updates may have slight delay - consider optimistic updates
4. **Yjs integration**: If using Lexical-Yjs, need to ensure AI insertions go through Yjs for proper sync

---

## Liveblocks Integration Notes

The project uses Liveblocks with Lexical. Key files to examine:
- Check for existing Liveblocks provider wrapping the editor
- Find Presence type definitions (may be in `liveblocks.config.ts` or similar)
- Look for existing cursor/selection presence patterns to follow

---

## Research Needed

Before implementation, research:
1. How Liveblocks Presence is currently defined in the project
2. How collaborator cursors are rendered (component location)
3. How Lexical selection serializes for presence
