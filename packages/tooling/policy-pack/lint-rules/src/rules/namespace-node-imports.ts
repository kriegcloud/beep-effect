import { Str } from "@beep/utils";
import { defineRule } from "@oxlint/plugins";
import * as HashMap from "effect/HashMap";
import * as Option from "effect/Option";
import { identifierName, literalStringValue } from "./utils.ts";

const NODE_MODULE_ALIASES = HashMap.fromIterable([
  ["assert/strict", "Assert"],
  ["fs/promises", "FSP"],
]);

const NODE_SEGMENT_ALIASES = HashMap.fromIterable([
  ["fs", "FS"],
  ["os", "OS"],
  ["url", "URL"],
  ["vm", "VM"],
]);

const segmentAlias = (segment: string): string =>
  Option.getOrElse(HashMap.get(NODE_SEGMENT_ALIASES, segment), () => Str.pascalCase(segment));

const expectedNamespaceAlias = (source: string): string => {
  const moduleName = source.slice("node:".length);

  return Option.match(HashMap.get(NODE_MODULE_ALIASES, moduleName), {
    onSome: (knownAlias) => `Node${knownAlias}`,
    onNone: () => `Node${moduleName.split("/").map(segmentAlias).join("")}`,
  });
};

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require canonical namespace imports for Node.js built-in modules.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = literalStringValue(node.source);
        if (Option.isNone(source) || !source.value.startsWith("node:")) return;

        const expectedAlias = expectedNamespaceAlias(source.value);
        const [onlySpecifier] = node.specifiers;
        const namespaceImport =
          node.specifiers.length === 1 && onlySpecifier?.type === "ImportNamespaceSpecifier"
            ? onlySpecifier
            : undefined;
        const actualAlias = namespaceImport === undefined ? Option.none() : identifierName(namespaceImport.local);

        if (Option.isSome(actualAlias) && actualAlias.value === expectedAlias) return;

        context.report({
          node,
          message: `Import ${source.value} as a namespace named ${expectedAlias}.`,
        });
      },
    };
  },
});
