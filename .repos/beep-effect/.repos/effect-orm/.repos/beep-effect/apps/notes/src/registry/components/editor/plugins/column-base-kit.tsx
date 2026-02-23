import { ColumnElementStatic, ColumnGroupElementStatic } from "@beep/notes/registry/ui/column-node-static";
import { BaseColumnItemPlugin, BaseColumnPlugin } from "@platejs/layout";

export const BaseColumnKit = [
  BaseColumnPlugin.withComponent(ColumnGroupElementStatic),
  BaseColumnItemPlugin.withComponent(ColumnElementStatic),
];
