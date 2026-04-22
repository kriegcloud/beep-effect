/**
 * Temporary domain entity factory helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

// import * as Model from "effect/unstable/schema/Model";
// import * as S from "effect/Schema";
import type { TString } from "@beep/types";
import type { EntityId } from "../entity-ids/_internal/index.js";

/**
 * Temporary domain-entity constructor helper.
 *
 * @example
 * ```ts
 * import { make } from "@beep/shared-domain/_internal/domain-entity.factory"
 *
 * const makeDomainEntity = make
 *
 * void makeDomainEntity
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const make = <
  const TTag extends TString.NonEmpty,
  const TTableName extends TString.NonEmpty,
  const TSlice extends TString.NonEmpty,
>(
  id: EntityId.EntityId.Instance<TTag, TTableName, TSlice>
) => console.log(id);
