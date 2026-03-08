import { testFixture } from '../Fixture.js'

describe('property named test', () => {
  testFixture({
    input: 'foo.test',
    modes: ['jsdoc', 'closure', 'typescript'],
    parseNamePath: true,
    expected: {
      type: 'JsdocTypeNamePath',
      left: {
        type: 'JsdocTypeName',
        value: 'foo'
      },
      right: {
        type: 'JsdocTypeProperty',
        value: 'test',
        meta: {
          quote: undefined
        }
      },
      pathType: 'property'
    }
  })
})

describe('property with reserved word', () => {
  testFixture({
    input: 'foo.continue',
    modes: ['jsdoc', 'closure', 'typescript'],
    parseNamePath: true,
    expected: {
      type: 'JsdocTypeNamePath',
      left: {
        type: 'JsdocTypeName',
        value: 'foo'
      },
      right: {
        type: 'JsdocTypeProperty',
        value: 'continue',
        meta: {
          quote: undefined
        }
      },
      pathType: 'property'
    }
  })
})

describe('properties with special characters', () => {
  testFixture({
    input: 'foo#test~another',
    modes: ['jsdoc', 'closure', 'typescript'],
    parseNamePath: true,
    expected: {
      type: 'JsdocTypeNamePath',
      left: {
        left: {
          type: 'JsdocTypeName',
          value: 'foo'
        },
        pathType: 'instance',
        right: {
          meta: {
            quote: undefined
          },
          type: 'JsdocTypeProperty',
          value: 'test'
        },
        type: 'JsdocTypeNamePath'
      },
      right: {
        type: 'JsdocTypeProperty',
        value: 'another',
        meta: {
          quote: undefined
        }
      },
      pathType: 'inner'
    }
  })
})

describe('parses namepath with array generic', () => {
  testFixture({
    input: 'employees[].name',
    modes: ['jsdoc', 'closure', 'typescript'],
    parseNamePath: true,
    expected: {
      left: {
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'employees'
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          brackets: 'square',
          dot: false
        },
        type: 'JsdocTypeGeneric'
      },
      pathType: 'property',
      right: {
        meta: {
          quote: undefined
        },
        type: 'JsdocTypeProperty',
        value: 'name'
      },
      type: 'JsdocTypeNamePath'
    }
  })
})

describe('parses special namepath', () => {
  testFixture({
    input: 'module:abc/def~ghi#jkl',
    modes: ['jsdoc', 'closure', 'typescript'],
    parseNamePath: true,
    extraParseArgs: {
      includeSpecial: true
    },
    expected: {
      type: 'JsdocTypeNamePath',
      left: {
        type: 'JsdocTypeNamePath',
        left: {
          type: 'JsdocTypeSpecialNamePath',
          value: 'abc/def',
          specialType: 'module',
          meta: {
            quote: undefined
          }
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'ghi',
          meta: {
            quote: undefined
          }
        },
        pathType: 'inner'
      },
      right: {
        type: 'JsdocTypeProperty',
        value: 'jkl',
        meta: {
          quote: undefined
        }
      },
      pathType: 'instance'
    }
  })
})

describe('parses simple name as namepath', () => {
  testFixture({
    input: 'foo',
    modes: ['jsdoc', 'closure', 'typescript'],
    parseNamePath: true,
    expected: {
      type: 'JsdocTypeName',
      value: 'foo'
    }
  })
});

describe('parses reserved word name as namepath', () => {
  [
    // JS Keyword
    'continue',

    // Special namepath-handled TS keywords
    'null',
    'undefined',

    // Other TS keywords
    'function',
    'this',
    'new',
    'module',
    'event',
    'extends',
    'external',
    'typeof',
    'keyof',
    'readonly',
    'import',
    'infer',
    'is',
    'in',
    'asserts'
  ].forEach((keyword) => {
    testFixture({
      input: keyword,
      modes: ['jsdoc', 'closure', 'typescript'],
      parseNamePath: true,
      extraParseArgs: {
        includeSpecial: true
      },
      expected: {
        type: 'JsdocTypeName',
        value: keyword
      }
    })
  })
})

describe('parses reserve word name in namepath as namepath', () => {
  [
    // JS Keyword
    'continue',

    // Special namepath-handled TS keywords
    'null',
    'undefined',

    // Other TS keywords
    'function',
    'this',
    'new',
    'module',
    'event',
    'extends',
    'external',
    'typeof',
    'keyof',
    'readonly',
    'import',
    'infer',
    'is',
    'in',
    'asserts'
  ].forEach((keyword) => {
    testFixture({
      input: `props.${keyword}`,
      modes: ['jsdoc', 'closure', 'typescript'],
      parseNamePath: true,
      extraParseArgs: {
        includeSpecial: true
      },
      expected: {
        left: {
          type: 'JsdocTypeName',
          value: 'props'
        },
        pathType: 'property',
        right: {
          meta: {
            quote: undefined
          },
          type: 'JsdocTypeProperty',
          value: keyword
        },
        type: 'JsdocTypeNamePath'
      }
    })
  })
})

describe('other valid types like number do not pass in namePath parser', () => {
  testFixture({
    input: '12345',
    parseNamePath: true,
    error: "No parslet found for token: 'Number' with value '12345'"
  })
})
