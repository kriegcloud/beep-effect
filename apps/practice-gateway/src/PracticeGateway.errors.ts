/**
 * Typed failures owned by the practice gateway app.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PracticeGatewayId } from "@beep/identity/packages";
import { SchemaUtils } from "@beep/schema";
import * as Runtime from "effect/Runtime";
import * as S from "effect/Schema";

const $I = $PracticeGatewayId.create("PracticeGateway.errors");

const OptionalCause = S.optionalKey(
  S.Defect({ includeStack: true }).pipe(S.overrideToEquivalence(SchemaUtils.alwaysEquivalent))
);

/**
 * The saved practice profile could not be read or written.
 *
 * **Example** (Report an unreadable profile)
 *
 * ```ts
 * import { ProfileStoreFailure } from "@beep/practice-gateway/PracticeGateway.errors"
 *
 * const error = ProfileStoreFailure.make({ message: "The saved practice profile is not valid." })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ProfileStoreFailure extends S.TaggedError<ProfileStoreFailure>($I`ProfileStoreFailure`)(
  "ProfileStoreFailure",
  {
    cause: OptionalCause,
    message: S.NonEmptyString,
  },
  $I.annoteError<ProfileStoreFailure>("ProfileStoreFailure", {
    description: "The saved practice profile could not be read or written.",
  })
) {}

/**
 * A Windows host query could not run.
 *
 * **Details**
 *
 * Distinct from a query that ran and found nothing: a missing registry value
 * or a stopped process is a normal answer, while a failure to launch
 * `reg.exe` is this error. Probes turn it into `SetupProbeUnavailable`.
 *
 * **Example** (Report a failed registry query)
 *
 * ```ts
 * import { WindowsHostFailure } from "@beep/practice-gateway/PracticeGateway.errors"
 *
 * const error = WindowsHostFailure.make({ message: "reg.exe could not be started." })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class WindowsHostFailure extends S.TaggedError<WindowsHostFailure>($I`WindowsHostFailure`)(
  "WindowsHostFailure",
  {
    cause: OptionalCause,
    message: S.NonEmptyString,
  },
  $I.annoteError<WindowsHostFailure>("WindowsHostFailure", {
    description: "A Windows host query could not run.",
  })
) {}

/**
 * Failure of `--self-check` after its refusal line has been printed.
 *
 * **Details**
 *
 * The self-check owns stdout and prints `{"ok":false,"message":…}` itself, so
 * this error opts out of the main runner's own error log through
 * `Runtime.errorReported`. The process still exits non-zero.
 *
 * **Example** (Create a self-check failure)
 *
 * ```ts
 * import { SelfCheckFailure } from "@beep/practice-gateway/PracticeGateway.errors"
 *
 * const error = SelfCheckFailure.make({ message: "The setup doctor could not run." })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SelfCheckFailure extends S.TaggedError<SelfCheckFailure>($I`SelfCheckFailure`)(
  "SelfCheckFailure",
  {
    cause: OptionalCause,
    message: S.NonEmptyString,
  },
  $I.annoteError<SelfCheckFailure>("SelfCheckFailure", {
    description: "Gateway self-check failure whose refusal was already printed.",
  })
) {
  override readonly [Runtime.errorReported] = false;
}
