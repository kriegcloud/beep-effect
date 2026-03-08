function language (languages) {
  const scoreMap = new Map()
  let wildcardScore

  for (const [index, language] of Object.entries(languages)) {
    const score = 1 - (index / languages.length)

    if (language === '*') {
      wildcardScore = score
    } else {
      scoreMap.set(language, score)
    }
  }

  return ({ dataset, graph, terms = [] }) => {
    const results = []

    for (const term of terms) {
      let score = scoreMap.get(term.language)

      if (typeof score === 'undefined' && typeof term.language === 'string' && wildcardScore) {
        score = wildcardScore
      }

      if (typeof score !== 'undefined') {
        results.push({ dataset, graph, term, score })
      }
    }

    return results
  }
}

export default language
