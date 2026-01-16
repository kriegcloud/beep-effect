import { describe } from "bun:test";
import { layer } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import { Effect, Stream } from "effect";
import { chromium } from "playwright-core";

describe.skipIf(!isPlaywrightAvailable)("eventStream", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "should complete when the page closes",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();

        // Subscribe to an event stream
        const stream = page.eventStream("console");

        // Run the stream in the background
        const fiber = yield* Stream.runCollect(stream).pipe(Effect.fork);

        // Close the page
        yield* page.close;

        // Wait for the stream to complete
        yield* fiber.await;

        // test will timeout if the stream does not complete
      }, PlaywrightEnvironment.withBrowser)
    );

    it.scoped(
      "should complete when the browser closes",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();

        // Subscribe to an event stream
        const stream = page.eventStream("console");

        // Run the stream in the background
        const fiber = yield* Stream.runCollect(stream).pipe(Effect.fork);

        // Close the browser
        yield* browser.close;

        // Wait for the stream to complete
        yield* fiber.await;

        // test will timeout if the stream does not complete
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
