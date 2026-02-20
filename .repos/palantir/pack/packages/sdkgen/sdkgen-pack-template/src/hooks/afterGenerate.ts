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

import { spawnSync } from "child_process";
import { consola } from "consola";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

interface HookContext {
  outputPath: string;
  schema: unknown;
  schemaPath?: string;
  options: { dryRun?: boolean; skipInstall?: boolean };
}

export default async function afterGenerate(context: HookContext): Promise<void> {
  const { outputPath, schemaPath, options } = context;

  if (!options.dryRun && schemaPath) {
    // Check if schema was provided and copied to output
    const copiedSchemaPath = path.join(outputPath, "schema");

    if (await fs.pathExists(copiedSchemaPath)) {
      const resolvedUrlForTypeGenPackage = import.meta.resolve(
        "@palantir/pack.document-schema.type-gen",
      );

      const pathToTypeGenExecutable = path.resolve(
        fileURLToPath(resolvedUrlForTypeGenPackage),
        "../../../bin/cli-node.js",
      );

      const pathToTypeGenPackageJson = path.resolve(
        fileURLToPath(resolvedUrlForTypeGenPackage),
        "../../../package.json",
      );

      try {
        consola.log("Generating TypeScript types from YAML schema...");

        // Find the first YAML file in the schema directory
        const yamlFiles = await fs.readdir(copiedSchemaPath);
        const yamlFile = yamlFiles.find(f => f.endsWith(".yaml") || f.endsWith(".yml"));

        if (yamlFile) {
          const schemaFile = path.join(copiedSchemaPath, yamlFile);

          const typesResult = spawnSync(
            pathToTypeGenExecutable,
            [
              "steps",
              "types",
              "-i",
              copiedSchemaPath,
              "-o",
              path.join(outputPath, "src", "types.ts"),
            ],
            { stdio: "inherit", cwd: outputPath },
          );

          if (typesResult.status !== 0) {
            throw new Error(
              `Type generation failed with exit code ${typesResult.status ?? "unknown"}`,
            );
          }

          consola.log("Generating Zod schemas from YAML schema...");
          const zodResult = spawnSync(
            pathToTypeGenExecutable,
            [
              "steps",
              "zod",
              "--type-import-path",
              "./types.js",
              "-i",
              schemaFile,
              "-o",
              path.join(outputPath, "src", "schema.ts"),
            ],
            { stdio: "inherit", cwd: outputPath },
          );

          if (zodResult.status !== 0) {
            throw new Error(`Zod schema generation failed with exit code ${zodResult.status}`);
          }

          consola.log("Generating Model constants from YAML schema...");
          const modelsResult = spawnSync(
            pathToTypeGenExecutable,
            [
              "steps",
              "models",
              "--type-import-path",
              "./types.js",
              "--schema-import-path",
              "./schema.js",
              "-i",
              schemaFile,
              "-o",
              path.join(outputPath, "src", "models.ts"),
            ],
            { stdio: "inherit", cwd: outputPath },
          );

          if (modelsResult.status !== 0) {
            throw new Error(
              `Model constants generation failed with exit code ${modelsResult.status}`,
            );
          }
        } else {
          consola.log("No YAML schema files found in schema directory");
        }

        consola.log("Type, Zod schema, and Model constants generation complete!");

        const typeGenPackageJson = await fs.readJson(pathToTypeGenPackageJson);
        const modelTypesVersion = typeGenPackageJson.dependencies?.[
          "@palantir/pack.document-schema.model-types"
        ];

        if (modelTypesVersion) {
          consola.log(
            `Updating model-types dependency to version ${modelTypesVersion}...`,
          );

          const outputPackageJsonPath = path.join(outputPath, "package.json");
          const outputPackageJson = await fs.readJson(outputPackageJsonPath);

          if (outputPackageJson.dependencies?.["@palantir/pack.document-schema.model-types"]) {
            outputPackageJson.dependencies["@palantir/pack.document-schema.model-types"] =
              modelTypesVersion;
            await fs.writeJson(outputPackageJsonPath, outputPackageJson, { spaces: 2 });
            consola.log("Successfully updated model-types dependency version");
          }
        } else {
          consola.warn(
            "Could not find model-types dependency in type-gen package.json",
          );
        }
      } catch (error) {
        consola.error(
          `Could not generate types: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      }
    }
  }

  // Note: We don't install dependencies or run prettier here
  // The CLI handles dependency installation if --skip-install is not set
}
