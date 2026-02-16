import type { ReactNode } from "react"
import { cx } from "~/utils/cx"

export interface AvatarBadgeProps {
	children: ReactNode
	className?: string
}

export function AvatarBadge({ children, className }: AvatarBadgeProps) {
	return <span className={cx("absolute right-0 bottom-0", className)}>{children}</span>
}
