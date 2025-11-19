import { EntityId } from "@beep/schema/identity";

export const EmailTemplateId = EntityId.make("email_template", {
  brand: "EmailTemplateId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/comms/EmailTemplateId"),
    description: "A unique identifier for an EmailTemplate entity",
  },
});
