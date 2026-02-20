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
import * as YAML from "yaml";
import { generateTypesFromSchema } from "../../schema/generateTypesFromSchema.js";
import { convertStepsToSchema } from "../convertStepsToSchema.js";
import { parseMigrationSteps } from "../parseMigrationSteps.js";

describe("convertStepsToSchema", () => {
  const fixturesInputDir = path.join(__dirname, "fixtures", "yamls");
  const snapshotSchemaDir = path.join(__dirname, "__snapshots__", "stepSchemas");
  const snapshotTypesDir = path.join(__dirname, "__snapshots__", "types");

  const testFiles = fs
    .readdirSync(fixturesInputDir)
    .filter(file => file.endsWith(".yaml"));

  testFiles.forEach(testFile => {
    const testName = path.basename(testFile, ".yaml");

    it(`should convert ${testName} YAML to schema and types`, async () => {
      const filePath = path.join(fixturesInputDir, testFile);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const raw: unknown = YAML.parse(fileContent);
      const parsedSteps = parseMigrationSteps(raw);
      const { recordDefinitions, unionDefinitions } = convertStepsToSchema(parsedSteps);
      const schema: Schema<ReturnedSchema> = {};

      // Add record definitions using their record names as keys
      recordDefinitions.forEach(record => {
        schema[record.name] = record;
      });

      // Add union definitions using their union names as keys
      unionDefinitions.forEach(union => {
        schema[union.name] = union;
      });

      const output = printSchemaFile(schema);
      await expect(output).toMatchFileSnapshot(path.join(snapshotSchemaDir, `${testName}.ts`));
      const result = generateTypesFromSchema(schema);
      await expect(result).toMatchFileSnapshot(path.join(snapshotTypesDir, `${testName}.ts`));
    });
  });
});

function printSchemaFile(schema: Schema<ReturnedSchema>) {
  return `
import { Schema } from "@palantir/pack.schema";

const schema = (
${JSON.stringify(schema, null, 2)}
) satisfies Schema<any>;

export default schema;
`;
}
