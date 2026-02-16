import type { Theme } from "@hazel/domain/models"
import type { Key } from "react-aria-components"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import { GRAY_PALETTE_DESCRIPTIONS, GRAY_PALETTE_LABELS } from "~/lib/theme/presets"

interface GrayPaletteSelectorProps {
	value: Theme.GrayPalette
	onChange: (value: Theme.GrayPalette) => void
}

const GRAY_PALETTES: Theme.GrayPalette[] = [
	"gray",
	"gray-blue",
	"gray-cool",
	"gray-modern",
	"gray-neutral",
	"gray-iron",
	"gray-true",
	"gray-warm",
]

/**
 * Dropdown selector for gray palette selection.
 * Shows a preview of the gray shades alongside the palette name.
 */
export function GrayPaletteSelector({ value, onChange }: GrayPaletteSelectorProps) {
	const handleChange = (key: Key | null) => {
		if (key) {
			onChange(key as Theme.GrayPalette)
		}
	}

	return (
		<Select aria-label="Gray palette" selectedKey={value} onSelectionChange={handleChange}>
			<SelectTrigger className="w-full sm:w-64">
				<GrayPalettePreview palette={value} showLabel />
			</SelectTrigger>
			<SelectContent items={GRAY_PALETTES.map((p) => ({ id: p }))}>
				{(item) => (
					<SelectItem id={item.id} textValue={GRAY_PALETTE_LABELS[item.id as Theme.GrayPalette]}>
						<GrayPalettePreview palette={item.id as Theme.GrayPalette} showLabel />
					</SelectItem>
				)}
			</SelectContent>
		</Select>
	)
}

interface GrayPalettePreviewProps {
	palette: Theme.GrayPalette
	showLabel?: boolean
}

/**
 * Visual preview of a gray palette showing gradient of shades
 */
function GrayPalettePreview({ palette, showLabel }: GrayPalettePreviewProps) {
	// The shades we want to show in the preview
	const shades = ["200", "400", "600", "800"]

	return (
		<div className="flex items-center gap-3">
			{/* data-slot="icon" makes the checkmark overlay instead of inline */}
			<div className="flex -space-x-0.5" data-slot="icon">
				{shades.map((shade) => (
					<div
						key={shade}
						className="size-4 rounded-full ring-1 ring-bg"
						style={{
							backgroundColor: `var(--color-${palette}-${shade})`,
						}}
					/>
				))}
			</div>
			{showLabel && <span className="text-fg text-sm">{GRAY_PALETTE_LABELS[palette]}</span>}
		</div>
	)
}

/**
 * A more detailed preview card for gray palettes (for settings page)
 */
export function GrayPaletteCard({
	palette,
	isSelected,
	onSelect,
}: {
	palette: Theme.GrayPalette
	isSelected: boolean
	onSelect: () => void
}) {
	const shades = ["100", "300", "500", "700", "900"]

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
				isSelected
					? "border-ring bg-primary-subtle/10 ring-2 ring-ring/20"
					: "border-border hover:border-muted-fg/50"
			}`}
		>
			<div className="flex gap-0.5">
				{shades.map((shade) => (
					<div
						key={shade}
						className="size-5 rounded"
						style={{
							backgroundColor: `var(--color-${palette}-${shade})`,
						}}
					/>
				))}
			</div>
			<div className="flex flex-col">
				<span className="font-medium text-fg text-sm">{GRAY_PALETTE_LABELS[palette]}</span>
				<span className="text-muted-fg text-xs">{GRAY_PALETTE_DESCRIPTIONS[palette]}</span>
			</div>
		</button>
	)
}
