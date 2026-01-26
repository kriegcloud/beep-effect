# html-sanitize-schema-test-parity: Master Orchestration

> Complete workflow for achieving test parity between `@beep/schema/integrations/html` and `@beep/utils/sanitize-html`.

---

## Executive Summary

The schema-based HTML sanitization module has **comprehensive configuration coverage** but **significant test gaps**. The utils implementation has **11 test files (250+ test cases)** while the schema implementation has only **4 test files (~60 test cases)** missing coverage for many features the schema actually supports.

**Complexity Score**: 49 (High Complexity)
- Phase Count: 5 × 2 = 10
- Agent Diversity: 4 × 3 = 12
- Cross-Package: 2 × 4 = 8
- External Deps: 0 × 3 = 0
- Uncertainty: 3 × 5 = 15
- Research: 2 × 2 = 4

---

## Gap Analysis Summary

### Test File Comparison

| Utils Test File | Test Cases | Schema Equivalent | Status |
|-----------------|:----------:|-------------------|:------:|
| `sanitize-html.basic.test.ts` | 25 | `make-sanitize-schema.basic.test.ts` | ✅ Exists |
| `sanitize-html.attributes.test.ts` | 30 | `make-sanitize-schema.attributes.test.ts` | ✅ Exists |
| `sanitize-html.xss.test.ts` | 35 | `make-sanitize-schema.xss.test.ts` | ✅ Exists |
| `sanitize-html.urls.test.ts` | 40 | `make-sanitize-schema.urls.test.ts` | ✅ Exists |
| `sanitize-html.css.test.ts` | 68 | **MISSING** | ❌ **Required** |
| `sanitize-html.classes.test.ts` | 46 | **MISSING** | ❌ **Required** |
| `sanitize-html.iframe.test.ts` | 52 | **MISSING** | ❌ **Required** |
| `sanitize-html.transform.test.ts` | 37 | N/A (not serializable) | ⚠️ Document |
| `sanitize-html.parser.test.ts` | 30 | N/A (delegated to utils) | ⚠️ Document |
| `sanitize-html.tags.test.ts` | 20 | Partial in basic.test.ts | ⚠️ Enhance |

### Missing Config Option Tests

| Config Option | Utils Tests | Schema Tests | Priority |
|---------------|:-----------:|:------------:|:--------:|
| `allowedStyles` | ✅ | ❌ | **P1** |
| `allowedClasses` | ✅ | ❌ | **P1** |
| `allowedIframeHostnames` | ✅ | ❌ | **P1** |
| `allowedIframeDomains` | ✅ | ❌ | **P1** |
| `allowedScriptHostnames` | ✅ | ❌ | **P2** |
| `allowedScriptDomains` | ✅ | ❌ | **P2** |
| `disallowedTagsMode` | ✅ | ❌ | **P2** |
| `enforceHtmlBoundary` | ✅ | ❌ | **P3** |
| `nonTextTags` | ✅ | ❌ | **P3** |
| `allowVulnerableTags` | ✅ | ❌ | **P3** |
| Preset configs | ❌ | ❌ | **P2** |

---

## Phase 0: Scaffolding ✅

### Completed Items
- [x] Created spec folder structure
- [x] README.md with purpose and scope
- [x] MASTER_ORCHESTRATION.md (this file)
- [x] REFLECTION_LOG.md template
- [x] Gap analysis from initial investigation

### Outputs
- `specs/html-sanitize-schema-test-parity/README.md`
- `specs/html-sanitize-schema-test-parity/MASTER_ORCHESTRATION.md`
- `specs/html-sanitize-schema-test-parity/REFLECTION_LOG.md`

---

## Phase 1: Discovery & Verification

### Objective
Verify gap analysis accuracy and identify any additional gaps by systematic comparison.

### Tasks
- [ ] Verify utils test coverage completeness
- [ ] Cross-reference schema config options with utils `SanitizeOptions`
- [ ] Identify any implementation bugs in `toSanitizeOptions` conversion
- [ ] Document utils features intentionally excluded from schema

### Agent Assignment

| Agent | Task | Output |
|-------|------|--------|
| `codebase-researcher` | Compare utils types.ts with schema SanitizeConfig | `outputs/type-comparison.md` |
| `codebase-researcher` | Analyze toSanitizeOptions conversion logic | `outputs/conversion-analysis.md` |

### Success Criteria
- [ ] All utils `SanitizeOptions` fields mapped to schema equivalents
- [ ] Conversion edge cases documented
- [ ] List of intentionally excluded features finalized

### Handoff
- `handoffs/HANDOFF_P2.md` - Context for implementation phase

---

## Phase 2: Test Design

### Objective
Design test suites for each missing coverage area.

### Tasks
- [ ] Design CSS/style filtering test suite structure
- [ ] Design class filtering test suite with glob/regex cases
- [ ] Design iframe/script hostname validation test suite
- [ ] Design modes and presets test suite
- [ ] Create test templates following existing patterns

### Agent Assignment

| Agent | Task | Output |
|-------|------|--------|
| `test-writer` | Analyze existing schema test patterns | `outputs/test-patterns.md` |
| `code-reviewer` | Review test design for completeness | `outputs/design-review.md` |

### Test Suite Specifications

#### 2.1 CSS/Style Filtering Tests (`make-sanitize-schema.css.test.ts`)

```typescript
// Required test groups:
describe("CSS property filtering")
describe("CSS value validation with regex")
describe("Wildcard styles (*)")
describe("XSS via CSS (expression, url(javascript:))")
describe("parseStyleAttributes flag")
describe("Vendor prefixes")
describe("CSS functions (calc, var)")
```

**Port from utils**: Lines 1-468 of `sanitize-html.css.test.ts`

#### 2.2 Class Filtering Tests (`make-sanitize-schema.classes.test.ts`)

```typescript
// Required test groups:
describe("Exact class matching")
describe("Glob pattern matching")
describe("RegExp pattern matching")
describe("Wildcard (*) for all tags")
describe("Tag-specific vs global classes")
describe("Empty class removal")
describe("Unicode and special characters")
```

**Port from utils**: Lines 1-393 of `sanitize-html.classes.test.ts`

#### 2.3 Iframe/Script Tests (`make-sanitize-schema.iframe.test.ts`)

```typescript
// Required test groups:
describe("allowedIframeHostnames")
describe("allowedIframeDomains")
describe("allowIframeRelativeUrls")
describe("allowedScriptHostnames")
describe("allowedScriptDomains")
describe("XSS via iframe src")
describe("srcdoc attribute handling")
```

**Port from utils**: Lines 1-390 of `sanitize-html.iframe.test.ts`

#### 2.4 Modes & Config Tests (`make-sanitize-schema.modes.test.ts`)

```typescript
// Required test groups:
describe("disallowedTagsMode variants")
  - "discard" (default)
  - "escape"
  - "recursiveEscape"
  - "completelyDiscard"
describe("nestingLimit enforcement")
describe("enforceHtmlBoundary")
describe("allowVulnerableTags")
describe("nonTextTags")
describe("selfClosing custom tags")
```

#### 2.5 Preset Tests (`make-sanitize-schema.presets.test.ts`)

```typescript
// Required test groups:
describe("DefaultSanitizeConfig")
describe("MinimalSanitizeConfig")
describe("PermissiveSanitizeConfig")
```

### Success Criteria
- [ ] Test suite designs documented
- [ ] Test counts estimated (~200 new tests)
- [ ] Dependencies between suites identified

### Handoff
- `handoffs/HANDOFF_P3.md` - Test designs for implementation

---

## Phase 3: Implementation - CSS Tests

### Objective
Implement CSS/style filtering test suite.

### Tasks
- [ ] Create `make-sanitize-schema.css.test.ts`
- [ ] Port relevant tests from utils
- [ ] Add schema-specific tests (RegExpPattern conversion)
- [ ] Run and verify all tests pass

### Agent Assignment

| Agent | Task | Output |
|-------|------|--------|
| `test-writer` | Create CSS test file | `packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.css.test.ts` |
| `package-error-fixer` | Fix any type/lint errors | Error-free build |

### Test Count Target: ~50 tests

### Verification Commands
```bash
bun run test --filter="make-sanitize-schema.css"
bun run check --filter=@beep/schema
```

### Success Criteria
- [ ] 50+ CSS tests passing
- [ ] XSS via CSS vectors covered
- [ ] No type errors

### Handoff
- `handoffs/HANDOFF_P4.md` - CSS tests complete, next: class tests

---

## Phase 4: Implementation - Class Tests

### Objective
Implement class filtering test suite with glob/regex patterns.

### Tasks
- [ ] Create `make-sanitize-schema.classes.test.ts`
- [ ] Port glob pattern tests from utils
- [ ] Add RegExpPattern schema tests
- [ ] Test AllowedClassesForTag discriminated union

### Agent Assignment

| Agent | Task | Output |
|-------|------|--------|
| `test-writer` | Create class test file | `packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.classes.test.ts` |
| `package-error-fixer` | Fix any type/lint errors | Error-free build |

### Test Count Target: ~40 tests

### Verification Commands
```bash
bun run test --filter="make-sanitize-schema.classes"
bun run check --filter=@beep/schema
```

### Success Criteria
- [ ] 40+ class tests passing
- [ ] Glob and regex patterns tested
- [ ] AllowedClassesForTag.all/specific tested

### Handoff
- `handoffs/HANDOFF_P5.md` - Class tests complete, next: iframe tests

---

## Phase 5: Implementation - Iframe/Script Tests

### Objective
Implement iframe and script hostname/domain validation tests.

### Tasks
- [ ] Create `make-sanitize-schema.iframe.test.ts`
- [ ] Port hostname/domain validation tests
- [ ] Test srcdoc XSS prevention
- [ ] Test protocol-relative URL handling

### Agent Assignment

| Agent | Task | Output |
|-------|------|--------|
| `test-writer` | Create iframe test file | `packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.iframe.test.ts` |
| `package-error-fixer` | Fix any type/lint errors | Error-free build |

### Test Count Target: ~45 tests

### Verification Commands
```bash
bun run test --filter="make-sanitize-schema.iframe"
bun run check --filter=@beep/schema
```

### Success Criteria
- [ ] 45+ iframe/script tests passing
- [ ] Hostname and domain validation tested
- [ ] XSS vectors covered

### Handoff
- `handoffs/HANDOFF_P6.md` - Iframe tests complete, next: modes & presets

---

## Phase 6: Implementation - Modes & Presets Tests

### Objective
Implement disallowedTagsMode variants and preset configuration tests.

### Tasks
- [ ] Create `make-sanitize-schema.modes.test.ts`
- [ ] Create `make-sanitize-schema.presets.test.ts`
- [ ] Test all TagsMode variants
- [ ] Verify presets produce expected sanitization

### Agent Assignment

| Agent | Task | Output |
|-------|------|--------|
| `test-writer` | Create modes test file | `.../make-sanitize-schema.modes.test.ts` |
| `test-writer` | Create presets test file | `.../make-sanitize-schema.presets.test.ts` |
| `package-error-fixer` | Fix any errors | Error-free build |

### Test Count Target: ~35 tests

### Verification Commands
```bash
bun run test --filter="make-sanitize-schema.modes"
bun run test --filter="make-sanitize-schema.presets"
bun run check --filter=@beep/schema
```

### Success Criteria
- [ ] 35+ mode/preset tests passing
- [ ] All TagsMode variants tested
- [ ] All 3 presets verified

### Handoff
- `handoffs/HANDOFF_P7.md` - All tests complete, next: validation

---

## Phase 7: Validation & Documentation

### Objective
Final validation and documentation updates.

### Tasks
- [ ] Run full test suite
- [ ] Update package documentation
- [ ] Extract reusable patterns to REFLECTION_LOG
- [ ] Create PR with all changes

### Agent Assignment

| Agent | Task | Output |
|-------|------|--------|
| `code-reviewer` | Final test coverage review | `outputs/final-review.md` |
| `doc-writer` | Update README if needed | Package docs |
| `reflector` | Extract patterns | `REFLECTION_LOG.md` |

### Verification Commands
```bash
bun run test --filter=@beep/schema
bun run check --filter=@beep/schema
bun run lint --filter=@beep/schema
```

### Success Criteria
- [ ] All ~250 tests passing
- [ ] Zero type errors
- [ ] Zero lint errors
- [ ] Test coverage improved

---

## Final Deliverables

### New Test Files (5)
1. `make-sanitize-schema.css.test.ts` (~50 tests)
2. `make-sanitize-schema.classes.test.ts` (~40 tests)
3. `make-sanitize-schema.iframe.test.ts` (~45 tests)
4. `make-sanitize-schema.modes.test.ts` (~20 tests)
5. `make-sanitize-schema.presets.test.ts` (~15 tests)

### Documentation
- Updated `packages/common/schema/README.md` (if needed)
- `REFLECTION_LOG.md` with extracted patterns

### Total New Tests: ~170

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Utils and schema behavior diverge | Test both implementations side-by-side |
| RegExpPattern conversion fails | Add try/catch in toSanitizeOptions |
| CSS XSS vectors missed | Cross-reference OWASP XSS cheat sheet |
| Test flakiness | Use deterministic test data |

---

## Rollback Plan

If tests reveal schema implementation bugs:
1. Document bug in `outputs/bugs-found.md`
2. Create separate issue for fix
3. Continue with remaining tests
4. Link tests to bug issues

---

## Session Boundary Guidelines

Each phase should be completable in a single session (~30 min).
If interrupted, use handoff templates in `handoffs/`.

**Phase timing estimates**:
- Phase 1: 15 min (research)
- Phase 2: 20 min (design)
- Phase 3-6: 25-30 min each (implementation)
- Phase 7: 15 min (validation)

**Total estimate**: ~3 hours across 7 phases
