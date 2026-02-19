# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Bootstrap) of the agent-config-optimization spec.

### Context

This spec optimizes all agent-related documentation in the beep-effect monorepo. Phase 0 is the "bootstrap" phase - we improve the improvement agents first, so downstream optimizations are even better.

### Your Mission

Optimize four key agent files to reduce bloat and improve effectiveness:

1. `.claude/agents/agents-md-updater.md` (~180 lines)
2. `.claude/agents/readme-updater.md` (~770 lines)
3. `.claude/agents/ai-trends-researcher.md` (~430 lines)
4. `.claude/agents/codebase-researcher.md` (~450 lines)

**Target**: Reduce total lines by 20%+ while maintaining functionality.

### Tasks

#### Task 1: Research Best Practices

Launch the `ai-trends-researcher` agent:

```
Research the latest best practices for Claude Code agent prompting and configuration.

Focus areas:
1. Agent prompt structure and length optimization
2. Effective use of examples vs rules
3. Decision trees vs prose instructions
4. Context efficiency patterns

Output: specs/agent-config-optimization/outputs/agent-best-practices.md
```

#### Task 2: Audit Current Agents

Launch the `codebase-researcher` agent:

```
Audit these four agent files for optimization opportunities:
- .claude/agents/agents-md-updater.md
- .claude/agents/readme-updater.md
- .claude/agents/ai-trends-researcher.md
- .claude/agents/codebase-researcher.md

For each, identify: redundant sections, verbose explanations, missing cross-references, outdated patterns.

Output: specs/agent-config-optimization/outputs/agent-config-audit.md
```

#### Task 3: Apply Improvements

Based on research and audit outputs:
1. Remove redundant content (especially duplicated architecture references)
2. Add decision trees where prose is unclear
3. Extract shared templates if content appears in multiple agents
4. Add cross-references between related agents
5. Compress example sections to 1-2 key examples

### Critical Patterns

**Shared Content to Extract**:
- Effect pattern compliance checks
- Verification checklists
- Error recovery patterns

**References Instead of Duplication**:
- Layer dependency order → Reference CLAUDE.md
- Package structure → Reference documentation/PACKAGE_STRUCTURE.md
- Import rules → Reference .claude/rules/effect-patterns.md

### Reference Files

- Spec: `specs/agent-config-optimization/README.md`
- Full context: `specs/agent-config-optimization/handoffs/HANDOFF_P0.md`
- Rubrics: `specs/agent-config-optimization/RUBRICS.md`

### Verification

After each agent modification:
```bash
wc -l .claude/agents/[modified-file].md  # Check line count
bun run lint:fix
```

### Success Criteria

- [ ] Research report generated with 3+ credible sources
- [ ] Audit report generated for all 4 files
- [ ] Total lines reduced from ~1,830 to ~1,460 (20%+)
- [ ] No functionality removed
- [ ] Cross-references added between agents
- [ ] `REFLECTION_LOG.md` updated
- [ ] `HANDOFF_P1.md` created
- [ ] `P1_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/agent-config-optimization/handoffs/HANDOFF_P0.md`

### Next Phase

After completing Phase 0:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P1.md` (context document)
3. Create `P1_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 1 will launch parallel sub-agents for exhaustive inventory of all agent documentation.
