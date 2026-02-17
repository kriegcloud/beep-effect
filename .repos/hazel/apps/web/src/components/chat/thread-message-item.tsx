import { memo } from "react"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { Message, type MessageVariants } from "./message"

interface ThreadMessageItemProps {
	message: MessageWithPinned
	/**
	 * Variant configuration for the message item
	 * @example { groupPosition: 'start', highlight: 'none' }
	 */
	variants?: MessageVariants
}

/**
 * Thread message item - explicit variant for messages within threads.
 *
 * This composes all Message.* parts EXCEPT ThreadPreview, since:
 * 1. Threads cannot have nested threads
 * 2. Thread messages are already within a thread context
 *
 * Features included:
 * - Right-click context menu
 * - Hover for toolbar (via parent MessageHoverProvider)
 * - Quick reactions
 * - Reactions display
 * - Copy message
 * - Pin/unpin message
 * - Delete message (own messages)
 * - Reply (within thread)
 * - Message grouping (avatar visibility based on group position)
 * - User profile popover
 * - Edited indicator
 * - File attachments
 *
 * Features excluded:
 * - "Reply in Thread" context menu option (hidden via channel type check in MessageContextMenu)
 * - Inline thread preview (explicitly omitted)
 */
export const ThreadMessageItem = memo(function ThreadMessageItem({
	message,
	variants,
}: ThreadMessageItemProps) {
	return (
		<Message.Provider message={message} variants={variants}>
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
							{/* No ThreadPreview - explicitly omitted for thread messages */}
						</div>
					</div>
				</Message.Frame>
			</Message.ContextMenu>
		</Message.Provider>
	)
})
