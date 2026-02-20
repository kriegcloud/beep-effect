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

import { findUp } from "find-up";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { TemplateConfig } from "../types/index.js";
import type { Logger } from "../utils/logger.js";

export class TemplateLoader {
  constructor(private readonly logger: Logger) {}

  async loadTemplate(templatePath: string): Promise<{
    config: TemplateConfig;
    templateDir: string;
  }> {
    let resolvedPath: string;

    // Check if it's a local path
    if (templatePath.startsWith(".") || templatePath.startsWith("/")) {
      resolvedPath = path.resolve(templatePath);
      this.logger.debug(`Loading local template from: ${resolvedPath}`);
    } else if (templatePath === "default") {
      // Use built-in default template
      // Find package root by looking for package.json
      const currentFile = import.meta.url.replace("file://", "");
      const packageRoot = await this.findPackageRoot(path.dirname(currentFile));
      resolvedPath = path.join(packageRoot, "templates/default");
      this.logger.debug(`Loading built-in default template`);
    } else {
      // Try to resolve as an npm package
      try {
        const packagePath = await this.resolveNodeModule(templatePath);
        resolvedPath = packagePath;
        this.logger.debug(`Loading npm template: ${templatePath}`);
      } catch {
        throw new Error(`Template not found: ${templatePath}`);
      }
    }

    // Check if template directory exists
    if (!await fs.pathExists(resolvedPath)) {
      throw new Error(`Template directory does not exist: ${resolvedPath}`);
    }

    // Load template configuration
    const configPath = path.join(resolvedPath, "template.config.js");
    if (!await fs.pathExists(configPath)) {
      throw new Error(`Template configuration not found: ${configPath}`);
    }

    const configUrl = pathToFileURL(configPath).href;
    const { default: config } = await import(configUrl) as { default: TemplateConfig };

    return {
      config,
      templateDir: resolvedPath,
    };
  }

  private async findPackageRoot(startDir: string): Promise<string> {
    const packageJsonPath = await findUp(
      "package.json",
      { cwd: startDir },
    );

    if (!packageJsonPath) {
      throw new Error("Could not find package.json");
    }

    return path.dirname(packageJsonPath);
  }

  private async resolveNodeModule(moduleName: string): Promise<string> {
    try {
      const modulePath = import.meta.resolve(moduleName);

      const packageJsonPath = await findUp(
        async directory => {
          const pkgPath = path.join(directory, "package.json");
          try {
            const pkg = await fs.readJson(pkgPath) as { name?: string };
            if (pkg.name === moduleName) {
              return pkgPath;
            }
          } catch {
            return undefined;
          }
          return undefined;
        },
        { cwd: fileURLToPath(modulePath) },
      );

      if (packageJsonPath) {
        return path.dirname(packageJsonPath);
      }

      throw new Error(`Package root not found for: ${moduleName}`);
    } catch (error) {
      this.logger.debug(
        `Failed to resolve via require.resolve: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      const modulePath = path.join(process.cwd(), "node_modules", moduleName);
      if (await fs.pathExists(modulePath)) {
        return modulePath;
      }
    }

    throw new Error(`Cannot resolve module: ${moduleName}`);
  }
}
