import { AuthContextHttpMiddleware } from "@beep/shared-domain/Policy";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Model } from "./File.model";

export class Contract extends HttpApiGroup.make("file")
  .middleware(AuthContextHttpMiddleware)
  .add(HttpApiEndpoint.post("create", "/").addSuccess(Model).setPayload(Model.insert)) {}
