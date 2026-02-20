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

import { findUp } from "find-up";
import { readFile } from "fs/promises";
import * as path from "node:path";

const config = function(api) {
  api.cache(false);
  return {
    sourceMaps: true,
    plugins: [
      ["babel-plugin-dev-expression"],
      ["babel-plugin-transform-inline-environment-variables", {
        "include": [],
      }],
      ["minify-dead-code-elimination"],
    ],
  };
};

export default config;

async function readPackageVersion(k) {
  const workspaceFile = await findUp("pnpm-workspace.yaml");
  if (!workspaceFile) throw "couldn't find workspace file";
  const workspaceRoot = path.dirname(workspaceFile);
  return await readFile(
    path.join(
      k.startsWith("/") ? k : path.join(workspaceRoot, k),
      "package.json",
    ),
    "utf-8",
  )
    .then(f => JSON.parse(f).version);
}
