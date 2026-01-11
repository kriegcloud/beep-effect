# Codebase Researcher Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/codebase-researcher.md` (350-450 lines)

---

## Purpose

Create a specialized agent for systematic codebase exploration that maps dependencies, identifies existing patterns, and provides architectural context for implementation tasks.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- File discovery via glob patterns
- Import graph analysis
- Pattern identification from existing implementations
- Architectural boundary mapping

### Out of Scope
- Modifying discovered code
- Cross-repository analysis
- Runtime behavior analysis

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/codebase-researcher.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 350-450 lines
- [ ] All referenced files exist and are accessible
- [ ] Methodology uses Glob and Grep tools effectively
- [ ] Output format compatible with spec workflow
- [ ] Tested with sample codebase exploration task

---

## Agent Capabilities

### Core Functions
1. **Discover Files** - Find relevant files via glob patterns
2. **Analyze Imports** - Map dependency relationships
3. **Identify Patterns** - Extract existing implementation patterns
4. **Map Architecture** - Document package boundaries and layers

### Knowledge Sources
- Repository structure (via `Glob` tool)
- Import statements (via `Grep` tool)
- AGENTS.md files across packages
- `documentation/PACKAGE_STRUCTURE.md`

### Output Format
```markdown
# Codebase Research: [Feature/Task Name]

## Relevant Files
| File | Purpose | Dependencies |
|------|---------|--------------|

## Existing Patterns
### Pattern: [Name]
[Code example from codebase]

## Architectural Boundaries
[Package boundaries, layer constraints]

## Recommendations
[Which patterns to follow, which to avoid]
```

---

## Research Phase

Before creating the agent definition, research:

### 1. Existing Exploration Patterns
- How do current agents discover files?
- What glob patterns are most effective?
- How is import analysis performed?

### 2. Architecture Documentation
- Read `documentation/PACKAGE_STRUCTURE.md`
- Understand vertical slice structure
- Document layer dependency rules

### 3. Tool Usage Patterns
- Glob tool capabilities and limitations
- Grep tool for import analysis
- Read tool for pattern extraction

---

## Implementation Plan

### Phase 1: Research
1. Review existing codebase exploration in other agents
2. Document effective glob patterns
3. Analyze import analysis techniques
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design exploration methodology
2. Define output format with examples
3. Specify tool usage patterns
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Validate all file references
3. Test with sample exploration task
4. Output: `.claude/agents/codebase-researcher.md`

### Phase 4: Validate
1. Run agent on real codebase exploration
2. Verify output accuracy
3. Update REFLECTION_LOG.md

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/PACKAGE_STRUCTURE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

### Existing Patterns for Reference
- Package-level AGENTS.md files
- Vertical slice structure in `packages/iam/*`

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/codebase-researcher.md
wc -l .claude/agents/codebase-researcher.md

# Verify no async/await in examples
grep -i "async\|await" .claude/agents/codebase-researcher.md && echo "FAIL" || echo "PASS"
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [reflector](../reflector/README.md) - Meta-learning agent
