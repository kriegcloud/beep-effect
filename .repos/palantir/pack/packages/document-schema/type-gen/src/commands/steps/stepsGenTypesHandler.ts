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

import type { ReturnedSchema } from "@palantir/pack.schema";
import { CommanderError } from "commander";
import { consola } from "consola";
import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";
import { generateTypesFromSchema } from "../../utils/schema/generateTypesFromSchema.js";
import { convertStepsToSchema } from "../../utils/steps/convertStepsToSchema.js";
import type { MigrationStep } from "../../utils/steps/parseMigrationSteps.js";
import { parseMigrationSteps } from "../../utils/steps/parseMigrationSteps.js";

export interface TypesGenOptions {
  input: string;
  output: string;
}

export function stepsGenTypesHandler(options: TypesGenOptions): void {
  const { input: inputDir, output: outputFile } = options;

  if (!fs.existsSync(inputDir)) {
    throw new CommanderError(1, "ENOENT", `Input directory does not exist: ${inputDir}`);
  }

  if (!fs.statSync(inputDir).isDirectory()) {
    throw new CommanderError(1, "ENOTDIR", `Input path is not a directory: ${inputDir}`);
  }

  const files = fs
    .readdirSync(inputDir)
    .filter(file => file.endsWith(".yml") || file.endsWith(".yaml"));

  if (files.length === 0) {
    throw new CommanderError(1, "ENOFILES", `No YAML files found in directory: ${inputDir}`);
  }

  const sortedFiles = files.sort((a, b) => a.localeCompare(b));

  const steps: MigrationStep[] = [];
  for (const file of sortedFiles) {
    const filePath = path.join(inputDir, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = YAML.parse(fileContent) as unknown;
    const parsedCommands = parseMigrationSteps(parsed);
    steps.push(...parsedCommands);
  }

  const { recordDefinitions, unionDefinitions } = convertStepsToSchema(steps);

  const schema: ReturnedSchema = {
    ...Object.fromEntries(recordDefinitions.map(def => [def.name, def])),
    ...Object.fromEntries(unionDefinitions.map(def => [def.name, def])),
  };

  const generatedTypes = generateTypesFromSchema(schema);

  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, generatedTypes, "utf8");

  consola.success(`Generated types written to: ${outputFile}`);
}
