import { EntityId } from "@beep/schema/identity";

export const EmailTemplateId = EntityId.make("email_template", {
  brand: "EmailTemplateId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/comms/EmailTemplateId"),
    description: "A unique identifier for an EmailTemplate entity",
  },
});

export declare namespace EmailTemplateId {
  export type Type = typeof EmailTemplateId.Type;
  export type Encoded = typeof EmailTemplateId.Encoded;
}
