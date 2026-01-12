import { $UiId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { type DockLocation, IDockLocation } from "./DockLocation";
import type { IDropTarget } from "./model/IDropTarget";
import type { Node } from "./model/Node";
import { IRect, type Rect } from "./Rect";

const $I = $UiId.create("flexlayout-react/DropInfo");

export class IDropInfo extends S.Class<IDropInfo>($I`IDropInfo`)(
  {
    // node,
    rect: IRect,
    location: IDockLocation,
    index: S.Number,
    className: S.String,
  },
  $I.annotations("IDropInfo", {
    description: "An IDropInfo is a class of a DropInfo",
  })
) {
  static readonly new = (rect: IRect, location: IDockLocation, index: number, className: string) => {
    return new IDropInfo({
      rect,
      location,
      index,
      className,
    });
  };
}

export class DropInfo {
  node: Node & IDropTarget;
  rect: Rect;
  location: DockLocation;
  index: number;
  className: string;

  constructor(node: Node & IDropTarget, rect: Rect, location: DockLocation, index: number, className: string) {
    this.node = node;
    this.rect = rect;
    this.location = location;
    this.index = index;
    this.className = className;
  }
}
