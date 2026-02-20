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
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createCommand } from "../commands/create.js";
import type { PackageJson } from "./types/testTypes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testOutputDir = path.join(__dirname, "../../test-output", "create-command");

describe("createCommand", () => {
  beforeAll(async () => {
    // Clean up before all tests run
    await fs.remove(testOutputDir);
    await fs.ensureDir(testOutputDir);
  });

  beforeEach(() => {
    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Mock process.exit to prevent tests from exiting
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Process.exit mock needs any type
    vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create SDK with demo template and schema", async () => {
    const projectName = "demo-template-with-schema";
    const outputPath = path.join(testOutputDir, projectName);
    // Find the template directory relative to the package root
    const packageRoot = path.resolve(__dirname, "../..");
    const templatePath = path.resolve(packageRoot, "../sdkgen-demo-template");
    const schemaPath = path.join(__dirname, "fixtures", "test-schema.json");

    // Change to test directory to create project there
    const originalCwd = process.cwd();
    process.chdir(testOutputDir);

    try {
      await createCommand(projectName, {
        template: templatePath,
        schema: schemaPath,
        skipInstall: true,
        verbose: false,
        dryRun: false,
        config: {
          greeting: "Hello from test!",
          author: "Test Suite",
          license: "MIT",
        },
      });

      // Verify the SDK was created
      expect(await fs.pathExists(outputPath)).toBe(true);
      expect(await fs.pathExists(path.join(outputPath, "package.json"))).toBe(true);
      expect(await fs.pathExists(path.join(outputPath, "src", "helloWorld.ts"))).toBe(true);

      // Verify content
      const packageJson = await fs.readJSON(path.join(outputPath, "package.json")) as PackageJson;
      expect(packageJson).toMatchObject({
        name: projectName,
        author: "Test Suite",
      });

      const helloWorldContent = await fs.readFile(
        path.join(outputPath, "src", "helloWorld.ts"),
        "utf8",
      );
      expect(helloWorldContent).toContain("'Hello from test!'");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should create SDK without schema", async () => {
    const projectName = "default-template-no-schema";
    const outputPath = path.join(testOutputDir, projectName);
    const templatePath = path.resolve(__dirname, "../../templates/default");

    const originalCwd = process.cwd();
    process.chdir(testOutputDir);

    try {
      await createCommand(projectName, {
        template: templatePath,
        skipInstall: true,
        verbose: false,
        dryRun: false,
        config: {
          description: "SDK without schema",
          author: "No Schema Author",
        },
      });

      expect(await fs.pathExists(outputPath)).toBe(true);
      expect(await fs.pathExists(path.join(outputPath, "package.json"))).toBe(true);

      const packageJson = await fs.readJSON(path.join(outputPath, "package.json")) as PackageJson;
      expect(packageJson).toMatchObject({
        description: "SDK without schema",
      });
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should handle dry-run mode", async () => {
    const projectName = "dry-run-command-test";
    const outputPath = path.join(testOutputDir, projectName);
    const templatePath = path.resolve(__dirname, "../../templates/default");

    const originalCwd = process.cwd();
    process.chdir(testOutputDir);

    try {
      await createCommand(projectName, {
        template: templatePath,
        skipInstall: true,
        verbose: false,
        dryRun: true,
        config: {
          description: "Dry run SDK",
          author: "Dry Run Author",
        },
      });

      // In dry-run mode, directory should not be created
      expect(await fs.pathExists(outputPath)).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("should fail if directory already exists", async () => {
    const projectName = "existing-directory-test";
    const outputPath = path.join(testOutputDir, projectName);

    // Create the directory first
    await fs.ensureDir(outputPath);

    const originalCwd = process.cwd();
    process.chdir(testOutputDir);

    try {
      await createCommand(projectName, {
        template: "default",
        skipInstall: true,
      });
    } catch (_error) {
      // Error may or may not be thrown
    } finally {
      process.chdir(originalCwd);
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method -- vi.mocked returns safe mock
    expect(vi.mocked(process.exit)).toHaveBeenCalledWith(1);
  });
});
