import term from './term.js'
import toArray from './toArray.js'

export default function toTermArray(items, type, languageOrDatatype, factory) {
  if ((typeof items === 'undefined' || items === null) && !type) {
    return items
  }

  return (toArray(items) || [undefined]).reduce((all, item) => {
    if (typeof item === 'object' && item.terms) {
      return all.concat(item.terms)
    }

    all.push(term(item, type, languageOrDatatype, factory))

    return all
  }, [])
}
