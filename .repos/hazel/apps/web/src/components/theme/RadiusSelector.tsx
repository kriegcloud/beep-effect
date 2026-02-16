import type { Theme } from "@hazel/domain/models"
import { Radio, RadioGroup } from "react-aria-components"
import { RADIUS_LABELS, RADIUS_VALUES } from "~/lib/theme/presets"
import { cn } from "~/lib/utils"

interface RadiusSelectorProps {
	value: Theme.RadiusPreset
	onChange: (value: Theme.RadiusPreset) => void
}

const RADIUS_PRESETS: Theme.RadiusPreset[] = ["tight", "normal", "round", "full"]

/**
 * Visual segmented control for selecting border radius preset.
 */
export function RadiusSelector({ value, onChange }: RadiusSelectorProps) {
	return (
		<RadioGroup
			aria-label="Border radius"
			value={value}
			onChange={(newValue) => onChange(newValue as Theme.RadiusPreset)}
			className="flex flex-wrap gap-2"
		>
			{RADIUS_PRESETS.map((preset) => (
				<RadiusOption key={preset} preset={preset} isSelected={value === preset} />
			))}
		</RadioGroup>
	)
}

interface RadiusOptionProps {
	preset: Theme.RadiusPreset
	isSelected: boolean
}

/**
 * Individual radius option showing a visual preview
 */
function RadiusOption({ preset, isSelected }: RadiusOptionProps) {
	return (
		<Radio value={preset} aria-label={RADIUS_LABELS[preset]} className="group cursor-pointer">
			{({ isFocusVisible }) => (
				<div
					className={cn(
						"flex items-center gap-2 rounded-lg border px-3 py-2 transition-all",
						isSelected
							? "border-ring bg-primary-subtle/10 ring-2 ring-ring/20"
							: "border-border hover:border-muted-fg/50 hover:bg-secondary/50",
						isFocusVisible && "ring-2 ring-ring/40",
					)}
				>
					<RadiusPreview preset={preset} isSelected={isSelected} />
					<span className={cn("text-sm", isSelected ? "font-medium text-fg" : "text-muted-fg")}>
						{RADIUS_LABELS[preset]}
					</span>
				</div>
			)}
		</Radio>
	)
}

/**
 * Visual preview of a radius preset
 */
function RadiusPreview({ preset, isSelected }: { preset: Theme.RadiusPreset; isSelected: boolean }) {
	// Convert rem to pixels for inline styles (assuming 16px base)
	const getRadiusPx = (r: Theme.RadiusPreset) => {
		switch (r) {
			case "tight":
				return "4px"
			case "normal":
				return "8px"
			case "round":
				return "12px"
			case "full":
				return "16px"
		}
	}

	const radiusPx = getRadiusPx(preset)

	return (
		<div
			className={cn(
				"size-6 border-2",
				isSelected ? "border-primary bg-primary-subtle/50" : "border-muted-fg/30 bg-muted",
			)}
			style={{ borderRadius: radiusPx }}
		/>
	)
}

/**
 * Inline radius preview for displaying current selection
 */
export function RadiusPreviewInline({ preset }: { preset: Theme.RadiusPreset }) {
	const getRadiusPx = (r: Theme.RadiusPreset) => {
		switch (r) {
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

	return (
		<div className="flex items-center gap-2">
			<div
				className="size-4 border-2 border-primary bg-primary-subtle/50"
				style={{ borderRadius: getRadiusPx(preset) }}
			/>
			<span className="text-sm">{RADIUS_LABELS[preset]}</span>
		</div>
	)
}
