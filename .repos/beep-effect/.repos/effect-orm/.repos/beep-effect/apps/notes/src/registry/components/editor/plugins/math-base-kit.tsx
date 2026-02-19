import { EquationElementStatic, InlineEquationElementStatic } from "@beep/notes/registry/ui/equation-node-static";
import { BaseEquationPlugin, BaseInlineEquationPlugin } from "@platejs/math";

export const BaseMathKit = [
  BaseInlineEquationPlugin.withComponent(InlineEquationElementStatic),
  BaseEquationPlugin.withComponent(EquationElementStatic),
];
