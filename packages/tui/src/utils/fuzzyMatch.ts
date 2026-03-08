/** Character-by-character fuzzy match. Returns null if no match. */
export function fuzzyMatch(query: string, text: string): { score: number; matchedIndices: ReadonlyArray<number> } | null {
  if (query.length === 0) return { score: 0, matchedIndices: [] }

  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  const matchedIndices: Array<number> = []
  let qi = 0
  let score = 0
  let prevMatchIdx = -2

  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      matchedIndices.push(ti)
      // Consecutive character bonus
      if (ti === prevMatchIdx + 1) {
        score += 3
      } else {
        score += 1
      }
      // Start-of-word bonus
      if (ti === 0 || text[ti - 1] === " ") {
        score += 2
      }
      prevMatchIdx = ti
      qi++
    }
  }

  if (qi < lowerQuery.length) return null
  return { score, matchedIndices }
}
