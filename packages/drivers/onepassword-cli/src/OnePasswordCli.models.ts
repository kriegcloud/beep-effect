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
 * @category models
 * @since 0.0.0
 */
export const OnePasswordReferenceProbeStatus = LiteralKit(["resolved", "missing"] as const).pipe(
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
 * @category models
 * @since 0.0.0
 */
export class OnePasswordCliProcessResult extends S.Class<OnePasswordCliProcessResult>($I`OnePasswordCliProcessResult`)(
  {
    exitCode: S.Number,
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
 * @category models
 * @since 0.0.0
 */
export class OnePasswordReferenceProbe extends S.Class<OnePasswordReferenceProbe>($I`OnePasswordReferenceProbe`)(
  {
    byteLength: S.Number,
    reference: S.String,
    status: OnePasswordReferenceProbeStatus,
  },
  $I.annote("OnePasswordReferenceProbe", {
    description: "1Password secret-reference probe result with only redacted metadata.",
  })
) {}
