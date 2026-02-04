# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 of the `agent-context-optimization` spec.

### Context

Phase 3 (Index Enhancement) is complete. AGENTS.md now has Context Navigation.

*[P3 orchestrator: Add specific P3 results here]*

### Your Mission

Validate the complete system and refine based on testing.

### Tasks

1. **Test agent with new context** (manual testing)
   - Can agents find Effect patterns via subtree?
   - Are context files discoverable?
   - Does index navigation work?

2. **Identify missing context** (delegate to codebase-researcher)
   - What modules are used but not documented?
   - Are there pattern gaps?

3. **Generate missing context** (delegate to doc-writer)
   - Fill identified gaps
   - Update INDEX.md

4. **Final AGENTS.md review** (delegate to spec-reviewer)
   - Validate structure
   - Check all links
   - Output: `outputs/final-review.md`

5. **Document maintenance** (delegate to doc-writer)
   - Create `documentation/context-maintenance.md`
   - Include subtree update workflow
   - Include context refresh triggers

### Validation Protocol

```bash
# 1. Subtree Validation
ls .repos/effect/packages/effect/src/Effect.ts
grep -l "flatMap" .repos/effect/packages/effect/src/Effect.ts

# 2. Context Validation
find context/ -name "*.md" | wc -l  # Expect: 20+
cat context/INDEX.md

# 3. Index Validation
grep -A 20 "Context Navigation" AGENTS.md

# 4. Build Validation
bun run check
bun run test
```

### Success Criteria

- [ ] All subtrees accessible and searchable
- [ ] All context files linked and accurate
- [ ] AGENTS.md navigation complete
- [ ] Maintenance workflow documented
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] REFLECTION_LOG.md finalized

### Handoff Document

Read full context in: `specs/agent-context-optimization/handoffs/HANDOFF_P4.md`

### On Completion

1. Finalize REFLECTION_LOG.md with all learnings
2. Update README.md status: `🟡 Scaffolded` → `✅ Complete`
3. Promote validated patterns to `specs/_guide/PATTERN_REGISTRY.md` if scored 75+
4. Create summary for user
