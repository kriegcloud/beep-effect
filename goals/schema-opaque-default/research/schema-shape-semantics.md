# Effect v4 Class vs Struct vs Opaque semantics (2026-10-13)

Verified against installed effect 4.0.2 (`node_modules/effect/dist`) and reference 4.0.4 source; no drift for these APIs.

## Runtime
- S.Class: decode -> `new self(...)` instance (Schema.js:9210-9216); type-side check `instanceof self || hasProperty(ClassTypeId)` (9228-9231) => S.is/encode REJECT plain objects ("Expected X"). new X validates+defaults; X.make passes instances through. Has extend/mapFields(->Struct)/fields. annotate() returns non-X schema.
- S.Struct: plain objects; shape-only checks; make via proto; no .extend (fieldsAssign/extendTo).
- S.Opaque: runtime no-op (Schema.js:3367-3369) => plain objects, shape checks; `new` typed never; make returns Self; fields/mapFields kept; no .extend; statics OK but annotate() drops them; schemaOpaqueInstanceMember forbids instance members.
- Equal: structural for all objects; class instance never equals a plain object; arrow-fn instance props break Equal + leak into JSON (04-rich-domain-model.md:237,245 example).
- Brand: phantom type-only (Class: Type & Brand; Opaque: S["Type"] & Brand); `{}` = structurally open (class then fails at runtime only). S.brand is Struct's analogue (no .fields).
- Serialization: RPC client make()s payloads (safe); HttpApiClient encodes payload as-is (plain obj vs class payload => "Expected X"); VariantSchema.Class default variant is S.Class; structuredClone strips class + TaggedError fields.
## Doctrine
- Binding: ARCHITECTURE.md §5 schema-first only; ProductEntity/.model.ts + DECISIONS.md:626 => persisted entities are schema classes; errors are classes.
- Guidance only: standards/effect-first-development.md:105,310,799,1349 "Prefer S.Class over S.Struct"; schema-first skill repo-laws.md:22-27; effect-first skill SKILL.md:65; always-never-core.md:70-72; pattern-catalog.md:34-39; .patterns/effect-library-development.md:434 (claims S.Class opaque — false without brand).
- Enforced: `beep lint schema-first` object-struct-schema kind (SchemaFirstScan.ts:193-214, SchemaFirstDetectors.ts:362-410) fails exported S.Struct unless inventoried exception (19 today); tooling lint requires $I.annote on `S.Class<…>($I…)` with regex `<[^>]+>` (Lint.command.ts:382-390) — will miss brand args containing `>`.
- No doc mentions S.Opaque.
