import type { NotificationId, OrganizationMemberId } from "@hazel/schema"
import { sql } from "drizzle-orm"
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

// Notifications table
export const notificationsTable = pgTable(
	"notifications",
	{
		id: uuid().primaryKey().defaultRandom().$type<NotificationId>(),
		memberId: uuid().notNull().$type<OrganizationMemberId>(),
		targetedResourceId: uuid(),
		targetedResourceType: varchar({ length: 50 }), // 'channel' or 'organization'
		// Can be a message
		resourceId: uuid(),
		resourceType: varchar({ length: 50 }), // 'message'
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		readAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("notifications_member_id_idx").on(table.memberId),
		index("notifications_member_created_id_idx").on(table.memberId, table.createdAt, table.id),
		index("notifications_targeted_resource_idx").on(table.targetedResourceId, table.targetedResourceType),
		index("notifications_resource_idx").on(table.resourceId, table.resourceType),
		index("notifications_read_at_idx").on(table.readAt),
		uniqueIndex("notifications_message_channel_dedupe_idx")
			.on(table.memberId, table.resourceId, table.targetedResourceId)
			.where(sql`${table.resourceType} = 'message' AND ${table.targetedResourceType} = 'channel'`),
	],
)

// Type exports
export type Notification = typeof notificationsTable.$inferSelect
export type NewNotification = typeof notificationsTable.$inferInsert
