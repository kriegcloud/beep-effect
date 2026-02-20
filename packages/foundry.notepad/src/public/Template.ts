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

import type * as _Core from "@osdk/foundry.core";
import type {
  SharedClient as $OldClient,
  SharedClientContext as $OldClientContext,
} from "@osdk/shared.client";
import type {
  SharedClient as $Client,
  SharedClientContext as $ClientContext,
} from "@osdk/shared.client2";
import type { FoundryPlatformMethod as $FoundryPlatformMethod } from "@osdk/shared.net.platformapi";
import { foundryPlatformFetch as $foundryPlatformFetch } from "@osdk/shared.net.platformapi";
import type * as _Notepad from "../_components.js";

//

const _generate: $FoundryPlatformMethod<
  (
    templateRid: _Notepad.TemplateRid,
    $body: _Notepad.GenerateTemplateRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Notepad.GenerationJobRid>
> = [1, "/v2/notepad/templates/{0}/generate", 3];

/**
 * Creates a new GenerationJob. The template generation job will produce new document content by applying
 * template parameters to an existing template. If the GenerationJob succeeds, the resulting contents can
 * be saved as a new Document or exported to a File.
 *
 * The user must have the api:notepad-write scope to create GenerationJobs. Once created a GenerationJob
 * is only accessible to the user that created it.
 *
 * @alpha
 *
 * Required Scopes: [api:notepad-write]
 * URL: /v2/notepad/templates/{templateRid}/generate
 */
export function generate(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    templateRid: _Notepad.TemplateRid,
    $body: _Notepad.GenerateTemplateRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Notepad.GenerationJobRid> {
  return $foundryPlatformFetch($ctx, _generate, ...args);
}
