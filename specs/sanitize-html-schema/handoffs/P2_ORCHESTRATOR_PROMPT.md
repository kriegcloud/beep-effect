# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 Design.

---

## Prompt

You are implementing Phase 2 (Design) of the sanitize-html-schema spec.

### Context

Phase 1 Discovery is complete. The sanitize-html module has been fully mapped:
- 27+ SanitizeOptions fields documented in `outputs/options-matrix.md`
- Type inventory in `outputs/types-inventory.md`
- 5 fields use `false = allow all` pattern
- 4 callback fields cannot serialize
- 2 fields use RegExp

### Your Mission

Design the complete Effect Schema architecture for the sanitize module.

### Pre-Work (do this first)

Read the @beep/schema utility files to understand existing patterns:
```
packages/common/schema/src/core/generics/tagged-class.ts
packages/common/schema/src/core/generics/tagged-union.ts
packages/common/schema/src/core/generics/tagged-struct.ts
```

### Tasks (use agents)

1. **AllowedTags Design** (effect-schema-expert)
   - Design S.TaggedStruct union: AllTags | NoneTags | SpecificTags
   - Integrate with HtmlTag literal-kit
   - Write to: `specs/sanitize-html-schema/outputs/design-allowed-tags.md`

2. **AllowedAttributes Design** (effect-schema-expert)
   - Design S.TaggedStruct union with wildcard `*` support
   - Handle AllowedAttribute union type
   - Write to: `specs/sanitize-html-schema/outputs/design-allowed-attributes.md`

3. **SanitizeConfig Design** (effect-schema-expert)
   - Design S.Class with all 27+ options
   - Use discriminated unions for variant types
   - Document callback/RegExp handling decisions
   - Write to: `specs/sanitize-html-schema/outputs/design-sanitize-config.md`

4. **SanitizedHtml Brand Design** (effect-schema-expert)
   - Design branded string output type
   - Write to: `specs/sanitize-html-schema/outputs/design-sanitized-html.md`

5. **Factory Function Research** (mcp-researcher)
   - Research S.transform and S.transformOrFail patterns
   - Document error handling approaches
   - Write to: `specs/sanitize-html-schema/outputs/design-factory.md`

### Critical Patterns

- Use @beep/schema utilities (BS.TaggedStruct, etc.) over raw Effect Schema
- Follow existing literal-kit patterns from `@beep/schema/integrations/html`
- All designs should include TypeScript code examples
- Document decision rationale for each design

### Reference Files

- Phase 1 outputs: `specs/sanitize-html-schema/outputs/`
- Full handoff: `specs/sanitize-html-schema/handoffs/HANDOFF_P2.md`
- Agent prompts: `specs/sanitize-html-schema/AGENT_PROMPTS.md`
- Literal-kits: `packages/common/schema/src/integrations/html/literal-kits/`

### Key Decisions to Make

1. **Callback fields**: Exclude from schema or placeholder type?
2. **RegExp fields**: Store as `{source, flags}` or string pattern?
3. **Wildcard key**: Special variant or literal `*` in Record?

### Verification

After each task:
```bash
ls specs/sanitize-html-schema/outputs/design-*.md
```

### Success Criteria

- [ ] 5 design files created in outputs/
- [ ] All discriminated unions fully specified
- [ ] SanitizeConfig covers all 27+ fields
- [ ] Callback and RegExp handling documented
- [ ] Factory function approach designed
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/sanitize-html-schema/handoffs/HANDOFF_P2.md`
