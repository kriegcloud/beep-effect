# Lexical Editor AI Features Spec

> Port AI text assistance features from Notion-like editor to todox Lexical playground.

---

## Overview

This specification guides orchestrator agents through porting AI features from `tmp/nextjs-notion-like-ai-editor/` to `apps/todox/src/app/lexical/`. Orchestrators MUST delegate all substantive work to sub-agents - they coordinate, they do NOT execute.

### Key Features to Implement

1. **Floating AI toolbar** - Appears on text selection
2. **Predefined prompts** - Improve, simplify, translate, etc.
3. **Custom prompt input** - With streaming responses
4. **Three insertion modes** - Replace, inline, new paragraph
5. **Collaboration awareness** - AI activity visible to all users

### Complexity Assessment

```
Phase Count:       6 phases    x 2 = 12
Agent Diversity:   6 agents    x 3 = 18
Cross-Package:     2 (todox)   x 4 =  8
External Deps:     2 (AI/LB)   x 3 =  6
Uncertainty:       3 (medium)  x 5 = 15
Research Required: 4 (heavy)   x 2 =  8
----------------------------------------
Total Score:                      67 -> Critical Complexity
```

**Recommendation**: Full orchestration structure with per-task checkpoints.

---

## Critical Constraints

### Orchestrator Rules

| Action | Allowed | Delegate To |
|--------|---------|-------------|
| Read 1-3 files for context | Yes | - |
| Make 1-5 tool calls | Yes | - |
| Synthesize sub-agent outputs | Yes | - |
| Create handoff documents | Yes | - |
| Read >3 files | NO | `Explore` agent |
| Write source code | NO | `effect-code-writer` |
| Write tests | NO | `test-writer` |
| Research codebase | NO | `codebase-researcher` |

### AI SDK Migration (BLOCKING)

Source code uses deprecated patterns. All code MUST use modern AI SDK 6 patterns:

| Deprecated | Modern |
|------------|--------|
| `CoreMessage` | `UIMessage` |
| `convertToCoreMessages` (sync) | `convertToModelMessages` (async) |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` |
| `message.content` | `message.parts?.find(p => p.type === 'text')?.text` |

### Codebase Requirements

- Effect patterns for error handling (TaggedError, Effect.tryPromise)
- `@beep/*` path aliases (no relative `../../../` paths)
- Namespace imports (`import * as Effect from "effect/Effect"`)
- No native JS methods (use Effect utilities)

---

## Phase Overview

| Phase | Focus | Sessions | Key Outputs |
|-------|-------|----------|-------------|
| 1 | Infrastructure | 1 | Commands, errors, PreserveSelectionPlugin |
| 2 | Server Integration | 1 | Modern AI streaming endpoint |
| 3 | UI Components | 1-2 | FloatingAiPanel, command menu |
| 4 | Editor Integration | 1-2 | AiAssistantPlugin, insertion modes |
| 5 | Toolbar Integration | 1 | Dropdown menus, slash commands |
| 6 | Collaboration | 1 | Presence indicators, conflict handling |

### Phase Dependencies

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5
                                    |
                                    +-> Phase 6
```

---

## Agent Delegation Matrix

| Task Type | Agent | Capability |
|-----------|-------|------------|
| Codebase exploration | `Explore` | read-only |
| Effect documentation | `mcp-researcher` | read-only |
| Source code writing | `effect-code-writer` | write-files |
| Test writing | `test-writer` | write-files |
| Architecture review | `architecture-pattern-enforcer` | write-reports |
| Error fixing | `package-error-fixer` | write-files |

### Mandatory Delegation Triggers

Delegate when ANY condition is met:
- Task requires reading >3 files
- Task requires >5 sequential tool calls
- Task involves generating source code
- Task involves generating tests
- Task requires broad codebase search

---

## Research Outputs

Pre-execution research has been completed. Reference these artifacts:

| Report | Location | Purpose |
|--------|----------|---------|
| Source Analysis | `outputs/01-source-ai-features-analysis.md` | Features to port |
| Target Analysis | `outputs/02-target-lexical-editor-analysis.md` | Integration points |
| AI SDK Patterns | `outputs/03-ai-sdk-6-patterns.md` | Migration guide |
| Liveblocks Integration | `outputs/04-liveblocks-ai-integration.md` | Collaboration patterns |
| **Synthesis** | `outputs/05-synthesis-report.md` | Combined implementation plan |

---

## Handoff Protocol

### Phase Completion Criteria

A phase is complete ONLY when ALL conditions are met:

- [ ] Phase tasks implemented and verified
- [ ] `bun run check --filter @beep/todox` passes
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] `handoffs/HANDOFF_P[N+1].md` created
- [ ] `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created

### Starting a Phase

1. Read the orchestrator prompt: `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P[N].md`
3. Delegate tasks to appropriate sub-agents
4. Synthesize outputs and verify
5. Create next phase handoffs

---

## Success Criteria

### Functional Requirements

- [ ] AI button appears in floating toolbar on text selection
- [ ] Predefined prompts execute and stream responses
- [ ] Custom prompts work with streaming preview
- [ ] All three insertion modes function correctly
- [ ] AI operations can be undone in single step
- [ ] Collaboration shows AI activity to other users

### Technical Requirements

- [ ] Modern AI SDK 6 patterns used throughout
- [ ] Effect error handling with TaggedError
- [ ] No TypeScript errors (`bun run check`)
- [ ] No lint errors (`bun run lint`)
- [ ] Path aliases used exclusively

---

## Getting Started

**Start Phase 1 by copying the prompt from:**

```
specs/lexical-editor-ai-features/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

**Read full Phase 1 context in:**

```
specs/lexical-editor-ai-features/handoffs/HANDOFF_P1.md
```

---

## Related Documentation

- [Spec Guide](../_guide/README.md) - Spec creation methodology
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md) - Required code patterns
- [Synthesis Report](outputs/05-synthesis-report.md) - Complete implementation plan
