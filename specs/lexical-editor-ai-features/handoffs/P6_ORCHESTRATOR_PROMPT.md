# Phase 6 Orchestrator Prompt

Copy-paste this prompt to start Phase 6 implementation.

---

## Prompt

You are implementing **Phase 6: Collaboration Awareness** of the lexical-editor-ai-features spec.

### Context

Phases 1-5 completed. The following infrastructure is available:
- `PreserveSelectionPlugin` with SAVE/RESTORE commands
- AI types, commands, errors
- `AiContext` provider with full state management (now properly placed in App.tsx)
- `useAiStreaming` hook for consuming AI streams
- 5 UI components in AiAssistantPlugin + AiToolbarButton
- `$insertAiText` utility for editor insertion
- Keyboard shortcuts (ESC to close, Cmd/Ctrl+Shift+I to open)
- Toolbar integration with AI button and quick prompts

**Current gap**: No collaboration awareness - other users don't see when someone is using AI.

### Your Mission

Add Liveblocks presence indicators during AI operations and handle collaborative conflict scenarios:

| File | Action | Purpose |
|------|--------|---------|
| Liveblocks presence types | MODIFY | Add aiActivity field to Presence |
| `hooks/useCollaborativeAi.ts` | CREATE | Conflict detection for overlapping AI ops |
| `components/AiActivityIndicator.tsx` | CREATE | Visual indicator near collaborator cursors |
| `AiContext.tsx` | MODIFY | Broadcast AI activity to Liveblocks |
| `FloatingAiPanel.tsx` | MODIFY | Show conflict warnings |

### Research Required First

Before implementation, you must research:
1. How Liveblocks Presence is currently defined (find `liveblocks.config.ts` or similar)
2. How collaborator cursors are rendered (find existing cursor component)
3. How Lexical selection serializes for presence
4. Project's existing Liveblocks integration patterns

Use the Explore agent to find these patterns before writing code.

### Delegation Rules

You MUST delegate code writing to `effect-code-writer` agent. You coordinate and verify, you do NOT write source code directly.

### Reference Files

- Full context: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P6.md`
- Current AiContext: `apps/todox/src/app/lexical/context/AiContext.tsx`
- Current FloatingAiPanel: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/FloatingAiPanel.tsx`
- App component tree: `apps/todox/src/app/lexical/App.tsx`

### Base Path

All file paths relative to: `apps/todox/src/app/lexical/`

### Verification

After each change:
```bash
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] Presence type extended with `aiActivity` field
- [ ] `useCollaborativeAi` hook created with conflict detection
- [ ] `AiActivityIndicator` component shows near collaborator cursors
- [ ] AiContext broadcasts AI activity to Liveblocks
- [ ] FloatingAiPanel shows conflict warnings
- [ ] TypeScript compiles without errors
- [ ] REFLECTION_LOG.md updated with Phase 6 learnings

### Manual Testing After Implementation

1. Open editor in 2 browsers with different users
2. User A selects text and starts AI generation
3. Verify User B sees AI indicator near User A's cursor
4. User B selects same text, opens AI panel → sees conflict warning
5. User A inserts AI text → User B's editor updates in sync

### Handoff Document

Read full context in: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P6.md`
