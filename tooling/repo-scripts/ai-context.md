---
path: tooling/repo-scripts
summary: Repo-wide maintenance scripts - bootstrap, generators, codemods, asset pipelines
tags: [tooling, scripts, generators, codemods, i18n]
---

# @beep/repo-scripts

Orchestrates repo-wide maintenance CLIs including bootstrap flows, environment scaffolding, asset/locale generators, and codemod utilities. Provides canonical `@effect/cli` + Bun runtime patterns for long-lived utilities. Scripts layer `FsUtils` and `RepoUtils` so downstream packages can rely on generated artifacts.

## Architecture

```mermaid
flowchart LR
  N1["bootstrap.ts"]
  N2["Docker/Migrate"]
  N3["generate-secrets"]
  N4["Effect Random"]
  N5[".env file"]
  N6["generate-locales"]
  N7["CLDR fetch"]
  N8["ALL_LOCALES.gen"]
  N9["Node"]
  N10["generate-assets"]
  N11["AVIF/WebP conv"]
  N12["asset-paths.ts"]
  N13["Node"]
  N14["codemod.ts"]
  N15["jscodeshift"]
  N1 --> N2
  N3 --> N4
  N4 --> N5
  N6 --> N7
  N7 --> N8
  N10 --> N11
  N11 --> N12
  N9 --> N13
  N14 --> N15
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/bootstrap.ts` | Interactive server bootstrapper (Docker, migrations) |
| `src/generate-env-secrets.ts` | Secure secret hydrator with Effect Random |
| `src/generate-asset-paths.ts` | Public asset crawler with schema validation |
| `src/generate-locales.ts` | CLDR fetch and locale file generation |
| `src/codemod.ts` | jscodeshift-based AST transformation framework |
| `src/codemods/` | Individual codemod implementations |
| `src/utils/convert-to-nextgen.ts` | AVIF/WebP image conversion |
| `src/utils/asset-path.schema.ts` | Asset path validation schema |
| `src/analyze-jsdoc.ts` | JSDoc documentation completeness checker |
| `src/purge.ts` | Workspace artifact cleanup |

## Usage Patterns

### Bootstrap Flow

```bash
# Interactive server setup (Docker, migrations, .env)
bun run bootstrap
```

### Secret Generation

```bash
# Generate secure environment secrets
bun run gen:secrets
```

### Asset Pipeline

```bash
# Regenerate public asset paths with AVIF conversion
bun run generate-public-paths
```

### Locale Generation

```bash
# Fetch CLDR data and generate locale files
bun run gen:locales
```

### Codemod Execution

```typescript
import * as Effect from "effect/Effect";
import * as Command from "@effect/cli/Command";
import * as Console from "effect/Console";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunContext from "@effect/platform-bun/BunContext";

const helloCommand = Command.make("hello", {}, () =>
  Effect.gen(function* () {
    yield* Console.log("Hello from repo-scripts");
  })
);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Generated files in `_generated/` | Clear separation of source vs generated code |
| Schema-validated outputs | Type-safe generated artifacts with decode guards |
| Effect Random for secrets | Cryptographically secure secret generation |
| Centralized .env management | Single source of truth at repo root |
| Truncated secret logging | Security: never log full secret values |

## Dependencies

**Internal**: `@beep/constants`, `@beep/schema`, `@beep/tooling-utils`

**External**: `effect`, `@effect/platform`, `@effect/platform-bun`, `@effect/cli`, `jscodeshift`, `ts-morph`, `@jsquash/*`, `glob`

## Related

- **AGENTS.md** - Detailed contributor guidance and security guardrails
- **Root package.json** - Exposes generators via `bun run gen:*` scripts
