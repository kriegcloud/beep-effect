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

### Preflight (Run Before Coding)
1. Validate required secrets are present in the shell:
   ```bash
   op run --env-file=.env -- sh -c 'test -n "$DATABASE_URL_UNPOOLED" && test -n "$OPENAI_API_KEY" && test -n "$GRAPHITI_API_KEY" && test -n "$GRAPHITI_API_URL"'
   ```
2. Validate database credentials before quality runs (build triggers migrations):
   ```bash
   op run --env-file=.env -- sh -c 'cd apps/web && bun run db:migrate'
   ```
3. Validate Graphiti auth path is reachable:
   ```bash
   op run --env-file=.env -- sh -c 'curl -sS -o /dev/null -w "%{http_code}\n" -H "X-API-Key: $GRAPHITI_API_KEY" "$GRAPHITI_API_URL/mcp"'
   ```
   Expected status: `200`.

### Known Repository Baseline Issues (Track Separately from P3 Changes)
- Root `bun run check` can fail with `TS6305` for new `apps/web` test files and `apps/web/vitest.config.ts` until declaration outputs are aligned with project references.
- Root `bun run docgen` currently fails in `@beep/identity` example typecheck (`TaggedModuleRecord ... has no call signatures`).
- When reporting P3 status, separate:
  - P3-local validation (`apps/web` tests and route behavior)
  - Repo-wide baseline gate health (root quality commands)

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
// app/api/chat/route.ts-morph
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

### Quality Gate Execution Order (CI-Equivalent)
Run this order from repo root:
```bash
bun run build
bun run check
bun run lint
bun run docgen
bun run test
bunx syncpack lint
bun run audit:high:ci
```

## Procedural Memory

### References
- OpenAI provider: `.repos/effect-v4/packages/ai/openai/`
- OpenAI tests: `.repos/effect-v4/packages/ai/openai/test/OpenAiLanguageModel.test.ts`
- Chat module: `.repos/effect-v4/packages/ai/ai/src/Chat.ts`
- Research notes: `outputs/research.md` sections 1, 4
