---
name: effect-ai-testing-v4
description: Testing patterns for effect/unstable/ai with mock LanguageModel, tool call resolution, Chat persistence, streaming, and preliminary results. Use when writing tests for AI code, mocking LanguageModel, testing tool handlers, Chat persistence, or streaming responses in Effect v4. Triggers on effect/unstable/ai test files, withLanguageModel, LanguageModel mock, AI test, Chat.Persistence test, tool handler test.
---

# Effect AI Testing (v4 / effect-smol)

The shared AI tests in `effect-smol` usually mock at the `LanguageModel` service boundary. This exercises the real `LanguageModel.make` flow for shared prompt normalization, tool resolution, and response wrapping, but it does not replace provider specific adapter tests.

> **See also**: Load the `effect-ai-v4` skill for full AI API reference. Load the `effect-testing` skill for general Effect testing patterns.

## IMPORTANT: `withLanguageModel` Is NOT Exported

The test mock utility is internal to `effect` and not publicly exported. Copy it into your test directory:

```ts
import { dual, Effect, Predicate, Stream } from "effect";
import { LanguageModel, Prompt, Response, Tool } from "effect/unstable/ai";

interface WithLanguageModelOptions {
  readonly generateText?:
    | Array<Response.PartEncoded>
    | ((
      opts: LanguageModel.ProviderOptions,
    ) => Array<Response.PartEncoded> | Effect.Effect<Array<Response.PartEncoded>>);
  readonly streamText?:
    | Array<Response.StreamPartEncoded>
    | ((
      opts: LanguageModel.ProviderOptions,
    ) => Array<Response.StreamPartEncoded> | Stream.Stream<Response.StreamPartEncoded>);
}

export const withLanguageModel: {
  (
    options: WithLanguageModelOptions,
  ): <A, E, R>(
    effect: Effect.Effect<A, E, R>,
  ) => Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    options: WithLanguageModelOptions,
  ): Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
} = dual(
  2,
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: WithLanguageModelOptions) =>
    Effect.provideServiceEffect(
      effect,
      LanguageModel.LanguageModel,
      LanguageModel.make({
        generateText: (opts) => {
          if (Predicate.isUndefined(options.generateText)) return Effect.succeed([]);
          if (Array.isArray(options.generateText)) return Effect.succeed(options.generateText);
          const result = options.generateText(opts);
          return Effect.isEffect(result) ? result : Effect.succeed(result);
        },
        streamText: (opts) => {
          if (Predicate.isUndefined(options.streamText)) return Stream.empty;
          if (Array.isArray(options.streamText)) return Stream.fromIterable(options.streamText);
          const result = options.streamText(opts);
          return Array.isArray(result) ? Stream.fromIterable(result) : result;
        },
      }),
    ),
);
```

## `withLanguageModel` Usage

Three forms per method:

| Form           | generateText                           | streamText                            |
| -------------- | -------------------------------------- | ------------------------------------- |
| Static array   | `Array<Response.PartEncoded>`          | `Array<Response.StreamPartEncoded>`   |
| Sync callback  | `(opts) => Array<PartEncoded>`         | `(opts) => Array<StreamPartEncoded>`  |
| Async callback | `(opts) => Effect<Array<PartEncoded>>` | `(opts) => Stream<StreamPartEncoded>` |

When omitted, `generateText` defaults to `Effect.succeed([])` and `streamText` defaults to `Stream.empty`.

The callback receives `ProviderOptions`:

```ts
interface ProviderOptions {
  readonly prompt: Prompt.Prompt;
  readonly tools: ReadonlyArray<Tool.Any>;
  readonly responseFormat:
    | { readonly type: "text"; }
    | { readonly type: "json"; readonly objectName: string; readonly schema: Schema.Top; };
  readonly toolChoice: ToolChoice<any>;
  readonly span: Span;
}
```

## Basic generateText Mock

```ts
import { assert, it } from "@effect/vitest";
import { Effect } from "effect";
import { LanguageModel } from "effect/unstable/ai";
import { withLanguageModel } from "./utils.js";

it.effect("returns text response", () =>
  Effect.gen(function*() {
    const response = yield* LanguageModel.generateText({
      prompt: "Hello",
    }).pipe(
      withLanguageModel({
        generateText: [{ type: "text", text: "Hello back" }],
      }),
    );

    assert.strictEqual(response.text, "Hello back");
  }));
```

Mock data uses **encoded types** (`PartEncoded`, `StreamPartEncoded`). Field values like `params` are plain objects. The framework handles decoding internally.

## Inspecting What Was Sent to the Model

Use the callback form to inspect `ProviderOptions`:

```ts
it.effect("sends correct prompt and tools", () =>
  Effect.gen(function*() {
    let capturedOpts: LanguageModel.ProviderOptions | undefined;

    yield* LanguageModel.generateText({
      prompt: "Test",
      toolkit: MyToolkit,
    }).pipe(
      withLanguageModel({
        generateText: (opts) => {
          capturedOpts = opts;
          return [{ type: "text", text: "ok" }];
        },
      }),
      Effect.provide(HandlersLive),
    );

    assert.strictEqual(capturedOpts!.tools.length, 1);
    assert.strictEqual(capturedOpts!.tools[0].name, "MyTool");
  }));
```

## Tool Call Testing

Tests import the real tool definitions, toolkits, and handler layers from production code. The mock only controls what the "model" returns. Handler resolution runs through the real handler implementations.

### User-defined tool call resolution

```ts
it.effect("resolves tool calls via real handlers", () =>
  Effect.gen(function*() {
    const response = yield* LanguageModel.generateText({
      prompt: "Test",
      toolkit: MyToolkit,
    }).pipe(
      withLanguageModel({
        generateText: [{
          type: "tool-call",
          id: "tool-123",
          name: "MyTool",
          params: { input: "hello" },
        }],
      }),
      Effect.provide(HandlersLive),
    );

    assert.strictEqual(response.toolResults.length, 1);
    assert.strictEqual(response.toolResults[0].isFailure, false);
  }));
```

The mock returns a `tool-call` encoded part. The framework calls `toolkit.handle(name, params)` which decodes params, runs the real handler, encodes the result, and appends a `tool-result` part.

### Tool failure modes

**`failureMode: "error"` (default):** Handler failures propagate to the Effect error channel.

```ts
it.effect("propagates handler failure as Effect error", () =>
  Effect.gen(function*() {
    const error = yield* LanguageModel.generateText({
      prompt: "Test",
      toolkit: MyToolkit,
    }).pipe(
      withLanguageModel({
        generateText: [{
          type: "tool-call",
          id: "t1",
          name: "MyTool",
          params: { input: "triggers-failure" },
        }],
      }),
      Effect.provide(HandlersLive),
      Effect.flip,
    );

    assert.strictEqual(error._tag, "MyToolError");
  }));
```

**`failureMode: "return"`:** Handler failures are captured as tool results with `isFailure: true` and sent back to the model.

```ts
it.effect("captures handler failure as tool result", () =>
  Effect.gen(function*() {
    const response = yield* LanguageModel.generateText({
      prompt: "Test",
      toolkit: ReturnModeToolkit,
    }).pipe(
      withLanguageModel({
        generateText: [{
          type: "tool-call",
          id: "t1",
          name: "ReturnModeTool",
          params: { input: "triggers-failure" },
        }],
      }),
      Effect.provide(ReturnModeHandlersLive),
    );

    assert.strictEqual(response.toolResults[0].isFailure, true);
  }));
```

### Malformed tool parameters

When the model sends params that don't match the tool's schema, an error is raised regardless of failure mode. The error reason is `ToolParameterValidationError`:

```ts
it.effect("raises error on invalid params", () =>
  Effect.gen(function*() {
    const error = yield* LanguageModel.generateText({
      prompt: "Test",
      toolkit: MyToolkit,
    }).pipe(
      withLanguageModel({
        generateText: [{
          type: "tool-call",
          id: "t1",
          name: "MyTool",
          params: {},
        }],
      }),
      Effect.provide(HandlersLive),
      Effect.flip,
    );

    assert.strictEqual(error.reason._tag, "ToolParameterValidationError");
  }));
```

### Preliminary results (streaming tool progress)

Handler gets `ctx` with `preliminary(result)` that emits intermediate results to the stream:

```ts
it.effect("emits preliminary results during tool execution", () =>
  Effect.gen(function*() {
    const toolkit = Toolkit.make(IncrementalTool);
    const handlers = toolkit.toLayer({
      IncrementalTool: Effect.fnUntraced(function*(_, ctx) {
        yield* ctx.preliminary({ status: "loading", progress: 50 });
        return { status: "complete" };
      }),
    });

    const response = yield* LanguageModel.streamText({
      prompt: "Test",
      toolkit,
    }).pipe(
      Stream.runCollect,
      withLanguageModel({
        streamText: [{
          type: "tool-call",
          id: "tool-123",
          name: "IncrementalTool",
          params: { input: "test" },
        }],
      }),
      Effect.provide(handlers),
    );

    // response contains: tool-call, preliminary tool-result (preliminary: true), final tool-result (preliminary: false)
  }));
```

### Tool.dynamic testing (JSON Schema parameters)

Handler receives `unknown` params:

```ts
it.effect("passes parameters as unknown with JSON Schema", () =>
  Effect.gen(function*() {
    const SearchTool = Tool.dynamic("SearchTool", {
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
      },
      success: Schema.Array(Schema.String),
    });
    const toolkit = Toolkit.make(SearchTool);
    const handlers = toolkit.toLayer({
      SearchTool: (params: unknown) => {
        const { query } = params as { query: string; };
        return Effect.succeed([`result for ${query}`]);
      },
    });

    const response = yield* LanguageModel.generateText({
      prompt: "Search",
      toolkit,
    }).pipe(
      withLanguageModel({
        generateText: [{
          type: "tool-call",
          id: "t1",
          name: "SearchTool",
          params: { query: "hello" },
        }],
      }),
      Effect.provide(handlers),
    );

    assert.strictEqual(response.toolResults.length, 1);
  }));
```

## Provider-Defined Tool Testing

### `providerExecuted` flag semantics

- `providerExecuted: true`: The provider already executed the tool. The framework skips handler resolution. Mock must return BOTH `tool-call` AND `tool-result` parts.
- `providerExecuted: false`: The framework resolves via a user-provided handler.

### No handler required (`requiresHandler: false`, default)

```ts
it.effect("passes through provider-executed results", () =>
  Effect.gen(function*() {
    const response = yield* LanguageModel.generateText({
      prompt: "Search for Effect",
      toolkit: ToolkitWithSearch,
    }).pipe(
      withLanguageModel({
        generateText: [
          {
            type: "tool-call",
            id: "t1",
            name: SearchToolName,
            providerName: SearchProviderName,
            providerExecuted: true,
            params: {},
          },
          {
            type: "tool-result",
            id: "t1",
            name: SearchToolName,
            isFailure: false,
            result: { url: "https://effect.website" },
            providerName: SearchProviderName,
            providerExecuted: true,
          },
        ],
      }),
    );

    assert.strictEqual(response.toolResults.length, 1);
    assert.strictEqual(response.toolResults[0].isFailure, false);
  }));
```

### Handler required (`requiresHandler: true`)

```ts
it.effect("resolves via real handler", () =>
  Effect.gen(function*() {
    const response = yield* LanguageModel.generateText({
      prompt: "Test",
      toolkit: CustomProviderToolkit,
    }).pipe(
      withLanguageModel({
        generateText: [{
          type: "tool-call",
          id: "t1",
          name: "CustomTool",
          providerName: "custom",
          providerExecuted: false,
          params: { query: "hello" },
        }],
      }),
      Effect.provide(CustomHandlersLive),
    );

    assert.strictEqual(response.toolResults.length, 1);
  }));
```

## Streaming Tests

### Fork + Latch + TestClock pattern

Stream processing must be forked. Use a latch for synchronization and TestClock to control time-dependent handlers:

```ts
it.effect("emits tool calls before handler completes", () =>
  Effect.gen(function*() {
    const parts: Array<Response.StreamPart<Toolkit.Tools<typeof MyToolkit>>> = [];
    const latch = yield* Effect.makeLatch();

    yield* LanguageModel.streamText({
      prompt: [],
      toolkit: MyToolkit,
    }).pipe(
      Stream.runForEach((part) =>
        Effect.andThen(
          latch.open,
          Effect.sync(() => {
            parts.push(part);
          }),
        )
      ),
      withLanguageModel({
        streamText: [{
          type: "tool-call",
          id: "t1",
          name: "MyTool",
          params: { input: "test" },
        }],
      }),
      Effect.provide(HandlersLive),
      Effect.forkScoped,
    );

    yield* latch.await;
    assert.strictEqual(parts.length, 1);
    assert.strictEqual(parts[0].type, "tool-call");

    yield* TestClock.adjust("10 seconds");
    assert.strictEqual(parts.length, 2);
    assert.strictEqual(parts[1].type, "tool-result");
  }));
```

The latch opens when the first part arrives. After `latch.await`, the tool-call has been emitted but the handler hasn't completed. `TestClock.adjust` advances virtual time, triggering handler completion.

### Text streaming deltas

```ts
it.effect("streams text deltas", () =>
  Effect.gen(function*() {
    const parts: Array<Response.StreamPart<{}>> = [];

    yield* LanguageModel.streamText({ prompt: "Hello" }).pipe(
      Stream.runForEach((part) =>
        Effect.sync(() => {
          parts.push(part);
        })
      ),
      withLanguageModel({
        streamText: [
          { type: "text-start", id: "1" },
          { type: "text-delta", id: "1", delta: "Hello" },
          { type: "text-delta", id: "1", delta: ", World!" },
          { type: "text-end", id: "1" },
        ],
      }),
    );

    assert.strictEqual(parts.length, 4);
    assert.strictEqual(parts[1].type, "text-delta");
  }));
```

## Chat Persistence Testing

Chat persistence tests in `effect-smol` use plain `it` with explicit `Effect.runPromise(...)` style execution. Use `it.effect` when the test body itself is Effectful.

### Setup

```ts
import { Chat, IdGenerator, Prompt } from "effect/unstable/ai";
import * as Persistence from "effect/unstable/persistence";

const withConstantIdGenerator = (id: string) =>
  Effect.provideService(IdGenerator.IdGenerator, {
    generateId: () => Effect.succeed(id),
  });

const PersistenceLayer = Layer.provideMerge(
  Chat.layerPersisted({ storeId: "chat" }),
  Persistence.layerMemory,
);
```

`Persistence.layerMemory` provides an in-memory backing store. `withConstantIdGenerator` makes message IDs deterministic.

### Test: Chat history is persisted

```ts
it("persists chat history", async () =>
  await Effect.gen(function*() {
    const backing = yield* Persistence.BackingPersistence;
    const persistence = yield* Chat.Persistence;
    const store = yield* backing.make("chat");
    const chat = yield* persistence.getOrCreate("conv-1");

    yield* chat.generateText({ prompt: "hello" }).pipe(
      withLanguageModel({
        generateText: [{ type: "text", text: "hi there" }],
      }),
    );

    const chatHistory = yield* Ref.get(chat.history);
    const encoded = yield* store.get("conv-1");
    const storeHistory = encoded === undefined
      ? undefined
      : yield* Schema.decodeUnknownEffect(Prompt.Prompt)(encoded);

    assert.deepStrictEqual(chatHistory, storeHistory);
  }).pipe(withConstantIdGenerator("msg_001"), Effect.provide(PersistenceLayer)).pipe(
    Effect.runPromise,
  ));
```

### Test: TTL expiration with TestClock

```ts
it("expires after timeToLive", async () =>
  await Effect.gen(function*() {
    const backing = yield* Persistence.BackingPersistence;
    const persistence = yield* Chat.Persistence;
    const store = yield* backing.make("chat");
    const chat = yield* persistence.getOrCreate("conv-1", {
      timeToLive: "30 days",
    });

    yield* chat.generateText({ prompt: "hello" }).pipe(
      withLanguageModel({
        generateText: [{ type: "text", text: "hi" }],
      }),
    );

    const before = yield* store.get("conv-1");
    assert.isDefined(before);

    yield* TestClock.adjust("30 days");

    const after = yield* store.get("conv-1");
    assert.isUndefined(after);
  }).pipe(withConstantIdGenerator("msg_001"), Effect.provide(PersistenceLayer)).pipe(
    Effect.runPromise,
  ));
```

### Test: ChatNotFoundError

```ts
it("raises ChatNotFoundError for missing chat", async () =>
  await Effect.gen(function*() {
    const persistence = yield* Chat.Persistence;

    const error = yield* persistence.get("nonexistent").pipe(Effect.flip);

    assert.instanceOf(error, Chat.ChatNotFoundError);
    assert.strictEqual(error.chatId, "nonexistent");
  }).pipe(Effect.provide(PersistenceLayer)).pipe(Effect.runPromise));
```

## Prompt Testing (Pure, No Effect)

Prompt tests are pure data tests. No `it.effect`, no mock, no layers.

```ts
import { Prompt, Response } from "effect/unstable/ai";

it("reconstructs streaming deltas into messages", () => {
  const parts = [
    Response.makePart("text-start", { id: "1" }),
    Response.makePart("text-delta", { id: "1", delta: "Hello" }),
    Response.makePart("text-delta", { id: "1", delta: ", World!" }),
    Response.makePart("text-end", { id: "1" }),
  ];
  const prompt = Prompt.fromResponseParts(parts);
  const expected = Prompt.make([{
    role: "assistant",
    content: [{ type: "text", text: "Hello, World!" }],
  }]);
  assert.deepStrictEqual(prompt, expected);
});
```

## Mocking Tokenizer

```ts
import { Prompt, Tokenizer } from "effect/unstable/ai";

const mockTokenizer = Effect.provideService(
  Tokenizer.Tokenizer,
  Tokenizer.make({
    tokenize: (content) => Effect.succeed([1, 2, 3]),
  }),
);
```

`Tokenizer.make` builds `truncate` automatically from `tokenize`.

## `Response.makePart` for Expected Values

Use `Response.makePart` to construct expected parts for exact assertions:

```ts
Response.makePart("text", { text: "hello" })
Response.makePart("tool-call", { id: "t1", name: "MyTool", params: { input: "test" }, providerExecuted: false })
Response.makePart("tool-result", { id: "t1", name: "MyTool", isFailure: false, result: { ... }, encodedResult: { ... }, providerExecuted: false, preliminary: false })
```

For most tests, prefer asserting on specific fields (`response.toolResults[0].isFailure`, `response.text`, `response.finishReason`) instead of constructing full expected parts.

## Layer Composition Patterns

### Standard test pipe chain

```ts
Effect.gen(function*() { ... }).pipe(
  withLanguageModel({ ... }),               // provides mock LanguageModel
  Effect.provide(HandlersLive),              // provides real tool handlers
)
```

`withLanguageModel` is always between `Effect.gen` and `Effect.provide` in the pipe chain.

### Scoped tests with persistence

```ts
Effect.gen(function*() { ... }).pipe(
  withConstantIdGenerator("msg_001"),        // deterministic IDs
  Effect.provide(PersistenceLayer),          // provides Chat.Persistence
)
```

### Combining multiple concerns

```ts
Effect.gen(function*() { ... }).pipe(
  withLanguageModel({ ... }),
  Effect.provide(HandlersLive),
  withConstantIdGenerator("msg_001"),
  Effect.provide(PersistenceLayer),
)
```

## `it.effect` vs plain `it`

- `it.effect`: No Scope requirement. Use for LanguageModel and Tool tests.
- Plain `it`: Use for pure Prompt data tests or for persistence tests that explicitly call `Effect.runPromise(...)`.
