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
 * Cannot update a target board's columns if targets are present in the column.
 *
 * Log Safety: SAFE
 */
export interface CannotUpdateColumnsWithTargets {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CannotUpdateColumnsWithTargets";
  errorDescription:
    "Cannot update a target board's columns if targets are present in the column.";
  errorInstanceId: string;
  parameters: {
    targetBoardRid: unknown;
  };
}

/**
 * Non-create operations cannot be applied to unknown artifacts.
 *
 * Log Safety: UNSAFE
 */
export interface CannotUpdateUnknownArtifact {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CannotUpdateUnknownArtifact";
  errorDescription:
    "Non-create operations cannot be applied to unknown artifacts.";
  errorInstanceId: string;
  parameters: {
    artifactId: unknown;
    operation: unknown;
  };
}

/**
 * Could not create the HighPriorityTargetList.
 *
 * Log Safety: SAFE
 */
export interface CreateHighPriorityTargetListPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateHighPriorityTargetListPermissionDenied";
  errorDescription: "Could not create the HighPriorityTargetList.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the TargetBoard.
 *
 * Log Safety: SAFE
 */
export interface CreateTargetBoardPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateTargetBoardPermissionDenied";
  errorDescription: "Could not create the TargetBoard.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not createTargetIntel the Target.
 *
 * Log Safety: SAFE
 */
export interface CreateTargetIntelTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateTargetIntelTargetPermissionDenied";
  errorDescription: "Could not createTargetIntel the Target.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * Could not create the Target.
 *
 * Log Safety: SAFE
 */
export interface CreateTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateTargetPermissionDenied";
  errorDescription: "Could not create the Target.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not delete the TargetBoard.
 *
 * Log Safety: SAFE
 */
export interface DeleteTargetBoardPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteTargetBoardPermissionDenied";
  errorDescription: "Could not delete the TargetBoard.";
  errorInstanceId: string;
  parameters: {
    targetBoardRid: unknown;
  };
}

/**
 * Could not delete the Target.
 *
 * Log Safety: SAFE
 */
export interface DeleteTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteTargetPermissionDenied";
  errorDescription: "Could not delete the Target.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * Cannot find High Priority Target List from provided RID
 *
 * Log Safety: SAFE
 */
export interface HighPriorityTargetListNotFound {
  errorCode: "INVALID_ARGUMENT";
  errorName: "HighPriorityTargetListNotFound";
  errorDescription: "Cannot find High Priority Target List from provided RID";
  errorInstanceId: string;
  parameters: {
    highPriorityTargetListRid: unknown;
  };
}

/**
 * The specified portion markings are not valid.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidClassificationPortionMarkings {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidClassificationPortionMarkings";
  errorDescription: "The specified portion markings are not valid.";
  errorInstanceId: string;
  parameters: {
    portionMarkings: unknown;
  };
}

/**
 * The supplied geotrackable entity does not match the backing entity of the target.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidGeotrackableEntity {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidGeotrackableEntity";
  errorDescription:
    "The supplied geotrackable entity does not match the backing entity of the target.";
  errorInstanceId: string;
  parameters: {
    targetEntity: unknown;
    geotrackableEntity: unknown;
  };
}

/**
 * The specified symbol identification code (SIDC) was not valid based on MIL-STD-2525C specification.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidSidc {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidSidc";
  errorDescription:
    "The specified symbol identification code (SIDC) was not valid based on MIL-STD-2525C specification.";
  errorInstanceId: string;
  parameters: {
    invalidSidc: unknown;
  };
}

/**
 * The space rid is missing or invalid.
 *
 * Log Safety: SAFE
 */
export interface InvalidSpaceRid {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidSpaceRid";
  errorDescription: "The space rid is missing or invalid.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
  };
}

/**
 * Could not load the HighPriorityTargetList.
 *
 * Log Safety: SAFE
 */
export interface LoadHighPriorityTargetListPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LoadHighPriorityTargetListPermissionDenied";
  errorDescription: "Could not load the HighPriorityTargetList.";
  errorInstanceId: string;
  parameters: {
    highPriorityTargetListRid: unknown;
  };
}

/**
 * Could not load the TargetBoard.
 *
 * Log Safety: SAFE
 */
export interface LoadTargetBoardPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LoadTargetBoardPermissionDenied";
  errorDescription: "Could not load the TargetBoard.";
  errorInstanceId: string;
  parameters: {
    targetBoardRid: unknown;
  };
}

/**
 * Could not load the Target.
 *
 * Log Safety: SAFE
 */
export interface LoadTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LoadTargetPermissionDenied";
  errorDescription: "Could not load the Target.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * Could not modify the HighPriorityTargetList.
 *
 * Log Safety: SAFE
 */
export interface ModifyHighPriorityTargetListPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ModifyHighPriorityTargetListPermissionDenied";
  errorDescription: "Could not modify the HighPriorityTargetList.";
  errorInstanceId: string;
  parameters: {
    highPriorityTargetListRid: unknown;
  };
}

/**
 * Could not modify the TargetBoard.
 *
 * Log Safety: SAFE
 */
export interface ModifyTargetBoardPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ModifyTargetBoardPermissionDenied";
  errorDescription: "Could not modify the TargetBoard.";
  errorInstanceId: string;
  parameters: {
    targetBoardRid: unknown;
  };
}

/**
 * Could not modifyTargetIntel the Target.
 *
 * Log Safety: SAFE
 */
export interface ModifyTargetIntelTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ModifyTargetIntelTargetPermissionDenied";
  errorDescription: "Could not modifyTargetIntel the Target.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * Could not modify the Target.
 *
 * Log Safety: SAFE
 */
export interface ModifyTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ModifyTargetPermissionDenied";
  errorDescription: "Could not modify the Target.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * Multitenant mode is currently unknown.
 *
 * Log Safety: SAFE
 */
export interface MultitenantModeUnknown {
  errorCode: "INTERNAL";
  errorName: "MultitenantModeUnknown";
  errorDescription: "Multitenant mode is currently unknown.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not removeTargetIntel the Target.
 *
 * Log Safety: SAFE
 */
export interface RemoveTargetIntelTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveTargetIntelTargetPermissionDenied";
  errorDescription: "Could not removeTargetIntel the Target.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * The provided revision id is behind the current id.
 *
 * Log Safety: UNSAFE
 */
export interface RevisionOutdated {
  errorCode: "INVALID_ARGUMENT";
  errorName: "RevisionOutdated";
  errorDescription: "The provided revision id is behind the current id.";
  errorInstanceId: string;
  parameters: {
    id: unknown;
    revisionId: unknown;
  };
}

/**
 * Could not setTargetColumn the Target.
 *
 * Log Safety: SAFE
 */
export interface SetTargetColumnTargetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SetTargetColumnTargetPermissionDenied";
  errorDescription: "Could not setTargetColumn the Target.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * Cannot find target board from provided rid.
 *
 * Log Safety: SAFE
 */
export interface TargetBoardNotFound {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TargetBoardNotFound";
  errorDescription: "Cannot find target board from provided rid.";
  errorInstanceId: string;
  parameters: {
    targetBoardRid: unknown;
  };
}

/**
 * Cannot find target from provided rid.
 *
 * Log Safety: SAFE
 */
export interface TargetNotFound {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TargetNotFound";
  errorDescription: "Cannot find target from provided rid.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
  };
}

/**
 * Target must be located on the request target board.
 *
 * Log Safety: SAFE
 */
export interface TargetNotOnTargetBoard {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TargetNotOnTargetBoard";
  errorDescription: "Target must be located on the request target board.";
  errorInstanceId: string;
  parameters: {
    targetRid: unknown;
    boardRid: unknown;
  };
}

/**
 * The user is required to have owner permissions on the artifact.
 *
 * Log Safety: SAFE
 */
export interface UserHasNoOwnerPerms {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UserHasNoOwnerPerms";
  errorDescription:
    "The user is required to have owner permissions on the artifact.";
  errorInstanceId: string;
  parameters: {
    artifactId: unknown;
  };
}
