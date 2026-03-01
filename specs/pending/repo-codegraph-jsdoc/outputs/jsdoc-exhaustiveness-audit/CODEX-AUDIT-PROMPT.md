# JSDoc Tag Database — Exhaustiveness Audit

## Objective

Audit `jsdoc-tags-database.ts` for completeness against three authoritative sources, then produce a gap analysis and remediation plan. The goal is to ensure the database is the **single source of truth** for all JSDoc/TSDoc/TypeScript documentation tags, suitable for building an Effect/Schema discriminated union in a code knowledge graph pipeline.

---

## Context

This database is the foundation for a TypeScript code knowledge graph that maps every documentation tag to:
- Its syntactic form (block/inline/modifier)
- What AST nodes it can attach to
- Whether its content can be derived from the TypeScript AST (the `astDerivable` field — the most critical field for the pipeline)
- Its specification origins, parameters, and relationships

The database currently contains ~65 tag entries. We need to verify this is exhaustive.

---

## Source Files Provided

| File | Description |
|------|-------------|
| `jsdoc-tags-database.ts` | The database under audit (65+ tag entries with full metadata) |
| `typescript-syntaxkind-enum.ts` | Full `SyntaxKind` enum from `typescript.d.ts` — includes JSDoc node kinds (310-352) |
| `typescript-hasjsdoc-type.ts` | The `HasJSDoc` union type from `typescript.d.ts` — compiler's authoritative list of what AST nodes can host JSDoc |

---

## Audit Tasks

### Task 1: Cross-reference JSDoc Tag SyntaxKind nodes against the database

The `SyntaxKind` enum contains specific JSDoc tag nodes in the range `FirstJSDocTagNode (328)` to `LastJSDocTagNode (352)`:

```
JSDocTag = 328               (generic fallback)
JSDocAugmentsTag = 329       → @augments / @extends
JSDocImplementsTag = 330     → @implements
JSDocAuthorTag = 331         → @author
JSDocDeprecatedTag = 332     → @deprecated
JSDocClassTag = 333          → @class / @constructor
JSDocPublicTag = 334         → @public
JSDocPrivateTag = 335        → @private
JSDocProtectedTag = 336      → @protected
JSDocReadonlyTag = 337       → @readonly
JSDocOverrideTag = 338       → @override
JSDocCallbackTag = 339       → @callback
JSDocOverloadTag = 340       → @overload
JSDocEnumTag = 341           → @enum
JSDocParameterTag = 342      → @param
JSDocReturnTag = 343         → @returns
JSDocThisTag = 344           → @this
JSDocTypeTag = 345           → @type
JSDocTemplateTag = 346       → @template
JSDocTypedefTag = 347        → @typedef
JSDocSeeTag = 348            → @see
JSDocPropertyTag = 349       → @property
JSDocThrowsTag = 350         → @throws
JSDocSatisfiesTag = 351      → @satisfies
JSDocImportTag = 352         → @import
```

**Deliverable**: A table mapping each `JSDocXxxTag` SyntaxKind to the corresponding `_tag` entry in the database. Flag any that are missing.

Also note the non-tag JSDoc SyntaxKind nodes (310-327) — these are structural JSDoc AST nodes (type expressions, links, etc.) that the database may want to reference:

```
JSDocTypeExpression = 310
JSDocNameReference = 311
JSDocMemberName = 312
JSDocAllType = 313
JSDocUnknownType = 314
JSDocNullableType = 315
JSDocNonNullableType = 316
JSDocOptionalType = 317
JSDocFunctionType = 318
JSDocVariadicType = 319
JSDocNamepathType = 320
JSDoc = 321 (the comment container itself)
JSDocText = 322
JSDocTypeLiteral = 323
JSDocSignature = 324
JSDocLink = 325
JSDocLinkCode = 326
JSDocLinkPlain = 327
```

**Question**: Should the database include entries for these structural nodes, or are they adequately covered by the tag entries that reference them? Provide a recommendation.

---

### Task 2: Cross-reference `HasJSDoc` union against the `ApplicableTo` type

The `HasJSDoc` type from `typescript.d.ts` is the compiler's exhaustive list of what AST nodes can have JSDoc comments attached. Compare this against the `ApplicableTo` union in the database.

Current `ApplicableTo` values:
```typescript
"function" | "method" | "class" | "interface" | "type-alias" | "enum" |
"enum-member" | "variable" | "constant" | "property" | "accessor" |
"constructor" | "parameter" | "module" | "namespace" | "file" |
"event" | "mixin" | "any"
```

`HasJSDoc` members from TypeScript compiler:
```
AccessorDeclaration, ArrowFunction, BinaryExpression, Block,
BreakStatement, CallSignatureDeclaration, CaseClause,
ClassLikeDeclaration, ClassStaticBlockDeclaration,
ConstructorDeclaration, ConstructorTypeNode,
ConstructSignatureDeclaration, ContinueStatement,
DebuggerStatement, DoStatement, ElementAccessExpression,
EmptyStatement, EndOfFileToken, EnumDeclaration, EnumMember,
ExportAssignment, ExportDeclaration, ExportSpecifier,
ExpressionStatement, ForInStatement, ForOfStatement, ForStatement,
FunctionDeclaration, FunctionExpression, FunctionTypeNode,
Identifier, IfStatement, ImportDeclaration, ImportEqualsDeclaration,
IndexSignatureDeclaration, InterfaceDeclaration, JSDocFunctionType,
JSDocSignature, LabeledStatement, MethodDeclaration,
MethodSignature, ModuleDeclaration, NamedTupleMember,
NamespaceExportDeclaration, ObjectLiteralExpression,
ParameterDeclaration, ParenthesizedExpression,
PropertyAccessExpression, PropertyAssignment,
PropertyDeclaration, PropertySignature, ReturnStatement,
SemicolonClassElement, ShorthandPropertyAssignment,
SpreadAssignment, SwitchStatement, ThrowStatement, TryStatement,
TypeAliasDeclaration, TypeParameterDeclaration,
VariableDeclaration, VariableStatement, WhileStatement,
WithStatement
```

**Deliverables**:
1. A mapping table: each `HasJSDoc` member → which `ApplicableTo` value(s) it maps to
2. Identify any `HasJSDoc` members that have NO corresponding `ApplicableTo` value (these are gaps)
3. Recommend whether `ApplicableTo` needs new values to cover the gaps, or whether `"any"` is sufficient

Pay special attention to these potentially unmapped `HasJSDoc` members:
- `BinaryExpression` — not a typical documentation target
- `Block` — blocks can have JSDoc for type narrowing
- Statement nodes (`BreakStatement`, `ContinueStatement`, `DoStatement`, etc.) — unusual but valid
- `CaseClause` — rarely documented
- `EndOfFileToken` — used for file-level JSDoc
- `ExportSpecifier` — can carry JSDoc
- `Identifier` — JSDoc can attach to standalone identifiers
- `SemicolonClassElement` — empty class member placeholder
- `SpreadAssignment` — in object literals
- `CallSignatureDeclaration`, `ConstructSignatureDeclaration`, `IndexSignatureDeclaration` — type member signatures
- `FunctionTypeNode`, `ConstructorTypeNode` — type-level function/constructor signatures
- `NamedTupleMember` — labeled tuple elements
- `TypeParameterDeclaration` — generic type params

---

### Task 3: Check for missing tags from canonical sources

Cross-reference the database against these authoritative lists:

#### 3a. JSDoc 3 Official (https://jsdoc.app)

The header claims 67 block tags and 2 inline tags. Verify the database contains all of them. Pay particular attention to these commonly overlooked JSDoc 3 tags:

- `@category` — groups related items (TypeDoc also uses this)
- `@inheritdoc` (block form, distinct from TSDoc inline `{@inheritDoc}`)
- `@tutorial` (inline form `{@tutorial}`)
- `@link` inline variations (`{@link}`, `{@linkcode}`, `{@linkplain}`)
- `@listens` — already present, but verify
- Any other tags listed at https://jsdoc.app that are not in the database

#### 3b. TSDoc Standard Tags (https://tsdoc.org/pages/spec/tag_kinds)

TSDoc defines these tag categories. Verify ALL are present:

**Core (must be supported):**
- `@alpha`, `@beta`, `@decorator`, `@deprecated`, `@defaultValue`, `@eventProperty`, `@example`, `@inheritDoc`, `@internal`, `@label`, `@link`, `@override`, `@packageDocumentation`, `@param`, `@privateRemarks`, `@public`, `@readonly`, `@remarks`, `@returns`, `@sealed`, `@see`, `@throws`, `@typeParam`, `@virtual`

**Extended:**
- Any tags listed on TSDoc spec that aren't in the "core" list above

**Discretionary:**
- Tags where TSDoc standardizes syntax but not semantics

#### 3c. TypeScript Compiler JSDoc Support

From https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html, verify all TS-recognized tags:

- `@type`, `@param`, `@returns`, `@typedef`, `@callback`, `@template`
- `@class`/`@constructor`, `@this`, `@extends`/`@augments`, `@implements`
- `@enum`, `@readonly`, `@override`
- `@public`, `@private`, `@protected`
- `@satisfies` (TS 4.9+)
- `@overload` (TS 5.0+)
- `@import` (TS 5.5+)
- Any others that may have been added in TypeScript 5.x

#### 3d. Google Closure Compiler Annotations

The `Specification` type includes `"closure"` but no tags in the database use it. Check if any Closure-specific tags should be added:

- `@define`
- `@dict`
- `@struct`
- `@unrestricted`
- `@suppress`
- `@externs`
- `@nosideeffects`
- `@polymer` / `@polymerBehavior`
- `@record`
- `@nocollapse`

Provide a recommendation: include these or note them as out-of-scope?

#### 3e. TypeDoc Extensions

The `Specification` type includes `"typedoc"` but no tags use it. Check for TypeDoc-specific tags:

- `@category`
- `@group`
- `@module` (TypeDoc interprets differently)
- `@hidden` / `@ignore`
- `@expand`
- `@inline`
- `@useDeclaredType`
- `@import`

---

### Task 4: Validate `astDerivable` accuracy

For each tag marked `astDerivable: "full"`, verify the claim by checking:
1. Is there a corresponding `SyntaxKind` node or modifier flag in the enum?
2. Can the TypeScript Compiler API actually extract this information?
3. Are there edge cases where the derivation fails?

For each tag marked `astDerivable: "partial"`, evaluate:
1. What percentage of real-world usage is actually derivable?
2. Should any be reclassified to `"full"` or `"none"`?

**Special focus on `@throws`**: The database claims partial derivability with a note about Effect-TS. Validate this claim — can the E channel of `Effect<A, E, R>` really be decomposed into individual error types automatically?

---

### Task 5: Validate the `ApplicableTo` ↔ `SyntaxKind` mapping

For each `ApplicableTo` value, list the corresponding `SyntaxKind` node types. This mapping is critical for the extraction pipeline — it determines which AST nodes the extractor visits for each tag.

Expected mapping (verify and complete):

| ApplicableTo | SyntaxKind(s) |
|---|---|
| `"function"` | `FunctionDeclaration (263)`, `FunctionExpression (219)`, `ArrowFunction (220)` |
| `"method"` | `MethodDeclaration (175)`, `MethodSignature (174)` |
| `"class"` | `ClassDeclaration (264)`, `ClassExpression (232)` |
| `"interface"` | `InterfaceDeclaration (265)` |
| `"type-alias"` | `TypeAliasDeclaration (266)` |
| `"enum"` | `EnumDeclaration (267)` |
| `"enum-member"` | `EnumMember (307)` |
| `"variable"` | `VariableDeclaration (261)`, `VariableStatement (244)` |
| `"property"` | `PropertyDeclaration (173)`, `PropertySignature (172)`, `PropertyAssignment (304)` |
| `"accessor"` | `GetAccessor (178)`, `SetAccessor (179)` |
| `"constructor"` | `Constructor (177)` |
| `"parameter"` | `Parameter (170)` |
| `"module"` | `ModuleDeclaration (268)`, `SourceFile (308)` |
| `"namespace"` | `ModuleDeclaration (268)` with namespace flag |
| `"file"` | `SourceFile (308)`, `EndOfFileToken (1)` |

Complete any missing mappings and flag any `HasJSDoc` members that don't fit into the current scheme.

---

## Output Format

Produce a structured report with these sections:

1. **Executive Summary** — Overall completeness score, critical gaps count
2. **SyntaxKind Cross-Reference** — Task 1 table + findings
3. **HasJSDoc Coverage Analysis** — Task 2 mapping + gaps
4. **Missing Tags Report** — Task 3 findings by source
5. **AST Derivability Validation** — Task 4 findings
6. **ApplicableTo Mapping** — Task 5 complete table
7. **Recommended Changes** — Prioritized list of additions/modifications to the database
8. **Appendix: Complete Tag Checklist** — Final checklist of all tags that should be in the database, with status (present/missing/needs-update)

---

## Success Criteria

The audit is complete when:
- Every `JSDocXxxTag` in `SyntaxKind` (328-352) maps to a database entry
- Every `HasJSDoc` member maps to an `ApplicableTo` value
- The database covers 100% of JSDoc 3, TSDoc Core, and TypeScript compiler tags
- TSDoc Extended and Discretionary tags are covered or explicitly documented as out-of-scope
- Closure and TypeDoc tags have a clear in/out-of-scope decision
- All `astDerivable` claims are validated against the compiler API
- The `ApplicableTo` ↔ `SyntaxKind` mapping is complete and accurate
