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

import { CommanderError } from "commander";
import { consola } from "consola";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { parse } from "yaml";
import { generateModelsFromStepsSchema } from "../../utils/steps/generateModelsFromStepsSchema.js";
import { parseMigrationSteps } from "../../utils/steps/parseMigrationSteps.js";

interface StepsGenModelsOptions {
  input: string;
  output: string;
  typeImportPath?: string;
  schemaImportPath?: string;
}

export async function stepsGenModelsHandler(options: StepsGenModelsOptions): Promise<void> {
  try {
    const inputPath = resolve(options.input);
    const outputPath = resolve(options.output);

    consola.info(`Reading migration steps from: ${inputPath}`);

    const yamlContent = readFileSync(inputPath, "utf8");
    const parsedYaml = parse(yamlContent) as unknown;
    const migrationSteps = parseMigrationSteps(parsedYaml);

    consola.info("Generating Model constants from migration steps...");

    const generatedCode = await generateModelsFromStepsSchema(migrationSteps, undefined, {
      typeImportPath: options.typeImportPath,
      schemaImportPath: options.schemaImportPath,
    });

    consola.info(`Writing generated Model constants to: ${outputPath}`);
    writeFileSync(outputPath, generatedCode, "utf8");

    consola.success("✅ Successfully generated Model constants from migration steps");
  } catch (error) {
    consola.error("❌ Error generating Model constants from steps:", error);
    throw new CommanderError(
      1,
      "STEPS_MODELS_ERROR",
      "Failed to generate Model constants from steps",
    );
  }
}
