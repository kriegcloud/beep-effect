import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepBullet/MeetingPrepBullet.errors");

export class MeetingPrepBulletNotFoundError extends S.TaggedError<MeetingPrepBulletNotFoundError>()(
  $I`MeetingPrepBulletNotFoundError`,
  {
    id: KnowledgeEntityIds.MeetingPrepBulletId,
  },
  $I.annotationsHttp("MeetingPrepBulletNotFoundError", {
    status: 404,
    description: "Error when a meeting prep bullet with the specified ID cannot be found.",
  })
) {}

export class MeetingPrepBulletPermissionDeniedError extends S.TaggedError<MeetingPrepBulletPermissionDeniedError>()(
  $I`MeetingPrepBulletPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.MeetingPrepBulletId,
  },
  $I.annotationsHttp("MeetingPrepBulletPermissionDeniedError", {
    status: 403,
    description:
      "Thrown when the user lacks permission to perform the requested action on the meeting prep bullet.",
  })
) {}

export const Errors = S.Union(MeetingPrepBulletNotFoundError, MeetingPrepBulletPermissionDeniedError);
export type Errors = typeof Errors.Type;
