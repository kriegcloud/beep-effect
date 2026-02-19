import { assert, layer } from "@beep/testkit";
import { Playwright } from "@beep/testkit/playwright";
import { Duration, Effect, Schedule } from "effect";
import { chromium } from "playwright-core";

// Helper to retry CDP connection until the endpoint is ready
const connectCDPWithRetry = (playwright: typeof Playwright.Service, url: string, maxRetries = 10, delayMs = 100) =>
  playwright
    .connectCDP(url)
    .pipe(
      Effect.retry(Schedule.recurs(maxRetries).pipe(Schedule.intersect(Schedule.spaced(Duration.millis(delayMs)))))
    );

// Helper to retry scoped CDP connection until the endpoint is ready
const connectCDPScopedWithRetry = (
  playwright: typeof Playwright.Service,
  url: string,
  maxRetries = 10,
  delayMs = 100
) =>
  playwright
    .connectCDPScoped(url)
    .pipe(
      Effect.retry(Schedule.recurs(maxRetries).pipe(Schedule.intersect(Schedule.spaced(Duration.millis(delayMs)))))
    );

layer(Playwright.layer)("Playwright", (it) => {
  it.scoped.skip("should launch a browser", () =>
    Effect.gen(function* () {
      const program = Effect.gen(function* () {
        const playwright = yield* Playwright;
        const browser = yield* playwright.launchScoped(chromium);

        yield* browser.newPage({ baseURL: "about:blank" });
      });
      const result = yield* Effect.exit(program);

      assert(result._tag === "Success", "Expected success");
    })
  );

  it.scoped.skip("should launch and run some commands", () =>
    Effect.gen(function* () {
      const program = Effect.gen(function* () {
        const playwright = yield* Playwright;
        const browser = yield* playwright.launchScoped(chromium);

        const page = yield* browser.newPage({ baseURL: "about:blank" });

        const addition = yield* page.evaluate(() => {
          return 1 + 1;
        });

        assert(addition === 2, "Expected addition to be 2");
      });
      const result = yield* Effect.exit(program);

      assert(result._tag === "Success", "Expected success");
    })
  );

  it.scoped.skip("should fail to launch a browser with invalid path", () =>
    Effect.gen(function* () {
      const playwright = yield* Playwright;
      const result = yield* playwright
        .launchScoped(chromium, {
          executablePath: "/invalid/path",
        })
        .pipe(Effect.flip);
      assert(result._tag === "PlaywrightError", "Expected failure with invalid path");
    })
  );

  it.scoped.skip("should fail with timeout 1", () =>
    Effect.gen(function* () {
      const playwright = yield* Playwright;
      const result = yield* playwright
        .launchScoped(chromium, {
          timeout: 1,
          executablePath: "/bin/cat",
        })
        .pipe(Effect.flip);
      assert(result._tag === "PlaywrightError", "Expected failure with PlaywrightError");
      // The error can be Timeout or Unknown depending on Playwright version and timing
      assert(
        result.reason === "Timeout" || result.reason === "Unknown",
        `Expected reason to be Timeout or Unknown, got ${result.reason}`
      );
    })
  );

  // Skip CDP tests - Bun has WebSocket compatibility issues with Playwright's CDP connection
  // These tests work with Node.js but hang indefinitely under Bun
  // See: https://github.com/oven-sh/bun/issues/4529 (WebSocket compatibility issues)
  it.scoped.skip(
    "should connect via CDP (confirm browser.close only closes CDP connection)",
    () =>
      Effect.gen(function* () {
        const playwright = yield* Playwright;

        // 1. Launch a browser that exposes CDP
        const directBrowser = yield* playwright.launchScoped(chromium, {
          args: ["--remote-debugging-port=9224", "--remote-debugging-address=127.0.0.1"],
        });

        // Wait for browser to fully initialize its CDP endpoint
        yield* Effect.sleep(Duration.millis(500));

        // 2. Connect to it via CDP (with retry to wait for CDP endpoint)
        const browser = yield* connectCDPWithRetry(playwright, "http://127.0.0.1:9224");

        // 3. Cleanup connection now
        yield* browser.close;

        assert((yield* directBrowser.isConnected) === true, "Expected direct browser to be still connected");

        const page = yield* directBrowser.newPage();
        const content = yield* page.evaluate(() => "eval works");
        assert(content === "eval works", "Expected content to be eval works");
      }),
    { timeout: 20000 }
  );

  // Skip CDP tests - Bun has WebSocket compatibility issues with Playwright's CDP connection
  it.scoped.skip(
    "should connect via CDP and close automatically with scope",
    () =>
      Effect.gen(function* () {
        const playwright = yield* Playwright;

        // 1. Launch a browser that exposes CDP
        const directBrowser = yield* playwright.launchScoped(chromium, {
          args: ["--remote-debugging-port=9225", "--remote-debugging-address=127.0.0.1"],
        });

        // Wait for browser to fully initialize its CDP endpoint
        yield* Effect.sleep(Duration.millis(500));

        // 2. Connect to it via CDP using connectCDPScoped (with retry to wait for CDP endpoint)
        yield* Effect.gen(function* () {
          const browser = yield* connectCDPScopedWithRetry(playwright, "http://127.0.0.1:9225");
          const isConnected = yield* browser.isConnected;
          assert(isConnected === true, "Expected connected true");
        }).pipe(Effect.scoped);

        // 3. After scope, connection should be closed
        // We can't easily check the CDP browser object as it's out of scope
        // but we can check if the direct browser is still connected
        assert((yield* directBrowser.isConnected) === true, "Expected browser to still be connected");

        const page = yield* directBrowser.newPage();
        const content = yield* page.evaluate(() => "eval after cdp closed");
        assert(content === "eval after cdp closed", "Expected content to be correct");
      }),
    { timeout: 20000 }
  );
});
