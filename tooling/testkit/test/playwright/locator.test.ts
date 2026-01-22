/// <reference lib="dom" />

import { assert, layer } from "@beep/testkit";

import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import { Effect } from "effect";
import { chromium } from "playwright-core";

layer(PlaywrightEnvironment.layer(chromium))("PlaywrightLocator", (it) => {
  it.scoped.skip("should work", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();
      yield* page.goto("data:text/html,<title>Blank</title>");

      const title = page.locator("title");

      const titleText = yield* title.textContent();
      assert(titleText === "Blank", "Expected title to be 'Blank'");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("evaluate", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = `
          <div id="test">Test</div>
        `;
      });

      const locator = page.locator("#test");

      const result = yield* locator.evaluate((el) => {
        el.style.color = "red";
        return el.style.color;
      });

      assert(result === "red");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );

  it.scoped.skip("kitchensink", () =>
    Effect.gen(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = `
          <div id="container">
            <button id="btn-1" class="btn" data-info="first">Button 1</button>
            <button id="btn-2" class="btn" data-info="second">Button 2</button>
            <input id="input-1" value="initial value" />
            <div id="html-content"><span>Hello</span></div>
          </div>
        `;
      });

      const buttons = page.locator(".btn");
      const input = page.locator("#input-1");
      const htmlDiv = page.locator("#html-content");

      // textContent
      const btn1Text = yield* buttons.first().textContent();
      assert(btn1Text === "Button 1");

      // innerText
      const btn2InnerText = yield* buttons.nth(1).innerText();
      assert(btn2InnerText === "Button 2");

      // innerHTML
      const htmlContent = yield* htmlDiv.innerHTML();
      assert(htmlContent === "<span>Hello</span>");

      // count
      const btnCount = yield* buttons.count;
      assert(btnCount === 2);

      // getAttribute
      const btn1Attr = yield* buttons.first().getAttribute("data-info");
      assert(btn1Attr === "first");

      // inputValue & fill
      const initialValue = yield* input.inputValue();
      assert(initialValue === "initial value");

      yield* input.fill("new value");
      const newValue = yield* input.inputValue();
      assert(newValue === "new value");

      // click
      yield* page.evaluate(() => {
        const win = window as Window & { clicked?: boolean };
        win.clicked = false;
        document.getElementById("btn-1")?.addEventListener("click", () => {
          win.clicked = true;
        });
      });

      yield* buttons.first().click();
      const isClicked = yield* page.evaluate(() => (window as Window & { clicked?: boolean }).clicked);
      assert(isClicked === true);

      // first, last, nth
      const firstId = yield* buttons.first().getAttribute("id");
      assert(firstId === "btn-1");
      const lastId = yield* buttons.last().getAttribute("id");
      assert(lastId === "btn-2");
      const nthId = yield* buttons.nth(1).getAttribute("id");
      assert(nthId === "btn-2");

      // evaluate
      const evalResult = yield* buttons.first().evaluate((el, arg) => {
        return el.getAttribute("data-info") + arg;
      }, "-suffix");
      assert(evalResult === "first-suffix");

      // use
      const useResult = yield* buttons.first().use((l) => l.evaluate((el) => el.id));
      assert(useResult === "btn-1");
    }).pipe(PlaywrightEnvironment.withBrowser)
  );
});
