# New Specialized Agents - Spec

**Status**: Draft
**Created**: 2026-01-10
**Version**: 1.0

## Purpose

Enhance the beep-effect spec workflow with:
1. Standardized folder structure conventions
2. 9 specialized sub-agents optimized for spec phases
3. Formal 7-phase workflow definitions
4. Agent output protocols for reflections and handoffs
5. Meta-learning reflection system for continuous improvement

## Scope

### In Scope
- Folder structure convention documentation (`specs/CONVENTIONS.md`)
- Agent definitions for:
  - `reflector` - Meta-reflection and prompt improvement
  - `codebase-researcher` - Systematic code exploration
  - `web-researcher` - Web-based research synthesis
  - `mcp-researcher` - Effect documentation research
  - `code-reviewer` - Repository guideline enforcement
  - `code-observability-writer` - Logging, tracing, metrics
  - `doc-writer` - JSDoc and markdown documentation
  - `architecture-pattern-enforcer` - Structure and layering validation
  - `test-writer` - Effect-first test creation
- Phase breakdown documentation (`specs/PHASE_DEFINITIONS.md`)
- Handoff templates for all 7 phases
- Agent output protocols (`specs/AGENT_OUTPUT_PROTOCOLS.md`)
- Reflection protocol enhancement (`specs/REFLECTION_PROTOCOL.md`)

### Out of Scope
- Modifying existing agents (unless needed for integration)
- Changing META_SPEC_TEMPLATE.md structure (we extend, not replace)
- Implementing a new spec using these agents (that's a separate effort)
- Automated spec orchestration system (future enhancement)

## Success Criteria

- [ ] All documentation files created and passing lint
- [ ] All 9 agent definitions created following template
- [ ] Each agent reviewed by critic agents (3 cycles max)
- [ ] Integration with existing spec pattern documented
- [ ] No broken cross-references
- [ ] All code examples use Effect patterns
- [ ] `bun run lint` and `bun run check` pass

## Quick Start

1. Read the [refined prompt](new-specialized-agents.original.md) for complete context
2. Review the [original prompt](./new-specialized-agents.original.md) for initial requirements
3. Follow the execution phases in the refined prompt

## Deliverables

### Core Documentation
| File | Purpose | Lines |
|------|---------|-------|
| `specs/CONVENTIONS.md` | Folder structure standard | 200-300 |
| `specs/PHASE_DEFINITIONS.md` | 7-phase workflow | 400-600 |
| `specs/AGENT_OUTPUT_PROTOCOLS.md` | Agent output standards | 250-350 |
| `specs/REFLECTION_PROTOCOL.md` | Meta-learning system | 300-400 |

### Agent Definitions (`.claude/agents/`)
| Agent | Purpose | Lines |
|-------|---------|-------|
| `reflector.md` | Meta-reflection & improvement | 300-400 |
| `codebase-researcher.md` | Code exploration | 350-450 |
| `web-researcher.md` | Web research | 250-350 |
| `mcp-researcher.md` | Effect docs research | 300-400 |
| `code-reviewer.md` | Guideline enforcement | 400-500 |
| `code-observability-writer.md` | Logging & tracing | 350-450 |
| `doc-writer.md` | Documentation creation | 400-500 |
| `architecture-pattern-enforcer.md` | Structure validation | 450-550 |
| `test-writer.md` | Effect test writing | 500-600 |

### Handoff Templates (`specs/templates/handoffs/`)
- `phase-1-to-2-handoff.template.md`
- `phase-2-to-3-handoff.template.md`
- `phase-3-to-4-handoff.template.md`
- `phase-4-to-5-handoff.template.md`
- `phase-5-to-6-handoff.template.md`
- `phase-6-to-7-handoff.template.md`
- `phase-7-complete-handoff.template.md`

## Background

### Problem
The current spec workflow (documented in META_SPEC_TEMPLATE.md) has proven effective but lacks:
- Consistent folder structure across specs
- Specialized agents for spec-specific tasks
- Formal phase definitions with handoff protocols
- Structured reflection and meta-learning

### Solution
Create a comprehensive enhancement that standardizes structure, adds specialized agents, defines formal phases, and implements meta-learning feedback loops.

### Prior Art
- `specs/ai-friendliness-audit/` - Self-improving spec pattern
- `specs/docking-system/` - Example with handoffs
- `.claude/agents/effect-researcher.md` - Specialized agent example
- `tooling/testkit/AGENTS.md` - Testing infrastructure guide

## Dependencies

### Required Knowledge
- Effect-TS patterns and idioms
- Repository architecture (layers, slices, boundaries)
- Testing with `@beep/testkit`
- Documentation standards (`docgen`)
- Observability patterns (logging, tracing, metrics)

### Required Files
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md`

## Individual Agent Specs

Each agent has been broken into its own specification for focused development. See [specs/agents/README.md](../agents/README.md) for the index.

| Agent | Spec Location | Status |
|-------|---------------|--------|
| reflector | [specs/agents/reflector/](../agents/reflector/README.md) | Draft |
| codebase-researcher | [specs/agents/codebase-researcher/](../agents/codebase-researcher/README.md) | Draft |
| web-researcher | [specs/agents/web-researcher/](../agents/web-researcher/README.md) | Draft |
| mcp-researcher | [specs/agents/mcp-researcher/](../agents/mcp-researcher/README.md) | Draft |
| code-reviewer | [specs/agents/code-reviewer/](../agents/code-reviewer/README.md) | Draft |
| code-observability-writer | [specs/agents/code-observability-writer/](../agents/code-observability-writer/README.md) | Draft |
| doc-writer | [specs/agents/doc-writer/](../agents/doc-writer/README.md) | Draft |
| architecture-pattern-enforcer | [specs/agents/architecture-pattern-enforcer/](../agents/architecture-pattern-enforcer/README.md) | Draft |
| test-writer | [specs/agents/test-writer/](../agents/test-writer/README.md) | Draft |

### Implementation Priority

1. **Tier 1 (Foundation)**: reflector, codebase-researcher
2. **Tier 2 (Research)**: mcp-researcher, web-researcher
3. **Tier 3 (Quality)**: code-reviewer, architecture-pattern-enforcer
4. **Tier 4 (Writers)**: code-observability-writer, doc-writer, test-writer

---

## Notes

- This spec follows its own META_SPEC_TEMPLATE pattern
- Agent definitions will be iteratively refined via critic review
- Phase definitions build on proven patterns from ai-friendliness-audit
- Reflection protocol enables continuous improvement of the spec workflow itself
- **Individual agent specs reduce scope and increase alignment**

## See Also

- [META_SPEC_TEMPLATE.md](../ai-friendliness-audit/META_SPEC_TEMPLATE.md) - Base spec pattern
- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) - Agent-assisted spec workflow
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md) - Repository coding standards
