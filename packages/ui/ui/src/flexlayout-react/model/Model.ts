import { $UiId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import type { DropInfo } from "../DropInfo";
import { Rect } from "../Rect";
import type { Action } from "./Action";
import { Actions } from "./Actions";
import { BorderNode } from "./BorderNode";
import { BorderSet, IBorderSet } from "./BorderSet";
import type { IDraggable } from "./IDraggable";
import type { IDropTarget } from "./IDropTarget";
import type { JsonModel, JsonPopout, TabSetAttributes } from "./JsonModel.ts";
import { ILayoutWindow, LayoutWindow } from "./LayoutWindow";
import type { INode, Node } from "./Node";
import { IRowNode, RowNode } from "./RowNode";
import { ITabNode, TabNode } from "./TabNode";
import { ITabSetNode, TabSetNode } from "./TabSetNode";
import { randomUUID } from "./Utils";
/** @internal */
export const DefaultMin = 0;
/** @internal */
export const DefaultMax = 99999;

/**
 * Class containing the Tree of Nodes used by the FlexLayout component
 */
export class Model {
  static MAIN_WINDOW_ID = "__main_window_id__";

  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = Model.createAttributeDefinitions();

  /** @internal */
  private readonly attributes: Record<string, UnsafeTypes.UnsafeAny>;
  /** @internal */
  private idMap: Map<string, Node>;
  /** @internal */
  private readonly changeListeners: ((action: Action) => void)[];
  /** @internal */
  private borders: BorderSet;
  /** @internal */
  private onAllowDrop?: undefined | ((dragNode: Node, dropInfo: DropInfo) => boolean);
  /** @internal */
  private onCreateTabSet?: undefined | ((tabNode?: TabNode) => TabSetAttributes);
  /** @internal */
  private readonly windows: Map<string, LayoutWindow>;
  /** @internal */
  private readonly rootWindow: LayoutWindow;

  /**
   * 'private' constructor. Use the static method Model.fromJson(json) to create a model
   *  @internal
   */
  protected constructor() {
    this.attributes = {};
    this.idMap = new Map();
    this.borders = new BorderSet(this);
    this.windows = new Map<string, LayoutWindow>();
    this.rootWindow = new LayoutWindow(Model.MAIN_WINDOW_ID, Rect.empty());
    this.windows.set(Model.MAIN_WINDOW_ID, this.rootWindow);
    this.changeListeners = [];
  }

  /**
   * Update the node tree by performing the given action,
   * Actions should be generated via static methods on the Actions class
   * @param action the action to perform
   * @returns added Node for Actions.addNode, windowId for createWindow
   */
  doAction(action: Action): UnsafeTypes.UnsafeAny {
    let returnVal = undefined;
    // console.log(action);
    switch (action.type) {
      case Actions.ADD_NODE: {
        const newNode = new TabNode(this, action.data.json, true);
        const toNode = this.idMap.get(action.data.toNode) as Node & IDraggable;
        if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
          toNode.drop(newNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
          returnVal = newNode;
        }
        break;
      }
      case Actions.MOVE_NODE: {
        const fromNode = this.idMap.get(action.data.fromNode) as Node & IDraggable;

        if (fromNode instanceof TabNode || fromNode instanceof TabSetNode || fromNode instanceof RowNode) {
          if (fromNode === this.getMaximizedTabset(fromNode.getWindowId())) {
            const fromWindow = this.windows.get(fromNode.getWindowId())!;
            fromWindow.maximizedTabSet = undefined;
          }
          const toNode = this.idMap.get(action.data.toNode) as Node & IDropTarget;
          if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
            toNode.drop(fromNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
          }
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.DELETE_TAB: {
        const node = this.idMap.get(action.data.node);
        if (node instanceof TabNode) {
          node.delete();
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.DELETE_TABSET: {
        const node = this.idMap.get(action.data.node);

        if (node instanceof TabSetNode) {
          // first delete all child tabs that are closeable
          const children = [...node.getChildren()];
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if ((child as TabNode).isEnableClose()) {
              (child as TabNode).delete();
            }
          }

          if (node.getChildren().length === 0) {
            node.delete();
          }
          this.tidy();
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.POPOUT_TABSET: {
        const node = this.idMap.get(action.data.node);
        if (node instanceof TabSetNode) {
          const isMaximized = node.isMaximized();
          const oldLayoutWindow = this.windows.get(node.getWindowId())!;
          const windowId = randomUUID();
          const layoutWindow = new LayoutWindow(windowId, oldLayoutWindow.toScreenRectFunction(node.getRect()));
          const json = {
            type: "row",
            children: [],
          };
          const row = RowNode.fromJson(json, this, layoutWindow);
          layoutWindow.root = row;
          this.windows.set(windowId, layoutWindow);
          row.drop(node, DockLocation.CENTER, 0);

          if (isMaximized) {
            this.rootWindow.maximizedTabSet = undefined;
          }
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.POPOUT_TAB: {
        const node = this.idMap.get(action.data.node);
        if (node instanceof TabNode) {
          const windowId = randomUUID();
          let r = Rect.empty();
          if (node.getParent() instanceof TabSetNode) {
            r = node.getParent()!.getRect();
          } else {
            r = (node.getParent() as BorderNode).getContentRect();
          }
          const oldLayoutWindow = this.windows.get(node.getWindowId())!;
          const layoutWindow = new LayoutWindow(windowId, oldLayoutWindow.toScreenRectFunction(r));
          const tabsetId = randomUUID();
          const json = {
            type: "row",
            children: [{ type: "tabset", id: tabsetId }],
          };
          layoutWindow.root = RowNode.fromJson(json, this, layoutWindow);
          this.windows.set(windowId, layoutWindow);

          const tabset = this.idMap.get(tabsetId) as TabSetNode & IDropTarget;
          tabset.drop(node, DockLocation.CENTER, 0, true);
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.CLOSE_WINDOW: {
        const window = this.windows.get(action.data.windowId);
        if (window) {
          this.rootWindow.root?.drop(window!.root!, DockLocation.CENTER, -1);
          this.rootWindow.visitNodes((node, _level) => {
            if (node instanceof RowNode) {
              node.setWindowId(Model.MAIN_WINDOW_ID);
            }
          });

          // this.getFirstTabSet().drop(window?.root!,DockLocation.CENTER, -1);

          this.windows.delete(action.data.windowId);
        }
        break;
      }
      case Actions.CREATE_WINDOW: {
        const windowId = randomUUID();
        const layoutWindow = new LayoutWindow(windowId, Rect.fromJson(action.data.rect));
        layoutWindow.root = RowNode.fromJson(action.data.layout, this, layoutWindow);
        this.windows.set(windowId, layoutWindow);
        returnVal = windowId;
        break;
      }
      case Actions.RENAME_TAB: {
        const node = this.idMap.get(action.data.node);
        if (node instanceof TabNode) {
          node.setName(action.data.text);
        }
        break;
      }
      case Actions.SELECT_TAB: {
        const tabNode = this.idMap.get(action.data.tabNode);
        const windowId = action.data.windowId ? action.data.windowId : Model.MAIN_WINDOW_ID;
        const window = this.windows.get(windowId)!;
        if (tabNode instanceof TabNode) {
          const parent = tabNode.getParent() as Node;
          const pos = parent.getChildren().indexOf(tabNode);

          if (parent instanceof BorderNode) {
            if (parent.getSelected() === pos) {
              parent.setSelected(-1);
            } else {
              parent.setSelected(pos);
            }
          } else if (parent instanceof TabSetNode) {
            if (parent.getSelected() !== pos) {
              parent.setSelected(pos);
            }
            window.activeTabSet = parent;
          }
        }
        break;
      }
      case Actions.SET_ACTIVE_TABSET: {
        const windowId = action.data.windowId ? action.data.windowId : Model.MAIN_WINDOW_ID;
        const window = this.windows.get(windowId)!;
        if (action.data.tabsetNode === undefined) {
          window.activeTabSet = undefined;
        } else {
          const tabsetNode = this.idMap.get(action.data.tabsetNode);
          if (tabsetNode instanceof TabSetNode) {
            window.activeTabSet = tabsetNode;
          }
        }
        break;
      }
      case Actions.ADJUST_WEIGHTS: {
        const row = this.idMap.get(action.data.nodeId) as RowNode;
        if (!row) {
          break;
        }
        const c = row.getChildren();
        for (let i = 0; i < c.length; i++) {
          const n = c[i] as TabSetNode | RowNode;
          n.setWeight(action.data.weights[i]);
        }
        break;
      }
      case Actions.ADJUST_BORDER_SPLIT: {
        const node = this.idMap.get(action.data.node);
        if (node instanceof BorderNode) {
          node.setSize(action.data.pos);
        }
        break;
      }
      case Actions.MAXIMIZE_TOGGLE: {
        const windowId = action.data.windowId ? action.data.windowId : Model.MAIN_WINDOW_ID;
        const window = this.windows.get(windowId)!;
        const node = this.idMap.get(action.data.node);
        if (node instanceof TabSetNode) {
          if (node === window.maximizedTabSet) {
            window.maximizedTabSet = undefined;
          } else {
            window.maximizedTabSet = node;
            window.activeTabSet = node;
          }
        }

        break;
      }
      case Actions.UPDATE_MODEL_ATTRIBUTES: {
        this.updateAttrs(action.data.json);
        break;
      }

      case Actions.UPDATE_NODE_ATTRIBUTES: {
        const node = this.idMap.get(action.data.node)!;
        node.updateAttrs(action.data.json);
        break;
      }
      default:
        break;
    }

    this.updateIdMap();

    for (const listener of this.changeListeners) {
      listener(action);
    }

    return returnVal;
  }

  /**
   * Get the currently active tabset node
   */
  getActiveTabset(windowId: string = Model.MAIN_WINDOW_ID) {
    const window = this.windows.get(windowId);
    if (P.isNotNullable(window) && window.activeTabSet && this.getNodeById(window.activeTabSet.getId())) {
      return window.activeTabSet;
    }
    return undefined;
  }

  /**
   * Get the currently maximized tabset node
   */
  getMaximizedTabset(windowId: string = Model.MAIN_WINDOW_ID) {
    return this.windows.get(windowId)!.maximizedTabSet;
  }

  /**
   * Gets the root RowNode of the model
   * @returns {RowNode}
   */
  getRoot(windowId: string = Model.MAIN_WINDOW_ID) {
    return this.windows.get(windowId)!.root!;
  }

  isRootOrientationVertical() {
    return this.attributes.rootOrientationVertical as boolean;
  }

  isEnableRotateBorderIcons() {
    return this.attributes.enableRotateBorderIcons as boolean;
  }

  /**
   * Gets the
   * @returns {BorderSet|*}
   */
  getBorderSet() {
    return this.borders;
  }

  getwindowsMap() {
    return this.windows;
  }

  /**
   * Visits all the nodes in the model and calls the given function for each
   * @param fn a function that takes visited node and a integer level as parameters
   */
  visitNodes(fn: (node: Node, level: number) => void) {
    this.borders.forEachNode(fn);
    for (const [_, w] of this.windows) {
      w.root!.forEachNode(fn, 0);
    }
  }

  visitWindowNodes(windowId: string, fn: (node: Node, level: number) => void) {
    if (this.windows.has(windowId)) {
      if (windowId === Model.MAIN_WINDOW_ID) {
        this.borders.forEachNode(fn);
      }
      this.windows.get(windowId)!.visitNodes(fn);
    }
  }

  /**
   * Gets a node by its id
   * @param id the id to find
   */
  getNodeById(id: string): Node | undefined {
    return this.idMap.get(id);
  }

  /**
   * Finds the first/top left tab set of the given node.
   * @param node The top node you want to begin searching from, deafults to the root node
   * @returns The first Tab Set
   */
  getFirstTabSet(node = this.windows.get(Model.MAIN_WINDOW_ID)!.root as Node): TabSetNode {
    const child = node.getChildren()[0];
    if (child instanceof TabSetNode) {
      return child;
    }
    return this.getFirstTabSet(child);
  }

  /**
   * Loads the model from the given json object
   * @param json the json model to load
   * @returns {Model} a new Model object
   */
  static fromJson(json: JsonModel): Model {
    const model = new Model();
    Model.attributeDefinitions.fromJson(json.global, model.attributes);

    if (json.borders) {
      model.borders = BorderSet.fromJson(json.borders, model);
    }
    if (P.isNotNullable(json.popouts)) {
      for (const [windowId, windowJson] of Struct.entries(json.popouts)) {
        const layoutWindow = LayoutWindow.fromJson(windowJson, model, windowId);
        model.windows.set(windowId, layoutWindow);
      }
    }

    model.rootWindow.root = RowNode.fromJson(json.layout, model, model.getwindowsMap().get(Model.MAIN_WINDOW_ID)!);
    model.tidy(); // initial tidy of node tree
    return model;
  }

  /**
   * Converts the model to a json object
   * @returns {IJsonModel} json object that represents this model
   */
  toJson(): JsonModel {
    const global: UnsafeTypes.UnsafeAny = {};
    Model.attributeDefinitions.toJson(global, this.attributes);

    // save state of nodes
    this.visitNodes((node) => {
      node.fireEvent("save", {});
    });

    const windows: Record<string, JsonPopout> = {};
    for (const [id, window] of this.windows) {
      if (id !== Model.MAIN_WINDOW_ID) {
        windows[id] = window.toJson();
      }
    }

    return {
      global,
      borders: this.borders.toJson(),
      layout: this.rootWindow.root!.toJson(),
      popouts: windows,
    };
  }

  getSplitterSize() {
    return this.attributes.splitterSize as number;
  }

  getSplitterExtra() {
    return this.attributes.splitterExtra as number;
  }

  isEnableEdgeDock() {
    return this.attributes.enableEdgeDock as boolean;
  }

  isSplitterEnableHandle() {
    return this.attributes.splitterEnableHandle as boolean;
  }

  /**
   * Sets a function to allow/deny dropping a node
   * @param onAllowDrop function that takes the drag node and DropInfo and returns true if the drop is allowed
   */
  setOnAllowDrop(onAllowDrop: (dragNode: Node, dropInfo: DropInfo) => boolean) {
    this.onAllowDrop = onAllowDrop;
  }

  /**
   * set callback called when a new TabSet is created.
   * The tabNode can be undefined if it's the auto created first tabset in the root row (when the last
   * tab is deleted, the root tabset can be recreated)
   * @param onCreateTabSet
   */
  setOnCreateTabSet(onCreateTabSet: (tabNode?: undefined | TabNode) => TabSetAttributes) {
    this.onCreateTabSet = onCreateTabSet;
  }

  addChangeListener(listener: (action: Action) => void) {
    this.changeListeners.push(listener);
  }

  removeChangeListener(listener: (action: Action) => void) {
    const pos = this.changeListeners.indexOf(listener);
    if (pos !== -1) {
      this.changeListeners.splice(pos, 1);
    }
  }

  toString() {
    return JSON.stringify(this.toJson());
  }

  /**
   * Custom toJSON for safe serialization (e.g., console.log, JSON.stringify).
   * This prevents serialization tools from traversing into Window references,
   * which could lead to cross-origin SecurityError when iframes are present.
   */
  toJSON(): { windowIds: string[]; borderCount: number } {
    return {
      windowIds: [...this.windows.keys()],
      borderCount: this.borders.getBorders().length,
    };
  }

  /***********************internal ********************************/

  /** @internal */
  removeEmptyWindows() {
    const emptyWindows = new Set<string>();
    for (const [windowId] of this.windows) {
      if (windowId !== Model.MAIN_WINDOW_ID) {
        let count = 0;
        this.visitWindowNodes(windowId, (node) => {
          if (node instanceof TabNode) {
            count++;
          }
        });
        if (count === 0) {
          emptyWindows.add(windowId);
        }
      }
    }

    for (const windowId of emptyWindows) {
      this.windows.delete(windowId);
    }
  }

  /** @internal */
  setActiveTabset(tabsetNode: TabSetNode | undefined, windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      if (tabsetNode) {
        window.activeTabSet = tabsetNode;
      } else {
        window.activeTabSet = undefined;
      }
    }
  }

  /** @internal */
  setMaximizedTabset(tabsetNode: TabSetNode | undefined, windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      if (tabsetNode) {
        window.maximizedTabSet = tabsetNode;
      } else {
        window.maximizedTabSet = undefined;
      }
    }
  }

  /** @internal */
  updateIdMap() {
    // regenerate idMap to stop it building up
    this.idMap.clear();
    this.visitNodes((node) => {
      this.idMap.set(node.getId(), node);
      // if (node instanceof RowNode) {
      //     node.normalizeWeights();
      // }
    });
    // console.log(JSON.stringify(Object.keys(this._idMap)));
  }

  /** @internal */
  addNode(node: Node) {
    const id = node.getId();
    if (this.idMap.has(id)) {
      throw new Error(`Error: each node must have a unique id, duplicate id:${node.getId()}`);
    }

    this.idMap.set(id, node);
  }

  /** @internal */
  findDropTargetNode(windowId: string, dragNode: Node & IDraggable, x: number, y: number) {
    let node = (this.windows.get(windowId)!.root as RowNode).findDropTargetNode(windowId, dragNode, x, y);
    if (node === undefined && windowId === Model.MAIN_WINDOW_ID) {
      node = this.borders.findDropTargetNode(dragNode, x, y);
    }
    return node;
  }

  /** @internal */
  tidy() {
    // console.log("before _tidy", this.toString());
    for (const [_, window] of this.windows) {
      window.root!.tidy();
    }
    // console.log("after _tidy", this.toString());
  }

  /** @internal */
  updateAttrs(json: UnsafeTypes.UnsafeAny) {
    Model.attributeDefinitions.update(json, this.attributes);
  }

  /** @internal */
  nextUniqueId() {
    return `#${randomUUID()}`;
  }

  /** @internal */
  getAttribute(name: string): UnsafeTypes.UnsafeAny {
    return this.attributes[name];
  }

  /** @internal */
  getOnAllowDrop() {
    return this.onAllowDrop;
  }

  /** @internal */
  getOnCreateTabSet() {
    return this.onCreateTabSet;
  }

  static toTypescriptInterfaces() {
    Model.attributeDefinitions.pairAttributes("RowNode", RowNode.getAttributeDefinitions());
    Model.attributeDefinitions.pairAttributes("TabSetNode", TabSetNode.getAttributeDefinitions());
    Model.attributeDefinitions.pairAttributes("TabNode", TabNode.getAttributeDefinitions());
    Model.attributeDefinitions.pairAttributes("BorderNode", BorderNode.getAttributeDefinitions());

    const sb = [];
    sb.push(Model.attributeDefinitions.toTypescriptInterface("Global", undefined));
    sb.push(RowNode.getAttributeDefinitions().toTypescriptInterface("Row", Model.attributeDefinitions));
    sb.push(TabSetNode.getAttributeDefinitions().toTypescriptInterface("TabSet", Model.attributeDefinitions));
    sb.push(TabNode.getAttributeDefinitions().toTypescriptInterface("Tab", Model.attributeDefinitions));
    sb.push(BorderNode.getAttributeDefinitions().toTypescriptInterface("Border", Model.attributeDefinitions));
    console.log(sb.join("\n"));
  }

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();

    attributeDefinitions
      .add("enableEdgeDock", true)
      .setType(Attribute.BOOLEAN)
      .setDescription(`enable docking to the edges of the layout, this will show the edge indicators`);
    attributeDefinitions
      .add("rootOrientationVertical", false)
      .setType(Attribute.BOOLEAN)
      .setDescription(
        `the top level 'row' will layout horizontally by default, set this option true to make it layout vertically`
      );
    attributeDefinitions
      .add("enableRotateBorderIcons", true)
      .setType(Attribute.BOOLEAN)
      .setDescription(`boolean indicating if tab icons should rotate with the text in the left and right borders`);

    // splitter
    attributeDefinitions
      .add("splitterSize", 8)
      .setType(Attribute.NUMBER)
      .setDescription(`width in pixels of all splitters between tabsets/borders`);
    attributeDefinitions
      .add("splitterExtra", 0)
      .setType(Attribute.NUMBER)
      .setDescription(`additional width in pixels of the splitter hit test area`);
    attributeDefinitions
      .add("splitterEnableHandle", false)
      .setType(Attribute.BOOLEAN)
      .setDescription(`enable a small centralized handle on all splitters`);

    // tab
    attributeDefinitions.add("tabEnableClose", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabCloseType", 1).setType("ICloseType");
    attributeDefinitions.add("tabEnablePopout", false).setType(Attribute.BOOLEAN).setAlias("tabEnableFloat");
    attributeDefinitions.add("tabEnablePopoutIcon", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnablePopoutOverlay", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnableDrag", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnableRename", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabContentClassName", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabClassName", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabIcon", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabEnableRenderOnDemand", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabDragSpeed", 0.3).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabBorderWidth", -1).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabBorderHeight", -1).setType(Attribute.NUMBER);

    // tabset
    attributeDefinitions.add("tabSetEnableDeleteWhenEmpty", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDrop", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDrag", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDivide", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableMaximize", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableClose", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableSingleTabStretch", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetAutoSelectTab", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableActiveIcon", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetClassNameTabStrip", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabSetEnableTabStrip", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableTabWrap", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetTabLocation", "top").setType("ITabLocation");
    attributeDefinitions.add("tabMinWidth", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabMinHeight", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMinWidth", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMinHeight", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabMaxWidth", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabMaxHeight", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMaxWidth", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMaxHeight", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetEnableTabScrollbar", false).setType(Attribute.BOOLEAN);

    // border
    attributeDefinitions.add("borderSize", 200).setType(Attribute.NUMBER);
    attributeDefinitions.add("borderMinSize", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("borderMaxSize", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("borderEnableDrop", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderAutoSelectTabWhenOpen", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderAutoSelectTabWhenClosed", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderClassName", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("borderEnableAutoHide", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderEnableTabScrollbar", false).setType(Attribute.BOOLEAN);

    return attributeDefinitions;
  }
}

// ============================================================================
// IModel Schema Class - Effect Schema version of Model
// ============================================================================

const $I = $UiId.create("flexlayout-react/model/Model");

/**
 * Minimal serializable data for IModel.
 * Model stores most state at instance level, not in schema.
 */
export class IModelData extends S.Class<IModelData>($I`IModelData`)({}) {}

/**
 * Effect Schema version of Model - the orchestrator class for the FlexLayout tree.
 *
 * Manages the entire node tree, handles actions, and maintains state.
 * Uses static factory methods since Effect Schema classes cannot override constructors.
 */
export class IModel extends S.Class<IModel>($I`IModel`)({
  data: IModelData,
}) {
  static MAIN_WINDOW_ID = "__main_window_id__";

  // ========================================================================
  // Static attribute definitions
  // ========================================================================

  /** @internal */
  private static attributeDefinitions: AttributeDefinitions = IModel.createAttributeDefinitions();

  // ========================================================================
  // Non-serializable runtime fields
  // ========================================================================

  /** @internal */
  private _attributes: Record<string, UnsafeTypes.UnsafeAny> = {};
  /** @internal */
  private _idMap: Map<string, INode> = new Map();
  /** @internal */
  private _changeListeners: ((action: Action) => void)[] = [];
  /** @internal */
  private _borders: O.Option<IBorderSet> = O.none();
  /** @internal */
  private _onAllowDrop: O.Option<(dragNode: INode, dropInfo: DropInfo) => boolean> = O.none();
  /** @internal */
  private _onCreateTabSet: O.Option<(tabNode?: ITabNode) => TabSetAttributes> = O.none();
  /** @internal */
  private _windows: Map<string, ILayoutWindow> = new Map();
  /** @internal */
  private _rootWindow: O.Option<ILayoutWindow> = O.none();

  // ========================================================================
  // Static factory methods
  // ========================================================================

  /**
   * Create a new empty IModel instance.
   * @internal
   */
  static readonly new = (): IModel => {
    const instance = new IModel({ data: {} });
    instance._initialize();
    return instance;
  };

  /**
   * Initialize instance fields.
   * @internal
   */
  private _initialize(): void {
    this._attributes = {};
    this._idMap = new Map();
    this._changeListeners = [];
    this._borders = O.some(IBorderSet.new(this));
    this._windows = new Map<string, ILayoutWindow>();
    const rootWindow = ILayoutWindow.fromRect(IModel.MAIN_WINDOW_ID, 0, 0, 0, 0);
    this._rootWindow = O.some(rootWindow);
    this._windows.set(IModel.MAIN_WINDOW_ID, rootWindow);
  }

  /**
   * Loads the model from the given json object
   * @param json the json model to load
   * @returns {IModel} a new IModel object
   */
  static fromJson(json: JsonModel): IModel {
    const model = IModel.new();
    IModel.attributeDefinitions.fromJson(json.global, model._attributes);

    if (json.borders) {
      model._borders = O.some(IBorderSet.fromJson(json.borders, model));
    }
    if (P.isNotNullable(json.popouts)) {
      for (const [windowId, windowJson] of Struct.entries(json.popouts)) {
        const layoutWindow = ILayoutWindow.fromJson(windowJson, model, windowId);
        model._windows.set(windowId, layoutWindow);
      }
    }

    const rootWindow = O.getOrThrow(model._rootWindow);
    const mainWindow = model._windows.get(IModel.MAIN_WINDOW_ID)!;
    rootWindow.setRoot(
      IRowNode.fromJson(json.layout, model, mainWindow as unknown as LayoutWindow) as unknown as RowNode
    );
    model.tidy(); // initial tidy of node tree
    return model;
  }

  // ========================================================================
  // Action handler
  // ========================================================================

  /**
   * Update the node tree by performing the given action,
   * Actions should be generated via static methods on the Actions class
   * @param action the action to perform
   * @returns added Node for Actions.addNode, windowId for createWindow
   */
  doAction(action: Action): UnsafeTypes.UnsafeAny {
    let returnVal = undefined;
    const rootWindow = O.getOrThrow(this._rootWindow);

    switch (action.type) {
      case Actions.ADD_NODE: {
        const newNode = ITabNode.new(this, action.data.json, true);
        const toNode = this._idMap.get(action.data.toNode) as unknown as Node & IDraggable;
        if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
          toNode.drop(
            newNode as unknown as Node & IDraggable,
            DockLocation.getByName(action.data.location),
            action.data.index,
            action.data.select
          );
          returnVal = newNode;
        }
        break;
      }
      case Actions.MOVE_NODE: {
        const fromNode = this._idMap.get(action.data.fromNode) as unknown as Node & IDraggable;

        if (fromNode instanceof TabNode || fromNode instanceof TabSetNode || fromNode instanceof RowNode) {
          if (fromNode === this.getMaximizedTabset(fromNode.getWindowId())) {
            const fromWindow = this._windows.get(fromNode.getWindowId())!;
            fromWindow.setMaximizedTabSet(undefined);
          }
          const toNode = this._idMap.get(action.data.toNode) as unknown as Node & IDropTarget;
          if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
            toNode.drop(fromNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
          }
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.DELETE_TAB: {
        const node = this._idMap.get(action.data.node);
        if (node instanceof TabNode) {
          node.delete();
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.DELETE_TABSET: {
        const node = this._idMap.get(action.data.node) as unknown as Node;

        if (node instanceof TabSetNode) {
          // first delete all child tabs that are closeable
          const children = [...node.getChildren()];
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if ((child as TabNode).isEnableClose()) {
              (child as TabNode).delete();
            }
          }

          if (node.getChildren().length === 0) {
            node.delete();
          }
          this.tidy();
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.POPOUT_TABSET: {
        const node = this._idMap.get(action.data.node) as unknown as Node;
        if (node instanceof TabSetNode) {
          const isMaximized = node.isMaximized();
          const oldLayoutWindow = this._windows.get(node.getWindowId())!;
          const windowId = randomUUID();
          const screenRect = oldLayoutWindow.toScreenRectFunction(node.getRect());
          const layoutWindow = ILayoutWindow.fromRect(
            windowId,
            screenRect.x,
            screenRect.y,
            screenRect.width,
            screenRect.height
          );
          const json = {
            type: "row",
            children: [],
          };
          // Type assertion needed: RowNode.fromJson expects Model
          const row = RowNode.fromJson(json, this as unknown as Model, layoutWindow as unknown as LayoutWindow);
          layoutWindow.setRoot(row);
          this._windows.set(windowId, layoutWindow);
          row.drop(node, DockLocation.CENTER, 0);

          if (isMaximized) {
            rootWindow.setMaximizedTabSet(undefined);
          }
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.POPOUT_TAB: {
        const node = this._idMap.get(action.data.node) as unknown as Node;
        if (node instanceof TabNode) {
          const windowId = randomUUID();
          let r = Rect.empty();
          if (node.getParent() instanceof TabSetNode) {
            r = node.getParent()!.getRect();
          } else {
            r = (node.getParent() as BorderNode).getContentRect();
          }
          const oldLayoutWindow = this._windows.get(node.getWindowId())!;
          const screenRect = oldLayoutWindow.toScreenRectFunction(r);
          const layoutWindow = ILayoutWindow.fromRect(
            windowId,
            screenRect.x,
            screenRect.y,
            screenRect.width,
            screenRect.height
          );
          const tabsetId = randomUUID();
          const json = {
            type: "row",
            children: [{ type: "tabset", id: tabsetId }],
          };
          // Type assertion needed: RowNode.fromJson expects Model
          layoutWindow.setRoot(
            RowNode.fromJson(json, this as unknown as Model, layoutWindow as unknown as LayoutWindow)
          );
          this._windows.set(windowId, layoutWindow);

          const tabset = this._idMap.get(tabsetId) as unknown as TabSetNode & IDropTarget;
          tabset.drop(node, DockLocation.CENTER, 0, true);
        }
        this.removeEmptyWindows();
        break;
      }
      case Actions.CLOSE_WINDOW: {
        const window = this._windows.get(action.data.windowId);
        if (window) {
          (rootWindow.root as unknown as RowNode)?.drop(window!.root as unknown as RowNode, DockLocation.CENTER, -1);
          rootWindow.visitNodes((node, _level) => {
            if (node instanceof RowNode) {
              node.setWindowId(IModel.MAIN_WINDOW_ID);
            }
          });

          this._windows.delete(action.data.windowId);
        }
        break;
      }
      case Actions.CREATE_WINDOW: {
        const windowId = randomUUID();
        const rect = Rect.fromJson(action.data.rect);
        const layoutWindow = ILayoutWindow.fromRect(windowId, rect.x, rect.y, rect.width, rect.height);
        // Type assertion needed: RowNode.fromJson expects Model
        layoutWindow.setRoot(
          RowNode.fromJson(action.data.layout, this as unknown as Model, layoutWindow as unknown as LayoutWindow)
        );
        this._windows.set(windowId, layoutWindow);
        returnVal = windowId;
        break;
      }
      case Actions.RENAME_TAB: {
        const node = this._idMap.get(action.data.node);
        if (node instanceof TabNode) {
          node.setName(action.data.text);
        }
        break;
      }
      case Actions.SELECT_TAB: {
        const tabNode = this._idMap.get(action.data.tabNode) as unknown as Node;
        const windowId = action.data.windowId ? action.data.windowId : IModel.MAIN_WINDOW_ID;
        const window = this._windows.get(windowId)!;
        if (tabNode instanceof TabNode) {
          const parent = tabNode.getParent() as Node;
          const pos = parent.getChildren().indexOf(tabNode);

          if (parent instanceof BorderNode) {
            if (parent.getSelected() === pos) {
              parent.setSelected(-1);
            } else {
              parent.setSelected(pos);
            }
          } else if (parent instanceof TabSetNode) {
            if (parent.getSelected() !== pos) {
              parent.setSelected(pos);
            }
            window.setActiveTabSet(parent as unknown as TabSetNode);
          }
        }
        break;
      }
      case Actions.SET_ACTIVE_TABSET: {
        const windowId = action.data.windowId ? action.data.windowId : IModel.MAIN_WINDOW_ID;
        const window = this._windows.get(windowId)!;
        if (action.data.tabsetNode === undefined) {
          window.setActiveTabSet(undefined);
        } else {
          const tabsetNode = this._idMap.get(action.data.tabsetNode) as unknown as Node;
          if (tabsetNode instanceof TabSetNode) {
            window.setActiveTabSet(tabsetNode as unknown as TabSetNode);
          }
        }
        break;
      }
      case Actions.ADJUST_WEIGHTS: {
        const row = this._idMap.get(action.data.nodeId) as unknown as RowNode;
        if (!row) {
          break;
        }
        const c = row.getChildren();
        for (let i = 0; i < c.length; i++) {
          const n = c[i] as TabSetNode | RowNode;
          n.setWeight(action.data.weights[i]);
        }
        break;
      }
      case Actions.ADJUST_BORDER_SPLIT: {
        const node = this._idMap.get(action.data.node) as unknown as Node;
        if (node instanceof BorderNode) {
          node.setSize(action.data.pos);
        }
        break;
      }
      case Actions.MAXIMIZE_TOGGLE: {
        const windowId = action.data.windowId ? action.data.windowId : IModel.MAIN_WINDOW_ID;
        const window = this._windows.get(windowId)!;
        const node = this._idMap.get(action.data.node) as unknown as Node;
        if (node instanceof TabSetNode) {
          if (node === window.maximizedTabSet) {
            window.setMaximizedTabSet(undefined);
          } else {
            window.setMaximizedTabSet(node as unknown as TabSetNode);
            window.setActiveTabSet(node as unknown as TabSetNode);
          }
        }

        break;
      }
      case Actions.UPDATE_MODEL_ATTRIBUTES: {
        this.updateAttrs(action.data.json);
        break;
      }

      case Actions.UPDATE_NODE_ATTRIBUTES: {
        const node = this._idMap.get(action.data.node)!;
        node.updateAttrs(action.data.json);
        break;
      }
      default:
        break;
    }

    this.updateIdMap();

    for (const listener of this._changeListeners) {
      listener(action);
    }

    return returnVal;
  }

  // ========================================================================
  // Serialization
  // ========================================================================

  /**
   * Converts the model to a json object
   * @returns {IJsonModel} json object that represents this model
   */
  toJson(): JsonModel {
    const global: UnsafeTypes.UnsafeAny = {};
    IModel.attributeDefinitions.toJson(global, this._attributes);
    const borders = O.getOrThrow(this._borders);
    const rootWindow = O.getOrThrow(this._rootWindow);

    // save state of nodes
    this.visitNodes((node) => {
      node.fireEvent("save", {});
    });

    const windows: Record<string, JsonPopout> = {};
    for (const [id, window] of this._windows) {
      if (id !== IModel.MAIN_WINDOW_ID) {
        windows[id] = window.toJson();
      }
    }

    return {
      global,
      borders: borders.toJson(),
      layout: rootWindow.root!.toJson(),
      popouts: windows,
    };
  }

  /**
   * Custom toJSON for safe serialization (e.g., console.log, JSON.stringify).
   * This prevents serialization tools from traversing into Window references,
   * which could lead to cross-origin SecurityError when iframes are present.
   */
  toJSON(): { windowIds: string[]; borderCount: number } {
    const borders = O.getOrThrow(this._borders);
    return {
      windowIds: [...this._windows.keys()],
      borderCount: borders.getBorders().length,
    };
  }

  override toString() {
    return JSON.stringify(this.toJson());
  }

  // ========================================================================
  // Getters and setters
  // ========================================================================

  /**
   * Get the currently active tabset node
   */
  getActiveTabset(windowId: string = IModel.MAIN_WINDOW_ID) {
    const window = this._windows.get(windowId);
    if (P.isNotNullable(window) && window.activeTabSet && this.getNodeById(window.activeTabSet.getId())) {
      return window.activeTabSet;
    }
    return undefined;
  }

  /**
   * Get the currently maximized tabset node
   */
  getMaximizedTabset(windowId: string = IModel.MAIN_WINDOW_ID) {
    return this._windows.get(windowId)!.maximizedTabSet;
  }

  /**
   * Gets the root RowNode of the model
   * @returns {RowNode}
   */
  getRoot(windowId: string = IModel.MAIN_WINDOW_ID) {
    return this._windows.get(windowId)!.root!;
  }

  isRootOrientationVertical() {
    return this._attributes.rootOrientationVertical as boolean;
  }

  isEnableRotateBorderIcons() {
    return this._attributes.enableRotateBorderIcons as boolean;
  }

  /**
   * Gets the BorderSet
   * @returns {BorderSet|*}
   */
  getBorderSet() {
    return O.getOrThrow(this._borders);
  }

  getwindowsMap() {
    return this._windows;
  }

  getSplitterSize() {
    return this._attributes.splitterSize as number;
  }

  getSplitterExtra() {
    return this._attributes.splitterExtra as number;
  }

  isEnableEdgeDock() {
    return this._attributes.enableEdgeDock as boolean;
  }

  isSplitterEnableHandle() {
    return this._attributes.splitterEnableHandle as boolean;
  }

  /**
   * Sets a function to allow/deny dropping a node
   * @param onAllowDrop function that takes the drag node and DropInfo and returns true if the drop is allowed
   */
  setOnAllowDrop(onAllowDrop: (dragNode: INode, dropInfo: DropInfo) => boolean) {
    this._onAllowDrop = O.some(onAllowDrop);
  }

  /**
   * set callback called when a new TabSet is created.
   * The tabNode can be undefined if it's the auto created first tabset in the root row (when the last
   * tab is deleted, the root tabset can be recreated)
   * @param onCreateTabSet
   */
  setOnCreateTabSet(onCreateTabSet: (tabNode?: undefined | ITabNode) => TabSetAttributes) {
    this._onCreateTabSet = O.some(onCreateTabSet);
  }

  addChangeListener(listener: (action: Action) => void) {
    this._changeListeners.push(listener);
  }

  removeChangeListener(listener: (action: Action) => void) {
    const pos = this._changeListeners.indexOf(listener);
    if (pos !== -1) {
      this._changeListeners.splice(pos, 1);
    }
  }

  // ========================================================================
  // Node traversal and lookup
  // ========================================================================

  /**
   * Visits all the nodes in the model and calls the given function for each
   * @param fn a function that takes visited node and a integer level as parameters
   */
  visitNodes(fn: (node: INode, level: number) => void) {
    const borders = O.getOrThrow(this._borders);
    borders.forEachNode(fn as unknown as (node: Node, level: number) => void);
    for (const [_, w] of this._windows) {
      w.root!.forEachNode(fn as unknown as (node: Node, level: number) => void, 0);
    }
  }

  visitWindowNodes(windowId: string, fn: (node: INode, level: number) => void) {
    if (this._windows.has(windowId)) {
      if (windowId === IModel.MAIN_WINDOW_ID) {
        const borders = O.getOrThrow(this._borders);
        borders.forEachNode(fn as unknown as (node: Node, level: number) => void);
      }
      this._windows.get(windowId)!.visitNodes(fn as unknown as (node: Node, level: number) => void);
    }
  }

  /**
   * Gets a node by its id
   * @param id the id to find
   */
  getNodeById(id: string): INode | undefined {
    return this._idMap.get(id);
  }

  /**
   * Finds the first/top left tab set of the given node.
   * @param node The top node you want to begin searching from, defaults to the root node
   * @returns The first Tab Set
   */
  getFirstTabSet(
    node: INode | undefined = this._windows.get(IModel.MAIN_WINDOW_ID)!.root as unknown as INode
  ): ITabSetNode {
    if (node === undefined) {
      throw new Error("No root node found");
    }
    const child = node.getChildren()[0];
    if (S.is(ITabSetNode)(child) || child instanceof TabSetNode) {
      return child as unknown as ITabSetNode;
    }
    return this.getFirstTabSet(child);
  }

  // ========================================================================
  // Internal methods
  // ========================================================================

  /** @internal */
  removeEmptyWindows() {
    const emptyWindows = new Set<string>();
    for (const [windowId] of this._windows) {
      if (windowId !== IModel.MAIN_WINDOW_ID) {
        let count = 0;
        this.visitWindowNodes(windowId, (node) => {
          if (node instanceof TabNode) {
            count++;
          }
        });
        if (count === 0) {
          emptyWindows.add(windowId);
        }
      }
    }

    for (const windowId of emptyWindows) {
      this._windows.delete(windowId);
    }
  }

  /** @internal */
  setActiveTabset(tabsetNode: ITabSetNode | undefined, windowId: string) {
    const window = this._windows.get(windowId);
    if (window) {
      window.setActiveTabSet(tabsetNode as unknown as TabSetNode | undefined);
    }
  }

  /** @internal */
  setMaximizedTabset(tabsetNode: ITabSetNode | undefined, windowId: string) {
    const window = this._windows.get(windowId);
    if (window) {
      window.setMaximizedTabSet(tabsetNode as unknown as TabSetNode | undefined);
    }
  }

  /** @internal */
  updateIdMap() {
    // regenerate idMap to stop it building up
    this._idMap.clear();
    this.visitNodes((node) => {
      this._idMap.set(node.getId(), node);
    });
  }

  /** @internal */
  addNode(node: INode) {
    const id = node.getId();
    if (this._idMap.has(id)) {
      throw new Error(`Error: each node must have a unique id, duplicate id:${node.getId()}`);
    }

    this._idMap.set(id, node);
  }

  /** @internal */
  findDropTargetNode(windowId: string, dragNode: INode & IDraggable, x: number, y: number) {
    const borders = O.getOrThrow(this._borders);
    let node = (this._windows.get(windowId)!.root as RowNode).findDropTargetNode(
      windowId,
      dragNode as unknown as Node & IDraggable,
      x,
      y
    );
    if (node === undefined && windowId === IModel.MAIN_WINDOW_ID) {
      node = borders.findDropTargetNode(dragNode as unknown as Node & IDraggable, x, y);
    }
    return node;
  }

  /** @internal */
  tidy() {
    for (const [_, window] of this._windows) {
      window.root!.tidy();
    }
  }

  /** @internal */
  updateAttrs(json: UnsafeTypes.UnsafeAny) {
    IModel.attributeDefinitions.update(json, this._attributes);
  }

  /** @internal */
  nextUniqueId() {
    return `#${randomUUID()}`;
  }

  /** @internal */
  getAttribute(name: string): UnsafeTypes.UnsafeAny {
    return this._attributes[name];
  }

  /** @internal */
  getOnAllowDrop() {
    return O.getOrUndefined(this._onAllowDrop);
  }

  /** @internal */
  getOnCreateTabSet() {
    return O.getOrUndefined(this._onCreateTabSet);
  }

  static toTypescriptInterfaces() {
    IModel.attributeDefinitions.pairAttributes("RowNode", RowNode.getAttributeDefinitions());
    IModel.attributeDefinitions.pairAttributes("TabSetNode", TabSetNode.getAttributeDefinitions());
    IModel.attributeDefinitions.pairAttributes("TabNode", TabNode.getAttributeDefinitions());
    IModel.attributeDefinitions.pairAttributes("BorderNode", BorderNode.getAttributeDefinitions());

    const sb = [];
    sb.push(IModel.attributeDefinitions.toTypescriptInterface("Global", undefined));
    sb.push(RowNode.getAttributeDefinitions().toTypescriptInterface("Row", IModel.attributeDefinitions));
    sb.push(TabSetNode.getAttributeDefinitions().toTypescriptInterface("TabSet", IModel.attributeDefinitions));
    sb.push(TabNode.getAttributeDefinitions().toTypescriptInterface("Tab", IModel.attributeDefinitions));
    sb.push(BorderNode.getAttributeDefinitions().toTypescriptInterface("Border", IModel.attributeDefinitions));
    console.log(sb.join("\n"));
  }

  // ========================================================================
  // Static attribute definition creation
  // ========================================================================

  /** @internal */
  private static createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();

    attributeDefinitions
      .add("enableEdgeDock", true)
      .setType(Attribute.BOOLEAN)
      .setDescription(`enable docking to the edges of the layout, this will show the edge indicators`);
    attributeDefinitions
      .add("rootOrientationVertical", false)
      .setType(Attribute.BOOLEAN)
      .setDescription(
        `the top level 'row' will layout horizontally by default, set this option true to make it layout vertically`
      );
    attributeDefinitions
      .add("enableRotateBorderIcons", true)
      .setType(Attribute.BOOLEAN)
      .setDescription(`boolean indicating if tab icons should rotate with the text in the left and right borders`);

    // splitter
    attributeDefinitions
      .add("splitterSize", 8)
      .setType(Attribute.NUMBER)
      .setDescription(`width in pixels of all splitters between tabsets/borders`);
    attributeDefinitions
      .add("splitterExtra", 0)
      .setType(Attribute.NUMBER)
      .setDescription(`additional width in pixels of the splitter hit test area`);
    attributeDefinitions
      .add("splitterEnableHandle", false)
      .setType(Attribute.BOOLEAN)
      .setDescription(`enable a small centralized handle on all splitters`);

    // tab
    attributeDefinitions.add("tabEnableClose", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabCloseType", 1).setType("ICloseType");
    attributeDefinitions.add("tabEnablePopout", false).setType(Attribute.BOOLEAN).setAlias("tabEnableFloat");
    attributeDefinitions.add("tabEnablePopoutIcon", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnablePopoutOverlay", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnableDrag", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnableRename", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabContentClassName", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabClassName", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabIcon", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabEnableRenderOnDemand", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabDragSpeed", 0.3).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabBorderWidth", -1).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabBorderHeight", -1).setType(Attribute.NUMBER);

    // tabset
    attributeDefinitions.add("tabSetEnableDeleteWhenEmpty", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDrop", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDrag", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDivide", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableMaximize", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableClose", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableSingleTabStretch", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetAutoSelectTab", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableActiveIcon", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetClassNameTabStrip", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabSetEnableTabStrip", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableTabWrap", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetTabLocation", "top").setType("ITabLocation");
    attributeDefinitions.add("tabMinWidth", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabMinHeight", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMinWidth", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMinHeight", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabMaxWidth", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabMaxHeight", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMaxWidth", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetMaxHeight", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("tabSetEnableTabScrollbar", false).setType(Attribute.BOOLEAN);

    // border
    attributeDefinitions.add("borderSize", 200).setType(Attribute.NUMBER);
    attributeDefinitions.add("borderMinSize", DefaultMin).setType(Attribute.NUMBER);
    attributeDefinitions.add("borderMaxSize", DefaultMax).setType(Attribute.NUMBER);
    attributeDefinitions.add("borderEnableDrop", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderAutoSelectTabWhenOpen", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderAutoSelectTabWhenClosed", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderClassName", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("borderEnableAutoHide", false).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderEnableTabScrollbar", false).setType(Attribute.BOOLEAN);

    return attributeDefinitions;
  }
}
