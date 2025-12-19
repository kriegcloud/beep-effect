import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-infra";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Create from "./create";
import * as Delete from "./delete";
import * as Get from "./get";
import * as List from "./list";
import * as Update from "./update";

export type Service = HttpApiGroup.ApiGroup<"iam", "iam.apiKey">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.apiKey", (h) =>
  h
    .handle("create", Create.Handler)
    .handle("delete", Delete.Handler)
    .handle("get", Get.Handler)
    .handle("list", List.Handler)
    .handle("update", Update.Handler)
);
