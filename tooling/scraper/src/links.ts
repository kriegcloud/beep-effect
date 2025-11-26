import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";

// ============================================================================
// Configuration
// ============================================================================
const WEB_URL = "https://developers.notion.com/";
const MAX_DEPTH = 10; // Maximum depth from starting URL (increase for deeper crawls)
const CONCURRENCY = 5; // Number of concurrent workers
const QUEUE_SIZE = 4096; // Bounded queue size (increased for larger crawls)
const WORKER_TIMEOUT = "5 seconds"; // Timeout before worker checks if queue is empty

// ============================================================================
// Errors
// ============================================================================

class PlaywrightError extends S.TaggedError<PlaywrightError>("PlaywrightError")("PlaywrightError", {
  cause: S.Defect,
}) {}

class PageLoadError extends S.TaggedError<PageLoadError>("PageLoadError")("PageLoadError", {
  url: S.String,
  cause: S.Defect,
}) {}

class LinkExtractionError extends S.TaggedError<LinkExtractionError>("LinkExtractionError")("LinkExtractionError", {
  url: S.String,
  cause: S.Defect,
}) {}

// ============================================================================
// Services
// ============================================================================
class PlaywrightBrowser extends Context.Tag("PlaywrightBrowser")<PlaywrightBrowser, Browser>() {}

// Create browser with proper resource management
const PlaywrightBrowserLive = Layer.scoped(
  PlaywrightBrowser,
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => chromium.launch({ headless: true }),
      catch: (e) => new PlaywrightError({ cause: e }),
    }),
    (browser) => Effect.promise(() => browser.close())
  )
);

// ============================================================================
// Link Extraction & Filtering
// ============================================================================
const extractLinks = (page: Page, currentUrl: string) =>
  Effect.tryPromise({
    try: async () =>
      page.$$eval("a[href]", (anchors) =>
        F.pipe(
          anchors,
          A.map((a) => a.getAttribute("href")),
          A.filter(P.isNotNullable)
        )
      ),
    catch: (e) => new LinkExtractionError({ url: currentUrl, cause: e }),
  });

const normalizeUrl = (href: string, baseUrl: string): string | null => {
  try {
    const url = new URL(href, baseUrl);
    // Remove hash fragments
    url.hash = "";
    // Only keep http/https
    if (!url.protocol.startsWith("http")) return null;
    return url.toString();
  } catch {
    return null;
  }
};

const filterSameDomain = (urls: string[], baseDomain: string): string[] =>
  urls.filter((url) => {
    try {
      return new URL(url).hostname === baseDomain;
    } catch {
      return false;
    }
  });

// ============================================================================
// Types
// ============================================================================
interface QueueItem {
  url: string;
  depth: number;
}

// ============================================================================
// Main Crawler Logic
// ============================================================================
const GetAllLinksRecursively = Effect.gen(function* () {
  const browser = yield* PlaywrightBrowser;
  const baseDomain = new URL(WEB_URL).hostname;

  // Shared state using Ref<HashSet>
  const visitedRef = yield* Ref.make(HashSet.empty<string>());
  const resultsRef = yield* Ref.make(HashSet.empty<string>());
  const processedCountRef = yield* Ref.make(0);
  const activeWorkersRef = yield* Ref.make(0);

  // Work queue with depth tracking
  const urlQueue = yield* Queue.bounded<QueueItem>(QUEUE_SIZE);

  // Seed the queue with initial URL at depth 0
  yield* Queue.offer(urlQueue, { url: WEB_URL, depth: 0 });
  yield* Ref.update(resultsRef, HashSet.add(WEB_URL));

  // Process a single URL
  const processUrl = (item: QueueItem) =>
    Effect.gen(function* () {
      const { url, depth } = item;

      // Check if already visited
      const visited = yield* Ref.get(visitedRef);
      if (HashSet.has(visited, url)) {
        return;
      }

      // Mark as visited atomically
      yield* Ref.update(visitedRef, HashSet.add(url));
      const count = yield* Ref.updateAndGet(processedCountRef, (n) => n + 1);

      yield* Console.log(`[${count}] (depth ${depth}) Processing: ${url}`);

      // Create a new page for this URL
      const page = yield* Effect.acquireRelease(
        Effect.tryPromise({
          try: () => browser.newPage(),
          catch: (e) => new PlaywrightError({ cause: e }),
        }),
        (p) => Effect.promise(() => p.close())
      );

      // Navigate to the page
      yield* Effect.tryPromise({
        try: () => page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }),
        catch: (e) => new PageLoadError({ url, cause: e }),
      });

      // Extract links
      const rawLinks = yield* extractLinks(page, url);

      // Normalize and filter links
      const normalizedLinks = F.pipe(
        rawLinks,
        A.map((href) => normalizeUrl(href, url)),
        A.filter((u): u is string => u !== null)
      );

      const sameDomainLinks = filterSameDomain(normalizedLinks, baseDomain);

      // Get current visited set to filter new links
      const currentVisited = yield* Ref.get(visitedRef);
      const newLinks = F.pipe(
        sameDomainLinks,
        A.filter((link) => !HashSet.has(currentVisited, link))
      );

      // Add to results
      yield* Ref.update(resultsRef, (set) => A.reduce(newLinks, set, (acc, link) => HashSet.add(acc, link)));

      // Queue new links for processing (only if within depth limit)
      const nextDepth = depth + 1;
      if (nextDepth <= MAX_DEPTH) {
        for (const link of newLinks) {
          yield* Queue.offer(urlQueue, { url: link, depth: nextDepth });
        }
      }
    }).pipe(
      Effect.scoped,
      Effect.catchAll((error) => Console.log(`Error processing ${item.url}: ${JSON.stringify(error)}`))
    );

  // Worker that continuously takes from queue until it times out (queue empty)
  const worker = Effect.gen(function* () {
    yield* Ref.update(activeWorkersRef, (n) => n + 1);

    let shouldContinue = true;
    while (shouldContinue) {
      const maybeItem = yield* F.pipe(Queue.take(urlQueue), Effect.timeout(WORKER_TIMEOUT), Effect.option);

      if (maybeItem._tag === "Some") {
        yield* processUrl(maybeItem.value);
      } else {
        // Timeout means queue is likely empty and no more work is coming
        shouldContinue = false;
      }
    }

    yield* Ref.update(activeWorkersRef, (n) => n - 1);
  });

  // Launch worker pool
  const workers = Array.from({ length: CONCURRENCY }, () => worker);
  yield* Effect.all(workers, { concurrency: "unbounded" });

  // Shutdown queue
  yield* Queue.shutdown(urlQueue);

  // Get final results
  const finalResults = yield* Ref.get(resultsRef);
  const processedCount = yield* Ref.get(processedCountRef);

  yield* Console.log(`\nCrawl complete! Processed ${processedCount} pages.`);

  return Array.from(HashSet.values(finalResults));
});

// ============================================================================
// Output Configuration
// ============================================================================
const OUTPUT_FILENAME = "crawled-links.json";

const program = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  const path = yield* Path.Path;

  yield* Console.log(`Starting crawler at: ${WEB_URL}`);
  yield* Console.log(`Max depth: ${MAX_DEPTH}, Concurrency: ${CONCURRENCY}\n`);

  const result = yield* GetAllLinksRecursively;

  yield* Console.log("\n=== All Discovered Links ===\n");
  yield* Console.log(JSON.stringify(result, null, 2));

  // Write results to JSON file
  const outputPath = path.resolve(OUTPUT_FILENAME);
  yield* fsUtils.writeJson(outputPath, {
    crawledAt: new Date().toISOString(),
    baseUrl: WEB_URL,
    maxDepth: MAX_DEPTH,
    totalLinks: result.length,
    links: result,
  });

  yield* Console.log(`\n✓ Results written to: ${outputPath}`);
});

const layers = Layer.mergeAll(BunContext.layer, FsUtilsLive, PlaywrightBrowserLive);

BunRuntime.runMain(
  Effect.scoped(
    program.pipe(
      Effect.provide(layers),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          const msg = String(error);
          yield* Console.log(`\n💥 Program failed: ${msg}`);
          const cause = Cause.fail(error);
          yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);
          return yield* Effect.fail(error);
        })
      )
    )
  )
);
