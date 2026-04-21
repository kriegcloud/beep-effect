/**
 * Project-level constants and helpers for the infra workspace.
 *
 * @example
 * ```ts
 * import { infraProjectName } from "@beep/infra"
 *
 * console.log(infraProjectName)
 * // "beep-effect"
 * ```
 *
 * @since 0.0.0
 */

import {
  loadV2TWorkstationStackArgs,
  normalizeV2TWorkstationConfig,
  V2TGraphitiSecretError,
  V2TWorkstation,
  type V2TWorkstationArgs,
  V2TWorkstationConfig,
  V2TWorkstationConfigError,
  validateV2TWorkstationConfig,
} from "./V2T.js";

/**
 * Canonical Pulumi project name for this repository's infrastructure workspace.
 *
 * @example
 * ```ts
 * import { infraProjectName } from "@beep/infra"
 *
 * console.log(infraProjectName)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const infraProjectName = "beep-effect";

export type { V2TWorkstationArgs };
export {
  loadV2TWorkstationStackArgs,
  normalizeV2TWorkstationConfig,
  V2TGraphitiSecretError,
  V2TWorkstation,
  V2TWorkstationConfig,
  V2TWorkstationConfigError,
  validateV2TWorkstationConfig,
};
