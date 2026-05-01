/**
 * Agent provider contracts and built-in Claude/Codex providers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A, O } from "@beep/utils";
import { Effect, pipe } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SandboxId.create("Agent.provider");
const UnknownArray = S.Array(S.Unknown);
const isUnknownArray = S.is(UnknownArray);

const decodeJsonLine = S.decodeUnknownOption(S.UnknownFromJsonString);

const shellEscape = (value: string): string => `'${value.replaceAll("'", "'\\''")}'`;

const TOOL_ARG_FIELDS: Readonly<Record<string, string>> = {
  Agent: "description",
  Bash: "command",
  WebFetch: "url",
  WebSearch: "query",
};

const asObject = (value: unknown): O.Option<object> => O.liftPredicate(P.isObject)(value);

const property = (value: object, key: string): unknown => Reflect.get(value, key);

const stringProperty = (value: object, key: string): O.Option<string> =>
  pipe(property(value, key), O.liftPredicate(P.isString));

const numberProperty = (value: object, key: string): O.Option<number> =>
  pipe(property(value, key), O.liftPredicate(P.isNumber));

const objectProperty = (value: object, key: string): O.Option<object> => pipe(property(value, key), asObject);

const arrayProperty = (value: object, key: string): O.Option<ReadonlyArray<unknown>> =>
  pipe(property(value, key), O.liftPredicate(isUnknownArray));

const extractErrorMessage = (value: object): O.Option<string> =>
  pipe(
    stringProperty(value, "error"),
    O.orElse(() =>
      pipe(
        objectProperty(value, "error"),
        O.flatMap((error) => stringProperty(error, "message"))
      )
    ),
    O.orElse(() => stringProperty(value, "message"))
  );

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
export const CodexEffort = LiteralKit(["low", "medium", "high", "xhigh"]).pipe(
  $I.annoteSchema("CodexEffort", {
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
export const ClaudeEffort = LiteralKit(["low", "medium", "high", "max"]).pipe(
  $I.annoteSchema("ClaudeEffort", {
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
  readonly buildInteractiveArgs?: (options: AgentCommandOptions) => ReadonlyArray<string>;
  readonly buildPrintCommand: (options: AgentCommandOptions) => PrintCommand;
  readonly captureSessions: boolean;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
  readonly parseSessionUsage?: (content: string) => O.Option<IterationUsage>;
  readonly parseStreamLine: (line: string) => ReadonlyArray<ParsedStreamEvent>;
}

/**
 * Default Claude model used by the source Sandcastle implementation.
 *
 * @category configuration
 * @since 0.0.0
 */
export const DEFAULT_CLAUDE_MODEL = "claude-opus-4-6" as const;

const parseClaudeStreamLine = (line: string): ReadonlyArray<ParsedStreamEvent> => {
  if (!Str.startsWith("{")(line)) {
    return [];
  }

  const parsed = pipe(decodeJsonLine(line), O.flatMap(asObject));
  if (O.isNone(parsed)) {
    return [];
  }

  const value = parsed.value;
  const type = stringProperty(value, "type");
  if (O.isSome(type) && type.value === "assistant") {
    const content = pipe(
      objectProperty(value, "message"),
      O.flatMap((message) => arrayProperty(message, "content"))
    );
    if (O.isNone(content)) {
      return [];
    }

    const events: Array<ParsedStreamEvent> = [];
    const texts: Array<string> = [];

    for (const blockValue of content.value) {
      const block = asObject(blockValue);
      if (O.isNone(block)) {
        continue;
      }
      const blockType = stringProperty(block.value, "type");
      if (O.isSome(blockType) && blockType.value === "text") {
        const text = stringProperty(block.value, "text");
        if (O.isSome(text)) {
          texts.push(text.value);
        }
        continue;
      }
      if (O.isSome(blockType) && blockType.value === "tool_use") {
        const name = stringProperty(block.value, "name");
        const input = objectProperty(block.value, "input");
        if (O.isNone(name) || O.isNone(input)) {
          continue;
        }
        const argField = TOOL_ARG_FIELDS[name.value];
        if (argField === undefined) {
          continue;
        }
        const argValue = stringProperty(input.value, argField);
        if (O.isNone(argValue)) {
          continue;
        }
        if (texts.length > 0) {
          events.push({ _tag: "Text", text: texts.join("") });
          texts.length = 0;
        }
        events.push({ _tag: "ToolCall", args: argValue.value, name: name.value });
      }
    }

    if (texts.length > 0) {
      events.push({ _tag: "Text", text: texts.join("") });
    }

    return events;
  }

  if (O.isSome(type) && type.value === "result") {
    return pipe(
      stringProperty(value, "result"),
      O.map((result): ReadonlyArray<ParsedStreamEvent> => [{ _tag: "Result", result }]),
      O.getOrElse((): ReadonlyArray<ParsedStreamEvent> => [])
    );
  }

  if (O.isSome(type) && type.value === "system") {
    const subtype = stringProperty(value, "subtype");
    const sessionId = stringProperty(value, "session_id");

    if (O.isSome(subtype) && subtype.value === "init" && O.isSome(sessionId)) {
      return [{ _tag: "SessionId", sessionId: sessionId.value }];
    }
  }

  return [];
};

const parseCodexStreamLine = (line: string): ReadonlyArray<ParsedStreamEvent> => {
  if (!Str.startsWith("{")(line)) {
    return [];
  }

  const parsed = pipe(decodeJsonLine(line), O.flatMap(asObject));
  if (O.isNone(parsed)) {
    return [];
  }

  const value = parsed.value;
  const type = stringProperty(value, "type");

  if (O.isSome(type) && type.value === "item.completed") {
    const item = objectProperty(value, "item");
    if (O.isSome(item)) {
      const itemType = stringProperty(item.value, "type");
      const text = stringProperty(item.value, "text");
      if (O.isSome(itemType) && itemType.value === "agent_message" && O.isSome(text)) {
        return [
          { _tag: "Text", text: text.value },
          { _tag: "Result", result: text.value },
        ];
      }
    }
  }

  if (O.isSome(type) && type.value === "item.started") {
    const item = objectProperty(value, "item");
    if (O.isSome(item)) {
      const itemType = stringProperty(item.value, "type");
      const command = stringProperty(item.value, "command");
      if (O.isSome(itemType) && itemType.value === "command_execution" && O.isSome(command)) {
        return [{ _tag: "ToolCall", args: command.value, name: "Bash" }];
      }
    }
  }

  if (O.isSome(type) && type.value === "error") {
    return pipe(
      extractErrorMessage(value),
      O.map((result): ReadonlyArray<ParsedStreamEvent> => [{ _tag: "Result", result }]),
      O.getOrElse((): ReadonlyArray<ParsedStreamEvent> => [])
    );
  }

  return [];
};

const parseClaudeSessionUsage = (content: string): O.Option<IterationUsage> =>
  pipe(
    Str.split("\n")(content),
    A.filter(Str.startsWith("{")),
    A.reverse,
    A.findFirst((line) => {
      const parsed = pipe(decodeJsonLine(line), O.flatMap(asObject));
      if (O.isNone(parsed)) {
        return false;
      }
      const type = stringProperty(parsed.value, "type");
      const message = objectProperty(parsed.value, "message");
      return (
        O.isSome(type) &&
        type.value === "assistant" &&
        O.isSome(message) &&
        O.isSome(objectProperty(message.value, "usage"))
      );
    }),
    O.flatMap((line) => pipe(decodeJsonLine(line), O.flatMap(asObject))),
    O.flatMap((value) => objectProperty(value, "message")),
    O.flatMap((message) => objectProperty(message, "usage")),
    O.flatMap((usage) =>
      pipe(
        O.all({
          cacheCreationInputTokens: numberProperty(usage, "cache_creation_input_tokens"),
          cacheReadInputTokens: numberProperty(usage, "cache_read_input_tokens"),
          inputTokens: numberProperty(usage, "input_tokens"),
          outputTokens: numberProperty(usage, "output_tokens"),
        }),
        O.map((values) => new IterationUsage(values))
      )
    )
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
      command: `claude --print --verbose${skipPermissions} --output-format stream-json --model ${shellEscape(model)}${effortFlag}${resumeFlag} -p -`,
      stdin: prompt,
    });
  },
  captureSessions: options.captureSessions,
  env: options.env,
  name: "claude-code",
  parseSessionUsage: parseClaudeSessionUsage,
  parseStreamLine: parseClaudeStreamLine,
});
