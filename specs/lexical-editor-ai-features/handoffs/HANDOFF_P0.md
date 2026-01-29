# Phase 0 Handoff: Research & Discovery

> Complete context for Phase 0 execution.

---

## Mission

Conduct comprehensive parallel research across 4 domains to understand the implementation landscape for AI features in the Lexical editor.

## Context

This spec ports AI text assistance features from `tmp/nextjs-notion-like-ai-editor/` (Liveblocks example) to `apps/todox/src/app/lexical/`. Before implementation, we need deep understanding of both source and target systems.

### Research Domains

| Domain | Agent | Purpose |
|--------|-------|---------|
| Source AI Features | `Explore` | Understand features to port |
| Target Lexical Editor | `Explore` | Identify integration points |
| AI SDK 6 Patterns | `web-researcher` | Modern streaming patterns |
| Liveblocks AI Integration | `web-researcher` | Collaboration awareness |

---

## Deliverables

### 1. `outputs/01-source-ai-features-analysis.md`

Document source codebase patterns:
- AI panel UI components
- Streaming implementation
- Content insertion modes
- Command palette structure

### 2. `outputs/02-target-lexical-editor-analysis.md`

Document target integration points:
- Existing plugin architecture
- Selection handling patterns
- Floating toolbar structure
- Command registration

### 3. `outputs/03-ai-sdk-6-patterns.md`

Research modern AI SDK patterns:
- UIMessage vs CoreMessage
- convertToModelMessages (async)
- toUIMessageStreamResponse
- useChat hook patterns

### 4. `outputs/04-liveblocks-ai-integration.md`

Research collaboration patterns:
- Presence indicators for AI operations
- Broadcast events for streaming
- Conflict handling during AI edits

### 5. `outputs/05-synthesis-report.md`

Combine all research into actionable plan:
- 6-phase implementation roadmap
- File creation/modification list
- Critical code patterns
- Dependency order

---

## Research Tasks

### Task 0.1: Source Analysis (Explore)

```
Research the AI features in tmp/nextjs-notion-like-ai-editor/:

1. AI Panel Components:
   - How does the floating AI panel appear?
   - What triggers it (selection, keyboard)?
   - What UI components are used?

2. Streaming Implementation:
   - How is AI streaming handled?
   - What hooks/contexts are used?
   - How is content progressively displayed?

3. Content Insertion:
   - What insertion modes exist?
   - How is selection preserved?
   - How are undo boundaries managed?

4. Command Palette:
   - What predefined prompts exist?
   - How is custom input handled?
   - How are prompts submitted?

Output: outputs/01-source-ai-features-analysis.md
```

### Task 0.2: Target Analysis (Explore)

```
Research the Lexical editor at apps/todox/src/app/lexical/:

1. Plugin Architecture:
   - How are plugins registered?
   - What plugin patterns exist?
   - How do plugins communicate?

2. Selection Handling:
   - How is selection tracked?
   - What happens when focus leaves editor?
   - How can selection be preserved?

3. Floating Toolbar:
   - Does a floating toolbar exist?
   - How is it triggered?
   - How can it be extended?

4. Command System:
   - How are Lexical commands created?
   - How are they dispatched?
   - What priority levels exist?

Output: outputs/02-target-lexical-editor-analysis.md
```

### Task 0.3: AI SDK 6 Patterns (web-researcher)

```
Research modern AI SDK patterns:

1. Message Types:
   - UIMessage vs CoreMessage
   - How to access message content
   - Parts array structure

2. Conversion Functions:
   - convertToModelMessages (async)
   - When to use await
   - Type inference

3. Response Streaming:
   - toUIMessageStreamResponse
   - Route handler patterns
   - Client consumption

4. useChat Hook:
   - Modern configuration
   - Error handling
   - Abort support

Output: outputs/03-ai-sdk-6-patterns.md
```

### Task 0.4: Liveblocks Integration (web-researcher)

```
Research Liveblocks AI integration patterns:

1. Presence Indicators:
   - Showing AI is active
   - User-specific indicators
   - Broadcasting status

2. Collaboration Awareness:
   - Notifying other users
   - Handling concurrent edits
   - Conflict resolution

3. Broadcast Events:
   - Event types for AI operations
   - Subscribing to events
   - State synchronization

Output: outputs/04-liveblocks-ai-integration.md
```

### Task 0.5: Synthesis (Orchestrator)

After all research completes, synthesize into implementation plan:
- Phase breakdown with dependencies
- File creation/modification order
- Critical code patterns
- Risk areas and mitigations

Output: outputs/05-synthesis-report.md

---

## Agent Delegation

| Task | Agent | Capability |
|------|-------|------------|
| 0.1-0.2 | `Explore` | read-only codebase |
| 0.3-0.4 | `web-researcher` | external research |
| 0.5 | orchestrator | synthesis |

---

## Verification

After completing research:
- [ ] All 5 output files exist
- [ ] Source analysis covers UI, streaming, insertion, commands
- [ ] Target analysis covers plugins, selection, toolbar, commands
- [ ] AI SDK research documents migration requirements
- [ ] Liveblocks research covers presence and collaboration
- [ ] Synthesis provides clear 6-phase plan

---

## Success Criteria

- Comprehensive coverage of all research domains
- No implementation started (research only)
- Clear path forward for Phase 1

---

## Next Phase

After Phase 0 completes, proceed to Phase 1 (Infrastructure) using `P1_ORCHESTRATOR_PROMPT.md`.
