# Effect Patterns Research

Phase 1 Discovery output documenting the `@beep/testkit/playwright` module and Effect patterns for browser automation migration.

**Generated**: 2026-01-22
**Agent Used**: codebase-researcher (effect patterns research)

---

## Executive Summary

The `@beep/testkit/playwright` module provides a complete Effect-based wrapper around Playwright, transforming imperative browser automation into declarative, type-safe Effect programs. Key features include:

- **Context.Tag services** for browser, page, and locator injection
- **Automatic resource management** via Effect's Scope system
- **Stream-based event handling** for dialogs, requests, responses
- **Integration with `@beep/testkit`** assertion helpers

The recommended test pattern uses `PlaywrightEnvironment.layer()` with `withBrowser` decorator for scoped browser lifecycle management.

---

## Module Architecture

### Service Hierarchy

```
Playwright (top-level launcher)
    │
    ├── launchScoped(chromium) → PlaywrightBrowser
    │                                  │
    │                                  ├── newPage() → PlaywrightPage
    │                                  │                    │
    │                                  │                    └── locator() → PlaywrightLocator
    │                                  │
    │                                  └── newContext() → PlaywrightBrowserContext
    │
    └── PlaywrightEnvironment (test convenience layer)
```

### Context.Tag Services

| Tag Class | Tag Identifier | Service Type | Purpose |
|-----------|----------------|--------------|---------|
| `Playwright` | `effect-playwright/index/Playwright` | `PlaywrightService` | Top-level launcher for browsers |
| `PlaywrightBrowser` | `cehs/backend/lib/playwright/PlaywrightBrowser` | Browser operations | Manage browser instances and pages |
| `PlaywrightPage` | `effect-playwright/PlaywrightPage` | `PlaywrightPageService` | Page navigation, locators, events |
| `PlaywrightLocator` | `effect-playwright/PlaywrightLocator` | `PlaywrightLocatorService` | Element interactions |
| `PlaywrightBrowserContext` | `cehs/backend/lib/playwright/PlaywrightBrowserContext` | Context operations | Isolated browser contexts |
| `PlaywrightEnvironment` | `effect-playwright/experimental/PlaywrightEnvironment` | Environment config | Test setup convenience layer |

### File Map

| File | Purpose | Layer |
|------|---------|-------|
| `playwright.ts` | Main Playwright service for launching browsers | service |
| `browser.ts` | Browser instance service wrapper | service |
| `page.ts` | Page service with navigation, locators, events | service |
| `locator.ts` | Element locator service | service |
| `browser-context.ts` | Browser context service | service |
| `errors.ts` | Typed error handling with Schema | errors |
| `common.ts` | Data wrappers for Request/Response/Dialog/etc | data |
| `utils.ts` | useHelper and availability check | utils |
| `experimental/environment.ts` | PlaywrightEnvironment for test setup | layer |

---

## Pattern Mapping Table

### Core Patterns

| @playwright/test Pattern | @beep/testkit/playwright Pattern | Notes |
|--------------------------|----------------------------------|-------|
| `await browser.launch()` | `yield* playwright.launchScoped(chromium)` | Use scoped for auto-cleanup |
| `await browser.newPage()` | `yield* browser.newPage()` | Returns PlaywrightPageService |
| `await page.goto(url)` | `yield* page.goto(url)` | Effect with PlaywrightError |
| `await page.title()` | `yield* page.title` | Property-style Effect |
| `page.locator(sel)` | `page.locator(sel)` | Synchronous, returns service directly |
| `await locator.click()` | `yield* locator.click()` | Chainable |
| `await locator.textContent()` | `yield* locator.textContent()` | Returns `string \| null` |
| `locator.first()` | `locator.first()` | Synchronous chaining |
| `locator.nth(n)` | `locator.nth(n)` | Synchronous chaining |
| `await page.evaluate(fn)` | `yield* page.evaluate(fn)` | Full typing preserved |
| `page.on('dialog', fn)` | `page.eventStream("dialog")` | Stream-based events |
| `expect(x).toBe(y)` | `assert(x === y)` | From @beep/testkit |
| `test.beforeAll(...)` | Layer composition | Shared browser via Layer |
| `test('...', async () => {})` | `it.scoped('...', Effect.fn(...))` | Scoped for resource cleanup |
| `await browser.close()` | Automatic via Scope | Or `yield* browser.close` explicitly |

### Test Structure Patterns

| @playwright/test | @beep/testkit + playwright | Notes |
|-----------------|---------------------------|-------|
| `test.describe()` | `describe()` from bun:test | Standard BDD structure |
| `test()` | `it.scoped()` with `Effect.fn()` | Scoped for resource cleanup |
| `test.beforeEach()` | Layer composition or test preamble | Shared setup via layers |
| `test.use()` | `PlaywrightEnvironment.layer(chromium, options)` | Browser config |
| Fixtures | Layer dependency injection | More powerful composition |

---

## Key Effect Patterns

### 1. Scoped Browser Lifecycle

**Source**: `playwright.ts:59-62`

```typescript
launchScoped: (
  browserType: BrowserType,
  options?: LaunchOptions
) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError.Type, Scope.Scope>;
```

Browser is automatically closed when scope closes - no manual cleanup needed.

### 2. useHelper for Promise-to-Effect Conversion

**Source**: `utils.ts:6-9`

```typescript
export const useHelper =
  <Wrap>(api: Wrap) =>
  <A>(userFunction: (api: Wrap) => Promise<A>) =>
    Effect.tryPromise(() => userFunction(api)).pipe(Effect.mapError(PlaywrightError.wrap));
```

### 3. PlaywrightEnvironment with withBrowser

**Source**: `experimental/environment.ts:87-93`

The recommended test pattern:

```typescript
export const withBrowser = Effect.provide(
  PlaywrightEnvironment.pipe(
    Effect.map((e) => e.browser),
    Effect.flatten,
    Layer.scoped(PlaywrightBrowser)
  )
);
```

### 4. Effect.fn for Typed Generator Functions

**Source**: `playwright.ts:130-140`

```typescript
const launch = Effect.fn(function* (
  browserType: BrowserType,
  options?: undefined | LaunchOptions
) {
  const rawBrowser = yield* Effect.tryPromise({
    try: () => browserType.launch(options),
    catch: PlaywrightError.wrap,
  });
  return PlaywrightBrowser.make(rawBrowser);
});
```

### 5. Stream.asyncPush for Events

**Source**: `page.ts:206-228`

```typescript
eventStream: <K extends PageEvent>(event: K) =>
  Stream.asyncPush<PageEvents[K]>((emit) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const callback = emit.single;
        page.on(event, callback);
        return { callback };
      }),
      ({ callback }) =>
        Effect.sync(() => {
          page.off(event, callback);
        })
    )
  ).pipe(Stream.map((e) => eventMappings[event](e)))
```

---

## Migration Examples

### Before: Simple Test

```typescript
// @playwright/test
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
```

### After: Simple Test

```typescript
// @beep/testkit + playwright
import { describe } from "bun:test";
import { assert, layer } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import { Effect } from "effect";
import { chromium } from "playwright-core";

describe.skipIf(!isPlaywrightAvailable)("Smoke Tests", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "homepage loads",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        yield* page.goto("http://localhost:3000");
        const title = yield* page.title;
        assert(title.length > 0);
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
```

### Before: Complex Drag Operation

```typescript
// @playwright/test
export async function drag(
  page: Page,
  from: Locator,
  to: Locator,
  loc: LocationValue
) {
  const fr = await from.boundingBox();
  const tr = await to.boundingBox();
  if (!fr || !tr) throw new Error("Could not get bounding boxes");

  const cf = getLocation(fr, Location.CENTER);
  const ct = getLocation(tr, loc);

  await page.mouse.move(cf.x, cf.y);
  await page.mouse.down();
  await page.mouse.move(ct.x, ct.y, { steps: 10 });
  await page.mouse.up();
}
```

### After: Complex Drag Operation (Using Escape Hatch)

```typescript
// @beep/testkit + playwright
import type { PlaywrightPage, PlaywrightLocator } from "@beep/testkit/playwright";
import { Effect } from "effect";

export const drag = (
  page: PlaywrightPage.Service,
  from: PlaywrightLocator.Service,
  to: PlaywrightLocator.Service,
  loc: LocationValue
) =>
  Effect.gen(function* () {
    const fr = yield* from.use((l) => l.boundingBox());
    const tr = yield* to.use((l) => l.boundingBox());

    if (!fr || !tr) {
      return yield* Effect.fail(new Error("Could not get bounding boxes"));
    }

    const cf = getLocation(fr, Location.CENTER);
    const ct = getLocation(tr, loc);

    // Use escape hatch for complex mouse operations
    yield* page.use(async (p) => {
      await p.mouse.move(cf.x, cf.y);
      await p.mouse.down();
      await p.mouse.move(ct.x, ct.y, { steps: 10 });
      await p.mouse.up();
    });
  });
```

### Before: Assertion with Playwright's expect

```typescript
await expect(tabButton).toBeVisible();
await expect(tabButton).toHaveClass(/selected/);
```

### After: Assertion Options

**Option A: Use escape hatch with Playwright's expect**

```typescript
yield* locator.use(async (l) => {
  const { expect } = await import("@playwright/test");
  await expect(l).toBeVisible();
  await expect(l).toHaveClass(/selected/);
});
```

**Option B: Use testkit assert with evaluated properties**

```typescript
const isVisible = yield* locator.isVisible();
assert(isVisible === true);

const className = yield* locator.getAttribute("class");
assert(className?.includes("selected"));
```

### Before: Event Handling

```typescript
page.on("dialog", async (dialog) => {
  console.log(dialog.message());
  await dialog.accept();
});
```

### After: Stream-Based Event Handling

```typescript
import * as F from "effect/Function";
import { Fiber, Stream } from "effect";

const program = Effect.gen(function* () {
  const browser = yield* PlaywrightBrowser;
  const page = yield* browser.newPage();

  // Fork stream processing
  const dialogFiber = yield* F.pipe(
    page.eventStream("dialog"),
    Stream.tap((dialog) =>
      Effect.gen(function* () {
        const message = yield* dialog.message;
        yield* Effect.log(`Dialog: ${message}`);
        yield* dialog.accept();
      })
    ),
    Stream.runDrain,
    Effect.fork
  );

  // Trigger the dialog
  yield* page.evaluate(() => alert("Hello"));

  // Wait for processing
  yield* Fiber.join(dialogFiber);
});
```

---

## Page Service API

### Navigation Methods (Effect-returning)

| Method | Signature | Description |
|--------|-----------|-------------|
| `goto` | `(url, options?) => Effect<Response \| null, PlaywrightError>` | Navigate to URL |
| `reload` | `(options?) => Effect<Response \| null, PlaywrightError>` | Reload page |
| `goBack` | `(options?) => Effect<Response \| null, PlaywrightError>` | Navigate back |
| `goForward` | `(options?) => Effect<Response \| null, PlaywrightError>` | Navigate forward |
| `title` | `Effect<string, PlaywrightError>` | Get page title |
| `url` | `Effect<string, PlaywrightError>` | Get current URL |

### Locator Methods (Synchronous)

| Method | Signature | Description |
|--------|-----------|-------------|
| `locator` | `(selector, options?) => PlaywrightLocatorService` | Create locator |
| `getByRole` | `(role, options?) => PlaywrightLocatorService` | Accessible role |
| `getByText` | `(text, options?) => PlaywrightLocatorService` | Text content |
| `getByLabel` | `(label, options?) => PlaywrightLocatorService` | Label lookup |
| `getByTestId` | `(testId) => PlaywrightLocatorService` | Test ID |

### Execution Methods (Effect-returning)

| Method | Signature | Description |
|--------|-----------|-------------|
| `evaluate` | `<R>(fn, arg?) => Effect<R, PlaywrightError>` | Run JS in page |
| `waitForSelector` | `(selector, options?) => Effect<PlaywrightLocatorService, PlaywrightError>` | Wait for element |
| `waitForFunction` | `(fn, arg?, options?) => Effect<void, PlaywrightError>` | Wait for condition |

### Escape Hatch

| Method | Signature | Description |
|--------|-----------|-------------|
| `use` | `<A>(fn: (page: Page) => Promise<A>) => Effect<A, PlaywrightError>` | Raw Playwright access |

---

## Locator Service API

### Actions (Effect-returning)

| Method | Signature | Description |
|--------|-----------|-------------|
| `click` | `(options?) => Effect<void, PlaywrightError>` | Click element |
| `fill` | `(value, options?) => Effect<void, PlaywrightError>` | Fill input |
| `type` | `(text, options?) => Effect<void, PlaywrightError>` | Type text |
| `press` | `(key, options?) => Effect<void, PlaywrightError>` | Press key |
| `dblclick` | `(options?) => Effect<void, PlaywrightError>` | Double click |
| `hover` | `(options?) => Effect<void, PlaywrightError>` | Hover |

### Queries (Effect-returning)

| Method | Signature | Description |
|--------|-----------|-------------|
| `textContent` | `(options?) => Effect<string \| null, PlaywrightError>` | Get text |
| `innerText` | `(options?) => Effect<string, PlaywrightError>` | Get inner text |
| `getAttribute` | `(name, options?) => Effect<string \| null, PlaywrightError>` | Get attribute |
| `boundingBox` | `(options?) => Effect<BoundingBox \| null, PlaywrightError>` | Get dimensions |
| `isVisible` | `(options?) => Effect<boolean, PlaywrightError>` | Check visibility |
| `count` | `Effect<number, PlaywrightError>` | Count matches |

### Chaining (Synchronous)

| Method | Signature | Description |
|--------|-----------|-------------|
| `first` | `() => PlaywrightLocatorService` | First match |
| `last` | `() => PlaywrightLocatorService` | Last match |
| `nth` | `(index) => PlaywrightLocatorService` | Nth match |
| `locator` | `(selector, options?) => PlaywrightLocatorService` | Nested locator |

### Escape Hatch

| Method | Signature | Description |
|--------|-----------|-------------|
| `use` | `<A>(fn: (locator: Locator) => Promise<A>) => Effect<A, PlaywrightError>` | Raw Playwright access |

---

## Layer Composition

### Test Setup Pattern

```typescript
import { describe } from "bun:test";
import { layer } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import { chromium } from "playwright-core";

describe.skipIf(!isPlaywrightAvailable)("Test Suite", () => {
  // Shared browser across all tests in suite
  layer(PlaywrightEnvironment.layer(chromium))((it) => {

    // Each test gets its own scoped browser
    it.scoped(
      "test name",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        // ... test code
      }, PlaywrightEnvironment.withBrowser)
    );

  });
});
```

### Layer Dependencies

```
Playwright.layer (static service)
     │
     ▼
PlaywrightEnvironment.layer(chromium) (configures browser type)
     │
     ▼
PlaywrightEnvironment.withBrowser (provides PlaywrightBrowser via Scope)
     │
     ▼
Test code (accesses PlaywrightBrowser, creates pages)
```

---

## Error Handling

### Error Types

| Class | Reason Tag | Cause Type | Description |
|-------|------------|------------|-------------|
| `PlaywrightTimeoutError` | `Timeout` | `TimeoutError` | Operation timed out |
| `PlaywrightGenericError` | `Generic` | `Error` | General error |

### Error Wrapping

All Playwright errors are automatically wrapped:

```typescript
// Internal implementation
const PlaywrightError = {
  wrap: (e: unknown) => {
    if (isTimeoutError(e)) {
      return PlaywrightTimeoutError.new(e);
    }
    return PlaywrightGenericError.new(e as Error);
  }
};
```

### Handling Errors

```typescript
yield* page.goto("https://example.com").pipe(
  Effect.catchTag("TimeoutError", (err) =>
    Effect.log(`Timeout: ${err.cause.message}`)
  )
);
```

---

## Best Practices

### DO

1. **Use `PlaywrightEnvironment.withBrowser`** for tests - provides automatic browser cleanup and Layer composition

2. **Use `launchScoped` over `launch`** - ensures browser is closed when scope closes

3. **Use `it.scoped` for tests with resources** - proper cleanup for browser contexts and pages

4. **Chain locator methods synchronously** - `page.locator(".btn").first().click()` rather than yielding each step

5. **Use `Effect.fn` for typed generators** - provides better type inference than raw Effect.gen

### DON'T

1. **NEVER use raw playwright-core without wrapping** - loses Effect error handling and resource management

2. **NEVER manually close browsers in scoped contexts** - Scope handles cleanup automatically

3. **AVOID `Effect.runPromise` in tests** - use `@beep/testkit` runners (effect, scoped, layer) instead

4. **AVOID callback-based event handling** - use `eventStream` with Stream combinators

---

## Questions for Phase 2

1. **baseURL configuration**: How to set the FlexLayout's `http://localhost:3001` base URL?
   - Option A: Pass in `LaunchOptions`
   - Option B: Prefix URLs in test code
   - Option C: Create custom Layer with URL config

2. **beforeEach equivalent**: Best approach for repeated setup (goto + waitForSelector)?
   - Option A: Extract to helper function called in each test
   - Option B: Create wrapper that provides pre-navigated page
   - Option C: Use Layer that navigates on provision

3. **Playwright assertions**: Should we use Playwright's `expect()` via escape hatch or convert to testkit `assert()`?
   - Playwright's expect has better error messages and auto-waiting
   - testkit's assert is more Effect-idiomatic

4. **Type parameter inference**: The type system for `PlaywrightPage.Service` vs raw `Page` types needs verification for complex helpers.
