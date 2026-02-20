# @effect/docgen Source Code Analysis

> Comprehensive analysis of the docgen codebase at `.repos/docgen`

---

## 1. Overall Architecture

**Structure**: 11 core TypeScript source files with clear separation:

- **bin.ts**: Entry point - Effect runtime + CLI execution
- **CLI.ts**: CLI definition using @effect/cli
- **Core.ts**: Main orchestration (file discovery, parsing, markdown generation, example execution)
- **Parser.ts**: JSDoc and TypeScript AST parsing (most complex, 974 lines)
- **Configuration.ts**: Config loading and validation
- **Domain.ts**: Data model definitions for all documentation entities
- **Markdown.ts**: Markdown generation from parsed domain models
- **Error.ts**: Custom error types
- **File.ts**: File abstraction model
- **Process.ts**: Process/environment abstraction service
- **internal/version.ts**: Version info

## 2. Parsing Technology

**Uses ts-morph + doctrine**:
1. ts-morph reads TypeScript files → in-memory AST Project
2. JSDoc comments extracted via ts-morph's `getJsDocs()` API
3. doctrine library parses JSDoc text → structured tag objects
4. Custom extraction logic builds Domain models from AST + JSDoc data

**Key Details**:
- Recognizes both function declarations and arrow function variable declarations
- Handles function overloads (uses first overload's JSDoc, documents all signatures)
- Strips import type notation from type signatures using regex
- Detects and filters exported vs internal/ignored items
- Supports nested namespaces with proper hierarchy

## 3. JSDoc Tags Recognized and Enforced

| Tag | Recognition | Enforcement | Default |
|-----|-------------|-------------|---------|
| **@since** | Extracted via doctrine, parsed for version string | Can be required via `enforceVersion` config | required by default |
| **@category** | Extracted and grouped for organization | Can be required but partial support | "utils" |
| **@example** | Extracted, parsed for code fences, collected in array | Via `enforceExamples` (except modules) | not required |
| **@deprecated** | Boolean detection via tag presence | Marks items with strikethrough in markdown | false |
| **@internal** | Detected to skip processing | Completely prevents documentation generation | N/A |
| **@ignore** | Detected to skip processing | Completely prevents documentation generation | N/A |

**JSDoc Parsing Implementation** (Parser.ts, lines 65-86):
- Uses `doctrine.parse()` with `unwrap: true`
- Extracts description and all tags with their values
- Handles multi-tag scenarios (e.g., multiple @example tags)
- Returns structured `Comment` interface with description and tags record

## 4. Metadata Extraction

**Per entity**:
- **name**: Symbol identifier
- **description**: Full JSDoc description text (Optional)
- **since**: Version string from @since tag (Optional)
- **deprecated**: Boolean flag
- **examples**: Array of Example objects (body + optional fence markers)
- **category**: Grouping category from @category tag (Optional)
- **signature**: TypeScript signature string
- **For functions**: All overload signatures captured
- **For classes**: Methods (instance + static), properties, constructor
- **For interfaces**: Full interface signature
- **For modules**: Module-level documentation from first JSDoc comment

## 5. Output Format

**Primary Output**: Markdown files organized hierarchically:
- **Module per file**: Each TypeScript source file → one .md file at `docs/modules/path/to/file.md`
- **Grouping**: Exports grouped by @category within modules
- **Structure per entity**: Header, description, signature code block, examples, version info

**Additional Files**: `docs/index.md`, `docs/modules/index.md`, `docs/_config.yml` (Jekyll)

**Secondary Output**: Example validation
- Examples extracted to `.ts` files, type-checked via `tsc`, executed via `tsx`
- Uses Node.js `assert` module for test assertions

## 6. Configuration Options

**Sources** (precedence order): CLI args → env vars (DOCGEN_*) → `docgen.json` → defaults

```ts
interface ConfigurationShape {
  projectName: string                          // from package.json
  projectHomepage: string                      // from config or package.json
  srcDir: string                               // default: "src"
  outDir: string                               // default: "docs"
  theme: string                                // default: "mikearnaldi/just-the-docs"
  enableSearch: boolean                        // default: true
  enforceDescriptions: boolean                 // default: false
  enforceExamples: boolean                     // default: false
  enforceVersion: boolean                      // default: true
  runExamples: boolean                         // default: false
  exclude: ReadonlyArray<string>               // default: []
  parseCompilerOptions: Record<string, unknown>// default: {}
  examplesCompilerOptions: Record<string, unknown> // default: {}
}
```

## 7. Validation and Enforcement

1. **@since tags**: Enforced if `enforceVersion: true` (default). Failure: "Missing @since tag in module#name documentation"
2. **Descriptions**: Enforced if `enforceDescriptions: true`. Applied to all exports except module-level docs
3. **Examples**: Enforced if `enforceExamples: true`. Skipped for module-level documentation
4. **Example Compilation**: Type-checked with tsc, executed with tsx. Failed examples block entire docgen
5. **Parsing Errors**: Missing function names, invalid JSDoc, missing docs for manual exports, empty modules

## 8. Extension Points

**Limited built-in, but customizable via**:

1. **Configuration**: Custom TS compiler options, exclude patterns, theme, enforcement flags
2. **Service Layer** (Effect Context): Configuration, Process services overridable
3. **Exported Internal APIs**:
   - `Parser.parseComment()`: External JSDoc parsing
   - `Parser.parseFile()` / `Parser.parseFiles()`: File parsing
   - `Parser.getDoc()`: Extract doc metadata
   - `Markdown.print*()`: Individual entity markdown generators
   - `Domain.*` constructors: Build custom domain models

**Current Limitations**:
- Hardcoded Jekyll/GitHub Pages assumption
- No plugin system or middleware hooks
- No custom metadata field support in JSDoc
- No custom output format (markdown-only)

## 9. Module/File Documentation Model

- Located in **first JSDoc comment** of the file (must precede first statement)
- Extracted via `parseModuleDocumentation()` in Parser.ts
- Can include @since, @category, @deprecated, @example tags
- Supports descriptions (becomes module "overview" in markdown)

**File Path to Module Path**: `src/Effect/Core.ts` → `["src", "Effect", "Core.ts"]`

## 10. Re-exports, Barrel Files, and Index Files

- **Named exports** (`export { foo }`): Requires JSDoc on the export statement
- **Star exports** (`export * from "..."`): Requires JSDoc, generates synthetic description
- **Barrel files**: No special handling, all exports need JSDoc
- Category auto-set to "exports" for re-exports if not specified

## 11. Data Model (Domain.ts)

```ts
Doc { description, since, deprecated, examples, category }
NamedDoc extends Doc { name }
Module extends NamedDoc { path, classes, interfaces, functions, typeAliases, constants, exports, namespaces }
Class extends NamedDoc { signature, methods, staticMethods, properties }
Function extends NamedDoc { signatures[] }  // supports overloads
Interface extends NamedDoc { signature }
TypeAlias extends NamedDoc { signature }
Constant extends NamedDoc { signature }
Export extends NamedDoc { signature }
Namespace extends NamedDoc { interfaces, typeAliases, namespaces }
Example { body, fences? }
```

## 12. Processing Pipeline

1. **Discovery**: Glob files in srcDir (exclude patterns applied)
2. **Reading**: File content read concurrently
3. **Parsing**: ts-morph Project created, files added
4. **Extraction**: Module doc first, then all exports, JSDoc per entity, validation applied
5. **Filtering**: Deprecated removed, sorted by path
6. **Example Processing** (optional): Collect, rewrite imports, type-check, execute
7. **Markdown Generation**: Module-level → exports by category → TOC → Prettier format
8. **Output**: Files to outDir (Jekyll structure)

## 13. Key Implications for Semantic Search Indexing

**What docgen already gives us**:
- Structured Domain model with all doc metadata per entity
- ts-morph-based parsing infrastructure
- Category-based grouping (maps to search facets)
- Description + signature extraction
- Example extraction (rich context for embeddings)

**What we'd need to add**:
- Effect Schema annotation extraction (identifier, title, description from `.annotate()`)
- TaggedErrorClass metadata extraction
- Service/Layer dependency graph from type signatures
- @see/@link relationship extraction for graph edges
- JSON/structured output format (not just markdown)
- Custom tags for domain metadata (@layer, @service, @schema)
- Incremental re-indexing support
