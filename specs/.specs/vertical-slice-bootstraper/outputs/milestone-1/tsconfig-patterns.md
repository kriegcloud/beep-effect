# TSConfig Patterns

> Comprehensive guide to TypeScript configuration in the `beep-effect` monorepo.

---

## 1. Overview

The monorepo uses a hierarchical TypeScript configuration system:

```
tsconfig.base.jsonc          # Base settings, path aliases
    |
    v
tsconfig.json                # Root config with project references
    |
    +---> tsconfig.slices/{slice}.json   # Slice group references
              |
              +---> packages/{slice}/{layer}/tsconfig.build.json
              +---> packages/{slice}/{layer}/tsconfig.src.json
              +---> packages/{slice}/{layer}/tsconfig.test.json
              +---> packages/{slice}/{layer}/tsconfig.json
```

### File Purposes

| File | Purpose |
|------|---------|
| `tsconfig.base.jsonc` | Shared compiler options and path aliases |
| `tsconfig.json` | Root project with references to slice groups |
| `tsconfig.slices/{slice}.json` | Groups all layer builds for a slice |
| `tsconfig.json` (per package) | Main config, references src + test |
| `tsconfig.src.json` | Source compilation settings |
| `tsconfig.build.json` | Production build with declarations |
| `tsconfig.test.json` | Test compilation settings |

---

## 2. Base Configuration

**File:** `tsconfig.base.jsonc`

This defines all shared TypeScript settings inherited by all packages:

```jsonc
{
  "compilerOptions": {
    // Incremental builds with project references
    "incremental": true,
    "composite": true,

    // Target modern JavaScript
    "target": "ES2024",
    "module": "ESNext",
    "moduleDetection": "force",
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "allowJs": false,
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,

    // Source and declaration maps
    "declarationMap": true,
    "sourceMap": true,

    // Strict type checking
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "allowImportingTsExtensions": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "allowUnusedLabels": false,
    "noUncheckedIndexedAccess": true,
    "strictNullChecks": true,
    "noUnusedParameters": true,

    // Module resolution
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,

    // Output settings
    "declaration": true,
    "noEmit": false,
    "noEmitOnError": true,

    // Type declarations
    "types": [],
    "lib": [
      "ESNext.Array",
      "ESNext.Collection",
      "ESNext.AsyncIterable",
      "ES2024",
      "DOM",
      "DOM.Iterable"
    ],

    // Experimental features
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    // Effect language service plugin
    "plugins": [
      {
        "name": "@effect/language-service",
        "transform": "@effect/language-service/transform"
      }
    ],

    // Path aliases (see section 5)
    "paths": {
      "*": ["./*"],
      // ... all @beep/* aliases
    }
  }
}
```

---

## 3. Per-Layer Templates

Each layer (domain, tables, server, client, ui) needs 4 tsconfig files.

### 3.1 tsconfig.json (Main)

```json
{
  "extends": "./tsconfig.src.json",
  "include": [],
  "references": [
    {
      "path": "tsconfig.src.json"
    },
    {
      "path": "tsconfig.test.json"
    }
  ]
}
```

### 3.2 tsconfig.src.json (Source)

```json
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["src"],
  "references": [
    {
      "path": "../../shared/domain"
    },
    {
      "path": "../../common/schema/tsconfig.src.json"
    }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/src",
    "rootDir": "src",
    "moduleResolution": "bundler",
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

**Note:** References vary by layer - see section 4.

### 3.3 tsconfig.build.json (Production Build)

```json
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "stripInternal": false,
    "composite": true,
    "declaration": true,
    "sourceMap": true
  },
  "references": [
    {
      "path": "../../shared/domain/tsconfig.build.json"
    },
    {
      "path": "../../common/schema/tsconfig.build.json"
    }
  ]
}
```

### 3.4 tsconfig.test.json (Tests)

```json
{
  "extends": "./tsconfig.src.json",
  "include": ["test"],
  "compilerOptions": {
    "types": ["bun-types", "node"],
    "outDir": "build/test",
    "rootDir": "test",
    "noEmit": true
  },
  "references": [
    {
      "path": "tsconfig.src.json"
    }
  ]
}
```

---

## 4. Layer-Specific References

Each layer has different dependencies, reflected in tsconfig references:

### 4.1 Domain Layer

```json
// tsconfig.src.json references
{
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../common/schema/tsconfig.src.json" }
  ]
}

// tsconfig.build.json references
{
  "references": [
    { "path": "../../shared/domain/tsconfig.build.json" },
    { "path": "../../common/schema/tsconfig.build.json" }
  ]
}
```

### 4.2 Tables Layer

```json
// tsconfig.src.json references
{
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../shared/tables/tsconfig.src.json" },
    { "path": "../../common/schema/tsconfig.src.json" },
    { "path": "../domain/tsconfig.src.json" }
  ]
}

// tsconfig.build.json references
{
  "references": [
    { "path": "../../shared/domain/tsconfig.build.json" },
    { "path": "../../shared/tables/tsconfig.build.json" },
    { "path": "../../common/schema/tsconfig.build.json" },
    { "path": "../domain/tsconfig.build.json" }
  ]
}
```

### 4.3 Server Layer

```json
// tsconfig.src.json references
{
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../shared/server/tsconfig.src.json" },
    { "path": "../../common/schema/tsconfig.src.json" },
    { "path": "../domain/tsconfig.src.json" },
    { "path": "../tables/tsconfig.src.json" }
  ]
}

// tsconfig.build.json references
{
  "references": [
    { "path": "../../shared/domain/tsconfig.build.json" },
    { "path": "../../shared/server/tsconfig.build.json" },
    { "path": "../../common/schema/tsconfig.build.json" },
    { "path": "../domain/tsconfig.build.json" },
    { "path": "../tables/tsconfig.build.json" }
  ]
}
```

### 4.4 Client Layer

```json
// tsconfig.src.json references
{
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../common/contract/tsconfig.src.json" },
    { "path": "../../common/schema/tsconfig.src.json" },
    { "path": "../domain/tsconfig.src.json" }
  ]
}

// tsconfig.build.json references
{
  "references": [
    { "path": "../../shared/domain/tsconfig.build.json" },
    { "path": "../../common/contract/tsconfig.build.json" },
    { "path": "../../common/schema/tsconfig.build.json" },
    { "path": "../domain/tsconfig.build.json" }
  ]
}
```

### 4.5 UI Layer

```json
// tsconfig.src.json references
{
  "references": [
    { "path": "../../ui/ui/tsconfig.src.json" },
    { "path": "../client/tsconfig.src.json" }
  ]
}

// tsconfig.build.json references
{
  "references": [
    { "path": "../../ui/ui/tsconfig.build.json" },
    { "path": "../client/tsconfig.build.json" }
  ]
}
```

---

## 5. Path Alias Registration

Each layer needs 3 path aliases in `tsconfig.base.jsonc`:

### Pattern

```jsonc
// Base alias (imports package root)
"@beep/{slice}-{layer}": [
  "./packages/{slice}/{layer}/src/index"
],

// Subpath alias (imports specific modules)
"@beep/{slice}-{layer}/*": [
  "./packages/{slice}/{layer}/src/*"
],

// Test alias (imports test utilities)
"@beep/{slice}-{layer}/test/*": [
  "./packages/{slice}/{layer}/test/*"
]
```

### Complete Example (customization slice)

```jsonc
{
  "compilerOptions": {
    "paths": {
      // Domain layer
      "@beep/customization-domain": [
        "./packages/customization/domain/src/index"
      ],
      "@beep/customization-domain/*": [
        "./packages/customization/domain/src/*"
      ],
      "@beep/customization-domain/test/*": [
        "./packages/customization/domain/test/*"
      ],

      // Tables layer
      "@beep/customization-tables": [
        "./packages/customization/tables/src/index"
      ],
      "@beep/customization-tables/*": [
        "./packages/customization/tables/src/*"
      ],
      "@beep/customization-tables/test/*": [
        "./packages/customization/tables/test/*"
      ],

      // Server layer
      "@beep/customization-server": [
        "./packages/customization/server/src/index"
      ],
      "@beep/customization-server/*": [
        "./packages/customization/server/src/*"
      ],
      "@beep/customization-server/test/*": [
        "./packages/customization/server/test/*"
      ],

      // Client layer
      "@beep/customization-client": [
        "./packages/customization/client/src/index"
      ],
      "@beep/customization-client/*": [
        "./packages/customization/client/src/*"
      ],
      "@beep/customization-client/test/*": [
        "./packages/customization/client/test/*"
      ],

      // UI layer
      "@beep/customization-ui": [
        "./packages/customization/ui/src/index"
      ],
      "@beep/customization-ui/*": [
        "./packages/customization/ui/src/*"
      ],
      "@beep/customization-ui/test/*": [
        "./packages/customization/ui/test/*"
      ]
    }
  }
}
```

---

## 6. TSConfig Slices

**File:** `tsconfig.slices/{slice}.json`

Groups all layer build configs for a slice:

```json
{
  "files": [],
  "references": [
    { "path": "../packages/{slice}/domain/tsconfig.build.json" },
    { "path": "../packages/{slice}/tables/tsconfig.build.json" },
    { "path": "../packages/{slice}/server/tsconfig.build.json" },
    { "path": "../packages/{slice}/client/tsconfig.build.json" },
    { "path": "../packages/{slice}/ui/tsconfig.build.json" }
  ]
}
```

**Example (customization.json):**

```json
{
  "files": [],
  "references": [
    { "path": "../packages/customization/domain/tsconfig.build.json" },
    { "path": "../packages/customization/tables/tsconfig.build.json" },
    { "path": "../packages/customization/server/tsconfig.build.json" },
    { "path": "../packages/customization/client/tsconfig.build.json" },
    { "path": "../packages/customization/ui/tsconfig.build.json" }
  ]
}
```

---

## 7. Root TSConfig

**File:** `tsconfig.json`

References all slice groups:

```json
{
  "extends": "./tsconfig.base.jsonc",
  "include": [
    "./syncpack.config.ts",
    "./knip.config.ts",
    "./sst.config.ts"
  ],
  "exclude": [
    "**/dist/**",
    "**/build/**",
    "**/.turbo/**",
    "**/.next/**",
    "**/.output/**",
    "**/.expo/**",
    "**/node_modules/**",
    "**/.*/"
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "disableSourceOfProjectReferenceRedirect": true,
    "disableReferencedProjectLoad": true,
    "disableSolutionSearching": true
  },
  "references": [
    { "path": "tsconfig.slices/common.json" },
    { "path": "tsconfig.slices/shared.json" },
    { "path": "tsconfig.slices/core.json" },
    { "path": "tsconfig.slices/ui.json" },
    { "path": "tsconfig.slices/iam.json" },
    { "path": "tsconfig.slices/documents.json" },
    { "path": "tsconfig.slices/runtime.json" },
    { "path": "tsconfig.slices/apps.json" },
    { "path": "tsconfig.slices/internal.json" },
    { "path": "tsconfig.slices/tooling.json" },
    { "path": "tsconfig.slices/customization.json" }
  ]
}
```

---

## 8. Reference Patterns

### Folder vs .json Distinction

In tsconfig references, there's an important distinction:

```json
// Reference to a FOLDER (uses tsconfig.json in that folder)
{ "path": "../../shared/domain" }

// Reference to a SPECIFIC FILE
{ "path": "../../shared/domain/tsconfig.build.json" }
```

**Rule:**
- In `tsconfig.src.json`, reference folders OR `tsconfig.src.json` files
- In `tsconfig.build.json`, reference `tsconfig.build.json` files specifically

### Example

```json
// tsconfig.src.json
{
  "references": [
    { "path": "../../shared/domain" },  // Folder reference
    { "path": "../../common/schema/tsconfig.src.json" }  // File reference
  ]
}

// tsconfig.build.json
{
  "references": [
    { "path": "../../shared/domain/tsconfig.build.json" },  // Build config
    { "path": "../../common/schema/tsconfig.build.json" }   // Build config
  ]
}
```

---

## 9. Generation Template

TypeScript pseudocode for generating tsconfig files:

```typescript
interface SliceConfig {
  slice: string;
  layers: Array<"domain" | "tables" | "server" | "client" | "ui">;
}

const generateTsConfigs = (config: SliceConfig) => {
  const { slice, layers } = config;

  // Generate path aliases for tsconfig.base.jsonc
  const pathAliases = layers.flatMap(layer => [
    [`@beep/${slice}-${layer}`, [`./packages/${slice}/${layer}/src/index`]],
    [`@beep/${slice}-${layer}/*`, [`./packages/${slice}/${layer}/src/*`]],
    [`@beep/${slice}-${layer}/test/*`, [`./packages/${slice}/${layer}/test/*`]],
  ]);

  // Generate tsconfig.slices/{slice}.json
  const sliceConfig = {
    files: [],
    references: layers.map(layer => ({
      path: `../packages/${slice}/${layer}/tsconfig.build.json`
    }))
  };

  // Generate per-layer configs
  layers.forEach(layer => {
    const basePath = `packages/${slice}/${layer}`;

    // tsconfig.json
    const mainConfig = {
      extends: "./tsconfig.src.json",
      include: [],
      references: [
        { path: "tsconfig.src.json" },
        { path: "tsconfig.test.json" }
      ]
    };

    // tsconfig.src.json
    const srcConfig = {
      extends: "../../../tsconfig.base.jsonc",
      include: ["src"],
      references: getReferencesForLayer(slice, layer, "src"),
      compilerOptions: {
        types: ["node", "bun"],
        outDir: "build/src",
        rootDir: "src",
        moduleResolution: "bundler",
        incremental: true,
        skipLibCheck: true,
        esModuleInterop: true
      }
    };

    // tsconfig.build.json
    const buildConfig = {
      extends: "./tsconfig.src.json",
      compilerOptions: {
        types: ["node", "bun"],
        outDir: "build/esm",
        declarationDir: "build/dts",
        stripInternal: false,
        composite: true,
        declaration: true,
        sourceMap: true
      },
      references: getReferencesForLayer(slice, layer, "build")
    };

    // tsconfig.test.json
    const testConfig = {
      extends: "./tsconfig.src.json",
      include: ["test"],
      compilerOptions: {
        types: ["bun-types", "node"],
        outDir: "build/test",
        rootDir: "test",
        noEmit: true
      },
      references: [{ path: "tsconfig.src.json" }]
    };
  });

  // Add reference to root tsconfig.json
  const rootReference = { path: `tsconfig.slices/${slice}.json` };

  return { pathAliases, sliceConfig, /* layer configs */ };
};

const getReferencesForLayer = (
  slice: string,
  layer: string,
  type: "src" | "build"
) => {
  const suffix = type === "build" ? "/tsconfig.build.json" : "";
  const srcSuffix = type === "src" ? "/tsconfig.src.json" : "";

  switch (layer) {
    case "domain":
      return [
        { path: `../../shared/domain${suffix || ""}` },
        { path: `../../common/schema/tsconfig.${type}.json` }
      ];
    case "tables":
      return [
        { path: `../../shared/domain${suffix || ""}` },
        { path: `../../shared/tables/tsconfig.${type}.json` },
        { path: `../../common/schema/tsconfig.${type}.json` },
        { path: `../domain/tsconfig.${type}.json` }
      ];
    case "server":
      return [
        { path: `../../shared/domain${suffix || ""}` },
        { path: `../../shared/server/tsconfig.${type}.json` },
        { path: `../../common/schema/tsconfig.${type}.json` },
        { path: `../domain/tsconfig.${type}.json` },
        { path: `../tables/tsconfig.${type}.json` }
      ];
    case "client":
      return [
        { path: `../../shared/domain${suffix || ""}` },
        { path: `../../common/contract/tsconfig.${type}.json` },
        { path: `../../common/schema/tsconfig.${type}.json` },
        { path: `../domain/tsconfig.${type}.json` }
      ];
    case "ui":
      return [
        { path: `../../ui/ui/tsconfig.${type}.json` },
        { path: `../client/tsconfig.${type}.json` }
      ];
    default:
      return [];
  }
};
```

---

## 10. Checklist

### Minimal Slice (3 layers: domain, tables, server)

- [ ] Create `packages/{slice}/domain/tsconfig.json`
- [ ] Create `packages/{slice}/domain/tsconfig.src.json`
- [ ] Create `packages/{slice}/domain/tsconfig.build.json`
- [ ] Create `packages/{slice}/domain/tsconfig.test.json`
- [ ] Create `packages/{slice}/tables/tsconfig.json`
- [ ] Create `packages/{slice}/tables/tsconfig.src.json`
- [ ] Create `packages/{slice}/tables/tsconfig.build.json`
- [ ] Create `packages/{slice}/tables/tsconfig.test.json`
- [ ] Create `packages/{slice}/server/tsconfig.json`
- [ ] Create `packages/{slice}/server/tsconfig.src.json`
- [ ] Create `packages/{slice}/server/tsconfig.build.json`
- [ ] Create `packages/{slice}/server/tsconfig.test.json`
- [ ] Add 9 path aliases to `tsconfig.base.jsonc`
- [ ] Create `tsconfig.slices/{slice}.json` with 3 references
- [ ] Add reference to `tsconfig.json`

### Complete Slice (5 layers)

- [ ] All minimal slice items above
- [ ] Create `packages/{slice}/client/tsconfig.json`
- [ ] Create `packages/{slice}/client/tsconfig.src.json`
- [ ] Create `packages/{slice}/client/tsconfig.build.json`
- [ ] Create `packages/{slice}/client/tsconfig.test.json`
- [ ] Create `packages/{slice}/ui/tsconfig.json`
- [ ] Create `packages/{slice}/ui/tsconfig.src.json`
- [ ] Create `packages/{slice}/ui/tsconfig.build.json`
- [ ] Create `packages/{slice}/ui/tsconfig.test.json`
- [ ] Add 6 more path aliases to `tsconfig.base.jsonc` (total 15)
- [ ] Update `tsconfig.slices/{slice}.json` with 5 references

### Verification

```bash
# Type check entire project
bun run check

# Build specific package
cd packages/{slice}/{layer} && bun run build

# Build all
bun run build
```

---

## 11. Reference Files

| File | Purpose |
|------|---------|
| `tsconfig.base.jsonc` | Base configuration with paths |
| `tsconfig.json` | Root config with slice references |
| `tsconfig.slices/customization.json` | Example slice group |
| `packages/customization/domain/tsconfig.json` | Example main config |
| `packages/customization/domain/tsconfig.src.json` | Example src config |
| `packages/customization/domain/tsconfig.build.json` | Example build config |
| `packages/customization/domain/tsconfig.test.json` | Example test config |
