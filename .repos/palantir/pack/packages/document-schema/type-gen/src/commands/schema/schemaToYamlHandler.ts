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

import { consola } from "consola";
import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";
import {
  convertSchemaToSteps,
  convertStepsToYamlString,
} from "../../utils/schema/convertSchemaToSteps.js";
import { extractValidSchema } from "../../utils/schema/validateSchemaModule.js";

interface SchemaToYamlOptions {
  input: string;
  output: string;
}

export async function schemaToYamlHandler(options: SchemaToYamlOptions): Promise<void> {
  const { input, output } = options;

  try {
    const inputPath = path.resolve(input);

    if (!await fs.pathExists(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    consola.info(`Loading schema from: ${inputPath}`);

    const schemaUrl = pathToFileURL(inputPath).href;
    const schemaModule: unknown = await import(schemaUrl);

    // Validate and extract the schema using Zod validation
    const schema = extractValidSchema(schemaModule);

    consola.info("Converting schema to YAML...");

    // Generate the migration steps
    const steps = convertSchemaToSteps(schema);

    // Convert steps to YAML string
    const yamlContent = convertStepsToYamlString(steps);

    const outputPath = path.resolve(output);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, yamlContent, "utf8");

    consola.success(`✅ YAML migration steps written to: ${outputPath}`);
  } catch (error) {
    consola.error("Error converting schema to YAML:", error);
    process.exit(1);
  }
}
