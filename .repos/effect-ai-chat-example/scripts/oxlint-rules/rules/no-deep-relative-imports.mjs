import * as path from "node:path";

const ALIASED_PACKAGES_PREFIX = ["packages/client", "packages/server"];

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
  if (!importPath.startsWith(".")) return 0;
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

function isInAliasedPackage(filename, cwd) {
  const relativeFilePath = path.relative(cwd, filename);
  return ALIASED_PACKAGES_PREFIX.some((prefix) =>
    relativeFilePath.startsWith(prefix + path.sep),
  );
}

function getPackageSrcRoot(filename, cwd) {
  const relativeFilePath = path.relative(cwd, filename);
  for (const prefix of ALIASED_PACKAGES_PREFIX) {
    if (relativeFilePath.startsWith(prefix + path.sep)) {
      return path.join(cwd, prefix, "src");
    }
  }
  return null;
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prevent relative imports going up more than one level (../../) in client and server packages",
    },
    fixable: "code",
  },
  create(context) {
    const cwd = process.cwd();

    function assertNoDeepRelativeImport(node, importPath, sourceNode) {
      if (typeof importPath !== "string" || isExternal(importPath)) return;

      const fileName = context.filename;
      if (!isInAliasedPackage(fileName, cwd)) return;

      const relativeDepth = getRelativePathDepth(importPath);
      if (relativeDepth <= 1) return;

      context.report({
        node,
        message: `Relative import "${importPath}" goes up more than one level. Use "@/..." alias instead.`,
        fix(fixer) {
          const fileDir = path.dirname(fileName);
          const srcRoot = getPackageSrcRoot(fileName, cwd);
          if (!srcRoot) return null;

          const absoluteImportPath = path.resolve(fileDir, importPath);
          const originalExt = path.extname(importPath);

          let relativeToSrc = path.relative(srcRoot, absoluteImportPath);

          if (
            relativeToSrc.startsWith("..") ||
            path.isAbsolute(relativeToSrc)
          ) {
            return null;
          }

          if (!originalExt) {
            relativeToSrc = relativeToSrc.replace(
              /\.(js|jsx|ts|tsx|mjs|cjs)$/,
              "",
            );
          }

          relativeToSrc = relativeToSrc.replace(/\\/g, "/");

          const aliasedPath = `@/${relativeToSrc}`;
          return fixer.replaceTextRange(sourceNode.range, `"${aliasedPath}"`);
        },
      });
    }

    return {
      ImportDeclaration(node) {
        if (node.importKind === "type") return;
        assertNoDeepRelativeImport(node, node.source.value, node.source);
      },

      CallExpression(node) {
        const firstArg = node.arguments[0];
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length > 0 &&
          firstArg &&
          firstArg.type === "Literal" &&
          typeof firstArg.value === "string"
        ) {
          assertNoDeepRelativeImport(node, firstArg.value, firstArg);
        } else if (
          node.callee.type === "ImportExpression" &&
          node.arguments.length > 0 &&
          firstArg &&
          firstArg.type === "Literal" &&
          typeof firstArg.value === "string"
        ) {
          assertNoDeepRelativeImport(node, firstArg.value, firstArg);
        }
      },
    };
  },
};

export default rule;
