# Documents Packages AGENTS.md Alignment Report

> Audit of AGENTS.md files in `packages/documents/` against synthesized best practices from `SYNTHESIZED_BEST_PRACTICES.md`.

---

## Executive Summary

| Package | Alignment Score | Grade |
|---------|-----------------|-------|
| `@beep/documents-server` | 14/16 | Minor improvements available |
| `@beep/documents-tables` | 12/16 | Minor improvements available |
| `@beep/documents-domain` | 13/16 | Minor improvements available |
| `@beep/documents-ui` | 11/16 | Moderate improvements needed |
| `@beep/documents-client` | 10/16 | Moderate improvements needed |

**Overall Assessment**: The documents slice AGENTS.md files demonstrate strong architectural documentation and Effect-specific guardrails. The mature packages (server, domain, tables) score well, while stub packages (ui, client) have appropriate forward-looking documentation but lack operational depth.

---

## Per-File Analysis

### 1. `packages/documents/server/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/server/AGENTS.md`

#### Alignment Score: 14/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections with descriptive headings |
| Commands | 2/2 | Commands with `--filter` flag and clear descriptions |
| Specificity | 2/2 | Highly actionable instructions with file paths |
| Constraints | 2/2 | Clear DO/DON'T with emphasis on Effect guardrails |
| Architecture | 2/2 | Detailed surface map with file locations |
| Testing | 1/2 | Commands present but no test workflow description |
| Security | 1/2 | No explicit security notes (S3/credentials handling implicit) |
| Maintainability | 2/2 | Well-organized with focused sections |

#### Issues Found

| Line | Issue | Severity |
|------|-------|----------|
| 42 | Missing emphasis keyword for critical guardrail "Always import Effect namespaces" | LOW |
| 44 | "never inspect `process.env`" should use "NEVER" emphasis | MEDIUM |
| 101-104 | Verification commands lack error handling guidance | LOW |

#### Missing Elements

1. **Security Section**: No explicit guidance on handling S3 credentials, signed URLs, or sensitive file operations
2. **Testing Workflow**: Commands exist but no description of integration test setup or mocking strategies
3. **Error Handling**: No documentation of tagged error types or recovery patterns

#### Anti-Patterns

- None detected - this file follows best practices well

#### Recommendations

1. Add `NEVER` keyword to line 44 for `process.env` prohibition
2. Add a brief Security section covering S3 credential handling
3. Expand Verifications with brief notes on test isolation requirements

---

### 2. `packages/documents/tables/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/tables/AGENTS.md`

#### Alignment Score: 12/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections with logical flow |
| Commands | 2/2 | All commands with descriptions including db:generate |
| Specificity | 2/2 | Specific factory names and file patterns |
| Constraints | 2/2 | Good guardrails with clear prohibitions |
| Architecture | 1/2 | Surface map present but missing relation details |
| Testing | 1/2 | Commands present but sparse test guidance |
| Security | 1/2 | Mentions no runtime config but no explicit security notes |
| Maintainability | 1/2 | Good structure but checklist uses markdown checkboxes (formatting concern) |

#### Issues Found

| Line | Issue | Severity |
|------|-------|----------|
| 29 | "Avoid direct `process.env` access" should use "NEVER" | MEDIUM |
| 44-50 | Contributor checklist uses `[ ]` checkboxes which may not render in all contexts | LOW |
| 19-21 | Relations and schema export descriptions are brief | LOW |

#### Missing Elements

1. **Quick Recipes**: No code examples showing table creation patterns
2. **Usage Snapshots**: Missing concrete references to consuming packages
3. **Warnings/Gotchas**: No section for migration pitfalls or schema evolution warnings

#### Anti-Patterns

- Checklist uses markdown checkboxes which may not be consistently useful for AI agents

#### Recommendations

1. Add `NEVER` emphasis to `process.env` prohibition (line 29)
2. Add a Quick Recipes section showing `Table.make` and `OrgTable.make` usage patterns
3. Add Usage Snapshots section with cross-package references (similar to server AGENTS.md)
4. Consider converting checklist checkboxes to imperative statements

---

### 3. `packages/documents/domain/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/domain/AGENTS.md`

#### Alignment Score: 13/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Well-organized with clear sections |
| Commands | 2/2 | Comprehensive including `bunx effect generate` |
| Specificity | 2/2 | Detailed entity and value object listings |
| Constraints | 2/2 | Strong Effect guardrails with "Do not add new native" |
| Architecture | 2/2 | Excellent surface map with entity descriptions |
| Testing | 1/2 | Commands present but no test pattern guidance |
| Security | 1/2 | Data validation mentioned but no security section |
| Maintainability | 1/2 | Good but checklist uses checkboxes |

#### Issues Found

| Line | Issue | Severity |
|------|-------|----------|
| 37 | Long constraint sentence lacks emphasis keywords | LOW |
| 30-33 | Usage Snapshots use "Likely consumes" language - should be verified | MEDIUM |
| 79-85 | Checklist uses `[ ]` checkboxes | LOW |

#### Missing Elements

1. **Warnings/Gotchas**: No section for domain modeling pitfalls
2. **Error Handling Patterns**: Domain errors mentioned but not documented
3. **Security Notes**: No guidance on data sanitization for domain models

#### Anti-Patterns

- Usage Snapshots contain uncertain language ("Likely consumes") rather than verified references

#### Recommendations

1. Verify and update Usage Snapshots with confirmed file:line references
2. Add a brief Errors section documenting the error tagging pattern from `src/errors.ts`
3. Add emphasis keywords ("NEVER", "ALWAYS") to critical guardrails (line 37)
4. Convert checklist to imperative statements

---

### 4. `packages/documents/ui/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/ui/AGENTS.md`

#### Alignment Score: 11/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Good organization despite stub status |
| Commands | 1/2 | Commands present but syntax inconsistent (`--filter` vs `-filter`) |
| Specificity | 2/2 | Strong NEVER/ALWAYS constraints for UI patterns |
| Constraints | 2/2 | Excellent Effect guardrails including DateTime, Match |
| Architecture | 1/2 | Planned architecture only - no current implementation |
| Testing | 1/2 | Brief mention, appropriate for stub |
| Security | 1/2 | Data validation mentioned but no explicit security |
| Maintainability | 1/2 | Checklist uses checkboxes |

#### Issues Found

| Line | Issue | Severity |
|------|-------|----------|
| 39 | Command syntax `--filter @beep/documents-ui` differs from other files (`--filter=@beep/documents-ui`) | MEDIUM |
| 40-41 | Inconsistent command format | MEDIUM |
| 8-9 | Current State section acknowledges stub but could be clearer | LOW |

#### Missing Elements

1. **Quick Recipes**: No code examples for component patterns
2. **Usage Snapshots**: None (appropriate for stub but should be added when implemented)
3. **Cross-Reference Links**: No `@import` to shared UI patterns

#### Anti-Patterns

- Inconsistent command syntax compared to sibling packages

#### Recommendations

1. Standardize command syntax to `--filter=@beep/documents-ui` (line 39-41)
2. Add `@import` reference to `packages/ui/ui/AGENTS.md` for design system patterns
3. Add placeholder Quick Recipes section with intended component patterns
4. Convert checklist to imperative statements

---

### 5. `packages/documents/client/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/client/AGENTS.md`

#### Alignment Score: 10/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections appropriate for stub |
| Commands | 2/2 | Consistent command format |
| Specificity | 1/2 | Good guardrails but less detailed than siblings |
| Constraints | 1/2 | Effect guardrails present but fewer than server package |
| Architecture | 1/2 | Planned architecture only |
| Testing | 1/2 | Commands present but minimal guidance |
| Security | 1/2 | Configuration injection mentioned but no auth token handling guidance |
| Maintainability | 1/2 | Checklist uses checkboxes |

#### Issues Found

| Line | Issue | Severity |
|------|-------|----------|
| 21 | Missing emphasis keywords on constraints | LOW |
| 22 | "reading globals" should be emphasized with NEVER | MEDIUM |
| 56-61 | Checklist uses `[ ]` checkboxes | LOW |

#### Missing Elements

1. **Security Section**: Client handles auth tokens - needs explicit security guidance
2. **Error Handling**: No documentation of how client errors map to domain errors
3. **Warnings/Gotchas**: No section for common client implementation pitfalls

#### Anti-Patterns

- Security-sensitive package (handles auth tokens) lacks explicit security section

#### Recommendations

1. Add Security section covering auth token handling, storage, and transmission
2. Add emphasis keywords to guardrails (line 21-22)
3. Add Error Handling section documenting how server errors are decoded
4. Convert checklist to imperative statements

---

## Cross-Cutting Recommendations

### High Priority

1. **Standardize Command Syntax**: All packages should use `--filter=@beep/package-name` format consistently

2. **Add Security Sections**: Packages handling credentials, tokens, or file storage need explicit security guidance:
   - `documents-server`: S3 credentials, signed URLs
   - `documents-client`: Auth token handling

3. **Replace Checklist Checkboxes**: Convert `[ ]` markdown checkboxes to imperative statements for better AI agent consumption

### Medium Priority

4. **Add Emphasis Keywords**: Strengthen critical rules with `NEVER`, `ALWAYS`, `IMPORTANT` keywords:
   - `process.env` prohibitions should use `NEVER`
   - Effect namespace import requirements should use `ALWAYS`

5. **Verify Usage Snapshots**: Update uncertain language ("Likely consumes") with verified file:line references

6. **Add Error Handling Documentation**: Each package should document its error types and recovery patterns

### Low Priority

7. **Add Quick Recipes to Schema Package**: `documents-tables` lacks code examples

8. **Cross-Reference Links**: Add `@import` references to shared pattern documentation where relevant

9. **Testing Workflow Documentation**: Expand beyond commands to include test isolation and mocking strategies

---

## Pattern Compliance Summary

### Excellent Compliance

- Effect namespace import guardrails (all files)
- Surface Map documentation (server, domain, tables)
- Command documentation with descriptions (all files)
- Clear package purpose statements (all files)

### Moderate Compliance

- Emphasis keywords for critical rules (inconsistent)
- Usage Snapshots (missing in some, uncertain in others)
- Security guidance (implicit rather than explicit)

### Needs Improvement

- Checklist format (checkboxes vs imperative)
- Command syntax consistency (varies across files)
- Error handling documentation (minimal)

---

## Rubric Reference

Scores based on SYNTHESIZED_BEST_PRACTICES.md Section 10:

| Score Range | Interpretation |
|-------------|----------------|
| 0-6 | Critical improvements needed |
| 7-10 | Moderate improvements needed |
| 11-14 | Minor improvements available |
| 15-16 | Excellent configuration |

All documents slice packages fall within the "Minor improvements available" to "Moderate improvements needed" range, indicating solid foundations with room for enhancement.
