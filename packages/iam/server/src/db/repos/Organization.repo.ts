import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { $IamServerId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("db/repos/OrganizationRepo");
export class OrganizationRepo extends Effect.Service<OrganizationRepo>()($I`OrganizationRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(
    SharedEntityIds.OrganizationId,
    Entities.Organization.Model,
    Effect.gen(function* () {
      yield* IamDb.Db;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
