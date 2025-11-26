import * as S from "effect/Schema";
import * as CommsEntityIds from "./comms";
import * as IamEntityIds from "./iam";
import * as KnowledgeManagementEntityIds from "./knowledge-management.ts";
import * as PartyEntityIds from "./party";
import { OrganizationId, SessionId, TeamId, UserId } from "./shared";
import * as TaskEntityIds from "./tasks";
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
  CommsEntityIds.EmailTemplateId,
  PartyEntityIds.PartyId,
  PartyEntityIds.PartyGroupId,
  PartyEntityIds.PartyOrganizationId,
  PartyEntityIds.PersonId,
  PartyEntityIds.PartyRoleTypeId,
  PartyEntityIds.PartyRoleId,
  PartyEntityIds.PartyRelationshipTypeId,
  PartyEntityIds.PartyRelationshipId,
  PartyEntityIds.ContactPointId,
  PartyEntityIds.PartyContactPointId,
  PartyEntityIds.PartyIdentifierTypeId,
  PartyEntityIds.PartyIdentifierId,
  KnowledgeManagementEntityIds.KnowledgeBlockId,
  KnowledgeManagementEntityIds.KnowledgePageId,
  KnowledgeManagementEntityIds.KnowledgeSpaceId,
  KnowledgeManagementEntityIds.PageLinkId,
  OrganizationId,
  TeamId,
  UserId,
  SessionId,
  TaskEntityIds.TodoId
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
