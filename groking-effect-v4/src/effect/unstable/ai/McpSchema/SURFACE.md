# effect/unstable/ai/McpSchema Surface

Total exports: 114

| Export | Kind | Overview |
|---|---|---|
| `Annotations` | `class` | Optional annotations for the client. The client can use annotations to inform how objects are used or displayed |
| `AudioContent` | `class` | Audio provided to or from an LLM. |
| `BlobResourceContents` | `class` | The contents of a binary resource, which can be represented as an Uint8Array |
| `CallTool` | `class` | Used by the client to invoke a tool provided by the server. |
| `CallToolResult` | `class` | The server's response to a tool call. |
| `CancelledNotification` | `class` | No summary found in JSDoc. |
| `ClientCapabilities` | `class` | Capabilities a client may support. Known capabilities are defined here, in this schema, but this is not a closed set: any client can define its own, additional capabilities. |
| `ClientFailureEncoded` | `type` | No summary found in JSDoc. |
| `ClientNotificationEncoded` | `type` | No summary found in JSDoc. |
| `ClientNotificationRpcs` | `class` | No summary found in JSDoc. |
| `ClientRequestEncoded` | `type` | No summary found in JSDoc. |
| `ClientRequestRpcs` | `class` | No summary found in JSDoc. |
| `ClientRpcs` | `class` | No summary found in JSDoc. |
| `ClientSuccessEncoded` | `type` | No summary found in JSDoc. |
| `Complete` | `class` | A request from the client to the server, to ask for completion options. |
| `CompleteResult` | `class` | The server's response to a completion/complete request |
| `ContentBlock` | `const` | No summary found in JSDoc. |
| `CreateMessage` | `class` | A request from the server to sample an LLM via the client. The client has full discretion over which model to select. The client should also inform the user before beginning sam... |
| `CreateMessageResult` | `class` | The client's response to a sampling/create_message request from the server. The client should inform the user before returning the sampled message, to allow them to inspect the ... |
| `Cursor` | `const` | An opaque token used to represent a cursor for pagination. |
| `Elicit` | `class` | No summary found in JSDoc. |
| `ElicitAcceptResult` | `class` | The client's response to an elicitation request |
| `ElicitationDeclined` | `class` | No summary found in JSDoc. |
| `ElicitDeclineResult` | `class` | The client's response to an elicitation request |
| `ElicitResult` | `const` | The client's response to an elicitation request |
| `EmbeddedResource` | `class` | The contents of a resource, embedded into a prompt or tool call result. |
| `FailureEncoded` | `type` | No summary found in JSDoc. |
| `FromClientEncoded` | `type` | No summary found in JSDoc. |
| `FromServerEncoded` | `type` | No summary found in JSDoc. |
| `GetPrompt` | `class` | Used by the client to get a prompt provided by the server. |
| `GetPromptResult` | `class` | The server's response to a prompts/get request from the client. |
| `ImageContent` | `class` | An image provided to or from an LLM. |
| `Implementation` | `class` | Describes the name and version of an MCP implementation. |
| `Initialize` | `class` | This request is sent from the client to the server when it first connects, asking it to begin initialization. |
| `InitializedNotification` | `class` | This notification is sent from the client to the server after initialization has finished. |
| `InitializeResult` | `class` | After receiving an initialize request from the client, the server sends this response. |
| `INTERNAL_ERROR_CODE` | `const` | No summary found in JSDoc. |
| `InternalError` | `class` | No summary found in JSDoc. |
| `INVALID_PARAMS_ERROR_CODE` | `const` | No summary found in JSDoc. |
| `INVALID_REQUEST_ERROR_CODE` | `const` | No summary found in JSDoc. |
| `InvalidParams` | `class` | No summary found in JSDoc. |
| `InvalidRequest` | `class` | No summary found in JSDoc. |
| `isParam` | `function` | No summary found in JSDoc. |
| `ListPrompts` | `class` | Sent from the client to request a list of prompts and prompt templates the server has. |
| `ListPromptsResult` | `class` | The server's response to a prompts/list request from the client. |
| `ListResources` | `class` | Sent from the client to request a list of resources the server has. |
| `ListResourcesResult` | `class` | The server's response to a resources/list request from the client. |
| `ListResourceTemplates` | `class` | Sent from the client to request a list of resource templates the server has. |
| `ListResourceTemplatesResult` | `class` | The server's response to a resources/templates/list request from the client. |
| `ListRoots` | `class` | Sent from the server to request a list of root URIs from the client. Roots allow servers to ask for specific directories or files to operate on. A common example for roots is pr... |
| `ListRootsResult` | `class` | The client's response to a roots/list request from the server. This result contains an array of Root objects, each representing a root directory or file that the server can oper... |
| `ListTools` | `class` | Sent from the client to request a list of tools the server has. |
| `ListToolsResult` | `class` | The server's response to a tools/list request from the client. |
| `LoggingLevel` | `const` | The severity of a log message. |
| `LoggingMessageNotification` | `class` | No summary found in JSDoc. |
| `McpError` | `class` | No summary found in JSDoc. |
| `McpServerClient` | `class` | No summary found in JSDoc. |
| `McpServerClientMiddleware` | `class` | No summary found in JSDoc. |
| `METHOD_NOT_FOUND_ERROR_CODE` | `const` | No summary found in JSDoc. |
| `MethodNotFound` | `class` | No summary found in JSDoc. |
| `ModelHint` | `class` | Hints to use for model selection. |
| `ModelPreferences` | `class` | The server's preferences for model selection, requested of the client during sampling. |
| `NotificationEncoded` | `type` | No summary found in JSDoc. |
| `NotificationMeta` | `class` | No summary found in JSDoc. |
| `optional` | `const` | No summary found in JSDoc. |
| `optionalWithDefault` | `interface` | No summary found in JSDoc. |
| `PaginatedRequestMeta` | `class` | No summary found in JSDoc. |
| `PaginatedResultMeta` | `class` | No summary found in JSDoc. |
| `param` | `function` | Helper to create a param for a resource URI template. |
| `Param` | `interface` | No summary found in JSDoc. |
| `PARSE_ERROR_CODE` | `const` | No summary found in JSDoc. |
| `ParseError` | `class` | No summary found in JSDoc. |
| `Ping` | `class` | A ping, issued by either the server or the client, to check that the other party is still alive. The receiver must promptly respond, or else may be disconnected. |
| `ProgressNotification` | `class` | An out-of-band notification used to inform the receiver of a progress update for a long-running request. |
| `ProgressToken` | `const` | A progress token, used to associate progress notifications with the original request. |
| `Prompt` | `class` | A prompt or prompt template that the server offers. |
| `PromptArgument` | `class` | Describes an argument that a prompt can accept. |
| `PromptListChangedNotification` | `class` | An optional notification from the server to the client, informing it that the list of prompts it offers has changed. This may be issued by servers without any previous subscript... |
| `PromptMessage` | `class` | Describes a message returned as part of a prompt. |
| `PromptReference` | `class` | Identifies a prompt. |
| `ReadResource` | `class` | Sent from the client to the server, to read a specific resource URI. |
| `ReadResourceResult` | `class` | The server's response to a resources/read request from the client. |
| `RequestEncoded` | `type` | No summary found in JSDoc. |
| `RequestId` | `const` | A uniquely identifying ID for a request in JSON-RPC. |
| `RequestMeta` | `class` | No summary found in JSDoc. |
| `Resource` | `class` | A known resource that the server is capable of reading. |
| `ResourceContents` | `class` | The contents of a specific resource or sub-resource. |
| `ResourceLink` | `class` | A resource that the server is capable of reading, included in a prompt or tool call result. |
| `ResourceListChangedNotification` | `class` | An optional notification from the server to the client, informing it that the list of resources it can read from has changed. This may be issued by servers without any previous ... |
| `ResourceReference` | `class` | A reference to a resource or resource template definition. |
| `ResourceTemplate` | `class` | A template description for resources available on the server. |
| `ResourceUpdatedNotification` | `class` | No summary found in JSDoc. |
| `ResultMeta` | `class` | No summary found in JSDoc. |
| `Role` | `const` | The sender or recipient of messages and data in a conversation. |
| `Root` | `class` | Represents a root directory or file that the server can operate on. |
| `RootsListChangedNotification` | `class` | A notification from the client to the server, informing it that the list of roots has changed. This notification should be sent whenever the client adds, removes, or modifies an... |
| `SamplingMessage` | `class` | Describes a message issued to or received from an LLM API. |
| `ServerCapabilities` | `class` | Capabilities that a server may support. Known capabilities are defined here, in this schema, but this is not a closed set: any server can define its own, additional capabilities. |
| `ServerFailureEncoded` | `type` | No summary found in JSDoc. |
| `ServerNotificationEncoded` | `type` | No summary found in JSDoc. |
| `ServerNotificationRpcs` | `class` | No summary found in JSDoc. |
| `ServerRequestEncoded` | `type` | No summary found in JSDoc. |
| `ServerRequestRpcs` | `class` | No summary found in JSDoc. |
| `ServerResultEncoded` | `type` | No summary found in JSDoc. |
| `ServerSuccessEncoded` | `type` | No summary found in JSDoc. |
| `SetLevel` | `class` | A request from the client to the server, to enable or adjust logging. |
| `Subscribe` | `class` | Sent from the client to request resources/updated notifications from the server whenever a particular resource changes. |
| `SuccessEncoded` | `type` | No summary found in JSDoc. |
| `TextContent` | `class` | Text provided to or from an LLM. |
| `TextResourceContents` | `class` | The contents of a text resource, which can be represented as a string. |
| `Tool` | `class` | Definition for a tool the client can call. |
| `ToolAnnotations` | `class` | Additional properties describing a Tool to clients. |
| `ToolListChangedNotification` | `class` | An optional notification from the server to the client, informing it that the list of tools it offers has changed. This may be issued by servers without any previous subscriptio... |
| `Unsubscribe` | `class` | Sent from the client to request cancellation of resources/updated notifications from the server. This should follow a previous resources/subscribe request. |
