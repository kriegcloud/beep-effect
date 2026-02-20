# Documentation Generation & Enforcement Tooling Research

## Table of Contents
1. [@effect/docgen Deep Dive](#1-effectdocgen-deep-dive)
2. [Documentation Enforcement via Git Hooks](#2-documentation-enforcement-via-git-hooks)
3. [TypeDoc vs API Extractor vs @effect/docgen](#3-typedoc-vs-api-extractor-vs-effectdocgen)
4. [Custom Documentation Validators](#4-custom-documentation-validators)
5. [Documentation Standards That Enable Machine Reading](#5-documentation-standards-that-enable-machine-reading)
6. [Recommendations for beep-effect2](#6-recommendations-for-beep-effect2)

---

## 1. @effect/docgen Deep Dive

**Source**: [Effect-TS/docgen GitHub](https://github.com/Effect-TS/docgen)

### What It Does

@effect/docgen is an opinionated documentation generator for Effect projects. It scans TypeScript source files, extracts JSDoc annotations, and produces markdown documentation suitable for GitHub Pages. It was inspired by [docs-ts](https://github.com/gcanti/docs-ts) (by gcanti, the original fp-ts author).

### Key Capabilities

1. **Markdown generation** from JSDoc-annotated TypeScript exports
2. **Example validation** -- `@example` blocks are type-checked via ts-node with Node.js `assert`
3. **Enforcement of documentation standards** via three configurable boolean flags
4. **GitHub Pages integration** -- generates `_config.yml` with theme and search configuration
5. **Exclusion patterns** -- glob-based file exclusion from documentation

### Installation and Usage

```bash
pnpm add @effect/docgen -D
```

```json
{
  "scripts": {
    "docgen": "docgen"
  }
}
```

Requires Node.js v18+.

### Configuration (`docgen.json`)

```json
{
  "$schema": "node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "projectHomepage": "https://github.com/org/project",
  "theme": "mikearnaldi/just-the-docs",
  "enableSearch": true,
  "enforceDescriptions": false,
  "enforceExamples": false,
  "enforceVersion": true,
  "exclude": ["src/internal/**/*.ts"],
  "parseCompilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  },
  "examplesCompilerOptions": {
    "strict": true
  }
}
```

### Complete Configuration Schema

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `srcDir` | `string` | `"src"` | Directory to scan for TypeScript files |
| `outDir` | `string` | `"docs"` | Output directory for generated markdown |
| `projectHomepage` | `string` | from `package.json` | Link for auxiliary docs |
| `theme` | `string` | `"mikearnaldi/just-the-docs"` | GitHub Pages theme |
| `enableSearch` | `boolean` | `true` | Enable search in generated docs |
| `enforceDescriptions` | `boolean` | `false` | Require descriptions on all exports |
| `enforceExamples` | `boolean` | `false` | Require `@example` tags on all exports |
| `enforceVersion` | `boolean` | `true` | Require `@since` tags on all exports |
| `exclude` | `string[]` | `[]` | Glob patterns for files to skip |
| `parseCompilerOptions` | `object \| string` | `{}` | tsconfig for parsing (or path to tsconfig) |
| `examplesCompilerOptions` | `object \| string` | `{}` | tsconfig for example validation |

### Supported JSDoc Tags

| Tag | Purpose | Notes |
|-----|---------|-------|
| `@since` | Version the export was introduced | Enforced by default (`enforceVersion: true`) |
| `@category` | Groups related exports in output | Defaults to `"utils"` |
| `@example` | Type-checked code examples | Validated via ts-node execution |
| `@deprecated` | Marks as deprecated (strikethrough in output) | |
| `@internal` | Excludes from docs; works with TS `stripInternal` | |
| `@ignore` | Prevents doc generation for the block | |

### What It Does NOT Do

- **Does not validate documentation quality** -- it only checks presence (has a `@since`? has a description?) not content quality
- **Does not produce structured JSON** -- output is markdown only, not machine-readable metadata
- **Does not expose a programmatic API** -- it is a CLI tool, not a library
- **Does not validate individual field annotations** -- it operates at the export level, not at schema field level
- **Cannot be extended with plugins** -- unlike TypeDoc, it has no plugin system
- **Overloaded functions use only the first overload's documentation**

### How the Effect Monorepo Uses It

In the Effect monorepo, `pnpm docgen` runs in each package as part of the build pipeline. A post-processing script (`node scripts/docs.mjs`) transforms the raw output. The enforcement flags ensure every public export has a `@since` tag at minimum.

---

## 2. Documentation Enforcement via Git Hooks

### Strategy Overview

The most effective approach layers enforcement at three levels:

1. **Pre-commit** (fast, staged files only): lint JSDoc syntax and presence
2. **Pre-push** (heavier, full validation): run docgen build, type-check examples
3. **CI** (comprehensive): full docgen build + LLM quality review on PRs

### Husky + lint-staged Setup

**Install dependencies:**

```bash
pnpm add -D husky lint-staged eslint-plugin-jsdoc
npx husky init
```

**`.husky/pre-commit`:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx lint-staged
```

**`lint-staged.config.mjs`:**

```javascript
export default {
  "*.{ts,tsx}": [
    "eslint --fix --rule 'jsdoc/require-jsdoc: error' --rule 'jsdoc/require-description: error'",
  ],
};
```

### Lefthook Alternative (Better for Monorepos)

Lefthook offers parallel execution, built-in staged file filtering, and YAML configuration -- making it superior for monorepos.

**Install:**

```bash
pnpm add -D lefthook
npx lefthook install
```

**`lefthook.yml`:**

```yaml
pre-commit:
  parallel: true
  commands:
    jsdoc-lint:
      glob: "*.{ts,tsx}"
      run: npx eslint --no-warn-ignored {staged_files}
      stage_fixed: true

    docgen-check:
      glob: "*.{ts,tsx}"
      run: npx docgen --check 2>&1 || echo "Warning: docgen check failed (non-blocking)"
      fail_text: "Documentation generation would fail. Run 'pnpm docgen' to see errors."

pre-push:
  commands:
    full-docgen:
      run: pnpm docgen
      fail_text: "Documentation generation failed. Fix JSDoc issues before pushing."
```

### Pre-push Hook for Heavier Validation

**`.husky/pre-push`:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running documentation generation check..."
pnpm docgen 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: Documentation generation failed."
  echo "Fix JSDoc issues before pushing."
  exit 1
fi
```

### Gradual Adoption Strategies

#### Strategy 1: Enforce Only on New/Changed Files (lint-staged)

lint-staged inherently runs only on staged files, so new documentation rules automatically apply only to files being modified. This is the simplest gradual adoption path.

#### Strategy 2: Tiered ESLint Configs

```javascript
// eslint.config.mjs
import jsdoc from "eslint-plugin-jsdoc";

export default [
  // Baseline: warn on all files
  {
    files: ["src/**/*.ts"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-jsdoc": "warn",
      "jsdoc/require-description": "warn",
    },
  },
  // Strict: error on new modules (added after adoption date)
  {
    files: ["src/services/**/*.ts", "src/schemas/**/*.ts"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-jsdoc": "error",
      "jsdoc/require-description": "error",
      "jsdoc/require-description-complete-sentence": "error",
      "jsdoc/informative-docs": "error",
    },
  },
  // Legacy: disable on known undocumented files
  {
    files: ["src/legacy/**/*.ts"],
    rules: {
      "jsdoc/require-jsdoc": "off",
    },
  },
];
```

#### Strategy 3: Git Diff-Based Enforcement

```bash
#!/usr/bin/env bash
# Only enforce JSDoc rules on files added after a baseline commit
BASELINE_COMMIT="abc123"  # commit when rules were adopted

NEW_FILES=$(git diff --name-only --diff-filter=A "$BASELINE_COMMIT"..HEAD -- '*.ts')
if [ -n "$NEW_FILES" ]; then
  echo "$NEW_FILES" | xargs npx eslint --rule 'jsdoc/require-jsdoc: error'
fi
```

#### Strategy 4: lint-staged.config.mjs with Custom Logic

```javascript
// lint-staged.config.mjs
import { execSync } from "child_process";

export default {
  "*.ts": (files) => {
    // Only enforce strict rules on files created after adoption
    const newFiles = files.filter((f) => {
      try {
        // Check if file exists in main branch
        execSync(`git show main:${f}`, { stdio: "ignore" });
        return false; // exists in main, not new
      } catch {
        return true; // new file
      }
    });

    const commands = [
      // All files: basic syntax check
      `eslint ${files.join(" ")}`,
    ];

    if (newFiles.length > 0) {
      // New files: strict documentation requirements
      commands.push(
        `eslint --rule 'jsdoc/require-jsdoc: error' --rule 'jsdoc/require-description: error' ${newFiles.join(" ")}`
      );
    }

    return commands;
  },
};
```

### How Major Teams Enforce Documentation Standards in CI

1. **Effect-TS**: `enforceVersion: true` in docgen.json; `pnpm docgen` runs in CI; every export needs `@since`
2. **Microsoft/RushStack**: API Extractor produces `.api.md` review files that are committed to source control; CI fails if uncommitted API changes exist
3. **Angular**: Custom ESLint rules + TSDoc compliance checks in CI
4. **Nx**: TypeDoc JSON output validated in CI pipeline; broken doc links fail the build

---

## 3. TypeDoc vs API Extractor vs @effect/docgen

### Feature Comparison

| Feature | TypeDoc | API Extractor | @effect/docgen |
|---------|---------|---------------|----------------|
| **Primary output** | HTML + JSON | `.api.json` + `.d.ts` rollup | Markdown |
| **Structured data output** | Yes (JSON) | Yes (`.api.json`) | No |
| **Programmatic API** | Yes (`Application` class) | Yes (`api-extractor-model`) | No |
| **Plugin system** | Yes (serializer/renderer plugins) | Limited (forking recommended) | No |
| **Example validation** | No | No | Yes (ts-node type-checking) |
| **Enforcement flags** | No | Yes (API review files) | Yes (3 boolean flags) |
| **TSDoc compliance** | Partial | Strict | Custom (JSDoc-based) |
| **Monorepo support** | Good (entrypoints) | Excellent (cross-package refs) | Good (per-package) |
| **Search indexing** | Built-in | Via API Documenter | Via GitHub Pages |
| **JSON Schema** | `JSONOutput.ProjectReflection` | `ApiItem` hierarchy | N/A |
| **Machine-readable metadata** | Excellent | Excellent | Poor |

### TypeDoc: Best for Structured Metadata Extraction

TypeDoc is the best choice for extracting structured metadata suitable for indexing and semantic search.

**Programmatic API:**

```typescript
import * as td from "typedoc";

const app = await td.Application.bootstrapWithPlugins({
  entryPoints: ["src/index.ts"],
});

const project = await app.convert();
if (project) {
  // Generate JSON for indexing
  await app.generateJson(project, "api.json");
}
```

**JSON Output Structure (`ProjectReflection`):**

```json
{
  "id": 0,
  "name": "my-package",
  "variant": "project",
  "kind": 1,
  "packageName": "my-package",
  "packageVersion": "1.0.0",
  "children": [
    {
      "id": 1,
      "name": "MyClass",
      "variant": "declaration",
      "kind": 128,
      "comment": {
        "summary": [
          { "kind": "text", "text": "A class that does things." }
        ]
      },
      "children": [
        {
          "id": 2,
          "name": "myMethod",
          "kind": 2048,
          "signatures": [
            {
              "comment": {
                "summary": [{ "kind": "text", "text": "Does something." }],
                "blockTags": [
                  {
                    "tag": "@param",
                    "content": [{ "kind": "text", "text": "The input value" }],
                    "name": "value"
                  },
                  {
                    "tag": "@since",
                    "content": [{ "kind": "text", "text": "1.0.0" }]
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Key `kind` values:** Project=1, Module=2, Namespace=4, Enum=8, Variable=32, Function=64, Class=128, Interface=256, Property=1024, Method=2048, TypeAlias=2097152.

**Search-relevant options:**

```json
{
  "json": "api.json",
  "pretty": true,
  "searchInComments": true,
  "searchInDocuments": true,
  "searchCategoryBoosts": { "Core": 1.5 },
  "searchGroupBoosts": { "Classes": 1.2 }
}
```

### API Extractor: Best for API Surface Management

API Extractor excels at managing the public API surface across monorepo packages.

**`.api.json` Structure (via `@microsoft/api-extractor-model`):**

The data forms a tree hierarchy:
- `ApiModel` > `ApiPackage` > `ApiEntryPoint` > `ApiClass` / `ApiInterface` / `ApiFunction` / `ApiEnum` > `ApiMethod` / `ApiProperty` / `ApiEnumMember`

**Programmatic access:**

```typescript
import { ApiModel, ApiClass, ApiFunction } from "@microsoft/api-extractor-model";

const apiModel = new ApiModel();
apiModel.loadPackage("temp/my-package.api.json");

for (const pkg of apiModel.packages) {
  for (const entry of pkg.entryPoints) {
    for (const member of entry.members) {
      console.log(`${member.kind}: ${member.displayName}`);
      if (member.tsdocComment) {
        console.log(`  Summary: ${member.tsdocComment.summarySection}`);
      }
    }
  }
}
```

**API review file (`.api.md`)** -- committed to source control and diffed in PRs:

```markdown
## API Report File for "my-package"

// @public
export class MyService {
    constructor(config: ServiceConfig);
    getData(id: string): Promise<Data>;
}
```

**Best for semantic search?** The `.api.json` format is highly structured and includes full type information, doc comments, and cross-references. It could serve as input for a semantic search index. However, it requires more processing than TypeDoc JSON to extract human-readable documentation.

### @effect/docgen: Best for Effect Projects

@effect/docgen is purpose-built for Effect ecosystem conventions. Its main value is the `@example` type-checking and the enforcement flags. However, its markdown-only output makes it unsuitable as a structured metadata source for semantic search.

### Recommendation for Semantic Search

**TypeDoc JSON** is the strongest candidate for building a semantic search index:
- Rich structured output with `kind`, `name`, `comment.summary`, `blockTags`
- Programmatic API for custom extraction pipelines
- Plugin system for custom serialization
- Handles TypeScript generics, overloads, and complex types
- `typedoc-json-parser` (community package) simplifies consumption

---

## 4. Custom Documentation Validators

### eslint-plugin-jsdoc Rules for Quality Enforcement

**Full recommended TypeScript configuration:**

```javascript
// eslint.config.mjs
import jsdoc from "eslint-plugin-jsdoc";

export default [
  jsdoc.configs["flat/recommended-typescript-error"],
  {
    files: ["src/**/*.ts"],
    rules: {
      // Require JSDoc on all exports
      "jsdoc/require-jsdoc": ["error", {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: true,
          FunctionExpression: true,
        },
        contexts: [
          "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator",
          "ExportNamedDeclaration > TSTypeAliasDeclaration",
          "ExportNamedDeclaration > TSInterfaceDeclaration",
        ],
      }],

      // Require meaningful descriptions
      "jsdoc/require-description": ["error", {
        contexts: ["any"],
        descriptionStyle: "body",
      }],

      // Ensure descriptions are complete sentences
      "jsdoc/require-description-complete-sentence": ["error", {
        tags: ["param", "returns", "since"],
        abbreviations: ["e.g.", "i.e.", "etc.", "vs."],
      }],

      // Detect uninformative docs (just restating the name)
      "jsdoc/informative-docs": ["error", {
        uselessWords: ["a", "an", "the", "i", "in", "of", "s", "get", "set"],
      }],

      // Enforce description format via regex
      "jsdoc/match-description": ["error", {
        matchDescription: "^[A-Z].*\\.$",
        message: "Description must start with a capital letter and end with a period.",
        tags: {
          param: {
            match: "^[A-Z].*\\.$",
            message: "@param description must start with a capital letter and end with a period.",
          },
          returns: {
            match: "^[A-Z].*\\.$",
            message: "@returns description must start with a capital letter and end with a period.",
          },
        },
      }],

      // Require @since tag
      "jsdoc/check-tag-names": ["error", {
        definedTags: ["since", "category", "example", "internal"],
      }],

      // No types in JSDoc (TypeScript handles this)
      "jsdoc/no-types": "error",

      // Require @param for each parameter
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-name": "error",

      // Require @returns
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
    },
  },
];
```

### The `informative-docs` Rule (Semantic Quality Gate)

This rule is the closest existing ESLint rule to "semantic quality checking." It detects docs that merely restate the symbol name:

```typescript
// FAILS: just restates the name
/** The user id. */
let userId: string;

// PASSES: adds meaningful information
/** Unique identifier assigned during account registration. */
let userId: string;
```

**Configuration:**

```javascript
"jsdoc/informative-docs": ["error", {
  aliases: {
    // Treat these as synonymous with the code name
    emoji: ["smiley", "winkey", "emoticon"],
  },
  excludedTags: ["default", "category", "since"],
  uselessWords: ["a", "an", "the", "i", "in", "of", "s", "get", "set", "is", "has"],
}]
```

### Building Custom ESLint Rules for Project-Specific Requirements

**Example: Require `@since` tag with valid semver:**

```typescript
// eslint-local-rules/require-since-semver.ts
import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/org/project/blob/main/docs/rules/${name}.md`
);

export const requireSinceSemver = createRule({
  name: "require-since-semver",
  meta: {
    type: "problem",
    docs: {
      description: "Require @since tag with valid semver on all exports",
    },
    messages: {
      missingSince: "Exported symbol '{{name}}' must have a @since tag.",
      invalidSemver: "@since tag must contain a valid semver (e.g., @since 1.0.0).",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const SEMVER_RE = /^\d+\.\d+\.\d+$/;

    function checkNode(node: any) {
      const jsdocComments = context.sourceCode.getJSDocComment(node);
      if (!jsdocComments) {
        context.report({
          node,
          messageId: "missingSince",
          data: { name: node.id?.name ?? "anonymous" },
        });
        return;
      }

      const sinceMatch = jsdocComments.value.match(/@since\s+(\S+)/);
      if (!sinceMatch) {
        context.report({ node, messageId: "missingSince", data: { name: node.id?.name ?? "anonymous" } });
      } else if (!SEMVER_RE.test(sinceMatch[1])) {
        context.report({ node, messageId: "invalidSemver" });
      }
    }

    return {
      "ExportNamedDeclaration > FunctionDeclaration": checkNode,
      "ExportNamedDeclaration > ClassDeclaration": checkNode,
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator": checkNode,
      "ExportNamedDeclaration > TSTypeAliasDeclaration": checkNode,
      "ExportNamedDeclaration > TSInterfaceDeclaration": checkNode,
    };
  },
});
```

**Example: Require minimum description length:**

```typescript
// eslint-local-rules/min-description-length.ts
import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/org/project/blob/main/docs/rules/${name}.md`
);

export const minDescriptionLength = createRule({
  name: "min-description-length",
  meta: {
    type: "suggestion",
    docs: {
      description: "Require JSDoc descriptions to be at least N words long",
    },
    messages: {
      tooShort: "JSDoc description must be at least {{min}} words (found {{actual}}).",
    },
    schema: [
      {
        type: "object",
        properties: {
          minWords: { type: "integer", minimum: 1, default: 5 },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ minWords: 5 }],
  create(context, [options]) {
    return {
      "ExportNamedDeclaration"(node: any) {
        const jsdoc = context.sourceCode.getJSDocComment(node.declaration ?? node);
        if (!jsdoc) return;

        // Extract description (text before first @tag)
        const descMatch = jsdoc.value.match(/^\s*\*?\s*(.+?)(?=\n\s*\*?\s*@|\s*$/s);
        if (!descMatch) return;

        const description = descMatch[1]
          .replace(/\n\s*\*?\s*/g, " ")
          .trim();
        const wordCount = description.split(/\s+/).filter(Boolean).length;

        if (wordCount < options.minWords) {
          context.report({
            node,
            messageId: "tooShort",
            data: {
              min: String(options.minWords),
              actual: String(wordCount),
            },
          });
        }
      },
    };
  },
});
```

### ts-morph for Documentation Validation

ts-morph provides the most powerful programmatic access to JSDoc for custom validation scripts that go beyond what ESLint rules can do.

**JSDoc extraction and validation script:**

```typescript
// scripts/validate-docs.ts
import { Project, SyntaxKind, type ExportedDeclarations } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

interface DocIssue {
  file: string;
  line: number;
  symbol: string;
  issue: string;
}

const issues: DocIssue[] = [];

for (const sourceFile of project.getSourceFiles("src/**/*.ts")) {
  const relativePath = sourceFile.getFilePath();

  for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
    for (const decl of declarations) {
      // Get JSDoc nodes
      const jsDocs = "getJsDocs" in decl
        ? (decl as any).getJsDocs()
        : [];

      if (jsDocs.length === 0) {
        issues.push({
          file: relativePath,
          line: decl.getStartLineNumber(),
          symbol: name,
          issue: "Missing JSDoc documentation",
        });
        continue;
      }

      const doc = jsDocs[0];
      const description = doc.getDescription().trim();

      // Check description quality
      if (description.length < 20) {
        issues.push({
          file: relativePath,
          line: decl.getStartLineNumber(),
          symbol: name,
          issue: `Description too short (${description.length} chars, min 20)`,
        });
      }

      // Check for @since tag
      const tags = doc.getTags();
      const hasSince = tags.some(
        (t: any) => t.getTagName() === "since"
      );
      if (!hasSince) {
        issues.push({
          file: relativePath,
          line: decl.getStartLineNumber(),
          symbol: name,
          issue: "Missing @since tag",
        });
      }

      // Check for @category tag
      const hasCategory = tags.some(
        (t: any) => t.getTagName() === "category"
      );
      if (!hasCategory) {
        issues.push({
          file: relativePath,
          line: decl.getStartLineNumber(),
          symbol: name,
          issue: "Missing @category tag",
        });
      }

      // Check description starts with capital, ends with period
      if (description && !/^[A-Z]/.test(description)) {
        issues.push({
          file: relativePath,
          line: decl.getStartLineNumber(),
          symbol: name,
          issue: "Description must start with a capital letter",
        });
      }
      if (description && !/\.\s*$/.test(description)) {
        issues.push({
          file: relativePath,
          line: decl.getStartLineNumber(),
          symbol: name,
          issue: "Description must end with a period",
        });
      }
    }
  }
}

if (issues.length > 0) {
  console.error(`Found ${issues.length} documentation issues:\n`);
  for (const issue of issues) {
    console.error(`  ${issue.file}:${issue.line} - ${issue.symbol}: ${issue.issue}`);
  }
  process.exit(1);
} else {
  console.log("All documentation checks passed.");
}
```

### LLM-Powered Documentation Quality Validation in CI

This is an emerging pattern where an LLM reviews documentation quality in CI/CD pipelines. Several approaches exist:

**GitHub Action with LLM review (cost: ~$0.10-0.50 per PR):**

```yaml
# .github/workflows/doc-quality.yml
name: Documentation Quality Review
on: [pull_request]

jobs:
  doc-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get changed TypeScript files
        id: changed
        run: |
          FILES=$(git diff --name-only ${{ github.event.pull_request.base.sha }} -- '*.ts' | tr '\n' ' ')
          echo "files=$FILES" >> $GITHUB_OUTPUT

      - name: Extract JSDoc from changed files
        run: |
          npx ts-morph-extract-docs ${{ steps.changed.outputs.files }} > docs-to-review.json

      - name: LLM Quality Review
        uses: appleboy/llm-action@v1
        with:
          model: "gpt-4o-mini"
          prompt: |
            Review these JSDoc comments for quality. Flag any that:
            1. Merely restate the function/class name
            2. Are too vague to be useful
            3. Missing important context about error cases or side effects
            4. Have incorrect @param descriptions

            Output as JSON: [{file, line, symbol, issue, suggestion}]
          content_file: docs-to-review.json

      - name: Post review comments
        # Parse LLM output and post as PR review comments
```

**Local LLM option (no API costs, using Docker Model or Ollama):**

```yaml
      - name: Local LLM Review
        run: |
          docker run --rm -v $(pwd):/workspace ollama/ollama run llama3 \
            "Review the JSDoc documentation quality in /workspace/docs-to-review.json"
```

**Key considerations for LLM-in-CI doc validation:**
- Separate file parsing from LLM content review for accuracy and cost efficiency
- Use small/fast models (GPT-4o-mini, Llama3) for cost control
- Focus LLM on semantic quality, not structural rules (ESLint handles structure)
- Cache results to avoid re-reviewing unchanged documentation
- Make it advisory (PR comment), not blocking, until confidence is established

---

## 5. Documentation Standards That Enable Machine Reading

### The OpenAPI/Swagger Parallel

OpenAPI demonstrates how structured, machine-readable documentation enables powerful tooling:

| OpenAPI Pattern | Code Documentation Parallel |
|---|---|
| `summary` / `description` fields | JSDoc description + `@description` tag |
| `tags` for grouping | `@category` tag |
| `$ref` for cross-references | `@see` and `{@link}` tags |
| `x-*` extension fields | Custom JSDoc tags or Effect Schema annotations |
| `examples` field | `@example` tag |
| `deprecated` flag | `@deprecated` tag |
| Schema `title` / `description` | Effect Schema `title` / `description` annotations |

The key insight: OpenAPI works because it enforces a **schema-driven approach** where every API element has structured metadata in a predictable format. The same principle applies to code documentation.

### Effect Schema Annotations: Schema-Driven Documentation

Effect v4 Schema annotations represent the most sophisticated approach to embedding machine-readable metadata directly in code:

```typescript
import * as S from "effect/Schema";

const UserId = S.String.pipe(
  S.brand("UserId"),
  S.annotations({
    identifier: "@beep/core/models/User/UserId",
    title: "User ID",
    description: "Unique identifier assigned during account registration. Format: UUID v4.",
    examples: ["550e8400-e29b-41d4-a716-446655440000"],
    documentation: `
      User IDs are immutable once created. They serve as the primary key
      across all user-related services. Generated server-side using crypto.randomUUID().
    `,
    jsonSchema: { format: "uuid" },
  })
);
```

**What this enables for machine reading:**

1. **`identifier`**: Globally unique path for cross-referencing (`@scope/pkg/module/Schema`)
2. **`title`**: Human-readable display name for search results
3. **`description`**: Concise summary for search snippets
4. **`documentation`**: Extended technical prose for deep exploration
5. **`examples`**: Concrete values for understanding and testing
6. **`jsonSchema`**: Machine-readable format/constraint metadata

### Structured JSDoc Format for Machine Reading

A documentation format that enables both human reading and machine extraction:

```typescript
/**
 * Resolves package dependencies from the workspace catalog.
 *
 * Reads the root pnpm-workspace.yaml catalog, matches each dependency
 * in the package.json against catalog entries, and replaces `catalog:`
 * references with resolved version ranges.
 *
 * @param packageJson - The parsed package.json to resolve dependencies for.
 * @param workspaceRoot - Absolute path to the monorepo root directory.
 * @returns The package.json with all `catalog:` references resolved to version strings.
 *
 * @throws {CatalogNotFoundError} When pnpm-workspace.yaml is missing or unreadable.
 * @throws {UnresolvedDependencyError} When a `catalog:` reference has no matching entry.
 *
 * @example
 * ```ts
 * const resolved = yield* resolveCatalog(pkgJson, "/workspace/root");
 * assert.strictEqual(resolved.dependencies.effect, "^3.12.0");
 * ```
 *
 * @since 0.1.0
 * @category Resolution
 */
```

### How Documentation Tools Parse JSDoc

All major tools (TypeDoc, API Extractor, @effect/docgen) follow a similar parsing pipeline:

1. **TypeScript Compiler API** extracts `JSDocComment` nodes from the AST
2. **Tag parsing** splits the comment into description + structured tags
3. **TSDoc/JSDoc parser** validates tag syntax and extracts parameters
4. **Model building** creates a hierarchical representation (reflections/API items)
5. **Serialization** outputs to the target format (HTML, JSON, Markdown)

### Extracting Machine-Readable Metadata with TypeDoc JSON

TypeDoc JSON provides the richest machine-readable output. A post-processing pipeline for semantic search:

```typescript
// scripts/extract-search-index.ts
import { readFileSync } from "fs";

interface TypeDocReflection {
  id: number;
  name: string;
  kind: number;
  comment?: {
    summary?: Array<{ kind: string; text: string }>;
    blockTags?: Array<{
      tag: string;
      content: Array<{ kind: string; text: string }>;
      name?: string;
    }>;
  };
  children?: TypeDocReflection[];
  signatures?: TypeDocReflection[];
}

interface SearchEntry {
  id: string;
  name: string;
  kind: string;
  module: string;
  description: string;
  since: string | null;
  category: string | null;
  params: Array<{ name: string; description: string }>;
  returns: string | null;
  examples: string[];
  deprecated: boolean;
}

const KIND_MAP: Record<number, string> = {
  1: "project", 2: "module", 4: "namespace", 8: "enum",
  32: "variable", 64: "function", 128: "class", 256: "interface",
  1024: "property", 2048: "method", 2097152: "type-alias",
};

function extractEntries(
  node: TypeDocReflection,
  module: string = "",
): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const kind = KIND_MAP[node.kind] ?? "unknown";

  const currentModule = kind === "module" ? node.name : module;

  // Extract from signatures (functions/methods)
  const commentSource = node.signatures?.[0] ?? node;
  const comment = commentSource.comment;

  if (comment && kind !== "project" && kind !== "module") {
    const description = comment.summary
      ?.map((p) => p.text)
      .join("")
      .trim() ?? "";

    const blockTags = comment.blockTags ?? [];

    entries.push({
      id: `${currentModule}/${node.name}`,
      name: node.name,
      kind,
      module: currentModule,
      description,
      since: blockTags.find((t) => t.tag === "@since")
        ?.content.map((c) => c.text).join("").trim() ?? null,
      category: blockTags.find((t) => t.tag === "@category")
        ?.content.map((c) => c.text).join("").trim() ?? null,
      params: blockTags
        .filter((t) => t.tag === "@param")
        .map((t) => ({
          name: t.name ?? "",
          description: t.content.map((c) => c.text).join("").trim(),
        })),
      returns: blockTags.find((t) => t.tag === "@returns")
        ?.content.map((c) => c.text).join("").trim() ?? null,
      examples: blockTags
        .filter((t) => t.tag === "@example")
        .map((t) => t.content.map((c) => c.text).join("").trim()),
      deprecated: blockTags.some((t) => t.tag === "@deprecated"),
    });
  }

  // Recurse into children
  for (const child of node.children ?? []) {
    entries.push(...extractEntries(child, currentModule));
  }

  return entries;
}

const raw = JSON.parse(readFileSync("api.json", "utf-8"));
const index = extractEntries(raw);
console.log(JSON.stringify(index, null, 2));
```

### Custom JSDoc Tags for Machine-Readable Metadata

Beyond standard tags, custom tags can carry project-specific structured metadata:

```typescript
/**
 * Validates and normalizes a SemVer version string.
 *
 * @since 0.1.0
 * @category Validation
 * @complexity O(1)
 * @purity pure
 * @idempotent true
 * @errorModel tagged-union
 * @relatedSchemas SemVer, SemVerRange
 * @usedBy resolveCatalog, checkCompatibility
 */
```

These custom tags can be:
1. **Registered with eslint-plugin-jsdoc** via `definedTags` to prevent warnings
2. **Extracted by TypeDoc** into `blockTags` in JSON output
3. **Validated by custom ESLint rules** for correct format/values
4. **Indexed for semantic search** with structured facets

---

## 6. Recommendations for beep-effect2

### Immediate Actions

1. **Add `eslint-plugin-jsdoc` with TypeScript config** to enforce basic documentation standards on all new code
2. **Configure `@effect/docgen`** with `enforceDescriptions: true`, `enforceVersion: true` in `docgen.json`
3. **Add a pre-commit hook** (via lefthook or husky) running eslint-plugin-jsdoc on staged `.ts` files
4. **Add a pre-push hook** running `pnpm docgen` to catch doc generation failures early

### Medium-Term

5. **Generate TypeDoc JSON** alongside @effect/docgen markdown for structured metadata extraction
6. **Build a custom ESLint rule** for Effect-specific conventions (e.g., require Schema annotations, require `@category` on all exports)
7. **Adopt the `informative-docs` rule** to prevent low-quality documentation from entering the codebase
8. **Create a ts-morph validation script** for project-specific requirements (minimum description length, required tags per export kind)

### Long-Term

9. **Build a TypeDoc JSON extraction pipeline** that feeds structured doc metadata into a semantic search index
10. **Experiment with LLM-powered doc review** in CI (advisory, non-blocking) to catch semantic quality issues
11. **Develop custom annotations** (via Effect Schema annotations + custom JSDoc tags) that encode machine-readable metadata about function purity, complexity, error models, and relationships
12. **Create a unified doc metadata schema** combining TypeDoc JSON, Effect Schema annotations, and custom tags into a single searchable format

### Recommended `docgen.json` for beep-effect2

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

### Recommended ESLint Config for Documentation

```javascript
// eslint.config.mjs (documentation-specific rules)
import jsdoc from "eslint-plugin-jsdoc";

const docRules = {
  files: ["src/**/*.ts"],
  ignores: ["src/internal/**/*.ts", "src/**/*.test.ts"],
  plugins: { jsdoc },
  settings: {
    jsdoc: {
      mode: "typescript",
      tagNamePreference: {
        returns: "returns",
        augments: "extends",
      },
    },
  },
  rules: {
    // Structure
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
    }],

    // Content quality
    "jsdoc/require-description": "error",
    "jsdoc/require-description-complete-sentence": ["error", {
      abbreviations: ["e.g.", "i.e.", "etc.", "vs."],
    }],
    "jsdoc/informative-docs": "error",
    "jsdoc/match-description": ["error", {
      matchDescription: "^[A-Z].{19,}\\.$",
      message: "Description must start with a capital letter, be at least 20 chars, and end with a period.",
    }],

    // TypeScript-specific
    "jsdoc/no-types": "error",

    // Required tags
    "jsdoc/check-tag-names": ["error", {
      definedTags: ["since", "category", "example", "internal", "ignore"],
    }],

    // Params and returns
    "jsdoc/require-param": "error",
    "jsdoc/require-param-description": "error",
    "jsdoc/require-returns": "error",
    "jsdoc/require-returns-description": "error",
  },
};

export default [docRules];
```

### Recommended Lefthook Config

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    jsdoc-lint:
      glob: "*.{ts,tsx}"
      exclude: "*.{test,spec}.ts"
      run: >
        npx eslint
        --no-warn-ignored
        --rule 'jsdoc/require-jsdoc: error'
        --rule 'jsdoc/require-description: error'
        {staged_files}
      stage_fixed: true

pre-push:
  commands:
    docgen-validate:
      run: pnpm docgen
      fail_text: |
        Documentation generation failed.
        Run 'pnpm docgen' locally to see errors and fix JSDoc issues.
```

---

## Sources

- [Effect-TS/docgen GitHub](https://github.com/Effect-TS/docgen)
- [eslint-plugin-jsdoc GitHub](https://github.com/gajus/eslint-plugin-jsdoc)
- [eslint-plugin-jsdoc `informative-docs` rule](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/informative-docs.md)
- [eslint-plugin-jsdoc `match-description` rule](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/match-description.md)
- [TypeDoc Documentation](https://typedoc.org/)
- [TypeDoc JSON Output API](https://typedoc.org/api/modules/JSONOutput.html)
- [TypeDoc Application API](https://typedoc.org/api/classes/Application.html)
- [API Extractor](https://api-extractor.com/)
- [@microsoft/api-extractor-model](https://www.npmjs.com/package/@microsoft/api-extractor-model)
- [API Extractor Custom Docs Integration](https://api-extractor.com/pages/setup/custom_docs/)
- [ts-morph Documentation](https://ts-morph.com/)
- [ts-morph JSDoc API](https://ts-morph.com/details/documentation)
- [Custom ESLint Rules (typescript-eslint)](https://typescript-eslint.io/developers/custom-rules/)
- [ESLint Custom Rule Tutorial](https://eslint.org/docs/latest/extend/custom-rule-tutorial)
- [Effect Schema Annotations](https://effect.website/docs/schema/annotations/)
- [Lefthook vs Husky Comparison](https://www.edopedia.com/blog/lefthook-vs-husky/)
- [LLM Code Review in CI](https://understandingdata.com/posts/llm-code-review-ci/)
- [LLM AI Code Reviewer GitHub Action](https://github.com/marketplace/actions/llm-ai-code-reviewer-action)
- [appleboy/LLM-action](https://github.com/appleboy/LLM-action)
- [TSDoc Specification](https://tsdoc.org/)
