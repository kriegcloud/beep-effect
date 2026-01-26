# html-sanitize-schema-test-parity: Evaluation Rubrics

> Criteria for evaluating spec completion and quality.

---

## Primary Success Metrics

| Metric | Target | Weight |
|--------|--------|:------:|
| New test files created | 5 | 20% |
| New test cases added | ~170 | 30% |
| XSS vectors covered | All from utils | 25% |
| Config options tested | All serializable | 15% |
| Zero regressions | Existing tests pass | 10% |

---

## Test File Completion Rubric

| Test File | Target Tests | Priority | Weight |
|-----------|:------------:|:--------:|:------:|
| `make-sanitize-schema.css.test.ts` | ~50 | P1 | 25% |
| `make-sanitize-schema.classes.test.ts` | ~40 | P1 | 20% |
| `make-sanitize-schema.iframe.test.ts` | ~45 | P1 | 25% |
| `make-sanitize-schema.modes.test.ts` | ~20 | P2 | 15% |
| `make-sanitize-schema.presets.test.ts` | ~15 | P2 | 15% |

---

## Security Coverage Checklist

### CSS XSS Vectors (Required)
- [ ] `expression()` blocked
- [ ] `url(javascript:)` blocked
- [ ] `url(data:)` blocked (unless explicitly allowed)
- [ ] `-moz-binding` blocked
- [ ] `behavior:` property blocked

### Class Filtering (Required)
- [ ] Glob patterns work (`btn-*`)
- [ ] Regex patterns work (`/^col-\d+$/`)
- [ ] Empty class attribute removed
- [ ] Case sensitivity enforced

### Iframe/Script (Required)
- [ ] Hostname whitelisting enforced
- [ ] Domain whitelisting includes subdomains
- [ ] `javascript:` in src blocked
- [ ] `data:` in src blocked
- [ ] `srcdoc` handled safely

### Modes (Required)
- [ ] `discard` removes tag + content
- [ ] `escape` escapes tag, keeps content
- [ ] `recursiveEscape` escapes all descendants
- [ ] `completelyDiscard` removes everything

---

## Code Quality Checklist

### Effect Patterns
- [ ] Uses `@beep/testkit` (not raw `bun:test`)
- [ ] Uses `effect()` test runner
- [ ] Uses `Effect.fn(function* ...)` pattern
- [ ] Uses `S.decode(Sanitize)(input)` pattern
- [ ] Namespace imports for Effect modules

### Test Organization
- [ ] Tests in `describe` blocks by feature
- [ ] Test names describe expected behavior
- [ ] `createSanitizer` helper used consistently
- [ ] No duplicate test coverage

### Documentation
- [ ] File header with `@module` and `@since` tags
- [ ] Comment blocks for complex test groups
- [ ] References to utils tests being ported

---

## Grading Scale

| Grade | Score | Criteria |
|:-----:|:-----:|----------|
| A | 90-100% | All 5 files, 170+ tests, all XSS vectors covered |
| B | 80-89% | All 5 files, 140+ tests, critical XSS covered |
| C | 70-79% | 4/5 files, 100+ tests, main features covered |
| D | 60-69% | 3/5 files, 70+ tests, gaps in coverage |
| F | <60% | <3 files or <70 tests or XSS gaps |

---

## Phase-Specific Rubrics

### Phase 1: Discovery
- [ ] Type comparison table complete
- [ ] All utils options mapped
- [ ] Conversion edge cases identified
- [ ] Intentionally excluded features documented

### Phase 2: Test Design
- [ ] Test suite structures documented
- [ ] Test counts estimated accurately
- [ ] Dependencies identified
- [ ] Pattern guide created

### Phase 3-6: Implementation
- [ ] Test file created
- [ ] Target test count achieved
- [ ] All tests passing
- [ ] No type/lint errors

### Phase 7: Validation
- [ ] Full test suite passes
- [ ] Coverage gaps documented
- [ ] Patterns extracted
- [ ] REFLECTION_LOG updated
