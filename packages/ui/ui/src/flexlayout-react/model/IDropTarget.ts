import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { type DockLocation, IDockLocation } from "../DockLocation";
import { type DropInfo, IDropInfo } from "../DropInfo";
import { Draggable, type IDraggable } from "./IDraggable";
import { INode, type Node } from "./Node";

const $I = $UiId.create("flexlayout-react/model/IDropTarget");
//

export interface IDropTarget {
  /** @internal */
  readonly canDrop: (dragNode: Node & IDraggable, x: number, y: number) => DropInfo | undefined;
  /** @internal */
  readonly drop: (
    dragNode: Node & IDraggable,
    location: DockLocation,
    index: number,
    select?: undefined | boolean
  ) => void;
  /** @internal */
  readonly isEnableDrop: () => boolean;
}

export const CanDrop = BS.Fn({
  input: S.Struct({
    dragNode: INode.pipe(S.extend(Draggable)),
    x: S.Number,
    y: S.Number,
  }),
  output: IDropInfo,
});

export const Drop = BS.Fn({
  input: S.Struct({
    dragNode: INode,
    location: IDockLocation,
    index: S.Number,
    select: S.Boolean,
  }),
  output: S.Void,
});

export const IsEnableDrop = BS.Fn({
  input: INode,
  output: S.Boolean,
});

export class DropTarget extends S.Class<DropTarget>($I`DropTarget`)(
  {
    canDrop: CanDrop,
    drop: Drop,
    isEnableDrop: IsEnableDrop,
  },
  $I.annotations("DropTarget", {
    description: "Interface for drop targets",
  })
) {
  static readonly implementCanDrop = F.flow(CanDrop.implementSync);
  static readonly implementDrop = F.flow(Drop.implementSync);
  static readonly implementIsEnableDrop = F.flow(IsEnableDrop.implementSync);
}
