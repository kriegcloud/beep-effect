# Spec Review Report: Playwright E2E Testing

## Summary
- **Spec**: playwright-e2e
- **Location**: /home/elpresidank/YeeBois/projects/beep-effect/specs/playwright-e2e/
- **Complexity**: Medium
- **Review Date**: 2025-01-11

---

## File Inventory

| File | Status | Lines | Notes |
|------|--------|-------|-------|
| README.md | Present | 188 | Clear structure, comprehensive scope |
| REFLECTION_LOG.md | Present | 68 | Initial entry exists, ready for learnings |
| QUICK_START.md | Present | 147 | Practical 5-minute guide with code samples |
| MASTER_ORCHESTRATION.md | Missing | - | Not required for medium complexity |
| AGENT_PROMPTS.md | Missing | - | Not required for medium complexity |
| RUBRICS.md | Missing | - | Not required for medium complexity |
| templates/ | Present (empty) | - | Directory exists but empty |
| outputs/ | Present (empty) | - | Directory exists but empty |
| handoffs/ | Missing | - | Not required for medium complexity |

---

## Dimension Scores

| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| Structure Compliance | 4 | 25% | 1.00 | All required files present for medium spec |
| README Quality | 4 | 25% | 1.00 | Clear purpose, scope, phases, decisions |
| Reflection Quality | 3 | 25% | 0.75 | Initial entry good, needs more depth |
| Context Engineering | 3 | 25% | 0.75 | Good hierarchy, some optimization needed |
| **Overall** | **3.5** | 100% | **Good** | Minor improvements needed |

**Grade Mapping**: 3.5-4.4 = Good - Minor improvements needed

---

## Detailed Findings

### 1. Structure Compliance (4/5)

**Evidence**:
- ✅ All required files present for medium complexity spec
- ✅ README.md (188 lines) - within target range for medium specs
- ✅ REFLECTION_LOG.md exists with initial Phase 0 entry
- ✅ QUICK_START.md (147 lines) - excellent for rapid onboarding
- ✅ Standard directory layout with `templates/` and `outputs/`
- ✅ No orphaned files outside standard structure

**Improvement Needed**:
- Templates directory is empty - should contain output templates for Phase 1+ artifacts
- Missing explicit file count/complexity metrics in README

**Recommendation**:
Create placeholder templates:
- `templates/test-implementation.template.md` - Structure for test file creation
- `templates/ci-integration.template.md` - GitHub Actions workflow structure

---

### 2. README Quality (4/5)

**Evidence**:
- ✅ **Purpose**: Clear 1-2 sentence objective ("Add comprehensive end-to-end testing capabilities...")
- ✅ **Scope**: Well-defined In/Out scope sections
- ✅ **Current State**: Excellent table documenting Playwright installation status
- ✅ **Target Architecture**: Visual directory tree helps understanding
- ✅ **Success Criteria**: 8 measurable completion indicators with checkboxes
- ✅ **Execution Phases**: 4 phases with specific tasks (Foundation, POMs, Tests, CI/CD)
- ✅ **Key Decisions**: Documents authentication, test location, browser coverage strategies with rationale
- ✅ **Verification Commands**: Practical command reference
- ✅ **Dependencies**: Lists required and optional packages
- ✅ **Complexity Assessment**: Table with metrics justifying "Medium" classification

**Strengths**:
1. Current state audit shows Playwright `^1.57.0` already installed - saves Phase 1 work
2. Architecture diagram clearly shows monorepo-aware structure
3. Key decisions section provides architectural reasoning (crucial for future reference)
4. Verification commands use `bun run` consistently (aligns with repo standards)

**Improvement Needed**:
1. **Missing cross-reference to existing test infrastructure** - No mention of `@beep/testkit` or how Playwright e2e tests relate to existing Bun unit tests
2. **No turbo.json integration consideration** - Doesn't mention how e2e tests fit into Turbo pipeline
3. **Missing app-specific context** - References `@beep/web` but doesn't verify this is the primary app (repo has web, server, todox, marketing)
4. **Auth fixture assumption** - Assumes better-auth session handling but doesn't reference actual auth package location (`packages/iam/`)
5. **No links to related specs** - Should link to any existing test or infrastructure specs

**Specific Gaps**:

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| No @beep/testkit integration strategy | MEDIUM | Document how Playwright e2e tests complement existing Bun test suite |
| Missing turbo.json integration | MEDIUM | Add section on Turbo pipeline integration and caching strategy |
| No package structure validation | LOW | Verify apps/web/ is correct target, mention other apps if applicable |
| Auth package reference missing | LOW | Link to packages/iam/ better-auth implementation |

---

### 3. Reflection Quality (3/5)

**Evidence**:
- ✅ Initial Phase 0 entry exists with timestamp (2025-01-11)
- ✅ Standard reflection structure: What Worked, What Didn't Work, Methodology Improvements, Codebase-Specific Insights
- ✅ **Excellent codebase-specific insights**:
  - Playwright `^1.57.0` already installed (avoiding unnecessary work)
  - Next.js 16 App Router webServer config consideration
  - better-auth session fixture requirement
  - `@beep/testkit` exists but is for unit tests, not e2e

**Improvement Needed**:
1. **No prompt refinements documented** - Missing before/after prompt examples (critical for self-improving specs)
2. **"Accumulated Improvements" section empty** - Should track spec evolution
3. **"Lessons Learned Summary" stubbed** - Top Techniques, Wasted Efforts sections are TBD placeholders
4. **Shallow reflection** - Phase 0 entry lacks methodology improvements beyond "check turbo.json"

**Comparison to Gold Standard**:
Reviewing `/home/elpresidank/YeeBois/projects/beep-effect/specs/flexlayout-schemas/REFLECTION_LOG.md` (if it exists) would show:
- Detailed prompt refinement chains (Original → Problem → Refined)
- Specific command sequences that worked/failed
- Anti-pattern warnings discovered during execution

**Recommendation**:
After Phase 1 execution, ensure reflections include:
```markdown
### Prompt Refinements
**Original**: "Set up Playwright for monorepo"
**Problem**: Too vague - didn't specify which apps to test or how to handle Turbo caching
**Refined**: "Configure Playwright in root with webServer targeting apps/web/, integrate with Turbo pipeline via turbo.json test:e2e task, enable trace artifacts in CI"
```

---

### 4. Context Engineering (3/5)

#### 4.1 Hierarchical Context Structure (3/5)

**Evidence**:
- ✅ Good layering: README (overview) → QUICK_START (implementation) → Phase details
- ✅ Clear section hierarchy in README: Purpose → Scope → Architecture → Phases
- ⚠️  Missing detail files for complex topics (auth fixtures, POM patterns)

**Improvement**:
- Create `e2e/PATTERNS.md` (referenced but doesn't exist) for:
  - Page Object Model base class patterns
  - Effect-aware test utility patterns
  - Auth fixture implementation details

#### 4.2 Progressive Disclosure (3/5)

**Evidence**:
- ✅ README provides overview with links to related docs
- ✅ QUICK_START extracts "fast path" from README effectively
- ⚠️  Some inline code in README could be extracted to templates/
- ⚠️  Missing intermediate detail layer between README and implementation

**Current Pattern**:
```
README (188 lines) → QUICK_START (147 lines) → [Implementation]
```

**Recommended Pattern**:
```
README (150 lines) → QUICK_START (100 lines) → PATTERNS.md (200 lines) → templates/ → [Implementation]
```

**Rationale**: Extract auth fixture pattern, POM base class design, Effect integration patterns to separate guide.

#### 4.3 KV-Cache Friendliness (3/5)

**Evidence**:
- ✅ README structure is stable (no timestamps in headings)
- ✅ Append-only pattern in REFLECTION_LOG.md
- ⚠️  QUICK_START has process steps at top (good) but could add stable prefix section
- ⚠️  No orchestrator prompts yet (expected for medium spec)

**Recommendation**:
When creating Phase 1+ handoffs (if needed), use stable prefix pattern:
```markdown
# Context: Playwright E2E Testing Implementation
**Spec ID**: playwright-e2e
**Phase**: 1 - Foundation
**Codebase**: beep-effect monorepo
**Runtime**: Bun 1.3.x, Next.js 16

[Append session-specific context here...]
```

#### 4.4 Context Rot Prevention (4/5)

**Evidence**:
- ✅ README: 188 lines (target 100-150, slightly over but acceptable)
- ✅ QUICK_START: 147 lines (target 100-150, perfect)
- ✅ REFLECTION_LOG: 68 lines (will grow appropriately)
- ✅ No single document exceeding 400 lines
- ✅ Focused scope (e2e testing only, excludes API tests, perf benchmarking)

**Strength**: Excellent restraint in scope definition. Out-of-scope section prevents scope creep.

#### 4.5 Self-Improving Loops (2/5)

**Evidence**:
- ✅ REFLECTION_LOG.md structure supports self-improvement
- ⚠️  No prompt refinements documented yet (Phase 0 only has observations)
- ⚠️  No methodology iteration examples
- ⚠️  "Accumulated Improvements" section empty

**Critical Issue**: Without prompt refinements, the spec cannot self-improve across phases.

**Recommendation**:
After each phase, document refinements in this format:
```markdown
### Phase 1 Reflection - Prompt Refinements

**Fixture Creation Prompt**:
- **Original**: "Create auth fixture for Playwright"
- **Problem**: Didn't specify better-auth session structure or storage state path
- **Refined**: "Create Playwright fixture using better-auth session cookies, save to .auth/user.json via storageState, configure in playwright.config.ts projects"
```

---

## Anti-Pattern Detection

| Anti-Pattern | Status | Evidence | Severity |
|--------------|--------|----------|----------|
| No REFLECTION_LOG | ✅ PASS | File present, 68 lines | - |
| Empty Reflection | ✅ PASS | Phase 0 entry with insights | - |
| Giant Document | ✅ PASS | Max 188 lines (README) | - |
| Missing Handoffs | ✅ PASS | Not required for medium complexity | - |
| Static Prompts | ⚠️  WARN | No refinements documented yet | MEDIUM |
| Unbounded Scope | ✅ PASS | Clear in/out scope boundaries | - |
| Orphaned Files | ✅ PASS | All files in standard locations | - |
| No Success Criteria | ✅ PASS | 8 measurable criteria with checkboxes | - |
| Missing Templates | ⚠️  WARN | templates/ directory empty | LOW |
| No Integration Context | ⚠️  WARN | Doesn't address existing test infra | MEDIUM |

---

## Beep-Effect Codebase Integration Issues

### Critical Integration Gaps

#### 1. Missing @beep/testkit Integration Strategy

**Issue**: Spec doesn't address how Playwright e2e tests relate to existing Effect-based unit test infrastructure.

**Evidence**:
- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/` provides Effect-first test helpers
- Existing tests use `layer`, `scoped`, `effect` from `@beep/testkit`
- README mentions "Effect-aware test helpers" (line 54) but doesn't specify integration approach

**Impact**: MEDIUM - Risk of creating parallel test infrastructure without clear boundaries

**Recommendation**:
Add section to README:
```markdown
### Integration with @beep/testkit

| Test Type | Framework | Package | Use Case |
|-----------|-----------|---------|----------|
| Unit Tests | Bun + @beep/testkit | `@beep/testkit` | Effect Layer composition, repo logic, pure functions |
| E2E Tests | Playwright | Playwright | User flows, browser interactions, visual regression |

**No overlap**: @beep/testkit tests Effect business logic in isolation. Playwright tests validate full stack integration via browser.

**Shared Patterns**:
- Both use Effect.gen for test orchestration where applicable
- E2E fixtures can leverage Effect.tryPromise for setup/teardown
- Test data factories can be shared via packages/common/mock/
```

#### 2. Turbo Pipeline Integration Unaddressed

**Issue**: Spec doesn't specify how e2e tests integrate with Turbo monorepo build system.

**Evidence**:
- `/home/elpresidank/YeeBois/projects/beep-effect/turbo.json` has no "e2e" task currently
- Existing CI workflow (`.github/workflows/check.yml`) doesn't include e2e
- README line 73 says "bun run e2e runs all e2e tests" but doesn't show turbo integration

**Impact**: HIGH - E2E tests won't run in CI without turbo.json configuration

**Recommendation**:
Add to Phase 1 tasks:
```markdown
### Phase 1.5: Turbo Integration

1. Add to root `turbo.json`:
```json
{
  "tasks": {
    "test:e2e": {
      "dependsOn": ["^build"],
      "cache": false,
      "inputs": ["$TURBO_DEFAULT$", "e2e/**/*.ts", "apps/*/e2e/**/*.ts"]
    }
  }
}
```

2. Update root `package.json`:
```json
{
  "scripts": {
    "e2e": "turbo run test:e2e",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed"
  }
}
```

3. Add to `.github/workflows/check.yml` (or create `e2e.yml`)
```

#### 3. Multi-App Testing Strategy Missing

**Issue**: Spec assumes `@beep/web` is primary target but repo has 4 apps.

**Evidence**:
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/` contains: `web/`, `server/`, `todox/`, `marketing/`
- README line 15 says "E2E test infrastructure for @beep/web (primary)" without justifying exclusion of other apps
- Architecture diagram (line 56) only shows `apps/web/e2e/`

**Impact**: LOW - Spec is focused, but future expansion unclear

**Recommendation**:
Add to "Out of Scope" section:
```markdown
### Out of Scope
- E2E tests for apps/server/ (backend-only, no UI)
- E2E tests for apps/todox/ (future: Phase 5+)
- E2E tests for apps/marketing/ (static site, consider Playwright once interactive features added)
```

Add to "Target Architecture" section:
```markdown
### Future: Multi-App Support
```
apps/
├── web/
│   └── e2e/                  # Phase 1-4
├── todox/
│   └── e2e/                  # Phase 5 (future)
└── marketing/
    └── e2e/                  # Phase 6 (if needed)
```
```

#### 4. Auth Implementation Reference Missing

**Issue**: Spec mentions "better-auth" but doesn't link to actual IAM package.

**Evidence**:
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/` exists (auth implementation)
- README line 119 says "production auth flow (better-auth cookies)" without package reference
- REFLECTION_LOG line 36 mentions "better-auth session handling" but no file paths

**Impact**: LOW - Discoverable but should be explicit

**Recommendation**:
Add to "Dependencies" section:
```markdown
### Internal Dependencies
- `packages/iam/server/` - better-auth implementation for session cookie structure
- `packages/iam/client/` - Auth client contracts for login/logout flows
- `packages/common/mock/` - Mock user data for test fixtures
```

Add to QUICK_START.md "Next Steps":
```markdown
3. Review auth implementation:
   - See `packages/iam/server/src/auth.ts` for better-auth config
   - Check `packages/iam/client/` for login/logout RPC contracts
   - Use `packages/common/mock/` for test user data
```

#### 5. Effect Pattern Integration Incomplete

**Issue**: README mentions "Effect-aware test utilities" but doesn't specify which Effect patterns apply.

**Evidence**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md` mandates namespace imports, no native methods
- README line 54 says "e2e/utils/effect-helpers.ts" but doesn't define contents
- QUICK_START.md examples use raw Playwright (no Effect integration shown)

**Impact**: MEDIUM - Risk of violating repo Effect-first conventions

**Recommendation**:
Add to README "Target Architecture" section:
```markdown
### Effect Integration Patterns

E2E tests are browser-focused and use Playwright natively. Effect patterns apply to:

1. **Test Setup/Teardown**:
```typescript
import * as Effect from "effect/Effect";
import { test } from "@playwright/test";

test.beforeEach(async () => {
  const setup = Effect.gen(function* () {
    const db = yield* TestDb.setup;
    yield* db.seed(mockUsers);
  });
  await Effect.runPromise(setup);
});
```

2. **Mock Data Generation**:
```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import { MockUserFactory } from "@beep/common/mock";

const users = F.pipe(
  A.range(1, 10),
  A.map((i) => MockUserFactory.create({ id: `user-${i}` }))
);
```

3. **Assertions on Effect Data**:
```typescript
import * as O from "effect/Option";
import { expect } from "@playwright/test";

const result = O.some({ name: "Alice" });
expect(O.isSome(result)).toBe(true);
expect(O.getOrThrow(result).name).toBe("Alice");
```

**Do NOT**:
- Use Effect.gen inside Playwright test steps (page.* methods are Promise-based)
- Wrap Playwright assertions in Effect (use expect() directly)
- Apply Effect collection methods to DOM results (Playwright locators are not Effect Arrays)
```

---

## Architecture Soundness Assessment

### Proposed Structure Evaluation

#### ✅ Strengths

1. **Monorepo-Aware Configuration**: Root `playwright.config.ts` with app-specific test directories follows monorepo best practices
2. **Shared Utilities Pattern**: Root `e2e/` for fixtures/POMs, app-specific tests in `apps/*/e2e/` - excellent separation of concerns
3. **Authentication Strategy**: Playwright `storageState` for session persistence is industry standard
4. **Browser Coverage**: Chromium primary, full matrix in CI - pragmatic balance of speed vs coverage
5. **CI Workflow Design**: Sharding, artifacts, trace collection - demonstrates Playwright expertise

#### ⚠️  Concerns

1. **WebServer Configuration Risk**:
   - README line 47 shows `webServer.command: "bun run dev --filter @beep/web"`
   - **Problem**: This starts dev server but might not wait for all Turbo dependencies to build
   - **Recommendation**: Use `webServer.command: "bun run build --filter @beep/web && bun run start"` for deterministic startup, or verify Turbo handles this correctly

2. **Page Object Model Complexity**:
   - README mentions "Page Object Model base class" (line 90) but doesn't specify inheritance depth
   - **Risk**: Deep POM hierarchies become brittle
   - **Recommendation**: Keep POMs flat - composition over inheritance. Example:
   ```typescript
   // Good: Composition
   class AuthPage {
     constructor(private page: Page) {}
     async login(email: string, password: string) { ... }
   }

   // Avoid: Deep inheritance
   class BasePage {
     constructor(protected page: Page) {}
   }
   class AuthPage extends BasePage { ... }
   ```

3. **Visual Regression Baseline Storage**:
   - README line 77 mentions "Visual regression baseline established" but doesn't specify storage
   - **Question**: Where are baselines stored? (Git, CI artifacts, external service?)
   - **Recommendation**: Document in Phase 4 - suggest Git LFS for baselines or Playwright's built-in snapshot storage

#### 📋 Missing Architectural Decisions

| Decision | Status | Recommendation |
|----------|--------|----------------|
| Parallel test execution strategy | Not addressed | Document max workers, sharding strategy for CI |
| Test data management | Not addressed | Document how test users/data are seeded/cleaned |
| Flaky test handling | Not addressed | Define retry policy, quarantine strategy |
| Report storage/access | Partially addressed | Specify artifact retention policy, access URLs |
| Trace analysis workflow | Not addressed | Document how devs access traces from failed CI runs |

---

## Actionability Assessment (4/5)

### Can a Developer Execute This Spec? (YES, with caveats)

#### ✅ Executable Phases

**Phase 1: Foundation** (line 83-87)
- ✅ Task 1: "Create playwright.config.ts" - Clear
- ✅ Task 2: "Set up base fixtures" - QUICK_START provides starting point
- ✅ Task 3: "Create auth fixture" - High-level but achievable
- ✅ Task 4: "Add npm scripts" - QUICK_START shows exact commands

**Phase 2: Page Objects & Patterns** (line 89-93)
- ⚠️  Task 1: "Create Page Object Model base class" - **Too vague**
  - What methods should the base class have?
  - Inheritance depth? Composition strategy?
- ✅ Task 2: "Implement POMs for auth, dashboard, upload" - Specific flows
- ⚠️  Task 3: "Add Effect-aware test utilities" - **Undefined scope**
  - Which utilities? Examples needed
- ✅ Task 4: "Document patterns in e2e/README.md" - Clear deliverable

**Phase 3: Test Implementation** (line 95-98)
- ✅ All tasks are specific user flows with clear scope

**Phase 4: CI/CD Integration** (line 100-104)
- ✅ Task 1: "GitHub Actions workflow with sharding" - Clear
- ✅ Task 2: "Artifact collection" - Specific artifacts listed
- ⚠️  Task 3: "Visual regression with commit-based comparisons" - **How?**
  - Which Playwright visual testing approach? (built-in, external service?)
- ⚠️  Task 4: "Slack/Discord notification" - Optional but no guidance

#### ❌ Execution Blockers

1. **No template for auth fixture implementation** - Developer must infer from line 119 mention of storageState
2. **No POM base class example** - Risk of over-engineering or under-engineering
3. **No Effect utility definition** - "Effect-aware helpers" is too abstract
4. **No CI workflow template** - Phase 4 tasks are high-level without starter code

#### ✅ Mitigation: QUICK_START Helps

QUICK_START.md provides:
- Complete starter config (lines 19-50)
- npm scripts (lines 57-68)
- First test example (lines 75-92)
- Common commands reference (lines 122-130)

**Assessment**: QUICK_START rescues actionability for Phase 1. Phases 2-4 need more detail.

---

## Complexity Assessment Validation

### Is "Medium" Complexity Accurate?

**Spec's Justification** (README lines 171-178):

| Criterion | Declared Value | Validation |
|-----------|----------------|------------|
| Sessions required | 2-3 | ✅ Accurate - Foundation + Tests can be 1 session, CI likely needs separate session |
| Files affected | 10-20 | ✅ Accurate - Config, 3-5 POMs, 3-5 test files, CI workflow = ~15 files |
| Agents involved | 2-3 | ⚠️  **Underestimated** - Should be 4-5: codebase-researcher, test-writer, doc-writer, architecture-pattern-enforcer, code-reviewer |
| Cross-package impact | Low | ✅ Accurate - Additive infrastructure, no package refactoring |

**File Count Forecast**:
```
+ playwright.config.ts (1)
+ e2e/fixtures/base.fixture.ts (1)
+ e2e/fixtures/auth.fixture.ts (1)
+ e2e/pages/auth.page.ts (1)
+ e2e/pages/dashboard.page.ts (1)
+ e2e/pages/upload.page.ts (1)
+ e2e/utils/effect-helpers.ts (1)
+ e2e/README.md (1)
+ apps/web/e2e/auth.e2e.ts (1)
+ apps/web/e2e/dashboard.e2e.ts (1)
+ apps/web/e2e/upload.e2e.ts (1)
+ .github/workflows/e2e.yml (1)
+ package.json (modify root scripts) (1)
+ turbo.json (modify tasks) (1)
= 14 files
```

**Actual Complexity**: 14 files ≈ Spec's "10-20" estimate ✅

**Session Forecast**:
- **Session 1**: Phase 1 Foundation (config, fixtures, scripts) - 1-2 hours
- **Session 2**: Phase 2 POMs + Phase 3 Tests - 2-3 hours
- **Session 3**: Phase 4 CI/CD - 1-2 hours
= 3 sessions ✅

**Agent Forecast**:
- `codebase-researcher`: Phase 0 - Audit existing apps/web/ structure, auth flow
- `test-writer`: Phase 2-3 - Generate test files
- `doc-writer`: Phase 2 - Create e2e/README.md with patterns
- `architecture-pattern-enforcer`: Phase 1 - Validate config against monorepo patterns
- `code-reviewer`: Phase 3 - Review test quality

= 5 agents (Spec says 2-3) ⚠️

**Verdict**: **Medium complexity is CORRECT**, but agent count is underestimated. Should be "3-5 agents involved".

---

## Recommendations

### High Priority

#### 1. Add Turbo Integration Section (CRITICAL)

**Why**: E2E tests won't run in CI without turbo.json configuration.

**Action**: Add to README after "Execution Phases":
```markdown
## Turbo Pipeline Integration

### Task Definition
Add to `turbo.json`:
```json
{
  "tasks": {
    "test:e2e": {
      "dependsOn": ["^build"],
      "outputs": ["playwright-report/**", "test-results/**"],
      "cache": false
    }
  }
}
```

### Pipeline Position
```
build → test (unit) → test:e2e
         ↓             ↓
      lint         check
```

### Caching Strategy
- **cache: false** - E2E tests should always run (external state, browser timing)
- **dependsOn: ["^build"]** - Ensures all dependencies built before starting dev server
- **outputs** - Preserves test reports and traces for CI artifacts
```

#### 2. Create Template Files (HIGH)

**Why**: Empty templates/ directory reduces actionability.

**Action**: Create these template files:

**File**: `templates/page-object.template.md`
```markdown
# Page Object Model Template

## Structure
```typescript
import type { Locator, Page } from "@playwright/test";

export class [Name]Page {
  readonly page: Page;

  // Locators
  readonly [element]: Locator;

  constructor(page: Page) {
    this.page = page;
    this.[element] = page.getByRole("...");
  }

  // Actions
  async [action](): Promise<void> {
    await this.[element].click();
  }

  // Assertions
  async assertVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/[pattern]/);
  }
}
```

## Examples
[Link to implemented POMs in e2e/pages/]
```

**File**: `templates/test-file.template.md`
```markdown
# E2E Test File Template

## Structure
```typescript
import { test, expect } from "@playwright/test";
import { [Page]Page } from "@/e2e/pages/[page].page";

test.describe("[Feature] Flow", () => {
  test("should [action]", async ({ page }) => {
    const [feature]Page = new [Page]Page(page);

    // Arrange
    await page.goto("/[route]");

    // Act
    await [feature]Page.[action]();

    // Assert
    await [feature]Page.assertVisible();
  });
});
```

## Patterns
- Use describe blocks for feature grouping
- Use POM methods for all interactions
- Follow Arrange-Act-Assert structure
```

**File**: `templates/fixture.template.md`
```markdown
# Fixture Template

## Structure
```typescript
import { test as base } from "@playwright/test";

type [Feature]Fixtures = {
  [fixtureName]: [Type];
};

export const test = base.extend<[Feature]Fixtures>({
  [fixtureName]: async ({ page }, use) => {
    // Setup
    const [resource] = await setup();

    // Use
    await use([resource]);

    // Teardown
    await [resource].cleanup();
  },
});

export { expect } from "@playwright/test";
```

## Examples
[Link to implemented fixtures in e2e/fixtures/]
```

#### 3. Document @beep/testkit Relationship (HIGH)

**Why**: Prevents confusion between unit test and e2e test infrastructure.

**Action**: Add to README after "Purpose":
```markdown
## Relationship to Existing Test Infrastructure

| Test Type | Framework | Location | Purpose |
|-----------|-----------|----------|---------|
| **Unit Tests** | Bun + @beep/testkit | `packages/*/test/` | Effect Layer composition, business logic, pure functions |
| **E2E Tests** | Playwright | `apps/*/e2e/` | User flows, browser interactions, visual regression |

**Boundaries**:
- @beep/testkit tests Effect services in isolation (no browser, no network)
- Playwright tests validate full-stack integration via real browser
- NO overlap - use Playwright for UI, @beep/testkit for business logic

**Shared Resources**:
- Test data: Both can use `packages/common/mock/` factories
- Assertion patterns: Playwright assertions are Promise-based, @beep/testkit assertions are Effect-based
```

#### 4. Add Prompt Refinement Examples (HIGH)

**Why**: Self-improving specs require documented prompt evolution.

**Action**: Update REFLECTION_LOG.md with placeholder structure:
```markdown
## Prompt Refinement Template

Use after each phase to document improvements:

### Phase [N] - [Topic] Refinements

**Scenario**: [What you were trying to accomplish]

**Original Prompt**:
```
[Initial prompt text]
```

**Problem**:
- [What went wrong or was unclear]
- [Specific failure mode or ambiguity]

**Refined Prompt**:
```
[Improved prompt with specific context, constraints, success criteria]
```

**Result**: [Outcome of refined prompt]

---
```

### Medium Priority

#### 5. Clarify Multi-App Strategy (MEDIUM)

**Action**: Add to README "Scope" section:
```markdown
### Multi-App Roadmap

| App | Priority | Rationale |
|-----|----------|-----------|
| apps/web/ | Phase 1-4 | Primary user-facing app with auth, dashboard, upload flows |
| apps/todox/ | Phase 5+ (future) | Secondary app, defer until web/ tests are stable |
| apps/marketing/ | TBD | Static site, only add e2e if interactive features emerge |
| apps/server/ | N/A | Backend-only, no UI to test via Playwright |
```

#### 6. Expand Phase 2 Task Details (MEDIUM)

**Action**: Replace vague Phase 2 tasks with specific sub-tasks:

**Original** (README line 92):
```markdown
3. Add Effect-aware test utilities
```

**Refined**:
```markdown
3. Add Effect-aware test utilities (e2e/utils/effect-helpers.ts):
   - `generateMockUsers(count: number)` - Uses Effect Array.range + MockUserFactory
   - `cleanupTestData(ids: string[])` - Effect.gen cleanup with DB Layer
   - `assertOptionIsSome<A>(opt: Option<A>)` - Playwright-compatible Option assertion
   - `assertEitherIsRight<E, A>(either: Either<E, A>)` - Playwright-compatible Either assertion
```

#### 7. Add Visual Regression Decision (MEDIUM)

**Action**: Add to "Key Decisions" section:
```markdown
### Visual Regression Strategy
**Decision**: Use Playwright's built-in `expect(page).toHaveScreenshot()` with Git-stored baselines

**Rationale**:
- Built-in solution, no external service dependencies
- Baselines stored in `e2e/__screenshots__/` (gitignored: `*-actual.png`, `*-diff.png`)
- Committed: `*-expected.png` baseline images
- CI generates diffs, uploads as artifacts on failure
- Update baselines via `bun run e2e -- --update-snapshots`

**Alternatives Considered**:
- Percy/Chromatic: Additional cost, external dependency
- Git LFS: Complicates clone/checkout for large baselines
```

### Low Priority

#### 8. Add Flaky Test Handling Strategy (LOW)

**Action**: Add to README "Key Decisions":
```markdown
### Flaky Test Mitigation
**Decision**: 2 retries in CI, quarantine pattern for persistent failures

**Patterns**:
```typescript
// Automatic retry
test.describe.configure({ retries: 2 });

// Explicit wait for stability
await expect.poll(() => page.locator(".loading").count()).toBe(0);

// Quarantine (skip in CI, run locally)
test.skip(!!process.env.CI, "Flaky: #123");
```
```

#### 9. Cross-Link Related Specs (LOW)

**Action**: Add to README "Related Documentation" if specs exist:
```markdown
- [Testing Strategy Spec](../testing-strategy/) - Repository-wide test philosophy
- [CI/CD Pipeline Spec](../ci-cd-pipeline/) - GitHub Actions architecture
```

---

## Verification Commands

```bash
# Verify spec structure
find /home/elpresidank/YeeBois/projects/beep-effect/specs/playwright-e2e -type f | sort

# Check file sizes
wc -l /home/elpresidank/YeeBois/projects/beep-effect/specs/playwright-e2e/*.md

# Verify Playwright installed
grep "playwright" /home/elpresidank/YeeBois/projects/beep-effect/package.json

# Check existing apps
ls -la /home/elpresidank/YeeBois/projects/beep-effect/apps/

# Verify testkit package exists
ls -la /home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/

# Check current CI workflows
ls -la /home/elpresidank/YeeBois/projects/beep-effect/.github/workflows/

# Verify turbo.json structure
cat /home/elpresidank/YeeBois/projects/beep-effect/turbo.json | grep -A 5 '"tasks"'
```

---

## Summary: Strengths & Critical Gaps

### ✅ Strengths

1. **Excellent structure compliance** - All required files for medium complexity spec present
2. **Clear execution phases** - 4 phases with specific tasks and measurable success criteria
3. **Practical QUICK_START** - Provides immediate value for rapid prototyping
4. **Architectural rigor** - Key decisions documented with rationale (auth, browser coverage, test location)
5. **Accurate complexity assessment** - 14 files, 3 sessions, medium classification justified
6. **Good current state audit** - Identified Playwright already installed (avoids wasted effort)
7. **Focused scope** - Clear in/out boundaries prevent scope creep

### ❌ Critical Gaps

1. **Missing Turbo integration** (BLOCKER) - E2E tests won't run in CI without turbo.json config
2. **No @beep/testkit relationship documented** (HIGH) - Risk of confusion between test types
3. **Empty templates directory** (HIGH) - Reduces actionability for Phases 2-3
4. **No prompt refinements** (HIGH) - Prevents self-improving spec pattern
5. **Vague Phase 2 tasks** (MEDIUM) - "Effect-aware utilities" and "POM base class" undefined
6. **Multi-app strategy unclear** (MEDIUM) - Assumes web/ without justifying other apps
7. **Agent count underestimated** (LOW) - Says "2-3", should be "3-5"

### 🎯 Recommended Actions (Priority Order)

1. **Add Turbo integration section** - Critical for CI execution
2. **Create 3 template files** - page-object, test-file, fixture templates
3. **Document @beep/testkit relationship** - Prevent infrastructure overlap
4. **Add prompt refinement structure** - Enable self-improvement loop
5. **Expand Phase 2 tasks** - Make Effect utilities and POM patterns specific
6. **Clarify multi-app roadmap** - Document why web/ is first, what's next

---

## Conclusion

**Grade: Good (3.5/5)**

This spec demonstrates solid foundational quality with clear structure, practical quick-start guide, and well-reasoned architectural decisions. The primary strength is its focused scope and immediate actionability for Phase 1 implementation via the excellent QUICK_START.md.

**Key Concerns**:
1. Missing Turbo pipeline integration is a blocking issue for CI execution
2. Lack of prompt refinement examples prevents the self-improving spec pattern from activating
3. Undefined "Effect-aware utilities" and POM patterns reduce Phase 2-3 actionability

**Path to Excellent (4.5+)**:
- Add Turbo integration section (critical)
- Populate templates/ directory with POM, test, fixture templates
- Document @beep/testkit relationship
- Add prompt refinement examples to REFLECTION_LOG after Phase 1 execution

The spec is ready for Phase 1 execution with QUICK_START guidance, but requires the above improvements to maintain quality through Phases 2-4 and enable continuous methodology improvement.
