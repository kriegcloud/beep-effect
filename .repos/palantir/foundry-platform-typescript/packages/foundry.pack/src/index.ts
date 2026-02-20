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

export type {
  ActivityCollaborativeUpdate,
  ActivityCreated,
  ActivityDeleted,
  ActivityEvent,
  AllPrincipal,
  ClientId,
  CreateDocumentRequest,
  CreateDocumentTypeRequest,
  CustomPresenceEvent,
  DiscretionaryPrincipal,
  DiscretionaryPrincipalGroupId,
  DiscretionaryPrincipalUserId,
  Document,
  DocumentDiscretionarySecurity,
  DocumentEditDescription,
  DocumentMandatorySecurity,
  DocumentName,
  DocumentOntologyRid,
  DocumentPresenceChangeEvent,
  DocumentPublishMessage,
  DocumentRid,
  DocumentSearchQuery,
  DocumentSearchRequest,
  DocumentSearchResponse,
  DocumentSecurity,
  DocumentSort,
  DocumentSortField,
  DocumentType,
  DocumentTypeName,
  DocumentTypeRid,
  DocumentUpdate,
  DocumentUpdateMessage,
  DocumentUpdateSubscriptionRequest,
  EditId,
  ErrorCode,
  ErrorMessage,
  EventId,
  FileSystemType,
  FolderRid,
  GroupId,
  MarkingId,
  MarkingPrincipal,
  PageToken,
  PresenceCollaborativeUpdate,
  PresencePublishMessage,
  RevisionId,
  SearchDocumentsRequest,
  UpdateDocumentMetadataRequest,
  UpdateDocumentRequest,
  UserId,
  UserPresence,
  VersionedEventData,
  YjsUpdate,
} from "./_components.js";
export type {
  CreateDocumentNotSupported,
  CreateDocumentPermissionDenied,
  CreateDocumentTypePermissionDenied,
  DocumentNotFound,
  DocumentTypeAlreadyExists,
  DocumentTypeNameNotFound,
  SearchDocumentsPermissionDenied,
  UpdateDocumentNotSupported,
  UpdateDocumentPermissionDenied,
} from "./_errors.js";
export * as Documents from "./public/Document.js";
export * as DocumentTypes from "./public/DocumentType.js";
