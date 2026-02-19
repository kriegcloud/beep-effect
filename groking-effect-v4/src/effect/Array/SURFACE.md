# effect/Array Surface

Total exports: 140

| Export | Kind | Overview |
|---|---|---|
| `allocate` | `const` | Creates a new `Array` of the specified length with all slots uninitialized. |
| `AndNonEmpty` | `type` | No summary found in JSDoc. |
| `append` | `const` | Adds a single element to the end of an iterable, returning a `NonEmptyArray`. |
| `appendAll` | `const` | Concatenates two iterables into a single array. |
| `Array` | `const` | Reference to the global `Array` constructor. |
| `bind` | `const` | Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings. |
| `bindTo` | `const` | Names the elements of an array by wrapping each in an object with the given key, starting a do-notation scope. |
| `cartesian` | `const` | Computes the cartesian product of two arrays, returning all pairs as tuples. |
| `cartesianWith` | `const` | Computes the cartesian product of two arrays, applying a combiner to each pair. |
| `chop` | `const` | Repeatedly applies a function that consumes a prefix of the array and produces a value plus the remaining elements, collecting the values. |
| `chunksOf` | `const` | Splits an iterable into chunks of length `n`. The last chunk may be shorter if `n` does not evenly divide the length. |
| `contains` | `const` | Tests whether an array contains a value, using `Equal.equivalence()` for comparison. |
| `containsWith` | `const` | Returns a membership-test function using a custom equivalence. |
| `copy` | `const` | Creates a shallow copy of an array. |
| `countBy` | `const` | Counts the elements in an iterable that satisfy a predicate. |
| `dedupe` | `const` | Removes duplicates using `Equal.equivalence()`, preserving the order of the first occurrence. |
| `dedupeAdjacent` | `const` | Removes consecutive duplicate elements using `Equal.equivalence()`. |
| `dedupeAdjacentWith` | `const` | Removes consecutive duplicate elements using a custom equivalence. |
| `dedupeWith` | `const` | Removes duplicates using a custom equivalence, preserving the order of the first occurrence. |
| `difference` | `const` | Computes elements in the first array that are not in the second, using `Equal.equivalence()`. |
| `differenceWith` | `const` | Computes elements in the first array that are not in the second, using a custom equivalence. |
| `Do` | `const` | Starting point for the "do simulation" — an array comprehension pattern. |
| `drop` | `const` | Removes the first `n` elements, creating a new array. |
| `dropRight` | `const` | Removes the last `n` elements, creating a new array. |
| `dropWhile` | `const` | Drops elements from the start while the predicate holds, returning the rest. |
| `empty` | `const` | Creates an empty array. |
| `ensure` | `const` | Normalizes a value that is either a single element or an array into an array. |
| `every` | `const` | Tests whether all elements satisfy the predicate. Supports refinements for type narrowing. |
| `extend` | `const` | Applies a function to each suffix of the array (starting from each index), collecting the results. |
| `filter` | `const` | Keeps only elements satisfying a predicate (or refinement). |
| `findFirst` | `const` | Returns the first element matching a predicate, refinement, or mapping function, wrapped in `Option`. |
| `findFirstIndex` | `const` | Returns the index of the first element matching the predicate, or `undefined` if none match. |
| `findFirstWithIndex` | `const` | Returns a tuple `[element, index]` of the first element matching a predicate, or `undefined` if none match. |
| `findLast` | `const` | Returns the last element matching a predicate, refinement, or mapping function, wrapped in `Option`. |
| `findLastIndex` | `const` | Returns the index of the last element matching the predicate, or `undefined` if none match. |
| `flatMap` | `const` | Maps each element to an array and flattens the results into a single array. |
| `flatMapNullishOr` | `const` | Maps each element with a nullable-returning function, keeping only non-null / non-undefined results. |
| `flatten` | `const` | Flattens a nested array of arrays into a single array. |
| `Flatten` | `type` | No summary found in JSDoc. |
| `forEach` | `const` | Runs a side-effect for each element. The callback receives `(element, index)`. |
| `fromIterable` | `const` | Converts an `Iterable` to an `Array`. |
| `fromNullishOr` | `const` | Converts a nullable value to an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`. |
| `fromOption` | `const` | Converts an `Option` to an array: `Some(a)` becomes `[a]`, `None` becomes `[]`. |
| `fromRecord` | `const` | Converts a record into an array of `[key, value]` tuples. |
| `get` | `const` | Safely reads an element at the given index, returning `Option.some` or `Option.none` if the index is out of bounds. |
| `getFailures` | `const` | Extracts all failure values from an iterable of `Result`s, discarding successes. |
| `getReadonlyReducerConcat` | `function` | Returns a `Reducer` that combines `ReadonlyArray` values by concatenation. |
| `getSomes` | `const` | Extracts all `Some` values from an iterable of `Option`s, discarding `None`s. |
| `getSuccesses` | `const` | Extracts all success values from an iterable of `Result`s, discarding failures. |
| `getUnsafe` | `const` | Reads an element at the given index, throwing if the index is out of bounds. |
| `group` | `const` | Groups consecutive equal elements using `Equal.equivalence()`. |
| `groupBy` | `const` | Groups elements into a record by a key-returning function. Each key maps to a `NonEmptyArray` of elements that produced that key. |
| `groupWith` | `const` | Groups consecutive equal elements using a custom equivalence function. |
| `head` | `const` | Returns the first element of an array wrapped in `Option.some`, or `Option.none` if the array is empty. |
| `headNonEmpty` | `const` | Returns the first element of a `NonEmptyReadonlyArray` directly (no `Option` wrapper). |
| `Infer` | `type` | No summary found in JSDoc. |
| `init` | `function` | Returns all elements except the last, or `undefined` if the array is empty. |
| `initNonEmpty` | `const` | Returns all elements except the last of a `NonEmptyReadonlyArray`. |
| `insertAt` | `const` | Inserts an element at the specified index, returning a new `NonEmptyArray`, or `undefined` if the index is out of bounds. |
| `intersection` | `const` | Computes the intersection of two arrays using `Equal.equivalence()`. Order is determined by the first array. |
| `intersectionWith` | `const` | Computes the intersection of two arrays using a custom equivalence. Order is determined by the first array. |
| `intersperse` | `const` | Places a separator element between every pair of elements. |
| `isArray` | `const` | Tests whether a value is an `Array`. |
| `isArrayEmpty` | `const` | Tests whether a mutable `Array` is empty, narrowing the type to `[]`. |
| `isArrayNonEmpty` | `const` | Tests whether a mutable `Array` is non-empty, narrowing the type to `NonEmptyArray`. |
| `isOutOfBounds` | `function` | No summary found in JSDoc. |
| `isReadonlyArrayEmpty` | `const` | Tests whether a `ReadonlyArray` is empty, narrowing the type to `readonly []`. |
| `isReadonlyArrayNonEmpty` | `const` | Tests whether a `ReadonlyArray` is non-empty, narrowing the type to `NonEmptyReadonlyArray`. |
| `join` | `const` | Joins string elements with a separator. |
| `last` | `const` | Returns the last element of an array wrapped in `Option.some`, or `Option.none` if the array is empty. |
| `lastNonEmpty` | `const` | Returns the last element of a `NonEmptyReadonlyArray` directly (no `Option` wrapper). |
| `length` | `const` | Returns the number of elements in a `ReadonlyArray`. |
| `let` | `const` | No summary found in JSDoc. |
| `liftNullishOr` | `const` | Lifts a nullable-returning function into one that returns an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`. |
| `liftOption` | `const` | Lifts an `Option`-returning function into one that returns an array: `Some(a)` becomes `[a]`, `None` becomes `[]`. |
| `liftPredicate` | `const` | Lifts a predicate into an array: returns `[value]` if the predicate holds, `[]` otherwise. |
| `liftResult` | `const` | Lifts a `Result`-returning function into one that returns an array: failures produce `[]`, successes produce `[value]`. |
| `make` | `const` | Creates a `NonEmptyArray` from one or more elements. |
| `makeBy` | `const` | Creates a `NonEmptyArray` of length `n` where element `i` is computed by `f(i)`. |
| `makeEquivalence` | `const` | Creates an `Equivalence` for arrays based on an element `Equivalence`. Two arrays are equivalent when they have the same length and all elements are pairwise equivalent. |
| `makeOrder` | `const` | Creates an `Order` for arrays based on an element `Order`. Arrays are compared element-wise; if all compared elements are equal, shorter arrays come first. |
| `makeReducerConcat` | `function` | Returns a `Reducer` that combines `Array` values by concatenation. |
| `map` | `const` | Transforms each element using a function, returning a new array. |
| `mapAccum` | `const` | Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array. |
| `match` | `const` | Pattern-matches on an array, handling empty and non-empty cases separately. |
| `matchLeft` | `const` | Pattern-matches on an array from the left, providing the first element and the remaining elements separately. |
| `matchRight` | `const` | Pattern-matches on an array from the right, providing all elements except the last and the last element separately. |
| `max` | `const` | Returns the maximum element of a non-empty array according to the given `Order`. |
| `min` | `const` | Returns the minimum element of a non-empty array according to the given `Order`. |
| `modify` | `const` | Applies a function to the element at the specified index, returning a new array, or `undefined` if the index is out of bounds. |
| `modifyHeadNonEmpty` | `const` | Applies a function to the first element of a non-empty array, returning a new array. |
| `modifyLastNonEmpty` | `const` | Applies a function to the last element of a non-empty array, returning a new array. |
| `NonEmptyArray` | `type` | A mutable array guaranteed to have at least one element. |
| `NonEmptyReadonlyArray` | `type` | A readonly array guaranteed to have at least one element. |
| `of` | `const` | Wraps a single value in a `NonEmptyArray`. |
| `OrNonEmpty` | `type` | No summary found in JSDoc. |
| `pad` | `const` | Pads or truncates an array to exactly `n` elements, filling with `fill` if the array is shorter, or slicing if longer. |
| `partition` | `const` | Splits an iterable into two arrays: elements that fail the predicate and elements that satisfy it. |
| `partitionMap` | `const` | Maps each element to a `Result`, then separates failures and successes into two arrays. |
| `prepend` | `const` | Adds a single element to the front of an iterable, returning a `NonEmptyArray`. |
| `prependAll` | `const` | Prepends all elements from a prefix iterable to the front of an array. |
| `range` | `const` | Creates a `NonEmptyArray` containing a range of integers, inclusive on both ends. |
| `ReadonlyArray` | `namespace` | Utility types for working with `ReadonlyArray` at the type level. Use these to infer element types, preserve non-emptiness, and flatten nested arrays. |
| `ReadonlyArrayTypeLambda` | `interface` | Type lambda for `ReadonlyArray`, used for higher-kinded type operations. |
| `reduce` | `const` | Folds an iterable from left to right into a single value. |
| `reduceRight` | `const` | Folds an iterable from right to left into a single value. |
| `remove` | `const` | Removes the element at the specified index, returning a new array. If the index is out of bounds, returns a copy of the original. |
| `replace` | `const` | Replaces the element at the specified index with a new value, returning a new array, or `undefined` if the index is out of bounds. |
| `replicate` | `const` | Creates a `NonEmptyArray` containing a value repeated `n` times. |
| `reverse` | `const` | Reverses an iterable into a new array. |
| `rotate` | `const` | Rotates an array by `n` steps. Positive `n` rotates left (front elements move to the back). |
| `scan` | `const` | Left-to-right fold that keeps every intermediate accumulator value. |
| `scanRight` | `const` | Right-to-left fold that keeps every intermediate accumulator value. |
| `separate` | `const` | Separates an iterable of `Result`s into two arrays: failures and successes. |
| `setHeadNonEmpty` | `const` | Replaces the first element of a non-empty array with a new value. |
| `setLastNonEmpty` | `const` | Replaces the last element of a non-empty array with a new value. |
| `some` | `const` | Tests whether at least one element satisfies the predicate. Narrows the type to `NonEmptyReadonlyArray` on success. |
| `sort` | `const` | Sorts an array by the given `Order`, returning a new array. |
| `sortBy` | `const` | Sorts an array by multiple `Order`s applied in sequence: the first order is used first; ties are broken by the second order, and so on. |
| `sortWith` | `const` | Sorts an array by a derived key using a mapping function and an `Order` for that key. |
| `span` | `const` | Splits an iterable into two arrays: the longest prefix where the predicate holds, and the remaining elements. |
| `split` | `const` | Splits an iterable into `n` roughly equal-sized chunks. |
| `splitAt` | `const` | Splits an iterable into two arrays at the given index. |
| `splitAtNonEmpty` | `const` | Splits a non-empty array into two parts at the given index. The first part is guaranteed to be non-empty (`n` is clamped to >= 1). |
| `splitWhere` | `const` | Splits an iterable at the first element matching the predicate. The matching element is included in the second array. |
| `tail` | `function` | Returns all elements except the first, or `undefined` if the array is empty. |
| `tailNonEmpty` | `const` | Returns all elements except the first of a `NonEmptyReadonlyArray`. |
| `take` | `const` | Keeps the first `n` elements, creating a new array. |
| `takeRight` | `const` | Keeps the last `n` elements, creating a new array. |
| `takeWhile` | `const` | Takes elements from the start while the predicate holds, stopping at the first element that fails. |
| `unappend` | `const` | Splits a non-empty array into all elements except the last, and the last element. |
| `unfold` | `const` | Builds an array by repeatedly applying a function to a seed value. The function returns `[element, nextSeed]` to continue, or `undefined` to stop. |
| `union` | `const` | Computes the union of two arrays, removing duplicates using `Equal.equivalence()`. |
| `unionWith` | `const` | Computes the union of two arrays using a custom equivalence, removing duplicates. |
| `unprepend` | `const` | Splits a non-empty array into its first element and the remaining elements. |
| `unzip` | `const` | Splits an array of pairs into two arrays. Inverse of {@link zip}. |
| `window` | `const` | Creates overlapping sliding windows of size `n`. |
| `With` | `type` | No summary found in JSDoc. |
| `zip` | `const` | Pairs elements from two iterables by position. If the iterables differ in length, the extra elements from the longer one are discarded. |
| `zipWith` | `const` | Combines elements from two iterables pairwise using a function. If the iterables differ in length, extra elements are discarded. |
