import { Array, Effect, pipe, Stream } from "effect";
import type { PlaywrightBrowserService } from "../browser";

/**
 * Returns all pages in the browser from all contexts.
 * @category util
 */
export const allPages = (browser: PlaywrightBrowserService) =>
  browser.contexts.pipe(
    Effect.flatMap((contexts) => Effect.all(contexts.map((context) => context.pages))),
    Effect.map(Array.flatten)
  );

/**
 * Returns all frames in the browser from all pages in all contexts.
 * @category util
 */
export const allFrames = (browser: PlaywrightBrowserService) =>
  allPages(browser).pipe(Effect.flatMap((pages) => Effect.all(pages.map((page) => page.frames))));

/**
 * Returns a stream of all framenavigated events for all current and future pages in the browser.
 * In all current contexts (but not future contexts).
 * @category util
 */
export const allFrameNavigatedEventStream = (browser: PlaywrightBrowserService) =>
  Effect.gen(function* () {
    const contexts = yield* browser.contexts;
    const pages = yield* pipe(
      contexts.map((c) => c.pages),
      Effect.all,
      Effect.map(Array.flatten)
    );

    // listen for framenavigated for all current pages
    const currentPages = pages.map((page) => page.eventStream("framenavigated"));

    // and all future pages
    const newPages = pipe(
      contexts.map((c) => c.eventStream("page")),
      Stream.mergeAll({ concurrency: "unbounded" }),
      Stream.flatMap((page) => page.eventStream("framenavigated"), {
        concurrency: "unbounded",
      })
    );

    return Stream.mergeAll([newPages, ...currentPages], {
      concurrency: "unbounded",
    });
  }).pipe(Stream.unwrap);
