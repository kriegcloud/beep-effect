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

const _get: $FoundryPlatformMethod<
  (
    templateRid: _Notepad.TemplateRid,
    generationJobRid: _Notepad.GenerationJobRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Notepad.GenerationJob>
> = [0, "/v2/notepad/templates/{0}/generationJobs/{1}", 2];

/**
 * Load an existing GenerationJob. This is used to monitor job progress.
 *
 * @alpha
 *
 * Required Scopes: [api:notepad-write]
 * URL: /v2/notepad/templates/{templateRid}/generationJobs/{generationJobRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    templateRid: _Notepad.TemplateRid,
    generationJobRid: _Notepad.GenerationJobRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Notepad.GenerationJob> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _saveDocument: $FoundryPlatformMethod<
  (
    templateRid: _Notepad.TemplateRid,
    generationJobRid: _Notepad.GenerationJobRid,
    $body: _Notepad.SaveDocumentGenerationJobRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Notepad.SaveDocumentResponse>
> = [1, "/v2/notepad/templates/{0}/generationJobs/{1}/saveDocument", 3];

/**
 * Save generated content as a new notepad document. This is only possible if the GenerationJob succeeded.
 *
 * @alpha
 *
 * Required Scopes: [api:notepad-write]
 * URL: /v2/notepad/templates/{templateRid}/generationJobs/{generationJobRid}/saveDocument
 */
export function saveDocument(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    templateRid: _Notepad.TemplateRid,
    generationJobRid: _Notepad.GenerationJobRid,
    $body: _Notepad.SaveDocumentGenerationJobRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Notepad.SaveDocumentResponse> {
  return $foundryPlatformFetch($ctx, _saveDocument, ...args);
}
