import { expect } from 'chai'
import { parse } from '../src/parse.js'

describe('`parse` with `loc`', () => {
  it('adds `loc`', () => {
    const result = parse('function(typeof A): void', 'typescript', {
      loc: true
    })
    expect(result).to.deep.equal({
      type: 'JsdocTypeFunction',
      parameters: [
        {
          type: 'JsdocTypeTypeof',
          loc: {
            end: {
              column: 17,
              line: 1
            },
            start: {
              column: 9,
              line: 1
            }
          },
          element: {
            loc: {
              end: {
                column: 17,
                line: 1
              },
              start: {
                column: 15,
                line: 1
              }
            },
            type: 'JsdocTypeName',
            value: 'A'
          }
        }
      ],
      loc: {
        end: {
          column: 24,
          line: 1
        },
        start: {
          column: 0,
          line: 1
        }
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'void',
        loc: {
          end: {
            column: 24,
            line: 1
          },
          start: {
            column: 19,
            line: 1
          }
        },
      },
      arrow: false,
      constructor: false,
      parenthesis: true
    })
  })

  it('adds `loc` after newlines and spaces', () => {
    const result = parse('\n \n function(typeof A): void', 'typescript', {
      loc: true
    })
    expect(result).to.deep.equal({
      type: 'JsdocTypeFunction',
      parameters: [
        {
          type: 'JsdocTypeTypeof',
          loc: {
            end: {
              column: 18,
              line: 3
            },
            start: {
              column: 10,
              line: 3
            }
          },
          element: {
            loc: {
              end: {
                column: 18,
                line: 3
              },
              start: {
                column: 16,
                line: 3
              }
            },
            type: 'JsdocTypeName',
            value: 'A'
          }
        }
      ],
      loc: {
        end: {
          column: 25,
          line: 3
        },
        start: {
          column: 0,
          line: 1
        }
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'void',
        loc: {
          end: {
            column: 25,
            line: 3
          },
          start: {
            column: 20,
            line: 3
          }
        },
      },
      arrow: false,
      constructor: false,
      parenthesis: true
    })
  })

  it('adds `loc` after newlines and spaces and with multiline type', () => {
    const result = parse('\n \n function(\n  typeof A\n): void', 'typescript', {
      loc: true
    })
    expect(result).to.deep.equal({
      type: 'JsdocTypeFunction',
      parameters: [
        {
          type: 'JsdocTypeTypeof',
          loc: {
            end: {
              column: 10,
              line: 4
            },
            start: {
              column: 10,
              line: 3
            }
          },
          element: {
            loc: {
              end: {
                column: 10,
                line: 4
              },
              start: {
                column: 8,
                line: 4
              }
            },
            type: 'JsdocTypeName',
            value: 'A'
          }
        }
      ],
      loc: {
        end: {
          column: 7,
          line: 5
        },
        start: {
          column: 0,
          line: 1
        }
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'void',
        loc: {
          end: {
            column: 7,
            line: 5
          },
          start: {
            column: 2,
            line: 5
          }
        },
      },
      arrow: false,
      constructor: false,
      parenthesis: true
    })
  })

  it('adds `loc` with `locStart`', () => {
    const result = parse('function(typeof A): void', 'typescript', {
      loc: true,
      locStart: {
        column: 0,
        line: 2
      }
    })
    expect(result).to.deep.equal({
      type: 'JsdocTypeFunction',
      parameters: [
        {
          type: 'JsdocTypeTypeof',
          loc: {
            end: {
              column: 17,
              line: 2
            },
            start: {
              column: 9,
              line: 2
            }
          },
          element: {
            loc: {
              end: {
                column: 17,
                line: 2
              },
              start: {
                column: 15,
                line: 2
              }
            },
            type: 'JsdocTypeName',
            value: 'A'
          }
        }
      ],
      loc: {
        end: {
          column: 24,
          line: 2
        },
        start: {
          column: 0,
          line: 2
        }
      },
      returnType: {
        type: 'JsdocTypeName',
        value: 'void',
        loc: {
          end: {
            column: 24,
            line: 2
          },
          start: {
            column: 19,
            line: 2
          }
        },
      },
      arrow: false,
      constructor: false,
      parenthesis: true
    })
  })
});
