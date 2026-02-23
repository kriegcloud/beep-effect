/**
 * Shared types for flexlayout-react view components.
 * This file contains interfaces and types that are used across multiple view components
 * to avoid circular dependencies with Layout.tsx.
 */

import type { I18nLabel } from "../I18nLabel";
import type { Action } from "../model/Action";
import type { BorderNode } from "../model/BorderNode";
import type { Model } from "../model/Model";
import type { Node } from "../model/Node";
import type { TabNode } from "../model/TabNode";
import type { TabSetNode } from "../model/TabSetNode";
import type { Rect } from "../Rect";

export interface ITabRenderValues {
  /** the icon or other leading component */
  leading: React.ReactNode;
  /** the main tab text/component */
  content: React.ReactNode;
  /** a set of react components to add to the tab after the content */
  buttons: React.ReactNode[];
  /** The name used in the overflow menu */
  name: string;
}

export interface ITabSetRenderValues {
  /** a component to be placed before the tabs */
  leading: React.ReactNode;
  /** components that will be added after the tabs */
  stickyButtons: React.ReactNode[];
  /** components that will be added at the end of the tabset */
  buttons: React.ReactNode[];
  /** position to insert overflow button within [...stickyButtons, ...buttons]
   * if left undefined position will be after the sticky buttons (if any)
   */
  overflowPosition: number | undefined;
}

export interface IIcons {
  close?: undefined | (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
  closeTabset?: undefined | (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
  popout?: undefined | (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
  maximize?: undefined | (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
  restore?: undefined | (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
  more?:
    | undefined
    | (
        | React.ReactNode
        | ((
            tabSetNode: TabSetNode | BorderNode,
            hiddenTabs: {
              node: TabNode;
              index: number;
            }[]
          ) => React.ReactNode)
      );
  edgeArrow?: undefined | React.ReactNode;
  activeTabset?: undefined | (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
}

export type NodeMouseEvent = (
  node: TabNode | TabSetNode | BorderNode,
  event: React.MouseEvent<HTMLElement, MouseEvent>
) => void;

export type ShowOverflowMenuCallback = (
  node: TabSetNode | BorderNode,
  mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>,
  items: { index: number; node: TabNode }[],
  onSelect: (item: { index: number; node: TabNode }) => void
) => void;

export type TabSetPlaceHolderCallback = (node: TabSetNode) => React.ReactNode;

/** Props interface for layout - used by SizeTracker */
export interface ILayoutProps {
  factory: (node: TabNode) => React.ReactNode;
}

/**
 * Interface for LayoutInternal used by child view components.
 * This allows child components to reference the layout without importing Layout.tsx directly.
 */
export interface ILayoutInternal {
  // Props access
  props: ILayoutProps;

  // Rect and DOM methods
  getBoundingClientRect(element: HTMLElement): Rect;
  getDomRect(): Rect | undefined;
  getRootDiv(): HTMLDivElement | null;
  getMainElement(): Element | null;
  getCurrentDocument(): Document | undefined;

  // Class name and i18n
  getClassName(defaultClassName: string): string;
  i18nName(id: I18nLabel.Type, param?: string): string;

  // Icons and callbacks
  getIcons(): IIcons;
  getShowOverflowMenu(): ShowOverflowMenuCallback | undefined;
  getTabSetPlaceHolderCallback(): TabSetPlaceHolderCallback | undefined;

  // Tab customization
  customizeTab(tabNode: TabNode, renderValues: ITabRenderValues): void;
  customizeTabSet(tabSetNode: TabSetNode | BorderNode, renderValues: ITabSetRenderValues): void;

  // State
  getWindowId(): string;
  getEditingTab(): TabNode | undefined;
  setEditingTab(node: TabNode | undefined): void;
  isSupportsPopout(): boolean;
  isRealtimeResize(): boolean;

  // Model access
  getModel(): Model;

  // Actions
  doAction(action: Action): Node | undefined;
  auxMouseClick(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>): void;
  clearDragMain(): void;
  redrawInternal(reason: string): void;
  maximize(tabSetNode: TabSetNode): void;

  // Drag operations
  setDragNode(event: Event | React.DragEvent<HTMLElement>, node: Node): void;
  showContextMenu(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>): void;

  // Portal/overlay operations
  showOverlay(show: boolean): void;
  showControlInPortal(control: React.ReactNode, element: HTMLElement): void;
  hideControlInPortal(): void;
}
