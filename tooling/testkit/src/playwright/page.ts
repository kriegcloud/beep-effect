import { Context, Effect, identity, Stream } from "effect";
import type {
  ConsoleMessage,
  Dialog,
  Download,
  FileChooser,
  Frame,
  Page,
  Request,
  Response,
  WebSocket,
  Worker,
} from "playwright-core";

import { registerPageMaker } from "./_page-registry";
import {
  PlaywrightDialog,
  PlaywrightDownload,
  PlaywrightFileChooser,
  PlaywrightRequest,
  PlaywrightResponse,
  PlaywrightWorker,
} from "./common";

import type { PlaywrightError } from "./errors";
import { PlaywrightFrame } from "./frame";
import { PlaywrightLocator } from "./locator";
import type { PageFunction, PatchedEvents } from "./playwright-types";
import { useHelper } from "./utils";

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

const eventMappings = {
  close: (page: Page) => PlaywrightPage.make(page),
  console: identity<ConsoleMessage>,
  crash: (page: Page) => PlaywrightPage.make(page),
  dialog: (dialog: Dialog) => PlaywrightDialog.make(dialog),
  domcontentloaded: (page: Page) => PlaywrightPage.make(page),
  download: (download: Download) => PlaywrightDownload.make(download),
  filechooser: (fileChooser: FileChooser) => PlaywrightFileChooser.make(fileChooser),
  frameattached: (frame: Frame) => PlaywrightFrame.make(frame),
  framedetached: (frame: Frame) => PlaywrightFrame.make(frame),
  framenavigated: (frame: Frame) => PlaywrightFrame.make(frame),
  load: (page: Page) => PlaywrightPage.make(page),
  pageerror: identity<Error>,
  popup: (page: Page) => PlaywrightPage.make(page),
  request: (request: Request) => PlaywrightRequest.make(request),
  requestfailed: (request: Request) => PlaywrightRequest.make(request),
  requestfinished: (request: Request) => PlaywrightRequest.make(request),
  response: (response: Response) => PlaywrightResponse.make(response),
  websocket: identity<WebSocket>,
  worker: (worker: Worker) => PlaywrightWorker.make(worker),
} as const;

type PageWithPatchedEvents = PatchedEvents<Page, PageEvents>;

/**
 * @category model
 * @since 0.1.0
 */
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
  readonly goto: (url: string, options?: Parameters<Page["goto"]>[1]) => Effect.Effect<void, PlaywrightError>;
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
  ) => Effect.Effect<void, PlaywrightError>;
  /**
   * Waits for the page to reach the given load state.
   *
   * NOTE: Most of the time, this method is not needed because Playwright auto-waits before every action.
   *
   * @example
   * ```ts
   * yield* page.waitForLoadState("domcontentloaded");
   * ```
   *
   * @see {@link Page.waitForLoadState}
   * @since 0.2.0
   */
  readonly waitForLoadState: (
    state?: Parameters<Page["waitForLoadState"]>[0],
    options?: Parameters<Page["waitForLoadState"]>[1]
  ) => Effect.Effect<void, PlaywrightError>;
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
  ) => Effect.Effect<R, PlaywrightError>;
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
  readonly title: Effect.Effect<string, PlaywrightError>;
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
  readonly use: <T>(f: (page: Page) => Promise<T>) => Effect.Effect<T, PlaywrightError>;
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
  readonly reload: Effect.Effect<void, PlaywrightError>;
  /**
   * Closes the page.
   *
   * @see {@link Page.close}
   * @since 0.1.0
   */
  readonly close: Effect.Effect<void, PlaywrightError>;

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
  readonly url: Effect.Effect<string, PlaywrightError>;

  /**
   * Returns all frames attached to the page.
   *
   * @see {@link Page.frames}
   * @since 0.2.0
   */
  readonly frames: Effect.Effect<ReadonlyArray<typeof PlaywrightFrame.Service>, PlaywrightError>;

  /**
   * Creates a stream of the given event from the page.
   *
   * @example
   * ```ts
   * const consoleStream = page.eventStream("console");
   * ```
   *
   * @category custom
   * @see {@link Page.on}
   * @since 0.1.0
   */
  readonly eventStream: <K extends keyof PageEvents>(event: K) => Stream.Stream<ReturnType<(typeof eventMappings)[K]>>;

  /**
   * Clicks an element matching the given selector.
   *
   * @example
   * ```ts
   * yield* page.click("button#submit");
   * ```
   * @deprecated Use {@link PlaywrightPageService.locator} to create a locator and then call `click` on it instead.
   * @see {@link Page.click}
   * @since 0.1.0
   * @category deprecated
   */
  readonly click: (selector: string, options?: Parameters<Page["click"]>[1]) => Effect.Effect<void, PlaywrightError>;
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
      waitForLoadState: (state, options) => use((p) => p.waitForLoadState(state, options)),
      title: use((p) => p.title()),
      evaluate: <R, Arg>(f: PageFunction<Arg, R>, arg?: Arg) => use((p) => p.evaluate<R, Arg>(f, arg as Arg)),
      locator: (selector, options) => PlaywrightLocator.make(page.locator(selector, options)),
      getByRole: (role, options) => PlaywrightLocator.make(page.getByRole(role, options)),
      getByText: (text, options) => PlaywrightLocator.make(page.getByText(text, options)),
      getByLabel: (label, options) => PlaywrightLocator.make(page.getByLabel(label, options)),
      getByTestId: (testId) => PlaywrightLocator.make(page.getByTestId(testId)),
      url: Effect.sync(() => page.url()),
      frames: use((p) => Promise.resolve(p.frames().map(PlaywrightFrame.make))),
      reload: use((p) => p.reload()),
      close: use((p) => p.close()),
      click: (selector, options) => use((p) => p.click(selector, options)),
      eventStream: <K extends keyof PageEvents>(event: K) =>
        Stream.asyncPush<PageEvents[K]>((emit) =>
          Effect.acquireRelease(
            Effect.sync(() => {
              page.on(event, emit.single);
              page.once("close", emit.end);
            }),
            () =>
              Effect.sync(() => {
                page.off(event, emit.single);
                page.off("close", emit.end);
              })
          )
        ).pipe(
          Stream.map((e) => {
            const mapping = eventMappings[event];
            // biome-ignore lint/suspicious/noExplicitAny: Don't know how to fix this …
            return mapping(e as any) as ReturnType<(typeof eventMappings)[K]>;
          })
        ),
      use,
    });
  }
}

// Register the page maker to break circular dependency with common.ts
registerPageMaker(PlaywrightPage.make);
