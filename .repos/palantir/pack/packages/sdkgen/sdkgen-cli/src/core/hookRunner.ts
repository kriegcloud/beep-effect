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

/**
 * Hook runner script that executes template hooks in a child process.
 * This ensures hooks run with the template's Node context and dependencies.
 */

import consola from "consola";
import { pathToFileURL } from "url";
import type { GeneratorContext } from "../types/index.js";

async function runHook(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    consola.error("Usage: hookRunner <hookPath> <hookName> <contextJson>");
    process.exit(1);
  }

  const [hookPath, hookName, contextJson] = args;
  try {
    // Parse the context
    const context = JSON.parse(contextJson!) as GeneratorContext;

    // Import and execute the hook
    const hookUrl = pathToFileURL(hookPath!).href;
    const { default: hookFn } = await import(hookUrl) as {
      default: (
        context: GeneratorContext,
        outputPath?: string,
      ) => Promise<GeneratorContext | undefined>;
    };

    // Run the hook
    let result;
    if (hookName === "beforeGenerate") {
      result = await hookFn(context);
    } else {
      // afterGenerate receives outputPath as second argument
      result = await hookFn(context, context.outputPath);
    }

    // Return the result as JSON to stdout
    if (result !== undefined) {
      process.stdout.write(JSON.stringify(result));
    }

    process.exit(0);
  } catch (error) {
    consola.error("Hook execution failed:", error);
    process.exit(1);
  }
}

// Run if this is the main module
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runHook().catch((error: unknown) => {
    consola.error("Unexpected error:", error);
    process.exit(1);
  });
}
