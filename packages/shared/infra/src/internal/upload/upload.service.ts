import type { DeleteObjectCommandOutput } from "@aws-sdk/client-s3";
import { EnvValue } from "@beep/constants";
import { SharedEntityIds } from "@beep/shared-domain";
import type { InitiateUploadPayload } from "@beep/shared-domain/api/files-rpc";
import { File, type Organization } from "@beep/shared-domain/entities";
import type { S3ServiceError } from "@effect-aws/client-s3/Errors";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import type { SdkError } from "@effect-aws/commons/Errors";
import { type Cause, Effect, Layer, type ParseResult, Redacted } from "effect";
import * as Config from "effect/Config";
import type { ConfigError } from "effect/ConfigError";
import * as S from "effect/Schema";

type GetPreSignedUrl = (
  payload: InitiateUploadPayload & {
    organization: typeof Organization.Model.Type;
  }
) => Effect.Effect<Redacted.Redacted<string>, ParseResult.ParseError | SdkError | S3ServiceError | ConfigError, never>;
type DeleteObject = (
  uploadParams: File.UploadKey.Encoded
) => Effect.Effect<
  DeleteObjectCommandOutput,
  SdkError | ParseResult.ParseError | S3ServiceError | Cause.TimeoutException,
  never
>;

type UploadServiceEffect = Effect.Effect<
  {
    readonly initiateUpload: GetPreSignedUrl;
    readonly deleteObject: DeleteObject;
  },
  never,
  S3Service
>;

const serviceEffect: UploadServiceEffect = Effect.gen(function* () {
  const s3 = yield* S3Service;
  const Bucket = yield* Config.nonEmptyString("CLOUD_AWS_S3_BUCKET_NAME");

  const decodeUploadKey = S.decode(File.UploadKey);

  const initiateUpload = Effect.fn("UploadService.initiateUpload")(function* ({
    organization,
    ...payload
  }: typeof InitiateUploadPayload.Type & {
    organization: typeof Organization.Model.Type;
  }) {
    const env = yield* S.Config("APP_ENV", EnvValue);

    const p = {
      env,
      fileId: SharedEntityIds.FileId.create(),
      organizationType: organization.type,
      organizationId: organization.id,
      entityKind: payload.entityKind,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
      extension: payload.metadata.extension,
    };
    const Key = yield* S.decode(File.UploadKey)(p);
    const ContentType = payload.mimeType;

    const result = yield* s3.putObject(
      {
        Bucket,
        Key,
        ContentType,
      },
      { presigned: true }
    );
    return Redacted.make(result);
  });

  const deleteObject = Effect.fn("S3Service.deleteObject")(function* (uploadParams: File.UploadKey.Encoded) {
    const Key = yield* decodeUploadKey(uploadParams);
    const result = yield* s3.deleteObject({
      Bucket,
      Key,
    });
    yield* Effect.logInfo(`Deleted file successfully from path: ${JSON.stringify(result, null, 2)}`);
    return result;
  });

  return {
    initiateUpload,
    deleteObject,
  };
}).pipe(
  Effect.catchTags({
    ConfigError: Effect.die,
  })
);

export class UploadService extends Effect.Service<UploadService>()("S3Service", {
  dependencies: [S3Service.defaultLayer],
  accessors: true,
  effect: serviceEffect,
}) {
  static readonly layer = UploadService.Default.pipe(Layer.provideMerge(S3Service.defaultLayer));
}
