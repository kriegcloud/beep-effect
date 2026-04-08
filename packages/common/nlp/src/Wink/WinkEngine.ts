/**
 * Wink runtime engine service.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/WinkEngine
 */

import { createRequire } from "node:module";
import { $NlpId } from "@beep/identity";
import { Clock, Context, Effect, Layer, pipe, Ref } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { AsHelpers, ItemToken, ItsHelpers, Model, Document as WinkDocument, WinkMethods } from "wink-nlp";
import { WinkEngineError, WinkEntityError, WinkTokenizationError } from "./WinkErrors.ts";
import { WinkEngineCustomEntities } from "./WinkPattern.ts";

const $I = $NlpId.create("Wink/WinkEngine");
const require = createRequire(import.meta.url);

type WinkEngineShape = {
  readonly as: Effect.Effect<AsHelpers, WinkEngineError>;
  readonly getRef: Effect.Effect<Ref.Ref<WinkEngineRuntimeState>>;
  readonly getWinkTokens: (text: string) => Effect.Effect<ReadonlyArray<ItemToken>, WinkTokenizationError>;
  readonly getWinkDoc: (text: string) => Effect.Effect<WinkDocument, WinkTokenizationError>;
  readonly getWinkTokenCount: (text: string) => Effect.Effect<number, WinkTokenizationError>;
  readonly getCurrentCustomEntities: Effect.Effect<O.Option<WinkEngineCustomEntities>>;
  readonly its: Effect.Effect<ItsHelpers, WinkEngineError>;
  readonly learnCustomEntities: (customEntities: WinkEngineCustomEntities) => Effect.Effect<void, WinkEntityError>;
};

type WinkCustomEntityRecord = {
  readonly mark?: readonly [number, number] | undefined;
  readonly name: string;
  readonly patterns: Array<string>;
};

/**
 * Branded runtime identifier for one live wink engine instance.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const InstanceId = S.NonEmptyString.pipe(
  S.brand("InstanceId"),
  S.annotate(
    $I.annote("InstanceId", {
      description: "Stable identifier for one live wink engine instance.",
    })
  )
);

/**
 * Runtime type for {@link InstanceId}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type InstanceId = typeof InstanceId.Type;

/**
 * Serializable wink engine state metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WinkEngineState extends S.Class<WinkEngineState>($I`WinkEngineState`)(
  {
    customEntities: S.OptionFromOptionalKey(WinkEngineCustomEntities),
    instanceId: InstanceId,
  },
  $I.annote("WinkEngineState", {
    description: "Serializable metadata describing one live wink engine instance.",
  })
) {}

/**
 * In-memory wink engine runtime state including the live wink runtime.
 *
 * @since 0.0.0
 * @category DomainModel
 */
// eslint-disable-next-line beep-laws/schema-first -- Runtime state carries a live wink handle and is tracked as an intentional inventory exception.
export type WinkEngineRuntimeState = {
  readonly customEntities: O.Option<WinkEngineCustomEntities>;
  readonly instanceId: InstanceId;
  readonly nlp: WinkMethods;
};

const loadWinkRuntime = (): WinkMethods => {
  const winkNlp: typeof import("wink-nlp").default = require("wink-nlp");
  const model: Model = require("wink-eng-lite-web-model");
  return winkNlp(model);
};

const nextInstanceId = (nowMs: number, counter: number): InstanceId =>
  InstanceId.make(`wink-engine-${nowMs}-${counter}`);

const toMark = (mark: readonly [number, number]): readonly [number, number] => [mark[0], mark[1]];

const copyCustomEntity = (entry: {
  readonly mark?: readonly [number, number] | undefined;
  readonly name: string;
  readonly patterns: Iterable<string>;
}): WinkCustomEntityRecord =>
  O.match(O.fromNullishOr(entry.mark), {
    onNone: () => ({
      name: entry.name,
      patterns: A.fromIterable(entry.patterns),
    }),
    onSome: (mark) => ({
      mark: toMark(mark),
      name: entry.name,
      patterns: A.fromIterable(entry.patterns),
    }),
  });

const copyCustomEntities = (customEntities: WinkEngineCustomEntities): Array<WinkCustomEntityRecord> =>
  pipe(customEntities.toWinkFormat(), A.map(copyCustomEntity));

const collectTokens = (state: WinkEngineRuntimeState, text: string): Array<ItemToken> => {
  const tokens: Array<ItemToken> = [];
  state.nlp
    .readDoc(text)
    .tokens()
    .each((token: ItemToken) => {
      tokens.push(token);
    });
  return tokens;
};

const makeWinkEngine = Effect.gen(function* () {
  const nlp = yield* Effect.try({
    try: loadWinkRuntime,
    catch: (cause) => WinkEngineError.fromCause(cause, "initialize"),
  });
  const instanceCounterRef = yield* Ref.make(0);
  const initialTimeMs = yield* Clock.currentTimeMillis;
  const stateRef = yield* Ref.make<WinkEngineRuntimeState>({
    customEntities: O.none(),
    instanceId: nextInstanceId(initialTimeMs, 0),
    nlp,
  });

  const allocateInstanceId = pipe(
    Ref.updateAndGet(instanceCounterRef, (current) => current + 1),
    Effect.flatMap((counter) => Effect.map(Clock.currentTimeMillis, (nowMs) => nextInstanceId(nowMs, counter)))
  );

  return WinkEngine.of({
    as: Ref.get(stateRef).pipe(Effect.map((state) => state.nlp.as)),
    getRef: Effect.succeed(stateRef),
    getWinkDoc: Effect.fn("Nlp.Wink.WinkEngine.getWinkDoc")(function* (text: string) {
      const state = yield* Ref.get(stateRef);
      return yield* Effect.try({
        try: () => state.nlp.readDoc(text),
        catch: (cause) => WinkTokenizationError.fromCause(cause, "readDoc", text),
      });
    }),
    getWinkTokens: Effect.fn("Nlp.Wink.WinkEngine.getWinkTokens")(function* (text: string) {
      const state = yield* Ref.get(stateRef);
      return yield* Effect.try({
        try: () => collectTokens(state, text),
        catch: (cause) => WinkTokenizationError.fromCause(cause, "tokens", text),
      });
    }),
    getWinkTokenCount: Effect.fn("Nlp.Wink.WinkEngine.getWinkTokenCount")(function* (text: string) {
      const state = yield* Ref.get(stateRef);
      return yield* Effect.try({
        try: () => state.nlp.readDoc(text).tokens().length(),
        catch: (cause) => WinkTokenizationError.fromCause(cause, "tokenCount", text),
      });
    }),
    getCurrentCustomEntities: Ref.get(stateRef).pipe(Effect.map((state) => state.customEntities)),
    its: Ref.get(stateRef).pipe(Effect.map((state) => state.nlp.its)),
    learnCustomEntities: Effect.fn("Nlp.Wink.WinkEngine.learnCustomEntities")(function* (
      customEntities: WinkEngineCustomEntities
    ) {
      const currentState = yield* Ref.get(stateRef);
      yield* Effect.try({
        try: () => {
          currentState.nlp.learnCustomEntities(copyCustomEntities(customEntities));
        },
        catch: (cause) => WinkEntityError.fromCause(cause, "learnCustomEntities", customEntities.name),
      });
      const instanceId = yield* allocateInstanceId;
      yield* Ref.set(stateRef, {
        customEntities: O.some(customEntities),
        instanceId,
        nlp: currentState.nlp,
      });
    }),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkEngine.make"));

/**
 * Wink engine service tag.
 *
 * @since 0.0.0
 * @category Services
 */
export class WinkEngine extends Context.Service<WinkEngine, WinkEngineShape>()($I`WinkEngine`) {}

/**
 * Live wink engine layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkEngineLive = Layer.effect(WinkEngine, makeWinkEngine);
