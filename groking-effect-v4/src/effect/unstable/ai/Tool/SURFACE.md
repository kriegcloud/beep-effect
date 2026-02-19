# effect/unstable/ai/Tool Surface

Total exports: 53

| Export | Kind | Overview |
|---|---|---|
| `Any` | `interface` | A type which represents any `Tool`. |
| `AnyDynamic` | `interface` | A type which represents any dynamic `Tool`. |
| `AnyProviderDefined` | `interface` | A type which represents any provider-defined `Tool`. |
| `Destructive` | `const` | Annotation indicating whether a tool performs destructive operations. |
| `dynamic` | `const` | Creates a dynamic tool that can accept either an Effect Schema or a raw JSON Schema for its parameters. |
| `Dynamic` | `interface` | A dynamic tool is a tool where the schema may not be known at compile time. |
| `DynamicTypeId` | `const` | No summary found in JSDoc. |
| `Failure` | `type` | A utility type to extract the type of the tool call result when it fails. |
| `FailureEncoded` | `type` | A utility type to extract the encoded type of the tool call result when it fails. |
| `FailureMode` | `type` | The strategy used for handling errors returned from tool call handler execution. |
| `FailureResult` | `type` | A utility type for the actual failure value that can appear in tool results. When `failureMode` is `"return"`, this includes both user-defined failures and `AiError`. |
| `FailureResultEncoded` | `type` | The encoded version of `FailureResult`. |
| `getDescription` | `const` | Extracts the description from a tool's metadata. |
| `getJsonSchema` | `const` | Generates a JSON Schema for a tool. |
| `getJsonSchemaFromSchema` | `const` | No summary found in JSDoc. |
| `getStrictMode` | `const` | Returns the strict mode setting for a tool, or `undefined` if not set. |
| `Handler` | `interface` | Represents an `Tool` that has been implemented within the application. |
| `HandlerError` | `type` | A utility type which represents the possible errors that can be raised by a tool call's handler. |
| `HandlerOutput` | `type` | Tagged union for incremental handler output. |
| `HandlerResult` | `interface` | Represents the result of calling the handler for a particular `Tool`. |
| `HandlerServices` | `type` | A utility type to extract the requirements of a `Tool` call handler. |
| `HandlersFor` | `type` | A utility type to create a union of `Handler` types for all tools in a record. |
| `Idempotent` | `const` | Annotation indicating whether a tool can be called multiple times safely. |
| `isDynamic` | `const` | Type guard to check if a value is a dynamic tool. |
| `isProviderDefined` | `const` | Type guard to check if a value is a provider-defined tool. |
| `isUserDefined` | `const` | Type guard to check if a value is a user-defined tool. |
| `make` | `const` | Creates a user-defined tool with the specified name and configuration. |
| `Name` | `type` | A utility type to extract the `Name` type from an `Tool`. |
| `NameMapper` | `class` | A utility which allows mapping between a provider-defined name for a tool and the name given to the tool by the Effect AI SDK. |
| `NeedsApproval` | `type` | Specifies whether user approval is required before executing a tool. |
| `NeedsApprovalContext` | `interface` | Context provided to the `needsApproval` function when dynamically determining if a tool requires user approval. |
| `NeedsApprovalFunction` | `type` | Function type for dynamically determining if a tool requires approval. |
| `OpenWorld` | `const` | Annotation indicating whether a tool can handle arbitrary external data. |
| `Parameters` | `type` | A utility type to extract the type of the tool call parameters. |
| `ParametersEncoded` | `type` | A utility type to extract the encoded type of the tool call parameters. |
| `ParametersSchema` | `type` | A utility type to extract the schema for the parameters which an `Tool` must be called with. |
| `providerDefined` | `const` | Creates a provider-defined tool which leverages functionality built into a large language model provider (e.g. web search, code execution). |
| `ProviderDefined` | `interface` | A provider-defined tool is a tool which is built into a large language model provider (e.g. web search, code execution). |
| `ProviderDefinedTypeId` | `const` | No summary found in JSDoc. |
| `Readonly` | `const` | Annotation indicating whether a tool only reads data without making changes. |
| `RequiresHandler` | `type` | A utility type to determine if the specified tool requires a user-defined handler to be implemented. |
| `Result` | `type` | A utility type to extract the type of the tool call result whether it succeeds or fails. |
| `ResultDecodingServices` | `type` | A utility type to extract the requirements needed to decode the result of a `Tool` call. |
| `ResultEncoded` | `type` | A utility type to extract the encoded type of the tool call result whether it succeeds or fails. |
| `ResultEncodingServices` | `type` | A utility type to extract the requirements needed to encode the result of a `Tool` call. |
| `Strict` | `const` | Annotation controlling whether strict JSON schema mode is enabled for a tool. |
| `Success` | `type` | A utility type to extract the type of the tool call result when it succeeds. |
| `SuccessEncoded` | `type` | A utility type to extract the encoded type of the tool call result when it succeeds. |
| `SuccessSchema` | `type` | A utility type to extract the schema for the return type of a tool call when the tool call succeeds. |
| `Title` | `class` | Annotation for providing a human-readable title for tools. |
| `Tool` | `interface` | A user-defined tool that language models can call to perform actions. |
| `TypeId` | `const` | No summary found in JSDoc. |
| `unsafeSecureJsonParse` | `const` | **Unsafe**: This function will throw an error if an insecure property is found in the parsed JSON or if the provided JSON text is not parseable. |
