const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce namespace import for React instead of named imports",
    },
    fixable: "code",
  },
  create(context) {
    let reactNamespace = "React";
    const namedImportsFromReact = new Map();

    function checkIdentifier(node) {
      const localName = node.name;
      if (!namedImportsFromReact.has(localName)) return;

      const importInfo = namedImportsFromReact.get(localName);
      const { importedName } = importInfo;

      const parent = node.parent;
      if (!parent) return;

      if (parent.type === "ImportSpecifier") return;

      if (
        parent.type === "Property" &&
        parent.key === node &&
        !parent.shorthand
      ) {
        return;
      }

      if (parent.type === "MemberExpression") {
        if (parent.property === node && parent.object !== node) {
          return;
        }
      }

      context.report({
        node,
        message: `Use '${reactNamespace}.${importedName}' instead of '${localName}'`,
        fix: (fixer) =>
          fixer.replaceTextRange(
            node.range,
            `${reactNamespace}.${importedName}`,
          ),
      });
    }

    function checkJSXIdentifier(node) {
      const localName = node.name;
      if (!namedImportsFromReact.has(localName)) return;

      const importInfo = namedImportsFromReact.get(localName);
      const { importedName } = importInfo;

      const parent = node.parent;
      if (!parent) return;

      const isOpeningElement =
        parent.type === "JSXOpeningElement" && parent.name === node;
      const isClosingElement =
        parent.type === "JSXClosingElement" && parent.name === node;
      if (!isOpeningElement && !isClosingElement) return;

      context.report({
        node,
        message: `Use '${reactNamespace}.${importedName}' instead of '${localName}'`,
        fix: (fixer) =>
          fixer.replaceTextRange(
            node.range,
            `${reactNamespace}.${importedName}`,
          ),
      });
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== "react") return;

        const namedSpecifiers = [];
        let defaultSpecifier;

        for (const spec of node.specifiers) {
          if (spec.type === "ImportSpecifier") {
            namedSpecifiers.push(spec);
          } else if (spec.type === "ImportDefaultSpecifier") {
            defaultSpecifier = spec;
          }
        }

        if (defaultSpecifier) {
          reactNamespace = defaultSpecifier.local.name;
        }

        if (namedSpecifiers.length > 0) {
          for (const spec of namedSpecifiers) {
            if (spec.imported.type === "Identifier") {
              namedImportsFromReact.set(spec.local.name, {
                importedName: spec.imported.name,
              });
            }
          }

          context.report({
            node,
            message: `Use namespace import (import ${reactNamespace} from "react") instead of named imports from "react"`,
            fix(fixer) {
              if (defaultSpecifier) {
                return fixer.replaceTextRange(
                  node.range,
                  `import ${defaultSpecifier.local.name} from "react"`,
                );
              } else {
                return fixer.replaceTextRange(
                  node.range,
                  `import ${reactNamespace} from "react"`,
                );
              }
            },
          });
        }
      },

      Identifier(node) {
        checkIdentifier(node);
      },

      JSXIdentifier(node) {
        checkJSXIdentifier(node);
      },
    };
  },
};

export default rule;
