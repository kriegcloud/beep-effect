/**
 * @module @beep/ai-sdk/codex/Service
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Struct, thunkEmptyRecord } from "@beep/utils";
import {
  Codex,
  type CodexOptions as SdkCodexOptions,
  type Input as SdkInput,
  type Thread as SdkThread,
  type ThreadOptions as SdkThreadOptions,
  type TurnOptions as SdkTurnOptions,
  type UserInput as SdkUserInput,
} from "@openai/codex-sdk";
import { Effect, Layer, pipe, Redacted, Ref, SchemaParser, Semaphore, ServiceMap, Stream } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { type CodexConfigObject, type CodexConfigValue, CodexOptions } from "./codexOptions.ts";
import { type ThreadEvent, ThreadEvent as ThreadEventSchema } from "./events.js";
import { type Input, type RunResult, RunResult as RunResultSchema, type UserInput } from "./thread.js";
import { ThreadOptions } from "./threadOptions.ts";
import type { TurnOptions } from "./turnOptions.ts";

const $I = $AiSdkId.create("codex/Service");
const RunResultDecoder = S.make<S.Decoder<RunResult>>(RunResultSchema.ast);
const ThreadEventDecoder = S.make<S.Decoder<ThreadEvent>>(ThreadEventSchema.ast);
type SdkCodexConfigObject = NonNullable<SdkCodexOptions["config"]>;
type SdkCodexConfigValue = SdkCodexConfigObject[string];

const toTransportError: {
  (message: string): (cause: unknown) => CodexTransportError;
  (cause: unknown, message: string): CodexTransportError;
} = dual(2, (cause: unknown, message: string) => CodexTransportError.make(message, cause));

const toDecodeError: {
  (message: string): (input: unknown) => (cause: unknown) => CodexDecodeError;
  (input: unknown, message: string): (cause: unknown) => CodexDecodeError;
} = dual(
  2,
  (input: unknown, message: string) => (cause: unknown) =>
    CodexDecodeError.make({
      message,
      input,
      cause,
    })
);

const sdkPromise: {
  <A>(message: string): (f: () => Promise<A>) => Effect.Effect<A, CodexTransportError>;
  <A>(f: () => Promise<A>, message: string): Effect.Effect<A, CodexTransportError>;
} = dual(2, <A>(f: () => Promise<A>, message: string) =>
  Effect.tryPromise({
    try: f,
    catch: toTransportError(message),
  })
);

const sdkSync: {
  <A>(message: string): (f: () => A) => Effect.Effect<A, CodexTransportError>;
  <A>(f: () => A, message: string): Effect.Effect<A, CodexTransportError>;
} = dual(2, <A>(f: () => A, message: string) =>
  Effect.try({
    try: f,
    catch: toTransportError(message),
  })
);

const normalizeRunResult = (input: unknown) =>
  Effect.tryPromise({
    try: () => SchemaParser.decodeUnknownPromise(RunResultDecoder)(input),
    catch: toDecodeError("Failed to normalize Codex run result")(input),
  });

const normalizeThreadEvent = (input: unknown) =>
  Effect.tryPromise({
    try: () => SchemaParser.decodeUnknownPromise(ThreadEventDecoder)(input),
    catch: toDecodeError("Failed to normalize Codex thread event")(input),
  });

const isCodexConfigArray = (value: CodexConfigValue): value is ReadonlyArray<CodexConfigValue> => A.isArray(value);

const toSdkCodexConfigEntry = (key: string, value: CodexConfigValue): readonly [string, SdkCodexConfigValue] => [
  key,
  toSdkCodexConfigValue(value),
];

const toSdkCodexConfigObject = (config: CodexConfigObject): SdkCodexConfigObject =>
  R.fromEntries(R.collect(config, toSdkCodexConfigEntry));

const toSdkCodexConfigValue = (value: CodexConfigValue): SdkCodexConfigValue => {
  if (P.isString(value) || P.isNumber(value) || P.isBoolean(value)) {
    return value;
  }

  return isCodexConfigArray(value) ? A.map(value, toSdkCodexConfigValue) : toSdkCodexConfigObject(value);
};

const toMutableStringRecordEntry = (key: string, value: string): readonly [string, string] => [key, value];

const toMutableStringRecord = (record: { readonly [key: string]: string }): Record<string, string> =>
  R.fromEntries(R.collect(record, toMutableStringRecordEntry));

const toSdkCodexOptions = (options: CodexOptions): SdkCodexOptions => ({
  ...O.match(options.codexPathOverride, {
    onNone: thunkEmptyRecord,
    onSome: (codexPathOverride) => ({ codexPathOverride }),
  }),
  ...O.match(options.baseUrl, {
    onNone: thunkEmptyRecord,
    onSome: (baseUrl) => ({ baseUrl: baseUrl.toString() }),
  }),
  ...O.match(options.apiKey, {
    onNone: thunkEmptyRecord,
    onSome: (apiKey) => ({ apiKey: Redacted.value(apiKey) }),
  }),
  ...O.match(options.config, {
    onNone: thunkEmptyRecord,
    onSome: (config) => ({ config: toSdkCodexConfigObject(config) }),
  }),
  ...O.match(options.env, {
    onNone: thunkEmptyRecord,
    onSome: (env) => ({ env: toMutableStringRecord(env) }),
  }),
});

const toSdkThreadOptions = (options: ThreadOptions): SdkThreadOptions => ({
  ...O.match(options.model, {
    onNone: thunkEmptyRecord,
    onSome: (model) => ({ model }),
  }),
  ...O.match(options.sandboxMode, {
    onNone: thunkEmptyRecord,
    onSome: (sandboxMode) => ({ sandboxMode }),
  }),
  ...O.match(options.workingDirectory, {
    onNone: thunkEmptyRecord,
    onSome: (workingDirectory) => ({ workingDirectory }),
  }),
  ...O.match(options.skipGitRepoCheck, {
    onNone: thunkEmptyRecord,
    onSome: (skipGitRepoCheck) => ({ skipGitRepoCheck }),
  }),
  ...O.match(options.modelReasoningEffort, {
    onNone: thunkEmptyRecord,
    onSome: (modelReasoningEffort) => ({ modelReasoningEffort }),
  }),
  ...O.match(options.networkAccessEnabled, {
    onNone: thunkEmptyRecord,
    onSome: (networkAccessEnabled) => ({ networkAccessEnabled }),
  }),
  ...O.match(options.webSearchMode, {
    onNone: thunkEmptyRecord,
    onSome: (webSearchMode) => ({ webSearchMode }),
  }),
  ...O.match(options.approvalPolicy, {
    onNone: thunkEmptyRecord,
    onSome: (approvalPolicy) => ({ approvalPolicy }),
  }),
  ...O.match(options.additionalDirectories, {
    onNone: thunkEmptyRecord,
    onSome: (additionalDirectories) => ({ additionalDirectories: A.fromIterable(additionalDirectories) }),
  }),
});

const toSdkTurnOptions = (options: TurnOptions): SdkTurnOptions => ({
  ...O.match(options.outputSchema, {
    onNone: thunkEmptyRecord,
    onSome: (outputSchema) => ({ outputSchema }),
  }),
  ...O.match(options.signal, {
    onNone: thunkEmptyRecord,
    onSome: (signal) => ({ signal }),
  }),
});

const toSdkThreadOptionsOrUndefined = (options?: undefined | ThreadOptions) =>
  pipe(options, O.fromNullishOr, O.map(toSdkThreadOptions), O.getOrUndefined);

const toSdkTurnOptionsOrUndefined = (options?: undefined | TurnOptions) =>
  pipe(options, O.fromNullishOr, O.map(toSdkTurnOptions), O.getOrUndefined);

const toSdkUserInput = (input: UserInput): SdkUserInput =>
  input.type === "text" ? { type: "text", text: input.text } : { type: "local_image", path: input.path };

const toSdkInput = (input: Input): SdkInput =>
  P.isString(input) ? input : A.map(A.fromIterable(input), toSdkUserInput);

const createThread = (codex: Codex, threadOptions?: undefined | SdkThreadOptions, threadId?: undefined | string) =>
  threadId === undefined
    ? sdkSync(() => codex.startThread(threadOptions), "Failed to start Codex thread")
    : sdkSync(() => codex.resumeThread(threadId, threadOptions), `Failed to resume Codex thread ${threadId}`);

/**
 * Inputs used to construct a live Codex service instance.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class MakeOptions extends S.Class<MakeOptions>($I`MakeOptions`)({
  client: S.OptionFromOptionalKey(CodexOptions),
  thread: S.OptionFromOptionalKey(ThreadOptions),
  threadId: S.OptionFromOptionalKey(S.String),
}) {}

/**
 * Transport failures raised by the underlying Codex SDK or CLI process.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CodexTransportError extends TaggedErrorClass<CodexTransportError>($I`CodexTransportError`)(
  "CodexTransportError",
  {
    message: S.String,
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("CodexTransportError", {
    description: "Raised when the underlying Codex SDK or CLI process fails.",
  })
) {
  static readonly make = (message: string, cause?: unknown) =>
    new CodexTransportError({
      message,
      cause,
    });
}

/**
 * Decode failures raised while normalizing Codex SDK payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CodexDecodeError extends TaggedErrorClass<CodexDecodeError>($I`CodexDecodeError`)(
  "CodexDecodeError",
  {
    message: S.String,
    input: S.optional(S.Unknown),
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("CodexDecodeError", {
    description: "Raised when Codex SDK payloads fail schema normalization.",
  })
) {
  static readonly make = (params: Pick<CodexDecodeError, "message" | "input" | "cause">) =>
    new CodexDecodeError(params);
}

/**
 * Union of public Codex service errors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CodexServiceError = CodexTransportError | CodexDecodeError;

/**
 * @since 0.0.0
 * @category PortContract
 */
export interface CodexServiceShape {
  readonly resumeThread: (
    threadId: string,
    threadOptions?: undefined | ThreadOptions
  ) => Effect.Effect<void, CodexTransportError>;
  readonly run: (input: Input, turnOptions?: undefined | TurnOptions) => Effect.Effect<RunResult, CodexServiceError>;
  readonly runStreamed: (
    input: Input,
    turnOptions?: undefined | TurnOptions
  ) => Stream.Stream<ThreadEvent, CodexServiceError>;
  readonly startThread: (threadOptions?: undefined | ThreadOptions) => Effect.Effect<void, CodexTransportError>;
  readonly threadId: Effect.Effect<string | null>;
}

/**
 * Effect wrapper around the Codex SDK's single-thread conversational model.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class CodexService extends ServiceMap.Service<CodexService, CodexServiceShape>()($I`CodexService`) {}

/**
 * Constructs a live Codex service with one active thread.
 *
 * The service starts a fresh thread by default, or resumes an existing thread
 * when `threadId` is provided.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const make = Effect.fn("CodexService.make")(function* (options?: undefined | MakeOptions) {
  const codex = pipe(
    options,
    O.fromNullishOr,
    O.flatMap(Struct.get("client")),
    O.match({
      onNone: () => new Codex(),
      onSome: (client) => new Codex(toSdkCodexOptions(client)),
    })
  );

  const defaultThreadOptions = pipe(
    options,
    O.fromNullishOr,
    O.flatMap(Struct.get("thread")),
    O.map(toSdkThreadOptions),
    O.getOrUndefined
  );
  const defaultThreadId = pipe(options, O.fromNullishOr, O.flatMap(Struct.get("threadId")), O.getOrUndefined);
  const threadRef = yield* Ref.make<SdkThread>(yield* createThread(codex, defaultThreadOptions, defaultThreadId));
  const turnSemaphore = yield* Semaphore.make(1);

  const startThread = Effect.fn("CodexService.startThread")((threadOptions?: undefined | ThreadOptions) =>
    turnSemaphore.withPermits(1)(
      createThread(codex, toSdkThreadOptionsOrUndefined(threadOptions) ?? defaultThreadOptions).pipe(
        Effect.flatMap((thread) => Ref.set(threadRef, thread))
      )
    )
  );

  const resumeThread = Effect.fn("CodexService.resumeThread")(
    (threadId: string, threadOptions?: undefined | ThreadOptions) =>
      turnSemaphore.withPermits(1)(
        createThread(codex, toSdkThreadOptionsOrUndefined(threadOptions) ?? defaultThreadOptions, threadId).pipe(
          Effect.flatMap((thread) => Ref.set(threadRef, thread))
        )
      )
  );

  const run = Effect.fn("CodexService.run")((input: Input, turnOptions?: undefined | TurnOptions) =>
    turnSemaphore.withPermits(1)(
      Ref.get(threadRef).pipe(
        Effect.flatMap((thread) =>
          sdkPromise(
            () => thread.run(toSdkInput(input), toSdkTurnOptionsOrUndefined(turnOptions)),
            "Failed to run Codex turn"
          )
        ),
        Effect.flatMap(normalizeRunResult)
      )
    )
  );

  const runStreamed = (input: Input, turnOptions?: undefined | TurnOptions) =>
    Stream.unwrap(
      Effect.uninterruptibleMask((restore) =>
        Effect.gen(function* () {
          yield* restore(turnSemaphore.take(1));
          yield* Effect.addFinalizer(() => turnSemaphore.release(1));
          const thread = yield* Ref.get(threadRef);
          const { events } = yield* sdkPromise(
            () => thread.runStreamed(toSdkInput(input), toSdkTurnOptionsOrUndefined(turnOptions)),
            "Failed to start Codex streamed turn"
          );
          return Stream.fromAsyncIterable(events, toTransportError("Codex thread stream failed")).pipe(
            Stream.mapEffect(normalizeThreadEvent)
          );
        })
      )
    );

  return CodexService.of({
    startThread,
    resumeThread,
    run,
    runStreamed,
    threadId: Ref.get(threadRef).pipe(Effect.map(Struct.get("id"))),
  });
});

/**
 * Live Codex service layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const layer = (options?: MakeOptions) => Layer.effect(CodexService, make(options));
