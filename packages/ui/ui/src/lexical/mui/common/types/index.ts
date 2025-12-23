import type { LexicalEditor } from "lexical";

export interface IToolbarComponentProps {
  activeEditor: LexicalEditor;
  disabled?: undefined | boolean;
}
