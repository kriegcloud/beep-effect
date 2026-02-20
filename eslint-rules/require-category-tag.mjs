/**
 * Custom ESLint rule requiring `@category` on exported symbols.
 *
 * This complements eslint-plugin-jsdoc presence checks by ensuring
 * classification metadata is present for indexable exports.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

const CATEGORY_RE = /@category\s+\S+/;

/**
 * @param {unknown} node
 * @returns {boolean}
 */
const isExportedNode = (node) => {
  if (node === null || typeof node !== "object") {
    return false;
  }

  const parent = node.parent;
  if (parent === null || typeof parent !== "object") {
    return false;
  }

  if (parent.type === "ExportNamedDeclaration" || parent.type === "ExportDefaultDeclaration") {
    return true;
  }

  const grandParent = parent.parent;
  return grandParent !== null && typeof grandParent === "object" && grandParent.type === "ExportNamedDeclaration";
};

/**
 * @param {unknown} node
 * @returns {string}
 */
const getNodeName = (node) => {
  if (node === null || typeof node !== "object") {
    return "exported symbol";
  }

  if ("id" in node && node.id !== null && typeof node.id === "object" && "name" in node.id) {
    return String(node.id.name ?? "exported symbol");
  }

  if ("declarations" in node && Array.isArray(node.declarations) && node.declarations.length > 0) {
    const first = node.declarations[0];
    if (first !== null && typeof first === "object" && "id" in first) {
      const id = first.id;
      if (id !== null && typeof id === "object" && "name" in id) {
        return String(id.name ?? "exported symbol");
      }
    }
  }

  return "exported symbol";
};

/**
 * @type {import("eslint").Rule.RuleModule}
 */
const requireCategoryTagRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require @category tag on exported symbols",
      recommended: false,
    },
    schema: [],
    messages: {
      missingCategory: "Exported symbol '{{name}}' must include a @category tag in its JSDoc block.",
    },
  },
  create(context) {
    /**
     * @param {unknown} node
     * @returns {void}
     */
    const check = (node) => {
      if (!isExportedNode(node)) {
        return;
      }

      const jsDoc = context.sourceCode.getJSDocComment(node);
      if (jsDoc === null || jsDoc === undefined || !CATEGORY_RE.test(jsDoc.value)) {
        context.report({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          node,
          messageId: "missingCategory",
          data: { name: getNodeName(node) },
        });
      }
    };

    return {
      FunctionDeclaration: check,
      ClassDeclaration: check,
      VariableDeclaration: check,
      TSTypeAliasDeclaration: check,
      TSInterfaceDeclaration: check,
    };
  },
};

export default requireCategoryTagRule;
