import type { Notification } from "@hazel/domain/models"
import { and, eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { useMemo } from "react"
import { notificationCollection } from "~/db/collections"

export type NotificationLike = Pick<
	typeof Notification.Model.Type,
	"id" | "readAt" | "targetedResourceId" | "targetedResourceType"
>

export const isUnreadNotification = (
	notification: NotificationLike,
	optimisticReadIds?: ReadonlySet<string>,
): boolean => {
	if (optimisticReadIds?.has(notification.id)) {
		return false
	}
	return notification.readAt === null
}

export const selectUnreadCount = (
	notifications: ReadonlyArray<NotificationLike>,
	optimisticReadIds?: ReadonlySet<string>,
): number => {
	let count = 0
	for (const notification of notifications) {
		if (isUnreadNotification(notification, optimisticReadIds)) {
			count += 1
		}
	}
	return count
}

export const selectUnreadCountsByChannel = (
	notifications: ReadonlyArray<NotificationLike>,
	optimisticReadIds?: ReadonlySet<string>,
): Map<string, number> => {
	const counts = new Map<string, number>()

	for (const notification of notifications) {
		if (!isUnreadNotification(notification, optimisticReadIds)) continue
		if (notification.targetedResourceType !== "channel") continue
		if (!notification.targetedResourceId) continue

		const current = counts.get(notification.targetedResourceId) ?? 0
		counts.set(notification.targetedResourceId, current + 1)
	}

	return counts
}

export const useNotificationUnreadCountsByChannel = (memberId: string | undefined) => {
	const { data, isLoading } = useLiveQuery(
		(q) =>
			memberId
				? q
						.from({ notification: notificationCollection })
						.where(({ notification }) =>
							and(eq(notification.memberId, memberId), isNull(notification.readAt)),
						)
				: null,
		[memberId],
	)

	const unreadByChannel = useMemo(() => {
		if (!data) return new Map<string, number>()
		return selectUnreadCountsByChannel(data)
	}, [data])

	return {
		isLoading,
		unreadByChannel,
		totalUnread: data?.length ?? 0,
	}
}
