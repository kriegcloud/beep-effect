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

export const config = {
  name: "@palantir/pack.sdkgen.pack-template",
  description: "PACK SDK template for generating types and Zod schemas from YAML",
  templateFiles: ["**/*.ejs"] as const,
  staticFiles: [
    "**/*",
    "!**/*.ejs",
    "_gitignore",
  ] as const,
  prompts: [
    {
      type: "input",
      name: "description",
      message: "SDK description:",
      default: "Generated SDK from schema",
    },
    {
      type: "input",
      name: "author",
      message: "Author:",
      default: "",
    },
    {
      type: "input",
      name: "schemaDir",
      message: "Directory containing YAML schema files:",
      default: "schema",
    },
  ] as const,
  transformers: {
    default: "./build/esm/transformer.js",
  },
  hooks: {
    afterGenerate: "./build/esm/hooks/afterGenerate.js",
  },
  utils: [
    "camelCase",
    "pascalCase",
    "kebabCase",
    "upperCase",
    "lowerCase",
  ] as const,
};
