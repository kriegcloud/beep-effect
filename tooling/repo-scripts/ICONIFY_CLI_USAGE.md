# Iconify CLI Usage

The Iconify CLI lives in `tooling/repo-scripts`. Use it through the root scripts or within the package workspace.

## Root Commands

```bash
# Run directly from the monorepo root
bun run iconify -- collections --json
```

- Always place `--` before CLI flags so they’re forwarded to the script.
- Subcommands include `collections`, `search`, `inspect`, and `add`.

## Direct Package Invocation

From `tooling/repo-scripts`:

```bash
# repo root (recommended)
bun run iconify -- collections --json

# workspace directly
bun run --cwd tooling/repo-scripts iconify -- collections --json
```

Both variants execute the same Bun-powered script (`tooling/repo-scripts/package.json#scripts.iconify`), so interactive prompts and colorized output are available.

## Subcommand Examples

```bash
# List collections filtered by prefix
bun run iconify -- collections --prefix mdi

# Search for icons and return JSON
bun run iconify -- search --query account --json

# Inspect icon metadata with keywords
bun run iconify -- inspect mdi:account --keywords

# Dry-run add icons from search results (no file writes)
bun run iconify -- add --from-search account --limit 5 --dry-run --yes

# Import an entire collection with confirmation disabled
bun run iconify -- add --collection mdi --yes
```

### Flags

- `--json`: Emit JSON instead of colorized output.
- `--limit`: Limit search results (default 20).
- `--prefix`: Narrow searches or collections to a prefix.
- `--yes`: Skip confirmation prompts (useful in CI).
- `--dry-run`: Show planned registry updates without writing to disk.
- `--threshold`: Override bulk import confirmation threshold.

## Environment & Layers

The CLI respects repo configuration:

- `ICONIFY_API_BASE_URL` overrides the API endpoint (default `https://api.iconify.design`).
- `ICONIFY_API_MAX_RETRIES`, `ICONIFY_API_RETRY_INITIAL_DELAY_MS`, `ICONIFY_API_RETRY_MAX_DELAY_MS` tune retry behaviour.
- Execution composes the Bun terminal, filesystem, and path layers, so commands should be run in environments that support Bun runtime features.

## Notes

- The CLI updates `packages/ui-core/src/constants/iconify/icon-sets.ts`. Dry runs (`--dry-run`) help audit changes before writing.
- Tests are located under `tooling/repo-scripts/test/iconify`. Update tests when modifying behaviour.
- The Turbo pipeline requires upstream builds; the first run may be slower while dependencies build.

Happy icon importing!
