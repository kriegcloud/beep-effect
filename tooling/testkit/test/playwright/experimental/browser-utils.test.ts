import { assert, layer } from "@beep/testkit";
import { Playwright } from "@beep/testkit/playwright";
import * as BrowserUtils from "@beep/testkit/playwright/experimental/browser-utils";
import { Chunk, Effect, Fiber, Stream } from "effect";
import { chromium } from "playwright-core";

layer(Playwright.layer)("BrowserUtils", (it) => {
  it.scoped.skip("allPages should return all pages from all contexts", () =>
    Effect.gen(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      const context1 = yield* browser.newContext();
      yield* context1.newPage;
      yield* context1.newPage;

      const context2 = yield* browser.newContext();
      yield* context2.newPage;

      const pages = yield* BrowserUtils.allPages(browser);
      assert.strictEqual(pages.length, 3);
    })
  );

  it.scoped.skip("allFrames should return all frames from all pages", () =>
    Effect.gen(function* () {
      const playwright = yield* Playwright;
      const browser = yield* playwright.launchScoped(chromium);

      yield* browser.newPage();
      yield* browser.newPage();

      // Retrieve frames
      const frames = yield* BrowserUtils.allFrames(browser);

      // Each page has at least one frame (the main frame)
      assert.strictEqual(frames.length, 2);
    })
  );

  it.scoped.skip(
    "allFrameNavigatedEventStream should capture navigations from existing and new pages across multiple contexts",
    () =>
      Effect.gen(function* () {
        const playwright = yield* Playwright;
        const browser = yield* playwright.launchScoped(chromium);

        // Setup contexts and an initial page
        const context1 = yield* browser.newContext();
        const context2 = yield* browser.newContext();
        const page1 = yield* context1.newPage;

        // Start the event stream
        const stream = BrowserUtils.allFrameNavigatedEventStream(browser);
        const eventFiber = yield* stream.pipe(Stream.runCollect, Effect.fork);

        // 1. Navigate existing page
        yield* page1.goto("data:text/html,<div>Page 1 (existing in context 1)</div>");

        // 2. Create new page in context 1 and navigate
        const page2 = yield* context1.newPage;
        yield* page2.goto("data:text/html,<div>Page 2 (new in context 1)</div>");

        // 3. Create new page in context 2 and navigate
        const page3 = yield* context2.newPage;

        yield* page3.goto("data:text/html,<div>Page 3 (new in context 2)</div>");

        // 4. Create new page in context 2 and navigate
        const page4 = yield* context2.newPage;

        yield* page4.goto("data:text/html,<div>Page 4 (new in context 2)</div>");

        yield* browser.close;

        const events = yield* Fiber.join(eventFiber);
        assert.strictEqual(Chunk.size(events), 4);
      })
  );

  it.scoped.skip(
    "page eventStream should capture framenavigated",
    () =>
      Effect.gen(function* () {
        const playwright = yield* Playwright;
        const browser = yield* playwright.launchScoped(chromium);
        const page = yield* browser.newPage();

        const fiber = yield* BrowserUtils.allFrameNavigatedEventStream(browser).pipe(
          Stream.take(1),
          Stream.runCollect,
          Effect.fork
        );

        yield* page.goto("https://example.com");

        const events = yield* Fiber.join(fiber);
        assert.strictEqual(Chunk.size(events), 1);
      }),
    { timeout: 15000 }
  );
});
