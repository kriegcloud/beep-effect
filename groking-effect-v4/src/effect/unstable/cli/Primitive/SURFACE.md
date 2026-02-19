# effect/unstable/cli/Primitive Surface

Total exports: 22

| Export | Kind | Overview |
|---|---|---|
| `boolean` | `const` | Creates a primitive that parses boolean values from string input. |
| `choice` | `const` | Creates a primitive that accepts only specific choice values mapped to custom types. |
| `date` | `const` | Creates a primitive that parses Date objects from string input. |
| `fileParse` | `const` | Reads and parses file content using the specified schema. |
| `FileParseOptions` | `type` | Represents options which can be provided to methods that deal with parsing file content. |
| `fileSchema` | `const` | Reads and parses file content using the specified schema. |
| `FileSchemaOptions` | `type` | Represents options which can be provided to methods that deal with parsing file content and decoding the file content with a `Schema`. |
| `fileText` | `const` | Creates a primitive that reads and returns the contents of a file as a string. |
| `float` | `const` | Creates a primitive that parses floating-point numbers from string input. |
| `getChoiceKeys` | `const` | No summary found in JSDoc. |
| `getTypeName` | `const` | Gets a human-readable type name for a primitive. |
| `integer` | `const` | Creates a primitive that parses integer numbers from string input. |
| `isBoolean` | `const` | No summary found in JSDoc. |
| `isFalseValue` | `const` | No summary found in JSDoc. |
| `isTrueValue` | `const` | No summary found in JSDoc. |
| `keyValuePair` | `const` | Parses a single `key=value` pair into a record object. |
| `none` | `const` | A sentinel primitive that always fails to parse a value. |
| `path` | `const` | Creates a primitive that validates and resolves file system paths. |
| `PathType` | `type` | Specifies the type of path validation to perform. |
| `Primitive` | `interface` | Represents a primitive type that can parse string input into a typed value. |
| `redacted` | `const` | Creates a primitive that wraps string input in a redacted type for secure handling. |
| `string` | `const` | Creates a primitive that accepts any string value without validation. |
