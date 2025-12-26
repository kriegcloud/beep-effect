# @beep/interfere

Interactive Effect playground with in-browser code execution, Monaco editor, and DevTools integration.

## Purpose

`@beep/interfere` is a Next.js-based Effect playground that enables developers to write, execute, and debug Effect programs directly in the browser. It provides a full-featured development environment powered by WebContainers, featuring a Monaco editor with Effect language support, integrated terminal, and real-time Effect DevTools trace visualization. The playground supports workspace management, file sharing via URL compression, and live code execution without requiring local setup.

This application serves as an interactive learning and experimentation tool for the Effect ecosystem, allowing developers to explore Effect patterns, test code snippets, and visualize program execution through trace waterfall views.

## Key Features

| Feature | Location | Description |
|---------|----------|-------------|
| **Code Editor** | `/src/editor/components/file-editor.tsx` | Monaco editor with TypeScript and Effect support, syntax highlighting, and IntelliSense |
| **WebContainer Runtime** | `/src/editor/services/webcontainer.ts` | In-browser Node.js runtime via WebContainer API for executing Effect programs |
| **Terminal** | `/src/editor/components/terminal.tsx` | Integrated xterm.js terminal with multiple shell support and command execution |
| **Trace Viewer** | `/src/editor/components/trace-viewer.tsx` | Real-time Effect DevTools trace visualization with waterfall, tree, and detail views |
| **File Explorer** | `/src/editor/components/file-explorer.tsx` | Workspace file tree with create, rename, delete, and directory navigation |
| **Workspace Management** | `/src/editor/domain/workspace.ts` | File tree abstraction with validation, path resolution, and dependency management |
| **Share/Import** | `/src/services/shorten/` | URL-based workspace sharing via compression and KV storage |
| **Loading States** | `/src/editor/components/loader.tsx` | Progress indicators for WebContainer boot, package installation, and compilation |

## Architecture Overview

### Core Components

```
apps/interfere/src/
├── editor/                             # Playground editor implementation
│   ├── components/
│   │   ├── file-editor.tsx             # Monaco editor wrapper
│   │   ├── file-explorer.tsx           # File tree navigation
│   │   ├── terminal.tsx                # xterm.js terminal integration
│   │   ├── trace-viewer.tsx            # Effect DevTools trace UI
│   │   └── loader.tsx                  # Loading progress indicators
│   ├── atoms/
│   │   ├── editor.ts                   # Editor state (active file, models)
│   │   ├── workspace.ts                # Workspace file tree state
│   │   ├── devtools.ts                 # DevTools trace state
│   │   └── import.ts                   # Import/share state management
│   ├── domain/
│   │   ├── workspace.ts                # Workspace, File, Directory schemas
│   │   ├── devtools.ts                 # DevTools event types
│   │   └── errors.ts                   # FileNotFound, Validation errors
│   ├── services/
│   │   ├── webcontainer.ts             # WebContainer lifecycle, file ops
│   │   ├── monaco.ts                   # Monaco initialization, themes
│   │   ├── terminal.ts                 # Terminal service, themes
│   │   ├── compression.ts              # Workspace serialization/compression
│   │   ├── devtools.ts                 # DevTools proxy service
│   │   └── loader.ts                   # Loading indicator service
│   ├── context/
│   │   └── workspace.tsx               # Workspace React context provider
│   └── index.tsx                       # Main CodeEditor component
├── services/
│   ├── shorten/                        # URL shortening service
│   │   ├── domain.ts                   # ShortenedUrl schema
│   │   ├── service.ts                  # KV-based storage service
│   │   ├── rpc.ts                      # Effect RPC handlers
│   │   └── client.ts                   # Client-side RPC contract
│   └── kvs.ts                          # Vercel KV integration
├── app/
│   ├── layout.tsx                      # Root layout with GlobalProviders
│   ├── page.tsx                        # Playground entry point
│   └── api/v1/auth/[...all]/route.ts   # Better Auth integration
├── providers/
│   ├── GlobalProviders.tsx             # Provider stack (theme, i18n, IAM)
│   ├── AuthGuard.tsx                   # Protected route wrapper
│   └── DevToolsProvider.tsx            # TanStack DevTools
├── atoms/
│   ├── theme.ts                        # Theme state
│   └── location.ts                     # Location state
└── app-config.ts                       # Server-side config (lang, settings)
```

## Usage Examples

### Running Effect Programs

The playground automatically sets up a workspace with Effect dependencies. Users can write Effect programs and execute them in the terminal:

```typescript
// example.ts - Created in the file explorer
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";

const program = Effect.gen(function* () {
  yield* Console.log("Hello from Effect!");
  const result = yield* Effect.succeed(42);
  yield* Console.log(`The answer is: ${result}`);
  return result;
});

Effect.runPromise(program);
```

### Workspace Structure

Workspaces are defined using the `Workspace` schema with file trees:

```typescript
import * as Effect from "effect/Effect";
import { Workspace, makeFile, makeDirectory } from "@/editor/domain/workspace";

const workspace = new Workspace({
  name: "my-effect-project",
  dependencies: {
    "effect": "latest",
    "@effect/platform": "latest"
  },
  tree: [
    makeDirectory("src", [
      makeFile("main.ts", "// Entry point"),
      makeFile("utils.ts", "// Utilities")
    ])
  ],
  initialFilePath: "src/main.ts",
  prepare: "pnpm install",
  shells: [{ command: "./run src/main.ts", label: "Run" }]
});
```

### WebContainer File Operations

The WebContainer service provides Effect-based file operations:

```typescript
import * as Effect from "effect/Effect";
import { WebContainer } from "@/editor/services/webcontainer";

const program = Effect.gen(function* () {
  const container = yield* WebContainer;

  // Write a file
  yield* container.writeFile("src/hello.ts", "console.log('Hello')", "typescript");

  // Read a file
  const content = yield* container.readFileString("package.json");

  // Execute a command
  const exitCode = yield* container.run("pnpm install");

  return exitCode;
});
```

### Trace Visualization

Effect DevTools traces are automatically captured and visualized:

```typescript
import * as Effect from "effect/Effect";

// Traces are automatically forwarded from WebContainer to the DevTools viewer
const traced = Effect.gen(function* () {
  yield* Effect.log("Starting operation");

  const result = yield* Effect.succeed(100).pipe(
    Effect.withSpan("calculateValue")
  );

  yield* Effect.log("Operation complete");
  return result;
}).pipe(
  Effect.withSpan("mainProgram")
);

// Execution traces appear in the Trace Viewer tab
Effect.runPromise(traced);
```

## Dependencies

### Core Runtime

| Package | Purpose |
|---------|---------|
| `next` | Next.js 15 App Router framework |
| `react` | React 19 with compiler support |
| `effect` | Effect runtime and utilities |
| `@beep/runtime-client` | Client-side managed Effect runtime |
| `@beep/runtime-server` | Server-side managed Effect runtime |

### Playground-Specific

| Package | Purpose |
|---------|---------|
| `@webcontainer/api` | In-browser Node.js runtime for code execution |
| `@effect/monaco-editor` | Monaco editor with Effect TypeScript support |
| `@xterm/xterm` | Terminal emulator for shell interaction |
| `@xterm/addon-fit` | Terminal viewport fitting addon |
| `@effect/experimental` | DevTools protocol integration |
| `@zip.js/zip.js` | Workspace compression for sharing |

### UI Components

| Package | Purpose |
|---------|---------|
| `@beep/ui` | Component library (MUI, shadcn, Radix) |
| `@beep/ui-core` | Design tokens, theme configuration |
| `lucide-react` | Icon library for toolbar/UI |
| `react-resizable-panels` | Resizable editor/terminal layout |

### Workspace Management

| Package | Purpose |
|---------|---------|
| `@beep/schema` | Effect Schema utilities for workspace validation |
| `@beep/utils` | Effect collection/string utilities |
| `@vercel/kv` | KV storage for workspace sharing |
| `fast-glob` | File system pattern matching |

## Development Commands

Run these commands from the repository root:

```bash
# Start development server with Turbopack and WebContainer support
bun run dev --filter @beep/interfere

# Type checking
bun run check --filter @beep/interfere

# Linting (Biome)
bun run lint --filter @beep/interfere

# Auto-fix lint issues
bun run lint:fix --filter @beep/interfere

# Run tests
bun run test --filter @beep/interfere

# Production build
bun run build --filter @beep/interfere
```

### Package-Local Scripts

If you need to run scripts from within the package directory:

```bash
cd apps/interfere

# Development with HTTPS (required for WebContainer SharedArrayBuffer)
bun run dev:https

# Start production server
bun run start

# Check for circular dependencies
bun run lint:circular
```

## Environment Configuration

Environment variables are managed via `dotenvx` from the repository root `.env` file.

### Required Variables

| Variable | Type | Description |
|----------|------|-------------|
| `KV_REST_API_URL` | Server | Vercel KV REST API endpoint for workspace sharing |
| `KV_REST_API_TOKEN` | Server | Vercel KV authentication token |
| `NEXT_PUBLIC_STATIC_URL` | Public | Base URL for static assets |
| `DATABASE_URL` | Server | PostgreSQL connection string (for auth) |
| `REDIS_URL` | Server | Redis connection for Better Auth sessions |
| `AUTH_SECRET` | Server | Better Auth secret key |

**Important**: Never read `process.env` directly. Use `serverEnv` from `@beep/shared-env/ServerEnv` or validated config from `@beep/shared-server`.

## Effect Pattern Compliance

### Required Import Style

```typescript
// ✅ Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";

// ✅ Single-letter aliases for collections
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
```

### Forbidden Native Methods

```typescript
// ❌ NEVER use native array methods
items.map(fn)
items.filter(fn)
Array.from(iterable)

// ✅ Use Effect Array utilities
F.pipe(items, A.map(fn))
F.pipe(items, A.filter(fn))
F.pipe(iterable, A.fromIterable)

// ❌ NEVER use native string methods
str.toUpperCase()
str.split(" ")

// ✅ Use Effect String utilities
F.pipe(str, Str.toUpperCase)
F.pipe(str, Str.split(" "))
```

## WebContainer Requirements

### Browser Compatibility

WebContainers require:
- **Chrome/Edge 84+** or **Firefox 89+**
- **Cross-Origin Isolation** enabled via headers:
  ```
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  ```
- **SharedArrayBuffer** support
- **HTTPS** in production (or localhost in development)

### Security Headers

The Next.js configuration automatically sets required headers for WebContainer:

```javascript
// next.config.mjs
{
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }
      ]
    }]
  }
}
```

## Workspace Sharing

Workspaces can be shared via compressed URLs:

1. **Export**: Workspace state is serialized, compressed with ZIP, and stored in Vercel KV
2. **Share**: Short URL is generated with workspace ID
3. **Import**: Recipient loads workspace from URL parameter, decompresses, and mounts in WebContainer

The sharing service is implemented using Effect RPC for type-safe client-server communication.

## Testing Strategy

- **Unit tests**: Colocated in `test/` directory
- **Test runner**: Bun test with TestKit compatibility
- **Effect testing**: Use utilities from `@beep/testkit`
- **Component testing**: React Testing Library patterns
- **WebContainer mocking**: Mock WebContainer service for isolated testing

## Build Configuration

### Next.js Config (`next.config.mjs`)

The configuration delegates to `@beep/build-utils/beepNextConfig` with WebContainer-specific overrides:

- **Turbopack**: Enabled for faster builds
- **React Compiler**: Automatic optimization
- **WASM Support**: Configured for WebContainer and dprint WASM modules
- **Security Headers**: Cross-origin isolation for SharedArrayBuffer
- **Module Federation**: Monaco editor ESM handling

### TypeScript Config

- **Path Aliases**: `@/*` maps to `src/*`, `@beep/*` for workspace packages
- **Strict Mode**: Full type safety enforcement
- **Module Resolution**: `NodeNext` for WebContainer compatibility

## Contributor Guidelines

### Development Workflow

1. **Effect-First**: Use `Effect.gen`, `pipe`, and Effect utilities exclusively
2. **Type Safety**: No `any`, `@ts-ignore`, or unchecked casts
3. **Import Guardrails**: Follow namespace import conventions
4. **WebContainer Lifecycle**: Always use scoped Effects for WebContainer resources
5. **Atom Management**: Register new atoms in workspace context or global registry

### Before Committing

- [ ] `bun run check --filter @beep/interfere` passes
- [ ] `bun run lint --filter @beep/interfere` passes
- [ ] No native array/string/object methods introduced
- [ ] WebContainer file operations use scoped Effects
- [ ] Monaco models are properly disposed when files are removed

### Playground-Specific Patterns

- **File Operations**: Always use `WebContainer` service methods, never raw WebContainer API
- **Monaco Integration**: Use `@effect/monaco-editor` for TypeScript language features
- **Terminal Management**: Shell processes are scoped to WebContainer lifecycle
- **DevTools Proxy**: Traces forwarded via NDJSON stream from WebContainer to UI
- **Workspace Serialization**: Use `Schema.encode`/`Schema.decode` for type-safe persistence

## Observability

### Telemetry

- **Provider**: `@effect/opentelemetry` with OTLP exports
- **Spans**: Automatic tracing via `Effect.withSpan`
- **Logs**: Structured JSON logging with `Effect.log*`
- **DevTools Integration**: Real-time trace visualization in Trace Viewer tab

### Performance Monitoring

- React Compiler optimizations
- Turbopack build acceleration
- WebContainer boot time tracking
- Monaco model creation metrics

## Related Documentation

- [Root AGENTS.md](/AGENTS.md) — Monorepo guardrails
- [apps/interfere/AGENTS.md](/apps/interfere/AGENTS.md) — App-specific patterns
- [@beep/ui README](/packages/ui/ui/README.md) — UI component library
- [@beep/runtime-client README](/packages/runtime/client/README.md) — Client runtime
- [WebContainer API Docs](https://webcontainers.io/api) — WebContainer reference
- [Effect DevTools](https://github.com/Effect-TS/experimental) — DevTools protocol

## License

See [LICENSE](./LICENSE) file in this directory.
