import type { ComponentType, ReactNode } from "react"
import { cn } from "~/lib/utils"

interface EmptyStateProps {
	icon?: ComponentType<{ className?: string }>
	title: string
	description?: string
	action?: ReactNode
	className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
			{Icon && (
				<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary">
					<Icon className="size-6 text-muted-fg" />
				</div>
			)}
			<h3 className="font-semibold text-fg">{title}</h3>
			{description && <p className="mt-1 max-w-sm text-muted-fg text-sm">{description}</p>}
			{action && <div className="mt-4">{action}</div>}
		</div>
	)
}
