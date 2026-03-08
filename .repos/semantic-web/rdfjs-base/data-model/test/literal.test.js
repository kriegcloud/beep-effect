import { strictEqual } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.literal', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.literal, 'function')
    })

    it('should create an object with a termType property that contains the value "Literal"', () => {
      const term = factory.literal()

      strictEqual(term.termType, 'Literal')
    })

    it('should create an object with a value property that contains the given string', () => {
      const string = 'example'
      const term = factory.literal(string)

      strictEqual(term.value, string)
    })

    it('should create an object with a language property that contains an empty string', () => {
      const string = 'example'
      const term = factory.literal(string)

      strictEqual(term.language, '')
    })

    it('should create an object with a language property that contains the given language string', () => {
      const string = 'example'
      const language = 'en'
      const term = factory.literal(string, language)

      strictEqual(term.language, language)
    })

    it('should create an object with a datatype property that contains a NamedNode with the value "http://www.w3.org/2001/XMLSchema#string"', () => {
      const string = 'example'
      const term = factory.literal(string)

      strictEqual(term.datatype.termType, 'NamedNode')
      strictEqual(term.datatype.value, 'http://www.w3.org/2001/XMLSchema#string')
    })

    it('should create an object with a datatype property that contains a NamedNode with the value "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"', () => {
      const string = 'example'
      const language = 'en'
      const term = factory.literal(string, language)

      strictEqual(term.datatype.termType, 'NamedNode')
      strictEqual(term.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
    })

    it('should create an object with a datatype property that contains a NamedNode with the given IRI', () => {
      const string = 'example'
      const datatype = factory.namedNode('http://example.org')
      const term = factory.literal(string, datatype)

      strictEqual(term.datatype.termType, 'NamedNode')
      strictEqual(term.datatype.value, datatype.value)
    })

    it('should create an object with a direction property that contains an empty string', () => {
      const string = 'example'
      const term = factory.literal(string)

      strictEqual(term.direction, '')
    })

    it('should create an object with a direction and language property that contains the given strings', () => {
      const string = 'example'
      const language = 'en'
      const direction = 'rtl'
      const term = factory.literal(string, { direction, language })

      strictEqual(term.direction, direction)
      strictEqual(term.language, language)
    })

    it('should create an object with a direction and language property if only the language is given', () => {
      const string = 'example'
      const language = 'en'
      const term = factory.literal(string, { language })

      strictEqual(term.direction, '')
      strictEqual(term.language, language)
    })

    it('should create an lang string object if only the language is given', () => {
      const string = 'example'
      const language = 'en'
      const term = factory.literal(string, { language })

      strictEqual(term.datatype.termType, 'NamedNode')
      strictEqual(term.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
    })

    describe('.equals', () => {
      it('should be a method', () => {
        const term = factory.literal('')

        strictEqual(typeof term.equals, 'function')
      })

      it('should return true if termType, value, language, datatype, and direction are equal', () => {
        const string = 'example'
        const language = 'en'
        const direction = 'rtl'
        const term = factory.literal(string, { direction, language })
        const mock = {
          termType: 'Literal',
          value: string,
          language,
          datatype: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString'),
          direction
        }

        strictEqual(term.equals(mock), true)
      })

      it('should return false if termType is not equal', () => {
        const string = 'example'
        const language = 'en'
        const term = factory.literal(string, language)
        const mock = {
          termType: 'NamedNode',
          value: string,
          language,
          datatype: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is not equal', () => {
        const string = 'example'
        const language = 'en'
        const term = factory.literal(string, language)
        const mock = {
          termType: 'Literal',
          value: string + '1',
          language,
          datatype: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if language is not equal', () => {
        const string = 'example'
        const language = 'en'
        const term = factory.literal(string, language)
        const mock = {
          termType: 'Literal',
          value: string,
          language: 'de',
          datatype: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if datatype is not equal', () => {
        const string = 'example'
        const language = 'en'
        const term = factory.literal(string, language)
        const mock = {
          termType: 'Literal',
          value: string,
          language,
          datatype: factory.namedNode('http://example.org')
        }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if direction is not equal', () => {
        const string = 'example'
        const language = 'en'
        const direction = 'rtl'
        const term = factory.literal(string, { direction, language })
        const mock = {
          termType: 'Literal',
          value: string,
          language,
          datatype: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString'),
          direction: 'ltr'
        }

        strictEqual(term.equals(mock), false)
      })

      it('should return true if direction of the other term is falsy and the local one is empty', () => {
        const string = 'example'
        const language = 'en'
        const term = factory.literal(string, language)
        const mock = {
          termType: 'Literal',
          value: string,
          language,
          datatype: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        strictEqual(term.equals(mock), true)
      })

      it('should return false if direction of the other term is falsy and the local one is a non-empty string', () => {
        const string = 'example'
        const language = 'en'
        const direction = 'rtl'
        const term = factory.literal(string, { direction, language })
        const mock = {
          termType: 'Literal',
          value: string,
          language,
          datatype: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString')
        }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is falsy', () => {
        const string = 'example'
        const language = 'en'
        const term = factory.literal(string, language)

        strictEqual(term.equals(null), false)
      })
    })
  })
}

export default runTests
