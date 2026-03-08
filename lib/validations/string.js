import * as ns from '../namespaces.js'

function languageMatch (item, language) {
  if (!language) {
    return false
  }

  return language.slice(0, item.length) === item
}

function compileLanguageIn (shape) {
  const languageIn = [...new Set([...shape.ptr.out([ns.sh.languageIn]).list()].map(item => item.value))]

  return {
    generic: validateLanguageIn(languageIn)
  }
}

function validateLanguageIn (languageIn) {
  return context => {
    const result = languageIn.some(item => languageMatch(item, context.valueOrNode.term.language))

    context.test(result, ns.sh.LanguageInConstraintComponent, {
      args: { languageIn: languageIn.join(', ') },
      message: [context.factory.literal('Language does not match any of {$languageIn}')],
      value: context.valueOrNode
    })
  }
}

function compileMaxLength (shape) {
  const maxLength = parseInt(shape.ptr.out([ns.sh.maxLength]).value)

  return {
    generic: validateMaxLength(maxLength)
  }
}

function validateMaxLength (maxLength) {
  return context => {
    const result = context.valueOrNode.term.termType !== 'BlankNode' && context.valueOrNode.value.length <= maxLength

    context.test(result, ns.sh.MaxLengthConstraintComponent, {
      args: { maxLength },
      message: [context.factory.literal('Value has more than {$maxLength} characters')],
      value: context.valueOrNode
    })
  }
}

function compileMinLength (shape) {
  const minLength = parseInt(shape.ptr.out([ns.sh.minLength]).value)

  return {
    generic: validateMinLength(minLength)
  }
}

function validateMinLength (minLength) {
  return context => {
    const result = context.valueOrNode.term.termType !== 'BlankNode' && context.valueOrNode.value.length >= minLength

    context.test(result, ns.sh.MinLengthConstraintComponent, {
      args: { minLength },
      message: [context.factory.literal('Value has less than {$minLength} characters')],
      value: context.valueOrNode
    })
  }
}

function compilePattern (shape) {
  const pattern = shape.ptr.out([ns.sh.pattern]).value
  const flags = shape.ptr.out([ns.sh.flags]).value
  const regex = new RegExp(pattern, flags)

  return {
    generic: validatePattern(pattern, flags, regex)
  }
}

function validatePattern (pattern, flags, regex) {
  return context => {
    context.test(regex.test(context.valueOrNode.term.value), ns.sh.PatternConstraintComponent, {
      args: { flags, pattern },
      message: [context.factory.literal('Value does not match pattern "{$pattern}"')],
      value: context.valueOrNode
    })
  }
}

function compileUniqueLang (shape) {
  const term = shape.ptr.out([ns.sh.uniqueLang]).term
  const uniqueLang = term.value === 'true' && ns.xsd.boolean.equals(term.datatype)

  if (!uniqueLang) {
    return null
  }

  return {
    property: validateUniqueLangProperty()
  }
}

function validateUniqueLangProperty () {
  return context => {
    const result = Object.entries(context.values.terms.reduce((result, term) => {
      if (term.language) {
        result[term.language] = (result[term.language] || 0) + 1
      }

      return result
    }, {}))

    const invalid = result.filter(([, count]) => count > 1)

    for (const [lang] of invalid) {
      context.violation(ns.sh.UniqueLangConstraintComponent, {
        args: { lang },
        message: [context.factory.literal('Language "{?lang}" used more than once')]
      })
    }

    if (invalid.length === 0) {
      context.debug(ns.sh.UniqueLangConstraintComponent)
    }
  }
}

export {
  compileLanguageIn,
  compileMaxLength,
  compileMinLength,
  compilePattern,
  compileUniqueLang
}
