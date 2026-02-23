# Version Sync: Design Document

## Command UX

### Invocation
```
beep version-sync                           # Check mode (default)
beep version-sync --write                   # Apply fixes
beep version-sync --write --dry-run         # Preview what --write would do
beep version-sync --skip-network            # Offline: internal consistency only
beep version-sync --bun-only               # Scope to Bun versions only
beep version-sync --node-only              # Scope to Node versions only
beep version-sync --docker-only            # Scope to Docker images only
```

### Exit Codes
- `0` — No drift detected, or drift fixed with `--write`
- `1` — Drift detected in check mode

## Architecture

### File Structure
```
tooling/cli/src/commands/version-sync/
  index.ts              # Command definition + Flag wiring
  handler.ts            # Orchestration: scan -> resolve -> report/write
  resolvers/
    bun.ts              # GitHub Releases API for latest Bun
    node.ts             # Read .nvmrc (source of truth)
    docker.ts           # Docker Hub tag resolution
  updaters/
    plain-text.ts       # .bun-version writer
    package-json.ts     # jsonc-parser packageManager updater
    yaml-file.ts        # eemeli/yaml Document API for YAML files
  types.ts              # Report model, drift types, errors
```

## Data Model

### VersionDriftItem
```ts
interface VersionDriftItem {
  readonly file: string
  readonly field: string
  readonly current: string
  readonly expected: string
  readonly line: Option<number>
}
```

### VersionCategory
```ts
type VersionCategory = "bun" | "node" | "docker"
```

### VersionCategoryReport
```ts
interface VersionCategoryReport {
  readonly category: VersionCategory
  readonly status: "ok" | "drift" | "unpinned" | "error"
  readonly items: ReadonlyArray<VersionDriftItem>
  readonly latest: Option<string>
  readonly error: Option<string>
}
```

### VersionSyncReport
```ts
interface VersionSyncReport {
  readonly categories: ReadonlyArray<VersionCategoryReport>
  readonly hasDrift: boolean
}
```

## Resolver Contracts

### BunVersionResolver
```ts
const resolveBunVersions: (
  repoRoot: string,
  skipNetwork: boolean
) => Effect.Effect<
  { current: { bunVersion: string; packageManager: string }; latest: Option<string> },
  VersionSyncError,
  FileSystem.FileSystem | HttpClient
>
```
- Reads `.bun-version` and `package.json` `packageManager` field
- If `!skipNetwork`: fetches `https://api.github.com/repos/oven-sh/bun/releases/latest`
- Parses `tag_name` (`bun-v<semver>`) to extract version

### NodeVersionResolver
```ts
const resolveNodeVersions: (
  repoRoot: string
) => Effect.Effect<
  { nvmrc: string; workflowFiles: ReadonlyArray<{ file: string; line: number; current: string }> },
  VersionSyncError,
  FileSystem.FileSystem | Path.Path
>
```
- Reads `.nvmrc` as source of truth
- Scans `.github/workflows/*.yml` for `node-version:` fields with line numbers

### DockerImageResolver
```ts
const resolveDockerImages: (
  repoRoot: string,
  skipNetwork: boolean
) => Effect.Effect<
  ReadonlyArray<{ service: string; current: string; latest: Option<string> }>,
  VersionSyncError,
  FileSystem.FileSystem | HttpClient
>
```
- Parses `docker-compose.yml` for `image:` fields
- If `!skipNetwork`: queries Docker Hub for latest tags matching constraints

## Updater Contracts

### Plain Text Updater
```ts
const updatePlainTextFile: (
  filePath: string,
  version: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>
```

### Package JSON Updater
```ts
const updatePackageManagerField: (
  filePath: string,
  version: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>
```
Uses `jsonc-parser` `modify()` + `applyEdits()` pattern.

### YAML Updater
```ts
const updateYamlValue: (
  filePath: string,
  yamlPath: ReadonlyArray<string | number>,
  value: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>
```
Uses eemeli/yaml `parseDocument()` + `doc.setIn()` + `doc.toString()`.

### YAML Node Version Updater
For CI workflow files, replaces `node-version: <number>` with `node-version-file: .nvmrc`:
```ts
const updateNodeVersionInWorkflow: (
  filePath: string,
  occurrences: ReadonlyArray<{ path: ReadonlyArray<string | number> }>
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>
```

## Error Model

```ts
class VersionSyncError extends S.TaggedErrorClass<VersionSyncError>(
  "@beep/repo-cli/commands/version-sync/VersionSyncError"
)(
  "VersionSyncError",
  { message: S.String, file: S.String, cause: S.optional(S.Unknown) },
  { title: "Version Sync Error", description: "Failed to read, resolve, or update a version pin" }
) {}

class NetworkUnavailableError extends S.TaggedErrorClass<NetworkUnavailableError>(
  "@beep/repo-cli/commands/version-sync/NetworkUnavailableError"
)(
  "NetworkUnavailableError",
  { message: S.String },
  { title: "Network Unavailable", description: "Upstream version resolution failed due to network" }
) {}
```

## Handler Flow

1. Find repo root via `findRepoRoot()`
2. Determine which categories to check (all, or filtered by `--bun-only`/etc.)
3. Run resolvers in parallel for selected categories
4. Build `VersionSyncReport` from resolver results
5. If check mode: render report, exit 1 if drift
6. If write+dry-run: render planned changes
7. If write: apply updaters, render summary

## Test Strategy

Tests use temp directories with fixture files. HTTP calls are avoided by:
- Mocking `HttpClient` service with `Layer.mock(HttpClient.HttpClient)({...})`
- Using `--skip-network` flag for internal-only tests
- Providing fixture responses for API tests

Key test fixtures:
- `.bun-version` with mismatched version
- `package.json` with different `packageManager` version
- `.nvmrc` with version `22`
- YAML workflow with `node-version: 20`
- `docker-compose.yml` with `redis:latest`

All tests use `TestConsole` for output verification.

## Dependencies

### New dependency: `yaml`
- Added to root `package.json` catalog: `"yaml": "^2.8.2"`
- Added to `tooling/cli/package.json` dependencies: `"yaml": "catalog:"`
- Already an Effect v4 peer dependency

### HttpClient layer
- Use `FetchHttpClient.layer` from `effect/unstable/http/FetchHttpClient` (built-in, no extra platform dep)
- Added to `bin.ts` `DerivedLayers`

## Lefthook Integration

```yaml
post-merge:
  commands:
    version-sync-check:
      run: bun run beep version-sync --skip-network
```
