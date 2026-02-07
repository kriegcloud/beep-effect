# Skill Improvement Plan

> Prioritized actions to improve skill quality based on P1 assessment.

---

## Executive Summary

| Category | Count | Action |
|----------|-------|--------|
| **Remove** | 1 | agentation (64/102) |
| **Merge** | 4 | Auth skills (3→1), Platform (3→1) |
| **Rewrite** | 2 | wide-events, prompt-refinement |
| **Fix Frontmatter** | 3 | parallel-explore, path, 5 others |
| **Add Examples** | 3 | context-witness, session-handoff, etc. |
| **Keep As-Is** | 32 | Score ≥95 |

**Net Result**: 45 → 39 skills (13% reduction, quality increase)

---

## Priority 1: Critical Issues (This Session)

### 1.1 Remove agentation (64/102)

**Problem**: Minimal value, too basic, not beep-specific.

**Action**: Delete `.claude/skills/agentation/` directory.

**Verification**: `ls .claude/skills/ | grep agentation` returns nothing.

---

### 1.2 Consolidate Auth Skills (3 → 1)

**Current State**:
- `Better Auth Best Practices` (98/102)
- `Create Auth Skill` (88/102, 80% overlap)
- `better-auth-best-practices` (symlink to above)

**Action**:
1. Keep `better-auth-best-practices` as canonical kebab-case name
2. Merge unique content from `Create Auth Skill` into it
3. Delete `Better Auth Best Practices` directory (space-named)
4. Delete `Create Auth Skill` directory
5. Update symlink if needed

**Verification**: Only one auth skill remains in kebab-case.

---

### 1.3 Add Missing Frontmatter (7 skills)

| Skill | Missing | Template |
|-------|---------|----------|
| cli | frontmatter | Standard YAML |
| discovery-kit | frontmatter | Standard YAML |
| filesystem | frontmatter | Standard YAML |
| path | frontmatter | Standard YAML |
| platform-layers | frontmatter | Standard YAML |
| prompt-refinement | frontmatter | Standard YAML |
| research-orchestration | frontmatter | Standard YAML |

**Action**: Add YAML frontmatter to each:

```yaml
---
name: skill-name
description: Brief description for discovery
triggers:
  - primary trigger phrase
  - secondary trigger
categories:
  - primary-category
---
```

---

## Priority 2: Content Improvements (Next Session)

### 2.1 Rewrite wide-events (84/102)

**Problem**: Cryptic formal notation (`:=`, `∧`, `∨`) reduces accessibility.

**Action**:
1. Replace formal notation with plain English
2. Add concrete OTel span annotation examples
3. Add "When to Use" decision tree
4. Increase clarity score from 12→15

**Target Score**: 95/102

---

### 2.2 Complete prompt-refinement (86/102)

**Problem**: References missing external files (COSTAR_CRISPE_FORMAT.md, CRITIC_CHECKLIST.md).

**Action**:
1. Inline COSTAR+CRISPE template
2. Add critic checklist directly
3. Remove external file references
4. Increase completeness score from 11→15

**Target Score**: 96/102

---

### 2.3 Fix legal-review (90/102)

**Problem**: References undefined `/lawyer` agent.

**Action**:
1. Either define `/lawyer` agent in manifest
2. Or remove references and document alternative
3. Add concrete compliance review examples

**Target Score**: 95/102

---

### 2.4 Simplify subagent-driven-development (90/102)

**Problem**: Two-stage review workflow is heavyweight, DOT diagrams assume rendering.

**Action**:
1. Inline critical prompt templates
2. Replace DOT diagrams with ASCII
3. Document when simpler approach suffices
4. Reduce complexity while maintaining value

**Target Score**: 94/102

---

## Priority 3: Consolidation (Future)

### 3.1 Consider Platform Merge

**Candidates**:
- `filesystem` (95/102)
- `path` (92/102)
- `platform-abstraction` (97/102)
- `platform-layers` (97/102)

**Analysis**:
- 60% content overlap
- Different entry points, same underlying patterns
- May confuse users ("which platform skill do I use?")

**Recommendation**: Evaluate in P2 whether merge improves discoverability.

---

### 3.2 Monitor AI Skill Maintenance

**High Maintenance Risk** (evolving APIs):
- `effect-ai-provider` (6/10 maintenance score)
- `effect-ai-language-model` (7/10)
- `effect-ai-prompt` (7/10)
- `effect-ai-streaming` (9/10)
- `effect-ai-tool` (10/10)

**Action**: Add `last_verified` date to frontmatter, schedule quarterly reviews.

---

## Implementation Checklist

### Session 1 (P1 Completion)

- [ ] Remove agentation skill
- [ ] Consolidate auth skills (3→1)
- [ ] Add frontmatter to 7 skills

### Session 2 (P2)

- [ ] Rewrite wide-events
- [ ] Complete prompt-refinement
- [ ] Fix legal-review /lawyer reference
- [ ] Simplify subagent-driven-development

### Future (P3+)

- [ ] Evaluate platform skill merge
- [ ] Add last_verified dates to AI skills
- [ ] Schedule quarterly maintenance reviews

---

## Success Metrics

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Skill count | 45 | 39 | Remove + merge |
| Mean score | 94.6 | 96+ | Fix issues |
| Skills <90 | 7 | 0 | Targeted improvements |
| Frontmatter coverage | 84% | 100% | Add missing |
| Duplicate rate | 8% | 0% | Consolidation |

---

## Appendix: Skill-by-Skill Actions

| Skill | Score | Action | Priority |
|-------|-------|--------|----------|
| agentation | 64 | Remove | P1 |
| wide-events | 84 | Rewrite | P2 |
| prompt-refinement | 86 | Complete | P2 |
| Create Auth Skill | 88 | Merge | P1 |
| parallel-explore | 88 | Add frontmatter | P1 |
| legal-review | 90 | Fix reference | P2 |
| subagent-driven-development | 90 | Simplify | P2 |
| context-witness | 91 | Add examples | P3 |
| path | 92 | Add frontmatter | P1 |
| session-handoff | 92 | Inline scripts | P3 |
| Better Auth Best Practices | 98 | Remove (merge) | P1 |
| better-auth-best-practices | 98 | Keep (canonical) | - |
| All others (32) | 93-100 | Keep as-is | - |

---

*Generated: 2026-02-03*
*Phase: P1 Skill Quality Assessment*
