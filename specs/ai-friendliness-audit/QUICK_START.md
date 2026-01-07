# AI-Friendliness Audit: Quick Start Guide

> Get started with the audit in 5 minutes.

---

## TL;DR

1. Read `MASTER_ORCHESTRATION.md` for the full workflow
2. Execute Phase 1 (Discovery) to understand the codebase
3. Deploy parallel agents using prompts from `AGENT_PROMPTS.md`
4. Consolidate findings into remediation plan
5. Execute fixes by priority

---

## Immediate Actions

### Step 1: Create Working Directory

```bash
mkdir -p specs/ai-friendliness-audit/outputs
cd specs/ai-friendliness-audit
```

### Step 2: Run Discovery Commands

```bash
# Package inventory
find packages -name "package.json" -type f | wc -l

# Documentation coverage
find packages -name "README.md" -type f | wc -l
find packages -name "AGENTS.md" -type f | wc -l

# Line count of CLAUDE.md
wc -l ../../CLAUDE.md
```

### Step 3: Quick Pattern Violation Check

```bash
# Top violations (run from repo root)
echo "=== Native Array Methods ==="
grep -rn "\.map\(" packages/*/src/*.ts 2>/dev/null | grep -v "A\.map" | wc -l

echo "=== Native Date ==="
grep -rn "new Date\(\)" packages/*/src/*.ts 2>/dev/null | wc -l

echo "=== any Types ==="
grep -rn ": any\b" packages/*/src/*.ts 2>/dev/null | wc -l

echo "=== Switch Statements ==="
grep -rn "switch\s*\(" packages/*/src/*.ts 2>/dev/null | wc -l
```

### Step 4: Generate Baseline Report

Create `outputs/baseline.md`:

```markdown
# AI-Friendliness Baseline

**Date**: [today]
**Auditor**: Claude

## Quick Stats
- Total packages: [count]
- README coverage: X/Y (Z%)
- AGENTS.md coverage: X/Y (Z%)
- CLAUDE.md lines: [count]

## Pattern Violations (Estimated)
- Native array methods: ~X
- Native Date: ~X
- any types: ~X
- Switch statements: ~X

## Next Steps
1. Deploy parallel agents for detailed audit
2. Focus on [highest violation area] first
```

---

## Parallel Agent Deployment

Launch these agents simultaneously:

| Agent | Subagent Type | Prompt Source |
|-------|---------------|---------------|
| Documentation | Explore | AGENT_PROMPTS.md#agent-1 |
| Structure | Explore | AGENT_PROMPTS.md#agent-2 |
| Patterns | Explore | AGENT_PROMPTS.md#agent-3 |
| Configuration | Explore | AGENT_PROMPTS.md#agent-4 |
| CLAUDE.md Optimizer | general-purpose | AGENT_PROMPTS.md#agent-5 |

---

## Expected Timeline

| Phase | Duration | Output |
|-------|----------|--------|
| Discovery | 1 session | audit-context.md |
| Evaluation | 2-3 sessions | evaluation-report.md |
| Synthesis | 1 session | remediation-plan.md |
| Execution | Variable | Fixed codebase |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `MASTER_ORCHESTRATION.md` | Full workflow and methodology |
| `AGENT_PROMPTS.md` | Specialized agent templates |
| `RUBRICS.md` | Scoring criteria |
| `outputs/` | Generated reports (create this) |

---

## Critical Success Factors

1. **Read-only Phase 1**: Don't skip discovery
2. **Verify findings**: Every file:line must exist
3. **Prioritize ruthlessly**: P1 issues first
4. **Include examples**: Before/after for top issues
5. **Self-reflect**: Run checkpoints after each phase

---

## Anti-Patterns to Avoid

| Don't | Do |
|-------|-----|
| Start fixing immediately | Complete full discovery first |
| Report without evidence | Include file:line references |
| Overwhelm with findings | Prioritize top 20 issues |
| Ignore CLAUDE.md rules | Reference rules in findings |
| Create scope creep | Focus only on AI-friendliness |

---

## Validation Checklist

Before declaring audit complete:

- [ ] All packages cataloged
- [ ] All dimensions scored
- [ ] Top 10 issues have before/after examples
- [ ] Remediation plan prioritized
- [ ] CLAUDE.md optimization proposed
- [ ] Package AGENTS.md gaps identified
