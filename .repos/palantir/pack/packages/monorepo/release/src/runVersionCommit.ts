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

import { exec } from "@actions/exec";
import applyReleasePlan from "@changesets/apply-release-plan";
import assembleReleasePlan from "@changesets/assemble-release-plan";
import { read as readChangesetConfig } from "@changesets/config";
import { readPreState } from "@changesets/pre";
import readChangesets from "@changesets/read";
import type { Config } from "@changesets/types";
import { getPackages } from "@manypkg/get-packages";
import { consola } from "consola";
import { FailedWithUserMessage } from "./FailedWithUserMessage.js";
import * as gitUtils from "./gitUtils.js";
import { packageVersionsOrEmptySet } from "./publishPackages.js";
import { getChangedPackages } from "./util/getChangedPackages.js";
import { getVersionsByDirectory } from "./util/getVersionsByDirectory.js";

export type VersionCommitOptions = {
  cwd?: string;
  commitMessage?: string;
};

function generateVersionDigest(
  changedPackages: Array<{ packageJson: { name: string; version: string; private?: boolean } }>,
  preState: Awaited<ReturnType<typeof readPreState>>,
): string {
  const publicPackages = changedPackages.filter(pkg => !pkg.packageJson.private);
  const privatePackages = changedPackages.filter(pkg => pkg.packageJson.private);

  let message = "Release packages\n";

  if (preState) {
    if (preState.mode === "pre") {
      message = `Release packages (${preState.tag})\n`;
    } else if (preState.mode === "exit") {
      message = `Release packages (exit ${preState.tag})\n`;
    }
  }

  if (publicPackages.length > 0) {
    message += "\nPublic packages:\n";
    for (const pkg of publicPackages) {
      message += `  - ${pkg.packageJson.name}@${pkg.packageJson.version}\n`;
    }
  }

  if (privatePackages.length > 0) {
    message += "\nPrivate packages:\n";
    for (const pkg of privatePackages) {
      message += `  - ${pkg.packageJson.name}@${pkg.packageJson.version}\n`;
    }
  }

  return message.trim();
}

export async function runVersionCommit({
  cwd = process.cwd(),
  commitMessage,
}: VersionCommitOptions): Promise<void> {
  const originalVersionsByDirectory = await getVersionsByDirectory(cwd);

  const packages = await getPackages(cwd);
  const config = await readChangesetConfig(cwd, packages);

  const [changesets, preState] = await Promise.all([
    readChangesets(cwd),
    readPreState(cwd),
  ]);

  const releaseConfig: Config = {
    ...config,
    commit: false, // Never auto-commit, we'll do it ourselves
    changelog: ["@changesets/changelog-git", null],
    ___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH: {
      onlyUpdatePeerDependentsWhenOutOfRange: true,
      updateInternalDependents: "out-of-range",
    },
  };

  const releasePlan = assembleReleasePlan(
    changesets,
    packages,
    releaseConfig,
    preState,
  );

  // Use the branch from environment or default to "main"
  // const branchType = process.env.VERSION_COMMIT_BRANCH_TYPE ?? "main";
  // mutateReleasePlan(cwd, releasePlan, branchType);

  for (const release of releasePlan.releases) {
    const versions = await packageVersionsOrEmptySet(release.name);
    if (versions.has(release.newVersion) && release.type !== "none") {
      throw new FailedWithUserMessage(
        `The version ${release.newVersion} of ${release.name} is already published on npm`,
      );
    }
  }

  const touchedFiles = await applyReleasePlan(
    releasePlan,
    packages,
    releaseConfig,
  );

  if (touchedFiles.length === 0) {
    throw new FailedWithUserMessage(
      "No changesets to apply, aborting",
    );
  }

  // Run pnpm to update lock files
  await exec("pnpm", ["run"], { cwd });

  // Get changed packages for commit message
  const changedPackages = await getChangedPackages(cwd, originalVersionsByDirectory);

  // Generate commit message with version digest
  const finalCommitMessage = commitMessage ?? generateVersionDigest(changedPackages, preState);

  // Create commit if there are changes
  if (!(await gitUtils.checkIfClean())) {
    await gitUtils.commitAll(finalCommitMessage);
    consola.success("Created release commit on current branch");
  } else {
    consola.info("No changes to commit");
  }
}
