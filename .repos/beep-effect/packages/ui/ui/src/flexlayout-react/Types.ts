import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $UiId.create("flex-layout/types");

/**
 * CSS class names used throughout the flex-layout system.
 * Using `as const` for TypeScript erasable syntax compatibility.
 */
export const CLASSES = {
  // Border classes
  FLEXLAYOUT__BORDER: "flexlayout__border",
  FLEXLAYOUT__BORDER_: "flexlayout__border_",

  FLEXLAYOUT__BORDER_TAB_CONTENTS: "flexlayout__border_tab_contents",
  FLEXLAYOUT__BORDER_BUTTON: "flexlayout__border_button",
  FLEXLAYOUT__BORDER_BUTTON_: "flexlayout__border_button_",
  FLEXLAYOUT__BORDER_BUTTON_CONTENT: "flexlayout__border_button_content",
  FLEXLAYOUT__BORDER_BUTTON_LEADING: "flexlayout__border_button_leading",
  FLEXLAYOUT__BORDER_BUTTON_TRAILING: "flexlayout__border_button_trailing",
  FLEXLAYOUT__BORDER_BUTTON__SELECTED: "flexlayout__border_button--selected",
  FLEXLAYOUT__BORDER_BUTTON__UNSELECTED: "flexlayout__border_button--unselected",
  FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW: "flexlayout__border_toolbar_button_overflow",
  FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW_: "flexlayout__border_toolbar_button_overflow_",

  FLEXLAYOUT__BORDER_INNER: "flexlayout__border_inner",
  FLEXLAYOUT__BORDER_INNER_: "flexlayout__border_inner_",
  FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER: "flexlayout__border_inner_tab_container",
  FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER_: "flexlayout__border_inner_tab_container_",
  FLEXLAYOUT__BORDER_TAB_DIVIDER: "flexlayout__border_tab_divider",
  FLEXLAYOUT__BORDER_LEADING: "flexlayout__border_leading",

  FLEXLAYOUT__BORDER_SIZER: "flexlayout__border_sizer",

  FLEXLAYOUT__BORDER_TOOLBAR: "flexlayout__border_toolbar",
  FLEXLAYOUT__BORDER_TOOLBAR_: "flexlayout__border_toolbar_",
  FLEXLAYOUT__BORDER_TOOLBAR_BUTTON: "flexlayout__border_toolbar_button",
  FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT: "flexlayout__border_toolbar_button-float",

  // Drag classes
  FLEXLAYOUT__DRAG_RECT: "flexlayout__drag_rect",

  // Edge rect classes
  FLEXLAYOUT__EDGE_RECT: "flexlayout__edge_rect",
  FLEXLAYOUT__EDGE_RECT_TOP: "flexlayout__edge_rect_top",
  FLEXLAYOUT__EDGE_RECT_LEFT: "flexlayout__edge_rect_left",
  FLEXLAYOUT__EDGE_RECT_BOTTOM: "flexlayout__edge_rect_bottom",
  FLEXLAYOUT__EDGE_RECT_RIGHT: "flexlayout__edge_rect_right",

  // Error boundary classes
  FLEXLAYOUT__ERROR_BOUNDARY_CONTAINER: "flexlayout__error_boundary_container",
  FLEXLAYOUT__ERROR_BOUNDARY_CONTENT: "flexlayout__error_boundary_content",

  // Floating window classes
  FLEXLAYOUT__FLOATING_WINDOW_CONTENT: "flexlayout__floating_window_content",

  // Layout classes
  FLEXLAYOUT__LAYOUT: "flexlayout__layout",
  FLEXLAYOUT__LAYOUT_MOVEABLES: "flexlayout__layout_moveables",
  FLEXLAYOUT__LAYOUT_OVERLAY: "flexlayout__layout_overlay",
  FLEXLAYOUT__LAYOUT_TAB_STAMPS: "flexlayout__layout_tab_stamps",
  FLEXLAYOUT__LAYOUT_MAIN: "flexlayout__layout_main",
  FLEXLAYOUT__LAYOUT_BORDER_CONTAINER: "flexlayout__layout_border_container",
  FLEXLAYOUT__LAYOUT_BORDER_CONTAINER_INNER: "flexlayout__layout_border_container_inner",

  // Outline classes
  FLEXLAYOUT__OUTLINE_RECT: "flexlayout__outline_rect",
  FLEXLAYOUT__OUTLINE_RECT_EDGE: "flexlayout__outline_rect_edge",

  // Splitter classes
  FLEXLAYOUT__SPLITTER: "flexlayout__splitter",
  FLEXLAYOUT__SPLITTER_EXTRA: "flexlayout__splitter_extra",
  FLEXLAYOUT__SPLITTER_: "flexlayout__splitter_",
  FLEXLAYOUT__SPLITTER_BORDER: "flexlayout__splitter_border",
  FLEXLAYOUT__SPLITTER_DRAG: "flexlayout__splitter_drag",
  FLEXLAYOUT__SPLITTER_HANDLE: "flexlayout__splitter_handle",
  FLEXLAYOUT__SPLITTER_HANDLE_HORZ: "flexlayout__splitter_handle_horz",
  FLEXLAYOUT__SPLITTER_HANDLE_VERT: "flexlayout__splitter_handle_vert",

  // Row and tab classes
  FLEXLAYOUT__ROW: "flexlayout__row",
  FLEXLAYOUT__TAB: "flexlayout__tab",
  FLEXLAYOUT__TAB_POSITION: "flexlayout__tab_position",
  FLEXLAYOUT__TAB_MOVEABLE: "flexlayout__tab_moveable",
  FLEXLAYOUT__TAB_OVERLAY: "flexlayout__tab_overlay",

  // Tabset classes
  FLEXLAYOUT__TABSET: "flexlayout__tabset",
  FLEXLAYOUT__TABSET_CONTAINER: "flexlayout__tabset_container",
  FLEXLAYOUT__TABSET_HEADER: "flexlayout__tabset_header",
  FLEXLAYOUT__TABSET_HEADER_CONTENT: "flexlayout__tabset_header_content",
  FLEXLAYOUT__TABSET_MAXIMIZED: "flexlayout__tabset-maximized",
  FLEXLAYOUT__TABSET_SELECTED: "flexlayout__tabset-selected",
  FLEXLAYOUT__TABSET_TAB_DIVIDER: "flexlayout__tabset_tab_divider",
  FLEXLAYOUT__TABSET_CONTENT: "flexlayout__tabset_content",
  FLEXLAYOUT__TABSET_TABBAR_INNER: "flexlayout__tabset_tabbar_inner",
  FLEXLAYOUT__TABSET_TABBAR_INNER_: "flexlayout__tabset_tabbar_inner_",
  FLEXLAYOUT__TABSET_LEADING: "flexlayout__tabset_leading",

  FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER: "flexlayout__tabset_tabbar_inner_tab_container",
  FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER_: "flexlayout__tabset_tabbar_inner_tab_container_",

  FLEXLAYOUT__TABSET_TABBAR_OUTER: "flexlayout__tabset_tabbar_outer",
  FLEXLAYOUT__TABSET_TABBAR_OUTER_: "flexlayout__tabset_tabbar_outer_",

  // Tab border and button classes
  FLEXLAYOUT__TAB_BORDER: "flexlayout__tab_border",
  FLEXLAYOUT__TAB_BORDER_: "flexlayout__tab_border_",
  FLEXLAYOUT__TAB_BUTTON: "flexlayout__tab_button",
  FLEXLAYOUT__TAB_BUTTON_STRETCH: "flexlayout__tab_button_stretch",
  FLEXLAYOUT__TAB_BUTTON_CONTENT: "flexlayout__tab_button_content",
  FLEXLAYOUT__TAB_BUTTON_LEADING: "flexlayout__tab_button_leading",
  FLEXLAYOUT__TAB_BUTTON_OVERFLOW: "flexlayout__tab_button_overflow",
  FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT: "flexlayout__tab_button_overflow_count",
  FLEXLAYOUT__TAB_BUTTON_TEXTBOX: "flexlayout__tab_button_textbox",
  FLEXLAYOUT__TAB_BUTTON_TRAILING: "flexlayout__tab_button_trailing",
  FLEXLAYOUT__TAB_BUTTON_STAMP: "flexlayout__tab_button_stamp",

  // Tab toolbar classes
  FLEXLAYOUT__TAB_TOOLBAR: "flexlayout__tab_toolbar",
  FLEXLAYOUT__TAB_TOOLBAR_BUTTON: "flexlayout__tab_toolbar_button",
  FLEXLAYOUT__TAB_TOOLBAR_ICON: "flexlayout__tab_toolbar_icon",
  FLEXLAYOUT__TAB_TOOLBAR_BUTTON_: "flexlayout__tab_toolbar_button-",
  FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT: "flexlayout__tab_toolbar_button-float",
  FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER: "flexlayout__tab_toolbar_sticky_buttons_container",
  FLEXLAYOUT__TAB_TOOLBAR_BUTTON_CLOSE: "flexlayout__tab_toolbar_button-close",

  // Popup menu classes
  FLEXLAYOUT__POPUP_MENU_CONTAINER: "flexlayout__popup_menu_container",
  FLEXLAYOUT__POPUP_MENU_ITEM: "flexlayout__popup_menu_item",
  FLEXLAYOUT__POPUP_MENU_ITEM__SELECTED: "flexlayout__popup_menu_item--selected",
  FLEXLAYOUT__POPUP_MENU: "flexlayout__popup_menu",

  // Mini scrollbar classes
  FLEXLAYOUT__MINI_SCROLLBAR: "flexlayout__mini_scrollbar",
  FLEXLAYOUT__MINI_SCROLLBAR_CONTAINER: "flexlayout__mini_scrollbar_container",
} as const;

/**
 * Type representing valid CLASSES keys
 */
export type ClassesKey = keyof typeof CLASSES;

/**
 * Type representing valid CLASSES values
 */
export type ClassesValue = (typeof CLASSES)[ClassesKey];

export class Classes extends BS.MappedLiteralKitFromEnum(CLASSES).annotations(
  $I.annotations("Classes", {
    description:
      "CSS class names used throughout the flex-layout system.\nUsing `as const` for TypeScript erasable syntax compatibility.",
  })
) {}

export declare namespace Classes {
  export type Type = typeof Classes.Type;
  export type Encoded = typeof Classes.Encoded;
}
