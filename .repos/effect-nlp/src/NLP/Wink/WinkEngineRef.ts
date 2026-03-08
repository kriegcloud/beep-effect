/**
 * WinkEngineRef Service - Manages shared wink-nlp state using Effect Ref
 * @since 3.0.0
 */

import { Effect, Ref, Schema, Hash } from "effect";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import type { WinkMethods } from "wink-nlp";
import { WinkEngineCustomEntities } from "./WinkPattern.js";
import {
  WinkMemoryError,
  WinkEntityError,
  type WinkError,
} from "./WinkErrors.js";

export type InstanceId = Schema.Schema.Type<typeof InstanceId>;
export const InstanceId = Schema.String.pipe(Schema.brand("InstanceId"));

export class WinkEngineState extends Schema.Class<WinkEngineState>(
  "WinkEngineState"
)({
  customEntities: Schema.optional(WinkEngineCustomEntities),
  instanceId: InstanceId,
}) {}

type WinkEngineRefState = WinkEngineState & { nlp: WinkMethods };

/**
 * Generate engine hash from custom entities
 */
const makeInstanceId = (
  customEntities?: WinkEngineCustomEntities
): InstanceId => {
  const hash = customEntities ? Hash.hash(customEntities) : Hash.hash("base");
  const id = `wink-engine-${hash}-${Date.now()}`;
  return InstanceId.make(id);
};

/**
 * WinkEngineRef Service - Single shared ref for wink-nlp state
 */
export class WinkEngineRef extends Effect.Service<WinkEngineRef>()(
  "effect-nlp/WinkEngineRef",
  {
    effect: Effect.gen(function* () {
      const nlp = yield* Effect.try({
        try: () => winkNLP(model),
        catch: (error) => {
          // Check if this is the memory limit error during initial creation
          if (WinkMemoryError.isMemoryLimitError(error)) {
            return WinkMemoryError.fromCause(error, 1); // First instance
          }
          // For other initialization errors, treat as entity error
          return WinkEntityError.fromCause(
            error,
            "initialization",
            "initialize"
          );
        },
      });

      const instanceId = makeInstanceId();

      const initialState: WinkEngineRefState = {
        customEntities: undefined,
        instanceId,
        nlp,
      };

      const stateRef = yield* Ref.make(initialState);

      return {
        /**
         * Get the current state ref
         */
        getRef: () => stateRef,

        /**
         * Update the ref with new custom entities (reuses existing nlp instance)
         */
        updateWithCustomEntities: (
          customEntities: WinkEngineCustomEntities
        ): Effect.Effect<WinkEngineRefState, WinkError> =>
          Effect.gen(function* () {
            const currentState = yield* Ref.get(stateRef);
            const existingNlp = currentState.nlp;
            const winkFormatEntities = customEntities.toWinkFormat();

            yield* Effect.try({
              try: () =>
                existingNlp.learnCustomEntities(
                  winkFormatEntities as Array<any>,
                  {
                    matchValue: false,
                    usePOS: true,
                    useEntity: true,
                  }
                ),
              catch: (error) => {
                // Check if this is the memory limit error
                if (WinkMemoryError.isMemoryLimitError(error)) {
                  return WinkMemoryError.fromCause(error);
                }
                // Otherwise, it's an entity learning error
                return WinkEntityError.fromCause(
                  error,
                  customEntities.name,
                  "learn"
                );
              },
            });

            const newInstanceId = makeInstanceId(customEntities);
            const newState: WinkEngineRefState = {
              customEntities,
              instanceId: newInstanceId,
              nlp: existingNlp, // Reuse the same nlp instance
            };

            yield* Ref.set(stateRef, newState);
            return newState;
          }),
      };
    }),
    dependencies: [],
  }
) {}

/**
 * Live layer for WinkEngineRef
 */
export const WinkEngineRefLive = WinkEngineRef.Default;
