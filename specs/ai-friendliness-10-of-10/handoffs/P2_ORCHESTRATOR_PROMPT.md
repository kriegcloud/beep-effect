# P2 Orchestrator Prompt

Copy and paste this prompt to start a new session for Phase 2.

---

## Prompt

You are implementing Phase 2 (Error Catalog Population) of the ai-friendliness-10-of-10 spec.

### Context from P1

Phase 1 (ai-context.md Generation) completed successfully:
- 62 ai-context.md files created (100% coverage)
- All follow template format with frontmatter, architecture diagrams, usage patterns
- Quality ~7-8/10 average

### Your Mission

Populate the error catalog with 50+ structured error patterns in 10 categories:

| Category | Target | Priority |
|----------|--------|----------|
| Schema/Type | 8-10 | High |
| Service/Layer | 6-8 | High |
| EntityId | 4-6 | High |
| Database/SQL | 5-7 | Medium |
| Import/Module | 5-6 | Medium |
| Testing | 4-6 | Medium |
| Build/Config | 4-5 | Medium |
| Runtime | 4-5 | Medium |
| API/RPC | 3-4 | Low |
| Effect Patterns | 4-6 | High |

### Template (from templates/error-catalog.template.yaml)

```yaml
errors:
  - id: ERR-XXX
    category: [category]
    pattern: "regex pattern to match error"
    message: Human-readable error description
    cause: Why this error occurs
    fix:
      - Step 1 to fix
      - Step 2 to fix
    examples:
      - input: |
          # Code that triggers the error
        output: "Error message that appears"
    tags: [tag1, tag2]
```

### Reference Files

- Error patterns: `specs/ai-friendliness-10-of-10/outputs/error-patterns.md`
- Template: `specs/ai-friendliness-10-of-10/templates/error-catalog.template.yaml`
- Effect rules: `.claude/rules/effect-patterns.md`
- Code standards: `.claude/rules/code-standards.md`
- Full handoff: `specs/ai-friendliness-10-of-10/handoffs/HANDOFF_P2.md`

### Execution Pattern

Spawn 5 parallel agents by category group:

1. **Agent 1**: Schema/Type + EntityId patterns
2. **Agent 2**: Service/Layer + Effect Patterns
3. **Agent 3**: Database/SQL + Build/Config
4. **Agent 4**: Testing + Runtime
5. **Agent 5**: Import/Module + API/RPC

Each agent writes to: `outputs/error-catalog-[group].yaml`

Final step: Merge all into `outputs/error-catalog.yaml`

### Quality Gates

```bash
# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml'))"

# Count patterns
grep -c "^  - id:" specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml
```

### Success Criteria

- [ ] 50+ error patterns total
- [ ] All 10 categories populated
- [ ] YAML validates
- [ ] Each has working example
- [ ] REFLECTION_LOG.md updated

### After Completion

1. Update `specs/ai-friendliness-10-of-10/REFLECTION_LOG.md` with P2 entry
2. Create `handoffs/HANDOFF_P3.md` for rules enhancement phase
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`

---

## Agent Delegation Pattern

When spawning agents for error catalog population:

```
Task: Populate error catalog for [Category Group]

<contextualization>
Categories: [Category1, Category2]
Target patterns: [N] patterns
Template: specs/ai-friendliness-10-of-10/templates/error-catalog.template.yaml

Source material:
- Read: specs/ai-friendliness-10-of-10/outputs/error-patterns.md (filter for these categories)
- Read: .claude/rules/effect-patterns.md (for Effect-specific errors)
- Read: .claude/rules/code-standards.md (for code violations)
</contextualization>

Write YAML entries to: specs/ai-friendliness-10-of-10/outputs/error-catalog-[group].yaml
```
