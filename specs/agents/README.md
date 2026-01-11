# Agent Specifications

> Individual specifications for creating specialized Claude Code agents.

---

## Overview

This directory contains individual specs for each agent to be created as part of the [new-specialized-agents](../new-specialized-agents/README.md) initiative. Breaking the original combined spec into individual agent specs reduces scope, increases alignment, and enables parallel development.

---

## Agent Specs

| Agent | Purpose | Target Lines | Status |
|-------|---------|--------------|--------|
| [reflector](./reflector/README.md) | Meta-reflection and prompt improvement | 300-400 | Draft |
| [codebase-researcher](./codebase-researcher/README.md) | Systematic code exploration | 350-450 | Draft |
| [web-researcher](./web-researcher/README.md) | Web-based research synthesis | 250-350 | Draft |
| [mcp-researcher](./mcp-researcher/README.md) | Effect documentation research | 300-400 | Draft |
| [code-reviewer](./code-reviewer/README.md) | Repository guideline enforcement | 400-500 | Draft |
| [code-observability-writer](./code-observability-writer/README.md) | Logging, tracing, metrics | 350-450 | Draft |
| [doc-writer](./doc-writer/README.md) | JSDoc and markdown documentation | 400-500 | Draft |
| [architecture-pattern-enforcer](./architecture-pattern-enforcer/README.md) | Structure and layering validation | 450-550 | Draft |
| [test-writer](./test-writer/README.md) | Effect-first test creation | 500-600 | Draft |

---

## Implementation Priority

Based on dependencies and foundational importance:

### Tier 1: Foundation (Create First)
1. **reflector** - Enables meta-learning for all other agents
2. **codebase-researcher** - Foundation for understanding existing patterns

### Tier 2: Research Agents
3. **mcp-researcher** - Effect documentation research
4. **web-researcher** - General web research

### Tier 3: Quality Agents
5. **code-reviewer** - Repository guideline enforcement
6. **architecture-pattern-enforcer** - Structure validation

### Tier 4: Writer Agents
7. **code-observability-writer** - Observability instrumentation
8. **doc-writer** - Documentation creation
9. **test-writer** - Test generation

---

## Initial Handoffs

Ready-to-use orchestrator prompts for each agent:

| Agent | Handoff | Priority |
|-------|---------|----------|
| reflector | [Initial Handoff](./handoffs/reflector-initial-handoff.md) | Tier 1 |
| codebase-researcher | [Initial Handoff](./handoffs/codebase-researcher-initial-handoff.md) | Tier 1 |
| mcp-researcher | [Initial Handoff](./handoffs/mcp-researcher-initial-handoff.md) | Tier 2 |
| web-researcher | [Initial Handoff](./handoffs/web-researcher-initial-handoff.md) | Tier 2 |
| code-reviewer | [Initial Handoff](./handoffs/code-reviewer-initial-handoff.md) | Tier 3 |
| architecture-pattern-enforcer | [Initial Handoff](./handoffs/architecture-pattern-enforcer-initial-handoff.md) | Tier 3 |
| code-observability-writer | [Initial Handoff](./handoffs/code-observability-writer-initial-handoff.md) | Tier 4 |
| doc-writer | [Initial Handoff](./handoffs/doc-writer-initial-handoff.md) | Tier 4 |
| test-writer | [Initial Handoff](./handoffs/test-writer-initial-handoff.md) | Tier 4 |

Each handoff includes:
- Mission statement
- Critical constraints
- Phase-by-phase research and design tasks
- Verification commands
- Success criteria
- Ready-to-use orchestrator prompt

---

## Spec Structure

Each agent spec follows the META_SPEC_TEMPLATE pattern with simplified structure:

```
specs/agents/[agent-name]/
├── README.md           # Spec overview (100-150 lines)
├── REFLECTION_LOG.md   # Cumulative learnings
├── templates/          # Output templates (if needed)
└── outputs/            # Phase outputs
    ├── research-findings.md
    └── agent-design.md
```

Additionally, shared handoffs are stored in:
```
specs/agents/handoffs/
├── reflector-initial-handoff.md
├── codebase-researcher-initial-handoff.md
├── mcp-researcher-initial-handoff.md
├── web-researcher-initial-handoff.md
├── code-reviewer-initial-handoff.md
├── architecture-pattern-enforcer-initial-handoff.md
├── code-observability-writer-initial-handoff.md
├── doc-writer-initial-handoff.md
└── test-writer-initial-handoff.md
```

---

## Workflow

### Per-Agent Development Cycle

1. **Research Phase** (Read-only)
   - Read existing patterns and documentation
   - Identify tool requirements
   - Output: `outputs/research-findings.md`

2. **Design Phase**
   - Design agent methodology
   - Define output format
   - Output: `outputs/agent-design.md`

3. **Create Phase**
   - Create agent definition
   - Validate references
   - Output: `.claude/agents/[agent-name].md`

4. **Validate Phase**
   - Test agent with sample task
   - Verify output format
   - Update REFLECTION_LOG.md

---

## Common Dependencies

All agent specs share these dependencies:

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md`

### Effect Patterns (CRITICAL)
All code examples must use:
```typescript
import * as Effect from "effect/Effect"
import * as A from "effect/Array"
import * as S from "effect/Schema"
// etc.
```

Never use:
- `async/await`
- Native array/string methods (`.map()`, `.filter()`, `.split()`)
- `switch` statements
- `new Date()`

---

## Success Criteria

The agent specs are complete when:

- [ ] All 9 agent definitions created in `.claude/agents/`
- [ ] Each agent follows template structure
- [ ] All code examples use Effect patterns
- [ ] All file references are valid
- [ ] Each agent tested with sample task
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] Integration with spec workflow documented

---

## Related Documentation

- [new-specialized-agents](../new-specialized-agents/README.md) - Parent spec
- [ai-friendliness-audit](../ai-friendliness-audit/README.md) - META_SPEC_TEMPLATE reference
- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) - Agent-assisted spec workflow
