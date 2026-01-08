# Common Packages AGENTS.md Alignment Report

## Overview

This report audits the AGENTS.md files in `packages/common/` against the synthesized best practices for CLAUDE.md configurations.

| Package | Score | Status | Key Issues |
|---------|-------|--------|------------|
| @beep/mock | 13/16 | GOOD | Minor gaps in security notes, no `.claude/rules/` |
| @beep/contract | 12/16 | GOOD | Missing gotchas, borderline maintainability |
| @beep/identity | 11/16 | MODERATE | Missing testing details, no security section |
| @beep/errors | 13/16 | GOOD | Strong overall, minor emphasis gaps |
| @beep/utils | 11/16 | MODERATE | Missing gotchas, incomplete testing workflow |
| @beep/yjs | 8/16 | MODERATE | Wrong package documentation (lexical-schemas) |
| @beep/lexical-schemas | 10/16 | MODERATE | Missing verification commands, no contributor checklist |
| @beep/constants | 12/16 | GOOD | Missing testing workflow details |
| @beep/schema | 12/16 | GOOD | Minor emphasis keyword gaps |
| @beep/types | 12/16 | GOOD | Strong type-only focus, minor gaps |
| @beep/invariant | 12/16 | GOOD | Well-structured, minor gaps |

---

## Individual Package Reports

---

### @beep/mock

**File**: `packages/common/mock/AGENTS.md`
**Alignment Score**: 13/16
**Status**: GOOD

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent organization with clear sections, headers, and tables |
| **Commands** | 2/2 | Complete verification commands with descriptions |
| **Specificity** | 2/2 | Highly specific rules with Effect patterns, examples, and anti-patterns |
| **Constraints** | 2/2 | Clear DO/DON'T patterns with code examples |
| **Architecture** | 2/2 | Comprehensive surface map and import patterns |
| **Testing** | 1/2 | Commands present but no testing workflow guidance |
| **Security** | 1/2 | Mentions "client-safe" and "no PII" but lacks explicit security section |
| **Maintainability** | 1/2 | 292 lines is substantial but well-organized; could modularize Known Issues |

#### Strengths

1. **Exceptional Known Issues Section**: Documents technical debt with line references, current vs preferred patterns, and status tracking (lines 219-281).
2. **Effect-First Emphasis**: Consistent messaging about Effect patterns with clear before/after examples (lines 105-119).
3. **Comprehensive Surface Map**: Detailed breakdown of every module and export (lines 12-57).
4. **Contributor Checklist**: Actionable verification items (lines 211-216).

#### Issues Found

**Issue 1: Excessive File Length**
- **Location**: Entire file (292 lines)
- **Problem**: File exceeds the 100-line modularization threshold significantly.
- **Suggested Fix**: Extract Known Issues to separate tracking file, consider `.claude/rules/mock-patterns.md`.

**Issue 2: Missing Security Section**
- **Location**: N/A (missing)
- **Problem**: While mentions "client-safe" and "no PII," lacks explicit security guidance.
- **Suggested Fix**: Add dedicated Security section with clear rules about data safety.

#### Missing Elements

- [ ] Explicit security section
- [ ] Gotchas/Warnings section
- [ ] Testing workflow (when to test, what to test)

---

### @beep/contract

**File**: `packages/common/contract/AGENTS.md`
**Alignment Score**: 12/16
**Status**: GOOD

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized with Key Concepts, Quick Recipes, clear hierarchy |
| **Commands** | 2/2 | Comprehensive verification section with descriptions |
| **Specificity** | 2/2 | Highly specific with FailureMode, continuation patterns, error mapping |
| **Constraints** | 1/2 | Good constraints but some lack emphasis keywords |
| **Architecture** | 2/2 | Excellent Surface Map with internal structure documented |
| **Testing** | 1/2 | Commands present but noted as "placeholder until meaningful suites land" |
| **Security** | 1/2 | No explicit security section |
| **Maintainability** | 1/2 | 172 lines is moderate; well-organized internally |

#### Strengths

1. **Key Concepts Section**: Explains continuation methods, error mapping, and FailureMode clearly (lines 44-84).
2. **Quick Recipes**: Provides complete working examples for common tasks (lines 86-154).
3. **Detailed Error Mapping Pipeline**: Documents error processing order (lines 55-78).

#### Issues Found

**Issue 1: Missing Emphasis Keywords**
- **Location**: `AGENTS.md:L32-43` (Authoring Guardrails)
- **Problem**: Critical rules like "Namespace Effect imports everywhere" lack NEVER/ALWAYS emphasis.
- **Suggested Fix**:
  ```markdown
  - **ALWAYS namespace Effect imports** (`import * as Effect`, `import * as A`, `import * as Str`)
  - **NEVER use native array/string helpers**
  ```

**Issue 2: Placeholder Test Guidance**
- **Location**: `AGENTS.md:L161`
- **Problem**: States "placeholder until meaningful suites land" - not actionable.
- **Suggested Fix**: Document what tests should cover when added.

#### Missing Elements

- [ ] Gotchas/Warnings section
- [ ] Security guidance for error handling
- [ ] Complete testing workflow

---

### @beep/identity

**File**: `packages/common/identity/AGENTS.md`
**Alignment Score**: 11/16
**Status**: MODERATE

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clear sections with Purpose, Surface, Usage Snapshots |
| **Commands** | 2/2 | Complete verification commands with lint, build, test |
| **Specificity** | 2/2 | Specific segment validation rules, brand handling |
| **Constraints** | 1/2 | Good guardrails but missing emphasis keywords |
| **Architecture** | 2/2 | Surface Overview covers all modules |
| **Testing** | 1/2 | Commands present but no workflow details |
| **Security** | 0/2 | No security section |
| **Maintainability** | 1/2 | 78 lines - appropriate size |

#### Strengths

1. **Usage Snapshots**: Shows real codebase usage with template literals, annotations, service tokens (lines 16-21).
2. **Quick Recipes**: Multiple practical examples with different use cases (lines 32-61).
3. **Branded Type Emphasis**: Clear guidance on preserving IdentityString/IdentitySymbol brands (line 28).

#### Issues Found

**Issue 1: Missing Emphasis on Critical Rules**
- **Location**: `AGENTS.md:L23-30`
- **Problem**: Critical rules about segment validation and brand preservation lack emphasis.
- **Suggested Fix**:
  ```markdown
  - **NEVER** reintroduce native array/string helpers.
  - **NEVER** strip brands or coerce to `string`/`symbol`
  ```

**Issue 2: No Security Section**
- **Location**: N/A (missing)
- **Problem**: Identity/token management should have security guidance.
- **Suggested Fix**: Add section on safe handling of identity symbols in logs/errors.

#### Missing Elements

- [ ] Security section for identity handling
- [ ] Gotchas/Warnings section
- [ ] Testing workflow details
- [ ] Error handling patterns

---

### @beep/errors

**File**: `packages/common/errors/AGENTS.md`
**Alignment Score**: 13/16
**Status**: GOOD

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent table-based Surface Map, clear sections |
| **Commands** | 2/2 | Detailed commands with both `bunx turbo` and `bun run` variants |
| **Specificity** | 2/2 | Specific client/server split, metrics wiring, cause rendering |
| **Constraints** | 2/2 | Strong DO/DON'T patterns in Authoring Guardrails |
| **Architecture** | 2/2 | Surface Map table clearly delineates modules |
| **Testing** | 1/2 | Commands and test references but incomplete workflow |
| **Security** | 1/2 | Mentions "PII-free" in related package but no dedicated section |
| **Maintainability** | 1/2 | 133 lines - moderately sized, good organization |

#### Strengths

1. **Surface Map Table**: Clear module breakdown with key exports and notes (lines 9-16).
2. **Client/Server Split Documentation**: Explicit guidance on what belongs where (line 35).
3. **Usage Snapshots with File References**: Precise file:line references to usage (lines 18-24).
4. **Quick Recipes**: Multiple comprehensive examples for different scenarios (lines 41-118).

#### Issues Found

**Issue 1: Inconsistent Emphasis Keywords**
- **Location**: `AGENTS.md:L33-39`
- **Problem**: Some guardrails use emphasis ("always namespace"), others don't.
- **Suggested Fix**: Standardize with ALWAYS/NEVER prefixes for all critical rules.

**Issue 2: No Dedicated Security Section**
- **Location**: N/A (missing)
- **Problem**: Error handling is security-sensitive; should document safe error exposure.
- **Suggested Fix**: Add section on safe error serialization and sensitive data handling.

#### Missing Elements

- [ ] Dedicated security section
- [ ] Gotchas/Warnings section
- [ ] When to use which accumulate variant

---

### @beep/utils

**File**: `packages/common/utils/AGENTS.md`
**Alignment Score**: 11/16
**Status**: MODERATE

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized with Module Map, Usage Snapshots |
| **Commands** | 2/2 | Complete verification commands including coverage |
| **Specificity** | 2/2 | Specific function references and patterns |
| **Constraints** | 1/2 | Good constraints but missing emphasis keywords |
| **Architecture** | 2/2 | Comprehensive Module Map with all utilities |
| **Testing** | 1/2 | Commands present but no workflow guidance |
| **Security** | 0/2 | No security section |
| **Maintainability** | 1/2 | 91 lines - appropriate size |

#### Strengths

1. **Comprehensive Module Map**: Lists all 30+ utility modules with descriptions (lines 7-42).
2. **Clear Purity Requirement**: Emphatic about pure functions (line 5, lines 49-54).
3. **Effect Pattern Emphasis**: Consistent messaging about Effect-first patterns.

#### Issues Found

**Issue 1: Missing Emphasis Keywords**
- **Location**: `AGENTS.md:L49-54`
- **Problem**: Critical rules like "Pure functions only" and "native `.map`, `.split`, etc. are banned" lack emphasis.
- **Suggested Fix**:
  ```markdown
  - **NEVER** introduce I/O, platform APIs, or side-effectful behavior
  - **NEVER** use native `.map`, `.split`, or other native collection methods
  ```

**Issue 2: Incomplete Module Descriptions**
- **Location**: `AGENTS.md:L36-40`
- **Problem**: Some modules like `thunk.ts` and `timing/` have minimal descriptions.
- **Suggested Fix**: Add brief usage guidance for each module.

#### Missing Elements

- [ ] Security section
- [ ] Gotchas/Warnings section
- [ ] Testing workflow (when to write tests)
- [ ] Error handling patterns

---

### @beep/yjs

**File**: `packages/common/yjs/AGENTS.md`
**Alignment Score**: 8/16
**Status**: MODERATE - CRITICAL ISSUE

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Document is well-structured internally |
| **Commands** | 1/2 | Commands reference wrong package path |
| **Specificity** | 2/2 | Very specific about schema patterns |
| **Constraints** | 1/2 | Good DO/DON'T but for wrong package |
| **Architecture** | 1/2 | File structure documented but for lexical-schemas |
| **Testing** | 1/2 | Testing section present but wrong context |
| **Security** | 0/2 | No security section |
| **Maintainability** | 0/2 | Wrong documentation entirely |

#### Critical Issue

**Wrong Package Documentation**
- **Location**: Entire file
- **Problem**: The AGENTS.md file in `packages/common/yjs/` contains documentation for `@beep/lexical-schemas`, not `@beep/yjs`. This is a copy of the wrong file.
- **Evidence**:
  - Line 1: `# @beep/lexical-schemas - Agent Guide`
  - Line 119-121: `bun test packages/common/lexical-schemas`
  - Line 177-178: References apps/notes integration
- **Suggested Fix**: Create proper AGENTS.md for @beep/yjs covering:
  - Yjs CRDT integration patterns
  - Real-time collaboration utilities
  - Effect integration with Yjs
  - Proper verification commands

#### Missing Elements (for actual @beep/yjs package)

- [ ] Correct package documentation
- [ ] Yjs-specific patterns and utilities
- [ ] CRDT and collaboration guidance
- [ ] Proper commands referencing @beep/yjs

---

### @beep/lexical-schemas

**File**: `packages/common/lexical-schemas/AGENTS.md`
**Alignment Score**: 10/16
**Status**: MODERATE

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized with schema patterns, file structure |
| **Commands** | 1/2 | Only testing command, missing lint/build/check |
| **Specificity** | 2/2 | Highly specific schema patterns with code examples |
| **Constraints** | 2/2 | Clear DO/DON'T sections |
| **Architecture** | 2/2 | File structure diagram is excellent |
| **Testing** | 1/2 | Test fixtures documented but no workflow |
| **Security** | 0/2 | No security section |
| **Maintainability** | 0/2 | Missing contributor checklist, verification commands |

#### Strengths

1. **DO/DON'T Section**: Clear, actionable guidance (lines 93-107).
2. **File Structure Diagram**: Excellent visual representation (lines 75-91).
3. **Custom Node Type Guide**: Step-by-step instructions with examples (lines 139-167).

#### Issues Found

**Issue 1: Missing Standard Verification Commands**
- **Location**: N/A (missing)
- **Problem**: Only has `bun test`, missing lint, build, check, coverage commands.
- **Suggested Fix**: Add complete Verifications section:
  ```markdown
  ## Verifications
  - `bun run lint --filter=@beep/lexical-schemas` - Biome linting
  - `bun run check --filter=@beep/lexical-schemas` - TypeScript check
  - `bun run build --filter=@beep/lexical-schemas` - Build package
  - `bun run test --filter=@beep/lexical-schemas` - Run tests
  ```

**Issue 2: Missing Contributor Checklist**
- **Location**: N/A (missing)
- **Problem**: No checklist for contributors to verify their changes.
- **Suggested Fix**: Add standard contributor checklist matching other packages.

**Issue 3: No Authoring Guardrails Section**
- **Location**: N/A (missing)
- **Problem**: Missing Effect-first patterns, import conventions that other packages have.
- **Suggested Fix**: Add Authoring Guardrails section with Effect namespace imports requirement.

#### Missing Elements

- [ ] Contributor Checklist
- [ ] Authoring Guardrails section
- [ ] Complete Verifications section
- [ ] Security section
- [ ] Usage Snapshots with file references

---

### @beep/constants

**File**: `packages/common/constants/AGENTS.md`
**Alignment Score**: 12/16
**Status**: GOOD

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clear sections with Purpose, Surface Map, Usage Snapshots |
| **Commands** | 2/2 | Verification commands with regeneration notes |
| **Specificity** | 2/2 | Specific about literal kits, path utilities, generated files |
| **Constraints** | 1/2 | Good guardrails but missing some emphasis |
| **Architecture** | 2/2 | Surface Map covers all module categories |
| **Testing** | 1/2 | Commands present but workflow details sparse |
| **Security** | 1/2 | Mentions avoiding manual edits to generated files |
| **Maintainability** | 1/2 | 96 lines - appropriate size |

#### Strengths

1. **Generated Files Guidance**: Clear "read-only" treatment of `_generated/*` (line 29).
2. **Quick Recipes**: Multiple practical examples with Effect patterns (lines 36-82).
3. **Usage Snapshots**: Precise file references for real usage (lines 21-26).

#### Issues Found

**Issue 1: Missing Emphasis on Critical Rules**
- **Location**: `AGENTS.md:L29-34`
- **Problem**: Critical rules about generated files and Effect patterns lack emphasis.
- **Suggested Fix**:
  ```markdown
  - **NEVER** manually edit `_generated/*` files
  - **ALWAYS** use Effect namespaces (`A`, `F`, `Str`, `Struct`, `HashSet`)
  ```

**Issue 2: Incomplete Testing Workflow**
- **Location**: `AGENTS.md:L85-87`
- **Problem**: Testing mentioned but no guidance on what to test or when.
- **Suggested Fix**: Add testing workflow guidance.

#### Missing Elements

- [ ] Gotchas/Warnings section
- [ ] Complete testing workflow
- [ ] Security section for env handling

---

### @beep/schema

**File**: `packages/common/schema/AGENTS.md`
**Alignment Score**: 12/16
**Status**: GOOD

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent organization with clear hierarchy |
| **Commands** | 2/2 | Complete turbo commands with descriptions |
| **Specificity** | 2/2 | Highly specific about BS namespace, EntityId, literal kits |
| **Constraints** | 1/2 | Strong constraints but missing emphasis keywords |
| **Architecture** | 2/2 | Comprehensive Surface Map |
| **Testing** | 1/2 | Commands present, test directory referenced |
| **Security** | 1/2 | Mentions "no platform APIs" but no dedicated section |
| **Maintainability** | 1/2 | 96 lines - appropriate size |

#### Strengths

1. **BS Namespace Documentation**: Clear guidance on single namespace pattern (line 6).
2. **Quick Recipes**: Multiple practical examples showing EntityId, StringLiteralKit, CSP (lines 37-82).
3. **Usage Snapshots**: Precise file:line references (lines 18-22).

#### Issues Found

**Issue 1: Missing Emphasis Keywords**
- **Location**: `AGENTS.md:L30-36`
- **Problem**: Critical rules like "Effect namespace imports only" lack emphasis.
- **Suggested Fix**:
  ```markdown
  - **NEVER** use native array/string/object helpers
  - **ALWAYS** route through `F.pipe` with Effect collections
  ```

**Issue 2: No Gotchas Section**
- **Location**: N/A (missing)
- **Problem**: Schema packages often have edge cases worth documenting.
- **Suggested Fix**: Add Gotchas section covering common schema pitfalls.

#### Missing Elements

- [ ] Gotchas/Warnings section
- [ ] Security section
- [ ] Complete testing workflow

---

### @beep/types

**File**: `packages/common/types/AGENTS.md`
**Alignment Score**: 12/16
**Status**: GOOD

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent organization with namespaced/direct exports split |
| **Commands** | 2/2 | Complete verification commands |
| **Specificity** | 2/2 | Highly specific about type-only exports, `import type` |
| **Constraints** | 2/2 | Strong "types only" constraint with verification method |
| **Architecture** | 2/2 | Comprehensive Surface Map with all type modules |
| **Testing** | 1/2 | Commands present but compile-time testing guidance sparse |
| **Security** | 1/2 | No explicit security section (lower risk for types-only) |
| **Maintainability** | 0/2 | 78 lines but no contributor checklist items with checkboxes |

#### Strengths

1. **Types-Only Emphasis**: Clear runtime-free guarantee with verification method (line 39).
2. **Surface Map Split**: Distinguishes namespaced vs direct exports (lines 9-32).
3. **`import type` Requirement**: Explicit about bundler-friendly imports (line 6, 41).

#### Issues Found

**Issue 1: Contributor Checklist Without Checkboxes**
- **Location**: `AGENTS.md:L72-77`
- **Problem**: Checklist items use `- [ ]` format but file shows them without checkboxes in some views.
- **Suggested Fix**: Ensure consistent markdown checkbox format.

**Issue 2: Missing Gotchas Section**
- **Location**: N/A (missing)
- **Problem**: Type-level programming has many edge cases worth documenting.
- **Suggested Fix**: Add Gotchas section for type quirks and limitations.

#### Missing Elements

- [ ] Gotchas/Warnings section
- [ ] More complete testing guidance for compile-time assertions

---

### @beep/invariant

**File**: `packages/common/invariant/AGENTS.md`
**Alignment Score**: 12/16
**Status**: GOOD

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clear sections with Key Behaviors, Usage Snapshots |
| **Commands** | 2/2 | Complete verification commands |
| **Specificity** | 2/2 | Specific about BUG: prefix, metadata trimming, CallMetadata |
| **Constraints** | 1/2 | Good constraints but missing emphasis keywords |
| **Architecture** | 2/2 | Surface Overview covers all modules |
| **Testing** | 2/2 | Testing guidance includes assertion targets |
| **Security** | 1/2 | Mentions "PII-free" metadata but no dedicated section |
| **Maintainability** | 0/2 | 70 lines - good size, but missing some standard sections |

#### Strengths

1. **Key Behaviors Section**: Documents dev-mode debugger trigger, metadata trimming (lines 16-19).
2. **Usage Snapshots with References**: Real codebase usage with package:file format (lines 21-27).
3. **Testing Guidance**: Specifies testing against `InvariantViolation` instances (line 34).

#### Issues Found

**Issue 1: Missing Emphasis Keywords**
- **Location**: `AGENTS.md:L29-34`
- **Problem**: Critical rules lack emphasis keywords.
- **Suggested Fix**:
  ```markdown
  - **NEVER** add logging, metrics, or transport logic here
  - **ALWAYS** pass metadata that passes `CallMetadata` schema
  ```

**Issue 2: No Gotchas Section**
- **Location**: N/A (missing)
- **Problem**: Invariant usage has common pitfalls worth documenting.
- **Suggested Fix**: Add section about:
  - When to use `invariant` vs `Effect.die`
  - Production vs development behavior differences
  - Stack trace implications

#### Missing Elements

- [ ] Gotchas/Warnings section
- [ ] Security section (even if brief)
- [ ] Error handling integration patterns

---

## Cross-Cutting Recommendations

### High Priority

1. **Fix @beep/yjs Documentation**
   - Critical: The file contains documentation for the wrong package.
   - Action: Create proper AGENTS.md for @beep/yjs with Yjs/CRDT-specific guidance.

2. **Add Emphasis Keywords Across All Files**
   - Pattern: Most files use critical constraints without NEVER/ALWAYS/IMPORTANT prefixes.
   - Action: Audit and add emphasis keywords to all critical rules in each AGENTS.md.

3. **Standardize Verification Sections**
   - Issue: @beep/lexical-schemas is missing standard verification commands.
   - Action: Ensure all packages have lint, check, build, test commands.

### Medium Priority

4. **Add Gotchas/Warnings Sections**
   - Gap: Only 0/11 packages have dedicated Gotchas sections.
   - Action: Document common pitfalls and edge cases for each package.

5. **Add Security Sections Where Relevant**
   - Gap: 0/11 packages have dedicated security sections.
   - Action: Add security guidance for:
     - @beep/errors (safe error serialization)
     - @beep/identity (token handling)
     - @beep/constants (env variable handling)

6. **Complete Testing Workflow Documentation**
   - Gap: Most packages have commands but lack workflow guidance.
   - Action: Add "when to test" and "what to test" guidance.

### Low Priority

7. **Consider File Size for @beep/mock**
   - Note: At 292 lines, @beep/mock could benefit from modularization.
   - Action: Extract Known Issues to separate tracking file.

8. **Standardize Contributor Checklists**
   - Variation: Some packages have detailed checklists, others minimal.
   - Action: Create template and apply consistently.

9. **Add Usage Snapshots with Line Numbers**
   - Best Practice: @beep/errors does this well; others could follow.
   - Action: Update Usage Snapshots to include file:line references.

---

## Summary Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| Files with Score 12+ | 8/11 | 73% |
| Files with Emphasis Keywords | 0/11 | 0% |
| Files with Gotchas Section | 0/11 | 0% |
| Files with Security Section | 0/11 | 0% |
| Files with Complete Testing Workflow | 1/11 | 9% |
| Files with Contributor Checklist | 9/11 | 82% |
| Files with Critical Issues | 1/11 | 9% |

### Overall Assessment

The packages/common/ AGENTS.md files demonstrate strong foundational practices with consistent structure, good command documentation, and specific architectural guidance. The primary gaps are:

1. **Critical**: @beep/yjs has wrong package documentation
2. **Systemic**: No files use emphasis keywords for critical rules
3. **Systemic**: No files have Gotchas/Warnings sections
4. **Systemic**: No files have dedicated Security sections

Addressing these gaps would elevate most packages from GOOD (12-13/16) to EXCELLENT (15-16/16) alignment.
