import { layer } from "@beep/testkit";
import { assert } from "@beep/testkit/assert";
import { Effect } from "effect";
import { chromium } from "playwright-core";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import {
  layer as layerPlaywrightEnvironment,
  PlaywrightEnvironment,
  withBrowser,
} from "@beep/testkit/playwright/experimental/environment"

const accessFirst = Effect.gen(function* () {
  const browser = yield* PlaywrightBrowser;

  assert(browser, "Expected browser");

  const contexts = yield* browser.contexts;

  assert(contexts.length > 0, "Expected contexts");

  const first = contexts[0];
  assert(first, "Expected first context");

  const pages = yield* first.pages;
  assert(pages.length > 0, "Expected pages");

  const firstPage = pages[0];
  assert(firstPage, "Expected first page");

  // append ?test=1 to the first page
  yield* firstPage.goto("about:blank?test=1");
});

const accessSecond = Effect.gen(function* () {
  const browser = yield* PlaywrightBrowser;

  assert(browser, "Expected browser");

  const contexts = yield* browser.contexts;

  assert(contexts.length > 0, "Expected contexts");

  const first = contexts[0];
  assert(first, "Expected first context");

  const pages = yield* first.pages;
  assert(pages.length > 0, "Expected pages");

  // page should have ?test=1
  const page = pages[0];
  assert(page, "Expected page");
  const url = yield* page.url;
  assert(url.includes("?test=1"), "Expected ?test=1");
});

layer(layerPlaywrightEnvironment(chromium))("PlaywrightEnvironment", (it) => {
  it.scoped("should launch a browser", Effect.fn(function* () {
      const program = Effect.gen(function* () {
        const playwright = yield* PlaywrightEnvironment;
        const browser = yield* playwright.browser;

        yield* browser.newPage({ baseURL: "about:blank" });
      });
      const result = yield* Effect.exit(program);

      assert(result._tag === "Success", "Expected success");
    }),
  );

  it.effect("withBrowser helper should work", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      yield* browser.newPage({ baseURL: "about:blank" });
    }, withBrowser),
  );

  it.effect("withBrowser allows shared use",  Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;

      yield* browser.newPage({ baseURL: "about:blank" });

      yield* accessFirst;
      yield* accessSecond;
    }, withBrowser),
  );

  it.effect("withBrowser imperative use", () => withBrowser(
      Effect.gen(function* () {
        const browser = yield* PlaywrightBrowser;

        yield* browser.newPage({ baseURL: "about:blank" });
      }),
    ),
  );

  it.effect("withBrowser scope cleanup",  Effect.fn(function* () {
      let capturedBrowser: typeof PlaywrightBrowser.Service | undefined;

      yield* withBrowser(
        Effect.gen(function* () {
          const browser = yield* PlaywrightBrowser;
          capturedBrowser = browser;

          yield* browser.newPage({ baseURL: "about:blank" });

          yield* accessFirst;
          yield* accessSecond;
        }),
      );

      assert(capturedBrowser, "Expected browser");
      const contexts = yield* capturedBrowser.contexts;
      assert(contexts.length === 0, "Expected no contexts");

      // actually not connected anymore
      assert(
        (yield* capturedBrowser.isConnected) === false,
        "Expected not connected",
      );
    }),
  );
});
