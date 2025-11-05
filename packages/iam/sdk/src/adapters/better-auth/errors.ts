import * as Data from "effect/Data";

export class BetterAuthError extends Data.TaggedError("BetterAuthError")<{
  readonly message: string;
}> {
  constructor(override readonly message: string) {
    super({ message });
  }
}
