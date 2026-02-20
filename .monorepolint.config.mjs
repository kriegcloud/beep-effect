/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { archetypes } from "@monorepolint/archetypes";
import * as Rules from "@monorepolint/rules";
import * as fs from "fs";
import * as path from "path";
import { parse as parseYaml } from "yaml";

// @ts-check

const REPOSITORY_URL = "https://github.com/palantir/pack.git";

/**
 * @typedef {Object} ArchetypeRules
 * @property {boolean} [isCli]
 * @property {boolean} [isSdkgenTemplate]
 * @property {boolean} [isBuildTools]
 * @property {boolean} [hasSdkgenTemplates]
 * @property {boolean} [isPrivate]
 * @property {boolean} [isDemo]
 * @property {boolean} [isDemoSchema]
 * @property {boolean} [isDemoApp]
 * @property {boolean} [isDemoSdk]
 */

const archetypeConfig = archetypes(
  (shared, rules) => {
    const baseScripts = {
      clean: "rimraf .turbo build dist lib test-output *.tgz tsconfig.tsbuildinfo",
      lint: "eslint ./src && dprint check --config $(find-up dprint.json) --allow-no-files",
      "lint:fix":
        "eslint ./src --fix && dprint fmt --config $(find-up dprint.json) --allow-no-files",
      "test:watch": "vitest --passWithNoTests",
      test: "vitest run --passWithNoTests -u",
      typecheck: "tsc --noEmit --emitDeclarationOnly false",
    };

    const libraryScripts = {
      ...baseScripts,
      transpileBrowser: "monorepo-transpile -f esm -m bundle -t browser",
      transpileCjs: "monorepo-transpile -f cjs -m bundle -t node",
      transpileEsm: "monorepo-transpile -f esm -m bundle -t node",
      transpileTypes: "monorepo-transpile -f esm -m types -t node",
    };

    const cliScripts = {
      ...baseScripts,
      // CLI packages use monorepo-transpile without bundling to preserve module structure
      transpileEsm: "monorepo-transpile -f esm -m normal -t node",
      transpileTypes: "tsc --emitDeclarationOnly",
    };

    const sdkgenTemplateScripts = {
      ...baseScripts,
      // sdkgen templates need individual files preserved
      transpileEsm: "tsc",
      transpileTypes: "tsc --emitDeclarationOnly",
    };

    const demoSchemaScripts = baseScripts;

    const demoAppScripts = {
      ...baseScripts,
      build: "tsc && vite build",
      dev: "vite",
      preview: "vite preview",
    };

    // Package scripts - different for CLI vs library vs sdkgen template vs schema vs demo app
    const scriptsRule = Rules.packageScript({
      ...shared,
      options: {
        scripts: rules.isDemoApp
          ? demoAppScripts
          : (rules.isDemoSchema
            ? demoSchemaScripts
            : (rules.isSdkgenTemplate
              ? sdkgenTemplateScripts
              : (rules.isCli ? cliScripts : libraryScripts))),
      },
    });

    // Required dependencies - CLI packages need @types/node
    const requiredScriptsDependenciesRule = Rules.requireDependency({
      ...shared,
      options: {
        devDependencies: {
          rimraf: "catalog:",
          typescript: "catalog:",
          tslib: "catalog:",
          ...(rules.isCli ? { "@types/node": "catalog:" } : {}),
        },
      },
    });

    const licenseAndRepositoryRule = Rules.packageEntry({
      ...shared,
      options: {
        entries: {
          license: "Apache-2.0",
          repository: {
            "type": "git",
            "url": REPOSITORY_URL,
          },
        },
      },
    });

    // Version requirement for all packages
    const versionRule = Rules.packageEntry({
      ...shared,
      options: {
        entriesExist: ["version"],
      },
    });

    // Common rules for most packages
    const commonRules = [
      versionRule,
      Rules.packageOrder({
        options: {
          order: [
            "name",
            "private",
            "version",
            "description",
            "access",
            "author",
            "license",
            "repository",
            "bin",
            "exports",
            "file",
            "scripts",
            "dependencies",
            "peerDependencies",
            "peerDependenciesMeta",
            "devDependencies",
            "publishConfig",
            "imports",
            "keywords",
            "files",
            // since these are just for fallback support we can drop to bottom
            "main",
            "module",
            "types",
          ],
        },
      }),
      Rules.alphabeticalDependencies({ includeWorkspaceRoot: true }),
      Rules.alphabeticalScripts({ includeWorkspaceRoot: true }),

      // Banned dependencies
      Rules.bannedDependencies({
        ...shared,
        options: {
          bannedDependencies: ["lodash", "lodash-es"],
        },
      }),
    ];

    const privateRules = [
      Rules.packageEntry({
        ...shared,
        options: {
          entries: {
            private: true,
          },
        },
      }),
      noPackageEntry({
        ...shared,
        options: {
          entries: ["publishConfig"],
        },
      }),
    ];

    const publicRules = [
      noPackageEntry({
        ...shared,
        options: {
          entries: ["private"],
        },
      }),
      allLocalDepsMustNotBePrivate({
        ...shared,
      }),
    ];

    const baseRules = [
      ...commonRules,
      Rules.consistentDependencies({
        ...shared,
      }),
      Rules.consistentVersions({
        ...shared,
        options: {
          matchDependencyVersions: getPnpmCatalogVersions(),
        },
      }),
      ...(rules.isPrivate || rules.isDemo ? privateRules : publicRules),
    ];

    const standardTsConfigRule = Rules.standardTsconfig({
      ...shared,
      options: {
        excludedReferences: ["**/*"],
        templateFile: rules.isDemoSchema || rules.isDemoApp
          ? "templates/tsconfig.demo.json"
          : (rules.isSdkgenTemplate
            ? "templates/tsconfig.sdkgen-template.json"
            : (rules.isCli ? "templates/tsconfig.cli.json" : "templates/tsconfig.json")),
      },
    });

    const vitestConfigRule = Rules.fileContents({
      ...shared,
      options: {
        file: "vitest.config.mjs",
        generator: context => {
          const packageJson = context.getPackageJson();
          const devDeps = packageJson.devDependencies ?? {};
          const hasHappyDom = "happy-dom" in devDeps;

          const templateFile = hasHappyDom
            ? "templates/vitest.with-dom.config.mjs"
            : "templates/vitest.config.mjs";

          const { packageDir: workspacePackageDir } = context.getWorkspaceContext();
          const fullPath = path.resolve(workspacePackageDir, templateFile);
          return context.host.readFile(fullPath, { encoding: "utf-8" });
        },
      },
    });

    const noExportsRule = noPackageEntry({
      ...shared,
      options: {
        entries: ["exports", "main", "module", "types"],
      },
    });

    if (rules.isBuildTools) {
      if (!rules.isCli) {
        return [
          licenseAndRepositoryRule,
          ...baseRules,
        ];
      }
      return [
        licenseAndRepositoryRule,
        scriptsRule,
        requiredScriptsDependenciesRule,
        standardTsConfigRule,
        ...baseRules,
      ];
    }

    if (rules.isDemoApp) {
      return [
        licenseAndRepositoryRule,
        scriptsRule,
        standardTsConfigRule,
        vitestConfigRule,
        noExportsRule,
        ...baseRules,
      ];
    }

    if (rules.isDemoSchema) {
      return [
        licenseAndRepositoryRule,
        scriptsRule,
        requiredScriptsDependenciesRule,
        standardTsConfigRule,
        vitestConfigRule,
        noExportsRule,
        ...baseRules,
      ];
    }

    if (rules.isDemoSdk) {
      return [
        versionRule,
        Rules.packageOrder({
          options: {
            order: [
              "name",
              "private",
              "version",
              "description",
              "access",
              "author",
              "license",
              "repository",
              "bin",
              "exports",
              "file",
              "scripts",
              "dependencies",
              "peerDependencies",
              "peerDependenciesMeta",
              "devDependencies",
              "publishConfig",
              "imports",
              "keywords",
              "files",
              "main",
              "module",
              "types",
            ],
          },
        }),
        Rules.alphabeticalDependencies({}),
        Rules.alphabeticalScripts({}),
        ...privateRules,
      ];
    }

    if (rules.isDemo) {
      return [
        licenseAndRepositoryRule,
        scriptsRule,
        vitestConfigRule,
        Rules.packageEntry({
          ...shared,
          options: {
            entries: {
              type: "module",
              exports: {
                ".": {
                  browser: "./build/browser/index.js",
                  import: {
                    types: "./build/types/index.d.ts",
                    default: "./build/esm/index.js",
                  },
                  require: "./build/cjs/index.js",
                  default: "./build/browser/index.js",
                },
                "./*": {
                  browser: "./build/browser/public/*.js",
                  import: {
                    types: "./build/types/public/*.d.ts",
                    default: "./build/js/public/*.js",
                  },
                  require: "./build/cjs/public/*.js",
                  default: "./build/browser/public/*.js",
                },
              },
              main: "./build/cjs/index.js",
              module: "./build/esm/index.js",
              types: "./build/cjs/index.d.ts",
            },
          },
        }),
        standardTsConfigRule,
        requiredScriptsDependenciesRule,
        ...commonRules,
        Rules.consistentDependencies({
          ...shared,
        }),
        Rules.consistentVersions({
          ...shared,
          options: {
            matchDependencyVersions: getPnpmCatalogVersions(),
          },
        }),
        ...privateRules,
      ];
    }

    if (rules.isSdkgenTemplate) {
      return [
        licenseAndRepositoryRule,
        scriptsRule,
        requiredScriptsDependenciesRule,
        standardTsConfigRule,
        vitestConfigRule,
        ...baseRules,
      ];
    }

    return [
      licenseAndRepositoryRule,
      scriptsRule,
      vitestConfigRule,

      // Package exports - CLI packages have simpler exports
      Rules.packageEntry({
        ...shared,
        options: {
          entries: {
            type: "module",
            ...(!rules.isPrivate && {
              publishConfig: {
                "access": "public",
              },
            }),
            ...(rules.isCli
              ? {
                // CLI packages: simpler exports for Node.js only
                exports: {
                  ".": {
                    types: "./build/types/index.d.ts",
                    default: "./build/esm/index.js",
                  },
                },
                files: rules.hasSdkgenTemplates ? ["bin", "build", "templates"] : ["bin", "build"],
                main: "./build/esm/index.js",
                types: "./build/types/index.d.ts",
              }
              : {
                // Library packages: full browser/node exports
                exports: {
                  ".": {
                    browser: "./build/browser/index.js",
                    import: {
                      types: "./build/types/index.d.ts",
                      default: "./build/esm/index.js",
                    },
                    require: "./build/cjs/index.js",
                    default: "./build/browser/index.js",
                  },
                  "./*": {
                    browser: "./build/browser/public/*.js",
                    import: {
                      types: "./build/types/public/*.d.ts",
                      default: "./build/js/public/*.js",
                    },
                    require: "./build/cjs/public/*.js",
                    default: "./build/browser/public/*.js",
                  },
                },
                main: "./build/cjs/index.js",
                module: "./build/esm/index.js",
                types: "./build/cjs/index.d.ts",
              }),
          },
        },
      }),
      standardTsConfigRule,
      requiredScriptsDependenciesRule,
      ...baseRules,
    ];
  },
  { unmatched: "error" },
);

const packages = {
  // Build tools
  "@palantir/pack.monorepo.cspell": { isBuildTools: true, isPrivate: true },
  "@palantir/pack.monorepo.release": { isBuildTools: true, isCli: true, isPrivate: true },
  "@palantir/pack.monorepo.transpile": { isBuildTools: true, isCli: true, isPrivate: true },
  "@palantir/pack.monorepo.tsconfig": { isBuildTools: true, isPrivate: true },

  // CLI packages
  "@palantir/pack.document-schema.type-gen": { isCli: true },
  "@palantir/pack.sdkgen": { isCli: true, hasSdkgenTemplates: true },

  // SDK generation templates
  "@palantir/pack.sdkgen.demo-template": { isSdkgenTemplate: true, isPrivate: true },
  "@palantir/pack.sdkgen.pack-template": { isSdkgenTemplate: true },

  // Demo packages
  "@demo/canvas.app": { isDemo: true, isDemoApp: true },
  "@demo/canvas.schema": { isDemo: true, isDemoSchema: true },
  "@demo/canvas.sdk": { isDemo: true, isDemoSdk: true },

  // Library packages (default rules)
  "@palantir/pack.app": {},
  "@palantir/pack.auth": {},
  "@palantir/pack.auth.foundry": {},
  "@palantir/pack.core": {},
  "@palantir/pack.document-schema.model-types": {},
  "@palantir/pack.schema": {},
  "@palantir/pack.state.core": {},
  "@palantir/pack.state.demo": {},
  "@palantir/pack.state.foundry": {},
  "@palantir/pack.state.foundry-event": {},
  "@palantir/pack.state.react": {},
};

// Generate archetypes from package configuration
Object.entries(packages).reduce((config, [packageName, flags]) => {
  const archetypeName = packageName.replace("@palantir/pack.", "").replace("@demo/", "");
  return config.addArchetype(archetypeName, [packageName], flags);
}, archetypeConfig);

const allLocalDepsMustNotBePrivate = Rules.createRuleFactory({
  name: "allLocalDepsMustNotBePrivate",
  check: async context => {
    const packageJson = context.getPackageJson();
    const deps = packageJson.dependencies ?? {};

    const nameToDir = await context.getWorkspaceContext().getPackageNameToDir();

    for (const [dep, version] of Object.entries(deps)) {
      if (nameToDir.has(dep)) {
        const packageDir = nameToDir.get(dep);
        /** @type any */
        const theirPackageJson = context.host.readJson(
          path.join(packageDir, "package.json"),
        );

        // Allow demo packages (those with names starting with @demo/ or containing .demo) to be used as dependencies
        const isDemoPackage = dep.startsWith("@demo/") || dep.includes(".demo");

        if (theirPackageJson.private && !isDemoPackage) {
          const message =
            `${dep} is private and cannot be used as a regular dependency for this package`;
          context.addError({
            message,
            longMessage: message,
            file: context.getPackageJsonPath(),
          });
        }
      }
    }
  },
  validateOptions: () => {}, // no options right now
});

/**
 * @type {import("@monorepolint/rules").RuleFactoryFn<{entries: string[]}>}
 */
const noPackageEntry = Rules.createRuleFactory({
  name: "noPackageEntry",
  check: async (context, options) => {
    const packageJson = context.getPackageJson();
    for (const entry of options.entries) {
      if (packageJson[entry]) {
        context.addError({
          message: `${entry} field is not allowed`,
          longMessage: `${entry} field is not allowed`,
          file: context.getPackageJsonPath(),
        });
      }
    }
  },
  validateOptions: options => {
    return typeof options === "object" && "entries" in options
      && Array.isArray(options.entries);
  },
});

/**
 * Parses pnpm-workspace.yaml catalog section
 * @returns {Record<string, string>} Object mapping package names to "catalog:"
 */
function getPnpmCatalogVersions() {
  const workspaceYamlPath = path.join(process.cwd(), "pnpm-workspace.yaml");
  if (!fs.existsSync(workspaceYamlPath)) {
    return {};
  }

  const content = fs.readFileSync(workspaceYamlPath, "utf-8");
  const workspace = parseYaml(content);

  if (!workspace || !workspace.catalog || typeof workspace.catalog !== "object") {
    return {};
  }

  const catalogVersions = {};
  for (const packageName of Object.keys(workspace.catalog)) {
    // All catalog entries should use "catalog:" in package.json
    catalogVersions[packageName] = "catalog:";
  }

  return catalogVersions;
}

const config = () => ({
  rules: archetypeConfig.buildRules(),
});

export default config;
