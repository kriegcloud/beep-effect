import { expect } from 'chai'

import type { RootResult } from '../src/result/RootResult.js'
import type { NonRootResult } from '../src/result/NonRootResult.js'
import { jtpTransform } from '../src/index.js'
import type { JtpResult } from '../src/transforms/jtpTransform.js'

describe('transform', () => {
  it('Gets transform for `JsdocTypeNamePath` with `property-brackets`', () => {
    const expected: JtpResult = {
      hasEventPrefix: false,
      name: 'text',
      owner: {
        name: 'foo',
        type: 'NAME'
      },
      quoteStyle: 'double',
      type: 'MEMBER'
    }
    const parseResult: RootResult = {
      type: 'JsdocTypeNamePath',
      left: {
        type: 'JsdocTypeName',
        value: 'foo'
      },
      right: {
        type: 'JsdocTypeProperty',
        value: 'text',
        meta: {
          quote: 'double'
        }
      },
      pathType: 'property-brackets'
    }
    const xform = jtpTransform(parseResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeNamePath` with `property-brackets`', () => {
    const expected: JtpResult = {
      hasEventPrefix: true,
      name: 'def',
      owner: {
        name: 'abc',
        type: 'NAME'
      },
      quoteStyle: 'none',
      type: 'INSTANCE_MEMBER'
    }
    const parseResult: RootResult = {
      type: 'JsdocTypeNamePath',
      left: {
        type: 'JsdocTypeName',
        value: 'abc'
      },
      right: {
        type: 'JsdocTypeSpecialNamePath',
        value: 'def',
        specialType: 'event',
        meta: {
          quote: undefined
        }
      },
      pathType: 'instance'
    }
    const xform = jtpTransform(parseResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeOptional` with prefix', () => {
    const expected: JtpResult = {
      meta: {
        syntax: 'PREFIX_EQUAL_SIGN'
      },
      type: 'OPTIONAL',
      value: {
        name: 'abc',
        type: 'NAME'
      }
    }
    const parseResult: RootResult = {
      type: 'JsdocTypeOptional',
      element: {
        type: 'JsdocTypeName',
        value: 'abc'
      },
      meta: {
        position: 'prefix'
      }
    }
    const xform = jtpTransform(parseResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for empty `JsdocTypeVariadic`', () => {
    const expected: JtpResult = {
      meta: {
        syntax: 'ONLY_DOTS'
      },
      type: 'VARIADIC'
    }
    const parseResult: RootResult = {
      type: 'JsdocTypeVariadic',
      meta: {
        position: undefined,
        squareBrackets: false
      }
    }
    const xform = jtpTransform(parseResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for suffix `JsdocTypeVariadic`', () => {
    const expected: JtpResult = {
      meta: {
        syntax: 'SUFFIX_DOTS'
      },
      type: 'VARIADIC',
      value: {
        name: 'abc',
        type: 'NAME'
      }
    }
    const parseResult: RootResult = {
      type: 'JsdocTypeVariadic',
      element: {
        type: 'JsdocTypeName',
        value: 'abc'
      },
      meta: {
        position: 'suffix',
        squareBrackets: false
      }
    }
    const xform = jtpTransform(parseResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeKeyValue`', () => {
    const expected: JtpResult = {
      key: 'a',
      quoteStyle: 'none',
      readonly: false,
      type: 'RECORD_ENTRY',
      value: {
        name: 'number',
        type: 'NAME'
      }
    }
    const parseResult: NonRootResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: {
        type: 'JsdocTypeName',
        value: 'number'
      },
      optional: false,
      variadic: false
    }
    const xform = jtpTransform(parseResult as unknown as RootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeKeyValue` missing `right`', () => {
    const expected: JtpResult = {
      key: 'a',
      quoteStyle: 'none',
      readonly: false,
      type: 'RECORD_ENTRY',
      value: null
    }
    const parseResult: NonRootResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: undefined,
      optional: false,
      variadic: false
    }
    const xform = jtpTransform(parseResult as unknown as RootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for optional `JsdocTypeKeyValue`', () => {
    const expected: JtpResult = {
      key: 'a',
      quoteStyle: 'none',
      readonly: false,
      type: 'RECORD_ENTRY',
      value: {
        type: 'OPTIONAL',
        value: {
          name: 'number',
          type: 'NAME'
        },
        meta: {
          syntax: 'SUFFIX_KEY_QUESTION_MARK'
        }
      }
    }
    const parseResult: NonRootResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: {
        type: 'JsdocTypeName',
        value: 'number'
      },
      optional: true,
      variadic: false
    }
    const xform = jtpTransform(parseResult as unknown as RootResult)
    expect(xform).to.deep.equal(expected)
  })

  // Note: This does not seem possible through the normal generation of
  //   `JsdocTypeObject`
  it('Skips non-`JsdocTypeKeyValue` value', () => {
    const expected: JtpResult = {
      entries: [],
      type: 'RECORD'
    }

    const parseResult: RootResult = {
      type: 'JsdocTypeObject',
      elements: [
        {
          // @ts-expect-error In JTP this is a valid configuration
          type: 'JsdocTypeNumber',
          // @ts-expect-error In JTP this is a valid configuration
          value: 100
        }
      ],
      meta: {
        separator: undefined
      }
    }
    const xform = jtpTransform(parseResult)
    expect(xform).to.deep.equal(expected)
  })

  // Note: This does not seem possible through the normal generation of
  //   `JsdocTypeFunction`
  it('Gets transform for `JsdocTypeGeneric`', () => {
    const expected: JtpResult = {
      type: 'GENERIC',
      subject: {
        name: 'Array',
        type: 'NAME'
      },
      objects: [
        {
          type: 'NAME',
          name: 'function'
        }
      ],
      meta: {
        syntax: 'SQUARE_BRACKET'
      }
    }
    const parseResult: RootResult = {
      type: 'JsdocTypeGeneric',
      left: {
        type: 'JsdocTypeName',
        value: 'Array'
      },
      elements: [
        {
          type: 'JsdocTypeFunction',
          parameters: [],
          arrow: false,
          parenthesis: false,
          constructor: false
        }
      ],
      meta: {
        brackets: 'square',
        dot: false
      }
    }
    const xform = jtpTransform(parseResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Throws with `JsdocTypeKeyValue` and non-plain key', () => {
    const parseResult: RootResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma'
      },
      elements: [
        {
          type: 'JsdocTypeJsdocObjectField',
          left: {
            type: 'JsdocTypeGeneric',
            left: {
              type: 'JsdocTypeName',
              value: 'Array'
            },
            elements: [
              {
                type: 'JsdocTypeName',
                value: 'string'
              }
            ],
            meta: {
              brackets: 'angle',
              dot: true
            }
          },
          right: {
            type: 'JsdocTypeName',
            value: 'number'
          }
        }
      ]
    }

    expect(() => {
      jtpTransform(parseResult)
    }).to.throw('Keys may not be typed in jsdoctypeparser.')
  })

  it('Throws with `JsdocTypeSpecialNamePath` and external `specialType`', () => {
    const parseResult: RootResult = {
      type: 'JsdocTypeSpecialNamePath',
      value: 'abc',
      specialType: 'external',
      meta: {
        quote: undefined
      }
    }

    expect(() => {
      jtpTransform(parseResult)
    }).to.throw('jsdoctypeparser does not support type external at this point.')
  })

  it('Throws with `JsdocTypeIndexedAccessIndex`', () => {
    const parseResult: RootResult = {
      type: 'JsdocTypeNamePath',
      left: {
        type: 'JsdocTypeName',
        value: 'obj'
      },
      right: {
        right: {
          element: {
            type: 'JsdocTypeName',
            value: 'a'
          },
          type: 'JsdocTypeKeyof'
        },
        type: 'JsdocTypeIndexedAccessIndex',
      },
      pathType: 'property-brackets'
    }

    expect(() => {
      jtpTransform(parseResult)
    }).to.throw('JsdocTypeIndexedAccessIndex not allowed in jtp')
  })

  it('Throws with `JsdocTypeFunction` and `JsdocTypeKeyValue` with undefined `right`', () => {
    const parseResult: RootResult = {
      type: 'JsdocTypeFunction',
      arrow: false,
      parenthesis: true,
      constructor: false,
      parameters: [
        {
          type: 'JsdocTypeKeyValue',
          key: 'abc',
          right: undefined,
          optional: false,
          variadic: false
        }
      ]
    }

    expect(() => {
      jtpTransform(parseResult)
    }).to.throw("Function parameter without ':' is not expected to be 'KEY_VALUE'")
  })

  it('Does not accept IndexSignatures', () => {
    const parseResult: RootResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma'
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          meta: {
            quote: undefined
          },
          key: {
            type: 'JsdocTypeIndexSignature',
            key: 'some',
            right: {
              type: 'JsdocTypeName',
              value: 'value'
            }
          },
          right: {
            type: 'JsdocTypeName',
            value: 'more'
          },
          optional: false,
          readonly: false
        }
      ]
    }

    expect(() => {
      jtpTransform(parseResult)
    }).to.throw('Index signatures and mapped types are not supported')
  })
})
