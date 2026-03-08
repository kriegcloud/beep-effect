/**
 * WinkEngine Service using WinkEngineRef for state management
 * @since 3.0.0
 */

import { Effect, Option, Ref } from "effect";
import type { Document, ItemToken } from "wink-nlp";
import type { WinkEngineCustomEntities } from "./WinkPattern.js";
import { WinkEngineRef } from "./WinkEngineRef.js";
import {
  type WinkError,
  WinkTokenizationError,
  WinkEntityError,
} from "./WinkErrors.js";

/**
 * WinkEngine Service using WinkEngineRef for state management
 */
export class WinkEngine extends Effect.Service<WinkEngine>()(
  "effect-nlp/WinkEngine",
  {
    effect: Effect.gen(function* () {
      const winkEngineRef = yield* WinkEngineRef;
      const stateRef = winkEngineRef.getRef();

      return {
        /**
         * Get the its helper for token/document properties
         */
        its: Ref.get(stateRef).pipe(Effect.map((state) => state.nlp.its)),

        /**
         * Get the as helper for collection reducers
         */
        as: Ref.get(stateRef).pipe(Effect.map((state) => state.nlp.as)),

        /**
         * Get wink document as Effect for safe access
         */
        getWinkDoc: (text: string): Effect.Effect<Document, WinkError> =>
          Effect.gen(function* () {
            const state = yield* Ref.get(stateRef);
            return yield* Effect.try({
              try: () => state.nlp.readDoc(text),
              catch: (error) => WinkTokenizationError.fromCause(error, text),
            });
          }),

        /**
         * Get raw tokens from wink
         */
        getWinkTokens: (
          text: string
        ): Effect.Effect<ReadonlyArray<ItemToken>, WinkError> =>
          Effect.gen(function* () {
            const state = yield* Ref.get(stateRef);
            return yield* Effect.try({
              try: () => {
                const doc = state.nlp.readDoc(text);
                const tokens: Array<ItemToken> = [];
                doc.tokens().each((token: ItemToken) => {
                  tokens.push(token);
                });
                return tokens as ReadonlyArray<ItemToken>;
              },
              catch: (error) => WinkTokenizationError.fromCause(error),
            });
          }),

        /**
         * Get token count
         */
        getWinkTokenCount: (text: string): Effect.Effect<number, WinkError> =>
          Effect.gen(function* () {
            const state = yield* Ref.get(stateRef);
            return yield* Effect.try({
              try: () => state.nlp.readDoc(text).tokens().length(),
              catch: (error) => WinkTokenizationError.fromCause(error),
            });
          }),

        /**
         * Learn custom entities into the nlp instance
         */
        learnCustomEntities: (
          customEntities: WinkEngineCustomEntities
        ): Effect.Effect<void, WinkError> =>
          Effect.gen(function* () {
            yield* winkEngineRef
              .updateWithCustomEntities(customEntities)
              .pipe(
                Effect.mapError((error) =>
                  WinkEntityError.fromCause(error, customEntities.name, "learn")
                )
              );

            yield* Effect.logInfo(
              `Learned ${customEntities.size()} custom entities`
            );
          }),

        /**
         * Get currently learned custom entities, if any
         */
        getCurrentCustomEntities: (): Effect.Effect<
          Option.Option<WinkEngineCustomEntities>
        > =>
          Ref.get(stateRef).pipe(
            Effect.map((state) =>
              state.customEntities === undefined
                ? Option.none()
                : Option.some(state.customEntities)
            )
          ),
      };
    }),
    dependencies: [WinkEngineRef.Default],
  }
) {}

/**
 * Live layer for WinkEngine
 */
export const WinkEngineLive = WinkEngine.Default;
