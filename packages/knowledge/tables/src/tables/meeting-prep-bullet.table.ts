import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const meetingPrepBullet = OrgTable.make(KnowledgeEntityIds.MeetingPrepBulletId)(
  {
    meetingPrepId: pg.text("meeting_prep_id").notNull(),
    bulletIndex: pg.integer("bullet_index").notNull(),
    text: pg.text("text").notNull(),
  },
  (t) => [
    pg.index("meeting_prep_bullet_organization_id_idx").on(t.organizationId),
    pg.index("meeting_prep_bullet_meeting_prep_id_idx").on(t.meetingPrepId),
    pg.index("meeting_prep_bullet_meeting_prep_id_bullet_index_idx").on(t.meetingPrepId, t.bulletIndex),
  ]
);

