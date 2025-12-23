# @beep/scraper

Effect-based web crawler built on Playwright for parallel link discovery and extraction.

## Purpose

This tooling package provides a standalone CLI tool for concurrent web crawling with proper resource management, depth-limited traversal, and structured JSON output. It's designed as a development utility for documentation crawling, sitemap generation, or link validation within the beep-effect monorepo.

The scraper implements a breadth-first crawl using Effect-based concurrency with bounded queues, worker pools, and scoped resource management for browser lifecycle handling.

**Note**: This is a CLI tool, not a reusable library. The package does not export any public APIs for consumption by other packages. All functionality is accessed by running the source files directly.

## Installation

```bash
# Navigate to the scraper directory
cd tooling/scraper

# Install Playwright browsers (first time only)
bunx playwright install chromium
```

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

The crawler:
1. Launches a headless Chromium browser
2. Performs breadth-first crawling starting from `WEB_URL`
3. Respects depth limits (`MAX_DEPTH`)
4. Uses concurrent workers (`CONCURRENCY`) for parallel processing
5. Outputs results to `crawled-links.json` in the current directory

### Output Format

Results are written to `crawled-links.json`:

```json
{
  "crawledAt": "2025-12-23T10:30:00.000Z",
  "baseUrl": "https://developers.notion.com/",
  "maxDepth": 10,
  "totalLinks": 147,
  "links": [
    "https://developers.notion.com/",
    "https://developers.notion.com/reference",
    ...
  ]
}
```

## Implementation Details

The crawler implements several Effect patterns worth studying:

### Scoped Browser Lifecycle

```typescript
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

### Bounded Queue Worker Pool

```typescript
// Work queue with depth tracking
const urlQueue = yield* Queue.bounded<QueueItem>(QUEUE_SIZE);

// Worker pool processes URLs concurrently
const workers = Array.from({ length: CONCURRENCY }, () => worker);
yield* Effect.all(workers, { concurrency: "unbounded" });
```

### Atomic State Management

```typescript
// Shared state using Ref<HashSet> for thread-safe visited tracking
const visitedRef = yield* Ref.make(HashSet.empty<string>());

// Atomic check-and-set to prevent duplicate processing
const visited = yield* Ref.get(visitedRef);
if (HashSet.has(visited, url)) return;
yield* Ref.update(visitedRef, HashSet.add(url));
```

### Tagged Error Handling

```typescript
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
```

## Dependencies

### Core Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Effect runtime and core utilities |
| `@effect/platform` | Platform services (Path, FileSystem) |
| `@effect/platform-bun` | Bun runtime context |
| `playwright` (dev) | Headless browser automation for web scraping |
| `@beep/tooling-utils` | FsUtils for JSON file writing |
| `@beep/schema` | Schema utilities for tagged errors |
| `@beep/constants` | Shared constants |
| `@beep/invariant` | Assertion contracts |
| `@beep/utils` | Pure runtime helpers |
| `@beep/identity` | Package identity |

### Additional Dependencies

The package.json includes additional dependencies that may be used for future tooling features:
- `@effect/cli` — CLI framework
- `@effect/workflow` — Workflow orchestration
- `@effect/cluster` — Distributed computing
- `ts-morph` — TypeScript AST manipulation
- `@jsquash/*` — Image processing libraries (webp, avif, jpeg, jxl, png)
- `glob` — File pattern matching

These dependencies suggest planned or experimental features beyond the current web crawling functionality.

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

# Build
bun run --filter @beep/scraper build

# Check for circular dependencies
bun run --filter @beep/scraper lint:circular
```

### Additional Scripts

The package.json includes additional scripts that may be legacy or experimental:
- `execute` — Generic script execution with environment setup
- `gen:secrets` — Environment secrets generation
- `bootstrap` — Package bootstrapping
- `generate-public-paths` — Asset path generation
- `gen:locales` — Locale file generation
- `iconify` — Icon processing workflow
- `purge` — Cleanup script
- `docs:lint` — Documentation linting
- `docs:lint:file` — Single file documentation linting

These scripts may not be actively maintained or may serve experimental purposes.

## Notes

### Architecture Highlights

- **Scoped resources**: Browser lifecycle managed via `Effect.acquireRelease`
- **Bounded queues**: `Queue.bounded` prevents memory overflow during large crawls
- **Worker pools**: Concurrent workers process URLs from a shared queue
- **Atomic state**: `Ref<HashSet>` for thread-safe visited URL tracking
- **Tagged errors**: Structured error handling for browser, page load, and extraction failures
- **Effect-first**: All async operations use Effect primitives (no async/await)

### Link Processing

The crawler:
- Normalizes URLs (removes hash fragments, validates protocols)
- Filters to same-domain links only
- Deduplicates visited URLs atomically
- Respects depth limits to prevent infinite crawls
- Times out workers when queue is empty

### Performance

- Default settings: 5 concurrent workers, 4096 queue size
- Adjust `CONCURRENCY` for more parallel processing
- Increase `QUEUE_SIZE` for larger crawls
- `WORKER_TIMEOUT` determines when to stop (queue appears empty)

### Playwright Installation

If browser launch fails, install Playwright browsers:
```bash
bunx playwright install chromium
```
