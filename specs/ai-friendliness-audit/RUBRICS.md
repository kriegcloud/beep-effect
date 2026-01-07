# AI-Friendliness Audit: Evaluation Rubrics

> Standardized scoring criteria for consistent evaluation across agents.

---

## Overview

All dimensions are scored 1-5 with specific, observable criteria. Scores must include:
- Quantitative evidence where possible
- File:line references for issues
- Confidence level (high/medium/low)

---

## Dimension 1: Documentation Quality

### Score Criteria

| Score | README | JSDoc | @example | AGENTS.md |
|-------|--------|-------|----------|-----------|
| 5 | Complete, current | >90% exports | Complex functions | Present, detailed |
| 4 | Good, minor gaps | >70% exports | >50% complex | Present, basic |
| 3 | Exists, outdated | >50% exports | Few examples | Missing |
| 2 | Minimal | >30% exports | None | Missing |
| 1 | Missing | <30% exports | None | Missing |

### Measurement Commands

```bash
# README presence
find packages -name "README.md" -type f | wc -l

# JSDoc coverage (sample)
grep -c "/\*\*" packages/common/contract/src/Contract.ts
grep -c "export" packages/common/contract/src/Contract.ts

# @example coverage
grep -c "@example" packages/common/contract/src/*.ts

# AGENTS.md presence
find packages -name "AGENTS.md" -type f | wc -l
```

### Evidence Format

```markdown
**Documentation Score**: X/5
**Confidence**: high/medium/low

**Evidence**:
- README coverage: X/Y packages (Z%)
- JSDoc sample: Contract.ts has X/Y exports documented
- @example count: X in sampled packages
- AGENTS.md: X/Y packages have them

**Key Gaps**:
- [Package]: Missing README
- [Package]: No JSDoc on public API
```

---

## Dimension 2: Structural Clarity

### Score Criteria

| Score | Barrel Exports | Naming | Boundaries | Organization |
|-------|----------------|--------|------------|--------------|
| 5 | All packages | 100% compliant | Zero violations | Predictable |
| 4 | >90% packages | >95% compliant | <5 violations | Clear |
| 3 | >70% packages | >80% compliant | 5-15 violations | Reasonable |
| 2 | >50% packages | >60% compliant | 15-30 violations | Confusing |
| 1 | <50% packages | <60% compliant | >30 violations | Chaotic |

### Naming Convention Reference

| Element | Convention | Example |
|---------|------------|---------|
| Files (modules) | kebab-case | `user-service.ts` |
| Files (React) | PascalCase | `UserCard.tsx` |
| Directories | lowercase-hyphen | `value-objects/` |
| Types/Classes | PascalCase | `UserEntity` |
| Functions | camelCase | `createUser` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |

### Boundary Rules

| From | To | Allowed? |
|------|-----|----------|
| apps/* | @beep/* packages | YES |
| apps/* | apps/* | NO |
| packages/iam/* | packages/iam/* | YES |
| packages/iam/* | packages/documents/* | NO |
| packages/iam/* | packages/shared/* | YES |
| packages/shared/* | packages/iam/* | NO |

### Measurement Commands

```bash
# Barrel export check
for pkg in packages/*/*/; do
  [ -f "${pkg}src/index.ts" ] && echo "Y" || echo "N"
done | sort | uniq -c

# Cross-slice violations
grep -rn "from \"@beep/iam" packages/documents/ --include="*.ts" | wc -l
grep -rn "from \"@beep/documents" packages/iam/ --include="*.ts" | wc -l

# Naming violations (manual sample)
ls packages/common/contract/src/
```

### Evidence Format

```markdown
**Structure Score**: X/5
**Confidence**: high/medium/low

**Evidence**:
- Barrel exports: X/Y packages (Z%)
- Cross-slice violations: X found
- Naming compliance: Sampled 20 files, Y violations

**Key Issues**:
- [file] imports from [forbidden package]
- [file] uses [wrong naming convention]
```

---

## Dimension 3: Effect Pattern Compliance

### Score Criteria

| Score | Array Methods | Date | Match | Effect | Types |
|-------|---------------|------|-------|--------|-------|
| 5 | 0 native | 0 native | 100% Match | 100% Effect.gen | 0 any |
| 4 | <10 native | <5 native | >90% Match | >95% Effect | <5 any |
| 3 | 10-30 native | 5-15 native | >70% Match | >80% Effect | 5-15 any |
| 2 | 30-100 native | 15-50 native | >50% Match | >60% Effect | 15-30 any |
| 1 | >100 native | >50 native | <50% Match | <60% Effect | >30 any |

### Violation Categories

| Category | Pattern | Severity |
|----------|---------|----------|
| Type Safety | `any`, `@ts-ignore`, `as any` | CRITICAL |
| Effect Core | `async/await`, bare Promise | CRITICAL |
| Collections | `.map()`, `.filter()`, `.forEach()` | HIGH |
| Strings | `.toUpperCase()`, `.split()` | HIGH |
| Date | `new Date()`, `Date.now()` | MEDIUM |
| Control Flow | `switch`, long if-else | MEDIUM |
| Objects | `Object.keys()`, `Object.values()` | LOW |

### Measurement Commands

```bash
# Critical violations
grep -rn ": any\b" packages/*/src/**/*.ts 2>/dev/null | wc -l
grep -rn "@ts-ignore" packages/*/src/**/*.ts 2>/dev/null | wc -l
grep -rn "async\s" packages/*/src/**/*.ts 2>/dev/null | wc -l

# High violations
grep -rn "\.map\(" packages/*/src/**/*.ts 2>/dev/null | grep -v "A\.map" | wc -l
grep -rn "\.filter\(" packages/*/src/**/*.ts 2>/dev/null | grep -v "A\.filter" | wc -l

# Medium violations
grep -rn "new Date\(\)" packages/*/src/**/*.ts 2>/dev/null | wc -l
grep -rn "switch\s*\(" packages/*/src/**/*.ts 2>/dev/null | wc -l
```

### Evidence Format

```markdown
**Pattern Score**: X/5
**Confidence**: high/medium/low

**Violation Counts**:
- CRITICAL: any (X), async (Y)
- HIGH: native array (X), native string (Y)
- MEDIUM: Date (X), switch (Y)

**Top Locations**:
1. [file:line] - [violation type]
2. [file:line] - [violation type]

**Sample Fix**:
```typescript
// Before (file:line)
items.map(x => x.id)

// After
F.pipe(items, A.map(x => x.id))
```
```

---

## Dimension 4: Tooling Integration

### Score Criteria

| Score | TypeScript | Linting | Testing | CI/CD |
|-------|------------|---------|---------|-------|
| 5 | Strictest mode | Full coverage | >80% coverage | Complete |
| 4 | Strict mode | Good coverage | >60% coverage | Good |
| 3 | Default strict | Basic rules | >40% coverage | Basic |
| 2 | Loose settings | Minimal rules | <40% coverage | Minimal |
| 1 | No strict | No linting | No tests | None |

### TypeScript Strictness Checklist

| Option | Recommended | Current |
|--------|-------------|---------|
| strict | true | ? |
| noUncheckedIndexedAccess | true | ? |
| exactOptionalPropertyTypes | true | ? |
| noImplicitOverride | true | ? |
| noPropertyAccessFromIndexSignature | true | ? |

### Measurement Commands

```bash
# TypeScript settings
cat tsconfig.base.jsonc | grep -E "strict|noUnchecked|exact|noImplicit"

# Test file count
find packages -name "*.test.ts" | wc -l

# Biome rules
cat biome.jsonc | grep -c "error\|warn"
```

### Evidence Format

```markdown
**Tooling Score**: X/5
**Confidence**: high/medium/low

**TypeScript**:
- strict: true/false
- noUncheckedIndexedAccess: true/false
- Gaps: [list missing strict options]

**Linting**:
- Biome rules active: X
- Custom rules: Y

**Testing**:
- Test files: X
- Test coverage: Unknown/X%

**Recommendations**:
- Enable [option] in tsconfig
- Add Biome rule [rule]
```

---

## Dimension 5: AI Instruction Optimization

### Score Criteria (CLAUDE.md)

| Score | Line Count | Structure | Progressive Disclosure |
|-------|------------|-----------|------------------------|
| 5 | <60 lines | Perfect hierarchy | Full Skills system |
| 4 | 60-100 lines | Good structure | Package AGENTS.md |
| 3 | 100-200 lines | Some structure | Partial hierarchy |
| 2 | 200-400 lines | Flat structure | No hierarchy |
| 1 | >400 lines | Unorganized | No hierarchy |

### Instruction Categories

| Category | Keep in Root? | Extract To |
|----------|---------------|------------|
| Essential commands | YES | - |
| Project structure | YES | - |
| Critical 5 rules | YES | - |
| Full pattern docs | NO | Package AGENTS.md |
| Code examples | NO | Claude Skills |
| Testing guides | NO | Package AGENTS.md |

### Measurement

```bash
# Current state
wc -l CLAUDE.md
grep -c "MUST\|NEVER\|ALWAYS" CLAUDE.md
grep -c "```" CLAUDE.md  # Code examples

# Package AGENTS.md coverage
find packages -name "AGENTS.md" | wc -l
find packages -maxdepth 3 -type d | wc -l
```

### Evidence Format

```markdown
**AI Instruction Score**: X/5
**Confidence**: high/medium/low

**Current State**:
- CLAUDE.md lines: X
- Instruction keywords: Y
- Code examples: Z blocks
- Package AGENTS.md: X/Y (Z%)

**Optimization Potential**:
- Lines reducible: ~X
- Content to extract: [categories]
- Skills candidates: [list]
```

---

## Aggregate Scoring

### Overall Score Calculation

```
Overall = (Doc × 0.25) + (Structure × 0.25) + (Pattern × 0.20) + (Tooling × 0.15) + (Instructions × 0.15)
```

### Score Interpretation

| Overall | Rating | Action |
|---------|--------|--------|
| 4.5-5.0 | Excellent | Maintain |
| 3.5-4.4 | Good | Minor improvements |
| 2.5-3.4 | Fair | Focused remediation |
| 1.5-2.4 | Poor | Significant work needed |
| 1.0-1.4 | Critical | Major overhaul |

---

## Confidence Levels

| Level | Meaning | When to Use |
|-------|---------|-------------|
| High | Verified via multiple methods | grep + manual inspection |
| Medium | Single verification method | grep only |
| Low | Estimated or sampled | Small sample, extrapolated |

Always state confidence level with every score.
