# Docgen Parser vs Custom Parser Evaluation

## 1. Executive Summary

**Recommendation: B) Hybrid -- Use docgen for JSDoc extraction, custom ts-morph layer for Effect-specific metadata.**

Docgen's `Parser.ts` provides a solid, battle-tested JSDoc + TypeScript AST extraction pipeline covering description, @since, @category, @example, @deprecated, type signatures, and re-export handling. However, it has zero awareness of Effect-specific patterns -- Schema `.annotate()` metadata, `TaggedErrorClass` constructor arguments, `ServiceMap.Service`/`Layer.effect` dependency graphs, and `@see`/`@link` cross-references are completely invisible to it. Building those five capabilities from scratch on raw ts-morph is straightforward (they are pattern-matching on AST nodes) and dramatically cheaper than forking or wrapping docgen's entire pipeline. The hybrid approach reuses docgen's `parseFiles()` for the 60% of extraction that is pure JSDoc, then runs a parallel ts-morph pass over the same `SourceFile` nodes to extract what docgen cannot.

---

## 2. Docgen Parser API Analysis

### 2.1 Architecture

```
                  ┌─────────────┐
   File.File[] ──>│ createProject│──> ts-morph Project
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │  parseFile  │ (per file, provides Source context)
                  └──────┬──────┘
                         │
              ┌──────────┼──────────────────────┐
              │          │                      │
    parseModule    parseInterfaces       parseFunctions
    Documentation  parseTypeAliases      parseConstants
                   parseClasses          parseExports
                   parseNamespaces
```

### 2.2 What It Extracts (Exhaustive)

| Field | Source | How |
|-------|--------|-----|
| `name` | AST node `.getName()` | Direct ts-morph API |
| `description` | JSDoc body text | `doctrine.parse()` annotation.description |
| `since` | `@since` tag | `doctrine` tag extraction |
| `deprecated` | `@deprecated` presence | Boolean check on tag record |
| `category` | `@category` tag | `doctrine` tag extraction |
| `examples` | `@example` tags (multiple) | Collected, fence-parsed |
| `signature` | Type-checker resolved text | `vd.getType().getText(vd)` with `stripImportTypes` |
| `_tag` | Hard-coded per entity type | `"Class" \| "Interface" \| "Function"` etc. |
| Overloads | `fd.getOverloads()` | All overload signatures collected |
| Methods | Class instance + static | Separated with JSDoc per method |
| Properties | Class public non-static | With readonly detection |
| Re-exports | `export { ... }` / `export *` | Per-specifier JSDoc + type resolution |
| Namespaces | Nested `export namespace` | Recursive parsing with hierarchy |

### 2.3 What It Cannot Extract

| Missing Capability | Why |
|---|---|
| Schema `.annotate()` metadata | Parser operates on JSDoc only; never inspects call expressions or their arguments |
| `TaggedErrorClass` constructor args | Class parsing reads JSDoc, not the runtime class factory call arguments |
| `@see` / `@link` tags | `doctrine.parse()` captures them but `getDoc()` discards all tags except `since`, `category`, `example`, `deprecated` |
| Custom tags (`@layer`, `@service`, `@depends`, `@provides`) | Same: `parseComment` captures them in `tags` record but `getDoc()` ignores them |
| Service/Layer dependency types | Signature is captured as string but never parsed for `Effect.Effect<A, E, R>` type parameter extraction |
| Structured output | Domain model is in-memory TypeScript objects; only outputter is Markdown printer |
| Incremental single-file parsing | `parseFile()` exists but requires a full `ts-morph.Project` with compiler options |
| Works on broken code | Requires successful TypeScript compilation to resolve types |

### 2.4 Key Limitation: The `getDoc()` Bottleneck

```typescript
// Parser.ts lines 196-211 -- THIS is the chokepoint
export const getDoc = (name: string, text: string, isModule = false) =>
  Effect.gen(function*(_) {
    const comment = parseComment(text)           // <-- doctrine parses ALL tags
    const since = yield* _(getSinceTag(...))      // <-- extracts @since
    const category = yield* _(getCategoryTag(...))// <-- extracts @category
    const description = yield* _(getDescription(...))
    const examples = yield* _(getExamplesTag(...))// <-- extracts @example
    const deprecated = Option.isSome(Record.get(comment.tags, "deprecated"))
    // ^^^ EVERYTHING ELSE in comment.tags IS THROWN AWAY
    return Domain.createDoc(description, since, deprecated, examples, category)
  })
```

The `Comment` type has `tags: Record<string, NonEmptyArray<Option<string>>>` which *does* capture `@see`, `@link`, `@layer`, `@service`, and any custom tag. But `getDoc()` explicitly only reads 4 tags. The upstream `parseComment()` is reusable, but `getDoc()` and the entire `Domain` model would need extension.

---

## 3. Evaluation Matrix

| Criterion | Weight | Reuse Docgen | Build Custom | Notes |
|-----------|--------|:----------:|:----------:|-------|
| JSDoc description + @since + @category + @example | Required | **YES** | YES | Docgen's core competency |
| Schema `.annotate()` metadata (identifier, title, description) | Required | **NO** | YES | Requires AST call-expression traversal |
| TaggedErrorClass metadata (tag, fields, title, description) | Required | **NO** | YES | Requires class-expression factory arg inspection |
| `@see`/`@link` cross-references | Required | **PARTIAL** | YES | `parseComment` captures tags; `getDoc` discards them |
| Custom tags (@layer, @service, @depends, @provides) | Required | **PARTIAL** | YES | Same as above -- captured by doctrine but discarded |
| Type signatures | Required | **YES** | YES | Docgen resolves fully via type-checker |
| Structured output (not just markdown) | Required | **YES** | YES | Domain model is structured; only printer is markdown |
| Re-exports with per-export JSDoc | Required | **YES** | PARTIAL | Docgen has dedicated `parseExportSpecifier` |
| Incremental single-file parsing | Important | **PARTIAL** | YES | `parseFile()` works per-file but needs full Project |
| Works on broken code (no compilation) | Nice | **NO** | YES | ts-morph needs resolvable types for signatures |
| Effect v4 compatible APIs | Required | **NO** | YES | Docgen uses Effect v3 / @effect/schema / @effect/platform |

**Score: Reuse = 5/11 full + 2 partial, Build = 10/11 full**

---

## 4. Gap Analysis

### Gap 1: Schema `.annotate()` Metadata

**What we need**: Extract `identifier`, `title`, `description`, `examples` from calls like:
```typescript
export const PackageJson = Schema.Struct({ ... }).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/PackageJson",
  title: "Package JSON",
  description: "Type-safe schema for package.json files...",
  examples: [{ name: "@beep/my-pkg" }],
})
```

**What docgen sees**: A `Constant` with `signature: "export declare const PackageJson: Schema.Struct<...>"` and whatever JSDoc was on it. The `.annotate()` call arguments are completely invisible.

**ts-morph extraction** (proof of concept):
```typescript
const extractAnnotateMetadata = (vd: ast.VariableDeclaration): Option.Option<AnnotateMetadata> => {
  const init = vd.getInitializer()
  if (!init) return Option.none()

  // Walk the call chain: Schema.Struct({...}).annotate({...})
  const calls = collectCallChain(init)
  const annotateCall = A.findFirst(calls, (c) =>
    c.getExpression().getText().endsWith(".annotate")
  )

  return pipe(
    annotateCall,
    Option.flatMap((call) => A.head(call.getArguments())),
    Option.filter(ast.Node.isObjectLiteralExpression),
    Option.map((obj) => ({
      identifier: getStringProperty(obj, "identifier"),
      title: getStringProperty(obj, "title"),
      description: getStringProperty(obj, "description"),
      examples: getArrayProperty(obj, "examples"),
    }))
  )
}
```

### Gap 2: TaggedErrorClass Metadata

**What we need**: Extract tag name, field schemas, title, description from:
```typescript
export class CyclicDependencyError extends S.TaggedErrorClass<CyclicDependencyError>(
  "@beep/repo-utils/errors/CyclicDependencyError/CyclicDependencyError"  // identifier
)(
  "CyclicDependencyError",  // tag name
  { message: S.String, cycles: S.Array(S.Array(S.String)) },  // fields
  { title: "Cyclic Dependency Error", description: "..." }  // metadata
) {}
```

**What docgen sees**: A `Class` with `signature: "export declare class CyclicDependencyError"` and JSDoc. The double-call factory pattern with schema identifier, tag name, fields, and metadata object are invisible.

**ts-morph extraction**:
```typescript
const extractTaggedErrorMetadata = (cd: ast.ClassDeclaration): Option.Option<TaggedErrorMeta> => {
  const heritage = cd.getExtends()
  if (!heritage) return Option.none()
  const expr = heritage.getExpression()

  // Pattern: S.TaggedErrorClass<T>("identifier")("tag", { fields }, { meta })
  if (!ast.Node.isCallExpression(expr)) return Option.none()

  const outerCall = expr  // ("tag", {fields}, {meta})
  const innerExpr = outerCall.getExpression()
  if (!ast.Node.isCallExpression(innerExpr)) return Option.none()

  const factoryCall = innerExpr  // S.TaggedErrorClass<T>("identifier")
  const args = outerCall.getArguments()

  return Option.some({
    schemaIdentifier: getStringLiteral(factoryCall.getArguments()[0]),
    tagName: getStringLiteral(args[0]),
    fields: args[1] ? extractObjectShape(args[1]) : {},
    metadata: args[2] && ast.Node.isObjectLiteralExpression(args[2])
      ? {
          title: getStringProperty(args[2], "title"),
          description: getStringProperty(args[2], "description"),
        }
      : undefined,
  })
}
```

### Gap 3: Service/Layer Dependency Detection

**What we need**: From a file like `FsUtils.ts`, extract:
- Service: `FsUtils` provides `FsUtilsShape`
- Layer: `FsUtilsLive` requires `FileSystem | Path`, provides `FsUtils`

**What docgen sees**: `FsUtils` as a `Class`, `FsUtilsLive` as a `Constant` with `signature: "export declare const FsUtilsLive: Layer.Layer<FsUtils, never, FileSystem.FileSystem | Path.Path>"`.

**Key insight**: The signature string already contains the dependency information. We can either:
1. Parse the signature string with regex (brittle)
2. Use the type-checker to inspect `Layer.Layer<Provides, Error, Requires>` type arguments directly (robust)

```typescript
const extractLayerDeps = (vd: ast.VariableDeclaration): Option.Option<LayerDeps> => {
  const type = vd.getType()
  const symbol = type.getSymbol() ?? type.getAliasSymbol()
  if (symbol?.getName() !== "Layer") return Option.none()

  const typeArgs = type.getTypeArguments()
  // Layer.Layer<Provides, Error, Requires>
  return Option.some({
    provides: typeArgs[0]?.getText() ?? "unknown",
    error: typeArgs[1]?.getText() ?? "never",
    requires: typeArgs[2]?.getText() ?? "never",
  })
}
```

### Gap 4: @see/@link Cross-References

**What we need**: From `@see` and `{@link Foo}` tags, extract edges for the knowledge graph.

**Partial workaround via docgen**: `parseComment()` already captures these in `comment.tags`:
```typescript
const comment = Parser.parseComment(jsDocText)
// comment.tags["see"]  => [Option.some("OtherModule")]
// comment.tags["link"] => [Option.some("SomeClass")]  -- if doctrine parses inline @link
```

But `getDoc()` discards them. We can call `parseComment()` directly and extract.

### Gap 5: Effect v3 vs v4 Incompatibility

Docgen is pinned to Effect v3 (`effect: "3.7.0"`, `@effect/schema: "0.72.0"`, `@effect/platform: "0.63.0"`). Our project is Effect v4. The docgen Parser module uses:
- `@effect/platform/Path` (v4: `effect/Path`)
- `@effect/schema/Schema` (v4: `effect/Schema`)
- `Context.Tag` (v4: `ServiceMap.Service`)

**Impact**: We cannot import docgen's Parser module directly into our v4 codebase. Options:
1. Fork and port Parser.ts to v4 (significant effort)
2. Run docgen as a subprocess and consume JSON output (docgen only outputs markdown)
3. Extract the reusable logic (ts-morph + doctrine patterns) into our own module

---

## 5. Recommended Architecture

### Hybrid Approach: Parallel Extraction Passes

```
                     Source Files
                          │
              ┌───────────┴───────────┐
              │                       │
     ┌────────▼────────┐    ┌────────▼────────┐
     │  JSDoc Extractor │    │ Effect Extractor │
     │  (doctrine +     │    │ (ts-morph AST    │
     │   ts-morph text) │    │  pattern match)  │
     └────────┬────────┘    └────────┬────────┘
              │                       │
              │  DocgenDoc {          │  EffectMeta {
              │    name, description, │    annotate?,
              │    since, category,   │    taggedError?,
              │    examples,          │    serviceDeps?,
              │    signature,         │    layerDeps?,
              │    deprecated         │    seeRefs[],
              │  }                    │    customTags{}
              │                       │  }
              └───────────┬───────────┘
                          │
                   ┌──────▼──────┐
                   │   Merger    │
                   │  Produces   │
                   │ SearchDoc   │
                   └─────────────┘
```

### Concrete Implementation Pattern

```typescript
// file: tooling/semantic-search/src/Extractor.ts

import * as ast from "ts-morph"
import * as doctrine from "doctrine"
import { Effect, Option, Array as A, pipe } from "effect"

// ─── Reuse from docgen's approach (reimplemented for v4) ───

interface JSDocInfo {
  readonly description: Option.Option<string>
  readonly since: Option.Option<string>
  readonly category: Option.Option<string>
  readonly deprecated: boolean
  readonly examples: ReadonlyArray<string>
  readonly tags: Record<string, ReadonlyArray<Option.Option<string>>>
}

/** Replicates docgen's parseComment + getDoc without the enforcement/error layer */
const extractJSDoc = (jsdocText: string): JSDocInfo => {
  const annotation = doctrine.parse(jsdocText, { unwrap: true })
  const tags = pipe(
    annotation.tags,
    A.groupBy((tag) => tag.title),
    Record.map(A.map((tag) => Option.fromNullishOr(tag.description)))
  )
  return {
    description: Option.fromNullishOr(annotation.description).pipe(
      Option.filter((s) => s.trim().length > 0)
    ),
    since: extractTag(tags, "since"),
    category: extractTag(tags, "category"),
    deprecated: "deprecated" in tags,
    examples: extractMultiTag(tags, "example"),
    tags, // <-- KEEP ALL TAGS (docgen throws these away)
  }
}

// ─── NEW: Effect-specific extractors (what docgen cannot do) ───

interface AnnotateMetadata {
  readonly identifier: Option.Option<string>
  readonly title: Option.Option<string>
  readonly description: Option.Option<string>
}

const extractAnnotateChain = (node: ast.Node): Option.Option<AnnotateMetadata> => {
  // Walk up call expression chain looking for .annotate({...})
  if (!ast.Node.isCallExpression(node)) return Option.none()
  const expr = node.getExpression()
  if (!ast.Node.isPropertyAccessExpression(expr)) {
    // Check if callee itself is a .annotate() result being chained
    return ast.Node.isCallExpression(expr)
      ? extractAnnotateChain(expr)
      : Option.none()
  }
  if (expr.getName() === "annotate") {
    const arg = node.getArguments()[0]
    if (arg && ast.Node.isObjectLiteralExpression(arg)) {
      return Option.some({
        identifier: getStringProp(arg, "identifier"),
        title: getStringProp(arg, "title"),
        description: getStringProp(arg, "description"),
      })
    }
  }
  // Recurse into the object being called (.annotate is on)
  return extractAnnotateChain(expr.getExpression())
}

interface TaggedErrorMeta {
  readonly schemaIdentifier: string
  readonly tagName: string
  readonly fieldNames: ReadonlyArray<string>
  readonly title: Option.Option<string>
  readonly description: Option.Option<string>
}

const extractTaggedErrorClass = (
  cd: ast.ClassDeclaration
): Option.Option<TaggedErrorMeta> => {
  const heritage = cd.getExtends()
  if (!heritage) return Option.none()
  const expr = heritage.getExpression()
  if (!ast.Node.isCallExpression(expr)) return Option.none()

  // S.TaggedErrorClass<T>("id")("tag", {fields}, {meta})
  const outerArgs = expr.getArguments()
  const inner = expr.getExpression()
  if (!ast.Node.isCallExpression(inner)) return Option.none()

  const factoryExpr = inner.getExpression()
  const isTaggedErrorClass =
    factoryExpr.getText().includes("TaggedErrorClass")

  if (!isTaggedErrorClass) return Option.none()

  const innerArgs = inner.getArguments()
  return Option.some({
    schemaIdentifier: getStringLiteralValue(innerArgs[0]),
    tagName: getStringLiteralValue(outerArgs[0]),
    fieldNames: outerArgs[1] && ast.Node.isObjectLiteralExpression(outerArgs[1])
      ? outerArgs[1].getProperties()
          .filter(ast.Node.isPropertyAssignment)
          .map((p) => p.getName())
      : [],
    title: outerArgs[2] && ast.Node.isObjectLiteralExpression(outerArgs[2])
      ? getStringProp(outerArgs[2], "title")
      : Option.none(),
    description: outerArgs[2] && ast.Node.isObjectLiteralExpression(outerArgs[2])
      ? getStringProp(outerArgs[2], "description")
      : Option.none(),
  })
}

// ─── Cross-reference extraction (from JSDoc @see/@link) ───

interface CrossRef {
  readonly tag: "see" | "link"
  readonly target: string
}

const extractCrossRefs = (jsDocInfo: JSDocInfo): ReadonlyArray<CrossRef> => {
  const seeRefs = pipe(
    jsDocInfo.tags["see"] ?? [],
    A.getSomes,
    A.map((target): CrossRef => ({ tag: "see", target: target.trim() }))
  )
  const linkRefs = pipe(
    jsDocInfo.tags["link"] ?? [],
    A.getSomes,
    A.map((target): CrossRef => ({ tag: "link", target: target.trim() }))
  )
  // Also extract inline {@link Foo} from description
  const inlineLinks = pipe(
    jsDocInfo.description,
    Option.map((desc) => {
      const matches = [...desc.matchAll(/\{@link\s+(\S+)\}/g)]
      return matches.map((m): CrossRef => ({ tag: "link", target: m[1] }))
    }),
    Option.getOrElse(() => [] as CrossRef[])
  )
  return [...seeRefs, ...linkRefs, ...inlineLinks]
}

// ─── Custom tag extraction ───

interface CustomTags {
  readonly layer: Option.Option<string>
  readonly service: Option.Option<string>
  readonly depends: ReadonlyArray<string>
  readonly provides: ReadonlyArray<string>
}

const extractCustomTags = (jsDocInfo: JSDocInfo): CustomTags => ({
  layer: extractTag(jsDocInfo.tags, "layer"),
  service: extractTag(jsDocInfo.tags, "service"),
  depends: extractMultiTag(jsDocInfo.tags, "depends"),
  provides: extractMultiTag(jsDocInfo.tags, "provides"),
})
```

### Why NOT Option A (Consume Docgen as Library)

1. **Effect v3 dependency**: Docgen uses `effect: "3.7.0"`. Our codebase is Effect v4 beta. The APIs are incompatible -- `@effect/platform`, `@effect/schema`, `Context.Tag` vs `ServiceMap.Service`. We cannot import docgen modules into our v4 code without a full port.

2. **Markdown-only output**: Docgen's only consumer is `Markdown.ts`. There is no JSON/structured serializer. We would need to add one.

3. **Enforcement overhead**: Docgen errors on missing `@since` tags, missing descriptions (when enforced), etc. For search indexing we want best-effort extraction, not validation failures.

4. **Missing 5 of 11 required capabilities**: Even if we solved the v3/v4 problem, we would still need to build the Schema annotation, TaggedErrorClass, cross-reference, custom tag, and dependency graph extractors from scratch.

### Why NOT Option C (Full Standalone)

1. **Duplicated effort**: Implementing JSDoc parsing with `doctrine`, export detection, overload handling, re-export resolution, and namespace recursion is exactly what docgen already does. We'd be rewriting ~500 lines of well-tested code.

2. **ts-morph is the same foundation**: Both docgen and our custom code would use ts-morph. The question is whether we reuse docgen's patterns (not its v3 module code) or reinvent them.

### Why Option B (Hybrid)

We take docgen's **patterns** (not its v3 modules) and reimplement the JSDoc extraction in v4, which is ~150 lines of straightforward doctrine + ts-morph code (the `parseComment`, tag extraction, signature generation patterns). Then we add the 5 new extractors (~200 lines) that docgen fundamentally cannot provide. Total: ~350 lines of focused extraction code that covers all 11 requirements.

---

## 6. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| doctrine library compatibility with Effect v4 build | Low | doctrine is a pure JS library, no Effect dependency |
| ts-morph version mismatch | Low | ts-morph is independently versioned, we use whatever Effect v4's toolchain supports |
| `.annotate()` call chain detection breaks on complex compositions | Medium | Start with direct `.annotate()` calls (covers our codebase); extend with `pipe(schema, S.annotate(...))` pattern later |
| TaggedErrorClass factory pattern changes between Effect versions | Medium | Pin extraction to v4's `S.TaggedErrorClass<T>(id)(tag, fields, meta)` signature; add version guard |
| Type-checker resolution fails for incomplete code | Low-Med | Fall back to string-based signature when type resolution fails; cross-refs from JSDoc still work |
| Incremental re-indexing invalidation | Medium | ts-morph's `Project.addSourceFileAtPath` supports single-file updates; track file mtime for cache invalidation |
| doctrine doesn't parse inline `{@link}` as separate tags | Low | Extract inline links with regex from description text (shown in code above) |

### Effort Estimate

| Component | Lines of Code | Effort |
|-----------|:---:|:---:|
| JSDoc extractor (reimpl from docgen patterns) | ~150 | 2-3 hours |
| Schema `.annotate()` extractor | ~60 | 1 hour |
| TaggedErrorClass extractor | ~50 | 1 hour |
| Service/Layer dependency extractor | ~40 | 1 hour |
| Cross-reference extractor (@see/@link) | ~30 | 30 min |
| Custom tag extractor | ~20 | 15 min |
| Merger + SearchDoc schema | ~50 | 1 hour |
| **Total** | **~400** | **~7 hours** |
