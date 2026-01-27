# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Discovery) of the lexical-utils-effect-refactor spec.

### Context

Phase 0 (Scaffolding) is complete. The spec structure has been created with:
- README.md documenting refactoring requirements
- MASTER_ORCHESTRATION.md with the 6-phase workflow
- AGENT_PROMPTS.md with specialized sub-agent prompts
- 10 files identified for refactoring in `apps/todox/src/app/lexical/utils/`

### Your Mission

Gather comprehensive context by delegating to specialized sub-agents:

1. **Launch codebase-researcher** to analyze all 10 utility files
2. **Launch mcp-researcher** to document Effect APIs needed for transformation

Both agents can run in parallel.

### Critical Patterns

**Delegation is MANDATORY** - Do NOT read files directly. Use sub-agents.

**codebase-researcher prompt** (from AGENT_PROMPTS.md):
```
Analyze all utility files in apps/todox/src/app/lexical/utils/
For EACH file document: native String methods, native Array methods,
native collections, async/Promise patterns, null/undefined handling,
error handling, external dependencies.
Output: outputs/codebase-analysis.md
```

**mcp-researcher prompt** (from AGENT_PROMPTS.md):
```
Research Effect documentation for: effect/Stream (async generator replacement),
effect/HashSet (Set replacement), effect/String, effect/Array, effect/Option,
effect/Predicate, effect/Schema (S.pattern for regex).
Output: outputs/effect-api-research.md
```

### Reference Files

- Full prompts: `specs/lexical-utils-effect-refactor/AGENT_PROMPTS.md`
- Workflow: `specs/lexical-utils-effect-refactor/MASTER_ORCHESTRATION.md`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Verification

After sub-agents complete:
1. Verify both output files exist in `specs/lexical-utils-effect-refactor/outputs/`
2. Cross-check: every native pattern has a documented Effect replacement
3. Identify any gaps or risks

### Success Criteria

- [ ] `outputs/codebase-analysis.md` created with all 10 files analyzed
- [ ] `outputs/effect-api-research.md` created with all required APIs
- [ ] No native pattern without a documented replacement
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] HANDOFF_P2.md created
- [ ] P2_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/lexical-utils-effect-refactor/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P2.md` (context document)
3. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
