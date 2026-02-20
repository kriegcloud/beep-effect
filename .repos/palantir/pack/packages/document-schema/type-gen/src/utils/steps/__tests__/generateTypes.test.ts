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
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { generateTypesFromSchema } from "../../schema/generateTypesFromSchema.js";

describe("generateTypes", () => {
  // TODO: Add runtime validation of schema types instead of just using type assertions
  // The fixtures currently use the old format with 'recordName' instead of 'name'
  // and the tests pass because of type assertions that don't validate the actual runtime types

  // Use __dirname which is available in both CJS and when vitest transforms the code
  const fixturesInputDir = path.join(__dirname, "fixtures", "stepSchemas");
  const snapshotTypesDir = path.join(__dirname, "__snapshots__", "types");

  // Check if directory exists before reading
  if (!fs.existsSync(fixturesInputDir)) {
    throw new Error(`Fixtures directory not found: ${fixturesInputDir}`);
  }

  const testFiles = fs
    .readdirSync(fixturesInputDir)
    .filter(file => file.endsWith(".ts"));

  testFiles.forEach(testFile => {
    const testName = path.basename(testFile, ".ts");

    it(`should handle ${testName}`, async () => {
      const inputSchema = await import(path.join(fixturesInputDir, testFile)) as {
        default: Schema<ReturnedSchema>;
      };
      const result = generateTypesFromSchema(inputSchema.default);

      await expect(result).toMatchFileSnapshot(path.join(snapshotTypesDir, `${testName}.ts`));
    });
  });
});
