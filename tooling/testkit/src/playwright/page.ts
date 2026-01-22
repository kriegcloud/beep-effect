import { Context, Effect, identity, Stream } from "effect";
import type { ConsoleMessage, Dialog, Download, FileChooser, Frame, Page, WebSocket } from "playwright-core";
import { registerPageMaker } from "./_page-registry";
import {
  PlaywrightDialog,
  PlaywrightDownload,
  PlaywrightFileChooser,
  PlaywrightFrame,
  PlaywrightRequest,
  PlaywrightResponse,
  PlaywrightWorker,
} from "./common";
import type { PlaywrightError } from "./errors";
import { PlaywrightLocator } from "./locator";
import type { PageFunction } from "./playwright-types";
import { useHelper } from "./utils";
export interface PlaywrightPageService {
  /**
   * Navigates the page to the given URL.
   *
   * @example
   * ```ts
   * yield* page.goto("https://google.com");
   * ```
   *
   * @see {@link Page.goto}
   * @since 0.1.0
   */
  readonly goto: (url: string, options?: Parameters<Page["goto"]>[1]) => Effect.Effect<void, PlaywrightError.Type>;
  /**
   * Waits for the page to navigate to the given URL.
   *
   * @example
   * ```ts
   * yield* page.waitForURL("https://google.com");
   * ```
   *
   * @see {@link Page.waitForURL}
   * @since 0.1.0
   */
  readonly waitForURL: (
    url: Parameters<Page["waitForURL"]>[0],
    options?: Parameters<Page["waitForURL"]>[1]
  ) => Effect.Effect<void, PlaywrightError.Type>;
  /**
   * Evaluates a function in the context of the page.
   *
   * @example
   * ```ts
   * const dimensions = yield* page.evaluate(() => ({
   *   width: document.documentElement.clientWidth,
   *   height: document.documentElement.clientHeight
   * }));
   * ```
   *
   * @see {@link Page.evaluate}
   * @since 0.1.0
   */
  readonly evaluate: <R, Arg = void>(
    pageFunction: PageFunction<Arg, R>,
    arg?: Arg
  ) => Effect.Effect<R, PlaywrightError.Type>;
  /**
   * Returns the page title.
   *
   * @example
   * ```ts
   * const title = yield* page.title;
   * ```
   *
   * @see {@link Page.title}
   * @since 0.1.0
   */
  readonly title: Effect.Effect<string, PlaywrightError.Type>;
  /**
   * A generic utility to execute any promise-based method on the underlying Playwright `Page`.
   * Can be used to access any Page functionality not directly exposed by this service.
   *
   * @example
   * ```ts
   * const title = yield* page.use((p) => p.title());
   * ```
   *
   * @see {@link Page}
   * @since 0.1.0
   */
  readonly use: <T>(f: (page: Page) => Promise<T>) => Effect.Effect<T, PlaywrightError.Type>;
  /**
   * Returns a locator for the given selector.
   *
   * @see {@link Page.locator}
   * @since 0.1.0
   */
  readonly locator: (selector: string, options?: Parameters<Page["locator"]>[1]) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given role.
   *
   * @see {@link Page.getByRole}
   * @since 0.1.0
   */
  readonly getByRole: (
    role: Parameters<Page["getByRole"]>[0],
    options?: Parameters<Page["getByRole"]>[1]
  ) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given text.
   *
   * @see {@link Page.getByText}
   * @since 0.1.0
   */
  readonly getByText: (
    text: Parameters<Page["getByText"]>[0],
    options?: Parameters<Page["getByText"]>[1]
  ) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given label.
   *
   * @see {@link Page.getByLabel}
   * @since 0.1.0
   */
  readonly getByLabel: (
    label: Parameters<Page["getByLabel"]>[0],
    options?: Parameters<Page["getByLabel"]>[1]
  ) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given test id.
   *
   * @see {@link Page.getByTestId}
   * @since 0.1.0
   */
  readonly getByTestId: (testId: Parameters<Page["getByTestId"]>[0]) => typeof PlaywrightLocator.Service;

  /**
   * Reloads the page.
   *
   * @see {@link Page.reload}
   * @since 0.1.0
   */
  readonly reload: Effect.Effect<void, PlaywrightError.Type>;
  /**
   * Closes the page.
   *
   * @see {@link Page.close}
   * @since 0.1.0
   */
  readonly close: Effect.Effect<void, PlaywrightError.Type>;

  /**
   * Returns the current URL of the page.
   *
   * @example
   * ```ts
   * const url = yield* page.url;
   * ```
   *
   * @see {@link Page.url}
   * @since 0.1.0
   */
  readonly url: Effect.Effect<string, PlaywrightError.Type>;

  /**
   * Creates a stream of the given event from the page.
   *
   * @example
   * ```ts
   * const consoleStream = page.eventStream("console");
   * ```
   *
   * @see {@link Page.on}
   * @since 0.1.0
   */
  readonly eventStream: <K extends keyof typeof eventMappings>(
    event: K
  ) => Stream.Stream<ReturnType<(typeof eventMappings)[K]>>;
}

/**
 * @category tag
 */
export class PlaywrightPage extends Context.Tag("effect-playwright/PlaywrightPage")<
  PlaywrightPage,
  PlaywrightPageService
>() {
  /**
   * Creates a `PlaywrightPage` from a Playwright `Page` instance.
   *
   * @param page - The Playwright `Page` instance to wrap.
   * @since 0.1.0
   */
  static make(page: PageWithPatchedEvents): PlaywrightPageService {
    const use = useHelper(page);

    return PlaywrightPage.of({
      goto: (url, options) => use((p) => p.goto(url, options)),
      waitForURL: (url, options) => use((p) => p.waitForURL(url, options)),
      title: use((p) => p.title()),
      evaluate: <R, Arg>(f: PageFunction<Arg, R>, arg?: Arg) => use((p) => p.evaluate(f, arg as Arg)),
      locator: (selector, options) => PlaywrightLocator.make(page.locator(selector, options)),
      getByRole: (role, options) => PlaywrightLocator.make(page.getByRole(role, options)),
      getByText: (text, options) => PlaywrightLocator.make(page.getByText(text, options)),
      getByLabel: (label, options) => PlaywrightLocator.make(page.getByLabel(label, options)),
      getByTestId: (testId) => PlaywrightLocator.make(page.getByTestId(testId)),
      url: Effect.sync(() => page.url()),
      reload: use((p) => p.reload()),
      close: use((p) => p.close()),
      eventStream: <K extends PageEvent>(event: K) =>
        Stream.asyncPush<PageEvents[K]>((emit) =>
          Effect.acquireRelease(
            Effect.sync(() => {
              const callback = emit.single;
              const closeCallback = emit.end;
              page.on(event, callback);
              page.once("close", closeCallback);

              return { callback, closeCallback };
            }),
            ({ callback, closeCallback }) =>
              Effect.sync(() => {
                page.off(event, callback);
                page.off("close", closeCallback);
              })
          )
        ).pipe(
          Stream.map((e) => {
            const mapper = eventMappings[event] as (arg: PageEvents[K]) => ReturnType<(typeof eventMappings)[K]>;
            return mapper(e);
          })
        ),
      use,
    });
  }
}

interface PageEvents {
  close: Page;
  console: ConsoleMessage;
  crash: Page;
  dialog: Dialog;
  domcontentloaded: Page;
  download: Download;
  filechooser: FileChooser;
  frameattached: Frame;
  framedetached: Frame;
  framenavigated: Frame;
  load: Page;
  pageerror: Error;
  popup: Page;
  request: Request;
  requestfailed: Request;
  requestfinished: Request;
  response: Response;
  websocket: WebSocket;
  worker: Worker;
}

type PageEvent = keyof PageEvents;

const eventMappings = {
  close: PlaywrightPage.make,
  console: identity<ConsoleMessage>,
  crash: PlaywrightPage.make,
  dialog: PlaywrightDialog.make,
  domcontentloaded: PlaywrightPage.make,
  download: PlaywrightDownload.make,
  filechooser: PlaywrightFileChooser.make,
  frameattached: PlaywrightFrame.make,
  framedetached: PlaywrightFrame.make,
  framenavigated: PlaywrightFrame.make,
  load: PlaywrightPage.make,
  pageerror: identity<Error>,
  popup: PlaywrightPage.make,
  request: PlaywrightRequest.make,
  requestfailed: PlaywrightRequest.make,
  requestfinished: PlaywrightRequest.make,
  response: PlaywrightResponse.make,
  websocket: identity<WebSocket>,
  worker: PlaywrightWorker.make,
} as const;

/**
 * Page interface with generic on/off methods.
 * Playwright's Page uses overloads for on/off, making generic event handling impossible.
 * This interface provides a unified signature for our event map.
 * @internal
 */
interface PageWithPatchedEvents extends Page {
  on<K extends PageEvent>(event: K, listener: (arg: PageEvents[K]) => void): this;
  off<K extends PageEvent>(event: K, listener: (arg: PageEvents[K]) => void): this;
}

// Register the page maker to break circular dependency with common.ts
registerPageMaker(PlaywrightPage.make);
