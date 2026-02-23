import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Folder from "../../Folder";
import * as File from "../File.model";

const $I = $SharedDomainId.create("entities/File/contracts/ListPaginated.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    offset: S.NumberFromString.pipe(S.int(), S.nonNegative()),
    limit: S.NumberFromString.pipe(S.int(), S.nonNegative()),
  },
  $I.annotations("Payload", {
    description: "Payload for the ListPaginated File contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    rootFiles: S.Array(File.Model.json),
    folders: S.Array(Folder.WithUploadedFiles),
    total: S.Number,
    offset: S.Number,
    limit: S.Number,
    hasNext: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Paginated list of files and folders for a user.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ListPaginatedFiles",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "List Paginated Files Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("ListPaginatedFiles", "/").setPayload(Payload).addSuccess(Success);
}
