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
import type * as _LanguageModels from "../_components.js";

//

const _embeddings: $FoundryPlatformMethod<
  (
    openAiModelModelId: _LanguageModels.LanguageModelApiName,
    $body: _LanguageModels.OpenAiEmbeddingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
    $headerParams?: { attribution?: _Core.Attribution | undefined },
  ) => Promise<_LanguageModels.OpenAiEmbeddingsResponse>
> = [1, "/v2/languageModels/openAi/{0}/embeddings", 7];

/**
 * @alpha
 *
 * Required Scopes: [api:language-models-execute]
 * URL: /v2/languageModels/openAi/{openAiModelModelId}/embeddings
 */
export function embeddings(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    openAiModelModelId: _LanguageModels.LanguageModelApiName,
    $body: _LanguageModels.OpenAiEmbeddingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
    $headerParams?: { attribution?: _Core.Attribution | undefined },
  ]
): Promise<_LanguageModels.OpenAiEmbeddingsResponse> {
  return $foundryPlatformFetch($ctx, _embeddings, ...args);
}
