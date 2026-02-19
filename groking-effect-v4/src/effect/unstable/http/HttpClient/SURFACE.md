# effect/unstable/http/HttpClient Surface

Total exports: 38

| Export | Kind | Overview |
|---|---|---|
| `catch` | `const` | No summary found in JSDoc. |
| `catchTag` | `const` | No summary found in JSDoc. |
| `catchTags` | `const` | No summary found in JSDoc. |
| `del` | `const` | No summary found in JSDoc. |
| `execute` | `const` | No summary found in JSDoc. |
| `filterOrElse` | `const` | Filters the result of a response, or runs an alternative effect if the predicate fails. |
| `filterOrFail` | `const` | Filters the result of a response, or throws an error if the predicate fails. |
| `filterStatus` | `const` | Filters responses by HTTP status code. |
| `filterStatusOk` | `const` | Filters responses that return a 2xx status code. |
| `followRedirects` | `const` | Follows HTTP redirects up to a specified number of times. |
| `get` | `const` | No summary found in JSDoc. |
| `head` | `const` | No summary found in JSDoc. |
| `HttpClient` | `interface` | No summary found in JSDoc. |
| `isHttpClient` | `const` | No summary found in JSDoc. |
| `layerMergedServices` | `const` | No summary found in JSDoc. |
| `make` | `const` | No summary found in JSDoc. |
| `makeWith` | `const` | No summary found in JSDoc. |
| `mapRequest` | `const` | Appends a transformation of the request object before sending it. |
| `mapRequestEffect` | `const` | Appends an effectful transformation of the request object before sending it. |
| `mapRequestInput` | `const` | Prepends a transformation of the request object before sending it. |
| `mapRequestInputEffect` | `const` | Prepends an effectful transformation of the request object before sending it. |
| `options` | `const` | No summary found in JSDoc. |
| `patch` | `const` | No summary found in JSDoc. |
| `post` | `const` | No summary found in JSDoc. |
| `put` | `const` | No summary found in JSDoc. |
| `retry` | `const` | Retries the request based on a provided schedule or policy. |
| `Retry` | `namespace` | No summary found in JSDoc. |
| `retryTransient` | `const` | Retries common transient errors, such as rate limiting, timeouts or network issues. |
| `SpanNameGenerator` | `const` | No summary found in JSDoc. |
| `tap` | `const` | Performs an additional effect after a successful request. |
| `tapError` | `const` | Performs an additional effect after an unsuccessful request. |
| `tapRequest` | `const` | Performs an additional effect on the request before sending it. |
| `TracerDisabledWhen` | `const` | No summary found in JSDoc. |
| `TracerPropagationEnabled` | `const` | No summary found in JSDoc. |
| `transform` | `const` | No summary found in JSDoc. |
| `transformResponse` | `const` | No summary found in JSDoc. |
| `withCookiesRef` | `const` | Associates a `Ref` of cookies with the client for handling cookies across requests. |
| `withScope` | `const` | Ties the lifetime of the `HttpClientRequest` to a `Scope`. |
