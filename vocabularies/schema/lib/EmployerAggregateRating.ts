import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AggregateRatingMixin } from './AggregateRating.js';

export interface EmployerAggregateRating<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AggregateRating<D>, rdfine.RdfResource<D> {
}

export function EmployerAggregateRatingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EmployerAggregateRating & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EmployerAggregateRatingClass extends AggregateRatingMixin(Resource) {
  }
  return EmployerAggregateRatingClass as any
}
EmployerAggregateRatingMixin.appliesTo = schema.EmployerAggregateRating
EmployerAggregateRatingMixin.createFactory = (env: RdfineEnvironment) => createFactory<EmployerAggregateRating>([AggregateRatingMixin, EmployerAggregateRatingMixin], { types: [schema.EmployerAggregateRating] }, env)
