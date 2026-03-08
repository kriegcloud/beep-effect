import { GraphPointer } from 'clownface'
import { NamedNode } from '@rdfjs/types'
import { TypeMeta, TypeMetaCollection } from '../../lib/types/index.js'

export class FakeTypeCollection implements TypeMetaCollection {
  private readonly __map: Map<string, any>

  constructor(types: [NamedNode, Partial<TypeMeta>][] = []) {
    this.__map = new Map<string, any>(types.map(([key, value]) => ([key.value, value])))
  }

  get(key: GraphPointer): (TypeMeta | undefined) {
    return this.__map.get(key.value)
  }

  getOrThrow(key: GraphPointer): TypeMeta {
    const found = this.get(key)
    if (found) return found

    throw new Error('Not found')
  }

  set(key: GraphPointer, value: TypeMeta): TypeMetaCollection {
    return this
  }
}
