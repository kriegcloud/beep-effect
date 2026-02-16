import type { PresenceStatus } from "~/utils/status"
import { useAvatarContext } from "./avatar-context"
import { AvatarOnlineIndicator } from "./base-components"

export interface AvatarStatusIndicatorProps {
	status: PresenceStatus
	className?: string
}

export function AvatarStatusIndicator({ status, className }: AvatarStatusIndicatorProps) {
	const { size } = useAvatarContext()
	return <AvatarOnlineIndicator status={status} size={size === "xxs" ? "xs" : size} className={className} />
}
