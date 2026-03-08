import { expect } from 'chai'

import { stringifyRules, stringify } from '../src/index.js'
import type { RootResult, ObjectResult, FunctionResult, GenericResult, ParenthesisResult } from '../src/result/RootResult.js'
import type { KeyValueResult } from '../src/result/NonRootResult.js'
import { generate } from '@es-joy/escodegen'

describe('`stringifyRules`', () => {
  it('should exist on index export', () => {
    expect(typeof stringifyRules).to.equal('function')
  })

  // Our FunctionParslet shouldn't produce, but testing here
  it('should transform a function without parentheses', () => {
    const expected = 'function'
    const rootResult: FunctionResult = {
      type: 'JsdocTypeFunction',
      parameters: [],
      arrow: false,
      constructor: false,
      parenthesis: false
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a non-arrow function type', () => {
    const expected = 'function(string, boolean) :boolean';
    const rootResult: FunctionResult = {
      type: 'JsdocTypeFunction',
      meta: {
        parameterSpacing: ' ',
        preReturnMarkerSpacing: ' ',
        postReturnMarkerSpacing: '',
        typeParameterSpacing: ''
      },
      parameters: [
        {
          type: 'JsdocTypeName',
          value: 'string'
        },
        {
          type: 'JsdocTypeName',
          value: 'boolean'
        }
      ],
      returnType: {
        type: 'JsdocTypeName',
        value: 'boolean'
      },
      arrow: false,
      constructor: false,
      parenthesis: true
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should transform a function with type parameters and no default spacing', () => {
    const expected = '<T, U extends V=string, W=string> (x: T) => U';
    const rootResult: FunctionResult = {
      type: 'JsdocTypeFunction',
      meta: {
        postReturnMarkerSpacing: ' ',
        parameterSpacing: ' ',
        preReturnMarkerSpacing: ' ',
        typeParameterSpacing: ' ',
        postGenericSpacing: ' '
      },
      typeParameters: [
        {
          type: 'JsdocTypeTypeParameter',
          name: {
            type: 'JsdocTypeName',
            value: 'T'
          }
        },
        {
          type: 'JsdocTypeTypeParameter',
          name: {
            type: 'JsdocTypeName',
            value: 'U'
          },
          constraint: {
            type: 'JsdocTypeName',
            value: 'V'
          },
          meta: {
            defaultValueSpacing: ''
          },
          defaultValue: {
            type: 'JsdocTypeName',
            value: 'string'
          }
        },
        {
          type: 'JsdocTypeTypeParameter',
          name: {
            type: 'JsdocTypeName',
            value: 'W'
          },
          meta: {
            defaultValueSpacing: ''
          },
          defaultValue: {
            type: 'JsdocTypeName',
            value: 'string'
          }
        }
      ],
      parameters: [
        {
          type: 'JsdocTypeKeyValue',
          key: 'x',
          optional: false,
          variadic: false,
          right: {
            type: 'JsdocTypeName',
            value: 'T'
          }
        }
      ],
      returnType: {
        type: 'JsdocTypeName',
        value: 'U'
      },
      arrow: true,
      constructor: false,
      parenthesis: true
    };

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should transform a function with type parameters (no meta)', () => {
    const expected = '<T, U extends V=string, W=string>(x: T) => U';
    const rootResult: FunctionResult = {
      type: 'JsdocTypeFunction',
      typeParameters: [
        {
          type: 'JsdocTypeTypeParameter',
          name: {
            type: 'JsdocTypeName',
            value: 'T'
          }
        },
        {
          type: 'JsdocTypeTypeParameter',
          name: {
            type: 'JsdocTypeName',
            value: 'U'
          },
          constraint: {
            type: 'JsdocTypeName',
            value: 'V'
          },
          meta: {
            defaultValueSpacing: ''
          },
          defaultValue: {
            type: 'JsdocTypeName',
            value: 'string'
          }
        },
        {
          type: 'JsdocTypeTypeParameter',
          name: {
            type: 'JsdocTypeName',
            value: 'W'
          },
          meta: {
            defaultValueSpacing: ''
          },
          defaultValue: {
            type: 'JsdocTypeName',
            value: 'string'
          }
        }
      ],
      parameters: [
        {
          type: 'JsdocTypeKeyValue',
          key: 'x',
          optional: false,
          variadic: false,
          right: {
            type: 'JsdocTypeName',
            value: 'T'
          }
        }
      ],
      returnType: {
        type: 'JsdocTypeName',
        value: 'U'
      },
      arrow: true,
      constructor: false,
      parenthesis: true
    };

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should transform a function with no spacing around parameters and return type marker', () => {
    const expected = '(x: string,y: number)=>U';
    const rootResult: FunctionResult = {
      type: 'JsdocTypeFunction',
      parameters: [
        {
          type: 'JsdocTypeKeyValue',
          key: 'x',
          optional: false,
          variadic: false,
          right: {
            type: 'JsdocTypeName',
            value: 'string'
          }
        },
        {
          type: 'JsdocTypeKeyValue',
          key: 'y',
          optional: false,
          variadic: false,
          right: {
            type: 'JsdocTypeName',
            value: 'number'
          }
        }
      ],
      meta: {
        typeParameterSpacing: '',
        parameterSpacing: '',
        preReturnMarkerSpacing: '',
        postReturnMarkerSpacing: ''
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'U'
      },
      arrow: true,
      constructor: false,
      parenthesis: true
    };

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should transform a call signature with spacing', () => {
    const expected = '{<T,U> (a: T, b: U) :SomeType}';
    const rootResult: RootResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma'
      },
      elements: [
        {
          type: 'JsdocTypeCallSignature',
          typeParameters: [
            {
              type: 'JsdocTypeTypeParameter',
              name: {
                type: 'JsdocTypeName',
                value: 'T'
              }
            },
            {
              type: 'JsdocTypeTypeParameter',
              name: {
                type: 'JsdocTypeName',
                value: 'U'
              }
            }
          ],
          meta: {
            parameterSpacing: ' ',
            postGenericSpacing: ' ',
            typeParameterSpacing: '',
            preReturnMarkerSpacing: ' ',
            postReturnMarkerSpacing: ''
          },
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'a',
              right: {
                type: 'JsdocTypeName',
                value: 'T'
              },
              optional: false,
              variadic: false
            },
            {
              type: 'JsdocTypeKeyValue',
              key: 'b',
              right: {
                type: 'JsdocTypeName',
                value: 'U'
              },
              optional: false,
              variadic: false
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'SomeType'
          }
        }
      ]
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should transform a constructor signature with spacing', () => {
    const expected = '{new<T,U> (a: T, b: U) :SomeType}';
    const rootResult: RootResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma'
      },
      elements: [
        {
          type: 'JsdocTypeConstructorSignature',
          typeParameters: [
            {
              type: 'JsdocTypeTypeParameter',
              name: {
                type: 'JsdocTypeName',
                value: 'T'
              }
            },
            {
              type: 'JsdocTypeTypeParameter',
              name: {
                type: 'JsdocTypeName',
                value: 'U'
              }
            }
          ],
          meta: {
            postNewSpacing: '',
            postGenericSpacing: ' ',
            parameterSpacing: ' ',
            typeParameterSpacing: '',
            preReturnMarkerSpacing: ' ',
            postReturnMarkerSpacing: ''
          },
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'a',
              right: {
                type: 'JsdocTypeName',
                value: 'T'
              },
              optional: false,
              variadic: false
            },
            {
              type: 'JsdocTypeKeyValue',
              key: 'b',
              right: {
                type: 'JsdocTypeName',
                value: 'U'
              },
              optional: false,
              variadic: false
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'SomeType'
          }
        }
      ]
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should transform a method signature with spacing', () => {
    const expected = '{aMethod <T,U> (a: T, b: U) :SomeType}';
    const rootResult: RootResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma'
      },
      elements: [
        {
          type: 'JsdocTypeMethodSignature',
          name: 'aMethod',
          typeParameters: [
            {
              type: 'JsdocTypeTypeParameter',
              name: {
                type: 'JsdocTypeName',
                value: 'T'
              }
            },
            {
              type: 'JsdocTypeTypeParameter',
              name: {
                type: 'JsdocTypeName',
                value: 'U'
              }
            }
          ],
          meta: {
            quote: undefined,
            parameterSpacing: ' ',
            postMethodNameSpacing: ' ',
            postGenericSpacing: ' ',
            typeParameterSpacing: '',
            preReturnMarkerSpacing: ' ',
            postReturnMarkerSpacing: ''
          },
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'a',
              right: {
                type: 'JsdocTypeName',
                value: 'T'
              },
              optional: false,
              variadic: false
            },
            {
              type: 'JsdocTypeKeyValue',
              key: 'b',
              right: {
                type: 'JsdocTypeName',
                value: 'U'
              },
              optional: false,
              variadic: false
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'SomeType'
          }
        }
      ]
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should stringify tuple elements without spacing', () => {
    const expected = '[it,needs,to,be]'
    const rootResult: RootResult = {
      type: 'JsdocTypeTuple',
      meta: {
        elementSpacing: ''
      },
      elements: [
        {
          type: 'JsdocTypeName',
          value: 'it'
        },
        {
          type: 'JsdocTypeName',
          value: 'needs'
        },
        {
          type: 'JsdocTypeName',
          value: 'to'
        },
        {
          type: 'JsdocTypeName',
          value: 'be'
        }
      ]
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should stringify tuple keys with spacing', () => {
    const expected = '[a ? : string, b :number, ... extra]'
    const rootResult: RootResult = {
      type: 'JsdocTypeTuple',
      elements: [
        {
          type: 'JsdocTypeKeyValue',
          key: 'a',
          optional: true,
          variadic: false,
          meta: {
            postKeySpacing: ' ',
            postColonSpacing: ' ',
            postOptionalSpacing: ' ',
            postVariadicSpacing: ' '
          },
          right: {
            type: 'JsdocTypeName',
            value: 'string'
          }
        },
        {
          type: 'JsdocTypeKeyValue',
          key: 'b',
          optional: false,
          variadic: false,
          meta: {
            postKeySpacing: ' ',
            postColonSpacing: '',
            postOptionalSpacing: ' ',
            postVariadicSpacing: ' '
          },
          right: {
            type: 'JsdocTypeName',
            value: 'number'
          }
        },
        {
          type: 'JsdocTypeKeyValue',
          key: 'extra',
          optional: false,
          variadic: true,
          meta: {
            postKeySpacing: ' ',
            postColonSpacing: '',
            postOptionalSpacing: ' ',
            postVariadicSpacing: ' '
          },
          right: undefined
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should stringify an object field', () => {
    const expected = '{a ? :string}'
    const rootResult: RootResult = {
      type: 'JsdocTypeObject',
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'a',
          optional: true,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'string'
          },
          meta: {
            quote: undefined,
            postColonSpacing: '',
            postKeySpacing: ' ',
            postOptionalSpacing: ' '
          }
        }
      ],
      meta: {
        separator: 'comma'
      }
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  });

  it('should stringify `right` undefined `JsdocTypeKeyValue`', () => {
    const expected = 'a'
    const nonRootResult: KeyValueResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: undefined,
      optional: false,
      variadic: false
    }
    const result = stringify(nonRootResult as unknown as RootResult)
    expect(result).to.equal(expected)
  })

  // Note: Seems the union should not be possible here, at least with our
  //   grammars, as element will be wrapped in parentheses
  it('should transform a generic with a union element', () => {
    const expected = '(a | b)[]'
    const rootResult: GenericResult = {
      type: 'JsdocTypeGeneric',
      left: {
        type: 'JsdocTypeName',
        value: 'Array'
      },
      elements: [
        {
          type: 'JsdocTypeUnion',
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'a'
            },
            {
              type: 'JsdocTypeName',
              value: 'b'
            }
          ]
        }
      ],
      meta: {
        brackets: 'square',
        dot: false
      }
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a generic with a union element with no spacing', () => {
    const expected = '(a|b)[]'
    const rootResult: GenericResult = {
      type: 'JsdocTypeGeneric',
      left: {
        type: 'JsdocTypeName',
        value: 'Array'
      },
      elements: [
        {
          type: 'JsdocTypeUnion',
          meta: {
            spacing: ''
          },
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'a'
            },
            {
              type: 'JsdocTypeName',
              value: 'b'
            }
          ]
        }
      ],
      meta: {
        brackets: 'square',
        dot: false
      }
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a generic with a union element with explicit spacing', () => {
    const expected = '(a  |  b)[]'
    const rootResult: GenericResult = {
      type: 'JsdocTypeGeneric',
      left: {
        type: 'JsdocTypeName',
        value: 'Array'
      },
      elements: [
        {
          type: 'JsdocTypeUnion',
          meta: {
            spacing: '  '
          },
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'a'
            },
            {
              type: 'JsdocTypeName',
              value: 'b'
            }
          ]
        }
      ],
      meta: {
        brackets: 'square',
        dot: false
      }
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform an angled generic', () => {
    const expected = 'T<string,number>'
    const rootResult: GenericResult = {
      type: 'JsdocTypeGeneric',
      left: {
        type: 'JsdocTypeName',
        value: 'T'
      },
      elements: [
        {
          type: 'JsdocTypeName',
          value: 'string'
        },
        {
          type: 'JsdocTypeName',
          value: 'number'
        }
      ],
      meta: {
        brackets: 'angle',
        dot: false,
        elementSpacing: ''
      }
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  // Note: This should not occur as the `element` should not be undefined per
  //    `ParenthesisResult`
  it('should transform a set of parentheses', () => {
    const expected = '()'
    const rootResult: unknown = {
      type: 'JsdocTypeParenthesis',
      element: undefined
    }
    const result = stringify(rootResult as ParenthesisResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with linebreaks', () => {
    const expected = `{
  range: boolean
}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'linebreak',
        propertyIndent: '  ',
        separatorForSingleObjectField: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with dropped comma and linebreak', () => {
    const expected = `{range: boolean}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma-and-linebreak',
        propertyIndent: '  ',
        separatorForSingleObjectField: false
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with dropped comma and linebreak (no trailingPunctuation)', () => {
    const expected = `{range: boolean}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma-and-linebreak',
        propertyIndent: '  ',
        trailingPunctuation: false
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with comma and linebreak', () => {
    const expected = `{
  range: boolean,
}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma-and-linebreak',
        propertyIndent: '  ',
        separatorForSingleObjectField: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform multiple object fields with comma and linebreak (trailing)', () => {
    const expected = `{
  range: boolean,
  loc: boolean,
}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma-and-linebreak',
        propertyIndent: '  ',
        trailingPunctuation: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        },
        {
          type: 'JsdocTypeObjectField',
          key: 'loc',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform multiple object fields with semicolon and linebreak (trailing)', () => {
    const expected = `{
  range: boolean;
  loc: boolean;
}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'semicolon-and-linebreak',
        propertyIndent: '  ',
        trailingPunctuation: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        },
        {
          type: 'JsdocTypeObjectField',
          key: 'loc',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform multiple object fields with linebreak (trailing)', () => {
    const expected = `{
  range: boolean
  loc: boolean
}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'linebreak',
        propertyIndent: '  ',
        trailingPunctuation: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        },
        {
          type: 'JsdocTypeObjectField',
          key: 'loc',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform multiple object fields with comma and linebreak (non-trailing)', () => {
    const expected = `{
  range: boolean,
  loc: boolean
}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma-and-linebreak',
        propertyIndent: '  ',
        trailingPunctuation: false
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        },
        {
          type: 'JsdocTypeObjectField',
          key: 'loc',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with comma and linebreak and trailing punctuation', () => {
    const expected = `{range: boolean,}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma-and-linebreak',
        propertyIndent: '  ',
        trailingPunctuation: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with comma', () => {
    const expected = `{range: boolean,}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma',
        propertyIndent: '  ',
        separatorForSingleObjectField: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with comma (trailingPunctuation)', () => {
    const expected = `{range: boolean,}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma',
        propertyIndent: '  ',
        trailingPunctuation: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with semicolon', () => {
    const expected = `{range: boolean;}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'semicolon',
        propertyIndent: '  ',
        separatorForSingleObjectField: true
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform a single object field with bracketSpacing', () => {
    const expected = `{ range: boolean }`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'linebreak',
        bracketSpacing: ' '
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should transform multiple object fields with bracketSpacing', () => {
    const expected = `{ range: boolean, loc: number }`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma',
        bracketSpacing: ' '
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        },
        {
          type: 'JsdocTypeObjectField',
          key: 'loc',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should ignore bracketSpacing with line breaks', () => {
    const expected = `{
  range: boolean,
  loc: number
}`
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma-and-linebreak',
        propertyIndent: '  ',
        bracketSpacing: ' '
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'range',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          meta: {
            quote: undefined
          }
        },
        {
          type: 'JsdocTypeObjectField',
          key: 'loc',
          optional: false,
          readonly: false,
          right: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          meta: {
            quote: undefined
          }
        }
      ]
    }
    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should throw with arrow with no `returnType`', () => {
    expect(() => {
      const rootResult: FunctionResult = {
        type: 'JsdocTypeFunction',
        parameters: [],
        arrow: true,
        constructor: false,
        parenthesis: false
      }
      stringify(rootResult)
    }).to.throw('')
  })

  it('should stringify a `JsdocTypeComputedMethod`', () => {
    const expected = '{[someType](a: string,b: number) :AnotherType}'
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'semicolon'
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: {
            type: 'JsdocTypeComputedMethod',
            optional: false,
            parameters: [
              {
                key: 'a',
                optional: false,
                right: {
                  type: 'JsdocTypeName',
                  value: 'string'
                },
                type: 'JsdocTypeKeyValue',
                variadic: false
              },
              {
                key: 'b',
                optional: false,
                right: {
                  type: 'JsdocTypeName',
                  value: 'number'
                },
                type: 'JsdocTypeKeyValue',
                variadic: false
              }
            ],
            meta: {
              parameterSpacing: '',
              typeParameterSpacing: '',
              postGenericSpacing: '',
              preReturnMarkerSpacing: ' ',
              postReturnMarkerSpacing: ''
            },
            value: {
              type: 'JsdocTypeName',
              value: 'someType'
            },
            returnType: {
              type: 'JsdocTypeName',
              value: 'AnotherType'
            }
          },
          optional: false,
          readonly: false,
          right: undefined,
          meta: {
            quote: undefined
          }
        }
      ]
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should stringify a `JsdocTypeComputedMethod` with type parameters', () => {
    const expected = '{[someType]<T=string, U> (a: T, b: U): AnotherType}'
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'semicolon'
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: {
            type: 'JsdocTypeComputedMethod',
            optional: false,
            typeParameters: [
              {
                type: 'JsdocTypeTypeParameter',
                name: {
                  type: 'JsdocTypeName',
                  value: 'T'
                },
                meta: {
                  defaultValueSpacing: ''
                },
                defaultValue: {
                  type: 'JsdocTypeName',
                  value: 'string'
                }
              },
              {
                type: 'JsdocTypeTypeParameter',
                name: {
                  type: 'JsdocTypeName',
                  value: 'U'
                }
              }
            ],
            parameters: [
              {
                key: 'a',
                optional: false,
                right: {
                  type: 'JsdocTypeName',
                  value: 'T'
                },
                type: 'JsdocTypeKeyValue',
                variadic: false
              },
              {
                key: 'b',
                optional: false,
                right: {
                  type: 'JsdocTypeName',
                  value: 'U'
                },
                type: 'JsdocTypeKeyValue',
                variadic: false
              }
            ],
            meta: {
              parameterSpacing: ' ',
              typeParameterSpacing: ' ',
              postGenericSpacing: ' ',
            },
            value: {
              type: 'JsdocTypeName',
              value: 'someType'
            },
            returnType: {
              type: 'JsdocTypeName',
              value: 'AnotherType'
            }
          },
          optional: false,
          readonly: false,
          right: undefined,
          meta: {
            quote: undefined
          }
        }
      ]
    }

    const result = stringify(rootResult)
    expect(result).to.equal(expected)
  })

  it('should stringify a `JsdocTypeComputedMethod`', () => {
    const expected = '{[SomeObject.someType()](a: string,b: number) :AnotherType}'
    const rootResult: ObjectResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'semicolon'
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: {
            type: 'JsdocTypeComputedMethod',
            optional: false,
            parameters: [
              {
                key: 'a',
                optional: false,
                right: {
                  type: 'JsdocTypeName',
                  value: 'string'
                },
                type: 'JsdocTypeKeyValue',
                variadic: false
              },
              {
                key: 'b',
                optional: false,
                right: {
                  type: 'JsdocTypeName',
                  value: 'number'
                },
                type: 'JsdocTypeKeyValue',
                variadic: false
              }
            ],
            meta: {
              parameterSpacing: '',
              typeParameterSpacing: '',
              postGenericSpacing: '',
              preReturnMarkerSpacing: ' ',
              postReturnMarkerSpacing: ''
            },
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
                        // @ts-expect-error Not the same `Identifier`
                        end: 10,
                        name: 'SomeObject',
                        start: 0,
                        type: 'Identifier'
                      },
                      property: {
                        // @ts-expect-error Not the same `Identifier`
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
              value: 'AnotherType'
            }
          },
          optional: false,
          readonly: false,
          right: undefined,
          meta: {
            quote: undefined
          }
        }
      ]
    }

    const result = stringify(rootResult, generate)
    expect(result).to.equal(expected)
  })

  it('should throw with `JsdocTypeComputedMethod` of non-JSDocType and no custom stringifier', () => {
    expect(() => {
      const rootResult: RootResult = {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: false,
              parameters: [],
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
                          // @ts-expect-error Not the same `Identifier`
                          end: 10,
                          name: 'SomeObject',
                          start: 0,
                          type: 'Identifier'
                        },
                        property: {
                          // @ts-expect-error Not the same `Identifier`
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
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      }

      stringify(rootResult)
    }).to.throw('')
  })

  it('should throw with `JsdocTypeComputedProperty` of non-JSDocType and no custom stringifier', () => {
    expect(() => {
      const rootResult: RootResult = {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
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
                          // @ts-expect-error Not the same `Identifier`
                          end: 10,
                          name: 'SomeObject',
                          start: 0,
                          type: 'Identifier'
                        },
                        property: {
                          // @ts-expect-error Not the same `Identifier`
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
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }

      stringify(rootResult)
    }).to.throw('')
  })
})
