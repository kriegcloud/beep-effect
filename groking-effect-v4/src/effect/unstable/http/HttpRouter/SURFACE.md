# effect/unstable/http/HttpRouter Surface

Total exports: 29

| Export | Kind | Overview |
|---|---|---|
| `add` | `const` | Create a layer that adds a single route to the HTTP router. |
| `addAll` | `const` | Create a layer that adds multiple routes to the HTTP router. |
| `cors` | `const` | A middleware that applies CORS headers to the HTTP response. |
| `disableLogger` | `const` | A middleware that disables the logger for some routes. |
| `GlobalProvided` | `type` | Services provided to global middleware. |
| `HttpRouter` | `interface` | No summary found in JSDoc. |
| `layer` | `const` | No summary found in JSDoc. |
| `make` | `const` | No summary found in JSDoc. |
| `middleware` | `const` | Create a middleware layer that can be used to modify requests and responses. |
| `Middleware` | `interface` | No summary found in JSDoc. |
| `params` | `const` | No summary found in JSDoc. |
| `PathInput` | `type` | No summary found in JSDoc. |
| `prefixPath` | `const` | No summary found in JSDoc. |
| `prefixRoute` | `const` | No summary found in JSDoc. |
| `Provided` | `type` | Services provided by the HTTP router, which are available in the request context. |
| `provideRequest` | `const` | Provides request-level dependencies to some routes. |
| `Request` | `interface` | Represents a request-level dependency, that needs to be provided by middleware. |
| `route` | `const` | No summary found in JSDoc. |
| `Route` | `interface` | No summary found in JSDoc. |
| `RouteContext` | `class` | No summary found in JSDoc. |
| `RouterConfig` | `const` | No summary found in JSDoc. |
| `schemaJson` | `const` | No summary found in JSDoc. |
| `schemaNoBody` | `const` | No summary found in JSDoc. |
| `schemaParams` | `const` | No summary found in JSDoc. |
| `schemaPathParams` | `const` | No summary found in JSDoc. |
| `serve` | `const` | Serves the provided application layer as an HTTP server. |
| `toHttpEffect` | `const` | No summary found in JSDoc. |
| `toWebHandler` | `const` | No summary found in JSDoc. |
| `use` | `const` | A helper function that is the equivalent of: |
