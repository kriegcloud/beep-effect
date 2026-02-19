# effect/Layer Surface

Total exports: 47

| Export | Kind | Overview |
|---|---|---|
| `Any` | `interface` | A constraint interface for working with any Layer type. |
| `build` | `const` | Builds a layer into a scoped value. |
| `buildWithMemoMap` | `const` | Builds a layer into an `Effect` value, using the specified `MemoMap` to memoize the layer construction. |
| `buildWithScope` | `const` | Builds a layer into an `Effect` value. Any resources associated with this layer will be released when the specified scope is closed unless their scope has been extended. This al... |
| `catch` | `const` | No summary found in JSDoc. |
| `catchCause` | `const` | Recovers from all errors. |
| `catchTag` | `const` | Recovers from specific tagged errors. |
| `CurrentMemoMap` | `class` | A service reference for the current `MemoMap` used in layer construction. |
| `effect` | `const` | Constructs a layer from the specified scoped effect. |
| `effectDiscard` | `const` | Constructs a layer from the specified scoped effect. |
| `effectServices` | `const` | Constructs a layer from the specified scoped effect, which must return one or more services. |
| `empty` | `const` | A Layer that constructs an empty ServiceMap. |
| `Error` | `type` | Extracts the error type (E) from a Layer type. |
| `flatMap` | `const` | Constructs a layer dynamically based on the output of this layer. |
| `fresh` | `const` | Creates a fresh version of this layer that will not be shared. |
| `fromBuild` | `const` | Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer. |
| `fromBuildMemo` | `const` | Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer, with automatic memoization. |
| `isLayer` | `const` | Returns `true` if the specified value is a `Layer`, `false` otherwise. |
| `launch` | `const` | Builds this layer and uses it until it is interrupted. This is useful when your entire application is a layer, such as an HTTP server. |
| `Layer` | `interface` | A Layer describes how to build one or more services for dependency injection. |
| `makeMemoMap` | `const` | Constructs a `MemoMap` that can be used to build additional layers. |
| `makeMemoMapUnsafe` | `const` | Constructs a `MemoMap` that can be used to build additional layers. |
| `MemoMap` | `interface` | A MemoMap is used to memoize layer construction and ensure sharing of layers. |
| `merge` | `const` | Merges this layer with the specified layer concurrently, producing a new layer with combined input and output types. |
| `mergeAll` | `const` | Combines all the provided layers concurrently, creating a new layer with merged input, error, and output types. |
| `mock` | `const` | Creates a mock layer for testing purposes. You can provide a partial implementation of the service, and any methods not provided will throw an unimplemented defect when called. |
| `orDie` | `const` | Translates effect failure into death of the fiber, making all failures unchecked and not a part of the type of the layer. |
| `parentSpan` | `const` | Constructs a new `Layer` which takes an existing span and registers it as the current parent span. |
| `PartialEffectful` | `type` | A utility type for creating partial mocks of services in testing. |
| `provide` | `const` | Feeds the output services of this builder into the input of the specified builder, resulting in a new builder with the inputs of this builder as well as any leftover inputs, and... |
| `provideMerge` | `const` | Feeds the output services of this layer into the input of the specified layer, resulting in a new layer with the inputs of this layer, and the outputs of both layers. |
| `satisfiesErrorType` | `const` | Ensures that an layer's error type extends a given type `E`. |
| `satisfiesServicesType` | `const` | Ensures that an layer's requirements type extends a given type `R`. |
| `satisfiesSuccessType` | `const` | Ensures that an layer's success type extends a given type `ROut`. |
| `Services` | `type` | Extracts the service dependencies (RIn) from a Layer type. |
| `span` | `const` | Constructs a new `Layer` which creates a span and registers it as the current parent span. |
| `SpanOptions` | `interface` | Represents options that can be used to control the behavior of spans created for layers. |
| `succeed` | `const` | Constructs a layer from the specified value. |
| `succeedServices` | `const` | Constructs a layer from the specified value, which must return one or more services. |
| `Success` | `type` | Extracts the service output type (ROut) from a Layer type. |
| `sync` | `const` | Lazily constructs a layer from the specified value. |
| `syncServices` | `const` | Lazily constructs a layer from the specified value, which must return one or more services. |
| `unwrap` | `const` | Unwraps a Layer from an Effect, flattening the nested structure. |
| `updateService` | `const` | Updates a service in the context with a new implementation. |
| `Variance` | `interface` | The variance interface for Layer type parameters. |
| `withParentSpan` | `const` | Wraps a `Layer` with a new tracing span and sets the span as the parent span. |
| `withSpan` | `const` | Wraps a Layer with a new tracing span, making all operations in the layer constructor part of the named trace span. |
