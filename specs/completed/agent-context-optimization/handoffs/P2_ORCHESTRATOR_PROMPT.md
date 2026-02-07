# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the `agent-context-optimization` spec.

### Context

Phase 1 (Git Subtree Setup) is complete. The Effect repository is now available at `.repos/effect/`.

*[P1 orchestrator: Add specific P1 results here]*

### Your Mission

Generate best practices documentation for heavily-used Effect modules.

### Tasks

1. **Analyze module usage** (delegate to codebase-researcher)
   - Which Effect modules are imported most frequently?
   - What patterns are used for each module?

2. **Generate Tier 1 context files** (delegate to doc-writer)
   - `context/effect/Effect.md`
   - `context/effect/Schema.md`
   - `context/effect/Layer.md`
   - `context/effect/Context.md`

3. **Generate Tier 2-3 context files** (delegate to doc-writer)
   - Stream, Array, Option, Either, Match
   - DateTime, String, Struct, Record, Predicate

4. **Generate Platform context files** (delegate to doc-writer)
   - `context/platform/FileSystem.md`
   - `context/platform/HttpClient.md`
   - `context/platform/Command.md`

5. **Create master index** (delegate to doc-writer)
   - `context/INDEX.md` linking all files

### Context File Template

```markdown
# [Module Name] — Agent Context

> Best practices for using `effect/[Module]` in this codebase.

## Quick Reference
[Commonly used functions with examples]

## Codebase Patterns
[How this module is used in beep-effect]

## Anti-Patterns
[What NOT to do]

## Related Modules
[Links to related context files]

## Source Reference
[Link to .repos/effect/packages/effect/src/[Module].ts]
```

### Verification

```bash
# Context files created
ls context/effect/
ls context/platform/

# Index exists
cat context/INDEX.md

# Build passes
bun run check
```

### Success Criteria

- [ ] 20+ context files created
- [ ] Master index links all files
- [ ] Files follow template structure
- [ ] `bun run check` passes
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Read full context in: `specs/agent-context-optimization/handoffs/HANDOFF_P2.md`

### On Completion

Create:
1. Update `handoffs/HANDOFF_P3.md` with P2 results
2. Verify `handoffs/P3_ORCHESTRATOR_PROMPT.md` is ready
