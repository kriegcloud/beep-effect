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
import type * as _Ontologies from "../_components.js";

//

const _postEdits: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    transactionId: _Ontologies.OntologyTransactionId,
    $body: _Ontologies.PostTransactionEditsRequest,
    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ) => Promise<_Ontologies.PostTransactionEditsResponse>
> = [1, "/v2/ontologies/{0}/transactions/{1}/edits", 3];

/**
 * Applies a set of edits to a transaction in order.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/transactions/{transactionId}/edits
 */
export function postEdits(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    transactionId: _Ontologies.OntologyTransactionId,
    $body: _Ontologies.PostTransactionEditsRequest,
    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ]
): Promise<_Ontologies.PostTransactionEditsResponse> {
  return $foundryPlatformFetch($ctx, _postEdits, ...args);
}
