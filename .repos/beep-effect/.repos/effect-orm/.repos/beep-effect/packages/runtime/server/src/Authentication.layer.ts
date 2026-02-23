import { Auth } from "@beep/iam-server";
import * as Layer from "effect/Layer";
import * as DataAccessLayer from "./DataAccess.layer";
import * as Email from "./Email.layer";

export type Services = Auth.Service | Email.Services | DataAccessLayer.Services;
export const layer: Layer.Layer<Services, never, never> = Auth.layer.pipe(
  Layer.provideMerge(Email.layer),
  Layer.provideMerge(DataAccessLayer.layer)
);
