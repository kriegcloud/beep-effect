import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as S from "effect/Schema";

const $I = $UiId.create("flexlayout-react/model/IDraggable");
export const IsEnableDrag = BS.Fn({
  output: S.Boolean,
});

export const GetName = BS.Fn({
  output: S.UndefinedOr(S.String),
});

export class Draggable extends S.Class<Draggable>($I`Draggable`)({
  isEnableDrag: IsEnableDrag,
  getName: GetName,
}) {
  static readonly implementEnableDrag = F.flow(IsEnableDrag.implementSync);
  static readonly implementGetName = F.flow(GetName.implementSync);
}

export interface IDraggable {
  /** @internal */
  readonly isEnableDrag: () => boolean;
  /** @internal */
  readonly getName: () => string | undefined;
}
