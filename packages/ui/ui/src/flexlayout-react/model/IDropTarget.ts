import type { DockLocation } from "../DockLocation";
import type { DropInfo } from "../DropInfo";
import type { IDraggable } from "./IDraggable";
import type { Node } from "./Node";

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
