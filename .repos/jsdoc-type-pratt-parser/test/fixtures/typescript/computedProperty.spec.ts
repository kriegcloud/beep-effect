import { testFixture } from '../Fixture.js'

describe('typescript computed property tests', () => {
  describe('simple computed property object', () => {
    testFixture({
      input: '{[someType]: string;}',
      stringified: '{[someType]: string}',
      expected: {
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
                type: 'JsdocTypeName',
                value: 'someType'
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
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('readonly computed property object', () => {
    testFixture({
      input: '{readonly [someType]: string;}',
      stringified: '{readonly [someType]: string}',
      expected: {
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
                type: 'JsdocTypeName',
                value: 'someType'
              },
            },
            optional: false,
            readonly: true,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('optional computed property object', () => {
    testFixture({
      input: '{[someType]?: string;}',
      stringified: '{[someType]?: string}',
      expected: {
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
                type: 'JsdocTypeName',
                value: 'someType'
              },
            },
            optional: true,
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
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('namespaced path computed property object', () => {
    testFixture({
      input: '{[SomeObject.someType()]: string;}',
      stringified: '{[SomeObject.someType()]: string}',
      espree: true,
      expected: {
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
      },
      modes: [
        'typescript'
      ]
    })
  })
})
