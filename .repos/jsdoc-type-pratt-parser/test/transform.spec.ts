import { expect } from 'chai'

import type { NonRootResult } from '../src/result/NonRootResult.js'
import { transform, identityTransformRules } from '../src/index.js'
import { notAvailableTransform } from '../src/transforms/transform.js'

describe('transform', () => {
  it('Errs with missing rule for type', () => {
    expect(() => {
      const result = {
        type: 'BadType',
        value: 'test',
        meta: {
          quote: undefined
        }
      }
      transform<NonRootResult>(identityTransformRules(), result as NonRootResult)
    }).to.throw('In this set of transform rules exists no rule for type BadType')
  })

  it('Throws if attempting to execute `notAvailableTransform`', () => {
    expect(() => {
      const result = {
        type: 'JsdocTypeProperty',
        value: 'prop',
        meta: {
          quote: undefined
        }
      }
      notAvailableTransform(result as NonRootResult)
    }).to.throw('This transform is not available. Are you trying the correct parsing mode?')
  })

  it('Gets transform for `JsdocTypeParenthesis`', () => {
    const expected = {
      type: 'JsdocTypeParenthesis',
      element: {
        type: 'JsdocTypeName',
        value: 'a'
      }
    }
    const parseResult = {
      type: 'JsdocTypeParenthesis',
      element: {
        type: 'JsdocTypeName',
        value: 'a'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeIndexedAccessIndex`', () => {
    const expected = {
      right: {
        element: {
          type: 'JsdocTypeName',
          value: 'a'
        },
        type: 'JsdocTypeKeyof'
      },
      type: 'JsdocTypeIndexedAccessIndex',
    }
    const parseResult = {
      right: {
        element: {
          type: 'JsdocTypeName',
          value: 'a'
        },
        type: 'JsdocTypeKeyof'
      },
      type: 'JsdocTypeIndexedAccessIndex',
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeProperty`', () => {
    const expected = {
      type: 'JsdocTypeProperty',
      value: 'abc',
      meta: {
        quote: 'double'
      }
    }
    const parseResult = {
      type: 'JsdocTypeProperty',
      value: 'abc',
      meta: {
        quote: 'double'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for empty `JsdocTypeVariadic`', () => {
    const expected = {
      type: 'JsdocTypeVariadic',
      meta: {
        position: undefined,
        squareBrackets: false
      }
    }
    const parseResult = {
      type: 'JsdocTypeVariadic',
      meta: {
        squareBrackets: false
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeIndexSignature`', () => {
    const expected = {
      type: 'JsdocTypeIndexSignature',
      key: 'key',
      right: {
        type: 'JsdocTypeName',
        value: 'string'
      }
    }
    const parseResult = {
      type: 'JsdocTypeIndexSignature',
      key: 'key',
      right: {
        type: 'JsdocTypeName',
        value: 'string'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeComputedProperty`', () => {
    const expected = {
      type: 'JsdocTypeComputedProperty',
      value: {
        type: 'JsdocTypeName',
        value: 'string'
      }
    }
    const parseResult = {
      type: 'JsdocTypeComputedProperty',
      value: {
        type: 'JsdocTypeName',
        value: 'string'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeComputedProperty` with custom parser', () => {
    const expected = {
      type: 'JsdocTypeComputedProperty',
      value: {
        type: 'JsdocTypeComputedProperty',
        value: {
          body: [
            {
              end: 21,
              expression: {
                arguments: [],
                callee: {
                  computed: false,
                  end: 19,
                  object: {
                    end: 10,
                    name: 'SomeObject',
                    start: 0,
                    type: 'Identifier'
                  },
                  property: {
                    end: 19,
                    name: 'someType',
                    start: 11,
                    type: 'Identifier'
                  },
                  start: 0,
                  type: 'MemberExpression'
                },
                end: 21,
                start: 0,
                type: 'CallExpression'
              },
              start: 0,
              type: 'ExpressionStatement'
            }
          ],
          end: 21,
          sourceType: 'script',
          start: 0,
          type: 'Program'
        },
      }
    }
    const parseResult = {
      type: 'JsdocTypeComputedProperty',
      value: {
        type: 'JsdocTypeComputedProperty',
        value: {
          body: [
            {
              end: 21,
              expression: {
                arguments: [],
                callee: {
                  computed: false,
                  end: 19,
                  object: {
                    end: 10,
                    name: 'SomeObject',
                    start: 0,
                    type: 'Identifier'
                  },
                  property: {
                    end: 19,
                    name: 'someType',
                    start: 11,
                    type: 'Identifier'
                  },
                  start: 0,
                  type: 'MemberExpression'
                },
                end: 21,
                start: 0,
                type: 'CallExpression'
              },
              start: 0,
              type: 'ExpressionStatement'
            }
          ],
          end: 21,
          sourceType: 'script',
          start: 0,
          type: 'Program'
        },
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeComputedMethod`', () => {
    const expected = {
      type: 'JsdocTypeComputedMethod',
      parameters: [],
      optional: true,
      value: {
        type: 'JsdocTypeName',
        value: 'string'
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'SomeType'
      }
    }
    const parseResult = {
      type: 'JsdocTypeComputedMethod',
      parameters: [],
      optional: true,
      value: {
        type: 'JsdocTypeName',
        value: 'string'
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'SomeType'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeComputedMethod` with custom parser', () => {
    const expected = {
      type: 'JsdocTypeComputedMethod',
      parameters: [],
      optional: true,
      value: {
        body: [
          {
            end: 21,
            expression: {
              arguments: [],
              callee: {
                computed: false,
                end: 19,
                object: {
                  end: 10,
                  name: 'SomeObject',
                  start: 0,
                  type: 'Identifier'
                },
                property: {
                  end: 19,
                  name: 'someType',
                  start: 11,
                  type: 'Identifier'
                },
                start: 0,
                type: 'MemberExpression'
              },
              end: 21,
              start: 0,
              type: 'CallExpression'
            },
            start: 0,
            type: 'ExpressionStatement'
          }
        ],
        end: 21,
        sourceType: 'script',
        start: 0,
        type: 'Program'
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'SomeType'
      }
    }
    const parseResult = {
      type: 'JsdocTypeComputedMethod',
      parameters: [],
      optional: true,
      value: {
        body: [
          {
            end: 21,
            expression: {
              arguments: [],
              callee: {
                computed: false,
                end: 19,
                object: {
                  end: 10,
                  name: 'SomeObject',
                  start: 0,
                  type: 'Identifier'
                },
                property: {
                  end: 19,
                  name: 'someType',
                  start: 11,
                  type: 'Identifier'
                },
                start: 0,
                type: 'MemberExpression'
              },
              end: 21,
              start: 0,
              type: 'CallExpression'
            },
            start: 0,
            type: 'ExpressionStatement'
          }
        ],
        end: 21,
        sourceType: 'script',
        start: 0,
        type: 'Program'
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'SomeType'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  });

  it('Gets transform for `JsdocTypeMappedType`', () => {
    const expected = {
      type: 'JsdocTypeMappedType',
      key: 'key',
      right: {
        type: 'JsdocTypeName',
        value: 'Type'
      }
    }
    const parseResult = {
      type: 'JsdocTypeMappedType',
      key: 'key',
      right: {
        type: 'JsdocTypeName',
        value: 'Type'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeKeyValue`', () => {
    const expected = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: undefined,
      optional: false,
      variadic: false
    }
    const parseResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: undefined,
      optional: false,
      variadic: false
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeTypeParameter`', () => {
    const expected = {
      type: 'JsdocTypeTypeParameter',
      name: {
        type: 'JsdocTypeName',
        value: 'T'
      },
      constraint: undefined,
      defaultValue: undefined
    }
    const parseResult = {
      type: 'JsdocTypeTypeParameter',
      name: {
        type: 'JsdocTypeName',
        value: 'T'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })

  it('Gets transform for `JsdocTypeTypeParameter` with `constraint` and `defaultValue`', () => {
    const expected = {
      type: 'JsdocTypeTypeParameter',
      name: {
        type: 'JsdocTypeName',
        value: 'T'
      },
      constraint: {
        type: 'JsdocTypeName',
        value: 'V'
      },
      defaultValue: {
        type: 'JsdocTypeName',
        value: 'string'
      }
    }
    const parseResult = {
      type: 'JsdocTypeTypeParameter',
      name: {
        type: 'JsdocTypeName',
        value: 'T'
      },
      constraint: {
        type: 'JsdocTypeName',
        value: 'V'
      },
      defaultValue: {
        type: 'JsdocTypeName',
        value: 'string'
      }
    }
    const xform = transform<NonRootResult>(identityTransformRules(), parseResult as NonRootResult)
    expect(xform).to.deep.equal(expected)
  })
})
