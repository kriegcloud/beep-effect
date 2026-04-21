/**
 * Pulumi stack entrypoint outputs for local V2T workstation provisioning.
 *
 * @module
 * @since 0.0.0
 */
import { loadV2TWorkstationStackArgs, V2TWorkstation } from "../V2T.js";

const workstation = new V2TWorkstation("v2t-workstation", loadV2TWorkstationStackArgs());

/**
 * Output name of the installed V2T package artifact.
 *
 * @example
 * ```ts
 * import { installedPackageName } from "@beep/infra/internal/entry"
 *
 * const output = installedPackageName
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const installedPackageName = workstation.installedPackageName;

/**
 * Output URL for the optional Graphiti proxy.
 *
 * @example
 * ```ts
 * import { graphitiProxyUrl } from "@beep/infra/internal/entry"
 *
 * const output = graphitiProxyUrl
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const graphitiProxyUrl = workstation.graphitiProxyUrl;

/**
 * Output base URL for the local Qwen audio service.
 *
 * @example
 * ```ts
 * import { qwenBaseUrl } from "@beep/infra/internal/entry"
 *
 * const output = qwenBaseUrl
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const qwenBaseUrl = workstation.qwenBaseUrl;

/**
 * Output base URL for the local backend.
 *
 * @example
 * ```ts
 * import { localBackendUrl } from "@beep/infra/internal/entry"
 *
 * const output = localBackendUrl
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const localBackendUrl = workstation.localBackendUrl;

/**
 * Output state directory for Graphiti proxy data.
 *
 * @example
 * ```ts
 * import { graphitiStateDir } from "@beep/infra/internal/entry"
 *
 * const output = graphitiStateDir
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const graphitiStateDir = workstation.graphitiStateDir;

/**
 * Output state directory for Qwen runtime data.
 *
 * @example
 * ```ts
 * import { qwenStateDir } from "@beep/infra/internal/entry"
 *
 * const output = qwenStateDir
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const qwenStateDir = workstation.qwenStateDir;

/**
 * Output systemd service name for the Qwen runtime.
 *
 * @example
 * ```ts
 * import { qwenServiceName } from "@beep/infra/internal/entry"
 *
 * const output = qwenServiceName
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const qwenServiceName = workstation.qwenServiceName;

/**
 * Output systemd service name for the optional Graphiti proxy.
 *
 * @example
 * ```ts
 * import { graphitiProxyServiceName } from "@beep/infra/internal/entry"
 *
 * const output = graphitiProxyServiceName
 * ```
 *
 * @category outputs
 * @since 0.0.0
 */
export const graphitiProxyServiceName = workstation.graphitiProxyServiceName;
