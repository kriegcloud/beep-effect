import { EnvValue } from "@beep/constants";
import { BS } from "@beep/schema";
import { EntityKind, Policy, SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import type { Files } from "@beep/shared-domain/rpc/v1/files";
import { Effect } from "effect";
import * as S from "effect/Schema";

export const Handler = Effect.fn("files_initiateUpload")(
  function* (payload: Files.InitiateUpload.Payload) {
    const { user, session, organization } = yield* Policy.AuthContext;
    yield* Effect.logInfo(payload);
    const env = yield* S.Config("APP_ENV", EnvValue);
    const extension = payload.metadata.extension;

    const key = yield* S.decode(File.UploadKey)({
      entityKind: EntityKind.Enum.user,
      fileId: SharedEntityIds.FileId.create(),
      organizationId: session.activeOrganizationId,
      organizationType: organization.type,
      entityIdentifier: user.id,
      entityAttribute: "image",
      env,
      extension,
    });

    return {
      presignedUrl: BS.URLString.make("https://example.com/presigned-url"),
      fileKey: key,
      metadata: payload.metadata,
    };
  },
  Effect.catchTags({
    ParseError: Effect.die,
    ConfigError: Effect.die,
  })
);
