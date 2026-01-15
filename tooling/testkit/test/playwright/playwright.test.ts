import { assert, layer } from "@beep/testkit";
import { Effect } from "effect";
import { chromium } from "playwright-core";
import { Playwright } from "@beep/testkit/playwright";

layer(Playwright.layer)("Playwright", (it) => {
  it.scoped("should launch a browser",
    Effect.fn(function* () {
      const program = Effect.gen(function* () {
        const playwright = yield* Playwright;
        const browser = yield* playwright.launchScoped(chromium);

        yield* browser.newPage({ baseURL: "about:blank" });
      });
      const result = yield* Effect.exit(program);

      assert(result._tag === "Success", "Expected success");
    }),
  );

  it.scoped("should launch and run some commands",
    Effect.fn(function* () {
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
    }),
  );

  it.scoped("should fail to launch a browser with invalid path",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const result = yield* playwright
        .launchScoped(chromium, {
          executablePath: "/invalid/path",
        })
        .pipe(Effect.flip);
      assert(
        result._tag === "TimeoutError" || result._tag === "UnknownError",
        "Expected PlaywrightError with invalid path",
      );
    }),
  );

  it.scoped("should fail with timeout 1",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const result = yield* playwright
        .launchScoped(chromium, {
          timeout: 1,
          executablePath: "/bin/cat",
        })
        .pipe(Effect.flip);
      assert(
        result._tag === "TimeoutError",
        "Expected TimeoutError with timeout 0",
      );
    }),
  );

  // NOTE: CDP tests are flaky and require full system dependencies
  // Run `sudo npx playwright install-deps` to install missing deps
  it.scoped.skip(
    "should connect via CDP (confirm browser.close only closes CDP connection)",
    Effect.fn(function* () {
      const playwright = yield* Playwright;

      // 1. Launch a browser that exposes CDP
      const directBrowser = yield* playwright.launchScoped(chromium, {
        args: [
          "--remote-debugging-port=9222",
          "--remote-debugging-address=127.0.0.1",
        ],
      });

      // 2. Connect to it via CDP
      const browser = yield* playwright.connectCDP("http://127.0.0.1:9222");

      // 3. Cleanup connection now
      yield* browser.close;

      assert(
        (yield* directBrowser.isConnected) === true,
        "Expected direct browser to be still connected",
      );

      const page = yield* directBrowser.newPage();
      const content = yield* page.evaluate(() => "eval works");
      assert(content === "eval works", "Expected content to be eval works");
    }),
    { timeout: 30_000 },
  );

  // NOTE: CDP tests are flaky and require full system dependencies
  // Run `sudo npx playwright install-deps` to install missing deps
  it.scoped.skip(
    "should connect via CDP and close automatically with scope",
    Effect.fn(function* () {
      const playwright = yield* Playwright;

      // 1. Launch a browser that exposes CDP
      const directBrowser = yield* playwright.launchScoped(chromium, {
        args: [
          "--remote-debugging-port=9223",
          "--remote-debugging-address=127.0.0.1",
        ],
      });

      // 2. Connect to it via CDP using connectCDPScoped
      yield* Effect.gen(function* () {
        const browser = yield* playwright.connectCDPScoped(
          "http://127.0.0.1:9223",
        );
        const isConnected = yield* browser.isConnected;
        assert(isConnected === true, "Expected connected true");
      }).pipe(Effect.scoped);

      // 3. After scope, connection should be closed
      // We can't easily check the CDP browser object as it's out of scope
      // but we can check if the direct browser is still connected
      assert(
        (yield* directBrowser.isConnected) === true,
        "Expected browser to still be connected",
      );

      const page = yield* directBrowser.newPage();
      const content = yield* page.evaluate(() => "eval after cdp closed");
      assert(
        content === "eval after cdp closed",
        "Expected content to be correct",
      );
    }),
    { timeout: 30_000 },
  );
});
