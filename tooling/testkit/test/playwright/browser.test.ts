import { assert, layer } from "@beep/testkit";
import { Playwright } from "@beep/testkit/playwright";
import type { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { Effect } from "effect";
import { chromium } from "playwright-core";

layer(Playwright.layer)("PlaywrightBrowser", (it) => {
  it.scoped("newPage should create a page", Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const page = yield* browser.newPage();
      assert.isDefined(page);
    }),
  );

  it.scoped("use should allow accessing raw browser", Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const isConnected = yield* browser.use((b) =>
        Promise.resolve(b.isConnected()),
      );
      assert.isTrue(isConnected);
    }));

  it.scoped("browserType should return the browser type",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const type = yield* browser.browserType;
      assert.strictEqual(type.name(), "chromium");
    }),
  );

  it.scoped("version should return the browser version",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const version = yield* browser.version;
      assert.isString(version);
      assert.isNotEmpty(version);
    }),
  );

  it.scoped("close should close the browser",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      yield* browser.close;

      const isConnected = yield* browser.use((b) =>
        Promise.resolve(b.isConnected()),
      );
      assert.isFalse(isConnected);
    }),
  );
  it.scoped("contexts should return the list of contexts",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const initialContexts = yield* browser.contexts;
      assert.strictEqual(initialContexts.length, 0);

      yield* browser.newContext();
      const contextsAfterOne = yield* browser.contexts;
      assert.strictEqual(contextsAfterOne.length, 1);
    }),
  );

  it.scoped("newContext should create a new context",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const context = yield* browser.newContext();
      assert.isDefined(context);

      const pages = yield* context.pages;
      assert.strictEqual(pages.length, 0);
    }),
  );

  it.scoped("newContext should allow creating pages",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const context = yield* browser.newContext();
      const page = yield* context.newPage;
      assert.isDefined(page);

      const pages = yield* context.pages;
      assert.strictEqual(pages.length, 1);
    }),
  );

  it.scoped("contexts should reflect newPage creation",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      yield* browser.newPage();
      const contexts = yield* browser.contexts;
      assert.strictEqual(contexts.length, 1);

      const firstContext = contexts[0];
      assert.isDefined(firstContext);
      const pages = yield* firstContext.pages;
      assert.strictEqual(pages.length, 1);
    }),
  );

  it.effect("newContext and browser finalizers should work",
    Effect.fn(function* () {
      const playwright = yield* Playwright;
      let capturedBrowser: typeof PlaywrightBrowser.Service | undefined;

      yield* Effect.scoped(
        Effect.gen(function* () {
          const browser = yield* playwright.launchScoped(chromium);
          capturedBrowser = browser;

          yield* Effect.scoped(
            Effect.gen(function* () {
              yield* browser.newContext();
              const contexts = yield* browser.contexts;
              assert.strictEqual(contexts.length, 1);
            }),
          );

          const contextsAfter = yield* browser.contexts;
          assert.strictEqual(contextsAfter.length, 0);
        }),
      );

      assert.isDefined(capturedBrowser);
      const isConnected = yield* capturedBrowser.isConnected;
      assert.isFalse(isConnected);
    }),
  );
});
