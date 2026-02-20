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

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Checks that values in a column are within an allowed set of values.
 *
 * Log Safety: UNSAFE
 */
export interface AllowedColumnValuesCheckConfig {
  subject: DatasetSubject;
  columnName: ColumnName;
  allowedValues: Array<ColumnValue>;
  allowNull?: boolean;
  severity: SeverityLevel;
}

/**
 * Checks the approximate percentage of unique values in a specific column.
 *
 * Log Safety: UNSAFE
 */
export interface ApproximateUniquePercentageCheckConfig {
  subject: DatasetSubject;
  percentageCheckConfig: PercentageCheckConfig;
}

/**
 * A boolean column value.
 *
 * Log Safety: UNSAFE
 */
export interface BooleanColumnValue {
  value: boolean;
}

/**
 * The name of a Branch.
 *
 * Log Safety: UNSAFE
 */
export type BranchName = LooselyBrandedString<"BranchName">;

/**
 * Checks the total time a build takes to complete.
 *
 * Log Safety: UNSAFE
 */
export interface BuildDurationCheckConfig {
  subject: DatasetSubject;
  timeCheckConfig: TimeCheckConfig;
}

/**
 * Checks the status of the most recent build of the dataset.
 *
 * Log Safety: UNSAFE
 */
export interface BuildStatusCheckConfig {
  subject: DatasetSubject;
  statusCheckConfig: StatusCheckConfig;
}

/**
 * Log Safety: UNSAFE
 */
export interface Check {
  rid: _Core.CheckRid;
  groups: Array<CheckGroupRid>;
  config: CheckConfig;
  intent?: CheckIntent;
  createdBy?: _Core.CreatedBy;
  updatedTime?: _Core.UpdatedTime;
}

/**
 * Configuration of a check.
 *
 * Log Safety: UNSAFE
 */
export type CheckConfig =
  | ({ type: "numericColumnRange" } & NumericColumnRangeCheckConfig)
  | ({ type: "jobStatus" } & JobStatusCheckConfig)
  | ({ type: "numericColumnMean" } & NumericColumnMeanCheckConfig)
  | ({ type: "dateColumnRange" } & DateColumnRangeCheckConfig)
  | ({ type: "jobDuration" } & JobDurationCheckConfig)
  | ({
    type: "approximateUniquePercentage";
  } & ApproximateUniquePercentageCheckConfig)
  | ({ type: "buildStatus" } & BuildStatusCheckConfig)
  | ({ type: "columnType" } & ColumnTypeCheckConfig)
  | ({ type: "allowedColumnValues" } & AllowedColumnValuesCheckConfig)
  | ({ type: "timeSinceLastUpdated" } & TimeSinceLastUpdatedCheckConfig)
  | ({ type: "nullPercentage" } & NullPercentageCheckConfig)
  | ({ type: "totalColumnCount" } & TotalColumnCountCheckConfig)
  | ({ type: "numericColumnMedian" } & NumericColumnMedianCheckConfig)
  | ({ type: "buildDuration" } & BuildDurationCheckConfig)
  | ({ type: "schemaComparison" } & SchemaComparisonCheckConfig)
  | ({ type: "primaryKey" } & PrimaryKeyCheckConfig);

/**
 * The unique resource identifier (RID) of a CheckGroup.
 *
 * Log Safety: SAFE
 */
export type CheckGroupRid = LooselyBrandedString<"CheckGroupRid">;

/**
 * A note about why the Check was set up.
 *
 * Log Safety: UNSAFE
 */
export type CheckIntent = LooselyBrandedString<"CheckIntent">;

/**
 * Log Safety: UNSAFE
 */
export interface CheckReport {
  rid: _Core.CheckReportRid;
  check: Check;
  result: CheckResult;
  createdTime: _Core.CreatedTime;
}

/**
   * The maximum number of check reports to return in a single request.
Validation rules:

must be greater than or equal to 1
must be less than or equal to 100
   *
   * Log Safety: SAFE
   */
export type CheckReportLimit = number;

/**
 * The result of running a check.
 *
 * Log Safety: UNSAFE
 */
export interface CheckResult {
  status: CheckResultStatus;
  message?: string;
}

/**
 * The status of a check report execution.
 *
 * Log Safety: SAFE
 */
export type CheckResultStatus =
  | "PASSED"
  | "FAILED"
  | "WARNING"
  | "ERROR"
  | "NOT_APPLICABLE"
  | "NOT_COMPUTABLE";

/**
 * Configuration for column count validation with severity settings.
 *
 * Log Safety: SAFE
 */
export interface ColumnCountConfig {
  expectedValue: string;
  severity: SeverityLevel;
}

/**
 * Information about a column including its name and type.
 *
 * Log Safety: UNSAFE
 */
export interface ColumnInfo {
  name: ColumnName;
  columnType?: _Core.SchemaFieldType;
}

/**
 * Log Safety: UNSAFE
 */
export type ColumnName = LooselyBrandedString<"ColumnName">;

/**
 * Checks the existence and optionally the type of a specific column.
 *
 * Log Safety: UNSAFE
 */
export interface ColumnTypeCheckConfig {
  subject: DatasetSubject;
  columnTypeConfig: ColumnTypeConfig;
}

/**
 * Configuration for column type validation with severity settings.
 *
 * Log Safety: UNSAFE
 */
export interface ColumnTypeConfig {
  columnName: ColumnName;
  expectedType?: _Core.SchemaFieldType;
  severity: SeverityLevel;
}

/**
 * A column value that can be of different types.
 *
 * Log Safety: UNSAFE
 */
export type ColumnValue =
  | ({ type: "date" } & DateColumnValue)
  | ({ type: "boolean" } & BooleanColumnValue)
  | ({ type: "string" } & StringColumnValue)
  | ({ type: "numeric" } & NumericColumnValue);

/**
 * Log Safety: UNSAFE
 */
export interface CreateCheckRequest {
  config: CheckConfig;
  intent?: CheckIntent;
}

/**
 * The Resource Identifier (RID) of a Dataset.
 *
 * Log Safety: SAFE
 */
export type DatasetRid = LooselyBrandedString<"DatasetRid">;

/**
 * A dataset resource type.
 *
 * Log Safety: UNSAFE
 */
export interface DatasetSubject {
  datasetRid: _Core.DatasetRid;
  branchId: _Core.BranchName;
}

/**
 * The range of date values a check is expected to be within.
 *
 * Log Safety: SAFE
 */
export interface DateBounds {
  lowerBound?: string;
  upperBound?: string;
}

/**
 * Configuration for date bounds check with severity settings.
 *
 * Log Safety: SAFE
 */
export interface DateBoundsConfig {
  dateBounds: DateBounds;
  severity: SeverityLevel;
}

/**
 * Checks that values in a date column fall within a specified range.
 *
 * Log Safety: UNSAFE
 */
export interface DateColumnRangeCheckConfig {
  subject: DatasetSubject;
  columnName: ColumnName;
  dateBoundsConfig: DateBoundsConfig;
}

/**
 * A date column value.
 *
 * Log Safety: UNSAFE
 */
export interface DateColumnValue {
  value: string;
}

/**
 * The configuration for when the severity of the failing health check should be escalated to CRITICAL – after a given number of failures, possibly within a time interval.
 *
 * Log Safety: UNSAFE
 */
export interface EscalationConfig {
  failuresToCritical: number;
  timeIntervalInSeconds?: string;
}

/**
 * The response for getting the latest check reports.
 *
 * Log Safety: UNSAFE
 */
export interface GetLatestCheckReportsResponse {
  data: Array<CheckReport>;
}

/**
 * Whether empty transactions should be ignored when calculating time since last updated. If true (default), only transactions with actual data changes are considered.
 *
 * Log Safety: SAFE
 */
export type IgnoreEmptyTransactions = boolean;

/**
 * Checks the total time a job takes to complete.
 *
 * Log Safety: UNSAFE
 */
export interface JobDurationCheckConfig {
  subject: DatasetSubject;
  timeCheckConfig: TimeCheckConfig;
}

/**
 * Checks the status of the most recent job run on the dataset.
 *
 * Log Safety: UNSAFE
 */
export interface JobStatusCheckConfig {
  subject: DatasetSubject;
  statusCheckConfig: StatusCheckConfig;
}

/**
 * The number of thresholds the build's duration differs from the median.
 *
 * Log Safety: SAFE
 */
export interface MedianDeviation {
  boundsType?: MedianDeviationBoundsType;
  dataPoints: number;
  deviationThreshold: number;
}

/**
 * The three types of median deviations a bounds type can have: - LOWER_BOUND – Tests for significant deviations below the median value, - UPPER_BOUND – Tests for significant deviations above the median value, - TWO_TAILED – Tests for significant deviations in either direction from the median value.
 *
 * Log Safety: SAFE
 */
export type MedianDeviationBoundsType =
  | "LOWER_BOUND"
  | "UPPER_BOUND"
  | "TWO_TAILED";

/**
 * Configuration for median deviation check with severity settings.
 *
 * Log Safety: SAFE
 */
export interface MedianDeviationConfig {
  medianDeviation: MedianDeviation;
  severity: SeverityLevel;
}

/**
 * Checks the percentage of null values in a specific column.
 *
 * Log Safety: UNSAFE
 */
export interface NullPercentageCheckConfig {
  subject: DatasetSubject;
  percentageCheckConfig: PercentageCheckConfig;
}

/**
 * The range of numeric values a check is expected to be within.
 *
 * Log Safety: SAFE
 */
export interface NumericBounds {
  lowerBound?: number;
  upperBound?: number;
}

/**
 * Configuration for numeric bounds check with severity settings.
 *
 * Log Safety: SAFE
 */
export interface NumericBoundsConfig {
  numericBounds: NumericBounds;
  severity: SeverityLevel;
}

/**
 * Configuration for numeric column-based checks (such as mean or median). At least one of numericBounds or trend must be specified. Both may be provided to validate both the absolute value range and the trend behavior over time.
 *
 * Log Safety: UNSAFE
 */
export interface NumericColumnCheckConfig {
  columnName: ColumnName;
  numericBounds?: NumericBoundsConfig;
  trend?: TrendConfig;
}

/**
 * Checks the mean value of a numeric column.
 *
 * Log Safety: UNSAFE
 */
export interface NumericColumnMeanCheckConfig {
  subject: DatasetSubject;
  numericColumnCheckConfig: NumericColumnCheckConfig;
}

/**
 * Checks the median value of a numeric column.
 *
 * Log Safety: UNSAFE
 */
export interface NumericColumnMedianCheckConfig {
  subject: DatasetSubject;
  numericColumnCheckConfig: NumericColumnCheckConfig;
}

/**
 * Checks that values in a numeric column fall within a specified range.
 *
 * Log Safety: UNSAFE
 */
export interface NumericColumnRangeCheckConfig {
  subject: DatasetSubject;
  columnName: ColumnName;
  numericBoundsConfig: NumericBoundsConfig;
}

/**
 * A numeric column value.
 *
 * Log Safety: UNSAFE
 */
export interface NumericColumnValue {
  value: number;
}

/**
 * The configuration for the range of percentage values between which the health check is expected to succeed.
 *
 * Log Safety: SAFE
 */
export interface PercentageBounds {
  lowerBoundPercentage?: PercentageValue;
  upperBoundPercentage?: PercentageValue;
}

/**
 * Configuration for percentage bounds check with severity settings.
 *
 * Log Safety: SAFE
 */
export interface PercentageBoundsConfig {
  percentageBounds: PercentageBounds;
  severity: SeverityLevel;
}

/**
 * Configuration for percentage-based checks (such as null percentage).
 *
 * Log Safety: UNSAFE
 */
export interface PercentageCheckConfig {
  columnName: ColumnName;
  percentageBounds?: PercentageBoundsConfig;
  medianDeviation?: MedianDeviationConfig;
}

/**
   * A percentage value in the range 0.0 to 100.0.
Validation rules:

must be greater than or equal to 0.0
must be less than or equal to 100.0
   *
   * Log Safety: SAFE
   */
export type PercentageValue = number;

/**
 * Checks the uniqueness and non-null values of one or more columns (primary key constraint).
 *
 * Log Safety: UNSAFE
 */
export interface PrimaryKeyCheckConfig {
  subject: DatasetSubject;
  primaryKeyConfig: PrimaryKeyConfig;
}

/**
 * Configuration for primary key validation with severity settings.
 *
 * Log Safety: UNSAFE
 */
export interface PrimaryKeyConfig {
  columnNames: Array<ColumnName>;
  severity: SeverityLevel;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceAllowedColumnValuesCheckConfig {
  allowedValues: Array<ColumnValue>;
  severity: SeverityLevel;
  allowNull?: boolean;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceApproximateUniquePercentageCheckConfig {
  percentageCheckConfig: ReplacePercentageCheckConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceBuildDurationCheckConfig {
  timeCheckConfig: TimeCheckConfig;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceBuildStatusCheckConfig {
  statusCheckConfig: StatusCheckConfig;
}

/**
 * Configuration of a check.
 *
 * Log Safety: UNSAFE
 */
export type ReplaceCheckConfig =
  | ({ type: "numericColumnRange" } & ReplaceNumericColumnRangeCheckConfig)
  | ({ type: "jobStatus" } & ReplaceJobStatusCheckConfig)
  | ({ type: "numericColumnMean" } & ReplaceNumericColumnMeanCheckConfig)
  | ({ type: "dateColumnRange" } & ReplaceDateColumnRangeCheckConfig)
  | ({ type: "jobDuration" } & ReplaceJobDurationCheckConfig)
  | ({
    type: "approximateUniquePercentage";
  } & ReplaceApproximateUniquePercentageCheckConfig)
  | ({ type: "buildStatus" } & ReplaceBuildStatusCheckConfig)
  | ({ type: "columnType" } & ReplaceColumnTypeCheckConfig)
  | ({ type: "allowedColumnValues" } & ReplaceAllowedColumnValuesCheckConfig)
  | ({ type: "timeSinceLastUpdated" } & ReplaceTimeSinceLastUpdatedCheckConfig)
  | ({ type: "nullPercentage" } & ReplaceNullPercentageCheckConfig)
  | ({ type: "totalColumnCount" } & ReplaceTotalColumnCountCheckConfig)
  | ({ type: "numericColumnMedian" } & ReplaceNumericColumnMedianCheckConfig)
  | ({ type: "buildDuration" } & ReplaceBuildDurationCheckConfig)
  | ({ type: "schemaComparison" } & ReplaceSchemaComparisonCheckConfig)
  | ({ type: "primaryKey" } & ReplacePrimaryKeyCheckConfig);

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceCheckRequest {
  config: ReplaceCheckConfig;
  intent?: CheckIntent;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceColumnTypeCheckConfig {
  columnTypeConfig: ReplaceColumnTypeConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceColumnTypeConfig {
  severity: SeverityLevel;
  expectedType?: _Core.SchemaFieldType;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceDateColumnRangeCheckConfig {
  dateBoundsConfig: DateBoundsConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceJobDurationCheckConfig {
  timeCheckConfig: TimeCheckConfig;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceJobStatusCheckConfig {
  statusCheckConfig: StatusCheckConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceNullPercentageCheckConfig {
  percentageCheckConfig: ReplacePercentageCheckConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceNumericColumnCheckConfig {
  numericBounds?: NumericBoundsConfig;
  trend?: TrendConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceNumericColumnMeanCheckConfig {
  numericColumnCheckConfig: ReplaceNumericColumnCheckConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceNumericColumnMedianCheckConfig {
  numericColumnCheckConfig: ReplaceNumericColumnCheckConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceNumericColumnRangeCheckConfig {
  numericBoundsConfig: NumericBoundsConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplacePercentageCheckConfig {
  medianDeviation?: MedianDeviationConfig;
  percentageBounds?: PercentageBoundsConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplacePrimaryKeyCheckConfig {
  primaryKeyConfig: ReplacePrimaryKeyConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplacePrimaryKeyConfig {
  severity: SeverityLevel;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceSchemaComparisonCheckConfig {
  schemaComparisonConfig: SchemaComparisonConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceTimeSinceLastUpdatedCheckConfig {
  timeCheckConfig: TransactionTimeCheckConfig;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceTotalColumnCountCheckConfig {
  columnCountConfig: ColumnCountConfig;
}

/**
 * A schedule resource type.
 *
 * Log Safety: SAFE
 */
export interface ScheduleSubject {
  scheduleRid: _Core.ScheduleRid;
}

/**
 * Checks the dataset schema against an expected schema.
 *
 * Log Safety: UNSAFE
 */
export interface SchemaComparisonCheckConfig {
  subject: DatasetSubject;
  schemaComparisonConfig: SchemaComparisonConfig;
}

/**
 * Configuration for schema comparison validation with severity settings.
 *
 * Log Safety: UNSAFE
 */
export interface SchemaComparisonConfig {
  expectedSchema: SchemaInfo;
  schemaComparisonType: SchemaComparisonType;
  severity: SeverityLevel;
}

/**
   * The type of schema comparison to perform:

EXACT_MATCH_ORDERED_COLUMNS: Schemas must have identical columns in the same order.
EXACT_MATCH_UNORDERED_COLUMNS: Schemas must have identical columns but order doesn't matter.
COLUMN_ADDITIONS_ALLOWED: Expected schema columns must be present, additional columns are allowed and
missing column types are ignored.
COLUMN_ADDITIONS_ALLOWED_STRICT: Expected schema columns must be present, additional columns are allowed.
Both expected and actual columns must specify types and they must match exactly.
   *
   * Log Safety: SAFE
   */
export type SchemaComparisonType =
  | "EXACT_MATCH_ORDERED_COLUMNS"
  | "EXACT_MATCH_UNORDERED_COLUMNS"
  | "COLUMN_ADDITIONS_ALLOWED"
  | "COLUMN_ADDITIONS_ALLOWED_STRICT";

/**
 * Information about a dataset schema including all columns.
 *
 * Log Safety: UNSAFE
 */
export interface SchemaInfo {
  columns: Array<ColumnInfo>;
}

/**
 * The severity level of the check. Possible values are MODERATE or CRITICAL.
 *
 * Log Safety: SAFE
 */
export type SeverityLevel = "MODERATE" | "CRITICAL";

/**
 * Log Safety: UNSAFE
 */
export interface StatusCheckConfig {
  severity: SeverityLevel;
  escalationConfig?: EscalationConfig;
}

/**
 * A string column value.
 *
 * Log Safety: UNSAFE
 */
export interface StringColumnValue {
  value: string;
}

/**
 * The configuration for the range of time between which the health check is expected to succeed.
 *
 * Log Safety: SAFE
 */
export interface TimeBounds {
  lowerBoundInSeconds?: string;
  upperBoundInSeconds?: string;
}

/**
 * Configuration for time bounds check with severity settings.
 *
 * Log Safety: SAFE
 */
export interface TimeBoundsConfig {
  timeBounds: TimeBounds;
  severity: SeverityLevel;
}

/**
 * Log Safety: SAFE
 */
export interface TimeCheckConfig {
  timeBounds?: TimeBoundsConfig;
  medianDeviation?: MedianDeviationConfig;
}

/**
 * Checks the total time since the dataset has updated.
 *
 * Log Safety: UNSAFE
 */
export interface TimeSinceLastUpdatedCheckConfig {
  subject: DatasetSubject;
  timeCheckConfig: TransactionTimeCheckConfig;
}

/**
 * Checks the total number of columns in the dataset.
 *
 * Log Safety: UNSAFE
 */
export interface TotalColumnCountCheckConfig {
  subject: DatasetSubject;
  columnCountConfig: ColumnCountConfig;
}

/**
 * Defines the configuration of a transaction-based time check.
 *
 * Log Safety: SAFE
 */
export interface TransactionTimeCheckConfig {
  timeBounds?: TimeBoundsConfig;
  medianDeviation?: MedianDeviationConfig;
  ignoreEmptyTransactions?: IgnoreEmptyTransactions;
}

/**
 * Configuration for trend-based validation with severity settings. At least one of trendType or differenceBounds must be specified. Both may be provided to validate both the trend pattern and the magnitude of change.
 *
 * Log Safety: SAFE
 */
export interface TrendConfig {
  trendType?: TrendType;
  differenceBounds?: NumericBounds;
  severity: SeverityLevel;
}

/**
   * The type of trend to validate:

NON_INCREASING: Values should not increase over time
NON_DECREASING: Values should not decrease over time
STRICTLY_INCREASING: Values should strictly increase over time
STRICTLY_DECREASING: Values should strictly decrease over time
CONSTANT: Values should remain constant over time
   *
   * Log Safety: SAFE
   */
export type TrendType =
  | "NON_INCREASING"
  | "NON_DECREASING"
  | "STRICTLY_INCREASING"
  | "STRICTLY_DECREASING"
  | "CONSTANT";
