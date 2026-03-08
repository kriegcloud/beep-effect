import { useAtomValue } from "@effect/atom-react"
import { themeIdAtom } from "../atoms/session.js"
import { type Theme, themes } from "../theme.js"

export function useTheme(): Theme {
  const themeId = useAtomValue(themeIdAtom)
  return themes[themeId]
}
