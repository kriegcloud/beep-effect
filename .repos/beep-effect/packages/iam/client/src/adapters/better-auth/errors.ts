import * as Data from "effect/Data";

/**
 * Error from Better Auth authentication operations.
 * @identifier BetterAuthError
 * @description Runtime error from Better Auth API calls (sign-in, sign-up, session management)
 */
export class BetterAuthError extends Data.TaggedError("BetterAuthError")<{
  readonly message: string;
}> {
  constructor(message: string) {
    super({ message });
  }
}
