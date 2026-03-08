# Schema-Driven Extraction Targets

> Replace free-form string-based extraction class definitions with Effect Schemas as first-class extraction targets. Users define what to extract using `Schema.Struct`, `Schema.Class`, and annotations — the library generates prompts, LLM schema constraints, and typed results automatically.

## Status Quo

Today, extraction targets are defined entirely through **free-text description + JSON example files**. There is no formal schema for what classes exist, what attributes they have, or what values are valid.

```
CLI: --prompt "Extract EPL transfers" --examples-file examples.json
```

The pipeline:
1. Concatenates description + serialized examples into a plain text prompt
2. Sends to the LLM as unstructured text generation (no schema constraints)
3. Parses the free-form response with `FormatHandler` (regex fence extraction, JSON/YAML parsing)
4. Returns `Extraction` objects with `extractionClass: string` and `attributes: Record<string, string | Array<string>>`

**Problems:**
- No compile-time safety — extraction classes are arbitrary strings
- No structured output constraints sent to any LLM provider (`useSchemaConstraints` flag exists but is dead code, `GeminiSchema.ts` is an unused stub)
- `Extraction.attributes` is limited to `Record<string, string | Array<string>>` — no numbers, booleans, enums, nested objects
- Examples are the only mechanism for communicating extraction targets — no way to declare the schema independently
- No type-safe result access — consumers must do `extraction.attributes["dosage"]` with no guarantees

## Proposed Design

### Core Idea

Users define extraction targets as Effect Schemas with annotations. The library:

1. **Introspects** the schema to discover extraction classes, fields, types, and descriptions
2. **Generates prompts** from schema annotations (descriptions, examples)
3. **Generates JSON Schema** via `JSONSchema.make()` for LLM structured output constraints
4. **Validates** LLM output against the schema
5. **Returns typed results** — the extraction output type is derived from the input schema

### User-Facing API

#### Defining Extraction Targets

```typescript
import { Schema } from "effect"
import { ExtractionTarget } from "effect-langextract"

// Define what to extract using Effect Schema
const Player = Schema.Struct({
  name: Schema.String.annotations({
    description: "The player's full name as mentioned in the text",
  }),
  club: Schema.optional(Schema.String).annotations({
    description: "The club the player is associated with",
  }),
}).annotations({
  identifier: "player",
  description: "A football player mentioned in a transfer context",
  examples: [{ name: "Tammy Abraham", club: "Roma" }],
})

const TransferFee = Schema.Struct({
  amount: Schema.String.annotations({
    description: "The monetary amount of the transfer fee",
  }),
  currency: Schema.optional(
    Schema.Literal("EUR", "GBP", "USD")
  ).annotations({
    description: "The currency, if identifiable",
  }),
}).annotations({
  identifier: "transfer_fee",
  description: "A transfer fee or valuation mentioned in the text",
  examples: [{ amount: "€21m", currency: "EUR" }],
})

// Compose into an extraction target
const EPLTransferTarget = ExtractionTarget.make({
  classes: { Player, TransferFee },
  description: "Extract football transfer information from news posts",
})
```

#### Running Extraction

```typescript
import { extract } from "effect-langextract"

// Library API — fully typed results
const result = yield* extract({
  target: EPLTransferTarget,
  text: sourceText,
})

// result.extractions is Array<TypedExtraction<typeof EPLTransferTarget>>
// Each extraction is discriminated by extractionClass
for (const ext of result.extractions) {
  if (ext.extractionClass === "player") {
    ext.data.name    // string (typed!)
    ext.data.club    // string | undefined (typed!)
  }
  // ext.extractionText, ext.charInterval, ext.alignmentStatus still available
}
```

#### CLI Usage

```bash
# Schema-file mode (new)
effect-langextract extract \
  --schema ./transfers.schema.ts \
  --file posts.txt

# Legacy mode (still supported)
effect-langextract extract \
  --prompt "Extract transfers" \
  --examples-file examples.json \
  --file posts.txt
```

### Architecture

```
                    ┌──────────────────────────────┐
                    │     ExtractionTarget          │
                    │  (Effect Schemas + metadata)  │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────────┐
              │                │                    │
              ▼                ▼                    ▼
     ┌────────────┐   ┌──────────────┐   ┌──────────────────┐
     │  Prompt     │   │  JSON Schema │   │  Result          │
     │  Generator  │   │  Generator   │   │  Validator       │
     │             │   │              │   │                  │
     │ description │   │ JSONSchema   │   │ Schema.decode    │
     │ + examples  │   │ .make()      │   │ per extraction   │
     │ from annot. │   │              │   │                  │
     └──────┬──────┘   └──────┬───────┘   └────────┬─────────┘
            │                 │                    │
            ▼                 ▼                    ▼
     ┌─────────────────────────────────────────────────────┐
     │                   Annotator Pipeline                 │
     │  Chunking → Prompting → LLM Inference → Parsing →   │
     │  Schema Validation → Alignment → Typed Output        │
     └─────────────────────────────────────────────────────┘
```

### Key Components

#### 1. `ExtractionTarget` — Schema Registry

A data structure that holds the user's extraction schema definitions and derives everything needed for the pipeline.

```typescript
// src/ExtractionTarget.ts

export interface ExtractionClass<A, I, R> {
  readonly identifier: string
  readonly schema: Schema.Schema<A, I, R>
  readonly description: string
  readonly examples: ReadonlyArray<A>
}

export interface ExtractionTarget<
  Classes extends Record<string, ExtractionClass<any, any, any>>
> {
  readonly classes: Classes
  readonly description: string

  // Derived
  readonly jsonSchema: JSONSchema.JsonSchema7Root
  readonly promptDescription: string
  readonly promptExamples: ReadonlyArray<ExampleData>
}

export const make = <
  Classes extends Record<string, Schema.Schema.Any>
>(options: {
  readonly classes: Classes
  readonly description: string
}): ExtractionTarget<...> => {
  // 1. Introspect each schema for identifier, description, examples via AST
  // 2. Generate combined JSON Schema via JSONSchema.make()
  // 3. Build prompt description from schema annotations
  // 4. Build ExampleData from schema examples annotations
  // ...
}
```

#### 2. Prompt Generation from Schema Annotations

Instead of requiring a separate description string and examples file, the library generates prompts from schema annotations:

```typescript
// How schema annotations become prompt text:

// Schema.annotations({ description: "..." }) → class description in prompt
// Schema.annotations({ examples: [...] })    → few-shot examples in prompt
// Field .annotations({ description: "..." }) → field-level guidance

// Generated prompt structure:
// """
// Extract the following entity types from the text:
//
// **player**: A football player mentioned in a transfer context
//   - name (string, required): The player's full name as mentioned in the text
//   - club (string, optional): The club the player is associated with
//
// **transfer_fee**: A transfer fee or valuation mentioned in the text
//   - amount (string, required): The monetary amount of the transfer fee
//   - currency ("EUR" | "GBP" | "USD", optional): The currency, if identifiable
//
// Examples:
// Q: <example text from schema examples>
// A: {"extractions": [{"extraction_class": "player", "name": "Tammy Abraham", "club": "Roma"}]}
//
// Document: doc-1
// Text:
// <chunk text>
// """
```

This is strictly better than the current approach because:
- Descriptions are co-located with the schema definition
- Examples are type-checked at compile time
- The prompt is generated consistently (no human formatting variance)
- Users can still override with custom description text

#### 3. JSON Schema Generation for LLM Providers

Effect's `JSONSchema.make()` generates JSON Schema from Effect Schemas, with annotations propagating as `description`, `title`, `examples`, and `default` fields.

```typescript
// For the EPLTransferTarget above, JSONSchema.make() produces:
{
  "type": "object",
  "properties": {
    "extractions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "extraction_class": {
            "type": "string",
            "enum": ["player", "transfer_fee"]
          },
          "extraction_text": {
            "type": "string",
            "description": "The verbatim text from the source"
          },
          // Flattened fields from the active class
          "name": { "type": "string" },
          "club": { "type": "string" },
          "amount": { "type": "string" },
          "currency": { "type": "string", "enum": ["EUR", "GBP", "USD"] }
        },
        "required": ["extraction_class", "extraction_text"]
      }
    }
  },
  "required": ["extractions"]
}
```

This schema gets sent to providers that support structured output:
- **Gemini**: `response_schema` + `response_mime_type: "application/json"`
- **OpenAI**: `response_format: { type: "json_schema", json_schema: { schema: ... } }`
- **Anthropic**: Tool use with the schema as the tool's input schema
- **Ollama**: `format: "json"` (no structural schema, JSON mode only)

#### 4. Result Validation

After the LLM returns output and `FormatHandler` parses it, each extraction is validated against the target schema:

```typescript
// In the pipeline, after FormatHandler.parse():
const rawExtractions: Array<Record<string, unknown>> = parsed

for (const raw of rawExtractions) {
  const className = raw["extraction_class"]
  const classSchema = target.classes[className]

  if (classSchema === undefined) {
    // Unknown class — skip or warn
    continue
  }

  // Validate the extraction data against the class schema
  const result = Schema.decodeUnknownEither(classSchema.schema)(raw)

  if (Either.isLeft(result)) {
    // Validation failed — log and skip, or attempt partial recovery
    continue
  }

  // result.right is fully typed extraction data
}
```

#### 5. Typed Extraction Output

The extraction result type is derived from the input target schema:

```typescript
// The output type for each extraction
interface TypedExtraction<ClassSchemas> {
  readonly extractionClass: keyof ClassSchemas
  readonly extractionText: string
  readonly charInterval: CharInterval | undefined
  readonly alignmentStatus: AlignmentStatus
  readonly data: ClassSchemas[extractionClass]["Type"]  // typed!
}

// The full result
interface TypedAnnotatedDocument<Target> {
  readonly text: string
  readonly documentId: string | undefined
  readonly extractions: ReadonlyArray<TypedExtraction<Target["classes"]>>
}
```

### Backward Compatibility

The existing `Extraction` type and `ExampleData`-based workflow remain fully supported:

1. **Legacy mode**: `--prompt` + `--examples-file` works exactly as today
2. **Schema mode**: `--schema` provides the new schema-driven flow
3. **Mixed mode**: Users can provide a schema AND override the description/examples
4. The untyped `Extraction` type is the serialization format — `TypedExtraction` is a typed view on top

### LLM Output Format

The LLM output format changes slightly for schema mode. Instead of the current `_attributes` suffix convention:

```json
// Current format (from Python original)
{"extractions": [
  {"player": "Tammy Abraham", "player_attributes": {"club": "Roma"}},
  {"transfer_fee": "€21m", "transfer_fee_attributes": {"currency": "EUR"}}
]}
```

Schema mode uses a cleaner discriminated format:

```json
// Schema mode format
{"extractions": [
  {"extraction_class": "player", "extraction_text": "Tammy Abraham", "name": "Tammy Abraham", "club": "Roma"},
  {"extraction_class": "transfer_fee", "extraction_text": "€21m", "amount": "€21m", "currency": "EUR"}
]}
```

The `FormatHandler` already normalizes various LLM output conventions, so supporting both formats is straightforward.

### Effect Schema Features Leveraged

| Effect Schema Feature | How It's Used |
|---|---|
| `Schema.Struct` | Define extraction class fields |
| `Schema.Class` / `Schema.TaggedStruct` | Named extraction classes with identity |
| `.annotations({ description })` | Field/class descriptions → prompt text |
| `.annotations({ examples })` | Few-shot examples (type-checked!) |
| `.annotations({ identifier })` | Extraction class name |
| `Schema.Literal("a", "b")` | Constrained enum fields |
| `Schema.optional` | Optional attributes |
| `Schema.Array(S)` | List-valued attributes |
| `Schema.Union` | Variant attributes |
| `JSONSchema.make()` | Generate LLM structured output schema |
| `Schema.decode` | Validate LLM output against target |
| `AST.getPropertySignatures()` | Introspect schema for prompt generation |
| `AST.getDescriptionAnnotation()` | Read field descriptions for prompts |
| `AST.getExamplesAnnotation()` | Read examples for few-shot prompts |

### What This Enables Beyond the Python Original

The Python langextract has:
- Free-form string extraction classes
- `dict[str, str | list[str]]` attributes only
- Schema constraints only for Gemini (built by scanning examples at runtime)
- No nesting, no enums, no typed attributes
- No compile-time safety on extraction results

With Effect Schema targets:
- **Compile-time type safety** on extraction results
- **Rich attribute types**: numbers, booleans, enums, nested objects, arrays of objects
- **Schema-driven structured output** for all providers that support it
- **Co-located documentation**: descriptions and examples live with the schema
- **Schema composition**: build complex targets from reusable schema components
- **Validation at the boundary**: LLM output is validated against the schema before entering the pipeline

## Implementation Plan

### Phase 1: Foundation (ExtractionTarget + Prompt Generation)

**New files:**
- `src/ExtractionTarget.ts` — `ExtractionTarget` type, `make()` constructor, schema introspection
- `src/SchemaPromptBuilder.ts` — Generate prompt text from schema annotations

**Modified files:**
- `src/Prompting.ts` — Accept `ExtractionTarget` as an alternative to description + examples
- `src/Annotator.ts` — Thread `ExtractionTarget` through the pipeline

**Tests:**
- `test/foundation/extraction-target.test.ts`
- `test/foundation/schema-prompt-builder.test.ts`

### Phase 2: Structured Output (JSON Schema → Provider Constraints)

**New files:**
- `src/SchemaConstraints.ts` — Generate provider-specific schema constraints from `ExtractionTarget`

**Modified files:**
- `src/providers/AiAdapters.ts` — Use `generateObject` with schema when target provides one
- `src/providers/Gemini.ts` — Pass `response_schema` from target
- `src/providers/OpenAI.ts` — Pass `response_format.json_schema` from target
- `src/providers/Anthropic.ts` — Use tool-use schema from target
- `src/LanguageModel.ts` — Extend `infer()` to accept optional schema constraint
- `src/providers/GeminiSchema.ts` — Replace stub with real implementation

### Phase 3: Typed Results (Schema Validation + Type-Safe Output)

**New files:**
- `src/TypedExtraction.ts` — `TypedExtraction<Target>` type, validation logic

**Modified files:**
- `src/Resolver.ts` — Validate parsed extractions against target schema
- `src/FormatHandler.ts` — Support the new discriminated output format
- `src/Data.ts` — Extend `Extraction.attributes` to `Record<string, unknown>` (or keep backward compat)
- `src/api/Extraction.ts` — New `extractTyped()` API returning typed results

### Phase 4: CLI + DX

**Modified files:**
- `src/Cli.ts` — Add `--schema` flag for schema file path
- `src/cli/ExtractAdapter.ts` — Load and compile schema files

**New files:**
- `src/cli/SchemaLoader.ts` — Dynamic import of `.ts` schema files

### Migration Path

1. **Phase 1-2 are additive** — no breaking changes, legacy flow untouched
2. **Phase 3 adds new API** (`extractTyped`) alongside existing `extract`
3. **Phase 4 adds CLI flag** — existing flags remain
4. Eventually, `extract()` can accept either `ExtractionTarget` or legacy `{ description, examples }`

### Open Questions

1. **Schema file format for CLI**: Should `--schema` accept `.ts` files (requires dynamic import/compilation), `.json` files (JSON Schema directly), or both?

2. **Nesting depth**: How deep should nested schemas go? The Python original is flat-only. Deep nesting may confuse LLMs. Recommend: support 1 level of nesting initially, with the schema flattened in the JSON Schema sent to the LLM.

3. **Union extraction classes**: Should a single extraction be allowed to match multiple classes (union type)? Or is it strictly one class per extraction? Recommend: one class per extraction (discriminated union on `extraction_class`).

4. **Attribute-only vs text+attributes**: Some schemas might want structured data without `extraction_text` (e.g., extracting a date that maps to `{ year: number, month: number }`). Should `extraction_text` be optional in schema mode? Recommend: keep it required — it's the grounding mechanism.

5. **Example generation**: Should the library support generating example JSON from schema examples annotations automatically, or should users provide full `ExampleData` with source text? Recommend: support both — schema examples for the extraction shape, optional `ExampleData` for full source-text examples.
