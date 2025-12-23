import * as S from "effect/Schema";
import * as DocumentsEntityIds from "./documents";
import * as IamEntityIds from "./iam";

import { FolderId, OrganizationId, SessionId, TeamId, UploadSessionId, UserId } from "./shared";

export class AnyEntityId extends S.Union(
  IamEntityIds.AccountId,
  IamEntityIds.ApiKeyId,
  IamEntityIds.InvitationId,
  IamEntityIds.MemberId,
  IamEntityIds.OAuthApplicationId,
  IamEntityIds.OAuthAccessTokenId,
  IamEntityIds.OAuthConsentId,
  IamEntityIds.PasskeyId,
  IamEntityIds.SsoProviderId,
  IamEntityIds.SubscriptionId,
  IamEntityIds.SubscriptionId,
  IamEntityIds.TeamMemberId,
  IamEntityIds.TwoFactorId,
  IamEntityIds.VerificationId,
  IamEntityIds.WalletAddressId,
  IamEntityIds.OrganizationRoleId,
  IamEntityIds.DeviceCodeId,
  IamEntityIds.ScimProviderId,
  DocumentsEntityIds.DocumentId,
  DocumentsEntityIds.DocumentVersionId,
  DocumentsEntityIds.DiscussionId,
  DocumentsEntityIds.CommentId,
  DocumentsEntityIds.DocumentFileId,
  OrganizationId,
  TeamId,
  UserId,
  SessionId,
  FolderId,
  UploadSessionId
).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/AnyEntityId"),
  description: "Any entity id",
  title: "Any Entity Id",
  identifier: "AnyEntityId",
}) {}

export declare namespace AnyEntityId {
  export type Type = S.Schema.Type<typeof AnyEntityId>;
  export type Encoded = S.Schema.Encoded<typeof AnyEntityId>;
}
