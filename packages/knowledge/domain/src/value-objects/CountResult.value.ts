import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/count-result.value");

export class CountResult extends S.Class<CountResult>($I`CountResult`)(
  {
    count: S.NonNegativeInt,
  },
  $I.annotations("CountResult", {
    description: "Result of a count aggregation on a domain entity",
  })
) {}
