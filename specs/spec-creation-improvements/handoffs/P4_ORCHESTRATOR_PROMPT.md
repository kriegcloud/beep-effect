# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify:
- [ ] Phase 3 deliverables exist (Reflection Schema, Quality Rubric, Promotion Workflow in SPEC_CREATION_GUIDE.md)
- [ ] SKILL.template.md exists at `specs/templates/SKILL.template.md`
- [ ] REFLECTION_LOG.md has Phase 3 learnings

---

## Prompt

You are executing Phase 4 (DSPy-Style Agent Signatures) of the Spec Creation Improvements spec.

### Context

Phase 1 implemented foundation files (llms.txt, state machine, complexity calculator, pattern registry). Phase 2 implemented tiered context architecture (4-tier memory model, 4K token budget). Phase 3 implemented structured self-improvement (reflection schema, 8-category quality rubric, skill promotion workflow). Phase 4 adds programmatic signatures to all agents.

### Your Mission

Define signature format and add signatures to all 9 specialized agents.

### Deliverables

1. `templates/AGENT_SIGNATURE.template.md` - Format definition
2. Updated `.claude/agents/*.md` - Signature metadata for all 9 agents
3. `documentation/patterns/agent-signatures.md` - Composition guide

### Critical Patterns

**Signature Format** (YAML in agent markdown):
```yaml
signature:
  input:
    fieldName:
      type: string|string[]|enum
      description: What this field contains
      required: true|false
  output:
    fieldName:
      type: string|object|array
      description: What this field contains
  sideEffects: none|write-reports|write-files
```

**Composition Example**:
```
codebase-researcher.output.findings → doc-writer.input.context
```

### Agents to Update

1. codebase-researcher (read-only)
2. mcp-researcher (read-only)
3. web-researcher (read-only)
4. reflector (write-reports)
5. code-reviewer (write-reports)
6. architecture-pattern-enforcer (write-reports)
7. doc-writer (write-files)
8. test-writer (write-files)
9. code-observability-writer (write-files)

### Reference Files

- Research: `outputs/dspy-signatures-research.md`
- Agents: `.claude/agents/*.md`

### Verification

```bash
# Check all agents have signatures
for f in .claude/agents/*.md; do
  echo "$f: $(grep -c 'signature:' $f)"
done
```

### Success Criteria

- [ ] Signature template created
- [ ] All 9 agents have signatures
- [ ] Composition guide with examples
- [ ] HANDOFF_P5.md created
- [ ] P5_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/spec-creation-improvements/handoffs/HANDOFF_P4.md`
