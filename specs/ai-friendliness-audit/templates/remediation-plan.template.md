# Remediation Plan: beep-effect AI-Friendliness

> Phase 3 Output - Prioritized action items with examples

**Audit Date**: [DATE]
**Auditor**: Claude
**Phase**: 3 - Synthesis

---

## Executive Summary

### Audit Results

| Dimension | Score | Status |
|-----------|-------|--------|
| Documentation | X/5 | [PASS/NEEDS WORK/CRITICAL] |
| Structure | X/5 | [PASS/NEEDS WORK/CRITICAL] |
| Patterns | X/5 | [PASS/NEEDS WORK/CRITICAL] |
| Tooling | X/5 | [PASS/NEEDS WORK/CRITICAL] |
| AI Instructions | X/5 | [PASS/NEEDS WORK/CRITICAL] |
| **Overall** | **X/5** | - |

### Impact Analysis

- **Critical Issues**: [N] (must fix immediately)
- **High Priority**: [N] (fix this sprint)
- **Medium Priority**: [N] (plan for next sprint)
- **Low Priority**: [N] (when convenient)

---

## P1: Critical Fixes (Immediate)

These issues significantly impair AI comprehension and must be fixed immediately.

### P1-01: [Issue Title]

**Finding ID**: [PAT-01, AI-01, etc.]
**Dimension**: [Pattern/Documentation/etc.]
**Files Affected**: [N]

**Problem**:
[Detailed description of the issue and why it's critical]

**Impact on AI Comprehension**:
[Specific explanation of how this affects Claude's ability to understand/modify code]

**Locations**:
| File | Line | Code Snippet |
|------|------|--------------|
| [path] | [N] | `[code]` |
| [path] | [N] | `[code]` |

**Fix**:

```typescript
// BEFORE (packages/example/src/file.ts:42)
[problematic code]

// AFTER
[fixed code]
```

**Verification**:
```bash
# Verify fix with this command
[grep or other command that should return 0 results]
```

---

### P1-02: [Issue Title]

[Same structure as above]

---

## P2: High Priority (This Sprint)

These issues have significant impact but require more careful planning.

### P2-01: [Issue Title]

**Finding IDs**: [DOC-01, etc.]
**Dimension**: [Documentation]
**Estimated Scope**: [N files, ~X lines]

**Problem**:
[Description]

**Impact on AI Comprehension**:
[Explanation]

**Action Items**:
1. [ ] [Specific action]
2. [ ] [Specific action]
3. [ ] [Specific action]

**Example Fix**:

```typescript
// BEFORE
[code]

// AFTER
[code]
```

---

## P3: Medium Priority (Next Sprint)

### P3-01: [Issue Title]

**Finding IDs**: [STR-02, etc.]
**Dimension**: [Structure]

**Quick Description**: [1-2 sentences]

**Action**: [What to do]

---

## P4: Low Priority (Backlog)

### P4-01: [Issue Title]
- **Finding**: [ID]
- **Action**: [Brief description]
- **Defer Reason**: [Why it can wait]

---

## CLAUDE.md Optimization

### Current State
- Lines: [N] (target: <60)
- Instruction keywords: [N]
- Code example blocks: [N]

### Proposed Structure

```markdown
# AGENTS.md

## Commands
bun install | bun run dev | bun run build | bun run check | bun run lint:fix

## Structure
apps/ packages/ tooling/

## Critical Rules
1. Effect patterns: import * as A from "effect/Array"
2. No native Date (use DateTime)
3. No any or @ts-ignore
4. Effect.gen not async/await
5. Verify before suggesting

## Navigation
- Package AGENTS.md for specifics
- documentation/patterns/ for examples
```

### Content Extraction Plan

| Current Section | Lines | Destination |
|-----------------|-------|-------------|
| [Section name] | [N] | packages/*/AGENTS.md |
| [Section name] | [N] | Claude Skill |
| [Section name] | [N] | documentation/patterns/ |

---

## Package AGENTS.md Coverage

### Missing AGENTS.md Files

Create AGENTS.md for these packages:

| Package | Priority | Template |
|---------|----------|----------|
| packages/common/contract | HIGH | contract-agents.md |
| packages/common/schema | HIGH | schema-agents.md |
| packages/shared/domain | HIGH | domain-agents.md |
| [continue for all missing] | | |

### Template: Domain Package AGENTS.md

```markdown
# @beep/[slice]-domain AGENTS.md

## Purpose
[Slice] domain entities and value objects.

## Key Files
- src/entities/[Entity].ts - Main entity model
- src/value-objects/ - Value object schemas

## Patterns
- Entities extend S.Class with Brand types
- Use EntityId from @beep/shared-domain
- No side effects in domain layer

## Testing
bun run test --filter=@beep/[slice]-domain
```

---

## Implementation Checklist

### Week 1: Critical Fixes
- [ ] P1-01: [Action]
- [ ] P1-02: [Action]
- [ ] Optimize CLAUDE.md to <100 lines

### Week 2: High Priority
- [ ] P2-01: [Action]
- [ ] P2-02: [Action]
- [ ] Create AGENTS.md for top 10 packages

### Week 3: Medium Priority
- [ ] P3-01: [Action]
- [ ] P3-02: [Action]
- [ ] Complete AGENTS.md coverage

### Ongoing
- [ ] Monitor for new pattern violations
- [ ] Update docs as code evolves
- [ ] Review CLAUDE.md quarterly

---

## Validation Protocol

After implementing fixes:

### Automated Checks
```bash
# Pattern violations should decrease
grep -rn ": any\b" packages/*/src/**/*.ts | wc -l  # Target: 0
grep -rn "new Date()" packages/*/src/**/*.ts | wc -l  # Target: 0

# Documentation coverage should increase
find packages -name "AGENTS.md" | wc -l  # Target: [N]
find packages -name "README.md" | wc -l  # Target: [N]

# CLAUDE.md should be shorter
wc -l CLAUDE.md  # Target: <100
```

### Manual Validation
1. [ ] Ask Claude to explain a complex module - should be accurate
2. [ ] Ask Claude to add a feature - should follow patterns
3. [ ] Ask Claude to fix a bug - should find right location

---

## Success Metrics

| Metric | Before | Target | Method |
|--------|--------|--------|--------|
| Overall Score | X/5 | >4.0 | Re-audit |
| Critical Violations | [N] | 0 | grep |
| CLAUDE.md Lines | [N] | <100 | wc -l |
| AGENTS.md Coverage | X% | >90% | find |
| README Coverage | X% | 100% | find |

---

## Appendix: Full Findings Index

| ID | Dimension | Severity | Status |
|----|-----------|----------|--------|
| DOC-01 | Documentation | HIGH | [ ] |
| DOC-02 | Documentation | MED | [ ] |
| STR-01 | Structure | MED | [ ] |
| PAT-01 | Patterns | CRITICAL | [ ] |
| PAT-02 | Patterns | HIGH | [ ] |
| TOOL-01 | Tooling | LOW | [ ] |
| AI-01 | AI Instructions | HIGH | [ ] |
| AI-02 | AI Instructions | MED | [ ] |
