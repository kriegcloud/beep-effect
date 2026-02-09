import {$SemanticWebId} from "@beep/identity/packages";
import {BS} from "@beep/schema";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as Match from "effect/Match";

const $I = $SemanticWebId.create("idna/errors");

/**
 * Error types that can be thrown by the idna implementation
 */
export class ErrorType extends BS.StringLiteralKit(
  "overflow",
  "not-basic",
  "invalid-input",
).annotations(
  $I.annotations("ErrorType", {
    description: "Error types that can be thrown by the idna implementation"
  })
) {
  /**
 * Error messages for each error type
 */
  static readonly MESSAGES = {
    overflow: "Overflow: input needs wider integers to process",
    ["not-basic" as const]: "Illegal input >= 0x80 (not a basic code point)",
    ["invalid-input" as const]: "Invalid input",
  };
}

export declare namespace ErrorType {
  export type Type = typeof ErrorType.Type;
  export type Encoded = typeof ErrorType.Encoded;
}

export class OverFlowError extends S.TaggedError<OverFlowError>($I`OverFlowError`)(
  ErrorType.Enum.overflow,
  {
    input: S.Unknown,
  },
  $I.annotations("OverFlowError", {
    description: "Overflow error"
  })
) {
  override get message() {
    return ErrorType.MESSAGES[this._tag];
  }
}

export class NotBasicError extends S.TaggedError<NotBasicError>($I`NotBasicError`)(
  ErrorType.Enum["not-basic"],
  {
    input: S.Unknown,

  },
  $I.annotations("NotBasicError", {
    description: "Not basic error"
  })
) {
  override get message() {
    return ErrorType.MESSAGES[this._tag];
  }
}

export class InvalidInputError extends S.TaggedError<InvalidInputError>($I`InvalidInputError`)(
  ErrorType.Enum["invalid-input"],
  {
    input: S.Unknown,
  },
  $I.annotations("InvalidInputError", {
    description: "Invalid input error"
  })
) {
  override get message() {
    return ErrorType.MESSAGES[this._tag];
  }
}


export class IDNAError extends S.Union(
  OverFlowError,
  NotBasicError,
  InvalidInputError
).annotations(
  $I.annotations("IDNAError", {
    description: "IDNA error"
  })
) {
  static readonly new: {
    (errorType: ErrorType.Type, input: unknown): OverFlowError | NotBasicError | InvalidInputError;
    (input: unknown): (errorType: ErrorType.Type) => OverFlowError | NotBasicError | InvalidInputError;
  } = F.dual(
    (args: IArguments) => S.is(ErrorType)(args[0]),
    (errorType: ErrorType.Type, input: unknown) => {
      const param = {input};

      return Match.type<ErrorType.Type>().pipe(
        Match.when(ErrorType.Enum.overflow, () => new OverFlowError(param)),
        Match.when(ErrorType.Enum["not-basic"], () => new NotBasicError(param)),
        Match.when(ErrorType.Enum["invalid-input"], () => new InvalidInputError(param)),
        Match.exhaustive,
      )(errorType);
    },
  );
}

export declare namespace IDNAError {
  export type Type = typeof IDNAError.Type;
  export type Encoded = typeof IDNAError.Encoded;
}