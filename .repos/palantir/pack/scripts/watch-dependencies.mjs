#!/usr/bin/env node
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

/* eslint-disable no-console */

import chokidar from "chokidar";
import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

//
// This script exists to execute chokidar based file watching on targeted packages.
// Ideally turbo watch would be sufficient, but it cannot cope with certain mac
// filesystem configurations so this should be a more robust alternative.
//
// When https://github.com/vercel/turborepo/issues/9536 is resolved we can hopefully
// just swap out to using `turbo watch --filter=...` directly.
//

const filter = process.argv[2];

if (!filter) {
  console.error("Error: Package filter required");
  console.error("Usage: node watch-dependencies.mjs <package-filter>");
  console.error("Example: node watch-dependencies.mjs '@demo/canvas.app^...'");
  process.exit(1);
}

console.log(`Watching dependencies for filter: ${filter}`);

// Get list of packages from turbo
let dryRunOutput;
try {
  dryRunOutput = execSync(
    `pnpm --silent turbo build --filter="${filter}" --dry-run=json`,
    { encoding: "utf-8" },
  );
} catch (error) {
  console.error("Error: Failed to get package list from turbo");
  process.exit(1);
}

const dryRun = JSON.parse(dryRunOutput);
const packages = dryRun.packages.filter(pkg => pkg !== "//");

if (packages.length === 0) {
  console.error(`Error: No packages found for filter: ${filter}`);
  process.exit(1);
}

console.log("Packages in scope:");
packages.forEach(pkg => console.log(`  - ${pkg}`));

// Find src directories for each package
const watchPaths = [];
for (const pkg of packages) {
  // Search workspace for package.json matching this package name
  const dirs = ["packages", "demos"];
  for (const dir of dirs) {
    try {
      const findOutput = execSync(
        `find ${dir} -type f -name "package.json" 2>/dev/null || true`,
        { encoding: "utf-8" },
      );

      for (const pkgJsonPath of findOutput.split("\n").filter(Boolean)) {
        const pkgJsonContent = execSync(`cat "${pkgJsonPath}"`, {
          encoding: "utf-8",
        });
        if (pkgJsonContent.includes(`"name": "${pkg}"`)) {
          const pkgDir = pkgJsonPath.replace(/\/package\.json$/, "");
          const srcDir = join(pkgDir, "src");
          if (existsSync(srcDir)) {
            watchPaths.push(srcDir);
          }
          break;
        }
      }
    } catch {
      // Ignore errors from find/cat
    }
  }
}

if (watchPaths.length === 0) {
  console.error("Error: No src directories found to watch");
  process.exit(1);
}

console.log("\nWatch paths:");
watchPaths.forEach(path => console.log(`  - ${path}`));
console.log("");

// Track if a build is currently running
let buildRunning = false;
let buildQueued = false;
let currentBuildProcess = null;

function runBuild() {
  if (buildRunning) {
    buildQueued = true;
    return;
  }

  buildRunning = true;
  console.log("Changes detected, rebuilding...");

  const build = spawn(
    "pnpm",
    ["--silent", "turbo", "build", `--filter=${filter}`],
    { stdio: "inherit" },
  );

  currentBuildProcess = build;

  build.on("close", code => {
    buildRunning = false;
    currentBuildProcess = null;
    if (code !== 0) {
      console.error(`Build failed with code ${code}`);
    }

    if (buildQueued) {
      buildQueued = false;
      runBuild();
    }
  });
}

// Initial build
runBuild();

// Watch for changes
const watcher = chokidar.watch(watchPaths, {
  ignoreInitial: true,
  persistent: true,
});

watcher.on("all", (event, path) => {
  console.log(`[${event}] ${path}`);
  runBuild();
});

// Handle cleanup on exit signals
function cleanup(signal) {
  console.log(`\nReceived ${signal}, shutting down watch-dependencies...`);

  // Close the file watcher
  watcher.close();

  // Kill any running build process
  if (currentBuildProcess && !currentBuildProcess.killed) {
    console.log("Terminating running build process...");
    currentBuildProcess.kill("SIGTERM");

    // Give it a moment to clean up, then force kill if needed
    const killTimer = setTimeout(() => {
      if (currentBuildProcess && !currentBuildProcess.killed) {
        console.log("Force killing build process...");
        currentBuildProcess.kill("SIGKILL");
      }
      process.exit(0);
    }, 1000);

    // If process exits cleanly, clear the timer and exit
    currentBuildProcess.once("exit", () => {
      clearTimeout(killTimer);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", () => cleanup("SIGINT"));
process.on("SIGTERM", () => cleanup("SIGTERM"));

console.log("Watching for changes...");
