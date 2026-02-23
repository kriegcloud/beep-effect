# Testing Infrastructure

## Current State
- Vitest is configured monorepo-wide via root `vitest.config.ts` and shared settings in `vitest.shared.ts`.
- Coverage is enabled (V8), but currently emits only HTML reports and has no explicit threshold gate.
- Root `test` script runs `vitest run && tstyche`.
- No Playwright/Cypress config exists.
- No visual regression workflow exists.
- No Storybook-based component testing setup exists.
- Current quality: `needs tuning`.

## Recommendations

### Vitest Coverage Hardening
- What: Add coverage thresholds and CI-friendly reporters (`text`, `lcov`, `json-summary`) in shared Vitest config.
- Why: HTML-only output is hard to enforce in CI; thresholds prevent silent quality erosion.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Immediate quality signal in CI, easier tooling integrations.
- Cons: Initial threshold setting requires baseline calibration.
- Conflicts with: None.
- Config snippet:
```ts
coverage: {
  provider: "v8",
  reporter: ["text", "lcov", "html", "json-summary"],
  thresholds: { lines: 80, branches: 70, functions: 80, statements: 80 }
}
```

### E2E Standardization on Playwright
- What: Add Playwright as the default E2E framework for browser and API-assisted end-to-end flows.
- Why: Strong cross-browser support, parallelization, tracing, and CI ergonomics fit this monorepo’s scale better than Cypress’s architecture for most teams.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Excellent diagnostics (`trace`, video, screenshots), mature CI support.
- Cons: Node-based test runner path (not Bun-native).
- Conflicts with: Cypress if both are used for overlapping E2E scope.
- Config snippet:
```ts
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
```

### Visual Regression Baseline (Playwright Snapshots)
- What: Start with Playwright screenshot snapshot tests for critical flows/components.
- Why: Fast path to visual regression protection before adopting hosted visual tooling.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: No additional vendor needed initially.
- Cons: Baseline image management and cross-platform stability tuning required.
- Conflicts with: None.
- Config snippet:
```ts
await expect(page.locator("[data-testid='portfolio-summary']")).toHaveScreenshot();
```

### Contract Testing for Effect Platform APIs (Pact)
- What: Add Pact for consumer/provider contract tests around service boundaries.
- Why: Vertical-slice + contract-kit architecture benefits from explicit API contract verification across teams.
- Type: New tool
- Maturity: Stable
- Effort: High (4hr+)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Strong API evolution safety across services and clients.
- Cons: Requires pact lifecycle discipline (provider verification in CI).
- Conflicts with: None.
- Config snippet:
```ts
import { Pact } from "@pact-foundation/pact";
const provider = new Pact({ consumer: "web", provider: "api" });
```

### Mutation Testing (Stryker + Vitest Runner)
- What: Add Stryker with Vitest runner for mutation score tracking on critical domain packages.
- Why: Finds assertion weakness that normal coverage misses.
- Type: New tool
- Maturity: Stable
- Effort: High (4hr+)
- Priority: P2 (nice to have)
- Bun compatible: Partial
- Pros: Deep test quality signal.
- Cons: Slower pipeline; best scoped to core packages.
- Conflicts with: None.
- Config snippet:
```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "vitest",
  "mutate": ["packages/common/{data,identity,schema}/src/**/*.ts"]
}
```

### Component Testing Integration Path
- What: Add component-level tests via Storybook test runner or Vitest browser mode once Storybook is in place.
- Why: Frontend stack (React 19 + MUI + shadcn + Tailwind) benefits from component contract tests between unit and E2E layers.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Partial
- Pros: Better UI confidence with less E2E brittleness.
- Cons: Requires Storybook setup and maintenance.
- Conflicts with: None.
- Config snippet:
```json
{
  "scripts": {
    "test:ui": "storybook test --url http://127.0.0.1:6006"
  }
}
```

## Head-to-Head Notes
- Playwright vs Cypress (2025/2026):
  - Playwright leads on cross-browser parity, traces, and scalable parallel CI execution.
  - Cypress remains strong for in-browser DX, but mixed-browser parity and infra flexibility are usually weaker for monorepo-scale pipelines.
- Visual regression:
  - Playwright snapshots: best self-hosted starting point.
  - Chromatic/Percy: better managed review UX once Storybook is adopted.
