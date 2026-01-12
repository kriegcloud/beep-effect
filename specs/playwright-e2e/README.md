# Playwright E2E Testing Spec

> Implement end-to-end testing infrastructure using Playwright for the beep-effect monorepo.

---

## Purpose

Add comprehensive end-to-end testing capabilities to the beep-effect monorepo using Playwright. This enables visual regression testing, user flow validation, and cross-browser compatibility testing for all Next.js applications.

## Relationship to @beep/testkit

| Test Type | Framework | Location | Purpose |
|-----------|-----------|----------|---------|
| **Unit Tests** | Bun + @beep/testkit | `packages/*/test/` | Effect Layer composition, business logic, pure functions |
| **E2E Tests** | Playwright | `apps/*/e2e/` | User flows, browser interactions, visual regression |

**Boundaries**:
- `@beep/testkit` tests Effect services in isolation (no browser, no network)
- Playwright tests validate full-stack integration via real browser
- NO overlap - use Playwright for UI, @beep/testkit for business logic

**@beep/testkit provides** (`tooling/testkit/`):
- `effect`, `scoped`, `live`, `scopedLive` - Effect-aware test runners
- `layer` - Share Layer between tests with memoization
- `flakyTest` - Retry unstable tests with Effect Schedule

**Playwright provides**:
- Browser automation and page interaction
- Visual regression snapshots
- Network interception and mocking
- Cross-browser compatibility testing

## Scope

### In Scope
- Playwright configuration for monorepo structure
- E2E test infrastructure for `@beep/web` (primary)
- Test patterns compatible with Effect-first architecture
- CI/CD integration with GitHub Actions
- Visual regression testing setup
- Development workflow tooling

### Out of Scope
- Component-level testing (handled by Vitest/Bun)
- API integration tests (separate infrastructure)
- Performance benchmarking (future enhancement)

---

## Current State

| Aspect | Status | Notes |
|--------|--------|-------|
| Playwright installed | Yes | `playwright@^1.57.0` in root `package.json` |
| E2E config | No | No `playwright.config.ts` exists |
| E2E tests | No | No `*.e2e.ts` files exist |
| CI integration | No | No Playwright workflow in `.github/` |
| Dev scripts | No | No e2e scripts in package.json |

---

## Target Architecture

```
beep-effect/
├── playwright.config.ts          # Root Playwright config
├── e2e/                          # Shared e2e utilities
│   ├── fixtures/                 # Custom test fixtures
│   │   ├── auth.fixture.ts       # Authenticated user fixture
│   │   └── base.fixture.ts       # Base test extensions
│   ├── pages/                    # Page Object Models
│   │   ├── dashboard.page.ts
│   │   ├── auth.page.ts
│   │   └── upload.page.ts
│   └── utils/                    # Test utilities
│       └── effect-helpers.ts     # Effect-aware test helpers
├── apps/
│   └── web/
│       └── e2e/                  # App-specific tests
│           ├── auth.e2e.ts
│           ├── dashboard.e2e.ts
│           └── upload.e2e.ts
└── .github/
    └── workflows/
        └── e2e.yml               # Playwright CI workflow
```

---

## Success Criteria

- [ ] `playwright.config.ts` configured for monorepo
- [ ] Base fixtures and POM patterns established
- [ ] At least 3 critical user flows covered
- [ ] `bun run e2e` runs all e2e tests
- [ ] `bun run e2e:ui` opens Playwright UI mode
- [ ] CI workflow runs on PR (parallelized)
- [ ] Test reports generated and accessible
- [ ] Visual regression baseline established

---

## Execution Phases

### Phase 1: Foundation
1. Create `playwright.config.ts` with monorepo-aware paths
2. Set up base fixtures extending Playwright's test
3. Create auth fixture for authenticated scenarios
4. Add npm scripts: `e2e`, `e2e:ui`, `e2e:headed`, `e2e:debug`

### Phase 2: Page Objects & Patterns
1. Create Page Object Model pattern (composition, not inheritance):
   ```typescript
   // e2e/pages/auth.page.ts
   export class AuthPage {
     constructor(private page: Page) {}
     readonly emailInput = () => this.page.getByLabel("Email");
     readonly passwordInput = () => this.page.getByLabel("Password");
     readonly submitButton = () => this.page.getByRole("button", { name: "Sign in" });
     async login(email: string, password: string) { /* ... */ }
     async assertLoggedIn() { /* ... */ }
   }
   ```
2. Implement POMs for auth, dashboard, upload flows
3. Add Effect-aware test utilities (`e2e/utils/effect-helpers.ts`):
   - `generateMockUsers(count: number)` - Uses `A.range` + mock factory
   - `assertOptionIsSome<A>(opt: Option<A>)` - Playwright-compatible Option assertion
   - `assertEitherIsRight<E, A>(either: Either<E, A>)` - Either assertion helper
   - `seedTestData(data: TestData)` - Effect.gen wrapper for DB seeding
4. Document testing patterns in `e2e/README.md`

### Phase 3: Test Implementation
1. Auth flow: login, logout, session persistence
2. Dashboard flow: navigation, settings, user profile
3. Upload flow: file selection, validation, progress

### Phase 4: CI/CD Integration
1. GitHub Actions workflow with Playwright sharding
2. Artifact collection (traces, screenshots, reports)
3. Visual regression with commit-based comparisons
4. Slack/Discord notification on failures (optional)

---

## Key Decisions

### Test Location Strategy
**Decision**: App-specific tests in `apps/*/e2e/`, shared utilities in root `e2e/`

**Rationale**:
- Keeps tests close to the apps they validate
- Shared fixtures prevent duplication
- Turbo can cache test results per app

### Authentication Strategy
**Decision**: Use Playwright's `storageState` for authenticated fixtures

**Rationale**:
- Avoids re-login for every test
- Matches production auth flow (better-auth cookies)
- Supports parallel test execution

### Browser Coverage
**Decision**: Chromium primary, Firefox and WebKit in CI only

**Rationale**:
- Chromium covers 70%+ users
- Full matrix in CI catches cross-browser issues
- Local dev speed prioritized

### Visual Regression Strategy
**Decision**: Use Playwright's built-in `expect(page).toHaveScreenshot()` with Git-stored baselines

**Rationale**:
- Built-in solution, no external service dependencies
- Baselines stored in `e2e/__screenshots__/` (gitignored: `*-actual.png`, `*-diff.png`)
- Committed: `*-expected.png` baseline images
- CI generates diffs, uploads as artifacts on failure
- Update baselines via `bun run e2e -- --update-snapshots`

---

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

### Root Scripts

Add to root `package.json`:

```json
{
  "scripts": {
    "e2e": "turbo run test:e2e",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed",
    "e2e:debug": "playwright test --debug",
    "e2e:report": "playwright show-report"
  }
}
```

---

## Verification Commands

```bash
# Type check after setup
bun run check

# Run e2e tests
bun run e2e

# Run with UI (development)
bun run e2e:ui

# Run specific test file
bun run e2e -- apps/web/e2e/auth.e2e.ts

# Generate report
bun run e2e:report
```

---

## Dependencies

### Required
- `playwright` (already installed)
- `@playwright/test` (test runner - may need explicit install)

### Optional
- `playwright-expect` (enhanced assertions)
- `allure-playwright` (rich reporting)

---

## Complexity Assessment

| Criterion | Value | Notes |
|-----------|-------|-------|
| Sessions required | 2-3 | Config + patterns, then tests + CI |
| Files affected | 10-20 | Config, fixtures, tests, workflows |
| Agents involved | 3-5 | codebase-researcher, test-writer, doc-writer, architecture-pattern-enforcer, code-reviewer |
| Cross-package impact | Low | Additive infrastructure |

**Complexity Level**: Medium

---

## Related Documentation

- [Playwright Documentation](https://playwright.dev)
- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md)
- [Effect Testing Patterns](../../documentation/EFFECT_PATTERNS.md)
- [Web App CLAUDE.md](../../apps/web/CLAUDE.md)
