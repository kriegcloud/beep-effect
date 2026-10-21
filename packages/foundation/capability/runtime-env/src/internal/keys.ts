/**
 * The union of every environment variable the detectors read.
 *
 * **Details**
 *
 * A layer that builds an environment record from `Config` reads exactly these keys, so a variable no detector reads
 * is never requested from the provider.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { agentCiKeys } from "./agentCi.ts";
import { colorKeys } from "./colorDepth.ts";
import { terminalKeys } from "./osc8/detect.ts";

/**
 * Every environment variable any detector reads: the union of the agent/CI, colour and terminal key lists, without
 * duplicates.
 *
 * **Example** (Check that detector keys are deduplicated)
 *
 * ```ts
 * import { allKeys } from "@beep/runtime-env/internal/keys";
 * import * as A from "effect/Array";
 *
 * console.log(A.length(allKeys) === A.length(A.dedupe(allKeys))) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const allKeys: ReadonlyArray<string> = A.dedupe([...agentCiKeys, ...colorKeys, ...terminalKeys]);
