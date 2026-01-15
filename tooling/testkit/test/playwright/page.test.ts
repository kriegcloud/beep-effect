import {assert, layer} from "@beep/testkit";
import {PlaywrightBrowser} from "@beep/testkit/playwright/browser";
import {PlaywrightEnvironment} from "@beep/testkit/playwright/experimental";
import {Effect, Fiber, Stream} from "effect";
import * as F from "effect/Function";
import {chromium} from "playwright-core";

layer(PlaywrightEnvironment.layer(chromium))("PlaywrightPage", (it) => {
  it.scoped("goto should navigate to a URL", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      // Using about:blank to avoid external network dependencies in tests if possible,
      // but goto is usually used for real URLs. Let's use about:blank first.
      yield* page.goto("about:blank");
      const url = yield* page.use((p) => Promise.resolve(p.url()));
      assert(url === "about:blank");
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("title should return the page title", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.goto("data:text/html,<title>Test Page</title>");
      const title = yield* page.title;
      assert(title === "Test Page");
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("click should click an element",
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        const win = window as Window & { clicked?: boolean };
        document.body.innerHTML =
          "<button id=\"mybutton\" onclick=\"window.clicked = true\">Click Me</button>";
        win.clicked = false;
      });

      yield* page.click("#mybutton");

      const clicked = yield* page.evaluate(
        () => (window as Window & { clicked?: boolean }).clicked,
      );
      assert(clicked === true);
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("goto should work with options",
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.goto("about:blank", {waitUntil: "domcontentloaded"});
      const url = yield* page.use((p) => Promise.resolve(p.url()));
      assert(url === "about:blank");
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped(
    "evaluate should run code in the page context with destructured arg",

    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const result = yield* page.evaluate(
        ([a, b]: readonly [number, number]) => a + b,
        [10, 20] as const,
      );
      assert(result === 30);
    }, PlaywrightEnvironment.withBrowser)
  );

  it.scoped("evaluate should run code with a single value arg",
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const result = yield* page.evaluate((val: number) => val * 2, 21);
      assert(result === 42);
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("click should work with options", () =>
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        const win = window as Window & {
          clickCoords?: { x: number; y: number } | null;
        };
        document.body.innerHTML =
          "<button id=\"mybutton\" style=\"width: 100px; height: 100px\">Click Me</button>";
        win.clickCoords = null;
        document.getElementById("mybutton")?.addEventListener("click", (e) => {
          win.clickCoords = {x: e.clientX, y: e.clientY};
        });
      });

      // Click at a specific position relative to the element
      yield* page.click("#mybutton", {position: {x: 10, y: 10}});

      const coords = yield* page.evaluate(
        () =>
          (window as Window & { clickCoords?: { x: number; y: number } | null })
            .clickCoords,
      );
      assert(coords !== null);
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("use should allow accessing raw playwright page",
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const content = yield* page.use((p) => p.content());
      assert(typeof content === "string");
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("locator should work with options",
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = `
          <div class="test">One</div>
          <div class="test" data-id="target">Two</div>
        `;
      });

      const locator = page.locator(".test", {hasText: "Two"});
      const text = yield* locator.textContent();
      assert(text === "Two");

      const attr = yield* locator.getAttribute("data-id");
      assert(attr === "target");
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("getBy* methods should work",
    Effect.fn(function* () {
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
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("waitForURL should work with History API",
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.goto("about:blank");
      yield* page.evaluate(() => {
        history.pushState({}, "", "#test-history");
      });

      yield* page.waitForURL((url) => url.hash === "#test-history");
      const url = yield* page.url;
      assert(url.endsWith("#test-history"));
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("filechooser event should work",
    Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = "<input type=\"file\" id=\"fileinput\" />";
      });

      const fileChooser = yield* F.pipe(page
          .eventStream("filechooser"),
        Stream.runHead,
        Effect.fork
      );

      yield* page.locator("#fileinput").click();

      const results = yield* Fiber.join(fileChooser).pipe(Effect.flatten);

      assert(
        (yield* results.isMultiple) === false,
        "isMultiple should be false",
      );
    }, PlaywrightEnvironment.withBrowser),
  );
});
