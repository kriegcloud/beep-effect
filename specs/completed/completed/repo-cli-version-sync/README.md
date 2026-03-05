# Repo CLI Version Sync (`beep version-sync`)

## Status
PENDING

## Owner
@elpresidank

## Created
2026-02-22

## Purpose
Add a new `version-sync` command to `@beep/repo-cli` (`tooling/cli`) that keeps all tool/runtime/infrastructure version pins across the monorepo consistent and up-to-date. The command detects version drift, resolves latest versions from upstream sources, and performs comment-preserving edits across multiple config file formats.

## Why This Spec Exists
The monorepo has **6+ locations** where tool/runtime versions are pinned independently, leading to confirmed drift:

| File | Format | What | Current Value | Drift? |
|------|--------|------|---------------|--------|
| `.bun-version` | Plain text | Bun runtime | `1.3.2` | **YES** (vs `bun@1.3.9` in packageManager) |
| `package.json` `packageManager` | JSON | Bun runtime | `bun@1.3.9` | **YES** (vs `.bun-version`) |
| `.nvmrc` | Plain text | Node.js runtime | `22` | OK (source of truth) |
| `.github/workflows/release.yml` | YAML | Node.js in CI (2 locations) | `20` | **YES** (vs `.nvmrc` = 22) |
| `docker-compose.yml` | YAML | Redis | `redis:latest` | **UNPINNED** (floating tag) |
| `docker-compose.yml` | YAML | PostgreSQL | `pgvector/pgvector:pg17` | **MAJOR-ONLY** (no patch pin) |
| `docker-compose.yml` | YAML | Grafana OTEL | `grafana/otel-lgtm:0.11.10` | OK (pinned) |

There is no automated mechanism to detect or fix this drift. Manual updates are error-prone and forgotten. This command provides a single `beep version-sync` invocation that fixes all drift and keeps versions current.

## Primary Goal
Add one command with three modes:

1. `beep version-sync` - Check for drift and report (default, non-destructive)
2. `beep version-sync --write` - Apply all version updates
3. `beep version-sync --write --dry-run` - Show what would change without writing

## Version Sources

### Bun Runtime
- **Source of truth**: GitHub Releases API (`oven-sh/bun`)
- **Target**: Latest stable release tag (Bun has no LTS line; latest stable is the target)
- **Files updated**: `.bun-version`, `package.json` `packageManager` field
- **Both files MUST always contain the same version**

### Node.js Runtime
- **Source of truth**: `.nvmrc` file (read-only, never modified by this command)
- **Rationale**: Node is a secondary runtime in this repo (Bun is primary). `.nvmrc` is the developer-controlled source of truth. The command syncs other locations TO match `.nvmrc`.
- **Files updated**: `.github/workflows/*.yml` `node-version:` fields (replace hardcoded values with `node-version-file: .nvmrc` pattern where possible, or sync the literal version)

### Docker Images
- **Source of truth**: Docker Hub API / tag listing
- **Strategy**: Pin to latest specific tag matching the current major version constraint
  - `redis:latest` -> `redis:<latest-stable-tag>` (e.g. `redis:8.0.2`)
  - `pgvector/pgvector:pg17` -> `pgvector/pgvector:<latest-pg17-tag>` (e.g. `pgvector/pgvector:pg17-v0.8.0`)
  - `grafana/otel-lgtm:0.11.10` -> `grafana/otel-lgtm:<latest>` (already pinned, update if newer)
- **Files updated**: `docker-compose.yml` `image:` fields

## Command Contract

### Flags
| Flag | Alias | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--write` | `-w` | boolean | `false` | Apply updates (without this, only reports drift) |
| `--dry-run` | `-d` | boolean | `false` | Show what `--write` would do without modifying files |
| `--skip-network` | `-s` | boolean | `false` | Skip upstream version resolution (only check internal consistency) |
| `--bun-only` | | boolean | `false` | Only sync Bun versions |
| `--node-only` | | boolean | `false` | Only sync Node versions |
| `--docker-only` | | boolean | `false` | Only sync Docker image versions |

### Example Output (check mode)
```
beep version-sync

Version Sync Report
===================

Bun Runtime:
  .bun-version:              1.3.2  -> 1.3.9  (latest: 1.4.2)
  package.json packageManager: bun@1.3.9       (latest: 1.4.2)
  Status: DRIFT (internal mismatch + outdated)

Node.js Runtime:
  .nvmrc:                    22     (source of truth)
  release.yml (line 43):     20     -> 22
  release.yml (line 81):     20     -> 22
  Status: DRIFT (CI does not match .nvmrc)

Docker Images:
  redis:                     latest -> 8.0.2   (pin to specific version)
  pgvector/pgvector:         pg17   -> pg17-v0.8.0 (pin to specific tag)
  grafana/otel-lgtm:         0.11.10           (up to date)
  Status: UNPINNED (redis uses floating tag)

Run `beep version-sync --write` to apply fixes.
```

## File Format Handling

All edits MUST be **comment-preserving**. No file format round-trip may strip comments, change indentation, or reorder keys.

| Format | Library | Strategy |
|--------|---------|----------|
| Plain text (`.bun-version`, `.nvmrc`) | None (direct string write) | `content.trim()` read, `${version}\n` write |
| JSON (`package.json`) | `jsonc-parser` (already in catalog) | `modify()` + `applyEdits()` pattern from existing `config-updater.ts` |
| YAML (`docker-compose.yml`, `release.yml`) | `yaml` (eemeli/yaml v2.8.x) | `parseDocument()` + `doc.setIn()` + `doc.toString()` for comment-preserving edits |

### Library Rationale

- **`jsonc-parser`**: Already used in `config-updater.ts` for JSONC-safe root config updates. Proven pattern. No new dependency.
- **`yaml` (eemeli/yaml)**: The de facto standard YAML library for JS. Comment preservation is a headline feature via Document API. Zero dependencies, pure JS, Bun-compatible. Already a peer dependency of Effect v4 (`yaml@^2.8.2` in `.repos/effect-v4/packages/effect/package.json`). 80M+ weekly downloads.

### Rejected Alternatives

| Library | Format | Why Rejected |
|---------|--------|-------------|
| `js-yaml` | YAML | Does not preserve comments (well-known limitation, open issues since 2015) |
| `smol-toml` | TOML | No comment preservation (parse/stringify only) |
| `JSON.parse`/`JSON.stringify` | JSON | Loses comments, can change formatting |
| `@taplo/lib` | TOML | WASM dependency, stale maintenance, oriented toward formatting not editing |

## Architecture

### File Structure
```
tooling/cli/src/commands/version-sync/
  index.ts              # Command definition + export
  handler.ts            # Main handler (flag routing, report generation)
  resolvers/
    bun.ts              # Fetch latest Bun version from GitHub API
    node.ts             # Read .nvmrc as source of truth
    docker.ts           # Fetch latest Docker image tags
  updaters/
    bun-version-file.ts # Plain text .bun-version writer
    package-json.ts     # jsonc-parser packageManager updater
    yaml-version.ts     # yaml Document API updater for .yml files
    docker-compose.ts   # Docker image tag updater (uses yaml-version internally)
  types.ts              # VersionSyncReport, VersionDrift, etc.
```

### Service Dependencies
- `FileSystem` + `Path` (from `effect`) - file I/O
- `HttpClient` (from `effect`) - GitHub API + Docker Hub API calls
- `FsUtils` (from `@beep/repo-utils`) - `findRepoRoot`

### Error Model
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

## Lefthook Integration

Wire into `post-merge` hook for automatic drift detection after `git pull`:

```yaml
# lefthook.yml (addition)
post-merge:
  commands:
    version-sync-check:
      run: bun run beep version-sync --skip-network
```

This runs in check-only mode (no `--write`) with `--skip-network` to avoid blocking `git pull` on network availability. It prints a warning if internal version drift is detected, prompting the developer to run `beep version-sync --write` manually.

## Scope

### In Scope
- New `version-sync` command implementation under `tooling/cli/src/commands/`
- Root command tree registration in `tooling/cli/src/commands/root.ts`
- Public export update in `tooling/cli/src/index.ts`
- `yaml` package added to root catalog and cli devDependencies
- Lefthook `post-merge` hook addition
- Command tests in `tooling/cli/test/version-sync.test.ts`
- Spec outputs: research, design, and implementation docs

### Out of Scope
- Updating npm package versions (handled by Syncpack + `deps:update`)
- Updating Nix flake pins (handled by `nix flake update`)
- Auto-committing version changes
- CI workflow creation (covered by separate Quick Win / P0 items)
- Renovate/Dependabot configuration (separate tooling plan item)

## Behavioral Requirements

1. Discover repo root using existing `findRepoRoot` from `@beep/repo-utils`.
2. Scan all known version pin locations (listed in Version Sources above).
3. In check mode (default): report drift without modifying files.
4. In write mode: apply all version updates using format-appropriate editors.
5. All file edits MUST preserve comments, indentation, and key ordering.
6. Network failures MUST be graceful: report "unable to resolve latest" and continue with internal consistency checks.
7. `--skip-network` MUST work offline for pure internal drift detection.
8. Idempotent: running `--write` twice produces no changes on second run.
9. Exit code: 0 = no drift (or drift fixed with --write), 1 = drift detected (check mode).

## Effect v4 + CLI Pattern Requirements
- Use Effect v4 imports and command APIs used by current CLI package:
  - `effect/unstable/cli` (`Command`, `Flag`)
  - `effect` services (`FileSystem`, `Path`, `HttpClient`) and `Effect.fn`
- Prefer repo-utils helpers/services where available:
  - `findRepoRoot`
- Use tagged/domain errors (`VersionSyncError`, `NetworkUnavailableError`) for operational failures.
- Add JSDoc tags consistent with package conventions (`@since`, `@module`, `@category`).
- Console output via `Console.log`/`Console.error` (testable via `TestConsole`).

## Execution Plan For Another Agent Instance

### Phase 0: Research
Deliverable:
- `specs/pending/repo-cli-version-sync/outputs/research.md`

Must include:
- Complete version pin inventory with file paths and current values
- Docker Hub API / GitHub Releases API response format documentation
- `yaml` library Document API usage patterns for comment-preserving edits
- `jsonc-parser` `modify()` pattern review (already used in config-updater.ts)
- Review of Effect v4 `HttpClient` for API calls

### Phase 1: Design
Deliverable:
- `specs/pending/repo-cli-version-sync/outputs/design.md`

Must include:
- Final command UX and flag semantics
- Resolver interface contracts (Bun, Node, Docker)
- Updater interface contracts (per file format)
- Report data model (`VersionSyncReport`)
- Error model with tagged errors
- Test strategy (mock HTTP responses, temp file fixtures)

### Phase 2: Implementation
Expected code areas:
- `tooling/cli/src/commands/version-sync/` (full directory)
- `tooling/cli/src/commands/root.ts` (register subcommand)
- `tooling/cli/src/index.ts` (public export)
- `tooling/cli/package.json` (add `yaml` dependency)
- Root `package.json` catalog (add `yaml` if not already present)
- `lefthook.yml` (add `post-merge` hook)

Implementation rules:
- All file edits must use comment-preserving libraries (jsonc-parser, yaml Document API, direct string for plain text).
- No `JSON.parse`/`JSON.stringify` for any file that could contain comments.
- Network calls must be wrapped in timeout + graceful fallback.
- Use `Effect.fn` for all functions returning Effects.
- Use `Effect/HttpClient` for HTTP requests (not `fetch` directly).

### Phase 3: Tests
Expected tests:
- `tooling/cli/test/version-sync.test.ts`

Minimum test coverage:
1. Check mode reports drift correctly for Bun version mismatch.
2. Check mode reports drift for Node CI version mismatch.
3. Check mode reports unpinned Docker images.
4. Write mode updates `.bun-version` and `packageManager` in sync.
5. Write mode updates YAML `node-version:` fields preserving comments.
6. Write mode pins Docker image tags preserving YAML comments.
7. `--skip-network` skips upstream resolution and checks internal consistency only.
8. `--dry-run` shows changes without writing files.
9. Idempotent: second `--write` run produces no changes.
10. Network failure is graceful (reports error, continues checks).
11. Command is registered under root command tree.

### Phase 4: Verification
Run:
```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

Also verify command contract:
```bash
bun run beep version-sync --help
bun run beep version-sync
```

## Success Criteria
- [ ] `beep version-sync` command exists in `@beep/repo-cli`
- [ ] Check mode (default) reports all version drift accurately
- [ ] `--write` mode fixes all drift using comment-preserving edits
- [ ] `--dry-run` shows planned changes without modifying files
- [ ] `--skip-network` works fully offline for internal consistency
- [ ] YAML edits preserve all comments and formatting
- [ ] JSON edits use `jsonc-parser` `modify()`/`applyEdits()` pattern
- [ ] Lefthook `post-merge` hook is configured
- [ ] Tests cover all modes and edge cases
- [ ] Full repo verification commands pass

## Open Questions
1. Should the command also update `.nvmrc` to latest Node LTS, or keep it read-only?
   Proposed: Read-only. `.nvmrc` is developer-controlled. The command syncs other locations TO it.
2. Should Docker tag resolution prefer `major.minor.patch` or `major.minor`?
   Proposed: Prefer most specific available tag (patch-level) for maximum reproducibility.
3. Should `--write` auto-run `bun install` after updating Bun version?
   Proposed: No. Print a reminder instead. Auto-running install has side effects.

## Exit Condition
This spec is complete when another agent instance can execute Phases 0-4 and land a stable Effect v4 `beep version-sync` command in `tooling/cli` with passing tests and quality checks.

## Navigation
- [Handoffs](./handoffs/) - Phase transition documents
- [Outputs](./outputs/) - Phase artifacts
