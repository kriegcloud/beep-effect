import { BeepError } from "@beep/errors/client";
import { BetterAuthError } from "@beep/iam-sdk/adapters";
import * as Data from "effect/Data";
import * as P from "effect/Predicate";

export class IamError extends Data.TaggedError("IamError")<{
  readonly customMessage?: string | undefined;
  readonly cause: unknown;
}> {
  constructor(
    readonly cause: unknown,
    readonly customMessage?: string
  ) {
    super({ customMessage: customMessage ?? "Unknown Error has occurred", cause });
  }

  static readonly match = (error: unknown) => {
    if (error instanceof BetterAuthError) {
      return new IamError(error.cause, error.message);
    }

    const customMessage =
      P.hasProperty("message")(error) && P.isString(error.message) ? error.message : "Unknown Error has occurred";
    const cause = new BeepError.UnknownError({
      cause: error,
      customMessage,
    });

    return new IamError(cause, customMessage);
  };

  get message() {
    return this.customMessage ?? "Unknown Error has occurred";
  }
}
