import {assert, layer} from "@beep/testkit";
import {PlaywrightBrowser} from "@beep/testkit/playwright/browser";
import {PlaywrightEnvironment} from "@beep/testkit/playwright/experimental";
import {Effect, Fiber, Option, Stream} from "effect";
import * as F from "effect/Function";
import {chromium} from "playwright-core";

layer(PlaywrightEnvironment.layer(chromium))("PlaywrightCommon", (it) => {
  it.scoped("PlaywrightRequest and PlaywrightResponse", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const requestFiber = yield* F.pipe(
        page.eventStream("request"),
        Stream.runHead,
        Effect.fork,
      );

      const responseFiber = yield* F.pipe(
        page.eventStream("response"),
        Stream.runHead,
        Effect.fork
      );

      yield* page.goto("http://example.com");

      const request = yield* Fiber.join(requestFiber).pipe(Effect.flatten);
      const response = yield* Fiber.join(responseFiber).pipe(Effect.flatten);

      assert((yield* request.url).includes("example.com"));
      assert((yield* request.method) === "GET");
      assert((yield* request.isNavigationRequest) === true);

      assert((yield* response.url).includes("example.com"));
      assert((yield* response.ok) === true);
      assert((yield* response.status) === 200);

      const headers = yield* response.headers;
      assert(headers["content-type"] !== undefined);

      const respRequest = response.request();
      assert((yield* respRequest.url).includes("example.com"));

      const requestResponse = yield* request.response;
      assert(Option.isSome(requestResponse));
      assert((yield* requestResponse.value.url) === (yield* response.url));
    }, PlaywrightEnvironment.withBrowser)
  );

  it.scoped("PlaywrightWorker", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const workerFiber = yield* F.pipe(
        page.eventStream("worker"),
        Stream.runHead,
        Effect.fork
      );


      yield* page.evaluate(() => {
        const blob = new Blob(["console.log(\"worker\")"], {
          type: "application/javascript",
        });
        new Worker(URL.createObjectURL(blob));
      });

      const worker = yield* Fiber.join(workerFiber).pipe(Effect.flatten);

      assert((yield* worker.url).startsWith("blob:"));
      const result = yield* worker.evaluate(() => 1 + 1);
      assert(result === 2);
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("PlaywrightDialog", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      const dialogFiber = yield* F.pipe(
        page
          .eventStream("dialog"),
        Stream.runHead,
        Effect.fork
      );

      yield* page.evaluate(() => {
        setTimeout(() => alert("hello world"), 10);
      });

      const dialog = yield* Fiber.join(dialogFiber).pipe(Effect.flatten);

      assert((yield* dialog.message) === "hello world");
      assert((yield* dialog.type) === "alert");

      yield* dialog.accept();
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("PlaywrightFileChooser", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML = "<input type=\"file\" id=\"fileinput\" />";
      });

      const fileChooserFiber = yield* F.pipe(
        page
          .eventStream("filechooser"),
        Stream.runHead,
        Effect.fork
      );

      yield* page.locator("#fileinput").click();

      const fileChooser = yield* Fiber.join(fileChooserFiber).pipe(
        Effect.flatten,
      );

      assert((yield* fileChooser.isMultiple) === false);
      assert(fileChooser.element() !== null);
    }, PlaywrightEnvironment.withBrowser),
  );

  it.scoped("PlaywrightDownload", Effect.fn(function* () {
      const browser = yield* PlaywrightBrowser;
      const page = yield* browser.newPage();

      yield* page.evaluate(() => {
        document.body.innerHTML =
          "<a text=\"Download\" id=\"download\" href=\"data:application/octet-stream,hello world\" download=\"test.txt\">Download</a>";
      });

      const downloadFiber = yield* F.pipe(
        page.eventStream("download"),
        Stream.runHead,
        Effect.fork
      );

      yield* page.locator("#download").click();

      const download = yield* Fiber.join(downloadFiber).pipe(Effect.flatten);

      assert((yield* download.suggestedFilename) === "test.txt");
      const url = yield* download.url;
      assert(url.startsWith("data:"));
    }, PlaywrightEnvironment.withBrowser),
  );
});
