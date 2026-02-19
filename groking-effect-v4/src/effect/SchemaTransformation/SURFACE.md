# effect/SchemaTransformation Surface

Total exports: 30

| Export | Kind | Overview |
|---|---|---|
| `bigintFromString` | `const` | Decodes a `string` into a `bigint` and encodes a `bigint` back to a `string`. |
| `capitalize` | `function` | A string-to-string transformation that capitalizes the first character on decode. Encode is passthrough. |
| `durationFromMillis` | `const` | Decodes a `number` (milliseconds) into a `Duration` and encodes a `Duration` back to `number` milliseconds. |
| `durationFromNanos` | `const` | Decodes a `bigint` (nanoseconds) into a `Duration` and encodes a `Duration` back to `bigint` nanoseconds. |
| `errorFromErrorJsonEncoded` | `const` | No summary found in JSDoc. |
| `fromFormData` | `const` | Decodes a `FormData` instance into an `unknown` record and encodes an `unknown` record back to `FormData`. |
| `fromJsonString` | `const` | Decodes a JSON `string` into an `unknown` value and encodes an `unknown` value back to a JSON string. |
| `fromURLSearchParams` | `const` | Decodes a `URLSearchParams` instance into an `unknown` record and encodes an `unknown` record back to `URLSearchParams`. |
| `isTransformation` | `function` | Returns `true` if `u` is a `Transformation` instance. |
| `make` | `const` | Constructs a `Transformation` from an object with `decode` and `encode` `Getter`s. If the input is already a `Transformation`, returns it as-is. |
| `Middleware` | `class` | A middleware that wraps the entire parsing `Effect` pipeline for both decode and encode directions. |
| `numberFromString` | `const` | Decodes a `string` into a `number` and encodes a `number` back to a `string`. |
| `optionFromNullOr` | `function` | Decodes `T \| null` into `Option<T>` and encodes `Option<T>` back to `T \| null`. |
| `optionFromOptional` | `function` | Decodes `T \| undefined` into `Option<T>` and encodes `Option<T>` back to `T \| undefined`. |
| `optionFromOptionalKey` | `function` | Decodes an optional struct key into `Option<T>` and encodes `Option<T>` back to an optional key. |
| `passthrough` | `function` | The identity transformation — returns the input unchanged in both directions. |
| `passthroughSubtype` | `function` | A passthrough transformation typed so that `E extends T` — the encoded type is a subtype of the decoded type. |
| `passthroughSupertype` | `function` | A passthrough transformation typed so that `T extends E` — the decoded type is a supertype of the encoded type. |
| `snakeToCamel` | `function` | A string-to-string transformation that converts snake_case to camelCase on decode and camelCase to snake_case on encode. |
| `splitKeyValue` | `function` | A transformation that decodes a string into a record of key-value pairs and encodes a record of key-value pairs into a string. |
| `toLowerCase` | `function` | A string-to-string transformation that lowercases on decode. Encode is passthrough. |
| `toUpperCase` | `function` | A string-to-string transformation that uppercases on decode. Encode is passthrough. |
| `transform` | `function` | Creates a `Transformation` from pure (sync, infallible) decode and encode functions. |
| `Transformation` | `class` | A bidirectional transformation between a decoded type `T` and an encoded type `E`, built from a pair of `Getter`s. |
| `transformOptional` | `function` | Creates a `Transformation` where decode and encode operate on `Option` values, giving full control over missing-key handling. |
| `transformOrFail` | `function` | Creates a `Transformation` from effectful decode and encode functions that can fail with `Issue`. |
| `trim` | `function` | A string-to-string transformation that trims whitespace on decode. Encode is passthrough (no change). |
| `uint8ArrayFromBase64String` | `const` | Decodes a Base64-encoded `string` into a `Uint8Array` and encodes a `Uint8Array` back to a Base64 string. |
| `uncapitalize` | `function` | A string-to-string transformation that lowercases the first character on decode. Encode is passthrough. |
| `urlFromString` | `const` | Decodes a `string` into a `URL` and encodes a `URL` back to its `href` string. |
