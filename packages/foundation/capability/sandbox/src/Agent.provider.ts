/**
 * Agent provider contracts and built-in Claude/Codex providers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A, O, Str } from "@beep/utils";
import { Effect, pipe } from "effect";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $SandboxId.create("Agent.provider");

const shellEscape = (value: string): string => `'${Str.replaceAll("'", "'\\''")(value)}'`;

const TOOL_ARG_FIELDS: Readonly<Record<string, string>> = {
  Agent: "description",
  Bash: "command",
  WebFetch: "url",
  WebSearch: "query",
};

const ClaudeContentBlockType = LiteralKit(["text", "tool_use"]).annotate(
  $I.annote("ClaudeContentBlockType", {
    description: "Claude stream content block discriminator.",
  })
);

const ClaudeContentBlock = ClaudeContentBlockType.toTaggedUnion("type")({
  text: {
    text: S.String,
  },
  tool_use: {
    input: S.Record(S.String, S.Unknown),
    name: S.String,
  },
}).pipe(
  $I.annoteSchema("ClaudeContentBlock", {
    description: "Claude assistant content block decoded from a JSON stream line.",
  })
);

type ClaudeContentBlock = typeof ClaudeContentBlock.Type;
type ClaudeToolUseBlock = Extract<
  ClaudeContentBlock,
  {
    readonly type: "tool_use";
  }
>;

class ClaudeUsage extends S.Class<ClaudeUsage>($I`ClaudeUsage`)(
  {
    cache_creation_input_tokens: S.Number,
    cache_read_input_tokens: S.Number,
    input_tokens: S.Number,
    output_tokens: S.Number,
  },
  $I.annote("ClaudeUsage", {
    description: "Claude token usage payload decoded from a JSON stream line.",
  })
) {}

class ClaudeMessage extends S.Class<ClaudeMessage>($I`ClaudeMessage`)(
  {
    content: S.Array(ClaudeContentBlock),
    usage: S.optionalKey(ClaudeUsage),
  },
  $I.annote("ClaudeMessage", {
    description: "Claude assistant message payload decoded from a JSON stream line.",
  })
) {}

const ClaudeStreamLineType = LiteralKit(["assistant", "result", "system"]).annotate(
  $I.annote("ClaudeStreamLineType", {
    description: "Claude stream line discriminator.",
  })
);

const ClaudeStreamLine = ClaudeStreamLineType.toTaggedUnion("type")({
  assistant: {
    message: ClaudeMessage,
  },
  result: {
    result: S.String,
  },
  system: {
    session_id: S.optionalKey(S.String),
    subtype: S.optionalKey(S.String),
  },
}).pipe(
  $I.annoteSchema("ClaudeStreamLine", {
    description: "Claude JSON stream line schema.",
  })
);

type ClaudeStreamLine = typeof ClaudeStreamLine.Type;
type ClaudeAssistantStreamLine = Extract<
  ClaudeStreamLine,
  {
    readonly type: "assistant";
  }
>;

const CodexItemType = LiteralKit(["agent_message", "command_execution"]).annotate(
  $I.annote("CodexItemType", {
    description: "Codex stream item discriminator.",
  })
);

const CodexItem = CodexItemType.toTaggedUnion("type")({
  agent_message: {
    text: S.String,
  },
  command_execution: {
    command: S.String,
  },
}).pipe(
  $I.annoteSchema("CodexItem", {
    description: "Codex stream item decoded from a JSON stream line.",
  })
);

class CodexErrorMessagePayload extends S.Class<CodexErrorMessagePayload>($I`CodexErrorMessagePayload`)(
  {
    message: S.String,
  },
  $I.annote("CodexErrorMessagePayload", {
    description: "Codex object-shaped error payload decoded from a JSON stream line.",
  })
) {}

const CodexErrorPayload = S.Union([S.String, CodexErrorMessagePayload]).pipe(
  $I.annoteSchema("CodexErrorPayload", {
    description: "Codex error payload decoded from a JSON stream line.",
  })
);

type CodexErrorPayload = typeof CodexErrorPayload.Type;

const CodexStreamLineType = LiteralKit(["item.completed", "item.started", "error"]).annotate(
  $I.annote("CodexStreamLineType", {
    description: "Codex stream line discriminator.",
  })
);

const CodexStreamLine = CodexStreamLineType.toTaggedUnion("type")({
  "item.completed": {
    item: CodexItem,
  },
  "item.started": {
    item: CodexItem,
  },
  error: {
    error: S.optionalKey(CodexErrorPayload),
    message: S.optionalKey(S.String),
  },
}).pipe(
  $I.annoteSchema("CodexStreamLine", {
    description: "Codex JSON stream line schema.",
  })
);

type CodexStreamLine = typeof CodexStreamLine.Type;
type CodexErrorStreamLine = Extract<
  CodexStreamLine,
  {
    readonly type: "error";
  }
>;

const PiAssistantMessageEventType = LiteralKit(["text_delta"]).annotate(
  $I.annote("PiAssistantMessageEventType", {
    description: "Pi assistant message event discriminator.",
  })
);

class PiAssistantMessageEvent extends S.Class<PiAssistantMessageEvent>($I`PiAssistantMessageEvent`)(
  {
    delta: S.optionalKey(S.String),
    type: PiAssistantMessageEventType,
  },
  $I.annote("PiAssistantMessageEvent", {
    description: "Pi assistant message update event decoded from a JSON stream line.",
  })
) {}

class PiMessageContentBlock extends S.Class<PiMessageContentBlock>($I`PiMessageContentBlock`)(
  {
    text: S.optionalKey(S.String),
    type: S.String,
  },
  $I.annote("PiMessageContentBlock", {
    description: "Pi final message content block decoded from a JSON stream line.",
  })
) {}

class PiAgentEndMessage extends S.Class<PiAgentEndMessage>($I`PiAgentEndMessage`)(
  {
    content: S.Array(PiMessageContentBlock),
    role: S.String,
  },
  $I.annote("PiAgentEndMessage", {
    description: "Pi final agent-end message decoded from a JSON stream line.",
  })
) {}

const PiStreamLineType = LiteralKit([
  "agent_end",
  "agent_error",
  "error",
  "message_update",
  "tool_execution_start",
]).annotate(
  $I.annote("PiStreamLineType", {
    description: "Pi stream line discriminator.",
  })
);

const PiStreamLine = PiStreamLineType.toTaggedUnion("type")({
  agent_end: {
    messages: S.Array(PiAgentEndMessage),
  },
  agent_error: {
    error: S.optionalKey(CodexErrorPayload),
    message: S.optionalKey(S.String),
  },
  error: {
    error: S.optionalKey(CodexErrorPayload),
    message: S.optionalKey(S.String),
  },
  message_update: {
    assistantMessageEvent: PiAssistantMessageEvent,
  },
  tool_execution_start: {
    args: S.optionalKey(S.Record(S.String, S.Unknown)),
    toolName: S.String,
  },
}).pipe(
  $I.annoteSchema("PiStreamLine", {
    description: "Pi JSON stream line schema.",
  })
);

type PiStreamLine = typeof PiStreamLine.Type;
type PiErrorStreamLine = Extract<
  PiStreamLine,
  {
    readonly type: "agent_error" | "error";
  }
>;
type PiToolExecutionStartStreamLine = Extract<
  PiStreamLine,
  {
    readonly type: "tool_execution_start";
  }
>;

const decodeClaudeJsonLine = S.decodeUnknownOption(S.fromJsonString(ClaudeStreamLine));
const decodeCodexJsonLine = S.decodeUnknownOption(S.fromJsonString(CodexStreamLine));
const decodePiJsonLine = S.decodeUnknownOption(S.fromJsonString(PiStreamLine));

const claudeUsageToIterationUsage = (usage: ClaudeUsage): IterationUsage =>
  new IterationUsage({
    cacheCreationInputTokens: usage.cache_creation_input_tokens,
    cacheReadInputTokens: usage.cache_read_input_tokens,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
  });

const codexErrorPayloadMessage = (payload: CodexErrorPayload): string =>
  P.isString(payload) ? payload : payload.message;

const streamErrorMessage = (line: CodexErrorStreamLine | PiErrorStreamLine): O.Option<string> =>
  pipe(
    O.fromUndefinedOr(line.error),
    O.map(codexErrorPayloadMessage),
    O.orElse(() => O.fromUndefinedOr(line.message))
  );

const claudeToolCallEvent = (block: ClaudeToolUseBlock): O.Option<ParsedStreamEvent> => {
  const argField = TOOL_ARG_FIELDS[block.name];

  if (argField === undefined) {
    return O.none();
  }

  return pipe(
    block.input,
    R.get(argField),
    O.filter(P.isString),
    O.map(
      (args): ParsedStreamEvent => ({
        _tag: "ToolCall",
        args,
        name: block.name,
      })
    )
  );
};

const piToolCallEvent = (line: PiToolExecutionStartStreamLine): O.Option<ParsedStreamEvent> => {
  const argField = TOOL_ARG_FIELDS[line.toolName];

  if (argField === undefined || line.args === undefined) {
    return O.none();
  }

  return pipe(
    line.args,
    R.get(argField),
    O.filter(P.isString),
    O.map(
      (args): ParsedStreamEvent => ({
        _tag: "ToolCall",
        args,
        name: line.toolName,
      })
    )
  );
};

/**
 * Parsed event emitted by an agent stream line.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ParsedStreamEvent = S.TaggedUnion({
  Result: {
    result: S.String,
  },
  SessionId: {
    sessionId: S.String,
  },
  Text: {
    text: S.String,
  },
  ToolCall: {
    args: S.String,
    name: S.String,
  },
}).pipe(
  $I.annoteSchema("ParsedStreamEvent", {
    description: "Parsed event emitted by an agent stream line.",
  })
);

/**
 * Runtime type for {@link ParsedStreamEvent}.
 *
 * @category models
 * @since 0.0.0
 */
export type ParsedStreamEvent = typeof ParsedStreamEvent.Type;

/**
 * Reasoning effort accepted by the Codex provider.
 *
 * @category schemas
 * @since 0.0.0
 */
export const CodexEffort = LiteralKit(["low", "medium", "high", "xhigh"]).annotate(
  $I.annote("CodexEffort", {
    description: "Reasoning effort accepted by the Codex provider.",
  })
);

/**
 * Runtime type for {@link CodexEffort}.
 *
 * @category models
 * @since 0.0.0
 */
export type CodexEffort = typeof CodexEffort.Type;

/**
 * Reasoning effort accepted by the Claude Code provider.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ClaudeEffort = LiteralKit(["low", "medium", "high", "max"]).annotate(
  $I.annote("ClaudeEffort", {
    description: "Reasoning effort accepted by the Claude Code provider.",
  })
);

/**
 * Runtime type for {@link ClaudeEffort}.
 *
 * @category models
 * @since 0.0.0
 */
export type ClaudeEffort = typeof ClaudeEffort.Type;

/**
 * Options passed when building an agent command.
 *
 * @category models
 * @since 0.0.0
 */
export class AgentCommandOptions extends S.Class<AgentCommandOptions>($I`AgentCommandOptions`)(
  {
    dangerouslySkipPermissions: S.Boolean,
    prompt: S.String,
    resumeSession: S.optionalKey(S.String),
  },
  $I.annote("AgentCommandOptions", {
    description: "Options passed when building an agent command.",
  })
) {}

/**
 * Command emitted by an agent provider.
 *
 * @category models
 * @since 0.0.0
 */
export class PrintCommand extends S.Class<PrintCommand>($I`PrintCommand`)(
  {
    command: S.String,
    stdin: S.optionalKey(S.String),
  },
  $I.annote("PrintCommand", {
    description: "Command emitted by an agent provider.",
  })
) {}

/**
 * Token usage snapshot extracted from an agent session.
 *
 * @category models
 * @since 0.0.0
 */
export class IterationUsage extends S.Class<IterationUsage>($I`IterationUsage`)(
  {
    cacheCreationInputTokens: S.Number,
    cacheReadInputTokens: S.Number,
    inputTokens: S.Number,
    outputTokens: S.Number,
  },
  $I.annote("IterationUsage", {
    description: "Token usage snapshot extracted from an agent session.",
  })
) {}

/**
 * Options for the Codex provider.
 *
 * @category models
 * @since 0.0.0
 */
export class CodexOptions extends S.Class<CodexOptions>($I`CodexOptions`)(
  {
    effort: S.optionalKey(CodexEffort),
    env: S.Record(S.String, S.String).pipe(S.withConstructorDefault(Effect.succeed({}))),
  },
  $I.annote("CodexOptions", {
    description: "Options for the Codex provider.",
  })
) {}

/**
 * Options for the Pi provider.
 *
 * @category models
 * @since 0.0.0
 */
export class PiOptions extends S.Class<PiOptions>($I`PiOptions`)(
  {
    env: S.Record(S.String, S.String).pipe(S.withConstructorDefault(Effect.succeed({}))),
  },
  $I.annote("PiOptions", {
    description: "Options for the Pi provider.",
  })
) {}

/**
 * Options for the OpenCode provider.
 *
 * @category models
 * @since 0.0.0
 */
export class OpenCodeOptions extends S.Class<OpenCodeOptions>($I`OpenCodeOptions`)(
  {
    env: S.Record(S.String, S.String).pipe(S.withConstructorDefault(Effect.succeed({}))),
  },
  $I.annote("OpenCodeOptions", {
    description: "Options for the OpenCode provider.",
  })
) {}

/**
 * Options for the Claude Code provider.
 *
 * @category models
 * @since 0.0.0
 */
export class ClaudeCodeOptions extends S.Class<ClaudeCodeOptions>($I`ClaudeCodeOptions`)(
  {
    captureSessions: S.Boolean.pipe(S.withConstructorDefault(Effect.succeed(true))),
    effort: S.optionalKey(ClaudeEffort),
    env: S.Record(S.String, S.String).pipe(S.withConstructorDefault(Effect.succeed({}))),
  },
  $I.annote("ClaudeCodeOptions", {
    description: "Options for the Claude Code provider.",
  })
) {}

/**
 * Effect-first agent provider contract.
 *
 * @category services
 * @since 0.0.0
 */
export interface AgentProvider {
  readonly buildInteractiveArgs?: undefined | ((options: AgentCommandOptions) => ReadonlyArray<string>);
  readonly buildPrintCommand: (options: AgentCommandOptions) => PrintCommand;
  readonly captureSessions: boolean;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
  readonly parseSessionUsage?: undefined | ((content: string) => O.Option<IterationUsage>);
  readonly parseStreamLine: (line: string) => ReadonlyArray<ParsedStreamEvent>;
}

/**
 * Default Claude model used by the source Sandcastle implementation.
 *
 * @category utilities
 * @since 0.0.0
 */
export const DEFAULT_CLAUDE_MODEL = "claude-opus-4-6" as const;

const parseClaudeStreamLine = (line: string): ReadonlyArray<ParsedStreamEvent> => {
  const empty = A.empty<ParsedStreamEvent>();
  if (!Str.startsWith("{")(line)) {
    return empty;
  }

  const parsed = decodeClaudeJsonLine(line);
  if (O.isNone(parsed)) {
    return empty;
  }

  if (parsed.value.type === "assistant") {
    const events = A.empty<ParsedStreamEvent>();
    const texts = A.empty<string>();

    for (const block of parsed.value.message.content) {
      if (block.type === "text") {
        A.appendInPlace(texts, block.text);
        continue;
      }

      const toolCall = claudeToolCallEvent(block);
      if (O.isSome(toolCall)) {
        if (texts.length > 0) {
          A.appendInPlace(
            events,
            ParsedStreamEvent.cases.Text.make({
              text: A.join(texts, ""),
            })
          );
          texts.length = 0;
        }
        A.appendInPlace(events, toolCall.value);
      }
    }

    if (texts.length > 0) {
      A.appendInPlace(
        events,
        ParsedStreamEvent.cases.Text.make({
          text: A.join(texts, ""),
        })
      );
    }

    return events;
  }

  if (parsed.value.type === "result") {
    return [
      ParsedStreamEvent.cases.Result.make({
        result: parsed.value.result,
      }),
    ];
  }

  if (parsed.value.type === "system") {
    if (parsed.value.subtype === "init" && parsed.value.session_id !== undefined) {
      return [
        ParsedStreamEvent.cases.SessionId.make({
          sessionId: parsed.value.session_id,
        }),
      ];
    }
  }

  return empty;
};

const parseCodexStreamLine = (line: string): ReadonlyArray<ParsedStreamEvent> => {
  const empty = A.empty<ParsedStreamEvent>();
  if (!Str.startsWith("{")(line)) {
    return empty;
  }

  const parsed = decodeCodexJsonLine(line);
  if (O.isNone(parsed)) {
    return empty;
  }

  if (parsed.value.type === "item.completed") {
    if (parsed.value.item.type === "agent_message") {
      return [
        ParsedStreamEvent.cases.Text.make({
          text: parsed.value.item.text,
        }),
        ParsedStreamEvent.cases.Result.make({
          result: parsed.value.item.text,
        }),
      ];
    }
  }

  if (parsed.value.type === "item.started") {
    if (parsed.value.item.type === "command_execution") {
      return [
        ParsedStreamEvent.cases.ToolCall.make({
          args: parsed.value.item.command,
          name: "Bash",
        }),
      ];
    }
  }

  if (parsed.value.type === "error") {
    return pipe(
      streamErrorMessage(parsed.value),
      O.map(
        (result): ReadonlyArray<ParsedStreamEvent> => [
          ParsedStreamEvent.cases.Result.make({
            result,
          }),
        ]
      ),
      O.getOrElse(A.empty<ParsedStreamEvent>)
    );
  }

  return A.empty<ParsedStreamEvent>();
};

const parsePiStreamLine = (line: string): ReadonlyArray<ParsedStreamEvent> => {
  const empty = A.empty<ParsedStreamEvent>();
  if (!Str.startsWith("{")(line)) {
    return empty;
  }

  const parsed = decodePiJsonLine(line);
  if (O.isNone(parsed)) {
    return empty;
  }

  if (parsed.value.type === "message_update") {
    return pipe(
      O.fromUndefinedOr(parsed.value.assistantMessageEvent.delta),
      O.map(
        (text): ReadonlyArray<ParsedStreamEvent> => [
          ParsedStreamEvent.cases.Text.make({
            text,
          }),
        ]
      ),
      O.getOrElse(A.empty<ParsedStreamEvent>)
    );
  }

  if (parsed.value.type === "tool_execution_start") {
    return pipe(
      piToolCallEvent(parsed.value),
      O.map((event): ReadonlyArray<ParsedStreamEvent> => [event]),
      O.getOrElse(A.empty<ParsedStreamEvent>)
    );
  }

  if (parsed.value.type === "agent_error" || parsed.value.type === "error") {
    return pipe(
      streamErrorMessage(parsed.value),
      O.map(
        (result): ReadonlyArray<ParsedStreamEvent> => [
          ParsedStreamEvent.cases.Result.make({
            result,
          }),
        ]
      ),
      O.getOrElse(A.empty<ParsedStreamEvent>)
    );
  }

  if (parsed.value.type === "agent_end") {
    const finalAssistantMessage = pipe(
      parsed.value.messages,
      A.reverse,
      A.findFirst((message) => message.role === "assistant")
    );

    if (O.isNone(finalAssistantMessage)) {
      return empty;
    }

    const texts = pipe(
      finalAssistantMessage.value.content,
      A.flatMap(
        (block): ReadonlyArray<string> => (block.type === "text" && block.text !== undefined ? [block.text] : [])
      )
    );

    return texts.length > 0
      ? [
          ParsedStreamEvent.cases.Result.make({
            result: A.join(texts, ""),
          }),
        ]
      : empty;
  }

  return empty;
};

const parseClaudeSessionUsage = (content: string): O.Option<IterationUsage> =>
  pipe(
    Str.split("\n")(content),
    A.filter(Str.startsWith("{")),
    A.reverse,
    A.map((line) =>
      pipe(
        decodeClaudeJsonLine(line),
        O.filter((event): event is ClaudeAssistantStreamLine => event.type === "assistant"),
        O.flatMap((event) => O.fromUndefinedOr(event.message.usage)),
        O.map(claudeUsageToIterationUsage)
      )
    ),
    A.filter(O.isSome),
    A.map((option) => option.value),
    A.head
  );

/**
 * Create a Codex agent provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const codex = (model: string, options: CodexOptions = new CodexOptions({})): AgentProvider => ({
  buildInteractiveArgs: ({ prompt }) =>
    prompt.length > 0 ? ["codex", "--model", model, prompt] : ["codex", "--model", model],
  buildPrintCommand: ({ prompt }) => {
    const effortFlag =
      options.effort === undefined ? "" : ` -c ${shellEscape(`model_reasoning_effort="${options.effort}"`)}`;

    return new PrintCommand({
      command: `codex exec --json --dangerously-bypass-approvals-and-sandbox -m ${shellEscape(model)}${effortFlag}`,
      stdin: prompt,
    });
  },
  captureSessions: false,
  env: options.env,
  name: "codex",
  parseStreamLine: parseCodexStreamLine,
});

/**
 * Create a Pi agent provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const pi = (model: string, options: PiOptions = new PiOptions({})): AgentProvider => ({
  buildInteractiveArgs: ({ prompt }) =>
    prompt.length > 0 ? ["pi", "--model", model, prompt] : ["pi", "--model", model],
  buildPrintCommand: ({ prompt }) =>
    new PrintCommand({
      command: `pi -p --mode json --no-session --model ${shellEscape(model)}`,
      stdin: prompt,
    }),
  captureSessions: false,
  env: options.env,
  name: "pi",
  parseStreamLine: parsePiStreamLine,
});

/**
 * Create an OpenCode agent provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const opencode = (model: string, options: OpenCodeOptions = new OpenCodeOptions({})): AgentProvider => ({
  buildInteractiveArgs: ({ prompt }) =>
    prompt.length > 0 ? ["opencode", "--model", model, "-p", prompt] : ["opencode", "--model", model],
  buildPrintCommand: ({ prompt }) =>
    new PrintCommand({
      command: `opencode run --model ${shellEscape(model)} ${shellEscape(prompt)}`,
    }),
  captureSessions: false,
  env: options.env,
  name: "opencode",
  parseStreamLine: A.empty<ParsedStreamEvent>,
});

/**
 * Create a Claude Code agent provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const claudeCode = (
  model: string = DEFAULT_CLAUDE_MODEL,
  options: ClaudeCodeOptions = new ClaudeCodeOptions({})
): AgentProvider => ({
  buildInteractiveArgs: ({ dangerouslySkipPermissions, prompt }) => [
    "claude",
    ...(dangerouslySkipPermissions ? ["--dangerously-skip-permissions"] : []),
    "--model",
    model,
    ...(options.effort === undefined ? [] : ["--effort", options.effort]),
    ...(prompt.length > 0 ? [prompt] : []),
  ],
  buildPrintCommand: ({ dangerouslySkipPermissions, prompt, resumeSession }) => {
    const skipPermissions = dangerouslySkipPermissions ? " --dangerously-skip-permissions" : "";
    const effortFlag = options.effort === undefined ? "" : ` --effort ${options.effort}`;
    const resumeFlag = resumeSession === undefined ? "" : ` --resume ${shellEscape(resumeSession)}`;

    return new PrintCommand({
      command: `claude --print --verbose${skipPermissions} --output-format stream-json --model ${shellEscape(
        model
      )}${effortFlag}${resumeFlag} -p -`,
      stdin: prompt,
    });
  },
  captureSessions: options.captureSessions,
  env: options.env,
  name: "claude-code",
  parseSessionUsage: parseClaudeSessionUsage,
  parseStreamLine: parseClaudeStreamLine,
});
