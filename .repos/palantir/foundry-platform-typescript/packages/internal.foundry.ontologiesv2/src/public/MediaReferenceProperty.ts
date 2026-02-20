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

import type * as _Core from "@osdk/internal.foundry.core";
import type * as _Ontologies from "@osdk/internal.foundry.ontologies";
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

//

const _getMediaContent: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<Response>
> = [0, "/v2/ontologies/{0}/objects/{1}/{2}/media/{3}/content", 2, , "*/*"];

/**
 * Gets the content of a media item referenced by this property.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scopes: `api:ontologies-read`.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/media/{property}/content
 */
export function getMediaContent(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,

    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<Response> {
  return $foundryPlatformFetch($ctx, _getMediaContent, ...args);
}

const _getMediaMetadata: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Ontologies.MediaMetadata>
> = [0, "/v2/ontologies/{0}/objects/{1}/{2}/media/{3}/metadata", 2];

/**
 * Gets metadata about the media item referenced by this property.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scopes: `api:ontologies-read`.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/media/{property}/metadata
 */
export function getMediaMetadata(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,

    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Ontologies.MediaMetadata> {
  return $foundryPlatformFetch($ctx, _getMediaMetadata, ...args);
}

const _upload: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    property: _Ontologies.PropertyApiName,
    $body: Blob,
    $queryParams?: {
      mediaItemPath?: _Core.MediaItemPath | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Core.MediaReference>
> = [1, "/v2/ontologies/{0}/objectTypes/{1}/media/{2}/upload", 3, "*/*"];

/**
 * Uploads a media item to the media set which backs the specified property.  The property must be backed by a single media set and branch, otherwise an error will be thrown.
 * The body of the request must contain the binary content of the file and the `Content-Type` header must be `application/octet-stream`.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scopes: `api:ontologies-read api:ontologies-write`.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v2/ontologies/{ontology}/objectTypes/{objectType}/media/{property}/upload
 */
export function upload(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    property: _Ontologies.PropertyApiName,
    $body: Blob,
    $queryParams?: {
      mediaItemPath?: _Core.MediaItemPath | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Core.MediaReference> {
  return $foundryPlatformFetch($ctx, _upload, ...args);
}
