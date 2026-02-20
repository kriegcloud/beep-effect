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

import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { SchemaParser } from "../core/schemaParser.js";
import { Logger } from "../utils/logger.js";
import type { TestSchema } from "./types/testTypes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, "fixtures");

describe("SchemaParser", () => {
  const logger = new Logger(false);
  const parser = new SchemaParser(logger);

  it("should load JSON schema", async () => {
    const schemaPath = path.join(fixturesDir, "test-schema.json");
    const schema = await parser.loadSchema(schemaPath) as TestSchema;

    expect(schema).toMatchObject({
      version: "1.0.0",
      description: "Test API Schema",
      types: {
        User: {
          id: "string",
          name: "string",
          email: "string",
          createdAt: "Date",
        },
        Post: {
          id: "string",
          title: "string",
          content: "string",
          authorId: "string",
        },
        Comment: {
          id: "string",
          postId: "string",
          userId: "string",
          content: "string",
          createdAt: "Date",
        },
      },
    });
  });

  it("should return null when no schema provided", async () => {
    const schema = await parser.loadSchema();
    expect(schema).toBeNull();
  });

  it("should throw error for non-existent file", async () => {
    await expect(parser.loadSchema("/non/existent/file.json")).rejects.toThrow(
      "Schema path not found",
    );
  });

  it("should throw error for unsupported file type", async () => {
    await expect(parser.loadSchema("test.txt")).rejects.toThrow(
      "Schema path not found",
    );
  });
});
