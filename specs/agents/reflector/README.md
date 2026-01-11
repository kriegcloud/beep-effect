# Reflector Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/reflector.md` (300-400 lines)

---

## Purpose

Create a specialized agent that analyzes reflection logs and generates meta-learnings to improve future spec executions. The reflector is foundational to the self-improving spec workflow, enabling continuous methodology improvement.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- Meta-learning extraction from `REFLECTION_LOG.md` files
- Pattern identification across spec phases
- Prompt refinement recommendations
- Documentation update suggestions

### Out of Scope
- Implementing automated reflection (agent suggests, user applies)
- Modifying existing agents
- Cross-spec analysis tools (future enhancement)

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/reflector.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 300-400 lines
- [ ] All referenced files exist and are accessible
- [ ] Code examples use Effect patterns (no async/await)
- [ ] Output format compatible with META_SPEC_TEMPLATE
- [ ] Tested with sample reflection log analysis

---

## Agent Capabilities

### Core Functions
1. **Parse REFLECTION_LOG.md** - Extract structured learnings from spec reflection logs
2. **Identify Patterns** - Find recurring successes/failures across phases
3. **Generate Improvements** - Propose prompt refinements and documentation updates
4. **Create Meta-Reflection** - Synthesize findings into actionable document

### Knowledge Sources
- `specs/*/REFLECTION_LOG.md` - All spec reflection logs
- `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` - Reference implementation
- `specs/SPEC_CREATION_GUIDE.md` - Agent-assisted spec workflow
- `CLAUDE.md` - Repository guidelines

### Output Format
```markdown
# Meta-Reflection: [Spec Name]

## Pattern Analysis
### Recurring Successes (Keep Doing)
### Recurring Failures (Stop Doing)
### Emerging Patterns (Start Doing)

## Prompt Refinements
[Before/After prompt improvements]

## Documentation Updates
[Suggested changes to CLAUDE.md, AGENTS.md, etc.]

## Cumulative Learnings
[Integration with existing reflection logs]
```

---

## Research Phase

Before creating the agent definition, research:

### 1. Existing Reflection Patterns
- Read `specs/ai-friendliness-audit/REFLECTION_LOG.md` for structure examples
- Identify common "What Worked" / "What Didn't Work" patterns
- Note how prompt refinements are documented

### 2. Agent Template Requirements
- Read `.claude/agents/templates/agents-md-template.md` for structure
- Review existing agents like `effect-researcher.md` for examples
- Identify required frontmatter fields

### 3. Integration Points
- How does reflector output feed into handoff documents?
- Where should meta-reflections be saved?
- How to handle cross-spec pattern analysis?

---

## Implementation Plan

### Phase 1: Research (Read-only)
1. Read all existing REFLECTION_LOG.md files in specs/
2. Analyze agent template structure
3. Document common reflection patterns
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design agent workflow methodology
2. Define output format with examples
3. Specify knowledge sources and tools
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition following template
2. Validate all file references
3. Test with sample task
4. Output: `.claude/agents/reflector.md`

### Phase 4: Validate
1. Run agent on existing REFLECTION_LOG.md
2. Verify output format matches spec
3. Check integration with handoff workflow
4. Update REFLECTION_LOG.md with learnings

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/REFLECTION_LOG.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

### Existing Agents for Reference
- `.claude/agents/effect-researcher.md` - Research methodology example
- `.claude/agents/prompt-refiner.md` - Prompt improvement patterns

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/reflector.md
wc -l .claude/agents/reflector.md

# Verify no async/await in examples
grep -i "async\|await" .claude/agents/reflector.md && echo "FAIL" || echo "PASS"

# Check frontmatter
head -20 .claude/agents/reflector.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [ai-friendliness-audit](../../ai-friendliness-audit/README.md) - Reflection protocol reference
- [SPEC_CREATION_GUIDE](../../SPEC_CREATION_GUIDE.md) - Agent-assisted spec workflow
