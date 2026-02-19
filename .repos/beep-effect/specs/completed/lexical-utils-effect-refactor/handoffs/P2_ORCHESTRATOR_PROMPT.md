# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 (Evaluation) of the lexical-utils-effect-refactor spec.

### Context

Phase 1 (Discovery) is complete. Two research documents have been generated:
- `outputs/codebase-analysis.md` - Analysis of all 10 utility files
- `outputs/effect-api-research.md` - Effect API documentation for refactoring

Key findings:
- 499 LOC across 10 files
- 6 native string methods, 8 native array methods, 8 collection ops, 9 async patterns
- Effect API gaps: `Str.replace()` not available, `Str.split()` no regex support, no WeakMap equivalent

### Your Mission

Validate the refactoring approach by delegating to specialized sub-agents:

1. **Launch architecture-pattern-enforcer** to validate import conventions and boundaries
2. **Launch code-reviewer** to validate transformation patterns

Both agents can run in parallel.

### Critical Patterns

**Delegation is MANDATORY** - Do NOT read files directly. Use sub-agents.

**architecture-pattern-enforcer prompt** (from AGENT_PROMPTS.md):
```
Validate the proposed Lexical Utils refactoring approach against repository patterns.

Check these requirements:

1. **Import Conventions** (.claude/rules/effect-patterns.md)
   - Namespace imports: import * as Effect from "effect/Effect"
   - Single-letter aliases: A, Str, O, P, S
   - No named imports from effect modules

2. **Schema Location**
   - Schemas should go in apps/todox/src/app/lexical/schema/
   - Follow existing patterns in schemas.ts
   - Use $TodoxId for annotations

3. **No Cross-Boundary Imports**
   - Utils should not import from other slices
   - Should only import from: effect/*, @lexical/*, @beep/identity, local schema directory

4. **File Organization**
   - One schema file per domain (url.schema.ts, docHash.schema.ts)
   - Barrel exports in index.ts
   - No circular dependencies

5. **Effect Pattern Compliance**
   - No async/await in final code
   - No native collections (Set, Map)
   - No native string/array methods
   - All errors as tagged errors (not throw)

Output: outputs/architecture-review.md with PASS/FAIL for each check
```

**code-reviewer prompt** (from AGENT_PROMPTS.md):
```
Review the proposed Effect transformations for the Lexical Utils refactor.

Read the transformation patterns in specs/lexical-utils-effect-refactor/AGENT_PROMPTS.md
and validate against the codebase analysis in specs/lexical-utils-effect-refactor/outputs/codebase-analysis.md.

Validate these transformation patterns:

1. async/await -> Effect.gen with yield*
2. Set -> HashSet
3. null checks -> Option or Predicate
4. Array methods -> A.* functions
5. JSON.parse -> S.decodeUnknownSync

For each transformation:
- Confirm the pattern is correct
- Identify any edge cases
- Note any adjustments needed

Output: outputs/code-quality-review.md
```

### Reference Files

- Phase 1 outputs: `specs/lexical-utils-effect-refactor/outputs/`
- Full prompts: `specs/lexical-utils-effect-refactor/AGENT_PROMPTS.md`
- Workflow: `specs/lexical-utils-effect-refactor/MASTER_ORCHESTRATION.md`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Verification

After sub-agents complete:
1. Verify both output files exist in `specs/lexical-utils-effect-refactor/outputs/`
2. Check for any FAIL results in architecture review
3. Check for any blocking issues in code quality review
4. If issues found, document mitigations

### Success Criteria

- [ ] `outputs/architecture-review.md` created with all checks
- [ ] `outputs/code-quality-review.md` created with all checks
- [ ] No blocking architectural issues (or mitigations documented)
- [ ] Transformation patterns approved
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] HANDOFF_P3.md created
- [ ] P3_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/lexical-utils-effect-refactor/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P3.md` (context document)
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
