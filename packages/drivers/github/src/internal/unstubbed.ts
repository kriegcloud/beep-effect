/**
 * The error every `makeTest` double throws when a member it was not given is called.
 *
 * **Details**
 *
 * Each resource service's `makeTest` fills the members a test does not
 * override with a thrower built by {@link unstubbedFor}, so a forgotten stub
 * fails loudly with the service and member name instead of returning a
 * plausible default.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GithubId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema/LiteralKit";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $GithubId.create("internal/unstubbed");

/**
 * Thrown when a test double's member was called without an override.
 *
 * **Example** (Read the message of an unstubbed call)
 *
 * ```ts
 * import { UnstubbedError } from "@beep/github/internal/unstubbed";
 *
 * const error = UnstubbedError.make({ message: "CheckRun.makeTest: create() was called but not stubbed" });
 * console.log(error._tag) // "UnstubbedError"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class UnstubbedError extends S.TaggedError<UnstubbedError, { readonly brand: unique symbol }>(
  $I`UnstubbedError`
)(
  "UnstubbedError",
  {
    message: S.String.pipe(
      $I.annoteKey("UnstubbedError.message", { description: "The test-double member that needs an override." })
    ),
  },
  $I.annoteError<UnstubbedError>("UnstubbedError", { description: "An unconfigured test-double member was called." })
) {}

/**
 * How a test double's unstubbed member was used: called as a function, or read as a value.
 *
 * **Example** (Validate an access kind)
 *
 * ```ts
 * import { UnstubbedAccess } from "@beep/github/internal/unstubbed";
 * import * as S from "effect/Schema";
 *
 * console.log(S.is(UnstubbedAccess)("read")) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const UnstubbedAccess = LiteralKit(["called", "read"]).pipe(
  $I.annoteSchema("UnstubbedAccess", {
    description: "How a test double's unstubbed member was used: called as a function, or read as a value.",
  })
);

/**
 * The values accepted by {@link UnstubbedAccess}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type UnstubbedAccess = typeof UnstubbedAccess.Type;

/**
 * The test double an unstubbed thrower reports for.
 *
 * **Example** (Describe a double whose members are read)
 *
 * ```ts
 * import { UnstubbedTarget } from "@beep/github/internal/unstubbed";
 *
 * const target = UnstubbedTarget.make({ service: "GitHubRepository", access: "read" });
 * console.log(target.service) // "GitHubRepository"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UnstubbedTarget extends S.Opaque<UnstubbedTarget, { readonly brand: unique symbol }>()(
  S.Struct({
    /** The service whose `makeTest` built the double. */
    service: S.String.pipe(
      $I.annoteKey("UnstubbedTarget.service", { description: "The service whose `makeTest` built the double." })
    ),
    /** What the caller should do instead; defaults to `pass an override`. */
    hint: S.optionalKey(S.String).pipe(
      $I.annoteKey("UnstubbedTarget.hint", {
        description: "What the caller should do instead; defaults to `pass an override`.",
      })
    ),
    /** How unstubbed members are used; defaults to `called`. */
    access: S.optionalKey(UnstubbedAccess).pipe(
      $I.annoteKey("UnstubbedTarget.access", { description: "How unstubbed members are used; defaults to `called`." })
    ),
  }).pipe($I.annoteSchema("UnstubbedTarget", { description: "The test double an unstubbed thrower reports for." }))
) {}

/**
 * Companion types for {@link UnstubbedTarget}.
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace UnstubbedTarget {
  /**
   * The plain, unbranded target {@link unstubbedFor} accepts.
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded = typeof UnstubbedTarget.Encoded;
}

/**
 * Build the thrower a service's `makeTest` uses for members without an override.
 *
 * **Details**
 *
 * The message names the service, the member and the hint:
 * `<service>.makeTest: <member>() was called but not stubbed — <hint>.`
 * A double whose unstubbed members are read as values rather than called
 * sets `access: "read"`, and the message reads `<member> was read` instead.
 *
 * **Example** (Throw for an unstubbed member)
 *
 * ```ts
 * import { unstubbedFor } from "@beep/github/internal/unstubbed";
 *
 * const unstubbed = unstubbedFor({ service: "CheckRun" });
 * try {
 *   unstubbed("create");
 * } catch (error) {
 *   console.log(String(error).includes("CheckRun.makeTest: create()")) // true
 * }
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const unstubbedFor =
  ({ service, hint = "pass an override", access = "called" }: UnstubbedTarget.Encoded) =>
  (member: string): never => {
    const used = access === "read" ? `${member} was read` : `${member}() was called`;
    throw UnstubbedError.make({
      message: `${service}.makeTest: ${used} but not stubbed — ${hint}.`,
    });
  };

/**
 * How an unstubbed member of a whole test-double shape fails: a function that
 * throws when called, or an effect that dies when run.
 *
 * **Example** (Validate a member kind)
 *
 * ```ts
 * import { UnstubbedMember } from "@beep/github/internal/unstubbed";
 * import * as S from "effect/Schema";
 *
 * console.log(S.is(UnstubbedMember)("effect")) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const UnstubbedMember = LiteralKit(["call", "effect"]).pipe(
  $I.annoteSchema("UnstubbedMember", {
    description: "How an unstubbed member fails: a function that throws when called, or an effect that dies when run.",
  })
);

/**
 * The values accepted by {@link UnstubbedMember}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type UnstubbedMember = typeof UnstubbedMember.Type;

/**
 * Build a whole test-double shape whose every member fails through {@link unstubbedFor}.
 *
 * **Details**
 *
 * `members` names every key of the shape (the mapped type makes the record
 * exhaustive) and how it fails: a `"call"` member becomes a function that
 * throws, an `"effect"` member an effect that dies when run. A service's
 * `makeTest` spreads its overrides over the result. The final assertion is the
 * one place the member record meets the service's own signatures; a thrower
 * returns `never`, which every member signature accepts.
 *
 * **Example** (Build an all-unstubbed double)
 *
 * ```ts
 * import { scopedStoreMembers, unstubbedShapeFor } from "@beep/github/internal/unstubbed";
 * import type { RepositorySecretShape } from "@beep/github/RepositorySecret";
 *
 * const unstubbed = unstubbedShapeFor({ service: "RepositorySecret" })<RepositorySecretShape>(scopedStoreMembers);
 * console.log(typeof unstubbed.list) // "function"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const unstubbedShapeFor = (target: UnstubbedTarget.Encoded) => {
  const unstubbed = unstubbedFor(target);
  const memberOf = (kind: UnstubbedMember, member: string) =>
    kind === "effect" ? Effect.suspend((): Effect.Effect<never> => unstubbed(member)) : () => unstubbed(member);
  return <Shape extends object>(members: { readonly [K in keyof Shape & string]-?: UnstubbedMember }): Shape =>
    R.map(members, memberOf) as unknown as Shape;
};

/**
 * The members of the repository/environment-scoped stores `RepositorySecret`
 * and `RepositoryVariable`, each a function.
 *
 * **Example** (List the scoped-store members)
 *
 * ```ts
 * import { scopedStoreMembers } from "@beep/github/internal/unstubbed";
 *
 * console.log(Object.keys(scopedStoreMembers).length) // 6
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const scopedStoreMembers = {
  set: "call",
  list: "call",
  delete: "call",
  setForEnvironment: "call",
  listForEnvironment: "call",
  deleteForEnvironment: "call",
} as const;
