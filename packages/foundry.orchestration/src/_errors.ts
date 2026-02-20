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
 * The given build inputs could be found.
 *
 * Log Safety: SAFE
 */
export interface BuildInputsNotFound {
  errorCode: "NOT_FOUND";
  errorName: "BuildInputsNotFound";
  errorDescription: "The given build inputs could be found.";
  errorInstanceId: string;
  parameters: {
    resourceRids: unknown;
  };
}

/**
 * The provided token does not have permission to use the given resources as inputs to the build.
 *
 * Log Safety: SAFE
 */
export interface BuildInputsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "BuildInputsPermissionDenied";
  errorDescription:
    "The provided token does not have permission to use the given resources as inputs to the build.";
  errorInstanceId: string;
  parameters: {
    resourceRids: unknown;
  };
}

/**
 * The given Build could not be found.
 *
 * Log Safety: SAFE
 */
export interface BuildNotFound {
  errorCode: "NOT_FOUND";
  errorName: "BuildNotFound";
  errorDescription: "The given Build could not be found.";
  errorInstanceId: string;
  parameters: {
    buildRid: unknown;
  };
}

/**
 * The build is not currently running.
 *
 * Log Safety: SAFE
 */
export interface BuildNotRunning {
  errorCode: "INVALID_ARGUMENT";
  errorName: "BuildNotRunning";
  errorDescription: "The build is not currently running.";
  errorInstanceId: string;
  parameters: {
    buildRid: unknown;
  };
}

/**
 * The action targets are missing job specs.
 *
 * Log Safety: SAFE
 */
export interface BuildTargetsMissingJobSpecs {
  errorCode: "INVALID_ARGUMENT";
  errorName: "BuildTargetsMissingJobSpecs";
  errorDescription: "The action targets are missing job specs.";
  errorInstanceId: string;
  parameters: {
    resourceRids: unknown;
  };
}

/**
 * The given build targets could not be found.
 *
 * Log Safety: SAFE
 */
export interface BuildTargetsNotFound {
  errorCode: "NOT_FOUND";
  errorName: "BuildTargetsNotFound";
  errorDescription: "The given build targets could not be found.";
  errorInstanceId: string;
  parameters: {
    resourceRids: unknown;
  };
}

/**
 * The provided token does not have permission to build the given resources.
 *
 * Log Safety: SAFE
 */
export interface BuildTargetsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "BuildTargetsPermissionDenied";
  errorDescription:
    "The provided token does not have permission to build the given resources.";
  errorInstanceId: string;
  parameters: {
    resourceRids: unknown;
  };
}

/**
 * Unable to resolve the given target to a set of targets to build.
 *
 * Log Safety: SAFE
 */
export interface BuildTargetsResolutionError {
  errorCode: "INVALID_ARGUMENT";
  errorName: "BuildTargetsResolutionError";
  errorDescription:
    "Unable to resolve the given target to a set of targets to build.";
  errorInstanceId: string;
  parameters: {};
}

/**
   * The build targets are up to date and no Build was created. To rebuild the targets regardless,
use the force build option when creating the Build.
   *
   * Log Safety: SAFE
   */
export interface BuildTargetsUpToDate {
  errorCode: "INVALID_ARGUMENT";
  errorName: "BuildTargetsUpToDate";
  errorDescription:
    "The build targets are up to date and no Build was created. To rebuild the targets regardless, use the force build option when creating the Build.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not cancel the Build.
 *
 * Log Safety: SAFE
 */
export interface CancelBuildPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CancelBuildPermissionDenied";
  errorDescription: "Could not cancel the Build.";
  errorInstanceId: string;
  parameters: {
    buildRid: unknown;
  };
}

/**
 * Could not create the Build.
 *
 * Log Safety: SAFE
 */
export interface CreateBuildPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateBuildPermissionDenied";
  errorDescription: "Could not create the Build.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the Schedule.
 *
 * Log Safety: SAFE
 */
export interface CreateSchedulePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateSchedulePermissionDenied";
  errorDescription: "Could not create the Schedule.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not delete the Schedule.
 *
 * Log Safety: SAFE
 */
export interface DeleteSchedulePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteSchedulePermissionDenied";
  errorDescription: "Could not delete the Schedule.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * Could not getAffectedResources the Schedule.
 *
 * Log Safety: SAFE
 */
export interface GetAffectedResourcesSchedulePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetAffectedResourcesSchedulePermissionDenied";
  errorDescription: "Could not getAffectedResources the Schedule.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * The AND trigger should have at least one value.
 *
 * Log Safety: SAFE
 */
export interface InvalidAndTrigger {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAndTrigger";
  errorDescription: "The AND trigger should have at least one value.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The given MediaSet rid is invalid.
 *
 * Log Safety: SAFE
 */
export interface InvalidMediaSetTrigger {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidMediaSetTrigger";
  errorDescription: "The given MediaSet rid is invalid.";
  errorInstanceId: string;
  parameters: {
    mediaSetRid: unknown;
  };
}

/**
 * The OR trigger should have at least one value.
 *
 * Log Safety: SAFE
 */
export interface InvalidOrTrigger {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidOrTrigger";
  errorDescription: "The OR trigger should have at least one value.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The schedule description is too long.
 *
 * Log Safety: SAFE
 */
export interface InvalidScheduleDescription {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidScheduleDescription";
  errorDescription: "The schedule description is too long.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The schedule name is too long.
 *
 * Log Safety: SAFE
 */
export interface InvalidScheduleName {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidScheduleName";
  errorDescription: "The schedule name is too long.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The schedule trigger cron expression is invalid.
 *
 * Log Safety: SAFE
 */
export interface InvalidTimeTrigger {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTimeTrigger";
  errorDescription: "The schedule trigger cron expression is invalid.";
  errorInstanceId: string;
  parameters: {
    cronExpression: unknown;
  };
}

/**
 * The given Job could not be found.
 *
 * Log Safety: SAFE
 */
export interface JobNotFound {
  errorCode: "NOT_FOUND";
  errorName: "JobNotFound";
  errorDescription: "The given Job could not be found.";
  errorInstanceId: string;
  parameters: {
    jobRid: unknown;
  };
}

/**
 * The build target must contains at least one dataset target.
 *
 * Log Safety: SAFE
 */
export interface MissingBuildTargets {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingBuildTargets";
  errorDescription:
    "The build target must contains at least one dataset target.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The connecting build target must contains at least one input dataset target.
 *
 * Log Safety: SAFE
 */
export interface MissingConnectingBuildInputs {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingConnectingBuildInputs";
  errorDescription:
    "The connecting build target must contains at least one input dataset target.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * You must pass in a trigger when creating or updating a schedule.
 *
 * Log Safety: SAFE
 */
export interface MissingTrigger {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingTrigger";
  errorDescription:
    "You must pass in a trigger when creating or updating a schedule.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not pause the Schedule.
 *
 * Log Safety: SAFE
 */
export interface PauseSchedulePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PauseSchedulePermissionDenied";
  errorDescription: "Could not pause the Schedule.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * Could not replace the Schedule.
 *
 * Log Safety: SAFE
 */
export interface ReplaceSchedulePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceSchedulePermissionDenied";
  errorDescription: "Could not replace the Schedule.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * Could not run the Schedule.
 *
 * Log Safety: SAFE
 */
export interface RunSchedulePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RunSchedulePermissionDenied";
  errorDescription: "Could not run the Schedule.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * The target schedule is currently running.
 *
 * Log Safety: SAFE
 */
export interface ScheduleAlreadyRunning {
  errorCode: "CONFLICT";
  errorName: "ScheduleAlreadyRunning";
  errorDescription: "The target schedule is currently running.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * The given Schedule could not be found.
 *
 * Log Safety: SAFE
 */
export interface ScheduleNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ScheduleNotFound";
  errorDescription: "The given Schedule could not be found.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * The given resources in the schedule trigger could not be found.
 *
 * Log Safety: SAFE
 */
export interface ScheduleTriggerResourcesNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ScheduleTriggerResourcesNotFound";
  errorDescription:
    "The given resources in the schedule trigger could not be found.";
  errorInstanceId: string;
  parameters: {
    resourceRids: unknown;
  };
}

/**
 * The provided token does not have permission to use the given resources as a schedule trigger.
 *
 * Log Safety: SAFE
 */
export interface ScheduleTriggerResourcesPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ScheduleTriggerResourcesPermissionDenied";
  errorDescription:
    "The provided token does not have permission to use the given resources as a schedule trigger.";
  errorInstanceId: string;
  parameters: {
    resourceRids: unknown;
  };
}

/**
 * The given ScheduleVersion could not be found.
 *
 * Log Safety: SAFE
 */
export interface ScheduleVersionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ScheduleVersionNotFound";
  errorDescription: "The given ScheduleVersion could not be found.";
  errorInstanceId: string;
  parameters: {
    scheduleVersionRid: unknown;
  };
}

/**
 * Could not search the Build.
 *
 * Log Safety: SAFE
 */
export interface SearchBuildsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SearchBuildsPermissionDenied";
  errorDescription: "Could not search the Build.";
  errorInstanceId: string;
  parameters: {};
}

/**
   * The schedule target is not supported. The schedule target must be either a connecting target, upstream
target or list of single dataset targets.
   *
   * Log Safety: SAFE
   */
export interface TargetNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TargetNotSupported";
  errorDescription:
    "The schedule target is not supported. The schedule target must be either a connecting target, upstream target or list of single dataset targets.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}

/**
 * Could not unpause the Schedule.
 *
 * Log Safety: SAFE
 */
export interface UnpauseSchedulePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UnpauseSchedulePermissionDenied";
  errorDescription: "Could not unpause the Schedule.";
  errorInstanceId: string;
  parameters: {
    scheduleRid: unknown;
  };
}
