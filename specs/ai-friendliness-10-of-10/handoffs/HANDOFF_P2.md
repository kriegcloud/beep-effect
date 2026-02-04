# Handoff: P1 → P2 (Error Catalog Population)

**From**: P1 Generation Orchestrator
**To**: P2 Error Catalog Orchestrator
**Date**: 2026-02-04

---

## Executive Summary

Phase 1 (ai-context.md Generation) is complete:

| Metric | Value | Notes |
|--------|-------|-------|
| ai-context.md files created | 62 | 100% coverage |
| Template compliance | 100% | All follow standard format |
| Execution time | ~12 min | Highly parallelized |
| Quality | ~7-8/10 average | Higher for good AGENTS.md sources |

---

## P1 Outputs

All 62 ai-context.md files are now in place:

**Distribution**:
- packages/shared/* - 8 files
- packages/common/* - 8 files
- packages/runtime/* - 2 files
- packages/iam/* - 5 files
- packages/documents/* - 5 files
- packages/calendar/* - 5 files
- packages/knowledge/* - 5 files
- packages/comms/* - 5 files
- packages/customization/* - 5 files
- packages/ui/* - 4 files
- packages/_internal/* - 1 file
- apps/* - 4 files
- tooling/* - 5 files

---

## P2 Mission: Error Catalog Population

### Goal

Populate the error catalog at `specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml` with structured error patterns that enable:
- Agent self-diagnosis of common failures
- Automated fix suggestions
- Learning from past mistakes

### Source Material

1. **P0 Error Patterns** - `outputs/error-patterns.md` contains 45 patterns:
   - Schema/Type errors (8)
   - Service/Layer errors (6)
   - EntityId errors (4)
   - Database/SQL errors (5)
   - Import/Module errors (5)
   - Testing errors (4)
   - Build/Config errors (4)
   - Runtime errors (4)
   - API/RPC errors (3)
   - Effect pattern errors (2)

2. **Error Template** - `templates/error-catalog.template.yaml`:
   ```yaml
   errors:
     - id: ERR-001
       category: schema
       pattern: "Property '(.+)' is missing in type"
       message: Schema validation failed - missing required property
       cause: Schema definition doesn't match data structure
       fix:
         - Check schema definition for required fields
         - Ensure data matches schema shape
       examples:
         - input: |
             const User = S.Struct({ name: S.String, age: S.Number })
             S.decodeSync(User)({ name: "Alice" })  // Missing age
           output: "Property 'age' is missing in type"
       tags: [schema, validation, typescript]
   ```

3. **REFLECTION_LOG.md** - Contains real failure patterns from spec execution

### Error Categories to Populate

| Category | Target Count | Source |
|----------|--------------|--------|
| Schema/Type | 8-10 | P0 patterns, Schema usage in packages |
| Service/Layer | 6-8 | Effect Layer composition errors |
| EntityId | 4-6 | Branded ID validation failures |
| Database/SQL | 5-7 | Drizzle, transaction errors |
| Import/Module | 5-6 | Path alias, circular dependency |
| Testing | 4-6 | @beep/testkit patterns |
| Build/Config | 4-5 | TypeScript, Turborepo errors |
| Runtime | 4-5 | Effect.runPromise, unhandled errors |
| API/RPC | 3-4 | HTTP, WebSocket patterns |
| Effect Patterns | 4-6 | Common Effect anti-patterns |

**Total target**: 50-60 error patterns

### Execution Approach

**Recommended**: 5 parallel agents by category group:

1. **Agent 1**: Schema/Type + EntityId (12-16 patterns)
2. **Agent 2**: Service/Layer + Effect Patterns (10-14 patterns)
3. **Agent 3**: Database/SQL + Build/Config (9-12 patterns)
4. **Agent 4**: Testing + Runtime (8-11 patterns)
5. **Agent 5**: Import/Module + API/RPC (8-10 patterns)

Each agent:
1. Read `outputs/error-patterns.md` for their categories
2. Read relevant AGENTS.md files for additional patterns
3. Generate YAML entries following template
4. Write to a temporary file: `outputs/error-catalog-[category].yaml`
5. Final merge into `outputs/error-catalog.yaml`

### Quality Gates

1. **YAML validity** - All entries parse correctly
2. **Required fields** - id, category, pattern, message, cause, fix, examples
3. **Pattern uniqueness** - No duplicate error IDs
4. **Fix actionability** - Each fix should be concrete and testable

---

## Files to Reference

| File | Purpose |
|------|---------|
| `outputs/error-patterns.md` | P0's 45 extracted patterns |
| `templates/error-catalog.template.yaml` | YAML format template |
| `REFLECTION_LOG.md` | Real failure examples |
| `.claude/rules/effect-patterns.md` | Common Effect mistakes |
| `.claude/rules/code-standards.md` | Code quality violations |

---

## Success Criteria

- [ ] 50+ error patterns in catalog
- [ ] All 10 categories populated
- [ ] YAML validates without errors
- [ ] Each pattern has working example
- [ ] REFLECTION_LOG.md updated with P2 entry

---

## Next Handoff

After P2 completion, create:
- `handoffs/HANDOFF_P3.md` - For rules enhancement phase
- `handoffs/P3_ORCHESTRATOR_PROMPT.md` - For next orchestrator
