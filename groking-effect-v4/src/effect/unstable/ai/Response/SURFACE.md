# effect/unstable/ai/Response Surface

Total exports: 86

| Export | Kind | Overview |
|---|---|---|
| `AllParts` | `type` | Union type for all response parts with tool-specific typing. |
| `AllPartsEncoded` | `type` | Encoded representation of all response parts for serialization. |
| `AnyPart` | `type` | Union type representing all possible response content parts. |
| `AnyPartEncoded` | `type` | Encoded representation of all possible response content parts for serialization. |
| `BasePart` | `interface` | Base interface for all response content parts. |
| `BasePartEncoded` | `interface` | Base interface for encoded response content parts. |
| `BaseToolResult` | `interface` | The base fields of a tool result part. |
| `ConstructorParams` | `type` | A utility type for specifying the parameters required to construct a specific response part. |
| `DocumentSourcePart` | `interface` | Response part representing a document source reference. |
| `DocumentSourcePartEncoded` | `interface` | Encoded representation of document source parts for serialization. |
| `DocumentSourcePartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `DocumentSourcePart` through module augmentation. |
| `ErrorPart` | `interface` | Response part indicating that an error occurred generating the response. |
| `ErrorPartEncoded` | `interface` | Encoded representation of error parts for serialization. |
| `ErrorPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ErrorPart` through module augmentation. |
| `FilePart` | `interface` | Response part representing a file attachment. |
| `FilePartEncoded` | `interface` | Encoded representation of file parts for serialization. |
| `FilePartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `FilePart` through module augmentation. |
| `FinishPart` | `interface` | Response part indicating the completion of a response generation. |
| `FinishPartEncoded` | `interface` | Encoded representation of finish parts for serialization. |
| `FinishPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `FinishPart` through module augmentation. |
| `FinishReason` | `const` | Represents the reason why a model finished generation of a response. |
| `HttpRequestDetails` | `const` | Schema for HTTP request details associated with an AI response. |
| `HttpResponseDetails` | `const` | Schema for HTTP response details associated with an AI response. |
| `isPart` | `const` | Type guard to check if a value is a Response Part. |
| `makePart` | `const` | Creates a new response content part of the specified type. |
| `Part` | `type` | A type for representing non-streaming response parts with tool-specific typing. |
| `PartEncoded` | `type` | Encoded representation of non-streaming response parts for serialization. |
| `ProviderMetadata` | `const` | Schema for provider-specific metadata which can be attached to response parts. |
| `ReasoningDeltaPart` | `interface` | Response part containing incremental reasoning content to be added to the existing chunk of reasoning text with the same unique identifier. |
| `ReasoningDeltaPartEncoded` | `interface` | Encoded representation of reasoning delta parts for serialization. |
| `ReasoningDeltaPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ReasoningDeltaPart` through module augmentation. |
| `ReasoningEndPart` | `interface` | Response part indicating the end of streaming reasoning content. |
| `ReasoningEndPartEncoded` | `interface` | Encoded representation of reasoning end parts for serialization. |
| `ReasoningEndPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ReasoningEndPart` through module augmentation. |
| `ReasoningPart` | `interface` | Response part representing reasoning or chain-of-thought content. |
| `ReasoningPartEncoded` | `interface` | Encoded representation of reasoning parts for serialization. |
| `ReasoningPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ReasoningPart` through module augmentation. |
| `ReasoningStartPart` | `interface` | Response part indicating the start of streaming reasoning content. |
| `ReasoningStartPartEncoded` | `interface` | Encoded representation of reasoning start parts for serialization. |
| `ReasoningStartPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ReasoningStartPart` through module augmentation. |
| `ResponseMetadataPart` | `interface` | Response part containing metadata about the large language model response. |
| `ResponseMetadataPartEncoded` | `interface` | Encoded representation of response metadata parts for serialization. |
| `ResponseMetadataPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ResponseMetadataPart` through module augmentation. |
| `StreamPart` | `type` | A type for representing streaming response parts with tool-specific typing. |
| `StreamPartEncoded` | `type` | Encoded representation of streaming response parts for serialization. |
| `TextDeltaPart` | `interface` | Response part containing incremental text content to be added to the existing text chunk with the same unique identifier. |
| `TextDeltaPartEncoded` | `interface` | Encoded representation of text delta parts for serialization. |
| `TextDeltaPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `TextDeltaPart` through module augmentation. |
| `TextEndPart` | `interface` | Response part indicating the end of streaming text content. |
| `TextEndPartEncoded` | `interface` | Encoded representation of text end parts for serialization. |
| `TextEndPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `TextEndPart` through module augmentation. |
| `TextPart` | `interface` | Response part representing plain text content. |
| `TextPartEncoded` | `interface` | Encoded representation of text parts for serialization. |
| `TextPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `TextPart` through module augmentation. |
| `TextStartPart` | `interface` | Response part indicating the start of streaming text content. |
| `TextStartPartEncoded` | `interface` | Encoded representation of text start parts for serialization. |
| `TextStartPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `TextStartPart` through module augmentation. |
| `toolApprovalRequestPart` | `const` | Constructs a new tool approval request part. |
| `ToolApprovalRequestPart` | `interface` | Response part representing a tool approval request. |
| `ToolApprovalRequestPartEncoded` | `interface` | Encoded representation of tool approval request parts for serialization. |
| `ToolApprovalRequestPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ToolApprovalRequestPart` through module augmentation. |
| `toolCallPart` | `const` | Constructs a new tool call part. |
| `ToolCallPart` | `interface` | Response part representing a tool call request. |
| `ToolCallPartEncoded` | `interface` | Encoded representation of tool call parts for serialization. |
| `ToolCallPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ToolCallPart` through module augmentation. |
| `ToolCallParts` | `type` | Utility type that extracts tool call parts from a set of tools. |
| `ToolParamsDeltaPart` | `interface` | Response part containing incremental tool parameter content. |
| `ToolParamsDeltaPartEncoded` | `interface` | Encoded representation of tool params delta parts for serialization. |
| `ToolParamsDeltaPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ToolParamsDeltaPart` through module augmentation. |
| `ToolParamsEndPart` | `interface` | Response part indicating the end of streaming tool parameters. |
| `ToolParamsEndPartEncoded` | `interface` | Encoded representation of tool params end parts for serialization. |
| `ToolParamsEndPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ToolParamsEndPart` through module augmentation. |
| `ToolParamsStartPart` | `interface` | Response part indicating the start of streaming tool parameters. |
| `ToolParamsStartPartEncoded` | `interface` | Encoded representation of tool params start parts for serialization. |
| `ToolParamsStartPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ToolParamsStartPart` through module augmentation. |
| `ToolResultFailure` | `interface` | Represents a failed tool call result. |
| `toolResultPart` | `const` | Constructs a new tool result part. |
| `ToolResultPart` | `type` | Response part representing the result of a tool call. |
| `ToolResultPartEncoded` | `interface` | Encoded representation of tool result parts for serialization. |
| `ToolResultPartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `ToolResultPart` through module augmentation. |
| `ToolResultParts` | `type` | Utility type that extracts tool result parts from a set of tools. |
| `ToolResultSuccess` | `interface` | Represents a successful tool call result. |
| `UrlSourcePart` | `interface` | Response part representing a URL source reference. |
| `UrlSourcePartEncoded` | `interface` | Encoded representation of URL source parts for serialization. |
| `UrlSourcePartMetadata` | `interface` | Represents provider-specific metadata that can be associated with a `UrlSourcePart` through module augmentation. |
| `Usage` | `class` | Represents usage information for a request to a large language model provider. |
