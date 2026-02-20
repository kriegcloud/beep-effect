# TypeScript Configuration Patterns - effect-smol

**Analysis Date:** 2026-02-18
**Repository:** `.repos/effect-smol`

## Executive Summary

The effect-smol monorepo uses a sophisticated TypeScript configuration hierarchy with:
- **3-tier configuration inheritance** (base → packages → root)
- **Project references** for composite builds
- **Modern module resolution** (NodeNext with ES2022 target)
- **Strict type checking** with additional safety flags
- **Path aliases** for cross-package testing
- **37 total tsconfig files** across the monorepo

---

## Configuration Architecture

### Three-Layer Hierarchy

```
tsconfig.base.json           (Base compiler options - inherited by all)
    ↓
tsconfig.packages.json       (Package references - for building packages)
    ↓
tsconfig.json               (Root config - includes tests and project references)
```

### Additional Specialized Configs

- **scripts/tsconfig.json** - For build scripts
- **scratchpad/tsconfig.json** - For development/experimentation
- **packages/*/tsconfig.json** - Individual package configs (35 total)

---

## Root Configuration Files

### 1. tsconfig.base.json

The foundation config that all packages inherit from.

```jsonc
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "include": [],
  "compilerOptions": {
    // Build Configuration
    "outDir": "${configDir}/dist",           // Output relative to package
    "rootDir": "${configDir}/src",           // Source relative to package
    "incremental": true,                     // Enable incremental compilation
    "composite": true,                       // Enable project references

    // Module System (Modern Node.js)
    "target": "ES2022",                      // Modern JS features
    "module": "NodeNext",                    // Node.js ESM + CJS interop
    "moduleDetection": "force",              // Every file is a module
    "verbatimModuleSyntax": true,            // Preserve import/export syntax
    "allowJs": false,                        // TypeScript only (strict!)
    "rewriteRelativeImportExtensions": true, // .ts → .js in imports
    "erasableSyntaxOnly": true,              // Allows runtime with type removal

    // Source Maps & Declarations
    "declarationMap": true,                  // Enable declaration maps
    "sourceMap": true,                       // Enable source maps

    // Strict Type Checking
    "strict": true,                          // All strict checks enabled
    "exactOptionalPropertyTypes": true,      // undefined ≠ missing property
    "noUnusedLocals": true,                  // No unused variables
    "noUnusedParameters": true,              // No unused params
    "noImplicitOverride": true,              // Require override keyword
    "noFallthroughCasesInSwitch": true,     // No fallthrough cases

    // Build Optimizations
    "stripInternal": false,                  // Keep @internal (set true for publish)
    "skipLibCheck": true,                    // Skip lib type checking
    "noErrorTruncation": true,               // Full error messages
    "types": [],                             // No automatic @types/* loading

    // JSX Support
    "jsx": "react-jsx",

    // Effect Language Service Plugin
    "plugins": [{
      "name": "@effect/language-service",
      "transform": "@effect/language-service/transform",
      "namespaceImportPackages": ["effect", "@effect/*"],
      "diagnosticSeverity": {
        "globalErrorInEffectFailure": "off"
      }
    }]
  }
}
```

#### Key Design Decisions

**Why `module: "NodeNext"`?**
- Supports both ESM and CommonJS
- Respects package.json `"type": "module"`
- Proper Node.js module resolution

**Why `target: "ES2022"`?**
- Modern features (top-level await, class fields, etc.)
- Node.js 18+ support (minimum supported version)
- Smaller compiled output

**Why `verbatimModuleSyntax: true`?**
- Preserves type-only imports/exports
- Clear distinction between runtime and type imports
- Better tree-shaking

**Why `erasableSyntaxOnly: true`?**
- Allows running TS files directly with Node.js + type stripping
- Compatible with Bun and Deno native TypeScript support
- No transformers needed for basic execution

**Why `rewriteRelativeImportExtensions: true`?**
- Auto-converts `.ts` → `.js` in relative imports
- Required for ESM module resolution
- Prevents runtime errors

**Why `types: []`?**
- Explicit type dependencies only
- Prevents accidental global type pollution
- Each package declares needed types

**Why `exactOptionalPropertyTypes: true`?**
- Stronger type safety
- `{ x?: string }` means `x` can be missing, not `undefined`
- Catches common bugs

---

## Package-Level Configuration Patterns

### Pattern 1: Simple Package (Most Common)

```jsonc
// packages/opentelemetry/tsconfig.json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "references": [
    { "path": "../effect" }
  ]
}
```

### Pattern 2: Node.js Package

```jsonc
// packages/effect/tsconfig.json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Pattern 3: Bun Package

```jsonc
// packages/platform-bun/tsconfig.json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "references": [
    { "path": "../effect" },
    { "path": "../platform-node-shared" }
  ],
  "compilerOptions": {
    "types": ["bun"]
  }
}
```

### Pattern 4: Multi-Dependency Package

```jsonc
// packages/platform-node/tsconfig.json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "references": [
    { "path": "../effect" },
    { "path": "../platform-node-shared" }
  ],
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Pattern 5: Deep Nested Package

```jsonc
// packages/ai/anthropic/tsconfig.json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../../tsconfig.base.json",
  "include": ["src"],
  "references": [
    { "path": "../../effect" }
  ]
}
```

---

## Path Alias Conventions

### Root Config Aliases

All path aliases are in `tsconfig.json` (root), not in packages.

```jsonc
"paths": {
  // Pattern 1: Internal module access
  "effect/*": ["./packages/effect/src/*.ts"],

  // Pattern 2: Package index
  "@effect/PACKAGE": ["./packages/PATH/src/index.ts"],

  // Pattern 3: Package submodules
  "@effect/PACKAGE/*": ["./packages/PATH/src/*.ts"],

  // Pattern 4: Test utilities
  "effect-test/*": ["./packages/effect/test/*.ts"]
}
```

### Why Only in Root Config?

- Test-only feature
- Solves circular dependencies in tests
- Production code uses normal imports
- Path aliases not published

---

## Module Resolution Strategy

### Import Patterns

Effect-smol uses **explicit .ts extensions** in source code:

```typescript
// Source code imports (src/)
import { pipe } from "./Function.ts"
import * as Effect from "./Effect.ts"
import { makeLayer } from "./internal/layer.ts"
```

### Why .ts Extensions?

1. **ESM Compatibility**: ESM requires explicit extensions
2. **NodeNext Resolution**: TypeScript rewrites .ts → .js at compile time
3. **Runtime Support**: Works with Bun/Deno native TS support
4. **Explicit Dependencies**: Clear what files are imported

---

## Compiler Strictness Levels

### Base Strictness (All Packages)

```jsonc
"strict": true,                              // Enables all strict checks
"exactOptionalPropertyTypes": true,          // undefined ≠ missing
"noUnusedLocals": true,                      // No unused variables
"noUnusedParameters": true,                  // No unused params
"noImplicitOverride": true,                  // Require override keyword
"noFallthroughCasesInSwitch": true,         // No switch fallthrough
```

---

## Best Practices & Recommendations

### 1. Always Extend Base Config

```jsonc
{
  "extends": "../../tsconfig.base.json",
  // Override only what's necessary
}
```

### 2. Declare Project References

```jsonc
{
  "references": [
    { "path": "../effect" },
    { "path": "../dependency" }
  ]
}
```

### 3. Minimize CompilerOptions Overrides

Only override when necessary:
- `types` for runtime-specific types
- `resolveJsonModule` for JSON imports
- `rootDir`/`outDir` for special layouts

### 4. Use Relative Paths

```typescript
// Good
import { Effect } from "./Effect.ts"

// Bad (only in tests)
import { Effect } from "effect/Effect"
```

### 5. Keep .ts Extensions

```typescript
// Required for ESM
import { x } from "./module.ts"
```

### 6. Separate Test Config from Build Config

- Build: package tsconfig.json
- Tests: root tsconfig.json with paths

### 7. Use Composite for Libraries

All packages should have:
```jsonc
{
  "composite": true,
  "incremental": true
}
```

---

## Common Patterns Summary

| Pattern | Use Case | Key Features |
|---------|----------|--------------|
| Simple | Most packages | Extends base, minimal overrides |
| Node.js | Node runtime | `types: ["node"]` |
| Bun | Bun runtime | `types: ["bun"]` |
| Multi-dep | Complex packages | Multiple references |
| Nested | Scoped packages | Deep relative paths |
| JSON | Config consumers | `resolveJsonModule: true` |
| Standalone | Tools | No references |

---

## Key Takeaways for @beep/repo-cli

1. **Three-tier hierarchy**: base → packages → root
2. **Project references**: Enable incremental monorepo builds
3. **Modern module system**: NodeNext + ES2022
4. **Strict type checking**: All strict flags + extras
5. **Path aliases**: Test-only, solve circular dependencies
6. **Explicit .ts extensions**: Required for ESM
7. **Composite builds**: All packages are composite projects
8. **Minimal overrides**: Override only what's necessary
9. **Separate configs**: Build vs development/testing
10. **Effect language service**: Custom plugin for Effect patterns
