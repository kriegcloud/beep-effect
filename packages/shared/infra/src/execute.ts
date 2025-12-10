import { EnvValue } from "@beep/constants";
import { BS } from "@beep/schema";
import { EntityKind, SharedEntityIds } from "@beep/shared-domain";
import { File, Organization } from "@beep/shared-domain/entities";
import { UploadService } from "@beep/shared-infra/internal/upload";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { Cause, Console, Effect } from "effect";
import * as S from "effect/Schema";

const program = Effect.gen(function* () {
  const fileId = SharedEntityIds.FileId.create();
  const uploadService = yield* UploadService;

  const uploadPathParams = {
    env: EnvValue.Enum.dev,
    fileId,
    organizationType: Organization.OrganizationType.Enum.individual,
    organizationId: SharedEntityIds.OrganizationId.create(),
    entityKind: EntityKind.Enum.organization,
    entityIdentifier: SharedEntityIds.UserId.create(),
    entityAttribute: "image",
    extension: BS.FileExtension.Enum.png,
  };

  const uploadPath = yield* S.decode(File.UploadKey)(uploadPathParams);

  yield* Console.log("UPLOAD PATH: ", uploadPath);

  const presignedUrl = yield* uploadService.getPreSignedUrl(uploadPathParams);

  yield* Console.log("PRE-SIGNED URL: ", presignedUrl);
});

BunRuntime.runMain(
  program.pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        const msg = String(error);
        yield* Console.log(`\n💥 Program failed: ${msg}`);
        const cause = Cause.fail(error);
        yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);
        return yield* Effect.fail(error);
      })
    ),
    Effect.provide(UploadService.layer)
  )
);
