import { Readable } from "node:stream";
import { Data, Effect, Option, Stream } from "effect";
import type { Dialog, Download, ElementHandle, FileChooser, Request, Response, Worker } from "playwright-core";
import { makePage } from "./_page-registry";
import { type PlaywrightError, wrapError } from "./errors";
import { PlaywrightFrame, type PlaywrightFrameService } from "./frame";
import type { PlaywrightPageService } from "./page";
import type { PageFunction } from "./playwright-types";
import { useHelper } from "./utils";

/**
 * @category model
 * @since 0.1.2
 */
export class PlaywrightRequest extends Data.TaggedClass("PlaywrightRequest")<{
  allHeaders: Effect.Effect<Awaited<ReturnType<Request["allHeaders"]>>, PlaywrightError>;
  failure: () => Option.Option<NonNullable<ReturnType<Request["failure"]>>>;
  frame: Effect.Effect<PlaywrightFrameService>;
  headerValue: (name: string) => Effect.Effect<Option.Option<string>, PlaywrightError>;
  headers: Effect.Effect<ReturnType<Request["headers"]>>;
  headersArray: Effect.Effect<Awaited<ReturnType<Request["headersArray"]>>, PlaywrightError>;
  isNavigationRequest: Effect.Effect<boolean>;
  method: Effect.Effect<string>;
  postData: () => Option.Option<string>;
  postDataBuffer: () => Option.Option<NonNullable<ReturnType<Request["postDataBuffer"]>>>;
  postDataJSON: Effect.Effect<
    Option.Option<NonNullable<Awaited<ReturnType<Request["postDataJSON"]>>>>,
    PlaywrightError
  >;
  redirectedFrom: () => Option.Option<PlaywrightRequest>;
  redirectedTo: () => Option.Option<PlaywrightRequest>;
  resourceType: Effect.Effect<ReturnType<Request["resourceType"]>>;
  response: Effect.Effect<Option.Option<PlaywrightResponse>, PlaywrightError>;
  serviceWorker: () => Option.Option<PlaywrightWorker>;
  sizes: Effect.Effect<Awaited<ReturnType<Request["sizes"]>>, PlaywrightError>;
  timing: Effect.Effect<ReturnType<Request["timing"]>>;
  url: Effect.Effect<string>;
}> {
  static make(request: Request): PlaywrightRequest {
    const use = useHelper(request);

    return new PlaywrightRequest({
      allHeaders: use(() => request.allHeaders()),
      failure: Option.liftNullable(request.failure),
      frame: Effect.sync(() => PlaywrightFrame.make(request.frame())),
      headerValue: (name) => use(() => request.headerValue(name)).pipe(Effect.map(Option.fromNullable)),
      headers: Effect.sync(() => request.headers()),
      headersArray: use(() => request.headersArray()),
      isNavigationRequest: Effect.sync(() => request.isNavigationRequest()),
      method: Effect.sync(() => request.method()),
      postData: Option.liftNullable(request.postData),
      postDataBuffer: Option.liftNullable(request.postDataBuffer),
      postDataJSON: use(() => request.postDataJSON()).pipe(Effect.map(Option.fromNullable)),
      redirectedFrom: (): Option.Option<PlaywrightRequest> =>
        Option.fromNullable(request.redirectedFrom()).pipe(Option.map(PlaywrightRequest.make)),
      redirectedTo: (): Option.Option<PlaywrightRequest> =>
        Option.fromNullable(request.redirectedTo()).pipe(Option.map(PlaywrightRequest.make)),
      resourceType: Effect.sync(() => request.resourceType()),
      response: use(() => request.response()).pipe(
        Effect.map(Option.fromNullable),
        Effect.map(Option.map(PlaywrightResponse.make))
      ),
      serviceWorker: () => Option.fromNullable(request.serviceWorker()).pipe(Option.map(PlaywrightWorker.make)),
      sizes: use(() => request.sizes()),
      timing: Effect.sync(() => request.timing()),
      url: Effect.sync(() => request.url()),
    });
  }
}

/**
 * @category model
 * @since 0.1.2
 */
export class PlaywrightResponse extends Data.TaggedClass("PlaywrightResponse")<{
  allHeaders: Effect.Effect<Awaited<ReturnType<Response["allHeaders"]>>, PlaywrightError>;
  body: Effect.Effect<Awaited<ReturnType<Response["body"]>>, PlaywrightError>;
  finished: Effect.Effect<Awaited<ReturnType<Response["finished"]>>, PlaywrightError>;
  frame: Effect.Effect<PlaywrightFrameService>;
  fromServiceWorker: Effect.Effect<boolean>;
  headers: Effect.Effect<ReturnType<Response["headers"]>>;
  headersArray: Effect.Effect<Awaited<ReturnType<Response["headersArray"]>>, PlaywrightError>;
  headerValue: (name: string) => Effect.Effect<Option.Option<string>, PlaywrightError>;
  headerValues: (name: string) => Effect.Effect<Awaited<ReturnType<Response["headerValues"]>>, PlaywrightError>;
  json: Effect.Effect<Awaited<ReturnType<Response["json"]>>, PlaywrightError>;
  ok: Effect.Effect<boolean>;
  request: () => PlaywrightRequest;
  securityDetails: Effect.Effect<
    Option.Option<NonNullable<Awaited<ReturnType<Response["securityDetails"]>>>>,
    PlaywrightError
  >;
  serverAddr: Effect.Effect<Option.Option<NonNullable<Awaited<ReturnType<Response["serverAddr"]>>>>, PlaywrightError>;
  status: Effect.Effect<number>;
  statusText: Effect.Effect<string>;
  text: Effect.Effect<Awaited<ReturnType<Response["text"]>>, PlaywrightError>;
  url: Effect.Effect<string>;
}> {
  static make(response: Response) {
    const use = useHelper(response);

    return new PlaywrightResponse({
      allHeaders: use(() => response.allHeaders()),
      body: use(() => response.body()),
      finished: use(() => response.finished()),
      frame: Effect.sync(() => PlaywrightFrame.make(response.frame())),
      fromServiceWorker: Effect.sync(() => response.fromServiceWorker()),
      headers: Effect.sync(() => response.headers()),
      headersArray: use(() => response.headersArray()),
      headerValue: (name) => use(() => response.headerValue(name)).pipe(Effect.map(Option.fromNullable)),
      headerValues: (name) => use(() => response.headerValues(name)),
      json: use(() => response.json()),
      ok: Effect.sync(() => response.ok()),
      request: () => PlaywrightRequest.make(response.request()),
      securityDetails: use(() => response.securityDetails()).pipe(Effect.map(Option.fromNullable)),
      serverAddr: use(() => response.serverAddr()).pipe(Effect.map(Option.fromNullable)),
      status: Effect.sync(() => response.status()),
      statusText: Effect.sync(() => response.statusText()),
      text: use(() => response.text()),
      url: Effect.sync(() => response.url()),
    });
  }
}

/**
 * @category model
 * @since 0.1.2
 */
export class PlaywrightWorker extends Data.TaggedClass("PlaywrightWorker")<{
  evaluate: <R, Arg = void>(pageFunction: PageFunction<Arg, R>, arg?: Arg) => Effect.Effect<R, PlaywrightError>;
  url: Effect.Effect<string>;
}> {
  static make(worker: Worker) {
    const use = useHelper(worker);

    return new PlaywrightWorker({
      // biome-ignore lint/suspicious/noExplicitAny: no idea how to type this.. but it's implementation only here
      evaluate: (f, arg) => use((w) => w.evaluate(f as any, arg)),
      url: Effect.sync(() => worker.url()),
    });
  }
}

/**
 * @category model
 * @since 0.1.2
 */
export class PlaywrightDialog extends Data.TaggedClass("PlaywrightDialog")<{
  accept: (promptText?: string) => Effect.Effect<void, PlaywrightError>;
  defaultValue: Effect.Effect<string>;
  dismiss: Effect.Effect<void, PlaywrightError>;
  message: Effect.Effect<string>;
  page: () => Option.Option<PlaywrightPageService>;
  type: Effect.Effect<string>;
}> {
  static make(dialog: Dialog) {
    const use = useHelper(dialog);

    return new PlaywrightDialog({
      accept: (promptText) => use(() => dialog.accept(promptText)),
      defaultValue: Effect.sync(() => dialog.defaultValue()),
      dismiss: use(() => dialog.dismiss()),
      message: Effect.sync(() => dialog.message()),
      page: () => Option.fromNullable(dialog.page()).pipe(Option.map(makePage<PlaywrightPageService>)),
      type: Effect.sync(() => dialog.type()),
    });
  }
}

/**
 * @category model
 * @since 0.1.2
 */
export class PlaywrightFileChooser extends Data.TaggedClass("PlaywrightFileChooser")<{
  element: () => ElementHandle;
  isMultiple: Effect.Effect<boolean>;
  page: () => PlaywrightPageService;
  setFiles: (
    files: Parameters<FileChooser["setFiles"]>[0],
    options?: Parameters<FileChooser["setFiles"]>[1]
  ) => Effect.Effect<void, PlaywrightError>;
}> {
  static make(fileChooser: FileChooser) {
    const use = useHelper(fileChooser);

    return new PlaywrightFileChooser({
      element: () => fileChooser.element(),
      isMultiple: Effect.sync(() => fileChooser.isMultiple()),
      page: () => makePage<PlaywrightPageService>(fileChooser.page()),
      setFiles: (files, options) => use(() => fileChooser.setFiles(files, options)),
    });
  }
}

/**
 * @category model
 * @since 0.1.2
 */
export class PlaywrightDownload extends Data.TaggedClass("PlaywrightDownload")<{
  cancel: Effect.Effect<void, PlaywrightError>;
  /**
   * Creates a stream of the download data.
   * @category custom
   * @since 0.2.0
   */
  stream: Stream.Stream<Uint8Array, PlaywrightError>;
  delete: Effect.Effect<void, PlaywrightError>;
  failure: Effect.Effect<Option.Option<string | null>, PlaywrightError>;
  page: () => PlaywrightPageService;
  path: Effect.Effect<Option.Option<string | null>, PlaywrightError>;
  saveAs: (path: string) => Effect.Effect<void, PlaywrightError>;
  suggestedFilename: Effect.Effect<string>;
  url: Effect.Effect<string>;
  use: <R>(f: (download: Download) => Promise<R>) => Effect.Effect<R, PlaywrightError>;
}> {
  static make(download: Download) {
    const use = useHelper(download);

    return new PlaywrightDownload({
      cancel: use(() => download.cancel()),
      stream: use(() => download.createReadStream().then((s) => Readable.toWeb(s))).pipe(
        Effect.map((s) => Stream.fromReadableStream(() => s as unknown as ReadableStream<Uint8Array>, wrapError)),
        Stream.unwrap
      ),
      delete: use(() => download.delete()),
      failure: use(() => download.failure()).pipe(Effect.map(Option.fromNullable)),
      page: () => makePage<PlaywrightPageService>(download.page()),
      path: use(() => download.path()).pipe(Effect.map(Option.fromNullable)),
      saveAs: (path) => use(() => download.saveAs(path)),
      suggestedFilename: Effect.sync(() => download.suggestedFilename()),
      url: Effect.sync(() => download.url()),
      use,
    });
  }
}
