import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"

interface SegmentedControlProps<T extends string | number> {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<T>
  className?: string
  disabled?: boolean
  backgroundClassName?: string
  buttonClassName?: string
  enableKeyboard?: boolean
  exampleIndex?: number
}

export function SegmentedControl<T extends string | number>({
  backgroundClassName = "bg-blue-600",
  buttonClassName = "",
  className = "",
  disabled = false,
  enableKeyboard = true,
  exampleIndex,
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Map<T, HTMLButtonElement>>(new Map())
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  })

  // Update indicator position when value changes
  useEffect(() => {
    const activeButton = buttonRefs.current.get(value)
    const container = containerRef.current

    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      const left = buttonRect.left - containerRect.left
      const width = buttonRect.width

      setIndicatorStyle({ left, width })
    }
  }, [value, options])


  // Set button ref
  const setButtonRef = (option: T) => (el: HTMLButtonElement | null) => {
    if (el) {
      buttonRefs.current.set(option, el)
    } else {
      buttonRefs.current.delete(option)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center bg-neutral-800/50 rounded-lg p-1 border border-neutral-700/30 ${className}`}
    >
      {options.map(option => (
        <button
          type="button"
          key={option}
          ref={setButtonRef(option)}
          onClick={() => !disabled && onChange(option)}
          disabled={disabled}
          className={`
            relative z-10 px-3 py-1.5 text-sm font-mono rounded-md transition-colors duration-200 flex-1 text-center cursor-pointer
            ${
              value === option
                ? "text-white font-medium"
                : "text-neutral-400 hover:text-neutral-300"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${buttonClassName}
          `}
        >
          {option}
        </button>
      ))}
      <motion.div
        className={`absolute top-1 bottom-1 rounded-md shadow-md ${backgroundClassName}`}
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: "spring",
          visualDuration: 0.3,
          bounce: 0.0,
        }}
        style={{ zIndex: 0 }}
      />
    </div>
  )
}
