import {
  CodeBlockElementStatic,
  CodeLineElementStatic,
  CodeSyntaxLeafStatic,
} from "@beep/ui/components/code-block-node-static";
import { BaseCodeBlockPlugin, BaseCodeLinePlugin, BaseCodeSyntaxPlugin } from "@platejs/code-block";
import { all, createLowlight } from "lowlight";

const lowlight = createLowlight(all);

export const BaseCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    node: { component: CodeBlockElementStatic },
    options: { lowlight },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStatic),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeafStatic),
];
