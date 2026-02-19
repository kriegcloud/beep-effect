# effect/unstable/ai/LanguageModel Surface

Total exports: 19

| Export | Kind | Overview |
|---|---|---|
| `CodecTransformer` | `type` | A function that transforms a `Schema.Codec` into a provider-compatible form for structured output generation. |
| `ConstructorParams` | `interface` | Parameters required to construct a LanguageModel service. |
| `CurrentCodecTransformer` | `const` | A `ServiceMap.Reference` that holds the current `CodecTransformer` used by `LanguageModel.generateObject` to adapt structured output schemas for the active provider. |
| `defaultCodecTransformer` | `const` | The default codec transformer that passes schemas through without provider-specific rewrites. |
| `ExtractError` | `type` | Utility type that extracts the error type from LanguageModel options. |
| `ExtractServices` | `type` | Utility type that extracts the context requirements from LanguageModel options. |
| `generateObject` | `const` | Generate a structured object from a schema using a language model. |
| `GenerateObjectOptions` | `interface` | Configuration options for structured object generation. |
| `GenerateObjectResponse` | `class` | Response class for structured object generation operations. |
| `generateText` | `const` | Generate text using a language model. |
| `GenerateTextOptions` | `interface` | Configuration options for text generation. |
| `GenerateTextResponse` | `class` | Response class for text generation operations. |
| `getObjectName` | `const` | No summary found in JSDoc. |
| `LanguageModel` | `class` | The `LanguageModel` service key for dependency injection. |
| `make` | `const` | Creates a LanguageModel service from provider-specific implementations. |
| `ProviderOptions` | `interface` | Configuration options passed along to language model provider implementations. |
| `Service` | `interface` | The service interface for language model operations. |
| `streamText` | `const` | Generate text using a language model with streaming output. |
| `ToolChoice` | `type` | The tool choice mode for the language model. - `auto` (default): The model can decide whether or not to call tools, as well as which tools to call. - `required`: The model **mus... |
