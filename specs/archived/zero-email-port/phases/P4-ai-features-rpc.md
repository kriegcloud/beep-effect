# Phase 4: AI Features RPC

> Implement AI-powered email features using @effect/ai: compose assist, Brain auto-labeling, summaries, and smart search.

---

## Prerequisites

- P0 (Foundation) completed
- P1 (Email Drivers) completed
- P2 (Core Email RPC) completed
- Understanding of `@effect/ai` patterns (LanguageModel, Tool, Toolkit, Prompt)

---

## Overview

This phase implements AI-powered features using the native @effect/ai library:

| Router | Procedures | Description |
|--------|------------|-------------|
| `ai` | 4 | Compose assist, subject generation, search query, web search |
| `brain` | 7 | Auto-labeling, summaries, prompts management |

---

## AI Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              @effect/ai/LanguageModel                       │
│  (Abstract interface - Effect's native LLM abstraction)     │
└───────────────┬─────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───────┐ ┌─▼─────────┐ ┌───▼─────────┐
│ @effect/  │ │ @effect/  │ │ @effect/    │
│ai-openai  │ │ai-anthropic│ │ ai-google  │
└───────────┘ └───────────┘ └─────────────┘
```

**Key Insight**: Unlike Vercel AI SDK or custom abstractions, @effect/ai provides a unified `LanguageModel` service that works across providers. The implementation layer (Anthropic/OpenAI) is injected via Effect Layers.

---

## Tasks

### Task 4.1: Create LLM Provider Layer

**File**: `packages/comms/server/src/ai/LlmLayers.ts`

This follows the established pattern from `@beep/knowledge-server`:

```typescript
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Redacted from "effect/Redacted";

/**
 * Create Anthropic provider Layer
 */
const makeAnthropicLayer = (apiKey: Redacted.Redacted<string>, model: string) =>
  AnthropicLanguageModel.layer({ model }).pipe(
    Layer.provide(
      AnthropicClient.layer({ apiKey }).pipe(Layer.provide(FetchHttpClient.layer))
    )
  );

/**
 * Create OpenAI provider Layer
 */
const makeOpenAiLayer = (apiKey: Redacted.Redacted<string>, model: string) =>
  OpenAiLanguageModel.layer({ model }).pipe(
    Layer.provide(
      OpenAiClient.layer({ apiKey }).pipe(Layer.provide(FetchHttpClient.layer))
    )
  );

/**
 * LLM configuration from environment variables
 *
 * - LLM_PROVIDER: "anthropic" (default) or "openai"
 * - LLM_API_KEY: API key for the selected provider
 * - LLM_MODEL: Model identifier (default: "claude-sonnet-4-20250514")
 */
export const LlmConfig = Config.all({
  provider: Config.string("LLM_PROVIDER").pipe(Config.withDefault("anthropic")),
  apiKey: Config.redacted("LLM_API_KEY"),
  model: Config.string("LLM_MODEL").pipe(Config.withDefault("claude-sonnet-4-20250514")),
});

/**
 * LlmLive - Production Layer for LanguageModel service
 *
 * Provides LanguageModel.LanguageModel based on environment configuration.
 */
export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    return config.provider === "openai"
      ? makeOpenAiLayer(config.apiKey, config.model)
      : makeAnthropicLayer(config.apiKey, config.model);
  })
);
```

---

### Task 4.2: Create Email AI Tools with Tool.make

**File**: `packages/comms/server/src/ai/tools/email-tools.ts`

Define AI tools using @effect/ai's `Tool.make` pattern:

```typescript
import { Tool, Toolkit } from "@effect/ai";
import * as S from "effect/Schema";

/**
 * Tool: Compose email based on prompt and context
 */
export const ComposeEmail = Tool.make("ComposeEmail", {
  description: "Compose a professional email based on the user's prompt and optional context",
  parameters: {
    prompt: S.String.pipe(
      S.annotations({ description: "What the user wants to write about" })
    ),
    context: S.optional(S.String).pipe(
      S.annotations({ description: "Previous email thread for reply context" })
    ),
    tone: S.optional(S.Literal("formal", "casual", "friendly")).pipe(
      S.annotations({ description: "Desired tone of the email" })
    ),
  },
  success: S.Struct({
    subject: S.String,
    body: S.String,
  }),
  failure: S.String,
});

/**
 * Tool: Generate email subject from body
 */
export const GenerateSubject = Tool.make("GenerateSubject", {
  description: "Generate a concise email subject line from the email body",
  parameters: {
    body: S.String.pipe(
      S.annotations({ description: "The email body to generate subject for" })
    ),
  },
  success: S.Struct({
    subject: S.String,
  }),
  failure: S.String,
});

/**
 * Tool: Convert natural language to search query
 */
export const GenerateSearchQuery = Tool.make("GenerateSearchQuery", {
  description: "Convert natural language into Gmail/Outlook search syntax",
  parameters: {
    naturalLanguage: S.String.pipe(
      S.annotations({ description: "Natural language search description" })
    ),
  },
  success: S.Struct({
    searchQuery: S.String,
    explanation: S.optional(S.String),
  }),
  failure: S.String,
});

/**
 * Tool: Summarize email thread
 */
export const SummarizeThread = Tool.make("SummarizeThread", {
  description: "Generate a summary of an email thread",
  parameters: {
    messages: S.Array(S.String).pipe(
      S.annotations({ description: "Array of email message bodies" })
    ),
    format: S.optional(S.Literal("short", "detailed")).pipe(
      S.annotations({ description: "Summary format" })
    ),
  },
  success: S.Struct({
    summary: S.String,
    keyPoints: S.optional(S.Array(S.String)),
    actionItems: S.optional(S.Array(S.String)),
  }),
  failure: S.String,
});

/**
 * Tool: Suggest labels for email
 */
export const SuggestLabels = Tool.make("SuggestLabels", {
  description: "Suggest appropriate labels for an email based on content",
  parameters: {
    emailContent: S.String.pipe(
      S.annotations({ description: "Email subject and body" })
    ),
    availableLabels: S.Array(
      S.Struct({
        name: S.String,
        usecase: S.String,
      })
    ).pipe(S.annotations({ description: "Available labels to choose from" })),
  },
  success: S.Struct({
    suggestedLabels: S.Array(S.String),
    confidence: S.Number,
  }),
  failure: S.String,
});

/**
 * Combined Email AI Toolkit
 */
export const EmailAiToolkit = Toolkit.make(
  ComposeEmail,
  GenerateSubject,
  GenerateSearchQuery,
  SummarizeThread,
  SuggestLabels
);

export type EmailAiToolkit = typeof EmailAiToolkit;
```

---

### Task 4.3: Create Email AI Service

**File**: `packages/comms/server/src/ai/EmailAiService.ts`

Implement the service using `LanguageModel` from @effect/ai:

```typescript
import { LanguageModel, Prompt } from "@effect/ai";
import { $CommsServerId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as S from "effect/Schema";
import { AiServiceError } from "@beep/comms-domain/errors";

const $I = $CommsServerId.create("comms-server/ai/EmailAiService");

/**
 * Schema for structured email composition output
 */
const ComposedEmail = S.Struct({
  subject: S.String,
  body: S.String,
});

/**
 * Schema for thread summary output
 */
const ThreadSummary = S.Struct({
  summary: S.String,
  keyPoints: S.optional(S.Array(S.String)),
  actionItems: S.optional(S.Array(S.String)),
});

/**
 * Schema for label suggestions output
 */
const LabelSuggestions = S.Struct({
  labels: S.Array(S.String),
  confidence: S.Number,
});

/**
 * EmailAiService - Effect Service for AI-powered email operations
 *
 * Uses @effect/ai LanguageModel for all LLM interactions.
 */
export class EmailAiService extends Effect.Service<EmailAiService>()($I`EmailAiService`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const model = yield* LanguageModel.LanguageModel;

    return {
      /**
       * Compose email using structured output
       */
      composeEmail: Effect.fnUntraced(function* (
        userPrompt: string,
        options?: {
          context?: string;
          tone?: "formal" | "casual" | "friendly";
        }
      ) {
        const systemContent = buildComposeSystemPrompt(options?.tone);

        const userContent = options?.context
          ? `Context from previous emails:\n${options.context}\n\nUser request: ${userPrompt}`
          : userPrompt;

        const prompt = Prompt.make([
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ]);

        const result = yield* model.generateObject({
          prompt,
          schema: ComposedEmail,
          objectName: "ComposedEmail",
        });

        return result.value;
      }),

      /**
       * Stream email composition for real-time UI feedback
       */
      composeEmailStream: (
        userPrompt: string,
        options?: { context?: string; tone?: "formal" | "casual" | "friendly" }
      ): Stream.Stream<{ type: "text-delta"; delta: string } | { type: "done" }, AiServiceError> => {
        const systemContent = buildComposeSystemPrompt(options?.tone);

        const userContent = options?.context
          ? `Context from previous emails:\n${options.context}\n\nUser request: ${userPrompt}`
          : userPrompt;

        const prompt = Prompt.make([
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ]);

        return model.streamText({ prompt }).pipe(
          Stream.map((part) => {
            if (part.type === "text-delta") {
              return { type: "text-delta" as const, delta: part.delta };
            }
            return { type: "done" as const };
          }),
          Stream.catchAll((error) =>
            Stream.fail(new AiServiceError({
              service: "language-model",
              message: String(error),
            }))
          )
        );
      },

      /**
       * Generate email subject line
       */
      generateSubject: Effect.fnUntraced(function* (emailBody: string) {
        const prompt = Prompt.make([
          {
            role: "system",
            content: "Generate a concise, professional email subject line. Return only the subject, nothing else.",
          },
          { role: "user", content: emailBody },
        ]);

        const result = yield* model.generateText({ prompt });
        return result.text.trim();
      }),

      /**
       * Summarize email thread using structured output
       */
      summarizeThread: Effect.fnUntraced(function* (
        messages: readonly string[],
        format: "short" | "detailed" = "short"
      ) {
        const systemContent = format === "detailed"
          ? "Summarize this email thread in detail. Extract key points and action items."
          : "Provide a brief one-sentence summary of this email thread.";

        const prompt = Prompt.make([
          { role: "system", content: systemContent },
          { role: "user", content: A.join(messages, "\n---\n") },
        ]);

        const result = yield* model.generateObject({
          prompt,
          schema: ThreadSummary,
          objectName: "ThreadSummary",
        });

        return result.value;
      }),

      /**
       * Convert natural language to search query
       */
      generateSearchQuery: Effect.fnUntraced(function* (naturalLanguage: string) {
        const prompt = Prompt.make([
          {
            role: "system",
            content: `Convert natural language into Gmail search query syntax.
Use operators: from:, to:, subject:, has:attachment, is:unread, after:, before:, label:
Return only the search query, nothing else.`,
          },
          { role: "user", content: naturalLanguage },
        ]);

        const result = yield* model.generateText({ prompt });
        return result.text.trim();
      }),

      /**
       * Suggest labels using structured output
       */
      suggestLabels: Effect.fnUntraced(function* (
        emailContent: string,
        availableLabels: readonly { name: string; usecase: string }[]
      ) {
        const labelDescriptions = A.map(availableLabels, (l) => `- ${l.name}: ${l.usecase}`);

        const prompt = Prompt.make([
          {
            role: "system",
            content: `Given an email, suggest which labels should be applied.

Available labels:
${A.join(labelDescriptions, "\n")}

Only suggest labels from the available list.`,
          },
          { role: "user", content: emailContent },
        ]);

        const result = yield* model.generateObject({
          prompt,
          schema: LabelSuggestions,
          objectName: "LabelSuggestions",
        });

        return result.value.labels;
      }),
    };
  }),
}) {}

/**
 * Build system prompt for email composition
 */
const buildComposeSystemPrompt = (tone?: "formal" | "casual" | "friendly"): string => {
  const toneInstructions = {
    formal: "Use formal, professional language appropriate for business communication.",
    casual: "Use casual, conversational language while remaining professional.",
    friendly: "Use warm, friendly language that builds rapport.",
  };

  return `You are an email writing assistant. Compose clear, effective emails.
${tone ? toneInstructions[tone] : "Match the appropriate tone based on context."}
Always generate both a subject line and body.`;
};
```

---

### Task 4.4: Create AI RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/ai/`

#### compose.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/ai/compose");

export class Payload extends S.Class<Payload>($I`Payload`)({
  prompt: S.String,
  context: S.optional(S.String),
  threadId: S.optional(S.String),
  tone: S.optional(S.Literal("formal", "casual", "friendly")),
  stream: S.optional(S.Boolean), // Whether to stream response
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  subject: S.optional(S.String),
  body: S.optional(S.String),
  // For streaming, indicates stream is ready
  streaming: S.optional(S.Boolean),
}) {}

export const Contract = Rpc.make("compose", {
  payload: Payload,
  success: Success,
});
```

#### generate-subject.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/ai/generate-subject");

export class Payload extends S.Class<Payload>($I`Payload`)({
  body: S.String,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  subject: S.String,
}) {}

export const Contract = Rpc.make("generateSubject", {
  payload: Payload,
  success: Success,
});
```

#### generate-search-query.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/ai/generate-search-query");

export class Payload extends S.Class<Payload>($I`Payload`)({
  query: S.String, // Natural language query
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  searchQuery: S.String, // Gmail/Outlook search syntax
}) {}

export const Contract = Rpc.make("generateSearchQuery", {
  payload: Payload,
  success: Success,
});
```

---

### Task 4.5: Create Brain RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/brain/`

#### generate-summary.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/brain/generate-summary");

export class Payload extends S.Class<Payload>($I`Payload`)({
  threadId: S.NonEmptyTrimmedString,
}) {}

export class ThreadSummary extends S.Class<ThreadSummary>($I`ThreadSummary`)({
  short: S.String,
  detailed: S.optional(S.String),
  keyPoints: S.optional(S.Array(S.String)),
  actionItems: S.optional(S.Array(S.String)),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  summary: S.NullOr(ThreadSummary),
}) {}

export const Contract = Rpc.make("generateSummary", {
  payload: Payload,
  success: Success,
});
```

#### suggest-labels.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/brain/suggest-labels");

export class BrainLabel extends S.Class<BrainLabel>($I`BrainLabel`)({
  name: S.String,
  usecase: S.String,
}) {}

export class Payload extends S.Class<Payload>($I`Payload`)({
  threadId: S.NonEmptyTrimmedString,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  suggestedLabels: S.Array(S.String),
  confidence: S.Number,
}) {}

export const Contract = Rpc.make("suggestLabels", {
  payload: Payload,
  success: Success,
});
```

---

### Task 4.6: Implement AI Handlers

**File**: `packages/comms/server/src/rpc/v1/ai/compose.handler.ts`

```typescript
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { Policy } from "@beep/shared-domain";
import { EmailAiService } from "../../../ai/EmailAiService";
import { ActiveConnection, MailDriver } from "../../../services/mail";
import { Compose } from "@beep/comms-domain/rpc/v1/ai";
import { AiServiceError } from "@beep/comms-domain/errors";

type HandlerEffect = (
  payload: Compose.Payload
) => Effect.Effect<
  Compose.Success,
  never,
  Policy.AuthContext | EmailAiService | ActiveConnection | MailDriver
>;

export const Handler: HandlerEffect = Effect.fn("ai_compose")(
  function* (payload) {
    const emailAi = yield* EmailAiService;

    // Build context from thread if provided
    let context: string | undefined;

    if (payload.threadId) {
      const driver = yield* MailDriver;
      const thread = yield* driver.getThread(payload.threadId);
      context = thread.messages
        .map((m) => `From: ${m.sender.email}\n${m.body}`)
        .join("\n---\n");
    }

    // Use structured output for non-streaming
    const result = yield* emailAi.composeEmail(payload.prompt, {
      context,
      tone: O.fromNullable(payload.tone).pipe(O.getOrUndefined),
    });

    return new Compose.Success({
      subject: result.subject,
      body: result.body,
    });
  },
  Effect.catchTag("AiServiceError", (e) =>
    Effect.succeed(new Compose.Success({
      body: `Error generating email: ${e.message}`,
    }))
  )
);
```

**File**: `packages/comms/server/src/rpc/v1/brain/generate-summary.handler.ts`

```typescript
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { Policy } from "@beep/shared-domain";
import { EmailAiService } from "../../../ai/EmailAiService";
import { ActiveConnection, MailDriver } from "../../../services/mail";
import { ThreadSummaryRepo } from "../../../repos/ThreadSummaryRepo";
import { GenerateSummary } from "@beep/comms-domain/rpc/v1/brain";

type HandlerEffect = (
  payload: GenerateSummary.Payload
) => Effect.Effect<
  GenerateSummary.Success,
  never,
  Policy.AuthContext | EmailAiService | MailDriver | ThreadSummaryRepo | ActiveConnection
>;

export const Handler: HandlerEffect = Effect.fn("brain_generateSummary")(
  function* (payload) {
    const emailAi = yield* EmailAiService;
    const driver = yield* MailDriver;
    const summaryRepo = yield* ThreadSummaryRepo;
    const { connectionId } = yield* ActiveConnection;

    // Check for cached summary
    const cached = yield* summaryRepo.findByThreadId(payload.threadId);

    if (O.isSome(cached)) {
      return new GenerateSummary.Success({
        summary: new GenerateSummary.ThreadSummary({
          short: cached.value.content,
        }),
      });
    }

    // Fetch thread and generate summary using structured output
    const thread = yield* driver.getThread(payload.threadId);
    const messages = thread.messages.map((m) => m.body);

    const result = yield* emailAi.summarizeThread(messages, "short");

    // Cache the summary
    yield* summaryRepo.create({
      connectionId,
      messageId: payload.threadId,
      content: result.summary,
      saved: false,
    });

    return new GenerateSummary.Success({
      summary: new GenerateSummary.ThreadSummary({
        short: result.summary,
        keyPoints: result.keyPoints,
        actionItems: result.actionItems,
      }),
    });
  },
  Effect.catchTags({
    AiServiceError: () =>
      Effect.succeed(new GenerateSummary.Success({ summary: null })),
    ThreadNotFoundError: () =>
      Effect.succeed(new GenerateSummary.Success({ summary: null })),
  })
);
```

---

### Task 4.7: Streaming via RPC

For streaming AI responses, use Effect Streams with RPC:

**File**: `packages/comms/server/src/rpc/v1/ai/compose-stream.handler.ts`

```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Policy } from "@beep/shared-domain";
import { EmailAiService } from "../../../ai/EmailAiService";
import { ActiveConnection, MailDriver } from "../../../services/mail";

/**
 * Streaming compose handler using Effect Stream
 *
 * Returns a Stream that emits text deltas for real-time UI updates.
 */
export const composeStream = (payload: {
  prompt: string;
  context?: string;
  tone?: "formal" | "casual" | "friendly";
}): Stream.Stream<
  { type: "text-delta"; delta: string } | { type: "done" },
  never,
  Policy.AuthContext | EmailAiService | ActiveConnection | MailDriver
> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const emailAi = yield* EmailAiService;

      // Build context from thread if needed
      let context = payload.context;

      if (!context && payload.context) {
        const driver = yield* MailDriver;
        // Fetch context logic here if needed
      }

      return emailAi.composeEmailStream(payload.prompt, {
        context,
        tone: payload.tone,
      });
    })
  );
```

---

### Task 4.8: Add AI RPC Groups to CommsRpcsLive

**File**: `packages/comms/server/src/rpc/v1/index.ts`

```typescript
import * as Layer from "effect/Layer";
import { Ai } from "@beep/comms-domain/rpc/v1/ai";
import { Brain } from "@beep/comms-domain/rpc/v1/brain";
import { Policy } from "@beep/shared-domain";

// Import handlers
import * as ComposeHandler from "./ai/compose.handler";
import * as GenerateSubjectHandler from "./ai/generate-subject.handler";
import * as GenerateSearchQueryHandler from "./ai/generate-search-query.handler";
import * as GenerateSummaryHandler from "./brain/generate-summary.handler";
import * as SuggestLabelsHandler from "./brain/suggest-labels.handler";
// ... other handlers

// AI handlers
export const AiRpcsLive = Ai.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(ActiveConnectionRpcMiddleware)
  .toLayer({
    compose: ComposeHandler.Handler,
    generateSubject: GenerateSubjectHandler.Handler,
    generateSearchQuery: GenerateSearchQueryHandler.Handler,
  });

// Brain handlers
export const BrainRpcsLive = Brain.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(ActiveConnectionRpcMiddleware)
  .toLayer({
    generateSummary: GenerateSummaryHandler.Handler,
    suggestLabels: SuggestLabelsHandler.Handler,
    enableBrain: EnableBrainHandler.Handler,
    disableBrain: DisableBrainHandler.Handler,
    getBrainState: GetBrainStateHandler.Handler,
    getBrainLabels: GetBrainLabelsHandler.Handler,
    updateBrainLabels: UpdateBrainLabelsHandler.Handler,
  });

// Combined layer with LLM provider
export const CommsRpcsLive = Layer.mergeAll(
  // From P2
  ConnectionsRpcsLive,
  LabelsRpcsLive,
  DraftsRpcsLive,
  MailRpcsLive,
  // From P3
  TemplatesRpcsLive,
  NotesRpcsLive,
  ShortcutsRpcsLive,
  SettingsRpcsLive,
  // From P4
  AiRpcsLive,
  BrainRpcsLive,
);
```

---

### Task 4.9: Wire LLM Layer into Server Runtime

**File**: `packages/comms/server/src/Runtime.ts`

```typescript
import * as Layer from "effect/Layer";
import { LlmLive } from "./ai/LlmLayers";
import { EmailAiService } from "./ai/EmailAiService";

// Build complete runtime layer
export const CommsServerLive = Layer.mergeAll(
  // Infrastructure layers
  DatabaseLive,
  CacheLive,

  // LLM Layer - provides LanguageModel.LanguageModel
  LlmLive,

  // Email AI Service - depends on LanguageModel
  EmailAiService.Default,

  // RPC layers
  CommsRpcsLive,
);
```

---

## Error Handling Patterns

Use `catchTag` for graceful degradation:

```typescript
import * as Effect from "effect/Effect";

const robustAiCall = emailAi.composeEmail(prompt, options).pipe(
  // Retry transient errors
  Effect.retry({
    times: 2,
    schedule: Schedule.exponential("100 millis"),
  }),

  // Catch specific AI errors
  Effect.catchTag("AiError", (error) =>
    Effect.succeed({
      subject: "Draft Email",
      body: `[AI unavailable - please compose manually]\n\nOriginal prompt: ${prompt}`,
    })
  ),

  // Catch network errors
  Effect.catchTag("NetworkError", () =>
    Effect.succeed({
      subject: "Draft Email",
      body: "[Network error - please try again]",
    })
  ),

  // Add observability
  Effect.withSpan("EmailAiService.composeEmail", {
    attributes: { promptLength: prompt.length },
  })
);
```

---

## Verification

```bash
# Check domain contracts
bun run check --filter @beep/comms-domain

# Check server handlers
bun run check --filter @beep/comms-server

# Run AI service tests
bun run test --filter @beep/comms-server -- --grep "EmailAiService"

# Lint
bun run lint --filter @beep/comms-*
```

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| LLM Layer | `packages/comms/server/src/ai/LlmLayers.ts` |
| Email AI Tools | `packages/comms/server/src/ai/tools/email-tools.ts` |
| Email AI Service | `packages/comms/server/src/ai/EmailAiService.ts` |
| AI RPC contracts | `packages/comms/domain/src/rpc/v1/ai/` |
| Brain RPC contracts | `packages/comms/domain/src/rpc/v1/brain/` |
| AI handlers | `packages/comms/server/src/rpc/v1/ai/` |
| Brain handlers | `packages/comms/server/src/rpc/v1/brain/` |
| ThreadSummaryRepo | `packages/comms/server/src/repos/ThreadSummaryRepo.ts` |

---

## Dependencies

- P0 (Foundation) - Domain models
- P1 (Email Drivers) - MailDriver for context
- P2 (Core Email RPC) - Middleware patterns

## Blocks

- P5 (UI Components) - needs AI RPC contracts

---

## Test Strategy

AI services should be tested using @beep/testkit with mocked LanguageModel:

```typescript
import { effect, layer, strictEqual, deepEqual } from "@beep/testkit";
import { LanguageModel } from "@effect/ai";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";
import { EmailAiService } from "./EmailAiService";

// Mock LanguageModel for testing
const MockLanguageModel = Layer.succeed(LanguageModel.LanguageModel, {
  generateText: ({ prompt }) =>
    Effect.succeed({
      text: "Generated subject line",
      usage: { inputTokens: 10, outputTokens: 5 },
    }),
  generateObject: ({ prompt, schema }) =>
    Effect.succeed({
      value: {
        subject: "Test Subject",
        body: "Test body content",
      },
      usage: { inputTokens: 20, outputTokens: 50 },
    }),
  streamText: ({ prompt }) =>
    Stream.make(
      { type: "text-delta", delta: "Hello " },
      { type: "text-delta", delta: "World" },
      { type: "finish", finishReason: "stop" }
    ),
});

const TestLayer = Layer.provide(
  EmailAiService.Default,
  MockLanguageModel
);

layer(TestLayer, { timeout: Duration.seconds(30) })("EmailAiService", (it) => {
  it.effect("composeEmail generates structured output", () =>
    Effect.gen(function* () {
      const emailAi = yield* EmailAiService;
      const result = yield* emailAi.composeEmail("Write a thank you email");

      strictEqual(result.subject, "Test Subject");
      strictEqual(result.body, "Test body content");
    })
  );

  it.effect("generateSubject returns trimmed text", () =>
    Effect.gen(function* () {
      const emailAi = yield* EmailAiService;
      const subject = yield* emailAi.generateSubject("Email body here");

      strictEqual(subject, "Generated subject line");
    })
  );
});
```

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `mcp-researcher` | Research @effect/ai API patterns and updates |
| `web-researcher` | Research Anthropic/OpenAI model capabilities |
| `test-writer` | Create EmailAiService tests with mocked LanguageModel |
| `code-observability-writer` | Add tracing spans for AI calls (latency, token usage) |
