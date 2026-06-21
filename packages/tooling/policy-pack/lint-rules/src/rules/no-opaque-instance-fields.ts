import { defineRule } from "@oxlint/plugins";
import * as HashSet from "effect/HashSet";
import * as MutableHashSet from "effect/MutableHashSet";
import * as Option from "effect/Option";
import { getPropertyName, unwrapExpression, unwrapMemberExpression } from "./utils.ts";
import type { ESTree } from "@oxlint/plugins";
import type { AstNode, MaybeNode } from "./utils.ts";

const SCHEMA_SOURCES = HashSet.fromIterable(["effect", "effect/Schema"]);
const SCHEMA_NAMESPACE_SOURCES = HashSet.fromIterable(["effect/Schema"]);
const INSTANCE_MEMBER_TYPES = HashSet.fromIterable(["PropertyDefinition", "MethodDefinition"]);
const INSTANCE_MEMBER_MESSAGE = "Classes extending Schema.Opaque must not have instance members";

export default defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow instance members in Schema.Opaque classes" },
  },
  create(context) {
    // Track identifiers that point to Schema or Opaque imported from Schema.
    // Local names that refer to the Schema module (Schema or namespace import).
    // Example: `import { Schema } from "effect"` or `import * as S from "effect/Schema"`.
    const schemaIdentifiers = MutableHashSet.empty<string>();
    // Local names that refer to Opaque imported directly from the Schema module.
    // Example: `import { Opaque as MyOpaque } from "effect/Schema"`.
    const opaqueIdentifiers = MutableHashSet.empty<string>();

    const isTrackedIdentifier = (node: Option.Option<AstNode>, tracked: MutableHashSet.MutableHashSet<string>): boolean =>
      Option.exists(node, (expression) => expression.type === "Identifier" && MutableHashSet.has(tracked, expression.name));

    // Validate the outer `Opaque` call, allowing either `Opaque` or `<SchemaNamespace>.Opaque`
    // where `<SchemaNamespace>` is an identifier tied to the Schema module via imports.
    const isOpaqueCallee = (node: MaybeNode): boolean => {
      const expression = unwrapExpression(node);
      if (isTrackedIdentifier(expression, opaqueIdentifiers)) return true;
      return Option.exists(
        unwrapMemberExpression(node),
        (access) =>
          Option.exists(getPropertyName(access.property), (name) => name === "Opaque") &&
          isTrackedIdentifier(access.object, schemaIdentifiers)
      );
    };

    // Match `class X extends Schema.Opaque(...)()` or `class X extends Opaque(...)()` when
    // the identifiers are tied to the Schema module via imports.
    const isSchemaOpaqueExtension = (node: ESTree.Class): boolean =>
      Option.exists(
        unwrapExpression(node.superClass),
        (sc) => sc.type === "CallExpression" && Option.exists(unwrapExpression(sc.callee), isOpaqueCall)
      );

    const isOpaqueCall = (callee: AstNode): boolean => callee.type === "CallExpression" && isOpaqueCallee(callee.callee);

    const isInstanceMember = (element: ESTree.ClassBody["body"][number]): boolean =>
      HashSet.has(INSTANCE_MEMBER_TYPES, element.type) && "static" in element && !element.static;

    const checkClass = (node: ESTree.Class) => {
      if (!isSchemaOpaqueExtension(node)) return;
      for (const element of node.body.body) {
        if (isInstanceMember(element)) {
          context.report({ node: element, message: INSTANCE_MEMBER_MESSAGE });
        }
      }
    };

    // Record a destructured `{ Schema }` / `{ Opaque }` import under its local name.
    const recordImportSpecifier = (specifier: ESTree.ImportSpecifier) => {
      const imported = getPropertyName(specifier.imported);
      if (Option.exists(imported, (name) => name === "Schema")) {
        MutableHashSet.add(schemaIdentifiers, specifier.local.name);
      } else if (Option.exists(imported, (name) => name === "Opaque")) {
        MutableHashSet.add(opaqueIdentifiers, specifier.local.name);
      }
    };

    // A `* as S` namespace import only aliases the Schema module when it came from `effect/Schema`.
    const recordNamespaceSpecifier = (source: string, specifier: ESTree.ImportNamespaceSpecifier) => {
      if (HashSet.has(SCHEMA_NAMESPACE_SOURCES, source)) MutableHashSet.add(schemaIdentifiers, specifier.local.name);
    };

    const isValueImportSpecifier = (
      specifier: ESTree.ImportDeclaration["specifiers"][number]
    ): specifier is ESTree.ImportSpecifier => specifier.type === "ImportSpecifier" && specifier.importKind !== "type";

    const recordSpecifier = (source: string, specifier: ESTree.ImportDeclaration["specifiers"][number]) => {
      if (specifier.type === "ImportNamespaceSpecifier") return recordNamespaceSpecifier(source, specifier);
      if (isValueImportSpecifier(specifier)) recordImportSpecifier(specifier);
    };

    return {
      // Record identifiers for Schema/Opaque imports so we don't match unrelated modules.
      ImportDeclaration(node) {
        if (node.importKind === "type") return;
        const source = node.source.value;
        if (!HashSet.has(SCHEMA_SOURCES, source)) return;
        for (const specifier of node.specifiers) recordSpecifier(source, specifier);
      },
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
    };
  },
});
