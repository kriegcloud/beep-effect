/**
 * Typed failures owned by the practice gateway app.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PracticeGatewayId } from "@beep/identity/packages";
import { PracticeProvider } from "@beep/law-practice-domain";
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

/**
 * A provider's code or native resources could not be loaded on this machine.
 *
 * **Details**
 *
 * Providers load lazily, so a missing or broken sidecar (for example the
 * DuckDB native module behind practice-kg) disables only that provider: the
 * setup tools and the other providers keep working, and the provider's
 * probe reports the failure in plain language.
 *
 * **Example** (Report a missing knowledge-graph engine)
 *
 * ```ts
 * import { ProviderUnavailable } from "@beep/practice-gateway/PracticeGateway.errors"
 *
 * const error = ProviderUnavailable.make({
 *   provider: "practice-kg",
 *   message: "The practice knowledge-graph engine could not be loaded on this computer.",
 * })
 * console.log(error.provider) // "practice-kg"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ProviderUnavailable extends S.TaggedError<ProviderUnavailable>($I`ProviderUnavailable`)(
  "ProviderUnavailable",
  {
    cause: OptionalCause,
    provider: PracticeProvider,
    message: S.NonEmptyString,
  },
  $I.annoteError<ProviderUnavailable>("ProviderUnavailable", {
    description: "A provider's code or native resources could not be loaded on this machine.",
  })
) {}
