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

import { Command } from "commander";
import { createCommand } from "./commands/create.js";

export function cli(args: string[]): void {
  const program = new Command();

  program
    .name("sdkgen")
    .description("Generate TypeScript/JavaScript SDKs from schema definitions")
    .version("0.0.1");

  program
    .command("create <project-name>")
    .description("Create a new SDK project")
    .option("-t, --template <template>", "template to use", "default")
    .option("-s, --schema <path>", "path to schema file")
    .option("--skip-install", "skip dependency installation")
    .option("--verbose", "enable verbose logging")
    .option("--dry-run", "preview without writing files")
    .option("--non-interactive", "run in non-interactive mode using defaults")
    .option("--config <path>", "path to JSON config file with template configuration")
    .option("--overwrite", "overwrite existing directory")
    .action(createCommand);

  program.parse(args);
}
