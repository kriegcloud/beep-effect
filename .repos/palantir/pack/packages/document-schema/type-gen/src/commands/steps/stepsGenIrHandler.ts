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
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import * as YAML from "yaml";
import { convertStepsToIr, type SchemaMetadata } from "../../utils/steps/convertStepsToIr.js";
import type { MigrationStep } from "../../utils/steps/parseMigrationSteps.js";
import { parseMigrationSteps } from "../../utils/steps/parseMigrationSteps.js";

interface StepsGenIrOptions {
  input: string;
  output: string;
  schemaName?: string;
  schemaDescription?: string;
  version?: string;
}

export function stepsGenIrHandler(options: StepsGenIrOptions): void {
  try {
    const { input: inputDir, output: outputFile } = options;

    if (!existsSync(inputDir)) {
      throw new CommanderError(1, "ENOENT", `Input directory does not exist: ${inputDir}`);
    }

    if (!statSync(inputDir).isDirectory()) {
      throw new CommanderError(1, "ENOTDIR", `Input path is not a directory: ${inputDir}`);
    }

    const files = readdirSync(inputDir)
      .filter(file => file.endsWith(".yml") || file.endsWith(".yaml"));

    if (files.length === 0) {
      throw new CommanderError(1, "ENOFILES", `No YAML files found in directory: ${inputDir}`);
    }

    const sortedFiles = files.sort((a, b) => a.localeCompare(b));

    const migrationSteps: MigrationStep[] = [];
    for (const file of sortedFiles) {
      const filePath = join(inputDir, file);
      const fileContent = readFileSync(filePath, "utf8");
      const parsed = YAML.parse(fileContent) as unknown;
      const parsedCommands = parseMigrationSteps(parsed);
      migrationSteps.push(...parsedCommands);
    }

    consola.info(`Converting ${migrationSteps.length} migration step(s) to IR format...`);

    // Prepare metadata if provided
    const metadata: SchemaMetadata = {
      name: options.schemaName,
      description: options.schemaDescription,
      version: options.version ? parseInt(options.version, 10) : undefined,
    };

    const schema = convertStepsToIr(migrationSteps, metadata);

    const outputDir = dirname(outputFile);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    writeFileSync(outputFile, JSON.stringify(schema, null, 2), "utf8");

    consola.success("✅ Successfully converted migration steps to IR format");
    consola.info(`   Generated types written to: ${outputFile}`);
    consola.info(`   Schema: ${schema.name} v${schema.version}`);
    consola.info(`   Models: ${Object.keys(schema.models).length}`);
    consola.info(`   Primary models: ${schema.primaryModelKeys.length}`);
  } catch (error) {
    consola.error("❌ Error converting steps to IR:", error);
    throw new CommanderError(1, "STEPS_IR_ERROR", "Failed to convert steps to IR format");
  }
}
