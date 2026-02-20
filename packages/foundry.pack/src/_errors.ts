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

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
   * The user does not have permission to create documents of the given type in
the given ontology, or the Document Type does not exist in the ontology.
   *
   * Log Safety: UNSAFE
   */
export interface CreateDocumentNotSupported {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateDocumentNotSupported";
  errorDescription:
    "The user does not have permission to create documents of the given type in the given ontology, or the Document Type does not exist in the ontology.";
  errorInstanceId: string;
  parameters: {
    ontologyRid: unknown;
    documentTypeName: unknown;
  };
}

/**
 * Could not create the Document.
 *
 * Log Safety: SAFE
 */
export interface CreateDocumentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateDocumentPermissionDenied";
  errorDescription: "Could not create the Document.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the DocumentType.
 *
 * Log Safety: SAFE
 */
export interface CreateDocumentTypePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateDocumentTypePermissionDenied";
  errorDescription: "Could not create the DocumentType.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The given Document could not be found.
 *
 * Log Safety: SAFE
 */
export interface DocumentNotFound {
  errorCode: "NOT_FOUND";
  errorName: "DocumentNotFound";
  errorDescription: "The given Document could not be found.";
  errorInstanceId: string;
  parameters: {
    documentId: unknown;
  };
}

/**
 * This Document Type Name already exists for the given ontology.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentTypeAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "DocumentTypeAlreadyExists";
  errorDescription:
    "This Document Type Name already exists for the given ontology.";
  errorInstanceId: string;
  parameters: {
    documentTypeName: unknown;
  };
}

/**
 * The Document Type Name does not exist, or the user does not have permission to view the Document Type.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentTypeNameNotFound {
  errorCode: "PERMISSION_DENIED";
  errorName: "DocumentTypeNameNotFound";
  errorDescription:
    "The Document Type Name does not exist, or the user does not have permission to view the Document Type.";
  errorInstanceId: string;
  parameters: {
    documentTypeName: unknown;
  };
}

/**
 * Could not search the Document.
 *
 * Log Safety: SAFE
 */
export interface SearchDocumentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SearchDocumentsPermissionDenied";
  errorDescription: "Could not search the Document.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The user does not have permission to update this document, or the document does not exist.
 *
 * Log Safety: SAFE
 */
export interface UpdateDocumentNotSupported {
  errorCode: "PERMISSION_DENIED";
  errorName: "UpdateDocumentNotSupported";
  errorDescription:
    "The user does not have permission to update this document, or the document does not exist.";
  errorInstanceId: string;
  parameters: {
    documentId: unknown;
  };
}

/**
 * Could not update the Document.
 *
 * Log Safety: SAFE
 */
export interface UpdateDocumentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UpdateDocumentPermissionDenied";
  errorDescription: "Could not update the Document.";
  errorInstanceId: string;
  parameters: {
    documentId: unknown;
  };
}
