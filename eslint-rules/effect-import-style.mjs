const ALIAS_MAP = {
  "effect/Array": "A",
  "effect/Option": "O",
  "effect/Predicate": "P",
  "effect/Record": "R",
  "effect/Schema": "S",
};

const isStableEffectSubmodule = (moduleName) =>
  moduleName.startsWith("effect/") && !moduleName.startsWith("effect/unstable/");

/**
 * @type {import("eslint").Rule.RuleModule}
 */
const effectImportStyleRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce compact Effect import style (A/O/P/R/S aliases and root imports for other stable modules)",
      recommended: false,
    },
    schema: [],
    messages: {
      aliasNamespaceRequired:
        'Use namespace import with alias {{alias}} for {{moduleName}} (for example: import * as {{alias}} from "{{moduleName}}";).',
      aliasMismatch: "Use alias {{expected}} for {{moduleName}} instead of {{actual}}.",
      preferRootImport:
        'Prefer root imports from "effect" for stable modules. Replace {{moduleName}} with named import from "effect".',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.type !== "Literal" || typeof node.source.value !== "string") {
          return;
        }

        const moduleName = node.source.value;
        if (!isStableEffectSubmodule(moduleName)) {
          return;
        }

        const expectedAlias = ALIAS_MAP[moduleName];

        if (expectedAlias !== undefined) {
          const namespaceSpecifiers = node.specifiers.filter((specifier) => specifier.type === "ImportNamespaceSpecifier");
          const hasOnlyNamespace = namespaceSpecifiers.length === 1 && node.specifiers.length === 1;

          if (!hasOnlyNamespace) {
            context.report({
              node,
              messageId: "aliasNamespaceRequired",
              data: { alias: expectedAlias, moduleName },
            });
            return;
          }

          const namespace = namespaceSpecifiers[0];
          const actualAlias = namespace.local.name;
          if (actualAlias !== expectedAlias) {
            context.report({
              node: namespace.local,
              messageId: "aliasMismatch",
              data: {
                expected: expectedAlias,
                actual: actualAlias,
                moduleName,
              },
            });
          }

          return;
        }

        context.report({
          node,
          messageId: "preferRootImport",
          data: { moduleName },
        });
      },
    };
  },
};

export default effectImportStyleRule;
