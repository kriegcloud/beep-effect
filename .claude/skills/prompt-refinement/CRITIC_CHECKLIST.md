# Critic Evaluation Checklist

This checklist is used during Phase 4 (Review Loop) to evaluate refined prompts. The critic sub-agent evaluates against three categories.

## Category 1: Prompt Engineering Quality

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| PE-1 | Context is specific and actionable | Contains actual file paths, package names, current state |
| PE-2 | Objective has clear success criteria | Includes measurable outcomes, not vague goals |
| PE-3 | Role matches task complexity | Expertise level appropriate for the task |
| PE-4 | Constraints are explicit | Lists specific rules, not "follow best practices" |
| PE-5 | Resources are specific file paths | No "relevant files" - actual paths only |
| PE-6 | Output format is precisely specified | Exact structure, location, naming defined |
| PE-7 | Examples demonstrate edge cases | Shows both happy path and error scenarios |
| PE-8 | Verification checklist is comprehensive | Binary pass/fail criteria for all requirements |

### Severity Mapping (PE)
- **HIGH**: PE-1, PE-2, PE-4, PE-5 (core clarity issues)
- **MEDIUM**: PE-3, PE-6, PE-8 (execution guidance)
- **LOW**: PE-7 (helpful but not critical)

## Category 2: Repository Alignment

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| RA-1 | Effect-first patterns emphasized | `Effect.gen`, `Layer`, `Schema.TaggedError` mentioned |
| RA-2 | Forbidden patterns explicitly listed | `async/await`, native Array methods, `try/catch` |
| RA-3 | Import conventions specified | Namespace imports, single-letter aliases documented |
| RA-4 | Error handling approach defined | Tagged errors, `Effect.tryPromise` usage |
| RA-5 | Package boundaries respected | Cross-slice via `@beep/shared-*` only |
| RA-6 | Native method prohibitions | No `Date`, `Array.map`, `String.split` |
| RA-7 | Match/Predicate patterns | Use `effect/Match` not switch statements |

### Severity Mapping (RA)
- **HIGH**: RA-1, RA-2, RA-5 (fundamental Effect/repo rules)
- **MEDIUM**: RA-3, RA-4, RA-6 (important idioms)
- **LOW**: RA-7 (stylistic preference)

## Category 3: Clarity & Unambiguity

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| CL-1 | No ambiguous pronouns | "it", "this", "that" replaced with specific nouns |
| CL-2 | No assumed knowledge | All context explicit, no "as you know" |
| CL-3 | No conflicting instructions | Instructions are internally consistent |
| CL-4 | Actionable steps, not abstract goals | "Add X to Y" not "improve the system" |
| CL-5 | Scope boundaries clear | What IS and IS NOT in scope explicitly stated |
| CL-6 | Dependencies acknowledged | Prerequisites and order of operations clear |

### Severity Mapping (CL)
- **HIGH**: CL-1, CL-3, CL-4 (prevents misinterpretation)
- **MEDIUM**: CL-2, CL-5 (context completeness)
- **LOW**: CL-6 (helpful for complex tasks)

## Critic Report Template

```markdown
## Critic Report - Iteration N

### Summary
- Total criteria evaluated: 21
- Passed: X
- Failed: Y
- Skipped (N/A): Z

### Issues Found

#### HIGH Severity
1. [CODE] Description of issue
   - Location: Section X
   - Problem: What's wrong
   - Suggestion: How to fix

#### MEDIUM Severity
1. [CODE] Description of issue
   - Location: Section X
   - Problem: What's wrong
   - Suggestion: How to fix

#### LOW Severity
1. [CODE] Description of issue
   - Location: Section X
   - Problem: What's wrong
   - Suggestion: How to fix

### Opportunities for Improvement
1. Description of opportunity
   - Benefit: Why this helps
   - Suggestion: What to add/change

### Verdict
- [ ] PASS - No HIGH severity issues, minimal MEDIUM issues
- [ ] NEEDS_FIXES - HIGH severity issues found, proceed to fixer
```

## Verdict Decision Logic

```
IF any HIGH severity issues THEN
  verdict = NEEDS_FIXES
ELSE IF more than 3 MEDIUM severity issues THEN
  verdict = NEEDS_FIXES
ELSE
  verdict = PASS
END
```

## Fixer Guidelines

When applying fixes:

1. **HIGH severity**: MUST fix all
2. **MEDIUM severity**: Fix if straightforward, note if complex
3. **LOW severity**: Fix if trivial, otherwise note for user
4. **Opportunities**: Apply if they improve clarity without adding bloat

After fixing:
- Increment `iterations` in frontmatter
- Add row to Refinement History table
- Note which issues were fixed vs deferred
