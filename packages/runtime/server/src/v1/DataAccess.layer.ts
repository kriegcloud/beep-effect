import { DocumentsRepos } from "@beep/documents-infra";
import { IamRepos } from "@beep/iam-infra";
import { SharedRepos } from "@beep/shared-infra";
import * as Layer from "effect/Layer";
import * as Persistence from "./Persistence.layer.ts";

type SliceRepos = IamRepos.IamRepos | DocumentsRepos.DocumentsRepos | SharedRepos.SharedRepos;

const sliceReposLayer: Layer.Layer<SliceRepos, never, Persistence.Services> = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  SharedRepos.layer
);

export type Services = SliceRepos | Persistence.Services;

export const layer: Layer.Layer<Services, never, never> = sliceReposLayer.pipe(Layer.provideMerge(Persistence.layer));
