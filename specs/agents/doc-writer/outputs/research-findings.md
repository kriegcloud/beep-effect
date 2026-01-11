# Doc Writer Research Findings

## Docgen Configuration

### docgen.json Format

```json
{
  "$schema": "../../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/packages/...",
  "exclude": ["src/internal/**/*.ts"],
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2024",
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "paths": {
      "@beep/package": ["./src/index.ts"],
      "@beep/package/*": ["./src/*"]
    }
  }
}
```

### Docgen Commands

- `bun run docgen:analyze -- -p <package>` - Analyze missing documentation
- `bun run docgen:generate -- -p <package>` - Validate examples compile
- `bun run docgen:agents -- -p <package>` - AI-powered JSDoc generation

## JSDoc Standards

### Required Tags

Every public export MUST have these three tags:

1. **`@category`** — Single lowercase word (e.g., `constructors`, `schemas`, `utilities`)
2. **`@example`** — Complete, compilable TypeScript code with imports
3. **`@since`** — Semantic version (use `0.1.0` for new docs)

### Standard Categories

| Category | Use For |
|----------|---------|
| `constructors` | Factory functions, `make`, `of`, `from*` functions |
| `schemas` | Effect Schema definitions and validators |
| `combinators` | Functions that combine/transform instances |
| `mapping` | Data transformation functions |
| `encoding` | Encode/decode transformations |
| `getters` | Property access functions |
| `filtering` | Data selection and filtering |
| `folding` | Data aggregation/reduction |
| `models` | Type definitions, interfaces, data structures |
| `symbols` | Type identifiers, branded types, Context.Tag |
| `guards` | Type guard functions (`is*`, `has*`) |
| `predicates` | Boolean-returning functions |
| `errors` | Error classes and types |
| `layers` | Effect Layer constructors |
| `services` | Service interfaces and implementations |
| `utilities` | General helper functions |
| `exports` | Re-exports from barrel files |

### JSDoc Example Format

```typescript
/**
 * Brief description of what the function does.
 *
 * More detailed explanation if needed.
 *
 * @example
 * ```typescript
 * import { MyFunction } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* MyFunction({ input: "value" })
 *   return result
 * })
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
```

### Effect Import Conventions (CRITICAL)

```typescript
// REQUIRED - Namespace imports
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as F from "effect/Function"
import * as Str from "effect/String"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"

// FORBIDDEN - Named imports
import { Effect, Schema } from "effect"  // WRONG!
```

## README Structure

### Common Sections (from sampled packages)

1. **Package Title** — `# @beep/package-name`
2. **Brief Description** — One-line summary matching package.json
3. **Purpose** — 2-3 sentences explaining role in architecture
4. **Features** — Bullet list of key capabilities
5. **Installation** — Workspace dependency instruction
6. **Key Exports** — Table of main exports with descriptions
7. **Usage** — Code examples showing common patterns
8. **Package Structure** — Module organization (for complex packages)
9. **Dependencies** — Table with package and purpose columns
10. **Development** — Commands for check, lint, build, test
11. **Guidelines** — Best practices and constraints
12. **Notes/Gotchas** — Important considerations

### README Template Quality Indicators

Good READMEs in this codebase:
- Use Effect patterns consistently in all examples
- Include namespace imports in every code block
- Show `Effect.gen` for effectful operations
- Use `F.pipe` for transformations
- Reference actual exports from the package
- Include working code examples (validated by docgen)

## AGENTS.md Structure

### Template from agents-md-template.md

1. **Purpose & Fit** — What the package provides and its architectural role
2. **Surface Map** — Key files and modules with descriptions
3. **Usage Snapshots** — Real usage examples with file:line references
4. **Authoring Guardrails** — Critical rules for contributors
5. **Quick Recipes** — Copy-paste code patterns
6. **Verifications** — Commands to validate changes
7. **Contributor Checklist** — Review items before committing

### Anti-Patterns (FORBIDDEN in AGENTS.md)

- MCP tool shortcuts (e.g., `jetbrains__get_open_projects`)
- Stale package references (e.g., `@beep/core-db` instead of current names)
- Named imports from Effect
- async/await in examples
- Native array/string methods
- Vague documentation without specific details

## Existing Agent Patterns

### jsdoc-fixer.md Strengths

- Clear 5-phase workflow (Analyze → Understand → Add Tags → Verify → Cleanup)
- Detailed templates for each export type (Schema, Type, Constructor, Interface, etc.)
- Priority-based processing (High → Medium → Low)
- Mandatory verification steps with specific commands
- Explicit success/failure reporting requirements
- Category conventions table with use cases

### readme-updater.md Strengths

- Comprehensive decision tree for handling different scenarios
- Known package locations table for consistent naming
- Before/after transformation examples
- Layer-specific templates (domain, infra, client, ui, tables)
- Anti-patterns section with FORBIDDEN/REQUIRED examples
- Error recovery procedures
- Detailed output format with metrics tables

## Key Findings Summary

1. **Documentation is strictly validated** — docgen:generate must pass
2. **Effect patterns are non-negotiable** — No native methods, namespace imports only
3. **Three tags are mandatory** — @category, @example, @since
4. **Examples must compile** — Verified by docgen examplesCompilerOptions
5. **Categories are standardized** — Use the established category vocabulary
6. **Both agents share patterns** — Consistent Effect conventions, verification steps
7. **Quality bar is high** — Vague content is explicitly forbidden
