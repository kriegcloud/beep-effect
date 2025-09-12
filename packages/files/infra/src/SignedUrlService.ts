import { serverEnv } from "@beep/core-env/server";
import { S3Service } from "@effect-aws/client-s3";
import * as Effect from "effect/Effect";

export class StorageService extends Effect.Service<StorageService>()("StorageService", {
  dependencies: [S3Service.defaultLayer],
  accessors: true,
  effect: Effect.gen(function* () {
    const s3 = yield* S3Service;

    const getPreSignedUrl = Effect.fn("StorageService.getPreSignedUrl")(function* () {
      return yield* s3.putObject(
        {
          Bucket: serverEnv.cloud.aws.s3.bucketName,
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
