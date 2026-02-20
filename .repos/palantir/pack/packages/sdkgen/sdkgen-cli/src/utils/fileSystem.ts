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
import { glob } from "glob";
import path from "path";

export async function copyFiles(
  source: string,
  destination: string,
  patterns: readonly string[],
  dryRun: boolean = false,
): Promise<void> {
  // Separate positive and negative patterns
  const includePatterns = patterns.filter(p => !p.startsWith("!"));
  const excludePatterns = patterns
    .filter(p => p.startsWith("!"))
    .map(p => p.slice(1)); // Remove the ! prefix

  for (const pattern of includePatterns) {
    const files = glob.globSync(pattern, {
      cwd: source,
      nodir: true,
      dot: true,
      ignore: excludePatterns,
    });

    for (const file of files) {
      const sourcePath = path.join(source, file);
      // Rename _gitignore to .gitignore during copy
      const destFile = file === "_gitignore" ? ".gitignore" : file;
      const destPath = path.join(destination, destFile);

      if (!dryRun) {
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(sourcePath, destPath);
      }
    }
  }
}

export async function ensureDir(dirPath: string, dryRun: boolean = false): Promise<void> {
  if (!dryRun) {
    await fs.ensureDir(dirPath);
  }
}

export async function writeFile(
  filePath: string,
  content: string,
  dryRun: boolean = false,
): Promise<void> {
  if (!dryRun) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf8");
  }
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

export async function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export async function readJSON(filePath: string): Promise<unknown> {
  return fs.readJSON(filePath);
}

export async function writeJSON(
  filePath: string,
  data: unknown,
  dryRun: boolean = false,
): Promise<void> {
  if (!dryRun) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJSON(filePath, data, { spaces: 2 });
  }
}
