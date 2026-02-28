import { addMemoryEpisode, searchMemoryFacts } from "@beep/agent-eval/graphiti/mcp";
import { describe, expect, it, vi } from "vitest";

interface JsonRpcPayload {
  readonly method?: string;
  readonly params?: {
    readonly name?: string;
  };
}

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const withEnv = async (
  overrides: Readonly<Record<string, string | undefined>>,
  run: () => Promise<void>
): Promise<void> => {
  const keys = Object.keys(overrides);
  const previous = new Map<string, string | undefined>();

  for (const key of keys) {
    previous.set(key, process.env[key]);
    const value = overrides[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    await run();
  } finally {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

const payloadFromInit = (init: RequestInit | undefined): JsonRpcPayload => {
  const body = init?.body;
  if (typeof body !== "string") {
    return {};
  }

  try {
    return JSON.parse(body) as JsonRpcPayload;
  } catch {
    return {};
  }
};

describe("Graphiti MCP helpers", () => {
  it("reuses initialized session across calls to same URL", async () => {
    await withEnv(
      {
        BEEP_GRAPHITI_SERIALIZE: "false",
      },
      async () => {
        let initializeCalls = 0;
        let initializedCalls = 0;
        let searchCalls = 0;

        const fetchMock = vi.fn(async (_input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
          const payload = payloadFromInit(init);

          if (payload.method === "initialize") {
            initializeCalls += 1;
            return new Response("{}", {
              status: 200,
              headers: {
                "mcp-session-id": "session-shared",
              },
            });
          }

          if (payload.method === "notifications/initialized") {
            initializedCalls += 1;
            return new Response("", { status: 200 });
          }

          if (payload.method === "tools/call" && payload.params?.name === "search_memory_facts") {
            searchCalls += 1;
            return new Response('{"fact":"session-reused"}', { status: 200 });
          }

          return new Response("{}", { status: 200 });
        });

        vi.stubGlobal("fetch", fetchMock);
        try {
          const options = { url: "http://graphiti.test/reuse", groupId: "beep-dev" };
          const first = await searchMemoryFacts(options, "first", 5);
          const second = await searchMemoryFacts(options, "second", 5);

          expect(first).toEqual(["session-reused"]);
          expect(second).toEqual(["session-reused"]);
          expect(initializeCalls).toBe(1);
          expect(initializedCalls).toBe(1);
          expect(searchCalls).toBe(2);
        } finally {
          vi.unstubAllGlobals();
        }
      }
    );
  });

  it("retries tool call failures by resetting session and reinitializing", async () => {
    await withEnv(
      {
        BEEP_GRAPHITI_SERIALIZE: "false",
        BEEP_GRAPHITI_RETRY_ATTEMPTS: "3",
        BEEP_GRAPHITI_RETRY_BASE_MS: "1",
        BEEP_GRAPHITI_RETRY_MAX_MS: "2",
        BEEP_GRAPHITI_RETRY_JITTER_MS: "1",
      },
      async () => {
        let initializeCalls = 0;
        let initializedCalls = 0;
        let toolCalls = 0;

        const fetchMock = vi.fn(async (_input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
          const payload = payloadFromInit(init);

          if (payload.method === "initialize") {
            initializeCalls += 1;
            return new Response("{}", {
              status: 200,
              headers: {
                "mcp-session-id": `session-${String(initializeCalls)}`,
              },
            });
          }

          if (payload.method === "notifications/initialized") {
            initializedCalls += 1;
            return new Response("", { status: 200 });
          }

          if (payload.method === "tools/call" && payload.params?.name === "search_memory_facts") {
            toolCalls += 1;
            if (toolCalls === 1) {
              return new Response("temporary failure", { status: 503 });
            }
            return new Response('{"fact":"retry-success"}', { status: 200 });
          }

          return new Response("{}", { status: 200 });
        });

        vi.stubGlobal("fetch", fetchMock);
        try {
          const facts = await searchMemoryFacts({ url: "http://graphiti.test/retry", groupId: "beep-dev" }, "retry", 5);

          expect(facts).toEqual(["retry-success"]);
          expect(initializeCalls).toBe(2);
          expect(initializedCalls).toBe(2);
          expect(toolCalls).toBe(2);
        } finally {
          vi.unstubAllGlobals();
        }
      }
    );
  });

  it("surfaces timeout-classified errors and supports deterministic [] fallback", async () => {
    await withEnv(
      {
        BEEP_GRAPHITI_SERIALIZE: "false",
        BEEP_GRAPHITI_RETRY_ATTEMPTS: "1",
        BEEP_GRAPHITI_REQUEST_TIMEOUT_MS: "5",
        BEEP_GRAPHITI_CIRCUIT_ENABLED: "true",
        BEEP_GRAPHITI_CIRCUIT_FAILURE_THRESHOLD: "1",
        BEEP_GRAPHITI_CIRCUIT_OPEN_MS: "60000",
      },
      async () => {
        const fetchMock = vi.fn(async (): Promise<Response> => {
          throw new Error("TimeoutError: simulated timeout");
        });

        vi.stubGlobal("fetch", fetchMock);
        try {
          const options = { url: "http://graphiti.test/timeout", groupId: "beep-dev" };

          await expect(searchMemoryFacts(options, "timeout", 5)).rejects.toMatchObject({
            message: expect.stringContaining("timed out after 5ms"),
          });

          const fallbackFacts = await searchMemoryFacts(options, "timeout", 5);
          expect(fallbackFacts).toEqual([]);
          expect(fetchMock).toHaveBeenCalledTimes(1);
        } finally {
          vi.unstubAllGlobals();
        }
      }
    );
  });

  it("serializes concurrent operations when lock mode is enabled", async () => {
    const lockDir = `/tmp/beep-graphiti-memory-test-${String(Date.now())}`;
    await withEnv(
      {
        BEEP_GRAPHITI_SERIALIZE: "true",
        BEEP_GRAPHITI_LOCK_DIR: lockDir,
        BEEP_GRAPHITI_RETRY_ATTEMPTS: "2",
        BEEP_GRAPHITI_RETRY_BASE_MS: "1",
        BEEP_GRAPHITI_RETRY_MAX_MS: "2",
        BEEP_GRAPHITI_RETRY_JITTER_MS: "1",
      },
      async () => {
        let inFlightToolCalls = 0;
        let maxInFlightToolCalls = 0;

        const fetchMock = vi.fn(async (_input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
          const payload = payloadFromInit(init);

          if (payload.method === "initialize") {
            return new Response("{}", {
              status: 200,
              headers: {
                "mcp-session-id": "session-lock",
              },
            });
          }

          if (payload.method === "notifications/initialized") {
            return new Response("", { status: 200 });
          }

          if (payload.method === "tools/call" && payload.params?.name === "add_memory") {
            inFlightToolCalls += 1;
            maxInFlightToolCalls = Math.max(maxInFlightToolCalls, inFlightToolCalls);
            await sleep(15);
            inFlightToolCalls -= 1;
            return new Response("{}", { status: 200 });
          }

          return new Response("{}", { status: 200 });
        });

        vi.stubGlobal("fetch", fetchMock);
        try {
          const options = { url: "http://graphiti.test/serialize", groupId: "beep-dev" };

          await Promise.all([
            addMemoryEpisode(options, "episode-a", "body-a"),
            addMemoryEpisode(options, "episode-b", "body-b"),
            addMemoryEpisode(options, "episode-c", "body-c"),
          ]);

          expect(maxInFlightToolCalls).toBe(1);
        } finally {
          vi.unstubAllGlobals();
        }
      }
    );
  });
});
