import type { Theme } from "@hazel/domain/models"
import { Radio } from "react-aria-components"
import { cn } from "~/lib/utils"

interface ThemePresetCardProps {
	preset: Theme.ThemePreset
	isSelected: boolean
}

/**
 * A visual card for selecting a theme preset.
 * Shows a preview of the theme colors and radius.
 */
export function ThemePresetCard({ preset, isSelected }: ThemePresetCardProps) {
	const { customization } = preset

	return (
		<Radio
			value={preset.id}
			aria-label={preset.name}
			className="group flex cursor-pointer flex-col gap-2"
		>
			{({ isFocusVisible }) => (
				<>
					<div
						className={cn(
							"relative flex h-20 w-28 flex-col overflow-hidden rounded-lg border-2 bg-secondary transition-all",
							isSelected
								? "border-ring ring-2 ring-ring/20"
								: "border-border hover:border-muted-fg/50",
							isFocusVisible && "ring-2 ring-ring/40",
						)}
					>
						{/* Mini preview */}
						<ThemePreview customization={customization} />
					</div>
					<div className="flex flex-col">
						<span className={cn("font-medium text-sm", isSelected ? "text-fg" : "text-muted-fg")}>
							{preset.name}
						</span>
					</div>
				</>
			)}
		</Radio>
	)
}

/**
 * Mini preview of a theme showing a navbar, sidebar, and button mockup
 */
function ThemePreview({ customization }: { customization: Theme.ThemeCustomization }) {
	// Calculate CSS values for preview
	const getRadiusValue = (radius: Theme.RadiusPreset) => {
		switch (radius) {
			case "tight":
				return "2px"
			case "normal":
				return "4px"
			case "round":
				return "6px"
			case "full":
				return "8px"
		}
	}

	const radiusValue = getRadiusValue(customization.radius)

	return (
		<div className="flex h-full w-full flex-col">
			{/* Top navbar mockup */}
			<div className="flex h-3 w-full items-center gap-1 border-b border-border/50 bg-bg px-1.5">
				<div className="size-1 rounded-full bg-muted-fg/30" />
				<div className="size-1 rounded-full bg-muted-fg/30" />
				<div className="size-1 rounded-full bg-muted-fg/30" />
			</div>

			<div className="flex flex-1">
				{/* Sidebar mockup */}
				<div className="flex w-5 flex-col gap-1 border-r border-border/50 bg-bg p-1">
					<div className="h-1.5 w-full rounded-sm bg-muted-fg/20" />
					<div
						className="h-1.5 w-full"
						style={{
							backgroundColor: customization.primary,
							borderRadius: radiusValue,
							opacity: 0.9,
						}}
					/>
					<div className="h-1.5 w-full rounded-sm bg-muted-fg/20" />
				</div>

				{/* Content area mockup */}
				<div className="flex flex-1 flex-col gap-1.5 p-2">
					<div className="h-1.5 w-3/4 rounded-sm bg-muted-fg/20" />
					<div className="h-1.5 w-1/2 rounded-sm bg-muted-fg/15" />
					<div className="mt-auto flex gap-1">
						<div
							className="h-3 w-8 text-[4px] font-medium text-white"
							style={{
								backgroundColor: customization.primary,
								borderRadius: radiusValue,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							Save
						</div>
						<div
							className="h-3 w-6 border bg-secondary text-[4px] text-muted-fg"
							style={{
								borderRadius: radiusValue,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							No
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
