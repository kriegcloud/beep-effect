import { defineRule } from "@oxlint/plugins";
import * as HashSet from "effect/HashSet";
import * as MutableHashSet from "effect/MutableHashSet";
import type { ESTree } from "@oxlint/plugins";

const SCHEMA_SOURCES = HashSet.fromIterable(["effect", "effect/Schema"]);
const SCHEMA_NAMESPACE_SOURCES = HashSet.fromIterable(["effect/Schema"]);

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

    // Ensure `<SchemaNamespace>.Opaque` is actually Schema (imported from Schema module).
    const isSchemaObject = (node: ESTree.Expression | null | undefined): boolean => {
      if (node === null || node === undefined) return false;
      if (node.type === "Identifier") return MutableHashSet.has(schemaIdentifiers, node.name);
      return false;
    };

    // Validate the outer `Opaque` call, allowing either `Opaque` or `<SchemaNamespace>.Opaque`.
    const isOpaqueCallee = (node: ESTree.Expression | null | undefined): boolean => {
      if (node === null || node === undefined) return false;
      if (node.type === "Identifier") return MutableHashSet.has(opaqueIdentifiers, node.name);
      if (node.type !== "MemberExpression") return false;
      if (node.property?.type !== "Identifier" || node.property.name !== "Opaque") return false;
      return isSchemaObject(node.object);
    };

    // Match `class X extends Schema.Opaque(...)` or `class X extends Opaque(...)` when
    // the identifiers are tied to the Schema module via imports.
    const isSchemaOpaqueExtension = (node: ESTree.Class): boolean => {
      const sc = node.superClass;
      if (sc === null || sc === undefined || sc.type !== "CallExpression") return false;
      const inner = sc.callee;
      if (inner === null || inner === undefined || inner.type !== "CallExpression") return false;
      return isOpaqueCallee(inner.callee);
    };

    const checkClass = (node: ESTree.Class) => {
      if (!isSchemaOpaqueExtension(node)) return;
      for (const element of node.body.body) {
        if (element.type === "PropertyDefinition" && !element.static) {
          context.report({
            node: element,
            message: "Classes extending Schema.Opaque must not have instance members",
          });
        } else if (element.type === "MethodDefinition" && !element.static) {
          context.report({
            node: element,
            message: "Classes extending Schema.Opaque must not have instance members",
          });
        }
      }
    };

    return {
      // Record identifiers for Schema/Opaque imports so we don't match unrelated modules.
      ImportDeclaration(node) {
        if (node.importKind === "type") return;
        const source = node.source.value;
        if (!HashSet.has(SCHEMA_SOURCES, source)) return;

        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier") {
            if (HashSet.has(SCHEMA_NAMESPACE_SOURCES, source)) {
              MutableHashSet.add(schemaIdentifiers, specifier.local.name);
            }
          } else if (specifier.type === "ImportSpecifier" && specifier.importKind !== "type") {
            if (specifier.imported.type !== "Identifier") continue;
            const importedName = specifier.imported.name;
            if (importedName === "Schema") {
              MutableHashSet.add(schemaIdentifiers, specifier.local.name);
            } else if (importedName === "Opaque") {
              MutableHashSet.add(opaqueIdentifiers, specifier.local.name);
            }
          }
        }
      },
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
    };
  },
});
