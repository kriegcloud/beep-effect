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
"use strict";

const fs = require("fs");
const path = require("path");

const DICT_FOLDER = __dirname;

/**
 * Helper function so creating a dictionary definition just involves creating a file
 * named `dict.<name>.txt` in this folder.
 *
 * @returns {import("@cspell/cspell-types").DictionaryDefinition[]}
 */
function getDictionaryDefinitions() {
  const ret = [];
  for (const e of fs.readdirSync(DICT_FOLDER, { withFileTypes: true })) {
    if (e.isFile()) {
      const m = e.name.match(/^dict\.(.*)\.txt$/);
      if (!m) continue;

      ret.push({ name: m[1], path: path.join(DICT_FOLDER, e.name) });
    }
  }
  return ret;
}

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
  version: "0.2",
  enableGlobDot: true,
  useGitignore: true,
  ignorePaths: [
    // always ignore
    "node_modules/**",
    ".git/**",
    ".gitignore",
    "**/.turbo/**/*",
    ".*ignore",

    // Ignore these files for now
    "_gitignore",
    "*.{css,svg}",
    "*.{yml,yaml}",
    "*.json",
    "*.jsonc",
    "*.sh",
    "*.snap",
    "typedoc.jsonc",

    // Dictionary files have words that are only used in certain contexts so they implicitly
    // won't pass the generic case.
    "dict.*.txt",

    // spell checking the cspell config is a bit of a chicken and egg problem
    "cspell.config.js",

    // Just too complex right now. We should fix this later.
    "eslint.config.mjs",
    "tsup.config.js",
    "lint-staged.config.mjs",
    ".envrc.sample",
    ".monorepolint.config.mjs",

    // don't bother with any build directories
    "examples-extra/*/{build,dist}/**/*",
    "packages/*/build/**",
    "CHANGELOG.md",
  ],
  dictionaryDefinitions: [
    ...getDictionaryDefinitions(),
  ],
  // TODO(FIRST_BUILD): Slim down dictionaries copied from OSDK 
  dictionaries: [
    // builtin dicts to always include
    "en_US",
    "softwareTerms",
    "typescript",
    "node",
    "npm",

    // our dictionaries to always include
    "pack",
    "npm-packages",
    "foundry-words",
    "normal-dev-words",
    "oauth",
  ],
  words: ["todoapp"],
  suggestWords: [],
  ignoreWords: [],
  import: [],
  overrides: [
    {
      filename: ["**/*.md"],
      words: [
        // used in examples
        "myapp",
        "myorg"
      ]
    },
    {
      filename: ["**/*.{mts,cts,ts,tsx}"],
      dictionaries: ["error-codes"],
    },
    {
      filename: "**/*.test.{mts,cts,ts,tsx}",
      dictionaries: ["test-words"],
    },
  ],
};

module.exports = cspell;
