import { $UiId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { DockLocation } from "../DockLocation";
import type { DropInfo } from "../DropInfo";
import { BorderNode, IBorderNode } from "./BorderNode";
import type { IDraggable } from "./IDraggable";
import type { IModel, Model } from "./Model";
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
    borderSet.borders = A.map(json as Array<UnsafeTypes.UnsafeAny>, (borderJson) =>
      BorderNode.fromJson(borderJson, model)
    );
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

// ============================================================================
// IBorderSet Schema Class - Effect Schema version of BorderSet
// ============================================================================

const $I = $UiId.create("flexlayout-react/model/BorderSet");

/**
 * Serializable data for IBorderSet - contains only the fields that can be persisted.
 *
 * Note: The borders array content is serialized via toJson/fromJson methods,
 * not directly in the schema, since BorderNode instances have complex runtime state.
 */
export class IBorderSetData extends S.Class<IBorderSetData>($I`IBorderSetData`)({
  layoutHorizontal: S.Boolean,
}) {}

/**
 * Effect Schema version of the BorderSet class.
 *
 * Non-serializable runtime fields (borders, borderMap, model) are managed
 * as private instance properties outside the schema.
 *
 * The borders array is serializable in principle (via toJson), but the actual
 * BorderNode instances are complex objects with their own runtime state.
 */
export class IBorderSet extends S.Class<IBorderSet>($I`IBorderSet`)({
  data: IBorderSetData,
}) {
  // ========================================================================
  // Non-serializable runtime fields (outside schema)
  // ========================================================================
  private _borders: BorderNode[] = [];
  private _borderMap: Map<DockLocation, BorderNode> = new Map();

  // ========================================================================
  // Factory methods
  // ========================================================================

  static readonly new = (_model: IModel): IBorderSet => {
    return new IBorderSet({
      data: new IBorderSetData({ layoutHorizontal: true }),
    });
  };

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel): IBorderSet {
    const borderSet = IBorderSet.new(model);
    borderSet._borders = A.map(
      json as Array<UnsafeTypes.UnsafeAny>,
      (borderJson) => IBorderNode.fromJson(borderJson, model) as unknown as BorderNode
    );
    A.forEach(borderSet._borders, (border) => {
      borderSet._borderMap.set(border.getLocation(), border);
    });
    return borderSet;
  }

  // ========================================================================
  // Getters (matching original BorderSet interface)
  // ========================================================================

  /** @internal */
  getLayoutHorizontal(): boolean {
    return this.data.layoutHorizontal;
  }

  /** @internal */
  getBorders(): BorderNode[] {
    return this._borders;
  }

  /** @internal */
  getBorderMap(): Map<DockLocation, BorderNode> {
    return this._borderMap;
  }

  // ========================================================================
  // Methods (matching original BorderSet interface)
  // ========================================================================

  toJson(): UnsafeTypes.UnsafeAny[] {
    return A.map(this._borders, (borderNode) => borderNode.toJson());
  }

  /** @internal */
  forEachNode(fn: (node: Node, level: number) => void): void {
    A.forEach(this._borders, (borderNode) => {
      fn(borderNode, 0);
      A.forEach(borderNode.getChildren(), (node) => {
        node.forEachNode(fn, 1);
      });
    });
  }

  /** @internal */
  setPaths(): void {
    A.forEach(this._borders, (borderNode) => {
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
      A.filter(this._borders, (border) => border.isShowing()),
      (border) => O.fromNullable(border.canDrop(dragNode, x, y))
    ).pipe(O.getOrUndefined);
  }
}
