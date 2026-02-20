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

import type { AppConfig, ModuleConfigTuple } from "@palantir/pack.core";
import type { DocumentService } from "@palantir/pack.state.core";
import { createDemoDocumentServiceConfig } from "@palantir/pack.state.demo";
import { createFoundryDocumentServiceConfig } from "@palantir/pack.state.foundry";

export function getDocumentServiceConfig(
  config: AppConfig,
): ModuleConfigTuple<DocumentService> {
  if (config.isDemoMode) {
    return createDemoDocumentServiceConfig();
  }

  return createFoundryDocumentServiceConfig();
}
