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
import { relative } from "path";

let packageDirectoryCache: Map<string, string> | null = null;

async function initializeCache(): Promise<Map<string, string>> {
  if (packageDirectoryCache != null) {
    return packageDirectoryCache;
  }

  const cwd = process.cwd();
  const { packages, root } = await getPackages(cwd);

  packageDirectoryCache = new Map();
  for (const pkg of packages) {
    const relativePath = relative(root.dir, pkg.dir);
    packageDirectoryCache.set(pkg.packageJson.name as string, relativePath);
  }

  return packageDirectoryCache;
}

/**
 * Returns the directory of the package with the given name.
 * Uses a cached index built from @manypkg/get-packages.
 *
 * @example
 * await getPackPackageDirectory("@palantir/pack.monorepo.release")
 * // => "packages/monorepo/release"
 *
 * @throws {Error} If the package is not found in the workspace
 */
export async function getPackPackageDirectory(
  packageName: string,
): Promise<string> {
  const cache = await initializeCache();
  const directory = cache.get(packageName);

  if (!directory) {
    throw new Error(
      `Package "${packageName}" not found in workspace. Available packages: ${
        Array.from(cache.keys()).join(", ")
      }`,
    );
  }

  return directory;
}
