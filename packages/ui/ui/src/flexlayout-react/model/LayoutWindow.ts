import { $UiId } from "@beep/identity/packages";
import * as Data from "effect/Data";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { IRect, Rect } from "../Rect";
import type { LayoutInternal } from "../view/Layout";
import type { JsonPopout } from "./JsonModel.ts";
import type { IModel, Model } from "./Model";
import type { Node } from "./Node";
import { IRowNode, RowNode } from "./RowNode";
import type { TabSetNode } from "./TabSetNode";
export class LayoutWindow extends Data.Class {
  private readonly _windowId: string;
  private _layout: LayoutInternal | undefined;
  private _rect: Rect;
  private _window?: Window | undefined;
  private _root?: RowNode | undefined;
  private _maximizedTabSet?: TabSetNode | undefined;
  private _activeTabSet?: TabSetNode | undefined;
  private _toScreenRectFunction: (rect: Rect) => Rect;

  constructor(windowId: string, rect: Rect) {
    super();
    this._windowId = windowId;
    this._rect = rect;
    this._toScreenRectFunction = (r) => r;
  }

  public visitNodes(fn: (node: Node, level: number) => void) {
    this.root!.forEachNode(fn, 0);
  }

  public get windowId(): string {
    return this._windowId;
  }

  public get rect(): Rect {
    return this._rect;
  }

  public get layout(): LayoutInternal | undefined {
    return this._layout;
  }

  public get window(): Window | undefined {
    return this._window;
  }

  public get root(): RowNode | undefined {
    return this._root;
  }

  public get maximizedTabSet(): TabSetNode | undefined {
    return this._maximizedTabSet;
  }

  public get activeTabSet(): TabSetNode | undefined {
    return this._activeTabSet;
  }

  /** @internal */
  public set rect(value: Rect) {
    this._rect = value;
  }

  /** @internal */
  public set layout(value: LayoutInternal) {
    this._layout = value;
  }

  /** @internal */
  public set window(value: Window | undefined) {
    this._window = value;
  }

  /** @internal */
  public set root(value: RowNode | undefined) {
    this._root = value;
  }

  /** @internal */
  public set maximizedTabSet(value: TabSetNode | undefined) {
    this._maximizedTabSet = value;
  }

  /** @internal */
  public set activeTabSet(value: TabSetNode | undefined) {
    this._activeTabSet = value;
  }

  /** @internal */
  public get toScreenRectFunction(): (rect: Rect) => Rect {
    return this._toScreenRectFunction!;
  }

  /** @internal */
  public set toScreenRectFunction(value: (rect: Rect) => Rect) {
    this._toScreenRectFunction = value;
  }

  public toJson(): JsonPopout {
    // chrome sets top,left to large -ve values when minimized, dont save in this case
    // Wrapped in try-catch to handle potential cross-origin access errors
    try {
      if (this._window && this._window.screenTop > -10000) {
        this.rect = new Rect(
          this._window.screenLeft,
          this._window.screenTop,
          this._window.outerWidth,
          this._window.outerHeight
        );
      }
    } catch {
      // Ignore cross-origin access errors - use existing rect values
    }

    return { layout: this.root!.toJson(), rect: this.rect.toJson() };
  }

  /**
   * Custom toJSON for safe serialization (e.g., console.log, JSON.stringify).
   * This prevents serialization tools from traversing into Window references,
   * which would cause SecurityError when cross-origin iframes are present.
   */
  public toJSON(): { windowId: string; rect: ReturnType<Rect["toJson"]> } {
    return {
      windowId: this._windowId,
      rect: this._rect.toJson(),
    };
  }

  static fromJson(windowJson: JsonPopout, model: Model, windowId: string): LayoutWindow {
    const count = model.getwindowsMap().size;
    const rect = windowJson.rect
      ? Rect.fromJson(windowJson.rect)
      : new Rect(50 + 50 * count, 50 + 50 * count, 600, 400);
    rect.snap(10); // snapping prevents issue where window moves 1 pixel per save/restore on Chrome
    const layoutWindow = new LayoutWindow(windowId, rect);
    layoutWindow.root = RowNode.fromJson(windowJson.layout, model, layoutWindow);
    return layoutWindow;
  }
}

// ============================================================================
// ILayoutWindow Schema Class - Effect Schema version of LayoutWindow
// ============================================================================

const $I = $UiId.create("flexlayout-react/model/LayoutWindow");

/**
 * Serializable data for ILayoutWindow - contains only the fields that can be persisted
 */
export class ILayoutWindowData extends S.Class<ILayoutWindowData>($I`ILayoutWindowData`)({
  windowId: S.String,
  rect: IRect,
}) {}

/**
 * Effect Schema version of the LayoutWindow class.
 *
 * Non-serializable runtime fields (window, layout, root, maximizedTabSet, activeTabSet, toScreenRectFunction)
 * are managed as private instance properties outside the schema.
 */
export class ILayoutWindow extends S.Class<ILayoutWindow>($I`ILayoutWindow`)({
  data: ILayoutWindowData,
}) {
  // ========================================================================
  // Non-serializable runtime fields (outside schema)
  // ========================================================================
  private _window: O.Option<Window> = O.none();
  private _layout: O.Option<LayoutInternal> = O.none();
  private _root: O.Option<RowNode> = O.none();
  private _maximizedTabSet: O.Option<TabSetNode> = O.none();
  private _activeTabSet: O.Option<TabSetNode> = O.none();
  private _toScreenRectFunction: (rect: Rect) => Rect = (r) => r;

  // ========================================================================
  // Factory methods
  // ========================================================================

  static readonly new = (windowId: string, rect: IRect) =>
    new ILayoutWindow({
      data: new ILayoutWindowData({ windowId, rect }),
    });

  static readonly fromRect = (windowId: string, x: number, y: number, width: number, height: number) =>
    ILayoutWindow.new(windowId, IRect.new(x, y, width, height));

  // ========================================================================
  // Getters (matching original LayoutWindow interface)
  // ========================================================================

  get windowId(): string {
    return this.data.windowId;
  }

  get rect(): IRect {
    return this.data.rect;
  }

  get window(): Window | undefined {
    return O.getOrUndefined(this._window);
  }

  get layout(): LayoutInternal | undefined {
    return O.getOrUndefined(this._layout);
  }

  get root(): RowNode | undefined {
    return O.getOrUndefined(this._root);
  }

  get maximizedTabSet(): TabSetNode | undefined {
    return O.getOrUndefined(this._maximizedTabSet);
  }

  get activeTabSet(): TabSetNode | undefined {
    return O.getOrUndefined(this._activeTabSet);
  }

  get toScreenRectFunction(): (rect: Rect) => Rect {
    return this._toScreenRectFunction;
  }

  // ========================================================================
  // Setters (matching original LayoutWindow interface)
  // ========================================================================

  /** @internal */
  setRect(value: IRect): void {
    // Mutate the data.rect since IRect uses S.mutable
    this.data.rect.data.x = value.data.x;
    this.data.rect.data.y = value.data.y;
    this.data.rect.data.width = value.data.width;
    this.data.rect.data.height = value.data.height;
  }

  /** @internal */
  setLayout(value: LayoutInternal): void {
    this._layout = O.some(value);
  }

  /** @internal */
  setWindow(value: Window | undefined): void {
    this._window = O.fromNullable(value);
  }

  /** @internal */
  setRoot(value: RowNode | undefined): void {
    this._root = O.fromNullable(value);
  }

  /** @internal */
  setMaximizedTabSet(value: TabSetNode | undefined): void {
    this._maximizedTabSet = O.fromNullable(value);
  }

  /** @internal */
  setActiveTabSet(value: TabSetNode | undefined): void {
    this._activeTabSet = O.fromNullable(value);
  }

  /** @internal */
  setToScreenRectFunction(value: (rect: Rect) => Rect): void {
    this._toScreenRectFunction = value;
  }

  // ========================================================================
  // Methods (matching original LayoutWindow interface)
  // ========================================================================

  visitNodes(fn: (node: Node, level: number) => void): void {
    const root = O.getOrThrow(this._root);
    root.forEachNode(fn, 0);
  }

  toJson(): JsonPopout {
    // chrome sets top,left to large -ve values when minimized, dont save in this case
    // Wrapped in try-catch to handle potential cross-origin access errors
    try {
      const win = O.getOrUndefined(this._window);
      if (win && win.screenTop > -10000) {
        this.data.rect.data.x = win.screenLeft;
        this.data.rect.data.y = win.screenTop;
        this.data.rect.data.width = win.outerWidth;
        this.data.rect.data.height = win.outerHeight;
      }
    } catch {
      // Ignore cross-origin access errors - use existing rect values
    }

    const root = O.getOrThrow(this._root);
    return { layout: root.toJson(), rect: this.data.rect.toJson() };
  }

  /**
   * Custom toJSON for safe serialization (e.g., console.log, JSON.stringify).
   * This prevents serialization tools from traversing into Window references,
   * which would cause SecurityError when cross-origin iframes are present.
   */
  toJSON(): { windowId: string; rect: ReturnType<IRect["toJson"]> } {
    return {
      windowId: this.data.windowId,
      rect: this.data.rect.toJson(),
    };
  }

  static fromJson(windowJson: JsonPopout, model: IModel, windowId: string): ILayoutWindow {
    const count = model.getwindowsMap().size;
    const rect = windowJson.rect
      ? IRect.new(windowJson.rect.x, windowJson.rect.y, windowJson.rect.width, windowJson.rect.height)
      : IRect.new(50 + 50 * count, 50 + 50 * count, 600, 400);
    rect.snap(10); // snapping prevents issue where window moves 1 pixel per save/restore on Chrome
    const layoutWindow = ILayoutWindow.new(windowId, rect);
    layoutWindow.setRoot(
      IRowNode.fromJson(windowJson.layout, model, layoutWindow as unknown as LayoutWindow) as unknown as RowNode
    );
    return layoutWindow;
  }
}
