---
name: effect-ai-v4
description: Effect AI v4 patterns for language models, chat, tools, embeddings, providers, and MCP. Use when working with effect/unstable/ai, LanguageModel, Chat, Tool, Toolkit, Prompt, or any provider package in Effect v4. Triggers on effect/unstable/ai, LanguageModel.generateText, Chat.fromPrompt, Tool.make, Toolkit.make, AnthropicLanguageModel, OpenAiLanguageModel, GoogleLanguageModel, AmazonBedrockLanguageModel, OpenRouterLanguageModel, McpServer.
---

# Effect AI (v4 / effect-smol)

Core module: `effect/unstable/ai`. In the current `effect-smol` checkout, the provider packages present are `@effect/ai-anthropic`, `@effect/ai-openai`, `@effect/ai-openai-compat`, and `@effect/ai-openrouter`.

Source modules: `LanguageModel`, `Chat`, `Tool`, `Toolkit`, `Prompt`, `Response`, `Model`, `McpServer`, `McpSchema`, `AiError`, `Tokenizer`, `Telemetry`, `IdGenerator`.

## Imports

```ts
import { Effect, Layer, Ref, Schema, ServiceMap, Stream } from "effect";
import {
  AiError,
  Chat,
  LanguageModel,
  McpServer,
  Model,
  Prompt,
  Response,
  Tokenizer,
  Tool,
  Toolkit,
} from "effect/unstable/ai";
```

## LanguageModel

The core abstraction. A `ServiceMap.Service` with three operations.

```ts
export class LanguageModel extends ServiceMap.Service<LanguageModel, Service>()(
  "effect/unstable/ai/LanguageModel",
) {}
```

### Static accessors (primary consumer API)

```ts
LanguageModel.generateText(options);
// => Effect<GenerateTextResponse<Tools>, ExtractError<Options>, LanguageModel | ExtractServices<Options>>

LanguageModel.generateObject(options);
// => Effect<GenerateObjectResponse<Tools, A>, ExtractError<Options>, LanguageModel | ExtractServices<Options>>

LanguageModel.streamText(options);
// => Stream<Response.StreamPart<Tools>, ExtractError<Options>, LanguageModel | ExtractServices<Options>>
```

All three require `LanguageModel` in context, making it easy to swap models for testing.

### GenerateTextOptions

```ts
interface GenerateTextOptions<Tools extends Record<string, Tool.Any>> {
  readonly prompt: Prompt.RawInput
  readonly toolkit?: Toolkit.WithHandler<Tools> | Effect.Yieldable<..., Toolkit.WithHandler<Tools>, ...>
  readonly toolChoice?: ToolChoice<...>
  readonly concurrency?: Concurrency
  readonly disableToolCallResolution?: boolean
}
```

`prompt` accepts a string (becomes a user message), an array of messages, or a `Prompt` object.

### GenerateObjectOptions (extends GenerateTextOptions)

```ts
interface GenerateObjectOptions<Tools, A, I, R> extends GenerateTextOptions<Tools> {
  readonly objectName?: string;
  readonly schema: Schema.Schema<A, I, R>;
}
```

The model returns JSON text. Provider specific codec transformers adapt the schema first, then the framework decodes with `Schema.fromJsonString(schema)` and maps failures to `StructuredOutputError`.

### ToolChoice

```ts
type ToolChoice<Tools extends string> = "auto" | "none" | "required" | { readonly tool: Tools; } | {
  readonly mode?: "auto" | "required";
  readonly oneOf: ReadonlyArray<Tools>;
};
```

### GenerateTextResponse

```ts
class GenerateTextResponse<Tools> {
  readonly content: Array<Response.Part<Tools>>;
  get text(): string;
  get reasoning(): Array<Response.ReasoningPart>;
  get reasoningText(): string | undefined;
  get toolCalls(): Array<Response.ToolCallParts<Tools>>;
  get toolResults(): Array<Response.ToolResultParts<Tools>>;
  get finishReason(): Response.FinishReason;
  get usage(): Response.Usage;
}
```

### GenerateObjectResponse (extends GenerateTextResponse)

```ts
class GenerateObjectResponse<Tools, A> extends GenerateTextResponse<Tools> {
  readonly value: A;
}
```

## Tools

### `Tool.make`

```ts
const GetWeather = Tool.make("GetWeather", {
  description: "Fetches current weather for a location",
  parameters: Schema.Struct({ location: Schema.String }),
  success: Schema.Struct({ temperature: Schema.Number, condition: Schema.String }),
});
```

Options:

- `parameters` takes a schema such as `Schema.Struct({ ... })`
- `success` defaults to `Schema.Void`, `failure` defaults to `Schema.Never`
- `failureMode`: `"error"` (default) or `"return"`. `"error"` sends failures to the Effect error channel. `"return"` captures failures as tool results sent back to the model
- `dependencies`: array of `Context.Tag`s the tool handler requires
- `needsApproval`: `boolean | ((params, context) => boolean | Effect<boolean>)`. When true, a `ToolApprovalRequestPart` is emitted and execution waits for a `ToolApprovalResponsePart` in the next prompt turn

Chainable: `.addDependency()`, `.setSuccess()`, `.setFailure()`, `.setParameters()`, `.annotate()`, `.annotateMerge()`

### `Tool.dynamic` (JSON Schema parameters)

For MCP-style tools where parameters are raw JSON Schema instead of Effect Schema:

```ts
const SearchTool = Tool.dynamic("SearchTool", {
  parameters: {
    type: "object",
    properties: { query: { type: "string" }, limit: { type: "number" } },
  },
  success: Schema.Array(Schema.String),
});
```

The handler receives `unknown` and must cast:

```ts
toolkit.toLayer({
  SearchTool: (params: unknown) =>
    Effect.gen(function*() {
      const { query, limit } = params as { query: string; limit: number; };
      return Array.from({ length: limit }, (_, i) => `${query}-${i}`);
    }),
});
```

### `Tool.providerDefined`

For tools executed by the provider (web search, code execution, etc.):

```ts
const MyProviderTool = Tool.providerDefined({
  id: "provider.my_tool",
  customName: "MyProviderTool",
  providerName: "my_tool",
  args: Schema.Struct({ config: Schema.String }),
  requiresHandler: false,
});

const tool = MyProviderTool({ config: "value" });
```

When `requiresHandler: false` (default), the provider executes the tool and returns both tool-call and tool-result with `providerExecuted: true`. When `requiresHandler: true`, you must provide a handler.

### Tool annotations

```ts
Tool.Title; // display name
Tool.Readonly; // default: false
Tool.Destructive; // default: true
Tool.Idempotent; // default: false
Tool.OpenWorld; // default: true
Tool.Strict; // default: undefined (provider decides unless annotated)
```

## Toolkits

A `Toolkit` groups tools and resolves handlers from context. **Toolkit is `Effect.Yieldable`** (can be yielded in `Effect.gen`).

### Creating toolkits

```ts
const MyToolkit = Toolkit.make(GetWeather, ListFiles);
Toolkit.merge(ToolkitA, ToolkitB);
Toolkit.empty;
```

### Providing handlers

```ts
const HandlersLayer = MyToolkit.toLayer({
  GetWeather: (params) => Effect.succeed({ temperature: 72, condition: "sunny" }),
  ListFiles: (params) => Effect.succeed(["file1.txt", "file2.txt"]),
});
```

Handler signature: `(params, ctx) => Effect<Success, Failure, Requirements>`

The `ctx` parameter (second argument) provides `preliminary(result)` for streaming progress during tool execution:

```ts
MyToolkit.toLayer({
  LongRunningTool: Effect.fnUntraced(function*(params, ctx) {
    yield* ctx.preliminary({ status: "loading", progress: 50 });
    const result = yield* doWork(params);
    return { status: "complete", result };
  }),
});
```

`ctx.preliminary(result)` emits a `tool-result` part with `preliminary: true` to the stream. The final return value emits with `preliminary: false`.

### Using toolkits with LanguageModel

```ts
const response = yield * LanguageModel.generateText({
  prompt: "What's the weather in NYC?",
  toolkit: MyToolkit,
}).pipe(Effect.provide(HandlersLayer));
```

Tool calls are resolved automatically. Use `disableToolCallResolution: true` to get raw tool calls without execution.

## Chat

Stateful conversation sessions with history management. Uses a semaphore (permits=1) to serialize access.

```ts
export class Chat extends ServiceMap.Service<Chat, Service>()("effect/ai/Chat") {}
```

### Creating a chat

```ts
const chat = yield * Chat.empty;
const chat = yield * Chat.fromPrompt([{ role: "system", content: "You are a helpful assistant" }]);
const chat = yield * Chat.fromExport(data);
const chat = yield * Chat.fromJson(jsonString);
```

### Chat.Service

```ts
interface Service {
  readonly history: Ref.Ref<Prompt.Prompt>
  readonly export: Effect.Effect<unknown, AiError.AiError>
  readonly exportJson: Effect.Effect<string, AiError.AiError>
  readonly generateText: <...>(options) => Effect<GenerateTextResponse<Tools>, ..., LanguageModel | ...>
  readonly streamText: <...>(options) => Stream<Response.StreamPart<Tools>, ..., LanguageModel | ...>
  readonly generateObject: <...>(options) => Effect<GenerateObjectResponse<Tools, A>, ..., LanguageModel | R | ...>
}
```

Each call merges the new prompt with history, calls LanguageModel, then updates history with response parts.

### Chat persistence

```ts
import { Chat } from "effect/unstable/ai"

export class Persistence extends ServiceMap.Service<Persistence, Persistence.Service>()(
  "effect/ai/Chat/Persisted"
) {}

const PersistenceLayer = Chat.layerPersisted({ storeId: "chat" }).pipe(
  Layer.provide(Persistence.layerMemory)
)

const persistence = yield* Chat.Persistence
const chat = yield* persistence.getOrCreate("conversation-1")
const chat = yield* persistence.getOrCreate("conversation-1", { timeToLive: "30 days" })
const chat = yield* persistence.get("conversation-1")
//=> Effect<Chat.Persisted, ChatNotFoundError | PersistenceError>
```

`Chat.Persisted` extends `Chat.Service` with `id` and `save`.

## Prompt

### `Prompt.RawInput` (what `prompt` accepts everywhere)

```ts
type RawInput =
  | string // becomes user message with text part
  | Iterable<MessageEncoded> // array of messages
  | Prompt; // passed through
```

### Message types

```ts
type Message =
  | SystemMessage // { role: "system", content: string }
  | UserMessage // { role: "user", content: Array<TextPart | FilePart> }
  | AssistantMessage // { role: "assistant", content: Array<TextPart | FilePart | ReasoningPart | ToolCallPart | ToolResultPart | ToolApprovalRequestPart> }
  | ToolMessage; // { role: "tool", content: Array<ToolResultPart | ToolApprovalResponsePart> }
```

### Constructors and combinators

```ts
Prompt.empty;
Prompt.make("hello");
Prompt.make([{ role: "user", content: [{ type: "text", text: "hello" }] }]);

Prompt.concat(prompt, "follow up");
Prompt.setSystem(prompt, "You are a helpful assistant");
Prompt.prependSystem(prompt, "Important: ");
Prompt.appendSystem(prompt, "\nAdditional context");
Prompt.fromResponseParts(response.content);
```

## Response Parts

### Non-streaming: `Response.Part<Tools>`

```ts
type Part<Tools> =
  | TextPart
  | ReasoningPart
  | ToolCallParts<Tools>
  | ToolResultParts<Tools>
  | ToolApprovalRequestPart
  | FilePart
  | DocumentSourcePart
  | UrlSourcePart
  | ResponseMetadataPart
  | FinishPart;
```

### Streaming: `Response.StreamPart<Tools>`

```ts
type StreamPart<Tools> =
  | TextStartPart
  | TextDeltaPart
  | TextEndPart
  | ReasoningStartPart
  | ReasoningDeltaPart
  | ReasoningEndPart
  | ToolParamsStartPart
  | ToolParamsDeltaPart
  | ToolParamsEndPart
  | ToolCallParts<Tools>
  | ToolResultParts<Tools>
  | ToolApprovalRequestPart
  | FilePart
  | DocumentSourcePart
  | UrlSourcePart
  | ResponseMetadataPart
  | FinishPart
  | ErrorPart;
```

### FinishReason and Usage

```ts
type FinishReason =
  | "stop"
  | "length"
  | "content-filter"
  | "tool-calls"
  | "error"
  | "pause"
  | "other"
  | "unknown";

class Usage {
  inputTokens: { uncached: number; total: number; cacheRead: number; cacheWrite: number; };
  outputTokens: { total: number; text: number; reasoning: number; };
}
```

## Model

A `Model` wraps a `Layer` with provider and model names. **Model is both a Layer and Effect.Yieldable.** When used as a Layer, it provides `LanguageModel`, `ProviderName`, and `ModelName` directly. When yielded in `Effect.gen`, it lifts the layer's requirements into the effect context.

```ts
import { Model } from "effect/unstable/ai"

export class ProviderName extends ServiceMap.Service<ProviderName, string>()(
  "effect/unstable/ai/Model/ProviderName"
) {}

const SonnetModel = AnthropicLanguageModel.model("claude-sonnet-4-5-20250929")
//=> Model<"anthropic", LanguageModel, AnthropicClient>

Effect.provide(myEffect, SonnetModel)

const modelLayer = yield* SonnetModel
//=> Layer<LanguageModel | ProviderName | ModelName>
```

## Providers

All providers follow the same architecture:

1. **XxxClient**: HTTP client with auth, base URL, API methods
2. **XxxLanguageModel**: `LanguageModel` implementation with provider-specific `Config` and `withConfigOverride`

### Anthropic (`@effect/ai-anthropic`)

```ts
import { AnthropicClient, AnthropicLanguageModel, AnthropicTool } from "@effect/ai-anthropic";

AnthropicClient.layer({
  apiKey: Redacted.make("sk-..."),
  apiUrl: "https://api.anthropic.com",
});
// => Layer<AnthropicClient, never, HttpClient>

AnthropicLanguageModel.model("claude-sonnet-4-5-20250929");
// => Model<"anthropic", LanguageModel, AnthropicClient>

Tokenizer.make({
  tokenize: (input) => Effect.succeed([]),
});
// => Model<"anthropic", LanguageModel | Tokenizer, AnthropicClient>
```

Config overrides:

```ts
LanguageModel.generateText({ prompt: "..." }).pipe(
  AnthropicLanguageModel.withConfigOverride({
    temperature: 0.5,
    max_tokens: 8192,
    top_k: 40,
    disableParallelToolCalls: true,
    output_config: { effort: "high" },
  }),
);
```

Provider-specific features:

- Prompt caching via `options.anthropic.cacheControl` on messages/parts
- Extended thinking with `signature` metadata on reasoning parts
- Citations via `options.anthropic.citations` on file parts
- Default `max_tokens` comes from the selected model capabilities

Provider-defined tools include the current Anthropic tool set from the checked out package, including Bash, CodeExecution, ComputerUse, TextEditor, WebSearch, Memory, and search tools.

### OpenAI (`@effect/ai-openai`)

Uses the **Responses API** (`/responses`), not Chat Completions.

```ts
import { OpenAiClient, OpenAiLanguageModel, OpenAiTool } from "@effect/ai-openai";

OpenAiClient.layer({
  apiKey: Redacted.make("sk-..."),
  apiUrl: "https://api.openai.com/v1",
  organizationId: Redacted.make("org-..."),
});
// => Layer<OpenAiClient, never, HttpClient>

OpenAiLanguageModel.model("gpt-4o");
// => Model<"openai", LanguageModel, OpenAiClient>
```

Config overrides:

```ts
OpenAiLanguageModel.withConfigOverride({
  temperature: 0.7,
  max_output_tokens: 4096,
  reasoning: { effort: "high", summary: "detailed" },
  service_tier: "auto",
});
```

User tools sent with `strict: true` by default. Automatically uses `"developer"` role for system messages on `o*`, `gpt-5*`, `codex-*` models.

Provider-defined tools include OpenAI's current provider defined tool set from the checked out package. Do not assume this short list is exhaustive.

### OpenAI-Compat (`@effect/ai-openai-compat`)

Uses the **Chat Completions API** for compatibility with local LLMs, Azure OpenAI, and other OpenAI-compatible providers.

```ts
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai-compat";

OpenAiLanguageModel.model("gpt-4o-mini");
// => Model<"openai", LanguageModel, OpenAiClient>
```

Supports SSE streaming. Provider defined tool behavior depends on the compatible backend.

### Providers not present in this checkout

This `effect-smol` checkout does not currently include Google or Amazon Bedrock provider packages. Do not rely on those APIs unless the local source tree gains them.

### OpenRouter (`@effect/ai-openrouter`)

```ts
import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter";

OpenRouterClient.layer({
  apiKey: Redacted.make("sk-or-..."),
  referrer: "https://myapp.com",
  title: "My App",
});
// => Layer<OpenRouterClient, never, HttpClient>

OpenRouterLanguageModel.model("anthropic/claude-sonnet-4-5-20250929");
// => Model<"openrouter", LanguageModel, OpenRouterClient>
```

Uses Chat Completions API. Model is a plain string. Provider-defined tools NOT supported.

## Client Layer Patterns

Each provider client requires `HttpClient` in context. Use `Layer.unwrap` to build client layers from environment config:

```ts
const AnthropicLive = Layer.unwrap(
  Effect.map(EnvVars.ANTHROPIC_API_KEY, (apiKey) => AnthropicClient.layer({ apiKey })),
).pipe(Layer.provide(HttpContext));

const OpenAiLive = Layer.unwrap(
  Effect.map(EnvVars.OPENAI_API_KEY, (apiKey) => OpenAiClient.layer({ apiKey })),
).pipe(Layer.provide(HttpContext));
```

For rate limiting (requires scope):

```ts
const AnthropicLive = Layer.unwrapScoped(
  Effect.gen(function*() {
    const apiKey = yield* EnvVars.ANTHROPIC_API_KEY;
    const rl = yield* RateLimiter.make({ limit: 50, interval: "1 minute" });
    return AnthropicClient.layer({
      apiKey,
      transformClient: (client) => HttpClient.transform(client, (effect) => rl(effect)),
    });
  }),
).pipe(Layer.provide(HttpContext));
```

## AiError

v4 uses a reason pattern instead of v3's tagged error union. `AiError` wraps `{ module, method, reason: AiErrorReason }`.

### Error reasons (18 types)

| Reason                         | Retryable | When                                                                     |
| ------------------------------ | --------- | ------------------------------------------------------------------------ |
| `RateLimitError`               | Yes       | HTTP 429, rate limited                                                   |
| `QuotaExhaustedError`          | No        | Billing/quota exceeded                                                   |
| `AuthenticationError`          | No        | HTTP 401/403, invalid key or permissions                                 |
| `ContentPolicyError`           | No        | Content filter triggered                                                 |
| `InvalidRequestError`          | No        | HTTP 400, malformed request                                              |
| `InternalProviderError`        | Yes       | HTTP 500/502/503, provider internal error                                |
| `NetworkError`                 | Depends   | Transport errors are retryable. Invalid URL or encoding failures are not |
| `InvalidOutputError`           | Yes       | Output parsing failure                                                   |
| `StructuredOutputError`        | Yes       | Structured output (generateObject) parse failure                         |
| `UnsupportedSchemaError`       | No        | Schema not supported by provider                                         |
| `UnknownError`                 | No        | Catch-all                                                                |
| `ToolNotFoundError`            | Yes       | Model called a tool not in toolkit                                       |
| `ToolParameterValidationError` | Yes       | Tool params don't match schema                                           |
| `InvalidToolResultError`       | No        | Tool result doesn't match schema                                         |
| `ToolResultEncodingError`      | No        | Tool result encoding failure                                             |
| `ToolConfigurationError`       | No        | Tool misconfigured                                                       |
| `ToolkitRequiredError`         | No        | Tool call but no toolkit provided                                        |
| `InvalidUserInputError`        | No        | Bad user input                                                           |

### HTTP status mapping

```ts
AiError.reasonFromHttpStatus({ status, body, http, metadata });
// 400 -> InvalidRequestError
// 401 -> AuthenticationError (InvalidKey)
// 403 -> AuthenticationError (InsufficientPermissions)
// 429 -> RateLimitError
// any 5xx -> InternalProviderError
// other -> UnknownError
```

## McpServer

```ts
import { McpServer } from "effect/unstable/ai";

McpServer.layerStdio({ name: "My Server", version: "1.0.0" });
McpServer.layerHttp({ name: "My Server", version: "1.0.0", path: "/mcp" });
```

`layerStdio(...)` still requires a `Stdio` layer in context.

### Register tools from a Toolkit

```ts
yield * McpServer.registerToolkit(MyToolkit);
// => Effect<..., ..., Tool.HandlersFor<Tools> | ...>
```

Use `McpServer.toolkit(MyToolkit)` when you want the layer form.

### Resources (tagged template literals for URI templates)

```ts
const ReadmeResource = McpServer.resource`file://docs/${docId}`({
  name: "Documentation",
  completion: { docId: (_) => Effect.succeed(["readme", "changelog"]) },
  content: Effect.fn(function*(_uri, docId) {
    return `# ${docId}`;
  }),
});
```

### Prompts

```ts
const SummarizePrompt = McpServer.prompt({
  name: "Summarize",
  description: "Summarize a document",
  parameters: Schema.Struct({ text: Schema.String }),
  content: ({ text }) => Effect.succeed(`Please summarize:\n${text}`),
});
```

### Elicitation

```ts
McpServer.elicit({
  message: "Please confirm",
  schema: Schema.Struct({ confirmed: Schema.Boolean }),
});
// => Effect<{ confirmed: boolean }, ...>
```

### Layer composition

```ts
const ServerLayer = Layer.mergeAll(
  ReadmeResource,
  SummarizePrompt,
  McpServer.toolkit(MyToolkit),
).pipe(
  Layer.provide(McpServer.layerStdio({
    name: "My Server",
    version: "1.0.0",
  })),
  Layer.provide(HandlersLayer),
);

Layer.launch(ServerLayer).pipe(NodeRuntime.runMain);
```

## Tokenizer

```ts
export class Tokenizer extends ServiceMap.Service<Tokenizer, Service>()("effect/ai/Tokenizer") {}

interface Service {
  readonly tokenize: (input: Prompt.RawInput) => Effect<Array<number>, AiError.AiError>;
  readonly truncate: (
    input: Prompt.RawInput,
    tokens: number,
  ) => Effect<Prompt.Prompt, AiError.AiError>;
}
```

Core `Tokenizer` exists in `effect/unstable/ai`, but this checkout does not expose public `modelWithTokenizer` helpers from the provider packages.

## Key Differences from v3 (@effect/ai)

| v3 (@effect/ai)                                                     | v4 (effect/unstable/ai)                                                                      |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `import { LanguageModel } from "@effect/ai"`                        | `import { LanguageModel } from "effect/unstable/ai"`                                         |
| `Context.Tag` for services                                          | `ServiceMap.Service` for all services                                                        |
| `Layer.succeed(Tag, value)`                                         | `Layer.succeed(Tag)(value)` (curried)                                                        |
| `EmbeddingModel` in core                                            | No `EmbeddingModel` in v4 core                                                               |
| Tagged error union (`HttpRequestError \| HttpResponseError \| ...`) | Reason pattern (`AiError` wrapping `AiErrorReason`) with 18 types                            |
| `Persistence` from `@effect/ai`                                     | `Persistence` from `effect/unstable/persistence`                                             |
| No `Tool.dynamic`                                                   | `Tool.dynamic` for JSON Schema parameters                                                    |
| No `needsApproval` on tools                                         | `needsApproval` option with approval workflow                                                |
| No preliminary results                                              | Handler `ctx.preliminary(result)` for streaming progress                                     |
| `Usage { inputTokens?, outputTokens? }`                             | `Usage { inputTokens: { total, cacheRead, ... }, outputTokens: { total, text, reasoning } }` |
| No `@effect/ai-openai-compat`                                       | New `@effect/ai-openai-compat` for Chat Completions API                                      |
| `McpServer.toolkit(tk)`                                             | layer helper, while `McpServer.registerToolkit(tk)` returns an `Effect`                      |

## Key Types

| Type                                             | Purpose                                                     |
| ------------------------------------------------ | ----------------------------------------------------------- |
| `LanguageModel`                                  | Core service (ServiceMap.Service)                           |
| `LanguageModel.Service`                          | `generateText`, `generateObject`, `streamText` methods      |
| `LanguageModel.GenerateTextResponse<Tools>`      | Non-streaming response with `.text`, `.toolCalls`, `.usage` |
| `LanguageModel.GenerateObjectResponse<Tools, A>` | Extends text response with `.value: A`                      |
| `LanguageModel.ToolChoice<Tools>`                | Tool selection strategy                                     |
| `LanguageModel.ProviderOptions`                  | What providers/mocks receive                                |
| `Tool<Name, Config, Requirements>`               | Single tool definition                                      |
| `Toolkit<Tools>`                                 | Group of tools (Effect.Yieldable)                           |
| `Toolkit.WithHandler<Tools>`                     | Resolved toolkit with `.handle(name, params)`               |
| `Chat.Service`                                   | Stateful conversation with history                          |
| `Chat.Persistence`                               | Persistent chat storage (ServiceMap.Service)                |
| `Chat.Persisted`                                 | Chat with `id` and `save`                                   |
| `Chat.ChatNotFoundError`                         | Error for missing chats                                     |
| `Prompt.Prompt`                                  | Immutable message sequence                                  |
| `Prompt.RawInput`                                | `string \| Iterable<MessageEncoded> \| Prompt`              |
| `Response.Part<Tools>`                           | Non-streaming response part union                           |
| `Response.StreamPart<Tools>`                     | Streaming response part union                               |
| `Response.Usage`                                 | Token usage stats (structured)                              |
| `Response.FinishReason`                          | Why generation stopped                                      |
| `Model<Provider, Provides, Requires>`            | Layer + Effect.Yieldable wrapping a provider model          |
| `Model.ProviderName`                             | ServiceMap.Service for the provider string                  |
| `AiError.AiError`                                | Error with reason pattern                                   |
| `AiError.AiErrorReason`                          | Union of 18 reason types                                    |
| `Tokenizer`                                      | Tokenization service (ServiceMap.Service)                   |
| `McpServer`                                      | MCP server service                                          |

## Provider Summary

| Feature        | Anthropic         | OpenAI            | OpenAI-Compat      | OpenRouter       |
| -------------- | ----------------- | ----------------- | ------------------ | ---------------- |
| Package        | `ai-anthropic`    | `ai-openai`       | `ai-openai-compat` | `ai-openrouter`  |
| Auth           | `x-api-key`       | Bearer token      | Bearer token       | Bearer token     |
| API            | Messages          | Responses         | Chat Completions   | Chat Completions |
| Tokenizer      | Core service only | Core service only | No public helper   | No public helper |
| Provider tools | Many              | Many              | Varies             | None             |
| Caching        | `cacheControl`    | N/A               | N/A                | `cacheControl`   |
