import { Str } from "@beep/utils";
import { defineRule } from "@oxlint/plugins";
import * as HashMap from "effect/HashMap";
import * as Option from "effect/Option";
import { identifierName, literalStringValue } from "./utils.ts";
import type { ESTree } from "@oxlint/plugins";

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

/** The `node:`-prefixed string source of an import, or `None` for any other module. */
const nodeBuiltinSource = (node: ESTree.ImportDeclaration): Option.Option<string> =>
  Option.filter(literalStringValue(node.source), (value) => value.startsWith("node:"));

/** The sole specifier when the import is exactly one `* as <name>` namespace specifier. */
const soleNamespaceImport = (node: ESTree.ImportDeclaration): Option.Option<ESTree.ImportNamespaceSpecifier> => {
  if (node.specifiers.length !== 1) return Option.none();
  const [specifier] = node.specifiers;
  return specifier?.type === "ImportNamespaceSpecifier" ? Option.some(specifier) : Option.none();
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
        const source = nodeBuiltinSource(node);
        if (Option.isNone(source)) return;

        const expectedAlias = expectedNamespaceAlias(source.value);
        const actualAlias = Option.flatMap(soleNamespaceImport(node), (specifier) => identifierName(specifier.local));
        if (Option.exists(actualAlias, (alias) => alias === expectedAlias)) return;

        context.report({
          node,
          message: `Import ${source.value} as a namespace named ${expectedAlias}.`,
        });
      },
    };
  },
});
