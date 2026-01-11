# Reflector Agent Design

> Phase 2 Design Output for the Reflector Agent Specification

---

## 1. Agent Methodology

The reflector agent follows a **4-phase analysis pattern**:

### Phase 1: Discovery
**Purpose**: Locate and validate REFLECTION_LOG.md files

**Steps**:
1. Search for REFLECTION_LOG.md files using Glob: `specs/*/REFLECTION_LOG.md`
2. Validate each file exists and is readable
3. Report found files to user with spec names extracted from paths
4. If user specifies a specific spec, filter to that location

**Outputs**:
- List of valid REFLECTION_LOG.md paths
- Spec names for each log

---

### Phase 2: Extraction
**Purpose**: Parse reflection entries from each log

**Steps**:
1. Read each REFLECTION_LOG.md file
2. Extract entries using section pattern matching:
   - Identify entries by `## YYYY-MM-DD - ` prefix
   - Parse "What Worked" sections (bulleted lists after header)
   - Parse "What Didn't Work" sections
   - Parse "Methodology Improvements" sections (checkbox items)
   - Parse "Prompt Refinements" sections (Original/Problem/Refined triplets)
   - Parse "Codebase-Specific Insights" sections
3. Collect "Lessons Learned Summary" if present
4. Collect "Accumulated Improvements" tables if present

**Entry Schema**:
```typescript
interface ReflectionEntry {
  date: string                    // YYYY-MM-DD
  phase: string                   // "Phase 1.1", "P3 Remediation", etc.
  whatWorked: string[]            // Bulleted items
  whatDidntWork: string[]         // Bulleted items
  methodologyImprovements: {
    item: string
    status: 'pending' | 'applied'
  }[]
  promptRefinements: {
    original: string
    problem: string
    refined: string
  }[]
  codebaseInsights: string[]
}
```

---

### Phase 3: Analysis
**Purpose**: Identify patterns across entries

**Pattern Detection Algorithm**:

1. **Recurring Successes** (Keep Doing):
   - Collect all "What Worked" items across entries
   - Normalize text (lowercase, remove bullets)
   - Group by semantic similarity (keyword overlap)
   - Items appearing in 2+ entries are patterns
   - Rank by frequency

2. **Recurring Failures** (Stop Doing):
   - Collect all "What Didn't Work" items
   - Same normalization and grouping
   - Items appearing in 2+ entries are anti-patterns
   - Note if they have corresponding fixes applied

3. **Emerging Patterns** (Start Doing):
   - Collect all "Methodology Improvements" with status=applied
   - Collect "Refined instruction" from prompt refinements
   - These represent validated improvements

4. **Cross-Spec Patterns**:
   - If analyzing multiple specs, identify patterns that appear across specs
   - These are "universal learnings" vs "spec-specific learnings"

**Similarity Threshold**:
- Two items are "similar" if they share 3+ significant keywords
- Significant keywords: exclude stopwords (the, a, an, is, was, etc.)

---

### Phase 4: Synthesis
**Purpose**: Generate actionable meta-reflection output

**Steps**:
1. Structure findings into output format (see Section 2)
2. Generate recommendations based on pattern analysis
3. Create before/after examples from prompt refinements
4. Suggest documentation updates
5. Write output to markdown file

---

## 2. Output Format

The agent produces a structured markdown file:

```markdown
# Meta-Reflection: [Spec Name(s)]

> Generated: YYYY-MM-DDTHH:mm:ssZ
> Analyzed: [list of REFLECTION_LOG.md paths]

---

## Executive Summary

[2-3 sentence overview of key findings]

---

## Pattern Analysis

### Recurring Successes (Keep Doing)

| Pattern | Occurrences | Source Entries |
|---------|-------------|----------------|
| [Description] | N | Phase 1, Phase 2.3, ... |

**Key Insight**: [What this pattern reveals about effective methodology]

### Recurring Failures (Stop Doing)

| Anti-Pattern | Occurrences | Resolution |
|--------------|-------------|------------|
| [Description] | N | [How it was fixed, or "Unresolved"] |

**Key Insight**: [What this reveals about ineffective approaches]

### Emerging Patterns (Start Doing)

| New Practice | Source | Impact |
|--------------|--------|--------|
| [Description] | [Which entry introduced it] | [Observed benefit] |

---

## Prompt Refinements

### Refinement 1: [Topic]

**Original**:
> [Quoted original instruction]

**Problem**:
[Why it didn't work well]

**Refined**:
> [Improved version]

**Applicable To**: [Which types of prompts/tasks]

---

## Documentation Updates

### CLAUDE.md Recommendations

| Section | Recommended Change | Rationale |
|---------|-------------------|-----------|
| [Section] | [Change] | [From which learning] |

### AGENTS.md Recommendations

| Package | Recommended Change | Rationale |
|---------|-------------------|-----------|
| [Package] | [Change] | [From which learning] |

### Spec File Recommendations

| File | Recommended Change | Rationale |
|------|-------------------|-----------|
| [MASTER_ORCHESTRATION.md, etc.] | [Change] | [From which learning] |

---

## Cumulative Learnings

### Universal Patterns (Apply to All Specs)

1. [Pattern that works across all spec types]
2. [Pattern that works across all spec types]

### Spec-Specific Patterns

#### [Spec Name 1]
- [Pattern specific to this spec type]

#### [Spec Name 2]
- [Pattern specific to this spec type]

---

## Verification Checklist

- [ ] All patterns have 2+ supporting entries
- [ ] Prompt refinements include before/after/problem
- [ ] Documentation updates reference source learnings
- [ ] No duplicate patterns across sections

---

## References

### Source Logs Analyzed
| Spec | Path | Entry Count |
|------|------|-------------|
| [Name] | specs/[name]/REFLECTION_LOG.md | N |

### Related Specs
- [Link to META_SPEC_TEMPLATE.md if relevant]
- [Link to other related specs]
```

---

## 3. Tools and Knowledge Sources

### Required Tools

| Tool | Purpose |
|------|---------|
| `Glob` | Find REFLECTION_LOG.md files: `specs/*/REFLECTION_LOG.md` |
| `Read` | Read contents of each reflection log |
| `Grep` | Search for specific patterns within logs |
| `Write` | Output meta-reflection markdown file |

### Knowledge Sources

| Path | Content |
|------|---------|
| `specs/*/REFLECTION_LOG.md` | Primary data source - reflection entries |
| `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` | Template for self-improving patterns |
| `CLAUDE.md` | Root documentation to suggest updates for |
| `packages/*/AGENTS.md` | Package docs to suggest updates for |

### Output Location

Meta-reflections are saved to:
```
specs/agents/reflector/outputs/meta-reflection-[spec-name].md
```

Or for multi-spec analysis:
```
specs/agents/reflector/outputs/meta-reflection-[YYYY-MM-DD].md
```

---

## 4. Integration Points

### When to Invoke the Reflector

1. **After Phase 3 Synthesis**: Generate initial meta-reflection from first execution
2. **After Each Phase 4+ Handoff**: Update meta-reflection with new learnings
3. **On Demand**: User requests analysis of specific specs
4. **Cross-Spec Analysis**: User requests patterns across multiple specs

### Integration with Handoff Workflow

The reflector can be invoked from handoff documents:

```markdown
## Post-Handoff Actions

Before starting P[N+1], run the reflector agent:
- Analyze: specs/[spec-name]/REFLECTION_LOG.md
- Output: specs/agents/reflector/outputs/meta-reflection-[spec-name].md
- Incorporate findings into P[N+1] orchestrator prompt
```

### Output Consumption

Meta-reflections are consumed by:
1. **Human reviewers**: Validate learnings before spec updates
2. **Orchestrator prompts**: Incorporate validated patterns
3. **CLAUDE.md updates**: Apply universal patterns
4. **AGENTS.md updates**: Apply package-specific patterns

---

## 5. Agent Configuration

### Frontmatter

```yaml
---
name: reflector
description: |
  Meta-reflection agent for analyzing REFLECTION_LOG.md files and generating
  actionable improvements for future spec executions. This agent extracts
  patterns from what worked/didn't work, synthesizes prompt refinements,
  and recommends documentation updates.

  Examples:

  <example>
  Context: User wants to analyze learnings from a completed spec.
  user: "Analyze the reflection log from ai-friendliness-audit"
  assistant: "I'll use the reflector agent to extract patterns and generate improvements."
  <Task tool call to reflector agent>
  </example>

  <example>
  Context: User wants cross-spec pattern analysis.
  user: "What patterns appear across all our spec executions?"
  assistant: "Let me launch the reflector agent to analyze all REFLECTION_LOG files."
  <Task tool call to reflector agent>
  </example>

  <example>
  Context: User completed a phase and wants to capture learnings.
  user: "Generate a meta-reflection for the recent P3 work"
  assistant: "I'll use the reflector agent to synthesize learnings from the latest entries."
  <Task tool call to reflector agent>
  </example>
model: sonnet
---
```

### Critical Rules

1. **Read-only analysis**: Never modify REFLECTION_LOG.md files
2. **Evidence-based patterns**: Only report patterns with 2+ occurrences
3. **Source attribution**: Always link patterns to specific entries
4. **Actionable outputs**: Recommendations must be specific, not vague
5. **No Effect code examples**: This is a documentation agent, not a code agent

---

## 6. Estimated Size

| Section | Estimated Lines |
|---------|-----------------|
| Frontmatter | 30 |
| Purpose Statement | 15 |
| Methodology | 80 |
| Knowledge Sources | 40 |
| Output Format | 60 |
| Examples | 50 |
| Critical Rules | 25 |
| **Total** | **~300-400 lines** |
