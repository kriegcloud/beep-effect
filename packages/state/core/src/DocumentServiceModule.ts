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

import type { ModuleConfigTuple, ModuleKey, PackAppInternal } from "@palantir/pack.core";
import type { DocumentService } from "./types/DocumentService.js";
import type { WithDocumentServiceInit } from "./types/DocumentServiceConfig.js";

export const DOCUMENT_SERVICE_MODULE_KEY: ModuleKey<
  DocumentService,
  WithDocumentServiceInit
> = {
  key: Symbol("DocumentService"),
  initModule: initDocumentService,
};

export function getDocumentService(app: PackAppInternal): DocumentService {
  return app.getModule(DOCUMENT_SERVICE_MODULE_KEY);
}

export function createDocumentServiceConfig<T>(
  init: (app: PackAppInternal, config: T) => DocumentService,
  config: T,
): ModuleConfigTuple<DocumentService> {
  return [DOCUMENT_SERVICE_MODULE_KEY as ModuleKey<DocumentService>, {
    ...config,
    init,
  } as WithDocumentServiceInit] as const;
}

function initDocumentService(
  app: PackAppInternal,
  config?: WithDocumentServiceInit,
): DocumentService {
  if (config == null) {
    throw new Error(
      "DocumentServiceConfig is required to initialize DocumentService",
    );
  }
  return config.init(app, config);
}
