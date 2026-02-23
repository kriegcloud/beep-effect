You are in `/home/elpresidank/YeeBois/projects/beep-effect2`. Task: enable docgen for `{PACKAGE_NAME}` (scope form, e.g., `@beep/errors`) using the same patterns as `@beep/types`, `@beep/utils`, `@beep/invariant`, `@beep/identity`, and `@beep/schema`.

Guardrails
- Read root `AGENTS.md` plus the package’s own `AGENTS.md`. Obey Effect import rules (namespace imports; no native Array/String/Object helpers—use Effect modules).
- Keep edits small, ASCII-only, prefer `apply_patch`. Do not start long-running infra.

Docgen documentation requirements (must pass analyzer/docgen)
- Every exported symbol (functions, classes, interfaces, types, namespaces, re-exports) needs a JSDoc block with **@category**, **@example**, and **@since**.
- Module entry files (`src/index.ts` and any side modules) need top-of-file JSDoc with @category + @since + @example.
- Re-export statements (`export * from "./foo"`) need their own JSDoc block with @category + @since (and usually a short description + example).
- Docgen walks examples it synthesizes; missing tags anywhere will fail `analyze-jsdoc.ts` and docgen parsing.

Steps to configure docgen for a package
1) Add `docgen` script to the package (if missing): `"docgen": "bunx docgen"`.
2) Create `docgen.json` in the package root (adjust paths/aliases to the workspace slice):
```
{
  "$schema": "../../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/{WORKSPACE_PATH}/src/",
  "exclude": [], // only exclude if absolutely needed
  "parseCompilerOptions": {
    "baseUrl": ".",
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2023",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true,
    "paths": {
      "@beep/{slug}": ["./src/index.ts"],
      "@beep/{slug}/*": ["./src/*"],
      // mirror tsconfig deps actually imported by the package:
      "@beep/utils": ["../utils/src/index.ts"],
      "@beep/utils/*": ["../utils/src/*"],
      "@beep/schema": ["../schema/src/index.ts"],
      "@beep/schema/*": ["../schema/src/*"],
      "@beep/invariant": ["../invariant/src/index.ts"],
      "@beep/invariant/*": ["../invariant/src/*"],
      "@beep/constants": ["../constants/src/index.ts"],
      "@beep/constants/*": ["../constants/src/*"],
      "@beep/identity": ["../identity/src/index.ts"],
      "@beep/identity/*": ["../identity/src/*"],
      "@beep/types": ["../types/src/index.ts"],
      "@beep/types/*": ["../types/src/*"],
      // add stubs for generated modules if needed (see next section)
      "@beep/constants/_generated": [
        "{ABS_PATH_TO_PACKAGE}/docgen-stubs/constants/_generated/index.ts",
        "../constants/src/_generated/index.ts"
      ],
      "@beep/constants/_generated/*": [
        "{ABS_PATH_TO_PACKAGE}/docgen-stubs/constants/_generated/*",
        "../constants/src/_generated/*"
      ]
    }
  },
  "examplesCompilerOptions": { /* copy parseCompilerOptions exactly */ }
}
```

3) Wire the package into docs tooling:
   - `tooling/repo-scripts/src/docs-copy.ts`: add `{ slug, workspacePath, docsFolder: "docs/modules", navOrder }` to `PACKAGE_TARGETS`.
   - `tooling/repo-scripts/src/run-docs-lint.ts`: include the slug in `scopes`.
   - `tooling/repo-scripts/src/analyze-jsdoc.ts`: add the slug to `SCOPE_PATHS`.
   - `turbo.json`: ensure the docgen pipeline includes the package under docgen inputs/outputs if new.
4) Run docgen and publish:
   - From repo root: `env PATH=/home/elpresidank/.bun/bin:$PATH bun run docgen --filter={PACKAGE_NAME}` (or `bunx docgen` inside the package).
   - Copy site docs: `bunx tsx tooling/repo-scripts/src/docs-copy.ts {slug}` to populate `/docs/{slug}`.
   - Optional lint: `bunx tsx tooling/repo-scripts/src/run-docs-lint.ts --scope {slug}`.
5) Verify outputs:
   - `packages/.../{slug}/docs` has `modules/**/*` and examples; `docs/{slug}` regenerated.
   - If examples fail, check for missing stubs or missing @since/@category/@example on any export or re-export.

Deliverable for agents: summarize edits + commands + remaining checks (e.g., rerun docgen/docs-copy/lint).
