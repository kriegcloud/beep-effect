import { assert, layer } from "@beep/testkit";

import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import { Effect, Fiber, pipe, Stream } from "effect";

import { chromium } from "playwright-core";

layer(PlaywrightEnvironment.layer(chromium))("PlaywrightPage", (it) => {
  it.scoped.skip("goto should navigate to a URL", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      // Using about:blank to avoid external network dependencies in tests if possible,
      // but goto is usually used for real URLs. Let's use about:blank first.
      yield* page.goto("about:blank");
      const url = yield* page.use((p) => Promise.resolve(p.url()));
      assert(url === "about:blank");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("title should return the page title", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.goto("data:text/html,<title>Test Page</title>");
      const title = yield* page.title;
      assert(title === "Test Page");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("click should click an element", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        const win = window as Window & { clicked?: boolean };
        document.body.innerHTML = '<button id="mybutton" onclick="window.clicked = true">Click Me</button>';
        win.clicked = false;
      });

      yield* page.click("#mybutton");

      const clicked = yield* page.evaluate(() => (window as Window & { clicked?: boolean }).clicked);
      assert(clicked === true);
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("goto should work with options", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.goto("about:blank", { waitUntil: "domcontentloaded" });
      const url = yield* page.use((p) => Promise.resolve(p.url()));
      assert(url === "about:blank");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("evaluate should run code in the page context with destructured arg", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const result = yield* page.evaluate(([a, b]: readonly [number, number]) => a + b, [10, 20] as const);
      assert(result === 30);
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("evaluate should run code with a single value arg", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const result = yield* page.evaluate((val: number) => val * 2, 21);
      assert(result === 42);
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("click should work with options", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        const win = window as Window & {
          clickCoords?: { x: number; y: number } | null;
        };
        document.body.innerHTML = '<button id="mybutton" style="width: 100px; height: 100px">Click Me</button>';
        win.clickCoords = null;
        document.getElementById("mybutton")?.addEventListener("click", (e) => {
          win.clickCoords = { x: e.clientX, y: e.clientY };
        });
      });

      // Click at a specific position relative to the element
      yield* page.click("#mybutton", { position: { x: 10, y: 10 } });

      const coords = yield* page.evaluate(
        () => (window as Window & { clickCoords?: { x: number; y: number } | null }).clickCoords
      );
      assert(coords !== null);
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("use should allow accessing raw playwright page", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const content = yield* page.use((p) => p.content());
      assert(typeof content === "string");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("locator should work with options", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = `
          <div class="test">One</div>
          <div class="test" data-id="target">Two</div>
        `;
      });

      const locator = page.locator(".test", { hasText: "Two" });
      const text = yield* locator.textContent();
      assert(text === "Two");

      const attr = yield* locator.getAttribute("data-id");
      assert(attr === "target");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("getBy* methods should work", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = `
          <button role="button">Click Me</button>
          <span>Hello World</span>
          <label for="input">Label Text</label>
          <input id="input" />
          <div data-testid="test-id">Test Content</div>
        `;
      });

      const byRole = yield* page.getByRole("button").textContent();
      assert(byRole === "Click Me");

      const byText = yield* page.getByText("Hello World").textContent();
      assert(byText === "Hello World");

      const byLabel = yield* page.getByLabel("Label Text").getAttribute("id");
      assert(byLabel === "input");

      const byTestId = yield* page.getByTestId("test-id").textContent();
      assert(byTestId === "Test Content");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("waitForURL should work with History API", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.goto("about:blank");
      yield* page.evaluate(() => {
        history.pushState({}, "", "#test-history");
      });

      yield* page.waitForURL((url) => url.hash === "#test-history");
      const url = yield* page.url;
      assert(url.endsWith("#test-history"));
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("filechooser event should work", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = '<input type="file" id="fileinput" />';
      });

      const fileChooser = yield* pipe(page.eventStream("filechooser"), Stream.runHead, Effect.fork);

      yield* page.locator("#fileinput").click();

      const results = yield* Fiber.join(fileChooser).pipe(Effect.flatten);

      assert((yield* results.isMultiple) === false, "isMultiple should be false");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("waitForLoadState should resolve", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      // Using about:blank and history API to simulate some activity, but networkidle is tricky on blank page.
      // load and domcontentloaded are safer.
      yield* page.goto("about:blank");

      // Wait for 'load' state which should already be true or happen quickly
      yield* page.waitForLoadState("load");

      // No assertion needed other than it doesn't timeout/error
      assert.isTrue(true);
    }).pipe(PlaywrightEnvironment.withBrowser)
  );
});
