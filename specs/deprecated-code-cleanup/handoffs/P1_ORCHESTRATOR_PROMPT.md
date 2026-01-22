# Phase 1 Orchestrator Prompt - Discovery & Impact Analysis

Copy-paste this prompt to start Phase 1 of the deprecated-code-cleanup spec.

---

## Prompt

You are executing Phase 1 (Discovery & Impact Analysis) of the deprecated-code-cleanup spec.

### Context

The beep-effect monorepo contains deprecated code that needs to be removed. Before deletion, all usages must be migrated to non-deprecated alternatives.

**Spec Location**: `specs/deprecated-code-cleanup/README.md`

### Your Mission

Produce a comprehensive usage analysis of all deprecated exports. This analysis will guide Phase 2 (Migration).

### Tasks

1. **Find all usages of deprecated `@beep/types` exports**:
   - `IfAny`, `IfNever`, `IfNull`, `IfUnknown`, `IfEmptyObject`
   - `ReadonlyTuple`
   - `Opaque`, `UnwrapOpaque`

2. **Find all usages of deprecated `@beep/testkit` exports**:
   - `PlaywrightPageService.click()` method

3. **Find all usages of deprecated `@beep/build-utils` exports**:
   - `PluginOptions.subdomainPrefix`

4. **Find all usages of deprecated `@beep/utils` exports**:
   - `collectUniqueDependencies()`

5. **Document the dependency graph**:
   - Which packages import from `@beep/types`?
   - Are there circular dependencies that affect migration order?

6. **Identify test files** using deprecated code (they need migration too)

### Output Format

Create `specs/deprecated-code-cleanup/outputs/usage-analysis.md` with:

```markdown
# Deprecated Code Usage Analysis

## Summary

- Total deprecated exports: [N]
- Total files with usages: [N]
- Packages affected: [list]

## Detailed Usages by Deprecated Item

### IfAny (packages/common/types/src/if-any.ts)

**Usage Count**: [N]

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| path/to/file.ts | 42 | `type Foo = IfAny<T, A, B>` | Simple |

**Migration Notes**: [Any special considerations]

### [Repeat for each deprecated item...]

## Recommended Migration Order

1. [Package] - [Reason]
2. [Package] - [Reason]
...

## Blockers & Risks

- [Any issues discovered]
```

### Verification

After completing Phase 1:
- [ ] `outputs/usage-analysis.md` exists
- [ ] All 11 deprecated items documented
- [ ] Usage counts are accurate
- [ ] Migration order is specified

### Next Phase

After completing this phase, create `handoffs/HANDOFF_P2.md` and `handoffs/P2_ORCHESTRATOR_PROMPT.md` for the migration phase.

### Reference

Read full spec context in: `specs/deprecated-code-cleanup/README.md`
