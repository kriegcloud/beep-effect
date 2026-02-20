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

import { spawnSync } from "child_process";
import ejs from "ejs";
import { findUp } from "find-up";
import fs from "fs-extra";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import type { GeneratorContext } from "../types/index.js";
import * as fileSystem from "../utils/fileSystem.js";
import type { Logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Generator {
  constructor(
    private context: GeneratorContext,
    private readonly templateDir: string,
    private readonly logger: Logger,
  ) {}

  async generate(): Promise<void> {
    const { outputPath, options } = this.context;

    // Create output directory
    if (!options.dryRun) {
      await fs.ensureDir(outputPath);
    }

    // Run beforeGenerate hook
    await this.runHook("beforeGenerate");

    // Process template files
    await this.processTemplateFiles();

    // Copy static files
    await this.copyStaticFiles();

    // Copy schema directory if provided
    await this.copySchemaDirectory();

    // Run afterGenerate hook
    await this.runHook("afterGenerate");

    // Install dependencies if not skipped
    if (!options.skipInstall && !options.dryRun) {
      await this.installDependencies();
    }

    this.logger.success(`✨ SDK generated successfully at ${outputPath}`);
  }

  private async processTemplateFiles(): Promise<void> {
    const { templateConfig, outputPath, options } = this.context;
    const templateFiles = templateConfig.templateFiles || ["**/*.ejs"];
    const templatePath = path.join(this.templateDir, "template");

    for (const pattern of templateFiles) {
      const files = glob.globSync(pattern, { cwd: templatePath, nodir: true, dot: true });

      for (const file of files) {
        const sourcePath = path.join(templatePath, file);
        const destPath = path.join(outputPath, file.replace(/\.ejs$/, ""));

        this.logger.debug(`Processing template: ${file}`);

        // Read and render template
        const template = await fs.readFile(sourcePath, "utf8");
        const rendered = ejs.render(template, this.context);

        // Write rendered file
        if (!options.dryRun) {
          await fileSystem.writeFile(destPath, rendered);
        } else {
          this.logger.debug(`Would write to: ${destPath}`);
        }
      }
    }
  }

  private async copyStaticFiles(): Promise<void> {
    const { templateConfig, outputPath, options } = this.context;
    const staticFiles = templateConfig.staticFiles || [];
    const templatePath = path.join(this.templateDir, "template");

    if (staticFiles.length === 0) {
      return;
    }

    await fileSystem.copyFiles(templatePath, outputPath, staticFiles, options.dryRun);
  }

  private async copySchemaDirectory(): Promise<void> {
    const { schemaPath, outputPath, options } = this.context;

    if (!schemaPath) {
      return;
    }

    const schemaStats = await fs.stat(schemaPath).catch(() => null);
    if (!schemaStats) {
      return;
    }

    const destSchemaPath = path.join(outputPath, "schema");

    if (schemaStats.isDirectory()) {
      // Copy entire schema directory
      if (!options.dryRun) {
        await fs.ensureDir(destSchemaPath);
        await fs.copy(schemaPath, destSchemaPath);
        this.logger.debug(`Copied schema directory to ${destSchemaPath}`);
      } else {
        this.logger.debug(`Would copy schema directory to ${destSchemaPath}`);
      }
    } else if (schemaStats.isFile()) {
      // Copy single schema file
      if (!options.dryRun) {
        await fs.ensureDir(destSchemaPath);
        const fileName = path.basename(schemaPath);
        await fs.copy(schemaPath, path.join(destSchemaPath, fileName));
        this.logger.debug(`Copied schema file to ${destSchemaPath}`);
      } else {
        this.logger.debug(`Would copy schema file to ${destSchemaPath}`);
      }
    }
  }

  private async runHook(hookName: "beforeGenerate" | "afterGenerate"): Promise<void> {
    const { templateConfig } = this.context;
    const hook = templateConfig.hooks?.[hookName];

    if (!hook) {
      return;
    }

    this.logger.debug(`Running ${hookName} hook`);

    if (typeof hook === "string") {
      // Execute hook as child process
      const hookPath = path.join(this.templateDir, hook);
      if (await fs.pathExists(hookPath)) {
        try {
          // Find the package root by locating package.json
          const packageJsonPath = await findUp("package.json", { cwd: __dirname });
          if (!packageJsonPath) {
            throw new Error("Could not find package.json");
          }

          const packageRoot = path.dirname(packageJsonPath);
          const hookRunnerPath = path.join(packageRoot, "build/esm/core/hookRunner.js");

          if (!await fs.pathExists(hookRunnerPath)) {
            throw new Error(
              `Hook runner not found at ${hookRunnerPath}. `
                + `Please run 'pnpm build' in the sdkgen-cli package.`,
            );
          }

          // Serialize context to JSON
          const contextJson = JSON.stringify(this.context);

          // Run hook as child process in template directory
          // Use spawnSync for better output streaming
          const result = spawnSync(
            "node",
            [hookRunnerPath, hookPath, hookName, contextJson],
            {
              cwd: this.templateDir,
              encoding: "utf8",
              // 'inherit' for stderr allows errors to stream immediately
              // 'pipe' for stdout so we can capture the result for beforeGenerate
              stdio: ["pipe", "pipe", "inherit"],
            },
          );

          if (result.error) {
            throw result.error;
          }

          if (result.status !== 0) {
            throw new Error(`Hook ${hookName} failed with exit code ${result.status}`);
          }

          // Parse result and update context if needed
          if (hookName === "beforeGenerate" && result.stdout) {
            try {
              const updatedContext = JSON.parse(result.stdout) as GeneratorContext;
              this.context = updatedContext;
            } catch {
              // If result is not valid JSON, ignore it
              this.logger.debug("Hook did not return valid JSON, keeping original context");
            }
          }
        } catch (error) {
          this.logger.error(
            `Failed to execute ${hookName} hook: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          throw error;
        }
      } else {
        this.logger.warning(`Hook file not found: ${hookPath}`);
      }
    } else if (typeof hook === "function") {
      // Execute inline hook (for backward compatibility and testing)
      if (hookName === "beforeGenerate") {
        const result = await (hook as (context: GeneratorContext) => Promise<GeneratorContext>)(
          this.context,
        );
        this.context = result;
      } else {
        await (hook as (context: GeneratorContext, outputPath: string) => Promise<void>)(
          this.context,
          this.context.outputPath,
        );
      }
    }
  }

  private async installDependencies(): Promise<void> {
    const { outputPath, projectName } = this.context;

    this.logger.info("Installing dependencies...");

    // Check which package manager to use
    const hasPackageJson = await fs.pathExists(path.join(outputPath, "package.json"));
    if (!hasPackageJson) {
      this.logger.debug("No package.json found, skipping dependency installation");
      return;
    }

    // Detect package manager (simplified - just use npm for now)
    try {
      const result = spawnSync("npm", ["install"], {
        cwd: outputPath,
        stdio: "inherit",
      });

      if (result.status === 0) {
        this.logger.success("Dependencies installed successfully");
      } else {
        throw new Error(`npm install failed with exit code ${result.status}`);
      }
    } catch (_error) {
      this.logger.warning("Failed to install dependencies automatically");
      this.logger.info(`Please run 'npm install' in ${projectName} directory`);
    }
  }
}
