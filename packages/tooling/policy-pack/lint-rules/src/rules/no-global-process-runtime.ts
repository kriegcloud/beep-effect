import { defineRule } from "@oxlint/plugins";
import * as HashSet from "effect/HashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as Option from "effect/Option";
import { getPropertyName, isIdentifier, literalStringValue, unwrapExpression } from "./utils.ts";
import type { ESTree } from "@oxlint/plugins";
import type { MaybeNode } from "./utils.ts";

const RUNTIME_PROPERTIES = HashSet.fromIterable(["platform", "arch"]);
// The sole beep file allowed to read host runtime platform/architecture directly.
// Everything else must inject the runtime reference (Effect code) or provide it
// explicitly (tests). Repoint this if the canonical host-process module moves.
const HOST_PROCESS_REFERENCE_FILE = "packages/foundation/capability/chalk/src/internal/SupportsColor.ts";
const NODE_OS_MODULES = HashSet.fromIterable(["node:os", "os"]);

const normalizePath = (path: string) => path.replaceAll("\\", "/");

const toRepoPath = (filename: string, cwd: string) => {
  const normalizedFilename = normalizePath(filename);
  const normalizedCwd = normalizePath(cwd).replace(/\/+$/u, "");
  const prefix = `${normalizedCwd}/`;
  return normalizedFilename.startsWith(prefix) ? normalizedFilename.slice(prefix.length) : normalizedFilename;
};

const isHostProcessReferenceFile = (filename: string, cwd: string) =>
  toRepoPath(filename, cwd) === HOST_PROCESS_REFERENCE_FILE;

const isGlobalProcessObject = (node: MaybeNode): boolean => {
  const expression = unwrapExpression(node);
  if (isIdentifier(expression, "process")) return true;
  if (Option.isNone(expression) || expression.value.type !== "MemberExpression") return false;

  const object = unwrapExpression(expression.value.object);
  const property = getPropertyName(expression.value.property);
  return isIdentifier(object, "globalThis") && Option.isSome(property) && property.value === "process";
};

const message = (property: string) =>
  `Use HostProcess${property === "arch" ? "Architecture" : "Platform"} instead of process.${property}; inject the runtime reference in Effect code and provide it explicitly in tests.`;

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow direct host runtime platform/architecture reads outside the shared host process references.",
    },
  },
  createOnce(context) {
    const nodeOsNamespaces = MutableHashSet.empty<string>();
    const nodeOsRuntimeImports = MutableHashMap.empty<string, string>();

    const resetBindings = () => {
      MutableHashSet.clear(nodeOsNamespaces);
      MutableHashMap.clear(nodeOsRuntimeImports);
    };

    const trackImportDeclaration = (node: ESTree.ImportDeclaration) => {
      const source = literalStringValue(node.source);
      if (Option.isNone(source) || !HashSet.has(NODE_OS_MODULES, source.value)) return;

      for (const specifier of node.specifiers) {
        const localName = specifier.local.name;

        if (specifier.type === "ImportNamespaceSpecifier" || specifier.type === "ImportDefaultSpecifier") {
          MutableHashSet.add(nodeOsNamespaces, localName);
          continue;
        }

        if (specifier.type !== "ImportSpecifier") continue;

        const imported = getPropertyName(specifier.imported);
        if (Option.isSome(imported) && HashSet.has(RUNTIME_PROPERTIES, imported.value)) {
          MutableHashMap.set(nodeOsRuntimeImports, localName, imported.value);
        }
      }
    };

    const getNodeOsRuntimeCall = (callee: MaybeNode): Option.Option<string> => {
      const expression = unwrapExpression(callee);
      if (Option.isNone(expression)) return Option.none();

      if (expression.value.type === "Identifier") {
        return MutableHashMap.get(nodeOsRuntimeImports, expression.value.name);
      }

      if (expression.value.type !== "MemberExpression") return Option.none();

      const object = unwrapExpression(expression.value.object);
      if (Option.isNone(object) || object.value.type !== "Identifier") return Option.none();
      if (!MutableHashSet.has(nodeOsNamespaces, object.value.name)) return Option.none();

      return Option.filter(getPropertyName(expression.value.property), (property) =>
        HashSet.has(RUNTIME_PROPERTIES, property)
      );
    };

    return {
      before: resetBindings,
      ImportDeclaration: trackImportDeclaration,
      MemberExpression(node) {
        if (isHostProcessReferenceFile(context.filename, context.cwd)) return;

        const property = getPropertyName(node.property);
        if (Option.isNone(property) || !HashSet.has(RUNTIME_PROPERTIES, property.value)) return;
        if (!isGlobalProcessObject(node.object)) return;

        context.report({
          node,
          message: message(property.value),
        });
      },
      CallExpression(node) {
        if (isHostProcessReferenceFile(context.filename, context.cwd)) return;

        const property = getNodeOsRuntimeCall(node.callee);
        if (Option.isNone(property)) return;

        context.report({
          node,
          message: message(property.value),
        });
      },
    };
  },
});
