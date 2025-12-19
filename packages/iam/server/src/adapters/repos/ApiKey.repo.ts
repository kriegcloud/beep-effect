import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/adapters/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-server/Repo";
import * as Effect from "effect/Effect";

export class ApiKeyRepo extends Effect.Service<ApiKeyRepo>()("@beep/iam-server/adapters/repos/ApiKeyRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    IamEntityIds.ApiKeyId,
    // TS2345: Argument of type typeof Model is not assignable to parameter of type ModelWithId
    // Type typeof Model is not assignable to type
    // {
    //   readonly Type: {
    //     readonly id: unknown;
    //   };
    //   readonly update: {
    //     readonly Type: {
    //       readonly id: unknown;
    //     };
    //   };
    //   readonly fields: {
    //     readonly id: Any;
    //   };
    // }
    // The types of fields.id are incompatible between these types.
    // Type
    // optionalWith<EntityIdSchemaInstance<"apikey", "ApiKeyId">, {
    //   default: () => `apikey__${string}-${string}-${string}-${string}-${string}`;
    // }>
    // is missing the following properties from type Schema<any, any, unknown>: Type, Encoded, Context
    Entities.ApiKey.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
