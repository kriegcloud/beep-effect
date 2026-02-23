import { BS } from "@beep/schema";
import { ArrayUtils, StructUtils } from "@beep/utils";
import * as F from "effect/Function";
import { Ids } from "./ids";

const sliceEntityIds = F.pipe(
  Ids,
  StructUtils.structEntries,
  ArrayUtils.NonEmptyReadonly.mapNonEmpty(([_, id]) => id.linkedActions().Options),
  ArrayUtils.NonEmptyReadonly.flatten,
  ArrayUtils.NonEmptyReadonly.mapNonEmpty(F.identity)
);

export class Action extends BS.StringLiteralKit(...sliceEntityIds) {}

export declare namespace Action {
  export type Type = typeof Action.Type;
}
