/**
 * The one way an unstubbed test-double member dies.
 *
 * **Details**
 *
 * A `makeTest` double's unstubbed member must die rather than silently
 * succeed: a stub that returns nothing teaches a test that nothing happened.
 * The defect names the double, the member and the override that fixes it, and
 * the wording lives here once so every package's doubles report it the same
 * way.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $UtilsId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $UtilsId.create("TestDouble");

/**
 * A test-double member was called without an override.
 *
 * **Example** (Construct an unstubbed-member error)
 *
 * ```ts
 * import { UnstubbedMemberError } from "@beep/utils/TestDouble"
 *
 * const error = UnstubbedMemberError.make({ message: "Cache: save() needs an override." })
 * console.log(error.message) // Cache: save() needs an override.
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class UnstubbedMemberError extends S.TaggedError<UnstubbedMemberError, { readonly brand: unique symbol }>(
  $I`UnstubbedMemberError`
)(
  "UnstubbedMemberError",
  {
    message: S.String,
  },
  $I.annoteError<UnstubbedMemberError>("UnstubbedMemberError", {
    description: "A test-double member was called without an override.",
  })
) {}

/**
 * The die-on-call members of `<double>.makeTest`: `dies("save")` is an
 * `Effect` that defects naming `save` when run. Each double binds its own name
 * once, then lists its members.
 *
 * **Example** (Construct a failing test-double member)
 *
 * ```ts
 * import { unstubbed } from "@beep/utils/TestDouble"
 * import * as Effect from "effect/Effect"
 *
 * const dies = unstubbed("Cache")
 * const save = dies("save")
 * console.log(Effect.isEffect(save)) // true
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const unstubbed =
  (double: string) =>
  (member: string): Effect.Effect<never> =>
    Effect.die(
      UnstubbedMemberError.make({
        message: `${double}: ${member}() was called but not stubbed — pass a \`${member}\` override.`,
      })
    );
