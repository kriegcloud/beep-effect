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

import type { Command } from "commander";
import { stepsGenIrHandler } from "./stepsGenIrHandler.js";
import { stepsGenModelsHandler } from "./stepsGenModelsHandler.js";
import { stepsGenTypesHandler } from "./stepsGenTypesHandler.js";
import { stepsGenZodHandler } from "./stepsGenZodHandler.js";

export function registerStepsCommands(program: Command): void {
  const stepsCmd = program
    .command("steps")
    .description("Commands dealing with migration steps and type generation");

  stepsCmd
    .command("types")
    .description("Generate TypeScript definitions from migration step yaml")
    .requiredOption("-i, --input <folder>", "Input folder path for document schemas")
    .requiredOption("-o, --output <file>", "Output file path for generated types")
    .action(stepsGenTypesHandler);

  stepsCmd
    .command("ir")
    .description("Convert migration steps YAML to Palantir IR format")
    .requiredOption("-i, --input <file>", "Input YAML file with migration steps")
    .requiredOption("-o, --output <file>", "Output JSON file for IR format")
    .option("-n, --schema-name <name>", "Override schema name", "Generated Schema")
    .option(
      "-d, --schema-description <desc>",
      "Override schema description",
      "Schema generated from migration steps",
    )
    .option("-v, --version <version>", "Schema version", "1")
    .action(stepsGenIrHandler);

  stepsCmd
    .command("zod")
    .description("Generate Zod schemas from migration steps YAML")
    .requiredOption("-i, --input <file>", "Input YAML file with migration steps")
    .requiredOption("-o, --output <file>", "Output TypeScript file for Zod schemas")
    .option(
      "-t, --type-import-path <path>",
      "Path to import types from (enables satisfies operators)",
    )
    .action(stepsGenZodHandler);

  stepsCmd
    .command("models")
    .description("Generate Model constants from migration steps YAML")
    .requiredOption("-i, --input <file>", "Input YAML file with migration steps")
    .requiredOption("-o, --output <file>", "Output TypeScript file for Model constants")
    .option(
      "-t, --type-import-path <path>",
      "Path to import types from",
      "./types.js",
    )
    .option(
      "-s, --schema-import-path <path>",
      "Path to import schemas from",
      "./schema.js",
    )
    .action(stepsGenModelsHandler);
}
