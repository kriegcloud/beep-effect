import { getTypes } from "@beep/schema/integrations";
import { File } from "@beep/shared-domain/entities";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import { Effect } from "effect";
import * as Config from "effect/Config";
import * as S from "effect/Schema";

export class UploadService extends Effect.Service<UploadService>()("S3Service", {
  dependencies: [S3Service.defaultLayer],
  accessors: true,
  effect: Effect.gen(function* () {
    const s3 = yield* S3Service;
    const Bucket = yield* Config.nonEmptyString("CLOUD_AWS_S3_BUCKET_NAME");
    const mimeTypeMap = getTypes();

    const decodeUploadPath = S.decode(File.UploadPath);

    const getPreSignedUrl = Effect.fn("UploadService.getPresignedUrl")(function* (
      uploadParams: File.UploadPath.Encoded
    ) {
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
      return result;
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

    const insertFile = Effect.fn("S3Service.insertFile")(function* (input: typeof File.Model.insert.Type) {
      yield* S.encode(File.Model.insert)(input);
    });

    return {
      getPreSignedUrl,
      deleteObject,
      insertFile,
    };
  }),
}) {}
