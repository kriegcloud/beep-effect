import { FilesConfig } from "@beep/documents-server/config";
import { S3Service } from "@effect-aws/client-s3";
import * as Effect from "effect/Effect";

export class StorageService extends Effect.Service<StorageService>()("StorageService", {
  dependencies: [S3Service.defaultLayer, FilesConfig.Live],
  accessors: true,
  effect: Effect.gen(function* () {
    const s3 = yield* S3Service;
    const config = yield* FilesConfig;

    const initiateUpload = Effect.fn("StorageService.initiateUpload")(function* () {
      return yield* s3.putObject(
        {
          Bucket: config.aws.s3.bucketName,
          Key: `beep`,
        },
        { presigned: true }
      );
    });

    return {
      initiateUpload,
    };
  }),
}) {}
