import { testFixture } from '../Fixture.js'

describe('Error tests', () => {
  describe('should err with bad Symbols', () => {
    testFixture({
      input: 'Symbol(abc',
      errors: {
        jsdoc: 'Symbol does not end after value',
        closure: 'Symbol does not end after value',
        typescript: 'The parsing ended early'
      }
    })

    testFixture({
      input: '123(abc',
      errors: {
        closure: "Symbol expects a name on the left side. (Reacting on '(')",
        jsdoc: "Symbol expects a name on the left side. (Reacting on '(')",
        typescript: 'The parsing ended early'
      }
    })
  })

  describe('should err with bad Parameter lists', () => {
    testFixture({
      input: '...b, ...c',
      error: 'Only the last parameter may be a rest parameter'
    })

    testFixture({
      input: '...b, ...\\',
      error: 'Unexpected Token \\'
    })
  })

  describe('should err with bad imports', () => {
    testFixture({
      input: 'import',
      errors: {
        jsdoc: "No parslet found for token: 'import' with value 'import'",
        closure: "No parslet found for token: 'import' with value 'import'",
        typescript: 'Missing parenthesis after import keyword'
      }
    })

    testFixture({
      input: 'import(123)',
      errors: {
        jsdoc: "No parslet found for token: 'import' with value 'import'",
        closure: "No parslet found for token: 'import' with value 'import'",
        typescript: 'Only string values are allowed as paths for imports'
      }
    })

    testFixture({
      input: 'import("abc"',
      errors: {
        jsdoc: "No parslet found for token: 'import' with value 'import'",
        closure: "No parslet found for token: 'import' with value 'import'",
        typescript: 'Missing closing parenthesis after import keyword'
      }
    })
  })

  describe('should err with bad predicates', () => {
    testFixture({
      input: '123 is',
      errors: {
        jsdoc: "The parsing ended early. The next token was: 'is' with value 'is'",
        closure: "The parsing ended early. The next token was: 'is' with value 'is'",
        typescript: 'A typescript predicate always has to have a name on the left side.'
      }
    })
  })

  describe('should err with bad variadics', () => {
    testFixture({
      input: '...[abc',
      errors: {
        jsdoc: 'Unterminated variadic type. Missing \']\'',
        closure: "The parsing ended early. The next token was: '[' with value '['",
        typescript: 'Unterminated \'[\''
      }
    })

    testFixture({
      input: '...[]',
      errors: {
        jsdoc: 'Empty square brackets for variadic are not allowed.',
        closure: "The parsing ended early. The next token was: '[' with value '['"
      },
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeTuple',
          elements: []
        },
        meta: {
          position: 'prefix',
          squareBrackets: false
        }
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('should err with bad ObjectParslets', () => {
    testFixture({
      input: '{Array<string> string}',
      errors: {
        jsdoc: "Unexpected type: 'JsdocTypeGeneric'.",
        closure: "Unterminated record type. Missing '}'",
        typescript: "function property is missing parameter list"
      }
    })
  })

  describe('should err with bad FunctionParslets', () => {
    testFixture({
      input: 'function(a: string, b: number)',
      errors: {
        jsdoc: 'only allowed named parameters are this, new but got JsdocTypeKeyValue',
        closure: 'only allowed named parameters are this, new but got JsdocTypeKeyValue',
        typescript: 'only allowed named parameters are this, new, args but got JsdocTypeKeyValue'
      }
    })
  })

  describe('should err with bad NamePathParslets', () => {
    testFixture({
      input: 'abc[def',
      error: "Unterminated square brackets. Next token is 'EOF' with text ''"
    })
  })

  describe('should err with unterminated brackets', () => {
    testFixture({
      input: '{[a: string}',
      errors: {
        typescript: 'Unterminated square brackets'
      }
    })
  })

  describe('errs with unterminated square brackets', () => {
    testFixture({
      input: '{[someType}',
      errors: {
        typescript: 'Unterminated square brackets'
      }
    })
  })

  describe('should err with unterminated brackets', () => {
    testFixture({
      input: '{[key in string}',
      errors: {
        typescript: 'Unterminated square brackets'
      }
    })
  })

  describe('should err with incomplete index signature', () => {
    testFixture({
      input: '{[a: string]}',
      errors: {
        typescript: 'Incomplete index signature'
      }
    })
  })

  describe('should err with incomplete mapped type clause', () => {
    testFixture({
      input: '{[key in string]}',
      errors: {
        typescript: 'Incomplete mapped type clause: missing colon'
      }
    })
  })

  describe('should err inside square bracketed property', () => {
    testFixture({
      input: '{[a: string: string}',
      errors: {
        typescript: 'Error parsing value inside square bracketed property'
      }
    })
  })

  describe('should err with bad asserts', () => {
    testFixture({
      input: 'asserts 5',
      errors: {
        typescript: 'A typescript asserts always has to have a name.'
      }
    })
  })

  describe('should err with bad ', () => {
    testFixture({
      input: '<abc<def>>',
      errors: {
        jsdoc: 'No parslet found for token: \'<\' with value \'<\'',
        closure: 'No parslet found for token: \'<\' with value \'<\'',
        typescript: 'Unexpected type: \'JsdocTypeGeneric\'.'
      }
    })
  })
})
