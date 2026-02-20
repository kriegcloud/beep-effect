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
 * Could not content the File.
 *
 * Log Safety: SAFE
 */
export interface ContentFilePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ContentFilePermissionDenied";
  errorDescription: "Could not content the File.";
  errorInstanceId: string;
  parameters: {
    fileRid: unknown;
  };
}

/**
 * The user does not have permission to create a Document in the specified folder.
 *
 * Log Safety: SAFE
 */
export interface CreateDocumentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateDocumentPermissionDenied";
  errorDescription:
    "The user does not have permission to create a Document in the specified folder.";
  errorInstanceId: string;
  parameters: {
    parentFolderRid: unknown;
  };
}

/**
 * Could not create the ExportJob.
 *
 * Log Safety: SAFE
 */
export interface CreateExportJobPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateExportJobPermissionDenied";
  errorDescription: "Could not create the ExportJob.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The requested document was not found.
 *
 * Log Safety: SAFE
 */
export interface DocumentNotFound {
  errorCode: "NOT_FOUND";
  errorName: "DocumentNotFound";
  errorDescription: "The requested document was not found.";
  errorInstanceId: string;
  parameters: {
    documentRid: unknown;
  };
}

/**
 * The user does not have export permissions on this Document.
 *
 * Log Safety: SAFE
 */
export interface ExportDocumentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ExportDocumentPermissionDenied";
  errorDescription:
    "The user does not have export permissions on this Document.";
  errorInstanceId: string;
  parameters: {
    documentRid: unknown;
  };
}

/**
 * The user does not have export permissions on this GenerationJob.
 *
 * Log Safety: SAFE
 */
export interface ExportGenerationJobPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ExportGenerationJobPermissionDenied";
  errorDescription:
    "The user does not have export permissions on this GenerationJob.";
  errorInstanceId: string;
  parameters: {
    generationJobRid: unknown;
  };
}

/**
 * The given ExportJob could not be found.
 *
 * Log Safety: SAFE
 */
export interface ExportJobNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ExportJobNotFound";
  errorDescription: "The given ExportJob could not be found.";
  errorInstanceId: string;
  parameters: {
    exportJobRid: unknown;
  };
}

/**
 * The requested file was not found.
 *
 * Log Safety: SAFE
 */
export interface FileNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FileNotFound";
  errorDescription: "The requested file was not found.";
  errorInstanceId: string;
  parameters: {
    fileRid: unknown;
  };
}

/**
 * Could not generate the Template.
 *
 * Log Safety: SAFE
 */
export interface GenerateTemplatePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GenerateTemplatePermissionDenied";
  errorDescription: "Could not generate the Template.";
  errorInstanceId: string;
  parameters: {
    templateRid: unknown;
  };
}

/**
 * The given GenerationJob could not be found.
 *
 * Log Safety: SAFE
 */
export interface GenerationJobNotFound {
  errorCode: "NOT_FOUND";
  errorName: "GenerationJobNotFound";
  errorDescription: "The given GenerationJob could not be found.";
  errorInstanceId: string;
  parameters: {
    generationJobRid: unknown;
    templateRid: unknown;
  };
}

/**
 * The operation cannot be completed because the generation job has failed status.
 *
 * Log Safety: SAFE
 */
export interface GenerationJobStatusFailed {
  errorCode: "FAILED_PRECONDITION";
  errorName: "GenerationJobStatusFailed";
  errorDescription:
    "The operation cannot be completed because the generation job has failed status.";
  errorInstanceId: string;
  parameters: {
    generationJobRid: unknown;
  };
}

/**
 * The operation cannot be completed because the generation job has running status.
 *
 * Log Safety: SAFE
 */
export interface GenerationJobStatusRunning {
  errorCode: "FAILED_PRECONDITION";
  errorName: "GenerationJobStatusRunning";
  errorDescription:
    "The operation cannot be completed because the generation job has running status.";
  errorInstanceId: string;
  parameters: {
    generationJobRid: unknown;
  };
}

/**
 * The provided user locale is not valid.
 *
 * Log Safety: SAFE
 */
export interface InvalidExportJobUserLocale {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidExportJobUserLocale";
  errorDescription: "The provided user locale is not valid.";
  errorInstanceId: string;
  parameters: {
    userLocale: unknown;
  };
}

/**
 * A template parameter value is invalid (for example, is of the wrong type).
 *
 * Log Safety: UNSAFE
 */
export interface InvalidGenerationJobTemplateParameter {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidGenerationJobTemplateParameter";
  errorDescription:
    "A template parameter value is invalid (for example, is of the wrong type).";
  errorInstanceId: string;
  parameters: {
    templateParameterName: unknown;
    reason: unknown;
  };
}

/**
 * The provided template version doesn't exist or the template has no published versions.
 *
 * Log Safety: SAFE
 */
export interface InvalidGenerationJobTemplateVersion {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidGenerationJobTemplateVersion";
  errorDescription:
    "The provided template version doesn't exist or the template has no published versions.";
  errorInstanceId: string;
  parameters: {
    templateVersion: unknown;
  };
}

/**
 * The provided timezone is not valid.
 *
 * Log Safety: SAFE
 */
export interface InvalidTimezone {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTimezone";
  errorDescription: "The provided timezone is not valid.";
  errorInstanceId: string;
  parameters: {
    userTimezone: unknown;
  };
}

/**
 * One or more template parameters are missing.
 *
 * Log Safety: UNSAFE
 */
export interface MissingGenerationJobTemplateParameters {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingGenerationJobTemplateParameters";
  errorDescription: "One or more template parameters are missing.";
  errorInstanceId: string;
  parameters: {
    templateParameterNames: unknown;
  };
}

/**
 * Could not saveDocument the GenerationJob.
 *
 * Log Safety: SAFE
 */
export interface SaveDocumentGenerationJobPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SaveDocumentGenerationJobPermissionDenied";
  errorDescription: "Could not saveDocument the GenerationJob.";
  errorInstanceId: string;
  parameters: {
    generationJobRid: unknown;
    templateRid: unknown;
  };
}

/**
 * The requested template was not found.
 *
 * Log Safety: SAFE
 */
export interface TemplateNotFound {
  errorCode: "NOT_FOUND";
  errorName: "TemplateNotFound";
  errorDescription: "The requested template was not found.";
  errorInstanceId: string;
  parameters: {
    templateRid: unknown;
  };
}
