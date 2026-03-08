import type { DataFactory, DatasetCore, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import { Environment } from '@rdfjs/environment/Environment.js'
import type { RdfResourceCore, ResourceIdentifier } from '../RdfResource.js'
import { onlyUnique } from './filter.js'
import * as compare from './compare.js'

function getNode(value: RdfResourceCore | ResourceIdentifier | string, RDF: Environment<DataFactory>): ResourceIdentifier {
  if (typeof value === 'string') {
    return RDF.namedNode(value)
  }

  if ('termType' in value) {
    return value
  }

  return value.id
}

export interface TypeCollection<D extends DatasetCore> extends Set<RdfResourceCore<D>> {
  add(value: RdfResourceCore<D> | ResourceIdentifier | string): this
  delete(value: RdfResourceCore<D> | ResourceIdentifier | string): boolean
  has(value: RdfResourceCore<D> | ResourceIdentifier | string): boolean
}

export default class <D extends DatasetCore> implements Set<RdfResourceCore<D>> {
  private readonly __resource: RdfResourceCore<D>
  private readonly __allGraphs: boolean
  private __graph: GraphPointer<Term, D>

  add(value: RdfResourceCore<D> | ResourceIdentifier | string): this {
    this.__resource.pointer.addOut(this.__resource.env.ns.rdf.type, getNode(value, this.__resource.env))
    return this
  }

  clear(): void {
    this.__graph.deleteOut(this.__resource.env.ns.rdf.type)
  }

  delete(value: RdfResourceCore<D> | ResourceIdentifier | string): boolean {
    const deletedQuads = this.__graph.dataset.match(this.__resource.id, this.__resource.env.ns.rdf.type, getNode(value, this.__resource.env))

    for (const quad of deletedQuads) {
      this.__graph.dataset.delete(quad)
    }

    return deletedQuads.size > 0
  }

  forEach(callbackfn: (value: RdfResourceCore<D>, value2: RdfResourceCore<D>, set: Set<RdfResourceCore<D>>) => void, thisArg?: unknown): void {
    for (const value of this.values()) {
      callbackfn.call(thisArg, value, value, this)
    }
  }

  has(value: RdfResourceCore<D> | ResourceIdentifier | string): boolean {
    return this.__graph.has(this.__resource.env.ns.rdf.type, getNode(value, this.__resource.env)).terms.length > 0
  }

  get size(): number {
    return this.__graph.out(this.__resource.env.ns.rdf.type).terms.filter(onlyUnique(compare.terms)).length
  }

  [Symbol.iterator](): IterableIterator<RdfResourceCore<D>> {
    return this.values()
  }

  entries(): IterableIterator<[RdfResourceCore<D>, RdfResourceCore<D>]> {
    return this.__values.map<[RdfResourceCore<D>, RdfResourceCore<D>]>(res => [res, res])[Symbol.iterator]()
  }

  keys(): IterableIterator<RdfResourceCore<D>> {
    return this.values()
  }

  values(): IterableIterator<RdfResourceCore<D>> {
    return this.__values[Symbol.iterator]()
  }

  get [Symbol.toStringTag](): string {
    return this.__values.toString()
  }

  public constructor(resource: RdfResourceCore<D>, allGraphs = false) {
    this.__resource = resource
    this.__allGraphs = allGraphs
    // TODO: when clownface gets graph feature
    // this.__graph = allGraphs ? resource.pointer.fromUnionGraph() : resource.pointer
    this.__graph = allGraphs ? resource.env.clownface({ dataset: resource.pointer.dataset, term: resource.pointer.term, graph: undefined }) : resource.pointer
  }

  private get __values() {
    const graphId = !this.__allGraphs ? this.__resource._graphId : null
    // TODO: when clownface gets graph feature
    // const types: MultiPointer<Term, D> = this.__resource.pointer.from(graphId).out(rdf.type)

    const typeQuads = this.__graph.dataset.match(this.__resource.id, this.__resource.env.ns.rdf.type, null, graphId)

    const types = [...typeQuads]
      .map(quad => {
        return this.__resource.env.clownface({
          dataset: this.__graph.dataset,
          term: quad.object,
          graph: quad.graph,
        })
      })

    return types
      .map(type => this.__resource._create<RdfResourceCore<D>>(type))
      .filter(onlyUnique(compare.resources(false)))
  }
}
