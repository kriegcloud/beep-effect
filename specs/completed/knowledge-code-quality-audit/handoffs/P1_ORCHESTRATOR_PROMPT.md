# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are orchestrating Phase 1 of the `knowledge-code-quality-audit` spec.

### Context

This spec audits the `packages/knowledge` vertical slice for Effect pattern violations discovered during the `knowledge-completion` spec. There are 18 violation categories to inventory.

**Source of Truth**: `.claude/rules/effect-patterns.md`

### Your Mission

Deploy 18 parallel sub-agents to inventory ALL violations. Each agent searches for a specific violation pattern and produces a structured report.

**CRITICAL**: Launch ALL 18 agents in a SINGLE message using multiple Task tool calls.

### Agent Deployment

For EACH violation category (V01-V18):

1. Read the full agent prompt from `specs/knowledge-code-quality-audit/AGENT_PROMPTS.md`
2. Launch with `subagent_type: "general-purpose"`
3. Each agent writes to `specs/knowledge-code-quality-audit/outputs/violations/V[XX]-[category].md`

### Violation Categories

| ID | Category | Output File |
|----|----------|-------------|
| V01 | EntityId Table Typing | V01-entityid-tables.md |
| V02 | Duplicate Code | V02-duplicate-code.md |
| V03 | Native String Methods | V03-native-string.md |
| V04 | Error Construction | V04-error-construction.md |
| V05 | Array Emptiness | V05-array-emptiness.md |
| V06 | Native Error | V06-native-error.md |
| V07 | Switch Statements | V07-switch-statements.md |
| V08 | Object.entries | V08-object-entries.md |
| V09 | Native Set | V09-native-set.md |
| V10 | Native Array.map | V10-native-array-map.md |
| V11 | Non-null Assertions | V11-non-null-assertions.md |
| V12 | Native Map | V12-native-map.md |
| V13 | Native Array.sort | V13-native-array-sort.md |
| V14 | EntityId Creation | V14-entityid-creation.md |
| V15 | String.toLowerCase | V15-string-tolowercase.md |
| V16 | Native Date | V16-native-date.md |
| V17 | Array vs Chunk | V17-array-vs-chunk.md |
| V18 | Empty Array Init | V18-empty-array-init.md |

### Before Launching Agents

```bash
# Create output directory
mkdir -p specs/knowledge-code-quality-audit/outputs/violations
```

### Critical Patterns

Each agent MUST:
1. Reference `.claude/rules/effect-patterns.md` for correct patterns
2. Search `packages/knowledge/**/src/**/*.ts`
3. Record exact file:line references
4. Document current code AND correct replacement
5. Follow template in `templates/violation-report.template.md`

### Verification

After all agents complete:

```bash
# Verify all 18 reports exist
ls specs/knowledge-code-quality-audit/outputs/violations/ | wc -l
# Should output: 18
```

### Success Criteria

- [ ] All 18 agents launched in parallel
- [ ] All 18 violation reports created
- [ ] Each report has exact file:line references
- [ ] No agent failures

### Handoff Document

Read full context in: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Collect total violation counts from all reports
2. Update `REFLECTION_LOG.md` with Phase 1 learnings
3. Create `handoffs/HANDOFF_P2.md` (synthesis phase context)
4. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` (synthesis phase prompt)
