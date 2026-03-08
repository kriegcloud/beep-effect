import { $RuntimeServerId } from "@beep/identity/packages";
import { type SidecarBootstrap, SidecarHealthStatus } from "@beep/runtime-protocol";
import { NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RuntimeServerId.create("internal/BootstrapStdout");

/**
 * Machine-readable bootstrap payload emitted on sidecar stdout for the native shell.
 *
 * @since 0.0.0
 * @category Models
 */
export class SidecarBootstrapStdoutLine extends S.Class<SidecarBootstrapStdoutLine>($I`SidecarBootstrapStdoutLine`)(
  {
    type: S.Literal("bootstrap"),
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
 * @since 0.0.0
 * @category Codecs
 */
export const encodeBootstrapStdoutLine = S.encodeUnknownEffect(BootstrapStdoutJson);

/**
 * Decode a bootstrap stdout line from JSON text.
 *
 * @since 0.0.0
 * @category Codecs
 */
export const decodeBootstrapStdoutLine = S.decodeUnknownEffect(BootstrapStdoutJson);

/**
 * Convert a typed sidecar bootstrap payload into the stdout line shape.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const toBootstrapStdoutLine = (bootstrap: SidecarBootstrap) =>
  new SidecarBootstrapStdoutLine({
    type: "bootstrap",
    sessionId: bootstrap.sessionId,
    host: bootstrap.host,
    port: bootstrap.port,
    baseUrl: bootstrap.baseUrl,
    pid: bootstrap.pid,
    version: bootstrap.version,
    status: bootstrap.status,
    startedAt: bootstrap.startedAt,
  });
