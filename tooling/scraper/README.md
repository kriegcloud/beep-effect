# @beep/scraper — Effect-based web crawler

An Effect-first web crawler built on Playwright for parallel link discovery and extraction. This tooling package provides a configurable, concurrent crawler with proper resource management, depth-limited traversal, and structured JSON output.

The scraper is designed as a development tool for documentation crawling, sitemap generation, or link validation within the beep-effect monorepo.


## Overview

The scraper implements a breadth-first crawl using:
- **Effect-based concurrency** with bounded queues and worker pools
- **Playwright** for headless browser automation
- **Resource management** via `Effect.acquireRelease` for browser/page lifecycle
- **Depth tracking** to limit crawl scope
- **Same-domain filtering** to stay within the target site
- **Deduplication** using `HashSet` for visited URLs
- **Structured error handling** with tagged errors


## Key Features

- **Concurrent workers**: Configurable worker pool (default: 5 concurrent workers)
- **Depth limiting**: Control maximum distance from starting URL
- **Bounded queue**: Prevents memory overflow on large sites (4096 items by default)
- **Atomic state management**: Uses `Ref<HashSet>` for thread-safe visited/results tracking
- **Automatic normalization**: Removes hash fragments, filters non-HTTP protocols
- **JSON output**: Writes structured results with metadata to `crawled-links.json`


## Configuration

The crawler exposes configuration constants at the top of `/home/elpresidank/YeeBois/projects/beep-effect/tooling/scraper/src/links.ts`:

```typescript
const WEB_URL = "https://developers.notion.com/";  // Starting URL
const MAX_DEPTH = 10;                               // Maximum depth from start
const CONCURRENCY = 5;                              // Worker pool size
const QUEUE_SIZE = 4096;                            // Bounded queue capacity
const WORKER_TIMEOUT = "5 seconds";                 // Idle timeout before worker exits
```

Adjust these values before running the crawler to match your use case.


## Architecture

### Services

- **PlaywrightBrowser**: Context.Tag wrapping a Playwright Browser instance
- **PlaywrightBrowserLive**: Layer providing scoped browser lifecycle (launch → close)

### State Management

The crawler maintains four `Ref` containers for shared state:
- `visitedRef`: `Ref<HashSet<string>>` — URLs already processed
- `resultsRef`: `Ref<HashSet<string>>` — All discovered links
- `processedCountRef`: `Ref<number>` — Count of processed pages
- `activeWorkersRef`: `Ref<number>` — Current active workers

### Worker Pool Pattern

Each worker:
1. Increments `activeWorkersRef` on start
2. Takes items from `urlQueue` with timeout
3. Processes URLs (navigate → extract → filter → enqueue)
4. Exits when queue times out (indicating no more work)
5. Decrements `activeWorkersRef` on exit

Workers run concurrently via `Effect.all(workers, { concurrency: "unbounded" })`.

### Error Handling

Three tagged errors:
- **PlaywrightError**: Browser launch/page creation failures
- **PageLoadError**: Navigation timeouts or network errors
- **LinkExtractionError**: DOM query failures

Errors are caught per-URL and logged; the crawler continues processing other URLs.


## Usage

### Running the Crawler

```bash
cd tooling/scraper
bun run src/links.ts
```

The program:
1. Launches a headless Chromium browser
2. Seeds the queue with `WEB_URL` at depth 0
3. Spawns `CONCURRENCY` workers to process URLs
4. Extracts links from each page via Playwright's `$$eval`
5. Normalizes and filters links to same domain
6. Enqueues new links if within `MAX_DEPTH`
7. Writes results to `crawled-links.json`

### Output Format

`crawled-links.json`:
```json
{
  "crawledAt": "2025-12-05T12:34:56.789Z",
  "baseUrl": "https://developers.notion.com/",
  "maxDepth": 10,
  "totalLinks": 142,
  "links": [
    "https://developers.notion.com/",
    "https://developers.notion.com/docs",
    ...
  ]
}
```


## Effect Patterns

### Scoped Resource Management

Browser and pages use `Effect.acquireRelease` for cleanup:

```typescript
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

Pages are similarly scoped within `processUrl` to ensure proper cleanup per request.

### Queue-Based Concurrency

The crawler uses `Queue.bounded` for work distribution:

```typescript
const urlQueue = yield* Queue.bounded<QueueItem>(QUEUE_SIZE);

// Seed initial work
yield* Queue.offer(urlQueue, { url: WEB_URL, depth: 0 });

// Workers take from queue with timeout
const maybeItem = yield* F.pipe(
  Queue.take(urlQueue),
  Effect.timeout(WORKER_TIMEOUT),
  Effect.option
);
```

Timeout-based queue polling allows workers to detect when crawling is complete.

### Atomic State Updates

All state mutations use `Ref.update` or `Ref.updateAndGet` for atomicity:

```typescript
// Mark URL as visited
yield* Ref.update(visitedRef, HashSet.add(url));

// Increment counter atomically
const count = yield* Ref.updateAndGet(processedCountRef, (n) => n + 1);
```


## Link Extraction & Filtering

### Extraction

Uses Playwright's `$$eval` to query all anchor tags:

```typescript
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

### Normalization

The `normalizeUrl` function:
- Resolves relative URLs to absolute
- Removes hash fragments (`url.hash = ""`)
- Filters non-HTTP/HTTPS protocols
- Returns `null` for invalid URLs

### Same-Domain Filter

`filterSameDomain` ensures only links matching the base domain are kept:

```typescript
const baseDomain = new URL(WEB_URL).hostname;
const sameDomainLinks = filterSameDomain(normalizedLinks, baseDomain);
```


## Dependencies

### Core Dependencies

- **effect** — Core Effect runtime
- **@effect/platform** — Path service
- **@effect/platform-bun** — Bun runtime context
- **playwright** — Headless browser automation

### Workspace Dependencies

- **@beep/tooling-utils** — `FsUtils` for JSON file writing


## Project Structure

```
tooling/scraper/
├── src/
│   ├── index.ts         # Empty barrel export
│   └── links.ts         # Main crawler implementation
├── test/
│   └── Dummy.test.ts    # Test placeholder
├── crawled-links.json   # Output file (generated)
├── package.json
├── tsconfig.json
└── README.md
```


## Extending the Scraper

### Custom Link Processing

To add custom link analysis, modify `processUrl`:

```typescript
const processUrl = (item: QueueItem) =>
  Effect.gen(function* () {
    // ... existing navigation code ...

    const rawLinks = yield* extractLinks(page, url);

    // Add custom processing here:
    const metadata = yield* extractPageMetadata(page);
    yield* storeMetadata(url, metadata);

    // ... rest of processing ...
  });
```

### Different Starting Points

Change `WEB_URL` or seed multiple URLs:

```typescript
const STARTING_URLS = [
  "https://example.com/docs",
  "https://example.com/api"
];

for (const url of STARTING_URLS) {
  yield* Queue.offer(urlQueue, { url, depth: 0 });
  yield* Ref.update(resultsRef, HashSet.add(url));
}
```

### Custom Output

Modify the output structure in the `program` Effect:

```typescript
yield* fsUtils.writeJson(outputPath, {
  crawledAt: new Date().toISOString(),
  baseUrl: WEB_URL,
  maxDepth: MAX_DEPTH,
  totalLinks: result.length,
  links: result,
  // Add custom fields:
  metadata: customMetadata,
  statistics: computeStatistics(result),
});
```


## Performance Considerations

### Concurrency Tuning

- **Low concurrency (1-3)**: Gentle on target server, slower crawls
- **Medium concurrency (5-10)**: Balanced for most sites
- **High concurrency (10+)**: Faster but may trigger rate limits

### Memory Management

The bounded queue prevents memory exhaustion on large sites. If crawling massive sites:
- Increase `QUEUE_SIZE` (but monitor memory usage)
- Consider persisting state to disk for very large crawls
- Add request throttling/delays if needed

### Depth vs. Breadth

- **Shallow depth (1-3)**: Quick overview, main sections only
- **Medium depth (5-10)**: Most documentation sites
- **Deep depth (10+)**: Comprehensive crawls, may include many pages


## Limitations

- **JavaScript-heavy sites**: May miss dynamically loaded content (adjust `waitUntil` option)
- **Authentication**: No built-in auth support; add custom headers/cookies if needed
- **Robots.txt**: Not currently respected; add polite crawling delays for production use
- **Single domain**: Only crawls same-domain links; cross-domain requires filter changes


## Testing

Currently has a placeholder test. To add proper tests:

```typescript
import { Effect } from "effect";
import { describe, expect, it } from "bun:test";

describe("Link normalization", () => {
  it("removes hash fragments", () => {
    const result = normalizeUrl("https://example.com/page#section", "https://example.com");
    expect(result).toBe("https://example.com/page");
  });

  it("resolves relative URLs", () => {
    const result = normalizeUrl("../docs", "https://example.com/api/v1");
    expect(result).toBe("https://example.com/docs");
  });
});
```


## Troubleshooting

### Browser Launch Failures

If Chromium fails to launch:
```bash
# Install Playwright browsers
bunx playwright install chromium
```

### Memory Issues

If the crawler runs out of memory:
- Reduce `CONCURRENCY`
- Reduce `MAX_DEPTH`
- Reduce `QUEUE_SIZE`
- Add explicit page size limits

### Timeout Errors

If pages timeout frequently:
- Increase timeout in `page.goto` (currently 30s)
- Check network connectivity
- Verify target site is accessible


## Development

### Running Locally

```bash
cd tooling/scraper
bun install
bun run src/links.ts
```

### Type Checking

```bash
bun run check
```

### Linting

```bash
bun run lint        # Check for issues
bun run lint:fix    # Auto-fix issues
```


## Future Enhancements

Potential improvements:
- [ ] CLI interface via `@effect/cli` for runtime configuration
- [ ] Sitemap XML generation
- [ ] Screenshot capture per page
- [ ] Broken link detection and reporting
- [ ] Robots.txt compliance
- [ ] Rate limiting and polite crawling
- [ ] Resume capability (persist state between runs)
- [ ] Support for authentication flows
- [ ] Configurable link filters (regex patterns)
- [ ] Export to multiple formats (CSV, XML, GraphML)


## Related Packages

- **@beep/tooling-utils** — File system utilities used for JSON output
- **@beep/cli** — Repository CLI tools
- **@beep/repo-scripts** — Automation scripts


## License

MIT
