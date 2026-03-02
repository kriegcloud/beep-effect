# Version Sync: Preliminary Research

## 1. Complete Version Pin Inventory

### Confirmed Drift Locations

| # | File | Format | Field/Location | Current Value | Source of Truth | Drift? |
|---|------|--------|---------------|---------------|-----------------|--------|
| 1 | `.bun-version` | Plain text | Entire file | `1.3.2` | GitHub Releases (latest stable) | **INTERNAL MISMATCH** |
| 2 | `package.json` | JSON | `packageManager` | `bun@1.3.9` | Should match `.bun-version` | **INTERNAL MISMATCH** |
| 3 | `.nvmrc` | Plain text | Entire file | `22` | Developer-controlled | OK (source of truth) |
| 4 | `.github/workflows/release.yml:43` | YAML | `node-version` | `20` | Should match `.nvmrc` | **DRIFT** |
| 5 | `.github/workflows/release.yml:81` | YAML | `node-version` | `20` | Should match `.nvmrc` | **DRIFT** |
| 6 | `docker-compose.yml` (redis) | YAML | `image` | `redis:latest` | Docker Hub | **UNPINNED** |
| 7 | `docker-compose.yml` (postgres) | YAML | `image` | `pgvector/pgvector:pg17` | Docker Hub | **MAJOR-ONLY** |
| 8 | `docker-compose.yml` (grafana) | YAML | `image` | `grafana/otel-lgtm:0.11.10` | Docker Hub | OK (pinned) |

### Locations Verified Clean

| File | What Checked | Result |
|------|-------------|--------|
| `bunfig.toml` | No version pins (only install config) | Clean |
| `turbo.json` | No tool version pins | Clean |
| `tsconfig.base.json` | No runtime version refs | Clean |
| `.npmrc` | No version pins | Clean |
| `.repos/*/package.json` | External repos — not in scope | Excluded |

### No Additional Version Files Found
- No `.tool-versions` (asdf)
- No `.node-version`
- No Dockerfiles
- No `.github/dependabot.yml` or `renovate.json`

## 2. GitHub Releases API (Bun Version Resolution)

### Endpoint
```
GET https://api.github.com/repos/oven-sh/bun/releases/latest
```

### Response Shape (relevant fields)
```json
{
  "tag_name": "bun-v1.4.2",
  "name": "Bun v1.4.2",
  "prerelease": false,
  "draft": false,
  "published_at": "2026-02-18T..."
}
```

### Parsing Strategy
- `tag_name` format: `bun-v<semver>` — strip `bun-v` prefix to get version
- Filter: `prerelease === false && draft === false`
- Rate limit: 60 req/hr unauthenticated (more than sufficient for occasional CLI use)

### Effect v4 HttpClient Pattern
```ts
import * as Http from "effect/HttpClient"
import * as HttpReq from "effect/HttpClientRequest"
import * as HttpRes from "effect/HttpClientResponse"
import * as S from "effect/Schema"

const BunRelease = S.Struct({
  tag_name: S.String,
  prerelease: S.Boolean,
  draft: S.Boolean,
})

const fetchLatestBunVersion = Effect.fn(function* () {
  const client = yield* Http.HttpClient
  const response = yield* client.get("https://api.github.com/repos/oven-sh/bun/releases/latest")
  const json = yield* HttpRes.schemaBodyJson(BunRelease)(response)
  return json.tag_name.replace(/^bun-v/, "")
})
```

## 3. Docker Hub Tag Resolution

### Redis (Official Image)
```
GET https://hub.docker.com/v2/repositories/library/redis/tags/?page_size=100&ordering=last_updated
```

Response contains `results[]` with `name` (tag string) and `last_updated`. Filter for stable version tags (exclude `alpine`, `rc`, `beta` suffixes for default recommendation, but include `-alpine` variants as secondary).

### pgvector/pgvector
```
GET https://hub.docker.com/v2/repositories/pgvector/pgvector/tags/?page_size=100&ordering=last_updated
```

Tags follow pattern like `pg17`, `pg17-v0.8.0`, `0.8.0-pg17`. Strategy: find latest tag matching `pg17` prefix with most specific version.

### grafana/otel-lgtm
```
GET https://hub.docker.com/v2/repositories/grafana/otel-lgtm/tags/?page_size=100&ordering=last_updated
```

Tags are semver-style. Find latest non-prerelease tag.

### General Docker Hub Pagination
- Results are paginated (`next` field for cursor)
- `page_size=100` is usually sufficient for recent tags
- Some registries require auth token for rate limiting (Docker Hub: 100 pulls/6hr anonymous)

## 4. File Format Editing Libraries

### YAML: `yaml` (eemeli/yaml v2.8.x)

**Comment-preserving Document API:**
```ts
import { parseDocument } from "yaml"

// Read file
const text = await readFile("docker-compose.yml", "utf-8")
const doc = parseDocument(text)

// Surgical edit — all comments on other nodes untouched
doc.setIn(["services", "redis", "image"], "redis:8.0.2")

// Write back — comments, blank lines, formatting preserved
const updated = doc.toString()
```

**Key API methods:**
- `parseDocument(text)` — parse to Document with full comment/formatting metadata
- `doc.get(key)` / `doc.getIn(path)` — read values
- `doc.set(key, value)` / `doc.setIn(path, value)` — modify values
- `doc.toString()` — serialize back preserving all formatting
- `doc.toJSON()` — extract plain JS object (for inspection)

**Already an Effect v4 peer dependency** — `yaml@^2.8.2` in `.repos/effect-v4/packages/effect/package.json`.

### JSON: `jsonc-parser` (v3.3.1, already in catalog)

**Proven pattern from `config-updater.ts`:**
```ts
import * as jsonc from "jsonc-parser"

const FORMATTING_OPTIONS = { tabSize: 2, insertSpaces: true }

// Modify a specific path
const edits = jsonc.modify(content, ["packageManager"], `bun@${version}`, {
  formattingOptions: FORMATTING_OPTIONS,
})
const result = jsonc.applyEdits(content, edits)
```

This is the **exact same pattern** used in the existing `config-updater.ts` for tsconfig updates. Zero new learning curve.

### Plain Text: Direct string manipulation

```ts
// .bun-version, .nvmrc
const read = (content: string) => content.trim()
const write = (version: string) => `${version}\n`
```

## 5. Effect v4 HttpClient Review

Effect v4's `HttpClient` is in the main `effect` package:
- `import * as HttpClient from "effect/HttpClient"`
- `import * as HttpClientRequest from "effect/HttpClientRequest"`
- `import * as HttpClientResponse from "effect/HttpClientResponse"`

For the CLI, the `NodeHttpClient` layer from `@effect/platform-node` provides the runtime implementation. This is already available since `bin.ts` provides `@effect/platform-node` layers.

However, the current `DerivedLayers` in `bin.ts` does NOT include `NodeHttpClient.layer`. This will need to be added for the version-sync command to make HTTP requests.

### Required bin.ts Change
```ts
import { NodeHttpClient } from "@effect/platform-node"

const DerivedLayers = Layer.mergeAll(
  NodeChildProcessSpawner.layer,
  NodeHttpClient.layer,  // NEW: needed for version-sync
  FsUtilsLive
).pipe(Layer.provideMerge(BaseLayers))
```

## 6. YAML Node-Version Pattern in CI

The current `release.yml` hardcodes `node-version: 20`. Two approaches to fix:

### Approach A: Use `node-version-file` (Preferred)
```yaml
- uses: actions/setup-node@v4
  with:
    node-version-file: .nvmrc
```
This makes CI read `.nvmrc` directly. No version string to sync. **This is the ideal fix** — it eliminates the drift source entirely rather than keeping two copies in sync.

### Approach B: Sync literal value
Replace `node-version: 20` with `node-version: 22` (matching `.nvmrc`).
Still requires version-sync to update on every `.nvmrc` change.

**Recommendation**: The `version-sync` command should prefer Approach A (replace `node-version: <number>` with `node-version-file: .nvmrc`) as the `--write` behavior. This is a one-time structural fix that eliminates future drift.

For the check mode, the command should detect the mismatch and recommend the `node-version-file` approach in its output.
