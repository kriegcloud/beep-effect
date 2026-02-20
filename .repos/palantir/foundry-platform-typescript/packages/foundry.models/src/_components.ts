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
 * Log Safety: SAFE
 */
export interface BooleanType {}

/**
 * The name of a column in a dataset.
 *
 * Log Safety: UNSAFE
 */
export type ColumnName = LooselyBrandedString<"ColumnName">;

/**
 * An identifier for a column type specification.
 *
 * Log Safety: UNSAFE
 */
export type ColumnTypeSpecId = LooselyBrandedString<"ColumnTypeSpecId">;

/**
 * Log Safety: UNSAFE
 */
export interface CreateModelRequest {
  name: ModelName;
  parentFolderRid: _Filesystem.FolderRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateModelStudioConfigVersionRequest {
  name: ModelStudioConfigVersionName;
  resources: ResourceConfiguration;
  changelog?: string;
  workerConfig: ModelStudioWorkerConfig;
  trainerId: TrainerId;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateModelStudioRequest {
  name: string;
  parentFolderRid: _Filesystem.FolderRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateModelVersionRequest {
  modelFiles: ModelFiles;
  backingRepositories: Array<string>;
  condaRequirements: Array<string>;
  modelApi: ModelApi;
}

/**
 * Dataset input configuration.
 *
 * Log Safety: UNSAFE
 */
export interface DatasetInput {
  rid: string;
  columnMapping: Record<ColumnTypeSpecId, Array<_Core.ColumnName>>;
  ignoreColumns: Array<_Core.ColumnName>;
  selectColumns: Array<_Core.ColumnName>;
}

/**
 * Log Safety: SAFE
 */
export interface DateType {}

/**
 * Log Safety: UNSAFE
 */
export interface DillModelFiles {
  serializedModelFunction: string;
}

/**
 * Log Safety: SAFE
 */
export interface DoubleType {}

/**
 * Log Safety: SAFE
 */
export interface FloatType {}

/**
 * A string alias used to identify inputs in a Model Studio configuration.
 *
 * Log Safety: UNSAFE
 */
export type InputAlias = LooselyBrandedString<"InputAlias">;

/**
 * Log Safety: SAFE
 */
export interface IntegerType {}

/**
 * Log Safety: UNSAFE
 */
export interface ListModelStudioConfigVersionsResponse {
  data: Array<ModelStudioConfigVersion>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListModelStudioRunsResponse {
  data: Array<ModelStudioRun>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListModelStudioTrainersResponse {
  data: Array<ModelStudioTrainer>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListModelVersionsResponse {
  data: Array<ModelVersion>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: SAFE
 */
export interface LongType {}

/**
 * Log Safety: SAFE
 */
export interface Model {
  rid: ModelRid;
}

/**
 * The Model API is a specification that describes the inputs and outputs of a machine learning model. It is used to define the interface for the model, including the types of data that can be passed to it and the types of data that it will return.
 *
 * Log Safety: UNSAFE
 */
export interface ModelApi {
  inputs: Array<ModelApiInput>;
  outputs: Array<ModelApiOutput>;
}

/**
 * Log Safety: SAFE
 */
export interface ModelApiAnyType {}

/**
 * Log Safety: UNSAFE
 */
export interface ModelApiArrayType {
  itemType: ModelApiDataType;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModelApiColumn {
  name: string;
  required?: boolean;
  dataType: ModelApiDataType;
}

/**
 * Log Safety: UNSAFE
 */
export type ModelApiDataType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "boolean" } & _Core.BooleanType)
  | ({ type: "unsupported" } & _Core.UnsupportedType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "array" } & ModelApiArrayType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "float" } & _Core.FloatType)
  | ({ type: "any" } & ModelApiAnyType)
  | ({ type: "map" } & ModelApiMapType)
  | ({ type: "long" } & _Core.LongType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * Log Safety: UNSAFE
 */
export type ModelApiInput =
  | ({ type: "unsupported" } & _Core.UnsupportedType)
  | ({ type: "parameter" } & ModelApiParameterType)
  | ({ type: "tabular" } & ModelApiTabularType);

/**
 * Log Safety: UNSAFE
 */
export interface ModelApiMapType {
  keyType: ModelApiDataType;
  valueType: ModelApiDataType;
}

/**
 * Log Safety: UNSAFE
 */
export type ModelApiOutput =
  | ({ type: "unsupported" } & _Core.UnsupportedType)
  | ({ type: "parameter" } & ModelApiParameterType)
  | ({ type: "tabular" } & ModelApiTabularType);

/**
 * Log Safety: UNSAFE
 */
export interface ModelApiParameterType {
  name: string;
  required?: boolean;
  dataType: ModelApiDataType;
}

/**
 * Log Safety: SAFE
 */
export type ModelApiTabularFormat = "PANDAS" | "SPARK";

/**
 * Log Safety: UNSAFE
 */
export interface ModelApiTabularType {
  name: string;
  required?: boolean;
  columns: Array<ModelApiColumn>;
  format?: ModelApiTabularFormat;
}

/**
   * The serialized data of a machine learning model. This can include the model's parameters, architecture, and any other relevant information needed to reconstruct the model.
Must be a base64-encoded string of a dill-serialized model function.
   *
   * Log Safety: UNSAFE
   */
export type ModelFiles = { type: "dill" } & DillModelFiles;

/**
 * Log Safety: UNSAFE
 */
export type ModelName = LooselyBrandedString<"ModelName">;

/**
 * Model output configuration.
 *
 * Log Safety: SAFE
 */
export interface ModelOutput {
  modelRid: string;
}

/**
 * The Resource Identifier (RID) of a Model.
 *
 * Log Safety: SAFE
 */
export type ModelRid = LooselyBrandedString<"ModelRid">;

/**
 * Log Safety: SAFE
 */
export interface ModelStudio {
  rid: ModelStudioRid;
  folderRid: _Filesystem.FolderRid;
  createdTime: _Core.CreatedTime;
}

/**
 * The Resource Identifier (RID) of a Model Studio Configuration.
 *
 * Log Safety: SAFE
 */
export type ModelStudioConfigRid = LooselyBrandedString<"ModelStudioConfigRid">;

/**
 * Log Safety: UNSAFE
 */
export interface ModelStudioConfigVersion {
  name: ModelStudioConfigVersionName;
  version: ModelStudioConfigVersionNumber;
  trainerId: TrainerId;
  trainer: TrainerVersionLocator;
  workerConfig: ModelStudioWorkerConfig;
  resources: ResourceConfiguration;
  changelog?: string;
  createdBy: _Core.CreatedBy;
  createdTime: _Core.CreatedTime;
}

/**
 * Human readable name of the configuration version and experiment.
 *
 * Log Safety: UNSAFE
 */
export type ModelStudioConfigVersionName = LooselyBrandedString<
  "ModelStudioConfigVersionName"
>;

/**
 * The version number of a Model Studio Configuration.
 *
 * Log Safety: SAFE
 */
export type ModelStudioConfigVersionNumber = number;

/**
 * Input specification for a Model Studio configuration.
 *
 * Log Safety: UNSAFE
 */
export type ModelStudioInput = { type: "dataset" } & DatasetInput;

/**
 * Output specification for a Model Studio configuration.
 *
 * Log Safety: SAFE
 */
export type ModelStudioOutput = { type: "model" } & ModelOutput;

/**
 * The Resource Identifier (RID) of a Model Studio.
 *
 * Log Safety: SAFE
 */
export type ModelStudioRid = LooselyBrandedString<"ModelStudioRid">;

/**
 * Log Safety: UNSAFE
 */
export interface ModelStudioRun {
  runId: RunId;
  buildRid: ModelStudioRunBuildRid;
  jobRid: ModelStudioRunJobRid;
  configVersion: ModelStudioConfigVersionNumber;
  startedBy: _Core.CreatedBy;
  startedTime: _Core.CreatedTime;
  resolvedOutputs: Record<OutputAlias, ModelStudioRunOutput>;
}

/**
 * The RID of the build associated with this run.
 *
 * Log Safety: SAFE
 */
export type ModelStudioRunBuildRid = LooselyBrandedString<
  "ModelStudioRunBuildRid"
>;

/**
 * The RID of the job associated with this run.
 *
 * Log Safety: SAFE
 */
export type ModelStudioRunJobRid = LooselyBrandedString<"ModelStudioRunJobRid">;

/**
 * Resolved model output details for a Model Studio run.
 *
 * Log Safety: SAFE
 */
export interface ModelStudioRunModelOutput {
  modelRid: string;
  modelVersionRid: string;
  experimentRid?: string;
}

/**
 * Resolved output details for a Model Studio run.
 *
 * Log Safety: SAFE
 */
export type ModelStudioRunOutput = {
  type: "model";
} & ModelStudioRunModelOutput;

/**
 * Log Safety: UNSAFE
 */
export interface ModelStudioTrainer {
  trainerId: TrainerId;
  version: TrainerVersion;
  name: TrainerName;
  type: TrainerType;
  description: TrainerDescription;
  customConfigSchema: TrainerSchemaDefinition;
  inputs: TrainerInputsSpecification;
  outputs: TrainerOutputsSpecification;
  experimental: ModelStudioTrainerExperimental;
}

/**
 * Whether this trainer is experimental and may have breaking changes.
 *
 * Log Safety: SAFE
 */
export type ModelStudioTrainerExperimental = boolean;

/**
 * Configuration for the Model Studio worker.
 *
 * Log Safety: UNSAFE
 */
export interface ModelStudioWorkerConfig {
  customConfig?: Record<string, any>;
  inputs: Record<InputAlias, ModelStudioInput>;
  outputs: Record<OutputAlias, ModelStudioOutput>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModelVersion {
  rid: ModelVersionRid;
  modelApi: ModelApi;
  condaRequirements: Array<string>;
  backingRepositories: Array<string>;
}

/**
 * The Resource Identifier (RID) of a Model Version.
 *
 * Log Safety: SAFE
 */
export type ModelVersionRid = LooselyBrandedString<"ModelVersionRid">;

/**
 * A string alias used to identify outputs in a Model Studio configuration.
 *
 * Log Safety: UNSAFE
 */
export type OutputAlias = LooselyBrandedString<"OutputAlias">;

/**
 * Compute resource configuration for training runs.
 *
 * Log Safety: SAFE
 */
export interface ResourceConfiguration {
  memory: string;
  cpu: string;
}

/**
 * A unique identifier for a Model Studio run, derived from the studio, config, and build.
 *
 * Log Safety: SAFE
 */
export type RunId = LooselyBrandedString<"RunId">;

/**
 * Log Safety: SAFE
 */
export interface StringType {}

/**
 * Log Safety: SAFE
 */
export interface TimestampType {}

/**
 * Description of what a trainer does and its capabilities.
 *
 * Log Safety: UNSAFE
 */
export type TrainerDescription = LooselyBrandedString<"TrainerDescription">;

/**
 * The identifier for a trainer.
 *
 * Log Safety: UNSAFE
 */
export type TrainerId = LooselyBrandedString<"TrainerId">;

/**
 * Specification of the inputs required by a trainer. When creating a ModelStudioConfigVersion, the workerConfig.inputs must conform to this specification, providing entries for each required input defined here.
 *
 * Log Safety: UNSAFE
 */
export type TrainerInputsSpecification = any;

/**
 * Human-readable name of a trainer.
 *
 * Log Safety: UNSAFE
 */
export type TrainerName = LooselyBrandedString<"TrainerName">;

/**
 * Specification of the outputs produced by a trainer. When creating a ModelStudioConfigVersion, the workerConfig.outputs must conform to this specification, providing entries for each required output defined here.
 *
 * Log Safety: UNSAFE
 */
export type TrainerOutputsSpecification = any;

/**
 * JSON schema defining the custom configuration parameters for a trainer.
 *
 * Log Safety: UNSAFE
 */
export type TrainerSchemaDefinition = any;

/**
 * The type/category of a trainer.
 *
 * Log Safety: UNSAFE
 */
export type TrainerType = LooselyBrandedString<"TrainerType">;

/**
 * A specific version identifier for a trainer.
 *
 * Log Safety: SAFE
 */
export type TrainerVersion = LooselyBrandedString<"TrainerVersion">;

/**
 * Identifies a specific version of a trainer.
 *
 * Log Safety: UNSAFE
 */
export interface TrainerVersionLocator {
  trainerId: TrainerId;
  version: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface UnsupportedType {
  unsupportedType: string;
  params: Record<
    _Core.UnsupportedTypeParamKey,
    _Core.UnsupportedTypeParamValue
  >;
}

/**
 * Log Safety: UNSAFE
 */
export type UnsupportedTypeParamValue = LooselyBrandedString<
  "UnsupportedTypeParamValue"
>;
