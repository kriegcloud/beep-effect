import { FilesConfig } from "@beep/files-infra/config";
import { S3Service } from "@effect-aws/client-s3";
import * as Effect from "effect/Effect";

export class StorageService extends Effect.Service<StorageService>()("StorageService", {
  dependencies: [S3Service.defaultLayer, FilesConfig.Live],
  accessors: true,
  effect: Effect.gen(function* () {
    const s3 = yield* S3Service;
    const config = yield* FilesConfig;

    const getPreSignedUrl = Effect.fn("StorageService.getPreSignedUrl")(function* () {
      return yield* s3.putObject(
        {
          Bucket: config.aws.s3.bucketName,
          Key: `beep`,
        },
        { presigned: true }
      );
    });

    return {
      getPreSignedUrl,
    };
  }),
}) {}
