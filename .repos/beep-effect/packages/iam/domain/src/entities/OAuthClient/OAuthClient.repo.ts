import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as OAuthClient from "./OAuthClient.model";

const $I = $IamDomainId.create("entities/OAuthClient/OAuthClient.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof OAuthClient.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
