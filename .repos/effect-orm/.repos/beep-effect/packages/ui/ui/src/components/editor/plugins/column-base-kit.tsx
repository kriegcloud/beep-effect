import { ColumnElementStatic, ColumnGroupElementStatic } from "@beep/ui/components/column-node-static";
import { BaseColumnItemPlugin, BaseColumnPlugin } from "@platejs/layout";

export const BaseColumnKit = [
  BaseColumnPlugin.withComponent(ColumnGroupElementStatic),
  BaseColumnItemPlugin.withComponent(ColumnElementStatic),
];
