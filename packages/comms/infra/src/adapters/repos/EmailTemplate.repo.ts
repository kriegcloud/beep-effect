import { Repo } from "@beep/core-db/Repo";
import { CommsEntityIds } from "@beep/shared-domain";
import { EmailTemplate } from "@beep/comms-domain/entities";
import { dependencies } from "@beep/comms-infra/adapters/repos/_common";
import { CommsDb } from "@beep/comms-infra/db";
import * as Effect from "effect/Effect";

export class EmailTemplateRepo extends Effect.Service<EmailTemplateRepo>()("@beep/comms-infra/adapters/repos/EmailTemplateRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    CommsEntityIds.EmailTemplateId,
    EmailTemplate.Model,
    Effect.gen(function* () {
      yield* CommsDb.CommsDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
