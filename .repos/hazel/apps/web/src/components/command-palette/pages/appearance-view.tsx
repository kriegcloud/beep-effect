"use client"

import { ColorSwatch } from "react-aria-components"
import { type Theme, useTheme } from "~/components/theme-provider"
import { CommandMenuItem, CommandMenuLabel, CommandMenuSection } from "~/components/ui/command-menu"
import { cn } from "~/lib/utils"

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
	{
		value: "system",
		label: "System",
		icon: (
			<div className="flex size-4 overflow-hidden rounded-sm" data-slot="icon">
				<div className="w-1/2 bg-white" />
				<div className="w-1/2 bg-zinc-900" />
			</div>
		),
	},
	{
		value: "light",
		label: "Light",
		icon: <div className="size-4 rounded-sm border border-zinc-200 bg-white" data-slot="icon" />,
	},
	{
		value: "dark",
		label: "Dark",
		icon: <div className="size-4 rounded-sm border border-zinc-700 bg-zinc-900" data-slot="icon" />,
	},
]

const COLOR_SWATCHES = [
	{ hex: "#535862", name: "gray" },
	{ hex: "#099250", name: "green" },
	{ hex: "#1570EF", name: "blue" },
	{ hex: "#444CE7", name: "indigo" },
	{ hex: "#6938EF", name: "purple" },
	{ hex: "#BA24D5", name: "fuchsia" },
	{ hex: "#DD2590", name: "pink" },
	{ hex: "#E04F16", name: "orange" },
]

interface AppearanceViewProps {
	onClose: () => void
}

export function AppearanceView({ onClose }: AppearanceViewProps) {
	const { theme, setTheme, brandColor, setBrandColor } = useTheme()

	const handleThemeSelect = (newTheme: Theme) => {
		setTheme(newTheme)
		onClose()
	}

	const handleColorSelect = (hex: string) => {
		setBrandColor(hex)
		onClose()
	}

	return (
		<>
			<CommandMenuSection label="Theme">
				{THEME_OPTIONS.map((option) => (
					<CommandMenuItem
						key={option.value}
						textValue={`${option.label} theme mode`}
						onAction={() => handleThemeSelect(option.value)}
					>
						{option.icon}
						<CommandMenuLabel>
							{option.label}
							{theme === option.value && (
								<span className="ml-2 text-muted-fg text-xs">(current)</span>
							)}
						</CommandMenuLabel>
					</CommandMenuItem>
				))}
			</CommandMenuSection>

			<CommandMenuSection label="Accent Color">
				<div className="col-span-full flex gap-2 px-2 py-1.5">
					{COLOR_SWATCHES.map((swatch) => (
						<button
							key={swatch.hex}
							type="button"
							onClick={() => handleColorSelect(swatch.hex)}
							className={cn(
								"size-6 cursor-pointer rounded-full outline-1 outline-black/10 -outline-offset-1 transition-all hover:scale-110",
								brandColor === swatch.hex && "ring-2 ring-ring ring-offset-2 ring-offset-bg",
							)}
						>
							<ColorSwatch color={swatch.hex} className="size-full rounded-full" />
						</button>
					))}
				</div>
			</CommandMenuSection>
		</>
	)
}
