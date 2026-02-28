import { Mcp, Tools } from "@beep/ai-sdk";
import { CallToolResult, type CallToolResult as CallToolResultType } from "@beep/ai-sdk/Schema/External";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

const requireFirst = <A>(items: ReadonlyArray<A>): A => {
  const first = items[0];
  if (first === undefined) {
    throw new Error("Expected at least one item");
  }
  return first;
};

const decodeCallToolResult = Schema.decodeUnknownSync(CallToolResult);

const invokeTool = async (
  tool: unknown,
  params: Record<string, unknown>
): Promise<CallToolResultType> => {
  if (!Predicate.isObject(tool)) {
    throw new Error("Expected MCP tool object");
  }
  const handler = Reflect.get(tool, "handler");
  if (!Predicate.isFunction(handler)) {
    throw new Error("Expected MCP tool handler");
  }
  return decodeCallToolResult(await handler(params, {}));
};

test("Tool.define attaches handler and accepts schema parameters", async () => {
  const Params = Schema.Struct({
    message: Schema.String,
  });

  const Echo = Tools.Tool.define("echo", {
    description: "Echo input",
    parameters: Params,
    success: Schema.Struct({ message: Schema.String }),
    handler: (params) => Effect.succeed({ message: params.message }),
  });

  expect(Echo.parametersSchema).toBe(Params);

  const toolkit = Tools.Toolkit.make(Echo);
  const handlers = toolkit.of({
    echo: Echo.handler,
  });

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers));
  const tool = requireFirst(tools);

  const result = await invokeTool(tool, { message: "hi" });
  expect(result.isError).toBe(false);
  expect(result.structuredContent).toEqual({ message: "hi" });
});

test("Tool.fn defines a tool with handler as last argument", async () => {
  const Echo = Tools.Tool.fn(
    "echo-fn",
    {
      description: "Echo input",
      parameters: {
        message: Schema.String,
      },
      success: Schema.Struct({ message: Schema.String }),
    },
    (params) => Effect.succeed({ message: params.message })
  );

  const toolkit = Tools.Toolkit.make(Echo);
  const handlers = toolkit.of({
    "echo-fn": Echo.handler,
  });

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers));
  const tool = requireFirst(tools);

  const result = await invokeTool(tool, { message: "hi" });
  expect(result.isError).toBe(false);
  expect(result.structuredContent).toEqual({ message: "hi" });
});

test("Toolkit.fromHandlers builds toolkit and handler map", async () => {
  const toolkit = Tools.Toolkit.fromHandlers({
    echo: {
      description: "Echo input",
      parameters: {
        message: Schema.String,
      },
      success: Schema.Struct({ message: Schema.String }),
      handler: (params: { message: string }) => Effect.succeed({ message: params.message }),
    },
  });

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, toolkit.handlers));
  const tool = requireFirst(tools);

  const result = await invokeTool(tool, { message: "hi" });
  expect(result.isError).toBe(false);
  expect(result.structuredContent).toEqual({ message: "hi" });
});
