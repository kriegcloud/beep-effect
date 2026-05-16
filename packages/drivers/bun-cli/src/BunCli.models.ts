/**
 * Bun CLI driver models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $I as $PackagesId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $BunCliId = $PackagesId.compose("bun-cli").$BunCliId;
const $I = $BunCliId.create("BunCli.models");

/**
 * Bun runtime presence states reported by the driver.
 *
 * @category models
 * @since 0.0.0
 */
export const BunCliProbeStatus = LiteralKit(["present", "missing"] as const).pipe(
  $I.annoteSchema("BunCliProbeStatus", {
    description: "Whether the Bun command appears to be available on the host.",
  })
);

/**
 * Runtime type for {@link BunCliProbeStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type BunCliProbeStatus = typeof BunCliProbeStatus.Type;

/**
 * Bun version probe result.
 *
 * @category models
 * @since 0.0.0
 */
export class BunCliProbe extends S.Class<BunCliProbe>($I`BunCliProbe`)(
  {
    command: S.NonEmptyString,
    status: BunCliProbeStatus,
    version: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $I.annote("BunCliProbe", {
    description: "Product-neutral Bun version probe result.",
  })
) {}

/**
 * Captured process output from a Bun CLI command.
 *
 * @category models
 * @since 0.0.0
 */
export class BunCliProcessResult extends S.Class<BunCliProcessResult>($I`BunCliProcessResult`)(
  {
    exitCode: S.Number,
    stderr: S.String,
    stdout: S.String,
  },
  $I.annote("BunCliProcessResult", {
    description: "Process output captured by a Bun CLI command.",
  })
) {}
