# Reflector Agent — Initial Handoff

> **Priority**: Tier 1 (Foundation)
> **Spec Location**: `specs/agents/reflector/README.md`
> **Target Output**: `.claude/agents/reflector.md` (300-400 lines)

---

## Mission

Create the **reflector** agent — a meta-learning specialist that analyzes reflection logs and generates improvements for future spec executions. This agent is foundational: it enables the self-improving pattern by extracting lessons from `REFLECTION_LOG.md` files.

---

## Critical Constraints

1. **NEVER use `async/await`** — All examples must use `Effect.gen`
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **NEVER use named imports from Effect** — Use `import * as Effect from "effect/Effect"`
4. **Agent definition must be 300-400 lines**
5. **All file references must be validated before inclusion**

---

## Phase 1: Research (Read-Only)

Execute these research tasks **before** designing the agent:

### Task 1.1: Analyze Existing Reflection Logs

**Read these files**:
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/REFLECTION_LOG.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md`

**Extract**:
- Structure of reflection entries
- Common patterns in "What Worked" / "What Didn't Work" sections
- How prompt refinements are documented
- How learnings accumulate across phases

### Task 1.2: Study Agent Template

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

**Extract**:
- Required frontmatter fields
- Section structure expectations
- Anti-patterns to avoid

### Task 1.3: Review Reference Agents

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/effect-researcher.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/prompt-refiner.md`

**Extract**:
- How research methodology is documented
- Output format patterns
- Tool usage examples

### Output: `specs/agents/reflector/outputs/research-findings.md`

Document all findings in structured format:
```markdown
# Reflector Research Findings

## Reflection Log Structure
[What you learned about REFLECTION_LOG.md format]

## Agent Template Requirements
[Frontmatter, sections, anti-patterns]

## Reference Agent Patterns
[Methodology examples from existing agents]

## Key Decisions
[List decisions needed for Phase 2]
```

---

## Phase 2: Design

### Task 2.1: Design Agent Methodology

Define how the reflector will:
1. Parse REFLECTION_LOG.md files (what sections to extract)
2. Identify patterns (what constitutes a pattern)
3. Generate improvements (output format)
4. Create meta-reflections (synthesis approach)

### Task 2.2: Define Output Format

Create the exact output structure the agent will produce:
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

### Task 2.3: Specify Tools and Knowledge Sources

List:
- Tools the agent will use (Read, Glob, Grep)
- Knowledge sources (paths to REFLECTION_LOG files)
- Integration points with handoff workflow

### Output: `specs/agents/reflector/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/reflector.md` following this structure:

```markdown
---
description: Meta-reflection agent for analyzing spec reflection logs and generating improvements
tools: [Read, Glob, Grep]
---

# Reflector Agent

[Purpose statement]

## Methodology

[Step-by-step approach]

## Knowledge Sources

[File paths and what they provide]

## Output Format

[Exact structure of agent output]

## Examples

[Sample invocation and output]
```

### Task 3.2: Validate References

Verify all file paths in the agent definition exist:
```bash
ls -la [each referenced path]
```

### Task 3.3: Test with Sample

Run the agent on an existing REFLECTION_LOG.md to verify it produces valid output.

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/reflector.md
wc -l .claude/agents/reflector.md

# Verify no async/await
grep -i "async\|await" .claude/agents/reflector.md && echo "FAIL: Found async/await" || echo "PASS"

# Verify namespace imports
grep "import \* as" .claude/agents/reflector.md

# Check frontmatter
head -10 .claude/agents/reflector.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/reflector.md`
- [ ] Length is 300-400 lines
- [ ] Follows template structure with frontmatter
- [ ] All referenced files exist
- [ ] No async/await in examples
- [ ] Uses Effect namespace imports
- [ ] Output format matches META_SPEC_TEMPLATE patterns
- [ ] Tested with sample reflection analysis

---

## Handoff Notes

After completing Phase 4:
1. Update `specs/agents/reflector/REFLECTION_LOG.md` with learnings
2. Document any methodology improvements discovered
3. If patterns emerge that apply to other agents, note them for cross-pollination

---

## Ready-to-Use Orchestrator Prompt

Copy this prompt to begin execution:

```
You are executing the reflector agent creation spec.

Your goal: Create `.claude/agents/reflector.md` (300-400 lines) — a meta-reflection agent that analyzes REFLECTION_LOG.md files and generates improvements.

CRITICAL RULES:
1. NEVER write code directly — orchestrate via sub-agents
2. PRESERVE context window — summarize findings, don't paste entire files
3. VALIDATE all file references before including them

PHASE 1 - Research (Read-Only):
1. Read specs/ai-friendliness-audit/REFLECTION_LOG.md — extract structure
2. Read specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md — understand patterns
3. Read .claude/agents/templates/agents-md-template.md — get template requirements
4. Read .claude/agents/effect-researcher.md — reference implementation
5. Output findings to specs/agents/reflector/outputs/research-findings.md

PHASE 2 - Design:
1. Design methodology for pattern extraction
2. Define output format with examples
3. Specify tool usage
4. Output design to specs/agents/reflector/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/reflector.md following template
2. Validate all file references
3. Test with sample REFLECTION_LOG.md

PHASE 4 - Validate:
1. Run verification commands
2. Update specs/agents/reflector/REFLECTION_LOG.md with learnings

Begin with Phase 1, Task 1.1.
```
