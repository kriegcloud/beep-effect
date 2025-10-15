• Runtime Performance

  - Audit hot paths for unnecessary package transpilation: every surface listed
    under transpilePackages in apps/web/next.config.ts:35 forces Turbopack to
    recompile on each edit. Pre-build leaf packages (e.g. via tsup or effect/
    cli) and drop them from that array so Next 16 can rely on workspace .d.ts
    output instead of live transpilation.
  - Remove the config.watchOptions = { poll: 1000 } override in apps/web/
    next.config.ts:78 (or guard it behind an opt-in env). Polling watchers
    negate the OS-native file watching that Next 16 beta + Turbopack ship, which
    needlessly pegs CPUs on large repos.
  - Adopt the Next 16 Partial Prerendering tooling (beta blog) for high-traffic
    routes once data dependencies are isolated; pair it with React Compiler
    profiles already enabled (reactCompiler: true) to trim server response time.
  - Profile Effect layers for redundant composition: caching frequently-
    requested Layers (DB, runtime) in packages/runtime/* via Layer.memoize keeps
    request bootstrap cost down when Bun spins workers.

  TypeScript / TS Server

  - The root tsconfig.json lists every workspace reference (tsconfig.json:16-
    96); the language server eagerly opens them all, even if a dev edits a
    single slice. Split this into solution-style entry-points per vertical
    (iam/files/runtime/ui) and use “composite leaf -> slice solution -> root
    solution” to cut initial project graph size.
  - Enable the TS 5.6+ compilerOptions.disableSourceOfProjectReferenceRedirect
    in app-level configs to stop the editor from crawling emitted .d.ts for
    every workspace hop; it keeps inference stable with moduleResolution:
    "bundler" while reducing background work.
  - Tighten watch spans by excluding generated folders (e.g. dist/**, .turbo/
    **, .next/**) directly in each tsconfig.build.json; today they are
    implicitly included, so tsserver walks them when preserveWatchOutput is on.

  Package Dependencies

  - Run bunx syncpack dedupe (already configured) after auditing heavy dual
    installs like lodash and lodash-es; favor lodash-es with ESM tree-shaking
    and drop the CommonJS build from the catalog to shrink bundles.
  - Replace broad icon packs (@iconify/react, lucide-react, mui icons) with pre-
    generated sprite subsets using the existing tooling/repo-scripts pipeline;
    shipping smaller icon modules trims client-side JS and boosts cold start.
  - Flag rarely-used editor packages (@tiptap/*, @univerjs/*, svelte-gantt)
    behind Next 16’s app/(marketing) route-level code-splitting instead of core
    bundles. If they are only needed in the MCP app, move them to that workspace
    to reduce the web app dependency surface.

  Next.js 16 Configuration

  - Opt into the beta’s new experimental.optimizePackageImports entries for
    @effect/*, @mui/icons-material, and react-phone-number-input; the current
    list (apps/web/next.config.ts:115) covers only a subset, so extending it
    avoids large eager chunks.
  - Use the generateStaticParams + prerender metadata from the beta release for
    routes that can statically hydrate, and gate dynamic data with the stability
    config. This pairs well with Bun’s fast cold start.
  - Evaluate adopting the beta next lint rules targeting React Compiler
    compatibility to catch patterns that block further runtime optimizations.
  - Keep an eye on the beta’s breaking-webpack changes: because you augment
    config.experiments.layers and async WASM (apps/web/next.config.ts:93),
    validate they still apply when Turbopack takes over—some flags are
    ignored, so migrate to the Turbopack equivalents (turbopack.resolve.alias,
    turbopack.wasm).

  Turbo Pipeline

  - The blanket dependsOn: ["^build"] for check, test, and coverage in
    turbo.json:40-59 causes every upstream package to rebuild before linting
    or testing. Replace with more targeted tags (e.g. "dependsOn": ["^check"]
    or ["^build#types"]) and publish specific pipeline outputs so only type
    artifacts are consumed.
  - Define granular outputs for package-level builds (e.g. packages/*/dist/**)
    and exclude transient directories (.turbo, tmp) so the cache stays warm and
    remote caching (if enabled later) is deterministic.
  - Set env blocks for tasks that truly need secrets (web#build already does);
    other tasks will then cache across machines without leaking .env.
  - For dev tasks running with --concurrency=36 (package.json:17-18), profile
    Bun workers—dropping concurrency to match physical cores reduces contention
    and makes Turbo scheduling more predictable.

  Natural next steps: (1) decide which packages can be pre-built to shrink
  transpilePackages, (2) reshape the TS solution graph per slice, (3) prototype
  Turbo task targeting on a single vertical and measure dev server cold/warm
  timings.
