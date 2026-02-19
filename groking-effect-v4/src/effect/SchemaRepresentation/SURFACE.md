# effect/SchemaRepresentation Surface

Total exports: 99

| Export | Kind | Overview |
|---|---|---|
| `$Annotations` | `const` | Schema codec for `Schema.Annotations.Annotations`. Filters out internal annotation keys and non-primitive values during encoding. |
| `$Any` | `const` | Schema codec for the {@link Any} representation node. |
| `$Arrays` | `const` | Schema codec for the {@link Arrays} representation node. |
| `$BigInt` | `const` | Schema codec for the {@link BigInt} representation node. |
| `$Boolean` | `const` | Schema codec for the {@link Boolean} representation node. |
| `$DateMeta` | `const` | Schema codec for {@link DateMeta}. |
| `$Declaration` | `const` | Schema codec for the {@link Declaration} representation node. |
| `$DeclarationMeta` | `const` | Schema codec for {@link DeclarationMeta}. |
| `$Document` | `const` | Schema codec for {@link Document}. Use with `Schema.decodeUnknownSync` or `Schema.encodeSync` to validate or serialize document data. |
| `$Element` | `const` | Schema codec for the {@link Element} type (positional tuple element). |
| `$Enum` | `const` | Schema codec for the {@link Enum} representation node. |
| `$IndexSignature` | `const` | Schema codec for the {@link IndexSignature} type. |
| `$Literal` | `const` | Schema codec for the {@link Literal} representation node. |
| `$LiteralValue` | `const` | Schema codec for the literal value types allowed in a {@link Literal} node (string, finite number, boolean, or bigint). |
| `$MultiDocument` | `const` | Schema codec for {@link MultiDocument}. |
| `$Never` | `const` | Schema codec for the {@link Never} representation node. |
| `$Null` | `const` | Schema codec for the {@link Null} representation node. |
| `$Number` | `const` | Schema codec for the {@link Number} representation node. |
| `$NumberMeta` | `const` | Schema codec for {@link NumberMeta}. |
| `$ObjectKeyword` | `const` | Schema codec for the {@link ObjectKeyword} representation node. |
| `$Objects` | `const` | Schema codec for the {@link Objects} representation node. |
| `$ObjectsMeta` | `const` | Schema codec for {@link ObjectsMeta}. |
| `$PrimitiveTree` | `const` | Schema codec for {@link PrimitiveTree}. |
| `$PropertySignature` | `const` | Schema codec for the {@link PropertySignature} type. |
| `$Reference` | `const` | Schema codec for the {@link Reference} representation node. |
| `$Representation` | `interface` | Type-level helper for the recursive {@link $Representation} codec. |
| `$SizeMeta` | `const` | Schema codec for {@link SizeMeta}. |
| `$String` | `const` | Schema codec for the {@link String} representation node. |
| `$StringMeta` | `const` | Schema codec for {@link StringMeta}. |
| `$Suspend` | `const` | Schema codec for the {@link Suspend} representation node. |
| `$Symbol` | `const` | Schema codec for the {@link Symbol} representation node. |
| `$TemplateLiteral` | `const` | Schema codec for the {@link TemplateLiteral} representation node. |
| `$Undefined` | `const` | Schema codec for the {@link Undefined} representation node. |
| `$Union` | `const` | Schema codec for the {@link Union} representation node. |
| `$UniqueSymbol` | `const` | Schema codec for the {@link UniqueSymbol} representation node. |
| `$Unknown` | `const` | Schema codec for the {@link Unknown} representation node. |
| `$Void` | `const` | Schema codec for the {@link Void} representation node. |
| `Any` | `interface` | The `any` type. |
| `Arrays` | `interface` | An array or tuple type. |
| `ArraysMeta` | `type` | Metadata union for array-specific validation checks (minLength, maxLength, length, unique). |
| `Artifact` | `type` | An auxiliary code artifact produced during code generation — a symbol declaration, an enum declaration, or an import statement. |
| `BigInt` | `interface` | The `bigint` type with optional validation checks. |
| `BigIntMeta` | `type` | Metadata union for bigint-specific validation checks (min, max, between). |
| `Boolean` | `interface` | The `boolean` type. |
| `Check` | `type` | A validation constraint attached to a type. Either a single {@link Filter} or a {@link FilterGroup} combining multiple checks. |
| `Code` | `type` | A pair of TypeScript source strings for a schema: `runtime` is the executable Schema expression, `Type` is the corresponding TypeScript type. |
| `CodeDocument` | `type` | The output of {@link toCodeDocument}: generated TypeScript code for one or more schemas plus their shared references and auxiliary artifacts. |
| `DateMeta` | `type` | Metadata union for Date-specific validation checks (valid, min, max, between). |
| `Declaration` | `interface` | A custom type declaration (e.g. `Date`, `Option`, `ReadonlySet`). |
| `DeclarationMeta` | `type` | Metadata union for {@link Declaration} checks — either {@link DateMeta} or {@link SizeMeta}. |
| `Document` | `type` | A single {@link Representation} together with its named {@link References}. |
| `DocumentFromJson` | `const` | Schema codec that decodes a {@link Document} from JSON and encodes it back. |
| `Element` | `interface` | A positional element within an {@link Arrays} tuple. |
| `Enum` | `interface` | A TypeScript-style enum. Each entry is a `[name, value]` pair. |
| `Filter` | `interface` | A single validation constraint with typed metadata describing the check (e.g. `{ _tag: "isMinLength", minLength: 3 }`). |
| `FilterGroup` | `interface` | A group of validation constraints that are logically combined. Contains at least one {@link Check}. |
| `fromAST` | `const` | Converts a Schema AST into a {@link Document}. |
| `fromASTs` | `const` | Converts one or more Schema ASTs into a {@link MultiDocument}. |
| `fromJsonSchemaDocument` | `function` | Parses a Draft 2020-12 JSON Schema document into a {@link Document}. |
| `fromJsonSchemaMultiDocument` | `function` | Parses a Draft 2020-12 JSON Schema multi-document into a {@link MultiDocument}. |
| `IndexSignature` | `interface` | An index signature (e.g. `[key: string]: number`) within an {@link Objects}. |
| `Literal` | `interface` | A specific literal value (`string`, `number`, `boolean`, or `bigint`). |
| `makeCode` | `function` | Constructs a {@link Code} value from a runtime expression string and a TypeScript type string. |
| `Meta` | `type` | No summary found in JSDoc. |
| `MultiDocument` | `type` | One or more {@link Representation}s sharing a common {@link References} map. |
| `MultiDocumentFromJson` | `const` | Schema codec that decodes a {@link MultiDocument} from JSON and encodes it back. |
| `Never` | `interface` | The `never` type (no valid values). |
| `Null` | `interface` | The `null` type. |
| `Number` | `interface` | The `number` type with optional validation checks. |
| `NumberMeta` | `type` | Metadata union for number-specific validation checks (int, finite, min, max, multipleOf, between). |
| `ObjectKeyword` | `interface` | The `object` keyword type (matches any non-primitive). |
| `Objects` | `interface` | An object/struct type with named properties and optional index signatures. |
| `ObjectsMeta` | `type` | Metadata union for object-specific validation checks (minProperties, maxProperties, propertiesLength, propertyNames). |
| `PrimitiveTree` | `type` | A tree of primitive values used to serialize annotations to JSON. |
| `PropertySignature` | `interface` | A named property within an {@link Objects} representation. |
| `Reference` | `interface` | A named reference to a definition in the {@link References} map. |
| `References` | `interface` | A string-keyed map of named {@link Representation} definitions. Used by {@link Document} and {@link MultiDocument} for `$ref` resolution (analogous to JSON Schema `$defs`). |
| `Representation` | `type` | The core tagged union of all supported schema shapes. |
| `Reviver` | `type` | A callback that handles {@link Declaration} nodes during reconstruction ({@link toSchema}) or code generation ({@link toCodeDocument}). |
| `sanitizeJavaScriptIdentifier` | `function` | Converts an arbitrary string into a valid (ASCII) JavaScript identifier starting with an uppercase letter, `$`, or `_`. |
| `SizeMeta` | `type` | Metadata union for size-based validation checks (minSize, maxSize, size). Used for collection types like `Set`, `Map`. |
| `String` | `interface` | The `string` type with optional validation checks. |
| `StringMeta` | `type` | Metadata union for string-specific validation checks (minLength, maxLength, pattern, UUID, trimmed, etc.). |
| `Suspend` | `interface` | A lazily-resolved representation, used for recursive schemas. |
| `Symbol` | `interface` | The `symbol` type. |
| `TemplateLiteral` | `interface` | A template literal type composed of a sequence of parts (literals, strings, numbers, etc.). |
| `toCodeDocument` | `function` | Generates TypeScript code strings from a {@link MultiDocument}. |
| `toJsonSchemaDocument` | `const` | Converts a {@link Document} to a Draft 2020-12 JSON Schema document. |
| `toJsonSchemaMultiDocument` | `const` | Converts a {@link MultiDocument} to a Draft 2020-12 JSON Schema multi-document. |
| `toMultiDocument` | `function` | Wraps a single {@link Document} as a {@link MultiDocument} with one representation. |
| `topologicalSort` | `function` | No summary found in JSDoc. |
| `TopologicalSort` | `type` | No summary found in JSDoc. |
| `toSchema` | `function` | Reconstructs a runtime Schema from a {@link Document}. |
| `toSchemaDefaultReviver` | `const` | Default {@link Reviver} for {@link toSchema} that handles built-in Effect types (Option, Result, Redacted, Cause, Exit, ReadonlyMap, ReadonlySet, Date, Duration, URL, RegExp, et... |
| `Undefined` | `interface` | The `undefined` type. |
| `Union` | `interface` | A union of multiple representations. |
| `UniqueSymbol` | `interface` | A specific unique `symbol` value. |
| `Unknown` | `interface` | The `unknown` type (any value accepted). |
| `Void` | `interface` | The `void` type. |
