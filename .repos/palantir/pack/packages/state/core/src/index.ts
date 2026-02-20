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

export { createDocumentServiceConfig, getDocumentService } from "./DocumentServiceModule.js";
export {
  BaseYjsDocumentService,
  type BaseYjsDocumentServiceOptions,
  type InternalYjsDoc,
} from "./service/BaseYjsDocumentService.js";
export { createInMemoryDocumentServiceConfig } from "./service/InMemoryDocumentService.js";
export { FileSystemType } from "./types/CreateDocumentMetadata.js";
export type { CreateDocumentMetadata } from "./types/CreateDocumentMetadata.js";
export { createDocRef, invalidDocRef, isValidDocRef } from "./types/DocumentRefImpl.js";
export { DocumentLiveStatus, DocumentLoadStatus } from "./types/DocumentService.js";
export type {
  DocumentMetadataChangeCallback,
  DocumentService,
  DocumentStateChangeCallback,
  DocumentStatus,
  DocumentStatusChangeCallback,
  DocumentSyncStatus,
  SearchDocumentsResult,
} from "./types/DocumentService.js";
export type { WithDocumentServiceInit } from "./types/DocumentServiceConfig.js";
export {
  createRecordCollectionRef,
  invalidRecordCollectionRef,
  isValidRecordCollectionRef,
} from "./types/RecordCollectionRefImpl.js";
export { createRecordRef, invalidRecordRef, isValidRecordRef } from "./types/RecordRefImpl.js";
export { getStateModule, STATE_MODULE_ACCESSOR } from "./types/StateModule.js";
export type { StateModule, WithStateModule } from "./types/StateModule.js";
