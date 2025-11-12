import type {
  Any,
  Failure,
  FailureEncoded,
  HandleOutcome,
  Result,
  ResultEncoded,
  Success,
  SuccessEncoded,
} from "@beep/contract/ContractTypes";
import { BS } from "@beep/schema";
import type * as Effect from "effect/Effect";
import * as Match from "effect/Match";

/**
 * The strategy used for handling errors returned from contract call implementation
 * execution.
 *
 * If set to `"error"` (the default), errors that occur during contract call implementation
 * execution will be returned in the error channel of the calling effect.
 *
 * If set to `"return"`, errors that occur during contract call implementation execution
 * will be captured and returned as part of the contract call result.
 *
 * @since 1.0.0
 * @category Models
 */
export const FailureModeKit = BS.stringLiteralKit("error", "return");

const makeHandleOutcome = <C extends Any>(contract: C, input: FailureMode.MatchInput<C>): HandleOutcome<C> => {
  if (input.isFailure) {
    return {
      mode: FailureMode.Enum.return,
      _tag: "failure",
      result: input.result as Failure<C>,
      encodedResult: input.encodedResult as FailureEncoded<C>,
    };
  }
  return {
    mode: contract.failureMode === "return" ? FailureMode.Enum.return : FailureMode.Enum.error,
    _tag: "success",
    result: input.result as Success<C>,
    encodedResult: input.encodedResult as SuccessEncoded<C>,
  };
};

export class FailureMode extends FailureModeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/contract/Contract/FailureMode"),
  identifier: "FailureMode",
  title: "Failure Mode",
  description: "The strategy used for handling errors returned from contract call implementation execution.",
}) {
  static readonly Enum = FailureModeKit.Enum;
  static readonly Options = FailureModeKit.Options;
  static readonly $match =
    <C extends Any, E1, E2, R1, R2>(result: Result<C>) =>
    (
      contract: Any,
      cases: {
        onErrorMode: (result: Failure<C>) => Effect.Effect<
          {
            readonly _tag: "success";
            readonly value: Success<C>;
          },
          E1,
          R1
        >;
        onReturnMode: (result: Result<C>) => Effect.Effect<
          | { readonly _tag: "failure"; readonly value: Failure<C> }
          | {
              readonly _tag: "success";
              readonly value: Success<C>;
            },
          E2,
          R2
        >;
      }
    ) =>
      Match.value(contract.failureMode).pipe(
        Match.when(FailureMode.Enum.error, () => cases.onErrorMode(result)),
        Match.when(FailureMode.Enum.return, () => cases.onReturnMode(result)),
        Match.exhaustive
      );

  /**
   * Experimental helper that projects an implementation result into a discriminated
   * {@link HandleOutcome} using the configured failure mode.
   *
   * @since 1.0.0
   */
  static readonly matchOutcome = <C extends Any>(contract: C, input: FailureMode.MatchInput<C>): HandleOutcome<C> =>
    makeHandleOutcome(contract, input);
}

export declare namespace FailureMode {
  export type Type = typeof FailureMode.Type;
  export type Encoded = typeof FailureMode.Encoded;

  export interface MatchInput<C extends Any> {
    readonly isFailure: boolean;
    readonly result: Result<C>;
    readonly encodedResult: ResultEncoded<C>;
  }

  export type ErrorOutcome<C extends Any> = Extract<HandleOutcome<C>, { readonly mode: typeof FailureMode.Enum.error }>;
  export type ReturnOutcome<C extends Any> = Extract<
    HandleOutcome<C>,
    {
      readonly mode: typeof FailureMode.Enum.return;
    }
  >;
}
