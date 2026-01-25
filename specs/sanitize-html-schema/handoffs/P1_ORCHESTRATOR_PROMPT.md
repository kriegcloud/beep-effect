# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 Discovery.

---

## Prompt

You are implementing Phase 1 (Discovery) of the sanitize-html-schema spec.

### Context

A spec has been created to refactor the `sanitize-html` module from `@beep/utils` into an Effect Schema-driven architecture at `@beep/schema/integrations/html/sanitize`. Phase 0 (Scaffolding) is complete with full documentation.

### Your Mission

Gather all context needed for schema design by analyzing the existing sanitize-html implementation.

### Tasks (use agents)

1. **Type Inventory** (codebase-researcher)
   - Analyze `packages/common/utils/src/sanitize-html/types.ts`
   - Document all interfaces and their fields
   - Identify union types using `false` to mean "allow all"
   - Output: `specs/sanitize-html-schema/outputs/types-inventory.md`

2. **Options Matrix** (codebase-researcher)
   - Document all 27 SanitizeOptions fields
   - Include default values from `defaults.ts`
   - Mark which use `false` = allow all pattern
   - Output: `specs/sanitize-html-schema/outputs/options-matrix.md`

3. **Dependency Graph** (codebase-researcher)
   - Map filter, parser, URL validator dependencies
   - Identify shared utilities
   - Output: `specs/sanitize-html-schema/outputs/dependency-graph.md`

4. **Literal Kit Gaps** (codebase-researcher)
   - Compare literal-kits vs defaults.ts requirements
   - List missing tags/attributes/schemes
   - Output: `specs/sanitize-html-schema/outputs/literal-kit-gaps.md`

5. **S.TaggedClass Patterns** (effect-schema-expert)
   - Find existing usage in codebase
   - Document union patterns with/without payload
   - Include in codebase-context summary

### Critical Patterns

- Use codebase-researcher for file analysis (delegate, don't read directly)
- Focus on DATA GATHERING, not design decisions
- Document uncertainties for Phase 2

### Reference Files

- Spec README: `specs/sanitize-html-schema/README.md`
- Full handoff: `specs/sanitize-html-schema/handoffs/HANDOFF_P1.md`
- Agent prompts: `specs/sanitize-html-schema/AGENT_PROMPTS.md`

### Verification

After each task:
```bash
ls specs/sanitize-html-schema/outputs/
```

### Success Criteria

- [ ] 4 output files created in outputs/
- [ ] All 27 SanitizeOptions fields documented
- [ ] Literal-kit gaps identified
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] HANDOFF_P2.md and P2_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/sanitize-html-schema/handoffs/HANDOFF_P1.md`
