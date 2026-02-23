# ESLint Config Design

> P2 Design Document — Concrete eslint-plugin-jsdoc configuration for enforcing the JSDoc standard.

## Package Dependencies

```json
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-plugin-jsdoc": "^50.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0"
  }
}
```

These go in the root `package.json` devDependencies via the workspace catalog.

---

## ESLint Flat Config

File: `eslint.config.mjs` (root level)

```javascript
import jsdoc from "eslint-plugin-jsdoc"
import tsParser from "@typescript-eslint/parser"

// ─── JSDoc Documentation Rules ─────────────────────────────────────────
const jsdocRules = {
  files: ["tooling/*/src/**/*.ts"],
  ignores: [
    "tooling/*/src/internal/**/*.ts",
    "tooling/*/src/**/*.test.ts",
    "tooling/*/src/**/*.spec.ts",
    "**/*.d.ts",
  ],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  plugins: { jsdoc },
  settings: {
    jsdoc: {
      mode: "typescript",
      tagNamePreference: {
        returns: "returns",
        augments: "extends",
        // Custom tags (not renamed)
        domain: "domain",
        provides: "provides",
        depends: "depends",
        errors: "errors",
      },
    },
  },
  rules: {
    // ── Presence Rules (Error) ───────────────────────────────────────

    // Require JSDoc on all exported symbols
    "jsdoc/require-jsdoc": ["error", {
      publicOnly: true,
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
      },
      contexts: [
        "ExportNamedDeclaration > VariableDeclaration",
        "ExportNamedDeclaration > TSTypeAliasDeclaration",
        "ExportNamedDeclaration > TSInterfaceDeclaration",
      ],
      checkConstructors: false,
      checkGetters: false,
      checkSetters: false,
    }],

    // Require non-empty description
    "jsdoc/require-description": ["error", {
      contexts: [
        "FunctionDeclaration",
        "ClassDeclaration",
        "VariableDeclaration",
        "TSTypeAliasDeclaration",
        "TSInterfaceDeclaration",
      ],
    }],

    // Require @param on all function parameters
    "jsdoc/require-param": ["error", {
      checkDestructured: false,
      checkRestProperty: false,
    }],

    // Require @param descriptions
    "jsdoc/require-param-description": "error",

    // Require @returns on functions with return values
    "jsdoc/require-returns": ["error", {
      forceRequireReturn: false,
      forceReturnsWithAsync: false,
    }],

    // Require @returns description
    "jsdoc/require-returns-description": "error",

    // ── Quality Rules (Error) ────────────────────────────────────────

    // Prevent docs that just restate the symbol name
    "jsdoc/informative-docs": "error",

    // Disallow type annotations in JSDoc (TypeScript handles types)
    "jsdoc/no-types": "error",

    // No empty description blocks
    "jsdoc/no-blank-block-descriptions": "error",

    // ── Quality Rules (Warning) ──────────────────────────────────────

    // Require complete sentences (capital start, period end, 20+ chars)
    "jsdoc/match-description": ["warn", {
      matchDescription: "^[A-Z].{18,}\\.$",
      message: "Description must start with a capital letter, be at least 20 characters, and end with a period.",
      contexts: [
        "FunctionDeclaration",
        "ClassDeclaration",
        "VariableDeclaration",
        "TSTypeAliasDeclaration",
        "TSInterfaceDeclaration",
      ],
    }],

    // ── Tag Validation Rules (Error) ─────────────────────────────────

    // Only allow recognized tags
    "jsdoc/check-tag-names": ["error", {
      definedTags: [
        // Standard
        "since", "category", "example", "deprecated", "internal", "ignore",
        "param", "returns", "throws", "see", "remarks", "summary",
        "typeParam", "packageDocumentation",
        // Custom Effect tags
        "domain", "provides", "depends", "errors",
      ],
    }],

    // Validate @param names match function signature
    "jsdoc/check-param-names": "error",

    // ── Tag Ordering (Warning) ───────────────────────────────────────

    // Enforce consistent tag ordering per jsdoc-standard.md
    "jsdoc/sort-tags": ["warn", {
      tagSequence: [
        { tags: ["summary"] },
        { tags: ["remarks"] },
        { tags: ["example"] },
        { tags: ["param", "typeParam"] },
        { tags: ["returns"] },
        { tags: ["throws", "errors"] },
        { tags: ["see"] },
        { tags: ["provides", "depends"] },
        { tags: ["domain", "category"] },
        { tags: ["since", "deprecated"] },
        { tags: ["internal"] },
        { tags: ["packageDocumentation"] },
      ],
    }],

    // ── Style Rules (Warning) ────────────────────────────────────────

    // Enforce multiline JSDoc format
    "jsdoc/multiline-blocks": ["warn", {
      noSingleLineTags: [],
    }],

    // Blank line between tags
    "jsdoc/tag-lines": ["warn", {
      count: 0,
      noEndLine: true,
    }],
  },
}

// ─── File Overview Rule (separate config for index/barrel files) ────
const fileOverviewRules = {
  files: ["tooling/*/src/index.ts", "tooling/*/src/**/index.ts"],
  plugins: { jsdoc },
  settings: {
    jsdoc: { mode: "typescript" },
  },
  rules: {
    // Index files must have @packageDocumentation file-level doc
    "jsdoc/require-file-overview": ["error", {
      tags: {
        packageDocumentation: {
          mustExist: true,
          preventDuplicates: true,
        },
        since: {
          mustExist: true,
          preventDuplicates: true,
        },
      },
    }],
  },
}

// ─── Module File Rule (all source files should have file-level docs) ─
const moduleDocRules = {
  files: ["tooling/*/src/**/*.ts"],
  ignores: [
    "tooling/*/src/internal/**/*.ts",
    "tooling/*/src/**/*.test.ts",
    "tooling/*/src/**/*.spec.ts",
    "tooling/*/src/**/index.ts",
    "**/*.d.ts",
  ],
  plugins: { jsdoc },
  settings: {
    jsdoc: { mode: "typescript" },
  },
  rules: {
    // Non-index source files should have @module or @packageDocumentation
    "jsdoc/require-file-overview": ["warn", {
      tags: {
        since: {
          mustExist: true,
          preventDuplicates: true,
        },
      },
    }],
  },
}

export default [
  jsdocRules,
  fileOverviewRules,
  moduleDocRules,
]
```

---

## Rule Justification

| Rule | Severity | Rationale |
|------|----------|-----------|
| `require-jsdoc` | error | Every export must be indexed. Missing JSDoc = missing from search. |
| `require-description` | error | Description is the primary embedding text. Empty = no semantic search value. |
| `informative-docs` | error | "The package name" restating the identifier adds zero search value. |
| `no-types` | error | TypeScript handles types. JSDoc types cause duplication and drift. |
| `check-tag-names` | error | Custom tags (@domain, @provides) must be recognized to be extracted. |
| `check-param-names` | error | Param docs must match actual signature to be useful. |
| `require-param` | error | Every parameter needs a semantic description for search. |
| `require-param-description` | error | Bare @param with no text adds no search value. |
| `require-returns` | error | Return semantics are critical for function discovery. |
| `match-description` | warn | Quality bar enforced gradually. Warn first, promote to error later. |
| `sort-tags` | warn | Consistent ordering helps extractors but isn't blocking. |
| `require-file-overview` | error/warn | Module-level docs scope search results. Error for index files, warn for others. |

---

## Custom Rules

Two custom ESLint rules are needed beyond what `eslint-plugin-jsdoc` provides:

### Rule 1: `require-since-semver`

Validates that `@since` tags contain valid semver versions.

```typescript
// eslint-rules/require-since-semver.ts
import { ESLintUtils } from "@typescript-eslint/utils"

const SEMVER_RE = /^\d+\.\d+\.\d+$/

export const requireSinceSemver = ESLintUtils.RuleCreator(
  (name) => `https://github.com/beep/eslint-rules/${name}`
)({
  name: "require-since-semver",
  meta: {
    type: "problem",
    docs: {
      description: "Require @since tag with valid semver on all exports",
    },
    schema: [],
    messages: {
      missingSince: "Exported symbol '{{name}}' must have a @since tag.",
      invalidSemver: "@since value '{{value}}' is not valid semver. Expected format: X.Y.Z",
    },
  },
  defaultOptions: [],
  create(context) {
    function checkNode(node: any) {
      if (!isExported(node)) return

      const jsdoc = context.sourceCode.getJSDocComment(node)
      if (!jsdoc) {
        context.report({
          node,
          messageId: "missingSince",
          data: { name: getSymbolName(node) },
        })
        return
      }

      const sinceMatch = jsdoc.value.match(/@since\s+(\S+)/)
      if (!sinceMatch) {
        context.report({
          node,
          messageId: "missingSince",
          data: { name: getSymbolName(node) },
        })
      } else if (!SEMVER_RE.test(sinceMatch[1])) {
        context.report({
          node,
          messageId: "invalidSemver",
          data: { value: sinceMatch[1] },
        })
      }
    }

    return {
      FunctionDeclaration: checkNode,
      ClassDeclaration: checkNode,
      VariableDeclaration: checkNode,
      TSTypeAliasDeclaration: checkNode,
      TSInterfaceDeclaration: checkNode,
    }
  },
})

const isExported = (node: any): boolean =>
  node.parent?.type === "ExportNamedDeclaration" ||
  node.parent?.type === "ExportDefaultDeclaration"

const getSymbolName = (node: any): string =>
  node.id?.name ?? node.declarations?.[0]?.id?.name ?? "anonymous"
```

### Rule 2: `require-schema-annotations`

Validates that Schema definitions include `.annotate()` with required fields.

```typescript
// eslint-rules/require-schema-annotations.ts
import { ESLintUtils } from "@typescript-eslint/utils"

export const requireSchemaAnnotations = ESLintUtils.RuleCreator(
  (name) => `https://github.com/beep/eslint-rules/${name}`
)({
  name: "require-schema-annotations",
  meta: {
    type: "problem",
    docs: {
      description: "Require .annotate() on exported Schema definitions with identifier, title, description",
    },
    schema: [],
    messages: {
      missingAnnotate: "Exported schema '{{name}}' must call .annotate() with { identifier, title, description }.",
      missingField: "Schema '{{name}}' .annotate() is missing required field: {{field}}.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator": (node: any) => {
        const init = node.init
        if (!init) return

        // Check if this is a Schema pipeline (contains S.Struct, S.Class, S.brand, etc.)
        const source = context.sourceCode.getText(init)
        const isSchema = /\bS\.(Struct|Class|Union|brand|TaggedStruct|Literal|String|Number|Boolean|Array|Record)\b/.test(source)
        if (!isSchema) return

        // Check for .annotate() call
        const hasAnnotate = /\.annotate\s*\(/.test(source)
        if (!hasAnnotate) {
          context.report({
            node,
            messageId: "missingAnnotate",
            data: { name: node.id?.name ?? "unknown" },
          })
          return
        }

        // Check for required fields in annotate
        const annotateMatch = source.match(/\.annotate\s*\(\s*\{([^}]+)\}/)
        if (annotateMatch) {
          const annotateContent = annotateMatch[1]
          const requiredFields = ["identifier", "title", "description"]
          for (const field of requiredFields) {
            if (!annotateContent.includes(field)) {
              context.report({
                node,
                messageId: "missingField",
                data: { name: node.id?.name ?? "unknown", field },
              })
            }
          }
        }
      },
    }
  },
})
```

---

## Integration with Existing Monorepo

### Directory Structure

```
eslint-rules/                      # Custom ESLint rules
  require-since-semver.ts
  require-schema-annotations.ts
  index.ts
eslint.config.mjs                  # Root flat config
```

### package.json (root) — Additional Scripts

```json
{
  "scripts": {
    "lint:jsdoc": "eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'",
    "lint:jsdoc:fix": "eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts' --fix"
  }
}
```

### Lefthook Integration

```yaml
# lefthook.yml (root)
pre-commit:
  parallel: true
  commands:
    jsdoc-lint:
      glob: "tooling/*/src/**/*.ts"
      exclude: "*.test.ts|*.spec.ts|internal/"
      run: npx eslint --no-warn-ignored {staged_files}
      stage_fixed: true
```

---

## Gradual Adoption Strategy

### Phase 1: Warn on All, Error on New Files

Start with all quality rules as warnings. Set `require-jsdoc` and `require-description` to error immediately — these are the minimum for search indexing.

```javascript
// eslint.config.mjs (Phase 1 override)
const phase1Override = {
  files: ["tooling/*/src/**/*.ts"],
  rules: {
    "jsdoc/match-description": "warn",  // Not error yet
    "jsdoc/sort-tags": "off",           // Not enforced yet
    "jsdoc/require-file-overview": "off", // Not enforced yet
  },
}
```

### Phase 2: Promote Quality Rules to Error

After existing code is brought to standard:

```javascript
// eslint.config.mjs (Phase 2 — after backfill)
const phase2Promotions = {
  files: ["tooling/*/src/**/*.ts"],
  rules: {
    "jsdoc/match-description": "error",
    "jsdoc/sort-tags": "warn",
    "jsdoc/require-file-overview": "warn",
  },
}
```

### Phase 3: Full Enforcement

All rules at target severity. Custom rules enabled.

---

## Docgen Configuration Update

Update `docgen.json` per package to enforce descriptions:

```json
{
  "$schema": "node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "enforceDescriptions": true,
  "enforceExamples": false,
  "enforceVersion": true,
  "exclude": [
    "src/internal/**/*.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts"
  ],
  "parseCompilerOptions": "tsconfig.json"
}
```

Changes from current config:
- `enforceDescriptions`: `false` → `true`
- Added test file exclusions

---

## tsdoc.json

Place at repo root for custom tag recognition by IDEs and tools:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "tagDefinitions": [
    {
      "tagName": "@domain",
      "syntaxKind": "block",
      "allowMultiple": false
    },
    {
      "tagName": "@provides",
      "syntaxKind": "block",
      "allowMultiple": true
    },
    {
      "tagName": "@depends",
      "syntaxKind": "block",
      "allowMultiple": true
    },
    {
      "tagName": "@errors",
      "syntaxKind": "block",
      "allowMultiple": true
    }
  ],
  "supportForTags": {
    "@since": { "supported": true },
    "@category": { "supported": true },
    "@example": { "supported": true },
    "@remarks": { "supported": true },
    "@see": { "supported": true },
    "@deprecated": { "supported": true },
    "@internal": { "supported": true },
    "@packageDocumentation": { "supported": true },
    "@throws": { "supported": true },
    "@param": { "supported": true },
    "@returns": { "supported": true },
    "@typeParam": { "supported": true },
    "@summary": { "supported": true },
    "@domain": { "supported": true },
    "@provides": { "supported": true },
    "@depends": { "supported": true },
    "@errors": { "supported": true }
  }
}
```

---

## Suppression Rules

For cases where lint rules need to be suppressed:

```typescript
// Suppress for a single symbol (rare, must have comment explaining why)
// eslint-disable-next-line jsdoc/require-description -- re-export with description in source module
export { Thing } from "./Thing.js"

// Never suppress these rules:
// - jsdoc/require-jsdoc (every export must be documented)
// - jsdoc/no-types (never put types in JSDoc)
// - jsdoc/check-tag-names (custom tags must be registered)
```
