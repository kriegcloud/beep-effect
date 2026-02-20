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
import { TemplateLoader } from "../core/templateLoader.js";
import { Logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("TemplateLoader", () => {
  const logger = new Logger(false);
  const loader = new TemplateLoader(logger);

  it("should load demo template from local path", async () => {
    // Find the template directory relative to the package root
    const packageRoot = path.resolve(__dirname, "../..");
    const templatePath = path.resolve(packageRoot, "../sdkgen-demo-template");
    const { config, templateDir } = await loader.loadTemplate(templatePath);

    expect(config).toBeDefined();
    expect(config.name).toBe("hello-world-template");
    expect(config.description).toBe("A simple Hello World SDK template");
    expect(config.prompts).toHaveLength(3);
    expect(config.templateFiles).toEqual(["**/*.ejs"]);
    expect(config.staticFiles).toEqual(["_gitignore"]);
    expect(config.hooks).toBeDefined();
    expect(templateDir).toBe(templatePath);
  });

  it("should load default template", async () => {
    const { config, templateDir } = await loader.loadTemplate("default");

    expect(config).toBeDefined();
    expect(config.name).toBe("default-template");
    expect(templateDir).toContain("templates/default");
  });

  it("should throw error for non-existent template", async () => {
    await expect(loader.loadTemplate("/non/existent/template")).rejects.toThrow(
      "Template directory does not exist",
    );
  });

  it("should throw error for template without config", async () => {
    // Create a temporary directory without template.config.js for this test
    const tempDir = path.join(__dirname, "../../build/temp-template");
    const fs = await import("fs-extra");
    await fs.ensureDir(tempDir);

    try {
      await expect(loader.loadTemplate(tempDir)).rejects.toThrow(
        "Template configuration not found",
      );
    } finally {
      await fs.remove(tempDir);
    }
  });
});
