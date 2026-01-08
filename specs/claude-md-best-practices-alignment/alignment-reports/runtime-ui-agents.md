# Runtime & UI AGENTS.md Alignment Report

## Summary

| Package | File | Score | Status |
|---------|------|-------|--------|
| `@beep/runtime-server` | packages/runtime/server/AGENTS.md | 13/16 | MINOR IMPROVEMENTS |
| `@beep/runtime-client` | packages/runtime/client/AGENTS.md | 13/16 | MINOR IMPROVEMENTS |
| `@beep/ui` | packages/ui/ui/AGENTS.md | 12/16 | MINOR IMPROVEMENTS |
| `@beep/ui-core` | packages/ui/core/AGENTS.md | 12/16 | MINOR IMPROVEMENTS |

All four files demonstrate strong alignment with best practices, featuring clear structure, good architecture documentation, and actionable guidance. Common gaps include missing emphasis keywords on critical rules, incomplete testing workflows, and absence of explicit security guidance.

---

# Package: `@beep/runtime-server`

## File: packages/runtime/server/AGENTS.md

### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent organization with clear sections: Purpose, Surface Map, Usage Snapshots, Guardrails, Recipes, Verifications, Checklist |
| **Commands** | 2/2 | Complete verification commands with descriptions and filter syntax |
| **Specificity** | 2/2 | Highly actionable rules with concrete patterns and file:line references |
| **Constraints** | 1/2 | Good constraints stated but missing emphasis keywords (NEVER, ALWAYS) |
| **Architecture** | 2/2 | Detailed surface map with exact file:line references, clear layer composition patterns |
| **Testing** | 1/2 | Commands present but notes "currently placeholder" - lacks test patterns guidance |
| **Security** | 1/2 | No explicit security notes, though environment toggle awareness helps |
| **Maintainability** | 2/2 | Well-sized file (93 lines), focused scope, appropriate for package-level docs |

**Total: 13/16**

---

### Strengths

1. **Surface Map with Line References**: Exceptional practice of documenting exports with exact `file:line` locations (e.g., `packages/runtime/server/src/Tracing.ts:16`). This dramatically improves discoverability.

2. **Usage Snapshots Section**: Provides real-world consumption examples with file references, showing agents how the package integrates into the broader system.

3. **Quick Recipes with Complete Code**: Two well-structured code examples showing both custom runtime creation and request-scoped handler patterns.

4. **Layer Composition Guidance**: Clear instructions on extending the runtime using `Layer.mergeAll` and `Layer.provideMerge` patterns.

5. **Contributor Checklist**: Actionable checkbox list for contributors, ensuring documentation stays synchronized with code changes.

---

### Issues Found

#### Issue 1: Missing Emphasis Keywords on Critical Rules
- **Location**: AGENTS.md:L27
- **Problem**: Critical constraint "Never bypass `serverRuntime` when running server effects" uses lowercase "Never" instead of emphasized "NEVER".
- **Violates**: Prompt Engineering best practice - "Use emphasis keywords for adherence"
- **Suggested Fix**:
  ```markdown
  NEVER bypass `serverRuntime` when running server effects; downstream hosts rely on its span wrapping (`Effect.withSpan`) for telemetry cohesion.
  ```

#### Issue 2: Placeholder Test Acknowledgment Without Guidance
- **Location**: AGENTS.md:L85
- **Problem**: Notes "currently placeholder but keeps regressions obvious" without providing guidance on what tests should exist or how to add meaningful tests.
- **Violates**: Required sections - "Testing Instructions: How to run tests, what to test"
- **Suggested Fix**: Add test expectation guidance:
  ```markdown
  - `bun run test --filter=@beep/runtime-server` - Vitest suite (currently placeholder).
    - When adding new layers, include layer construction tests
    - When adding runtime helpers, test span propagation
  ```

#### Issue 3: Missing Security/Secrets Guidance
- **Location**: N/A (missing)
- **Problem**: No explicit guidance on handling environment variables, secrets, or preventing production information leakage despite references to environment toggles.
- **Violates**: Required sections - "Security: NEVER store in memory files", Warnings/Gotchas
- **Suggested Fix**: Add a warning note:
  ```markdown
  ## Security Notes
  - Environment variables from `@beep/shared-server` may contain secrets (OTLP endpoints, DB credentials)
  - NEVER log raw environment values; use structured logging with redaction
  - DevToolsLive auto-disables in production but verify via `serverEnv.app.NODE_ENV`
  ```

#### Issue 4: Authoring Guardrails Lack Emphasis on Prohibitions
- **Location**: AGENTS.md:L26-31
- **Problem**: Multiple "never" and "avoid" patterns are stated in regular prose without emphasis keywords.
- **Violates**: Best practice - Use NEVER, ALWAYS, AVOID keywords
- **Suggested Fix**:
  ```markdown
  ## Authoring Guardrails
  - ALWAYS import Effect modules through namespace bindings...
  - NEVER bypass `serverRuntime` when running server effects...
  - PREFER `Layer.mergeAll` and `Layer.provideMerge` over manual `Layer.build`...
  - ALWAYS respect environment toggles from `serverEnv.app`...
  ```

---

### Missing Elements

- [ ] **Warnings/Gotchas section** - No documentation of common pitfalls (e.g., layer initialization order, memoization issues)
- [ ] **Emphasis keywords** - Critical rules need NEVER/ALWAYS/IMPORTANT emphasis
- [ ] **Security guidance** - No explicit notes on environment variable handling
- [ ] **Error recovery patterns** - No guidance on handling runtime initialization failures
- [ ] **Test pattern guidance** - What kinds of tests should exist for runtime packages

---

### Anti-Patterns Detected

#### File Structure Anti-Patterns
- [x] One massive CLAUDE.md (>100 lines) - Not detected (93 lines, well-sized)
- [x] Secrets or credentials - Not detected
- [x] Large embedded code examples - Two recipes are appropriate size

#### Content Anti-Patterns
- [x] Vague instructions - Not detected; instructions are specific and actionable
- [x] Missing command descriptions - Commands have clear descriptions
- [ ] No emphasis keywords for critical rules - **Detected**: L27, L28, L29
- [x] Large embedded code examples - Recipes are appropriately sized

#### Workflow Anti-Patterns
- [x] No exploration/planning phase - Surface Map provides exploration guidance
- [ ] Missing testing instructions - **Partial**: Commands present but guidance lacking
- [x] No architecture guidance - Excellent architecture documentation

---

# Package: `@beep/runtime-client`

## File: packages/runtime/client/AGENTS.md

### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Mirrors server package structure with excellent organization |
| **Commands** | 2/2 | Complete verification commands including build validation |
| **Specificity** | 2/2 | Highly actionable with file:line references and concrete patterns |
| **Constraints** | 1/2 | Good constraints but missing emphasis keywords |
| **Architecture** | 2/2 | Clear surface map, layer composition, and cross-package relationships |
| **Testing** | 1/2 | Commands present but notes "extend beyond placeholder" - lacks test patterns |
| **Security** | 1/2 | No explicit security notes for browser context |
| **Maintainability** | 2/2 | Well-sized file (109 lines), focused scope |

**Total: 13/16**

---

### Strengths

1. **Consistent Structure with Server Package**: Maintains parallel documentation structure, making cross-package navigation intuitive.

2. **Browser-Specific Context**: Clearly documents browser-safe patterns, IndexedDB fallbacks, and `"use client"` boundary requirements.

3. **Three Detailed Recipes**: Provides practical examples for atom composition, IndexedDB extension, and worker RPC usage.

4. **Worker and Atom Integration Docs**: Unique coverage of effect-atom integration and worker client patterns specific to the client runtime.

5. **Cross-Package References**: Explicitly references server runtime patterns for observability alignment.

---

### Issues Found

#### Issue 1: Missing Emphasis Keywords on Critical Rules
- **Location**: AGENTS.md:L23-28
- **Problem**: Multiple prohibitions stated without emphasis: "native array/string/object helpers remain forbidden", "avoid server-only APIs", "do not short-circuit unmount paths".
- **Violates**: Prompt Engineering best practice - "Use emphasis keywords for adherence"
- **Suggested Fix**:
  ```markdown
  ## Authoring Guardrails
  - ALWAYS namespace Effect imports...
  - NEVER use native array/string/object helpers - pipe through Effect collections utilities.
  - NEVER use server-only APIs in `packages/runtime/client`.
  - NEVER short-circuit unmount paths or create competing runtimes per component.
  ```

#### Issue 2: Placeholder Test Acknowledgment
- **Location**: AGENTS.md:L100
- **Problem**: Notes "extend beyond placeholder `Dummy.test.ts` when adding behaviour" without guidance on what tests should exist.
- **Violates**: Required sections - "Testing Instructions"
- **Suggested Fix**:
  ```markdown
  - `bun run test --filter @beep/runtime-client` - Bun tests.
    - Test `clientRuntimeLayer` construction in non-browser environments
    - Mock IndexedDB and WebSocket for layer tests
    - Verify `"use client"` boundaries don't import server modules
  ```

#### Issue 3: Missing SSR/Browser Context Security Notes
- **Location**: N/A (missing)
- **Problem**: No guidance on browser security considerations (XSS prevention, secure storage, worker message validation).
- **Violates**: Security best practices
- **Suggested Fix**:
  ```markdown
  ## Security Notes
  - IndexedDB stores are accessible to all scripts on the origin - avoid storing sensitive tokens
  - Worker messages should be validated before processing
  - OTLP exports may include sensitive span data - review sampling configuration
  ```

#### Issue 4: Missing Gotchas for SSR Context
- **Location**: AGENTS.md:L28 (brief mention)
- **Problem**: L28 mentions "provide a mock `KeyValueStore` for SSR/tests" but doesn't explain the SSR hydration gotcha or how to detect SSR context.
- **Violates**: Required sections - "Warnings/Gotchas"
- **Suggested Fix**: Add dedicated Gotchas section:
  ```markdown
  ## Gotchas
  - `layerIndexedDB` will fail in SSR - check `typeof window !== 'undefined'` before using
  - `RuntimeProvider` must be the outermost Effect provider to ensure proper disposal
  - Worker client requires a running web worker - check bundler emits worker correctly
  ```

---

### Missing Elements

- [ ] **Warnings/Gotchas section** - No SSR/hydration pitfalls documented
- [ ] **Emphasis keywords** - Critical rules need NEVER/ALWAYS emphasis
- [ ] **Security guidance** - Browser security considerations missing
- [ ] **SSR detection patterns** - How to detect and handle SSR context
- [ ] **Test mocking guidance** - How to mock browser APIs for tests

---

### Anti-Patterns Detected

#### File Structure Anti-Patterns
- [x] One massive file - Not detected (109 lines, well-sized)
- [x] Secrets or credentials - Not detected

#### Content Anti-Patterns
- [ ] No emphasis keywords for critical rules - **Detected**: L23-28 lack NEVER/ALWAYS
- [x] Missing command descriptions - Commands well-described
- [x] Vague instructions - Not detected

#### Workflow Anti-Patterns
- [ ] Missing testing instructions - **Partial**: Commands present but patterns lacking
- [ ] Missing warnings about gotchas - **Detected**: SSR context issues not documented

---

# Package: `@beep/ui`

## File: packages/ui/ui/AGENTS.md

### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized with clear sections covering all aspects |
| **Commands** | 2/2 | Complete build, lint, test, codegen commands documented |
| **Specificity** | 2/2 | Highly specific with exact paths and configuration file references |
| **Constraints** | 1/2 | Effect namespace rule emphasized, but styling constraints less clear |
| **Architecture** | 2/2 | Excellent theme/settings/component organization docs |
| **Testing** | 1/2 | Commands present but test pattern guidance is minimal |
| **Security** | 0/2 | No security guidance for UI package (XSS, sanitization) |
| **Maintainability** | 2/2 | Well-sized (102 lines), focused on UI concerns |

**Total: 12/16**

---

### Strengths

1. **Comprehensive Export Documentation**: Detailed listing of all package exports organized by category (component hierarchy, functionality, theming, utilities).

2. **Theme & Settings Integration**: Clear documentation of how `ThemeProvider`, settings context, and locale overrides interconnect.

3. **Styling Layers Section**: Excellent guidance on when to use Tailwind vs MUI `sx` prop vs styled helpers.

4. **External Documentation References**: Links to MUI, shadcn, and Tailwind documentation provide valuable context.

5. **Change Checklist with Checkboxes**: Actionable checkbox list for contributors covering exports, build artifacts, and locale coordination.

---

### Issues Found

#### Issue 1: Effect Namespace Rule Needs Emphasis
- **Location**: AGENTS.md:L41
- **Problem**: The critical Effect namespace rule is stated but without NEVER/ALWAYS emphasis, despite being repo-wide critical.
- **Violates**: Prompt Engineering best practice - "Use emphasis keywords for adherence"
- **Suggested Fix**:
  ```markdown
  - ALWAYS namespace Effect utilities (`import * as A from "effect/Array"`, `import * as Str from "effect/String"`).
  - NEVER use native array/string methods - this is a CRITICAL repo-wide rule.
  ```

#### Issue 2: Missing Security Guidance for UI Components
- **Location**: N/A (missing)
- **Problem**: UI components are XSS-sensitive, especially the Plate.js rich text editor. No sanitization or security guidance provided.
- **Violates**: Security best practices
- **Suggested Fix**:
  ```markdown
  ## Security Considerations
  - Rich text content from Plate.js must be sanitized before rendering outside the editor
  - NEVER use `dangerouslySetInnerHTML` without sanitization
  - User-provided URLs in links/images should be validated
  - Form inputs should sanitize values before submission
  ```

#### Issue 3: Incomplete Testing Section
- **Location**: AGENTS.md:L71
- **Problem**: Only mentions "add focused tests under `src/**/__tests__`" without guidance on what to test or testing patterns for UI components.
- **Violates**: Required sections - "Testing Instructions"
- **Suggested Fix**:
  ```markdown
  - `bun run test` executes the Vitest suite.
    - Test component rendering with React Testing Library
    - Test hooks with `@testing-library/react-hooks`
    - Test theme integration by wrapping in `ThemeProvider`
    - Snapshot test complex organisms sparingly
  ```

#### Issue 4: Missing Gotchas Section
- **Location**: N/A (missing)
- **Problem**: No documentation of common pitfalls like SSR hydration mismatches, emotion cache issues, or settings migration.
- **Violates**: Required sections - "Warnings/Gotchas"
- **Suggested Fix**:
  ```markdown
  ## Gotchas
  - Settings `version` field must be incremented when changing persisted schema, or users get stale values
  - MUI components must be inside `ThemeProvider` or styles break
  - `"use client"` directive is required at file top, not after imports
  - shadcn components.json must stay in sync with new directories
  ```

#### Issue 5: Styling Tool Selection Lacks Clear Decision Tree
- **Location**: AGENTS.md:L51-54
- **Problem**: Provides options but no clear decision criteria for when to choose each tool.
- **Violates**: Specificity best practice
- **Suggested Fix**:
  ```markdown
  ## Styling Decision Tree
  - **MUI styled helpers** (`@beep/ui/styled`): Use for repeated customizations applied to many instances of an MUI component
  - **`sx` prop**: Use for one-off, token-aware style overrides on MUI components
  - **Tailwind classes**: Use for layout, spacing, and non-MUI elements
  - **CSS variables**: Use only when extending `@beep/ui-core` tokens
  ```

---

### Missing Elements

- [ ] **Security guidance** - XSS, sanitization, safe rendering patterns
- [ ] **Warnings/Gotchas section** - SSR, hydration, settings migration issues
- [ ] **Emphasis keywords** - Critical rules need NEVER/ALWAYS
- [ ] **Test pattern guidance** - What and how to test UI components
- [ ] **Accessibility notes** - No a11y guidance for component development

---

### Anti-Patterns Detected

#### File Structure Anti-Patterns
- [x] One massive file - Not detected (102 lines, acceptable size)
- [x] Secrets or credentials - Not detected

#### Content Anti-Patterns
- [ ] No emphasis keywords for critical rules - **Detected**: L41 Effect namespace rule
- [x] Missing command descriptions - Commands well-described
- [ ] Missing constraints/forbidden patterns - **Partial**: Styling constraints could be clearer

#### Workflow Anti-Patterns
- [ ] Missing testing instructions - **Detected**: Test patterns not documented
- [ ] Missing warnings about gotchas - **Detected**: No Gotchas section

---

# Package: `@beep/ui-core`

## File: packages/ui/core/AGENTS.md

### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent organization with mission, exports, theme foundations, settings |
| **Commands** | 2/2 | Clear validation commands with filter examples |
| **Specificity** | 2/2 | Highly specific with exact file paths and function names |
| **Constraints** | 1/2 | Effect namespace rule mentioned but without emphasis |
| **Architecture** | 2/2 | Comprehensive theme pipeline documentation |
| **Testing** | 1/2 | Commands present but testing section is minimal |
| **Security** | 0/2 | No security guidance |
| **Maintainability** | 2/2 | Well-sized (128 lines), focused on core concerns |

**Total: 12/16**

---

### Strengths

1. **Complete Export Inventory**: Exhaustive listing of all public exports organized by category (Theme, Settings, Utils, i18n, Adapters).

2. **Theme Foundations Deep Dive**: Detailed explanation of `createTheme`, `baseTheme`, and the theme composition pipeline.

3. **Settings-Driven Customization**: Clear documentation of how settings state flows through the theme pipeline.

4. **Component Override Catalogue**: Documents the component override pattern and aggregation in `components/index.ts`.

5. **Cross-Package Impact Awareness**: Explicitly notes downstream impacts to `@beep/ui` and coordination requirements.

---

### Issues Found

#### Issue 1: Effect Namespace Rule Needs Emphasis
- **Location**: AGENTS.md:L85, L96
- **Problem**: References "CRITICAL RULE" and the no-native-array pattern but doesn't use emphasis keywords directly in the constraints.
- **Violates**: Prompt Engineering best practice
- **Suggested Fix**:
  ```markdown
  - NEVER use native array/string methods in component overrides - use Effect utilities.
  - ALWAYS namespace Effect imports (`import * as A from "effect/Array"`).
  ```

#### Issue 2: Missing Security Guidance
- **Location**: N/A (missing)
- **Problem**: Theme packages can be vectors for CSS injection or storage manipulation. No security notes provided.
- **Violates**: Security best practices
- **Suggested Fix**:
  ```markdown
  ## Security Notes
  - Settings stored via `getStorage`/`setStorage` are not encrypted - do not store sensitive data
  - CSS custom properties should not contain user-provided values without sanitization
  - Color presets should be validated against allowed values
  ```

#### Issue 3: Incomplete Testing Guidance
- **Location**: AGENTS.md:L102
- **Problem**: Notes "add a targeted test if the filter does not exist yet" but provides no guidance on what theme tests should cover.
- **Violates**: Required sections - "Testing Instructions"
- **Suggested Fix**:
  ```markdown
  - `bun run test --filter theme` - theme-specific tests.
    - Test `createTheme` produces valid MUI theme structure
    - Test `applySettingsToTheme` correctly applies all settings fields
    - Test color preset calculations produce valid CSS values
    - Test RTL component sets correct document direction
  ```

#### Issue 4: Missing Gotchas Section
- **Location**: N/A (missing)
- **Problem**: No documentation of common pitfalls like settings version migration, theme caching, or RTL cache issues.
- **Violates**: Required sections - "Warnings/Gotchas"
- **Suggested Fix**:
  ```markdown
  ## Gotchas
  - `settings.version` must be incremented when changing `SettingsState` schema
  - RTL cache must be cleared when switching direction or styles persist incorrectly
  - `cssVariables: true` in theme config means CSS custom properties are used, not inline styles
  - Locale bundles must export `.components` matching MUI's structure or merging fails silently
  ```

#### Issue 5: Color Preset Instructions Incomplete
- **Location**: AGENTS.md:L74-77
- **Problem**: Lists three places to update when adding a preset but doesn't specify what changes are needed in each.
- **Violates**: Specificity best practice
- **Suggested Fix**:
  ```markdown
  When adding a new preset, update:
  - `ThemeColorPreset` union: Add the new preset name to the type
  - `primaryColorPresets`: Add `{ [presetName]: { main, light, dark, contrastText } }`
  - `secondaryColorPresets`: Add matching secondary color object
  - `@beep/ui` preset controls: Add preset to dropdown options
  ```

---

### Missing Elements

- [ ] **Security guidance** - Storage security, CSS injection prevention
- [ ] **Warnings/Gotchas section** - Version migration, cache invalidation issues
- [ ] **Emphasis keywords** - Critical rules need NEVER/ALWAYS
- [ ] **Test pattern guidance** - What theme aspects to test
- [ ] **Breaking change protocol** - How to handle breaking changes to downstream packages

---

### Anti-Patterns Detected

#### File Structure Anti-Patterns
- [x] One massive file - Not detected (128 lines, at threshold but acceptable for core package)
- [x] Secrets or credentials - Not detected

#### Content Anti-Patterns
- [ ] No emphasis keywords for critical rules - **Detected**: L85, L96 reference critical rule without emphasis
- [x] Missing command descriptions - Commands well-described

#### Workflow Anti-Patterns
- [ ] Missing testing instructions - **Detected**: Test patterns not documented
- [ ] Missing warnings about gotchas - **Detected**: No Gotchas section

---

# Cross-Cutting Recommendations

## High Priority

1. **Add Emphasis Keywords Across All Files**
   All four files have critical rules stated without NEVER/ALWAYS/IMPORTANT emphasis. This is the most impactful improvement for AI adherence:
   - Effect namespace imports: `ALWAYS namespace Effect imports`
   - Native method prohibition: `NEVER use native array/string methods`
   - Runtime bypass prevention: `NEVER bypass serverRuntime/RuntimeProvider`
   - Server/client boundary: `NEVER import server-only APIs in client packages`

2. **Add Gotchas/Warnings Sections**
   All four files lack this critical section. Each package has unique pitfalls that should be documented:
   - **runtime-server**: Layer initialization order, memoization
   - **runtime-client**: SSR context, hydration, worker initialization
   - **ui**: Settings version migration, emotion cache, `"use client"` placement
   - **ui-core**: Theme caching, RTL cache, locale bundle structure

3. **Enhance Testing Sections**
   All files acknowledge placeholder tests without providing guidance on what tests should exist. Add:
   - What aspects to test (layers, components, theme integration)
   - How to mock environment dependencies
   - Minimum test coverage expectations

## Medium Priority

4. **Add Security Guidance to All Files**
   | Package | Security Concerns |
   |---------|-------------------|
   | runtime-server | Environment variable handling, logging redaction |
   | runtime-client | IndexedDB exposure, worker message validation |
   | ui | XSS prevention, form sanitization |
   | ui-core | Settings storage security, CSS injection |

5. **Standardize Contributor Checklist Format**
   runtime-server and runtime-client have prose checklists; ui and ui-core have checkbox format. Standardize on checkbox format for all:
   ```markdown
   ## Contributor Checklist
   - [ ] Item one
   - [ ] Item two
   ```

6. **Add Error Recovery Patterns**
   None of the files document what to do when initialization fails or commands error. Add guidance on:
   - Runtime layer construction failures
   - Build/test failures and how to debug
   - How to reset state (clear IndexedDB, settings storage)

## Low Priority

7. **Cross-Reference Related Packages**
   Add "See Also" or "Related Packages" section linking between:
   - runtime-server <-> runtime-client (observability alignment)
   - ui <-> ui-core (theme and settings contract)

8. **Add Version/Update History**
   Consider adding a brief changelog or "Last Updated" note to track documentation freshness.

9. **Consider Path-Specific Rules**
   For packages with distinct file patterns (e.g., `ui/src/atoms/*` vs `ui/src/organisms/*`), YAML frontmatter rules could provide targeted guidance.

---

## Summary Scores

| File | Score | Key Improvements Needed |
|------|-------|-------------------------|
| runtime-server/AGENTS.md | 13/16 | Emphasis keywords, Gotchas section |
| runtime-client/AGENTS.md | 13/16 | Emphasis keywords, SSR Gotchas, Security notes |
| ui/ui/AGENTS.md | 12/16 | Security guidance, Gotchas section, Test patterns |
| ui/core/AGENTS.md | 12/16 | Security guidance, Gotchas section, Test patterns |

**Average Score: 12.5/16 (78%)** - All files are in the "Minor improvements available" range (11-14), indicating solid baseline documentation with targeted enhancement opportunities.
