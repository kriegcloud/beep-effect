# AGENTS — apps/interfere

## Purpose & Fit
- Interactive Effect TypeScript playground running in the browser via WebContainer API
- Provides a full-featured development environment: Monaco editor, terminal emulation, Effect DevTools trace viewer
- Next.js 15 App Router host running React 19 with React Compiler and Turbopack
- Enables code sharing via URL shortening service (Vercel KV or in-memory fallback)
- Minimal route structure: root editor page + auth flows for sign-in/sign-up

## Core Architecture

### WebContainer Integration
- `src/editor/services/webcontainer.ts` — Effect service wrapping `@webcontainer/api` for browser-based Node.js runtime
- Manages file system operations, process spawning, and shell execution entirely in-browser
- Single semaphore ensures only one WebContainer instance runs at a time
- Automatic TypeScript type acquisition from installed dependencies
- Real-time file system watching and Monaco model synchronization

### Editor Components
- `src/editor/index.tsx` — main `CodeEditor` component with resizable panels (explorer, editor, terminal/trace viewer)
- `src/editor/components/file-editor.tsx` — Monaco editor integration with Effect-first workspace state
- `src/editor/components/file-explorer.tsx` — file tree navigation with create/rename/delete operations
- `src/editor/components/terminal.tsx` — xterm.js terminal with theme switching (Dracula/NightOwlishLight)
- `src/editor/components/trace-viewer.tsx` — Effect DevTools trace visualization with waterfall, tree, and detail views

### State Management
- `src/editor/atoms/workspace.ts` — Jotai atoms for workspace handles, file selection, terminal instances
- `src/editor/domain/workspace.ts` — Effect Schema models: `Workspace`, `File`, `Directory`, `WorkspaceShell`
- Atom-based runtime built from Effect layers: `Loader`, `Terminal`, `WebContainer`, `Toaster`
- File system operations tracked via `Workspace.filePaths` map and updated reactively

### Code Formatting & Type Safety
- Automatic dprint formatter integration (JSON, TypeScript) via WASM plugins loaded from `/vendor/dprint/`
- Real-time TypeScript type acquisition by traversing pnpm `.pnpm` store in WebContainer
- Monaco `addExtraLib` for all `.d.ts` files found in dependencies
- Workspace-specific `tsconfig.json` and `dprint.json` configurations

### URL Shortening & Sharing
- `src/services/shorten/` — Effect service for compressing and sharing workspace snapshots
- `src/services/compression.ts` — gzip compression for workspace serialization
- Vercel KV (via `@vercel/kv`) for production, in-memory fallback for development
- Hash-based deduplication (SHA256, first 12 chars)

## Surface Map

### Routes
- `src/app/layout.tsx` — root layout with `GlobalProviders`, `RegistryProvider`, `KaServices`, and `getAppConfig` via `runServerPromise`
- `src/app/page.tsx` — renders `CodeEditor` (currently shows `SimpleLayout` with "Beep" placeholder)
- `src/app/auth/sign-in/` — IAM sign-in flow (delegates to `@beep/iam-ui`)
- `src/app/auth/sign-up/` — IAM sign-up flow (delegates to `@beep/iam-ui`)
- `src/app/api/v1/auth/[...all]/route.ts` — Better Auth API handler

### Provider Stack
- `src/GlobalProviders.tsx` — provider chain:
  - `BeepProvider` → client ManagedRuntime from `@beep/runtime-client`
  - `RegistryContext.Provider` → Jotai atom registry with initial values
  - `InitColorSchemeScript` → MUI color scheme hydration
  - `I18nProvider` → internationalization
  - `DevToolsProvider` → TanStack dev tools (form, query)
  - `SettingsProvider` → user preferences
  - `LocalizationProvider` → date/number formatting
  - `AppRouterCacheProvider` → MUI Emotion cache
  - `ThemeProvider` → MUI theming
  - `BreakpointsProvider` → responsive breakpoints
  - `ConfirmProvider` → confirmation dialogs
  - `IamProvider` → authentication context
  - `MotionLazy` → Framer Motion lazy loading
  - Global UI: `Snackbar`, `ProgressBar`, `SettingsDrawer`

### Configuration
- `next.config.mjs` — delegates to `@beep/build-utils/beepNextConfig` for Turbopack, React Compiler, SVGR, security headers
- `public/zeroperl.wasm` — WASM binary (purpose TBD)
- Default workspace config references dprint formatters at `/vendor/dprint/plugins/` (TypeScript, JSON)

## Usage Patterns

### Creating a Workspace
```typescript
import * as Effect from "effect/Effect";
import { Workspace, WorkspaceShell, makeFile, makeDirectory } from "@beep/interfere/editor/domain/workspace";

const workspace = new Workspace({
  name: "my-playground",
  dependencies: {
    "effect": "latest",
    "@effect/platform": "latest",
    "@effect/platform-node": "latest",
  },
  shells: [new WorkspaceShell({ command: "../run src/main.ts" })],
  initialFilePath: "src/main.ts",
  tree: [
    makeDirectory("src", [
      makeFile("main.ts", `import { Effect } from "effect"

const program = Effect.gen(function*() {
  yield* Effect.log("Hello, Effect!")
})

program.pipe(NodeRuntime.runMain)
`),
    ]),
  ],
});
```

### Workspace File Operations
```typescript
import * as Effect from "effect/Effect";
import { useWorkspaceHandle } from "@beep/interfere/editor/context/workspace";

function FileManager() {
  const handle = useWorkspaceHandle();

  // Create file
  const createFile = () => handle.createFile(["example.ts", "File", { parent: undefined }]);

  // Rename file
  const renameFile = (file: File) => handle.renameFile([file, "renamed.ts"]);

  // Remove file
  const removeFile = (file: File) => handle.removeFile(file);

  return /* ... */;
}
```

### Running Commands in WebContainer
```typescript
import * as Effect from "effect/Effect";
import { WebContainer } from "@beep/interfere/editor/services/webcontainer";

const installDeps = Effect.gen(function* () {
  const container = yield* WebContainer;
  const handle = yield* container.createWorkspaceHandle(workspace);

  // Run command and wait for exit
  yield* handle.run("pnpm install");

  // Spawn command and get process handle
  const process = yield* handle.spawn("pnpm dev");
});
```

## Development Workflow

### Root Scripts
```bash
# Development server (includes Claude Code inspector)
bun run dev --filter @beep/interfere

# Type checking
bun run check --filter @beep/interfere

# Linting
bun run lint --filter @beep/interfere
bun run lint:fix --filter @beep/interfere

# Testing
bun run test --filter @beep/interfere

# Production build
bun run build --filter @beep/interfere
```

### Package-Local Scripts
```bash
cd apps/interfere

# Development with HTTPS
bun run dev:https

# Start production server
bun run start

# Check circular dependencies
bun run lint:circular
```

## Key Dependencies

### Core Runtime
- `@webcontainer/api` — browser-based Node.js runtime
- `@effect/monaco-editor` — Monaco editor integration with Effect
- `@xterm/xterm` + `@xterm/addon-fit` — terminal emulation
- `effect` — Effect runtime and utilities
- `@beep/runtime-client` / `@beep/runtime-server` — managed Effect runtimes

### Editor Tooling
- `@dprint/formatter` — code formatting (TypeScript, JSON)
- `marked` + `marked-plaintify` — markdown rendering
- `ultrahtml` — HTML processing
- `rehype-*` / `remark-*` — unified ecosystem for content processing

### UI Components
- `@beep/ui` — component library (MUI, shadcn/ui, Radix)
- `@beep/ui-core` — design tokens and theme configuration
- `lucide-react` — icon library
- `react-resizable-panels` — resizable panel layout

### State & Forms
- `jotai` + `jotai-x` — atomic state management
- `@effect-atom/atom-react` — Effect-based atoms
- `@tanstack/react-form` — form state management

### Storage & Compression
- `@vercel/kv` — Vercel KV for URL shortening
- `@zip.js/zip.js` — ZIP compression/decompression
- `browser-image-compression` — client-side image optimization

### Rich Text Editing
- `platejs` + `@platejs/*` — Plate editor framework
- Plugins: AI, autoformat, code blocks, markdown, media, tables, slash commands, etc.

## Authoring Guardrails

### Effect-First Patterns
- **Namespace imports**: `import * as Effect from "effect/Effect";`, `import * as A from "effect/Array";`, `import * as Str from "effect/String";`
- **No native methods**: Use Effect utilities (`A.map`, `Str.split`, `R.keys`) instead of native array/string/object methods
- **Schema-based models**: Use `Schema.Class`, `Schema.TaggedClass` for domain entities
- **Effect services**: Define services via `Effect.Service` with `scoped` lifecycle management

### WebContainer Safety
- Only one WebContainer instance per session (enforced by semaphore)
- Always use `Effect.acquireRelease` for processes/shells to ensure cleanup
- File operations should sync Monaco models with WebContainer file system
- Use `Effect.orDie` for workspace path lookups that should never fail

### Monaco Integration
- Create models via `monaco.editor.createModel(content, language, uri)`
- Always check `model.getValue() !== content` before calling `model.setValue()` to prevent infinite loops
- Dispose old models when renaming/removing files
- Use `monaco.Uri.file(path)` for file URIs

### Atom Best Practices
- Workspace-scoped atoms via `Atom.family` keyed by `Workspace` instance
- Use `Atom.fn` for Effect-based atom actions (create/rename/remove files)
- Subscribe to reactive state with `get.subscribe` for side effects
- Debounce high-frequency updates like terminal resizing

### Path Aliases
- Use `@beep/interfere/*` for internal app imports (configured in `tsconfig.json`)
- Never use relative `../../../` paths across package boundaries
- Import workspace packages via `@beep/*` aliases

## Environment Variables

Required variables (managed via `dotenvx` from root `.env`):

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_CAPTCHA_SITE_KEY` | Public | reCAPTCHA v3 site key for auth flows |
| `DATABASE_URL` | Server | PostgreSQL connection (for auth persistence) |
| `REDIS_URL` | Server | Redis connection (Better Auth sessions) |
| `AUTH_SECRET` | Server | Better Auth secret key |
| `KV_URL` | Server | Vercel KV URL (optional, falls back to memory) |
| `KV_REST_API_URL` | Server | Vercel KV REST API URL (optional) |
| `KV_REST_API_TOKEN` | Server | Vercel KV REST API token (optional) |

Never read `process.env` directly. Use validated config from `@beep/shared-env` or `@beep/shared-server`.

## Verifications

```bash
# Type safety across app + workspace packages
bun run check --filter @beep/interfere

# Biome formatting/import rules
bun run lint --filter @beep/interfere

# Auto-fix lint issues
bun run lint:fix --filter @beep/interfere

# Run test suite
bun run test --filter @beep/interfere

# Production build (React Compiler + Turbopack)
bun run build --filter @beep/interfere
```

## Contributor Checklist
- [ ] Updated this guide if workspace domain, editor components, or services changed
- [ ] Kept Effect import/collection guardrails intact (no native array/string/object methods)
- [ ] Added new environment variables to `@beep/shared-server` and documented here
- [ ] Verified WebContainer lifecycle management (no leaked processes/shells)
- [ ] Confirmed Monaco model disposal when files are removed/renamed
- [ ] Ensured atom cleanup in `Effect.scoped` blocks
- [ ] Ran `bun run check`, `bun run lint`, and `bun run build` before committing
