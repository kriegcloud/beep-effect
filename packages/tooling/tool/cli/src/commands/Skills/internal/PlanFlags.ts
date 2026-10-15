/**
 * Flags shared by the plan-then-`--expect` lock writers.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { Flag } from "effect/cli";

/**
 * `--expect <planDigest>`: the reviewed digest a write must match.
 *
 * @internal
 * @category constants
 * @since 0.0.0
 */
export const expectPlanDigestFlag = Flag.String("expect").pipe(
  Flag.optional,
  Flag.withDescription("The reviewed planDigest (from --json) that the write must match")
);
