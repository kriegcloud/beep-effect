import { User } from "@beep/shared-domain/entities";
import { AuthContextHttpMiddleware } from "@beep/shared-domain/Policy";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";
export class CurrentUserNotFound extends S.TaggedError<CurrentUserNotFound>(
  "@beep/iam-domain/api/User/CurrentUserNotFound"
)(
  "CurrentUserNotFound",
  {
    message: S.String,
    cause: S.Defect,
  },
  HttpApiSchema.annotations({
    status: 404,
  })
) {}

export class CurrentUserGroup extends HttpApiGroup.make("currentUser")
  .middleware(AuthContextHttpMiddleware)
  .add(HttpApiEndpoint.get("get", "/current-user").addSuccess(User.Model).addError(CurrentUserNotFound)) {}
