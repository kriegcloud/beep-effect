import type { DeleteObjectCommandOutput } from "@aws-sdk/client-s3";
import { getTypes } from "@beep/schema/integrations";
import { File } from "@beep/shared-domain/entities";
import type { S3ServiceError } from "@effect-aws/client-s3/Errors";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import type { SdkError } from "@effect-aws/commons/Errors";
import { type Cause, Effect, Layer, type ParseResult, Redacted } from "effect";
import * as Config from "effect/Config";
import * as S from "effect/Schema";

// type UploadServiceEffect = Effect.Effect<>

type GetPreSignedUrl = (
  uploadParams: File.UploadPath.Encoded
) => Effect.Effect<Redacted.Redacted<string>, SdkError | S3ServiceError | ParseResult.ParseError, never>;
type DeleteObject = (
  uploadParams: File.UploadPath.Encoded
) => Effect.Effect<
  DeleteObjectCommandOutput,
  SdkError | ParseResult.ParseError | S3ServiceError | Cause.TimeoutException,
  never
>;

type UploadServiceEffect = Effect.Effect<
  {
    readonly getPreSignedUrl: GetPreSignedUrl;
    readonly deleteObject: DeleteObject;
  },
  never,
  S3Service
>;

const serviceEffect: UploadServiceEffect = Effect.gen(function* () {
  const s3 = yield* S3Service;
  const Bucket = yield* Config.nonEmptyString("CLOUD_AWS_S3_BUCKET_NAME");
  const mimeTypeMap = getTypes();

  const decodeUploadPath = S.decode(File.UploadPath);

  const getPreSignedUrl = Effect.fn("UploadService.getPresignedUrl")(function* (uploadParams: File.UploadPath.Encoded) {
    const ContentType = mimeTypeMap[uploadParams.fileItemExtension];
    const Key = yield* decodeUploadPath(uploadParams);
    const result = yield* s3.putObject(
      {
        Bucket,
        Key,
        ContentType,
      },
      { presigned: true }
    );
    yield* Effect.logInfo(`Uploaded file successfully to path: ${result}`);
    return Redacted.make(result);
  });

  const deleteObject = Effect.fn("S3Service.deleteObject")(function* (uploadParams: File.UploadPath.Encoded) {
    const Key = yield* decodeUploadPath(uploadParams);
    const result = yield* s3.deleteObject({
      Bucket,
      Key,
    });
    yield* Effect.logInfo(`Deleted file successfully from path: ${JSON.stringify(result, null, 2)}`);
    return result;
  });

  return {
    getPreSignedUrl,
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
