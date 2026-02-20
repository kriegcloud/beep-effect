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
import type * as _Ontologies from "@osdk/foundry.ontologies";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: SAFE
 */
export interface CreateExportJobRequest {
  exportJobSource: ExportJobSource;
  exportJobTarget: ExportJobTarget;
}

/**
 * Log Safety: SAFE
 */
export interface Document {
  rid: DocumentRid;
}

/**
 * The unique identifier for a Document
 *
 * Log Safety: SAFE
 */
export type DocumentRid = LooselyBrandedString<"DocumentRid">;

/**
 * Log Safety: UNSAFE
 */
export interface ExportJob {
  rid: ExportJobRid;
  status: ExportJobStatus;
}

/**
 * Log Safety: SAFE
 */
export interface ExportJobDocumentSource {
  documentRid: DocumentRid;
}

/**
 * The export job failed
 *
 * Log Safety: UNSAFE
 */
export interface ExportJobFailed {
  errorMessage: string;
  errorCode?: string;
  errorInstanceId?: string;
}

/**
 * Log Safety: SAFE
 */
export interface ExportJobGenerationJobSource {
  templateRid: TemplateRid;
  generationJobRid: GenerationJobRid;
}

/**
 * Log Safety: SAFE
 */
export interface ExportJobPdfTarget {
  userLocale: _Core.Locale;
  userTimezone: _Core.ZoneId;
}

/**
 * The unique identifier for a ExportJob
 *
 * Log Safety: SAFE
 */
export type ExportJobRid = LooselyBrandedString<"ExportJobRid">;

/**
 * The export job is currently running
 *
 * Log Safety: SAFE
 */
export interface ExportJobRunning {}

/**
 * Defines the source of contents for an ExportJob
 *
 * Log Safety: SAFE
 */
export type ExportJobSource =
  | ({ type: "generationJobSource" } & ExportJobGenerationJobSource)
  | ({ type: "documentSource" } & ExportJobDocumentSource);

/**
 * The status of an export job
 *
 * Log Safety: UNSAFE
 */
export type ExportJobStatus =
  | ({ type: "running" } & ExportJobRunning)
  | ({ type: "failed" } & ExportJobFailed)
  | ({ type: "succeeded" } & ExportJobSucceeded);

/**
 * The export job succeeded
 *
 * Log Safety: SAFE
 */
export interface ExportJobSucceeded {
  fileRid: FileRid;
}

/**
 * The target format that the job will export to.
 *
 * Log Safety: SAFE
 */
export type ExportJobTarget = { type: "pdf" } & ExportJobPdfTarget;

/**
 * Log Safety: SAFE
 */
export interface File {
  rid: FileRid;
}

/**
 * The unique identifier for a File
 *
 * Log Safety: SAFE
 */
export type FileRid = LooselyBrandedString<"FileRid">;

/**
 * Log Safety: UNSAFE
 */
export interface GenerateTemplateRequest {
  templateVersion?: TemplateVersion;
  templateParameters: Record<TemplateParameterName, TemplateParameterValue>;
}

/**
 * Log Safety: UNSAFE
 */
export interface GenerationJob {
  rid: GenerationJobRid;
  status: GenerationJobStatus;
}

/**
 * The generation job failed
 *
 * Log Safety: UNSAFE
 */
export interface GenerationJobFailed {
  errorMessage: string;
}

/**
 * The unique identifier for a GenerationJob
 *
 * Log Safety: SAFE
 */
export type GenerationJobRid = LooselyBrandedString<"GenerationJobRid">;

/**
 * The generation job is currently running
 *
 * Log Safety: SAFE
 */
export interface GenerationJobRunning {}

/**
 * The status of a GenerationJob
 *
 * Log Safety: UNSAFE
 */
export type GenerationJobStatus =
  | ({ type: "running" } & GenerationJobRunning)
  | ({ type: "failed" } & GenerationJobFailed)
  | ({ type: "succeeded" } & GenerationJobSucceeded);

/**
 * The generation job succeeded
 *
 * Log Safety: SAFE
 */
export interface GenerationJobSucceeded {}

/**
 * Log Safety: UNSAFE
 */
export interface SaveDocumentGenerationJobRequest {
  documentName?: string;
  parentFolderRid: _Filesystem.FolderRid;
}

/**
 * Response for saving a document
 *
 * Log Safety: SAFE
 */
export interface SaveDocumentResponse {
  documentRid: DocumentRid;
}

/**
 * Log Safety: SAFE
 */
export interface Template {
  rid: TemplateRid;
}

/**
 * DateTime parameter value
 *
 * Log Safety: UNSAFE
 */
export interface TemplateParameterDateTimeValue {
  timestamp: string;
  timezone: _Core.ZoneId;
}

/**
 * Date parameter value
 *
 * Log Safety: UNSAFE
 */
export interface TemplateParameterDateValue {
  value: string;
}

/**
 * Double parameter value
 *
 * Log Safety: UNSAFE
 */
export interface TemplateParameterDoubleValue {
  value: number;
}

/**
 * The name of a Template parameter
 *
 * Log Safety: UNSAFE
 */
export type TemplateParameterName = LooselyBrandedString<
  "TemplateParameterName"
>;

/**
 * Object RID parameter value
 *
 * Log Safety: SAFE
 */
export interface TemplateParameterObjectRidValue {
  value: _Ontologies.ObjectRid;
}

/**
 * Object set RID parameter value
 *
 * Log Safety: SAFE
 */
export interface TemplateParameterObjectSetRidValue {
  value: _Ontologies.ObjectSetRid;
}

/**
 * String parameter value
 *
 * Log Safety: UNSAFE
 */
export interface TemplateParameterStringValue {
  value: string;
}

/**
 * A value for a template parameter
 *
 * Log Safety: UNSAFE
 */
export type TemplateParameterValue =
  | ({ type: "objectSetRid" } & TemplateParameterObjectSetRidValue)
  | ({ type: "date" } & TemplateParameterDateValue)
  | ({ type: "dateTime" } & TemplateParameterDateTimeValue)
  | ({ type: "string" } & TemplateParameterStringValue)
  | ({ type: "double" } & TemplateParameterDoubleValue)
  | ({ type: "objectRid" } & TemplateParameterObjectRidValue);

/**
 * The unique identifier for a Template
 *
 * Log Safety: SAFE
 */
export type TemplateRid = LooselyBrandedString<"TemplateRid">;

/**
 * The version number of a Template
 *
 * Log Safety: SAFE
 */
export type TemplateVersion = string;
