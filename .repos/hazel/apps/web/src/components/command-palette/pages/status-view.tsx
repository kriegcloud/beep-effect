"use client"

import { CommandMenuItem, CommandMenuLabel, CommandMenuSection } from "~/components/ui/command-menu"
import { usePresence } from "~/hooks/use-presence"
import { cn } from "~/lib/utils"

type PresenceStatus = "online" | "away" | "busy" | "dnd"

const STATUS_OPTIONS: { value: PresenceStatus; label: string; color: string; description: string }[] = [
	{ value: "online", label: "Online", color: "bg-success", description: "Available and active" },
	{ value: "away", label: "Away", color: "bg-warning", description: "Stepped away temporarily" },
	{ value: "busy", label: "Busy", color: "bg-warning", description: "Focused, limit interruptions" },
	{ value: "dnd", label: "Do Not Disturb", color: "bg-danger", description: "No notifications" },
]

interface StatusViewProps {
	onClose: () => void
}

export function StatusView({ onClose }: StatusViewProps) {
	const { status, setStatus } = usePresence()

	const handleStatusSelect = async (newStatus: PresenceStatus) => {
		await setStatus(newStatus)
		onClose()
	}

	return (
		<CommandMenuSection label="Set Status">
			{STATUS_OPTIONS.map((option) => (
				<CommandMenuItem
					key={option.value}
					textValue={`${option.label} ${option.description}`}
					onAction={() => handleStatusSelect(option.value)}
				>
					<span className={cn("size-3 shrink-0 rounded-full", option.color)} data-slot="icon" />
					<CommandMenuLabel>
						{option.label}
						{status === option.value && (
							<span className="ml-2 text-muted-fg text-xs">(current)</span>
						)}
					</CommandMenuLabel>
				</CommandMenuItem>
			))}
		</CommandMenuSection>
	)
}
