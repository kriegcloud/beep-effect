import { BeepError } from "@beep/errors/shared";
import { BS } from "@beep/schema";
import { Pagination } from "@beep/shared-domain/value-objects";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Model } from "./AuditLog.model";

export class Query extends BS.Class<Query>("AuditQuery")(
  BS.mergeFields(Model.select.pick("entityKind", "entityId").fields, Pagination.fields),
  {
    schemaId: Symbol.for("@beep/shared-domain/AuditLog/contract/AuditQuery"),
    identifier: "AuditQuery",
    title: "Audit Query",
    description: "The input to query an Audit Log",
  }
) {}

export const Group = HttpApiGroup.make("audit").add(
  HttpApiEndpoint.get("api.audit.list", "/api/audit")
    .addSuccess(Model.select)
    .addError(BeepError.DatabaseError)
    .addError(BeepError.ParseError)
    .setUrlParams(Query)
    .annotate(OpenApi.Summary, "List Audit Logs")
    .annotate(OpenApi.Description, "Retrieve audit logs with optional filtering by entity type and ID")
);

export const Api = HttpApi.make("AuditAPI").add(Group);
