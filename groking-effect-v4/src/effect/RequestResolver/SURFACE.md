# effect/RequestResolver Surface

Total exports: 20

| Export | Kind | Overview |
|---|---|---|
| `around` | `const` | A request resolver aspect that executes requests between two effects, `before` and `after`, where the result of `before` can be used by `after`. |
| `asCache` | `const` | Wraps a request resolver in a cache, allowing it to cache results up to a specified capacity and optional time-to-live. |
| `batchN` | `const` | Returns a request resolver that executes at most `n` requests in parallel. |
| `fromEffect` | `const` | Constructs a request resolver from an effectual function. |
| `fromEffectTagged` | `const` | Constructs a request resolver from a list of tags paired to functions, that takes a list of requests and returns a list of results of the same size. Each item in the result list... |
| `fromFunction` | `const` | Constructs a request resolver from a pure function. |
| `fromFunctionBatched` | `const` | Constructs a request resolver from a pure function that takes a list of requests and returns a list of results of the same size. Each item in the result list must correspond to ... |
| `grouped` | `const` | Transform a request resolver by grouping requests using the specified key function. |
| `isRequestResolver` | `const` | Returns `true` if the specified value is a `RequestResolver`, `false` otherwise. |
| `make` | `const` | Constructs a request resolver with the specified method to run requests. |
| `makeGrouped` | `const` | Constructs a request resolver with the requests grouped by a calculated key. |
| `makeWith` | `const` | Low-level constructor for creating a request resolver with fine-grained control over its behavior. |
| `never` | `const` | A request resolver that never executes requests. |
| `persisted` | `const` | No summary found in JSDoc. |
| `race` | `const` | Returns a new request resolver that executes requests by sending them to this request resolver and that request resolver, returning the results from the first data source to com... |
| `RequestResolver` | `interface` | The `RequestResolver<A, R>` interface requires an environment `R` and handles the execution of requests of type `A`. |
| `setDelay` | `const` | Sets the batch delay window for this request resolver to the specified duration. |
| `setDelayEffect` | `const` | Sets the batch delay effect for this request resolver. |
| `withCache` | `const` | Adds caching capabilities to a request resolver, allowing it to cache results up to a specified capacity. |
| `withSpan` | `const` | Add a tracing span to the request resolver, which will also add any span links from the request's. |
