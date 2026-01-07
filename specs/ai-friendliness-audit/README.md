# AI-Friendliness Audit Specification

> Systematic methodology for auditing and improving the beep-effect monorepo for optimal AI-assisted development.

---

## Purpose

This specification provides a structured framework for evaluating how well the `beep-effect` codebase supports AI coding assistants like Claude Code. The audit identifies gaps in documentation, structure, patterns, and AI instructions, then generates a prioritized remediation plan.

---

## Contents

| File | Purpose |
|------|---------|
| `README.md` | This overview document |
| `MASTER_ORCHESTRATION.md` | Full 3-phase workflow with self-reflection checkpoints |
| `AGENT_PROMPTS.md` | Specialized prompts for parallel audit agents |
| `RUBRICS.md` | Scoring criteria for consistent evaluation |
| `QUICK_START.md` | 5-minute getting started guide |
| `REFLECTION_LOG.md` | Continuous methodology improvement through reflection |

---

## Methodology

Based on research from Arize AI and Anthropic best practices:

### Key Principles

1. **English Feedback Loops**: Generate diagnostic explanations, not scalar scores
2. **Progressive Disclosure**: Use hierarchical documentation (root → package → skills)
3. **Phase Separation**: Discovery → Evaluation → Synthesis
4. **Self-Reflection**: Validate findings at each checkpoint
5. **Continuous Improvement**: Log reflections to improve the audit methodology itself

### Three-Phase Workflow

```
PHASE 1: Discovery (Read-Only)
├── Map codebase architecture
├── Inventory documentation artifacts
├── Analyze dependency graph
└── Output: audit-context.md

PHASE 2: Evaluation (60% of effort)
├── Documentation Quality (25% weight)
├── Structural Clarity (25% weight)
├── Effect Pattern Compliance (20% weight)
├── Tooling Integration (15% weight)
└── AI Instruction Optimization (15% weight)

PHASE 3: Synthesis
├── Consolidate findings
├── Prioritize by impact/effort
├── Generate before/after examples
└── Output: remediation-plan.md
```

---

## Evaluation Dimensions

| Dimension | Weight | Key Questions |
|-----------|--------|---------------|
| Documentation | 25% | Are public APIs documented? Do complex functions have examples? |
| Structure | 25% | Are module boundaries clear? Are naming conventions consistent? |
| Patterns | 20% | Is Effect used idiomatically? Are forbidden patterns avoided? |
| Tooling | 15% | Is TypeScript strict? Is linting comprehensive? |
| AI Instructions | 15% | Is CLAUDE.md optimized? Do packages have AGENTS.md? |

---

## Expected Outputs

After completing the audit:

1. **audit-context.md** - Architectural mapping and documentation inventory
2. **evaluation-report.md** - Scored dimensions with evidence and file:line references
3. **remediation-plan.md** - Prioritized action items with before/after examples
4. **optimized-claude-md.md** - Suggested root CLAUDE.md improvements
5. **agents-md-gaps.md** - Packages needing AGENTS.md files

---

## Success Criteria

The audit is complete when:

- [ ] All ~80 packages have been cataloged
- [ ] All 5 dimensions have been scored
- [ ] Every finding includes file:line references
- [ ] Top 10 issues have before/after code examples
- [ ] Remediation plan is prioritized by impact
- [ ] CLAUDE.md optimization achieves <100 lines proposal
- [ ] Package AGENTS.md gap analysis is complete

---

## Quick Start

```bash
# Navigate to spec directory
cd specs/ai-friendliness-audit

# Read the methodology
cat MASTER_ORCHESTRATION.md

# Run quick baseline check (from repo root)
grep -rn ": any\b" packages/*/src/*.ts 2>/dev/null | wc -l
find packages -name "AGENTS.md" | wc -l
wc -l CLAUDE.md
```

---

## Research Foundation

This methodology incorporates findings from:

- **Arize AI Prompt Learning**: English feedback loops outperform algorithmic search
- **Anthropic CLAUDE.md Guidelines**: Optimal length and structure for AI instructions
- **Andrew Ng's Agentic Patterns**: Self-reflection mechanisms improve output quality
- **monorepo.tools Research**: AI struggles with architectural comprehension ("map view problem")

Key insight: **10-15% accuracy improvements** come from structured, feedback-rich prompt architecture—not from more sophisticated algorithms.

---

## Usage

### For Manual Audit
1. Follow `QUICK_START.md` for initial baseline
2. Work through `MASTER_ORCHESTRATION.md` phases sequentially
3. Use `RUBRICS.md` for consistent scoring

### For Parallel Agent Execution
1. Deploy agents using prompts from `AGENT_PROMPTS.md`
2. Each agent outputs to `outputs/[agent-name]-report.md`
3. Consolidation agent merges findings into final plan

---

## Related Documentation

- `CLAUDE.md` - Root AI agent instructions (audit target)
- `documentation/patterns/` - Pattern library (reference for evaluation)
- `specs/vertical-slice-bootstraper/reviews/` - Example of multi-agent review pattern
