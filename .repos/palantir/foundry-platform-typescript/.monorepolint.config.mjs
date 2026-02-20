/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

// @ts-check

import {
  alphabeticalDependencies,
  alphabeticalScripts,
  createRuleFactory,
  fileContents,
  packageEntry,
  packageOrder,
  packageScript,
  requireDependency,
  standardTsconfig,
} from "@monorepolint/rules";
import * as child_process from "node:child_process";

const LATEST_TYPESCRIPT_DEP = "^5.5.4";

const DELETE_SCRIPT_ENTRY = { options: [undefined], fixValue: undefined };

const nonStandardPackages = [
  "@osdk/monorepo.*", // internal monorepo packages
  "@osdk/platform-sdk-generator",
];

// Packages that should be private
const privatePackages = [
  "@osdk/monorepo.*",
  "@osdk/platform-sdk-generator",
  "@osdk/tool.*",
];

/**
 * We don't want to allow `workspace:^` in our dependencies because our current release branch
 * strategy only allows for patch changes in the release branch and minors elsewhere.
 *
 * If we were to allow `workspace:^`, then the follow scenario causes issues:
 *   - Suppose we have a Foo and a Bar package and Bar depends on Foo.
 *   - at T0 we cut a release/1.1.x branch and ship Foo@1.1.0, Bar@1.1.0
 *   - at T1 we cut a release 1.2.x branch and ship Foo@1.2.0
 *
 * If we have `workspace:^` in our deps, a user that already has `Bar@1.1.0` in their package.json
 * could update their dependencies without updating Bar (say via pnpm update) and Bar's dependency
 * on Foo @ `^1.1.0` would be satisfied by the shipped `Foo@1.2.0`.
 *
 * Using `workspace:~` prevents this as `~` can only resolve patch changes.
 */
const disallowWorkspaceCaret = createRuleFactory({
  name: "disallowWorkspaceCaret",
  check: async (context) => {
    const packageJson = context.getPackageJson();
    const packageJsonPath = context.getPackageJsonPath();

    for (const d of ["dependencies", "devDependencies", "peerDependencies"]) {
      const deps = packageJson[d] ?? {};

      for (const [dep, version] of Object.entries(deps)) {
        if (dep === "@osdk/shared.client2") {
          const expected = "^1.0.0";
          if (version !== expected) {
            const message = `${dep} may only have '${expected}'`;
            context.addError({
              message,
              longMessage: message,
              file: context.getPackageJsonPath(),
              fixer: () => {
                // always refetch in fixer since another fixer may have already changed the file
                let packageJson = context.getPackageJson();
                if (packageJson[d]) {
                  packageJson[d] = Object.assign(
                    {},
                    packageJson[d],
                    { [dep]: expected },
                  );

                  context.host.writeJson(
                    context.getPackageJsonPath(),
                    packageJson,
                  );
                }
              },
            });
          }
        } else if (dep === " @osdk/shared.client") {
          // for shared client we need the symbol to work almost always so we are permissive
          if (version !== "workspace:^" && version !== "^1.0.1") {
            const message = `${dep} may only have 'workspace:^'`;
            context.addError({
              message,
              longMessage: message,
              file: context.getPackageJsonPath(),
              fixer: () => {
                // always refetch in fixer since another fixer may have already changed the file
                let packageJson = context.getPackageJson();
                if (packageJson[d]) {
                  packageJson[d] = Object.assign(
                    {},
                    packageJson[d],
                    { [dep]: "workspace:^" },
                  );

                  context.host.writeJson(
                    context.getPackageJsonPath(),
                    packageJson,
                  );
                }
              },
            });
          }
        } else if (version === "workspace:^") {
          if (dep === "@osdk/shared.client2") continue;
          if (dep === "@osdk/shared.client") continue;
          const message = `'workspace:^' not allowed (${d}['${dep}']).`;
          context.addError({
            message,
            longMessage: `${message} Did you mean 'workspace:~'?`,
            file: context.getPackageJsonPath(),
            fixer: () => {
              // always refetch in fixer since another fixer may have already changed the file
              let packageJson = context.getPackageJson();
              if (packageJson[d]?.[dep] === "workspace:^") {
                packageJson[d] = Object.assign(
                  {},
                  packageJson[d],
                  { [dep]: "workspace:~" },
                );

                context.host.writeJson(
                  context.getPackageJsonPath(),
                  packageJson,
                );
              }
            },
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
const noPackageEntry = createRuleFactory({
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
  validateOptions: (options) => {
    return typeof options === "object" && "entries" in options
      && Array.isArray(options.entries);
  },
});

const cache = new Map();

/**
 * @param {string} contents
 */
const formattedGeneratorHelper = (contents, ext) => async (context) => {
  if (cache.has(contents)) {
    return cache.get(contents);
  }
  const result = child_process.spawnSync(
    `pnpm exec dprint fmt --stdin foo.${ext}`,
    {
      input: contents,
      encoding: "utf8",
      shell: true,
    },
  );

  if (result.error) {
    throw result.error;
  }

  cache.set(contents, result.stdout);

  return result.stdout;
};

/**
 * @param {string} baseTsconfigPath
 * @param {{
 *   customTsconfigExcludes?: string[]
 *   outDir: string
 * }} opts
 * @returns {Parameters<import("@monorepolint/rules")["standardTsconfig"]>[0]["options"]}
 */
function getTsconfigOptions(baseTsconfigPath, opts) {
  return {
    file: "tsconfig.json",

    excludedReferences: ["**/*"],
    template: {
      extends: baseTsconfigPath,

      compilerOptions: {
        rootDir: "src",
        outDir: opts.outDir,
      },
      include: ["./src/**/*"],
      ...(opts.customTsconfigExcludes
        ? { exclude: opts.customTsconfigExcludes ?? [] }
        : {}),
    },
  };
}

/**
 * @param {Omit<import("@monorepolint/config").RuleEntry<>,"options" | "id">} shared
 * @param {{
 *  customTsconfigExcludes?: string[],
 *  tsVersion?: typeof LATEST_TYPESCRIPT_DEP,
 *  vitest?: boolean
 * }} options
 * @returns {import("@monorepolint/config").RuleModule[]}
 */
function standardPackageRules(shared, options) {
  return [
    disallowWorkspaceCaret({ ...shared }),

    standardTsconfig({
      ...shared,

      options: getTsconfigOptions(
        `@osdk/monorepo.tsconfig/base.json`,
        {
          customTsconfigExcludes: options.customTsconfigExcludes,
          outDir: "build/esm",
        },
      ),
    }),
    ...(options.tsVersion
      ? [
        requireDependency({
          ...shared,
          options: {
            devDependencies: { typescript: options.tsVersion },
          },
        }),
      ]
      : []),
    requireDependency({
      ...shared,
      options: {
        devDependencies: {
          "@osdk/monorepo.tsconfig": "workspace:~",
        },
      },
    }),
    packageScript({
      ...shared,
      options: {
        scripts: {
          clean: "rm -rf lib dist types build tsconfig.tsbuildinfo",
          "check-spelling": "cspell --quiet .",
          "check-attw": `monorepo.tool.attw esm`,
          lint: "eslint . && dprint check  --config $(find-up dprint.json)",
          "fix-lint":
            "eslint . --fix && dprint fmt --config $(find-up dprint.json)",
          transpile: {
            options: [
              "monorepo.tool.transpile",
            ],
            fixValue: "monorepo.tool.transpile",
          },
          transpileWatch: DELETE_SCRIPT_ENTRY,
          typecheck: DELETE_SCRIPT_ENTRY,
        },
      },
    }),
    packageEntry({
      ...shared,
      options: {
        entries: {
          exports: {
            ".": {
              browser: "./build/browser/index.js",
              import: "./build/esm/index.js",
              default: "./build/esm/index.js",
            },

            "./*": {
              browser: "./build/browser/public/*.js",
              import: "./build/esm/public/*.js",
              default: "./build/esm/public/*.js",
            },
          },
          publishConfig: {
            "access": "public",
          },
          files: [
            "build/cjs",
            "build/esm",
            "build/browser",
            "CHANGELOG.md",
            "package.json",
            "templates",

            // fallback entries for "submodule imports" in legacy projects
            "*.d.ts",
          ],

          module: "./build/esm/index.js",
          types: `./build/esm/index.d.ts`,
          type: "module",
        },
      },
    }),
    ...(options.vitest
      ? [
        fileContents({
          ...shared,
          options: {
            file: "vitest.config.mts",
            generator: formattedGeneratorHelper(
              `
          /*
           * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

          import { configDefaults, defineConfig } from "vitest/config";

          export default defineConfig({
            test: {
              pool: "forks",
              exclude: [...configDefaults.exclude, "**/build/**/*"],
            },
          });
     
          `,
              "js",
            ),
          },
        }),
      ]
      : []),
  ];
}

/**
 * @type {import("@monorepolint/config").Config}
 */
export default {
  rules: [
    ...standardPackageRules({
      excludePackages: [
        ...nonStandardPackages,
      ],
    }, {
      tsVersion: LATEST_TYPESCRIPT_DEP,
    }),

    ...standardPackageRules({
      includePackages: ["@osdk/platform-sdk-generator"],
    }, {
      tsVersion: LATEST_TYPESCRIPT_DEP,
      vitest: true,
    }),

    packageEntry({
      options: {
        entries: {
          license: "Apache-2.0",
          repository: {
            "type": "git",
            "url":
              "https://github.com/palantir/foundry-platform-typescript.git",
          },
        },
        entriesExist: ["version"],
      },
    }),

    requireDependency({
      includePackages: [
        "@osdk/foundry.*",
        "@osdk/internal.foundry.*",
        "@osdk/foundry",
        "@osdk/internal.foundry",
      ],
      options: {
        dependencies: {
          "@osdk/shared.client": "^1.0.1",
          "@osdk/shared.client2": "^1.0.0",
          "@osdk/shared.net.platformapi": "workspace:~",
        },
      },
    }),

    fileContents({
      includePackages: ["@osdk/internal.*"],
      options: {
        file: "README.md",
        template: `# WARNING

This is an internal only package.

We may regularly break changes in this package for our own internal uses. If you use anything from this
package you do so at your own risk.

(Also, this is a generated file. Do not change directly.)
`,
      },
    }),

    packageEntry({
      includePackages: privatePackages,
      options: {
        entries: {
          private: true,
        },
      },
    }),

    noPackageEntry({
      excludePackages: privatePackages,
      options: {
        entries: ["private"],
      },
    }),

    alphabeticalDependencies({ includeWorkspaceRoot: true }),
    alphabeticalScripts({ includeWorkspaceRoot: true }),

    packageOrder({
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
          "bin",
          "files",
          // since these are just for fallback support we can drop to bottom
          "main",
          "module",
          "types",
        ],
      },
    }),
  ],
};
