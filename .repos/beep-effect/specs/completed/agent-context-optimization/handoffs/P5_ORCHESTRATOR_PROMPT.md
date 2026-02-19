# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 of the `agent-context-optimization` spec.

### Context

Phase 4 (Validation & Refinement) is complete. The spec has 21 context files, but the gap analysis identified 12 additional high/medium-priority modules.

**P4 Results:**
- 21 context files (5 Tier 1, 7 Tier 2, 6 Tier 3, 3 Platform)
- Maintenance workflow documented
- Review score: 8.5/10
- Build: 112/112 tasks pass

### Your Mission

Generate context files for the remaining 12 high/medium-priority Effect modules.

### Target Modules

| Priority | Modules |
|----------|---------|
| High | `ParseResult`, `SchemaAST`, `Redacted`, `HashMap` |
| Medium | `Order`, `MutableHashMap`, `MutableHashSet`, `HashSet`, `Number`, `Encoding`, `Config`, `Schedule` |

### Tasks

1. **Generate High-Priority Modules** (delegate to doc-writer)
   - `context/effect/ParseResult.md` - Schema parsing, validation errors
   - `context/effect/SchemaAST.md` - Schema internals, custom transformations
   - `context/effect/Redacted.md` - Sensitive data handling
   - `context/effect/HashMap.md` - Immutable hash maps

2. **Generate Medium-Priority Modules** (delegate to doc-writer)
   - `context/effect/Order.md` - Ordering, sorting
   - `context/effect/HashSet.md` - Immutable sets
   - `context/effect/MutableHashMap.md` - Mutable maps, caching
   - `context/effect/MutableHashSet.md` - Mutable sets
   - `context/effect/Number.md` - Number utilities
   - `context/effect/Encoding.md` - Base64, hex encoding
   - `context/effect/Config.md` - Configuration management
   - `context/effect/Schedule.md` - Retry, recurring effects

3. **Update Indexes** (direct execution)
   - Update `context/INDEX.md` with new modules in appropriate tiers
   - Update `AGENTS.md` Context Navigation section

4. **Build Verification** (direct execution)
   - Run `bun run check`

### Parallelization Strategy

Spawn 4 doc-writer agents simultaneously:

```
Agent 1: ParseResult, SchemaAST, Redacted
Agent 2: HashMap, Order, HashSet
Agent 3: MutableHashMap, MutableHashSet, Number
Agent 4: Encoding, Config, Schedule
```

### Tier Assignments

| Module | Tier | Rationale |
|--------|------|-----------|
| ParseResult | Tier 2 | Common with Schema.decode |
| SchemaAST | Tier 3 | Advanced, internals |
| Redacted | Tier 2 | Security-critical |
| HashMap | Tier 2 | Core data structure |
| Order | Tier 3 | Utility for sorting |
| HashSet | Tier 3 | Set operations |
| MutableHashMap | Tier 3 | Performance patterns |
| MutableHashSet | Tier 3 | Performance patterns |
| Number | Tier 3 | Utility |
| Encoding | Tier 3 | Serialization |
| Config | Tier 2 | Service configuration |
| Schedule | Tier 2 | Resilience patterns |

### Template Reference

Follow the established template from existing context files:

```markdown
# Module: effect/[Name]

> Quick reference for AI agents working with effect/[Name]

## Quick Reference

| Operation | Example | Use Case |
|-----------|---------|----------|
| ... | ... | ... |

## Codebase Patterns

### Pattern 1: [Name]
[Description with code example from packages/]

## Anti-Patterns

### NEVER: [Bad Pattern]
[Why it's bad and what to do instead]

## Related Modules

- [Link to related context files]
```

### Validation Protocol

```bash
# 1. Verify new files exist
find context/effect -name "*.md" | wc -l  # Expect: 33+

# 2. Verify INDEX.md updated
grep -c "Tier 2" context/INDEX.md  # Should show increased count

# 3. Build Validation
bun run check
```

### Success Criteria

- [ ] 12 new context files created
- [ ] All files follow template structure
- [ ] INDEX.md updated (Tier counts: 5/11/12/3)
- [ ] AGENTS.md updated
- [ ] Total context files: 33+
- [ ] `bun run check` passes

### Handoff Document

Read full context in: `specs/agent-context-optimization/handoffs/HANDOFF_P5.md`

### On Completion

1. Update REFLECTION_LOG.md with Phase 5 entry
2. Update README.md if status changed
3. Update context/INDEX.md file count summary
4. Notify user of completion
