import type { UnsafeTypes } from "@beep/types";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { Rect } from "../Rect";
import type { BorderNode } from "./BorderNode";
import type { IDraggable } from "./IDraggable";
import { JsonTabNode } from "./JsonModel.ts";
import type { IModel } from "./Model";
import { Model } from "./Model";
import { INode, Node } from "./Node";
import { ITabSetNode, TabSetNode } from "./TabSetNode";

export class TabNode extends Node implements IDraggable {
  static readonly TYPE = "tab";

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: Model, addToModel = true) {
    return new TabNode(model, json, addToModel);
  }

  /** @internal */
  private tabRect: Rect = Rect.empty();
  /** @internal */
  private moveableElement: HTMLElement | null;
  /** @internal */
  private tabStamp: HTMLElement | null;
  /** @internal */
  private renderedName?: undefined | string;
  /** @internal */
  private readonly extra: Record<string, UnsafeTypes.UnsafeAny>;
  /** @internal */
  private visible: boolean;
  /** @internal */
  private rendered: boolean;
  /** @internal */
  private scrollTop?: undefined | number;
  /** @internal */
  private scrollLeft?: undefined | number;

  /** @internal */
  constructor(model: Model, json: UnsafeTypes.UnsafeAny, addToModel = true) {
    super(model);

    this.extra = {}; // extra data added to node not saved in json
    this.moveableElement = null;
    this.tabStamp = null;
    this.rendered = false;
    this.visible = false;

    TabNode.attributeDefinitions.fromJson(json, this.attributes);
    if (addToModel) {
      model.addNode(this);
    }
  }

  getName() {
    return this.getAttr("name") as string;
  }

  getHelpText() {
    return this.getAttr("helpText") as string | undefined;
  }

  getComponent() {
    return this.getAttr("component") as string | undefined;
  }

  getWindowId() {
    if (this.parent instanceof TabSetNode) {
      return this.parent.getWindowId();
    }
    return Model.MAIN_WINDOW_ID;
  }

  getWindow(): Window | undefined {
    const layoutWindow = this.model.getwindowsMap().get(this.getWindowId());
    if (layoutWindow) {
      return layoutWindow.window;
    }
    return undefined;
  }

  /**
   * Returns the config attribute that can be used to store node specific data that
   * WILL be saved to the json. The config attribute should be changed via the action Actions.updateNodeAttributes rather
   * than directly, for example:
   * this.state.model.doAction(
   *   FlexLayout.Actions.updateNodeAttributes(node.getId(), {config:myConfigObject}));
   */
  getConfig() {
    return this.attributes.config;
  }

  /**
   * Returns an object that can be used to store transient node specific data that will
   * NOT be saved in the json.
   */
  getExtraData() {
    return this.extra;
  }

  isPoppedOut() {
    return this.getWindowId() !== Model.MAIN_WINDOW_ID;
  }

  isSelected() {
    return (this.getParent() as TabSetNode | BorderNode).getSelectedNode() === this;
  }

  getIcon() {
    return this.getAttr("icon") as string | undefined;
  }

  isEnableClose() {
    return this.getAttr("enableClose") as boolean;
  }

  getCloseType() {
    return this.getAttr("closeType") as number;
  }

  isEnablePopout() {
    return this.getAttr("enablePopout") as boolean;
  }

  isEnablePopoutIcon() {
    return this.getAttr("enablePopoutIcon") as boolean;
  }

  isEnablePopoutOverlay() {
    return this.getAttr("enablePopoutOverlay") as boolean;
  }

  isEnableDrag() {
    return this.getAttr("enableDrag") as boolean;
  }

  isEnableRename() {
    return this.getAttr("enableRename") as boolean;
  }

  isEnableWindowReMount() {
    return this.getAttr("enableWindowReMount") as boolean;
  }

  getClassName() {
    return this.getAttr("className") as string | undefined;
  }

  getContentClassName() {
    return this.getAttr("contentClassName") as string | undefined;
  }

  getTabSetClassName() {
    return this.getAttr("tabsetClassName") as string | undefined;
  }

  isEnableRenderOnDemand() {
    return this.getAttr("enableRenderOnDemand") as boolean;
  }

  getMinWidth() {
    return this.getAttr("minWidth") as number;
  }

  getMinHeight() {
    return this.getAttr("minHeight") as number;
  }

  getMaxWidth() {
    return this.getAttr("maxWidth") as number;
  }

  getMaxHeight() {
    return this.getAttr("maxHeight") as number;
  }

  isVisible() {
    return this.visible;
  }

  toJson(): JsonTabNode {
    const json: Record<string, unknown> = {};
    TabNode.attributeDefinitions.toJson(json, this.attributes);

    // Validate the constructed object matches the JsonTabNode schema
    // This provides runtime safety and early error detection if the object doesn't match expectations
    return S.decodeUnknownSync(JsonTabNode)(json);
  }

  /** @internal */
  saveScrollPosition() {
    if (this.moveableElement) {
      this.scrollLeft = this.moveableElement.scrollLeft;
      this.scrollTop = this.moveableElement.scrollTop;
      // console.log("save", this.getName(), this.scrollTop);
    }
  }

  /** @internal */
  restoreScrollPosition() {
    if (this.scrollTop) {
      requestAnimationFrame(() => {
        if (this.moveableElement) {
          if (this.scrollTop) {
            // console.log("restore", this.getName(), this.scrollTop);
            this.moveableElement.scrollTop = this.scrollTop;
            this.moveableElement.scrollLeft = this.scrollLeft!;
          }
        }
      });
    }
  }

  /** @internal */
  override setRect(rect: Rect) {
    if (!rect.equals(this.rect)) {
      this.fireEvent("resize", { rect });
      this.rect = rect;
    }
  }

  /** @internal */
  setVisible(visible: boolean) {
    if (visible !== this.visible) {
      this.visible = visible;
      this.fireEvent("visibility", { visible });
    }
  }

  /** @internal */
  getScrollTop() {
    return this.scrollTop;
  }

  /** @internal */
  setScrollTop(scrollTop: number | undefined) {
    this.scrollTop = scrollTop;
  }

  /** @internal */
  getScrollLeft() {
    return this.scrollLeft;
  }

  /** @internal */
  setScrollLeft(scrollLeft: number | undefined) {
    this.scrollLeft = scrollLeft;
  }

  /** @internal */
  isRendered() {
    return this.rendered;
  }

  /** @internal */
  setRendered(rendered: boolean) {
    this.rendered = rendered;
  }

  /** @internal */
  getTabRect() {
    return this.tabRect;
  }

  /** @internal */
  setTabRect(rect: Rect) {
    this.tabRect = rect;
  }

  /** @internal */
  getTabStamp() {
    return this.tabStamp;
  }

  /** @internal */
  setTabStamp(stamp: HTMLElement | null) {
    this.tabStamp = stamp;
  }

  /** @internal */
  getMoveableElement() {
    return this.moveableElement;
  }

  /** @internal */
  setMoveableElement(element: HTMLElement | null) {
    this.moveableElement = element;
  }

  /** @internal */
  setRenderedName(name: string) {
    this.renderedName = name;
  }

  /** @internal */
  getNameForOverflowMenu() {
    const altName = this.getAttr("altName") as string;
    if (altName !== undefined) {
      return altName;
    }
    return this.renderedName;
  }

  /** @internal */
  setName(name: string) {
    this.attributes.name = name;
  }

  /** @internal */
  delete() {
    (this.parent as TabSetNode | BorderNode).remove(this);
    this.fireEvent("close", {});
  }

  /** @internal */
  updateAttrs(json: UnsafeTypes.UnsafeAny) {
    TabNode.attributeDefinitions.update(json, this.attributes);
  }

  /** @internal */
  getAttributeDefinitions() {
    return TabNode.attributeDefinitions;
  }

  /** @internal */
  setBorderWidth(width: number) {
    this.attributes.borderWidth = width;
  }

  /** @internal */
  setBorderHeight(height: number) {
    this.attributes.borderHeight = height;
  }

  /** @internal */
  static getAttributeDefinitions() {
    return TabNode.attributeDefinitions;
  }

  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = TabNode.createAttributeDefinitions();

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();
    attributeDefinitions.add("type", TabNode.TYPE, true).setType(Attribute.STRING).setFixed();
    attributeDefinitions
      .add("id", undefined)
      .setType(Attribute.STRING)
      .setDescription(`the unique id of the tab, if left undefined a uuid will be assigned`);

    attributeDefinitions
      .add("name", "[Unnamed Tab]")
      .setType(Attribute.STRING)
      .setDescription(`name of tab to be displayed in the tab button`);
    attributeDefinitions
      .add("altName", undefined)
      .setType(Attribute.STRING)
      .setDescription(`if there is no name specifed then this value will be used in the overflow menu`);
    attributeDefinitions
      .add("helpText", undefined)
      .setType(Attribute.STRING)
      .setDescription(`An optional help text for the tab to be displayed upon tab hover.`);
    attributeDefinitions
      .add("component", undefined)
      .setType(Attribute.STRING)
      .setDescription(`string identifying which component to run (for factory)`);
    attributeDefinitions
      .add("config", undefined)
      .setType("UnsafeTypes.UnsafeAny")
      .setDescription(`a place to hold json config for the hosted component`);
    attributeDefinitions
      .add("tabsetClassName", undefined)
      .setType(Attribute.STRING)
      .setDescription(
        `class applied to parent tabset when this is the only tab and it is stretched to fill the tabset`
      );
    attributeDefinitions
      .add("enableWindowReMount", false)
      .setType(Attribute.BOOLEAN)
      .setDescription(`if enabled the tab will re-mount when popped out/in`);

    attributeDefinitions
      .addInherited("enableClose", "tabEnableClose")
      .setType(Attribute.BOOLEAN)
      .setDescription(`allow user to close tab via close button`);
    attributeDefinitions
      .addInherited("closeType", "tabCloseType")
      .setType("ICloseType")
      .setDescription(`see values in ICloseType`);
    attributeDefinitions
      .addInherited("enableDrag", "tabEnableDrag")
      .setType(Attribute.BOOLEAN)
      .setDescription(`allow user to drag tab to new location`);
    attributeDefinitions
      .addInherited("enableRename", "tabEnableRename")
      .setType(Attribute.BOOLEAN)
      .setDescription(`allow user to rename tabs by double clicking`);
    attributeDefinitions
      .addInherited("className", "tabClassName")
      .setType(Attribute.STRING)
      .setDescription(`class applied to tab button`);
    attributeDefinitions
      .addInherited("contentClassName", "tabContentClassName")
      .setType(Attribute.STRING)
      .setDescription(`class applied to tab content`);
    attributeDefinitions.addInherited("icon", "tabIcon").setType(Attribute.STRING).setDescription(`the tab icon`);
    attributeDefinitions
      .addInherited("enableRenderOnDemand", "tabEnableRenderOnDemand")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to avoid rendering component until tab is visible`);
    attributeDefinitions
      .addInherited("enablePopout", "tabEnablePopout")
      .setType(Attribute.BOOLEAN)
      .setAlias("enableFloat")
      .setDescription(`enable popout (in popout capable browser)`);
    attributeDefinitions
      .addInherited("enablePopoutIcon", "tabEnablePopoutIcon")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to show the popout icon in the tabset header if this tab enables popouts`);
    attributeDefinitions
      .addInherited("enablePopoutOverlay", "tabEnablePopoutOverlay")
      .setType(Attribute.BOOLEAN)
      .setDescription(
        `if this tab will not work correctly in a popout window when the main window is backgrounded (inactive)
            then enabling this option will gray out this tab`
      );

    attributeDefinitions
      .addInherited("borderWidth", "tabBorderWidth")
      .setType(Attribute.NUMBER)
      .setDescription(`width when added to border, -1 will use border size`);
    attributeDefinitions
      .addInherited("borderHeight", "tabBorderHeight")
      .setType(Attribute.NUMBER)
      .setDescription(`height when added to border, -1 will use border size`);
    attributeDefinitions
      .addInherited("minWidth", "tabMinWidth")
      .setType(Attribute.NUMBER)
      .setDescription(`the min width of this tab`);
    attributeDefinitions
      .addInherited("minHeight", "tabMinHeight")
      .setType(Attribute.NUMBER)
      .setDescription(`the min height of this tab`);
    attributeDefinitions
      .addInherited("maxWidth", "tabMaxWidth")
      .setType(Attribute.NUMBER)
      .setDescription(`the max width of this tab`);
    attributeDefinitions
      .addInherited("maxHeight", "tabMaxHeight")
      .setType(Attribute.NUMBER)
      .setDescription(`the max height of this tab`);

    return attributeDefinitions;
  }
}

// ============================================================================
// ITabNode Schema Class - Effect Schema version of TabNode
// ============================================================================

/**
 * Effect Schema version of TabNode - a leaf node representing an individual tab.
 *
 * Extends INode using .extend() pattern and overrides abstract methods with real implementations.
 * All serializable data is stored in inherited attributes.
 * Runtime-only fields are stored as private instance properties.
 *
 * Note: No `implements` clause - interface methods (IDraggable) are added directly.
 */
export class ITabNode extends INode.extend<ITabNode>("ITabNode")({}) {
  static readonly TYPE = "tab";

  // ========================================================================
  // Static factory and attribute definitions
  // ========================================================================

  /**
   * Factory method for creating ITabNode instances.
   * Required because Effect Schema classes cannot override constructors.
   * @internal
   */
  static readonly new = (model: IModel, json?: undefined | UnsafeTypes.UnsafeAny, addToModel = true): ITabNode => {
    const instance = new ITabNode({ data: { id: O.none(), type: "tab", weight: O.none(), selected: O.none() } });
    instance._initialize(model, json, addToModel);
    return instance;
  };

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel, addToModel = true): ITabNode {
    return ITabNode.new(model, json, addToModel);
  }

  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = ITabNode.createAttributeDefinitions();

  /** @internal */
  static getAttributeDefinitions(): AttributeDefinitions {
    return ITabNode.attributeDefinitions;
  }

  // ========================================================================
  // Non-serializable runtime fields (outside schema)
  // ========================================================================

  /** @internal */
  private _tabRect: Rect = Rect.empty();
  /** @internal */
  private _moveableElement: O.Option<HTMLElement> = O.none();
  /** @internal */
  private _tabStamp: O.Option<HTMLElement> = O.none();
  /** @internal */
  private _renderedName: O.Option<string> = O.none();
  /** @internal */
  private _extra: Record<string, UnsafeTypes.UnsafeAny> = {};
  /** @internal */
  private _visible = false;
  /** @internal */
  private _rendered = false;
  /** @internal */
  private _scrollTop: O.Option<number> = O.none();
  /** @internal */
  private _scrollLeft: O.Option<number> = O.none();

  // ========================================================================
  // Initialization (called by static factory)
  // ========================================================================

  /** @internal */
  private _initialize(model: IModel, json: UnsafeTypes.UnsafeAny, addToModel: boolean): void {
    this._extra = {}; // extra data added to node not saved in json
    this._rendered = false;
    this._visible = false;

    this.initializeModel(model);
    ITabNode.attributeDefinitions.fromJson(json, this.getAttributes());
    if (addToModel) {
      model.addNode(this);
    }
  }

  // ========================================================================
  // Overridden abstract methods from INode
  // ========================================================================

  override toJson(): JsonTabNode {
    const json: Record<string, unknown> = {};
    ITabNode.attributeDefinitions.toJson(json, this.getAttributes());

    // Validate the constructed object matches the JsonTabNode schema
    return S.decodeUnknownSync(JsonTabNode)(json);
  }

  /** @internal */
  override updateAttrs(json: UnsafeTypes.UnsafeAny): void {
    ITabNode.attributeDefinitions.update(json, this.getAttributes());
  }

  /** @internal */
  override getAttributeDefinitions(): AttributeDefinitions {
    return ITabNode.attributeDefinitions;
  }

  // ========================================================================
  // Getter methods
  // ========================================================================

  getName(): string {
    return this.getAttr("name") as string;
  }

  getHelpText(): string | undefined {
    return this.getAttr("helpText") as string | undefined;
  }

  getComponent(): string | undefined {
    return this.getAttr("component") as string | undefined;
  }

  getWindowId(): string {
    const parent = this.getParent();
    if (parent !== undefined && S.is(ITabSetNode)(parent)) {
      return parent.getWindowId();
    }
    return Model.MAIN_WINDOW_ID;
  }

  getWindow(): Window | undefined {
    const layoutWindow = this.getModel().getwindowsMap().get(this.getWindowId());
    if (layoutWindow) {
      return layoutWindow.window;
    }
    return undefined;
  }

  /**
   * Returns the config attribute that can be used to store node specific data that
   * WILL be saved to the json.
   */
  getConfig(): UnsafeTypes.UnsafeAny {
    return this.getAttributes().config;
  }

  /**
   * Returns an object that can be used to store transient node specific data that will
   * NOT be saved in the json.
   */
  getExtraData(): Record<string, UnsafeTypes.UnsafeAny> {
    return this._extra;
  }

  isPoppedOut(): boolean {
    return this.getWindowId() !== Model.MAIN_WINDOW_ID;
  }

  isSelected(): boolean {
    const parent = this.getParent();
    if (parent !== undefined) {
      const selectedNode = (parent as unknown as ITabSetNode | BorderNode).getSelectedNode();
      // Compare by identity - cast to unknown for comparison across type boundaries
      return selectedNode !== undefined && (selectedNode as unknown) === (this as unknown);
    }
    return false;
  }

  getIcon(): string | undefined {
    return this.getAttr("icon") as string | undefined;
  }

  isEnableClose(): boolean {
    return this.getAttr("enableClose") as boolean;
  }

  getCloseType(): number {
    return this.getAttr("closeType") as number;
  }

  isEnablePopout(): boolean {
    return this.getAttr("enablePopout") as boolean;
  }

  isEnablePopoutIcon(): boolean {
    return this.getAttr("enablePopoutIcon") as boolean;
  }

  isEnablePopoutOverlay(): boolean {
    return this.getAttr("enablePopoutOverlay") as boolean;
  }

  isEnableDrag(): boolean {
    return this.getAttr("enableDrag") as boolean;
  }

  isEnableRename(): boolean {
    return this.getAttr("enableRename") as boolean;
  }

  isEnableWindowReMount(): boolean {
    return this.getAttr("enableWindowReMount") as boolean;
  }

  getClassName(): string | undefined {
    return this.getAttr("className") as string | undefined;
  }

  getContentClassName(): string | undefined {
    return this.getAttr("contentClassName") as string | undefined;
  }

  getTabSetClassName(): string | undefined {
    return this.getAttr("tabsetClassName") as string | undefined;
  }

  isEnableRenderOnDemand(): boolean {
    return this.getAttr("enableRenderOnDemand") as boolean;
  }

  getMinWidth(): number {
    return this.getAttr("minWidth") as number;
  }

  getMinHeight(): number {
    return this.getAttr("minHeight") as number;
  }

  getMaxWidth(): number {
    return this.getAttr("maxWidth") as number;
  }

  getMaxHeight(): number {
    return this.getAttr("maxHeight") as number;
  }

  isVisible(): boolean {
    return this._visible;
  }

  // ========================================================================
  // Internal methods
  // ========================================================================

  /** @internal */
  saveScrollPosition(): void {
    O.match(this._moveableElement, {
      onNone: () => {},
      onSome: (element) => {
        this._scrollLeft = O.some(element.scrollLeft);
        this._scrollTop = O.some(element.scrollTop);
      },
    });
  }

  /** @internal */
  restoreScrollPosition(): void {
    O.match(this._scrollTop, {
      onNone: () => {},
      onSome: (scrollTop) => {
        requestAnimationFrame(() => {
          O.match(this._moveableElement, {
            onNone: () => {},
            onSome: (element) => {
              element.scrollTop = scrollTop;
              element.scrollLeft = O.getOrElse(this._scrollLeft, () => 0);
            },
          });
        });
      },
    });
  }

  /** @internal */
  override setRect(rect: Rect): void {
    const currentRect = this.getRect();
    if (!rect.equals(currentRect)) {
      this.fireEvent("resize", { rect });
      super.setRect(rect);
    }
  }

  /** @internal */
  setVisible(visible: boolean): void {
    if (visible !== this._visible) {
      this._visible = visible;
      this.fireEvent("visibility", { visible });
    }
  }

  /** @internal */
  getScrollTop(): number | undefined {
    return O.getOrUndefined(this._scrollTop);
  }

  /** @internal */
  setScrollTop(scrollTop: number | undefined): void {
    this._scrollTop = O.fromNullable(scrollTop);
  }

  /** @internal */
  getScrollLeft(): number | undefined {
    return O.getOrUndefined(this._scrollLeft);
  }

  /** @internal */
  setScrollLeft(scrollLeft: number | undefined): void {
    this._scrollLeft = O.fromNullable(scrollLeft);
  }

  /** @internal */
  isRendered(): boolean {
    return this._rendered;
  }

  /** @internal */
  setRendered(rendered: boolean): void {
    this._rendered = rendered;
  }

  /** @internal */
  getTabRect(): Rect {
    return this._tabRect;
  }

  /** @internal */
  setTabRect(rect: Rect): void {
    this._tabRect = rect;
  }

  /** @internal */
  getTabStamp(): HTMLElement | null {
    return O.getOrNull(this._tabStamp);
  }

  /** @internal */
  setTabStamp(stamp: HTMLElement | null): void {
    this._tabStamp = O.fromNullable(stamp);
  }

  /** @internal */
  getMoveableElement(): HTMLElement | null {
    return O.getOrNull(this._moveableElement);
  }

  /** @internal */
  setMoveableElement(element: HTMLElement | null): void {
    this._moveableElement = O.fromNullable(element);
  }

  /** @internal */
  setRenderedName(name: string): void {
    this._renderedName = O.some(name);
  }

  /** @internal */
  getNameForOverflowMenu(): string | undefined {
    const altName = this.getAttr("altName") as string;
    if (altName !== undefined) {
      return altName;
    }
    return O.getOrUndefined(this._renderedName);
  }

  /** @internal */
  setName(name: string): void {
    this.getAttributes().name = name;
  }

  /** @internal */
  delete(): void {
    const parent = this.getParent();
    if (parent !== undefined) {
      (parent as unknown as ITabSetNode | BorderNode).remove(this as unknown as TabNode);
    }
    this.fireEvent("close", {});
  }

  /** @internal */
  setBorderWidth(width: number): void {
    this.getAttributes().borderWidth = width;
  }

  /** @internal */
  setBorderHeight(height: number): void {
    this.getAttributes().borderHeight = height;
  }

  // ========================================================================
  // Private static methods
  // ========================================================================

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();
    attributeDefinitions.add("type", ITabNode.TYPE, true).setType(Attribute.STRING).setFixed();
    attributeDefinitions
      .add("id", undefined)
      .setType(Attribute.STRING)
      .setDescription(`the unique id of the tab, if left undefined a uuid will be assigned`);

    attributeDefinitions
      .add("name", "[Unnamed Tab]")
      .setType(Attribute.STRING)
      .setDescription(`name of tab to be displayed in the tab button`);
    attributeDefinitions
      .add("altName", undefined)
      .setType(Attribute.STRING)
      .setDescription(`if there is no name specifed then this value will be used in the overflow menu`);
    attributeDefinitions
      .add("helpText", undefined)
      .setType(Attribute.STRING)
      .setDescription(`An optional help text for the tab to be displayed upon tab hover.`);
    attributeDefinitions
      .add("component", undefined)
      .setType(Attribute.STRING)
      .setDescription(`string identifying which component to run (for factory)`);
    attributeDefinitions
      .add("config", undefined)
      .setType("UnsafeTypes.UnsafeAny")
      .setDescription(`a place to hold json config for the hosted component`);
    attributeDefinitions
      .add("tabsetClassName", undefined)
      .setType(Attribute.STRING)
      .setDescription(
        `class applied to parent tabset when this is the only tab and it is stretched to fill the tabset`
      );
    attributeDefinitions
      .add("enableWindowReMount", false)
      .setType(Attribute.BOOLEAN)
      .setDescription(`if enabled the tab will re-mount when popped out/in`);

    attributeDefinitions
      .addInherited("enableClose", "tabEnableClose")
      .setType(Attribute.BOOLEAN)
      .setDescription(`allow user to close tab via close button`);
    attributeDefinitions
      .addInherited("closeType", "tabCloseType")
      .setType("ICloseType")
      .setDescription(`see values in ICloseType`);
    attributeDefinitions
      .addInherited("enableDrag", "tabEnableDrag")
      .setType(Attribute.BOOLEAN)
      .setDescription(`allow user to drag tab to new location`);
    attributeDefinitions
      .addInherited("enableRename", "tabEnableRename")
      .setType(Attribute.BOOLEAN)
      .setDescription(`allow user to rename tabs by double clicking`);
    attributeDefinitions
      .addInherited("className", "tabClassName")
      .setType(Attribute.STRING)
      .setDescription(`class applied to tab button`);
    attributeDefinitions
      .addInherited("contentClassName", "tabContentClassName")
      .setType(Attribute.STRING)
      .setDescription(`class applied to tab content`);
    attributeDefinitions.addInherited("icon", "tabIcon").setType(Attribute.STRING).setDescription(`the tab icon`);
    attributeDefinitions
      .addInherited("enableRenderOnDemand", "tabEnableRenderOnDemand")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to avoid rendering component until tab is visible`);
    attributeDefinitions
      .addInherited("enablePopout", "tabEnablePopout")
      .setType(Attribute.BOOLEAN)
      .setAlias("enableFloat")
      .setDescription(`enable popout (in popout capable browser)`);
    attributeDefinitions
      .addInherited("enablePopoutIcon", "tabEnablePopoutIcon")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to show the popout icon in the tabset header if this tab enables popouts`);
    attributeDefinitions
      .addInherited("enablePopoutOverlay", "tabEnablePopoutOverlay")
      .setType(Attribute.BOOLEAN)
      .setDescription(
        `if this tab will not work correctly in a popout window when the main window is backgrounded (inactive)
            then enabling this option will gray out this tab`
      );

    attributeDefinitions
      .addInherited("borderWidth", "tabBorderWidth")
      .setType(Attribute.NUMBER)
      .setDescription(`width when added to border, -1 will use border size`);
    attributeDefinitions
      .addInherited("borderHeight", "tabBorderHeight")
      .setType(Attribute.NUMBER)
      .setDescription(`height when added to border, -1 will use border size`);
    attributeDefinitions
      .addInherited("minWidth", "tabMinWidth")
      .setType(Attribute.NUMBER)
      .setDescription(`the min width of this tab`);
    attributeDefinitions
      .addInherited("minHeight", "tabMinHeight")
      .setType(Attribute.NUMBER)
      .setDescription(`the min height of this tab`);
    attributeDefinitions
      .addInherited("maxWidth", "tabMaxWidth")
      .setType(Attribute.NUMBER)
      .setDescription(`the max width of this tab`);
    attributeDefinitions
      .addInherited("maxHeight", "tabMaxHeight")
      .setType(Attribute.NUMBER)
      .setDescription(`the max height of this tab`);

    return attributeDefinitions;
  }
}
