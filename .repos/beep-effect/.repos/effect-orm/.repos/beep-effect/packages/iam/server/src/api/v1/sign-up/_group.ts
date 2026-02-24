import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Email from "./email";

export type Service = HttpApiGroup.ApiGroup<"iam", "signUp">;
export type Routes = Layer.Layer<Service, IamAuthError, Auth.Service>;
export const Routes: Routes = HttpApiBuilder.group(IamApi, "signUp", (h) => h.handle("email", Email.Handler));
