/**
 * App-local registry composition for Stack Installer P1A.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.0.0
 */

import { P1A_DISCORD_CHANNEL_VERB_INPUTS } from "@beep/installer-channels-use-cases";
import { P1A_HOST_DEPENDENCY_VERB_INPUTS } from "@beep/installer-dependencies-use-cases";
import { P1A_PROVIDER_ACCOUNT_VERB_INPUTS } from "@beep/installer-providers-use-cases";
import { P1A_SECRET_REFERENCE_VERB_INPUTS } from "@beep/installer-security-use-cases";
import { P1A_DRY_RUN_SNAPSHOT_INPUT, P1A_WORKSPACE_VERB_INPUTS } from "@beep/installer-workspace-use-cases";

/**
 * Slice-owned dry-run verbs composed by the app.
 *
 * @category configuration
 * @since 0.0.0
 */
export const p1aDryRunRegistry = [
  ...P1A_HOST_DEPENDENCY_VERB_INPUTS,
  ...P1A_SECRET_REFERENCE_VERB_INPUTS,
  ...P1A_PROVIDER_ACCOUNT_VERB_INPUTS,
  ...P1A_DISCORD_CHANNEL_VERB_INPUTS,
  ...P1A_WORKSPACE_VERB_INPUTS,
] as const;

/**
 * Deterministic manifest snapshot shown by the app shell.
 *
 * @category fixtures
 * @since 0.0.0
 */
export const p1aDryRunSnapshot = P1A_DRY_RUN_SNAPSHOT_INPUT;
