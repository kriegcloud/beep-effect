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
import { irDeployHandler } from "./irDeployHandler.js";
import { irGenModelsHandler } from "./irGenModelsHandler.js";
import { irGenZodHandler } from "./irGenZodHandler.js";

export function registerIrCommands(program: Command): void {
  const irCmd = program
    .command("ir")
    .description("IR (Intermediate Representation) based generation commands");

  irCmd
    .command("zod")
    .description("Generate Zod schemas from IR document schema definitions")
    .requiredOption("-s, --schema <file>", "Path to schema JSON file")
    .requiredOption("-o, --output <file>", "Output file path for generated Zod schemas")
    .option(
      "-t, --type-import-path <path>",
      "Path to import types from (enables satisfies operators)",
    )
    .action(irGenZodHandler);

  irCmd
    .command("models")
    .description("Generate Model constants from IR document schema definitions")
    .requiredOption("-s, --schema <file>", "Path to schema JSON file")
    .requiredOption("-o, --output <file>", "Output file path for generated Model constants")
    .option(
      "-t, --type-import-path <path>",
      "Path to import types from",
      "./types.js",
    )
    .option(
      "--schema-import-path <path>",
      "Path to import schemas from",
      "./schema.js",
    )
    .action(irGenModelsHandler);

  irCmd
    .command("deploy")
    .description("Create a document type on a Foundry stack using an IR document schema")
    .requiredOption("-i, --ir <file>", "Path to IR JSON file")
    .requiredOption("-b, --base-url <url>", "Base URL for Foundry API")
    .requiredOption("-a, --auth <token>", "Authentication token for Foundry API")
    .requiredOption("-p, --parent-folder <rid>", "Parent folder RID for the document type")
    .requiredOption(
      "-f, --file-system-type <type>",
      "File system type for the document type (ARTIFACTS or COMPASS)",
    )
    .action(irDeployHandler);
}
