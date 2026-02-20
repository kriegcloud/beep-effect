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

import type { ReturnedSchema, Schema } from "@palantir/pack.schema";
import { generateZodSchemasFromIr } from "../ir/generateZodSchemasFromIr.js";
import { convertSchemaToIr, type SchemaMetadata } from "../steps/convertStepsToIr.js";

/**
 * Generates Zod schemas from a built Schema object
 * @param schema - Schema object built using document-schema-api
 * @param metadata - Optional schema metadata overrides
 * @returns Generated TypeScript code with Zod schemas
 */
export async function generateZodFromSchema<T extends ReturnedSchema>(
  schema: Schema<T>,
  metadata?: SchemaMetadata,
): Promise<string> {
  const irSchema = convertSchemaToIr(
    schema,
    metadata,
  );

  const generatedCode = await generateZodSchemasFromIr(irSchema);
  return generatedCode;
}
