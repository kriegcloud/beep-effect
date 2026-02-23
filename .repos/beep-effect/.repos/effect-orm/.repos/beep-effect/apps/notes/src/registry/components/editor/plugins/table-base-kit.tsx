import {
  TableCellElementStatic,
  TableCellHeaderElementStatic,
  TableElementStatic,
  TableRowElementStatic,
} from "@beep/notes/registry/ui/table-node-static";
import { BaseTableCellHeaderPlugin, BaseTableCellPlugin, BaseTablePlugin, BaseTableRowPlugin } from "@platejs/table";

export const BaseTableKit = [
  BaseTablePlugin.withComponent(TableElementStatic),
  BaseTableRowPlugin.withComponent(TableRowElementStatic),
  BaseTableCellPlugin.withComponent(TableCellElementStatic),
  BaseTableCellHeaderPlugin.withComponent(TableCellHeaderElementStatic),
];
