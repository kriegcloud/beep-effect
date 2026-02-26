import { expect, test } from "bun:test"
import {
  authorizeApiRequest,
  handleChat,
  unauthorizedResponse,
  type ChatDependencies,
  type ChatEnv
} from "../cloudflare-demo/src/chat-handler.ts"

type DemoEnv = ChatEnv

const makeEnv = (overrides?: Partial<{
  readonly DEMO_AUTH_TOKEN: string
  readonly CHAT_REQUEST_TIMEOUT_MS: string
  readonly CHAT_MAX_PROMPT_CHARS: string
}>) =>
  ({
    ...(overrides ?? {})
  }) as DemoEnv

test("demo worker auth helper rejects missing bearer token and returns unauthorized payload", async () => {
  const request = new Request("https://example.com/api/health")
  const env = makeEnv({ DEMO_AUTH_TOKEN: "secret-token" })

  expect(authorizeApiRequest(request, env)).toBe(false)

  const response = unauthorizedResponse()
  expect(response.status).toBe(401)
  const body = await response.json() as { code?: string; message?: string }
  expect(body.code).toBe("unauthorized")
  expect(body.message).toContain("token")
})

test("demo worker auth helper allows valid bearer token", () => {
  const request = new Request("https://example.com/api/health", {
    headers: {
      Authorization: "Bearer secret-token"
    }
  })
  const env = makeEnv({ DEMO_AUTH_TOKEN: "secret-token" })
  expect(authorizeApiRequest(request, env)).toBe(true)
})

test("demo worker validates payload shape and unknown fields", async () => {
  const dependencies: ChatDependencies<DemoEnv> = {
    getSDK: async () => {
      throw new Error("should not run for invalid payload")
    },
    getEffect: async () => {
      throw new Error("should not run for invalid payload")
    },
    getRuntime: async () => {
      throw new Error("should not run for invalid payload")
    }
  }

  const invalidShape = await handleChat(
    new Request("https://example.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([])
    }),
    makeEnv(),
    dependencies
  )
  expect(invalidShape.status).toBe(400)
  const invalidShapeBody = await invalidShape.json() as { code?: string }
  expect(invalidShapeBody.code).toBe("invalid_request")

  const unknownField = await handleChat(
    new Request("https://example.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello", extra: true })
    }),
    makeEnv(),
    dependencies
  )
  expect(unknownField.status).toBe(400)
  const unknownFieldBody = await unknownField.json() as { code?: string }
  expect(unknownFieldBody.code).toBe("unknown_field")
})

test("demo worker validates sessionId format and prompt length", async () => {
  const dependencies: ChatDependencies<DemoEnv> = {
    getSDK: async () => {
      throw new Error("should not run for invalid payload")
    },
    getEffect: async () => {
      throw new Error("should not run for invalid payload")
    },
    getRuntime: async () => {
      throw new Error("should not run for invalid payload")
    }
  }

  const badSession = await handleChat(
    new Request("https://example.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello", sessionId: "bad/session" })
    }),
    makeEnv(),
    dependencies
  )
  expect(badSession.status).toBe(400)
  const badSessionBody = await badSession.json() as { code?: string }
  expect(badSessionBody.code).toBe("invalid_session_id")

  const tooLongPrompt = await handleChat(
    new Request("https://example.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "abcdef" })
    }),
    makeEnv({ CHAT_MAX_PROMPT_CHARS: "5" }),
    dependencies
  )
  expect(tooLongPrompt.status).toBe(400)
  const tooLongPromptBody = await tooLongPrompt.json() as { code?: string }
  expect(tooLongPromptBody.code).toBe("prompt_too_long")
})

test("demo worker emits timeout SSE error and closes stream", async () => {
  const dependencies: ChatDependencies<DemoEnv> = {
    getSDK: async () =>
      ({
        MessageFilters: {
          extractTextChunks: () => [],
          isResultSuccess: () => false,
          isResultError: () => false
        },
        Sandbox: {
          SandboxService: Symbol.for("effect-claude-agent-sdk.sandbox")
        }
      }),
    getEffect: async () =>
      ({
        Effect: {
          scoped: (effect: unknown) => effect,
          gen: () => ({ _tag: "effect.gen.placeholder" }),
          promise: () => ({ _tag: "effect.promise.placeholder" }),
          sync: () => ({ _tag: "effect.sync.placeholder" })
        },
        Stream: {
          runForEach: () => ({ _tag: "stream.runForEach.placeholder" })
        }
      }),
    getRuntime: async () =>
      ({
        runPromise: () => new Promise<never>(() => {})
      })
  }

  const response = await handleChat(
    new Request("https://example.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "timeout me" })
    }),
    makeEnv({ CHAT_REQUEST_TIMEOUT_MS: "120" }),
    dependencies
  )

  expect(response.status).toBe(200)
  expect(response.headers.get("Content-Type")).toContain("text/event-stream")
  const body = await response.text()
  expect(body).toContain("event: error")
  expect(body).toContain("\"code\":\"request_timeout\"")
})
