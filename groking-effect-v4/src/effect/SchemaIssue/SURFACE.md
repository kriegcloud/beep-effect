# effect/SchemaIssue Surface

Total exports: 25

| Export | Kind | Overview |
|---|---|---|
| `AnyOf` | `class` | Issue produced when a value does not match *any* member of a union schema. |
| `CheckHook` | `type` | Callback type used to format {@link Filter} issues into strings. |
| `Composite` | `class` | Issue that groups multiple child issues under a single schema node. |
| `defaultCheckHook` | `const` | The built-in {@link CheckHook} used by default formatters. |
| `defaultFormatter` | `const` | No summary found in JSDoc. |
| `defaultLeafHook` | `const` | The built-in {@link LeafHook} used by default formatters. |
| `Encoding` | `class` | Issue produced when a schema transformation (encode/decode step) fails. |
| `Filter` | `class` | Issue produced when a schema filter (refinement check) fails. |
| `Forbidden` | `class` | Issue produced when a forbidden operation is encountered during parsing, such as an asynchronous Effect running inside `Schema.decodeUnknownSync`. |
| `Formatter` | `interface` | A function type that converts an {@link Issue} into a formatted representation. Specialisation of the generic `Formatter` from `Formatter.ts` with `Value` fixed to `Issue`. |
| `getActual` | `function` | Extracts the actual input value from any {@link Issue} variant. |
| `InvalidType` | `class` | Issue produced when the runtime type of the input does not match the type expected by the schema (e.g. got `null` when `string` was expected). |
| `InvalidValue` | `class` | Issue produced when the input has the correct type but its value violates a constraint (e.g. a string that is too short, a number out of range). |
| `isIssue` | `function` | Returns `true` if the given value is an {@link Issue}. |
| `Issue` | `type` | The root discriminated union of all validation error nodes. |
| `Leaf` | `type` | Union of all terminal (leaf) issue types that have no inner `Issue` children. |
| `LeafHook` | `type` | Callback type used to format {@link Leaf} issues into strings. |
| `make` | `function` | No summary found in JSDoc. |
| `makeFormatterDefault` | `function` | Creates a {@link Formatter} that converts an {@link Issue} into a human-readable multi-line string. |
| `makeFormatterStandardSchemaV1` | `function` | Creates a {@link Formatter} that produces a `StandardSchemaV1.FailureResult`. |
| `MissingKey` | `class` | Issue produced when a required key or tuple index is missing from the input. |
| `OneOf` | `class` | Issue produced when a value matches *multiple* members of a union that is configured to allow exactly one match (oneOf mode). |
| `Pointer` | `class` | Wraps an inner {@link Issue} with a property-key path, indicating *where* in a nested structure the error occurred. |
| `redact` | `function` | No summary found in JSDoc. |
| `UnexpectedKey` | `class` | Issue produced when an input object or tuple contains a key/index not declared by the schema. |
