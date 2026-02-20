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

export interface DiscretionaryPrincipal_All {
  "type": "all";
}
export interface DiscretionaryPrincipal_UserId {
  "type": "userId";
  "userId": string;
}
export interface DiscretionaryPrincipal_GroupId {
  "groupId": string;
  "type": "groupId";
}

export type DiscretionaryPrincipal =
  | DiscretionaryPrincipal_All
  | DiscretionaryPrincipal_GroupId
  | DiscretionaryPrincipal_UserId;

export interface DocumentSecurityDiscretionary {
  readonly editors?: readonly DiscretionaryPrincipal[];
  readonly owners?: readonly DiscretionaryPrincipal[];
  readonly viewers?: readonly DiscretionaryPrincipal[];
}

export interface DocumentSecurityMandatory {
  readonly classification?: readonly string[];
  readonly markings?: readonly string[];
}

export interface DocumentSecurity {
  readonly discretionary: DocumentSecurityDiscretionary;
  readonly mandatory: DocumentSecurityMandatory;
}

export interface DocumentMetadata {
  readonly createdBy?: string;
  readonly createdTime?: string;
  readonly documentTypeName: string;
  readonly name: string;
  readonly ontologyRid: string;
  readonly security: DocumentSecurity;
  readonly updatedBy?: string;
  readonly updatedTime?: string;
}
