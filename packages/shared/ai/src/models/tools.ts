import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/tools");

export class ToolDefinitionFunction extends S.Class<ToolDefinitionFunction>($I`ToolDefinitionFunction`)(
  {
    name: S.String,
    description: S.String,
    parameters: BS.Json,
  },
  $I.annotations("ToolDefinitionFunction", {
    description: "ToolDefinitionFunction",
  })
) {}

export class ToolDefinition extends S.TaggedClass<ToolDefinition>($I`ToolDefinition`)(
  "function",
  {
    function: ToolDefinitionFunction,
  },
  $I.annotations("ToolDefinition", {
    description: "ToolDefinition",
  })
) {}

export class ToolCallFunction extends S.Class<ToolCallFunction>($I`ToolCallFunction`)(
  {
    name: S.String,
    arguments: S.String,
  },
  $I.annotations("ToolCallFunction", {
    description: "ToolCallFunction",
  })
) {}

export class ToolCall extends S.TaggedClass<ToolCall>($I`ToolCall`)(
  "function",
  {
    id: S.String,
    function: ToolCallFunction,
    thoughtSignature: S.optionalWith(S.String, { as: "Option" }).pipe(S.fromKey("thought_signature")),
  },
  $I.annotations("ToolCall", {
    description: "ToolCall",
  })
) {}

export class ToolCallResult extends S.Class<ToolCallResult>($I`ToolCallResult`)(
  {
    toolCallId: S.String,
    role: S.tag("tool"),
    name: S.String,
    content: S.String,
  },
  $I.annotations("ToolCallResult", {
    description: "ToolCallResult",
  })
) {}

export class ToolExecutionResult extends S.Class<ToolExecutionResult>($I`ToolExecutionResult`)(
  {
    success: S.Boolean,
    result: S.Unknown,
    error: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("ToolExecutionResult", {
    description: "ToolExecutionResult",
  })
) {}

export class ToolCategory extends S.Class<ToolCategory>($I`ToolCategory`)(
  {
    id: S.String,
    displayName: S.String,
  },
  $I.annotations("ToolCategory", {
    description: "ToolCategory",
  })
) {}

export class ToolExecutionContext extends S.Struct(
  {
    agentId: S.String,
    conversationId: S.optionalWith(S.String, { as: "Option" }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("ToolExecutionContext", {
    description: "ToolExecutionContext",
  })
) {}

export declare namespace ToolExecutionContext {
  export type Type = typeof ToolExecutionContext.Type;
}
