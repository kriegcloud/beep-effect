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

import { getPackages } from "@manypkg/get-packages";
import fs from "node:fs";
import path from "node:path";
import * as semver from "semver";

interface PackageUpdate {
  packageJsonPath: string;
  packageJson: Record<string, unknown>;
  packageName: string;
  initialVersion: string;
  newVersion: string;
  changesetFileName: string;
  changesetFilePath: string;
  changesetContent: string;
}

export async function simulateMinorBump(): Promise<void> {
  const cwd = process.cwd();

  const changesetsDir = path.join(cwd, "./.changeset");
  const preJsonPath = path.join(changesetsDir, "pre.json");

  const preJson = JSON.parse(fs.readFileSync(preJsonPath, "utf-8"));
  const changeSetFilesToKeep = ["README.md", "config.json", "pre.json"];
  fs.readdirSync(changesetsDir).forEach(changesetFile => {
    if (!changeSetFilesToKeep.includes(changesetFile)) {
      fs.rmSync(path.join(changesetsDir, changesetFile));
    }
  });

  // Remove all old changesets that would have been deleted after minor release was cut
  preJson.changesets = [];

  const { packages } = await getPackages(cwd);

  // Validate and collect all package updates first
  const packageUpdates: PackageUpdate[] = packages.map(pkg => {
    const packageJsonPath = path.join(pkg.dir, "package.json");
    const packageJson = pkg.packageJson;
    const packageName = packageJson.name as string;

    let version = packageJson.version as string;

    // Remove beta tag, if any
    if (version && semver.prerelease(version)) {
      const coercedVersion = semver.coerce(version)?.version;
      if (!coercedVersion) {
        throw new Error(
          `Failed to coerce version "${version}" for package "${packageName}"`,
        );
      }
      version = coercedVersion;
    }

    // Increment minor version and add a beta tag
    const incrementedVersion = semver.inc(version, "minor");
    if (!incrementedVersion) {
      throw new Error(
        `Failed to increment version "${version}" for package "${packageName}"`,
      );
    }
    const newVersion = incrementedVersion + "-beta.1";

    // Prepare changeset file information
    const changesetFileName = `${packageName.replace("/", "-")}-simulatedRelease`;
    const changesetFilePath = path.join(
      changesetsDir,
      changesetFileName + ".md",
    );
    const changesetContent = `---
"${packageName}": patch
---

Simulated release
      `;

    return {
      packageJsonPath,
      packageJson,
      packageName,
      initialVersion: version,
      newVersion,
      changesetFileName,
      changesetFilePath,
      changesetContent,
    };
  });

  // All validations passed, now write all files
  packageUpdates.forEach(update => {
    // Update preJson initial versions
    preJson.initialVersions[update.packageName] = update.initialVersion;

    // Update package.json
    update.packageJson.version = update.newVersion;
    fs.writeFileSync(
      update.packageJsonPath,
      JSON.stringify(update.packageJson, null, 2) + "\n",
    );

    // Add to preJson changesets
    preJson.changesets.push(update.changesetFileName);

    // Write changeset file
    fs.writeFileSync(update.changesetFilePath, update.changesetContent);
  });

  // Write updated preJson
  fs.writeFileSync(preJsonPath, JSON.stringify(preJson, null, 2) + "\n");
}
