# Handoff P3: Chat API Route

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,700 | OK |
| Episodic | 1,000 | ~500 | OK |
| Semantic | 500 | ~400 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 3 Goal
Implement the streaming chat API route at `/api/chat` using Effect v4's `LanguageModel.streamText` with the `KnowledgeGraphToolkit` from P2 and OpenAI as the model provider. Response is an SSE stream of text tokens, tool calls/results, and graph snippets.

### Deliverables
1. `apps/web/src/app/api/chat/route.ts` — Chat handler via toWebHandler
2. `apps/web/src/lib/effect/chat-handler.ts` — Chat logic (prompt construction, tool-calling, response formatting)
3. Tests: 5+ regression tests for canonical queries and failure modes

### Success Criteria
- [ ] `POST /api/chat` accepts `{ messages }` and returns SSE stream of `{ text, tool-call, tool-result, graph-snippet, done }` events
- [ ] Grounded answers: "How do I create a tagged service?" -> mentions ServiceMap.Service
- [ ] Hallucination rejection: Does NOT suggest Context.GenericTag, Effect.catchAll, @effect/platform
- [ ] Tool calls transparently query Graphiti API and include results in response
- [ ] Optional `graphSnippet` returns nodes/links relevant to the answer (for UI highlighting)
- [ ] Auth required (401 for unauthenticated requests via better-auth session check)
- [ ] Request body validated via Schema
- [ ] Max tool iterations capped at 3 rounds
- [ ] Max output tokens capped at 4096
- [ ] Default model: `gpt-4o-mini` (overridable via `OPENAI_MODEL` env var)
- [ ] Errors return structured error responses (not stack traces)

### Implementation Notes

**Chat handler pattern:**
```ts
import { LanguageModel, Toolkit } from "effect/unstable/ai"
import { OpenAiLanguageModel } from "@effect/ai-openai"

const chatHandler = Effect.fn(function* (request: ChatRequest) {
  const prompt = Prompt.make([
    { role: "system", content: SYSTEM_PROMPT },
    ...request.messages.map(m => ({ role: m.role, content: m.content }))
  ])

  // Returns Effect<Stream<StreamPart>>
  const stream = yield* LanguageModel.streamText({
    prompt,
    toolkit: KnowledgeGraphToolkit,
    toolChoice: "auto",
    concurrency: 1
  })

  // Convert Stream<StreamPart> to SSE Response
  // StreamPart includes: text, reasoning, tool-call, tool-result parts
  // Use HttpEffect.scopeTransferToStream to keep resources alive
  return yield* HttpEffect.scopeTransferToStream(
    HttpServerResponse.stream(
      stream.pipe(Stream.map(part => formatSSE(part)))
    )
  )
})
```

**System prompt should include:**
- "You are an Effect v4 knowledge assistant"
- "Use the SearchGraph and GetFacts tools to find accurate information"
- "NEVER suggest v3 patterns: Context.Tag, Context.GenericTag, Effect.catchAll, @effect/platform, Schema.decode"
- "Always cite which graph facts/nodes support your answer"

**Route setup:**
```ts
// app/api/chat/route.ts
const appLayer = Layer.mergeAll(
  HttpRouter.layer,
  HttpRouter.add("POST", "/api/chat", chatEffect),
  toolsLayer,
  OpenAiLanguageModel.model(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
  GraphitiService.layer,
  OpenAiClient.layer({ apiKey: process.env.OPENAI_API_KEY })
)

const { handler } = HttpRouter.toWebHandler(appLayer)
export const POST = handler
```

**Request/Response schemas:**
```ts
const ChatRequest = S.Struct({
  messages: S.Array(S.Struct({
    role: S.Literal("user", "assistant"),
    content: S.String.pipe(S.minLength(1))
  }))
}).annotate({ identifier: "@beep/web/ChatRequest", title: "Chat Request", description: "..." })

const ChatResponse = S.Struct({
  message: S.String,
  toolCalls: S.optional(S.Array(ToolCallSchema)),
  graphSnippet: S.optional(GraphSnippetSchema)
}).annotate({ identifier: "@beep/web/ChatResponse", title: "Chat Response", description: "..." })
```

### Regression Test Queries

| # | Query | Expected Answer Contains | Expected NOT to Contain |
|---|-------|--------------------------|-------------------------|
| 1 | "How do I create a tagged service?" | ServiceMap.Service | Context.GenericTag, Context.Tag |
| 2 | "How do I catch errors?" | Effect.catch | Effect.catchAll |
| 3 | "Where is FileSystem?" | main effect package | @effect/platform |
| 4 | "Schema decoding methods?" | decodeUnknownEffect | Schema.decode |
| 5 | "How do I create a Layer?" | Layer.effect, Layer.succeed | Layer.scoped |

## Episodic Memory

### From P0-P2
- Auth + better-auth magic link working with email allowlist
- Railway FalkorDB deployed and verified (via SST IaC — `infra/railway.ts`)
- Graphiti API at `https://auth-proxy-production-91fe.up.railway.app` (Caddy auth proxy with X-API-Key)
- KnowledgeGraphToolkit defined with SearchGraph, GetNode, GetFacts
- Shared runtime layers available
- All env vars set on Vercel by SST IaC (`infra/web.ts`)

## Semantic Memory

### Effect v4 AI Usage Pattern
```ts
LanguageModel.generateText({ prompt, toolkit, toolChoice: "auto" })
  .pipe(
    Effect.provide(OpenAiLanguageModel.model("gpt-4o-mini")),
    Effect.provide(toolsLayer),
    Effect.provide(GraphitiService.layer)
  )
```

### Response Types
- `GenerateTextResponse`: `.text`, `.reasoning`, `.toolCalls`, `.toolResults`, `.finishReason`, `.usage`
- `StreamPart`: union of text, reasoning, tool-call, tool-result parts

## Procedural Memory

### References
- OpenAI provider: `.repos/effect-smol/packages/ai/openai/`
- OpenAI tests: `.repos/effect-smol/packages/ai/openai/test/OpenAiLanguageModel.test.ts`
- Chat module: `.repos/effect-smol/packages/ai/ai/src/Chat.ts`
- Research notes: `outputs/research.md` sections 1, 4
