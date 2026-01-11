# Spec Reviewer Agent Specification

## Purpose

The **spec-reviewer** agent thoroughly reviews specifications for structural integrity, organization quality, best practice adherence, and context engineering optimization. It validates specs against the SPEC_CREATION_GUIDE.md standards and identifies areas for improvement.

## Target Output

- **Agent Definition**: `.claude/agents/spec-reviewer.md` (400-500 lines)
- **Primary Function**: Review specs for completeness, structure, and context engineering quality

## Tier Classification

**Tier: Quality** — Validates spec structure and methodology quality

## Agent Capabilities

| Capability | Description |
|------------|-------------|
| Structure Validation | Verifies required files, directory layout, phase organization |
| Best Practice Enforcement | Checks adherence to SPEC_CREATION_GUIDE.md |
| Context Engineering Audit | Evaluates context efficiency, progressive disclosure, KV-cache friendliness |
| Handoff Protocol Verification | Validates multi-session continuity mechanisms |
| Reflection Quality Assessment | Reviews REFLECTION_LOG.md for actionable learnings |

## Success Criteria

- [ ] Agent validates all required spec files (README.md, REFLECTION_LOG.md)
- [ ] Agent detects missing complex spec files when appropriate
- [ ] Agent identifies context engineering anti-patterns
- [ ] Agent scores specs against measurable rubrics
- [ ] Agent provides actionable improvement recommendations
- [ ] Agent verifies handoff protocol completeness

## Phase Workflow

### Phase 1: Research (Read-only)
**Output**: `outputs/research-findings.md`
- Study SPEC_CREATION_GUIDE.md deeply
- Review ai-friendliness-audit META_SPEC_TEMPLATE.md
- Analyze 3+ existing specs for patterns
- Document validation criteria

### Phase 2: Design
**Output**: `outputs/agent-design.md`
- Define review rubrics (5 dimensions, 1-5 scoring)
- Design checklist structure
- Create output format templates
- Document context engineering heuristics

### Phase 3: Create
**Output**: `.claude/agents/spec-reviewer.md`
- Write agent definition with YAML frontmatter
- Include comprehensive methodology
- Add rubric reference
- Provide example outputs

### Phase 4: Validate
**Output**: Updated `REFLECTION_LOG.md`
- Test agent on 2-3 specs
- Verify detection accuracy
- Capture methodology learnings
- Refine prompts based on results

## Dependencies

### Required Reading
- `specs/SPEC_CREATION_GUIDE.md` — Core spec standards
- `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` — Template evolution pattern
- `.claude/agents/architecture-pattern-enforcer.md` — Review pattern reference
- `.claude/agents/code-reviewer.md` — Scoring methodology reference

### Tools Required
- Glob — File discovery
- Grep — Pattern search
- Read — File content analysis

## Key Reference: Context Engineering Best Practices

From external research, the agent should evaluate specs for:

1. **Hierarchical Context Structure** — System → Task → Tool → Memory layers
2. **Progressive Disclosure** — Root → links → details layering
3. **KV-Cache Friendliness** — Stable prefixes, append-only patterns
4. **Context Rot Prevention** — Appropriate document sizes, focused content
5. **Self-Improving Loops** — Reflection captures that feed back into methodology

## Verification Commands

```bash
# Verify spec-reviewer agent exists
ls -la .claude/agents/spec-reviewer.md

# Count lines (target 400-500)
wc -l .claude/agents/spec-reviewer.md

# Test on a sample spec
# (Manual: invoke spec-reviewer agent on specs/flexlayout-type-safety/)
```

## Related Agents

| Agent | Relationship |
|-------|-------------|
| architecture-pattern-enforcer | Similar review methodology for code structures |
| code-reviewer | Scoring pattern reference |
| reflector | Meta-learning integration |
| doc-writer | Output format standards |
