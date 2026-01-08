# Docgen Configuration Reference

> Complete reference for `docgen.json` configuration files.

Each package that uses docgen requires a `docgen.json` file. This document covers all configuration options and best practices.

## Table of Contents

- [File Location](#file-location)
- [Schema Reference](#schema-reference)
- [Configuration Options](#configuration-options)
- [Compiler Options](#compiler-options)
- [Path Mappings](#path-mappings)
- [Exclusion Patterns](#exclusion-patterns)
- [Complete Examples](#complete-examples)
- [Generating Configuration](#generating-configuration)

---

## File Location

Configuration files are located at the package root:

```
packages/
└── common/
    └── contract/
        ├── docgen.json      # Configuration file
        ├── package.json
        ├── src/
        └── docs/            # Generated output
```

---

## Schema Reference

The configuration follows the `@effect/docgen` schema:

```json
{
  "$schema": "../../../node_modules/@effect/docgen/schema.json"
}
```

### TypeScript Type Definition

```typescript
interface DocgenConfig {
  $schema?: string;
  srcDir?: string;
  outDir?: string;
  srcLink?: string;
  exclude?: string[];
  parseCompilerOptions?: CompilerOptions;
  examplesCompilerOptions?: CompilerOptions;
}

interface CompilerOptions {
  noEmit?: boolean;
  strict?: boolean;
  skipLibCheck?: boolean;
  moduleResolution?: string;
  module?: string;
  target?: string;
  lib?: string[];
  paths?: Record<string, string[]>;
}
```

---

## Configuration Options

### $schema

Path to the JSON schema for IDE validation.

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json"
}
```

The relative path varies based on package depth:
- `packages/common/contract` → `"../../node_modules/@effect/docgen/schema.json"`
- `packages/iam/domain` → `"../../../node_modules/@effect/docgen/schema.json"`

### srcDir

Source directory containing TypeScript files.

```json
{
  "srcDir": "src"
}
```

**Default**: `"src"`

### outDir

Output directory for generated documentation.

```json
{
  "outDir": "docs"
}
```

**Default**: `"docs"`

### srcLink

URL prefix for "Edit on GitHub" links in generated docs.

```json
{
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/contract/src/"
}
```

**Note**: Include trailing slash.

### exclude

Glob patterns for files to exclude from documentation.

```json
{
  "exclude": [
    "src/internal/**/*.ts",
    "src/__tests__/**/*.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.ts"
  ]
}
```

Common exclusion patterns:

| Pattern | Purpose |
|---------|---------|
| `src/internal/**/*.ts` | Internal implementation details |
| `src/__tests__/**/*.ts` | Test files |
| `src/**/*.spec.ts` | Spec files |
| `src/**/*.test.ts` | Test files |
| `src/**/index.ts` | Re-export files (optional) |

---

## Compiler Options

### parseCompilerOptions

TypeScript compiler options used when parsing source files.

```json
{
  "parseCompilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}
```

### examplesCompilerOptions

TypeScript compiler options for validating `@example` blocks.

```json
{
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "paths": {
      "@beep/contract": ["./src/index.ts"],
      "@beep/schema": ["../schema/src/index.ts"]
    }
  }
}
```

### Recommended Compiler Options

```json
{
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

| Option | Value | Purpose |
|--------|-------|---------|
| `noEmit` | `true` | Don't generate output files |
| `strict` | `true` | Enable strict type checking |
| `skipLibCheck` | `true` | Skip type checking of .d.ts files |
| `moduleResolution` | `"Bundler"` | Modern bundler resolution |
| `module` | `"ES2022"` | ES module output |
| `target` | `"ES2022"` | Modern JavaScript target |
| `lib` | `["ES2022", "DOM", "DOM.Iterable"]` | Include DOM APIs for examples |

---

## Path Mappings

Path mappings allow `@example` blocks to import from `@beep/*` packages.

### Self-Reference

Map the current package to its source:

```json
{
  "paths": {
    "@beep/contract": ["./src/index.ts"]
  }
}
```

### Sibling Packages

Map sibling packages using relative paths:

```json
{
  "paths": {
    "@beep/schema": ["../schema/src/index.ts"],
    "@beep/utils": ["../utils/src/index.ts"]
  }
}
```

### Wildcard Pattern

For packages in different directories:

```json
{
  "paths": {
    "@beep/*": ["../../../packages/*/src/index.ts"]
  }
}
```

### Complete Path Mapping Example

```json
{
  "examplesCompilerOptions": {
    "paths": {
      "@beep/contract": ["./src/index.ts"],
      "@beep/schema": ["../schema/src/index.ts"],
      "@beep/utils": ["../utils/src/index.ts"],
      "@beep/identity": ["../identity/src/index.ts"],
      "@beep/*": ["../../../packages/*/src/index.ts"]
    }
  }
}
```

### Path Resolution Guide

From `packages/common/contract/docgen.json`:

| Package | Relative Path |
|---------|---------------|
| Same directory (`packages/common/*`) | `../{name}/src/index.ts` |
| Different group (`packages/iam/*`) | `../../iam/{name}/src/index.ts` |
| Shared (`packages/shared/*`) | `../../shared/{name}/src/index.ts` |

---

## Exclusion Patterns

### Standard Exclusions

```json
{
  "exclude": [
    "src/internal/**/*.ts"
  ]
}
```

### Extended Exclusions

```json
{
  "exclude": [
    "src/internal/**/*.ts",
    "src/__tests__/**/*.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/testing/**/*.ts",
    "src/dev/**/*.ts"
  ]
}
```

### Glob Pattern Reference

| Pattern | Matches |
|---------|---------|
| `src/internal/**/*.ts` | All `.ts` files in `src/internal/` recursively |
| `src/**/*.test.ts` | All `.test.ts` files anywhere in `src/` |
| `src/utils/internal.ts` | Specific file |
| `src/**/index.ts` | All `index.ts` files |

---

## Complete Examples

### Minimal Configuration

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs"
}
```

### Standard Configuration

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/contract/src/",
  "exclude": ["src/internal/**/*.ts"]
}
```

### Full Configuration

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/contract/src/",
  "exclude": [
    "src/internal/**/*.ts",
    "src/__tests__/**/*.ts"
  ],
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "paths": {
      "@beep/contract": ["./src/index.ts"],
      "@beep/schema": ["../schema/src/index.ts"],
      "@beep/utils": ["../utils/src/index.ts"],
      "@beep/identity": ["../identity/src/index.ts"],
      "@beep/invariant": ["../invariant/src/index.ts"],
      "@beep/types": ["../types/src/index.ts"],
      "@beep/*": ["../../../packages/*/src/index.ts"]
    }
  }
}
```

---

## Generating Configuration

### Automatic Generation

Use the init command to generate configuration:

```bash
# Preview
bun run docgen:init -- -p packages/common/contract --dry-run

# Generate
bun run docgen:init -- -p packages/common/contract

# Force overwrite
bun run docgen:init -- -p packages/common/contract --force
```

### Init Command Behavior

The init command:

1. Finds the best tsconfig (`tsconfig.src.json` > `tsconfig.build.json` > `tsconfig.json`)
2. Extracts existing `@beep/*` path mappings
3. Discovers `@beep/*` dependencies from `package.json`
4. Generates path mappings for all dependencies
5. Sets appropriate compiler options

### Manual Creation

Create `docgen.json` manually:

```bash
cat > packages/common/my-package/docgen.json << 'EOF'
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "exclude": ["src/internal/**/*.ts"]
}
EOF
```

---

## Validation

### Check Configuration

The analyze command validates configuration:

```bash
bun run docgen:analyze -- -p packages/common/contract
```

Errors will show:
- Missing configuration file
- Invalid JSON syntax
- Schema validation failures

### IDE Support

With `$schema` set, your IDE provides:
- Autocompletion for options
- Validation of values
- Documentation on hover

---

## Troubleshooting

### Missing Path Mappings

**Symptom**: `@example` blocks fail to compile with "Cannot find module '@beep/...'"

**Solution**: Add the missing package to `paths`:

```json
{
  "paths": {
    "@beep/missing-package": ["../missing-package/src/index.ts"]
  }
}
```

### Wrong Schema Path

**Symptom**: IDE doesn't validate configuration

**Solution**: Adjust `$schema` path based on package depth:

```json
// packages/common/contract (depth 2)
"$schema": "../../node_modules/@effect/docgen/schema.json"

// packages/iam/domain (depth 2)
"$schema": "../../node_modules/@effect/docgen/schema.json"

// packages/_internal/db-admin (depth 2)
"$schema": "../../node_modules/@effect/docgen/schema.json"
```

### Exclusion Not Working

**Symptom**: Internal files still appear in documentation

**Solution**: Check glob pattern syntax:

```json
// Correct
"exclude": ["src/internal/**/*.ts"]

// Incorrect (missing **)
"exclude": ["src/internal/*.ts"]
```

---

## Related Documentation

- [DOCGEN.md](./DOCGEN.md) - Main command reference
- [DOCGEN_QUICK_START.md](./DOCGEN_QUICK_START.md) - Getting started guide
- [DOCGEN_AGENTS.md](./DOCGEN_AGENTS.md) - AI agent details
- [DOCGEN_TROUBLESHOOTING.md](./DOCGEN_TROUBLESHOOTING.md) - Common issues
