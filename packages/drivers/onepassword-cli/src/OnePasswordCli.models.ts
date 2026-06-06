/**
 * Data models for the 1Password CLI driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OnepasswordCliId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $OnepasswordCliId.create("OnePasswordCli.models");

/**
 * 1Password reference probe status.
 *
 * @example
 * ```ts
 * import { OnePasswordReferenceProbeStatus } from "@beep/onepassword-cli/OnePasswordCli.models"
 *
 * console.log(OnePasswordReferenceProbeStatus)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const OnePasswordReferenceProbeStatus = LiteralKit(["resolved", "missing"]).pipe(
  $I.annoteSchema("OnePasswordReferenceProbeStatus", {
    description: "Product-neutral 1Password secret-reference probe status.",
  })
);

/**
 * Runtime type for {@link OnePasswordReferenceProbeStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type OnePasswordReferenceProbeStatus = typeof OnePasswordReferenceProbeStatus.Type;

/**
 * Process output captured by a 1Password CLI command.
 *
 * @example
 * ```ts
 * import { OnePasswordCliProcessResult } from "@beep/onepassword-cli/OnePasswordCli.models"
 *
 * console.log(OnePasswordCliProcessResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OnePasswordCliProcessResult extends S.Class<OnePasswordCliProcessResult>($I`OnePasswordCliProcessResult`)(
  {
    exitCode: S.Finite,
    stderr: S.String,
    stdout: S.String,
  },
  $I.annote("OnePasswordCliProcessResult", {
    description: "Stdout, stderr, and exit code captured from a 1Password CLI command.",
  })
) {}

/**
 * 1Password account/session probe result.
 *
 * @example
 * ```ts
 * import { OnePasswordCliAccount } from "@beep/onepassword-cli/OnePasswordCli.models"
 *
 * console.log(OnePasswordCliAccount)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OnePasswordCliAccount extends S.Class<OnePasswordCliAccount>($I`OnePasswordCliAccount`)(
  {
    account: S.optionalKey(S.String),
    signedIn: S.Boolean,
  },
  $I.annote("OnePasswordCliAccount", {
    description: "Redacted 1Password CLI session status.",
  })
) {}

/**
 * Secret-reference validation result that does not expose the secret.
 *
 * @example
 * ```ts
 * import { OnePasswordReferenceProbe } from "@beep/onepassword-cli/OnePasswordCli.models"
 *
 * console.log(OnePasswordReferenceProbe)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OnePasswordReferenceProbe extends S.Class<OnePasswordReferenceProbe>($I`OnePasswordReferenceProbe`)(
  {
    byteLength: S.Finite,
    reference: S.String,
    status: OnePasswordReferenceProbeStatus,
  },
  $I.annote("OnePasswordReferenceProbe", {
    description: "1Password secret-reference probe result with only redacted metadata.",
  })
) {}
