import { Mcp } from "@beep/ai-sdk";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

test("Mcp.tool builds a tool definition", async () => {
  const toolEffect = Mcp.tool({
    name: "echo",
    description: "Echo a message",
    parameters: Schema.Struct({
      message: Schema.String,
      count: Schema.optional(Schema.Number),
    }),
    handler: (params) =>
      Effect.succeed({
        content: [{ type: "text", text: `${params.message}:${params.count ?? 0}` }],
      }),
  });

  const tool = await Effect.runPromise(toolEffect);
  expect(tool.name).toBe("echo");
  expect(tool.description).toBe("Echo a message");
});

test("Mcp.tool can be instantiated with strict parameters", async () => {
  const toolEffect = Mcp.tool({
    name: "strict-echo",
    description: "Echo a message",
    parameters: Schema.Struct({
      message: Schema.String,
    }),
    handler: (params) =>
      Effect.succeed({
        content: [{ type: "text", text: params.message }],
      }),
  });

  const tool = await Effect.runPromise(toolEffect);
  expect(tool.name).toBe("strict-echo");
});
