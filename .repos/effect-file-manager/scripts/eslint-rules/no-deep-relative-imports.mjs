import path from "node:path";

const ALIASED_PACKAGES_PREFIX = ["packages/client", "packages/server"];

export default {
  meta: {
    docs: {
      description:
        "prevent relative imports going up more than one level (../../) in client and server packages",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create: (context) => {
    function isExternal(name) {
      return isScoped(name) || isExternalModule(name);
    }

    const scopedRegExp = /^@[^/]+\/[^/]+/;
    function isScoped(name) {
      return scopedRegExp.test(name);
    }

    const externalModuleRegExp = /^\w/;
    function isExternalModule(name) {
      return externalModuleRegExp.test(name);
    }

    function getRelativePathDepth(importPath) {
      if (!importPath.startsWith(".")) {
        return 0;
      }
      const parts = importPath.split("/");
      let depth = 0;
      for (const part of parts) {
        if (part === "..") {
          depth++;
        } else if (part !== ".") {
          break;
        }
      }
      return depth;
    }

    function isInAliasedPackage(filename) {
      const relativeFilePath = path.relative(context.getCwd(), filename);
      return ALIASED_PACKAGES_PREFIX.some((prefix) =>
        relativeFilePath.startsWith(prefix + path.sep),
      );
    }

    function getPackageSrcRoot(filename) {
      const relativeFilePath = path.relative(context.getCwd(), filename);
      for (const prefix of ALIASED_PACKAGES_PREFIX) {
        if (relativeFilePath.startsWith(prefix + path.sep)) {
          return path.join(context.getCwd(), prefix, "src");
        }
      }
      return null;
    }

    const assertNoDeepRelativeImport = (node, importPath) => {
      if (typeof importPath !== "string" || isExternal(importPath)) {
        return;
      }

      const fileName = context.getFilename();

      if (!isInAliasedPackage(fileName)) {
        return;
      }

      const relativeDepth = getRelativePathDepth(importPath);

      if (relativeDepth > 1) {
        context.report({
          node,
          message: `Relative import "${importPath}" goes up more than one level. Use "@/..." alias instead.`,
          fix(fixer) {
            try {
              const fileDir = path.dirname(fileName);
              const srcRoot = getPackageSrcRoot(fileName);
              if (!srcRoot) return null;

              const absoluteImportPath = path.resolve(fileDir, importPath);
              const originalExt = path.extname(importPath);

              let relativeToSrc = path.relative(srcRoot, absoluteImportPath);

              if (relativeToSrc.startsWith("..") || path.isAbsolute(relativeToSrc)) {
                return null;
              }

              if (!originalExt) {
                relativeToSrc = relativeToSrc.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, "");
              }

              relativeToSrc = relativeToSrc.replace(/\\/g, "/");

              const aliasedPath = `@/${relativeToSrc}`;
              const targetNode = node.type === "CallExpression" ? node.arguments[0] : node.source;
              return fixer.replaceText(targetNode, `'${aliasedPath}'`);
            } catch (_e) {
              return null;
            }
          },
        });
      }
    };

    return {
      ImportDeclaration: (node) => {
        if (node.importKind === "type") {
          return;
        }
        assertNoDeepRelativeImport(node, node.source.value);
      },

      CallExpression: (node) => {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length > 0 &&
          node.arguments[0].type === "Literal"
        ) {
          assertNoDeepRelativeImport(node, node.arguments[0].value);
        } else if (
          node.callee.type === "Import" &&
          node.arguments.length > 0 &&
          node.arguments[0].type === "Literal"
        ) {
          assertNoDeepRelativeImport(node, node.arguments[0].value);
        }
      },
    };
  },
};
