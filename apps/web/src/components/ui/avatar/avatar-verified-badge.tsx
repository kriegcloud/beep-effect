import { cx } from "~/utils/cx"
import { useAvatarContext } from "./avatar-context"
import { VerifiedTick } from "./base-components"

export interface AvatarVerifiedBadgeProps {
	className?: string
}

export function AvatarVerifiedBadge({ className }: AvatarVerifiedBadgeProps) {
	const { size } = useAvatarContext()
	return (
		<VerifiedTick
			size={size === "xxs" ? "xs" : size}
			className={cx(
				"absolute right-0 bottom-0",
				(size === "xxs" || size === "xs") && "-right-px -bottom-px",
				className,
			)}
		/>
	)
}
