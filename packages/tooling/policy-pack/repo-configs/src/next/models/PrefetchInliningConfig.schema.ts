/**
 * Schemas for Next.js prefetch inlining configuration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoConfigsId } from "@beep/identity";
import { NonNegNum } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoConfigsId.create("next/models/PrefetchInliningConfig.schema");

class PrefetchInliningConfigComplex extends S.Class<PrefetchInliningConfigComplex>($I`PrefetchInliningConfigComplex`)(
  {
    maxSize: NonNegNum,
    maxBundleSize: NonNegNum,
  },
  $I.annote("PrefetchInliningConfigComplex", {
    description:
      "Resolved form of the prefetchInlining config after normalization in\nconfig.ts. User input (true, partial objects) is converted to this shape.",
  })
) {}

/**
 * Resolved form of the prefetchInlining config after normalization in
 * config.ts. User input (true, partial objects) is converted to this shape.
 *
 * @category models
 * @since 0.0.0
 */
export const PrefetchInliningConfig = S.Union([S.Literal(false), PrefetchInliningConfigComplex]).pipe(
  $I.annoteSchema("PrefetchInliningConfig", {
    description:
      "Resolved form of the prefetchInlining config after normalization in\nconfig.ts. User input (true, partial objects) is converted to this shape.",
  })
);

/**
 * Companion type for {@link PrefetchInliningConfig} schema
 *
 * @category models
 * @since 0.0.0
 */
export type PrefetchInliningConfig = typeof PrefetchInliningConfig.Type;
