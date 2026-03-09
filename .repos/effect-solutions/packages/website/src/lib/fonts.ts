import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

export const commitMono = localFont({
  src: "../../public/fonts/commit-mono/CommitMono-Variable.ttf",
  variable: "--font-commit-mono",
})

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
