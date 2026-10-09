/**
 * Protected disposable trial TrialUsage operations.
 * @packageDocumentation
 * @since 0.0.0
 */
import { NativeTokenUsage } from "@beep/repo-ai-metrics/usage";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  TrialNativeUsageSample,
  TrialSessionIdentity,
  TrialUsageReport,
} from "../AgentEffectiveness.trials.schemas.ts";
import type { TrialArtifact, TrialProvider } from "../AgentEffectiveness.trials.schemas.ts";

// Structs here describe permissive upstream wire envelopes, not internal models.
const OptionalUnknown = S.Unknown.pipe(S.OptionFromOptionalKey);
const Event = S.Struct({
  type: S.NonEmptyString,
  model: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
  effort: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
  usage: OptionalUnknown,
  modelUsage: OptionalUnknown,
  item: OptionalUnknown,
  message: OptionalUnknown,
  toolName: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
  is_error: S.Boolean.pipe(S.OptionFromOptionalKey),
  num_turns: S.Natural.pipe(S.OptionFromOptionalKey),
});
const OptionalCount = S.Natural.pipe(S.OptionFromOptionalKey);
const Usage = S.Struct({
  input_tokens: OptionalCount,
  output_tokens: OptionalCount,
  cached_input_tokens: OptionalCount,
  cache_read_input_tokens: OptionalCount,
  cache_write_input_tokens: OptionalCount,
  cache_creation_input_tokens: OptionalCount,
  reasoning_output_tokens: OptionalCount,
  reasoning_tokens: OptionalCount,
  output_tokens_details: S.Struct({ thinking_tokens: OptionalCount }).pipe(S.OptionFromOptionalKey),
});
const CodexTool = S.Struct({
  type: S.NonEmptyString,
  tool: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
  server: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
});
const ClaudeMessage = S.Struct({
  model: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
  content: S.Array(S.Struct({ type: S.NonEmptyString, name: S.NonEmptyString.pipe(S.OptionFromOptionalKey) })),
});
const ModelUsage = S.Record(S.String, S.Struct({ modelCalls: OptionalCount }));
const decodeEvent = S.decodeUnknownResult(S.fromJsonString(Event));
const decodeUsage = S.decodeUnknownOption(Usage);
const decodeCodexTool = S.decodeUnknownOption(CodexTool);
const decodeClaudeMessage = S.decodeUnknownOption(ClaudeMessage);

const eventToolNames = (provider: TrialProvider, event: typeof Event.Type): ReadonlyArray<string> =>
  Match.value(provider).pipe(
    Match.when("codex", () =>
      event.type === "item.completed"
        ? pipe(
            O.toArray(O.flatMap(event.item, decodeCodexTool)),
            A.flatMap((item) =>
              Match.value(item.type).pipe(
                Match.when("mcp_tool_call", () =>
                  O.toArray(
                    O.map(
                      O.all({ server: item.server, tool: item.tool }),
                      ({ server, tool }) => `mcp__${server}__${tool}`
                    )
                  )
                ),
                Match.when("command_execution", () => ["command_execution"]),
                Match.orElse(() => [])
              )
            )
          )
        : []
    ),
    Match.when("claude", () =>
      event.type === "assistant"
        ? pipe(
            O.toArray(O.flatMap(event.message, decodeClaudeMessage)),
            A.flatMap((message) =>
              A.flatMap(message.content, (block) => (block.type === "tool_use" ? O.toArray(block.name) : []))
            )
          )
        : []
    ),
    Match.when("grok", () => (event.type === "tool_call" ? O.toArray(event.toolName) : [])),
    Match.exhaustive
  );

const emptyUsage = () =>
  NativeTokenUsage.make({
    inputTokens: O.none(),
    outputTokens: O.none(),
    cacheReadInputTokens: O.none(),
    cacheWriteInputTokens: O.none(),
    reasoningOutputTokens: O.none(),
    requestCount: O.none(),
    turnCount: O.none(),
    inputAccounting: "unknown",
    observedScope: "host",
    childCoverage: "unknown",
    aggregateBasis: "unavailable",
  });

const normalizedUsage = (provider: TrialProvider, event: typeof Event.Type): O.Option<NativeTokenUsage> =>
  O.map(O.flatMap(event.usage, decodeUsage), (u) =>
    NativeTokenUsage.make({
      inputTokens: u.input_tokens,
      outputTokens: u.output_tokens,
      cacheReadInputTokens: provider === "codex" ? u.cached_input_tokens : u.cache_read_input_tokens,
      cacheWriteInputTokens: provider === "codex" ? u.cache_write_input_tokens : u.cache_creation_input_tokens,
      reasoningOutputTokens:
        provider === "codex"
          ? u.reasoning_output_tokens
          : provider === "claude"
            ? O.flatMap(u.output_tokens_details, (details) => details.thinking_tokens)
            : u.reasoning_tokens,
      requestCount:
        provider === "grok"
          ? O.flatMap(event.modelUsage, (native) =>
              O.flatMap(S.decodeUnknownOption(ModelUsage)(native), (models) =>
                A.isReadonlyArrayEmpty(R.values(models))
                  ? O.none()
                  : O.map(O.all(A.map(R.values(models), (v) => v.modelCalls)), (counts) =>
                      A.reduce(counts, 0, (a, b) => a + b)
                    )
              )
            )
          : O.none(),
      turnCount: provider === "codex" ? O.some(1) : event.num_turns,
      inputAccounting: provider === "codex" ? "includes-cache" : "excludes-cache",
      observedScope: "host",
      childCoverage: "unknown",
      aggregateBasis: provider === "codex" ? "additive-turn-totals" : "terminal-cumulative",
    })
  );

const addKnown = (a: O.Option<number>, b: O.Option<number>) => O.map(O.all([a, b]), ([x, y]) => x + y);
const sumUsage = (a: NativeTokenUsage, b: NativeTokenUsage) =>
  NativeTokenUsage.make({
    inputTokens: addKnown(a.inputTokens, b.inputTokens),
    outputTokens: addKnown(a.outputTokens, b.outputTokens),
    cacheReadInputTokens: addKnown(a.cacheReadInputTokens, b.cacheReadInputTokens),
    cacheWriteInputTokens: addKnown(a.cacheWriteInputTokens, b.cacheWriteInputTokens),
    reasoningOutputTokens: addKnown(a.reasoningOutputTokens, b.reasoningOutputTokens),
    requestCount: addKnown(a.requestCount, b.requestCount),
    turnCount: addKnown(a.turnCount, b.turnCount),
    inputAccounting: a.inputAccounting,
    observedScope: a.observedScope,
    childCoverage: a.childCoverage,
    aggregateBasis: a.aggregateBasis,
  });

/**
 * Decode native JSONL without mixing per-request samples and terminal totals.
 * **Details**
 * Codex turn totals are additive; Claude result and Grok end already aggregate
 * their request samples. A malformed/truncated/error stream retains samples but
 * cannot expose complete totals or native adoption counts. Shell and skill
 * invocations are not attributed from command substrings: CLI adoption and the
 * combined selected-tool count remain unknown. Child usage is unavailable.
 * **Example** (Parse an empty interrupted stream)
 * ```ts
 * import { parseTrialUsage } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * const result = Effect.runSync(parseTrialUsage("codex", "", []))
 * console.log(result.coverage) // missing-terminal
 * ```
 * @category parsing
 * @since 0.0.0
 */
export const parseTrialUsage = Effect.fn("AgentEffectiveness.parseTrialUsage")(function* (
  provider: TrialProvider,
  text: string,
  selectedToolNames: ReadonlyArray<string>
) {
  const lines = A.filter(Str.split(text, "\n"), Str.isNonEmpty);
  const decoded = A.map(lines, (line) => decodeEvent(line));
  const malformedLines = A.getSomes(
    A.map(decoded, (result, index) => (Result.isFailure(result) ? O.some(index + 1) : O.none()))
  );
  const events = A.getSuccesses(decoded);
  const terminalType = Match.value(provider).pipe(
    Match.when("codex", () => "turn.completed"),
    Match.when("claude", () => "result"),
    Match.when("grok", () => "end"),
    Match.exhaustive
  );
  const terminals = A.filter(events, (e) => e.type === terminalType);
  const providerError = A.some(
    events,
    (e) => O.getOrElse(e.is_error, () => false) || A.contains(["error", "turn.failed"], e.type)
  );
  const invalidUsage = A.some(terminals, (e) => O.isNone(normalizedUsage(provider, e)));
  const coverage =
    A.isReadonlyArrayNonEmpty(malformedLines) || invalidUsage
      ? "malformed"
      : providerError
        ? "provider-error"
        : A.isReadonlyArrayEmpty(terminals)
          ? "missing-terminal"
          : provider !== "codex" && A.length(terminals) !== 1
            ? "ambiguous-terminal"
            : "complete";
  const totals = A.getSomes(A.map(terminals, (e) => normalizedUsage(provider, e)));
  const usage =
    coverage === "complete"
      ? A.match(totals, {
          onEmpty: emptyUsage,
          onNonEmpty: (all) => A.reduce(A.drop(all, 1), A.headNonEmpty(all), sumUsage),
        })
      : emptyUsage();
  const toolNames = A.flatMap(events, (event) => eventToolNames(provider, event));
  const samples = A.getSomes(
    A.map(decoded, (result, index) =>
      O.flatMap(Result.getSuccess(result), (e) =>
        O.map(e.usage, (native) => TrialNativeUsageSample.make({ line: index + 1, event: e.type, native }))
      )
    )
  );
  const positioned = A.getSomes(
    A.map(decoded, (result, index) => O.map(Result.getSuccess(result), (event) => ({ event, line: index + 1 })))
  );
  const hostModels = A.flatMap(positioned, ({ event, line }) => {
    const top = A.map(O.toArray(event.model), (model) => ({ model, line, source: `${event.type}.model` }));
    const assistant =
      provider === "claude" && event.type === "assistant"
        ? A.map(
            O.toArray(O.flatMap(O.flatMap(event.message, decodeClaudeMessage), (message) => message.model)),
            (model) => ({ model, line, source: "assistant.message.model" })
          )
        : [];
    const terminalModels =
      provider !== "codex" && event.type === terminalType
        ? O.getOrElse(O.flatMap(event.modelUsage, S.decodeUnknownOption(S.Record(S.String, S.Unknown))), () => ({}))
        : {};
    return [
      ...top,
      ...assistant,
      ...A.map(R.keys(terminalModels), (model) => ({ model, line, source: `${terminalType}.modelUsage` })),
    ];
  });
  const hostEfforts = A.flatMap(positioned, ({ event, line }) =>
    A.map(O.toArray(event.effort), (effort) => ({ effort, line, source: `${event.type}.effort` }))
  );
  return TrialUsageReport.make({
    provider,
    coverage,
    usage,
    eventCount: A.length(events),
    malformedLines,
    toolNames,
    selectedToolCalls: O.none(),
    nativeSelectedToolCalls:
      coverage === "complete"
        ? O.some(A.length(A.filter(toolNames, (name) => A.contains(selectedToolNames, name))))
        : O.none(),
    cliSelectedToolCalls: O.none(),
    adoptionCoverage: coverage === "complete" ? "native-only" : "unavailable",
    childUsage: "unavailable",
    hostModels,
    hostEfforts,
    identityCoverage: A.isReadonlyArrayNonEmpty(hostModels)
      ? A.isReadonlyArrayNonEmpty(hostEfforts)
        ? "model-and-effort"
        : "model-only"
      : "unknown",
    samples,
  });
});

const SessionEnvelope = S.Struct({
  type: S.String.pipe(S.OptionFromOptionalKey),
  payload: OptionalUnknown,
  message: OptionalUnknown,
  current_model_id: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
  reasoning_effort: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
});
const TurnIdentity = S.Struct({ model: S.NonEmptyString, effort: S.NonEmptyString.pipe(S.OptionFromOptionalKey) });
const GrokChildLink = S.Struct({
  subagent_id: S.NonEmptyString,
  parent_session_id: S.NonEmptyString,
  effective_model_id: S.NonEmptyString.pipe(S.OptionFromOptionalKey),
});
const ClaudeIdentity = S.Struct({ model: S.NonEmptyString });
const ChildMetadata = S.Struct({
  source: S.Struct({ subagent: S.Struct({ thread_spawn: S.Struct({ parent_thread_id: S.NonEmptyString }) }) }),
});

/**
 * Project only model and effort fields from private native session artifacts.
 * **Example** (Preserve absent observations)
 * ```ts
 * import { parseTrialSessionIdentity } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.runSync(parseTrialSessionIdentity("codex", [])).childCoverage) // unknown
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const parseTrialSessionIdentity = Effect.fn("parseTrialSessionIdentity")(function* (
  provider: TrialProvider,
  sources: ReadonlyArray<{ artifact: TrialArtifact; relativePath: string; raw: string }>
) {
  const observations: Array<TrialSessionIdentity["observations"][number]> = [];
  let malformedLines = 0;
  const grokLinks =
    provider === "grok"
      ? sources.flatMap((source) => O.toArray(S.decodeOption(S.fromJsonString(GrokChildLink))(source.raw)))
      : [];
  for (const source of sources) {
    if (provider === "grok" && source.relativePath.endsWith("/meta.json")) {
      const link = S.decodeOption(S.fromJsonString(GrokChildLink))(source.raw);
      if (O.isSome(link) && O.isSome(link.value.effective_model_id))
        observations.push({
          artifactDigest: source.artifact.digest,
          line: 1,
          model: link.value.effective_model_id,
          effort: O.none(),
          scope: "child",
          layer: "selected-session-metadata",
        });
    }
    const rows = (provider === "grok" ? [source.raw] : Str.split("\n")(source.raw)).filter(
      (line) => Str.trim(line) !== ""
    );
    const envelopes = rows.map((line) => S.decodeOption(S.fromJsonString(SessionEnvelope))(line));
    malformedLines += envelopes.filter(O.isNone).length;
    const child =
      provider === "claude"
        ? source.relativePath.includes("/subagents/")
        : envelopes.some(
            (row) =>
              O.isSome(row) &&
              O.isSome(row.value.payload) &&
              O.isSome(S.decodeUnknownOption(ChildMetadata)(row.value.payload.value))
          );
    const scope = child
      ? "child"
      : provider === "grok"
        ? grokLinks.some((link) => source.relativePath.endsWith(`/${link.subagent_id}/summary.json`))
          ? "child"
          : grokLinks.some((link) => source.relativePath.endsWith(`/${link.parent_session_id}/summary.json`))
            ? "host"
            : "unknown"
        : provider === "codex" &&
            !envelopes.some((row) => O.isSome(row) && O.getOrNull(row.value.type) === "session_meta")
          ? "unknown"
          : "host";
    for (const [index, row] of envelopes.entries()) {
      if (O.isNone(row)) continue;
      const event = row.value;
      if (provider === "codex" && O.getOrNull(event.type) === "turn_context" && O.isSome(event.payload)) {
        const identity = S.decodeUnknownOption(TurnIdentity)(event.payload.value);
        if (O.isSome(identity))
          observations.push({
            artifactDigest: source.artifact.digest,
            line: index + 1,
            model: O.some(identity.value.model),
            effort: identity.value.effort,
            scope,
            layer: "selected-turn-context",
          });
      }
      if (provider === "claude" && O.getOrNull(event.type) === "assistant" && O.isSome(event.message)) {
        const identity = S.decodeUnknownOption(ClaudeIdentity)(event.message.value);
        if (O.isSome(identity))
          observations.push({
            artifactDigest: source.artifact.digest,
            line: index + 1,
            model: O.some(identity.value.model),
            effort: O.none(),
            scope,
            layer: "provider-message",
          });
      }
      if (provider === "grok" && O.isSome(event.current_model_id))
        observations.push({
          artifactDigest: source.artifact.digest,
          line: index + 1,
          model: event.current_model_id,
          effort: event.reasoning_effort,
          scope,
          layer: "selected-session-metadata",
        });
    }
  }
  return TrialSessionIdentity.make({
    artifacts: sources.map((source) => source.artifact),
    observations,
    malformedLines,
    childCoverage: "unknown",
  });
});
