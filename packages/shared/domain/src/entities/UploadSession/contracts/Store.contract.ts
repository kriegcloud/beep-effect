import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { HmacSignature } from "../../../services/EncryptionService/schemas";
import * as File from "../../file";
import * as UploadSessionErrors from "../UploadSession.errors";
import { UploadSessionMetadata } from "../schemas";

const $I = $SharedDomainId.create("entities/UploadSession/contracts/Store.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileKey: File.UploadKey.to,
    signature: HmacSignature,
    metadata: UploadSessionMetadata,
    expiresAt: BS.DateTimeUtcFromAllAcceptable,
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Store UploadSession contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: SharedEntityIds.UploadSessionId,
  },
  $I.annotations("Success", {
    description: "Success response for the Store UploadSession contract. Returns the generated session ID.",
  })
) {}

export const Failure = UploadSessionErrors.UploadSessionRepoError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "StoreUploadSession",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Store UploadSession Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("StoreUploadSession", "/")
    .setPayload(Payload)
    .addError(UploadSessionErrors.UploadSessionRepoError)
    .addSuccess(Success, { status: 201 });
}
