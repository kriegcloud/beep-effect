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
import type { Logger } from "../utils/logger.js";

export class SchemaParser {
  constructor(private readonly logger: Logger) {}

  async loadSchema(schemaPath?: string): Promise<unknown> {
    if (!schemaPath) {
      this.logger.debug("No schema provided");
      return null;
    }

    const resolvedPath = path.resolve(schemaPath);

    if (!await fs.pathExists(resolvedPath)) {
      throw new Error(`Schema path not found: ${resolvedPath}`);
    }

    const stats = await fs.stat(resolvedPath);

    if (stats.isDirectory()) {
      return resolvedPath;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const content = await fs.readFile(resolvedPath, "utf8");

    try {
      if (ext === ".json") {
        return JSON.parse(content);
      } else {
        return resolvedPath;
      }
    } catch (_error) {
      this.logger.debug(`Could not parse as JSON, returning path: ${resolvedPath}`);
      return resolvedPath;
    }
  }
}
