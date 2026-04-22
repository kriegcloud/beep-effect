/**
 * Bootstrap stdout encoding helpers for the sidecar process.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RuntimeServerId } from "@beep/identity/packages";
import { type SidecarBootstrap, SidecarHealthStatus } from "@beep/runtime-protocol";
import { NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RuntimeServerId.create("internal/BootstrapStdout");

/**
 * Machine-readable bootstrap payload emitted on sidecar stdout for the native shell.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SidecarBootstrapStdoutLine } from "@beep/runtime-server/internal/BootstrapStdout"
 *
 * const isBootstrapLine = S.is(SidecarBootstrapStdoutLine)
 *
 * void isBootstrapLine
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class SidecarBootstrapStdoutLine extends S.Class<SidecarBootstrapStdoutLine>($I`SidecarBootstrapStdoutLine`)(
  {
    type: S.tag("bootstrap"),
    sessionId: S.String,
    host: S.String,
    port: NonNegativeInt,
    baseUrl: S.String,
    pid: NonNegativeInt,
    version: S.String,
    status: SidecarHealthStatus,
    startedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("SidecarBootstrapStdoutLine", {
    description: "Flat bootstrap line emitted on sidecar stdout for desktop bootstrap discovery.",
  })
) {}

const BootstrapStdoutJson = S.fromJsonString(SidecarBootstrapStdoutLine);

/**
 * Encode a bootstrap stdout line as JSON text.
 *
 * @example
 * ```ts
 * import { encodeBootstrapStdoutLine } from "@beep/runtime-server/internal/BootstrapStdout"
 *
 * const encode = encodeBootstrapStdoutLine
 *
 * void encode
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const encodeBootstrapStdoutLine = S.encodeUnknownEffect(BootstrapStdoutJson);

/**
 * Decode a bootstrap stdout line from JSON text.
 *
 * @example
 * ```ts
 * import { decodeBootstrapStdoutLine } from "@beep/runtime-server/internal/BootstrapStdout"
 *
 * const decode = decodeBootstrapStdoutLine
 *
 * void decode
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const decodeBootstrapStdoutLine = S.decodeUnknownEffect(BootstrapStdoutJson);

/**
 * Convert a typed sidecar bootstrap payload into the stdout line shape.
 *
 * @example
 * ```ts
 * import { toBootstrapStdoutLine } from "@beep/runtime-server/internal/BootstrapStdout"
 *
 * const convert = toBootstrapStdoutLine
 *
 * void convert
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const toBootstrapStdoutLine = (bootstrap: SidecarBootstrap) =>
  new SidecarBootstrapStdoutLine({
    sessionId: bootstrap.sessionId,
    host: bootstrap.host,
    port: bootstrap.port,
    baseUrl: bootstrap.baseUrl,
    pid: bootstrap.pid,
    version: bootstrap.version,
    status: bootstrap.status,
    startedAt: bootstrap.startedAt,
  });
