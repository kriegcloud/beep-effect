import type { CODE_LANGUAGE_FRIENDLY_NAME_MAP } from "@lexical/code";
import type { ReactElement } from "react";

import type { blockTypeToBlockName } from "../context";

export type TToolbarHistoryControl = "undo" | "redo";
export type TToolbarTextFormatControl =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "link"
  | "leftAlign"
  | "centerAlign"
  | "rightAlign";
export type TToolbarViewFormatControl = "horizontal" | "image" | "video" | "table";
export type TToolbarClearControl = "formatting" | "editor";
export type TToolbarBlockFormatControl = keyof typeof blockTypeToBlockName;
export type TToolbarCodeLanguagesControl = keyof typeof CODE_LANGUAGE_FRIENDLY_NAME_MAP;
export type TToolbarControl =
  | TToolbarHistoryControl
  | TToolbarTextFormatControl
  | TToolbarViewFormatControl
  | TToolbarClearControl
  | "blockFormat"
  | "codeLanguages";

export interface IToolbarControls {
  readonly history?: undefined | Array<TToolbarHistoryControl>;
  readonly textFormat?: undefined | Array<TToolbarTextFormatControl>;
  readonly blockFormat?: undefined | Array<TToolbarBlockFormatControl>;
  readonly viewFormat?: undefined | Array<TToolbarViewFormatControl>;
  readonly codeLanguages?: undefined | Array<TToolbarCodeLanguagesControl>;
  readonly clear?: undefined | Array<TToolbarClearControl>;
}

export type IControlsMap = Record<TToolbarControl, ReactElement>;
