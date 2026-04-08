Plan to implement                                                                                                                                                                                                 │
                                                                                                                                                                                                                   │
 JSDocTagDefinition Fibration Refactor Plan                                                                                                                                                                        │
                                                                                                                                                                                                                   │
 Context                                                                                                                                                                                                           │
                                                                                                                                                                                                                   │
 The JSDocTagDefinition schema carries ALL metadata as struct fields — both constant-per-tag data (synonyms, overview, specifications...) and per-occurrence instance data (_tag, value). This "fat Σ-type" means  │
 every decoded tag instance carries ~12 fields of static metadata that never vary, bloating serialized forms and LLM structured output schemas.                                                                    │
                                                                                                                                                                                                                   │
 The refactoring separates constant metadata → schema annotation (the fiber) from per-occurrence data → struct fields (the base), creating a Grothendieck fibration recoverable via S.resolveAnnotations().               │
                                                                                                                                                                                                                   │
 Key Discovery: Effect v4 Typed Annotations                                                                                                                                                                        │
                                                                                                                                                                                                                   │
 SCHEMA.md guide has a bug — it shows declare module "effect/Schema" { interface Annotations { ... } } but the actual source code (Schema.ts:9212-9220) requires a namespace Annotations wrapper:                  │
                                                                                                                                                                                                                   │
 declare module "effect/Schema" {                                                                                                                                                                                  │
   namespace Annotations {       // <-- required, missing from SCHEMA.md                                                                                                                                           │
     interface Annotations {                                                                                                                                                                                       │
       readonly jsDocTagMetadata?: JSDocTagAnnotationPayload | undefined                                                                                                                                           │
     }                                                                                                                                                                                                             │
   }                                                                                                                                                                                                               │
 }                                                                                                                                                                                                                 │
                                                                                                                                                                                                                   │
 Retrieval: S.resolveAnnotations(schema)?.["jsDocTagMetadata"]                                                                                                                                                            │
                                                                                                                                                                                                                   │
 Implementation                                                                                                                                                                                                    │
                                                                                                                                                                                                                   │
 Phase 1: Create JSDocTagAnnotation.model.ts (NEW)                                                                                                                                                                 │
                                                                                                                                                                                                                   │
 Path: tooling/repo-utils/src/JSDoc/models/JSDocTagAnnotation.model.ts                                                                                                                                             │
                                                                                                                                                                                                                   │
 Defines:                                                                                                                                                                                                          │
 1. JSDocTagAnnotationPayload type — alias for typeof JSDocTagDefinition.Type (reuses the existing class type; avoids duplicating 12 field definitions)                                                            │
 2. declare module augmentation — registers jsDocTagMetadata as a typed annotation key on Schema.Annotations.Annotations                                                                                           │
 3. getJSDocTagMetadata(schema) helper — wraps S.resolveAnnotations(schema)?.["jsDocTagMetadata"]                                                                                                                         │
                                                                                                                                                                                                                   │
 Import direction: JSDocTagAnnotation → JSDocTagDefinition (type-only import for the payload type). No circular dependency — JSDocTagDefinition.model.ts does NOT need to import this file; the declare module     │
 augmentation is ambient.                                                                                                                                                                                          │
                                                                                                                                                                                                                   │
 Phase 2: Create TagValue.model.ts (NEW)                                                                                                                                                                           │
                                                                                                                                                                                                                   │
 Path: tooling/repo-utils/src/JSDoc/models/TagValue.model.ts                                                                                                                                                       │
                                                                                                                                                                                                                   │
 Defines:                                                                                                                                                                                                          │
 4. Shape family field sets — TypeNameDescription, TypeDescription, TypeOnly, NameDescription, NameOnly, DescriptionOnly, Empty as S.Struct.Fields objects                                                         │
 5. ConstrainedValue shapes — access gets { value: S.Literal("public", "private", "protected", "package") }, kind gets its own literal union                                                                       │
 6. cases record — as const satisfies Record<string, S.Struct.Fields> mapping all ~83 tag names to their payload field set                                                                                         │
 7. TagName type — keyof typeof cases                                                                                                                                                                              │
                                                                                                                                                                                                                   │
 Assignment of tags to families follows the parameters.acceptsType/acceptsName/acceptsDescription booleans from the spec database. Special cases (callback, template, constant, module, etc.) get individual       │
 shapes.                                                                                                                                                                                                           │
                                                                                                                                                                                                                   │
 Phase 3: Modify JSDocTagDefinition.model.ts                                                                                                                                                                       │
                                                                                                                                                                                                                   │
 Path: tooling/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts                                                                                                                                             │
                                                                                                                                                                                                                   │
 Changes:                                                                                                                                                                                                          │
 - Keep JSDocTagDefinition class — unchanged (input validation schema)                                                                                                                                             │
 - Keep assertJsDoc — unchanged                                                                                                                                                                                    │
 - Keep Instance namespace type — unchanged (types the meta parameter)                                                                                                                                             │
 - Rewrite make() internals:                                                                                                                                                                                       │
                                                                                                                                                                                                                   │
 import { TagName } from "./TagValue.model.js";                                                                                                                                                        │
                                                                                                                                                                                                                   │
 export const make = <const Tag extends TString.NonEmpty, const Def extends typeof JSDocTagDefinition.Encoded>(                                                                                                    │
   _tag: Tag,                                                                                                                                                                                                      │
   meta: Omit<JSDocTagDefinition.Instance<Tag, Def>, "_tag">                                                                                                                                                       │
 ) => {                                                                                                                                                                                                            │
   // Step 1: Validate full metadata (unchanged)                                                                                                                                                                   │
   const def = S.decodeSync(JSDocTagDefinition)({ _tag, ...meta });                                                                                                                                                │
                                                                                                                                                                                                                   │
   // Step 2: Look up per-occurrence fields                                                                                                                                                                        │
   const valueFields = TagName.cases[_tag] // possible via Schema TaggedUnion / S.toTaggedUnion see @.repos/effect-v4/packages/effect/src/Schema.ts#L3121-3393
	 //                                                                                                                                                                                                     │
                                                                                                                                                                                                                   │
   // Step 3: Build lean schema: _tag discriminant + nested value                                                                                                                                                  │
   return S.TaggedStruct(_tag, {
     value: S.Struct(valueFields),                                                                                                                                                                                 │
   }).annotate({ jsDocTagMetadata: def });                                                                                                                                                                         │
 };                                                                                                                                                                                                           │
                                                                                                                                                                                                                   │
 Nested value field design: Per-occurrence payload lives under value, cleanly separating the discriminant (_tag) from the occurrence data. Decoded shape: { _tag: "param", value: { type?: string, name: string,   │
 description?: string } }. For Empty tags: { _tag: "async", value: {} }.                                                                                                                                           │
                                                                                                                                                                                                                   │
 The mapFields approach is replaced by building a fresh S.Struct. The validated def (JSDocTagDefinition class instance) is attached directly as the annotation payload — no conversion needed since                │
 JSDocTagAnnotationPayload = typeof JSDocTagDefinition.Type.                                                                                                                                                       │
                                                                                                                                                                                                                   │
 Phase 4: Update models/index.ts                                                                                                                                                                                   │
                                                                                                                                                                                                                   │
 Path: tooling/repo-utils/src/JSDoc/models/index.ts                                                                                                                                                                │
                                                                                                                                                                                                                   │
 Add exports:                                                                                                                                                                                                      │
 export * from "./JSDocTagAnnotation.model.js";                                                                                                                                                                    │
 export * from "./TagValue.model.js";                                                                                                                                                                              │
                                                                                                                                                                                                                   │
 Phase 5: Verify JSDoc.ts (NO changes expected)                                                                                                                                                                    │
                                                                                                                                                                                                                   │
 Path: tooling/repo-utils/src/JSDoc/JSDoc.ts                                                                                                                                                                       │
                                                                                                                                                                                                                   │
 Zero call-site changes. The make() signature is identical. Each tag class:                                                                                                                                        │
                                                                                                                                                                                                                   │
 export class JSDocParam extends S.Opaque<JSDocParam>()(                                                                                                                                                           │
   JSDocTagDefinition.make("param", { ...same metadata... })                                                                                                                                                       │
     .annotate($I.annote("JSDocParam"))                                                                                                                                                                            │
 ) {}                                                                                                                                                                                                              │
                                                                                                                                                                                                                   │
 What changes under the hood:                                                                                                                                                                                      │
 - JSDocParam's inner schema now has {_tag, value: {type?, name, description?}} instead of 12 fields                                                                                                               │
 - Metadata is on the annotation, coexisting with $I.annote() (different keys, S.annotate() merges)                                                                                                                │
 - S.toTaggedUnion("_tag") still works — _tag is still a S.tag() discriminant                                                                                                                                      │
 - .match() still works — discrimination is on _tag                                                                                                                                                                │
                                                                                                                                                                                                                   │
 The matchStructuralJSDoc function's callback types change (parameters no longer carry synonyms, overview, etc.) — but all callback bodies are empty () => {} so no compilation error.                             │
                                                                                                                                                                                                                   │
 Phase 6: Tests                                                                                                                                                                                                    │
                                                                                                                                                                                                                   │
 Path: tooling/repo-utils/src/JSDoc/__tests__/                                                                                                                                                                     │
                                                                                                                                                                                                                   │
 Tests to write:                                                                                                                                                                                                   │
 1. Annotation retrieval: S.resolveAnnotations(JSDocParam)?.["jsDocTagMetadata"] returns correct metadata                                                                                                                 │
 2. Lean decode: { _tag: "param", value: { name: "x", type: "string" } } decodes against JSDocParam                                                                                                                │
 3. Empty decode: { _tag: "async", value: {} } decodes against JSDocAsync                                                                                                                                          │
 4. Union discrimination: JSDocTag discriminates across all members                                                                                                                                                │
 5. Annotation through union: S.resolveAnnotations(StructuralJSDoc.cases.param)?.["jsDocTagMetadata"] works                                                                                                               │
 6. $I.annote coexistence: Both schemaId and jsDocTagMetadata accessible on same schema                                                                                                                            │
                                                                                                                                                                                                                   │
 Critical Files                                                                                                                                                                                                    │
                                                                                                                                                                                                                   │
 ┌─────────────────────────────────────────────────────────────────┬────────┬────────────────────────────────────────────────────────────┐                                                                         │
 │                              File                               │ Action │                          Purpose                           │                                                                         │
 ├─────────────────────────────────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────┤                                                                         │
 │ tooling/repo-utils/src/JSDoc/models/JSDocTagAnnotation.model.ts │ CREATE │ Typed annotation key + payload type + retrieval helper     │                                                                         │
 ├─────────────────────────────────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────┤                                                                         │
 │ tooling/repo-utils/src/JSDoc/models/TagValue.model.ts           │ CREATE │ Per-occurrence payload families + tag→fields mapping       │                                                                         │
 ├─────────────────────────────────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────┤                                                                         │
 │ tooling/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts │ MODIFY │ Rewrite make() to return lean struct + annotation          │                                                                         │
 ├─────────────────────────────────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────┤                                                                         │
 │ tooling/repo-utils/src/JSDoc/models/index.ts                    │ MODIFY │ Add new exports                                            │                                                                         │
 ├─────────────────────────────────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────┤                                                                         │
 │ tooling/repo-utils/src/JSDoc/JSDoc.ts                           │ VERIFY │ Zero changes, but must compile with new make() return type │                                                                         │
 └─────────────────────────────────────────────────────────────────┴────────┴────────────────────────────────────────────────────────────┘                                                                         │
                                                                                                                                                                                                                   │
 Reusable Existing Code                                                                                                                                                                                            │
                                                                                                                                                                                                                   │
 - $I.annote() from @beep/identity/packages — identity/tracing annotations (separate key, coexists)                                                                                                                │
 - LiteralKit from @beep/schema — used by supporting models (ApplicableTo, TagKind, etc.), unchanged                                                                                                               │
 - S.decodeSync(JSDocTagDefinition) — input validation stays in make()                                                                                                                                             │
 - S.tag(), S.Struct(), S.Opaque, S.Union, S.toTaggedUnion — all Effect v4 APIs, verified against .repos/effect-v4                                                                                                 │
 - S.resolveAnnotations() — Effect v4 annotation retrieval (Schema.ts:9189)                                                                                                                                               │
                                                                                                                                                                                                                   │
 Verification                                                                                                                                                                                                      │
                                                                                                                                                                                                                   │
 # Type check                                                                                                                                                                                                      │
 bun run check --filter @beep/repo-utils                                                                               

 │
                                                                                                                                                                                                                   │
 # Lint                                                                                                                                                                                                            │
 bun run lint-fix --filter @beep/repo-utils                                                                            

 │
                                                                                                                                                                                                                   │
 # Tests                                                                                                                                                                                                           │
 bun run test --filter @beep/repo-utils                                                                                

 │
                                                                                                                                                                                                                   │
 # Build                                                                                                                                                                                                           │
 bun run  build --filter @beep/repo-utils                                                                              


                                                                                                                                                                                                                   │
 # Verify annotation retrieval (in test or REPL)                                                                                                                                                                   │
 # S.resolveAnnotations(JSDocParam)?.["jsDocTagMetadata"]?._tag === "param"                                                                                                                                               │
 # S.resolveAnnotations(JSDocParam)?.["jsDocTagMetadata"]?.astDerivable === "partial"
