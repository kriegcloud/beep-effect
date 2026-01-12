import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { Orientation } from "../Orientation";
import { Rect } from "../Rect";
import { CLASSES } from "../Types";
import { canDockToWindow } from "../view/Utils";
import { BorderNode } from "./BorderNode";
import type { IDraggable } from "./IDraggable";
import type { IDropTarget } from "./IDropTarget";
import { JsonTabSetNode } from "./JsonModel.ts";
import type { LayoutWindow } from "./LayoutWindow";
import type { IModel } from "./Model";
import { Model } from "./Model";
import { INode, Node } from "./Node";
import { IRowNode, RowNode } from "./RowNode";
import { ITabNode, TabNode } from "./TabNode";
import { adjustSelectedIndex } from "./Utils";

export class TabSetNode extends Node implements IDraggable, IDropTarget {
  static readonly TYPE = "tabset";

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: Model, layoutWindow: LayoutWindow) {
    const newLayoutNode = new TabSetNode(model, json);

    if (json.children != null) {
      for (const jsonChild of json.children) {
        const child = TabNode.fromJson(jsonChild, model);
        newLayoutNode.addChild(child);
      }
    }
    if (newLayoutNode.children.length === 0) {
      newLayoutNode.setSelected(-1);
    }

    if (json.maximized && json.maximized === true) {
      layoutWindow.maximizedTabSet = newLayoutNode;
    }

    if (json.active && json.active === true) {
      layoutWindow.activeTabSet = newLayoutNode;
    }

    return newLayoutNode;
  }
  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = TabSetNode.createAttributeDefinitions();

  /** @internal */
  private tabStripRect: Rect = Rect.empty();
  /** @internal */
  private contentRect: Rect = Rect.empty();
  /** @internal */
  private calculatedMinHeight: number;
  /** @internal */
  private calculatedMinWidth: number;
  /** @internal */
  private calculatedMaxHeight: number;
  /** @internal */
  private calculatedMaxWidth: number;

  /** @internal */
  constructor(model: Model, json: UnsafeTypes.UnsafeAny) {
    super(model);
    this.calculatedMinHeight = 0;
    this.calculatedMinWidth = 0;
    this.calculatedMaxHeight = 0;
    this.calculatedMaxWidth = 0;

    TabSetNode.attributeDefinitions.fromJson(json, this.attributes);
    model.addNode(this);
  }

  getName() {
    return this.getAttr("name") as string | undefined;
  }

  isEnableActiveIcon() {
    return this.getAttr("enableActiveIcon") as boolean;
  }

  getSelected() {
    const selected = this.attributes.selected;
    if (selected !== undefined) {
      return selected as number;
    }
    return -1;
  }

  getSelectedNode() {
    const selected = this.getSelected();
    if (selected !== -1) {
      return this.children[selected];
    }
    return undefined;
  }

  getWeight(): number {
    return this.getAttr("weight") as number;
  }

  getAttrMinWidth() {
    return this.getAttr("minWidth") as number;
  }

  getAttrMinHeight() {
    return this.getAttr("minHeight") as number;
  }

  getMinWidth() {
    return this.calculatedMinWidth;
  }

  getMinHeight() {
    return this.calculatedMinHeight;
  }

  /** @internal */
  getMinSize(orientation: Orientation) {
    if (orientation === Orientation.HORZ) {
      return this.getMinWidth();
    }
    return this.getMinHeight();
  }
  getAttrMaxWidth() {
    return this.getAttr("maxWidth") as number;
  }

  getAttrMaxHeight() {
    return this.getAttr("maxHeight") as number;
  }

  getMaxWidth() {
    return this.calculatedMaxWidth;
  }

  getMaxHeight() {
    return this.calculatedMaxHeight;
  }

  /** @internal */
  getMaxSize(orientation: Orientation) {
    if (orientation === Orientation.HORZ) {
      return this.getMaxWidth();
    }
    return this.getMaxHeight();
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

  isMaximized() {
    return this.model.getMaximizedTabset(this.getWindowId()) === this;
  }

  isActive() {
    return this.model.getActiveTabset(this.getWindowId()) === this;
  }

  isEnableDeleteWhenEmpty() {
    return this.getAttr("enableDeleteWhenEmpty") as boolean;
  }

  isEnableDrop() {
    return this.getAttr("enableDrop") as boolean;
  }

  isEnableTabWrap() {
    return this.getAttr("enableTabWrap") as boolean;
  }

  isEnableDrag() {
    return this.getAttr("enableDrag") as boolean;
  }

  override isEnableDivide() {
    return this.getAttr("enableDivide") as boolean;
  }

  isEnableMaximize() {
    return this.getAttr("enableMaximize") as boolean;
  }

  isEnableClose() {
    return this.getAttr("enableClose") as boolean;
  }

  isEnableSingleTabStretch() {
    return this.getAttr("enableSingleTabStretch") as boolean;
  }

  isEnableTabStrip() {
    return this.getAttr("enableTabStrip") as boolean;
  }

  isAutoSelectTab() {
    return this.getAttr("autoSelectTab") as boolean;
  }

  isEnableTabScrollbar() {
    return this.getAttr("enableTabScrollbar") as boolean;
  }

  getClassNameTabStrip() {
    return this.getAttr("classNameTabStrip") as string | undefined;
  }

  getTabLocation() {
    return this.getAttr("tabLocation") as string;
  }

  toJson(): JsonTabSetNode {
    const json: Record<string, unknown> = {};
    TabSetNode.attributeDefinitions.toJson(json, this.attributes);

    // Use Effect Array instead of native .map()
    json.children = A.map(this.children, (child) => child.toJson());

    if (this.isActive()) {
      json.active = true;
    }

    if (this.isMaximized()) {
      json.maximized = true;
    }

    // Validate with Schema
    return S.decodeUnknownSync(JsonTabSetNode)(json);
  }

  /** @internal */
  calcMinMaxSize() {
    this.calculatedMinHeight = this.getAttrMinHeight();
    this.calculatedMinWidth = this.getAttrMinWidth();
    this.calculatedMaxHeight = this.getAttrMaxHeight();
    this.calculatedMaxWidth = this.getAttrMaxWidth();

    // Use Effect Array instead of for...of
    A.forEach(this.children, (child) => {
      const c = child as TabNode;
      this.calculatedMinWidth = Math.max(this.calculatedMinWidth, c.getMinWidth());
      this.calculatedMinHeight = Math.max(this.calculatedMinHeight, c.getMinHeight());
      this.calculatedMaxWidth = Math.min(this.calculatedMaxWidth, c.getMaxWidth());
      this.calculatedMaxHeight = Math.min(this.calculatedMaxHeight, c.getMaxHeight());
    });

    this.calculatedMinHeight += this.tabStripRect.height;
    this.calculatedMaxHeight += this.tabStripRect.height;
  }

  /** @internal */
  canMaximize() {
    if (this.isEnableMaximize()) {
      // always allow maximize toggle if already maximized
      if (this.getModel().getMaximizedTabset(this.getWindowId()) === this) {
        return true;
      }
      // only one tabset, so disable
      return !(
        this.getParent() === this.getModel().getRoot(this.getWindowId()) &&
        this.getModel().getRoot(this.getWindowId()).getChildren().length === 1
      );
    }
    return false;
  }

  /** @internal */
  setContentRect(rect: Rect) {
    this.contentRect = rect;
  }

  /** @internal */
  getContentRect() {
    return this.contentRect;
  }

  /** @internal */
  setTabStripRect(rect: Rect) {
    this.tabStripRect = rect;
  }
  /** @internal */
  override setWeight(weight: number) {
    this.attributes.weight = weight;
  }

  /** @internal */
  override setSelected(index: number) {
    this.attributes.selected = index;
  }

  getWindowId() {
    return (this.parent as RowNode).getWindowId();
  }

  /** @internal */
  override canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
    let dropInfo: DropInfo | undefined;

    if (dragNode === this) {
      const dockLocation = DockLocation.CENTER;
      const outlineRect = this.tabStripRect;
      dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
    } else if (this.getWindowId() !== Model.MAIN_WINDOW_ID && !canDockToWindow(dragNode)) {
      return undefined;
    } else if (this.contentRect!.contains(x, y)) {
      let dockLocation = DockLocation.CENTER;
      if (this.model.getMaximizedTabset((this.parent as RowNode).getWindowId()) === undefined) {
        dockLocation = DockLocation.getLocation(this.contentRect!, x, y);
      }
      const outlineRect = dockLocation.getDockRect(this.rect);
      dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
    } else if (this.tabStripRect?.contains(x, y)) {
      let r: Rect;
      let yy: number;
      let h: number;
      if (this.children.length === 0) {
        r = this.tabStripRect.clone();
        yy = r.y + 3;
        h = r.height - 4;
        r.width = 2;
      } else {
        let child = this.children[0] as TabNode;
        r = child.getTabRect()!;
        yy = r.y;
        h = r.height;
        let p = this.tabStripRect.x;
        let childCenter = 0;
        for (let i = 0; i < this.children.length; i++) {
          child = this.children[i] as TabNode;
          r = child.getTabRect()!;
          if (r.y !== yy) {
            yy = r.y;
            p = this.tabStripRect.x;
          }
          childCenter = r.x + r.width / 2;
          if (p <= x && x < childCenter && r.y < y && y < r.getBottom()) {
            const dockLocation = DockLocation.CENTER;
            const outlineRect = new Rect(r.x - 2, r.y, 3, r.height);
            if (this.rect.x < r.x && r.x < this.rect.getRight()) {
              dropInfo = new DropInfo(this, outlineRect, dockLocation, i, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
              break;
            }
            return undefined;
          }
          p = childCenter;
        }
      }
      if (dropInfo == null && r.getRight() < this.rect!.getRight()) {
        const dockLocation = DockLocation.CENTER;
        const outlineRect = new Rect(r.getRight() - 2, yy, 3, h);
        dropInfo = new DropInfo(
          this,
          outlineRect,
          dockLocation,
          this.children.length,
          CLASSES.FLEXLAYOUT__OUTLINE_RECT
        );
      }
    }

    if (!dragNode.canDockInto(dragNode, dropInfo)) {
      return undefined;
    }

    return dropInfo;
  }

  /** @internal */
  delete() {
    (this.parent as RowNode).removeChild(this);
  }

  /** @internal */
  remove(node: TabNode) {
    const removedIndex = this.removeChild(node);
    this.model.tidy();

    adjustSelectedIndex(this, removedIndex);
  }

  /** @internal */
  drop(dragNode: Node, location: DockLocation, index: number, select?: undefined | boolean) {
    const dockLocation = location;

    if (this === dragNode) {
      // tabset drop into itself
      return; // dock back to itself
    }

    let dragParent = dragNode.getParent() as BorderNode | TabSetNode | RowNode;
    let fromIndex = 0;
    if (dragParent !== undefined) {
      fromIndex = dragParent.removeChild(dragNode);
      // if selected node in border is being docked into tabset then deselect border tabs
      if (dragParent instanceof BorderNode && dragParent.getSelected() === fromIndex) {
        dragParent.setSelected(-1);
      } else {
        adjustSelectedIndex(dragParent, fromIndex);
      }
    }

    // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
    if (dragNode instanceof TabNode && dragParent === this && fromIndex < index && index > 0) {
      index--;
    }

    // simple_bundled dock to existing tabset
    if (dockLocation === DockLocation.CENTER) {
      let insertPos = index;
      if (insertPos === -1) {
        insertPos = this.children.length;
      }

      if (dragNode instanceof TabNode) {
        this.addChild(dragNode, insertPos);
        if (select || (select !== false && this.isAutoSelectTab())) {
          this.setSelected(insertPos);
        }
        // console.log("added child at : " + insertPos);
      } else if (dragNode instanceof RowNode) {
        (dragNode as RowNode).forEachNode((child, _level) => {
          if (child instanceof TabNode) {
            this.addChild(child, insertPos);
            // console.log("added child at : " + insertPos);
            insertPos++;
          }
        }, 0);
      } else {
        for (let i = 0; i < dragNode.getChildren().length; i++) {
          const child = dragNode.getChildren()[i]!;
          this.addChild(child, insertPos);
          // console.log("added child at : " + insertPos);
          insertPos++;
        }
        if (this.getSelected() === -1 && this.children.length > 0) {
          this.setSelected(0);
        }
      }
      this.model.setActiveTabset(this, (this.parent as RowNode).getWindowId());
    } else {
      let moveNode = dragNode as TabSetNode | RowNode | TabNode;
      if (dragNode instanceof TabNode) {
        // create new tabset parent
        // console.log("create a new tabset");
        const callback = this.model.getOnCreateTabSet();
        moveNode = new TabSetNode(this.model, callback ? callback(dragNode as TabNode) : {});
        moveNode.addChild(dragNode);
        // console.log("added child at end");
        dragParent = moveNode;
      } else if (dragNode instanceof RowNode) {
        const parent = this.getParent()! as RowNode;
        // need to turn round if same orientation unless docking oposite direction
        if (
          dragNode.getOrientation() === parent.getOrientation() &&
          (location.getOrientation() === parent.getOrientation() || location === DockLocation.CENTER)
        ) {
          const node = new RowNode(this.model, this.getWindowId(), {});
          node.addChild(dragNode);
          moveNode = node;
        }
      } else {
        moveNode = dragNode as TabSetNode;
      }

      const parentRow = this.parent as Node;
      const pos = parentRow.getChildren().indexOf(this);

      if (parentRow.getOrientation() === dockLocation.orientation) {
        moveNode.setWeight(this.getWeight() / 2);
        this.setWeight(this.getWeight() / 2);
        // console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
        parentRow.addChild(moveNode, pos + dockLocation.indexPlus);
      } else {
        // create a new row to host the new tabset (it will go in the opposite direction)
        // console.log("create a new row");
        const newRow = new RowNode(this.model, this.getWindowId(), {});
        newRow.setWeight(this.getWeight());
        newRow.addChild(this);
        this.setWeight(50);
        moveNode.setWeight(50);
        // console.log("added child 50% size at: " +  dockLocation.indexPlus);
        newRow.addChild(moveNode, dockLocation.indexPlus);

        parentRow.removeChild(this);
        parentRow.addChild(newRow, pos);
      }
      if (moveNode instanceof TabSetNode) {
        this.model.setActiveTabset(moveNode, this.getWindowId());
      }
    }
    this.model.tidy();
  }

  /** @internal */
  updateAttrs(json: UnsafeTypes.UnsafeAny) {
    TabSetNode.attributeDefinitions.update(json, this.attributes);
  }

  /** @internal */
  getAttributeDefinitions() {
    return TabSetNode.attributeDefinitions;
  }

  /** @internal */
  static getAttributeDefinitions() {
    return TabSetNode.attributeDefinitions;
  }

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();
    attributeDefinitions.add("type", TabSetNode.TYPE, true).setType(Attribute.STRING).setFixed();
    attributeDefinitions
      .add("id", undefined)
      .setType(Attribute.STRING)
      .setDescription(`the unique id of the tab set, if left undefined a uuid will be assigned`);
    attributeDefinitions
      .add("weight", 100)
      .setType(Attribute.NUMBER)
      .setDescription(`relative weight for sizing of this tabset in parent row`);
    attributeDefinitions
      .add("selected", 0)
      .setType(Attribute.NUMBER)
      .setDescription(`index of selected/visible tab in tabset`);
    attributeDefinitions.add("name", undefined).setType(Attribute.STRING);
    attributeDefinitions
      .add("config", undefined)
      .setType("UnsafeTypes.UnsafeAny")
      .setDescription(`a place to hold json config used in your own code`);

    attributeDefinitions
      .addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty")
      .setDescription(`whether to delete this tabset when is has no tabs`);
    attributeDefinitions
      .addInherited("enableDrop", "tabSetEnableDrop")
      .setDescription(`allow user to drag tabs into this tabset`);
    attributeDefinitions
      .addInherited("enableDrag", "tabSetEnableDrag")
      .setDescription(`allow user to drag tabs out this tabset`);
    attributeDefinitions
      .addInherited("enableDivide", "tabSetEnableDivide")
      .setDescription(`allow user to drag tabs to region of this tabset, splitting into new tabset`);
    attributeDefinitions
      .addInherited("enableMaximize", "tabSetEnableMaximize")
      .setDescription(`allow user to maximize tabset to fill view via maximize button`);
    attributeDefinitions
      .addInherited("enableClose", "tabSetEnableClose")
      .setDescription(`allow user to close tabset via a close button`);
    attributeDefinitions
      .addInherited("enableSingleTabStretch", "tabSetEnableSingleTabStretch")
      .setDescription(
        `if the tabset has only a single tab then stretch the single tab to fill area and display in a header style`
      );

    attributeDefinitions
      .addInherited("classNameTabStrip", "tabSetClassNameTabStrip")
      .setDescription(`a class name to apply to the tab strip`);
    attributeDefinitions
      .addInherited("enableTabStrip", "tabSetEnableTabStrip")
      .setDescription(`enable tab strip and allow multiple tabs in this tabset`);
    attributeDefinitions
      .addInherited("minWidth", "tabSetMinWidth")
      .setDescription(`minimum width (in px) for this tabset`);
    attributeDefinitions
      .addInherited("minHeight", "tabSetMinHeight")
      .setDescription(`minimum height (in px) for this tabset`);
    attributeDefinitions
      .addInherited("maxWidth", "tabSetMaxWidth")
      .setDescription(`maximum width (in px) for this tabset`);
    attributeDefinitions
      .addInherited("maxHeight", "tabSetMaxHeight")
      .setDescription(`maximum height (in px) for this tabset`);

    attributeDefinitions
      .addInherited("enableTabWrap", "tabSetEnableTabWrap")
      .setDescription(`wrap tabs onto multiple lines`);
    attributeDefinitions
      .addInherited("tabLocation", "tabSetTabLocation")
      .setDescription(`the location of the tabs either top or bottom`);
    attributeDefinitions
      .addInherited("autoSelectTab", "tabSetAutoSelectTab")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to select new/moved tabs in tabset`);
    attributeDefinitions
      .addInherited("enableActiveIcon", "tabSetEnableActiveIcon")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether the active icon (*) should be displayed when the tabset is active`);

    attributeDefinitions
      .addInherited("enableTabScrollbar", "tabSetEnableTabScrollbar")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to show a mini scrollbar for the tabs`);

    return attributeDefinitions;
  }
}

// ============================================================================
// ITabSetNode Schema Class - Effect Schema version of TabSetNode
// ============================================================================

/**
 * Effect Schema version of TabSetNode - a container for tabs.
 *
 * Extends INode using .extend() pattern and overrides abstract methods with real implementations.
 * Provides IDraggable and IDropTarget methods directly (no implements clause).
 */
export class ITabSetNode extends INode.extend<ITabSetNode>("ITabSetNode")({}) {
  static readonly TYPE = "tabset";

  // ========================================================================
  // Static factory and attribute definitions
  // ========================================================================

  /**
   * Factory method for creating ITabSetNode instances.
   * @internal
   */
  static readonly new = (model: IModel, json: UnsafeTypes.UnsafeAny): ITabSetNode => {
    const instance = new ITabSetNode({ data: { id: O.none(), type: "tabset", weight: O.none(), selected: O.none() } });
    instance._initialize(model, json);
    return instance;
  };

  /** @internal */
  static fromJson(json: UnsafeTypes.UnsafeAny, model: IModel, layoutWindow: LayoutWindow): ITabSetNode {
    const newLayoutNode = ITabSetNode.new(model, json);

    if (json.children != null) {
      for (const jsonChild of json.children) {
        const child = ITabNode.new(model, jsonChild);
        newLayoutNode.addChild(child);
      }
    }
    if (newLayoutNode.getChildren().length === 0) {
      newLayoutNode.setSelected(-1);
    }

    if (json.maximized && json.maximized === true) {
      layoutWindow.maximizedTabSet = newLayoutNode as unknown as TabSetNode;
    }

    if (json.active && json.active === true) {
      layoutWindow.activeTabSet = newLayoutNode as unknown as TabSetNode;
    }

    return newLayoutNode;
  }

  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = ITabSetNode.createAttributeDefinitions();

  /** @internal */
  static getAttributeDefinitions(): AttributeDefinitions {
    return ITabSetNode.attributeDefinitions;
  }

  // ========================================================================
  // Non-serializable runtime fields
  // ========================================================================

  /** @internal */
  private _tabStripRect: Rect = Rect.empty();
  /** @internal */
  private _contentRect: Rect = Rect.empty();
  /** @internal */
  private _calculatedMinHeight = 0;
  /** @internal */
  private _calculatedMinWidth = 0;
  /** @internal */
  private _calculatedMaxHeight = 0;
  /** @internal */
  private _calculatedMaxWidth = 0;

  // ========================================================================
  // Initialization
  // ========================================================================

  /** @internal */
  private _initialize(model: IModel, json: UnsafeTypes.UnsafeAny): void {
    this._calculatedMinHeight = 0;
    this._calculatedMinWidth = 0;
    this._calculatedMaxHeight = 0;
    this._calculatedMaxWidth = 0;

    this.initializeModel(model);
    ITabSetNode.attributeDefinitions.fromJson(json, this.getAttributes());
    model.addNode(this);
  }

  // ========================================================================
  // Overridden abstract methods from INode
  // ========================================================================

  override toJson(): JsonTabSetNode {
    const json: Record<string, unknown> = {};
    ITabSetNode.attributeDefinitions.toJson(json, this.getAttributes());

    json.children = A.map(this.getChildren(), (child) => child.toJson());

    if (this.isActive()) {
      json.active = true;
    }

    if (this.isMaximized()) {
      json.maximized = true;
    }

    return S.decodeUnknownSync(JsonTabSetNode)(json);
  }

  /** @internal */
  override updateAttrs(json: UnsafeTypes.UnsafeAny): void {
    ITabSetNode.attributeDefinitions.update(json, this.getAttributes());
  }

  /** @internal */
  override getAttributeDefinitions(): AttributeDefinitions {
    return ITabSetNode.attributeDefinitions;
  }

  // ========================================================================
  // Getter methods
  // ========================================================================

  getName(): string | undefined {
    return this.getAttr("name") as string | undefined;
  }

  isEnableActiveIcon(): boolean {
    return this.getAttr("enableActiveIcon") as boolean;
  }

  getSelected(): number {
    const selected = this.getAttributes().selected;
    if (selected !== undefined) {
      return selected as number;
    }
    return -1;
  }

  getSelectedNode(): INode | undefined {
    const selected = this.getSelected();
    if (selected !== -1) {
      return this.getChildren()[selected];
    }
    return undefined;
  }

  getWeight(): number {
    return this.getAttr("weight") as number;
  }

  getAttrMinWidth(): number {
    return this.getAttr("minWidth") as number;
  }

  getAttrMinHeight(): number {
    return this.getAttr("minHeight") as number;
  }

  getMinWidth(): number {
    return this._calculatedMinWidth;
  }

  getMinHeight(): number {
    return this._calculatedMinHeight;
  }

  /** @internal */
  getMinSize(orientation: Orientation): number {
    if (orientation === Orientation.HORZ) {
      return this.getMinWidth();
    }
    return this.getMinHeight();
  }

  getAttrMaxWidth(): number {
    return this.getAttr("maxWidth") as number;
  }

  getAttrMaxHeight(): number {
    return this.getAttr("maxHeight") as number;
  }

  getMaxWidth(): number {
    return this._calculatedMaxWidth;
  }

  getMaxHeight(): number {
    return this._calculatedMaxHeight;
  }

  /** @internal */
  getMaxSize(orientation: Orientation): number {
    if (orientation === Orientation.HORZ) {
      return this.getMaxWidth();
    }
    return this.getMaxHeight();
  }

  getConfig(): UnsafeTypes.UnsafeAny {
    return this.getAttributes().config;
  }

  isMaximized(): boolean {
    return this.getModel().getMaximizedTabset(this.getWindowId()) === (this as unknown as TabSetNode);
  }

  isActive(): boolean {
    return this.getModel().getActiveTabset(this.getWindowId()) === (this as unknown as TabSetNode);
  }

  isEnableDeleteWhenEmpty(): boolean {
    return this.getAttr("enableDeleteWhenEmpty") as boolean;
  }

  isEnableDrop(): boolean {
    return this.getAttr("enableDrop") as boolean;
  }

  isEnableTabWrap(): boolean {
    return this.getAttr("enableTabWrap") as boolean;
  }

  isEnableDrag(): boolean {
    return this.getAttr("enableDrag") as boolean;
  }

  override isEnableDivide(): boolean {
    return this.getAttr("enableDivide") as boolean;
  }

  isEnableMaximize(): boolean {
    return this.getAttr("enableMaximize") as boolean;
  }

  isEnableClose(): boolean {
    return this.getAttr("enableClose") as boolean;
  }

  isEnableSingleTabStretch(): boolean {
    return this.getAttr("enableSingleTabStretch") as boolean;
  }

  isEnableTabStrip(): boolean {
    return this.getAttr("enableTabStrip") as boolean;
  }

  isAutoSelectTab(): boolean {
    return this.getAttr("autoSelectTab") as boolean;
  }

  isEnableTabScrollbar(): boolean {
    return this.getAttr("enableTabScrollbar") as boolean;
  }

  getClassNameTabStrip(): string | undefined {
    return this.getAttr("classNameTabStrip") as string | undefined;
  }

  getTabLocation(): string {
    return this.getAttr("tabLocation") as string;
  }

  getWindowId(): string {
    const parent = this.getParent();
    if (parent !== undefined) {
      return (parent as unknown as RowNode).getWindowId();
    }
    return Model.MAIN_WINDOW_ID;
  }

  // ========================================================================
  // Internal methods
  // ========================================================================

  /** @internal */
  calcMinMaxSize(): void {
    this._calculatedMinHeight = this.getAttrMinHeight();
    this._calculatedMinWidth = this.getAttrMinWidth();
    this._calculatedMaxHeight = this.getAttrMaxHeight();
    this._calculatedMaxWidth = this.getAttrMaxWidth();

    A.forEach(this.getChildren(), (child) => {
      const c = child as unknown as TabNode;
      this._calculatedMinWidth = Math.max(this._calculatedMinWidth, c.getMinWidth());
      this._calculatedMinHeight = Math.max(this._calculatedMinHeight, c.getMinHeight());
      this._calculatedMaxWidth = Math.min(this._calculatedMaxWidth, c.getMaxWidth());
      this._calculatedMaxHeight = Math.min(this._calculatedMaxHeight, c.getMaxHeight());
    });

    this._calculatedMinHeight += this._tabStripRect.height;
    this._calculatedMaxHeight += this._tabStripRect.height;
  }

  /** @internal */
  canMaximize(): boolean {
    if (this.isEnableMaximize()) {
      if (this.getModel().getMaximizedTabset(this.getWindowId()) === (this as unknown as TabSetNode)) {
        return true;
      }
      const root = this.getModel().getRoot(this.getWindowId());
      return !(this.getParent() === (root as unknown as INode) && root.getChildren().length === 1);
    }
    return false;
  }

  /** @internal */
  setContentRect(rect: Rect): void {
    this._contentRect = rect;
  }

  /** @internal */
  getContentRect(): Rect {
    return this._contentRect;
  }

  /** @internal */
  setTabStripRect(rect: Rect): void {
    this._tabStripRect = rect;
  }

  /** @internal */
  override setWeight(weight: number): void {
    this.getAttributes().weight = weight;
  }

  /** @internal */
  override setSelected(index: number): void {
    this.getAttributes().selected = index;
  }

  /** @internal */
  override canDrop(dragNode: INode & IDraggable, x: number, y: number): DropInfo | undefined {
    let dropInfo: DropInfo | undefined;
    // Cast for comparison and DropInfo construction
    const thisAsNode = this as unknown as Node & IDropTarget;
    const dragAsNode = dragNode as unknown as Node & IDraggable;

    if (dragAsNode === (this as unknown as Node)) {
      const dockLocation = DockLocation.CENTER;
      const outlineRect = this._tabStripRect;
      dropInfo = new DropInfo(thisAsNode, outlineRect!, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
    } else if (this.getWindowId() !== Model.MAIN_WINDOW_ID && !canDockToWindow(dragAsNode)) {
      return undefined;
    } else if (this._contentRect!.contains(x, y)) {
      let dockLocation = DockLocation.CENTER;
      const parent = this.getParent();
      if (
        parent !== undefined &&
        this.getModel().getMaximizedTabset((parent as unknown as RowNode).getWindowId()) === undefined
      ) {
        dockLocation = DockLocation.getLocation(this._contentRect!, x, y);
      }
      const outlineRect = dockLocation.getDockRect(this.getRect());
      dropInfo = new DropInfo(thisAsNode, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
    } else if (this._tabStripRect?.contains(x, y)) {
      let r: Rect;
      let yy: number;
      let h: number;
      const children = this.getChildren();
      if (children.length === 0) {
        r = this._tabStripRect.clone();
        yy = r.y + 3;
        h = r.height - 4;
        r.width = 2;
      } else {
        let child = children[0] as unknown as TabNode;
        r = child.getTabRect()!;
        yy = r.y;
        h = r.height;
        let p = this._tabStripRect.x;
        let childCenter = 0;
        for (let i = 0; i < children.length; i++) {
          child = children[i] as unknown as TabNode;
          r = child.getTabRect()!;
          if (r.y !== yy) {
            yy = r.y;
            p = this._tabStripRect.x;
          }
          childCenter = r.x + r.width / 2;
          if (p <= x && x < childCenter && r.y < y && y < r.getBottom()) {
            const dockLocation = DockLocation.CENTER;
            const outlineRect = new Rect(r.x - 2, r.y, 3, r.height);
            if (this.getRect().x < r.x && r.x < this.getRect().getRight()) {
              dropInfo = new DropInfo(thisAsNode, outlineRect, dockLocation, i, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
              break;
            }
            return undefined;
          }
          p = childCenter;
        }
      }
      if (dropInfo == null && r.getRight() < this.getRect()!.getRight()) {
        const dockLocation = DockLocation.CENTER;
        const outlineRect = new Rect(r.getRight() - 2, yy, 3, h);
        dropInfo = new DropInfo(
          thisAsNode,
          outlineRect,
          dockLocation,
          children.length,
          CLASSES.FLEXLAYOUT__OUTLINE_RECT
        );
      }
    }

    if (!dragAsNode.canDockInto(dragAsNode, dropInfo)) {
      return undefined;
    }

    return dropInfo;
  }

  /** @internal */
  delete(): void {
    const parent = this.getParent();
    if (parent !== undefined) {
      (parent as unknown as RowNode).removeChild(this as unknown as Node);
    }
  }

  /** @internal */
  remove(node: TabNode): void {
    const removedIndex = this.removeChild(node as unknown as INode);
    this.getModel().tidy();
    adjustSelectedIndex(this as unknown as TabSetNode, removedIndex);
  }

  /** @internal */
  drop(dragNode: Node, location: DockLocation, index: number, select?: undefined | boolean): void {
    const dockLocation = location;

    if ((this as unknown as Node) === dragNode) {
      return;
    }

    let dragParent = dragNode.getParent() as BorderNode | TabSetNode | RowNode;
    let fromIndex = 0;
    if (dragParent !== undefined) {
      fromIndex = dragParent.removeChild(dragNode);
      if (dragParent instanceof BorderNode && dragParent.getSelected() === fromIndex) {
        dragParent.setSelected(-1);
      } else {
        adjustSelectedIndex(dragParent, fromIndex);
      }
    }

    if (
      dragNode instanceof TabNode &&
      dragParent === (this as unknown as TabSetNode) &&
      fromIndex < index &&
      index > 0
    ) {
      index--;
    }

    if (dockLocation === DockLocation.CENTER) {
      let insertPos = index;
      if (insertPos === -1) {
        insertPos = this.getChildren().length;
      }

      if (dragNode instanceof TabNode) {
        this.addChild(dragNode as unknown as INode, insertPos);
        if (select || (select !== false && this.isAutoSelectTab())) {
          this.setSelected(insertPos);
        }
      } else if (dragNode instanceof RowNode) {
        (dragNode as RowNode).forEachNode((child, _level) => {
          if (child instanceof TabNode) {
            this.addChild(child as unknown as INode, insertPos);
            insertPos++;
          }
        }, 0);
      } else {
        for (let i = 0; i < dragNode.getChildren().length; i++) {
          const child = dragNode.getChildren()[i]!;
          this.addChild(child as unknown as INode, insertPos);
          insertPos++;
        }
        if (this.getSelected() === -1 && this.getChildren().length > 0) {
          this.setSelected(0);
        }
      }
      this.getModel().setActiveTabset(this as unknown as ITabSetNode, this.getWindowId());
    } else {
      let moveNode: ITabSetNode | IRowNode | TabSetNode | RowNode | TabNode = dragNode as unknown as
        | TabSetNode
        | RowNode
        | TabNode;
      if (dragNode instanceof TabNode) {
        const callback = this.getModel().getOnCreateTabSet();
        moveNode = ITabSetNode.new(this.getModel(), callback ? callback(dragNode as unknown as ITabNode) : {});
        moveNode.addChild(dragNode as unknown as INode);
        dragParent = moveNode as unknown as TabSetNode;
      } else if (dragNode instanceof RowNode) {
        const parent = this.getParent()! as unknown as RowNode;
        if (
          dragNode.getOrientation() === parent.getOrientation() &&
          (location.getOrientation() === parent.getOrientation() || location === DockLocation.CENTER)
        ) {
          const node = IRowNode.new(this.getModel(), this.getWindowId(), {});
          node.addChild(dragNode as unknown as INode);
          moveNode = node;
        }
      } else {
        moveNode = dragNode as TabSetNode;
      }

      const parentRow = this.getParent()! as unknown as Node;
      const pos = parentRow.getChildren().indexOf(this as unknown as Node);

      if (parentRow.getOrientation() === dockLocation.orientation) {
        moveNode.setWeight(this.getWeight() / 2);
        this.setWeight(this.getWeight() / 2);
        parentRow.addChild(moveNode as unknown as Node, pos + dockLocation.indexPlus);
      } else {
        const newRow = IRowNode.new(this.getModel(), this.getWindowId(), {});
        newRow.setWeight(this.getWeight());
        newRow.addChild(this as unknown as INode);
        this.setWeight(50);
        moveNode.setWeight(50);
        newRow.addChild(moveNode as unknown as INode, dockLocation.indexPlus);

        parentRow.removeChild(this as unknown as Node);
        parentRow.addChild(newRow as unknown as Node, pos);
      }
      if (moveNode instanceof TabSetNode || moveNode instanceof ITabSetNode) {
        this.getModel().setActiveTabset(moveNode as ITabSetNode, this.getWindowId());
      }
    }
    this.getModel().tidy();
  }

  // ========================================================================
  // Private static methods
  // ========================================================================

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();
    attributeDefinitions.add("type", ITabSetNode.TYPE, true).setType(Attribute.STRING).setFixed();
    attributeDefinitions
      .add("id", undefined)
      .setType(Attribute.STRING)
      .setDescription(`the unique id of the tab set, if left undefined a uuid will be assigned`);
    attributeDefinitions
      .add("weight", 100)
      .setType(Attribute.NUMBER)
      .setDescription(`relative weight for sizing of this tabset in parent row`);
    attributeDefinitions
      .add("selected", 0)
      .setType(Attribute.NUMBER)
      .setDescription(`index of selected/visible tab in tabset`);
    attributeDefinitions.add("name", undefined).setType(Attribute.STRING);
    attributeDefinitions
      .add("config", undefined)
      .setType("UnsafeTypes.UnsafeAny")
      .setDescription(`a place to hold json config used in your own code`);

    attributeDefinitions
      .addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty")
      .setDescription(`whether to delete this tabset when is has no tabs`);
    attributeDefinitions
      .addInherited("enableDrop", "tabSetEnableDrop")
      .setDescription(`allow user to drag tabs into this tabset`);
    attributeDefinitions
      .addInherited("enableDrag", "tabSetEnableDrag")
      .setDescription(`allow user to drag tabs out this tabset`);
    attributeDefinitions
      .addInherited("enableDivide", "tabSetEnableDivide")
      .setDescription(`allow user to drag tabs to region of this tabset, splitting into new tabset`);
    attributeDefinitions
      .addInherited("enableMaximize", "tabSetEnableMaximize")
      .setDescription(`allow user to maximize tabset to fill view via maximize button`);
    attributeDefinitions
      .addInherited("enableClose", "tabSetEnableClose")
      .setDescription(`allow user to close tabset via a close button`);
    attributeDefinitions
      .addInherited("enableSingleTabStretch", "tabSetEnableSingleTabStretch")
      .setDescription(
        `if the tabset has only a single tab then stretch the single tab to fill area and display in a header style`
      );

    attributeDefinitions
      .addInherited("classNameTabStrip", "tabSetClassNameTabStrip")
      .setDescription(`a class name to apply to the tab strip`);
    attributeDefinitions
      .addInherited("enableTabStrip", "tabSetEnableTabStrip")
      .setDescription(`enable tab strip and allow multiple tabs in this tabset`);
    attributeDefinitions
      .addInherited("minWidth", "tabSetMinWidth")
      .setDescription(`minimum width (in px) for this tabset`);
    attributeDefinitions
      .addInherited("minHeight", "tabSetMinHeight")
      .setDescription(`minimum height (in px) for this tabset`);
    attributeDefinitions
      .addInherited("maxWidth", "tabSetMaxWidth")
      .setDescription(`maximum width (in px) for this tabset`);
    attributeDefinitions
      .addInherited("maxHeight", "tabSetMaxHeight")
      .setDescription(`maximum height (in px) for this tabset`);

    attributeDefinitions
      .addInherited("enableTabWrap", "tabSetEnableTabWrap")
      .setDescription(`wrap tabs onto multiple lines`);
    attributeDefinitions
      .addInherited("tabLocation", "tabSetTabLocation")
      .setDescription(`the location of the tabs either top or bottom`);
    attributeDefinitions
      .addInherited("autoSelectTab", "tabSetAutoSelectTab")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to select new/moved tabs in tabset`);
    attributeDefinitions
      .addInherited("enableActiveIcon", "tabSetEnableActiveIcon")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether the active icon (*) should be displayed when the tabset is active`);

    attributeDefinitions
      .addInherited("enableTabScrollbar", "tabSetEnableTabScrollbar")
      .setType(Attribute.BOOLEAN)
      .setDescription(`whether to show a mini scrollbar for the tabs`);

    return attributeDefinitions;
  }
}
