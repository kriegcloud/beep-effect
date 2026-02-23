import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("values/BatchConfig.value");

export class FailurePolicy extends BS.StringLiteralKit("continue_on_failure", "abort_all", "retry_failed").annotations(
  $I.annotations("FailurePolicy", {
    description: "Policy governing behavior when a document extraction fails within a batch",
  })
) {}

export const makeBatchConfigMember = FailurePolicy.toTagged("failurePolicy").composer({
  concurrency: S.optionalWith(S.NonNegativeInt.pipe(S.between(1, 20)), {
    default: () => 3,
  }),
  maxRetries: S.optionalWith(S.NonNegativeInt, {
    default: () => 2,
  }),
  enableEntityResolution: S.optionalWith(S.Boolean, {
    default: () => true,
  }),
});

export declare namespace FailurePolicy {
  export type Type = typeof FailurePolicy.Type;
}

export class ContinueOnFailureBatchConfig extends S.Class<ContinueOnFailureBatchConfig>(
  $I`ContinueOnFailureBatchConfig`
)(
  makeBatchConfigMember.continue_on_failure({}),
  $I.annotations("ContinueOnFailureBatchConfig", {
    description: "Configuration for batch extraction processing with continue_on_failure policy",
  })
) {
  static readonly new = (config?: undefined | ContinueOnFailureBatchConfig) => new ContinueOnFailureBatchConfig(config);
}

export class AbortAllBatchConfig extends S.Class<AbortAllBatchConfig>($I`AbortAllBatchConfig`)(
  makeBatchConfigMember.abort_all({}),
  $I.annotations("AbortAllBatchConfig", {
    description: "Configuration for batch extraction processing with abort_all policy",
  })
) {
  static readonly new = (config?: undefined | AbortAllBatchConfig) => new AbortAllBatchConfig(config);
}

export class RetryFailedBatchConfig extends S.Class<RetryFailedBatchConfig>($I`RetryFailedBatchConfig`)(
  makeBatchConfigMember.retry_failed({}),
  $I.annotations("RetryFailedBatchConfig", {
    description: "Configuration for batch extraction processing with retry_failed policy",
  })
) {
  static readonly new = (config?: undefined | RetryFailedBatchConfig) => new RetryFailedBatchConfig(config);
}

export class BatchConfig extends S.Union(
  RetryFailedBatchConfig,
  AbortAllBatchConfig,
  ContinueOnFailureBatchConfig
).annotations(
  $I.annotations("BatchConfig", {
    description: "Configuration for batch extraction processing",
  })
) {
  static readonly $match = Match.type<BatchConfig.Type>().pipe(
    Match.discriminatorsExhaustive("failurePolicy")({
      continue_on_failure: ContinueOnFailureBatchConfig.new,
      abort_all: AbortAllBatchConfig.new,
      retry_failed: RetryFailedBatchConfig.new,
    })
  );
  static readonly new = (config?: undefined | BatchConfig.Type) =>
    O.fromNullable(config).pipe(
      O.match({
        onNone: ContinueOnFailureBatchConfig.new,
        onSome: BatchConfig.$match,
      })
    );
}

export declare namespace BatchConfig {
  export type Type = typeof BatchConfig.Type;
}
