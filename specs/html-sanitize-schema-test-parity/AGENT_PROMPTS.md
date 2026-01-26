# Agent Prompts: html-sanitize-schema-test-parity

> Copy-paste prompts for each phase's agent invocations.

---

## Phase 1: Discovery - codebase-researcher

```
Compare the utils SanitizeOptions type in packages/common/utils/src/sanitize-html/types.ts
with the schema SanitizeConfig in packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts.

Create a mapping table showing:
1. Which utils options have schema equivalents
2. Which utils options are intentionally excluded (callbacks)
3. Which utils options might be missing from schema

Also analyze toSanitizeOptions in packages/common/schema/src/integrations/html/sanitize/to-sanitize-options.ts
for any conversion edge cases or potential bugs.

Output to outputs/type-comparison.md
```

---

## Phase 2: Test Design - test-writer

```
Analyze the existing schema test patterns in:
- packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.basic.test.ts
- packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.xss.test.ts

Document the test structure patterns used:
1. How tests are organized (describe blocks)
2. The createSanitizer helper pattern
3. How Effect.fn and S.decode are combined
4. Assertion patterns

Output to outputs/test-patterns.md
```

---

## Phase 3: CSS Tests - test-writer

```
Create make-sanitize-schema.css.test.ts in packages/common/schema/test/integrations/html/sanitize/

Port relevant tests from packages/common/utils/test/sanitize-html/sanitize-html.css.test.ts
adapting them to use the schema pattern:
1. Use makeSanitizeSchema with SanitizeConfig
2. Use effect() from @beep/testkit
3. Use S.decode(Sanitize)(input) pattern
4. Add schema-specific tests for RegExpPattern in allowedStyles

Cover these areas:
- CSS property filtering
- CSS value validation with regex patterns
- XSS via CSS (expression(), url(javascript:))
- parseStyleAttributes flag
- Vendor prefixes
- CSS functions (calc, var)

Target: ~50 tests
```

---

## Phase 4: Class Tests - test-writer

```
Create make-sanitize-schema.classes.test.ts in packages/common/schema/test/integrations/html/sanitize/

Port relevant tests from packages/common/utils/test/sanitize-html/sanitize-html.classes.test.ts
adapting them to use the schema pattern.

Cover these areas:
- Exact class name matching
- Glob pattern matching (btn-*)
- RegExpPattern matching (/^col-\d+$/)
- Wildcard (*) for all tags
- Tag-specific vs global class rules
- Empty class attribute removal
- Unicode and special characters
- AllowedClassesForTag.all() and .specific() factory methods

Target: ~40 tests
```

---

## Phase 5: Iframe Tests - test-writer

```
Create make-sanitize-schema.iframe.test.ts in packages/common/schema/test/integrations/html/sanitize/

Port relevant tests from packages/common/utils/test/sanitize-html/sanitize-html.iframe.test.ts
adapting them to use the schema pattern.

Cover these areas:
- allowedIframeHostnames validation
- allowedIframeDomains (includes subdomains)
- allowIframeRelativeUrls flag
- allowedScriptHostnames validation
- allowedScriptDomains validation
- XSS via iframe src (javascript:, data:)
- srcdoc attribute handling
- Protocol-relative URLs

Target: ~45 tests
```

---

## Phase 6: Modes Tests - test-writer

```
Create make-sanitize-schema.modes.test.ts in packages/common/schema/test/integrations/html/sanitize/

Test all disallowedTagsMode variants:
- "discard" (default) - remove tag and content
- "escape" - escape tag, keep content
- "recursiveEscape" - escape tag and all children
- "completelyDiscard" - remove tag, content, and all children

Also test:
- nestingLimit enforcement
- enforceHtmlBoundary
- allowVulnerableTags
- nonTextTags
- selfClosing custom tags

Target: ~20 tests
```

```
Create make-sanitize-schema.presets.test.ts in packages/common/schema/test/integrations/html/sanitize/

Test the three preset configurations:
1. DefaultSanitizeConfig - verify common tags/attributes allowed
2. MinimalSanitizeConfig - verify only p, b, i, strong, em, br allowed
3. PermissiveSanitizeConfig - verify most tags allowed, dangerous restricted

For each preset, test:
- Expected tags are allowed
- Expected attributes are allowed
- XSS vectors are still blocked

Target: ~15 tests
```

---

## Phase 7: Validation - code-reviewer

```
Review all new test files in packages/common/schema/test/integrations/html/sanitize/:
- make-sanitize-schema.css.test.ts
- make-sanitize-schema.classes.test.ts
- make-sanitize-schema.iframe.test.ts
- make-sanitize-schema.modes.test.ts
- make-sanitize-schema.presets.test.ts

Check for:
1. Consistent test patterns with existing files
2. Complete coverage of documented features
3. XSS vector coverage
4. Edge case handling
5. Effect patterns compliance (@beep/testkit usage)

Output to outputs/final-review.md
```

---

## Phase 7: Patterns - reflector

```
Analyze the completed spec work and extract reusable patterns for REFLECTION_LOG.md.

Consider:
1. Test porting patterns (utils -> schema)
2. Schema-specific test patterns discovered
3. RegExpPattern testing approaches
4. Discriminated union testing patterns
5. Any anti-patterns encountered

Score each pattern using the quality criteria and recommend:
- 90-102: Create as skill
- 75-89: Add to PATTERN_REGISTRY
- 50-74: Keep in REFLECTION_LOG
```
