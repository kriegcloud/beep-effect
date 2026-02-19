# effect/unstable/httpapi/HttpApiEndpoint Surface

Total exports: 60

| Export | Kind | Overview |
|---|---|---|
| `AddError` | `type` | No summary found in JSDoc. |
| `AddMiddleware` | `type` | No summary found in JSDoc. |
| `AddPrefix` | `type` | No summary found in JSDoc. |
| `Any` | `interface` | No summary found in JSDoc. |
| `AnyWithProps` | `interface` | No summary found in JSDoc. |
| `ClientRequest` | `type` | No summary found in JSDoc. |
| `ClientServices` | `type` | No summary found in JSDoc. |
| `delete` | `const` | No summary found in JSDoc. |
| `Error` | `type` | No summary found in JSDoc. |
| `Errors` | `type` | No summary found in JSDoc. |
| `ErrorSchemaConstraint` | `type` | No summary found in JSDoc. |
| `ErrorServicesDecode` | `type` | No summary found in JSDoc. |
| `ErrorServicesEncode` | `type` | No summary found in JSDoc. |
| `ErrorsWithName` | `type` | No summary found in JSDoc. |
| `ExcludeName` | `type` | No summary found in JSDoc. |
| `ExcludeProvided` | `type` | No summary found in JSDoc. |
| `get` | `const` | No summary found in JSDoc. |
| `getErrorSchemas` | `function` | No summary found in JSDoc. |
| `getHeadersSchema` | `function` | No summary found in JSDoc. |
| `getParamsSchema` | `function` | No summary found in JSDoc. |
| `getPayloadSchemas` | `function` | No summary found in JSDoc. |
| `getQuerySchema` | `function` | No summary found in JSDoc. |
| `getSuccessSchemas` | `function` | No summary found in JSDoc. |
| `Handler` | `type` | No summary found in JSDoc. |
| `HandlerRaw` | `type` | No summary found in JSDoc. |
| `HandlerRawWithName` | `type` | No summary found in JSDoc. |
| `HandlerWithName` | `type` | No summary found in JSDoc. |
| `head` | `const` | No summary found in JSDoc. |
| `Headers` | `type` | No summary found in JSDoc. |
| `HeadersSchemaConstraint` | `type` | HTTP headers are string-valued (or missing). |
| `HttpApiEndpoint` | `interface` | Represents an API endpoint. An API endpoint is mapped to a single route on the underlying `HttpRouter`. |
| `isHttpApiEndpoint` | `const` | No summary found in JSDoc. |
| `make` | `const` | No summary found in JSDoc. |
| `Middleware` | `type` | No summary found in JSDoc. |
| `MiddlewareClient` | `type` | No summary found in JSDoc. |
| `MiddlewareError` | `type` | No summary found in JSDoc. |
| `MiddlewareProvides` | `type` | No summary found in JSDoc. |
| `MiddlewareServices` | `type` | No summary found in JSDoc. |
| `MiddlewareServicesWithName` | `type` | No summary found in JSDoc. |
| `MiddlewareWithName` | `type` | No summary found in JSDoc. |
| `Name` | `type` | No summary found in JSDoc. |
| `options` | `const` | No summary found in JSDoc. |
| `Params` | `type` | No summary found in JSDoc. |
| `ParamsConstraint` | `type` | Params come from the router as `string` (optional params as `undefined`) and must be encodable back into the URL path. |
| `patch` | `const` | No summary found in JSDoc. |
| `Payload` | `type` | No summary found in JSDoc. |
| `PayloadMap` | `type` | No summary found in JSDoc. |
| `PayloadSchemaConstraint` | `type` | Payload schema depends on the HTTP method: - for no-body methods, payload is modeled as query params, so each field must encode to `string \| ReadonlyArray<string> \| undefined` a... |
| `post` | `const` | No summary found in JSDoc. |
| `put` | `const` | No summary found in JSDoc. |
| `Query` | `type` | No summary found in JSDoc. |
| `QuerySchemaConstraint` | `type` | URL search params can be repeated, so fields may encode to `string` or `ReadonlyArray<string>` (or be missing). |
| `Request` | `type` | No summary found in JSDoc. |
| `RequestRaw` | `type` | No summary found in JSDoc. |
| `ServerServices` | `type` | No summary found in JSDoc. |
| `ServerServicesWithName` | `type` | No summary found in JSDoc. |
| `Success` | `type` | No summary found in JSDoc. |
| `SuccessSchemaConstraint` | `type` | No summary found in JSDoc. |
| `SuccessWithName` | `type` | No summary found in JSDoc. |
| `WithName` | `type` | No summary found in JSDoc. |
