import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/batch-config");

export class FailurePolicy extends BS.StringLiteralKit("continue-on-failure", "abort-all", "retry-failed").annotations(
  $I.annotations("FailurePolicy", {
    description: "Policy governing behavior when a document extraction fails within a batch",
  })
) {}

export declare namespace FailurePolicy {
  export type Type = typeof FailurePolicy.Type;
}

export class BatchConfig extends S.Class<BatchConfig>($I`BatchConfig`)(
  {
    concurrency: S.optionalWith(S.NonNegativeInt.pipe(S.between(1, 20)), {
      default: () => 3,
    }),
    failurePolicy: S.optionalWith(FailurePolicy, {
      default: () => "continue-on-failure" as const,
    }),
    maxRetries: S.optionalWith(S.NonNegativeInt, {
      default: () => 2,
    }),
    enableEntityResolution: S.optionalWith(S.Boolean, {
      default: () => true,
    }),
  },
  $I.annotations("BatchConfig", {
    description: "Configuration for batch extraction processing",
  })
) {}

export declare namespace BatchConfig {
  export type Type = typeof BatchConfig.Type;
}
