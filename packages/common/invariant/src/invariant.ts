/**
 * Implements the invariant assertion pipeline, providing runtime guards that
 * throw structured `InvariantViolation` errors and helper APIs for non-null and
 * unreachable cases.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import { invariant } from "@beep/invariant";
 *
 * type Account = CommonTypes.Prettify<{ readonly id: string | null }>;
 * const account: Account = { id: "acct_123" };
 * const payload: { readonly token: string | null } = { token: "token_123" };
 *
 * invariant(account.id !== null, () => "BUG: missing account id", {
 *   file: "packages/common/invariant/src/invariant.ts",
 *   line: 28,
 *   args: [account],
 * });
 *
 * invariant.nonNull(payload.token, "missing token", {
 *   file: "packages/common/invariant/src/invariant.ts",
 *   line: 34,
 *   args: [payload],
 * });
 * ```
 * @category Invariant/Overview
 * @since 0.1.0
 */

import { InvariantViolation } from "@beep/invariant/error";
import type { CallMetadata } from "@beep/invariant/meta";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const PACKAGES_SEGMENT_REGEX = /(?:^|[\\/])(packages[\\/].*)$/u;
const normalizeSlashes = Str.replace(/\\/g, "/");

/** Dev flag (narrowed to boolean). Swap to your env detection if needed. */
const __DEV__: boolean = typeof process !== "undefined" && !!process.env && process.env.NODE_ENV !== "production";

/** Defensive, cross-platform-ish path trimming. */
const trimPath = (filename: string): string => {
  const normalized = normalizeSlashes(filename);
  return F.pipe(
    normalized,
    Str.match(PACKAGES_SEGMENT_REGEX),
    O.flatMap((match) =>
      F.pipe(
        match,
        A.get(1),
        O.map((segment) => normalizeSlashes(segment))
      )
    ),
    O.getOrElse(() =>
      F.pipe(
        normalized,
        Str.split("/"),
        A.takeRight(3),
        A.match({
          onEmpty: () => normalized,
          onNonEmpty: (segments) => F.pipe(segments, A.join("/")),
        })
      )
    )
  );
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
    O.map((values) => F.pipe(values, A.map(safeFormatArg), A.join(", "))),
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
 * Asserts that a condition is truthy and throws `InvariantViolation` with metadata when it fails.
 *
 * - `message` may be a string or a lazy `() => string` (lazy is cheaper on the fast path).
 * - If the message starts with `"BUG"` and we're in dev, a debugger break is triggered.
 * - Throws a schema-backed `InvariantViolation` with trimmed file, line, and formatted args.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import { invariant } from "@beep/invariant";
 *
 * type Env = CommonTypes.Prettify<{ readonly token: string | null }>;
 * const env: Env = { token: "token_789" };
 *
 * invariant(env.token !== null, "token missing", {
 *   file: "packages/common/invariant/src/invariant.ts",
 *   line: 112,
 *   args: [env],
 * });
 *
 * invariant.nonNull(env.token, "missing token", {
 *   file: "packages/common/invariant/src/invariant.ts",
 *   line: 118,
 *   args: [env],
 * });
 * ```
 * @category Invariant/Assertions
 * @since 0.1.0
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
    // biome-ignore lint/suspicious/noDebugger: intentional debugger for BUG-tagged invariant violations in development
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

/**
 * Exhaustiveness helper that marks unreachable branches and always throws.
 *
 * @example
 * ```ts
 * type Result = { type: "A" } | { type: "B" };
 *
 * const valueFor = (input: Result) => {
 *   switch (input.type) {
 *     case "A":
 *       return 1;
 *     case "B":
 *       return 2;
 *     default:
 *       return invariant.unreachable(input, "unhandled case", {
 *         file: "packages/common/invariant/src/invariant.ts",
 *         line: 150,
 *         args: [input],
 *       });
 *   }
 * };
 * ```
 * @category Invariant/Assertions
 * @since 0.1.0
 */
invariant.unreachable = (_x: never, message: InvariantMessage, meta: CallMetadata.Type): never => {
  invariant(false, message, meta);
  // Satisfy `never` for control flow analyzers (unreachable)
  throw new Error("unreachable");
};

/**
 * Narrows a nullable value to `NonNullable<T>` using the invariant pipeline.
 *
 * @example
 * ```ts
 * type Session = { token?: string | null };
 *
 * const assertToken = (session: Session) => {
 *   invariant.nonNull(session.token, "session missing token", {
 *     file: "packages/common/invariant/src/invariant.ts",
 *     line: 168,
 *     args: [session],
 *   });
 *   return session.token;
 * };
 * ```
 * @category Invariant/Assertions
 * @since 0.1.0
 */
invariant.nonNull = <T>(
  value: T,
  message: InvariantMessage,
  meta: CallMetadata.Type
): asserts value is NonNullable<T> => {
  invariant(value != null, message, meta);
};
