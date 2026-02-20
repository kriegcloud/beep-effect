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
import type * as _Filesystem from "@osdk/foundry.filesystem";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Activity event broadcast to all clients after being applied on server.
 *
 * Log Safety: UNSAFE
 */
export type ActivityCollaborativeUpdate =
  | ({ type: "activityDeleted" } & ActivityDeleted)
  | ({ type: "activityCreated" } & ActivityCreated);

/**
   * The event that gets published to PACK channels to update a users activity feed as new events
are added to a particular resource.
   *
   * Log Safety: UNSAFE
   */
export interface ActivityCreated {
  activityEvent: ActivityEvent;
}

/**
   * The event that gets published to PACK channels to update a users activity feed whenever an event
is removed from a particular resource.
   *
   * Log Safety: UNSAFE
   */
export interface ActivityDeleted {
  eventId: EventId;
  aggregationKey?: string;
}

/**
 * A single activity event associated with a particular artifact.
 *
 * Log Safety: UNSAFE
 */
export interface ActivityEvent {
  eventId: EventId;
  eventType: string;
  eventData: VersionedEventData;
  isRead: boolean;
  aggregationKey: string;
  createdBy: _Core.CreatedBy;
  createdTime: _Core.CreatedTime;
}

/**
   * An empty type representing all users in the system. Useful for expressing
operations that should be allowed by what is typically the 'Everyone' group,
or for expressing that anyone who satisfies Mandatory security is granted
discretionary access.
   *
   * Log Safety: SAFE
   */
export interface AllPrincipal {}

/**
 * Log Safety: SAFE
 */
export type ClientId = string;

/**
 * Log Safety: UNSAFE
 */
export interface CreateDocumentRequest {
  parentFolderRid?: _Filesystem.FolderRid;
  security: DocumentSecurity;
  ontologyRid: DocumentOntologyRid;
  name: DocumentName;
  description?: string;
  documentTypeName: DocumentTypeName;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateDocumentTypeRequest {
  parentFolderRid: _Filesystem.FolderRid;
  name: DocumentTypeName;
  fileSystemType?: FileSystemType;
}

/**
 * Log Safety: UNSAFE
 */
export interface CustomPresenceEvent {
  userId: _Core.UserId;
  clientId: ClientId;
  eventData: any;
  eventType: string;
  isEphemeral?: boolean;
}

/**
   * Union of all security principals usable within disjunctive security conditions.
These principals are used to grant additional role access beyond mandatory security.
This includes the special 'all' principal, which grants access to any users who meet mandatory
for a given discretionary role.
   *
   * Log Safety: SAFE
   */
export type DiscretionaryPrincipal =
  | ({ type: "all" } & AllPrincipal)
  | ({ type: "groupId" } & DiscretionaryPrincipalGroupId)
  | ({ type: "userId" } & DiscretionaryPrincipalUserId);

/**
 * Log Safety: SAFE
 */
export interface DiscretionaryPrincipalGroupId {
  groupId: _Core.GroupId;
}

/**
 * Log Safety: SAFE
 */
export interface DiscretionaryPrincipalUserId {
  userId: _Core.UserId;
}

/**
 * Log Safety: UNSAFE
 */
export interface Document {
  id: DocumentRid;
  documentTypeName: DocumentTypeName;
  ontologyRid: DocumentOntologyRid;
  name: DocumentName;
  description?: string;
  parentFolderRid?: _Filesystem.FolderRid;
  security: DocumentSecurity;
  createdBy: _Core.CreatedBy;
  createdTime: _Core.CreatedTime;
  updatedBy: _Core.UpdatedBy;
  updatedTime: _Core.UpdatedTime;
}

/**
 * Log Safety: SAFE
 */
export interface DocumentDiscretionarySecurity {
  owners: Array<DiscretionaryPrincipal>;
  editors: Array<DiscretionaryPrincipal>;
  viewers: Array<DiscretionaryPrincipal>;
}

/**
 * Log Safety: UNSAFE
 */
export interface DocumentEditDescription {
  eventData: VersionedEventData;
  eventType: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface DocumentMandatorySecurity {
  classification: Array<MarkingPrincipal>;
  markings: Array<MarkingId>;
}

/**
 * Log Safety: UNSAFE
 */
export type DocumentName = LooselyBrandedString<"DocumentName">;

/**
 * Log Safety: SAFE
 */
export type DocumentOntologyRid = LooselyBrandedString<"DocumentOntologyRid">;

/**
   * Sent when a user's presence changes on a document. That is, sent when a user opens or closes the document.
Note that just because a user is not present on a particular document does not mean that they are overall
"offline" -- they may have other documents or non-document applications open in the platform.
   *
   * Log Safety: SAFE
   */
export interface DocumentPresenceChangeEvent {
  userId: _Core.UserId;
  status: UserPresence;
}

/**
 * Update sent by client to apply to internal Y.Doc on server.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentPublishMessage {
  yjsUpdate: YjsUpdate;
  editId: EditId;
  clientId: ClientId;
  description?: DocumentEditDescription;
}

/**
 * Identifier for an PACK Document.
 *
 * Log Safety: SAFE
 */
export type DocumentRid = LooselyBrandedString<"DocumentRid">;

/**
 * Filter criteria for document search.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentSearchQuery {
  documentName?: string;
}

/**
 * Request body for searching documents.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentSearchRequest {
  query?: DocumentSearchQuery;
  orderBy?: DocumentSort;
  pageSize?: _Core.PageSize;
  pageToken?: PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface DocumentSearchResponse {
  data: Array<Document>;
  nextPageToken?: PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface DocumentSecurity {
  mandatory: DocumentMandatorySecurity;
  discretionary: DocumentDiscretionarySecurity;
}

/**
 * Sorting specification for document search.
 *
 * Log Safety: SAFE
 */
export interface DocumentSort {
  field: DocumentSortField;
  direction: _Core.OrderByDirection;
}

/**
 * The field to sort documents by.
 *
 * Log Safety: SAFE
 */
export type DocumentSortField =
  | "NAME"
  | "CREATED_TIME"
  | "LAST_MODIFIED_TIME"
  | "LAST_VIEW_TIME";

/**
 * Log Safety: UNSAFE
 */
export interface DocumentType {
  rid: DocumentTypeRid;
  name: DocumentTypeName;
  parentFolderRid: _Filesystem.FolderRid;
  fileSystemType?: FileSystemType;
}

/**
   * The configured name for a DocumentType. This is unique within an ontology but not
globally unique.
   *
   * Log Safety: UNSAFE
   */
export type DocumentTypeName = LooselyBrandedString<"DocumentTypeName">;

/**
 * Identifier for an PACK Document Type.
 *
 * Log Safety: SAFE
 */
export type DocumentTypeRid = LooselyBrandedString<"DocumentTypeRid">;

/**
 * Update broadcast to all clients after being applied on server.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentUpdate {
  update?: YjsUpdate;
  clientId: ClientId;
  revisionId: RevisionId;
  baseRevisionId: RevisionId;
  editIds: Array<EditId>;
}

/**
 * Union type to allow broadcasting different collaborative message types.
 *
 * Log Safety: UNSAFE
 */
export type DocumentUpdateMessage =
  | ({ type: "update" } & DocumentUpdate)
  | ({ type: "error" } & ErrorMessage);

/**
   * A request from client to subscribe to a document's collaborative updates,
required on a subscription request to /documents/{documentId}/updates
   *
   * Log Safety: SAFE
   */
export interface DocumentUpdateSubscriptionRequest {
  clientId: ClientId;
  lastRevisionId?: RevisionId;
}

/**
 * A unique identifier for an edit to an AppKit Document.
 *
 * Log Safety: SAFE
 */
export type EditId = LooselyBrandedString<"EditId">;

/**
 * Log Safety: SAFE
 */
export type ErrorCode = "INTERNAL_ERROR" | "REVISION_TOO_OLD";

/**
   * Message sent to clients when an error occurs. The subscription may not remain in a valid state after this
message and should be reopened.
   *
   * Log Safety: SAFE
   */
export interface ErrorMessage {
  code: ErrorCode;
  errorInstanceId: string;
  args: Record<string, string>;
}

/**
 * A unique identifier for this activity event.
 *
 * Log Safety: UNSAFE
 */
export type EventId = LooselyBrandedString<"EventId">;

/**
   * The file system backing storage for documents of this type. Documents can currently be stored in
Gotham Artifacts or in Compass.
   *
   * Log Safety: SAFE
   */
export type FileSystemType = "ARTIFACTS" | "COMPASS";

/**
 * The unique resource identifier (RID) of a Folder.
 *
 * Log Safety: SAFE
 */
export type FolderRid = LooselyBrandedString<"FolderRid">;

/**
 * A Foundry Group ID.
 *
 * Log Safety: SAFE
 */
export type GroupId = string;

/**
 * A UUID representing a Mandatory Marking.
 *
 * Log Safety: SAFE
 */
export type MarkingId = string;

/**
 * A portion marking used by CBAC (Classification based access control).
 *
 * Log Safety: UNSAFE
 */
export type MarkingPrincipal = LooselyBrandedString<"MarkingPrincipal">;

/**
   * The page token indicates where to start paging. This should be omitted from the first page's request.
To fetch the next page, clients should take the value from the nextPageToken field of the previous response
and use it to populate the pageToken field of the next request.
api-gateway's Core.PageToken is an immutable @Unsafe String, which is incompatible with PACK Document search.
This is a PACK API specific PageToken that is @Safe.
   *
   * Log Safety: SAFE
   */
export type PageToken = LooselyBrandedString<"PageToken">;

/**
 * Log Safety: UNSAFE
 */
export type PresenceCollaborativeUpdate =
  | ({ type: "presenceChangeEvent" } & DocumentPresenceChangeEvent)
  | ({ type: "customPresenceEvent" } & CustomPresenceEvent);

/**
 * Log Safety: UNSAFE
 */
export type PresencePublishMessage = { type: "custom" } & CustomPresenceEvent;

/**
 * A unique incrementing identifier that represents the order of edits applied by the server.
 *
 * Log Safety: SAFE
 */
export type RevisionId = string;

/**
 * Log Safety: UNSAFE
 */
export interface SearchDocumentsRequest {
  documentTypeName: DocumentTypeName;
  requestBody: DocumentSearchRequest;
}

/**
 * Request to update document metadata (name and/or description).
 *
 * Log Safety: UNSAFE
 */
export interface UpdateDocumentMetadataRequest {
  name?: string;
  description?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface UpdateDocumentRequest {
  requestBody: UpdateDocumentMetadataRequest;
}

/**
 * A Foundry User ID.
 *
 * Log Safety: SAFE
 */
export type UserId = string;

/**
 * A user's presence on a document
 *
 * Log Safety: SAFE
 */
export type UserPresence = "PRESENT" | "NOT_PRESENT";

/**
 * Log Safety: UNSAFE
 */
export interface VersionedEventData {
  data: any;
  version: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface YjsUpdate {
  data: any;
}
