import * as HttpApi from "@effect/platform/HttpApi";
import { AuthGroup } from "./auth/AuthGroup.ts";

export class DomainApi extends HttpApi.make("domain").addHttpApi(AuthGroup).prefix("/v1") {}
