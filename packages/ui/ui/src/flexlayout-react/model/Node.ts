import { $UiId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import { noOp } from "@beep/utils";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Pipeable from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import type { DropInfo } from "../DropInfo";
import { Orientation } from "../Orientation";
import { Rect } from "../Rect";
import type { IDraggable } from "./IDraggable";
import type { JsonBorderNode, JsonRowNode, JsonTabNode, JsonTabSetNode } from "./JsonModel.ts";
import type { IModel, Model } from "./Model";

export abstract class Node extends Data.Class {
  /** @internal */
  protected model: Model;
  /** @internal */
  protected attributes: Record<string, UnsafeTypes.UnsafeAny>;
  /** @internal */
  protected parent?: undefined | Node;
  /** @internal */
  protected children: Node[];
  /** @internal */
  protected rect: Rect;
  /** @internal */
  protected path: string;
  /** @internal */
  protected listeners: Map<string, (params: UnsafeTypes.UnsafeAny) => void>;

  /** @internal */
  protected constructor(_model: Model) {
    super();
    this.model = _model;
    this.attributes = {};
    this.children = [];
    this.rect = Rect.empty();
    this.listeners = new Map();
    this.path = "";
  }

  getId() {
    let id = this.attributes.id;
    if (id !== undefined) {
      return id as string;
    }

    id = this.model.nextUniqueId();
    this.setId(id);

    return id as string;
  }

  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  }

  getModel() {
    return this.model;
  }

  getType() {
    return this.attributes.type as string;
  }

  getParent() {
    return this.parent;
  }

  getChildren() {
    return this.children;
  }

  getRect() {
    return this.rect;
  }

  getPath() {
    return this.path;
  }

  getOrientation(): Orientation {
    if (this.parent === undefined) {
      return this.model.isRootOrientationVertical() ? Orientation.VERT : Orientation.HORZ;
    }
    return Orientation.flip(this.parent.getOrientation());
  }

  // event can be: resize, visibility, maximize (on tabset), close
  setEventListener(event: string, callback: (params: UnsafeTypes.UnsafeAny) => void) {
    this.listeners.set(event, callback);
  }

  removeEventListener(event: string) {
    this.listeners.delete(event);
  }

  abstract toJson(): JsonRowNode | JsonBorderNode | JsonTabSetNode | JsonTabNode | undefined;

  /** @internal */
  setId(id: string) {
    this.attributes.id = id;
  }

  /** @internal */
  fireEvent(event: string, params: UnsafeTypes.UnsafeAny) {
    // console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
    F.pipe(
      O.fromNullable(this.listeners.get(event)),
      O.match({
        onNone: () => {},
        onSome: (listener) => listener(params),
      })
    );
  }

  /** @internal */
  getAttr(name: string) {
    let val = this.attributes[name];

    if (val === undefined) {
      const modelName = this.getAttributeDefinitions().getModelName(name);
      if (modelName !== undefined) {
        val = this.model.getAttribute(modelName);
      }
    }

    // console.log(name + "=" + val);
    return val;
  }

  /** @internal */
  forEachNode(fn: (node: Node, level: number) => void, level: number) {
    fn(this, level);
    level++;
    A.forEach(this.children, (node) => {
      node.forEachNode(fn, level);
    });
  }

  /** @internal */
  setPaths(path: string) {
    A.forEach(this.children, (node, i) => {
      let newPath = path;
      if (node.getType() === "row") {
        newPath += `/r${i}`;
      } else if (node.getType() === "tabset") {
        newPath += `/ts${i}`;
      } else if (node.getType() === "tab") {
        newPath += `/t${i}`;
      }

      node.path = newPath;

      node.setPaths(newPath);
    });
  }

  /** @internal */
  setParent(parent: Node) {
    this.parent = parent;
  }

  /** @internal */
  setRect(rect: Rect) {
    this.rect = rect;
  }

  /** @internal */
  setPath(path: string) {
    this.path = path;
  }

  /** @internal */
  setWeight(weight: number) {
    this.attributes.weight = weight;
  }

  /** @internal */
  setSelected(index: number) {
    this.attributes.selected = index;
  }

  /** @internal */
  findDropTargetNode(windowId: string, dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
    let rtn: DropInfo | undefined;
    if (this.rect.contains(x, y)) {
      if (this.model.getMaximizedTabset(windowId) !== undefined) {
        rtn = this.model.getMaximizedTabset(windowId)!.canDrop(dragNode, x, y);
      } else {
        rtn = this.canDrop(dragNode, x, y);
        if (rtn === undefined) {
          if (this.children.length !== 0) {
            rtn = F.pipe(
              this.children,
              A.findFirst((child) => {
                const dropInfo = child.findDropTargetNode(windowId, dragNode, x, y);
                return dropInfo !== undefined;
              }),
              O.flatMap((child) => O.fromNullable(child.findDropTargetNode(windowId, dragNode, x, y))),
              O.getOrUndefined
            );
          }
        }
      }
    }

    return rtn;
  }

  /** @internal */
  canDrop(_dragNode: Node & IDraggable, _x: number, _y: number): DropInfo | undefined {
    return undefined;
  }

  /** @internal */
  canDockInto(dragNode: Node & IDraggable, dropInfo: DropInfo | undefined): boolean {
    if (P.isNotNullable(dropInfo)) {
      if (dropInfo.location === DockLocation.CENTER && !dropInfo.node.isEnableDrop()) {
        return false;
      }

      // prevent named tabset docking into another tabset, since this would lose the header
      if (
        dropInfo.location === DockLocation.CENTER &&
        dragNode.getType() === "tabset" &&
        dragNode.getName() !== undefined
      ) {
        return false;
      }

      if (dropInfo.location !== DockLocation.CENTER && !dropInfo.node.isEnableDivide()) {
        return false;
      }

      // finally check model callback to check if drop allowed
      if (this.model.getOnAllowDrop()) {
        return (this.model.getOnAllowDrop() as (dragNode: Node, dropInfo: DropInfo) => boolean)(dragNode, dropInfo);
      }
    }
    return true;
  }

  /** @internal */
  removeChild(childNode: Node): number {
    return F.pipe(
      A.findFirstIndex(this.children, (child) => child === childNode),
      O.match({
        onNone: () => -1,
        onSome: (pos) => {
          this.children = A.remove(this.children, pos);
          return pos;
        },
      })
    );
  }

  /** @internal */
  addChild(childNode: Node, pos?: undefined | number): number {
    if (pos != null) {
      this.children = F.pipe(
        A.insertAt(this.children, pos, childNode),
        O.getOrElse(() => this.children)
      );
    } else {
      this.children = A.append(this.children, childNode);
      pos = this.children.length - 1;
    }
    childNode.parent = this;
    return pos;
  }

  /** @internal */
  removeAll() {
    this.children = [];
  }

  /** @internal */
  styleWithPosition(style?: undefined | Record<string, UnsafeTypes.UnsafeAny>) {
    if (style == null) {
      style = {};
    }
    return this.rect.styleWithPosition(style);
  }

  /** @internal */
  isEnableDivide() {
    return true;
  }

  /**
   * Custom toJSON for safe serialization (e.g., console.log, JSON.stringify).
   * This prevents serialization tools from traversing into model/parent references,
   * which could lead to cross-origin Window references and throw SecurityError.
   */
  toJSON(): { readonly type: string; readonly id: string; readonly attributes: Record<string, UnsafeTypes.UnsafeAny> } {
    return {
      type: this.getType(),
      id: this.getId(),
      attributes: { ...this.attributes },
    };
  }

  /** @internal */
  toAttributeString() {
    return JSON.stringify(this.attributes, undefined, "\t");
  }

  // implemented by subclasses
  /** @internal */
  abstract updateAttrs(json: UnsafeTypes.UnsafeAny): void;

  /** @internal */
  abstract getAttributeDefinitions(): AttributeDefinitions;
}

// ============================================================================
// INode Schema Class - Effect Schema version of Node
// ============================================================================

const $I = $UiId.create("flexlayout-react/model/Node");

/**
 * Serializable data for INode - contains only the fields that can be persisted
 */
export class INodeData extends S.Class<INodeData>($I`INodeData`)({
  id: S.OptionFromUndefinedOr(S.String),
  type: S.NonEmptyTrimmedString,
  weight: S.OptionFromUndefinedOr(S.Number),
  selected: S.OptionFromUndefinedOr(S.Number),
}) {}

/**
 * Effect Schema version of the Node abstract class.
 *
 * Since Effect Schema classes cannot be abstract, this uses a concrete base
 * with runtime checks for methods that must be overridden by subclasses.
 *
 * Non-serializable runtime fields (model, parent, children, rect, path, listeners)
 * are managed as private instance properties outside the schema.
 */
export class INode extends S.Class<INode>($I`INode`)({
  data: INodeData,
}) {
  // ========================================================================
  // Non-serializable runtime fields (outside schema)
  // ========================================================================
  private _model: O.Option<IModel> = O.none();
  private _parent: O.Option<INode> = O.none();
  private _children: INode[] = [];
  private _rect: Rect = Rect.empty();
  private _path = "";
  private _listeners: Map<string, (params: UnsafeTypes.UnsafeAny) => void> = new Map();
  private _attributes: Record<string, UnsafeTypes.UnsafeAny> = {};

  // ========================================================================
  // Abstract method stubs (throw to indicate must be overridden)
  // ========================================================================

  /**
   * Serialize this node to JSON format.
   * Must be implemented by subclasses.
   */
  toJson(): JsonRowNode | JsonBorderNode | JsonTabSetNode | JsonTabNode | undefined {
    throw new Error("INode.toJson() must be implemented by subclass");
  }

  /**
   * Update attributes from JSON.
   * Must be implemented by subclasses.
   * @internal
   */
  updateAttrs(_json: UnsafeTypes.UnsafeAny): void {
    throw new Error("INode.updateAttrs() must be implemented by subclass");
  }

  /**
   * Get attribute definitions for this node type.
   * Must be implemented by subclasses.
   * @internal
   */
  getAttributeDefinitions(): AttributeDefinitions {
    throw new Error("INode.getAttributeDefinitions() must be implemented by subclass");
  }

  // ========================================================================
  // Initialization helpers (for subclasses)
  // ========================================================================

  /** @internal */
  protected initializeModel(model: IModel): void {
    this._model = O.some(model);
    this._attributes = {};
  }

  /** @internal - Provides access to attributes for subclasses */
  protected getAttributes(): Record<string, UnsafeTypes.UnsafeAny> {
    return this._attributes;
  }

  // ========================================================================
  // Concrete methods (copied from Node class)
  // ========================================================================

  getId(): string {
    let id = this._attributes.id;
    if (id !== undefined) {
      return id as string;
    }

    const model = O.getOrThrow(this._model);
    id = model.nextUniqueId();
    this.setId(id);

    return id as string;
  }

  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  }

  getModel(): IModel {
    return O.getOrThrow(this._model);
  }

  getType(): string {
    return this._attributes.type as string;
  }

  getParent(): INode | undefined {
    return O.getOrUndefined(this._parent);
  }

  getChildren(): INode[] {
    return this._children;
  }

  getRect(): Rect {
    return this._rect;
  }

  getPath(): string {
    return this._path;
  }

  getOrientation(): Orientation {
    const parent = O.getOrUndefined(this._parent);
    if (parent === undefined) {
      return this.getModel().isRootOrientationVertical() ? Orientation.VERT : Orientation.HORZ;
    }
    return Orientation.flip(parent.getOrientation());
  }

  // event can be: resize, visibility, maximize (on tabset), close
  setEventListener(event: string, callback: (params: UnsafeTypes.UnsafeAny) => void): void {
    this._listeners.set(event, callback);
  }

  removeEventListener(event: string): void {
    this._listeners.delete(event);
  }

  /** @internal */
  setId(id: string): void {
    this._attributes.id = id;
  }

  /** @internal */
  fireEvent(event: string, params: UnsafeTypes.UnsafeAny): void {
    F.pipe(
      O.fromNullable(this._listeners.get(event)),
      O.match({
        onNone: noOp,
        onSome: (listener) => listener(params),
      })
    );
  }

  /** @internal */
  getAttr(name: string): UnsafeTypes.UnsafeAny {
    let val = this._attributes[name];

    if (val === undefined) {
      const modelName = this.getAttributeDefinitions().getModelName(name);
      if (modelName !== undefined) {
        val = this.getModel().getAttribute(modelName);
      }
    }

    return val;
  }

  /** @internal */
  forEachNode(fn: (node: INode, level: number) => void, level: number): void {
    fn(this, level);
    const nextLevel = level + 1;
    A.forEach(this._children, (node) => {
      node.forEachNode(fn, nextLevel);
    });
  }

  /** @internal */
  setPaths(path: string): void {
    A.forEach(this._children, (node, i) => {
      let newPath = path;
      if (node.getType() === "row") {
        newPath += `/r${i}`;
      } else if (node.getType() === "tabset") {
        newPath += `/ts${i}`;
      } else if (node.getType() === "tab") {
        newPath += `/t${i}`;
      }

      node._path = newPath;
      node.setPaths(newPath);
    });
  }

  /** @internal */
  setParent(parent: INode): void {
    this._parent = O.some(parent);
  }

  /** @internal */
  setRect(rect: Rect): void {
    this._rect = rect;
  }

  /** @internal */
  setPath(path: string): void {
    this._path = path;
  }

  /** @internal */
  setWeight(weight: number): void {
    this._attributes.weight = weight;
  }

  /** @internal */
  setSelected(index: number): void {
    this._attributes.selected = index;
  }

  /** @internal */
  findDropTargetNode(windowId: string, dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined {
    let rtn: DropInfo | undefined;
    if (this._rect.contains(x, y)) {
      const model = this.getModel();
      if (P.isNotUndefined(model.getMaximizedTabset(windowId))) {
        // Type assertion needed: Model methods use Node types, INode is schema-based parallel
        rtn = model.getMaximizedTabset(windowId)!.canDrop(dragNode as unknown as Node & IDraggable, x, y);
      } else {
        rtn = this.canDrop(dragNode, x, y);
        if (rtn === undefined) {
          if (this._children.length !== 0) {
            rtn = F.pipe(
              this._children,
              A.findFirst((child) => {
                const dropInfo = child.findDropTargetNode(windowId, dragNode, x, y);
                return dropInfo !== undefined;
              }),
              O.flatMap((child) => O.fromNullable(child.findDropTargetNode(windowId, dragNode, x, y))),
              O.getOrUndefined
            );
          }
        }
      }
    }

    return rtn;
  }

  /** @internal */
  canDrop(_dragNode: INode & IDraggable, _x: number, _y: number): DropInfo | undefined {
    return undefined;
  }

  /** @internal */
  canDockInto(dragNode: INode & IDraggable, dropInfo: DropInfo | undefined): boolean {
    if (P.isNotNullable(dropInfo)) {
      if (dropInfo.location === DockLocation.CENTER && !dropInfo.node.isEnableDrop()) {
        return false;
      }

      // prevent named tabset docking into another tabset, since this would lose the header
      if (
        dropInfo.location === DockLocation.CENTER &&
        dragNode.getType() === "tabset" &&
        dragNode.getName() !== undefined
      ) {
        return false;
      }

      if (dropInfo.location !== DockLocation.CENTER && !dropInfo.node.isEnableDivide()) {
        return false;
      }

      // finally check model callback to check if drop allowed
      // Type assertion needed: Model's callback uses Node types, INode is schema-based parallel
      const model = this.getModel();
      if (model.getOnAllowDrop()) {
        return (model.getOnAllowDrop() as unknown as (dragNode: INode, dropInfo: DropInfo) => boolean)(
          dragNode,
          dropInfo
        );
      }
    }
    return true;
  }

  /** @internal */
  removeChild(childNode: INode): number {
    return F.pipe(
      A.findFirstIndex(this._children, (child) => child === childNode),
      O.match({
        onNone: () => -1,
        onSome: (pos) => {
          this._children = A.remove(this._children, pos);
          return pos;
        },
      })
    );
  }

  /** @internal */
  addChild(childNode: INode, pos?: undefined | number): number {
    if (P.isNotNullable(pos)) {
      this._children = F.pipe(
        A.insertAt(this._children, pos, childNode),
        O.getOrElse(() => this._children)
      );
    } else {
      this._children = A.append(this._children, childNode);
      pos = this._children.length - 1;
    }
    childNode._parent = O.some(this);
    return pos;
  }

  /** @internal */
  removeAll(): void {
    this._children = [];
  }

  /** @internal */
  styleWithPosition(style?: undefined | Record<string, UnsafeTypes.UnsafeAny>): Record<string, UnsafeTypes.UnsafeAny> {
    if (style == null) {
      style = {};
    }
    return this._rect.styleWithPosition(style);
  }

  /** @internal */
  isEnableDivide(): boolean {
    return true;
  }

  /**
   * Custom toJSON for safe serialization (e.g., console.log, JSON.stringify).
   * This prevents serialization tools from traversing into model/parent references,
   * which could lead to cross-origin Window references and throw SecurityError.
   */
  toJSON(): { readonly type: string; readonly id: string; readonly attributes: Record<string, UnsafeTypes.UnsafeAny> } {
    return {
      type: this.getType(),
      id: this.getId(),
      attributes: { ...this._attributes },
    };
  }

  /** @internal */
  toAttributeString(): string {
    return JSON.stringify(this._attributes, undefined, "\t");
  }
}
