import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { MentionRecord } from "@beep/knowledge-domain/entities";
import type { ClusterError } from "@beep/knowledge-domain/errors/cluster.errors";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("services/IncrementalClusterer");

export interface IncrementalClustererService {
  readonly cluster: (
    mentions: ReadonlyArray<S.Schema.Type<typeof MentionRecord.Model.insert>>
  ) => Effect.Effect<void, ClusterError>;
}
export class IncrementalClusterer extends Context.Tag($I`IncrementalClusterer`)<
  IncrementalClusterer,
  IncrementalClustererService
>() {}
