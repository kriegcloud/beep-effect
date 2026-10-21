/**
 * Normalizing GitHub resource ids to the `number` this package's records use.
 *
 * **Details**
 *
 * A leaf module with no imports, shared by every resource that projects an id
 * from an `@octokit/types` payload.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
/**
 * Narrows the `number | bigint` resource ids `@octokit/types` v17 declares
 * back to `number`.
 *
 * **Details**
 *
 * GitHub's REST payloads arrive through `JSON.parse`, which never produces a
 * bigint, so at runtime the value is always a number today — the union is
 * upstream future-proofing for ids beyond 2^53. If GitHub ever crosses that
 * line, the `id: number` fields on this package's public records have to be
 * redesigned; a runtime coercion here could not paper over it.
 *
 * **Example** (Normalize a resource identifier)
 *
 * ```ts
 * import { numericId } from "@beep/github/internal/ids";
 *
 * console.log(numericId(42)) // 42
 * console.log(numericId(42n)) // 42
 * ```
 *
 * @category normalization
 * @since 0.0.0
 */
export const numericId = (id: number | bigint): number => Number(id);
