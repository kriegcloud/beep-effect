# Codebase Researcher Research Findings

## Package Structure Insights

### Vertical Slices

The monorepo contains four vertical feature slices:

| Slice | Purpose |
|-------|---------|
| `iam` | Identity and access management (auth, sessions, organizations) |
| `documents` | Document management, knowledge pages, discussions |
| `comms` | Communications (email templates, notifications) |
| `customization` | User preferences and hotkeys |

### Layer Dependency Order

Each vertical slice follows a strict layer dependency order:

```
domain -> tables -> server -> client -> ui
```

- **domain**: Pure Effect schemas, entity models, value objects (no I/O)
- **tables**: Drizzle ORM table definitions, relations
- **server**: Effect services, repositories, API handlers
- **client**: Effect-first HTTP clients, RPC contracts
- **ui**: React components

### Cross-Slice Boundaries

Allowed imports:
- Any slice may import from `packages/shared/*`
- Any slice may import from `packages/common/*`
- UI packages may import from `packages/ui/*`

Forbidden imports:
- Feature slices MUST NOT import from each other directly
- Example: `@beep/documents-*` MUST NOT import `@beep/iam-*`

### Package Naming Convention

```
@beep/{slice}-{layer}
```

Examples:
- `@beep/iam-server` - IAM server layer
- `@beep/documents-domain` - Documents domain layer
- `@beep/shared-tables` - Shared tables layer

---

## AGENTS.md Patterns

### Standard Document Structure

All well-documented AGENTS.md files contain these sections:

1. **Purpose & Fit**
   - Role in architecture
   - What the package provides
   - Relationship to other packages

2. **Surface Map**
   - Key files and directories with descriptions
   - Entry points and exports
   - Internal vs public APIs

3. **Usage Snapshots**
   - Specific `file:line` references showing real usage
   - Links to downstream consumers
   - Test file references

4. **Authoring Guardrails**
   - CRITICAL rules marked with IMPORTANT/ALWAYS/NEVER
   - Effect namespace import requirements
   - Native method bans

5. **Quick Recipes**
   - Working code examples using `Effect.gen`
   - Namespace imports demonstrated
   - Real patterns from the codebase

6. **Verifications**
   - Package-specific lint/check/test commands
   - Filter patterns for turbo

7. **Gotchas**
   - Common pitfalls with symptoms/causes/solutions
   - Edge cases to watch for

8. **Contributor Checklist**
   - Step-by-step checklist for changes

### Anti-Patterns to Avoid

From the template analysis:

| Anti-Pattern | Replacement |
|--------------|-------------|
| Tool shortcuts (MCP references) | Remove entirely |
| Named Effect imports | Namespace imports |
| `async/await` in examples | `Effect.gen` pattern |
| Native array/string methods | Effect utilities (`A.*`, `Str.*`) |
| Vague documentation | Specific, contextual docs |
| Invalid cross-references | Validated file paths |

---

## Import Analysis Techniques

### Effective Grep Patterns

#### Finding All @beep Imports
```bash
# Pattern: from "@beep/
Grep pattern: from "@beep/
Output mode: files_with_matches
```

#### Effect Namespace Import Analysis
```bash
# Finds proper namespace imports
Grep pattern: import \* as .* from "effect/
Output mode: content
```

#### Cross-Slice Violation Detection
```bash
# Check documents for IAM imports
Grep pattern: @beep/iam
Path: packages/documents/
Output mode: content

# Check IAM for documents imports
Grep pattern: @beep/documents
Path: packages/iam/
Output mode: content
```

#### Layer Pattern Detection
```bash
# Find layer paths in imports
Grep pattern: /domain/|/tables/|/server/|/client/|/ui/
Output mode: files_with_matches
```

### File Discovery Glob Patterns

| Pattern | Purpose |
|---------|---------|
| `packages/**/AGENTS.md` | Package documentation files |
| `packages/**/*.service.ts` | Effect service files |
| `packages/**/*.repo.ts` | Repository files |
| `packages/*/domain/src/entities/**/*.ts` | Domain entities |
| `packages/*/server/src/**/*.ts` | Server layer files |
| `packages/*/client/src/**/*.ts` | Client layer files |
| `packages/*/tables/src/**/*.ts` | Table definition files |

### Layer Boundary Enforcement

To verify a package respects layer boundaries:

1. Identify the package's layer (domain, tables, server, client, ui)
2. Grep for imports from layers that should be downstream
3. Flag any imports that violate the dependency order

Example for a `domain` package:
```bash
# Domain should NOT import from tables, server, client, or ui
Grep pattern: @beep/.*-(tables|server|client|ui)
Path: packages/{slice}/domain/
```

---

## Exploration Methodology

### Systematic Codebase Exploration Steps

1. **Scope Definition**
   - Identify the feature or question
   - Determine which slices are likely involved
   - Define the layers to explore

2. **File Discovery**
   - Use Glob with appropriate patterns
   - Start broad, narrow based on findings
   - Prioritize by modification time (newer = more relevant)

3. **Import Analysis**
   - Map dependencies between files
   - Identify service/layer boundaries
   - Detect any violations

4. **Pattern Extraction**
   - Find similar implementations
   - Extract common idioms
   - Note Effect patterns used

5. **Boundary Mapping**
   - Document which packages are involved
   - Map the dependency graph
   - Identify integration points

### Key Files for Context

| File | Context Provided |
|------|------------------|
| `documentation/PACKAGE_STRUCTURE.md` | Full package layout |
| `documentation/EFFECT_PATTERNS.md` | Effect coding patterns |
| `tsconfig.base.jsonc` | Path aliases |
| `turbo.json` | Build pipeline |
| `packages/{pkg}/AGENTS.md` | Package-specific guidance |
| `packages/{pkg}/README.md` | Package overview |
| `packages/{pkg}/package.json` | Dependencies |

---

## File Counts by Type

From glob analysis:

| Type | Count | Location Pattern |
|------|-------|------------------|
| AGENTS.md | 39 | `packages/**/AGENTS.md` |
| Services | 23 | `packages/**/*.service.ts` |
| Repositories | 34 | `packages/**/*.repo.ts` |

---

## Summary

The beep-effect monorepo follows a disciplined vertical slice architecture with:

1. **Clear layer boundaries** enforced via import rules
2. **Standardized documentation** via AGENTS.md files
3. **Effect-first patterns** with namespace imports and `Effect.gen`
4. **Shared infrastructure** in `packages/shared/*` and `packages/common/*`

The codebase-researcher agent should leverage:
- Glob for file discovery
- Grep for import analysis and pattern matching
- Read for extracting specific code sections
- Knowledge of layer boundaries for architectural validation
