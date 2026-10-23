// @effect-diagnostics nodeBuiltinImport:skip-file -- nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. Owner: @beep/scratchpad. Exit: effected-promotion graduates the module and ports this test to @effect/vitest layer() and Effect platform services.
// These checked-in historical documents are parser input, never install roots.
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Locate a historical parser document by its logical package-manager filename.
 *
 * **Example** (Locate an npm capture)
 *
 * ```ts
 * import { fixturePath } from "./fixtures.ts"
 *
 * const path = fixturePath("npm/v1/package-lock.json")
 * console.log(path.endsWith("package-lock.json.fixture")) // true
 * ```
 *
 * @internal
 * @category testing
 * @since 0.0.0
 */
export const fixturePath = (relative: string): string => join(import.meta.dirname, "fixtures", `${relative}.fixture`);

/**
 * Read an inert historical capture verbatim for the lockfile parser.
 *
 * **Example** (Read a pnpm capture)
 *
 * ```ts
 * import { fixture } from "./fixtures.ts"
 *
 * const input = fixture("pnpm/v1/pnpm-lock.yaml")
 * console.log(input.includes("lockfileVersion")) // true
 * ```
 *
 * @internal
 * @category testing
 * @since 0.0.0
 */
export const fixture = (relative: string): string => readFileSync(fixturePath(relative), "utf8");
