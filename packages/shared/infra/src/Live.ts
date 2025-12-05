import { EncryptionService } from "@beep/shared-domain/services";
import { UploadService } from "@beep/shared-infra/internal/upload";
import { Layer } from "effect";
import { Email } from "./Email";
import { Db } from "./internal/db";

export type SharedServices =
  | Email.ResendService
  | Db.PgClientServices
  | EncryptionService.EncryptionService
  | UploadService;

export const Live: Layer.Layer<SharedServices, never, never> = Layer.empty.pipe(
  Layer.provideMerge(Email.ResendService.layer),
  Layer.provideMerge(Db.layer),
  Layer.provideMerge(EncryptionService.layer),
  Layer.provideMerge(UploadService.layer)
);
