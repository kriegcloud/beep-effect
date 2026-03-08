import { Literal, NamedNode } from '@rdfjs/types'
import { AnyPointer, GraphPointer } from 'clownface'
import { Context } from '../index.js'
import { TypeMeta, TypeMetaCollection, TypeMetaFactory } from './index.js'

interface TypeMapInit {
  excluded: NamedNode[]
  factories: TypeMetaFactory[]
  context: Context
}

function isNamedNode(ptr: GraphPointer): ptr is GraphPointer<NamedNode> {
  return ptr.term.termType === 'NamedNode'
}

export class TypeMap implements TypeMetaCollection {
  private readonly __excluded: string[]
  private readonly __map = new Map<string, TypeMeta>()
  private readonly __context: Context
  private readonly __factories: TypeMetaFactory[]

  private get __graph(): AnyPointer {
    return this.__context.vocabulary
  }

  constructor({ excluded = [], factories = [], context }: TypeMapInit) {
    this.__excluded = excluded.map(term => term.value)
    this.__factories = factories
    this.__context = context
  }

  get(key: GraphPointer<NamedNode | Literal>, noFallback = false): TypeMeta | undefined {
    if (this.__excluded.includes(key.value)) {
      return undefined
    }

    if (!isNamedNode(key)) {
      return {
        type: 'Constant',
        value: key.value,
      }
    }

    if (!this.__map.has(key.value)) {
      const created = this.__create(key, noFallback)
      if (created) {
        this.__map.set(key.value, created)
      }
    }

    return this.__map.get(key.value)
  }

  set(key: GraphPointer, value: TypeMeta): this {
    if (this.__map.has(key.value)) {
      throw new Error(`Type ${key} has already been added`)
    }

    this.__map.set(key.value, value)
    return this
  }

  getOrThrow(key: GraphPointer<NamedNode>) {
    const type = this.get(key, true)
    if (type) {
      return type
    }

    throw new Error(`Type ${key.value} not found`)
  }

  private __create(term: GraphPointer<NamedNode>, noFallback: boolean): TypeMeta | null {
    for (const create of this.__factories) {
      const found = create(term, this.__context)
      if (found) return found
    }

    if (noFallback) {
      return null
    }

    this.__context.log.warn('Type not found for term %s. Falling back to RDF/JS term', term.value)
    return {
      type: 'Term',
      termType: 'Term',
    }
  }
}
