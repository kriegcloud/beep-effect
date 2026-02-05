# Phase [N] Handoff: [Phase Name]

**Date**: [YYYY-MM-DD]
**From**: Phase [N-1] ([Previous Phase Name])
**To**: Phase [N] ([Current Phase Name])
**Status**: Ready for implementation
**Token Budget**: ≤4,000 tokens

---

## Working Context (Current Task Focus)

**Objective**: [What this phase accomplishes]

**Success Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Files to Create**:
1. `outputs/[DELIVERABLE_NAME].md`

**Agent to Use**: [codebase-researcher | doc-writer | mcp-researcher]

---

## Episodic Context (What Happened Before)

### Phase [N-1] Summary (~200 tokens)
[Brief summary of previous phase outcomes]

### Key Findings
- [Finding 1]
- [Finding 2]
- [Finding 3]

### Decisions Made
- [Decision 1 and rationale]
- [Decision 2 and rationale]

---

## Semantic Context (Constants)

**Tech Stack**:
- effect-ontology: `.repos/effect-ontology/packages/@core-v2/`
- beep-effect knowledge: `packages/knowledge/`
- Domain: Wealth management for UHNWI clients ($30M+ net worth)

**Key Concepts**:
- [Concept 1]: [Brief definition]
- [Concept 2]: [Brief definition]

---

## Procedural Context (How to Execute)

**Reference Files**:
- Agent prompt: `AGENT_PROMPTS.md#phase-[n]-[name]`
- Scoring rubric: `RUBRICS.md`
- Templates: `templates/[TEMPLATE_NAME].template.md`

**Execution Steps**:
1. Read this handoff document
2. Copy agent prompt from AGENT_PROMPTS.md
3. Spawn agent with prompt
4. Review output against success criteria
5. Update REFLECTION_LOG.md
6. Create HANDOFF_P[N+1].md

---

## Checkpoint Protocol

Create checkpoint when:
- Tool calls reach 15
- Large file reads reach 4
- Entering Yellow Zone (context > 75%)

**Checkpoint Format**:
```markdown
## Checkpoint P[N].[M] - [Date]
Progress: [What's done / What's remaining]
Next: [Immediate action]
```

---

## Known Issues & Gotchas

1. [Issue 1]: [Description and mitigation]
2. [Issue 2]: [Description and mitigation]

---

## Anti-Patterns to Avoid

- [ ] Orchestrator reading 100+ files directly → Delegate to agent
- [ ] Context overload → Compress to tiered model
- [ ] Skip reflection → Mandatory before handoff
- [ ] Static prompts → Adapt based on findings

---

## Next Phase Preview

Phase [N+1] will [brief description of next phase].
