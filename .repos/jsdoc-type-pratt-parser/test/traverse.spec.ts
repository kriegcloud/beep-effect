import { expect, use } from 'chai'
import { type SinonSpy, spy } from 'sinon'
import sinonChai from 'sinon-chai'
import type {
  GenericResult,
  NameResult,
  RootResult,
  StringValueResult,
  UnionResult,
  FunctionResult,
  ObjectFieldResult,
  TupleResult, KeyValueResult
} from '../src/index.js'
import { traverse } from '../src/traverse.js'

use(sinonChai)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing
function expectOrder (calls: Array<[SinonSpy, any[]]>): void {
  const callsCount: Map<SinonSpy, number> = new Map<SinonSpy, number>()
  for (let i = 0; i < calls.length; i++) {
    const [cb, args] = calls[i]
    const count = (callsCount.has(cb) ? callsCount.get(cb) : 0) as number
    const call = cb.getCall(count)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Testing
    expect(call, `call ${i} called with correct arguments`).to.have.been.calledWithExactly(...args)
    if (i > 0) {
      const cbBefore = calls[i - 1][0]
      const callBefore = cbBefore.getCall(cbBefore === cb ? count - 1 : (callsCount.get(cbBefore) as number - 1))
      expect(callBefore, `call ${i} called in correct order`).to.have.been.calledBefore(call as unknown as SinonSpy)
    }
    callsCount.set(cb, count + 1)
  }
}

describe('traverse', () => {
  it('should traverse a simple expression', () => {
    const onEnter = spy()
    const onLeave = spy()

    const result: RootResult = {
      type: 'JsdocTypeName',
      value: 'test'
    }

    traverse(result, onEnter, onLeave)

    expect(onEnter.getCall(0).calledWith(result, undefined, undefined)).to.be.equal(true)
    expect(onLeave.getCall(0).calledWith(result, undefined, undefined)).to.be.equal(true)
    expect(onEnter.getCall(0).calledBefore(onLeave.getCall(0))).to.be.equal(true)
  })

  it('should traverse a simple expression without an expected key', () => {
    const onEnter = spy()
    const onLeave = spy()

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Force missing key
    const result: RootResult = {
      type: 'JsdocTypeTypeof'
    } as RootResult

    traverse(result, onEnter, onLeave)

    expect(onEnter.getCall(0).calledWith(result, undefined, undefined)).to.be.equal(true)
    expect(onLeave.getCall(0).calledWith(result, undefined, undefined)).to.be.equal(true)
    expect(onEnter.getCall(0).calledBefore(onLeave.getCall(0))).to.be.equal(true)
  })

  it('should traverse an expression while ignoring a primitive value as key', () => {
    const onEnter = spy()
    const onLeave = spy()

    const result: RootResult = {
      type: 'JsdocTypeObject',
      meta: {
        separator: 'semicolon'
      },
      elements: [
        {
          type: 'JsdocTypeObjectField',
          key: 'object',
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
    };
    traverse(result, onEnter, onLeave)

    expect(onEnter.getCall(0).calledWith(result, undefined, undefined)).to.be.equal(true)
    expect(onEnter.getCall(1).calledWith(
      result.elements[0],
      result,
      'elements'
    )).to.be.equal(true)
    expect(onEnter.getCall(2).calledWith(
      (result.elements[0] as ObjectFieldResult).right,
      result.elements[0],
      'right'
    )).to.be.equal(true)
    expect(onEnter.getCall(3)).to.equal(null);
    expect(onLeave.getCall(0).calledWith(
      (result.elements[0] as ObjectFieldResult).right,
      result.elements[0],
      'right'
    )).to.be.equal(true)
    expect(onEnter.getCall(0).calledBefore(onLeave.getCall(0))).to.be.equal(true)
  });

  it('should traverse a simple expression without `onEnter`', () => {
    const onLeave = spy()

    const result: RootResult = {
      type: 'JsdocTypeName',
      value: 'test'
    }

    traverse(result, undefined, onLeave)

    expect(onLeave.getCall(0).calledWith(result, undefined, undefined)).to.be.equal(true)
  })

  it('should traverse a simple expression without `onLeave`', () => {
    const onEnter = spy()

    const result: RootResult = {
      type: 'JsdocTypeName',
      value: 'test'
    }

    traverse(result, onEnter)

    expect(onEnter.getCall(0).calledWith(result, undefined, undefined)).to.be.equal(true)
  })

  it('should traverse a nested expression with union and generic', () => {
    const onEnter = spy()
    const onLeave = spy()

    const name: NameResult = {
      type: 'JsdocTypeName',
      value: 'genericName'
    }

    const typeA: NameResult = {
      type: 'JsdocTypeName',
      value: 'TypeA'
    }

    const typeB: NameResult = {
      type: 'JsdocTypeName',
      value: 'TypeB'
    }

    const generic: GenericResult = {
      type: 'JsdocTypeGeneric',
      left: name,
      elements: [
        typeA,
        typeB
      ],
      meta: {
        brackets: 'angle',
        dot: false
      }
    }

    const stringVal: StringValueResult = {
      type: 'JsdocTypeStringValue',
      value: 'some value',
      meta: {
        quote: 'single'
      }
    }

    const union: UnionResult = {
      type: 'JsdocTypeUnion',
      elements: [
        generic,
        stringVal
      ]
    }

    traverse(union, onEnter, onLeave)

    expectOrder([
      [onEnter, [union, undefined, undefined, undefined]],
      [onEnter, [generic, union, 'elements', 0]],
      [onEnter, [name, generic, 'left', undefined]],
      [onLeave, [name, generic, 'left', undefined]],
      [onEnter, [typeA, generic, 'elements', 0]],
      [onLeave, [typeA, generic, 'elements', 0]],
      [onEnter, [typeB, generic, 'elements', 1]],
      [onLeave, [typeB, generic, 'elements', 1]],
      [onLeave, [generic, union, 'elements', 0]],
      [onEnter, [stringVal, union, 'elements', 1]],
      [onLeave, [stringVal, union, 'elements', 1]],
      [onLeave, [union, undefined, undefined, undefined]]
    ])
  })

  it('should traverse a nested expression with function and tuple', () => {
    const onEnter = spy()
    const onLeave = spy()

    const nameA: NameResult = {
      type: 'JsdocTypeName',
      value: 'number'
    }

    const nameB: NameResult = {
      type: 'JsdocTypeName',
      value: 'string'
    }

    const keyValueA: KeyValueResult = {
      type: 'JsdocTypeKeyValue',
      key: 'a',
      right: nameA,
      optional: false,
      variadic: false
    }

    const keyValueB: KeyValueResult = {
      type: 'JsdocTypeKeyValue',
      key: 'b',
      right: nameB,
      optional: false,
      variadic: false
    }

    const tuple: TupleResult = {
      type: 'JsdocTypeTuple',
      elements: [
        keyValueA,
        keyValueB
      ]
    }

    const parameter: NameResult = {
      type: 'JsdocTypeName',
      value: 'parameter'
    }

    const functionResult: FunctionResult = {
      type: 'JsdocTypeFunction',
      arrow: true,
      parenthesis: true,
      constructor: false,
      parameters: [
        parameter
      ],
      returnType: tuple
    }

    traverse(functionResult, onEnter, onLeave)

    expectOrder([
      [onEnter, [functionResult, undefined, undefined, undefined]],
      [onEnter, [parameter, functionResult, 'parameters', 0]],
      [onLeave, [parameter, functionResult, 'parameters', 0]],
      [onEnter, [tuple, functionResult, 'returnType', undefined]],
      [onEnter, [keyValueA, tuple, 'elements', 0]],
      [onEnter, [nameA, keyValueA, 'right', undefined]],
      [onLeave, [nameA, keyValueA, 'right', undefined]],
      [onLeave, [keyValueA, tuple, 'elements', 0]],
      [onEnter, [keyValueB, tuple, 'elements', 1]],
      [onEnter, [nameB, keyValueB, 'right', undefined]],
      [onLeave, [nameB, keyValueB, 'right', undefined]],
      [onLeave, [keyValueB, tuple, 'elements', 1]],
      [onLeave, [tuple, functionResult, 'returnType', undefined]],
      [onLeave, [functionResult, undefined, undefined, undefined]]
    ])
  })
})
