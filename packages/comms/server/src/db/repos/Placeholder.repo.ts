import { Entities } from "@beep/comms-domain";
import { CommsDb } from "@beep/comms-server/db";
import { $CommsServerId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $CommsServerId.create("db/repos/email-template.repo");

export class EmailTemplateRepo extends Effect.Service<EmailTemplateRepo>()($I`EmailTemplateRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* CommsDb.Db;

    return yield* DbRepo.make(CommsEntityIds.EmailTemplateId, Entities.EmailTemplate.Model, Effect.succeed({}));
  }),
}) {}
