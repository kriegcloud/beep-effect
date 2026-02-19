# effect/Iterable Surface

Total exports: 50

| Export | Kind | Overview |
|---|---|---|
| `append` | `const` | Append an element to the end of an `Iterable`, creating a new `Iterable`. |
| `appendAll` | `const` | Concatenates two iterables, combining their elements. |
| `cartesian` | `const` | Zips this Iterable crosswise with the specified Iterable. |
| `cartesianWith` | `const` | Zips this Iterable crosswise with the specified Iterable using the specified combiner. |
| `chunksOf` | `const` | Splits an `Iterable` into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of the `Iterable`. |
| `contains` | `const` | Returns a function that checks if a `Iterable` contains a given value using the default `Equivalence`. |
| `containsWith` | `const` | Returns a function that checks if an `Iterable` contains a given value using a provided `isEquivalent` function. |
| `countBy` | `const` | Counts all the element of the given iterable that pass the given predicate |
| `dedupeAdjacent` | `const` | Deduplicates adjacent elements that are identical. |
| `dedupeAdjacentWith` | `const` | Deduplicates adjacent elements that are identical using the provided `isEquivalent` function. |
| `drop` | `const` | Drop a max number of elements from the start of an `Iterable` |
| `empty` | `const` | Creates an empty iterable that yields no elements. |
| `filter` | `const` | Filters an iterable to only include elements that match a predicate. |
| `filterMap` | `const` | Transforms elements of an iterable using a function that returns an Option, keeping only the Some values. |
| `filterMapWhile` | `const` | Transforms all elements of the `Iterable` for as long as the specified function returns some value |
| `findFirst` | `const` | Returns the first element that satisfies the specified predicate, or `None` if no such element exists. |
| `findLast` | `const` | Find the last element for which a predicate holds. |
| `flatMap` | `const` | Applies a function to each element in an Iterable and returns a new Iterable containing the concatenated mapped elements. |
| `flatMapNullishOr` | `const` | Transforms elements using a function that may return null or undefined, filtering out the null/undefined results. |
| `flatten` | `const` | Flattens an Iterable of Iterables into a single Iterable |
| `forEach` | `const` | Iterate over the `Iterable` applying `f`. |
| `forever` | `const` | No summary found in JSDoc. |
| `fromRecord` | `const` | Takes a record and returns an Iterable of tuples containing its keys and values. |
| `getFailures` | `const` | Retrieves the `Err` values from an `Iterable` of `Result`s. |
| `getSomes` | `const` | Retrieves the `Some` values from an `Iterable` of `Option`s. |
| `getSuccesses` | `const` | Retrieves the `Ok` values from an `Iterable` of `Result`s. |
| `group` | `const` | Group equal, consecutive elements of an `Iterable` into `NonEmptyArray`s. |
| `groupBy` | `const` | Splits an `Iterable` into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning function on each element, and grouping the results accord... |
| `groupWith` | `const` | Group equal, consecutive elements of an `Iterable` into `NonEmptyArray`s using the provided `isEquivalent` function. |
| `head` | `const` | Get the first element of a `Iterable`, or `None` if the `Iterable` is empty. |
| `headUnsafe` | `const` | Get the first element of a `Iterable`, or throw an error if the `Iterable` is empty. |
| `intersperse` | `const` | Places an element in between members of an `Iterable`. If the input is a non-empty array, the result is also a non-empty array. |
| `isEmpty` | `const` | Determine if an `Iterable` is empty |
| `makeBy` | `const` | Creates an iterable by applying a function to consecutive integers. |
| `map` | `const` | Transforms each element of an iterable using a function. |
| `of` | `const` | Creates an iterable containing a single element. |
| `prepend` | `const` | Prepend an element to the front of an `Iterable`, creating a new `Iterable`. |
| `prependAll` | `const` | Prepends the specified prefix iterable to the beginning of the specified iterable. |
| `range` | `const` | Return a `Iterable` containing a range of integers, including both endpoints. |
| `reduce` | `const` | Reduce an iterable to a single value by applying a function to each element and accumulating the result. |
| `repeat` | `const` | No summary found in JSDoc. |
| `replicate` | `const` | Return a `Iterable` containing a value repeated the specified number of times. |
| `scan` | `const` | Reduce an `Iterable` from the left, keeping all intermediate results instead of only the final result. |
| `size` | `const` | Return the number of elements in a `Iterable`. |
| `some` | `const` | Check if a predicate holds true for some `Iterable` element. |
| `take` | `const` | Keep only a max number of elements from the start of an `Iterable`, creating a new `Iterable`. |
| `takeWhile` | `const` | Calculate the longest initial Iterable for which all element satisfy the specified predicate, creating a new `Iterable`. |
| `unfold` | `const` | Generates an iterable by repeatedly applying a function that produces the next element and state. |
| `zip` | `const` | Takes two `Iterable`s and returns an `Iterable` of corresponding pairs. |
| `zipWith` | `const` | Apply a function to pairs of elements at the same index in two `Iterable`s, collecting the results. If one input `Iterable` is short, excess elements of the longer `Iterable` ar... |
