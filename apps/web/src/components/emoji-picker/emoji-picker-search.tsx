"use client"

import { EmojiPicker as EmojiPickerPrimitive } from "frimousse"
import type * as React from "react"
import IconMagnifier3 from "~/components/icons/icon-magnifier-3"
import { cn } from "~/lib/utils"

function EmojiPickerSearch({
	className,
	...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Search>) {
	return (
		<div
			className={cn("flex h-11 items-center gap-2.5 border-border border-b px-3.5", className)}
			data-slot="emoji-picker-search-wrapper"
		>
			<IconMagnifier3 className="size-5 shrink-0 opacity-50" />
			<EmojiPickerPrimitive.Search
				className="flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-hidden placeholder:text-muted-fg disabled:cursor-not-allowed disabled:opacity-50"
				data-slot="emoji-picker-search"
				{...props}
			/>
		</div>
	)
}

export { EmojiPickerSearch }
