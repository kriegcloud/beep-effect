# Lexical Schemas - Quick Start

## Problem

The `contentRich` field in the Document model currently uses `S.Unknown`, accepting any JSON blob without validation. The Lexical editor produces a well-defined `SerializedEditorState` with a recursive tree structure (root → children → paragraphs → text nodes) that should be validated at runtime to catch malformed content early and provide type safety.

## Approach

Hybrid validation strategy: structural envelope schema at the domain layer (no Lexical dependency) to validate tree shape, plus discriminated union at the application layer for all 30+ node types. Domain ensures structural integrity, application ensures node-specific correctness.

## Phase Checklist

- [ ] P1: Domain envelope + model update (1 session)
- [ ] P2: Application discriminated union (1-2 sessions)
- [ ] P3: Integration + server validation (1 session)

## Quick Commands

```bash
# Start Phase 1
# Copy-paste: specs/pending/lexical-schemas/handoffs/P1_ORCHESTRATOR_PROMPT.md

# Verify after changes
bun run check --filter=@beep/documents-domain
bun run check --filter=@beep/documents-tables
bun run check --filter=@beep/todox

# Run tests
bun run test --filter=@beep/documents-domain
bun run test --filter=@beep/todox
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/documents/domain/src/entities/document/document.model.ts:25` | The `S.Unknown` field to replace |
| `apps/todox/src/app/lexical/schema/schemas.ts` | Existing base schemas for structural validation |
| `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` | All 30+ node types requiring discrimination |

## Execution Model

This spec uses swarm execution. See `handoffs/P1_ORCHESTRATOR_PROMPT.md` for the copy-paste orchestrator prompt.
