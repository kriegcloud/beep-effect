# EntitySchema Model Variant Handoff Prompt

Use this prompt to start a fresh Codex session for an adversarial design review of the
`EntitySchema` / `Model` / `VariantSchema` direction.

```text
You are Codex in /home/elpresidank/YeeBois/projects/beep-effect2.

Mission: adversarially review the current EntitySchema design before any implementation.
Do not edit files during the first pass. Read source, challenge assumptions, then produce
a decision-complete implementation plan. Only implement later if explicitly asked.

Fixed product goal
- We do not want to reinvent the Effect v4 unstable schema Model API for variant projections.
- We do want EntitySchema to support upstream effect/unstable/schema/Model projection helpers
  and combinators such as:
  - Override / Overrideable / Overridable
  - Generated
  - GeneratedByApp
  - Sensitive
  - optionalOption
  - FieldOption
  - Date
  - DateWithNow
  - DateTimeWithNow
  - DateTimeFromDateWithNow
  - DateTimeFromNumberWithNow
  - DateTimeInsert
  - DateTimeInsertFromDate
  - DateTimeInsertFromNumber
  - DateTimeUpdate
  - DateTimeUpdateFromDate
  - DateTimeUpdateFromNumber
  - JsonFromString
  - UuidV4WithGenerate
  - UuidV4Insert
- Challenge the implementation shape, not that product goal.

Read these sources first
- .repos/effect-v4/packages/effect/src/unstable/schema/Model.ts
- .repos/effect-v4/packages/effect/src/unstable/schema/VariantSchema.ts
- packages/foundation/modeling/schema/src/Model.ts
- packages/foundation/modeling/schema/src/VariantSchema.ts
- packages/foundation/modeling/schema/src/EntitySchema.ts
- packages/drivers/drizzle/src/EntityTable.ts
- packages/shared/domain/src/entity/BaseEntity.ts
- Relevant tests and dtslint under:
  - packages/foundation/modeling/schema/test
  - packages/foundation/modeling/schema/dtslint
  - packages/drivers/drizzle/test
  - packages/drivers/drizzle/dtslint
  - packages/shared/domain/test
  - packages/shared/domain/dtslint

Current hypothesis to verify or reject
- VariantSchema.Field is the canonical projection algebra. It is not persistence metadata.
- Model helpers are prebuilt VariantSchema.Field values over the model variants:
  select, insert, update, json, jsonCreate, jsonUpdate.
- EntitySchema should accept an entity field input layer roughly like:
  S.Top | VariantSchema.Field<model variants>
- EntitySchema should normalize once:
  - inputFields: original caller fields/helpers, useful for class variant construction.
  - fields or selectFields: selected-row S.Top schema map, useful for domain class type,
    encoded persistence shape, definition metadata, nullability, and Drizzle projection.
  - variantFields: explicit VariantSchema.Field values should be preserved as-is;
    raw S.Top fields may still synthesize Model helpers from persistence descriptors.
- definition.fields should probably stay the normalized selected-row S.Top map so
  EntityTable.pgTableFrom can remain sound and mostly unchanged.
- PersistDescriptor stays the source of physical storage metadata:
  storageKind, valueStrategy, columnName, indexHints.

Known hazards to challenge
- Do not simply widen EntitySchema.Fields to S.Top | VariantSchema.Field.Any and hand that
  to Drizzle. VariantSchema.Field has no schema AST.
- Drizzle nullability and column $type must be derived from the selected persistence schema,
  not the wrapper, json variant, insert variant, or update variant.
- A field with no select variant cannot be a persisted entity column unless EntitySchema has
  an explicit policy for it. Prefer rejection.
- Model.Generated means "omitted from insert"; it is not, by itself, proof of a serial
  database-generated primary key.
- Model.GeneratedByApp means "present in insert but absent from JSON create/update"; it is
  not column metadata.
- Model.FieldOption means DB variants use OptionFromNullOr while JSON variants use optional
  nullable keys. Do not collapse that into one plain schema for every variant.
- Model.Sensitive only omits JSON variants. It is not encryption or authorization metadata.
- Model.DateTimeInsert*, DateTimeUpdate*, and UuidV4Insert use constructor defaults, not
  database defaults. Verify constructor-vs-decode behavior from upstream tests/source.
- Model.JsonFromString represents JSON stored as text in DB variants and object schema in
  JSON variants. Do not misclassify it as jsonb.
- Helper input and PersistDescriptor.valueStrategy can contradict each other. The design must
  reject or precisely resolve contradictions.
- Local @beep/schema may drift from upstream:
  - local VariantSchema adds variant-aware extend, mapFields, Struct input, and static
    preservation needed by EntitySchema.
  - local Model/VariantSchema naming uses Overridable, while upstream uses Overrideable.
  - local Model.Overridable default semantics may differ from upstream Overrideable.
  - local Model.JsonFromString should be checked against upstream use of toCodecJson.

Questions the critique must answer
1. Should EntitySchema accept upstream/local @beep/schema Model helpers directly, or should
   it accept only VariantSchema.Field in a narrower type? Explain with source evidence.
2. What is the exact selected-field extraction type?
   For example: SelectedFieldOf<F> = F extends VariantSchema.Field<infer C> ? C["select"] : F.
   What constraints are needed so persisted fields always have a selected S.Top?
3. Should EntitySchema preserve both inputFields and normalized selected fields in the
   definition annotation? If yes, name the metadata shape precisely.
4. How should raw S.Top fields interact with PersistDescriptor.valueStrategy?
   Should raw fields continue to synthesize Model.Generated / GeneratedByApp / DateTime helpers?
5. How should explicit Model helpers interact with PersistDescriptor.valueStrategy?
   Define the contradiction matrix or a smaller conservative rejection policy.
6. How should Sensitive, JsonFromString, FieldOption, DateTimeInsert*, DateTimeUpdate*, and
   UuidV4Insert behave through:
   - domain/select schema
   - insert schema
   - update schema
   - json/jsonCreate/jsonUpdate schemas
   - Drizzle column type/nullability
7. Are local @beep/schema Model and VariantSchema implementations close enough to upstream
   for this design, or must parity fixes happen first?
8. What tests are required before migration readiness?

Expected first response
- Start with findings, not implementation.
- Cite exact source files and important lines.
- Say clearly whether the normalization hypothesis is sound, partly sound, or wrong.
- List design corrections before proposing a patch plan.
- Produce a decision-complete implementation plan that another Codex instance can apply.
- Do not make code changes until the user asks for implementation.

Likely implementation plan if the hypothesis survives
- Add EntitySchema input types:
  - EntityFieldInput
  - EntityFieldInputs
  - SelectedFieldOf
  - SelectedFieldsOf
  - PersistDescriptorForInput
- Change ClassInput and ClassFactory generics to accept entity field inputs while keeping
  persisted descriptors checked against selected fields.
- Normalize class input once:
  - validate every persisted key has a selected S.Top schema.
  - validate selected row absence with selectedRowFieldShape.
  - build normalized selectedFields.
  - build variantFields using explicit fields as-is and descriptor-derived wrappers only
    for raw S.Top fields.
- Keep EntityTable.pgTableFrom consuming normalized definition.fields unless evidence shows
  the table projector needs a new API.
- Update BaseEntity generics to accept widened child field inputs while keeping identity
  field injection authoritative for id and entityType.
- Add runtime and tstyche coverage for:
  - raw field backward compatibility.
  - explicit Model.Generated and GeneratedByApp fields.
  - explicit Model.FieldOption preserving DB nullable and JSON optional-key behavior.
  - explicit Model.Sensitive omitting JSON variants.
  - DateTimeInsertFromNumber / DateTimeUpdateFromNumber default semantics.
  - JsonFromString selected encoded type and storage compatibility.
  - missing select variant rejection.
  - descriptor/helper contradiction rejection.
  - Drizzle table projection from explicit helper fields.

Repo constraints
- Worktree may be dirty. Do not revert user changes.
- Use repo-local imports and laws: schema-first development, Effect modules over native
  helpers, @beep/identity IdentityComposer annotations, tstyche type tests, and
  @effect/vitest runtime tests.
- Prefer source evidence over memory. Graphiti may be unavailable; if so, skip it and rely
  on repo source, .repos/effect-v4, tests, and checked-in docs.
```
