import { FilesRepos } from "@beep/files-infra";
import { IamRepos } from "@beep/iam-infra";
import * as Layer from "effect/Layer";

export const SliceRepositoriesLive = Layer.mergeAll(IamRepos.layer, FilesRepos.layer);
