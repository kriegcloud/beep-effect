/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
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

import type {
  ActivityCollaborativeUpdate,
  ActivityEvent as FoundryActivityEvent,
  PresenceCollaborativeUpdate,
} from "@osdk/foundry.pack";
import { invalidUserRef } from "@palantir/pack.auth";
import type {
  ActivityEvent,
  ActivityEventData,
  ActivityEventDataDocumentCreate,
  ActivityEventDataDocumentDescriptionUpdate,
  ActivityEventDataDocumentRename,
  ActivityEventDataDocumentSecurityUpdate,
  DocumentSchema,
  Model,
  ModelData,
  PresenceEvent,
  PresenceEventData,
  PresenceEventDataArrived,
  PresenceEventDataDeparted,
  UserId,
} from "@palantir/pack.document-schema.model-types";
import {
  ActivityEventDataType,
  PresenceEventDataType,
} from "@palantir/pack.document-schema.model-types";

export function getActivityEvent(
  documentSchema: DocumentSchema,
  foundryEvent: ActivityCollaborativeUpdate,
): ActivityEvent | undefined {
  // TODO: need to handle deletes and ensure exhaustive handling
  if (foundryEvent.type !== "activityCreated") {
    return undefined;
  }
  const { activityEvent } = foundryEvent;
  const eventData = getActivityEventData(documentSchema, activityEvent);

  return {
    aggregationKey: activityEvent.aggregationKey,
    createdBy: activityEvent.createdBy as UserId,
    createdInstant: new Date(activityEvent.createdTime).getTime(),
    eventData,
    eventId: activityEvent.eventId,
    isRead: activityEvent.isRead,
  };
}

/**
 * Platform event type names as sent by backpack.
 * Note: Only DOCUMENT_CREATE is currently emitted by the backend.
 * Remaining types are included for future use.
 */
const PlatformEventType = {
  DOCUMENT_CREATE: "DocumentCreateEvent",
  DOCUMENT_DESCRIPTION_UPDATE: "DocumentDescriptionUpdateEvent",
  DOCUMENT_RENAME: "DocumentRenameEvent",
  DOCUMENT_SECURITY_UPDATE: "DocumentMandatorySecurityUpdateEvent",
} as const;

interface WireDocumentCreateEvent {
  readonly name?: string;
  readonly initialMandatorySecurity?: {
    readonly classification?: readonly string[];
    readonly markings?: readonly string[];
  };
}

interface WireDocumentRenameEvent {
  readonly previousName?: string;
  readonly newName?: string;
}

interface WireDocumentDescriptionUpdateEvent {
  readonly newDescription?: string;
  readonly isInitial?: boolean;
}

interface WireDocumentSecurityUpdateEvent {
  readonly newClassification?: readonly string[];
  readonly newMarkings?: readonly string[];
}

function getActivityEventData(
  docSchema: DocumentSchema,
  { eventData, eventType }: FoundryActivityEvent,
): ActivityEventData {
  const platformEventData = getPlatformActivityEventData(
    eventType,
    eventData.data,
  );
  if (platformEventData != null) {
    return platformEventData;
  }

  // Handle custom application-defined activity events
  // TODO: validate model is valid for activity events
  const model = docSchema[eventType];
  if (model == null) {
    return {
      rawData: eventData.data,
      rawType: eventType,
      type: ActivityEventDataType.UNKNOWN,
    };
  }

  // TODO: validate data against model schema

  return {
    eventData: eventData.data as ModelData<Model>,
    model,
    type: ActivityEventDataType.CUSTOM_EVENT,
  };
}

function getPlatformActivityEventData(
  eventType: string,
  data: unknown,
): ActivityEventData | undefined {
  switch (eventType) {
    case PlatformEventType.DOCUMENT_CREATE: {
      const wireData = data as WireDocumentCreateEvent;
      return {
        initialMandatorySecurity: {
          classification: wireData.initialMandatorySecurity?.classification,
          markings: wireData.initialMandatorySecurity?.markings,
        },
        name: wireData.name ?? "",
        type: ActivityEventDataType.DOCUMENT_CREATE,
      } satisfies ActivityEventDataDocumentCreate;
    }

    case PlatformEventType.DOCUMENT_RENAME: {
      const wireData = data as WireDocumentRenameEvent;
      return {
        newName: wireData.newName ?? "",
        previousName: wireData.previousName ?? "",
        type: ActivityEventDataType.DOCUMENT_RENAME,
      } satisfies ActivityEventDataDocumentRename;
    }

    case PlatformEventType.DOCUMENT_DESCRIPTION_UPDATE: {
      const wireData = data as WireDocumentDescriptionUpdateEvent;
      return {
        isInitial: wireData.isInitial ?? false,
        newDescription: wireData.newDescription ?? "",
        type: ActivityEventDataType.DOCUMENT_DESCRIPTION_UPDATE,
      } satisfies ActivityEventDataDocumentDescriptionUpdate;
    }

    case PlatformEventType.DOCUMENT_SECURITY_UPDATE: {
      const wireData = data as WireDocumentSecurityUpdateEvent;
      return {
        newClassification: wireData.newClassification ?? [],
        newMarkings: wireData.newMarkings ?? [],
        type: ActivityEventDataType.DOCUMENT_SECURITY_UPDATE,
      } satisfies ActivityEventDataDocumentSecurityUpdate;
    }

    default:
      return undefined;
  }
}

const ARRIVED_DATA: PresenceEventDataArrived = {
  type: PresenceEventDataType.ARRIVED,
} as const;

const DEPARTED_DATA: PresenceEventDataDeparted = {
  type: PresenceEventDataType.DEPARTED,
} as const;

export function getPresenceEvent(
  documentSchema: DocumentSchema,
  foundryUpdate: PresenceCollaborativeUpdate,
): PresenceEvent {
  switch (foundryUpdate.type) {
    case "presenceChangeEvent": {
      const { userId, status } = foundryUpdate;
      const eventData = status === "PRESENT" ? ARRIVED_DATA : DEPARTED_DATA;
      return {
        eventData,
        userId: userId as UserId,
      };
    }

    case "customPresenceEvent": {
      const { userId, eventData, eventType } = foundryUpdate;
      const presenceEventData = getPresenceEventData(documentSchema, eventType, eventData);
      return {
        eventData: presenceEventData,
        userId: userId as UserId,
      };
    }
    default: {
      foundryUpdate satisfies never;
      const unknownUpdate = foundryUpdate as Record<string, unknown>;
      return {
        eventData: {
          rawData: foundryUpdate,
          rawType: typeof unknownUpdate.type === "string" ? unknownUpdate.type : "unknown",
          type: PresenceEventDataType.UNKNOWN,
        },
        // FIXME: try and pull userId from message? Or just fix the platform types to have useful wrappers.
        userId: invalidUserRef().userId,
      };
    }
  }
}

function getPresenceEventData(
  docSchema: DocumentSchema,
  eventType: string,
  eventData: unknown,
): PresenceEventData {
  const model = docSchema[eventType];
  if (model == null) {
    return {
      rawData: eventData,
      rawType: eventType,
      type: PresenceEventDataType.UNKNOWN,
    };
  }

  return {
    eventData,
    model,
    type: PresenceEventDataType.CUSTOM_EVENT,
  };
}
