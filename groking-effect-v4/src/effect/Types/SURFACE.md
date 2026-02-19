# effect/Types Surface

Total exports: 30

| Export | Kind | Overview |
|---|---|---|
| `Concurrency` | `type` | Describes the concurrency level for Effect operations that run multiple effects. |
| `Contravariant` | `type` | Function-type alias encoding contravariant variance for a phantom type parameter. |
| `Covariant` | `type` | Function-type alias encoding covariant variance for a phantom type parameter. |
| `DeepMutable` | `type` | Recursively removes `readonly` from all properties, including nested objects, arrays, `Map`, and `Set`. |
| `Equals` | `type` | Determines if two types are exactly equal at the type level. |
| `EqualsWith` | `type` | Determines if two types are equal, returning custom types for each case. |
| `ExcludeReason` | `type` | Excludes a specific reason variant by its `_tag` from an error's `reason` field. |
| `ExcludeTag` | `type` | Excludes members of a tagged union by their `_tag` value. |
| `ExtractReason` | `type` | Extracts a specific reason variant by its `_tag` from an error's `reason` field. |
| `ExtractTag` | `type` | Extracts a specific member of a tagged union by its `_tag` value. |
| `Has` | `type` | Checks if an object type contains any of the specified keys. |
| `Invariant` | `type` | Function-type alias encoding invariant variance for a phantom type parameter. |
| `IsUnion` | `type` | Checks whether a type `T` is a union type. |
| `MatchRecord` | `type` | Conditional type that checks if `S` is an empty object type. |
| `MergeLeft` | `type` | Merges two object types where keys from `Source` take precedence over `Target` on conflict. |
| `MergeRecord` | `type` | Alias for {@link MergeLeft}. Merges two object types where keys from `Source` take precedence on conflict. |
| `MergeRight` | `type` | Merges two object types where keys from `Source` take precedence over `Target` on conflict. |
| `Mutable` | `type` | Removes `readonly` from all properties of `T`. Supports arrays, tuples, and records. |
| `NoExcessProperties` | `type` | Constrains a type to prevent excess properties not present in `T`. |
| `NoInfer` | `type` | Prevents TypeScript from inferring a type parameter from a specific position. |
| `NotFunction` | `type` | Excludes function types from a union, keeping only non-function members. |
| `ReasonOf` | `type` | Extracts the `reason` type from an error that has a `reason` field. |
| `ReasonTags` | `type` | Extracts the `_tag` values from the `reason` type of an error. |
| `Simplify` | `type` | Flattens an intersection type into a single object type for readability. |
| `Tags` | `type` | Extracts the `_tag` string literal types from a union. |
| `TupleOf` | `type` | Constructs a tuple type with exactly `N` elements of type `T`. |
| `TupleOfAtLeast` | `type` | Constructs a tuple type with at least `N` elements of type `T`. |
| `unassigned` | `interface` | Branded marker interface representing an unassigned type parameter. |
| `unhandled` | `interface` | Branded marker interface representing an unhandled error type. |
| `UnionToIntersection` | `type` | Transforms a union type into an intersection type. |
