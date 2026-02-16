import { memo } from "react"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { Message, type MessageGroupPosition, type MessageHighlight, type MessageVariants } from "./message"

// Re-export types from message.tsx for backwards compatibility
export type { MessageGroupPosition, MessageHighlight }

/**
 * Variant-based props for MessageItem
 * Replaces boolean prop proliferation with semantic groupings
 */
export interface MessageItemVariants extends MessageVariants {}

interface MessageItemProps {
	message: MessageWithPinned
	/**
	 * Variant configuration for the message item
	 * @example { groupPosition: 'start', highlight: 'pinned' }
	 */
	variants?: MessageItemVariants
	/**
	 * @deprecated Use `variants.groupPosition` instead
	 */
	isGroupStart?: boolean
	/**
	 * @deprecated Use `variants.groupPosition` instead
	 */
	isGroupEnd?: boolean
	/**
	 * @deprecated Use `variants.highlight === 'new'` instead
	 */
	isFirstNewMessage?: boolean
	/**
	 * @deprecated Use `variants.highlight === 'pinned'` instead
	 */
	isPinned?: boolean
	/**
	 * @deprecated Use `variants.highlight === 'search'` instead
	 */
	isHighlighted?: boolean
}

/**
 * Main channel message item - explicit variant for messages in the main chat.
 *
 * This composes all Message.* parts including ThreadPreview.
 *
 * Features included:
 * - Right-click context menu
 * - Hover for toolbar (via parent MessageHoverProvider)
 * - Quick reactions
 * - Reactions display
 * - Copy message
 * - Pin/unpin message
 * - Delete message (own messages)
 * - Reply (within channel)
 * - Reply in Thread
 * - Message grouping (avatar visibility based on group position)
 * - User profile popover
 * - Edited indicator
 * - File attachments
 * - Inline thread preview
 */
export const MessageItem = memo(function MessageItem({
	message,
	variants,
	// Legacy props for backwards compatibility
	isGroupStart: legacyIsGroupStart = false,
	isGroupEnd: legacyIsGroupEnd = false,
	isFirstNewMessage: legacyIsFirstNewMessage = false,
	isPinned: legacyIsPinned = false,
	isHighlighted: legacyIsHighlighted = false,
}: MessageItemProps) {
	// Resolve variants with backwards compatibility
	const groupPosition =
		variants?.groupPosition ?? resolveGroupPosition(legacyIsGroupStart, legacyIsGroupEnd)
	const highlight =
		variants?.highlight ?? resolveHighlight(legacyIsFirstNewMessage, legacyIsPinned, legacyIsHighlighted)

	if (!message) return null

	return (
		<Message.Provider message={message} variants={{ groupPosition, highlight }}>
			<Message.ContextMenu>
				<Message.Frame>
					{/* Reply Section */}
					<Message.ReplySection />

					{/* Main Content Row */}
					<div className="flex gap-4">
						<Message.Avatar />

						{/* Content Section */}
						<div className="min-w-0 flex-1">
							<Message.Header />
							<Message.Content />
							<Message.Attachments />
							<Message.Reactions />
							<Message.ThreadPreview />
						</div>
					</div>
				</Message.Frame>
			</Message.ContextMenu>
		</Message.Provider>
	)
})

/**
 * Helper to resolve group position from legacy boolean props
 */
function resolveGroupPosition(isGroupStart: boolean, isGroupEnd: boolean): MessageGroupPosition {
	if (isGroupStart && isGroupEnd) return "standalone"
	if (isGroupStart) return "start"
	if (isGroupEnd) return "end"
	return "middle"
}

/**
 * Helper to resolve highlight from legacy boolean props
 * Priority: pinned > new > search > none
 */
function resolveHighlight(
	isFirstNewMessage: boolean,
	isPinned: boolean,
	isHighlighted: boolean,
): MessageHighlight {
	if (isPinned) return "pinned"
	if (isFirstNewMessage) return "new"
	if (isHighlighted) return "search"
	return "none"
}

// Export MessageAuthorHeader for backwards compatibility if needed elsewhere
// It's now implemented inside Message.Header but we keep this export
import { format } from "date-fns"
import IconPin from "~/components/icons/icon-pin"
import { StatusEmojiWithTooltip } from "~/components/status/user-status-badge"
import { Badge } from "~/components/ui/badge"
import { useUserPresence } from "~/hooks/use-presence"

export const MessageAuthorHeader = ({
	message,
	isPinned = false,
}: {
	message: MessageWithPinned
	isPinned?: boolean
}) => {
	// Author is now directly attached to the message via leftJoin
	const user = message.author
	const { statusEmoji, customMessage, statusExpiresAt, quietHours } = useUserPresence(message.authorId)

	const isEdited = message.updatedAt && message.updatedAt.getTime() > message.createdAt.getTime()

	if (!user) return null

	const fullName = `${user.firstName} ${user.lastName}`

	return (
		<div className="flex items-baseline gap-2">
			<span className="font-semibold text-fg">{fullName}</span>
			<StatusEmojiWithTooltip
				emoji={statusEmoji}
				message={customMessage}
				expiresAt={statusExpiresAt}
				quietHours={quietHours}
			/>
			{user.userType === "machine" && (
				<Badge intent="primary" isCircle={false}>
					APP
				</Badge>
			)}
			<span className="text-muted-fg text-xs">
				{format(message.createdAt, "HH:mm")}
				{isEdited && " (edited)"}
			</span>
			{isPinned && (
				<span className="flex items-center gap-1 text-warning text-xs" title="Pinned message">
					<IconPin className="size-3" />
					<span>Pinned</span>
				</span>
			)}
		</div>
	)
}
