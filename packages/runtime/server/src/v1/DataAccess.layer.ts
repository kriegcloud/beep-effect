import { DocumentsRepos } from "@beep/documents-server";
import { IamRepos } from "@beep/iam-server";
import { SharedRepos } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Persistence from "./Persistence.layer.ts";

type SliceRepos = IamRepos.IamRepos | DocumentsRepos.DocumentsRepos | SharedRepos.SharedRepos;

const sliceReposLayer = Layer.mergeAll(IamRepos.layer, DocumentsRepos.layer, SharedRepos.layer);

export type Services = SliceRepos | Persistence.Services;

export const layer = sliceReposLayer.pipe(Layer.provideMerge(Persistence.layer));
