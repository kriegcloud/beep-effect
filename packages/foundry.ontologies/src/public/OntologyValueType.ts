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

const _get: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    valueType: _Ontologies.ValueTypeApiName,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Ontologies.OntologyValueType>
> = [0, "/v2/ontologies/{0}/valueTypes/{1}", 2];

/**
 * Gets a specific value type with the given API name.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/valueTypes/{valueType}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    valueType: _Ontologies.ValueTypeApiName,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Ontologies.OntologyValueType> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _list: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Ontologies.ListOntologyValueTypesResponse>
> = [0, "/v2/ontologies/{0}/valueTypes", 2];

/**
 * Lists the latest versions of the value types for the given Ontology.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/valueTypes
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Ontologies.ListOntologyValueTypesResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}
