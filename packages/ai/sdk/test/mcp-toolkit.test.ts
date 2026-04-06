import { Mcp, Tools } from "@beep/ai-sdk";
import { CallToolResult } from "@beep/ai-sdk/Schema/External";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as Z from "zod";
import { runEffect } from "./effect-test.js";

class ExplosionError extends Error {
  readonly _tag = "ExplosionError";
}

const requireFirst = <A>(items: ReadonlyArray<A>): A => {
  const first = items[0];
  if (first === undefined) {
    throw new Error("Expected at least one item");
  }
  return first;
};

const decodeCallToolResult = Schema.decodeUnknownSync(CallToolResult);

const readStringField = (value: unknown, field: string): string | undefined => {
  if (!Predicate.isObject(value)) {
    return undefined;
  }
  const fieldValue = Reflect.get(value, field);
  return Predicate.isString(fieldValue) ? fieldValue : undefined;
};

const invokeTool = async (tool: unknown, params: Record<string, unknown>) => {
  if (!Predicate.isObject(tool)) {
    throw new Error("Expected MCP tool object");
  }
  const handler = Reflect.get(tool, "handler");
  if (!Predicate.isFunction(handler)) {
    throw new Error("Expected MCP tool handler");
  }
  return decodeCallToolResult(await handler(params, {}));
};

test("Mcp.toolsFromToolkit builds tools and renders success results", async () => {
  const Echo = Tools.Tool.make("echo", {
    description: "Echo input",
    parameters: {
      message: Schema.String,
    },
    success: Schema.Struct({ message: Schema.String }),
  });

  const toolkit = Tools.Toolkit.make(Echo);
  const handlers = toolkit.of({
    echo: (params) =>
      Effect.succeed({
        message: readStringField(params, "message") ?? "",
      }),
  });

  const tools = await runEffect(Mcp.toolsFromToolkit(toolkit, handlers));
  expect(tools).toHaveLength(1);

  const tool = requireFirst(tools);
  expect(Z.object(tool.inputSchema).safeParse({ message: "hi" }).success).toBe(true);

  const result = await invokeTool(tool, { message: "hi" });
  expect(result.isError).toBe(false);
  expect(result.structuredContent).toEqual({ message: "hi" });
});

test("Mcp.toolsFromToolkit renders failure-mode results as errors", async () => {
  const Fails = Tools.Tool.make("fails", {
    description: "Fails",
    parameters: {
      reason: Schema.String,
    },
    failure: Schema.Struct({ reason: Schema.String }),
    failureMode: "return",
  });

  const toolkit = Tools.Toolkit.make(Fails);
  const handlers = toolkit.of({
    fails: (params) =>
      Effect.fail({
        reason: readStringField(params, "reason") ?? "unknown",
      }),
  });

  const tools = await runEffect(Mcp.toolsFromToolkit(toolkit, handlers));
  const tool = requireFirst(tools);

  const result = await invokeTool(tool, { reason: "nope" });
  expect(result.isError).toBe(true);
  expect(result.structuredContent).toEqual({ reason: "nope" });
});

test("Mcp.toolsFromToolkit maps handler errors to CallToolResult", async () => {
  const Echo = Tools.Tool.make("strict", {
    description: "Strict input",
    parameters: {
      message: Schema.String,
    },
    success: Schema.Struct({ message: Schema.String }),
  });

  const toolkit = Tools.Toolkit.make(Echo);
  const handlers = toolkit.of({
    strict: (params) =>
      Effect.succeed({
        message: readStringField(params, "message") ?? "",
      }),
  });

  const tools = await runEffect(Mcp.toolsFromToolkit(toolkit, handlers));
  const tool = requireFirst(tools);

  const result = await invokeTool(tool, { message: 123 });
  expect(result.isError).toBe(true);
  expect(result.structuredContent).toBeDefined();
  if (result.structuredContent) {
    expect(Object.getPrototypeOf(result.structuredContent)).toBe(Object.prototype);
  }
});

test("Mcp.toolsFromToolkit serializes error instances in structuredContent", async () => {
  const Explodes = Tools.Tool.make("explode", {
    description: "Explodes",
    parameters: {
      message: Schema.String,
    },
    success: Schema.Struct({ message: Schema.String }),
    failure: Schema.Unknown,
    failureMode: "error",
  });

  const toolkit = Tools.Toolkit.make(Explodes);
  const handlers = toolkit.of({
    explode: () => Effect.fail(new ExplosionError("boom")),
  });

  const tools = await runEffect(Mcp.toolsFromToolkit(toolkit, handlers));
  const tool = requireFirst(tools);

  const result = await invokeTool(tool, { message: "hi" });
  expect(result.isError).toBe(true);
  expect(result.structuredContent).toBeDefined();
  if (result.structuredContent) {
    expect(Object.getPrototypeOf(result.structuredContent)).toBe(Object.prototype);
  }
});
