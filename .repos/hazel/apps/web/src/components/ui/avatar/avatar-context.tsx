import { createContext, use } from "react"

export type AvatarSize =
	| "xxs"
	| "xs"
	| "sm"
	| "md"
	| "lg"
	| "xl"
	| "2xl"
	| "3xl"
	| "4xl"
	| "5xl"
	| "6xl"
	| "7xl"
	| "8xl"
	| "9xl"

export interface AvatarContextValue {
	size: AvatarSize
	isSquare: boolean
	isFailed: boolean
	setIsFailed: (failed: boolean) => void
	/** Whether the image is currently showing (has src and hasn't failed) */
	imageShowing: boolean
	setImageShowing: (showing: boolean) => void
	/** Optional deterministic seed for non-image fallbacks (e.g., Facehash). */
	seed?: string
}

export const AvatarContext = createContext<AvatarContextValue | null>(null)

export function useAvatarContext() {
	const context = use(AvatarContext)
	if (!context) {
		throw new Error("Avatar.* components must be used within Avatar.Root")
	}
	return context
}
