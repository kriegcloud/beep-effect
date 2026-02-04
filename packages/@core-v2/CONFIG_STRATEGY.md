# Configuration Strategy

## Overview

This document describes the unified configuration strategy for @core-v2. The setup ensures clean separation between development, test, and production environments with a single source of truth.

## Environment Files

| File | Purpose | Tracked in Git | Usage |
|------|---------|---------------|-------|
| `.env.example` | Canonical template with all variables documented | Yes | Reference for creating .env/.env.test |
| `.env` | Local development (gitignored) | No | Auto-loaded by bun for `bun run serve` |
| `.env.test` | Test environment | Yes | Used by test scripts via `--env-file` |
| `.env.local` | **REMOVED** (was duplicate) | N/A | Use `.env` instead |

## Configuration Variables

All variables follow Effect Config's nested prefix pattern:

- `LLM_*` - LLM provider configuration (API key, model, etc.)
- `STORAGE_*` - Storage backend configuration
- `ONTOLOGY_*` - Ontology file path and caching
- `RUNTIME_*` - Concurrency, retries, tracing
- `GROUNDER_*` - Relation grounding configuration
- `RDF_*` - RDF output configuration
- `PORT`, `NODE_ENV` - Server configuration

See `.env.example` for complete documentation of all variables and defaults.

## Bun Environment Loading

Bun automatically loads `.env` from the working directory. This behavior can override shell-sourced variables.

**Solutions:**

1. **Use `--env-file` flag** (preferred for scripts):
   ```bash
   bun --env-file=.env.test run dist/src/server.js
   ```

2. **Ensure no conflicting `.env`** when using shell exports:
   ```bash
   # This won't work if .env exists in cwd (bun overrides shell vars)
   export LLM_API_KEY=xxx
   bun run dist/src/server.js
   ```

3. **Move to different directory** or use absolute paths

## Usage Patterns

### Local Development

```bash
# 1. Copy template
cp .env.example .env

# 2. Add your API key
# Edit .env and set LLM_API_KEY=sk-ant-...

# 3. Run server (uses .env automatically)
bun run serve
```

### Testing

```bash
# 1. Test scripts use .env.test automatically
./scripts/test-server.sh    # Uses --env-file=.env.test
./scripts/test-extract.sh   # Sources .env.test for paths

# 2. API key loaded from monorepo .env (VITE_LLM_ANTHROPIC_API_KEY)
#    or export manually:
export LLM_API_KEY=sk-ant-...
./scripts/test-server.sh
```

### Production

```bash
# Use environment variables or mount config file
bun --env-file=/etc/app/production.env run dist/src/server.js
```

## Directory Layout

```
packages/@core-v2/
├── .env                    # Local dev (gitignored, customized)
├── .env.example            # Template (tracked, canonical reference)
├── .env.test               # Test config (tracked)
├── scripts/
│   ├── test-server.sh     # Uses --env-file=.env.test
│   └── test-extract.sh    # Sources .env.test for paths
└── src/Service/Config.ts  # Effect Config service
```

## Key Decisions

### Why .env.test is tracked

- Provides consistent test environment for all developers
- Contains no secrets (API key loaded separately)
- Uses absolute paths to monorepo resources
- Test scripts use `--env-file` to avoid .env conflicts

### Why .env.local was removed

- Created confusion with multiple env files
- Duplicated .env functionality
- Standard convention is:
  - `.env.example` - template
  - `.env` - local overrides (gitignored)
  - `.env.test` - test environment (tracked)

### API Key Management

**Development:**
- Store in `.env` (gitignored) as `LLM_API_KEY`

**Testing:**
- NOT stored in `.env.test` (security)
- Loaded from monorepo `.env` as `VITE_LLM_ANTHROPIC_API_KEY`
- Or export manually: `export LLM_API_KEY=sk-ant-...`

**Production:**
- Use environment variables or secret management
- Never commit API keys to git

## Common Issues

### Issue: ONTOLOGY_PATH must be absolute for file-system backend

**Problem:** Using relative paths like `ontologies/football/ontology.ttl` in `ONTOLOGY_PATH` fails with file-not-found errors when the server is started from different working directories.

**Root Cause:** Relative paths are resolved from the current working directory (CWD), not from the package root. When you run `bun run serve` from `packages/@core-v2/` vs running from the monorepo root, the same relative path resolves to different locations:
- From `packages/@core-v2/`: resolves to `packages/@core-v2/ontologies/football/ontology.ttl`
- From monorepo root: resolves to `ontologies/football/ontology.ttl`

**Solution:** Always use absolute paths for `ONTOLOGY_PATH` when using the file-system based OntologyService:

```bash
# Good - absolute path works from any directory
ONTOLOGY_PATH=/Users/pooks/Dev/effect-ontology/ontologies/football/ontology.ttl

# Bad - relative path fails depending on CWD
ONTOLOGY_PATH=ontologies/football/ontology.ttl
```

**Exception:** GCS backend (when `STORAGE_TYPE=gcs`) may support different path formats - refer to GCS configuration documentation.

### Issue: Test script uses wrong config

**Problem:** `.env` exists and bun auto-loads it, overriding test config

**Solution:** Test scripts now use `bun --env-file=.env.test` to explicitly load test config

### Issue: STORAGE_LOCAL_PATH points to wrong directory

**Problem:** `.env` had `STORAGE_LOCAL_PATH=./output` but test expected `/tmp/effect-ontology-test`

**Solution:**
- `.env` now uses `/tmp/effect-ontology-dev` (separate from test)
- `.env.test` uses `/tmp/effect-ontology-test`
- Clear separation between dev and test data

### Issue: Missing API key

**Problem:** `LLM_API_KEY` not set when running tests

**Solution:**
1. Check monorepo `.env` for `VITE_LLM_ANTHROPIC_API_KEY`
2. Or export manually: `export LLM_API_KEY=sk-ant-...`
3. Test script validates before starting server

## Integration Points

### Package.json Scripts

```json
{
  "serve": "bun run src/server.ts",  // Uses .env
  "build": "tsc --skipLibCheck --project tsconfig.build.json",
  "test": "vitest --run"
}
```

### Test Scripts

```bash
# scripts/test-server.sh
bun --env-file=.env.test run dist/src/server.js

# scripts/test-extract.sh
source .env.test  # For STORAGE_LOCAL_PATH, ONTOLOGY_PATH, PORT
curl http://localhost:$PORT/v1/extract/batch
```

### Service Implementation

```typescript
// src/Service/Config.ts
const LlmConfig = Config.nested("LLM")(Config.all({
  provider: Config.literal("anthropic", "openai", "google")("PROVIDER"),
  apiKey: Config.redacted("API_KEY"),
  // ...
}))
```

## Migration from Old Setup

If you have existing env files:

1. **Backup current .env** (has your API key)
2. **Copy .env.example to .env**
3. **Restore API key** from backup
4. **Update paths** to use absolute paths to ontology
5. **Delete .env.local** (no longer used)
6. **Verify test scripts** work with `./scripts/test-server.sh`

## Future Improvements

- Add `.env.production.example` for production deployments
- Consider using Effect Config's programmatic layer for tests
- Add validation script to check env file consistency
- Document deployment-specific config (GCS, PostgreSQL, etc.)

## References

- [Effect Config Documentation](https://effect.website/docs/guides/configuration)
- [Bun Environment Variables](https://bun.sh/docs/runtime/env)
- [Service Implementation](/Users/pooks/Dev/effect-ontology/packages/@core-v2/src/Service/Config.ts)
- [Environment Template](/Users/pooks/Dev/effect-ontology/packages/@core-v2/.env.example)
