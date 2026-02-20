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
 * Thrown when conda solve fails for the provided input packages.
 *
 * Log Safety: UNSAFE
 */
export interface CondaSolveFailureForProvidedPackages {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CondaSolveFailureForProvidedPackages";
  errorDescription:
    "Thrown when conda solve fails for the provided input packages.";
  errorInstanceId: string;
  parameters: {
    errorType: unknown;
    errorMessage: unknown;
  };
}

/**
 * The provided configuration is invalid.
 *
 * Log Safety: UNSAFE
 */
export interface CreateConfigValidationError {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CreateConfigValidationError";
  errorDescription: "The provided configuration is invalid.";
  errorInstanceId: string;
  parameters: {
    studioRid: unknown;
    validationFailures: unknown;
  };
}

/**
 * Could not create the Model.
 *
 * Log Safety: SAFE
 */
export interface CreateModelPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateModelPermissionDenied";
  errorDescription: "Could not create the Model.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the ModelStudioConfigVersion.
 *
 * Log Safety: SAFE
 */
export interface CreateModelStudioConfigVersionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateModelStudioConfigVersionPermissionDenied";
  errorDescription: "Could not create the ModelStudioConfigVersion.";
  errorInstanceId: string;
  parameters: {
    modelStudioRid: unknown;
  };
}

/**
 * Permission denied to create a Model Studio.
 *
 * Log Safety: SAFE
 */
export interface CreateModelStudioPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateModelStudioPermissionDenied";
  errorDescription: "Permission denied to create a Model Studio.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the ModelVersion.
 *
 * Log Safety: SAFE
 */
export interface CreateModelVersionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateModelVersionPermissionDenied";
  errorDescription: "Could not create the ModelVersion.";
  errorInstanceId: string;
  parameters: {
    modelRid: unknown;
  };
}

/**
 * The model api failed validations
 *
 * Log Safety: UNSAFE
 */
export interface InvalidModelApi {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidModelApi";
  errorDescription: "The model api failed validations";
  errorInstanceId: string;
  parameters: {
    errorType: unknown;
    message: unknown;
  };
}

/**
 * The request to create a Model Studio contains invalid arguments.
 *
 * Log Safety: SAFE
 */
export interface InvalidModelStudioCreateRequest {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidModelStudioCreateRequest";
  errorDescription:
    "The request to create a Model Studio contains invalid arguments.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not latest the ModelStudioConfigVersion.
 *
 * Log Safety: SAFE
 */
export interface LatestModelStudioConfigVersionsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LatestModelStudioConfigVersionsPermissionDenied";
  errorDescription: "Could not latest the ModelStudioConfigVersion.";
  errorInstanceId: string;
  parameters: {
    modelStudioRid: unknown;
  };
}

/**
 * Permission denied to launch a Model Studio run.
 *
 * Log Safety: SAFE
 */
export interface LaunchModelStudioPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LaunchModelStudioPermissionDenied";
  errorDescription: "Permission denied to launch a Model Studio run.";
  errorInstanceId: string;
  parameters: {
    studioRid: unknown;
  };
}

/**
 * The given Model could not be found.
 *
 * Log Safety: SAFE
 */
export interface ModelNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ModelNotFound";
  errorDescription: "The given Model could not be found.";
  errorInstanceId: string;
  parameters: {
    modelRid: unknown;
  };
}

/**
 * The requested Model Studio configuration version was not found.
 *
 * Log Safety: SAFE
 */
export interface ModelStudioConfigVersionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ModelStudioConfigVersionNotFound";
  errorDescription:
    "The requested Model Studio configuration version was not found.";
  errorInstanceId: string;
  parameters: {
    studioRid: unknown;
    configVersion: unknown;
  };
}

/**
 * The requested Model Studio was not found.
 *
 * Log Safety: SAFE
 */
export interface ModelStudioNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ModelStudioNotFound";
  errorDescription: "The requested Model Studio was not found.";
  errorInstanceId: string;
  parameters: {
    studioRid: unknown;
  };
}

/**
 * The given ModelStudioTrainer could not be found.
 *
 * Log Safety: UNSAFE
 */
export interface ModelStudioTrainerNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ModelStudioTrainerNotFound";
  errorDescription: "The given ModelStudioTrainer could not be found.";
  errorInstanceId: string;
  parameters: {
    modelStudioTrainerTrainerId: unknown;
  };
}

/**
 * The given ModelVersion could not be found.
 *
 * Log Safety: SAFE
 */
export interface ModelVersionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ModelVersionNotFound";
  errorDescription: "The given ModelVersion could not be found.";
  errorInstanceId: string;
  parameters: {
    modelRid: unknown;
    modelVersionRid: unknown;
  };
}

/**
 * The specified trainer does not exist.
 *
 * Log Safety: UNSAFE
 */
export interface TrainerNotFound {
  errorCode: "NOT_FOUND";
  errorName: "TrainerNotFound";
  errorDescription: "The specified trainer does not exist.";
  errorInstanceId: string;
  parameters: {
    trainerId: unknown;
  };
}
