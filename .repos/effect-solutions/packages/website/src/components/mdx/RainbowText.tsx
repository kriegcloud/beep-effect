"use client"

import { motion } from "motion/react"

interface RainbowTextProps {
  children: string
}

export function RainbowText({ children }: RainbowTextProps) {
  const letters = children.split("").map((letter, index) => ({
    letter,
    index,
  }))

  return (
    <span className="inline-block">
      {letters.map(({ letter, index }) => (
        <motion.span
          key={index}
          className="inline-block"
          style={{
            display: letter === " " ? "inline" : "inline-block",
          }}
          animate={{
            color: [
              `hsl(${(index * 30) % 360}, 100%, 70%)`,
              `hsl(${(index * 30 + 60) % 360}, 100%, 70%)`,
              `hsl(${(index * 30 + 120) % 360}, 100%, 70%)`,
              `hsl(${(index * 30 + 180) % 360}, 100%, 70%)`,
              `hsl(${(index * 30 + 240) % 360}, 100%, 70%)`,
              `hsl(${(index * 30 + 300) % 360}, 100%, 70%)`,
              `hsl(${(index * 30) % 360}, 100%, 70%)`,
            ],
            filter: [
              "brightness(1) saturate(1)",
              "brightness(1.2) saturate(1.3)",
              "brightness(1) saturate(1)",
              "brightness(1.2) saturate(1.3)",
              "brightness(1) saturate(1)",
              "brightness(1.2) saturate(1.3)",
              "brightness(1) saturate(1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  )
}
