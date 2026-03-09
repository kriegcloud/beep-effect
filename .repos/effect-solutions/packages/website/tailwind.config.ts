import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "commit-mono": ["var(--font-commit-mono)", "monospace"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

export default config
