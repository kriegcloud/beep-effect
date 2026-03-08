import { filterTaggedLiterals } from './lib/languageTag.js'

/**
 * Returns a function to be used as callback to `Clownface#filter`.
 * It will return only literals which match the given `language(s)`
 *
 * @param {string | string[]} language
 * @returns {function(Clownface, number, Clownface[]): boolean}
 */
export function taggedLiteral(language) {
  return (current, index, pointers) => {
    const found = filterTaggedLiterals(pointers.map(ptr => ptr.term), { language })

    return found.some(term => current.term.equals(term))
  }
}
