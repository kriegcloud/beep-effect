import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { ChannelId } from "@hazel/schema"
import { useMemo, useRef } from "react"
import { useOverlayPosition } from "react-aria"
import { createPortal } from "react-dom"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { threadMessagesWithAuthorAtomFamily } from "~/atoms/message-atoms"
import { MessageHoverProvider, useMessageHover } from "~/providers/message-hover-provider"
import type { MessageGroupPosition } from "./message"
import { MessageToolbar } from "./message-toolbar"
import { ThreadMessageItem } from "./thread-message-item"

interface ThreadMessageListProps {
	threadChannelId: ChannelId
}

/**
 * ThreadMessageList displays messages within a thread with full feature parity
 * to the main chat window, including:
 * - Right-click context menu
 * - Hover toolbar with quick actions
 * - Reactions display and quick reactions
 * - Message grouping
 * - User profile popovers
 *
 * Uses the composition pattern via ThreadMessageItem (which uses Message.* compound components)
 * to share the same building blocks as the main MessageItem.
 */
export function ThreadMessageList({ threadChannelId }: ThreadMessageListProps) {
	return (
		<MessageHoverProvider>
			<ThreadMessageListContent threadChannelId={threadChannelId} />
		</MessageHoverProvider>
	)
}

interface ProcessedThreadMessage {
	message: MessageWithPinned
	groupPosition: MessageGroupPosition
}

function ThreadMessageListContent({ threadChannelId }: ThreadMessageListProps) {
	const { state, actions, meta } = useMessageHover()
	const overlayRef = useRef<HTMLDivElement>(null)
	const targetRef = useRef<HTMLDivElement | null>(null)

	// Keep targetRef in sync with context state
	if (state.targetRef) {
		targetRef.current = state.targetRef
	}

	// Query thread messages with author data using the new atom
	const messagesResult = useAtomValue(threadMessagesWithAuthorAtomFamily({ threadChannelId }))
	const messages = Result.getOrElse(messagesResult, () => []) as MessageWithPinned[]

	// Find the hovered message for the toolbar
	const hoveredMessage = useMemo(
		() => messages.find((m) => m.id === state.hoveredMessageId) || null,
		[messages, state.hoveredMessageId],
	)

	// Position the toolbar relative to the hovered message
	const { overlayProps } = useOverlayPosition({
		targetRef,
		overlayRef,
		placement: "top end",
		offset: -6,
		shouldFlip: true,
		isOpen: state.hoveredMessageId !== null,
	})

	// Process messages with grouping logic
	const processedMessages = useMemo((): ProcessedThreadMessage[] => {
		const timeThreshold = 3 * 60 * 1000 // 3 minutes

		return messages.map((message, index): ProcessedThreadMessage => {
			const prevMessage = index > 0 ? messages[index - 1] : null
			const isGroupStart =
				!prevMessage ||
				message.authorId !== prevMessage.authorId ||
				message.createdAt.getTime() - prevMessage.createdAt.getTime() > timeThreshold ||
				!!prevMessage.replyToMessageId

			const nextMessage = index < messages.length - 1 ? messages[index + 1] : null
			const isGroupEnd =
				!nextMessage ||
				message.authorId !== nextMessage.authorId ||
				nextMessage.createdAt.getTime() - message.createdAt.getTime() > timeThreshold

			// Determine group position
			let groupPosition: MessageGroupPosition
			if (isGroupStart && isGroupEnd) {
				groupPosition = "standalone"
			} else if (isGroupStart) {
				groupPosition = "start"
			} else if (isGroupEnd) {
				groupPosition = "end"
			} else {
				groupPosition = "middle"
			}

			return {
				message,
				groupPosition,
			}
		})
	}, [messages])

	if (messages.length === 0) {
		return (
			<div className="flex h-full items-center justify-center p-4">
				<p className="text-muted-fg">No replies yet. Start the conversation!</p>
			</div>
		)
	}

	return (
		<div className="flex h-full flex-col overflow-y-auto px-2 py-2">
			{/* Apply highlight style to hovered message */}
			{state.hoveredMessageId && (
				<style>{`#message-${state.hoveredMessageId} { background-color: var(--color-secondary) !important; }`}</style>
			)}

			{processedMessages.map(({ message, groupPosition }) => (
				<ThreadMessageItem
					key={message.id}
					message={message}
					variants={{ groupPosition, highlight: "none" }}
				/>
			))}

			{/* Toolbar portal - renders floating toolbar when hovering a message */}
			{(state.hoveredMessageId || meta.isToolbarMenuOpen) &&
				hoveredMessage &&
				createPortal(
					<div
						ref={overlayRef}
						{...overlayProps}
						style={{ ...overlayProps.style, zIndex: 50 }}
						role="group"
						onMouseEnter={() => {
							actions.setToolbarHovered(true)
						}}
						onMouseLeave={() => {
							actions.setToolbarHovered(false)
						}}
					>
						{/* Invisible padding for larger hitbox */}
						<div className="-m-3 p-3">
							<MessageToolbar message={hoveredMessage} />
						</div>
					</div>,
					document.body,
				)}
		</div>
	)
}
