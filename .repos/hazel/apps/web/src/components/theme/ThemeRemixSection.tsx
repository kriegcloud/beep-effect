import type { Theme } from "@hazel/domain/models"
import { useCallback, useState } from "react"
import { IconArrowPath } from "~/components/icons/icon-arrow-path"
import { Button } from "~/components/ui/button"
import { generateRemixOptions } from "~/lib/theme/remix"
import { cn } from "~/lib/utils"

interface ThemeRemixSectionProps {
	onSelectTheme: (customization: Theme.ThemeCustomization) => void
}

/**
 * Section for generating and selecting random theme combinations.
 */
export function ThemeRemixSection({ onSelectTheme }: ThemeRemixSectionProps) {
	const [options, setOptions] = useState<Theme.ThemeCustomization[]>([])
	const [isGenerating, setIsGenerating] = useState(false)

	const handleGenerate = useCallback(() => {
		setIsGenerating(true)
		// Small delay for animation feel
		setTimeout(() => {
			const newOptions = generateRemixOptions(4)
			setOptions(newOptions)
			setIsGenerating(false)
		}, 150)
	}, [])

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<Button intent="outline" size="sm" onPress={handleGenerate} isPending={isGenerating}>
					<IconArrowPath className="mr-2 size-4" />
					Generate
				</Button>
			</div>

			{options.length > 0 && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{options.map((option, index) => (
						<RemixOptionCard
							key={`${option.primary}-${index}`}
							customization={option}
							onSelect={() => onSelectTheme(option)}
						/>
					))}
				</div>
			)}

			{options.length === 0 && (
				<p className="text-muted-fg text-sm">Click generate to create random theme combinations.</p>
			)}
		</div>
	)
}

interface RemixOptionCardProps {
	customization: Theme.ThemeCustomization
	onSelect: () => void
}

/**
 * A clickable card showing a remix theme option
 */
function RemixOptionCard({ customization, onSelect }: RemixOptionCardProps) {
	const getRadiusLabel = (radius: Theme.RadiusPreset) => {
		switch (radius) {
			case "tight":
				return "Tight"
			case "normal":
				return "Normal"
			case "round":
				return "Round"
			case "full":
				return "Full"
		}
	}

	const getGrayLabel = (gray: Theme.GrayPalette) => {
		return gray
			.replace("gray-", "")
			.replace(/^./, (c) => c.toUpperCase())
			.replace("gray", "Default")
	}

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"group flex flex-col gap-2 rounded-lg border border-border p-3 text-left transition-all",
				"hover:border-muted-fg/50 hover:bg-secondary/50",
				"focus:outline-none focus:ring-2 focus:ring-ring/40",
			)}
		>
			{/* Color preview */}
			<div className="flex items-center gap-2">
				<div
					className="size-8 rounded-md shadow-sm"
					style={{ backgroundColor: customization.primary }}
				/>
				<div className="flex flex-col">
					<span className="font-mono text-xs text-fg">{customization.primary.toUpperCase()}</span>
					<span className="text-muted-fg text-xs">{getGrayLabel(customization.grayPalette)}</span>
				</div>
			</div>

			{/* Radius preview */}
			<div className="flex items-center gap-2">
				<RadiusPreviewDots radius={customization.radius} color={customization.primary} />
				<span className="text-muted-fg text-xs">{getRadiusLabel(customization.radius)}</span>
			</div>

			{/* Apply button */}
			<div className="mt-1">
				<span className="font-medium text-primary text-xs group-hover:underline">Apply theme</span>
			</div>
		</button>
	)
}

/**
 * Visual dots showing the radius preset
 */
function RadiusPreviewDots({ radius, color }: { radius: Theme.RadiusPreset; color: string }) {
	const getRadius = (r: Theme.RadiusPreset) => {
		switch (r) {
			case "tight":
				return "2px"
			case "normal":
				return "4px"
			case "round":
				return "6px"
			case "full":
				return "999px"
		}
	}

	const radiusValue = getRadius(radius)

	return (
		<div className="flex gap-0.5">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="size-2"
					style={{
						backgroundColor: color,
						borderRadius: radiusValue,
						opacity: 0.3 + i * 0.2,
					}}
				/>
			))}
		</div>
	)
}
