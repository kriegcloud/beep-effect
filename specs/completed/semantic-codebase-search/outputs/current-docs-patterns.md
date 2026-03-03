# Current Documentation & Docgen Patterns Analysis

> Analysis of how @effect/docgen is configured and used across the beep-effect2 monorepo

---

## 1. Package.json Scripts & Docgen Configuration

**Root-level docgen command** (package.json):
```json
"docgen": "bunx turbo run docgen && node scripts/docs.mjs"
```

**Individual package scripts** (tooling/repo-utils and tooling/cli):
```json
"docgen": "bunx @effect/docgen"
```

**Docgen Configuration** - Both packages have `docgen.json` files with:
- `exclude`: `["src/internal/**/*.ts"]` - excludes internal files
- `srcLink`: GitHub links to source code
- `examplesCompilerOptions`: TypeScript configuration for compiling code examples
- `paths`: Path aliases for import statements in examples

**Docgen Version** (from root package.json):
```json
"@effect/docgen": "https://pkg.pr.new/Effect-TS/docgen/@effect/docgen@e7fe055"
```
Using a pre-release build targeting Effect v4 compatibility.

---

## 2. JSDoc Patterns Currently In Use

### Module-level JSDoc (with @module tag)
```typescript
/**
 * Filesystem utility service for common monorepo operations.
 *
 * Provides effectful wrappers around glob matching, JSON file I/O,
 * path existence checks, and file/directory type queries.
 *
 * @since 0.0.0
 * @module
 */
```

### Individual Export Pattern
```typescript
/**
 * Brief description.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const functionName = ...
```

### Index File Re-export Pattern (strict docstring-per-export)
```typescript
/**
 * Error types for @beep/repo-utils.
 * @since 0.0.0
 */

export {
  /**
   * @since 0.0.0
   */
  CyclicDependencyError,
} from "./CyclicDependencyError.js";
```

### Categories Used
`schemas`, `models`, `layers`, `services`, `errors`, `decoding`, `encoding`, `types`, `constructors`, `algorithms`, `constants`, `utils`, `commands`

---

## 3. Schema Annotation Patterns

Every Effect v4 Schema includes annotations:

```typescript
export const MySchema = Schema.Struct({...}).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/FieldName",
  title: "Human Readable Title",
  description: "Detailed description explaining constraints and purpose.",
  examples: [{ example: "data" }]
});
```

**Identifier format:** `@scope/package/path/to/module/SchemaName`

**Real examples:**
- `@beep/repo-utils/schemas/PackageJson/Author` for Author union schema
- `@beep/repo-utils/schemas/PackageJson/PackageJson` for main schema with examples

---

## 4. Tagged Error Patterns

```typescript
export class DomainError extends S.TaggedErrorClass<DomainError>(
  "@beep/repo-utils/errors/DomainError/DomainError"
)(
  "DomainError",
  { message: S.String, cause: S.optional(S.Unknown) },
  { title: "Domain Error", description: "A generic domain-level error..." }
) {}
```

All three error classes (CyclicDependencyError, DomainError, NoSuchFileError) follow this pattern.

---

## 5. Generated Documentation Output

```
tooling/repo-utils/docs/modules/
  ├── index.md
  ├── index.ts.md
  ├── FsUtils.ts.md
  ├── Graph.ts.md
  ├── errors/
  │   ├── index.ts.md
  │   ├── DomainError.ts.md
  │   ├── CyclicDependencyError.ts.md
  │   └── NoSuchFileError.ts.md
  └── schemas/
      ├── PackageJson.ts.md
      └── WorkspaceDeps.ts.md
```

Generated markdown includes: YAML frontmatter, module overview, category TOC, category sections with description/example/signature/source link/since version.

---

## 6. Documentation Aggregation

**Script: `/scripts/docs.mjs`**
- Scans `packages/`, `tooling/`, and `apps/` directories
- Copies markdown to central `docs/{package}/` directory
- Generates index pages with package name and nav order

---

## 7. Effect v4 Reference Patterns (from .repos/effect-v4)

Effect source code uses:
- Comprehensive module overview with "Mental model" section
- "Common tasks" grouping
- "Gotchas" highlighting edge cases
- "Quickstart" with runnable examples
- `@see` cross-references

The beep-effect2 packages use a simplified version.

---

## 8. Current Coverage Assessment

### Files WITH @module JSDoc
- FsUtils.ts
- Graph.ts
- schemas/PackageJson.ts
- index.ts

### Files WITHOUT @module
- errors/CyclicDependencyError.ts
- errors/DomainError.ts
- errors/index.ts
- schemas/WorkspaceDeps.ts

---

## 9. Gaps Identified

| Gap | Impact on Semantic Search |
|-----|--------------------------|
| Not all modules have @module tags | Missing file-level descriptions for embedding |
| Very few @example tags (only Graph.ts) | Less context for understanding usage patterns |
| CLI commands have minimal docs (1-2 lines) | Poor discoverability of command capabilities |
| No @see cross-references between items | Missing explicit relationship edges |
| Schema fields lack `.annotateKey()` descriptions | Field-level search impossible |
| Service methods documented in interface, not individually | Service method discovery weak |
| No @remarks for design rationale | Missing "why" context for search |

---

## 10. What's Working Well

- Consistent schema annotations with identifier/title/description
- Proper TaggedErrorClass usage with metadata
- Category organization via @category tags
- Example code in complex algorithms
- Automated cross-package doc aggregation
- GitHub source links in generated docs
- Per-export JSDoc requirement enforced by docgen
