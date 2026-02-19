# effect/Brand Surface

Total exports: 8

| Export | Kind | Overview |
|---|---|---|
| `all` | `function` | Combines two or more brands together to form a single branded type. This API is useful when you want to validate that the input data passes multiple brand validators. |
| `Brand` | `interface` | A generic interface that defines a branded type. |
| `Branded` | `type` | A type alias for creating branded types more concisely. |
| `BrandError` | `class` | A `BrandError` is returned when a branded type is constructed from an invalid value. |
| `check` | `function` | No summary found in JSDoc. |
| `Constructor` | `interface` | A constructor for a branded type that provides validation and safe construction methods. |
| `make` | `function` | Returns a `Constructor` that can construct a branded type from an unbranded value using the provided `filter` predicate as validation of the input data. |
| `nominal` | `function` | This function returns a `Constructor` that **does not apply any runtime checks**, it just returns the provided value. It can be used to create nominal types that allow distingui... |
