import { defineRule } from "@oxlint/plugins";
import * as HashSet from "effect/HashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as Option from "effect/Option";
import {
  getPropertyName,
  identifierName,
  isIdentifier,
  literalStringValue,
  unwrapExpression,
  unwrapMemberExpression,
} from "./utils.ts";
import type { ESTree } from "@oxlint/plugins";
import type { MaybeNode, MemberAccess } from "./utils.ts";

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

/** `globalThis.process` — the namespaced spelling of the global process object. */
const isGlobalThisProcess = (node: MaybeNode): boolean =>
  Option.exists(
    unwrapMemberExpression(node),
    (access) =>
      isIdentifier(access.object, "globalThis") && Option.exists(getPropertyName(access.property), (p) => p === "process")
  );

const isGlobalProcessObject = (node: MaybeNode): boolean =>
  isIdentifier(unwrapExpression(node), "process") || isGlobalThisProcess(node);

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

    // Record a destructured `{ platform } from "node:os"` runtime import under its local name.
    const recordRuntimeSpecifier = (specifier: ESTree.ImportSpecifier) => {
      const imported = Option.filter(getPropertyName(specifier.imported), (name) =>
        HashSet.has(RUNTIME_PROPERTIES, name)
      );
      if (Option.isSome(imported)) {
        MutableHashMap.set(nodeOsRuntimeImports, specifier.local.name, imported.value);
      }
    };

    const recordSpecifier = (specifier: ESTree.ImportDeclaration["specifiers"][number]) => {
      if (specifier.type === "ImportSpecifier") return recordRuntimeSpecifier(specifier);
      // Namespace / default imports expose the whole `node:os` module under one local name.
      MutableHashSet.add(nodeOsNamespaces, specifier.local.name);
    };

    const trackImportDeclaration = (node: ESTree.ImportDeclaration) => {
      const source = literalStringValue(node.source);
      if (Option.isNone(source) || !HashSet.has(NODE_OS_MODULES, source.value)) return;

      for (const specifier of node.specifiers) recordSpecifier(specifier);
    };

    // `os.platform()` / `nodeOs.arch()` — a runtime call through a tracked `node:os` namespace.
    const namespacedRuntimeCall = (access: MemberAccess): Option.Option<string> =>
      Option.filter(
        access.object,
        (object) => object.type === "Identifier" && MutableHashSet.has(nodeOsNamespaces, object.name)
      ).pipe(
        Option.flatMap(() => getPropertyName(access.property)),
        Option.filter((property) => HashSet.has(RUNTIME_PROPERTIES, property))
      );

    // `platform()` / `arch()` — a runtime call through a destructured `node:os` import.
    const importedRuntimeCall = (callee: MaybeNode): Option.Option<string> =>
      Option.flatMap(unwrapExpression(callee), identifierName).pipe(
        Option.flatMap((name) => MutableHashMap.get(nodeOsRuntimeImports, name))
      );

    const getNodeOsRuntimeCall = (callee: MaybeNode): Option.Option<string> =>
      Option.orElse(importedRuntimeCall(callee), () =>
        Option.flatMap(unwrapMemberExpression(callee), namespacedRuntimeCall)
      );

    // `process.platform` / `globalThis.process.arch` — a flagged global-process property read.
    const globalProcessProperty = (node: ESTree.MemberExpression): Option.Option<string> =>
      getPropertyName(node.property).pipe(
        Option.filter((property) => HashSet.has(RUNTIME_PROPERTIES, property)),
        Option.filter(() => isGlobalProcessObject(node.object))
      );

    return {
      before: resetBindings,
      ImportDeclaration: trackImportDeclaration,
      MemberExpression(node) {
        if (isHostProcessReferenceFile(context.filename, context.cwd)) return;

        const property = globalProcessProperty(node);
        if (Option.isNone(property)) return;

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
