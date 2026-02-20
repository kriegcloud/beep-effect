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
   * A check of the given type for the given subject(s) already exists. The conflicting check will be returned
if the provided token has permission to view it.
   *
   * Log Safety: UNSAFE
   */
export interface CheckAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "CheckAlreadyExists";
  errorDescription:
    "A check of the given type for the given subject(s) already exists. The conflicting check will be returned if the provided token has permission to view it.";
  errorInstanceId: string;
  parameters: {
    conflictingCheck: unknown;
  };
}

/**
 * The given Check could not be found.
 *
 * Log Safety: SAFE
 */
export interface CheckNotFound {
  errorCode: "NOT_FOUND";
  errorName: "CheckNotFound";
  errorDescription: "The given Check could not be found.";
  errorInstanceId: string;
  parameters: {
    checkRid: unknown;
  };
}

/**
 * CheckReportLimit must be less than or equal to 100
 *
 * Log Safety: SAFE
 */
export interface CheckReportLimitAboveMaximum {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CheckReportLimitAboveMaximum";
  errorDescription: "CheckReportLimit must be less than or equal to 100";
  errorInstanceId: string;
  parameters: {
    value: unknown;
    maxInclusive: unknown;
  };
}

/**
 * CheckReportLimit must be greater than or equal to 1
 *
 * Log Safety: SAFE
 */
export interface CheckReportLimitBelowMinimum {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CheckReportLimitBelowMinimum";
  errorDescription: "CheckReportLimit must be greater than or equal to 1";
  errorInstanceId: string;
  parameters: {
    value: unknown;
    minInclusive: unknown;
  };
}

/**
 * The given CheckReport could not be found.
 *
 * Log Safety: SAFE
 */
export interface CheckReportNotFound {
  errorCode: "NOT_FOUND";
  errorName: "CheckReportNotFound";
  errorDescription: "The given CheckReport could not be found.";
  errorInstanceId: string;
  parameters: {
    checkReportRid: unknown;
    checkRid: unknown;
  };
}

/**
 * The type of the requested check is not yet supported in the Platform API.
 *
 * Log Safety: UNSAFE
 */
export interface CheckTypeNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CheckTypeNotSupported";
  errorDescription:
    "The type of the requested check is not yet supported in the Platform API.";
  errorInstanceId: string;
  parameters: {
    checkType: unknown;
  };
}

/**
 * Could not create the Check.
 *
 * Log Safety: SAFE
 */
export interface CreateCheckPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateCheckPermissionDenied";
  errorDescription: "Could not create the Check.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not delete the Check.
 *
 * Log Safety: SAFE
 */
export interface DeleteCheckPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteCheckPermissionDenied";
  errorDescription: "Could not delete the Check.";
  errorInstanceId: string;
  parameters: {
    checkRid: unknown;
  };
}

/**
 * Could not getLatest the CheckReport.
 *
 * Log Safety: SAFE
 */
export interface GetLatestCheckReportsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetLatestCheckReportsPermissionDenied";
  errorDescription: "Could not getLatest the CheckReport.";
  errorInstanceId: string;
  parameters: {
    checkRid: unknown;
  };
}

/**
 * The NumericColumnCheckConfig is invalid. It must contain at least one of numericBounds or trend.
 *
 * Log Safety: SAFE
 */
export interface InvalidNumericColumnCheckConfig {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidNumericColumnCheckConfig";
  errorDescription:
    "The NumericColumnCheckConfig is invalid. It must contain at least one of numericBounds or trend.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The PercentageCheckConfig is invalid. It must contain at least one of percentageBounds or medianDeviation.
 *
 * Log Safety: SAFE
 */
export interface InvalidPercentageCheckConfig {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPercentageCheckConfig";
  errorDescription:
    "The PercentageCheckConfig is invalid. It must contain at least one of percentageBounds or medianDeviation.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The TimeCheckConfig is invalid. It must contain at least one of timeBounds or medianDeviation.
 *
 * Log Safety: SAFE
 */
export interface InvalidTimeCheckConfig {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTimeCheckConfig";
  errorDescription:
    "The TimeCheckConfig is invalid. It must contain at least one of timeBounds or medianDeviation.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The TransactionTimeCheckConfig is invalid. It must contain at least one of timeBounds or medianDeviation.
 *
 * Log Safety: SAFE
 */
export interface InvalidTransactionTimeCheckConfig {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTransactionTimeCheckConfig";
  errorDescription:
    "The TransactionTimeCheckConfig is invalid. It must contain at least one of timeBounds or medianDeviation.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The TrendConfig is invalid. It must contain at least one of trendType or differenceBounds.
 *
 * Log Safety: SAFE
 */
export interface InvalidTrendConfig {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTrendConfig";
  errorDescription:
    "The TrendConfig is invalid. It must contain at least one of trendType or differenceBounds.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Changing the type of a check after it has been created is not supported.
 *
 * Log Safety: SAFE
 */
export interface ModifyingCheckTypeNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ModifyingCheckTypeNotSupported";
  errorDescription:
    "Changing the type of a check after it has been created is not supported.";
  errorInstanceId: string;
  parameters: {
    originalCheckType: unknown;
    newCheckType: unknown;
  };
}

/**
 * PercentageValue must be less than or equal to 100.0
 *
 * Log Safety: SAFE
 */
export interface PercentageValueAboveMaximum {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PercentageValueAboveMaximum";
  errorDescription: "PercentageValue must be less than or equal to 100.0";
  errorInstanceId: string;
  parameters: {
    value: unknown;
    maxInclusive: unknown;
  };
}

/**
 * PercentageValue must be greater than or equal to 0.0
 *
 * Log Safety: SAFE
 */
export interface PercentageValueBelowMinimum {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PercentageValueBelowMinimum";
  errorDescription: "PercentageValue must be greater than or equal to 0.0";
  errorInstanceId: string;
  parameters: {
    value: unknown;
    minInclusive: unknown;
  };
}

/**
 * Could not replace the Check.
 *
 * Log Safety: SAFE
 */
export interface ReplaceCheckPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceCheckPermissionDenied";
  errorDescription: "Could not replace the Check.";
  errorInstanceId: string;
  parameters: {
    checkRid: unknown;
  };
}
