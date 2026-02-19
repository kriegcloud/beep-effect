# effect/SchemaGetter Surface

Total exports: 49

| Export | Kind | Overview |
|---|---|---|
| `BigInt` | `function` | Coerces a value to `bigint` using the global `BigInt()` constructor. |
| `Boolean` | `function` | Coerces any value to a `boolean` using the global `Boolean()` constructor. |
| `camelToSnake` | `function` | Converts a `camelCase` string to `snake_case`. |
| `capitalize` | `function` | Capitalizes the first character of a string. |
| `checkEffect` | `function` | Creates a getter that validates a value using an effectful check function. |
| `collectBracketPathEntries` | `function` | Flattens a nested object into bracket-path entries, filtering leaf values by a type guard. |
| `Date` | `function` | Coerces a value to a `Date` using `new Date(input)`. |
| `dateTimeUtcFromInput` | `function` | Parses a `DateTime.Input` value (string, number, or Date) into a `DateTime.Utc`. |
| `decodeBase64` | `function` | Decodes a Base64 string to a `Uint8Array`. |
| `decodeBase64String` | `function` | Decodes a Base64 string to a UTF-8 `string`. |
| `decodeBase64Url` | `function` | Decodes a URL-safe Base64 string to a `Uint8Array`. |
| `decodeBase64UrlString` | `function` | Decodes a URL-safe Base64 string to a UTF-8 `string`. |
| `decodeFormData` | `function` | Decodes a `FormData` object into a nested tree structure using bracket-path notation. |
| `decodeHex` | `function` | Decodes a hexadecimal string to a `Uint8Array`. |
| `decodeHexString` | `function` | Decodes a hexadecimal string to a UTF-8 `string`. |
| `decodeURLSearchParams` | `function` | Decodes a `URLSearchParams` object into a nested tree structure using bracket-path notation. |
| `encodeBase64` | `function` | Encodes a `Uint8Array` or string to a Base64 string. |
| `encodeBase64Url` | `function` | Encodes a `Uint8Array` or string to a URL-safe Base64 string. |
| `encodeFormData` | `function` | Encodes a nested object into a `FormData` instance using bracket-path notation. |
| `encodeHex` | `function` | Encodes a `Uint8Array` or string to a hexadecimal string. |
| `encodeURLSearchParams` | `function` | Encodes a nested object into a `URLSearchParams` instance using bracket-path notation. |
| `fail` | `function` | Creates a getter that always fails with the given issue. |
| `forbidden` | `function` | Creates a getter that always fails with a `Forbidden` issue. |
| `Getter` | `class` | A composable transformation from an encoded type `E` to a decoded type `T`. |
| `joinKeyValue` | `function` | Joins a record of key-value pairs into a delimited string. |
| `makeTreeRecord` | `function` | Builds a nested tree object from a list of bracket-path entries. |
| `Number` | `function` | Coerces any value to a `number` using the global `Number()` constructor. |
| `omit` | `function` | Creates a getter that always returns `None`, effectively omitting the value from output. |
| `onNone` | `function` | Creates a getter that handles the case when the input is absent (`Option.None`). |
| `onSome` | `function` | Creates a getter that handles present values (`Option.Some`), passing `None` through. |
| `parseJson` | `function` | Parses a JSON string into a value. |
| `passthrough` | `function` | Returns the identity getter — passes the value through unchanged. |
| `passthroughSubtype` | `function` | Returns the identity getter, typed for when the encoded type `E` is a subtype of `T`. |
| `passthroughSupertype` | `function` | Returns the identity getter, typed for when the decoded type `T` is a supertype of `E`. |
| `required` | `function` | Creates a getter that fails with `MissingKey` if the input is absent (`Option.None`). |
| `snakeToCamel` | `function` | Converts a `snake_case` string to `camelCase`. |
| `split` | `function` | Splits a string into an array of strings by a separator. |
| `splitKeyValue` | `function` | Parses a string into a record of key-value pairs. |
| `String` | `function` | Coerces any value to a `string` using the global `String()` constructor. |
| `stringifyJson` | `function` | Stringifies a value to JSON. |
| `succeed` | `function` | Creates a getter that always produces the given constant value, ignoring the input. |
| `toLowerCase` | `function` | Converts a string to lowercase. |
| `toUpperCase` | `function` | Converts a string to uppercase. |
| `transform` | `function` | Creates a getter that applies a pure function to present values. |
| `transformOptional` | `function` | Creates a getter that transforms the full `Option` — both present and absent values. |
| `transformOrFail` | `function` | Creates a getter that applies a fallible, effectful transformation to present values. |
| `trim` | `function` | Trims whitespace from both ends of a string. |
| `uncapitalize` | `function` | Lowercases the first character of a string. |
| `withDefault` | `function` | Creates a getter that replaces `undefined` values with a default. |
