# COSTAR+CRISPE Prompt Template

This template combines two proven prompt engineering frameworks:
- **COSTAR**: Context, Objective, Style, Tone, Audience, Response
- **CRISPE**: Capacity, Insight, Statement, Personality, Experiment

## Template Structure

```markdown
---
name: <prompt-name>
version: 1
created: <ISO timestamp>
iterations: 0
---

# <Prompt Name> - Refined Prompt

## Context
[Situational details from exploration - codebase structure, relevant files, existing patterns]

Guidelines for Context section:
- Be specific about which packages/files are involved
- Reference actual file paths discovered during exploration
- Describe the current state of the codebase relevant to the task
- Include any relevant architectural patterns already in use

## Objective
[Clear, specific task statement derived from original prompt with measurable outcomes]

Guidelines for Objective section:
- Use action verbs (implement, create, refactor, add)
- Include measurable success criteria
- Be explicit about what "done" looks like
- Break complex objectives into numbered sub-objectives

## Role
[The persona/expertise the agent should embody for this task]

Guidelines for Role section:
- Specify the technical expertise required
- Include domain knowledge expectations
- Reference relevant technologies (Effect, Drizzle, etc.)
- Set the level of seniority (senior engineer, architect, etc.)

## Constraints
[Repository standards from AGENTS.md, Effect idioms, forbidden patterns, required patterns]

Guidelines for Constraints section:
- Reference EFFECT_CONSTRAINTS.md for repository standards
- List forbidden patterns explicitly
- List required patterns explicitly
- Include package boundary rules
- Specify import conventions

## Resources
[Specific files to read, documentation to consult, tools to use]

Guidelines for Resources section:
- List actual file paths (not "relevant files")
- Include AGENTS.md files for referenced packages
- Specify Effect documentation topics to consult
- List MCP tools to use (effect_docs_search, get_effect_doc)

## Output Specification
[Exact format, structure, and deliverables expected]

Guidelines for Output section:
- Specify file locations for new code
- Define naming conventions to follow
- Include expected export patterns
- Describe the structure of generated code
- List any artifacts to produce (tests, docs, etc.)

## Examples
[Few-shot examples demonstrating expected input/output if applicable]

Guidelines for Examples section:
- Show concrete input -> output pairs
- Demonstrate edge cases
- Include both success and error scenarios
- Use actual code from the codebase when possible

## Verification Checklist
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ...

Guidelines for Verification Checklist:
- Include type checking requirement
- Include lint checking requirement
- Include test requirements if applicable
- Include Effect-specific validation (no async/await, etc.)
- Make each criterion binary (pass/fail)

---

## Metadata

### Research Sources
- Files: [list of files explored during Phase 2]
- Documentation: [Effect docs referenced]
- Packages: [AGENTS.md files consulted]

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
```

## Section Mapping

| COSTAR | CRISPE | Template Section |
|--------|--------|------------------|
| Context | - | Context |
| Objective | Statement | Objective |
| Style | Personality | Role |
| Tone | - | (embedded in Role) |
| Audience | - | (embedded in Context) |
| Response | - | Output Specification |
| - | Capacity | Role |
| - | Insight | Constraints |
| - | Experiment | Examples |

## Quality Indicators

A well-structured prompt should:

1. **Context**: Answer "What is the current situation?"
2. **Objective**: Answer "What needs to be accomplished?"
3. **Role**: Answer "Who should the agent be?"
4. **Constraints**: Answer "What rules must be followed?"
5. **Resources**: Answer "What should the agent read/use?"
6. **Output**: Answer "What should be delivered?"
7. **Examples**: Answer "What does good look like?"
8. **Verification**: Answer "How do we know it's done correctly?"
