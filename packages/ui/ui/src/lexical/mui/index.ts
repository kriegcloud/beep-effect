import { editorStyles } from "./editor/editorStyles";
import { imageNodeStyles, inlineImageNodeStyles, videoNodeStyles } from "./editor/nodes";
import {
  codeActionMenuPluginStyles,
  floatLinkEditorPluginStyles,
  floatTextFormatToolbarPluginStyles,
  tableCellResizerPluginStyles,
} from "./editor/plugins";
import { playgroundEditorThemeStyles } from "./editor/themes";
import { componentsStyles } from "./editor/ui";

export * from "./display";
export * from "./editor";
export const muiLexicalStyles = [
  ...componentsStyles,
  editorStyles,
  imageNodeStyles,
  inlineImageNodeStyles,
  codeActionMenuPluginStyles,
  floatLinkEditorPluginStyles,
  floatTextFormatToolbarPluginStyles,
  tableCellResizerPluginStyles,
  playgroundEditorThemeStyles,
  videoNodeStyles,
];
