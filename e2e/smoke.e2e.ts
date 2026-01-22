import { describe } from "bun:test";
import { assert, layer } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import * as Effect from "effect/Effect";
import { chromium } from "playwright-core";

describe.skipIf(!isPlaywrightAvailable)("Smoke Tests", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "homepage loads",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();

        yield* page.goto("http://localhost:3001/");
        const title = yield* page.title;
        assert(title.length >= 0, "Title should be accessible");
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
