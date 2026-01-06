import { CustomizationRepos } from "@beep/customization-server";
import { DocumentsRepos } from "@beep/documents-server";
import { IamRepos } from "@beep/iam-server";
import { SharedRepos } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Persistence from "./Persistence.layer";

type SliceRepos =
  | IamRepos.IamRepos
  | DocumentsRepos.DocumentsRepos
  | SharedRepos.SharedRepos
  | CustomizationRepos.CustomizationRepos;

const sliceReposLayer: Layer.Layer<SliceRepos, never, Persistence.Services> = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  SharedRepos.layer,
  CustomizationRepos.layer
);

export type Services = SliceRepos | Persistence.Services;

export const layer: Layer.Layer<Services, never, never> = sliceReposLayer.pipe(Layer.provideMerge(Persistence.layer));
