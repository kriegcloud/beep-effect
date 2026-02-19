# effect/Chunk Surface

Total exports: 81

| Export | Kind | Overview |
|---|---|---|
| `append` | `const` | Appends the specified element to the end of the `Chunk`. |
| `appendAll` | `const` | Concatenates two chunks, combining their elements. If either chunk is non-empty, the result is also a non-empty chunk. |
| `Chunk` | `interface` | A Chunk is an immutable, ordered collection optimized for efficient concatenation and access patterns. |
| `chunksOf` | `const` | Groups elements in chunks of up to `n` elements. |
| `ChunkTypeLambda` | `interface` | Type lambda for Chunk, used for higher-kinded type operations. |
| `compact` | `const` | Filter out optional values |
| `contains` | `const` | Returns a function that checks if a `Chunk` contains a given value using the default `Equivalence`. |
| `containsWith` | `const` | Returns a function that checks if a `Chunk` contains a given value using a provided `isEquivalent` function. |
| `dedupe` | `const` | Remove duplicates from an array, keeping the first occurrence of an element. |
| `dedupeAdjacent` | `const` | Deduplicates adjacent elements that are identical. |
| `difference` | `const` | Creates a `Chunk` of values not included in the other given `Chunk`. The order and references of result values are determined by the first `Chunk`. |
| `differenceWith` | `const` | Creates a `Chunk` of values not included in the other given `Chunk` using the provided `isEquivalent` function. The order and references of result values are determined by the f... |
| `drop` | `const` | Drops the first up to `n` elements from the chunk. |
| `dropRight` | `const` | Drops the last `n` elements. |
| `dropWhile` | `const` | Drops all elements so long as the predicate returns true. |
| `empty` | `const` | Creates an empty `Chunk`. |
| `every` | `const` | Check if a predicate holds true for every `Chunk` element. |
| `filter` | `const` | Returns a filtered subset of the elements. |
| `filterMap` | `const` | Returns a filtered and mapped subset of the elements. |
| `filterMapWhile` | `const` | Transforms all elements of the chunk for as long as the specified function returns some value |
| `findFirst` | `const` | Returns the first element that satisfies the specified predicate, or `None` if no such element exists. |
| `findFirstIndex` | `const` | Return the first index for which a predicate holds. |
| `findLast` | `const` | Find the last element for which a predicate holds. |
| `findLastIndex` | `const` | Return the last index for which a predicate holds. |
| `flatMap` | `const` | Applies a function to each element in a chunk and returns a new chunk containing the concatenated mapped elements. |
| `flatten` | `const` | Flattens a chunk of chunks into a single chunk by concatenating all chunks. |
| `forEach` | `const` | Iterates over each element of a `Chunk` and applies a function to it. |
| `fromArrayUnsafe` | `const` | Wraps an array into a chunk without copying, unsafe on mutable arrays |
| `fromIterable` | `const` | Creates a new `Chunk` from an iterable collection of values. |
| `fromNonEmptyArrayUnsafe` | `const` | Wraps an array into a chunk without copying, unsafe on mutable arrays |
| `get` | `const` | This function provides a safe way to read a value at a particular index from a `Chunk`. |
| `getUnsafe` | `const` | Gets an element unsafely, will throw on out of bounds |
| `head` | `const` | Returns the first element of this chunk if it exists. |
| `headNonEmpty` | `const` | Returns the first element of this non empty chunk. |
| `headUnsafe` | `const` | Returns the first element of this chunk. |
| `intersection` | `const` | Creates a Chunk of unique values that are included in all given Chunks. |
| `isChunk` | `const` | Checks if `u` is a `Chunk<unknown>` |
| `isEmpty` | `const` | Determines if the chunk is empty. |
| `isNonEmpty` | `const` | Determines if the chunk is not empty. |
| `join` | `const` | Joins the elements together with "sep" in the middle. |
| `last` | `const` | Returns the last element of this chunk if it exists. |
| `lastNonEmpty` | `const` | Returns the last element of this non empty chunk. |
| `lastUnsafe` | `const` | Returns the last element of this chunk. |
| `make` | `const` | Builds a `NonEmptyChunk` from an non-empty collection of elements. |
| `makeBy` | `const` | Return a Chunk of length n with element i initialized with f(i). |
| `makeEquivalence` | `const` | Compares the two chunks of equal length using the specified function |
| `map` | `const` | Transforms the elements of a chunk using the specified mapping function. If the input chunk is non-empty, the resulting chunk will also be non-empty. |
| `mapAccum` | `const` | Statefully maps over the chunk, producing new elements of type `B`. |
| `modify` | `const` | Applies a function to the element at the specified index, creating a new `Chunk`, or returns `None` if the index is out of bounds. |
| `NonEmptyChunk` | `interface` | A non-empty Chunk guaranteed to contain at least one element. |
| `of` | `const` | Builds a `NonEmptyChunk` from a single element. |
| `partition` | `const` | Separate elements based on a predicate that also exposes the index of the element. |
| `partitionMap` | `const` | Partitions the elements of this chunk into two chunks using f. |
| `prepend` | `const` | Prepend an element to the front of a `Chunk`, creating a new `NonEmptyChunk`. |
| `prependAll` | `const` | Prepends the specified prefix chunk to the beginning of the specified chunk. If either chunk is non-empty, the result is also a non-empty chunk. |
| `range` | `const` | Create a non empty `Chunk` containing a range of integers, including both endpoints. |
| `reduce` | `const` | Reduces the elements of a chunk from left to right. |
| `reduceRight` | `const` | Reduces the elements of a chunk from right to left. |
| `remove` | `const` | Delete the element at the specified index, creating a new `Chunk`. |
| `replace` | `const` | Change the element at the specified index, creating a new `Chunk`, or returns `None` if the index is out of bounds. |
| `reverse` | `const` | Reverses the order of elements in a `Chunk`. Importantly, if the input chunk is a `NonEmptyChunk`, the reversed chunk will also be a `NonEmptyChunk`. |
| `separate` | `const` | Partitions the elements of this chunk into two chunks. |
| `size` | `const` | Retrieves the size of the chunk. |
| `some` | `const` | Check if a predicate holds true for some `Chunk` element. |
| `sort` | `const` | Sort the elements of a Chunk in increasing order, creating a new Chunk. |
| `sortWith` | `const` | Sorts the elements of a Chunk based on a projection function. |
| `split` | `const` | Splits this chunk into `n` equally sized chunks. |
| `splitAt` | `const` | Returns two splits of this chunk at the specified index. |
| `splitNonEmptyAt` | `const` | Splits a `NonEmptyChunk` into two segments, with the first segment containing a maximum of `n` elements. The value of `n` must be `>= 1`. |
| `splitWhere` | `const` | Splits this chunk on the first element that matches this predicate. Returns a tuple containing two chunks: the first one is before the match, and the second one is from the matc... |
| `tail` | `const` | Returns every elements after the first. |
| `tailNonEmpty` | `const` | Returns every elements after the first. |
| `take` | `const` | Takes the first up to `n` elements from the chunk. |
| `takeRight` | `const` | Takes the last `n` elements. |
| `takeWhile` | `const` | Takes all elements so long as the predicate returns true. |
| `toArray` | `const` | Converts a `Chunk` into an `Array`. If the provided `Chunk` is non-empty (`NonEmptyChunk`), the function will return a `NonEmptyArray`, ensuring the non-empty property is preser... |
| `toReadonlyArray` | `const` | Converts a `Chunk` into a `ReadonlyArray`. If the provided `Chunk` is non-empty (`NonEmptyChunk`), the function will return a `NonEmptyReadonlyArray`, ensuring the non-empty pro... |
| `union` | `const` | Creates a Chunks of unique values, in order, from all given Chunks. |
| `unzip` | `const` | Takes a `Chunk` of pairs and return two corresponding `Chunk`s. |
| `zip` | `const` | Zips this chunk pointwise with the specified chunk. |
| `zipWith` | `const` | Zips this chunk pointwise with the specified chunk using the specified combiner. |
