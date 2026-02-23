# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the `agent-context-optimization` spec.

### Context

Phase 2 (Module Context Generation) is complete. Context files exist at `context/`.

*[P2 orchestrator: Add specific P2 results here]*

### Your Mission

Enhance root AGENTS.md with comprehensive navigation to all agent resources.

### Tasks

1. **Audit current AGENTS.md** (delegate to codebase-researcher)
   - What sections currently exist?
   - What navigation is missing?
   - How do package-level AGENTS.md files reference root?

2. **Design index structure** (orchestrator direct)
   - Context Navigation section layout
   - Category organization for skills
   - Status grouping for specs

3. **Update AGENTS.md** (delegate to doc-writer)
   - Add Context Navigation section
   - Link all `context/*.md` files
   - Organize skills by category
   - List active/complete specs

4. **Update package AGENTS.md files** (delegate to agents-md-updater)
   - Add cross-references to root index
   - Link relevant context files

### Index Structure

```markdown
## Context Navigation

### Library Reference
| Library | Subtree | Key Modules |
|---------|---------|-------------|
| Effect | `.repos/effect/` | [Effect](context/effect/Effect.md), [Schema](context/effect/Schema.md), ... |

### Skills by Category
| Category | Skills | When to Use |
|----------|--------|-------------|
| Domain Modeling | domain-modeling, pattern-matching | Creating entities, ADTs |
| Services | service-implementation, layer-design | Building services |

### Specs by Status
| Status | Specs |
|--------|-------|
| Active | [agent-context-optimization](specs/agent-context-optimization/) |
```

### Verification

```bash
# Context Navigation exists
grep "Context Navigation" AGENTS.md

# Links work (manual verification)
# Check markdown links resolve

# Build passes
bun run check
```

### Success Criteria

- [ ] Context Navigation section added
- [ ] All context files linked
- [ ] Skills linked by category
- [ ] Specs linked by status
- [ ] `bun run check` passes
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Read full context in: `specs/agent-context-optimization/handoffs/HANDOFF_P3.md`

### On Completion

Create:
1. Update `handoffs/HANDOFF_P4.md` with P3 results
2. Verify `handoffs/P4_ORCHESTRATOR_PROMPT.md` is ready
