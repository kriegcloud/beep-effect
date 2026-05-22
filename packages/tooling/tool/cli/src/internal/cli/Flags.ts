/**
 * Shared flag helpers for repo-cli command adapters.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Flag } from "effect/unstable/cli";

/**
 * Standard `--json` flag used by commands that support machine-readable output.
 *
 * @category flags
 * @since 0.0.0
 */
export const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Emit machine-readable JSON output"));
