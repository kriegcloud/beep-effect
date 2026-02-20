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

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { beforeAll, describe, expect, it } from "vitest";
import { ContextBuilder } from "../core/contextBuilder.js";
import { Generator } from "../core/generator.js";
import { SchemaParser } from "../core/schemaParser.js";
import { TemplateLoader } from "../core/templateLoader.js";
import { Logger } from "../utils/logger.js";
import type { PackageJson } from "./types/testTypes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, "fixtures");
const testOutputDir = path.join(__dirname, "../../test-output", "generator");

describe("Generator", () => {
  beforeAll(async () => {
    // Clean up before all tests run
    await fs.remove(testOutputDir);
    await fs.ensureDir(testOutputDir);
  });

  it("should generate SDK with demo template", async () => {
    const projectName = "demo-template-sdk";
    const outputPath = path.join(testOutputDir, projectName);
    // Find the template directory relative to the package root
    const packageRoot = path.resolve(__dirname, "../..");
    const templatePath = path.resolve(packageRoot, "../sdkgen-demo-template");
    const schemaPath = path.join(fixturesDir, "test-schema.json");

    // Load template
    const logger = new Logger(false);
    const templateLoader = new TemplateLoader(logger);
    const { config: templateConfig, templateDir } = await templateLoader.loadTemplate(templatePath);

    // Load schema
    const schemaParser = new SchemaParser(logger);
    const schema = await schemaParser.loadSchema(schemaPath);

    // Transform schema if transformer exists
    let transformedSchema = schema;
    if (templateConfig.transformers?.default) {
      const transformer = templateConfig.transformers.default;
      if (typeof transformer === "string") {
        const transformerPath = path.join(templateDir, transformer);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Dynamic import of transformer
        const { default: transformFn } = await import(transformerPath);

        transformedSchema = await transformFn(schema, {
          projectName,
          schema,
          answers: {},
          templateConfig,
          schemaPath,
          outputPath,
          options: { skipInstall: true },
          utils: {} as unknown,
        });
      }
    }

    // Build context with test answers
    const contextBuilder = new ContextBuilder();
    const context = contextBuilder.build(
      projectName,
      transformedSchema,
      {
        greeting: "Hello, Test!",
        author: "Test Author",
        license: "MIT",
      },
      templateConfig,
      outputPath,
      { skipInstall: true, verbose: false, dryRun: false },
      schemaPath,
    );

    // Generate SDK
    const generator = new Generator(context, templateDir, logger);
    await generator.generate();

    // Verify generated files
    expect(await fs.pathExists(outputPath)).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "src", "helloWorld.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "src", "index.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "README.md"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, ".gitignore"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "tsconfig.json"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "jest.config.json"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, ".eslintrc.json"))).toBe(true);

    // Verify package.json content
    const packageJson = await fs.readJSON(path.join(outputPath, "package.json")) as PackageJson;
    expect(packageJson).toMatchObject({
      name: projectName,
      author: "Test Author",
      license: "MIT",
    });

    // Verify generated TypeScript content
    const helloWorldContent = await fs.readFile(
      path.join(outputPath, "src", "helloWorld.ts"),
      "utf8",
    );
    expect(helloWorldContent).toContain("private greeting: string = 'Hello, Test!'");
    expect(helloWorldContent).toContain("Test Author");
    expect(helloWorldContent).toContain("getSchemaInfo()");
  });

  it("should handle dry-run mode", async () => {
    const projectName = "dry-run-mode-sdk";
    const outputPath = path.join(testOutputDir, projectName);
    // Find the template directory relative to the package root
    const packageRoot = path.resolve(__dirname, "../..");
    const templatePath = path.resolve(packageRoot, "../sdkgen-demo-template");
    const schemaPath = path.join(fixturesDir, "test-schema.json");

    const logger = new Logger(false);
    const templateLoader = new TemplateLoader(logger);
    const { config: templateConfig, templateDir } = await templateLoader.loadTemplate(templatePath);

    const schemaParser = new SchemaParser(logger);
    const schema = await schemaParser.loadSchema(schemaPath);

    const contextBuilder = new ContextBuilder();
    const context = contextBuilder.build(
      projectName,
      schema,
      {
        greeting: "Hello, Dry Run!",
        author: "Dry Run Author",
        license: "MIT",
      },
      templateConfig,
      outputPath,
      { skipInstall: true, verbose: false, dryRun: true },
      schemaPath,
    );

    const generator = new Generator(context, templateDir, logger);
    await generator.generate();

    // In dry-run mode, no files should be created
    expect(await fs.pathExists(outputPath)).toBe(false);
  });

  it("should generate SDK with default template", async () => {
    const projectName = "default-template-sdk";
    const outputPath = path.join(testOutputDir, projectName);
    const templatePath = path.resolve(__dirname, "../../templates/default");

    const logger = new Logger(false);
    const templateLoader = new TemplateLoader(logger);
    const { config: templateConfig, templateDir } = await templateLoader.loadTemplate(templatePath);

    const contextBuilder = new ContextBuilder();
    const context = contextBuilder.build(
      projectName,
      {},
      {
        description: "Default template test SDK",
        author: "Default Author",
      },
      templateConfig,
      outputPath,
      { skipInstall: true, verbose: false, dryRun: false },
    );

    const generator = new Generator(context, templateDir, logger);
    await generator.generate();

    // Verify generated files
    expect(await fs.pathExists(outputPath)).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "src", "index.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, "tsconfig.json"))).toBe(true);
    expect(await fs.pathExists(path.join(outputPath, ".gitignore"))).toBe(true);

    // Verify package.json content
    const packageJson = await fs.readJSON(path.join(outputPath, "package.json")) as PackageJson;
    expect(packageJson).toMatchObject({
      name: projectName,
      description: "Default template test SDK",
      author: "Default Author",
    });
  });
});
