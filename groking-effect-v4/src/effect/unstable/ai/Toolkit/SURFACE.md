# effect/unstable/ai/Toolkit Surface

Total exports: 14

| Export | Kind | Overview |
|---|---|---|
| `Any` | `interface` | Represents any `Toolkit` instance, used for generic constraints. |
| `empty` | `const` | An empty toolkit with no tools. |
| `HandlerContext` | `interface` | Context provided to tool handlers during execution. |
| `HandlersFrom` | `type` | A utility type that maps tool names to their required handler functions. |
| `make` | `const` | Creates a new toolkit from the specified tools. |
| `merge` | `const` | Merges multiple toolkits into a single toolkit. |
| `MergedTools` | `type` | A utility type which merges the tools from multiple toolkits into a single record. |
| `MergeRecords` | `type` | A utility type which merges a union of tool records into a single record. |
| `SimplifyRecord` | `type` | A utility type which flattens a record type for improved IDE display. |
| `Toolkit` | `interface` | Represents a collection of tools which can be used to enhance the capabilities of a large language model. |
| `Tools` | `type` | A utility type which can be used to extract the tool definitions from a toolkit. |
| `ToolsByName` | `type` | A utility type which transforms either a record or an array of tools into a record where keys are tool names and values are the tool instances. |
| `WithHandler` | `interface` | A toolkit instance with registered handlers ready for tool execution. |
| `WithHandlerTools` | `type` | A utility type which can be used to extract the tools from a toolkit with handlers. |
