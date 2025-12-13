# @beep/scraper

Effect-based web crawler built on Playwright for parallel link discovery and extraction.

## Purpose

This tooling package provides a configurable, concurrent web crawler with proper resource management, depth-limited traversal, and structured JSON output. It's designed as a development tool for documentation crawling, sitemap generation, or link validation within the beep-effect monorepo.

The scraper implements a breadth-first crawl using Effect-based concurrency with bounded queues, worker pools, and scoped resource management for browser lifecycle handling.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/scraper": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `PlaywrightBrowser` | Context.Tag wrapping a Playwright Browser instance |
| `PlaywrightBrowserLive` | Layer providing scoped browser lifecycle (launch → close) |
| `PlaywrightError` | Tagged error for browser launch/page creation failures |
| `PageLoadError` | Tagged error for navigation timeouts or network errors |
| `LinkExtractionError` | Tagged error for DOM query failures |


## Usage

### Configuration

Edit the configuration constants at the top of `src/links.ts`:

```typescript
const WEB_URL = "https://developers.notion.com/";  // Starting URL
const MAX_DEPTH = 10;                               // Maximum depth from start
const CONCURRENCY = 5;                              // Worker pool size
const QUEUE_SIZE = 4096;                            // Bounded queue capacity
const WORKER_TIMEOUT = "5 seconds";                 // Idle timeout before worker exits
```

### Running the Crawler

```bash
cd tooling/scraper
bun run src/links.ts
```

The crawler launches a headless Chromium browser, performs breadth-first crawling with configurable depth limits, and outputs results to `crawled-links.json`.

### Basic Example

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { PlaywrightBrowser, PlaywrightBrowserLive } from "@beep/scraper";

const program = Effect.gen(function* () {
  const browser = yield* PlaywrightBrowser;
  const page = yield* Effect.promise(() => browser.newPage());

  yield* Effect.tryPromise({
    try: () => page.goto("https://example.com"),
    catch: (e) => new PageLoadError({ url: "https://example.com", cause: e }),
  });

  // Extract links and process...

  yield* Effect.promise(() => page.close());
});

const runnable = program.pipe(
  Effect.provide(PlaywrightBrowserLive)
);
```


### Worker Pool Pattern

```typescript
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as HashSet from "effect/HashSet";
import * as F from "effect/Function";
import * as O from "effect/Option";

const crawlWorker = (
  queue: Queue.Queue<string>,
  visited: Ref.Ref<HashSet.HashSet<string>>
) =>
  Effect.gen(function* () {
    const browser = yield* PlaywrightBrowser;

    while (true) {
      const maybeUrl = yield* F.pipe(
        Queue.take(queue),
        Effect.timeout("5 seconds"),
        Effect.option
      );

      if (O.isNone(maybeUrl)) break;

      const url = maybeUrl.value;
      const alreadyVisited = yield* Ref.modify(visited, (set) =>
        HashSet.has(set, url)
          ? [true, set]
          : [false, HashSet.add(set, url)]
      );

      if (alreadyVisited) continue;

      // Process URL...
    }
  });
```


## Dependencies

| Package | Purpose |
|---------|---------|
| `playwright` | Headless browser automation for web scraping |
| `@beep/tooling-utils` | FsUtils for JSON file writing |
| `@beep/schema` | Schema validation utilities |
| `@effect/platform` | Platform services (Path) |
| `@effect/platform-bun` | Bun runtime context |

## Integration

This package is primarily used as a standalone CLI tool within the monorepo for:
- Crawling documentation sites to generate sitemaps
- Validating link integrity across documentation
- Extracting structured link data for analysis

It uses `@beep/tooling-utils` for file system operations and follows Effect-first patterns for all async operations.

## Development

```bash
# Type check
bun run --filter @beep/scraper check

# Lint
bun run --filter @beep/scraper lint

# Fix lint issues
bun run --filter @beep/scraper lint:fix

# Run tests
bun run --filter @beep/scraper test

# Run the crawler
cd tooling/scraper
bun run src/links.ts
```

## Notes

### Architecture Patterns

The crawler implements several Effect patterns:
- **Scoped resources**: Browser lifecycle managed via `Effect.acquireRelease`
- **Bounded queues**: `Queue.bounded` prevents memory overflow
- **Worker pools**: Concurrent workers process URLs from a shared queue
- **Atomic state**: `Ref<HashSet>` for thread-safe visited URL tracking
- **Tagged errors**: Structured error handling for browser, page load, and extraction failures

### Configuration

All configuration is done via constants at the top of `src/links.ts`:
- `WEB_URL`: Starting crawl URL
- `MAX_DEPTH`: Maximum depth from starting URL
- `CONCURRENCY`: Number of concurrent workers (default: 5)
- `QUEUE_SIZE`: Bounded queue capacity (default: 4096)
- `WORKER_TIMEOUT`: Worker idle timeout before exit

### Output

Results are written to `crawled-links.json` with metadata including crawl timestamp, base URL, max depth, and total link count.

### Playwright Installation

If browser launch fails, install Playwright browsers:
```bash
bunx playwright install chromium
```
