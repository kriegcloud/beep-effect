# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing **Phase 5: Toolbar Integration** of the lexical-editor-ai-features spec.

### Context

Phases 1-4 completed. The following infrastructure is available:
- `PreserveSelectionPlugin` with SAVE/RESTORE commands
- AI types, commands, errors
- `AiContext` provider with full state management
- `useAiStreaming` hook for consuming AI streams
- 5 UI components in AiAssistantPlugin
- `$insertAiText` utility for editor insertion
- Keyboard shortcuts (ESC to close, Cmd/Ctrl+Shift+I to open)

**Current gap**: No toolbar integration - users can only open AI panel via keyboard shortcut.

### Your Mission

Add AI functionality to the editor toolbar:

| File | Action | Purpose |
|------|--------|---------|
| `components/AiToolbarButton.tsx` | CREATE | Toolbar button with dropdown menu |
| `../../ToolbarPlugin/index.tsx` | MODIFY | Integrate AiToolbarButton |

### Import Paths

```typescript
// Available from Phase 1-4
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAiContext } from "../../../context/AiContext";
import { OPEN_AI_PANEL_COMMAND } from "../commands";
import { PREDEFINED_PROMPTS } from "../prompts";

// shadcn/ui components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Icons
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
```

### Delegation Rules

You MUST delegate code writing to `effect-code-writer` agent. You coordinate and verify, you do NOT write source code directly.

### Reference Files

- Full context: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P5.md`
- Current plugin: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/index.tsx`
- Toolbar plugin: `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx`

### Base Path

All file paths relative to: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/`

### Verification

After each change:
```bash
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] `AiToolbarButton.tsx` created with dropdown menu
- [ ] Button shows loading state during AI streaming
- [ ] ToolbarPlugin includes AiToolbarButton
- [ ] TypeScript compiles without errors
- [ ] REFLECTION_LOG.md updated with Phase 5 learnings
- [ ] `handoffs/HANDOFF_P6.md` created
- [ ] `handoffs/P6_ORCHESTRATOR_PROMPT.md` created

### Manual Testing After Implementation

1. Open editor
2. Verify AI button appears in toolbar
3. Click dropdown, verify prompts appear
4. Select text, click "Open AI Panel..."
5. Verify panel opens
6. Generate content, verify loading spinner in toolbar

### Handoff Document

Read full context in: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P5.md`
