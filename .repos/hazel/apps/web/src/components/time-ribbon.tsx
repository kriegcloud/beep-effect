import { motion } from "motion/react"
import { useRef } from "react"

interface TimeRibbonProps {
	selectedOffset: number | null
	onHover: (offset: number | null) => void
	onSelect: (offset: number) => void
}

const UTC_OFFSETS = [
	{ offset: -12, label: "-12" },
	{ offset: -11, label: "-11" },
	{ offset: -10, label: "-10" },
	{ offset: -9, label: "-9" },
	{ offset: -8, label: "-8" },
	{ offset: -7, label: "-7" },
	{ offset: -6, label: "-6" },
	{ offset: -5, label: "-5" },
	{ offset: -4, label: "-4" },
	{ offset: -3, label: "-3" },
	{ offset: -2, label: "-2" },
	{ offset: -1, label: "-1" },
	{ offset: 0, label: "UTC" },
	{ offset: 1, label: "+1" },
	{ offset: 2, label: "+2" },
	{ offset: 3, label: "+3" },
	{ offset: 4, label: "+4" },
	{ offset: 5, label: "+5" },
	{ offset: 5.5, label: "+5:30" },
	{ offset: 6, label: "+6" },
	{ offset: 7, label: "+7" },
	{ offset: 8, label: "+8" },
	{ offset: 9, label: "+9" },
	{ offset: 10, label: "+10" },
	{ offset: 11, label: "+11" },
	{ offset: 12, label: "+12" },
]

export function TimeRibbon({ selectedOffset, onHover, onSelect }: TimeRibbonProps) {
	const scrollRef = useRef<HTMLDivElement>(null)

	return (
		<div className="relative">
			<div
				ref={scrollRef}
				className="flex gap-1 overflow-x-auto scrollbar-hide py-2 px-4"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{UTC_OFFSETS.map((item) => {
					const isSelected = selectedOffset === item.offset

					return (
						<motion.button
							key={item.offset}
							onClick={() => onSelect(item.offset)}
							onMouseEnter={() => onHover(item.offset)}
							onMouseLeave={() => onHover(null)}
							className={`
                relative px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-colors shrink-0
                ${
					isSelected
						? "bg-primary text-primary-fg"
						: "hover:bg-secondary text-muted-fg hover:text-fg"
				}
              `}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							{item.label}
							{isSelected && (
								<motion.div
									layoutId="ribbon-indicator"
									className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
								/>
							)}
						</motion.button>
					)
				})}
			</div>
		</div>
	)
}
