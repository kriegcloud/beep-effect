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

const _list: $FoundryPlatformMethod<
  () => Promise<_Ontologies.ListOntologiesV2Response>
> = [0, "/v2/ontologies"];

/**
 * Lists the Ontologies visible to the current user.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: []
): Promise<_Ontologies.ListOntologiesV2Response> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (ontology: _Ontologies.OntologyIdentifier) => Promise<_Ontologies.OntologyV2>
> = [0, "/v2/ontologies/{0}"];

/**
 * Gets a specific ontology for a given Ontology API name or RID.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [ontology: _Ontologies.OntologyIdentifier]
): Promise<_Ontologies.OntologyV2> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getFullMetadata: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ) => Promise<_Ontologies.OntologyFullMetadata>
> = [0, "/v2/ontologies/{0}/fullMetadata", 2];

/**
 * Get the full Ontology metadata. This includes the objects, links, actions, queries, and interfaces.
 * This endpoint is designed to return as much metadata as possible in a single request to support OSDK workflows.
 * It may omit certain entities rather than fail the request.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/fullMetadata
 */
export function getFullMetadata(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,

    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ]
): Promise<_Ontologies.OntologyFullMetadata> {
  return $foundryPlatformFetch($ctx, _getFullMetadata, ...args);
}

const _loadMetadata: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadOntologyMetadataRequest,
    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ) => Promise<_Ontologies.OntologyFullMetadata>
> = [1, "/v2/ontologies/{0}/metadata", 3];

/**
 * Load Ontology metadata for the requested object, link, action, query, and interface types.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/metadata
 */
export function loadMetadata(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadOntologyMetadataRequest,
    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ]
): Promise<_Ontologies.OntologyFullMetadata> {
  return $foundryPlatformFetch($ctx, _loadMetadata, ...args);
}
