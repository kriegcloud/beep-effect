import { $CalendarDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as CalendarEvent from "./CalendarEvent.model";

const $I = $CalendarDomainId.create("entities/CalendarEvent/CalendarEvent.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof CalendarEvent.Model>;
export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
