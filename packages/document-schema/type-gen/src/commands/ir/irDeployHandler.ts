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

import { createPlatformClient } from "@osdk/client";
import type { CreateDocumentTypeRequest } from "@osdk/foundry.pack";
import { DocumentTypes } from "@osdk/foundry.pack";
import { CommanderError } from "commander";
import { consola } from "consola";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { IRealTimeDocumentSchema } from "../../lib/pack-docschema-api/pack-docschema-ir/index.js";

type FileSystemType = "ARTIFACTS" | "COMPASS";

interface DeployOptions {
  readonly ir: string;
  readonly baseUrl: string;
  readonly auth: string;
  readonly parentFolder: string;
  readonly fileSystemType: FileSystemType;
}

export async function irDeployHandler(options: DeployOptions): Promise<void> {
  try {
    const irPath = resolve(options.ir);

    consola.info(`Reading schema from: ${irPath}`);

    const irContent = readFileSync(irPath, "utf8");

    // TODO: conjureToZod based validation that IR content matches the conjure IR shape
    const ir = JSON.parse(irContent) as IRealTimeDocumentSchema;

    const osdkClient = createPlatformClient(
      options.baseUrl,
      () => Promise.resolve(options.auth),
    );

    const request: CreateDocumentTypeRequest = {
      name: ir.name,
      parentFolderRid: options.parentFolder,
    };

    if (options.fileSystemType != null) {
      request.fileSystemType = options.fileSystemType;
    }

    // PACK BE does not yet support storing schemas...
    consola.warn("Creating document type without schema information", request);

    await DocumentTypes.create(osdkClient, request, { preview: true });
  } catch (error) {
    consola.error("❌ Error during Deploy:", error);
    throw new CommanderError(1, "ERRIRMDEPLOY", "Error deploying IR document schema");
  }
}
