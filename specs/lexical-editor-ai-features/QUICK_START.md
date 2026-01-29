# Quick Start: Lexical Editor AI Features

> 5-minute orientation for new sessions working on this spec.

---

## What is this spec?

This spec guides porting **AI text assistance features** from a Liveblocks example editor (`tmp/nextjs-notion-like-ai-editor/`) to the existing Lexical editor in the todox app (`apps/todox/src/app/lexical/`).

## Current State

- Lexical editor exists with 40+ plugins and 31 custom nodes
- No AI assistance features implemented
- AI SDK 6.0.57 available in project (requires modern patterns)
- Liveblocks collaboration already integrated

## Target State

- Floating AI toolbar appears on text selection
- Predefined prompts (improve, simplify, translate, etc.)
- Custom prompt input with streaming responses
- Three insertion modes: replace, inline, below
- AI operations undo in single step
- Collaboration shows AI activity to other users

---

## Phase Status

| Phase | Name | Status | Sessions |
|-------|------|--------|----------|
| P0 | Research & Discovery | Complete | 1 |
| P1 | Infrastructure | Pending | 1 |
| P2 | Server Integration | Pending | 1 |
| P3 | UI Components | Pending | 1-2 |
| P4 | Editor Integration | Pending | 1-2 |
| P5 | Toolbar Integration | Pending | 1 |
| P6 | Collaboration | Pending | 1 |

---

## Key Technical Constraints

### AI SDK 6 Migration (BLOCKING)

Source code uses deprecated patterns. ALL code must use modern AI SDK 6:

| Deprecated | Modern |
|------------|--------|
| `CoreMessage` | `UIMessage` |
| `convertToCoreMessages` (sync) | `convertToModelMessages` (async) |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` |
| `message.content` | `message.parts?.find(p => p.type === 'text')?.text` |

### Effect Patterns (REQUIRED)

- Tagged errors: `S.TaggedError<T>()("Tag", { ... })`
- Async wrapping: `Effect.tryPromise({ try: () => ... })`
- Namespace imports: `import * as S from "effect/Schema"`
- No native JS methods

---

## Quick Commands

```bash
# Type check the todox package
bun run check --filter @beep/todox

# Run development server
bun run dev --filter @beep/todox

# Lint and fix
bun run lint:fix
```

---

## Key Files

| File | Purpose |
|------|---------|
| `outputs/05-synthesis-report.md` | Complete implementation plan |
| `handoffs/HANDOFF_P[N].md` | Phase context document |
| `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` | Session start prompt |
| `REFLECTION_LOG.md` | Cumulative learnings |
| `MASTER_ORCHESTRATION.md` | Full phase workflows |

---

## Starting a Phase

1. Read orchestrator prompt: `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P[N].md`
3. Delegate tasks to sub-agents (DO NOT write code directly)
4. Verify with `bun run check --filter @beep/todox`
5. Update `REFLECTION_LOG.md`
6. Create handoffs for P[N+1]

---

## Agent Delegation Matrix

| Task Type | Agent | Usage |
|-----------|-------|-------|
| Codebase exploration | `Explore` | Understanding existing patterns |
| Effect documentation | `mcp-researcher` | Effect API questions |
| Source code writing | `effect-code-writer` | ALL implementation |
| Test writing | `test-writer` | ALL tests |
| Error fixing | `package-error-fixer` | TypeScript errors |

---

## Need Help?

- Full spec: [README.md](./README.md)
- Phase workflows: [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- Agent prompts: [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
- Evaluation: [RUBRICS.md](./RUBRICS.md)
- Learnings: [REFLECTION_LOG.md](./REFLECTION_LOG.md)
