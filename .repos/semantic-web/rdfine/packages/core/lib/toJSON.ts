import type { BlankNode, DatasetCore, Literal, NamedNode, Term } from '@rdfjs/types'
import type { NamespaceBuilder } from '@rdfjs/namespace'
import type { GraphPointer } from 'clownface'
import type { RdfResource, ResourceIdentifier } from '../RdfResource.js'
import type { RdfineEnvironment } from '../environment.js'
import type { ResourceIndexer } from './ResourceFactory.js'
import { enumerateList, isList } from './rdf-list.js'
import { PropertyMeta } from './decorators/property/index.js'
import { mixins } from './mixins.js'

type PropertyValue = RdfResource | Term

type ContextEntry = string | {
  '@container': '@list'
  '@id': string
}

type Context<T extends RdfResource | unknown = RdfResource> = {
  id: '@id'
  type: '@type'
  [key: string]: ContextEntry
} & Omit<{
  [P in keyof Required<T>]?: string
}, keyof RdfResource | '__initialized'>

type LiteralObject<T> = T | {
  '@value': string
  '@type': string
} | {
  '@value': string
  '@language': string
}

type JsonifiedResource<T> = Omit<{
  [P in keyof Required<T>]?: T[P] extends (string | number | boolean)
    ? LiteralObject<T[P]>
    : T[P] extends Date
      ? LiteralObject<string>
      : T[P] extends (RdfResource | undefined)
        ? JsonifiedResource<T[P]>
        : T[P] extends (NamedNode | BlankNode)
          ? JsonifiedResource<RdfResource>
          : Extract<T[P], Array<any>> extends (infer U)[]
            ? U extends RdfResource
              ? JsonifiedResource<U>[]
              : U extends (NamedNode | BlankNode)
                ? JsonifiedResource<RdfResource>[]
                : LiteralObject<U>[]
            : unknown
}, keyof RdfResource | '__initialized' | '__initializeProperties'> & {
  '@context': Context<T>
  id: string
  type: string[]
}

export type Jsonified<T extends RdfResource<any> | unknown> = JsonifiedResource<T> & Record<string, JsonifiedResource<RdfResource> | LiteralObject<string>>

function objectCanBeJsonified(term: Term): term is ResourceIdentifier | Literal {
  switch (term.termType) {
    case 'NamedNode':
    case 'BlankNode':
    case 'Literal':
      return true
    default:
      return false
  }
}

function getObjectMap<D extends DatasetCore>(resource: RdfResource<D>) {
  const graph = resource.pointer._context[0].graph

  return [...resource.pointer.dataset.match(resource.id, null, null, graph)].reduce((map, quad) => {
    if (resource.env.ns.rdf.type.equals(quad.predicate)) {
      return map
    }

    const quads = map.get(quad.predicate) || []
    if (objectCanBeJsonified(quad.object)) {
      quads.push(resource.pointer.node(quad.object))
    }
    map.set(quad.predicate, quads)
    return map
  }, resource.env.termMap<Term, Array<GraphPointer<ResourceIdentifier | Literal>>>())
}

function alreadyMapped(parentContext: Record<string, unknown> | undefined, name: string, prop: NamedNode) {
  if (parentContext && name in parentContext) {
    return parentContext[name] === prop.value
  }

  return false
}

function literalToJSON(obj: Literal, env: RdfineEnvironment): LiteralObject<any> {
  if (env.ns.xsd.string.equals(obj.datatype)) {
    return obj.value
  }
  if (env.ns.xsd.integer.equals(obj.datatype)) {
    const int = Number.parseInt(obj.value)
    if (int.toString() === obj.value) {
      return int
    }
  }
  if (env.ns.xsd.double.equals(obj.datatype)) {
    const dbl = Number.parseFloat(obj.value)
    if (dbl.toString() === obj.value) {
      return dbl
    }
  }
  if (env.ns.xsd.boolean.equals(obj.datatype)) {
    if (obj.value === 'true') {
      return true
    }
    if (obj.value === 'false') {
      return false
    }
  }
  if (env.ns.rdf.langString.equals(obj.datatype)) {
    return {
      '@value': obj.value,
      '@language': obj.language,
    }
  }

  if (!obj.datatype) {
    return obj.value
  }

  return {
    '@value': obj.value,
    '@type': obj.datatype.value,
  }
}

interface ToJsonContext {
  parentContexts?: Record<string, unknown>
  visitedResources?: Set<Term>
}

function jsonifyQuads(resource: RdfResource, context: ToJsonContext) {
  return (json: Record<string, any>, [predicate, objects]: [Term, Array<GraphPointer<ResourceIdentifier | Literal>>]) => {
    const jsonifyObject: any = (pointer: GraphPointer) => {
      if (pointer.term.termType === 'Literal') {
        return literalToJSON(pointer.term, resource.env)
      }

      const list = pointer.list()
      if (list) {
        return [...list].map(jsonifyObject)
      }

      return toJSON(resource._create(resource.pointer.node(pointer.term)), context)
    }

    const mapped = objects.map(jsonifyObject)

    if (mapped.length === 1) {
      json[predicate.value] = mapped[0]
    } else {
      json[predicate.value] = mapped
    }

    return json
  }
}

interface JsonifyPropertiesAccumulator {
  json: Record<string, any>
  contextPopulated: boolean
}

interface JsonifyPropertiesContext {
  remainingObjects: Map<Term, GraphPointer[]>
  context: Partial<Context>
  resource: RdfResource
  namespace: NamespaceBuilder | undefined
}

function jsonifyProperties(params: ToJsonContext & JsonifyPropertiesContext) {
  const { parentContexts, visitedResources, remainingObjects, context, resource, namespace } = params

  return ({ json, contextPopulated = false }: JsonifyPropertiesAccumulator, [name, { options }]: [string, PropertyMeta]): JsonifyPropertiesAccumulator => {
    const path = options.path ? options.path : namespace ? namespace(name) : null

    if (!path || Array.isArray(path) || typeof path === 'function' || options.subjectFromAllGraphs) {
      return { json, contextPopulated }
    }

    let propertyAddedToContext = false
    const predicate = typeof path === 'string' ? params.resource.env.namedNode(path) : path
    const terms = remainingObjects.get(predicate)
    if (!terms) {
      return { json, contextPopulated }
    }

    const objectPointers = resource.pointer.out(predicate)

    if (!alreadyMapped(parentContexts, name, predicate)) {
      if (isList(objectPointers)) {
        context[name] = {
          '@container': '@list',
          '@id': predicate.value,
        }
      } else {
        context[name] = predicate.value
      }
      propertyAddedToContext = true
    }

    function fromTerm(pointer: GraphPointer): PropertyValue {
      switch (pointer.term.termType) {
        case 'BlankNode':
        case 'NamedNode':
          return options.fromTerm.call(resource, pointer) as PropertyValue
        default:
          return pointer.term
      }
    }

    const propertyObjects = objectPointers
      .map(obj => {
        if (obj.term.termType === 'Literal') {
          return obj.term
        }

        if (isList(obj)) {
          return enumerateList(resource, obj, fromTerm)
        }

        return fromTerm(obj)
      })

    const jsonValues = propertyObjects.map(function valueToJSON(obj): unknown {
      if (Array.isArray(obj)) {
        return obj.map(arrElement => valueToJSON(arrElement))
      }

      if ('termType' in obj) {
        switch (obj.termType) {
          case 'Literal':
            return literalToJSON(obj, resource.env)
          case 'BlankNode':
          case 'NamedNode':
            return toJSON(resource._create(resource.pointer.node(obj)), {
              parentContexts: { ...parentContexts, ...context },
              visitedResources,
            })
          default:
            return null
        }
      }

      return toJSON(obj as any, {
        parentContexts: { ...parentContexts, ...context },
        visitedResources,
      })
    })

    if (options.values.includes('array') && jsonValues.length !== 1) {
      json[name] = jsonValues
    } else if (options.values.includes('list') && Array.isArray(jsonValues[0])) {
      json[name] = jsonValues[0] || []
    } else if (jsonValues.length > 1) {
      json[name] = jsonValues
    } else {
      json[name] = options.values.includes('single') ? jsonValues[0] : jsonValues
    }
    remainingObjects.delete(predicate)

    return { json, contextPopulated: contextPopulated || propertyAddedToContext }
  }
}

export function toJSON(resource: RdfResource<any> & ResourceIndexer, { parentContexts, visitedResources = resource.env.termSet() }: ToJsonContext = {}) {
  const id = resource.id.termType === 'NamedNode' ? resource.id.value : `_:${resource.id.value}`
  const json: Record<string, any> = { id }
  const types = [...resource.types]
  if (types.length > 0) {
    json.type = types.map(type => type.id.value)
  }

  if (visitedResources.has(resource.id)) {
    return json
  }
  visitedResources.add(resource.id)

  const remainingObjects = getObjectMap(resource)
  let contextEmpty = true
  let context: Partial<Context>
  if (parentContexts) {
    context = {}
  } else {
    contextEmpty = false
    context = {
      id: '@id',
      type: '@type',
    }
  }

  let contextPopulated = false
  for (const { __properties: properties, __ns: namespace } of mixins(resource)) {
    ({ contextPopulated } = [...properties].reduce(
      jsonifyProperties({ parentContexts, visitedResources, resource, remainingObjects, context, namespace }),
      { json, contextPopulated }))
  }

  [...remainingObjects].reduce(
    jsonifyQuads(resource, { parentContexts: { ...parentContexts, ...context }, visitedResources }),
    json)

  if (!contextEmpty || contextPopulated) {
    json['@context'] = context
  }

  return json
}
