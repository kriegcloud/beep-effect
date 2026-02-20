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
 * Checkpoint justification that requires the user to mark a checkbox.
 *
 * Log Safety: UNSAFE
 */
export interface AcknowledgementJustification {
  prompt: string;
  description?: string;
  title: string;
}

/**
 * User that performed the checkpoint action.
 *
 * Log Safety: UNSAFE
 */
export interface ActingUser {
  userId: _Core.UserId;
  username: RedactableString;
  organizationRid?: OrganizationRid;
}

/**
 * Metadata linking a checkpoint record to an Approvals workflow.
 *
 * Log Safety: SAFE
 */
export interface ApprovalsMetadata {
  approvalsTaskId: ApprovalsTaskId;
  approvalsSubtaskIds: Array<ApprovalsSubtaskId>;
}

/**
 * Identifier of an Approvals subtask tied to the checkpoint.
 *
 * Log Safety: SAFE
 */
export type ApprovalsSubtaskId = LooselyBrandedString<"ApprovalsSubtaskId">;

/**
 * Identifier of an Approvals task tied to the checkpoint.
 *
 * Log Safety: SAFE
 */
export type ApprovalsTaskId = LooselyBrandedString<"ApprovalsTaskId">;

/**
 * An ontology action type that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedActionType {
  actionTypeRid: string;
  ontology: CheckpointedOntology;
}

/**
 * Action type identifier for a checkpointed action type.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedActionTypeRid {
  rid: string;
}

/**
 * A group that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedGroup {
  groupId: string;
}

/**
 * Group identifier for a checkpointed group.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedGroupId {
  id: string;
}

/**
 * An intervention that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedIntervention {
  interventionRid: string;
}

/**
 * Intervention identifier for a checkpointed intervention.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedInterventionRid {
  rid: string;
}

/**
 * An issue that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedIssue {
  issueRid: string;
}

/**
 * Issue identifier for a checkpointed issue.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedIssueRid {
  rid: string;
}

/**
 * Snapshot of the entity that was captured in a checkpoint.
 *
 * Log Safety: UNSAFE
 */
export type CheckpointedItem =
  | ({ type: "checkpointedIssue" } & CheckpointedIssue)
  | ({ type: "checkpointedJob" } & CheckpointedJob)
  | ({ type: "checkpointedSchedule" } & CheckpointedSchedule)
  | ({ type: "checkpointedResource" } & CheckpointedResource)
  | ({ type: "checkpointedJobSpecification" } & CheckpointedJobSpecification)
  | ({ type: "checkpointedLanguageModel" } & CheckpointedLanguageModel)
  | ({ type: "checkpointedGroup" } & CheckpointedGroup)
  | ({
    type: "checkpointedUserIntakeSubmission";
  } & CheckpointedUserIntakeSubmission)
  | ({ type: "checkpointedObjectSet" } & CheckpointedObjectSet)
  | ({ type: "checkpointedMarking" } & CheckpointedMarking)
  | ({
    type: "checkpointedMarketplaceProduct";
  } & CheckpointedMarketplaceProduct)
  | ({ type: "checkpointedRole" } & CheckpointedRole)
  | ({ type: "checkpointedIntervention" } & CheckpointedIntervention)
  | ({
    type: "checkpointedLanguageModelSession";
  } & CheckpointedLanguageModelSession)
  | ({ type: "checkpointedToken" } & CheckpointedToken)
  | ({
    type: "checkpointedUserIntakeFormInput";
  } & CheckpointedUserIntakeFormInput)
  | ({ type: "checkpointedPrincipal" } & CheckpointedPrincipal)
  | ({ type: "checkpointedActionType" } & CheckpointedActionType);

/**
   * Identifier for a checkpointed item. This union type explicitly identifies the type of item
being referenced, eliminating ambiguity between RIDs and string IDs.
   *
   * Log Safety: UNSAFE
   */
export type CheckpointedItemId =
  | ({ type: "checkpointedJobRid" } & CheckpointedJobRid)
  | ({ type: "checkpointedMarkingId" } & CheckpointedMarkingId)
  | ({ type: "checkpointedTokenId" } & CheckpointedTokenId)
  | ({ type: "checkpointedGroupId" } & CheckpointedGroupId)
  | ({
    type: "checkpointedObjectSetVersionedRid";
  } & CheckpointedObjectSetVersionedRid)
  | ({
    type: "checkpointedObjectSetTypesProxyRids";
  } & CheckpointedObjectSetTypesProxyRids)
  | ({ type: "checkpointedResourceRid" } & CheckpointedResourceRid)
  | ({ type: "checkpointedIssueRid" } & CheckpointedIssueRid)
  | ({ type: "checkpointedInterventionRid" } & CheckpointedInterventionRid)
  | ({ type: "checkpointedJobSpecRid" } & CheckpointedJobSpecRid)
  | ({ type: "checkpointedActionTypeRid" } & CheckpointedActionTypeRid)
  | ({ type: "checkpointedScheduleRid" } & CheckpointedScheduleRid)
  | ({ type: "checkpointedRoleId" } & CheckpointedRoleId)
  | ({
    type: "checkpointedUserIntakeFormInputId";
  } & CheckpointedUserIntakeFormInputId)
  | ({
    type: "checkpointedMarketplaceProductId";
  } & CheckpointedMarketplaceProductId)
  | ({ type: "checkpointedLanguageModelRid" } & CheckpointedLanguageModelRid)
  | ({ type: "checkpointedPrincipalId" } & CheckpointedPrincipalId)
  | ({
    type: "checkpointedLanguageModelSessionRid";
  } & CheckpointedLanguageModelSessionRid)
  | ({
    type: "checkpointedUserIntakeSubmissionRid";
  } & CheckpointedUserIntakeSubmissionRid);

/**
 * The type of item that was captured as part of the checkpoint.
 *
 * Log Safety: SAFE
 */
export type CheckpointedItemType =
  | "RESOURCE"
  | "MARKING"
  | "TOKEN"
  | "PRINCIPAL"
  | "JOB"
  | "GROUP"
  | "ROLE"
  | "MARKETPLACE_PRODUCT"
  | "INTERVENTION"
  | "SCHEDULE"
  | "JOB_SPECIFICATION"
  | "LANGUAGE_MODEL"
  | "LANGUAGE_MODEL_SESSION"
  | "USER_INTAKE_SUBMISSION"
  | "USER_INTAKE_FORM_INPUT"
  | "ACTION_TYPE"
  | "OBJECT_TYPE"
  | "OBJECT_SET"
  | "ONTOLOGY"
  | "ISSUE";

/**
 * A build job that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedJob {
  jobRid: string;
}

/**
 * Job identifier for a checkpointed job.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedJobRid {
  rid: string;
}

/**
 * A job specification that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedJobSpecification {
  jobSpecRid: string;
}

/**
 * Job specification identifier for a checkpointed job spec.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedJobSpecRid {
  rid: string;
}

/**
 * A language model that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedLanguageModel {
  modelRid: string;
}

/**
 * Language model identifier for a checkpointed language model.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedLanguageModelRid {
  rid: string;
}

/**
 * A language model session that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedLanguageModelSession {
  sessionRid: string;
}

/**
 * Language model session identifier for a checkpointed session.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedLanguageModelSessionRid {
  rid: string;
}

/**
 * A Marketplace product that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedMarketplaceProduct {
  productId: string;
}

/**
 * Marketplace product identifier for a checkpointed product.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedMarketplaceProductId {
  id: string;
}

/**
 * A marking that was captured as part of a checkpoint.
 *
 * Log Safety: UNSAFE
 */
export interface CheckpointedMarking {
  markingId: string;
}

/**
 * Marking identifier for a checkpointed marking.
 *
 * Log Safety: UNSAFE
 */
export interface CheckpointedMarkingId {
  id: string;
}

/**
 * Represents the object set that was checkpointed.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedObjectSet {
  versioned?: CheckpointedVersionedObjectSet;
  typesProxy?: CheckpointedObjectSetTypesProxy;
}

/**
 * A types proxy object set that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedObjectSetTypesProxy {
  objectTypes: Array<CheckpointedOntologyWithObjectTypes>;
}

/**
 * Object type RIDs for a types proxy object set.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedObjectSetTypesProxyRids {
  rids: Array<string>;
}

/**
 * Versioned object set RID for a checkpointed object set.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedObjectSetVersionedRid {
  rid: string;
}

/**
 * An ontology snapshot that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedOntology {
  ontologyRid: string;
  ontologyVersion: string;
  namespaceRid?: NamespaceRid;
}

/**
 * An ontology with its associated object types that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedOntologyWithObjectTypes {
  ontology: CheckpointedOntology;
  objectTypeRids: Array<string>;
}

/**
 * A user or group principal that was captured as part of a checkpoint.
 *
 * Log Safety: UNSAFE
 */
export interface CheckpointedPrincipal {
  id: string;
  username: RedactableString;
  organizationRid?: OrganizationRid;
  role: CheckpointedPrincipalRole;
}

/**
 * Principal identifier for a checkpointed principal.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedPrincipalId {
  id: string;
}

/**
 * Role the principal had relative to the checkpointed entity.
 *
 * Log Safety: SAFE
 */
export type CheckpointedPrincipalRole =
  | "SOURCE_SHARE_RECIPIENT"
  | "TARGET_GROUP"
  | "GROUP_MEMBER"
  | "MARKING_MEMBER"
  | "ROLE_GRANT_RECIPIENT"
  | "MFA_METHOD_RESET_TARGET"
  | "ISSUE_ASSIGNEE";

/**
 * A Foundry resource that was captured as part of a checkpoint.
 *
 * Log Safety: UNSAFE
 */
export interface CheckpointedResource {
  rid: string;
  resourceType: CheckpointedResourceType;
  name?: RedactableString;
  projectRid?: ProjectRid;
  namespaceRid?: NamespaceRid;
  compassPath: RedactableString;
  orgMarkings: Array<string>;
}

/**
 * Resource identifier for a checkpointed resource.
 *
 * Log Safety: UNSAFE
 */
export interface CheckpointedResourceRid {
  rid: string;
}

/**
 * Type of resource that was captured.
 *
 * Log Safety: SAFE
 */
export type CheckpointedResourceType =
  | "CONTOUR_ANALYSIS"
  | "CONTOUR_SOURCE_DATASET"
  | "DATA_CONNECTION_SYNC"
  | "DATA_CONNECTION_SOURCE"
  | "DATA_CONNECTION_SYNC_TARGET_DATASET"
  | "HUBBLE_OBJECT_TYPE"
  | "EXPORTED_RESOURCE"
  | "IMPORTED_RESOURCE"
  | "REPORT"
  | "CIPHER_CHANNEL"
  | "CIPHER_LICENSE"
  | "PARENT_RESOURCE"
  | "ATTACHMENT"
  | "SLATE_APPLICATION"
  | "NOTEPAD"
  | "DATASET"
  | "MEDIA_SET"
  | "CODE_REPOSITORY"
  | "CODE_WORKBOOK"
  | "CODE_WORKSPACE"
  | "TELEMETRY_CONTAINER"
  | "REFERENCED_RESOURCE"
  | "ROLE_GRANT_RESOURCE"
  | "PROJECT"
  | "STORE"
  | "THIRD_PARTY_APPLICATION"
  | "BUILDER_PIPELINE"
  | "MODEL"
  | "MODEL_VERSION"
  | "AGENT"
  | "WORKSHOP_MODULE"
  | "WALKTHROUGH"
  | "FLOW_CAPTURE";

/**
 * A role that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedRole {
  roleId: string;
}

/**
 * Role identifier for a checkpointed role.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedRoleId {
  id: string;
}

/**
 * A schedule that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedSchedule {
  scheduleRid: string;
}

/**
 * Schedule identifier for a checkpointed schedule.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedScheduleRid {
  rid: string;
}

/**
 * An authentication token that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedToken {
  tokenId: string;
  tokenType: CheckpointedTokenType;
}

/**
 * Token identifier for a checkpointed token.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedTokenId {
  id: string;
}

/**
 * The type of token that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export type CheckpointedTokenType = "USER_TOKEN";

/**
 * A user intake form input that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedUserIntakeFormInput {
  inputId: string;
}

/**
 * User intake form input identifier for a checkpointed form input.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedUserIntakeFormInputId {
  id: string;
}

/**
 * A user intake form submission that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedUserIntakeSubmission {
  submissionRid: string;
}

/**
 * User intake submission identifier for a checkpointed submission.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedUserIntakeSubmissionRid {
  rid: string;
}

/**
 * A versioned object set that was captured as part of a checkpoint.
 *
 * Log Safety: SAFE
 */
export interface CheckpointedVersionedObjectSet {
  versionedObjectSetRid: string;
  objectSetVersion: string;
  objectTypes: Array<CheckpointedOntologyWithObjectTypes>;
}

/**
   * Checkpoint type identifier. See the Checkpoints documentation
for more details.
   *
   * Log Safety: SAFE
   */
export type CheckpointType =
  | "CONTOUR_CREATE"
  | "CONTOUR_EXPORT"
  | "HUBBLE_EXPORT"
  | "COMPASS_IMPORT"
  | "COMPASS_EXPORT"
  | "COMPASS_ADD_REFERENCE"
  | "COMPASS_AUTHORIZE_MARKING_ON_PROJECT"
  | "COMPASS_ADD_ROLE_GRANT"
  | "COMPASS_REMOVE_REFERENCE"
  | "COMPASS_REMOVE_AUTHORIZED_MARKING_FROM_PROJECT"
  | "COMPASS_REMOVE_ROLE_GRANT"
  | "DATA_CONNECTION_SYNC_CREATE"
  | "DATA_CONNECTION_SYNC_BULK_CREATE"
  | "DATA_CONNECTION_SYNC_EDIT"
  | "DATA_CONNECTION_SOURCE_SHARE"
  | "LOGIN"
  | "REPORT_EXPORT"
  | "CIPHER_ENCRYPT"
  | "CIPHER_DECRYPT"
  | "ATTACHMENT_IMPORT"
  | "ATTACHMENT_EXPORT"
  | "SLATE_EXPORT"
  | "NOTEPAD_EXPORT"
  | "QUIVER_EXPORT"
  | "DATA_LIFETIME_APPLY_RETENTION_POLICY"
  | "FRONTEND_EXPORT"
  | "BUILD_LOG_EXPORT"
  | "CODE_REPOSITORY_LOG_EXPORT"
  | "CODE_REPOSITORY_MODIFY_APPROVAL_POLICY"
  | "CODE_REPOSITORY_MERGE_PULL_REQUEST"
  | "CODE_REPOSITORY_BUILD"
  | "CODE_WORKBOOK_BUILD"
  | "SCHEDULE_CREATE"
  | "SCHEDULE_MODIFY"
  | "SCHEDULE_RUN"
  | "SCHEDULE_DELETE"
  | "RUN_BUILD"
  | "MULTIPASS_TOKEN_CREATE"
  | "MULTIPASS_ADD_GROUP_MEMBER"
  | "MULTIPASS_ADD_MARKING_MEMBER"
  | "MULTIPASS_REMOVE_GROUP_MEMBER"
  | "MULTIPASS_REMOVE_MARKING_MEMBER"
  | "MULTIPASS_UPDATE_GROUP_MEMBERSHIP_EXPIRATION_CONFIG"
  | "MULTIPASS_UPDATE_GROUP_MEMBER_EXPIRY"
  | "SCOPED_SESSION_SELECT"
  | "CODE_WORKSPACE_LOG_EXPORT"
  | "CODE_WORKSPACE_MOVE_DATA_FROM_FOUNDRY"
  | "CODE_WORKSPACE_MOVE_DATA_TO_FOUNDRY"
  | "MANAGE_CODE_WORKSPACE_DASHBOARD_DOWNLOADS"
  | "NOTEPAD_MEDIA_IMPORT"
  | "CONTOUR_DASHBOARD_EXPORT"
  | "PACKAGE_PRODUCT"
  | "NOTEPAD_WIDGET_SNAPSHOT"
  | "MEDIA_SET_IMPORT"
  | "MEDIA_SET_EXPORT"
  | "UPGRADE_ASSISTANT_SUMMARY_EXPORT"
  | "TABLES_REGISTRATION_AUTOMATIC"
  | "TABLES_REGISTRATION_MANUAL"
  | "DEV_CONSOLE_OPENAPI_SPECIFICATION_EXPORT"
  | "DEV_CONSOLE_USAGE_EXPORT"
  | "DEPLOY_PIPELINE"
  | "PIPELINE_BUILDER_MERGE_PROPOSAL"
  | "PIPELINE_BUILDER_MODIFY_APPROVAL_POLICY"
  | "PIPELINE_BUILDER_ARCHIVE_BRANCHES"
  | "PIPELINE_BUILDER_MODIFY_FALLBACK_BRANCHES"
  | "MODEL_EXPORT"
  | "THREADS_SESSION_EXPORT"
  | "AGENT_SESSION_EXPORT"
  | "USER_INTAKE_SUBMISSION_EXPORT"
  | "FUNCTION_BACKED_EXPORT"
  | "SUBMIT_ACTION"
  | "START_WALKTHROUGH"
  | "OBJECT_SET_EXPORT"
  | "RESET_MFA_METHOD"
  | "ISSUE_CREATE"
  | "RECORD_FLOW_CAPTURE"
  | "UPLOAD_DATA_TO_FLOW_CAPTURE"
  | "EXPORT_FLOW_CAPTURE_ZIP"
  | "INSIGHT_LOAD";

/**
 * Identifier of the checkpoint configuration that produced a record.
 *
 * Log Safety: SAFE
 */
export type ConfigRid = LooselyBrandedString<"ConfigRid">;

/**
 * Checkpoint justification where the user selects one or more options from a dropdown.
 *
 * Log Safety: UNSAFE
 */
export interface DropdownJustification {
  selectedOptions: Array<DropdownSelection>;
  prompt: string;
  description?: string;
  title: string;
}

/**
 * A selection made within a multi-select dropdown justification.
 *
 * Log Safety: UNSAFE
 */
export interface DropdownSelection {
  selectedOption: string;
  additionalResponse?: string;
}

/**
 * Log Safety: SAFE
 */
export interface GetRecordsBatchRequestElement {
  recordRid: RecordRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetRecordsBatchResponse {
  data: Record<RecordRid, _Record>;
}

/**
 * Identifier of the interaction associated with a record.
 *
 * Log Safety: SAFE
 */
export type InteractionRid = LooselyBrandedString<"InteractionRid">;

/**
 * Justification submitted by the user to pass a checkpoint.
 *
 * Log Safety: UNSAFE
 */
export type Justification =
  | ({ type: "responseJustification" } & ResponseJustification)
  | ({ type: "dropdownJustification" } & DropdownJustification)
  | ({ type: "reauthenticationJustification" } & ReauthenticationJustification)
  | ({ type: "acknowledgementJustification" } & AcknowledgementJustification);

/**
 * Determines how free-text justification input should be matched.
 *
 * Log Safety: SAFE
 */
export type JustificationMatchType = "EXACT" | "CONTAINS";

/**
 * Identifier of the namespace associated with a checkpoint.
 *
 * Log Safety: SAFE
 */
export type NamespaceRid = LooselyBrandedString<"NamespaceRid">;

/**
 * Identifier of the organization associated with a checkpoint.
 *
 * Log Safety: SAFE
 */
export type OrganizationRid = LooselyBrandedString<"OrganizationRid">;

/**
 * Identifier of the project that scoped a checkpoint.
 *
 * Log Safety: SAFE
 */
export type ProjectRid = LooselyBrandedString<"ProjectRid">;

/**
 * Checkpoint justification that requires the user to reauthenticate with the platform.
 *
 * Log Safety: UNSAFE
 */
export interface ReauthenticationJustification {
  reauthenticationId: string;
  prompt: string;
  description?: string;
  title: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface _Record {
  rid: RecordRid;
  configRid?: ConfigRid;
  type: CheckpointType;
  scope: Scope;
  actingUser: ActingUser;
  delegateUserId?: _Core.UserId;
  createdAt: RecordCreatedAt;
  checkpointedItems: Array<CheckpointedItem>;
  justification: Justification;
  projectRid?: ProjectRid;
  organizationRid?: OrganizationRid;
  namespaceRid?: NamespaceRid;
  interactionRid?: InteractionRid;
  approvalsMetadata?: ApprovalsMetadata;
}

/**
 * Log Safety: SAFE
 */
export type RecordCreatedAt = string;

/**
 * Identifier of a checkpoint record.
 *
 * Log Safety: SAFE
 */
export type RecordRid = LooselyBrandedString<"RecordRid">;

/**
 * A string value that may be redacted for privacy reasons.
 *
 * Log Safety: UNSAFE
 */
export interface RedactableString {
  value?: string;
  redactionType?: RedactionType;
}

/**
 * Indicates why a string value was redacted.
 *
 * Log Safety: SAFE
 */
export type RedactionType = "USER_REDACTED" | "RESOURCE_REDACTED";

/**
 * Checkpoint justification that requires the user to input a free-text response.
 *
 * Log Safety: UNSAFE
 */
export interface ResponseJustification {
  response: string;
  prompt: string;
  description?: string;
  title: string;
}

/**
 * Indicates whether the checkpoint was scoped to a user or resource.
 *
 * Log Safety: SAFE
 */
export type Scope = "USER_SCOPED" | "RESOURCE_SCOPED";

/**
 * Logical conjunction of checkpoint record filters.
 *
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsAndFilter {
  filters: Array<SearchCheckpointRecordsFilter>;
}

/**
 * Filter for checkpointed item identifier matches.
 *
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsCheckpointedItemIdFilter {
  checkpointedItemId: CheckpointedItemId;
}

/**
 * Filter for exact field value matches.
 *
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsEqualsFilter {
  field: SearchCheckpointRecordsEqualsFilterField;
  value: string;
}

/**
 * Fields that support equality filtering.
 *
 * Log Safety: SAFE
 */
export type SearchCheckpointRecordsEqualsFilterField =
  | "recordRid"
  | "configRid"
  | "checkpointType"
  | "actingUserId"
  | "delegateUserId"
  | "organizationRid"
  | "namespaceRid"
  | "interactionRid"
  | "checkpointedItemType";

/**
 * Search criteria for checkpoint records.
 *
 * Log Safety: UNSAFE
 */
export type SearchCheckpointRecordsFilter =
  | ({ type: "not" } & SearchCheckpointRecordsNotFilter)
  | ({ type: "or" } & SearchCheckpointRecordsOrFilter)
  | ({ type: "textSearch" } & SearchCheckpointRecordsTextSearchFilter)
  | ({ type: "and" } & SearchCheckpointRecordsAndFilter)
  | ({ type: "lt" } & SearchCheckpointRecordsLtFilter)
  | ({ type: "gte" } & SearchCheckpointRecordsGteFilter)
  | ({ type: "eq" } & SearchCheckpointRecordsEqualsFilter)
  | ({
    type: "checkpointedItemId";
  } & SearchCheckpointRecordsCheckpointedItemIdFilter);

/**
 * Filter for greater-than-or-equal comparisons.
 *
 * Log Safety: SAFE
 */
export interface SearchCheckpointRecordsGteFilter {
  field: SearchCheckpointRecordsGteFilterField;
  value: string;
}

/**
 * Fields that support greater-than-or-equal filtering.
 *
 * Log Safety: SAFE
 */
export type SearchCheckpointRecordsGteFilterField = "createdAt";

/**
 * Filter for less-than comparisons.
 *
 * Log Safety: SAFE
 */
export interface SearchCheckpointRecordsLtFilter {
  field: SearchCheckpointRecordsLtFilterField;
  value: string;
}

/**
 * Fields that support less-than filtering.
 *
 * Log Safety: SAFE
 */
export type SearchCheckpointRecordsLtFilterField = "createdAt";

/**
 * Logical negation of a checkpoint record filter.
 *
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsNotFilter {
  filter: SearchCheckpointRecordsFilter;
}

/**
 * Logical disjunction of checkpoint record filters.
 *
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsOrFilter {
  filters: Array<SearchCheckpointRecordsFilter>;
}

/**
 * Request payload for searching checkpoint records.
 *
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsRequest {
  filter: SearchCheckpointRecordsFilter;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsResponse {
  data: Array<_Record>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Filter for text search on justification fields.
 *
 * Log Safety: UNSAFE
 */
export interface SearchCheckpointRecordsTextSearchFilter {
  field: SearchCheckpointRecordsTextSearchFilterField;
  query: string;
  matchType: JustificationMatchType;
}

/**
 * Fields that support text search filtering.
 *
 * Log Safety: SAFE
 */
export type SearchCheckpointRecordsTextSearchFilterField =
  | "justificationResponse"
  | "justificationSelectedOption"
  | "justificationAdditionalResponse";

/**
 * Log Safety: UNSAFE
 */
export interface SearchRecordsRequest {
  where: SearchCheckpointRecordsRequest;
  pageToken?: _Core.PageToken;
  pageSize?: _Core.PageSize;
  sortDirection?: SortDirection;
}

/**
 * Log Safety: SAFE
 */
export type SortDirection = "ASC" | "DESC";
