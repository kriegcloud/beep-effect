# effect/Filter Surface

Total exports: 36

| Export | Kind | Overview |
|---|---|---|
| `andLeft` | `const` | Combines two filters but only returns the result of the left filter. |
| `andRight` | `const` | Combines two filters but only returns the result of the right filter. |
| `apply` | `const` | Applies a filter, predicate, or refinement to an input and returns a boxed result. Extra arguments are forwarded to the function. |
| `ApplyResult` | `type` | No summary found in JSDoc. |
| `bigint` | `const` | A predefined filter that only passes through BigInt values. |
| `boolean` | `const` | A predefined filter that only passes through boolean values. |
| `compose` | `const` | Composes two filters sequentially, feeding the output of the first into the second. |
| `composePassthrough` | `const` | Composes two filters sequentially, allowing the output of the first to be passed to the second. |
| `date` | `const` | A predefined filter that only passes through Date objects. |
| `equals` | `const` | Creates a filter that only passes values equal to the specified value using structural equality. |
| `equalsStrict` | `const` | No summary found in JSDoc. |
| `Fail` | `type` | No summary found in JSDoc. |
| `Filter` | `interface` | Represents a filter function that can transform inputs to outputs or filter them out. |
| `FilterEffect` | `interface` | Represents an effectful filter function that can produce Effects. |
| `fromPredicate` | `const` | Creates a Filter from a predicate or refinement function. |
| `fromPredicateOption` | `const` | Creates a Filter from a function that returns an Option. |
| `has` | `const` | No summary found in JSDoc. |
| `instanceOf` | `const` | Creates a filter that only passes instances of the given constructor. |
| `make` | `const` | Creates a Filter from a function that returns either a `pass` or `fail` value. |
| `makeEffect` | `const` | Creates an effectful Filter from a function that returns an Effect. |
| `mapFail` | `const` | No summary found in JSDoc. |
| `number` | `const` | A predefined filter that only passes through number values. |
| `or` | `const` | Combines two filters with logical OR semantics. |
| `OrPredicate` | `type` | No summary found in JSDoc. |
| `Pass` | `type` | No summary found in JSDoc. |
| `reason` | `const` | Creates a filter that extracts a reason from a tagged error. |
| `ResultOrBool` | `type` | No summary found in JSDoc. |
| `string` | `const` | A predefined filter that only passes through string values. |
| `symbol` | `const` | A predefined filter that only passes through Symbol values. |
| `tagged` | `const` | Creates a filter that checks if an input is tagged with a specific tag. |
| `toOption` | `const` | No summary found in JSDoc. |
| `toPredicate` | `const` | Converts a Filter into a predicate function. |
| `toResult` | `const` | No summary found in JSDoc. |
| `try` | `const` | No summary found in JSDoc. |
| `zip` | `const` | Combines two filters into a tuple of their results. |
| `zipWith` | `const` | Combines two filters and applies a function to their results. |
