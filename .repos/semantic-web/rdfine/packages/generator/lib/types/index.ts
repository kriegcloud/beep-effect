import { GraphPointer } from 'clownface'
import { NamedNode, Term } from '@rdfjs/types'
import { Context } from '../index.js'

export { TypeMap } from './TypeMap.js'

export interface LiteralType {
  type: 'Literal'
  nativeName: string
  nativeType: typeof Number | typeof String | typeof Boolean | typeof Date
  datatype?: NamedNode
}

export interface ResourceType {
  type: 'Resource'
  localName: string
  qualifiedName: string
  module: string
  mixinName: string
  term: string
}

export interface ExternalResourceType {
  type: 'ExternalResource'
  localName: string
  module: string
  mixinName: string
  qualifiedName: string
  qualifier: string
  package: string
  qualifiedMixinName: string
  exportName: string
}

export interface EnumerationType {
  type: 'Enumeration'
  name: string
  module: string
  qualifiedName: string
}

export interface EnumerationMember {
  type: 'EnumerationMember'
  termName: string
  prefixedName: string
}

export interface TermType {
  type: 'Term'
  termType: Term['termType'] | 'Term'
}

export interface ConstantType {
  type: 'Constant'
  value: string
}

export type TypeMeta = LiteralType | ResourceType | ExternalResourceType | EnumerationType | EnumerationMember | TermType | ConstantType

export interface TypeMetaFactory<T extends TypeMeta = TypeMeta> {
  (term: GraphPointer<NamedNode>, context: Context): T | null
}

export type TypeMetaCollection = {
  get(key: GraphPointer): TypeMeta | undefined
  getOrThrow(key: GraphPointer): TypeMeta
  set(key: GraphPointer, value: TypeMeta): TypeMetaCollection
}
