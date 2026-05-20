/**
 * Stack Installer P1A registry view.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.0.0
 */

import { P1A_DRY_RUN_SNAPSHOT_INPUT, P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS } from "@beep/installer-use-cases";

/**
 * Installer-owned dry-run verbs shown by the app.
 *
 * @category configuration
 * @since 0.0.0
 */
export const p1aDryRunRegistry = P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS;

/**
 * Deterministic manifest snapshot shown by the app shell.
 *
 * @category fixtures
 * @since 0.0.0
 */
export const p1aDryRunSnapshot = P1A_DRY_RUN_SNAPSHOT_INPUT;
