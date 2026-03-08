/* eslint-disable camelcase,no-dupe-class-members,no-use-before-define */
import type { NamespaceBuilder } from '@rdfjs/namespace'
import type { NamedNode, DatasetCore, BlankNode, Quad_Graph, Term, Literal } from '@rdfjs/types'
import type { MultiPointer, GraphPointer, AnyPointer } from 'clownface'
import once from 'onetime'
import type {
  Constructor,
  Mixin,
  ResourceCreationOptions,
  ResourceIndexer,
} from './lib/ResourceFactory.js'
import type { TypeCollection } from './lib/TypeCollection.js'
import TypeCollectionCtor from './lib/TypeCollection.js'
import { toJSON } from './lib/toJSON.js'
import type { Jsonified } from './lib/toJSON.js'
import { fromInitializer } from './lib/resource.js'
import { mixins } from './lib/mixins.js'
import { RdfineEnvironment } from './environment.js'

export type ResourceIdentifier = BlankNode | NamedNode
export type ResourceNode<D extends DatasetCore = DatasetCore> = GraphPointer<ResourceIdentifier, D>

export interface GetOptions {
  strict: boolean
}

export interface RdfResourceCore<D extends DatasetCore = DatasetCore> {
  readonly env: RdfineEnvironment
  readonly id: ResourceIdentifier
  readonly types: TypeCollection<D>
  readonly pointer: GraphPointer<ResourceIdentifier, D>
  readonly unionGraphPointer: MultiPointer<ResourceIdentifier, D>
  readonly _graphId: Quad_Graph
  readonly _parent?: RdfResource<D>
  readonly isAnonymous: boolean
  equals(other: RdfResource | ResourceIdentifier | GraphPointer | undefined | null): boolean
  hasType (type: string | NamedNode): boolean
  /**
   * Gets the value of a property
   * @param property
   */
  get<T extends RdfResource<D> = RdfResource<D>> (property: string | NamedNode): T
  get<T extends RdfResource<D> = RdfResource<D>> (property: string | NamedNode, options?: GetOptions): T | null
  /**
   * Gets the value of a property and ensures that an array will be returned
   * @param property
   */
  getArray<T extends RdfResource<D> = RdfResource<D>> (property: string | NamedNode, options?: GetOptions): T[]
  /**
   * Gets the property value if it's boolean. Throws if it's not
   * @param property
   */
  getBoolean (property: string | NamedNode, options?: GetOptions): boolean
  /**
   * Gets the property value if it's a string. Throws if it's not
   * @param property
   */
  getString (property: string | NamedNode): string
  getString (property: string | NamedNode, options?: GetOptions): string | null
  /**
   * Gets the property value if it's a number. Throws if it's not
   * @param property
   */
  getNumber (property: string | NamedNode): number | null
  getNumber (property: string | NamedNode, options?: GetOptions): number | null

  /**
   * Returns JSON-LD-like object which represents the runtime interface of this resource
   */
  toJSON<T extends RdfResourceCore = this> (): Jsonified<RdfResource & T>
  _getObjects(property: string | NamedNode, options?: GetOptions): MultiPointer<Term, D>
  _create<T extends RdfResourceCore<D>>(term: GraphPointer<Term, D>, mixins?: Mixin[] | [Constructor, ...Mixin[]], options?: ResourceCreationOptions<D, T>): T & ResourceIndexer
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RdfResource<D extends DatasetCore = DatasetCore> extends RdfResourceCore<D> {
}

export default class RdfResourceImpl<D extends DatasetCore = DatasetCore> implements RdfResourceCore<D> {
  public readonly pointer: GraphPointer<ResourceIdentifier, D>
  public readonly unionGraphPointer: MultiPointer<ResourceIdentifier, D>
  public readonly __initialized: boolean = false
  public readonly _parent?: RdfResource<D>
  private readonly __initializeProperties: (() => boolean)
  public static __ns?: NamespaceBuilder
  public readonly env: RdfineEnvironment
  public static __mixins: Mixin[] = []
  public static __properties = new Map()
  public static __initializers = new Map()

  private static _userInitializeProperties(resource: RdfResourceImpl, init: Initializer<RdfResource> = {}): void {
    Object.entries(init)
      .filter(([prop]) => prop !== 'id' && prop !== 'types')
      .forEach(([prop, value]) => {
        if (!prop.startsWith('http')) {
          // use decorated setter property
          if (typeof value === 'function') {
            (resource as any)[prop] = value(resource.pointer.any())
          } else {
            (resource as any)[prop] = value
          }
          return
        }

        const values = Array.isArray(value) ? value : [value]
        const pointers = values.map(function toPointer(value): GraphPointer {
          if (typeof value === 'function') {
            const result = value(resource.pointer.any())
            if (typeof result === 'function') {
              throw new Error('Initializer factory function cannot return a function')
            }
            if (Array.isArray(result)) {
              throw new Error('Initializer factory function cannot return an array')
            }
            return toPointer(result)
          }

          if (typeof value === 'object' && 'term' in value) {
            return value.term
          }

          if (typeof value === 'object' && 'pointer' in value) {
            return value.pointer
          }

          if (typeof value === 'object' && 'termType' in value) {
            return resource.pointer.node(value)
          }

          let literal: Literal | undefined
          if (typeof value === 'object' && 'value' in value && 'datatype' in value) {
            literal = resource.env.rdfine().convert.toLiteral(value.value, value.datatype)
          } else {
            literal = resource.env.rdfine().convert.toLiteral(value)
          }

          if (literal) {
            return resource.pointer.node(literal)
          }

          // create and initialize an object resource
          const childResource = fromInitializer(resource, value)
          return childResource.pointer
        })

        resource.pointer.addOut(resource.pointer.namedNode(prop), pointers)
      })

    for (const type of init.types || []) {
      resource.types.add(type)
    }
  }

  public constructor(pointer: ResourceNode<D>, parentOrEnv: RdfResource<D> | RdfineEnvironment, init: Initializer<any> = {}) {
    if (pointer.term.termType !== 'BlankNode' && pointer.term.termType !== 'NamedNode') {
      throw new Error(`RdfResource cannot be initialized from a ${(pointer.term as any).termType} node`)
    }

    let parent: RdfResource<D> | undefined
    if ('id' in parentOrEnv) {
      parent = parentOrEnv
      this.env = parent.env
    } else {
      this.env = parentOrEnv
    }

    /* TODO: when clownface gets graph feature
    if (pointer._context[0].graph) {
      this.pointer = pointer
      this.unionGraphPointer = pointer.fromGraph(null)
    } else {
      this.pointer = pointer.fromGraph(pointer.defaultGraph)
      this.unionGraphPointer = pointer
    } */

    const selfGraph = this.env.clownface({
      ...pointer,
      term: pointer.term,
    })

    if (selfGraph._context[0].graph) {
      this.pointer = selfGraph
      this.unionGraphPointer = this.env.clownface({ dataset: selfGraph.dataset, term: selfGraph.term, graph: undefined })
    } else {
      this.pointer = this.env.clownface({ dataset: selfGraph.dataset, term: selfGraph.term, graph: this.env.defaultGraph() })
      this.unionGraphPointer = this.env.clownface({ dataset: selfGraph.dataset, term: selfGraph.term })
    }

    this.__initializeProperties = once(() => {
      const self = this as any
      const defaults = [...mixins(self)].flatMap((mixinProto) => [...mixinProto.__initializers])

      defaults.forEach(([key, value]) => {
        const currentValue = self[key]
        const valueIsEmptyArray = Array.isArray(currentValue) && currentValue.length === 0
        const valueIsUndefined = typeof currentValue === 'undefined'

        if (!(valueIsEmptyArray || valueIsUndefined)) {
          return
        }

        if (typeof value === 'function') {
          self[key] = value(self)
          return
        }

        self[key] = value
      })

      return true
    })

    this._parent = parent
    this.__initialized = this.__initializeProperties()
    RdfResourceImpl._userInitializeProperties(this, init)
  }

  public get id(): ResourceIdentifier {
    return this.pointer.term
  }

  public get _graphId(): Quad_Graph {
    return this.pointer._context[0].graph!
  }

  public get types(): TypeCollection<D> {
    return new TypeCollectionCtor(this)
  }

  public get isAnonymous() {
    return this.id.termType === 'BlankNode'
  }

  public hasType(type: string | NamedNode): boolean {
    return this.types.has(type)
  }

  public equals(other: RdfResource<any> | ResourceIdentifier | GraphPointer | undefined | null): boolean {
    if (!other) {
      return false
    }
    if ('termType' in other) {
      return this.id.equals(other)
    }

    const otherPointer = '_context' in other ? other : other.pointer
    const idsEqual = this.id.equals(otherPointer.term)

    if (this.isAnonymous || otherPointer.term.termType === 'BlankNode') {
      return idsEqual && this.pointer.dataset === otherPointer.dataset
    }

    return idsEqual
  }

  public get<T extends RdfResource<D> = RdfResource<D>>(property: string | NamedNode, options?: GetOptions): T | RdfResource<D> | null {
    const objects = this.getArray<T>(property, options)

    if (objects.length > 0) {
      return objects[0]
    }

    return null
  }

  public getArray<T extends RdfResource<D> = RdfResource<D>>(property: string | NamedNode, options?: GetOptions): T[] {
    const values = this._getObjects(property, options)
      .filter(obj => obj.term.termType === 'NamedNode' || obj.term.termType === 'BlankNode')
      .map(obj => {
        return this._create<T>(obj, [], { parent: this })
      })

    if (!values.length) {
      return []
    }

    return values
  }

  public getNumber(property: string | NamedNode): number
  public getNumber(property: string | NamedNode, options?: GetOptions): number | null {
    const [value] = this._getObjects(property, options).toArray()

    if (typeof value === 'undefined') {
      return null
    }

    if (value.term.termType === 'Literal') {
      return parseFloat(value.value)
    }

    throw new Error(`Expected property '${property}' to be a number but found '${value}'`)
  }

  public getString(property: string | NamedNode): string
  public getString(property: string | NamedNode, options?: GetOptions): string | null {
    const [value] = this._getObjects(property, options).toArray()

    if (typeof value === 'undefined') {
      return null
    }

    if (value.term.termType === 'Literal') {
      return value.value
    }

    throw new Error(`Expected property '${property}' to be a literal but found '${value}'`)
  }

  public getBoolean(property: string | NamedNode, options?: GetOptions): boolean {
    const [value] = this._getObjects(property, options).toArray()

    if (typeof value === 'undefined') {
      return false
    }

    if (value.term.termType === 'Literal' && this.env.ns.xsd.boolean.equals(value.term.datatype)) {
      return value.term.equals(this.pointer.literal(true).term)
    }

    throw new Error(`Expected property '${property}' to be a boolean but found '${value}'`)
  }

  public _getObjects(property: string | Term, { strict }: GetOptions = { strict: false }): MultiPointer<Term, D> {
    const propertyNode = typeof property === 'string' ? this.pointer.namedNode(property) : property
    const objects = this.pointer.out(propertyNode)

    if (!objects.terms.length && strict) {
      throw new Error(`Value for predicate <${property}> was missing`)
    }

    return objects
  }

  public _create<T extends RdfResourceCore<D>>(term: GraphPointer<Term, D>, mixins?: Mixin[] | [Constructor, ...Mixin[]], options: ResourceCreationOptions<D, T> = {}): T & ResourceIndexer {
    return this.env.rdfine().factory.createEntity<T>(term, mixins, options)
  }

  public toJSON<T extends RdfResourceCore<any> = this>(): Jsonified<T> {
    return toJSON(this as any) as any
  }
}

type UserDefinedInterface<T extends RdfResourceCore | undefined> = Omit<T, keyof RdfResource>

type BaseInitializer = Record<string, any> & {
  types?: NamedNode[] | TypeCollection<any>
  id?: RdfResource['id'] | string
}

type InitialNode<Node extends Term = NamedNode | BlankNode> = Node | GraphPointer<Node> | ((graph: AnyPointer) => Node | GraphPointer<Node>)
type InitialLiteral = InitialNode<Literal>

interface Factory<T extends RdfResourceCore | undefined> {
  (graph: AnyPointer): T
}

type InitializeSingle<T extends RdfResourceCore | undefined> = Initializer<UserDefinedInterface<T> & BaseInitializer>
| InitialNode
| Factory<T>
type InitializeArray<T extends RdfResourceCore> = Array<InitializeSingle<T>>

export type Initializer<T> = Omit<{
  [P in keyof Required<T>]?: T[P] extends string
    ? T[P] | InitialLiteral
    : T[P] extends (RdfResourceCore | undefined)
      ? InitializeSingle<T[P]>
      : T[P] extends (Literal | undefined)
        ? InitialLiteral | string | number | boolean
        : T[P] extends Term
          ? T[P] | InitialNode<T[P]>
          : Extract<T[P], Array<any>> extends (infer U)[]
            ? U extends RdfResourceCore
              ? InitializeArray<U> | InitializeSingle<U>
              : U extends Term
                ? T[P] | (InitialNode<Term> | InitializeSingle<RdfResourceCore>)[]
                : T[P] | InitialLiteral | InitialLiteral[]
            : unknown
}, keyof RdfResource> & BaseInitializer

// eslint-disable-next-line @typescript-eslint/ban-types
type PartialRecursive<T> = T extends object ? { [K in keyof T]?: PartialRecursive<T[K]> } : T

export function fromObject<T extends RdfResource>(initializer: Initializer<UserDefinedInterface<T> & BaseInitializer>): T {
  return initializer as unknown as T
}
