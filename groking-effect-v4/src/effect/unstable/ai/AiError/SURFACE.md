# effect/unstable/ai/AiError Surface

Total exports: 28

| Export | Kind | Overview |
|---|---|---|
| `AiError` | `class` | Top-level AI error wrapper using the `reason` pattern. |
| `AiErrorEncoded` | `type` | The encoded (serialized) form of an `AiError`. |
| `AiErrorReason` | `type` | Union type of all semantic error reasons that can occur during AI operations. |
| `AuthenticationError` | `class` | Error indicating authentication or authorization failure. |
| `ContentPolicyError` | `class` | Error indicating content policy violation. |
| `HttpContext` | `const` | Combined HTTP context for error reporting. |
| `InternalProviderError` | `class` | Error indicating the AI provider experienced an internal error. |
| `InvalidOutputError` | `class` | Error indicating failure to parse or validate LLM output. |
| `InvalidRequestError` | `class` | Error indicating the request had invalid or malformed parameters. |
| `InvalidToolResultError` | `class` | Error indicating the tool handler returned an invalid result that does not match the tool's schema. |
| `InvalidUserInputError` | `class` | Error indicating the user provided invalid input in their prompt. |
| `isAiError` | `const` | Type guard to check if a value is an `AiError`. |
| `isAiErrorReason` | `const` | Type guard to check if a value is an `AiErrorReason`. |
| `make` | `const` | Creates an `AiError` with the given reason. |
| `NetworkError` | `class` | Error indicating a network-level failure before receiving a response. |
| `ProviderMetadata` | `const` | Schema for provider-specific metadata which can be attached to error reasons. |
| `QuotaExhaustedError` | `class` | Error indicating account or billing limits have been reached. |
| `RateLimitError` | `class` | Error indicating the request was rate limited. |
| `reasonFromHttpStatus` | `const` | Maps HTTP status codes to semantic error reasons. |
| `StructuredOutputError` | `class` | Error indicating the LLM generated text that does not conform to the requested structured output schema. |
| `ToolConfigurationError` | `class` | Error indicating a provider-defined tool was configured with invalid arguments. |
| `ToolkitRequiredError` | `class` | Error indicating an operation requires a toolkit but none was provided. |
| `ToolNotFoundError` | `class` | Error indicating the model requested a tool that doesn't exist in the toolkit. |
| `ToolParameterValidationError` | `class` | Error indicating the model's tool call parameters failed schema validation. |
| `ToolResultEncodingError` | `class` | Error indicating the tool result cannot be encoded for sending back to the model. |
| `UnknownError` | `class` | Catch-all error for unknown or unexpected errors. |
| `UnsupportedSchemaError` | `class` | Error indicating a codec transformer rejected a schema because it contains unsupported constructs. |
| `UsageInfo` | `const` | Token usage information from AI operations. |
