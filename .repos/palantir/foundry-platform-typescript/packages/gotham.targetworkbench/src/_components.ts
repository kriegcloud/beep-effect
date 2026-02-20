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

import type * as _Core from "@osdk/gotham.core";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
   * If an auto detection algorithm utilized artificial intelligence or LLMs, this field enables
storage of additional model information and debug logs.
   *
   * Log Safety: UNSAFE
   */
export interface AiReasoning {
  debugLogs?: string;
  model?: string;
  systemPrompt?: string;
  taskPrompt?: string;
}

/**
 * Security settings for board content
 *
 * Log Safety: UNSAFE
 */
export interface ArtifactSecurity {
  portionMarkings?: Array<PortionMarking>;
  spaceRid?: SpaceRid;
}

/**
   * The current version of the artifact to be modified.
The archive operation will be transformed against any concurrent operations
made since this version. If there are any conflicting edits that result in changes to
these operations when they're applied, that will be noted in the response.
   *
   * Log Safety: UNSAFE
   */
export type BaseRevisionId = LooselyBrandedString<"BaseRevisionId">;

/**
 * Log Safety: UNSAFE
 */
export interface ChatMessageId {
  chatChannelGid: ObjectPrimaryKey;
  matrixEventId: string;
}

/**
 * Color options for target board columns
 *
 * Log Safety: SAFE
 */
export type ColumnColor =
  | "RED"
  | "BLUE"
  | "GREEN"
  | "YELLOW"
  | "ORANGE"
  | "PURPLE";

/**
 * Log Safety: UNSAFE
 */
export interface CreateHighPriorityTargetListRequest {
  targetBoard?: TargetBoardRid;
  targetAois?: Array<HptlTargetAoi>;
  security: ArtifactSecurity;
  areaGeo?: GeoPolygon;
  areaObjectRid?: ObjectPrimaryKey;
  name: HighPriorityTargetListName;
  description?: string;
  targets?: Array<HighPriorityTargetListTarget>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTargetBoardRequest {
  security: ArtifactSecurity;
  highPriorityTargetList?: string;
  configuration?: TargetBoardConfiguration;
  name: TargetBoardName;
  description?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTargetIntelTargetRequest {
  id: IntelId;
  name: string;
  description?: string;
  domain: IntelDomain;
  validTime: string;
  location?: GeoCircle;
  confidence?: number;
  intelType: IntelUnion;
  source?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTargetRequest {
  sidc?: string;
  highPriorityTargetListTargetSubtype?: HptlTargetSubtype;
  column: TargetBoardColumnId;
  description?: string;
  targetType?: string;
  targetBoard: TargetBoardRid;
  entityRid?: ObjectPrimaryKey;
  targetIdentifier?: TargetIdentifier;
  security: ArtifactSecurity;
  aimpoints: Array<TargetAimpointV2>;
  detectionReasoning?: DetectionReasoning;
  name: TargetName;
  location?: LocationSource;
}

/**
 * Custom identifier for targets.
 *
 * Log Safety: UNSAFE
 */
export type CustomTargetIdentifier = LooselyBrandedString<
  "CustomTargetIdentifier"
>;

/**
 * Log Safety: UNSAFE
 */
export interface DetectionReasoning {
  algorithmName?: string;
  aiReasoning?: AiReasoning;
  configurationObjectRid?: FoundryObjectRid;
  detectionType?: DetectionType;
  location?: Location3dWithError;
  reasoning?: string;
  timestamp?: string;
  agentVersion?: string;
}

/**
   * AI_AUTO_DETECTION: This type should be set whenever a target is nominated through the use of a LLM or other artificial intelligence based algorithm.
DEFAULT_AUTO_DETECTION: This type should be set whenever a target is auto discovered, but not through the involvement of any artificial intelligence.
   *
   * Log Safety: SAFE
   */
export type DetectionType = "AI_AUTO_DETECTION" | "DEFAULT_AUTO_DETECTION";

/**
 * An object including the elevation and the linear error, both in meters.
 *
 * Log Safety: UNSAFE
 */
export interface ElevationWithError {
  elevationInMeters: number;
  linearErrorInMeters?: number;
}

/**
 * An empty response object indicating the request was successful.
 *
 * Log Safety: SAFE
 */
export type EmptySuccessResponse = any;

/**
 * A unique identifier of a Foundry object type.
 *
 * Log Safety: SAFE
 */
export type FoundryObjectRid = LooselyBrandedString<"FoundryObjectRid">;

/**
 * A circle representing the area a target is located.
 *
 * Log Safety: UNSAFE
 */
export interface GeoCircle {
  center: _Core.GeoPoint;
  radius: number;
}

/**
 * Geographic coordinates
 *
 * Log Safety: SAFE
 */
export interface GeoLocation {
  longitude: number;
  latitude: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface GeoPoint {
  elevation?: number;
  latitude: number;
  longitude: number;
}

/**
 * A Polygon representing the area where this High Priority Target List is applicable. If areaObjectRid exists, that field/area will be used and this field will be ignored.
 *
 * Log Safety: UNSAFE
 */
export interface GeoPolygon {
  points?: Array<_Core.GeoPoint>;
}

/**
 * A resource identifier (RID) of a Geotime Track tracking the target.
 *
 * Log Safety: UNSAFE
 */
export type GeotimeTrackRid = LooselyBrandedString<"GeotimeTrackRid">;

/**
 * Log Safety: UNSAFE
 */
export interface HighPriorityTargetList {
  rid: HighPriorityTargetListRid;
  name: HighPriorityTargetListName;
  description?: string;
  targetBoard?: TargetBoardRid;
  targets?: Array<HighPriorityTargetListTarget>;
  areaObjectRid?: ObjectPrimaryKey;
  areaGeo?: GeoPolygon;
  targetAois?: Array<HptlTargetAoi>;
  security: ArtifactSecurity;
}

/**
 * The Attack Guidance Matrix (AGM) on a Target on a High Priority Target List.
 *
 * Log Safety: UNSAFE
 */
export interface HighPriorityTargetListAgm {
  agmId: HighPriorityTargetListAgmId;
  effectorType?: HighPriorityTargetListEffectType;
  effector?: string;
  effectorPriority?: number;
  timelinessInMinutes?: number;
  accuracyInMeters?: number;
}

/**
 * Identifier of the Attack Guidance Matrix (AGM) associated with the High Priority Target List (HPTL).
 *
 * Log Safety: UNSAFE
 */
export type HighPriorityTargetListAgmId = LooselyBrandedString<
  "HighPriorityTargetListAgmId"
>;

/**
 * The action that should be taken on a Target in a High Priority Target List.
 *
 * Log Safety: SAFE
 */
export type HighPriorityTargetListEffectType =
  | "DESTROY"
  | "JAMMING"
  | "NEUTRALIZE"
  | "SUPPRESS"
  | "K_KILL"
  | "COG_KILL"
  | "F_KILL"
  | "G_KILL"
  | "MSN_KILL"
  | "M_KILL"
  | "M_SLASH_F_KILL"
  | "M_SLASH_MSN_KILL"
  | "M_SLASH_P_KILL"
  | "P_KILL"
  | "PM_KILL"
  | "PTO_KILL"
  | "TOA_KILL";

/**
 * Log Safety: UNSAFE
 */
export type HighPriorityTargetListName = LooselyBrandedString<
  "HighPriorityTargetListName"
>;

/**
 * The unique identifier for a High Priority Target List
 *
 * Log Safety: SAFE
 */
export type HighPriorityTargetListRid = LooselyBrandedString<
  "HighPriorityTargetListRid"
>;

/**
 * The target on a High Priority Target List.
 *
 * Log Safety: UNSAFE
 */
export interface HighPriorityTargetListTarget {
  highPriorityTargetListTargetId: HighPriorityTargetListTargetId;
  aoiId?: HptlTargetAoiId;
  targetType: string;
  targetSubtypes?: Array<HptlTargetSubtype>;
  priority: number;
  subPriority?: number;
  category?: string;
  elnots?: Array<HptlTargetElnot>;
  when: HighPriorityTargetListWhen;
  agm?: Record<HighPriorityTargetListAgmId, HighPriorityTargetListAgm>;
}

/**
 * Log Safety: UNSAFE
 */
export type HighPriorityTargetListTargetId = LooselyBrandedString<
  "HighPriorityTargetListTargetId"
>;

/**
 * A category representing when to action the Target on a High Priority Target List.
 *
 * Log Safety: SAFE
 */
export type HighPriorityTargetListWhen =
  | "ACQUIRED"
  | "IMMEDIATE"
  | "PLANNED"
  | "NONE";

/**
   * The current version of the retrieved HighPriorityTargetList.
Any modifying operations should be accompanied by this version to avoid concurrent operations
made since this version. If there are any conflicting edits that result in changes to
these operations when they are applied, it will be noted in the response.
   *
   * Log Safety: SAFE
   */
export type HptlBaseRevisionId = number;

/**
 * An AOI referenced by the defined HptlTarget
 *
 * Log Safety: UNSAFE
 */
export interface HptlTargetAoi {
  id: HptlTargetAoiId;
  name?: string;
  data: HptlTargetAoiUnion;
}

/**
 * Identifier of the High Priority Target List Target (HPTLTarget) Area of Interest (AOI).
 *
 * Log Safety: SAFE
 */
export type HptlTargetAoiId = string;

/**
 * Log Safety: UNSAFE
 */
export type HptlTargetAoiUnion =
  | ({ type: "geo" } & HptlTargetGeoAoi)
  | ({ type: "entity" } & HptlTargetEntityAoi);

/**
 * ELINT Notations (ELNOTs) associated with the HPTL target.
 *
 * Log Safety: UNSAFE
 */
export type HptlTargetElnot = LooselyBrandedString<"HptlTargetElnot">;

/**
 * Log Safety: UNSAFE
 */
export interface HptlTargetEntityAoi {
  entity: ObjectPrimaryKey;
}

/**
 * Log Safety: UNSAFE
 */
export interface HptlTargetGeoAoi {
  geo: GeoPolygon;
}

/**
   * This subtype will be matched against the subType stored on High Priority Target List Target (HPTLTarget) in order to determine a target's
subPriority, in addition to priority and Attack Guidance Matrix (AGM).
   *
   * Log Safety: UNSAFE
   */
export type HptlTargetSubtype = LooselyBrandedString<"HptlTargetSubtype">;

/**
 * Log Safety: UNSAFE
 */
export interface Intel {
  id: IntelId;
  name: string;
  description?: string;
  domain: IntelDomain;
  validTime: string;
  location?: GeoCircle;
  confidence?: number;
  intelType: IntelUnion;
  source?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface IntelChatMessage {
  chatMessageId: ChatMessageId;
}

/**
 * Log Safety: SAFE
 */
export type IntelDomain =
  | "SIGINT"
  | "OSINT"
  | "IMINT"
  | "ELINT"
  | "HUMINT"
  | "OTHER"
  | "ALL_SOURCE"
  | "GEOINT"
  | "OPIR"
  | "FMV"
  | "COMINT";

/**
 * Log Safety: UNSAFE
 */
export interface IntelDossier {
  dossierGid: ObjectPrimaryKey;
}

/**
 * Log Safety: SAFE
 */
export interface IntelFoundryObject {
  foundryObjectRid: FoundryObjectRid;
}

/**
 * Freetext is stored in the Intel description field.
 *
 * Log Safety: SAFE
 */
export interface IntelFreeText {}

/**
 * Log Safety: UNSAFE
 */
export interface IntelGeotimeObservation {
  geotimeTrack: GeotimeTrackRid;
}

/**
 * Log Safety: UNSAFE
 */
export type IntelId = LooselyBrandedString<"IntelId">;

/**
 * Log Safety: UNSAFE
 */
export interface IntelMedia {
  fileGid: ObjectPrimaryKey;
}

/**
 * Log Safety: UNSAFE
 */
export interface IntelPgObject {
  objectRid: ObjectPrimaryKey;
}

/**
 * Log Safety: UNSAFE
 */
export type IntelUnion =
  | ({ type: "geotimeObservation" } & IntelGeotimeObservation)
  | ({ type: "foundryObject" } & IntelFoundryObject)
  | ({ type: "freetext" } & IntelFreeText)
  | ({ type: "dossier" } & IntelDossier)
  | ({ type: "media" } & IntelMedia)
  | ({ type: "pgObject" } & IntelPgObject)
  | ({ type: "chatMessage" } & IntelChatMessage);

/**
 * Log Safety: UNSAFE
 */
export type JpdiId = LooselyBrandedString<"JpdiId">;

/**
 * The High Priority Target List object.
 *
 * Log Safety: UNSAFE
 */
export interface LoadedHighPriorityTargetList {
  rid: HighPriorityTargetListRid;
  description?: string;
  targets?: Array<HighPriorityTargetListTarget>;
  targetAois?: Array<HptlTargetAoi>;
  areaObjectId?: ObjectPrimaryKey;
  areaGeo?: GeoPolygon;
}

/**
 * Log Safety: UNSAFE
 */
export interface LoadedTarget {
  rid: TargetRid;
  name: string;
  description?: string;
  targetBoards?: Array<TargetBoardRid>;
  targetType?: string;
  entityRid?: ObjectPrimaryKey;
  sidc?: string;
  targetIdentifier?: TargetIdentifier;
  location?: LocationSource;
  highPriorityTargetListTargetSubtype?: HptlTargetSubtype;
  aimpoints: Array<TargetAimpointV2>;
  intel?: Array<Intel>;
}

/**
 * Log Safety: UNSAFE
 */
export interface LoadedTargetBoard {
  rid: TargetBoardRid;
  name?: string;
  description?: string;
  highPriorityTargetList?: string;
  configuration?: TargetBoardConfiguration;
  targets?: Array<TargetBranchId>;
  targetColumnIds?: Record<TargetBranchId, TargetDetails>;
}

/**
 * Success response with the requested Target Board.
 *
 * Log Safety: UNSAFE
 */
export interface LoadHighPriorityTargetListResponse {
  highPriorityTargetList: LoadedHighPriorityTargetList;
  baseRevisionId: HptlBaseRevisionId;
}

/**
 * Types of information to load for target pucks
 *
 * Log Safety: SAFE
 */
export type LoadLevel = "LOCATION" | "BOARD_STATUS";

/**
 * Success response with the requested Target Board.
 *
 * Log Safety: UNSAFE
 */
export interface LoadTargetBoardResponse {
  targetBoard: LoadedTargetBoard;
  baseRevisionId: BaseRevisionId;
}

/**
 * Success response with the requested Target. The objectRid is the RID of the object being targeted.
 *
 * Log Safety: UNSAFE
 */
export interface LoadTargetResponse {
  target: LoadedTarget;
  baseRevisionId: BaseRevisionId;
}

/**
 * Location object that contains the latitude, longitude, and elevation.
 *
 * Log Safety: UNSAFE
 */
export interface Location3dWithError {
  lat: number;
  lng: number;
  circularErrorInMeters?: number;
  hae?: ElevationWithError;
  msl?: ElevationWithError;
  agl?: ElevationWithError;
}

/**
   * An object containing the location source for a target.
This can either be a manual location, a geotimeTrack, and/or a geotrackable entity providing location updates.
The entity, if present, is always the same as the backing entity of the target.
   *
   * Log Safety: UNSAFE
   */
export interface LocationSource {
  manualLocation?: Location3dWithError;
  geotimeTrack?: GeotimeTrackRid;
  geotrackableEntity?: ObjectPrimaryKey;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyHighPriorityTargetListRequest {
  targetBoard?: TargetBoardRid;
  targets?: Array<HighPriorityTargetListTarget>;
  areaObjectRid?: ObjectPrimaryKey;
  areaGeo?: GeoPolygon;
  targetAois?: Array<HptlTargetAoi>;
  baseRevisionId: HptlBaseRevisionId;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyTargetBoardRequest {
  name: string;
  description?: string;
  highPriorityTargetList?: string;
  configuration?: TargetBoardConfiguration;
  baseRevisionId: BaseRevisionId;
}

/**
 * Modifiable fields in Target Intel.
 *
 * Log Safety: UNSAFE
 */
export interface ModifyTargetIntelData {
  id: IntelId;
  name: string;
  description?: string;
  domain: IntelDomain;
  validTime: string;
  location?: GeoCircle;
  confidence?: number;
  intelType: IntelUnion;
  source?: string;
}

/**
 * The response body returned when modifying intel attached to a target.
 *
 * Log Safety: UNSAFE
 */
export interface ModifyTargetIntelResponse {
  updatedIntelIds: Array<IntelId>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyTargetIntelTargetRequest {
  intel: Array<ModifyTargetIntelData>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyTargetRequest {
  name: string;
  description?: string;
  targetType?: string;
  entityRid?: ObjectPrimaryKey;
  sidc?: string;
  targetIdentifier?: TargetIdentifier;
  location?: LocationSource;
  highPriorityTargetListTargetSubtype?: HptlTargetSubtype;
  aimpoints: Array<TargetAimpointV2>;
  baseRevisionId: BaseRevisionId;
  clientId?: string;
}

/**
 * The primary key/unique identifier of an object, useful for interacting with Gotham APIs to load and mutate objects.
 *
 * Log Safety: UNSAFE
 */
export type ObjectPrimaryKey = LooselyBrandedString<"ObjectPrimaryKey">;

/**
   * Security markings represent the level of access control that applies to a specific piece of information (e.g., object property, object title).
Security markings are required upon creating a new object, and upon adding a new property to an existing object.
To access information with one or more markings, the user must have access to the markings associated with that information as defined by
your organization's defined security rules. Only users with the correct permissions can get, update, or delete a property
with security markings.
In particular, if a user creates an object and adds a property of type with highly restricted markings, it is possible
that subsequent calls to the get object properties endpoint may fail to display the highly restricted property.
Contact your Palantir administrator for more information on the markings that your organization uses.
   *
   * Log Safety: UNSAFE
   */
export type PortionMarking = LooselyBrandedString<"PortionMarking">;

/**
 * Log Safety: UNSAFE
 */
export interface RemoveTargetIntelTargetRequest {
  id: IntelId;
}

/**
 * Log Safety: UNSAFE
 */
export interface SetTargetColumnTargetRequest {
  boardRid: TargetBoardRid;
  newColumnId: TargetBoardColumnId;
  baseRevisionId: BaseRevisionId;
  clientId?: string;
}

/**
 * The unique identifier for a Foundry space
 *
 * Log Safety: SAFE
 */
export type SpaceRid = LooselyBrandedString<"SpaceRid">;

/**
 * Log Safety: UNSAFE
 */
export interface Target {
  rid: TargetRid;
  name: TargetName;
  description?: string;
  targetBoard: TargetBoardRid;
  column: TargetBoardColumnId;
  targetType?: string;
  entityRid?: ObjectPrimaryKey;
  sidc?: string;
  targetIdentifier?: TargetIdentifier;
  location?: LocationSource;
  highPriorityTargetListTargetSubtype?: HptlTargetSubtype;
  aimpoints: Array<TargetAimpointV2>;
  security: ArtifactSecurity;
  detectionReasoning?: DetectionReasoning;
}

/**
 * A global unique id of a Target Aimpoint.
 *
 * Log Safety: UNSAFE
 */
export type TargetAimpointId = LooselyBrandedString<"TargetAimpointId">;

/**
 * An aimpoint of a Target if there are multiple locations associated with a Target.
 *
 * Log Safety: UNSAFE
 */
export interface TargetAimpointV2 {
  id: TargetAimpointId;
  name?: string;
  location?: Location3dWithError;
  geotimeTrack?: GeotimeTrackRid;
  entityRid?: ObjectPrimaryKey;
  jpdiId?: JpdiId;
}

/**
 * Log Safety: UNSAFE
 */
export interface TargetBoard {
  rid: TargetBoardRid;
  name: TargetBoardName;
  description?: string;
  highPriorityTargetList?: string;
  configuration?: TargetBoardConfiguration;
  security: ArtifactSecurity;
}

/**
 * A column in a target board
 *
 * Log Safety: UNSAFE
 */
export interface TargetBoardColumnConfiguration {
  id: TargetBoardColumnConfigurationId;
  name: string;
  color: ColumnColor;
}

/**
 * The unique identifier of a column
 *
 * Log Safety: SAFE
 */
export type TargetBoardColumnConfigurationId = LooselyBrandedString<
  "TargetBoardColumnConfigurationId"
>;

/**
   * Equivalent to a collection column ID. The ID of a TargetCollectionColumn, default values are:
DRAFT (Identified target), PLAN_DEVELOPMENT (Prioritized target), PLANNED (In coordination), EXECUTION (In execution), CLOSED (Complete).
   *
   * Log Safety: SAFE
   */
export type TargetBoardColumnId = LooselyBrandedString<"TargetBoardColumnId">;

/**
 * Configuration for a target board
 *
 * Log Safety: UNSAFE
 */
export interface TargetBoardConfiguration {
  columns: Array<TargetBoardColumnConfiguration>;
  targetIdentifiers: Array<TargetIdentifierEnum>;
}

/**
 * Log Safety: UNSAFE
 */
export type TargetBoardName = LooselyBrandedString<"TargetBoardName">;

/**
 * The unique identifier for a Target Board
 *
 * Log Safety: SAFE
 */
export type TargetBoardRid = LooselyBrandedString<"TargetBoardRid">;

/**
 * Identifier of a target and branch. Requires a '*' between the branch ID and target ID.
 *
 * Log Safety: UNSAFE
 */
export type TargetBranchId = LooselyBrandedString<"TargetBranchId">;

/**
 * Status information for a target in a column
 *
 * Log Safety: UNSAFE
 */
export interface TargetColumnStatus {
  boardRid: TargetBoardRid;
  column: string;
  columnName: string;
}

/**
 * Assignment of a target to a column
 *
 * Log Safety: UNSAFE
 */
export interface TargetDetails {
  columnId?: string;
}

/**
 * Target identifier object for different identifier types.
 *
 * Log Safety: UNSAFE
 */
export interface TargetIdentifier {
  customTargetIdentifier?: CustomTargetIdentifier;
}

/**
 * Types of target identifiers
 *
 * Log Safety: SAFE
 */
export type TargetIdentifierEnum = "CUSTOM";

/**
 * Location information for a target
 *
 * Log Safety: UNSAFE
 */
export interface TargetLocation {
  type: string;
  timestamp: string;
  latestLocation: GeoLocation;
}

/**
 * Log Safety: UNSAFE
 */
export type TargetName = LooselyBrandedString<"TargetName">;

/**
 * The unique identifier for a Target
 *
 * Log Safety: SAFE
 */
export type TargetRid = LooselyBrandedString<"TargetRid">;
