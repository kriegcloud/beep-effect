# create-package Template Inventory

Complete file-by-file specification for every file the `beep create-package` command will generate.

## Template Directory Layout

```
tooling/cli/src/commands/create-package/
├── templates/
│   ├── package.json.hbs
│   ├── tsconfig.json.hbs
│   ├── src-index.ts.hbs
│   ├── LICENSE.hbs
│   ├── README.md.hbs
│   ├── AGENTS.md.hbs
│   ├── ai-context.md.hbs
│   ├── docgen.json.hbs
│   ├── vitest.config.ts.hbs
│   └── docs-index.md.hbs
├── handler.ts          (refactored from create-package.ts)
└── index.ts            (re-export command)
```

Static files (no template variables) are generated as empty strings or constants directly in the handler:
- `test/.gitkeep` - empty file
- `dtslint/.gitkeep` - empty file
- `CLAUDE.md` - symlink to `AGENTS.md` (created via FileSystem.symlink)

## Template Variable Schema

```ts
interface TemplateContext {
  /** Package name without scope (e.g., "my-utils") */
  readonly name: string;
  /** Scoped package name (e.g., "@beep/my-utils") */
  readonly scopedName: string;
  /** Package type: "library" | "tool" | "app" */
  readonly type: string;
  /** User-provided description (defaults to empty string) */
  readonly description: string;
  /** Current year for LICENSE (e.g., "2026") */
  readonly year: string;
  /** Parent directory based on type ("tooling" or "apps") */
  readonly parentDir: string;
  /** Whether this is a tool type (for conditional deps) */
  readonly isTool: boolean;
  /** Whether this is an app type */
  readonly isApp: boolean;
  /** Whether this is a library type */
  readonly isLibrary: boolean;
}
```

## File Specifications

### 1. package.json.hbs

**Template Variables**: name, scopedName, description, isTool
**Validation**: Output validated through `encodePackageJsonPrettyEffect` (existing Schema)
**Note**: Continue using the PackageJson schema for validation. The template provides the initial structure, but the handler validates through Schema before writing.

```json
{
  "name": "{{scopedName}}",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "license": "MIT",
  "description": "{{description}}",
  "sideEffects": [],
  "exports": {
    "./package.json": "./package.json",
    ".": "./src/index.ts",
    "./*": "./src/*.ts",
    "./internal/*": null
  },
  "files": ["src/**/*.ts", "dist/**/*.js", "dist/**/*.js.map", "dist/**/*.d.ts", "dist/**/*.d.ts.map"],
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "exports": {
      "./package.json": "./package.json",
      ".": "./dist/index.js",
      "./*": "./dist/*.js",
      "./internal/*": null
    }
  },
  "scripts": {
    "codegen": "echo 'no codegen needed'",
    "build": "tsc -b tsconfig.json && bun run babel",
    "build:tsgo": "tsgo -b tsconfig.json && bun run babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "vitest",
    "coverage": "vitest --coverage",
    "docgen": "bunx @effect/docgen"
  },
  "dependencies": {
    "effect": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@effect/vitest": "catalog:"
  }
}
```

Conditional: if `isTool`, add `"@effect/platform-node": "catalog:"` to dependencies.

**Decision**: Keep package.json generation in TypeScript (not pure HBS) because we validate through the PackageJson Schema. The template serves as documentation of the target shape, but the handler builds the object programmatically and validates it. This is the existing pattern and works well.

### 2. tsconfig.json.hbs

**Template Variables**: (none - static content)

```json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "compilerOptions": {
    "types": ["node"],
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### 3. src-index.ts.hbs

**Template Variables**: scopedName

```ts
/**
 * {{scopedName}}
 *
 * @since 0.0.0
 */

/**
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0" as const
```

### 4. LICENSE.hbs

**Template Variables**: year

```
MIT License

Copyright (c) {{year}} beep-effect

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 5. README.md.hbs

**Template Variables**: scopedName, name, description

```markdown
# {{scopedName}}

{{description}}

## Installation

```bash
bun add {{scopedName}}
```

## Usage

```ts
import { VERSION } from "{{scopedName}}"
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Lint
bun run lint:fix
```

## License

MIT
```

### 6. AGENTS.md.hbs

**Template Variables**: scopedName, name, description

```markdown
# {{scopedName}} Agent Guide

## Purpose & Fit
- {{description}}

## Surface Map
| Module | Key exports | Notes |
| --- | --- | --- |
| `src/index.ts` | `VERSION` | Package entry point |

## Usage Snapshots
(Add usage examples as the package grows)

## Authoring Guardrails
- **Effect-first imports**: ALWAYS use namespace imports (`import * as Effect from "effect/Effect"`). NEVER use native Array/String helpers.
- **Tagged errors**: Use `S.TaggedErrorClass` for all error types.
- **Schema-based JSON**: Use `Schema.decodeUnknownEffect`/`Schema.encodeUnknownEffect` instead of `JSON.parse`/`JSON.stringify`.
- **Effect.fn**: Use `Effect.fn` for all functions returning Effects.

## Quick Recipes
```ts
import { VERSION } from "{{scopedName}}"
```

## Verifications
- `bunx turbo run test --filter={{scopedName}}`
- `bunx turbo run lint --filter={{scopedName}}`
- `bunx turbo run check --filter={{scopedName}}`

## Contributor Checklist
- [ ] All new exports have `/** @since 0.0.0 */` JSDoc annotations
- [ ] Tests added/updated for new functionality
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
```

### 7. ai-context.md.hbs

**Template Variables**: parentDir, name, scopedName, description

```markdown
---
path: {{parentDir}}/{{name}}
summary: {{description}}
tags: [effect]
---

# {{scopedName}}

{{description}}

## Architecture

(Document the module architecture as the package grows)

## Core Modules

| Module | Purpose |
|--------|---------|
| `index.ts` | Package entry point |

## Usage Patterns

```typescript
import { VERSION } from "{{scopedName}}"
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|

## Dependencies

**Internal**: (none)
**External**: `effect`

## Related

- **AGENTS.md** - Detailed contributor guidance
```

### 8. docgen.json.hbs

**Template Variables**: parentDir, name, scopedName

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "exclude": ["src/internal/**/*.ts"],
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/{{parentDir}}/{{name}}/src/",
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "target": "ES2022",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "rewriteRelativeImportExtensions": true,
    "allowImportingTsExtensions": true,
    "paths": {
      "effect": ["../../packages/effect/src/index.ts"],
      "{{scopedName}}": ["../../{{parentDir}}/{{name}}/src/index.ts"]
    }
  }
}
```

### 9. vitest.config.ts.hbs

**Template Variables**: (none - static content)

```ts
import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // Package-specific overrides
    },
  })
);
```

### 10. docs-index.md.hbs

**Template Variables**: (none - static content)

```markdown
---
title: API Reference
nav_order: 1
has_children: true
permalink: /docs
---
```

## Static Files (No Template)

### test/.gitkeep
Empty file. Created directly by handler.

### dtslint/.gitkeep
Empty file. Created directly by handler.

### CLAUDE.md
**Not a file** - created as a symbolic link pointing to `AGENTS.md`.
Created via `FileSystem.symlink("AGENTS.md", path.join(outputDir, "CLAUDE.md"))`.

## File Generation Order

1. Create directories: `src/`, `test/`, `dtslint/`, `docs/`
2. Generate template files (package.json through docs/index.md)
3. Write static files (test/.gitkeep, dtslint/.gitkeep)
4. Create CLAUDE.md symlink
5. Print summary

## Dry-Run Output Format

```
[dry-run] Would create package @beep/{name} (type: {type})
[dry-run] Directory: {outputDir}
[dry-run] Files:
  - package.json
  - tsconfig.json
  - src/index.ts
  - test/.gitkeep
  - dtslint/.gitkeep
  - LICENSE
  - README.md
  - AGENTS.md
  - ai-context.md
  - CLAUDE.md -> AGENTS.md (symlink)
  - docgen.json
  - vitest.config.ts
  - docs/index.md
```
