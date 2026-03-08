/* eslint-disable no-use-before-define */
import type { DatasetCore, Literal, NamedNode, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import type { NamespaceBuilder } from '@rdfjs/namespace'
import type { Initializer, RdfResource, RdfResourceCore, ResourceNode } from '../RdfResource.js'
import { RdfineEnvironment } from '../environment.js'
import { createProxy } from './proxy.js'
import type { PropertyMeta } from './decorators/property/index.js'

export type AnyFunction<A = any> = (...input: any[]) => A
export interface Constructor<A extends RdfResourceCore<any> = RdfResourceCore> {
  new (...input: any[]): A
  __mixins: Mixin[]
  __properties: Map<string, PropertyMeta>
  __initializers: Map<string, unknown>
  __ns?: NamespaceBuilder
}
export type ExtendingConstructor<TExtended, TExtension> = Constructor<RdfResourceCore & Partial<Omit<TExtended, keyof TExtension>>>
type EvaluatedMixin = {
  shouldApply: boolean | ((entity: RdfResource) => boolean)
}
type SingleTypeMixin = {
  appliesTo: NamedNode
}

type MaybeArray<T> = T | T[]

export interface ResourceIndexer<T extends RdfResource = RdfResource> {
  [ prop: string ]: null | undefined | MaybeArray<T | Literal | T & ResourceIndexer<T>>
}

export type Mixin<T extends AnyFunction = any> = InstanceType<ReturnType<T>>

export interface ResourceFactory<D extends DatasetCore = DatasetCore, R extends RdfResource<D> = RdfResource<D>, T extends AnyFunction = any> {
  addMixin(...mixins: (EvaluatedMixin | SingleTypeMixin)[]): void
  createEntity<S>(
    term: GraphPointer<Term, D>,
    typeAndMixins?: Mixin<T>[] | [Constructor, ...Mixin<T>[]], // TODO: move mixins into options object
    options?: ResourceCreationOptions<D, R & S>): R & S & ResourceIndexer<R>
}

export interface ResourceCreationOptions<D extends DatasetCore, R extends RdfResourceCore> {
  parent?: RdfResourceCore<D>
  initializer?: Initializer<R>
}

export default class <D extends DatasetCore = DatasetCore, R extends RdfResource<D> = RdfResource<D>, T extends AnyFunction = any> implements ResourceFactory<D, R, T> {
  private __mixins: Set<Mixin<T> & EvaluatedMixin> = new Set()
  private __alwaysMixins: Set<Mixin<T>> = new Set()
  private __typeMixins: Map<string, (Mixin<T> & SingleTypeMixin)[]> = new Map()
  private __typeCache: Map<string, Constructor> = new Map<string, Constructor>()
  public BaseClass: Constructor

  public constructor(private __env: RdfineEnvironment) {
    this.BaseClass = __env.rdfine.Resource
  }

  public addMixin(...mixins: (EvaluatedMixin | SingleTypeMixin)[]): void {
    this.__typeCache.clear()

    mixins.forEach(mixin => {
      if ('appliesTo' in mixin) {
        const current = this.__typeMixins.get(mixin.appliesTo.value) || []
        this.__typeMixins.set(mixin.appliesTo.value, [...current, mixin as any])
      } else {
        if (mixin.shouldApply === true) {
          this.__alwaysMixins.add(mixin as any)
        }

        this.__mixins.add(mixin as any)
      }
    })
  }

  public createEntity<S>(pointer: ResourceNode<D>, typeAndMixins: Mixin<T>[] | [Constructor, ...Mixin<T>[]] = [], options: ResourceCreationOptions<D, R & S> = {}): R & S & ResourceIndexer<R> {
    let BaseClass = this.BaseClass
    let explicitMixins: Mixin[] = typeAndMixins
    if (typeAndMixins.length > 0) {
      const [BaseClassOrMixin, ...rest] = typeAndMixins
      if (this.__isConstructor(BaseClassOrMixin)) {
        BaseClass = BaseClassOrMixin
        explicitMixins = rest
      }
    }

    const types = pointer.out(this.__env.ns.rdf.type).values
    for (const type of options.initializer?.types || []) {
      if ('termType' in type) {
        types.push(type.value)
      } else {
        types.push(type.id.value)
      }
    }

    BaseClass = this.__getBaseClass(BaseClass, types)
    const entity = new BaseClass(pointer, this.__env)

    const mixins = [...this.__mixins].reduce<Set<Mixin<T>>>((selected, next) => {
      if (next.shouldApply === true || (typeof next.shouldApply === 'function' && next.shouldApply(entity))) {
        selected.add(next)
      }

      return selected
    }, new Set(explicitMixins))

    const Type = this.__extend(BaseClass, [...mixins])

    return createProxy(new Type(pointer, options.parent || this.__env, options.initializer)) as R & S & ResourceIndexer<R>
  }

  private __getBaseClass(baseClass: Constructor, types: string[]) {
    const cacheKey = [baseClass.name, ...types].toString()
    const cached = this.__typeCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const rdfTypeMixins = types.reduce<Set<Mixin<T>>>((mixins, type) => {
      const typeMixins = this.__typeMixins.get(type)
      if (typeMixins) {
        typeMixins.forEach(m => mixins.add(m))
      }

      return mixins
    }, new Set())

    const type = this.__extend(baseClass, [...this.__alwaysMixins, ...rdfTypeMixins])
    this.__typeCache.set(cacheKey, type)

    return type
  }

  private __extend(baseClass: Constructor & { __mixins?: Mixin<T>[] }, mixins: Mixin<T>[]): Constructor & { __mixins: Mixin<T>[] } {
    const type = mixins.reduce<Constructor>((Mixed: Constructor, Next: Mixin<T>) => Next(Mixed), baseClass)

    const baseMixins = baseClass.__mixins || []
    type.__mixins = [...baseMixins, ...mixins]

    return type
  }

  private __isConstructor(value: Constructor | Mixin): value is Constructor {
    return '__mixins' in value
  }
}
