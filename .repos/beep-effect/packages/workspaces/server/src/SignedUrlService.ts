import { $WorkspacesServerId } from "@beep/identity/packages";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import { S3Service } from "@effect-aws/client-s3";
import * as Effect from "effect/Effect";

const $I = $WorkspacesServerId.create("SignedUrlService");

export class StorageService extends Effect.Service<StorageService>()($I`StorageService`, {
  dependencies: [S3Service.defaultLayer],
  accessors: true,
  effect: Effect.gen(function* () {
    const s3 = yield* S3Service;

    const initiateUpload = Effect.fn("StorageService.initiateUpload")(function* () {
      return yield* s3.putObject(
        {
          Bucket: serverEnv.cloud.aws.s3.bucketName,
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
