import { expect } from 'chai'

import type { RootResult } from '../src/result/RootResult.js'
import { catharsisTransform } from '../src/transforms/catharsisTransform.js'

describe('transform', () => {
  it('Gets transform for suffixed `JsdocTypeVariadic`', () => {
    const expected = {
      name: 'B(c...)',
      type: 'NameExpression'
    }
    const parseResult = {
      type: 'JsdocTypeSymbol',
      value: 'B',
      element: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeName',
          value: 'c'
        },
        meta: {
          position: 'suffix',
          squareBrackets: false
        }
      }
    }
    const xform = catharsisTransform(parseResult as RootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('should reshape non-keyvalue to FieldType container', () => {
    // The object parslet should reshape this into a JsdocTypeKeyValue container,
    //   should shouldn't be feasible (nor apparently needed on the
    //   `KeyValueResult` or `JsdocObjectKeyValueResult` TS types)
    const expected = {
      type: 'RecordType',
      fields: [
        {
          type: 'FieldType',
          key: {
            name: '100',
            type: 'NameExpression'
          },
          value: undefined
        }
      ]
    }
    const parseResult = {
      type: 'JsdocTypeObject',
      elements: [
        {
          type: 'JsdocTypeNumber',
          value: 100
        }
      ],
      meta: {
        separator: undefined
      }
    }
    const xform = catharsisTransform(parseResult as RootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeKeyValue`', () => {
    const expected = {
      key: {
        name: 'a',
        type: 'NameExpression'
      },
      type: 'FieldType',
      value: {
        name: 'number',
        type: 'NameExpression'
      }
    }

    const parseResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: {
        type: 'JsdocTypeName',
        value: 'number'
      },
      optional: false,
      variadic: false
    }
    const xform = catharsisTransform(parseResult as RootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeKeyValue` (undefined `right`)', () => {
    const expected = {
      key: {
        name: 'a',
        type: 'NameExpression'
      },
      type: 'FieldType',
      value: undefined
    }

    const parseResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: undefined,
      optional: false,
      variadic: false
    }
    const xform = catharsisTransform(parseResult as RootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Throws with dots without value for `JsdocTypeVariadic`', () => {
    const parseResult = {
      type: 'JsdocTypeVariadic',
      meta: {
        squareBrackets: false
      }
    }
    expect(() => {
      catharsisTransform(parseResult as RootResult)
    }).to.throw('dots without value are not allowed in catharsis mode')
  })

  it('Throws with non-string key for `JsdocTypeObjectField`', () => {
    const parseResult = {
      key: {
        type: 'JsdocTypeIndexSignature',
        key: 'string',
        right: {
          type: 'JsdocTypeStringValue',
          value: 'string',
          meta: {
            quote: 'single'
          }
        }
      },
      meta: {
        quote: undefined
      },
      optional: false,
      readonly: false,
      right: undefined,
      type: 'JsdocTypeObjectField'
    }
    expect(() => {
      catharsisTransform(parseResult as RootResult)
    }).to.throw('Index signatures and mapped types are not supported')
  })

  it('Throws with JsdocTypeIndexedAccessIndex`', () => {
    const parseResult = {
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
      catharsisTransform(parseResult as RootResult)
    }).to.throw('JsdocTypeIndexedAccessIndex is not supported in catharsis')
  })
})
