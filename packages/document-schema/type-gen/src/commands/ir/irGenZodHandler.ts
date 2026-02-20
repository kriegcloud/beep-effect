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
import type { IRealTimeDocumentSchema } from "../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import { generateZodSchemasFromIr } from "../../utils/ir/generateZodSchemasFromIr.js";

interface ZodGenOptions {
  readonly schema: string;
  readonly output: string;
  readonly typeImportPath?: string;
}

export async function irGenZodHandler(options: ZodGenOptions): Promise<void> {
  try {
    const schemaPath = resolve(options.schema);
    const outputPath = resolve(options.output);

    consola.info(`Reading schema from: ${schemaPath}`);

    const schemaContent = readFileSync(schemaPath, "utf8");

    // TODO: conjureToZod based validation matches conjure ir
    const schema = JSON.parse(schemaContent) as IRealTimeDocumentSchema;

    consola.info(`Generating Zod schemas for ${schema.primaryModelKeys.length} model(s)...`);

    const generatedCode = await generateZodSchemasFromIr(schema, {
      typeImportPath: options.typeImportPath,
    });

    consola.info(`Writing generated Zod schemas to: ${outputPath}`);
    writeFileSync(outputPath, generatedCode, "utf8");

    consola.success("✅ Zod schema generation completed successfully");
  } catch (error) {
    consola.error("❌ Error during Zod schema generation:", error);
    throw new CommanderError(1, "ERRIRZOD", "Error generating Zod schemas");
  }
}
