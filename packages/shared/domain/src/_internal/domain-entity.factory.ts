// import * as Model from "effect/unstable/schema/Model";
// import * as S from "effect/Schema";
import type { TString } from "@beep/types";
import type { EntityId } from "../entity-ids/_internal/index.js";

/**
 * Temporary domain-entity constructor helper.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const make = <
  const TTag extends TString.NonEmpty,
  const TTableName extends TString.NonEmpty,
  const TSlice extends TString.NonEmpty,
>(
  id: EntityId.EntityId.Instance<TTag, TTableName, TSlice>
) => console.log(id);
