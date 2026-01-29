# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 research.

---

## Prompt

You are executing **Phase 0: Research & Discovery** of the lexical-editor-ai-features spec.

### Context

This spec ports AI features from `tmp/nextjs-notion-like-ai-editor/` to `apps/todox/src/app/lexical/`. Phase 0 gathers comprehensive research before implementation.

### Your Mission

Deploy parallel research agents to analyze:

1. **Source AI Features** - What to port from the Notion-like editor
2. **Target Lexical Editor** - Integration points in existing codebase
3. **AI SDK 6 Patterns** - Modern streaming API requirements
4. **Liveblocks Integration** - Collaboration awareness patterns

### Delegation Rules

You MUST delegate ALL research to sub-agents:

| Research Area | Agent | Tool |
|---------------|-------|------|
| Source/Target codebase | `Explore` | Task tool |
| AI SDK/Liveblocks docs | `web-researcher` | Task tool |
| Synthesis | You | Direct writing |

### Tasks

1. **Task 0.1**: Deploy Explore agent for source analysis → `outputs/01-source-ai-features-analysis.md`
2. **Task 0.2**: Deploy Explore agent for target analysis → `outputs/02-target-lexical-editor-analysis.md`
3. **Task 0.3**: Deploy web-researcher for AI SDK 6 → `outputs/03-ai-sdk-6-patterns.md`
4. **Task 0.4**: Deploy web-researcher for Liveblocks → `outputs/04-liveblocks-ai-integration.md`
5. **Task 0.5**: Synthesize all research → `outputs/05-synthesis-report.md`

### Parallel Execution

Launch Tasks 0.1-0.4 in parallel using multiple Task tool calls in a single message.

### Synthesis Requirements

The synthesis report (`05-synthesis-report.md`) MUST include:
- 6-phase implementation roadmap
- Files to create with file paths
- Files to modify with specific changes
- AI SDK migration table (deprecated → modern)
- Critical code patterns for each integration area

### Success Criteria

- [ ] 5 output files created
- [ ] AI SDK migration patterns documented (BLOCKING)
- [ ] 6-phase plan with clear dependencies
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P0.md`
