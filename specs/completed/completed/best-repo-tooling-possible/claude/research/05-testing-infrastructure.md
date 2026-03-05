# Testing Infrastructure

## Current State in This Repo

| Aspect | Status | Details |
|--------|--------|---------|
| Unit test runner | Vitest 4.0.18 | Root `vitest.config.ts` uses `projects` array (correct for Vitest 3.2+/4.x) |
| Effect integration | `@effect/vitest` 4.0.0-beta.11 | `it.effect()`, `layer()`, `addEqualityTesters()` in setup |
| Type testing | tstyche 6.2.0 | `.tst.ts` files in `tooling/*/dtslint/` |
| Coverage provider | `@vitest/coverage-v8` 4.0.18 | HTML reporter only, **no thresholds configured** |
| Shared config | `vitest.shared.ts` | Centralized: esbuild target, vite-tsconfig-paths, v8 coverage, concurrent by default |
| Per-package configs | `mergeConfig(shared, ...)` | Correct pattern; cli sets `concurrent: false` |
| E2E testing | **None** | No Playwright, no Cypress |
| Visual regression | **None** | No screenshots, no comparison |
| Component testing | **None** | No Storybook, no Vitest browser mode |
| Contract testing | **None** | No Pact, no schema-driven contracts |
| Mutation testing | **None** | No Stryker |
| Property-based testing | **None** | No fast-check, despite Effect Schema's built-in `Arbitrary.make` |
| Benchmarking | **None** | No `vitest bench`, no CodSpeed |
| Test perf profiling | **None** | No reporters beyond default |
| CI test gate | **None** | No `check.yml` -- only `release.yml` exists |
| Turbo test task | **Missing** | Tests bypass Turborepo caching entirely |

### Existing Test Patterns

Tests use `@effect/vitest` with `it.effect()`, `withTestLayers()` helper, `Layer.mergeAll` + `Layer.provideMerge`, `TestConsole`, `Layer.mock()`, `Command.runWith()`, and `Effect.fn`. The CLI tests (e.g., `topo-sort.test.ts`) are well-structured examples of Effect-idiomatic testing.

---

## Recommendations

---

### 1. Coverage Thresholds

- **What**: Configure minimum coverage percentages (lines, branches, functions, statements) in root vitest config
- **Why**: The repo has zero coverage enforcement. PRs can merge with 0% coverage. The audit explicitly flags "No coverage thresholds configured" as a gap.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Prevents coverage regression on every PR
  - Per-glob overrides for different strictness (e.g., `src/utils/**` vs `src/internal/**`)
  - Vitest 4.x supports `thresholds.autoUpdate` to ratchet thresholds up as coverage improves
  - Negative thresholds allow "max N uncovered lines" for flexibility
- **Cons**:
  - Must define thresholds in root config only (not per-package) for monorepo projects mode
  - Initial threshold must match current state, then ratchet up
- **Conflicts with**: None
- **Config snippet**:
```ts
// vitest.shared.ts — add to the coverage block
coverage: {
  provider: "v8",
  reporter: ["html", "json-summary", "text"],
  reportsDirectory: "coverage",
  thresholds: {
    lines: 50,
    branches: 40,
    functions: 50,
    statements: 50,
    autoUpdate: true,
    // Stricter for core utils
    "tooling/*/src/**/*.ts": {
      lines: 70,
      branches: 60,
      functions: 70,
    },
  },
  exclude: [
    "node_modules/",
    "dist/",
    "benchmark/",
    "bundle/",
    "dtslint/",
    "build/",
    "coverage/",
    "test/utils/",
    "**/*.d.ts",
    "**/*.config.*",
    "**/vitest.setup.*",
    "**/vitest.shared.*",
  ],
},
```

---

### 2. Vitest Projects Config Audit & Optimization

- **What**: Optimize the root vitest.config.ts projects config, add performance tuning, and add missing reporters
- **Why**: The current config is minimal. Vitest 3.2+ deprecated `workspace` in favor of `projects` (which the repo already uses -- good). But the config lacks reporters for CI, test isolation settings, and pooling configuration.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - `json` reporter enables CI coverage report actions
  - `hanging-process` reporter catches leaked handles
  - `pool: "forks"` gives better isolation than `pool: "threads"` for Effect (fiber cleanup)
  - `typecheck.enabled` can replace separate `tsc --noEmit` step
- **Cons**:
  - `pool: "forks"` is slightly slower than `pool: "threads"` but more reliable with Effect fibers
- **Conflicts with**: None
- **Config snippet**:
```ts
// vitest.config.ts (root)
import { defineConfig } from "vitest/config";

const isBun = process.versions.bun !== undefined;

export default defineConfig({
  test: {
    projects: [
      "packages/*/vitest.config.ts",
      "packages/*/*/vitest.config.ts",
      "tooling/*/vitest.config.ts",
      "apps/*/vitest.config.ts",
      ...(isBun ? [] : []),
    ],
    reporters: process.env.CI
      ? ["default", "json", "hanging-process"]
      : ["default"],
    outputFile: process.env.CI ? { json: "test-results.json" } : undefined,
  },
});
```

---

### 3. Turbo Test Task

- **What**: Add a `test` task to `turbo.json` so tests benefit from Turborepo caching
- **Why**: The audit flags "No test task defined" in Turborepo. Tests currently bypass caching entirely -- every `vitest run` re-runs all tests regardless of what changed.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Cache-hit skips tests for unchanged packages
  - Can depend on `^build` to ensure deps are built first
  - Integrates with remote caching when configured
- **Cons**:
  - Each package needs its own `test` script (or turbo skips it)
  - Must set `cache: false` for integration tests that depend on external state
- **Conflicts with**: None
- **Config snippet**:
```jsonc
// turbo.json — add to tasks
{
  "test": {
    "dependsOn": ["^build"],
    "inputs": ["src/**", "test/**", "vitest.config.ts"],
    "outputs": ["coverage/**"],
    "cache": true
  }
}
```

---

### 4. Playwright E2E Testing

- **What**: End-to-end testing framework for the Next.js 16 web app and integration testing across services
- **Why**: The repo has zero E2E testing. The `apps/web` Next.js 16 app (canary 58, App Router, Turbopack) has no automated browser testing. Playwright is the official recommendation in Next.js 16 docs (updated Feb 2026).
- **Type**: New tool
- **Maturity**: Stable
- **Effort**: Medium (1-4hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Partial -- Playwright requires Node.js for browser launching. Tests run with `npx playwright test` (Node), not `bun test`. Bun cannot launch browser processes reliably due to IPC/subprocess incompatibilities. Use Node for Playwright, Bun for vitest unit tests.
- **Pros**:
  - Cross-browser: Chrome, Firefox, Safari (WebKit) -- Cypress lacks WebKit
  - Native parallelization across workers (no external orchestrator)
  - First-party Next.js 16 support (official docs cover App Router, Server Components, Server Actions)
  - Built-in auto-waiting, tracing, screenshot-on-failure
  - Code generation via `codegen` recorder
  - 2x faster than Cypress in benchmarks, lower memory/CPU usage
  - Vitest 4.0 can generate Playwright traces in browser mode tests
  - Playwright CT supports Storybook portable stories
- **Cons**:
  - Cannot run under Bun runtime (needs Node)
  - Separate config/toolchain from Vitest
  - Browser downloads add CI time (mitigated by caching)
  - No time-travel debugger like Cypress (use `page.pause()` + trace viewer)
- **Conflicts with**: None (complementary to Vitest)
- **Config snippet**:
```ts
// playwright.config.ts (root)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "apps/web/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "bun run --cwd apps/web dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### 5. Property-Based Testing with fast-check + Effect Schema Arbitraries

- **What**: Property-based testing using `fast-check` with Effect Schema's built-in `Arbitrary.make()` to generate valid test data from schemas
- **Why**: The repo has schemas in `@beep/schema` and domain types throughout `tooling/repo-utils`. Effect v4 has first-class `Arbitrary.make(schema)` that generates valid random data conforming to schema constraints. This catches edge cases unit tests miss (unicode, empty strings, boundary values). The MEMORY.md already mentions `toArbitrary` annotations.
- **Type**: New tool
- **Maturity**: Stable (fast-check is mature; Effect `Arbitrary` is built-in since v3)
- **Effort**: Medium (1-4hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - Zero-config schema integration: `Arbitrary.make(PackageJsonSchema)` generates valid package.json objects
  - Catches edge cases humans never write (unicode names, deeply nested deps, empty arrays)
  - `@fast-check/vitest` provides `it.prop()` for seamless Vitest integration
  - Shrinking: when a test fails, fast-check minimizes the input to the smallest failing case
  - Reproducible: seeds make failures deterministic
  - Custom arbitraries via schema `arbitrary` annotation (already in MEMORY.md conventions)
  - Effect v4 exports `FastCheck` namespace directly -- no separate fast-check install needed for schema arbitraries
- **Cons**:
  - Slow for complex schemas (mitigate with `numRuns` limit)
  - Requires thinking in properties (invariants) not examples
  - Some schemas may need custom `arbitrary` annotations for realistic data
- **Conflicts with**: None
- **Config snippet**:
```ts
// test/PackageJson.prop.test.ts
import { describe, expect } from "@effect/vitest";
import { it } from "@fast-check/vitest";
import { Arbitrary, FastCheck } from "effect";
import * as S from "effect/Schema";
import { PackageJson } from "@beep/repo-utils/schemas/PackageJson";

const packageJsonArb = Arbitrary.make(PackageJson);

describe("PackageJson schema properties", () => {
  it.prop([packageJsonArb])("roundtrips through encode/decode", ([pj]) => {
    const encoded = S.encodeSync(PackageJson)(pj);
    const decoded = S.decodeUnknownSync(PackageJson)(encoded);
    expect(decoded).toEqual(pj);
  });

  it.prop([packageJsonArb])("name is always a non-empty string", ([pj]) => {
    expect(pj.name.length).toBeGreaterThan(0);
  });
});
```

---

### 6. Vitest Browser Mode + Visual Regression Testing

- **What**: Vitest 4.0's stable browser mode with built-in `toMatchScreenshot()` for visual regression testing
- **Why**: No visual regression testing exists. Vitest 4.0 (which the repo already uses at 4.0.18) ships stable browser mode with visual regression support via `@vitest/browser-playwright`. This avoids adding a separate tool (Percy/Chromatic) and keeps everything in Vitest.
- **Type**: New tool (but leveraging existing Vitest version)
- **Maturity**: Growing (browser mode just stabilized in Vitest 4.0, Oct 2025)
- **Effort**: Medium (1-4hr)
- **Priority**: P2 (nice to have) -- only relevant once `apps/web` has components worth testing
- **Bun compatible**: Partial -- browser mode uses Playwright under the hood, which requires Node
- **Pros**:
  - No additional SaaS dependency (Percy/Chromatic cost money beyond free tier)
  - Same test runner as unit tests -- one `vitest` command
  - Playwright traces integration for debugging failures
  - `toMatchScreenshot()` assertion is simple and built-in
  - Keeps baselines in-repo (no cloud dependency)
  - Free and open source
- **Cons**:
  - OS-dependent baselines (Mac screenshots differ from Linux CI) -- must normalize
  - No cloud-based review UI (unlike Chromatic's visual diff reviewer)
  - Newer feature, less battle-tested than Percy/Chromatic
  - No AI-powered noise filtering (Percy has this)
- **Conflicts with**: Percy, Chromatic (choose one approach)
- **Config snippet**:
```ts
// apps/web/vitest.browser.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
      trace: "on-first-retry",
    },
    include: ["test/visual/**/*.test.tsx"],
  },
});

// test/visual/home.test.tsx
import { page } from "@vitest/browser/context";
import { expect, test } from "vitest";

test("home page matches screenshot", async () => {
  await page.goto("/");
  await expect(page).toMatchScreenshot({ name: "home-page" });
});
```

---

### 7. Lost Pixel (Alternative Visual Regression)

- **What**: Open-source visual regression testing tool with optional SaaS platform, supporting Storybook, page mode, and Playwright/Cypress custom mode
- **Why**: If Vitest browser mode's visual regression is too new or the team wants a cloud review UI, Lost Pixel is the best free/open-source alternative. It has native monorepo support (Turborepo examples in their docs) and holistic testing (components + pages + E2E screenshots).
- **Type**: New tool
- **Maturity**: Growing
- **Effort**: Medium (1-4hr)
- **Priority**: P2 (nice to have)
- **Bun compatible**: Yes (runs as a CLI tool, runtime-agnostic)
- **Pros**:
  - Open-source core (free self-hosted)
  - Platform has free tier with cloud baseline management
  - Native monorepo support with Turborepo integration
  - Supports Storybook, direct page screenshots, and piping from Playwright
  - GitHub Actions integration with visual diff PR comments
- **Cons**:
  - Smaller community than Percy/Chromatic
  - Platform (cloud review UI) has limited free tier for larger teams
  - Another tool in the chain (vs Vitest built-in)
- **Conflicts with**: Vitest browser mode visual regression, Percy, Chromatic
- **Config snippet**:
```js
// lostpixel.config.ts
import { CustomProjectConfig } from "lost-pixel";

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: "/", name: "home" },
      { path: "/dashboard", name: "dashboard" },
    ],
    baseUrl: "http://localhost:3000",
  },
  generateOnly: true,
  failOnDifference: true,
};
```

---

### 8. Stryker Mutation Testing

- **What**: Mutation testing framework that modifies your source code (mutants) and checks if tests catch the changes, measuring test quality beyond coverage
- **Why**: Coverage thresholds tell you what code is executed but not whether tests actually verify behavior. A test that runs code without asserting is "covered" but useless. Stryker's Vitest runner uses per-test coverage analysis for speed, and incremental mode only re-tests changed code.
- **Type**: New tool
- **Maturity**: Stable (Stryker 7.0+ has first-class Vitest runner)
- **Effort**: Medium (1-4hr)
- **Priority**: P2 (nice to have) -- run on critical packages only, not monorepo-wide
- **Bun compatible**: Partial -- Stryker uses Node internally, but the Vitest runner manages test execution
- **Pros**:
  - Exposes weak tests that pass without real assertions
  - Incremental mode: only mutates changed files (CI-friendly)
  - Per-test coverage analysis: runs only relevant tests per mutant
  - TypeScript checker prevents type-invalid mutants
  - Sentry reduced mutation testing from 60min to 25min switching Jest to Vitest runner
  - Can target specific packages: `mutate: ["tooling/repo-utils/src/**/*.ts"]`
- **Cons**:
  - Computationally expensive -- even incremental, 10x slower than regular tests
  - Not suitable for all packages (skip generated code, config files)
  - Requires understanding mutation score metrics
  - Stryker browser mode not supported
  - Effect generators (`function*`) may produce many equivalent mutants (noise)
- **Conflicts with**: None (complementary to coverage)
- **Config snippet**:
```jsonc
// stryker.config.json (per-package or root)
{
  "$schema": "https://raw.githubusercontent.com/stryker-mutator/stryker-js/master/packages/core/schema/stryker-schema.json",
  "testRunner": "vitest",
  "vitest": {
    "configFile": "vitest.config.ts",
    "dir": ".",
    "related": true
  },
  "checkers": ["typescript"],
  "tsconfigFile": "tsconfig.json",
  "incremental": true,
  "incrementalFile": ".stryker-cache/incremental.json",
  "mutate": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ],
  "reporters": ["html", "clear-text", "progress"],
  "concurrency": 4
}
```

---

### 9. Contract Testing with Pact

- **What**: Consumer-driven contract testing for HTTP APIs using Pact
- **Why**: If `apps/web` or other services consume Effect Platform HTTP APIs, contracts ensure API changes don't break consumers. Effect Platform's `HttpServer` and `HttpClient` create natural provider/consumer boundaries.
- **Type**: New tool
- **Maturity**: Stable (Pact 4.0 with TypeScript support, active development)
- **Effort**: High (4hr+) -- requires understanding CDC patterns, setting up broker
- **Priority**: P2 (nice to have) -- becomes P1 when multiple services exist
- **Bun compatible**: Partial -- Pact uses native bindings (Rust FFI), works with Node; Bun compatibility is untested
- **Pros**:
  - Catches breaking API changes before deployment
  - Consumer-driven: API evolves based on actual usage
  - Pact Broker provides contract versioning and compatibility matrix
  - Can-I-Deploy check gates deployments
  - Pact 4.0 adds GraphQL and async messaging support
- **Cons**:
  - High ceremony: requires broker setup, publish/verify workflow
  - No native Effect Platform integration (must bridge to HTTP)
  - Pact Broker is either self-hosted or paid (PactFlow)
  - Overkill for a single-app monorepo -- value increases with multiple consumers
  - No specific Vitest integration docs (works but undocumented)
- **Conflicts with**: None
- **Config snippet**:
```ts
// test/contracts/api.consumer.test.ts
import { PactV4 } from "@pact-foundation/pact";

const provider = new PactV4({
  consumer: "WebApp",
  provider: "ApiServer",
  dir: "./pacts",
});

describe("API contract", () => {
  it("returns user profile", async () => {
    await provider
      .addInteraction()
      .given("user exists")
      .uponReceiving("a request for user profile")
      .withRequest("GET", "/api/user/1")
      .willRespondWith(200, (_builder) => {
        _builder.jsonBody({ id: 1, name: "Test User" });
      })
      .executeTest(async (mockserver) => {
        const response = await fetch(`${mockserver.url}/api/user/1`);
        expect(response.status).toBe(200);
      });
  });
});
```

---

### 10. Effect-Native Contract Testing (Alternative to Pact)

- **What**: Use Effect Schema as the contract definition, with `Schema.decodeUnknown` as the contract verifier, eliminating the need for Pact
- **Why**: Effect's Schema system already defines the shape of API requests/responses. Using Schema as the contract source-of-truth means contracts are always in sync with implementation. No separate contract language or broker needed.
- **Type**: New tool (pattern, not a package)
- **Maturity**: Bleeding-edge (community pattern, not a formal tool)
- **Effort**: Medium (1-4hr)
- **Priority**: P1 (high value) -- leverages existing Effect infrastructure
- **Bun compatible**: Yes
- **Pros**:
  - Zero new dependencies -- schemas ARE the contracts
  - Compile-time safety: TypeScript catches schema mismatches
  - Runtime validation: `Schema.decodeUnknown` verifies actual API responses
  - Integrates with property-based testing: `Arbitrary.make(ResponseSchema)` generates valid responses
  - No broker, no separate contract files, no CDC ceremony
- **Cons**:
  - Only works within the Effect ecosystem (not cross-language)
  - No formal "can I deploy" gate (must build custom)
  - Less mature than Pact's decade of tooling
  - No built-in compatibility matrix
- **Conflicts with**: Pact (choose one approach)
- **Config snippet**:
```ts
// test/contracts/api.schema-contract.test.ts
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { UserProfile } from "@beep/schema/UserProfile";

describe("API schema contracts", () => {
  it.effect("server response matches UserProfile schema", () =>
    Effect.gen(function* () {
      const response = yield* Effect.tryPromise(() =>
        fetch("http://localhost:3000/api/user/1").then((r) => r.json())
      );
      const decoded = yield* S.decodeUnknown(UserProfile)(response);
      expect(decoded.id).toBeDefined();
    })
  );
});
```

---

### 11. CodSpeed Benchmark Regression Tracking

- **What**: CI-integrated performance regression detection for `vitest bench` benchmarks using CodSpeed's CPU simulation
- **Why**: No benchmarking exists. For `tooling/repo-utils` (graph operations, dependency resolution, workspace scanning) and `tooling/codebase-search` (indexing, search), performance regressions are real risks. CodSpeed provides <1% variance via CPU simulation and automatic PR comments.
- **Type**: New tool
- **Maturity**: Growing
- **Effort**: Medium (1-4hr)
- **Priority**: P2 (nice to have) -- becomes P1 when performance-sensitive code grows
- **Bun compatible**: Yes (CodSpeed vitest plugin works with vitest bench)
- **Pros**:
  - <1% measurement variance regardless of CI machine load
  - Automatic PR comments with flame graphs and regression detection
  - Sharded benchmarks for parallel CI execution
  - Per-benchmark custom thresholds
  - Free tier for open-source projects
  - Requires only `vitest >= 3.2` (repo has 4.0.18)
- **Cons**:
  - SaaS dependency (free tier limits unknown for private repos)
  - Only compatible with vitest 3.2+ (fine for this repo)
  - Must write benchmarks first (chicken-and-egg)
  - CPU simulation may not reflect real-world Bun performance
- **Conflicts with**: None
- **Config snippet**:
```ts
// bench/graph.bench.ts
import { bench, describe } from "vitest";
import { Graph } from "effect/Graph";

describe("Graph operations", () => {
  bench("topological sort of 100 nodes", () => {
    // ... benchmark code
  });

  bench("cycle detection in dense graph", () => {
    // ... benchmark code
  });
});

// vitest.config.ts (add benchmark config)
// benchmark: {
//   include: ["bench/**/*.bench.ts"],
//   reporters: ["default"],
// },
```

---

### 12. Vitest Performance Profiling & Reporters

- **What**: Configure verbose/json reporters, `--reporter=hanging-process` to catch test leaks, and `--logHeapUsage` for memory profiling
- **Why**: No test performance visibility exists. Slow tests in the monorepo are invisible. The `hanging-process` reporter catches Effect fiber leaks that prevent clean exits.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - `hanging-process` reporter detects fiber/handle leaks (critical for Effect tests)
  - `json` reporter enables CI reporting actions (`vitest-coverage-report-action`)
  - `--logHeapUsage` flag shows per-test memory allocation
  - `vitest --reporter=verbose` shows individual test durations
  - Profile slow tests with `VITEST_PROF=1 vitest run` (generates V8 CPU profiles)
- **Cons**:
  - `hanging-process` can produce false positives with long-running Effect scoped resources
  - Verbose reporter is noisy for large test suites
- **Conflicts with**: None
- **Config snippet**:
```ts
// vitest.shared.ts — add to test block
test: {
  // ...existing config...
  reporters: process.env.CI
    ? ["default", "json", "hanging-process"]
    : ["default"],
  outputFile: process.env.CI
    ? { json: "test-results.json" }
    : undefined,
  logHeapUsage: !!process.env.CI,
},
```

---

### 13. @effect/vitest Layer Patterns Enhancement

- **What**: Establish standardized test layer patterns using `@effect/vitest`'s `layer()` and fresh-layer-per-test helpers
- **Why**: Current tests manually build `TestLayers` and wrap with `withTestLayers`. The `layer()` function from `@effect/vitest` handles this more cleanly and ensures proper scoped resource cleanup. Fresh layers per test prevent shared-state bugs.
- **Type**: Config upgrade (pattern standardization)
- **Maturity**: Stable
- **Effort**: Medium (1-4hr) -- refactor existing tests
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - `layer()` auto-wraps all `it.effect()` calls in a describe block with the provided layer
  - Scoped resources are properly acquired/released per test
  - Eliminates boilerplate `withTestLayers` wrappers
  - `it.scoped()` handles resources that need per-test lifecycle
  - Better error messages via fiber failure reporting
- **Cons**:
  - Requires refactoring existing tests
  - `layer()` shares the layer across tests by default (use `it.scoped()` for isolation)
- **Conflicts with**: None (replaces ad-hoc patterns)
- **Config snippet**:
```ts
// Recommended pattern using @effect/vitest layer()
import { layer } from "@effect/vitest";
import * as Layer from "effect/Layer";

const TestLayer = FsUtilsLive.pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      NodeFileSystem.layer,
      NodePath.layer,
      TestConsole.layer,
      Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({}),
    )
  )
);

layer(TestLayer)("topo-sort command", (it) => {
  it.effect("outputs packages in dependency order", () =>
    Effect.gen(function* () {
      yield* run([]);
      const logs = yield* TestConsole.logLines;
      expect(logs.map(String)).toContain("@beep/repo-utils");
    })
  );
});
```

---

### 14. Playwright Component Testing for Next.js Components

- **What**: Test React components in isolation using Playwright CT with portable Storybook stories
- **Why**: No component testing exists. The `apps/web` Next.js app uses React 19.2 with Base UI and Tailwind. Playwright CT can mount components in a real browser, testing interactions and accessibility without a full Next.js server.
- **Type**: New tool
- **Maturity**: Growing (Playwright CT stable; Storybook portable stories added in 8.1)
- **Effort**: High (4hr+) -- requires component test infrastructure setup
- **Priority**: P2 (nice to have) -- blocked until components exist worth testing
- **Bun compatible**: No -- requires Node (Playwright)
- **Pros**:
  - Real browser rendering (not JSDOM)
  - Storybook 8.1+ portable stories work with Playwright CT
  - Tests component interactions (clicks, forms, keyboard) in actual DOM
  - Can combine with visual regression (screenshot assertions)
  - VSCode extension with test generator and trace viewer
- **Cons**:
  - Requires Node runtime (not Bun)
  - Separate from Vitest unit test pipeline
  - More setup than Vitest browser mode
  - Next.js Server Components cannot be tested this way (need E2E)
- **Conflicts with**: Vitest browser mode component testing (overlapping capabilities)
- **Config snippet**:
```ts
// playwright-ct.config.ts
import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
  testDir: "apps/web/test/components",
  use: {
    ...devices["Desktop Chrome"],
  },
});

// apps/web/test/components/Button.test.tsx
import { test, expect } from "@playwright/experimental-ct-react";
import { Button } from "../../src/components/Button";

test("Button renders and responds to click", async ({ mount }) => {
  let clicked = false;
  const component = await mount(
    <Button onClick={() => { clicked = true; }}>Click me</Button>
  );
  await component.click();
  expect(clicked).toBe(true);
});
```

---

### 15. Vitest Browser Mode Component Testing (Alternative)

- **What**: Use Vitest 4.0's stable browser mode with `@vitest/browser-playwright` for component testing within the existing Vitest pipeline
- **Why**: Alternative to Playwright CT that keeps everything in Vitest. Since the repo already uses Vitest 4.0.18, browser mode is available without adding a new test runner. Components render in a real browser (not JSDOM).
- **Type**: New tool (leveraging existing Vitest)
- **Maturity**: Growing (stabilized in Vitest 4.0, Oct 2025)
- **Effort**: Medium (1-4hr)
- **Priority**: P2 (nice to have)
- **Bun compatible**: Partial -- uses Playwright under the hood
- **Pros**:
  - Same test runner as unit tests -- unified `vitest` command
  - `toMatchScreenshot()` for visual regression in component tests
  - Playwright trace generation for debugging
  - Simpler setup than separate Playwright CT config
  - Component testing docs in official Vitest 4.0
- **Cons**:
  - Newer than Playwright CT (less community examples)
  - Requires `@vitest/browser-playwright` package
  - Browser startup adds test latency
- **Conflicts with**: Playwright CT (choose one)
- **Config snippet**:
```ts
// apps/web/vitest.browser.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
    include: ["test/components/**/*.test.tsx"],
  },
});
```

---

### 16. CI Coverage Reporting via GitHub Actions

- **What**: `vitest-coverage-report-action` posts coverage summary as a PR comment with diff tracking
- **Why**: No CI quality gates exist. Even after adding coverage thresholds, there's no PR-level visibility. This action parses `json-summary` reporter output and posts a table showing coverage changes per PR.
- **Type**: New tool
- **Maturity**: Stable
- **Effort**: Low (< 1hr) -- requires CI workflow (blocked by missing `check.yml`)
- **Priority**: P1 (high value) -- coupled with creating the missing CI workflow
- **Bun compatible**: Yes (GitHub Action, runtime-independent)
- **Pros**:
  - PR comment with per-file coverage changes
  - Threshold enforcement blocks merges
  - Works with Vitest's `json-summary` reporter
  - Free and open source
- **Cons**:
  - Requires `check.yml` CI workflow (which doesn't exist yet)
  - Monorepo coverage aggregation can be tricky
- **Conflicts with**: None
- **Config snippet**:
```yaml
# .github/workflows/check.yml (partial)
- name: Run tests with coverage
  run: npx vitest run --coverage

- name: Coverage Report
  uses: davelosert/vitest-coverage-report-action@v2
  with:
    json-summary-path: coverage/coverage-summary.json
    json-final-path: coverage/coverage-final.json
```

---

## Summary: Implementation Priority

### Phase 1 -- Immediate (P0, < 2hr total)

| # | Recommendation | Effort |
|---|---------------|--------|
| 1 | Coverage thresholds in `vitest.shared.ts` | 30min |
| 2 | Vitest projects config + reporters | 30min |
| 3 | Turbo `test` task in `turbo.json` | 15min |

### Phase 2 -- High Value (P1, 4-8hr total)

| # | Recommendation | Effort |
|---|---------------|--------|
| 4 | Playwright E2E for `apps/web` | 2-4hr |
| 5 | Property-based testing with fast-check + Schema Arbitrary | 2hr |
| 12 | Vitest performance profiling (reporters, hanging-process) | 30min |
| 13 | @effect/vitest layer pattern standardization | 2hr |
| 16 | CI coverage reporting (requires `check.yml`) | 1hr |
| 10 | Effect-native schema contract testing pattern | 1hr |

### Phase 3 -- Nice to Have (P2, as needed)

| # | Recommendation | Effort |
|---|---------------|--------|
| 6 | Vitest browser mode + visual regression | 2hr |
| 7 | Lost Pixel (alternative to #6) | 2hr |
| 8 | Stryker mutation testing | 2-4hr |
| 9 | Pact contract testing (when multi-service) | 4hr+ |
| 11 | CodSpeed benchmark regression tracking | 2hr |
| 14 | Playwright CT for components | 4hr+ |
| 15 | Vitest browser mode component testing (alternative to #14) | 2hr |

---

## Decision Matrix: Key Either/Or Choices

| Decision | Option A | Option B | Recommendation |
|----------|----------|----------|----------------|
| E2E framework | Playwright | Cypress | **Playwright** -- faster, cross-browser, Next.js 16 official support |
| Visual regression | Vitest built-in `toMatchScreenshot` | Lost Pixel / Percy / Chromatic | **Vitest built-in** (already on 4.0.18) then Lost Pixel if review UI needed |
| Component testing | Vitest browser mode | Playwright CT | **Vitest browser mode** -- unified toolchain, same runner |
| Contract testing | Pact | Effect Schema-native | **Schema-native** -- zero new deps, fits Effect paradigm |
| Benchmarking | `vitest bench` standalone | CodSpeed + `vitest bench` | **CodSpeed** when ready -- same benchmarks, adds CI regression detection |

---

## Research Sources

- [Playwright vs Cypress 2026 Enterprise Guide](https://devin-rosario.medium.com/playwright-vs-cypress-the-2026-enterprise-testing-guide-ade8b56d3478)
- [Cypress vs Playwright: 500 E2E Tests Comparison](https://medium.com/lets-code-future/cypress-vs-playwright-i-ran-500-e2e-tests-in-both-heres-what-broke-2afc448470ee)
- [Vitest 4.0 Release Blog](https://vitest.dev/blog/vitest-4)
- [Vitest 4.0 Browser Mode and Visual Regression (InfoQ)](https://www.infoq.com/news/2025/12/vitest-4-browser-mode/)
- [Vitest Test Projects Guide](https://vitest.dev/guide/projects)
- [Vitest Coverage Config](https://vitest.dev/config/coverage)
- [Vitest 3 Monorepo Setup (Candid Startup)](https://www.thecandidstartup.org/2025/09/08/vitest-3-monorepo-setup.html)
- [Vitest Profiling Test Performance](https://vitest.dev/guide/profiling-test-performance)
- [Vitest Coverage Report Action](https://github.com/davelosert/vitest-coverage-report-action)
- [Lost Pixel Monorepo Visual Regression](https://www.lost-pixel.com/blog/monorepo-visual-regression-testing)
- [Lost Pixel GitHub](https://github.com/lost-pixel/lost-pixel)
- [Visual Regression Testing Tools 2026](https://bug0.com/knowledge-base/visual-regression-testing-tools)
- [Stryker Vitest Runner Docs](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [Stryker TypeScript Checker](https://stryker-mutator.io/docs/stryker-js/typescript-checker/)
- [Sentry JS Mutation Testing](https://sentry.engineering/blog/js-mutation-testing-our-sdks)
- [CodSpeed Vitest Bench CI Integration](https://codspeed.io/blog/vitest-bench-performance-regressions)
- [CodSpeed Sharded Benchmarks](https://codspeed.io/changelog/2025-02-28-faster-workflows-with-sharded-benchmarks)
- [Effect Schema Arbitrary Documentation](https://effect.website/docs/schema/arbitrary/)
- [fast-check GitHub](https://github.com/dubzzz/fast-check)
- [@fast-check/vitest npm](https://www.npmjs.com/package/@fast-check/vitest)
- [fast-check Vitest Blog Post](https://fast-check.dev/blog/2025/03/28/beyond-flaky-tests-bringing-controlled-randomness-to-vitest/)
- [Pact-JS GitHub](https://github.com/pact-foundation/pact-js)
- [Contract Testing Tools 2026](https://www.testsprite.com/use-cases/en/the-best-contract-testing-tools)
- [Playwright Bun Compatibility Issue](https://github.com/microsoft/playwright/issues/27139)
- [Bun Playwright Guide (BrowserStack)](https://www.browserstack.com/guide/bun-playwright)
- [Next.js Playwright Testing Docs](https://nextjs.org/docs/pages/guides/testing/playwright)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Storybook Portable Stories for Playwright CT](https://storybook.js.org/blog/portable-stories-for-playwright-ct/)
- [Storybook Interaction Tests Docs](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [@effect/vitest Fresh Layers Discussion](https://github.com/Effect-TS/effect/issues/4616)
- [Effect Solutions Testing Guide](https://www.effect.solutions/testing)
- [Vitest 3.2 Release (workspace deprecation)](https://vitest.dev/blog/vitest-3-2.html)
