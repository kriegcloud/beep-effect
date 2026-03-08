import RDF from './environment.js'
import namespace from './namespace.js'

const ns = namespace(RDF)

function mapLiteralsByLanguage(map, current) {
  const notLiteral = current.termType !== 'Literal'
  const notStringLiteral = ns.langString.equals(current.datatype) || ns.xsd.string.equals(current.datatype)

  if (notLiteral || !notStringLiteral) return map

  const language = current.language.toLowerCase()

  if (map.has(language)) {
    map.get(language).push(current)
  } else {
    map.set(language, [current])
  }

  return map
}

function createLanguageMapper(objects) {
  const literalsByLanguage = objects.reduce(mapLiteralsByLanguage, new Map())
  const langMapEntries = [...literalsByLanguage.entries()]

  return language => {
    const languageLowerCase = language.toLowerCase()

    if (languageLowerCase === '*') {
      return langMapEntries[0] && langMapEntries[0][1]
    }

    const exactMatch = literalsByLanguage.get(languageLowerCase)
    if (exactMatch) {
      return exactMatch
    }

    const secondaryMatches = langMapEntries.find(([entryLanguage]) => entryLanguage.startsWith(languageLowerCase))

    return secondaryMatches && secondaryMatches[1]
  }
}

/**
 *
 * @param {Term[]} terms
 * @param {object} [options]
 * @param {string | string[]} [options.language]
 * @returns {Term[]}
 */
export function filterTaggedLiterals(terms, { language }) {
  const languages = (typeof language === 'string' ? [language] : language)
  const getLiteralsForLanguage = createLanguageMapper(terms)

  return languages.map(getLiteralsForLanguage).find(Boolean) || []
}
