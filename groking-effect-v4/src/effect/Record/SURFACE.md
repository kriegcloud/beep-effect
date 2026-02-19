# effect/Record Surface

Total exports: 44

| Export | Kind | Overview |
|---|---|---|
| `collect` | `const` | Transforms the values of a record into an `Array` with a custom mapping function. |
| `difference` | `const` | Merge two records, preserving only the entries that are unique to each record. Keys that exist in both records are excluded from the result. |
| `empty` | `const` | Creates a new, empty record. |
| `every` | `const` | Check if all entries in a record meet a specific condition. |
| `filter` | `const` | Selects properties from a record whose values match the given predicate. |
| `filterMap` | `const` | Transforms a record into a record by applying the function `f` to each key and value in the original record. If the function returns `Some`, the key-value pair is included in th... |
| `findFirst` | `const` | Returns the first entry that satisfies the specified predicate, or `None` if no such entry exists. |
| `fromEntries` | `const` | Builds a record from an iterable of key-value pairs. |
| `fromIterableBy` | `const` | Creates a new record from an iterable, utilizing the provided function to determine the key for each element. |
| `fromIterableWith` | `const` | Takes an iterable and a projection function and returns a record. The projection function maps each value of the iterable to a tuple of a key and a value, which is then added to... |
| `get` | `const` | Retrieve a value at a particular key from a record, returning it wrapped in an `Option`. |
| `getFailures` | `const` | Given a record with `Result` values, returns a new record containing only the `Err` values, preserving the original keys. |
| `getSomes` | `const` | Given a record with `Option` values, returns a new record containing only the `Some` values, preserving the original keys. |
| `getSuccesses` | `const` | Given a record with `Result` values, returns a new record containing only the `Ok` values, preserving the original keys. |
| `has` | `const` | Check if a given `key` exists in a record. |
| `intersection` | `const` | Merge two records, retaining only the entries that exist in both records. For intersecting keys, the provided combine function is used to merge the values. |
| `isEmptyReadonlyRecord` | `const` | Determine if a record is empty. |
| `isEmptyRecord` | `const` | Determine if a record is empty. |
| `isSubrecord` | `const` | Check if one record is a subrecord of another, meaning it contains all the keys and values found in the second record. This comparison uses default equality checks (`Equal.equiv... |
| `isSubrecordBy` | `const` | Check if all the keys and values in one record are also found in another record. Uses the provided equivalence function to compare values. |
| `keys` | `const` | Retrieve the keys of a given record as an array. |
| `makeEquivalence` | `const` | Create an `Equivalence` for records using the provided `Equivalence` for values. Two records are considered equivalent if they have the same keys and their corresponding values ... |
| `makeReducerIntersection` | `function` | A `Reducer` for combining `Record`s using intersection. |
| `makeReducerUnion` | `function` | A `Reducer` for combining `Record`s using union. |
| `map` | `const` | Maps a record into another record by applying a transformation function to each of its values. |
| `mapEntries` | `const` | Maps entries of a `ReadonlyRecord` using the provided function, allowing modification of both keys and corresponding values. |
| `mapKeys` | `const` | Maps the keys of a `ReadonlyRecord` while preserving the corresponding values. |
| `modify` | `const` | Apply a function to the element at the specified key, creating a new record, or return `undefined` if the key doesn't exist. |
| `partition` | `const` | Partitions a record into two separate records based on the result of a predicate function. |
| `partitionMap` | `const` | Partitions the elements of a record into two groups: those that match a predicate, and those that don't. |
| `pop` | `const` | Retrieves the value of the property with the given `key` from a record and returns an `Option` of a tuple with the value and the record with the removed property. If the key is ... |
| `ReadonlyRecord` | `type` | Represents a readonly record with keys of type `K` and values of type `A`. This is the foundational type for immutable key-value mappings in Effect. |
| `ReadonlyRecordTypeLambda` | `interface` | Type lambda for readonly records, used in higher-kinded type operations. This enables records to work with generic type constructors and functors. |
| `reduce` | `const` | Reduce a record to a single value by combining its entries with a specified function. |
| `remove` | `const` | If the given key exists in the record, returns a new record with the key removed, otherwise returns `undefined`. |
| `replace` | `const` | Replaces a value in the record with the new value passed as parameter. |
| `separate` | `const` | Partitions a record of `Result` values into two separate records, one with the `Err` values and one with the `Ok` values. |
| `set` | `const` | Add a new key-value pair or update an existing key's value in a record. |
| `singleton` | `const` | Create a non-empty record from a single element. |
| `size` | `const` | Returns the number of key/value pairs in a record. |
| `some` | `const` | Check if any entry in a record meets a specific condition. |
| `toEntries` | `const` | Takes a record and returns an array of tuples containing its keys and values. |
| `union` | `const` | Merge two records, preserving entries that exist in either of the records. For keys that exist in both records, the provided combine function is used to merge the values. |
| `values` | `const` | Retrieve the values of a given record as an array. |
