import * as fs from "node:fs";
import * as path from "node:path";

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

function findNearestPackageJson(startDir) {
  let currentDir = startDir;
  while (currentDir !== path.dirname(currentDir)) {
    const pkgPath = path.join(currentDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const content = fs.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      return { path: currentDir, name: pkg.name || "" };
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prevent relative imports above the nearest package.json and enforce correct @app import format",
    },
    fixable: "code",
  },
  create(context) {
    const packageCache = new Map();

    function getPackageInfo(fileDir) {
      if (packageCache.has(fileDir)) {
        return packageCache.get(fileDir);
      }
      const info = findNearestPackageJson(fileDir);
      packageCache.set(fileDir, info);
      return info;
    }

    function assertNoRelativeImportOutsidePackage(importPath) {
      if (isExternal(importPath)) return null;

      const importBase = path.dirname(importPath);
      if (importBase === ".") return null;
      if (!importBase.startsWith(".")) return null;

      const fileName = context.filename;
      const fileDir = path.dirname(fileName);
      const importDir = path.resolve(fileDir, importBase);

      const packageInfo = getPackageInfo(fileDir);
      if (!packageInfo) return null;

      if (!importDir.includes(packageInfo.path)) {
        return packageInfo.name;
      }

      return null;
    }

    function createFix(importPath, sourceNode, fixer) {
      const parts = importPath.split("/");
      let packageName = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === "..") continue;
        packageName = part || "";
        break;
      }

      if (packageName) {
        let absolutePath = importPath.replace(
          /(?:\.\.\/)+.*?\//,
          `@app/${packageName}/`,
        );
        absolutePath = absolutePath.replace(/\/src\//, "/");
        absolutePath = absolutePath.replace(/\.(js|jsx|ts|tsx)$/, "");
        return fixer.replaceTextRange(sourceNode.range, `"${absolutePath}"`);
      }
      return null;
    }

    return {
      ImportDeclaration(node) {
        if (node.importKind === "type") return;

        const importPath = node.source.value;

        if (importPath.startsWith("@app/") && importPath.includes("/src")) {
          context.report({
            node,
            message: `Import "${importPath}" should not include "/src" in the path. Remove "/src" from the import.`,
            fix(fixer) {
              const fixedPath = importPath
                .replace(/\/src\//, "/")
                .replace(/\/src$/, "");
              return fixer.replaceTextRange(
                node.source.range,
                `"${fixedPath}"`,
              );
            },
          });
          return;
        }

        const failPackage =
          assertNoRelativeImportOutsidePackage(importPath);
        if (failPackage) {
          context.report({
            node,
            message: `Import of "${importPath}" reaches outside of the package "${failPackage}". Use absolute imports with the @app namespace instead.`,
            fix(fixer) {
              return createFix(importPath, node.source, fixer);
            },
          });
        }
      },

      CallExpression(node) {
        const firstArg = node.arguments[0];
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "require" ||
          node.arguments.length === 0 ||
          !firstArg ||
          firstArg.type !== "Literal"
        ) {
          return;
        }

        if (typeof firstArg.value !== "string") return;

        if (
          firstArg.value.startsWith("@app/") &&
          firstArg.value.includes("/src")
        ) {
          context.report({
            node,
            message: `Require "${firstArg.value}" should not include "/src" in the path. Remove "/src" from the require.`,
            fix(fixer) {
              const fixedPath = firstArg.value
                .replace(/\/src\//, "/")
                .replace(/\/src$/, "");
              return fixer.replaceTextRange(firstArg.range, `"${fixedPath}"`);
            },
          });
          return;
        }

        const failPackage = assertNoRelativeImportOutsidePackage(
          firstArg.value,
        );
        if (failPackage) {
          context.report({
            node,
            message: `Require of "${firstArg.value}" reaches outside of the package "${failPackage}". Use absolute imports with the @app namespace instead.`,
            fix(fixer) {
              return createFix(firstArg.value, firstArg, fixer);
            },
          });
        }
      },
    };
  },
};

export default rule;
