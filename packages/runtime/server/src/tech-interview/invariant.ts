import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
/**
 * Metadata injected b y the log transform plugin.
 *
 * Field names are intentionally short to reduce the size of the generated code.
 */
export type CallMetadata = Readonly<{
  /**
   * File name.
   */
  F: string;

  /**
   * Line number.
   */
  L: number;

  /**
   * Value of `this` at the site of the log call.
   * Will be set to the class instance if the call is inside a method, or to the `globalThis` (`window` or `global`) otherwise.
   */
  S: any | undefined;

  /**
   * A callback that will invoke the provided function with provided arguments.
   * Useful in the browser to force a `console.log` call to have a certain stack-trace.
   */
  C?: (fn: Function, args: any[]) => void;

  /**
   * Source code of the argument list.
   */
  A?: undefined | string[];
}>;

export type InvariantFn = (condition: unknown, message?: string, meta?: CallMetadata) => asserts condition;

export const invariant: InvariantFn = (
  condition: unknown,
  message?: string,
  meta?: CallMetadata
): asserts condition => {
  if (condition) {
    return;
  }

  if (Str.isString(message) && Str.startsWith("BUG")(message)) {
    // This invariant is a debug bug-check: break if the debugger is attached.
    debugger;
  }

  let errorMessage = "invariant violation" as const;

  if (message) {
    errorMessage += `: ${message}` as const;
  }

  if (meta?.A) {
    errorMessage += ` [${meta.A[0]}]` as const;
  }

  if (meta?.F) {
    errorMessage += ` at ${getRelativeFilename(meta.F)}:${meta.L}` as const;
  }

  const error = new InvariantViolation(errorMessage);

  // Do not include the invariant function in the stack trace.
  Error.captureStackTrace(error, invariant);

  throw error;
};

export class InvariantViolation extends Data.TaggedError("InvariantViolation")<{
  readonly message: string;
}> {
  constructor(message: string) {
    super({
      message,
    });
    // NOTE: Restores prototype chain (https://stackoverflow.com/a/48342359).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const getRelativeFilename = (filename: string) =>
  F.pipe(
    filename,
    Str.match(/.+\/(packages\/.+\/.+)/),
    O.match({
      onNone: () => filename,
      onSome: (match) =>
        F.pipe(
          match[1],
          O.fromNullable,
          O.getOrElse(() => filename)
        ),
    })
  );
