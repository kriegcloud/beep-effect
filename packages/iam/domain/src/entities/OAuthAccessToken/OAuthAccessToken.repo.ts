import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as OAuthAccessToken from "./OAuthAccessToken.model";

const $I = $IamDomainId.create("entities/OAuthAccessToken/OAuthAccessToken.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof OAuthAccessToken.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
