/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

import type { ReleasePlan } from "@changesets/types";
import chalk from "chalk";
import * as path from "node:path";
import { inc } from "semver";
import { FailedWithUserMessage } from "./FailedWithUserMessage.js";

/**
 * Mutates a release plan to enforce branching model constraints.
 *
 * This function implements a branching strategy that prevents version collisions
 * between main and release branches by enforcing different bump rules:
 *
 * - **Main branch**: All patch bumps are upgraded to minor bumps. This ensures
 *   main always increments the minor version, leaving patch versions for stable
 *   release branches.
 *
 * - **Release branches**: Only patch and none bumps are allowed. Any minor or
 *   major bumps will throw an error. This ensures stable branches only receive
 *   bug fixes, not new features.
 *
 * - **All branches**: Major version bumps are never allowed and will throw an
 *   error, requiring explicit human intervention.
 *
 * @param cwd - The current working directory (used for error message paths)
 * @param releasePlan - The release plan to mutate (modified in place)
 * @param releaseType - Whether this is "main" or "release branch"
 *
 * @throws {FailedWithUserMessage} If major bumps are detected, or if non-patch
 *   bumps are detected on a release branch
 *
 * @example
 * // On main branch, patch -> minor
 * // changeset has patch bump for pkg@1.2.3
 * mutateReleasePlan(cwd, plan, "main");
 * // pkg will be bumped to 1.3.0 instead of 1.2.4
 *
 * @example
 * // On release branch, only patches allowed
 * // changeset has minor bump
 * mutateReleasePlan(cwd, plan, "release branch");
 * // throws error listing the problematic changesets
 */
export function mutateReleasePlan(
  cwd: string,
  releasePlan: ReleasePlan,
  releaseType: "release branch" | "main",
): void {
  let bulkErrorMsg = "";
  for (const changeSet of releasePlan.changesets) {
    let errorStarted = false;
    for (const release of changeSet.releases) {
      if (releaseType === "main" && release.type === "patch") {
        release.type = "minor";
      } else if (
        releaseType === "release branch" && (release.type !== "patch")
        && (release.type !== "none")
      ) {
        if (!errorStarted) {
          bulkErrorMsg = `\n${
            chalk.cyan(
              path.relative(
                cwd,
                `${path.join(cwd, ".changeset", changeSet.id)}.md`,
              ),
            )
          }:\n`;
          errorStarted = true;
        }
        bulkErrorMsg += `  - ${chalk.red(`${release.name}: ${release.type}`)}\n`;
      }

      if (release.type === "major") {
        throw new FailedWithUserMessage(
          `Major changes are not allowed without explicit human intervention.`,
        );
      }
    }
  }

  if (bulkErrorMsg.length > 0) {
    throw new FailedWithUserMessage(
      `Unable to create a release for the stable branch.\n\n`
        + `Our branching model requires that we only release patch changes on a stable branch `
        + `to avoid version number collisions with main and the other release branches. `
        + `Problems:\n${bulkErrorMsg}`,
    );
  }

  for (const q of releasePlan.releases) {
    if (releaseType === "main" && q.type === "patch") {
      q.type = "minor";
      const suffix = q.newVersion.split("-")[1];
      q.newVersion = inc(q.oldVersion, "minor")!;
      if (suffix) {
        // restore suffix
        q.newVersion += `-${suffix}`;
      }
    }
  }
}
