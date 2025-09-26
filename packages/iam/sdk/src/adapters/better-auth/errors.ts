import * as Data from "effect/Data";

export class BetterAuthError extends Data.TaggedError("BetterAuthError")<{
  readonly message: string;
}> {
  constructor(readonly message: string) {
    super({ message });
  }
}
