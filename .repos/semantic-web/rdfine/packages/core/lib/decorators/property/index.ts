import type { Term } from '@rdfjs/types'
import type { RdfResourceCore } from '../../../RdfResource.js'
import { EdgeTraversalFactory, PropRef } from '../../path.js'
import literalPropertyDecorator, { LiteralValues } from '../property/literal.js'
import resourcePropertyDecorator from '../property/resource.js'
import * as compare from '../../compare.js'
import { Initializer } from '../../../RdfResource.js'
import { fromInitializer } from '../../resource.js'
import { propertyDecorator, ObjectOrFactory, PropertyReturnKind, ArrayOrSingle } from './decoratorFactory.js'

export type { PropertyMeta } from './decoratorFactory.js'

export interface AccessorOptions {
  values?: PropertyReturnKind | PropertyReturnKind[]
  path?: ArrayOrSingle<PropRef | EdgeTraversalFactory>
  strict?: true
  subjectFromAllGraphs?: true
  filter?: (pointer: Term) => boolean
}

interface TermOptions <TSelf>{
  initial?: ObjectOrFactory<TSelf, Term, Term>
}

function isInitializer(obj: any): obj is Initializer<RdfResourceCore> {
  return typeof obj === 'object' && obj instanceof Object && 'id' in obj
}

export function property<R extends RdfResourceCore<any>>(options: AccessorOptions & TermOptions<R> = {}) {
  return propertyDecorator<R, Term, LiteralValues, Term>({
    ...options,
    fromTerm: (obj) => obj.term,
    toTerm(this: R, value) {
      if (isInitializer(value)) {
        return fromInitializer(this, value).id
      }

      return this.env.rdfine().convert.toLiteral(value) || this.env.literal(value.toString())
    },
    valueTypeName: 'RDF/JS term object',
    assertSetValue: () => true,
    compare: compare.terms,
  })
}

property.literal = literalPropertyDecorator

property.resource = resourcePropertyDecorator
