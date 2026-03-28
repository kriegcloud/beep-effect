import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { vi } from "vitest";
import { runEffect } from "./effect-test.js";

class MockThread {
  id: string | null;

  constructor(id: string | null) {
    this.id = id;
  }

  async run(input: unknown) {
    this.id ??= "thread-1";
    return {
      items: [
        {
          id: "msg-1",
          type: "agent_message" as const,
          text: `echo:${String(input)}`,
        },
      ],
      finalResponse: `echo:${String(input)}`,
      usage: {
        input_tokens: 1,
        cached_input_tokens: 1,
        output_tokens: 1,
      },
    };
  }

  async runStreamed(input: unknown) {
    const startedEvent =
      this.id === null
        ? ((this.id = "thread-1"),
          {
            type: "thread.started" as const,
            thread_id: this.id,
          })
        : null;

    return {
      events: (async function* () {
        if (startedEvent !== null) {
          yield startedEvent;
        }
        yield {
          type: "item.updated" as const,
          item: {
            id: "todo-1",
            type: "todo_list" as const,
            items: [
              {
                text: `plan:${String(input)}`,
                completed: false,
              },
            ],
          },
        };
        yield {
          type: "item.completed" as const,
          item: {
            id: "msg-2",
            type: "agent_message" as const,
            text: `stream:${String(input)}`,
          },
        };
        yield {
          type: "turn.completed" as const,
          usage: {
            input_tokens: 2,
            cached_input_tokens: 1,
            output_tokens: 2,
          },
        };
      })(),
    };
  }
}

vi.mock("@openai/codex-sdk", () => ({
  Codex: class MockCodex {
    startThread() {
      return new MockThread(null);
    }

    resumeThread(id: string) {
      return new MockThread(id);
    }
  },
}));

test("CodexService normalizes completed turns and streamed thread events", async () => {
  const { make } = await import("../src/codex/Service.js");

  const program = Effect.gen(function* () {
    const service = yield* make();

    expect(yield* service.threadId).toBeNull();

    const turn = yield* service.run("hello");
    expect(turn.finalResponse).toBe("echo:hello");
    expect(yield* service.threadId).toBe("thread-1");

    yield* service.startThread();
    expect(yield* service.threadId).toBeNull();

    const events = yield* Stream.runCollect(service.runStreamed("stream"));
    expect(Array.from(events, (event) => event.type)).toEqual([
      "thread.started",
      "item.updated",
      "item.completed",
      "turn.completed",
    ]);
    expect(yield* service.threadId).toBe("thread-1");
  });

  await runEffect(program);
}, 20_000);
