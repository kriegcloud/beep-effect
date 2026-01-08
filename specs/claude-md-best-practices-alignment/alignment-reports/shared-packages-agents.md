# Shared Packages AGENTS.md Alignment Report

> Audit of AGENTS.md files in `packages/shared/` against synthesized best practices.

---

## Executive Summary

| Package | Alignment Score | Status |
|---------|-----------------|--------|
| `@beep/shared-server` | 14/16 | Minor improvements available |
| `@beep/shared-env` | 13/16 | Minor improvements available |
| `@beep/shared-tables` | 13/16 | Minor improvements available |
| `@beep/shared-ui` | 15/16 | Excellent configuration |
| `@beep/shared-client` | 12/16 | Moderate improvements needed |
| `@beep/shared-domain` | 14/16 | Minor improvements available |

**Overall Assessment**: The shared packages demonstrate strong adherence to best practices with well-structured documentation, clear guardrails, and actionable recipes. Most files excel in specificity and architectural guidance but have minor gaps in security notes and testing instructions.

---

## Per-File Analysis

### 1. `@beep/shared-server` AGENTS.md

**File**: `packages/shared/server/AGENTS.md`

#### Alignment Score: 14/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Excellent organization with clear sections |
| Commands | 2/2 | Commands with descriptions and filter syntax |
| Specificity | 2/2 | Highly actionable patterns with code examples |
| Constraints | 2/2 | Clear DO/DON'T with Effect Config precedence, secret handling |
| Architecture | 2/2 | Detailed surface map with file references |
| Testing | 1/2 | Basic instructions, but no test-writing patterns |
| Security | 2/2 | Explicit secret handling via `Config.redacted` |
| Maintainability | 1/2 | Single large file (~221 lines) |

#### Issues Found

1. **Line 40-41**: Stub exports mentioned (Redis, RateLimit, YJS) without clear status indicators
   - **Issue**: Unclear whether these are WIP or deprecated
   - **Recommendation**: Add status badges or move to "Future Work" section

2. **Lines 69-75**: Code recipe accesses `serverEnv` directly without showing the dependency context
   - **Issue**: May mislead agents about Layer requirements
   - **Recommendation**: Add note about runtime singleton behavior

#### Missing Elements

- No explicit "NEVER" or "IMPORTANT" emphasis keywords for critical rules
- Testing section lacks test file patterns and coverage expectations
- No `.claude/rules/` modular structure mentioned

#### Anti-Patterns

- Large embedded code examples (8 recipes with ~120 lines of code)
- Could reference external docs instead per best practices

---

### 2. `@beep/shared-env` AGENTS.md

**File**: `packages/shared/env/AGENTS.md`

#### Alignment Score: 13/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections with bullet points |
| Commands | 2/2 | Filter-scoped verification commands |
| Specificity | 2/2 | Specific Config patterns with examples |
| Constraints | 2/2 | Clear rules for redacted, NEXT_PUBLIC_ prefix |
| Architecture | 2/2 | Detailed surface map of serverEnv/clientEnv |
| Testing | 1/2 | Basic verification commands only |
| Security | 2/2 | Explicit redacted handling for secrets |
| Maintainability | 0/2 | File is well-sized but no modular structure mentioned |

#### Issues Found

1. **Line 44**: "Always import Effect modules with namespaces" lists `S`, `F`, `O`, `A` but doesn't link to a canonical import guide
   - **Issue**: Agents may use inconsistent aliases
   - **Recommendation**: Link to project-wide Effect import conventions

2. **Lines 53-69**: Quick Recipes section has two patterns but no error handling examples
   - **Issue**: Doesn't show ConfigError handling pattern
   - **Recommendation**: Add recipe showing `Effect.catchTag("ConfigError", Effect.die)`

#### Missing Elements

- No "Warnings/Gotchas" section for edge cases
- No testing patterns for environment configuration
- Missing emphasis keywords (IMPORTANT, NEVER) for critical rules

#### Anti-Patterns

- None significant

---

### 3. `@beep/shared-tables` AGENTS.md

**File**: `packages/shared/tables/AGENTS.md`

#### Alignment Score: 13/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Well-organized with Surface Map |
| Commands | 2/2 | Root and package-specific commands listed |
| Specificity | 2/2 | Specific patterns for Table.make, OrgTable.make |
| Constraints | 2/2 | Clear guardrails with file references |
| Architecture | 2/2 | Detailed with `_check.ts` enforcement |
| Testing | 1/2 | Lists commands but notes "placeholder" tests |
| Security | 0/2 | No security considerations documented |
| Maintainability | 2/2 | Appropriate size, cross-references slices |

#### Issues Found

1. **Line 93**: "currently placeholder; expand when table behavior gains tests"
   - **Issue**: Acknowledges missing tests without remediation plan
   - **Recommendation**: Add TODO or link to testing roadmap

2. **Line 31**: References `packages/iam/tables/src/relations.ts:1` with line number
   - **Issue**: Line numbers become stale
   - **Recommendation**: Use file references without line numbers or use anchor comments

#### Missing Elements

- No security section (e.g., SQL injection prevention, column sanitization)
- No emphasis keywords for critical constraints
- Missing integration test patterns with testcontainers

#### Anti-Patterns

- None significant

---

### 4. `@beep/shared-ui` AGENTS.md

**File**: `packages/shared/ui/AGENTS.md`

#### Alignment Score: 15/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Excellent organization with tables and sections |
| Commands | 1/2 | Missing explicit verification commands section |
| Specificity | 2/2 | Highly specific with type signatures |
| Constraints | 2/2 | Clear "FORBIDDEN/REQUIRED" patterns |
| Architecture | 2/2 | Pipeline flows, integration points detailed |
| Testing | 2/2 | Testing notes with mock strategies |
| Security | 2/2 | Browser-safe dependencies noted |
| Maintainability | 2/2 | Well-structured, moderate size |

#### Issues Found

1. **Missing Verification Section**: No explicit `bun run check/lint/test` commands
   - **Issue**: Other AGENTS.md files include this section
   - **Recommendation**: Add standard Verifications section

2. **Line 280**: "Use `pipe(types, A.join(", "))`"
   - **Issue**: Uses deprecated `pipe` pattern; Effect 3 prefers method chaining
   - **Recommendation**: Update to `A.join(types, ", ")` or document the legacy pattern

#### Missing Elements

- Explicit verification commands section
- Contributor checklist (unlike sibling packages)

#### Anti-Patterns

- Large embedded code examples (~200 lines of code samples)
- Could benefit from referencing external documentation

---

### 5. `@beep/shared-client` AGENTS.md

**File**: `packages/shared/client/AGENTS.md`

#### Alignment Score: 12/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections for placeholder package |
| Commands | 2/2 | Verification commands documented |
| Specificity | 1/2 | Limited due to placeholder status |
| Constraints | 2/2 | Clear guardrails for cross-cutting concerns |
| Architecture | 1/2 | Minimal current surface, future patterns speculative |
| Testing | 1/2 | Commands listed but no patterns |
| Security | 1/2 | Browser-safe mentioned but no specific guidance |
| Maintainability | 2/2 | Appropriate size for placeholder |

#### Issues Found

1. **Lines 29-60**: "Future Patterns (Examples)" section documents hypothetical code
   - **Issue**: May mislead agents about current capabilities
   - **Recommendation**: Mark as "PLANNED" or move to design doc

2. **Line 31**: `import { beep } from "@beep/shared-client";`
   - **Issue**: Placeholder export named "beep" is non-descriptive
   - **Recommendation**: Use more explicit placeholder or remove

#### Missing Elements

- No current usage patterns (only future speculation)
- No testing patterns for the minimal exports
- Missing gotchas/warnings section

#### Anti-Patterns

- Speculative future code examples (best practices recommend avoiding stale content)

---

### 6. `@beep/shared-domain` AGENTS.md

**File**: `packages/shared/domain/AGENTS.md`

#### Alignment Score: 14/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Well-organized with file references |
| Commands | 2/2 | Specific test and filter commands |
| Specificity | 2/2 | Detailed patterns with code examples |
| Constraints | 2/2 | Clear guardrails for entity IDs, Policy, paths |
| Architecture | 2/2 | Comprehensive surface map with line references |
| Testing | 2/2 | Specific test file references and patterns |
| Security | 0/2 | No security considerations for encryption service |
| Maintainability | 2/2 | Cross-references sibling guides |

#### Issues Found

1. **Line 14**: "note: `SubscriptionId` appears twice on lines 17-18; flag for cleanup"
   - **Issue**: Known bug documented but not resolved
   - **Recommendation**: Fix the duplication or add to backlog with issue link

2. **Lines 29-34**: Usage snapshots include line numbers that may become stale
   - **Issue**: `:3`, `:10`, `:37`, `:7`, `:11`, `:70` are fragile references
   - **Recommendation**: Use function/class name anchors instead

3. **Line 23**: EncryptionService mentioned but no security guidance
   - **Issue**: Critical security component lacks documentation
   - **Recommendation**: Add security section covering key management, rotation

#### Missing Elements

- Security section for EncryptionService
- No emphasis keywords (IMPORTANT, NEVER, ALWAYS)
- Missing warning about `_internal` namespace in prominent location

#### Anti-Patterns

- Line number references that may become stale

---

## Cross-Cutting Recommendations

### 1. Standardize Verification Sections

All packages should have a consistent Verifications section format:

```markdown
## Verifications
- `bun run check --filter @beep/<package>` - Type checking
- `bun run lint --filter @beep/<package>` - Biome lint
- `bun run test --filter @beep/<package>` - Test suite
```

**Affected Files**:
- `packages/shared/ui/AGENTS.md` - Missing Verifications section

### 2. Add Emphasis Keywords

Best practices recommend using IMPORTANT, NEVER, ALWAYS for critical rules. Most files lack these:

| Package | Has Emphasis Keywords |
|---------|----------------------|
| shared-server | No |
| shared-env | No |
| shared-tables | No |
| shared-ui | Yes ("FORBIDDEN", "REQUIRED") |
| shared-client | No |
| shared-domain | No |

**Recommendation**: Add emphasis keywords to Authoring Guardrails sections.

### 3. Remove Line Number References

Multiple files use fragile line number references:

- `shared-server`: Lines 47-53
- `shared-tables`: Lines 20-26
- `shared-domain`: Lines 29-34

**Recommendation**: Use function/class name anchors or file-only references.

### 4. Add Security Sections

Three packages lack security guidance:

| Package | Security Gap |
|---------|-------------|
| shared-tables | No SQL injection/sanitization notes |
| shared-client | No browser security notes |
| shared-domain | EncryptionService lacks key management docs |

### 5. Consider Modular Structure

Several files exceed 100 lines with embedded code examples:

| Package | Line Count | Recommendation |
|---------|------------|----------------|
| shared-server | ~221 | Move recipes to `.claude/rules/shared-server/` |
| shared-ui | ~427 | Move patterns to `.claude/rules/shared-ui/` |
| shared-domain | ~143 | Consider splitting recipes |

### 6. Standardize Contributor Checklists

All packages should have a Contributor Checklist with checkboxes:

**Missing Contributor Checklist**:
- `packages/shared/ui/AGENTS.md`

---

## Priority Action Items

### High Priority

1. **Add security section to `shared-domain`** for EncryptionService (key management, rotation, PII handling)
2. **Add Verifications section to `shared-ui`** for consistency
3. **Fix duplicate SubscriptionId** in `shared-domain` entity-ids

### Medium Priority

4. **Add emphasis keywords** (IMPORTANT, NEVER) to all Authoring Guardrails
5. **Remove line number references** and use stable anchors
6. **Add Contributor Checklist to `shared-ui`**

### Low Priority

7. **Consider `.claude/rules/` structure** for packages >100 lines
8. **Mark placeholder content** in `shared-client` as PLANNED
9. **Add testing patterns** beyond basic verification commands

---

## Appendix: Scoring Rubric Reference

From SYNTHESIZED_BEST_PRACTICES.md:

| Aspect | Score 0 | Score 1 | Score 2 |
|--------|---------|---------|---------|
| Structure | Unorganized/missing | Some structure | Clear sections with headings |
| Commands | None | Commands without descriptions | Commands with clear descriptions |
| Specificity | Vague | Somewhat specific | Highly actionable |
| Constraints | None stated | Some constraints | Clear DO/DON'T with emphasis |
| Architecture | None | Basic overview | Detailed with patterns |
| Testing | None | Basic instructions | Complete workflow |
| Security | Contains secrets | No security notes | Clear security guidance |
| Maintainability | One huge file | Some organization | Modular with rules/ |

**Score Interpretation**:
- 0-6: Critical improvements needed
- 7-10: Moderate improvements needed
- 11-14: Minor improvements available
- 15-16: Excellent configuration
