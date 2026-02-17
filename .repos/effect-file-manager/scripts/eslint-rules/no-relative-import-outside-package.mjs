import path from "node:path";
import { readPackageUpSync } from "read-package-up";

export default {
  meta: {
    docs: {
      description:
        "prevent relative imports above the nearest package.json and enforce correct @example import format",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create: (context) => {
    const packagePaths = {};

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

    const assertNoRelativeImportPath = (importPath) => {
      if (isExternal(importPath)) {
        return null;
      }

      const importBase = path.dirname(importPath);
      if (importBase === ".") {
        return null;
      }

      if (!/^\./.test(importBase)) {
        return null;
      }

      const fileName = context.getFilename();
      const fileDir = path.dirname(fileName);
      const importDir = path.resolve(fileDir, importBase);

      const fileBasePath = path.dirname(fileName);

      if (!packagePaths[fileBasePath]) {
        const packageInfo = (packagePaths[fileBasePath] = {});

        const nearestPkg = readPackageUpSync({
          cwd: fileName,
          normalize: false,
        });

        packageInfo.path = path.dirname(nearestPkg.path);
        packageInfo.name = nearestPkg.packageJson.name;
      }

      const packageInfo = packagePaths[fileBasePath];
      if (importDir.includes(packageInfo.path) === false) {
        return packageInfo.name;
      }

      return null;
    };

    return {
      ImportDeclaration: (node) => {
        if (node.importKind === "type") {
          return;
        }

        const importPath = node.source.value;

        if (importPath.startsWith("@example/") && importPath.includes("/src")) {
          context.report({
            node,
            message: `Import "${importPath}" should not include "/src" in the path. Remove "/src" from the import.`,
            fix(fixer) {
              const fixedPath = importPath.replace(/\/src\//, "/").replace(/\/src$/, "");
              return fixer.replaceText(node.source, `'${fixedPath}'`);
            },
          });
          return;
        }

        const failPackage = assertNoRelativeImportPath(importPath);
        if (failPackage) {
          context.report({
            node,
            message: `Import of "${importPath}" reaches outside of the package "${failPackage}". Use absolute imports with the @example namespace instead.`,
            fix(fixer) {
              const parts = importPath.split("/");
              let packageName = "";
              for (let i = 0; i < parts.length; i++) {
                if (parts[i] === "..") continue;
                packageName = parts[i];
                break;
              }

              if (packageName) {
                let absolutePath = importPath.replace(
                  /(?:\.\.\/)+.*?\//,
                  `@example/${packageName}/`,
                );
                absolutePath = absolutePath.replace(/\/src\//, "/");
                absolutePath = absolutePath.replace(/\.(js|jsx|ts|tsx)$/, "");
                return fixer.replaceText(node.source, `'${absolutePath}'`);
              }
              return null;
            },
          });
        }
      },

      CallExpression: (node) => {
        if (node.callee.name === "require") {
          const [requirePath] = node.arguments;
          if (!requirePath) return;

          if (requirePath.value?.startsWith("@example/") && requirePath.value.includes("/src")) {
            context.report({
              node,
              message: `Require "${requirePath.value}" should not include "/src" in the path. Remove "/src" from the require.`,
              fix(fixer) {
                const fixedPath = requirePath.value.replace(/\/src\//, "/").replace(/\/src$/, "");
                return fixer.replaceText(requirePath, `'${fixedPath}'`);
              },
            });
            return;
          }

          const failPackage = assertNoRelativeImportPath(requirePath.value);
          if (failPackage) {
            context.report({
              node,
              message: `Require of "${requirePath.value}" reaches outside of the package "${failPackage}". Use absolute imports with the @example namespace instead.`,
              fix(fixer) {
                const parts = requirePath.value.split("/");
                let packageName = "";
                for (let i = 0; i < parts.length; i++) {
                  if (parts[i] === "..") continue;
                  packageName = parts[i];
                  break;
                }

                if (packageName) {
                  let absolutePath = requirePath.value.replace(
                    /(?:\.\.\/)+.*?\//,
                    `@example/${packageName}/`,
                  );
                  absolutePath = absolutePath.replace(/\/src\//, "/");
                  absolutePath = absolutePath.replace(/\.(js|jsx|ts|tsx)$/, "");
                  return fixer.replaceText(requirePath, `'${absolutePath}'`);
                }
                return null;
              },
            });
          }
        }
      },
    };
  },
};
