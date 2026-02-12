import {Entities} from "@beep/iam-domain";
import type {IamDb} from "@beep/iam-server/db";
import {IamEntityIds} from "@beep/shared-domain";
import {DbRepo} from "@beep/shared-server/factories";
import type * as SqlClient from "@effect/sql/SqlClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(IamEntityIds.AccountId, Entities.Account.Model, Effect.succeed({}));

export const AccountRepoLive: Layer.Layer<Entities.Account.Repo, never, IamDb.Db | SqlClient.SqlClient> = Layer.effect(Entities.Account.Repo, serviceEffect);
