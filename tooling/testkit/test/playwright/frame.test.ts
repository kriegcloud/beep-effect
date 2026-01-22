import { assert, layer } from "@beep/testkit";
import { PlaywrightBrowser } from "@beep/testkit/playwright";
import { Effect } from "effect";
import { chromium } from "playwright-core";
import { PlaywrightEnvironment } from "../../src/playwright/experimental";
import type { PlaywrightFrameService } from "../../src/playwright/frame";

layer(PlaywrightEnvironment.layer(chromium))("PlaywrightFrame", (it) => {
  it.scoped("should wrap frame methods", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      // Setup a page with an iframe
      yield* page.evaluate(() => {
        const iframe = document.createElement("iframe");
        iframe.name = "test-frame";
        iframe.srcdoc =
          "<html><head><title>Frame Title</title></head><body><div id='target'>Hello from Frame</div></body></html>";
        document.body.appendChild(iframe);
      });

      // wait for iframe to load or something. has to be networkidle for some reason
      yield* page.waitForLoadState("networkidle");

      // Get the frame
      const frames = yield* page.frames;

      const isTestFrame = (f: PlaywrightFrameService) => f.name.pipe(Effect.map((n) => n === "test-frame"));

      const frame = yield* Effect.findFirst(frames, isTestFrame).pipe(
        Effect.flatten,
        Effect.retry({
          times: 3,
        })
      );

      assert.isOk(frame, "Frame not found");

      // Test title
      const title = yield* frame.title;
      assert.strictEqual(title, "Frame Title");

      // Test content
      const content = yield* frame.content;
      assert.isTrue(content.includes("Hello from Frame"));

      // Test evaluate
      const result = yield* frame.evaluate(() => 1 + 1);
      assert.strictEqual(result, 2);

      // Test locator
      const text = yield* frame.locator("#target").textContent();
      assert.strictEqual(text, "Hello from Frame");

      // Test getByText
      const byText = yield* frame.getByText("Hello from Frame").count;
      assert.strictEqual(byText, 1);

      // Test name
      const name = yield* frame.name;
      assert.strictEqual(name, "test-frame");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped("waitForLoadState should resolve on frame", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      // Load a page that already has an iframe
      yield* page.goto(
        "data:text/html,<html><body><iframe name='test-frame' src='about:blank'></iframe></body></html>"
      );

      // Wait for the main page to settle
      yield* page.waitForLoadState("load");

      // Get the frame - it should be there now
      // Get the frame - it should be there now
      const frames = yield* page.frames;
      const frameService = frames.find((f) => Effect.runSync(f.name.pipe(Effect.map((n) => n === "test-frame"))));

      assert.isOk(frameService, "Frame not found");

      // Wait for 'load' state on the frame
      yield* frameService.waitForLoadState("load");

      assert.ok(true);
    }).pipe(PlaywrightEnvironment.withBrowser)
  );
});
