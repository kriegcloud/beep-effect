import { testFixture } from '../Fixture.js'

describe('typescript template literals', () => {
  describe('should parse a template literal', () => {
    testFixture({
      // eslint-disable-next-line no-template-curly-in-string -- Template literal
      input: '`${begin}a${bb}cd\\`e${fg}hij${klm | end}`',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeTemplateLiteral',
        literals: ['', 'a', 'cd`e', 'hij', ''],
        interpolations: [
          {
            type: 'JsdocTypeName',
            value: 'begin'
          },
          {
            type: 'JsdocTypeName',
            value: 'bb'
          },
          {
            type: 'JsdocTypeName',
            value: 'fg'
          },
          {
            type: 'JsdocTypeUnion',
            elements: [
              {
                type: 'JsdocTypeName',
                value: 'klm'
              },
              {
                type: 'JsdocTypeName',
                value: 'end'
              }
            ]
          }
        ]
      }
    })
  })

  describe('should parse a template literal (with hyphens)', () => {
    testFixture({
      // eslint-disable-next-line no-template-curly-in-string -- Template literal
      input: '`${MyOwnType}-${string}`',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeTemplateLiteral',
        literals: ['', '-', ''],
        interpolations: [
          {
            type: 'JsdocTypeName',
            value: 'MyOwnType'
          },
          {
            type: 'JsdocTypeName',
            value: 'string'
          }
        ]
      }
    })
  })

  describe('should parse a template literal (no beginning or end interpolations)', () => {
    testFixture({
      // eslint-disable-next-line no-template-curly-in-string -- Template literal
      input: '`a${bb}cd\\`e${fg}hij`',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeTemplateLiteral',
        literals: ['a', 'cd`e', 'hij'],
        interpolations: [
          {
            type: 'JsdocTypeName',
            value: 'bb'
          },
          {
            type: 'JsdocTypeName',
            value: 'fg'
          }
        ]
      }
    })
  })

  describe('should parse a template literal (no interpolations)', () => {
    testFixture({
      input: '`acd\\`ehij`',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeTemplateLiteral',
        literals: ['acd`ehij'],
        interpolations: [
        ]
      }
    })
  })

  describe('should parse an empty template literal', () => {
    testFixture({
      input: '``',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeTemplateLiteral',
        literals: [''],
        interpolations: [
        ]
      }
    })
  })

  describe('should fail with unterminated template literal', () => {
    testFixture({
      input: '`abc',
      modes: [],
    })
  })

  describe('should fail with unterminated template literal interpolation', () => {
    testFixture({
      input: '`ab${unterminated`',
      modes: [],
    })
  })
})
