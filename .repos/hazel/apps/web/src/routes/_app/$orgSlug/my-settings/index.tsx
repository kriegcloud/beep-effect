import type { Theme as ThemeModel } from "@hazel/domain/models"
import { createFileRoute } from "@tanstack/react-router"
import type { Color } from "react-aria-components"
import { ColorSwatch, parseColor, Radio, RadioGroup } from "react-aria-components"
import { Dark, Light, System } from "~/components/modals/appearances"
import { GrayPaletteSelector } from "~/components/theme/GrayPaletteSelector"
import { RadiusSelector } from "~/components/theme/RadiusSelector"
import { ThemePresetCard } from "~/components/theme/ThemePresetCard"
import { ThemeRemixSection } from "~/components/theme/ThemeRemixSection"
import { type Theme, useTheme, useThemeCustomization } from "~/components/theme-provider"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { BUILT_IN_PRESETS, COLOR_SWATCHES, getBuiltInPreset } from "~/lib/theme/presets"
import { cn } from "~/lib/utils"

export const Route = createFileRoute("/_app/$orgSlug/my-settings/")({
	component: AppearanceSettings,
})

function AppearanceSettings() {
	const { theme, setTheme } = useTheme()
	const { customization, setPrimary, setGrayPalette, setRadius, setFullCustomization } =
		useThemeCustomization()

	// Convert hex string to Color object for react-aria-components
	const color = parseColor(customization.primary)

	const handleColorChange = (value: Color | null) => {
		if (!value) return
		setPrimary(value.toString("hex"))
	}

	// Find which preset matches current customization (if any)
	const activePresetId = BUILT_IN_PRESETS.find(
		(preset) =>
			preset.customization.primary === customization.primary &&
			preset.customization.grayPalette === customization.grayPalette &&
			preset.customization.radius === customization.radius,
	)?.id

	const handlePresetChange = (presetId: string) => {
		const preset = getBuiltInPreset(presetId)
		if (preset) {
			setFullCustomization(preset.customization)
		}
	}

	const handleRemixSelect = (newCustomization: ThemeModel.ThemeCustomization) => {
		setFullCustomization(newCustomization)
	}

	const themes = [
		{
			value: "system",
			label: "System preference",
			component: System,
		},
		{
			value: "light",
			label: "Light mode",
			component: Light,
		},
		{
			value: "dark",
			label: "Dark mode",
			component: Dark,
		},
	]

	return (
		<form
			className="flex flex-col gap-6 px-4 lg:px-8"
			onSubmit={(e) => {
				e.preventDefault()
			}}
		>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Appearance</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Change how your dashboard looks and feels.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{/* Form content */}
			<div className="flex flex-col gap-5">
				{/* Theme Presets Section */}
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Theme presets"
						description="Choose a pre-designed theme or customize your own."
					/>

					<div className="-mx-4 w-screen overflow-auto p-4 lg:mx-0 lg:w-auto lg:p-0">
						<RadioGroup
							aria-label="Theme preset"
							value={activePresetId || "custom"}
							onChange={handlePresetChange}
							className="flex gap-4"
						>
							{BUILT_IN_PRESETS.map((preset) => (
								<ThemePresetCard
									key={preset.id}
									preset={preset}
									isSelected={activePresetId === preset.id}
								/>
							))}
						</RadioGroup>
					</div>
				</div>

				<hr className="h-px w-full border-none bg-border" />

				{/* Remix Section */}
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Remix"
						description="Generate random theme combinations."
					/>

					<ThemeRemixSection onSelectTheme={handleRemixSelect} />
				</div>

				<hr className="h-px w-full border-none bg-border" />

				{/* Customize Section */}
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Brand color"
						description="Select or customize your brand color."
					/>

					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<RadioGroup
							aria-label="Brand color"
							value={color?.toString("hex")}
							onChange={(value) => {
								const newColor = parseColor(value)
								handleColorChange(newColor)
							}}
							className="flex flex-col items-start gap-4 md:flex-row md:items-center"
						>
							<div className="flex gap-2">
								{COLOR_SWATCHES.map((swatch) => (
									<Radio
										key={swatch.hex}
										value={swatch.hex}
										aria-label={parseColor(swatch.hex).getColorName("en-US")}
									>
										{({ isSelected, isFocused }) => (
											<ColorSwatch
												id={`color-${swatch.hex}`}
												color={swatch.hex}
												className={cn(
													"size-7 cursor-pointer rounded-full outline-1 outline-black/10 -outline-offset-1",
													(isSelected || isFocused) &&
														"ring-2 ring-ring ring-offset-2 ring-offset-bg",
												)}
											/>
										)}
									</Radio>
								))}
							</div>
						</RadioGroup>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Gray palette"
						description="Choose the undertone for gray colors."
					/>

					<GrayPaletteSelector value={customization.grayPalette} onChange={setGrayPalette} />
				</div>

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Border radius"
						description="Adjust the roundness of UI elements."
					/>

					<RadiusSelector value={customization.radius} onChange={setRadius} />
				</div>

				<hr className="h-px w-full border-none bg-border" />

				{/* Display Mode Section */}
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Display mode"
						description="Switch between light and dark modes."
					/>

					<div className="-mx-4 -mb-4 w-screen overflow-auto p-4 lg:w-[calc(100%+48px)]">
						<RadioGroup
							aria-label="Display preference"
							defaultValue="system"
							className="flex gap-5"
							value={theme}
							onChange={(value) => setTheme(value as Theme)}
						>
							{themes.map((themeOption) => (
								<Radio
									key={themeOption.value}
									value={themeOption.value}
									aria-label={themeOption.label}
									className="flex cursor-pointer flex-col gap-3"
								>
									{({ isSelected, isFocusVisible }) => (
										<>
											<section
												className={cn(
													"relative h-33 w-50 rounded-[10px] bg-secondary",
													isSelected && "outline-2 outline-ring outline-offset-2",
												)}
											>
												<themeOption.component className="size-full" />

												{isSelected && (
													<div
														className={cn(
															"absolute bottom-2 left-2 flex size-5 items-center justify-center rounded-full border-2 border-fg bg-primary",
															isFocusVisible &&
																"ring-2 ring-ring ring-offset-2",
														)}
													>
														<div className="size-2.5 rounded-full bg-fg" />
													</div>
												)}
											</section>
											<section className="w-full">
												<p className="font-semibold text-fg text-sm">
													{themeOption.label}
												</p>
											</section>
										</>
									)}
								</Radio>
							))}
						</RadioGroup>
					</div>
				</div>
			</div>
		</form>
	)
}
