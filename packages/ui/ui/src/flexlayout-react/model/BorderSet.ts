import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as O from "effect/Option";
import type { DockLocation } from "../DockLocation";
import type { DropInfo } from "../DropInfo";
import { BorderNode } from "./BorderNode";
import type { IDraggable } from "./IDraggable";
import type { Model } from "./Model";
import type { Node } from "./Node";
export class BorderSet extends Data.Class {
  /** @internal */
  private borders: BorderNode[];
  /** @internal */
  private readonly borderMap: Map<DockLocation, BorderNode>;
  /** @internal */
  private readonly layoutHorizontal: boolean;

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: Model) {
    const borderSet = new BorderSet(model);
    borderSet.borders = A.map(json as Array<UnsafeTypes.UnsafeAny>, (borderJson) => BorderNode.fromJson(borderJson, model));
    A.forEach(borderSet.borders, (border) => {
      borderSet.borderMap.set(border.getLocation(), border);
    });
    return borderSet;
  }

  /** @internal */
  constructor(_model: Model) {
    super();
    this.borders = [];
    this.borderMap = new Map<DockLocation, BorderNode>();
    this.layoutHorizontal = true;
  }

  toJson() {
    return A.map(this.borders, (borderNode) => borderNode.toJson());
  }

  /** @internal */
  getLayoutHorizontal() {
    return this.layoutHorizontal;
  }

  /** @internal */
  getBorders() {
    return this.borders;
  }

  /** @internal */
  getBorderMap() {
    return this.borderMap;
  }

  /** @internal */
  forEachNode(fn: (node: Node, level: number) => void) {
    A.forEach(this.borders, (borderNode) => {
      fn(borderNode, 0);
      A.forEach(borderNode.getChildren(), (node) => {
        node.forEachNode(fn, 1);
      });
    });
  }

  /** @internal */
  setPaths() {
    A.forEach(this.borders, (borderNode) => {
      const path = `/border/${borderNode.getLocation().getName()}`;
      borderNode.setPath(path);
      A.forEach(borderNode.getChildren(), (node, i) => {
        node.setPath(`${path}/t${i}`);
      });
    });
  }

  /** @internal */
  findDropTargetNode(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
    return A.findFirst(
      A.filter(this.borders, (border) => border.isShowing()),
      (border) => O.fromNullable(border.canDrop(dragNode, x, y))
    ).pipe(O.getOrUndefined);
  }
}
