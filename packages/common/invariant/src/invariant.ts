import { InvariantViolation } from "@beep/invariant/error";
import type { CallMetadata } from "@beep/invariant/meta";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

/** Dev flag (narrowed to boolean). Swap to your env detection if needed. */
const __DEV__: boolean = typeof process !== "undefined" && !!process.env && process.env.NODE_ENV !== "production";

/** Defensive, cross-platform-ish path trimming. */
const trimPath = (filename: string): string => {
  // Try to show from the last "packages/" onward if present (monorepo nicety)
  const m = filename.match(/(?:^|[\\/])(packages[\\/].*)$/);
  if (m?.[1]) return m[1].replace(/\\/g, "/");

  // Otherwise, show the last 3 segments for context
  const parts = filename.replace(/\\/g, "/").split("/");
  return parts.slice(-3).join("/");
};

const safeFormatArg = (x: unknown): string => {
  if (typeof x === "string") return x;
  try {
    return JSON.stringify(x);
  } catch {
    // Circulars / BigInts / Symbols — give a best-effort label
    return Object.prototype.toString.call(x);
  }
};

const formatArgs = (args: readonly unknown[] | undefined): string =>
  F.pipe(
    O.fromNullable(args),
    O.map((a) => A.join(", ")(a.map(safeFormatArg))),
    O.getOrElse(() => "")
  );

type InvariantMessage = string | (() => string);

type InvariantFn = (condition: unknown, message: InvariantMessage, meta: CallMetadata.Type) => asserts condition;

/** Augmented function API so we can hang helpers off the callable. */
type InvariantApi = InvariantFn & {
  /**
   * Exhaustiveness helper. Call in the "impossible" branch.
   */
  unreachable: (_x: never, message: InvariantMessage, meta: CallMetadata.Type) => never;

  /**
   * Non-null / non-undefined assertion helper with narrowing.
   */
  nonNull: <T>(value: T, message: InvariantMessage, meta: CallMetadata.Type) => asserts value is NonNullable<T>;
};

/**
 * Asserts that `condition` is truthy.
 *
 * - `message` may be a string or a lazy `() => string` (lazy is cheaper on the fast path).
 * - If the message starts with `"BUG"` and we're in dev, a debugger break is triggered.
 * - Throws a schema-backed `InvariantViolation` with trimmed file, line, and formatted args.
 *
 * @example
 * invariant(user != null, () => `BUG: user missing`, { file, line, args: [ctx] })
 * invariant(count > 0, "count must be > 0", { file, line, args: [count] })
 */
export const invariant: InvariantApi = ((
  condition: unknown,
  message: InvariantMessage,
  meta: CallMetadata.Type
): asserts condition => {
  if (condition) return;

  const msg = typeof message === "function" ? message() : message;

  // Optional dev-only break for "BUG: ..." messages.
  if (__DEV__ && Str.startsWith("BUG")(msg)) {
    debugger;
  }

  const fileName = trimPath(meta.file);
  const argsStr = formatArgs(meta.args);
  const suffix = argsStr ? ` [${argsStr}]` : "";

  const error = new InvariantViolation({
    message: `${msg}${suffix} at ${fileName}:${meta.line}`,
    file: fileName,
    line: meta.line,
    args: meta.args,
  });

  // Hide the invariant frame for cleaner stacks.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, invariant);
  }

  throw error;
}) as InvariantApi;

// -- Helpers -----------------------------------------------------------------

invariant.unreachable = (_x: never, message: InvariantMessage, meta: CallMetadata.Type): never => {
  invariant(false, message, meta);
  // Satisfy `never` for control flow analyzers (unreachable)
  throw new Error("unreachable");
};

invariant.nonNull = <T>(
  value: T,
  message: InvariantMessage,
  meta: CallMetadata.Type
): asserts value is NonNullable<T> => {
  invariant(value != null, message, meta);
};
