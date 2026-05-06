/**
 * Schemas for Next.js subresource integrity plugin configuration.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $RepoConfigsId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $RepoConfigsId.create("next/models/SubresourceIntegrityPlugin.schema");

/**
 * Supported subresource integrity hash algorithms.
 *
 * @example
 * ```ts
 * import { SubresourceIntegrityAlgorithm } from "@beep/repo-configs/next/models/SubresourceIntegrityPlugin.schema"
 *
 * const algorithm = SubresourceIntegrityAlgorithm
 * void algorithm
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SubresourceIntegrityAlgorithm = LiteralKit(["sha256", "sha384", "sha512"]).pipe(
  $I.annoteSchema("SubresourceIntegrityAlgorithm", {
    description: "Subresource Integrity algorithm",
  })
);

/**
 * Supported subresource integrity hash algorithm.
 *
 * @example
 * ```ts
 * import type { SubresourceIntegrityAlgorithm } from "@beep/repo-configs/next/models/SubresourceIntegrityPlugin.schema"
 *
 * const algorithm = "sha384" satisfies SubresourceIntegrityAlgorithm
 * void algorithm
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SubresourceIntegrityAlgorithm = typeof SubresourceIntegrityAlgorithm.Type;
