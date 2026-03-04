/**
 * Custom ESLint rule requiring `@category` on exported symbols.
 *
 * This complements eslint-plugin-JSDoc presence checks by ensuring
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
 * @param {import("eslint").SourceCode} sourceCode
 * @param {unknown} node
 * @returns {ReadonlyArray<import("estree").Comment>}
 */
const getCandidateComments = (sourceCode, node) => {
  /** @type {Array<import("estree").Comment>} */
  const out = [];
  const getJSDocComment =
    typeof sourceCode.getJSDocComment === "function" ? sourceCode.getJSDocComment.bind(sourceCode) : null;

  if (node === null || typeof node !== "object") {
    return out;
  }

  /**
   * @param {unknown} current
   */
  const addFromNode = (current) => {
    if (current === null || typeof current !== "object") {
      return;
    }

    const astNode = /** @type {import("estree").Node} */ (
      current
    );

    const jsDoc = getJSDocComment?.(astNode);
    if (jsDoc !== null && jsDoc !== undefined) {
      out.push(jsDoc);
    }

    for (const comment of sourceCode.getCommentsBefore(astNode)) {
      if (comment.type === "Block" && comment.value.startsWith("*")) {
        out.push(comment);
      }
    }
  };

  addFromNode(node);
  addFromNode(node.parent);
  addFromNode(node.parent?.parent);

  return out;
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

      const comments = getCandidateComments(context.sourceCode, node);
      const hasCategory = comments.some((comment) => CATEGORY_RE.test(comment.value));
      if (!hasCategory) {
        context.report({
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
