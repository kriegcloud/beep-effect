import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import { ContractError } from "../contract-error";
import type {
  Any,
  Failure,
  HandleOutcome,
  ImplementationResult,
  Payload,
  Requirements,
  ResultEncoded,
  Success,
} from "./types";
import { FailureMode } from "./types";

export interface LiftOptions<C extends Any> {
  readonly method: (payload: Payload<C>) => Effect.Effect<ImplementationResult<C>, Failure<C>, Requirements<C>>;
  readonly onFailure?: undefined | ((failure: Failure<C>) => Effect.Effect<void, never, never>);
  readonly onSuccess?: undefined | ((success: Success<C>) => Effect.Effect<void, never, never>);
  readonly onDefect?: undefined | ((cause: Cause.Cause<unknown>) => Effect.Effect<void, never, never>);
}

export interface LiftedContract<C extends Any> {
  readonly result: (
    payload: Payload<C>
  ) => Effect.Effect<HandleOutcome<C>, Failure<C> | ContractError.UnknownError, Requirements<C>>;
  readonly success: (
    payload: Payload<C>
  ) => Effect.Effect<Success<C>, Failure<C> | ContractError.UnknownError, Requirements<C>>;
}

export const lift = <const C extends Any>(contract: C, options: LiftOptions<C>): LiftedContract<C> => {
  const { method, onFailure, onSuccess, onDefect } = options;

  const annotateOutcome = (outcome: HandleOutcome<C>) =>
    Match.value(outcome).pipe(
      Match.tagsExhaustive({
        success: (successOutcome) =>
          onSuccess
            ? Effect.flatMap(onSuccess(successOutcome.result), () => Effect.succeed(successOutcome))
            : Effect.succeed(successOutcome),
        failure: (failureOutcome) =>
          onFailure
            ? Effect.flatMap(onFailure(failureOutcome.result), () => Effect.succeed(failureOutcome))
            : Effect.succeed(failureOutcome),
      })
    );

  const defectToUnknown = (cause: Cause.Cause<unknown>) =>
    Effect.gen(function* () {
      if (onDefect) {
        yield* onDefect(cause);
      }
      return yield* Effect.fail(
        new ContractError.UnknownError({
          module: contract.name,
          method: contract.name,
          description: "Contract implementation raised an unexpected defect.",
          cause: Cause.squash(cause),
        })
      );
    });

  const toOutcome = (implResult: ImplementationResult<C>) =>
    annotateOutcome(
      FailureMode.matchOutcome(contract, {
        isFailure: implResult.isFailure,
        result: implResult.result,
        encodedResult: implResult.encodedResult as ResultEncoded<C>,
      })
    );

  const liftedResult = (payload: Payload<C>) =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(method(payload));
      return yield* Exit.matchEffect(exit, {
        onFailure: (cause) =>
          O.match(Cause.failureOption(cause), {
            onNone: () => defectToUnknown(cause),
            onSome: (failure) =>
              Effect.gen(function* () {
                if (onFailure) {
                  yield* onFailure(failure);
                }
                return yield* Effect.fail(failure);
              }),
          }),
        onSuccess: (implResult) => toOutcome(implResult),
      });
    });

  const liftedSuccess = (payload: Payload<C>) =>
    Effect.flatMap(liftedResult(payload), (outcome) =>
      Match.value(outcome).pipe(
        Match.tagsExhaustive({
          success: (successOutcome) => Effect.succeed(successOutcome.result),
          failure: (failureOutcome) => Effect.fail(failureOutcome.result),
        })
      )
    );

  return {
    result: liftedResult,
    success: liftedSuccess,
  } as const;
};
