"use client"

import { EmojiPicker as EmojiPickerPrimitive } from "frimousse"
import type * as React from "react"
import { cn } from "~/lib/utils"

function EmojiPickerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex w-full min-w-0 max-w-(--frimousse-viewport-width) items-center gap-2 border-border border-t p-3",
				className,
			)}
			data-slot="emoji-picker-footer"
			{...props}
		>
			<EmojiPickerPrimitive.ActiveEmoji>
				{({ emoji }) =>
					emoji ? (
						<>
							<div className="flex size-10 flex-none items-center justify-center text-2xl">
								{emoji.emoji}
							</div>
							<span className="truncate text-secondary-fg text-sm">{emoji.label}</span>
						</>
					) : (
						<span className="ml-1.5 flex h-10 items-center truncate text-secondary-fg text-sm">
							Select an emoji…
						</span>
					)
				}
			</EmojiPickerPrimitive.ActiveEmoji>
		</div>
	)
}

export { EmojiPickerFooter }
