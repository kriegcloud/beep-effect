# Tooling and Internal Packages AGENTS.md Alignment Report

## Overview

This report audits AGENTS.md files in the `tooling/` and `packages/_internal/` directories against the synthesized best practices reference.

**Files Audited:**
- `tooling/scraper/AGENTS.md`
- `tooling/testkit/AGENTS.md`
- `tooling/utils/AGENTS.md`
- `tooling/cli/AGENTS.md`
- `tooling/repo-scripts/AGENTS.md`
- `tooling/build-utils/AGENTS.md`
- `packages/_internal/db-admin/AGENTS.md`

**Aggregate Statistics:**
- Average Score: 11.7/16
- Status: GOOD (Minor improvements available)
- Consistent Patterns: All files follow similar structure, demonstrating good template usage

---

## Per-File Analysis

---

### 1. tooling/scraper/AGENTS.md

**Alignment Score: 12/16**
**Status: GOOD**

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clear sections: Purpose, Surface Map, Usage Snapshots, Guardrails, Recipes, Verifications, Checklist |
| **Commands** | 2/2 | Verifications section with filter-specific commands and descriptions |
| **Specificity** | 2/2 | Highly specific: "Use `Queue.bounded` for work distribution, never unbounded queues" |
| **Constraints** | 2/2 | Clear DO/DON'T patterns with domain-specific prohibitions |
| **Architecture** | 2/2 | Surface map details every file with responsibilities |
| **Testing** | 1/2 | Has verification commands but no testing workflow/patterns |
| **Security** | 1/2 | No explicit security notes (relevant for web scraping - rate limiting, robots.txt) |
| **Maintainability** | 0/2 | 153 lines in single file, should consider modularization |

#### Strengths
1. **Excellent Surface Map**: Each file documented with bullet points describing services, errors, and configuration.
2. **Quick Recipes with Context**: Code examples show actual Effect patterns with namespace imports.
3. **Contributor Checklist**: Comprehensive checkbox list ensures consistency.
4. **Tagged Error Guidance**: Explicit instructions on error handling patterns (`PlaywrightError`, `PageLoadError`).

#### Issues Found

**Issue 1: Missing Emphasis Keywords**
- **Location**: AGENTS.md:L31-41
- **Problem**: Critical rules like "never unbounded queues" and "Use `HashSet` for visited URL tracking, never native Set" lack NEVER/ALWAYS keywords at the start.
- **Suggested Fix**:
  ```markdown
  - NEVER use unbounded queues; use `Queue.bounded` for work distribution
  - NEVER use native Set; use `HashSet` for visited URL tracking
  ```

**Issue 2: Code Example Uses Emoji**
- **Location**: N/A (not detected in scraper, but noted for consistency)
- **Problem**: Quick recipes are clean, but other tooling files use emoji in examples.

**Issue 3: Missing Security Considerations**
- **Location**: N/A (missing section)
- **Problem**: Web scraping has inherent security concerns (rate limiting, respecting robots.txt, handling authentication).
- **Suggested Fix**: Add Gotchas section with scraping best practices.

**Issue 4: File Length at Modularization Threshold**
- **Location**: Entire file (153 lines)
- **Problem**: Above 100-line threshold for single-file configs.

---

### 2. tooling/testkit/AGENTS.md

**Alignment Score: 12/16**
**Status: GOOD**

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Consistent structure with all required sections |
| **Commands** | 2/2 | Verifications with multiple command options and cross-package guidance |
| **Specificity** | 2/2 | Very specific: "call `Layer.makeMemoMap` per suite when wiring `layer`" |
| **Constraints** | 2/2 | Clear constraints on memo maps, `flakyTest` usage, `prop` limitations |
| **Architecture** | 2/2 | Detailed surface map with internal plumbing documentation |
| **Testing** | 1/2 | Ironic: testkit docs mention testing but lack own testing workflow |
| **Security** | 1/2 | No security notes (test data isolation, fixtures) |
| **Maintainability** | 0/2 | 117 lines, above modularization threshold |

#### Strengths
1. **Outstanding Specificity**: Instructions like "set `excludeTestServices: true` when supplying a Layer that already exports testing services" are actionable.
2. **Documented Limitations**: Explicitly notes `prop` is stubbed and FastCheck is not wired.
3. **Cross-Package Integration Notes**: References `@beep/db-admin` tests for real-world examples.
4. **Multiple Quick Recipes**: Shows `effect`, `scoped`, `layer`, and `describeWrapped` patterns.

#### Issues Found

**Issue 1: Missing IMPORTANT/NEVER Keywords**
- **Location**: AGENTS.md:L26-33
- **Problem**: Critical guardrails missing emphasis:
  - "Maintain namespace imports" should be "ALWAYS maintain..."
  - "avoid native `Promise`, `setTimeout`" should be "NEVER use native..."
- **Suggested Fix**:
  ```markdown
  - ALWAYS maintain namespace imports (`import * as Effect from "effect/Effect"`)
  - NEVER use native `Promise`, `setTimeout`, or Array/String helpers
  ```

**Issue 2: Incomplete Testing Section**
- **Location**: Verifications section
- **Problem**: For a testing library, should include:
  - How to test the testkit itself
  - Integration testing patterns
  - Coverage expectations

**Issue 3: Missing Gotchas Section**
- **Location**: N/A (missing)
- **Problem**: No warnings about common testkit pitfalls (scope leaks, memo map issues).
- **Suggested Fix**: Add section documenting common mistakes.

---

### 3. tooling/utils/AGENTS.md

**Alignment Score: 13/16**
**Status: GOOD - Near Excellent**

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized with comprehensive Surface Map |
| **Commands** | 2/2 | Multiple verification commands including standalone execution |
| **Specificity** | 2/2 | Precise: "`FsUtils.writeJson` produces stable two-space formatting without trailing newline" |
| **Constraints** | 2/2 | Strong constraints on Layer injection, error handling, schema usage |
| **Architecture** | 2/2 | Detailed file-by-file surface map with responsibilities |
| **Testing** | 2/2 | Complete testing commands with standalone option |
| **Security** | 1/2 | No explicit security notes |
| **Maintainability** | 0/2 | 106 lines, at modularization threshold |

#### Strengths
1. **Best Surface Map in Set**: Comprehensive documentation of every module with dependencies.
2. **Usage Snapshots with File References**: Points to actual usage in `tooling/repo-scripts/*`.
3. **Layer Composition Guidance**: Clear instructions on `Layer.provideMerge` vs `Layer.mergeAll`.
4. **Schema Documentation**: Notes on `WorkspacePkgValue` specifier support limitations.

#### Issues Found

**Issue 1: Partial Emphasis Keywords**
- **Location**: AGENTS.md:L41-49
- **Problem**: Some rules use "Always" but not ALWAYS (uppercase for emphasis):
  - "Always inject `FsUtils`/`RepoUtils` via their tags"
  - "Preserve spans and error translations"
- **Suggested Fix**: Use uppercase ALWAYS/NEVER for critical rules.

**Issue 2: Missing Security Section**
- **Location**: N/A (missing)
- **Problem**: Filesystem utilities have security implications (path traversal, symlink attacks).
- **Suggested Fix**: Add note about path validation, especially for `glob` operations.

**Issue 3: Standalone Command Inconsistency**
- **Location**: AGENTS.md:L95
- **Problem**: Standalone command uses different syntax (`bun run --cwd tooling/utils test`) than filter syntax.
- **Suggested Fix**: Document both consistently and explain when to use each.

---

### 4. tooling/cli/AGENTS.md

**Alignment Score: 11/16**
**Status: GOOD**

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clean structure with all sections |
| **Commands** | 2/2 | Clear CLI invocation examples with flags |
| **Specificity** | 2/2 | Specific: "Commands should provide `FsUtilsLive`, `BunContext.layer`, and `BunTerminal.layer`" |
| **Constraints** | 1/2 | Good constraints but lacks emphasis keywords |
| **Architecture** | 2/2 | Surface map documents commands and their purposes |
| **Testing** | 1/2 | Has verification commands, missing testing workflow |
| **Security** | 0/2 | No security notes (CLI handles env vars, file writes) |
| **Maintainability** | 1/2 | 113 lines, at threshold but reasonable for CLI docs |

#### Strengths
1. **CLI-Specific Usage Snapshots**: Shows actual `bun run beep <command>` patterns.
2. **Dependencies Section**: Lists all package dependencies with purposes.
3. **Command Registration Note**: Explicitly mentions updating `src/index.ts` subcommands array.

#### Issues Found

**Issue 1: Missing Emphasis Keywords**
- **Location**: AGENTS.md:L32-38
- **Problem**: All guardrails lack ALWAYS/NEVER emphasis.
- **Suggested Fix**:
  ```markdown
  - ALWAYS use `@effect/cli/Command` for command definitions
  - NEVER use native Array/String methods; use `A.*`, `Str.*` from Effect
  ```

**Issue 2: No Security Section**
- **Location**: N/A (missing)
- **Problem**: CLI handles environment variables and file writes - should have security notes.
- **Suggested Fix**: Add section on:
  - Never logging secrets from env
  - Validating file paths before writes
  - Safe handling of user input

**Issue 3: Missing Gotchas Section**
- **Location**: N/A (missing)
- **Problem**: No warnings about common CLI pitfalls (arg parsing edge cases, terminal compatibility).

---

### 5. tooling/repo-scripts/AGENTS.md

**Alignment Score: 11/16**
**Status: GOOD**

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Comprehensive structure with detailed Surface Map |
| **Commands** | 2/2 | Multiple command options including smoke tests |
| **Specificity** | 2/2 | Very specific: "Keep generator targets in `_generated/` folders idempotent and schema-validated" |
| **Constraints** | 1/2 | Good constraints, missing emphasis keywords |
| **Architecture** | 2/2 | Extensive Surface Map covering all scripts |
| **Testing** | 1/2 | Verification section but incomplete testing workflow |
| **Security** | 0/2 | No security notes (handles secrets in `generate-env-secrets.ts`) |
| **Maintainability** | 1/2 | 111 lines, at threshold |

#### Strengths
1. **Most Comprehensive Surface Map**: Documents every script with purpose.
2. **Generated Artifact Documentation**: Notes where generated files live and their consumers.
3. **Quick Recipes Variety**: Shows CLI patterns, schema validation, file processing.
4. **Contributor Checklist Includes Downstream Impacts**: Notes to update related package guides.

#### Issues Found

**Issue 1: Emoji in Quick Recipe**
- **Location**: AGENTS.md:L52, L63
- **Problem**: Uses emoji in code example (`"Oh from repo-scripts"`, `"Ow ${String(error)}"`).
- **Violates**: Best practice - avoid emojis unless user requests.
- **Suggested Fix**: Replace with plain text or proper logging.

**Issue 2: Missing Security Section**
- **Location**: N/A (missing)
- **Problem**: `generate-env-secrets.ts` handles sensitive data. No security guidance.
- **Suggested Fix**: Add critical security notes:
  ```markdown
  ## Security
  - NEVER log generated secrets
  - NEVER commit `.env` files with secrets
  - ALWAYS use `dotenvx` for secret handling
  ```

**Issue 3: Missing Emphasis Keywords**
- **Location**: AGENTS.md:L34-39
- **Problem**: Critical rules lack emphasis.

**Issue 4: Duplicate Verifications Sections**
- **Location**: AGENTS.md:L28-32 and L99-103
- **Problem**: Two "Verifications" sections with slightly different content.
- **Suggested Fix**: Consolidate into single section.

---

### 6. tooling/build-utils/AGENTS.md

**Alignment Score: 12/16**
**Status: GOOD**

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clean structure with PWA subsection documentation |
| **Commands** | 2/2 | Complete verification commands including build |
| **Specificity** | 2/2 | Specific: "CSP directives should only be relaxed with explicit justification" |
| **Constraints** | 2/2 | Strong security-focused constraints |
| **Architecture** | 2/2 | Detailed Surface Map including PWA submodules |
| **Testing** | 1/2 | Verification commands but no testing workflow |
| **Security** | 1/2 | Security mentioned for CSP/headers but incomplete |
| **Maintainability** | 0/2 | 145 lines, above threshold |

#### Strengths
1. **Security-Focused Guardrails**: Explicit CSP and header security guidance.
2. **PWA Documentation**: Comprehensive Surface Map of PWA submodules.
3. **Usage Snapshots with Complexity Levels**: Shows minimal and advanced configurations.
4. **Dependencies with Purposes**: Lists each dependency with its role.

#### Issues Found

**Issue 1: Missing NEVER/ALWAYS Keywords**
- **Location**: AGENTS.md:L40-48
- **Problem**: Security rules should use strongest emphasis:
  - "Security defaults should be conservative" -> "NEVER relax security defaults without justification"
  - "CSP directives should only be relaxed" -> "NEVER relax CSP without documented justification"

**Issue 2: Incomplete Security Section**
- **Location**: AGENTS.md:L40-48 (within Guardrails)
- **Problem**: Security guidance is embedded in Guardrails, not separate section.
- **Suggested Fix**: Extract to dedicated Security section with comprehensive guidance.

**Issue 3: File Length Above Threshold**
- **Location**: Entire file (145 lines)
- **Problem**: Significantly above 100-line threshold.
- **Suggested Fix**: Consider `.claude/rules/` modularization, especially for PWA content.

---

### 7. packages/_internal/db-admin/AGENTS.md

**Alignment Score: 11/16**
**Status: GOOD**

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized with file:line references |
| **Commands** | 2/2 | Database-specific commands (generate, migrate, push) |
| **Specificity** | 2/2 | Very specific with file:line references |
| **Constraints** | 1/2 | Good constraints but missing emphasis keywords |
| **Architecture** | 2/2 | Detailed Surface Map with cross-package references |
| **Testing** | 1/2 | Notes on commented-out tests but incomplete workflow |
| **Security** | 0/2 | Database package with no security notes (credentials, access control) |
| **Maintainability** | 1/2 | 93 lines, under threshold but notes dead code |

#### Strengths
1. **File:Line References**: Surface Map includes exact line numbers for key exports.
2. **Cross-Package Coordination**: Notes to coordinate with `packages/shared/tables/AGENTS.md`.
3. **Dead Code Documentation**: Explicitly notes commented-out tests and their purpose.
4. **Internal Package Designation**: Clear statement this is `_internal` and should not be a dependency.
5. **Gotcha Detection**: Notes `db:reset` script references non-existent file.

#### Issues Found

**Issue 1: Missing Security Section**
- **Location**: N/A (missing)
- **Problem**: Database admin package has no security guidance.
- **Suggested Fix**: Add critical section:
  ```markdown
  ## Security
  - NEVER commit `DB_PG_URL` or database credentials
  - ALWAYS use `dotenvx` for database URL handling
  - NEVER expose `AdminDb` to production runtimes
  ```

**Issue 2: Missing Emphasis Keywords**
- **Location**: AGENTS.md:L28-36
- **Problem**: Critical rules like "Keep this package `_internal`" lack NEVER keyword.
- **Suggested Fix**:
  ```markdown
  - NEVER declare this package as a dependency of other workspaces
  - ALWAYS generate migrations through `bun run db:generate`
  ```

**Issue 3: Incomplete Testing Documentation**
- **Location**: AGENTS.md:L16-18, L23-25
- **Problem**: Notes tests are commented out but doesn't explain how to re-enable or use them.
- **Suggested Fix**: Add section explaining:
  - How to restore Testcontainers tests
  - Prerequisites (Docker, pg_uuidv7 extension)
  - Expected workflow for integration testing

**Issue 4: Unresolved Dead Reference**
- **Location**: AGENTS.md:L31
- **Problem**: Documents `db:reset` script issue but doesn't recommend immediate action.
- **Suggested Fix**: Add to Contributor Checklist as high-priority item.

---

## Cross-Cutting Issues

### 1. Consistent Lack of Security Sections

**Affected Files**: All 7 files
**Pattern**: None of the files have a dedicated Security section, despite several handling sensitive operations:
- `scraper`: Web requests, potential credential handling
- `repo-scripts`: Secret generation, environment variable handling
- `cli`: Environment configuration
- `db-admin`: Database credentials and migrations

**Recommendation**: Add standardized Security section template to all files.

### 2. Missing Emphasis Keywords Across All Files

**Affected Files**: All 7 files
**Pattern**: Critical rules consistently lack NEVER/ALWAYS/IMPORTANT emphasis keywords.
**Impact**: Reduced adherence to critical rules per best practices.

**Recommendation**: Review all Authoring Guardrails sections and add emphasis keywords to critical rules.

### 3. File Length Above Modularization Threshold

**Affected Files**: 5 of 7 files exceed 100 lines
- `scraper`: 153 lines
- `testkit`: 117 lines
- `utils`: 106 lines
- `cli`: 113 lines
- `repo-scripts`: 111 lines
- `build-utils`: 145 lines
- `db-admin`: 93 lines (under threshold)

**Recommendation**: Consider creating `.claude/rules/` structure within each package for modular organization, or accept longer files as necessary for comprehensive package documentation.

### 4. Incomplete Testing Workflows

**Affected Files**: 6 of 7 files
**Pattern**: Files have Verifications sections with commands but lack complete testing workflows:
- When to write tests
- Test coverage expectations
- Integration vs unit test patterns

**Recommendation**: Add Testing Workflow subsection to each file.

### 5. Missing Gotchas Sections

**Affected Files**: All 7 files
**Pattern**: No dedicated Gotchas/Warnings sections documenting common pitfalls.

**Recommendation**: Add Gotchas section template documenting package-specific edge cases.

### 6. Emoji Usage in Code Examples

**Affected Files**: `repo-scripts/AGENTS.md`
**Pattern**: Quick recipes contain emoji in string literals.
**Violates**: Best practice - avoid emojis unless explicitly requested.

**Recommendation**: Replace emojis with descriptive text in all code examples.

---

## Recommendations Summary

### High Priority
1. **Add Security sections** to all files, especially `db-admin`, `repo-scripts`, and `cli`
2. **Add emphasis keywords** (NEVER, ALWAYS, IMPORTANT) to critical rules in all files
3. **Add Gotchas sections** documenting common pitfalls for each package

### Medium Priority
4. **Complete testing workflows** in all Verifications sections
5. **Remove emoji** from code examples in `repo-scripts`
6. **Consolidate duplicate sections** in `repo-scripts` (two Verifications sections)
7. **Document dead code resolution** in `db-admin` (db:reset script)

### Low Priority
8. **Consider modularization** for files above 100 lines (evaluate if necessary given comprehensive nature)
9. **Standardize standalone vs filter commands** documentation
10. **Add cross-package coordination notes** where missing

---

## Aggregate Scores

| File | Score | Status |
|------|-------|--------|
| `tooling/scraper/AGENTS.md` | 12/16 | GOOD |
| `tooling/testkit/AGENTS.md` | 12/16 | GOOD |
| `tooling/utils/AGENTS.md` | 13/16 | GOOD - Near Excellent |
| `tooling/cli/AGENTS.md` | 11/16 | GOOD |
| `tooling/repo-scripts/AGENTS.md` | 11/16 | GOOD |
| `tooling/build-utils/AGENTS.md` | 12/16 | GOOD |
| `packages/_internal/db-admin/AGENTS.md` | 11/16 | GOOD |
| **Average** | **11.7/16** | **GOOD** |

---

## Conclusion

The tooling and internal AGENTS.md files demonstrate good alignment with best practices, scoring an average of 11.7/16. The files follow a consistent template structure with comprehensive Surface Maps, Quick Recipes, Verifications, and Contributor Checklists.

The primary gaps are:
1. **Security guidance** - critical for packages handling secrets and database access
2. **Emphasis keywords** - reduced adherence for critical rules
3. **Gotchas sections** - missing warnings about common pitfalls

The `tooling/utils/AGENTS.md` file is the strongest at 13/16 and can serve as a template for improvements to other files. Addressing the high-priority recommendations would bring most files to the 14-15/16 range (Minor improvements available -> Excellent configuration).
