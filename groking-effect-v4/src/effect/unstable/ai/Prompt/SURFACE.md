# effect/unstable/ai/Prompt Surface

Total exports: 78

| Export | Kind | Overview |
|---|---|---|
| `appendSystem` | `const` | Creates a new prompt from the specified prompt with the provided text content appended to the end of existing system message content. |
| `assistantMessage` | `const` | Constructs a new assistant message. |
| `AssistantMessage` | `interface` | Message representing large language model assistant responses. |
| `AssistantMessageEncoded` | `interface` | Encoded representation of assistant messages for serialization. |
| `AssistantMessageOptions` | `interface` | Represents provider-specific options that can be associated with a `AssistantMessage` through module augmentation. |
| `AssistantMessagePart` | `type` | Union type of content parts allowed in assistant messages. |
| `AssistantMessagePartEncoded` | `type` | Union type of encoded content parts for assistant messages. |
| `BaseMessage` | `interface` | Base interface for all message types. |
| `BaseMessageEncoded` | `interface` | Base interface for encoded message types. |
| `BasePart` | `interface` | Base interface for all content parts. |
| `BasePartEncoded` | `interface` | Base interface for encoded content parts. |
| `concat` | `const` | Concatenates a prompt with additional raw input by concatenating messages. |
| `ContentFromString` | `const` | Schema for decoding message content (i.e. an array containing a single `TextPart`) from a string. |
| `empty` | `const` | An empty prompt with no messages. |
| `filePart` | `const` | Constructs a new file part. |
| `FilePart` | `interface` | Content part representing a file attachment. Files can be provided as base64 strings of data, byte arrays, or URLs. |
| `FilePartEncoded` | `interface` | Encoded representation of file parts for serialization. |
| `FilePartOptions` | `interface` | Represents provider-specific options that can be associated with a `FilePart` through module augmentation. |
| `fromMessages` | `const` | Creates a Prompt from an array of messages. |
| `fromResponseParts` | `const` | Creates a Prompt from the response parts of a previous interaction with a large language model. |
| `isMessage` | `const` | Type guard to check if a value is a Message. |
| `isPart` | `const` | Type guard to check if a value is a Part. |
| `isPrompt` | `const` | Type guard to check if a value is a Prompt. |
| `make` | `const` | Creates a Prompt from an input. |
| `makeMessage` | `const` | Creates a new message with the specified role. |
| `makePart` | `const` | Creates a new content part of the specified type. |
| `Message` | `type` | A type representing all possible message types in a conversation. |
| `MessageConstructorParams` | `type` | A utility type for specifying the parameters required to construct a specific message for a prompt. |
| `MessageEncoded` | `type` | A type representing all possible encoded message types for serialization. |
| `Part` | `type` | Union type representing all possible content parts within messages. |
| `PartConstructorParams` | `type` | A utility type for specifying the parameters required to construct a specific part of a prompt. |
| `PartEncoded` | `type` | Encoded representation of a Part. |
| `prependSystem` | `const` | Creates a new prompt from the specified prompt with the provided text content prepended to the start of existing system message content. |
| `Prompt` | `interface` | A Prompt contains a sequence of messages that form the context of a conversation with a large language model. |
| `PromptEncoded` | `interface` | Encoded representation of prompts for serialization. |
| `ProviderOptions` | `const` | Schema for provider-specific options which can be attached to both content parts and messages, enabling provider-specific behavior. |
| `RawInput` | `type` | Raw input types that can be converted into a Prompt. |
| `reasoningPart` | `const` | Constructs a new reasoning part. |
| `ReasoningPart` | `interface` | Content part representing reasoning or chain-of-thought. |
| `ReasoningPartEncoded` | `interface` | Encoded representation of reasoning parts for serialization. |
| `ReasoningPartOptions` | `interface` | Represents provider-specific options that can be associated with a `ReasoningPart` through module augmentation. |
| `setSystem` | `const` | Creates a new prompt from the specified prompt with the system message set to the specified text content. |
| `systemMessage` | `const` | Constructs a new system message. |
| `SystemMessage` | `interface` | Message representing system instructions or context. |
| `SystemMessageEncoded` | `interface` | Encoded representation of system messages for serialization. |
| `SystemMessageOptions` | `interface` | Represents provider-specific options that can be associated with a `SystemMessage` through module augmentation. |
| `textPart` | `const` | Constructs a new text part. |
| `TextPart` | `interface` | Content part representing plain text. |
| `TextPartEncoded` | `interface` | Encoded representation of text parts for serialization. |
| `TextPartOptions` | `interface` | Represents provider-specific options that can be associated with a `TextPart` through module augmentation. |
| `toolApprovalRequestPart` | `const` | Constructs a new tool approval request part. |
| `ToolApprovalRequestPart` | `interface` | Content part representing a tool approval request from the framework. |
| `ToolApprovalRequestPartEncoded` | `interface` | Encoded representation of tool approval request parts for serialization. |
| `ToolApprovalRequestPartOptions` | `interface` | Represents provider-specific options that can be associated with a `ToolApprovalRequestPart` through module augmentation. |
| `toolApprovalResponsePart` | `const` | Constructs a new tool approval response part. |
| `ToolApprovalResponsePart` | `interface` | Content part representing a user's response to a tool approval request. |
| `ToolApprovalResponsePartEncoded` | `interface` | Encoded representation of tool approval response parts for serialization. |
| `ToolApprovalResponsePartOptions` | `interface` | Represents provider-specific options that can be associated with a `ToolApprovalResponsePart` through module augmentation. |
| `toolCallPart` | `const` | Constructs a new tool call part. |
| `ToolCallPart` | `interface` | Content part representing a tool call request. |
| `ToolCallPartEncoded` | `interface` | Encoded representation of tool call parts for serialization. |
| `ToolCallPartOptions` | `interface` | Represents provider-specific options that can be associated with a `ToolCallPart` through module augmentation. |
| `toolMessage` | `const` | Constructs a new tool message. |
| `ToolMessage` | `interface` | Message representing tool execution results. |
| `ToolMessageEncoded` | `interface` | Encoded representation of tool messages for serialization. |
| `ToolMessageOptions` | `interface` | Represents provider-specific options that can be associated with a `ToolMessage` through module augmentation. |
| `ToolMessagePart` | `type` | Union type of content parts allowed in tool messages. |
| `ToolMessagePartEncoded` | `type` | Union type of encoded content parts for tool messages. |
| `toolResultPart` | `const` | Constructs a new tool result part. |
| `ToolResultPart` | `interface` | Content part representing the result of a tool call. |
| `ToolResultPartEncoded` | `interface` | Encoded representation of tool result parts for serialization. |
| `ToolResultPartOptions` | `interface` | Represents provider-specific options that can be associated with a `ToolResultPart` through module augmentation. |
| `userMessage` | `const` | Constructs a new user message. |
| `UserMessage` | `interface` | Message representing user input or questions. |
| `UserMessageEncoded` | `interface` | Encoded representation of user messages for serialization. |
| `UserMessageOptions` | `interface` | Represents provider-specific options that can be associated with a `UserMessage` through module augmentation. |
| `UserMessagePart` | `type` | Union type of content parts allowed in user messages. |
| `UserMessagePartEncoded` | `type` | Union type of encoded content parts for user messages. |
