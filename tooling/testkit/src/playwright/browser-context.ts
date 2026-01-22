import { Context, Effect, identity, Stream } from "effect";
import type {
  BrowserContext,
  ConsoleMessage,
  Dialog,
  Page,
  Request,
  Response,
  WebError,
  Worker,
} from "playwright-core";
import { PlaywrightDialog, PlaywrightRequest, PlaywrightResponse, PlaywrightWorker } from "./common";
import type { PlaywrightError } from "./errors";
import { PlaywrightPage } from "./page";
import type { PatchedEvents } from "./playwright-types";
import { useHelper } from "./utils";

interface BrowserContextEvents {
  backgroundpage: Page;
  close: BrowserContext;
  console: ConsoleMessage;
  dialog: Dialog;
  page: Page;
  request: Request;
  requestfailed: Request;
  requestfinished: Request;
  response: Response;
  serviceworker: Worker;
  weberror: WebError;
}

const eventMappings = {
  backgroundpage: (page: Page) => PlaywrightPage.make(page),
  close: (context: BrowserContext) => PlaywrightBrowserContext.make(context),
  console: identity<ConsoleMessage>,
  dialog: (dialog: Dialog) => PlaywrightDialog.make(dialog),
  page: (page: Page) => PlaywrightPage.make(page),
  request: (request: Request) => PlaywrightRequest.make(request),
  requestfailed: (request: Request) => PlaywrightRequest.make(request),
  requestfinished: (request: Request) => PlaywrightRequest.make(request),
  response: (response: Response) => PlaywrightResponse.make(response),
  serviceworker: (worker: Worker) => PlaywrightWorker.make(worker),
  weberror: identity<WebError>,
} as const;

type BrowserContextWithPatchedEvents = PatchedEvents<BrowserContext, BrowserContextEvents>;

/**
 * @category model
 * @since 0.1.0
 */
export interface PlaywrightBrowserContextService {
  /**
   * Returns the list of all open pages in the browser context.
   *
   * @see {@link BrowserContext.pages}
   * @since 0.1.0
   */
  readonly pages: Effect.Effect<Array<typeof PlaywrightPage.Service>>;
  /**
   * Opens a new page in the browser context.
   *
   * @example
   * ```ts
   * const page = yield* context.newPage;
   * ```
   *
   * @see {@link BrowserContext.newPage}
   * @since 0.1.0
   */
  readonly newPage: Effect.Effect<typeof PlaywrightPage.Service, PlaywrightError>;
  /**
   * Closes the browser context.
   *
   * @see {@link BrowserContext.close}
   * @since 0.1.0
   */
  readonly close: Effect.Effect<void, PlaywrightError>;

  /**
   * Creates a stream of the given event from the browser context.
   *
   * @example
   * ```ts
   * const pageStream = context.eventStream("page");
   * ```
   *
   * @category custom
   * @see {@link BrowserContext.on}
   * @since 0.1.2
   */
  readonly eventStream: <K extends keyof typeof eventMappings>(
    event: K
  ) => Stream.Stream<ReturnType<(typeof eventMappings)[K]>>;
}

/**
 * @category tag
 */
export class PlaywrightBrowserContext extends Context.Tag("effect-playwright/PlaywrightBrowserContext")<
  PlaywrightBrowserContext,
  PlaywrightBrowserContextService
>() {
  /**
   * Creates a `PlaywrightBrowserContext` from a Playwright `BrowserContext` instance.
   *
   * @param context - The Playwright `BrowserContext` instance to wrap.
   * @since 0.1.0
   */
  static make(context: BrowserContextWithPatchedEvents): PlaywrightBrowserContextService {
    const use = useHelper(context);
    return PlaywrightBrowserContext.of({
      pages: Effect.sync(() => context.pages().map(PlaywrightPage.make)),
      newPage: use((c) => c.newPage().then(PlaywrightPage.make)),
      close: use((c) => c.close()),
      eventStream: <K extends keyof BrowserContextEvents>(event: K) =>
        Stream.asyncPush<BrowserContextEvents[K]>((emit) =>
          Effect.acquireRelease(
            Effect.sync(() => {
              context.on(event, emit.single);
              context.once("close", emit.end);
            }),
            () =>
              Effect.sync(() => {
                context.off(event, emit.single);
                context.off("close", emit.end);
              })
          )
        ).pipe(
          Stream.map((e) => {
            const mapping = eventMappings[event];
            // biome-ignore lint/suspicious/noExplicitAny: Don't know how to fix this …
            return mapping(e as any) as ReturnType<(typeof eventMappings)[K]>;
          })
        ),
    });
  }
}
