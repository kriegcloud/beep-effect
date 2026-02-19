# effect/Schema Surface

Total exports: 274

| Export | Kind | Overview |
|---|---|---|
| `_getTagValueIfPropertyKey` | `function` | No summary found in JSDoc. |
| `annotate` | `function` | Adds metadata annotations to a schema without changing its runtime behavior. Annotations are used to provide additional context for documentation, JSON schema generation, error ... |
| `annotateKey` | `function` | Adds key-specific annotations to a schema field. This is useful for providing custom error messages and documentation for individual fields within structures. |
| `Annotations` | `namespace` | No summary found in JSDoc. |
| `Any` | `interface` | No summary found in JSDoc. |
| `Array` | `const` | No summary found in JSDoc. |
| `Array$` | `interface` | No summary found in JSDoc. |
| `asserts` | `const` | Creates an assertion function that throws an error if the input doesn't match the schema. |
| `BigInt` | `interface` | No summary found in JSDoc. |
| `Boolean` | `interface` | No summary found in JSDoc. |
| `BooleanFromBit` | `interface` | No summary found in JSDoc. |
| `Bottom` | `interface` | The base interface for all schemas in the Effect Schema library, exposing all 14 type parameters that control schema behavior and type inference. Bottom sits at the root of the ... |
| `brand` | `function` | Adds a brand to a schema. |
| `catchDecoding` | `function` | No summary found in JSDoc. |
| `catchDecodingWithContext` | `function` | No summary found in JSDoc. |
| `catchEncoding` | `function` | No summary found in JSDoc. |
| `catchEncodingWithContext` | `function` | No summary found in JSDoc. |
| `Cause` | `function` | No summary found in JSDoc. |
| `CauseFailure` | `function` | No summary found in JSDoc. |
| `CauseFailureIso` | `type` | No summary found in JSDoc. |
| `CauseIso` | `type` | No summary found in JSDoc. |
| `Char` | `const` | A schema representing a single character. |
| `check` | `function` | No summary found in JSDoc. |
| `Class` | `interface` | No summary found in JSDoc. |
| `Codec` | `namespace` | No summary found in JSDoc. |
| `compose` | `interface` | No summary found in JSDoc. |
| `ConstructorDefault` | `type` | Does the constructor of this schema supply a default value? |
| `Date` | `interface` | No summary found in JSDoc. |
| `DateTimeUtc` | `interface` | No summary found in JSDoc. |
| `DateTimeUtcFromDate` | `interface` | No summary found in JSDoc. |
| `DateTimeUtcFromMillis` | `interface` | No summary found in JSDoc. |
| `DateTimeUtcFromString` | `interface` | No summary found in JSDoc. |
| `DateValid` | `interface` | No summary found in JSDoc. |
| `declare` | `function` | An API for creating schemas for non parametric types. |
| `declareConstructor` | `function` | An API for creating schemas for parametric types. |
| `decode` | `function` | Applies a transformation to a schema, creating a new schema with the same type but transformed encoding/decoding. |
| `decodeEffect` | `const` | No summary found in JSDoc. |
| `decodeExit` | `const` | No summary found in JSDoc. |
| `decodeOption` | `const` | No summary found in JSDoc. |
| `decodePromise` | `const` | No summary found in JSDoc. |
| `Decoder` | `interface` | A `Codec` view intended for APIs that only *decode* (parse/validate) values. |
| `decodeSync` | `const` | No summary found in JSDoc. |
| `decodeTo` | `function` | Creates a schema that transforms from a source schema to a target schema. |
| `decodeUnknownEffect` | `function` | No summary found in JSDoc. |
| `decodeUnknownExit` | `function` | No summary found in JSDoc. |
| `decodeUnknownOption` | `const` | No summary found in JSDoc. |
| `decodeUnknownPromise` | `const` | No summary found in JSDoc. |
| `decodeUnknownSync` | `const` | No summary found in JSDoc. |
| `DecodingDefaultOptions` | `type` | No summary found in JSDoc. |
| `Defect` | `interface` | No summary found in JSDoc. |
| `DefectWithStack` | `const` | A schema that represents defects, that also includes stack traces in the encoded form. |
| `Duration` | `interface` | No summary found in JSDoc. |
| `DurationFromMillis` | `interface` | No summary found in JSDoc. |
| `DurationFromNanos` | `interface` | No summary found in JSDoc. |
| `encode` | `function` | No summary found in JSDoc. |
| `encodeEffect` | `const` | No summary found in JSDoc. |
| `encodeExit` | `const` | No summary found in JSDoc. |
| `encodeKeys` | `function` | No summary found in JSDoc. |
| `encodeOption` | `const` | No summary found in JSDoc. |
| `encodePromise` | `const` | No summary found in JSDoc. |
| `Encoder` | `interface` | A `Codec` view intended for APIs that only *encode* values. |
| `encodeSync` | `const` | No summary found in JSDoc. |
| `encodeTo` | `function` | No summary found in JSDoc. |
| `encodeUnknownEffect` | `function` | No summary found in JSDoc. |
| `encodeUnknownExit` | `function` | No summary found in JSDoc. |
| `encodeUnknownOption` | `const` | No summary found in JSDoc. |
| `encodeUnknownPromise` | `const` | No summary found in JSDoc. |
| `encodeUnknownSync` | `const` | No summary found in JSDoc. |
| `Enum` | `function` | No summary found in JSDoc. |
| `Error` | `interface` | No summary found in JSDoc. |
| `ErrorClass` | `interface` | No summary found in JSDoc. |
| `ErrorWithStack` | `const` | A schema that represents `Error` objects. |
| `Exit` | `function` | No summary found in JSDoc. |
| `ExitIso` | `type` | No summary found in JSDoc. |
| `ExtendableClass` | `interface` | No summary found in JSDoc. |
| `extendTo` | `function` | No summary found in JSDoc. |
| `fieldsAssign` | `function` | A shortcut for `MyStruct.mapFields(Struct.assign(fields))`. This is useful when you want to add new fields to an existing struct or a union of structs. |
| `File` | `interface` | No summary found in JSDoc. |
| `Finite` | `interface` | No summary found in JSDoc. |
| `FiniteFromString` | `interface` | No summary found in JSDoc. |
| `flip` | `function` | No summary found in JSDoc. |
| `FormData` | `interface` | No summary found in JSDoc. |
| `fromBrand` | `function` | No summary found in JSDoc. |
| `fromFormData` | `function` | `Schema.fromFormData` returns a schema that reads a `FormData` instance, converts it into a tree record using bracket notation, and then decodes the resulting structure using th... |
| `fromJsonString` | `function` | Returns a schema that decodes a JSON string and then decodes the parsed value using the given schema. |
| `fromURLSearchParams` | `function` | `Schema.fromURLSearchParams` returns a schema that reads a `URLSearchParams` instance, converts it into a tree record using bracket notation, and then decodes the resulting stru... |
| `instanceOf` | `function` | Creates a schema that validates an instance of a specific class constructor. |
| `Int` | `interface` | No summary found in JSDoc. |
| `is` | `const` | Creates a type guard function that checks if a value conforms to a given schema. |
| `isBase64` | `function` | Validates that a string is valid Base64 encoded data. |
| `isBase64Url` | `function` | Validates that a string is valid Base64URL encoded data (Base64 with URL-safe characters). |
| `isBetween` | `const` | Validates that a number is within a specified range. The range boundaries can be inclusive or exclusive based on the provided options. |
| `isBetweenBigInt` | `const` | Validates that a BigInt is within a specified range. The range boundaries can be inclusive or exclusive based on the provided options. |
| `isBetweenDate` | `const` | Validates that a Date is within a specified range. The range boundaries can be inclusive or exclusive based on the provided options. |
| `isCapitalized` | `function` | Validates that a string has its first character in uppercase. |
| `isDateValid` | `function` | Validates that a Date object represents a valid date (not an invalid date like `new Date("invalid")`). |
| `isEndsWith` | `function` | Validates that a string ends with the specified suffix. |
| `isFinite` | `function` | Validates that a number is finite (not `Infinity`, `-Infinity`, or `NaN`). |
| `isGreaterThan` | `const` | Validates that a number is greater than the specified value (exclusive). |
| `isGreaterThanBigInt` | `const` | Validates that a BigInt is greater than the specified value (exclusive). |
| `isGreaterThanDate` | `const` | Validates that a Date is greater than the specified value (exclusive). |
| `isGreaterThanOrEqualTo` | `const` | Validates that a number is greater than or equal to the specified value (inclusive). |
| `isGreaterThanOrEqualToBigInt` | `const` | Validates that a BigInt is greater than or equal to the specified value (inclusive). |
| `isGreaterThanOrEqualToDate` | `const` | Validates that a Date is greater than or equal to the specified date (inclusive). |
| `isIncludes` | `function` | Validates that a string contains the specified substring. |
| `isInt` | `function` | Validates that a number is a safe integer (within the safe integer range that can be exactly represented in JavaScript). |
| `isInt32` | `function` | Validates that a number is a 32-bit signed integer (range: -2,147,483,648 to 2,147,483,647). |
| `isLengthBetween` | `function` | Validates that a value's length is within the specified range. Works with strings and arrays. |
| `isLessThan` | `const` | Validates that a number is less than the specified value (exclusive). |
| `isLessThanBigInt` | `const` | Validates that a BigInt is less than the specified value (exclusive). |
| `isLessThanDate` | `const` | Validates that a Date is less than the specified value (exclusive). |
| `isLessThanOrEqualTo` | `const` | Validates that a number is less than or equal to the specified value (inclusive). |
| `isLessThanOrEqualToBigInt` | `const` | Validates that a BigInt is less than or equal to the specified value (inclusive). |
| `isLessThanOrEqualToDate` | `const` | Validates that a Date is less than or equal to the specified date (inclusive). |
| `isLowercased` | `function` | Validates that a string contains only lowercase characters. |
| `isMaxLength` | `function` | Validates that a value has at most the specified length. Works with strings and arrays. |
| `isMaxProperties` | `function` | Validates that an object contains at most the specified number of properties. This includes both string and symbol keys when counting properties. |
| `isMaxSize` | `function` | Validates that a value has at most the specified size. Works with values that have a `size` property, such as `Set` or `Map`. |
| `isMinLength` | `function` | Validates that a value has at least the specified length. Works with strings and arrays. |
| `isMinProperties` | `function` | Validates that an object contains at least the specified number of properties. This includes both string and symbol keys when counting properties. |
| `isMinSize` | `function` | Validates that a value has at least the specified size. Works with values that have a `size` property, such as `Set` or `Map`. |
| `isMultipleOf` | `const` | Validates that a number is a multiple of the specified divisor. |
| `isNonEmpty` | `function` | Validates that a value has at least one element. Works with strings and arrays. This is equivalent to `isMinLength(1)`. |
| `isPattern` | `const` | Validates that a string matches the specified regular expression pattern. |
| `isPropertiesLengthBetween` | `function` | Validates that an object contains between `minimum` and `maximum` properties (inclusive). This includes both string and symbol keys when counting properties. |
| `isPropertyNames` | `function` | Validates that all property names in an object satisfy the provided key schema (encoded side of the schema). |
| `isSchema` | `function` | Tests if a value is a `Schema`. |
| `isSchemaError` | `function` | No summary found in JSDoc. |
| `isSizeBetween` | `function` | Validates that a value's size is within the specified range. Works with values that have a `size` property, such as `Set` or `Map`. |
| `isStartsWith` | `function` | Validates that a string starts with the specified prefix. |
| `isStringBigInt` | `const` | Validates that a string represents a valid BigInt (can be parsed as a BigInt). |
| `isStringFinite` | `const` | Validates that a string represents a finite number. |
| `isStringSymbol` | `const` | Validates that a string represents a valid Symbol (can be parsed as a Symbol). |
| `isTrimmed` | `function` | Validates that a string has no leading or trailing whitespace. |
| `isUint32` | `function` | Validates that a number is a 32-bit unsigned integer (range: 0 to 4,294,967,295). |
| `isULID` | `function` | Validates that a string is a valid ULID (Universally Unique Lexicographically Sortable Identifier). |
| `isUncapitalized` | `function` | Validates that a string has its first character in lowercase. |
| `isUnique` | `function` | Validates that all items in an array are unique according to the provided equivalence function. |
| `isUppercased` | `function` | Validates that a string contains only uppercase characters. |
| `isUUID` | `function` | Validates that a string is a valid Universally Unique Identifier (UUID). Optionally specify a version (1-8) to validate against a specific UUID version. If no version is specifi... |
| `Json` | `type` | No summary found in JSDoc. |
| `JsonArray` | `interface` | No summary found in JSDoc. |
| `JsonObject` | `interface` | No summary found in JSDoc. |
| `LazyArbitrary` | `type` | No summary found in JSDoc. |
| `link` | `function` | No summary found in JSDoc. |
| `Literal` | `function` | used as a discriminator field in tagged unions and has a constructor default. |
| `Literals` | `function` | No summary found in JSDoc. |
| `make` | `const` | Creates a schema from an AST (Abstract Syntax Tree) node. |
| `makeFilter` | `const` | No summary found in JSDoc. |
| `makeFilterGroup` | `function` | No summary found in JSDoc. |
| `makeIsBetween` | `function` | No summary found in JSDoc. |
| `makeIsGreaterThan` | `function` | No summary found in JSDoc. |
| `makeIsGreaterThanOrEqualTo` | `function` | No summary found in JSDoc. |
| `makeIsLessThan` | `function` | No summary found in JSDoc. |
| `makeIsLessThanOrEqualTo` | `function` | No summary found in JSDoc. |
| `makeIsMultipleOf` | `function` | No summary found in JSDoc. |
| `MakeOptions` | `interface` | Configuration options for the `makeUnsafe` method, providing control over parsing behavior and validation. |
| `middlewareDecoding` | `function` | No summary found in JSDoc. |
| `middlewareEncoding` | `function` | No summary found in JSDoc. |
| `Mutability` | `type` | Is this schema read-only or mutable? |
| `mutable` | `interface` | No summary found in JSDoc. |
| `MutableJson` | `type` | No summary found in JSDoc. |
| `MutableJsonArray` | `interface` | No summary found in JSDoc. |
| `MutableJsonObject` | `interface` | No summary found in JSDoc. |
| `mutableKey` | `interface` | No summary found in JSDoc. |
| `MutableTree` | `function` | No summary found in JSDoc. |
| `MutableTreeRecord` | `interface` | No summary found in JSDoc. |
| `Never` | `interface` | No summary found in JSDoc. |
| `NonEmptyArray` | `interface` | No summary found in JSDoc. |
| `NonEmptyString` | `const` | A schema for non-empty strings. Validates that a string has at least one character. |
| `Null` | `interface` | No summary found in JSDoc. |
| `NullishOr` | `interface` | No summary found in JSDoc. |
| `NullOr` | `interface` | No summary found in JSDoc. |
| `Number` | `interface` | No summary found in JSDoc. |
| `NumberFromString` | `interface` | No summary found in JSDoc. |
| `ObjectKeyword` | `interface` | No summary found in JSDoc. |
| `Opaque` | `function` | No summary found in JSDoc. |
| `Optic` | `interface` | No summary found in JSDoc. |
| `Option` | `function` | No summary found in JSDoc. |
| `optional` | `interface` | No summary found in JSDoc. |
| `Optionality` | `type` | Is this schema required or optional? |
| `optionalKey` | `interface` | No summary found in JSDoc. |
| `OptionFromNullOr` | `function` | Decodes a nullable, required value `T` to a required `Option<T>` value. |
| `OptionFromOptional` | `function` | Decodes an optional or `undefined` value `A` to an required `Option<A>` value. |
| `OptionFromOptionalKey` | `function` | Decodes an optional value `A` to a required `Option<A>` value. |
| `OptionIso` | `type` | No summary found in JSDoc. |
| `overrideToCodecIso` | `function` | **Technical Note** |
| `overrideToEquivalence` | `function` | **Technical Note** |
| `overrideToFormatter` | `function` | **Technical Note** |
| `PropertyKey` | `const` | No summary found in JSDoc. |
| `readonlyKey` | `const` | No summary found in JSDoc. |
| `ReadonlyMap` | `function` | Creates a schema that validates a `ReadonlyMap` where keys and values must conform to the provided schemas. |
| `ReadonlyMap$` | `interface` | No summary found in JSDoc. |
| `ReadonlyMapIso` | `type` | No summary found in JSDoc. |
| `ReadonlySet` | `function` | No summary found in JSDoc. |
| `ReadonlySet$` | `interface` | No summary found in JSDoc. |
| `ReadonlySetIso` | `type` | No summary found in JSDoc. |
| `Record` | `function` | No summary found in JSDoc. |
| `Record$` | `interface` | No summary found in JSDoc. |
| `redact` | `function` | No summary found in JSDoc. |
| `Redacted` | `function` | Creates a schema for the `Redacted` type, providing secure handling of sensitive information. |
| `RedactedFromValue` | `function` | No summary found in JSDoc. |
| `refine` | `function` | No summary found in JSDoc. |
| `RegExp` | `interface` | No summary found in JSDoc. |
| `required` | `const` | No summary found in JSDoc. |
| `requiredKey` | `const` | No summary found in JSDoc. |
| `resolveInto` | `function` | Return all the typed annotations from the schema. |
| `Result` | `function` | No summary found in JSDoc. |
| `ResultIso` | `type` | No summary found in JSDoc. |
| `revealBottom` | `function` | Reveals the complete Bottom interface type of a schema, exposing all 14 type parameters. |
| `revealCodec` | `function` | No summary found in JSDoc. |
| `Schema` | `namespace` | No summary found in JSDoc. |
| `SchemaError` | `class` | A `SchemaError` is returned when schema decoding or encoding fails. |
| `StandardSchemaV1FailureResult` | `const` | No summary found in JSDoc. |
| `String` | `interface` | No summary found in JSDoc. |
| `StringTree` | `type` | No summary found in JSDoc. |
| `Struct` | `function` | No summary found in JSDoc. |
| `StructWithRest` | `function` | No summary found in JSDoc. |
| `suspend` | `function` | Creates a suspended schema that defers evaluation until needed. This is essential for creating recursive schemas where a schema references itself, preventing infinite recursion ... |
| `Symbol` | `interface` | No summary found in JSDoc. |
| `tag` | `function` | Creates a schema for a literal value and automatically provides itself as a default. |
| `tagDefaultOmit` | `function` | Similar to `tag`, but provides itself as a default when decoding and omits the value from the output when encoding. |
| `TaggedClass` | `const` | No summary found in JSDoc. |
| `TaggedErrorClass` | `const` | No summary found in JSDoc. |
| `TaggedStruct` | `function` | A tagged struct is a struct that includes a `_tag` field. This field is used to identify the specific variant of the object, which is especially useful when working with union t... |
| `TaggedUnion` | `function` | No summary found in JSDoc. |
| `TemplateLiteral` | `function` | No summary found in JSDoc. |
| `TemplateLiteralParser` | `function` | No summary found in JSDoc. |
| `toArbitrary` | `function` | No summary found in JSDoc. |
| `toArbitraryLazy` | `function` | No summary found in JSDoc. |
| `toCodecIso` | `function` | No summary found in JSDoc. |
| `toCodecJson` | `function` | No summary found in JSDoc. |
| `toCodecStringTree` | `function` | The StringTree serializer converts **every leaf value to a string**, while preserving the original structure. |
| `toDifferJsonPatch` | `function` | No summary found in JSDoc. |
| `toEncoded` | `interface` | No summary found in JSDoc. |
| `toEncoderXml` | `function` | No summary found in JSDoc. |
| `toEquivalence` | `function` | No summary found in JSDoc. |
| `toFormatter` | `function` | No summary found in JSDoc. |
| `toIso` | `function` | No summary found in JSDoc. |
| `toIsoFocus` | `function` | No summary found in JSDoc. |
| `toIsoSource` | `function` | No summary found in JSDoc. |
| `toJsonSchemaDocument` | `function` | Returns a JSON Schema Document (draft-2020-12). |
| `ToJsonSchemaOptions` | `interface` | No summary found in JSDoc. |
| `Top` | `interface` | The top (most general) type for all schema-like values in this module. |
| `toRepresentation` | `function` | No summary found in JSDoc. |
| `toStandardJSONSchemaV1` | `function` | Experimental support for converting a schema to a Standard JSON Schema V1. |
| `toStandardSchemaV1` | `function` | Returns a "Standard Schema" object conforming to the [Standard Schema v1](https://standardschema.dev/) specification. |
| `toTaggedUnion` | `function` | No summary found in JSDoc. |
| `toType` | `interface` | No summary found in JSDoc. |
| `Tree` | `function` | No summary found in JSDoc. |
| `TreeObject` | `interface` | No summary found in JSDoc. |
| `Trim` | `interface` | No summary found in JSDoc. |
| `Trimmed` | `interface` | No summary found in JSDoc. |
| `Tuple` | `function` | No summary found in JSDoc. |
| `TupleWithRest` | `function` | No summary found in JSDoc. |
| `Uint8Array` | `interface` | No summary found in JSDoc. |
| `Uint8ArrayFromBase64` | `interface` | No summary found in JSDoc. |
| `Uint8ArrayFromBase64Url` | `interface` | No summary found in JSDoc. |
| `Uint8ArrayFromHex` | `interface` | No summary found in JSDoc. |
| `Undefined` | `interface` | No summary found in JSDoc. |
| `UndefinedOr` | `interface` | No summary found in JSDoc. |
| `Union` | `function` | Creates a schema that represents a union of multiple schemas. Members are checked in order, and the first match is returned. |
| `UniqueArray` | `function` | Returns a new array schema that ensures all elements are unique. |
| `UniqueSymbol` | `function` | A schema for unique symbols. |
| `Unknown` | `interface` | No summary found in JSDoc. |
| `UnknownFromJsonString` | `interface` | No summary found in JSDoc. |
| `URL` | `interface` | No summary found in JSDoc. |
| `URLFromString` | `interface` | No summary found in JSDoc. |
| `URLSearchParams` | `interface` | No summary found in JSDoc. |
| `Void` | `interface` | No summary found in JSDoc. |
| `withConstructorDefault` | `function` | No summary found in JSDoc. |
| `withDecodingDefault` | `function` | **Options** |
| `withDecodingDefaultKey` | `function` | **Options** |
| `WithoutConstructorDefault` | `interface` | No summary found in JSDoc. |
