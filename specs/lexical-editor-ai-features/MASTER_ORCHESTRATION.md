# Master Orchestration: Lexical Editor AI Features

> Complete phase workflows, checkpoints, and handoff protocols for implementing AI features.

---

## Phase 0: Research & Discovery

**Duration**: 1 session
**Status**: Complete
**Agents**: `Explore`, `web-researcher`

### Objectives

1. Analyze source AI features in `tmp/nextjs-notion-like-ai-editor/`
2. Analyze target Lexical editor architecture
3. Research AI SDK 6 modern patterns
4. Research Liveblocks collaboration patterns
5. Synthesize into 6-phase implementation plan

### Tasks

- Task 0.1: Source AI features analysis (Explore)
- Task 0.2: Target Lexical editor analysis (Explore)
- Task 0.3: AI SDK 6 patterns research (web-researcher)
- Task 0.4: Liveblocks integration research (web-researcher)
- Task 0.5: Synthesis report creation (orchestrator)

### Checkpoint

Before proceeding to P1:
- [ ] `outputs/01-source-ai-features-analysis.md` exists
- [ ] `outputs/02-target-lexical-editor-analysis.md` exists
- [ ] `outputs/03-ai-sdk-6-patterns.md` exists
- [ ] `outputs/04-liveblocks-ai-integration.md` exists
- [ ] `outputs/05-synthesis-report.md` exists
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

---

## Phase 1: Infrastructure

**Duration**: 1 session
**Status**: Pending
**Agents**: `effect-code-writer`

### Objectives

1. Define AI command types for Lexical
2. Create Effect-compliant error types
3. Implement PreserveSelectionPlugin
4. Create AiContext provider
5. Register plugins in Editor.tsx

### Tasks

#### Task 1.1: AI Command Definitions (effect-code-writer)

```
Create plugins/AiAssistantPlugin/commands.ts:

- OPEN_AI_PANEL_COMMAND: LexicalCommand<null>
- CLOSE_AI_PANEL_COMMAND: LexicalCommand<null>
- INSERT_AI_TEXT_COMMAND: LexicalCommand<{ content: string; mode: InsertionMode }>
- SAVE_SELECTION_COMMAND: LexicalCommand<null>
- RESTORE_SELECTION_COMMAND: LexicalCommand<null>

Use createCommand from lexical with proper typing.
```

#### Task 1.2: Effect Error Types (effect-code-writer)

```
Create plugins/AiAssistantPlugin/errors.ts:

- AiError: General AI operation errors
- AiStreamError: Streaming failures
- AiSelectionError: Selection preservation errors

ALL errors must extend S.TaggedError.
```

#### Task 1.3: PreserveSelectionPlugin (effect-code-writer)

```
Create plugins/PreserveSelectionPlugin/index.tsx:

- Register SAVE_SELECTION_COMMAND handler
- Register RESTORE_SELECTION_COMMAND handler
- Store selection in useRef (not useState)
- Clone RangeSelection properly
- Handle invalid selection gracefully
```

#### Task 1.4: AiContext Provider (effect-code-writer)

```
Create context/AiContext.tsx:

Interface:
- isAiPanelOpen: boolean
- setAiPanelOpen: (open: boolean) => void
- selectedText: string
- setSelectedText: (text: string) => void
- isStreaming: boolean
- streamedContent: string

Include proper TypeScript types and default values.
```

#### Task 1.5: Plugin Registration (effect-code-writer)

```
Modify Editor.tsx:

- Import PreserveSelectionPlugin
- Add <PreserveSelectionPlugin /> to plugin list
- Position early for command registration
```

### Checkpoint

Before proceeding to P2:
- [ ] `plugins/AiAssistantPlugin/commands.ts` created
- [ ] `plugins/AiAssistantPlugin/errors.ts` created
- [ ] `plugins/PreserveSelectionPlugin/index.tsx` created
- [ ] `context/AiContext.tsx` created
- [ ] `Editor.tsx` modified
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

---

## Phase 2: Server Integration

**Duration**: 1 session
**Status**: Pending
**Agents**: `effect-code-writer`

### Objectives

1. Update chat route with modern AI SDK patterns
2. Create prompt templates
3. Create useAiStreaming hook

### Tasks

#### Task 2.1: Chat Route Update (effect-code-writer)

```
Update app/api/chat/route.ts:

MUST use modern patterns:
- UIMessage (not CoreMessage)
- await convertToModelMessages() (async!)
- toUIMessageStreamResponse()

Include proper error handling with Effect.
```

#### Task 2.2: Prompt Templates (effect-code-writer)

```
Create plugins/AiAssistantPlugin/prompts.ts:

Predefined prompts:
- Improve writing
- Fix grammar
- Make shorter
- Make longer
- Simplify
- Translate (multi-language)

Format: { id, label, systemPrompt, userPromptTemplate }
```

#### Task 2.3: useAiStreaming Hook (effect-code-writer)

```
Create plugins/AiAssistantPlugin/hooks/useAiStreaming.ts:

Using useChat from AI SDK:
- Proper configuration
- Error handling
- Abort support
- Streaming state management

Export: streamContent, isStreaming, error, abort
```

### Checkpoint

Before proceeding to P3:
- [ ] Chat route uses modern AI SDK patterns
- [ ] Prompt templates created
- [ ] useAiStreaming hook implemented
- [ ] Streaming verified (manual test)
- [ ] `REFLECTION_LOG.md` updated
- [ ] Handoffs created

---

## Phase 3: UI Components

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `effect-code-writer`

### Objectives

1. Create FloatingAiPanel component
2. Implement command menu with prompts
3. Add custom prompt input
4. Handle streaming display

### Tasks

#### Task 3.1: FloatingAiPanel (effect-code-writer)

```
Create plugins/AiAssistantPlugin/components/FloatingAiPanel.tsx:

- Position relative to selection
- Show/hide based on AiContext
- Contains command menu and custom input
- Handles keyboard navigation
```

#### Task 3.2: Command Menu (effect-code-writer)

```
Create plugins/AiAssistantPlugin/components/CommandMenu.tsx:

Using shadcn/ui CommandDialog:
- List predefined prompts
- Keyboard navigation
- Search/filter capability
- Execute on selection
```

#### Task 3.3: Custom Prompt Input (effect-code-writer)

```
Create plugins/AiAssistantPlugin/components/CustomPromptInput.tsx:

- Text input for custom prompts
- Submit handling
- Loading state during streaming
- Abort capability
```

#### Task 3.4: Streaming Preview (effect-code-writer)

```
Create plugins/AiAssistantPlugin/components/StreamingPreview.tsx:

- Display streamed content progressively
- Insert/Cancel controls
- Insertion mode selector (replace/inline/below)
```

### Checkpoint

Before proceeding to P4:
- [ ] FloatingAiPanel created
- [ ] CommandMenu created
- [ ] CustomPromptInput created
- [ ] StreamingPreview created
- [ ] UI renders correctly (manual test)
- [ ] `REFLECTION_LOG.md` updated
- [ ] Handoffs created

---

## Phase 4: Editor Integration

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `effect-code-writer`

### Objectives

1. Create main AiAssistantPlugin
2. Implement content insertion modes
3. Handle undo batching
4. Wire up all components

### Tasks

#### Task 4.1: AiAssistantPlugin (effect-code-writer)

```
Create plugins/AiAssistantPlugin/index.tsx:

- Register command handlers
- Connect to AiContext
- Coordinate selection preservation
- Mount FloatingAiPanel
```

#### Task 4.2: Content Insertion (effect-code-writer)

```
Create plugins/AiAssistantPlugin/insertion.ts:

Implement three modes:
1. REPLACE: Replace selected text
2. INLINE: Insert after selection
3. BELOW: Insert new paragraph below

All modes must:
- Restore selection first
- Batch operations for single undo
- Handle node boundaries
```

#### Task 4.3: Undo Batching (effect-code-writer)

```
Implement undo batching:

- editor.update() with discrete: false
- Single undo step for entire AI operation
- Verify with manual testing
```

#### Task 4.4: Plugin Wiring (effect-code-writer)

```
Complete integration:

- Register AiAssistantPlugin in Editor.tsx
- Wire AiContext provider
- Connect all command flows
- Verify end-to-end
```

### Checkpoint

Before proceeding to P5:
- [ ] AiAssistantPlugin created
- [ ] All insertion modes work
- [ ] Undo batching verified
- [ ] End-to-end flow works
- [ ] `REFLECTION_LOG.md` updated
- [ ] Handoffs created

---

## Phase 5: Toolbar Integration

**Duration**: 1 session
**Status**: Pending
**Agents**: `effect-code-writer`

### Objectives

1. Add AI button to floating toolbar
2. Implement toolbar dropdown
3. Add slash command support

### Tasks

#### Task 5.1: Toolbar Button (effect-code-writer)

```
Modify ToolbarPlugin:

- Add AI button (sparkles icon)
- Dispatch OPEN_AI_PANEL_COMMAND on click
- Show active state when panel open
```

#### Task 5.2: Toolbar Dropdown (effect-code-writer)

```
Create AiDropdownMenu:

- Quick access to predefined prompts
- Custom prompt option
- Keyboard shortcuts (Cmd+J)
```

#### Task 5.3: Slash Commands (effect-code-writer)

```
Integrate with ComponentPickerPlugin:

- Add /ai command
- Add /improve, /simplify shortcuts
- Trigger AI panel from slash commands
```

### Checkpoint

Before proceeding to P6:
- [ ] AI button in toolbar
- [ ] Dropdown menu works
- [ ] Slash commands work
- [ ] Keyboard shortcuts work
- [ ] `REFLECTION_LOG.md` updated
- [ ] Handoffs created

---

## Phase 6: Collaboration Awareness

**Duration**: 1 session
**Status**: Pending
**Agents**: `effect-code-writer`

### Objectives

1. Add presence indicators for AI operations
2. Broadcast AI events to other users
3. Handle concurrent edit conflicts

### Tasks

#### Task 6.1: Presence Indicators (effect-code-writer)

```
Implement AI presence:

- Show "User is using AI" indicator
- Update Liveblocks presence
- Clear on completion/cancel
```

#### Task 6.2: Broadcast Events (effect-code-writer)

```
Implement event broadcasting:

- AI_OPERATION_START event
- AI_OPERATION_COMPLETE event
- Subscribe to events from other users
```

#### Task 6.3: Conflict Handling (effect-code-writer)

```
Handle concurrent edits:

- Detect when selection area was modified
- Show warning if selection invalidated
- Cancel gracefully if needed
```

### Final Checkpoint

Spec complete when:
- [ ] All functional requirements met
- [ ] All technical requirements met
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint:fix` passes
- [ ] Manual testing complete
- [ ] `REFLECTION_LOG.md` finalized

---

## Cross-Phase Considerations

### Effect Patterns

All code must follow `.claude/rules/effect-patterns.md`:
- Namespace imports
- PascalCase Schema constructors
- TaggedError for all errors
- No native JS methods

### AI SDK Migration

All streaming code MUST use modern patterns:
- UIMessage, NOT CoreMessage
- await convertToModelMessages()
- toUIMessageStreamResponse()

### Delegation Rules

Orchestrators coordinate, they do NOT write source code:
- Delegate to `effect-code-writer` for all implementation
- Delegate to `test-writer` for tests
- Verify output, provide feedback, iterate

---

## Iteration Protocol

After each phase:

1. **Verify** - Confirm all deliverables exist
2. **Test** - Run `bun run check --filter @beep/todox`
3. **Reflect** - Update REFLECTION_LOG.md
4. **Handoff** - Create HANDOFF_P[N+1].md
5. **Prompt** - Create P[N+1]_ORCHESTRATOR_PROMPT.md

---

## Success Criteria

### Functional Requirements

- [ ] AI button in floating toolbar
- [ ] Predefined prompts execute with streaming
- [ ] Custom prompts work
- [ ] Three insertion modes function correctly
- [ ] Single undo for AI operations
- [ ] Collaboration shows AI activity

### Technical Requirements

- [ ] Modern AI SDK 6 patterns
- [ ] Effect error handling
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Path aliases used exclusively
