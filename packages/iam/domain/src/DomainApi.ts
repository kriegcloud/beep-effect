import { CurrentUserGroup } from "@beep/iam-domain/api/User.contract";
import * as HttpApi from "@effect/platform/HttpApi";

export class DomainApi extends HttpApi.make("domain").add(CurrentUserGroup).prefix("/api/v1/iam") {}
