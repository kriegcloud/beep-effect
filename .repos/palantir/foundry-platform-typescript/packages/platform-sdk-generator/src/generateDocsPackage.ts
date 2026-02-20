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

import type { DocsSnippetsSpec } from "@osdk/docs-spec-core";
import type { ApiSpec } from "@osdk/docs-spec-platform";
import fs from "node:fs/promises";
import * as path from "node:path";
import { copyright } from "./copyright.js";

const PACKAGE_NAME = "docs-spec-platform";

const IGNORED_PLATFORM_VERSIONS = new Set(["v1"]);

function generatePlatformDocsSpec(ir: ApiSpec): DocsSnippetsSpec {
  const spec: DocsSnippetsSpec = {
    version: 1,
    snippets: {},
  };

  for (const namespace of ir.namespaces) {
    if (IGNORED_PLATFORM_VERSIONS.has(namespace.version)) {
      continue;
    }
    for (const resource of namespace.resources) {
      for (const operation of resource.operations) {
        const snippetName = `${namespace.version}.${operation.name}`;
        if (spec.snippets[snippetName] != null) {
          throw new Error(`Duplicate snippet name: "${snippetName}"`);
        }
        for (const parameter of operation.http.parameters) {
          if (parameter.name === "requestBody") {
            throw new Error(`Parameter name "requestBody" is reserved`);
          }
        }
        spec.snippets[snippetName] = { variables: {} };
      }
    }
  }

  return spec;
}

export async function generateDocsPackage(
  ir: ApiSpec,
  packagesDir: string,
): Promise<string> {
  const outputDir = path.join(packagesDir, PACKAGE_NAME);

  await fs.writeFile(
    path.join(outputDir, "src", "generated", "ir.ts"),
    `${copyright}
        import type { ApiSpec } from "../ir/ApiSpec.js";

        export const PLATFORM_API_IR: ApiSpec = ${JSON.stringify(ir, null, 2)}`,
  );

  await fs.writeFile(
    path.join(outputDir, "src", "generated", "spec.ts"),
    `${copyright}
    
    import type { DocsSnippetsSpec } from "@osdk/docs-spec-core";

    export const PLATFORM_API_DOCS_SPEC = ${
      JSON.stringify(
        generatePlatformDocsSpec(ir),
        null,
        2,
      )
    } as const satisfies DocsSnippetsSpec;`,
  );

  return outputDir;
}
