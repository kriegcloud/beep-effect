/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce namespace import for React instead of named imports.",
      category: "Best Practices",
      recommended: true,
      url: null,
    },
    fixable: "code",
    schema: [],
    messages: {
      useNamespaceImport:
        'Use namespace import (import React from "react") instead of named imports from "react".',
      useNamespaceUsage: "Use '{{reactNamespace}}.{{importedName}}' instead of '{{localName}}'.",
    },
  },

  create(context) {
    let reactNamespace = "React";
    const namedImportsFromReact = new Map();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== "react") {
          return;
        }

        const namedSpecifiers = node.specifiers.filter((spec) => spec.type === "ImportSpecifier");
        const defaultSpecifier = node.specifiers.find(
          (spec) => spec.type === "ImportDefaultSpecifier",
        );

        if (defaultSpecifier) {
          reactNamespace = defaultSpecifier.local.name;
        }

        if (namedSpecifiers.length > 0) {
          namedSpecifiers.forEach((spec) => {
            if (!namedImportsFromReact.has(spec.local.name)) {
              namedImportsFromReact.set(spec.local.name, {
                node: spec,
                importedName: spec.imported.name,
              });
            }
          });

          context.report({
            node,
            messageId: "useNamespaceImport",
            fix(fixer) {
              const targetImport = `import ${reactNamespace} from 'react';`;

              if (defaultSpecifier) {
                const fixedImport = `import ${defaultSpecifier.local.name} from 'react';`;
                return fixer.replaceText(node, fixedImport);
              } else {
                return fixer.replaceText(node, targetImport);
              }
            },
          });
        }
      },

      Identifier(identifierNode) {
        const localName = identifierNode.name;

        if (!namedImportsFromReact.has(localName)) {
          return;
        }

        const importInfo = namedImportsFromReact.get(localName);
        const { importedName } = importInfo;

        const parent = identifierNode.parent;

        if (parent.type === "ImportSpecifier" && parent.local === identifierNode) {
          return;
        }

        if (parent.type === "Property" && parent.key === identifierNode && !parent.shorthand) {
          return;
        }

        if (
          parent.type === "MemberExpression" &&
          parent.property === identifierNode &&
          !parent.computed
        ) {
          if (parent.object !== identifierNode) {
            return;
          }
        }

        context.report({
          node: identifierNode,
          messageId: "useNamespaceUsage",
          data: {
            reactNamespace,
            importedName,
            localName,
          },
          fix(fixer) {
            return fixer.replaceText(identifierNode, `${reactNamespace}.${importedName}`);
          },
        });
      },

      JSXIdentifier(jsxIdentifierNode) {
        const localName = jsxIdentifierNode.name;

        if (!namedImportsFromReact.has(localName)) {
          return;
        }

        const parent = jsxIdentifierNode.parent;
        if (
          !(parent.type === "JSXOpeningElement" && parent.name === jsxIdentifierNode) &&
          !(parent.type === "JSXClosingElement" && parent.name === jsxIdentifierNode)
        ) {
          return;
        }

        const importInfo = namedImportsFromReact.get(localName);
        const { importedName } = importInfo;

        context.report({
          node: jsxIdentifierNode,
          messageId: "useNamespaceUsage",
          data: {
            reactNamespace,
            importedName,
            localName,
          },
          fix(fixer) {
            return fixer.replaceText(jsxIdentifierNode, `${reactNamespace}.${importedName}`);
          },
        });
      },

      "Program:exit"(_node) {
        reactNamespace = "React";
        namedImportsFromReact.clear();
      },
    };
  },
};
