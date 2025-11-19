import type {SharedEntityIds} from "@beep/shared-domain";
import {CommsEntityIds} from "@beep/shared-domain";
import {OrgTable, team, user} from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const emailTemplate = OrgTable.make(CommsEntityIds.EmailTemplateId)(
  {
    userId: pg.text("user_id").notNull().references(() => user.id, {onDelete: "cascade", onUpdate: "cascade"}).$type<typeof SharedEntityIds.UserId.Type>(),
    name: pg.text("name").notNull(),
    subject: pg.text("subject"),
    body: pg.text("body"),
    to: pg.text("to"),
    cc: pg.text("cc"),
    bcc: pg.text("bcc"),
    teamId: pg.text("team_id").references(() => team.id, {onDelete: "cascade", onUpdate: "cascade"}).$type<typeof SharedEntityIds.TeamId.Type>(),
  },
  (t) => [
    pg.index("idx_comms_email_template_user_id").on(t.userId),
    pg.unique("comms_email_template_user_id_name_unique").on(t.userId, t.name),
    pg.unique("comms_email_template_team_id_name_unique").on(t.teamId, t.name)
  ]
);
