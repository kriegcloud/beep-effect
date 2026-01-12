import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { Orientation } from "../Orientation";
import { CLASSES } from "../Types";
import { canDockToWindow } from "../view/Utils";
import { BorderNode } from "./BorderNode";
import type { IDraggable } from "./IDraggable";
import type { IDropTarget } from "./IDropTarget";
import { JsonRowNode } from "./JsonModel.ts";
import type { LayoutWindow } from "./LayoutWindow";
import type { IModel } from "./Model";
import { DefaultMax, DefaultMin, Model } from "./Model";
import { INode, Node } from "./Node";
import type { ITabNode, TabNode } from "./TabNode";
import { ITabSetNode, TabSetNode } from "./TabSetNode";

export class RowNode extends Node implements IDropTarget {
  static readonly TYPE = "row";

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: Model, layoutWindow: LayoutWindow) {
    const newLayoutNode = new RowNode(model, layoutWindow.windowId, json);

    if (json.children != null) {
      for (const jsonChild of json.children) {
        if (jsonChild.type === TabSetNode.TYPE) {
          const child = TabSetNode.fromJson(jsonChild, model, layoutWindow);
          newLayoutNode.addChild(child);
        } else {
          const child = RowNode.fromJson(jsonChild, model, layoutWindow);
          newLayoutNode.addChild(child);
        }
      }
    }

    return newLayoutNode;
  }

  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = RowNode.createAttributeDefinitions();

  /** @internal */
  private windowId: string;
  /** @internal */
  private minHeight: number;
  /** @internal */
  private minWidth: number;
  /** @internal */
  private maxHeight: number;
  /** @internal */
  private maxWidth: number;

  /** @internal */
  constructor(model: Model, windowId: string, json: UnsafeTypes.UnsafeAny) {
    super(model);

    this.windowId = windowId;
    this.minHeight = DefaultMin;
    this.minWidth = DefaultMin;
    this.maxHeight = DefaultMax;
    this.maxWidth = DefaultMax;
    RowNode.attributeDefinitions.fromJson(json, this.attributes);
    this.normalizeWeights();
    model.addNode(this);
  }

  getWeight() {
    return this.attributes.weight as number;
  }

  toJson(): JsonRowNode {
    const json: Record<string, unknown> = {};
    RowNode.attributeDefinitions.toJson(json, this.attributes);

    // Use Effect Array instead of for loop with push
    json.children = A.map(this.children, (child) => child.toJson());

    // Validate with Schema
    return S.decodeUnknownSync(JsonRowNode)(json);
  }

  /** @internal */
  getWindowId() {
    return this.windowId;
  }

  setWindowId(windowId: string) {
    this.windowId = windowId;
  }

  /** @internal */
  override setWeight(weight: number) {
    this.attributes.weight = weight;
  }

  /** @internal */
  getSplitterBounds(index: number): [number, number] {
    const h = this.getOrientation() === Orientation.HORZ;
    const c = this.getChildren();
    const ss = this.model.getSplitterSize();
    const fr = F.pipe(
      c,
      A.get(0),
      O.map((node) => node.getRect())
    );
    const lr = F.pipe(
      c,
      A.get(c.length - 1),
      O.map((node) => node.getRect())
    );

    const p0Initial = h
      ? F.pipe(
          fr,
          O.map((r) => r.x),
          O.getOrElse(() => 0)
        )
      : F.pipe(
          fr,
          O.map((r) => r.y),
          O.getOrElse(() => 0)
        );
    const p1Initial = h
      ? F.pipe(
          lr,
          O.map((r) => r.getRight()),
          O.getOrElse(() => 0)
        )
      : F.pipe(
          lr,
          O.map((r) => r.getBottom()),
          O.getOrElse(() => 0)
        );

    const q0Initial = h
      ? F.pipe(
          fr,
          O.map((r) => r.x),
          O.getOrElse(() => 0)
        )
      : F.pipe(
          fr,
          O.map((r) => r.y),
          O.getOrElse(() => 0)
        );
    const q1Initial = h
      ? F.pipe(
          lr,
          O.map((r) => r.getRight()),
          O.getOrElse(() => 0)
        )
      : F.pipe(
          lr,
          O.map((r) => r.getBottom()),
          O.getOrElse(() => 0)
        );

    let p0 = p0Initial;
    let p1 = p1Initial;
    let q0 = q0Initial;
    let q1 = q1Initial;

    for (let i = 0; i < index; i++) {
      const n = c[i] as TabSetNode | RowNode;
      p0 += h ? n.getMinWidth() : n.getMinHeight();
      q0 += h ? n.getMaxWidth() : n.getMaxHeight();
      if (i > 0) {
        p0 += ss;
        q0 += ss;
      }
    }

    for (let i = c.length - 1; i >= index; i--) {
      const n = c[i] as TabSetNode | RowNode;
      p1 -= (h ? n.getMinWidth() : n.getMinHeight()) + ss;
      q1 -= (h ? n.getMaxWidth() : n.getMaxHeight()) + ss;
    }

    return [Math.max(q1, p0), Math.min(q0, p1)];
  }

  /** @internal */
  getSplitterInitials(index: number) {
    const h = this.getOrientation() === Orientation.HORZ;
    const c = this.getChildren();
    const ss = this.model.getSplitterSize();
    const initialSizes = [];

    let sum = 0;

    for (let i = 0; i < c.length; i++) {
      const n = c[i] as TabSetNode | RowNode;
      const r = n.getRect();
      const s = h ? r.width : r.height;
      initialSizes.push(s);
      sum += s;
    }

    const startRect = F.pipe(
      c,
      A.get(index),
      O.map((node) => node.getRect())
    );
    const startPosition = F.pipe(
      startRect,
      O.map((r) => (h ? r.x : r.y) - ss),
      O.getOrElse(() => -ss)
    );

    return { initialSizes, sum, startPosition };
  }

  /** @internal */
  calculateSplit(index: number, splitterPos: number, initialSizes: number[], sum: number, startPosition: number) {
    const h = this.getOrientation() === Orientation.HORZ;
    const c = this.getChildren();
    const sn = c[index] as TabSetNode | RowNode;
    const smax = h ? sn.getMaxWidth() : sn.getMaxHeight();

    const sizes = [...initialSizes];

    const getSizeAt = (i: number): number =>
      F.pipe(
        sizes,
        A.get(i),
        O.getOrElse(() => 0)
      );
    const setSizeAt = (i: number, value: number): void => {
      if (i >= 0 && i < sizes.length) {
        sizes[i] = value;
      }
    };

    if (splitterPos < startPosition) {
      // moved left
      let shift = startPosition - splitterPos;
      let altShift = 0;
      const currentSize = getSizeAt(index);
      if (currentSize + shift > smax) {
        altShift = currentSize + shift - smax;
        setSizeAt(index, smax);
      } else {
        setSizeAt(index, currentSize + shift);
      }

      for (let i = index - 1; i >= 0; i--) {
        const n = c[i] as TabSetNode | RowNode;
        const m = h ? n.getMinWidth() : n.getMinHeight();
        const currentSize = getSizeAt(i);
        if (currentSize - shift > m) {
          setSizeAt(i, currentSize - shift);
          break;
        }
        shift -= currentSize - m;
        setSizeAt(i, m);
      }

      for (let i = index + 1; i < c.length; i++) {
        const n = c[i] as TabSetNode | RowNode;
        const m = h ? n.getMaxWidth() : n.getMaxHeight();
        const currentSize = getSizeAt(i);
        if (currentSize + altShift < m) {
          setSizeAt(i, currentSize + altShift);
          break;
        }
        altShift -= m - currentSize;
        setSizeAt(i, m);
      }
    } else {
      let shift = splitterPos - startPosition;
      let altShift = 0;
      const currentSize = getSizeAt(index - 1);
      if (currentSize + shift > smax) {
        altShift = currentSize + shift - smax;
        setSizeAt(index - 1, smax);
      } else {
        setSizeAt(index - 1, currentSize + shift);
      }

      for (let i = index; i < c.length; i++) {
        const n = c[i] as TabSetNode | RowNode;
        const m = h ? n.getMinWidth() : n.getMinHeight();
        const currentSize = getSizeAt(i);
        if (currentSize - shift > m) {
          setSizeAt(i, currentSize - shift);
          break;
        }
        shift -= currentSize - m;
        setSizeAt(i, m);
      }

      for (let i = index - 1; i >= 0; i--) {
        const n = c[i] as TabSetNode | RowNode;
        const m = h ? n.getMaxWidth() : n.getMaxHeight();
        const currentSize = getSizeAt(i);
        if (currentSize + altShift < m) {
          setSizeAt(i, currentSize + altShift);
          break;
        }
        altShift -= m - currentSize;
        setSizeAt(i, m);
      }
    }

    // 0.1 is to prevent weight ever going to zero
    // console.log(splitterPos, startPosition, "sizes", sizes);
    // console.log("weights",weights);
    return F.pipe(
      sizes,
      A.map((s) => (Math.max(0.1, s) * 100) / sum)
    );
  }

  /** @internal */
  getMinSize(orientation: Orientation) {
    if (orientation === Orientation.HORZ) {
      return this.getMinWidth();
    }
    return this.getMinHeight();
  }

  /** @internal */
  getMinWidth() {
    return this.minWidth;
  }

  /** @internal */
  getMinHeight() {
    return this.minHeight;
  }

  /** @internal */
  getMaxSize(orientation: Orientation) {
    if (orientation === Orientation.HORZ) {
      return this.getMaxWidth();
    }
    return this.getMaxHeight();
  }

  /** @internal */
  getMaxWidth() {
    return this.maxWidth;
  }

  /** @internal */
  getMaxHeight() {
    return this.maxHeight;
  }

  /** @internal */
  calcMinMaxSize() {
    this.minHeight = DefaultMin;
    this.minWidth = DefaultMin;
    this.maxHeight = DefaultMax;
    this.maxWidth = DefaultMax;
    let first = true;
    for (const child of this.children) {
      const c = child as RowNode | TabSetNode;
      c.calcMinMaxSize();
      if (this.getOrientation() === Orientation.VERT) {
        this.minHeight += c.getMinHeight();
        this.maxHeight += c.getMaxHeight();
        if (!first) {
          this.minHeight += this.model.getSplitterSize();
          this.maxHeight += this.model.getSplitterSize();
        }
        this.minWidth = Math.max(this.minWidth, c.getMinWidth());
        this.maxWidth = Math.min(this.maxWidth, c.getMaxWidth());
      } else {
        this.minWidth += c.getMinWidth();
        this.maxWidth += c.getMaxWidth();
        if (!first) {
          this.minWidth += this.model.getSplitterSize();
          this.maxWidth += this.model.getSplitterSize();
        }
        this.minHeight = Math.max(this.minHeight, c.getMinHeight());
        this.maxHeight = Math.min(this.maxHeight, c.getMaxHeight());
      }
      first = false;
    }
  }

  /** @internal */
  tidy() {
    let i = 0;
    while (i < this.children.length) {
      const child = this.children[i];
      if (child instanceof RowNode) {
        child.tidy();

        const childChildren = child.getChildren();
        if (childChildren.length === 0) {
          this.removeChild(child);
        } else if (childChildren.length === 1) {
          // hoist child/children up to this level
          const subchildOpt = F.pipe(childChildren, A.get(0));
          this.removeChild(child);

          F.pipe(
            subchildOpt,
            O.match({
              onNone: () => {},
              onSome: (subchild) => {
                if (subchild instanceof RowNode) {
                  let subChildrenTotal = 0;
                  const subChildChildren = subchild.getChildren();
                  for (const ssc of subChildChildren) {
                    const subsubChild = ssc as RowNode | TabSetNode;
                    subChildrenTotal += subsubChild.getWeight();
                  }
                  for (let j = 0; j < subChildChildren.length; j++) {
                    const subsubChild = subChildChildren[j] as RowNode | TabSetNode;
                    subsubChild.setWeight((child.getWeight() * subsubChild.getWeight()) / subChildrenTotal);
                    this.addChild(subsubChild, i + j);
                  }
                } else {
                  subchild.setWeight(child.getWeight());
                  this.addChild(subchild, i);
                }
              },
            })
          );
        } else {
          i++;
        }
      } else if (child instanceof TabSetNode && child.getChildren().length === 0) {
        if (child.isEnableDeleteWhenEmpty()) {
          this.removeChild(child);
          if (child === this.model.getMaximizedTabset(this.windowId)) {
            this.model.setMaximizedTabset(undefined, this.windowId);
          }
        } else {
          i++;
        }
      } else {
        i++;
      }
    }

    // add tabset into empty root
    if (this === this.model.getRoot(this.windowId) && this.children.length === 0) {
      const callback = this.model.getOnCreateTabSet();
      let attrs = callback ? callback() : {};
      attrs = { ...attrs, selected: -1 };
      const child = new TabSetNode(this.model, attrs);
      this.model.setActiveTabset(child, this.windowId);
      this.addChild(child);
    }
  }

  /** @internal */
  override canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
    const yy = y - this.rect.y;
    const xx = x - this.rect.x;
    const w = this.rect.width;
    const h = this.rect.height;
    const margin = 10; // height of edge rect
    const half = 50; // half width of edge rect
    let dropInfo: DropInfo | undefined = undefined;

    if (this.getWindowId() !== Model.MAIN_WINDOW_ID && !canDockToWindow(dragNode)) {
      return undefined;
    }

    if (this.model.isEnableEdgeDock() && this.parent === undefined) {
      if (x < this.rect.x + margin && yy > h / 2 - half && yy < h / 2 + half) {
        const dockLocation = DockLocation.LEFT;
        const outlineRect = dockLocation.getDockRect(this.rect);
        outlineRect.width = outlineRect.width / 2;
        dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      } else if (x > this.rect.getRight() - margin && yy > h / 2 - half && yy < h / 2 + half) {
        const dockLocation = DockLocation.RIGHT;
        const outlineRect = dockLocation.getDockRect(this.rect);
        outlineRect.width = outlineRect.width / 2;
        outlineRect.x += outlineRect.width;
        dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      } else if (y < this.rect.y + margin && xx > w / 2 - half && xx < w / 2 + half) {
        const dockLocation = DockLocation.TOP;
        const outlineRect = dockLocation.getDockRect(this.rect);
        outlineRect.height = outlineRect.height / 2;
        dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      } else if (y > this.rect.getBottom() - margin && xx > w / 2 - half && xx < w / 2 + half) {
        const dockLocation = DockLocation.BOTTOM;
        const outlineRect = dockLocation.getDockRect(this.rect);
        outlineRect.height = outlineRect.height / 2;
        outlineRect.y += outlineRect.height;
        dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      }

      if (dropInfo !== undefined) {
        if (!dragNode.canDockInto(dragNode, dropInfo)) {
          return undefined;
        }
      }
    }

    return dropInfo;
  }

  /** @internal */
  drop(dragNode: Node, location: DockLocation, index: number): void {
    const dockLocation = location;

    const parent = dragNode.getParent();

    if (parent) {
      parent.removeChild(dragNode);
    }

    if (parent !== undefined && parent! instanceof TabSetNode) {
      parent.setSelected(0);
    }

    if (parent !== undefined && parent! instanceof BorderNode) {
      parent.setSelected(-1);
    }

    let node: TabSetNode | RowNode | undefined;
    if (dragNode instanceof TabSetNode || dragNode instanceof RowNode) {
      node = dragNode;
      // need to turn round if same orientation unless docking oposite direction
      if (
        node instanceof RowNode &&
        node.getOrientation() === this.getOrientation() &&
        (location.getOrientation() === this.getOrientation() || location === DockLocation.CENTER)
      ) {
        node = new RowNode(this.model, this.windowId, {});
        node.addChild(dragNode);
      }
    } else {
      const callback = this.model.getOnCreateTabSet();
      node = new TabSetNode(this.model, callback ? callback(dragNode as TabNode) : {});
      node.addChild(dragNode);
    }
    let size = A.reduce(this.children, 0, (sum, child) => sum + (child as RowNode | TabSetNode).getWeight());

    if (size === 0) {
      size = 100;
    }

    node.setWeight(size / 3);

    const horz = !this.model.isRootOrientationVertical();
    if (dockLocation === DockLocation.CENTER) {
      if (index === -1) {
        this.addChild(node, this.children.length);
      } else {
        this.addChild(node, index);
      }
    } else if ((horz && dockLocation === DockLocation.LEFT) || (!horz && dockLocation === DockLocation.TOP)) {
      this.addChild(node, 0);
    } else if ((horz && dockLocation === DockLocation.RIGHT) || (!horz && dockLocation === DockLocation.BOTTOM)) {
      this.addChild(node);
    } else if ((horz && dockLocation === DockLocation.TOP) || (!horz && dockLocation === DockLocation.LEFT)) {
      const vrow = new RowNode(this.model, this.windowId, {});
      const hrow = new RowNode(this.model, this.windowId, {});
      hrow.setWeight(75);
      node.setWeight(25);
      A.forEach(this.children, (child) => {
        hrow.addChild(child);
      });
      this.removeAll();
      vrow.addChild(node);
      vrow.addChild(hrow);
      this.addChild(vrow);
    } else if ((horz && dockLocation === DockLocation.BOTTOM) || (!horz && dockLocation === DockLocation.RIGHT)) {
      const vrow = new RowNode(this.model, this.windowId, {});
      const hrow = new RowNode(this.model, this.windowId, {});
      hrow.setWeight(75);
      node.setWeight(25);
      A.forEach(this.children, (child) => {
        hrow.addChild(child);
      });
      this.removeAll();
      vrow.addChild(hrow);
      vrow.addChild(node);
      this.addChild(vrow);
    }

    if (node instanceof TabSetNode) {
      this.model.setActiveTabset(node, this.windowId);
    }

    this.model.tidy();
  }

  /** @internal */
  isEnableDrop() {
    return true;
  }

  /** @internal */
  getAttributeDefinitions() {
    return RowNode.attributeDefinitions;
  }

  /** @internal */
  updateAttrs(json: UnsafeTypes.UnsafeAny) {
    RowNode.attributeDefinitions.update(json, this.attributes);
  }

  /** @internal */
  static getAttributeDefinitions() {
    return RowNode.attributeDefinitions;
  }

  // NOTE:  flex-grow cannot have values < 1 otherwise will not fill parent, need to normalize
  normalizeWeights() {
    let sum = A.reduce(this.children, 0, (acc, n) => {
      const node = n as TabSetNode | RowNode;
      return acc + node.getWeight();
    });

    if (sum === 0) {
      sum = 1;
    }

    A.forEach(this.children, (n) => {
      const node = n as TabSetNode | RowNode;
      node.setWeight(Math.max(0.001, (100 * node.getWeight()) / sum));
    });
  }

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();
    attributeDefinitions.add("type", RowNode.TYPE, true).setType(Attribute.STRING).setFixed();
    attributeDefinitions
      .add("id", undefined)
      .setType(Attribute.STRING)
      .setDescription(`the unique id of the row, if left undefined a uuid will be assigned`);
    attributeDefinitions
      .add("weight", 100)
      .setType(Attribute.NUMBER)
      .setDescription(`relative weight for sizing of this row in parent row`);

    return attributeDefinitions;
  }
}

// ============================================================================
// IRowNode Schema Class - Effect Schema version of RowNode
// ============================================================================

/**
 * Effect Schema version of RowNode - a row container node.
 *
 * Extends INode using .extend() pattern and provides IDropTarget methods directly.
 * Can contain other IRowNodes (recursive) or ITabSetNodes.
 */
export class IRowNode extends INode.extend<IRowNode>("IRowNode")({}) {
  static readonly TYPE = "row";

  // ========================================================================
  // Static factory and attribute definitions
  // ========================================================================

  /**
   * Factory method for creating IRowNode instances.
   * @internal
   */
  static readonly new = (model: IModel, windowId: string, json: UnsafeTypes.UnsafeAny): IRowNode => {
    const instance = new IRowNode({ data: { id: O.none(), type: "row", weight: O.none(), selected: O.none() } });
    instance._initialize(model, windowId, json);
    return instance;
  };

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel, layoutWindow: LayoutWindow): IRowNode {
    const newLayoutNode = IRowNode.new(model, layoutWindow.windowId, json);

    if (json.children != null) {
      for (const jsonChild of json.children) {
        if (jsonChild.type === TabSetNode.TYPE) {
          const child = ITabSetNode.fromJson(jsonChild, model, layoutWindow);
          newLayoutNode.addChild(child);
        } else {
          const child = IRowNode.fromJson(jsonChild, model, layoutWindow);
          newLayoutNode.addChild(child);
        }
      }
    }

    return newLayoutNode;
  }

  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = IRowNode.createAttributeDefinitions();

  /** @internal */
  static getAttributeDefinitions(): AttributeDefinitions {
    return IRowNode.attributeDefinitions;
  }

  // ========================================================================
  // Non-serializable runtime fields
  // ========================================================================

  /** @internal */
  private _windowId = "";
  /** @internal */
  private _minHeight: number = DefaultMin;
  /** @internal */
  private _minWidth: number = DefaultMin;
  /** @internal */
  private _maxHeight: number = DefaultMax;
  /** @internal */
  private _maxWidth: number = DefaultMax;

  // ========================================================================
  // Initialization
  // ========================================================================

  /** @internal */
  private _initialize(model: IModel, windowId: string, json: UnsafeTypes.UnsafeAny): void {
    this._windowId = windowId;
    this._minHeight = DefaultMin;
    this._minWidth = DefaultMin;
    this._maxHeight = DefaultMax;
    this._maxWidth = DefaultMax;

    this.initializeModel(model);
    IRowNode.attributeDefinitions.fromJson(json, this.getAttributes());
    this.normalizeWeights();
    model.addNode(this);
  }

  // ========================================================================
  // Overridden abstract methods from INode
  // ========================================================================

  override toJson(): JsonRowNode {
    const json: Record<string, unknown> = {};
    IRowNode.attributeDefinitions.toJson(json, this.getAttributes());
    json.children = A.map(this.getChildren(), (child) => child.toJson());
    return S.decodeUnknownSync(JsonRowNode)(json);
  }

  /** @internal */
  override updateAttrs(json: UnsafeTypes.UnsafeAny): void {
    IRowNode.attributeDefinitions.update(json, this.getAttributes());
  }

  /** @internal */
  override getAttributeDefinitions(): AttributeDefinitions {
    return IRowNode.attributeDefinitions;
  }

  // ========================================================================
  // Getter methods
  // ========================================================================

  getWeight(): number {
    return this.getAttributes().weight as number;
  }

  /** @internal */
  getWindowId(): string {
    return this._windowId;
  }

  setWindowId(windowId: string): void {
    this._windowId = windowId;
  }

  /** @internal */
  override setWeight(weight: number): void {
    this.getAttributes().weight = weight;
  }

  /** @internal */
  getMinSize(orientation: Orientation): number {
    if (orientation === Orientation.HORZ) {
      return this.getMinWidth();
    }
    return this.getMinHeight();
  }

  /** @internal */
  getMinWidth(): number {
    return this._minWidth;
  }

  /** @internal */
  getMinHeight(): number {
    return this._minHeight;
  }

  /** @internal */
  getMaxSize(orientation: Orientation): number {
    if (orientation === Orientation.HORZ) {
      return this.getMaxWidth();
    }
    return this.getMaxHeight();
  }

  /** @internal */
  getMaxWidth(): number {
    return this._maxWidth;
  }

  /** @internal */
  getMaxHeight(): number {
    return this._maxHeight;
  }

  // ========================================================================
  // IDropTarget methods (no implements clause)
  // ========================================================================

  /** @internal */
  isEnableDrop(): boolean {
    return true;
  }

  /** @internal */
  override canDrop(dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined {
    const yy = y - this.getRect().y;
    const xx = x - this.getRect().x;
    const w = this.getRect().width;
    const h = this.getRect().height;
    const margin = 10;
    const half = 50;
    let dropInfo: DropInfo | undefined = undefined;
    const dragAsNode = dragNode as unknown as Node & IDraggable;
    const thisAsNode = this as unknown as Node & IDropTarget;

    if (this.getWindowId() !== Model.MAIN_WINDOW_ID && !canDockToWindow(dragAsNode)) {
      return undefined;
    }

    if (this.getModel().isEnableEdgeDock() && this.getParent() === undefined) {
      if (x < this.getRect().x + margin && yy > h / 2 - half && yy < h / 2 + half) {
        const dockLocation = DockLocation.LEFT;
        const outlineRect = dockLocation.getDockRect(this.getRect());
        outlineRect.width = outlineRect.width / 2;
        dropInfo = new DropInfo(thisAsNode, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      } else if (x > this.getRect().getRight() - margin && yy > h / 2 - half && yy < h / 2 + half) {
        const dockLocation = DockLocation.RIGHT;
        const outlineRect = dockLocation.getDockRect(this.getRect());
        outlineRect.width = outlineRect.width / 2;
        outlineRect.x += outlineRect.width;
        dropInfo = new DropInfo(thisAsNode, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      } else if (y < this.getRect().y + margin && xx > w / 2 - half && xx < w / 2 + half) {
        const dockLocation = DockLocation.TOP;
        const outlineRect = dockLocation.getDockRect(this.getRect());
        outlineRect.height = outlineRect.height / 2;
        dropInfo = new DropInfo(thisAsNode, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      } else if (y > this.getRect().getBottom() - margin && xx > w / 2 - half && xx < w / 2 + half) {
        const dockLocation = DockLocation.BOTTOM;
        const outlineRect = dockLocation.getDockRect(this.getRect());
        outlineRect.height = outlineRect.height / 2;
        outlineRect.y += outlineRect.height;
        dropInfo = new DropInfo(thisAsNode, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
      }

      if (dropInfo !== undefined) {
        if (!dragAsNode.canDockInto(dragAsNode, dropInfo)) {
          return undefined;
        }
      }
    }

    return dropInfo;
  }

  /** @internal */
  drop(dragNode: Node, location: DockLocation, index: number): void {
    const dockLocation = location;

    const parent = dragNode.getParent();

    if (parent) {
      parent.removeChild(dragNode);
    }

    if (parent !== undefined && parent! instanceof TabSetNode) {
      parent.setSelected(0);
    }

    if (parent !== undefined && parent! instanceof BorderNode) {
      parent.setSelected(-1);
    }

    let node: ITabSetNode | IRowNode | TabSetNode | RowNode | undefined;
    if (dragNode instanceof TabSetNode || dragNode instanceof RowNode) {
      node = dragNode;
      if (
        node instanceof RowNode &&
        node.getOrientation() === this.getOrientation() &&
        (location.getOrientation() === this.getOrientation() || location === DockLocation.CENTER)
      ) {
        node = IRowNode.new(this.getModel(), this._windowId, {});
        node.addChild(dragNode as unknown as INode);
      }
    } else {
      const callback = this.getModel().getOnCreateTabSet();
      node = ITabSetNode.new(this.getModel(), callback ? callback(dragNode as unknown as ITabNode) : {});
      node.addChild(dragNode as unknown as INode);
    }
    let size = A.reduce(
      this.getChildren(),
      0,
      (sum, child) => sum + (child as unknown as RowNode | TabSetNode).getWeight()
    );

    if (size === 0) {
      size = 100;
    }

    node.setWeight(size / 3);

    const horz = !this.getModel().isRootOrientationVertical();
    if (dockLocation === DockLocation.CENTER) {
      if (index === -1) {
        this.addChild(node as unknown as INode, this.getChildren().length);
      } else {
        this.addChild(node as unknown as INode, index);
      }
    } else if ((horz && dockLocation === DockLocation.LEFT) || (!horz && dockLocation === DockLocation.TOP)) {
      this.addChild(node as unknown as INode, 0);
    } else if ((horz && dockLocation === DockLocation.RIGHT) || (!horz && dockLocation === DockLocation.BOTTOM)) {
      this.addChild(node as unknown as INode);
    } else if ((horz && dockLocation === DockLocation.TOP) || (!horz && dockLocation === DockLocation.LEFT)) {
      const vrow = IRowNode.new(this.getModel(), this._windowId, {});
      const hrow = IRowNode.new(this.getModel(), this._windowId, {});
      hrow.setWeight(75);
      node.setWeight(25);
      A.forEach(this.getChildren(), (child) => {
        hrow.addChild(child as unknown as INode);
      });
      this.removeAll();
      vrow.addChild(node as unknown as INode);
      vrow.addChild(hrow);
      this.addChild(vrow);
    } else if ((horz && dockLocation === DockLocation.BOTTOM) || (!horz && dockLocation === DockLocation.RIGHT)) {
      const vrow = IRowNode.new(this.getModel(), this._windowId, {});
      const hrow = IRowNode.new(this.getModel(), this._windowId, {});
      hrow.setWeight(75);
      node.setWeight(25);
      A.forEach(this.getChildren(), (child) => {
        hrow.addChild(child as unknown as INode);
      });
      this.removeAll();
      vrow.addChild(hrow);
      vrow.addChild(node as unknown as INode);
      this.addChild(vrow);
    }

    if (node instanceof TabSetNode || node instanceof ITabSetNode) {
      this.getModel().setActiveTabset(node as ITabSetNode, this._windowId);
    }

    this.getModel().tidy();
  }

  // ========================================================================
  // Internal methods
  // ========================================================================

  /** @internal */
  calcMinMaxSize(): void {
    this._minHeight = DefaultMin;
    this._minWidth = DefaultMin;
    this._maxHeight = DefaultMax;
    this._maxWidth = DefaultMax;
    let first = true;
    for (const child of this.getChildren()) {
      const c = child as unknown as RowNode | TabSetNode;
      c.calcMinMaxSize();
      if (this.getOrientation() === Orientation.VERT) {
        this._minHeight += c.getMinHeight();
        this._maxHeight += c.getMaxHeight();
        if (!first) {
          this._minHeight += this.getModel().getSplitterSize();
          this._maxHeight += this.getModel().getSplitterSize();
        }
        this._minWidth = Math.max(this._minWidth, c.getMinWidth());
        this._maxWidth = Math.min(this._maxWidth, c.getMaxWidth());
      } else {
        this._minWidth += c.getMinWidth();
        this._maxWidth += c.getMaxWidth();
        if (!first) {
          this._minWidth += this.getModel().getSplitterSize();
          this._maxWidth += this.getModel().getSplitterSize();
        }
        this._minHeight = Math.max(this._minHeight, c.getMinHeight());
        this._maxHeight = Math.min(this._maxHeight, c.getMaxHeight());
      }
      first = false;
    }
  }

  /** @internal */
  tidy(): void {
    let i = 0;
    while (i < this.getChildren().length) {
      const child = this.getChildren()[i];
      if (child instanceof IRowNode) {
        child.tidy();

        const childChildren = child.getChildren();
        if (childChildren.length === 0) {
          this.removeChild(child);
        } else if (childChildren.length === 1) {
          const subchildOpt = F.pipe(childChildren, A.get(0));
          this.removeChild(child);

          F.pipe(
            subchildOpt,
            O.match({
              onNone: () => {},
              onSome: (subchild) => {
                if (subchild instanceof IRowNode) {
                  let subChildrenTotal = 0;
                  const subChildChildren = subchild.getChildren();
                  for (const ssc of subChildChildren) {
                    const subsubChild = ssc as unknown as RowNode | TabSetNode;
                    subChildrenTotal += subsubChild.getWeight();
                  }
                  for (let j = 0; j < subChildChildren.length; j++) {
                    const subsubChild = subChildChildren[j] as unknown as RowNode | TabSetNode;
                    subsubChild.setWeight((child.getWeight() * subsubChild.getWeight()) / subChildrenTotal);
                    this.addChild(subsubChild as unknown as INode, i + j);
                  }
                } else {
                  subchild.setWeight(child.getWeight());
                  this.addChild(subchild, i);
                }
              },
            })
          );
        } else {
          i++;
        }
      } else if (child instanceof ITabSetNode && child.getChildren().length === 0) {
        if (child.isEnableDeleteWhenEmpty()) {
          this.removeChild(child);
          if ((child as unknown as TabSetNode) === this.getModel().getMaximizedTabset(this._windowId)) {
            this.getModel().setMaximizedTabset(undefined, this._windowId);
          }
        } else {
          i++;
        }
      } else {
        i++;
      }
    }

    // add tabset into empty root
    if ((this as unknown as RowNode) === this.getModel().getRoot(this._windowId) && this.getChildren().length === 0) {
      const callback = this.getModel().getOnCreateTabSet();
      let attrs = callback ? callback() : {};
      attrs = { ...attrs, selected: -1 };
      const childNode = ITabSetNode.new(this.getModel(), attrs);
      this.getModel().setActiveTabset(childNode, this._windowId);
      this.addChild(childNode);
    }
  }

  normalizeWeights(): void {
    let sum = A.reduce(this.getChildren(), 0, (acc, n) => {
      const node = n as unknown as TabSetNode | RowNode;
      return acc + node.getWeight();
    });

    if (sum === 0) {
      sum = 1;
    }

    A.forEach(this.getChildren(), (n) => {
      const node = n as unknown as TabSetNode | RowNode;
      node.setWeight(Math.max(0.001, (100 * node.getWeight()) / sum));
    });
  }

  // ========================================================================
  // Private static methods
  // ========================================================================

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();
    attributeDefinitions.add("type", IRowNode.TYPE, true).setType(Attribute.STRING).setFixed();
    attributeDefinitions
      .add("id", undefined)
      .setType(Attribute.STRING)
      .setDescription(`the unique id of the row, if left undefined a uuid will be assigned`);
    attributeDefinitions
      .add("weight", 100)
      .setType(Attribute.NUMBER)
      .setDescription(`relative weight for sizing of this row in parent row`);

    return attributeDefinitions;
  }
}
