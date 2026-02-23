# @beep/scraper Agent Guide

## Purpose & Fit
- Provides Effect-based web scraping utilities using Playwright
- Implements concurrent crawling with bounded queues and worker pools
- Tagged error handling for scraping failures (browser launch, page load, link extraction)
- Uses Effect resource management for proper browser lifecycle handling

## Surface Map
- **`src/links.ts`** — Main web crawler implementation
  - Concurrent link extraction with configurable depth limits
  - Queue-based worker pool pattern with Effect primitives
  - Browser resource management via `Effect.acquireRelease`
  - Link normalization and same-domain filtering
  - Tagged errors: `PlaywrightError`, `PageLoadError`, `LinkExtractionError`
  - Services: `PlaywrightBrowser` context tag with scoped lifecycle
- **Configuration constants**:
  - `WEB_URL` — Starting crawl URL
  - `MAX_DEPTH` — Maximum crawl depth from start
  - `CONCURRENCY` — Number of concurrent workers
  - `QUEUE_SIZE` — Bounded queue capacity
  - `WORKER_TIMEOUT` — Worker idle timeout

## Usage Snapshots
- Link crawler for documentation sites
- Configurable concurrent scraping with depth limiting
- Resource-safe browser management via Effect scopes
- Queue-based work distribution across workers

## Authoring Guardrails
- All async operations must use `Effect.tryPromise` with tagged errors
- Browser lifecycle managed via `Effect.acquireRelease` in scoped layers
- Use `Queue.bounded` for work distribution, never unbounded queues
- Workers should respect `WORKER_TIMEOUT` to detect completion
- Link extraction must handle null/undefined hrefs safely via `P.isNotNullable`
- URL normalization should strip hash fragments and validate protocols
- Maintain namespace imports: `import * as Effect from "effect/Effect"`, `import * as Queue from "effect/Queue"`
- Avoid native Array/String methods; use `A.*`, `Str.*` from Effect
- Use `HashSet` for visited URL tracking, never native Set
- Page interactions must use Playwright's Promise-based APIs wrapped in `Effect.tryPromise`
- Error handling via `S.TaggedError` with meaningful context (URL, cause)

## Quick Recipes

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as HashSet from "effect/HashSet";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { chromium } from "playwright";
import type { Browser } from "playwright";

// Browser service with resource management
class PlaywrightBrowser extends Context.Tag("PlaywrightBrowser")<PlaywrightBrowser, Browser>() {}

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
```

```typescript
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as HashSet from "effect/HashSet";
import type { Page } from "playwright";

// Worker pattern with bounded queue
const crawlWorker = (
  queue: Queue.Queue<string>,
  visited: Ref.Ref<HashSet.HashSet<string>>,
  depth: number
) =>
  Effect.gen(function* () {
    const browser = yield* PlaywrightBrowser;
    const page = yield* Effect.promise(() => browser.newPage());

    while (true) {
      const maybeUrl = yield* Queue.poll(queue);
      if (O.isNone(maybeUrl)) break;

      const url = maybeUrl.value;
      const alreadyVisited = yield* Ref.modify(visited, (set) =>
        HashSet.has(set, url)
          ? [true, set]
          : [false, HashSet.add(set, url)]
      );

      if (alreadyVisited) continue;

      // Process page...
    }
  });
```

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import type { Page } from "playwright";

// Link extraction with error handling
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
```

## Dependencies

- `playwright` — Browser automation
- `@beep/tooling-utils` — Filesystem and repository utilities
- `@beep/schema` — Schema validation
- `@effect/platform` — Platform services
- `@effect/platform-bun` — Bun runtime
- `effect` — Effect runtime

## Verifications
- `bun run lint --filter @beep/scraper`
- `bun run check --filter @beep/scraper`
- `bun run test --filter @beep/scraper`

## Contributor Checklist
- [ ] All Playwright operations wrapped in `Effect.tryPromise` or `Effect.promise`
- [ ] Browser lifecycle uses `Effect.acquireRelease` pattern
- [ ] Workers respect bounded queues and timeouts
- [ ] URL tracking uses `HashSet`, not native Set
- [ ] Namespace imports maintained (`import * as Effect from "effect/Effect"`)
- [ ] Tagged errors provide meaningful context (URL, depth, cause)
- [ ] No native Array/String methods; use Effect utilities
- [ ] Resource cleanup guaranteed via scoped layers
- [ ] Concurrency limits enforced via worker pool size
- [ ] Ran `bun run lint` and `bun run check` before committing
