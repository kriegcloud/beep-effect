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
import type * as _Datasets from "@osdk/foundry.datasets";
import type * as _Filesystem from "@osdk/foundry.filesystem";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
   * If any job in the build is unsuccessful, immediately finish the
build by cancelling all other jobs.
   *
   * Log Safety: SAFE
   */
export type AbortOnFailure = boolean;

/**
 * Log Safety: UNSAFE
 */
export interface Action {
  target: BuildTarget;
  branchName: _Core.BranchName;
  fallbackBranches: FallbackBranches;
  forceBuild: ForceBuild;
  retryCount?: RetryCount;
  retryBackoffDuration?: RetryBackoffDuration;
  abortOnFailure: AbortOnFailure;
  notificationsEnabled: NotificationsEnabled;
}

/**
 * Log Safety: SAFE
 */
export interface AffectedResourcesResponse {
  datasets: Array<BuildableRid>;
}

/**
 * Trigger after all of the given triggers emit an event.
 *
 * Log Safety: UNSAFE
 */
export interface AndTrigger {
  triggers: Array<Trigger>;
}

/**
 * Log Safety: UNSAFE
 */
export interface Build {
  rid: _Core.BuildRid;
  branchName: _Core.BranchName;
  createdTime: _Core.CreatedTime;
  createdBy: _Core.CreatedBy;
  fallbackBranches: FallbackBranches;
  jobRids: Array<_Core.JobRid>;
  retryCount: RetryCount;
  retryBackoffDuration: RetryBackoffDuration;
  abortOnFailure: AbortOnFailure;
  status: BuildStatus;
  scheduleRid?: _Core.ScheduleRid;
}

/**
   * The Resource Identifier (RID) of a Resource that can be built. For example, this is a Dataset RID, Media Set
RID or Restricted View RID.
   *
   * Log Safety: SAFE
   */
export type BuildableRid = LooselyBrandedString<"BuildableRid">;

/**
 * The status of the build.
 *
 * Log Safety: SAFE
 */
export type BuildStatus = "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED";

/**
 * The targets of the build.
 *
 * Log Safety: SAFE
 */
export type BuildTarget =
  | ({ type: "upstream" } & UpstreamTarget)
  | ({ type: "manual" } & ManualTarget)
  | ({ type: "connecting" } & ConnectingTarget);

/**
   * All datasets between the input datasets (exclusive) and the
target datasets (inclusive) except for the datasets to ignore.
   *
   * Log Safety: SAFE
   */
export interface ConnectingTarget {
  inputRids: Array<BuildableRid>;
  targetRids: Array<BuildableRid>;
  ignoredRids: Array<BuildableRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateBuildRequest {
  target: BuildTarget;
  branchName?: _Core.BranchName;
  fallbackBranches: FallbackBranches;
  forceBuild?: ForceBuild;
  retryCount?: RetryCount;
  retryBackoffDuration?: RetryBackoffDuration;
  abortOnFailure?: AbortOnFailure;
  notificationsEnabled?: NotificationsEnabled;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequest {
  displayName?: string;
  description?: string;
  action: CreateScheduleRequestAction;
  trigger?: Trigger;
  scopeMode?: CreateScheduleRequestScopeMode;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestAction {
  abortOnFailure?: AbortOnFailure;
  forceBuild?: ForceBuild;
  retryBackoffDuration?: RetryBackoffDuration;
  retryCount?: RetryCount;
  fallbackBranches?: FallbackBranches;
  branchName?: _Core.BranchName;
  notificationsEnabled?: NotificationsEnabled;
  target: CreateScheduleRequestBuildTarget;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestAndTrigger {
  triggers: Array<Trigger>;
}

/**
 * The targets of the build.
 *
 * Log Safety: SAFE
 */
export type CreateScheduleRequestBuildTarget =
  | ({ type: "upstream" } & CreateScheduleRequestUpstreamTarget)
  | ({ type: "manual" } & CreateScheduleRequestManualTarget)
  | ({ type: "connecting" } & CreateScheduleRequestConnectingTarget);

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestConnectingTarget {
  ignoredRids?: Array<BuildableRid>;
  targetRids: Array<BuildableRid>;
  inputRids: Array<BuildableRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestDatasetUpdatedTrigger {
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
}

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestDuration {
  unit: _Core.TimeUnit;
  value: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestJobSucceededTrigger {
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
}

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestManualTarget {
  targetRids: Array<BuildableRid>;
}

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestManualTrigger {}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestMediaSetUpdatedTrigger {
  branchName?: _Core.BranchName;
  mediaSetRid: _Core.MediaSetRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestNewLogicTrigger {
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestOrTrigger {
  triggers: Array<Trigger>;
}

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestProjectScope {
  projectRids: Array<_Filesystem.ProjectRid>;
}

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestScheduleSucceededTrigger {
  scheduleRid: _Core.ScheduleRid;
}

/**
 * The boundaries for the schedule build.
 *
 * Log Safety: SAFE
 */
export type CreateScheduleRequestScopeMode =
  | ({ type: "project" } & CreateScheduleRequestProjectScope)
  | ({ type: "user" } & CreateScheduleRequestUserScope);

/**
 * Log Safety: UNSAFE
 */
export interface CreateScheduleRequestTableUpdatedTrigger {
  branchName?: _Core.BranchName;
  tableRid: _Core.TableRid;
}

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestTimeTrigger {
  cronExpression: CronExpression;
  timeZone?: _Core.ZoneId;
}

/**
 * Log Safety: UNSAFE
 */
export type CreateScheduleRequestTrigger =
  | ({ type: "jobSucceeded" } & CreateScheduleRequestJobSucceededTrigger)
  | ({ type: "or" } & CreateScheduleRequestOrTrigger)
  | ({ type: "newLogic" } & CreateScheduleRequestNewLogicTrigger)
  | ({ type: "tableUpdated" } & CreateScheduleRequestTableUpdatedTrigger)
  | ({ type: "and" } & CreateScheduleRequestAndTrigger)
  | ({ type: "datasetUpdated" } & CreateScheduleRequestDatasetUpdatedTrigger)
  | ({
    type: "scheduleSucceeded";
  } & CreateScheduleRequestScheduleSucceededTrigger)
  | ({ type: "mediaSetUpdated" } & CreateScheduleRequestMediaSetUpdatedTrigger)
  | ({ type: "time" } & CreateScheduleRequestTimeTrigger)
  | ({ type: "manual" } & CreateScheduleRequestManualTrigger);

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestUpstreamTarget {
  ignoredRids?: Array<BuildableRid>;
  targetRids: Array<BuildableRid>;
}

/**
 * Log Safety: SAFE
 */
export interface CreateScheduleRequestUserScope {}

/**
   * A standard CRON expression with minute, hour, day, month
and day of week.
   *
   * Log Safety: SAFE
   */
export type CronExpression = LooselyBrandedString<"CronExpression">;

/**
 * Log Safety: SAFE
 */
export interface DatasetJobOutput {
  datasetRid: _Core.DatasetRid;
  outputTransactionRid?: _Datasets.TransactionRid;
}

/**
   * Trigger whenever a new transaction is committed to the
dataset on the target branch.
   *
   * Log Safety: UNSAFE
   */
export interface DatasetUpdatedTrigger {
  datasetRid: _Core.DatasetRid;
  branchName: _Core.BranchName;
}

/**
   * The branches to retrieve JobSpecs from if no JobSpec is found on the
target branch.
   *
   * Log Safety: UNSAFE
   */
export type FallbackBranches = Array<_Core.BranchName>;

/**
 * Whether to ignore staleness information when running the build.
 *
 * Log Safety: SAFE
 */
export type ForceBuild = boolean;

/**
 * Log Safety: SAFE
 */
export interface GetBuildsBatchRequestElement {
  buildRid: _Core.BuildRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetBuildsBatchResponse {
  data: Record<_Core.BuildRid, Build>;
}

/**
 * Log Safety: SAFE
 */
export interface GetJobsBatchRequestElement {
  jobRid: _Core.JobRid;
}

/**
 * Log Safety: SAFE
 */
export interface GetJobsBatchResponse {
  data: Record<_Core.JobRid, Job>;
}

/**
 * Log Safety: SAFE
 */
export interface GetSchedulesBatchRequestElement {
  scheduleRid: _Core.ScheduleRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetSchedulesBatchResponse {
  data: Record<_Core.ScheduleRid, Schedule>;
}

/**
 * Log Safety: SAFE
 */
export interface Job {
  rid: _Core.JobRid;
  buildRid: _Core.BuildRid;
  startedTime: JobStartedTime;
  latestAttemptStartTime?: string;
  finishedTime?: string;
  jobStatus: JobStatus;
  outputs: Array<JobOutput>;
}

/**
 * Other types of Job Outputs exist in Foundry. Currently, only Dataset and Media Set are supported by the API.
 *
 * Log Safety: SAFE
 */
export type JobOutput =
  | ({ type: "datasetJobOutput" } & DatasetJobOutput)
  | ({
    type: "transactionalMediaSetJobOutput";
  } & TransactionalMediaSetJobOutput);

/**
 * The time this job started waiting for the dependencies to be resolved.
 *
 * Log Safety: SAFE
 */
export type JobStartedTime = string;

/**
 * The status of the job.
 *
 * Log Safety: SAFE
 */
export type JobStatus =
  | "WAITING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "DID_NOT_RUN";

/**
   * Trigger whenever a job succeeds on the dataset and on the target
branch.
   *
   * Log Safety: UNSAFE
   */
export interface JobSucceededTrigger {
  datasetRid: _Core.DatasetRid;
  branchName: _Core.BranchName;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListJobsOfBuildResponse {
  data: Array<Job>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListRunsOfScheduleResponse {
  data: Array<ScheduleRun>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Manually specify all datasets to build.
 *
 * Log Safety: SAFE
 */
export interface ManualTarget {
  targetRids: Array<BuildableRid>;
}

/**
 * Only trigger the Schedule manually. If placed in an AND or OR condition, this Trigger will be ignored.
 *
 * Log Safety: SAFE
 */
export interface ManualTrigger {}

/**
   * Trigger whenever an update is made to a media set on the target
branch. For transactional media sets, this happens when a transaction
is committed. For non-transactional media sets, this event happens
eventually (but not necessary immediately) after an update.
   *
   * Log Safety: UNSAFE
   */
export interface MediaSetUpdatedTrigger {
  mediaSetRid: _Core.MediaSetRid;
  branchName: _Core.BranchName;
}

/**
   * Trigger whenever a new JobSpec is put on the dataset and on
that branch.
   *
   * Log Safety: UNSAFE
   */
export interface NewLogicTrigger {
  branchName: _Core.BranchName;
  datasetRid: _Core.DatasetRid;
}

/**
   * Whether to receive a notification at the end of the build.
The notification will be sent to the user that has most recently edited the schedule.
No notification will be sent if the schedule has scopeMode set to ProjectScope.
   *
   * Log Safety: SAFE
   */
export type NotificationsEnabled = boolean;

/**
 * Trigger whenever any of the given triggers emit an event.
 *
 * Log Safety: UNSAFE
 */
export interface OrTrigger {
  triggers: Array<Trigger>;
}

/**
 * The schedule will only build resources in the following projects.
 *
 * Log Safety: SAFE
 */
export interface ProjectScope {
  projectRids: Array<_Filesystem.ProjectRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequest {
  displayName?: string;
  description?: string;
  action: ReplaceScheduleRequestAction;
  trigger?: Trigger;
  scopeMode?: ReplaceScheduleRequestScopeMode;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestAction {
  abortOnFailure?: AbortOnFailure;
  forceBuild?: ForceBuild;
  retryBackoffDuration?: RetryBackoffDuration;
  retryCount?: RetryCount;
  fallbackBranches?: FallbackBranches;
  branchName?: _Core.BranchName;
  notificationsEnabled?: NotificationsEnabled;
  target: ReplaceScheduleRequestBuildTarget;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestAndTrigger {
  triggers: Array<Trigger>;
}

/**
 * The targets of the build.
 *
 * Log Safety: SAFE
 */
export type ReplaceScheduleRequestBuildTarget =
  | ({ type: "upstream" } & ReplaceScheduleRequestUpstreamTarget)
  | ({ type: "manual" } & ReplaceScheduleRequestManualTarget)
  | ({ type: "connecting" } & ReplaceScheduleRequestConnectingTarget);

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestConnectingTarget {
  ignoredRids?: Array<BuildableRid>;
  targetRids: Array<BuildableRid>;
  inputRids: Array<BuildableRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestDatasetUpdatedTrigger {
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestDuration {
  unit: _Core.TimeUnit;
  value: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestJobSucceededTrigger {
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestManualTarget {
  targetRids: Array<BuildableRid>;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestManualTrigger {}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestMediaSetUpdatedTrigger {
  branchName?: _Core.BranchName;
  mediaSetRid: _Core.MediaSetRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestNewLogicTrigger {
  datasetRid: _Core.DatasetRid;
  branchName?: _Core.BranchName;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestOrTrigger {
  triggers: Array<Trigger>;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestProjectScope {
  projectRids: Array<_Filesystem.ProjectRid>;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestScheduleSucceededTrigger {
  scheduleRid: _Core.ScheduleRid;
}

/**
 * The boundaries for the schedule build.
 *
 * Log Safety: SAFE
 */
export type ReplaceScheduleRequestScopeMode =
  | ({ type: "project" } & ReplaceScheduleRequestProjectScope)
  | ({ type: "user" } & ReplaceScheduleRequestUserScope);

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceScheduleRequestTableUpdatedTrigger {
  branchName?: _Core.BranchName;
  tableRid: _Core.TableRid;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestTimeTrigger {
  cronExpression: CronExpression;
  timeZone?: _Core.ZoneId;
}

/**
 * Log Safety: UNSAFE
 */
export type ReplaceScheduleRequestTrigger =
  | ({ type: "jobSucceeded" } & ReplaceScheduleRequestJobSucceededTrigger)
  | ({ type: "or" } & ReplaceScheduleRequestOrTrigger)
  | ({ type: "newLogic" } & ReplaceScheduleRequestNewLogicTrigger)
  | ({ type: "tableUpdated" } & ReplaceScheduleRequestTableUpdatedTrigger)
  | ({ type: "and" } & ReplaceScheduleRequestAndTrigger)
  | ({ type: "datasetUpdated" } & ReplaceScheduleRequestDatasetUpdatedTrigger)
  | ({
    type: "scheduleSucceeded";
  } & ReplaceScheduleRequestScheduleSucceededTrigger)
  | ({ type: "mediaSetUpdated" } & ReplaceScheduleRequestMediaSetUpdatedTrigger)
  | ({ type: "time" } & ReplaceScheduleRequestTimeTrigger)
  | ({ type: "manual" } & ReplaceScheduleRequestManualTrigger);

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestUpstreamTarget {
  ignoredRids?: Array<BuildableRid>;
  targetRids: Array<BuildableRid>;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceScheduleRequestUserScope {}

/**
 * The duration to wait before retrying after a Job fails.
 *
 * Log Safety: SAFE
 */
export type RetryBackoffDuration = _Core.Duration;

/**
   * The number of retry attempts for failed Jobs within the Build. A Job's failure is not considered final until
all retries have been attempted or an error occurs indicating that retries cannot be performed. Be aware,
not all types of failures can be retried.
   *
   * Log Safety: SAFE
   */
export type RetryCount = number;

/**
 * Log Safety: UNSAFE
 */
export interface Schedule {
  rid: _Core.ScheduleRid;
  displayName?: string;
  description?: string;
  currentVersionRid: ScheduleVersionRid;
  createdTime: _Core.CreatedTime;
  createdBy: _Core.CreatedBy;
  updatedTime: _Core.UpdatedTime;
  updatedBy: _Core.UpdatedBy;
  paused: SchedulePaused;
  trigger?: Trigger;
  action: Action;
  scopeMode: ScopeMode;
}

/**
 * Log Safety: UNSAFE
 */
export type SchedulePaused = boolean;

/**
 * Log Safety: UNSAFE
 */
export interface ScheduleRun {
  rid: ScheduleRunRid;
  scheduleRid: _Core.ScheduleRid;
  scheduleVersionRid: ScheduleVersionRid;
  createdTime: _Core.CreatedTime;
  createdBy?: _Core.CreatedBy;
  result?: ScheduleRunResult;
}

/**
 * An error occurred attempting to run the schedule.
 *
 * Log Safety: UNSAFE
 */
export interface ScheduleRunError {
  errorName: ScheduleRunErrorName;
  description: string;
}

/**
 * Log Safety: SAFE
 */
export type ScheduleRunErrorName =
  | "TargetResolutionFailure"
  | "CyclicDependency"
  | "IncompatibleTargets"
  | "PermissionDenied"
  | "JobSpecNotFound"
  | "ScheduleOwnerNotFound"
  | "Internal";

/**
 * The schedule is not running as all targets are up-to-date.
 *
 * Log Safety: SAFE
 */
export interface ScheduleRunIgnored {}

/**
   * The result of attempting to trigger the schedule. The schedule run will either be submitted as a build,
ignored if all targets are up-to-date or error.
   *
   * Log Safety: UNSAFE
   */
export type ScheduleRunResult =
  | ({ type: "ignored" } & ScheduleRunIgnored)
  | ({ type: "submitted" } & ScheduleRunSubmitted)
  | ({ type: "error" } & ScheduleRunError);

/**
 * The RID of a schedule run
 *
 * Log Safety: SAFE
 */
export type ScheduleRunRid = LooselyBrandedString<"ScheduleRunRid">;

/**
 * The schedule has been successfully triggered.
 *
 * Log Safety: SAFE
 */
export interface ScheduleRunSubmitted {
  buildRid: _Core.BuildRid;
}

/**
   * Trigger whenever the specified schedule completes its action
successfully.
   *
   * Log Safety: SAFE
   */
export interface ScheduleSucceededTrigger {
  scheduleRid: _Core.ScheduleRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface ScheduleVersion {
  rid: ScheduleVersionRid;
  scheduleRid: _Core.ScheduleRid;
  createdTime: _Core.CreatedTime;
  createdBy: _Core.CreatedBy;
  trigger?: Trigger;
  action: Action;
  scopeMode: ScopeMode;
}

/**
 * The RID of a schedule version
 *
 * Log Safety: SAFE
 */
export type ScheduleVersionRid = LooselyBrandedString<"ScheduleVersionRid">;

/**
 * The boundaries for the schedule build.
 *
 * Log Safety: SAFE
 */
export type ScopeMode =
  | ({ type: "project" } & ProjectScope)
  | ({ type: "user" } & UserScope);

/**
 * Returns the Builds where every filter is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface SearchBuildsAndFilter {
  items: Array<SearchBuildsFilter>;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchBuildsEqualsFilter {
  field: SearchBuildsEqualsFilterField;
  value: any;
}

/**
 * Log Safety: SAFE
 */
export type SearchBuildsEqualsFilterField =
  | "CREATED_BY"
  | "BRANCH_NAME"
  | "STATUS"
  | "RID";

/**
 * Log Safety: UNSAFE
 */
export type SearchBuildsFilter =
  | ({ type: "not" } & SearchBuildsNotFilter)
  | ({ type: "or" } & SearchBuildsOrFilter)
  | ({ type: "and" } & SearchBuildsAndFilter)
  | ({ type: "lt" } & SearchBuildsLtFilter)
  | ({ type: "gte" } & SearchBuildsGteFilter)
  | ({ type: "eq" } & SearchBuildsEqualsFilter);

/**
 * Log Safety: UNSAFE
 */
export interface SearchBuildsGteFilter {
  field: SearchBuildsGteFilterField;
  value: any;
}

/**
 * Log Safety: SAFE
 */
export type SearchBuildsGteFilterField = "STARTED_TIME" | "FINISHED_TIME";

/**
 * Log Safety: UNSAFE
 */
export interface SearchBuildsLtFilter {
  field: SearchBuildsLtFilterField;
  value: any;
}

/**
 * Log Safety: SAFE
 */
export type SearchBuildsLtFilterField = "STARTED_TIME" | "FINISHED_TIME";

/**
 * Returns the Builds where the filter is not satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface SearchBuildsNotFilter {
  value: SearchBuildsFilter;
}

/**
 * Log Safety: SAFE
 */
export interface SearchBuildsOrderBy {
  fields: Array<SearchBuildsOrderByItem>;
}

/**
 * Log Safety: SAFE
 */
export type SearchBuildsOrderByField = "STARTED_TIME" | "FINISHED_TIME";

/**
 * Log Safety: SAFE
 */
export interface SearchBuildsOrderByItem {
  field: SearchBuildsOrderByField;
  direction: _Core.OrderByDirection;
}

/**
 * Returns the Builds where at least one filter is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface SearchBuildsOrFilter {
  items: Array<SearchBuildsFilter>;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchBuildsRequest {
  where: SearchBuildsFilter;
  orderBy?: SearchBuildsOrderBy;
  pageToken?: _Core.PageToken;
  pageSize?: _Core.PageSize;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchBuildsResponse {
  data: Array<Build>;
  nextPageToken?: _Core.PageToken;
}

/**
   * Trigger whenever a new transaction is committed to the
table on the target branch.
   *
   * Log Safety: UNSAFE
   */
export interface TableUpdatedTrigger {
  tableRid: _Core.TableRid;
  branchName: _Core.BranchName;
}

/**
 * Trigger on a time based schedule.
 *
 * Log Safety: SAFE
 */
export interface TimeTrigger {
  cronExpression: CronExpression;
  timeZone: _Core.ZoneId;
}

/**
 * Log Safety: SAFE
 */
export interface TransactionalMediaSetJobOutput {
  mediaSetRid: _Core.MediaSetRid;
  transactionId?: string;
}

/**
 * Log Safety: UNSAFE
 */
export type Trigger =
  | ({ type: "jobSucceeded" } & JobSucceededTrigger)
  | ({ type: "or" } & OrTrigger)
  | ({ type: "newLogic" } & NewLogicTrigger)
  | ({ type: "tableUpdated" } & TableUpdatedTrigger)
  | ({ type: "and" } & AndTrigger)
  | ({ type: "datasetUpdated" } & DatasetUpdatedTrigger)
  | ({ type: "scheduleSucceeded" } & ScheduleSucceededTrigger)
  | ({ type: "mediaSetUpdated" } & MediaSetUpdatedTrigger)
  | ({ type: "time" } & TimeTrigger)
  | ({ type: "manual" } & ManualTrigger);

/**
 * Target the specified datasets along with all upstream datasets except the ignored datasets.
 *
 * Log Safety: SAFE
 */
export interface UpstreamTarget {
  targetRids: Array<BuildableRid>;
  ignoredRids: Array<BuildableRid>;
}

/**
   * When triggered, the schedule will build all resources that the
associated user is permitted to build.
   *
   * Log Safety: SAFE
   */
export interface UserScope {}
