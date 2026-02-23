import { EnvValue } from "@beep/constants";
import { Policy, SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import type { Files } from "@beep/shared-domain/rpc/v1/files";
import { Upload } from "@beep/shared-server/services";
import { Effect } from "effect";
import * as S from "effect/Schema";

type HandlerEffect = (
  payload: Files.InitiateUpload.Payload
) => Effect.Effect<Files.InitiateUpload.Success, never, Policy.AuthContext | Upload.Service>;

export const Handler: HandlerEffect = Effect.fn("files_initiateUpload")(
  function* (payload: Files.InitiateUpload.Payload) {
    const { session, organization } = yield* Policy.AuthContext;
    yield* Effect.logInfo(payload);
    const env = yield* S.Config("APP_ENV", EnvValue);
    const extension = payload.metadata.extension;
    const uploadService = yield* Upload.Service;

    const key = yield* S.decode(File.UploadKey)({
      entityKind: payload.entityKind,
      fileId: SharedEntityIds.FileId.create(),
      organizationId: session.activeOrganizationId,
      organizationType: organization.type,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
      env,
      extension,
    });

    const presignedUrl = yield* uploadService.initiateUpload({
      ...payload,
      organization,
    });

    return {
      presignedUrl,
      fileKey: key,
      metadata: payload.metadata,
    };
  },
  Effect.catchTags({
    ParseError: Effect.die,
    ConfigError: Effect.die,
    SdkError: Effect.die,
    S3ServiceError: Effect.die,
  })
);
